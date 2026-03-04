import { useState, useMemo, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import { ChevronRight, Briefcase, Pencil, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';
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
import { cn } from '@/lib/utils';
import { useKaivooStore } from '@/stores/useKaivooStore';
import { useKaivooActions } from '@/hooks/useKaivooActions';
import { ProjectStatus } from '@/types';
import { projectStatusConfig, getProjectColor } from '@/lib/project-config';
import TaskDetailsDrawer from '@/components/TaskDetailsDrawer';
import ProjectTaskList from '@/components/projects/ProjectTaskList';
import ProjectNotesList from '@/components/projects/ProjectNotesList';
import ProjectAttachments from '@/components/projects/ProjectAttachments';
import ProjectSettings from '@/components/projects/ProjectSettings';
import { toast } from 'sonner';
import { format, parseISO } from 'date-fns';

const formatDateLong = (d?: string) => {
  if (!d) return null;
  try {
    return format(parseISO(d), 'MMM d, yyyy');
  } catch {
    return d;
  }
};

const ProjectDetail = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

  const projects = useKaivooStore((s) => s.projects);
  const tasks = useKaivooStore((s) => s.tasks);
  const topics = useKaivooStore((s) => s.topics);
  const isLoaded = useKaivooStore((s) => s.isLoaded);
  const { updateProject, deleteProject, addTask, updateTask } = useKaivooActions();

  const project = useMemo(() => projects.find((p) => p.id === projectId), [projects, projectId]);
  const projectIndex = useMemo(() => projects.findIndex((p) => p.id === projectId), [projects, projectId]);

  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [editingDesc, setEditingDesc] = useState(false);
  const [descInput, setDescInput] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const projectTasks = useMemo(() => {
    if (!project) return [];
    return tasks
      .filter((t) => t.projectId === project.id)
      .sort((a, b) => {
        if (a.status === 'done' && b.status !== 'done') return 1;
        if (a.status !== 'done' && b.status === 'done') return -1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [tasks, project]);

  const stats = useMemo(() => {
    const total = projectTasks.length;
    const completed = projectTasks.filter((t) => t.status === 'done').length;
    const open = total - completed;
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, open, progress };
  }, [projectTasks]);

  const handleNameSave = useCallback(() => {
    if (project && nameInput.trim() && nameInput.trim() !== project.name) {
      updateProject(project.id, { name: nameInput.trim() });
      toast.success('Project name updated');
    }
    setEditingName(false);
  }, [project, nameInput, updateProject]);

  const handleDescSave = useCallback(() => {
    if (project && descInput !== (project.description || '')) {
      updateProject(project.id, { description: descInput.trim() || undefined });
    }
    setEditingDesc(false);
  }, [project, descInput, updateProject]);

  const handleDelete = async () => {
    if (!project) return;
    await deleteProject(project.id);
    toast.success('Project deleted');
    navigate('/projects');
  };

  if (!isLoaded) {
    return (
      <AppLayout>
        <div className="mx-auto max-w-4xl px-6 py-8">
          <div className="widget-card animate-pulse">
            <div className="mb-4 h-6 w-1/3 rounded bg-muted" />
            <div className="mb-6 h-8 w-2/3 rounded bg-muted" />
            <div className="mb-2 h-4 w-full rounded bg-muted" />
            <div className="h-4 w-4/5 rounded bg-muted" />
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!project) {
    return (
      <AppLayout>
        <div className="mx-auto max-w-4xl px-6 py-8">
          <div className="widget-card py-12 text-center">
            <Briefcase className="mx-auto mb-4 h-12 w-12 text-muted-foreground/30" />
            <h3 className="mb-2 text-lg font-medium text-foreground">Project not found</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              This project may have been deleted or the link is incorrect.
            </p>
            <Link to="/projects">
              <Button variant="outline">Back to Projects</Button>
            </Link>
          </div>
        </div>
      </AppLayout>
    );
  }

  const color = getProjectColor(project, projectIndex);
  const topicName = project.topicId ? topics.find((t) => t.id === project.topicId)?.name : undefined;

  return (
    <AppLayout>
      <div className="mx-auto max-w-4xl px-6 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
          <Link
            to="/projects"
            className="rounded-sm transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            Projects
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="truncate font-medium text-foreground">{project.name}</span>
        </nav>

        {/* Header */}
        <header className="mb-8">
          <div className="mb-3 flex items-start gap-3">
            <div className="mt-2 h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: color }} />

            {editingName ? (
              <Input
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                onBlur={handleNameSave}
                onKeyDown={(e) => e.key === 'Enter' && handleNameSave()}
                className="h-auto border-0 border-b-2 border-dashed border-primary/40 bg-transparent py-0 text-2xl font-semibold shadow-none focus-visible:ring-2 focus-visible:ring-primary/30"
                autoFocus
              />
            ) : (
              <h1
                role="button"
                tabIndex={0}
                className="cursor-pointer text-2xl font-semibold text-foreground transition-colors hover:text-primary"
                onClick={() => {
                  setNameInput(project.name);
                  setEditingName(true);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setNameInput(project.name);
                    setEditingName(true);
                  }
                }}
              >
                {project.name}
              </h1>
            )}
          </div>

          {/* Status + Topic + Dates + Progress row */}
          <div className="flex flex-wrap items-center gap-3">
            <Select
              value={project.status}
              onValueChange={(v) => updateProject(project.id, { status: v as ProjectStatus })}
            >
              <SelectTrigger
                aria-label="Change project status"
                className={cn(
                  'inline-flex h-7 w-auto items-center gap-1 rounded-full border-0 px-2.5 text-xs font-medium shadow-none',
                  projectStatusConfig[project.status].bg,
                  projectStatusConfig[project.status].color,
                )}
              >
                {projectStatusConfig[project.status].icon}
                <span>{projectStatusConfig[project.status].label}</span>
              </SelectTrigger>
              <SelectContent>
                {Object.entries(projectStatusConfig).map(([key, cfg]) => (
                  <SelectItem key={key} value={key}>
                    <span className={cn('inline-flex items-center gap-1.5', cfg.color)}>
                      {cfg.icon}
                      {cfg.label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {topicName && (
              <Badge variant="secondary" className="text-xs text-info-foreground">
                {topicName}
              </Badge>
            )}

            {(project.startDate || project.endDate) && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                {formatDateLong(project.startDate)}
                {project.startDate && project.endDate && ' – '}
                {formatDateLong(project.endDate)}
              </span>
            )}

            {stats.total > 0 && (
              <span className="ml-auto text-xs text-muted-foreground">{stats.progress}% complete</span>
            )}
          </div>
        </header>

        {/* Description */}
        <div className="mb-6">
          {editingDesc ? (
            <Textarea
              value={descInput}
              onChange={(e) => setDescInput(e.target.value)}
              onBlur={handleDescSave}
              placeholder="Add a description..."
              className="min-h-[80px] resize-none"
              autoFocus
            />
          ) : (
            <div
              role="button"
              tabIndex={0}
              className={cn(
                'group flex cursor-pointer items-start gap-2 rounded-lg p-3 text-sm transition-colors hover:bg-secondary/30',
                project.description ? 'text-muted-foreground' : 'italic text-muted-foreground/50',
              )}
              onClick={() => {
                setDescInput(project.description || '');
                setEditingDesc(true);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setDescInput(project.description || '');
                  setEditingDesc(true);
                }
              }}
            >
              <span className="flex-1">{project.description || 'Add a description...'}</span>
              <Pencil className="mt-0.5 h-3.5 w-3.5 shrink-0 opacity-0 transition-opacity group-hover:opacity-50" />
            </div>
          )}
        </div>

        {/* Stats bar */}
        {stats.total > 0 && (
          <div className="widget-card mb-8">
            <div className="mb-3 flex items-center gap-6 text-sm">
              <span className="text-muted-foreground">
                <strong className="text-foreground">{stats.total}</strong> tasks
              </span>
              <span className="text-muted-foreground">
                <strong className="text-foreground">{stats.open}</strong> open
              </span>
              <span className="text-muted-foreground">
                <strong className="text-success-foreground">{stats.completed}</strong> done
              </span>
              <span className="ml-auto text-muted-foreground">{stats.progress}%</span>
            </div>
            <Progress value={stats.progress} className="h-2" />
          </div>
        )}

        {/* Task list */}
        <ProjectTaskList
          projectTasks={projectTasks}
          allTasks={tasks}
          projectId={project.id}
          onTaskClick={(taskId) => {
            setSelectedTaskId(taskId);
            setDrawerOpen(true);
          }}
          onToggleTask={(taskId, currentStatus) => {
            updateTask(taskId, {
              status: currentStatus === 'done' ? 'todo' : 'done',
              completedAt: currentStatus === 'done' ? undefined : new Date(),
            });
          }}
          onLinkTask={(taskId) => {
            updateTask(taskId, { projectId: project.id });
          }}
          onAddTask={async (title) => {
            await addTask({
              title,
              status: 'todo',
              priority: 'medium',
              tags: [],
              topicIds: project.topicId ? [project.topicId] : [],
              subtasks: [],
              projectId: project.id,
            });
          }}
        />

        {/* Notes */}
        <ProjectNotesList projectId={project.id} />

        {/* Attachments */}
        <ProjectAttachments projectId={project.id} />

        {/* Settings */}
        <ProjectSettings
          project={project}
          color={color}
          topics={topics}
          onUpdate={(fields) => updateProject(project.id, fields)}
          onDeleteClick={() => setDeleteDialogOpen(true)}
        />
      </div>

      {/* Task Details Drawer */}
      <TaskDetailsDrawer taskId={selectedTaskId} open={drawerOpen} onOpenChange={setDrawerOpen} />

      {/* Delete confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete project?</AlertDialogTitle>
            <AlertDialogDescription>
              This will delete the project &ldquo;{project.name}&rdquo;. Tasks in this project will be unlinked but not
              deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
};

export default ProjectDetail;
