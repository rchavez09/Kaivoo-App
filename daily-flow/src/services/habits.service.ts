import { supabase } from '@/integrations/supabase/client';
import { Habit, HabitCompletion, HabitType, TimeBlock, HabitSchedule } from '@/types';
import { Tables, TablesUpdate } from '@/integrations/supabase/types';

// DB row → App type converters

export const dbToHabit = (row: Tables<'routines'>): Habit => ({
  id: row.id,
  name: row.name,
  icon: row.icon || undefined,
  color: row.color || '#3B8C8C',
  type: (row.type as HabitType) || 'positive',
  timeBlock: (row.time_block as TimeBlock) || 'anytime',
  schedule: (row.schedule as unknown as HabitSchedule) || { type: 'daily' },
  targetCount: row.target_count || undefined,
  strength: row.strength || 0,
  currentStreak: row.current_streak || 0,
  bestStreak: row.best_streak || 0,
  isArchived: row.is_archived || false,
  order: row.order,
  groupId: row.group_id || undefined,
  createdAt: new Date(row.created_at),
  updatedAt: row.updated_at ? new Date(row.updated_at) : new Date(row.created_at),
});

export const dbToHabitCompletion = (row: Tables<'routine_completions'>): HabitCompletion => ({
  id: row.id,
  habitId: row.routine_id,
  date: row.date,
  count: row.count || undefined,
  skipped: row.skipped || false,
  completedAt: new Date(row.completed_at),
});

// Fetch

export const fetchHabits = async (userId: string) => {
  // Try with is_archived filter (requires migration); fall back gracefully
  const { data, error } = await supabase
    .from('routines')
    .select('*')
    .eq('user_id', userId)
    .eq('is_archived', false)
    .order('order');
  if (error) {
    // Column doesn't exist yet — migration not applied. Return empty.
    console.warn('[HabitsService] fetchHabits failed (migration pending?):', error.message);
    return [];
  }
  return data || [];
};

export const fetchHabitCompletions = async (userId: string) => {
  // Fetch last 365 days for analytics (up from 90 for routines)
  const cutoff = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString();
  const { data, error } = await supabase
    .from('routine_completions')
    .select('*')
    .eq('user_id', userId)
    .gte('completed_at', cutoff)
    .order('completed_at', { ascending: false });
  if (error) {
    console.warn('[HabitsService] fetchHabitCompletions failed (migration pending?):', error.message);
    return [];
  }
  return data || [];
};

// Habit CRUD

export const createHabit = async (
  userId: string,
  habit: {
    name: string;
    icon?: string;
    color?: string;
    type?: HabitType;
    timeBlock?: TimeBlock;
    schedule?: HabitSchedule;
    targetCount?: number;
    order?: number;
  }
) => {
  const { data, error } = await supabase
    .from('routines')
    .insert({
      user_id: userId,
      name: habit.name,
      icon: habit.icon,
      color: habit.color || '#3B8C8C',
      type: habit.type || 'positive',
      time_block: habit.timeBlock || 'anytime',
      schedule: (habit.schedule || { type: 'daily' }) as unknown as Record<string, unknown>,
      target_count: habit.targetCount,
      order: habit.order ?? 0,
      strength: 0,
      current_streak: 0,
      best_streak: 0,
      is_archived: false,
    })
    .select()
    .single();
  if (error) throw error;
  return dbToHabit(data);
};

export const updateHabit = async (
  userId: string,
  id: string,
  updates: Partial<Omit<Habit, 'id' | 'createdAt'>>
) => {
  const dbUpdates: TablesUpdate<'routines'> = { updated_at: new Date().toISOString() };
  if (updates.name !== undefined) dbUpdates.name = updates.name;
  if (updates.icon !== undefined) dbUpdates.icon = updates.icon;
  if (updates.color !== undefined) dbUpdates.color = updates.color;
  if (updates.type !== undefined) dbUpdates.type = updates.type;
  if (updates.timeBlock !== undefined) dbUpdates.time_block = updates.timeBlock;
  if (updates.schedule !== undefined) dbUpdates.schedule = updates.schedule as unknown as Record<string, unknown>;
  if (updates.targetCount !== undefined) dbUpdates.target_count = updates.targetCount;
  if (updates.strength !== undefined) dbUpdates.strength = updates.strength;
  if (updates.currentStreak !== undefined) dbUpdates.current_streak = updates.currentStreak;
  if (updates.bestStreak !== undefined) dbUpdates.best_streak = updates.bestStreak;
  if (updates.isArchived !== undefined) dbUpdates.is_archived = updates.isArchived;
  if (updates.order !== undefined) dbUpdates.order = updates.order;

  const { error } = await supabase
    .from('routines')
    .update(dbUpdates)
    .eq('id', id)
    .eq('user_id', userId);
  if (error) throw error;
};

export const deleteHabit = async (userId: string, id: string) => {
  // Delete completions first (FK constraint)
  await supabase
    .from('routine_completions')
    .delete()
    .eq('routine_id', id)
    .eq('user_id', userId);

  const { error } = await supabase
    .from('routines')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);
  if (error) throw error;
};

export const archiveHabit = async (userId: string, id: string) => {
  const { error } = await supabase
    .from('routines')
    .update({ is_archived: true, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', userId);
  if (error) throw error;
};

// Completions

export const toggleHabitCompletion = async (
  userId: string,
  habitId: string,
  date: string,
  isCurrentlyCompleted: boolean
) => {
  if (isCurrentlyCompleted) {
    const { error } = await supabase
      .from('routine_completions')
      .delete()
      .eq('routine_id', habitId)
      .eq('date', date)
      .eq('user_id', userId);
    if (error) throw error;
  } else {
    const { error } = await supabase
      .from('routine_completions')
      .insert({ user_id: userId, routine_id: habitId, date });
    if (error) throw error;
  }
};

export const incrementHabitCount = async (
  userId: string,
  habitId: string,
  date: string,
  currentCount: number
) => {
  // Check if a completion row exists for this habit+date
  const { data: existing } = await supabase
    .from('routine_completions')
    .select('id, count')
    .eq('routine_id', habitId)
    .eq('date', date)
    .eq('user_id', userId)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from('routine_completions')
      .update({ count: currentCount + 1 })
      .eq('id', existing.id);
    if (error) throw error;
  } else {
    const { error } = await supabase
      .from('routine_completions')
      .insert({ user_id: userId, routine_id: habitId, date, count: 1 });
    if (error) throw error;
  }
};

export const updateHabitStrengthAndStreak = async (
  userId: string,
  habitId: string,
  strength: number,
  currentStreak: number,
  bestStreak: number
) => {
  const { error } = await supabase
    .from('routines')
    .update({
      strength,
      current_streak: currentStreak,
      best_streak: bestStreak,
      updated_at: new Date().toISOString(),
    })
    .eq('id', habitId)
    .eq('user_id', userId);
  if (error) throw error;
};
