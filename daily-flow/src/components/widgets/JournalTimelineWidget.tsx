import { useState } from 'react';
import { format } from 'date-fns';
import { Clock, Edit3, ChevronDown, ChevronUp, Hash, FileText, FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { JournalEntry } from '@/types';
import { cn } from '@/lib/utils';
import { useKaivooStore } from '@/stores/useKaivooStore';

interface JournalTimelineWidgetProps {
  entries: JournalEntry[];
  onEdit: (entry: JournalEntry) => void;
}

const JournalTimelineWidget = ({ entries, onEdit }: JournalTimelineWidgetProps) => {
  const [expanded, setExpanded] = useState(true);
  const getTopicPath = useKaivooStore(s => s.getTopicPath);

  if (entries.length === 0) {
    return null;
  }

  // Sort by timestamp descending (newest first)
  const sortedEntries = [...entries].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <div className="widget-card animate-fade-in">
      <div className="widget-header">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-primary" />
          <span className="widget-title">Today's Entries</span>
          <span className="text-xs text-muted-foreground">({entries.length})</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-2"
          onClick={() => setExpanded(!expanded)}
          aria-label={expanded ? "Collapse journal entries" : "Expand journal entries"}
        >
          {expanded ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </Button>
      </div>

      {expanded && (
        <div className="space-y-3 relative">
          {/* Timeline line */}
          <div className="absolute left-[11px] top-3 bottom-3 w-px bg-border" />

          {sortedEntries.map((entry) => (
            <div key={entry.id} className="flex gap-3 relative group">
              {/* Timeline dot */}
              <div className="w-6 h-6 rounded-full bg-secondary border-2 border-primary/30 flex items-center justify-center shrink-0 z-10">
                <div className="w-2 h-2 rounded-full bg-primary" />
              </div>

              {/* Entry card */}
              <div 
                className="flex-1 bg-secondary/30 rounded-lg p-3 hover:bg-secondary/50 transition-colors cursor-pointer"
                onClick={() => onEdit(entry)}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(entry.timestamp), 'h:mm a')}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Edit journal entry"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(entry);
                    }}
                  >
                    <Edit3 className="w-3 h-3" />
                  </Button>
                </div>
                
                <p className="text-sm text-foreground line-clamp-3 font-serif leading-relaxed">
                  {entry.content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()}
                </p>

                {/* Tags and topics */}
                {(entry.tags.length > 0 || entry.topicIds.length > 0) && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {entry.tags.map((tag) => (
                      <span key={tag} className="tag-chip text-[10px] py-0.5 px-1.5">
                        <Hash className="w-2.5 h-2.5" />
                        {tag}
                      </span>
                    ))}
                    {entry.topicIds.map((topicId) => {
                      const path = getTopicPath(topicId);
                      if (!path) return null;
                      const isPage = path.includes('/');
                      return (
                        <span key={topicId} className="topic-chip text-[10px] py-0.5 px-1.5">
                          {isPage ? <FileText className="w-2.5 h-2.5" /> : <FolderOpen className="w-2.5 h-2.5" />}
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
