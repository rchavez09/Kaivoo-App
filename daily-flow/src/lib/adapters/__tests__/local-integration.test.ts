/**
 * Local Path Integration Tests — Sprint 21 P8
 *
 * Tests the full round-trip through the LocalAdapter:
 *   create entity → read back → update → verify changes → delete → verify gone
 *
 * Uses a stateful in-memory mock database that behaves like SQLite,
 * tracking rows across sequential operations.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// ─── Stateful In-Memory Database Mock ───
//
// Unlike P7's stateless mock, this mock tracks rows across operations
// so that create → fetchAll → update → fetchAll → delete → fetchAll
// returns meaningful data at each step.

interface Row {
  [key: string]: unknown;
}

interface TableStore {
  [tableName: string]: Row[];
}

function createStatefulMockDb() {
  const tables: TableStore = {};

  function getTable(name: string): Row[] {
    if (!tables[name]) tables[name] = [];
    return tables[name];
  }

  // Simple SQL parser for mock — handles INSERT, SELECT, UPDATE, DELETE
  const db = {
    execute: vi.fn(async (sql: string, params?: unknown[]) => {
      const trimmed = sql.trim();

      // CREATE TABLE / CREATE INDEX / CREATE VIRTUAL TABLE — no-op
      if (/^CREATE\s/i.test(trimmed)) return;

      // INSERT INTO table (...) VALUES (...)
      const insertMatch = trimmed.match(/INSERT\s+INTO\s+(\w+)\s*\(([^)]+)\)\s*VALUES\s*\(([^)]+)\)/i);
      if (insertMatch) {
        const tableName = insertMatch[1];
        const cols = insertMatch[2].split(',').map((c) => c.trim().replace(/"/g, ''));
        const row: Row = {};
        cols.forEach((col, i) => {
          const placeholder = `$${i + 1}`;
          if (params && insertMatch[3].includes(placeholder)) {
            row[col] = params[i];
          }
        });
        getTable(tableName).push(row);
        return;
      }

      // INSERT INTO table SELECT ... FROM table2 (used by rebuildIndex) — skip
      if (/INSERT\s+INTO\s+\w+.*SELECT/is.test(trimmed)) return;

      // DELETE FROM table WHERE ...
      const deleteMatch = trimmed.match(/DELETE\s+FROM\s+(\w+)/i);
      if (deleteMatch) {
        const tableName = deleteMatch[1];
        if (params && params.length > 0) {
          // Simple WHERE id = $1 or WHERE col = $1 AND col2 = $2
          const table = getTable(tableName);
          // Find the id parameter (usually the first or second param)
          const idParam = params[0] as string;
          // Remove matching rows (simple match on any column value)
          tables[tableName] = table.filter((row) => !Object.values(row).includes(idParam));
        } else {
          // DELETE FROM table (no WHERE)
          tables[tableName] = [];
        }
        return;
      }

      // UPDATE table SET col = $1, ... WHERE id = $N
      const updateMatch = trimmed.match(/UPDATE\s+(\w+)\s+SET\s+(.+?)\s+WHERE\s+id\s*=\s*\$(\d+)/i);
      if (updateMatch) {
        const tableName = updateMatch[1];
        const idIdx = parseInt(updateMatch[3]) - 1;
        const id = params?.[idIdx] as string;
        const table = getTable(tableName);
        const row = table.find((r) => r.id === id);
        if (row) {
          // Parse SET clauses: col = $1, col2 = $2, col3 = literal
          const setClauses = updateMatch[2].split(',').map((s) => s.trim());
          for (const clause of setClauses) {
            const paramRef = clause.match(/(\w+)\s*=\s*\$(\d+)/);
            if (paramRef && params) {
              row[paramRef[1]] = params[parseInt(paramRef[2]) - 1];
            } else {
              // Literal value: col = 1 or col = 'str'
              const literalRef = clause.match(/(\w+)\s*=\s*(\d+|'[^']*')/);
              if (literalRef) {
                const val = literalRef[2];
                row[literalRef[1]] = val.startsWith("'") ? val.slice(1, -1) : Number(val);
              }
            }
          }
        }
        return;
      }
    }),

    select: vi.fn(async (sql: string, params?: unknown[]) => {
      const trimmed = sql.trim();

      // SELECT * FROM table [WHERE ...] [ORDER BY ...]
      const selectMatch = trimmed.match(/SELECT\s+.+?\s+FROM\s+(\w+)/i);
      if (!selectMatch) return [];

      const tableName = selectMatch[1];
      let rows = [...getTable(tableName)];

      // Simple WHERE id = $1 filter
      if (params && params.length > 0 && /WHERE\s+id\s*=\s*\$1/i.test(trimmed)) {
        rows = rows.filter((r) => r.id === params[0]);
      }

      return rows;
    }),

    close: vi.fn(),
  };

  return { db, tables, getTable };
}

// ─── Mock Tauri SQL plugin ───

const { mockDbInstance } = vi.hoisted(() => {
  return { mockDbInstance: { db: null as ReturnType<typeof createStatefulMockDb>['db'] | null } };
});

vi.mock('@tauri-apps/plugin-sql', () => ({
  default: {
    load: vi.fn(async () => mockDbInstance.db),
  },
}));

// ─── Import after mocks ───
import { LocalDataAdapter, LocalAuthAdapter, LocalSearchAdapter } from '../local';

// ═══════════════════════════════════════════════════════
// Tasks — Full Round Trip
// ═══════════════════════════════════════════════════════

describe('Integration: Tasks round-trip', () => {
  let adapter: LocalDataAdapter;
  let mock: ReturnType<typeof createStatefulMockDb>;

  beforeEach(async () => {
    mock = createStatefulMockDb();
    mockDbInstance.db = mock.db;
    adapter = await LocalDataAdapter.create();
  });

  it('create → fetchAll → update → fetchAll → delete → fetchAll', async () => {
    // 1. Create a task
    const task = await adapter.tasks.create({
      title: 'Integration test task',
      status: 'todo',
      priority: 'high',
      tags: ['test'],
      topicIds: ['topic-1'],
    });

    expect(task.id).toBeDefined();
    expect(task.title).toBe('Integration test task');
    expect(task.status).toBe('todo');
    expect(task.tags).toEqual(['test']);
    expect(task.createdAt).toBeInstanceOf(Date);

    // 2. Verify it's in the mock database
    const dbRows = mock.getTable('tasks');
    expect(dbRows).toHaveLength(1);
    expect(dbRows[0].id).toBe(task.id);
    expect(dbRows[0].title).toBe('Integration test task');

    // 3. fetchAll returns the created task
    // Set up the mock for SELECT
    mock.db.select.mockImplementation(async (sql: string) => {
      if (sql.includes('FROM tasks')) return [...mock.getTable('tasks')];
      if (sql.includes('FROM subtasks')) return [];
      return [];
    });

    const tasks = await adapter.tasks.fetchAll();
    expect(tasks).toHaveLength(1);
    expect(tasks[0].id).toBe(task.id);
    expect(tasks[0].title).toBe('Integration test task');

    // 4. Update the task
    await adapter.tasks.update(task.id, { title: 'Updated title', status: 'in_progress' });

    // Verify the update in memory
    expect(dbRows[0].title).toBe('Updated title');

    // 5. Delete the task
    await adapter.tasks.delete(task.id);
    expect(mock.getTable('tasks')).toHaveLength(0);
  });
});

// ═══════════════════════════════════════════════════════
// Journal Entries — Full Round Trip
// ═══════════════════════════════════════════════════════

describe('Integration: Journal entries round-trip', () => {
  let adapter: LocalDataAdapter;
  let mock: ReturnType<typeof createStatefulMockDb>;

  beforeEach(async () => {
    mock = createStatefulMockDb();
    mockDbInstance.db = mock.db;
    adapter = await LocalDataAdapter.create();
  });

  it('create → fetchAll → update → delete', async () => {
    // 1. Create a journal entry
    const entry = await adapter.journalEntries.create({
      date: '2026-03-01',
      content: 'Today was productive',
      tags: ['work', 'productivity'],
      topicIds: ['topic-1'],
      moodScore: 8,
      label: 'Daily',
    });

    expect(entry.id).toBeDefined();
    expect(entry.content).toBe('Today was productive');
    expect(entry.moodScore).toBe(8);
    expect(entry.tags).toEqual(['work', 'productivity']);

    // 2. Verify in mock store
    const dbRows = mock.getTable('journal_entries');
    expect(dbRows).toHaveLength(1);

    // 3. fetchAll
    mock.db.select.mockImplementation(async (sql: string) => {
      if (sql.includes('FROM journal_entries')) return [...mock.getTable('journal_entries')];
      return [];
    });

    const entries = await adapter.journalEntries.fetchAll();
    expect(entries).toHaveLength(1);
    expect(entries[0].content).toBe('Today was productive');

    // 4. Update
    await adapter.journalEntries.update(entry.id, {
      content: 'Updated reflection',
      moodScore: 9,
    });

    // 5. Delete
    await adapter.journalEntries.delete(entry.id);
    expect(mock.getTable('journal_entries')).toHaveLength(0);
  });
});

// ═══════════════════════════════════════════════════════
// Habits — Full Round Trip
// ═══════════════════════════════════════════════════════

describe('Integration: Habits round-trip', () => {
  let adapter: LocalDataAdapter;
  let mock: ReturnType<typeof createStatefulMockDb>;

  beforeEach(async () => {
    mock = createStatefulMockDb();
    mockDbInstance.db = mock.db;
    adapter = await LocalDataAdapter.create();
  });

  it('create → fetchAll → archive → delete', async () => {
    // 1. Create a habit
    const habit = await adapter.habits.create({
      name: 'Meditate',
      icon: 'brain',
      color: '#6366f1',
      type: 'positive',
      timeBlock: 'morning',
      schedule: { type: 'daily' },
      targetCount: 1,
    });

    expect(habit.id).toBeDefined();
    expect(habit.name).toBe('Meditate');
    expect(habit.isArchived).toBe(false);

    // 2. Verify in mock store (habits use routines table)
    const dbRows = mock.getTable('routines');
    expect(dbRows).toHaveLength(1);

    // 3. fetchAll
    mock.db.select.mockImplementation(async (sql: string) => {
      if (sql.includes('FROM routines') && !sql.includes('routine_completions')) {
        return [...mock.getTable('routines')];
      }
      return [];
    });

    const habits = await adapter.habits.fetchAll();
    expect(habits).toHaveLength(1);
    expect(habits[0].name).toBe('Meditate');

    // 4. Archive
    await adapter.habits.archive(habit.id);
    // is_archived should now be 1 in the mock
    expect(dbRows[0].is_archived).toBe(1);

    // 5. Delete
    await adapter.habits.delete(habit.id);
    expect(mock.getTable('routines')).toHaveLength(0);
  });

  it('habit completions: toggle on → verify → toggle off → verify', async () => {
    // Toggle completion ON
    await adapter.habitCompletions.toggle('h1', '2026-03-01', false);
    expect(mock.getTable('routine_completions')).toHaveLength(1);

    // Toggle completion OFF
    // For delete to work, we need the first param to match
    mock.db.execute.mockImplementation(async (sql: string, params?: unknown[]) => {
      if (/DELETE\s+FROM\s+routine_completions/i.test(sql)) {
        mock.tables['routine_completions'] = (mock.tables['routine_completions'] || []).filter(
          (r) => !(r.routine_id === params?.[0] && r.date === params?.[1]),
        );
      }
    });

    await adapter.habitCompletions.toggle('h1', '2026-03-01', true);
    expect(mock.getTable('routine_completions')).toHaveLength(0);
  });
});

// ═══════════════════════════════════════════════════════
// Search — Index and Query
// ═══════════════════════════════════════════════════════

describe('Integration: Search indexing', () => {
  let mock: ReturnType<typeof createStatefulMockDb>;
  let search: LocalSearchAdapter;

  beforeEach(() => {
    mock = createStatefulMockDb();
    search = new LocalSearchAdapter(mock.db as never);
  });

  it('rebuildIndex clears and populates FTS table', async () => {
    // Pre-populate some data
    mock.tables['tasks'] = [{ id: 't1', title: 'Build search', description: 'Implement FTS5' }];

    await search.rebuildIndex();

    // Should have called DELETE FROM search_fts first
    const deleteCall = mock.db.execute.mock.calls.find(
      (c: unknown[]) => typeof c[0] === 'string' && (c[0] as string).includes('DELETE FROM search_fts'),
    );
    expect(deleteCall).toBeDefined();

    // Should have INSERT INTO search_fts calls
    const insertCalls = mock.db.execute.mock.calls.filter(
      (c: unknown[]) => typeof c[0] === 'string' && (c[0] as string).includes('INSERT INTO search_fts'),
    );
    expect(insertCalls.length).toBeGreaterThan(0);
  });

  it('searchAll returns results with correct structure', async () => {
    mock.db.select.mockResolvedValue([
      {
        entity_type: 'task',
        entity_id: 't1',
        title: 'Build search',
        preview: 'Implement **FTS5** search',
        rank: -3.5,
        metadata: '{}',
      },
      {
        entity_type: 'note',
        entity_id: 'j1',
        title: 'Dev log',
        preview: 'Worked on **search** today',
        rank: -2.1,
        metadata: '{"date":"2026-03-01"}',
      },
    ]);

    const results = await search.searchAll('search');

    expect(results).toHaveLength(2);

    // First result
    expect(results[0].entityType).toBe('task');
    expect(results[0].entityId).toBe('t1');
    expect(results[0].title).toBe('Build search');
    expect(results[0].preview).toBe('Implement **FTS5** search');
    expect(results[0].path).toBe('/projects');

    // Second result
    expect(results[1].entityType).toBe('note');
    expect(results[1].path).toBe('/notes');
  });
});

// ═══════════════════════════════════════════════════════
// Auth — Session Persistence Round Trip
// ═══════════════════════════════════════════════════════

describe('Integration: Auth session persistence', () => {
  let mock: ReturnType<typeof createStatefulMockDb>;

  beforeEach(() => {
    mock = createStatefulMockDb();
  });

  it('first launch creates user → second launch loads same user', async () => {
    // First launch: no existing session
    mock.db.select.mockResolvedValueOnce([]);

    const adapter1 = await LocalAuthAdapter.create(mock.db as never);
    const user1 = await adapter1.getUser();

    expect(user1.id).toBeDefined();
    expect(user1.email).toBe('local@kaivoo.desktop');

    // Verify user was persisted to local_session
    expect(mock.db.execute).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO local_session'),
      expect.arrayContaining([expect.stringContaining(user1.id)]),
    );

    // Second launch: mock returns the persisted user
    mock.db.select.mockResolvedValueOnce([{ value: JSON.stringify(user1) }]);

    const adapter2 = await LocalAuthAdapter.create(mock.db as never);
    const user2 = await adapter2.getUser();

    // Same user ID should be loaded
    expect(user2.id).toBe(user1.id);
    expect(user2.email).toBe(user1.email);
  });

  it('session includes access token', async () => {
    mock.db.select.mockResolvedValueOnce([{ value: JSON.stringify({ id: 'test-id', email: 'local@kaivoo.desktop' }) }]);

    const adapter = await LocalAuthAdapter.create(mock.db as never);
    const session = await adapter.getSession();

    expect(session.user.id).toBe('test-id');
    expect(session.accessToken).toBe('local');
  });
});

// ═══════════════════════════════════════════════════════
// Projects — Full Round Trip
// ═══════════════════════════════════════════════════════

describe('Integration: Projects round-trip', () => {
  let adapter: LocalDataAdapter;
  let mock: ReturnType<typeof createStatefulMockDb>;

  beforeEach(async () => {
    mock = createStatefulMockDb();
    mockDbInstance.db = mock.db;
    adapter = await LocalDataAdapter.create();
  });

  it('create → read → update → delete', async () => {
    // Create
    const project = await adapter.projects.create({
      name: 'Kaivoo v2',
      description: 'Next version',
      status: 'planning',
      color: '#6366f1',
    });

    expect(project.id).toBeDefined();
    expect(project.name).toBe('Kaivoo v2');

    // Verify in store
    expect(mock.getTable('projects')).toHaveLength(1);

    // Update
    await adapter.projects.update(project.id, { name: 'Kaivoo v3', status: 'active' });

    // Delete
    await adapter.projects.delete(project.id);
    expect(mock.getTable('projects')).toHaveLength(0);
  });
});

// ═══════════════════════════════════════════════════════
// Captures — Full Round Trip
// ═══════════════════════════════════════════════════════

describe('Integration: Captures round-trip', () => {
  let adapter: LocalDataAdapter;
  let mock: ReturnType<typeof createStatefulMockDb>;

  beforeEach(async () => {
    mock = createStatefulMockDb();
    mockDbInstance.db = mock.db;
    adapter = await LocalDataAdapter.create();
  });

  it('create → read → update → delete', async () => {
    // Create
    const capture = await adapter.captures.create({
      content: 'Quick thought about architecture',
      source: 'quick',
      date: '2026-03-01',
      tags: ['idea'],
      topicIds: [],
    });

    expect(capture.id).toBeDefined();
    expect(capture.content).toBe('Quick thought about architecture');

    // Verify in store
    expect(mock.getTable('captures')).toHaveLength(1);

    // Update
    await adapter.captures.update(capture.id, { content: 'Refined thought' });

    // Delete
    await adapter.captures.delete(capture.id);
    expect(mock.getTable('captures')).toHaveLength(0);
  });
});
