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

export const WeekTimeline = memo(({ selectedDate, onDateSelect, onMeetingClick, onTaskClick }: WeekTimelineProps) => {
  const nowRef = useRef<HTMLDivElement>(null);
  const allMeetings = useKaivooStore((s) => s.meetings);
  const allTasks = useKaivooStore((s) => s.tasks);

  // Week boundaries (Sun–Sat)
  const weekStart = useMemo(() => startOfWeek(selectedDate), [selectedDate]);
  const weekDays = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart]);
  const weekEnd = useMemo(() => addDays(weekStart, 6), [weekStart]);

  // Batch data for the week
  const calendarData = useCalendarData(weekStart, weekEnd);

  // Build per-day meeting blocks
  const meetingsByDay = useMemo(() => {
    const map = new Map<
      string,
      { id: string; title: string; top: number; height: number; timeLabel: string; location?: string }[]
    >();
    for (const day of weekDays) {
      const key = format(day, 'yyyy-MM-dd');
      const dayMeetings = allMeetings
        .filter((m) => isSameDay(new Date(m.startTime), day))
        .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

      map.set(
        key,
        dayMeetings.map((m) => {
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
        }),
      );
    }
    return map;
  }, [weekDays, allMeetings]);

  // Build per-day task lists
  const tasksByDay = useMemo(() => {
    const map = new Map<string, Task[]>();
    for (const day of weekDays) {
      const key = format(day, 'yyyy-MM-dd');
      const dayTasks = allTasks.filter((t) => {
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
        {weekDays.map((day) => {
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
                'flex flex-col items-center py-2.5 text-center transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary',
                isSelected && 'bg-primary/5',
                !isSelected && 'hover:bg-secondary/30',
              )}
            >
              <span className="text-[10px] font-medium uppercase text-muted-foreground">{format(day, 'EEE')}</span>
              <span
                className={cn(
                  'mt-0.5 flex h-8 w-8 items-center justify-center rounded-full text-lg font-semibold',
                  isTodayDate && 'bg-primary text-primary-foreground',
                  isSelected && !isTodayDate && 'bg-secondary text-foreground',
                  !isTodayDate && !isSelected && 'text-foreground',
                )}
              >
                {format(day, 'd')}
              </span>
              {taskCount > 0 && (
                <span className="mt-0.5 text-[9px] text-accent">
                  {taskCount} task{taskCount !== 1 ? 's' : ''}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Scrollable grid */}
      <div className="scrollbar-thin max-h-[560px] overflow-y-auto">
        <div className="grid grid-cols-[56px_repeat(7,1fr)]" style={{ minHeight: totalHeight }}>
          {/* Hour labels column */}
          <div className="relative border-r border-border/20">
            {HOURS.map((h) => (
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
          {weekDays.map((day) => {
            const dayKey = format(day, 'yyyy-MM-dd');
            const dayMeetings = meetingsByDay.get(dayKey) ?? [];
            const dayTasks = tasksByDay.get(dayKey) ?? [];
            const isTodayCol = dayKey === todayStr;
            const isSelected = isSameDay(day, selectedDate);

            return (
              <div
                key={dayKey}
                className={cn('relative border-r border-border/10', isSelected && 'bg-primary/[0.02]')}
                style={{ minHeight: totalHeight }}
              >
                {/* Hour grid lines */}
                {HOURS.map((h) => (
                  <div
                    key={h}
                    className="absolute left-0 right-0 border-t border-border/20"
                    style={{ top: (h - START_HOUR) * HOUR_HEIGHT }}
                  />
                ))}

                {/* Meeting blocks */}
                {dayMeetings.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => onMeetingClick?.(m.id)}
                    className={cn(
                      'absolute left-0.5 right-0.5 rounded px-1.5 py-0.5 text-[10px] font-medium',
                      'border border-primary/20 bg-primary/10 text-primary',
                      'cursor-pointer overflow-hidden text-left transition-colors hover:bg-primary/20',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                    )}
                    style={{ top: m.top, height: m.height }}
                    aria-label={`${m.title}, ${m.timeLabel}`}
                  >
                    <div className="truncate leading-tight">{m.title}</div>
                    {m.height > 28 && <div className="truncate leading-tight text-primary/60">{m.timeLabel}</div>}
                  </button>
                ))}

                {/* Task blocks — rendered as compact bars at the top of each day */}
                {dayTasks.length > 0 && (
                  <div className="absolute left-0.5 right-0.5 top-0 flex flex-col gap-0.5 p-0.5">
                    {dayTasks.slice(0, 3).map((task) => (
                      <button
                        key={task.id}
                        onClick={() => onTaskClick?.(task.id)}
                        className={cn(
                          'w-full truncate rounded px-1.5 py-0.5 text-left text-[10px]',
                          'cursor-pointer transition-colors',
                          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                          task.status === 'done'
                            ? 'bg-success-foreground/10 text-success-foreground/60 line-through'
                            : task.priority === 'high'
                              ? 'border border-destructive/20 bg-destructive/10 text-destructive'
                              : task.priority === 'medium'
                                ? 'border border-primary/20 bg-primary/10 text-primary'
                                : 'border border-border bg-secondary text-foreground',
                        )}
                        aria-label={`Task: ${task.title}`}
                      >
                        {task.title}
                      </button>
                    ))}
                    {dayTasks.length > 3 && (
                      <span className="text-center text-[9px] text-muted-foreground">+{dayTasks.length - 3} more</span>
                    )}
                  </div>
                )}

                {/* Current time indicator */}
                {isTodayCol && nowOffset >= 0 && nowOffset <= totalHeight && (
                  <div
                    ref={nowRef}
                    className="absolute left-0 right-0 z-10 flex items-center"
                    style={{ top: nowOffset }}
                  >
                    <div className="-ml-1 h-2 w-2 rounded-full bg-destructive" />
                    <div className="h-px flex-1 bg-destructive" />
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
