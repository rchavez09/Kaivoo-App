import { Calendar, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { Project, Topic } from '@/types';
import { PROJECT_COLORS, PROJECT_COLOR_NAMES } from '@/lib/project-config';
import { toast } from 'sonner';
import { format, parseISO } from 'date-fns';

interface ProjectSettingsProps {
  project: Project;
  color: string;
  topics: Topic[];
  onUpdate: (fields: Partial<Project>) => void;
  onDeleteClick: () => void;
}

const ProjectSettings = ({ project, color, topics, onUpdate, onDeleteClick }: ProjectSettingsProps) => {
  const filteredTopics = topics.filter(t => t.id !== 'topic-daily-notes');

  return (
    <div className="widget-card mt-8">
      <div className="widget-header">
        <h2 className="widget-title">Settings</h2>
      </div>

      <div className="space-y-5">
        {/* Topic */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-muted-foreground">Topic</label>
          <Select
            value={project.topicId || 'none'}
            onValueChange={(v) => onUpdate({ topicId: v === 'none' ? undefined : v })}
          >
            <SelectTrigger aria-label="Change project topic">
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

        {/* Color */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">Color</label>
          <div className="flex flex-wrap gap-2">
            {PROJECT_COLORS.map((c) => (
              <button
                key={c}
                onClick={() => onUpdate({ color: c })}
                className={cn(
                  'w-10 h-10 rounded-full border-2 transition-all',
                  color === c ? 'border-foreground scale-110' : 'border-transparent hover:scale-105'
                )}
                style={{ backgroundColor: c }}
                aria-label={`Select ${PROJECT_COLOR_NAMES[c] || 'color'}`}
              />
            ))}
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              Start Date
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="w-full justify-start text-left font-normal text-sm">
                  {project.startDate ? format(parseISO(project.startDate), 'MMM d, yyyy') : 'Set start date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={project.startDate ? parseISO(project.startDate) : undefined}
                  onSelect={(date) => {
                    if (date && project.endDate) {
                      if (date > parseISO(project.endDate)) { toast.error('Start date cannot be after end date'); return; }
                    }
                    onUpdate({ startDate: date ? format(date, 'yyyy-MM-dd') : undefined });
                  }}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
                <div className="p-2 border-t border-border flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs flex-1"
                    onClick={() => {
                      const today = format(new Date(), 'yyyy-MM-dd');
                      if (project.endDate && today > project.endDate) { toast.error('Start date cannot be after end date'); return; }
                      onUpdate({ startDate: today });
                    }}
                  >
                    Today
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs flex-1"
                    onClick={() => onUpdate({ startDate: undefined })}
                  >
                    Clear
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              End Date
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="w-full justify-start text-left font-normal text-sm">
                  {project.endDate ? format(parseISO(project.endDate), 'MMM d, yyyy') : 'Set end date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={project.endDate ? parseISO(project.endDate) : undefined}
                  onSelect={(date) => {
                    if (date && project.startDate) {
                      if (date < parseISO(project.startDate)) { toast.error('End date cannot be before start date'); return; }
                    }
                    onUpdate({ endDate: date ? format(date, 'yyyy-MM-dd') : undefined });
                  }}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
                <div className="p-2 border-t border-border flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs flex-1"
                    onClick={() => {
                      const today = format(new Date(), 'yyyy-MM-dd');
                      if (project.startDate && today < project.startDate) { toast.error('End date cannot be before start date'); return; }
                      onUpdate({ endDate: today });
                    }}
                  >
                    Today
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs flex-1"
                    onClick={() => onUpdate({ endDate: undefined })}
                  >
                    Clear
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Delete */}
        <div className="pt-3 border-t border-border/50">
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={onDeleteClick}
          >
            <Trash2 className="w-4 h-4 mr-1.5" />
            Delete Project
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProjectSettings;
