import { useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useKaivooStore } from '@/stores/useKaivooStore';
import { startOfMonth, endOfMonth, addDays, subDays, eachDayOfInterval, differenceInDays } from 'date-fns';
import TimelineHeader from './TimelineHeader';
import TimelineProjectBar from './TimelineProjectBar';
import { projectStatusConfig } from '@/lib/project-config';

const DAY_WIDTH = 32;
const LABEL_WIDTH = 200;

interface TimelineViewProps {
  onCreateProject?: () => void;
}

const TimelineView = ({ onCreateProject }: TimelineViewProps) => {
  const navigate = useNavigate();
  const projects = useKaivooStore((s) => s.projects);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Projects with dates, sorted by start date then status order
  // Show projects that have at least one date
  const datedProjects = useMemo(() => {
    return projects
      .filter((p) => p.startDate || p.endDate)
      .sort((a, b) => {
        const orderA = projectStatusConfig[a.status].order;
        const orderB = projectStatusConfig[b.status].order;
        if (orderA !== orderB) return orderA - orderB;
        return (a.startDate || a.endDate || '').localeCompare(b.startDate || b.endDate || '');
      });
  }, [projects]);

  // Calculate visible date range: current month ± 2 weeks padding
  const { rangeStart, days } = useMemo(() => {
    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);
    const start = subDays(monthStart, 14);
    const end = addDays(monthEnd, 14);
    return {
      rangeStart: start,
      rangeEnd: end,
      days: eachDayOfInterval({ start, end }),
    };
  }, []);

  // Auto-scroll to center today on mount
  useEffect(() => {
    if (scrollRef.current) {
      const todayOffset = differenceInDays(new Date(), rangeStart);
      const scrollTo = LABEL_WIDTH + todayOffset * DAY_WIDTH - scrollRef.current.clientWidth / 2;
      scrollRef.current.scrollLeft = Math.max(0, scrollTo);
    }
  }, [rangeStart]);

  const totalWidth = LABEL_WIDTH + days.length * DAY_WIDTH;

  if (datedProjects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Briefcase className="mb-4 h-12 w-12 text-muted-foreground/30" />
        <h3 className="mb-1 text-lg font-medium text-foreground">No projects with dates</h3>
        <p className="mb-4 text-sm text-muted-foreground">
          Add a start or end date to your projects to see them on the timeline.
        </p>
        {onCreateProject ? (
          <Button className="gap-2" onClick={onCreateProject}>
            <Plus className="h-4 w-4" />
            Create Project
          </Button>
        ) : (
          <Button className="gap-2" onClick={() => navigate('/projects')}>
            <Plus className="h-4 w-4" />
            Go to Projects
          </Button>
        )}
      </div>
    );
  }

  // Today line position
  const todayOffset = differenceInDays(new Date(), rangeStart);
  const todayLeft = LABEL_WIDTH + todayOffset * DAY_WIDTH + DAY_WIDTH / 2;

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <div ref={scrollRef} className="relative overflow-x-auto" style={{ maxHeight: 'calc(100vh - 280px)' }}>
        <div style={{ minWidth: totalWidth }}>
          {/* Header with padded label column */}
          <div className="flex">
            {/* Label column header */}
            <div
              className="sticky left-0 z-20 border-b border-r border-border bg-background"
              style={{ width: LABEL_WIDTH }}
            >
              <div className="flex h-[52px] items-end px-3 pb-1">
                <span className="text-xs font-medium text-muted-foreground">Project</span>
              </div>
            </div>
            {/* Timeline header */}
            <div className="flex-1">
              <TimelineHeader days={days} dayWidth={DAY_WIDTH} />
            </div>
          </div>

          {/* Project bars */}
          <div className="relative">
            {/* Today line */}
            <div className="absolute bottom-0 top-0 z-10 w-0.5 bg-primary" style={{ left: todayLeft }} />

            {/* Weekend shading */}
            {days.map((day, i) => {
              const isWeekend = day.getDay() === 0 || day.getDay() === 6;
              if (!isWeekend) return null;
              return (
                <div
                  key={i}
                  className="absolute bottom-0 top-0 bg-muted/15"
                  style={{ left: LABEL_WIDTH + i * DAY_WIDTH, width: DAY_WIDTH }}
                />
              );
            })}

            {datedProjects.map((project, i) => (
              <TimelineProjectBar
                key={project.id}
                project={project}
                index={i}
                rangeStart={rangeStart}
                dayWidth={DAY_WIDTH}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Footer hint */}
      <div className="border-t border-border px-3 py-1.5 text-center text-[10px] text-muted-foreground">
        Scroll horizontally to explore the timeline
      </div>
    </div>
  );
};

export default TimelineView;
