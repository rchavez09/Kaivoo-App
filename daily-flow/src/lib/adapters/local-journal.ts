/**
 * Local Entity Adapters — Journal & Captures
 */

import type {
  JournalAdapter,
  CaptureAdapter,
  CreateJournalInput,
  UpdateJournalInput,
  CreateCaptureInput,
  UpdateCaptureInput,
} from './types';

import type { JournalEntry, Capture } from '@/types';

import type { TauriDatabase, SearchIndexer } from './local-types';
import { uuid, now, parseJSON, rethrow } from './local-types';

// ─── Journal Entries ───

export class LocalJournalAdapter implements JournalAdapter {
  constructor(
    private db: TauriDatabase,
    private indexer?: SearchIndexer,
  ) {}
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
      if (this.indexer)
        try {
          await this.indexer.upsert(
            'note',
            id,
            input.label ?? 'Journal Entry',
            input.content,
            JSON.stringify({ date: input.date }),
          );
        } catch {
          /* non-fatal */
        }
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
        const [r] = await this.db.select<Array<Record<string, unknown>>>(
          'SELECT label, content, date FROM journal_entries WHERE id = $1',
          [id],
        );
        if (r)
          await this.indexer.upsert(
            'note',
            id,
            (r.label as string) ?? 'Journal Entry',
            r.content as string,
            JSON.stringify({ date: r.date }),
          );
      }
    } catch (e) {
      rethrow('Journal', 'update', e);
    }
  }
  async delete(id: string): Promise<void> {
    try {
      await this.db.execute('DELETE FROM journal_entries WHERE id = $1', [id]);
      if (this.indexer)
        try {
          await this.indexer.remove('note', id);
        } catch {
          /* non-fatal */
        }
    } catch (e) {
      rethrow('Journal', 'delete', e);
    }
  }
}

// ─── Captures ───

export class LocalCaptureAdapter implements CaptureAdapter {
  constructor(
    private db: TauriDatabase,
    private indexer?: SearchIndexer,
  ) {}
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
      if (this.indexer)
        try {
          await this.indexer.upsert('capture', id, input.content.substring(0, 100), input.content, '{}');
        } catch {
          /* non-fatal */
        }
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
      if (this.indexer)
        try {
          await this.indexer.remove('capture', id);
        } catch {
          /* non-fatal */
        }
    } catch (e) {
      rethrow('Capture', 'delete', e);
    }
  }
}
