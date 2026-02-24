import { useKaivooStore } from '@/stores/useKaivooStore';
import { useDatabaseOperations } from './useDatabase';
import { useInvalidate } from './queries';
import { useAuth } from './useAuth';
import { Task, Topic, TopicPage, JournalEntry, Capture, Meeting } from '@/types';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { computeNextDueDate } from '@/lib/recurrence';

// Helper to check if a string is a valid UUID
const isValidUUID = (str: string) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
};

// This hook wraps store operations with database sync.
// Mutations are optimistic: update Zustand immediately, sync to DB, rollback on error.
// Cache invalidation is handled by React Query — no more manual reload().
export const useKaivooActions = () => {
  const { user } = useAuth();
  const store = useKaivooStore();
  const db = useDatabaseOperations();
  const { invalidate } = useInvalidate();

  // --- Tasks ---

  const addTask = async (taskData: Omit<Task, 'id' | 'createdAt'>) => {
    if (user) {
      try {
        const task = await db.createTask(taskData);
        useKaivooStore.setState(s => ({ tasks: [...s.tasks, task] }));
        invalidate('tasks');
        return task;
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : typeof e === 'object' && e !== null && 'message' in e ? String((e as Record<string, unknown>).message) : 'Unknown error';
        toast.error(`Failed to add task: ${msg}`);
        console.error('[addTask] details:', JSON.stringify(e, null, 2));
        return undefined;
      }
    }
    return store.addTask(taskData);
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    const prev = store.tasks.find(t => t.id === id);
    store.updateTask(id, updates);
    if (user) {
      try {
        await db.updateTask(id, updates);
        invalidate('tasks');
      } catch (e) {
        if (prev) store.updateTask(id, prev);
        toast.error('Failed to save task changes.');
        console.error('[updateTask]', e);
        return;
      }
    }

    // Auto-generate next occurrence for recurring tasks when marked done
    if (updates.status === 'done' && prev?.recurrence && prev.status !== 'done') {
      const nextDueDate = computeNextDueDate(prev.dueDate, prev.recurrence);
      const nextTask = await addTask({
        title: prev.title,
        description: prev.description,
        status: 'todo',
        priority: prev.priority,
        dueDate: nextDueDate,
        startDate: undefined,
        tags: [...prev.tags],
        topicIds: [...prev.topicIds],
        subtasks: [],
        sourceLink: prev.sourceLink,
        recurrence: prev.recurrence,
      });
      if (nextTask) {
        toast.success(`Next occurrence created for ${nextDueDate}`);
      }
    }
  };

  const deleteTask = async (id: string) => {
    const prev = store.tasks.find(t => t.id === id);
    store.deleteTask(id);
    if (user) {
      try {
        await db.deleteTask(id);
        invalidate('tasks');
      } catch (e) {
        if (prev) useKaivooStore.setState(s => ({ tasks: [...s.tasks, prev] }));
        toast.error('Failed to delete task.');
        console.error('[deleteTask]', e);
      }
    }
  };

  // --- Subtasks ---

  const addSubtask = async (taskId: string, title: string) => {
    if (user) {
      const subtask = await db.createSubtask(taskId, title);
      useKaivooStore.setState(s => ({
        tasks: s.tasks.map(t =>
          t.id === taskId
            ? { ...t, subtasks: [...t.subtasks, { id: subtask.id, title: subtask.title, completed: subtask.completed, tags: [] }] }
            : t
        ),
      }));
      invalidate('tasks');
      return;
    }
    store.addSubtask(taskId, title);
  };

  const toggleSubtask = async (taskId: string, subtaskId: string) => {
    const task = store.tasks.find((t) => t.id === taskId);
    const subtask = task?.subtasks.find((s) => s.id === subtaskId);
    const nextCompleted = !(subtask?.completed ?? false);

    store.toggleSubtask(taskId, subtaskId);

    if (user) {
      try {
        await db.updateSubtask(subtaskId, {
          completed: nextCompleted,
          completedAt: nextCompleted ? new Date() : undefined,
        });
        invalidate('tasks');
      } catch (e) {
        store.toggleSubtask(taskId, subtaskId);
        toast.error('Failed to update subtask.');
        console.error('[toggleSubtask]', e);
      }
    }
  };

  const updateSubtask = async (taskId: string, subtaskId: string, updates: { title?: string; tags?: string[] }) => {
    const task = store.tasks.find(t => t.id === taskId);
    const prevSubtask = task?.subtasks.find(s => s.id === subtaskId);
    store.updateSubtask(taskId, subtaskId, updates);
    if (user) {
      try {
        await db.updateSubtask(subtaskId, updates);
        invalidate('tasks');
      } catch (e) {
        if (prevSubtask) store.updateSubtask(taskId, subtaskId, { title: prevSubtask.title, tags: prevSubtask.tags });
        toast.error('Failed to update subtask.');
        console.error('[updateSubtask]', e);
      }
    }
  };

  const deleteSubtask = async (taskId: string, subtaskId: string) => {
    const task = store.tasks.find(t => t.id === taskId);
    const prevSubtask = task?.subtasks.find(s => s.id === subtaskId);
    store.deleteSubtask(taskId, subtaskId);
    if (user) {
      try {
        await db.deleteSubtask(subtaskId);
        invalidate('tasks');
      } catch (e) {
        if (prevSubtask) store.addSubtask(taskId, prevSubtask.title, prevSubtask.id);
        toast.error('Failed to delete subtask.');
        console.error('[deleteSubtask]', e);
      }
    }
  };

  // --- Meetings ---

  const addMeeting = async (meetingData: Omit<Meeting, 'id'>) => {
    if (user) {
      const meeting = await db.createMeeting(meetingData);
      useKaivooStore.setState(s => ({ meetings: [...s.meetings, meeting] }));
      invalidate('meetings');
      return meeting;
    }
    return store.addMeeting(meetingData);
  };

  const updateMeeting = async (id: string, updates: Partial<Meeting>) => {
    const prev = store.meetings.find(m => m.id === id);
    store.updateMeeting(id, updates);
    if (user) {
      try {
        await db.updateMeeting(id, updates);
        invalidate('meetings');
      } catch (e) {
        if (prev) store.updateMeeting(id, prev);
        toast.error('Failed to save meeting changes.');
        console.error('[updateMeeting]', e);
      }
    }
  };

  const deleteMeeting = async (id: string) => {
    const prev = store.meetings.find(m => m.id === id);
    store.deleteMeeting(id);
    if (user) {
      try {
        await db.deleteMeeting(id);
        invalidate('meetings');
      } catch (e) {
        if (prev) useKaivooStore.setState(s => ({ meetings: [...s.meetings, prev] }));
        toast.error('Failed to delete meeting.');
        console.error('[deleteMeeting]', e);
      }
    }
  };

  // --- Journal ---

  const addJournalEntry = async (entryData: Omit<JournalEntry, 'id' | 'createdAt' | 'updatedAt' | 'timestamp'>) => {
    const sanitizedData = {
      ...entryData,
      topicIds: (entryData.topicIds || []).filter(isValidUUID),
    };

    if (user) {
      try {
        const entry = await db.createJournalEntry(sanitizedData);
        useKaivooStore.setState(s => ({ journalEntries: [...s.journalEntries, entry] }));
        invalidate('journalEntries');
        return entry;
      } catch (e) {
        console.error('[addJournalEntry]', e);
        throw e;
      }
    }
    return store.addJournalEntry(entryData);
  };

  const updateJournalEntry = async (id: string, updates: Partial<JournalEntry>) => {
    const sanitizedUpdates = updates.topicIds
      ? { ...updates, topicIds: updates.topicIds.filter(isValidUUID) }
      : updates;

    const prev = store.journalEntries.find(e => e.id === id);
    store.updateJournalEntry(id, sanitizedUpdates);
    if (user) {
      try {
        await db.updateJournalEntry(id, sanitizedUpdates);
        invalidate('journalEntries');
      } catch (e) {
        if (prev) store.updateJournalEntry(id, prev);
        toast.error('Failed to save journal entry.');
        console.error('[updateJournalEntry]', e);
      }
    }
  };

  const deleteJournalEntry = async (id: string) => {
    const prev = store.journalEntries.find(e => e.id === id);
    store.deleteJournalEntry(id);
    if (user) {
      try {
        await db.deleteJournalEntry(id);
        invalidate('journalEntries');
      } catch (e) {
        if (prev) useKaivooStore.setState(s => ({ journalEntries: [...s.journalEntries, prev] }));
        toast.error('Failed to delete journal entry.');
        console.error('[deleteJournalEntry]', e);
      }
    }
  };

  // --- Routines ---

  const toggleRoutineCompletion = async (routineId: string, date?: string) => {
    const dateStr = date || format(new Date(), 'yyyy-MM-dd');
    const isCompleted = store.isRoutineCompleted(routineId, dateStr);
    store.toggleRoutineCompletion(routineId, dateStr);
    if (user) {
      try {
        await db.toggleRoutineCompletion(routineId, dateStr, isCompleted);
        invalidate('routineCompletions');
      } catch (e) {
        store.toggleRoutineCompletion(routineId, dateStr);
        toast.error('Failed to update routine.');
        console.error('[toggleRoutineCompletion]', e);
      }
    }
  };

  // --- Topics ---

  const addTopic = async (topicData: Omit<Topic, 'id' | 'createdAt'>) => {
    if (user) {
      try {
        const topic = await db.createTopic(topicData);
        const alreadyInStore = store.topics.some((t) => t.id === topic.id);
        if (!alreadyInStore) {
          useKaivooStore.setState(s => ({ topics: [...s.topics, topic] }));
        }
        invalidate('topics');
        return topic;
      } catch (e) {
        console.error('[addTopic]', e);
        throw e;
      }
    }
    return store.addTopic(topicData);
  };

  const addTopicPage = async (pageData: Omit<TopicPage, 'id' | 'createdAt'>) => {
    if (user) {
      try {
        const page = await db.createTopicPage(pageData);
        const alreadyInStore = store.topicPages.some((p) => p.id === page.id);
        if (!alreadyInStore) {
          useKaivooStore.setState(s => ({ topicPages: [...s.topicPages, page] }));
        }
        invalidate('topicPages');
        return page;
      } catch (e) {
        console.error('[addTopicPage]', e);
        throw e;
      }
    }
    return store.addTopicPage(pageData);
  };

  const resolveTopicPathAsync = async (path: string, autoCreate = false): Promise<string[] | null> => {
    const parts = path.split('/').map(p => p.trim()).filter(Boolean);
    if (parts.length === 0) return null;

    const topicName = parts[0];
    let topic = store.topics.find(t => t.name.toLowerCase() === topicName.toLowerCase());

    if (!topic) {
      if (!autoCreate) return null;
      topic = await addTopic({ name: topicName });
    }
    if (!topic) return null;
    if (parts.length === 1) return [topic.id];

    const pageName = parts.slice(1).join('/');
    let page = store.topicPages.find(
      p => p.topicId === topic!.id && p.name.toLowerCase() === pageName.toLowerCase()
    );

    if (!page) {
      if (!autoCreate) return null;
      page = await addTopicPage({ topicId: topic.id, name: pageName });
    }
    if (!page) return null;

    return [topic.id, page.id];
  };

  const deleteTopic = async (id: string) => {
    const prev = store.topics.find(t => t.id === id);
    store.deleteTopic(id);
    if (user) {
      try {
        await db.deleteTopic(id);
        invalidate('topics');
      } catch (e) {
        if (prev) useKaivooStore.setState(s => ({ topics: [...s.topics, prev] }));
        toast.error('Failed to delete topic.');
        console.error('[deleteTopic]', e);
      }
    }
  };

  // --- Captures ---

  const addCapture = async (captureData: Omit<Capture, 'id' | 'createdAt'>) => {
    if (user) {
      const capture = await db.createCapture(captureData);
      useKaivooStore.setState(s => ({ captures: [...s.captures, capture] }));
      invalidate('captures');
      return capture;
    }
    return store.addCapture(captureData);
  };

  const updateCapture = async (id: string, updates: Partial<Capture>) => {
    const sanitizedUpdates = updates.topicIds
      ? { ...updates, topicIds: updates.topicIds.filter(isValidUUID) }
      : updates;

    const prev = store.captures.find(c => c.id === id);
    store.updateCapture(id, sanitizedUpdates);
    if (user) {
      try {
        await db.updateCapture(id, sanitizedUpdates);
        invalidate('captures');
      } catch (e) {
        if (prev) store.updateCapture(id, prev);
        toast.error('Failed to save capture changes.');
        console.error('[updateCapture]', e);
      }
    }
  };

  const deleteCapture = async (id: string) => {
    const prev = store.captures.find(c => c.id === id);
    store.deleteCapture(id);
    if (user) {
      try {
        await db.deleteCapture(id);
        invalidate('captures');
      } catch (e) {
        if (prev) useKaivooStore.setState(s => ({ captures: [...s.captures, prev] }));
        toast.error('Failed to delete capture.');
        console.error('[deleteCapture]', e);
      }
    }
  };

  return {
    addTask, updateTask, deleteTask,
    addSubtask, toggleSubtask, updateSubtask, deleteSubtask,
    addMeeting, updateMeeting, deleteMeeting,
    addJournalEntry, updateJournalEntry, deleteJournalEntry,
    updateCapture, deleteCapture, toggleRoutineCompletion,
    addTopic, addTopicPage, deleteTopic,
    addCapture, resolveTopicPathAsync,

    // Pass through store methods for reads
    tasks: store.tasks,
    meetings: store.meetings,
    routines: store.routines,
    topics: store.topics,
  };
};
