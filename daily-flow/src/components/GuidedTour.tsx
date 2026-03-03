/**
 * Guided Tour — Sprint 23 P8
 *
 * Lightweight first-time walkthrough overlay. Highlights 5 key screens:
 * Today, Notes, Tasks, Vault, Settings. Dismissable, never shows again.
 */

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import {
  Sun,
  BookOpen,
  CheckSquare,
  HardDrive,
  Settings,
  ChevronRight,
  ChevronLeft,
  Sparkles,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface TourStep {
  title: string;
  description: string;
  icon: LucideIcon;
}

const TOUR_STEPS: TourStep[] = [
  {
    title: 'Today',
    description:
      'Your daily command center. See your tasks, journal entries, and quick captures — all in one place.',
    icon: Sun,
  },
  {
    title: 'Notes',
    description:
      'Your daily journal canvas. Write freely, then extract tasks and captures with AI.',
    icon: BookOpen,
  },
  {
    title: 'Tasks',
    description:
      'Track everything you need to do. Organize by topic, set priorities, and manage subtasks.',
    icon: CheckSquare,
  },
  {
    title: 'Vault',
    description:
      'Browse all your files. Your notes, captures, and topics are stored as markdown files you own.',
    icon: HardDrive,
  },
  {
    title: 'Settings',
    description:
      'Configure your AI provider, customize your concierge, and manage your account.',
    icon: Settings,
  },
];

const GuidedTour = () => {
  const [visible, setVisible] = useState(
    () => localStorage.getItem('kaivoo-show-tour') === 'true',
  );
  const [step, setStep] = useState(0);

  const handleDismiss = useCallback(() => {
    localStorage.removeItem('kaivoo-show-tour');
    localStorage.setItem('kaivoo-tour-complete', 'true');
    setVisible(false);
  }, []);

  if (!visible) return null;

  const current = TOUR_STEPS[step];
  const Icon = current.icon;
  const isLast = step === TOUR_STEPS.length - 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Guided tour: step ${step + 1} of ${TOUR_STEPS.length}`}
        className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-lg"
      >
        {/* Step indicator */}
        <div className="mb-6 flex items-center justify-center gap-2">
          {TOUR_STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 w-6 rounded-full transition-colors ${
                i <= step ? 'bg-primary' : 'bg-muted'
              }`}
            />
          ))}
        </div>

        {/* Content */}
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
            <Icon className="h-7 w-7 text-primary" />
          </div>
          <h3 className="mb-2 text-xl font-semibold text-foreground">{current.title}</h3>
          <p className="mb-6 text-muted-foreground">{current.description}</p>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={handleDismiss}>
            Skip tour
          </Button>
          <div className="flex gap-2">
            {step > 0 && (
              <Button variant="outline" size="sm" onClick={() => setStep((s) => s - 1)}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
            )}
            <Button
              size="sm"
              onClick={() => {
                if (isLast) handleDismiss();
                else setStep((s) => s + 1);
              }}
              className="gap-2"
            >
              {isLast ? (
                <>
                  <Sparkles className="h-4 w-4" />
                  Get Started
                </>
              ) : (
                <>
                  Next
                  <ChevronRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuidedTour;
