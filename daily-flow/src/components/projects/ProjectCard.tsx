import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar } from 'lucide-react';
import { Project } from '@/types';
import { useKaivooStore } from '@/stores/useKaivooStore';
import { projectStatusConfig, getProjectColor } from '@/lib/project-config';
import { cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';

export interface ProjectTaskStats {
  totalTasks: number;
  doneTasks: number;
  progress: number;
}

interface ProjectCardProps {
  project: Project;
  index: number;
  taskStats: ProjectTaskStats;
}

const ProjectCard = React.memo(({ project, index, taskStats }: ProjectCardProps) => {
  const navigate = useNavigate();
  const topics = useKaivooStore((s) => s.topics);

  const color = getProjectColor(project, index);
  const statusCfg = projectStatusConfig[project.status];

  const { totalTasks, doneTasks, progress } = taskStats;

  const topicName = project.topicId ? topics.find((t) => t.id === project.topicId)?.name : undefined;

  const formatDate = (d?: string) => {
    if (!d) return null;
    try {
      return format(parseISO(d), 'MMM d');
    } catch {
      return d;
    }
  };

  const startLabel = formatDate(project.startDate);
  const endLabel = formatDate(project.endDate);
  const dateRange = startLabel && endLabel ? `${startLabel} – ${endLabel}` : startLabel || endLabel || null;

  return (
    <article
      onClick={() => navigate(`/projects/${project.id}`)}
      className="widget-card group relative cursor-pointer overflow-hidden p-0 transition-all hover:-translate-y-px"
    >
      {/* Accessible link overlay */}
      <a
        href={`/projects/${project.id}`}
        className="absolute inset-0 z-10"
        aria-label={`Open project: ${project.name}`}
        tabIndex={0}
        onClick={(e) => {
          e.preventDefault();
          navigate(`/projects/${project.id}`);
        }}
      />

      {/* Color accent strip */}
      <div className="h-1" style={{ backgroundColor: color }} />

      <div className="p-5">
        {/* Header: Name + Status */}
        <div className="mb-2 flex items-start justify-between gap-2">
          <h3 className="line-clamp-2 text-base font-medium text-foreground transition-colors group-hover:text-primary">
            {project.name}
          </h3>
          <span
            className={cn(
              'inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium',
              statusCfg.bg,
              statusCfg.color,
            )}
          >
            {statusCfg.icon}
            {statusCfg.label}
          </span>
        </div>

        {/* Description */}
        {project.description && (
          <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">{project.description}</p>
        )}

        {/* Meta row: topic, dates */}
        <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          {topicName && <span className="rounded bg-secondary/60 px-1.5 py-0.5 text-info-foreground">{topicName}</span>}
          {dateRange && (
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {dateRange}
            </span>
          )}
        </div>

        {/* Task progress */}
        {totalTasks > 0 && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                {doneTasks}/{totalTasks} done
              </span>
              <span>{progress}%</span>
            </div>
            <div
              className="h-1.5 overflow-hidden rounded-full bg-muted"
              role="progressbar"
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Project completion: ${progress}%`}
            >
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${progress}%`, backgroundColor: color }}
              />
            </div>
          </div>
        )}
      </div>
    </article>
  );
});

ProjectCard.displayName = 'ProjectCard';

export default ProjectCard;
