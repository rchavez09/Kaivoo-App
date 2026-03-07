/**
 * Memory Extraction Pipeline — Sprint 24 P16
 *
 * After a conversation ends (or at save time), extract key facts,
 * preferences, and patterns from the conversation and save them
 * as AI memories. Uses the LLM itself via a single non-streaming
 * call to the edge function.
 */

import type { ConversationMessage, AIMemory, MemoryCategory } from './types';
import { getAISettings } from './settings';
import { addMemory, getMemories } from './memory-service';

/** Visible message count threshold to trigger pre-compaction flush. */
export const PRE_COMPACTION_THRESHOLD = 40;

interface ExtractedFact {
  content: string;
  category: MemoryCategory;
}

const EXTRACTION_PROMPT = `You are analyzing a conversation between a user and their AI concierge.
Extract any new facts, preferences, goals, or patterns about the user that are worth remembering long-term.

Rules:
- Only extract facts that are clearly stated or strongly implied by the user (not the assistant).
- Write each fact from a third-person perspective about the user, e.g. "Prefers morning routines" or "Has a dog named Max".
- Skip mundane task-related facts that aren't reusable (e.g. "Asked to create a task called X").
- Categorize each fact as: preference, fact, goal, relationship, or pattern.
- Return an empty array if nothing worth remembering.
- Maximum 5 facts per conversation.

Respond with ONLY a JSON array of objects with "content" and "category" fields. No markdown, no explanation.
Example: [{"content": "Prefers dark mode", "category": "preference"}]`;

/**
 * Extract memories from a conversation. Returns newly saved memories.
 * Skips extraction if the conversation is too short or no API key is configured.
 */
export async function extractMemories(messages: ConversationMessage[]): Promise<AIMemory[]> {
  // Only extract from conversations with at least 2 user messages
  const userMessages = messages.filter((m) => m.role === 'user');
  if (userMessages.length < 2) return [];

  const settings = getAISettings();
  if (!settings.apiKey && settings.provider !== 'ollama') return [];

  try {
    // Build a condensed transcript for the extraction prompt
    const transcript = messages
      .filter((m) => m.role === 'user' || m.role === 'assistant')
      .map((m) => `${m.role}: ${m.content.slice(0, 500)}`)
      .join('\n');

    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-chat`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        provider: settings.provider,
        apiKey: settings.apiKey,
        model: settings.model,
        ollamaBaseUrl: settings.ollamaBaseUrl,
        customBaseUrl: settings.customBaseUrl,
        messages: [{ role: 'user', content: `Conversation transcript:\n${transcript}` }],
        systemPrompt: EXTRACTION_PROMPT,
      }),
    });

    if (!response.ok || !response.body) return [];

    // Collect the full streamed response
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let fullText = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        const data = line.slice(6).trim();
        if (data === '[DONE]') break;
        try {
          const parsed = JSON.parse(data) as { text?: string };
          if (parsed.text) fullText += parsed.text;
        } catch {
          // skip
        }
      }
    }
    reader.releaseLock();

    if (!fullText.trim()) return [];

    // Parse the extracted facts
    const jsonMatch = fullText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return [];

    const facts = JSON.parse(jsonMatch[0]) as ExtractedFact[];
    if (!Array.isArray(facts) || facts.length === 0) return [];

    // Deduplicate against existing memories (substring match, not just exact)
    const existing = await getMemories();
    const existingLower = existing.map((m) => m.content.toLowerCase());

    const newMemories: AIMemory[] = [];
    for (const fact of facts.slice(0, 5)) {
      if (!fact.content || !fact.category) continue;
      const factLower = fact.content.toLowerCase();
      const isDuplicate = existingLower.some((e) => e.includes(factLower) || factLower.includes(e));
      if (isDuplicate) continue;

      const memory = await addMemory(fact.content, fact.category, 'extraction');
      newMemories.push(memory);
      // Add to existing list so subsequent facts in this batch also dedup against each other
      existingLower.push(factLower);
    }

    return newMemories;
  } catch (e) {
    console.error('[extractMemories] Failed:', e);
    return [];
  }
}

const PRE_COMPACTION_PROMPT = `You are reviewing a LONG conversation between a user and their AI concierge.
The conversation is about to exceed the context window. Your job is to extract lasting insights
that should be preserved as memories before older messages are lost.

Focus on:
- User preferences and patterns that emerged over the conversation
- Important facts about the user's life, work, or goals
- Decisions the user made or commitments they expressed
- Relationships or people mentioned repeatedly

Rules:
- Write each fact from a third-person perspective about the user.
- Only extract facts clearly stated or strongly implied by the user.
- Prioritize insights that span multiple exchanges (not one-off requests).
- Categorize each as: preference, fact, goal, relationship, or pattern.
- Maximum 8 facts (more allowed since this is a long conversation).

Respond with ONLY a JSON array of objects with "content" and "category" fields. No markdown.`;

/**
 * Pre-compaction memory flush — Layer 4 of the concierge memory architecture.
 * Called when conversation length approaches context window limits.
 * Extracts lasting insights BEFORE older messages are truncated.
 * Returns newly saved memories (source: 'pre_compaction_flush').
 */
export async function preCompactionFlush(messages: ConversationMessage[]): Promise<AIMemory[]> {
  const userMessages = messages.filter((m) => m.role === 'user');
  if (userMessages.length < 3) return [];

  const settings = getAISettings();
  if (!settings.apiKey && settings.provider !== 'ollama') return [];

  try {
    // Build condensed transcript — include more context for long conversations
    const transcript = messages
      .filter((m) => m.role === 'user' || m.role === 'assistant')
      .map((m) => `${m.role}: ${m.content.slice(0, 300)}`)
      .join('\n');

    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-chat`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        provider: settings.provider,
        apiKey: settings.apiKey,
        model: settings.model,
        ollamaBaseUrl: settings.ollamaBaseUrl,
        customBaseUrl: settings.customBaseUrl,
        messages: [{ role: 'user', content: `Conversation transcript:\n${transcript}` }],
        systemPrompt: PRE_COMPACTION_PROMPT,
      }),
    });

    if (!response.ok || !response.body) return [];

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let fullText = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';
      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        const data = line.slice(6).trim();
        if (data === '[DONE]') break;
        try {
          const parsed = JSON.parse(data) as { text?: string };
          if (parsed.text) fullText += parsed.text;
        } catch {
          // skip
        }
      }
    }
    reader.releaseLock();

    if (!fullText.trim()) return [];

    const jsonMatch = fullText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return [];

    const facts = JSON.parse(jsonMatch[0]) as ExtractedFact[];
    if (!Array.isArray(facts) || facts.length === 0) return [];

    // Deduplicate against existing memories
    const existing = await getMemories();
    const existingLower = existing.map((m) => m.content.toLowerCase());

    const newMemories: AIMemory[] = [];
    for (const fact of facts.slice(0, 8)) {
      if (!fact.content || !fact.category) continue;
      const factLower = fact.content.toLowerCase();
      const isDuplicate = existingLower.some((e) => e.includes(factLower) || factLower.includes(e));
      if (isDuplicate) continue;

      const memory = await addMemory(fact.content, fact.category, 'pre_compaction_flush');
      newMemories.push(memory);
      existingLower.push(factLower);
    }

    console.log(`[preCompactionFlush] Saved ${newMemories.length} memories before context truncation`);
    return newMemories;
  } catch (e) {
    console.error('[preCompactionFlush] Failed:', e);
    return [];
  }
}
