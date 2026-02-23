// Barrel exports for the tasks subfolder
export { default as TaskSection } from './TaskSection';
export { default as SortableTaskRow, TaskRow } from './SortableTaskRow';
export type { TaskRowProps } from './SortableTaskRow';
export { default as AddToTodayPicker } from './AddToTodayPicker';

export {
  TasksWidgetConfigDialog,
  useTasksWidgetSettings,
  AVAILABLE_BUILTIN_SECTIONS,
  DEFAULT_SETTINGS,
} from './TasksWidgetConfig';
export type {
  BuiltInSectionId,
  SectionId,
  TasksWidgetSection,
  TasksWidgetSettings,
} from './TasksWidgetConfig';

export {
  isDueToday,
  isOverdue,
  isDueThisWeek,
  wasCompletedOnDate,
  wasCompletedToday,
  getTasksForSection,
  getSectionDisplayConfig,
  statusConfig,
} from './task-section-utils';
export type {
  TaskVariant,
  SectionDisplayConfig,
} from './task-section-utils';
