import { useState } from 'react';
import { format, isSameDay, differenceInDays } from 'date-fns';
import { BookOpen, CheckCircle2, Circle, Clock, FileText, Hash, ListTodo, Sparkles, FolderOpen } from 'lucide-react';
import { JournalEntry, Task, RoutineItem, Capture } from '@/types';
import { cn } from '@/lib/utils';
import { useKaivooStore, RoutineCompletionRecord } from '@/stores/useKaivooStore';
import CaptureEditDialog from '@/components/CaptureEditDialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

interface DayReviewProps {
  date: Date;
  journalEntries: JournalEntry[];
  tasks: Task[];
  completedTasks: Task[];
  routines: RoutineItem[];
  routineCompletions: RoutineCompletionRecord[];
  captures: Capture[];
  onCaptureUpdate?: (capture: Capture) => void;
  onToggleRoutine?: (routineId: string, date: string) => void;
}

const DayReview = ({
  date,
  journalEntries,
  tasks,
  completedTasks,
  routines,
  routineCompletions,
  captures,
  onCaptureUpdate,
  onToggleRoutine,
}: DayReviewProps) => {
  const getTopicPath = useKaivooStore((s) => s.getTopicPath);
  const updateCapture = useKaivooStore((s) => s.updateCapture);
  const [editingCapture, setEditingCapture] = useState<Capture | null>(null);
  const [confirmRoutine, setConfirmRoutine] = useState<{ id: string; name: string; isCompleted: boolean } | null>(null);

  const isToday = isSameDay(date, new Date());
  const daysDiff = differenceInDays(new Date(), date);
  const canToggle = daysDiff >= 0 && daysDiff <= 7; // Within 7 days

  const handleRoutineToggle = (routineId: string, routineName: string, isCompleted: boolean) => {
    if (!onToggleRoutine || !canToggle) return;

    if (isToday) {
      // Toggle immediately for today
      onToggleRoutine(routineId, format(date, 'yyyy-MM-dd'));
      toast.success(isCompleted ? 'Routine unmarked' : 'Routine completed');
    } else {
      // Show confirmation for past days
      setConfirmRoutine({ id: routineId, name: routineName, isCompleted });
    }
  };

  const handleConfirmToggle = () => {
    if (!confirmRoutine || !onToggleRoutine) return;
    const dateStr = format(date, 'yyyy-MM-dd');
    onToggleRoutine(confirmRoutine.id, dateStr);
    toast.success(
      confirmRoutine.isCompleted
        ? `Routine unmarked for ${format(date, 'MMM d')}`
        : `Routine marked as done for ${format(date, 'MMM d')}`,
    );
    setConfirmRoutine(null);
  };

  const handleCaptureClick = (capture: Capture) => {
    setEditingCapture(capture);
  };

  const handleCaptureSave = (updatedCapture: Capture) => {
    updateCapture(updatedCapture.id, updatedCapture);
    onCaptureUpdate?.(updatedCapture);
  };
  // Strip HTML tags for plain text display
  const stripHtml = (html: string) => {
    const tmp = html.replace(/<br\s*\/?>/gi, '\n').replace(/<\/p>\s*<p[^>]*>/gi, '\n\n');
    return tmp.replace(/<[^>]+>/g, '').trim();
  };

  // Calculate stats
  const wordCount = journalEntries.reduce(
    (acc, entry) => acc + stripHtml(entry.content).split(/\s+/).filter(Boolean).length,
    0,
  );
  const routineRate = routines.length > 0 ? Math.round((routineCompletions.length / routines.length) * 100) : 0;

  // Sort entries by timestamp
  const sortedEntries = [...journalEntries].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
  );

  return (
    <div className="space-y-6">
      {/* Stats Summary */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <div className="rounded-lg bg-secondary/30 p-3 text-center">
          <div className="text-2xl font-semibold text-foreground">{journalEntries.length}</div>
          <div className="text-xs text-muted-foreground">Entries</div>
        </div>
        <div className="rounded-lg bg-secondary/30 p-3 text-center">
          <div className="text-2xl font-semibold text-foreground">{wordCount}</div>
          <div className="text-xs text-muted-foreground">Words</div>
        </div>
        <div className="rounded-lg bg-secondary/30 p-3 text-center">
          <div className="text-2xl font-semibold text-foreground">
            {completedTasks.length}/{tasks.length + completedTasks.length}
          </div>
          <div className="text-xs text-muted-foreground">Tasks Done</div>
        </div>
        <div className="rounded-lg bg-secondary/30 p-3 text-center">
          <div className="text-2xl font-semibold text-foreground">{routineRate}%</div>
          <div className="text-xs text-muted-foreground">Routines</div>
        </div>
      </div>

      {/* Journal Entries */}
      {sortedEntries.length > 0 && (
        <div>
          <div className="mb-3 flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-medium text-foreground">Notes</h3>
          </div>
          <div className="space-y-3">
            {sortedEntries.map((entry) => (
              <div key={entry.id} className="rounded-lg bg-secondary/30 p-4">
                <div className="mb-2 flex items-center gap-2">
                  <Clock className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{format(new Date(entry.timestamp), 'h:mm a')}</span>
                </div>
                <p className="whitespace-pre-wrap font-serif text-sm leading-relaxed text-foreground">
                  {stripHtml(entry.content)}
                </p>
                {(entry.tags.length > 0 || entry.topicIds.length > 0) && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {entry.tags.map((tag) => (
                      <span key={tag} className="tag-chip px-1.5 py-0.5 text-[10px]">
                        <Hash className="h-2.5 w-2.5" />
                        {tag}
                      </span>
                    ))}
                    {entry.topicIds.map((topicId) => {
                      const path = getTopicPath(topicId);
                      const isPage = path.includes('/');
                      return (
                        <span key={topicId} className="topic-chip px-1.5 py-0.5 text-[10px]">
                          {isPage ? <FileText className="h-2.5 w-2.5" /> : <FolderOpen className="h-2.5 w-2.5" />}
                          {path}
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tasks */}
      {(tasks.length > 0 || completedTasks.length > 0) && (
        <div>
          <div className="mb-3 flex items-center gap-2">
            <ListTodo className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-medium text-foreground">Tasks</h3>
          </div>
          <div className="space-y-2">
            {[...completedTasks, ...tasks].map((task) => (
              <div
                key={task.id}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2',
                  task.status === 'done' ? 'bg-muted/30' : 'bg-secondary/30',
                )}
              >
                {task.status === 'done' ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
                ) : (
                  <Circle className="h-4 w-4 shrink-0 text-muted-foreground" />
                )}
                <span className={cn('flex-1 text-sm', task.status === 'done' && 'text-muted-foreground line-through')}>
                  {task.title}
                </span>
                <div
                  className={cn(
                    'h-2 w-2 shrink-0 rounded-full',
                    task.priority === 'high' && 'bg-destructive',
                    task.priority === 'medium' && 'bg-amber-500',
                    task.priority === 'low' && 'bg-muted-foreground',
                  )}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Captures */}
      {captures.length > 0 && (
        <div>
          <div className="mb-3 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-medium text-foreground">AI Captures</h3>
          </div>
          <div className="space-y-3">
            {captures.map((capture) => (
              <div
                key={capture.id}
                className="cursor-pointer rounded-lg bg-secondary/30 p-4 transition-colors hover:bg-secondary/50"
                onClick={() => handleCaptureClick(capture)}
              >
                <div className="mb-2 flex items-center gap-2">
                  <Clock className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{format(new Date(capture.createdAt), 'h:mm a')}</span>
                  <span className="rounded bg-secondary px-1.5 py-0.5 text-[10px] capitalize text-secondary-foreground">
                    {capture.source === 'quick' ? 'AI Note' : capture.source}
                  </span>
                </div>
                <p className="line-clamp-4 whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                  {capture.content}
                </p>
                {(capture.tags.length > 0 || capture.topicIds.length > 0) && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {capture.tags.map((tag) => (
                      <span key={tag} className="tag-chip px-1.5 py-0.5 text-[10px]">
                        <Hash className="h-2.5 w-2.5" />
                        {tag}
                      </span>
                    ))}
                    {capture.topicIds.map((topicId) => {
                      const path = getTopicPath(topicId);
                      const isPage = path.includes('/');
                      return (
                        <span key={topicId} className="topic-chip px-1.5 py-0.5 text-[10px]">
                          {isPage ? <FileText className="h-2.5 w-2.5" /> : <FolderOpen className="h-2.5 w-2.5" />}
                          {path}
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Routine Completion */}
      {routines.length > 0 && (
        <div>
          <div className="mb-3 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-medium text-foreground">Routines</h3>
            {canToggle && onToggleRoutine && <span className="text-xs text-muted-foreground">(tap to toggle)</span>}
          </div>
          <div className="flex flex-wrap gap-2">
            {routines.map((routine) => {
              const isCompleted = routineCompletions.some((c) => c.routineId === routine.id);
              return (
                <button
                  key={routine.id}
                  onClick={() => handleRoutineToggle(routine.id, routine.name, isCompleted)}
                  disabled={!canToggle || !onToggleRoutine}
                  className={cn(
                    'flex items-center gap-2 rounded-full px-3 py-1.5 text-sm transition-colors',
                    isCompleted ? 'bg-primary/10 text-primary' : 'bg-secondary/30 text-muted-foreground',
                    canToggle && onToggleRoutine
                      ? 'cursor-pointer hover:ring-1 hover:ring-primary/30'
                      : 'cursor-default',
                  )}
                >
                  {isCompleted ? <CheckCircle2 className="h-3 w-3" /> : <Circle className="h-3 w-3" />}
                  {routine.name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Backdate Confirmation Dialog */}
      <AlertDialog open={!!confirmRoutine} onOpenChange={(open) => !open && setConfirmRoutine(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmRoutine?.isCompleted ? 'Unmark' : 'Mark'} "{confirmRoutine?.name}" as{' '}
              {confirmRoutine?.isCompleted ? 'incomplete' : 'complete'}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will {confirmRoutine?.isCompleted ? 'remove completion' : 'mark as done'} for{' '}
              {format(date, 'EEEE, MMMM d')}.{!confirmRoutine?.isCompleted && ' Your streak will be updated.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmToggle}>
              {confirmRoutine?.isCompleted ? 'Unmark' : 'Mark Done'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Empty state */}
      {sortedEntries.length === 0 && tasks.length === 0 && completedTasks.length === 0 && captures.length === 0 && (
        <div className="py-8 text-center">
          <FileText className="mx-auto mb-3 h-12 w-12 text-muted-foreground/30" />
          <p className="text-muted-foreground">No activity recorded for this day</p>
        </div>
      )}

      {/* Capture Edit Dialog */}
      <CaptureEditDialog
        capture={editingCapture}
        open={!!editingCapture}
        onOpenChange={(open) => !open && setEditingCapture(null)}
        onSave={handleCaptureSave}
      />
    </div>
  );
};

export default DayReview;
