/**
 * Local Adapter — SQLite Schema
 *
 * The CREATE TABLE / CREATE INDEX / CREATE VIRTUAL TABLE statements
 * that initialize the local SQLite database on first launch.
 * Follows Agent 3's Data-Model-Architecture.md.
 */

export const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'todo',
  priority TEXT DEFAULT 'low',
  due_date TEXT,
  start_date TEXT,
  tags TEXT DEFAULT '[]',
  topic_ids TEXT DEFAULT '[]',
  project_id TEXT,
  source_link TEXT,
  recurrence_rule TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  completed_at TEXT
);

CREATE TABLE IF NOT EXISTS subtasks (
  id TEXT PRIMARY KEY,
  task_id TEXT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  completed INTEGER DEFAULT 0,
  completed_at TEXT,
  tags TEXT DEFAULT '[]',
  sort_order INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS journal_entries (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  tags TEXT DEFAULT '[]',
  topic_ids TEXT DEFAULT '[]',
  mood_score INTEGER,
  label TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  timestamp TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS captures (
  id TEXT PRIMARY KEY,
  content TEXT NOT NULL DEFAULT '',
  source TEXT DEFAULT 'quick',
  source_id TEXT,
  date TEXT NOT NULL,
  tags TEXT DEFAULT '[]',
  topic_ids TEXT DEFAULT '[]',
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS topics (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  parent_id TEXT REFERENCES topics(id),
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS topic_pages (
  id TEXT PRIMARY KEY,
  topic_id TEXT NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS tags (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  color TEXT
);

CREATE TABLE IF NOT EXISTS routines (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT,
  color TEXT,
  type TEXT DEFAULT 'positive',
  time_block TEXT DEFAULT 'anytime',
  schedule TEXT DEFAULT '{"type":"daily"}',
  target_count INTEGER,
  strength INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  best_streak INTEGER DEFAULT 0,
  is_archived INTEGER DEFAULT 0,
  "order" INTEGER DEFAULT 0,
  group_id TEXT REFERENCES routine_groups(id),
  entity_type TEXT DEFAULT 'routine',
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS routine_groups (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT,
  color TEXT,
  "order" INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS routine_completions (
  id TEXT PRIMARY KEY,
  routine_id TEXT NOT NULL REFERENCES routines(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  count INTEGER,
  skipped INTEGER DEFAULT 0,
  completed_at TEXT DEFAULT (datetime('now')),
  UNIQUE(routine_id, date)
);

CREATE TABLE IF NOT EXISTS meetings (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  location TEXT,
  description TEXT,
  attendees TEXT DEFAULT '[]',
  is_external INTEGER DEFAULT 0,
  source TEXT DEFAULT 'manual',
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  topic_id TEXT,
  status TEXT DEFAULT 'planning',
  color TEXT,
  icon TEXT,
  start_date TEXT,
  end_date TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS project_notes (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  content TEXT NOT NULL DEFAULT '',
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_due ON tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_subtasks_task ON subtasks(task_id);
CREATE INDEX IF NOT EXISTS idx_routines_group ON routines(group_id);
CREATE INDEX IF NOT EXISTS idx_routine_comp_date ON routine_completions(date);
CREATE INDEX IF NOT EXISTS idx_meetings_time ON meetings(start_time);
CREATE INDEX IF NOT EXISTS idx_topic_pages_topic ON topic_pages(topic_id);

CREATE TABLE IF NOT EXISTS local_session (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

CREATE VIRTUAL TABLE IF NOT EXISTS search_fts USING fts5(
  title,
  body,
  entity_type UNINDEXED,
  entity_id UNINDEXED,
  metadata UNINDEXED,
  tokenize='porter unicode61'
);

ALTER TABLE routines ADD COLUMN entity_type TEXT DEFAULT 'routine';

CREATE INDEX IF NOT EXISTS idx_routines_entity_type ON routines(entity_type);
CREATE INDEX IF NOT EXISTS idx_routine_comp_routine ON routine_completions(routine_id);

CREATE TABLE IF NOT EXISTS ai_memories (
  id TEXT PRIMARY KEY,
  content TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'fact',
  source TEXT NOT NULL DEFAULT 'extraction',
  active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS ai_conversation_summaries (
  id TEXT PRIMARY KEY,
  conversation_id TEXT NOT NULL,
  summary TEXT NOT NULL,
  key_facts TEXT DEFAULT '[]',
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_ai_memories_category ON ai_memories(category);
CREATE INDEX IF NOT EXISTS idx_ai_memories_active ON ai_memories(active);
CREATE INDEX IF NOT EXISTS idx_ai_conv_summaries_conv ON ai_conversation_summaries(conversation_id);

CREATE VIRTUAL TABLE IF NOT EXISTS ai_memories_fts USING fts5(
  content,
  category UNINDEXED,
  tokenize='porter unicode61'
);

ALTER TABLE subtasks ADD COLUMN sort_order INTEGER DEFAULT 0;

CREATE TABLE IF NOT EXISTS license (
  id TEXT PRIMARY KEY DEFAULT 'active',
  license_key TEXT NOT NULL,
  tier TEXT NOT NULL DEFAULT 'founding',
  email_hash TEXT,
  issued_at TEXT,
  activated_at TEXT DEFAULT (datetime('now')),
  payload_json TEXT
);
`;
