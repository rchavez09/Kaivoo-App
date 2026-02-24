# Data Model: Files vs Database — Architecture

**Source:** Extracted from Agent 3 System Architect spec, Section 11
**Parent:** [Agent-3-System-Architect.md](../Agent-3-System-Architect.md)

---

## 11.1 Decision Matrix

| Data Type | Storage | Reasoning |
|-----------|---------|-----------|
| **Journal entries** | Files (.md) | Human-readable, Obsidian-compatible, versionable |
| **Notes / pages** | Files (.md) | Same as journal |
| **Uploaded media** | Files (original format) | Must be real files |
| **Agent definitions** | Files (.md) | Human-editable, versionable |
| **Skill definitions** | Files (.md) | Human-editable, versionable |
| **Soul file** | File (.md) | Human-editable |
| **Conversations** | Files (.md) | Human-readable, searchable |
| **Brand guidelines** | Files (.md) | Human-editable |
| **Tasks** | SQLite | Structured (status, priority, dates, ordering) |
| **Subtasks** | SQLite | Structured (parent relationship, ordering) |
| **Routines** | SQLite | Structured (streaks, completions, schedules) |
| **Routine completions** | SQLite | Time-series data |
| **Tags index** | SQLite | Fast lookup, count aggregation |
| **File index** | SQLite | Search, filter, sort by metadata |
| **Search index** | SQLite FTS5 | Full-text search |
| **Embeddings** | SQLite-vss or ChromaDB | Semantic search vectors |
| **Widget settings** | SQLite | Structured layout config |
| **App settings** | File (JSON) | Human-editable, simple |
| **AI provider config** | File (JSON) | Contains API keys, human-editable |
| **Meetings** | SQLite | Structured (times, attendees, calendar sync) |
| **Starred items** | SQLite | Simple bookmarks |

## 11.2 SQLite Schema

```sql
-- Tasks (migrated from Supabase)
CREATE TABLE tasks (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'todo' CHECK (status IN ('backlog','todo','doing','done','archived')),
  priority TEXT DEFAULT 'none' CHECK (priority IN ('none','low','medium','high','urgent')),
  due_date TEXT,
  start_date TEXT,
  estimated_minutes INTEGER,
  actual_minutes INTEGER,
  tags TEXT DEFAULT '[]',       -- JSON array
  topic_path TEXT,              -- folder path in vault
  parent_id TEXT REFERENCES tasks(id),
  position INTEGER DEFAULT 0,
  source_link TEXT,
  recurrence TEXT,              -- JSON: { type, interval, days }
  created_at TEXT DEFAULT (datetime('now')),
  completed_at TEXT,
  archived_at TEXT
);

-- Subtasks
CREATE TABLE subtasks (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  task_id TEXT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  completed INTEGER DEFAULT 0,
  position INTEGER DEFAULT 0,
  completed_at TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Routines
CREATE TABLE routine_groups (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  name TEXT NOT NULL,
  icon TEXT,
  color TEXT,
  position INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE routines (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  name TEXT NOT NULL,
  icon TEXT,
  group_id TEXT REFERENCES routine_groups(id),
  position INTEGER DEFAULT 0,
  target_days TEXT DEFAULT '[1,2,3,4,5,6,7]',  -- JSON array
  reminder_time TEXT,
  streak INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE routine_completions (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  routine_id TEXT NOT NULL REFERENCES routines(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  completed_at TEXT DEFAULT (datetime('now')),
  notes TEXT,
  UNIQUE(routine_id, date)
);

-- Meetings
CREATE TABLE meetings (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  title TEXT NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  location TEXT,
  description TEXT,
  attendees TEXT DEFAULT '[]',   -- JSON array
  is_external INTEGER DEFAULT 0,
  source TEXT,
  external_id TEXT,
  topic_path TEXT,
  notes TEXT,
  tags TEXT DEFAULT '[]',
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- File Index (metadata for all vault files)
CREATE TABLE file_index (
  path TEXT PRIMARY KEY,          -- relative to vault root
  filename TEXT NOT NULL,
  extension TEXT,
  file_type TEXT,                 -- 'video','document','image','presentation','markdown','code','audio','archive','other'
  size_bytes INTEGER,
  tags TEXT DEFAULT '[]',         -- JSON array
  frontmatter TEXT,               -- JSON of YAML frontmatter
  content_hash TEXT,
  created_at TEXT,
  modified_at TEXT,
  extracted_text TEXT              -- for search (PDFs, PPTX, etc.)
);

-- Full-Text Search
CREATE VIRTUAL TABLE search_index USING fts5(
  path,
  filename,
  content,
  tags,
  tokenize='porter'
);

-- Tags (aggregated)
CREATE TABLE tags (
  name TEXT PRIMARY KEY,
  count INTEGER DEFAULT 1,
  color TEXT,
  last_used TEXT
);

-- Starred Items
CREATE TABLE starred (
  path TEXT PRIMARY KEY,
  starred_at TEXT DEFAULT (datetime('now'))
);

-- Widget Settings
CREATE TABLE widget_settings (
  widget_key TEXT PRIMARY KEY,
  settings TEXT NOT NULL,          -- JSON
  position INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- App Settings
CREATE TABLE app_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

-- Indexes
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_due ON tasks(due_date);
CREATE INDEX idx_tasks_created ON tasks(created_at DESC);
CREATE INDEX idx_routines_group ON routines(group_id);
CREATE INDEX idx_routine_comp_date ON routine_completions(date);
CREATE INDEX idx_routine_comp_routine ON routine_completions(routine_id);
CREATE INDEX idx_meetings_time ON meetings(start_time);
CREATE INDEX idx_file_index_type ON file_index(file_type);
CREATE INDEX idx_file_index_modified ON file_index(modified_at DESC);
```
