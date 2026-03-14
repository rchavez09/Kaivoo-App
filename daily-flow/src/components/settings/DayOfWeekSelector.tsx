import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface DayOfWeekSelectorProps {
  value: number[]; // [0-6] where 0=Sunday, 6=Saturday
  onChange: (days: number[]) => void;
}

const DAYS = [
  { index: 0, abbr: 'Su', name: 'Sunday' },
  { index: 1, abbr: 'Mo', name: 'Monday' },
  { index: 2, abbr: 'Tu', name: 'Tuesday' },
  { index: 3, abbr: 'We', name: 'Wednesday' },
  { index: 4, abbr: 'Th', name: 'Thursday' },
  { index: 5, abbr: 'Fr', name: 'Friday' },
  { index: 6, abbr: 'Sa', name: 'Saturday' },
];

export function DayOfWeekSelector({ value, onChange }: DayOfWeekSelectorProps) {
  const toggleDay = (dayIndex: number) => {
    if (value.includes(dayIndex)) {
      onChange(value.filter((d) => d !== dayIndex));
    } else {
      onChange([...value, dayIndex].sort());
    }
  };

  const selectWeekdays = () => onChange([1, 2, 3, 4, 5]);
  const selectWeekends = () => onChange([0, 6]);
  const selectEveryDay = () => onChange([0, 1, 2, 3, 4, 5, 6]);

  return (
    <div className="space-y-4">
      {/* Quick Presets */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={selectWeekdays}
          aria-label="Select weekdays (Monday through Friday)"
        >
          Weekdays
        </Button>
        <Button variant="outline" size="sm" onClick={selectWeekends} aria-label="Select weekends (Saturday and Sunday)">
          Weekends
        </Button>
        <Button variant="outline" size="sm" onClick={selectEveryDay} aria-label="Select every day (all 7 days)">
          Every day
        </Button>
      </div>

      {/* Day Toggles */}
      <div role="group" aria-labelledby="day-selector-label">
        <span id="day-selector-label" className="sr-only">
          Days of week
        </span>
        <div className="flex gap-3">
          {DAYS.map(({ index, abbr, name }) => {
            const isSelected = value.includes(index);
            return (
              <Button
                key={index}
                variant={isSelected ? 'default' : 'outline'}
                size="icon"
                aria-pressed={isSelected}
                aria-label={`${name}, ${isSelected ? 'selected' : 'not selected'}`}
                onClick={() => toggleDay(index)}
                className={cn(
                  'h-11 w-11', // 44x44px touch target (WCAG 2.5.8)
                  isSelected && 'font-semibold', // Visual reinforcement (not color-only)
                )}
              >
                {abbr}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Optional: Live region for screen reader summary */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {value.length === 0 && 'No days selected'}
        {value.length === 7 && 'All days selected'}
        {value.length > 0 && value.length < 7 && `${value.length} day${value.length > 1 ? 's' : ''} selected`}
      </div>
    </div>
  );
}
