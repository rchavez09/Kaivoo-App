import { useState, useEffect, useMemo } from 'react';
import { 
  Calendar, Clock, MapPin, Users, Trash2, Video, 
  Plus, X as XIcon, FileText, Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useKaivooStore } from '@/stores/useKaivooStore';
import { useKaivooActions } from '@/hooks/useKaivooActions';
import { toast } from 'sonner';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';

interface MeetingDetailsDrawerProps {
  meetingId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const MeetingDetailsDrawer = ({ meetingId, open, onOpenChange }: MeetingDetailsDrawerProps) => {
  const { meetings } = useKaivooStore();
  const { updateMeeting, deleteMeeting } = useKaivooActions();

  const meeting = useMemo(() => meetings.find(m => m.id === meetingId), [meetings, meetingId]);
  
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
      icon: <Check className="w-4 h-4" />,
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
    updateMeeting(meeting.id, { attendees: attendees.filter(a => a !== attendee) });
    showSavedFeedback();
  };

  const handleDelete = () => {
    deleteMeeting(meeting.id);
    onOpenChange(false);
  };

  const isZoom = location.toLowerCase().includes('zoom');

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto bg-gradient-to-b from-panel-meeting-from to-panel-meeting-to border-l-4 border-panel-meeting-accent/30">
        <SheetHeader className="space-y-4 pb-4 mb-2">
          <SheetTitle className="sr-only">Edit Meeting</SheetTitle>
          <div className="flex items-start gap-2">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleTitleBlur}
              className="text-lg font-semibold border-0 px-0 focus-visible:ring-0 shadow-none flex-1 bg-transparent"
              placeholder="Meeting title"
            />
          </div>
          
          {/* Date & Time display */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>{format(meeting.startTime, 'EEEE, MMMM d, yyyy')}</span>
            <span className="mx-1">•</span>
            <Clock className="w-4 h-4" />
            <span>{format(meeting.startTime, 'h:mm a')} - {format(meeting.endTime, 'h:mm a')}</span>
          </div>
        </SheetHeader>

        <div className="py-6 space-y-4">
          {/* Date Picker */}
          <div className="bg-panel-meeting-section rounded-xl p-4 space-y-2 shadow-sm">
            <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              Date
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="sm" className="w-full justify-start text-left font-normal bg-card/50 hover:bg-card">
                  {selectedDate ? format(selectedDate, 'PPP') : 'Pick a date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleDateChange}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Time */}
          <div className="bg-panel-meeting-section rounded-xl p-4 space-y-2 shadow-sm">
            <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              Time
            </label>
            <div className="flex items-center gap-2">
              <Input
                type="time"
                value={startTime}
                onChange={(e) => handleTimeChange('start', e.target.value)}
                className="flex-1 bg-card/50 border-0"
              />
              <span className="text-muted-foreground">to</span>
              <Input
                type="time"
                value={endTime}
                onChange={(e) => handleTimeChange('end', e.target.value)}
                className="flex-1 bg-card/50 border-0"
              />
            </div>
          </div>

          {/* Location */}
          <div className="bg-panel-meeting-section rounded-xl p-4 space-y-2 shadow-sm">
            <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              {isZoom ? <Video className="w-3.5 h-3.5" /> : <MapPin className="w-3.5 h-3.5" />}
              Location
            </label>
            <Input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              onBlur={handleLocationBlur}
              placeholder="Add location or video link..."
              className="bg-card/50 border-0"
            />
          </div>

          {/* Description */}
          <div className="bg-panel-meeting-section rounded-xl p-4 space-y-2 shadow-sm">
            <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" />
              Description
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onBlur={handleDescriptionBlur}
              placeholder="Add meeting notes or agenda..."
              className="min-h-[100px] resize-none bg-card/50 border-0"
            />
          </div>

          {/* Attendees */}
          <div className="bg-panel-meeting-section rounded-xl p-4 space-y-2 shadow-sm">
            <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" />
              Attendees
            </label>
            <div className="flex flex-wrap gap-1.5">
              {(meeting.attendees || []).map(attendee => (
                <Badge 
                  key={attendee} 
                  variant="secondary" 
                  className="text-xs cursor-pointer hover:bg-destructive/10 hover:text-destructive transition-colors bg-card/80"
                  onClick={() => handleRemoveAttendee(attendee)}
                >
                  {attendee} <XIcon className="w-2.5 h-2.5 ml-1" />
                </Badge>
              ))}
              <div className="flex items-center gap-1">
                <Input
                  value={newAttendee}
                  onChange={(e) => setNewAttendee(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddAttendee()}
                  placeholder="Add attendee..."
                  className="h-6 text-xs w-28 px-2 bg-card/50 border-0"
                />
                <Button variant="ghost" size="icon" aria-label="Add attendee" className="h-6 w-6" onClick={handleAddAttendee}>
                  <Plus className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </div>

          {/* Source indicator */}
          {meeting.isExternal && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground px-1">
              <span className="capitalize">From {meeting.source}</span>
            </div>
          )}
        </div>

        {/* Delete button */}
        <div className="pt-4 border-t border-border mt-auto">
          <Button 
            variant="ghost" 
            className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={handleDelete}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete meeting
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MeetingDetailsDrawer;
