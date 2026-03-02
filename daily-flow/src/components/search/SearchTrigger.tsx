import { Search } from 'lucide-react';
import { useSearchStore } from '@/stores/useSearchStore';
import { useShortcuts, IS_MAC } from '@/hooks/useShortcuts';

/** Visible search bar that opens the command palette on click. */
export default function SearchTrigger() {
  const open = useSearchStore((s) => s.open);
  const { getDisplayBinding } = useShortcuts();
  const hint = getDisplayBinding('global-search');

  return (
    <button
      type="button"
      onClick={open}
      className="widget-card group mb-4 flex w-full cursor-pointer items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-secondary/30"
      aria-label="Open search"
    >
      <Search className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-foreground" />
      <span className="flex-1 text-sm text-muted-foreground">Search tasks, notes, projects...</span>
      {hint && (
        <kbd className="rounded bg-secondary px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
          {IS_MAC ? hint.replace(/\+/g, '') : hint}
        </kbd>
      )}
    </button>
  );
}
