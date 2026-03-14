import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, X } from 'lucide-react';

interface TimePickerListProps {
  value: string[]; // ["06:00", "12:00", "20:24"]
  onChange: (times: string[]) => void;
  maxTimes?: number; // default 3
}

export function TimePickerList({ value, onChange, maxTimes = 3 }: TimePickerListProps) {
  const addTime = () => {
    if (value.length < maxTimes) {
      onChange([...value, '08:00']); // Default to 8:00 AM
    }
  };

  const removeTime = (index: number) => {
    // Require at least 1 time
    if (value.length > 1) {
      onChange(value.filter((_, i) => i !== index));
    }
  };

  const updateTime = (index: number, newTime: string) => {
    const updated = [...value];
    updated[index] = newTime;
    onChange(updated);
  };

  return (
    <div className="space-y-3">
      <Label>At these times:</Label>

      {/* Time inputs */}
      {value.map((time, index) => (
        <div key={index} className="flex items-center gap-2">
          <Input
            type="time"
            value={time}
            onChange={(e) => updateTime(index, e.target.value)}
            className="w-32"
            aria-label={`Time ${index + 1}`}
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => removeTime(index)}
            aria-label={`Remove time ${time}`}
            disabled={value.length === 1} // Require at least 1 time
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ))}

      {/* Add time button */}
      {value.length < maxTimes && (
        <Button variant="outline" size="sm" onClick={addTime} className="w-full">
          <Plus className="mr-2 h-4 w-4" />
          Add time (max {maxTimes})
        </Button>
      )}

      {/* Help text */}
      {value.length > 0 && (
        <p className="text-sm text-muted-foreground">
          Heartbeat will run {value.length} time{value.length > 1 ? 's' : ''} per day on selected days.
        </p>
      )}
    </div>
  );
}
