import { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import { Hash, FileText, X, Save, FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import RichTextEditor from '@/components/journal/RichTextEditor';
import { JournalEntry } from '@/types';
import { useKaivooStore } from '@/stores/useKaivooStore';
import { useAdapters } from '@/lib/adapters/provider';
import { toast } from 'sonner';

interface ParsedChip {
  type: 'tag' | 'topic';
  value: string;
  start: number;
  end: number;
}

interface JournalEntryDialogProps {
  entry: JournalEntry | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (entry: JournalEntry) => void;
}

const JournalEntryDialog = ({ entry, open, onOpenChange, onSave }: JournalEntryDialogProps) => {
  const [content, setContent] = useState('');
  const [chips, setChips] = useState<ParsedChip[]>([]);
  const resolveTopicPath = useKaivooStore((s) => s.resolveTopicPath);
  const { attachments } = useAdapters();

  const handleImageUpload = useCallback(
    async (file: File): Promise<string> => {
      if (!entry?.id) throw new Error('No entry ID');
      const info = await attachments.uploadFile(entry.id, file);
      return attachments.getFileUrl(entry.id, info.name);
    },
    [entry?.id, attachments],
  );

  useEffect(() => {
    if (entry) {
      setContent(entry.content);
      parseContent(entry.content);
    }
  }, [entry]);

  const parseContent = useCallback((html: string) => {
    // Strip HTML for parsing tags/topics
    const text = html.replace(/<[^>]*>/g, ' ');
    const parsed: ParsedChip[] = [];

    // Match #tags
    const tagRegex = /#(\w+)/g;
    let match;
    while ((match = tagRegex.exec(text)) !== null) {
      parsed.push({
        type: 'tag',
        value: match[1],
        start: match.index,
        end: match.index + match[0].length,
      });
    }

    // Match [[Topic]] or [[Topic/Page]] paths
    const topicRegex = /\[\[([^\]]+)\]\]/g;
    while ((match = topicRegex.exec(text)) !== null) {
      parsed.push({
        type: 'topic',
        value: match[1],
        start: match.index,
        end: match.index + match[0].length,
      });
    }

    setChips(parsed);
  }, []);

  const handleContentChange = (html: string) => {
    setContent(html);
    parseContent(html);
  };

  const handleSave = () => {
    if (!entry || !content.trim()) return;

    const uniqueTopicPaths = [...new Set(chips.filter((c) => c.type === 'topic').map((c) => c.value))];
    const uniqueTags = [...new Set(chips.filter((c) => c.type === 'tag').map((c) => c.value.toLowerCase()))];

    // Resolve topic paths to IDs, auto-creating if needed. Flatten since each path returns [topicId] or [topicId, pageId]
    const topicIds = uniqueTopicPaths
      .map((path) => resolveTopicPath(path, true))
      .filter(Boolean)
      .flat() as string[];

    const updatedEntry: JournalEntry = {
      ...entry,
      content: content.trim(),
      tags: uniqueTags,
      topicIds,
      updatedAt: new Date(),
    };

    onSave(updatedEntry);
    toast.success('Entry updated');
    onOpenChange(false);
  };

  const uniqueTags = [...new Set(chips.filter((c) => c.type === 'tag').map((c) => c.value))];
  const uniqueTopics = [...new Set(chips.filter((c) => c.type === 'topic').map((c) => c.value))];

  // Check if a topic path exists
  const topicExists = (path: string) => {
    return resolveTopicPath(path, false) !== null;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Edit Entry</span>
            {entry && (
              <span className="text-sm font-normal text-muted-foreground">
                {format(new Date(entry.timestamp), 'MMM d, h:mm a')}
              </span>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <RichTextEditor
            content={content}
            onChange={handleContentChange}
            placeholder="Write your thoughts... Use #tags or [[Topic/Page]]"
            className="min-h-[200px]"
            onImageUpload={entry ? handleImageUpload : undefined}
          />

          {(uniqueTags.length > 0 || uniqueTopics.length > 0) && (
            <div className="flex flex-wrap gap-1.5">
              {uniqueTags.map((tag) => (
                <span key={`tag-${tag}`} className="tag-chip">
                  <Hash className="h-3 w-3" />
                  {tag}
                </span>
              ))}
              {uniqueTopics.map((topicPath) => {
                const exists = topicExists(topicPath);
                const isPage = topicPath.includes('/');
                return (
                  <span
                    key={`topic-${topicPath}`}
                    className={`topic-chip ${!exists ? 'opacity-60' : ''}`}
                    title={!exists ? 'Will be created on save' : topicPath}
                  >
                    {isPage ? <FileText className="h-3 w-3" /> : <FolderOpen className="h-3 w-3" />}
                    {topicPath}
                    {!exists && <span className="ml-0.5 text-[10px]">+</span>}
                  </span>
                );
              })}
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} className="gap-2">
              <Save className="h-4 w-4" />
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default JournalEntryDialog;
