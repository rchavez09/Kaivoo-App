import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAdapters } from '@/lib/adapters';
import { toast } from 'sonner';
import type { Skill, SkillActionType } from '@/types';

interface SkillFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  skill: Skill | null;
  onSaved: () => void;
}

const ACTION_TYPES: { value: SkillActionType; label: string; description: string }[] = [
  { value: 'prompt', label: 'Prompt', description: 'A prompt template the agent sends to the AI model' },
  { value: 'tool', label: 'Tool', description: 'A tool/function the agent can invoke' },
  { value: 'composite', label: 'Composite', description: 'A sequence of other skills (coming soon)' },
];

const SkillFormDialog = ({ open, onOpenChange, skill, onSaved }: SkillFormDialogProps) => {
  const { data } = useAdapters();
  const isEdit = !!skill;

  const [name, setName] = useState(skill?.name ?? '');
  const [description, setDescription] = useState(skill?.description ?? '');
  const [actionType, setActionType] = useState<SkillActionType>(skill?.actionType ?? 'prompt');
  const [promptTemplate, setPromptTemplate] = useState(
    skill?.actionType === 'prompt' ? ((skill.actionConfig?.template as string) ?? '') : '',
  );
  const [toolName, setToolName] = useState(
    skill?.actionType === 'tool' ? ((skill.actionConfig?.toolName as string) ?? '') : '',
  );
  const [saving, setSaving] = useState(false);

  const buildActionConfig = (): Record<string, unknown> => {
    if (actionType === 'prompt') return { template: promptTemplate };
    if (actionType === 'tool') return { toolName };
    return {};
  };

  const handleSave = async () => {
    if (!data || !name.trim()) return;
    setSaving(true);
    try {
      const config = buildActionConfig();
      if (isEdit && skill) {
        await data.skills.update(skill.id, {
          name: name.trim(),
          description: description.trim() || null,
          actionType,
          actionConfig: config,
        });
        toast.success(`Updated skill "${name.trim()}"`);
      } else {
        await data.skills.create({
          name: name.trim(),
          description: description.trim() || undefined,
          actionType,
          actionConfig: config,
        });
        toast.success(`Created skill "${name.trim()}"`);
      }
      onSaved();
    } catch (e) {
      console.error('Failed to save skill:', e);
      toast.error('Failed to save skill');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Skill' : 'Create Skill'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="skill-name">Name</Label>
            <Input
              id="skill-name"
              placeholder="e.g., Summarize Document"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="skill-description">Description</Label>
            <Input
              id="skill-description"
              placeholder="What does this skill do?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Action Type</Label>
            <div className="grid grid-cols-3 gap-2">
              {ACTION_TYPES.map((at) => (
                <button
                  key={at.value}
                  type="button"
                  onClick={() => setActionType(at.value)}
                  disabled={at.value === 'composite'}
                  className={`rounded-md border p-3 text-left text-sm transition-colors ${
                    actionType === at.value
                      ? 'border-primary bg-primary/5'
                      : at.value === 'composite'
                        ? 'cursor-not-allowed border-muted opacity-50'
                        : 'hover:border-primary/30'
                  }`}
                >
                  <div className="font-medium">{at.label}</div>
                  <div className="mt-0.5 text-xs text-muted-foreground">{at.description}</div>
                </button>
              ))}
            </div>
          </div>

          {actionType === 'prompt' && (
            <div className="space-y-2">
              <Label htmlFor="skill-template">Prompt Template</Label>
              <Textarea
                id="skill-template"
                placeholder={
                  'Use {{variable}} for placeholders.\n\nExample: Summarize the following text:\n\n{{input}}'
                }
                value={promptTemplate}
                onChange={(e) => setPromptTemplate(e.target.value)}
                rows={5}
                className="font-mono text-sm"
              />
            </div>
          )}

          {actionType === 'tool' && (
            <div className="space-y-2">
              <Label htmlFor="skill-tool">Tool Name</Label>
              <Input
                id="skill-tool"
                placeholder="e.g., web_search, create_task"
                value={toolName}
                onChange={(e) => setToolName(e.target.value)}
              />
            </div>
          )}

          {actionType === 'composite' && (
            <p className="text-sm text-muted-foreground">
              Composite skills chain multiple skills together. This will be available in a future sprint.
            </p>
          )}
        </div>

        <div className="mt-2 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!name.trim() || saving}>
            {saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Skill'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SkillFormDialog;
