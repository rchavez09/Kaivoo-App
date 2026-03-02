import { useState } from 'react';
import { format } from 'date-fns';
import { Clock, Edit3, ChevronDown, ChevronUp, Hash, FileText, FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { JournalEntry } from '@/types';
import { useKaivooStore } from '@/stores/useKaivooStore';

interface JournalTimelineWidgetProps {
  entries: JournalEntry[];
  onEdit: (entry: JournalEntry) => void;
}

const JournalTimelineWidget = ({ entries, onEdit }: JournalTimelineWidgetProps) => {
  const [expanded, setExpanded] = useState(true);
  const getTopicPath = useKaivooStore((s) => s.getTopicPath);

  if (entries.length === 0) {
    return null;
  }

  // Sort by timestamp descending (newest first)
  const sortedEntries = [...entries].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <div className="widget-card animate-fade-in">
      <div className="widget-header">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-primary" />
          <span className="widget-title">Today's Entries</span>
          <span className="text-xs text-muted-foreground">({entries.length})</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-2"
          onClick={() => setExpanded(!expanded)}
          aria-label={expanded ? 'Collapse note entries' : 'Expand note entries'}
        >
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </div>

      {expanded && (
        <div className="relative space-y-3">
          {/* Timeline line */}
          <div className="absolute bottom-3 left-[11px] top-3 w-px bg-border" />

          {sortedEntries.map((entry) => (
            <div key={entry.id} className="group relative flex gap-3">
              {/* Timeline dot */}
              <div className="z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-primary/30 bg-secondary">
                <div className="h-2 w-2 rounded-full bg-primary" />
              </div>

              {/* Entry card */}
              <div
                className="flex-1 cursor-pointer rounded-lg bg-secondary/30 p-3 transition-colors hover:bg-secondary/50"
                onClick={() => onEdit(entry)}
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{format(new Date(entry.timestamp), 'h:mm a')}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 opacity-0 transition-opacity group-hover:opacity-100"
                    aria-label="Edit note entry"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(entry);
                    }}
                  >
                    <Edit3 className="h-3 w-3" />
                  </Button>
                </div>

                <p className="line-clamp-3 font-serif text-sm leading-relaxed text-foreground">
                  {entry.content
                    .replace(/<[^>]*>/g, ' ')
                    .replace(/\s+/g, ' ')
                    .trim()}
                </p>

                {/* Tags and topics */}
                {(entry.tags.length > 0 || entry.topicIds.length > 0) && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {entry.tags.map((tag) => (
                      <span key={tag} className="tag-chip px-1.5 py-0.5 text-[10px]">
                        <Hash className="h-2.5 w-2.5" />
                        {tag}
                      </span>
                    ))}
                    {entry.topicIds.map((topicId) => {
                      const path = getTopicPath(topicId);
                      if (!path) return null;
                      const isPage = path.includes('/');
                      return (
                        <span key={topicId} className="topic-chip px-1.5 py-0.5 text-[10px]">
                          {isPage ? <FileText className="h-2.5 w-2.5" /> : <FolderOpen className="h-2.5 w-2.5" />}
                          {path}
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default JournalTimelineWidget;
