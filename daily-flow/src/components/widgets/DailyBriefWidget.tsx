import { Sparkles, CheckCircle2, Calendar, RotateCcw, TrendingUp } from 'lucide-react';
import { useKaivooStore } from '@/stores/useKaivooStore';
import { useMemo } from 'react';
import { parseDate, formatStorageDate, formatTime, isToday as isTodayUtil, isOverdue } from '@/lib/dateUtils';
import { isValid, startOfDay, endOfDay } from 'date-fns';

const DailyBriefWidget = () => {
  const tasks = useKaivooStore(s => s.tasks);
  const meetings = useKaivooStore(s => s.meetings);
  const routines = useKaivooStore(s => s.routines);
  const routineCompletions = useKaivooStore(s => s.routineCompletions);

  const todayStr = useMemo(() => formatStorageDate(new Date()), []);
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  // Calculate real task stats using centralized date utilities
  const taskStats = useMemo(() => {
    const now = new Date();
    const todayStart = startOfDay(now);
    const todayEnd = endOfDay(now);

    // Tasks due today only (not counting start_date)
    const tasksToday = tasks.filter(task => {
      if (task.status === 'done') return false;
      return isTodayUtil(task.dueDate);
    });

    // Count tasks completed TODAY based on completedAt timestamp
    const tasksCompletedToday = tasks.filter(task => {
      if (task.status !== 'done' || !task.completedAt) return false;
      const completedAt = parseDate(task.completedAt);
      if (!completedAt || !isValid(completedAt)) return false;
      return completedAt >= todayStart && completedAt <= todayEnd;
    });
    
    // Overdue tasks (due before today and not done)
    const overdueTasks = tasks.filter(task => {
      if (task.status === 'done') return false;
      return isOverdue(task.dueDate);
    });

    // Total tasks to show: pending due today + completed today
    const totalTodayScope = tasksToday.length + tasksCompletedToday.length;

    return {
      tasksToday: totalTodayScope,
      tasksDone: tasksCompletedToday.length,
      overdueTasks: overdueTasks.length,
    };
  }, [tasks, todayStr]);

  // Calculate real meeting stats
  const eventsToday = useMemo(() => {
    const now = new Date();
    const todayStart = startOfDay(now);
    const todayEnd = endOfDay(now);

    return meetings.filter(meeting => {
      const startTime = meeting.startTime instanceof Date 
        ? meeting.startTime 
        : new Date(meeting.startTime);
      return startTime >= todayStart && startTime <= todayEnd;
    });
  }, [meetings, todayStr]);

  // Calculate next event
  const nextEvent = useMemo(() => {
    const now = new Date();
    const upcoming = eventsToday
      .filter(m => {
        const startTime = m.startTime instanceof Date ? m.startTime : new Date(m.startTime);
        return startTime > now;
      })
      .sort((a, b) => {
        const aTime = a.startTime instanceof Date ? a.startTime : new Date(a.startTime);
        const bTime = b.startTime instanceof Date ? b.startTime : new Date(b.startTime);
        return aTime.getTime() - bTime.getTime();
      });
    
    if (upcoming.length === 0) return null;
    const startTime = upcoming[0].startTime instanceof Date 
      ? upcoming[0].startTime 
      : new Date(upcoming[0].startTime);
    return formatTime(startTime);
  }, [eventsToday]);

  // Calculate routine stats - subscribe directly to routineCompletions for reactivity
  const routineStats = useMemo(() => {
    const completedIds = routineCompletions[todayStr] || [];
    return {
      routinesDone: completedIds.length,
      routinesTotal: routines.length,
    };
  }, [routines, routineCompletions, todayStr]);

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

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3">
        {/* Tasks summary */}
        <div className="bg-background/60 rounded-lg p-3 space-y-2">
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
        </div>

        {/* Events summary */}
        <div className="bg-background/60 rounded-lg p-3 space-y-2">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Calendar className="w-3.5 h-3.5" />
            <span className="text-xs font-medium">Events</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-semibold text-foreground">{eventsToday.length}</span>
            <span className="text-xs text-muted-foreground">today</span>
          </div>
          <div className="text-[10px] text-muted-foreground">
            {nextEvent ? `Next: ${nextEvent}` : 'No upcoming'}
          </div>
        </div>

        {/* Routine summary */}
        <div className="bg-background/60 rounded-lg p-3 space-y-2">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="text-xs font-medium">Routine</span>
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
        </div>
      </div>
    </div>
  );
};

export default DailyBriefWidget;
