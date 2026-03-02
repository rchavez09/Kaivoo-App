import { useState } from 'react';
import { BookOpen, Calendar, Hash, Clock, Globe, Pencil } from 'lucide-react';
import { JournalEntry, Capture } from '@/types';
import { format } from 'date-fns';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Button } from '@/components/ui/button';
import CaptureEditDialog from '@/components/CaptureEditDialog';
import { useKaivooStore } from '@/stores/useKaivooStore';

interface TopicCapturesWidgetProps {
  entries: JournalEntry[];
  captures?: Capture[];
  topicName: string;
  selectedTag?: string | null;
}

const TopicCapturesWidget = ({ entries, captures = [], topicName, selectedTag }: TopicCapturesWidgetProps) => {
  const updateCapture = useKaivooStore((s) => s.updateCapture);
  const [editingCapture, setEditingCapture] = useState<Capture | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return format(d, 'MMM d, yyyy');
  };

  const formatTime = (date: Date | string) => {
    const d = new Date(date);
    return format(d, 'h:mm a');
  };

  // Combine entries and captures, sorted by date
  let allItems = [
    ...entries.map((e) => ({ ...e, type: 'entry' as const, sortDate: new Date(e.timestamp) })),
    ...captures.map((c) => ({ ...c, type: 'capture' as const, sortDate: new Date(c.createdAt) })),
  ].sort((a, b) => b.sortDate.getTime() - a.sortDate.getTime());

  // Filter by selected tag if any
  if (selectedTag) {
    const tagLower = selectedTag.toLowerCase();
    allItems = allItems.filter((item) => item.tags.some((t) => t.toLowerCase() === tagLower));
  }

  const totalCount = allItems.length;

  // Check if content is markdown (has headers, lists, bold, etc.)
  const isMarkdown = (content: string) => {
    return /^#+ |^\*\*|^- |^\d+\. |^> /m.test(content);
  };

  // Check if content is long enough to need expansion
  const isLongContent = (content: string) => {
    return content.length > 300 || content.split('\n').length > 5;
  };

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleCaptureClick = (item: (typeof allItems)[0]) => {
    if (item.type === 'capture') {
      // Convert back to Capture type for the dialog
      const capture: Capture = {
        id: item.id,
        content: item.content,
        source: item.source,
        sourceId: item.sourceId,
        date: item.date,
        tags: item.tags,
        topicIds: item.topicIds,
        createdAt: item.createdAt,
      };
      setEditingCapture(capture);
    }
  };

  const handleCaptureSave = (updatedCapture: Capture) => {
    updateCapture(updatedCapture.id, updatedCapture);
  };

  return (
    <div className="widget-card animate-fade-in">
      <div className="widget-header">
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-primary" />
          <span className="widget-title">Mentions</span>
          <span className="ml-1 text-xs font-normal text-muted-foreground">
            {totalCount} item{totalCount !== 1 ? 's' : ''}
            {selectedTag && <span className="ml-1 text-primary">(filtered by #{selectedTag})</span>}
          </span>
        </div>
      </div>

      {totalCount > 0 ? (
        <div className="space-y-3">
          {allItems.map((item) => {
            const isExpanded = expandedIds.has(item.id);
            const needsExpansion = isLongContent(item.content);
            const isCapture = item.type === 'capture';

            return (
              <div
                key={item.id}
                className={`rounded-lg bg-secondary/30 p-3 transition-colors hover:bg-secondary/50 ${isCapture ? 'cursor-pointer' : ''}`}
                onClick={() => isCapture && handleCaptureClick(item)}
              >
                <div className="flex items-start gap-3">
                  {item.type === 'capture' ? (
                    <Globe className="mt-0.5 h-4 w-4 flex-shrink-0 text-info-foreground" />
                  ) : (
                    <BookOpen className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground" />
                  )}
                  <div className="min-w-0 flex-1">
                    {isMarkdown(item.content) ? (
                      <div
                        className={`prose prose-sm dark:prose-invert prose-headings:font-semibold prose-headings:text-foreground prose-headings:mt-3 prose-headings:mb-2 prose-h1:text-lg prose-h2:text-base prose-h3:text-sm prose-p:my-1.5 prose-ul:my-1.5 prose-ol:my-1.5 prose-li:my-0.5 prose-strong:text-foreground prose-strong:font-semibold prose-a:text-primary prose-a:no-underline hover:prose-a:underline max-w-none text-sm leading-relaxed text-foreground [&>*:first-child]:mt-0 ${!isExpanded && needsExpansion ? 'relative max-h-32 overflow-hidden' : ''}`}
                      >
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{item.content}</ReactMarkdown>
                        {!isExpanded && needsExpansion && (
                          <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-secondary/30 to-transparent" />
                        )}
                      </div>
                    ) : (
                      <p
                        className={`text-sm leading-relaxed text-foreground ${!isExpanded && needsExpansion ? 'line-clamp-4' : ''}`}
                      >
                        {item.content}
                      </p>
                    )}

                    {needsExpansion && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-1 h-6 px-2 text-xs text-primary"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleExpand(item.id);
                        }}
                      >
                        {isExpanded ? 'Show less' : 'Read more'}
                      </Button>
                    )}

                    <div className="mt-2 flex flex-wrap items-center gap-3">
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {formatDate(item.type === 'entry' ? item.timestamp : item.createdAt)}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {formatTime(item.type === 'entry' ? item.timestamp : item.createdAt)}
                      </span>

                      {item.tags.length > 0 && (
                        <div className="flex items-center gap-1">
                          {item.tags.map((tag) => (
                            <span
                              key={tag}
                              className="flex items-center gap-0.5 rounded bg-primary/10 px-1.5 py-0.5 text-xs text-primary"
                            >
                              <Hash className="h-2.5 w-2.5" />
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {isCapture && (
                        <span className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
                          <Pencil className="h-3 w-3" />
                          Click to edit
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-8 text-center">
          <BookOpen className="mx-auto mb-3 h-10 w-10 text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground">
            {selectedTag
              ? `No mentions with #${selectedTag} tag.`
              : `No mentions yet. Use [[${topicName}]] in your journal to add content here.`}
          </p>
        </div>
      )}

      {/* Capture Edit Dialog */}
      <CaptureEditDialog
        capture={editingCapture}
        open={!!editingCapture}
        onOpenChange={(open) => !open && setEditingCapture(null)}
        onSave={handleCaptureSave}
      />
    </div>
  );
};

export default TopicCapturesWidget;
