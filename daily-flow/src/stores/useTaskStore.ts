import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Task, Subtask } from '@/types';
import { format, isSameDay, startOfWeek, endOfWeek, parseISO, isValid, addDays } from 'date-fns';

const generateId = () => Math.random().toString(36).substring(2, 11);

interface TaskStore {
  tasks: Task[];
  setTasks: (tasks: Task[]) => void;
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => Task;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  addSubtask: (taskId: string, title: string) => void;
  updateSubtask: (taskId: string, subtaskId: string, updates: Partial<Subtask>) => void;
  toggleSubtask: (taskId: string, subtaskId: string) => void;
  deleteSubtask: (taskId: string, subtaskId: string) => void;
  getTasksByTopic: (topicId: string, childPageIds: string[]) => Task[];
  getTasksByTag: (tagName: string) => Task[];
  getTasksDueToday: () => Task[];
  getTasksForDate: (date: Date) => { pending: Task[]; completed: Task[] };
  getCompletedTasksThisWeek: () => Task[];
}

export const useTaskStore = create<TaskStore>()(
  persist(
    (set, get) => ({
      tasks: [],

      setTasks: (tasks) => set({ tasks }),

      addTask: (taskData) => {
        const task: Task = {
          ...taskData,
          id: `task-${generateId()}`,
          createdAt: new Date(),
        };
        set((state) => ({ tasks: [...state.tasks, task] }));
        return task;
      },

      updateTask: (id, updates) => {
        set((state) => ({
          tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
        }));
      },

      deleteTask: (id) => {
        set((state) => ({ tasks: state.tasks.filter((t) => t.id !== id) }));
      },

      addSubtask: (taskId, title) => {
        const subtask = { id: `subtask-${generateId()}`, title, completed: false, tags: [] as string[] };
        set((state) => ({
          tasks: state.tasks.map((t) => (t.id === taskId ? { ...t, subtasks: [...t.subtasks, subtask] } : t)),
        }));
      },

      updateSubtask: (taskId, subtaskId, updates) => {
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === taskId
              ? { ...t, subtasks: t.subtasks.map((s) => (s.id === subtaskId ? { ...s, ...updates } : s)) }
              : t,
          ),
        }));
      },

      toggleSubtask: (taskId, subtaskId) => {
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === taskId
              ? {
                  ...t,
                  subtasks: t.subtasks.map((s) =>
                    s.id === subtaskId
                      ? { ...s, completed: !s.completed, completedAt: !s.completed ? new Date() : undefined }
                      : s,
                  ),
                }
              : t,
          ),
        }));
      },

      deleteSubtask: (taskId, subtaskId) => {
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === taskId ? { ...t, subtasks: t.subtasks.filter((s) => s.id !== subtaskId) } : t,
          ),
        }));
      },

      getTasksByTopic: (topicId, childPageIds) => {
        return get().tasks.filter(
          (t) => t.topicIds.includes(topicId) || t.topicIds.some((id) => childPageIds.includes(id)),
        );
      },

      getTasksByTag: (tagName) => get().tasks.filter((t) => t.tags.includes(tagName.toLowerCase())),

      getTasksDueToday: () => get().tasks.filter((t) => t.dueDate === 'Today' && t.status !== 'done'),

      getTasksForDate: (date) => {
        const isToday = isSameDay(date, new Date());
        const tasks = get().tasks;

        const isDueDateMatch = (dueDate: string | undefined, targetDate: Date): boolean => {
          if (!dueDate) return false;
          if (dueDate === 'Today') return isToday;
          if (dueDate === 'Tomorrow') return isSameDay(addDays(new Date(), 1), targetDate);
          try {
            const parsed = parseISO(dueDate);
            if (isValid(parsed)) return isSameDay(parsed, targetDate);
            const generalParsed = new Date(dueDate);
            if (isValid(generalParsed)) return isSameDay(generalParsed, targetDate);
          } catch {
            /* not parseable */
          }
          return false;
        };

        const pending = tasks.filter((t) => t.status !== 'done' && isDueDateMatch(t.dueDate, date));
        const completed = tasks.filter(
          (t) => t.status === 'done' && t.completedAt && isSameDay(new Date(t.completedAt), date),
        );

        return { pending, completed };
      },

      getCompletedTasksThisWeek: () => {
        const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
        return get().tasks.filter((t) => t.status === 'done' && t.completedAt && new Date(t.completedAt) >= weekStart);
      },
    }),
    { name: 'kaivoo-tasks', partialize: (state) => ({ tasks: state.tasks }) },
  ),
);
