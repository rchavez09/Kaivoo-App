/**
 * Adapter Provider — Sprint 20 P6/P8
 *
 * React context that provides the active adapter set to the entire app.
 * Runtime detection determines which backend to use:
 *  - Tauri (desktop): LocalDataAdapter + LocalAuthAdapter + LocalSearchAdapter
 *  - Browser (web): SupabaseDataAdapter + SupabaseAuthAdapter + SupabaseSearchAdapter
 */

import { createContext, useContext, useEffect, useMemo, useRef, useState, ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { SupabaseDataAdapter, SupabaseAuthAdapter, SupabaseSearchAdapter } from './supabase';
import type { DataAdapter, AuthAdapter, SearchAdapter } from './types';

// Runtime detection: are we inside the Tauri desktop shell?
const isTauri = (): boolean => typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;

interface AdapterContextValue {
  data: DataAdapter | null;
  auth: AuthAdapter;
  search: SearchAdapter;
  isLocal: boolean;
}

const AdapterContext = createContext<AdapterContextValue | undefined>(undefined);

interface LocalAdapters {
  data: DataAdapter;
  auth: AuthAdapter;
  search: SearchAdapter;
}

export const AdapterProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const isLocal = isTauri();
  const [localAdapters, setLocalAdapters] = useState<LocalAdapters | null>(null);
  const [initError, setInitError] = useState<string | null>(null);
  const initRef = useRef(false);
  const dataAdapterRef = useRef<DataAdapter | null>(null);

  // Initialize local adapters asynchronously when in Tauri mode
  useEffect(() => {
    if (!isLocal || initRef.current) return;
    initRef.current = true;

    (async () => {
      try {
        const { LocalDataAdapter, LocalAuthAdapter, LocalSearchAdapter } = await import('./local');
        const data = await LocalDataAdapter.create();
        dataAdapterRef.current = data;
        const auth = await LocalAuthAdapter.create(data.database);
        const search = new LocalSearchAdapter(data.database);
        await search.rebuildIndex();
        setLocalAdapters({ data, auth, search });
      } catch (e) {
        console.error('[AdapterProvider] Failed to initialize LocalAdapter:', e);
        setInitError(e instanceof Error ? e.message : 'Local database initialization failed');
      }
    })();

    return () => {
      // Cleanup on unmount — use ref to avoid stale closure
      void dataAdapterRef.current?.dispose();
    };
  }, [isLocal]);

  const value = useMemo<AdapterContextValue>(() => {
    if (isLocal && localAdapters) {
      // Desktop mode: use local adapters (already initialized via dynamic import)
      return {
        data: localAdapters.data,
        auth: localAdapters.auth,
        search: localAdapters.search,
        isLocal: true,
      };
    }

    // Web mode: use Supabase adapters
    const auth = new SupabaseAuthAdapter();
    const search = new SupabaseSearchAdapter();
    const data = user ? new SupabaseDataAdapter(user.id) : null;
    return { data, auth, search, isLocal: false };
  }, [isLocal, localAdapters, user?.id]);

  // Desktop mode: show error screen if local database init failed
  if (isLocal && initError) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', fontFamily: 'system-ui' }}>
        <h2>Failed to initialize local database</h2>
        <p style={{ color: '#888' }}>{initError}</p>
        <button
          onClick={() => {
            setInitError(null);
            initRef.current = false;
          }}
          style={{ marginTop: '1rem', padding: '0.5rem 1rem', cursor: 'pointer' }}
        >
          Retry
        </button>
      </div>
    );
  }

  return <AdapterContext.Provider value={value}>{children}</AdapterContext.Provider>;
};

/**
 * Access the adapter set. Returns null for data adapter when not authenticated
 * (web) or not yet initialized (desktop).
 */
export const useAdapters = (): AdapterContextValue => {
  const context = useContext(AdapterContext);
  if (context === undefined) {
    throw new Error('useAdapters must be used within an AdapterProvider');
  }
  return context;
};

/**
 * Access the data adapter. Throws if not available.
 */
export const useDataAdapter = (): DataAdapter => {
  const { data } = useAdapters();
  if (!data) {
    throw new Error('useDataAdapter requires an initialized adapter');
  }
  return data;
};
