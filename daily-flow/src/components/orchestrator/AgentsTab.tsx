import { useState, useEffect, useCallback } from 'react';
import { Bot, Plus, Pencil, Trash2, Zap, Power, PowerOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Badge } from '@/components/ui/badge';
import { useAdapters } from '@/lib/adapters';
import { toast } from 'sonner';
import type { Agent, Skill } from '@/types';
import AgentFormDialog from './AgentFormDialog';
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

const AgentsTab = () => {
  const { data } = useAdapters();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [agentSkillMap, setAgentSkillMap] = useState<Record<string, Skill[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Agent | null>(null);

  const loadData = useCallback(async () => {
    if (!data) return;
    try {
      const [agentList, skillList] = await Promise.all([data.agents.fetchAll(), data.skills.fetchAll()]);
      setAgents(agentList);
      setSkills(skillList);

      const skillMap: Record<string, Skill[]> = {};
      for (const agent of agentList) {
        skillMap[agent.id] = await data.agents.getSkills(agent.id);
      }
      setAgentSkillMap(skillMap);
    } catch (e) {
      console.error('Failed to load agents:', e);
      toast.error('Failed to load agents');
    } finally {
      setIsLoading(false);
    }
  }, [data]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreate = () => {
    setEditingAgent(null);
    setFormOpen(true);
  };

  const handleEdit = (agent: Agent) => {
    setEditingAgent(agent);
    setFormOpen(true);
  };

  const handleDelete = async () => {
    if (!data || !deleteTarget) return;
    try {
      await data.agents.delete(deleteTarget.id);
      setAgents((prev) => prev.filter((a) => a.id !== deleteTarget.id));
      toast.success(`Deleted agent "${deleteTarget.name}"`);
    } catch (e) {
      console.error('Failed to delete agent:', e);
      toast.error('Failed to delete agent');
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleSaved = () => {
    setFormOpen(false);
    setEditingAgent(null);
    loadData();
  };

  if (isLoading) {
    return <div className="py-12 text-center text-sm text-muted-foreground">Loading agents...</div>;
  }

  if (agents.length === 0) {
    return (
      <EmptyState
        icon={Bot}
        title="No agents yet"
        description="Create your first AI agent to start building your orchestration team."
        action={
          <Button size="sm" onClick={handleCreate}>
            <Plus className="mr-1.5 h-4 w-4" />
            Create Agent
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {agents.length} agent{agents.length !== 1 ? 's' : ''}
        </p>
        <Button size="sm" onClick={handleCreate}>
          <Plus className="mr-1.5 h-4 w-4" />
          Create Agent
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {agents.map((agent) => {
          const assignedSkills = agentSkillMap[agent.id] ?? [];
          return (
            <div
              key={agent.id}
              className="group relative rounded-lg border bg-card p-4 transition-colors hover:border-primary/30"
            >
              <div className="mb-2 flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Bot className="h-5 w-5 text-primary" />
                  <h3 className="font-medium text-foreground">{agent.name}</h3>
                </div>
                <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => handleEdit(agent)}
                    aria-label={`Edit ${agent.name}`}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive"
                    onClick={() => setDeleteTarget(agent)}
                    aria-label={`Delete ${agent.name}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              {agent.description && (
                <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">{agent.description}</p>
              )}

              <div className="flex flex-wrap items-center gap-2">
                {agent.model && <Badge variant="secondary">{agent.model}</Badge>}
                {assignedSkills.length > 0 && (
                  <Badge variant="outline" className="gap-1">
                    <Zap className="h-3 w-3" />
                    {assignedSkills.length} skill{assignedSkills.length !== 1 ? 's' : ''}
                  </Badge>
                )}
                {!agent.isActive && (
                  <Badge variant="outline" className="gap-1 text-muted-foreground">
                    <PowerOff className="h-3 w-3" />
                    Inactive
                  </Badge>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {formOpen && (
        <AgentFormDialog
          open={formOpen}
          onOpenChange={setFormOpen}
          agent={editingAgent}
          allSkills={skills}
          assignedSkills={editingAgent ? (agentSkillMap[editingAgent.id] ?? []) : []}
          onSaved={handleSaved}
        />
      )}

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete agent?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove &quot;{deleteTarget?.name}&quot; and all skill assignments. This cannot be undone.
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

export default AgentsTab;
