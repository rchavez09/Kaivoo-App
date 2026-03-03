/**
 * AI Provider Definitions — Sprint 23 P9
 *
 * Static provider configurations: models, names, API key requirements.
 */

import type { AIProviderConfig } from './types';

export const AI_PROVIDERS: AIProviderConfig[] = [
  {
    id: 'openai',
    name: 'OpenAI',
    models: [
      { id: 'gpt-4o', name: 'GPT-4o' },
      { id: 'gpt-4-turbo', name: 'GPT-4 Turbo' },
    ],
    requiresApiKey: true,
    placeholder: 'sk-...',
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    models: [
      { id: 'claude-sonnet-4-6', name: 'Claude Sonnet' },
      { id: 'claude-opus-4-6', name: 'Claude Opus' },
    ],
    requiresApiKey: true,
    placeholder: 'sk-ant-...',
  },
  {
    id: 'ollama',
    name: 'Ollama (Local)',
    models: [
      { id: 'llama3', name: 'Llama 3' },
      { id: 'mistral', name: 'Mistral' },
      { id: 'gemma', name: 'Gemma' },
    ],
    requiresApiKey: false,
    placeholder: '',
  },
];

export function getProviderConfig(providerId: string): AIProviderConfig | undefined {
  return AI_PROVIDERS.find((p) => p.id === providerId);
}
