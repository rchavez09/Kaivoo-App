import { useState, useMemo, useCallback } from 'react';
import { Repeat, Plus, Check, Minus, Sun, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { useKaivooStore } from '@/stores/useKaivooStore';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useInvalidate } from '@/hooks/queries';
import { useDatabaseOperations } from '@/hooks/useDatabase';
import { toast } from 'sonner';
import { Habit, HabitType, TimeBlock, HabitSchedule } from '@/types';
import HabitFormDrawer from '@/components/habits/HabitFormDrawer';
import { iconMap } from './tracking/tracking-types';
import { cn } from '@/lib/utils';

const TIME_BLOCK_LABELS: Record<TimeBlock, string> = {
  morning: 'Morning',
  afternoon: 'Afternoon',
  evening: 'Evening',
  anytime: 'Anytime',
};

const TIME_BLOCKS: TimeBlock[] = ['morning', 'afternoon', 'evening', 'anytime'];

interface TrackingWidgetProps {
  date?: Date;
}

const TrackingWidget = ({ date }: TrackingWidgetProps = {}) => {
  const [formOpen, setFormOpen] = useState(false);

  const { user } = useAuth();
  const { invalidate } = useInvalidate();
  const db = useDatabaseOperations();
  const habits = useKaivooStore((s) => s.habits);
  const habitCompletions = useKaivooStore((s) => s.habitCompletions);
  const isHabitCompleted = useKaivooStore((s) => s.isHabitCompleted);
  const getHabitCompletionCount = useKaivooStore((s) => s.getHabitCompletionCount);
  const toggleHabitCompletion = useKaivooStore((s) => s.toggleHabitCompletion);
  const incrementHabitCount = useKaivooStore((s) => s.incrementHabitCount);
  const addHabit = useKaivooStore((s) => s.addHabit);
  const removeHabit = useKaivooStore((s) => s.removeHabit);

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

  const completedCount = useMemo(
    () =>
      activeHabits.filter((h) => {
        if (h.type === 'multi-count') {
          return getHabitCompletionCount(h.id, dateStr) >= (h.targetCount || 1);
        }
        return isHabitCompleted(h.id, dateStr);
      }).length,
    [activeHabits, dateStr, isHabitCompleted, getHabitCompletionCount, habitCompletions],
  );
  const totalCount = activeHabits.length;
  const overallProgress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const populatedBlocks = useMemo(() => TIME_BLOCKS.filter((b) => habitsByBlock[b].length > 0), [habitsByBlock]);

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

  const handleCreate = useCallback(
    async (data: {
      name: string;
      icon: string;
      color: string;
      type: HabitType;
      timeBlock: TimeBlock;
      schedule: HabitSchedule;
      targetCount?: number;
    }) => {
      const newHabit = addHabit({
        ...data,
        isArchived: false,
        order: activeHabits.length,
        groupId: undefined,
      });
      if (user) {
        try {
          await db.createHabit({
            ...data,
            order: activeHabits.length,
          });
          invalidate('habits', 'routines');
          toast.success('Habit created!');
        } catch {
          removeHabit(newHabit.id);
          toast.error('Failed to create habit.');
        }
      }
    },
    [user, activeHabits.length, addHabit, removeHabit, invalidate],
  );

  return (
    <div className="widget-card animate-fade-in" style={{ animationDelay: '0.15s' }} id="day-section-routines">
      <div className="widget-header">
        <div className="flex items-center gap-2">
          <Repeat className="h-4 w-4 text-primary" />
          <span className="widget-title">Habits</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">
            {completedCount}/{totalCount}
          </span>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Add habit"
            className="h-6 w-6"
            onClick={() => setFormOpen(true)}
          >
            <Plus className="h-3 w-3" />
          </Button>
          <Link to="/routines">
            <Button variant="ghost" size="sm" className="h-6 px-1.5 text-muted-foreground hover:text-foreground">
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Overall progress bar */}
      {totalCount > 0 && (
        <div className="mb-4 h-1.5 overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full rounded-full bg-primary transition-all duration-300 ease-out"
            style={{ width: `${overallProgress}%` }}
          />
        </div>
      )}

      {totalCount === 0 ? (
        <div className="py-6 text-center">
          <p className="mb-3 text-sm text-muted-foreground">No habits yet</p>
          <Button variant="outline" size="sm" onClick={() => setFormOpen(true)} className="gap-1.5">
            <Plus className="h-3.5 w-3.5" />
            Add your first habit
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {populatedBlocks.map((block) => (
            <div key={block}>
              {populatedBlocks.length > 1 && (
                <span className="mb-1.5 block text-[10px] uppercase tracking-wider text-muted-foreground">
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
                  const multiDone = isMultiCount && count >= targetCount;
                  const Icon = iconMap[habit.icon || 'sun'] || Sun;

                  // Determine completed state for display
                  const showCompleted = isMultiCount ? multiDone : completed;
                  // For negative habits: "completed" means they slipped
                  const isPositiveComplete = !isNegative && showCompleted;
                  const isNegativeSlipped = isNegative && completed;

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
                            : `${showCompleted ? 'Unmark' : 'Mark'} ${habit.name}`
                      }
                      className={cn(
                        'flex w-full flex-col items-center gap-1.5 rounded-xl p-3 transition-all duration-200',
                        isPositiveComplete || multiDone
                          ? 'text-foreground'
                          : isNegativeSlipped
                            ? 'bg-destructive/10 text-destructive'
                            : isNegative && !completed
                              ? 'bg-success/10 text-foreground'
                              : 'bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground',
                      )}
                      style={isPositiveComplete || multiDone ? { backgroundColor: `${habit.color}1A` } : undefined}
                    >
                      {/* Icon circle — dark bg like routines */}
                      <div
                        className="flex h-8 w-8 items-center justify-center rounded-full transition-all duration-200"
                        style={
                          isPositiveComplete || multiDone
                            ? { backgroundColor: habit.color, color: 'white' }
                            : isNegativeSlipped
                              ? { backgroundColor: 'var(--destructive)', color: 'white' }
                              : isNegative && !completed
                                ? { backgroundColor: 'var(--success)', color: 'white' }
                                : { backgroundColor: 'var(--background)' }
                        }
                      >
                        {isPositiveComplete || multiDone ? (
                          <Check className="h-4 w-4" />
                        ) : isNegativeSlipped ? (
                          <Minus className="h-4 w-4" />
                        ) : isNegative && !completed ? (
                          <Check className="h-4 w-4" />
                        ) : isMultiCount ? (
                          <span className="text-[10px] font-medium text-muted-foreground">
                            {count}/{targetCount}
                          </span>
                        ) : (
                          <Icon className="h-4 w-4" />
                        )}
                      </div>
                      <span className="line-clamp-2 text-center text-[10px] font-medium leading-tight">
                        {habit.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form Drawer for adding habits */}
      <HabitFormDrawer open={formOpen} onOpenChange={setFormOpen} onSave={handleCreate} />
    </div>
  );
};

export default TrackingWidget;
