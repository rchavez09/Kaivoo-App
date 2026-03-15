import { useState, useEffect, useCallback } from 'react';
import { Zap, Plus, Pencil, Trash2, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Badge } from '@/components/ui/badge';
import { useAdapters } from '@/lib/adapters';
import { toast } from 'sonner';
import type { Skill } from '@/types';
import SkillFormDialog from './SkillFormDialog';
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

const ACTION_TYPE_LABELS: Record<string, string> = {
  prompt: 'Prompt',
  tool: 'Tool',
  composite: 'Composite',
};

const SkillsTab = () => {
  const { data } = useAdapters();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [agentCounts, setAgentCounts] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Skill | null>(null);

  const loadData = useCallback(async () => {
    if (!data) return;
    try {
      const skillList = await data.skills.fetchAll();
      setSkills(skillList);

      const counts: Record<string, number> = {};
      for (const skill of skillList) {
        counts[skill.id] = await data.skills.getAgentCount(skill.id);
      }
      setAgentCounts(counts);
    } catch (e) {
      console.error('Failed to load skills:', e);
      toast.error('Failed to load skills');
    } finally {
      setIsLoading(false);
    }
  }, [data]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreate = () => {
    setEditingSkill(null);
    setFormOpen(true);
  };

  const handleEdit = (skill: Skill) => {
    setEditingSkill(skill);
    setFormOpen(true);
  };

  const handleDelete = async () => {
    if (!data || !deleteTarget) return;
    try {
      await data.skills.delete(deleteTarget.id);
      setSkills((prev) => prev.filter((s) => s.id !== deleteTarget.id));
      toast.success(`Deleted skill "${deleteTarget.name}"`);
    } catch (e) {
      console.error('Failed to delete skill:', e);
      toast.error('Failed to delete skill');
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleSaved = () => {
    setFormOpen(false);
    setEditingSkill(null);
    loadData();
  };

  if (isLoading) {
    return <div className="py-12 text-center text-sm text-muted-foreground">Loading skills...</div>;
  }

  if (skills.length === 0) {
    return (
      <EmptyState
        icon={Zap}
        title="No skills yet"
        description="Create reusable skills that your agents can perform."
        action={
          <Button size="sm" onClick={handleCreate}>
            <Plus className="mr-1.5 h-4 w-4" />
            Create Skill
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {skills.length} skill{skills.length !== 1 ? 's' : ''}
        </p>
        <Button size="sm" onClick={handleCreate}>
          <Plus className="mr-1.5 h-4 w-4" />
          Create Skill
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {skills.map((skill) => {
          const count = agentCounts[skill.id] ?? 0;
          return (
            <div
              key={skill.id}
              className="group relative rounded-lg border bg-card p-4 transition-colors hover:border-primary/30"
            >
              <div className="mb-2 flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-amber-500" />
                  <h3 className="font-medium text-foreground">{skill.name}</h3>
                </div>
                <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => handleEdit(skill)}
                    aria-label={`Edit ${skill.name}`}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive"
                    onClick={() => setDeleteTarget(skill)}
                    aria-label={`Delete ${skill.name}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              {skill.description && (
                <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">{skill.description}</p>
              )}

              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary">{ACTION_TYPE_LABELS[skill.actionType] ?? skill.actionType}</Badge>
                {count > 0 && (
                  <Badge variant="outline" className="gap-1">
                    <Bot className="h-3 w-3" />
                    {count} agent{count !== 1 ? 's' : ''}
                  </Badge>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {formOpen && (
        <SkillFormDialog open={formOpen} onOpenChange={setFormOpen} skill={editingSkill} onSaved={handleSaved} />
      )}

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete skill?</AlertDialogTitle>
            <AlertDialogDescription>
              {(agentCounts[deleteTarget?.id ?? ''] ?? 0) > 0
                ? `This skill is used by ${agentCounts[deleteTarget?.id ?? '']} agent(s). Removing it will unassign it from all agents.`
                : 'This will permanently delete the skill. This cannot be undone.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default SkillsTab;
