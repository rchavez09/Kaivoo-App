/**
 * Local Entity Adapters — Topics, TopicPages & Tags
 */

import type {
  TopicAdapter,
  TopicPageAdapter,
  TagAdapter,
  CreateTopicInput,
  UpdateTopicInput,
  CreateTopicPageInput,
  UpdateTopicPageInput,
  CreateTagInput,
} from './types';

import type { Topic, TopicPage, Tag } from '@/types';

import type { TauriDatabase, SearchIndexer } from './local-types';
import { uuid, now, rethrow } from './local-types';

// ─── Topics ───

export class LocalTopicAdapter implements TopicAdapter {
  constructor(
    private db: TauriDatabase,
    private indexer?: SearchIndexer,
  ) {}
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
      if (this.indexer)
        try {
          await this.indexer.upsert('topic', id, input.name, input.description ?? '', '{}');
        } catch {
          /* non-fatal */
        }
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
        try {
          await this.indexer.upsert('topic', id, r.name as string, (r.description as string) ?? '', '{}');
        } catch {
          /* non-fatal */
        }
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
      if (this.indexer)
        try {
          await this.indexer.remove('topic', id);
        } catch {
          /* non-fatal */
        }
    } catch (e) {
      rethrow('Topic', 'delete', e);
    }
  }
}

// ─── Topic Pages ───

export class LocalTopicPageAdapter implements TopicPageAdapter {
  constructor(
    private db: TauriDatabase,
    private indexer?: SearchIndexer,
  ) {}
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
      if (this.indexer)
        try {
          await this.indexer.upsert(
            'topic_page',
            id,
            input.name,
            input.description ?? '',
            JSON.stringify({ topicId: input.topicId }),
          );
        } catch {
          /* non-fatal */
        }
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
        const rows = await this.db.select<Array<Record<string, unknown>>>('SELECT * FROM topic_pages WHERE id = $1', [
          id,
        ]);
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
      const rows = await this.db.select<Array<Record<string, unknown>>>('SELECT * FROM topic_pages WHERE id = $1', [
        id,
      ]);
      const r = rows[0];
      if (this.indexer && (input.name !== undefined || input.description !== undefined)) {
        try {
          await this.indexer.upsert(
            'topic_page',
            id,
            r.name as string,
            (r.description as string) ?? '',
            JSON.stringify({ topicId: r.topic_id }),
          );
        } catch {
          /* non-fatal */
        }
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
      if (this.indexer)
        try {
          await this.indexer.remove('topic_page', id);
        } catch {
          /* non-fatal */
        }
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
