import { memo } from 'react';
import { CheckCircle2, Calendar, BookOpen, Inbox, Activity, Smile } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { DayStats } from './useDayData';

interface DaySummaryBarProps {
  stats: DayStats;
  onMetricClick?: (section: string) => void;
}

const MOOD_LABELS = ['', 'Rough', 'Low', 'Okay', 'Good', 'Great'];

const DaySummaryBar = memo(({ stats, onMetricClick }: DaySummaryBarProps) => {
  const metrics = [
    {
      id: 'mood',
      icon: Smile,
      label: stats.moodScore ? MOOD_LABELS[stats.moodScore] : '—',
      show: true,
    },
    {
      id: 'routines',
      icon: Activity,
      label: `${stats.routinesDone}/${stats.routinesTotal} routines`,
      show: stats.routinesTotal > 0,
    },
    {
      id: 'tasks',
      icon: CheckCircle2,
      label: `${stats.tasksCompleted + stats.tasksRemaining} tasks`,
      show: true,
    },
    {
      id: 'meetings',
      icon: Calendar,
      label: `${stats.meetingCount} mtg${stats.meetingCount !== 1 ? 's' : ''}`,
      show: stats.meetingCount > 0,
    },
    {
      id: 'journal',
      icon: BookOpen,
      label: `${stats.journalWordCount} words`,
      show: stats.journalWordCount > 0,
    },
    {
      id: 'captures',
      icon: Inbox,
      label: `${stats.captureCount} capture${stats.captureCount !== 1 ? 's' : ''}`,
      show: stats.captureCount > 0,
    },
  ];

  const visibleMetrics = metrics.filter((m) => m.show);

  return (
    <div className="widget-card mb-6 !p-3" aria-live="polite" aria-label="Day summary">
      <div className="flex flex-wrap items-center gap-4">
        {visibleMetrics.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => onMetricClick?.(id)}
            className={cn(
              'flex items-center gap-1.5 text-xs text-muted-foreground',
              'cursor-pointer transition-colors hover:text-foreground',
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            <span>{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
});
DaySummaryBar.displayName = 'DaySummaryBar';

export default DaySummaryBar;
