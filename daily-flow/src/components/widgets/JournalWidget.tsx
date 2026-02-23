import { useState, useRef, useCallback } from 'react';
import { BookOpen, ChevronRight, Hash, FileText, ListTodo, X, Send, FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useKaivooStore } from '@/stores/useKaivooStore';
import { useKaivooActions } from '@/hooks/useKaivooActions';
import { toast } from 'sonner';
import { format } from 'date-fns';
import TopicPagePicker from '@/components/TopicPagePicker';

interface ParsedChip {
  type: 'tag' | 'topic';
  value: string;
  start: number;
  end: number;
}

interface JournalWidgetProps {
  onEntrySaved?: () => void;
}

const JournalWidget = ({ onEntrySaved }: JournalWidgetProps) => {
  const [content, setContent] = useState('');
  const [chips, setChips] = useState<ParsedChip[]>([]);
  const [selectedText, setSelectedText] = useState('');
  const [showTaskAction, setShowTaskAction] = useState(false);
  const [showTopicPicker, setShowTopicPicker] = useState(false);
  const [pickerPosition, setPickerPosition] = useState({ top: 0, left: 0 });
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const resolveTopicPath = useKaivooStore(s => s.resolveTopicPath);
  const getTopicPath = useKaivooStore(s => s.getTopicPath);
  const { addTask, addJournalEntry, resolveTopicPathAsync } = useKaivooActions();

  const today = new Date();
  const formattedDate = today.toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'long', 
    day: 'numeric' 
  });

  // Parse content for #tags and [[Topic]] or [[Topic/Page]]
  const parseContent = useCallback((text: string) => {
    const parsed: ParsedChip[] = [];
    
    // Match #tags (word characters after #)
    const tagRegex = /#(\w+)/g;
    let match;
    while ((match = tagRegex.exec(text)) !== null) {
      parsed.push({
        type: 'tag',
        value: match[1],
        start: match.index,
        end: match.index + match[0].length
      });
    }
    
    // Match [[topics]] or [[Topic/Page]] paths
    const topicRegex = /\[\[([^\]]+)\]\]/g;
    while ((match = topicRegex.exec(text)) !== null) {
      parsed.push({
        type: 'topic',
        value: match[1], // This can be "Topic" or "Topic/Page" or "Topic/Page/Sub"
        start: match.index,
        end: match.index + match[0].length
      });
    }
    
    setChips(parsed);
  }, []);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
    parseContent(newContent);
  };

  const handleTextSelect = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    const selected = textarea.value.substring(textarea.selectionStart, textarea.selectionEnd).trim();
    if (selected.length > 0) {
      setSelectedText(selected);
      setShowTaskAction(true);
    } else {
      setShowTaskAction(false);
    }
  };

  const insertTag = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    const pos = textarea.selectionStart;
    const before = content.substring(0, pos);
    const after = content.substring(pos);
    const newContent = `${before}#${after}`;
    setContent(newContent);
    parseContent(newContent);
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(pos + 1, pos + 1);
    }, 0);
  };

  const insertTopic = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    // Show the topic picker
    const rect = textarea.getBoundingClientRect();
    const containerRect = containerRef.current?.getBoundingClientRect();
    
    if (containerRect) {
      setPickerPosition({
        top: rect.bottom - containerRect.top + 4,
        left: 0
      });
    }
    
    setShowTopicPicker(true);
  };

  const handleTopicSelect = (path: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    const pos = textarea.selectionStart;
    const before = content.substring(0, pos);
    const after = content.substring(pos);
    const newContent = `${before}[[${path}]]${after}`;
    setContent(newContent);
    parseContent(newContent);
    setShowTopicPicker(false);
    
    setTimeout(() => {
      textarea.focus();
      const newPos = pos + path.length + 4; // [[path]]
      textarea.setSelectionRange(newPos, newPos);
    }, 0);
  };

  const insertTopicManually = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    const pos = textarea.selectionStart;
    const before = content.substring(0, pos);
    const after = content.substring(pos);
    const newContent = `${before}[[]]${after}`;
    setContent(newContent);
    parseContent(newContent);
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(pos + 2, pos + 2);
    }, 0);
  };

  const createTaskFromSelection = () => {
    const uniqueTopics = [...new Set(chips.filter(c => c.type === 'topic').map(c => c.value))];
    const topicIds = uniqueTopics
      .map(path => resolveTopicPath(path, false))
      .filter(Boolean)
      .flat() as string[];

    const uniqueTags = [...new Set(chips.filter(c => c.type === 'tag').map(c => c.value.toLowerCase()))];

    addTask({
      title: selectedText,
      status: 'todo',
      priority: 'medium',
      tags: uniqueTags,
      topicIds,
      subtasks: [],
    });

    toast.success('Task created', {
      description: selectedText,
    });

    setShowTaskAction(false);
    setSelectedText('');
  };

  const saveEntry = async () => {
    if (!content.trim()) return;

    const uniqueTopicPaths = [...new Set(chips.filter(c => c.type === 'topic').map(c => c.value))];
    const uniqueTags = [...new Set(chips.filter(c => c.type === 'tag').map(c => c.value.toLowerCase()))];

    // Resolve topic paths to IDs using async resolver (creates in DB when logged in)
    const topicIdArrays = await Promise.all(
      uniqueTopicPaths.map(path => resolveTopicPathAsync(path, true))
    );
    const topicIds = topicIdArrays.filter(Boolean).flat() as string[];

    try {
      await addJournalEntry({
        content: content.trim(),
        date: format(today, 'yyyy-MM-dd'),
        tags: uniqueTags,
        topicIds,
      });

      toast.success('Entry saved', {
        description: `Added to today's journal at ${format(new Date(), 'h:mm a')}`,
      });

      setContent('');
      setChips([]);
      onEntrySaved?.();
    } catch (e) {
      console.error('Failed to save entry:', e);
      toast.error('Failed to save entry', {
        description: 'Please try again',
      });
    }
  };

  const removeChip = (chipToRemove: ParsedChip) => {
    const before = content.substring(0, chipToRemove.start);
    const after = content.substring(chipToRemove.end);
    const newContent = before + after;
    setContent(newContent);
    parseContent(newContent);
  };

  const uniqueTags = [...new Set(chips.filter(c => c.type === 'tag').map(c => c.value))];
  const uniqueTopics = [...new Set(chips.filter(c => c.type === 'topic').map(c => c.value))];

  // Check if a topic path exists
  const topicExists = (path: string) => {
    return resolveTopicPath(path, false) !== null;
  };

  return (
    <div ref={containerRef} className="widget-card animate-fade-in relative">
      <div className="widget-header">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-primary" />
          <span className="widget-title">Journal</span>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-muted-foreground hover:text-foreground h-8 px-2"
        >
          <span className="text-xs">View all</span>
          <ChevronRight className="w-3 h-3 ml-1" />
        </Button>
      </div>

      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">{formattedDate}</p>
        
        <div className="relative">
          <textarea
            ref={textareaRef}
            placeholder="What's on your mind? Use #tags or [[Topic/Page]] to organize..."
            value={content}
            onChange={handleContentChange}
            onSelect={handleTextSelect}
            onBlur={() => setTimeout(() => setShowTaskAction(false), 200)}
            className="w-full min-h-[120px] resize-none border-none bg-secondary/50 rounded-lg p-3 focus:outline-none focus:ring-1 focus:ring-primary/30 placeholder:text-muted-foreground/60 font-serif text-base leading-relaxed"
          />
          
          {/* Floating task action */}
          {showTaskAction && selectedText && (
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-popover border border-border shadow-lg rounded-lg px-2 py-1.5 flex items-center gap-1 animate-fade-in">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs gap-1.5"
                onClick={createTaskFromSelection}
              >
                <ListTodo className="w-3 h-3" />
                Create Task
              </Button>
            </div>
          )}
        </div>

        {/* Topic picker dropdown */}
        {showTopicPicker && (
          <TopicPagePicker
            onSelect={handleTopicSelect}
            onClose={() => setShowTopicPicker(false)}
            position={pickerPosition}
          />
        )}

        {/* Detected chips */}
        {(uniqueTags.length > 0 || uniqueTopics.length > 0) && (
          <div className="flex flex-wrap gap-1.5">
            {uniqueTags.map((tag) => (
              <span 
                key={`tag-${tag}`} 
                className="tag-chip group"
              >
                <Hash className="w-3 h-3" />
                {tag}
                <button 
                  onClick={() => removeChip(chips.find(c => c.type === 'tag' && c.value === tag)!)}
                  className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            {uniqueTopics.map((topicPath) => {
              const exists = topicExists(topicPath);
              const isPage = topicPath.includes('/');
              return (
                <span 
                  key={`topic-${topicPath}`} 
                  className={`topic-chip group ${!exists ? 'opacity-60' : ''}`}
                  title={!exists ? 'Will be created on save' : topicPath}
                >
                  {isPage ? <FileText className="w-3 h-3" /> : <FolderOpen className="w-3 h-3" />}
                  {topicPath}
                  {!exists && <span className="text-[10px] ml-0.5">+</span>}
                  <button 
                    onClick={() => removeChip(chips.find(c => c.type === 'topic' && c.value === topicPath)!)}
                    className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              );
            })}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="h-7 text-xs gap-1.5 text-muted-foreground hover:text-foreground"
              onClick={insertTopic}
            >
              <FolderOpen className="w-3 h-3" />
              Add Topic
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="h-7 text-xs gap-1.5 text-muted-foreground hover:text-foreground"
              onClick={insertTag}
            >
              <Hash className="w-3 h-3" />
              Add Tag
            </Button>
          </div>
          
          {content.trim() && (
            <Button 
              size="sm" 
              className="h-7 text-xs gap-1.5"
              onClick={saveEntry}
            >
              <Send className="w-3 h-3" />
              Save
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default JournalWidget;
