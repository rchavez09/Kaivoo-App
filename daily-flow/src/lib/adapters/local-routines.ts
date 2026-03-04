/**
 * Local Entity Adapters — Routines, RoutineGroups & RoutineCompletions
 */

import type {
  RoutineAdapter,
  RoutineGroupAdapter,
  RoutineCompletionAdapter,
  CreateRoutineInput,
  UpdateRoutineInput,
  CreateRoutineGroupInput,
  UpdateRoutineGroupInput,
} from './types';

import type { RoutineItem, RoutineGroup, RoutineCompletion } from '@/types';

import type { TauriDatabase } from './local-types';
import { uuid, now, rethrow } from './local-types';

// ─── Routines ───

export class LocalRoutineAdapter implements RoutineAdapter {
  constructor(private db: TauriDatabase) {}
  async fetchAll(): Promise<RoutineItem[]> {
    try {
      const rows = await this.db.select<Array<Record<string, unknown>>>(
        'SELECT * FROM routines WHERE entity_type = \'routine\' ORDER BY "order"',
      );
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
      await this.db.execute(
        'INSERT INTO routines (id, name, icon, "order", group_id, entity_type) VALUES ($1,$2,$3,$4,$5,\'routine\')',
        [id, input.name, input.icon ?? null, input.order ?? 0, input.groupId ?? null],
      );
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
        await this.db.execute('DELETE FROM routine_completions WHERE routine_id = $1 AND date = $2', [routineId, date]);
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
