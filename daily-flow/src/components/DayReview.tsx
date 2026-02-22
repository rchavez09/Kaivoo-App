import { useState } from 'react';
import { format, isSameDay, differenceInDays } from 'date-fns';
import {
  BookOpen, CheckCircle2, Circle, Clock, FileText,
  Hash, ListTodo, Sparkles, FolderOpen
} from 'lucide-react';
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
  const { getTopicPath, updateCapture } = useKaivooStore();
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
        : `Routine marked as done for ${format(date, 'MMM d')}`
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
  // Calculate stats
  const wordCount = journalEntries.reduce(
    (acc, entry) => acc + entry.content.split(/\s+/).filter(Boolean).length,
    0
  );
  const routineRate = routines.length > 0 
    ? Math.round((routineCompletions.length / routines.length) * 100) 
    : 0;

  // Sort entries by timestamp
  const sortedEntries = [...journalEntries].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  return (
    <div className="space-y-6">
      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-secondary/30 rounded-lg p-3 text-center">
          <div className="text-2xl font-semibold text-foreground">{journalEntries.length}</div>
          <div className="text-xs text-muted-foreground">Entries</div>
        </div>
        <div className="bg-secondary/30 rounded-lg p-3 text-center">
          <div className="text-2xl font-semibold text-foreground">{wordCount}</div>
          <div className="text-xs text-muted-foreground">Words</div>
        </div>
        <div className="bg-secondary/30 rounded-lg p-3 text-center">
          <div className="text-2xl font-semibold text-foreground">
            {completedTasks.length}/{tasks.length + completedTasks.length}
          </div>
          <div className="text-xs text-muted-foreground">Tasks Done</div>
        </div>
        <div className="bg-secondary/30 rounded-lg p-3 text-center">
          <div className="text-2xl font-semibold text-foreground">{routineRate}%</div>
          <div className="text-xs text-muted-foreground">Routines</div>
        </div>
      </div>

      {/* Journal Entries */}
      {sortedEntries.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <BookOpen className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-medium text-foreground">Journal Entries</h3>
          </div>
          <div className="space-y-3">
            {sortedEntries.map((entry) => (
              <div key={entry.id} className="bg-secondary/30 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-3 h-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(entry.timestamp), 'h:mm a')}
                  </span>
                </div>
                <p className="text-sm text-foreground font-serif leading-relaxed whitespace-pre-wrap">
                  {entry.content}
                </p>
                {(entry.tags.length > 0 || entry.topicIds.length > 0) && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {entry.tags.map((tag) => (
                      <span key={tag} className="tag-chip text-[10px] py-0.5 px-1.5">
                        <Hash className="w-2.5 h-2.5" />
                        {tag}
                      </span>
                    ))}
                    {entry.topicIds.map((topicId) => {
                      const path = getTopicPath(topicId);
                      const isPage = path.includes('/');
                      return (
                        <span key={topicId} className="topic-chip text-[10px] py-0.5 px-1.5">
                          {isPage ? <FileText className="w-2.5 h-2.5" /> : <FolderOpen className="w-2.5 h-2.5" />}
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
          <div className="flex items-center gap-2 mb-3">
            <ListTodo className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-medium text-foreground">Tasks</h3>
          </div>
          <div className="space-y-2">
            {[...completedTasks, ...tasks].map((task) => (
              <div
                key={task.id}
                className={cn(
                  "flex items-center gap-3 py-2 px-3 rounded-lg",
                  task.status === 'done' ? "bg-muted/30" : "bg-secondary/30"
                )}
              >
                {task.status === 'done' ? (
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                ) : (
                  <Circle className="w-4 h-4 text-muted-foreground shrink-0" />
                )}
                <span
                  className={cn(
                    "text-sm flex-1",
                    task.status === 'done' && "line-through text-muted-foreground"
                  )}
                >
                  {task.title}
                </span>
                <div
                  className={cn(
                    "w-2 h-2 rounded-full shrink-0",
                    task.priority === 'high' && "bg-destructive",
                    task.priority === 'medium' && "bg-amber-500",
                    task.priority === 'low' && "bg-muted-foreground"
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
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-medium text-foreground">AI Captures</h3>
          </div>
          <div className="space-y-3">
            {captures.map((capture) => (
              <div 
                key={capture.id} 
                className="bg-secondary/30 rounded-lg p-4 cursor-pointer hover:bg-secondary/50 transition-colors"
                onClick={() => handleCaptureClick(capture)}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-3 h-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(capture.createdAt), 'h:mm a')}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-secondary-foreground capitalize">
                    {capture.source === 'quick' ? 'AI Note' : capture.source}
                  </span>
                </div>
                <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap line-clamp-4">
                  {capture.content}
                </p>
                {(capture.tags.length > 0 || capture.topicIds.length > 0) && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {capture.tags.map((tag) => (
                      <span key={tag} className="tag-chip text-[10px] py-0.5 px-1.5">
                        <Hash className="w-2.5 h-2.5" />
                        {tag}
                      </span>
                    ))}
                    {capture.topicIds.map((topicId) => {
                      const path = getTopicPath(topicId);
                      const isPage = path.includes('/');
                      return (
                        <span key={topicId} className="topic-chip text-[10px] py-0.5 px-1.5">
                          {isPage ? <FileText className="w-2.5 h-2.5" /> : <FolderOpen className="w-2.5 h-2.5" />}
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
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-medium text-foreground">Routines</h3>
            {canToggle && onToggleRoutine && (
              <span className="text-xs text-muted-foreground">(tap to toggle)</span>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {routines.map((routine) => {
              const isCompleted = routineCompletions.some(c => c.routineId === routine.id);
              return (
                <button
                  key={routine.id}
                  onClick={() => handleRoutineToggle(routine.id, routine.name, isCompleted)}
                  disabled={!canToggle || !onToggleRoutine}
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-colors",
                    isCompleted
                      ? "bg-primary/10 text-primary"
                      : "bg-secondary/30 text-muted-foreground",
                    canToggle && onToggleRoutine
                      ? "cursor-pointer hover:ring-1 hover:ring-primary/30"
                      : "cursor-default"
                  )}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-3 h-3" />
                  ) : (
                    <Circle className="w-3 h-3" />
                  )}
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
              {confirmRoutine?.isCompleted ? 'Unmark' : 'Mark'} "{confirmRoutine?.name}" as {confirmRoutine?.isCompleted ? 'incomplete' : 'complete'}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will {confirmRoutine?.isCompleted ? 'remove completion' : 'mark as done'} for {format(date, 'EEEE, MMMM d')}.
              {!confirmRoutine?.isCompleted && ' Your streak will be updated.'}
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
        <div className="text-center py-8">
          <FileText className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
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
