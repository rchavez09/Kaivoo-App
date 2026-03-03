/**
 * AI Provider Settings — Sprint 23 P9
 *
 * Full AI configuration panel: provider selection, API key entry,
 * model picker, depth preference, and connection test.
 */

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Eye, EyeOff, Loader2, CheckCircle2, XCircle, Zap, Sparkles, Brain } from 'lucide-react';
import { toast } from 'sonner';
import { AI_PROVIDERS, getProviderConfig } from '@/lib/ai/providers';
import { getAISettings, saveAISettings } from '@/lib/ai/settings';
import { testConnection } from '@/lib/ai/chat-service';
import type { AISettings, AIDepth, AIProviderType } from '@/lib/ai/types';

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
      update({
        provider: value as AIProviderType,
        model: config.models[0]?.id || '',
        apiKey: value === settings.provider ? settings.apiKey : '',
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

  const canTest = settings.provider === 'ollama' || settings.apiKey.length > 5;

  return (
    <div className="space-y-6">
      {/* Provider */}
      <div>
        <label className="mb-2 block text-sm font-medium text-foreground">Provider</label>
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
          <label className="mb-2 block text-sm font-medium text-foreground">API Key</label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                type={showKey ? 'text' : 'password'}
                value={settings.apiKey}
                onChange={(e) => update({ apiKey: e.target.value })}
                placeholder={provider.placeholder}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowKey((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Your API key is stored locally and never shared with Kaivoo servers.
          </p>
        </div>
      )}

      {/* Ollama Base URL */}
      {settings.provider === 'ollama' && (
        <div>
          <label className="mb-2 block text-sm font-medium text-foreground">Ollama Server URL</label>
          <Input
            value={settings.ollamaBaseUrl}
            onChange={(e) => update({ ollamaBaseUrl: e.target.value })}
            placeholder="http://localhost:11434"
          />
        </div>
      )}

      {/* Model */}
      <div>
        <label className="mb-2 block text-sm font-medium text-foreground">Model</label>
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
        <div className="grid grid-cols-3 gap-2">
          {DEPTH_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => update({ depth: opt.value })}
                className={`rounded-xl border p-3 text-center transition-colors ${
                  settings.depth === opt.value
                    ? 'border-primary bg-primary/5 text-foreground'
                    : 'border-border bg-card text-muted-foreground hover:border-primary/50'
                }`}
              >
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
          <Button
            size="sm"
            variant="outline"
            onClick={() => void handleTest()}
            disabled={!canTest || testing}
          >
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
              testResult.ok
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                : 'bg-destructive/10 text-destructive'
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
    </div>
  );
}
