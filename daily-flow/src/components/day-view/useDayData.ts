import { useMemo } from 'react';
import { format, isToday, isBefore, startOfDay } from 'date-fns';
import { useKaivooStore } from '@/stores/useKaivooStore';

export interface DayStats {
  routinesDone: number;
  routinesTotal: number;
  tasksCompleted: number;
  tasksRemaining: number;
  meetingCount: number;
  journalWordCount: number;
  captureCount: number;
  moodScore?: number;
}

export const useDayData = (date: Date) => {
  const dateStr = format(date, 'yyyy-MM-dd');
  const tasks = useKaivooStore(s => s.tasks);
  const meetings = useKaivooStore(s => s.meetings);
  const routines = useKaivooStore(s => s.routines);
  const routineCompletions = useKaivooStore(s => s.routineCompletions);
  const journalEntries = useKaivooStore(s => s.journalEntries);
  const captures = useKaivooStore(s => s.captures);

  const dayTasks = useMemo(() => {
    const dueTodayOrOverdue = tasks.filter(t => {
      if (t.status === 'done') {
        // Show if completed today
        return t.completedAt && format(new Date(t.completedAt), 'yyyy-MM-dd') === dateStr;
      }
      return t.dueDate === dateStr || (t.dueDate && isBefore(new Date(t.dueDate), startOfDay(date)) && t.status !== 'done');
    });

    const pending = dueTodayOrOverdue.filter(t => t.status !== 'done');
    const completed = dueTodayOrOverdue.filter(t => t.status === 'done');

    return { all: dueTodayOrOverdue, pending, completed };
  }, [tasks, dateStr, date]);

  const dayMeetings = useMemo(() =>
    meetings
      .filter(m => format(new Date(m.startTime), 'yyyy-MM-dd') === dateStr)
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()),
    [meetings, dateStr],
  );

  const dayRoutineCompletions = useMemo(() =>
    routineCompletions[dateStr] || [],
    [routineCompletions, dateStr],
  );

  const dayJournalEntries = useMemo(() =>
    journalEntries
      .filter(e => e.date === dateStr)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [journalEntries, dateStr],
  );

  const dayCaptures = useMemo(() =>
    captures
      .filter(c => c.date === dateStr)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [captures, dateStr],
  );

  const stats: DayStats = useMemo(() => {
    const wordCount = dayJournalEntries.reduce((sum, e) => {
      const text = e.content.replace(/<[^>]*>/g, '');
      return sum + text.split(/\s+/).filter(Boolean).length;
    }, 0);

    const latestMood = dayJournalEntries.find(e => e.moodScore != null);

    return {
      routinesDone: dayRoutineCompletions.length,
      routinesTotal: routines.length,
      tasksCompleted: dayTasks.completed.length,
      tasksRemaining: dayTasks.pending.length,
      meetingCount: dayMeetings.length,
      journalWordCount: wordCount,
      captureCount: dayCaptures.length,
      moodScore: latestMood?.moodScore,
    };
  }, [dayJournalEntries, dayRoutineCompletions, routines, dayTasks, dayMeetings, dayCaptures]);

  return {
    dateStr,
    isToday: isToday(date),
    tasks: dayTasks,
    meetings: dayMeetings,
    routineCompletions: dayRoutineCompletions,
    routines,
    journalEntries: dayJournalEntries,
    captures: dayCaptures,
    stats,
  };
};
