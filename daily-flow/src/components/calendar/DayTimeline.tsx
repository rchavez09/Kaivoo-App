import { memo, useMemo, useRef, useEffect } from 'react';
import { format, isToday, setHours, setMinutes, differenceInMinutes } from 'date-fns';
import { cn } from '@/lib/utils';
import { Clock, CheckCircle2 } from 'lucide-react';
import type { Meeting, Task } from '@/types';

interface DayTimelineProps {
  date: Date;
  meetings: Meeting[];
  pendingTasks: Task[];
  completedTasks: Task[];
  onMeetingClick?: (id: string) => void;
  onTaskClick?: (id: string) => void;
}

const HOUR_HEIGHT = 48;
const START_HOUR = 7;
const END_HOUR = 22;

export const DayTimeline = memo(
  ({ date, meetings, pendingTasks, completedTasks, onMeetingClick, onTaskClick }: DayTimelineProps) => {
    const nowRef = useRef<HTMLDivElement>(null);
    const todayDate = isToday(date);

    useEffect(() => {
      if (todayDate && nowRef.current) {
        nowRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, [todayDate]);

    const hours = useMemo(() => Array.from({ length: END_HOUR - START_HOUR }, (_, i) => START_HOUR + i), []);

    const now = new Date();
    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    const nowOffset = ((nowMinutes - START_HOUR * 60) / 60) * HOUR_HEIGHT;

    const meetingBlocks = useMemo(
      () =>
        meetings.map((m) => {
          const start = new Date(m.startTime);
          const end = new Date(m.endTime);
          const startMin = start.getHours() * 60 + start.getMinutes();
          const duration = differenceInMinutes(end, start);
          const top = ((startMin - START_HOUR * 60) / 60) * HOUR_HEIGHT;
          const height = Math.max((duration / 60) * HOUR_HEIGHT, 28);
          return {
            ...m,
            top,
            height,
            timeLabel: `${format(start, 'h:mm')} \u2013 ${format(end, 'h:mm a')}`,
          };
        }),
      [meetings],
    );

    const allTasks = [...pendingTasks, ...completedTasks];

    return (
      <div className="widget-card overflow-hidden">
        {/* All-day tasks section */}
        {allTasks.length > 0 && (
          <div className="border-b border-border/30 px-4 pb-3 pt-4">
            <div className="mb-2 flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-accent" />
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Tasks ({pendingTasks.length} pending)
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {allTasks.slice(0, 8).map((task) => (
                <button
                  key={task.id}
                  onClick={() => onTaskClick?.(task.id)}
                  className={cn(
                    'rounded-md px-2.5 py-1 text-xs transition-colors',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                    task.status === 'done'
                      ? 'bg-muted/50 text-muted-foreground line-through'
                      : 'bg-accent/10 text-accent-foreground hover:bg-accent/20',
                  )}
                >
                  <span
                    className={cn(
                      'mr-1.5 inline-block h-1.5 w-1.5 rounded-full align-middle',
                      task.priority === 'high' && 'bg-destructive',
                      task.priority === 'medium' && 'bg-amber-500',
                      task.priority === 'low' && 'bg-muted-foreground',
                      task.status === 'done' && 'bg-muted-foreground',
                    )}
                  />
                  {task.title}
                </button>
              ))}
              {allTasks.length > 8 && (
                <span className="self-center text-xs text-muted-foreground">+{allTasks.length - 8} more</span>
              )}
            </div>
          </div>
        )}

        {/* Hourly timeline */}
        <div className="px-4 py-2">
          <div className="mb-2 flex items-center gap-2">
            <Clock className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Schedule</span>
          </div>
        </div>

        <div
          className="scrollbar-thin relative max-h-[520px] overflow-y-auto"
          style={{ minHeight: hours.length * HOUR_HEIGHT }}
        >
          {/* Hour labels */}
          {hours.map((h) => (
            <div
              key={h}
              className="absolute left-2 w-12 text-xs text-muted-foreground"
              style={{ top: (h - START_HOUR) * HOUR_HEIGHT }}
            >
              {format(setMinutes(setHours(date, h), 0), 'h a')}
            </div>
          ))}

          {/* Hour grid lines */}
          {hours.map((h) => (
            <div
              key={`line-${h}`}
              className="absolute left-16 right-2 border-t border-border/30"
              style={{ top: (h - START_HOUR) * HOUR_HEIGHT }}
            />
          ))}

          {/* Meeting blocks */}
          {meetingBlocks.map((m) => (
            <button
              key={m.id}
              onClick={() => onMeetingClick?.(m.id)}
              className={cn(
                'absolute left-16 right-2 rounded-lg px-3 py-1.5 text-xs font-medium',
                'border border-primary/20 bg-primary/10 text-primary',
                'cursor-pointer overflow-hidden text-left transition-colors hover:bg-primary/20',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
              )}
              style={{ top: m.top, height: m.height }}
              aria-label={`${m.title}, ${m.timeLabel}`}
            >
              <div className="truncate">{m.title}</div>
              {m.height > 32 && <div className="truncate text-primary/60">{m.timeLabel}</div>}
              {m.height > 48 && m.location && (
                <div className="mt-0.5 truncate text-[10px] text-primary/50">{m.location}</div>
              )}
            </button>
          ))}

          {/* Current time indicator */}
          {todayDate && nowOffset >= 0 && nowOffset <= (END_HOUR - START_HOUR) * HOUR_HEIGHT && (
            <div ref={nowRef} className="absolute left-14 right-0 z-10 flex items-center" style={{ top: nowOffset }}>
              <div className="h-2.5 w-2.5 rounded-full bg-destructive" />
              <div className="h-px flex-1 bg-destructive" />
            </div>
          )}
        </div>
      </div>
    );
  },
);

DayTimeline.displayName = 'DayTimeline';
