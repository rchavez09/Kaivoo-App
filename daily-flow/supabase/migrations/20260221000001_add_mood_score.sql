-- Sprint 1 / C2: Add mood_score column to journal_entries for mood tracking
ALTER TABLE journal_entries ADD COLUMN IF NOT EXISTS mood_score smallint CHECK (mood_score >= 1 AND mood_score <= 5);
