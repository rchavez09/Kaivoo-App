/** Centralized query key factory for React Query cache management */
export const queryKeys = {
  all: ['kaivoo'] as const,
  tasks: (userId: string) => ['kaivoo', 'tasks', userId] as const,
  subtasks: (userId: string) => ['kaivoo', 'subtasks', userId] as const,
  topics: (userId: string) => ['kaivoo', 'topics', userId] as const,
  topicPages: (userId: string) => ['kaivoo', 'topicPages', userId] as const,
  tags: (userId: string) => ['kaivoo', 'tags', userId] as const,
  journalEntries: (userId: string) => ['kaivoo', 'journalEntries', userId] as const,
  captures: (userId: string) => ['kaivoo', 'captures', userId] as const,
  meetings: (userId: string) => ['kaivoo', 'meetings', userId] as const,
  routines: (userId: string) => ['kaivoo', 'routines', userId] as const,
  routineGroups: (userId: string) => ['kaivoo', 'routineGroups', userId] as const,
  routineCompletions: (userId: string) => ['kaivoo', 'routineCompletions', userId] as const,
  projects: (userId: string) => ['kaivoo', 'projects', userId] as const,
};
