import { useState, useEffect, useRef, useCallback } from 'react';
import { format } from 'date-fns';
import { Hash, FileText, X, Save, FolderOpen, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Capture } from '@/types';
import { useKaivooStore } from '@/stores/useKaivooStore';
import { toast } from 'sonner';

interface ParsedChip {
  type: 'tag' | 'topic';
  value: string;
  start: number;
  end: number;
}

interface CaptureEditDialogProps {
  capture: Capture | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (capture: Capture) => void;
}

const CaptureEditDialog = ({ capture, open, onOpenChange, onSave }: CaptureEditDialogProps) => {
  const [content, setContent] = useState('');
  const [chips, setChips] = useState<ParsedChip[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const resolveTopicPath = useKaivooStore(s => s.resolveTopicPath);

  useEffect(() => {
    if (capture) {
      setContent(capture.content);
      parseContent(capture.content);
    }
  }, [capture]);

  const parseContent = useCallback((text: string) => {
    const parsed: ParsedChip[] = [];
    
    // Match #tags
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
    
    // Match [[Topic]] or [[Topic/Page]] paths
    const topicRegex = /\[\[([^\]]+)\]\]/g;
    while ((match = topicRegex.exec(text)) !== null) {
      parsed.push({
        type: 'topic',
        value: match[1],
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

  const handleSave = () => {
    if (!capture || !content.trim()) return;

    const uniqueTopicPaths = [...new Set(chips.filter(c => c.type === 'topic').map(c => c.value))];
    const uniqueTags = [...new Set(chips.filter(c => c.type === 'tag').map(c => c.value.toLowerCase()))];

    // Resolve topic paths to IDs, auto-creating if needed. Flatten since each path returns [topicId] or [topicId, pageId]
    const topicIds = uniqueTopicPaths
      .map(path => resolveTopicPath(path, true))
      .filter(Boolean)
      .flat() as string[];

    const updatedCapture: Capture = {
      ...capture,
      content: content.trim(),
      tags: uniqueTags,
      topicIds,
    };

    onSave(updatedCapture);
    toast.success('Capture updated');
    onOpenChange(false);
  };

  const uniqueTags = [...new Set(chips.filter(c => c.type === 'tag').map(c => c.value))];
  const uniqueTopics = [...new Set(chips.filter(c => c.type === 'topic').map(c => c.value))];

  // Check if a topic path exists
  const topicExists = (path: string) => {
    return resolveTopicPath(path, false) !== null;
  };

  const getSourceLabel = (source: string) => {
    switch (source) {
      case 'video': return 'Video Capture';
      case 'quick': return 'AI Note';
      default: return 'AI Capture';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              Edit Capture
            </span>
            {capture && (
              <span className="text-sm font-normal text-muted-foreground">
                {getSourceLabel(capture.source)} • {format(capture.createdAt, 'MMM d, h:mm a')}
              </span>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={handleContentChange}
            className="w-full min-h-[200px] resize-none border-none bg-secondary/50 rounded-lg p-3 focus:outline-none focus:ring-1 focus:ring-primary/30 placeholder:text-muted-foreground/60 text-sm leading-relaxed"
            placeholder="Edit your capture... Use #tags or [[Topic/Page]]"
          />

          {(uniqueTags.length > 0 || uniqueTopics.length > 0) && (
            <div className="flex flex-wrap gap-1.5">
              {uniqueTags.map((tag) => (
                <span 
                  key={tag} 
                  className="tag-chip text-xs py-0.5 px-2"
                >
                  <Hash className="w-3 h-3" />
                  {tag}
                </span>
              ))}
              {uniqueTopics.map((topic) => {
                const exists = topicExists(topic);
                const isPage = topic.includes('/');
                return (
                  <span 
                    key={topic} 
                    className={`topic-chip text-xs py-0.5 px-2 ${!exists ? 'border-dashed opacity-70' : ''}`}
                  >
                    {isPage ? <FileText className="w-3 h-3" /> : <FolderOpen className="w-3 h-3" />}
                    {topic}
                    {!exists && <span className="text-[10px] ml-1">(new)</span>}
                  </span>
                );
              })}
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              <X className="w-4 h-4 mr-1" />
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!content.trim()}>
              <Save className="w-4 h-4 mr-1" />
              Save
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CaptureEditDialog;
