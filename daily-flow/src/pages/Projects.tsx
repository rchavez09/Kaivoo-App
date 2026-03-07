import { useState, useMemo, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import { Plus, Search, Briefcase, ArrowUpDown, Inbox, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { useKaivooStore } from '@/stores/useKaivooStore';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { ProjectStatus } from '@/types';
import { projectStatusConfig } from '@/lib/project-config';
import ProjectCard, { ProjectTaskStats } from '@/components/projects/ProjectCard';
import CreateProjectDialog from '@/components/projects/CreateProjectDialog';

const TasksContent = lazy(() => import('@/pages/Tasks').then((m) => ({ default: m.TasksContent })));

type SortOption = 'updated' | 'name-asc' | 'name-desc' | 'created-new' | 'created-old' | 'progress';

type StatusTab = 'all' | ProjectStatus;

const STATUS_TABS: { key: StatusTab; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'planning', label: 'Planning' },
  { key: 'paused', label: 'Paused' },
  { key: 'completed', label: 'Done' },
  { key: 'archived', label: 'Archived' },
];

const Projects = () => {
  const navigate = useNavigate();
  const projects = useKaivooStore((s) => s.projects);
  const tasks = useKaivooStore((s) => s.tasks);
  const topics = useKaivooStore((s) => s.topics);
  const isLoaded = useKaivooStore((s) => s.isLoaded);

  // Top-level tab (persisted)
  const [topTab, setTopTab] = useLocalStorage<string>('kaivoo-projects-top-tab', 'all-tasks');

  // Projects-tab state
  const [activeTab, setActiveTab] = useState<StatusTab>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [topicFilter, setTopicFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useLocalStorage<SortOption>('kaivoo-projects-sort', 'updated');
  const [createOpen, setCreateOpen] = useState(false);

  // Pre-compute task stats per project
  const taskStatsMap = useMemo(() => {
    const map: Record<string, ProjectTaskStats> = {};
    for (const project of projects) {
      map[project.id] = { totalTasks: 0, doneTasks: 0, progress: 0 };
    }
    for (const task of tasks) {
      if (task.projectId && map[task.projectId]) {
        map[task.projectId].totalTasks++;
        if (task.status === 'done') map[task.projectId].doneTasks++;
      }
    }
    for (const stats of Object.values(map)) {
      stats.progress = stats.totalTasks > 0 ? Math.round((stats.doneTasks / stats.totalTasks) * 100) : 0;
    }
    return map;
  }, [projects, tasks]);

  // Tab counts
  const tabCounts = useMemo(() => {
    const counts: Record<string, number> = { all: projects.length };
    for (const p of projects) {
      counts[p.status] = (counts[p.status] || 0) + 1;
    }
    return counts;
  }, [projects]);

  // Inbox: tasks with no project
  const inboxCount = useMemo(() => tasks.filter((t) => !t.projectId).length, [tasks]);

  // Filter and sort projects
  const filtered = useMemo(() => {
    let result = [...projects];

    if (activeTab !== 'all') {
      result = result.filter((p) => p.status === activeTab);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((p) => p.name.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q));
    }

    if (topicFilter !== 'all') {
      result = result.filter((p) => p.topicId === topicFilter);
    }

    result.sort((a, b) => {
      switch (sortBy) {
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        case 'created-new':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'created-old':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'progress': {
          const progA = taskStatsMap[a.id]?.progress ?? 0;
          const progB = taskStatsMap[b.id]?.progress ?? 0;
          return progB - progA;
        }
        case 'updated':
        default: {
          const orderA = projectStatusConfig[a.status].order;
          const orderB = projectStatusConfig[b.status].order;
          if (orderA !== orderB) return orderA - orderB;
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        }
      }
    });

    return result;
  }, [projects, activeTab, searchQuery, topicFilter, sortBy, taskStatsMap]);

  return (
    <AppLayout>
      <Tabs value={topTab} onValueChange={setTopTab} className="flex h-full flex-col">
        {/* Top-level tab selector */}
        <div className="border-b border-border bg-background px-6 pt-6">
          <TabsList>
            <TabsTrigger value="all-tasks">All Tasks</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
          </TabsList>
        </div>

        {/* All Tasks tab */}
        <TabsContent value="all-tasks" className="mt-0 flex-1">
          <Suspense
            fallback={
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            }
          >
            <TasksContent />
          </Suspense>
        </TabsContent>

        {/* Projects tab */}
        <TabsContent value="projects" className="mt-0 flex-1">
          <div className="mx-auto max-w-4xl px-6 py-8">
            {/* Header */}
            <header className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="mb-1 text-2xl font-semibold text-foreground">Projects</h2>
                <p className="text-sm text-muted-foreground">
                  {projects.length} project{projects.length !== 1 ? 's' : ''}
                </p>
              </div>
              <Button className="gap-2" onClick={() => setCreateOpen(true)}>
                <Plus className="h-4 w-4" />
                New Project
              </Button>
            </header>

            {/* Status tabs */}
            <div
              role="tablist"
              aria-label="Filter projects by status"
              className="mb-6 flex w-fit items-center gap-1 overflow-x-auto rounded-lg bg-[hsl(var(--surface-elevated))] p-1"
            >
              {STATUS_TABS.map((tab) => {
                const count = tabCounts[tab.key] || 0;
                if (count === 0 && tab.key !== 'all' && tab.key !== 'active') return null;
                return (
                  <button
                    key={tab.key}
                    role="tab"
                    aria-selected={activeTab === tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={cn(
                      'rounded-md px-3 py-1.5 text-sm font-medium transition-all',
                      activeTab === tab.key
                        ? 'bg-background text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground',
                    )}
                  >
                    {tab.label}
                    <span
                      className={cn(
                        'ml-1.5 text-xs',
                        activeTab === tab.key ? 'text-muted-foreground' : 'text-muted-foreground/60',
                      )}
                      aria-label={`${count} projects`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Search + topic filter + sort */}
            <div className="mb-6 flex items-center gap-3">
              <div className="relative max-w-sm flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search projects..."
                  className="pl-9"
                />
              </div>
              {topics.length > 0 && (
                <Select value={topicFilter} onValueChange={setTopicFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="All topics" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All topics</SelectItem>
                    {topics.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
                <SelectTrigger className="w-44" aria-label="Sort projects">
                  <ArrowUpDown className="mr-1.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="updated">Last Updated</SelectItem>
                  <SelectItem value="name-asc">Name A-Z</SelectItem>
                  <SelectItem value="name-desc">Name Z-A</SelectItem>
                  <SelectItem value="created-new">Newest First</SelectItem>
                  <SelectItem value="created-old">Oldest First</SelectItem>
                  <SelectItem value="progress">Progress %</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Card grid */}
            {!isLoaded ? (
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="widget-card animate-pulse">
                    <div className="mb-4 h-1 rounded-full bg-muted" />
                    <div className="mb-3 h-5 w-2/3 rounded bg-muted" />
                    <div className="mb-2 h-3 w-full rounded bg-muted" />
                    <div className="mb-4 h-3 w-4/5 rounded bg-muted" />
                    <div className="h-2 w-full rounded-full bg-muted" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                {/* Inbox card — unassigned tasks */}
                {inboxCount > 0 && activeTab === 'all' && (
                  <button
                    onClick={() => navigate('/projects/inbox')}
                    className="widget-card group cursor-pointer text-left transition-shadow hover:shadow-md"
                  >
                    <div className="mb-3 flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                        <Inbox className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-foreground group-hover:text-primary">Inbox</h3>
                        <p className="text-xs text-muted-foreground">Unassigned tasks</p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      <strong className="text-foreground">{inboxCount}</strong> task
                      {inboxCount !== 1 ? 's' : ''} without a project
                    </p>
                  </button>
                )}

                {filtered.map((project, i) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    index={i}
                    taskStats={taskStatsMap[project.id] ?? { totalTasks: 0, doneTasks: 0, progress: 0 }}
                  />
                ))}

                {filtered.length === 0 && inboxCount === 0 && (
                  <div className="col-span-full">
                    <div className="widget-card py-12 text-center">
                      <Briefcase className="mx-auto mb-4 h-12 w-12 text-muted-foreground/30" />
                      <h3 className="mb-1 text-lg font-medium text-foreground">
                        {projects.length === 0 ? 'No projects yet' : 'No matching projects'}
                      </h3>
                      <p className="mb-4 text-sm text-muted-foreground">
                        {projects.length === 0
                          ? 'Create your first project to group related tasks together.'
                          : 'Try adjusting your filters or search query.'}
                      </p>
                      {projects.length === 0 && (
                        <Button className="gap-2" onClick={() => setCreateOpen(true)}>
                          <Plus className="h-4 w-4" />
                          Create Project
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <CreateProjectDialog open={createOpen} onOpenChange={setCreateOpen} />
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
};

export default Projects;
