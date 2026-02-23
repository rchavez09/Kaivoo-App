import { describe, it, expect, beforeEach } from 'vitest';
import { useKaivooStore } from '@/stores/useKaivooStore';
import { format, subDays, startOfWeek } from 'date-fns';

const emptyState = {
  topics: [],
  topicPages: [],
  tags: [],
  tasks: [],
  journalEntries: [],
  captures: [],
  meetings: [],
  routines: [],
  routineGroups: [],
  routineCompletions: {},
  isLoaded: true,
};

describe('useKaivooStore', () => {
  beforeEach(() => {
    useKaivooStore.setState(emptyState);
  });

  // ==========================================
  // TASK CRUD
  // ==========================================
  describe('Task CRUD', () => {
    it('addTask creates a task with auto-generated id and createdAt', () => {
      const { addTask } = useKaivooStore.getState();
      const task = addTask({
        title: 'Test task',
        status: 'todo',
        priority: 'medium',
        tags: [],
        topicIds: [],
        subtasks: [],
      });
      expect(task.id).toBeDefined();
      expect(task.id).toMatch(/^task-/);
      expect(task.createdAt).toBeInstanceOf(Date);
      expect(useKaivooStore.getState().tasks).toHaveLength(1);
      expect(useKaivooStore.getState().tasks[0].title).toBe('Test task');
    });

    it('updateTask modifies only the targeted task', () => {
      const { addTask, updateTask } = useKaivooStore.getState();
      const t1 = addTask({ title: 'A', status: 'todo', priority: 'low', tags: [], topicIds: [], subtasks: [] });
      addTask({ title: 'B', status: 'todo', priority: 'low', tags: [], topicIds: [], subtasks: [] });

      useKaivooStore.getState().updateTask(t1.id, { title: 'A Updated', status: 'doing' });

      const tasks = useKaivooStore.getState().tasks;
      expect(tasks.find(t => t.id === t1.id)?.title).toBe('A Updated');
      expect(tasks.find(t => t.id === t1.id)?.status).toBe('doing');
      expect(tasks.find(t => t.title === 'B')?.status).toBe('todo'); // unchanged
    });

    it('deleteTask removes the correct task', () => {
      const { addTask } = useKaivooStore.getState();
      const t1 = addTask({ title: 'Keep', status: 'todo', priority: 'low', tags: [], topicIds: [], subtasks: [] });
      const t2 = addTask({ title: 'Delete', status: 'todo', priority: 'low', tags: [], topicIds: [], subtasks: [] });

      useKaivooStore.getState().deleteTask(t2.id);

      const tasks = useKaivooStore.getState().tasks;
      expect(tasks).toHaveLength(1);
      expect(tasks[0].id).toBe(t1.id);
    });

    it('addSubtask inserts into the correct task', () => {
      const { addTask } = useKaivooStore.getState();
      const task = addTask({ title: 'Parent', status: 'todo', priority: 'low', tags: [], topicIds: [], subtasks: [] });

      useKaivooStore.getState().addSubtask(task.id, 'Child subtask');

      const updated = useKaivooStore.getState().tasks.find(t => t.id === task.id);
      expect(updated?.subtasks).toHaveLength(1);
      expect(updated?.subtasks[0].title).toBe('Child subtask');
      expect(updated?.subtasks[0].completed).toBe(false);
    });

    it('toggleSubtask flips completed and sets completedAt', () => {
      const { addTask } = useKaivooStore.getState();
      const task = addTask({ title: 'T', status: 'todo', priority: 'low', tags: [], topicIds: [], subtasks: [] });
      useKaivooStore.getState().addSubtask(task.id, 'Sub');

      const subtaskId = useKaivooStore.getState().tasks[0].subtasks[0].id;
      useKaivooStore.getState().toggleSubtask(task.id, subtaskId);

      const sub = useKaivooStore.getState().tasks[0].subtasks[0];
      expect(sub.completed).toBe(true);
      expect(sub.completedAt).toBeInstanceOf(Date);

      // Toggle back
      useKaivooStore.getState().toggleSubtask(task.id, subtaskId);
      expect(useKaivooStore.getState().tasks[0].subtasks[0].completed).toBe(false);
    });
  });

  // ==========================================
  // TOPIC RESOLUTION
  // ==========================================
  describe('Topic Resolution', () => {
    it('resolveTopicPath finds existing topic (case-insensitive)', () => {
      useKaivooStore.setState({
        ...emptyState,
        topics: [{ id: 'topic-1', name: 'NUWAVE', description: '', createdAt: new Date() }],
      });
      const result = useKaivooStore.getState().resolveTopicPath('nuwave');
      expect(result).toEqual(['topic-1']);
    });

    it('returns null for non-existent topic without autoCreate', () => {
      const result = useKaivooStore.getState().resolveTopicPath('NonExistent');
      expect(result).toBeNull();
    });

    it('auto-creates topic when autoCreate=true', () => {
      const result = useKaivooStore.getState().resolveTopicPath('NewTopic', true);
      expect(result).not.toBeNull();
      expect(result).toHaveLength(1);
      expect(useKaivooStore.getState().topics).toHaveLength(1);
      expect(useKaivooStore.getState().topics[0].name).toBe('NewTopic');
    });

    it('resolves Topic/Page path', () => {
      useKaivooStore.setState({
        ...emptyState,
        topics: [{ id: 'topic-1', name: 'Project', description: '', createdAt: new Date() }],
        topicPages: [{ id: 'page-1', topicId: 'topic-1', name: 'Sprint', createdAt: new Date() }],
      });
      const result = useKaivooStore.getState().resolveTopicPath('Project/Sprint');
      expect(result).toEqual(['topic-1', 'page-1']);
    });

    it('auto-creates page for existing topic', () => {
      useKaivooStore.setState({
        ...emptyState,
        topics: [{ id: 'topic-1', name: 'Project', description: '', createdAt: new Date() }],
      });
      const result = useKaivooStore.getState().resolveTopicPath('Project/NewPage', true);
      expect(result).toHaveLength(2);
      expect(result![0]).toBe('topic-1');
      expect(useKaivooStore.getState().topicPages).toHaveLength(1);
    });
  });

  // ==========================================
  // ROUTINE COMPLETIONS
  // ==========================================
  describe('Routine Completions', () => {
    const today = format(new Date(), 'yyyy-MM-dd');

    it('toggleRoutineCompletion adds a completion record', () => {
      useKaivooStore.getState().toggleRoutineCompletion('routine-1');
      const completions = useKaivooStore.getState().routineCompletions[today];
      expect(completions).toHaveLength(1);
      expect(completions[0].routineId).toBe('routine-1');
      expect(completions[0].completedAt).toBeInstanceOf(Date);
    });

    it('toggling again removes the completion', () => {
      useKaivooStore.getState().toggleRoutineCompletion('routine-1');
      useKaivooStore.getState().toggleRoutineCompletion('routine-1');
      const completions = useKaivooStore.getState().routineCompletions[today];
      expect(completions).toHaveLength(0);
    });

    it('isRoutineCompleted reflects state', () => {
      expect(useKaivooStore.getState().isRoutineCompleted('routine-1')).toBe(false);
      useKaivooStore.getState().toggleRoutineCompletion('routine-1');
      expect(useKaivooStore.getState().isRoutineCompleted('routine-1')).toBe(true);
    });

    it('works with explicit date parameter', () => {
      useKaivooStore.getState().toggleRoutineCompletion('routine-1', '2026-01-15');
      expect(useKaivooStore.getState().isRoutineCompleted('routine-1', '2026-01-15')).toBe(true);
      expect(useKaivooStore.getState().isRoutineCompleted('routine-1')).toBe(false);
    });
  });

  // ==========================================
  // TASK FILTERING
  // ==========================================
  describe('Task Filtering', () => {
    it('getTasksDueToday returns only tasks due today that are not done', () => {
      useKaivooStore.setState({
        ...emptyState,
        tasks: [
          { id: 't1', title: 'Due today', status: 'todo', priority: 'medium', dueDate: 'Today', tags: [], topicIds: [], subtasks: [], createdAt: new Date() },
          { id: 't2', title: 'Done today', status: 'done', priority: 'medium', dueDate: 'Today', tags: [], topicIds: [], subtasks: [], createdAt: new Date() },
          { id: 't3', title: 'Due tomorrow', status: 'todo', priority: 'medium', dueDate: 'Tomorrow', tags: [], topicIds: [], subtasks: [], createdAt: new Date() },
        ] as any[],
      });

      const result = useKaivooStore.getState().getTasksDueToday();
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('t1');
    });

    it('getCompletedTasksThisWeek returns tasks completed this week', () => {
      const thisWeekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
      const withinWeek = new Date(thisWeekStart.getTime() + 86400000); // 1 day after week start
      const beforeWeek = subDays(thisWeekStart, 1);

      useKaivooStore.setState({
        ...emptyState,
        tasks: [
          { id: 't1', title: 'This week', status: 'done', priority: 'medium', tags: [], topicIds: [], subtasks: [], createdAt: new Date(), completedAt: withinWeek },
          { id: 't2', title: 'Last week', status: 'done', priority: 'medium', tags: [], topicIds: [], subtasks: [], createdAt: new Date(), completedAt: beforeWeek },
          { id: 't3', title: 'Not done', status: 'todo', priority: 'medium', tags: [], topicIds: [], subtasks: [], createdAt: new Date() },
        ] as any[],
      });

      const result = useKaivooStore.getState().getCompletedTasksThisWeek();
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('t1');
    });
  });

  // ==========================================
  // JOURNAL ENTRY CRUD
  // ==========================================
  describe('Journal Entry CRUD', () => {
    it('addJournalEntry auto-generates fields', () => {
      const entry = useKaivooStore.getState().addJournalEntry({
        date: '2026-02-23',
        content: 'Test entry',
        tags: [],
        topicIds: [],
      });
      expect(entry.id).toMatch(/^journal-/);
      expect(entry.createdAt).toBeInstanceOf(Date);
      expect(entry.updatedAt).toBeInstanceOf(Date);
      expect(entry.timestamp).toBeInstanceOf(Date);
      expect(useKaivooStore.getState().journalEntries).toHaveLength(1);
    });

    it('updateJournalEntry modifies the entry and refreshes updatedAt', () => {
      const entry = useKaivooStore.getState().addJournalEntry({
        date: '2026-02-23',
        content: 'Original',
        tags: [],
        topicIds: [],
      });

      const beforeUpdate = entry.updatedAt;
      // Small delay to ensure different timestamp
      useKaivooStore.getState().updateJournalEntry(entry.id, { content: 'Updated' });

      const updated = useKaivooStore.getState().journalEntries[0];
      expect(updated.content).toBe('Updated');
      expect(updated.updatedAt.getTime()).toBeGreaterThanOrEqual(beforeUpdate.getTime());
    });

    it('deleteJournalEntry removes the entry', () => {
      const entry = useKaivooStore.getState().addJournalEntry({
        date: '2026-02-23',
        content: 'To delete',
        tags: [],
        topicIds: [],
      });
      useKaivooStore.getState().deleteJournalEntry(entry.id);
      expect(useKaivooStore.getState().journalEntries).toHaveLength(0);
    });

    it('getJournalEntriesForDate filters and sorts by timestamp', () => {
      const e1 = useKaivooStore.getState().addJournalEntry({
        date: '2026-02-23',
        content: 'Second',
        tags: [],
        topicIds: [],
      });
      const e2 = useKaivooStore.getState().addJournalEntry({
        date: '2026-02-23',
        content: 'First',
        tags: [],
        topicIds: [],
      });
      // Different date — should be excluded
      useKaivooStore.getState().addJournalEntry({
        date: '2026-02-22',
        content: 'Other day',
        tags: [],
        topicIds: [],
      });

      const result = useKaivooStore.getState().getJournalEntriesForDate('2026-02-23');
      expect(result).toHaveLength(2);
    });
  });
});
