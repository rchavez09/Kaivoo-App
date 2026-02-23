import { ReactNode } from 'react';
import Sidebar from './Sidebar';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useKaivooStore } from '@/stores/useKaivooStore';
import FloatingChat from '@/components/FloatingChat';

interface AppLayoutProps {
  children: ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  const sidebarCollapsed = useKaivooStore(s => s.sidebarCollapsed);
  const toggleSidebar = useKaivooStore(s => s.toggleSidebar);

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
    </TooltipProvider>
  );
};

export default AppLayout;