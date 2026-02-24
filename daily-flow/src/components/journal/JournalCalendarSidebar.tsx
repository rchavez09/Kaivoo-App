import { useState, useMemo, ReactNode } from 'react';
import { format, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, addMonths, subMonths } from 'date-fns';
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useKaivooStore } from '@/stores/useKaivooStore';
import { cn } from '@/lib/utils';
import type { CanvasSection } from './JournalCanvas';

interface JournalCalendarSidebarProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  sections: CanvasSection[];
  onSectionClick: (entryId: string) => void;
  activeSectionId?: string | null;
  children?: ReactNode;
}

const JournalCalendarSidebar = ({
  selectedDate, onDateSelect, sections, onSectionClick, activeSectionId, children,
}: JournalCalendarSidebarProps) => {
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(selectedDate));
  const journalEntries = useKaivooStore(s => s.journalEntries);

  // Days with journal entries (captures removed — journal-only focus)
  const daysWithEntries = useMemo(() => {
    const set = new Set<string>();
    journalEntries.forEach(entry => set.add(entry.date));
    return set;
  }, [journalEntries]);

  // Calendar grid
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  return (
    <div className="w-72 border-l border-border bg-sidebar flex flex-col h-full">
      {/* Mini Calendar */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <Button
            variant="ghost" size="icon"
            aria-label="Previous month"
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="h-7 w-7"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium">{format(currentMonth, 'MMMM yyyy')}</span>
          <Button
            variant="ghost" size="icon"
            aria-label="Next month"
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="h-7 w-7"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-1">
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
            <div key={day} className="text-center text-xs text-muted-foreground font-medium py-1">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1" role="grid" aria-label="Calendar">
          {calendarDays.map(day => {
            const dayStr = format(day, 'yyyy-MM-dd');
            const isCurrentMonth = day.getMonth() === currentMonth.getMonth();
            const isSelected = isSameDay(day, selectedDate);
            const isDayToday = isSameDay(day, new Date());
            const hasEntries = daysWithEntries.has(dayStr);

            return (
              <button
                key={dayStr}
                onClick={() => onDateSelect(day)}
                aria-label={`${format(day, 'MMMM d, yyyy')}${hasEntries ? ', has entries' : ''}`}
                className={cn(
                  "h-8 w-8 rounded-full text-xs flex items-center justify-center relative transition-colors",
                  !isCurrentMonth && "text-muted-foreground/40",
                  isCurrentMonth && "hover:bg-accent",
                  isSelected && "bg-primary text-primary-foreground hover:bg-primary",
                  isDayToday && !isSelected && "border border-primary",
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

      {/* Section anchors + details */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="px-4 py-3 border-b border-border">
          <h3 className="text-sm font-medium">
            {isSameDay(selectedDate, new Date()) ? "Today's Sections" : format(selectedDate, 'MMM d') + ' Sections'}
          </h3>
          <p className="text-xs text-muted-foreground">
            {sections.length} {sections.length === 1 ? 'section' : 'sections'}
          </p>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-3 space-y-1">
            {sections.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <Clock className="h-6 w-6 mx-auto mb-2 opacity-50" />
                <p className="text-xs">Start writing to create your first section</p>
              </div>
            ) : (
              sections.map((section) => (
                <button
                  key={section.entryId}
                  onClick={() => onSectionClick(section.entryId)}
                  className={cn(
                    "w-full text-left px-3 py-2 rounded-md transition-colors text-sm flex items-center gap-2",
                    activeSectionId === section.entryId
                      ? "bg-accent text-accent-foreground"
                      : "hover:bg-accent/50 text-muted-foreground"
                  )}
                  aria-label={`Jump to section at ${format(section.timestamp, 'h:mm a')}`}
                >
                  <Clock className="w-3.5 h-3.5 shrink-0" />
                  {format(section.timestamp, 'h:mm a')}
                </button>
              ))
            )}
          </div>

          {/* Details panel (passed as children) */}
          {children}
        </ScrollArea>
      </div>
    </div>
  );
};

export default JournalCalendarSidebar;
