import { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Calendar, Plus, ListTodo, Users, Layers, Video, MapPin, Clock, ChevronLeft, ChevronRight, PanelLeftClose, PanelLeft, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarUI } from '@/components/ui/calendar';
import { useKaivooStore } from '@/stores/useKaivooStore';
import { useKaivooActions } from '@/hooks/useKaivooActions';
import { format, isSameDay, addDays } from 'date-fns';
import { cn } from '@/lib/utils';
import DayReview from '@/components/DayReview';

type CalendarMode = 'tasks' | 'meetings' | 'combined' | 'review';

const CalendarPage = () => {
  const [mode, setMode] = useState<CalendarMode>('combined');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showCalendarPanel, setShowCalendarPanel] = useState(true);
  const tasks = useKaivooStore(s => s.tasks);
  const getMeetingsForDate = useKaivooStore(s => s.getMeetingsForDate);
  const getJournalEntriesForDate = useKaivooStore(s => s.getJournalEntriesForDate);
  const routines = useKaivooStore(s => s.routines);
  const getCompletionsForDate = useKaivooStore(s => s.getCompletionsForDate);
  const getTasksForDate = useKaivooStore(s => s.getTasksForDate);
  const getCapturesForDate = useKaivooStore(s => s.getCapturesForDate);
  const { toggleRoutineCompletion } = useKaivooActions();

  const selectedMeetings = getMeetingsForDate(selectedDate);
  const isToday = isSameDay(selectedDate, new Date());
  const dateStr = format(selectedDate, 'yyyy-MM-dd');
  
  // Get journal entries and captures for selected date
  const journalEntries = getJournalEntriesForDate(dateStr);
  const captures = getCapturesForDate(dateStr);
  const routineCompletions = getCompletionsForDate(dateStr);
  const { pending: pendingTasks, completed: completedTasks } = getTasksForDate(selectedDate);
  
  // Use tasks from getTasksForDate for proper date-based filtering
  const selectedTasks = [...pendingTasks, ...completedTasks];

  const formatTime = (date: Date | string) => format(new Date(date), 'h:mm a');
  const formatDuration = (start: Date | string, end: Date | string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const mins = (endDate.getTime() - startDate.getTime()) / 60000;
    if (mins < 60) return `${mins}m`;
    const hours = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    return remainingMins > 0 ? `${hours}h ${remainingMins}m` : `${hours}h`;
  };

  const modeButtons = [
    { mode: 'tasks' as CalendarMode, icon: ListTodo, label: 'Tasks' },
    { mode: 'meetings' as CalendarMode, icon: Users, label: 'Meetings' },
    { mode: 'combined' as CalendarMode, icon: Layers, label: 'Combined' },
    { mode: 'review' as CalendarMode, icon: BookOpen, label: 'Day Review' },
  ];

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto px-6 py-8">
        <header className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground mb-1">Calendar</h1>
            <p className="text-sm text-muted-foreground">Your schedule and meetings</p>
          </div>
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            New Event
          </Button>
        </header>

        {/* Mode Toggle */}
        <div className="flex items-center gap-2 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowCalendarPanel(!showCalendarPanel)}
            className="gap-2 mr-2"
          >
            {showCalendarPanel ? (
              <PanelLeftClose className="w-4 h-4" />
            ) : (
              <PanelLeft className="w-4 h-4" />
            )}
            <span className="hidden sm:inline">{showCalendarPanel ? 'Hide' : 'Show'} Calendar</span>
          </Button>
          <div className="h-6 w-px bg-border" />
          {modeButtons.map(({ mode: m, icon: Icon, label }) => (
            <Button
              key={m}
              variant={mode === m ? 'default' : 'outline'}
              size="sm"
              onClick={() => setMode(m)}
              className="gap-2"
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{label}</span>
            </Button>
          ))}
        </div>

        <div className={cn(
          "grid gap-6 transition-all duration-300",
          showCalendarPanel ? "grid-cols-1 lg:grid-cols-[320px_1fr]" : "grid-cols-1"
        )}>
          {/* Calendar Picker - Collapsible */}
          {showCalendarPanel && (
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
          )}

          {/* Day View */}
          <div className="space-y-4">
            {/* Selected Date Header */}
            <div className="widget-card">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Button variant="ghost" size="icon" aria-label="Previous day" onClick={() => setSelectedDate(addDays(selectedDate, -1))}>
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">
                      {format(selectedDate, 'EEEE, MMMM d')}
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      {isToday ? "Today" : format(selectedDate, 'yyyy')}
                    </p>
                  </div>
                  <Button variant="ghost" size="icon" aria-label="Next day" onClick={() => setSelectedDate(addDays(selectedDate, 1))}>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
                {!isToday && (
                  <Button variant="outline" size="sm" onClick={() => setSelectedDate(new Date())}>
                    Today
                  </Button>
                )}
              </div>

              {/* Day Review Mode */}
              {mode === 'review' && (
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
              )}

              {/* Meetings Section */}
              {(mode === 'meetings' || mode === 'combined') && (
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Users className="w-4 h-4 text-primary" />
                    <h3 className="text-sm font-medium text-foreground">Meetings</h3>
                    <span className="text-xs text-muted-foreground">({selectedMeetings.length})</span>
                  </div>
                  
                  {selectedMeetings.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-4 text-center bg-secondary/30 rounded-lg">
                      No meetings scheduled
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {selectedMeetings.map((meeting) => (
                        <div
                          key={meeting.id}
                          className="flex items-start gap-3 py-3 px-4 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
                        >
                          <div className="flex flex-col items-center min-w-[60px] text-center">
                            <span className="text-sm font-medium text-foreground">
                              {formatTime(meeting.startTime)}
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              {formatDuration(meeting.startTime, meeting.endTime)}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground">{meeting.title}</p>
                            {meeting.location && (
                              <div className="flex items-center gap-1.5 mt-1">
                                {meeting.location.toLowerCase().includes('zoom') ? (
                                  <Video className="w-3 h-3 text-muted-foreground" />
                                ) : (
                                  <MapPin className="w-3 h-3 text-muted-foreground" />
                                )}
                                <span className="text-xs text-muted-foreground">{meeting.location}</span>
                              </div>
                            )}
                            {meeting.attendees && meeting.attendees.length > 0 && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {meeting.attendees.join(', ')}
                              </p>
                            )}
                          </div>
                          {meeting.isExternal && meeting.source && (
                            <span className="text-[10px] px-2 py-0.5 bg-primary/10 text-primary rounded-full capitalize">
                              {meeting.source}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Tasks Section */}
              {(mode === 'tasks' || mode === 'combined') && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <ListTodo className="w-4 h-4 text-accent" />
                    <h3 className="text-sm font-medium text-foreground">Tasks</h3>
                    <span className="text-xs text-muted-foreground">
                      ({pendingTasks.length} pending, {completedTasks.length} completed)
                    </span>
                  </div>
                  
                  {selectedTasks.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-4 text-center bg-secondary/30 rounded-lg">
                      No tasks for this day
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {selectedTasks.slice(0, 5).map((task) => (
                        <div
                          key={task.id}
                          className={cn(
                            "flex items-center gap-3 py-2.5 px-4 rounded-lg transition-colors",
                            task.status === 'done' 
                              ? "bg-muted/30 opacity-60" 
                              : "bg-secondary/30 hover:bg-secondary/50"
                          )}
                        >
                          <div className={cn(
                            "w-2 h-2 rounded-full shrink-0",
                            task.priority === 'high' && "bg-destructive",
                            task.priority === 'medium' && "bg-amber-500",
                            task.priority === 'low' && "bg-muted-foreground"
                          )} />
                          <span className={cn(
                            "text-sm flex-1",
                            task.status === 'done' && "line-through text-muted-foreground"
                          )}>
                            {task.title}
                          </span>
                          {task.dueDate && (
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {task.dueDate}
                            </span>
                          )}
                        </div>
                      ))}
                      {selectedTasks.length > 5 && (
                        <p className="text-xs text-muted-foreground text-center py-2">
                          +{selectedTasks.length - 5} more tasks
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default CalendarPage;