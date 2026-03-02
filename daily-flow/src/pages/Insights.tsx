import AppLayout from '@/components/layout/AppLayout';
import MonthlyHeatmap from '@/components/MonthlyHeatmap';
import { GlowingEffect } from '@/components/ui/glowing-effect';
import {
  BarChart3,
  CheckCircle2,
  FileText,
  RotateCcw,
  TrendingUp,
  Calendar,
  Filter,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useKaivooStore } from '@/stores/useKaivooStore';
import { format, startOfWeek, endOfWeek, parseISO, startOfDay } from 'date-fns';
import { cn } from '@/lib/utils';
import { useState, useMemo } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useUserPreferences } from '@/hooks/useUserPreferences';

const Insights = () => {
  const getWeeklySummary = useKaivooStore((s) => s.getWeeklySummary);
  const getWeeklyRoutineStats = useKaivooStore((s) => s.getWeeklyRoutineStats);
  const routines = useKaivooStore((s) => s.routines);
  const routineGroups = useKaivooStore((s) => s.routineGroups);
  const routineCompletions = useKaivooStore((s) => s.routineCompletions);
  const getRoutinesByGroup = useKaivooStore((s) => s.getRoutinesByGroup);

  const { preferences } = useUserPreferences();
  const weekStartsOn = preferences.weekStartsOn;

  const [selectedGroupId, setSelectedGroupId] = useState<string>('all');
  const [weekOffset, setWeekOffset] = useState<number>(0);

  const summary = getWeeklySummary();

  // Calculate week range based on offset and user preference
  const dateRange = useMemo(() => {
    const today = new Date();
    const offsetDate = new Date(today);
    offsetDate.setDate(today.getDate() + weekOffset * 7);

    const start = startOfWeek(offsetDate, { weekStartsOn });
    const end = endOfWeek(offsetDate, { weekStartsOn });
    return { start, end };
  }, [weekOffset, weekStartsOn]);

  // Get filtered routines based on selection
  const filteredRoutines = useMemo(() => {
    if (selectedGroupId === 'all') return routines;
    if (selectedGroupId === 'uncategorized') return routines.filter((r) => !r.groupId);
    return getRoutinesByGroup(selectedGroupId);
  }, [selectedGroupId, routines, getRoutinesByGroup]);

  // Get weekly stats for filtered routines with offset and week start preference
  const weeklyStats = useMemo(() => {
    if (selectedGroupId === 'all') {
      return getWeeklyRoutineStats(undefined, weekOffset, weekStartsOn);
    }
    return getWeeklyRoutineStats(
      selectedGroupId === 'uncategorized' ? null : selectedGroupId,
      weekOffset,
      weekStartsOn,
    );
  }, [selectedGroupId, getWeeklyRoutineStats, routineCompletions, weekOffset, weekStartsOn]);

  const statCards = [
    {
      label: 'Tasks Completed',
      value: summary.tasksCompleted,
      icon: CheckCircle2,
      color: 'text-ocean-surface',
      bgColor: 'bg-ocean-surface/10',
    },
    {
      label: 'Captures Made',
      value: summary.capturesMade,
      icon: FileText,
      color: 'text-ocean-mid',
      bgColor: 'bg-ocean-mid/10',
    },
    {
      label: 'Routines Done',
      value: summary.routinesCompleted,
      icon: RotateCcw,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      label: 'Routine Rate',
      value: `${summary.routineCompletionRate}%`,
      icon: TrendingUp,
      color: 'text-sunlit-amber',
      bgColor: 'bg-sunlit-amber/10',
    },
  ];

  const maxRoutines = filteredRoutines.length;
  const todayString = format(new Date(), 'yyyy-MM-dd');
  const todayStart = startOfDay(new Date());
  const parseLocalDay = (dateStr: string) => startOfDay(parseISO(dateStr));

  // Calculate group label for display
  const groupLabel = useMemo(() => {
    if (selectedGroupId === 'all') return 'All Routines';
    if (selectedGroupId === 'uncategorized') return 'Uncategorized';
    const group = routineGroups.find((g) => g.id === selectedGroupId);
    return group?.name || 'Unknown';
  }, [selectedGroupId, routineGroups]);

  return (
    <AppLayout>
      <div className="mx-auto max-w-4xl px-6 py-8">
        <header className="mb-8">
          <h1 className="mb-1 text-2xl font-semibold text-foreground">Insights</h1>
          <p className="text-sm text-muted-foreground">Track your progress and patterns</p>
        </header>

        {/* Weekly Summary Header */}
        <div className="widget-card mb-6">
          <div className="mb-4 flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">
              {weekOffset === 0 ? 'This Week' : weekOffset === -1 ? 'Last Week' : `${Math.abs(weekOffset)} Weeks Ago`}
            </h2>
          </div>
          <p className="text-sm text-muted-foreground">
            {format(dateRange.start, 'EEE, MMM d')} - {format(dateRange.end, 'EEE, MMM d, yyyy')}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          {statCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="widget-card relative">
                <GlowingEffect
                  spread={30}
                  glow={false}
                  disabled={false}
                  proximity={48}
                  inactiveZone={0.1}
                  borderWidth={2}
                />
                <div className={cn('mb-3 flex h-10 w-10 items-center justify-center rounded-lg', stat.bgColor)}>
                  <Icon className={cn('h-5 w-5', stat.color)} />
                </div>
                <p className="mb-1 text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            );
          })}
        </div>

        {/* Monthly Activity Heatmap */}
        <div className="mb-6">
          <MonthlyHeatmap />
        </div>

        {/* Routine Completion Chart */}
        <div className="widget-card mb-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <RotateCcw className="h-4 w-4 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">Routine Completion</h2>
            </div>

            {/* Navigation and filter */}
            <div className="flex items-center gap-3">
              {/* Week navigation */}
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Previous week"
                  className="h-8 w-8"
                  onClick={() => setWeekOffset((prev) => prev - 1)}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 text-xs"
                  onClick={() => setWeekOffset(0)}
                  disabled={weekOffset === 0}
                >
                  Today
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Next week"
                  className="h-8 w-8"
                  onClick={() => setWeekOffset((prev) => prev + 1)}
                  disabled={weekOffset >= 0}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              {/* Group filter */}
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select value={selectedGroupId} onValueChange={setSelectedGroupId}>
                  <SelectTrigger className="h-8 w-[140px] text-sm">
                    <SelectValue placeholder="Filter by group" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Routines</SelectItem>
                    {routineGroups.map((g) => (
                      <SelectItem key={g.id} value={g.id}>
                        {g.name}
                      </SelectItem>
                    ))}
                    <SelectItem value="uncategorized">Uncategorized</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {filteredRoutines.length === 0 ? (
            <div className="py-8 text-center">
              <RotateCcw className="mx-auto mb-3 h-10 w-10 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">
                {selectedGroupId === 'all' ? 'No routines configured yet.' : `No routines in "${groupLabel}".`}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">Add routines from the Today page to track them here.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Bar Chart */}
              <div className="flex h-40 items-end justify-between gap-2 px-2">
                {weeklyStats.map((day) => {
                  const dayDate = parseLocalDay(day.date);
                  const percentage = maxRoutines > 0 ? (day.completed / maxRoutines) * 100 : 0;
                  const isToday = day.date === todayString;
                  const dayName = format(dayDate, 'EEE');
                  const dayNumber = format(dayDate, 'd');
                  const isFuture = dayDate > todayStart;

                  return (
                    <div key={day.date} className="flex flex-1 flex-col items-center gap-2">
                      <div className="relative h-28 w-full overflow-hidden rounded-lg bg-secondary/30">
                        <div
                          className={cn(
                            'absolute bottom-0 left-0 right-0 rounded-lg transition-all duration-500',
                            isToday ? 'bg-primary' : 'bg-primary/60',
                            isFuture && 'bg-muted',
                          )}
                          style={{ height: isFuture ? '0%' : `${percentage}%` }}
                        />
                        {!isFuture && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span
                              className={cn(
                                'text-xs font-medium',
                                percentage > 50 ? 'text-primary-foreground' : 'text-muted-foreground',
                              )}
                            >
                              {day.completed}/{day.total}
                            </span>
                          </div>
                        )}
                      </div>
                      <div
                        className={cn(
                          'text-center text-xs font-medium',
                          isToday ? 'text-primary' : 'text-muted-foreground',
                        )}
                      >
                        <div>{dayName}</div>
                        <div className="text-[10px]">{dayNumber}</div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="flex items-center justify-center gap-4 border-t border-border pt-2">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded bg-primary" />
                  <span className="text-xs text-muted-foreground">Today</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded bg-primary/60" />
                  <span className="text-xs text-muted-foreground">Past days</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded bg-muted" />
                  <span className="text-xs text-muted-foreground">Future</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Individual Routine Breakdown */}
        {filteredRoutines.length > 0 && (
          <div className="widget-card">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-primary" />
                <h2 className="text-lg font-semibold text-foreground">Routine Breakdown</h2>
              </div>
              <span className="text-xs text-muted-foreground">{groupLabel}</span>
            </div>

            <div className="space-y-3">
              {filteredRoutines.map((routine) => {
                // Calculate completion rate for this routine over the week
                const completedDays = weeklyStats.filter((day) => {
                  const dayDate = parseLocalDay(day.date);
                  if (dayDate > todayStart) return false; // Don't count future days
                  return (routineCompletions[day.date] || []).some((c) => c.routineId === routine.id);
                }).length;

                const totalDays = weeklyStats.filter((day) => parseLocalDay(day.date) <= todayStart).length;
                const completionRate = totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0;

                // Find group name for this routine
                const routineGroup = routine.groupId ? routineGroups.find((g) => g.id === routine.groupId) : null;

                return (
                  <div key={routine.id} className="flex items-center gap-3">
                    <div className="flex-1">
                      <div className="mb-1 flex items-center gap-2">
                        <span className="truncate text-sm text-foreground">{routine.name}</span>
                        {selectedGroupId === 'all' && (
                          <span className="rounded bg-secondary px-1.5 py-0.5 text-[10px] text-muted-foreground">
                            {routineGroup?.name || 'Uncategorized'}
                          </span>
                        )}
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-secondary">
                        <div
                          className="h-full rounded-full bg-primary transition-all duration-300"
                          style={{ width: `${completionRate}%` }}
                        />
                      </div>
                    </div>
                    <span className="w-16 text-right text-xs text-muted-foreground">
                      {completedDays}/{totalDays} days
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default Insights;
