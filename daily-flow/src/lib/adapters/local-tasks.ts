/**
 * Local Entity Adapters — Tasks & Subtasks
 */

import type {
  TaskAdapter,
  SubtaskAdapter,
  CreateTaskInput,
  UpdateTaskInput,
  CreateSubtaskInput,
  UpdateSubtaskInput,
} from './types';

import type { Task, Subtask } from '@/types';

import type { TauriDatabase, SearchIndexer } from './local-types';
import { uuid, now, parseJSON, rethrow } from './local-types';

// ─── Tasks ───

export class LocalTaskAdapter implements TaskAdapter {
  constructor(
    private db: TauriDatabase,
    private indexer?: SearchIndexer,
  ) {}

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
      if (this.indexer)
        try {
          await this.indexer.upsert('task', id, input.title, input.description ?? '', '{}');
        } catch {
          /* non-fatal */
        }
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
        const [r] = await this.db.select<Array<Record<string, unknown>>>(
          'SELECT title, description FROM tasks WHERE id = $1',
          [id],
        );
        if (r) await this.indexer.upsert('task', id, r.title as string, (r.description as string) ?? '', '{}');
      }
    } catch (e) {
      rethrow('Task', 'update', e);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.db.execute('DELETE FROM tasks WHERE id = $1', [id]);
      if (this.indexer)
        try {
          await this.indexer.remove('task', id);
        } catch {
          /* non-fatal */
        }
    } catch (e) {
      rethrow('Task', 'delete', e);
    }
  }
}

// ─── Subtasks ───

export class LocalSubtaskAdapter implements SubtaskAdapter {
  constructor(
    private db: TauriDatabase,
    private indexer?: SearchIndexer,
  ) {}

  async fetchAll(): Promise<Subtask[]> {
    try {
      const rows = await this.db.select<Array<Record<string, unknown>>>(
        'SELECT * FROM subtasks ORDER BY sort_order, created_at',
      );
      return rows.map((r) => ({
        id: r.id as string,
        taskId: r.task_id as string,
        title: r.title as string,
        completed: !!(r.completed as number),
        completedAt: r.completed_at ? new Date(r.completed_at as string) : undefined,
        tags: parseJSON(r.tags as string, []),
        sortOrder: (r.sort_order as number) ?? 0,
      }));
    } catch (e) {
      rethrow('Subtask', 'fetchAll', e);
    }
  }

  async create(input: CreateSubtaskInput): Promise<Subtask> {
    try {
      const id = uuid();
      // Assign sort_order as max + 1 for the task's subtasks
      const [maxRow] = await this.db.select<Array<Record<string, unknown>>>(
        'SELECT COALESCE(MAX(sort_order), -1) as max_order FROM subtasks WHERE task_id = $1',
        [input.taskId],
      );
      const sortOrder = ((maxRow?.max_order as number) ?? -1) + 1;
      await this.db.execute('INSERT INTO subtasks (id, task_id, title, sort_order) VALUES ($1, $2, $3, $4)', [
        id,
        input.taskId,
        input.title,
        sortOrder,
      ]);
      if (this.indexer)
        try {
          await this.indexer.upsert('subtask', id, input.title, '', JSON.stringify({ taskId: input.taskId }));
        } catch {
          /* non-fatal */
        }
      return { id, taskId: input.taskId, title: input.title, completed: false, tags: [], sortOrder };
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
        const [r] = await this.db.select<Array<Record<string, unknown>>>(
          'SELECT title, task_id FROM subtasks WHERE id = $1',
          [id],
        );
        if (r) await this.indexer.upsert('subtask', id, r.title as string, '', JSON.stringify({ taskId: r.task_id }));
      }
    } catch (e) {
      rethrow('Subtask', 'update', e);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.db.execute('DELETE FROM subtasks WHERE id = $1', [id]);
      if (this.indexer)
        try {
          await this.indexer.remove('subtask', id);
        } catch {
          /* non-fatal */
        }
    } catch (e) {
      rethrow('Subtask', 'delete', e);
    }
  }

  async reorder(taskId: string, subtaskIds: string[]): Promise<void> {
    try {
      for (let i = 0; i < subtaskIds.length; i++) {
        await this.db.execute('UPDATE subtasks SET sort_order = $1 WHERE id = $2 AND task_id = $3', [
          i,
          subtaskIds[i],
          taskId,
        ]);
      }
    } catch (e) {
      rethrow('Subtask', 'reorder', e);
    }
  }
}
