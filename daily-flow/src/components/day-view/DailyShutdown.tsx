import { useState, useMemo, useCallback } from 'react';
import { format, addDays } from 'date-fns';
import { CheckCircle2, ArrowRight, CalendarPlus, X, Smile, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useKaivooActions } from '@/hooks/useKaivooActions';
import { useDayData, type DayStats } from './useDayData';
import type { Task } from '@/types';

interface DailyShutdownProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  date: Date;
}

type Step = 'review' | 'unfinished' | 'tomorrow' | 'rate' | 'done';
const STEPS: Step[] = ['review', 'unfinished', 'tomorrow', 'rate', 'done'];

const MOOD_OPTIONS = [
  { score: 1, emoji: '😔', label: 'Rough' },
  { score: 2, emoji: '😐', label: 'Low' },
  { score: 3, emoji: '🙂', label: 'Okay' },
  { score: 4, emoji: '😊', label: 'Good' },
  { score: 5, emoji: '🤩', label: 'Great' },
];

const DailyShutdown = ({ open, onOpenChange, date }: DailyShutdownProps) => {
  const dayData = useDayData(date);
  const tomorrowDate = addDays(date, 1);
  const tomorrowStr = format(tomorrowDate, 'yyyy-MM-dd');
  const tomorrowData = useDayData(tomorrowDate);
  const { updateTask, addTask, addJournalEntry } = useKaivooActions();

  const [step, setStep] = useState<Step>('review');
  const [taskDecisions, setTaskDecisions] = useState<Record<string, 'tomorrow' | 'week' | 'done' | 'drop'>>({});
  const [newTomorrowTask, setNewTomorrowTask] = useState('');
  const [moodScore, setMoodScore] = useState<number | null>(null);
  const [daySummary, setDaySummary] = useState('');

  const stepIndex = STEPS.indexOf(step);

  const goNext = useCallback(() => {
    const next = STEPS[stepIndex + 1];
    if (next) setStep(next);
  }, [stepIndex]);

  const goBack = useCallback(() => {
    const prev = STEPS[stepIndex - 1];
    if (prev) setStep(prev);
  }, [stepIndex]);

  // Step 2: Apply task decisions
  const applyTaskDecisions = useCallback(async () => {
    for (const [taskId, decision] of Object.entries(taskDecisions)) {
      switch (decision) {
        case 'tomorrow':
          await updateTask(taskId, { dueDate: tomorrowStr });
          break;
        case 'week': {
          const weekLater = format(addDays(date, 7), 'yyyy-MM-dd');
          await updateTask(taskId, { dueDate: weekLater });
          break;
        }
        case 'done':
          await updateTask(taskId, { status: 'done', completedAt: new Date() });
          break;
        case 'drop':
          await updateTask(taskId, { status: 'backlog', dueDate: undefined });
          break;
      }
    }
    goNext();
  }, [taskDecisions, updateTask, tomorrowStr, date, goNext]);

  // Step 3: Add task for tomorrow
  const handleAddTomorrowTask = useCallback(async () => {
    const title = newTomorrowTask.trim();
    if (!title) return;
    await addTask({
      title,
      status: 'todo',
      priority: 'medium',
      dueDate: tomorrowStr,
      tags: [],
      topicIds: [],
      subtasks: [],
    });
    setNewTomorrowTask('');
  }, [newTomorrowTask, tomorrowStr, addTask]);

  // Step 4: Save mood + summary
  const handleSaveRating = useCallback(async () => {
    if (moodScore || daySummary.trim()) {
      await addJournalEntry({
        date: dayData.dateStr,
        content: daySummary.trim() ? `<p>${daySummary.trim()}</p>` : '<p>Daily shutdown completed.</p>',
        tags: ['shutdown'],
        topicIds: [],
        moodScore: moodScore ?? undefined,
      });
    }
    goNext();
  }, [moodScore, daySummary, dayData.dateStr, addJournalEntry, goNext]);

  const handleClose = useCallback(() => {
    onOpenChange(false);
    // Reset state for next time
    setTimeout(() => {
      setStep('review');
      setTaskDecisions({});
      setNewTomorrowTask('');
      setMoodScore(null);
      setDaySummary('');
    }, 300);
  }, [onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        {/* Progress bar */}
        <div className="flex gap-1 mb-2">
          {STEPS.map((s, i) => (
            <div
              key={s}
              className={cn(
                'flex-1 h-1 rounded-full transition-colors',
                i <= stepIndex ? 'bg-primary' : 'bg-muted',
              )}
            />
          ))}
        </div>

        {step === 'review' && (
          <StepReview stats={dayData.stats} onNext={goNext} />
        )}

        {step === 'unfinished' && (
          <StepUnfinished
            tasks={dayData.tasks.pending}
            decisions={taskDecisions}
            onChange={setTaskDecisions}
            onBack={goBack}
            onNext={applyTaskDecisions}
          />
        )}

        {step === 'tomorrow' && (
          <StepTomorrow
            tomorrowTasks={tomorrowData.tasks.pending}
            tomorrowMeetings={tomorrowData.meetings.length}
            newTask={newTomorrowTask}
            onNewTaskChange={setNewTomorrowTask}
            onAddTask={handleAddTomorrowTask}
            onBack={goBack}
            onNext={goNext}
          />
        )}

        {step === 'rate' && (
          <StepRate
            moodScore={moodScore}
            daySummary={daySummary}
            onMoodChange={setMoodScore}
            onSummaryChange={setDaySummary}
            onBack={goBack}
            onNext={handleSaveRating}
          />
        )}

        {step === 'done' && (
          <StepDone onClose={handleClose} />
        )}
      </DialogContent>
    </Dialog>
  );
};

// --- Step Components ---

const StepReview = ({ stats, onNext }: { stats: DayStats; onNext: () => void }) => (
  <div className="py-4">
    <DialogHeader>
      <DialogTitle>Review Your Day</DialogTitle>
    </DialogHeader>
    <div className="mt-4 space-y-3">
      <p className="text-sm text-muted-foreground">
        You completed <strong className="text-foreground">{stats.tasksCompleted}</strong> tasks
        {stats.routinesTotal > 0 && (
          <> and <strong className="text-foreground">{stats.routinesDone}/{stats.routinesTotal}</strong> routines</>
        )}
        {' '}today.
      </p>
      {stats.journalWordCount > 0 && (
        <p className="text-sm text-muted-foreground">
          Wrote <strong className="text-foreground">{stats.journalWordCount}</strong> words in your journal.
        </p>
      )}
      {stats.captureCount > 0 && (
        <p className="text-sm text-muted-foreground">
          Captured <strong className="text-foreground">{stats.captureCount}</strong> idea{stats.captureCount !== 1 ? 's' : ''}.
        </p>
      )}
    </div>
    <div className="flex justify-end mt-6">
      <Button onClick={onNext}>
        Continue <ArrowRight className="h-4 w-4 ml-1" />
      </Button>
    </div>
  </div>
);

const StepUnfinished = ({
  tasks, decisions, onChange, onBack, onNext,
}: {
  tasks: Task[];
  decisions: Record<string, string>;
  onChange: (d: Record<string, 'tomorrow' | 'week' | 'done' | 'drop'>) => void;
  onBack: () => void;
  onNext: () => void;
}) => (
  <div className="py-4">
    <DialogHeader>
      <DialogTitle>Handle Unfinished Tasks</DialogTitle>
    </DialogHeader>
    {tasks.length === 0 ? (
      <p className="text-sm text-muted-foreground mt-4 text-center py-4">All tasks done — nice work!</p>
    ) : (
      <div className="mt-4 space-y-3 max-h-64 overflow-y-auto">
        {tasks.map(task => (
          <div key={task.id} className="flex items-center justify-between gap-2 p-2 rounded-lg bg-muted/30">
            <span className="text-sm truncate flex-1">{task.title}</span>
            <div className="flex gap-1 shrink-0">
              {(['tomorrow', 'week', 'done', 'drop'] as const).map(action => (
                <button
                  key={action}
                  onClick={() => onChange({ ...decisions, [task.id]: action })}
                  className={cn(
                    'text-[10px] px-2 py-1 rounded-lg transition-colors',
                    decisions[task.id] === action
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-accent/30',
                  )}
                >
                  {action === 'tomorrow' ? '→ Tmrw' : action === 'week' ? '→ Week' : action === 'done' ? '✓ Done' : '✕ Drop'}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    )}
    <div className="flex justify-between mt-6">
      <Button variant="ghost" onClick={onBack}>Back</Button>
      <Button onClick={onNext}>
        {tasks.length === 0 ? 'Continue' : 'Apply & Continue'} <ArrowRight className="h-4 w-4 ml-1" />
      </Button>
    </div>
  </div>
);

const StepTomorrow = ({
  tomorrowTasks, tomorrowMeetings, newTask, onNewTaskChange, onAddTask, onBack, onNext,
}: {
  tomorrowTasks: Task[];
  tomorrowMeetings: number;
  newTask: string;
  onNewTaskChange: (v: string) => void;
  onAddTask: () => void;
  onBack: () => void;
  onNext: () => void;
}) => (
  <div className="py-4">
    <DialogHeader>
      <DialogTitle>Quick Plan Tomorrow</DialogTitle>
    </DialogHeader>
    <div className="mt-4 space-y-3">
      <p className="text-sm text-muted-foreground">
        You have <strong className="text-foreground">{tomorrowMeetings}</strong> meeting{tomorrowMeetings !== 1 ? 's' : ''} and{' '}
        <strong className="text-foreground">{tomorrowTasks.length}</strong> task{tomorrowTasks.length !== 1 ? 's' : ''} lined up.
      </p>
      {tomorrowTasks.length > 0 && (
        <div className="space-y-1">
          {tomorrowTasks.slice(0, 5).map(t => (
            <div key={t.id} className="text-sm text-muted-foreground flex items-center gap-2 px-2 py-1">
              <div className="w-3 h-3 rounded border border-border shrink-0" />
              <span className="truncate">{t.title}</span>
            </div>
          ))}
          {tomorrowTasks.length > 5 && (
            <p className="text-xs text-muted-foreground px-2">+{tomorrowTasks.length - 5} more</p>
          )}
        </div>
      )}
      <div className="flex gap-2">
        <Input
          value={newTask}
          onChange={e => onNewTaskChange(e.target.value)}
          placeholder="Add a task for tomorrow..."
          className="h-8 text-sm"
          onKeyDown={e => e.key === 'Enter' && onAddTask()}
        />
        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={onAddTask} disabled={!newTask.trim()}>
          <CalendarPlus className="h-4 w-4" />
        </Button>
      </div>
    </div>
    <div className="flex justify-between mt-6">
      <Button variant="ghost" onClick={onBack}>Back</Button>
      <Button onClick={onNext}>Continue <ArrowRight className="h-4 w-4 ml-1" /></Button>
    </div>
  </div>
);

const StepRate = ({
  moodScore, daySummary, onMoodChange, onSummaryChange, onBack, onNext,
}: {
  moodScore: number | null;
  daySummary: string;
  onMoodChange: (s: number | null) => void;
  onSummaryChange: (s: string) => void;
  onBack: () => void;
  onNext: () => void;
}) => (
  <div className="py-4">
    <DialogHeader>
      <DialogTitle>Rate Your Day</DialogTitle>
    </DialogHeader>
    <div className="mt-4 space-y-4">
      <div className="flex items-center justify-center gap-3">
        {MOOD_OPTIONS.map(m => (
          <button
            key={m.score}
            onClick={() => onMoodChange(moodScore === m.score ? null : m.score)}
            className={cn(
              'flex flex-col items-center gap-1 p-2 rounded-xl transition-all',
              moodScore === m.score ? 'bg-primary/10 scale-110' : 'hover:bg-muted',
            )}
          >
            <span className="text-2xl">{m.emoji}</span>
            <span className="text-[10px] text-muted-foreground">{m.label}</span>
          </button>
        ))}
      </div>
      <Input
        value={daySummary}
        onChange={e => onSummaryChange(e.target.value)}
        placeholder="Today in a sentence... (optional)"
        className="text-sm"
      />
    </div>
    <div className="flex justify-between mt-6">
      <Button variant="ghost" onClick={onBack}>Back</Button>
      <Button onClick={onNext}>
        {moodScore || daySummary.trim() ? 'Save & Finish' : 'Skip & Finish'}
        <ArrowRight className="h-4 w-4 ml-1" />
      </Button>
    </div>
  </div>
);

const StepDone = ({ onClose }: { onClose: () => void }) => (
  <div className="py-8 text-center">
    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 animate-in zoom-in-50 duration-500">
      <Sparkles className="h-8 w-8 text-primary" />
    </div>
    <h2 className="text-xl font-semibold text-foreground mb-2">Shutdown Complete</h2>
    <p className="text-sm text-muted-foreground mb-6">You're done for the day. See you tomorrow.</p>
    <Button onClick={onClose}>Close</Button>
  </div>
);

export default DailyShutdown;
