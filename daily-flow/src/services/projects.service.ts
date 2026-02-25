import { supabase } from '@/integrations/supabase/client';
import { Project, ProjectStatus } from '@/types';
import { Tables, TablesUpdate } from '@/integrations/supabase/types';

// DB row → App type converter
export const dbToProject = (row: Tables<'projects'>): Project => ({
  id: row.id,
  name: row.name,
  description: row.description ?? undefined,
  topicId: row.topic_id ?? undefined,
  status: row.status as ProjectStatus,
  color: row.color ?? undefined,
  icon: row.icon ?? undefined,
  startDate: row.start_date ?? undefined,
  endDate: row.end_date ?? undefined,
  createdAt: new Date(row.created_at),
  updatedAt: new Date(row.updated_at),
});

// Fetch
export const fetchProjects = async (userId: string) => {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
};

// CRUD
export const createProject = async (userId: string, project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => {
  const { data, error } = await supabase
    .from('projects')
    .insert({
      user_id: userId,
      name: project.name,
      description: project.description,
      topic_id: project.topicId,
      status: project.status,
      color: project.color,
      icon: project.icon,
      start_date: project.startDate,
      end_date: project.endDate,
    })
    .select()
    .single();
  if (error) throw error;
  return dbToProject(data);
};

export const updateProject = async (userId: string, id: string, updates: Partial<Project>) => {
  const dbUpdates: TablesUpdate<'projects'> = {};
  if (updates.name !== undefined) dbUpdates.name = updates.name;
  if (updates.description !== undefined) dbUpdates.description = updates.description;
  if (updates.topicId !== undefined) dbUpdates.topic_id = updates.topicId ?? null;
  if (updates.status !== undefined) dbUpdates.status = updates.status;
  if (updates.color !== undefined) dbUpdates.color = updates.color;
  if (updates.icon !== undefined) dbUpdates.icon = updates.icon;
  if (updates.startDate !== undefined) dbUpdates.start_date = updates.startDate ?? null;
  if (updates.endDate !== undefined) dbUpdates.end_date = updates.endDate ?? null;
  dbUpdates.updated_at = new Date().toISOString();

  const { error } = await supabase.from('projects').update(dbUpdates).eq('id', id).eq('user_id', userId);
  if (error) throw error;
};

export const deleteProject = async (userId: string, id: string) => {
  const { error } = await supabase.from('projects').delete().eq('id', id).eq('user_id', userId);
  if (error) throw error;
};
