import { useState, useMemo } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import {
  CheckSquare,
  Plus,
  Search,
  SlidersHorizontal,
  Circle,
  CheckCircle2,
  Calendar,
  X,
  Flag,
  ChevronRight,
  LayoutList,
  Columns3,
  ChevronDown,
  ArrowUpDown,
  GanttChart,
} from 'lucide-react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';
import { useKaivooStore } from '@/stores/useKaivooStore';
import { useKaivooActions } from '@/hooks/useKaivooActions';
import { Task, TaskStatus, TaskPriority } from '@/types';
import TaskDetailsDrawer from '@/components/TaskDetailsDrawer';
import BulkActionBar from '@/components/BulkActionBar';
import KanbanBoard from '@/components/KanbanBoard';
import TimelineView from '@/components/timeline/TimelineView';
import { isToday, isTomorrow, isThisWeek } from '@/lib/dateUtils';
import { statusConfig, priorityConfig, statusOrder } from '@/lib/task-config';
import { toast } from 'sonner';

type ViewTab = 'open' | 'today' | 'tomorrow' | 'week' | 'completed';
type ViewMode = 'list' | 'kanban' | 'timeline';
type SortOption = 'created' | 'due' | 'priority' | 'title' | 'status';
type SortDirection = 'asc' | 'desc';

const TASKS_VIEW_PREFS_KEY = 'kaivoo-tasks-view-preferences';

interface TasksViewPrefs {
  activeTab: ViewTab;
  viewMode: ViewMode;
  sortBy: SortOption;
  sortDirection: SortDirection;
  expandedTasks: string[];
  topicFilter: string;
  tagFilter: string;
}

const DEFAULT_PREFS: TasksViewPrefs = {
  activeTab: 'open',
  viewMode: 'list',
  sortBy: 'created',
  sortDirection: 'desc',
  expandedTasks: [],
  topicFilter: 'all',
  tagFilter: 'all',
};

const Tasks = () => {
  const tasks = useKaivooStore((s) => s.tasks);
  const projects = useKaivooStore((s) => s.projects);
  const topics = useKaivooStore((s) => s.topics);
  const topicPages = useKaivooStore((s) => s.topicPages);
  const { addTask, updateTask, deleteTask, toggleSubtask } = useKaivooActions();

  const [prefs, setPrefs] = useLocalStorage<TasksViewPrefs>(TASKS_VIEW_PREFS_KEY, DEFAULT_PREFS);

  const [activeTab, setActiveTab] = useState<ViewTab>(prefs.activeTab);
  const [viewMode, setViewMode] = useState<ViewMode>(prefs.viewMode);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | 'all'>('all');
  const [topicFilter, setTopicFilter] = useState<string>(prefs.topicFilter);
  const [tagFilter, setTagFilter] = useState<string>(prefs.tagFilter);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [showNewTaskInput, setShowNewTaskInput] = useState(false);

  // Sorting
  const [sortBy, setSortBy] = useState<SortOption>(prefs.sortBy);
  const [sortDirection, setSortDirection] = useState<SortDirection>(prefs.sortDirection);

  // Expanded subtasks state
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(() => {
    return new Set(prefs.expandedTasks);
  });

  // Quick filter chips
  const [quickStatus, setQuickStatus] = useState<TaskStatus | null>(null);
  const [quickDue, setQuickDue] = useState<'today' | 'week' | null>(null);

  // Bulk selection
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedTaskIds, setSelectedTaskIds] = useState<Set<string>>(new Set());

  const toggleSelectionMode = () => {
    if (selectionMode) {
      setSelectedTaskIds(new Set());
    }
    setSelectionMode(!selectionMode);
  };

  const toggleTaskSelection = (taskId: string) => {
    setSelectedTaskIds((prev) => {
      const next = new Set(prev);
      if (next.has(taskId)) next.delete(taskId);
      else next.add(taskId);
      return next;
    });
  };

  const selectAll = () => {
    setSelectedTaskIds(new Set(filteredTasks.map((t) => t.id)));
  };

  const deselectAll = () => {
    setSelectedTaskIds(new Set());
  };

  const handleBulkStatusChange = async (status: TaskStatus) => {
    const ids = [...selectedTaskIds];
    const results = await Promise.allSettled(
      ids.map((id) => updateTask(id, { status, completedAt: status === 'done' ? new Date() : undefined })),
    );
    const failed = results.filter((r) => r.status === 'rejected').length;
    if (failed > 0) toast.error(`${failed} of ${ids.length} tasks failed to update.`);
    setSelectedTaskIds(new Set());
    setSelectionMode(false);
  };

  const handleBulkPriorityChange = async (priority: TaskPriority) => {
    const ids = [...selectedTaskIds];
    const results = await Promise.allSettled(ids.map((id) => updateTask(id, { priority })));
    const failed = results.filter((r) => r.status === 'rejected').length;
    if (failed > 0) toast.error(`${failed} of ${ids.length} tasks failed to update.`);
    setSelectedTaskIds(new Set());
    setSelectionMode(false);
  };

  const handleBulkDueDateChange = async (date: string | null) => {
    const ids = [...selectedTaskIds];
    const results = await Promise.allSettled(ids.map((id) => updateTask(id, { dueDate: date ?? undefined })));
    const failed = results.filter((r) => r.status === 'rejected').length;
    if (failed > 0) toast.error(`${failed} of ${ids.length} tasks failed to update.`);
    setSelectedTaskIds(new Set());
    setSelectionMode(false);
  };

  const handleBulkDelete = async () => {
    const ids = [...selectedTaskIds];
    const results = await Promise.allSettled(ids.map((id) => deleteTask(id)));
    const failed = results.filter((r) => r.status === 'rejected').length;
    if (failed > 0) toast.error(`${failed} of ${ids.length} tasks failed to delete.`);
    setSelectedTaskIds(new Set());
    setSelectionMode(false);
  };

  const handleSetActiveTab = (tab: ViewTab) => {
    setActiveTab(tab);
    setPrefs((prev) => ({ ...prev, activeTab: tab }));
  };

  const handleSetViewMode = (mode: ViewMode) => {
    setViewMode(mode);
    setPrefs((prev) => ({ ...prev, viewMode: mode }));
  };

  const handleSetSortBy = (sort: SortOption) => {
    setSortBy(sort);
    setPrefs((prev) => ({ ...prev, sortBy: sort }));
  };

  const handleSetSortDirection = (dir: SortDirection) => {
    setSortDirection(dir);
    setPrefs((prev) => ({ ...prev, sortDirection: dir }));
  };

  const handleSetTopicFilter = (value: string) => {
    setTopicFilter(value);
    setPrefs((prev) => ({ ...prev, topicFilter: value }));
  };

  const handleSetTagFilter = (value: string) => {
    setTagFilter(value);
    setPrefs((prev) => ({ ...prev, tagFilter: value }));
  };

  // Compute available topics and tags for filter dropdowns
  const availableTopics = useMemo(() => {
    const topicIdSet = new Set(tasks.flatMap((t) => t.topicIds));
    const result: { id: string; name: string }[] = [];
    topicIdSet.forEach((id) => {
      const topic = topics.find((t) => t.id === id);
      if (topic) {
        result.push({ id, name: topic.name });
        return;
      }
      const page = topicPages.find((p) => p.id === id);
      if (page) {
        const parent = topics.find((t) => t.id === page.topicId);
        result.push({ id, name: parent ? `${parent.name}/${page.name}` : page.name });
      }
    });
    return result.sort((a, b) => a.name.localeCompare(b.name));
  }, [tasks, topics, topicPages]);

  const availableTags = useMemo(() => {
    const tagSet = new Set(tasks.flatMap((t) => t.tags));
    return [...tagSet].sort();
  }, [tasks]);

  const getTopicName = (topicId: string) => {
    const topic = topics.find((t) => t.id === topicId);
    if (topic) return topic.name;
    const page = topicPages.find((p) => p.id === topicId);
    if (page) {
      const parentTopic = topics.find((t) => t.id === page.topicId);
      return parentTopic ? `${parentTopic.name}/${page.name}` : page.name;
    }
    return null;
  };

  const getProgress = (task: Task) => {
    if (task.subtasks.length === 0) return null;
    const completed = task.subtasks.filter((s) => s.completed).length;
    return Math.round((completed / task.subtasks.length) * 100);
  };

  // Helper to check if task is due today using date utilities
  const isTaskDueToday = (dueDate: string | undefined | null): boolean => {
    if (!dueDate) return false;
    return isToday(dueDate);
  };

  // Helper to check if task is due tomorrow
  const isTaskDueTomorrow = (dueDate: string | undefined | null): boolean => {
    if (!dueDate) return false;
    return isTomorrow(dueDate);
  };

  // Helper to check if task is due this week (includes today, tomorrow, and rest of week)
  const isTaskDueThisWeek = (dueDate: string | undefined | null): boolean => {
    if (!dueDate) return false;
    return isThisWeek(dueDate);
  };

  // Pre-tab filtered tasks — all filters except tab (used for tab counts)
  const preTabFilteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      if (searchQuery && !task.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      if (quickStatus && task.status !== quickStatus) return false;
      if (quickDue === 'today' && !isTaskDueToday(task.dueDate)) return false;
      if (quickDue === 'week' && !isTaskDueThisWeek(task.dueDate)) return false;
      if (statusFilter !== 'all' && task.status !== statusFilter) return false;
      if (priorityFilter !== 'all' && task.priority !== priorityFilter) return false;
      if (topicFilter !== 'all' && !task.topicIds.includes(topicFilter)) return false;
      if (tagFilter !== 'all' && !task.tags.includes(tagFilter)) return false;
      return true;
    });
  }, [tasks, searchQuery, quickStatus, quickDue, statusFilter, priorityFilter, topicFilter, tagFilter]);

  // Tab counts respect active filters (P2)
  const tabs = useMemo<{ id: ViewTab; label: string; count: number }[]>(
    () => [
      { id: 'open', label: 'Open', count: preTabFilteredTasks.filter((t) => t.status !== 'done').length },
      {
        id: 'today',
        label: 'Today',
        count: preTabFilteredTasks.filter((t) => isTaskDueToday(t.dueDate) && t.status !== 'done').length,
      },
      {
        id: 'tomorrow',
        label: 'Tomorrow',
        count: preTabFilteredTasks.filter((t) => isTaskDueTomorrow(t.dueDate) && t.status !== 'done').length,
      },
      {
        id: 'week',
        label: 'Week',
        count: preTabFilteredTasks.filter((t) => isTaskDueThisWeek(t.dueDate) && t.status !== 'done').length,
      },
      { id: 'completed', label: 'Done', count: preTabFilteredTasks.filter((t) => t.status === 'done').length },
    ],
    [preTabFilteredTasks],
  );

  // Final filtered + sorted tasks (tab filter + sort on top of pre-tab)
  const filteredTasks = useMemo(() => {
    const result = preTabFilteredTasks.filter((task) => {
      if (viewMode === 'list' || activeTab !== 'open') {
        if (activeTab === 'open' && task.status === 'done') return false;
        if (activeTab === 'today' && !isTaskDueToday(task.dueDate)) return false;
        if (activeTab === 'tomorrow' && !isTaskDueTomorrow(task.dueDate)) return false;
        if (activeTab === 'week' && !isTaskDueThisWeek(task.dueDate)) return false;
        if (activeTab === 'completed' && task.status !== 'done') return false;
      }
      return true;
    });

    result.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'created':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case 'due':
          if (!a.dueDate && !b.dueDate) comparison = 0;
          else if (!a.dueDate) comparison = 1;
          else if (!b.dueDate) comparison = -1;
          else comparison = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
          break;
        case 'priority':
          comparison = priorityConfig[a.priority].order - priorityConfig[b.priority].order;
          break;
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'status':
          comparison = statusOrder[a.status] - statusOrder[b.status];
          break;
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [preTabFilteredTasks, viewMode, activeTab, sortBy, sortDirection]);

  const clearFilters = () => {
    setQuickStatus(null);
    setQuickDue(null);
    setStatusFilter('all');
    setPriorityFilter('all');
    handleSetTopicFilter('all');
    handleSetTagFilter('all');
  };

  const hasActiveFilters =
    quickStatus ||
    quickDue ||
    statusFilter !== 'all' ||
    priorityFilter !== 'all' ||
    topicFilter !== 'all' ||
    tagFilter !== 'all';

  const handleOpenTask = (task: Task) => {
    setSelectedTaskId(task.id);
    setDrawerOpen(true);
  };

  const handleCreateTask = async () => {
    if (newTaskTitle.trim()) {
      try {
        const task = await addTask({
          title: newTaskTitle.trim(),
          status: 'todo',
          priority: 'medium',
          tags: [],
          topicIds: [],
          subtasks: [],
        });
        setNewTaskTitle('');
        setShowNewTaskInput(false);
        if (task) {
          setSelectedTaskId(task.id);
          setDrawerOpen(true);
        }
      } catch (e: unknown) {
        toast.error(e instanceof Error ? e.message : 'Failed to add task');
      }
    }
  };

  const handleQuickComplete = (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const newStatus = task.status === 'done' ? 'todo' : 'done';
    void updateTask(taskId, {
      status: newStatus,
      completedAt: newStatus === 'done' ? new Date() : undefined,
    });
  };

  const toggleTaskExpansion = (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedTasks((prev) => {
      const next = new Set(prev);
      if (next.has(taskId)) {
        next.delete(taskId);
      } else {
        next.add(taskId);
      }
      // Persist expanded tasks
      setPrefs((prev) => ({ ...prev, expandedTasks: Array.from(next) }));
      return next;
    });
  };

  const handleSubtaskToggle = (taskId: string, subtaskId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    void toggleSubtask(taskId, subtaskId);
  };

  const sortOptions: { value: SortOption; label: string }[] = [
    { value: 'created', label: 'Date Created' },
    { value: 'due', label: 'Due Date' },
    { value: 'priority', label: 'Priority' },
    { value: 'title', label: 'Title' },
    { value: 'status', label: 'Status' },
  ];

  return (
    <AppLayout>
      <div className={cn('mx-auto px-6 py-8', viewMode === 'list' ? 'max-w-4xl' : 'max-w-full')}>
        {/* Header */}
        <header className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="mb-1 text-2xl font-semibold text-foreground">Tasks</h1>
            <p className="text-sm text-muted-foreground">
              {filteredTasks.length} task{filteredTasks.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* Selection mode toggle (list only) */}
            {viewMode === 'list' && (
              <Button
                variant={selectionMode ? 'default' : 'outline'}
                size="sm"
                onClick={toggleSelectionMode}
                className="gap-1.5"
              >
                <CheckSquare className="h-4 w-4" />
                {selectionMode ? 'Cancel' : 'Select'}
              </Button>
            )}
            {/* View mode toggle */}
            <div className="flex items-center rounded-lg bg-secondary/50 p-1">
              <button
                onClick={() => handleSetViewMode('list')}
                className={cn(
                  'rounded-md p-1.5 transition-all',
                  viewMode === 'list'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground',
                )}
                title="List view"
              >
                <LayoutList className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleSetViewMode('kanban')}
                className={cn(
                  'rounded-md p-1.5 transition-all',
                  viewMode === 'kanban'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground',
                )}
                title="Kanban view"
              >
                <Columns3 className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleSetViewMode('timeline')}
                className={cn(
                  'rounded-md p-1.5 transition-all',
                  viewMode === 'timeline'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground',
                )}
                title="Timeline view"
              >
                <GanttChart className="h-4 w-4" />
              </button>
            </div>
            <Button className="gap-2" onClick={() => setShowNewTaskInput(true)}>
              <Plus className="h-4 w-4" />
              New Task
            </Button>
          </div>
        </header>

        {/* View tabs - only show in list mode */}
        {viewMode === 'list' && (
          <div className="mb-4 flex w-fit items-center gap-1 rounded-lg bg-secondary/50 p-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleSetActiveTab(tab.id)}
                className={cn(
                  'rounded-md px-3 py-1.5 text-sm font-medium transition-all',
                  activeTab === tab.id
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {tab.label}
                <span
                  className={cn(
                    'ml-1.5 text-xs',
                    activeTab === tab.id ? 'text-muted-foreground' : 'text-muted-foreground/60',
                  )}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Search + Quick filters + Sort */}
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <div className="relative max-w-sm flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search tasks..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Quick chips - only show in list mode */}
          {viewMode === 'list' && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setQuickStatus(quickStatus === 'doing' ? null : 'doing')}
                className={cn(
                  'rounded-full border px-2.5 py-1 text-xs font-medium transition-all',
                  quickStatus === 'doing'
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-background text-muted-foreground hover:border-primary/50',
                )}
              >
                In Progress
              </button>
              <button
                onClick={() => setQuickDue(quickDue === 'today' ? null : 'today')}
                className={cn(
                  'flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium transition-all',
                  quickDue === 'today'
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-background text-muted-foreground hover:border-primary/50',
                )}
              >
                <Calendar className="h-3 w-3" />
                Due Today
              </button>
            </div>
          )}

          {/* Active topic/tag filter chips */}
          {topicFilter !== 'all' && (
            <button
              onClick={() => handleSetTopicFilter('all')}
              className="flex items-center gap-1 rounded-full border border-info/30 bg-info/10 px-2.5 py-1 text-xs font-medium text-info-foreground"
            >
              [[{availableTopics.find((t) => t.id === topicFilter)?.name}]]
              <X className="h-3 w-3" />
            </button>
          )}
          {tagFilter !== 'all' && (
            <button
              onClick={() => handleSetTagFilter('all')}
              className="flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary"
            >
              #{tagFilter}
              <X className="h-3 w-3" />
            </button>
          )}

          {/* Clear filters */}
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground" onClick={clearFilters}>
              <X className="mr-1 h-3 w-3" />
              Clear
            </Button>
          )}

          {/* Sort dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5">
                <ArrowUpDown className="h-4 w-4" />
                Sort
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-background">
              <DropdownMenuLabel>Sort by</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {sortOptions.map((option) => (
                <DropdownMenuItem
                  key={option.value}
                  onClick={() => {
                    if (sortBy === option.value) {
                      handleSetSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                    } else {
                      handleSetSortBy(option.value);
                      handleSetSortDirection('asc');
                    }
                  }}
                  className={cn('flex items-center justify-between', sortBy === option.value && 'bg-secondary')}
                >
                  {option.label}
                  {sortBy === option.value && (
                    <span className="text-xs text-muted-foreground">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Advanced filters drawer */}
          <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5">
                <SlidersHorizontal className="h-4 w-4" />
                Filters
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Advanced Filters</SheetTitle>
              </SheetHeader>
              <div className="mt-6 space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Status</label>
                  <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as TaskStatus | 'all')}>
                    <SelectTrigger>
                      <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All statuses</SelectItem>
                      {Object.entries(statusConfig).map(([key, config]) => (
                        <SelectItem key={key} value={key}>
                          <span className="flex items-center gap-2">
                            <span className={config.color}>{config.icon}</span>
                            {config.label}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Priority</label>
                  <Select value={priorityFilter} onValueChange={(v) => setPriorityFilter(v as TaskPriority | 'all')}>
                    <SelectTrigger>
                      <SelectValue placeholder="All priorities" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All priorities</SelectItem>
                      {Object.entries(priorityConfig).map(([key, config]) => (
                        <SelectItem key={key} value={key}>
                          <span className={cn('flex items-center gap-2', config.color)}>
                            <Flag className="h-3 w-3" />
                            {config.label}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {availableTopics.length > 0 && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Topic</label>
                    <Select value={topicFilter} onValueChange={handleSetTopicFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="All topics" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All topics</SelectItem>
                        {availableTopics.map((t) => (
                          <SelectItem key={t.id} value={t.id}>
                            [[{t.name}]]
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                {availableTags.length > 0 && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Tag</label>
                    <Select value={tagFilter} onValueChange={handleSetTagFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="All tags" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All tags</SelectItem>
                        {availableTags.map((tag) => (
                          <SelectItem key={tag} value={tag}>
                            #{tag}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    clearFilters();
                    setFiltersOpen(false);
                  }}
                >
                  Reset All Filters
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* New task input */}
        {showNewTaskInput && (
          <div className="mb-4 rounded-lg border border-border bg-secondary/30 p-3">
            <div className="flex items-center gap-2">
              <Circle className="h-5 w-5 flex-shrink-0 text-muted-foreground" />
              <Input
                autoFocus
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreateTask();
                  if (e.key === 'Escape') {
                    setShowNewTaskInput(false);
                    setNewTaskTitle('');
                  }
                }}
                placeholder="What needs to be done?"
                className="border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
              />
              <Button size="sm" onClick={handleCreateTask} disabled={!newTaskTitle.trim()}>
                Add
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowNewTaskInput(false);
                  setNewTaskTitle('');
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Selection mode bar */}
        {selectionMode && viewMode === 'list' && (
          <div className="mb-3 flex items-center gap-3 rounded-lg border border-border bg-secondary/40 px-3 py-2">
            <span className="text-sm font-medium text-foreground">
              {selectedTaskIds.size} of {filteredTasks.length} selected
            </span>
            <div className="ml-auto flex items-center gap-2">
              <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={selectAll}>
                Select All
              </Button>
              <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={deselectAll}>
                Deselect All
              </Button>
            </div>
          </div>
        )}

        {/* Task views */}
        {viewMode === 'timeline' ? (
          <TimelineView />
        ) : viewMode === 'kanban' ? (
          <KanbanBoard tasks={filteredTasks} onTaskClick={handleOpenTask} />
        ) : (
          <div className="widget-card">
            {filteredTasks.length > 0 ? (
              <div className="divide-y divide-border">
                {filteredTasks.map((task) => {
                  const progress = getProgress(task);
                  const isExpanded = expandedTasks.has(task.id);
                  const hasSubtasks = task.subtasks.length > 0;

                  return (
                    <div key={task.id} className="py-1">
                      <div
                        className={cn(
                          'group -mx-2 flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-secondary/30',
                          selectionMode && selectedTaskIds.has(task.id) && 'bg-primary/5',
                        )}
                        onClick={() => (selectionMode ? toggleTaskSelection(task.id) : handleOpenTask(task))}
                      >
                        {/* Selection checkbox */}
                        {selectionMode && (
                          <Checkbox
                            checked={selectedTaskIds.has(task.id)}
                            onCheckedChange={() => toggleTaskSelection(task.id)}
                            onClick={(e) => e.stopPropagation()}
                            className="flex-shrink-0"
                          />
                        )}

                        {/* Quick complete circle */}
                        {!selectionMode && (
                          <button
                            onClick={(e) => handleQuickComplete(task.id, e)}
                            className={cn(
                              'flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2 transition-all hover:scale-110',
                              task.status === 'done'
                                ? 'border-success bg-success text-success-foreground'
                                : 'border-muted-foreground/40 hover:border-success hover:bg-success/10',
                            )}
                          >
                            {task.status === 'done' && <CheckCircle2 className="h-3.5 w-3.5" />}
                          </button>
                        )}

                        {/* Expand arrow for subtasks */}
                        {hasSubtasks ? (
                          <button
                            onClick={(e) => toggleTaskExpansion(task.id, e)}
                            className="flex-shrink-0 rounded p-0.5 transition-colors hover:bg-secondary"
                          >
                            <ChevronDown
                              className={cn(
                                'h-4 w-4 text-muted-foreground transition-transform',
                                isExpanded && 'rotate-180',
                              )}
                            />
                          </button>
                        ) : (
                          <div className="w-5" /> // Spacer for alignment
                        )}

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p
                              className={cn(
                                'truncate text-sm font-medium',
                                task.status === 'done' ? 'text-muted-foreground line-through' : 'text-foreground',
                              )}
                            >
                              {task.title}
                            </p>
                            {progress !== null && (
                              <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                <Progress value={progress} className="h-1 w-12" />
                                {progress}%
                              </span>
                            )}
                          </div>
                          <div className="mt-1 flex flex-wrap items-center gap-2">
                            {task.projectId &&
                              (() => {
                                const proj = projects.find((p) => p.id === task.projectId);
                                return proj ? (
                                  <Badge variant="secondary" className="h-5 gap-1 px-1.5 text-[10px] font-normal">
                                    <span
                                      className="h-2 w-2 shrink-0 rounded-full"
                                      style={{ backgroundColor: proj.color || '#888' }}
                                    />
                                    {proj.name}
                                  </Badge>
                                ) : null;
                              })()}
                            {task.dueDate && (
                              <Badge variant="outline" className="h-5 gap-1 px-1.5 text-[10px] font-normal">
                                <Calendar className="h-2.5 w-2.5" />
                                {task.dueDate}
                              </Badge>
                            )}
                            {task.recurrence && (
                              <Badge
                                variant="outline"
                                className="h-5 gap-1 border-info/30 px-1.5 text-[10px] font-normal text-info-foreground"
                              >
                                <span>↻</span>
                                {task.recurrence.type === 'daily' && 'Daily'}
                                {task.recurrence.type === 'weekly' && 'Weekly'}
                                {task.recurrence.type === 'monthly' && 'Monthly'}
                              </Badge>
                            )}
                            {task.topicIds.slice(0, 2).map((topicId) => {
                              const name = getTopicName(topicId);
                              return name ? (
                                <Badge
                                  key={topicId}
                                  variant="secondary"
                                  className="h-5 cursor-pointer px-1.5 text-[10px] font-normal text-info-foreground hover:bg-info/20"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSetTopicFilter(topicId);
                                  }}
                                >
                                  [[{name}]]
                                </Badge>
                              ) : null;
                            })}
                            {task.topicIds.length > 2 && (
                              <Badge
                                variant="secondary"
                                className="h-5 px-1.5 text-[10px] font-normal text-muted-foreground"
                              >
                                +{task.topicIds.length - 2}
                              </Badge>
                            )}
                            {task.tags.slice(0, 2).map((tag) => (
                              <Badge
                                key={tag}
                                variant="secondary"
                                className="h-5 cursor-pointer px-1.5 text-[10px] font-normal text-primary hover:bg-primary/20"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSetTagFilter(tag);
                                }}
                              >
                                #{tag}
                              </Badge>
                            ))}
                            {task.tags.length > 2 && (
                              <Badge
                                variant="secondary"
                                className="h-5 px-1.5 text-[10px] font-normal text-muted-foreground"
                              >
                                +{task.tags.length - 2}
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Priority chip */}
                        <Badge
                          variant="secondary"
                          className={cn(
                            'h-5 px-1.5 text-[10px] font-normal',
                            priorityConfig[task.priority].bg,
                            priorityConfig[task.priority].color,
                          )}
                        >
                          {priorityConfig[task.priority].label}
                        </Badge>

                        <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                      </div>

                      {/* Expanded subtasks */}
                      {hasSubtasks && isExpanded && (
                        <div className="ml-12 border-l-2 border-border/50 pb-2 pl-3">
                          {task.subtasks.map((subtask) => (
                            <div
                              key={subtask.id}
                              className="group/subtask flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-secondary/20"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                onClick={(e) => handleSubtaskToggle(task.id, subtask.id, e)}
                                className={cn(
                                  'flex h-4 w-4 flex-shrink-0 items-center justify-center rounded border transition-all hover:scale-110',
                                  subtask.completed
                                    ? 'border-success bg-success text-success-foreground'
                                    : 'border-muted-foreground/40 hover:border-success hover:bg-success/10',
                                )}
                              >
                                {subtask.completed && <CheckCircle2 className="h-2.5 w-2.5" />}
                              </button>
                              <span
                                className={cn(
                                  'flex-1 text-xs',
                                  subtask.completed && 'text-muted-foreground line-through',
                                )}
                              >
                                {subtask.title}
                              </span>
                              {/* Subtask tags */}
                              {subtask.tags && subtask.tags.length > 0 && (
                                <div className="flex items-center gap-1">
                                  {subtask.tags.slice(0, 2).map((tag) => (
                                    <Badge
                                      key={tag}
                                      variant="secondary"
                                      className="h-4 px-1 text-[9px] font-normal text-primary"
                                    >
                                      #{tag}
                                    </Badge>
                                  ))}
                                  {subtask.tags.length > 2 && (
                                    <span className="text-[9px] text-muted-foreground">+{subtask.tags.length - 2}</span>
                                  )}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-12 text-center">
                <CheckSquare className="mx-auto mb-4 h-12 w-12 text-muted-foreground/30" />
                <h3 className="mb-2 text-lg font-medium text-foreground">No tasks found</h3>
                <p className="text-sm text-muted-foreground">
                  {searchQuery || hasActiveFilters
                    ? 'Try adjusting your filters or search query'
                    : 'Create your first task to get started'}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Task Details Drawer */}
      <TaskDetailsDrawer taskId={selectedTaskId} open={drawerOpen} onOpenChange={setDrawerOpen} />

      {/* Bulk Action Bar */}
      {selectionMode && selectedTaskIds.size > 0 && (
        <BulkActionBar
          selectedCount={selectedTaskIds.size}
          onBulkStatusChange={handleBulkStatusChange}
          onBulkPriorityChange={handleBulkPriorityChange}
          onBulkDueDateChange={handleBulkDueDateChange}
          onBulkDelete={handleBulkDelete}
        />
      )}
    </AppLayout>
  );
};

export default Tasks;
