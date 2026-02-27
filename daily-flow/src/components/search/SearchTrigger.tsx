import { Search } from 'lucide-react';
import { useSearchStore } from '@/stores/useSearchStore';
import { useShortcuts, IS_MAC } from '@/hooks/useShortcuts';

/** Visible search bar that opens the command palette on click. */
export default function SearchTrigger() {
  const open = useSearchStore(s => s.open);
  const { getDisplayBinding } = useShortcuts();
  const hint = getDisplayBinding('global-search');

  return (
    <button
      type="button"
      onClick={open}
      className="widget-card flex items-center gap-3 px-4 py-2.5 mb-4 w-full text-left cursor-pointer hover:bg-secondary/30 transition-colors group"
      aria-label="Open search"
    >
      <Search className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
      <span className="flex-1 text-sm text-muted-foreground">
        Search tasks, notes, projects...
      </span>
      {hint && (
        <kbd className="text-[10px] text-muted-foreground bg-secondary px-1.5 py-0.5 rounded font-mono">
          {IS_MAC ? hint.replace(/\+/g, '') : hint}
        </kbd>
      )}
    </button>
  );
}
