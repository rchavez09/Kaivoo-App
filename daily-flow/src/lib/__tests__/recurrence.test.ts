import { describe, it, expect } from 'vitest';
import { computeNextDueDate } from '@/lib/recurrence';

describe('computeNextDueDate', () => {
  // --- Daily ---
  it('daily: adds 1 day to a valid date', () => {
    expect(computeNextDueDate('2026-03-01', { type: 'daily', interval: 1 })).toBe('2026-03-02');
  });

  it('daily: handles month rollover', () => {
    expect(computeNextDueDate('2026-01-31', { type: 'daily', interval: 1 })).toBe('2026-02-01');
  });

  it('daily: handles year rollover', () => {
    expect(computeNextDueDate('2025-12-31', { type: 'daily', interval: 1 })).toBe('2026-01-01');
  });

  it('daily: supports interval > 1', () => {
    expect(computeNextDueDate('2026-03-01', { type: 'daily', interval: 3 })).toBe('2026-03-04');
  });

  // --- Weekly ---
  it('weekly: adds 1 week', () => {
    expect(computeNextDueDate('2026-03-01', { type: 'weekly', interval: 1 })).toBe('2026-03-08');
  });

  it('weekly: handles month rollover', () => {
    expect(computeNextDueDate('2026-03-29', { type: 'weekly', interval: 1 })).toBe('2026-04-05');
  });

  it('weekly: supports interval > 1', () => {
    expect(computeNextDueDate('2026-03-01', { type: 'weekly', interval: 2 })).toBe('2026-03-15');
  });

  // --- Monthly ---
  it('monthly: adds 1 month', () => {
    expect(computeNextDueDate('2026-03-15', { type: 'monthly', interval: 1 })).toBe('2026-04-15');
  });

  it('monthly: handles month-end overflow (Jan 31 → Feb 28)', () => {
    const result = computeNextDueDate('2026-01-31', { type: 'monthly', interval: 1 });
    expect(result).toBe('2026-02-28');
  });

  it('monthly: handles year rollover', () => {
    expect(computeNextDueDate('2025-12-15', { type: 'monthly', interval: 1 })).toBe('2026-01-15');
  });

  it('monthly: supports interval > 1', () => {
    expect(computeNextDueDate('2026-01-01', { type: 'monthly', interval: 3 })).toBe('2026-04-01');
  });

  // --- Edge cases ---
  it('uses current date when dueDate is undefined', () => {
    const result = computeNextDueDate(undefined, { type: 'daily', interval: 1 });
    // Result should be a valid date string
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('uses current date when dueDate is unparseable', () => {
    const result = computeNextDueDate('not-a-date', { type: 'daily', interval: 1 });
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('defaults interval to 1 when 0', () => {
    // interval of 0 should fall back to 1
    expect(computeNextDueDate('2026-03-01', { type: 'daily', interval: 0 })).toBe('2026-03-02');
  });

  it('handles human-readable date format (MMM d, yyyy)', () => {
    const result = computeNextDueDate('Mar 1, 2026', { type: 'daily', interval: 1 });
    expect(result).toBe('2026-03-02');
  });
});
