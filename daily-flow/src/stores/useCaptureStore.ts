import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Capture } from '@/types';

const generateId = () => Math.random().toString(36).substring(2, 11);

interface CaptureStore {
  captures: Capture[];
  setCaptures: (captures: Capture[]) => void;
  addCapture: (capture: Omit<Capture, 'id' | 'createdAt'>) => Capture;
  updateCapture: (id: string, updates: Partial<Capture>) => void;
  deleteCapture: (id: string) => void;
  getCapturesByTopic: (topicId: string, childPageIds: string[]) => Capture[];
  getCapturesByTag: (tagName: string) => Capture[];
  getCapturesForDate: (date: string) => Capture[];
}

export const useCaptureStore = create<CaptureStore>()(
  persist(
    (set, get) => ({
      captures: [],

      setCaptures: (captures) => set({ captures }),

      addCapture: (captureData) => {
        const capture: Capture = { ...captureData, id: `capture-${generateId()}`, createdAt: new Date() };
        set((state) => ({ captures: [...state.captures, capture] }));
        return capture;
      },

      updateCapture: (id, updates) => set((state) => ({ captures: state.captures.map(c => c.id === id ? { ...c, ...updates } : c) })),

      deleteCapture: (id) => set((state) => ({ captures: state.captures.filter(c => c.id !== id) })),

      getCapturesByTopic: (topicId, childPageIds) => {
        return get().captures.filter(c => c.topicIds.includes(topicId) || c.topicIds.some(id => childPageIds.includes(id)));
      },

      getCapturesByTag: (tagName) => get().captures.filter(c => c.tags.includes(tagName.toLowerCase())),

      getCapturesForDate: (date) => get().captures.filter(c => c.date === date),
    }),
    { name: 'kaivoo-captures', partialize: (state) => ({ captures: state.captures }) }
  )
);
