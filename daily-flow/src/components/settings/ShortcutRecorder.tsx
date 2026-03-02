import { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { eventToBinding, isReservedShortcut, IS_MAC } from '@/hooks/useShortcuts';
import type { KeyBinding } from '@/hooks/useShortcuts';

interface ShortcutRecorderProps {
  shortcutId: string;
  currentBinding: KeyBinding;
  onSave: (binding: KeyBinding) => void;
  onCancel: () => void;
  findConflict: (binding: string, excludeId: string) => string | null;
}

export default function ShortcutRecorder({
  shortcutId,
  currentBinding,
  onSave,
  onCancel,
  findConflict,
}: ShortcutRecorderProps) {
  const [captured, setCaptured] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();

      // Escape cancels recording
      if (e.key === 'Escape') {
        onCancel();
        return;
      }

      const binding = eventToBinding(e);
      // Ignore bare modifier presses (empty string returned)
      if (!binding) return;

      // Check reserved
      if (isReservedShortcut(binding)) {
        toast.error('This shortcut is reserved by the browser');
        return;
      }

      // Check conflicts with other Kaivoo shortcuts
      const conflict = findConflict(binding, shortcutId);
      if (conflict) {
        toast.error(`Already used by "${conflict}"`);
        return;
      }

      setCaptured(binding);
    },
    [shortcutId, findConflict, onCancel],
  );

  // Attach in capture phase so AppLayout doesn't also fire
  useEffect(() => {
    const handler = (e: KeyboardEvent) => handleKeyDown(e);
    document.addEventListener('keydown', handler, true);
    return () => document.removeEventListener('keydown', handler, true);
  }, [handleKeyDown]);

  const handleSave = useCallback(() => {
    if (!captured) return;

    // Build binding for both platforms.
    // The user records on their current platform — we store it for that platform
    // and keep the other platform's binding as-is.
    const updated: KeyBinding = IS_MAC
      ? { mac: captured, pc: currentBinding.pc }
      : { mac: currentBinding.mac, pc: captured };

    onSave(updated);
  }, [captured, currentBinding, onSave]);

  // Pretty-print for display
  const displayBinding = captured ? (IS_MAC ? captured.replace(/\+/g, ' ') : captured) : null;

  return (
    <div ref={containerRef} className="flex items-center gap-3">
      <div className="flex h-9 flex-1 items-center rounded-md border border-primary/40 bg-primary/5 px-3 text-sm">
        {displayBinding ? (
          <kbd className="font-mono text-foreground">{displayBinding}</kbd>
        ) : (
          <span className="animate-pulse text-muted-foreground">Press keys...</span>
        )}
      </div>
      <Button size="sm" variant="default" onClick={handleSave} disabled={!captured}>
        Save
      </Button>
      <Button size="sm" variant="ghost" onClick={onCancel}>
        Cancel
      </Button>
    </div>
  );
}
