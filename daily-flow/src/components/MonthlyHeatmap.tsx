import { memo, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  subMonths,
  addMonths,
  isToday,
  isFuture,
} from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useKaivooStore } from '@/stores/useKaivooStore';

type ColorMode = 'activity' | 'mood';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const MonthlyHeatmap = memo(() => {
  const navigate = useNavigate();
  const [monthOffset, setMonthOffset] = useState(0);
  const [colorMode, setColorMode] = useState<ColorMode>('activity');

  const tasks = useKaivooStore(s => s.tasks);
  const journalEntries = useKaivooStore(s => s.journalEntries);
  const routineCompletions = useKaivooStore(s => s.routineCompletions);
  const captures = useKaivooStore(s => s.captures);

  const currentMonth = useMemo(() => {
    const base = new Date();
    return monthOffset === 0 ? base : monthOffset > 0 ? addMonths(base, monthOffset) : subMonths(base, Math.abs(monthOffset));
  }, [monthOffset]);

  const days = useMemo(() =>
    eachDayOfInterval({ start: startOfMonth(currentMonth), end: endOfMonth(currentMonth) }),
    [currentMonth],
  );

  // Build per-day activity scores
  const dayScores = useMemo(() => {
    const scores = new Map<string, { activity: number; mood?: number }>();

    days.forEach(d => {
      const ds = format(d, 'yyyy-MM-dd');
      let activity = 0;

      // Tasks completed on this day
      activity += tasks.filter(t =>
        t.status === 'done' && t.completedAt && format(new Date(t.completedAt), 'yyyy-MM-dd') === ds
      ).length;

      // Journal entries on this day
      const dayEntries = journalEntries.filter(e => e.date === ds);
      activity += dayEntries.length;

      // Routine completions
      activity += (routineCompletions[ds] || []).length;

      // Captures
      activity += captures.filter(c => c.date === ds).length;

      const moodEntry = dayEntries.find(e => e.moodScore != null);

      scores.set(ds, { activity, mood: moodEntry?.moodScore });
    });

    return scores;
  }, [days, tasks, journalEntries, routineCompletions, captures]);

  const maxActivity = useMemo(() =>
    Math.max(1, ...Array.from(dayScores.values()).map(s => s.activity)),
    [dayScores],
  );

  const getColor = (dateStr: string, future: boolean) => {
    if (future) return 'bg-muted/30';
    const score = dayScores.get(dateStr);
    if (!score) return 'bg-muted/50';

    if (colorMode === 'mood' && score.mood != null) {
      const moodColors = [
        '', // 0 unused
        'bg-destructive/40', // 1 rough
        'bg-warning/40',     // 2 low
        'bg-muted',          // 3 okay
        'bg-primary/40',     // 4 good
        'bg-primary/70',     // 5 great
      ];
      return moodColors[score.mood] || 'bg-muted/50';
    }

    // Activity intensity
    const ratio = score.activity / maxActivity;
    if (ratio === 0) return 'bg-muted/50';
    if (ratio < 0.25) return 'bg-primary/20';
    if (ratio < 0.5) return 'bg-primary/40';
    if (ratio < 0.75) return 'bg-primary/60';
    return 'bg-primary/80';
  };

  const startDayOfWeek = getDay(startOfMonth(currentMonth));

  return (
    <div className="widget-card">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="widget-title">Monthly Activity</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setColorMode(colorMode === 'activity' ? 'mood' : 'activity')}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            {colorMode === 'activity' ? 'Activity' : 'Mood'}
          </button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setMonthOffset(o => o - 1)}>
            <ChevronLeft className="h-3.5 w-3.5" />
          </Button>
          <span className="text-sm font-medium min-w-[100px] text-center">
            {format(currentMonth, 'MMMM yyyy')}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setMonthOffset(o => o + 1)}
            disabled={monthOffset >= 0}
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {WEEKDAYS.map(d => (
          <div key={d} className="text-center text-[10px] text-muted-foreground font-medium">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Empty cells for offset */}
        {Array.from({ length: startDayOfWeek }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}
        {/* Day cells */}
        {days.map(d => {
          const ds = format(d, 'yyyy-MM-dd');
          const future = isFuture(d);
          const today = isToday(d);
          const score = dayScores.get(ds);
          const tooltip = score
            ? `${format(d, 'MMM d')}: ${score.activity} activities${score.mood ? `, mood: ${score.mood}/5` : ''}`
            : format(d, 'MMM d');

          return (
            <button
              key={ds}
              onClick={() => navigate(`/?date=${ds}`)}
              title={tooltip}
              className={cn(
                'aspect-square rounded-lg flex items-center justify-center text-[10px] transition-colors',
                getColor(ds, future),
                today && 'ring-1 ring-primary',
                !future && 'hover:ring-1 hover:ring-primary/50 cursor-pointer',
              )}
            >
              {d.getDate()}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-end gap-1 mt-3">
        <span className="text-[10px] text-muted-foreground mr-1">Less</span>
        <div className="w-3 h-3 rounded bg-muted/50" />
        <div className="w-3 h-3 rounded bg-primary/20" />
        <div className="w-3 h-3 rounded bg-primary/40" />
        <div className="w-3 h-3 rounded bg-primary/60" />
        <div className="w-3 h-3 rounded bg-primary/80" />
        <span className="text-[10px] text-muted-foreground ml-1">More</span>
      </div>
    </div>
  );
});
MonthlyHeatmap.displayName = 'MonthlyHeatmap';

export default MonthlyHeatmap;
