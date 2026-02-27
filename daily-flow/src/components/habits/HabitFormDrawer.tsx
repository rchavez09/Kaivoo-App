import { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sun } from 'lucide-react';
import { Habit, HabitType, TimeBlock, HabitSchedule } from '@/types';
import { cn } from '@/lib/utils';
import { iconMap, availableIcons } from '@/components/widgets/tracking/tracking-types';

const HABIT_COLORS = [
  '#3B8C8C', '#E06040', '#6B7FD7', '#D4A843',
  '#7CB56B', '#C77DBA', '#5BA0C9', '#8B8B8B',
];

const DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

interface HabitFormDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  habit?: Habit; // If provided, edit mode
  onSave: (data: {
    name: string;
    icon: string;
    color: string;
    type: HabitType;
    timeBlock: TimeBlock;
    schedule: HabitSchedule;
    targetCount?: number;
  }) => void | Promise<void>;
}

const HabitFormDrawer = ({ open, onOpenChange, habit, onSave }: HabitFormDrawerProps) => {
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('sun');
  const [color, setColor] = useState(HABIT_COLORS[0]);
  const [type, setType] = useState<HabitType>('positive');
  const [timeBlock, setTimeBlock] = useState<TimeBlock>('anytime');
  const [scheduleType, setScheduleType] = useState<HabitSchedule['type']>('daily');
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [timesPerWeek, setTimesPerWeek] = useState(3);
  const [targetCount, setTargetCount] = useState(8);

  useEffect(() => {
    if (habit) {
      setName(habit.name);
      setIcon(habit.icon || 'sun');
      setColor(habit.color);
      setType(habit.type);
      setTimeBlock(habit.timeBlock);
      setScheduleType(habit.schedule.type);
      setSelectedDays(habit.schedule.days || []);
      setTimesPerWeek(habit.schedule.timesPerPeriod || 3);
      setTargetCount(habit.targetCount || 8);
    } else {
      setName('');
      setIcon('sun');
      setColor(HABIT_COLORS[0]);
      setType('positive');
      setTimeBlock('anytime');
      setScheduleType('daily');
      setSelectedDays([]);
      setTimesPerWeek(3);
      setTargetCount(8);
    }
  }, [habit, open]);

  const handleSave = () => {
    if (!name.trim()) return;

    const schedule: HabitSchedule = { type: scheduleType };
    if (scheduleType === 'specific_days') schedule.days = selectedDays;
    if (scheduleType === 'x_per_week') schedule.timesPerPeriod = timesPerWeek;

    void onSave({
      name: name.trim(),
      icon,
      color,
      type,
      timeBlock,
      schedule,
      targetCount: type === 'multi-count' ? targetCount : undefined,
    });
    onOpenChange(false);
  };

  const toggleDay = (day: number) => {
    setSelectedDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto bg-card">
        <SheetHeader className="pb-4 mb-4 border-b border-border/50">
          <SheetTitle>{habit ? 'Edit Habit' : 'New Habit'}</SheetTitle>
        </SheetHeader>

        <div className="space-y-6">
          {/* Name */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Name</label>
            <Input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Drink water, Exercise, Meditate..."
              className="text-lg font-semibold"
              autoFocus
            />
          </div>

          {/* Type */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Type</label>
            <div className="flex gap-2">
              {(['positive', 'negative', 'multi-count'] as HabitType[]).map(t => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
                    type === t
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-muted-foreground hover:text-foreground'
                  )}
                >
                  {t === 'positive' ? 'Positive' : t === 'negative' ? 'Negative' : 'Multi-count'}
                </button>
              ))}
            </div>
          </div>

          {/* Time block */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Time of day</label>
            <div className="flex gap-2">
              {(['morning', 'afternoon', 'evening', 'anytime'] as TimeBlock[]).map(tb => (
                <button
                  key={tb}
                  onClick={() => setTimeBlock(tb)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-all',
                    timeBlock === tb
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-muted-foreground hover:text-foreground'
                  )}
                >
                  {tb}
                </button>
              ))}
            </div>
          </div>

          {/* Icon */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Icon</label>
            <div className="flex flex-wrap gap-2">
              {availableIcons.map(iconKey => {
                const IconComponent = iconMap[iconKey] || Sun;
                return (
                  <button
                    key={iconKey}
                    onClick={() => setIcon(iconKey)}
                    className={cn(
                      'w-10 h-10 rounded-lg flex items-center justify-center transition-all',
                      icon === iconKey
                        ? 'ring-2 ring-primary'
                        : 'bg-secondary hover:bg-secondary/80'
                    )}
                    style={icon === iconKey ? {
                      backgroundColor: `${color}1A`,
                      color: color,
                    } : undefined}
                    aria-label={iconKey}
                  >
                    <IconComponent className="w-5 h-5" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Color */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Color</label>
            <div className="flex gap-2">
              {HABIT_COLORS.map(c => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={cn(
                    'w-8 h-8 rounded-full transition-all',
                    color === c ? 'ring-2 ring-offset-2 ring-primary' : ''
                  )}
                  style={{ backgroundColor: c }}
                  aria-label={`Color ${c}`}
                />
              ))}
            </div>
          </div>

          {/* Schedule */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Schedule</label>
            <div className="flex gap-2 mb-3">
              {(['daily', 'specific_days', 'x_per_week'] as HabitSchedule['type'][]).map(st => (
                <button
                  key={st}
                  onClick={() => setScheduleType(st)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
                    scheduleType === st
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-muted-foreground hover:text-foreground'
                  )}
                >
                  {st === 'daily' ? 'Daily' : st === 'specific_days' ? 'Specific Days' : 'X per Week'}
                </button>
              ))}
            </div>

            {scheduleType === 'specific_days' && (
              <div className="flex gap-1.5">
                {DAYS.map((day, idx) => (
                  <button
                    key={idx}
                    onClick={() => toggleDay(idx)}
                    className={cn(
                      'w-9 h-9 rounded-lg text-sm font-medium transition-all',
                      selectedDays.includes(idx)
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-muted-foreground hover:text-foreground'
                    )}
                  >
                    {day}
                  </button>
                ))}
              </div>
            )}

            {scheduleType === 'x_per_week' && (
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min={1}
                  max={7}
                  value={timesPerWeek}
                  onChange={e => setTimesPerWeek(Number(e.target.value))}
                  className="w-20"
                />
                <span className="text-sm text-muted-foreground">times per week</span>
              </div>
            )}
          </div>

          {/* Target count (multi-count only) */}
          {type === 'multi-count' && (
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                Times per day
              </label>
              <Input
                type="number"
                min={1}
                max={99}
                value={targetCount}
                onChange={e => setTargetCount(Number(e.target.value))}
                className="w-24"
              />
            </div>
          )}

          {/* Save */}
          <Button onClick={handleSave} className="w-full" disabled={!name.trim()}>
            {habit ? 'Save Changes' : 'Create Habit'}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default HabitFormDrawer;
