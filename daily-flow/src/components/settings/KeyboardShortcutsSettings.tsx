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

  const hasAnyCustom = useMemo(
    () => shortcuts.some(s => s.isCustomized),
    [shortcuts],
  );

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
        Detected platform: <span className="font-medium text-foreground">{IS_MAC ? 'Mac' : 'Windows / Linux'}</span>.
        {' '}Shortcuts are shown for both platforms.
      </p>

      {Array.from(grouped.entries()).map(([category, items]) => (
        <div key={category}>
          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
            {category}
          </h3>
          <div className="space-y-1">
            {items.map((shortcut) => {
              const isEditing = editingId === shortcut.id;

              return (
                <div
                  key={shortcut.id}
                  className={cn(
                    'flex items-center gap-4 p-3 rounded-lg transition-colors',
                    isEditing ? 'bg-secondary/40' : 'hover:bg-secondary/20',
                  )}
                >
                  {/* Label */}
                  <div className="flex-1 min-w-0">
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
                      <div className="text-center w-24">
                        <span className="text-[9px] text-muted-foreground uppercase block mb-0.5">Mac</span>
                        <kbd
                          className={cn(
                            'inline-block text-xs font-mono px-2 py-1 rounded',
                            IS_MAC
                              ? 'bg-primary/10 text-primary border border-primary/20'
                              : 'bg-secondary text-muted-foreground',
                          )}
                        >
                          {shortcut.currentBinding.mac.replace(/\+/g, ' ')}
                        </kbd>
                      </div>

                      {/* PC binding */}
                      <div className="text-center w-24">
                        <span className="text-[9px] text-muted-foreground uppercase block mb-0.5">PC</span>
                        <kbd
                          className={cn(
                            'inline-block text-xs font-mono px-2 py-1 rounded',
                            !IS_MAC
                              ? 'bg-primary/10 text-primary border border-primary/20'
                              : 'bg-secondary text-muted-foreground',
                          )}
                        >
                          {shortcut.currentBinding.pc}
                        </kbd>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 w-20 justify-end">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => setEditingId(shortcut.id)}
                          aria-label={`Edit ${shortcut.label} shortcut`}
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        {shortcut.isCustomized && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground"
                            onClick={() => resetBinding(shortcut.id)}
                            aria-label={`Reset ${shortcut.label} to default`}
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
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
              <RotateCcw className="w-3.5 h-3.5" />
              Reset All to Defaults
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
