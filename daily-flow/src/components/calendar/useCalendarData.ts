import { useMemo } from 'react';
import { format, startOfDay, endOfDay, isWithinInterval } from 'date-fns';
import { useKaivooStore } from '@/stores/useKaivooStore';
import { resolveTaskDay } from '@/lib/dateUtils';
import type { Meeting } from '@/types';

export interface DayData {
  meetings: Meeting[];
  pendingTasks: number;
  completedTasks: number;
}

export interface CalendarData {
  /** Map of 'yyyy-MM-dd' -> day data (meetings + task counts) */
  byDate: Map<string, DayData>;
}

/**
 * Batch hook that builds per-day lookup maps for meetings and tasks
 * across a date range. Avoids N individual selector calls for the month grid.
 */
export function useCalendarData(rangeStart: Date, rangeEnd: Date): CalendarData {
  const meetings = useKaivooStore(s => s.meetings);
  const tasks = useKaivooStore(s => s.tasks);

  return useMemo(() => {
    const start = startOfDay(rangeStart);
    const end = endOfDay(rangeEnd);

    const byDate = new Map<string, DayData>();

    // Index meetings by date (filter to range inline)
    for (const meeting of meetings) {
      const startTime = new Date(meeting.startTime);
      const ms = startTime.getTime();
      if (ms < start.getTime() || ms > end.getTime()) continue;

      const key = format(startTime, 'yyyy-MM-dd');
      const existing = byDate.get(key);
      if (existing) {
        existing.meetings.push(meeting);
      } else {
        byDate.set(key, { meetings: [meeting], pendingTasks: 0, completedTasks: 0 });
      }
    }

    // Index tasks by resolved date
    for (const task of tasks) {
      const taskDay = resolveTaskDay(task);
      if (!taskDay) continue;
      if (!isWithinInterval(taskDay, { start, end })) continue;

      const key = format(taskDay, 'yyyy-MM-dd');
      const existing = byDate.get(key);
      if (existing) {
        if (task.status === 'done') {
          existing.completedTasks++;
        } else {
          existing.pendingTasks++;
        }
      } else {
        byDate.set(key, {
          meetings: [],
          pendingTasks: task.status === 'done' ? 0 : 1,
          completedTasks: task.status === 'done' ? 1 : 0,
        });
      }
    }

    return { byDate };
  }, [meetings, tasks, rangeStart, rangeEnd]);
}
