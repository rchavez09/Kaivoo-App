import { memo, useMemo, useRef, useEffect, useState } from 'react';
import { format, isToday, setHours, setMinutes, differenceInMinutes, startOfWeek, addDays, isSameDay } from 'date-fns';
import { cn } from '@/lib/utils';
import type { Task } from '@/types';
import { useCalendarData } from './useCalendarData';
import { resolveTaskDay } from '@/lib/dateUtils';
import { useKaivooStore } from '@/stores/useKaivooStore';

interface WeekTimelineProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  onMeetingClick?: (id: string) => void;
  onTaskClick?: (id: string) => void;
}

const HOUR_HEIGHT = 48;
const START_HOUR = 7;
const END_HOUR = 22;
const HOURS = Array.from({ length: END_HOUR - START_HOUR }, (_, i) => START_HOUR + i);

export const WeekTimeline = memo(({
  selectedDate,
  onDateSelect,
  onMeetingClick,
  onTaskClick: _onTaskClick,
}: WeekTimelineProps) => {
  const nowRef = useRef<HTMLDivElement>(null);
  const allMeetings = useKaivooStore(s => s.meetings);
  const allTasks = useKaivooStore(s => s.tasks);

  // Week boundaries (Sun–Sat)
  const weekStart = useMemo(() => startOfWeek(selectedDate), [selectedDate]);
  const weekDays = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart],
  );
  const weekEnd = useMemo(() => addDays(weekStart, 6), [weekStart]);

  // Batch data for the week
  const calendarData = useCalendarData(weekStart, weekEnd);

  // Build per-day meeting blocks
  const meetingsByDay = useMemo(() => {
    const map = new Map<string, { id: string; title: string; top: number; height: number; timeLabel: string; location?: string }[]>();
    for (const day of weekDays) {
      const key = format(day, 'yyyy-MM-dd');
      const dayMeetings = allMeetings
        .filter(m => isSameDay(new Date(m.startTime), day))
        .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

      map.set(key, dayMeetings.map(m => {
        const start = new Date(m.startTime);
        const end = new Date(m.endTime);
        const startMin = start.getHours() * 60 + start.getMinutes();
        const duration = differenceInMinutes(end, start);
        const top = ((startMin - START_HOUR * 60) / 60) * HOUR_HEIGHT;
        const height = Math.max((duration / 60) * HOUR_HEIGHT, 24);
        return {
          id: m.id,
          title: m.title,
          top,
          height,
          timeLabel: `${format(start, 'h:mm')} – ${format(end, 'h:mm a')}`,
          location: m.location,
        };
      }));
    }
    return map;
  }, [weekDays, allMeetings]);

  // Build per-day task lists
  const tasksByDay = useMemo(() => {
    const map = new Map<string, Task[]>();
    for (const day of weekDays) {
      const key = format(day, 'yyyy-MM-dd');
      const dayTasks = allTasks.filter(t => {
        const taskDay = resolveTaskDay(t);
        return taskDay ? isSameDay(taskDay, day) : false;
      });
      if (dayTasks.length > 0) map.set(key, dayTasks);
    }
    return map;
  }, [weekDays, allTasks]);

  // P1-5 fix: auto-updating current time (every 60s)
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const nowOffset = ((nowMinutes - START_HOUR * 60) / 60) * HOUR_HEIGHT;
  const todayStr = format(now, 'yyyy-MM-dd');

  // Scroll to current time on mount
  useEffect(() => {
    if (nowRef.current) {
      nowRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, []);

  const totalHeight = HOURS.length * HOUR_HEIGHT;

  return (
    <div className="widget-card overflow-hidden">
      {/* Day headers */}
      <div className="grid grid-cols-[56px_repeat(7,1fr)] border-b border-border/30">
        <div className="p-2" /> {/* spacer for hour labels */}
        {weekDays.map(day => {
          const isSelected = isSameDay(day, selectedDate);
          const isTodayDate = isToday(day);
          const dayKey = format(day, 'yyyy-MM-dd');
          const dayData = calendarData.byDate.get(dayKey);
          const taskCount = dayData ? dayData.pendingTasks : 0;

          return (
            <button
              key={dayKey}
              onClick={() => onDateSelect(day)}
              className={cn(
                'flex flex-col items-center py-2.5 transition-colors text-center',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset',
                isSelected && 'bg-primary/5',
                !isSelected && 'hover:bg-secondary/30',
              )}
            >
              <span className="text-[10px] font-medium text-muted-foreground uppercase">
                {format(day, 'EEE')}
              </span>
              <span className={cn(
                'text-lg font-semibold mt-0.5 w-8 h-8 flex items-center justify-center rounded-full',
                isTodayDate && 'bg-primary text-primary-foreground',
                isSelected && !isTodayDate && 'bg-secondary text-foreground',
                !isTodayDate && !isSelected && 'text-foreground',
              )}>
                {format(day, 'd')}
              </span>
              {taskCount > 0 && (
                <span className="text-[9px] text-accent mt-0.5">{taskCount} task{taskCount !== 1 ? 's' : ''}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Scrollable grid */}
      <div className="overflow-y-auto max-h-[560px] scrollbar-thin">
        <div className="grid grid-cols-[56px_repeat(7,1fr)]" style={{ minHeight: totalHeight }}>
          {/* Hour labels column */}
          <div className="relative border-r border-border/20">
            {HOURS.map(h => (
              <div
                key={h}
                className="absolute left-2 right-0 text-[10px] text-muted-foreground"
                style={{ top: (h - START_HOUR) * HOUR_HEIGHT }}
              >
                {format(setMinutes(setHours(new Date(), h), 0), 'h a')}
              </div>
            ))}
          </div>

          {/* Day columns */}
          {weekDays.map(day => {
            const dayKey = format(day, 'yyyy-MM-dd');
            const dayMeetings = meetingsByDay.get(dayKey) ?? [];
            const _dayTasks = tasksByDay.get(dayKey) ?? [];
            const isTodayCol = dayKey === todayStr;
            const isSelected = isSameDay(day, selectedDate);

            return (
              <div
                key={dayKey}
                className={cn(
                  'relative border-r border-border/10',
                  isSelected && 'bg-primary/[0.02]',
                )}
                style={{ minHeight: totalHeight }}
              >
                {/* Hour grid lines */}
                {HOURS.map(h => (
                  <div
                    key={h}
                    className="absolute left-0 right-0 border-t border-border/20"
                    style={{ top: (h - START_HOUR) * HOUR_HEIGHT }}
                  />
                ))}

                {/* Meeting blocks */}
                {dayMeetings.map(m => (
                  <button
                    key={m.id}
                    onClick={() => onMeetingClick?.(m.id)}
                    className={cn(
                      'absolute left-0.5 right-0.5 rounded px-1.5 py-0.5 text-[10px] font-medium',
                      'bg-primary/10 text-primary border border-primary/20',
                      'hover:bg-primary/20 transition-colors cursor-pointer overflow-hidden text-left',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                    )}
                    style={{ top: m.top, height: m.height }}
                    aria-label={`${m.title}, ${m.timeLabel}`}
                  >
                    <div className="truncate leading-tight">{m.title}</div>
                    {m.height > 28 && (
                      <div className="text-primary/60 truncate leading-tight">{m.timeLabel}</div>
                    )}
                  </button>
                ))}

                {/* Current time indicator */}
                {isTodayCol && nowOffset >= 0 && nowOffset <= totalHeight && (
                  <div
                    ref={nowRef}
                    className="absolute left-0 right-0 flex items-center z-10"
                    style={{ top: nowOffset }}
                  >
                    <div className="w-2 h-2 rounded-full bg-destructive -ml-1" />
                    <div className="flex-1 h-px bg-destructive" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
});

WeekTimeline.displayName = 'WeekTimeline';
