import { memo, useMemo, useRef, useEffect } from 'react';
import { format, isToday, setHours, setMinutes, differenceInMinutes, isBefore, isAfter } from 'date-fns';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Meeting, RoutineItem } from '@/types';
import type { RoutineCompletionRecord } from '@/stores/useKaivooStore';

interface TimelineColumnProps {
  date: Date;
  meetings: Meeting[];
  routines: RoutineItem[];
  routineCompletions: RoutineCompletionRecord[];
  onMeetingClick?: (id: string) => void;
  onRoutineToggle?: (id: string) => void;
}

const HOUR_HEIGHT = 48; // px per hour
const START_HOUR = 7;
const END_HOUR = 22;

const TimelineColumn = memo(
  ({ date, meetings, routines, routineCompletions, onMeetingClick, onRoutineToggle }: TimelineColumnProps) => {
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

    const completedRoutineIds = useMemo(
      () => new Set(routineCompletions.map((rc) => rc.routineId)),
      [routineCompletions],
    );

    const meetingBlocks = useMemo(
      () =>
        meetings.map((m) => {
          const start = new Date(m.startTime);
          const end = new Date(m.endTime);
          const startMin = start.getHours() * 60 + start.getMinutes();
          const duration = differenceInMinutes(end, start);
          const top = ((startMin - START_HOUR * 60) / 60) * HOUR_HEIGHT;
          const height = Math.max((duration / 60) * HOUR_HEIGHT, 24);
          return { ...m, top, height, timeLabel: `${format(start, 'h:mm')}–${format(end, 'h:mm a')}` };
        }),
      [meetings],
    );

    return (
      <div className="widget-card overflow-hidden">
        <h3 className="widget-title mb-3">Timeline</h3>
        <div
          className="scrollbar-thin relative max-h-[480px] overflow-y-auto"
          style={{ minHeight: hours.length * HOUR_HEIGHT }}
        >
          {/* Hour labels */}
          {hours.map((h) => (
            <div
              key={h}
              className="absolute left-0 w-12 text-xs text-muted-foreground"
              style={{ top: (h - START_HOUR) * HOUR_HEIGHT }}
            >
              {format(setMinutes(setHours(date, h), 0), 'h a')}
            </div>
          ))}

          {/* Hour grid lines */}
          {hours.map((h) => (
            <div
              key={`line-${h}`}
              className="absolute left-14 right-0 border-t border-border/30"
              style={{ top: (h - START_HOUR) * HOUR_HEIGHT }}
            />
          ))}

          {/* Meeting blocks */}
          {meetingBlocks.map((m) => (
            <button
              key={m.id}
              onClick={() => onMeetingClick?.(m.id)}
              className={cn(
                'absolute left-14 right-2 rounded-lg px-2 py-1 text-xs font-medium',
                'border border-primary/20 bg-primary/10 text-primary',
                'cursor-pointer overflow-hidden transition-colors hover:bg-primary/20',
              )}
              style={{ top: m.top, height: m.height }}
            >
              <div className="truncate">{m.title}</div>
              {m.height > 28 && <div className="truncate text-primary/60">{m.timeLabel}</div>}
            </button>
          ))}

          {/* Current time indicator */}
          {todayDate && nowOffset >= 0 && nowOffset <= (END_HOUR - START_HOUR) * HOUR_HEIGHT && (
            <div ref={nowRef} className="absolute left-12 right-0 z-10 flex items-center" style={{ top: nowOffset }}>
              <div className="h-2 w-2 rounded-full bg-destructive" />
              <div className="h-px flex-1 bg-destructive" />
            </div>
          )}
        </div>

        {/* Routines section */}
        {routines.length > 0 && (
          <div className="mt-4 border-t border-border/30 pt-3">
            <h4 className="mb-2 text-xs font-medium text-muted-foreground">Routines</h4>
            <div className="space-y-1">
              {routines.map((r) => {
                const done = completedRoutineIds.has(r.id);
                return (
                  <button
                    key={r.id}
                    onClick={() => onRoutineToggle?.(r.id)}
                    className={cn(
                      'flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm transition-colors',
                      done ? 'text-muted-foreground line-through opacity-60' : 'text-foreground hover:bg-accent/20',
                    )}
                  >
                    <div
                      className={cn(
                        'flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors',
                        done ? 'border-primary bg-primary text-primary-foreground' : 'border-border',
                      )}
                    >
                      {done && <Check className="h-3 w-3" />}
                    </div>
                    <span>{r.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  },
);
TimelineColumn.displayName = 'TimelineColumn';

export default TimelineColumn;
