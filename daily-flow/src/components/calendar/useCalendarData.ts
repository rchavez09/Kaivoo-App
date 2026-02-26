import { useMemo } from 'react';
import { format, startOfDay, endOfDay, isWithinInterval } from 'date-fns';
import { useKaivooStore } from '@/stores/useKaivooStore';
import { parseDate } from '@/lib/dateUtils';
import type { Meeting, Task } from '@/types';

export interface DayData {
  meetings: Meeting[];
  pendingTasks: number;
  completedTasks: number;
}

export interface CalendarData {
  /** Map of 'yyyy-MM-dd' -> day data (meetings + task counts) */
  byDate: Map<string, DayData>;
  totalMeetings: number;
}

const RELATIVE_DATES = new Set(['today', 'tomorrow']);

/**
 * Resolve which calendar day a task belongs on.
 * Relative dueDates ("Today"/"Tomorrow") always resolve to the current day,
 * so completed tasks with relative dueDates use completedAt instead.
 */
function resolveTaskDay(task: Task): Date | null {
  if (!task.dueDate) return null;
  const isRelative = RELATIVE_DATES.has(task.dueDate.trim().toLowerCase());

  if (isRelative && task.status === 'done' && task.completedAt) {
    return startOfDay(new Date(task.completedAt));
  }

  const parsed = parseDate(task.dueDate);
  return parsed ? startOfDay(parsed) : null;
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

    return { byDate, totalMeetings: meetings.length };
  }, [meetings, tasks, rangeStart, rangeEnd]);
}
