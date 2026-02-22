/**
 * Generic hook for persisting widget settings in the backend (widget_settings table).
 * Falls back to localStorage for guests or while loading.
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

type Json = Record<string, unknown>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useWidgetSettings<T extends Record<string, any>>(
  widgetKey: string,
  defaultSettings: T
) {
  const { user } = useAuth();
  const [settings, setSettings] = useState<T>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const localStorageKey = `kaivoo-widget-${widgetKey}`;

  // Load settings on mount or when user changes
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);

      // If logged in, try backend first
      if (user) {
        // Cast to any because types.ts hasn't been regenerated yet
        const { data, error } = await (supabase as any)
          .from('widget_settings')
          .select('settings')
          .eq('user_id', user.id)
          .eq('widget_key', widgetKey)
          .maybeSingle();

        if (!cancelled) {
          if (data && !error) {
            // Merge with defaults in case new keys were added
            setSettings({ ...defaultSettings, ...(data.settings as T) });
          } else {
            // No backend row yet – seed from localStorage if available
            try {
              const local = localStorage.getItem(localStorageKey);
              if (local) {
                const parsed = JSON.parse(local) as T;
                setSettings({ ...defaultSettings, ...parsed });
              }
            } catch {}
          }
          setLoading(false);
        }
      } else {
        // Not logged in – use localStorage only
        try {
          const local = localStorage.getItem(localStorageKey);
          if (local) {
            const parsed = JSON.parse(local) as T;
            setSettings({ ...defaultSettings, ...parsed });
          }
        } catch {}
        if (!cancelled) setLoading(false);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, widgetKey]);

  // Persist settings (debounced)
  // Clean up debounced save on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, []);

  const persistSettings = useCallback(
    (newSettings: T) => {
      // Always write to localStorage for fast reads and offline guests
      localStorage.setItem(localStorageKey, JSON.stringify(newSettings));

      // Cancel pending save
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

      // Debounce backend upsert for authenticated users
      if (user) {
        saveTimeoutRef.current = setTimeout(async () => {
          // Cast to any because types.ts hasn't been regenerated yet
          const { error: upsertError } = await (supabase as any)
            .from('widget_settings')
            .upsert(
              {
                user_id: user.id,
                widget_key: widgetKey,
                settings: newSettings,
              },
              { onConflict: 'user_id,widget_key' }
            );
          if (upsertError) {
            console.error('Failed to persist widget settings:', upsertError);
          }
        }, 400);
      }
    },
    [user, widgetKey, localStorageKey]
  );

  const updateSettings = useCallback(
    (partial: Partial<T>) => {
      setSettings((prev) => {
        const updated = { ...prev, ...partial } as T;
        persistSettings(updated);
        return updated;
      });
    },
    [persistSettings]
  );

  const replaceSettings = useCallback(
    (full: T) => {
      setSettings(full);
      persistSettings(full);
    },
    [persistSettings]
  );

  return { settings, loading, updateSettings, replaceSettings };
}
