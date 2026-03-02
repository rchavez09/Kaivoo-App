import { useMemo } from 'react';
import { Calendar, Clock, MapPin } from 'lucide-react';
import { formatTime, getDurationMinutes, formatDuration } from '@/lib/dateUtils';
import { cn } from '@/lib/utils';
import { useKaivooStore } from '@/stores/useKaivooStore';
import type { Meeting } from '@/types';

const SOURCE_COLORS: Record<string, string> = {
  google: 'bg-green-500',
  outlook: 'bg-purple-500',
  manual: 'bg-orange-400',
};

interface ScheduleWidgetProps {
  date?: Date;
  meetings?: Meeting[];
  onMeetingClick?: (id: string) => void;
}

const ScheduleWidget = ({ date, meetings: meetingsProp, onMeetingClick }: ScheduleWidgetProps) => {
  const getMeetingsForDate = useKaivooStore((s) => s.getMeetingsForDate);

  const stableDate = useMemo(() => date || new Date(), [date]);

  const meetings = useMemo(() => {
    if (meetingsProp) return meetingsProp;
    return getMeetingsForDate(stableDate);
  }, [meetingsProp, getMeetingsForDate, stableDate]);

  if (meetings.length === 0) return null;

  return (
    <div className="widget-card animate-fade-in" style={{ animationDelay: '0.2s' }} id="day-section-schedule">
      <div className="widget-header">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-primary" />
          <span className="widget-title">Today's Schedule</span>
          <span className="ml-1 text-xs font-normal text-muted-foreground">
            {meetings.length} meeting{meetings.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      <div className="space-y-2">
        {meetings.map((meeting) => {
          const startTime = meeting.startTime instanceof Date ? meeting.startTime : new Date(meeting.startTime);
          const endTime = meeting.endTime instanceof Date ? meeting.endTime : new Date(meeting.endTime);
          const duration = getDurationMinutes(startTime, endTime);
          const source = meeting.source || 'manual';
          const sourceColor = SOURCE_COLORS[source] || SOURCE_COLORS.manual;

          return (
            <button
              key={meeting.id}
              onClick={() => onMeetingClick?.(meeting.id)}
              className="flex w-full items-start gap-3 rounded-lg bg-secondary/30 p-3 text-left transition-colors hover:bg-secondary/50"
            >
              <div className="flex min-w-[52px] flex-col items-center gap-0.5">
                <span className="text-sm font-medium text-foreground">{formatTime(startTime)}</span>
                {duration > 0 && <span className="text-[10px] text-muted-foreground">{formatDuration(duration)}</span>}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <div className={cn('h-2 w-2 flex-shrink-0 rounded-full', sourceColor)} />
                  <span className="truncate text-sm font-medium text-foreground">{meeting.title}</span>
                </div>
                {meeting.location && (
                  <div className="mt-0.5 flex items-center gap-1">
                    <MapPin className="h-3 w-3 flex-shrink-0 text-muted-foreground" />
                    <span className="truncate text-xs text-muted-foreground">{meeting.location}</span>
                  </div>
                )}
              </div>

              <span className="flex-shrink-0 text-[10px] capitalize text-muted-foreground">{source}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ScheduleWidget;
