/**
 * Concierge Chat — Sprint 23 P10, Sprint 24 P14
 *
 * Floating chat button + slide-out Sheet panel with LLM-backed
 * streaming chat. Persists conversations to localStorage.
 * Uses soul file for system prompt personality.
 *
 * Sprint 24: Added tool-use loop (tool_call → execute → follow-up),
 * 6-layer prompt assembly, and tool execution status UI.
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { Bot, Send, Plus, Trash2, ChevronLeft, Loader2, Settings, Wrench } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { getAISettings, getSoulConfig } from '@/lib/ai/settings';
import {
  streamChat,
  getConversations,
  saveConversation,
  deleteConversation,
  createConversation,
} from '@/lib/ai/chat-service';
import type { Conversation, ConversationMessage, ToolCall } from '@/lib/ai/types';
import { assembleSystemPrompt } from '@/lib/ai/prompt-assembler';
import type { AppContext } from '@/lib/ai/prompt-assembler';
import { ALL_TOOLS } from '@/lib/ai/tools';
import { executeTool, resetToolCallCount } from '@/lib/ai/tools';
import type { ExecutorActions } from '@/lib/ai/tools';
import { getMemories } from '@/lib/ai/memory-service';
import { extractMemories } from '@/lib/ai/extraction';
import { summarizeConversation } from '@/lib/ai/summarizer';
import { useKaivooStore } from '@/stores/useKaivooStore';
import { useKaivooActions } from '@/hooks/useKaivooActions';
import { useAIActionLog } from '@/hooks/useAIActionLog';

const MAX_TOOL_ROUNDS = 5;

const ConciergeChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState<'chat' | 'list'>('chat');
  const [conversation, setConversation] = useState<Conversation>(createConversation);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [streamedContent, setStreamedContent] = useState('');
  const [toolStatus, setToolStatus] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Hooks for tool execution
  const actions = useKaivooActions();
  const { logAction } = useAIActionLog();

  // Load conversations on mount
  useEffect(() => {
    setConversations(getConversations());
  }, []);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation.messages, streamedContent, toolStatus]);

  // Focus textarea when opening
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleNewConversation = useCallback(() => {
    const newConv = createConversation();
    setConversation(newConv);
    setView('chat');
    setStreamedContent('');
    setToolStatus(null);
  }, []);

  const handleSelectConversation = useCallback((conv: Conversation) => {
    setConversation(conv);
    setView('chat');
    setStreamedContent('');
    setToolStatus(null);
  }, []);

  const handleDeleteConversation = useCallback(
    (id: string) => {
      deleteConversation(id);
      setConversations(getConversations());
      if (conversation.id === id) {
        handleNewConversation();
      }
    },
    [conversation.id, handleNewConversation],
  );

  // Abort streaming on unmount
  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  // Build app context from current store state
  const buildAppContext = useCallback((): AppContext => {
    const store = useKaivooStore.getState();
    const today = format(new Date(), 'yyyy-MM-dd');

    const tasksDueToday = store.tasks
      .filter((t) => t.dueDate === today)
      .map((t) => ({ title: t.title, priority: t.priority, status: t.status }));

    const todaysMeetings = store.getMeetingsForDate(new Date())
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

  // Build executor actions from hooks
  const buildExecutorActions = useCallback((): ExecutorActions => ({
    addTask: actions.addTask,
    updateTask: actions.updateTask,
    addMeeting: actions.addMeeting,
    addJournalEntry: actions.addJournalEntry,
    addCapture: actions.addCapture,
    addTopicPage: actions.addTopicPage,
    toggleRoutineCompletion: actions.toggleRoutineCompletion,
    logAction,
  }), [actions, logAction]);

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
      // Build the enriched system prompt
      const soul = getSoulConfig();
      const memories = await getMemories();
      const activeMemories = memories.filter((m) => m.active);
      const appContext = buildAppContext();

      const systemPrompt = assembleSystemPrompt({
        soul,
        depth: settings.depth,
        memories: activeMemories,
        summaries: [], // TODO: P17 will populate this
        appContext,
        hasTools: true,
      });

      let titleSuggestion: string | undefined;
      const executorActions = buildExecutorActions();

      // Tool execution loop — LLM may request tools, we execute and re-send
      for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
        let fullContent = '';
        const toolCalls: ToolCall[] = [];

        const stream = streamChat(workingMessages, {
          systemPrompt,
          tools: ALL_TOOLS,
          onTitleSuggestion: (title) => { titleSuggestion = title; },
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

        // No tool calls — we're done, finalize assistant message
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

        // Tool calls received — execute them
        const assistantMessage: ConversationMessage = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: fullContent,
          timestamp: new Date().toISOString(),
          toolCalls,
        };
        workingMessages = [...workingMessages, assistantMessage];

        // Execute each tool call and add results as tool messages
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

        // Loop continues — re-invoke LLM with tool results
      }

      // Apply title suggestion
      if (titleSuggestion) {
        updatedConv.title = titleSuggestion;
      }

      const finalConv: Conversation = {
        ...updatedConv,
        messages: workingMessages,
        updatedAt: new Date().toISOString(),
      };

      setConversation(finalConv);
      saveConversation(finalConv);
      setConversations(getConversations());
      setStreamedContent('');
      setToolStatus(null);

      // Post-conversation: extract memories + summarize (fire-and-forget)
      void (async () => {
        const [newMemories] = await Promise.all([
          extractMemories(workingMessages),
          summarizeConversation(finalConv.id, workingMessages),
        ]);
        if (newMemories.length > 0) {
          const name = soul?.name || 'Concierge';
          toast.success(`${name} remembered ${newMemories.length} new thing${newMemories.length !== 1 ? 's' : ''}`, {
            description: newMemories.map((m) => m.content).join('; '),
          });
        }
      })();
    } catch (e) {
      if (e instanceof DOMException && e.name === 'AbortError') return;
      const message = e instanceof Error ? e.message : 'Chat failed';
      toast.error('Chat error', { description: message });

      // Save the conversation with messages even if streaming failed
      const failedConv: Conversation = {
        ...updatedConv,
        messages: workingMessages,
        updatedAt: new Date().toISOString(),
      };
      saveConversation(failedConv);
      setConversations(getConversations());
    } finally {
      abortRef.current = null;
      setStreaming(false);
      setToolStatus(null);
    }
  }, [input, streaming, conversation, buildAppContext, buildExecutorActions]);

  const soul = getSoulConfig();
  const currentSettings = getAISettings();
  const conciergeName = soul?.name || 'Concierge';
  const isConfigured = currentSettings.apiKey.length > 0 || currentSettings.provider === 'ollama';

  // Only show user and assistant messages in the UI (hide tool messages)
  const visibleMessages = conversation.messages.filter((m) => m.role !== 'tool');

  return (
    <>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent className="flex w-96 flex-col p-0" side="right">
          <SheetHeader className="border-b border-border px-4 pr-12 py-3">
            {view === 'list' ? (
              <div className="flex items-center justify-between">
                <SheetTitle className="text-base">Conversations</SheetTitle>
                <Button variant="ghost" size="sm" onClick={handleNewConversation}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => {
                    setView('list');
                    setConversations(getConversations());
                  }}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <SheetTitle className="flex-1 truncate text-base">
                  {conversation.title}
                </SheetTitle>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={handleNewConversation}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            )}
          </SheetHeader>

          {view === 'list' ? (
            /* Conversation list */
            <div className="flex-1 overflow-y-auto">
              {conversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <Bot className="mb-3 h-8 w-8 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">No conversations yet</p>
                  <Button size="sm" className="mt-4" onClick={handleNewConversation}>
                    Start a conversation
                  </Button>
                </div>
              ) : (
                <div className="space-y-1 p-2">
                  {conversations.map((conv) => (
                    <div
                      key={conv.id}
                      className={cn(
                        'group flex items-center gap-2 rounded-lg px-3 py-2 transition-colors hover:bg-accent/50',
                        conv.id === conversation.id && 'bg-accent/50',
                      )}
                    >
                      <button
                        type="button"
                        className="flex-1 text-left"
                        onClick={() => handleSelectConversation(conv)}
                      >
                        <p className="truncate text-sm font-medium text-foreground">
                          {conv.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {conv.messages.length} message{conv.messages.length !== 1 ? 's' : ''}
                        </p>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteConversation(conv.id)}
                        aria-label={`Delete conversation: ${conv.title}`}
                        className="shrink-0 text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* Chat view */
            <>
              <div className="flex-1 overflow-y-auto px-4 py-3">
                {!isConfigured && conversation.messages.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Settings className="mb-3 h-8 w-8 text-muted-foreground" />
                    <p className="mb-1 text-sm font-medium text-foreground">
                      Set up your AI provider
                    </p>
                    <p className="mb-4 text-xs text-muted-foreground">
                      Go to Settings → AI Provider to configure your API key.
                    </p>
                  </div>
                )}

                {isConfigured && conversation.messages.length === 0 && !streaming && (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Bot className="mb-3 h-8 w-8 text-primary" />
                    <p className="mb-1 text-sm font-medium text-foreground">
                      Hi! I&apos;m {conciergeName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Ask me anything about your notes, tasks, or ideas.
                    </p>
                  </div>
                )}

                {/* Messages */}
                <div className="space-y-3">
                  {visibleMessages.map((msg) => (
                    <div key={msg.id}>
                      <div
                        className={cn(
                          'max-w-[85%] whitespace-pre-wrap rounded-xl px-3 py-2 text-sm',
                          msg.role === 'user'
                            ? 'ml-auto bg-primary text-primary-foreground'
                            : 'bg-secondary text-foreground',
                        )}
                      >
                        {msg.content}
                      </div>
                      {/* Show tool call badges for assistant messages with tool calls */}
                      {msg.toolCalls && msg.toolCalls.length > 0 && (
                        <div className="mt-1 flex flex-wrap gap-1">
                          {msg.toolCalls.map((tc) => (
                            <span
                              key={tc.id}
                              className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground"
                            >
                              <Wrench className="h-2.5 w-2.5" />
                              {tc.name.replace(/_/g, ' ')}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Tool execution status */}
                  {toolStatus && (
                    <div className="flex items-center gap-2 rounded-xl bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
                      <Wrench className="h-3 w-3 animate-pulse" />
                      {toolStatus}
                    </div>
                  )}

                  {/* Streaming content */}
                  {streaming && !toolStatus && (
                    <div className="max-w-[85%] whitespace-pre-wrap rounded-xl bg-secondary px-3 py-2 text-sm text-foreground">
                      {streamedContent || (
                        <span className="flex items-center gap-2 text-muted-foreground">
                          <Loader2 className="h-3 w-3 animate-spin" />
                          Thinking...
                        </span>
                      )}
                    </div>
                  )}
                </div>
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="border-t border-border px-3 py-3">
                <div className="flex gap-2">
                  <Textarea
                    ref={textareaRef}
                    aria-label={`Message ${conciergeName}`}
                    placeholder={isConfigured ? 'Message...' : 'Configure AI provider first'}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        void handleSend();
                      }
                    }}
                    disabled={!isConfigured || streaming}
                    className="max-h-32 min-h-[36px] resize-none text-sm"
                    rows={1}
                  />
                  <Button
                    size="sm"
                    onClick={() => void handleSend()}
                    disabled={!isConfigured || !input.trim() || streaming}
                    className="h-9 px-3"
                  >
                    <Send className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Floating button */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className={cn(
          'fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full shadow-lg transition-all',
          isOpen
            ? 'scale-90 bg-primary text-primary-foreground'
            : 'bg-primary text-primary-foreground hover:scale-105',
        )}
        aria-label={isOpen ? 'Close concierge' : 'Open concierge'}
      >
        <Bot className="h-5 w-5" />
      </button>
    </>
  );
};

export default ConciergeChat;
