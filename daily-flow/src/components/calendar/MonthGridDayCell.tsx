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

const MAX_DOTS = 3;

export const MonthGridDayCell = memo(({
  date,
  selectedDate,
  currentMonth,
  dayData,
  onSelect,
}: MonthGridDayCellProps) => {
  const today = isToday(date);
  const selected = isSameDay(date, selectedDate);
  const isCurrentMonth = date.getMonth() === currentMonth.getMonth();
  const meetingCount = dayData?.meetings.length ?? 0;
  const taskCount = (dayData?.pendingTasks ?? 0) + (dayData?.completedTasks ?? 0);
  const totalEvents = meetingCount + taskCount;

  // Build dot array: meetings first (primary), then tasks (accent)
  const dots: ('meeting' | 'task')[] = [];
  for (let i = 0; i < Math.min(meetingCount, MAX_DOTS); i++) dots.push('meeting');
  const remaining = MAX_DOTS - dots.length;
  for (let i = 0; i < Math.min(taskCount, remaining); i++) dots.push('task');
  const overflow = totalEvents - dots.length;

  return (
    <button
      role="gridcell"
      aria-label={`${format(date, 'EEEE, MMMM d, yyyy')}${meetingCount ? `, ${meetingCount} meeting${meetingCount > 1 ? 's' : ''}` : ''}${taskCount ? `, ${taskCount} task${taskCount > 1 ? 's' : ''}` : ''}`}
      aria-selected={selected}
      tabIndex={selected ? 0 : -1}
      onClick={() => onSelect(date)}
      className={cn(
        'relative flex flex-col items-center p-1.5 min-h-[72px] sm:min-h-[80px] rounded-lg transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1',
        !isCurrentMonth && 'opacity-40',
        selected && 'bg-primary/10',
        !selected && isCurrentMonth && 'hover:bg-secondary/50',
        today && !selected && 'ring-2 ring-primary/60',
      )}
    >
      {/* Day number */}
      <span className={cn(
        'text-sm font-medium leading-none',
        today && 'text-primary font-semibold',
        !today && isCurrentMonth && 'text-foreground',
        !isCurrentMonth && 'text-muted-foreground',
      )}>
        {date.getDate()}
      </span>

      {/* Event dots */}
      {dots.length > 0 && (
        <div className="flex items-center gap-1 mt-1.5">
          {dots.map((type, i) => (
            <div
              key={i}
              className={cn(
                'w-1.5 h-1.5 rounded-full',
                type === 'meeting' ? 'bg-primary' : 'bg-accent',
              )}
            />
          ))}
          {overflow > 0 && (
            <span className="text-[9px] text-muted-foreground leading-none">+{overflow}</span>
          )}
        </div>
      )}
    </button>
  );
});

MonthGridDayCell.displayName = 'MonthGridDayCell';
