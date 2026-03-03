/**
 * Local Entity Adapters — Core
 *
 * SQLite implementations for: Tasks, Subtasks, Journal, Captures,
 * Topics, TopicPages, Tags.
 *
 * Every db call is wrapped in try/catch with a `[Entity.method]` prefix
 * for debuggable error messages.
 */

import type {
  TaskAdapter,
  SubtaskAdapter,
  JournalAdapter,
  CaptureAdapter,
  TopicAdapter,
  TopicPageAdapter,
  TagAdapter,
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
} from './types';

import type {
  Task,
  Subtask,
  JournalEntry,
  Capture,
  Topic,
  TopicPage,
  Tag,
} from '@/types';

import type { TauriDatabase, SearchIndexer } from './local-types';
import { uuid, now, parseJSON } from './local-types';

/** Re-throw with entity/method context for debuggability. */
function rethrow(entity: string, method: string, e: unknown): never {
  throw new Error(`[${entity}.${method}] ${e instanceof Error ? e.message : String(e)}`);
}

// ─── Tasks ───

export class LocalTaskAdapter implements TaskAdapter {
  constructor(private db: TauriDatabase, private indexer?: SearchIndexer) {}

  async fetchAll(): Promise<Task[]> {
    try {
      const rows = await this.db.select<Array<Record<string, unknown>>>('SELECT * FROM tasks ORDER BY created_at DESC');
      return rows.map((r) => ({
        id: r.id as string,
        title: r.title as string,
        description: r.description as string | undefined,
        status: (r.status as Task['status']) || 'todo',
        priority: (r.priority as Task['priority']) || 'low',
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
    } catch (e) {
      rethrow('Task', 'fetchAll', e);
    }
  }

  async create(input: CreateTaskInput): Promise<Task> {
    try {
      const id = uuid();
      const createdAt = now();
      await this.db.execute(
        `INSERT INTO tasks (id, title, description, status, priority, due_date, start_date, tags, topic_ids, project_id, source_link, recurrence_rule, created_at, completed_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
        [
          id,
          input.title,
          input.description ?? null,
          input.status,
          input.priority,
          input.dueDate ?? null,
          input.startDate ?? null,
          JSON.stringify(input.tags),
          JSON.stringify(input.topicIds),
          input.projectId ?? null,
          input.sourceLink ?? null,
          input.recurrence ? JSON.stringify(input.recurrence) : null,
          createdAt,
          input.completedAt?.toISOString() ?? null,
        ],
      );
      if (this.indexer) try { await this.indexer.upsert('task', id, input.title, input.description ?? '', '{}'); } catch { /* non-fatal */ }
      return {
        id,
        ...input,
        subtasks: [],
        createdAt: new Date(createdAt),
        tags: input.tags || [],
        topicIds: input.topicIds || [],
      };
    } catch (e) {
      rethrow('Task', 'create', e);
    }
  }

  async update(id: string, input: UpdateTaskInput): Promise<void> {
    const sets: string[] = [];
    const vals: unknown[] = [];
    let i = 1;
    const add = (col: string, val: unknown) => {
      sets.push(`${col} = $${i++}`);
      vals.push(val);
    };

    if (input.title !== undefined) add('title', input.title);
    if (input.description !== undefined) add('description', input.description);
    if (input.status !== undefined) add('status', input.status);
    if (input.priority !== undefined) add('priority', input.priority);
    if (input.dueDate !== undefined) add('due_date', input.dueDate);
    if (input.startDate !== undefined) add('start_date', input.startDate);
    if (input.tags !== undefined) add('tags', JSON.stringify(input.tags));
    if (input.topicIds !== undefined) add('topic_ids', JSON.stringify(input.topicIds));
    if (input.projectId !== undefined) add('project_id', input.projectId);
    if (input.sourceLink !== undefined) add('source_link', input.sourceLink);
    if (input.recurrence !== undefined)
      add('recurrence_rule', input.recurrence ? JSON.stringify(input.recurrence) : null);
    if (input.completedAt !== undefined) add('completed_at', input.completedAt?.toISOString() ?? null);

    if (sets.length === 0) return;
    try {
      vals.push(id);
      await this.db.execute(`UPDATE tasks SET ${sets.join(', ')} WHERE id = $${i}`, vals);
      if (this.indexer && (input.title !== undefined || input.description !== undefined)) {
        const [r] = await this.db.select<Array<Record<string, unknown>>>('SELECT title, description FROM tasks WHERE id = $1', [id]);
        if (r) await this.indexer.upsert('task', id, r.title as string, (r.description as string) ?? '', '{}');
      }
    } catch (e) {
      rethrow('Task', 'update', e);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.db.execute('DELETE FROM tasks WHERE id = $1', [id]);
      if (this.indexer) try { await this.indexer.remove('task', id); } catch { /* non-fatal */ }
    } catch (e) {
      rethrow('Task', 'delete', e);
    }
  }
}

// ─── Subtasks ───

export class LocalSubtaskAdapter implements SubtaskAdapter {
  constructor(private db: TauriDatabase, private indexer?: SearchIndexer) {}

  async fetchAll(): Promise<Subtask[]> {
    try {
      const rows = await this.db.select<Array<Record<string, unknown>>>('SELECT * FROM subtasks ORDER BY created_at');
      return rows.map((r) => ({
        id: r.id as string,
        taskId: r.task_id as string,
        title: r.title as string,
        completed: !!(r.completed as number),
        completedAt: r.completed_at ? new Date(r.completed_at as string) : undefined,
        tags: parseJSON(r.tags as string, []),
      }));
    } catch (e) {
      rethrow('Subtask', 'fetchAll', e);
    }
  }

  async create(input: CreateSubtaskInput): Promise<Subtask> {
    try {
      const id = uuid();
      await this.db.execute('INSERT INTO subtasks (id, task_id, title) VALUES ($1, $2, $3)', [
        id,
        input.taskId,
        input.title,
      ]);
      if (this.indexer) try { await this.indexer.upsert('subtask', id, input.title, '', JSON.stringify({ taskId: input.taskId })); } catch { /* non-fatal */ }
      return { id, taskId: input.taskId, title: input.title, completed: false, tags: [] };
    } catch (e) {
      rethrow('Subtask', 'create', e);
    }
  }

  async update(id: string, input: UpdateSubtaskInput): Promise<void> {
    const sets: string[] = [];
    const vals: unknown[] = [];
    let i = 1;
    const add = (col: string, val: unknown) => {
      sets.push(`${col} = $${i++}`);
      vals.push(val);
    };

    if (input.title !== undefined) add('title', input.title);
    if (input.completed !== undefined) add('completed', input.completed ? 1 : 0);
    if (input.completedAt !== undefined) add('completed_at', input.completedAt?.toISOString() ?? null);
    if (input.tags !== undefined) add('tags', JSON.stringify(input.tags));

    if (sets.length === 0) return;
    try {
      vals.push(id);
      await this.db.execute(`UPDATE subtasks SET ${sets.join(', ')} WHERE id = $${i}`, vals);
      if (this.indexer && input.title !== undefined) {
        const [r] = await this.db.select<Array<Record<string, unknown>>>('SELECT title, task_id FROM subtasks WHERE id = $1', [id]);
        if (r) await this.indexer.upsert('subtask', id, r.title as string, '', JSON.stringify({ taskId: r.task_id }));
      }
    } catch (e) {
      rethrow('Subtask', 'update', e);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.db.execute('DELETE FROM subtasks WHERE id = $1', [id]);
      if (this.indexer) try { await this.indexer.remove('subtask', id); } catch { /* non-fatal */ }
    } catch (e) {
      rethrow('Subtask', 'delete', e);
    }
  }
}

// ─── Journal Entries ───

export class LocalJournalAdapter implements JournalAdapter {
  constructor(private db: TauriDatabase, private indexer?: SearchIndexer) {}
  async fetchAll(): Promise<JournalEntry[]> {
    try {
      const rows = await this.db.select<Array<Record<string, unknown>>>(
        'SELECT * FROM journal_entries ORDER BY timestamp DESC',
      );
      return rows.map((r) => ({
        id: r.id as string,
        date: r.date as string,
        content: r.content as string,
        tags: parseJSON(r.tags as string, []),
        topicIds: parseJSON(r.topic_ids as string, []),
        moodScore: r.mood_score as number | undefined,
        label: r.label as string | undefined,
        createdAt: new Date(r.created_at as string),
        updatedAt: new Date(r.updated_at as string),
        timestamp: new Date(r.timestamp as string),
      }));
    } catch (e) {
      rethrow('Journal', 'fetchAll', e);
    }
  }
  async create(input: CreateJournalInput): Promise<JournalEntry> {
    try {
      const id = uuid();
      const ts = now();
      await this.db.execute(
        'INSERT INTO journal_entries (id, date, content, tags, topic_ids, mood_score, label, created_at, updated_at, timestamp) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$8,$8)',
        [
          id,
          input.date,
          input.content,
          JSON.stringify(input.tags),
          JSON.stringify(input.topicIds),
          input.moodScore ?? null,
          input.label ?? null,
          ts,
        ],
      );
      if (this.indexer) try { await this.indexer.upsert('note', id, input.label ?? 'Journal Entry', input.content, JSON.stringify({ date: input.date })); } catch { /* non-fatal */ }
      return { id, ...input, createdAt: new Date(ts), updatedAt: new Date(ts), timestamp: new Date(ts) };
    } catch (e) {
      rethrow('Journal', 'create', e);
    }
  }
  async update(id: string, input: UpdateJournalInput): Promise<void> {
    const sets: string[] = [];
    const vals: unknown[] = [];
    let i = 1;
    const add = (c: string, v: unknown) => {
      sets.push(`${c} = $${i++}`);
      vals.push(v);
    };
    if (input.content !== undefined) add('content', input.content);
    if (input.tags !== undefined) add('tags', JSON.stringify(input.tags));
    if (input.topicIds !== undefined) add('topic_ids', JSON.stringify(input.topicIds));
    if (input.moodScore !== undefined) add('mood_score', input.moodScore);
    if (input.label !== undefined) add('label', input.label);
    add('updated_at', now());
    try {
      vals.push(id);
      await this.db.execute(`UPDATE journal_entries SET ${sets.join(', ')} WHERE id = $${i}`, vals);
      if (this.indexer && (input.content !== undefined || input.label !== undefined)) {
        const [r] = await this.db.select<Array<Record<string, unknown>>>('SELECT label, content, date FROM journal_entries WHERE id = $1', [id]);
        if (r) await this.indexer.upsert('note', id, (r.label as string) ?? 'Journal Entry', r.content as string, JSON.stringify({ date: r.date }));
      }
    } catch (e) {
      rethrow('Journal', 'update', e);
    }
  }
  async delete(id: string): Promise<void> {
    try {
      await this.db.execute('DELETE FROM journal_entries WHERE id = $1', [id]);
      if (this.indexer) try { await this.indexer.remove('note', id); } catch { /* non-fatal */ }
    } catch (e) {
      rethrow('Journal', 'delete', e);
    }
  }
}

// ─── Captures ───

export class LocalCaptureAdapter implements CaptureAdapter {
  constructor(private db: TauriDatabase, private indexer?: SearchIndexer) {}
  async fetchAll(): Promise<Capture[]> {
    try {
      const rows = await this.db.select<Array<Record<string, unknown>>>(
        'SELECT * FROM captures ORDER BY created_at DESC',
      );
      return rows.map((r) => ({
        id: r.id as string,
        content: r.content as string,
        source: r.source as Capture['source'],
        sourceId: r.source_id as string | undefined,
        date: r.date as string,
        tags: parseJSON(r.tags as string, []),
        topicIds: parseJSON(r.topic_ids as string, []),
        createdAt: new Date(r.created_at as string),
      }));
    } catch (e) {
      rethrow('Capture', 'fetchAll', e);
    }
  }
  async create(input: CreateCaptureInput): Promise<Capture> {
    try {
      const id = uuid();
      const ts = now();
      await this.db.execute(
        'INSERT INTO captures (id, content, source, source_id, date, tags, topic_ids, created_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)',
        [
          id,
          input.content,
          input.source,
          input.sourceId ?? null,
          input.date,
          JSON.stringify(input.tags),
          JSON.stringify(input.topicIds),
          ts,
        ],
      );
      if (this.indexer) try { await this.indexer.upsert('capture', id, input.content.substring(0, 100), input.content, '{}'); } catch { /* non-fatal */ }
      return { id, ...input, createdAt: new Date(ts) };
    } catch (e) {
      rethrow('Capture', 'create', e);
    }
  }
  async update(id: string, input: UpdateCaptureInput): Promise<void> {
    const sets: string[] = [];
    const vals: unknown[] = [];
    let i = 1;
    const add = (c: string, v: unknown) => {
      sets.push(`${c} = $${i++}`);
      vals.push(v);
    };
    if (input.content !== undefined) add('content', input.content);
    if (input.tags !== undefined) add('tags', JSON.stringify(input.tags));
    if (input.topicIds !== undefined) add('topic_ids', JSON.stringify(input.topicIds));
    if (sets.length === 0) return;
    try {
      vals.push(id);
      await this.db.execute(`UPDATE captures SET ${sets.join(', ')} WHERE id = $${i}`, vals);
      if (this.indexer && input.content !== undefined) {
        await this.indexer.upsert('capture', id, input.content.substring(0, 100), input.content, '{}');
      }
    } catch (e) {
      rethrow('Capture', 'update', e);
    }
  }
  async delete(id: string): Promise<void> {
    try {
      await this.db.execute('DELETE FROM captures WHERE id = $1', [id]);
      if (this.indexer) try { await this.indexer.remove('capture', id); } catch { /* non-fatal */ }
    } catch (e) {
      rethrow('Capture', 'delete', e);
    }
  }
}

// ─── Topics ───

export class LocalTopicAdapter implements TopicAdapter {
  constructor(private db: TauriDatabase, private indexer?: SearchIndexer) {}
  async fetchAll(): Promise<Topic[]> {
    try {
      const rows = await this.db.select<Array<Record<string, unknown>>>('SELECT * FROM topics ORDER BY created_at');
      return rows.map((r) => ({
        id: r.id as string,
        name: r.name as string,
        description: r.description as string | undefined,
        icon: r.icon as string | undefined,
        parentId: r.parent_id as string | undefined,
        createdAt: new Date(r.created_at as string),
      }));
    } catch (e) {
      rethrow('Topic', 'fetchAll', e);
    }
  }
  async create(input: CreateTopicInput): Promise<Topic> {
    try {
      const id = uuid();
      const ts = now();
      await this.db.execute(
        'INSERT INTO topics (id, name, description, icon, parent_id, created_at) VALUES ($1,$2,$3,$4,$5,$6)',
        [id, input.name, input.description ?? null, input.icon ?? null, input.parentId ?? null, ts],
      );
      if (this.indexer) try { await this.indexer.upsert('topic', id, input.name, input.description ?? '', '{}'); } catch { /* non-fatal */ }
      return { id, ...input, createdAt: new Date(ts) };
    } catch (e) {
      rethrow('Topic', 'create', e);
    }
  }
  async update(id: string, input: UpdateTopicInput): Promise<Topic> {
    const sets: string[] = [];
    const vals: unknown[] = [];
    let i = 1;
    const add = (c: string, v: unknown) => {
      sets.push(`${c} = $${i++}`);
      vals.push(v);
    };
    if (input.name !== undefined) add('name', input.name);
    if (input.description !== undefined) add('description', input.description);
    if (input.icon !== undefined) add('icon', input.icon);
    // P5b: guard against empty update — just re-fetch current state
    if (sets.length === 0) {
      try {
        const rows = await this.db.select<Array<Record<string, unknown>>>('SELECT * FROM topics WHERE id = $1', [id]);
        const r = rows[0];
        return {
          id: r.id as string,
          name: r.name as string,
          description: r.description as string | undefined,
          icon: r.icon as string | undefined,
          parentId: r.parent_id as string | undefined,
          createdAt: new Date(r.created_at as string),
        };
      } catch (e) {
        rethrow('Topic', 'update', e);
      }
    }
    try {
      vals.push(id);
      await this.db.execute(`UPDATE topics SET ${sets.join(', ')} WHERE id = $${i}`, vals);
      const rows = await this.db.select<Array<Record<string, unknown>>>('SELECT * FROM topics WHERE id = $1', [id]);
      const r = rows[0];
      if (this.indexer && (input.name !== undefined || input.description !== undefined)) {
        try { await this.indexer.upsert('topic', id, r.name as string, (r.description as string) ?? '', '{}'); } catch { /* non-fatal */ }
      }
      return {
        id: r.id as string,
        name: r.name as string,
        description: r.description as string | undefined,
        icon: r.icon as string | undefined,
        parentId: r.parent_id as string | undefined,
        createdAt: new Date(r.created_at as string),
      };
    } catch (e) {
      rethrow('Topic', 'update', e);
    }
  }
  async delete(id: string): Promise<void> {
    try {
      await this.db.execute('DELETE FROM topics WHERE id = $1', [id]);
      if (this.indexer) try { await this.indexer.remove('topic', id); } catch { /* non-fatal */ }
    } catch (e) {
      rethrow('Topic', 'delete', e);
    }
  }
}

// ─── Topic Pages ───

export class LocalTopicPageAdapter implements TopicPageAdapter {
  constructor(private db: TauriDatabase, private indexer?: SearchIndexer) {}
  async fetchAll(): Promise<TopicPage[]> {
    try {
      const rows = await this.db.select<Array<Record<string, unknown>>>(
        'SELECT * FROM topic_pages ORDER BY created_at',
      );
      return rows.map((r) => ({
        id: r.id as string,
        topicId: r.topic_id as string,
        name: r.name as string,
        description: r.description as string | undefined,
        createdAt: new Date(r.created_at as string),
      }));
    } catch (e) {
      rethrow('TopicPage', 'fetchAll', e);
    }
  }
  async create(input: CreateTopicPageInput): Promise<TopicPage> {
    try {
      const id = uuid();
      const ts = now();
      await this.db.execute(
        'INSERT INTO topic_pages (id, topic_id, name, description, created_at) VALUES ($1,$2,$3,$4,$5)',
        [id, input.topicId, input.name, input.description ?? null, ts],
      );
      if (this.indexer) try { await this.indexer.upsert('topic_page', id, input.name, input.description ?? '', JSON.stringify({ topicId: input.topicId })); } catch { /* non-fatal */ }
      return { id, ...input, createdAt: new Date(ts) };
    } catch (e) {
      rethrow('TopicPage', 'create', e);
    }
  }
  async update(id: string, input: UpdateTopicPageInput): Promise<TopicPage> {
    const sets: string[] = [];
    const vals: unknown[] = [];
    let i = 1;
    const add = (c: string, v: unknown) => {
      sets.push(`${c} = $${i++}`);
      vals.push(v);
    };
    if (input.name !== undefined) add('name', input.name);
    if (input.description !== undefined) add('description', input.description);
    // P5b: guard against empty update — just re-fetch current state
    if (sets.length === 0) {
      try {
        const rows = await this.db.select<Array<Record<string, unknown>>>(
          'SELECT * FROM topic_pages WHERE id = $1',
          [id],
        );
        const r = rows[0];
        return {
          id: r.id as string,
          topicId: r.topic_id as string,
          name: r.name as string,
          description: r.description as string | undefined,
          createdAt: new Date(r.created_at as string),
        };
      } catch (e) {
        rethrow('TopicPage', 'update', e);
      }
    }
    try {
      vals.push(id);
      await this.db.execute(`UPDATE topic_pages SET ${sets.join(', ')} WHERE id = $${i}`, vals);
      const rows = await this.db.select<Array<Record<string, unknown>>>(
        'SELECT * FROM topic_pages WHERE id = $1',
        [id],
      );
      const r = rows[0];
      if (this.indexer && (input.name !== undefined || input.description !== undefined)) {
        try { await this.indexer.upsert('topic_page', id, r.name as string, (r.description as string) ?? '', JSON.stringify({ topicId: r.topic_id })); } catch { /* non-fatal */ }
      }
      return {
        id: r.id as string,
        topicId: r.topic_id as string,
        name: r.name as string,
        description: r.description as string | undefined,
        createdAt: new Date(r.created_at as string),
      };
    } catch (e) {
      rethrow('TopicPage', 'update', e);
    }
  }
  async delete(id: string): Promise<void> {
    try {
      await this.db.execute('DELETE FROM topic_pages WHERE id = $1', [id]);
      if (this.indexer) try { await this.indexer.remove('topic_page', id); } catch { /* non-fatal */ }
    } catch (e) {
      rethrow('TopicPage', 'delete', e);
    }
  }
}

// ─── Tags ───

export class LocalTagAdapter implements TagAdapter {
  constructor(private db: TauriDatabase) {}
  async fetchAll(): Promise<Tag[]> {
    try {
      const rows = await this.db.select<Array<Record<string, unknown>>>('SELECT * FROM tags ORDER BY name');
      return rows.map((r) => ({ id: r.id as string, name: r.name as string, color: r.color as string | undefined }));
    } catch (e) {
      rethrow('Tag', 'fetchAll', e);
    }
  }
  async create(input: CreateTagInput): Promise<Tag> {
    try {
      const id = uuid();
      await this.db.execute('INSERT INTO tags (id, name, color) VALUES ($1,$2,$3)', [
        id,
        input.name.toLowerCase(),
        input.color ?? null,
      ]);
      return { id, name: input.name.toLowerCase(), color: input.color };
    } catch (e) {
      rethrow('Tag', 'create', e);
    }
  }
}
