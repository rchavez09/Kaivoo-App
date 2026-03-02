import { useState, useCallback } from 'react';

/**
 * Hook for persisting state in localStorage with automatic JSON serialization.
 * Replaces the scattered try/catch localStorage patterns across the codebase.
 */
export function useLocalStorage<T>(key: string, defaultValue: T): [T, (value: T | ((prev: T) => T)) => void] {
  const [state, setState] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(key);
      if (stored !== null) return JSON.parse(stored) as T;
    } catch {
      /* localStorage unavailable */
    }
    return defaultValue;
  });

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      setState((prev) => {
        const next = value instanceof Function ? value(prev) : value;
        try {
          localStorage.setItem(key, JSON.stringify(next));
        } catch {
          /* localStorage unavailable */
        }
        return next;
      });
    },
    [key],
  );

  return [state, setValue];
}
