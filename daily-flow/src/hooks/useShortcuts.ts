import { useCallback, useMemo } from 'react';
import { useLocalStorage } from './useLocalStorage';

/* ── Types ─────────────────────────────────────────────────── */

export interface ShortcutDefinition {
  id: string;
  label: string;
  description: string;
  category: string;
  defaultBinding: KeyBinding;
}

export interface KeyBinding {
  mac: string; // e.g. "⌘+K", "⌥+N"
  pc: string; // e.g. "Ctrl+K", "Alt+N"
}

type CustomBindings = Record<string, KeyBinding>;

/* ── Platform detection ────────────────────────────────────── */

export const IS_MAC = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.userAgent);

/* ── Default shortcut registry ─────────────────────────────── */

export const DEFAULT_SHORTCUTS: ShortcutDefinition[] = [
  {
    id: 'global-search',
    label: 'Global Search',
    description: 'Open the search palette',
    category: 'Global',
    defaultBinding: { mac: '⌘+K', pc: 'Ctrl+K' },
  },
  {
    id: 'quick-note',
    label: 'Quick Note',
    description: 'Open the quick note dialog',
    category: 'Global',
    defaultBinding: { mac: '⌥+N', pc: 'Alt+N' },
  },
];

/* ── Reserved browser shortcuts (cannot be overridden) ────── */

const RESERVED_MAC = new Set([
  '⌘+T',
  '⌘+W',
  '⌘+N',
  '⌘+Q',
  '⌘+P',
  '⌘+S',
  '⌘+F',
  '⌘+L',
  '⌘+D',
  '⌘+H',
  '⌘+R',
  '⌘+J',
  '⌘+G',
  '⌘+,',
  '⌘+⇧+T',
  '⌘+⇧+N',
  '⌘+⇧+P',
  '⌘+⇧+J',
  '⌘+⌥+I',
  '⌘+⌥+J',
  '⌘+⌥+C',
]);

const RESERVED_PC = new Set([
  'Ctrl+T',
  'Ctrl+W',
  'Ctrl+N',
  'Ctrl+Q',
  'Ctrl+P',
  'Ctrl+S',
  'Ctrl+F',
  'Ctrl+L',
  'Ctrl+D',
  'Ctrl+H',
  'Ctrl+R',
  'Ctrl+J',
  'Ctrl+G',
  'Ctrl+Shift+T',
  'Ctrl+Shift+N',
  'Ctrl+Shift+P',
  'Ctrl+Shift+J',
  'Ctrl+Shift+I',
  'Ctrl+Shift+C',
  'F1',
  'F3',
  'F5',
  'F6',
  'F7',
  'F11',
  'F12',
]);

export function isReservedShortcut(binding: string): boolean {
  return IS_MAC ? RESERVED_MAC.has(binding) : RESERVED_PC.has(binding);
}

/* ── Convert a KeyboardEvent to our binding string format ──── */

export function eventToBinding(e: KeyboardEvent | React.KeyboardEvent): string {
  const parts: string[] = [];

  if (IS_MAC) {
    if (e.ctrlKey) parts.push('⌃');
    if (e.altKey) parts.push('⌥');
    if (e.shiftKey) parts.push('⇧');
    if (e.metaKey) parts.push('⌘');
  } else {
    if (e.ctrlKey) parts.push('Ctrl');
    if (e.altKey) parts.push('Alt');
    if (e.shiftKey) parts.push('Shift');
    if (e.metaKey) parts.push('Win');
  }

  // Map the actual key (ignore pure modifier presses)
  const key = e.key;
  if (['Control', 'Alt', 'Shift', 'Meta'].includes(key)) return '';

  // Normalise the key name
  const keyName = e.code.startsWith('Key')
    ? e.code.slice(3) // KeyK → K
    : e.code.startsWith('Digit')
      ? e.code.slice(5) // Digit1 → 1
      : key.length === 1
        ? key.toUpperCase()
        : key; // Enter, Space, etc.

  parts.push(keyName);
  return parts.join('+');
}

/* ── Parse a binding string back to modifier flags + key ──── */

interface ParsedBinding {
  meta: boolean;
  ctrl: boolean;
  alt: boolean;
  shift: boolean;
  key: string; // uppercase letter or key name
}

function parseBinding(binding: string): ParsedBinding {
  const parts = binding.split('+');
  const key = parts[parts.length - 1];
  const modifiers = new Set(parts.slice(0, -1));

  return {
    meta: modifiers.has('⌘') || modifiers.has('Win'),
    ctrl: modifiers.has('Ctrl') || modifiers.has('⌃'),
    alt: modifiers.has('Alt') || modifiers.has('⌥'),
    shift: modifiers.has('Shift') || modifiers.has('⇧'),
    key,
  };
}

/* ── Match a KeyboardEvent against a binding string ────────── */

function eventMatchesBinding(e: KeyboardEvent, binding: string): boolean {
  const parsed = parseBinding(binding);

  if (e.metaKey !== parsed.meta) return false;
  if (e.ctrlKey !== parsed.ctrl) return false;
  if (e.altKey !== parsed.alt) return false;
  if (e.shiftKey !== parsed.shift) return false;

  // Check key — compare against code-based name
  const eventKey = e.code.startsWith('Key')
    ? e.code.slice(3)
    : e.code.startsWith('Digit')
      ? e.code.slice(5)
      : e.key.length === 1
        ? e.key.toUpperCase()
        : e.key;

  return eventKey === parsed.key;
}

/* ── Hook ──────────────────────────────────────────────────── */

const STORAGE_KEY = 'kaivoo-keyboard-shortcuts';

export function useShortcuts() {
  const [customBindings, setCustomBindings] = useLocalStorage<CustomBindings>(STORAGE_KEY, {});

  const getBinding = useCallback(
    (id: string): KeyBinding => {
      if (customBindings[id]) return customBindings[id];
      const def = DEFAULT_SHORTCUTS.find((s) => s.id === id);
      return def?.defaultBinding ?? { mac: '', pc: '' };
    },
    [customBindings],
  );

  const getDisplayBinding = useCallback(
    (id: string): string => {
      const binding = getBinding(id);
      return IS_MAC ? binding.mac : binding.pc;
    },
    [getBinding],
  );

  const setBinding = useCallback(
    (id: string, binding: KeyBinding) => {
      setCustomBindings((prev) => ({ ...prev, [id]: binding }));
    },
    [setCustomBindings],
  );

  const resetBinding = useCallback(
    (id: string) => {
      setCustomBindings((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    },
    [setCustomBindings],
  );

  const resetAll = useCallback(() => {
    setCustomBindings({});
  }, [setCustomBindings]);

  const isCustomized = useCallback((id: string): boolean => id in customBindings, [customBindings]);

  const matchesShortcut = useCallback(
    (id: string, e: KeyboardEvent): boolean => {
      const binding = getBinding(id);
      const platformBinding = IS_MAC ? binding.mac : binding.pc;
      if (!platformBinding) return false;
      return eventMatchesBinding(e, platformBinding);
    },
    [getBinding],
  );

  /** Check if a binding string conflicts with another shortcut (returns the conflicting shortcut label, or null). */
  const findConflict = useCallback(
    (candidateBinding: string, excludeId: string): string | null => {
      for (const def of DEFAULT_SHORTCUTS) {
        if (def.id === excludeId) continue;
        const current = customBindings[def.id]
          ? IS_MAC
            ? customBindings[def.id].mac
            : customBindings[def.id].pc
          : IS_MAC
            ? def.defaultBinding.mac
            : def.defaultBinding.pc;
        if (current === candidateBinding) return def.label;
      }
      return null;
    },
    [customBindings],
  );

  const shortcuts = useMemo(
    () =>
      DEFAULT_SHORTCUTS.map((def) => ({
        ...def,
        currentBinding: customBindings[def.id] ?? def.defaultBinding,
        isCustomized: def.id in customBindings,
      })),
    [customBindings],
  );

  return {
    shortcuts,
    getBinding,
    getDisplayBinding,
    setBinding,
    resetBinding,
    resetAll,
    isCustomized,
    matchesShortcut,
    findConflict,
  };
}
