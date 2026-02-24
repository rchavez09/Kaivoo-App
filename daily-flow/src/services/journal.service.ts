import { supabase } from '@/integrations/supabase/client';
import { JournalEntry } from '@/types';
import { Tables, TablesUpdate } from '@/integrations/supabase/types';

// The `mood_score` column may or may not exist in the remote DB yet (migration
// 20260221000001_add_mood_score.sql).  We type-extend so the code compiles, but
// NEVER send mood_score in insert/update payloads unless the column is confirmed
// to exist.  The dbToJournalEntry converter safely reads it (undefined if absent).
type JournalEntryRow = Tables<'journal_entries'> & { mood_score?: number | null };
type JournalEntryUpdate = TablesUpdate<'journal_entries'> & { mood_score?: number | null };

// Set to true once the mood_score migration has been applied.
// TODO: Remove this flag after running the migration and regenerating types.
const MOOD_SCORE_COLUMN_EXISTS = false;

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
  const payload: Record<string, unknown> = {
    user_id: userId,
    date: entry.date,
    content: entry.content,
    tags: entry.tags,
    topic_ids: entry.topicIds,
  };
  if (MOOD_SCORE_COLUMN_EXISTS && entry.moodScore != null) {
    payload.mood_score = entry.moodScore;
  }

  const { data, error } = await supabase
    .from('journal_entries')
    .insert(payload)
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
  if (MOOD_SCORE_COLUMN_EXISTS && updates.moodScore !== undefined) dbUpdates.mood_score = updates.moodScore;

  const { error } = await supabase.from('journal_entries').update(dbUpdates as TablesUpdate<'journal_entries'>).eq('id', id).eq('user_id', userId);
  if (error) throw error;
};

export const deleteJournalEntry = async (userId: string, id: string) => {
  const { error } = await supabase.from('journal_entries').delete().eq('id', id).eq('user_id', userId);
  if (error) throw error;
};
