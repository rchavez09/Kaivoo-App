/**
 * AI Provider Definitions — Sprint 23 P9, Sprint 24 P19/P20
 *
 * Static provider configurations: models, names, API key requirements.
 * Expanded to support 8 provider types.
 */

import type { AIProviderConfig } from './types';

export const AI_PROVIDERS: AIProviderConfig[] = [
  {
    id: 'openai',
    name: 'OpenAI',
    models: [
      { id: 'gpt-4o', name: 'GPT-4o' },
      { id: 'gpt-4o-mini', name: 'GPT-4o Mini' },
      { id: 'gpt-4-turbo', name: 'GPT-4 Turbo' },
    ],
    requiresApiKey: true,
    placeholder: 'sk-...',
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    models: [
      { id: 'claude-sonnet-4-6', name: 'Claude Sonnet 4.6' },
      { id: 'claude-haiku-4-5-20251001', name: 'Claude Haiku 4.5' },
    ],
    requiresApiKey: true,
    placeholder: 'sk-ant-...',
  },
  {
    id: 'google',
    name: 'Google AI (Gemini)',
    models: [
      { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash' },
      { id: 'gemini-2.0-flash-lite', name: 'Gemini 2.0 Flash Lite' },
      { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro' },
    ],
    requiresApiKey: true,
    placeholder: 'AIza...',
  },
  {
    id: 'groq',
    name: 'Groq',
    models: [
      { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B' },
      { id: 'llama-3.1-8b-instant', name: 'Llama 3.1 8B' },
      { id: 'mixtral-8x7b-32768', name: 'Mixtral 8x7B' },
    ],
    requiresApiKey: true,
    placeholder: 'gsk_...',
  },
  {
    id: 'mistral',
    name: 'Mistral AI',
    models: [
      { id: 'mistral-large-latest', name: 'Mistral Large' },
      { id: 'mistral-small-latest', name: 'Mistral Small' },
      { id: 'open-mixtral-8x22b', name: 'Mixtral 8x22B' },
    ],
    requiresApiKey: true,
    placeholder: '',
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    models: [
      { id: 'deepseek-chat', name: 'DeepSeek Chat' },
      { id: 'deepseek-reasoner', name: 'DeepSeek Reasoner' },
    ],
    requiresApiKey: true,
    placeholder: 'sk-...',
  },
  {
    id: 'ollama',
    name: 'Ollama (Local)',
    models: [
      { id: 'llama3', name: 'Llama 3' },
      { id: 'mistral', name: 'Mistral' },
      { id: 'gemma', name: 'Gemma' },
      { id: 'phi3', name: 'Phi-3' },
    ],
    requiresApiKey: false,
    placeholder: '',
  },
  {
    id: 'openai-compatible',
    name: 'OpenAI-Compatible (Custom)',
    models: [{ id: 'custom', name: 'Custom Model' }],
    requiresApiKey: true,
    placeholder: 'sk-...',
    baseUrl: '',
  },
];

export function getProviderConfig(providerId: string): AIProviderConfig | undefined {
  return AI_PROVIDERS.find((p) => p.id === providerId);
}
