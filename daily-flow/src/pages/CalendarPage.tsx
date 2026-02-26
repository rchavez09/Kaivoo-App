import { useState, useCallback, useMemo } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Plus, BookOpen, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarUI } from '@/components/ui/calendar';
import { useKaivooStore } from '@/stores/useKaivooStore';
import { useKaivooActions } from '@/hooks/useKaivooActions';
import { addDays, format, isSameDay, startOfMonth } from 'date-fns';
import { resolveTaskDay } from '@/lib/dateUtils';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import DayReview from '@/components/DayReview';
import MeetingDetailsDrawer from '@/components/MeetingDetailsDrawer';
import TaskDetailsDrawer from '@/components/TaskDetailsDrawer';
import { CalendarViewSwitcher, type CalendarViewMode } from '@/components/calendar/CalendarViewSwitcher';
import { MonthGrid } from '@/components/calendar/MonthGrid';
import { DayTimeline } from '@/components/calendar/DayTimeline';
import { DaySidebar } from '@/components/calendar/DaySidebar';

const CALENDAR_PREFS_KEY = 'kaivoo-calendar-preferences';

interface CalendarPrefs {
  viewMode: CalendarViewMode;
}

const DEFAULT_PREFS: CalendarPrefs = {
  viewMode: 'month',
};

const CalendarPage = () => {
  const [prefs, setPrefs] = useLocalStorage<CalendarPrefs>(CALENDAR_PREFS_KEY, DEFAULT_PREFS);
  const [viewMode, setViewMode] = useState<CalendarViewMode>(prefs.viewMode);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(startOfMonth(new Date()));
  const [showReview, setShowReview] = useState(false);
  const [meetingDrawerOpen, setMeetingDrawerOpen] = useState(false);
  const [selectedMeetingId, setSelectedMeetingId] = useState<string | null>(null);
  const [taskDrawerOpen, setTaskDrawerOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  // Subscribe to raw arrays for reactivity on add/delete
  const allMeetings = useKaivooStore(s => s.meetings);
  const allTasks = useKaivooStore(s => s.tasks);
  const getJournalEntriesForDate = useKaivooStore(s => s.getJournalEntriesForDate);
  const routines = useKaivooStore(s => s.routines);
  const getCompletionsForDate = useKaivooStore(s => s.getCompletionsForDate);
  const getCapturesForDate = useKaivooStore(s => s.getCapturesForDate);
  const { addMeeting, toggleRoutineCompletion } = useKaivooActions();

  // Day view data — derived from raw arrays for immediate reactivity
  const meetings = useMemo(() =>
    allMeetings
      .filter(m => isSameDay(new Date(m.startTime), selectedDate))
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()),
    [allMeetings, selectedDate],
  );
  const { pendingTasks, completedTasks } = useMemo(() => {
    const pending = allTasks.filter(t => {
      if (t.status === 'done') return false;
      const day = resolveTaskDay(t);
      return day ? isSameDay(day, selectedDate) : false;
    });
    const completed = allTasks.filter(t => {
      if (t.status !== 'done') return false;
      const day = resolveTaskDay(t);
      return day ? isSameDay(day, selectedDate) : false;
    });
    return { pendingTasks: pending, completedTasks: completed };
  }, [allTasks, selectedDate]);
  const dateStr = format(selectedDate, 'yyyy-MM-dd');
  const journalEntries = getJournalEntriesForDate(dateStr);
  const captures = getCapturesForDate(dateStr);
  const routineCompletions = getCompletionsForDate(dateStr);
  const isToday = isSameDay(selectedDate, new Date());

  const handleViewModeChange = useCallback((mode: CalendarViewMode) => {
    setViewMode(mode);
    setPrefs((prev) => ({ ...prev, viewMode: mode }));
    setShowReview(false);
  }, [setPrefs]);

  const handleDateSelect = useCallback((date: Date) => {
    setSelectedDate(date);
  }, []);

  const handleMonthChange = useCallback((month: Date) => {
    setCurrentMonth(month);
  }, []);

  const handleMeetingClick = useCallback((id: string) => {
    setSelectedMeetingId(id);
    setMeetingDrawerOpen(true);
  }, []);

  const handleTaskClick = useCallback((id: string) => {
    setSelectedTaskId(id);
    setTaskDrawerOpen(true);
  }, []);

  const handleNewEvent = useCallback(() => {
    const startTime = new Date(selectedDate);
    const now = new Date();
    // Default to next hour from now (or 9 AM if viewing another day)
    if (isToday) {
      startTime.setHours(now.getHours() + 1, 0, 0, 0);
    } else {
      startTime.setHours(9, 0, 0, 0);
    }
    const endTime = new Date(startTime);
    endTime.setHours(startTime.getHours() + 1);

    void addMeeting({
      title: 'New Event',
      startTime,
      endTime,
      isExternal: false,
      source: 'manual',
    }).then((meeting) => {
      if (meeting) {
        setSelectedMeetingId(meeting.id);
        setMeetingDrawerOpen(true);
      }
    });
  }, [selectedDate, isToday, addMeeting]);

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <header className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground mb-1">Calendar</h1>
            <p className="text-sm text-muted-foreground">Your schedule and meetings</p>
          </div>
          <div className="flex items-center gap-3">
            <CalendarViewSwitcher viewMode={viewMode} onViewModeChange={handleViewModeChange} />
            <Button className="gap-2" onClick={handleNewEvent}>
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">New Event</span>
            </Button>
          </div>
        </header>

        {/* Month View */}
        {viewMode === 'month' && (
          <div className="grid gap-6 grid-cols-1 lg:grid-cols-[1fr_320px]">
            <MonthGrid
              currentMonth={currentMonth}
              selectedDate={selectedDate}
              onMonthChange={handleMonthChange}
              onDateSelect={handleDateSelect}
            />
            <DaySidebar
              selectedDate={selectedDate}
              onMeetingClick={handleMeetingClick}
              onTaskClick={handleTaskClick}
            />
          </div>
        )}

        {/* Day View */}
        {viewMode === 'day' && (
          <div className="grid gap-6 grid-cols-1 lg:grid-cols-[280px_1fr]">
            {/* Mini calendar sidebar */}
            <div className="space-y-4">
              <div className="widget-card p-4 h-fit">
                <CalendarUI
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  className="pointer-events-auto w-full"
                  classNames={{
                    months: "flex flex-col w-full",
                    month: "space-y-4 w-full",
                    caption: "flex justify-center pt-1 relative items-center",
                    caption_label: "text-sm font-medium",
                    nav: "space-x-1 flex items-center",
                    nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 inline-flex items-center justify-center rounded-md border border-input hover:bg-accent hover:text-accent-foreground",
                    nav_button_previous: "absolute left-1",
                    nav_button_next: "absolute right-1",
                    table: "w-full border-collapse",
                    head_row: "flex w-full",
                    head_cell: "text-muted-foreground rounded-md flex-1 font-normal text-[0.8rem] text-center",
                    row: "flex w-full mt-2",
                    cell: "flex-1 aspect-square text-center text-sm p-0 relative focus-within:relative focus-within:z-20",
                    day: "h-full w-full p-0 font-normal hover:bg-accent hover:text-accent-foreground rounded-md flex items-center justify-center text-sm",
                    day_range_end: "day-range-end",
                    day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                    day_today: "bg-accent text-accent-foreground",
                    day_outside: "day-outside text-muted-foreground opacity-50",
                    day_disabled: "text-muted-foreground opacity-50",
                    day_hidden: "invisible",
                  }}
                />
              </div>
            </div>

            {/* Day content */}
            <div className="space-y-4">
              {/* Date header with navigation */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Button variant="ghost" size="icon" aria-label="Previous day" onClick={() => setSelectedDate(addDays(selectedDate, -1))}>
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">
                      {format(selectedDate, 'EEEE, MMMM d')}
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      {isToday ? 'Today' : format(selectedDate, 'yyyy')}
                    </p>
                  </div>
                  <Button variant="ghost" size="icon" aria-label="Next day" onClick={() => setSelectedDate(addDays(selectedDate, 1))}>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  {!isToday && (
                    <Button variant="outline" size="sm" onClick={() => setSelectedDate(new Date())}>
                      Today
                    </Button>
                  )}
                  <Button
                    variant={showReview ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setShowReview(!showReview)}
                    className="gap-1.5"
                  >
                    <BookOpen className="w-4 h-4" />
                    <span className="hidden sm:inline">Review</span>
                  </Button>
                </div>
              </div>

              {/* Day Review or Timeline */}
              {showReview ? (
                <div className="widget-card">
                  <DayReview
                    date={selectedDate}
                    journalEntries={journalEntries}
                    tasks={pendingTasks}
                    completedTasks={completedTasks}
                    routines={routines}
                    routineCompletions={routineCompletions}
                    captures={captures}
                    onToggleRoutine={toggleRoutineCompletion}
                  />
                </div>
              ) : (
                <DayTimeline
                  date={selectedDate}
                  meetings={meetings}
                  pendingTasks={pendingTasks}
                  completedTasks={completedTasks}
                  onMeetingClick={handleMeetingClick}
                  onTaskClick={handleTaskClick}
                />
              )}
            </div>
          </div>
        )}
      </div>

      {/* Meeting Details Drawer */}
      <MeetingDetailsDrawer
        meetingId={selectedMeetingId}
        open={meetingDrawerOpen}
        onOpenChange={setMeetingDrawerOpen}
      />

      {/* Task Details Drawer */}
      <TaskDetailsDrawer
        taskId={selectedTaskId}
        open={taskDrawerOpen}
        onOpenChange={setTaskDrawerOpen}
      />
    </AppLayout>
  );
};

export default CalendarPage;
