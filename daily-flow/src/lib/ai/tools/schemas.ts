/**
 * Concierge Tool Schemas — Sprint 24 P8, Sprint 35-36
 *
 * JSON Schema definitions for all concierge tools.
 * These are sent to the LLM as function calling / tool-use definitions.
 * Format follows OpenAI's function calling spec (widely compatible).
 *
 * Design: Schemas are the highest-leverage layer for multi-LLM reliability.
 * - additionalProperties: false prevents hallucinated extra params
 * - Explicit required: [] for schemas with no required params
 * - Rich descriptions tell the model what, when, and what NOT to use
 * - Enums constrain the decision space for weaker models
 */

export interface ToolSchema {
  name: string;
  description: string;
  parameters: {
    type: 'object';
    properties: Record<string, { type: string; description: string; enum?: string[] }>;
    required?: string[];
    additionalProperties?: false;
  };
}

// ─── Create Tools ───

export const CREATE_TASK: ToolSchema = {
  name: 'create_task',
  description:
    'Create a new task in the user\'s workspace. Use this when the user asks to add a task, todo, reminder, or action item. Returns {id, title, dueDate}. Example: create_task({title: "Review quarterly report", due_date: "today", priority: "high"}). Do NOT use get_tasks or complete_task to create tasks.',
  parameters: {
    type: 'object',
    properties: {
      title: { type: 'string', description: 'The task title. Example: "Buy groceries" or "Review PR #42"' },
      description: { type: 'string', description: 'Optional detailed description' },
      due_date: {
        type: 'string',
        description: 'Due date. Use "today" for today, "tomorrow" for tomorrow, or YYYY-MM-DD format.',
      },
      priority: { type: 'string', description: 'Task priority', enum: ['low', 'medium', 'high'] },
      project_name: { type: 'string', description: 'Name of an existing project to assign this task to' },
    },
    required: ['title'],
    additionalProperties: false,
  },
};

export const CREATE_JOURNAL_ENTRY: ToolSchema = {
  name: 'create_journal_entry',
  description: 'Create a new journal entry. Use when the user wants to write, journal, or log their thoughts.',
  parameters: {
    type: 'object',
    properties: {
      content: { type: 'string', description: 'The journal entry content (markdown supported)' },
      date: { type: 'string', description: 'Date in YYYY-MM-DD format. Defaults to today.' },
      label: { type: 'string', description: 'Optional label/title for the entry' },
      mood_score: { type: 'number', description: 'Mood score 1-5 (1=bad, 5=great)' },
    },
    required: ['content'],
    additionalProperties: false,
  },
};

export const CREATE_CALENDAR_EVENT: ToolSchema = {
  name: 'create_calendar_event',
  description:
    'Create a calendar event or meeting. Use when the user mentions a meeting, appointment, or time-specific event.',
  parameters: {
    type: 'object',
    properties: {
      title: { type: 'string', description: 'Event title' },
      date: { type: 'string', description: 'Date in YYYY-MM-DD format' },
      start_time: { type: 'string', description: 'Start time in HH:MM format (24h). Example: "14:30"' },
      end_time: { type: 'string', description: 'End time in HH:MM format (24h). Defaults to 1 hour after start.' },
      description: { type: 'string', description: 'Optional event description' },
      location: { type: 'string', description: 'Optional location' },
    },
    required: ['title', 'date', 'start_time'],
    additionalProperties: false,
  },
};

export const CREATE_CAPTURE: ToolSchema = {
  name: 'create_capture',
  description: 'Quick-capture a thought, idea, or note. Use for quick brain dumps or fleeting thoughts.',
  parameters: {
    type: 'object',
    properties: {
      content: { type: 'string', description: 'The captured thought or note' },
      tags: { type: 'string', description: 'Comma-separated tags' },
    },
    required: ['content'],
    additionalProperties: false,
  },
};

export const CREATE_NOTE: ToolSchema = {
  name: 'create_note',
  description: 'Create a note in a topic. Use when the user wants to save structured content under a topic.',
  parameters: {
    type: 'object',
    properties: {
      title: { type: 'string', description: 'Note page title' },
      content: { type: 'string', description: 'Note content (markdown supported)' },
      topic_name: { type: 'string', description: 'Topic to file this note under' },
    },
    required: ['title'],
    additionalProperties: false,
  },
};

// ─── Read/Search Tools ───

export const SEARCH: ToolSchema = {
  name: 'search',
  description:
    'Search across all entities (tasks, journal, notes, captures, projects) by keyword. Use when the user asks to find or look up something specific. Returns up to 15 results with {type, title, detail}. Do NOT use this for listing all tasks — use get_tasks instead.',
  parameters: {
    type: 'object',
    properties: {
      query: { type: 'string', description: 'Search query text. Example: "quarterly report"' },
      entity_type: {
        type: 'string',
        description: 'Limit search to a specific type. Omit to search all.',
        enum: ['task', 'journal', 'capture', 'note', 'project'],
      },
    },
    required: ['query'],
    additionalProperties: false,
  },
};

export const GET_TASKS: ToolSchema = {
  name: 'get_tasks',
  description:
    'Get tasks with optional filters. Use when the user asks about their tasks, todos, or what they need to do. Returns up to 20 tasks as {title, status, priority, dueDate, subtasks}. To find overdue tasks, set due_date to "overdue". To find tasks this week, set due_date to "this_week". Call with NO arguments to get all tasks. Do NOT use the "search" tool for task listing — use this tool.',
  parameters: {
    type: 'object',
    properties: {
      status: {
        type: 'string',
        description: 'Filter by status',
        enum: ['backlog', 'todo', 'doing', 'blocked', 'done', 'all'],
      },
      priority: { type: 'string', description: 'Filter by priority', enum: ['low', 'medium', 'high'] },
      due_date: {
        type: 'string',
        description:
          'Filter by due date. Use "today", "tomorrow", "overdue" (past due, not done), "this_week" (next 7 days), or a specific YYYY-MM-DD date.',
      },
      project_name: { type: 'string', description: 'Filter by project name' },
    },
    required: [],
    additionalProperties: false,
  },
};

export const GET_JOURNAL: ToolSchema = {
  name: 'get_journal',
  description:
    'Get journal entries. Defaults to today. Use when the user asks about their journal or what they wrote. Returns entries with {label, content, mood, timestamp}.',
  parameters: {
    type: 'object',
    properties: {
      date: { type: 'string', description: 'Date in YYYY-MM-DD format. Defaults to today.' },
    },
    required: [],
    additionalProperties: false,
  },
};

export const GET_CALENDAR: ToolSchema = {
  name: 'get_calendar',
  description:
    'Get calendar events/meetings. Defaults to today. Use when the user asks about their schedule. Returns events with {title, startTime, endTime, location}.',
  parameters: {
    type: 'object',
    properties: {
      date: { type: 'string', description: 'Date in YYYY-MM-DD format. Defaults to today.' },
    },
    required: [],
    additionalProperties: false,
  },
};

export const GET_ROUTINES: ToolSchema = {
  name: 'get_routines',
  description:
    'Get routines and habits with completion status. Use when the user asks about their routines, habits, or daily checklist. Returns {name, type, completed} for each routine/habit.',
  parameters: {
    type: 'object',
    properties: {
      date: { type: 'string', description: 'Date in YYYY-MM-DD format. Defaults to today.' },
    },
    required: [],
    additionalProperties: false,
  },
};

export const GET_NOTES: ToolSchema = {
  name: 'get_notes',
  description: 'Get notes for a specific topic. Use when the user asks about notes in a topic.',
  parameters: {
    type: 'object',
    properties: {
      topic_name: { type: 'string', description: 'The topic name to get notes from' },
    },
    required: ['topic_name'],
    additionalProperties: false,
  },
};

export const GET_CAPTURES: ToolSchema = {
  name: 'get_captures',
  description:
    'Get recent captures/quick notes sorted by recency. Use when the user asks about their captures or inbox. Returns {content, date, tags}.',
  parameters: {
    type: 'object',
    properties: {
      limit: { type: 'number', description: 'Max number of captures to return. Default 10.' },
    },
    required: [],
    additionalProperties: false,
  },
};

export const GET_PROJECTS: ToolSchema = {
  name: 'get_projects',
  description:
    'List projects. When the user says "my projects" or "all projects", call this with NO arguments to return ALL projects (planning, active, paused, completed). Only pass a status filter when the user explicitly asks for a single status. Returns {name, status, description}.',
  parameters: {
    type: 'object',
    properties: {
      status: {
        type: 'string',
        description:
          'ONLY use this to filter by a single status when the user explicitly asks. Omit this parameter to return ALL projects.',
        enum: ['planning', 'active', 'paused', 'completed', 'all'],
      },
    },
    required: [],
    additionalProperties: false,
  },
};

// ─── Update/Complete Tools ───

export const COMPLETE_TASK: ToolSchema = {
  name: 'complete_task',
  description:
    'Mark a task as done/completed. Use when the user says they finished, completed, or checked off a task. Requires a task_title that matches an existing task (fuzzy match supported). Do NOT use this to create tasks — use create_task instead.',
  parameters: {
    type: 'object',
    properties: {
      task_title: {
        type: 'string',
        description:
          'Title or partial title of the task to complete. Will search for the best match. Example: "Review PR"',
      },
    },
    required: ['task_title'],
    additionalProperties: false,
  },
};

export const UPDATE_TASK: ToolSchema = {
  name: 'update_task',
  description:
    'Modify an existing task (title, due date, priority, status). Use when the user wants to change a task property.',
  parameters: {
    type: 'object',
    properties: {
      task_title: { type: 'string', description: 'Title or partial title of the task to update' },
      new_title: { type: 'string', description: 'New title' },
      due_date: { type: 'string', description: 'New due date (YYYY-MM-DD, "today", or "tomorrow")' },
      priority: { type: 'string', description: 'New priority', enum: ['low', 'medium', 'high'] },
      status: { type: 'string', description: 'New status', enum: ['backlog', 'todo', 'doing', 'blocked', 'done'] },
    },
    required: ['task_title'],
    additionalProperties: false,
  },
};

export const LOG_ROUTINE: ToolSchema = {
  name: 'log_routine',
  description:
    'Check off / log a routine completion. Use when the user says they did a routine or want to mark it done.',
  parameters: {
    type: 'object',
    properties: {
      routine_name: { type: 'string', description: 'Name or partial name of the routine' },
      date: { type: 'string', description: 'Date in YYYY-MM-DD format. Defaults to today.' },
    },
    required: ['routine_name'],
    additionalProperties: false,
  },
};

export const LOG_HABIT: ToolSchema = {
  name: 'log_habit',
  description: 'Log a habit completion. Use when the user mentions completing a habit or tracking a habit entry.',
  parameters: {
    type: 'object',
    properties: {
      habit_name: { type: 'string', description: 'Name or partial name of the habit' },
      date: { type: 'string', description: 'Date in YYYY-MM-DD format. Defaults to today.' },
    },
    required: ['habit_name'],
    additionalProperties: false,
  },
};

// ─── Memory Tools (Sprint 24 P7) ───

export const REMEMBER_USER_FACT: ToolSchema = {
  name: 'remember_user_fact',
  description:
    'Save something to long-term memory about the user. Use when the user says "remember this", "keep in mind", "note that I...", or explicitly asks you to remember a preference, fact, or detail about themselves.',
  parameters: {
    type: 'object',
    properties: {
      content: {
        type: 'string',
        description:
          'The fact, preference, or detail to remember. Write from the user\'s perspective, e.g. "Prefers dark mode" or "Has a dog named Max".',
      },
      category: {
        type: 'string',
        description: 'Category of the memory',
        enum: ['preference', 'fact', 'goal', 'relationship', 'pattern'],
      },
    },
    required: ['content', 'category'],
    additionalProperties: false,
  },
};

// ─── All Tools ───

export const ALL_TOOLS: ToolSchema[] = [
  // Create
  CREATE_TASK,
  CREATE_JOURNAL_ENTRY,
  CREATE_CALENDAR_EVENT,
  CREATE_CAPTURE,
  CREATE_NOTE,
  // Read/Search
  SEARCH,
  GET_TASKS,
  GET_JOURNAL,
  GET_CALENDAR,
  GET_ROUTINES,
  GET_NOTES,
  GET_CAPTURES,
  GET_PROJECTS,
  // Update/Complete
  COMPLETE_TASK,
  UPDATE_TASK,
  LOG_ROUTINE,
  LOG_HABIT,
  // Memory
  REMEMBER_USER_FACT,
];

/** Convert our tool schemas to OpenAI function calling format */
export function toOpenAITools(tools: ToolSchema[]) {
  return tools.map((t) => ({
    type: 'function' as const,
    function: {
      name: t.name,
      description: t.description,
      parameters: t.parameters,
    },
  }));
}

/** Convert our tool schemas to Anthropic tool-use format */
export function toAnthropicTools(tools: ToolSchema[]) {
  return tools.map((t) => ({
    name: t.name,
    description: t.description,
    input_schema: t.parameters,
  }));
}
