/**
 * LocalAdapter — Sprint 20 P7
 *
 * Implements DataAdapter, AuthAdapter, and SearchAdapter for the desktop
 * (Tauri) runtime, using tauri-plugin-sql (SQLite) for structured data.
 *
 * This is a functional stub: the schema is created, basic CRUD works,
 * but advanced features (FTS5 search, file watchers) are deferred to Sprint 21.
 *
 * The SQLite schema follows Agent 3's design in Data-Model-Architecture.md.
 */

import type {
  DataAdapter,
  AuthAdapter,
  SearchAdapter,
  FileAdapter,
  TaskAdapter,
  SubtaskAdapter,
  JournalAdapter,
  CaptureAdapter,
  TopicAdapter,
  TopicPageAdapter,
  TagAdapter,
  RoutineAdapter,
  RoutineGroupAdapter,
  RoutineCompletionAdapter,
  HabitAdapter,
  HabitCompletionAdapter,
  MeetingAdapter,
  ProjectAdapter,
  ProjectNoteAdapter,
  AuthUser,
  AuthSession,
  SearchResult,
  FileEntry,
  FileWatchEvent,
  CreateTaskInput,
  UpdateTaskInput,
  CreateSubtaskInput,
  UpdateSubtaskInput,
  CreateJournalInput,
  UpdateJournalInput,
  CreateCaptureInput,
  UpdateCaptureInput,
  CreateTopicInput,
  UpdateTopicInput,
  CreateTopicPageInput,
  UpdateTopicPageInput,
  CreateTagInput,
  CreateRoutineInput,
  UpdateRoutineInput,
  CreateRoutineGroupInput,
  UpdateRoutineGroupInput,
  CreateHabitInput,
  UpdateHabitInput,
  CreateMeetingInput,
  UpdateMeetingInput,
  CreateProjectInput,
  UpdateProjectInput,
  CreateProjectNoteInput,
  UpdateProjectNoteInput,
} from "./types";

import type {
  Task,
  Subtask,
  JournalEntry,
  Capture,
  Topic,
  TopicPage,
  Tag,
  RoutineItem,
  RoutineGroup,
  RoutineCompletion,
  Habit,
  HabitCompletion,
  Meeting,
  Project,
  ProjectNote,
} from "@/types";

// ─── Helpers ───

const uuid = () => crypto.randomUUID();
const now = () => new Date().toISOString();

// ─── SQLite Schema ───

const SCHEMA_SQL = `
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
`;

// ─── Database type ───
// tauri-plugin-sql provides this shape at runtime
interface TauriDatabase {
  execute(query: string, bindValues?: unknown[]): Promise<{ rowsAffected: number; lastInsertId: number }>;
  select<T = unknown[]>(query: string, bindValues?: unknown[]): Promise<T>;
  close(): Promise<void>;
}

// Parse JSON strings from SQLite rows
const parseJSON = <T>(val: string | null | undefined, fallback: T): T => {
  if (!val) return fallback;
  try {
    return JSON.parse(val);
  } catch {
    return fallback;
  }
};

// ═══════════════════════════════════════════════════════
// Entity Adapters
// ═══════════════════════════════════════════════════════

class LocalTaskAdapter implements TaskAdapter {
  constructor(private db: TauriDatabase) {}

  async fetchAll(): Promise<Task[]> {
    const rows = await this.db.select<Array<Record<string, unknown>>>(
      "SELECT * FROM tasks ORDER BY created_at DESC"
    );
    return rows.map((r) => ({
      id: r.id as string,
      title: r.title as string,
      description: r.description as string | undefined,
      status: (r.status as Task["status"]) || "todo",
      priority: (r.priority as Task["priority"]) || "low",
      dueDate: r.due_date as string | undefined,
      startDate: r.start_date as string | undefined,
      tags: parseJSON(r.tags as string, []),
      topicIds: parseJSON(r.topic_ids as string, []),
      projectId: r.project_id as string | undefined,
      subtasks: [],
      sourceLink: r.source_link as string | undefined,
      recurrence: parseJSON(r.recurrence_rule as string, undefined),
      createdAt: new Date(r.created_at as string),
      completedAt: r.completed_at ? new Date(r.completed_at as string) : undefined,
    }));
  }

  async create(input: CreateTaskInput): Promise<Task> {
    const id = uuid();
    const createdAt = now();
    await this.db.execute(
      `INSERT INTO tasks (id, title, description, status, priority, due_date, start_date, tags, topic_ids, project_id, source_link, recurrence_rule, created_at, completed_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
      [id, input.title, input.description ?? null, input.status, input.priority,
       input.dueDate ?? null, input.startDate ?? null, JSON.stringify(input.tags),
       JSON.stringify(input.topicIds), input.projectId ?? null, input.sourceLink ?? null,
       input.recurrence ? JSON.stringify(input.recurrence) : null, createdAt,
       input.completedAt?.toISOString() ?? null]
    );
    return {
      id, ...input, subtasks: [], createdAt: new Date(createdAt),
      tags: input.tags || [], topicIds: input.topicIds || [],
    };
  }

  async update(id: string, input: UpdateTaskInput): Promise<void> {
    const sets: string[] = [];
    const vals: unknown[] = [];
    let i = 1;
    const add = (col: string, val: unknown) => { sets.push(`${col} = $${i++}`); vals.push(val); };

    if (input.title !== undefined) add("title", input.title);
    if (input.description !== undefined) add("description", input.description);
    if (input.status !== undefined) add("status", input.status);
    if (input.priority !== undefined) add("priority", input.priority);
    if (input.dueDate !== undefined) add("due_date", input.dueDate);
    if (input.startDate !== undefined) add("start_date", input.startDate);
    if (input.tags !== undefined) add("tags", JSON.stringify(input.tags));
    if (input.topicIds !== undefined) add("topic_ids", JSON.stringify(input.topicIds));
    if (input.projectId !== undefined) add("project_id", input.projectId);
    if (input.sourceLink !== undefined) add("source_link", input.sourceLink);
    if (input.recurrence !== undefined) add("recurrence_rule", input.recurrence ? JSON.stringify(input.recurrence) : null);
    if (input.completedAt !== undefined) add("completed_at", input.completedAt?.toISOString() ?? null);

    if (sets.length === 0) return;
    vals.push(id);
    await this.db.execute(`UPDATE tasks SET ${sets.join(", ")} WHERE id = $${i}`, vals);
  }

  async delete(id: string): Promise<void> {
    await this.db.execute("DELETE FROM tasks WHERE id = $1", [id]);
  }
}

class LocalSubtaskAdapter implements SubtaskAdapter {
  constructor(private db: TauriDatabase) {}

  async fetchAll(): Promise<Subtask[]> {
    const rows = await this.db.select<Array<Record<string, unknown>>>(
      "SELECT * FROM subtasks ORDER BY created_at"
    );
    return rows.map((r) => ({
      id: r.id as string,
      taskId: r.task_id as string,
      title: r.title as string,
      completed: !!(r.completed as number),
      completedAt: r.completed_at ? new Date(r.completed_at as string) : undefined,
      tags: parseJSON(r.tags as string, []),
    }));
  }

  async create(input: CreateSubtaskInput): Promise<Subtask> {
    const id = uuid();
    await this.db.execute(
      "INSERT INTO subtasks (id, task_id, title) VALUES ($1, $2, $3)",
      [id, input.taskId, input.title]
    );
    return { id, taskId: input.taskId, title: input.title, completed: false, tags: [] };
  }

  async update(id: string, input: UpdateSubtaskInput): Promise<void> {
    const sets: string[] = [];
    const vals: unknown[] = [];
    let i = 1;
    const add = (col: string, val: unknown) => { sets.push(`${col} = $${i++}`); vals.push(val); };

    if (input.title !== undefined) add("title", input.title);
    if (input.completed !== undefined) add("completed", input.completed ? 1 : 0);
    if (input.completedAt !== undefined) add("completed_at", input.completedAt?.toISOString() ?? null);
    if (input.tags !== undefined) add("tags", JSON.stringify(input.tags));

    if (sets.length === 0) return;
    vals.push(id);
    await this.db.execute(`UPDATE subtasks SET ${sets.join(", ")} WHERE id = $${i}`, vals);
  }

  async delete(id: string): Promise<void> {
    await this.db.execute("DELETE FROM subtasks WHERE id = $1", [id]);
  }
}

// For brevity, remaining entity adapters follow the same pattern.
// They implement the full CRUD interface against SQLite.

class LocalJournalAdapter implements JournalAdapter {
  constructor(private db: TauriDatabase) {}
  async fetchAll(): Promise<JournalEntry[]> {
    const rows = await this.db.select<Array<Record<string, unknown>>>("SELECT * FROM journal_entries ORDER BY timestamp DESC");
    return rows.map((r) => ({
      id: r.id as string, date: r.date as string, content: r.content as string,
      tags: parseJSON(r.tags as string, []), topicIds: parseJSON(r.topic_ids as string, []),
      moodScore: r.mood_score as number | undefined, label: r.label as string | undefined,
      createdAt: new Date(r.created_at as string), updatedAt: new Date(r.updated_at as string),
      timestamp: new Date(r.timestamp as string),
    }));
  }
  async create(input: CreateJournalInput): Promise<JournalEntry> {
    const id = uuid(); const ts = now();
    await this.db.execute(
      "INSERT INTO journal_entries (id, date, content, tags, topic_ids, mood_score, label, created_at, updated_at, timestamp) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$8,$8)",
      [id, input.date, input.content, JSON.stringify(input.tags), JSON.stringify(input.topicIds), input.moodScore ?? null, input.label ?? null, ts]
    );
    return { id, ...input, createdAt: new Date(ts), updatedAt: new Date(ts), timestamp: new Date(ts) };
  }
  async update(id: string, input: UpdateJournalInput): Promise<void> {
    const sets: string[] = []; const vals: unknown[] = []; let i = 1;
    const add = (c: string, v: unknown) => { sets.push(`${c} = $${i++}`); vals.push(v); };
    if (input.content !== undefined) add("content", input.content);
    if (input.tags !== undefined) add("tags", JSON.stringify(input.tags));
    if (input.topicIds !== undefined) add("topic_ids", JSON.stringify(input.topicIds));
    if (input.moodScore !== undefined) add("mood_score", input.moodScore);
    if (input.label !== undefined) add("label", input.label);
    add("updated_at", now());
    vals.push(id);
    await this.db.execute(`UPDATE journal_entries SET ${sets.join(", ")} WHERE id = $${i}`, vals);
  }
  async delete(id: string): Promise<void> { await this.db.execute("DELETE FROM journal_entries WHERE id = $1", [id]); }
}

class LocalCaptureAdapter implements CaptureAdapter {
  constructor(private db: TauriDatabase) {}
  async fetchAll(): Promise<Capture[]> {
    const rows = await this.db.select<Array<Record<string, unknown>>>("SELECT * FROM captures ORDER BY created_at DESC");
    return rows.map((r) => ({
      id: r.id as string, content: r.content as string,
      source: r.source as Capture["source"], sourceId: r.source_id as string | undefined,
      date: r.date as string, tags: parseJSON(r.tags as string, []),
      topicIds: parseJSON(r.topic_ids as string, []), createdAt: new Date(r.created_at as string),
    }));
  }
  async create(input: CreateCaptureInput): Promise<Capture> {
    const id = uuid(); const ts = now();
    await this.db.execute(
      "INSERT INTO captures (id, content, source, source_id, date, tags, topic_ids, created_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)",
      [id, input.content, input.source, input.sourceId ?? null, input.date, JSON.stringify(input.tags), JSON.stringify(input.topicIds), ts]
    );
    return { id, ...input, createdAt: new Date(ts) };
  }
  async update(id: string, input: UpdateCaptureInput): Promise<void> {
    const sets: string[] = []; const vals: unknown[] = []; let i = 1;
    const add = (c: string, v: unknown) => { sets.push(`${c} = $${i++}`); vals.push(v); };
    if (input.content !== undefined) add("content", input.content);
    if (input.tags !== undefined) add("tags", JSON.stringify(input.tags));
    if (input.topicIds !== undefined) add("topic_ids", JSON.stringify(input.topicIds));
    if (sets.length === 0) return;
    vals.push(id);
    await this.db.execute(`UPDATE captures SET ${sets.join(", ")} WHERE id = $${i}`, vals);
  }
  async delete(id: string): Promise<void> { await this.db.execute("DELETE FROM captures WHERE id = $1", [id]); }
}

class LocalTopicAdapter implements TopicAdapter {
  constructor(private db: TauriDatabase) {}
  async fetchAll(): Promise<Topic[]> {
    const rows = await this.db.select<Array<Record<string, unknown>>>("SELECT * FROM topics ORDER BY created_at");
    return rows.map((r) => ({
      id: r.id as string, name: r.name as string, description: r.description as string | undefined,
      icon: r.icon as string | undefined, parentId: r.parent_id as string | undefined,
      createdAt: new Date(r.created_at as string),
    }));
  }
  async create(input: CreateTopicInput): Promise<Topic> {
    const id = uuid(); const ts = now();
    await this.db.execute(
      "INSERT INTO topics (id, name, description, icon, parent_id, created_at) VALUES ($1,$2,$3,$4,$5,$6)",
      [id, input.name, input.description ?? null, input.icon ?? null, input.parentId ?? null, ts]
    );
    return { id, ...input, createdAt: new Date(ts) };
  }
  async update(id: string, input: UpdateTopicInput): Promise<Topic> {
    const sets: string[] = []; const vals: unknown[] = []; let i = 1;
    const add = (c: string, v: unknown) => { sets.push(`${c} = $${i++}`); vals.push(v); };
    if (input.name !== undefined) add("name", input.name);
    if (input.description !== undefined) add("description", input.description);
    if (input.icon !== undefined) add("icon", input.icon);
    vals.push(id);
    await this.db.execute(`UPDATE topics SET ${sets.join(", ")} WHERE id = $${i}`, vals);
    const rows = await this.db.select<Array<Record<string, unknown>>>("SELECT * FROM topics WHERE id = $1", [id]);
    const r = rows[0];
    return { id: r.id as string, name: r.name as string, description: r.description as string | undefined, icon: r.icon as string | undefined, parentId: r.parent_id as string | undefined, createdAt: new Date(r.created_at as string) };
  }
  async delete(id: string): Promise<void> { await this.db.execute("DELETE FROM topics WHERE id = $1", [id]); }
}

class LocalTopicPageAdapter implements TopicPageAdapter {
  constructor(private db: TauriDatabase) {}
  async fetchAll(): Promise<TopicPage[]> {
    const rows = await this.db.select<Array<Record<string, unknown>>>("SELECT * FROM topic_pages ORDER BY created_at");
    return rows.map((r) => ({ id: r.id as string, topicId: r.topic_id as string, name: r.name as string, description: r.description as string | undefined, createdAt: new Date(r.created_at as string) }));
  }
  async create(input: CreateTopicPageInput): Promise<TopicPage> {
    const id = uuid(); const ts = now();
    await this.db.execute("INSERT INTO topic_pages (id, topic_id, name, description, created_at) VALUES ($1,$2,$3,$4,$5)", [id, input.topicId, input.name, input.description ?? null, ts]);
    return { id, ...input, createdAt: new Date(ts) };
  }
  async update(id: string, input: UpdateTopicPageInput): Promise<TopicPage> {
    const sets: string[] = []; const vals: unknown[] = []; let i = 1;
    const add = (c: string, v: unknown) => { sets.push(`${c} = $${i++}`); vals.push(v); };
    if (input.name !== undefined) add("name", input.name);
    if (input.description !== undefined) add("description", input.description);
    vals.push(id);
    await this.db.execute(`UPDATE topic_pages SET ${sets.join(", ")} WHERE id = $${i}`, vals);
    const rows = await this.db.select<Array<Record<string, unknown>>>("SELECT * FROM topic_pages WHERE id = $1", [id]);
    const r = rows[0];
    return { id: r.id as string, topicId: r.topic_id as string, name: r.name as string, description: r.description as string | undefined, createdAt: new Date(r.created_at as string) };
  }
  async delete(id: string): Promise<void> { await this.db.execute("DELETE FROM topic_pages WHERE id = $1", [id]); }
}

class LocalTagAdapter implements TagAdapter {
  constructor(private db: TauriDatabase) {}
  async fetchAll(): Promise<Tag[]> {
    const rows = await this.db.select<Array<Record<string, unknown>>>("SELECT * FROM tags ORDER BY name");
    return rows.map((r) => ({ id: r.id as string, name: r.name as string, color: r.color as string | undefined }));
  }
  async create(input: CreateTagInput): Promise<Tag> {
    const id = uuid();
    await this.db.execute("INSERT INTO tags (id, name, color) VALUES ($1,$2,$3)", [id, input.name.toLowerCase(), input.color ?? null]);
    return { id, name: input.name.toLowerCase(), color: input.color };
  }
}

class LocalRoutineAdapter implements RoutineAdapter {
  constructor(private db: TauriDatabase) {}
  async fetchAll(): Promise<RoutineItem[]> {
    const rows = await this.db.select<Array<Record<string, unknown>>>("SELECT * FROM routines ORDER BY \"order\"");
    return rows.map((r) => ({ id: r.id as string, name: r.name as string, icon: r.icon as string | undefined, order: r.order as number, groupId: r.group_id as string | undefined }));
  }
  async create(input: CreateRoutineInput): Promise<RoutineItem> {
    const id = uuid();
    await this.db.execute("INSERT INTO routines (id, name, icon, \"order\", group_id) VALUES ($1,$2,$3,$4,$5)", [id, input.name, input.icon ?? null, input.order ?? 0, input.groupId ?? null]);
    return { id, name: input.name, icon: input.icon, order: input.order ?? 0, groupId: input.groupId };
  }
  async update(id: string, input: UpdateRoutineInput): Promise<void> {
    const sets: string[] = []; const vals: unknown[] = []; let i = 1;
    const add = (c: string, v: unknown) => { sets.push(`${c} = $${i++}`); vals.push(v); };
    if (input.name !== undefined) add("name", input.name);
    if (input.icon !== undefined) add("icon", input.icon);
    if (input.order !== undefined) add("\"order\"", input.order);
    if (input.groupId !== undefined) add("group_id", input.groupId);
    if (sets.length === 0) return;
    vals.push(id);
    await this.db.execute(`UPDATE routines SET ${sets.join(", ")} WHERE id = $${i}`, vals);
  }
  async delete(id: string): Promise<void> { await this.db.execute("DELETE FROM routines WHERE id = $1", [id]); }
}

class LocalRoutineGroupAdapter implements RoutineGroupAdapter {
  constructor(private db: TauriDatabase) {}
  async fetchAll(): Promise<RoutineGroup[]> {
    const rows = await this.db.select<Array<Record<string, unknown>>>("SELECT * FROM routine_groups ORDER BY \"order\"");
    return rows.map((r) => ({ id: r.id as string, name: r.name as string, icon: r.icon as string | undefined, color: r.color as string | undefined, order: r.order as number, createdAt: new Date(r.created_at as string) }));
  }
  async create(input: CreateRoutineGroupInput): Promise<RoutineGroup> {
    const id = uuid(); const ts = now();
    await this.db.execute("INSERT INTO routine_groups (id, name, icon, color, \"order\", created_at) VALUES ($1,$2,$3,$4,$5,$6)", [id, input.name, input.icon ?? null, input.color ?? null, input.order ?? 0, ts]);
    return { id, name: input.name, icon: input.icon, color: input.color, order: input.order ?? 0, createdAt: new Date(ts) };
  }
  async update(id: string, input: UpdateRoutineGroupInput): Promise<void> {
    const sets: string[] = []; const vals: unknown[] = []; let i = 1;
    const add = (c: string, v: unknown) => { sets.push(`${c} = $${i++}`); vals.push(v); };
    if (input.name !== undefined) add("name", input.name);
    if (input.icon !== undefined) add("icon", input.icon);
    if (input.color !== undefined) add("color", input.color);
    if (input.order !== undefined) add("\"order\"", input.order);
    if (sets.length === 0) return;
    vals.push(id);
    await this.db.execute(`UPDATE routine_groups SET ${sets.join(", ")} WHERE id = $${i}`, vals);
  }
  async delete(id: string): Promise<void> {
    await this.db.execute("UPDATE routines SET group_id = NULL WHERE group_id = $1", [id]);
    await this.db.execute("DELETE FROM routine_groups WHERE id = $1", [id]);
  }
}

class LocalRoutineCompletionAdapter implements RoutineCompletionAdapter {
  constructor(private db: TauriDatabase) {}
  async fetchAll(): Promise<RoutineCompletion[]> {
    const cutoff = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
    const rows = await this.db.select<Array<Record<string, unknown>>>("SELECT * FROM routine_completions WHERE completed_at >= $1 ORDER BY completed_at DESC", [cutoff]);
    return rows.map((r) => ({ id: r.id as string, routineId: r.routine_id as string, date: r.date as string, completedAt: new Date(r.completed_at as string) }));
  }
  async toggle(routineId: string, date: string, isCompleted: boolean): Promise<void> {
    if (isCompleted) {
      await this.db.execute("DELETE FROM routine_completions WHERE routine_id = $1 AND date = $2", [routineId, date]);
    } else {
      await this.db.execute("INSERT INTO routine_completions (id, routine_id, date) VALUES ($1,$2,$3)", [uuid(), routineId, date]);
    }
  }
}

class LocalHabitAdapter implements HabitAdapter {
  constructor(private db: TauriDatabase) {}
  async fetchAll(): Promise<Habit[]> {
    const rows = await this.db.select<Array<Record<string, unknown>>>("SELECT * FROM routines WHERE is_archived = 0 ORDER BY \"order\"");
    return rows.map((r) => ({
      id: r.id as string, name: r.name as string, icon: (r.icon as string) || undefined,
      color: (r.color as string) || "#3B8C8C", type: ((r.type as string) || "positive") as Habit["type"],
      timeBlock: ((r.time_block as string) || "anytime") as Habit["timeBlock"],
      schedule: parseJSON(r.schedule as string, { type: "daily" as const }),
      targetCount: r.target_count as number | undefined, strength: (r.strength as number) || 0,
      currentStreak: (r.current_streak as number) || 0, bestStreak: (r.best_streak as number) || 0,
      isArchived: !!(r.is_archived as number), order: r.order as number,
      groupId: r.group_id as string | undefined, createdAt: new Date(r.created_at as string),
      updatedAt: r.updated_at ? new Date(r.updated_at as string) : new Date(r.created_at as string),
    }));
  }
  async create(input: CreateHabitInput): Promise<Habit> {
    const id = uuid(); const ts = now();
    await this.db.execute(
      `INSERT INTO routines (id, name, icon, color, type, time_block, schedule, target_count, strength, current_streak, best_streak, is_archived, "order", created_at, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,0,0,0,0,$9,$10,$10)`,
      [id, input.name, input.icon ?? null, input.color ?? "#3B8C8C", input.type ?? "positive",
       input.timeBlock ?? "anytime", JSON.stringify(input.schedule ?? { type: "daily" }),
       input.targetCount ?? null, input.order ?? 0, ts]
    );
    return {
      id, name: input.name, icon: input.icon, color: input.color ?? "#3B8C8C",
      type: input.type ?? "positive", timeBlock: input.timeBlock ?? "anytime",
      schedule: input.schedule ?? { type: "daily" }, targetCount: input.targetCount,
      strength: 0, currentStreak: 0, bestStreak: 0, isArchived: false,
      order: input.order ?? 0, groupId: undefined, createdAt: new Date(ts), updatedAt: new Date(ts),
    };
  }
  async update(id: string, input: UpdateHabitInput): Promise<void> {
    const sets: string[] = []; const vals: unknown[] = []; let i = 1;
    const add = (c: string, v: unknown) => { sets.push(`${c} = $${i++}`); vals.push(v); };
    if (input.name !== undefined) add("name", input.name);
    if (input.icon !== undefined) add("icon", input.icon);
    if (input.color !== undefined) add("color", input.color);
    if (input.type !== undefined) add("type", input.type);
    if (input.timeBlock !== undefined) add("time_block", input.timeBlock);
    if (input.schedule !== undefined) add("schedule", JSON.stringify(input.schedule));
    if (input.targetCount !== undefined) add("target_count", input.targetCount);
    if (input.strength !== undefined) add("strength", input.strength);
    if (input.currentStreak !== undefined) add("current_streak", input.currentStreak);
    if (input.bestStreak !== undefined) add("best_streak", input.bestStreak);
    if (input.isArchived !== undefined) add("is_archived", input.isArchived ? 1 : 0);
    if (input.order !== undefined) add("\"order\"", input.order);
    add("updated_at", now());
    vals.push(id);
    await this.db.execute(`UPDATE routines SET ${sets.join(", ")} WHERE id = $${i}`, vals);
  }
  async delete(id: string): Promise<void> {
    await this.db.execute("DELETE FROM routine_completions WHERE routine_id = $1", [id]);
    await this.db.execute("DELETE FROM routines WHERE id = $1", [id]);
  }
  async archive(id: string): Promise<void> {
    await this.db.execute("UPDATE routines SET is_archived = 1, updated_at = $1 WHERE id = $2", [now(), id]);
  }
  async updateStrengthAndStreak(id: string, strength: number, currentStreak: number, bestStreak: number): Promise<void> {
    await this.db.execute("UPDATE routines SET strength = $1, current_streak = $2, best_streak = $3, updated_at = $4 WHERE id = $5", [strength, currentStreak, bestStreak, now(), id]);
  }
}

class LocalHabitCompletionAdapter implements HabitCompletionAdapter {
  constructor(private db: TauriDatabase) {}
  async fetchAll(): Promise<HabitCompletion[]> {
    const cutoff = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString();
    const rows = await this.db.select<Array<Record<string, unknown>>>("SELECT * FROM routine_completions WHERE completed_at >= $1 ORDER BY completed_at DESC", [cutoff]);
    return rows.map((r) => ({
      id: r.id as string, habitId: r.routine_id as string, date: r.date as string,
      count: r.count as number | undefined, skipped: !!(r.skipped as number),
      completedAt: new Date(r.completed_at as string),
    }));
  }
  async toggle(habitId: string, date: string, isCurrentlyCompleted: boolean): Promise<void> {
    if (isCurrentlyCompleted) {
      await this.db.execute("DELETE FROM routine_completions WHERE routine_id = $1 AND date = $2", [habitId, date]);
    } else {
      await this.db.execute("INSERT INTO routine_completions (id, routine_id, date) VALUES ($1,$2,$3)", [uuid(), habitId, date]);
    }
  }
  async incrementCount(habitId: string, date: string, currentCount: number): Promise<void> {
    const rows = await this.db.select<Array<Record<string, unknown>>>("SELECT id FROM routine_completions WHERE routine_id = $1 AND date = $2", [habitId, date]);
    if (rows.length > 0) {
      await this.db.execute("UPDATE routine_completions SET count = $1 WHERE id = $2", [currentCount + 1, rows[0].id]);
    } else {
      await this.db.execute("INSERT INTO routine_completions (id, routine_id, date, count) VALUES ($1,$2,$3,1)", [uuid(), habitId, date]);
    }
  }
}

class LocalMeetingAdapter implements MeetingAdapter {
  constructor(private db: TauriDatabase) {}
  async fetchAll(): Promise<Meeting[]> {
    const rows = await this.db.select<Array<Record<string, unknown>>>("SELECT * FROM meetings ORDER BY start_time DESC");
    return rows.map((r) => ({
      id: r.id as string, title: r.title as string, startTime: new Date(r.start_time as string),
      endTime: new Date(r.end_time as string), location: r.location as string | undefined,
      description: r.description as string | undefined, attendees: parseJSON(r.attendees as string, []),
      isExternal: !!(r.is_external as number), source: r.source as Meeting["source"],
    }));
  }
  async create(input: CreateMeetingInput): Promise<Meeting> {
    const id = uuid();
    await this.db.execute(
      "INSERT INTO meetings (id, title, start_time, end_time, location, description, attendees, is_external, source) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)",
      [id, input.title, input.startTime.toISOString(), input.endTime.toISOString(), input.location ?? null, input.description ?? null, JSON.stringify(input.attendees ?? []), input.isExternal ? 1 : 0, input.source ?? "manual"]
    );
    return { id, ...input };
  }
  async update(id: string, input: UpdateMeetingInput): Promise<void> {
    const sets: string[] = []; const vals: unknown[] = []; let i = 1;
    const add = (c: string, v: unknown) => { sets.push(`${c} = $${i++}`); vals.push(v); };
    if (input.title !== undefined) add("title", input.title);
    if (input.startTime !== undefined) add("start_time", input.startTime.toISOString());
    if (input.endTime !== undefined) add("end_time", input.endTime.toISOString());
    if (input.location !== undefined) add("location", input.location);
    if (input.description !== undefined) add("description", input.description);
    if (input.attendees !== undefined) add("attendees", JSON.stringify(input.attendees));
    if (input.isExternal !== undefined) add("is_external", input.isExternal ? 1 : 0);
    if (input.source !== undefined) add("source", input.source);
    if (sets.length === 0) return;
    vals.push(id);
    await this.db.execute(`UPDATE meetings SET ${sets.join(", ")} WHERE id = $${i}`, vals);
  }
  async delete(id: string): Promise<void> { await this.db.execute("DELETE FROM meetings WHERE id = $1", [id]); }
}

class LocalProjectAdapter implements ProjectAdapter {
  constructor(private db: TauriDatabase) {}
  async fetchAll(): Promise<Project[]> {
    const rows = await this.db.select<Array<Record<string, unknown>>>("SELECT * FROM projects ORDER BY created_at DESC");
    return rows.map((r) => ({
      id: r.id as string, name: r.name as string, description: (r.description as string) ?? undefined,
      topicId: (r.topic_id as string) ?? undefined, status: (r.status as Project["status"]) || "planning",
      color: (r.color as string) ?? undefined, icon: (r.icon as string) ?? undefined,
      startDate: (r.start_date as string) ?? undefined, endDate: (r.end_date as string) ?? undefined,
      createdAt: new Date(r.created_at as string), updatedAt: new Date(r.updated_at as string),
    }));
  }
  async create(input: CreateProjectInput): Promise<Project> {
    const id = uuid(); const ts = now();
    await this.db.execute(
      "INSERT INTO projects (id, name, description, topic_id, status, color, icon, start_date, end_date, created_at, updated_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$10)",
      [id, input.name, input.description ?? null, input.topicId ?? null, input.status, input.color ?? null, input.icon ?? null, input.startDate ?? null, input.endDate ?? null, ts]
    );
    return { id, ...input, createdAt: new Date(ts), updatedAt: new Date(ts) };
  }
  async update(id: string, input: UpdateProjectInput): Promise<void> {
    const sets: string[] = []; const vals: unknown[] = []; let i = 1;
    const add = (c: string, v: unknown) => { sets.push(`${c} = $${i++}`); vals.push(v); };
    if (input.name !== undefined) add("name", input.name);
    if (input.description !== undefined) add("description", input.description);
    if (input.topicId !== undefined) add("topic_id", input.topicId);
    if (input.status !== undefined) add("status", input.status);
    if (input.color !== undefined) add("color", input.color);
    if (input.icon !== undefined) add("icon", input.icon);
    if (input.startDate !== undefined) add("start_date", input.startDate);
    if (input.endDate !== undefined) add("end_date", input.endDate);
    add("updated_at", now());
    vals.push(id);
    await this.db.execute(`UPDATE projects SET ${sets.join(", ")} WHERE id = $${i}`, vals);
  }
  async delete(id: string): Promise<void> { await this.db.execute("DELETE FROM projects WHERE id = $1", [id]); }
}

class LocalProjectNoteAdapter implements ProjectNoteAdapter {
  constructor(private db: TauriDatabase) {}
  async fetchAll(): Promise<ProjectNote[]> {
    const rows = await this.db.select<Array<Record<string, unknown>>>("SELECT * FROM project_notes ORDER BY created_at DESC");
    return rows.map((r) => ({
      id: r.id as string, projectId: r.project_id as string, content: r.content as string,
      createdAt: new Date(r.created_at as string), updatedAt: new Date(r.updated_at as string),
    }));
  }
  async create(input: CreateProjectNoteInput): Promise<ProjectNote> {
    const id = uuid(); const ts = now();
    await this.db.execute("INSERT INTO project_notes (id, project_id, content, created_at, updated_at) VALUES ($1,$2,$3,$4,$4)", [id, input.projectId, input.content, ts]);
    return { id, ...input, createdAt: new Date(ts), updatedAt: new Date(ts) };
  }
  async update(id: string, input: UpdateProjectNoteInput): Promise<void> {
    if (input.content === undefined) return;
    await this.db.execute("UPDATE project_notes SET content = $1, updated_at = $2 WHERE id = $3", [input.content, now(), id]);
  }
  async delete(id: string): Promise<void> { await this.db.execute("DELETE FROM project_notes WHERE id = $1", [id]); }
}

// ═══════════════════════════════════════════════════════
// LocalDataAdapter
// ═══════════════════════════════════════════════════════

export class LocalDataAdapter implements DataAdapter {
  readonly tasks: TaskAdapter;
  readonly subtasks: SubtaskAdapter;
  readonly journalEntries: JournalAdapter;
  readonly captures: CaptureAdapter;
  readonly topics: TopicAdapter;
  readonly topicPages: TopicPageAdapter;
  readonly tags: TagAdapter;
  readonly routines: RoutineAdapter;
  readonly routineGroups: RoutineGroupAdapter;
  readonly routineCompletions: RoutineCompletionAdapter;
  readonly habits: HabitAdapter;
  readonly habitCompletions: HabitCompletionAdapter;
  readonly meetings: MeetingAdapter;
  readonly projects: ProjectAdapter;
  readonly projectNotes: ProjectNoteAdapter;

  private constructor(private db: TauriDatabase) {
    this.tasks = new LocalTaskAdapter(db);
    this.subtasks = new LocalSubtaskAdapter(db);
    this.journalEntries = new LocalJournalAdapter(db);
    this.captures = new LocalCaptureAdapter(db);
    this.topics = new LocalTopicAdapter(db);
    this.topicPages = new LocalTopicPageAdapter(db);
    this.tags = new LocalTagAdapter(db);
    this.routines = new LocalRoutineAdapter(db);
    this.routineGroups = new LocalRoutineGroupAdapter(db);
    this.routineCompletions = new LocalRoutineCompletionAdapter(db);
    this.habits = new LocalHabitAdapter(db);
    this.habitCompletions = new LocalHabitCompletionAdapter(db);
    this.meetings = new LocalMeetingAdapter(db);
    this.projects = new LocalProjectAdapter(db);
    this.projectNotes = new LocalProjectNoteAdapter(db);
  }

  /** No-op — initialization is handled by the static factory. */
  async initialize(): Promise<void> {}

  /** Factory method — the only way to create a LocalDataAdapter. */
  static async create(): Promise<LocalDataAdapter> {
    const { default: Database } = await import("@tauri-apps/plugin-sql");
    const db = await Database.load("sqlite:kaivoo.db");

    // Run schema migrations
    const statements = SCHEMA_SQL.split(";").map((s) => s.trim()).filter(Boolean);
    for (const stmt of statements) {
      await db.execute(stmt);
    }

    return new LocalDataAdapter(db);
  }

  async dispose(): Promise<void> {
    if (this.db) {
      await this.db.close();
    }
  }
}

// ═══════════════════════════════════════════════════════
// LocalAuthAdapter — offline/no-op auth for desktop
// ═══════════════════════════════════════════════════════

const LOCAL_USER: AuthUser = { id: "local-user", email: "local@kaivoo.desktop" };

export class LocalAuthAdapter implements AuthAdapter {
  async getUser(): Promise<AuthUser> { return LOCAL_USER; }
  async getSession(): Promise<AuthSession> { return { user: LOCAL_USER, accessToken: "local" }; }
  async signInWithPassword(): Promise<AuthSession> { return { user: LOCAL_USER, accessToken: "local" }; }
  async signUp(): Promise<AuthSession> { return { user: LOCAL_USER, accessToken: "local" }; }
  async signInWithOAuth(): Promise<void> {}
  async signOut(): Promise<void> {}
  onAuthStateChange(callback: (event: string, session: AuthSession | null) => void): () => void {
    // Fire initial session immediately
    setTimeout(() => callback("INITIAL_SESSION", { user: LOCAL_USER, accessToken: "local" }), 0);
    return () => {};
  }
}

// ═══════════════════════════════════════════════════════
// LocalSearchAdapter — stub (FTS5 deferred to Sprint 21)
// ═══════════════════════════════════════════════════════

export class LocalSearchAdapter implements SearchAdapter {
  async searchAll(): Promise<SearchResult[]> {
    // TODO(Sprint 21): Implement FTS5 virtual table search
    return [];
  }
}

// ═══════════════════════════════════════════════════════
// NoOpFileAdapter — stub for FileAdapter
// ═══════════════════════════════════════════════════════

export class NoOpFileAdapter implements FileAdapter {
  async readFile(): Promise<string> { throw new Error("File operations not available"); }
  async writeFile(): Promise<void> { throw new Error("File operations not available"); }
  async deleteFile(): Promise<void> { throw new Error("File operations not available"); }
  async exists(): Promise<boolean> { return false; }
  async listDir(): Promise<FileEntry[]> { return []; }
  async watchDir(): Promise<() => void> { return () => {}; }
}
