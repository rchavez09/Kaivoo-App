import { Calendar, Trash2, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
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
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ProjectSettings = ({
  project,
  color,
  topics,
  onUpdate,
  onDeleteClick,
  open,
  onOpenChange,
}: ProjectSettingsProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Project Settings</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 pt-2">
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
                {topics.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name}
                  </SelectItem>
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
                    'h-10 w-10 rounded-full border-2 transition-all',
                    color === c ? 'scale-110 border-foreground' : 'border-transparent hover:scale-105',
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
              <label className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" />
                Start Date
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="w-full justify-start text-left text-sm font-normal">
                    {project.startDate ? format(parseISO(project.startDate), 'MMM d, yyyy') : 'Set start date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={project.startDate ? parseISO(project.startDate) : undefined}
                    onSelect={(date) => {
                      if (date && project.endDate) {
                        if (date > parseISO(project.endDate)) {
                          toast.error('Start date cannot be after end date');
                          return;
                        }
                      }
                      onUpdate({ startDate: date ? format(date, 'yyyy-MM-dd') : undefined });
                    }}
                    initialFocus
                    className="pointer-events-auto p-3"
                  />
                  <div className="flex gap-1 border-t border-border p-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex-1 text-xs"
                      onClick={() => {
                        const today = format(new Date(), 'yyyy-MM-dd');
                        if (project.endDate && today > project.endDate) {
                          toast.error('Start date cannot be after end date');
                          return;
                        }
                        onUpdate({ startDate: today });
                      }}
                    >
                      Today
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex-1 text-xs"
                      onClick={() => onUpdate({ startDate: undefined })}
                    >
                      Clear
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" />
                End Date
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="w-full justify-start text-left text-sm font-normal">
                    {project.endDate ? format(parseISO(project.endDate), 'MMM d, yyyy') : 'Set end date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={project.endDate ? parseISO(project.endDate) : undefined}
                    onSelect={(date) => {
                      if (date && project.startDate) {
                        if (date < parseISO(project.startDate)) {
                          toast.error('End date cannot be before start date');
                          return;
                        }
                      }
                      onUpdate({ endDate: date ? format(date, 'yyyy-MM-dd') : undefined });
                    }}
                    initialFocus
                    className="pointer-events-auto p-3"
                  />
                  <div className="flex gap-1 border-t border-border p-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex-1 text-xs"
                      onClick={() => {
                        const today = format(new Date(), 'yyyy-MM-dd');
                        if (project.startDate && today < project.startDate) {
                          toast.error('End date cannot be before start date');
                          return;
                        }
                        onUpdate({ endDate: today });
                      }}
                    >
                      Today
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex-1 text-xs"
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
          <div className="border-t border-border/50 pt-3">
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={() => {
                onOpenChange(false);
                onDeleteClick();
              }}
            >
              <Trash2 className="mr-1.5 h-4 w-4" />
              Delete Project
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProjectSettings;
