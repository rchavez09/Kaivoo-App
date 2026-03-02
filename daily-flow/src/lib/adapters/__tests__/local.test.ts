import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { AuthUser } from '../types';

// ─── TauriDatabase Mock ───

interface MockTauriDatabase {
  execute: ReturnType<typeof vi.fn>;
  select: ReturnType<typeof vi.fn>;
  close: ReturnType<typeof vi.fn>;
}

function createMockDb(): MockTauriDatabase {
  return {
    execute: vi.fn().mockResolvedValue(undefined),
    select: vi.fn().mockResolvedValue([]),
    close: vi.fn().mockResolvedValue(undefined),
  };
}

// ─── Mock Tauri SQL plugin ───

const mockDbLoad = vi.fn();

vi.mock('@tauri-apps/plugin-sql', () => {
  return {
    default: {
      load: (...args: unknown[]) => mockDbLoad(...args),
    },
  };
});

// ─── Import after mocks ───
import { LocalDataAdapter, LocalAuthAdapter, LocalSearchAdapter } from '../local';

// ═══════════════════════════════════════════════════════
// LocalDataAdapter
// ═══════════════════════════════════════════════════════

describe('LocalDataAdapter', () => {
  let mockDb: MockTauriDatabase;

  beforeEach(() => {
    vi.clearAllMocks();
    mockDb = createMockDb();
    mockDbLoad.mockResolvedValue(mockDb);
  });

  describe('create (static factory)', () => {
    it('loads SQLite database and runs schema', async () => {
      const adapter = await LocalDataAdapter.create();

      expect(mockDbLoad).toHaveBeenCalledWith('sqlite:kaivoo.db');
      // Schema is executed via db.execute
      expect(mockDb.execute).toHaveBeenCalled();
      expect(adapter).toBeInstanceOf(LocalDataAdapter);
    });

    it('exposes all 15 entity sub-adapters', async () => {
      const adapter = await LocalDataAdapter.create();

      expect(adapter.tasks).toBeDefined();
      expect(adapter.subtasks).toBeDefined();
      expect(adapter.journalEntries).toBeDefined();
      expect(adapter.captures).toBeDefined();
      expect(adapter.topics).toBeDefined();
      expect(adapter.topicPages).toBeDefined();
      expect(adapter.tags).toBeDefined();
      expect(adapter.routines).toBeDefined();
      expect(adapter.routineGroups).toBeDefined();
      expect(adapter.routineCompletions).toBeDefined();
      expect(adapter.habits).toBeDefined();
      expect(adapter.habitCompletions).toBeDefined();
      expect(adapter.meetings).toBeDefined();
      expect(adapter.projects).toBeDefined();
      expect(adapter.projectNotes).toBeDefined();
    });

    it('exposes database getter for search adapter', async () => {
      const adapter = await LocalDataAdapter.create();
      expect(adapter.database).toBe(mockDb);
    });
  });

  describe('dispose', () => {
    it('closes the database connection', async () => {
      const adapter = await LocalDataAdapter.create();
      await adapter.dispose();
      expect(mockDb.close).toHaveBeenCalled();
    });
  });

  describe('tasks sub-adapter', () => {
    it('fetchAll returns converted tasks', async () => {
      const rows = [
        {
          id: 't1',
          title: 'Test',
          description: 'Desc',
          status: 'todo',
          priority: 'high',
          due_date: '2026-03-01',
          start_date: null,
          tags: '["work"]',
          topic_ids: '["topic-1"]',
          project_id: null,
          source_link: null,
          recurrence_rule: null,
          created_at: '2026-01-15T10:00:00Z',
          completed_at: null,
        },
      ];
      mockDb.select.mockResolvedValueOnce(rows);
      // Subtasks query returns empty
      mockDb.select.mockResolvedValueOnce([]);

      const adapter = await LocalDataAdapter.create();
      const tasks = await adapter.tasks.fetchAll();

      expect(tasks).toHaveLength(1);
      expect(tasks[0].id).toBe('t1');
      expect(tasks[0].title).toBe('Test');
      expect(tasks[0].tags).toEqual(['work']);
      expect(tasks[0].topicIds).toEqual(['topic-1']);
      expect(tasks[0].createdAt).toBeInstanceOf(Date);
      expect(tasks[0].subtasks).toEqual([]);
    });

    it('create generates UUID and persists', async () => {
      const adapter = await LocalDataAdapter.create();

      const input = {
        title: 'New Task',
        status: 'todo' as const,
        priority: 'medium' as const,
        tags: ['dev'],
        topicIds: [],
      };

      const task = await adapter.tasks.create(input);

      expect(task.id).toBeDefined();
      expect(task.title).toBe('New Task');
      expect(task.status).toBe('todo');
      expect(task.tags).toEqual(['dev']);
      expect(mockDb.execute).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO tasks'),
        expect.any(Array),
      );
    });

    it('update builds dynamic SET clause', async () => {
      const adapter = await LocalDataAdapter.create();

      await adapter.tasks.update('t1', { title: 'Updated', status: 'in_progress' });

      expect(mockDb.execute).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE tasks SET'),
        expect.arrayContaining(['Updated', 'in_progress', 't1']),
      );
    });

    it('delete removes by id', async () => {
      const adapter = await LocalDataAdapter.create();

      await adapter.tasks.delete('t1');

      expect(mockDb.execute).toHaveBeenCalledWith('DELETE FROM tasks WHERE id = $1', ['t1']);
    });
  });

  describe('journalEntries sub-adapter', () => {
    it('fetchAll parses JSON arrays and dates', async () => {
      const rows = [
        {
          id: 'j1',
          date: '2026-01-15',
          content: 'Today was good.',
          tags: '["reflection"]',
          topic_ids: '[]',
          mood_score: 8,
          label: 'Daily',
          created_at: '2026-01-15T10:00:00Z',
          updated_at: '2026-01-15T10:00:00Z',
          timestamp: '2026-01-15T10:00:00Z',
        },
      ];
      mockDb.select.mockResolvedValueOnce(rows);

      const adapter = await LocalDataAdapter.create();
      const entries = await adapter.journalEntries.fetchAll();

      expect(entries).toHaveLength(1);
      expect(entries[0].tags).toEqual(['reflection']);
      expect(entries[0].moodScore).toBe(8);
      expect(entries[0].createdAt).toBeInstanceOf(Date);
    });
  });

  describe('habits sub-adapter', () => {
    it('fetchAll converts SQLite integers to booleans', async () => {
      const rows = [
        {
          id: 'h1',
          name: 'Meditate',
          icon: 'brain',
          color: '#6366f1',
          type: 'positive',
          time_block: 'morning',
          schedule: '{"type":"daily"}',
          target_count: null,
          strength: 50,
          current_streak: 3,
          best_streak: 7,
          is_archived: 0,
          order: 0,
          group_id: null,
          created_at: '2026-01-01T00:00:00Z',
          updated_at: '2026-01-01T00:00:00Z',
        },
      ];
      mockDb.select.mockResolvedValueOnce(rows);

      const adapter = await LocalDataAdapter.create();
      const habits = await adapter.habits.fetchAll();

      expect(habits[0].isArchived).toBe(false);
      expect(habits[0].name).toBe('Meditate');
      expect(habits[0].schedule).toEqual({ type: 'daily' });
    });

    it('archive sets is_archived = 1', async () => {
      const adapter = await LocalDataAdapter.create();
      await adapter.habits.archive('h1');

      // Habits are stored in the routines table in local SQLite
      expect(mockDb.execute).toHaveBeenCalledWith(
        expect.stringContaining('is_archived = 1'),
        expect.arrayContaining(['h1']),
      );
    });
  });

  describe('captures sub-adapter', () => {
    it('create persists and returns capture', async () => {
      const adapter = await LocalDataAdapter.create();

      const input = {
        content: 'Quick thought',
        source: 'quick' as const,
        date: '2026-03-01',
        tags: [],
        topicIds: [],
      };

      const capture = await adapter.captures.create(input);

      expect(capture.id).toBeDefined();
      expect(capture.content).toBe('Quick thought');
      expect(mockDb.execute).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO captures'),
        expect.any(Array),
      );
    });
  });

  describe('subtasks sub-adapter', () => {
    it('fetchAll returns converted subtasks', async () => {
      const rows = [
        {
          id: 's1',
          task_id: 't1',
          title: 'Sub-task',
          completed: 1,
          completed_at: '2026-01-15T10:00:00Z',
          tags: '["tag1"]',
          created_at: '2026-01-15T10:00:00Z',
        },
      ];
      mockDb.select.mockResolvedValueOnce(rows);

      const adapter = await LocalDataAdapter.create();
      const subtasks = await adapter.subtasks.fetchAll();

      expect(subtasks).toHaveLength(1);
      expect(subtasks[0].taskId).toBe('t1');
      expect(subtasks[0].completed).toBe(true);
      expect(subtasks[0].completedAt).toBeInstanceOf(Date);
      expect(subtasks[0].tags).toEqual(['tag1']);
    });

    it('create inserts and returns subtask', async () => {
      const adapter = await LocalDataAdapter.create();
      const subtask = await adapter.subtasks.create({ taskId: 't1', title: 'New sub' });

      expect(subtask.id).toBeDefined();
      expect(subtask.title).toBe('New sub');
      expect(subtask.taskId).toBe('t1');
      expect(subtask.completed).toBe(false);
      expect(mockDb.execute).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO subtasks'),
        expect.any(Array),
      );
    });

    it('update persists changes', async () => {
      const adapter = await LocalDataAdapter.create();
      await adapter.subtasks.update('s1', { title: 'Updated', completed: true });

      expect(mockDb.execute).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE subtasks SET'),
        expect.arrayContaining(['Updated', 's1']),
      );
    });

    it('delete removes by id', async () => {
      const adapter = await LocalDataAdapter.create();
      await adapter.subtasks.delete('s1');

      expect(mockDb.execute).toHaveBeenCalledWith('DELETE FROM subtasks WHERE id = $1', ['s1']);
    });
  });

  describe('topics sub-adapter', () => {
    it('fetchAll returns converted topics', async () => {
      const rows = [
        {
          id: 'top1',
          name: 'Work',
          description: 'Work stuff',
          icon: '💼',
          parent_id: null,
          created_at: '2026-01-01T00:00:00Z',
        },
      ];
      mockDb.select.mockResolvedValueOnce(rows);

      const adapter = await LocalDataAdapter.create();
      const topics = await adapter.topics.fetchAll();

      expect(topics).toHaveLength(1);
      expect(topics[0].name).toBe('Work');
      expect(topics[0].icon).toBe('💼');
    });

    it('create persists and returns topic', async () => {
      const adapter = await LocalDataAdapter.create();
      const topic = await adapter.topics.create({ name: 'Health', description: 'Fitness', icon: '🏋️' });

      expect(topic.id).toBeDefined();
      expect(topic.name).toBe('Health');
      expect(mockDb.execute).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO topics'),
        expect.any(Array),
      );
    });

    it('update persists changes and reads back', async () => {
      // topics.update does a SELECT after UPDATE to return the updated row
      mockDb.select.mockResolvedValueOnce([
        { id: 'top1', name: 'Updated', description: null, icon: '💼', parent_id: null, created_at: '2026-01-01T00:00:00Z' },
      ]);

      const adapter = await LocalDataAdapter.create();
      const result = await adapter.topics.update('top1', { name: 'Updated' });

      expect(result.name).toBe('Updated');
      expect(mockDb.execute).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE topics SET'),
        expect.arrayContaining(['Updated', 'top1']),
      );
    });

    it('delete removes by id', async () => {
      const adapter = await LocalDataAdapter.create();
      await adapter.topics.delete('top1');

      expect(mockDb.execute).toHaveBeenCalledWith('DELETE FROM topics WHERE id = $1', ['top1']);
    });
  });

  describe('topicPages sub-adapter', () => {
    it('fetchAll returns converted topic pages', async () => {
      const rows = [
        {
          id: 'tp1',
          topic_id: 'top1',
          name: 'Page 1',
          description: 'A page',
          created_at: '2026-01-01T00:00:00Z',
        },
      ];
      mockDb.select.mockResolvedValueOnce(rows);

      const adapter = await LocalDataAdapter.create();
      const pages = await adapter.topicPages.fetchAll();

      expect(pages).toHaveLength(1);
      expect(pages[0].topicId).toBe('top1');
      expect(pages[0].name).toBe('Page 1');
    });

    it('create persists and returns page', async () => {
      const adapter = await LocalDataAdapter.create();
      const page = await adapter.topicPages.create({ topicId: 'top1', name: 'New Page' });

      expect(page.id).toBeDefined();
      expect(page.topicId).toBe('top1');
      expect(mockDb.execute).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO topic_pages'),
        expect.any(Array),
      );
    });

    it('delete removes by id', async () => {
      const adapter = await LocalDataAdapter.create();
      await adapter.topicPages.delete('tp1');

      expect(mockDb.execute).toHaveBeenCalledWith('DELETE FROM topic_pages WHERE id = $1', ['tp1']);
    });
  });

  describe('tags sub-adapter', () => {
    it('fetchAll returns converted tags', async () => {
      const rows = [{ id: 'tag1', name: 'work', color: '#ff0000' }];
      mockDb.select.mockResolvedValueOnce(rows);

      const adapter = await LocalDataAdapter.create();
      const tags = await adapter.tags.fetchAll();

      expect(tags).toHaveLength(1);
      expect(tags[0].name).toBe('work');
      expect(tags[0].color).toBe('#ff0000');
    });

    it('create persists and returns tag', async () => {
      const adapter = await LocalDataAdapter.create();
      const tag = await adapter.tags.create({ name: 'personal', color: '#00ff00' });

      expect(tag.id).toBeDefined();
      expect(tag.name).toBe('personal');
      expect(mockDb.execute).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO tags'),
        expect.any(Array),
      );
    });
  });

  describe('routines sub-adapter', () => {
    it('fetchAll returns converted routines', async () => {
      const rows = [
        {
          id: 'r1',
          name: 'Morning routine',
          icon: 'sun',
          order: 0,
          group_id: null,
          created_at: '2026-01-01T00:00:00Z',
        },
      ];
      mockDb.select.mockResolvedValueOnce(rows);

      const adapter = await LocalDataAdapter.create();
      const routines = await adapter.routines.fetchAll();

      expect(routines).toHaveLength(1);
      expect(routines[0].name).toBe('Morning routine');
    });

    it('create persists and returns routine', async () => {
      const adapter = await LocalDataAdapter.create();
      const routine = await adapter.routines.create({ name: 'Evening routine', icon: 'moon' });

      expect(routine.id).toBeDefined();
      expect(routine.name).toBe('Evening routine');
      expect(mockDb.execute).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO routines'),
        expect.any(Array),
      );
    });

    it('delete removes by id', async () => {
      const adapter = await LocalDataAdapter.create();
      await adapter.routines.delete('r1');

      expect(mockDb.execute).toHaveBeenCalledWith('DELETE FROM routines WHERE id = $1', ['r1']);
    });
  });

  describe('routineGroups sub-adapter', () => {
    it('fetchAll returns converted groups', async () => {
      const rows = [
        {
          id: 'rg1',
          name: 'Health',
          icon: 'heart',
          color: '#ff0000',
          order: 0,
          created_at: '2026-01-01T00:00:00Z',
        },
      ];
      mockDb.select.mockResolvedValueOnce(rows);

      const adapter = await LocalDataAdapter.create();
      const groups = await adapter.routineGroups.fetchAll();

      expect(groups).toHaveLength(1);
      expect(groups[0].name).toBe('Health');
    });

    it('create persists and returns group', async () => {
      const adapter = await LocalDataAdapter.create();
      const group = await adapter.routineGroups.create({ name: 'Fitness', icon: 'dumbbell', color: '#0000ff' });

      expect(group.id).toBeDefined();
      expect(group.name).toBe('Fitness');
      expect(mockDb.execute).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO routine_groups'),
        expect.any(Array),
      );
    });

    it('delete removes by id', async () => {
      const adapter = await LocalDataAdapter.create();
      await adapter.routineGroups.delete('rg1');

      expect(mockDb.execute).toHaveBeenCalledWith('DELETE FROM routine_groups WHERE id = $1', ['rg1']);
    });
  });

  describe('routineCompletions sub-adapter', () => {
    it('fetchAll returns converted completions', async () => {
      const rows = [
        {
          id: 'rc1',
          routine_id: 'r1',
          date: '2026-03-01',
          completed_at: '2026-03-01T08:00:00Z',
        },
      ];
      mockDb.select.mockResolvedValueOnce(rows);

      const adapter = await LocalDataAdapter.create();
      const completions = await adapter.routineCompletions.fetchAll();

      expect(completions).toHaveLength(1);
      expect(completions[0].routineId).toBe('r1');
      expect(completions[0].completedAt).toBeInstanceOf(Date);
    });

    it('toggle inserts when not completed', async () => {
      const adapter = await LocalDataAdapter.create();
      await adapter.routineCompletions.toggle('r1', '2026-03-01', false);

      expect(mockDb.execute).toHaveBeenCalledWith(
        expect.stringContaining('INSERT'),
        expect.arrayContaining(['r1', '2026-03-01']),
      );
    });

    it('toggle deletes when completed', async () => {
      const adapter = await LocalDataAdapter.create();
      await adapter.routineCompletions.toggle('r1', '2026-03-01', true);

      expect(mockDb.execute).toHaveBeenCalledWith(
        expect.stringContaining('DELETE'),
        expect.arrayContaining(['r1', '2026-03-01']),
      );
    });
  });

  describe('habitCompletions sub-adapter', () => {
    it('fetchAll returns converted completions', async () => {
      // Habit completions use routine_completions table — routine_id maps to habitId
      const rows = [
        {
          id: 'hc1',
          routine_id: 'h1',
          date: '2026-03-01',
          count: 1,
          skipped: 0,
          completed_at: '2026-03-01T08:00:00Z',
        },
      ];
      mockDb.select.mockResolvedValueOnce(rows);

      const adapter = await LocalDataAdapter.create();
      const completions = await adapter.habitCompletions.fetchAll();

      expect(completions).toHaveLength(1);
      expect(completions[0].habitId).toBe('h1');
      expect(completions[0].completedAt).toBeInstanceOf(Date);
    });

    it('toggle calls execute with correct params', async () => {
      const adapter = await LocalDataAdapter.create();
      await adapter.habitCompletions.toggle('h1', '2026-03-01', false);

      // Should insert when toggling on
      expect(mockDb.execute).toHaveBeenCalledWith(
        expect.stringContaining('INSERT'),
        expect.arrayContaining(['h1', '2026-03-01']),
      );
    });

    it('incrementCount calls execute', async () => {
      const adapter = await LocalDataAdapter.create();
      await adapter.habitCompletions.incrementCount('h1', '2026-03-01', 2);

      expect(mockDb.execute).toHaveBeenCalledWith(
        expect.any(String),
        expect.arrayContaining(['h1', '2026-03-01']),
      );
    });
  });

  describe('meetings sub-adapter', () => {
    it('fetchAll returns converted meetings', async () => {
      const rows = [
        {
          id: 'm1',
          title: 'Standup',
          start_time: '2026-03-01T09:00:00Z',
          end_time: '2026-03-01T09:30:00Z',
          location: 'Room A',
          description: 'Daily standup',
          attendees: '["alice","bob"]',
          is_external: 0,
          source: 'manual',
          created_at: '2026-01-01T00:00:00Z',
        },
      ];
      mockDb.select.mockResolvedValueOnce(rows);

      const adapter = await LocalDataAdapter.create();
      const meetings = await adapter.meetings.fetchAll();

      expect(meetings).toHaveLength(1);
      expect(meetings[0].title).toBe('Standup');
      expect(meetings[0].attendees).toEqual(['alice', 'bob']);
      expect(meetings[0].isExternal).toBe(false);
      expect(meetings[0].startTime).toBeInstanceOf(Date);
    });

    it('create persists and returns meeting', async () => {
      const adapter = await LocalDataAdapter.create();
      const meeting = await adapter.meetings.create({
        title: 'Team sync',
        startTime: new Date('2026-03-01T10:00:00Z'),
        endTime: new Date('2026-03-01T11:00:00Z'),
        isExternal: false,
      });

      expect(meeting.id).toBeDefined();
      expect(meeting.title).toBe('Team sync');
      expect(mockDb.execute).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO meetings'),
        expect.any(Array),
      );
    });

    it('delete removes by id', async () => {
      const adapter = await LocalDataAdapter.create();
      await adapter.meetings.delete('m1');

      expect(mockDb.execute).toHaveBeenCalledWith('DELETE FROM meetings WHERE id = $1', ['m1']);
    });
  });

  describe('projects sub-adapter', () => {
    it('fetchAll returns converted projects', async () => {
      const rows = [
        {
          id: 'p1',
          name: 'Kaivoo',
          description: 'Productivity app',
          topic_id: 'top1',
          status: 'active',
          color: '#6366f1',
          icon: '🚀',
          start_date: '2026-01-01',
          end_date: null,
          created_at: '2026-01-01T00:00:00Z',
          updated_at: '2026-01-01T00:00:00Z',
        },
      ];
      mockDb.select.mockResolvedValueOnce(rows);

      const adapter = await LocalDataAdapter.create();
      const projects = await adapter.projects.fetchAll();

      expect(projects).toHaveLength(1);
      expect(projects[0].name).toBe('Kaivoo');
      expect(projects[0].topicId).toBe('top1');
      expect(projects[0].status).toBe('active');
    });

    it('create persists and returns project', async () => {
      const adapter = await LocalDataAdapter.create();
      const project = await adapter.projects.create({
        name: 'New Project',
        status: 'planning',
      });

      expect(project.id).toBeDefined();
      expect(project.name).toBe('New Project');
      expect(mockDb.execute).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO projects'),
        expect.any(Array),
      );
    });

    it('update persists changes', async () => {
      const adapter = await LocalDataAdapter.create();
      await adapter.projects.update('p1', { name: 'Updated', status: 'active' });

      expect(mockDb.execute).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE projects SET'),
        expect.arrayContaining(['Updated', 'active', 'p1']),
      );
    });

    it('delete removes by id', async () => {
      const adapter = await LocalDataAdapter.create();
      await adapter.projects.delete('p1');

      expect(mockDb.execute).toHaveBeenCalledWith('DELETE FROM projects WHERE id = $1', ['p1']);
    });
  });

  describe('projectNotes sub-adapter', () => {
    it('fetchAll returns converted project notes', async () => {
      const rows = [
        {
          id: 'pn1',
          project_id: 'p1',
          content: 'First note',
          created_at: '2026-01-01T00:00:00Z',
          updated_at: '2026-01-01T00:00:00Z',
        },
      ];
      mockDb.select.mockResolvedValueOnce(rows);

      const adapter = await LocalDataAdapter.create();
      const notes = await adapter.projectNotes.fetchAll();

      expect(notes).toHaveLength(1);
      expect(notes[0].projectId).toBe('p1');
      expect(notes[0].content).toBe('First note');
    });

    it('create persists and returns note', async () => {
      const adapter = await LocalDataAdapter.create();
      const note = await adapter.projectNotes.create({
        projectId: 'p1',
        content: 'New note',
      });

      expect(note.id).toBeDefined();
      expect(note.projectId).toBe('p1');
      expect(mockDb.execute).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO project_notes'),
        expect.any(Array),
      );
    });

    it('delete removes by id', async () => {
      const adapter = await LocalDataAdapter.create();
      await adapter.projectNotes.delete('pn1');

      expect(mockDb.execute).toHaveBeenCalledWith('DELETE FROM project_notes WHERE id = $1', ['pn1']);
    });
  });

  describe('journalEntries sub-adapter (extended)', () => {
    it('create persists and returns entry', async () => {
      const adapter = await LocalDataAdapter.create();
      const entry = await adapter.journalEntries.create({
        date: '2026-03-01',
        content: 'New journal entry',
        tags: ['work'],
        topicIds: ['top1'],
        moodScore: 7,
        label: 'Daily',
      });

      expect(entry.id).toBeDefined();
      expect(entry.content).toBe('New journal entry');
      expect(entry.moodScore).toBe(7);
      expect(mockDb.execute).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO journal_entries'),
        expect.any(Array),
      );
    });

    it('update persists changes', async () => {
      const adapter = await LocalDataAdapter.create();
      await adapter.journalEntries.update('j1', { content: 'Updated content', moodScore: 9 });

      expect(mockDb.execute).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE journal_entries SET'),
        expect.arrayContaining(['Updated content', 'j1']),
      );
    });

    it('delete removes by id', async () => {
      const adapter = await LocalDataAdapter.create();
      await adapter.journalEntries.delete('j1');

      expect(mockDb.execute).toHaveBeenCalledWith('DELETE FROM journal_entries WHERE id = $1', ['j1']);
    });
  });

  describe('captures sub-adapter (extended)', () => {
    it('fetchAll returns converted captures', async () => {
      const rows = [
        {
          id: 'c1',
          content: 'Thought',
          source: 'quick',
          source_id: null,
          date: '2026-03-01',
          tags: '["idea"]',
          topic_ids: '[]',
          created_at: '2026-03-01T00:00:00Z',
        },
      ];
      mockDb.select.mockResolvedValueOnce(rows);

      const adapter = await LocalDataAdapter.create();
      const captures = await adapter.captures.fetchAll();

      expect(captures).toHaveLength(1);
      expect(captures[0].source).toBe('quick');
      expect(captures[0].tags).toEqual(['idea']);
    });

    it('update persists changes', async () => {
      const adapter = await LocalDataAdapter.create();
      await adapter.captures.update('c1', { content: 'Updated' });

      expect(mockDb.execute).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE captures SET'),
        expect.arrayContaining(['Updated', 'c1']),
      );
    });

    it('delete removes by id', async () => {
      const adapter = await LocalDataAdapter.create();
      await adapter.captures.delete('c1');

      expect(mockDb.execute).toHaveBeenCalledWith('DELETE FROM captures WHERE id = $1', ['c1']);
    });
  });

  describe('habits sub-adapter (extended)', () => {
    it('create persists and returns habit', async () => {
      const adapter = await LocalDataAdapter.create();
      const habit = await adapter.habits.create({
        name: 'Read',
        icon: 'book',
        color: '#22c55e',
        type: 'positive',
        timeBlock: 'evening',
        schedule: { type: 'daily' },
      });

      expect(habit.id).toBeDefined();
      expect(habit.name).toBe('Read');
      expect(mockDb.execute).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO routines'),
        expect.any(Array),
      );
    });

    it('update persists changes', async () => {
      const adapter = await LocalDataAdapter.create();
      await adapter.habits.update('h1', { name: 'Updated habit', strength: 80 });

      expect(mockDb.execute).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE routines SET'),
        expect.arrayContaining(['Updated habit', 'h1']),
      );
    });

    it('delete removes by id', async () => {
      const adapter = await LocalDataAdapter.create();
      await adapter.habits.delete('h1');

      expect(mockDb.execute).toHaveBeenCalledWith(
        expect.stringContaining('DELETE FROM routines WHERE id'),
        expect.arrayContaining(['h1']),
      );
    });

    it('updateStrengthAndStreak persists values', async () => {
      const adapter = await LocalDataAdapter.create();
      await adapter.habits.updateStrengthAndStreak('h1', 90, 10, 15);

      expect(mockDb.execute).toHaveBeenCalledWith(
        expect.stringContaining('strength'),
        expect.arrayContaining([90, 10, 15, 'h1']),
      );
    });
  });
});

// ═══════════════════════════════════════════════════════
// LocalAuthAdapter
// ═══════════════════════════════════════════════════════

describe('LocalAuthAdapter', () => {
  let mockDb: MockTauriDatabase;

  beforeEach(() => {
    vi.clearAllMocks();
    mockDb = createMockDb();
  });

  describe('create (static factory)', () => {
    it('loads existing user from SQLite', async () => {
      const existingUser: AuthUser = { id: 'persisted-uuid', email: 'local@kaivoo.desktop' };
      mockDb.select.mockResolvedValue([{ value: JSON.stringify(existingUser) }]);

      const adapter = await LocalAuthAdapter.create(mockDb as never);
      const user = await adapter.getUser();

      expect(user.id).toBe('persisted-uuid');
      expect(mockDb.select).toHaveBeenCalledWith(
        expect.stringContaining("SELECT value FROM local_session WHERE key = 'user'"),
      );
    });

    it('generates new user on first launch', async () => {
      mockDb.select.mockResolvedValue([]); // No existing session

      const adapter = await LocalAuthAdapter.create(mockDb as never);
      const user = await adapter.getUser();

      expect(user.id).toBeDefined();
      expect(user.id).not.toBe('');
      expect(user.email).toBe('local@kaivoo.desktop');
      // Should persist to SQLite
      expect(mockDb.execute).toHaveBeenCalledWith(
        expect.stringContaining("INSERT INTO local_session"),
        expect.arrayContaining([expect.stringContaining(user.id)]),
      );
    });

    it('generates unique UUIDs across instances', async () => {
      mockDb.select.mockResolvedValue([]);

      const adapter1 = await LocalAuthAdapter.create(mockDb as never);
      const adapter2 = await LocalAuthAdapter.create(mockDb as never);

      const user1 = await adapter1.getUser();
      const user2 = await adapter2.getUser();

      expect(user1.id).not.toBe(user2.id);
    });
  });

  describe('session methods', () => {
    let adapter: LocalAuthAdapter;

    beforeEach(async () => {
      mockDb.select.mockResolvedValue([{ value: JSON.stringify({ id: 'local-id', email: 'local@kaivoo.desktop' }) }]);
      adapter = await LocalAuthAdapter.create(mockDb as never);
    });

    it('getSession returns user with local access token', async () => {
      const session = await adapter.getSession();
      expect(session.user.id).toBe('local-id');
      expect(session.accessToken).toBe('local');
    });

    it('signInWithPassword returns session (no-op)', async () => {
      const session = await adapter.signInWithPassword('a@b.com', 'pass');
      expect(session.user.id).toBe('local-id');
    });

    it('signUp returns session (no-op)', async () => {
      const session = await adapter.signUp('a@b.com', 'pass');
      expect(session.user.id).toBe('local-id');
    });

    it('signInWithOAuth is a no-op', async () => {
      await expect(adapter.signInWithOAuth('google')).resolves.toBeUndefined();
    });

    it('signOut is a no-op', async () => {
      await expect(adapter.signOut()).resolves.toBeUndefined();
    });

    it('onAuthStateChange fires INITIAL_SESSION', async () => {
      const callback = vi.fn();
      adapter.onAuthStateChange(callback);

      // Wait for setTimeout(0)
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(callback).toHaveBeenCalledWith('INITIAL_SESSION', {
        user: { id: 'local-id', email: 'local@kaivoo.desktop' },
        accessToken: 'local',
      });
    });

    it('onAuthStateChange returns unsubscribe function', () => {
      const unsub = adapter.onAuthStateChange(vi.fn());
      expect(typeof unsub).toBe('function');
    });
  });
});

// ═══════════════════════════════════════════════════════
// LocalSearchAdapter
// ═══════════════════════════════════════════════════════

describe('LocalSearchAdapter', () => {
  let mockDb: MockTauriDatabase;
  let search: LocalSearchAdapter;

  beforeEach(() => {
    vi.clearAllMocks();
    mockDb = createMockDb();
    search = new LocalSearchAdapter(mockDb as never);
  });

  describe('rebuildIndex', () => {
    it('clears existing index then populates from all tables', async () => {
      await search.rebuildIndex();

      // First call should be DELETE FROM search_fts
      const executeCalls = mockDb.execute.mock.calls;
      expect(executeCalls[0][0]).toContain('DELETE FROM search_fts');

      // Should have multiple INSERT INTO search_fts calls (one per entity type)
      const insertCalls = executeCalls.filter((c: unknown[]) =>
        (c[0] as string).includes('INSERT INTO search_fts'),
      );
      expect(insertCalls.length).toBeGreaterThanOrEqual(8);
    });
  });

  describe('searchAll', () => {
    it('returns empty array for empty query', async () => {
      const results = await search.searchAll('');
      expect(results).toEqual([]);
      expect(mockDb.select).not.toHaveBeenCalled();
    });

    it('returns empty array for whitespace query', async () => {
      const results = await search.searchAll('   ');
      expect(results).toEqual([]);
    });

    it('queries FTS5 with MATCH and returns mapped results', async () => {
      mockDb.select.mockResolvedValue([
        {
          entity_type: 'task',
          entity_id: 't1',
          title: 'Build feature',
          snippet: '...build **feature** for...',
          rank: -5.2,
          metadata: '{}',
        },
      ]);

      const results = await search.searchAll('feature');

      expect(mockDb.select).toHaveBeenCalledWith(
        expect.stringContaining('search_fts'),
        expect.any(Array),
      );
      expect(results).toHaveLength(1);
      expect(results[0].entityType).toBe('task');
      expect(results[0].entityId).toBe('t1');
      expect(results[0].path).toBe('/tasks');
    });

    it('respects limit parameter', async () => {
      mockDb.select.mockResolvedValue([]);

      await search.searchAll('test', 5);

      expect(mockDb.select).toHaveBeenCalledWith(
        expect.stringContaining('LIMIT'),
        expect.any(Array),
      );
    });

    it('maps entity types to correct paths', async () => {
      const testCases = [
        { entity_type: 'task', entity_id: 't1', expected: '/tasks' },
        { entity_type: 'note', entity_id: 'j1', expected: '/notes' },
        { entity_type: 'topic', entity_id: 'top1', expected: '/topics/top1' },
        { entity_type: 'habit', entity_id: 'h1', expected: '/routines' },
        { entity_type: 'meeting', entity_id: 'm1', expected: '/calendar' },
        { entity_type: 'capture', entity_id: 'c1', expected: '/notes' },
      ];

      for (const tc of testCases) {
        mockDb.select.mockResolvedValueOnce([
          {
            entity_type: tc.entity_type,
            entity_id: tc.entity_id,
            title: 'Test',
            snippet: 'test',
            rank: -1,
            metadata: '{}',
          },
        ]);

        const results = await search.searchAll('test');
        expect(results[0].path).toBe(tc.expected);
      }
    });

    it('maps project entity with id in path', async () => {
      mockDb.select.mockResolvedValue([
        {
          entity_type: 'project',
          entity_id: 'p1',
          title: 'My Project',
          snippet: 'project',
          rank: -1,
          metadata: '{}',
        },
      ]);

      const results = await search.searchAll('project');
      expect(results[0].path).toBe('/projects/p1');
    });

    it('maps project_note to parent project path', async () => {
      mockDb.select.mockResolvedValue([
        {
          entity_type: 'project_note',
          entity_id: 'pn1',
          title: 'Note',
          snippet: 'note',
          rank: -1,
          metadata: '{"projectId":"p1"}',
        },
      ]);

      const results = await search.searchAll('note');
      expect(results[0].path).toBe('/projects/p1');
    });

    it('maps topic_page with topicId metadata', async () => {
      mockDb.select.mockResolvedValue([
        {
          entity_type: 'topic_page',
          entity_id: 'tp1',
          title: 'Page',
          snippet: 'page',
          rank: -1,
          metadata: '{"topicId":"top1"}',
        },
      ]);

      const results = await search.searchAll('page');
      expect(results[0].path).toBe('/topics/top1/pages/tp1');
    });
  });
});
