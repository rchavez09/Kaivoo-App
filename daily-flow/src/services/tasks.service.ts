import { supabase } from '@/integrations/supabase/client';
import { Task, Subtask, TaskStatus, TaskPriority, RecurrenceRule } from '@/types';
import { Tables, TablesUpdate } from '@/integrations/supabase/types';

// The `recurrence_rule` column may not exist in the remote DB yet.
// We type-extend so the code compiles, but NEVER send recurrence_rule in
// insert/update payloads unless the column is confirmed to exist.
type TaskRow = Tables<'tasks'> & { recurrence_rule?: unknown };
type TaskUpdate = TablesUpdate<'tasks'> & { recurrence_rule?: unknown };

// Set to true once the recurrence_rule migration has been applied.
// TODO: Remove this flag after running the migration and regenerating types.
const RECURRENCE_RULE_COLUMN_EXISTS = false;

// Parse JSONB recurrence_rule into typed RecurrenceRule
const VALID_RECURRENCE_TYPES = new Set(['daily', 'weekly', 'monthly']);
const parseRecurrenceRule = (raw: unknown): RecurrenceRule | undefined => {
  if (!raw || typeof raw !== 'object') return undefined;
  const obj = raw as Record<string, unknown>;
  if (typeof obj.type === 'string' && VALID_RECURRENCE_TYPES.has(obj.type) && typeof obj.interval === 'number' && obj.interval > 0) {
    return { type: obj.type as RecurrenceRule['type'], interval: obj.interval };
  }
  return undefined;
};

// DB row → App type converters
export const dbToTask = (row: TaskRow, subtasks: Subtask[] = []): Task => ({
  id: row.id,
  title: row.title,
  description: row.description,
  status: row.status as TaskStatus,
  priority: row.priority as TaskPriority,
  dueDate: row.due_date,
  startDate: row.start_date,
  tags: row.tags || [],
  topicIds: row.topic_ids || [],
  projectId: row.project_id ?? undefined,
  subtasks,
  sourceLink: row.source_link,
  recurrence: parseRecurrenceRule(row.recurrence_rule),
  createdAt: new Date(row.created_at),
  completedAt: row.completed_at ? new Date(row.completed_at) : undefined,
});

// Fetch
export const fetchTasks = async (userId: string) => {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
};

export const fetchSubtasks = async (userId: string) => {
  const { data, error } = await supabase
    .from('subtasks')
    .select('*')
    .eq('user_id', userId)
    .order('created_at');
  if (error) throw error;
  return data || [];
};

// CRUD
export const createTask = async (userId: string, task: Omit<Task, 'id' | 'createdAt'>) => {
  const payload: Record<string, unknown> = {
    user_id: userId,
    title: task.title,
    description: task.description,
    status: task.status,
    priority: task.priority,
    due_date: task.dueDate,
    start_date: task.startDate,
    tags: task.tags,
    topic_ids: task.topicIds,
    source_link: task.sourceLink,
    project_id: task.projectId ?? null,
  };
  if (RECURRENCE_RULE_COLUMN_EXISTS && task.recurrence) {
    payload.recurrence_rule = task.recurrence;
  }

  const { data, error } = await supabase
    .from('tasks')
    .insert(payload)
    .select()
    .single();
  if (error) throw error;
  return dbToTask(data, []);
};

export const updateTask = async (userId: string, id: string, updates: Partial<Task>) => {
  const dbUpdates: TaskUpdate = {};
  if (updates.title !== undefined) dbUpdates.title = updates.title;
  if (updates.description !== undefined) dbUpdates.description = updates.description;
  if (updates.status !== undefined) dbUpdates.status = updates.status;
  if (updates.priority !== undefined) dbUpdates.priority = updates.priority;
  if (updates.dueDate !== undefined) dbUpdates.due_date = updates.dueDate;
  if (updates.startDate !== undefined) dbUpdates.start_date = updates.startDate;
  if (updates.tags !== undefined) dbUpdates.tags = updates.tags;
  if (updates.topicIds !== undefined) dbUpdates.topic_ids = updates.topicIds;
  if (updates.sourceLink !== undefined) dbUpdates.source_link = updates.sourceLink;
  if (updates.projectId !== undefined) dbUpdates.project_id = updates.projectId ?? null;
  if (RECURRENCE_RULE_COLUMN_EXISTS && updates.recurrence !== undefined) dbUpdates.recurrence_rule = updates.recurrence ? updates.recurrence : null;
  if ('completedAt' in updates) dbUpdates.completed_at = updates.completedAt ? updates.completedAt.toISOString() : null;

  const { error } = await supabase.from('tasks').update(dbUpdates as TablesUpdate<'tasks'>).eq('id', id).eq('user_id', userId);
  if (error) throw error;
};

export const deleteTask = async (userId: string, id: string) => {
  const { error } = await supabase.from('tasks').delete().eq('id', id).eq('user_id', userId);
  if (error) throw error;
};

// Subtask CRUD
export const createSubtask = async (userId: string, taskId: string, title: string) => {
  const { data, error } = await supabase
    .from('subtasks')
    .insert({ user_id: userId, task_id: taskId, title })
    .select()
    .single();
  if (error) throw error;
  return { id: data.id, title: data.title, completed: data.completed };
};

export const updateSubtask = async (userId: string, id: string, updates: { completed?: boolean; completedAt?: Date; title?: string; tags?: string[] }) => {
  const dbUpdates: TablesUpdate<'subtasks'> = {};
  if (updates.completed !== undefined) dbUpdates.completed = updates.completed;
  if ('completedAt' in updates) dbUpdates.completed_at = updates.completedAt ? updates.completedAt.toISOString() : null;
  if (updates.title !== undefined) dbUpdates.title = updates.title;
  if (updates.tags !== undefined) dbUpdates.tags = updates.tags;

  const { error } = await supabase.from('subtasks').update(dbUpdates).eq('id', id).eq('user_id', userId);
  if (error) throw error;
};

export const deleteSubtask = async (userId: string, id: string) => {
  const { error } = await supabase.from('subtasks').delete().eq('id', id).eq('user_id', userId);
  if (error) throw error;
};
