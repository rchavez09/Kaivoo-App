import { useMemo } from 'react';
import { format, subDays, eachDayOfInterval, startOfWeek, endOfWeek, startOfMonth, endOfMonth, getDay } from 'date-fns';
import { Flame, TrendingUp, Calendar, Sun } from 'lucide-react';
import { useKaivooStore } from '@/stores/useKaivooStore';
import { Habit } from '@/types';
import { cn } from '@/lib/utils';
import { iconMap } from '@/components/widgets/tracking/tracking-types';

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

const HabitAnalytics = () => {
  const habits = useKaivooStore((s) => s.habits);
  const habitCompletions = useKaivooStore((s) => s.habitCompletions);

  const activeHabits = useMemo(() => habits.filter((h) => !h.isArchived), [habits]);

  // This Week overview — 7 day columns
  const weekData = useMemo(() => {
    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 0 });
    const weekEnd = endOfWeek(now, { weekStartsOn: 0 });
    const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

    return days.map((day) => {
      const dateStr = format(day, 'yyyy-MM-dd');
      const completions = habitCompletions[dateStr] || [];
      const completed = activeHabits.filter((h) => completions.some((c) => c.habitId === h.id && !c.skipped)).length;
      const total = activeHabits.length;
      const isFuture = day > now;
      const isToday = format(day, 'yyyy-MM-dd') === format(now, 'yyyy-MM-dd');
      return {
        day,
        dateStr,
        dayLabel: format(day, 'EEE'),
        dayNum: format(day, 'd'),
        completed,
        total,
        percent: total > 0 ? Math.round((completed / total) * 100) : 0,
        isFuture,
        isToday,
      };
    });
  }, [activeHabits, habitCompletions]);

  // Strength rankings — all habits sorted by strength descending
  const strengthRankings = useMemo(() => [...activeHabits].sort((a, b) => b.strength - a.strength), [activeHabits]);

  // Monthly calendar — dot calendar (like detail drawer but for all habits)
  const calendarData = useMemo(() => {
    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

    return days.map((day) => {
      const dateStr = format(day, 'yyyy-MM-dd');
      const completions = habitCompletions[dateStr] || [];
      const completedCount = activeHabits.filter((h) =>
        completions.some((c) => c.habitId === h.id && !c.skipped),
      ).length;
      const total = activeHabits.length;
      const isFuture = day > now;
      const isToday = format(day, 'yyyy-MM-dd') === format(now, 'yyyy-MM-dd');
      return {
        day,
        dateStr,
        completedCount,
        total,
        percent: total > 0 ? Math.round((completedCount / total) * 100) : 0,
        isFuture,
        isToday,
      };
    });
  }, [activeHabits, habitCompletions]);

  const firstDayOfWeek = calendarData.length > 0 ? getDay(calendarData[0].day) : 0;

  // Best streak across all habits
  const topStreaker = useMemo(
    () =>
      activeHabits.reduce<Habit | null>((best, h) => (!best || h.currentStreak > best.currentStreak ? h : best), null),
    [activeHabits],
  );

  // 30-day overall completion rate
  const thirtyDayRate = useMemo(() => {
    if (activeHabits.length === 0) return 0;
    const today = new Date();
    let completed = 0;
    let total = 0;
    for (let i = 0; i < 30; i++) {
      const dateStr = format(subDays(today, i), 'yyyy-MM-dd');
      const dayCompletions = habitCompletions[dateStr] || [];
      activeHabits.forEach((h) => {
        total++;
        if (dayCompletions.some((c) => c.habitId === h.id && !c.skipped)) completed++;
      });
    }
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  }, [activeHabits, habitCompletions]);

  if (activeHabits.length === 0) {
    return (
      <div className="widget-card p-8 text-center">
        <p className="text-sm text-muted-foreground">Create some habits to see analytics and trends.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4" role="region" aria-label="Habit analytics">
      {/* Overview stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="widget-card p-4 text-center">
          <p className="text-2xl font-semibold text-foreground">{thirtyDayRate}%</p>
          <p className="mt-1 text-xs text-muted-foreground">30-day rate</p>
        </div>
        <div className="widget-card p-4 text-center">
          <p className="text-2xl font-semibold text-foreground">{activeHabits.length}</p>
          <p className="mt-1 text-xs text-muted-foreground">Active habits</p>
        </div>
        <div className="widget-card p-4 text-center">
          <div className="flex items-center justify-center gap-1">
            <Flame className="h-4 w-4 text-orange-500" />
            <p className="text-2xl font-semibold text-foreground">{topStreaker?.currentStreak || 0}</p>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Top streak</p>
        </div>
      </div>

      {/* This Week overview */}
      <div className="widget-card p-4" role="region" aria-label="This week overview">
        <div className="mb-4 flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-medium text-foreground">This Week</h3>
        </div>
        <div className="grid grid-cols-7 gap-2">
          {weekData.map(({ dayLabel, dayNum, completed, total, percent, isFuture, isToday }) => (
            <div
              key={dayLabel + dayNum}
              className={cn(
                'flex flex-col items-center gap-1 rounded-lg p-2',
                isToday && 'bg-primary/10 ring-1 ring-primary/30',
                isFuture && 'opacity-30',
              )}
            >
              <span className="text-[10px] font-medium uppercase text-muted-foreground">{dayLabel}</span>
              <span className="text-xs font-medium text-foreground">{dayNum}</span>
              {/* Vertical bar */}
              <div className="flex h-10 w-3 flex-col-reverse overflow-hidden rounded-full bg-secondary">
                <div
                  className="w-full rounded-full bg-primary transition-all duration-300"
                  style={{ height: `${percent}%` }}
                />
              </div>
              <span className="text-[10px] text-muted-foreground">{isFuture ? '—' : `${completed}/${total}`}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Strength Rankings */}
      <div className="widget-card p-4" role="region" aria-label="Strength rankings">
        <div className="mb-4 flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-medium text-foreground">Strength Rankings</h3>
        </div>
        <div className="space-y-3">
          {strengthRankings.map((habit, index) => {
            const strengthPct = Math.round(habit.strength);
            return (
              <div key={habit.id} className="flex items-center gap-3">
                <span className="w-4 shrink-0 text-right text-xs text-muted-foreground">{index + 1}</span>
                {(() => {
                  const Icon = iconMap[habit.icon || 'sun'] || Sun;
                  return (
                    <div
                      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
                      style={{
                        backgroundColor: `${habit.color}26`,
                        color: habit.color,
                      }}
                    >
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                  );
                })()}
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center justify-between">
                    <span className="truncate text-xs font-medium text-foreground">{habit.name}</span>
                    <span className="ml-2 shrink-0 text-[10px] text-muted-foreground">{strengthPct}%</span>
                  </div>
                  <div
                    className="h-1.5 overflow-hidden rounded-full bg-secondary"
                    role="meter"
                    aria-valuenow={strengthPct}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`${habit.name} strength: ${strengthPct}%`}
                  >
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${strengthPct}%`,
                        backgroundColor: habit.color,
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Monthly Calendar */}
      <div className="widget-card p-4" role="region" aria-label="Monthly calendar">
        <p className="mb-3 text-xs font-medium text-muted-foreground">{format(new Date(), 'MMMM yyyy')}</p>
        <div className="mb-1 grid grid-cols-7 gap-1 text-center">
          {DAY_LABELS.map((d, i) => (
            <span key={i} className="text-[10px] font-medium text-muted-foreground">
              {d}
            </span>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1" role="grid" aria-label="Monthly habit completion calendar">
          {Array.from({ length: firstDayOfWeek }).map((_, i) => (
            <div key={`pad-${i}`} />
          ))}
          {calendarData.map(({ dateStr, percent, isFuture, isToday, completedCount, total }) => (
            <div
              key={dateStr}
              className={cn(
                'flex aspect-square w-full items-center justify-center rounded-lg text-[10px] font-medium',
                isFuture && 'opacity-20',
                isToday && 'ring-1 ring-primary/50',
                !isFuture && percent === 100 && 'bg-primary text-primary-foreground',
                !isFuture && percent > 0 && percent < 100 && 'bg-primary/30 text-foreground',
                !isFuture && percent === 0 && 'bg-muted text-muted-foreground',
              )}
              role="gridcell"
              aria-label={`${dateStr}: ${isFuture ? 'future' : `${completedCount} of ${total} completed`}`}
            >
              {parseInt(dateStr.split('-')[2])}
            </div>
          ))}
        </div>
        <div className="mt-3 flex items-center justify-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded bg-primary" />
            <span className="text-[10px] text-muted-foreground">All done</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded bg-primary/30" />
            <span className="text-[10px] text-muted-foreground">Partial</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded bg-muted" />
            <span className="text-[10px] text-muted-foreground">Missed</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HabitAnalytics;
