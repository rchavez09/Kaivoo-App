import React from 'react';
import { PenLine, Zap, Pause, CheckCircle2, Archive } from 'lucide-react';
import { ProjectStatus } from '@/types';

export const projectStatusConfig: Record<ProjectStatus, {
  label: string;
  icon: React.ReactNode;
  color: string;
  bg: string;
  order: number;
}> = {
  planning:  { label: 'Planning',  icon: <PenLine className="w-3.5 h-3.5" />,      color: 'text-muted-foreground', bg: 'bg-muted/50',       order: 0 },
  active:    { label: 'Active',    icon: <Zap className="w-3.5 h-3.5" />,           color: 'text-info',             bg: 'bg-info/10',        order: 1 },
  paused:    { label: 'Paused',    icon: <Pause className="w-3.5 h-3.5" />,         color: 'text-warning',          bg: 'bg-warning/10',     order: 2 },
  completed: { label: 'Done',      icon: <CheckCircle2 className="w-3.5 h-3.5" />,  color: 'text-success',          bg: 'bg-success/10',     order: 3 },
  archived:  { label: 'Archived',  icon: <Archive className="w-3.5 h-3.5" />,       color: 'text-muted-foreground', bg: 'bg-muted/30',       order: 4 },
};

// Default project color palette (12 colors, visually distinct for timeline bars)
export const PROJECT_COLORS = [
  '#3B82F6', // blue
  '#8B5CF6', // purple
  '#EC4899', // pink
  '#EF4444', // red
  '#F97316', // orange
  '#F59E0B', // amber
  '#22C55E', // green
  '#14B8A6', // teal
  '#06B6D4', // cyan
  '#6366F1', // indigo
  '#D946EF', // fuchsia
  '#78716C', // stone
];

// Friendly names for screen readers
export const PROJECT_COLOR_NAMES: Record<string, string> = {
  '#3B82F6': 'Blue',
  '#8B5CF6': 'Purple',
  '#EC4899': 'Pink',
  '#EF4444': 'Red',
  '#F97316': 'Orange',
  '#F59E0B': 'Amber',
  '#22C55E': 'Green',
  '#14B8A6': 'Teal',
  '#06B6D4': 'Cyan',
  '#6366F1': 'Indigo',
  '#D946EF': 'Fuchsia',
  '#78716C': 'Stone',
};

// Auto-assign color based on index (for projects without explicit color)
export const getProjectColor = (project: { color?: string }, index: number): string => {
  return project.color || PROJECT_COLORS[index % PROJECT_COLORS.length];
};

// Returns white or dark text depending on background luminance (WCAG contrast)
export const getContrastTextColor = (bgHex: string): string => {
  const r = parseInt(bgHex.slice(1, 3), 16);
  const g = parseInt(bgHex.slice(3, 5), 16);
  const b = parseInt(bgHex.slice(5, 7), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? '#0A1628' : '#FFFFFF';
};
