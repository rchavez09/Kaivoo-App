/**
 * AI Chat Service — Sprint 23 P10, Sprint 24 P14
 *
 * Handles conversation persistence, test connection, and streaming
 * chat via Supabase Edge Function proxy.
 *
 * Sprint 24: Added tool-use support — yields StreamEvent objects
 * (text chunks + tool_call events). The component handles the
 * tool execution loop.
 */

import type { ConversationMessage, Conversation, AISettings, ToolCall } from './types';
import type { ToolSchema } from './tools/schemas';
import { supabase } from '@/integrations/supabase/client';
import { getAISettings } from './settings';

const CONVERSATIONS_KEY = 'kaivoo-conversations';
const MAX_CONVERSATIONS = 50;
const MAX_MESSAGES_PER_CONVERSATION = 200;

// ─── Stream Event Types ───

export type StreamEvent =
  | { type: 'text'; text: string }
  | { type: 'tool_call'; toolCall: ToolCall };

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

export interface StreamChatOptions {
  systemPrompt: string;
  tools?: ToolSchema[];
  onTitleSuggestion?: (title: string) => void;
  signal?: AbortSignal;
}

/**
 * Stream chat responses from the edge function.
 * Yields StreamEvent objects — either text chunks or tool_call events.
 * The caller is responsible for the tool execution loop:
 *   1. Collect tool_call events from one pass
 *   2. Execute tools client-side
 *   3. Append tool results to messages and re-invoke streamChat
 */
export async function* streamChat(
  messages: ConversationMessage[],
  options: StreamChatOptions,
): AsyncGenerator<StreamEvent> {
  const settings = getAISettings();
  if (!settings.apiKey && settings.provider !== 'ollama') {
    throw new Error('No API key configured. Go to Settings to set one up.');
  }

  // Build API messages — filter out tool-role messages to simplified format
  const apiMessages = messages.map((m) => {
    if (m.role === 'tool') {
      return { role: 'tool' as const, content: m.content, tool_call_id: m.toolCallId };
    }
    if (m.toolCalls?.length) {
      return { role: m.role, content: m.content, tool_calls: m.toolCalls };
    }
    return { role: m.role, content: m.content };
  });

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
        customBaseUrl: settings.customBaseUrl,
        messages: apiMessages,
        systemPrompt: options.systemPrompt,
        tools: options.tools,
      }),
      signal: options.signal,
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
          const parsed = JSON.parse(data) as {
            text?: string;
            tool_call?: { id: string; name: string; arguments: Record<string, unknown> };
            error?: string;
          };
          if (parsed.error) throw new Error(parsed.error);
          if (parsed.text) yield { type: 'text', text: parsed.text };
          if (parsed.tool_call) {
            yield {
              type: 'tool_call',
              toolCall: {
                id: parsed.tool_call.id,
                name: parsed.tool_call.name,
                arguments: parsed.tool_call.arguments,
              },
            };
          }
        } catch (e) {
          if (e instanceof SyntaxError) continue;
          throw e;
        }
      }
    }
  } finally {
    reader.releaseLock();

    // Auto-title from first user message
    if (options.onTitleSuggestion && messages.length === 1 && messages[0].role === 'user') {
      const first = messages[0].content.trim().replace(/\n/g, ' ');
      options.onTitleSuggestion(first.length <= 50 ? first : first.slice(0, 47) + '...');
    }
  }
}
