import { create } from 'zustand';
import { toast } from 'sonner';
import { searchAll } from '@/services/search.service';
import type { SearchResult } from '@/services/search.service';

type EntityCategory = 'all' | SearchResult['entityType'];

interface SearchState {
  query: string;
  results: (SearchResult & { path: string })[];
  isLoading: boolean;
  isOpen: boolean;
  selectedCategory: EntityCategory;
  recentSearches: string[];

  setQuery: (query: string) => void;
  search: (query: string) => Promise<void>;
  clearResults: () => void;
  open: () => void;
  close: () => void;
  toggle: () => void;
  setCategory: (category: EntityCategory) => void;
  addRecentSearch: (query: string) => void;
}

const MAX_RECENT = 5;
const RECENT_KEY = 'kaivoo-recent-searches';

function loadRecent(): string[] {
  try {
    const stored = localStorage.getItem(RECENT_KEY);
    return stored ? (JSON.parse(stored) as string[]) : [];
  } catch {
    return [];
  }
}

function saveRecent(searches: string[]) {
  localStorage.setItem(RECENT_KEY, JSON.stringify(searches));
}

export const useSearchStore = create<SearchState>((set, get) => ({
  query: '',
  results: [],
  isLoading: false,
  isOpen: false,
  selectedCategory: 'all',
  recentSearches: loadRecent(),

  setQuery: (query) => set({ query }),

  search: async (query) => {
    const trimmed = query.trim();
    if (!trimmed) {
      set({ results: [], isLoading: false });
      return;
    }

    set({ isLoading: true });
    try {
      const results = await searchAll(trimmed);
      // Only update if query hasn't changed while we were loading
      if (get().query.trim() === trimmed) {
        set({ results, isLoading: false });
      }
    } catch {
      set({ results: [], isLoading: false });
      toast.error('Search failed. Please try again.');
    }
  },

  clearResults: () => set({ query: '', results: [], isLoading: false, selectedCategory: 'all' }),

  open: () => set({ isOpen: true }),
  close: () => {
    set({ isOpen: false });
    // Clear after close animation
    setTimeout(() => {
      const state = get();
      if (!state.isOpen) {
        state.clearResults();
      }
    }, 200);
  },
  toggle: () => {
    const isOpen = get().isOpen;
    if (isOpen) get().close();
    else get().open();
  },

  setCategory: (selectedCategory) => set({ selectedCategory }),

  addRecentSearch: (query) => {
    const trimmed = query.trim();
    if (!trimmed) return;
    const current = get().recentSearches.filter(s => s !== trimmed);
    const updated = [trimmed, ...current].slice(0, MAX_RECENT);
    set({ recentSearches: updated });
    saveRecent(updated);
  },
}));
