/**
 * Data Adapter Interfaces — Sprint 20 P4
 *
 * Abstracts all data operations behind a uniform interface so the app
 * can swap between Supabase (web) and local SQLite (desktop) backends
 * without changing any component or hook code.
 *
 * Design principles:
 *  - userId is injected at adapter construction, not per-call
 *  - Return types are app-level (Task, not Tables<'tasks'>)
 *  - Converters (snake_case → camelCase, null → default) live inside adapters
 *  - Input types mirror what services currently accept
 */

import type {
  Task,
  Subtask,
  JournalEntry,
  Capture,
  Topic,
  TopicPage,
  Tag,
  RoutineItem,
  RoutineGroup,
  RoutineCompletion,
  Habit,
  HabitCompletion,
  Meeting,
  Project,
  ProjectNote,
  TaskStatus,
  TaskPriority,
  ProjectStatus,
  HabitType,
  TimeBlock,
  HabitSchedule,
  RecurrenceRule,
} from '@/types';

// ═══════════════════════════════════════════════════════
// Input Types — what callers pass to create/update
// ═══════════════════════════════════════════════════════

// ─── Tasks ───

export interface CreateTaskInput {
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string;
  startDate?: string;
  tags: string[];
  topicIds: string[];
  projectId?: string;
  sourceLink?: string;
  recurrence?: RecurrenceRule;
  completedAt?: Date;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string | null;
  startDate?: string | null;
  tags?: string[];
  topicIds?: string[];
  projectId?: string | null;
  sourceLink?: string | null;
  recurrence?: RecurrenceRule | null;
  completedAt?: Date | null;
}

// ─── Subtasks ───

export interface CreateSubtaskInput {
  taskId: string;
  title: string;
}

export interface UpdateSubtaskInput {
  title?: string;
  completed?: boolean;
  completedAt?: Date | null;
  tags?: string[];
}

// ─── Journal ───

export interface CreateJournalInput {
  date: string;
  content: string;
  tags: string[];
  topicIds: string[];
  moodScore?: number;
  label?: string;
}

export interface UpdateJournalInput {
  content?: string;
  tags?: string[];
  topicIds?: string[];
  moodScore?: number | null;
  label?: string | null;
}

// ─── Captures ───

export interface CreateCaptureInput {
  content: string;
  source: 'journal' | 'quick' | 'task' | 'video';
  sourceId?: string;
  date: string;
  tags: string[];
  topicIds: string[];
}

export interface UpdateCaptureInput {
  content?: string;
  tags?: string[];
  topicIds?: string[];
}

// ─── Topics ───

export interface CreateTopicInput {
  name: string;
  description?: string;
  content?: string;
  icon?: string;
  parentId?: string;
}

export interface UpdateTopicInput {
  name?: string;
  description?: string;
  content?: string;
  icon?: string;
}

// ─── Topic Pages ───

export interface CreateTopicPageInput {
  topicId: string;
  name: string;
  description?: string;
  content?: string;
}

export interface UpdateTopicPageInput {
  name?: string;
  description?: string;
  content?: string;
}

// ─── Tags ───

export interface CreateTagInput {
  name: string;
  color?: string;
}

// ─── Routines ───

export interface CreateRoutineInput {
  name: string;
  icon?: string;
  order?: number;
  groupId?: string;
}

export interface UpdateRoutineInput {
  name?: string;
  icon?: string;
  order?: number;
  groupId?: string | null;
}

// ─── Routine Groups ───

export interface CreateRoutineGroupInput {
  name: string;
  icon?: string;
  color?: string;
  order?: number;
}

export interface UpdateRoutineGroupInput {
  name?: string;
  icon?: string;
  color?: string;
  order?: number;
}

// ─── Habits ───

export interface CreateHabitInput {
  name: string;
  icon?: string;
  color?: string;
  type?: HabitType;
  timeBlock?: TimeBlock;
  schedule?: HabitSchedule;
  targetCount?: number;
  order?: number;
}

export interface UpdateHabitInput {
  name?: string;
  icon?: string;
  color?: string;
  type?: HabitType;
  timeBlock?: TimeBlock;
  schedule?: HabitSchedule;
  targetCount?: number;
  strength?: number;
  currentStreak?: number;
  bestStreak?: number;
  isArchived?: boolean;
  order?: number;
  groupId?: string | null;
}

// ─── Meetings ───

export interface CreateMeetingInput {
  title: string;
  startTime: Date;
  endTime: Date;
  location?: string;
  description?: string;
  attendees?: string[];
  isExternal: boolean;
  source?: 'google' | 'outlook' | 'manual';
}

export interface UpdateMeetingInput {
  title?: string;
  startTime?: Date;
  endTime?: Date;
  location?: string | null;
  description?: string | null;
  attendees?: string[];
  isExternal?: boolean;
  source?: 'google' | 'outlook' | 'manual';
}

// ─── Projects ───

export interface CreateProjectInput {
  name: string;
  description?: string;
  topicId?: string;
  status: ProjectStatus;
  color?: string;
  icon?: string;
  startDate?: string;
  endDate?: string;
}

export interface UpdateProjectInput {
  name?: string;
  description?: string | null;
  topicId?: string | null;
  status?: ProjectStatus;
  color?: string | null;
  icon?: string | null;
  startDate?: string | null;
  endDate?: string | null;
}

// ─── Project Notes ───

export interface CreateProjectNoteInput {
  projectId: string;
  content: string;
}

export interface UpdateProjectNoteInput {
  content?: string;
}

// ─── Search ───

export interface SearchResult {
  entityType: string;
  entityId: string;
  title: string;
  preview: string;
  rank: number;
  metadata?: Record<string, unknown>;
  path: string;
}

// ═══════════════════════════════════════════════════════
// Entity Adapter Interfaces
// ═══════════════════════════════════════════════════════

export interface TaskAdapter {
  fetchAll(): Promise<Task[]>;
  create(input: CreateTaskInput): Promise<Task>;
  update(id: string, input: UpdateTaskInput): Promise<void>;
  delete(id: string): Promise<void>;
}

export interface SubtaskAdapter {
  fetchAll(): Promise<Subtask[]>;
  create(input: CreateSubtaskInput): Promise<Subtask>;
  update(id: string, input: UpdateSubtaskInput): Promise<void>;
  delete(id: string): Promise<void>;
  reorder(taskId: string, subtaskIds: string[]): Promise<void>;
}

export interface JournalAdapter {
  fetchAll(): Promise<JournalEntry[]>;
  create(input: CreateJournalInput): Promise<JournalEntry>;
  update(id: string, input: UpdateJournalInput): Promise<void>;
  delete(id: string): Promise<void>;
}

export interface CaptureAdapter {
  fetchAll(): Promise<Capture[]>;
  create(input: CreateCaptureInput): Promise<Capture>;
  update(id: string, input: UpdateCaptureInput): Promise<void>;
  delete(id: string): Promise<void>;
}

export interface TopicAdapter {
  fetchAll(): Promise<Topic[]>;
  create(input: CreateTopicInput): Promise<Topic>;
  update(id: string, input: UpdateTopicInput): Promise<Topic>;
  delete(id: string): Promise<void>;
}

export interface TopicPageAdapter {
  fetchAll(): Promise<TopicPage[]>;
  create(input: CreateTopicPageInput): Promise<TopicPage>;
  update(id: string, input: UpdateTopicPageInput): Promise<TopicPage>;
  delete(id: string): Promise<void>;
}

export interface TagAdapter {
  fetchAll(): Promise<Tag[]>;
  create(input: CreateTagInput): Promise<Tag>;
}

export interface RoutineAdapter {
  fetchAll(): Promise<RoutineItem[]>;
  create(input: CreateRoutineInput): Promise<RoutineItem>;
  update(id: string, input: UpdateRoutineInput): Promise<void>;
  delete(id: string): Promise<void>;
}

export interface RoutineGroupAdapter {
  fetchAll(): Promise<RoutineGroup[]>;
  create(input: CreateRoutineGroupInput): Promise<RoutineGroup>;
  update(id: string, input: UpdateRoutineGroupInput): Promise<void>;
  delete(id: string): Promise<void>;
}

export interface RoutineCompletionAdapter {
  /** Fetches completions within the lookback window (default: 90 days) */
  fetchAll(): Promise<RoutineCompletion[]>;
  toggle(routineId: string, date: string, isCompleted: boolean): Promise<void>;
}

export interface HabitAdapter {
  fetchAll(): Promise<Habit[]>;
  create(input: CreateHabitInput): Promise<Habit>;
  update(id: string, input: UpdateHabitInput): Promise<void>;
  delete(id: string): Promise<void>;
  archive(id: string): Promise<void>;
  updateStrengthAndStreak(id: string, strength: number, currentStreak: number, bestStreak: number): Promise<void>;
}

export interface HabitCompletionAdapter {
  /** Fetches completions within the lookback window (default: 365 days) */
  fetchAll(): Promise<HabitCompletion[]>;
  toggle(habitId: string, date: string, isCurrentlyCompleted: boolean): Promise<void>;
  incrementCount(habitId: string, date: string, currentCount: number): Promise<void>;
}

export interface MeetingAdapter {
  fetchAll(): Promise<Meeting[]>;
  create(input: CreateMeetingInput): Promise<Meeting>;
  update(id: string, input: UpdateMeetingInput): Promise<void>;
  delete(id: string): Promise<void>;
}

export interface ProjectAdapter {
  fetchAll(): Promise<Project[]>;
  create(input: CreateProjectInput): Promise<Project>;
  update(id: string, input: UpdateProjectInput): Promise<void>;
  delete(id: string): Promise<void>;
}

export interface ProjectNoteAdapter {
  fetchAll(): Promise<ProjectNote[]>;
  create(input: CreateProjectNoteInput): Promise<ProjectNote>;
  update(id: string, input: UpdateProjectNoteInput): Promise<void>;
  delete(id: string): Promise<void>;
}

// ═══════════════════════════════════════════════════════
// Top-Level Adapter Interfaces
// ═══════════════════════════════════════════════════════

/**
 * DataAdapter — unified interface for all entity CRUD operations.
 *
 * Implementations:
 *  - SupabaseAdapter: wraps existing service layer (web)
 *  - LocalAdapter: SQLite via tauri-plugin-sql (desktop)
 */
export interface DataAdapter {
  /** One-time setup (open DB connection, run migrations, etc.) */
  initialize(): Promise<void>;

  /** Teardown (close DB connections, flush writes) */
  dispose(): Promise<void>;

  /** Entity sub-adapters */
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
}

/**
 * AuthAdapter — authentication operations.
 *
 * Implementations:
 *  - SupabaseAuthAdapter: Supabase Auth (web)
 *  - LocalAuthAdapter: no-op / offline token (desktop)
 */
export interface AuthUser {
  id: string;
  email?: string;
}

export interface AuthSession {
  user: AuthUser;
  accessToken: string;
}

export interface AuthAdapter {
  /** Get the currently authenticated user (null if signed out) */
  getUser(): Promise<AuthUser | null>;

  /** Get the current session */
  getSession(): Promise<AuthSession | null>;

  /** Email + password sign-in */
  signInWithPassword(email: string, password: string): Promise<AuthSession>;

  /** Email + password sign-up */
  signUp(email: string, password: string): Promise<AuthSession>;

  /** OAuth sign-in (Google, GitHub, etc.) */
  signInWithOAuth(provider: string): Promise<void>;

  /** Sign out */
  signOut(): Promise<void>;

  /** Subscribe to auth state changes. Returns an unsubscribe function. */
  onAuthStateChange(callback: (event: string, session: AuthSession | null) => void): () => void;
}

/**
 * SearchAdapter — full-text search across all entity types.
 *
 * Implementations:
 *  - SupabaseSearchAdapter: RPC call to search_all() (web)
 *  - LocalSearchAdapter: SQLite FTS5 queries (desktop)
 */
export interface SearchAdapter {
  searchAll(query: string, limit?: number): Promise<SearchResult[]>;
}

/**
 * FileAdapter — local file system operations for the vault.
 *
 * Only used in desktop (Tauri) mode. Web mode returns a no-op stub.
 *
 * Implementations:
 *  - TauriFileAdapter: tauri-plugin-fs (desktop)
 *  - NoOpFileAdapter: throws or returns empty (web)
 */
export interface FileAdapter {
  readFile(path: string): Promise<string>;
  writeFile(path: string, content: string): Promise<void>;
  deleteFile(path: string): Promise<void>;
  exists(path: string): Promise<boolean>;
  listDir(path: string): Promise<FileEntry[]>;
  watchDir(path: string, callback: (event: FileWatchEvent) => void): Promise<() => void>;
}

export interface FileEntry {
  name: string;
  path: string;
  isDirectory: boolean;
  size?: number;
  modifiedAt?: Date;
}

export interface FileWatchEvent {
  type: 'create' | 'modify' | 'delete';
  path: string;
}

// ═══════════════════════════════════════════════════════
// Attachment Adapter — file attachments for entities
// ═══════════════════════════════════════════════════════

/**
 * AttachmentAdapter — manages file attachments associated with topics/notes.
 *
 * Implementations:
 *  - LocalAttachmentAdapter: Tauri fs → `.attachments/{entityId}/`
 *  - SupabaseAttachmentAdapter: Supabase Storage bucket
 *  - NoOpAttachmentAdapter: no-op stub (when storage unavailable)
 */
export interface AttachmentAdapter {
  uploadFile(entityId: string, file: File): Promise<AttachmentInfo>;
  deleteFile(entityId: string, filename: string): Promise<void>;
  getFileUrl(entityId: string, filename: string): Promise<string>;
  listFiles(entityId: string): Promise<AttachmentInfo[]>;
}

export interface AttachmentInfo {
  name: string;
  size: number;
  mimeType: string;
  url: string;
  createdAt: Date;
}

// ═══════════════════════════════════════════════════════
// Adapter Provider — runtime adapter access
// ═══════════════════════════════════════════════════════

/**
 * The complete adapter set for the current runtime environment.
 * Created once at app startup, injected via React context.
 */
export interface AdapterSet {
  data: DataAdapter;
  auth: AuthAdapter;
  search: SearchAdapter;
  file: FileAdapter;
  attachments: AttachmentAdapter;
}
