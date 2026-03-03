/**
 * AI Types — Sprint 23 P9/P10
 *
 * Core type definitions for AI provider configuration,
 * chat messages, and conversation persistence.
 */

export type AIProviderType = 'openai' | 'anthropic' | 'ollama';

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
}

export interface AISettings {
  provider: AIProviderType;
  apiKey: string;
  model: string;
  ollamaBaseUrl: string;
  depth: AIDepth;
}

export interface ConversationMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface Conversation {
  id: string;
  title: string;
  messages: ConversationMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface SoulConfig {
  name: string;
  tone: 'professional' | 'casual' | 'playful';
  createdAt?: string;
}
