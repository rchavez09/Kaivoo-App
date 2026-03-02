import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useKaivooActions } from '@/hooks/useKaivooActions';
import { getTodayStorageDate, formatStorageDate } from '@/lib/dateUtils';
import type { Json } from '@/integrations/supabase/types';

export interface AIActionLog {
  id: string;
  actionType: string;
  actionData: Record<string, unknown>;
  sourceInput: string;
  approvedAt: Date;
  undoneAt: Date | null;
}

interface RawActionLog {
  id: string;
  action_type: string;
  action_data: Record<string, unknown>;
  source_input: string;
  approved_at: string;
  undone_at: string | null;
}

export function useAIActionLog() {
  const { user } = useAuth();
  const { deleteTask, deleteCapture } = useKaivooActions();
  const [logs, setLogs] = useState<AIActionLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchLogs = useCallback(async () => {
    if (!user) return;

    const todayStr = getTodayStorageDate();
    // Filter to only show actions from today
    const startOfToday = `${todayStr}T00:00:00.000Z`;
    const endOfToday = `${todayStr}T23:59:59.999Z`;

    const { data, error } = await supabase
      .from('ai_action_logs')
      .select('*')
      .eq('user_id', user.id)
      .gte('approved_at', startOfToday)
      .lte('approved_at', endOfToday)
      .order('approved_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Failed to fetch AI action logs:', error);
      return;
    }

    setLogs(
      (data as RawActionLog[]).map((log) => ({
        id: log.id,
        actionType: log.action_type,
        actionData: log.action_data,
        sourceInput: log.source_input,
        approvedAt: new Date(log.approved_at),
        undoneAt: log.undone_at ? new Date(log.undone_at) : null,
      })),
    );
    setIsLoading(false);
  }, [user]);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();

    const load = async () => {
      if (!user) return;
      const todayStr = getTodayStorageDate();
      const startOfToday = `${todayStr}T00:00:00.000Z`;
      const endOfToday = `${todayStr}T23:59:59.999Z`;

      const { data, error } = await supabase
        .from('ai_action_logs')
        .select('*')
        .eq('user_id', user.id)
        .gte('approved_at', startOfToday)
        .lte('approved_at', endOfToday)
        .order('approved_at', { ascending: false })
        .limit(50)
        .abortSignal(controller.signal);

      if (cancelled || error) {
        if (error && error.code !== 'PGRST116') console.error('Failed to fetch AI action logs:', error);
        return;
      }

      setLogs(
        (data as RawActionLog[]).map((log) => ({
          id: log.id,
          actionType: log.action_type,
          actionData: log.action_data,
          sourceInput: log.source_input,
          approvedAt: new Date(log.approved_at),
          undoneAt: log.undone_at ? new Date(log.undone_at) : null,
        })),
      );
      setIsLoading(false);
    };

    load();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [user]);

  const logAction = useCallback(
    async (actionType: string, actionData: Record<string, unknown>, sourceInput: string): Promise<string | null> => {
      if (!user) return null;

      const { data, error } = await supabase
        .from('ai_action_logs')
        .insert([
          {
            user_id: user.id,
            action_type: actionType,
            action_data: actionData as Json,
            source_input: sourceInput,
          },
        ])
        .select('id')
        .single();

      if (error) {
        console.error('Failed to log AI action:', error);
        return null;
      }

      await fetchLogs();
      return data.id;
    },
    [user, fetchLogs],
  );

  const undoAction = useCallback(
    async (logId: string) => {
      if (!user) return false;

      const log = logs.find((l) => l.id === logId);
      if (!log || log.undoneAt) return false;

      // Perform undo based on action type
      try {
        const data = log.actionData as Record<string, string | string[]>;

        if (log.actionType === 'task_created' && data.taskId) {
          await deleteTask(data.taskId as string);
        } else if (log.actionType === 'capture_created' && data.captureId) {
          await deleteCapture(data.captureId as string);
        }

        // Mark as undone in database
        const { error } = await supabase
          .from('ai_action_logs')
          .update({ undone_at: new Date().toISOString() })
          .eq('id', logId);

        if (error) throw error;

        await fetchLogs();
        return true;
      } catch (error) {
        console.error('Failed to undo AI action:', error);
        return false;
      }
    },
    [user, logs, deleteTask, deleteCapture, fetchLogs],
  );

  return { logs, isLoading, logAction, undoAction, refetch: fetchLogs };
}
