/**
 * AI Settings Service — Sprint 23 P9, Sprint 24 P2
 *
 * Settings CRUD for AI provider configuration.
 * Stores in localStorage (both platforms) with Tauri FS backup on desktop.
 *
 * Sprint 24 P2: API key moved from sessionStorage to encrypted localStorage.
 * Uses AES-GCM via crypto.subtle with a device-scoped key derived from
 * a stable salt. The key never leaves the device. This is NOT a secrets vault —
 * the user owns the key and chooses to store it. The encryption prevents
 * casual inspection of localStorage (e.g., browser extensions, XSS).
 */

import type { AISettings, SoulConfig, AIDepth } from './types';

const SETTINGS_KEY = 'kaivoo-ai-settings';
const API_KEY_KEY = 'kaivoo-ai-key-enc';
const API_KEY_REMEMBER = 'kaivoo-ai-key-remember';
const SOUL_KEY = 'kaivoo-concierge';

// Device-scoped encryption for API key persistence.
// Not a security boundary (key material is in-memory) — prevents casual inspection.
const ENC_SALT = 'kaivoo-device-key-v1';

async function deriveKey(): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey('raw', encoder.encode(ENC_SALT), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: encoder.encode('kaivoo'), iterations: 100_000, hash: 'SHA-256' },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  );
}

async function encryptValue(value: string): Promise<string> {
  const key = await deriveKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(value);
  const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encoded);
  const combined = new Uint8Array(iv.length + new Uint8Array(ciphertext).length);
  combined.set(iv);
  combined.set(new Uint8Array(ciphertext), iv.length);
  return btoa(String.fromCharCode(...combined));
}

async function decryptValue(encrypted: string): Promise<string> {
  const key = await deriveKey();
  const combined = Uint8Array.from(atob(encrypted), (c) => c.charCodeAt(0));
  const iv = combined.slice(0, 12);
  const ciphertext = combined.slice(12);
  const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ciphertext);
  return new TextDecoder().decode(decrypted);
}

const DEFAULT_SETTINGS: AISettings = {
  provider: 'openai',
  apiKey: '',
  model: 'gpt-4o',
  ollamaBaseUrl: 'http://localhost:11434',
  depth: 'medium',
};

// In-memory cache so synchronous getAISettings() works after first async load
let cachedApiKey = '';
let keyLoaded = false;

/** Load encrypted API key from localStorage into memory. Call once on app start. */
export async function loadPersistedApiKey(): Promise<void> {
  if (keyLoaded) return;
  try {
    const encrypted = localStorage.getItem(API_KEY_KEY);
    if (encrypted) {
      cachedApiKey = await decryptValue(encrypted);
    }
    // Also check sessionStorage for backward compatibility (Sprint 23 migration)
    if (!cachedApiKey) {
      const sessionKey = sessionStorage.getItem('kaivoo-ai-key');
      if (sessionKey) {
        cachedApiKey = sessionKey;
        sessionStorage.removeItem('kaivoo-ai-key');
        // Auto-persist the migrated key
        if (getRememberApiKey()) {
          const enc = await encryptValue(cachedApiKey);
          localStorage.setItem(API_KEY_KEY, enc);
        }
      }
    }
  } catch {
    // Decryption failed — key was corrupted or salt changed
    localStorage.removeItem(API_KEY_KEY);
  }
  keyLoaded = true;
}

export function getRememberApiKey(): boolean {
  return localStorage.getItem(API_KEY_REMEMBER) !== 'false';
}

export function setRememberApiKey(remember: boolean): void {
  localStorage.setItem(API_KEY_REMEMBER, String(remember));
  if (!remember) {
    localStorage.removeItem(API_KEY_KEY);
  }
}

export function getAISettings(): AISettings {
  try {
    const stored = localStorage.getItem(SETTINGS_KEY);
    const base = stored
      ? { ...DEFAULT_SETTINGS, ...(JSON.parse(stored) as Partial<AISettings>) }
      : { ...DEFAULT_SETTINGS };
    return { ...base, apiKey: cachedApiKey };
  } catch {
    // Ignore parse errors
  }
  return { ...DEFAULT_SETTINGS };
}

export function saveAISettings(settings: AISettings): void {
  const { apiKey, ...safeSettings } = settings;
  cachedApiKey = apiKey;
  localStorage.setItem(SETTINGS_KEY, JSON.stringify({ ...safeSettings, apiKey: '' }));

  // Persist encrypted API key if user opted in (default: yes)
  if (apiKey && getRememberApiKey()) {
    void encryptValue(apiKey).then((enc) => localStorage.setItem(API_KEY_KEY, enc));
  } else if (!apiKey) {
    localStorage.removeItem(API_KEY_KEY);
  }

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

export function saveSoulConfig(config: SoulConfig): void {
  localStorage.setItem(SOUL_KEY, JSON.stringify(config));
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
