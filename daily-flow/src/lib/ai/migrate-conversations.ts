/**
 * One-time migration — localStorage → adapter
 *
 * Reads conversations from `kaivoo-conversations` and coherence signals from
 * `flow-coherence-log`, writes them into the adapter layer, then removes the
 * localStorage keys. Guarded by a `flow-ai-migration-done` flag so it runs
 * at most once per browser profile.
 */

import type { DataAdapter } from '@/lib/adapters/types';
import type { Conversation } from './types';
import type { CoherenceSignal } from './coherence-monitor';

const MIGRATION_FLAG = 'flow-ai-migration-done';
const CONVERSATIONS_KEY = 'kaivoo-conversations';
const COHERENCE_LOG_KEY = 'flow-coherence-log';

export async function migrateConversationsFromLocalStorage(adapter: DataAdapter): Promise<void> {
  if (localStorage.getItem(MIGRATION_FLAG)) return;

  try {
    // Migrate conversations
    const rawConvos = localStorage.getItem(CONVERSATIONS_KEY);
    if (rawConvos) {
      const convos = JSON.parse(rawConvos) as Conversation[];
      for (const c of convos) {
        await adapter.conversations.create({
          id: c.id,
          title: c.title,
          messages: JSON.stringify(c.messages),
        });
      }
    }

    // Migrate coherence log
    const rawLog = localStorage.getItem(COHERENCE_LOG_KEY);
    if (rawLog) {
      const signals = JSON.parse(rawLog) as CoherenceSignal[];
      for (const s of signals) {
        await adapter.coherenceLog.create({
          conversationId: s.conversationId,
          signal: s.signal,
          severity: s.severity,
          details: s.details,
          responseSnippet: s.responseSnippet,
        });
      }
    }

    // Clean up localStorage
    localStorage.removeItem(CONVERSATIONS_KEY);
    localStorage.removeItem(COHERENCE_LOG_KEY);
  } catch {
    // Migration is best-effort — don't block the app
  }

  localStorage.setItem(MIGRATION_FLAG, '1');
}
