import { describe, it, expect, beforeEach } from 'vitest';
import { addMemory, getMemories, resetMemoryCache } from '@/lib/ai/memory-service';
import { runConsolidation, formatConsolidationInsight, jaccardSimilarity } from '@/lib/ai/memory-consolidation';

beforeEach(() => {
  resetMemoryCache();
  localStorage.clear();
});

describe('jaccardSimilarity', () => {
  it('returns 1.0 for identical strings', () => {
    expect(jaccardSimilarity('hello world', 'hello world')).toBe(1);
  });

  it('returns 0 for completely different strings', () => {
    expect(jaccardSimilarity('hello world', 'foo bar baz')).toBe(0);
  });

  it('returns partial similarity for overlapping words', () => {
    const sim = jaccardSimilarity('user prefers dark mode', 'user prefers light mode');
    expect(sim).toBeGreaterThan(0.5);
    expect(sim).toBeLessThan(1);
  });
});

describe('runConsolidation', () => {
  it('deduplicates similar memories in the same category', async () => {
    await addMemory('User prefers dark mode for reading', 'preference', 'extraction', 'episodic');
    await addMemory('User prefers dark mode for reading at night', 'preference', 'extraction', 'episodic');
    await addMemory('User works at a startup', 'fact', 'extraction', 'episodic');

    const result = await runConsolidation(true);
    expect(result.deduplicated).toBe(1);
    expect(result.skipped).toBe(false);

    const remaining = await getMemories();
    // Should have 2 left (one deduped + one unrelated)
    expect(remaining).toHaveLength(2);
  });

  it('does not dedup across different categories', async () => {
    await addMemory('User prefers dark mode', 'preference', 'extraction', 'episodic');
    await addMemory('User prefers dark mode', 'fact', 'extraction', 'episodic');

    const result = await runConsolidation(true);
    expect(result.deduplicated).toBe(0);
  });

  it('prunes old low-value episodic memories', async () => {
    // Create a memory that looks old and unused
    const mem = await addMemory('Old forgotten fact', 'fact', 'extraction', 'episodic', 0.1);
    // Manually age it by overwriting timestamps in cache
    const all = await getMemories(false);
    const idx = all.findIndex((m) => m.id === mem.id);
    if (idx >= 0) {
      const old = new Date(Date.now() - 100 * 24 * 60 * 60 * 1000).toISOString(); // 100 days ago
      all[idx] = { ...all[idx], createdAt: old, lastAccessedAt: old, accessCount: 0, importanceScore: 0.1 };
    }
    // Save back to localStorage
    localStorage.setItem('kaivoo-ai-memories', JSON.stringify(all));
    resetMemoryCache();

    const result = await runConsolidation(true);
    expect(result.pruned).toBe(1);
  });

  it('promotes heavily accessed episodic memories to active_context', async () => {
    const mem = await addMemory('Frequently accessed pattern', 'pattern', 'extraction', 'episodic', 0.5);
    // Set access count above threshold
    const all = await getMemories(false);
    const idx = all.findIndex((m) => m.id === mem.id);
    if (idx >= 0) {
      all[idx] = { ...all[idx], accessCount: 12 };
    }
    localStorage.setItem('kaivoo-ai-memories', JSON.stringify(all));
    resetMemoryCache();

    const result = await runConsolidation(true);
    expect(result.promoted).toBe(1);

    const refreshed = await getMemories();
    expect(refreshed.find((m) => m.id === mem.id)?.tier).toBe('active_context');
  });

  it('promotes high-importance episodic memories', async () => {
    const mem = await addMemory('Important fact', 'fact', 'extraction', 'episodic', 0.85);
    const result = await runConsolidation(true);
    expect(result.promoted).toBe(1);

    const refreshed = await getMemories();
    expect(refreshed.find((m) => m.id === mem.id)?.tier).toBe('active_context');
  });

  it('demotes stale active_context memories to episodic', async () => {
    const mem = await addMemory('Old project context', 'fact', 'extraction', 'active_context', 0.6);
    const all = await getMemories(false);
    const idx = all.findIndex((m) => m.id === mem.id);
    if (idx >= 0) {
      const old = new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(); // 35 days ago
      all[idx] = { ...all[idx], lastAccessedAt: old, accessCount: 2, updatedAt: old };
    }
    localStorage.setItem('kaivoo-ai-memories', JSON.stringify(all));
    resetMemoryCache();

    const result = await runConsolidation(true);
    expect(result.demoted).toBe(1);

    const refreshed = await getMemories();
    expect(refreshed.find((m) => m.id === mem.id)?.tier).toBe('episodic');
  });

  it('never touches core_identity memories', async () => {
    const mem = await addMemory('User name is Kai', 'preference', 'user_edit', 'core_identity', 0.9);
    // Even with old timestamps, core_identity should not be demoted or pruned
    const all = await getMemories(false);
    const idx = all.findIndex((m) => m.id === mem.id);
    if (idx >= 0) {
      const old = new Date(Date.now() - 200 * 24 * 60 * 60 * 1000).toISOString();
      all[idx] = { ...all[idx], lastAccessedAt: old, accessCount: 0, updatedAt: old };
    }
    localStorage.setItem('kaivoo-ai-memories', JSON.stringify(all));
    resetMemoryCache();

    const result = await runConsolidation(true);
    expect(result.demoted).toBe(0);
    expect(result.pruned).toBe(0);

    const refreshed = await getMemories();
    expect(refreshed.find((m) => m.id === mem.id)?.tier).toBe('core_identity');
  });

  it('throttles to once per 24 hours unless forced', async () => {
    await addMemory('Some fact', 'fact', 'extraction', 'episodic');

    const first = await runConsolidation(true);
    expect(first.skipped).toBe(false);

    const second = await runConsolidation(false); // Not forced
    expect(second.skipped).toBe(true);
    expect(second.reason).toContain('24 hours');
  });
});

describe('formatConsolidationInsight', () => {
  it('returns null for skipped consolidation', () => {
    expect(
      formatConsolidationInsight({ deduplicated: 0, pruned: 0, promoted: 0, demoted: 0, skipped: true }),
    ).toBeNull();
  });

  it('returns null when nothing happened', () => {
    expect(
      formatConsolidationInsight({ deduplicated: 0, pruned: 0, promoted: 0, demoted: 0, skipped: false }),
    ).toBeNull();
  });

  it('formats a complete insight message', () => {
    const msg = formatConsolidationInsight({ deduplicated: 2, pruned: 1, promoted: 3, demoted: 1, skipped: false });
    expect(msg).toContain('merged 2 duplicate');
    expect(msg).toContain('pruned 1 stale');
    expect(msg).toContain('promoted 3');
    expect(msg).toContain('demoted 1');
  });
});
