import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sun, CheckSquare, Calendar, FolderOpen, BarChart3, Settings, PanelLeftClose, PanelLeft, LogOut, BookOpen } from 'lucide-react';
import kaivooLogo from '@/assets/kaivoo-logo.png';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useAuth } from '@/hooks/useAuth';
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
const navItems = [{
  path: '/',
  label: 'Today',
  icon: Sun
}, {
  path: '/journal',
  label: 'Journal',
  icon: BookOpen
}, {
  path: '/tasks',
  label: 'Tasks',
  icon: CheckSquare
}, {
  path: '/calendar',
  label: 'Calendar',
  icon: Calendar
}, {
  path: '/topics',
  label: 'Topics',
  icon: FolderOpen
}, {
  path: '/insights',
  label: 'Insights',
  icon: BarChart3
}];
interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}
const Sidebar = ({
  collapsed,
  onToggle
}: SidebarProps) => {
  const location = useLocation();
  const { signOut, user } = useAuth();
  const [showSignOutDialog, setShowSignOutDialog] = useState(false);
  
  const handleSignOut = async () => {
    await signOut();
    setShowSignOutDialog(false);
  };

  const NavItem = ({
    path,
    label,
    icon: Icon
  }: {
    path: string;
    label: string;
    icon: typeof Sun;
  }) => {
    const isActive = location.pathname === path;
    const linkContent = <Link to={path} className={cn('nav-item', isActive && 'active', collapsed && 'justify-center px-2')}>
        <Icon className="w-5 h-5 shrink-0" />
        {!collapsed && <span>{label}</span>}
      </Link>;
    if (collapsed) {
      return <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            {linkContent}
          </TooltipTrigger>
          <TooltipContent side="right" sideOffset={10}>
            {label}
          </TooltipContent>
        </Tooltip>;
    }
    return linkContent;
  };
  return <aside className={cn(
    "h-screen bg-sidebar border-r border-sidebar-border flex flex-col",
    "transition-all duration-300 ease-in-out",
    collapsed ? "w-16" : "w-60"
  )}>
      {/* Logo */}
      <div className={cn(
        "p-5 border-b border-sidebar-border flex items-center transition-all duration-300",
        collapsed ? "justify-center" : "justify-between"
      )}>
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 bg-primary flex items-center justify-center shrink-0 rounded-lg shadow-sm group-hover:shadow-md transition-shadow">
            <img src={kaivooLogo} alt="Kaivoo" className="w-5 h-5" />
          </div>
          <span className={cn(
            "text-lg font-semibold text-foreground tracking-tight transition-all duration-300",
            collapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100"
          )}>Kaivoo</span>
        </Link>
      </div>

      {/* Toggle Button */}
      <div className={cn("p-2 transition-all duration-300", collapsed ? "flex justify-center" : "flex justify-end")}>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onToggle} 
          className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-colors"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <PanelLeft className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map(item => <NavItem key={item.path} {...item} />)}
      </nav>

      {/* Settings & Sign Out */}
      <div className="p-3 border-t border-sidebar-border space-y-1">
        <NavItem path="/settings" label="Settings" icon={Settings} />
        {user && (
          collapsed ? (
            <Tooltip delayDuration={300}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setShowSignOutDialog(true)}
                  className="nav-item justify-center px-2 w-full text-muted-foreground hover:text-destructive"
                >
                  <LogOut className="w-5 h-5 shrink-0" />
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
              <LogOut className="w-5 h-5 shrink-0" />
              <span>Sign Out</span>
            </button>
          )
        )}
      </div>

      {/* Sign Out Confirmation Dialog */}
      <AlertDialog open={showSignOutDialog} onOpenChange={setShowSignOutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sign out?</AlertDialogTitle>
            <AlertDialogDescription>
              You'll need to sign in again to access your data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSignOut}>Sign Out</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </aside>;
};
export default Sidebar;