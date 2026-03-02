import { useState, useMemo } from 'react';
import { RotateCcw, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { useShortcuts, IS_MAC } from '@/hooks/useShortcuts';
import type { KeyBinding } from '@/hooks/useShortcuts';
import ShortcutRecorder from './ShortcutRecorder';

export default function KeyboardShortcutsSettings() {
  const { shortcuts, setBinding, resetBinding, resetAll, findConflict } = useShortcuts();
  const [editingId, setEditingId] = useState<string | null>(null);

  const hasAnyCustom = useMemo(() => shortcuts.some((s) => s.isCustomized), [shortcuts]);

  // Group shortcuts by category
  const grouped = useMemo(() => {
    const map = new Map<string, typeof shortcuts>();
    for (const s of shortcuts) {
      const list = map.get(s.category) ?? [];
      list.push(s);
      map.set(s.category, list);
    }
    return map;
  }, [shortcuts]);

  const handleSave = (id: string, binding: KeyBinding) => {
    setBinding(id, binding);
    setEditingId(null);
  };

  return (
    <div className="space-y-6">
      {/* Platform indicator */}
      <p className="text-xs text-muted-foreground">
        Detected platform: <span className="font-medium text-foreground">{IS_MAC ? 'Mac' : 'Windows / Linux'}</span>.{' '}
        Shortcuts are shown for both platforms.
      </p>

      {Array.from(grouped.entries()).map(([category, items]) => (
        <div key={category}>
          <h3 className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">{category}</h3>
          <div className="space-y-1">
            {items.map((shortcut) => {
              const isEditing = editingId === shortcut.id;

              return (
                <div
                  key={shortcut.id}
                  className={cn(
                    'flex items-center gap-4 rounded-lg p-3 transition-colors',
                    isEditing ? 'bg-secondary/40' : 'hover:bg-secondary/20',
                  )}
                >
                  {/* Label */}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground">{shortcut.label}</p>
                    <p className="text-xs text-muted-foreground">{shortcut.description}</p>
                  </div>

                  {isEditing ? (
                    <div className="w-80">
                      <ShortcutRecorder
                        shortcutId={shortcut.id}
                        currentBinding={shortcut.currentBinding}
                        onSave={(b) => handleSave(shortcut.id, b)}
                        onCancel={() => setEditingId(null)}
                        findConflict={findConflict}
                      />
                    </div>
                  ) : (
                    <>
                      {/* Mac binding */}
                      <div className="w-24 text-center">
                        <span className="mb-0.5 block text-[9px] uppercase text-muted-foreground">Mac</span>
                        <kbd
                          className={cn(
                            'inline-block rounded px-2 py-1 font-mono text-xs',
                            IS_MAC
                              ? 'border border-primary/20 bg-primary/10 text-primary'
                              : 'bg-secondary text-muted-foreground',
                          )}
                        >
                          {shortcut.currentBinding.mac.replace(/\+/g, ' ')}
                        </kbd>
                      </div>

                      {/* PC binding */}
                      <div className="w-24 text-center">
                        <span className="mb-0.5 block text-[9px] uppercase text-muted-foreground">PC</span>
                        <kbd
                          className={cn(
                            'inline-block rounded px-2 py-1 font-mono text-xs',
                            !IS_MAC
                              ? 'border border-primary/20 bg-primary/10 text-primary'
                              : 'bg-secondary text-muted-foreground',
                          )}
                        >
                          {shortcut.currentBinding.pc}
                        </kbd>
                      </div>

                      {/* Actions */}
                      <div className="flex w-20 items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => setEditingId(shortcut.id)}
                          aria-label={`Edit ${shortcut.label} shortcut`}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        {shortcut.isCustomized && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground"
                            onClick={() => resetBinding(shortcut.id)}
                            aria-label={`Reset ${shortcut.label} to default`}
                          >
                            <RotateCcw className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Reset All */}
      {hasAnyCustom && (
        <>
          <Separator />
          <div className="flex justify-end">
            <Button variant="outline" size="sm" onClick={resetAll} className="gap-1.5">
              <RotateCcw className="h-3.5 w-3.5" />
              Reset All to Defaults
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
