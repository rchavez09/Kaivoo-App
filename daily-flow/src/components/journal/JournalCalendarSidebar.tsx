import { useState, useMemo, ReactNode } from 'react';
import {
  format,
  isSameDay,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  startOfWeek,
  endOfWeek,
  addMonths,
  subMonths,
} from 'date-fns';
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
  selectedDate,
  onDateSelect,
  sections,
  onSectionClick,
  activeSectionId,
  children,
}: JournalCalendarSidebarProps) => {
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(selectedDate));
  const journalEntries = useKaivooStore((s) => s.journalEntries);

  // Days with journal entries (captures removed — journal-only focus)
  const daysWithEntries = useMemo(() => {
    const set = new Set<string>();
    journalEntries.forEach((entry) => set.add(entry.date));
    return set;
  }, [journalEntries]);

  // Calendar grid
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  return (
    <div className="flex h-full w-72 flex-col border-l border-border bg-sidebar">
      {/* Mini Calendar */}
      <div className="border-b border-border p-4">
        <div className="mb-3 flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Previous month"
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="h-7 w-7"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium">{format(currentMonth, 'MMMM yyyy')}</span>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Next month"
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="h-7 w-7"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="mb-1 grid grid-cols-7 gap-1">
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
            <div key={day} className="py-1 text-center text-xs font-medium text-muted-foreground">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1" role="grid" aria-label="Calendar">
          {calendarDays.map((day) => {
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
                  'relative flex h-8 w-8 items-center justify-center rounded-full text-xs transition-colors',
                  !isCurrentMonth && 'text-muted-foreground/40',
                  isCurrentMonth && 'hover:bg-accent',
                  isSelected && 'bg-primary text-primary-foreground hover:bg-primary',
                  isDayToday && !isSelected && 'border border-primary',
                )}
              >
                {format(day, 'd')}
                {hasEntries && !isSelected && (
                  <span className="absolute bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-primary" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Section anchors + details */}
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="border-b border-border px-4 py-3">
          <h3 className="text-sm font-medium">
            {isSameDay(selectedDate, new Date()) ? "Today's Sections" : format(selectedDate, 'MMM d') + ' Sections'}
          </h3>
          <p className="text-xs text-muted-foreground">
            {sections.length} {sections.length === 1 ? 'section' : 'sections'}
          </p>
        </div>

        <ScrollArea className="flex-1">
          <div className="space-y-1 p-3">
            {sections.length === 0 ? (
              <div className="py-6 text-center text-muted-foreground">
                <Clock className="mx-auto mb-2 h-6 w-6 opacity-50" />
                <p className="text-xs">Start writing to create your first section</p>
              </div>
            ) : (
              sections.map((section) => (
                <button
                  key={section.entryId}
                  onClick={() => onSectionClick(section.entryId)}
                  className={cn(
                    'flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors',
                    activeSectionId === section.entryId
                      ? 'bg-accent text-accent-foreground'
                      : 'text-muted-foreground hover:bg-accent/50',
                  )}
                  aria-label={`Jump to section at ${format(section.timestamp, 'h:mm a')}`}
                >
                  <Clock className="h-3.5 w-3.5 shrink-0" />
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
