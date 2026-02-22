import { Task, Subtask, JournalEntry, Capture, Meeting, RoutineItem, RoutineGroup, Topic, TopicPage, Tag } from '@/types';

let counter = 0;
const nextId = (prefix: string) => `${prefix}-test-${++counter}`;

export const createTask = (overrides: Partial<Task> = {}): Task => ({
  id: nextId('task'),
  title: 'Test task',
  status: 'todo',
  priority: 'medium',
  tags: [],
  topicIds: [],
  subtasks: [],
  createdAt: new Date('2026-01-01'),
  ...overrides,
});

export const createSubtask = (overrides: Partial<Subtask> = {}): Subtask => ({
  id: nextId('subtask'),
  title: 'Test subtask',
  completed: false,
  tags: [],
  ...overrides,
});

export const createJournalEntry = (overrides: Partial<JournalEntry> = {}): JournalEntry => ({
  id: nextId('journal'),
  content: 'Test journal content',
  date: '2026-01-01',
  tags: [],
  topicIds: [],
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
  timestamp: new Date('2026-01-01T09:00:00'),
  ...overrides,
});

export const createCapture = (overrides: Partial<Capture> = {}): Capture => ({
  id: nextId('capture'),
  content: 'Test capture',
  source: 'quick',
  date: '2026-01-01',
  tags: [],
  topicIds: [],
  createdAt: new Date('2026-01-01'),
  ...overrides,
});

export const createMeeting = (overrides: Partial<Meeting> = {}): Meeting => ({
  id: nextId('meeting'),
  title: 'Test meeting',
  startTime: new Date('2026-01-01T10:00:00'),
  endTime: new Date('2026-01-01T11:00:00'),
  isExternal: false,
  ...overrides,
});

export const createRoutine = (overrides: Partial<RoutineItem> = {}): RoutineItem => ({
  id: nextId('routine'),
  name: 'Test routine',
  order: 0,
  ...overrides,
});

export const createRoutineGroup = (overrides: Partial<RoutineGroup> = {}): RoutineGroup => ({
  id: nextId('group'),
  name: 'Test group',
  order: 0,
  createdAt: new Date('2026-01-01'),
  ...overrides,
});

export const createTopic = (overrides: Partial<Topic> = {}): Topic => ({
  id: nextId('topic'),
  name: 'Test topic',
  createdAt: new Date('2026-01-01'),
  ...overrides,
});

export const createTopicPage = (overrides: Partial<TopicPage> = {}): TopicPage => ({
  id: nextId('page'),
  topicId: 'topic-test-1',
  name: 'Test page',
  createdAt: new Date('2026-01-01'),
  ...overrides,
});

export const createTag = (overrides: Partial<Tag> = {}): Tag => ({
  id: nextId('tag'),
  name: 'test-tag',
  ...overrides,
});

export const resetCounter = () => { counter = 0; };
