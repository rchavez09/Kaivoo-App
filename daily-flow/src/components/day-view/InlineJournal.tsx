import { memo, useState, useCallback } from 'react';
import { BookOpen, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useKaivooActions } from '@/hooks/useKaivooActions';
import type { JournalEntry } from '@/types';

interface InlineJournalProps {
  dateStr: string;
  entries: JournalEntry[];
  onEditEntry?: (entry: JournalEntry) => void;
}

const InlineJournal = memo(({ dateStr, entries, onEditEntry }: InlineJournalProps) => {
  const { addJournalEntry } = useKaivooActions();
  const [composing, setComposing] = useState(false);
  const [content, setContent] = useState('');

  const handleSave = useCallback(async () => {
    const text = content.trim();
    if (!text) return;
    await addJournalEntry({
      date: dateStr,
      content: `<p>${text}</p>`,
      tags: [],
      topicIds: [],
    });
    setContent('');
    setComposing(false);
  }, [content, dateStr, addJournalEntry]);

  return (
    <div className="widget-card" aria-live="polite">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="widget-title">Notes</h3>
        {!composing && (
          <Button variant="ghost" size="sm" onClick={() => setComposing(true)} className="h-7 gap-1 text-xs">
            <Plus className="h-3 w-3" /> Write
          </Button>
        )}
      </div>

      {/* Composer */}
      {composing && (
        <div className="mb-4">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind..."
            className="mb-2 min-h-[80px] text-sm"
            autoFocus
          />
          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setComposing(false);
                setContent('');
              }}
            >
              Cancel
            </Button>
            <Button size="sm" onClick={handleSave} disabled={!content.trim()}>
              Save
            </Button>
          </div>
        </div>
      )}

      {/* Entry list */}
      {entries.length === 0 && !composing && (
        <p className="py-4 text-center text-xs text-muted-foreground">No notes yet</p>
      )}
      <div className="space-y-2">
        {entries.map((entry) => (
          <button
            key={entry.id}
            onClick={() => onEditEntry?.(entry)}
            className="group w-full rounded-lg p-2 text-left transition-colors hover:bg-accent/10"
          >
            <div className="mb-1 flex items-center gap-2">
              <BookOpen className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">{format(new Date(entry.createdAt), 'h:mm a')}</span>
              {entry.moodScore && (
                <span className="text-xs">{['', '😔', '😐', '🙂', '😊', '🤩'][entry.moodScore]}</span>
              )}
            </div>
            <p className="line-clamp-2 text-sm text-foreground">
              {entry.content
                .replace(/<[^>]*>/g, ' ')
                .replace(/\s+/g, ' ')
                .trim()}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
});
InlineJournal.displayName = 'InlineJournal';

export default InlineJournal;
