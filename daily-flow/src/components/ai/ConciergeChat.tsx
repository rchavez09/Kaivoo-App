/**
 * Concierge Chat — Sprint 23 P10, Sprint 24 P14, Sprint 34
 *
 * Floating chat button + slide-out Sheet panel with LLM-backed
 * streaming chat. Delegates chat engine to useConciergeChat hook.
 * Uses soul file for system prompt personality.
 *
 * Sprint 24: Added tool-use loop, 6-layer prompt assembly, tool status UI.
 * Sprint 34: Extracted shared logic into useConciergeChat hook.
 */

import { useState, useCallback, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Bot, Send, Plus, Trash2, ChevronLeft, Loader2, Settings, Wrench, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { useConciergeChat } from '@/hooks/useConciergeChat';

const ConciergeChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState<'chat' | 'list'>('chat');
  const navigate = useNavigate();
  const location = useLocation();
  const isOnChatPage = location.pathname === '/chat';

  const {
    conversation,
    conversations,
    input,
    streaming,
    streamedContent,
    toolStatus,
    visibleMessages,
    conciergeName,
    isConfigured,
    messagesEndRef,
    textareaRef,
    setInput,
    handleNewConversation,
    handleSelectConversation,
    handleDeleteConversation,
    handleSend,
  } = useConciergeChat({
    onNewConversation: () => setView('chat'),
    onSelectConversation: () => setView('chat'),
    onBeforeNavigate: () => setIsOpen(false),
  });

  // Focus textarea when opening
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  }, [isOpen, textareaRef]);

  // Auto-resize textarea as user types
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, [input, textareaRef]);

  const handleRefreshAndShowList = useCallback(() => {
    setView('list');
  }, []);

  // Hide entirely when on the full-page chat route
  if (isOnChatPage) return null;

  return (
    <>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent className="flex w-96 flex-col p-0" side="right">
          <SheetHeader className="border-b border-border px-4 py-3 pr-12">
            {view === 'list' ? (
              <div className="flex items-center justify-between">
                <SheetTitle className="text-base">Conversations</SheetTitle>
                <Button variant="ghost" size="sm" aria-label="New conversation" onClick={handleNewConversation}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  aria-label="Back to conversations"
                  onClick={handleRefreshAndShowList}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <SheetTitle className="flex-1 truncate text-base">{conversation.title}</SheetTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  aria-label="New conversation"
                  onClick={handleNewConversation}
                >
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
                      <button type="button" className="flex-1 text-left" onClick={() => handleSelectConversation(conv)}>
                        <p className="truncate text-sm font-medium text-foreground">{conv.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {(() => {
                            const count = conv.messages.filter((m) => m.role !== 'tool').length;
                            return `${count} message${count !== 1 ? 's' : ''}`;
                          })()}
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
                    <p className="mb-1 text-sm font-medium text-foreground">Set up your AI provider</p>
                    <p className="mb-4 text-xs text-muted-foreground">
                      Go to Settings → AI Provider to configure your API key.
                    </p>
                  </div>
                )}

                {isConfigured && conversation.messages.length === 0 && !streaming && (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Bot className="mb-3 h-8 w-8 text-primary" />
                    <p className="mb-1 text-sm font-medium text-foreground">Hi! I&apos;m {conciergeName}</p>
                    <p className="text-xs text-muted-foreground">Ask me anything about your notes, tasks, or ideas.</p>
                  </div>
                )}

                {/* Messages */}
                <div className="space-y-3">
                  {visibleMessages.map((msg) => (
                    <div key={msg.id}>
                      <div
                        className={cn(
                          'isolate max-w-[85%] select-text overflow-hidden rounded-xl px-3 py-2 text-sm',
                          msg.role === 'user'
                            ? 'ml-auto whitespace-pre-wrap bg-primary text-primary-foreground'
                            : 'bg-secondary text-foreground',
                        )}
                      >
                        {msg.role === 'user' ? (
                          msg.content
                        ) : (
                          <div className="prose prose-sm dark:prose-invert prose-headings:font-semibold prose-headings:text-foreground prose-h1:text-base prose-h2:text-sm prose-h3:text-xs prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-li:my-0.5 prose-strong:text-foreground prose-a:text-primary max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                          </div>
                        )}
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
                    <div className="isolate max-w-[85%] select-text overflow-hidden rounded-xl bg-secondary px-3 py-2 text-sm text-foreground">
                      {streamedContent ? (
                        <div className="prose prose-sm dark:prose-invert prose-headings:font-semibold prose-headings:text-foreground prose-h1:text-base prose-h2:text-sm prose-h3:text-xs prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-li:my-0.5 prose-strong:text-foreground prose-a:text-primary max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>{streamedContent}</ReactMarkdown>
                        </div>
                      ) : (
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

              {/* Open full chat link */}
              <div className="border-t border-border px-3 py-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    navigate('/chat');
                  }}
                  className="flex w-full items-center justify-center gap-1.5 rounded py-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
                >
                  <Maximize2 className="h-3 w-3" />
                  Open full chat
                </button>
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
                    className="max-h-[160px] min-h-[36px] resize-none overflow-y-auto text-sm"
                    rows={1}
                  />
                  <Button
                    size="sm"
                    aria-label="Send message"
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
          isOpen ? 'scale-90 bg-primary text-primary-foreground' : 'bg-primary text-primary-foreground hover:scale-105',
        )}
        aria-label={isOpen ? 'Close concierge' : 'Open concierge'}
      >
        <Bot className="h-5 w-5" />
      </button>
    </>
  );
};

export default ConciergeChat;
