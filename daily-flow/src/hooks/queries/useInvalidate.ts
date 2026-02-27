import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { queryKeys } from './queryKeys';

type EntityType = 'tasks' | 'topics' | 'topicPages' | 'tags' | 'journalEntries' | 'captures' | 'meetings' | 'routines' | 'routineGroups' | 'routineCompletions' | 'habits' | 'habitCompletions' | 'projects' | 'projectNotes';

/**
 * Hook for targeted cache invalidation — replaces the old reload() pattern.
 * Instead of re-fetching everything, only invalidate the entities that changed.
 */
export function useInvalidate() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const invalidate = useCallback((...entities: EntityType[]) => {
    if (!user) return;
    for (const entity of entities) {
      queryClient.invalidateQueries({ queryKey: queryKeys[entity](user.id) });
    }
    // Also invalidate subtasks when tasks change (they're always co-fetched)
    if (entities.includes('tasks')) {
      queryClient.invalidateQueries({ queryKey: queryKeys.subtasks(user.id) });
    }
  }, [queryClient, user]);

  const invalidateAll = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: queryKeys.all });
  }, [queryClient]);

  return { invalidate, invalidateAll };
}
