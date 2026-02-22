import { useState, useMemo } from 'react';
import { format, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, addMonths, subMonths } from 'date-fns';
import { ChevronLeft, ChevronRight, BookOpen, Plus, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useKaivooStore } from '@/stores/useKaivooStore';
import { JournalEntry } from '@/types';
import { cn } from '@/lib/utils';

interface JournalCalendarSidebarProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  onEntrySelect?: (entry: JournalEntry) => void;
  onNewEntry?: () => void;
  activeEntryId?: string | null;
}

const JournalCalendarSidebar = ({ selectedDate, onDateSelect, onEntrySelect, onNewEntry, activeEntryId }: JournalCalendarSidebarProps) => {
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(selectedDate));
  const { journalEntries, captures } = useKaivooStore();

  // Get days with entries
  const daysWithEntries = useMemo(() => {
    const entriesSet = new Set<string>();
    
    journalEntries.forEach(entry => {
      entriesSet.add(entry.date);
    });
    
    captures.forEach(capture => {
      entriesSet.add(capture.date);
    });
    
    return entriesSet;
  }, [journalEntries, captures]);

  // Get entries for selected date
  const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
  const entriesForDate = useMemo(() => {
    const entries = journalEntries
      .filter(e => e.date === selectedDateStr)
      .map(e => ({ ...e, type: 'journal' as const, sortTime: e.timestamp }));
    const caps = captures
      .filter(c => c.date === selectedDateStr)
      .map(c => ({ ...c, type: 'capture' as const, sortTime: c.createdAt }));
    
    return [...entries, ...caps].sort((a, b) => 
      new Date(b.sortTime).getTime() - new Date(a.sortTime).getTime()
    );
  }, [journalEntries, captures, selectedDateStr]);

  // Calendar grid
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const goToPreviousMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const goToNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  return (
    <div className="w-72 border-l border-border bg-sidebar flex flex-col h-full">
      {/* Mini Calendar */}
      <div className="p-4 border-b border-border">
        {/* Month navigation */}
        <div className="flex items-center justify-between mb-3">
          <Button variant="ghost" size="icon" aria-label="Previous month" onClick={goToPreviousMonth} className="h-7 w-7">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium">{format(currentMonth, 'MMMM yyyy')}</span>
          <Button variant="ghost" size="icon" aria-label="Next month" onClick={goToNextMonth} className="h-7 w-7">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Weekday headers */}
        <div className="grid grid-cols-7 gap-1 mb-1">
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
            <div key={day} className="text-center text-xs text-muted-foreground font-medium py-1">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map(day => {
            const dayStr = format(day, 'yyyy-MM-dd');
            const isCurrentMonth = day.getMonth() === currentMonth.getMonth();
            const isSelected = isSameDay(day, selectedDate);
            const isToday = isSameDay(day, new Date());
            const hasEntries = daysWithEntries.has(dayStr);

            return (
              <button
                key={dayStr}
                onClick={() => onDateSelect(day)}
                className={cn(
                  "h-8 w-8 rounded-full text-xs flex items-center justify-center relative transition-colors",
                  !isCurrentMonth && "text-muted-foreground/40",
                  isCurrentMonth && "hover:bg-accent",
                  isSelected && "bg-primary text-primary-foreground hover:bg-primary",
                  isToday && !isSelected && "border border-primary",
                )}
              >
                {format(day, 'd')}
                {hasEntries && !isSelected && (
                  <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Entries list for selected date */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="px-4 py-3 border-b border-border">
          <h3 className="text-sm font-medium">
            {isSameDay(selectedDate, new Date()) ? "Today's Entries" : format(selectedDate, 'MMM d, yyyy')}
          </h3>
          <p className="text-xs text-muted-foreground">{entriesForDate.length} entries</p>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-3 space-y-2">
            {entriesForDate.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No entries for this date</p>
              </div>
            ) : (
              entriesForDate.map((entry) => (
                <button
                  key={entry.id}
                  onClick={() => {
                    if (entry.type === 'journal' && onEntrySelect) {
                      const journalEntry = journalEntries.find(e => e.id === entry.id);
                      if (journalEntry) onEntrySelect(journalEntry);
                    }
                  }}
                  className={cn(
                    "w-full text-left p-2 rounded-lg transition-colors group",
                    entry.type === 'journal' ? "hover:bg-accent cursor-pointer" : "cursor-default",
                    activeEntryId === entry.id && "bg-accent ring-1 ring-primary/30"
                  )}
                >
                  <div className="flex items-start gap-2">
                    <div className={cn(
                      "w-1 min-h-[2rem] rounded-full shrink-0",
                      entry.type === 'journal' ? "bg-primary" : "bg-accent-foreground/30"
                    )} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(entry.sortTime), 'h:mm a')}
                        </p>
                        {entry.type === 'journal' && (
                          <Pencil className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        )}
                      </div>
                      <p className="text-sm line-clamp-2">
                        {entry.content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().substring(0, 100)}
                      </p>
                    </div>
                  </div>
                </button>
              ))
            )}

            {/* New Entry button */}
            <Button
              variant="ghost"
              size="sm"
              className="w-full gap-1.5 text-muted-foreground hover:text-foreground"
              onClick={onNewEntry}
            >
              <Plus className="w-3.5 h-3.5" />
              New entry for {isSameDay(selectedDate, new Date()) ? 'today' : format(selectedDate, 'MMM d')}
            </Button>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default JournalCalendarSidebar;
