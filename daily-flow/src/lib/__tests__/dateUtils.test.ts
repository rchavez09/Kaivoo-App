import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  parseDate,
  parseISODate,
  formatStorageDate,
  formatDisplayDate,
  formatShortDate,
  formatTime,
  formatDuration,
  getDurationMinutes,
  getRelativeDateLabel,
  isToday,
  isTomorrow,
  isOverdue,
  isDueSoon,
  isSameDayAs,
  isDueDateMatch,
  isThisWeek,
} from '../dateUtils';

// Pin "now" to 2026-02-22T12:00:00Z for deterministic tests
const FIXED_NOW = new Date('2026-02-22T12:00:00Z');

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(FIXED_NOW);
});

afterEach(() => {
  vi.useRealTimers();
});

// ─── Parsing ───────────────────────────────────────

describe('parseDate', () => {
  it('parses ISO date strings', () => {
    const result = parseDate('2026-02-22');
    expect(result).toBeInstanceOf(Date);
    expect(result!.getFullYear()).toBe(2026);
  });

  it('parses "Today" (case-insensitive)', () => {
    const result = parseDate('today');
    expect(result).toBeInstanceOf(Date);
    expect(result!.toISOString().startsWith('2026-02-22')).toBe(true);
  });

  it('parses "Tomorrow"', () => {
    const result = parseDate('Tomorrow');
    expect(result).toBeInstanceOf(Date);
    expect(result!.toISOString().startsWith('2026-02-23')).toBe(true);
  });

  it('handles Date objects', () => {
    const d = new Date('2026-01-15T10:00:00Z');
    expect(parseDate(d)).toBe(d);
  });

  it('returns null for undefined/null/empty', () => {
    expect(parseDate(undefined)).toBeNull();
    expect(parseDate(null)).toBeNull();
    expect(parseDate('')).toBeNull();
  });

  it('returns null for invalid strings', () => {
    expect(parseDate('not-a-date-at-all-xyz')).toBeNull();
  });
});

describe('parseISODate', () => {
  it('parses strict ISO strings', () => {
    const result = parseISODate('2026-03-15');
    expect(result).toBeInstanceOf(Date);
    expect(result!.getFullYear()).toBe(2026);
    expect(result!.getMonth()).toBe(2); // March = 2
  });

  it('returns null for non-ISO', () => {
    expect(parseISODate(undefined)).toBeNull();
    expect(parseISODate(null)).toBeNull();
  });
});

// ─── Formatting ────────────────────────────────────

describe('formatStorageDate', () => {
  it('formats Date to yyyy-MM-dd', () => {
    expect(formatStorageDate(new Date('2026-02-22T15:00:00Z'))).toBe('2026-02-22');
  });

  it('handles "Today"', () => {
    expect(formatStorageDate('Today')).toBe('2026-02-22');
  });

  it('returns empty for null', () => {
    expect(formatStorageDate(null)).toBe('');
  });
});

describe('formatDisplayDate', () => {
  it('formats to "MMM d, yyyy"', () => {
    expect(formatDisplayDate('2026-01-05')).toBe('Jan 5, 2026');
  });
});

describe('formatShortDate', () => {
  it('formats to "MMM d"', () => {
    expect(formatShortDate('2026-03-15')).toBe('Mar 15');
  });
});

describe('formatTime', () => {
  it('formats to "h:mm a"', () => {
    const result = formatTime(new Date('2026-02-22T15:30:00'));
    expect(result).toMatch(/3:30 PM/);
  });
});

describe('formatDuration', () => {
  it('formats minutes only', () => {
    expect(formatDuration(45)).toBe('45m');
  });

  it('formats hours and minutes', () => {
    expect(formatDuration(90)).toBe('1h 30m');
  });

  it('formats exact hours', () => {
    expect(formatDuration(120)).toBe('2h');
  });
});

describe('getDurationMinutes', () => {
  it('calculates correct duration', () => {
    const start = new Date('2026-02-22T10:00:00');
    const end = new Date('2026-02-22T11:30:00');
    expect(getDurationMinutes(start, end)).toBe(90);
  });

  it('returns 0 for invalid inputs', () => {
    expect(getDurationMinutes('invalid', 'also-invalid')).toBe(0);
  });
});

// ─── Relative labels ───────────────────────────────

describe('getRelativeDateLabel', () => {
  it('returns "Today"', () => {
    expect(getRelativeDateLabel('2026-02-22')).toBe('Today');
  });

  it('returns "Tomorrow"', () => {
    expect(getRelativeDateLabel('2026-02-23')).toBe('Tomorrow');
  });

  it('returns "Yesterday"', () => {
    expect(getRelativeDateLabel('2026-02-21')).toBe('Yesterday');
  });

  it('returns "N days ago"', () => {
    expect(getRelativeDateLabel('2026-02-19')).toBe('3 days ago');
  });

  it('returns weekday name for within 7 days', () => {
    // 2026-02-25 is a Wednesday (3 days from now, which is Sunday Feb 22)
    const label = getRelativeDateLabel('2026-02-25');
    expect(label).toBe('Wednesday');
  });

  it('returns empty for null', () => {
    expect(getRelativeDateLabel(null)).toBe('');
  });
});

// ─── Comparisons ───────────────────────────────────

describe('isToday', () => {
  it('returns true for today', () => {
    expect(isToday('2026-02-22')).toBe(true);
    expect(isToday('Today')).toBe(true);
  });

  it('returns false for other dates', () => {
    expect(isToday('2026-02-21')).toBe(false);
  });

  it('returns false for null', () => {
    expect(isToday(null)).toBe(false);
  });
});

describe('isTomorrow', () => {
  it('returns true for tomorrow', () => {
    expect(isTomorrow('2026-02-23')).toBe(true);
    expect(isTomorrow('Tomorrow')).toBe(true);
  });
});

describe('isOverdue', () => {
  it('returns true for past dates', () => {
    expect(isOverdue('2026-02-20')).toBe(true);
  });

  it('returns false for today', () => {
    expect(isOverdue('2026-02-22')).toBe(false);
  });

  it('returns false for future', () => {
    expect(isOverdue('2026-02-25')).toBe(false);
  });

  it('returns false for null', () => {
    expect(isOverdue(null)).toBe(false);
  });
});

describe('isDueSoon', () => {
  it('returns true for today or overdue', () => {
    expect(isDueSoon('2026-02-22')).toBe(true);
    expect(isDueSoon('2026-02-20')).toBe(true);
  });

  it('returns false for future dates', () => {
    expect(isDueSoon('2026-02-25')).toBe(false);
  });
});

describe('isSameDayAs', () => {
  it('matches same day', () => {
    expect(isSameDayAs('2026-02-22', new Date('2026-02-22T18:00:00'))).toBe(true);
  });

  it('does not match different days', () => {
    expect(isSameDayAs('2026-02-22', '2026-02-23')).toBe(false);
  });

  it('returns false for null inputs', () => {
    expect(isSameDayAs(null, '2026-02-22')).toBe(false);
  });
});

describe('isDueDateMatch', () => {
  it('matches "Today" to current date', () => {
    expect(isDueDateMatch('Today', FIXED_NOW)).toBe(true);
  });

  it('matches ISO date to same day', () => {
    expect(isDueDateMatch('2026-02-22', FIXED_NOW)).toBe(true);
  });

  it('does not match different day', () => {
    expect(isDueDateMatch('2026-02-23', FIXED_NOW)).toBe(false);
  });
});

describe('isThisWeek', () => {
  it('returns true for dates in the current week', () => {
    // Feb 22 2026 is a Sunday. Week (Sun-Sat) = Feb 22 - Feb 28
    expect(isThisWeek('2026-02-25')).toBe(true);
  });

  it('returns false for dates outside the week', () => {
    expect(isThisWeek('2026-03-05')).toBe(false);
  });
});
