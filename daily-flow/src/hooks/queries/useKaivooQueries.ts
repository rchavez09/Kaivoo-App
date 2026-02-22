import { useQueries } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { useKaivooStore } from '@/stores/useKaivooStore';
import { Subtask } from '@/types';
import { Tables } from '@/integrations/supabase/types';
import { queryKeys } from './queryKeys';

import * as TasksService from '@/services/tasks.service';
import * as TopicsService from '@/services/topics.service';
import * as JournalService from '@/services/journal.service';
import * as CapturesService from '@/services/captures.service';
import * as MeetingsService from '@/services/meetings.service';
import * as RoutinesService from '@/services/routines.service';

const STALE_TIME = 5 * 60 * 1000; // 5 minutes

/**
 * Master data sync hook — replaces useDatabase.
 * Uses React Query for caching/invalidation and syncs results to Zustand store.
 * Components still read from useKaivooStore; React Query handles fetching lifecycle.
 */
export function useKaivooQueries() {
  const { user } = useAuth();
  const setFromDatabase = useKaivooStore(s => s.setFromDatabase);
  const userId = user?.id ?? '';

  const results = useQueries({
    queries: [
      {
        queryKey: queryKeys.topics(userId),
        queryFn: () => TopicsService.fetchTopics(userId),
        enabled: !!user,
        staleTime: STALE_TIME,
      },
      {
        queryKey: queryKeys.topicPages(userId),
        queryFn: () => TopicsService.fetchTopicPages(userId),
        enabled: !!user,
        staleTime: STALE_TIME,
      },
      {
        queryKey: queryKeys.tags(userId),
        queryFn: () => TopicsService.fetchTags(userId),
        enabled: !!user,
        staleTime: STALE_TIME,
      },
      {
        queryKey: queryKeys.tasks(userId),
        queryFn: () => TasksService.fetchTasks(userId),
        enabled: !!user,
        staleTime: STALE_TIME,
      },
      {
        queryKey: queryKeys.subtasks(userId),
        queryFn: () => TasksService.fetchSubtasks(userId),
        enabled: !!user,
        staleTime: STALE_TIME,
      },
      {
        queryKey: queryKeys.journalEntries(userId),
        queryFn: () => JournalService.fetchJournalEntries(userId),
        enabled: !!user,
        staleTime: STALE_TIME,
      },
      {
        queryKey: queryKeys.captures(userId),
        queryFn: () => CapturesService.fetchCaptures(userId),
        enabled: !!user,
        staleTime: STALE_TIME,
      },
      {
        queryKey: queryKeys.meetings(userId),
        queryFn: () => MeetingsService.fetchMeetings(userId),
        enabled: !!user,
        staleTime: STALE_TIME,
      },
      {
        queryKey: queryKeys.routines(userId),
        queryFn: () => RoutinesService.fetchRoutines(userId),
        enabled: !!user,
        staleTime: STALE_TIME,
      },
      {
        queryKey: queryKeys.routineGroups(userId),
        queryFn: () => RoutinesService.fetchRoutineGroups(userId),
        enabled: !!user,
        staleTime: STALE_TIME,
      },
      {
        queryKey: queryKeys.routineCompletions(userId),
        queryFn: () => RoutinesService.fetchRoutineCompletions(userId),
        enabled: !!user,
        staleTime: STALE_TIME,
      },
    ],
    combine: (queryResults) => {
      const allSuccess = queryResults.every(r => r.isSuccess);
      const anyLoading = queryResults.some(r => r.isLoading);
      const anyError = queryResults.find(r => r.error);

      // Only sync to store when ALL queries have fresh data
      if (allSuccess) {
        const [
          topicsResult, topicPagesResult, tagsResult, tasksResult,
          subtasksResult, journalResult, capturesResult, meetingsResult,
          routinesResult, routineGroupsResult, routineCompletionsResult,
        ] = queryResults;

        // Group subtasks by task_id
        const subtasksByTask: Record<string, Subtask[]> = {};
        (subtasksResult.data as Tables<'subtasks'>[] || []).forEach((s) => {
          if (!subtasksByTask[s.task_id]) subtasksByTask[s.task_id] = [];
          subtasksByTask[s.task_id].push({
            id: s.id,
            title: s.title,
            completed: s.completed,
            completedAt: s.completed_at ? new Date(s.completed_at) : undefined,
            tags: s.tags || [],
          });
        });

        // Convert routine completions
        const completionsMap: Record<string, { routineId: string; completedAt: Date }[]> = {};
        (routineCompletionsResult.data as Tables<'routine_completions'>[] || []).forEach((rc) => {
          if (!completionsMap[rc.date]) completionsMap[rc.date] = [];
          completionsMap[rc.date].push({
            routineId: rc.routine_id,
            completedAt: new Date(rc.completed_at),
          });
        });

        setFromDatabase({
          topics: (topicsResult.data || []).map(TopicsService.dbToTopic),
          topicPages: (topicPagesResult.data || []).map(TopicsService.dbToTopicPage),
          tags: (tagsResult.data || []).map(TopicsService.dbToTag),
          tasks: (tasksResult.data as Tables<'tasks'>[] || []).map(
            (t) => TasksService.dbToTask(t, subtasksByTask[t.id] || [])
          ),
          journalEntries: (journalResult.data || []).map(JournalService.dbToJournalEntry),
          captures: (capturesResult.data || []).map(CapturesService.dbToCapture),
          meetings: (meetingsResult.data || []).map(MeetingsService.dbToMeeting),
          routines: (routinesResult.data || []).map(RoutinesService.dbToRoutine),
          routineGroups: (routineGroupsResult.data || []).map(RoutinesService.dbToRoutineGroup),
          routineCompletions: completionsMap,
        });
      }

      return {
        isLoading: anyLoading,
        isSuccess: allSuccess,
        error: anyError?.error ?? null,
      };
    },
  });

  return results;
}
