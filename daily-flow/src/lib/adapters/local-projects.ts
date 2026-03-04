/**
 * Local Entity Adapters — Projects & ProjectNotes
 */

import type {
  ProjectAdapter,
  ProjectNoteAdapter,
  CreateProjectInput,
  UpdateProjectInput,
  CreateProjectNoteInput,
  UpdateProjectNoteInput,
} from './types';

import type { Project, ProjectNote } from '@/types';

import type { TauriDatabase, SearchIndexer } from './local-types';
import { uuid, now, rethrow } from './local-types';

// ─── Projects ───

export class LocalProjectAdapter implements ProjectAdapter {
  constructor(
    private db: TauriDatabase,
    private indexer?: SearchIndexer,
  ) {}
  async fetchAll(): Promise<Project[]> {
    try {
      const rows = await this.db.select<Array<Record<string, unknown>>>(
        'SELECT * FROM projects ORDER BY created_at DESC',
      );
      return rows.map((r) => ({
        id: r.id as string,
        name: r.name as string,
        description: (r.description as string) ?? undefined,
        topicId: (r.topic_id as string) ?? undefined,
        status: (r.status as Project['status']) || 'planning',
        color: (r.color as string) ?? undefined,
        icon: (r.icon as string) ?? undefined,
        startDate: (r.start_date as string) ?? undefined,
        endDate: (r.end_date as string) ?? undefined,
        createdAt: new Date(r.created_at as string),
        updatedAt: new Date(r.updated_at as string),
      }));
    } catch (e) {
      rethrow('Project', 'fetchAll', e);
    }
  }
  async create(input: CreateProjectInput): Promise<Project> {
    try {
      const id = uuid();
      const ts = now();
      await this.db.execute(
        'INSERT INTO projects (id, name, description, topic_id, status, color, icon, start_date, end_date, created_at, updated_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$10)',
        [
          id,
          input.name,
          input.description ?? null,
          input.topicId ?? null,
          input.status,
          input.color ?? null,
          input.icon ?? null,
          input.startDate ?? null,
          input.endDate ?? null,
          ts,
        ],
      );
      if (this.indexer)
        try {
          await this.indexer.upsert('project', id, input.name, input.description ?? '', '{}');
        } catch {
          /* non-fatal */
        }
      return { id, ...input, createdAt: new Date(ts), updatedAt: new Date(ts) };
    } catch (e) {
      rethrow('Project', 'create', e);
    }
  }
  async update(id: string, input: UpdateProjectInput): Promise<void> {
    const sets: string[] = [];
    const vals: unknown[] = [];
    let i = 1;
    const add = (c: string, v: unknown) => {
      sets.push(`${c} = $${i++}`);
      vals.push(v);
    };
    if (input.name !== undefined) add('name', input.name);
    if (input.description !== undefined) add('description', input.description);
    if (input.topicId !== undefined) add('topic_id', input.topicId);
    if (input.status !== undefined) add('status', input.status);
    if (input.color !== undefined) add('color', input.color);
    if (input.icon !== undefined) add('icon', input.icon);
    if (input.startDate !== undefined) add('start_date', input.startDate);
    if (input.endDate !== undefined) add('end_date', input.endDate);
    add('updated_at', now());
    try {
      vals.push(id);
      await this.db.execute(`UPDATE projects SET ${sets.join(', ')} WHERE id = $${i}`, vals);
      if (this.indexer && (input.name !== undefined || input.description !== undefined)) {
        const [r] = await this.db.select<Array<Record<string, unknown>>>(
          'SELECT name, description FROM projects WHERE id = $1',
          [id],
        );
        if (r) await this.indexer.upsert('project', id, r.name as string, (r.description as string) ?? '', '{}');
      }
    } catch (e) {
      rethrow('Project', 'update', e);
    }
  }
  async delete(id: string): Promise<void> {
    try {
      await this.db.execute('DELETE FROM projects WHERE id = $1', [id]);
      if (this.indexer)
        try {
          await this.indexer.remove('project', id);
        } catch {
          /* non-fatal */
        }
    } catch (e) {
      rethrow('Project', 'delete', e);
    }
  }
}

// ─── Project Notes ───

export class LocalProjectNoteAdapter implements ProjectNoteAdapter {
  constructor(
    private db: TauriDatabase,
    private indexer?: SearchIndexer,
  ) {}
  async fetchAll(): Promise<ProjectNote[]> {
    try {
      const rows = await this.db.select<Array<Record<string, unknown>>>(
        'SELECT * FROM project_notes ORDER BY created_at DESC',
      );
      return rows.map((r) => ({
        id: r.id as string,
        projectId: r.project_id as string,
        content: r.content as string,
        createdAt: new Date(r.created_at as string),
        updatedAt: new Date(r.updated_at as string),
      }));
    } catch (e) {
      rethrow('ProjectNote', 'fetchAll', e);
    }
  }
  async create(input: CreateProjectNoteInput): Promise<ProjectNote> {
    try {
      const id = uuid();
      const ts = now();
      await this.db.execute(
        'INSERT INTO project_notes (id, project_id, content, created_at, updated_at) VALUES ($1,$2,$3,$4,$4)',
        [id, input.projectId, input.content, ts],
      );
      if (this.indexer)
        try {
          await this.indexer.upsert(
            'project_note',
            id,
            input.content.substring(0, 100),
            input.content,
            JSON.stringify({ projectId: input.projectId }),
          );
        } catch {
          /* non-fatal */
        }
      return { id, ...input, createdAt: new Date(ts), updatedAt: new Date(ts) };
    } catch (e) {
      rethrow('ProjectNote', 'create', e);
    }
  }
  async update(id: string, input: UpdateProjectNoteInput): Promise<void> {
    if (input.content === undefined) return;
    try {
      await this.db.execute('UPDATE project_notes SET content = $1, updated_at = $2 WHERE id = $3', [
        input.content,
        now(),
        id,
      ]);
      if (this.indexer) {
        const [r] = await this.db.select<Array<Record<string, unknown>>>(
          'SELECT project_id FROM project_notes WHERE id = $1',
          [id],
        );
        if (r)
          await this.indexer.upsert(
            'project_note',
            id,
            input.content.substring(0, 100),
            input.content,
            JSON.stringify({ projectId: r.project_id }),
          );
      }
    } catch (e) {
      rethrow('ProjectNote', 'update', e);
    }
  }
  async delete(id: string): Promise<void> {
    try {
      await this.db.execute('DELETE FROM project_notes WHERE id = $1', [id]);
      if (this.indexer)
        try {
          await this.indexer.remove('project_note', id);
        } catch {
          /* non-fatal */
        }
    } catch (e) {
      rethrow('ProjectNote', 'delete', e);
    }
  }
}
