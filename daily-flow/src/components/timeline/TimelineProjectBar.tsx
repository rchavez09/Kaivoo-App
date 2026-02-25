import { useNavigate } from 'react-router-dom';
import { Project } from '@/types';
import { useKaivooStore } from '@/stores/useKaivooStore';
import { getProjectColor, getContrastTextColor, projectStatusConfig } from '@/lib/project-config';
import { differenceInDays, parseISO, addDays } from 'date-fns';

interface TimelineProjectBarProps {
  project: Project;
  index: number;
  rangeStart: Date;
  dayWidth: number;
}

const TimelineProjectBar = ({ project, index, rangeStart, dayWidth }: TimelineProjectBarProps) => {
  const navigate = useNavigate();
  const tasks = useKaivooStore(s => s.tasks);

  const color = getProjectColor(project, index);
  const statusCfg = projectStatusConfig[project.status];
  const textColor = getContrastTextColor(color);

  // Fallback: if only one date, derive the other
  const rawStart = project.startDate ? parseISO(project.startDate) : null;
  const rawEnd = project.endDate ? parseISO(project.endDate) : null;

  if (!rawStart && !rawEnd) return null;

  const start = rawStart ?? addDays(rawEnd ?? new Date(), -30); // no start → 30 days before end
  const end = rawEnd ?? addDays(rawStart ?? new Date(), 30);     // no end → 30 days after start

  const offsetDays = differenceInDays(start, rangeStart);
  const spanDays = Math.max(differenceInDays(end, start) + 1, 1);

  const left = offsetDays * dayWidth;
  const width = spanDays * dayWidth;

  const projectTasks = tasks.filter(t => t.projectId === project.id);
  const doneTasks = projectTasks.filter(t => t.status === 'done').length;
  const totalTasks = projectTasks.length;

  return (
    <div className="relative h-10 group" style={{ minWidth: 0 }}>
      {/* Project label (left side, sticky) */}
      <div className="sticky left-0 top-0 h-full flex items-center z-10 pr-2 bg-card" style={{ width: 200 }}>
        <span className="text-xs font-medium text-foreground truncate">{project.name}</span>
      </div>

      {/* Bar */}
      <div
        role="button"
        tabIndex={0}
        aria-label={`${project.name} — ${statusCfg.label}${totalTasks > 0 ? `, ${doneTasks} of ${totalTasks} done` : ''}`}
        className="absolute top-1 h-8 rounded-md cursor-pointer hover:brightness-110 transition-all flex items-center px-2 overflow-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        style={{
          left: 200 + left,
          width: Math.max(width, 24),
          backgroundColor: color,
        }}
        onClick={() => navigate(`/projects/${project.id}`)}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigate(`/projects/${project.id}`); } }}
      >
        <span className="text-[11px] font-medium truncate drop-shadow-sm" style={{ color: textColor }}>
          {totalTasks > 0 && `${doneTasks}/${totalTasks}`}
        </span>
      </div>
    </div>
  );
};

export default TimelineProjectBar;
