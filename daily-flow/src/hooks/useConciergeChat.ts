/**
 * useConciergeChat — Sprint 34
 *
 * Shared hook for AI chat state, streaming, tool execution loop,
 * conversation persistence, and post-conversation processing.
 * Consumed by both ChatPage (full-page) and ConciergeChat (floating sheet).
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { getAISettings, getSoulConfig } from '@/lib/ai/settings';
import { streamChat, createConversation } from '@/lib/ai/chat-service';
import type { Conversation, ConversationMessage, ToolCall } from '@/lib/ai/types';
import { assembleConciergeContext } from '@/lib/ai/prompt-assembler';
import type { AppContext } from '@/lib/ai/prompt-assembler';
import { ALL_TOOLS, executeTool, resetToolCallCount } from '@/lib/ai/tools';
import type { ExecutorActions } from '@/lib/ai/tools';
import { extractMemories, preCompactionFlush, PRE_COMPACTION_THRESHOLD } from '@/lib/ai/extraction';
import { summarizeConversation } from '@/lib/ai/summarizer';
import { checkCoherence } from '@/lib/ai/coherence-monitor';
import { migrateConversationsFromLocalStorage } from '@/lib/ai/migrate-conversations';
import { useAdapters } from '@/lib/adapters';
import { useKaivooStore } from '@/stores/useKaivooStore';
import { useKaivooActions } from '@/hooks/useKaivooActions';
import { useAIActionLog } from '@/hooks/useAIActionLog';

const MAX_TOOL_ROUNDS = 5;

export interface UseConciergeChatOptions {
  /** Called after creating a new conversation (e.g. switch to chat view) */
  onNewConversation?: () => void;
  /** Called after selecting a conversation (e.g. switch to chat view) */
  onSelectConversation?: () => void;
  /** Called before navigating away (e.g. close sheet) */
  onBeforeNavigate?: () => void;
}

export function useConciergeChat(options: UseConciergeChatOptions = {}) {
  // Store callbacks in a ref so handleSend doesn't re-create when they change
  const callbacksRef = useRef(options);
  callbacksRef.current = options;

  // ─── Core chat state ───
  const [conversation, setConversation] = useState<Conversation>(createConversation);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [streamedContent, setStreamedContent] = useState('');
  const [toolStatus, setToolStatus] = useState<string | null>(null);

  // ─── Refs ───
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // ─── Hooks ───
  const navigate = useNavigate();
  const actions = useKaivooActions();
  const { logAction } = useAIActionLog();
  const { data: dataAdapter } = useAdapters();

  // ─── Load conversations on mount ───
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      await migrateConversationsFromLocalStorage(dataAdapter);
      const convos = await dataAdapter.conversations.fetchAll();
      if (!cancelled) setConversations(convos);
    })();
    return () => {
      cancelled = true;
    };
  }, [dataAdapter]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation.messages, streamedContent, toolStatus]);

  // Abort streaming on unmount
  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  // ─── Handlers ───

  const handleNewConversation = useCallback(() => {
    const newConv = createConversation();
    setConversation(newConv);
    setStreamedContent('');
    setToolStatus(null);
    callbacksRef.current.onNewConversation?.();
  }, []);

  const handleSelectConversation = useCallback((conv: Conversation) => {
    setConversation(conv);
    setStreamedContent('');
    setToolStatus(null);
    callbacksRef.current.onSelectConversation?.();
  }, []);

  const handleDeleteConversation = useCallback(
    (id: string) => {
      void (async () => {
        await dataAdapter.conversations.delete(id);
        const convos = await dataAdapter.conversations.fetchAll();
        setConversations(convos);
        if (conversation.id === id) {
          handleNewConversation();
        }
      })();
    },
    [conversation.id, handleNewConversation, dataAdapter],
  );

  const renameConversation = useCallback(
    async (id: string, title: string) => {
      await dataAdapter.conversations.update(id, { title });
      const convos = await dataAdapter.conversations.fetchAll();
      setConversations(convos);
      if (conversation.id === id) {
        setConversation((prev) => ({ ...prev, title }));
      }
    },
    [dataAdapter, conversation.id],
  );

  // ─── Build context ───

  const buildAppContext = useCallback((): AppContext => {
    const store = useKaivooStore.getState();
    const today = format(new Date(), 'yyyy-MM-dd');

    const tasksDueToday = store.tasks
      .filter((t) => t.dueDate === today)
      .map((t) => ({ title: t.title, priority: t.priority, status: t.status }));

    const todaysMeetings = store
      .getMeetingsForDate(new Date())
      .map((m) => ({ title: m.title, startTime: m.startTime.toISOString(), endTime: m.endTime.toISOString() }));

    const journalEntriesToday = store.getJournalEntriesForDate(today).length;

    const activeProjects = store.projects
      .filter((p) => p.status === 'active')
      .map((p) => ({ name: p.name, status: p.status }));

    const routinesTotal = store.routines.length + store.habits.length;
    const routinesCompletedToday =
      store.routines.filter((r) => store.isRoutineCompleted(r.id, today)).length +
      store.habits.filter((h) => store.isHabitCompleted(h.id, today)).length;

    return {
      tasksDueToday,
      todaysMeetings,
      journalEntriesToday,
      activeProjects,
      routinesCompletedToday,
      routinesTotal,
    };
  }, []);

  const buildExecutorActions = useCallback(
    (): ExecutorActions => ({
      addTask: actions.addTask,
      updateTask: actions.updateTask,
      addMeeting: actions.addMeeting,
      addJournalEntry: actions.addJournalEntry,
      addCapture: actions.addCapture,
      addTopicPage: actions.addTopicPage,
      toggleRoutineCompletion: actions.toggleRoutineCompletion,
      logAction,
    }),
    [actions, logAction],
  );

  // ─── Send message ───

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || streaming) return;

    const settings = getAISettings();
    if (!settings.apiKey && settings.provider !== 'ollama') {
      toast.error('No AI provider configured', {
        description: 'Go to Settings → AI Provider to set up your API key.',
      });
      return;
    }

    setInput('');

    const userMessage: ConversationMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };

    let workingMessages = [...conversation.messages, userMessage];
    const updatedConv: Conversation = {
      ...conversation,
      messages: workingMessages,
      updatedAt: new Date().toISOString(),
    };
    setConversation(updatedConv);

    setStreaming(true);
    setStreamedContent('');
    setToolStatus(null);
    resetToolCallCount();

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      // Pre-compaction memory flush
      const visibleMessageCount = workingMessages.filter((m) => m.role === 'user' || m.role === 'assistant').length;
      if (visibleMessageCount >= PRE_COMPACTION_THRESHOLD) {
        await preCompactionFlush(workingMessages);
      }

      const appContext = buildAppContext();
      const systemPrompt = await assembleConciergeContext(appContext);

      let titleSuggestion: string | undefined;
      const executorActions = buildExecutorActions();

      // Tool execution loop
      for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
        let fullContent = '';
        const toolCalls: ToolCall[] = [];

        const stream = streamChat(workingMessages, {
          systemPrompt,
          tools: ALL_TOOLS,
          onTitleSuggestion: (title) => {
            titleSuggestion = title;
          },
          signal: controller.signal,
        });

        for await (const event of stream) {
          if (event.type === 'text') {
            fullContent += event.text;
            setStreamedContent(fullContent);
          } else if (event.type === 'tool_call') {
            toolCalls.push(event.toolCall);
          }
        }

        if (toolCalls.length === 0) {
          const assistantMessage: ConversationMessage = {
            id: crypto.randomUUID(),
            role: 'assistant',
            content: fullContent,
            timestamp: new Date().toISOString(),
          };
          workingMessages = [...workingMessages, assistantMessage];
          break;
        }

        const assistantMessage: ConversationMessage = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: fullContent,
          timestamp: new Date().toISOString(),
          toolCalls,
        };
        workingMessages = [...workingMessages, assistantMessage];

        for (const tc of toolCalls) {
          setToolStatus(`Running: ${tc.name.replace(/_/g, ' ')}...`);
          const result = await executeTool(tc, executorActions, text);

          const toolMessage: ConversationMessage = {
            id: crypto.randomUUID(),
            role: 'tool',
            content: JSON.stringify({ success: result.success, data: result.data, message: result.message }),
            timestamp: new Date().toISOString(),
            toolCallId: tc.id,
          };
          workingMessages = [...workingMessages, toolMessage];
        }

        setToolStatus(null);
        setStreamedContent('');
      }

      const finalConv: Conversation = {
        ...updatedConv,
        title: titleSuggestion ?? updatedConv.title,
        messages: workingMessages,
        updatedAt: new Date().toISOString(),
      };

      setConversation(finalConv);

      // Persist
      const existingIds = conversations.map((c) => c.id);
      if (existingIds.includes(finalConv.id)) {
        await dataAdapter.conversations.update(finalConv.id, {
          title: finalConv.title,
          messages: JSON.stringify(finalConv.messages),
        });
      } else {
        await dataAdapter.conversations.create({
          id: finalConv.id,
          title: finalConv.title,
          messages: JSON.stringify(finalConv.messages),
        });
      }
      const convos = await dataAdapter.conversations.fetchAll();
      setConversations(convos);
      setStreamedContent('');
      setToolStatus(null);

      // Post-conversation processing (fire-and-forget)
      const lastAssistant = workingMessages.filter((m) => m.role === 'assistant').pop();
      if (lastAssistant) {
        const soul = getSoulConfig();
        const userMsgs = workingMessages.filter((m) => m.role === 'user');
        checkCoherence(lastAssistant.content, soul, finalConv.id, userMsgs, (signal) => {
          void dataAdapter.coherenceLog.create({
            conversationId: signal.conversationId,
            signal: signal.signal,
            severity: signal.severity,
            details: signal.details,
            responseSnippet: signal.responseSnippet,
          });
        });
      }

      const soul = getSoulConfig();
      void (async () => {
        const [newMemories] = await Promise.all([
          extractMemories(workingMessages),
          summarizeConversation(finalConv.id, workingMessages),
        ]);
        if (newMemories.length > 0) {
          const name = soul?.name || 'Concierge';
          toast.success(`${name} remembered ${newMemories.length} new thing${newMemories.length !== 1 ? 's' : ''}`, {
            description: newMemories.map((m) => m.content).join('; '),
            action: {
              label: 'View memories',
              onClick: () => {
                callbacksRef.current.onBeforeNavigate?.();
                navigate('/settings');
              },
            },
          });
        }
      })();
    } catch (e) {
      if (e instanceof DOMException && e.name === 'AbortError') return;
      const message = e instanceof Error ? e.message : 'Chat failed';
      toast.error('Chat error', { description: message });

      const failedConv: Conversation = {
        ...updatedConv,
        messages: workingMessages,
        updatedAt: new Date().toISOString(),
      };
      setConversation(failedConv);

      // Best-effort save — nested try/catch so adapter errors don't propagate
      try {
        const existingIds = conversations.map((c) => c.id);
        if (existingIds.includes(failedConv.id)) {
          await dataAdapter.conversations.update(failedConv.id, {
            title: failedConv.title,
            messages: JSON.stringify(failedConv.messages),
          });
        } else {
          await dataAdapter.conversations.create({
            id: failedConv.id,
            title: failedConv.title,
            messages: JSON.stringify(failedConv.messages),
          });
        }
        const errConvos = await dataAdapter.conversations.fetchAll();
        setConversations(errConvos);
      } catch {
        // Silently fail — already showing error toast
      }
    } finally {
      abortRef.current = null;
      setStreaming(false);
      setToolStatus(null);
    }
  }, [input, streaming, conversation, conversations, buildAppContext, buildExecutorActions, navigate, dataAdapter]);

  // ─── Computed ───

  const currentSettings = getAISettings();
  const soul = getSoulConfig();
  const conciergeName = soul?.name || 'Concierge';
  const isConfigured = currentSettings.apiKey.length > 0 || currentSettings.provider === 'ollama';
  const visibleMessages = conversation.messages.filter((m) => m.role !== 'tool');

  return {
    // State
    conversation,
    conversations,
    input,
    streaming,
    streamedContent,
    toolStatus,
    visibleMessages,
    conciergeName,
    isConfigured,
    currentSettings,

    // Refs
    messagesEndRef,
    textareaRef,

    // Setters
    setInput,

    // Handlers
    handleNewConversation,
    handleSelectConversation,
    handleDeleteConversation,
    handleSend,
    renameConversation,
  };
}
