import { useEffect } from 'react';
import { useKaivooQueries } from '@/hooks/queries';
import { loadPersistedApiKey } from '@/lib/ai/settings';

interface DataLoaderProps {
  children: React.ReactNode;
}

// Component that loads data from database when user is authenticated.
// Now powered by React Query — replaces the old useDatabase() hook.
const DataLoader = ({ children }: DataLoaderProps) => {
  useKaivooQueries();

  // Load encrypted API key from localStorage into memory (Sprint 24 P2)
  useEffect(() => {
    void loadPersistedApiKey();
  }, []);

  return <>{children}</>;
};

export default DataLoader;
