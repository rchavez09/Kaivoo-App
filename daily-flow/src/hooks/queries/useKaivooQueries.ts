import { useQueries } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { useKaivooStore } from '@/stores/useKaivooStore';
import { useAdapters } from '@/lib/adapters';
import { Subtask } from '@/types';
import { queryKeys } from './queryKeys';

const STALE_TIME = 5 * 60 * 1000; // 5 minutes

// Tracks the last dataUpdatedAt fingerprint that was synced to the Zustand store.
// Module-level so it survives DataLoader mount/unmount cycles across route changes.
// This prevents setFromDatabase() from re-running with stale cached data when
// the user navigates between pages before a mutation's invalidation completes.
let lastSyncedDataKey = '';

/**
 * Master data sync hook — replaces useDatabase.
 * Uses React Query for caching/invalidation and syncs results to Zustand store.
 * Components still read from useKaivooStore; React Query handles fetching lifecycle.
 *
 * Sprint 21 P1: Migrated from direct service imports to DataAdapter layer.
 * All reads now flow through adapter.{entity}.fetchAll() — enabling both
 * SupabaseAdapter (web) and LocalAdapter (desktop) via AdapterProvider.
 */
export function useKaivooQueries() {
  const { user } = useAuth();
  const { data: adapter } = useAdapters();
  const setFromDatabase = useKaivooStore((s) => s.setFromDatabase);
  const userId = user?.id ?? '';
  const enabled = !!user && !!adapter;

  const results = useQueries({
    queries: [
      {
        queryKey: queryKeys.topics(userId),
        queryFn: () => adapter!.topics.fetchAll(),
        enabled,
        staleTime: STALE_TIME,
      },
      {
        queryKey: queryKeys.topicPages(userId),
        queryFn: () => adapter!.topicPages.fetchAll(),
        enabled,
        staleTime: STALE_TIME,
      },
      {
        queryKey: queryKeys.tags(userId),
        queryFn: () => adapter!.tags.fetchAll(),
        enabled,
        staleTime: STALE_TIME,
      },
      {
        queryKey: queryKeys.tasks(userId),
        queryFn: () => adapter!.tasks.fetchAll(),
        enabled,
        staleTime: STALE_TIME,
      },
      {
        queryKey: queryKeys.subtasks(userId),
        queryFn: () => adapter!.subtasks.fetchAll(),
        enabled,
        staleTime: STALE_TIME,
      },
      {
        queryKey: queryKeys.journalEntries(userId),
        queryFn: () => adapter!.journalEntries.fetchAll(),
        enabled,
        staleTime: STALE_TIME,
      },
      {
        queryKey: queryKeys.captures(userId),
        queryFn: () => adapter!.captures.fetchAll(),
        enabled,
        staleTime: STALE_TIME,
      },
      {
        queryKey: queryKeys.meetings(userId),
        queryFn: () => adapter!.meetings.fetchAll(),
        enabled,
        staleTime: STALE_TIME,
      },
      {
        queryKey: queryKeys.routines(userId),
        queryFn: () => adapter!.routines.fetchAll(),
        enabled,
        staleTime: STALE_TIME,
      },
      {
        queryKey: queryKeys.routineGroups(userId),
        queryFn: () => adapter!.routineGroups.fetchAll(),
        enabled,
        staleTime: STALE_TIME,
      },
      {
        queryKey: queryKeys.routineCompletions(userId),
        queryFn: () => adapter!.routineCompletions.fetchAll(),
        enabled,
        staleTime: STALE_TIME,
      },
      {
        queryKey: queryKeys.projects(userId),
        queryFn: () => adapter!.projects.fetchAll(),
        enabled,
        staleTime: STALE_TIME,
      },
      {
        queryKey: queryKeys.projectNotes(userId),
        queryFn: () => adapter!.projectNotes.fetchAll(),
        enabled,
        staleTime: STALE_TIME,
      },
      {
        queryKey: queryKeys.habits(userId),
        queryFn: () => adapter!.habits.fetchAll(),
        enabled,
        staleTime: STALE_TIME,
      },
      {
        queryKey: queryKeys.habitCompletions(userId),
        queryFn: () => adapter!.habitCompletions.fetchAll(),
        enabled,
        staleTime: STALE_TIME,
      },
    ],
    combine: (queryResults) => {
      const allSuccess = queryResults.every((r) => r.isSuccess);
      const anyLoading = queryResults.some((r) => r.isLoading);
      const anyFetching = queryResults.some((r) => r.isFetching);
      const anyError = queryResults.find((r) => r.error);

      // Only sync to store when ALL queries have settled with genuinely fresh data.
      // Guard 1: !anyFetching — don't overwrite during background refetches
      // Guard 2: dataKey — only sync when data was actually re-fetched from the
      // server (dataUpdatedAt changes), not when stale cache is re-read on navigation.
      // This prevents optimistic Zustand updates from being overwritten by cached
      // data when the user navigates before a mutation's invalidation completes.
      if (allSuccess && !anyFetching) {
        const dataKey = queryResults.map((r) => r.dataUpdatedAt).join(',');
        if (dataKey === lastSyncedDataKey) {
          return { isLoading: anyLoading, isSuccess: allSuccess, error: anyError?.error ?? null };
        }
        lastSyncedDataKey = dataKey;

        const [
          topicsResult,
          topicPagesResult,
          tagsResult,
          tasksResult,
          subtasksResult,
          journalResult,
          capturesResult,
          meetingsResult,
          routinesResult,
          routineGroupsResult,
          routineCompletionsResult,
          projectsResult,
          projectNotesResult,
          habitsResult,
          habitCompletionsResult,
        ] = queryResults;

        // Group subtasks by taskId — adapter returns app-level Subtask[]
        const subtasksByTask: Record<string, Subtask[]> = {};
        ((subtasksResult.data as Subtask[]) || []).forEach((s) => {
          if (!subtasksByTask[s.taskId]) subtasksByTask[s.taskId] = [];
          subtasksByTask[s.taskId].push(s);
        });

        // Group routine completions by date — adapter returns RoutineCompletion[]
        const completionsMap: Record<string, { routineId: string; completedAt: Date }[]> = {};
        ((routineCompletionsResult.data as import('@/types').RoutineCompletion[]) || []).forEach(
          (rc) => {
            if (!completionsMap[rc.date]) completionsMap[rc.date] = [];
            completionsMap[rc.date].push({
              routineId: rc.routineId,
              completedAt: rc.completedAt,
            });
          },
        );

        // Group habit completions by date — adapter returns HabitCompletion[]
        const habitCompletionsMap: Record<
          string,
          { habitId: string; count?: number; skipped: boolean; completedAt: Date }[]
        > = {};
        ((habitCompletionsResult.data as import('@/types').HabitCompletion[]) || []).forEach(
          (hc) => {
            if (!habitCompletionsMap[hc.date]) habitCompletionsMap[hc.date] = [];
            habitCompletionsMap[hc.date].push({
              habitId: hc.habitId,
              count: hc.count || undefined,
              skipped: hc.skipped,
              completedAt: hc.completedAt,
            });
          },
        );

        // Adapter returns pre-converted app types — no dbToX() calls needed.
        // Only grouping/merging required for subtasks and completion maps.
        setFromDatabase({
          topics: topicsResult.data || [],
          topicPages: topicPagesResult.data || [],
          tags: tagsResult.data || [],
          tasks: ((tasksResult.data as import('@/types').Task[]) || []).map((t) => ({
            ...t,
            subtasks: subtasksByTask[t.id] || [],
          })),
          journalEntries: journalResult.data || [],
          captures: capturesResult.data || [],
          meetings: meetingsResult.data || [],
          routines: routinesResult.data || [],
          routineGroups: routineGroupsResult.data || [],
          routineCompletions: completionsMap,
          habits: habitsResult.data || [],
          habitCompletions: habitCompletionsMap,
          projects: projectsResult.data || [],
          projectNotes: projectNotesResult.data || [],
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
