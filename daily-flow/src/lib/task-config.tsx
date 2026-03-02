import React from 'react';
import { Archive, Circle, Clock, Pause, CheckCircle2 } from 'lucide-react';
import { TaskStatus, TaskPriority } from '@/types';

export const statusConfig: Record<
  TaskStatus,
  { label: string; icon: React.ReactNode; color: string; bg: string; bgHeader: string; order: number }
> = {
  backlog: {
    label: 'Backlog',
    icon: <Archive className="h-3.5 w-3.5" />,
    color: 'text-muted-foreground',
    bg: 'bg-muted/50',
    bgHeader: 'bg-muted/30',
    order: 3,
  },
  todo: {
    label: 'To Do',
    icon: <Circle className="h-3.5 w-3.5" />,
    color: 'text-foreground',
    bg: 'bg-secondary',
    bgHeader: 'bg-secondary/50',
    order: 1,
  },
  doing: {
    label: 'Doing',
    icon: <Clock className="h-3.5 w-3.5" />,
    color: 'text-info-foreground',
    bg: 'bg-info/10',
    bgHeader: 'bg-info/10',
    order: 0,
  },
  blocked: {
    label: 'Blocked',
    icon: <Pause className="h-3.5 w-3.5" />,
    color: 'text-destructive',
    bg: 'bg-destructive/10',
    bgHeader: 'bg-destructive/10',
    order: 2,
  },
  done: {
    label: 'Done',
    icon: <CheckCircle2 className="h-3.5 w-3.5" />,
    color: 'text-success-foreground',
    bg: 'bg-success/10',
    bgHeader: 'bg-success/10',
    order: 4,
  },
};

export const priorityConfig: Record<TaskPriority, { label: string; color: string; bg: string; order: number }> = {
  high: { label: 'High', color: 'text-destructive', bg: 'bg-destructive/10', order: 0 },
  medium: { label: 'Medium', color: 'text-primary', bg: 'bg-primary/10', order: 1 },
  low: { label: 'Low', color: 'text-info-foreground', bg: 'bg-info/10', order: 2 },
};

export const statusOrder: Record<TaskStatus, number> = {
  doing: 0,
  todo: 1,
  blocked: 2,
  backlog: 3,
  done: 4,
};
