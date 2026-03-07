/**
 * SupabaseAdapter — Sprint 20 P5
 *
 * Implements all adapter interfaces by delegating to the existing
 * service layer. The userId is injected once at construction and
 * passed through to every service call automatically.
 *
 * This preserves all existing behavior (converters, dedup logic,
 * migration guards) while exposing the uniform adapter interface.
 */

import { supabase } from '@/integrations/supabase/client';

import type {
  DataAdapter,
  AuthAdapter,
  SearchAdapter,
  TaskAdapter,
  SubtaskAdapter,
  JournalAdapter,
  CaptureAdapter,
  TopicAdapter,
  TopicPageAdapter,
  TagAdapter,
  RoutineAdapter,
  RoutineGroupAdapter,
  RoutineCompletionAdapter,
  HabitAdapter,
  HabitCompletionAdapter,
  MeetingAdapter,
  ProjectAdapter,
  ProjectNoteAdapter,
  AuthUser,
  AuthSession,
  SearchResult,
  CreateTaskInput,
  UpdateTaskInput,
  CreateSubtaskInput,
  UpdateSubtaskInput,
  CreateJournalInput,
  UpdateJournalInput,
  CreateCaptureInput,
  UpdateCaptureInput,
  CreateTopicInput,
  UpdateTopicInput,
  CreateTopicPageInput,
  UpdateTopicPageInput,
  CreateTagInput,
  CreateRoutineInput,
  UpdateRoutineInput,
  CreateRoutineGroupInput,
  UpdateRoutineGroupInput,
  CreateHabitInput,
  UpdateHabitInput,
  CreateMeetingInput,
  UpdateMeetingInput,
  CreateProjectInput,
  UpdateProjectInput,
  CreateProjectNoteInput,
  UpdateProjectNoteInput,
  ConversationAdapter,
  CoherenceLogAdapter,
  CreateConversationInput,
  UpdateConversationInput,
  CreateCoherenceSignalInput,
} from './types';

// Existing service functions — preserved as-is
import {
  fetchTasks,
  fetchSubtasks,
  createTask,
  updateTask,
  deleteTask,
  createSubtask,
  updateSubtask,
  deleteSubtask,
  reorderSubtasks,
  dbToTask,
} from '@/services/tasks.service';
import {
  fetchJournalEntries,
  createJournalEntry,
  updateJournalEntry,
  deleteJournalEntry,
  dbToJournalEntry,
} from '@/services/journal.service';
import { fetchCaptures, createCapture, updateCapture, deleteCapture, dbToCapture } from '@/services/captures.service';
import {
  fetchTopics,
  fetchTopicPages,
  fetchTags,
  createTopic,
  updateTopic,
  deleteTopic,
  createTopicPage,
  updateTopicPage,
  deleteTopicPage,
  createTag,
  dbToTopic,
  dbToTopicPage,
  dbToTag,
} from '@/services/topics.service';
import {
  fetchRoutines,
  fetchRoutineGroups,
  fetchRoutineCompletions,
  createRoutine,
  updateRoutine,
  deleteRoutine,
  createRoutineGroup,
  updateRoutineGroup,
  deleteRoutineGroup,
  toggleRoutineCompletion,
  dbToRoutine,
  dbToRoutineGroup,
} from '@/services/routines.service';
import {
  fetchHabits,
  fetchHabitCompletions,
  createHabit,
  updateHabit,
  deleteHabit,
  archiveHabit,
  toggleHabitCompletion,
  incrementHabitCount,
  updateHabitStrengthAndStreak,
  dbToHabit,
  dbToHabitCompletion,
} from '@/services/habits.service';
import { fetchMeetings, createMeeting, updateMeeting, deleteMeeting, dbToMeeting } from '@/services/meetings.service';
import { fetchProjects, createProject, updateProject, deleteProject, dbToProject } from '@/services/projects.service';
import {
  fetchProjectNotes,
  createProjectNote,
  updateProjectNote,
  deleteProjectNote,
  dbToProjectNote,
} from '@/services/project-notes.service';
import { searchAll } from '@/services/search.service';

import type { Subtask, RoutineCompletion } from '@/types';

// ═══════════════════════════════════════════════════════
// SupabaseDataAdapter
// ═══════════════════════════════════════════════════════

class SupabaseTaskAdapter implements TaskAdapter {
  constructor(private userId: string) {}

  async fetchAll() {
    const rows = await fetchTasks(this.userId);
    return rows.map((r) => dbToTask(r));
  }
  async create(input: CreateTaskInput) {
    return createTask(this.userId, { ...input, subtasks: [] });
  }
  async update(id: string, input: UpdateTaskInput) {
    return updateTask(this.userId, id, input);
  }
  async delete(id: string) {
    return deleteTask(this.userId, id);
  }
}

class SupabaseSubtaskAdapter implements SubtaskAdapter {
  constructor(private userId: string) {}

  async fetchAll() {
    const rows = await fetchSubtasks(this.userId);
    return rows.map(
      (r): Subtask => ({
        id: r.id,
        taskId: r.task_id,
        title: r.title,
        completed: r.completed,
        completedAt: r.completed_at ? new Date(r.completed_at) : undefined,
        tags: r.tags || [],
        sortOrder: r.sort_order ?? 0,
      }),
    );
  }
  async create(input: CreateSubtaskInput) {
    const result = await createSubtask(this.userId, input.taskId, input.title);
    return {
      id: result.id,
      title: result.title,
      completed: result.completed,
      taskId: input.taskId,
      tags: [],
      completedAt: undefined,
      sortOrder: result.sort_order ?? 0,
    };
  }
  async update(id: string, input: UpdateSubtaskInput) {
    return updateSubtask(this.userId, id, input);
  }
  async delete(id: string) {
    return deleteSubtask(this.userId, id);
  }
  async reorder(taskId: string, subtaskIds: string[]) {
    return reorderSubtasks(this.userId, taskId, subtaskIds);
  }
}

class SupabaseJournalAdapter implements JournalAdapter {
  constructor(private userId: string) {}

  async fetchAll() {
    const rows = await fetchJournalEntries(this.userId);
    return rows.map((r) => dbToJournalEntry(r));
  }
  async create(input: CreateJournalInput) {
    return createJournalEntry(this.userId, input);
  }
  async update(id: string, input: UpdateJournalInput) {
    return updateJournalEntry(this.userId, id, input);
  }
  async delete(id: string) {
    return deleteJournalEntry(this.userId, id);
  }
}

class SupabaseCaptureAdapter implements CaptureAdapter {
  constructor(private userId: string) {}

  async fetchAll() {
    const rows = await fetchCaptures(this.userId);
    return rows.map((r) => dbToCapture(r));
  }
  async create(input: CreateCaptureInput) {
    return createCapture(this.userId, input);
  }
  async update(id: string, input: UpdateCaptureInput) {
    return updateCapture(this.userId, id, input);
  }
  async delete(id: string) {
    return deleteCapture(this.userId, id);
  }
}

class SupabaseTopicAdapter implements TopicAdapter {
  constructor(private userId: string) {}

  async fetchAll() {
    const rows = await fetchTopics(this.userId);
    return rows.map((r) => dbToTopic(r));
  }
  async create(input: CreateTopicInput) {
    return createTopic(this.userId, input);
  }
  async update(id: string, input: UpdateTopicInput) {
    return updateTopic(this.userId, id, input);
  }
  async delete(id: string) {
    return deleteTopic(this.userId, id);
  }
}

class SupabaseTopicPageAdapter implements TopicPageAdapter {
  constructor(private userId: string) {}

  async fetchAll() {
    const rows = await fetchTopicPages(this.userId);
    return rows.map((r) => dbToTopicPage(r));
  }
  async create(input: CreateTopicPageInput) {
    return createTopicPage(this.userId, input);
  }
  async update(id: string, input: UpdateTopicPageInput) {
    return updateTopicPage(this.userId, id, input);
  }
  async delete(id: string) {
    return deleteTopicPage(this.userId, id);
  }
}

class SupabaseTagAdapter implements TagAdapter {
  constructor(private userId: string) {}

  async fetchAll() {
    const rows = await fetchTags(this.userId);
    return rows.map((r) => dbToTag(r));
  }
  async create(input: CreateTagInput) {
    return createTag(this.userId, input.name, input.color);
  }
}

class SupabaseRoutineAdapter implements RoutineAdapter {
  constructor(private userId: string) {}

  async fetchAll() {
    const rows = await fetchRoutines(this.userId);
    return rows.map((r) => dbToRoutine(r));
  }
  async create(input: CreateRoutineInput) {
    return createRoutine(this.userId, input.name, input.icon, input.order, input.groupId);
  }
  async update(id: string, input: UpdateRoutineInput) {
    return updateRoutine(this.userId, id, input);
  }
  async delete(id: string) {
    return deleteRoutine(this.userId, id);
  }
}

class SupabaseRoutineGroupAdapter implements RoutineGroupAdapter {
  constructor(private userId: string) {}

  async fetchAll() {
    const rows = await fetchRoutineGroups(this.userId);
    return rows.map((r) => dbToRoutineGroup(r));
  }
  async create(input: CreateRoutineGroupInput) {
    return createRoutineGroup(this.userId, input.name, input.icon, input.color, input.order);
  }
  async update(id: string, input: UpdateRoutineGroupInput) {
    return updateRoutineGroup(this.userId, id, input);
  }
  async delete(id: string) {
    return deleteRoutineGroup(this.userId, id);
  }
}

class SupabaseRoutineCompletionAdapter implements RoutineCompletionAdapter {
  constructor(private userId: string) {}

  async fetchAll() {
    const rows = await fetchRoutineCompletions(this.userId);
    return rows.map(
      (r): RoutineCompletion => ({
        id: r.id,
        routineId: r.routine_id,
        date: r.date,
        completedAt: new Date(r.completed_at),
      }),
    );
  }
  async toggle(routineId: string, date: string, isCompleted: boolean) {
    return toggleRoutineCompletion(this.userId, routineId, date, isCompleted);
  }
}

class SupabaseHabitAdapter implements HabitAdapter {
  constructor(private userId: string) {}

  async fetchAll() {
    const rows = await fetchHabits(this.userId);
    return rows.map((r) => dbToHabit(r));
  }
  async create(input: CreateHabitInput) {
    return createHabit(this.userId, input);
  }
  async update(id: string, input: UpdateHabitInput) {
    return updateHabit(this.userId, id, input);
  }
  async delete(id: string) {
    return deleteHabit(this.userId, id);
  }
  async archive(id: string) {
    return archiveHabit(this.userId, id);
  }
  async updateStrengthAndStreak(id: string, strength: number, currentStreak: number, bestStreak: number) {
    return updateHabitStrengthAndStreak(this.userId, id, strength, currentStreak, bestStreak);
  }
}

class SupabaseHabitCompletionAdapter implements HabitCompletionAdapter {
  constructor(private userId: string) {}

  async fetchAll() {
    const rows = await fetchHabitCompletions(this.userId);
    return rows.map((r) => dbToHabitCompletion(r));
  }
  async toggle(habitId: string, date: string, isCurrentlyCompleted: boolean) {
    return toggleHabitCompletion(this.userId, habitId, date, isCurrentlyCompleted);
  }
  async incrementCount(habitId: string, date: string, currentCount: number) {
    return incrementHabitCount(this.userId, habitId, date, currentCount);
  }
}

class SupabaseMeetingAdapter implements MeetingAdapter {
  constructor(private userId: string) {}

  async fetchAll() {
    const rows = await fetchMeetings(this.userId);
    return rows.map((r) => dbToMeeting(r));
  }
  async create(input: CreateMeetingInput) {
    return createMeeting(this.userId, input);
  }
  async update(id: string, input: UpdateMeetingInput) {
    return updateMeeting(this.userId, id, input);
  }
  async delete(id: string) {
    return deleteMeeting(this.userId, id);
  }
}

class SupabaseProjectAdapter implements ProjectAdapter {
  constructor(private userId: string) {}

  async fetchAll() {
    const rows = await fetchProjects(this.userId);
    return rows.map((r) => dbToProject(r));
  }
  async create(input: CreateProjectInput) {
    return createProject(this.userId, input);
  }
  async update(id: string, input: UpdateProjectInput) {
    return updateProject(this.userId, id, input);
  }
  async delete(id: string) {
    return deleteProject(this.userId, id);
  }
}

class SupabaseProjectNoteAdapter implements ProjectNoteAdapter {
  constructor(private userId: string) {}

  async fetchAll() {
    const rows = await fetchProjectNotes(this.userId);
    return rows.map((r) => dbToProjectNote(r));
  }
  async create(input: CreateProjectNoteInput) {
    return createProjectNote(this.userId, input);
  }
  async update(id: string, input: UpdateProjectNoteInput) {
    return updateProjectNote(this.userId, id, input);
  }
  async delete(id: string) {
    return deleteProjectNote(this.userId, id);
  }
}

// ─── AI Conversations ───

class SupabaseConversationAdapter implements ConversationAdapter {
  constructor(private userId: string) {}

  async fetchAll() {
    const { data, error } = await supabase
      .from('ai_conversations')
      .select('*')
      .eq('user_id', this.userId)
      .order('updated_at', { ascending: false })
      .limit(50);

    if (error) throw error;
    return (data ?? []).map((r) => ({
      id: r.id as string,
      title: r.title as string,
      messages: (r.messages ?? []) as import('@/lib/ai/types').ConversationMessage[],
      createdAt: r.created_at as string,
      updatedAt: r.updated_at as string,
    }));
  }

  async create(input: CreateConversationInput) {
    const messages = input.messages ? JSON.parse(input.messages).slice(-200) : [];
    const row = {
      ...(input.id ? { id: input.id } : {}),
      user_id: this.userId,
      title: input.title,
      messages,
    };

    const { data, error } = await supabase.from('ai_conversations').insert(row).select().single();
    if (error) throw error;
    return {
      id: data.id as string,
      title: data.title as string,
      messages: (data.messages ?? []) as import('@/lib/ai/types').ConversationMessage[],
      createdAt: data.created_at as string,
      updatedAt: data.updated_at as string,
    };
  }

  async update(id: string, input: UpdateConversationInput) {
    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (input.title !== undefined) updates.title = input.title;
    if (input.messages !== undefined) {
      updates.messages = JSON.parse(input.messages).slice(-200);
    }

    const { error } = await supabase.from('ai_conversations').update(updates).eq('id', id).eq('user_id', this.userId);
    if (error) throw error;
  }

  async delete(id: string) {
    const { error } = await supabase.from('ai_conversations').delete().eq('id', id).eq('user_id', this.userId);
    if (error) throw error;
  }
}

// ─── AI Coherence Log ───

class SupabaseCoherenceLogAdapter implements CoherenceLogAdapter {
  constructor(private userId: string) {}

  async fetchAll() {
    const { data, error } = await supabase
      .from('ai_coherence_log')
      .select('*')
      .eq('user_id', this.userId)
      .order('created_at', { ascending: false })
      .limit(200);

    if (error) throw error;
    return (data ?? []).map((r) => ({
      id: r.id as string,
      timestamp: r.created_at as string,
      conversationId: r.conversation_id as string,
      signal: r.signal as import('@/lib/ai/coherence-monitor').CoherenceSignal['signal'],
      severity: r.severity as import('@/lib/ai/coherence-monitor').CoherenceSignal['severity'],
      details: r.details as string,
      responseSnippet: r.response_snippet as string,
    }));
  }

  async create(input: CreateCoherenceSignalInput) {
    const row = {
      user_id: this.userId,
      conversation_id: input.conversationId,
      signal: input.signal,
      severity: input.severity,
      details: input.details,
      response_snippet: input.responseSnippet,
    };

    const { data, error } = await supabase.from('ai_coherence_log').insert(row).select().single();
    if (error) throw error;
    return {
      id: data.id as string,
      timestamp: data.created_at as string,
      conversationId: data.conversation_id as string,
      signal: data.signal as import('@/lib/ai/coherence-monitor').CoherenceSignal['signal'],
      severity: data.severity as import('@/lib/ai/coherence-monitor').CoherenceSignal['severity'],
      details: data.details as string,
      responseSnippet: data.response_snippet as string,
    };
  }
}

// ─── Main DataAdapter ───

export class SupabaseDataAdapter implements DataAdapter {
  tasks: TaskAdapter;
  subtasks: SubtaskAdapter;
  journalEntries: JournalAdapter;
  captures: CaptureAdapter;
  topics: TopicAdapter;
  topicPages: TopicPageAdapter;
  tags: TagAdapter;
  routines: RoutineAdapter;
  routineGroups: RoutineGroupAdapter;
  routineCompletions: RoutineCompletionAdapter;
  habits: HabitAdapter;
  habitCompletions: HabitCompletionAdapter;
  meetings: MeetingAdapter;
  projects: ProjectAdapter;
  projectNotes: ProjectNoteAdapter;
  conversations: ConversationAdapter;
  coherenceLog: CoherenceLogAdapter;

  constructor(private userId: string) {
    this.tasks = new SupabaseTaskAdapter(userId);
    this.subtasks = new SupabaseSubtaskAdapter(userId);
    this.journalEntries = new SupabaseJournalAdapter(userId);
    this.captures = new SupabaseCaptureAdapter(userId);
    this.topics = new SupabaseTopicAdapter(userId);
    this.topicPages = new SupabaseTopicPageAdapter(userId);
    this.tags = new SupabaseTagAdapter(userId);
    this.routines = new SupabaseRoutineAdapter(userId);
    this.routineGroups = new SupabaseRoutineGroupAdapter(userId);
    this.routineCompletions = new SupabaseRoutineCompletionAdapter(userId);
    this.habits = new SupabaseHabitAdapter(userId);
    this.habitCompletions = new SupabaseHabitCompletionAdapter(userId);
    this.meetings = new SupabaseMeetingAdapter(userId);
    this.projects = new SupabaseProjectAdapter(userId);
    this.projectNotes = new SupabaseProjectNoteAdapter(userId);
    this.conversations = new SupabaseConversationAdapter(userId);
    this.coherenceLog = new SupabaseCoherenceLogAdapter(userId);
  }

  async initialize() {
    // Supabase is already initialized via the client module.
    // No additional setup needed.
  }

  async dispose() {
    // Supabase client handles its own cleanup.
  }
}

// ═══════════════════════════════════════════════════════
// SupabaseAuthAdapter
// ═══════════════════════════════════════════════════════

export class SupabaseAuthAdapter implements AuthAdapter {
  async getUser(): Promise<AuthUser | null> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;
    return { id: user.id, email: user.email };
  }

  async getSession(): Promise<AuthSession | null> {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) return null;
    return {
      user: { id: session.user.id, email: session.user.email },
      accessToken: session.access_token,
    };
  }

  async signInWithPassword(email: string, password: string): Promise<AuthSession> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return {
      user: { id: data.session.user.id, email: data.session.user.email },
      accessToken: data.session.access_token,
    };
  }

  async signUp(email: string, password: string): Promise<AuthSession> {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: window.location.origin },
    });
    if (error) throw error;
    if (!data.session) {
      throw new Error('Sign-up succeeded but no session returned (check email confirmation)');
    }
    return {
      user: { id: data.session.user.id, email: data.session.user.email },
      accessToken: data.session.access_token,
    };
  }

  async signInWithOAuth(provider: string): Promise<void> {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: provider as 'google' | 'github',
    });
    if (error) throw error;
  }

  async signOut(): Promise<void> {
    await supabase.auth.signOut({ scope: 'local' });
  }

  onAuthStateChange(callback: (event: string, session: AuthSession | null) => void): () => void {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      callback(
        event,
        session
          ? {
              user: {
                id: session.user.id,
                email: session.user.email,
              },
              accessToken: session.access_token,
            }
          : null,
      );
    });
    return () => subscription.unsubscribe();
  }
}

// ═══════════════════════════════════════════════════════
// SupabaseSearchAdapter
// ═══════════════════════════════════════════════════════

export class SupabaseSearchAdapter implements SearchAdapter {
  async searchAll(query: string, limit?: number): Promise<SearchResult[]> {
    return searchAll(query, limit);
  }
}
