/**
 * Conversation Summarizer — Sprint 24 P17
 *
 * After a conversation ends, generate a short summary and key facts.
 * Saved to ai_conversation_summaries for use in the system prompt
 * of future conversations (context continuity).
 */

import type { ConversationMessage } from './types';
import { getAISettings } from './settings';
import { addSummary } from './memory-service';

const SUMMARY_PROMPT = `Summarize this conversation between a user and their AI concierge in 1-2 sentences.
Also extract 0-5 key facts or decisions that came up.

Respond with ONLY a JSON object: {"summary": "...", "key_facts": ["...", "..."]}
No markdown, no explanation.`;

/**
 * Generate and save a conversation summary.
 * Skips if conversation is too short or no API key.
 */
export async function summarizeConversation(conversationId: string, messages: ConversationMessage[]): Promise<void> {
  // Only summarize conversations with at least 3 messages
  if (messages.filter((m) => m.role !== 'tool').length < 3) return;

  const settings = getAISettings();
  if (!settings.apiKey && settings.provider !== 'ollama') return;

  try {
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
        systemPrompt: SUMMARY_PROMPT,
      }),
    });

    if (!response.ok || !response.body) return;

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

    if (!fullText.trim()) return;

    const jsonMatch = fullText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return;

    const result = JSON.parse(jsonMatch[0]) as { summary?: string; key_facts?: string[] };
    if (!result.summary) return;

    await addSummary(conversationId, result.summary, result.key_facts || []);
  } catch (e) {
    console.error('[summarizeConversation] Failed:', e);
  }
}
