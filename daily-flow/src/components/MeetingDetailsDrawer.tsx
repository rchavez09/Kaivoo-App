import { useState, useEffect, useMemo } from 'react';
import { Calendar, Clock, MapPin, Users, Trash2, Video, Plus, X as XIcon, FileText, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useKaivooStore } from '@/stores/useKaivooStore';
import { useKaivooActions } from '@/hooks/useKaivooActions';
import { toast } from 'sonner';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';

interface MeetingDetailsDrawerProps {
  meetingId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const MeetingDetailsDrawer = ({ meetingId, open, onOpenChange }: MeetingDetailsDrawerProps) => {
  const meetings = useKaivooStore((s) => s.meetings);
  const { updateMeeting, deleteMeeting } = useKaivooActions();

  const meeting = useMemo(() => meetings.find((m) => m.id === meetingId), [meetings, meetingId]);

  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [newAttendee, setNewAttendee] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();

  useEffect(() => {
    if (meeting) {
      setTitle(meeting.title);
      setLocation(meeting.location || '');
      setDescription(meeting.description || '');
      setStartTime(format(meeting.startTime, 'HH:mm'));
      setEndTime(format(meeting.endTime, 'HH:mm'));
      setSelectedDate(meeting.startTime);
    }
  }, [meeting]);

  if (!meeting) return null;

  const showSavedFeedback = () => {
    toast.success('Changes saved', {
      duration: 1500,
      icon: <Check className="h-4 w-4" />,
    });
  };

  const handleTitleBlur = () => {
    if (title.trim() && title !== meeting.title) {
      updateMeeting(meeting.id, { title: title.trim() });
      showSavedFeedback();
    }
  };

  const handleLocationBlur = () => {
    if (location !== meeting.location) {
      updateMeeting(meeting.id, { location: location || undefined });
      showSavedFeedback();
    }
  };

  const handleDescriptionBlur = () => {
    if (description !== meeting.description) {
      updateMeeting(meeting.id, { description: description || undefined });
      showSavedFeedback();
    }
  };

  const handleTimeChange = (type: 'start' | 'end', value: string) => {
    if (type === 'start') {
      setStartTime(value);
      if (selectedDate && value) {
        const [hours, minutes] = value.split(':').map(Number);
        const newDate = new Date(selectedDate);
        newDate.setHours(hours, minutes, 0, 0);
        updateMeeting(meeting.id, { startTime: newDate });
        showSavedFeedback();
      }
    } else {
      setEndTime(value);
      if (selectedDate && value) {
        const [hours, minutes] = value.split(':').map(Number);
        const newDate = new Date(selectedDate);
        newDate.setHours(hours, minutes, 0, 0);
        updateMeeting(meeting.id, { endTime: newDate });
        showSavedFeedback();
      }
    }
  };

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      // Update both start and end times with new date
      const [startHours, startMinutes] = startTime.split(':').map(Number);
      const [endHours, endMinutes] = endTime.split(':').map(Number);

      const newStartTime = new Date(date);
      newStartTime.setHours(startHours || 9, startMinutes || 0, 0, 0);

      const newEndTime = new Date(date);
      newEndTime.setHours(endHours || 10, endMinutes || 0, 0, 0);

      updateMeeting(meeting.id, { startTime: newStartTime, endTime: newEndTime });
      showSavedFeedback();
    }
  };

  const handleAddAttendee = () => {
    if (newAttendee.trim()) {
      const attendees = meeting.attendees || [];
      if (!attendees.includes(newAttendee.trim())) {
        updateMeeting(meeting.id, { attendees: [...attendees, newAttendee.trim()] });
        showSavedFeedback();
      }
      setNewAttendee('');
    }
  };

  const handleRemoveAttendee = (attendee: string) => {
    const attendees = meeting.attendees || [];
    updateMeeting(meeting.id, { attendees: attendees.filter((a) => a !== attendee) });
    showSavedFeedback();
  };

  const handleDelete = () => {
    deleteMeeting(meeting.id);
    onOpenChange(false);
  };

  const isZoom = location.toLowerCase().includes('zoom');

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto border-l-4 border-panel-meeting-accent/30 bg-gradient-to-b from-panel-meeting-from to-panel-meeting-to sm:max-w-lg">
        <SheetHeader className="mb-2 space-y-4 pb-4">
          <SheetTitle className="sr-only">Edit Meeting</SheetTitle>
          <div className="flex items-start gap-2">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleTitleBlur}
              className="flex-1 border-0 bg-transparent px-0 text-lg font-semibold shadow-none focus-visible:ring-0"
              placeholder="Meeting title"
            />
          </div>

          {/* Date & Time display */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{format(meeting.startTime, 'EEEE, MMMM d, yyyy')}</span>
            <span className="mx-1">•</span>
            <Clock className="h-4 w-4" />
            <span>
              {format(meeting.startTime, 'h:mm a')} - {format(meeting.endTime, 'h:mm a')}
            </span>
          </div>
        </SheetHeader>

        <div className="space-y-4 py-6">
          {/* Date Picker */}
          <div className="space-y-2 rounded-xl bg-panel-meeting-section p-4 shadow-sm">
            <label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              Date
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start bg-card/50 text-left font-normal hover:bg-card"
                >
                  {selectedDate ? format(selectedDate, 'PPP') : 'Pick a date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleDateChange}
                  initialFocus
                  className="pointer-events-auto p-3"
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Time */}
          <div className="space-y-2 rounded-xl bg-panel-meeting-section p-4 shadow-sm">
            <label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              Time
            </label>
            <div className="flex items-center gap-2">
              <Input
                type="time"
                value={startTime}
                onChange={(e) => handleTimeChange('start', e.target.value)}
                className="flex-1 border-0 bg-card/50"
              />
              <span className="text-muted-foreground">to</span>
              <Input
                type="time"
                value={endTime}
                onChange={(e) => handleTimeChange('end', e.target.value)}
                className="flex-1 border-0 bg-card/50"
              />
            </div>
          </div>

          {/* Location */}
          <div className="space-y-2 rounded-xl bg-panel-meeting-section p-4 shadow-sm">
            <label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              {isZoom ? <Video className="h-3.5 w-3.5" /> : <MapPin className="h-3.5 w-3.5" />}
              Location
            </label>
            <Input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              onBlur={handleLocationBlur}
              placeholder="Add location or video link..."
              className="border-0 bg-card/50"
            />
          </div>

          {/* Description */}
          <div className="space-y-2 rounded-xl bg-panel-meeting-section p-4 shadow-sm">
            <label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <FileText className="h-3.5 w-3.5" />
              Description
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onBlur={handleDescriptionBlur}
              placeholder="Add meeting notes or agenda..."
              className="min-h-[100px] resize-none border-0 bg-card/50"
            />
          </div>

          {/* Attendees */}
          <div className="space-y-2 rounded-xl bg-panel-meeting-section p-4 shadow-sm">
            <label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <Users className="h-3.5 w-3.5" />
              Attendees
            </label>
            <div className="flex flex-wrap gap-1.5">
              {(meeting.attendees || []).map((attendee) => (
                <Badge
                  key={attendee}
                  variant="secondary"
                  className="cursor-pointer bg-card/80 text-xs transition-colors hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => handleRemoveAttendee(attendee)}
                >
                  {attendee} <XIcon className="ml-1 h-2.5 w-2.5" />
                </Badge>
              ))}
              <div className="flex items-center gap-1">
                <Input
                  value={newAttendee}
                  onChange={(e) => setNewAttendee(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddAttendee()}
                  placeholder="Add attendee..."
                  className="h-6 w-28 border-0 bg-card/50 px-2 text-xs"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Add attendee"
                  className="h-6 w-6"
                  onClick={handleAddAttendee}
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>

          {/* Source indicator */}
          {meeting.isExternal && (
            <div className="flex items-center gap-2 px-1 text-xs text-muted-foreground">
              <span className="capitalize">From {meeting.source}</span>
            </div>
          )}
        </div>

        {/* Delete button */}
        <div className="mt-auto border-t border-border pt-4">
          <Button
            variant="ghost"
            className="w-full text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={handleDelete}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete meeting
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MeetingDetailsDrawer;
