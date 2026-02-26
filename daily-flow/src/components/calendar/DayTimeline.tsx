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

export const DayTimeline = memo(({
  date,
  meetings,
  pendingTasks,
  completedTasks,
  onMeetingClick,
  onTaskClick,
}: DayTimelineProps) => {
  const nowRef = useRef<HTMLDivElement>(null);
  const todayDate = isToday(date);

  useEffect(() => {
    if (todayDate && nowRef.current) {
      nowRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [todayDate]);

  const hours = useMemo(
    () => Array.from({ length: END_HOUR - START_HOUR }, (_, i) => START_HOUR + i),
    [],
  );

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
        <div className="px-4 pt-4 pb-3 border-b border-border/30">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-accent" />
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Tasks ({pendingTasks.length} pending)
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {allTasks.slice(0, 8).map((task) => (
              <button
                key={task.id}
                onClick={() => onTaskClick?.(task.id)}
                className={cn(
                  'text-xs px-2.5 py-1 rounded-md transition-colors',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                  task.status === 'done'
                    ? 'bg-muted/50 text-muted-foreground line-through'
                    : 'bg-accent/10 text-accent-foreground hover:bg-accent/20',
                )}
              >
                <span className={cn(
                  'inline-block w-1.5 h-1.5 rounded-full mr-1.5 align-middle',
                  task.priority === 'high' && 'bg-destructive',
                  task.priority === 'medium' && 'bg-amber-500',
                  task.priority === 'low' && 'bg-muted-foreground',
                  task.status === 'done' && 'bg-muted-foreground',
                )} />
                {task.title}
              </button>
            ))}
            {allTasks.length > 8 && (
              <span className="text-xs text-muted-foreground self-center">
                +{allTasks.length - 8} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Hourly timeline */}
      <div className="px-4 py-2">
        <div className="flex items-center gap-2 mb-2">
          <Clock className="w-3.5 h-3.5 text-primary" />
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Schedule
          </span>
        </div>
      </div>

      <div
        className="relative overflow-y-auto max-h-[520px] scrollbar-thin"
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
              'bg-primary/10 text-primary border border-primary/20',
              'hover:bg-primary/20 transition-colors cursor-pointer overflow-hidden text-left',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
            )}
            style={{ top: m.top, height: m.height }}
            aria-label={`${m.title}, ${m.timeLabel}`}
          >
            <div className="truncate">{m.title}</div>
            {m.height > 32 && (
              <div className="text-primary/60 truncate">{m.timeLabel}</div>
            )}
            {m.height > 48 && m.location && (
              <div className="text-primary/50 truncate text-[10px] mt-0.5">{m.location}</div>
            )}
          </button>
        ))}

        {/* Current time indicator */}
        {todayDate &&
          nowOffset >= 0 &&
          nowOffset <= (END_HOUR - START_HOUR) * HOUR_HEIGHT && (
            <div
              ref={nowRef}
              className="absolute left-14 right-0 flex items-center z-10"
              style={{ top: nowOffset }}
            >
              <div className="w-2.5 h-2.5 rounded-full bg-destructive" />
              <div className="flex-1 h-px bg-destructive" />
            </div>
          )}
      </div>
    </div>
  );
});

DayTimeline.displayName = 'DayTimeline';
