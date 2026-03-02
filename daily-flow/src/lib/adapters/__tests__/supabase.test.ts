import { describe, it, expect, vi, beforeEach } from 'vitest';

// ─── Mock all service modules ───

const mockFetchTasks = vi.fn();
const mockCreateTask = vi.fn();
const mockUpdateTask = vi.fn();
const mockDeleteTask = vi.fn();
const mockFetchSubtasks = vi.fn();
const mockCreateSubtask = vi.fn();
const mockUpdateSubtask = vi.fn();
const mockDeleteSubtask = vi.fn();
const mockDbToTask = vi.fn();

vi.mock('@/services/tasks.service', () => ({
  fetchTasks: (...args: unknown[]) => mockFetchTasks(...args),
  fetchSubtasks: (...args: unknown[]) => mockFetchSubtasks(...args),
  createTask: (...args: unknown[]) => mockCreateTask(...args),
  updateTask: (...args: unknown[]) => mockUpdateTask(...args),
  deleteTask: (...args: unknown[]) => mockDeleteTask(...args),
  createSubtask: (...args: unknown[]) => mockCreateSubtask(...args),
  updateSubtask: (...args: unknown[]) => mockUpdateSubtask(...args),
  deleteSubtask: (...args: unknown[]) => mockDeleteSubtask(...args),
  dbToTask: (...args: unknown[]) => mockDbToTask(...args),
}));

const mockFetchJournalEntries = vi.fn();
const mockCreateJournalEntry = vi.fn();
const mockUpdateJournalEntry = vi.fn();
const mockDeleteJournalEntry = vi.fn();
const mockDbToJournalEntry = vi.fn();

vi.mock('@/services/journal.service', () => ({
  fetchJournalEntries: (...args: unknown[]) => mockFetchJournalEntries(...args),
  createJournalEntry: (...args: unknown[]) => mockCreateJournalEntry(...args),
  updateJournalEntry: (...args: unknown[]) => mockUpdateJournalEntry(...args),
  deleteJournalEntry: (...args: unknown[]) => mockDeleteJournalEntry(...args),
  dbToJournalEntry: (...args: unknown[]) => mockDbToJournalEntry(...args),
}));

const mockFetchCaptures = vi.fn();
const mockCreateCapture = vi.fn();
const mockUpdateCapture = vi.fn();
const mockDeleteCapture = vi.fn();
const mockDbToCapture = vi.fn();

vi.mock('@/services/captures.service', () => ({
  fetchCaptures: (...args: unknown[]) => mockFetchCaptures(...args),
  createCapture: (...args: unknown[]) => mockCreateCapture(...args),
  updateCapture: (...args: unknown[]) => mockUpdateCapture(...args),
  deleteCapture: (...args: unknown[]) => mockDeleteCapture(...args),
  dbToCapture: (...args: unknown[]) => mockDbToCapture(...args),
}));

const mockFetchTopics = vi.fn();
const mockFetchTopicPages = vi.fn();
const mockFetchTags = vi.fn();
const mockCreateTopic = vi.fn();
const mockUpdateTopic = vi.fn();
const mockDeleteTopic = vi.fn();
const mockCreateTopicPage = vi.fn();
const mockUpdateTopicPage = vi.fn();
const mockDeleteTopicPage = vi.fn();
const mockCreateTag = vi.fn();
const mockDbToTopic = vi.fn();
const mockDbToTopicPage = vi.fn();
const mockDbToTag = vi.fn();

vi.mock('@/services/topics.service', () => ({
  fetchTopics: (...args: unknown[]) => mockFetchTopics(...args),
  fetchTopicPages: (...args: unknown[]) => mockFetchTopicPages(...args),
  fetchTags: (...args: unknown[]) => mockFetchTags(...args),
  createTopic: (...args: unknown[]) => mockCreateTopic(...args),
  updateTopic: (...args: unknown[]) => mockUpdateTopic(...args),
  deleteTopic: (...args: unknown[]) => mockDeleteTopic(...args),
  createTopicPage: (...args: unknown[]) => mockCreateTopicPage(...args),
  updateTopicPage: (...args: unknown[]) => mockUpdateTopicPage(...args),
  deleteTopicPage: (...args: unknown[]) => mockDeleteTopicPage(...args),
  createTag: (...args: unknown[]) => mockCreateTag(...args),
  dbToTopic: (...args: unknown[]) => mockDbToTopic(...args),
  dbToTopicPage: (...args: unknown[]) => mockDbToTopicPage(...args),
  dbToTag: (...args: unknown[]) => mockDbToTag(...args),
}));

const mockFetchRoutines = vi.fn();
const mockFetchRoutineGroups = vi.fn();
const mockFetchRoutineCompletions = vi.fn();
const mockCreateRoutine = vi.fn();
const mockUpdateRoutine = vi.fn();
const mockDeleteRoutine = vi.fn();
const mockCreateRoutineGroup = vi.fn();
const mockUpdateRoutineGroup = vi.fn();
const mockDeleteRoutineGroup = vi.fn();
const mockToggleRoutineCompletion = vi.fn();
const mockDbToRoutine = vi.fn();
const mockDbToRoutineGroup = vi.fn();

vi.mock('@/services/routines.service', () => ({
  fetchRoutines: (...args: unknown[]) => mockFetchRoutines(...args),
  fetchRoutineGroups: (...args: unknown[]) => mockFetchRoutineGroups(...args),
  fetchRoutineCompletions: (...args: unknown[]) => mockFetchRoutineCompletions(...args),
  createRoutine: (...args: unknown[]) => mockCreateRoutine(...args),
  updateRoutine: (...args: unknown[]) => mockUpdateRoutine(...args),
  deleteRoutine: (...args: unknown[]) => mockDeleteRoutine(...args),
  createRoutineGroup: (...args: unknown[]) => mockCreateRoutineGroup(...args),
  updateRoutineGroup: (...args: unknown[]) => mockUpdateRoutineGroup(...args),
  deleteRoutineGroup: (...args: unknown[]) => mockDeleteRoutineGroup(...args),
  toggleRoutineCompletion: (...args: unknown[]) => mockToggleRoutineCompletion(...args),
  dbToRoutine: (...args: unknown[]) => mockDbToRoutine(...args),
  dbToRoutineGroup: (...args: unknown[]) => mockDbToRoutineGroup(...args),
}));

const mockFetchHabits = vi.fn();
const mockFetchHabitCompletions = vi.fn();
const mockCreateHabit = vi.fn();
const mockUpdateHabit = vi.fn();
const mockDeleteHabit = vi.fn();
const mockArchiveHabit = vi.fn();
const mockToggleHabitCompletion = vi.fn();
const mockIncrementHabitCount = vi.fn();
const mockUpdateHabitStrengthAndStreak = vi.fn();
const mockDbToHabit = vi.fn();
const mockDbToHabitCompletion = vi.fn();

vi.mock('@/services/habits.service', () => ({
  fetchHabits: (...args: unknown[]) => mockFetchHabits(...args),
  fetchHabitCompletions: (...args: unknown[]) => mockFetchHabitCompletions(...args),
  createHabit: (...args: unknown[]) => mockCreateHabit(...args),
  updateHabit: (...args: unknown[]) => mockUpdateHabit(...args),
  deleteHabit: (...args: unknown[]) => mockDeleteHabit(...args),
  archiveHabit: (...args: unknown[]) => mockArchiveHabit(...args),
  toggleHabitCompletion: (...args: unknown[]) => mockToggleHabitCompletion(...args),
  incrementHabitCount: (...args: unknown[]) => mockIncrementHabitCount(...args),
  updateHabitStrengthAndStreak: (...args: unknown[]) => mockUpdateHabitStrengthAndStreak(...args),
  dbToHabit: (...args: unknown[]) => mockDbToHabit(...args),
  dbToHabitCompletion: (...args: unknown[]) => mockDbToHabitCompletion(...args),
}));

const mockFetchMeetings = vi.fn();
const mockCreateMeeting = vi.fn();
const mockUpdateMeeting = vi.fn();
const mockDeleteMeeting = vi.fn();
const mockDbToMeeting = vi.fn();

vi.mock('@/services/meetings.service', () => ({
  fetchMeetings: (...args: unknown[]) => mockFetchMeetings(...args),
  createMeeting: (...args: unknown[]) => mockCreateMeeting(...args),
  updateMeeting: (...args: unknown[]) => mockUpdateMeeting(...args),
  deleteMeeting: (...args: unknown[]) => mockDeleteMeeting(...args),
  dbToMeeting: (...args: unknown[]) => mockDbToMeeting(...args),
}));

const mockFetchProjects = vi.fn();
const mockCreateProject = vi.fn();
const mockUpdateProject = vi.fn();
const mockDeleteProject = vi.fn();
const mockDbToProject = vi.fn();

vi.mock('@/services/projects.service', () => ({
  fetchProjects: (...args: unknown[]) => mockFetchProjects(...args),
  createProject: (...args: unknown[]) => mockCreateProject(...args),
  updateProject: (...args: unknown[]) => mockUpdateProject(...args),
  deleteProject: (...args: unknown[]) => mockDeleteProject(...args),
  dbToProject: (...args: unknown[]) => mockDbToProject(...args),
}));

const mockFetchProjectNotes = vi.fn();
const mockCreateProjectNote = vi.fn();
const mockUpdateProjectNote = vi.fn();
const mockDeleteProjectNote = vi.fn();
const mockDbToProjectNote = vi.fn();

vi.mock('@/services/project-notes.service', () => ({
  fetchProjectNotes: (...args: unknown[]) => mockFetchProjectNotes(...args),
  createProjectNote: (...args: unknown[]) => mockCreateProjectNote(...args),
  updateProjectNote: (...args: unknown[]) => mockUpdateProjectNote(...args),
  deleteProjectNote: (...args: unknown[]) => mockDeleteProjectNote(...args),
  dbToProjectNote: (...args: unknown[]) => mockDbToProjectNote(...args),
}));

const mockSearchAll = vi.fn();

vi.mock('@/services/search.service', () => ({
  searchAll: (...args: unknown[]) => mockSearchAll(...args),
}));

// Mock supabase auth
const mockGetUser = vi.fn();
const mockGetSession = vi.fn();
const mockSignInWithPassword = vi.fn();
const mockSignUp = vi.fn();
const mockSignInWithOAuth = vi.fn();
const mockSignOut = vi.fn();
const mockOnAuthStateChange = vi.fn();

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getUser: (...args: unknown[]) => mockGetUser(...args),
      getSession: (...args: unknown[]) => mockGetSession(...args),
      signInWithPassword: (...args: unknown[]) => mockSignInWithPassword(...args),
      signUp: (...args: unknown[]) => mockSignUp(...args),
      signInWithOAuth: (...args: unknown[]) => mockSignInWithOAuth(...args),
      signOut: (...args: unknown[]) => mockSignOut(...args),
      onAuthStateChange: (...args: unknown[]) => mockOnAuthStateChange(...args),
    },
  },
}));

// ─── Import after mocks ───
import { SupabaseDataAdapter, SupabaseAuthAdapter, SupabaseSearchAdapter } from '../supabase';

const USER_ID = 'test-user-123';

// ═══════════════════════════════════════════════════════
// SupabaseDataAdapter
// ═══════════════════════════════════════════════════════

describe('SupabaseDataAdapter', () => {
  let adapter: SupabaseDataAdapter;

  beforeEach(() => {
    vi.clearAllMocks();
    adapter = new SupabaseDataAdapter(USER_ID);
  });

  it('exposes all 15 entity sub-adapters', () => {
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

  it('initialize and dispose are no-ops', async () => {
    await expect(adapter.initialize()).resolves.toBeUndefined();
    await expect(adapter.dispose()).resolves.toBeUndefined();
  });

  // ─── Tasks ───

  describe('tasks', () => {
    it('fetchAll delegates with userId', async () => {
      const rows = [{ id: 't1' }, { id: 't2' }];
      mockFetchTasks.mockResolvedValue(rows);
      mockDbToTask.mockImplementation((r: { id: string }) => ({ ...r, converted: true }));

      const result = await adapter.tasks.fetchAll();

      expect(mockFetchTasks).toHaveBeenCalledWith(USER_ID);
      expect(mockDbToTask).toHaveBeenCalledTimes(2);
      expect(result).toHaveLength(2);
    });

    it('create delegates with userId and adds empty subtasks', async () => {
      const input = { title: 'Test', status: 'todo' as const, priority: 'low' as const, tags: [], topicIds: [] };
      const created = { id: 'new-task', ...input };
      mockCreateTask.mockResolvedValue(created);

      const result = await adapter.tasks.create(input);

      expect(mockCreateTask).toHaveBeenCalledWith(USER_ID, { ...input, subtasks: [] });
      expect(result).toEqual(created);
    });

    it('update delegates with userId and id', async () => {
      mockUpdateTask.mockResolvedValue(undefined);
      await adapter.tasks.update('task-1', { title: 'Updated' });
      expect(mockUpdateTask).toHaveBeenCalledWith(USER_ID, 'task-1', { title: 'Updated' });
    });

    it('delete delegates with userId and id', async () => {
      mockDeleteTask.mockResolvedValue(undefined);
      await adapter.tasks.delete('task-1');
      expect(mockDeleteTask).toHaveBeenCalledWith(USER_ID, 'task-1');
    });
  });

  // ─── Subtasks ───

  describe('subtasks', () => {
    it('fetchAll converts rows to Subtask type', async () => {
      const rows = [{ id: 's1', task_id: 't1', title: 'Sub', completed: false, completed_at: null, tags: ['a'] }];
      mockFetchSubtasks.mockResolvedValue(rows);

      const result = await adapter.subtasks.fetchAll();

      expect(mockFetchSubtasks).toHaveBeenCalledWith(USER_ID);
      expect(result[0]).toEqual({
        id: 's1',
        taskId: 't1',
        title: 'Sub',
        completed: false,
        completedAt: undefined,
        tags: ['a'],
      });
    });

    it('fetchAll handles completed_at conversion', async () => {
      const rows = [
        { id: 's2', task_id: 't1', title: 'Done', completed: true, completed_at: '2026-01-01T00:00:00Z', tags: null },
      ];
      mockFetchSubtasks.mockResolvedValue(rows);

      const result = await adapter.subtasks.fetchAll();

      expect(result[0].completedAt).toBeInstanceOf(Date);
      expect(result[0].tags).toEqual([]);
    });
  });

  // ─── Journal ───

  describe('journalEntries', () => {
    it('fetchAll delegates with userId', async () => {
      mockFetchJournalEntries.mockResolvedValue([{ id: 'j1' }]);
      mockDbToJournalEntry.mockImplementation((r: { id: string }) => r);

      await adapter.journalEntries.fetchAll();

      expect(mockFetchJournalEntries).toHaveBeenCalledWith(USER_ID);
      expect(mockDbToJournalEntry).toHaveBeenCalledTimes(1);
    });

    it('create delegates with userId', async () => {
      const input = { date: '2026-01-01', content: 'Entry', tags: [], topicIds: [] };
      mockCreateJournalEntry.mockResolvedValue({ id: 'j-new', ...input });

      await adapter.journalEntries.create(input);

      expect(mockCreateJournalEntry).toHaveBeenCalledWith(USER_ID, input);
    });
  });

  // ─── Habits ───

  describe('habits', () => {
    it('fetchAll delegates and converts', async () => {
      mockFetchHabits.mockResolvedValue([{ id: 'h1' }]);
      mockDbToHabit.mockImplementation((r: { id: string }) => r);

      await adapter.habits.fetchAll();

      expect(mockFetchHabits).toHaveBeenCalledWith(USER_ID);
    });

    it('archive delegates with userId and id', async () => {
      mockArchiveHabit.mockResolvedValue(undefined);
      await adapter.habits.archive('h1');
      expect(mockArchiveHabit).toHaveBeenCalledWith(USER_ID, 'h1');
    });

    it('updateStrengthAndStreak delegates all args', async () => {
      mockUpdateHabitStrengthAndStreak.mockResolvedValue(undefined);
      await adapter.habits.updateStrengthAndStreak('h1', 75, 5, 10);
      expect(mockUpdateHabitStrengthAndStreak).toHaveBeenCalledWith(USER_ID, 'h1', 75, 5, 10);
    });
  });

  // ─── Habit Completions ───

  describe('habitCompletions', () => {
    it('toggle delegates correctly', async () => {
      mockToggleHabitCompletion.mockResolvedValue(undefined);
      await adapter.habitCompletions.toggle('h1', '2026-01-01', true);
      expect(mockToggleHabitCompletion).toHaveBeenCalledWith(USER_ID, 'h1', '2026-01-01', true);
    });

    it('incrementCount delegates correctly', async () => {
      mockIncrementHabitCount.mockResolvedValue(undefined);
      await adapter.habitCompletions.incrementCount('h1', '2026-01-01', 3);
      expect(mockIncrementHabitCount).toHaveBeenCalledWith(USER_ID, 'h1', '2026-01-01', 3);
    });
  });

  // ─── Routine Completions ───

  describe('routineCompletions', () => {
    it('fetchAll converts rows', async () => {
      const rows = [{ id: 'rc1', routine_id: 'r1', date: '2026-01-01', completed_at: '2026-01-01T10:00:00Z' }];
      mockFetchRoutineCompletions.mockResolvedValue(rows);

      const result = await adapter.routineCompletions.fetchAll();

      expect(result[0].routineId).toBe('r1');
      expect(result[0].completedAt).toBeInstanceOf(Date);
    });

    it('toggle delegates correctly', async () => {
      mockToggleRoutineCompletion.mockResolvedValue(undefined);
      await adapter.routineCompletions.toggle('r1', '2026-01-01', false);
      expect(mockToggleRoutineCompletion).toHaveBeenCalledWith(USER_ID, 'r1', '2026-01-01', false);
    });
  });

  // ─── Projects ───

  describe('projects', () => {
    it('CRUD operations delegate with userId', async () => {
      // fetchAll
      mockFetchProjects.mockResolvedValue([]);
      mockDbToProject.mockReturnValue({});
      await adapter.projects.fetchAll();
      expect(mockFetchProjects).toHaveBeenCalledWith(USER_ID);

      // create
      const input = { name: 'Proj', status: 'planning' as const };
      mockCreateProject.mockResolvedValue({ id: 'p1' });
      await adapter.projects.create(input);
      expect(mockCreateProject).toHaveBeenCalledWith(USER_ID, input);

      // update
      mockUpdateProject.mockResolvedValue(undefined);
      await adapter.projects.update('p1', { name: 'Updated' });
      expect(mockUpdateProject).toHaveBeenCalledWith(USER_ID, 'p1', { name: 'Updated' });

      // delete
      mockDeleteProject.mockResolvedValue(undefined);
      await adapter.projects.delete('p1');
      expect(mockDeleteProject).toHaveBeenCalledWith(USER_ID, 'p1');
    });
  });

  // ─── Tags ───

  describe('tags', () => {
    it('create delegates name and color', async () => {
      mockCreateTag.mockResolvedValue({ id: 'tag-1', name: 'work', color: '#ff0000' });
      await adapter.tags.create({ name: 'work', color: '#ff0000' });
      expect(mockCreateTag).toHaveBeenCalledWith(USER_ID, 'work', '#ff0000');
    });
  });

  // ─── Meetings ───

  describe('meetings', () => {
    it('create delegates with userId', async () => {
      const input = {
        title: 'Standup',
        startTime: new Date(),
        endTime: new Date(),
        isExternal: false,
      };
      mockCreateMeeting.mockResolvedValue({ id: 'm1' });
      await adapter.meetings.create(input);
      expect(mockCreateMeeting).toHaveBeenCalledWith(USER_ID, input);
    });
  });
});

// ═══════════════════════════════════════════════════════
// SupabaseAuthAdapter
// ═══════════════════════════════════════════════════════

describe('SupabaseAuthAdapter', () => {
  let auth: SupabaseAuthAdapter;

  beforeEach(() => {
    vi.clearAllMocks();
    auth = new SupabaseAuthAdapter();
  });

  describe('getUser', () => {
    it('returns AuthUser when authenticated', async () => {
      mockGetUser.mockResolvedValue({ data: { user: { id: 'u1', email: 'a@b.com' } } });
      const user = await auth.getUser();
      expect(user).toEqual({ id: 'u1', email: 'a@b.com' });
    });

    it('returns null when not authenticated', async () => {
      mockGetUser.mockResolvedValue({ data: { user: null } });
      const user = await auth.getUser();
      expect(user).toBeNull();
    });
  });

  describe('getSession', () => {
    it('returns AuthSession when session exists', async () => {
      mockGetSession.mockResolvedValue({
        data: { session: { user: { id: 'u1', email: 'a@b.com' }, access_token: 'tok123' } },
      });
      const session = await auth.getSession();
      expect(session).toEqual({
        user: { id: 'u1', email: 'a@b.com' },
        accessToken: 'tok123',
      });
    });

    it('returns null when no session', async () => {
      mockGetSession.mockResolvedValue({ data: { session: null } });
      const session = await auth.getSession();
      expect(session).toBeNull();
    });
  });

  describe('signInWithPassword', () => {
    it('returns session on success', async () => {
      mockSignInWithPassword.mockResolvedValue({
        data: { session: { user: { id: 'u1', email: 'a@b.com' }, access_token: 'tok' } },
        error: null,
      });
      const session = await auth.signInWithPassword('a@b.com', 'pass');
      expect(session.user.id).toBe('u1');
      expect(session.accessToken).toBe('tok');
    });

    it('throws on error', async () => {
      mockSignInWithPassword.mockResolvedValue({ data: {}, error: new Error('Bad creds') });
      await expect(auth.signInWithPassword('a@b.com', 'wrong')).rejects.toThrow('Bad creds');
    });
  });

  describe('signUp', () => {
    it('returns session on success', async () => {
      mockSignUp.mockResolvedValue({
        data: { session: { user: { id: 'u2', email: 'new@b.com' }, access_token: 'tok2' } },
        error: null,
      });
      const session = await auth.signUp('new@b.com', 'pass');
      expect(session.user.email).toBe('new@b.com');
    });

    it('throws when no session returned', async () => {
      mockSignUp.mockResolvedValue({ data: { session: null }, error: null });
      await expect(auth.signUp('x@y.com', 'pass')).rejects.toThrow('no session returned');
    });
  });

  describe('signInWithOAuth', () => {
    it('delegates to supabase auth', async () => {
      mockSignInWithOAuth.mockResolvedValue({ error: null });
      await auth.signInWithOAuth('google');
      expect(mockSignInWithOAuth).toHaveBeenCalledWith({ provider: 'google' });
    });

    it('throws on error', async () => {
      mockSignInWithOAuth.mockResolvedValue({ error: new Error('OAuth failed') });
      await expect(auth.signInWithOAuth('github')).rejects.toThrow('OAuth failed');
    });
  });

  describe('signOut', () => {
    it('delegates to supabase auth', async () => {
      mockSignOut.mockResolvedValue({});
      await auth.signOut();
      expect(mockSignOut).toHaveBeenCalledWith({ scope: 'local' });
    });
  });

  describe('onAuthStateChange', () => {
    it('subscribes and returns unsubscribe function', () => {
      const unsubscribeFn = vi.fn();
      mockOnAuthStateChange.mockReturnValue({ data: { subscription: { unsubscribe: unsubscribeFn } } });

      const callback = vi.fn();
      const unsub = auth.onAuthStateChange(callback);

      expect(mockOnAuthStateChange).toHaveBeenCalled();
      unsub();
      expect(unsubscribeFn).toHaveBeenCalled();
    });

    it('converts session to AuthSession format', () => {
      let capturedCallback: (event: string, session: unknown) => void = () => {};
      mockOnAuthStateChange.mockImplementation((cb: typeof capturedCallback) => {
        capturedCallback = cb;
        return { data: { subscription: { unsubscribe: vi.fn() } } };
      });

      const callback = vi.fn();
      auth.onAuthStateChange(callback);

      // Simulate auth event
      capturedCallback('SIGNED_IN', {
        user: { id: 'u1', email: 'a@b.com' },
        access_token: 'tok',
      });

      expect(callback).toHaveBeenCalledWith('SIGNED_IN', {
        user: { id: 'u1', email: 'a@b.com' },
        accessToken: 'tok',
      });
    });

    it('passes null session through', () => {
      let capturedCallback: (event: string, session: unknown) => void = () => {};
      mockOnAuthStateChange.mockImplementation((cb: typeof capturedCallback) => {
        capturedCallback = cb;
        return { data: { subscription: { unsubscribe: vi.fn() } } };
      });

      const callback = vi.fn();
      auth.onAuthStateChange(callback);

      capturedCallback('SIGNED_OUT', null);

      expect(callback).toHaveBeenCalledWith('SIGNED_OUT', null);
    });
  });
});

// ═══════════════════════════════════════════════════════
// SupabaseSearchAdapter
// ═══════════════════════════════════════════════════════

describe('SupabaseSearchAdapter', () => {
  let search: SupabaseSearchAdapter;

  beforeEach(() => {
    vi.clearAllMocks();
    search = new SupabaseSearchAdapter();
  });

  it('delegates to searchAll service', async () => {
    const results = [{ entityType: 'task', entityId: 't1', title: 'Test', preview: '', rank: 1, path: '/tasks' }];
    mockSearchAll.mockResolvedValue(results);

    const result = await search.searchAll('test', 10);

    expect(mockSearchAll).toHaveBeenCalledWith('test', 10);
    expect(result).toEqual(results);
  });

  it('passes undefined limit when not specified', async () => {
    mockSearchAll.mockResolvedValue([]);
    await search.searchAll('query');
    expect(mockSearchAll).toHaveBeenCalledWith('query', undefined);
  });
});
