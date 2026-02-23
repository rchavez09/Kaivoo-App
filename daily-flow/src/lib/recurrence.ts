import { RecurrenceRule } from '@/types';
import { format, addDays, addWeeks, addMonths } from 'date-fns';

/** Parse a date string in local time (avoids UTC midnight shift with yyyy-MM-dd) */
const parseDateLocal = (dateStr: string): Date => {
  // Handle yyyy-MM-dd format explicitly in local time
  const isoMatch = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) {
    return new Date(parseInt(isoMatch[1]), parseInt(isoMatch[2]) - 1, parseInt(isoMatch[3]));
  }
  // Fall back to Date constructor for other formats (e.g., 'Mar 1, 2026')
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? new Date() : d;
};

/** Compute next due date based on recurrence rule */
export const computeNextDueDate = (currentDueDate: string | undefined, rule: RecurrenceRule): string => {
  const base = currentDueDate ? parseDateLocal(currentDueDate) : new Date();
  const interval = rule.interval || 1;
  let next: Date;
  switch (rule.type) {
    case 'daily':
      next = addDays(base, interval);
      break;
    case 'weekly':
      next = addWeeks(base, interval);
      break;
    case 'monthly':
      next = addMonths(base, interval);
      break;
    default:
      next = addDays(base, 1);
  }
  return format(next, 'yyyy-MM-dd');
};
