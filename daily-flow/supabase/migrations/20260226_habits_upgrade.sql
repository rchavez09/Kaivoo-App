-- Sprint 17: Upgrade routines → habits
-- Extends existing tables with habit-specific columns (non-breaking)

-- Add habit-specific columns to routines table
ALTER TABLE routines ADD COLUMN IF NOT EXISTS type text NOT NULL DEFAULT 'positive';
ALTER TABLE routines ADD COLUMN IF NOT EXISTS time_block text NOT NULL DEFAULT 'anytime';
ALTER TABLE routines ADD COLUMN IF NOT EXISTS color text DEFAULT '#3B8C8C';
ALTER TABLE routines ADD COLUMN IF NOT EXISTS schedule jsonb DEFAULT '{"type": "daily"}'::jsonb;
ALTER TABLE routines ADD COLUMN IF NOT EXISTS target_count integer;
ALTER TABLE routines ADD COLUMN IF NOT EXISTS strength real NOT NULL DEFAULT 0;
ALTER TABLE routines ADD COLUMN IF NOT EXISTS current_streak integer NOT NULL DEFAULT 0;
ALTER TABLE routines ADD COLUMN IF NOT EXISTS best_streak integer NOT NULL DEFAULT 0;
ALTER TABLE routines ADD COLUMN IF NOT EXISTS is_archived boolean NOT NULL DEFAULT false;
ALTER TABLE routines ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Add columns to routine_completions
ALTER TABLE routine_completions ADD COLUMN IF NOT EXISTS count integer;
ALTER TABLE routine_completions ADD COLUMN IF NOT EXISTS skipped boolean NOT NULL DEFAULT false;

-- Migrate routine_groups data: map group names to time_block
UPDATE routines r SET time_block =
  CASE
    WHEN rg.name ILIKE '%morning%' THEN 'morning'
    WHEN rg.name ILIKE '%afternoon%' THEN 'afternoon'
    WHEN rg.name ILIKE '%evening%' OR rg.name ILIKE '%night%' THEN 'evening'
    ELSE 'anytime'
  END
FROM routine_groups rg
WHERE r.group_id = rg.id;

-- Copy color from routine_groups to routines where applicable
UPDATE routines r SET color = rg.color
FROM routine_groups rg
WHERE r.group_id = rg.id AND rg.color IS NOT NULL;

-- Add constraint for valid habit types
ALTER TABLE routines ADD CONSTRAINT routines_type_check
  CHECK (type IN ('positive', 'negative', 'multi-count'));

-- Add constraint for valid time blocks
ALTER TABLE routines ADD CONSTRAINT routines_time_block_check
  CHECK (time_block IN ('morning', 'afternoon', 'evening', 'anytime'));

-- Add index for common queries
CREATE INDEX IF NOT EXISTS idx_routines_time_block ON routines(user_id, time_block) WHERE NOT is_archived;
CREATE INDEX IF NOT EXISTS idx_routine_completions_date ON routine_completions(user_id, date);
