/**
 * Heartbeat Prompt Template — Sprint 37 P3
 *
 * Optimized prompt for proactive AI insights.
 * Runs in background, max 150 tokens, focuses on actionable items.
 */

import type { AppContext } from '../ai/prompt-assembler';
import type { SoulConfig } from '../ai/types';
import { format } from 'date-fns';

export interface HeartbeatContext {
  soul: SoulConfig | null;
  appContext: AppContext | null;
}

/**
 * Build the heartbeat prompt.
 * Much shorter than conversational prompts — optimized for quick, actionable insights.
 */
export function buildHeartbeatPrompt(ctx: HeartbeatContext): string {
  const now = new Date();
  const time = format(now, 'h:mm a');
  const date = format(now, 'EEEE, MMMM d, yyyy');
  const userName = ctx.soul?.userName || 'the user';
  const conciergeName = ctx.soul?.name || 'Flow Assistant';

  const prompt = `You are ${conciergeName}, acting as ${userName}'s proactive assistant.

## Current Time
${date}, ${time}

## Context
${buildContextSummary(ctx.appContext)}

## Task
Analyze the current context and identify ONE of the following:
1. **Urgent items** that need immediate attention
2. **Scheduling conflicts** or time management issues
3. **Patterns** or insights worth noting
4. **Proactive suggestions** to help ${userName} stay on track

## Response Format
- If you find something actionable, respond with a concise insight (max 2 sentences, no preamble)
- If nothing needs attention, respond with exactly: "NO_ACTION"
- Be specific and direct — this is a notification, not a conversation

Examples:
✅ "You have 3 overdue tasks. Consider tackling [task name] first."
✅ "Your 2pm meeting overlaps with focus time blocked for [project]."
✅ "You've journaled daily for 7 days — momentum is building!"
❌ "Let me help you with your tasks today." (too vague)
❌ "I noticed you have some tasks..." (too conversational)`;

  return prompt;
}

/**
 * Build a condensed context summary for the heartbeat prompt.
 * Much shorter than the full app context layer.
 */
function buildContextSummary(ctx: AppContext | null): string {
  if (!ctx) return 'No context available.';

  const lines: string[] = [];

  // Overdue (highest priority)
  if (ctx.overdueTasks.length > 0) {
    const overdueList = ctx.overdueTasks
      .slice(0, 3)
      .map((t) => `${t.title} (${t.dueDate})`)
      .join(', ');
    lines.push(`**Overdue (${ctx.overdueTasks.length}):** ${overdueList}${ctx.overdueTasks.length > 3 ? '...' : ''}`);
  }

  // Tasks due today
  const pendingToday = ctx.tasksDueToday.filter((t) => t.status !== 'done');
  if (pendingToday.length > 0) {
    const todayList = pendingToday
      .slice(0, 3)
      .map((t) => t.title)
      .join(', ');
    lines.push(`**Due today (${pendingToday.length}):** ${todayList}${pendingToday.length > 3 ? '...' : ''}`);
  }

  // Upcoming (next 3 days)
  if (ctx.upcomingTasks.length > 0) {
    const upcomingList = ctx.upcomingTasks
      .slice(0, 2)
      .map((t) => `${t.title} (${t.dueDate})`)
      .join(', ');
    lines.push(`**Upcoming:** ${upcomingList}`);
  }

  // Meetings
  if (ctx.todaysMeetings.length > 0) {
    const meetingList = ctx.todaysMeetings
      .slice(0, 2)
      .map((m) => {
        const start = m.startTime ? format(new Date(m.startTime), 'h:mm a') : '?';
        return `${m.title} (${start})`;
      })
      .join(', ');
    lines.push(`**Meetings (${ctx.todaysMeetings.length}):** ${meetingList}`);
  }

  // Journal status
  if (ctx.journalEntriesToday > 0) {
    lines.push(`Journal: ${ctx.journalEntriesToday} entries today`);
  }

  // Routines
  if (ctx.routinesTotal > 0) {
    lines.push(`Routines: ${ctx.routinesCompletedToday}/${ctx.routinesTotal} complete`);
  }

  // Projects
  if (ctx.activeProjects.length > 0) {
    const projectList = ctx.activeProjects
      .slice(0, 2)
      .map((p) => p.name)
      .join(', ');
    lines.push(`**Projects:** ${projectList}`);
  }

  return lines.length > 0 ? lines.join('\n') : 'No tasks, meetings, or active projects.';
}
