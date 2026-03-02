import { useState, useMemo, useCallback } from 'react';
import { Plus, Repeat } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { useKaivooStore } from '@/stores/useKaivooStore';
import { useAuth } from '@/hooks/useAuth';
import { useInvalidate } from '@/hooks/queries';
import { useDatabaseOperations } from '@/hooks/useDatabase';
import { Habit, HabitType, TimeBlock, HabitSchedule } from '@/types';
import TimeBlockSection from '@/components/habits/TimeBlockSection';
import HabitRow from '@/components/habits/HabitRow';
import HabitFormDrawer from '@/components/habits/HabitFormDrawer';
import HabitDetailDrawer from '@/components/habits/HabitDetailDrawer';
import HabitAnalytics from '@/components/habits/HabitAnalytics';
import { cn } from '@/lib/utils';

const TIME_BLOCKS: TimeBlock[] = ['morning', 'afternoon', 'evening', 'anytime'];

const RoutinesPage = () => {
  const { user } = useAuth();
  const { invalidate } = useInvalidate();
  const db = useDatabaseOperations();
  const habits = useKaivooStore((s) => s.habits);
  const isHabitCompleted = useKaivooStore((s) => s.isHabitCompleted);
  const getHabitCompletionCount = useKaivooStore((s) => s.getHabitCompletionCount);
  const toggleHabitCompletion = useKaivooStore((s) => s.toggleHabitCompletion);
  const incrementHabitCount = useKaivooStore((s) => s.incrementHabitCount);
  const addHabit = useKaivooStore((s) => s.addHabit);
  const removeHabit = useKaivooStore((s) => s.removeHabit);
  const updateHabitInStore = useKaivooStore((s) => s.updateHabitInStore);

  const [view, setView] = useState<'today' | 'analytics'>('today');
  const [formOpen, setFormOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | undefined>();
  const [selectedHabitId, setSelectedHabitId] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const activeHabits = useMemo(() => habits.filter((h) => !h.isArchived), [habits]);

  // Group habits by time block
  const habitsByBlock = useMemo(() => {
    const grouped: Record<TimeBlock, Habit[]> = {
      morning: [],
      afternoon: [],
      evening: [],
      anytime: [],
    };
    activeHabits.forEach((h) => {
      grouped[h.timeBlock].push(h);
    });
    // Sort within each block by order
    Object.values(grouped).forEach((arr) => arr.sort((a, b) => a.order - b.order));
    return grouped;
  }, [activeHabits]);

  // Progress
  const completedCount = useMemo(
    () => activeHabits.filter((h) => isHabitCompleted(h.id, todayStr)).length,
    [activeHabits, todayStr, isHabitCompleted],
  );
  const progressPercent = activeHabits.length > 0 ? Math.round((completedCount / activeHabits.length) * 100) : 0;

  // Handlers
  const handleToggle = useCallback(
    async (habitId: string) => {
      const wasCompleted = isHabitCompleted(habitId, todayStr);
      toggleHabitCompletion(habitId, todayStr);
      if (user) {
        try {
          await db.toggleHabitCompletion(habitId, todayStr, wasCompleted);
          invalidate('habitCompletions', 'routineCompletions');
        } catch {
          toggleHabitCompletion(habitId, todayStr); // rollback
          toast.error('Failed to update habit.');
        }
      }
    },
    [user, todayStr, isHabitCompleted, toggleHabitCompletion, invalidate],
  );

  const handleIncrement = useCallback(
    async (habitId: string) => {
      const currentCount = getHabitCompletionCount(habitId, todayStr);
      incrementHabitCount(habitId, todayStr);
      if (user) {
        try {
          await db.incrementHabitCount(habitId, todayStr, currentCount);
          invalidate('habitCompletions', 'routineCompletions');
        } catch {
          // Simple rollback — will be re-synced on next query
          toast.error('Failed to update habit count.');
        }
      }
    },
    [user, todayStr, getHabitCompletionCount, incrementHabitCount, invalidate],
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

  const handleEdit = useCallback(
    async (data: {
      name: string;
      icon: string;
      color: string;
      type: HabitType;
      timeBlock: TimeBlock;
      schedule: HabitSchedule;
      targetCount?: number;
    }) => {
      if (!editingHabit || !user) return;
      const prev = { ...editingHabit };
      updateHabitInStore(editingHabit.id, data);
      try {
        await db.updateHabit(editingHabit.id, data);
        invalidate('habits', 'routines');
        toast.success('Habit updated!');
      } catch {
        updateHabitInStore(editingHabit.id, prev);
        toast.error('Failed to update habit.');
      }
      setEditingHabit(undefined);
    },
    [editingHabit, user, updateHabitInStore, invalidate],
  );

  const handleDelete = useCallback(
    async (habitId: string) => {
      if (!user) return;
      const habit = habits.find((h) => h.id === habitId);
      if (!habit) return;
      removeHabit(habitId);
      setDetailOpen(false);
      try {
        await db.deleteHabit(habitId);
        invalidate('habits', 'habitCompletions', 'routines', 'routineCompletions');
        toast.success('Habit deleted.');
      } catch {
        // Re-add on failure — will re-sync on next query
        toast.error('Failed to delete habit.');
      }
    },
    [user, habits, removeHabit, invalidate],
  );

  const handleArchive = useCallback(
    async (habitId: string) => {
      if (!user) return;
      updateHabitInStore(habitId, { isArchived: true });
      setDetailOpen(false);
      try {
        await db.archiveHabit(habitId);
        invalidate('habits', 'routines');
        toast.success('Habit archived.');
      } catch {
        updateHabitInStore(habitId, { isArchived: false });
        toast.error('Failed to archive habit.');
      }
    },
    [user, updateHabitInStore, invalidate],
  );

  const openDetail = (habitId: string) => {
    setSelectedHabitId(habitId);
    setDetailOpen(true);
  };

  const openEdit = (habit: Habit) => {
    setEditingHabit(habit);
    setFormOpen(true);
  };

  const hasHabits = activeHabits.length > 0;

  return (
    <AppLayout>
      <div className="mx-auto max-w-4xl px-6 py-8">
        {/* Header */}
        <header className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="mb-1 text-2xl font-semibold text-foreground">Routines & Habits</h1>
            <p className="text-sm text-muted-foreground">
              {activeHabits.length} habit{activeHabits.length !== 1 ? 's' : ''}
              {hasHabits && ` · ${completedCount}/${activeHabits.length} done today`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* View toggle */}
            <div className="flex rounded-lg bg-secondary p-0.5" role="tablist">
              <button
                onClick={() => setView('today')}
                className={cn(
                  'rounded-md px-3 py-1.5 text-sm font-medium transition-all',
                  view === 'today'
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground',
                )}
                role="tab"
                aria-selected={view === 'today'}
              >
                Today
              </button>
              <button
                onClick={() => setView('analytics')}
                className={cn(
                  'rounded-md px-3 py-1.5 text-sm font-medium transition-all',
                  view === 'analytics'
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground',
                )}
                role="tab"
                aria-selected={view === 'analytics'}
              >
                Analytics
              </button>
            </div>
            <Button
              onClick={() => {
                setEditingHabit(undefined);
                setFormOpen(true);
              }}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              New Habit
            </Button>
          </div>
        </header>

        {view === 'today' ? (
          <div className="space-y-4">
            {/* Progress bar */}
            {hasHabits && (
              <div className="widget-card p-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">{progressPercent}%</span>
                  <span className="text-xs text-muted-foreground">
                    {completedCount} of {activeHabits.length} complete
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            )}

            {/* Habits by time block */}
            {hasHabits ? (
              TIME_BLOCKS.map((block) => {
                const blockHabits = habitsByBlock[block];
                if (blockHabits.length === 0) return null;
                return (
                  <TimeBlockSection key={block} timeBlock={block}>
                    {blockHabits.map((habit) => (
                      <HabitRow
                        key={habit.id}
                        habit={habit}
                        isCompleted={isHabitCompleted(habit.id, todayStr)}
                        completionCount={getHabitCompletionCount(habit.id, todayStr)}
                        onToggle={() => {
                          void handleToggle(habit.id);
                        }}
                        onIncrement={() => {
                          void handleIncrement(habit.id);
                        }}
                        onClick={() => openDetail(habit.id)}
                      />
                    ))}
                  </TimeBlockSection>
                );
              })
            ) : (
              <div className="widget-card p-12 text-center">
                <Repeat className="mx-auto mb-4 h-12 w-12 text-muted-foreground/30" />
                <h3 className="mb-2 text-lg font-medium text-foreground">Start building habits</h3>
                <p className="mb-6 text-sm text-muted-foreground">
                  Track daily routines, build streaks, and see how habits impact your mood.
                </p>
                <Button
                  onClick={() => {
                    setEditingHabit(undefined);
                    setFormOpen(true);
                  }}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Create your first habit
                </Button>
              </div>
            )}
          </div>
        ) : (
          <HabitAnalytics />
        )}
      </div>

      {/* Form Drawer */}
      <HabitFormDrawer
        open={formOpen}
        onOpenChange={setFormOpen}
        habit={editingHabit}
        onSave={editingHabit ? handleEdit : handleCreate}
      />

      {/* Detail Drawer */}
      <HabitDetailDrawer
        habitId={selectedHabitId}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onEdit={openEdit}
        onDelete={handleDelete}
        onArchive={handleArchive}
      />
    </AppLayout>
  );
};

export default RoutinesPage;
