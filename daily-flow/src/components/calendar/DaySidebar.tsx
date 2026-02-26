import { memo, useMemo } from 'react';
import { format, isToday, isSameDay } from 'date-fns';
import { Calendar, Video, MapPin, ListTodo, CalendarCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useKaivooStore } from '@/stores/useKaivooStore';
import { formatTime, getDurationMinutes, formatDuration, parseDate } from '@/lib/dateUtils';
import { EmptyState } from '@/components/ui/empty-state';
import type { Meeting, Task } from '@/types';

interface DaySidebarProps {
  selectedDate: Date;
  onMeetingClick?: (id: string) => void;
  onTaskClick?: (id: string) => void;
}

export const DaySidebar = memo(({ selectedDate, onMeetingClick, onTaskClick }: DaySidebarProps) => {
  // Subscribe to raw arrays so component re-renders on add/delete
  const allMeetings = useKaivooStore(s => s.meetings);
  const allStoreTasks = useKaivooStore(s => s.tasks);

  const meetings = useMemo(() =>
    allMeetings
      .filter(m => isSameDay(new Date(m.startTime), selectedDate))
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()),
    [allMeetings, selectedDate],
  );

  const { pendingTasks, completedTasks, allTasks } = useMemo(() => {
    const pending: Task[] = [];
    const completed: Task[] = [];
    for (const task of allStoreTasks) {
      if (!task.dueDate) continue;
      const parsed = parseDate(task.dueDate);
      if (!parsed || !isSameDay(parsed, selectedDate)) continue;
      if (task.status === 'done') completed.push(task);
      else pending.push(task);
    }
    return { pendingTasks: pending, completedTasks: completed, allTasks: [...pending, ...completed] };
  }, [allStoreTasks, selectedDate]);
  const today = isToday(selectedDate);
  const hasContent = meetings.length > 0 || allTasks.length > 0;

  return (
    <div className="widget-card p-4 sm:p-6 h-fit">
      {/* Date header */}
      <div className="mb-4">
        <h3 className="text-base font-semibold text-foreground">
          {format(selectedDate, 'EEEE, MMMM d')}
        </h3>
        <p className="text-xs text-muted-foreground">
          {today ? 'Today' : format(selectedDate, 'yyyy')}
        </p>
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
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
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
          {meetings.length > 0 && <div className="border-t border-border/30 mb-4" />}
          <div className="flex items-center gap-2 mb-2">
            <ListTodo className="w-3.5 h-3.5 text-accent" />
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Tasks ({pendingTasks.length} pending)
            </span>
          </div>
          <div className="space-y-1">
            {allTasks.slice(0, 8).map((task) => (
              <TaskRow key={task.id} task={task} onClick={onTaskClick} />
            ))}
            {allTasks.length > 8 && (
              <p className="text-xs text-muted-foreground text-center py-1">
                +{allTasks.length - 8} more tasks
              </p>
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
        'flex items-start gap-3 w-full text-left py-2 px-3 rounded-lg',
        'bg-secondary/30 hover:bg-secondary/50 transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
      )}
    >
      <div className="flex flex-col items-center min-w-[48px]">
        <span className="text-xs font-medium text-foreground">
          {formatTime(meeting.startTime)}
        </span>
        <span className="text-[10px] text-muted-foreground">
          {formatDuration(duration)}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{meeting.title}</p>
        {meeting.location && (
          <div className="flex items-center gap-1 mt-0.5">
            {meeting.location.toLowerCase().includes('zoom') ? (
              <Video className="w-3 h-3 text-muted-foreground" />
            ) : (
              <MapPin className="w-3 h-3 text-muted-foreground" />
            )}
            <span className="text-xs text-muted-foreground truncate">{meeting.location}</span>
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
      'flex items-center gap-2.5 w-full text-left py-1.5 px-3 rounded-lg transition-colors',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
      task.status === 'done'
        ? 'text-muted-foreground opacity-60'
        : 'hover:bg-secondary/50',
    )}
  >
    <div className={cn(
      'w-2 h-2 rounded-full shrink-0',
      task.status === 'done' && 'bg-muted-foreground',
      task.status !== 'done' && task.priority === 'high' && 'bg-destructive',
      task.status !== 'done' && task.priority === 'medium' && 'bg-amber-500',
      task.status !== 'done' && task.priority === 'low' && 'bg-muted-foreground',
    )} />
    <span className={cn(
      'text-sm flex-1 truncate',
      task.status === 'done' && 'line-through',
    )}>
      {task.title}
    </span>
  </button>
));

TaskRow.displayName = 'TaskRow';
