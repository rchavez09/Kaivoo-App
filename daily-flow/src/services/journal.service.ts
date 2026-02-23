import { supabase } from '@/integrations/supabase/client';
import { JournalEntry } from '@/types';
import { Tables, TablesUpdate } from '@/integrations/supabase/types';

// NOTE: The `mood_score` column exists in the DB but is not yet reflected in the
// generated Supabase types file.  We extend the row/update types here so that the
// rest of the service can remain fully typed.  Once `supabase gen types` is re-run
// after the column migration, these local extensions can be removed.
type JournalEntryRow = Tables<'journal_entries'> & { mood_score?: number | null };
type JournalEntryUpdate = TablesUpdate<'journal_entries'> & { mood_score?: number | null };

// DB row → App type converter
export const dbToJournalEntry = (row: JournalEntryRow): JournalEntry => ({
  id: row.id,
  date: row.date,
  content: row.content,
  tags: row.tags || [],
  topicIds: row.topic_ids || [],
  moodScore: row.mood_score ?? undefined,
  createdAt: new Date(row.created_at),
  updatedAt: new Date(row.updated_at),
  timestamp: new Date(row.timestamp),
});

// Fetch
export const fetchJournalEntries = async (userId: string) => {
  const { data, error } = await supabase
    .from('journal_entries')
    .select('*')
    .eq('user_id', userId)
    .order('timestamp', { ascending: false });
  if (error) throw error;
  return data || [];
};

// CRUD
export const createJournalEntry = async (userId: string, entry: Omit<JournalEntry, 'id' | 'createdAt' | 'updatedAt' | 'timestamp'>) => {
  const { data, error } = await supabase
    .from('journal_entries')
    .insert({
      user_id: userId,
      date: entry.date,
      content: entry.content,
      tags: entry.tags,
      topic_ids: entry.topicIds,
      mood_score: entry.moodScore ?? null,
    })
    .select()
    .single();
  if (error) throw error;
  return dbToJournalEntry(data);
};

export const updateJournalEntry = async (userId: string, id: string, updates: Partial<JournalEntry>) => {
  const dbUpdates: JournalEntryUpdate = {};
  if (updates.content !== undefined) dbUpdates.content = updates.content;
  if (updates.tags !== undefined) dbUpdates.tags = updates.tags;
  if (updates.topicIds !== undefined) dbUpdates.topic_ids = updates.topicIds;
  if (updates.moodScore !== undefined) dbUpdates.mood_score = updates.moodScore;

  const { error } = await supabase.from('journal_entries').update(dbUpdates as TablesUpdate<'journal_entries'>).eq('id', id).eq('user_id', userId);
  if (error) throw error;
};

export const deleteJournalEntry = async (userId: string, id: string) => {
  const { error } = await supabase.from('journal_entries').delete().eq('id', id).eq('user_id', userId);
  if (error) throw error;
};
