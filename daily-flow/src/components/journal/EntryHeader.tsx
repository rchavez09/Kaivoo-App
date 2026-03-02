import { useState, useRef, useEffect } from 'react';
import { NodeViewWrapper } from '@tiptap/react';
import type { NodeViewProps } from '@tiptap/react';
import { format } from 'date-fns';
import { ChevronDown, ChevronRight, Hash, FolderOpen, FileText, Plus, X, Smile, Trash2 } from 'lucide-react';
import { useKaivooStore } from '@/stores/useKaivooStore';
import { useKaivooActions } from '@/hooks/useKaivooActions';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import { MOODS } from './EntryMetadataPills';

const EntryHeader = ({ node, updateAttributes, editor, getPos: _getPos }: NodeViewProps) => {
  const entryId = node.attrs.entryId as string;
  const timestamp = node.attrs.timestamp as string;
  const collapsed = node.attrs.collapsed as boolean;

  const [showTagInput, setShowTagInput] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [editingLabel, setEditingLabel] = useState(false);
  const [labelDraft, setLabelDraft] = useState('');
  const labelInputRef = useRef<HTMLInputElement>(null);

  // Store reads (context-free — Zustand external store)
  // Custom equality to avoid re-renders when other entries change
  const entry = useKaivooStore(
    (s) => s.journalEntries.find((e) => e.id === entryId),
    (a, b) =>
      a?.id === b?.id &&
      a?.tags === b?.tags &&
      a?.topicIds === b?.topicIds &&
      a?.moodScore === b?.moodScore &&
      a?.label === b?.label,
  );
  const getTopicPath = useKaivooStore((s) => s.getTopicPath);
  const topics = useKaivooStore((s) => s.topics);
  const getTopicPages = useKaivooStore((s) => s.getTopicPages);

  // Actions (requires React context for auth — works via TipTap portal)
  const { updateJournalEntry, resolveTopicPathAsync, deleteJournalEntry } = useKaivooActions();

  const topicId = entry?.topicIds?.[0];
  const topicPath = topicId ? getTopicPath(topicId) : null;
  const tags = entry?.tags || [];
  const moodScore = entry?.moodScore;
  const moodData = moodScore ? MOODS[moodScore] : undefined;

  const entryLabel = entry?.label;
  const timeLabel = timestamp ? format(new Date(timestamp), 'h:mm a') : '';
  const displayLabel = entryLabel || timeLabel;

  // Focus label input when entering edit mode
  useEffect(() => {
    if (editingLabel) labelInputRef.current?.focus();
  }, [editingLabel]);

  // --- Handlers ---

  const handleStartLabelEdit = () => {
    setLabelDraft(entryLabel || '');
    setEditingLabel(true);
  };

  const handleSaveLabel = async () => {
    const trimmed = labelDraft.trim();
    // Empty string clears the label (reverts to timestamp)
    await updateJournalEntry(entryId, { label: trimmed || undefined });
    if (trimmed) {
      updateAttributes({ label: trimmed });
    } else {
      updateAttributes({ label: null });
    }
    setEditingLabel(false);
  };

  const handleLabelKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      void handleSaveLabel();
    } else if (e.key === 'Escape') {
      setEditingLabel(false);
    }
  };

  const handleToggleCollapse = () => {
    const newCollapsed = !collapsed;
    updateAttributes({ collapsed: newCollapsed });
    // Persist collapse state to localStorage
    if (entry?.date) {
      try {
        const key = `collapse-${entry.date}`;
        const raw = localStorage.getItem(key);
        const obj: Record<string, boolean> = raw ? (JSON.parse(raw) as Record<string, boolean>) : {};
        if (newCollapsed) {
          obj[entryId] = true;
        } else {
          delete obj[entryId];
        }
        if (Object.keys(obj).length > 0) {
          localStorage.setItem(key, JSON.stringify(obj));
        } else {
          localStorage.removeItem(key);
        }
      } catch {
        /* ignore */
      }
    }
  };

  const handleTopicSelect = async (path: string) => {
    const ids = await resolveTopicPathAsync(path, true);
    if (ids && ids.length > 0) {
      const leafId = ids[ids.length - 1];
      await updateJournalEntry(entryId, { topicIds: [leafId] });
    }
  };

  const handleRemoveTopic = async () => {
    await updateJournalEntry(entryId, { topicIds: [] });
  };

  const handleRemoveTag = async (tag: string) => {
    await updateJournalEntry(entryId, { tags: tags.filter((t) => t !== tag) });
  };

  const handleAddTag = async () => {
    const newTag = tagInput.trim().toLowerCase();
    if (newTag && !tags.includes(newTag)) {
      await updateJournalEntry(entryId, { tags: [...tags, newTag] });
    }
    setTagInput('');
    setShowTagInput(false);
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      void handleAddTag();
    } else if (e.key === 'Escape') {
      setShowTagInput(false);
      setTagInput('');
    }
  };

  const handleMoodChange = async (score: number) => {
    await updateJournalEntry(entryId, {
      moodScore: moodScore === score ? undefined : score,
    });
  };

  const handleDeleteEntry = async () => {
    // Use entryId matching (not position) — positions shift after splits
    const doc = editor.state.doc;
    let startPos = -1;
    let endPos = doc.content.size;
    let foundSelf = false;

    doc.forEach((node, pos) => {
      if (node.type.name === 'entryHeader') {
        if (node.attrs.entryId === entryId) {
          startPos = pos;
          foundSelf = true;
        } else if (foundSelf && endPos === doc.content.size) {
          endPos = pos;
        }
      }
    });

    if (startPos >= 0) {
      editor.chain().focus().deleteRange({ from: startPos, to: endPos }).run();
    }

    // Remove from store + Supabase
    await deleteJournalEntry(entryId);
  };

  // Display up to 3 tags, overflow as "+N"
  const visibleTags = tags.slice(0, 3);
  const overflowCount = Math.max(0, tags.length - 3);
  const isPage = topicPath?.includes('/');

  const selectableTopics = topics;

  return (
    <NodeViewWrapper
      data-timestamp-divider=""
      data-entry-id={entryId}
      data-entry-header=""
      data-timestamp={timestamp}
      data-collapsed={String(collapsed)}
      contentEditable={false}
      className="entry-header"
    >
      <div className="group/header flex select-none items-center gap-1.5 px-1 py-2">
        {/* Collapse chevron */}
        <button
          onClick={handleToggleCollapse}
          className="flex h-5 w-5 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-secondary/80"
          aria-label={collapsed ? 'Expand entry' : 'Collapse entry'}
        >
          {collapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </button>

        {/* Timestamp / Label */}
        {editingLabel ? (
          <input
            ref={labelInputRef}
            value={labelDraft}
            onChange={(e) => setLabelDraft(e.target.value)}
            onKeyDown={handleLabelKeyDown}
            onBlur={() => void handleSaveLabel()}
            placeholder={timeLabel}
            className="w-24 rounded bg-secondary/50 px-1.5 py-0.5 text-xs font-medium outline-none focus:ring-1 focus:ring-primary/30"
          />
        ) : (
          <button
            onClick={handleStartLabelEdit}
            className="rounded px-1 py-0.5 text-xs font-medium tracking-wide text-muted-foreground transition-colors hover:bg-secondary/50 hover:text-foreground"
            title={entryLabel ? `${timeLabel} — click to rename` : 'Click to rename'}
          >
            {displayLabel}
          </button>
        )}

        {/* Divider line */}
        <div className="h-px min-w-[20px] flex-1 bg-border/50" />

        {/* Topic pill */}
        {topicPath ? (
          <span className="topic-chip group inline-flex cursor-default items-center gap-1 px-1.5 py-0.5 text-[10px]">
            {isPage ? <FileText className="h-2.5 w-2.5" /> : <FolderOpen className="h-2.5 w-2.5" />}
            {topicPath}
            <button
              onClick={() => void handleRemoveTopic()}
              className="ml-0.5 opacity-0 transition-opacity group-hover:opacity-100"
              aria-label="Remove topic"
            >
              <X className="h-2.5 w-2.5" />
            </button>
          </span>
        ) : (
          <Popover>
            <PopoverTrigger asChild>
              <button
                className="inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[10px] text-muted-foreground/50 transition-colors hover:bg-secondary/50 hover:text-muted-foreground"
                aria-label="Add topic"
              >
                <FolderOpen className="h-2.5 w-2.5" />
                topic
              </button>
            </PopoverTrigger>
            <PopoverContent className="max-h-[250px] w-56 overflow-y-auto p-1" align="end" sideOffset={4}>
              {selectableTopics.map((topic) => {
                const pages = getTopicPages(topic.id);
                return (
                  <div key={topic.id}>
                    <button
                      onClick={() => void handleTopicSelect(topic.name)}
                      className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-sm transition-colors hover:bg-secondary/70"
                    >
                      <FolderOpen className="h-3.5 w-3.5 shrink-0 text-primary" />
                      <span className="truncate">{topic.name}</span>
                    </button>
                    {pages.map((page) => (
                      <button
                        key={page.id}
                        onClick={() => void handleTopicSelect(`${topic.name}/${page.name}`)}
                        className="flex w-full items-center gap-2 rounded px-2 py-1.5 pl-6 text-left text-sm transition-colors hover:bg-secondary/70"
                      >
                        <FileText className="h-3.5 w-3.5 shrink-0 text-info-foreground" />
                        <span className="truncate">{page.name}</span>
                      </button>
                    ))}
                  </div>
                );
              })}
              {selectableTopics.length === 0 && (
                <div className="px-3 py-4 text-center text-sm text-muted-foreground">No topics yet</div>
              )}
            </PopoverContent>
          </Popover>
        )}

        {/* Tag pills */}
        {visibleTags.map((tag) => (
          <span key={tag} className="tag-chip group inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px]">
            <Hash className="h-2.5 w-2.5" />
            {tag}
            <button
              onClick={() => void handleRemoveTag(tag)}
              className="ml-0.5 opacity-0 transition-opacity group-hover:opacity-100"
              aria-label={`Remove tag ${tag}`}
            >
              <X className="h-2.5 w-2.5" />
            </button>
          </span>
        ))}
        {overflowCount > 0 && <span className="text-[10px] text-muted-foreground">+{overflowCount}</span>}

        {/* Add tag */}
        {showTagInput ? (
          <input
            autoFocus
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleTagKeyDown}
            onBlur={() => void handleAddTag()}
            placeholder="tag"
            className="w-16 rounded bg-secondary/50 px-1.5 py-0.5 text-[10px] outline-none focus:ring-1 focus:ring-primary/30"
          />
        ) : (
          <button
            onClick={() => setShowTagInput(true)}
            className="text-muted-foreground/40 transition-colors hover:text-muted-foreground"
            aria-label="Add tag"
          >
            <Plus className="h-3 w-3" />
          </button>
        )}

        {/* Mood emoji */}
        <Popover>
          <PopoverTrigger asChild>
            <button
              className={cn(
                'rounded px-1 py-0.5 text-sm leading-none transition-colors hover:bg-secondary/50',
                !moodData && 'text-muted-foreground/40',
              )}
              aria-label={moodData ? `Mood: ${moodData.label}` : 'Set mood'}
            >
              {moodData ? moodData.emoji : <Smile className="h-3.5 w-3.5" />}
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-2" align="end">
            <div className="flex gap-1" role="radiogroup" aria-label="Mood selector">
              {Object.entries(MOODS)
                .reverse()
                .map(([scoreStr, { emoji, label }]) => {
                  const score = Number(scoreStr);
                  return (
                    <button
                      key={score}
                      type="button"
                      role="radio"
                      aria-checked={moodScore === score}
                      aria-label={label}
                      onClick={() => void handleMoodChange(score)}
                      className={cn(
                        'flex flex-col items-center gap-0.5 rounded-md px-1.5 py-1 text-xs transition-all',
                        moodScore === score ? 'bg-primary/10 ring-1 ring-primary/30' : 'hover:bg-muted',
                      )}
                    >
                      <span className="text-sm leading-none">{emoji}</span>
                      <span className="text-[9px] text-muted-foreground">{label}</span>
                    </button>
                  );
                })}
            </div>
          </PopoverContent>
        </Popover>

        {/* Delete entry */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button
              className="ml-0.5 text-muted-foreground/0 transition-colors hover:!text-destructive group-hover/header:text-muted-foreground/40"
              aria-label="Delete entry"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete this entry?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete this entry and its content. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => void handleDeleteEntry()}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </NodeViewWrapper>
  );
};

export default EntryHeader;
