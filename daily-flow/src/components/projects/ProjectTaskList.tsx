import { useState, useMemo } from 'react';
import {
  Plus, Circle, CheckCircle2, Flag, ChevronDown, Link2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Task } from '@/types';
import { priorityConfig } from '@/lib/task-config';
import { toast } from 'sonner';
import { format, parseISO } from 'date-fns';

const formatDateShort = (d?: string) => {
  if (!d) return null;
  try { return format(parseISO(d), 'MMM d'); } catch { return d; }
};

interface ProjectTaskListProps {
  projectTasks: Task[];
  allTasks: Task[];
  projectId: string;
  onTaskClick: (taskId: string) => void;
  onToggleTask: (taskId: string, currentStatus: string) => void;
  onLinkTask: (taskId: string) => void;
  onAddTask: (title: string) => void;
}

const ProjectTaskList = ({
  projectTasks,
  allTasks,
  projectId,
  onTaskClick,
  onToggleTask,
  onLinkTask,
  onAddTask,
}: ProjectTaskListProps) => {
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [linkPopoverOpen, setLinkPopoverOpen] = useState(false);
  const [linkSearch, setLinkSearch] = useState('');

  const linkableTasks = useMemo(() => {
    return allTasks
      .filter(t => t.projectId !== projectId && t.status !== 'done')
      .filter(t => !linkSearch || t.title.toLowerCase().includes(linkSearch.toLowerCase()))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 20);
  }, [allTasks, projectId, linkSearch]);

  const handleAddTask = () => {
    if (!newTaskTitle.trim()) return;
    onAddTask(newTaskTitle.trim());
    setNewTaskTitle('');
  };

  return (
    <div className="widget-card">
      <div className="widget-header">
        <h2 className="widget-title">Tasks</h2>
        <div className="flex items-center gap-2">
          <Popover open={linkPopoverOpen} onOpenChange={(open) => { setLinkPopoverOpen(open); if (!open) setLinkSearch(''); }}>
            <PopoverTrigger asChild>
              <Button size="sm" variant="outline" className="gap-1.5 text-xs h-7">
                <Link2 className="w-3.5 h-3.5" />
                Link existing
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-72 p-0" align="end">
              <div className="p-2 border-b border-border">
                <Input
                  value={linkSearch}
                  onChange={(e) => setLinkSearch(e.target.value)}
                  placeholder="Search tasks..."
                  className="h-8 text-xs"
                  autoFocus
                />
              </div>
              <div className="max-h-56 overflow-y-auto">
                {linkableTasks.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-4">
                    {linkSearch ? 'No matching tasks' : 'No unassigned tasks'}
                  </p>
                ) : (
                  linkableTasks.map(task => (
                    <button
                      key={task.id}
                      onClick={() => {
                        onLinkTask(task.id);
                        toast.success(`Linked "${task.title}"`);
                      }}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-secondary/50 transition-colors flex items-center gap-2 border-b border-border/30 last:border-0"
                    >
                      <Circle className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                      <span className="truncate">{task.title}</span>
                    </button>
                  ))
                )}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Task rows */}
      {projectTasks.length > 0 ? (
        <div className="divide-y divide-border">
          {projectTasks.map(task => {
            const pCfg = priorityConfig[task.priority];
            return (
              <div key={task.id} className="py-1">
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => onTaskClick(task.id)}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onTaskClick(task.id); } }}
                  className="flex items-center gap-3 py-2 px-2 -mx-2 hover:bg-secondary/30 rounded-lg transition-colors cursor-pointer group"
                >
                  <button
                    aria-label={task.status === 'done' ? `Mark "${task.title}" as not done` : `Mark "${task.title}" as done`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleTask(task.id, task.status);
                    }}
                    className="shrink-0"
                  >
                    {task.status === 'done' ? (
                      <CheckCircle2 className="w-5 h-5 text-success-foreground" />
                    ) : (
                      <Circle className="w-5 h-5 text-muted-foreground group-hover:text-foreground" />
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <span className={cn(
                      'text-sm truncate block',
                      task.status === 'done' && 'line-through text-muted-foreground'
                    )}>
                      {task.title}
                    </span>
                    {task.subtasks.length > 0 && (
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <div className="h-1.5 w-16 bg-secondary rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full transition-all"
                            style={{ width: `${Math.round((task.subtasks.filter(s => s.completed).length / task.subtasks.length) * 100)}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {task.subtasks.filter(s => s.completed).length}/{task.subtasks.length}
                        </span>
                      </div>
                    )}
                  </div>

                  <span className={cn('text-xs font-medium', pCfg.color)}>
                    <Flag className="w-3 h-3 inline mr-0.5" />
                    {pCfg.label}
                  </span>

                  {task.dueDate && (
                    <span className="text-xs text-muted-foreground">
                      {formatDateShort(task.dueDate)}
                    </span>
                  )}

                  <ChevronDown className="w-3.5 h-3.5 text-muted-foreground -rotate-90 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-12 text-center">
          <CheckCircle2 className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
          <h3 className="text-sm font-medium text-foreground mb-1">No tasks yet</h3>
          <p className="text-xs text-muted-foreground">
            Add a task below or link an existing one.
          </p>
        </div>
      )}

      {/* Add task input */}
      <div className="mt-4 p-3 bg-[hsl(var(--surface-elevated))] rounded-lg border border-border">
        <div className="flex items-center gap-2">
          <Circle className="w-5 h-5 text-muted-foreground shrink-0" />
          <Input
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
            placeholder="Add a task to this project..."
            className="border-0 bg-transparent focus-visible:ring-0 shadow-none px-0"
          />
          <Button size="sm" onClick={handleAddTask} disabled={!newTaskTitle.trim()}>
            <Plus className="w-4 h-4 mr-1" />
            Add
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProjectTaskList;
