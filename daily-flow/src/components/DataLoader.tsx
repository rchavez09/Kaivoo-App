import { useKaivooQueries } from '@/hooks/queries';

interface DataLoaderProps {
  children: React.ReactNode;
}

// Component that loads data from database when user is authenticated.
// Now powered by React Query — replaces the old useDatabase() hook.
const DataLoader = ({ children }: DataLoaderProps) => {
  useKaivooQueries();
  return <>{children}</>;
};

export default DataLoader;
