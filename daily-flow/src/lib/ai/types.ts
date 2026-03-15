/**
 * AI Types — Sprint 23 P9/P10, Sprint 24 P3
 *
 * Core type definitions for AI provider configuration,
 * chat messages, conversation persistence, and soul file.
 */

// ─── Provider Types ───

export type AIProviderType =
  | 'openai'
  | 'anthropic'
  | 'google'
  | 'groq'
  | 'mistral'
  | 'deepseek'
  | 'openrouter'
  | 'ollama'
  | 'openai-compatible';

export type AIDepth = 'light' | 'medium' | 'heavy';

export interface AIModel {
  id: string;
  name: string;
}

export interface AIProviderConfig {
  id: AIProviderType;
  name: string;
  models: AIModel[];
  requiresApiKey: boolean;
  placeholder: string;
  baseUrl?: string;
  supportsTools?: boolean;
}

export interface AISettings {
  provider: AIProviderType;
  apiKey: string;
  model: string;
  ollamaBaseUrl: string;
  customBaseUrl?: string;
  depth: AIDepth;
}

// ─── Conversation Types ───

export interface ConversationMessage {
  id: string;
  role: 'user' | 'assistant' | 'tool';
  content: string;
  timestamp: string;
  toolCallId?: string;
  toolCalls?: ToolCall[];
}

export interface ToolCall {
  id: string;
  name: string;
  arguments: Record<string, unknown>;
}

export interface ToolResult {
  toolCallId: string;
  result: unknown;
  isError?: boolean;
}

export interface Conversation {
  id: string;
  title: string;
  messages: ConversationMessage[];
  createdAt: string;
  updatedAt: string;
}

// ─── Soul File Types (Sprint 24 P3) ───

export interface SoulConfig {
  name: string;
  tone: 'professional' | 'casual' | 'playful';
  userName?: string;
  backstory?: string;
  communicationNotes?: string;
  goals?: string[];
  workingStyle?: string;
  verbosity?: AIDepth;
  createdAt?: string;
  updatedAt?: string;
}

export type MemoryCategory = 'preference' | 'fact' | 'goal' | 'relationship' | 'pattern';
export type MemorySource = 'hatching' | 'user_edit' | 'extraction' | 'explicit' | 'pre_compaction_flush';
export type MemoryTier = 'core_identity' | 'active_context' | 'episodic';

export interface AIMemory {
  id: string;
  content: string;
  category: MemoryCategory;
  source: MemorySource;
  tier: MemoryTier;
  importanceScore: number; // 0.0-1.0, used for promotion/demotion
  lastAccessedAt: string | null;
  accessCount: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AIConversationSummary {
  id: string;
  conversationId: string;
  summary: string;
  keyFacts: string[];
  createdAt: string;
}
