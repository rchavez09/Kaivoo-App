import { useState, useMemo, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import {
  ChevronRight, Trash2, Plus, Circle, CheckCircle2,
  Calendar, Flag, ChevronDown, Link2, Briefcase, Pencil,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
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
import { projectStatusConfig, getProjectColor, PROJECT_COLORS, PROJECT_COLOR_NAMES } from '@/lib/project-config';
import { priorityConfig } from '@/lib/task-config';
import TaskDetailsDrawer from '@/components/TaskDetailsDrawer';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { toast } from 'sonner';
import { format, parseISO } from 'date-fns';

const formatDateLong = (d?: string) => {
  if (!d) return null;
  try { return format(parseISO(d), 'MMM d, yyyy'); } catch { return d; }
};

const formatDateShort = (d?: string) => {
  if (!d) return null;
  try { return format(parseISO(d), 'MMM d'); } catch { return d; }
};

const ProjectDetail = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

  const projects = useKaivooStore(s => s.projects);
  const tasks = useKaivooStore(s => s.tasks);
  const topics = useKaivooStore(s => s.topics);
  const isLoaded = useKaivooStore(s => s.isLoaded);
  const { updateProject, deleteProject, addTask, updateTask } = useKaivooActions();

  const project = useMemo(() => projects.find(p => p.id === projectId), [projects, projectId]);
  const projectIndex = useMemo(() => projects.findIndex(p => p.id === projectId), [projects, projectId]);

  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [editingDesc, setEditingDesc] = useState(false);
  const [descInput, setDescInput] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [linkPopoverOpen, setLinkPopoverOpen] = useState(false);
  const [linkSearch, setLinkSearch] = useState('');

  const projectTasks = useMemo(() => {
    if (!project) return [];
    return tasks
      .filter(t => t.projectId === project.id)
      .sort((a, b) => {
        if (a.status === 'done' && b.status !== 'done') return 1;
        if (a.status !== 'done' && b.status === 'done') return -1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [tasks, project]);

  const linkableTasks = useMemo(() => {
    if (!project) return [];
    return tasks
      .filter(t => t.projectId !== project.id && t.status !== 'done')
      .filter(t => !linkSearch || t.title.toLowerCase().includes(linkSearch.toLowerCase()))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 20);
  }, [tasks, project, linkSearch]);

  const stats = useMemo(() => {
    const total = projectTasks.length;
    const completed = projectTasks.filter(t => t.status === 'done').length;
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

  const handleAddTask = async () => {
    if (!newTaskTitle.trim() || !project) return;
    await addTask({
      title: newTaskTitle.trim(),
      status: 'todo',
      priority: 'medium',
      tags: [],
      topicIds: project.topicId ? [project.topicId] : [],
      subtasks: [],
      projectId: project.id,
    });
    setNewTaskTitle('');
  };

  if (!isLoaded) {
    return (
      <AppLayout>
        <div className="mx-auto px-6 py-8 max-w-4xl">
          <div className="widget-card animate-pulse">
            <div className="h-6 bg-muted rounded w-1/3 mb-4" />
            <div className="h-8 bg-muted rounded w-2/3 mb-6" />
            <div className="h-4 bg-muted rounded w-full mb-2" />
            <div className="h-4 bg-muted rounded w-4/5" />
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!project) {
    return (
      <AppLayout>
        <div className="mx-auto px-6 py-8 max-w-4xl">
          <div className="widget-card text-center py-12">
            <Briefcase className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">Project not found</h3>
            <p className="text-sm text-muted-foreground mb-4">
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
  const topicName = project.topicId ? topics.find(t => t.id === project.topicId)?.name : undefined;

  return (
    <AppLayout>
      <div className="mx-auto px-6 py-8 max-w-4xl">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link to="/projects" className="hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm">Projects</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-foreground font-medium truncate">{project.name}</span>
        </nav>

        {/* Header */}
        <header className="mb-8">
          <div className="flex items-start gap-3 mb-3">
            <div className="w-3 h-3 rounded-full mt-2 shrink-0" style={{ backgroundColor: color }} />

            {editingName ? (
              <Input
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                onBlur={handleNameSave}
                onKeyDown={(e) => e.key === 'Enter' && handleNameSave()}
                className="text-2xl font-semibold h-auto py-0 border-0 border-b-2 border-dashed border-primary/40 shadow-none focus-visible:ring-2 focus-visible:ring-primary/30 bg-transparent"
                autoFocus
              />
            ) : (
              <h1
                role="button"
                tabIndex={0}
                className="text-2xl font-semibold text-foreground cursor-pointer hover:text-primary transition-colors"
                onClick={() => { setNameInput(project.name); setEditingName(true); }}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setNameInput(project.name); setEditingName(true); } }}
              >
                {project.name}
              </h1>
            )}
          </div>

          {/* Status + Topic + Dates + Progress row */}
          <div className="flex items-center gap-3 flex-wrap">
            <Select
              value={project.status}
              onValueChange={(v) => updateProject(project.id, { status: v as ProjectStatus })}
            >
              <SelectTrigger aria-label="Change project status" className={cn(
                'w-auto h-7 text-xs border-0 shadow-none px-2.5 rounded-full font-medium inline-flex items-center gap-1',
                projectStatusConfig[project.status].bg,
                projectStatusConfig[project.status].color,
              )}>
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
              <Badge variant="secondary" className="text-xs text-info-foreground">{topicName}</Badge>
            )}

            {(project.startDate || project.endDate) && (
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {formatDateLong(project.startDate)}{project.startDate && project.endDate && ' – '}{formatDateLong(project.endDate)}
              </span>
            )}

            {stats.total > 0 && (
              <span className="text-xs text-muted-foreground ml-auto">{stats.progress}% complete</span>
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
                'text-sm cursor-pointer rounded-lg p-3 hover:bg-secondary/30 transition-colors group flex items-start gap-2',
                project.description ? 'text-muted-foreground' : 'text-muted-foreground/50 italic'
              )}
              onClick={() => { setDescInput(project.description || ''); setEditingDesc(true); }}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setDescInput(project.description || ''); setEditingDesc(true); } }}
            >
              <span className="flex-1">
                {project.description || 'Add a description...'}
              </span>
              <Pencil className="w-3.5 h-3.5 opacity-0 group-hover:opacity-50 transition-opacity shrink-0 mt-0.5" />
            </div>
          )}
        </div>

        {/* Stats bar */}
        {stats.total > 0 && (
          <div className="widget-card mb-8">
            <div className="flex items-center gap-6 text-sm mb-3">
              <span className="text-muted-foreground">
                <strong className="text-foreground">{stats.total}</strong> tasks
              </span>
              <span className="text-muted-foreground">
                <strong className="text-foreground">{stats.open}</strong> open
              </span>
              <span className="text-muted-foreground">
                <strong className="text-success-foreground">{stats.completed}</strong> done
              </span>
              <span className="text-muted-foreground ml-auto">
                {stats.progress}%
              </span>
            </div>
            <Progress value={stats.progress} className="h-2" />
          </div>
        )}

        {/* Task list */}
        <div className="widget-card">
          <div className="widget-header">
            <h2 className="widget-title">Tasks</h2>
            <div className="flex items-center gap-2">
              <Popover open={linkPopoverOpen} onOpenChange={(open) => { setLinkPopoverOpen(open); if (!open) setLinkSearch(''); }}>
                <PopoverTrigger asChild>
                  <Button size="sm" variant="outline" className="gap-1.5 text-xs h-7">
                    <Link2 className="w-3.5 h-3.5" />
                    Link existing
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-72 p-0" align="end">
                  <div className="p-2 border-b border-border">
                    <Input
                      value={linkSearch}
                      onChange={(e) => setLinkSearch(e.target.value)}
                      placeholder="Search tasks..."
                      className="h-8 text-xs"
                      autoFocus
                    />
                  </div>
                  <div className="max-h-56 overflow-y-auto">
                    {linkableTasks.length === 0 ? (
                      <p className="text-xs text-muted-foreground text-center py-4">
                        {linkSearch ? 'No matching tasks' : 'No unassigned tasks'}
                      </p>
                    ) : (
                      linkableTasks.map(task => (
                        <button
                          key={task.id}
                          onClick={() => {
                            updateTask(task.id, { projectId: project.id });
                            toast.success(`Linked "${task.title}"`);
                          }}
                          className="w-full text-left px-3 py-2 text-sm hover:bg-secondary/50 transition-colors flex items-center gap-2 border-b border-border/30 last:border-0"
                        >
                          <Circle className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                          <span className="truncate">{task.title}</span>
                        </button>
                      ))
                    )}
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Task rows */}
          {projectTasks.length > 0 ? (
            <div className="divide-y divide-border">
              {projectTasks.map(task => {
                const pCfg = priorityConfig[task.priority];
                return (
                  <div key={task.id} className="py-1">
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => { setSelectedTaskId(task.id); setDrawerOpen(true); }}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedTaskId(task.id); setDrawerOpen(true); } }}
                      className="flex items-center gap-3 py-2 px-2 -mx-2 hover:bg-secondary/30 rounded-lg transition-colors cursor-pointer group"
                    >
                      <button
                        aria-label={task.status === 'done' ? `Mark "${task.title}" as not done` : `Mark "${task.title}" as done`}
                        onClick={(e) => {
                          e.stopPropagation();
                          updateTask(task.id, {
                            status: task.status === 'done' ? 'todo' : 'done',
                            completedAt: task.status === 'done' ? undefined : new Date(),
                          });
                        }}
                        className="shrink-0"
                      >
                        {task.status === 'done' ? (
                          <CheckCircle2 className="w-5 h-5 text-success-foreground" />
                        ) : (
                          <Circle className="w-5 h-5 text-muted-foreground group-hover:text-foreground" />
                        )}
                      </button>

                      <div className="flex-1 min-w-0">
                        <span className={cn(
                          'text-sm truncate block',
                          task.status === 'done' && 'line-through text-muted-foreground'
                        )}>
                          {task.title}
                        </span>
                        {task.subtasks.length > 0 && (
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <div className="h-1.5 w-16 bg-secondary rounded-full overflow-hidden">
                              <div
                                className="h-full bg-primary rounded-full transition-all"
                                style={{ width: `${Math.round((task.subtasks.filter(s => s.completed).length / task.subtasks.length) * 100)}%` }}
                              />
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {task.subtasks.filter(s => s.completed).length}/{task.subtasks.length}
                            </span>
                          </div>
                        )}
                      </div>

                      <span className={cn('text-xs font-medium', pCfg.color)}>
                        <Flag className="w-3 h-3 inline mr-0.5" />
                        {pCfg.label}
                      </span>

                      {task.dueDate && (
                        <span className="text-xs text-muted-foreground">
                          {formatDateShort(task.dueDate)}
                        </span>
                      )}

                      <ChevronDown className="w-3.5 h-3.5 text-muted-foreground -rotate-90 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-12 text-center">
              <CheckCircle2 className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
              <h3 className="text-sm font-medium text-foreground mb-1">No tasks yet</h3>
              <p className="text-xs text-muted-foreground">
                Add a task below or link an existing one.
              </p>
            </div>
          )}

          {/* Add task input */}
          <div className="mt-4 p-3 bg-[hsl(var(--surface-elevated))] rounded-lg border border-border">
            <div className="flex items-center gap-2">
              <Circle className="w-5 h-5 text-muted-foreground shrink-0" />
              <Input
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
                placeholder="Add a task to this project..."
                className="border-0 bg-transparent focus-visible:ring-0 shadow-none px-0"
              />
              <Button size="sm" onClick={handleAddTask} disabled={!newTaskTitle.trim()}>
                <Plus className="w-4 h-4 mr-1" />
                Add
              </Button>
            </div>
          </div>
        </div>

        {/* Settings card */}
        <div className="widget-card mt-8">
          <div className="widget-header">
            <h2 className="widget-title">Settings</h2>
          </div>

          <div className="space-y-5">
            {/* Color */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Color</label>
              <div className="flex flex-wrap gap-2">
                {PROJECT_COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => updateProject(project.id, { color: c })}
                    className={cn(
                      'w-9 h-9 rounded-full border-2 transition-all',
                      color === c ? 'border-foreground scale-110' : 'border-transparent hover:scale-105'
                    )}
                    style={{ backgroundColor: c }}
                    aria-label={`Select ${PROJECT_COLOR_NAMES[c] || 'color'}`}
                  />
                ))}
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  Start Date
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="w-full justify-start text-left font-normal text-sm">
                      {project.startDate ? format(parseISO(project.startDate), 'MMM d, yyyy') : 'Set start date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={project.startDate ? parseISO(project.startDate) : undefined}
                      onSelect={(date) => {
                        updateProject(project.id, { startDate: date ? format(date, 'yyyy-MM-dd') : undefined });
                      }}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                    <div className="p-2 border-t border-border flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs flex-1"
                        onClick={() => updateProject(project.id, { startDate: format(new Date(), 'yyyy-MM-dd') })}
                      >
                        Today
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs flex-1"
                        onClick={() => updateProject(project.id, { startDate: undefined })}
                      >
                        Clear
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  End Date
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="w-full justify-start text-left font-normal text-sm">
                      {project.endDate ? format(parseISO(project.endDate), 'MMM d, yyyy') : 'Set end date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={project.endDate ? parseISO(project.endDate) : undefined}
                      onSelect={(date) => {
                        updateProject(project.id, { endDate: date ? format(date, 'yyyy-MM-dd') : undefined });
                      }}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                    <div className="p-2 border-t border-border flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs flex-1"
                        onClick={() => updateProject(project.id, { endDate: format(new Date(), 'yyyy-MM-dd') })}
                      >
                        Today
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs flex-1"
                        onClick={() => updateProject(project.id, { endDate: undefined })}
                      >
                        Clear
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Delete */}
            <div className="pt-3 border-t border-border/50">
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => setDeleteDialogOpen(true)}
              >
                <Trash2 className="w-4 h-4 mr-1.5" />
                Delete Project
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Task Details Drawer */}
      <TaskDetailsDrawer
        taskId={selectedTaskId}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
      />

      {/* Delete confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete project?</AlertDialogTitle>
            <AlertDialogDescription>
              This will delete the project &ldquo;{project.name}&rdquo;. Tasks in this project will be unlinked but not deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
};

export default ProjectDetail;
