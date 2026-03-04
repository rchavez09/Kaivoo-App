/**
 * Setup Wizard — Sprint 23 P5
 *
 * First-launch multi-step wizard. Handles vault folder confirmation,
 * Obsidian import (P6), concierge hatching (P7), and guided tour (P8).
 * Skips desktop-only steps when running on the web.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sparkles, FolderOpen, Download, Bot, Check, ChevronRight, ChevronLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { importObsidianVault } from '@/lib/vault/obsidian-import';
import type { ImportProgress, ImportResult } from '@/lib/vault/obsidian-import';
import { supabase } from '@/integrations/supabase/client';

// ─── Types ───

type WizardStep = 'welcome' | 'vault' | 'import' | 'concierge' | 'complete';

interface WizardState {
  vaultPath: string;
  importObsidian: boolean;
  conciergeName: string;
  conciergeTone: 'professional' | 'casual' | 'playful';
}

const DEFAULT_STATE: WizardState = {
  vaultPath: '',
  importObsidian: false,
  conciergeName: 'Kai',
  conciergeTone: 'casual',
};

const isDesktop = (): boolean => typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;

// ─── Wizard Component ───

const SetupWizard = () => {
  const navigate = useNavigate();
  const desktop = isDesktop();
  const [step, setStep] = useState<WizardStep>('welcome');
  const [state, setState] = useState<WizardState>(DEFAULT_STATE);

  // Desktop: vault + import steps. Web: skip both.
  const activeSteps = useMemo<WizardStep[]>(
    () => (desktop ? ['welcome', 'vault', 'import', 'concierge', 'complete'] : ['welcome', 'concierge', 'complete']),
    [desktop],
  );

  const stepIndex = activeSteps.indexOf(step);

  const goNext = useCallback(() => {
    const next = activeSteps[stepIndex + 1];
    if (next) setStep(next);
  }, [stepIndex, activeSteps]);

  const goBack = useCallback(() => {
    const prev = activeSteps[stepIndex - 1];
    if (prev) setStep(prev);
  }, [stepIndex, activeSteps]);

  const handleComplete = useCallback(() => {
    localStorage.setItem('kaivoo-setup-complete', 'true');
    localStorage.setItem('kaivoo-show-tour', 'true');

    // Persist setup_complete to Supabase user metadata (server-side backup).
    // Survives origin changes (deploy previews) and localStorage clears.
    if (!desktop) {
      void supabase.auth.updateUser({ data: { setup_complete: true } });
    }

    // Store concierge config (web fallback + cache)
    localStorage.setItem(
      'kaivoo-concierge',
      JSON.stringify({
        name: state.conciergeName,
        tone: state.conciergeTone,
      }),
    );

    // Desktop: write .kaivoo/soul.json to vault
    if (desktop) {
      void (async () => {
        try {
          const { writeTextFile, mkdir, exists } = await import('@tauri-apps/plugin-fs');
          let vaultPath = state.vaultPath;
          if (!vaultPath) {
            const { appDataDir } = await import('@tauri-apps/api/path');
            vaultPath = `${await appDataDir()}vault`;
          }
          const configDir = `${vaultPath}/.kaivoo`;
          if (!(await exists(configDir))) {
            await mkdir(configDir, { recursive: true });
          }
          await writeTextFile(
            `${configDir}/soul.json`,
            JSON.stringify(
              {
                name: state.conciergeName,
                tone: state.conciergeTone,
                createdAt: new Date().toISOString(),
              },
              null,
              2,
            ),
          );
        } catch (e) {
          console.error('Failed to write soul file:', e);
        }
      })();
    }

    navigate('/', { replace: true });
  }, [navigate, state.conciergeName, state.conciergeTone, state.vaultPath, desktop]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      {/* Progress dots (shown on middle steps only) */}
      {step !== 'welcome' && step !== 'complete' && (
        <div className="mb-8 flex items-center gap-2">
          {activeSteps.slice(1, -1).map((s, i) => (
            <div
              key={s}
              className={`h-2 w-8 rounded-full transition-colors ${
                i <= activeSteps.slice(1, -1).indexOf(step) ? 'bg-primary' : 'bg-muted'
              }`}
            />
          ))}
        </div>
      )}

      {/* Step content */}
      <div className="w-full max-w-lg">
        {step === 'welcome' && <WelcomeStep onNext={goNext} />}
        {step === 'vault' && <VaultStep state={state} setState={setState} onNext={goNext} onBack={goBack} />}
        {step === 'import' && <ImportStep setState={setState} onNext={goNext} onBack={goBack} />}
        {step === 'concierge' && <ConciergeStep state={state} setState={setState} onNext={goNext} onBack={goBack} />}
        {step === 'complete' && <CompleteStep state={state} onComplete={handleComplete} onBack={goBack} />}
      </div>
    </div>
  );
};

// ─── Welcome Step ───

function WelcomeStep({ onNext }: { onNext: () => void }) {
  return (
    <div className="text-center">
      <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10">
        <Sparkles className="h-10 w-10 text-primary" />
      </div>
      <h1 className="mb-3 text-3xl font-bold text-foreground">Welcome to Kaivoo</h1>
      <p className="mb-8 text-lg text-muted-foreground">
        Your personal knowledge operating system.
        <br />
        Let&apos;s get you set up in a few quick steps.
      </p>
      <Button size="lg" onClick={onNext} className="gap-2">
        Get Started
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}

// ─── Vault Step (Desktop only) ───

function VaultStep({
  state,
  setState,
  onNext,
  onBack,
}: {
  state: WizardState;
  setState: React.Dispatch<React.SetStateAction<WizardState>>;
  onNext: () => void;
  onBack: () => void;
}) {
  const [resolvedPath, setResolvedPath] = useState(state.vaultPath);

  // Resolve the default vault path on mount
  useEffect(() => {
    if (resolvedPath) return;
    void (async () => {
      try {
        const { appDataDir } = await import('@tauri-apps/api/path');
        const root = await appDataDir();
        setResolvedPath(`${root}vault`);
      } catch {
        setResolvedPath('~/Kaivoo/vault');
      }
    })();
  }, [resolvedPath]);

  const handleBrowse = async () => {
    try {
      // @ts-expect-error — plugin-dialog is optional, installed separately
      const { open } = await import('@tauri-apps/plugin-dialog');
      const selected = await open({ directory: true, title: 'Choose Vault Folder' });
      if (selected) {
        const path = selected as string;
        setResolvedPath(path);
        setState((prev) => ({ ...prev, vaultPath: path }));
      }
    } catch {
      toast.info('Folder picker not available', {
        description: 'Using the default vault location.',
      });
    }
  };

  const handleNext = () => {
    // Store custom vault path if user selected one
    if (state.vaultPath) {
      localStorage.setItem('kaivoo-vault-path', state.vaultPath);
    }
    onNext();
  };

  return (
    <div className="text-center">
      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
        <FolderOpen className="h-8 w-8 text-primary" />
      </div>
      <h2 className="mb-2 text-2xl font-semibold text-foreground">Your Vault</h2>
      <p className="mb-6 text-muted-foreground">
        Kaivoo stores your notes, captures, and topics in a local vault folder. You can open these files in any markdown
        editor.
      </p>

      <div className="mb-6 rounded-xl border border-border bg-card p-4 text-left">
        <p className="mb-2 text-sm font-medium text-muted-foreground">Vault location</p>
        <div className="flex items-center gap-2">
          <code className="flex-1 truncate rounded bg-muted px-3 py-2 text-sm text-foreground">
            {resolvedPath || 'Resolving...'}
          </code>
          <Button variant="outline" size="sm" onClick={() => void handleBrowse()}>
            Browse
          </Button>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">Folders: Topics, Journal, Library, Inbox</p>
      </div>

      <div className="flex justify-between">
        <Button variant="ghost" onClick={onBack} className="gap-2">
          <ChevronLeft className="h-4 w-4" />
          Back
        </Button>
        <Button onClick={handleNext} className="gap-2">
          Continue
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

// ─── Import Step (Desktop only — stub for P6) ───

function ImportStep({
  setState,
  onNext,
  onBack,
}: {
  setState: React.Dispatch<React.SetStateAction<WizardState>>;
  onNext: () => void;
  onBack: () => void;
}) {
  const [phase, setPhase] = useState<'choose' | 'importing' | 'done'>('choose');
  const [progress, setProgress] = useState<ImportProgress | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);

  const handleImport = async () => {
    try {
      // @ts-expect-error — plugin-dialog is optional, installed separately
      const { open } = await import('@tauri-apps/plugin-dialog');
      const selected = await open({
        directory: true,
        title: 'Select your Obsidian vault folder',
      });
      if (!selected) return;

      setPhase('importing');

      // Resolve Kaivoo vault path
      let kaivooPath: string;
      const customPath = localStorage.getItem('kaivoo-vault-path');
      if (customPath) {
        kaivooPath = customPath;
      } else {
        const { appDataDir } = await import('@tauri-apps/api/path');
        kaivooPath = `${await appDataDir()}vault`;
      }

      const importResult = await importObsidianVault(selected as string, kaivooPath, setProgress);

      setResult(importResult);
      setState((prev) => ({ ...prev, importObsidian: true }));
      setPhase('done');

      if (importResult.filesImported > 0) {
        toast.success(`Imported ${importResult.filesImported} files`);
      } else if (importResult.skipped > 0) {
        toast.info('All files already imported');
      }
    } catch {
      toast.info('Folder picker not available', {
        description: 'The import feature requires the desktop app.',
      });
    }
  };

  // Importing phase — progress indicator
  if (phase === 'importing') {
    return (
      <div className="text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
        <h2 className="mb-2 text-2xl font-semibold text-foreground">Importing Notes</h2>
        {progress && (
          <div className="space-y-2">
            <p className="text-muted-foreground">
              {progress.phase === 'scanning'
                ? 'Scanning for markdown files...'
                : `${progress.current} of ${progress.total} files`}
            </p>
            {progress.currentFile && <p className="truncate text-xs text-muted-foreground">{progress.currentFile}</p>}
          </div>
        )}
      </div>
    );
  }

  // Done phase — results summary
  if (phase === 'done' && result) {
    return (
      <div className="text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <Check className="h-8 w-8 text-primary" />
        </div>
        <h2 className="mb-2 text-2xl font-semibold text-foreground">Import Complete</h2>
        <div className="mb-6 space-y-1 text-muted-foreground">
          <p>
            {result.filesImported} file{result.filesImported !== 1 ? 's' : ''} imported
          </p>
          {result.skipped > 0 && <p>{result.skipped} skipped (already exist)</p>}
          {result.foldersCreated > 0 && (
            <p>
              {result.foldersCreated} folder{result.foldersCreated !== 1 ? 's' : ''} created
            </p>
          )}
          {result.hashtags.length > 0 && (
            <p>
              {result.hashtags.length} hashtag{result.hashtags.length !== 1 ? 's' : ''} indexed
            </p>
          )}
          {result.errors.length > 0 && (
            <p className="text-amber-500">
              {result.errors.length} error{result.errors.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>
        <Button onClick={onNext} className="gap-2">
          Continue
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  // Choose phase — import or skip
  return (
    <div className="text-center">
      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
        <Download className="h-8 w-8 text-primary" />
      </div>
      <h2 className="mb-2 text-2xl font-semibold text-foreground">Import from Obsidian</h2>
      <p className="mb-6 text-muted-foreground">
        Already have an Obsidian vault? We can import your notes while keeping the originals safe.
      </p>

      <div className="mb-6 space-y-3">
        <button
          type="button"
          className="flex w-full items-start gap-3 rounded-xl border border-border bg-card p-4 text-left transition-colors hover:border-primary/50 hover:bg-accent/50"
          onClick={() => void handleImport()}
        >
          <Download className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <div>
            <p className="font-medium text-foreground">Yes, import my vault</p>
            <p className="text-xs text-muted-foreground">Copy .md files into Kaivoo (non-destructive)</p>
          </div>
        </button>
        <button
          type="button"
          className="flex w-full items-start gap-3 rounded-xl border border-border bg-card p-4 text-left transition-colors hover:border-primary/50 hover:bg-accent/50"
          onClick={() => {
            setState((prev) => ({ ...prev, importObsidian: false }));
            onNext();
          }}
        >
          <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
          <div>
            <p className="font-medium text-foreground">Start fresh</p>
            <p className="text-xs text-muted-foreground">I&apos;ll create my notes from scratch</p>
          </div>
        </button>
      </div>

      <div className="flex justify-start">
        <Button variant="ghost" onClick={onBack} className="gap-2">
          <ChevronLeft className="h-4 w-4" />
          Back
        </Button>
      </div>
    </div>
  );
}

// ─── Concierge Step ───

function ConciergeStep({
  state,
  setState,
  onNext,
  onBack,
}: {
  state: WizardState;
  setState: React.Dispatch<React.SetStateAction<WizardState>>;
  onNext: () => void;
  onBack: () => void;
}) {
  const tones = [
    { value: 'professional' as const, label: 'Professional', desc: 'Clear and direct' },
    { value: 'casual' as const, label: 'Casual', desc: 'Friendly and relaxed' },
    { value: 'playful' as const, label: 'Playful', desc: 'Fun and energetic' },
  ];

  return (
    <div className="text-center">
      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
        <Bot className="h-8 w-8 text-primary" />
      </div>
      <h2 className="mb-2 text-2xl font-semibold text-foreground">Meet Your Concierge</h2>
      <p className="mb-6 text-muted-foreground">
        Your AI companion helps you organize, plan, and think. Give it a name and personality.
      </p>

      <div className="mb-6 space-y-4 text-left">
        <div>
          <label htmlFor="concierge-name" className="mb-2 block text-sm font-medium text-foreground">
            Name
          </label>
          <Input
            id="concierge-name"
            value={state.conciergeName}
            onChange={(e) => setState((prev) => ({ ...prev, conciergeName: e.target.value }))}
            placeholder="e.g., Kai, Atlas, Nova"
          />
        </div>
        <div>
          <p className="mb-2 text-sm font-medium text-foreground">Tone</p>
          <div className="grid grid-cols-3 gap-2">
            {tones.map((tone) => (
              <button
                key={tone.value}
                type="button"
                onClick={() => setState((prev) => ({ ...prev, conciergeTone: tone.value }))}
                className={`rounded-xl border p-3 text-center transition-colors ${
                  state.conciergeTone === tone.value
                    ? 'border-primary bg-primary/5 text-foreground'
                    : 'border-border bg-card text-muted-foreground hover:border-primary/50'
                }`}
              >
                <p className="text-sm font-medium">{tone.label}</p>
                <p className="text-xs text-muted-foreground">{tone.desc}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-between">
        <Button variant="ghost" onClick={onBack} className="gap-2">
          <ChevronLeft className="h-4 w-4" />
          Back
        </Button>
        <Button onClick={onNext} className="gap-2">
          Continue
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

// ─── Complete Step ───

function CompleteStep({
  state,
  onComplete,
  onBack,
}: {
  state: WizardState;
  onComplete: () => void;
  onBack: () => void;
}) {
  return (
    <div className="text-center">
      <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
        <Check className="h-10 w-10 text-primary" />
      </div>
      <h2 className="mb-3 text-2xl font-semibold text-foreground">You&apos;re All Set!</h2>
      <p className="mb-2 text-muted-foreground">{state.conciergeName} is ready to help you organize your world.</p>
      <p className="mb-8 text-sm text-muted-foreground">You can always adjust settings later from the Settings page.</p>
      <Button size="lg" onClick={onComplete} className="gap-2">
        <Sparkles className="h-4 w-4" />
        Start Using Kaivoo
      </Button>
      <div className="mt-4">
        <Button variant="ghost" onClick={onBack} className="gap-2 text-sm">
          <ChevronLeft className="h-4 w-4" />
          Go back
        </Button>
      </div>
    </div>
  );
}

export default SetupWizard;
