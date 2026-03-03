/**
 * AI Memory Service — Sprint 24 P4/P5
 *
 * CRUD for ai_memories and ai_conversation_summaries.
 * Desktop (Tauri): SQLite via tauri-plugin-sql.
 * Web: localStorage with JSON serialization.
 *
 * Uses FTS5 on desktop for dedup/search. On web, uses simple
 * substring matching against the in-memory array.
 */

import type { AIMemory, AIConversationSummary, MemoryCategory, MemorySource } from './types';

const MEMORIES_KEY = 'kaivoo-ai-memories';
const SUMMARIES_KEY = 'kaivoo-ai-summaries';

const isTauri = (): boolean =>
  typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;

// ─── In-memory cache (loaded once, kept in sync) ───

let memoriesCache: AIMemory[] | null = null;
let summariesCache: AIConversationSummary[] | null = null;

// ─── localStorage helpers ───

function loadFromStorage<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T[]) : [];
  } catch {
    return [];
  }
}

function saveToStorage<T>(key: string, data: T[]): void {
  localStorage.setItem(key, JSON.stringify(data));
}

// ─── SQLite helpers (desktop only) ───

async function getDb() {
  const { default: Database } = await import('@tauri-apps/plugin-sql');
  return Database.load('sqlite:kaivoo.db');
}

// ─── Memories CRUD ───

export async function getMemories(activeOnly = true): Promise<AIMemory[]> {
  if (memoriesCache) {
    return activeOnly ? memoriesCache.filter((m) => m.active) : memoriesCache;
  }

  if (isTauri()) {
    const db = await getDb();
    const rows = await db.select<Array<Record<string, unknown>>>(
      activeOnly
        ? 'SELECT * FROM ai_memories WHERE active = 1 ORDER BY updated_at DESC'
        : 'SELECT * FROM ai_memories ORDER BY updated_at DESC',
    );
    memoriesCache = rows.map(rowToMemory);
  } else {
    memoriesCache = loadFromStorage<AIMemory>(MEMORIES_KEY);
  }

  return activeOnly ? memoriesCache.filter((m) => m.active) : memoriesCache;
}

export async function addMemory(
  content: string,
  category: MemoryCategory,
  source: MemorySource,
): Promise<AIMemory> {
  const memory: AIMemory = {
    id: crypto.randomUUID(),
    content,
    category,
    source,
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  if (isTauri()) {
    const db = await getDb();
    await db.execute(
      `INSERT INTO ai_memories (id, content, category, source, active, created_at, updated_at)
       VALUES ($1, $2, $3, $4, 1, $5, $6)`,
      [memory.id, memory.content, memory.category, memory.source, memory.createdAt, memory.updatedAt],
    );
    // Update FTS index
    await db.execute(
      `INSERT INTO ai_memories_fts (rowid, content, category)
       SELECT rowid, content, category FROM ai_memories WHERE id = $1`,
      [memory.id],
    );
  }

  // Update cache + localStorage
  if (!memoriesCache) memoriesCache = [];
  memoriesCache.unshift(memory);
  if (!isTauri()) saveToStorage(MEMORIES_KEY, memoriesCache);

  return memory;
}

export async function updateMemory(id: string, content: string, category?: MemoryCategory): Promise<void> {
  const now = new Date().toISOString();

  if (isTauri()) {
    const db = await getDb();
    if (category) {
      await db.execute(
        'UPDATE ai_memories SET content = $1, category = $2, updated_at = $3 WHERE id = $4',
        [content, category, now, id],
      );
    } else {
      await db.execute(
        'UPDATE ai_memories SET content = $1, updated_at = $2 WHERE id = $3',
        [content, now, id],
      );
    }
    // Rebuild FTS for this row
    await db.execute(
      `DELETE FROM ai_memories_fts WHERE rowid = (SELECT rowid FROM ai_memories WHERE id = $1)`,
      [id],
    );
    await db.execute(
      `INSERT INTO ai_memories_fts (rowid, content, category)
       SELECT rowid, content, category FROM ai_memories WHERE id = $1`,
      [id],
    );
  }

  if (memoriesCache) {
    const idx = memoriesCache.findIndex((m) => m.id === id);
    if (idx >= 0) {
      memoriesCache[idx] = { ...memoriesCache[idx], content, ...(category && { category }), updatedAt: now };
    }
    if (!isTauri()) saveToStorage(MEMORIES_KEY, memoriesCache);
  }
}

export async function deleteMemory(id: string): Promise<void> {
  if (isTauri()) {
    const db = await getDb();
    await db.execute(
      `DELETE FROM ai_memories_fts WHERE rowid = (SELECT rowid FROM ai_memories WHERE id = $1)`,
      [id],
    );
    await db.execute('DELETE FROM ai_memories WHERE id = $1', [id]);
  }

  if (memoriesCache) {
    memoriesCache = memoriesCache.filter((m) => m.id !== id);
    if (!isTauri()) saveToStorage(MEMORIES_KEY, memoriesCache);
  }
}

export async function toggleMemoryActive(id: string, active: boolean): Promise<void> {
  const now = new Date().toISOString();

  if (isTauri()) {
    const db = await getDb();
    await db.execute('UPDATE ai_memories SET active = $1, updated_at = $2 WHERE id = $3', [
      active ? 1 : 0,
      now,
      id,
    ]);
  }

  if (memoriesCache) {
    const idx = memoriesCache.findIndex((m) => m.id === id);
    if (idx >= 0) {
      memoriesCache[idx] = { ...memoriesCache[idx], active, updatedAt: now };
    }
    if (!isTauri()) saveToStorage(MEMORIES_KEY, memoriesCache);
  }
}

/** Search memories by content. Desktop: FTS5. Web: substring match. */
export async function searchMemories(query: string): Promise<AIMemory[]> {
  if (isTauri()) {
    const db = await getDb();
    const rows = await db.select<Array<Record<string, unknown>>>(
      `SELECT m.* FROM ai_memories m
       JOIN ai_memories_fts fts ON fts.rowid = m.rowid
       WHERE ai_memories_fts MATCH $1 AND m.active = 1
       ORDER BY rank`,
      [query],
    );
    return rows.map(rowToMemory);
  }

  const all = await getMemories(true);
  const lower = query.toLowerCase();
  return all.filter((m) => m.content.toLowerCase().includes(lower));
}

// ─── Conversation Summaries CRUD ───

export async function getSummaries(limit = 5): Promise<AIConversationSummary[]> {
  if (summariesCache) {
    return summariesCache.slice(0, limit);
  }

  if (isTauri()) {
    const db = await getDb();
    const rows = await db.select<Array<Record<string, unknown>>>(
      'SELECT * FROM ai_conversation_summaries ORDER BY created_at DESC LIMIT $1',
      [limit],
    );
    summariesCache = rows.map(rowToSummary);
  } else {
    summariesCache = loadFromStorage<AIConversationSummary>(SUMMARIES_KEY);
  }

  return summariesCache.slice(0, limit);
}

export async function addSummary(
  conversationId: string,
  summary: string,
  keyFacts: string[],
): Promise<AIConversationSummary> {
  const entry: AIConversationSummary = {
    id: crypto.randomUUID(),
    conversationId,
    summary,
    keyFacts,
    createdAt: new Date().toISOString(),
  };

  if (isTauri()) {
    const db = await getDb();
    await db.execute(
      `INSERT INTO ai_conversation_summaries (id, conversation_id, summary, key_facts, created_at)
       VALUES ($1, $2, $3, $4, $5)`,
      [entry.id, entry.conversationId, entry.summary, JSON.stringify(entry.keyFacts), entry.createdAt],
    );
  }

  if (!summariesCache) summariesCache = [];
  summariesCache.unshift(entry);
  // Keep max 50 summaries
  if (summariesCache.length > 50) summariesCache = summariesCache.slice(0, 50);
  if (!isTauri()) saveToStorage(SUMMARIES_KEY, summariesCache);

  return entry;
}

// ─── Row Mappers ───

function rowToMemory(row: Record<string, unknown>): AIMemory {
  return {
    id: row.id as string,
    content: row.content as string,
    category: row.category as AIMemory['category'],
    source: row.source as AIMemory['source'],
    active: row.active === 1 || row.active === true,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

function rowToSummary(row: Record<string, unknown>): AIConversationSummary {
  let keyFacts: string[] = [];
  try {
    keyFacts = typeof row.key_facts === 'string' ? JSON.parse(row.key_facts) : (row.key_facts as string[]) ?? [];
  } catch {
    // Ignore parse errors
  }
  return {
    id: row.id as string,
    conversationId: row.conversation_id as string,
    summary: row.summary as string,
    keyFacts,
    createdAt: row.created_at as string,
  };
}

/** Reset in-memory caches (useful for testing or after bulk operations). */
export function resetMemoryCache(): void {
  memoriesCache = null;
  summariesCache = null;
}
