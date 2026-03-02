import { useCallback, useState } from 'react';
import { Moon } from 'lucide-react';
import { isToday } from 'date-fns';
import { Button } from '@/components/ui/button';
import DayHeader from '@/components/day-view/DayHeader';
import DailyShutdown from '@/components/day-view/DailyShutdown';
import SearchTrigger from '@/components/search/SearchTrigger';
import DailyBriefWidget from '@/components/widgets/DailyBriefWidget';
import TasksWidget from '@/components/widgets/TasksWidget';
import TrackingWidget from '@/components/widgets/TrackingWidget';
import TodayActivityWidget from '@/components/widgets/TodayActivityWidget';
import ScheduleWidget from '@/components/today/ScheduleWidget';
import WidgetContainer, { WidgetConfig } from '@/components/widgets/WidgetContainer';
import { useWidgetSettings } from '@/hooks/useWidgetSettings';

const AVAILABLE_WIDGETS = [
  { type: 'day-brief', title: 'Day Brief' },
  { type: 'tasks', title: 'Tasks' },
  { type: 'routines', title: 'Routines' },
  { type: 'activity', title: "Today's Activity" },
  { type: 'schedule', title: 'Schedule' },
];

const DEFAULT_WIDGETS: WidgetConfig[] = [
  { id: 'widget-day-brief', type: 'day-brief', title: 'Day Brief', visible: true, order: 0 },
  { id: 'widget-tasks', type: 'tasks', title: 'Tasks', visible: true, order: 1 },
  { id: 'widget-routines', type: 'routines', title: 'Routines', visible: true, order: 2 },
  { id: 'widget-activity', type: 'activity', title: "Today's Activity", visible: true, order: 3 },
  { id: 'widget-schedule', type: 'schedule', title: 'Schedule', visible: true, order: 4 },
];

interface DashboardSettings {
  widgets: WidgetConfig[];
  layout: 'vertical' | 'horizontal';
}

const DEFAULT_SETTINGS: DashboardSettings = {
  widgets: DEFAULT_WIDGETS,
  layout: 'vertical',
};

interface TodayDashboardProps {
  date: Date;
  onDateChange: (date: Date) => void;
  onTaskClick?: (id: string) => void;
  onMeetingClick?: (id: string) => void;
}

const TodayDashboard = ({ date, onDateChange, onTaskClick, onMeetingClick }: TodayDashboardProps) => {
  const [shutdownOpen, setShutdownOpen] = useState(false);
  const { settings, updateSettings } = useWidgetSettings('today-dashboard', DEFAULT_SETTINGS);

  const handleWidgetsChange = useCallback((widgets: WidgetConfig[]) => updateSettings({ widgets }), [updateSettings]);

  const handleLayoutChange = useCallback(
    (layout: 'vertical' | 'horizontal') => updateSettings({ layout }),
    [updateSettings],
  );

  const renderWidget = useCallback(
    (widget: WidgetConfig) => {
      switch (widget.type) {
        case 'day-brief':
          return <DailyBriefWidget date={date} />;
        case 'tasks':
          return <TasksWidget date={date} onTaskClick={onTaskClick} />;
        case 'routines':
          return <TrackingWidget date={date} />;
        case 'activity':
          return <TodayActivityWidget date={date} onTaskClick={onTaskClick} />;
        case 'schedule':
          return <ScheduleWidget date={date} onMeetingClick={onMeetingClick} />;
        default:
          return null;
      }
    },
    [date, onTaskClick, onMeetingClick],
  );

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      {/* Date Navigation — structural, outside widget container */}
      <DayHeader date={date} onDateChange={onDateChange} />

      {/* Search bar — structural, opens command palette */}
      <SearchTrigger />

      {/* Configurable widget area */}
      <WidgetContainer
        widgets={settings.widgets}
        onWidgetsChange={handleWidgetsChange}
        availableWidgets={AVAILABLE_WIDGETS}
        renderWidget={renderWidget}
        layout={settings.layout}
        onLayoutChange={handleLayoutChange}
      />

      {/* Shutdown trigger — structural, outside widget container */}
      {isToday(date) && (
        <div className="mt-6 flex justify-center">
          <Button
            variant="outline"
            onClick={() => setShutdownOpen(true)}
            className="gap-2 text-muted-foreground hover:text-foreground"
          >
            <Moon className="h-4 w-4" />
            Begin Daily Shutdown
          </Button>
        </div>
      )}

      <DailyShutdown open={shutdownOpen} onOpenChange={setShutdownOpen} date={date} />
    </div>
  );
};

export default TodayDashboard;
