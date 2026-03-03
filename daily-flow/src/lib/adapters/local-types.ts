/**
 * Local Adapter — Shared Types & Utilities
 *
 * Database interface, helpers, and common utilities used across
 * all local adapter modules.
 */

// ─── Database type ───
// tauri-plugin-sql provides this shape at runtime
export interface TauriDatabase {
  execute(query: string, bindValues?: unknown[]): Promise<{ rowsAffected: number; lastInsertId: number }>;
  select<T = unknown[]>(query: string, bindValues?: unknown[]): Promise<T>;
  close(): Promise<void>;
}

// ─── Helpers ───

export const uuid = () => crypto.randomUUID();
export const now = () => new Date().toISOString();

/** Parse JSON strings from SQLite rows, returning fallback on null/error. */
export const parseJSON = <T>(val: string | null | undefined, fallback: T): T => {
  if (!val) return fallback;
  try {
    return JSON.parse(val);
  } catch {
    return fallback;
  }
};

// ─── Error Helpers ───

/** Re-throw with entity/method context for debuggability. */
export function rethrow(entity: string, method: string, e: unknown): never {
  const msg = e instanceof Error ? e.message : typeof e === 'string' ? e : 'Unknown error';
  throw new Error(`[${entity}.${method}] ${msg}`);
}

// ─── Search Indexer ───

/** Incremental FTS5 index updater — injected into entity adapters by LocalDataAdapter. */
export interface SearchIndexer {
  upsert(entityType: string, entityId: string, title: string, body: string, metadata: string): Promise<void>;
  remove(entityType: string, entityId: string): Promise<void>;
}
