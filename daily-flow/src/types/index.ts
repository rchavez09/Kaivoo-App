// Core data types for Kaivoo

export interface Tag {
  id: string;
  name: string;
  color?: string;
}

export interface Topic {
  id: string;
  name: string;
  parentId?: string;
  icon?: string;
  description?: string;
  createdAt: Date;
}

export interface TopicPage {
  id: string;
  topicId: string;
  name: string;
  description?: string;
  createdAt: Date;
}

export interface Capture {
  id: string;
  content: string;
  source: 'journal' | 'quick' | 'task' | 'video';
  sourceId?: string; // e.g., journal entry ID
  date: string; // YYYY-MM-DD
  tags: string[];
  topicIds: string[];
  createdAt: Date;
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
  completedAt?: Date;
  tags: string[];
}

export type TaskStatus = 'backlog' | 'todo' | 'doing' | 'blocked' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high';
export type RecurrenceType = 'daily' | 'weekly' | 'monthly';

export interface RecurrenceRule {
  type: RecurrenceType;
  interval: number; // every N days/weeks/months (default 1)
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string;
  startDate?: string;
  tags: string[];
  topicIds: string[];
  subtasks: Subtask[];
  projectId?: string;
  sourceLink?: string; // Where task was created from
  recurrence?: RecurrenceRule;
  createdAt: Date;
  completedAt?: Date;
}

export interface JournalEntry {
  id: string;
  date: string; // YYYY-MM-DD
  content: string;
  tags: string[];
  topicIds: string[];
  moodScore?: number; // 1-5 mood rating (1=rough, 5=great)
  label?: string; // Custom display name (e.g. "morning") — shown instead of timestamp
  createdAt: Date;
  updatedAt: Date;
  timestamp: Date; // Time of entry creation
}

export type ProjectStatus = 'planning' | 'active' | 'paused' | 'completed' | 'archived';

export interface Project {
  id: string;
  name: string;
  description?: string;
  topicId?: string;
  status: ProjectStatus;
  color?: string;
  icon?: string;
  startDate?: string;  // yyyy-MM-dd
  endDate?: string;     // yyyy-MM-dd
  createdAt: Date;
  updatedAt: Date;
}

export interface DailyStats {
  date: string;
  entryCount: number;
  wordCount: number;
  tasksPlanned: number;
  tasksCompleted: number;
  routineCompletion: number;
}

export interface RoutineGroup {
  id: string;
  name: string;
  icon?: string;
  color?: string;
  order: number;
  createdAt: Date;
}

export interface RoutineItem {
  id: string;
  name: string;
  icon?: string;
  order: number;
  groupId?: string;
}

export interface RoutineCompletion {
  id: string;
  routineId: string;
  date: string; // YYYY-MM-DD
  completedAt: Date;
}

export interface CalendarEvent {
  id: string;
  title: string;
  startTime: Date;
  endTime: Date;
  type: 'meeting' | 'event' | 'reminder';
  tags: string[];
  topicIds: string[];
}

export interface Meeting {
  id: string;
  title: string;
  startTime: Date;
  endTime: Date;
  location?: string;
  description?: string;
  attendees?: string[];
  isExternal: boolean; // true = from external calendar
  source?: 'google' | 'outlook' | 'manual';
}

export interface DailyPlan {
  id: string;
  date: string; // YYYY-MM-DD
  journalEntryId?: string;
  routineCompletions: RoutineCompletion[];
  priorities: string[]; // Task IDs
  createdAt: Date;
  updatedAt: Date;
}
