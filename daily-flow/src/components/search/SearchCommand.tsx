import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  X,
  CheckSquare,
  BookOpen,
  Briefcase,
  Calendar,
  FolderOpen,
  Repeat,
  FileText,
  Clock,
  Loader2,
  ListChecks,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSearchStore } from '@/stores/useSearchStore';
import type { SearchResult } from '@/services/search.service';

const ENTITY_CONFIG: Record<SearchResult['entityType'], { icon: typeof Search; label: string; color: string }> = {
  task: { icon: CheckSquare, label: 'Task', color: 'text-accent' },
  subtask: { icon: ListChecks, label: 'Subtask', color: 'text-accent/70' },
  note: { icon: BookOpen, label: 'Note', color: 'text-primary' },
  project: { icon: Briefcase, label: 'Project', color: 'text-info-foreground' },
  project_note: { icon: FileText, label: 'Project Note', color: 'text-info-foreground/70' },
  meeting: { icon: Calendar, label: 'Meeting', color: 'text-primary' },
  capture: { icon: FileText, label: 'Capture', color: 'text-warning-foreground' },
  topic: { icon: FolderOpen, label: 'Topic', color: 'text-success-foreground' },
  topic_page: { icon: FileText, label: 'Topic Page', color: 'text-success-foreground/70' },
  habit: { icon: Repeat, label: 'Habit', color: 'text-primary' },
};

const CATEGORIES: { key: 'all' | SearchResult['entityType']; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'task', label: 'Tasks' },
  { key: 'note', label: 'Notes' },
  { key: 'project', label: 'Projects' },
  { key: 'meeting', label: 'Meetings' },
  { key: 'topic', label: 'Topics' },
  { key: 'capture', label: 'Captures' },
  { key: 'habit', label: 'Habits' },
];

export default function SearchCommand() {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  // P1-1 fix: individual selectors instead of full-store destructure
  const query = useSearchStore(s => s.query);
  const results = useSearchStore(s => s.results);
  const isLoading = useSearchStore(s => s.isLoading);
  const isOpen = useSearchStore(s => s.isOpen);
  const selectedCategory = useSearchStore(s => s.selectedCategory);
  const recentSearches = useSearchStore(s => s.recentSearches);
  const setQuery = useSearchStore(s => s.setQuery);
  const search = useSearchStore(s => s.search);
  const close = useSearchStore(s => s.close);
  const setCategory = useSearchStore(s => s.setCategory);
  const addRecentSearch = useSearchStore(s => s.addRecentSearch);

  // P1-3 fix: memoize filtered results
  const filteredResults = useMemo(
    () => selectedCategory === 'all' ? results : results.filter(r => r.entityType === selectedCategory),
    [results, selectedCategory],
  );

  // P1-8 fix: pre-compute category counts in a single pass
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: results.length };
    for (const r of results) {
      counts[r.entityType] = (counts[r.entityType] ?? 0) + 1;
    }
    return counts;
  }, [results]);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => inputRef.current?.focus());
      setActiveIndex(0);
    }
  }, [isOpen]);

  // P1-2 fix: clean up debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  // P1-7 fix: focus trap within dialog
  useEffect(() => {
    if (!isOpen) return;
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      const focusable = dialog.querySelectorAll<HTMLElement>(
        'input, button, [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', handleTab);
    return () => document.removeEventListener('keydown', handleTab);
  }, [isOpen]);

  // Debounced search
  const handleQueryChange = useCallback((value: string) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      void search(value);
    }, 300);
  }, [setQuery, search]);

  // Navigate to result
  const handleSelect = useCallback((result: { path: string; entityType: string; entityId: string }) => {
    addRecentSearch(query);
    close();
    navigate(result.path);
  }, [navigate, close, addRecentSearch, query]);

  // Keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex(i => Math.min(i + 1, filteredResults.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex(i => Math.max(i - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (filteredResults[activeIndex]) {
          handleSelect(filteredResults[activeIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        close();
        break;
    }
  }, [filteredResults, activeIndex, handleSelect, close]);

  // Scroll active item into view
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const item = list.children[activeIndex] as HTMLElement | undefined;
    item?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex]);

  // Reset active index when results change
  useEffect(() => {
    setActiveIndex(0);
  }, [filteredResults.length]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]"
      onClick={(e) => { if (e.target === e.currentTarget) close(); }}
      role="presentation"
    >
      {/* Backdrop */}
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" aria-hidden="true" />

      {/* Command palette */}
      <div
        ref={dialogRef}
        className="relative w-full max-w-xl bg-background border border-border rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-4 duration-200"
        role="dialog"
        aria-label="Search"
        aria-modal="true"
        onKeyDown={handleKeyDown}
      >
        {/* Input */}
        <div className="flex items-center px-4 border-b border-border">
          <Search className="w-4 h-4 text-muted-foreground shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            placeholder="Search tasks, notes, projects, meetings..."
            className="flex-1 h-12 px-3 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
            aria-label="Search query"
          />
          {query && (
            <button
              onClick={() => handleQueryChange('')}
              className="p-1 text-muted-foreground hover:text-foreground rounded-md"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          {isLoading && <Loader2 className="w-4 h-4 text-muted-foreground animate-spin ml-2" />}
          <button
            onClick={close}
            className="ml-2 p-1 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-md transition-colors"
            aria-label="Close search"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Category tabs */}
        {results.length > 0 && (
          <div className="flex items-center gap-1 px-4 py-2 border-b border-border/50 overflow-x-auto scrollbar-none" role="tablist">
            {CATEGORIES.map(({ key, label }) => {
              const count = categoryCounts[key] ?? 0;
              if (key !== 'all' && count === 0) return null;
              return (
                <button
                  key={key}
                  role="tab"
                  aria-selected={selectedCategory === key}
                  onClick={() => setCategory(key)}
                  className={cn(
                    'text-xs px-2.5 py-1 rounded-md whitespace-nowrap transition-colors',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                    selectedCategory === key
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50',
                  )}
                >
                  {label} <span className="text-muted-foreground ml-0.5">{count}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Results */}
        <div ref={listRef} className="max-h-[360px] overflow-y-auto scrollbar-thin" role="listbox">
          {/* Empty / no query state */}
          {!query && recentSearches.length > 0 && (
            <div className="p-4">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Recent searches</p>
              {recentSearches.map((term) => (
                <button
                  key={term}
                  onClick={() => handleQueryChange(term)}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-foreground hover:bg-secondary/50 rounded-md text-left"
                >
                  <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                  {term}
                </button>
              ))}
            </div>
          )}

          {!query && recentSearches.length === 0 && (
            <div className="p-8 text-center text-sm text-muted-foreground">
              Search across all your tasks, notes, projects, and more
            </div>
          )}

          {/* Loading */}
          {query && isLoading && filteredResults.length === 0 && (
            <div className="p-8 text-center text-sm text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-primary" />
              Searching...
            </div>
          )}

          {/* No results */}
          {query && !isLoading && filteredResults.length === 0 && (
            <div className="p-8 text-center text-sm text-muted-foreground">
              No results for &quot;{query}&quot;
            </div>
          )}

          {/* Result items */}
          {filteredResults.map((result, i) => {
            const config = ENTITY_CONFIG[result.entityType];
            const Icon = config.icon;
            return (
              <button
                key={`${result.entityType}-${result.entityId}`}
                role="option"
                aria-selected={i === activeIndex}
                onClick={() => handleSelect(result)}
                onMouseEnter={() => setActiveIndex(i)}
                className={cn(
                  'flex items-start gap-3 w-full px-4 py-3 text-left transition-colors',
                  'focus-visible:outline-none',
                  i === activeIndex ? 'bg-secondary/70' : 'hover:bg-secondary/40',
                )}
              >
                <Icon className={cn('w-4 h-4 mt-0.5 shrink-0', config.color)} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground truncate">{result.title}</span>
                    <span className="text-[10px] text-muted-foreground bg-secondary px-1.5 py-0.5 rounded shrink-0">
                      {config.label}
                    </span>
                  </div>
                  {result.preview && result.preview !== result.title && (
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1"
                      dangerouslySetInnerHTML={{
                        __html: result.preview
                          .replace(/&/g, '&amp;')
                          .replace(/</g, '&lt;')
                          .replace(/>/g, '&gt;')
                          .replace(/\*\*(.+?)\*\*/g, '<strong class="text-foreground font-semibold">$1</strong>')
                      }}
                    />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-2 border-t border-border/50 text-[10px] text-muted-foreground">
          <div className="flex items-center gap-3">
            <span><kbd className="bg-secondary px-1 py-0.5 rounded font-mono">↑↓</kbd> navigate</span>
            <span><kbd className="bg-secondary px-1 py-0.5 rounded font-mono">↵</kbd> open</span>
            <span><kbd className="bg-secondary px-1 py-0.5 rounded font-mono">esc</kbd> close</span>
          </div>
          <span>{filteredResults.length} result{filteredResults.length !== 1 ? 's' : ''}</span>
        </div>
      </div>
    </div>
  );
}
