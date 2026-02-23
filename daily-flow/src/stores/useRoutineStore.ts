import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { RoutineItem, RoutineGroup } from '@/types';
import { format, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';

import { getTodayStorageDate } from '@/lib/dateUtils';
const generateId = () => Math.random().toString(36).substring(2, 11);
const getTodayString = getTodayStorageDate;

export interface RoutineCompletionRecord {
  routineId: string;
  completedAt: Date;
}

interface RoutineStore {
  routines: RoutineItem[];
  routineGroups: RoutineGroup[];
  routineCompletions: Record<string, RoutineCompletionRecord[]>;
  setRoutines: (routines: RoutineItem[]) => void;
  setRoutineGroups: (groups: RoutineGroup[]) => void;
  setRoutineCompletions: (completions: Record<string, RoutineCompletionRecord[]>) => void;
  addRoutine: (name: string, icon?: string, groupId?: string) => RoutineItem;
  removeRoutine: (id: string) => void;
  updateRoutine: (id: string, updates: Partial<RoutineItem>) => void;
  addRoutineGroup: (name: string, icon?: string, color?: string) => RoutineGroup;
  removeRoutineGroup: (id: string) => void;
  updateRoutineGroup: (id: string, updates: Partial<RoutineGroup>) => void;
  getRoutinesByGroup: (groupId: string | null) => RoutineItem[];
  toggleRoutineCompletion: (routineId: string, date?: string) => void;
  getCompletionsForDate: (date: string) => RoutineCompletionRecord[];
  isRoutineCompleted: (routineId: string, date?: string) => boolean;
  getRoutineCompletionRate: (date: string, groupId?: string | null) => number;
  getWeeklyRoutineStats: (groupId?: string | null, weekOffset?: number, weekStartsOn?: 0 | 1) => { date: string; completed: number; total: number }[];
}

export const useRoutineStore = create<RoutineStore>()(
  persist(
    (set, get) => ({
      routines: [],
      routineGroups: [],
      routineCompletions: {},

      setRoutines: (routines) => set({ routines }),
      setRoutineGroups: (groups) => set({ routineGroups: groups }),
      setRoutineCompletions: (completions) => set({ routineCompletions: completions }),

      addRoutine: (name, icon, groupId) => {
        const routines = get().routines;
        const groupRoutines = routines.filter(r => r.groupId === groupId);
        const routine: RoutineItem = { id: `routine-${generateId()}`, name, icon, order: groupRoutines.length, groupId };
        set((state) => ({ routines: [...state.routines, routine] }));
        return routine;
      },

      removeRoutine: (id) => set((state) => ({ routines: state.routines.filter(r => r.id !== id) })),

      updateRoutine: (id, updates) => set((state) => ({ routines: state.routines.map(r => r.id === id ? { ...r, ...updates } : r) })),

      addRoutineGroup: (name, icon, color) => {
        const groups = get().routineGroups;
        const group: RoutineGroup = { id: `group-${generateId()}`, name, icon, color, order: groups.length, createdAt: new Date() };
        set((state) => ({ routineGroups: [...state.routineGroups, group] }));
        return group;
      },

      removeRoutineGroup: (id) => set((state) => ({
        routineGroups: state.routineGroups.filter(g => g.id !== id),
        routines: state.routines.map(r => r.groupId === id ? { ...r, groupId: undefined } : r),
      })),

      updateRoutineGroup: (id, updates) => set((state) => ({ routineGroups: state.routineGroups.map(g => g.id === id ? { ...g, ...updates } : g) })),

      getRoutinesByGroup: (groupId) => get().routines.filter(r => r.groupId === groupId).sort((a, b) => a.order - b.order),

      toggleRoutineCompletion: (routineId, date) => {
        const dateStr = date || getTodayString();
        set((state) => {
          const currentCompletions = state.routineCompletions[dateStr] || [];
          const isCompleted = currentCompletions.some(c => c.routineId === routineId);
          return {
            routineCompletions: {
              ...state.routineCompletions,
              [dateStr]: isCompleted
                ? currentCompletions.filter(c => c.routineId !== routineId)
                : [...currentCompletions, { routineId, completedAt: new Date() }],
            },
          };
        });
      },

      getCompletionsForDate: (date) => get().routineCompletions[date] || [],

      isRoutineCompleted: (routineId, date) => {
        const dateStr = date || getTodayString();
        return (get().routineCompletions[dateStr] || []).some(c => c.routineId === routineId);
      },

      getRoutineCompletionRate: (date, groupId) => {
        const routines = groupId !== undefined ? get().getRoutinesByGroup(groupId) : get().routines;
        const completions = get().getCompletionsForDate(date);
        if (routines.length === 0) return 0;
        return (completions.filter(c => routines.some(r => r.id === c.routineId)).length / routines.length) * 100;
      },

      getWeeklyRoutineStats: (groupId, weekOffset = 0, weekStartsOn = 1) => {
        const { getRoutinesByGroup, routines, getCompletionsForDate } = get();
        const targetRoutines = groupId !== undefined ? getRoutinesByGroup(groupId) : routines;
        const today = new Date();
        const offsetDate = new Date(today);
        offsetDate.setDate(today.getDate() + (weekOffset * 7));
        const weekStart = startOfWeek(offsetDate, { weekStartsOn });
        const weekEnd = endOfWeek(offsetDate, { weekStartsOn });
        const days = eachDayOfInterval({ start: weekStart, end: weekEnd });
        return days.map(day => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const allCompletions = getCompletionsForDate(dateStr);
          return { date: dateStr, completed: allCompletions.filter(c => targetRoutines.some(r => r.id === c.routineId)).length, total: targetRoutines.length };
        });
      },
    }),
    { name: 'kaivoo-routines', partialize: (state) => ({ routines: state.routines, routineGroups: state.routineGroups, routineCompletions: state.routineCompletions }) }
  )
);
