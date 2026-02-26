import { supabase } from '@/integrations/supabase/client';
import { ProjectNote } from '@/types';
import { Tables } from '@/integrations/supabase/types';

// DB row → App type converter
export const dbToProjectNote = (row: Tables<'project_notes'>): ProjectNote => ({
  id: row.id,
  projectId: row.project_id,
  content: row.content,
  createdAt: new Date(row.created_at),
  updatedAt: new Date(row.updated_at),
});

// Fetch all project notes for a user
export const fetchProjectNotes = async (userId: string) => {
  const { data, error } = await supabase
    .from('project_notes')
    .select('id, project_id, content, created_at, updated_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
};

// Create
export const createProjectNote = async (
  userId: string,
  note: Pick<ProjectNote, 'projectId' | 'content'>
) => {
  const { data, error } = await supabase
    .from('project_notes')
    .insert({
      user_id: userId,
      project_id: note.projectId,
      content: note.content,
    })
    .select('id, project_id, content, created_at, updated_at')
    .single();
  if (error) throw error;
  return dbToProjectNote(data);
};

// Update
export const updateProjectNote = async (
  userId: string,
  id: string,
  updates: Partial<Pick<ProjectNote, 'content'>>
) => {
  const { error } = await supabase
    .from('project_notes')
    .update({ content: updates.content })
    .eq('id', id)
    .eq('user_id', userId);
  if (error) throw error;
};

// Delete
export const deleteProjectNote = async (userId: string, id: string) => {
  const { error } = await supabase
    .from('project_notes')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);
  if (error) throw error;
};
