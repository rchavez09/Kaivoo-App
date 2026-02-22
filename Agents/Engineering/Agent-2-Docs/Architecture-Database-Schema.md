*Extracted from Agent 2 spec — February 22, 2026*

# 4. Database Schema Design

## 4.1 Entity Relationship Diagram (Text)

```
┌─────────────┐     ┌──────────────┐     ┌──────────────────┐
│   profiles   │     │    topics     │     │   topic_pages    │
│─────────────│     │──────────────│     │──────────────────│
│ id (PK)      │     │ id (PK)      │     │ id (PK)          │
│ user_id (FK) │◄────│ user_id (FK) │────►│ user_id (FK)     │
│ display_name │     │ name         │     │ topic_id (FK)    │
│ avatar_url   │     │ description  │     │ name             │
│ timezone     │     │ icon         │     │ description      │
│ locale       │     │ parent_id    │     │ content (JSONB)  │
│ theme        │     │ color        │     │ created_at       │
│ created_at   │     │ archived     │     └──────────────────┘
│ updated_at   │     │ position     │
└──────────────┘     │ created_at   │
                     └──────────────┘
                            │
              ┌─────────────┼─────────────┐
              ▼             ▼             ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│    tasks     │  │journal_entries│  │   captures   │
│──────────────│  │──────────────│  │──────────────│
│ id (PK)      │  │ id (PK)      │  │ id (PK)      │
│ user_id (FK) │  │ user_id (FK) │  │ user_id (FK) │
│ title        │  │ date         │  │ content      │
│ description  │  │ content      │  │ source       │
│ status       │  │ content_json │  │ source_id    │
│ priority     │  │ mood         │  │ date         │
│ due_date     │  │ word_count   │  │ metadata     │
│ start_date   │  │ tags (TEXT[])│  │ tags (TEXT[])│
│ estimated_min│  │ topic_ids    │  │ topic_ids    │
│ actual_min   │  │ timestamp    │  │ created_at   │
│ tags (TEXT[])│  │ created_at   │  └──────────────┘
│ topic_ids    │  │ updated_at   │
│ parent_id    │  └──────────────┘
│ position     │
│ source_link  │
│ recurrence   │
│ created_at   │
│ completed_at │
│ archived_at  │
└──────────────┘
       │
       ▼
┌──────────────┐
│   subtasks   │
│──────────────│
│ id (PK)      │
│ user_id (FK) │
│ task_id (FK) │
│ title        │
│ completed    │
│ position     │
│ completed_at │
│ created_at   │
└──────────────┘

┌──────────────┐     ┌────────────────────┐
│   meetings   │     │  routine_groups    │
│──────────────│     │────────────────────│
│ id (PK)      │     │ id (PK)            │
│ user_id (FK) │     │ user_id (FK)       │
│ title        │     │ name               │
│ start_time   │     │ icon               │
│ end_time     │     │ color              │
│ location     │     │ position           │
│ description  │     │ created_at         │
│ attendees    │     └────────────────────┘
│ is_external  │            │
│ source       │            ▼
│ external_id  │     ┌──────────────┐     ┌────────────────────┐
│ recurrence   │     │   routines   │     │routine_completions │
│ topic_ids    │     │──────────────│     │────────────────────│
│ notes (TEXT) │     │ id (PK)      │     │ id (PK)            │
│ created_at   │     │ user_id (FK) │     │ user_id (FK)       │
│ updated_at   │     │ name         │     │ routine_id (FK)    │
└──────────────┘     │ icon         │     │ date               │
                     │ position     │     │ completed_at       │
                     │ group_id (FK)│     │ notes              │
                     │ target_days  │     └────────────────────┘
                     │ reminder_time│
                     │ streak       │
                     │ created_at   │
                     └──────────────┘

┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│ ai_action_logs   │  │  ai_settings     │  │ widget_settings  │
│──────────────────│  │──────────────────│  │──────────────────│
│ id (PK)          │  │ id (PK)          │  │ id (PK)          │
│ user_id (FK)     │  │ user_id (FK, UQ) │  │ user_id (FK)     │
│ action_type      │  │ ai_enabled       │  │ widget_key       │
│ action_data      │  │ ai_model         │  │ settings (JSONB) │
│ source_input     │  │ auto_extract     │  │ created_at       │
│ approved_at      │  │ created_at       │  │ updated_at       │
│ undone_at        │  │ updated_at       │  └──────────────────┘
│ created_at       │  └──────────────────┘
└──────────────────┘

NEW TABLES:
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│  notifications   │  │  file_attachments│  │  shared_access   │
│──────────────────│  │──────────────────│  │──────────────────│
│ id (PK)          │  │ id (PK)          │  │ id (PK)          │
│ user_id (FK)     │  │ user_id (FK)     │  │ owner_id (FK)    │
│ type             │  │ entity_type      │  │ shared_with (FK) │
│ title            │  │ entity_id        │  │ entity_type      │
│ body             │  │ file_name        │  │ entity_id        │
│ action_url       │  │ file_path        │  │ permission       │
│ read_at          │  │ file_size        │  │ created_at       │
│ created_at       │  │ mime_type        │  │ expires_at       │
└──────────────────┘  │ created_at       │  └──────────────────┘
                      └──────────────────┘

┌──────────────────┐
│  search_index    │
│──────────────────│
│ id (PK)          │
│ user_id (FK)     │
│ entity_type      │  -- 'task', 'journal', 'capture', 'topic'
│ entity_id        │
│ content          │  -- Denormalized searchable text
│ search_vector    │  -- tsvector for full-text search
│ updated_at       │
└──────────────────┘
```

## 4.2 New Columns on Existing Tables

```sql
-- profiles: Add preferences
ALTER TABLE profiles ADD COLUMN timezone TEXT DEFAULT 'America/Denver';
ALTER TABLE profiles ADD COLUMN locale TEXT DEFAULT 'en-US';
ALTER TABLE profiles ADD COLUMN theme TEXT DEFAULT 'system' CHECK (theme IN ('light', 'dark', 'system'));
ALTER TABLE profiles ADD COLUMN onboarding_completed BOOLEAN DEFAULT false;

-- topics: Add organization features
ALTER TABLE topics ADD COLUMN color TEXT;
ALTER TABLE topics ADD COLUMN archived BOOLEAN DEFAULT false;
ALTER TABLE topics ADD COLUMN position INTEGER DEFAULT 0;

-- topic_pages: Add rich content
ALTER TABLE topic_pages ADD COLUMN content JSONB; -- TipTap document JSON

-- tasks: Add time tracking, recurrence, archiving
ALTER TABLE tasks ADD COLUMN estimated_minutes INTEGER;
ALTER TABLE tasks ADD COLUMN actual_minutes INTEGER;
ALTER TABLE tasks ADD COLUMN parent_id UUID REFERENCES tasks(id) ON DELETE CASCADE;
ALTER TABLE tasks ADD COLUMN position INTEGER DEFAULT 0;
ALTER TABLE tasks ADD COLUMN recurrence JSONB; -- { type: 'daily'|'weekly'|'monthly', interval: 1, days: [1,3,5] }
ALTER TABLE tasks ADD COLUMN archived_at TIMESTAMPTZ;

-- subtasks: Add ordering
ALTER TABLE subtasks ADD COLUMN position INTEGER DEFAULT 0;

-- journal_entries: Add structured content + mood
ALTER TABLE journal_entries ADD COLUMN content_json JSONB; -- TipTap document JSON
ALTER TABLE journal_entries ADD COLUMN mood TEXT CHECK (mood IN ('great', 'good', 'neutral', 'low', 'rough'));
ALTER TABLE journal_entries ADD COLUMN word_count INTEGER DEFAULT 0;

-- meetings: Add topic linking, notes, external sync
ALTER TABLE meetings ADD COLUMN external_id TEXT; -- Google/Outlook event ID
ALTER TABLE meetings ADD COLUMN recurrence JSONB;
ALTER TABLE meetings ADD COLUMN topic_ids UUID[] DEFAULT '{}';
ALTER TABLE meetings ADD COLUMN notes TEXT;
ALTER TABLE meetings ADD COLUMN updated_at TIMESTAMPTZ DEFAULT now();

-- captures: Add metadata
ALTER TABLE captures ADD COLUMN metadata JSONB; -- { url, thumbnail, title } for link captures

-- routines: Add target days, reminders, streaks
ALTER TABLE routines ADD COLUMN target_days INTEGER[] DEFAULT '{1,2,3,4,5,6,7}'; -- 1=Mon, 7=Sun
ALTER TABLE routines ADD COLUMN reminder_time TIME;
ALTER TABLE routines ADD COLUMN streak INTEGER DEFAULT 0;

-- routine_completions: Add notes
ALTER TABLE routine_completions ADD COLUMN notes TEXT;
```

## 4.3 Critical Indexes

```sql
-- Performance indexes for common queries
CREATE INDEX idx_tasks_user_status ON tasks(user_id, status);
CREATE INDEX idx_tasks_user_due ON tasks(user_id, due_date);
CREATE INDEX idx_tasks_user_created ON tasks(user_id, created_at DESC);
CREATE INDEX idx_journal_user_date ON journal_entries(user_id, date DESC);
CREATE INDEX idx_journal_user_timestamp ON journal_entries(user_id, timestamp DESC);
CREATE INDEX idx_captures_user_date ON captures(user_id, date DESC);
CREATE INDEX idx_meetings_user_time ON meetings(user_id, start_time);
CREATE INDEX idx_routines_user_group ON routines(user_id, group_id);
CREATE INDEX idx_routine_comp_user_date ON routine_completions(user_id, date);
CREATE INDEX idx_topics_user ON topics(user_id);
CREATE INDEX idx_topic_pages_topic ON topic_pages(topic_id);
CREATE INDEX idx_subtasks_task ON subtasks(task_id);
CREATE INDEX idx_notifications_user ON notifications(user_id, read_at);
CREATE INDEX idx_ai_logs_user ON ai_action_logs(user_id, created_at DESC);

-- Full-text search
CREATE INDEX idx_search_vector ON search_index USING GIN(search_vector);
CREATE INDEX idx_search_user_type ON search_index(user_id, entity_type);

-- Partial indexes for active data
CREATE INDEX idx_tasks_active ON tasks(user_id) WHERE archived_at IS NULL;
CREATE INDEX idx_topics_active ON topics(user_id) WHERE archived IS FALSE;
```
