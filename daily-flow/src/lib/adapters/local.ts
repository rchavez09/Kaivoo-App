/**
 * Local Adapter — Desktop (Tauri) Runtime
 *
 * Barrel module that composes all local adapter submodules into the
 * public API consumed by AdapterProvider.
 *
 * Submodules:
 *  - local-types.ts      — TauriDatabase interface, helpers
 *  - local-schema.ts     — SQLite CREATE TABLE statements
 *  - local-entities-core — Tasks, Subtasks, Journal, Captures, Topics, TopicPages, Tags
 *  - local-entities-ext  — Routines, RoutineGroups, RoutineCompletions, Habits, HabitCompletions, Meetings, Projects, ProjectNotes
 *  - local-auth.ts       — LocalAuthAdapter (offline identity)
 *  - local-search.ts     — LocalSearchAdapter (FTS5)
 */

import type { DataAdapter, FileAdapter, FileEntry, AttachmentAdapter, AttachmentInfo } from './types';

import type { TauriDatabase } from './local-types';
import { SCHEMA_SQL } from './local-schema';

import {
  LocalTaskAdapter,
  LocalSubtaskAdapter,
  LocalJournalAdapter,
  LocalCaptureAdapter,
  LocalTopicAdapter,
  LocalTopicPageAdapter,
  LocalTagAdapter,
} from './local-entities-core';
import {
  LocalRoutineAdapter,
  LocalRoutineGroupAdapter,
  LocalRoutineCompletionAdapter,
  LocalHabitAdapter,
  LocalHabitCompletionAdapter,
  LocalMeetingAdapter,
  LocalProjectAdapter,
  LocalProjectNoteAdapter,
} from './local-entities-ext';
import { LocalSearchAdapter } from './local-search';

// Re-export public adapters for dynamic import in provider.tsx
export { LocalAuthAdapter } from './local-auth';
export { LocalSearchAdapter } from './local-search';
export { LocalAttachmentAdapter } from './local-attachments';

// ═══════════════════════════════════════════════════════
// LocalDataAdapter
// ═══════════════════════════════════════════════════════

export class LocalDataAdapter implements DataAdapter {
  readonly tasks;
  readonly subtasks;
  readonly journalEntries;
  readonly captures;
  readonly topics;
  readonly topicPages;
  readonly tags;
  readonly routines;
  readonly routineGroups;
  readonly routineCompletions;
  readonly habits;
  readonly habitCompletions;
  readonly meetings;
  readonly projects;
  readonly projectNotes;
  readonly searchAdapter: LocalSearchAdapter;

  private constructor(
    private db: TauriDatabase,
    search: LocalSearchAdapter,
  ) {
    this.searchAdapter = search;
    this.tasks = new LocalTaskAdapter(db, search);
    this.subtasks = new LocalSubtaskAdapter(db, search);
    this.journalEntries = new LocalJournalAdapter(db, search);
    this.captures = new LocalCaptureAdapter(db, search);
    this.topics = new LocalTopicAdapter(db, search);
    this.topicPages = new LocalTopicPageAdapter(db, search);
    this.tags = new LocalTagAdapter(db);
    this.routines = new LocalRoutineAdapter(db);
    this.routineGroups = new LocalRoutineGroupAdapter(db);
    this.routineCompletions = new LocalRoutineCompletionAdapter(db);
    this.habits = new LocalHabitAdapter(db, search);
    this.habitCompletions = new LocalHabitCompletionAdapter(db);
    this.meetings = new LocalMeetingAdapter(db, search);
    this.projects = new LocalProjectAdapter(db, search);
    this.projectNotes = new LocalProjectNoteAdapter(db, search);
  }

  /** Exposes the database for shared adapters (e.g., LocalSearchAdapter). */
  get database(): TauriDatabase {
    return this.db;
  }

  /** No-op — initialization is handled by the static factory. */
  async initialize(): Promise<void> {}

  /** Factory method — the only way to create a LocalDataAdapter. */
  static async create(): Promise<LocalDataAdapter> {
    const { default: Database } = await import('@tauri-apps/plugin-sql');
    const db = await Database.load('sqlite:kaivoo.db');

    // Run schema migrations
    const statements = SCHEMA_SQL.split(';')
      .map((s) => s.trim())
      .filter(Boolean);
    for (const stmt of statements) {
      try {
        await db.execute(stmt);
        // When entity_type column is first added, migrate existing habits
        if (stmt.includes('ADD COLUMN entity_type')) {
          await db.execute(
            "UPDATE routines SET entity_type = 'habit' WHERE color IS NOT NULL AND entity_type = 'routine'",
          );
        }
      } catch (e) {
        // ALTER TABLE ADD COLUMN fails if column already exists — safe to skip
        if (!stmt.toUpperCase().startsWith('ALTER')) throw e;
      }
    }

    const search = new LocalSearchAdapter(db);
    return new LocalDataAdapter(db, search);
  }

  async dispose(): Promise<void> {
    if (this.db) {
      await this.db.close();
    }
  }
}

// ═══════════════════════════════════════════════════════
// NoOpFileAdapter — stub for FileAdapter
// ═══════════════════════════════════════════════════════

export class NoOpFileAdapter implements FileAdapter {
  async readFile(): Promise<string> {
    throw new Error('File operations not available');
  }
  async writeFile(): Promise<void> {
    throw new Error('File operations not available');
  }
  async deleteFile(): Promise<void> {
    throw new Error('File operations not available');
  }
  async exists(): Promise<boolean> {
    return false;
  }
  async listDir(): Promise<FileEntry[]> {
    return [];
  }
  async watchDir(): Promise<() => void> {
    return () => {};
  }
}

// ═══════════════════════════════════════════════════════
// NoOpAttachmentAdapter — stub for AttachmentAdapter
// ═══════════════════════════════════════════════════════

export class NoOpAttachmentAdapter implements AttachmentAdapter {
  async uploadFile(): Promise<AttachmentInfo> {
    throw new Error('Attachment storage not available');
  }
  async deleteFile(): Promise<void> {
    throw new Error('Attachment storage not available');
  }
  async getFileUrl(): Promise<string> {
    throw new Error('Attachment storage not available');
  }
  async listFiles(): Promise<AttachmentInfo[]> {
    return [];
  }
}
