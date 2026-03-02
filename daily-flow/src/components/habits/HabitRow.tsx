import { useMemo } from 'react';
import { Check, Flame, Minus, Sun } from 'lucide-react';
import { Habit } from '@/types';
import { cn } from '@/lib/utils';
import { iconMap } from '@/components/widgets/tracking/tracking-types';

interface HabitRowProps {
  habit: Habit;
  isCompleted: boolean;
  completionCount: number;
  onToggle: () => void;
  onIncrement?: () => void;
  onClick: () => void;
}

const HabitRow = ({ habit, isCompleted, completionCount, onToggle, onIncrement, onClick }: HabitRowProps) => {
  const scheduleLabel = useMemo(() => {
    const { schedule } = habit;
    if (schedule.type === 'daily') return 'Daily';
    if (schedule.type === 'specific_days' && schedule.days) {
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      return schedule.days.map((d) => dayNames[d]).join(', ');
    }
    if (schedule.type === 'x_per_week') return `${schedule.timesPerPeriod}x per week`;
    return 'Daily';
  }, [habit]);

  const strengthPercent = Math.round(habit.strength);

  // Multi-count progress
  const isMultiCount = habit.type === 'multi-count';
  const targetCount = habit.targetCount || 1;
  const Icon = iconMap[habit.icon || 'sun'] || Sun;

  return (
    <div
      className="flex cursor-pointer items-center gap-4 rounded-xl border border-border/50 bg-card p-4 transition-all duration-200 hover:border-border hover:shadow-sm"
      onClick={onClick}
      role="listitem"
    >
      {/* Icon */}
      <div
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
        style={{
          backgroundColor: `${habit.color}26`,
          color: habit.color,
        }}
      >
        <Icon className="h-4 w-4" />
      </div>

      {/* Name + schedule */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">{habit.name}</p>
        <p className="text-xs text-muted-foreground">{scheduleLabel}</p>
      </div>

      {/* Streak */}
      {habit.currentStreak > 0 && (
        <div className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
          <Flame className="h-3 w-3 text-orange-500" />
          <span>{habit.currentStreak}</span>
        </div>
      )}

      {/* Strength bar */}
      <div className="w-12 shrink-0">
        <div
          className="h-1.5 overflow-hidden rounded-full bg-secondary"
          role="meter"
          aria-valuenow={strengthPercent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${habit.name} strength: ${strengthPercent}%`}
        >
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${strengthPercent}%`,
              backgroundColor: habit.color,
            }}
          />
        </div>
        <p className="mt-0.5 text-center text-[10px] text-muted-foreground">{strengthPercent}%</p>
      </div>

      {/* Completion button */}
      {isMultiCount ? (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onIncrement?.();
          }}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-medium transition-all duration-200 hover:shadow-sm"
          style={{
            borderColor: completionCount >= targetCount ? habit.color : 'var(--border)',
            backgroundColor: completionCount >= targetCount ? habit.color : 'transparent',
            color: completionCount >= targetCount ? 'white' : 'var(--muted-foreground)',
          }}
          role="progressbar"
          aria-valuenow={completionCount}
          aria-valuemax={targetCount}
          aria-label={`${habit.name}: ${completionCount} of ${targetCount}`}
        >
          {completionCount >= targetCount ? <Check className="h-4 w-4" /> : `${completionCount}/${targetCount}`}
        </button>
      ) : habit.type === 'negative' ? (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggle();
          }}
          className={cn(
            'flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-all duration-200 hover:shadow-sm',
            isCompleted ? 'border-2 border-destructive bg-destructive' : 'border-2 border-success bg-success',
          )}
          role="checkbox"
          aria-checked={!isCompleted}
          aria-label={isCompleted ? `${habit.name}: slipped` : `${habit.name}: on track`}
        >
          {isCompleted ? <Minus className="h-4 w-4 text-white" /> : <Check className="h-4 w-4 text-white" />}
        </button>
      ) : (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggle();
          }}
          className={cn(
            'flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-all duration-200 hover:shadow-sm',
            isCompleted ? 'border-2' : 'border-2 border-border hover:border-border/80 hover:bg-secondary/30',
          )}
          style={
            isCompleted
              ? {
                  backgroundColor: habit.color,
                  borderColor: habit.color,
                }
              : undefined
          }
          role="checkbox"
          aria-checked={isCompleted}
          aria-label={`Complete ${habit.name}`}
        >
          {isCompleted && <Check className="h-4 w-4 text-white" />}
        </button>
      )}
    </div>
  );
};

export default HabitRow;
