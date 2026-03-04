/**
 * Local Entity Adapters — Meetings
 */

import type {
  MeetingAdapter,
  CreateMeetingInput,
  UpdateMeetingInput,
} from './types';

import type { Meeting } from '@/types';

import type { TauriDatabase, SearchIndexer } from './local-types';
import { uuid, parseJSON, rethrow } from './local-types';

// ─── Meetings ───

export class LocalMeetingAdapter implements MeetingAdapter {
  constructor(
    private db: TauriDatabase,
    private indexer?: SearchIndexer,
  ) {}
  async fetchAll(): Promise<Meeting[]> {
    try {
      const rows = await this.db.select<Array<Record<string, unknown>>>(
        'SELECT * FROM meetings ORDER BY start_time DESC',
      );
      return rows.map((r) => ({
        id: r.id as string,
        title: r.title as string,
        startTime: new Date(r.start_time as string),
        endTime: new Date(r.end_time as string),
        location: r.location as string | undefined,
        description: r.description as string | undefined,
        attendees: parseJSON(r.attendees as string, []),
        isExternal: !!(r.is_external as number),
        source: r.source as Meeting['source'],
      }));
    } catch (e) {
      rethrow('Meeting', 'fetchAll', e);
    }
  }
  async create(input: CreateMeetingInput): Promise<Meeting> {
    try {
      const id = uuid();
      await this.db.execute(
        'INSERT INTO meetings (id, title, start_time, end_time, location, description, attendees, is_external, source) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)',
        [
          id,
          input.title,
          input.startTime.toISOString(),
          input.endTime.toISOString(),
          input.location ?? null,
          input.description ?? null,
          JSON.stringify(input.attendees ?? []),
          input.isExternal ? 1 : 0,
          input.source ?? 'manual',
        ],
      );
      if (this.indexer)
        try {
          await this.indexer.upsert('meeting', id, input.title, input.description ?? '', '{}');
        } catch {
          /* non-fatal */
        }
      return { id, ...input };
    } catch (e) {
      rethrow('Meeting', 'create', e);
    }
  }
  async update(id: string, input: UpdateMeetingInput): Promise<void> {
    const sets: string[] = [];
    const vals: unknown[] = [];
    let i = 1;
    const add = (c: string, v: unknown) => {
      sets.push(`${c} = $${i++}`);
      vals.push(v);
    };
    if (input.title !== undefined) add('title', input.title);
    if (input.startTime !== undefined) add('start_time', input.startTime.toISOString());
    if (input.endTime !== undefined) add('end_time', input.endTime.toISOString());
    if (input.location !== undefined) add('location', input.location);
    if (input.description !== undefined) add('description', input.description);
    if (input.attendees !== undefined) add('attendees', JSON.stringify(input.attendees));
    if (input.isExternal !== undefined) add('is_external', input.isExternal ? 1 : 0);
    if (input.source !== undefined) add('source', input.source);
    if (sets.length === 0) return;
    try {
      vals.push(id);
      await this.db.execute(`UPDATE meetings SET ${sets.join(', ')} WHERE id = $${i}`, vals);
      if (this.indexer && (input.title !== undefined || input.description !== undefined)) {
        const [r] = await this.db.select<Array<Record<string, unknown>>>(
          'SELECT title, description FROM meetings WHERE id = $1',
          [id],
        );
        if (r) await this.indexer.upsert('meeting', id, r.title as string, (r.description as string) ?? '', '{}');
      }
    } catch (e) {
      rethrow('Meeting', 'update', e);
    }
  }
  async delete(id: string): Promise<void> {
    try {
      await this.db.execute('DELETE FROM meetings WHERE id = $1', [id]);
      if (this.indexer)
        try {
          await this.indexer.remove('meeting', id);
        } catch {
          /* non-fatal */
        }
    } catch (e) {
      rethrow('Meeting', 'delete', e);
    }
  }
}
