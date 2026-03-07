/**
 * Local Search Adapter — FTS5 full-text search (Sprint 21 P5)
 *
 * Manages the FTS5 virtual table for desktop full-text search.
 * Supports both full index rebuilds (startup) and incremental
 * updates (per-CRUD write).
 */

import type { SearchAdapter, SearchResult } from './types';
import type { TauriDatabase, SearchIndexer } from './local-types';
import { parseJSON, rethrow } from './local-types';

/** Map entity types to their navigation routes (mirrors search.service.ts) */
function getEntityPath(entityType: string, entityId: string, metadata: Record<string, unknown>): string {
  switch (entityType) {
    case 'task':
    case 'subtask':
      return '/projects';
    case 'note':
      return '/notes';
    case 'project':
      return `/projects/${entityId}`;
    case 'project_note':
      return metadata.projectId ? `/projects/${metadata.projectId as string}` : '/projects';
    case 'meeting':
      return '/calendar';
    case 'capture':
      return '/notes';
    case 'topic':
      return `/topics/${entityId}`;
    case 'topic_page':
      return metadata.topicId ? `/topics/${metadata.topicId as string}/pages/${entityId}` : '/topics';
    case 'habit':
      return '/routines';
    default:
      return '/';
  }
}

export class LocalSearchAdapter implements SearchAdapter, SearchIndexer {
  constructor(private db: TauriDatabase) {}

  /** Rebuild the FTS5 index from all source tables. Called on app startup. */
  async rebuildIndex(): Promise<void> {
    try {
      await this.db.execute('DELETE FROM search_fts');

      // Index tasks
      await this.db.execute(`
        INSERT INTO search_fts(entity_type, entity_id, title, body, metadata)
        SELECT 'task', id, title, COALESCE(description, ''), '{}'
        FROM tasks
      `);

      // Index subtasks
      await this.db.execute(`
        INSERT INTO search_fts(entity_type, entity_id, title, body, metadata)
        SELECT 'subtask', id, title, '', json_object('taskId', task_id)
        FROM subtasks
      `);

      // Index journal entries (mapped as 'note' to match web search)
      await this.db.execute(`
        INSERT INTO search_fts(entity_type, entity_id, title, body, metadata)
        SELECT 'note', id, COALESCE(label, 'Journal Entry'), content, json_object('date', date)
        FROM journal_entries
      `);

      // Index captures
      await this.db.execute(`
        INSERT INTO search_fts(entity_type, entity_id, title, body, metadata)
        SELECT 'capture', id, SUBSTR(content, 1, 100), content, '{}'
        FROM captures
      `);

      // Index topics
      await this.db.execute(`
        INSERT INTO search_fts(entity_type, entity_id, title, body, metadata)
        SELECT 'topic', id, name, COALESCE(description, ''), '{}'
        FROM topics
      `);

      // Index topic pages
      await this.db.execute(`
        INSERT INTO search_fts(entity_type, entity_id, title, body, metadata)
        SELECT 'topic_page', id, name, COALESCE(description, ''), json_object('topicId', topic_id)
        FROM topic_pages
      `);

      // Index project notes
      await this.db.execute(`
        INSERT INTO search_fts(entity_type, entity_id, title, body, metadata)
        SELECT 'project_note', id, SUBSTR(content, 1, 100), content, json_object('projectId', project_id)
        FROM project_notes
      `);

      // Index projects
      await this.db.execute(`
        INSERT INTO search_fts(entity_type, entity_id, title, body, metadata)
        SELECT 'project', id, name, COALESCE(description, ''), '{}'
        FROM projects
      `);

      // Index meetings
      await this.db.execute(`
        INSERT INTO search_fts(entity_type, entity_id, title, body, metadata)
        SELECT 'meeting', id, title, COALESCE(description, ''), '{}'
        FROM meetings
      `);

      // Index active habits
      await this.db.execute(`
        INSERT INTO search_fts(entity_type, entity_id, title, body, metadata)
        SELECT 'habit', id, name, '', '{}'
        FROM routines WHERE entity_type = 'habit' AND is_archived = 0
      `);
    } catch (e) {
      rethrow('Search', 'rebuildIndex', e);
    }
  }

  async searchAll(query: string, limit = 50): Promise<SearchResult[]> {
    const trimmed = query.trim();
    if (!trimmed) return [];

    try {
      // Escape FTS5 special chars and add prefix matching for each word
      const ftsQuery = trimmed
        .split(/\s+/)
        .map((word) => `"${word.replace(/"/g, '""')}"*`)
        .join(' ');

      const rows = await this.db.select<Array<Record<string, unknown>>>(
        `SELECT entity_type, entity_id, title,
                snippet(search_fts, 1, '**', '**', '...', 32) as preview,
                rank
         FROM search_fts
         WHERE search_fts MATCH $1
         ORDER BY rank
         LIMIT $2`,
        [ftsQuery, limit],
      );

      return rows.map((r) => {
        const entityType = r.entity_type as string;
        const entityId = r.entity_id as string;
        const metadata = parseJSON(r.metadata as string, {});
        return {
          entityType,
          entityId,
          title: r.title as string,
          preview: (r.preview as string) || '',
          rank: r.rank as number,
          metadata,
          path: getEntityPath(entityType, entityId, metadata),
        };
      });
    } catch (e) {
      rethrow('Search', 'searchAll', e);
    }
  }

  /** Upsert a single entity into the FTS5 index (delete-then-insert). */
  async upsert(entityType: string, entityId: string, title: string, body: string, metadata: string): Promise<void> {
    try {
      await this.db.execute('DELETE FROM search_fts WHERE entity_type = $1 AND entity_id = $2', [entityType, entityId]);
      await this.db.execute(
        'INSERT INTO search_fts(entity_type, entity_id, title, body, metadata) VALUES ($1,$2,$3,$4,$5)',
        [entityType, entityId, title, body, metadata],
      );
    } catch (e) {
      rethrow('Search', 'upsert', e);
    }
  }

  /** Remove a single entity from the FTS5 index. */
  async remove(entityType: string, entityId: string): Promise<void> {
    try {
      await this.db.execute('DELETE FROM search_fts WHERE entity_type = $1 AND entity_id = $2', [entityType, entityId]);
    } catch (e) {
      rethrow('Search', 'remove', e);
    }
  }
}
