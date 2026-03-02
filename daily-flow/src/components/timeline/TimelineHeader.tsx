import { useMemo } from 'react';
import { format, isToday } from 'date-fns';
import { cn } from '@/lib/utils';

interface TimelineHeaderProps {
  days: Date[];
  dayWidth: number;
}

const TimelineHeader = ({ days, dayWidth }: TimelineHeaderProps) => {
  // Group days by month for month labels
  const months = useMemo(() => {
    const result: { label: string; startIdx: number; span: number }[] = [];
    let currentMonth = '';
    let startIdx = 0;

    days.forEach((day, i) => {
      const monthKey = format(day, 'yyyy-MM');
      if (monthKey !== currentMonth) {
        if (currentMonth) {
          result.push({ label: format(days[startIdx], 'MMMM yyyy'), startIdx, span: i - startIdx });
        }
        currentMonth = monthKey;
        startIdx = i;
      }
    });

    // Push last month
    if (currentMonth) {
      result.push({ label: format(days[startIdx], 'MMMM yyyy'), startIdx, span: days.length - startIdx });
    }

    return result;
  }, [days]);

  return (
    <div className="sticky top-0 z-10 border-b border-border bg-background">
      {/* Month row */}
      <div className="flex" style={{ height: 28 }}>
        {months.map((m, i) => (
          <div
            key={i}
            className="flex items-center border-r border-border/30 px-2 text-xs font-medium text-foreground"
            style={{ width: m.span * dayWidth }}
          >
            {m.label}
          </div>
        ))}
      </div>

      {/* Day row */}
      <div className="flex" style={{ height: 24 }}>
        {days.map((day, i) => {
          const isWeekend = day.getDay() === 0 || day.getDay() === 6;
          const today = isToday(day);
          return (
            <div
              key={i}
              className={cn(
                'flex items-center justify-center border-r border-border/20 text-center text-[10px]',
                isWeekend ? 'bg-muted/20 text-muted-foreground/50' : 'text-muted-foreground',
                today && 'bg-primary/10 font-bold text-primary',
              )}
              style={{ width: dayWidth }}
            >
              {format(day, 'd')}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TimelineHeader;
