/**
 * Concierge Chat — Sprint 23 P10
 *
 * Floating chat button + slide-out Sheet panel with LLM-backed
 * streaming chat. Persists conversations to localStorage.
 * Uses soul file for system prompt personality.
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { Bot, Send, Plus, Trash2, ChevronLeft, Loader2, Settings } from 'lucide-react';
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
import { getAISettings, getSoulConfig } from '@/lib/ai/settings';
import {
  streamChat,
  getConversations,
  saveConversation,
  deleteConversation,
  createConversation,
} from '@/lib/ai/chat-service';
import type { Conversation, ConversationMessage } from '@/lib/ai/types';

const ConciergeChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState<'chat' | 'list'>('chat');
  const [conversation, setConversation] = useState<Conversation>(createConversation);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [streamedContent, setStreamedContent] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Load conversations on mount
  useEffect(() => {
    setConversations(getConversations());
  }, []);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation.messages, streamedContent]);

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
  }, []);

  const handleSelectConversation = useCallback((conv: Conversation) => {
    setConversation(conv);
    setView('chat');
    setStreamedContent('');
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

    const updatedMessages = [...conversation.messages, userMessage];
    const updatedConv: Conversation = {
      ...conversation,
      messages: updatedMessages,
      updatedAt: new Date().toISOString(),
    };
    setConversation(updatedConv);

    setStreaming(true);
    setStreamedContent('');

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      let fullContent = '';
      const stream = streamChat(updatedMessages, (title) => {
        updatedConv.title = title;
      }, controller.signal);

      for await (const chunk of stream) {
        fullContent += chunk;
        setStreamedContent(fullContent);
      }

      // Finalize the assistant message
      const assistantMessage: ConversationMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: fullContent,
        timestamp: new Date().toISOString(),
      };

      const finalConv: Conversation = {
        ...updatedConv,
        messages: [...updatedMessages, assistantMessage],
        updatedAt: new Date().toISOString(),
      };

      setConversation(finalConv);
      saveConversation(finalConv);
      setConversations(getConversations());
      setStreamedContent('');
    } catch (e) {
      if (e instanceof DOMException && e.name === 'AbortError') return;
      const message = e instanceof Error ? e.message : 'Chat failed';
      toast.error('Chat error', { description: message });

      // Save the conversation with the user message even if streaming failed
      saveConversation(updatedConv);
      setConversations(getConversations());
    } finally {
      abortRef.current = null;
      setStreaming(false);
    }
  }, [input, streaming, conversation]);

  const soul = getSoulConfig();
  const currentSettings = getAISettings();
  const conciergeName = soul?.name || 'Concierge';
  const isConfigured = currentSettings.apiKey.length > 0 || currentSettings.provider === 'ollama';

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
                  {conversation.messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={cn(
                        'max-w-[85%] whitespace-pre-wrap rounded-xl px-3 py-2 text-sm',
                        msg.role === 'user'
                          ? 'ml-auto bg-primary text-primary-foreground'
                          : 'bg-secondary text-foreground',
                      )}
                    >
                      {msg.content}
                    </div>
                  ))}

                  {/* Streaming content */}
                  {streaming && (
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
