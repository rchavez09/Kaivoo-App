/**
 * useAppUpdater — Sprint 25 P11/P13
 *
 * Background update check on launch (silent, non-blocking).
 * Exposes update state for the UpdateNotification toast.
 *
 * Only active in Tauri desktop context.
 */

import { useState, useCallback, useEffect } from 'react';

const isTauri = (): boolean =>
  typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;

interface UpdateState {
  available: boolean;
  version: string | null;
  downloading: boolean;
  progress: number; // 0-100
  error: string | null;
}

const INITIAL_STATE: UpdateState = {
  available: false,
  version: null,
  downloading: false,
  progress: 0,
  error: null,
};

export function useAppUpdater() {
  const [state, setState] = useState<UpdateState>(INITIAL_STATE);

  const checkForUpdates = useCallback(async () => {
    if (!isTauri()) return;

    try {
      const { check } = await import('@tauri-apps/plugin-updater');
      const update = await check();

      if (update) {
        setState((s) => ({
          ...s,
          available: true,
          version: update.version,
        }));
      }
    } catch (e) {
      // Silent failure — don't bother the user
      console.warn('[updater] Check failed:', e);
    }
  }, []);

  const downloadAndInstall = useCallback(async () => {
    if (!isTauri()) return;

    setState((s) => ({ ...s, downloading: true, progress: 0, error: null }));

    try {
      const { check } = await import('@tauri-apps/plugin-updater');
      const { relaunch } = await import('@tauri-apps/plugin-process');

      const update = await check();
      if (!update) {
        setState((s) => ({ ...s, downloading: false, error: 'No update found' }));
        return;
      }

      let downloaded = 0;
      let contentLength = 0;

      await update.downloadAndInstall((event) => {
        if (event.event === 'Started' && event.data.contentLength) {
          contentLength = event.data.contentLength;
        } else if (event.event === 'Progress') {
          downloaded += event.data.chunkLength;
          const progress = contentLength > 0 ? Math.round((downloaded / contentLength) * 100) : 0;
          setState((s) => ({ ...s, progress }));
        } else if (event.event === 'Finished') {
          setState((s) => ({ ...s, progress: 100 }));
        }
      });

      // Relaunch after install
      await relaunch();
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Update failed';
      setState((s) => ({ ...s, downloading: false, error: message }));
    }
  }, []);

  // Auto-check on mount (silent background check)
  useEffect(() => {
    // Delay check slightly so the app loads first
    const timer = setTimeout(() => {
      void checkForUpdates();
    }, 5000);
    return () => clearTimeout(timer);
  }, [checkForUpdates]);

  return {
    ...state,
    checkForUpdates,
    downloadAndInstall,
  };
}
