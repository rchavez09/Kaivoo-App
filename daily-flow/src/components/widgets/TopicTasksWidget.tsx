import { CheckSquare, Circle, CheckCircle2, Plus, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Task } from '@/types';
import { cn } from '@/lib/utils';
import { useKaivooActions } from '@/hooks/useKaivooActions';

interface TopicTasksWidgetProps {
  tasks: Task[];
  topicName: string;
}

const priorityColors = {
  high: 'text-destructive',
  medium: 'text-primary',
  low: 'text-info',
};

const TopicTasksWidget = ({ tasks, topicName }: TopicTasksWidgetProps) => {
  const { updateTask } = useKaivooActions();

  const pendingTasks = tasks.filter(t => t.status !== 'done');
  const completedTasks = tasks.filter(t => t.status === 'done');

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
          </span>
        </div>
        <Button variant="ghost" size="sm" className="h-7 text-xs gap-1.5">
          <Plus className="w-3 h-3" />
          Add Task
        </Button>
      </div>

      {tasks.length > 0 ? (
        <div className="space-y-1">
          {/* Pending tasks */}
          {pendingTasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center gap-3 py-2 px-2 -mx-2 rounded-lg hover:bg-secondary/50 transition-colors cursor-pointer group"
              onClick={() => toggleTask(task.id, task.status)}
            >
              <Circle className={cn('w-4 h-4 flex-shrink-0', priorityColors[task.priority])} />
              <div className="flex-1 min-w-0">
                <span className="text-sm text-foreground">{task.title}</span>
                {task.dueDate && (
                  <span className="ml-2 text-xs text-muted-foreground flex-inline items-center gap-0.5">
                    <Calendar className="w-3 h-3 inline mr-0.5" />
                    {task.dueDate}
                  </span>
                )}
              </div>
            </div>
          ))}

          {/* Completed tasks - show max 2 */}
          {completedTasks.slice(0, 2).map((task) => (
            <div
              key={task.id}
              className="flex items-center gap-3 py-2 px-2 -mx-2 rounded-lg hover:bg-secondary/50 transition-colors cursor-pointer opacity-50"
              onClick={() => toggleTask(task.id, task.status)}
            >
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-success" />
              <span className="text-sm flex-1 line-through text-muted-foreground">{task.title}</span>
            </div>
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
            No tasks linked to {topicName} yet.
          </p>
        </div>
      )}
    </div>
  );
};

export default TopicTasksWidget;
