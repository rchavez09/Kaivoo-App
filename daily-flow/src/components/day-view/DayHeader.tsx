import { memo, useCallback, useEffect } from 'react';
import { format, addDays, subDays, isToday } from 'date-fns';
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';

interface DayHeaderProps {
  date: Date;
  onDateChange: (date: Date) => void;
}

const DayHeader = memo(({ date, onDateChange }: DayHeaderProps) => {
  const formattedDate = format(date, 'EEEE, MMMM d, yyyy');
  const isTodayDate = isToday(date);

  const goBack = useCallback(() => onDateChange(subDays(date, 1)), [date, onDateChange]);
  const goForward = useCallback(() => onDateChange(addDays(date, 1)), [date, onDateChange]);
  const goToday = useCallback(() => onDateChange(new Date()), [onDateChange]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === 'ArrowLeft') goBack();
      else if (e.key === 'ArrowRight') goForward();
      else if (e.key.toLowerCase() === 't' && !e.metaKey && !e.ctrlKey) goToday();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [goBack, goForward, goToday]);

  return (
    <header className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">
          {isTodayDate ? 'Today' : format(date, 'EEEE')}
        </h1>
        <p className="text-sm text-muted-foreground">{formattedDate}</p>
      </div>

      <div className="flex items-center gap-1">
        {!isTodayDate && (
          <Button variant="outline" size="sm" onClick={goToday} className="mr-2 text-xs">
            Today
          </Button>
        )}
        <Button variant="ghost" size="icon" onClick={goBack} className="h-8 w-8" aria-label="Previous day">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Pick date">
              <CalendarDays className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(d) => d && onDateChange(d)}
              initialFocus
            />
          </PopoverContent>
        </Popover>
        <Button variant="ghost" size="icon" onClick={goForward} className="h-8 w-8" aria-label="Next day">
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
});
DayHeader.displayName = 'DayHeader';

export default DayHeader;
