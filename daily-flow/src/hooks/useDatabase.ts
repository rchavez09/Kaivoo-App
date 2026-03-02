import { useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { useKaivooStore } from '@/stores/useKaivooStore';
import { useAdapters } from '@/lib/adapters';
import {
  Task,
  Subtask,
  Topic,
  TopicPage,
  JournalEntry,
  Capture,
  Meeting,
  RoutineItem,
  RoutineGroup,
  Project,
  ProjectNote,
} from '@/types';

export const useDatabase = (options?: { autoLoad?: boolean }) => {
  const { user } = useAuth();
  const { data: adapter } = useAdapters();
  const setFromDatabase = useKaivooStore((s) => s.setFromDatabase);
  const autoLoad = options?.autoLoad ?? true;

  const loadData = useCallback(async () => {
    if (!user || !adapter) return;

    try {
      const [
        topics,
        topicPages,
        tags,
        tasks,
        subtasks,
        journalEntries,
        captures,
        meetings,
        routines,
        routineGroups,
        routineCompletions,
        projects,
        projectNotes,
      ] = await Promise.all([
        adapter.topics.fetchAll(),
        adapter.topicPages.fetchAll(),
        adapter.tags.fetchAll(),
        adapter.tasks.fetchAll(),
        adapter.subtasks.fetchAll(),
        adapter.journalEntries.fetchAll(),
        adapter.captures.fetchAll(),
        adapter.meetings.fetchAll(),
        adapter.routines.fetchAll(),
        adapter.routineGroups.fetchAll(),
        adapter.routineCompletions.fetchAll(),
        adapter.projects.fetchAll(),
        adapter.projectNotes.fetchAll(),
      ]);

      // Group subtasks by taskId
      const subtasksByTask: Record<string, Subtask[]> = {};
      subtasks.forEach((s) => {
        if (!subtasksByTask[s.taskId]) subtasksByTask[s.taskId] = [];
        subtasksByTask[s.taskId].push(s);
      });

      // Convert routine completions to store format
      const completionsMap: Record<string, { routineId: string; completedAt: Date }[]> = {};
      routineCompletions.forEach((rc) => {
        if (!completionsMap[rc.date]) completionsMap[rc.date] = [];
        completionsMap[rc.date].push({
          routineId: rc.routineId,
          completedAt: rc.completedAt,
        });
      });

      setFromDatabase({
        topics,
        topicPages,
        tags,
        tasks: tasks.map((t) => ({
          ...t,
          subtasks: subtasksByTask[t.id] || [],
        })),
        journalEntries,
        captures,
        meetings,
        routines,
        routineGroups,
        routineCompletions: completionsMap,
        projects,
        projectNotes,
      });
    } catch (error) {
      console.error('Error loading data from database:', error);
    }
  }, [user?.id, adapter, setFromDatabase]);

  useEffect(() => {
    if (!autoLoad) return;
    loadData();
  }, [autoLoad, loadData]);

  return { reload: loadData };
};

// Database operation hooks for CRUD — delegates to adapter layer.
// Preserves the same function signatures that useKaivooActions expects.
export const useDatabaseOperations = () => {
  const { data: adapter } = useAdapters();

  const ensureAdapter = () => {
    if (!adapter) throw new Error('Not authenticated');
    return adapter;
  };

  return {
    // Tasks — strip subtasks from Omit<Task, 'id' | 'createdAt'> since adapter doesn't need them
    createTask: (task: Omit<Task, 'id' | 'createdAt'>) => {
      const { subtasks: _, ...input } = task;
      return ensureAdapter().tasks.create(input);
    },
    updateTask: (id: string, updates: Partial<Task>) => ensureAdapter().tasks.update(id, updates),
    deleteTask: (id: string) => ensureAdapter().tasks.delete(id),

    // Subtasks
    createSubtask: (taskId: string, title: string) => ensureAdapter().subtasks.create({ taskId, title }),
    updateSubtask: (
      id: string,
      updates: { completed?: boolean; completedAt?: Date; title?: string; tags?: string[] },
    ) => ensureAdapter().subtasks.update(id, updates),
    deleteSubtask: (id: string) => ensureAdapter().subtasks.delete(id),

    // Topics
    createTopic: (topic: Omit<Topic, 'id' | 'createdAt'>) => ensureAdapter().topics.create(topic),
    updateTopic: (id: string, updates: { name?: string; description?: string; icon?: string }) =>
      ensureAdapter().topics.update(id, updates),
    deleteTopic: (id: string) => ensureAdapter().topics.delete(id),

    // Topic Pages
    createTopicPage: (page: Omit<TopicPage, 'id' | 'createdAt'>) => ensureAdapter().topicPages.create(page),
    updateTopicPage: (id: string, updates: { name?: string; description?: string }) =>
      ensureAdapter().topicPages.update(id, updates),
    deleteTopicPage: (id: string) => ensureAdapter().topicPages.delete(id),

    // Tags
    createTag: (name: string, color?: string) => ensureAdapter().tags.create({ name, color }),

    // Journal
    createJournalEntry: (entry: Omit<JournalEntry, 'id' | 'createdAt' | 'updatedAt' | 'timestamp'>) =>
      ensureAdapter().journalEntries.create(entry),
    updateJournalEntry: (id: string, updates: Partial<JournalEntry>) =>
      ensureAdapter().journalEntries.update(id, updates),
    deleteJournalEntry: (id: string) => ensureAdapter().journalEntries.delete(id),

    // Captures
    createCapture: (capture: Omit<Capture, 'id' | 'createdAt'>) => ensureAdapter().captures.create(capture),
    updateCapture: (id: string, updates: Partial<Capture>) => ensureAdapter().captures.update(id, updates),
    deleteCapture: (id: string) => ensureAdapter().captures.delete(id),

    // Meetings
    createMeeting: (meeting: Omit<Meeting, 'id'>) => ensureAdapter().meetings.create(meeting),
    updateMeeting: (id: string, updates: Partial<Meeting>) => ensureAdapter().meetings.update(id, updates),
    deleteMeeting: (id: string) => ensureAdapter().meetings.delete(id),

    // Routines
    createRoutine: (name: string, icon?: string, order?: number, groupId?: string) =>
      ensureAdapter().routines.create({ name, icon, order, groupId }),
    updateRoutine: (id: string, updates: Partial<RoutineItem> & { groupId?: string | null }) =>
      ensureAdapter().routines.update(id, updates),
    deleteRoutine: (id: string) => ensureAdapter().routines.delete(id),

    // Routine Groups
    createRoutineGroup: (name: string, icon?: string, color?: string, order?: number) =>
      ensureAdapter().routineGroups.create({ name, icon, color, order }),
    updateRoutineGroup: (id: string, updates: Partial<RoutineGroup>) =>
      ensureAdapter().routineGroups.update(id, updates),
    deleteRoutineGroup: (id: string) => ensureAdapter().routineGroups.delete(id),

    // Routine Completions
    toggleRoutineCompletion: (routineId: string, date: string, isCompleted: boolean) =>
      ensureAdapter().routineCompletions.toggle(routineId, date, isCompleted),

    // Projects
    createProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) =>
      ensureAdapter().projects.create(project),
    updateProject: (id: string, updates: Partial<Project>) => ensureAdapter().projects.update(id, updates),
    deleteProject: (id: string) => ensureAdapter().projects.delete(id),

    // Project Notes
    createProjectNote: (note: Pick<ProjectNote, 'projectId' | 'content'>) => ensureAdapter().projectNotes.create(note),
    updateProjectNote: (id: string, updates: Partial<Pick<ProjectNote, 'content'>>) =>
      ensureAdapter().projectNotes.update(id, updates),
    deleteProjectNote: (id: string) => ensureAdapter().projectNotes.delete(id),
  };
};
