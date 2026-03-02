import { memo, useMemo } from 'react';
import { format, isToday, isSameDay } from 'date-fns';
import { Calendar, Video, MapPin, ListTodo, CalendarCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useKaivooStore } from '@/stores/useKaivooStore';
import { formatTime, getDurationMinutes, formatDuration, resolveTaskDay } from '@/lib/dateUtils';
import { EmptyState } from '@/components/ui/empty-state';
import type { Meeting, Task } from '@/types';

interface DaySidebarProps {
  selectedDate: Date;
  onMeetingClick?: (id: string) => void;
  onTaskClick?: (id: string) => void;
}

export const DaySidebar = memo(({ selectedDate, onMeetingClick, onTaskClick }: DaySidebarProps) => {
  // Subscribe to raw arrays so component re-renders on add/delete
  const allMeetings = useKaivooStore((s) => s.meetings);
  const allStoreTasks = useKaivooStore((s) => s.tasks);

  const meetings = useMemo(
    () =>
      allMeetings
        .filter((m) => isSameDay(new Date(m.startTime), selectedDate))
        .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()),
    [allMeetings, selectedDate],
  );

  const { pendingTasks, completedTasks, allTasks } = useMemo(() => {
    const pending: Task[] = [];
    const completed: Task[] = [];
    for (const task of allStoreTasks) {
      const taskDay = resolveTaskDay(task);
      if (!taskDay || !isSameDay(taskDay, selectedDate)) continue;
      if (task.status === 'done') completed.push(task);
      else pending.push(task);
    }
    return { pendingTasks: pending, completedTasks: completed, allTasks: [...pending, ...completed] };
  }, [allStoreTasks, selectedDate]);
  const today = isToday(selectedDate);
  const hasContent = meetings.length > 0 || allTasks.length > 0;

  return (
    <div className="widget-card h-fit p-4 sm:p-6">
      {/* Date header */}
      <div className="mb-4">
        <h3 className="text-base font-semibold text-foreground">{format(selectedDate, 'EEEE, MMMM d')}</h3>
        <p className="text-xs text-muted-foreground">{today ? 'Today' : format(selectedDate, 'yyyy')}</p>
      </div>

      {!hasContent && (
        <EmptyState
          icon={CalendarCheck}
          title="Nothing scheduled"
          description="No meetings or tasks for this day."
          compact
        />
      )}

      {/* Meetings section */}
      {meetings.length > 0 && (
        <div className="mb-4">
          <div className="mb-2 flex items-center gap-2">
            <Calendar className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Meetings ({meetings.length})
            </span>
          </div>
          <div className="space-y-1.5">
            {meetings.map((meeting) => (
              <MeetingRow key={meeting.id} meeting={meeting} onClick={onMeetingClick} />
            ))}
          </div>
        </div>
      )}

      {/* Tasks section */}
      {allTasks.length > 0 && (
        <div>
          {meetings.length > 0 && <div className="mb-4 border-t border-border/30" />}
          <div className="mb-2 flex items-center gap-2">
            <ListTodo className="h-3.5 w-3.5 text-accent" />
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Tasks ({pendingTasks.length} pending)
            </span>
          </div>
          <div className="space-y-1">
            {allTasks.slice(0, 8).map((task) => (
              <TaskRow key={task.id} task={task} onClick={onTaskClick} />
            ))}
            {allTasks.length > 8 && (
              <p className="py-1 text-center text-xs text-muted-foreground">+{allTasks.length - 8} more tasks</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
});

DaySidebar.displayName = 'DaySidebar';

// --- Sub-components ---

const MeetingRow = memo(({ meeting, onClick }: { meeting: Meeting; onClick?: (id: string) => void }) => {
  const duration = getDurationMinutes(meeting.startTime, meeting.endTime);

  return (
    <button
      onClick={() => onClick?.(meeting.id)}
      className={cn(
        'flex w-full items-start gap-3 rounded-lg px-3 py-2 text-left',
        'bg-secondary/30 transition-colors hover:bg-secondary/50',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
      )}
    >
      <div className="flex min-w-[48px] flex-col items-center">
        <span className="text-xs font-medium text-foreground">{formatTime(meeting.startTime)}</span>
        <span className="text-[10px] text-muted-foreground">{formatDuration(duration)}</span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">{meeting.title}</p>
        {meeting.location && (
          <div className="mt-0.5 flex items-center gap-1">
            {meeting.location.toLowerCase().includes('zoom') ? (
              <Video className="h-3 w-3 text-muted-foreground" />
            ) : (
              <MapPin className="h-3 w-3 text-muted-foreground" />
            )}
            <span className="truncate text-xs text-muted-foreground">{meeting.location}</span>
          </div>
        )}
      </div>
    </button>
  );
});

MeetingRow.displayName = 'MeetingRow';

const TaskRow = memo(({ task, onClick }: { task: Task; onClick?: (id: string) => void }) => (
  <button
    onClick={() => onClick?.(task.id)}
    className={cn(
      'flex w-full items-center gap-2.5 rounded-lg px-3 py-1.5 text-left transition-colors',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
      task.status === 'done' ? 'text-muted-foreground opacity-60' : 'hover:bg-secondary/50',
    )}
  >
    <div
      className={cn(
        'h-2 w-2 shrink-0 rounded-full',
        task.status === 'done' && 'bg-muted-foreground',
        task.status !== 'done' && task.priority === 'high' && 'bg-destructive',
        task.status !== 'done' && task.priority === 'medium' && 'bg-amber-500',
        task.status !== 'done' && task.priority === 'low' && 'bg-muted-foreground',
      )}
    />
    <span className={cn('flex-1 truncate text-sm', task.status === 'done' && 'line-through')}>{task.title}</span>
  </button>
));

TaskRow.displayName = 'TaskRow';
