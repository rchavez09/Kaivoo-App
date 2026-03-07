import { useState } from 'react';
import {
  CheckSquare,
  CheckCircle2,
  ChevronRight,
  Plus,
  CalendarPlus,
  Check,
  Video,
  MapPin,
  Calendar,
  AlertTriangle,
  Flag,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { useKaivooStore } from '@/stores/useKaivooStore';
import { Task, TaskStatus } from '@/types';
import {
  parseDate,
  isToday as isTodayUtil,
  isOverdue as isOverdueUtil,
  formatStorageDate,
  formatTime as formatTimeUtil,
  getDurationMinutes,
  formatDuration as formatDurationUtil,
} from '@/lib/dateUtils';
import { startOfDay, endOfDay, isValid } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useKaivooActions } from '@/hooks/useKaivooActions';
import { toast } from 'sonner';
import { statusConfig } from '@/lib/task-config';

interface TodayAgendaWidgetProps {
  onTaskClick?: (taskId: string) => void;
}

// Helper to check if a task is overdue (using centralized utility)
const isOverdue = (task: Task): boolean => {
  if (!task.dueDate || task.status === 'done') return false;
  return isOverdueUtil(task.dueDate);
};

// Helper to check if task is due today (using centralized utility)
const isDueToday = (task: Task): boolean => {
  if (!task.dueDate || task.status === 'done') return false;
  return isTodayUtil(task.dueDate);
};

const TodayAgendaWidget = ({ onTaskClick }: TodayAgendaWidgetProps) => {
  const tasks = useKaivooStore((s) => s.tasks);
  const getTodaysMeetings = useKaivooStore((s) => s.getTodaysMeetings);
  const { addTask, updateTask } = useKaivooActions();
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [showInput, setShowInput] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);

  const meetings = getTodaysMeetings();

  const formatTime = (date: Date | string) => formatTimeUtil(date);
  const formatDuration = (start: Date | string, end: Date | string) => {
    const mins = getDurationMinutes(start, end);
    return formatDurationUtil(mins);
  };

  const cycleStatus = async (task: Task) => {
    const statusOrder: TaskStatus[] = ['todo', 'doing', 'done'];
    const currentIndex = statusOrder.indexOf(task.status);
    const nextIndex = (currentIndex + 1) % statusOrder.length;
    const nextStatus = statusOrder[nextIndex];

    try {
      await updateTask(task.id, {
        status: nextStatus,
        completedAt: nextStatus === 'done' ? new Date() : undefined,
      });
    } catch (error) {
      toast.error('Failed to update task status');
    }
  };

  const getProgress = (task: Task) => {
    if (task.subtasks.length === 0) return null;
    const completed = task.subtasks.filter((s) => s.completed).length;
    return Math.round((completed / task.subtasks.length) * 100);
  };

  const handleAddTask = async () => {
    if (newTaskTitle.trim()) {
      try {
        await addTask({
          title: newTaskTitle.trim(),
          status: 'todo',
          priority: 'medium',
          dueDate: 'Today',
          tags: [],
          topicIds: [],
          subtasks: [],
        });
        setNewTaskTitle('');
        setShowInput(false);
        toast.success('Task added');
      } catch (error) {
        toast.error('Failed to add task');
      }
    }
  };

  const handleTaskClick = (task: Task, e: React.MouseEvent) => {
    if (onTaskClick) {
      e.stopPropagation();
      onTaskClick(task.id);
    } else {
      cycleStatus(task);
    }
  };

  const handleAddToToday = async (taskId: string) => {
    try {
      await updateTask(taskId, { dueDate: 'Today' });
    } catch (error) {
      toast.error('Failed to update task');
    }
  };

  const handleRemoveFromToday = async (taskId: string) => {
    try {
      await updateTask(taskId, { dueDate: undefined });
    } catch (error) {
      toast.error('Failed to update task');
    }
  };

  // Filter tasks into sections
  const overdueTasks = tasks.filter((t) => isOverdue(t));
  const dueTodayTasks = tasks.filter((t) => isDueToday(t) && t.status !== 'done');
  const highPriorityTasks = tasks.filter(
    (t) => t.priority === 'high' && t.status !== 'done' && !isDueToday(t) && !isOverdue(t),
  );

  // Tasks completed TODAY based on completedAt timestamp
  const todayStart = startOfDay(new Date());
  const todayEnd = new Date(todayStart);
  todayEnd.setHours(23, 59, 59, 999);

  const completedTodayTasks = tasks.filter((t) => {
    if (t.status !== 'done' || !t.completedAt) return false;
    // Handle both Date objects and ISO strings (from localStorage hydration)
    const completedAt = new Date(t.completedAt);
    if (!isValid(completedAt)) return false;
    return completedAt >= todayStart && completedAt <= todayEnd;
  });

  // Tasks not in any "today" section (for the picker)
  const otherTasks = tasks.filter((t) => t.status !== 'done' && !isDueToday(t) && !isOverdue(t));

  const totalItems = dueTodayTasks.length + overdueTasks.length + meetings.length;

  // Render a task row
  const renderTaskRow = (task: Task, isOverdueTask = false) => {
    const progress = getProgress(task);

    return (
      <div
        key={task.id}
        className={cn(
          'group -mx-2 flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-secondary/50',
          isOverdueTask && 'bg-destructive/5',
        )}
        onClick={(e) => handleTaskClick(task, e)}
      >
        <span className={cn('flex-shrink-0', statusConfig[task.status].color)}>{statusConfig[task.status].icon}</span>
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <span className={cn('truncate text-sm', isOverdueTask ? 'text-destructive' : 'text-foreground')}>
            {task.title}
          </span>
          {task.priority === 'high' && <Flag className="h-3 w-3 flex-shrink-0 text-destructive" />}
          {isOverdueTask && task.dueDate && (
            <Badge variant="destructive" className="h-4 px-1 text-[10px] font-normal">
              {task.dueDate}
            </Badge>
          )}
          {progress !== null && (
            <span className="flex flex-shrink-0 items-center gap-1 text-[10px] text-muted-foreground">
              <Progress value={progress} className="h-1 w-8" />
              {progress}%
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="widget-card animate-fade-in" style={{ animationDelay: '0.05s' }}>
      {/* Header */}
      <div className="widget-header">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-primary" />
          <span className="widget-title">Today's Agenda</span>
          <span className="ml-1 text-xs font-normal text-muted-foreground">{totalItems} items</span>
        </div>
        <div className="flex items-center gap-1">
          {/* Add to Today picker */}
          <Popover open={pickerOpen} onOpenChange={setPickerOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-muted-foreground hover:text-foreground"
                title="Add existing tasks to today"
                aria-label="Add existing tasks to today"
              >
                <CalendarPlus className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
              <div className="border-b border-border p-3">
                <h4 className="text-sm font-medium">Add tasks to Today</h4>
                <p className="mt-0.5 text-xs text-muted-foreground">Select tasks to add to your today view</p>
              </div>
              <ScrollArea className="max-h-64">
                <div className="space-y-1 p-2">
                  {dueTodayTasks.length > 0 && (
                    <div className="mb-2">
                      <p className="px-2 py-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                        Due Today
                      </p>
                      {dueTodayTasks.map((task) => (
                        <button
                          key={task.id}
                          onClick={() => handleRemoveFromToday(task.id)}
                          className="group flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors hover:bg-secondary/50"
                        >
                          <div className="flex h-4 w-4 flex-shrink-0 items-center justify-center rounded border-2 border-primary bg-primary">
                            <Check className="h-3 w-3 text-primary-foreground" />
                          </div>
                          <span className="flex-1 truncate">{task.title}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {otherTasks.length > 0 && (
                    <div>
                      <p className="px-2 py-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                        Other Tasks
                      </p>
                      {otherTasks.map((task) => (
                        <button
                          key={task.id}
                          onClick={() => handleAddToToday(task.id)}
                          className="group flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors hover:bg-secondary/50"
                        >
                          <div className="h-4 w-4 flex-shrink-0 rounded border-2 border-muted-foreground/30 group-hover:border-primary/50" />
                          <span className="flex-1 truncate">{task.title}</span>
                          {task.dueDate && (
                            <Badge variant="outline" className="h-4 px-1 text-[10px] font-normal">
                              {task.dueDate}
                            </Badge>
                          )}
                        </button>
                      ))}
                    </div>
                  )}

                  {otherTasks.length === 0 && dueTodayTasks.length === 0 && (
                    <p className="py-4 text-center text-sm text-muted-foreground">No tasks available</p>
                  )}

                  {otherTasks.length === 0 && dueTodayTasks.length > 0 && (
                    <p className="py-2 text-center text-xs text-muted-foreground">All tasks are already due today</p>
                  )}
                </div>
              </ScrollArea>
            </PopoverContent>
          </Popover>

          <Link to="/projects">
            <Button variant="ghost" size="sm" className="h-8 px-2 text-muted-foreground hover:text-foreground">
              <span className="text-xs">View all</span>
              <ChevronRight className="ml-1 h-3 w-3" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Overdue Tasks Section */}
      {overdueTasks.length > 0 && (
        <div className="mb-4">
          <div className="mb-2 flex items-center gap-2 border-b border-destructive/20 pb-1.5">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            <span className="text-xs font-semibold uppercase tracking-wide text-destructive">Overdue</span>
            <span className="text-xs text-destructive/70">({overdueTasks.length})</span>
          </div>
          <div className="space-y-1">
            {overdueTasks.slice(0, 3).map((task) => renderTaskRow(task, true))}
            {overdueTasks.length > 3 && (
              <p className="py-1 text-center text-xs text-destructive/70">+{overdueTasks.length - 3} more overdue</p>
            )}
          </div>
        </div>
      )}

      {/* Due Today Section */}
      <div className="mb-4">
        <div className="mb-2 flex items-center gap-2 border-b border-primary/20 pb-1.5">
          <CheckSquare className="h-4 w-4 text-primary" />
          <span className="text-xs font-semibold uppercase tracking-wide text-primary">Due Today</span>
          <span className="text-xs text-muted-foreground">({dueTodayTasks.length})</span>
        </div>

        <div className="space-y-1">
          {dueTodayTasks.slice(0, 4).map((task) => renderTaskRow(task))}

          {completedTodayTasks.slice(0, 1).map((task) => (
            <div
              key={task.id}
              className="-mx-2 flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 opacity-50 transition-colors hover:bg-secondary/50"
              onClick={(e) => handleTaskClick(task, e)}
            >
              <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-success-foreground" />
              <span className="flex-1 text-sm text-muted-foreground line-through">{task.title}</span>
            </div>
          ))}

          {dueTodayTasks.length === 0 && completedTodayTasks.length === 0 && (
            <p className="px-2 py-2 text-sm text-muted-foreground">No tasks due today</p>
          )}

          {dueTodayTasks.length > 4 && (
            <p className="py-1 text-center text-xs text-muted-foreground">+{dueTodayTasks.length - 4} more tasks</p>
          )}
        </div>
      </div>

      {/* High Priority Section */}
      {highPriorityTasks.length > 0 && (
        <div className="mb-4">
          <div className="mb-2 flex items-center gap-2 border-b border-orange-500/20 pb-1.5">
            <Flag className="h-4 w-4 text-orange-500" />
            <span className="text-xs font-semibold uppercase tracking-wide text-orange-500">High Priority</span>
            <span className="text-xs text-muted-foreground">({highPriorityTasks.length})</span>
          </div>
          <div className="space-y-1">
            {highPriorityTasks.slice(0, 3).map((task) => renderTaskRow(task))}
            {highPriorityTasks.length > 3 && (
              <p className="py-1 text-center text-xs text-muted-foreground">
                +{highPriorityTasks.length - 3} more high priority
              </p>
            )}
          </div>
        </div>
      )}

      {/* Add task input */}
      <div className="mb-4 border-t border-border/50 pt-2">
        {showInput ? (
          <div className="flex items-center gap-2">
            <Input
              autoFocus
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddTask();
                if (e.key === 'Escape') {
                  setShowInput(false);
                  setNewTaskTitle('');
                }
              }}
              placeholder="Task title..."
              className="h-8 text-sm"
            />
            <Button size="sm" className="h-8" onClick={handleAddTask} disabled={!newTaskTitle.trim()}>
              Add
            </Button>
          </div>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            className="-mx-2 h-8 w-full justify-start text-muted-foreground hover:text-foreground"
            onClick={() => setShowInput(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            <span className="text-sm">Add task</span>
          </Button>
        )}
      </div>

      {/* Meetings Section */}
      <div>
        <div className="mb-2 flex items-center gap-2 border-b border-info/20 pb-1.5">
          <Video className="h-4 w-4 text-info-foreground" />
          <span className="text-xs font-semibold uppercase tracking-wide text-info-foreground">Meetings</span>
          <span className="text-xs text-muted-foreground">({meetings.length})</span>
        </div>

        {meetings.length > 0 ? (
          <div className="space-y-2">
            {meetings.slice(0, 3).map((meeting) => (
              <div
                key={meeting.id}
                className="-mx-1 flex cursor-pointer items-start gap-3 rounded-lg bg-secondary/30 px-3 py-2.5 transition-colors hover:bg-secondary/50"
              >
                <div className="flex min-w-[50px] flex-col items-center">
                  <span className="text-xs font-medium text-foreground">{formatTime(meeting.startTime)}</span>
                  <span className="text-[10px] text-muted-foreground">
                    {formatDuration(meeting.startTime, meeting.endTime)}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{meeting.title}</p>
                  {meeting.location && (
                    <div className="mt-0.5 flex items-center gap-1">
                      {meeting.location.toLowerCase().includes('zoom') ? (
                        <Video className="h-3 w-3 text-muted-foreground" />
                      ) : (
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                      )}
                      <span className="text-xs text-muted-foreground">{meeting.location}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {meetings.length > 3 && (
              <p className="text-center text-xs text-muted-foreground">+{meetings.length - 3} more meetings</p>
            )}
          </div>
        ) : (
          <p className="px-2 py-2 text-sm text-muted-foreground">No meetings today</p>
        )}
      </div>
    </div>
  );
};

export default TodayAgendaWidget;
