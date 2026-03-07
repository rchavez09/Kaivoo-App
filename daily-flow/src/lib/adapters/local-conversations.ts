/**
 * Local Entity Adapters — AI Conversations & Coherence Log
 *
 * SQLite-backed persistence for concierge conversations and
 * coherence monitoring signals on the desktop (Tauri) runtime.
 */

import type {
  ConversationAdapter,
  CoherenceLogAdapter,
  CreateConversationInput,
  UpdateConversationInput,
  CreateCoherenceSignalInput,
} from './types';
import type { Conversation, ConversationMessage } from '@/lib/ai/types';
import type { CoherenceSignal } from '@/lib/ai/coherence-monitor';
import type { TauriDatabase } from './local-types';
import { uuid, now, parseJSON } from './local-types';

const MAX_CONVERSATIONS = 50;
const MAX_MESSAGES_PER_CONVERSATION = 200;
const MAX_LOG_ENTRIES = 200;

export class LocalConversationAdapter implements ConversationAdapter {
  constructor(private db: TauriDatabase) {}

  async fetchAll(): Promise<Conversation[]> {
    const rows = await this.db.select<Array<Record<string, unknown>>>(
      'SELECT * FROM ai_conversations ORDER BY updated_at DESC LIMIT $1',
      [MAX_CONVERSATIONS],
    );
    return rows.map((r) => ({
      id: r.id as string,
      title: r.title as string,
      messages: parseJSON<ConversationMessage[]>(r.messages as string, []),
      createdAt: r.created_at as string,
      updatedAt: r.updated_at as string,
    }));
  }

  async create(input: CreateConversationInput): Promise<Conversation> {
    const id = input.id ?? uuid();
    const createdAt = now();
    const messages = input.messages
      ? JSON.stringify(JSON.parse(input.messages).slice(-MAX_MESSAGES_PER_CONVERSATION))
      : '[]';

    await this.db.execute(
      `INSERT INTO ai_conversations (id, title, messages, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5)`,
      [id, input.title, messages, createdAt, createdAt],
    );

    // Prune oldest conversations beyond the limit
    await this.db.execute(
      `DELETE FROM ai_conversations WHERE id NOT IN (
        SELECT id FROM ai_conversations ORDER BY updated_at DESC LIMIT $1
      )`,
      [MAX_CONVERSATIONS],
    );

    return {
      id,
      title: input.title,
      messages: parseJSON<ConversationMessage[]>(messages, []),
      createdAt,
      updatedAt: createdAt,
    };
  }

  async update(id: string, input: UpdateConversationInput): Promise<void> {
    const sets: string[] = [];
    const vals: unknown[] = [];
    let i = 1;
    const add = (col: string, val: unknown) => {
      sets.push(`${col} = $${i++}`);
      vals.push(val);
    };

    if (input.title !== undefined) add('title', input.title);
    if (input.messages !== undefined) {
      const trimmed = JSON.stringify(
        JSON.parse(input.messages).slice(-MAX_MESSAGES_PER_CONVERSATION),
      );
      add('messages', trimmed);
    }
    add('updated_at', now());

    if (sets.length === 0) return;
    vals.push(id);
    await this.db.execute(
      `UPDATE ai_conversations SET ${sets.join(', ')} WHERE id = $${i}`,
      vals,
    );
  }

  async delete(id: string): Promise<void> {
    await this.db.execute('DELETE FROM ai_conversations WHERE id = $1', [id]);
  }
}

export class LocalCoherenceLogAdapter implements CoherenceLogAdapter {
  constructor(private db: TauriDatabase) {}

  async fetchAll(): Promise<CoherenceSignal[]> {
    const rows = await this.db.select<Array<Record<string, unknown>>>(
      'SELECT * FROM ai_coherence_log ORDER BY created_at DESC LIMIT $1',
      [MAX_LOG_ENTRIES],
    );
    return rows.map((r) => ({
      id: r.id as string,
      timestamp: r.created_at as string,
      conversationId: r.conversation_id as string,
      signal: r.signal as CoherenceSignal['signal'],
      severity: r.severity as CoherenceSignal['severity'],
      details: r.details as string,
      responseSnippet: r.response_snippet as string,
    }));
  }

  async create(input: CreateCoherenceSignalInput): Promise<CoherenceSignal> {
    const id = uuid();
    const createdAt = now();

    await this.db.execute(
      `INSERT INTO ai_coherence_log (id, conversation_id, signal, severity, details, response_snippet, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [id, input.conversationId, input.signal, input.severity, input.details, input.responseSnippet, createdAt],
    );

    // Prune old entries beyond the limit
    await this.db.execute(
      `DELETE FROM ai_coherence_log WHERE id NOT IN (
        SELECT id FROM ai_coherence_log ORDER BY created_at DESC LIMIT $1
      )`,
      [MAX_LOG_ENTRIES],
    );

    return {
      id,
      timestamp: createdAt,
      conversationId: input.conversationId,
      signal: input.signal,
      severity: input.severity,
      details: input.details,
      responseSnippet: input.responseSnippet,
    };
  }
}
