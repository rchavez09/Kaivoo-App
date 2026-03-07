import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Sun,
  Calendar,
  FolderOpen,
  BarChart3,
  Settings,
  PanelLeftClose,
  PanelLeft,
  LogOut,
  BookOpen,
  Briefcase,
  Repeat,
  HardDrive,
} from 'lucide-react';
import kaivooLogo from '@/assets/kaivoo-logo.png';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useAuth } from '@/hooks/useAuth';

const isTauri = (): boolean => typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
const navItems = [
  {
    path: '/',
    label: 'Today',
    icon: Sun,
  },
  {
    path: '/notes',
    label: 'Notes',
    icon: BookOpen,
  },
  {
    path: '/projects',
    label: 'Projects',
    icon: Briefcase,
  },
  {
    path: '/routines',
    label: 'Routines',
    icon: Repeat,
  },
  {
    path: '/calendar',
    label: 'Calendar',
    icon: Calendar,
  },
  {
    path: '/vault',
    label: 'Vault',
    icon: HardDrive,
  },
  {
    path: '/topics',
    label: 'Topics',
    icon: FolderOpen,
  },
  {
    path: '/insights',
    label: 'Insights',
    icon: BarChart3,
  },
];
interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}
const Sidebar = ({ collapsed, onToggle }: SidebarProps) => {
  const location = useLocation();
  const { signOut, user } = useAuth();
  const [showSignOutDialog, setShowSignOutDialog] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    setShowSignOutDialog(false);
  };

  const NavItem = ({ path, label, icon: Icon }: { path: string; label: string; icon: typeof Sun }) => {
    const isActive = path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);
    const linkContent = (
      <Link to={path} className={cn('nav-item', isActive && 'active', collapsed && 'justify-center px-2')}>
        <Icon className="h-5 w-5 shrink-0" />
        {!collapsed && <span>{label}</span>}
      </Link>
    );
    if (collapsed) {
      return (
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
          <TooltipContent side="right" sideOffset={10}>
            {label}
          </TooltipContent>
        </Tooltip>
      );
    }
    return linkContent;
  };
  return (
    <aside
      className={cn(
        'flex h-screen flex-col border-r border-sidebar-border bg-sidebar',
        'transition-all duration-300 ease-in-out',
        collapsed ? 'w-16' : 'w-60',
      )}
    >
      {/* Logo */}
      <div
        className={cn(
          'flex items-center border-b border-sidebar-border p-5 transition-all duration-300',
          collapsed ? 'justify-center' : 'justify-between',
        )}
      >
        <Link to="/" className="group flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary shadow-sm transition-shadow group-hover:shadow-md">
            <img src={kaivooLogo} alt="Flow" className="h-5 w-5" />
          </div>
          <span
            className={cn(
              'text-lg font-semibold tracking-tight text-foreground transition-all duration-300',
              collapsed ? 'w-0 overflow-hidden opacity-0' : 'opacity-100',
            )}
          >
            Flow
          </span>
        </Link>
      </div>

      {/* Toggle Button */}
      <div className={cn('p-2 transition-all duration-300', collapsed ? 'flex justify-center' : 'flex justify-end')}>
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="h-8 w-8 text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <PanelLeft className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-3">
        {navItems.map((item) => (
          <NavItem key={item.path} {...item} />
        ))}
      </nav>

      {/* Settings & Sign Out */}
      <div className="space-y-1 border-t border-sidebar-border p-3">
        <NavItem path="/settings" label="Settings" icon={Settings} />
        {user &&
          !isTauri() &&
          (collapsed ? (
            <Tooltip delayDuration={300}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setShowSignOutDialog(true)}
                  aria-label="Sign Out"
                  className="nav-item w-full justify-center px-2 text-muted-foreground hover:text-destructive"
                >
                  <LogOut className="h-5 w-5 shrink-0" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={10}>
                Sign Out
              </TooltipContent>
            </Tooltip>
          ) : (
            <button
              onClick={() => setShowSignOutDialog(true)}
              className="nav-item w-full text-muted-foreground hover:text-destructive"
            >
              <LogOut className="h-5 w-5 shrink-0" />
              <span>Sign Out</span>
            </button>
          ))}
      </div>

      {/* Sign Out Confirmation Dialog */}
      <AlertDialog open={showSignOutDialog} onOpenChange={setShowSignOutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sign out?</AlertDialogTitle>
            <AlertDialogDescription>You'll need to sign in again to access your data.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSignOut}>Sign Out</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </aside>
  );
};
export default Sidebar;
