-- Sprint 38 P1: 3-Tier Memory Schema & Migration
-- Add tier, importance_score, last_accessed_at, access_count columns to ai_memories

-- Add new columns with defaults
ALTER TABLE ai_memories
ADD COLUMN IF NOT EXISTS tier TEXT NOT NULL DEFAULT 'episodic'
CHECK (tier IN ('core_identity', 'active_context', 'episodic'));

ALTER TABLE ai_memories
ADD COLUMN IF NOT EXISTS importance_score REAL DEFAULT 0.5
CHECK (importance_score >= 0.0 AND importance_score <= 1.0);

ALTER TABLE ai_memories
ADD COLUMN IF NOT EXISTS last_accessed_at TIMESTAMPTZ;

ALTER TABLE ai_memories
ADD COLUMN IF NOT EXISTS access_count INTEGER DEFAULT 0;

-- Create indexes for the new columns
CREATE INDEX IF NOT EXISTS idx_ai_memories_tier ON ai_memories(tier);
CREATE INDEX IF NOT EXISTS idx_ai_memories_importance ON ai_memories(importance_score);
CREATE INDEX IF NOT EXISTS idx_ai_memories_last_accessed ON ai_memories(last_accessed_at);

-- Migration logic: Classify existing memories into tiers
-- Core Identity: Preferences and goals from hatching/user_edit
UPDATE ai_memories
SET tier = 'core_identity'
WHERE (category IN ('preference', 'goal') AND source IN ('hatching', 'user_edit'))
  OR content ILIKE '%user prefers%'
  OR content ILIKE '%call%user%';

-- Active Context: Recent patterns and relationship facts
UPDATE ai_memories
SET tier = 'active_context'
WHERE tier = 'episodic' -- Only update if not already set to core_identity
  AND (
    (category = 'pattern' AND updated_at > NOW() - INTERVAL '30 days')
    OR (category = 'relationship' AND updated_at > NOW() - INTERVAL '30 days')
    OR content ILIKE '%working on%'
    OR content ILIKE '%currently%'
  );

-- All remaining memories stay as episodic (default)

-- Set initial importance scores based on category and source
UPDATE ai_memories
SET importance_score = CASE
  WHEN tier = 'core_identity' THEN 0.9
  WHEN tier = 'active_context' THEN 0.7
  WHEN source IN ('user_edit', 'explicit') THEN 0.6
  ELSE 0.5
END
WHERE importance_score = 0.5; -- Only update defaults

COMMENT ON COLUMN ai_memories.tier IS 'Memory tier: core_identity (always loaded), active_context (contextual), episodic (searched on-demand)';
COMMENT ON COLUMN ai_memories.importance_score IS 'Relevance score (0.0-1.0) for promotion/demotion decisions';
COMMENT ON COLUMN ai_memories.last_accessed_at IS 'Last time this memory was loaded into a conversation context';
COMMENT ON COLUMN ai_memories.access_count IS 'Number of times this memory has been accessed';
