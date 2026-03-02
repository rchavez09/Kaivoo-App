import { useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { useKaivooStore } from '@/stores/useKaivooStore';
import { Subtask } from '@/types';
import { Tables } from '@/integrations/supabase/types';

// Import from service layer
import * as TasksService from '@/services/tasks.service';
import * as JournalService from '@/services/journal.service';
import * as CapturesService from '@/services/captures.service';
import * as TopicsService from '@/services/topics.service';
import * as MeetingsService from '@/services/meetings.service';
import * as RoutinesService from '@/services/routines.service';
import * as ProjectsService from '@/services/projects.service';
import * as ProjectNotesService from '@/services/project-notes.service';

export const useDatabase = (options?: { autoLoad?: boolean }) => {
  const { user } = useAuth();
  const setFromDatabase = useKaivooStore((s) => s.setFromDatabase);
  const autoLoad = options?.autoLoad ?? true;

  const loadData = useCallback(async () => {
    if (!user) return;

    try {
      const [
        topicsData,
        topicPagesData,
        tagsData,
        tasksData,
        subtasksData,
        journalEntriesData,
        capturesData,
        meetingsData,
        routinesData,
        routineGroupsData,
        routineCompletionsData,
        projectsData,
        projectNotesData,
      ] = await Promise.all([
        TopicsService.fetchTopics(user.id),
        TopicsService.fetchTopicPages(user.id),
        TopicsService.fetchTags(user.id),
        TasksService.fetchTasks(user.id),
        TasksService.fetchSubtasks(user.id),
        JournalService.fetchJournalEntries(user.id),
        CapturesService.fetchCaptures(user.id),
        MeetingsService.fetchMeetings(user.id),
        RoutinesService.fetchRoutines(user.id),
        RoutinesService.fetchRoutineGroups(user.id),
        RoutinesService.fetchRoutineCompletions(user.id),
        ProjectsService.fetchProjects(user.id),
        ProjectNotesService.fetchProjectNotes(user.id),
      ]);

      // Group subtasks by task_id
      const subtasksByTask: Record<string, Subtask[]> = {};
      subtasksData.forEach((s: Tables<'subtasks'>) => {
        if (!subtasksByTask[s.task_id]) subtasksByTask[s.task_id] = [];
        subtasksByTask[s.task_id].push({
          id: s.id,
          title: s.title,
          completed: s.completed,
          completedAt: s.completed_at ? new Date(s.completed_at) : undefined,
          tags: s.tags || [],
        });
      });

      // Convert routine completions to store format
      const completionsMap: Record<string, { routineId: string; completedAt: Date }[]> = {};
      routineCompletionsData.forEach((rc: Tables<'routine_completions'>) => {
        if (!completionsMap[rc.date]) completionsMap[rc.date] = [];
        completionsMap[rc.date].push({
          routineId: rc.routine_id,
          completedAt: new Date(rc.completed_at),
        });
      });

      setFromDatabase({
        topics: topicsData.map(TopicsService.dbToTopic),
        topicPages: topicPagesData.map(TopicsService.dbToTopicPage),
        tags: tagsData.map(TopicsService.dbToTag),
        tasks: tasksData.map((t: Tables<'tasks'>) => TasksService.dbToTask(t, subtasksByTask[t.id] || [])),
        journalEntries: journalEntriesData.map(JournalService.dbToJournalEntry),
        captures: capturesData.map(CapturesService.dbToCapture),
        meetings: meetingsData.map(MeetingsService.dbToMeeting),
        routines: routinesData.map(RoutinesService.dbToRoutine),
        routineGroups: routineGroupsData.map(RoutinesService.dbToRoutineGroup),
        routineCompletions: completionsMap,
        projects: projectsData.map(ProjectsService.dbToProject),
        projectNotes: projectNotesData.map(ProjectNotesService.dbToProjectNote),
      });
    } catch (error) {
      console.error('Error loading data from database:', error);
    }
  }, [user?.id, setFromDatabase]);

  useEffect(() => {
    if (!autoLoad) return;
    loadData();
  }, [autoLoad, loadData]);

  return { reload: loadData };
};

// Database operation hooks for CRUD — delegates to service layer
export const useDatabaseOperations = () => {
  const { user } = useAuth();

  const ensureAuth = () => {
    if (!user) throw new Error('Not authenticated');
    return user.id;
  };

  return {
    createTask: (task: Parameters<typeof TasksService.createTask>[1]) => TasksService.createTask(ensureAuth(), task),
    updateTask: (id: string, updates: Parameters<typeof TasksService.updateTask>[2]) => TasksService.updateTask(ensureAuth(), id, updates),
    deleteTask: (id: string) => TasksService.deleteTask(ensureAuth(), id),
    createSubtask: (taskId: string, title: string) => TasksService.createSubtask(ensureAuth(), taskId, title),
    updateSubtask: (id: string, updates: Parameters<typeof TasksService.updateSubtask>[2]) => TasksService.updateSubtask(ensureAuth(), id, updates),
    deleteSubtask: (id: string) => TasksService.deleteSubtask(ensureAuth(), id),
    createTopic: (topic: Parameters<typeof TopicsService.createTopic>[1]) => TopicsService.createTopic(ensureAuth(), topic),
    updateTopic: (id: string, updates: Parameters<typeof TopicsService.updateTopic>[2]) => TopicsService.updateTopic(ensureAuth(), id, updates),
    deleteTopic: (id: string) => TopicsService.deleteTopic(ensureAuth(), id),
    createTopicPage: (page: Parameters<typeof TopicsService.createTopicPage>[1]) => TopicsService.createTopicPage(ensureAuth(), page),
    updateTopicPage: (id: string, updates: Parameters<typeof TopicsService.updateTopicPage>[2]) => TopicsService.updateTopicPage(ensureAuth(), id, updates),
    deleteTopicPage: (id: string) => TopicsService.deleteTopicPage(ensureAuth(), id),
    createTag: (name: string, color?: string) => TopicsService.createTag(ensureAuth(), name, color),
    createJournalEntry: (entry: Parameters<typeof JournalService.createJournalEntry>[1]) => JournalService.createJournalEntry(ensureAuth(), entry),
    updateJournalEntry: (id: string, updates: Parameters<typeof JournalService.updateJournalEntry>[2]) => JournalService.updateJournalEntry(ensureAuth(), id, updates),
    deleteJournalEntry: (id: string) => JournalService.deleteJournalEntry(ensureAuth(), id),
    createCapture: (capture: Parameters<typeof CapturesService.createCapture>[1]) => CapturesService.createCapture(ensureAuth(), capture),
    updateCapture: (id: string, updates: Parameters<typeof CapturesService.updateCapture>[2]) => CapturesService.updateCapture(ensureAuth(), id, updates),
    deleteCapture: (id: string) => CapturesService.deleteCapture(ensureAuth(), id),
    createMeeting: (meeting: Parameters<typeof MeetingsService.createMeeting>[1]) => MeetingsService.createMeeting(ensureAuth(), meeting),
    updateMeeting: (id: string, updates: Parameters<typeof MeetingsService.updateMeeting>[2]) => MeetingsService.updateMeeting(ensureAuth(), id, updates),
    deleteMeeting: (id: string) => MeetingsService.deleteMeeting(ensureAuth(), id),
    createRoutine: (name: string, icon?: string, order?: number, groupId?: string) => RoutinesService.createRoutine(ensureAuth(), name, icon, order, groupId),
    updateRoutine: (id: string, updates: Parameters<typeof RoutinesService.updateRoutine>[2]) => RoutinesService.updateRoutine(ensureAuth(), id, updates),
    deleteRoutine: (id: string) => RoutinesService.deleteRoutine(ensureAuth(), id),
    createRoutineGroup: (name: string, icon?: string, color?: string, order?: number) => RoutinesService.createRoutineGroup(ensureAuth(), name, icon, color, order),
    updateRoutineGroup: (id: string, updates: Parameters<typeof RoutinesService.updateRoutineGroup>[2]) => RoutinesService.updateRoutineGroup(ensureAuth(), id, updates),
    deleteRoutineGroup: (id: string) => RoutinesService.deleteRoutineGroup(ensureAuth(), id),
    toggleRoutineCompletion: (routineId: string, date: string, isCompleted: boolean) => RoutinesService.toggleRoutineCompletion(ensureAuth(), routineId, date, isCompleted),
    createProject: (project: Parameters<typeof ProjectsService.createProject>[1]) => ProjectsService.createProject(ensureAuth(), project),
    updateProject: (id: string, updates: Parameters<typeof ProjectsService.updateProject>[2]) => ProjectsService.updateProject(ensureAuth(), id, updates),
    deleteProject: (id: string) => ProjectsService.deleteProject(ensureAuth(), id),
    createProjectNote: (note: Parameters<typeof ProjectNotesService.createProjectNote>[1]) => ProjectNotesService.createProjectNote(ensureAuth(), note),
    updateProjectNote: (id: string, updates: Parameters<typeof ProjectNotesService.updateProjectNote>[2]) => ProjectNotesService.updateProjectNote(ensureAuth(), id, updates),
    deleteProjectNote: (id: string) => ProjectNotesService.deleteProjectNote(ensureAuth(), id),
  };
};
