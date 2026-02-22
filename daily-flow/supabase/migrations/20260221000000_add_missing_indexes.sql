-- Sprint 1 / A5: Add missing database indexes for all primary query patterns
-- Only idx_widget_settings_user_key existed prior to this migration.

CREATE INDEX IF NOT EXISTS idx_tasks_user_created ON tasks(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_journal_user_timestamp ON journal_entries(user_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_captures_user_date ON captures(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_meetings_user_start ON meetings(user_id, start_time DESC);
CREATE INDEX IF NOT EXISTS idx_topics_user_name ON topics(user_id, name);
CREATE INDEX IF NOT EXISTS idx_topic_pages_topic ON topic_pages(topic_id);
CREATE INDEX IF NOT EXISTS idx_subtasks_task ON subtasks(task_id);
CREATE INDEX IF NOT EXISTS idx_routines_group ON routines(group_id);
CREATE INDEX IF NOT EXISTS idx_routine_completions_lookup
  ON routine_completions(user_id, routine_id, date);
