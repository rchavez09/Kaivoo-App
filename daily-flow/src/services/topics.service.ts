import { supabase } from '@/integrations/supabase/client';
import { Topic, TopicPage, Tag } from '@/types';
import { Tables } from '@/integrations/supabase/types';

// DB row → App type converters
export const dbToTopic = (row: Tables<'topics'>): Topic => ({
  id: row.id,
  name: row.name,
  description: row.description,
  content: (row as Record<string, unknown>).content as string | undefined,
  icon: row.icon,
  parentId: row.parent_id,
  createdAt: new Date(row.created_at),
});

export const dbToTopicPage = (row: Tables<'topic_pages'>): TopicPage => ({
  id: row.id,
  topicId: row.topic_id,
  name: row.name,
  description: row.description,
  content: (row as Record<string, unknown>).content as string | undefined,
  createdAt: new Date(row.created_at),
});

export const dbToTag = (row: Tables<'tags'>): Tag => ({
  id: row.id,
  name: row.name,
  color: row.color,
});

// Fetch
export const fetchTopics = async (userId: string) => {
  const { data, error } = await supabase.from('topics').select('*').eq('user_id', userId).order('created_at');
  if (error) throw error;
  return data || [];
};

export const fetchTopicPages = async (userId: string) => {
  const { data, error } = await supabase.from('topic_pages').select('*').eq('user_id', userId).order('created_at');
  if (error) throw error;
  return data || [];
};

export const fetchTags = async (userId: string) => {
  const { data, error } = await supabase.from('tags').select('*').eq('user_id', userId).order('name');
  if (error) throw error;
  return data || [];
};

// Topic CRUD
export const createTopic = async (userId: string, topic: Omit<Topic, 'id' | 'createdAt'>) => {
  const normalizedName = topic.name.trim().replace(/\s+/g, ' ');
  const parentId = topic.parentId ?? null;

  let existingQuery = supabase
    .from('topics')
    .select('*')
    .eq('user_id', userId)
    .ilike('name', normalizedName)
    .order('created_at', { ascending: true })
    .limit(1);

  existingQuery = parentId ? existingQuery.eq('parent_id', parentId) : existingQuery.is('parent_id', null);

  const { data: existing } = await existingQuery.maybeSingle();
  if (existing) return dbToTopic(existing);

  const { data, error } = await supabase
    .from('topics')
    .insert({
      user_id: userId,
      name: normalizedName,
      description: topic.description,
      content: topic.content,
      icon: topic.icon,
      parent_id: parentId,
    } as Record<string, unknown>)
    .select()
    .single();
  if (error) throw error;
  return dbToTopic(data);
};

export const updateTopic = async (
  userId: string,
  id: string,
  updates: { name?: string; description?: string; content?: string; icon?: string },
) => {
  const dbUpdates: Record<string, unknown> = {};
  if (updates.name !== undefined) dbUpdates.name = updates.name;
  if (updates.description !== undefined) dbUpdates.description = updates.description;
  if (updates.content !== undefined) dbUpdates.content = updates.content;
  if (updates.icon !== undefined) dbUpdates.icon = updates.icon;

  const { data, error } = await supabase
    .from('topics')
    .update(dbUpdates)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single();
  if (error) throw error;
  return dbToTopic(data);
};

export const deleteTopic = async (userId: string, id: string) => {
  const { error } = await supabase.from('topics').delete().eq('id', id).eq('user_id', userId);
  if (error) throw error;
};

// Topic Page CRUD
export const createTopicPage = async (userId: string, page: Omit<TopicPage, 'id' | 'createdAt'>) => {
  const normalizedName = page.name.trim().replace(/\s+/g, ' ');

  const { data: existing } = await supabase
    .from('topic_pages')
    .select('*')
    .eq('user_id', userId)
    .eq('topic_id', page.topicId)
    .ilike('name', normalizedName)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();

  if (existing) return dbToTopicPage(existing);

  const { data, error } = await supabase
    .from('topic_pages')
    .insert({
      user_id: userId,
      topic_id: page.topicId,
      name: normalizedName,
      description: page.description,
      content: page.content,
    } as Record<string, unknown>)
    .select()
    .single();
  if (error) throw error;
  return dbToTopicPage(data);
};

export const updateTopicPage = async (
  userId: string,
  id: string,
  updates: { name?: string; description?: string; content?: string },
) => {
  const dbUpdates: Record<string, unknown> = {};
  if (updates.name !== undefined) dbUpdates.name = updates.name;
  if (updates.description !== undefined) dbUpdates.description = updates.description;
  if (updates.content !== undefined) dbUpdates.content = updates.content;

  const { data, error } = await supabase
    .from('topic_pages')
    .update(dbUpdates)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single();
  if (error) throw error;
  return dbToTopicPage(data);
};

export const deleteTopicPage = async (userId: string, id: string) => {
  const { error } = await supabase.from('topic_pages').delete().eq('id', id).eq('user_id', userId);
  if (error) throw error;
};

// Tag CRUD
export const createTag = async (userId: string, name: string, color?: string) => {
  const { data, error } = await supabase
    .from('tags')
    .insert({ user_id: userId, name: name.toLowerCase(), color })
    .select()
    .single();
  if (error) throw error;
  return dbToTag(data);
};
