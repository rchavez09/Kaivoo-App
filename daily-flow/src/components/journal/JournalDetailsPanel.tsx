import { useState } from 'react';
import { ChevronDown, ChevronRight, FolderOpen, FileText, X, Sparkles, Loader2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import TopicPagePicker from '@/components/TopicPagePicker';
import InlineTagInput from './InlineTagInput';
import { cn } from '@/lib/utils';

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
  tags: string[];
  topicPaths: string[];
  moodScore: number | undefined;
  existingTags: Array<{ id: string; name: string }>;
  onAddTag: (tag: string) => void;
  onRemoveTag: (tag: string) => void;
  onAddTopic: (path: string) => void;
  onRemoveTopic: (path: string) => void;
  onMoodChange: (score: number | undefined) => void;
  topicExists: (path: string) => boolean;
  // AI extraction
  isExtracting: boolean;
  extraction: AIExtraction | null;
  approvedItems: Set<number>;
  onExtract: () => void;
  onApproveItem: (index: number) => void;
  canExtract: boolean;
}

const MOODS = [
  { score: 5, emoji: '\ud83d\ude0a', label: 'Great' },
  { score: 4, emoji: '\ud83d\ude42', label: 'Good' },
  { score: 3, emoji: '\ud83d\ude10', label: 'Okay' },
  { score: 2, emoji: '\ud83d\ude14', label: 'Low' },
  { score: 1, emoji: '\ud83d\ude1e', label: 'Rough' },
];

const JournalDetailsPanel = ({
  tags, topicPaths, moodScore, existingTags,
  onAddTag, onRemoveTag, onAddTopic, onRemoveTopic, onMoodChange,
  topicExists,
  isExtracting, extraction, approvedItems, onExtract, onApproveItem, canExtract,
}: JournalDetailsPanelProps) => {
  const [isOpen, setIsOpen] = useState(true);
  const [showTopicPicker, setShowTopicPicker] = useState(false);

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
          {/* Topics */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Topics</label>
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
                  onSelect={(path: string) => {
                    onAddTopic(path);
                    setShowTopicPicker(false);
                  }}
                  onClose={() => setShowTopicPicker(false)}
                  position={{ top: 32, left: 0 }}
                />
              )}
            </div>
            {topicPaths.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {topicPaths.map(path => {
                  const exists = topicExists(path);
                  const isPage = path.includes('/');
                  return (
                    <Badge
                      key={path}
                      variant="secondary"
                      className={cn("gap-1 text-xs group", !exists && "opacity-70")}
                    >
                      {isPage ? <FileText className="w-3 h-3" /> : <FolderOpen className="w-3 h-3" />}
                      {path}
                      {!exists && <span className="text-[10px]">+</span>}
                      <button
                        onClick={() => onRemoveTopic(path)}
                        className="ml-0.5 opacity-60 hover:opacity-100 transition-opacity"
                        aria-label={`Remove topic ${path}`}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  );
                })}
              </div>
            )}
          </div>

          {/* Tags */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Tags</label>
            <InlineTagInput
              tags={tags}
              existingTags={existingTags}
              onAddTag={onAddTag}
              onRemoveTag={onRemoveTag}
            />
          </div>

          {/* Mood */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Mood</label>
            <div className="flex gap-1" role="radiogroup" aria-label="Mood selector">
              {MOODS.map(({ score, emoji, label }) => (
                <button
                  key={score}
                  type="button"
                  role="radio"
                  aria-checked={moodScore === score}
                  aria-label={label}
                  onClick={() => onMoodChange(moodScore === score ? undefined : score)}
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
              ))}
            </div>
          </div>

          {/* AI Extract */}
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
                          <p className="text-muted-foreground truncate">→ {item.parentTaskTitle}</p>
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
