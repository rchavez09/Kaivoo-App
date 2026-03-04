import { ReactNode, useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { useParams } from 'react-router-dom';
import Sidebar from './Sidebar';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useKaivooStore } from '@/stores/useKaivooStore';
import { useSearchStore } from '@/stores/useSearchStore';
import { useShortcuts } from '@/hooks/useShortcuts';
import LicenseBanner from '@/components/license/LicenseBanner';
import { useLicenseStore } from '@/hooks/useLicense';
const SearchCommand = lazy(() => import('@/components/search/SearchCommand'));
const ConciergeChat = lazy(() => import('@/components/ai/ConciergeChat'));
const UpdateNotification = lazy(() => import('@/components/updater/UpdateNotification'));
const QuickAddNoteDialog = lazy(() => import('@/components/projects/QuickAddNoteDialog'));

interface AppLayoutProps {
  children: ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  const sidebarCollapsed = useKaivooStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useKaivooStore((s) => s.toggleSidebar);
  const [quickNoteOpen, setQuickNoteOpen] = useState(false);
  const initLicense = useLicenseStore((s) => s.init);

  // Initialize license store on mount
  useEffect(() => {
    initLicense();
  }, [initLicense]);

  // Detect if we're on a project detail page to pre-select the project
  const params = useParams<{ projectId?: string }>();

  const toggleSearch = useSearchStore((s) => s.toggle);
  const { matchesShortcut } = useShortcuts();

  // Global keyboard shortcuts (reads from customizable shortcut registry)
  const handleGlobalShortcut = useCallback(
    (e: KeyboardEvent) => {
      if (matchesShortcut('quick-note', e)) {
        e.preventDefault();
        setQuickNoteOpen(true);
      }
      if (matchesShortcut('global-search', e)) {
        e.preventDefault();
        toggleSearch();
      }
    },
    [matchesShortcut, toggleSearch],
  );

  useEffect(() => {
    document.addEventListener('keydown', handleGlobalShortcut);
    return () => document.removeEventListener('keydown', handleGlobalShortcut);
  }, [handleGlobalShortcut]);

  return (
    <TooltipProvider>
      <div className="flex h-screen w-full bg-background">
        <Sidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />
        <div className="flex flex-1 flex-col overflow-hidden">
          <LicenseBanner />
          {/* Depth Bar — Kaivoo signature gradient stripe (Design System v2.0) */}
          <div className="depth-bar" aria-hidden="true" />
          <main className="scrollbar-thin flex-1 overflow-auto bg-background">{children}</main>
        </div>
      </div>
      <Suspense fallback={null}>
        <SearchCommand />
      </Suspense>
      <Suspense fallback={null}>
        <ConciergeChat />
      </Suspense>
      <Suspense fallback={null}>
        <UpdateNotification />
      </Suspense>
      <Suspense fallback={null}>
        <QuickAddNoteDialog open={quickNoteOpen} onOpenChange={setQuickNoteOpen} defaultProjectId={params.projectId} />
      </Suspense>
    </TooltipProvider>
  );
};

export default AppLayout;
