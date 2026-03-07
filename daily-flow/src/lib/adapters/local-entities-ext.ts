/**
 * Local Entity Adapters — Extended (barrel re-export)
 *
 * Split into focused modules:
 *   local-routines.ts  — Routines, RoutineGroups & RoutineCompletions
 *   local-habits.ts    — Habits & HabitCompletions
 *   local-meetings.ts  — Meetings
 *   local-projects.ts  — Projects & ProjectNotes
 */

export { LocalRoutineAdapter, LocalRoutineGroupAdapter, LocalRoutineCompletionAdapter } from './local-routines';
export { LocalHabitAdapter, LocalHabitCompletionAdapter } from './local-habits';
export { LocalMeetingAdapter } from './local-meetings';
export { LocalProjectAdapter, LocalProjectNoteAdapter } from './local-projects';
export { LocalConversationAdapter, LocalCoherenceLogAdapter } from './local-conversations';
