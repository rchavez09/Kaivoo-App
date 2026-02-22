import { supabase } from '@/integrations/supabase/client';
import { RoutineItem, RoutineGroup } from '@/types';
import { Tables } from '@/integrations/supabase/types';

// DB row → App type converters
export const dbToRoutine = (row: Tables<'routines'>): RoutineItem => ({
  id: row.id,
  name: row.name,
  icon: row.icon,
  order: row.order,
  groupId: row.group_id,
});

export const dbToRoutineGroup = (row: Tables<'routine_groups'>): RoutineGroup => ({
  id: row.id,
  name: row.name,
  icon: row.icon,
  color: row.color,
  order: row.order,
  createdAt: new Date(row.created_at),
});

// Fetch
export const fetchRoutines = async (userId: string) => {
  const { data, error } = await supabase
    .from('routines')
    .select('*')
    .eq('user_id', userId)
    .order('order');
  if (error) throw error;
  return data || [];
};

export const fetchRoutineGroups = async (userId: string) => {
  const { data, error } = await supabase
    .from('routine_groups')
    .select('*')
    .eq('user_id', userId)
    .order('order');
  if (error) throw error;
  return data || [];
};

export const fetchRoutineCompletions = async (userId: string) => {
  const cutoff = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
  const { data, error } = await supabase
    .from('routine_completions')
    .select('*')
    .eq('user_id', userId)
    .gte('completed_at', cutoff)
    .order('completed_at', { ascending: false });
  if (error) throw error;
  return data || [];
};

// Routine CRUD
export const createRoutine = async (userId: string, name: string, icon?: string, order?: number, groupId?: string) => {
  const { data, error } = await supabase
    .from('routines')
    .insert({ user_id: userId, name, icon, order: order ?? 0, group_id: groupId })
    .select()
    .single();
  if (error) throw error;
  return dbToRoutine(data);
};

export const updateRoutine = async (userId: string, id: string, updates: Partial<RoutineItem> & { groupId?: string | null }) => {
  const dbUpdates: Record<string, unknown> = {};
  if (updates.name !== undefined) dbUpdates.name = updates.name;
  if (updates.icon !== undefined) dbUpdates.icon = updates.icon;
  if (updates.order !== undefined) dbUpdates.order = updates.order;
  if ('groupId' in updates) dbUpdates.group_id = updates.groupId;

  const { error } = await supabase.from('routines').update(dbUpdates).eq('id', id).eq('user_id', userId);
  if (error) throw error;
};

export const deleteRoutine = async (userId: string, id: string) => {
  const { error } = await supabase.from('routines').delete().eq('id', id).eq('user_id', userId);
  if (error) throw error;
};

// Routine Group CRUD
export const createRoutineGroup = async (userId: string, name: string, icon?: string, color?: string, order?: number) => {
  const { data, error } = await supabase
    .from('routine_groups')
    .insert({ user_id: userId, name, icon, color, order: order ?? 0 })
    .select()
    .single();
  if (error) throw error;
  return dbToRoutineGroup(data);
};

export const updateRoutineGroup = async (userId: string, id: string, updates: Partial<RoutineGroup>) => {
  const dbUpdates: Record<string, unknown> = {};
  if (updates.name !== undefined) dbUpdates.name = updates.name;
  if (updates.icon !== undefined) dbUpdates.icon = updates.icon;
  if (updates.color !== undefined) dbUpdates.color = updates.color;
  if (updates.order !== undefined) dbUpdates.order = updates.order;

  const { error } = await supabase.from('routine_groups').update(dbUpdates).eq('id', id).eq('user_id', userId);
  if (error) throw error;
};

export const deleteRoutineGroup = async (userId: string, id: string) => {
  await supabase.from('routines').update({ group_id: null }).eq('group_id', id).eq('user_id', userId);
  const { error } = await supabase.from('routine_groups').delete().eq('id', id).eq('user_id', userId);
  if (error) throw error;
};

// Routine Completion
export const toggleRoutineCompletion = async (userId: string, routineId: string, date: string, isCompleted: boolean) => {
  if (isCompleted) {
    const { error } = await supabase
      .from('routine_completions')
      .delete()
      .eq('routine_id', routineId)
      .eq('date', date)
      .eq('user_id', userId);
    if (error) throw error;
  } else {
    const { error } = await supabase
      .from('routine_completions')
      .insert({ user_id: userId, routine_id: routineId, date });
    if (error) throw error;
  }
};
