import { memo, useState, useCallback } from 'react';
import { Inbox, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useKaivooActions } from '@/hooks/useKaivooActions';
import type { Capture } from '@/types';

interface CapturesListProps {
  dateStr: string;
  captures: Capture[];
  onEditCapture?: (capture: Capture) => void;
}

const CapturesList = memo(({ dateStr, captures, onEditCapture }: CapturesListProps) => {
  const { addCapture } = useKaivooActions();
  const [newCapture, setNewCapture] = useState('');

  const handleAdd = useCallback(async () => {
    const text = newCapture.trim();
    if (!text) return;
    await addCapture({
      content: text,
      source: 'quick',
      date: dateStr,
      tags: [],
      topicIds: [],
    });
    setNewCapture('');
  }, [newCapture, dateStr, addCapture]);

  return (
    <div className="widget-card">
      <h3 className="widget-title mb-3">Captures</h3>

      {/* Quick capture input */}
      <div className="mb-3 flex gap-2">
        <Input
          value={newCapture}
          onChange={(e) => setNewCapture(e.target.value)}
          placeholder="Quick capture..."
          className="h-8 text-sm"
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
        />
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8 shrink-0"
          onClick={handleAdd}
          disabled={!newCapture.trim()}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Captures list */}
      {captures.length === 0 && <p className="py-3 text-center text-xs text-muted-foreground">No captures today</p>}
      <div className="space-y-1">
        {captures.map((c) => (
          <button
            key={c.id}
            onClick={() => onEditCapture?.(c)}
            className="flex w-full items-start gap-2 rounded-lg p-2 text-left transition-colors hover:bg-accent/10"
          >
            <Inbox className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm">{c.content}</p>
              <span className="text-xs text-muted-foreground">{format(new Date(c.createdAt), 'h:mm a')}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
});
CapturesList.displayName = 'CapturesList';

export default CapturesList;
