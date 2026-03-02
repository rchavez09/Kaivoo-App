import { memo } from 'react';
import { isSameDay, isToday, format } from 'date-fns';
import { cn } from '@/lib/utils';
import type { DayData } from './useCalendarData';

interface MonthGridDayCellProps {
  date: Date;
  selectedDate: Date;
  currentMonth: Date;
  dayData?: DayData;
  onSelect: (date: Date) => void;
}

const MAX_DOTS_PER_ROW = 4;

export const MonthGridDayCell = memo(
  ({ date, selectedDate, currentMonth, dayData, onSelect }: MonthGridDayCellProps) => {
    const today = isToday(date);
    const selected = isSameDay(date, selectedDate);
    const isCurrentMonth = date.getMonth() === currentMonth.getMonth();
    const meetingCount = dayData?.meetings.length ?? 0;
    const taskCount = (dayData?.pendingTasks ?? 0) + (dayData?.completedTasks ?? 0);

    const shownMeetings = Math.min(meetingCount, MAX_DOTS_PER_ROW);
    const meetingOverflow = meetingCount - shownMeetings;
    const shownTasks = Math.min(taskCount, MAX_DOTS_PER_ROW);
    const taskOverflow = taskCount - shownTasks;

    return (
      <button
        role="gridcell"
        aria-label={`${format(date, 'EEEE, MMMM d, yyyy')}${meetingCount ? `, ${meetingCount} meeting${meetingCount > 1 ? 's' : ''}` : ''}${taskCount ? `, ${taskCount} task${taskCount > 1 ? 's' : ''}` : ''}`}
        aria-selected={selected}
        tabIndex={selected ? 0 : -1}
        onClick={() => onSelect(date)}
        className={cn(
          'relative flex min-h-[72px] flex-col items-center rounded-lg p-1.5 transition-colors sm:min-h-[80px]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1',
          !isCurrentMonth && 'opacity-40',
          selected && 'bg-primary/10',
          !selected && isCurrentMonth && 'hover:bg-secondary/50',
          today && !selected && 'ring-2 ring-primary/60',
        )}
      >
        {/* Day number */}
        <span
          className={cn(
            'text-sm font-medium leading-none',
            today && 'font-semibold text-primary',
            !today && isCurrentMonth && 'text-foreground',
            !isCurrentMonth && 'text-muted-foreground',
          )}
        >
          {date.getDate()}
        </span>

        {/* Meeting dots — separate row */}
        {meetingCount > 0 && (
          <div className="mt-1 flex items-center gap-0.5">
            {Array.from({ length: shownMeetings }, (_, i) => (
              <div key={`m${i}`} className="h-1.5 w-1.5 rounded-full bg-primary" />
            ))}
            {meetingOverflow > 0 && (
              <span className="ml-0.5 text-[8px] leading-none text-primary/70">+{meetingOverflow}</span>
            )}
          </div>
        )}

        {/* Task dots — separate row */}
        {taskCount > 0 && (
          <div className="mt-0.5 flex items-center gap-0.5">
            {Array.from({ length: shownTasks }, (_, i) => (
              <div key={`t${i}`} className="h-1.5 w-1.5 rounded-full bg-accent" />
            ))}
            {taskOverflow > 0 && <span className="ml-0.5 text-[8px] leading-none text-accent/70">+{taskOverflow}</span>}
          </div>
        )}
      </button>
    );
  },
);

MonthGridDayCell.displayName = 'MonthGridDayCell';
