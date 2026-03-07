/**
 * Adapter Layer — Sprint 20 P4/P5/P6
 *
 * Re-exports all adapter types and provides the React context
 * for injecting the active adapter set at runtime.
 */

export type {
  // Top-level adapters
  DataAdapter,
  AuthAdapter,
  SearchAdapter,
  FileAdapter,
  AdapterSet,
  // Entity adapters
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
  ConversationAdapter,
  CoherenceLogAdapter,
  // Input types
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
  CreateConversationInput,
  UpdateConversationInput,
  CreateCoherenceSignalInput,
  // Auth types
  AuthUser,
  AuthSession,
  // Search types
  SearchResult,
  // File types
  FileEntry,
  FileWatchEvent,
} from './types';

export { AdapterProvider, useAdapters, useDataAdapter, useVault } from './provider';
