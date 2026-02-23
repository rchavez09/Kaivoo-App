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
  const completedSubtasks = task.subtasks.filter(s => s.completed).length;
  const progress = hasSubtasks ? Math.round((completedSubtasks / task.subtasks.length) * 100) : null;

  const bgClass = variant === 'overdue'
    ? 'bg-destructive/5 border border-destructive/20 hover:bg-destructive/10'
    : isDone
    ? 'opacity-60 hover:opacity-80 hover:bg-secondary/50'
    : 'hover:bg-secondary/50';

  return (
    <>
      <div
        className={cn(
          "flex items-center gap-2 py-2.5 px-2 -mx-2 rounded-lg transition-colors cursor-pointer group",
          bgClass
        )}
        onClick={(e) => onTaskClick(task, e)}
      >
        {/* Drag handle */}
        {dragProps && (
          <button
            {...dragProps.attributes}
            {...(dragProps.listeners as React.HTMLAttributes<HTMLButtonElement>)}
            className="w-5 h-5 flex items-center justify-center flex-shrink-0 text-muted-foreground/50 hover:text-muted-foreground cursor-grab active:cursor-grabbing touch-none"
            onClick={(e) => e.stopPropagation()}
            aria-label={`Reorder ${task.title}`}
          >
            <GripVertical className="w-4 h-4" />
          </button>
        )}

        {/* Quick complete circle */}
        <button
          onClick={(e) => onQuickComplete(task, e)}
          aria-label={isDone ? `Mark "${task.title}" incomplete` : `Mark "${task.title}" complete`}
          className={cn(
            "w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors",
            isDone
              ? "bg-success-foreground border-success-foreground"
              : "border-muted-foreground/40 hover:border-success-foreground hover:bg-success-foreground/10"
          )}
        >
          {isDone && <Check className="w-3 h-3 text-white" />}
        </button>

        {/* Task content */}
        <div className="flex-1 min-w-0 flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className={cn("text-sm", isDone ? "line-through text-muted-foreground" : "text-foreground")}>
              {task.title}
            </span>
            {showDueDate && task.dueDate && (
              <Badge
                variant="outline"
                className={cn(
                  "text-[10px] h-4 px-1 font-normal flex-shrink-0",
                  variant === 'overdue' ? "text-destructive border-destructive/30" : "text-muted-foreground"
                )}
              >
                {task.dueDate}
              </Badge>
            )}
            {task.recurrence && (
              <Badge variant="outline" className="text-[10px] h-4 px-1 font-normal flex-shrink-0 text-info border-info/30">
                ↻ {task.recurrence.type === 'daily' ? 'Daily' : task.recurrence.type === 'weekly' ? 'Weekly' : 'Monthly'}
              </Badge>
            )}
          </div>

          {hasSubtasks && (
            <button
              onClick={(e) => onToggleExpanded(task.id, e)}
              aria-label={isExpanded ? `Collapse subtasks for "${task.title}"` : `Expand subtasks for "${task.title}"`}
              className={cn(
                "flex items-center gap-1.5 text-xs w-fit px-1.5 py-0.5 -ml-1.5 rounded hover:bg-secondary transition-colors",
                isDone ? "text-muted-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
              <span>Subtasks ({completedSubtasks}/{task.subtasks.length})</span>
              {progress !== null && <Progress value={progress} className="h-1 w-10 ml-1" />}
            </button>
          )}
        </div>

        {task.priority === 'high' && <Flag className="w-3.5 h-3.5 flex-shrink-0 text-destructive" />}
      </div>

      {/* Expanded subtasks */}
      {hasSubtasks && isExpanded && (
        <div className="ml-6 pl-3 border-l-2 border-border/60 space-y-1 mt-1 mb-3">
          {task.subtasks.map((subtask) => (
            <div
              key={subtask.id}
              className="flex items-center gap-2 py-1.5 px-2 rounded-md hover:bg-secondary/30 transition-colors"
            >
              <button
                onClick={(e) => onSubtaskToggle(task.id, subtask.id, e)}
                aria-label={subtask.completed ? `Mark "${subtask.title}" incomplete` : `Mark "${subtask.title}" complete`}
                className={cn(
                  "w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors",
                  subtask.completed
                    ? "bg-success-foreground border-success-foreground"
                    : "border-muted-foreground/40 hover:border-success-foreground hover:bg-success-foreground/10"
                )}
              >
                {subtask.completed && <Check className="w-2.5 h-2.5 text-white" />}
              </button>
              <span className={cn("text-sm", subtask.completed ? "line-through text-muted-foreground" : "text-foreground")}>
                {subtask.title}
              </span>
              {subtask.tags && subtask.tags.length > 0 && (
                <div className="flex gap-1 ml-auto">
                  {subtask.tags.slice(0, 2).map((tag, idx) => (
                    <Badge key={idx} variant="secondary" className="text-[9px] h-4 px-1.5">{tag}</Badge>
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
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className={isDragging ? "shadow-lg ring-2 ring-primary/20 rounded-lg" : undefined}>
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
