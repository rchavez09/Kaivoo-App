import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { useAdapters } from '@/lib/adapters';
import { AI_PROVIDERS } from '@/lib/ai/providers';
import { toast } from 'sonner';
import type { Agent, Skill } from '@/types';

const allModels = AI_PROVIDERS.flatMap((p) => p.models.map((m) => ({ id: m.id, label: `${m.name} (${p.name})` })));

interface AgentFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agent: Agent | null;
  allSkills: Skill[];
  assignedSkills: Skill[];
  onSaved: () => void;
}

const AgentFormDialog = ({ open, onOpenChange, agent, allSkills, assignedSkills, onSaved }: AgentFormDialogProps) => {
  const { data } = useAdapters();
  const isEdit = !!agent;

  const [name, setName] = useState(agent?.name ?? '');
  const [description, setDescription] = useState(agent?.description ?? '');
  const [model, setModel] = useState(agent?.model ?? '');
  const [systemPrompt, setSystemPrompt] = useState(agent?.systemPrompt ?? '');
  const [isActive, setIsActive] = useState(agent?.isActive ?? true);
  const [selectedSkillIds, setSelectedSkillIds] = useState<Set<string>>(new Set(assignedSkills.map((s) => s.id)));
  const [saving, setSaving] = useState(false);

  const toggleSkill = (skillId: string) => {
    setSelectedSkillIds((prev) => {
      const next = new Set(prev);
      if (next.has(skillId)) next.delete(skillId);
      else next.add(skillId);
      return next;
    });
  };

  const handleSave = async () => {
    if (!data || !name.trim()) return;
    setSaving(true);
    try {
      if (isEdit && agent) {
        await data.agents.update(agent.id, {
          name: name.trim(),
          description: description.trim() || null,
          model: model || null,
          systemPrompt: systemPrompt.trim() || null,
          isActive,
        });

        // Sync skill assignments
        const oldIds = new Set(assignedSkills.map((s) => s.id));
        const toAssign = [...selectedSkillIds].filter((id) => !oldIds.has(id));
        const toRemove = [...oldIds].filter((id) => !selectedSkillIds.has(id));
        await Promise.all([
          ...toAssign.map((id) => data.agents.assignSkill(agent.id, id)),
          ...toRemove.map((id) => data.agents.removeSkill(agent.id, id)),
        ]);

        toast.success(`Updated agent "${name.trim()}"`);
      } else {
        const created = await data.agents.create({
          name: name.trim(),
          description: description.trim() || undefined,
          model: model || undefined,
          systemPrompt: systemPrompt.trim() || undefined,
          isActive,
        });

        // Assign selected skills
        await Promise.all([...selectedSkillIds].map((id) => data.agents.assignSkill(created.id, id)));

        toast.success(`Created agent "${name.trim()}"`);
      }
      onSaved();
    } catch (e) {
      console.error('Failed to save agent:', e);
      toast.error('Failed to save agent');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Agent' : 'Create Agent'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="agent-name">Name</Label>
            <Input
              id="agent-name"
              placeholder="e.g., Research Assistant"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="agent-description">Description</Label>
            <Input
              id="agent-description"
              placeholder="What does this agent do?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="agent-model">Model</Label>
            <select
              id="agent-model"
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              value={model}
              onChange={(e) => setModel(e.target.value)}
            >
              <option value="">Select a model...</option>
              {allModels.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="agent-prompt">System Prompt</Label>
            <Textarea
              id="agent-prompt"
              placeholder="Define this agent's role and instructions..."
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              rows={4}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="agent-active">Active</Label>
            <Switch id="agent-active" checked={isActive} onCheckedChange={setIsActive} />
          </div>

          {allSkills.length > 0 && (
            <div className="space-y-2">
              <Label>Assigned Skills</Label>
              <div className="flex flex-wrap gap-2 rounded-md border p-3">
                {allSkills.map((skill) => {
                  const selected = selectedSkillIds.has(skill.id);
                  return (
                    <Badge
                      key={skill.id}
                      variant={selected ? 'default' : 'outline'}
                      className="cursor-pointer select-none gap-1 transition-colors"
                      onClick={() => toggleSkill(skill.id)}
                    >
                      {skill.name}
                      {selected && <X className="h-3 w-3" />}
                    </Badge>
                  );
                })}
              </div>
              <p className="text-xs text-muted-foreground">Click to toggle. {selectedSkillIds.size} selected.</p>
            </div>
          )}
        </div>

        <div className="mt-2 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!name.trim() || saving}>
            {saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Agent'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AgentFormDialog;
