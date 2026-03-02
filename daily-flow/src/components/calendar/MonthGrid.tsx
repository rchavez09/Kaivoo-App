import { memo, useMemo, useCallback, type KeyboardEvent } from 'react';
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  addMonths,
  subMonths,
  addDays,
  format,
  isToday,
} from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCalendarData } from './useCalendarData';
import { MonthGridDayCell } from './MonthGridDayCell';

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface MonthGridProps {
  currentMonth: Date;
  selectedDate: Date;
  onMonthChange: (month: Date) => void;
  onDateSelect: (date: Date) => void;
}

export const MonthGrid = memo(({ currentMonth, selectedDate, onMonthChange, onDateSelect }: MonthGridProps) => {
  // Calculate the full grid range (includes days from prev/next month)
  const { gridStart, gridEnd, days } = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const gridStart = startOfWeek(monthStart, { weekStartsOn: 0 });
    const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
    const days = eachDayOfInterval({ start: gridStart, end: gridEnd });
    return { gridStart, gridEnd, days };
  }, [currentMonth]);

  // Batch fetch data for the entire grid
  const calendarData = useCalendarData(gridStart, gridEnd);

  const showToday = !isToday(currentMonth) || currentMonth.getMonth() !== new Date().getMonth();

  const handlePrevMonth = useCallback(() => onMonthChange(subMonths(currentMonth, 1)), [currentMonth, onMonthChange]);
  const handleNextMonth = useCallback(() => onMonthChange(addMonths(currentMonth, 1)), [currentMonth, onMonthChange]);
  const handleToday = useCallback(() => {
    const today = new Date();
    onMonthChange(today);
    onDateSelect(today);
  }, [onMonthChange, onDateSelect]);

  const handleGridKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      let offset = 0;
      switch (e.key) {
        case 'ArrowLeft':
          offset = -1;
          break;
        case 'ArrowRight':
          offset = 1;
          break;
        case 'ArrowUp':
          offset = -7;
          break;
        case 'ArrowDown':
          offset = 7;
          break;
        default:
          return;
      }
      e.preventDefault();
      const next = addDays(selectedDate, offset);
      onDateSelect(next);
      // If navigated out of current month, switch month
      if (next.getMonth() !== currentMonth.getMonth() || next.getFullYear() !== currentMonth.getFullYear()) {
        onMonthChange(startOfMonth(next));
      }
    },
    [selectedDate, currentMonth, onDateSelect, onMonthChange],
  );

  return (
    <div className="widget-card p-4 sm:p-6">
      {/* Month header with navigation */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handlePrevMonth} aria-label="Previous month">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="min-w-[160px] text-center text-lg font-semibold text-foreground">
            {format(currentMonth, 'MMMM yyyy')}
          </h2>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleNextMonth} aria-label="Next month">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        {showToday && (
          <Button variant="outline" size="sm" onClick={handleToday}>
            Today
          </Button>
        )}
      </div>

      {/* Day name headers */}
      <div className="mb-1 grid grid-cols-7" role="row">
        {DAY_NAMES.map((name) => (
          <div key={name} className="py-2 text-center text-xs font-medium text-muted-foreground" role="columnheader">
            {name}
          </div>
        ))}
      </div>

      {/* Day cells grid */}
      <div className="grid grid-cols-7 gap-px" role="grid" aria-label="Calendar grid" onKeyDown={handleGridKeyDown}>
        {days.map((day) => {
          const key = format(day, 'yyyy-MM-dd');
          return (
            <MonthGridDayCell
              key={key}
              date={day}
              selectedDate={selectedDate}
              currentMonth={currentMonth}
              dayData={calendarData.byDate.get(key)}
              onSelect={onDateSelect}
            />
          );
        })}
      </div>
    </div>
  );
});

MonthGrid.displayName = 'MonthGrid';
