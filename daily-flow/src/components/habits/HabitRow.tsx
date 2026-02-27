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
      return schedule.days.map(d => dayNames[d]).join(', ');
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
      className="rounded-xl p-4 bg-card border border-border/50 transition-all duration-200 hover:border-border hover:shadow-sm cursor-pointer flex items-center gap-4"
      onClick={onClick}
      role="listitem"
    >
      {/* Icon */}
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
        style={{
          backgroundColor: `${habit.color}26`,
          color: habit.color,
        }}
      >
        <Icon className="w-4 h-4" />
      </div>

      {/* Name + schedule */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{habit.name}</p>
        <p className="text-xs text-muted-foreground">{scheduleLabel}</p>
      </div>

      {/* Streak */}
      {habit.currentStreak > 0 && (
        <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
          <Flame className="w-3 h-3 text-orange-500" />
          <span>{habit.currentStreak}</span>
        </div>
      )}

      {/* Strength bar */}
      <div className="w-12 shrink-0">
        <div
          className="h-1.5 rounded-full bg-secondary overflow-hidden"
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
        <p className="text-[10px] text-muted-foreground text-center mt-0.5">{strengthPercent}%</p>
      </div>

      {/* Completion button */}
      {isMultiCount ? (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onIncrement?.();
          }}
          className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-medium border-2 transition-all duration-200 hover:shadow-sm"
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
          {completionCount >= targetCount
            ? <Check className="w-4 h-4" />
            : `${completionCount}/${targetCount}`
          }
        </button>
      ) : habit.type === 'negative' ? (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggle();
          }}
          className={cn(
            'w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all duration-200 hover:shadow-sm',
            isCompleted
              ? 'bg-destructive border-2 border-destructive'
              : 'bg-success border-2 border-success'
          )}
          role="checkbox"
          aria-checked={!isCompleted}
          aria-label={isCompleted ? `${habit.name}: slipped` : `${habit.name}: on track`}
        >
          {isCompleted ? (
            <Minus className="w-4 h-4 text-white" />
          ) : (
            <Check className="w-4 h-4 text-white" />
          )}
        </button>
      ) : (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggle();
          }}
          className={cn(
            'w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all duration-200 hover:shadow-sm',
            isCompleted
              ? 'border-2'
              : 'border-2 border-border hover:border-border/80 hover:bg-secondary/30'
          )}
          style={isCompleted ? {
            backgroundColor: habit.color,
            borderColor: habit.color,
          } : undefined}
          role="checkbox"
          aria-checked={isCompleted}
          aria-label={`Complete ${habit.name}`}
        >
          {isCompleted && <Check className="w-4 h-4 text-white" />}
        </button>
      )}
    </div>
  );
};

export default HabitRow;
