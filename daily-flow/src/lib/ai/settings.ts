/**
 * AI Settings Service — Sprint 23 P9
 *
 * Settings CRUD for AI provider configuration.
 * Stores in localStorage (both platforms) with Tauri FS backup on desktop.
 */

import type { AISettings, SoulConfig, AIDepth } from './types';

const SETTINGS_KEY = 'kaivoo-ai-settings';
const SOUL_KEY = 'kaivoo-concierge';

const DEFAULT_SETTINGS: AISettings = {
  provider: 'openai',
  apiKey: '',
  model: 'gpt-4o',
  ollamaBaseUrl: 'http://localhost:11434',
  depth: 'medium',
};

export function getAISettings(): AISettings {
  try {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (stored) {
      return { ...DEFAULT_SETTINGS, ...(JSON.parse(stored) as Partial<AISettings>) };
    }
  } catch {
    // Ignore parse errors
  }
  return { ...DEFAULT_SETTINGS };
}

export function saveAISettings(settings: AISettings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));

  // Desktop: also write to .kaivoo/settings.json (fire-and-forget, no API key)
  if (typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window) {
    void writeSettingsToVault(settings);
  }
}

async function writeSettingsToVault(settings: AISettings): Promise<void> {
  try {
    const { writeTextFile, mkdir, exists } = await import('@tauri-apps/plugin-fs');
    const customPath = localStorage.getItem('kaivoo-vault-path');
    let vaultPath: string;
    if (customPath) {
      vaultPath = customPath;
    } else {
      const { appDataDir } = await import('@tauri-apps/api/path');
      vaultPath = `${await appDataDir()}vault`;
    }
    const configDir = `${vaultPath}/.kaivoo`;
    if (!(await exists(configDir))) {
      await mkdir(configDir, { recursive: true });
    }
    // Omit API key from vault file for safety
    const safeSettings = { ...settings, apiKey: '***' };
    await writeTextFile(`${configDir}/settings.json`, JSON.stringify(safeSettings, null, 2));
  } catch (e) {
    console.error('Failed to write settings to vault:', e);
  }
}

export function getSoulConfig(): SoulConfig | null {
  try {
    const stored = localStorage.getItem(SOUL_KEY);
    if (stored) return JSON.parse(stored) as SoulConfig;
  } catch {
    // Ignore
  }
  return null;
}

export function buildSystemPrompt(soul: SoulConfig | null, depth: AIDepth): string {
  const name = soul?.name || 'Kaivoo Assistant';
  const tone = soul?.tone || 'casual';

  const toneMap: Record<string, string> = {
    professional: 'Be clear, direct, and professional in your responses.',
    casual: 'Be friendly, relaxed, and conversational.',
    playful: 'Be fun, energetic, and use casual language.',
  };

  const depthMap: Record<string, string> = {
    light: 'Keep responses brief — a few sentences at most.',
    medium: 'Provide moderate detail in your responses.',
    heavy: 'Be thorough and detailed in your responses.',
  };

  return `You are ${name}, a ${tone} AI concierge for Kaivoo — a personal knowledge operating system that helps users organize notes, tasks, topics, and daily journals. ${toneMap[tone]} ${depthMap[depth]}`;
}
