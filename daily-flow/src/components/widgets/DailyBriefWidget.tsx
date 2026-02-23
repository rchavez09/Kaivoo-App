import { Sparkles, CheckCircle2, Calendar, RotateCcw } from 'lucide-react';
import { useKaivooStore } from '@/stores/useKaivooStore';
import { useMemo, useCallback } from 'react';
import { parseDate, formatStorageDate, formatTime, isOverdue } from '@/lib/dateUtils';
import { isValid, startOfDay, endOfDay, isSameDay, format, isToday as fnsIsToday } from 'date-fns';
import { cn } from '@/lib/utils';
import { useKaivooActions } from '@/hooks/useKaivooActions';

const MOOD_OPTIONS = [
  { score: 5, emoji: '\u{1F60A}', label: 'Great' },
  { score: 4, emoji: '\u{1F642}', label: 'Good' },
  { score: 3, emoji: '\u{1F610}', label: 'Okay' },
  { score: 2, emoji: '\u{1F614}', label: 'Low' },
  { score: 1, emoji: '\u{1F61E}', label: 'Rough' },
] as const;

const QUOTES = [
  '"The secret of getting ahead is getting started." \u2014 Mark Twain',
  '"Do what you can, with what you have, where you are." \u2014 Theodore Roosevelt',
  '"The only way to do great work is to love what you do." \u2014 Steve Jobs',
  '"Start where you are. Use what you have. Do what you can." \u2014 Arthur Ashe',
  '"It always seems impossible until it\'s done." \u2014 Nelson Mandela',
];

interface DailyBriefWidgetProps {
  date?: Date;
}

const DailyBriefWidget = ({ date }: DailyBriefWidgetProps) => {
  const tasks = useKaivooStore(s => s.tasks);
  const meetings = useKaivooStore(s => s.meetings);
  const routines = useKaivooStore(s => s.routines);
  const routineCompletions = useKaivooStore(s => s.routineCompletions);
  const journalEntries = useKaivooStore(s => s.journalEntries);
  const { addJournalEntry } = useKaivooActions();

  const dateStr = useMemo(() => formatStorageDate(date || new Date()), [date]);
  const refDate = useMemo(() => date || new Date(), [dateStr]);
  const isViewingToday = fnsIsToday(refDate);

  const hour = new Date().getHours();
  const greeting = isViewingToday
    ? (hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening')
    : format(refDate, 'EEEE, MMMM d');

  // Task stats for the reference date
  const taskStats = useMemo(() => {
    const refStart = startOfDay(refDate);
    const refEnd = endOfDay(refDate);

    const tasksDueOnDate = tasks.filter(task => {
      if (task.status === 'done') return false;
      const parsed = parseDate(task.dueDate);
      return parsed ? isSameDay(parsed, refDate) : false;
    });

    const tasksCompletedOnDate = tasks.filter(task => {
      if (task.status !== 'done' || !task.completedAt) return false;
      const completedAt = parseDate(task.completedAt);
      if (!completedAt || !isValid(completedAt)) return false;
      return completedAt >= refStart && completedAt <= refEnd;
    });

    const overdueTasks = tasks.filter(task => {
      if (task.status === 'done') return false;
      return isOverdue(task.dueDate);
    });

    const totalScope = tasksDueOnDate.length + tasksCompletedOnDate.length;

    return {
      tasksToday: totalScope,
      tasksDone: tasksCompletedOnDate.length,
      overdueTasks: overdueTasks.length,
    };
  }, [tasks, dateStr, refDate]);

  // Meeting stats for the reference date
  const eventsOnDate = useMemo(() => {
    const refStart = startOfDay(refDate);
    const refEnd = endOfDay(refDate);
    return meetings.filter(meeting => {
      const startTime = meeting.startTime instanceof Date
        ? meeting.startTime
        : new Date(meeting.startTime);
      return startTime >= refStart && startTime <= refEnd;
    });
  }, [meetings, dateStr, refDate]);

  // Routine stats for the reference date
  const routineStats = useMemo(() => {
    const completedIds = routineCompletions[dateStr] || [];
    return {
      routinesDone: completedIds.length,
      routinesTotal: routines.length,
    };
  }, [routines, routineCompletions, dateStr]);

  // Current mood from journal entries for this date
  const currentMood = useMemo(() => {
    const dayEntries = journalEntries
      .filter(e => e.date === dateStr && e.moodScore != null)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return dayEntries.length > 0 ? dayEntries[0].moodScore : undefined;
  }, [journalEntries, dateStr]);

  const currentMoodOption = MOOD_OPTIONS.find(m => m.score === currentMood);

  // Template-based AI summary
  const summary = useMemo(() => {
    const insights: string[] = [];

    if (eventsOnDate.length > 4) {
      insights.push(`Busy meeting day with ${eventsOnDate.length} events \u2014 keep tasks light.`);
    }

    if (taskStats.overdueTasks > 0) {
      insights.push(`You have ${taskStats.overdueTasks} overdue task${taskStats.overdueTasks > 1 ? 's' : ''} \u2014 might want to tackle those first.`);
    }

    if (routineStats.routinesDone === routineStats.routinesTotal && routineStats.routinesTotal > 0) {
      insights.push('All routines done \u2014 great job today!');
    }

    if (insights.length > 0) return insights[0];

    // Fallback: daily quote based on day of year
    const dayOfYear = Math.floor((refDate.getTime() - new Date(refDate.getFullYear(), 0, 0).getTime()) / 86400000);
    return QUOTES[dayOfYear % QUOTES.length];
  }, [eventsOnDate, taskStats, routineStats, refDate]);

  // Mood setter — always appends a new entry to preserve mood timeline history.
  // The most recent mood entry for the date is used for display (see currentMood above).
  const handleMoodSelect = useCallback(async (score: number) => {
    await addJournalEntry({
      date: dateStr,
      content: '',
      tags: ['mood'],
      topicIds: [],
      moodScore: score,
    });
  }, [dateStr, addJournalEntry]);

  const handleChipClick = useCallback((section: string) => {
    const el = document.getElementById(`day-section-${section}`);
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const taskProgress = taskStats.tasksToday > 0
    ? Math.round((taskStats.tasksDone / taskStats.tasksToday) * 100)
    : 100;
  const routineProgress = routineStats.routinesTotal > 0
    ? Math.round((routineStats.routinesDone / routineStats.routinesTotal) * 100)
    : 100;

  return (
    <div className="widget-card bg-gradient-to-br from-primary/5 via-card to-accent/5 animate-fade-in border border-primary/10">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-4 h-4 text-primary" />
        <span className="text-xs font-medium text-primary uppercase tracking-wider">Daily Brief</span>
      </div>

      <h2 className="text-xl font-semibold text-foreground mb-4">{greeting}</h2>

      {/* Zone 1: Insight Chips */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <button
          onClick={() => handleChipClick('tasks')}
          className="bg-background/60 rounded-lg p-3 space-y-2 text-left hover:bg-background/80 transition-colors"
        >
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span className="text-xs font-medium">Tasks</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-semibold text-foreground">{taskStats.tasksDone}</span>
            <span className="text-xs text-muted-foreground">/ {taskStats.tasksToday}</span>
          </div>
          <div className="h-1 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all"
              style={{ width: `${taskProgress}%` }}
            />
          </div>
          {taskStats.overdueTasks > 0 && (
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-destructive animate-pulse" />
              <span className="text-[10px] text-destructive">{taskStats.overdueTasks} overdue</span>
            </div>
          )}
        </button>

        <button
          onClick={() => handleChipClick('schedule')}
          className="bg-background/60 rounded-lg p-3 space-y-2 text-left hover:bg-background/80 transition-colors"
        >
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Calendar className="w-3.5 h-3.5" />
            <span className="text-xs font-medium">Meetings</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-semibold text-foreground">{eventsOnDate.length}</span>
            <span className="text-xs text-muted-foreground">today</span>
          </div>
        </button>

        <button
          onClick={() => handleChipClick('routines')}
          className="bg-background/60 rounded-lg p-3 space-y-2 text-left hover:bg-background/80 transition-colors"
        >
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="text-xs font-medium">Routines</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-semibold text-foreground">{routineStats.routinesDone}</span>
            <span className="text-xs text-muted-foreground">/ {routineStats.routinesTotal}</span>
          </div>
          <div className="h-1 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-accent rounded-full transition-all"
              style={{ width: `${routineProgress}%` }}
            />
          </div>
        </button>
      </div>

      {/* Zone 2: AI Summary / Quote Fallback */}
      {isViewingToday && (
        <div className="px-3 py-2 mb-4 rounded-lg bg-background/40 border border-border/30">
          <p className="text-sm text-muted-foreground italic leading-relaxed">{summary}</p>
        </div>
      )}

      {/* Zone 3: Mood Selector */}
      <div className="flex items-center gap-3">
        <span className="text-xs text-muted-foreground font-medium">How are you feeling?</span>
        <div className="flex gap-1.5">
          {MOOD_OPTIONS.map(mood => (
            <button
              key={mood.score}
              onClick={() => handleMoodSelect(mood.score)}
              className={cn(
                'w-9 h-9 rounded-full flex items-center justify-center text-lg transition-all',
                currentMood === mood.score
                  ? 'bg-primary/15 ring-2 ring-primary scale-110'
                  : 'hover:bg-secondary/60 hover:scale-105'
              )}
              aria-label={`Set mood to ${mood.label}`}
            >
              {mood.emoji}
            </button>
          ))}
        </div>
        {currentMoodOption && (
          <span className="text-xs text-muted-foreground ml-auto">
            Currently: {currentMoodOption.emoji} {currentMoodOption.label}
          </span>
        )}
      </div>
    </div>
  );
};

export default DailyBriefWidget;
