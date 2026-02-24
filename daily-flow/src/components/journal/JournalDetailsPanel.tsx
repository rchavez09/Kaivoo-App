import { useState } from 'react';
import { ChevronDown, ChevronRight, FolderOpen, FileText, X, Sparkles, Loader2, CheckCircle, MousePointerClick } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import TopicPagePicker from '@/components/TopicPagePicker';
import InlineTagInput from './InlineTagInput';
import { useKaivooStore } from '@/stores/useKaivooStore';
import { useKaivooActions } from '@/hooks/useKaivooActions';
import { cn } from '@/lib/utils';
import { MOODS } from './EntryMetadataPills';

interface AIExtraction {
  suggestions: Array<{
    type: 'task' | 'capture' | 'subtask';
    title?: string;
    content?: string;
    dueDate?: string | null;
    priority?: 'low' | 'medium' | 'high';
    topicPath?: string | null;
    tags?: string[];
    parentTaskId?: string;
    parentTaskTitle?: string;
  }>;
}

interface JournalDetailsPanelProps {
  activeEntryId: string | null;
  // AI extraction (day-level scope)
  isExtracting: boolean;
  extraction: AIExtraction | null;
  approvedItems: Set<number>;
  onExtract: () => void;
  onApproveItem: (index: number) => void;
  canExtract: boolean;
}

const JournalDetailsPanel = ({
  activeEntryId,
  isExtracting, extraction, approvedItems, onExtract, onApproveItem, canExtract,
}: JournalDetailsPanelProps) => {
  const [isOpen, setIsOpen] = useState(true);
  const [showTopicPicker, setShowTopicPicker] = useState(false);

  // Read active entry from store
  const entry = useKaivooStore(s => activeEntryId ? s.journalEntries.find(e => e.id === activeEntryId) : undefined);
  const getTopicPath = useKaivooStore(s => s.getTopicPath);
  const existingTags = useKaivooStore(s => s.tags);

  const { updateJournalEntry, resolveTopicPathAsync } = useKaivooActions();

  const tags = entry?.tags || [];
  const topicId = entry?.topicIds?.[0];
  const topicPath = topicId ? getTopicPath(topicId) : null;
  const moodScore = entry?.moodScore;

  // --- Handlers (per-entry mutations) ---
  const handleAddTag = async (tag: string) => {
    if (!activeEntryId) return;
    await updateJournalEntry(activeEntryId, { tags: [...tags, tag] });
  };

  const handleRemoveTag = async (tag: string) => {
    if (!activeEntryId) return;
    await updateJournalEntry(activeEntryId, { tags: tags.filter(t => t !== tag) });
  };

  const handleAddTopic = async (path: string) => {
    if (!activeEntryId) return;
    const ids = await resolveTopicPathAsync(path, true);
    if (ids && ids.length > 0) {
      const leafId = ids[ids.length - 1];
      await updateJournalEntry(activeEntryId, { topicIds: [leafId] });
    }
    setShowTopicPicker(false);
  };

  const handleRemoveTopic = async () => {
    if (!activeEntryId) return;
    await updateJournalEntry(activeEntryId, { topicIds: [] });
  };

  const handleMoodChange = async (score: number | undefined) => {
    if (!activeEntryId) return;
    await updateJournalEntry(activeEntryId, { moodScore: score });
  };

  const isPage = topicPath?.includes('/');

  return (
    <div className="border-t border-border">
      {/* Collapsible header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-accent/50 transition-colors"
        aria-expanded={isOpen}
        aria-label="Toggle details panel"
      >
        <span className="text-sm font-medium">Details</span>
        {isOpen
          ? <ChevronDown className="w-4 h-4 text-muted-foreground" />
          : <ChevronRight className="w-4 h-4 text-muted-foreground" />
        }
      </button>

      {isOpen && (
        <div className="px-4 pb-4 space-y-4">
          {!activeEntryId || !entry ? (
            /* No entry selected placeholder */
            <div className="text-center py-6">
              <MousePointerClick className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Click in an entry to see its details</p>
            </div>
          ) : (
            <>
              {/* Topic (single per entry) */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Topic</label>
                {topicPath ? (
                  <div className="flex items-center gap-1.5">
                    <Badge variant="secondary" className="gap-1 text-xs group">
                      {isPage ? <FileText className="w-3 h-3" /> : <FolderOpen className="w-3 h-3" />}
                      {topicPath}
                      <button
                        onClick={() => void handleRemoveTopic()}
                        className="ml-0.5 opacity-60 hover:opacity-100 transition-opacity"
                        aria-label="Remove topic"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  </div>
                ) : (
                  <div className="relative">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowTopicPicker(true)}
                      className="gap-1.5 h-7 text-xs w-full justify-start"
                      aria-label="Add topic"
                    >
                      <FolderOpen className="w-3.5 h-3.5" />
                      Add Topic
                    </Button>
                    {showTopicPicker && (
                      <TopicPagePicker
                        onSelect={(path: string) => void handleAddTopic(path)}
                        onClose={() => setShowTopicPicker(false)}
                        position={{ top: 32, left: 0 }}
                      />
                    )}
                  </div>
                )}
              </div>

              {/* Tags */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Tags</label>
                <InlineTagInput
                  tags={tags}
                  existingTags={existingTags}
                  onAddTag={(tag) => void handleAddTag(tag)}
                  onRemoveTag={(tag) => void handleRemoveTag(tag)}
                />
              </div>

              {/* Mood */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Mood</label>
                <div className="flex gap-1" role="radiogroup" aria-label="Mood selector">
                  {Object.entries(MOODS).reverse().map(([scoreStr, { emoji, label }]) => {
                    const score = Number(scoreStr);
                    return (
                      <button
                        key={score}
                        type="button"
                        role="radio"
                        aria-checked={moodScore === score}
                        aria-label={label}
                        onClick={() => void handleMoodChange(moodScore === score ? undefined : score)}
                        className={cn(
                          'flex flex-col items-center gap-0.5 px-1.5 py-1 rounded-md transition-all text-xs',
                          moodScore === score
                            ? 'bg-primary/10 ring-1 ring-primary/30'
                            : 'hover:bg-muted'
                        )}
                      >
                        <span className="text-sm leading-none">{emoji}</span>
                        <span className="text-[9px] text-muted-foreground">{label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {/* AI Extract (day-level scope — always visible) */}
          <div className="space-y-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onExtract}
              disabled={isExtracting || !canExtract}
              className="gap-1.5 h-7 text-xs w-full"
              aria-label="Extract with AI"
            >
              {isExtracting
                ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                : <Sparkles className="w-3.5 h-3.5" />
              }
              Extract with AI
            </Button>

            {extraction && extraction.suggestions.length > 0 && (
              <div className="space-y-1.5">
                {extraction.suggestions.map((item, index) => (
                  <div
                    key={index}
                    className={cn(
                      "flex items-center justify-between p-2 rounded-md border bg-background text-xs",
                      approvedItems.has(index) && "opacity-50"
                    )}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <Badge variant={item.type === 'task' ? 'default' : 'secondary'} className="text-[10px] shrink-0">
                        {item.type}
                      </Badge>
                      <div className="min-w-0">
                        <p className="font-medium truncate">{item.title || item.content}</p>
                        {item.topicPath && (
                          <p className="text-muted-foreground truncate">{item.topicPath}</p>
                        )}
                        {item.parentTaskTitle && (
                          <p className="text-muted-foreground truncate">&rarr; {item.parentTaskTitle}</p>
                        )}
                      </div>
                    </div>
                    {!approvedItems.has(index) ? (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onApproveItem(index)}
                        className="h-6 px-2 gap-1 shrink-0"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                      </Button>
                    ) : (
                      <CheckCircle className="w-3.5 h-3.5 text-green-500 shrink-0" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default JournalDetailsPanel;
