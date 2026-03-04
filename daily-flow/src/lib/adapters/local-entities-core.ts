/**
 * Local Entity Adapters — Core (barrel re-export)
 *
 * Split into focused modules:
 *   local-tasks.ts    — Tasks & Subtasks
 *   local-journal.ts  — Journal & Captures
 *   local-topics.ts   — Topics, TopicPages & Tags
 */

export { LocalTaskAdapter, LocalSubtaskAdapter } from './local-tasks';
export { LocalJournalAdapter, LocalCaptureAdapter } from './local-journal';
export { LocalTopicAdapter, LocalTopicPageAdapter, LocalTagAdapter } from './local-topics';
