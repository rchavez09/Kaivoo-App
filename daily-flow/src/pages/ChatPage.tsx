/**
 * ChatPage — Sprint 34
 *
 * Full-page AI chat with conversation sidebar, persistent history,
 * and model/provider selector. Delegates chat engine to useConciergeChat.
 */

import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Bot,
  Send,
  Plus,
  Trash2,
  Loader2,
  Wrench,
  MoreHorizontal,
  Pencil,
  Search,
  PanelLeftClose,
  PanelLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import AppLayout from '@/components/layout/AppLayout';
import { getAISettings, saveAISettings } from '@/lib/ai/settings';
import { useConciergeChat } from '@/hooks/useConciergeChat';
import { AI_PROVIDERS } from '@/lib/ai/providers';

const ChatPage = () => {
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
    currentSettings,
    messagesEndRef,
    textareaRef,
    setInput,
    handleNewConversation,
    handleSelectConversation,
    handleDeleteConversation,
    handleSend,
    renameConversation,
  } = useConciergeChat();

  // ─── ChatPage-specific UI state ───
  const [searchQuery, setSearchQuery] = useState('');
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renamingTitle, setRenamingTitle] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const renameInputRef = useRef<HTMLInputElement>(null);
  const blurTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const navigate = useNavigate();

  // Focus textarea on conversation switch
  useEffect(() => {
    const timer = setTimeout(() => textareaRef.current?.focus(), 100);
    return () => clearTimeout(timer);
  }, [conversation.id, textareaRef]);

  // Focus rename input when entering rename mode (300ms to avoid DropdownMenu focus race)
  useEffect(() => {
    if (!renamingId) return;
    const timer = setTimeout(() => renameInputRef.current?.focus(), 300);
    return () => clearTimeout(timer);
  }, [renamingId]);

  // Auto-resize textarea as user types
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  }, [input, textareaRef]);

  // ─── ChatPage-specific handlers ───

  const handleStartRename = useCallback((conv: { id: string; title: string }) => {
    setRenamingId(conv.id);
    setRenamingTitle(conv.title);
  }, []);

  const handleFinishRename = useCallback(() => {
    if (!renamingId || !renamingTitle.trim()) {
      setRenamingId(null);
      return;
    }
    void renameConversation(renamingId, renamingTitle.trim());
    setRenamingId(null);
  }, [renamingId, renamingTitle, renameConversation]);

  const handleModelChange = useCallback((value: string) => {
    const colonIdx = value.indexOf(':');
    if (colonIdx === -1) return;
    const providerId = value.slice(0, colonIdx);
    const modelId = value.slice(colonIdx + 1);
    const settings = getAISettings();
    saveAISettings({
      ...settings,
      provider: providerId as typeof settings.provider,
      model: modelId,
    });
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (deleteTarget) {
      handleDeleteConversation(deleteTarget);
    }
    setDeleteTarget(null);
  }, [deleteTarget, handleDeleteConversation]);

  const filteredConversations = useMemo(
    () =>
      searchQuery.trim()
        ? conversations.filter((c) => c.title.toLowerCase().includes(searchQuery.toLowerCase()))
        : conversations,
    [conversations, searchQuery],
  );

  // ─── Render ───

  return (
    <AppLayout>
      <div className="flex h-full">
        {/* ─── Conversation Sidebar ─── */}
        <div
          className={cn(
            'flex flex-col border-r border-border bg-sidebar transition-all duration-200',
            sidebarOpen ? 'w-72' : 'w-0 overflow-hidden',
          )}
        >
          {/* Sidebar header */}
          <div className="flex items-center gap-2 border-b border-border p-3">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                aria-label="Search conversations"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-8 pl-8 text-sm"
              />
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0"
              aria-label="New conversation"
              onClick={handleNewConversation}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* Conversation list */}
          <div className="flex-1 overflow-y-auto">
            {filteredConversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Bot className="mb-3 h-8 w-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">{searchQuery ? 'No matches' : 'No conversations yet'}</p>
                {!searchQuery && (
                  <Button size="sm" className="mt-4" onClick={handleNewConversation}>
                    Start a conversation
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-0.5 p-2">
                {filteredConversations.map((conv) => (
                  <div
                    key={conv.id}
                    className={cn(
                      'group flex items-center gap-1 rounded-lg px-3 py-2 transition-colors hover:bg-accent/50',
                      conv.id === conversation.id && 'bg-accent',
                    )}
                  >
                    {renamingId === conv.id ? (
                      <input
                        ref={renameInputRef}
                        value={renamingTitle}
                        onChange={(e) => setRenamingTitle(e.target.value)}
                        onFocus={() => clearTimeout(blurTimeoutRef.current)}
                        onBlur={() => {
                          blurTimeoutRef.current = setTimeout(handleFinishRename, 200);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleFinishRename();
                          if (e.key === 'Escape') setRenamingId(null);
                        }}
                        className="flex-1 rounded border border-border bg-background px-2 py-0.5 text-sm outline-none focus:ring-1 focus:ring-ring"
                      />
                    ) : (
                      <button
                        type="button"
                        className="min-w-0 flex-1 text-left"
                        onClick={() => handleSelectConversation(conv)}
                      >
                        <p className="truncate text-sm font-medium text-foreground">{conv.title}</p>
                        <p
                          className={cn(
                            'text-xs',
                            conv.id === conversation.id ? 'text-foreground/60' : 'text-muted-foreground',
                          )}
                        >
                          {(() => {
                            const count = conv.messages.filter((m) => m.role !== 'tool').length;
                            return `${count} message${count !== 1 ? 's' : ''}`;
                          })()}
                        </p>
                      </button>
                    )}

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          type="button"
                          className="shrink-0 rounded p-1 text-muted-foreground opacity-0 transition-opacity hover:text-foreground group-focus-within:opacity-100 group-hover:opacity-100"
                          aria-label={`Actions for ${conv.title}`}
                        >
                          <MoreHorizontal className="h-3.5 w-3.5" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleStartRename(conv)}>
                          <Pencil className="mr-2 h-3.5 w-3.5" />
                          Rename
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => setDeleteTarget(conv.id)}
                        >
                          <Trash2 className="mr-2 h-3.5 w-3.5" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ─── Chat Area ─── */}
        <div className="flex flex-1 flex-col">
          {/* Chat header */}
          <div className="flex items-center gap-3 border-b border-border px-4 py-2.5">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0"
              onClick={() => setSidebarOpen((v) => !v)}
              aria-label={sidebarOpen ? 'Hide conversations' : 'Show conversations'}
            >
              {sidebarOpen ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeft className="h-4 w-4" />}
            </Button>

            <h1 className="min-w-0 flex-1 truncate text-sm font-semibold text-foreground">{conversation.title}</h1>

            {/* Model selector */}
            <Select value={`${currentSettings.provider}:${currentSettings.model}`} onValueChange={handleModelChange}>
              <SelectTrigger className="h-8 w-48 text-xs">
                <SelectValue placeholder="Select model" />
              </SelectTrigger>
              <SelectContent>
                {AI_PROVIDERS.map((provider) => (
                  <SelectGroup key={provider.id}>
                    <SelectLabel>{provider.name}</SelectLabel>
                    {provider.models.map((model) => (
                      <SelectItem key={`${provider.id}:${model.id}`} value={`${provider.id}:${model.id}`}>
                        {model.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Messages area */}
          <div className="flex-1 overflow-y-auto px-4 py-4">
            <div className="mx-auto max-w-3xl">
              {/* Empty states */}
              {!isConfigured && conversation.messages.length === 0 && (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                  <Bot className="mb-4 h-12 w-12 text-muted-foreground" />
                  <p className="mb-1 text-base font-medium text-foreground">Set up your AI provider</p>
                  <p className="mb-4 text-sm text-muted-foreground">
                    Go to Settings → AI Provider to configure your API key.
                  </p>
                  <Button variant="outline" size="sm" onClick={() => navigate('/settings')}>
                    Open Settings
                  </Button>
                </div>
              )}

              {isConfigured && conversation.messages.length === 0 && !streaming && (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                  <Bot className="mb-4 h-12 w-12 text-primary" />
                  <p className="mb-1 text-lg font-medium text-foreground">Hi! I&apos;m {conciergeName}</p>
                  <p className="text-sm text-muted-foreground">Ask me anything about your notes, tasks, or ideas.</p>
                </div>
              )}

              {/* Message list */}
              <div className="space-y-4">
                {visibleMessages.map((msg) => (
                  <div key={msg.id}>
                    <div
                      className={cn(
                        'isolate select-text overflow-hidden rounded-xl px-4 py-3 text-sm',
                        msg.role === 'user'
                          ? 'ml-auto max-w-[80%] whitespace-pre-wrap bg-primary text-primary-foreground'
                          : 'max-w-[85%] bg-secondary text-foreground',
                      )}
                    >
                      {msg.role === 'user' ? (
                        msg.content
                      ) : (
                        <div className="prose prose-sm dark:prose-invert prose-headings:font-semibold prose-headings:text-foreground prose-h1:text-base prose-h2:text-sm prose-h3:text-xs prose-p:my-1.5 prose-ul:my-1.5 prose-ol:my-1.5 prose-li:my-0.5 prose-strong:text-foreground prose-a:text-primary max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                        </div>
                      )}
                    </div>
                    {msg.toolCalls && msg.toolCalls.length > 0 && (
                      <div className="mt-1.5 flex flex-wrap gap-1">
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
                  <div className="flex items-center gap-2 rounded-xl bg-muted/50 px-4 py-3 text-xs text-muted-foreground">
                    <Wrench className="h-3 w-3 animate-pulse" />
                    {toolStatus}
                  </div>
                )}

                {/* Streaming content */}
                {streaming && !toolStatus && (
                  <div className="isolate max-w-[85%] select-text overflow-hidden rounded-xl bg-secondary px-4 py-3 text-sm text-foreground">
                    {streamedContent ? (
                      <div className="prose prose-sm dark:prose-invert prose-headings:font-semibold prose-headings:text-foreground prose-h1:text-base prose-h2:text-sm prose-h3:text-xs prose-p:my-1.5 prose-ul:my-1.5 prose-ol:my-1.5 prose-li:my-0.5 prose-strong:text-foreground prose-a:text-primary max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
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
          </div>

          {/* Input area */}
          <div className="border-t border-border px-4 py-3">
            <div className="mx-auto flex max-w-3xl gap-2">
              <Textarea
                ref={textareaRef}
                aria-label={`Message ${conciergeName}`}
                placeholder={isConfigured ? 'Send a message...' : 'Configure AI provider first'}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    void handleSend();
                  }
                }}
                disabled={!isConfigured || streaming}
                className="max-h-[200px] min-h-[44px] resize-none overflow-y-auto text-sm"
                rows={1}
              />
              <Button
                size="sm"
                aria-label="Send message"
                onClick={() => void handleSend()}
                disabled={!isConfigured || !input.trim() || streaming}
                className="h-11 px-4"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete conversation?</AlertDialogTitle>
            <AlertDialogDescription>This conversation will be permanently removed.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
};

export default ChatPage;
