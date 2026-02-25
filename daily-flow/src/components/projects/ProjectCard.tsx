import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar } from 'lucide-react';
import { Project } from '@/types';
import { useKaivooStore } from '@/stores/useKaivooStore';
import { projectStatusConfig, getProjectColor } from '@/lib/project-config';
import { cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';

interface ProjectCardProps {
  project: Project;
  index: number;
}

const ProjectCard = React.memo(({ project, index }: ProjectCardProps) => {
  const navigate = useNavigate();
  const tasks = useKaivooStore(s => s.tasks);
  const topics = useKaivooStore(s => s.topics);

  const color = getProjectColor(project, index);
  const statusCfg = projectStatusConfig[project.status];

  const projectTasks = tasks.filter(t => t.projectId === project.id);
  const doneTasks = projectTasks.filter(t => t.status === 'done').length;
  const totalTasks = projectTasks.length;
  const progress = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  const topicName = project.topicId
    ? topics.find(t => t.id === project.topicId)?.name
    : undefined;

  const formatDate = (d?: string) => {
    if (!d) return null;
    try { return format(parseISO(d), 'MMM d'); } catch { return d; }
  };

  const startLabel = formatDate(project.startDate);
  const endLabel = formatDate(project.endDate);
  const dateRange = startLabel && endLabel
    ? `${startLabel} – ${endLabel}`
    : startLabel || endLabel || null;

  return (
    <article
      onClick={() => navigate(`/projects/${project.id}`)}
      className="widget-card overflow-hidden p-0 hover:-translate-y-px transition-all cursor-pointer group relative"
    >
      {/* Accessible link overlay */}
      <a
        href={`/projects/${project.id}`}
        className="absolute inset-0 z-10"
        aria-label={`Open project: ${project.name}`}
        tabIndex={0}
        onClick={(e) => { e.preventDefault(); navigate(`/projects/${project.id}`); }}
      />

      {/* Color accent strip */}
      <div className="h-1" style={{ backgroundColor: color }} />

      <div className="p-5">
        {/* Header: Name + Status */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-medium text-base text-foreground line-clamp-2 group-hover:text-primary transition-colors">
            {project.name}
          </h3>
          <span className={cn(
            'inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full shrink-0',
            statusCfg.bg, statusCfg.color
          )}>
            {statusCfg.icon}
            {statusCfg.label}
          </span>
        </div>

        {/* Description */}
        {project.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {project.description}
          </p>
        )}

        {/* Meta row: topic, dates */}
        <div className="flex items-center gap-2 flex-wrap text-xs text-muted-foreground mb-3">
          {topicName && (
            <span className="bg-secondary/60 px-1.5 py-0.5 rounded text-info">
              {topicName}
            </span>
          )}
          {dateRange && (
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {dateRange}
            </span>
          )}
        </div>

        {/* Task progress */}
        {totalTasks > 0 && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{doneTasks}/{totalTasks} done</span>
              <span>{progress}%</span>
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
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
