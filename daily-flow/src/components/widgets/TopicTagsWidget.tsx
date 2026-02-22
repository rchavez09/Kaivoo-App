import { Hash, Tag } from 'lucide-react';
import { JournalEntry, Capture, Task } from '@/types';
import { cn } from '@/lib/utils';

interface TopicTagsWidgetProps {
  tags: string[];
  topicName: string;
  entries: JournalEntry[];
  captures: Capture[];
  tasks: Task[];
  selectedTag: string | null;
  onTagSelect: (tag: string | null) => void;
}

const TopicTagsWidget = ({ 
  tags, 
  topicName, 
  entries, 
  captures, 
  tasks, 
  selectedTag, 
  onTagSelect 
}: TopicTagsWidgetProps) => {
  // Count items within this topic/page that have each tag
  const tagStats = tags.map(tag => {
    const tagLower = tag.toLowerCase();
    const entryCount = entries.filter(e => 
      e.tags.some(t => t.toLowerCase() === tagLower)
    ).length;
    const captureCount = captures.filter(c => 
      c.tags.some(t => t.toLowerCase() === tagLower)
    ).length;
    const taskCount = tasks.filter(t => 
      t.tags.some(tg => tg.toLowerCase() === tagLower)
    ).length;
    
    return {
      name: tag,
      count: entryCount + captureCount + taskCount,
    };
  }).sort((a, b) => b.count - a.count);

  const handleTagClick = (tagName: string) => {
    if (selectedTag === tagName) {
      onTagSelect(null); // Deselect if already selected
    } else {
      onTagSelect(tagName);
    }
  };

  return (
    <div className="widget-card animate-fade-in" style={{ animationDelay: '0.1s' }}>
      <div className="widget-header">
        <div className="flex items-center gap-2">
          <Tag className="w-4 h-4 text-primary" />
          <span className="widget-title">Tags</span>
          <span className="text-xs text-muted-foreground font-normal ml-1">
            {tags.length} tag{tags.length !== 1 ? 's' : ''}
          </span>
        </div>
        {selectedTag && (
          <button 
            onClick={() => onTagSelect(null)}
            className="text-xs text-primary hover:underline"
          >
            Clear filter
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {tagStats.map(({ name, count }) => (
          <button
            key={name}
            onClick={() => handleTagClick(name)}
            className={cn(
              "tag-chip group cursor-pointer transition-all",
              selectedTag === name && "ring-2 ring-primary ring-offset-2 ring-offset-background"
            )}
          >
            <Hash className="w-3 h-3" />
            <span>{name}</span>
            <span className="text-[10px] opacity-60 ml-1">
              {count}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default TopicTagsWidget;
