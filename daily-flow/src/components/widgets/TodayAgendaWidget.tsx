import { useState } from 'react';
import { 
  CheckSquare, Circle, CheckCircle2, ChevronRight, Plus, Clock, Archive, Pause,
  CalendarPlus, Check, Video, MapPin, Calendar, AlertTriangle, Flag
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { useKaivooStore } from '@/stores/useKaivooStore';
import { Task, TaskStatus } from '@/types';
import { parseDate, isToday as isTodayUtil, isOverdue as isOverdueUtil, formatStorageDate, formatTime as formatTimeUtil, getDurationMinutes, formatDuration as formatDurationUtil } from '@/lib/dateUtils';
import { startOfDay, endOfDay, isValid } from 'date-fns';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useKaivooActions } from '@/hooks/useKaivooActions';
import { toast } from 'sonner';

const statusConfig: Record<TaskStatus, { icon: React.ReactNode; color: string }> = {
  backlog: { icon: <Archive className="w-4 h-4" />, color: 'text-muted-foreground' },
  todo: { icon: <Circle className="w-4 h-4" />, color: 'text-foreground' },
  doing: { icon: <Clock className="w-4 h-4" />, color: 'text-info' },
  blocked: { icon: <Pause className="w-4 h-4" />, color: 'text-destructive' },
  done: { icon: <CheckCircle2 className="w-4 h-4" />, color: 'text-success' },
};

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
  const { tasks, getTodaysMeetings } = useKaivooStore();
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
    const completed = task.subtasks.filter(s => s.completed).length;
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
  const overdueTasks = tasks.filter(t => isOverdue(t));
  const dueTodayTasks = tasks.filter(t => isDueToday(t) && t.status !== 'done');
  const highPriorityTasks = tasks.filter(t => 
    t.priority === 'high' && 
    t.status !== 'done' && 
    !isDueToday(t) && 
    !isOverdue(t)
  );
  
  // Tasks completed TODAY based on completedAt timestamp
  const todayStart = startOfDay(new Date());
  const todayEnd = new Date(todayStart);
  todayEnd.setHours(23, 59, 59, 999);
  
  const completedTodayTasks = tasks.filter(t => {
    if (t.status !== 'done' || !t.completedAt) return false;
    // Handle both Date objects and ISO strings (from localStorage hydration)
    const completedAt = new Date(t.completedAt);
    if (!isValid(completedAt)) return false;
    return completedAt >= todayStart && completedAt <= todayEnd;
  });
  
  // Tasks not in any "today" section (for the picker)
  const otherTasks = tasks.filter(t => 
    t.status !== 'done' && 
    !isDueToday(t) && 
    !isOverdue(t)
  );

  const totalItems = dueTodayTasks.length + overdueTasks.length + meetings.length;

  // Render a task row
  const renderTaskRow = (task: Task, isOverdueTask = false) => {
    const progress = getProgress(task);
    
    return (
      <div
        key={task.id}
        className={cn(
          "flex items-center gap-3 py-2 px-2 -mx-2 rounded-lg hover:bg-secondary/50 transition-colors cursor-pointer group",
          isOverdueTask && "bg-destructive/5"
        )}
        onClick={(e) => handleTaskClick(task, e)}
      >
        <span className={cn('flex-shrink-0', statusConfig[task.status].color)}>
          {statusConfig[task.status].icon}
        </span>
        <div className="flex-1 min-w-0 flex items-center gap-2">
          <span className={cn(
            "text-sm truncate",
            isOverdueTask ? "text-destructive" : "text-foreground"
          )}>
            {task.title}
          </span>
          {task.priority === 'high' && (
            <Flag className="w-3 h-3 text-destructive flex-shrink-0" />
          )}
          {isOverdueTask && task.dueDate && (
            <Badge variant="destructive" className="text-[10px] h-4 px-1 font-normal">
              {task.dueDate}
            </Badge>
          )}
          {progress !== null && (
            <span className="text-[10px] text-muted-foreground flex items-center gap-1 flex-shrink-0">
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
          <Calendar className="w-4 h-4 text-primary" />
          <span className="widget-title">Today's Agenda</span>
          <span className="text-xs text-muted-foreground font-normal ml-1">
            {totalItems} items
          </span>
        </div>
        <div className="flex items-center gap-1">
          {/* Add to Today picker */}
          <Popover open={pickerOpen} onOpenChange={setPickerOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground h-8 px-2"
                title="Add existing tasks to today"
                aria-label="Add existing tasks to today"
              >
                <CalendarPlus className="w-4 h-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
              <div className="p-3 border-b border-border">
                <h4 className="font-medium text-sm">Add tasks to Today</h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Select tasks to add to your today view
                </p>
              </div>
              <ScrollArea className="max-h-64">
                <div className="p-2 space-y-1">
                  {dueTodayTasks.length > 0 && (
                    <div className="mb-2">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground px-2 py-1 font-medium">
                        Due Today
                      </p>
                      {dueTodayTasks.map(task => (
                        <button
                          key={task.id}
                          onClick={() => handleRemoveFromToday(task.id)}
                          className="w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded-md hover:bg-secondary/50 transition-colors text-left group"
                        >
                          <div className="w-4 h-4 rounded border-2 border-primary bg-primary flex items-center justify-center flex-shrink-0">
                            <Check className="w-3 h-3 text-primary-foreground" />
                          </div>
                          <span className="truncate flex-1">{task.title}</span>
                        </button>
                      ))}
                    </div>
                  )}
                  
                  {otherTasks.length > 0 && (
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground px-2 py-1 font-medium">
                        Other Tasks
                      </p>
                      {otherTasks.map(task => (
                        <button
                          key={task.id}
                          onClick={() => handleAddToToday(task.id)}
                          className="w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded-md hover:bg-secondary/50 transition-colors text-left group"
                        >
                          <div className="w-4 h-4 rounded border-2 border-muted-foreground/30 flex-shrink-0 group-hover:border-primary/50" />
                          <span className="truncate flex-1">{task.title}</span>
                          {task.dueDate && (
                            <Badge variant="outline" className="text-[10px] h-4 px-1 font-normal">
                              {task.dueDate}
                            </Badge>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                  
                  {otherTasks.length === 0 && dueTodayTasks.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No tasks available
                    </p>
                  )}
                  
                  {otherTasks.length === 0 && dueTodayTasks.length > 0 && (
                    <p className="text-xs text-muted-foreground text-center py-2">
                      All tasks are already due today
                    </p>
                  )}
                </div>
              </ScrollArea>
            </PopoverContent>
          </Popover>

          <Link to="/tasks">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-muted-foreground hover:text-foreground h-8 px-2"
            >
              <span className="text-xs">View all</span>
              <ChevronRight className="w-3 h-3 ml-1" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Overdue Tasks Section */}
      {overdueTasks.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2 pb-1.5 border-b border-destructive/20">
            <AlertTriangle className="w-4 h-4 text-destructive" />
            <span className="text-xs font-semibold uppercase tracking-wide text-destructive">
              Overdue
            </span>
            <span className="text-xs text-destructive/70">
              ({overdueTasks.length})
            </span>
          </div>
          <div className="space-y-1">
            {overdueTasks.slice(0, 3).map((task) => renderTaskRow(task, true))}
            {overdueTasks.length > 3 && (
              <p className="text-xs text-destructive/70 text-center py-1">
                +{overdueTasks.length - 3} more overdue
              </p>
            )}
          </div>
        </div>
      )}

      {/* Due Today Section */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2 pb-1.5 border-b border-primary/20">
          <CheckSquare className="w-4 h-4 text-primary" />
          <span className="text-xs font-semibold uppercase tracking-wide text-primary">
            Due Today
          </span>
          <span className="text-xs text-muted-foreground">
            ({dueTodayTasks.length})
          </span>
        </div>
        
        <div className="space-y-1">
          {dueTodayTasks.slice(0, 4).map((task) => renderTaskRow(task))}
          
          {completedTodayTasks.slice(0, 1).map((task) => (
            <div
              key={task.id}
              className="flex items-center gap-3 py-2 px-2 -mx-2 rounded-lg hover:bg-secondary/50 transition-colors cursor-pointer opacity-50"
              onClick={(e) => handleTaskClick(task, e)}
            >
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-success" />
              <span className="text-sm flex-1 line-through text-muted-foreground">{task.title}</span>
            </div>
          ))}
          
          {dueTodayTasks.length === 0 && completedTodayTasks.length === 0 && (
            <p className="text-sm text-muted-foreground py-2 px-2">
              No tasks due today
            </p>
          )}

          {dueTodayTasks.length > 4 && (
            <p className="text-xs text-muted-foreground text-center py-1">
              +{dueTodayTasks.length - 4} more tasks
            </p>
          )}
        </div>
      </div>

      {/* High Priority Section */}
      {highPriorityTasks.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2 pb-1.5 border-b border-orange-500/20">
            <Flag className="w-4 h-4 text-orange-500" />
            <span className="text-xs font-semibold uppercase tracking-wide text-orange-500">
              High Priority
            </span>
            <span className="text-xs text-muted-foreground">
              ({highPriorityTasks.length})
            </span>
          </div>
          <div className="space-y-1">
            {highPriorityTasks.slice(0, 3).map((task) => renderTaskRow(task))}
            {highPriorityTasks.length > 3 && (
              <p className="text-xs text-muted-foreground text-center py-1">
                +{highPriorityTasks.length - 3} more high priority
              </p>
            )}
          </div>
        </div>
      )}

      {/* Add task input */}
      <div className="mb-4 pt-2 border-t border-border/50">
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
            className="w-full justify-start text-muted-foreground hover:text-foreground h-8 -mx-2"
            onClick={() => setShowInput(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            <span className="text-sm">Add task</span>
          </Button>
        )}
      </div>

      {/* Meetings Section */}
      <div>
        <div className="flex items-center gap-2 mb-2 pb-1.5 border-b border-info/20">
          <Video className="w-4 h-4 text-info" />
          <span className="text-xs font-semibold uppercase tracking-wide text-info">
            Meetings
          </span>
          <span className="text-xs text-muted-foreground">
            ({meetings.length})
          </span>
        </div>
        
        {meetings.length > 0 ? (
          <div className="space-y-2">
            {meetings.slice(0, 3).map((meeting) => (
              <div
                key={meeting.id}
                className="flex items-start gap-3 py-2.5 px-3 -mx-1 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors cursor-pointer"
              >
                <div className="flex flex-col items-center min-w-[50px]">
                  <span className="text-xs font-medium text-foreground">{formatTime(meeting.startTime)}</span>
                  <span className="text-[10px] text-muted-foreground">{formatDuration(meeting.startTime, meeting.endTime)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{meeting.title}</p>
                  {meeting.location && (
                    <div className="flex items-center gap-1 mt-0.5">
                      {meeting.location.toLowerCase().includes('zoom') ? (
                        <Video className="w-3 h-3 text-muted-foreground" />
                      ) : (
                        <MapPin className="w-3 h-3 text-muted-foreground" />
                      )}
                      <span className="text-xs text-muted-foreground">{meeting.location}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {meetings.length > 3 && (
              <p className="text-xs text-muted-foreground text-center">+{meetings.length - 3} more meetings</p>
            )}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground py-2 px-2">
            No meetings today
          </p>
        )}
      </div>
    </div>
  );
};

export default TodayAgendaWidget;