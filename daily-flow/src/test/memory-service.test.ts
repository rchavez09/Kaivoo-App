import { describe, it, expect, beforeEach } from 'vitest';
import {
  getMemories,
  addMemory,
  updateMemory,
  deleteMemory,
  toggleMemoryActive,
  searchMemories,
  getMemoriesByTier,
  updateMemoryTier,
  updateMemoryImportance,
  trackMemoryAccess,
  resetMemoryCache,
} from '@/lib/ai/memory-service';

// Memory service uses localStorage on web (non-Tauri).
// These tests exercise the web path.

beforeEach(() => {
  resetMemoryCache();
  localStorage.clear();
});

describe('memory-service (web path)', () => {
  it('starts with empty memories', async () => {
    const memories = await getMemories();
    expect(memories).toEqual([]);
  });

  it('adds a memory with default tier and importance', async () => {
    const mem = await addMemory('User likes dark mode', 'preference', 'hatching');
    expect(mem.tier).toBe('episodic');
    expect(mem.importanceScore).toBe(0.5);
    expect(mem.accessCount).toBe(0);
    expect(mem.lastAccessedAt).toBeNull();
    expect(mem.active).toBe(true);
  });

  it('adds a memory with explicit tier and importance', async () => {
    const mem = await addMemory('User name is Kai', 'preference', 'user_edit', 'core_identity', 0.9);
    expect(mem.tier).toBe('core_identity');
    expect(mem.importanceScore).toBe(0.9);
  });

  it('updates memory content', async () => {
    const mem = await addMemory('Old content', 'fact', 'extraction');
    await updateMemory(mem.id, 'New content');
    const all = await getMemories();
    expect(all.find((m) => m.id === mem.id)?.content).toBe('New content');
  });

  it('deletes a memory', async () => {
    const mem = await addMemory('Temp fact', 'fact', 'extraction');
    await deleteMemory(mem.id);
    const all = await getMemories(false);
    expect(all.find((m) => m.id === mem.id)).toBeUndefined();
  });

  it('toggles memory active state', async () => {
    const mem = await addMemory('Toggle me', 'fact', 'extraction');
    await toggleMemoryActive(mem.id, false);
    const active = await getMemories(true);
    expect(active.find((m) => m.id === mem.id)).toBeUndefined();
    const all = await getMemories(false);
    expect(all.find((m) => m.id === mem.id)?.active).toBe(false);
  });

  it('searches memories by content substring', async () => {
    await addMemory('User prefers bullet points', 'preference', 'hatching');
    await addMemory('User works at a startup', 'fact', 'extraction');
    const results = await searchMemories('bullet');
    expect(results).toHaveLength(1);
    expect(results[0].content).toContain('bullet');
  });
});

describe('tier operations (Sprint 38 P1)', () => {
  it('filters memories by tier', async () => {
    await addMemory('Core: user name', 'preference', 'user_edit', 'core_identity', 0.9);
    await addMemory('Active: current project', 'fact', 'extraction', 'active_context', 0.7);
    await addMemory('Episodic: old fact', 'fact', 'extraction', 'episodic', 0.3);

    const core = await getMemoriesByTier('core_identity');
    expect(core).toHaveLength(1);
    expect(core[0].tier).toBe('core_identity');

    const active = await getMemoriesByTier('active_context');
    expect(active).toHaveLength(1);

    const episodic = await getMemoriesByTier('episodic');
    expect(episodic).toHaveLength(1);
  });

  it('updates memory tier (promote/demote)', async () => {
    const mem = await addMemory('Frequent pattern', 'pattern', 'extraction', 'episodic');
    expect(mem.tier).toBe('episodic');

    await updateMemoryTier(mem.id, 'active_context');
    const all = await getMemories();
    expect(all.find((m) => m.id === mem.id)?.tier).toBe('active_context');
  });

  it('updates importance score with clamping', async () => {
    const mem = await addMemory('Important fact', 'fact', 'extraction');

    await updateMemoryImportance(mem.id, 0.95);
    let all = await getMemories();
    expect(all.find((m) => m.id === mem.id)?.importanceScore).toBe(0.95);

    // Clamp above 1.0
    await updateMemoryImportance(mem.id, 1.5);
    all = await getMemories();
    expect(all.find((m) => m.id === mem.id)?.importanceScore).toBe(1.0);

    // Clamp below 0.0
    await updateMemoryImportance(mem.id, -0.5);
    all = await getMemories();
    expect(all.find((m) => m.id === mem.id)?.importanceScore).toBe(0);
  });

  it('tracks memory access (increment count + update timestamp)', async () => {
    const mem = await addMemory('Tracked fact', 'fact', 'extraction');
    expect(mem.accessCount).toBe(0);
    expect(mem.lastAccessedAt).toBeNull();

    await trackMemoryAccess([mem.id]);
    let all = await getMemories();
    const updated = all.find((m) => m.id === mem.id)!;
    expect(updated.accessCount).toBe(1);
    expect(updated.lastAccessedAt).not.toBeNull();

    // Track again
    await trackMemoryAccess([mem.id]);
    all = await getMemories();
    expect(all.find((m) => m.id === mem.id)?.accessCount).toBe(2);
  });

  it('tracks access for multiple memories at once', async () => {
    const m1 = await addMemory('Fact A', 'fact', 'extraction');
    const m2 = await addMemory('Fact B', 'fact', 'extraction');

    await trackMemoryAccess([m1.id, m2.id]);
    const all = await getMemories();
    expect(all.find((m) => m.id === m1.id)?.accessCount).toBe(1);
    expect(all.find((m) => m.id === m2.id)?.accessCount).toBe(1);
  });
});

// ==========================================
// P2: Context-Aware Memory Loading Tests
// ==========================================
import { assembleSystemPrompt, estimateTokens } from '@/lib/ai/prompt-assembler';
import type { AIMemory } from '@/lib/ai/types';

function makeMockMemory(overrides: Partial<AIMemory>): AIMemory {
  return {
    id: crypto.randomUUID(),
    content: 'test',
    category: 'fact',
    source: 'extraction',
    tier: 'episodic',
    importanceScore: 0.5,
    lastAccessedAt: null,
    accessCount: 0,
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

describe('prompt assembler — tier-aware loading (Sprint 38 P2)', () => {
  it('includes all 3 tier sections when memories exist', () => {
    const prompt = assembleSystemPrompt({
      soul: null,
      depth: 'medium',
      coreMemories: [makeMockMemory({ tier: 'core_identity', content: 'User name is Kai' })],
      activeMemories: [makeMockMemory({ tier: 'active_context', content: 'Working on Sprint 38' })],
      episodicMemories: [makeMockMemory({ tier: 'episodic', content: 'Completed Sprint 30' })],
      summaries: [],
      appContext: null,
      hasTools: false,
    });

    expect(prompt).toContain('Core Identity');
    expect(prompt).toContain('User name is Kai');
    expect(prompt).toContain('Active Context');
    expect(prompt).toContain('Working on Sprint 38');
    expect(prompt).toContain('Relevant History');
    expect(prompt).toContain('Completed Sprint 30');
  });

  it('omits empty tier sections', () => {
    const prompt = assembleSystemPrompt({
      soul: null,
      depth: 'medium',
      coreMemories: [makeMockMemory({ tier: 'core_identity', content: 'User name is Kai' })],
      activeMemories: [],
      episodicMemories: [],
      summaries: [],
      appContext: null,
      hasTools: false,
    });

    expect(prompt).toContain('Core Identity');
    expect(prompt).not.toContain('Active Context');
    expect(prompt).not.toContain('Relevant History');
  });

  it('enforces token budget by truncating episodic memories', () => {
    // Create many long episodic memories that would exceed the budget
    const longEpisodic = Array.from({ length: 50 }, (_, i) =>
      makeMockMemory({
        tier: 'episodic',
        content: `Very long episodic memory entry number ${i} with lots of detail about what happened on this day and all the context around it plus extra padding text to increase token count significantly`,
      }),
    );

    const prompt = assembleSystemPrompt({
      soul: null,
      depth: 'medium',
      coreMemories: [],
      activeMemories: [],
      episodicMemories: longEpisodic,
      summaries: [],
      appContext: null,
      hasTools: false,
    });

    // The memories section should be under budget (~3500 tokens)
    const memoriesSection = prompt.split('## Things You Remember')[1]?.split('## Rules')[0] ?? '';
    const tokenCount = estimateTokens(memoriesSection);
    expect(tokenCount).toBeLessThanOrEqual(3500);
  });

  it('returns empty string for memories layer when no memories exist', () => {
    const prompt = assembleSystemPrompt({
      soul: null,
      depth: 'medium',
      coreMemories: [],
      activeMemories: [],
      episodicMemories: [],
      summaries: [],
      appContext: null,
      hasTools: false,
    });

    expect(prompt).not.toContain('Things You Remember');
  });
});
