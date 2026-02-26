import { ReactNode, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Sidebar from './Sidebar';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useKaivooStore } from '@/stores/useKaivooStore';
import FloatingChat from '@/components/FloatingChat';
import QuickAddNoteDialog from '@/components/projects/QuickAddNoteDialog';

interface AppLayoutProps {
  children: ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  const sidebarCollapsed = useKaivooStore(s => s.sidebarCollapsed);
  const toggleSidebar = useKaivooStore(s => s.toggleSidebar);
  const [quickNoteOpen, setQuickNoteOpen] = useState(false);

  // Detect if we're on a project detail page to pre-select the project
  const params = useParams<{ projectId?: string }>();

  // Global keyboard shortcut: Option+N (Mac) or Alt+N
  // Avoids Cmd+Shift+N which browsers reserve for private/incognito windows
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.altKey && !e.metaKey && !e.ctrlKey && e.code === 'KeyN') {
        e.preventDefault();
        setQuickNoteOpen(true);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  return (
    <TooltipProvider>
      <div className="flex h-screen bg-background w-full">
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggle={toggleSidebar}
        />
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Depth Bar — Kaivoo signature gradient stripe (Design System v2.0) */}
          <div className="depth-bar" aria-hidden="true" />
          <main className="flex-1 overflow-auto scrollbar-thin">
            {children}
          </main>
        </div>
      </div>
      <FloatingChat />
      <QuickAddNoteDialog
        open={quickNoteOpen}
        onOpenChange={setQuickNoteOpen}
        defaultProjectId={params.projectId}
      />
    </TooltipProvider>
  );
};

export default AppLayout;