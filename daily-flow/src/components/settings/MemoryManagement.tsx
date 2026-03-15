/**
 * Memory Management Settings — Sprint 38 P5
 *
 * Tier-aware memory management: overview, token budget visualization,
 * tabbed editor with promote/demote/delete per memory.
 */

import { useState, useEffect, useCallback } from 'react';
import { Brain, ChevronUp, ChevronDown, Trash2, RefreshCw, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { getMemories, deleteMemory, updateMemoryTier } from '@/lib/ai/memory-service';
import { runConsolidation, formatConsolidationInsight } from '@/lib/ai/memory-consolidation';
import { estimateTokens } from '@/lib/ai/prompt-assembler';
import { getHeartbeatSettings, saveHeartbeatSettings } from '@/lib/ai/settings';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import type { AIMemory, MemoryTier } from '@/lib/ai/types';

const TIERS: Array<{ key: MemoryTier; label: string; description: string }> = [
  { key: 'core_identity', label: 'Core Identity', description: 'Always loaded — who you are' },
  { key: 'active_context', label: 'Active Context', description: "Loaded when relevant — what you're doing" },
  { key: 'episodic', label: 'Episodic Memory', description: "Searched on-demand — what you've done" },
];

const MEMORY_TOKEN_BUDGET = 3500;

function tierLabel(tier: MemoryTier): string {
  return TIERS.find((t) => t.key === tier)?.label ?? tier;
}

export default function MemoryManagement() {
  const [memories, setMemories] = useState<AIMemory[]>([]);
  const [activeTier, setActiveTier] = useState<MemoryTier>('core_identity');
  const [consolidating, setConsolidating] = useState(false);
  const [consolidationEnabled, setConsolidationEnabled] = useState(
    () => getHeartbeatSettings().memoryConsolidationEnabled,
  );
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const all = await getMemories(false);
    setMemories(all.filter((m) => m.active));
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const tierMemories = memories.filter((m) => m.tier === activeTier);
  const tierCounts = {
    core_identity: memories.filter((m) => m.tier === 'core_identity').length,
    active_context: memories.filter((m) => m.tier === 'active_context').length,
    episodic: memories.filter((m) => m.tier === 'episodic').length,
  };

  // Token budget estimate
  const totalTokens = estimateTokens(memories.map((m) => m.content).join(' '));
  const budgetPercent = Math.min(100, Math.round((totalTokens / MEMORY_TOKEN_BUDGET) * 100));

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deleteMemory(deleteTarget);
    setDeleteTarget(null);
    await refresh();
    toast.success('Memory deleted');
  };

  const handlePromote = async (memory: AIMemory) => {
    const promotionMap: Partial<Record<MemoryTier, MemoryTier>> = {
      episodic: 'active_context',
      active_context: 'core_identity',
    };
    const newTier = promotionMap[memory.tier];
    if (!newTier) return;
    await updateMemoryTier(memory.id, newTier);
    await refresh();
    toast.success(`Promoted to ${tierLabel(newTier)}`);
  };

  const handleDemote = async (memory: AIMemory) => {
    const demotionMap: Partial<Record<MemoryTier, MemoryTier>> = {
      core_identity: 'active_context',
      active_context: 'episodic',
    };
    const newTier = demotionMap[memory.tier];
    if (!newTier) return;
    await updateMemoryTier(memory.id, newTier);
    await refresh();
    toast.success(`Demoted to ${tierLabel(newTier)}`);
  };

  const handleConsolidate = async () => {
    setConsolidating(true);
    try {
      const result = await runConsolidation(true);
      const insight = formatConsolidationInsight(result);
      if (insight) {
        toast.success(insight);
      } else {
        toast.info('Memory is already clean — nothing to consolidate');
      }
      await refresh();
    } catch {
      toast.error('Consolidation failed');
    } finally {
      setConsolidating(false);
    }
  };

  const handleConsolidationToggle = (enabled: boolean) => {
    setConsolidationEnabled(enabled);
    const settings = getHeartbeatSettings();
    saveHeartbeatSettings({ ...settings, memoryConsolidationEnabled: enabled });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Brain className="h-4 w-4 text-primary" />
        <p className="text-sm font-medium text-foreground">Memory Management</p>
      </div>

      {/* Token Budget Bar */}
      <div className="rounded-lg border border-border bg-card p-3">
        <div className="mb-1.5 flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Memory Budget</span>
          <span className={budgetPercent > 90 ? 'font-medium text-destructive' : 'text-muted-foreground'}>
            ~{totalTokens} / {MEMORY_TOKEN_BUDGET} tokens
          </span>
        </div>
        <div
          className="h-2 overflow-hidden rounded-full bg-secondary"
          role="progressbar"
          aria-valuenow={budgetPercent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Memory token budget"
        >
          <div
            className={`h-full rounded-full transition-all ${
              budgetPercent > 90 ? 'bg-destructive' : budgetPercent > 70 ? 'bg-amber-500' : 'bg-primary'
            }`}
            style={{ width: `${budgetPercent}%` }}
          />
        </div>
      </div>

      {/* Tier Tabs */}
      <div className="flex gap-1 rounded-lg bg-secondary/50 p-1" role="tablist" aria-label="Memory tiers">
        {TIERS.map((tier) => (
          <button
            key={tier.key}
            type="button"
            role="tab"
            aria-selected={activeTier === tier.key}
            aria-controls={`tier-panel-${tier.key}`}
            onClick={() => setActiveTier(tier.key)}
            className={`flex-1 rounded-md px-2 py-1.5 text-xs font-medium transition-colors ${
              activeTier === tier.key
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tier.label} ({tierCounts[tier.key]})
          </button>
        ))}
      </div>

      {/* Tier Description */}
      <p className="text-xs text-muted-foreground">{TIERS.find((t) => t.key === activeTier)?.description}</p>

      {/* Memory List */}
      <div
        id={`tier-panel-${activeTier}`}
        role="tabpanel"
        className="space-y-2"
        aria-label={`${tierLabel(activeTier)} memories`}
      >
        {tierMemories.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border p-6 text-center">
            <p className="text-sm text-muted-foreground">No memories in this tier.</p>
          </div>
        ) : (
          tierMemories.map((memory) => (
            <div
              key={memory.id}
              className="group flex min-h-[44px] items-start gap-2 rounded-lg border border-border bg-card p-3"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm text-foreground">{memory.content}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {memory.category} · score {memory.importanceScore.toFixed(1)} · accessed {memory.accessCount}x
                </p>
              </div>
              <div className="flex shrink-0 gap-0.5 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100">
                {/* Promote */}
                {memory.tier !== 'core_identity' && (
                  <button
                    type="button"
                    onClick={() => void handlePromote(memory)}
                    className="min-h-[36px] min-w-[36px] rounded p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
                    aria-label={`Promote to ${tierLabel(memory.tier === 'episodic' ? 'active_context' : 'core_identity')}`}
                    title="Promote"
                  >
                    <ChevronUp className="h-4 w-4" />
                  </button>
                )}
                {/* Demote */}
                {memory.tier !== 'episodic' && (
                  <button
                    type="button"
                    onClick={() => void handleDemote(memory)}
                    className="min-h-[36px] min-w-[36px] rounded p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
                    aria-label={`Demote to ${tierLabel(memory.tier === 'core_identity' ? 'active_context' : 'episodic')}`}
                    title="Demote"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </button>
                )}
                {/* Delete */}
                <button
                  type="button"
                  onClick={() => setDeleteTarget(memory.id)}
                  className="min-h-[36px] min-w-[36px] rounded p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                  aria-label="Delete memory"
                  title="Delete"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Consolidation Controls */}
      <div className="space-y-3 rounded-lg border border-border bg-card p-3">
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="consolidation-toggle" className="text-sm font-medium">
              Auto-consolidation
            </Label>
            <p className="text-xs text-muted-foreground">Dedup, prune, and organize during heartbeat</p>
          </div>
          <Switch
            id="consolidation-toggle"
            checked={consolidationEnabled}
            onCheckedChange={handleConsolidationToggle}
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => void handleConsolidate()}
          disabled={consolidating}
        >
          {consolidating ? (
            <>
              <Loader2 className="mr-2 h-3 w-3 animate-spin" />
              Consolidating...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-3 w-3" />
              Run Consolidation Now
            </>
          )}
        </Button>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete memory?</AlertDialogTitle>
            <AlertDialogDescription>
              This memory will be permanently removed. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => void handleDelete()}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
