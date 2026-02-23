import { supabase } from '@/integrations/supabase/client';
import { Meeting } from '@/types';
import { Tables, TablesUpdate } from '@/integrations/supabase/types';

// DB row → App type converter
export const dbToMeeting = (row: Tables<'meetings'>): Meeting => ({
  id: row.id,
  title: row.title,
  startTime: new Date(row.start_time),
  endTime: new Date(row.end_time),
  location: row.location,
  description: row.description,
  attendees: row.attendees || [],
  isExternal: row.is_external,
  source: row.source,
});

// Fetch
export const fetchMeetings = async (userId: string) => {
  const { data, error } = await supabase
    .from('meetings')
    .select('*')
    .eq('user_id', userId)
    .order('start_time', { ascending: false });
  if (error) throw error;
  return data || [];
};

// CRUD
export const createMeeting = async (userId: string, meeting: Omit<Meeting, 'id'>) => {
  const { data, error } = await supabase
    .from('meetings')
    .insert({
      user_id: userId,
      title: meeting.title,
      start_time: meeting.startTime.toISOString(),
      end_time: meeting.endTime.toISOString(),
      location: meeting.location,
      description: meeting.description,
      attendees: meeting.attendees,
      is_external: meeting.isExternal,
      source: meeting.source,
    })
    .select()
    .single();
  if (error) throw error;
  return dbToMeeting(data);
};

export const updateMeeting = async (userId: string, id: string, updates: Partial<Meeting>) => {
  const dbUpdates: TablesUpdate<'meetings'> = {};
  if (updates.title !== undefined) dbUpdates.title = updates.title;
  if (updates.startTime !== undefined) dbUpdates.start_time = updates.startTime.toISOString();
  if (updates.endTime !== undefined) dbUpdates.end_time = updates.endTime.toISOString();
  if (updates.location !== undefined) dbUpdates.location = updates.location;
  if (updates.description !== undefined) dbUpdates.description = updates.description;
  if (updates.attendees !== undefined) dbUpdates.attendees = updates.attendees;
  if (updates.isExternal !== undefined) dbUpdates.is_external = updates.isExternal;
  if (updates.source !== undefined) dbUpdates.source = updates.source;

  const { error } = await supabase.from('meetings').update(dbUpdates).eq('id', id).eq('user_id', userId);
  if (error) throw error;
};

export const deleteMeeting = async (userId: string, id: string) => {
  const { error } = await supabase.from('meetings').delete().eq('id', id).eq('user_id', userId);
  if (error) throw error;
};
