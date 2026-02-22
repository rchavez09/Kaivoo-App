import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { JournalEntry } from '@/types';

const generateId = () => Math.random().toString(36).substring(2, 11);

interface JournalStore {
  journalEntries: JournalEntry[];
  setJournalEntries: (entries: JournalEntry[]) => void;
  addJournalEntry: (entry: Omit<JournalEntry, 'id' | 'createdAt' | 'updatedAt' | 'timestamp'>) => JournalEntry;
  updateJournalEntry: (id: string, updates: Partial<JournalEntry>) => void;
  deleteJournalEntry: (id: string) => void;
  getJournalEntriesForDate: (date: string) => JournalEntry[];
  getJournalEntriesByTopic: (topicId: string, childPageIds: string[]) => JournalEntry[];
  getAllJournalDates: () => string[];
}

export const useJournalStore = create<JournalStore>()(
  persist(
    (set, get) => ({
      journalEntries: [],

      setJournalEntries: (entries) => set({ journalEntries: entries }),

      addJournalEntry: (entryData) => {
        const now = new Date();
        const entry: JournalEntry = {
          ...entryData,
          id: `journal-${generateId()}`,
          createdAt: now,
          updatedAt: now,
          timestamp: now,
        };
        set((state) => ({ journalEntries: [...state.journalEntries, entry] }));
        return entry;
      },

      updateJournalEntry: (id, updates) => {
        set((state) => ({
          journalEntries: state.journalEntries.map(e =>
            e.id === id ? { ...e, ...updates, updatedAt: new Date() } : e
          ),
        }));
      },

      deleteJournalEntry: (id) => {
        set((state) => ({ journalEntries: state.journalEntries.filter(e => e.id !== id) }));
      },

      getJournalEntriesForDate: (date) => {
        return get().journalEntries
          .filter(e => e.date === date)
          .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
      },

      getJournalEntriesByTopic: (topicId, childPageIds) => {
        return get().journalEntries
          .filter(e => e.topicIds.includes(topicId) || e.topicIds.some(id => childPageIds.includes(id)))
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      },

      getAllJournalDates: () => {
        const dates = get().journalEntries.map(e => e.date);
        return [...new Set(dates)].sort((a, b) => b.localeCompare(a));
      },
    }),
    { name: 'kaivoo-journal', partialize: (state) => ({ journalEntries: state.journalEntries }) }
  )
);
