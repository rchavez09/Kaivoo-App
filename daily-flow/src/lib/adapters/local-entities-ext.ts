/**
 * Local Entity Adapters — Extended
 *
 * SQLite implementations for: Routines, RoutineGroups, RoutineCompletions,
 * Habits, HabitCompletions, Meetings, Projects, ProjectNotes.
 *
 * Every db call is wrapped in try/catch with a `[Entity.method]` prefix
 * for debuggable error messages.
 */

import type {
  RoutineAdapter,
  RoutineGroupAdapter,
  RoutineCompletionAdapter,
  HabitAdapter,
  HabitCompletionAdapter,
  MeetingAdapter,
  ProjectAdapter,
  ProjectNoteAdapter,
  CreateRoutineInput,
  UpdateRoutineInput,
  CreateRoutineGroupInput,
  UpdateRoutineGroupInput,
  CreateHabitInput,
  UpdateHabitInput,
  CreateMeetingInput,
  UpdateMeetingInput,
  CreateProjectInput,
  UpdateProjectInput,
  CreateProjectNoteInput,
  UpdateProjectNoteInput,
} from './types';

import type {
  RoutineItem,
  RoutineGroup,
  RoutineCompletion,
  Habit,
  HabitCompletion,
  Meeting,
  Project,
  ProjectNote,
} from '@/types';

import type { TauriDatabase, SearchIndexer } from './local-types';
import { uuid, now, parseJSON } from './local-types';

/** Re-throw with entity/method context for debuggability. */
function rethrow(entity: string, method: string, e: unknown): never {
  throw new Error(`[${entity}.${method}] ${e instanceof Error ? e.message : String(e)}`);
}

// ─── Routines ───

export class LocalRoutineAdapter implements RoutineAdapter {
  constructor(private db: TauriDatabase) {}
  async fetchAll(): Promise<RoutineItem[]> {
    try {
      const rows = await this.db.select<Array<Record<string, unknown>>>('SELECT * FROM routines WHERE entity_type = \'routine\' ORDER BY "order"');
      return rows.map((r) => ({
        id: r.id as string,
        name: r.name as string,
        icon: r.icon as string | undefined,
        order: r.order as number,
        groupId: r.group_id as string | undefined,
      }));
    } catch (e) {
      rethrow('Routine', 'fetchAll', e);
    }
  }
  async create(input: CreateRoutineInput): Promise<RoutineItem> {
    try {
      const id = uuid();
      await this.db.execute('INSERT INTO routines (id, name, icon, "order", group_id, entity_type) VALUES ($1,$2,$3,$4,$5,\'routine\')', [
        id,
        input.name,
        input.icon ?? null,
        input.order ?? 0,
        input.groupId ?? null,
      ]);
      return { id, name: input.name, icon: input.icon, order: input.order ?? 0, groupId: input.groupId };
    } catch (e) {
      rethrow('Routine', 'create', e);
    }
  }
  async update(id: string, input: UpdateRoutineInput): Promise<void> {
    const sets: string[] = [];
    const vals: unknown[] = [];
    let i = 1;
    const add = (c: string, v: unknown) => {
      sets.push(`${c} = $${i++}`);
      vals.push(v);
    };
    if (input.name !== undefined) add('name', input.name);
    if (input.icon !== undefined) add('icon', input.icon);
    if (input.order !== undefined) add('"order"', input.order);
    if (input.groupId !== undefined) add('group_id', input.groupId);
    if (sets.length === 0) return;
    try {
      vals.push(id);
      await this.db.execute(`UPDATE routines SET ${sets.join(', ')} WHERE id = $${i}`, vals);
    } catch (e) {
      rethrow('Routine', 'update', e);
    }
  }
  async delete(id: string): Promise<void> {
    try {
      await this.db.execute('DELETE FROM routines WHERE id = $1', [id]);
    } catch (e) {
      rethrow('Routine', 'delete', e);
    }
  }
}

// ─── Routine Groups ───

export class LocalRoutineGroupAdapter implements RoutineGroupAdapter {
  constructor(private db: TauriDatabase) {}
  async fetchAll(): Promise<RoutineGroup[]> {
    try {
      const rows = await this.db.select<Array<Record<string, unknown>>>(
        'SELECT * FROM routine_groups ORDER BY "order"',
      );
      return rows.map((r) => ({
        id: r.id as string,
        name: r.name as string,
        icon: r.icon as string | undefined,
        color: r.color as string | undefined,
        order: r.order as number,
        createdAt: new Date(r.created_at as string),
      }));
    } catch (e) {
      rethrow('RoutineGroup', 'fetchAll', e);
    }
  }
  async create(input: CreateRoutineGroupInput): Promise<RoutineGroup> {
    try {
      const id = uuid();
      const ts = now();
      await this.db.execute(
        'INSERT INTO routine_groups (id, name, icon, color, "order", created_at) VALUES ($1,$2,$3,$4,$5,$6)',
        [id, input.name, input.icon ?? null, input.color ?? null, input.order ?? 0, ts],
      );
      return {
        id,
        name: input.name,
        icon: input.icon,
        color: input.color,
        order: input.order ?? 0,
        createdAt: new Date(ts),
      };
    } catch (e) {
      rethrow('RoutineGroup', 'create', e);
    }
  }
  async update(id: string, input: UpdateRoutineGroupInput): Promise<void> {
    const sets: string[] = [];
    const vals: unknown[] = [];
    let i = 1;
    const add = (c: string, v: unknown) => {
      sets.push(`${c} = $${i++}`);
      vals.push(v);
    };
    if (input.name !== undefined) add('name', input.name);
    if (input.icon !== undefined) add('icon', input.icon);
    if (input.color !== undefined) add('color', input.color);
    if (input.order !== undefined) add('"order"', input.order);
    if (sets.length === 0) return;
    try {
      vals.push(id);
      await this.db.execute(`UPDATE routine_groups SET ${sets.join(', ')} WHERE id = $${i}`, vals);
    } catch (e) {
      rethrow('RoutineGroup', 'update', e);
    }
  }
  async delete(id: string): Promise<void> {
    try {
      await this.db.execute('UPDATE routines SET group_id = NULL WHERE group_id = $1', [id]);
      await this.db.execute('DELETE FROM routine_groups WHERE id = $1', [id]);
    } catch (e) {
      rethrow('RoutineGroup', 'delete', e);
    }
  }
}

// ─── Routine Completions ───

export class LocalRoutineCompletionAdapter implements RoutineCompletionAdapter {
  constructor(private db: TauriDatabase) {}
  async fetchAll(): Promise<RoutineCompletion[]> {
    try {
      const cutoff = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
      const rows = await this.db.select<Array<Record<string, unknown>>>(
        `SELECT rc.* FROM routine_completions rc
         JOIN routines r ON r.id = rc.routine_id
         WHERE r.entity_type = 'routine' AND rc.completed_at >= $1
         ORDER BY rc.completed_at DESC`,
        [cutoff],
      );
      return rows.map((r) => ({
        id: r.id as string,
        routineId: r.routine_id as string,
        date: r.date as string,
        completedAt: new Date(r.completed_at as string),
      }));
    } catch (e) {
      rethrow('RoutineCompletion', 'fetchAll', e);
    }
  }
  async toggle(routineId: string, date: string, isCompleted: boolean): Promise<void> {
    try {
      if (isCompleted) {
        await this.db.execute('DELETE FROM routine_completions WHERE routine_id = $1 AND date = $2', [
          routineId,
          date,
        ]);
      } else {
        await this.db.execute('INSERT INTO routine_completions (id, routine_id, date) VALUES ($1,$2,$3)', [
          uuid(),
          routineId,
          date,
        ]);
      }
    } catch (e) {
      rethrow('RoutineCompletion', 'toggle', e);
    }
  }
}

// ─── Habits ───

export class LocalHabitAdapter implements HabitAdapter {
  constructor(private db: TauriDatabase, private indexer?: SearchIndexer) {}
  async fetchAll(): Promise<Habit[]> {
    try {
      const rows = await this.db.select<Array<Record<string, unknown>>>(
        'SELECT * FROM routines WHERE entity_type = \'habit\' AND is_archived = 0 ORDER BY "order"',
      );
      return rows.map((r) => ({
        id: r.id as string,
        name: r.name as string,
        icon: (r.icon as string) || undefined,
        color: (r.color as string) || '#3B8C8C',
        type: ((r.type as string) || 'positive') as Habit['type'],
        timeBlock: ((r.time_block as string) || 'anytime') as Habit['timeBlock'],
        schedule: parseJSON(r.schedule as string, { type: 'daily' as const }),
        targetCount: r.target_count as number | undefined,
        strength: (r.strength as number) || 0,
        currentStreak: (r.current_streak as number) || 0,
        bestStreak: (r.best_streak as number) || 0,
        isArchived: !!(r.is_archived as number),
        order: r.order as number,
        groupId: r.group_id as string | undefined,
        createdAt: new Date(r.created_at as string),
        updatedAt: r.updated_at ? new Date(r.updated_at as string) : new Date(r.created_at as string),
      }));
    } catch (e) {
      rethrow('Habit', 'fetchAll', e);
    }
  }
  async create(input: CreateHabitInput): Promise<Habit> {
    try {
      const id = uuid();
      const ts = now();
      await this.db.execute(
        `INSERT INTO routines (id, name, icon, color, type, time_block, schedule, target_count, strength, current_streak, best_streak, is_archived, "order", entity_type, created_at, updated_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,0,0,0,0,$9,'habit',$10,$10)`,
        [
          id,
          input.name,
          input.icon ?? null,
          input.color ?? '#3B8C8C',
          input.type ?? 'positive',
          input.timeBlock ?? 'anytime',
          JSON.stringify(input.schedule ?? { type: 'daily' }),
          input.targetCount ?? null,
          input.order ?? 0,
          ts,
        ],
      );
      if (this.indexer) try { await this.indexer.upsert('habit', id, input.name, '', '{}'); } catch { /* non-fatal */ }
      return {
        id,
        name: input.name,
        icon: input.icon,
        color: input.color ?? '#3B8C8C',
        type: input.type ?? 'positive',
        timeBlock: input.timeBlock ?? 'anytime',
        schedule: input.schedule ?? { type: 'daily' },
        targetCount: input.targetCount,
        strength: 0,
        currentStreak: 0,
        bestStreak: 0,
        isArchived: false,
        order: input.order ?? 0,
        groupId: undefined,
        createdAt: new Date(ts),
        updatedAt: new Date(ts),
      };
    } catch (e) {
      rethrow('Habit', 'create', e);
    }
  }
  async update(id: string, input: UpdateHabitInput): Promise<void> {
    const sets: string[] = [];
    const vals: unknown[] = [];
    let i = 1;
    const add = (c: string, v: unknown) => {
      sets.push(`${c} = $${i++}`);
      vals.push(v);
    };
    if (input.name !== undefined) add('name', input.name);
    if (input.icon !== undefined) add('icon', input.icon);
    if (input.color !== undefined) add('color', input.color);
    if (input.type !== undefined) add('type', input.type);
    if (input.timeBlock !== undefined) add('time_block', input.timeBlock);
    if (input.schedule !== undefined) add('schedule', JSON.stringify(input.schedule));
    if (input.targetCount !== undefined) add('target_count', input.targetCount);
    if (input.strength !== undefined) add('strength', input.strength);
    if (input.currentStreak !== undefined) add('current_streak', input.currentStreak);
    if (input.bestStreak !== undefined) add('best_streak', input.bestStreak);
    if (input.isArchived !== undefined) add('is_archived', input.isArchived ? 1 : 0);
    if (input.order !== undefined) add('"order"', input.order);
    add('updated_at', now());
    try {
      vals.push(id);
      await this.db.execute(`UPDATE routines SET ${sets.join(', ')} WHERE id = $${i}`, vals);
      if (this.indexer && (input.name !== undefined || input.isArchived !== undefined)) {
        const [r] = await this.db.select<Array<Record<string, unknown>>>('SELECT name, is_archived FROM routines WHERE id = $1', [id]);
        if (r) {
          if (r.is_archived as number) { await this.indexer.remove('habit', id); }
          else { await this.indexer.upsert('habit', id, r.name as string, '', '{}'); }
        }
      }
    } catch (e) {
      rethrow('Habit', 'update', e);
    }
  }
  async delete(id: string): Promise<void> {
    try {
      await this.db.execute('DELETE FROM routine_completions WHERE routine_id = $1', [id]);
      await this.db.execute('DELETE FROM routines WHERE id = $1', [id]);
      if (this.indexer) try { await this.indexer.remove('habit', id); } catch { /* non-fatal */ }
    } catch (e) {
      rethrow('Habit', 'delete', e);
    }
  }
  async archive(id: string): Promise<void> {
    try {
      await this.db.execute('UPDATE routines SET is_archived = 1, updated_at = $1 WHERE id = $2', [now(), id]);
      if (this.indexer) try { await this.indexer.remove('habit', id); } catch { /* non-fatal */ }
    } catch (e) {
      rethrow('Habit', 'archive', e);
    }
  }
  async updateStrengthAndStreak(
    id: string,
    strength: number,
    currentStreak: number,
    bestStreak: number,
  ): Promise<void> {
    try {
      await this.db.execute(
        'UPDATE routines SET strength = $1, current_streak = $2, best_streak = $3, updated_at = $4 WHERE id = $5',
        [strength, currentStreak, bestStreak, now(), id],
      );
    } catch (e) {
      rethrow('Habit', 'updateStrengthAndStreak', e);
    }
  }
}

// ─── Habit Completions ───

export class LocalHabitCompletionAdapter implements HabitCompletionAdapter {
  constructor(private db: TauriDatabase) {}
  async fetchAll(): Promise<HabitCompletion[]> {
    try {
      const cutoff = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString();
      const rows = await this.db.select<Array<Record<string, unknown>>>(
        `SELECT rc.* FROM routine_completions rc
         JOIN routines r ON r.id = rc.routine_id
         WHERE r.entity_type = 'habit' AND rc.completed_at >= $1
         ORDER BY rc.completed_at DESC`,
        [cutoff],
      );
      return rows.map((r) => ({
        id: r.id as string,
        habitId: r.routine_id as string,
        date: r.date as string,
        count: r.count as number | undefined,
        skipped: !!(r.skipped as number),
        completedAt: new Date(r.completed_at as string),
      }));
    } catch (e) {
      rethrow('HabitCompletion', 'fetchAll', e);
    }
  }
  async toggle(habitId: string, date: string, isCurrentlyCompleted: boolean): Promise<void> {
    try {
      if (isCurrentlyCompleted) {
        await this.db.execute('DELETE FROM routine_completions WHERE routine_id = $1 AND date = $2', [habitId, date]);
      } else {
        // P5c: insert with count = 1 (not NULL)
        await this.db.execute(
          'INSERT INTO routine_completions (id, routine_id, date, count) VALUES ($1,$2,$3,1)',
          [uuid(), habitId, date],
        );
      }
    } catch (e) {
      rethrow('HabitCompletion', 'toggle', e);
    }
  }
  async incrementCount(habitId: string, date: string, currentCount: number): Promise<void> {
    try {
      const rows = await this.db.select<Array<Record<string, unknown>>>(
        'SELECT id FROM routine_completions WHERE routine_id = $1 AND date = $2',
        [habitId, date],
      );
      if (rows.length > 0) {
        await this.db.execute('UPDATE routine_completions SET count = $1 WHERE id = $2', [
          currentCount + 1,
          rows[0].id,
        ]);
      } else {
        await this.db.execute('INSERT INTO routine_completions (id, routine_id, date, count) VALUES ($1,$2,$3,1)', [
          uuid(),
          habitId,
          date,
        ]);
      }
    } catch (e) {
      rethrow('HabitCompletion', 'incrementCount', e);
    }
  }
}

// ─── Meetings ───

export class LocalMeetingAdapter implements MeetingAdapter {
  constructor(private db: TauriDatabase, private indexer?: SearchIndexer) {}
  async fetchAll(): Promise<Meeting[]> {
    try {
      const rows = await this.db.select<Array<Record<string, unknown>>>(
        'SELECT * FROM meetings ORDER BY start_time DESC',
      );
      return rows.map((r) => ({
        id: r.id as string,
        title: r.title as string,
        startTime: new Date(r.start_time as string),
        endTime: new Date(r.end_time as string),
        location: r.location as string | undefined,
        description: r.description as string | undefined,
        attendees: parseJSON(r.attendees as string, []),
        isExternal: !!(r.is_external as number),
        source: r.source as Meeting['source'],
      }));
    } catch (e) {
      rethrow('Meeting', 'fetchAll', e);
    }
  }
  async create(input: CreateMeetingInput): Promise<Meeting> {
    try {
      const id = uuid();
      await this.db.execute(
        'INSERT INTO meetings (id, title, start_time, end_time, location, description, attendees, is_external, source) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)',
        [
          id,
          input.title,
          input.startTime.toISOString(),
          input.endTime.toISOString(),
          input.location ?? null,
          input.description ?? null,
          JSON.stringify(input.attendees ?? []),
          input.isExternal ? 1 : 0,
          input.source ?? 'manual',
        ],
      );
      if (this.indexer) try { await this.indexer.upsert('meeting', id, input.title, input.description ?? '', '{}'); } catch { /* non-fatal */ }
      return { id, ...input };
    } catch (e) {
      rethrow('Meeting', 'create', e);
    }
  }
  async update(id: string, input: UpdateMeetingInput): Promise<void> {
    const sets: string[] = [];
    const vals: unknown[] = [];
    let i = 1;
    const add = (c: string, v: unknown) => {
      sets.push(`${c} = $${i++}`);
      vals.push(v);
    };
    if (input.title !== undefined) add('title', input.title);
    if (input.startTime !== undefined) add('start_time', input.startTime.toISOString());
    if (input.endTime !== undefined) add('end_time', input.endTime.toISOString());
    if (input.location !== undefined) add('location', input.location);
    if (input.description !== undefined) add('description', input.description);
    if (input.attendees !== undefined) add('attendees', JSON.stringify(input.attendees));
    if (input.isExternal !== undefined) add('is_external', input.isExternal ? 1 : 0);
    if (input.source !== undefined) add('source', input.source);
    if (sets.length === 0) return;
    try {
      vals.push(id);
      await this.db.execute(`UPDATE meetings SET ${sets.join(', ')} WHERE id = $${i}`, vals);
      if (this.indexer && (input.title !== undefined || input.description !== undefined)) {
        const [r] = await this.db.select<Array<Record<string, unknown>>>('SELECT title, description FROM meetings WHERE id = $1', [id]);
        if (r) await this.indexer.upsert('meeting', id, r.title as string, (r.description as string) ?? '', '{}');
      }
    } catch (e) {
      rethrow('Meeting', 'update', e);
    }
  }
  async delete(id: string): Promise<void> {
    try {
      await this.db.execute('DELETE FROM meetings WHERE id = $1', [id]);
      if (this.indexer) try { await this.indexer.remove('meeting', id); } catch { /* non-fatal */ }
    } catch (e) {
      rethrow('Meeting', 'delete', e);
    }
  }
}

// ─── Projects ───

export class LocalProjectAdapter implements ProjectAdapter {
  constructor(private db: TauriDatabase, private indexer?: SearchIndexer) {}
  async fetchAll(): Promise<Project[]> {
    try {
      const rows = await this.db.select<Array<Record<string, unknown>>>(
        'SELECT * FROM projects ORDER BY created_at DESC',
      );
      return rows.map((r) => ({
        id: r.id as string,
        name: r.name as string,
        description: (r.description as string) ?? undefined,
        topicId: (r.topic_id as string) ?? undefined,
        status: (r.status as Project['status']) || 'planning',
        color: (r.color as string) ?? undefined,
        icon: (r.icon as string) ?? undefined,
        startDate: (r.start_date as string) ?? undefined,
        endDate: (r.end_date as string) ?? undefined,
        createdAt: new Date(r.created_at as string),
        updatedAt: new Date(r.updated_at as string),
      }));
    } catch (e) {
      rethrow('Project', 'fetchAll', e);
    }
  }
  async create(input: CreateProjectInput): Promise<Project> {
    try {
      const id = uuid();
      const ts = now();
      await this.db.execute(
        'INSERT INTO projects (id, name, description, topic_id, status, color, icon, start_date, end_date, created_at, updated_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$10)',
        [
          id,
          input.name,
          input.description ?? null,
          input.topicId ?? null,
          input.status,
          input.color ?? null,
          input.icon ?? null,
          input.startDate ?? null,
          input.endDate ?? null,
          ts,
        ],
      );
      if (this.indexer) try { await this.indexer.upsert('project', id, input.name, input.description ?? '', '{}'); } catch { /* non-fatal */ }
      return { id, ...input, createdAt: new Date(ts), updatedAt: new Date(ts) };
    } catch (e) {
      rethrow('Project', 'create', e);
    }
  }
  async update(id: string, input: UpdateProjectInput): Promise<void> {
    const sets: string[] = [];
    const vals: unknown[] = [];
    let i = 1;
    const add = (c: string, v: unknown) => {
      sets.push(`${c} = $${i++}`);
      vals.push(v);
    };
    if (input.name !== undefined) add('name', input.name);
    if (input.description !== undefined) add('description', input.description);
    if (input.topicId !== undefined) add('topic_id', input.topicId);
    if (input.status !== undefined) add('status', input.status);
    if (input.color !== undefined) add('color', input.color);
    if (input.icon !== undefined) add('icon', input.icon);
    if (input.startDate !== undefined) add('start_date', input.startDate);
    if (input.endDate !== undefined) add('end_date', input.endDate);
    add('updated_at', now());
    try {
      vals.push(id);
      await this.db.execute(`UPDATE projects SET ${sets.join(', ')} WHERE id = $${i}`, vals);
      if (this.indexer && (input.name !== undefined || input.description !== undefined)) {
        const [r] = await this.db.select<Array<Record<string, unknown>>>('SELECT name, description FROM projects WHERE id = $1', [id]);
        if (r) await this.indexer.upsert('project', id, r.name as string, (r.description as string) ?? '', '{}');
      }
    } catch (e) {
      rethrow('Project', 'update', e);
    }
  }
  async delete(id: string): Promise<void> {
    try {
      await this.db.execute('DELETE FROM projects WHERE id = $1', [id]);
      if (this.indexer) try { await this.indexer.remove('project', id); } catch { /* non-fatal */ }
    } catch (e) {
      rethrow('Project', 'delete', e);
    }
  }
}

// ─── Project Notes ───

export class LocalProjectNoteAdapter implements ProjectNoteAdapter {
  constructor(private db: TauriDatabase, private indexer?: SearchIndexer) {}
  async fetchAll(): Promise<ProjectNote[]> {
    try {
      const rows = await this.db.select<Array<Record<string, unknown>>>(
        'SELECT * FROM project_notes ORDER BY created_at DESC',
      );
      return rows.map((r) => ({
        id: r.id as string,
        projectId: r.project_id as string,
        content: r.content as string,
        createdAt: new Date(r.created_at as string),
        updatedAt: new Date(r.updated_at as string),
      }));
    } catch (e) {
      rethrow('ProjectNote', 'fetchAll', e);
    }
  }
  async create(input: CreateProjectNoteInput): Promise<ProjectNote> {
    try {
      const id = uuid();
      const ts = now();
      await this.db.execute(
        'INSERT INTO project_notes (id, project_id, content, created_at, updated_at) VALUES ($1,$2,$3,$4,$4)',
        [id, input.projectId, input.content, ts],
      );
      if (this.indexer) try { await this.indexer.upsert('project_note', id, input.content.substring(0, 100), input.content, JSON.stringify({ projectId: input.projectId })); } catch { /* non-fatal */ }
      return { id, ...input, createdAt: new Date(ts), updatedAt: new Date(ts) };
    } catch (e) {
      rethrow('ProjectNote', 'create', e);
    }
  }
  async update(id: string, input: UpdateProjectNoteInput): Promise<void> {
    if (input.content === undefined) return;
    try {
      await this.db.execute('UPDATE project_notes SET content = $1, updated_at = $2 WHERE id = $3', [
        input.content,
        now(),
        id,
      ]);
      if (this.indexer) {
        const [r] = await this.db.select<Array<Record<string, unknown>>>('SELECT project_id FROM project_notes WHERE id = $1', [id]);
        if (r) await this.indexer.upsert('project_note', id, input.content.substring(0, 100), input.content, JSON.stringify({ projectId: r.project_id }));
      }
    } catch (e) {
      rethrow('ProjectNote', 'update', e);
    }
  }
  async delete(id: string): Promise<void> {
    try {
      await this.db.execute('DELETE FROM project_notes WHERE id = $1', [id]);
      if (this.indexer) try { await this.indexer.remove('project_note', id); } catch { /* non-fatal */ }
    } catch (e) {
      rethrow('ProjectNote', 'delete', e);
    }
  }
}
