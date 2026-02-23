import { describe, it, expect, vi, beforeEach } from 'vitest';

// Must use vi.hoisted so the variable is available inside the hoisted vi.mock factory
const { mockFrom, createChainMock } = vi.hoisted(() => {
  const mockFrom = vi.fn();

  function createChainMock(result: { data: unknown; error: unknown }) {
    const chain: Record<string, unknown> = {};
    const methods = ['select', 'insert', 'update', 'delete', 'eq', 'order', 'single', 'maybeSingle', 'gte', 'limit', 'ilike', 'is'];
    for (const m of methods) {
      chain[m] = vi.fn().mockReturnValue(chain);
    }
    chain.then = (resolve: (v: unknown) => void) => resolve(result);
    return chain;
  }

  return { mockFrom, createChainMock };
});

vi.mock('@/integrations/supabase/client', () => ({
  supabase: { from: mockFrom },
}));

// ==========================================
// TASKS SERVICE
// ==========================================
import { dbToTask, fetchTasks, createTask, updateTask, deleteTask } from '@/services/tasks.service';

describe('tasks.service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('dbToTask', () => {
    it('converts a DB row to a Task', () => {
      const row = {
        id: 'task-1',
        title: 'Test task',
        description: 'A description',
        status: 'todo',
        priority: 'high',
        due_date: 'Today',
        start_date: null,
        tags: ['work'],
        topic_ids: ['topic-1'],
        source_link: null,
        created_at: '2026-01-15T10:00:00Z',
        completed_at: null,
        user_id: 'user-1',
      };
      const task = dbToTask(row as any);
      expect(task.id).toBe('task-1');
      expect(task.title).toBe('Test task');
      expect(task.status).toBe('todo');
      expect(task.priority).toBe('high');
      expect(task.dueDate).toBe('Today');
      expect(task.tags).toEqual(['work']);
      expect(task.topicIds).toEqual(['topic-1']);
      expect(task.createdAt).toBeInstanceOf(Date);
      expect(task.completedAt).toBeUndefined();
      expect(task.subtasks).toEqual([]);
    });

    it('handles null tags and topicIds', () => {
      const row = {
        id: 'task-2', title: 'T', description: null, status: 'done', priority: 'low',
        due_date: null, start_date: null, tags: null, topic_ids: null, source_link: null,
        created_at: '2026-01-15T10:00:00Z', completed_at: '2026-01-16T10:00:00Z', user_id: 'u',
      };
      const task = dbToTask(row as any);
      expect(task.tags).toEqual([]);
      expect(task.topicIds).toEqual([]);
      expect(task.completedAt).toBeInstanceOf(Date);
    });
  });

  describe('fetchTasks', () => {
    it('filters by user_id', async () => {
      const chain = createChainMock({ data: [], error: null });
      mockFrom.mockReturnValue(chain);

      const result = await fetchTasks('user-123');
      expect(mockFrom).toHaveBeenCalledWith('tasks');
      expect(chain.select).toHaveBeenCalledWith('*');
      expect(chain.eq).toHaveBeenCalledWith('user_id', 'user-123');
    });

    it('throws on supabase error', async () => {
      const chain = createChainMock({ data: null, error: new Error('DB error') });
      mockFrom.mockReturnValue(chain);

      await expect(fetchTasks('user-123')).rejects.toThrow('DB error');
    });
  });

  describe('createTask', () => {
    it('inserts with user_id and returns converted task', async () => {
      const dbRow = {
        id: 'task-new', title: 'New', description: null, status: 'todo', priority: 'medium',
        due_date: null, start_date: null, tags: [], topic_ids: [], source_link: null,
        created_at: '2026-02-01T00:00:00Z', completed_at: null, user_id: 'user-1',
      };
      const chain = createChainMock({ data: dbRow, error: null });
      mockFrom.mockReturnValue(chain);

      const task = await createTask('user-1', {
        title: 'New', status: 'todo', priority: 'medium', tags: [], topicIds: [], subtasks: [],
      } as any);

      expect(mockFrom).toHaveBeenCalledWith('tasks');
      expect(chain.insert).toHaveBeenCalled();
      expect(task.id).toBe('task-new');
    });
  });

  describe('updateTask', () => {
    it('updates with dual user_id + id filter', async () => {
      const chain = createChainMock({ data: null, error: null });
      mockFrom.mockReturnValue(chain);

      await updateTask('user-1', 'task-1', { title: 'Updated' });
      expect(chain.update).toHaveBeenCalled();
      expect(chain.eq).toHaveBeenCalledWith('id', 'task-1');
      expect(chain.eq).toHaveBeenCalledWith('user_id', 'user-1');
    });

    it('throws on error', async () => {
      const chain = createChainMock({ data: null, error: new Error('Update failed') });
      mockFrom.mockReturnValue(chain);
      await expect(updateTask('user-1', 'task-1', { title: 'X' })).rejects.toThrow('Update failed');
    });
  });

  describe('deleteTask', () => {
    it('deletes with dual user_id + id filter', async () => {
      const chain = createChainMock({ data: null, error: null });
      mockFrom.mockReturnValue(chain);

      await deleteTask('user-1', 'task-1');
      expect(chain.delete).toHaveBeenCalled();
      expect(chain.eq).toHaveBeenCalledWith('id', 'task-1');
      expect(chain.eq).toHaveBeenCalledWith('user_id', 'user-1');
    });
  });
});

// ==========================================
// CAPTURES SERVICE
// ==========================================
import { dbToCapture, fetchCaptures, createCapture, updateCapture, deleteCapture } from '@/services/captures.service';

describe('captures.service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('dbToCapture', () => {
    it('converts a DB row to a Capture', () => {
      const row = {
        id: 'cap-1', content: 'Test capture', source: 'journal', source_id: null,
        date: '2026-01-15', tags: ['tag1'], topic_ids: ['topic-1'],
        created_at: '2026-01-15T10:00:00Z', user_id: 'u',
      };
      const capture = dbToCapture(row as any);
      expect(capture.id).toBe('cap-1');
      expect(capture.content).toBe('Test capture');
      expect(capture.tags).toEqual(['tag1']);
      expect(capture.createdAt).toBeInstanceOf(Date);
    });

    it('defaults null tags/topicIds to empty arrays', () => {
      const row = {
        id: 'cap-2', content: 'X', source: 'manual', source_id: null,
        date: '2026-01-15', tags: null, topic_ids: null,
        created_at: '2026-01-15T10:00:00Z', user_id: 'u',
      };
      const capture = dbToCapture(row as any);
      expect(capture.tags).toEqual([]);
      expect(capture.topicIds).toEqual([]);
    });
  });

  describe('fetchCaptures', () => {
    it('filters by user_id', async () => {
      const chain = createChainMock({ data: [], error: null });
      mockFrom.mockReturnValue(chain);
      await fetchCaptures('user-456');
      expect(chain.eq).toHaveBeenCalledWith('user_id', 'user-456');
    });

    it('throws on error', async () => {
      const chain = createChainMock({ data: null, error: new Error('Fail') });
      mockFrom.mockReturnValue(chain);
      await expect(fetchCaptures('u')).rejects.toThrow('Fail');
    });
  });

  describe('createCapture', () => {
    it('inserts with user_id', async () => {
      const dbRow = {
        id: 'cap-new', content: 'New', source: 'manual', source_id: null,
        date: '2026-02-01', tags: [], topic_ids: [], created_at: '2026-02-01T00:00:00Z', user_id: 'u',
      };
      const chain = createChainMock({ data: dbRow, error: null });
      mockFrom.mockReturnValue(chain);

      const capture = await createCapture('u', { content: 'New', source: 'manual', date: '2026-02-01', tags: [], topicIds: [] } as any);
      expect(capture.id).toBe('cap-new');
    });
  });

  describe('updateCapture', () => {
    it('updates with dual filter', async () => {
      const chain = createChainMock({ data: null, error: null });
      mockFrom.mockReturnValue(chain);
      await updateCapture('user-1', 'cap-1', { content: 'Updated' });
      expect(chain.eq).toHaveBeenCalledWith('id', 'cap-1');
      expect(chain.eq).toHaveBeenCalledWith('user_id', 'user-1');
    });
  });

  describe('deleteCapture', () => {
    it('deletes with dual filter', async () => {
      const chain = createChainMock({ data: null, error: null });
      mockFrom.mockReturnValue(chain);
      await deleteCapture('user-1', 'cap-1');
      expect(chain.eq).toHaveBeenCalledWith('id', 'cap-1');
      expect(chain.eq).toHaveBeenCalledWith('user_id', 'user-1');
    });
  });
});
