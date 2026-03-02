import { useState } from 'react';
import { CheckSquare, Circle, CheckCircle2, Plus, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Task } from '@/types';
import { cn } from '@/lib/utils';
import { useKaivooActions } from '@/hooks/useKaivooActions';

interface TopicTasksWidgetProps {
  tasks: Task[];
  topicName: string;
  selectedTag?: string | null;
  topicId?: string;
}

const priorityColors = {
  high: 'text-destructive',
  medium: 'text-primary',
  low: 'text-info-foreground',
};

const TopicTasksWidget = ({ tasks, topicName, selectedTag, topicId }: TopicTasksWidgetProps) => {
  const { updateTask, addTask } = useKaivooActions();
  const [showAddInput, setShowAddInput] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');

  // Filter by selected tag
  let filteredTasks = tasks;
  if (selectedTag) {
    const tagLower = selectedTag.toLowerCase();
    filteredTasks = tasks.filter(t => t.tags.some(tag => tag.toLowerCase() === tagLower));
  }

  const pendingTasks = filteredTasks.filter(t => t.status !== 'done');
  const completedTasks = filteredTasks.filter(t => t.status === 'done');

  const toggleTask = (taskId: string, currentStatus: string) => {
    void updateTask(taskId, {
      status: currentStatus === 'done' ? 'todo' : 'done',
      completedAt: currentStatus === 'done' ? undefined : new Date(),
    });
  };

  return (
    <div className="widget-card animate-fade-in" style={{ animationDelay: '0.05s' }}>
      <div className="widget-header">
        <div className="flex items-center gap-2">
          <CheckSquare className="w-4 h-4 text-primary" />
          <span className="widget-title">Tasks</span>
          <span className="text-xs text-muted-foreground font-normal ml-1">
            {pendingTasks.length} open
            {selectedTag && (
              <span className="ml-1 text-primary">(#{selectedTag})</span>
            )}
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-xs gap-1.5"
          onClick={() => setShowAddInput(true)}
        >
          <Plus className="w-3 h-3" />
          Add Task
        </Button>
      </div>

      {showAddInput && (
        <div className="flex items-center gap-2 mb-2">
          <input
            type="text"
            aria-label="New task title"
            placeholder="Task title..."
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && newTaskTitle.trim()) {
                void addTask({
                  title: newTaskTitle.trim(),
                  status: 'todo',
                  priority: 'medium',
                  tags: [],
                  topicIds: topicId ? [topicId] : [],
                  subtasks: [],
                });
                setNewTaskTitle('');
                setShowAddInput(false);
              }
              if (e.key === 'Escape') {
                setNewTaskTitle('');
                setShowAddInput(false);
              }
            }}
            autoFocus
            className="flex-1 h-8 px-3 text-sm bg-secondary/50 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
      )}

      {filteredTasks.length > 0 ? (
        <div className="space-y-1">
          {/* Pending tasks */}
          {pendingTasks.map((task) => (
            <button
              key={task.id}
              className="flex items-center gap-3 py-2 px-2 -mx-2 rounded-lg hover:bg-secondary/50 transition-colors cursor-pointer group w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              onClick={() => toggleTask(task.id, task.status)}
              role="checkbox"
              aria-checked={false}
              aria-label={`${task.priority} priority: ${task.title}`}
            >
              <Circle className={cn('w-4 h-4 flex-shrink-0', priorityColors[task.priority])} />
              <div className="flex-1 min-w-0">
                <span className="text-sm text-foreground">{task.title}</span>
                {task.dueDate && (
                  <span className="ml-2 text-xs text-muted-foreground flex-inline items-center gap-0.5">
                    <Calendar className="w-3 h-3 inline mr-0.5" aria-hidden="true" />
                    {task.dueDate}
                  </span>
                )}
              </div>
            </button>
          ))}

          {/* Completed tasks - show max 2 */}
          {completedTasks.slice(0, 2).map((task) => (
            <button
              key={task.id}
              className="flex items-center gap-3 py-2 px-2 -mx-2 rounded-lg hover:bg-secondary/50 transition-colors cursor-pointer opacity-50 w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              onClick={() => toggleTask(task.id, task.status)}
              role="checkbox"
              aria-checked={true}
              aria-label={`Completed: ${task.title}`}
            >
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-success-foreground" />
              <span className="text-sm flex-1 line-through text-muted-foreground">{task.title}</span>
            </button>
          ))}

          {completedTasks.length > 2 && (
            <p className="text-xs text-muted-foreground text-center py-2">
              +{completedTasks.length - 2} more completed
            </p>
          )}
        </div>
      ) : (
        <div className="py-8 text-center">
          <CheckSquare className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">
            {selectedTag
              ? `No tasks with #${selectedTag} tag.`
              : `No tasks linked to ${topicName} yet.`}
          </p>
        </div>
      )}
    </div>
  );
};

export default TopicTasksWidget;
