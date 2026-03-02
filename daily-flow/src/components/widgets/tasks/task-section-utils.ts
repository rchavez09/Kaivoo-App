import { Task, TaskStatus } from '@/types';
import { parseDate, isSameDayAs } from '@/lib/dateUtils';
import { startOfDay, addDays, isAfter, isBefore, isSameDay } from 'date-fns';
import type { TasksWidgetSection, TasksWidgetSettings, SectionId } from './TasksWidgetConfig';
export { statusConfig } from '@/lib/task-config';

export type TaskVariant = 'overdue' | 'default' | 'completed';

/**
 * Date-aware section utility functions.
 * When `referenceDate` is provided, comparisons use it instead of `new Date()`.
 */

export const isDueToday = (dueDate: string | undefined, referenceDate?: Date): boolean => {
  if (!dueDate) return false;
  const parsed = parseDate(dueDate);
  if (!parsed) return false;
  const ref = referenceDate ? startOfDay(referenceDate) : startOfDay(new Date());
  return isSameDay(startOfDay(parsed), ref);
};

export const isOverdue = (dueDate: string | undefined, referenceDate?: Date): boolean => {
  if (!dueDate) return false;
  const parsed = parseDate(dueDate);
  if (!parsed) return false;
  const ref = referenceDate ? startOfDay(referenceDate) : startOfDay(new Date());
  return startOfDay(parsed) < ref;
};

export const isDueThisWeek = (dueDate: string | undefined, referenceDate?: Date): boolean => {
  if (!dueDate) return false;
  if (isDueToday(dueDate, referenceDate)) return false;

  const parsed = parseDate(dueDate);
  if (!parsed) return false;

  const ref = referenceDate ? startOfDay(referenceDate) : startOfDay(new Date());
  const parsedDay = startOfDay(parsed);
  return isAfter(parsedDay, ref) && isBefore(parsedDay, addDays(ref, 7));
};

export const wasCompletedOnDate = (task: Task, referenceDate?: Date): boolean => {
  if (task.status !== 'done' || !task.completedAt) return false;
  const ref = referenceDate || new Date();
  return isSameDayAs(task.completedAt, ref);
};

export const wasCompletedToday = (task: Task): boolean => wasCompletedOnDate(task);

export function getTasksForSection(
  section: TasksWidgetSection,
  tasks: Task[],
  taskOrder?: TasksWidgetSettings['taskOrder'],
  referenceDate?: Date,
): { pending: Task[]; completed: Task[] } {
  const pending: Task[] = [];
  const completed: Task[] = [];

  tasks.forEach((task) => {
    const isDone = task.status === 'done';
    if (isDone && !wasCompletedOnDate(task, referenceDate)) return;

    let matches = false;

    if (section.type === 'topic' && section.topicId) {
      matches = task.topicIds?.includes(section.topicId) ?? false;
    } else if (section.type === 'tag' && section.tagName) {
      matches = task.tags?.includes(section.tagName) ?? false;
    } else {
      switch (section.id) {
        case 'overdue':
          matches = isOverdue(task.dueDate, referenceDate);
          break;
        case 'dueToday':
          matches = isDueToday(task.dueDate, referenceDate);
          break;
        case 'dueThisWeek':
          matches = isDueThisWeek(task.dueDate, referenceDate);
          break;
        case 'highPriority':
          matches = task.priority === 'high';
          break;
        case 'mediumPriority':
          matches = task.priority === 'medium';
          break;
        case 'lowPriority':
          matches = task.priority === 'low';
          break;
        case 'doing':
          matches = task.status === 'doing';
          break;
        case 'blocked':
          matches = task.status === 'blocked';
          break;
        case 'backlog':
          matches = task.status === 'backlog';
          break;
      }
    }

    if (matches) {
      if (isDone) {
        completed.push(task);
      } else {
        pending.push(task);
      }
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
    return {
      icon: 'Folder',
      iconColor: 'text-accent',
      labelColor: 'text-accent',
      emptyText: `No tasks in ${section.label}`,
    };
  }
  if (section.type === 'tag') {
    return {
      icon: 'Hash',
      iconColor: 'text-info-foreground',
      labelColor: 'text-info-foreground',
      emptyText: `No tasks tagged ${section.label}`,
    };
  }

  switch (section.id) {
    case 'overdue':
      return {
        icon: 'AlertTriangle',
        iconColor: 'text-destructive',
        labelColor: 'text-destructive',
        emptyText: 'No overdue tasks',
      };
    case 'highPriority':
      return {
        icon: 'Flag',
        iconColor: 'text-destructive',
        labelColor: 'text-destructive',
        emptyText: 'No high priority tasks',
      };
    case 'mediumPriority':
      return {
        icon: 'Flag',
        iconColor: 'text-warning-foreground',
        labelColor: 'text-warning-foreground',
        emptyText: 'No medium priority tasks',
      };
    case 'lowPriority':
      return {
        icon: 'Flag',
        iconColor: 'text-muted-foreground',
        labelColor: 'text-muted-foreground',
        emptyText: 'No low priority tasks',
      };
    case 'dueToday':
      return {
        icon: 'CheckSquare',
        iconColor: 'text-primary',
        labelColor: 'text-primary',
        emptyText: 'No tasks due today',
      };
    case 'dueThisWeek':
      return {
        icon: 'Calendar',
        iconColor: 'text-info-foreground',
        labelColor: 'text-info-foreground',
        emptyText: 'No tasks due this week',
      };
    case 'doing':
      return {
        icon: 'Clock',
        iconColor: 'text-info-foreground',
        labelColor: 'text-info-foreground',
        emptyText: 'No tasks in progress',
      };
    case 'blocked':
      return {
        icon: 'Pause',
        iconColor: 'text-destructive',
        labelColor: 'text-destructive',
        emptyText: 'No blocked tasks',
      };
    case 'backlog':
      return {
        icon: 'Archive',
        iconColor: 'text-muted-foreground',
        labelColor: 'text-muted-foreground',
        emptyText: 'No backlog tasks',
      };
    default:
      return { icon: 'CheckSquare', iconColor: 'text-primary', labelColor: 'text-primary', emptyText: 'No tasks' };
  }
}
