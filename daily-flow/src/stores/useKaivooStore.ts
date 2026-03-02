import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  Topic,
  TopicPage,
  Capture,
  Task,
  Tag,
  Meeting,
  RoutineItem,
  RoutineGroup,
  JournalEntry,
  Subtask,
  RoutineCompletion,
  Project,
  ProjectNote,
  Habit,
  HabitCompletion,
  TimeBlock,
} from '@/types';
import {
  format,
  subDays,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameDay,
  parseISO,
  isValid,
  addDays,
} from 'date-fns';

// Routine completion with timestamp for activity tracking
export interface RoutineCompletionRecord {
  routineId: string;
  completedAt: Date;
}

// Habit completion record for store
export interface HabitCompletionRecord {
  habitId: string;
  count?: number;
  skipped: boolean;
  completedAt: Date;
}

interface DatabaseData {
  topics: Topic[];
  topicPages: TopicPage[];
  tags: Tag[];
  tasks: Task[];
  journalEntries: JournalEntry[];
  captures: Capture[];
  meetings: Meeting[];
  routines: RoutineItem[];
  routineGroups: RoutineGroup[];
  routineCompletions: Record<string, RoutineCompletionRecord[]>;
  habits: Habit[];
  habitCompletions: Record<string, HabitCompletionRecord[]>;
  projects: Project[];
  projectNotes: ProjectNote[];
}

interface KaivooStore {
  // Database sync
  setFromDatabase: (data: DatabaseData) => void;
  isLoaded: boolean;

  // Topics
  topics: Topic[];
  topicPages: TopicPage[];
  addTopic: (topic: Omit<Topic, 'id' | 'createdAt'>) => Topic;
  updateTopic: (id: string, updates: Partial<Topic>) => void;
  deleteTopic: (id: string) => void;
  addTopicPage: (page: Omit<TopicPage, 'id' | 'createdAt'>) => TopicPage;
  updateTopicPage: (id: string, updates: Partial<TopicPage>) => void;
  deleteTopicPage: (id: string) => void;
  getTopicById: (id: string) => Topic | undefined;
  getTopicByName: (name: string) => Topic | undefined;
  getTopicPages: (topicId: string) => TopicPage[];
  getChildPageIds: (topicId: string) => string[];
  // Resolve [[Topic]] or [[Topic/Page]] path to array of IDs [topicId] or [topicId, pageId]
  resolveTopicPath: (path: string, autoCreate?: boolean) => string[] | null;
  // Get display path for a topic/page ID
  getTopicPath: (id: string) => string;

  // Captures
  captures: Capture[];
  addCapture: (capture: Omit<Capture, 'id' | 'createdAt'>) => Capture;
  updateCapture: (id: string, updates: Partial<Capture>) => void;
  deleteCapture: (id: string) => void;
  getCapturesByTopic: (topicId: string) => Capture[];
  getCapturesByTag: (tagName: string) => Capture[];
  getCapturesForDate: (date: string) => Capture[];

  // Journal Entries
  journalEntries: JournalEntry[];
  addJournalEntry: (entry: Omit<JournalEntry, 'id' | 'createdAt' | 'updatedAt' | 'timestamp'>) => JournalEntry;
  updateJournalEntry: (id: string, updates: Partial<JournalEntry>) => void;
  deleteJournalEntry: (id: string) => void;
  getJournalEntriesForDate: (date: string) => JournalEntry[];
  getJournalEntriesByTopic: (topicId: string) => JournalEntry[];
  getAllJournalDates: () => string[];

  // Tasks
  tasks: Task[];
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => Task;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  addSubtask: (taskId: string, title: string) => void;
  updateSubtask: (taskId: string, subtaskId: string, updates: Partial<Subtask>) => void;
  toggleSubtask: (taskId: string, subtaskId: string) => void;
  deleteSubtask: (taskId: string, subtaskId: string) => void;
  getTasksByTopic: (topicId: string) => Task[];
  getTasksByTag: (tagName: string) => Task[];
  getTasksDueToday: () => Task[];
  getTasksForDate: (date: Date) => { pending: Task[]; completed: Task[] };
  getCompletedTasksThisWeek: () => Task[];

  // Tags
  tags: Tag[];
  addTag: (name: string) => Tag;
  getOrCreateTag: (name: string) => Tag;

  // Meetings
  meetings: Meeting[];
  addMeeting: (meeting: Omit<Meeting, 'id'>) => Meeting;
  updateMeeting: (id: string, updates: Partial<Meeting>) => void;
  deleteMeeting: (id: string) => void;
  getMeetingsForDate: (date: Date) => Meeting[];
  getMeetingsForDateRange: (start: Date, end: Date) => Meeting[];
  getTodaysMeetings: () => Meeting[];

  // Routines
  routines: RoutineItem[];
  routineGroups: RoutineGroup[];
  routineCompletions: Record<string, RoutineCompletionRecord[]>; // date string -> array of completions with timestamps
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
  getWeeklyRoutineStats: (
    groupId?: string | null,
    weekOffset?: number,
    weekStartsOn?: 0 | 1,
  ) => { date: string; completed: number; total: number }[];
  getWeeklySummary: () => {
    tasksCompleted: number;
    capturesMade: number;
    routinesCompleted: number;
    routineCompletionRate: number;
  };

  // Habits (Sprint 17 — upgrade of routines)
  habits: Habit[];
  habitCompletions: Record<string, HabitCompletionRecord[]>;
  getHabitsByTimeBlock: (timeBlock: TimeBlock) => Habit[];
  isHabitCompleted: (habitId: string, date?: string) => boolean;
  getHabitCompletionCount: (habitId: string, date?: string) => number;
  getHabitCompletionsForDate: (date: string) => HabitCompletionRecord[];
  toggleHabitCompletion: (habitId: string, date?: string) => void;
  incrementHabitCount: (habitId: string, date?: string) => void;
  getHabitCompletionRate: (date: string) => number;
  addHabit: (
    habit: Omit<Habit, 'id' | 'createdAt' | 'updatedAt' | 'strength' | 'currentStreak' | 'bestStreak'>,
  ) => Habit;
  updateHabitInStore: (id: string, updates: Partial<Habit>) => void;
  removeHabit: (id: string) => void;

  // Projects
  projects: Project[];
  addProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => Project;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  getTasksByProject: (projectId: string) => Task[];

  // Project Notes
  projectNotes: ProjectNote[];
  addProjectNote: (note: Omit<ProjectNote, 'id' | 'createdAt' | 'updatedAt'>) => ProjectNote;
  updateProjectNote: (id: string, updates: Partial<Pick<ProjectNote, 'content'>>) => void;
  deleteProjectNote: (id: string) => void;
  getNotesByProject: (projectId: string) => ProjectNote[];

  // UI State
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;
}

// Generate simple IDs
const generateId = () => Math.random().toString(36).substring(2, 11);

// Get today's date string — uses centralized dateUtils
import { getTodayStorageDate } from '@/lib/dateUtils';
const getTodayString = getTodayStorageDate;

// Initial mock data
const initialTopics: Topic[] = [
  {
    id: 'topic-daily-notes',
    name: 'Daily Notes',
    description: 'Your daily journal entries by date',
    createdAt: new Date(),
  },
  { id: 'topic-1', name: 'NUWAVE', description: 'Main project', createdAt: new Date() },
  { id: 'topic-2', name: 'Personal', description: 'Personal notes and goals', createdAt: new Date() },
];

const initialTopicPages: TopicPage[] = [
  { id: 'page-1', topicId: 'topic-1', name: 'Amani', description: 'Amani client project', createdAt: new Date() },
  { id: 'page-2', topicId: 'topic-1', name: 'Strategy', description: 'Strategy documents', createdAt: new Date() },
];

// Initial journal entries with timestamps
const initialJournalEntries: JournalEntry[] = [
  {
    id: 'journal-1',
    date: getTodayString(),
    content: 'Need to finalize the NUWAVE branding by end of week. Key focus: modern, professional.',
    tags: ['branding'],
    topicIds: ['topic-1'],
    createdAt: subDays(new Date(), 0),
    updatedAt: subDays(new Date(), 0),
    timestamp: new Date(new Date().setHours(9, 30, 0, 0)),
  },
  {
    id: 'journal-2',
    date: getTodayString(),
    content: 'Amani requested updates to the dashboard layout. Meeting scheduled for Thursday.',
    tags: ['meeting', 'design'],
    topicIds: ['topic-1', 'page-1'],
    createdAt: new Date(),
    updatedAt: new Date(),
    timestamp: new Date(new Date().setHours(11, 15, 0, 0)),
  },
  {
    id: 'journal-3',
    date: format(subDays(new Date(), 1), 'yyyy-MM-dd'),
    content: 'Research competitor pricing strategies for Q2 planning. Found some interesting patterns in the market.',
    tags: ['research'],
    topicIds: ['topic-1'],
    createdAt: subDays(new Date(), 1),
    updatedAt: subDays(new Date(), 1),
    timestamp: new Date(subDays(new Date(), 1).setHours(14, 0, 0, 0)),
  },
];

const initialTasks: Task[] = [
  {
    id: 'task-1',
    title: 'Review quarterly report',
    status: 'todo',
    priority: 'high',
    dueDate: 'Today',
    tags: ['work'],
    topicIds: ['topic-1'],
    subtasks: [
      { id: 'sub-1', title: 'Gather financial data', completed: true, completedAt: new Date(), tags: [] },
      { id: 'sub-2', title: 'Create summary slides', completed: false, tags: [] },
      { id: 'sub-3', title: 'Review with team', completed: false, tags: [] },
    ],
    createdAt: new Date(),
  },
  {
    id: 'task-2',
    title: 'Call with design team',
    status: 'doing',
    priority: 'medium',
    dueDate: 'Today',
    tags: ['meeting'],
    topicIds: ['topic-1'],
    subtasks: [],
    createdAt: new Date(),
  },
  {
    id: 'task-3',
    title: 'Update project timeline',
    status: 'done',
    priority: 'low',
    tags: ['planning'],
    topicIds: ['topic-1'],
    subtasks: [],
    createdAt: new Date(),
    completedAt: subDays(new Date(), 2),
  },
  {
    id: 'task-4',
    title: 'Send meeting notes',
    status: 'todo',
    priority: 'medium',
    dueDate: 'Tomorrow',
    tags: [],
    topicIds: [],
    subtasks: [],
    createdAt: new Date(),
  },
  {
    id: 'task-5',
    title: 'Prepare Amani presentation',
    status: 'todo',
    priority: 'high',
    dueDate: 'This week',
    tags: ['work'],
    topicIds: ['topic-1', 'page-1'],
    subtasks: [
      { id: 'sub-4', title: 'Draft outline', completed: true, completedAt: new Date(), tags: [] },
      { id: 'sub-5', title: 'Design mockups', completed: true, completedAt: new Date(), tags: [] },
      { id: 'sub-6', title: 'Final review', completed: false, tags: [] },
    ],
    createdAt: new Date(),
  },
  {
    id: 'task-6',
    title: 'Weekly planning session',
    status: 'done',
    priority: 'medium',
    tags: ['planning'],
    topicIds: [],
    subtasks: [],
    createdAt: subDays(new Date(), 3),
    completedAt: subDays(new Date(), 3),
  },
  {
    id: 'task-7',
    title: 'Client follow-up email',
    status: 'done',
    priority: 'high',
    tags: ['work'],
    topicIds: ['topic-1'],
    subtasks: [],
    createdAt: subDays(new Date(), 1),
    completedAt: subDays(new Date(), 1),
  },
];

const initialCaptures: Capture[] = [
  {
    id: 'capture-1',
    content: 'Need to finalize the NUWAVE branding by end of week. Key focus: modern, professional.',
    source: 'journal',
    date: getTodayString(),
    tags: ['branding'],
    topicIds: ['topic-1'],
    createdAt: new Date(),
  },
  {
    id: 'capture-2',
    content: 'Amani requested updates to the dashboard layout. Meeting scheduled for Thursday.',
    source: 'journal',
    date: getTodayString(),
    tags: ['meeting', 'design'],
    topicIds: ['topic-1', 'page-1'],
    createdAt: new Date(),
  },
  {
    id: 'capture-3',
    content: 'Research competitor pricing strategies for Q2 planning.',
    source: 'journal',
    date: format(subDays(new Date(), 1), 'yyyy-MM-dd'),
    tags: ['research'],
    topicIds: ['topic-1'],
    createdAt: subDays(new Date(), 1),
  },
  {
    id: 'capture-4',
    content: 'Ideas for personal productivity system improvements.',
    source: 'journal',
    date: format(subDays(new Date(), 2), 'yyyy-MM-dd'),
    tags: ['productivity'],
    topicIds: ['topic-2'],
    createdAt: subDays(new Date(), 2),
  },
];

const initialTags: Tag[] = [
  { id: 'tag-1', name: 'work' },
  { id: 'tag-2', name: 'meeting' },
  { id: 'tag-3', name: 'planning' },
  { id: 'tag-4', name: 'branding' },
  { id: 'tag-5', name: 'design' },
  { id: 'tag-6', name: 'research' },
  { id: 'tag-7', name: 'productivity' },
];

// Helper to create dates for today
const today = new Date();
const createTimeToday = (hours: number, minutes: number) => {
  const date = new Date(today);
  date.setHours(hours, minutes, 0, 0);
  return date;
};

const initialMeetings: Meeting[] = [
  {
    id: 'meeting-1',
    title: 'Team standup',
    startTime: createTimeToday(9, 0),
    endTime: createTimeToday(9, 30),
    location: 'Zoom',
    isExternal: true,
    source: 'google',
  },
  {
    id: 'meeting-2',
    title: 'Product review',
    startTime: createTimeToday(14, 0),
    endTime: createTimeToday(15, 0),
    location: 'Conference Room A',
    attendees: ['John', 'Sarah', 'Mike'],
    isExternal: true,
    source: 'google',
  },
  {
    id: 'meeting-3',
    title: 'Design sync',
    startTime: createTimeToday(16, 30),
    endTime: createTimeToday(17, 15),
    location: 'Zoom',
    isExternal: true,
    source: 'google',
  },
  {
    id: 'meeting-4',
    title: '1:1 with Manager',
    startTime: createTimeToday(11, 0),
    endTime: createTimeToday(11, 30),
    isExternal: false,
    source: 'manual',
  },
];

const initialRoutineGroups: RoutineGroup[] = [];

const initialRoutines: RoutineItem[] = [];

const initialRoutineCompletions: Record<string, RoutineCompletionRecord[]> = {};

export const useKaivooStore = create<KaivooStore>()(
  persist(
    (set, get) => ({
      // Database sync
      setFromDatabase: (data) => {
        set({
          topics: data.topics,
          topicPages: data.topicPages,
          tags: data.tags,
          tasks: data.tasks,
          journalEntries: data.journalEntries,
          captures: data.captures,
          meetings: data.meetings,
          routines: data.routines,
          routineGroups: data.routineGroups,
          routineCompletions: data.routineCompletions,
          habits: data.habits,
          habitCompletions: data.habitCompletions,
          projects: data.projects,
          projectNotes: data.projectNotes,
          isLoaded: true,
        });
      },
      isLoaded: false,

      // Topics
      topics: initialTopics,
      topicPages: initialTopicPages,

      addTopic: (topicData) => {
        const topic: Topic = {
          ...topicData,
          id: `topic-${generateId()}`,
          createdAt: new Date(),
        };
        set((state) => ({ topics: [...state.topics, topic] }));
        return topic;
      },

      updateTopic: (id, updates) => {
        set((state) => ({
          topics: state.topics.map((t) => (t.id === id ? { ...t, ...updates } : t)),
        }));
      },

      deleteTopic: (id) => {
        set((state) => ({
          topics: state.topics.filter((t) => t.id !== id),
          topicPages: state.topicPages.filter((p) => p.topicId !== id),
        }));
      },

      addTopicPage: (pageData) => {
        const page: TopicPage = {
          ...pageData,
          id: `page-${generateId()}`,
          createdAt: new Date(),
        };
        set((state) => ({ topicPages: [...state.topicPages, page] }));
        return page;
      },

      updateTopicPage: (id, updates) => {
        set((state) => ({
          topicPages: state.topicPages.map((p) => (p.id === id ? { ...p, ...updates } : p)),
        }));
      },

      deleteTopicPage: (id) => {
        set((state) => ({
          topicPages: state.topicPages.filter((p) => p.id !== id),
        }));
      },

      getTopicById: (id) => {
        const { topics, topicPages } = get();
        return topics.find((t) => t.id === id) || (topicPages.find((p) => p.id === id) as Topic | undefined);
      },

      getTopicByName: (name) => {
        const { topics, topicPages } = get();
        const lowerName = name.toLowerCase();
        return (
          topics.find((t) => t.name.toLowerCase() === lowerName) ||
          (topicPages.find((p) => p.name.toLowerCase() === lowerName) as Topic | undefined)
        );
      },

      getTopicPages: (topicId) => {
        return get().topicPages.filter((p) => p.topicId === topicId);
      },

      getChildPageIds: (topicId) => {
        return get()
          .topicPages.filter((p) => p.topicId === topicId)
          .map((p) => p.id);
      },

      // Resolve [[Topic]] or [[Topic/Page]] or [[Topic/Page/SubPage]] path
      // Returns array of IDs: [topicId] for [[Topic]], or [topicId, pageId] for [[Topic/Page]]
      resolveTopicPath: (path, autoCreate = false) => {
        const parts = path
          .split('/')
          .map((p) => p.trim())
          .filter(Boolean);
        if (parts.length === 0) return null;

        const { topics, topicPages, addTopic, addTopicPage } = get();

        // First part is always a topic
        const topicName = parts[0];
        let topic = topics.find((t) => t.name.toLowerCase() === topicName.toLowerCase());

        if (!topic) {
          if (!autoCreate) return null;
          topic = addTopic({ name: topicName });
        }

        // If only topic name, return just topic ID
        if (parts.length === 1) {
          return [topic.id];
        }

        // Handle nested pages - return BOTH topic and page IDs
        const pageName = parts.slice(1).join('/');
        let page = topicPages.find((p) => p.topicId === topic!.id && p.name.toLowerCase() === pageName.toLowerCase());

        if (!page) {
          if (!autoCreate) return null;
          page = addTopicPage({ topicId: topic.id, name: pageName });
        }

        // Return both parent topic and page - content routes to both
        return [topic.id, page.id];
      },

      // Get display path for a topic/page ID (e.g., "NUWAVE/Amani")
      getTopicPath: (id) => {
        const { topics, topicPages } = get();

        const topic = topics.find((t) => t.id === id);
        if (topic) return topic.name;

        const page = topicPages.find((p) => p.id === id);
        if (page) {
          const parentTopic = topics.find((t) => t.id === page.topicId);
          return parentTopic ? `${parentTopic.name}/${page.name}` : page.name;
        }

        return '';
      },

      // Captures
      captures: initialCaptures,

      addCapture: (captureData) => {
        const capture: Capture = {
          ...captureData,
          id: `capture-${generateId()}`,
          createdAt: new Date(),
        };
        set((state) => ({ captures: [...state.captures, capture] }));
        return capture;
      },

      updateCapture: (id, updates) => {
        set((state) => ({
          captures: state.captures.map((c) => (c.id === id ? { ...c, ...updates } : c)),
        }));
      },

      deleteCapture: (id) => {
        set((state) => ({
          captures: state.captures.filter((c) => c.id !== id),
        }));
      },

      getCapturesByTopic: (topicId) => {
        const { captures, topicPages } = get();

        // Get all page IDs that belong to this topic
        const childPageIds = topicPages.filter((p) => p.topicId === topicId).map((p) => p.id);

        // Include captures that reference this topic OR any of its child pages
        return captures.filter(
          (c) => c.topicIds.includes(topicId) || c.topicIds.some((id) => childPageIds.includes(id)),
        );
      },

      getCapturesByTag: (tagName) => {
        return get().captures.filter((c) => c.tags.includes(tagName.toLowerCase()));
      },

      getCapturesForDate: (dateStr) => {
        return get().captures.filter((c) => c.date === dateStr);
      },

      // Journal Entries
      journalEntries: initialJournalEntries,

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
          journalEntries: state.journalEntries.map((e) =>
            e.id === id ? { ...e, ...updates, updatedAt: new Date() } : e,
          ),
        }));
      },

      deleteJournalEntry: (id) => {
        set((state) => ({
          journalEntries: state.journalEntries.filter((e) => e.id !== id),
        }));
      },

      getJournalEntriesForDate: (date) => {
        return get()
          .journalEntries.filter((e) => e.date === date)
          .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
      },

      getJournalEntriesByTopic: (topicId) => {
        const { journalEntries, topicPages } = get();

        // Get all page IDs that belong to this topic
        const childPageIds = topicPages.filter((p) => p.topicId === topicId).map((p) => p.id);

        // Include entries that reference this topic OR any of its child pages
        return journalEntries
          .filter((e) => e.topicIds.includes(topicId) || e.topicIds.some((id) => childPageIds.includes(id)))
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      },

      getAllJournalDates: () => {
        const dates = get().journalEntries.map((e) => e.date);
        return [...new Set(dates)].sort((a, b) => b.localeCompare(a));
      },

      // Tasks
      tasks: initialTasks,

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
        set((state) => ({
          tasks: state.tasks.filter((t) => t.id !== id),
        }));
      },

      addSubtask: (taskId, title) => {
        const subtask = {
          id: `subtask-${generateId()}`,
          title,
          completed: false,
          tags: [],
          createdAt: new Date(), // Track when subtask was created for activity feed
        };
        set((state) => ({
          tasks: state.tasks.map((t) => (t.id === taskId ? { ...t, subtasks: [...t.subtasks, subtask] } : t)),
        }));
      },

      updateSubtask: (taskId, subtaskId, updates) => {
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === taskId
              ? {
                  ...t,
                  subtasks: t.subtasks.map((s) => (s.id === subtaskId ? { ...s, ...updates } : s)),
                }
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

      getTasksByTopic: (topicId) => {
        const { tasks, topicPages } = get();

        // Get all page IDs that belong to this topic
        const childPageIds = topicPages.filter((p) => p.topicId === topicId).map((p) => p.id);

        // Include tasks that reference this topic OR any of its child pages
        return tasks.filter((t) => t.topicIds.includes(topicId) || t.topicIds.some((id) => childPageIds.includes(id)));
      },

      getTasksByTag: (tagName) => {
        return get().tasks.filter((t) => t.tags.includes(tagName.toLowerCase()));
      },

      getTasksDueToday: () => {
        return get().tasks.filter((t) => t.dueDate === 'Today' && t.status !== 'done');
      },

      getTasksForDate: (date) => {
        const isToday = isSameDay(date, new Date());
        const tasks = get().tasks;

        // Parse a due_date string to check if it matches the target date
        const isDueDateMatch = (dueDate: string | undefined, targetDate: Date): boolean => {
          if (!dueDate) return false;

          // Handle relative dates only for today
          if (dueDate === 'Today') return isToday;
          if (dueDate === 'Tomorrow') return isSameDay(addDays(new Date(), 1), targetDate);

          // Try to parse as date string
          try {
            const parsed = parseISO(dueDate);
            if (isValid(parsed)) {
              return isSameDay(parsed, targetDate);
            }
            // Try general date parsing
            const generalParsed = new Date(dueDate);
            if (isValid(generalParsed)) {
              return isSameDay(generalParsed, targetDate);
            }
          } catch {
            // Not a parseable date
          }

          return false;
        };

        // Pending: tasks due on this date that are not done
        const pending = tasks.filter((t) => {
          if (t.status === 'done') return false;
          return isDueDateMatch(t.dueDate, date);
        });

        // Completed: tasks that were completed on this date (based on completedAt timestamp)
        const completed = tasks.filter((t) => {
          if (t.status === 'done' && t.completedAt) {
            // Handle both Date objects and ISO strings (from localStorage hydration)
            const completedAt = new Date(t.completedAt);
            return isSameDay(completedAt, date);
          }
          return false;
        });

        return { pending, completed };
      },

      getCompletedTasksThisWeek: () => {
        const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 }); // Monday
        return get().tasks.filter((t) => {
          if (t.status !== 'done' || !t.completedAt) return false;
          // Handle both Date objects and ISO strings (from localStorage hydration)
          const completedAt = new Date(t.completedAt);
          return completedAt >= weekStart;
        });
      },

      // Tags
      tags: initialTags,

      addTag: (name) => {
        const tag: Tag = {
          id: `tag-${generateId()}`,
          name: name.toLowerCase(),
        };
        set((state) => ({ tags: [...state.tags, tag] }));
        return tag;
      },

      getOrCreateTag: (name) => {
        const existing = get().tags.find((t) => t.name.toLowerCase() === name.toLowerCase());
        if (existing) return existing;
        return get().addTag(name);
      },

      // Meetings
      meetings: initialMeetings,

      addMeeting: (meetingData) => {
        const meeting: Meeting = {
          ...meetingData,
          id: `meeting-${generateId()}`,
        };
        set((state) => ({ meetings: [...state.meetings, meeting] }));
        return meeting;
      },

      updateMeeting: (id, updates) => {
        set((state) => ({
          meetings: state.meetings.map((m) => (m.id === id ? { ...m, ...updates } : m)),
        }));
      },

      deleteMeeting: (id) => {
        set((state) => ({
          meetings: state.meetings.filter((m) => m.id !== id),
        }));
      },

      getMeetingsForDate: (date) => {
        const targetDate = date.toDateString();
        return get()
          .meetings.filter((m) => {
            const startTime = new Date(m.startTime);
            return startTime.toDateString() === targetDate;
          })
          .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
      },

      getMeetingsForDateRange: (start, end) => {
        const startMs = start.getTime();
        const endMs = end.getTime();
        return get()
          .meetings.filter((m) => {
            const ms = new Date(m.startTime).getTime();
            return ms >= startMs && ms <= endMs;
          })
          .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
      },

      getTodaysMeetings: () => {
        return get().getMeetingsForDate(new Date());
      },

      // Routines
      routines: initialRoutines,
      routineGroups: initialRoutineGroups,
      routineCompletions: initialRoutineCompletions,

      addRoutine: (name, icon, groupId) => {
        const routines = get().routines;
        const groupRoutines = routines.filter((r) => r.groupId === groupId);
        const routine: RoutineItem = {
          id: `routine-${generateId()}`,
          name,
          icon,
          order: groupRoutines.length,
          groupId,
        };
        set((state) => ({ routines: [...state.routines, routine] }));
        return routine;
      },

      removeRoutine: (id) => {
        set((state) => ({
          routines: state.routines.filter((r) => r.id !== id),
        }));
      },

      updateRoutine: (id, updates) => {
        set((state) => ({
          routines: state.routines.map((r) => (r.id === id ? { ...r, ...updates } : r)),
        }));
      },

      addRoutineGroup: (name, icon, color) => {
        const groups = get().routineGroups;
        const group: RoutineGroup = {
          id: `group-${generateId()}`,
          name,
          icon,
          color,
          order: groups.length,
          createdAt: new Date(),
        };
        set((state) => ({ routineGroups: [...state.routineGroups, group] }));
        return group;
      },

      removeRoutineGroup: (id) => {
        set((state) => ({
          routineGroups: state.routineGroups.filter((g) => g.id !== id),
          // Orphan routines (set groupId to undefined) instead of deleting them
          routines: state.routines.map((r) => (r.groupId === id ? { ...r, groupId: undefined } : r)),
        }));
      },

      updateRoutineGroup: (id, updates) => {
        set((state) => ({
          routineGroups: state.routineGroups.map((g) => (g.id === id ? { ...g, ...updates } : g)),
        }));
      },

      getRoutinesByGroup: (groupId) => {
        return get()
          .routines.filter((r) => r.groupId === groupId)
          .sort((a, b) => a.order - b.order);
      },

      toggleRoutineCompletion: (routineId, date) => {
        const dateStr = date || getTodayString();
        set((state) => {
          const currentCompletions = state.routineCompletions[dateStr] || [];
          const isCompleted = currentCompletions.some((c) => c.routineId === routineId);

          return {
            routineCompletions: {
              ...state.routineCompletions,
              [dateStr]: isCompleted
                ? currentCompletions.filter((c) => c.routineId !== routineId)
                : [...currentCompletions, { routineId, completedAt: new Date() }],
            },
          };
        });
      },

      getCompletionsForDate: (date) => {
        return get().routineCompletions[date] || [];
      },

      isRoutineCompleted: (routineId, date) => {
        const dateStr = date || getTodayString();
        const completions = get().routineCompletions[dateStr] || [];
        return completions.some((c) => c.routineId === routineId);
      },

      getRoutineCompletionRate: (date, groupId) => {
        const routines = groupId !== undefined ? get().getRoutinesByGroup(groupId) : get().routines;
        const completions = get().getCompletionsForDate(date);
        if (routines.length === 0) return 0;
        const groupCompletions = completions.filter((c) => routines.some((r) => r.id === c.routineId));
        return (groupCompletions.length / routines.length) * 100;
      },

      getWeeklyRoutineStats: (groupId, weekOffset = 0, weekStartsOn = 1) => {
        const { getRoutinesByGroup, routines, getCompletionsForDate } = get();
        const targetRoutines = groupId !== undefined ? getRoutinesByGroup(groupId) : routines;

        // Week with configurable start day and offset support
        const today = new Date();
        const offsetDate = new Date(today);
        offsetDate.setDate(today.getDate() + weekOffset * 7);

        const weekStart = startOfWeek(offsetDate, { weekStartsOn });
        const weekEnd = endOfWeek(offsetDate, { weekStartsOn });
        const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

        return days.map((day) => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const allCompletions = getCompletionsForDate(dateStr);
          const groupCompletions = allCompletions.filter((c) => targetRoutines.some((r) => r.id === c.routineId));
          return {
            date: dateStr,
            completed: groupCompletions.length,
            total: targetRoutines.length,
          };
        });
      },

      getWeeklySummary: () => {
        const { tasks, captures, routines, routineCompletions } = get();
        const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 }); // Monday
        const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });
        const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

        // Tasks completed this week
        const tasksCompleted = tasks.filter(
          (t) => t.status === 'done' && t.completedAt && t.completedAt >= weekStart && t.completedAt <= weekEnd,
        ).length;

        // Captures made this week
        const capturesMade = captures.filter((c) => {
          const captureDate = new Date(c.date);
          return captureDate >= weekStart && captureDate <= weekEnd;
        }).length;

        // Routine completions this week
        let totalRoutineCompletions = 0;
        let totalPossibleCompletions = 0;

        days.forEach((day) => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const dayCompletions = routineCompletions[dateStr] || [];
          totalRoutineCompletions += dayCompletions.length;
          // Only count days up to and including today
          if (day <= new Date()) {
            totalPossibleCompletions += routines.length;
          }
        });

        const routineCompletionRate =
          totalPossibleCompletions > 0 ? Math.round((totalRoutineCompletions / totalPossibleCompletions) * 100) : 0;

        return {
          tasksCompleted,
          capturesMade,
          routinesCompleted: totalRoutineCompletions,
          routineCompletionRate,
        };
      },

      // Projects
      projects: [],

      addProject: (projectData) => {
        const now = new Date();
        const project: Project = {
          ...projectData,
          id: `project-${generateId()}`,
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({ projects: [...state.projects, project] }));
        return project;
      },

      updateProject: (id, updates) => {
        set((state) => ({
          projects: state.projects.map((p) => (p.id === id ? { ...p, ...updates, updatedAt: new Date() } : p)),
        }));
      },

      deleteProject: (id) => {
        set((state) => ({
          projects: state.projects.filter((p) => p.id !== id),
          // Orphan tasks that belonged to this project
          tasks: state.tasks.map((t) => (t.projectId === id ? { ...t, projectId: undefined } : t)),
          // Delete notes that belonged to this project (CASCADE)
          projectNotes: (state.projectNotes || []).filter((n) => n.projectId !== id),
        }));
      },

      getTasksByProject: (projectId) => {
        return get().tasks.filter((t) => t.projectId === projectId);
      },

      // Project Notes
      projectNotes: [],

      addProjectNote: (noteData) => {
        const now = new Date();
        const note: ProjectNote = {
          ...noteData,
          id: `note-${generateId()}`,
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({ projectNotes: [note, ...(state.projectNotes || [])] }));
        return note;
      },

      updateProjectNote: (id, updates) => {
        set((state) => ({
          projectNotes: (state.projectNotes || []).map((n) =>
            n.id === id ? { ...n, ...updates, updatedAt: new Date() } : n,
          ),
        }));
      },

      deleteProjectNote: (id) => {
        set((state) => ({
          projectNotes: (state.projectNotes || []).filter((n) => n.id !== id),
        }));
      },

      getNotesByProject: (projectId) => {
        return (get().projectNotes || [])
          .filter((n) => n.projectId === projectId)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      },

      // Habits (Sprint 17)
      habits: [],
      habitCompletions: {},

      getHabitsByTimeBlock: (timeBlock) => {
        return get()
          .habits.filter((h) => h.timeBlock === timeBlock && !h.isArchived)
          .sort((a, b) => a.order - b.order);
      },

      isHabitCompleted: (habitId, date) => {
        const dateStr = date || getTodayString();
        const completions = get().habitCompletions[dateStr] || [];
        return completions.some((c) => c.habitId === habitId && !c.skipped);
      },

      getHabitCompletionCount: (habitId, date) => {
        const dateStr = date || getTodayString();
        const completions = get().habitCompletions[dateStr] || [];
        const completion = completions.find((c) => c.habitId === habitId);
        return completion?.count || 0;
      },

      getHabitCompletionsForDate: (date) => {
        return get().habitCompletions[date] || [];
      },

      toggleHabitCompletion: (habitId, date) => {
        const dateStr = date || getTodayString();
        const isCompleted = get().isHabitCompleted(habitId, dateStr);
        set((state) => {
          const completions = { ...state.habitCompletions };
          if (isCompleted) {
            completions[dateStr] = (completions[dateStr] || []).filter((c) => c.habitId !== habitId);
          } else {
            completions[dateStr] = [
              ...(completions[dateStr] || []),
              { habitId, skipped: false, completedAt: new Date() },
            ];
          }
          return { habitCompletions: completions };
        });
      },

      incrementHabitCount: (habitId, date) => {
        const dateStr = date || getTodayString();
        set((state) => {
          const completions = { ...state.habitCompletions };
          const dateCompletions = [...(completions[dateStr] || [])];
          const idx = dateCompletions.findIndex((c) => c.habitId === habitId);
          if (idx >= 0) {
            dateCompletions[idx] = { ...dateCompletions[idx], count: (dateCompletions[idx].count || 0) + 1 };
          } else {
            dateCompletions.push({ habitId, count: 1, skipped: false, completedAt: new Date() });
          }
          completions[dateStr] = dateCompletions;
          return { habitCompletions: completions };
        });
      },

      getHabitCompletionRate: (date) => {
        const habits = get().habits.filter((h) => !h.isArchived);
        if (habits.length === 0) return 0;
        const completions = get().habitCompletions[date] || [];
        const completed = habits.filter((h) => completions.some((c) => c.habitId === h.id && !c.skipped)).length;
        return Math.round((completed / habits.length) * 100);
      },

      addHabit: (habitData) => {
        const habit: Habit = {
          ...habitData,
          id: `habit-${generateId()}`,
          strength: 0,
          currentStreak: 0,
          bestStreak: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        set((state) => ({ habits: [...state.habits, habit] }));
        return habit;
      },

      updateHabitInStore: (id, updates) => {
        set((state) => ({
          habits: state.habits.map((h) => (h.id === id ? { ...h, ...updates, updatedAt: new Date() } : h)),
        }));
      },

      removeHabit: (id) => {
        set((state) => ({
          habits: state.habits.filter((h) => h.id !== id),
        }));
      },

      // UI State
      sidebarCollapsed: false,
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
    }),
    {
      name: 'kaivoo-storage',
      partialize: (state) => ({
        topics: state.topics,
        topicPages: state.topicPages,
        captures: state.captures,
        journalEntries: state.journalEntries,
        tasks: state.tasks,
        tags: state.tags,
        meetings: state.meetings,
        routines: state.routines,
        routineGroups: state.routineGroups,
        routineCompletions: state.routineCompletions,
        habits: state.habits,
        habitCompletions: state.habitCompletions,
        projects: state.projects,
        projectNotes: state.projectNotes,
        sidebarCollapsed: state.sidebarCollapsed,
      }),
    },
  ),
);
