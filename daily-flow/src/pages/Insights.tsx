import AppLayout from '@/components/layout/AppLayout';
import MonthlyHeatmap from '@/components/MonthlyHeatmap';
import { GlowingEffect } from '@/components/ui/glowing-effect';
import { BarChart3, CheckCircle2, FileText, RotateCcw, TrendingUp, Calendar, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { useKaivooStore } from '@/stores/useKaivooStore';
import { format, startOfWeek, endOfWeek, parseISO, startOfDay } from 'date-fns';
import { cn } from '@/lib/utils';
import { useState, useMemo } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useUserPreferences } from '@/hooks/useUserPreferences';

const Insights = () => {
  const { 
    getWeeklySummary, 
    getWeeklyRoutineStats, 
    routines, 
    routineGroups,
    routineCompletions,
    getRoutinesByGroup,
  } = useKaivooStore();
  
  const { preferences } = useUserPreferences();
  const weekStartsOn = preferences.weekStartsOn;
  
  const [selectedGroupId, setSelectedGroupId] = useState<string>('all');
  const [weekOffset, setWeekOffset] = useState<number>(0);
  
  const summary = getWeeklySummary();
  
  // Calculate week range based on offset and user preference
  const dateRange = useMemo(() => {
    const today = new Date();
    const offsetDate = new Date(today);
    offsetDate.setDate(today.getDate() + (weekOffset * 7));
    
    const start = startOfWeek(offsetDate, { weekStartsOn });
    const end = endOfWeek(offsetDate, { weekStartsOn });
    return { start, end };
  }, [weekOffset, weekStartsOn]);
  
  // Get filtered routines based on selection
  const filteredRoutines = useMemo(() => {
    if (selectedGroupId === 'all') return routines;
    if (selectedGroupId === 'uncategorized') return routines.filter(r => !r.groupId);
    return getRoutinesByGroup(selectedGroupId);
  }, [selectedGroupId, routines, getRoutinesByGroup]);
  
  // Get weekly stats for filtered routines with offset and week start preference
  const weeklyStats = useMemo(() => {
    if (selectedGroupId === 'all') {
      return getWeeklyRoutineStats(undefined, weekOffset, weekStartsOn);
    }
    return getWeeklyRoutineStats(selectedGroupId === 'uncategorized' ? null : selectedGroupId, weekOffset, weekStartsOn);
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
    const group = routineGroups.find(g => g.id === selectedGroupId);
    return group?.name || 'Unknown';
  }, [selectedGroupId, routineGroups]);

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto px-6 py-8">
        <header className="mb-8">
          <h1 className="text-2xl font-semibold text-foreground mb-1">Insights</h1>
          <p className="text-sm text-muted-foreground">Track your progress and patterns</p>
        </header>

        {/* Weekly Summary Header */}
        <div className="widget-card mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-4 h-4 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">
              {weekOffset === 0 ? 'This Week' : weekOffset === -1 ? 'Last Week' : `${Math.abs(weekOffset)} Weeks Ago`}
            </h2>
          </div>
          <p className="text-sm text-muted-foreground">
            {format(dateRange.start, 'EEE, MMM d')} - {format(dateRange.end, 'EEE, MMM d, yyyy')}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
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
                <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center mb-3", stat.bgColor)}>
                  <Icon className={cn("w-5 h-5", stat.color)} />
                </div>
                <p className="text-2xl font-bold text-foreground mb-1">{stat.value}</p>
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
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-primary" />
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
                  onClick={() => setWeekOffset(prev => prev - 1)}
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
                  onClick={() => setWeekOffset(prev => prev + 1)}
                  disabled={weekOffset >= 0}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              
              {/* Group filter */}
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <Select value={selectedGroupId} onValueChange={setSelectedGroupId}>
                  <SelectTrigger className="w-[140px] h-8 text-sm">
                    <SelectValue placeholder="Filter by group" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Routines</SelectItem>
                    {routineGroups.map(g => (
                      <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>
                    ))}
                    <SelectItem value="uncategorized">Uncategorized</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          {filteredRoutines.length === 0 ? (
            <div className="py-8 text-center">
              <RotateCcw className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                {selectedGroupId === 'all' 
                  ? 'No routines configured yet.' 
                  : `No routines in "${groupLabel}".`}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Add routines from the Today page to track them here.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Bar Chart */}
              <div className="flex items-end justify-between gap-2 h-40 px-2">
                {weeklyStats.map((day) => {
                  const dayDate = parseLocalDay(day.date);
                  const percentage = maxRoutines > 0 ? (day.completed / maxRoutines) * 100 : 0;
                  const isToday = day.date === todayString;
                  const dayName = format(dayDate, 'EEE');
                  const dayNumber = format(dayDate, 'd');
                  const isFuture = dayDate > todayStart;
                  
                  return (
                    <div key={day.date} className="flex-1 flex flex-col items-center gap-2">
                      <div className="w-full h-28 bg-secondary/30 rounded-lg relative overflow-hidden">
                        <div 
                          className={cn(
                            "absolute bottom-0 left-0 right-0 rounded-lg transition-all duration-500",
                            isToday ? "bg-primary" : "bg-primary/60",
                            isFuture && "bg-muted"
                          )}
                          style={{ height: isFuture ? '0%' : `${percentage}%` }}
                        />
                        {!isFuture && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className={cn(
                              "text-xs font-medium",
                              percentage > 50 ? "text-primary-foreground" : "text-muted-foreground"
                            )}>
                              {day.completed}/{day.total}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className={cn(
                        "text-xs font-medium text-center",
                        isToday ? "text-primary" : "text-muted-foreground"
                      )}>
                        <div>{dayName}</div>
                        <div className="text-[10px]">{dayNumber}</div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="flex items-center justify-center gap-4 pt-2 border-t border-border">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-primary" />
                  <span className="text-xs text-muted-foreground">Today</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-primary/60" />
                  <span className="text-xs text-muted-foreground">Past days</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-muted" />
                  <span className="text-xs text-muted-foreground">Future</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Individual Routine Breakdown */}
        {filteredRoutines.length > 0 && (
          <div className="widget-card">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-primary" />
                <h2 className="text-lg font-semibold text-foreground">Routine Breakdown</h2>
              </div>
              <span className="text-xs text-muted-foreground">{groupLabel}</span>
            </div>
            
            <div className="space-y-3">
              {filteredRoutines.map((routine) => {
                // Calculate completion rate for this routine over the week
                const completedDays = weeklyStats.filter(day => {
                    const dayDate = parseLocalDay(day.date);
                    if (dayDate > todayStart) return false; // Don't count future days
                  return (routineCompletions[day.date] || []).some(c => c.routineId === routine.id);
                }).length;
                
                  const totalDays = weeklyStats.filter(day => parseLocalDay(day.date) <= todayStart).length;
                const completionRate = totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0;
                
                // Find group name for this routine
                const routineGroup = routine.groupId 
                  ? routineGroups.find(g => g.id === routine.groupId)
                  : null;
                
                return (
                  <div key={routine.id} className="flex items-center gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm text-foreground truncate">{routine.name}</span>
                        {selectedGroupId === 'all' && (
                          <span className="text-[10px] text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">
                            {routineGroup?.name || 'Uncategorized'}
                          </span>
                        )}
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full transition-all duration-300"
                          style={{ width: `${completionRate}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground w-16 text-right">
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