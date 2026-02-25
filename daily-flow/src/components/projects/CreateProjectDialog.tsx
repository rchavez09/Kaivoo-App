import { useState } from 'react';
import { Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useKaivooStore } from '@/stores/useKaivooStore';
import { useKaivooActions } from '@/hooks/useKaivooActions';
import { ProjectStatus } from '@/types';
import { projectStatusConfig, PROJECT_COLORS } from '@/lib/project-config';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface CreateProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CreateProjectDialog = ({ open, onOpenChange }: CreateProjectDialogProps) => {
  const topics = useKaivooStore(s => s.topics);
  const projects = useKaivooStore(s => s.projects);
  const { addProject } = useKaivooActions();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [topicId, setTopicId] = useState<string>('');
  const [status, setStatus] = useState<ProjectStatus>('planning');
  const [color, setColor] = useState<string>('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const resetForm = () => {
    setName('');
    setDescription('');
    setTopicId('');
    setStatus('planning');
    setColor('');
    setStartDate('');
    setEndDate('');
  };

  const handleCreate = async () => {
    if (!name.trim()) {
      toast.error('Project name is required.');
      return;
    }

    const assignedColor = color || PROJECT_COLORS[projects.length % PROJECT_COLORS.length];

    await addProject({
      name: name.trim(),
      description: description.trim() || undefined,
      topicId: topicId && topicId !== 'none' ? topicId : undefined,
      status,
      color: assignedColor,
      icon: undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    });

    toast.success('Project created');
    resetForm();
    onOpenChange(false);
  };

  const filteredTopics = topics.filter(t => t.id !== 'topic-daily-notes');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>New Project</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Name */}
          <div className="space-y-1.5">
            <label htmlFor="project-name" className="text-sm font-medium text-muted-foreground">Name *</label>
            <Input
              id="project-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Project name"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label htmlFor="project-desc" className="text-sm font-medium text-muted-foreground">Description</label>
            <Textarea
              id="project-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this project about?"
              className="min-h-[80px] resize-none"
            />
          </div>

          {/* Status + Topic row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-muted-foreground">Status</label>
              <Select value={status} onValueChange={(v) => setStatus(v as ProjectStatus)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(projectStatusConfig).map(([key, cfg]) => (
                    <SelectItem key={key} value={key}>
                      <span className={cn('inline-flex items-center gap-1.5', cfg.color)}>
                        {cfg.icon}
                        {cfg.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-muted-foreground">Topic</label>
              <Select value={topicId} onValueChange={setTopicId}>
                <SelectTrigger>
                  <SelectValue placeholder="None" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {filteredTopics.map(t => (
                    <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Dates row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label htmlFor="project-start" className="text-sm font-medium text-muted-foreground">Start Date</label>
              <Input
                id="project-start"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="project-end" className="text-sm font-medium text-muted-foreground">End Date</label>
              <Input
                id="project-end"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          {/* Color picker */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-muted-foreground">Color</label>
            <div className="flex flex-wrap gap-2">
              {PROJECT_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={cn(
                    'w-7 h-7 rounded-full border-2 transition-all',
                    color === c ? 'border-foreground scale-110' : 'border-transparent hover:scale-105'
                  )}
                  style={{ backgroundColor: c }}
                  aria-label={`Select color ${c}`}
                />
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={!name.trim()} className="gap-1.5">
              <Plus className="w-4 h-4" />
              Create
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateProjectDialog;
