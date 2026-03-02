import { useKaivooStore } from '@/stores/useKaivooStore';
import { useDatabaseOperations } from './useDatabase';
import { useInvalidate } from './queries';
import { useAuth } from './useAuth';
import { Task, Topic, TopicPage, JournalEntry, Capture, Meeting, Project, ProjectNote } from '@/types';
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
  const db = useDatabaseOperations();
  const { invalidate } = useInvalidate();

  // Use getState() inside mutation functions for latest state + store methods
  const getStore = () => useKaivooStore.getState();

  // --- Tasks ---

  const addTask = async (taskData: Omit<Task, 'id' | 'createdAt'>) => {
    if (user) {
      try {
        const task = await db.createTask(taskData);
        useKaivooStore.setState(s => ({ tasks: [...s.tasks, task] }));
        invalidate('tasks');
        return task;
      } catch (e: unknown) {
        toast.error('Failed to add task. Please try again.');
        console.error('[addTask]', e);
        return undefined;
      }
    }
    return getStore().addTask(taskData);
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    const prev = getStore().tasks.find(t => t.id === id);
    getStore().updateTask(id, updates);
    if (user) {
      try {
        await db.updateTask(id, updates);
        invalidate('tasks');
      } catch (e) {
        if (prev) getStore().updateTask(id, prev);
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
    const prev = getStore().tasks.find(t => t.id === id);
    getStore().deleteTask(id);
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
      try {
        const subtask = await db.createSubtask(taskId, title);
        useKaivooStore.setState(s => ({
          tasks: s.tasks.map(t =>
            t.id === taskId
              ? { ...t, subtasks: [...t.subtasks, { id: subtask.id, title: subtask.title, completed: subtask.completed, tags: [] }] }
              : t
          ),
        }));
        invalidate('tasks');
      } catch (e) {
        toast.error('Failed to add subtask.');
        console.error('[addSubtask]', e);
      }
      return;
    }
    getStore().addSubtask(taskId, title);
  };

  const toggleSubtask = async (taskId: string, subtaskId: string) => {
    const task = getStore().tasks.find((t) => t.id === taskId);
    const subtask = task?.subtasks.find((s) => s.id === subtaskId);
    const nextCompleted = !(subtask?.completed ?? false);

    getStore().toggleSubtask(taskId, subtaskId);

    if (user) {
      try {
        await db.updateSubtask(subtaskId, {
          completed: nextCompleted,
          completedAt: nextCompleted ? new Date() : undefined,
        });
        invalidate('tasks');
      } catch (e) {
        getStore().toggleSubtask(taskId, subtaskId);
        toast.error('Failed to update subtask.');
        console.error('[toggleSubtask]', e);
      }
    }
  };

  const updateSubtask = async (taskId: string, subtaskId: string, updates: { title?: string; tags?: string[] }) => {
    const task = getStore().tasks.find(t => t.id === taskId);
    const prevSubtask = task?.subtasks.find(s => s.id === subtaskId);
    getStore().updateSubtask(taskId, subtaskId, updates);
    if (user) {
      try {
        await db.updateSubtask(subtaskId, updates);
        invalidate('tasks');
      } catch (e) {
        if (prevSubtask) getStore().updateSubtask(taskId, subtaskId, { title: prevSubtask.title, tags: prevSubtask.tags });
        toast.error('Failed to update subtask.');
        console.error('[updateSubtask]', e);
      }
    }
  };

  const deleteSubtask = async (taskId: string, subtaskId: string) => {
    const task = getStore().tasks.find(t => t.id === taskId);
    const prevSubtask = task?.subtasks.find(s => s.id === subtaskId);
    getStore().deleteSubtask(taskId, subtaskId);
    if (user) {
      try {
        await db.deleteSubtask(subtaskId);
        invalidate('tasks');
      } catch (e) {
        if (prevSubtask) {
          useKaivooStore.setState(s => ({
            tasks: s.tasks.map(t =>
              t.id === taskId
                ? { ...t, subtasks: [...t.subtasks, prevSubtask] }
                : t
            ),
          }));
        }
        toast.error('Failed to delete subtask.');
        console.error('[deleteSubtask]', e);
      }
    }
  };

  // --- Meetings ---

  const addMeeting = async (meetingData: Omit<Meeting, 'id'>) => {
    if (user) {
      try {
        const meeting = await db.createMeeting(meetingData);
        useKaivooStore.setState(s => ({ meetings: [...s.meetings, meeting] }));
        invalidate('meetings');
        return meeting;
      } catch (e) {
        toast.error('Failed to add meeting.');
        console.error('[addMeeting]', e);
        return undefined;
      }
    }
    return getStore().addMeeting(meetingData);
  };

  const updateMeeting = async (id: string, updates: Partial<Meeting>) => {
    const prev = getStore().meetings.find(m => m.id === id);
    getStore().updateMeeting(id, updates);
    if (user) {
      try {
        await db.updateMeeting(id, updates);
        invalidate('meetings');
      } catch (e) {
        if (prev) getStore().updateMeeting(id, prev);
        toast.error('Failed to save meeting changes.');
        console.error('[updateMeeting]', e);
      }
    }
  };

  const deleteMeeting = async (id: string) => {
    const prev = getStore().meetings.find(m => m.id === id);
    getStore().deleteMeeting(id);
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
    return getStore().addJournalEntry(entryData);
  };

  const updateJournalEntry = async (id: string, updates: Partial<JournalEntry>) => {
    const sanitizedUpdates = updates.topicIds
      ? { ...updates, topicIds: updates.topicIds.filter(isValidUUID) }
      : updates;

    const prev = getStore().journalEntries.find(e => e.id === id);
    getStore().updateJournalEntry(id, sanitizedUpdates);
    if (user) {
      try {
        await db.updateJournalEntry(id, sanitizedUpdates);
        invalidate('journalEntries');
      } catch (e) {
        if (prev) getStore().updateJournalEntry(id, prev);
        toast.error('Failed to save journal entry.');
        console.error('[updateJournalEntry]', e);
      }
    }
  };

  const deleteJournalEntry = async (id: string) => {
    const prev = getStore().journalEntries.find(e => e.id === id);
    getStore().deleteJournalEntry(id);
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
    const isCompleted = getStore().isRoutineCompleted(routineId, dateStr);
    getStore().toggleRoutineCompletion(routineId, dateStr);
    if (user) {
      try {
        await db.toggleRoutineCompletion(routineId, dateStr, isCompleted);
        invalidate('routineCompletions');
      } catch (e) {
        getStore().toggleRoutineCompletion(routineId, dateStr);
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
        const alreadyInStore = getStore().topics.some((t) => t.id === topic.id);
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
    return getStore().addTopic(topicData);
  };

  const addTopicPage = async (pageData: Omit<TopicPage, 'id' | 'createdAt'>) => {
    if (user) {
      try {
        const page = await db.createTopicPage(pageData);
        const alreadyInStore = getStore().topicPages.some((p) => p.id === page.id);
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
    return getStore().addTopicPage(pageData);
  };

  const resolveTopicPathAsync = async (path: string, autoCreate = false): Promise<string[] | null> => {
    const parts = path.split('/').map(p => p.trim()).filter(Boolean);
    if (parts.length === 0) return null;

    const topicName = parts[0];
    let topic = getStore().topics.find(t => t.name.toLowerCase() === topicName.toLowerCase());

    if (!topic) {
      if (!autoCreate) return null;
      topic = await addTopic({ name: topicName });
    }
    if (!topic) return null;
    if (parts.length === 1) return [topic.id];

    const pageName = parts.slice(1).join('/');
    let page = getStore().topicPages.find(
      p => p.topicId === topic!.id && p.name.toLowerCase() === pageName.toLowerCase()
    );

    if (!page) {
      if (!autoCreate) return null;
      page = await addTopicPage({ topicId: topic.id, name: pageName });
    }
    if (!page) return null;

    return [topic.id, page.id];
  };

  const updateTopic = async (id: string, updates: { name?: string; description?: string; icon?: string }) => {
    const prev = getStore().topics.find(t => t.id === id);
    getStore().updateTopic(id, updates);
    if (user) {
      try {
        await db.updateTopic(id, updates);
        invalidate('topics');
      } catch (e) {
        if (prev) getStore().updateTopic(id, prev);
        toast.error('Failed to save topic changes.');
        console.error('[updateTopic]', e);
      }
    }
  };

  const deleteTopic = async (id: string) => {
    const prev = getStore().topics.find(t => t.id === id);
    getStore().deleteTopic(id);
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

  const updateTopicPage = async (id: string, updates: { name?: string; description?: string }) => {
    const prev = getStore().topicPages.find(p => p.id === id);
    getStore().updateTopicPage(id, updates);
    if (user) {
      try {
        await db.updateTopicPage(id, updates);
        invalidate('topicPages');
      } catch (e) {
        if (prev) getStore().updateTopicPage(id, prev);
        toast.error('Failed to save page changes.');
        console.error('[updateTopicPage]', e);
      }
    }
  };

  const deleteTopicPage = async (id: string) => {
    const prev = getStore().topicPages.find(p => p.id === id);
    getStore().deleteTopicPage(id);
    if (user) {
      try {
        await db.deleteTopicPage(id);
        invalidate('topicPages');
      } catch (e) {
        if (prev) useKaivooStore.setState(s => ({ topicPages: [...s.topicPages, prev] }));
        toast.error('Failed to delete page.');
        console.error('[deleteTopicPage]', e);
      }
    }
  };

  // --- Captures ---

  const addCapture = async (captureData: Omit<Capture, 'id' | 'createdAt'>) => {
    if (user) {
      try {
        const capture = await db.createCapture(captureData);
        useKaivooStore.setState(s => ({ captures: [...s.captures, capture] }));
        invalidate('captures');
        return capture;
      } catch (e) {
        toast.error('Failed to add capture.');
        console.error('[addCapture]', e);
        return undefined;
      }
    }
    return getStore().addCapture(captureData);
  };

  const updateCapture = async (id: string, updates: Partial<Capture>) => {
    const sanitizedUpdates = updates.topicIds
      ? { ...updates, topicIds: updates.topicIds.filter(isValidUUID) }
      : updates;

    const prev = getStore().captures.find(c => c.id === id);
    getStore().updateCapture(id, sanitizedUpdates);
    if (user) {
      try {
        await db.updateCapture(id, sanitizedUpdates);
        invalidate('captures');
      } catch (e) {
        if (prev) getStore().updateCapture(id, prev);
        toast.error('Failed to save capture changes.');
        console.error('[updateCapture]', e);
      }
    }
  };

  const deleteCapture = async (id: string) => {
    const prev = getStore().captures.find(c => c.id === id);
    getStore().deleteCapture(id);
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

  // --- Projects ---

  const addProject = async (projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (user) {
      try {
        const project = await db.createProject(projectData);
        useKaivooStore.setState(s => ({ projects: [...s.projects, project] }));
        invalidate('projects');
        return project;
      } catch (e: unknown) {
        toast.error('Failed to create project. Please try again.');
        console.error('[addProject]', e);
        return undefined;
      }
    }
    return getStore().addProject(projectData);
  };

  const updateProject = async (id: string, updates: Partial<Project>) => {
    const prev = getStore().projects.find(p => p.id === id);
    getStore().updateProject(id, updates);
    if (user) {
      try {
        await db.updateProject(id, updates);
        invalidate('projects');
      } catch (e) {
        if (prev) getStore().updateProject(id, prev);
        toast.error('Failed to save project changes.');
        console.error('[updateProject]', e);
      }
    }
  };

  const deleteProject = async (id: string) => {
    const prev = getStore().projects.find(p => p.id === id);
    const affectedTaskIds = getStore().tasks.filter(t => t.projectId === id).map(t => t.id);
    getStore().deleteProject(id);
    if (user) {
      try {
        await db.deleteProject(id);
        invalidate('projects', 'tasks');
      } catch (e) {
        if (prev) {
          useKaivooStore.setState(s => ({
            projects: [...s.projects, prev],
            tasks: s.tasks.map(t =>
              affectedTaskIds.includes(t.id) ? { ...t, projectId: id } : t
            ),
          }));
        }
        toast.error('Failed to delete project.');
        console.error('[deleteProject]', e);
      }
    }
  };

  // --- Project Notes ---

  const addProjectNote = async (noteData: Pick<ProjectNote, 'projectId' | 'content'>) => {
    if (user) {
      try {
        const note = await db.createProjectNote(noteData);
        useKaivooStore.setState(s => ({ projectNotes: [note, ...(s.projectNotes || [])] }));
        invalidate('projectNotes');
        return note;
      } catch (e: unknown) {
        toast.error('Failed to add note. Please try again.');
        console.error('[addProjectNote]', e);
        return undefined;
      }
    }
    return getStore().addProjectNote(noteData);
  };

  const updateProjectNote = async (id: string, updates: Partial<Pick<ProjectNote, 'content'>>) => {
    const prev = (getStore().projectNotes || []).find(n => n.id === id);
    getStore().updateProjectNote(id, updates);
    if (user) {
      try {
        await db.updateProjectNote(id, updates);
        invalidate('projectNotes');
      } catch (e) {
        if (prev) getStore().updateProjectNote(id, { content: prev.content });
        toast.error('Failed to save note changes.');
        console.error('[updateProjectNote]', e);
      }
    }
  };

  const deleteProjectNote = async (id: string) => {
    const prev = (getStore().projectNotes || []).find(n => n.id === id);
    getStore().deleteProjectNote(id);
    if (user) {
      try {
        await db.deleteProjectNote(id);
        invalidate('projectNotes');
      } catch (e) {
        if (prev) useKaivooStore.setState(s => ({ projectNotes: [...(s.projectNotes || []), prev] }));
        toast.error('Failed to delete note.');
        console.error('[deleteProjectNote]', e);
      }
    }
  };

  return {
    addTask, updateTask, deleteTask,
    addSubtask, toggleSubtask, updateSubtask, deleteSubtask,
    addMeeting, updateMeeting, deleteMeeting,
    addJournalEntry, updateJournalEntry, deleteJournalEntry,
    updateCapture, deleteCapture, toggleRoutineCompletion,
    addTopic, updateTopic, addTopicPage, updateTopicPage, deleteTopic, deleteTopicPage,
    addCapture, resolveTopicPathAsync,
    addProject, updateProject, deleteProject,
    addProjectNote, updateProjectNote, deleteProjectNote,
  };
};
