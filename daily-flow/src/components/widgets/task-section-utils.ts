import { Task, TaskStatus } from '@/types';
import { parseDate, isToday as isTodayUtil, isOverdue as isOverdueUtil, isSameDayAs } from '@/lib/dateUtils';
import { startOfDay, addDays, isAfter, isBefore } from 'date-fns';
import type { TasksWidgetSection, TasksWidgetSettings, SectionId } from './TasksWidgetConfig';

export type TaskVariant = 'overdue' | 'default' | 'completed';

export const statusConfig: Record<TaskStatus, { color: string }> = {
  backlog: { color: 'text-muted-foreground' },
  todo: { color: 'text-foreground' },
  doing: { color: 'text-info-foreground' },
  blocked: { color: 'text-destructive' },
  done: { color: 'text-white' },
};

const today = () => startOfDay(new Date());

export const isDueToday = (dueDate: string | undefined): boolean => isTodayUtil(dueDate);

export const isOverdue = (dueDate: string | undefined): boolean => isOverdueUtil(dueDate);

export const isDueThisWeek = (dueDate: string | undefined): boolean => {
  if (!dueDate) return false;
  if (isTodayUtil(dueDate)) return false;

  const parsed = parseDate(dueDate);
  if (!parsed) return false;

  const t = today();
  const parsedDay = startOfDay(parsed);
  return isAfter(parsedDay, t) && isBefore(parsedDay, addDays(t, 7));
};

export const wasCompletedToday = (task: Task): boolean => {
  if (task.status !== 'done' || !task.completedAt) return false;
  return isSameDayAs(task.completedAt, new Date());
};

export function getTasksForSection(
  section: TasksWidgetSection,
  tasks: Task[],
  taskOrder?: TasksWidgetSettings['taskOrder']
): { pending: Task[]; completed: Task[] } {
  const pending: Task[] = [];
  const completed: Task[] = [];

  tasks.forEach(task => {
    const isDone = task.status === 'done';
    if (isDone && !wasCompletedToday(task)) return;

    let matches = false;

    if (section.type === 'topic' && section.topicId) {
      matches = task.topicIds?.includes(section.topicId) ?? false;
    } else if (section.type === 'tag' && section.tagName) {
      matches = task.tags?.includes(section.tagName) ?? false;
    } else {
      switch (section.id) {
        case 'overdue': matches = isOverdue(task.dueDate); break;
        case 'dueToday': matches = isDueToday(task.dueDate); break;
        case 'dueThisWeek': matches = isDueThisWeek(task.dueDate); break;
        case 'highPriority': matches = task.priority === 'high'; break;
        case 'mediumPriority': matches = task.priority === 'medium'; break;
        case 'lowPriority': matches = task.priority === 'low'; break;
        case 'doing': matches = task.status === 'doing'; break;
        case 'blocked': matches = task.status === 'blocked'; break;
        case 'backlog': matches = task.status === 'backlog'; break;
      }
    }

    if (matches) {
      isDone ? completed.push(task) : pending.push(task);
    }
  });

  const customOrder = taskOrder?.[section.id];
  if (customOrder && customOrder.length > 0) {
    const orderMap = new Map(customOrder.map((id, index) => [id, index]));
    pending.sort((a, b) => {
      const aIndex = orderMap.get(a.id);
      const bIndex = orderMap.get(b.id);
      if (aIndex !== undefined && bIndex !== undefined) return aIndex - bIndex;
      if (aIndex !== undefined) return -1;
      if (bIndex !== undefined) return 1;
      return 0;
    });
  }

  return { pending, completed };
}

export interface SectionDisplayConfig {
  icon: string;
  iconColor: string;
  labelColor: string;
  emptyText: string;
}

/** Returns icon name (lucide), colors, and empty state text for a section. */
export function getSectionDisplayConfig(section: TasksWidgetSection): SectionDisplayConfig {
  if (section.type === 'topic') {
    return { icon: 'Folder', iconColor: 'text-accent', labelColor: 'text-accent', emptyText: `No tasks in ${section.label}` };
  }
  if (section.type === 'tag') {
    return { icon: 'Hash', iconColor: 'text-info-foreground', labelColor: 'text-info-foreground', emptyText: `No tasks tagged ${section.label}` };
  }

  switch (section.id) {
    case 'overdue':
      return { icon: 'AlertTriangle', iconColor: 'text-destructive', labelColor: 'text-destructive', emptyText: 'No overdue tasks' };
    case 'highPriority':
      return { icon: 'Flag', iconColor: 'text-destructive', labelColor: 'text-destructive', emptyText: 'No high priority tasks' };
    case 'mediumPriority':
      return { icon: 'Flag', iconColor: 'text-warning-foreground', labelColor: 'text-warning-foreground', emptyText: 'No medium priority tasks' };
    case 'lowPriority':
      return { icon: 'Flag', iconColor: 'text-muted-foreground', labelColor: 'text-muted-foreground', emptyText: 'No low priority tasks' };
    case 'dueToday':
      return { icon: 'CheckSquare', iconColor: 'text-primary', labelColor: 'text-primary', emptyText: 'No tasks due today' };
    case 'dueThisWeek':
      return { icon: 'Calendar', iconColor: 'text-info-foreground', labelColor: 'text-info-foreground', emptyText: 'No tasks due this week' };
    case 'doing':
      return { icon: 'Clock', iconColor: 'text-info-foreground', labelColor: 'text-info-foreground', emptyText: 'No tasks in progress' };
    case 'blocked':
      return { icon: 'Pause', iconColor: 'text-destructive', labelColor: 'text-destructive', emptyText: 'No blocked tasks' };
    case 'backlog':
      return { icon: 'Archive', iconColor: 'text-muted-foreground', labelColor: 'text-muted-foreground', emptyText: 'No backlog tasks' };
    default:
      return { icon: 'CheckSquare', iconColor: 'text-primary', labelColor: 'text-primary', emptyText: 'No tasks' };
  }
}
