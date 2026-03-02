import { memo, useState, useCallback } from 'react';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useKaivooActions } from '@/hooks/useKaivooActions';
import type { Task } from '@/types';

interface TaskPanelProps {
  pendingTasks: Task[];
  completedTasks: Task[];
  dateStr: string;
  onTaskClick?: (id: string) => void;
}

const TaskPanel = memo(({ pendingTasks, completedTasks, dateStr, onTaskClick }: TaskPanelProps) => {
  const { addTask, updateTask } = useKaivooActions();
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [showCompleted, setShowCompleted] = useState(false);

  const handleAddTask = useCallback(async () => {
    const title = newTaskTitle.trim();
    if (!title) return;
    try {
      await addTask({
        title,
        status: 'todo',
        priority: 'medium',
        dueDate: dateStr,
        tags: [],
        topicIds: [],
        subtasks: [],
      });
      setNewTaskTitle('');
    } catch {
      // Error toast already shown by addTask
    }
  }, [newTaskTitle, dateStr, addTask]);

  const handleToggleComplete = useCallback(
    async (task: Task) => {
      await updateTask(task.id, {
        status: task.status === 'done' ? 'todo' : 'done',
        completedAt: task.status === 'done' ? undefined : new Date(),
      });
    },
    [updateTask],
  );

  return (
    <div className="widget-card" aria-live="polite">
      <h3 className="widget-title mb-3">Tasks</h3>

      {/* Quick add */}
      <div className="mb-4 flex gap-2">
        <Input
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          placeholder="Add a task..."
          className="h-8 text-sm"
          onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
        />
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8 shrink-0"
          onClick={handleAddTask}
          disabled={!newTaskTitle.trim()}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Pending tasks */}
      <div className="space-y-1">
        {pendingTasks.length === 0 && (
          <p className="py-4 text-center text-xs text-muted-foreground">No tasks for this day</p>
        )}
        {pendingTasks.map((task) => (
          <TaskRow key={task.id} task={task} onToggle={handleToggleComplete} onClick={onTaskClick} />
        ))}
      </div>

      {/* Completed toggle */}
      {completedTasks.length > 0 && (
        <div className="mt-4 border-t border-border/30 pt-3">
          <button
            onClick={() => setShowCompleted(!showCompleted)}
            className="mb-2 text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            {showCompleted ? 'Hide' : 'Show'} completed ({completedTasks.length})
          </button>
          {showCompleted && (
            <div className="space-y-1">
              {completedTasks.map((task) => (
                <TaskRow key={task.id} task={task} onToggle={handleToggleComplete} onClick={onTaskClick} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
});
TaskPanel.displayName = 'TaskPanel';

const TaskRow = memo(
  ({ task, onToggle, onClick }: { task: Task; onToggle: (task: Task) => void; onClick?: (id: string) => void }) => {
    const isDone = task.status === 'done';
    const isOverdue = !isDone && task.dueDate && task.dueDate < new Date().toISOString().slice(0, 10);

    return (
      <div
        className={cn(
          'group flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors',
          'cursor-pointer hover:bg-accent/10',
        )}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggle(task);
          }}
          className={cn(
            'flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors',
            isDone ? 'border-primary bg-primary text-primary-foreground' : 'border-border hover:border-primary',
          )}
          aria-label={isDone ? 'Mark incomplete' : 'Mark complete'}
        >
          {isDone && <span className="text-[10px]">&#10003;</span>}
        </button>
        <button
          onClick={() => onClick?.(task.id)}
          className={cn(
            'flex-1 truncate text-left text-sm',
            isDone && 'text-muted-foreground line-through',
            isOverdue && 'text-destructive',
          )}
        >
          {task.title}
        </button>
        {task.priority === 'high' && !isDone && <span className="text-[10px] font-medium text-destructive">HIGH</span>}
      </div>
    );
  },
);
TaskRow.displayName = 'TaskRow';

export default TaskPanel;
