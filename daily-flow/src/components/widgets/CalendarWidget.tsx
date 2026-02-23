import { useState } from 'react';
import { Calendar, Clock, ChevronRight, Video, MapPin, Plus, CalendarCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Link } from 'react-router-dom';
import { useKaivooStore } from '@/stores/useKaivooStore';
import { useKaivooActions } from '@/hooks/useKaivooActions';
import { formatTime, getDurationMinutes, formatDuration } from '@/lib/dateUtils';
import { EmptyState } from '@/components/ui/empty-state';

interface CalendarWidgetProps {
  onMeetingClick?: (meetingId: string) => void;
}

const CalendarWidget = ({ onMeetingClick }: CalendarWidgetProps) => {
  const { getTodaysMeetings } = useKaivooStore();
  const { addMeeting } = useKaivooActions();
  const meetings = getTodaysMeetings();
  const [showInput, setShowInput] = useState(false);
  const [newMeetingTitle, setNewMeetingTitle] = useState('');

  const getFormattedTime = (date: Date | string) => formatTime(date);
  const getFormattedDuration = (start: Date | string, end: Date | string) => {
    const mins = getDurationMinutes(start, end);
    return formatDuration(mins);
  };

  const handleAddMeeting = async () => {
    if (newMeetingTitle.trim()) {
      const now = new Date();
      // Default to next hour
      const startTime = new Date(now);
      startTime.setHours(now.getHours() + 1, 0, 0, 0);
      const endTime = new Date(startTime);
      endTime.setHours(startTime.getHours() + 1);

      const meeting = await addMeeting({
        title: newMeetingTitle.trim(),
        startTime,
        endTime,
        isExternal: false,
        source: 'manual',
      });

      setNewMeetingTitle('');
      setShowInput(false);

      // Open the drawer for the new meeting
      if (onMeetingClick && meeting) {
        onMeetingClick(meeting.id);
      }
    }
  };

  const handleMeetingClick = (meetingId: string) => {
    if (onMeetingClick) {
      onMeetingClick(meetingId);
    }
  };

  return (
    <div className="widget-card animate-fade-in" style={{ animationDelay: '0.1s' }}>
      <div className="widget-header">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-primary" />
          <span className="widget-title">Today's Schedule</span>
          <span className="text-xs text-muted-foreground font-normal ml-1">
            {meetings.length} {meetings.length === 1 ? 'meeting' : 'meetings'}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground h-8 px-2"
            onClick={() => setShowInput(true)}
            title="Add meeting"
            aria-label="Add meeting"
          >
            <Plus className="w-4 h-4" />
          </Button>
          <Link to="/calendar">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-muted-foreground hover:text-foreground h-8 px-2"
            >
              <span className="text-xs">View all</span>
              <ChevronRight className="w-3 h-3 ml-1" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Meetings */}
      {meetings.length > 0 && (
        <div className="space-y-2">
          {meetings.slice(0, 4).map((meeting) => (
            <div
              key={meeting.id}
              className="flex items-start gap-3 py-2.5 px-3 -mx-1 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors cursor-pointer"
              onClick={() => handleMeetingClick(meeting.id)}
            >
              <div className="flex flex-col items-center min-w-[50px]">
                <span className="text-xs font-medium text-foreground">{getFormattedTime(meeting.startTime)}</span>
                <span className="text-[10px] text-muted-foreground">{getFormattedDuration(meeting.startTime, meeting.endTime)}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{meeting.title}</p>
                {meeting.location && (
                  <div className="flex items-center gap-1 mt-0.5">
                    {meeting.location.toLowerCase().includes('zoom') ? (
                      <Video className="w-3 h-3 text-muted-foreground" />
                    ) : (
                      <MapPin className="w-3 h-3 text-muted-foreground" />
                    )}
                    <span className="text-xs text-muted-foreground">{meeting.location}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
          {meetings.length > 4 && (
            <p className="text-xs text-muted-foreground text-center">+{meetings.length - 4} more meetings</p>
          )}
        </div>
      )}

      {meetings.length === 0 && !showInput && (
        <EmptyState
          icon={CalendarCheck}
          title="No meetings today"
          description="Your schedule is clear. Add a meeting to get started."
          compact
        />
      )}

      {/* Add meeting input */}
      <div className="mt-3 pt-3 border-t border-border">
        {showInput ? (
          <div className="flex items-center gap-2">
            <Input
              autoFocus
              value={newMeetingTitle}
              onChange={(e) => setNewMeetingTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddMeeting();
                if (e.key === 'Escape') {
                  setShowInput(false);
                  setNewMeetingTitle('');
                }
              }}
              placeholder="Meeting title..."
              className="h-8 text-sm"
            />
            <Button size="sm" className="h-8" onClick={handleAddMeeting} disabled={!newMeetingTitle.trim()}>
              Add
            </Button>
          </div>
        ) : (
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full justify-start text-muted-foreground hover:text-foreground h-8 -mx-2"
            onClick={() => setShowInput(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            <span className="text-sm">Add meeting</span>
          </Button>
        )}
      </div>
    </div>
  );
};

export default CalendarWidget;
