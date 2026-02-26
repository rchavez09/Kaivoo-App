import { memo } from 'react';
import { CalendarDays, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

export type CalendarViewMode = 'month' | 'day';

interface CalendarViewSwitcherProps {
  viewMode: CalendarViewMode;
  onViewModeChange: (mode: CalendarViewMode) => void;
}

const modes: { mode: CalendarViewMode; icon: typeof CalendarDays; label: string }[] = [
  { mode: 'month', icon: CalendarDays, label: 'Month' },
  { mode: 'day', icon: Clock, label: 'Day' },
];

export const CalendarViewSwitcher = memo(({ viewMode, onViewModeChange }: CalendarViewSwitcherProps) => (
  <div className="flex items-center p-1 bg-secondary/50 rounded-lg">
    {modes.map(({ mode, icon: Icon, label }) => (
      <button
        key={mode}
        onClick={() => onViewModeChange(mode)}
        className={cn(
          'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
          viewMode === mode
            ? 'bg-background text-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground',
        )}
        title={`${label} view`}
        aria-label={`${label} view`}
        aria-pressed={viewMode === mode}
      >
        <Icon className="w-4 h-4" />
        <span className="hidden sm:inline">{label}</span>
      </button>
    ))}
  </div>
));

CalendarViewSwitcher.displayName = 'CalendarViewSwitcher';
