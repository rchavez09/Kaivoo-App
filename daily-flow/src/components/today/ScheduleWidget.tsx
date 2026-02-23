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
  const getMeetingsForDate = useKaivooStore(s => s.getMeetingsForDate);

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
          <Calendar className="w-4 h-4 text-primary" />
          <span className="widget-title">Today's Schedule</span>
          <span className="text-xs text-muted-foreground font-normal ml-1">
            {meetings.length} meeting{meetings.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      <div className="space-y-2">
        {meetings.map(meeting => {
          const startTime = meeting.startTime instanceof Date
            ? meeting.startTime
            : new Date(meeting.startTime);
          const endTime = meeting.endTime instanceof Date
            ? meeting.endTime
            : new Date(meeting.endTime);
          const duration = getDurationMinutes(startTime, endTime);
          const source = meeting.source || 'manual';
          const sourceColor = SOURCE_COLORS[source] || SOURCE_COLORS.manual;

          return (
            <button
              key={meeting.id}
              onClick={() => onMeetingClick?.(meeting.id)}
              className="w-full flex items-start gap-3 p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors text-left"
            >
              <div className="flex flex-col items-center gap-0.5 min-w-[52px]">
                <span className="text-sm font-medium text-foreground">
                  {formatTime(startTime)}
                </span>
                {duration > 0 && (
                  <span className="text-[10px] text-muted-foreground">
                    {formatDuration(duration)}
                  </span>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <div className={cn('w-2 h-2 rounded-full flex-shrink-0', sourceColor)} />
                  <span className="text-sm font-medium text-foreground truncate">
                    {meeting.title}
                  </span>
                </div>
                {meeting.location && (
                  <div className="flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                    <span className="text-xs text-muted-foreground truncate">
                      {meeting.location}
                    </span>
                  </div>
                )}
              </div>

              <span className="text-[10px] text-muted-foreground capitalize flex-shrink-0">
                {source}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ScheduleWidget;
