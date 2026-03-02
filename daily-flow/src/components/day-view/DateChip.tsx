import { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, isToday, isTomorrow, isYesterday } from 'date-fns';
import { cn } from '@/lib/utils';

interface DateChipProps {
  date: string | Date;
  className?: string;
  showRelative?: boolean;
}

const DateChip = memo(({ date, className, showRelative = true }: DateChipProps) => {
  const navigate = useNavigate();
  const d = typeof date === 'string' ? new Date(date + 'T00:00:00') : date;

  let label: string;
  if (showRelative && isToday(d)) {
    label = 'Today';
  } else if (showRelative && isTomorrow(d)) {
    label = 'Tomorrow';
  } else if (showRelative && isYesterday(d)) {
    label = 'Yesterday';
  } else {
    label = format(d, 'MMM d');
  }

  const dateParam = format(d, 'yyyy-MM-dd');

  return (
    <button
      onClick={() => navigate(`/?date=${dateParam}`)}
      className={cn(
        'inline-flex items-center rounded-lg px-2 py-0.5 text-xs font-medium',
        'cursor-pointer bg-primary/10 text-primary transition-colors hover:bg-primary/20',
        className,
      )}
    >
      {label}
    </button>
  );
});
DateChip.displayName = 'DateChip';

export default DateChip;
