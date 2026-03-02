import React from 'react';
import { Check, ChevronRight, ChevronDown, Flag, GripVertical } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Task, TaskStatus } from '@/types';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { TaskVariant } from './task-section-utils';

export interface TaskRowProps {
  task: Task;
  variant: TaskVariant;
  showDueDate: boolean;
  isExpanded: boolean;
  /** Enable drag handle. When false, row renders without sortable wrapper. */
  isDraggable?: boolean;
  onQuickComplete: (task: Task, e: React.MouseEvent) => void;
  onToggleExpanded: (taskId: string, e: React.MouseEvent) => void;
  onSubtaskToggle: (taskId: string, subtaskId: string, e: React.MouseEvent) => void;
  onTaskClick: (task: Task, e: React.MouseEvent) => void;
}

const TaskRowContent = React.memo(function TaskRowContent({
  task,
  variant,
  showDueDate,
  isExpanded,
  onQuickComplete,
  onToggleExpanded,
  onSubtaskToggle,
  onTaskClick,
  dragProps,
}: TaskRowProps & {
  dragProps?: {
    attributes: Record<string, unknown>;
    listeners: Record<string, unknown> | undefined;
  };
}) {
  const isDone = task.status === 'done';
  const hasSubtasks = task.subtasks.length > 0;
  const completedSubtasks = task.subtasks.filter((s) => s.completed).length;
  const progress = hasSubtasks ? Math.round((completedSubtasks / task.subtasks.length) * 100) : null;

  const bgClass =
    variant === 'overdue'
      ? 'bg-destructive/5 border border-destructive/20 hover:bg-destructive/10'
      : isDone
        ? 'opacity-60 hover:opacity-80 hover:bg-secondary/50'
        : 'hover:bg-secondary/50';

  return (
    <>
      <div
        className={cn(
          'group -mx-2 flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2.5 transition-colors',
          bgClass,
        )}
        onClick={(e) => onTaskClick(task, e)}
      >
        {/* Drag handle */}
        {dragProps && (
          <button
            {...dragProps.attributes}
            {...(dragProps.listeners as React.HTMLAttributes<HTMLButtonElement>)}
            className="flex h-5 w-5 flex-shrink-0 cursor-grab touch-none items-center justify-center text-muted-foreground/50 hover:text-muted-foreground active:cursor-grabbing"
            onClick={(e) => e.stopPropagation()}
            aria-label={`Reorder ${task.title}`}
          >
            <GripVertical className="h-4 w-4" />
          </button>
        )}

        {/* Quick complete circle */}
        <button
          onClick={(e) => onQuickComplete(task, e)}
          aria-label={isDone ? `Mark "${task.title}" incomplete` : `Mark "${task.title}" complete`}
          className={cn(
            'flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2 transition-colors',
            isDone
              ? 'border-success-foreground bg-success-foreground'
              : 'border-muted-foreground/40 hover:border-success-foreground hover:bg-success-foreground/10',
          )}
        >
          {isDone && <Check className="h-3 w-3 text-white" />}
        </button>

        {/* Task content */}
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className={cn('text-sm', isDone ? 'text-muted-foreground line-through' : 'text-foreground')}>
              {task.title}
            </span>
            {showDueDate && task.dueDate && (
              <Badge
                variant="outline"
                className={cn(
                  'h-4 flex-shrink-0 px-1 text-[10px] font-normal',
                  variant === 'overdue' ? 'border-destructive/30 text-destructive' : 'text-muted-foreground',
                )}
              >
                {task.dueDate}
              </Badge>
            )}
            {task.recurrence && (
              <Badge
                variant="outline"
                className="h-4 flex-shrink-0 border-info/30 px-1 text-[10px] font-normal text-info-foreground"
              >
                ↻{' '}
                {task.recurrence.type === 'daily' ? 'Daily' : task.recurrence.type === 'weekly' ? 'Weekly' : 'Monthly'}
              </Badge>
            )}
          </div>

          {hasSubtasks && (
            <button
              onClick={(e) => onToggleExpanded(task.id, e)}
              aria-label={isExpanded ? `Collapse subtasks for "${task.title}"` : `Expand subtasks for "${task.title}"`}
              className={cn(
                '-ml-1.5 flex w-fit items-center gap-1.5 rounded px-1.5 py-0.5 text-xs transition-colors hover:bg-secondary',
                isDone ? 'text-muted-foreground' : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
              <span>
                Subtasks ({completedSubtasks}/{task.subtasks.length})
              </span>
              {progress !== null && <Progress value={progress} className="ml-1 h-1 w-10" />}
            </button>
          )}
        </div>

        {task.priority === 'high' && <Flag className="h-3.5 w-3.5 flex-shrink-0 text-destructive" />}
      </div>

      {/* Expanded subtasks */}
      {hasSubtasks && isExpanded && (
        <div className="mb-3 ml-6 mt-1 space-y-1 border-l-2 border-border/60 pl-3">
          {task.subtasks.map((subtask) => (
            <div
              key={subtask.id}
              className="flex items-center gap-2 rounded-md px-2 py-1.5 transition-colors hover:bg-secondary/30"
            >
              <button
                onClick={(e) => onSubtaskToggle(task.id, subtask.id, e)}
                aria-label={
                  subtask.completed ? `Mark "${subtask.title}" incomplete` : `Mark "${subtask.title}" complete`
                }
                className={cn(
                  'flex h-4 w-4 flex-shrink-0 items-center justify-center rounded border-2 transition-colors',
                  subtask.completed
                    ? 'border-success-foreground bg-success-foreground'
                    : 'border-muted-foreground/40 hover:border-success-foreground hover:bg-success-foreground/10',
                )}
              >
                {subtask.completed && <Check className="h-2.5 w-2.5 text-white" />}
              </button>
              <span
                className={cn('text-sm', subtask.completed ? 'text-muted-foreground line-through' : 'text-foreground')}
              >
                {subtask.title}
              </span>
              {subtask.tags && subtask.tags.length > 0 && (
                <div className="ml-auto flex gap-1">
                  {subtask.tags.slice(0, 2).map((tag, idx) => (
                    <Badge key={idx} variant="secondary" className="h-4 px-1.5 text-[9px]">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
});

/** Draggable task row -- wraps TaskRowContent with dnd-kit sortable. */
export const SortableTaskRow = React.memo(function SortableTaskRow(props: TaskRowProps) {
  const { task } = props;
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={isDragging ? 'rounded-lg shadow-lg ring-2 ring-primary/20' : undefined}
    >
      <TaskRowContent {...props} dragProps={{ attributes, listeners }} />
    </div>
  );
});

/** Static task row -- no drag support (for completed tasks, Day View, etc.). */
export const TaskRow = React.memo(function TaskRow(props: TaskRowProps) {
  return (
    <div>
      <TaskRowContent {...props} />
    </div>
  );
});

export default SortableTaskRow;
