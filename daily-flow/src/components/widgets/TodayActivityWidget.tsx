import { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { 
  Activity, 
  ChevronDown, 
  ChevronUp, 
  Hash, 
  FileText, 
  FolderOpen,
  CheckSquare,
  BookOpen,
  Sparkles,
  Edit3,
  Trash2,
  ListChecks,
  CheckCircle2,
  RotateCcw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { JournalEntry, Task, Capture, Subtask, RoutineItem } from '@/types';
import { cn } from '@/lib/utils';
import { useKaivooStore, RoutineCompletionRecord } from '@/stores/useKaivooStore';
import { formatStorageDate } from '@/lib/dateUtils';
import { startOfDay, endOfDay } from 'date-fns';
import { useAIActionLog } from '@/hooks/useAIActionLog';

// Activity item types
type ActivityType = 'journal' | 'task' | 'capture' | 'subtask' | 'routine-completed' | 'task-completed';

interface SubtaskWithParent extends Subtask {
  parentTaskId: string;
  parentTaskTitle: string;
  createdAt: Date;
}

interface RoutineCompletionWithDetails {
  routine: RoutineItem;
  completedAt: Date;
}

interface TaskCompletionDetails {
  task: Task;
  completedAt: Date;
}

interface ActivityItem {
  id: string;
  type: ActivityType;
  timestamp: Date;
  content: string;
  tags: string[];
  topicIds: string[];
  priority?: string;
  status?: string;
  source?: string;
  parentTaskTitle?: string;
  originalItem: JournalEntry | Task | Capture | SubtaskWithParent | RoutineCompletionWithDetails | TaskCompletionDetails;
}

interface TodayActivityWidgetProps {
  date?: Date;
  onEditJournal?: (entry: JournalEntry) => void;
  onDeleteJournal?: (entryId: string) => void;
  onTaskClick?: (taskId: string) => void;
  onEditCapture?: (capture: Capture) => void;
  onDeleteCapture?: (captureId: string) => void;
}

const TodayActivityWidget = ({ date, onEditJournal, onDeleteJournal, onTaskClick, onEditCapture, onDeleteCapture }: TodayActivityWidgetProps) => {
  const [expanded, setExpanded] = useState(true);
  const tasks = useKaivooStore(s => s.tasks);
  const journalEntries = useKaivooStore(s => s.journalEntries);
  const captures = useKaivooStore(s => s.captures);
  const getTopicPath = useKaivooStore(s => s.getTopicPath);
  const routines = useKaivooStore(s => s.routines);
  const routineCompletions = useKaivooStore(s => s.routineCompletions);
  const getCompletionsForDate = useKaivooStore(s => s.getCompletionsForDate);
  const { logs } = useAIActionLog();

  const todayStr = useMemo(() => formatStorageDate(date || new Date()), [date]);
  const refDate = useMemo(() => date || new Date(), [todayStr]);
  const todayStart = useMemo(() => startOfDay(refDate), [refDate]);
  const todayEnd = useMemo(() => endOfDay(refDate), [refDate]);

  const undoneIds = useMemo(() => {
    const undoneTaskIds = new Set<string>();
    const undoneCaptureIds = new Set<string>();

    for (const log of logs) {
      if (!log.undoneAt) continue;
      const data = log.actionData as Record<string, unknown>;

      if (log.actionType === 'task_created' && typeof data.taskId === 'string') {
        undoneTaskIds.add(data.taskId);
      }
      if (log.actionType === 'capture_created' && typeof data.captureId === 'string') {
        undoneCaptureIds.add(data.captureId);
      }
    }

    return { undoneTaskIds, undoneCaptureIds };
  }, [logs]);

  // Combine all activity from today
  const activityItems = useMemo<ActivityItem[]>(() => {
    const items: ActivityItem[] = [];

    // Journal entries created today
    journalEntries
      .filter(entry => entry.date === todayStr)
      .forEach(entry => {
        // Strip HTML tags for display preview
        const plainContent = entry.content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
        items.push({
          id: `journal-${entry.id}`,
          type: 'journal',
          timestamp: new Date(entry.timestamp),
          content: plainContent,
          tags: entry.tags,
          topicIds: entry.topicIds,
          originalItem: entry,
        });
      });

    // Tasks created today
    tasks
      .filter(task => {
        if (undoneIds.undoneTaskIds.has(task.id)) return false;
        const createdAt = task.createdAt instanceof Date ? task.createdAt : new Date(task.createdAt);
        return createdAt >= todayStart && createdAt <= todayEnd;
      })
      .forEach(task => {
        items.push({
          id: `task-${task.id}`,
          type: 'task',
          timestamp: task.createdAt instanceof Date ? task.createdAt : new Date(task.createdAt),
          content: task.title,
          tags: task.tags,
          topicIds: task.topicIds,
          priority: task.priority,
          status: task.status,
          originalItem: task,
        });
      });

    // Subtasks created today (we need to check createdAt on subtasks - added via store)
    tasks.forEach(task => {
      task.subtasks.forEach(subtask => {
        // Check if subtask has a createdAt timestamp and was created today
        const subtaskWithMeta = subtask as Subtask & { createdAt?: Date };
        if (subtaskWithMeta.createdAt) {
          const createdAt = subtaskWithMeta.createdAt instanceof Date 
            ? subtaskWithMeta.createdAt 
            : new Date(subtaskWithMeta.createdAt);
          if (createdAt >= todayStart && createdAt <= todayEnd) {
            const subtaskItem: SubtaskWithParent = {
              ...subtask,
              parentTaskId: task.id,
              parentTaskTitle: task.title,
              createdAt,
            };
            items.push({
              id: `subtask-${subtask.id}`,
              type: 'subtask',
              timestamp: createdAt,
              content: subtask.title,
              tags: subtask.tags || [],
              topicIds: task.topicIds,
              parentTaskTitle: task.title,
              originalItem: subtaskItem,
            });
          }
        }
      });
    });

    // Captures (AI entries) created today - use the stored date field for consistent filtering
    captures
      .filter(capture => {
        if (undoneIds.undoneCaptureIds.has(capture.id)) return false;
        // Use the date field (YYYY-MM-DD) for accurate day-based filtering
        return capture.date === todayStr;
      })
      .forEach(capture => {
        items.push({
          id: `capture-${capture.id}`,
          type: 'capture',
          timestamp: capture.createdAt instanceof Date ? capture.createdAt : new Date(capture.createdAt),
          content: capture.content.split('\n')[0].slice(0, 200), // First line, truncated
          tags: capture.tags,
          topicIds: capture.topicIds,
          source: capture.source,
          originalItem: capture,
        });
      });

    // Routine completions for today
    const todayRoutineCompletions = getCompletionsForDate(todayStr);
    todayRoutineCompletions.forEach(completion => {
      const routine = routines.find(r => r.id === completion.routineId);
      if (routine) {
        const completedAt = completion.completedAt instanceof Date 
          ? completion.completedAt 
          : new Date(completion.completedAt);
        items.push({
          id: `routine-${completion.routineId}-${todayStr}`,
          type: 'routine-completed',
          timestamp: completedAt,
          content: routine.name,
          tags: [],
          topicIds: [],
          originalItem: { routine, completedAt } as RoutineCompletionWithDetails,
        });
      }
    });

    // Tasks completed today
    tasks
      .filter(task => {
        if (task.status !== 'done' || !task.completedAt) return false;
        const completedAt = task.completedAt instanceof Date ? task.completedAt : new Date(task.completedAt);
        return completedAt >= todayStart && completedAt <= todayEnd;
      })
      .forEach(task => {
        const completedAt = task.completedAt instanceof Date ? task.completedAt : new Date(task.completedAt);
        items.push({
          id: `task-completed-${task.id}`,
          type: 'task-completed',
          timestamp: completedAt,
          content: task.title,
          tags: task.tags,
          topicIds: task.topicIds,
          priority: task.priority,
          originalItem: { task, completedAt } as TaskCompletionDetails,
        });
      });

    // Sort by timestamp descending (newest first)
    return items.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }, [journalEntries, tasks, captures, todayStr, undoneIds, routines, routineCompletions, getCompletionsForDate]);

  if (activityItems.length === 0) {
    return null;
  }

  const getTypeIcon = (type: ActivityType, source?: string) => {
    switch (type) {
      case 'journal':
        return <BookOpen className="w-3 h-3" />;
      case 'task':
        return <CheckSquare className="w-3 h-3" />;
      case 'subtask':
        return <ListChecks className="w-3 h-3" />;
      case 'capture':
        return source === 'quick' ? <Sparkles className="w-3 h-3" /> : <Sparkles className="w-3 h-3" />;
      case 'routine-completed':
        return <RotateCcw className="w-3 h-3" />;
      case 'task-completed':
        return <CheckCircle2 className="w-3 h-3" />;
    }
  };

  const getTypeLabel = (type: ActivityType, source?: string) => {
    switch (type) {
      case 'journal':
        return 'Notes';
      case 'task':
        return 'Task Created';
      case 'subtask':
        return 'Subtask';
      case 'capture':
        if (source === 'video') return 'Video';
        if (source === 'quick') return 'AI Note';
        return 'AI Capture';
      case 'routine-completed':
        return 'Routine Done';
      case 'task-completed':
        return 'Task Done';
    }
  };

  const getTypeColor = (type: ActivityType) => {
    switch (type) {
      case 'journal':
        return 'text-primary bg-primary/10';
      case 'task':
        return 'text-accent bg-accent/10';
      case 'subtask':
        return 'text-muted-foreground bg-muted';
      case 'capture':
        return 'text-secondary-foreground bg-secondary';
      case 'routine-completed':
        return 'text-green-600 bg-green-500/10';
      case 'task-completed':
        return 'text-green-600 bg-green-500/10';
    }
  };

  const handleItemClick = (item: ActivityItem) => {
    if (item.type === 'journal' && onEditJournal) {
      onEditJournal(item.originalItem as JournalEntry);
    } else if (item.type === 'task' && onTaskClick) {
      onTaskClick((item.originalItem as Task).id);
    } else if (item.type === 'subtask' && onTaskClick) {
      // Navigate to parent task when clicking a subtask
      const subtaskItem = item.originalItem as SubtaskWithParent;
      onTaskClick(subtaskItem.parentTaskId);
    } else if (item.type === 'capture' && onEditCapture) {
      onEditCapture(item.originalItem as Capture);
    } else if (item.type === 'task-completed' && onTaskClick) {
      const taskDetails = item.originalItem as TaskCompletionDetails;
      onTaskClick(taskDetails.task.id);
    }
    // routine-completed items are not clickable (no drawer for routines)
  };

  return (
    <div className="widget-card animate-fade-in">
      <div className="widget-header">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-primary" />
          <span className="widget-title">Today's Activity</span>
          <span className="text-xs text-muted-foreground">({activityItems.length})</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-2"
          onClick={() => setExpanded(!expanded)}
          aria-label={expanded ? "Collapse activity feed" : "Expand activity feed"}
        >
          {expanded ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </Button>
      </div>

      {expanded && (
        <div className="space-y-3 relative">
          {/* Timeline line */}
          <div className="absolute left-[11px] top-3 bottom-3 w-px bg-border" />

          {activityItems.map((item) => (
            <div key={item.id} className="flex gap-3 relative group">
              {/* Timeline dot with type indicator */}
              <div className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center shrink-0 z-10 border-2",
                item.type === 'journal' && "bg-primary/20 border-primary/50",
                item.type === 'task' && "bg-accent/20 border-accent/50",
                item.type === 'subtask' && "bg-muted border-muted-foreground/30",
                item.type === 'capture' && "bg-secondary border-secondary-foreground/30",
                item.type === 'routine-completed' && "bg-green-500/20 border-green-500/50",
                item.type === 'task-completed' && "bg-green-500/20 border-green-500/50"
              )}>
                {getTypeIcon(item.type, item.source)}
              </div>

              {/* Activity card */}
              <div 
                className={cn(
                  "flex-1 bg-secondary/30 rounded-lg p-3 transition-colors",
                  "hover:bg-secondary/50 cursor-pointer"
                )}
                onClick={() => handleItemClick(item)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "text-[10px] font-medium px-1.5 py-0.5 rounded",
                      getTypeColor(item.type)
                    )}>
                      {getTypeLabel(item.type, item.source)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {format(item.timestamp, 'h:mm a')}
                    </span>
                  </div>
                  {(item.type === 'journal' || item.type === 'capture') && (
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2"
                        aria-label={`Edit ${item.type === 'journal' ? 'journal entry' : 'capture'}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (item.type === 'journal' && onEditJournal) {
                            onEditJournal(item.originalItem as JournalEntry);
                          } else if (item.type === 'capture' && onEditCapture) {
                            onEditCapture(item.originalItem as Capture);
                          }
                        }}
                      >
                        <Edit3 className="w-3 h-3" />
                      </Button>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2"
                            aria-label={`Delete ${item.type === 'journal' ? 'journal entry' : 'capture'}`}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete this entry?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently delete it.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => {
                                if (item.type === 'journal' && onDeleteJournal) {
                                  onDeleteJournal((item.originalItem as JournalEntry).id);
                                }
                                if (item.type === 'capture' && onDeleteCapture) {
                                  onDeleteCapture((item.originalItem as Capture).id);
                                }
                              }}
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  )}
                </div>
                
                {/* Parent task reference for subtasks */}
                {item.type === 'subtask' && item.parentTaskTitle && (
                  <p className="text-xs text-muted-foreground mb-1">
                    in: {item.parentTaskTitle}
                  </p>
                )}

                <p className={cn(
                  "text-sm text-foreground line-clamp-3",
                  item.type === 'journal' && "font-serif leading-relaxed"
                )}>
                  {item.content}
                </p>

                {/* Priority badge for tasks */}
                {item.type === 'task' && item.priority === 'high' && (
                  <span className="inline-block mt-2 text-[10px] font-medium px-1.5 py-0.5 rounded bg-destructive/10 text-destructive">
                    High Priority
                  </span>
                )}

                {/* Tags and topics */}
                {(item.tags.length > 0 || item.topicIds.length > 0) && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {item.tags.map((tag) => (
                      <span key={tag} className="tag-chip text-[10px] py-0.5 px-1.5">
                        <Hash className="w-2.5 h-2.5" />
                        {tag}
                      </span>
                    ))}
                    {item.topicIds.map((topicId) => {
                      const path = getTopicPath(topicId);
                      if (!path) return null;
                      const isPage = path.includes('/');
                      return (
                        <span key={topicId} className="topic-chip text-[10px] py-0.5 px-1.5">
                          {isPage ? <FileText className="w-2.5 h-2.5" /> : <FolderOpen className="w-2.5 h-2.5" />}
                          {path}
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TodayActivityWidget;
