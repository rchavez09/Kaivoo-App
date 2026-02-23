import { supabase } from '@/integrations/supabase/client';
import { Capture } from '@/types';
import { Tables, TablesUpdate } from '@/integrations/supabase/types';

// DB row → App type converter
export const dbToCapture = (row: Tables<'captures'>): Capture => ({
  id: row.id,
  content: row.content,
  source: row.source,
  sourceId: row.source_id,
  date: row.date,
  tags: row.tags || [],
  topicIds: row.topic_ids || [],
  createdAt: new Date(row.created_at),
});

// Fetch
export const fetchCaptures = async (userId: string) => {
  const { data, error } = await supabase
    .from('captures')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
};

// CRUD
export const createCapture = async (userId: string, capture: Omit<Capture, 'id' | 'createdAt'>) => {
  const { data, error } = await supabase
    .from('captures')
    .insert({
      user_id: userId,
      content: capture.content,
      source: capture.source,
      source_id: capture.sourceId,
      date: capture.date,
      tags: capture.tags,
      topic_ids: capture.topicIds,
    })
    .select()
    .single();
  if (error) throw error;
  return dbToCapture(data);
};

export const updateCapture = async (userId: string, id: string, updates: Partial<Capture>) => {
  const dbUpdates: TablesUpdate<'captures'> = {};
  if (updates.content !== undefined) dbUpdates.content = updates.content;
  if (updates.tags !== undefined) dbUpdates.tags = updates.tags;
  if (updates.topicIds !== undefined) dbUpdates.topic_ids = updates.topicIds;

  const { error } = await supabase.from('captures').update(dbUpdates).eq('id', id).eq('user_id', userId);
  if (error) throw error;
};

export const deleteCapture = async (userId: string, id: string) => {
  const { error } = await supabase.from('captures').delete().eq('id', id).eq('user_id', userId);
  if (error) throw error;
};
