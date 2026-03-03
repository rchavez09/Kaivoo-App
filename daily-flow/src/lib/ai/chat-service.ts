/**
 * AI Chat Service — Sprint 23 P10
 *
 * Handles conversation persistence, test connection, and streaming
 * chat via Supabase Edge Function proxy.
 */

import type { ConversationMessage, Conversation, AISettings } from './types';
import { supabase } from '@/integrations/supabase/client';
import { getAISettings, getSoulConfig, buildSystemPrompt } from './settings';

const CONVERSATIONS_KEY = 'kaivoo-conversations';
const MAX_CONVERSATIONS = 50;
const MAX_MESSAGES_PER_CONVERSATION = 200;

// ─── Conversation Persistence ───

export function getConversations(): Conversation[] {
  try {
    const stored = localStorage.getItem(CONVERSATIONS_KEY);
    if (stored) return JSON.parse(stored) as Conversation[];
  } catch {
    // Ignore
  }
  return [];
}

export function saveConversation(conversation: Conversation): void {
  const conversations = getConversations();
  const idx = conversations.findIndex((c) => c.id === conversation.id);
  if (idx >= 0) {
    conversations[idx] = conversation;
  } else {
    conversations.unshift(conversation);
  }
  const trimmed = conversations.slice(0, MAX_CONVERSATIONS).map((c) => ({
    ...c,
    messages: c.messages.slice(-MAX_MESSAGES_PER_CONVERSATION),
  }));
  localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(trimmed));
}

export function deleteConversation(id: string): void {
  const conversations = getConversations().filter((c) => c.id !== id);
  localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(conversations));
}

export function createConversation(): Conversation {
  return {
    id: crypto.randomUUID(),
    title: 'New conversation',
    messages: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

// ─── Test Connection ───

export async function testConnection(
  settings: AISettings,
): Promise<{ ok: boolean; message: string }> {
  try {
    const { data, error } = await supabase.functions.invoke<{ ok: boolean; message: string }>(
      'ai-chat',
      {
        body: {
          test: true,
          provider: settings.provider,
          apiKey: settings.apiKey,
          model: settings.model,
          ollamaBaseUrl: settings.ollamaBaseUrl,
        },
      },
    );

    if (error) {
      return { ok: false, message: `Connection error: ${error.message}` };
    }

    return data ?? { ok: false, message: 'No response from server' };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : 'Connection failed' };
  }
}

// ─── Streaming Chat ───

export async function* streamChat(
  messages: ConversationMessage[],
  onTitleSuggestion?: (title: string) => void,
  signal?: AbortSignal,
): AsyncGenerator<string> {
  const settings = getAISettings();
  if (!settings.apiKey && settings.provider !== 'ollama') {
    throw new Error('No API key configured. Go to Settings to set one up.');
  }

  const soul = getSoulConfig();
  const systemPrompt = buildSystemPrompt(soul, settings.depth);

  const apiMessages = messages.map((m) => ({ role: m.role, content: m.content }));

  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-chat`,
    {
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
        messages: apiMessages,
        systemPrompt,
      }),
      signal,
    },
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Chat request failed (${response.status}): ${errorText}`);
  }

  if (!response.body) {
    throw new Error('Streaming not supported');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        const data = line.slice(6).trim();
        if (data === '[DONE]') return;

        try {
          const parsed = JSON.parse(data) as { text?: string; error?: string };
          if (parsed.error) throw new Error(parsed.error);
          if (parsed.text) yield parsed.text;
        } catch (e) {
          if (e instanceof SyntaxError) continue;
          throw e;
        }
      }
    }
  } finally {
    reader.releaseLock();

    // Auto-title from first user message
    if (onTitleSuggestion && messages.length === 1) {
      const first = messages[0].content.trim().replace(/\n/g, ' ');
      onTitleSuggestion(first.length <= 50 ? first : first.slice(0, 47) + '...');
    }
  }
}
