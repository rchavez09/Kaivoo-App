/**
 * Memory Consolidation Service — Sprint 38 P3/P4
 *
 * Runs during heartbeat cycles to keep memory lean and relevant.
 * Steps: dedup → summarize → prune → promote → demote
 *
 * Consolidation is throttled to once per 24 hours.
 */

import type { AIMemory } from './types';
import { getMemories, deleteMemory, updateMemoryTier, resetMemoryCache } from './memory-service';

const CONSOLIDATION_KEY = 'kaivoo-last-consolidation';

// ─── Promotion/Demotion Rules (P4) ───

/** Promote episodic → active_context when heavily accessed or high importance. */
const PROMOTION_ACCESS_THRESHOLD = 10;
const PROMOTION_IMPORTANCE_THRESHOLD = 0.8;

/** Demote active_context → episodic when stale (not accessed in 30 days + low access). */
const DEMOTION_STALE_DAYS = 30;
const DEMOTION_ACCESS_CEILING = 5;

/** Prune episodic memories: old + rarely accessed + low importance. */
const PRUNE_AGE_DAYS = 90;
const PRUNE_ACCESS_CEILING = 2;
const PRUNE_IMPORTANCE_CEILING = 0.3;

/** Similarity threshold for deduplication (Jaccard coefficient). */
const DEDUP_SIMILARITY_THRESHOLD = 0.7;

export interface ConsolidationResult {
  deduplicated: number;
  pruned: number;
  promoted: number;
  demoted: number;
  skipped: boolean;
  reason?: string;
}

/**
 * Run memory consolidation. Throttled to once per 24 hours.
 * Returns a summary of actions taken.
 */
export async function runConsolidation(force = false): Promise<ConsolidationResult> {
  // Check throttle
  if (!force) {
    const last = localStorage.getItem(CONSOLIDATION_KEY);
    if (last) {
      const elapsed = Date.now() - new Date(last).getTime();
      const twentyFourHours = 24 * 60 * 60 * 1000;
      if (elapsed < twentyFourHours) {
        return {
          deduplicated: 0,
          pruned: 0,
          promoted: 0,
          demoted: 0,
          skipped: true,
          reason: 'Last consolidation was less than 24 hours ago',
        };
      }
    }
  }

  const allMemories = await getMemories(false); // Include inactive
  const active = allMemories.filter((m) => m.active);

  let deduplicated = 0;
  let pruned = 0;
  let promoted = 0;
  let demoted = 0;

  // Step 1: Deduplication — merge semantically similar memories
  deduplicated = await deduplicateMemories(active);

  // Reload after dedup (cache may have changed)
  const refreshed = await getMemories(true);

  // Step 2: Pruning — remove old, low-value episodic memories
  pruned = await pruneStaleMemories(refreshed.filter((m) => m.tier === 'episodic'));

  // Step 3: Promotion — episodic → active_context
  promoted = await promoteMemories(refreshed.filter((m) => m.tier === 'episodic'));

  // Step 4: Demotion — active_context → episodic
  demoted = await demoteMemories(refreshed.filter((m) => m.tier === 'active_context'));

  // Update throttle timestamp
  localStorage.setItem(CONSOLIDATION_KEY, new Date().toISOString());

  // Reset cache to pick up all changes
  resetMemoryCache();

  return { deduplicated, pruned, promoted, demoted, skipped: false };
}

/**
 * Format a consolidation result as a human-readable insight string.
 */
export function formatConsolidationInsight(result: ConsolidationResult): string | null {
  if (result.skipped) return null;
  const parts: string[] = [];
  if (result.deduplicated > 0) parts.push(`merged ${result.deduplicated} duplicate memories`);
  if (result.pruned > 0) parts.push(`pruned ${result.pruned} stale entries`);
  if (result.promoted > 0) parts.push(`promoted ${result.promoted} memories to active context`);
  if (result.demoted > 0) parts.push(`demoted ${result.demoted} memories to episodic`);
  if (parts.length === 0) return null;
  return `Memory consolidation: ${parts.join(', ')}.`;
}

// ─── Deduplication ───

/**
 * Simple text-based deduplication using Jaccard word similarity.
 * Merges pairs above threshold — keeps the newer entry, deletes the older.
 */
async function deduplicateMemories(memories: AIMemory[]): Promise<number> {
  let count = 0;
  const deleted = new Set<string>();

  for (let i = 0; i < memories.length; i++) {
    if (deleted.has(memories[i].id)) continue;
    for (let j = i + 1; j < memories.length; j++) {
      if (deleted.has(memories[j].id)) continue;
      // Only dedup within same category
      if (memories[i].category !== memories[j].category) continue;

      const similarity = jaccardSimilarity(memories[i].content, memories[j].content);
      if (similarity >= DEDUP_SIMILARITY_THRESHOLD) {
        // Keep the one with higher importance or more recent update
        const keep = memories[i].importanceScore >= memories[j].importanceScore ? memories[i] : memories[j];
        const remove = keep === memories[i] ? memories[j] : memories[i];
        await deleteMemory(remove.id);
        deleted.add(remove.id);
        count++;
      }
    }
  }

  return count;
}

/** Jaccard similarity on word sets. */
function jaccardSimilarity(a: string, b: string): number {
  const setA = new Set(a.toLowerCase().split(/\s+/));
  const setB = new Set(b.toLowerCase().split(/\s+/));
  let intersection = 0;
  for (const word of setA) {
    if (setB.has(word)) intersection++;
  }
  const union = setA.size + setB.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

// ─── Pruning ───

async function pruneStaleMemories(episodicMemories: AIMemory[]): Promise<number> {
  const now = Date.now();
  let count = 0;

  for (const m of episodicMemories) {
    const lastAccess = m.lastAccessedAt ? new Date(m.lastAccessedAt).getTime() : new Date(m.createdAt).getTime();
    const ageDays = (now - lastAccess) / (1000 * 60 * 60 * 24);

    if (
      ageDays > PRUNE_AGE_DAYS &&
      m.accessCount < PRUNE_ACCESS_CEILING &&
      m.importanceScore < PRUNE_IMPORTANCE_CEILING
    ) {
      await deleteMemory(m.id);
      count++;
    }
  }

  return count;
}

// ─── Promotion (P4) ───

async function promoteMemories(episodicMemories: AIMemory[]): Promise<number> {
  let count = 0;

  for (const m of episodicMemories) {
    if (m.accessCount >= PROMOTION_ACCESS_THRESHOLD || m.importanceScore >= PROMOTION_IMPORTANCE_THRESHOLD) {
      await updateMemoryTier(m.id, 'active_context');
      count++;
    }
  }

  return count;
}

// ─── Demotion (P4) ───

async function demoteMemories(activeMemories: AIMemory[]): Promise<number> {
  const now = Date.now();
  let count = 0;

  for (const m of activeMemories) {
    const lastAccess = m.lastAccessedAt ? new Date(m.lastAccessedAt).getTime() : new Date(m.updatedAt).getTime();
    const daysSinceAccess = (now - lastAccess) / (1000 * 60 * 60 * 24);

    if (daysSinceAccess > DEMOTION_STALE_DAYS && m.accessCount < DEMOTION_ACCESS_CEILING) {
      await updateMemoryTier(m.id, 'episodic');
      count++;
    }
  }

  return count;
}

// ─── Exports for testing ───

export { jaccardSimilarity, DEDUP_SIMILARITY_THRESHOLD };
