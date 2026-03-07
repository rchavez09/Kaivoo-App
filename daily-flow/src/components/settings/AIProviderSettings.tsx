/**
 * AI Provider Settings — Sprint 23 P9
 *
 * Full AI configuration panel: provider selection, API key entry,
 * model picker, depth preference, and connection test.
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Eye, EyeOff, Loader2, CheckCircle2, XCircle, Zap, Sparkles, Brain, Trash2, Check } from 'lucide-react';
import { toast } from 'sonner';
import { AI_PROVIDERS, getProviderConfig } from '@/lib/ai/providers';
import {
  getAISettings,
  saveAISettings,
  getSoulConfig,
  saveSoulConfig,
  getRememberApiKey,
  setRememberApiKey,
} from '@/lib/ai/settings';
import { testConnection } from '@/lib/ai/chat-service';
import { getMemories, deleteMemory, toggleMemoryActive } from '@/lib/ai/memory-service';
import type { AISettings, AIDepth, AIProviderType, SoulConfig, AIMemory } from '@/lib/ai/types';

const TONE_OPTIONS: Array<{ value: SoulConfig['tone']; label: string; description: string }> = [
  { value: 'professional', label: 'Professional', description: 'Clear & direct' },
  { value: 'casual', label: 'Casual', description: 'Friendly & relaxed' },
  { value: 'playful', label: 'Playful', description: 'Fun & energetic' },
];

const DEPTH_OPTIONS: Array<{ value: AIDepth; label: string; description: string; icon: typeof Zap }> = [
  { value: 'light', label: 'Light', description: 'Brief responses', icon: Zap },
  { value: 'medium', label: 'Medium', description: 'Balanced detail', icon: Sparkles },
  { value: 'heavy', label: 'Heavy', description: 'Thorough responses', icon: Brain },
];

export default function AIProviderSettings() {
  const [settings, setSettings] = useState<AISettings>(getAISettings);
  const [showKey, setShowKey] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [soul, setSoul] = useState<SoulConfig>(() => getSoulConfig() ?? { name: '', tone: 'casual' });
  const [remember, setRemember] = useState(getRememberApiKey);
  const [memories, setMemories] = useState<AIMemory[]>([]);

  // Per-provider key cache — remembers keys when switching providers within a session
  const providerKeysRef = useRef<Record<string, string>>({});

  useEffect(() => {
    void getMemories(false).then(setMemories);
  }, []);

  const provider = getProviderConfig(settings.provider);

  const update = useCallback((patch: Partial<AISettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      saveAISettings(next);
      setTestResult(null);
      return next;
    });
  }, []);

  const handleProviderChange = useCallback(
    (value: string) => {
      const config = getProviderConfig(value);
      if (!config) return;
      // Save current key for current provider before switching
      if (settings.apiKey) {
        providerKeysRef.current[settings.provider] = settings.apiKey;
      }
      // Restore saved key for new provider (or empty string)
      const savedKey = providerKeysRef.current[value] || '';
      update({
        provider: value as AIProviderType,
        model: config.models[0]?.id || '',
        apiKey: savedKey,
      });
    },
    [update, settings.provider, settings.apiKey],
  );

  const handleTest = useCallback(async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const result = await testConnection(settings);
      setTestResult(result);
      if (result.ok) {
        toast.success('Connection successful');
      } else {
        toast.error('Connection failed', { description: result.message });
      }
    } catch {
      setTestResult({ ok: false, message: 'Unexpected error' });
    } finally {
      setTesting(false);
    }
  }, [settings]);

  const soulSaveTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const updateSoul = useCallback((patch: Partial<SoulConfig>) => {
    setSoul((prev) => {
      const next = { ...prev, ...patch };
      saveSoulConfig(next);
      clearTimeout(soulSaveTimerRef.current);
      soulSaveTimerRef.current = setTimeout(() => {
        toast.success('Saved', { duration: 1200, icon: <Check className="h-4 w-4" /> });
      }, 800);
      return next;
    });
  }, []);

  const canTest = settings.provider === 'ollama' || settings.apiKey.length > 5;

  return (
    <div className="space-y-6">
      {/* Provider */}
      <div>
        <label htmlFor="ai-provider" className="mb-2 block text-sm font-medium text-foreground">
          Provider
        </label>
        <Select value={settings.provider} onValueChange={handleProviderChange}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {AI_PROVIDERS.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* API Key */}
      {provider?.requiresApiKey && (
        <div>
          <label htmlFor="ai-api-key" className="mb-2 block text-sm font-medium text-foreground">
            API Key
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                id="ai-api-key"
                type={showKey ? 'text' : 'password'}
                value={settings.apiKey}
                onChange={(e) => update({ apiKey: e.target.value })}
                placeholder={provider.placeholder}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowKey((v) => !v)}
                aria-label={showKey ? 'Hide API key' : 'Show API key'}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <input
              id="remember-key"
              type="checkbox"
              checked={remember}
              onChange={(e) => {
                setRemember(e.target.checked);
                setRememberApiKey(e.target.checked);
              }}
              className="h-4 w-4 rounded border-border accent-primary"
            />
            <label htmlFor="remember-key" className="text-xs text-muted-foreground">
              Remember API key on this device
            </label>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Your API key is encrypted and stored locally. Never shared with our servers.
          </p>
        </div>
      )}

      {/* Ollama Base URL */}
      {settings.provider === 'ollama' && (
        <div>
          <label htmlFor="ollama-url" className="mb-2 block text-sm font-medium text-foreground">
            Ollama Server URL
          </label>
          <Input
            id="ollama-url"
            value={settings.ollamaBaseUrl}
            onChange={(e) => update({ ollamaBaseUrl: e.target.value })}
            placeholder="http://localhost:11434"
          />
        </div>
      )}

      {/* Custom Base URL for OpenAI-compatible */}
      {settings.provider === 'openai-compatible' && (
        <div>
          <label htmlFor="custom-base-url" className="mb-2 block text-sm font-medium text-foreground">
            Base URL
          </label>
          <Input
            id="custom-base-url"
            value={settings.customBaseUrl || ''}
            onChange={(e) => update({ customBaseUrl: e.target.value })}
            placeholder="https://your-provider.com/v1"
          />
          <p className="mt-1 text-xs text-muted-foreground">
            The base URL for the OpenAI-compatible API (must support /chat/completions).
          </p>
        </div>
      )}

      {/* Model */}
      <div>
        <label htmlFor="ai-model" className="mb-2 block text-sm font-medium text-foreground">
          Model
        </label>
        <Select value={settings.model} onValueChange={(value) => update({ model: value })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {provider?.models.map((m) => (
              <SelectItem key={m.id} value={m.id}>
                {m.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Depth Preference */}
      <div>
        <label className="mb-2 block text-sm font-medium text-foreground">Response Depth</label>
        <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Response depth">
          {DEPTH_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            const selected = settings.depth === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => update({ depth: opt.value })}
                className={`relative rounded-xl border p-3 text-center transition-colors ${
                  selected
                    ? 'border-primary bg-primary/5 text-foreground'
                    : 'border-border bg-card text-muted-foreground hover:border-primary/50'
                }`}
              >
                {selected && <Check className="absolute right-1.5 top-1.5 h-3 w-3 text-primary" aria-hidden="true" />}
                <Icon className="mx-auto mb-1 h-4 w-4" />
                <p className="text-sm font-medium">{opt.label}</p>
                <p className="text-xs text-muted-foreground">{opt.description}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Test Connection */}
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-foreground">Test Connection</p>
            <p className="text-xs text-muted-foreground">Verify your API key and model access</p>
          </div>
          <Button size="sm" variant="outline" onClick={() => void handleTest()} disabled={!canTest || testing}>
            {testing ? (
              <>
                <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                Testing...
              </>
            ) : (
              'Test Connection'
            )}
          </Button>
        </div>
        {testResult && (
          <div
            className={`mt-3 flex items-start gap-2 rounded-lg p-3 text-sm ${
              testResult.ok ? 'bg-success text-success-foreground' : 'bg-destructive/10 text-destructive'
            }`}
          >
            {testResult.ok ? (
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
            ) : (
              <XCircle className="mt-0.5 h-4 w-4 shrink-0" />
            )}
            <p>{testResult.message}</p>
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="border-t border-border" />

      {/* Concierge Personality */}
      <div>
        <label htmlFor="soul-name" className="mb-2 block text-sm font-medium text-foreground">
          Concierge Name
        </label>
        <Input
          id="soul-name"
          value={soul.name}
          onChange={(e) => updateSoul({ name: e.target.value })}
          placeholder="Flow Assistant"
        />
        <p className="mt-1 text-xs text-muted-foreground">The name your AI concierge introduces itself as.</p>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-foreground">Concierge Tone</label>
        <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Concierge tone">
          {TONE_OPTIONS.map((opt) => {
            const selected = soul.tone === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => updateSoul({ tone: opt.value })}
                className={`relative rounded-xl border p-3 text-center transition-colors ${
                  selected
                    ? 'border-primary bg-primary/5 text-foreground'
                    : 'border-border bg-card text-muted-foreground hover:border-primary/50'
                }`}
              >
                {selected && <Check className="absolute right-1.5 top-1.5 h-3 w-3 text-primary" aria-hidden="true" />}
                <p className="text-sm font-medium">{opt.label}</p>
                <p className="text-xs text-muted-foreground">{opt.description}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Your Name */}
      <div>
        <label htmlFor="soul-user-name" className="mb-2 block text-sm font-medium text-foreground">
          Your Name
        </label>
        <Input
          id="soul-user-name"
          value={soul.userName || ''}
          onChange={(e) => updateSoul({ userName: e.target.value })}
          placeholder="What should the concierge call you?"
        />
      </div>

      {/* Backstory */}
      <div>
        <label htmlFor="soul-backstory" className="mb-2 block text-sm font-medium text-foreground">
          Concierge Backstory
        </label>
        <Textarea
          id="soul-backstory"
          value={soul.backstory || ''}
          onChange={(e) => updateSoul({ backstory: e.target.value })}
          placeholder="Optional personality description, e.g. 'You are a stoic productivity coach who quotes Marcus Aurelius...'"
          rows={3}
          className="resize-none text-sm"
        />
      </div>

      {/* Communication Notes */}
      <div>
        <label htmlFor="soul-comm-notes" className="mb-2 block text-sm font-medium text-foreground">
          Communication Preferences
        </label>
        <Textarea
          id="soul-comm-notes"
          value={soul.communicationNotes || ''}
          onChange={(e) => updateSoul({ communicationNotes: e.target.value })}
          placeholder="e.g. 'I prefer bullet points over long paragraphs. I like when you ask follow-up questions.'"
          rows={2}
          className="resize-none text-sm"
        />
      </div>

      {/* Working Style */}
      <div>
        <label htmlFor="soul-working-style" className="mb-2 block text-sm font-medium text-foreground">
          Working Style
        </label>
        <Input
          id="soul-working-style"
          value={soul.workingStyle || ''}
          onChange={(e) => updateSoul({ workingStyle: e.target.value })}
          placeholder="e.g. 'Deep work mornings, meetings in the afternoon'"
        />
      </div>

      {/* Divider */}
      <div className="border-t border-border" />

      {/* Memories */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-foreground">Memories</p>
            <p className="text-xs text-muted-foreground">
              Things your concierge remembers about you ({memories.length})
            </p>
          </div>
        </div>

        {memories.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-6 text-center">
            <p className="text-sm text-muted-foreground">
              No memories yet. Chat with your concierge and ask it to remember things!
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {memories.map((memory) => (
              <div
                key={memory.id}
                className={`group flex min-h-[44px] items-start gap-3 rounded-lg border p-3 transition-colors ${
                  memory.active ? 'border-border bg-card' : 'border-border/50 bg-muted/30'
                }`}
              >
                <div className="min-w-0 flex-1">
                  <p className={`text-sm ${memory.active ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {memory.content}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {memory.category} · {memory.source} · {new Date(memory.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <button
                    type="button"
                    onClick={() => {
                      void toggleMemoryActive(memory.id, !memory.active)
                        .then(() => getMemories(false))
                        .then(setMemories);
                    }}
                    className="min-h-[44px] min-w-[44px] rounded px-2 text-xs text-muted-foreground hover:bg-secondary hover:text-foreground"
                    aria-label={memory.active ? 'Disable memory' : 'Enable memory'}
                  >
                    {memory.active ? 'Disable' : 'Enable'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      void deleteMemory(memory.id)
                        .then(() => getMemories(false))
                        .then((m) => {
                          setMemories(m);
                          toast.success('Memory deleted');
                        });
                    }}
                    className="min-h-[44px] min-w-[44px] rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                    aria-label="Delete memory"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
