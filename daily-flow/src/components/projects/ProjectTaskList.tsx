import { useState, useMemo } from 'react';
import { Plus, Circle, CheckCircle2, Flag, ChevronDown, Link2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Task } from '@/types';
import { priorityConfig } from '@/lib/task-config';
import { toast } from 'sonner';
import { format, parseISO } from 'date-fns';

const formatDateShort = (d?: string) => {
  if (!d) return null;
  try {
    return format(parseISO(d), 'MMM d');
  } catch {
    return d;
  }
};

interface ProjectTaskListProps {
  projectTasks: Task[];
  allTasks: Task[];
  projectId: string;
  onTaskClick: (taskId: string) => void;
  onToggleTask: (taskId: string, currentStatus: string) => void;
  onLinkTask?: (taskId: string) => void;
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
      .filter((t) => t.projectId !== projectId && t.status !== 'done')
      .filter((t) => !linkSearch || t.title.toLowerCase().includes(linkSearch.toLowerCase()))
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
          {onLinkTask && (
            <Popover
              open={linkPopoverOpen}
              onOpenChange={(open) => {
                setLinkPopoverOpen(open);
                if (!open) setLinkSearch('');
              }}
            >
              <PopoverTrigger asChild>
                <Button size="sm" variant="outline" className="h-7 gap-1.5 text-xs">
                  <Link2 className="h-3.5 w-3.5" />
                  Link existing
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-72 p-0" align="end">
                <div className="border-b border-border p-2">
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
                    <p className="py-4 text-center text-xs text-muted-foreground">
                      {linkSearch ? 'No matching tasks' : 'No unassigned tasks'}
                    </p>
                  ) : (
                    linkableTasks.map((task) => (
                      <button
                        key={task.id}
                        onClick={() => {
                          onLinkTask(task.id);
                          toast.success(`Linked "${task.title}"`);
                        }}
                        className="flex w-full items-center gap-2 border-b border-border/30 px-3 py-2 text-left text-sm transition-colors last:border-0 hover:bg-secondary/50"
                      >
                        <Circle className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                        <span className="truncate">{task.title}</span>
                      </button>
                    ))
                  )}
                </div>
              </PopoverContent>
            </Popover>
          )}
        </div>
      </div>

      {/* Task rows */}
      {projectTasks.length > 0 ? (
        <div className="divide-y divide-border">
          {projectTasks.map((task) => {
            const pCfg = priorityConfig[task.priority];
            return (
              <div key={task.id} className="py-1">
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => onTaskClick(task.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onTaskClick(task.id);
                    }
                  }}
                  className="group -mx-2 flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-secondary/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <button
                    aria-label={
                      task.status === 'done' ? `Mark "${task.title}" as not done` : `Mark "${task.title}" as done`
                    }
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleTask(task.id, task.status);
                    }}
                    className="shrink-0"
                  >
                    {task.status === 'done' ? (
                      <CheckCircle2 className="h-5 w-5 text-success-foreground" />
                    ) : (
                      <Circle className="h-5 w-5 text-muted-foreground group-hover:text-foreground" />
                    )}
                  </button>

                  <div className="min-w-0 flex-1">
                    <span
                      className={cn(
                        'block truncate text-sm',
                        task.status === 'done' && 'text-muted-foreground line-through',
                      )}
                    >
                      {task.title}
                    </span>
                    {task.subtasks.length > 0 && (
                      <div className="mt-0.5 flex items-center gap-1.5">
                        <div className="h-1.5 w-16 overflow-hidden rounded-full bg-secondary">
                          <div
                            className="h-full rounded-full bg-primary transition-all"
                            style={{
                              width: `${Math.round((task.subtasks.filter((s) => s.completed).length / task.subtasks.length) * 100)}%`,
                            }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {task.subtasks.filter((s) => s.completed).length}/{task.subtasks.length}
                        </span>
                      </div>
                    )}
                  </div>

                  <span className={cn('text-xs font-medium', pCfg.color)}>
                    <Flag className="mr-0.5 inline h-3 w-3" />
                    {pCfg.label}
                  </span>

                  {task.dueDate && (
                    <span className="text-xs text-muted-foreground">{formatDateShort(task.dueDate)}</span>
                  )}

                  <ChevronDown className="h-3.5 w-3.5 -rotate-90 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-12 text-center">
          <CheckCircle2 className="mx-auto mb-3 h-10 w-10 text-muted-foreground/30" />
          <h3 className="mb-1 text-sm font-medium text-foreground">No tasks yet</h3>
          <p className="text-xs text-muted-foreground">Add a task below or link an existing one.</p>
        </div>
      )}

      {/* Add task input */}
      <div className="mt-4 rounded-lg border border-border bg-[hsl(var(--surface-elevated))] p-3">
        <div className="flex items-center gap-2">
          <Circle className="h-5 w-5 shrink-0 text-muted-foreground" />
          <Input
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
            placeholder="Add a task to this project..."
            className="border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
          />
          <Button size="sm" onClick={handleAddTask} disabled={!newTaskTitle.trim()}>
            <Plus className="mr-1 h-4 w-4" />
            Add
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProjectTaskList;
