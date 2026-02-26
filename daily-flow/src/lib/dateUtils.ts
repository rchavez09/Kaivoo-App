/**
 * Centralized date utilities for consistent parsing, formatting, and comparison
 * across the entire application.
 */

import { 
  format, 
  parseISO, 
  isValid, 
  isSameDay, 
  isToday as fnsIsToday, 
  isTomorrow as fnsIsTomorrow,
  isPast,
  isFuture,
  startOfDay,
  endOfDay,
  addDays,
  differenceInDays,
  isWithinInterval,
  startOfWeek,
  endOfWeek
} from 'date-fns';

// ============================================
// PARSING: Convert various formats to Date
// ============================================

/**
 * Parse a date string that could be:
 * - ISO format (yyyy-MM-dd or full ISO)
 * - Relative ("Today", "Tomorrow")
 * - Human readable ("Jan 25, 2026")
 * - Date object
 */
export function parseDate(input: string | Date | undefined | null): Date | null {
  if (!input) return null;
  if (input instanceof Date) return isValid(input) ? input : null;
  
  const str = input.trim();
  
  // Handle relative dates
  const today = startOfDay(new Date());
  if (str.toLowerCase() === 'today') return today;
  if (str.toLowerCase() === 'tomorrow') return addDays(today, 1);
  
  // Try ISO format first (most reliable)
  if (/^\d{4}-\d{2}-\d{2}/.test(str)) {
    const parsed = parseISO(str);
    if (isValid(parsed)) return parsed;
  }
  
  // Try general Date parsing (handles "Jan 25, 2026" etc.)
  const generalParsed = new Date(str);
  if (isValid(generalParsed)) return generalParsed;
  
  return null;
}

/**
 * Strictly parse ISO date string (yyyy-MM-dd)
 */
export function parseISODate(input: string | undefined | null): Date | null {
  if (!input) return null;
  const parsed = parseISO(input);
  return isValid(parsed) ? parsed : null;
}

// ============================================
// FORMATTING: Convert Date to string
// ============================================

/**
 * Format for display in UI - human readable
 * e.g., "Jan 25, 2026"
 */
export function formatDisplayDate(date: Date | string | undefined | null): string {
  const parsed = parseDate(date);
  if (!parsed) return '';
  return format(parsed, 'MMM d, yyyy');
}

/**
 * Format for compact display
 * e.g., "Jan 25"
 */
export function formatShortDate(date: Date | string | undefined | null): string {
  const parsed = parseDate(date);
  if (!parsed) return '';
  return format(parsed, 'MMM d');
}

/**
 * Format for database storage (ISO)
 * e.g., "2026-01-25"
 */
export function formatStorageDate(date: Date | string | undefined | null): string {
  const parsed = parseDate(date);
  if (!parsed) return '';
  return format(parsed, 'yyyy-MM-dd');
}

/**
 * Format time for display
 * e.g., "3:30 PM"
 */
export function formatTime(date: Date | string | undefined | null): string {
  const parsed = parseDate(date);
  if (!parsed) return '';
  return format(parsed, 'h:mm a');
}

/**
 * Format date with weekday
 * e.g., "Saturday, January 25, 2026"
 */
export function formatFullDate(date: Date | string | undefined | null): string {
  const parsed = parseDate(date);
  if (!parsed) return '';
  return format(parsed, 'EEEE, MMMM d, yyyy');
}

/**
 * Get relative date label for task due dates
 * Returns "Today", "Tomorrow", "Overdue", or formatted date
 */
export function getRelativeDateLabel(date: Date | string | undefined | null): string {
  const parsed = parseDate(date);
  if (!parsed) return '';
  
  const today = startOfDay(new Date());
  const targetDay = startOfDay(parsed);
  const diffDays = differenceInDays(targetDay, today);
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays === -1) return 'Yesterday';
  if (diffDays < -1) return `${Math.abs(diffDays)} days ago`;
  if (diffDays <= 7) return format(parsed, 'EEEE'); // "Monday", "Tuesday", etc.
  
  return formatShortDate(parsed);
}

// ============================================
// COMPARISON: Date checks and comparisons
// ============================================

/**
 * Check if a date is today
 */
export function isToday(date: Date | string | undefined | null): boolean {
  const parsed = parseDate(date);
  return parsed ? fnsIsToday(parsed) : false;
}

/**
 * Check if a date is tomorrow
 */
export function isTomorrow(date: Date | string | undefined | null): boolean {
  const parsed = parseDate(date);
  return parsed ? fnsIsTomorrow(parsed) : false;
}

/**
 * Check if a date is in the past (before today)
 */
export function isOverdue(date: Date | string | undefined | null): boolean {
  const parsed = parseDate(date);
  if (!parsed) return false;
  
  // Compare start of days to ignore time component
  return startOfDay(parsed) < startOfDay(new Date());
}

/**
 * Check if a date is within the current week
 */
export function isThisWeek(date: Date | string | undefined | null): boolean {
  const parsed = parseDate(date);
  if (!parsed) return false;
  
  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 0 }); // Sunday
  const weekEnd = endOfWeek(today, { weekStartsOn: 0 });
  
  return isWithinInterval(startOfDay(parsed), { start: weekStart, end: weekEnd });
}

/**
 * Check if a date is due today or overdue
 */
export function isDueSoon(date: Date | string | undefined | null): boolean {
  return isToday(date) || isOverdue(date);
}

/**
 * Check if two dates are the same day
 */
export function isSameDayAs(date1: Date | string | undefined | null, date2: Date | string | undefined | null): boolean {
  const parsed1 = parseDate(date1);
  const parsed2 = parseDate(date2);
  if (!parsed1 || !parsed2) return false;
  return isSameDay(parsed1, parsed2);
}

/**
 * Check if a due date matches a target date
 * Handles relative dates like "Today", "Tomorrow"
 */
export function isDueDateMatch(dueDate: string | undefined, targetDate: Date): boolean {
  if (!dueDate) return false;
  
  const parsed = parseDate(dueDate);
  if (!parsed) return false;
  
  return isSameDay(startOfDay(parsed), startOfDay(targetDate));
}

// ============================================
// UTILITIES
// ============================================

/**
 * Get today's date formatted for storage
 */
export function getTodayStorageDate(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

/**
 * Get the current ISO timestamp for database
 */
export function getCurrentTimestamp(): string {
  return new Date().toISOString();
}

/**
 * Calculate duration between two dates/times in minutes
 */
export function getDurationMinutes(start: Date | string, end: Date | string): number {
  const startParsed = parseDate(start);
  const endParsed = parseDate(end);
  if (!startParsed || !endParsed) return 0;
  
  return Math.round((endParsed.getTime() - startParsed.getTime()) / (1000 * 60));
}

/**
 * Format duration in human-readable format
 * e.g., "1h 30m" or "45m"
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

// ============================================
// TASK DATE RESOLUTION
// ============================================

const RELATIVE_DATES = new Set(['today', 'tomorrow']);

/**
 * Resolve which calendar day a task belongs on.
 * Relative dueDates ("Today"/"Tomorrow") always resolve to the current day,
 * so completed tasks with relative dueDates use completedAt instead.
 */
export function resolveTaskDay(task: { dueDate?: string; status: string; completedAt?: Date }): Date | null {
  if (!task.dueDate) return null;
  const isRelative = RELATIVE_DATES.has(task.dueDate.trim().toLowerCase());

  if (isRelative && task.status === 'done' && task.completedAt) {
    return startOfDay(new Date(task.completedAt));
  }

  const parsed = parseDate(task.dueDate);
  return parsed ? startOfDay(parsed) : null;
}
