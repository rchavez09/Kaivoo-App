import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Meeting } from '@/types';

const generateId = () => Math.random().toString(36).substring(2, 11);

interface MeetingStore {
  meetings: Meeting[];
  setMeetings: (meetings: Meeting[]) => void;
  addMeeting: (meeting: Omit<Meeting, 'id'>) => Meeting;
  updateMeeting: (id: string, updates: Partial<Meeting>) => void;
  deleteMeeting: (id: string) => void;
  getMeetingsForDate: (date: Date) => Meeting[];
  getTodaysMeetings: () => Meeting[];
}

export const useMeetingStore = create<MeetingStore>()(
  persist(
    (set, get) => ({
      meetings: [],

      setMeetings: (meetings) => set({ meetings }),

      addMeeting: (meetingData) => {
        const meeting: Meeting = { ...meetingData, id: `meeting-${generateId()}` };
        set((state) => ({ meetings: [...state.meetings, meeting] }));
        return meeting;
      },

      updateMeeting: (id, updates) => set((state) => ({ meetings: state.meetings.map(m => m.id === id ? { ...m, ...updates } : m) })),

      deleteMeeting: (id) => set((state) => ({ meetings: state.meetings.filter(m => m.id !== id) })),

      getMeetingsForDate: (date) => {
        const targetDate = date.toDateString();
        return get().meetings
          .filter(m => new Date(m.startTime).toDateString() === targetDate)
          .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
      },

      getTodaysMeetings: () => get().getMeetingsForDate(new Date()),
    }),
    { name: 'kaivoo-meetings', partialize: (state) => ({ meetings: state.meetings }) }
  )
);
