import { useCallback, useState } from 'react';
import { Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useKaivooActions } from '@/hooks/useKaivooActions';
import { useDayData } from './useDayData';
import DayHeader from './DayHeader';
import DaySummaryBar from './DaySummaryBar';
import TimelineColumn from './TimelineColumn';
import TaskPanel from './TaskPanel';
import InlineJournal from './InlineJournal';
import CapturesList from './CapturesList';
import DailyShutdown from './DailyShutdown';
import type { JournalEntry, Capture } from '@/types';

interface UnifiedDayViewProps {
  date: Date;
  onDateChange: (date: Date) => void;
  onTaskClick?: (id: string) => void;
  onMeetingClick?: (id: string) => void;
  onEditJournal?: (entry: JournalEntry) => void;
  onEditCapture?: (capture: Capture) => void;
}

const UnifiedDayView = ({
  date,
  onDateChange,
  onTaskClick,
  onMeetingClick,
  onEditJournal,
  onEditCapture,
}: UnifiedDayViewProps) => {
  const dayData = useDayData(date);
  const { toggleRoutineCompletion } = useKaivooActions();
  const [shutdownOpen, setShutdownOpen] = useState(false);

  const handleRoutineToggle = useCallback(
    (routineId: string) => {
      toggleRoutineCompletion(routineId, dayData.dateStr);
    },
    [toggleRoutineCompletion, dayData.dateStr],
  );

  const handleMetricClick = useCallback((section: string) => {
    const el = document.getElementById(`day-section-${section}`);
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <DayHeader date={date} onDateChange={onDateChange} />
      <DaySummaryBar stats={dayData.stats} onMetricClick={handleMetricClick} />

      {/* Main body: Timeline + Tasks side by side */}
      <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2" id="day-section-tasks">
        <div id="day-section-routines">
          <TimelineColumn
            date={date}
            meetings={dayData.meetings}
            routines={dayData.routines}
            routineCompletions={dayData.routineCompletions}
            onMeetingClick={onMeetingClick}
            onRoutineToggle={handleRoutineToggle}
          />
        </div>
        <div>
          <TaskPanel
            pendingTasks={dayData.tasks.pending}
            completedTasks={dayData.tasks.completed}
            dateStr={dayData.dateStr}
            onTaskClick={onTaskClick}
          />
        </div>
      </div>

      {/* Footer: Journal + Captures side by side */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2" id="day-section-journal">
        <div>
          <InlineJournal dateStr={dayData.dateStr} entries={dayData.journalEntries} onEditEntry={onEditJournal} />
        </div>
        <div id="day-section-captures">
          <CapturesList dateStr={dayData.dateStr} captures={dayData.captures} onEditCapture={onEditCapture} />
        </div>
      </div>

      {/* Shutdown trigger */}
      {dayData.isToday && (
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

export default UnifiedDayView;
