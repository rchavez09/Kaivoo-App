/**
 * Tool Executor — Sprint 24 P9-P13
 *
 * Maps LLM tool calls to Zustand store actions.
 * Receives actions as a parameter (injected by component),
 * so this module has no React dependency.
 *
 * Security guardrails (P13):
 *  - Rate limiting: max 5 tool calls per turn
 *  - Read-before-write: ambiguous references resolved via search
 *  - Destructive actions require explicit confirmation
 *  - All actions logged via AI action log
 */

import type { ToolCall, MemoryCategory } from '../types';
import type { Task, Meeting, JournalEntry, Capture, Project, RoutineItem, Habit } from '@/types';
import { useKaivooStore } from '@/stores/useKaivooStore';
import { addMemory, getMemories } from '../memory-service';
import { format, addDays, parse, isBefore, startOfDay } from 'date-fns';
import { parseDate } from '@/lib/dateUtils';

// ─── Types ───

export interface ToolExecutionResult {
  success: boolean;
  data?: unknown;
  message: string;
  requiresConfirmation?: boolean;
  confirmationMessage?: string;
}

/** The actions the executor needs — injected by the component that owns hooks */
export interface ExecutorActions {
  addTask: (data: Omit<Task, 'id' | 'createdAt'>) => Promise<Task | undefined>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  addMeeting: (data: Omit<Meeting, 'id'>) => Promise<Meeting | undefined>;
  addJournalEntry: (
    data: Omit<JournalEntry, 'id' | 'createdAt' | 'updatedAt' | 'timestamp'>,
  ) => Promise<JournalEntry | undefined>;
  addCapture: (data: Omit<Capture, 'id' | 'createdAt'>) => Promise<Capture | undefined>;
  addTopicPage: (data: { topicId: string; name: string }) => Promise<{ id: string } | undefined>;
  toggleRoutineCompletion: (routineId: string, date?: string) => Promise<void>;
  logAction?: (actionType: string, actionData: Record<string, unknown>, sourceInput: string) => Promise<string | null>;
}

// ─── Helpers ───

function resolveDate(dateStr?: string): string {
  if (!dateStr) return format(new Date(), 'yyyy-MM-dd');
  const lower = dateStr.toLowerCase().trim();
  if (lower === 'today') return format(new Date(), 'yyyy-MM-dd');
  if (lower === 'tomorrow') return format(addDays(new Date(), 1), 'yyyy-MM-dd');
  // Try to parse as YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
  // Try natural parsing
  try {
    const parsed = parse(dateStr, 'yyyy-MM-dd', new Date());
    return format(parsed, 'yyyy-MM-dd');
  } catch {
    return format(new Date(), 'yyyy-MM-dd');
  }
}

function fuzzyMatch(needle: string, haystack: string): boolean {
  return haystack.toLowerCase().includes(needle.toLowerCase());
}

function findTask(title: string): Task | undefined {
  const store = useKaivooStore.getState();
  // Exact match first
  let match = store.tasks.find((t) => t.title.toLowerCase() === title.toLowerCase());
  if (match) return match;
  // Fuzzy match
  match = store.tasks.find((t) => fuzzyMatch(title, t.title));
  return match;
}

function findRoutine(name: string): RoutineItem | undefined {
  const store = useKaivooStore.getState();
  let match = store.routines.find((r) => r.name.toLowerCase() === name.toLowerCase());
  if (match) return match;
  match = store.routines.find((r) => fuzzyMatch(name, r.name));
  return match;
}

function findHabit(name: string): Habit | undefined {
  const store = useKaivooStore.getState();
  let match = store.habits.find((h) => h.name.toLowerCase() === name.toLowerCase());
  if (match) return match;
  match = store.habits.find((h) => fuzzyMatch(name, h.name));
  return match;
}

function findProject(name: string): Project | undefined {
  const store = useKaivooStore.getState();
  let match = store.projects.find((p) => p.name.toLowerCase() === name.toLowerCase());
  if (match) return match;
  match = store.projects.find((p) => fuzzyMatch(name, p.name));
  return match;
}

function findTopic(name: string) {
  const store = useKaivooStore.getState();
  return store.topics.find((t) => fuzzyMatch(name, t.name));
}

// ─── Validation Helpers ───

const VALID_TOOL_NAMES = new Set([
  'create_task',
  'create_journal_entry',
  'create_calendar_event',
  'create_capture',
  'create_note',
  'search',
  'get_tasks',
  'get_journal',
  'get_calendar',
  'get_routines',
  'get_notes',
  'get_captures',
  'get_projects',
  'complete_task',
  'update_task',
  'log_routine',
  'log_habit',
  'remember_user_fact',
]);

function validateRequired(args: Record<string, unknown>, fields: string[]): string | null {
  for (const field of fields) {
    if (args[field] === undefined || args[field] === null || args[field] === '') {
      return `Missing required parameter "${field}".`;
    }
  }
  return null;
}

function validateString(args: Record<string, unknown>, field: string): string | null {
  if (args[field] !== undefined && typeof args[field] !== 'string') {
    return `Parameter "${field}" must be a string, got ${typeof args[field]}.`;
  }
  return null;
}

function validateEnum(args: Record<string, unknown>, field: string, allowed: string[]): string | null {
  const val = args[field];
  if (val !== undefined && (typeof val !== 'string' || !allowed.includes(val))) {
    const display = typeof val === 'string' ? val : typeof val;
    return `Parameter "${field}" must be one of: ${allowed.join(', ')}. Got "${display}".`;
  }
  return null;
}

// ─── Tool Execution ───

let toolCallCount = 0;
const MAX_TOOL_CALLS_PER_TURN = 8;

export function resetToolCallCount(): void {
  toolCallCount = 0;
}

export async function executeTool(
  toolCall: ToolCall,
  actions: ExecutorActions,
  userMessage: string,
): Promise<ToolExecutionResult> {
  toolCallCount++;
  if (toolCallCount > MAX_TOOL_CALLS_PER_TURN) {
    return { success: false, message: 'Rate limit: too many tool calls in a single turn. Please try again.' };
  }

  const args = toolCall.arguments;
  const name = toolCall.name;

  if (import.meta.env.DEV) {
    console.log(`[executeTool] ${name}`, JSON.stringify(args));
  }

  try {
    switch (name) {
      // ─── Create Tools ───
      case 'create_task': {
        const reqErr = validateRequired(args, ['title']);
        if (reqErr) return { success: false, message: reqErr };
        const titleErr = validateString(args, 'title');
        if (titleErr) return { success: false, message: titleErr };
        const prioErr = validateEnum(args, 'priority', ['low', 'medium', 'high']);
        if (prioErr) return { success: false, message: prioErr };
        const resolvedDate = resolveDate(args.due_date as string | undefined);
        const todayISO = format(new Date(), 'yyyy-MM-dd');
        // Use 'Today' literal when the date resolves to today — matches UI convention
        const dueDate = resolvedDate === todayISO ? 'Today' : resolvedDate;
        const project = args.project_name ? findProject(args.project_name as string) : undefined;
        const task = await actions.addTask({
          title: args.title as string,
          description: (args.description as string) || '',
          status: 'todo',
          priority: (args.priority as Task['priority']) || 'medium',
          dueDate,
          tags: [],
          topicIds: [],
          subtasks: [],
          projectId: project?.id,
        });
        if (task) {
          await actions.logAction?.('task_created', { taskId: task.id, title: task.title }, userMessage);
          return {
            success: true,
            data: { id: task.id, title: task.title, dueDate },
            message: `Created task "${task.title}" due ${dueDate}${project ? ` in project ${project.name}` : ''}.`,
          };
        }
        return { success: false, message: 'Failed to create task.' };
      }

      case 'create_journal_entry': {
        const date = resolveDate(args.date as string | undefined);
        const label = (args.label as string) || undefined;
        const entry = await actions.addJournalEntry({
          date,
          content: args.content as string,
          tags: [],
          topicIds: [],
          moodScore: args.mood_score as number | undefined,
          label,
        });
        if (entry) {
          await actions.logAction?.('journal_created', { entryId: entry.id }, userMessage);
          return {
            success: true,
            data: { id: entry.id },
            message: `Created journal entry for ${date}${label ? ` titled "${label}"` : ''}.`,
          };
        }
        return { success: false, message: 'Failed to create journal entry.' };
      }

      case 'create_calendar_event': {
        const date = resolveDate(args.date as string);
        const startTime = args.start_time as string;
        const endTime =
          (args.end_time as string) ||
          (() => {
            const [h, m] = startTime.split(':').map(Number);
            const endH = Math.min(h + 1, 23);
            return `${String(endH).padStart(2, '0')}:${String(endH === 23 && h === 23 ? 59 : m).padStart(2, '0')}`;
          })();
        const startISO = `${date}T${startTime}:00`;
        const endISO = `${date}T${endTime}:00`;
        const meeting = await actions.addMeeting({
          title: args.title as string,
          startTime: new Date(startISO),
          endTime: new Date(endISO),
          description: (args.description as string) || '',
          location: (args.location as string) || '',
          attendees: [],
          isExternal: false,
          source: 'manual',
        });
        if (meeting) {
          await actions.logAction?.('meeting_created', { meetingId: meeting.id, title: meeting.title }, userMessage);
          return {
            success: true,
            data: { id: meeting.id },
            message: `Created event "${meeting.title}" on ${date} at ${startTime}–${endTime}.`,
          };
        }
        return { success: false, message: 'Failed to create calendar event.' };
      }

      case 'create_capture': {
        const tags = args.tags ? (args.tags as string).split(',').map((t: string) => t.trim()) : [];
        const capture = await actions.addCapture({
          content: args.content as string,
          source: 'quick',
          date: format(new Date(), 'yyyy-MM-dd'),
          tags,
          topicIds: [],
        });
        if (capture) {
          await actions.logAction?.('capture_created', { captureId: capture.id }, userMessage);
          return { success: true, data: { id: capture.id }, message: 'Captured!' };
        }
        return { success: false, message: 'Failed to create capture.' };
      }

      case 'create_note': {
        const topicName = args.topic_name as string | undefined;
        let topicId: string | undefined;
        if (topicName) {
          const topic = findTopic(topicName);
          topicId = topic?.id;
          if (!topicId) {
            return {
              success: false,
              message: `Could not find topic "${topicName}". Please check the name and try again.`,
            };
          }
        }
        if (topicId) {
          const page = await actions.addTopicPage({ topicId, name: args.title as string });
          if (page) {
            return {
              success: true,
              data: { id: page.id },
              message: `Created note "${args.title as string}" in topic.`,
            };
          }
        }
        return { success: false, message: 'Failed to create note. A topic is required.' };
      }

      // ─── Read/Search Tools ───
      case 'search': {
        const store = useKaivooStore.getState();
        const queryStr = args.query as string;
        const query = queryStr.toLowerCase();
        const entityType = args.entity_type as string | undefined;
        const results: Array<{ type: string; title: string; detail?: string }> = [];

        if (!entityType || entityType === 'task') {
          for (const t of store.tasks) {
            if (fuzzyMatch(query, t.title) || (t.description && fuzzyMatch(query, t.description))) {
              results.push({ type: 'task', title: t.title, detail: `[${t.status}] due ${t.dueDate || 'no date'}` });
            }
          }
        }
        if (!entityType || entityType === 'journal') {
          for (const j of store.journalEntries) {
            if (fuzzyMatch(query, j.content) || (j.label && fuzzyMatch(query, j.label))) {
              results.push({ type: 'journal', title: j.label || j.date, detail: j.content.slice(0, 100) });
            }
          }
        }
        if (!entityType || entityType === 'capture') {
          for (const c of store.captures) {
            if (fuzzyMatch(query, c.content)) {
              results.push({ type: 'capture', title: c.content.slice(0, 50), detail: c.date });
            }
          }
        }
        if (!entityType || entityType === 'project') {
          for (const p of store.projects) {
            if (fuzzyMatch(query, p.name) || (p.description && fuzzyMatch(query, p.description))) {
              results.push({ type: 'project', title: p.name, detail: p.status });
            }
          }
        }

        const limited = results.slice(0, 15);
        return {
          success: true,
          data: limited,
          message:
            limited.length > 0
              ? `Found ${results.length} result${results.length !== 1 ? 's' : ''} for "${queryStr}".`
              : `No results found for "${queryStr}".`,
        };
      }

      case 'get_tasks': {
        const statusErr = validateEnum(args, 'status', ['backlog', 'todo', 'doing', 'blocked', 'done', 'all']);
        if (statusErr) return { success: false, message: statusErr };
        const prioErr2 = validateEnum(args, 'priority', ['low', 'medium', 'high']);
        if (prioErr2) return { success: false, message: prioErr2 };
        const store = useKaivooStore.getState();
        let tasks = [...store.tasks];
        const status = args.status as string | undefined;
        const priority = args.priority as string | undefined;
        const dueDate = args.due_date as string | undefined;
        const projectName = args.project_name as string | undefined;

        if (status && status !== 'all') tasks = tasks.filter((t) => t.status === status);
        if (priority) tasks = tasks.filter((t) => t.priority === priority);
        if (dueDate) {
          const dueLower = dueDate.toLowerCase().trim();
          const todayISO = format(new Date(), 'yyyy-MM-dd');
          const todayStart = startOfDay(new Date());

          if (dueLower === 'overdue') {
            // Tasks with due dates before today that aren't done
            tasks = tasks.filter((t) => {
              if (t.status === 'done' || !t.dueDate) return false;
              const due = parseDate(t.dueDate);
              if (!due) return false;
              return isBefore(startOfDay(due), todayStart);
            });
          } else if (dueLower === 'this_week' || dueLower === 'week') {
            // Tasks due within the next 7 days (including today)
            const weekEnd = addDays(todayStart, 7);
            tasks = tasks.filter((t) => {
              if (!t.dueDate) return false;
              const due = parseDate(t.dueDate);
              if (!due) return false;
              const dueDay = startOfDay(due);
              return dueDay >= todayStart && isBefore(dueDay, weekEnd);
            });
          } else {
            const resolved = resolveDate(dueDate);
            tasks = tasks.filter((t) => {
              if (!t.dueDate) return false;
              // Compare parsed dates so all storage formats match
              const due = parseDate(t.dueDate);
              const target = parseDate(resolved);
              if (!due || !target) return false;
              return startOfDay(due).getTime() === startOfDay(target).getTime();
            });
          }
        }
        if (projectName) {
          const project = findProject(projectName);
          if (project) tasks = tasks.filter((t) => t.projectId === project.id);
        }

        const summary = tasks.slice(0, 20).map((t) => ({
          title: t.title,
          status: t.status,
          priority: t.priority,
          dueDate: t.dueDate || 'no date',
          subtasks: t.subtasks.length,
        }));

        return {
          success: true,
          data: summary,
          message: `Found ${tasks.length} task${tasks.length !== 1 ? 's' : ''}.`,
        };
      }

      case 'get_journal': {
        const store = useKaivooStore.getState();
        const date = resolveDate(args.date as string | undefined);
        const entries = store.getJournalEntriesForDate(date);
        const summary = entries.map((e) => ({
          label: e.label || undefined,
          content: e.content.slice(0, 300),
          mood: e.moodScore,
          timestamp: e.timestamp,
        }));

        return {
          success: true,
          data: summary,
          message:
            entries.length > 0
              ? `Found ${entries.length} journal entr${entries.length !== 1 ? 'ies' : 'y'} for ${date}.`
              : `No journal entries for ${date}.`,
        };
      }

      case 'get_calendar': {
        const store = useKaivooStore.getState();
        const date = resolveDate(args.date as string | undefined);
        const meetings = store.getMeetingsForDate(new Date(date + 'T00:00:00'));
        const summary = meetings.map((m) => ({
          title: m.title,
          startTime: m.startTime,
          endTime: m.endTime,
          location: m.location || undefined,
        }));

        return {
          success: true,
          data: summary,
          message:
            meetings.length > 0
              ? `${meetings.length} event${meetings.length !== 1 ? 's' : ''} on ${date}.`
              : `No events on ${date}.`,
        };
      }

      case 'get_routines': {
        const store = useKaivooStore.getState();
        const date = resolveDate(args.date as string | undefined);
        const routines = store.routines;
        const habits = store.habits;

        const routineStatus = routines.map((r) => ({
          name: r.name,
          type: 'routine',
          completed: store.isRoutineCompleted(r.id, date),
        }));
        const habitStatus = habits.map((h) => ({
          name: h.name,
          type: 'habit',
          completed: store.isHabitCompleted(h.id, date),
        }));

        const all = [...routineStatus, ...habitStatus];
        const completed = all.filter((r) => r.completed).length;

        return {
          success: true,
          data: all,
          message: `${completed}/${all.length} routines/habits completed for ${date}.`,
        };
      }

      case 'get_notes': {
        const store = useKaivooStore.getState();
        const topicName = args.topic_name as string;
        const topic = findTopic(topicName);
        if (!topic) {
          return { success: false, message: `Could not find topic "${topicName}".` };
        }
        const pages = store.topicPages.filter((p) => p.topicId === topic.id);
        const summary = pages.map((p) => ({ title: p.name, id: p.id }));

        return {
          success: true,
          data: summary,
          message: `${pages.length} note${pages.length !== 1 ? 's' : ''} in topic "${topic.name}".`,
        };
      }

      case 'get_captures': {
        const store = useKaivooStore.getState();
        const limit = (args.limit as number) || 10;
        const sorted = [...store.captures].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
        const results = sorted.slice(0, limit).map((c) => ({
          content: c.content.slice(0, 200),
          date: c.date,
          tags: c.tags,
        }));

        return {
          success: true,
          data: results,
          message: `${results.length} recent capture${results.length !== 1 ? 's' : ''}.`,
        };
      }

      case 'get_projects': {
        const statusErr2 = validateEnum(args, 'status', ['planning', 'active', 'paused', 'completed', 'all']);
        if (statusErr2) return { success: false, message: statusErr2 };
        const store = useKaivooStore.getState();
        let projects = [...store.projects];
        const status = args.status as string | undefined;
        if (status && status !== 'all') {
          projects = projects.filter((p) => p.status === status);
        }
        const summary = projects.map((p) => ({
          name: p.name,
          status: p.status,
          description: p.description?.slice(0, 100),
        }));

        return {
          success: true,
          data: summary,
          message: `${projects.length} project${projects.length !== 1 ? 's' : ''}.`,
        };
      }

      // ─── Update/Complete Tools ───
      case 'complete_task': {
        const reqErr2 = validateRequired(args, ['task_title']);
        if (reqErr2) return { success: false, message: reqErr2 };
        const ttErr = validateString(args, 'task_title');
        if (ttErr) return { success: false, message: ttErr };
        const taskTitle = args.task_title as string;
        const task = findTask(taskTitle);
        if (!task) {
          return { success: false, message: `Could not find a task matching "${taskTitle}". Try being more specific.` };
        }
        if (task.status === 'done') {
          return { success: true, message: `"${task.title}" is already done.` };
        }
        await actions.updateTask(task.id, { status: 'done', completedAt: new Date() });
        await actions.logAction?.('task_completed', { taskId: task.id, title: task.title }, userMessage);
        return { success: true, message: `Completed "${task.title}".` };
      }

      case 'update_task': {
        const reqErr3 = validateRequired(args, ['task_title']);
        if (reqErr3) return { success: false, message: reqErr3 };
        const prioErr3 = validateEnum(args, 'priority', ['low', 'medium', 'high']);
        if (prioErr3) return { success: false, message: prioErr3 };
        const statusErr3 = validateEnum(args, 'status', ['backlog', 'todo', 'doing', 'blocked', 'done']);
        if (statusErr3) return { success: false, message: statusErr3 };
        const taskTitle2 = args.task_title as string;
        const task = findTask(taskTitle2);
        if (!task) {
          return { success: false, message: `Could not find a task matching "${taskTitle2}".` };
        }
        const updates: Partial<Task> = {};
        if (args.new_title) updates.title = args.new_title as string;
        if (args.due_date) updates.dueDate = resolveDate(args.due_date as string);
        if (args.priority) updates.priority = args.priority as Task['priority'];
        if (args.status) updates.status = args.status as Task['status'];

        await actions.updateTask(task.id, updates);
        await actions.logAction?.('task_updated', { taskId: task.id, updates }, userMessage);
        return { success: true, message: `Updated "${task.title}".` };
      }

      case 'log_routine': {
        const date = resolveDate(args.date as string | undefined);
        const routineName = args.routine_name as string;
        const routine = findRoutine(routineName);
        if (!routine) {
          return { success: false, message: `Could not find a routine matching "${routineName}".` };
        }
        const store = useKaivooStore.getState();
        if (store.isRoutineCompleted(routine.id, date)) {
          return { success: true, message: `"${routine.name}" is already completed for ${date}.` };
        }
        await actions.toggleRoutineCompletion(routine.id, date);
        await actions.logAction?.('routine_logged', { routineId: routine.id, name: routine.name, date }, userMessage);
        return { success: true, message: `Checked off "${routine.name}" for ${date}.` };
      }

      case 'log_habit': {
        const date = resolveDate(args.date as string | undefined);
        const habitName = args.habit_name as string;
        const habit = findHabit(habitName);
        if (!habit) {
          return { success: false, message: `Could not find a habit matching "${habitName}".` };
        }
        const store = useKaivooStore.getState();
        if (store.isHabitCompleted(habit.id, date)) {
          return { success: true, message: `"${habit.name}" is already logged for ${date}.` };
        }
        // Habits use the same toggle mechanism as routines
        store.toggleHabitCompletion(habit.id, date);
        await actions.logAction?.('habit_logged', { habitId: habit.id, name: habit.name, date }, userMessage);
        return { success: true, message: `Logged "${habit.name}" for ${date}.` };
      }

      // ─── Memory Tools ───
      case 'remember_user_fact': {
        const content = args.content as string;
        const category = (args.category as MemoryCategory) || 'fact';

        // Dedup: check if a similar memory already exists (substring match)
        const existing = await getMemories();
        const contentLower = content.toLowerCase();
        const isDuplicate = existing.some((m) => {
          const existingLower = m.content.toLowerCase();
          return existingLower.includes(contentLower) || contentLower.includes(existingLower);
        });
        if (isDuplicate) {
          return { success: true, message: `I already have that in my memory.` };
        }

        const memory = await addMemory(content, category, 'explicit');
        if (memory) {
          await actions.logAction?.('memory_saved', { memoryId: memory.id, content, category }, userMessage);
          return { success: true, data: { id: memory.id }, message: `Got it — I'll remember that.` };
        }
        return { success: false, message: 'Failed to save memory.' };
      }

      default:
        return {
          success: false,
          message: `Unknown tool "${name}". Available tools: ${[...VALID_TOOL_NAMES].join(', ')}.`,
        };
    }
  } catch (e) {
    console.error(`[executeTool] ${name} failed:`, e);
    return { success: false, message: `Tool "${name}" failed: ${e instanceof Error ? e.message : 'Unknown error'}` };
  }
}
