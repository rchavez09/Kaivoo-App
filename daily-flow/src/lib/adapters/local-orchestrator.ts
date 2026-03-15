/**
 * Local Entity Adapters — Orchestrator (Agents, Skills, AgentSkills)
 * Sprint 39
 */

import type {
  AgentAdapter,
  SkillAdapter,
  CreateAgentInput,
  UpdateAgentInput,
  CreateSkillInput,
  UpdateSkillInput,
} from './types';

import type { Agent, Skill } from '@/types';
import type { TauriDatabase } from './local-types';
import { uuid, now, parseJSON, rethrow } from './local-types';

// ─── Agents ───

export class LocalAgentAdapter implements AgentAdapter {
  constructor(private db: TauriDatabase) {}

  async fetchAll(): Promise<Agent[]> {
    try {
      const rows = await this.db.select<Array<Record<string, unknown>>>(
        'SELECT * FROM agents ORDER BY created_at DESC',
      );
      return rows.map((r) => this.toAgent(r));
    } catch (e) {
      rethrow('Agent', 'fetchAll', e);
    }
  }

  async create(input: CreateAgentInput): Promise<Agent> {
    try {
      const id = uuid();
      const ts = now();
      await this.db.execute(
        'INSERT INTO agents (id, name, description, model, system_prompt, permissions, is_active, created_at, updated_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$8)',
        [
          id,
          input.name,
          input.description ?? null,
          input.model ?? null,
          input.systemPrompt ?? null,
          JSON.stringify(input.permissions ?? []),
          input.isActive !== false ? 1 : 0,
          ts,
        ],
      );
      return {
        id,
        name: input.name,
        description: input.description ?? null,
        model: input.model ?? null,
        systemPrompt: input.systemPrompt ?? null,
        permissions: input.permissions ?? [],
        isActive: input.isActive !== false,
        createdAt: new Date(ts),
        updatedAt: new Date(ts),
      };
    } catch (e) {
      rethrow('Agent', 'create', e);
    }
  }

  async update(id: string, input: UpdateAgentInput): Promise<void> {
    const sets: string[] = [];
    const vals: unknown[] = [];
    let i = 1;
    const add = (c: string, v: unknown) => {
      sets.push(`${c} = $${i++}`);
      vals.push(v);
    };
    if (input.name !== undefined) add('name', input.name);
    if (input.description !== undefined) add('description', input.description);
    if (input.model !== undefined) add('model', input.model);
    if (input.systemPrompt !== undefined) add('system_prompt', input.systemPrompt);
    if (input.permissions !== undefined) add('permissions', JSON.stringify(input.permissions));
    if (input.isActive !== undefined) add('is_active', input.isActive ? 1 : 0);
    add('updated_at', now());
    try {
      vals.push(id);
      await this.db.execute(`UPDATE agents SET ${sets.join(', ')} WHERE id = $${i}`, vals);
    } catch (e) {
      rethrow('Agent', 'update', e);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.db.execute('DELETE FROM agents WHERE id = $1', [id]);
    } catch (e) {
      rethrow('Agent', 'delete', e);
    }
  }

  async getSkills(agentId: string): Promise<Skill[]> {
    try {
      const rows = await this.db.select<Array<Record<string, unknown>>>(
        'SELECT s.* FROM skills s INNER JOIN agent_skills ags ON s.id = ags.skill_id WHERE ags.agent_id = $1 ORDER BY s.name',
        [agentId],
      );
      return rows.map((r) => toSkill(r));
    } catch (e) {
      rethrow('Agent', 'getSkills', e);
    }
  }

  async assignSkill(agentId: string, skillId: string): Promise<void> {
    try {
      await this.db.execute(
        'INSERT OR IGNORE INTO agent_skills (agent_id, skill_id, assigned_at) VALUES ($1, $2, $3)',
        [agentId, skillId, now()],
      );
    } catch (e) {
      rethrow('Agent', 'assignSkill', e);
    }
  }

  async removeSkill(agentId: string, skillId: string): Promise<void> {
    try {
      await this.db.execute('DELETE FROM agent_skills WHERE agent_id = $1 AND skill_id = $2', [agentId, skillId]);
    } catch (e) {
      rethrow('Agent', 'removeSkill', e);
    }
  }

  private toAgent(r: Record<string, unknown>): Agent {
    return {
      id: r.id as string,
      name: r.name as string,
      description: (r.description as string) ?? null,
      model: (r.model as string) ?? null,
      systemPrompt: (r.system_prompt as string) ?? null,
      permissions: parseJSON<string[]>(r.permissions as string, []),
      isActive: (r.is_active as number) === 1,
      createdAt: new Date(r.created_at as string),
      updatedAt: new Date(r.updated_at as string),
    };
  }
}

// ─── Skills ───

function toSkill(r: Record<string, unknown>): Skill {
  return {
    id: r.id as string,
    name: r.name as string,
    description: (r.description as string) ?? null,
    actionType: (r.action_type as Skill['actionType']) || 'prompt',
    actionConfig: parseJSON<Record<string, unknown>>(r.action_config as string, {}),
    createdAt: new Date(r.created_at as string),
    updatedAt: new Date(r.updated_at as string),
  };
}

export class LocalSkillAdapter implements SkillAdapter {
  constructor(private db: TauriDatabase) {}

  async fetchAll(): Promise<Skill[]> {
    try {
      const rows = await this.db.select<Array<Record<string, unknown>>>(
        'SELECT * FROM skills ORDER BY created_at DESC',
      );
      return rows.map((r) => toSkill(r));
    } catch (e) {
      rethrow('Skill', 'fetchAll', e);
    }
  }

  async create(input: CreateSkillInput): Promise<Skill> {
    try {
      const id = uuid();
      const ts = now();
      await this.db.execute(
        'INSERT INTO skills (id, name, description, action_type, action_config, created_at, updated_at) VALUES ($1,$2,$3,$4,$5,$6,$6)',
        [id, input.name, input.description ?? null, input.actionType, JSON.stringify(input.actionConfig ?? {}), ts],
      );
      return {
        id,
        name: input.name,
        description: input.description ?? null,
        actionType: input.actionType,
        actionConfig: input.actionConfig ?? {},
        createdAt: new Date(ts),
        updatedAt: new Date(ts),
      };
    } catch (e) {
      rethrow('Skill', 'create', e);
    }
  }

  async update(id: string, input: UpdateSkillInput): Promise<void> {
    const sets: string[] = [];
    const vals: unknown[] = [];
    let i = 1;
    const add = (c: string, v: unknown) => {
      sets.push(`${c} = $${i++}`);
      vals.push(v);
    };
    if (input.name !== undefined) add('name', input.name);
    if (input.description !== undefined) add('description', input.description);
    if (input.actionType !== undefined) add('action_type', input.actionType);
    if (input.actionConfig !== undefined) add('action_config', JSON.stringify(input.actionConfig));
    add('updated_at', now());
    try {
      vals.push(id);
      await this.db.execute(`UPDATE skills SET ${sets.join(', ')} WHERE id = $${i}`, vals);
    } catch (e) {
      rethrow('Skill', 'update', e);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.db.execute('DELETE FROM skills WHERE id = $1', [id]);
    } catch (e) {
      rethrow('Skill', 'delete', e);
    }
  }

  async getAgentCount(skillId: string): Promise<number> {
    try {
      const rows = await this.db.select<Array<Record<string, unknown>>>(
        'SELECT COUNT(*) as cnt FROM agent_skills WHERE skill_id = $1',
        [skillId],
      );
      return (rows[0]?.cnt as number) ?? 0;
    } catch (e) {
      rethrow('Skill', 'getAgentCount', e);
    }
  }
}
