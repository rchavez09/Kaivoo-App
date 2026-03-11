/**
 * System Prompt Assembler — Sprint 24 P6
 *
 * 6-layer system prompt that makes the concierge actually know you.
 * Replaces the old 2-line buildSystemPrompt() in settings.ts.
 *
 * Layers:
 *   1. Identity — name, tone, backstory
 *   2. User Profile — SoulConfig fields
 *   3. Memories — top-N from ai_memories
 *   4. Recent Conversations — last 3-5 summaries
 *   5. App Context — tasks due today, calendar, journal status, projects
 *   6. Behavioral Rules — depth, guardrails, tool instructions
 */

import type { SoulConfig, AIDepth, AIMemory, AIConversationSummary } from './types';
import { format } from 'date-fns';
import { getMemories, getSummaries } from './memory-service';
import { getSoulConfig, getAISettings } from './settings';

// ─── Layer Builders ───

function buildIdentityLayer(soul: SoulConfig | null): string {
  const name = soul?.name || 'Flow Assistant';
  const tone = soul?.tone || 'casual';

  const toneDesc: Record<string, string> = {
    professional: 'clear, direct, and professional',
    casual: 'friendly, warm, and conversational',
    playful: 'fun, energetic, and lighthearted',
  };

  let layer = `You are ${name}, a ${toneDesc[tone] || 'friendly'} AI concierge for Flow — a personal knowledge operating system.`;

  if (soul?.backstory) {
    layer += `\n\nAbout you: ${soul.backstory}`;
  }

  return layer;
}

function buildUserProfileLayer(soul: SoulConfig | null): string {
  if (!soul) return '';

  const parts: string[] = [];

  if (soul.userName) {
    parts.push(`The user's name is ${soul.userName}.`);
  }
  if (soul.workingStyle) {
    parts.push(`Working style: ${soul.workingStyle}`);
  }
  if (soul.communicationNotes) {
    parts.push(`Communication preferences: ${soul.communicationNotes}`);
  }
  if (soul.goals?.length) {
    parts.push(`Current goals: ${soul.goals.join('; ')}`);
  }

  return parts.length > 0 ? `## About the User\n${parts.join('\n')}` : '';
}

function buildMemoriesLayer(memories: AIMemory[]): string {
  if (memories.length === 0) return '';

  const grouped: Record<string, string[]> = {};
  for (const m of memories) {
    const cat = m.category;
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(m.content);
  }

  const lines: string[] = ['## Things You Remember About the User'];
  for (const [category, items] of Object.entries(grouped)) {
    lines.push(`**${category}s:** ${items.join('. ')}`);
  }

  return lines.join('\n');
}

function buildConversationLayer(summaries: AIConversationSummary[]): string {
  if (summaries.length === 0) return '';

  const lines = ['## Recent Conversation Context'];
  for (const s of summaries) {
    lines.push(`- ${s.summary}`);
    if (s.keyFacts.length > 0) {
      lines.push(`  Key facts: ${s.keyFacts.join(', ')}`);
    }
  }

  return lines.join('\n');
}

export interface AppContext {
  tasksDueToday: Array<{ title: string; priority: string; status: string }>;
  upcomingTasks: Array<{ title: string; priority: string; dueDate: string }>;
  overdueTasks: Array<{ title: string; priority: string; dueDate: string }>;
  todaysMeetings: Array<{ title: string; startTime: string; endTime: string }>;
  journalEntriesToday: number;
  activeProjects: Array<{ name: string; status: string; description?: string }>;
  routinesCompletedToday: number;
  routinesTotal: number;
  recentCaptures: Array<{ content: string; date: string }>;
}

function buildAppContextLayer(ctx: AppContext | null): string {
  if (!ctx) return '';

  const today = format(new Date(), 'EEEE, MMMM d, yyyy');
  const lines = [`## Today (${today})`];

  // Overdue tasks
  if (ctx.overdueTasks.length > 0) {
    lines.push(`**Overdue tasks (${ctx.overdueTasks.length}):**`);
    for (const t of ctx.overdueTasks.slice(0, 5)) {
      lines.push(`- ${t.title} [${t.priority}] — was due ${t.dueDate}`);
    }
    if (ctx.overdueTasks.length > 5) lines.push(`  ...and ${ctx.overdueTasks.length - 5} more`);
  }

  // Tasks due today
  const pendingTasks = ctx.tasksDueToday.filter((t) => t.status !== 'done');
  if (pendingTasks.length > 0) {
    lines.push(`**Tasks due today (${pendingTasks.length}):**`);
    for (const t of pendingTasks.slice(0, 10)) {
      lines.push(`- ${t.title} [${t.priority}]`);
    }
    if (pendingTasks.length > 10) lines.push(`  ...and ${pendingTasks.length - 10} more`);
  } else {
    lines.push('No tasks due today.');
  }

  // Upcoming tasks (next 7 days)
  if (ctx.upcomingTasks.length > 0) {
    lines.push(`**Upcoming tasks (next 7 days, ${ctx.upcomingTasks.length}):**`);
    for (const t of ctx.upcomingTasks.slice(0, 8)) {
      lines.push(`- ${t.title} [${t.priority}] — due ${t.dueDate}`);
    }
    if (ctx.upcomingTasks.length > 8) lines.push(`  ...and ${ctx.upcomingTasks.length - 8} more`);
  }

  // Meetings
  if (ctx.todaysMeetings.length > 0) {
    lines.push(`**Meetings (${ctx.todaysMeetings.length}):**`);
    for (const m of ctx.todaysMeetings) {
      const start = m.startTime ? format(new Date(m.startTime), 'h:mm a') : '?';
      const end = m.endTime ? format(new Date(m.endTime), 'h:mm a') : '?';
      lines.push(`- ${m.title} (${start} – ${end})`);
    }
  }

  // Journal
  if (ctx.journalEntriesToday > 0) {
    lines.push(`Journal: ${ctx.journalEntriesToday} entries written today.`);
  }

  // Routines
  if (ctx.routinesTotal > 0) {
    lines.push(`Routines: ${ctx.routinesCompletedToday}/${ctx.routinesTotal} completed today.`);
  }

  // Active projects
  if (ctx.activeProjects.length > 0) {
    lines.push(`**Active projects (${ctx.activeProjects.length}):**`);
    for (const p of ctx.activeProjects.slice(0, 5)) {
      lines.push(`- ${p.name}${p.description ? `: ${p.description}` : ''}`);
    }
  }

  // Recent captures
  if (ctx.recentCaptures.length > 0) {
    lines.push(`**Recent captures (${ctx.recentCaptures.length}):**`);
    for (const c of ctx.recentCaptures.slice(0, 5)) {
      lines.push(`- "${c.content}" (${c.date})`);
    }
  }

  return lines.join('\n');
}

function buildBehavioralLayer(depth: AIDepth, hasTools: boolean): string {
  const depthRule: Record<string, string> = {
    light: 'Keep responses brief — a few sentences at most. Be concise.',
    medium: 'Provide moderate detail. Explain when helpful, but stay focused.',
    heavy: 'Be thorough and detailed. Provide full explanations and context.',
  };

  const rules = [
    depthRule[depth] || depthRule.medium,
    'If the user asks you to remember something, acknowledge it and confirm you will remember.',
    'When referencing user data (tasks, journal, calendar), be specific — cite titles and dates.',
    "Never fabricate data the user hasn't told you or that isn't in the app context above.",
  ];

  if (hasTools) {
    rules.push(
      "You have access to tools that can create, read, update, and complete items in the user's Flow workspace.",
      'ALWAYS use tools (get_tasks, get_projects, get_calendar, etc.) when the user asks about their data. Do NOT say you cannot see something — use the appropriate tool to fetch it.',
      'For overdue tasks, use get_tasks with due_date="overdue". For upcoming tasks, use due_date="this_week". For all projects, use get_projects WITHOUT a status filter.',
      'Use tools when the user asks you to take action (create tasks, log routines, search notes, etc.).',
      'For ambiguous references, search first to confirm the correct item before modifying it.',
      'For destructive actions (delete, bulk changes), confirm with the user before proceeding.',
      'For complex requests like "morning briefing" or "summarize my day", chain multiple read tools (get_tasks, get_calendar, get_journal, get_routines) to gather data, then synthesize a response.',
      'For requests like "summarize my journal" or "what did I write about X", use get_journal to fetch entries, then summarize them in your response.',
      'For requests like "draft a project brief", use get_projects and get_tasks to gather project data, then compose the brief.',
      'You can call multiple tools in sequence — use read tools first to gather context, then write tools to take action.',
      'After creating an item (task, event, etc.), tell the user where to find it in the app (e.g. "You can find it on the Today page or in Tasks").',
    );
  } else {
    rules.push(
      'The "Today" section above contains a snapshot of tasks due today, overdue tasks, upcoming tasks, active projects, routines, and recent captures. Reference this context to answer overview questions.',
    );
  }

  return `## Rules\n${rules.map((r) => `- ${r}`).join('\n')}`;
}

// ─── Main Assembler ───

export interface PromptAssemblerInput {
  soul: SoulConfig | null;
  depth: AIDepth;
  memories: AIMemory[];
  summaries: AIConversationSummary[];
  appContext: AppContext | null;
  hasTools: boolean;
}

export function assembleSystemPrompt(input: PromptAssemblerInput): string {
  const layers = [
    buildIdentityLayer(input.soul),
    buildUserProfileLayer(input.soul),
    buildMemoriesLayer(input.memories),
    buildConversationLayer(input.summaries),
    buildAppContextLayer(input.appContext),
    buildBehavioralLayer(input.depth, input.hasTools),
  ].filter(Boolean);

  return layers.join('\n\n');
}

/**
 * Quick estimate of token count for the assembled prompt.
 * Uses the ~4 chars per token heuristic (English text).
 */
export function estimateTokens(prompt: string): number {
  return Math.ceil(prompt.length / 4);
}

// ─── Deterministic Context Assembly (Layer 1-2) ───

/**
 * assembleConciergeContext — Sprint 30 P9
 *
 * Single entry point that deterministically builds the full system prompt
 * from structured data sources. All inputs come from database reads or
 * store state — never from AI-generated text.
 *
 * Data sources:
 *   - Soul file (localStorage/settings)
 *   - AI settings (localStorage/settings)
 *   - Memories (SQLite or localStorage)
 *   - Conversation summaries (SQLite or localStorage)
 *   - App context (Zustand store snapshot)
 */
export async function assembleConciergeContext(appContext: AppContext | null, hasTools = true): Promise<string> {
  const soul = getSoulConfig();
  const settings = getAISettings();
  const allMemories = await getMemories();
  const activeMemories = allMemories.filter((m) => m.active);
  const summaries = await getSummaries();

  return assembleSystemPrompt({
    soul,
    depth: settings.depth,
    memories: activeMemories,
    summaries,
    appContext,
    hasTools,
  });
}
