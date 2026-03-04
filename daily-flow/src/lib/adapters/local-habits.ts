/**
 * Local Entity Adapters — Habits & HabitCompletions
 */

import type {
  HabitAdapter,
  HabitCompletionAdapter,
  CreateHabitInput,
  UpdateHabitInput,
} from './types';

import type { Habit, HabitCompletion } from '@/types';

import type { TauriDatabase, SearchIndexer } from './local-types';
import { uuid, now, parseJSON, rethrow } from './local-types';

// ─── Habits ───

export class LocalHabitAdapter implements HabitAdapter {
  constructor(
    private db: TauriDatabase,
    private indexer?: SearchIndexer,
  ) {}
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
      if (this.indexer)
        try {
          await this.indexer.upsert('habit', id, input.name, '', '{}');
        } catch {
          /* non-fatal */
        }
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
        const [r] = await this.db.select<Array<Record<string, unknown>>>(
          'SELECT name, is_archived FROM routines WHERE id = $1',
          [id],
        );
        if (r) {
          if (r.is_archived as number) {
            await this.indexer.remove('habit', id);
          } else {
            await this.indexer.upsert('habit', id, r.name as string, '', '{}');
          }
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
      if (this.indexer)
        try {
          await this.indexer.remove('habit', id);
        } catch {
          /* non-fatal */
        }
    } catch (e) {
      rethrow('Habit', 'delete', e);
    }
  }
  async archive(id: string): Promise<void> {
    try {
      await this.db.execute('UPDATE routines SET is_archived = 1, updated_at = $1 WHERE id = $2', [now(), id]);
      if (this.indexer)
        try {
          await this.indexer.remove('habit', id);
        } catch {
          /* non-fatal */
        }
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
        await this.db.execute('INSERT INTO routine_completions (id, routine_id, date, count) VALUES ($1,$2,$3,1)', [
          uuid(),
          habitId,
          date,
        ]);
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
