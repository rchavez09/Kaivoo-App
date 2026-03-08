import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://qfumextzhucozitrvekv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFmdW1leHR6aHVjb3ppdHJ2ZWt2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE5NjQ3OTksImV4cCI6MjA4NzU0MDc5OX0.74RohMFcHRi7TGENUNIoktYQwSjNWZcqMKz_oULvTUc';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
