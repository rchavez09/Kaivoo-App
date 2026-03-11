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
import { format, addDays, isBefore, parseISO, isValid, startOfDay } from 'date-fns';
import { getAISettings, getSoulConfig } from '@/lib/ai/settings';
import { providerSupportsTools } from '@/lib/ai/providers';
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

/**
 * Fallback: Extract tool calls written as text by models that don't use structured APIs.
 * Handles patterns like: <tool_call>{"name":"get_tasks","arguments":{...}}</tool_call>
 */
function extractTextToolCalls(text: string): { toolCalls: ToolCall[]; cleanedText: string } {
  const toolCalls: ToolCall[] = [];
  let cleanedText = text;

  // Match <tool_call>...</tool_call> tags (case-insensitive, multiline)
  const tagRegex = /<tool_call>\s*([\s\S]*?)\s*<\/tool_call>/gi;
  let match;
  while ((match = tagRegex.exec(text)) !== null) {
    try {
      const parsed = JSON.parse(match[1]);
      const name = parsed.name || parsed.function;
      const args = parsed.arguments || parsed.parameters || parsed.input || {};
      if (name && typeof name === 'string') {
        toolCalls.push({ id: `text-${crypto.randomUUID()}`, name, arguments: args });
      }
    } catch {
      // Skip unparseable tool calls
    }
    cleanedText = cleanedText.replace(match[0], '');
  }

  // Also handle [Calling tool_name ...] display patterns — strip but don't execute
  cleanedText = cleanedText.replace(/\[Calling \w+[^\]]*\]/g, '');

  return { toolCalls, cleanedText: cleanedText.trim() };
}

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
    const now = new Date();
    const today = format(now, 'yyyy-MM-dd');
    const todayStart = startOfDay(now);

    // Helper: resolve task dueDate to a Date for comparison
    const parseDueDate = (dueDate: string | undefined): Date | null => {
      if (!dueDate) return null;
      if (dueDate === 'Today') return todayStart;
      if (dueDate === 'Tomorrow') return addDays(todayStart, 1);
      if (/^\d{4}-\d{2}-\d{2}/.test(dueDate)) {
        const parsed = parseISO(dueDate);
        return isValid(parsed) ? startOfDay(parsed) : null;
      }
      return null;
    };

    // Tasks due today (ISO format OR 'Today' literal)
    const tasksDueToday = store.tasks
      .filter((t) => (t.dueDate === today || t.dueDate === 'Today') && t.status !== 'done')
      .map((t) => ({ title: t.title, priority: t.priority, status: t.status }));

    // Overdue tasks (due before today, not done)
    const overdueTasks = store.tasks
      .filter((t) => {
        if (t.status === 'done' || !t.dueDate || t.dueDate === 'Today') return false;
        const due = parseDueDate(t.dueDate);
        return due ? isBefore(due, todayStart) : false;
      })
      .map((t) => ({ title: t.title, priority: t.priority, dueDate: t.dueDate || '' }));

    // Upcoming tasks (next 7 days, excluding today, not done)
    const weekEnd = addDays(todayStart, 7);
    const upcomingTasks = store.tasks
      .filter((t) => {
        if (t.status === 'done' || !t.dueDate) return false;
        const due = parseDueDate(t.dueDate);
        if (!due) return false;
        return due > todayStart && isBefore(due, weekEnd);
      })
      .map((t) => ({ title: t.title, priority: t.priority, dueDate: t.dueDate || '' }));

    const todaysMeetings = store
      .getMeetingsForDate(now)
      .map((m) => ({ title: m.title, startTime: m.startTime.toISOString(), endTime: m.endTime.toISOString() }));

    const journalEntriesToday = store.getJournalEntriesForDate(today).length;

    const activeProjects = store.projects
      .filter((p) => p.status === 'active')
      .map((p) => ({ name: p.name, status: p.status, description: p.description?.slice(0, 80) }));

    const routinesTotal = store.routines.length + store.habits.length;
    const routinesCompletedToday =
      store.routines.filter((r) => store.isRoutineCompleted(r.id, today)).length +
      store.habits.filter((h) => store.isHabitCompleted(h.id, today)).length;

    // Recent captures (last 5)
    const recentCaptures = [...store.captures]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)
      .map((c) => ({ content: c.content.slice(0, 100), date: c.date }));

    return {
      tasksDueToday,
      upcomingTasks,
      overdueTasks,
      todaysMeetings,
      journalEntriesToday,
      activeProjects,
      routinesCompletedToday,
      routinesTotal,
      recentCaptures,
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
      const hasTools = providerSupportsTools(settings.provider);
      const systemPrompt = await assembleConciergeContext(appContext, hasTools);

      let titleSuggestion: string | undefined;
      const executorActions = buildExecutorActions();

      // Tool execution loop
      for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
        let fullContent = '';
        const toolCalls: ToolCall[] = [];

        const stream = streamChat(workingMessages, {
          systemPrompt,
          tools: hasTools ? ALL_TOOLS : undefined,
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

        // Fallback: if no structured tool calls arrived but text contains
        // tool_call tags (some models write them as text), try to extract them
        if (toolCalls.length === 0 && hasTools && fullContent.includes('<tool_call>')) {
          const extracted = extractTextToolCalls(fullContent);
          if (extracted.toolCalls.length > 0) {
            toolCalls.push(...extracted.toolCalls);
            fullContent = extracted.cleanedText;
            setStreamedContent(fullContent);
          }
        }

        if (toolCalls.length === 0) {
          // Strip leftover [Calling ...] display artifacts from text
          const cleaned = fullContent.replace(/\[Calling \w+[^\]]*\]/g, '').trim();
          const assistantMessage: ConversationMessage = {
            id: crypto.randomUUID(),
            role: 'assistant',
            content: cleaned || fullContent,
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

      // Clear streaming state BEFORE committing the final message to prevent
      // a brief flash where both the streaming bubble and the committed message render.
      setStreamedContent('');
      setToolStatus(null);
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
