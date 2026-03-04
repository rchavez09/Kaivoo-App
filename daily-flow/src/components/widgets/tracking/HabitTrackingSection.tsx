import { useMemo, useCallback } from 'react';
import { format } from 'date-fns';
import { Check, Minus, Sun } from 'lucide-react';
import { useKaivooStore } from '@/stores/useKaivooStore';
import { useAuth } from '@/hooks/useAuth';
import { useInvalidate } from '@/hooks/queries';
import { useDatabaseOperations } from '@/hooks/useDatabase';
import { Habit, TimeBlock } from '@/types';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { iconMap } from './tracking-types';

const TIME_BLOCK_LABELS: Record<TimeBlock, string> = {
  morning: 'Morning',
  afternoon: 'Afternoon',
  evening: 'Evening',
  anytime: 'Anytime',
};

const TIME_BLOCKS: TimeBlock[] = ['morning', 'afternoon', 'evening', 'anytime'];

interface HabitTrackingSectionProps {
  date?: Date;
}

const HabitTrackingSection = ({ date }: HabitTrackingSectionProps) => {
  const { user } = useAuth();
  const { invalidate } = useInvalidate();
  const db = useDatabaseOperations();
  const habits = useKaivooStore((s) => s.habits);
  const habitCompletions = useKaivooStore((s) => s.habitCompletions);
  const isHabitCompleted = useKaivooStore((s) => s.isHabitCompleted);
  const getHabitCompletionCount = useKaivooStore((s) => s.getHabitCompletionCount);
  const toggleHabitCompletion = useKaivooStore((s) => s.toggleHabitCompletion);
  const incrementHabitCount = useKaivooStore((s) => s.incrementHabitCount);

  const dateStr = useMemo(() => (date ? format(date, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd')), [date]);

  const activeHabits = useMemo(() => habits.filter((h) => !h.isArchived), [habits]);

  const habitsByBlock = useMemo(() => {
    const grouped: Record<TimeBlock, Habit[]> = {
      morning: [],
      afternoon: [],
      evening: [],
      anytime: [],
    };
    activeHabits.forEach((h) => grouped[h.timeBlock].push(h));
    Object.values(grouped).forEach((arr) => arr.sort((a, b) => a.order - b.order));
    return grouped;
  }, [activeHabits]);

  const handleToggle = useCallback(
    async (habitId: string) => {
      const wasCompleted = isHabitCompleted(habitId, dateStr);
      toggleHabitCompletion(habitId, dateStr);
      if (user) {
        try {
          await db.toggleHabitCompletion(habitId, dateStr, wasCompleted);
          invalidate('habitCompletions', 'routineCompletions');
        } catch {
          toggleHabitCompletion(habitId, dateStr);
          toast.error('Failed to update habit.');
        }
      }
    },
    [user, dateStr, isHabitCompleted, toggleHabitCompletion, invalidate],
  );

  const handleIncrement = useCallback(
    async (habitId: string) => {
      const currentCount = getHabitCompletionCount(habitId, dateStr);
      incrementHabitCount(habitId, dateStr);
      if (user) {
        try {
          await db.incrementHabitCount(habitId, dateStr, currentCount);
          invalidate('habitCompletions', 'routineCompletions');
        } catch {
          toast.error('Failed to update habit count.');
        }
      }
    },
    [user, dateStr, getHabitCompletionCount, incrementHabitCount, invalidate],
  );

  if (activeHabits.length === 0) return null;

  const populatedBlocks = TIME_BLOCKS.filter((b) => habitsByBlock[b].length > 0);

  return (
    <div className="space-y-4 pt-2">
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Habits</span>
        <div className="h-px flex-1 bg-border/50" />
      </div>

      {populatedBlocks.map((block) => (
        <div key={block} className="space-y-2">
          {populatedBlocks.length > 1 && (
            <span className="block text-[10px] uppercase tracking-wider text-muted-foreground">
              {TIME_BLOCK_LABELS[block]}
            </span>
          )}
          <div className="grid grid-cols-5 gap-2">
            {habitsByBlock[block].map((habit) => {
              const completed = isHabitCompleted(habit.id, dateStr);
              const count = getHabitCompletionCount(habit.id, dateStr);
              const isMultiCount = habit.type === 'multi-count';
              const targetCount = habit.targetCount || 1;
              const isNegative = habit.type === 'negative';
              const Icon = iconMap[habit.icon || 'sun'] || Sun;

              return (
                <button
                  key={habit.id}
                  onClick={() => {
                    if (isMultiCount) {
                      void handleIncrement(habit.id);
                    } else {
                      void handleToggle(habit.id);
                    }
                  }}
                  aria-label={
                    isMultiCount
                      ? `${habit.name}: ${count} of ${targetCount}`
                      : isNegative
                        ? completed
                          ? `${habit.name}: slipped`
                          : `${habit.name}: on track`
                        : `${completed ? 'Unmark' : 'Mark'} ${habit.name} as ${completed ? 'incomplete' : 'complete'}`
                  }
                  className={cn(
                    'flex w-full flex-col items-center gap-1.5 rounded-xl p-3 transition-all duration-200',
                    isMultiCount
                      ? count >= targetCount
                        ? 'text-foreground'
                        : 'bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground'
                      : isNegative
                        ? completed
                          ? 'bg-destructive/10 text-destructive'
                          : 'bg-success/10 text-foreground'
                        : completed
                          ? 'text-foreground'
                          : 'bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground',
                  )}
                  style={
                    (isMultiCount && count >= targetCount) || (!isMultiCount && !isNegative && completed)
                      ? { backgroundColor: `${habit.color}1A` }
                      : undefined
                  }
                >
                  <div
                    className={cn('flex h-8 w-8 items-center justify-center rounded-full transition-all duration-200')}
                    style={
                      (isMultiCount && count >= targetCount) || (!isMultiCount && !isNegative && completed)
                        ? { backgroundColor: habit.color, color: 'white' }
                        : isNegative
                          ? completed
                            ? { backgroundColor: 'var(--destructive)', color: 'white' }
                            : { backgroundColor: 'var(--success)', color: 'white' }
                          : { backgroundColor: 'var(--background)' }
                    }
                  >
                    {isMultiCount ? (
                      count >= targetCount ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <span className="text-[10px] font-medium">
                          {count}/{targetCount}
                        </span>
                      )
                    ) : isNegative ? (
                      completed ? (
                        <Minus className="h-4 w-4" />
                      ) : (
                        <Check className="h-4 w-4" />
                      )
                    ) : completed ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Icon className="h-4 w-4" />
                    )}
                  </div>
                  <span className="line-clamp-2 text-center text-[10px] font-medium leading-tight">{habit.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default HabitTrackingSection;
