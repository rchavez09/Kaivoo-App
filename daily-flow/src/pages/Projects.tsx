import { useState, useMemo } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Plus, Search, Briefcase, ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useKaivooStore } from '@/stores/useKaivooStore';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { ProjectStatus } from '@/types';
import { projectStatusConfig } from '@/lib/project-config';
import ProjectCard, { ProjectTaskStats } from '@/components/projects/ProjectCard';
import CreateProjectDialog from '@/components/projects/CreateProjectDialog';

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
  const projects = useKaivooStore(s => s.projects);
  const tasks = useKaivooStore(s => s.tasks);
  const topics = useKaivooStore(s => s.topics);
  const isLoaded = useKaivooStore(s => s.isLoaded);

  const [activeTab, setActiveTab] = useState<StatusTab>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [topicFilter, setTopicFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useLocalStorage<SortOption>('kaivoo-projects-sort', 'updated');
  const [createOpen, setCreateOpen] = useState(false);

  // Pre-compute task stats per project so ProjectCard doesn't need store access
  const taskStatsMap = useMemo(() => {
    const map: Record<string, ProjectTaskStats> = {};
    for (const project of projects) {
      const projectTasks = tasks.filter(t => t.projectId === project.id);
      const doneTasks = projectTasks.filter(t => t.status === 'done').length;
      const totalTasks = projectTasks.length;
      const progress = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;
      map[project.id] = { totalTasks, doneTasks, progress };
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

  // Filter and sort projects
  const filtered = useMemo(() => {
    let result = [...projects];

    // Status tab
    if (activeTab !== 'all') {
      result = result.filter(p => p.status === activeTab);
    }

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) ||
        (p.description?.toLowerCase().includes(q))
      );
    }

    // Topic filter
    if (topicFilter !== 'all') {
      result = result.filter(p => p.topicId === topicFilter);
    }

    // Sort
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

  const filteredTopics = topics.filter(t => t.id !== 'topic-daily-notes');

  return (
    <AppLayout>
      <div className="mx-auto px-6 py-8 max-w-4xl">
        {/* Header */}
        <header className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground mb-1">Projects</h1>
            <p className="text-sm text-muted-foreground">
              {projects.length} project{projects.length !== 1 ? 's' : ''}
            </p>
          </div>
          <Button className="gap-2" onClick={() => setCreateOpen(true)}>
            <Plus className="w-4 h-4" />
            New Project
          </Button>
        </header>

        {/* Status tabs */}
        <div role="tablist" aria-label="Filter projects by status" className="flex items-center gap-1 mb-6 p-1 bg-[hsl(var(--surface-elevated))] rounded-lg w-fit overflow-x-auto">
          {STATUS_TABS.map(tab => {
            const count = tabCounts[tab.key] || 0;
            // Hide empty tabs (except "all" and "active")
            if (count === 0 && tab.key !== 'all' && tab.key !== 'active') return null;
            return (
              <button
                key={tab.key}
                role="tab"
                aria-selected={activeTab === tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  'px-3 py-1.5 text-sm font-medium rounded-md transition-all',
                  activeTab === tab.key
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {tab.label}
                <span className={cn(
                  'ml-1.5 text-xs',
                  activeTab === tab.key ? 'text-muted-foreground' : 'text-muted-foreground/60'
                )} aria-label={`${count} projects`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search + topic filter + sort */}
        <div className="flex items-center gap-3 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search projects..."
              className="pl-9"
            />
          </div>
          {filteredTopics.length > 0 && (
            <Select value={topicFilter} onValueChange={setTopicFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All topics" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All topics</SelectItem>
                {filteredTopics.map(t => (
                  <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
            <SelectTrigger className="w-44" aria-label="Sort projects">
              <ArrowUpDown className="w-3.5 h-3.5 mr-1.5 text-muted-foreground shrink-0" />
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="widget-card animate-pulse">
                <div className="h-1 bg-muted rounded-full mb-4" />
                <div className="h-5 bg-muted rounded w-2/3 mb-3" />
                <div className="h-3 bg-muted rounded w-full mb-2" />
                <div className="h-3 bg-muted rounded w-4/5 mb-4" />
                <div className="h-2 bg-muted rounded-full w-full" />
              </div>
            ))}
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map((project, i) => (
              <ProjectCard key={project.id} project={project} index={i} taskStats={taskStatsMap[project.id] ?? { totalTasks: 0, doneTasks: 0, progress: 0 }} />
            ))}
          </div>
        ) : (
          <div className="widget-card text-center py-12">
            <Briefcase className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-1">
              {projects.length === 0 ? 'No projects yet' : 'No matching projects'}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {projects.length === 0
                ? 'Create your first project to group related tasks together.'
                : 'Try adjusting your filters or search query.'}
            </p>
            {projects.length === 0 && (
              <Button className="gap-2" onClick={() => setCreateOpen(true)}>
                <Plus className="w-4 h-4" />
                Create Project
              </Button>
            )}
          </div>
        )}
      </div>

      <CreateProjectDialog open={createOpen} onOpenChange={setCreateOpen} />
    </AppLayout>
  );
};

export default Projects;
