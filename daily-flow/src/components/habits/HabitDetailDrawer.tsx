import { useMemo } from 'react';
import { format, subDays, eachDayOfInterval, startOfMonth, endOfMonth, getDay } from 'date-fns';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Pencil, Archive, Trash2, Flame, Sun } from 'lucide-react';
import { useKaivooStore } from '@/stores/useKaivooStore';
import { Habit } from '@/types';
import { cn } from '@/lib/utils';
import { iconMap } from '@/components/widgets/tracking/tracking-types';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface HabitDetailDrawerProps {
  habitId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (habit: Habit) => void;
  onDelete: (id: string) => void | Promise<void>;
  onArchive: (id: string) => void | Promise<void>;
}

const HabitDetailDrawer = ({ habitId, open, onOpenChange, onEdit, onDelete, onArchive }: HabitDetailDrawerProps) => {
  const habits = useKaivooStore((s) => s.habits);
  const habitCompletions = useKaivooStore((s) => s.habitCompletions);

  const habit = useMemo(() => habits.find((h) => h.id === habitId), [habits, habitId]);

  // Calendar dots for current month
  const calendarData = useMemo(() => {
    if (!habit) return [];
    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

    return days.map((day) => {
      const dateStr = format(day, 'yyyy-MM-dd');
      const completions = habitCompletions[dateStr] || [];
      const isCompleted = completions.some((c) => c.habitId === habit.id && !c.skipped);
      const isFuture = day > now;
      return { day, dateStr, isCompleted, isFuture };
    });
  }, [habit, habitCompletions]);

  // Completion rate (last 30 days)
  const completionRate = useMemo(() => {
    if (!habit) return 0;
    const today = new Date();
    let completed = 0;
    let total = 0;
    for (let i = 0; i < 30; i++) {
      const dateStr = format(subDays(today, i), 'yyyy-MM-dd');
      const completions = habitCompletions[dateStr] || [];
      const isCompleted = completions.some((c) => c.habitId === habit.id && !c.skipped);
      if (isCompleted) completed++;
      total++;
    }
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  }, [habit, habitCompletions]);

  // Schedule label
  const scheduleLabel = useMemo(() => {
    if (!habit) return '';
    const { schedule } = habit;
    if (schedule.type === 'daily') return 'Daily';
    if (schedule.type === 'specific_days' && schedule.days) {
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      return schedule.days.map((d) => dayNames[d]).join(', ');
    }
    if (schedule.type === 'x_per_week') return `${schedule.timesPerPeriod}x per week`;
    return 'Daily';
  }, [habit]);

  if (!habit) return null;

  const strengthPercent = Math.round(habit.strength);
  const typeLabel = habit.type === 'positive' ? 'Positive' : habit.type === 'negative' ? 'Negative' : 'Multi-count';
  const timeBlockLabel = habit.timeBlock.charAt(0).toUpperCase() + habit.timeBlock.slice(1);

  // Calendar grid — pad start for day-of-week alignment
  const firstDayOfWeek = calendarData.length > 0 ? getDay(calendarData[0].day) : 0;
  const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto bg-card sm:max-w-lg">
        <SheetHeader className="mb-4 space-y-4 border-b border-border/50 pb-4">
          <SheetTitle className="sr-only">{habit.name} details</SheetTitle>
          <div className="flex items-center gap-3">
            {(() => {
              const Icon = iconMap[habit.icon || 'sun'] || Sun;
              return (
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-full"
                  style={{ backgroundColor: `${habit.color}26`, color: habit.color }}
                >
                  <Icon className="h-6 w-6" />
                </div>
              );
            })()}
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-foreground">{habit.name}</h2>
              <p className="text-xs text-muted-foreground">
                {typeLabel} · {timeBlockLabel} · {scheduleLabel}
              </p>
            </div>
            <Button variant="ghost" size="icon" onClick={() => onEdit(habit)} aria-label="Edit habit">
              <Pencil className="h-4 w-4" />
            </Button>
          </div>
        </SheetHeader>

        <div className="space-y-4">
          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-secondary/30 p-3 text-center">
              <div className="mb-1 flex items-center justify-center gap-1">
                <Flame className="h-4 w-4 text-orange-500" />
                <p className="text-lg font-semibold text-foreground">{habit.currentStreak}</p>
              </div>
              <p className="text-xs text-muted-foreground">Current streak</p>
            </div>
            <div className="rounded-xl bg-secondary/30 p-3 text-center">
              <p className="text-lg font-semibold text-foreground">{habit.bestStreak}</p>
              <p className="text-xs text-muted-foreground">Best streak</p>
            </div>
            <div className="rounded-xl bg-secondary/30 p-3 text-center">
              <p className="text-lg font-semibold text-foreground">{strengthPercent}%</p>
              <p className="text-xs text-muted-foreground">Strength</p>
            </div>
            <div className="rounded-xl bg-secondary/30 p-3 text-center">
              <p className="text-lg font-semibold text-foreground">{completionRate}%</p>
              <p className="text-xs text-muted-foreground">Last 30 days</p>
            </div>
          </div>

          {/* Calendar dots */}
          <div className="rounded-xl bg-secondary/30 p-4">
            <p className="mb-3 text-xs font-medium text-muted-foreground">{format(new Date(), 'MMMM yyyy')}</p>
            <div className="mb-1 grid grid-cols-7 gap-1 text-center">
              {DAY_LABELS.map((d, i) => (
                <span key={i} className="text-[10px] font-medium text-muted-foreground">
                  {d}
                </span>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1" role="grid" aria-label="Habit completion calendar">
              {/* Padding for first day alignment */}
              {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                <div key={`pad-${i}`} />
              ))}
              {calendarData.map(({ dateStr, isCompleted, isFuture }) => (
                <div
                  key={dateStr}
                  className={cn(
                    'flex aspect-square w-full items-center justify-center rounded-full',
                    isFuture && 'opacity-20',
                    isCompleted && !isFuture && 'bg-primary',
                    !isCompleted && !isFuture && 'bg-muted',
                  )}
                  style={isCompleted && !isFuture ? { backgroundColor: habit.color } : undefined}
                  role="gridcell"
                  aria-label={`${dateStr}: ${isFuture ? 'future' : isCompleted ? 'completed' : 'missed'}`}
                />
              ))}
            </div>
          </div>

          {/* Strength bar */}
          <div className="rounded-xl bg-secondary/30 p-4">
            <p className="mb-2 text-xs font-medium text-muted-foreground">Habit Strength</p>
            <div className="h-3 overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${strengthPercent}%`, backgroundColor: habit.color }}
              />
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {strengthPercent}% —{' '}
              {strengthPercent >= 80
                ? 'Strong'
                : strengthPercent >= 50
                  ? 'Building'
                  : strengthPercent >= 20
                    ? 'Developing'
                    : 'Starting'}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 flex items-center justify-between border-t border-border/50 pt-6">
          <span className="text-xs text-muted-foreground">Created {format(habit.createdAt, 'MMM d, yyyy')}</span>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                void onArchive(habit.id);
              }}
              className="text-muted-foreground hover:text-foreground"
            >
              <Archive className="mr-1 h-4 w-4" />
              Archive
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="mr-1 h-4 w-4" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete "{habit.name}"?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete this habit and all its completion history. This action cannot be
                    undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => {
                      void onDelete(habit.id);
                    }}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default HabitDetailDrawer;
