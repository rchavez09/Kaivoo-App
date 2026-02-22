import { useState, useMemo } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import {
  CheckSquare, Plus, Search, SlidersHorizontal, Circle, CheckCircle2,
  Calendar, X, Flag, ChevronRight, LayoutList, Columns3,
  ChevronDown, ArrowUpDown, Hash
} from 'lucide-react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { useKaivooStore } from '@/stores/useKaivooStore';
import { useKaivooActions } from '@/hooks/useKaivooActions';
import { Task, TaskStatus, TaskPriority, Subtask } from '@/types';
import TaskDetailsDrawer from '@/components/TaskDetailsDrawer';
import KanbanBoard from '@/components/KanbanBoard';
import { isToday, isTomorrow, isThisWeek } from '@/lib/dateUtils';
import { statusConfig, priorityConfig, statusOrder } from '@/lib/task-config';

type ViewTab = 'open' | 'today' | 'tomorrow' | 'week' | 'completed';
type ViewMode = 'list' | 'kanban';
type SortOption = 'created' | 'due' | 'priority' | 'title' | 'status';
type SortDirection = 'asc' | 'desc';

const TASKS_VIEW_PREFS_KEY = 'kaivoo-tasks-view-preferences';

interface TasksViewPrefs {
  activeTab: ViewTab;
  viewMode: ViewMode;
  sortBy: SortOption;
  sortDirection: SortDirection;
  expandedTasks: string[];
}

const DEFAULT_PREFS: TasksViewPrefs = {
  activeTab: 'open',
  viewMode: 'list',
  sortBy: 'created',
  sortDirection: 'desc',
  expandedTasks: [],
};

const Tasks = () => {
  const { tasks, topics, topicPages } = useKaivooStore();
  const { addTask, updateTask, toggleSubtask, updateSubtask } = useKaivooActions();

  const [prefs, setPrefs] = useLocalStorage<TasksViewPrefs>(TASKS_VIEW_PREFS_KEY, DEFAULT_PREFS);

  const [activeTab, setActiveTab] = useState<ViewTab>(prefs.activeTab);
  const [viewMode, setViewMode] = useState<ViewMode>(prefs.viewMode);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | 'all'>('all');
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

  const handleSetActiveTab = (tab: ViewTab) => {
    setActiveTab(tab);
    setPrefs(prev => ({ ...prev, activeTab: tab }));
  };

  const handleSetViewMode = (mode: ViewMode) => {
    setViewMode(mode);
    setPrefs(prev => ({ ...prev, viewMode: mode }));
  };

  const handleSetSortBy = (sort: SortOption) => {
    setSortBy(sort);
    setPrefs(prev => ({ ...prev, sortBy: sort }));
  };

  const handleSetSortDirection = (dir: SortDirection) => {
    setSortDirection(dir);
    setPrefs(prev => ({ ...prev, sortDirection: dir }));
  };

  const getTopicName = (topicId: string) => {
    const topic = topics.find(t => t.id === topicId);
    if (topic) return topic.name;
    const page = topicPages.find(p => p.id === topicId);
    if (page) {
      const parentTopic = topics.find(t => t.id === page.topicId);
      return parentTopic ? `${parentTopic.name}/${page.name}` : page.name;
    }
    return null;
  };

  const getProgress = (task: Task) => {
    if (task.subtasks.length === 0) return null;
    const completed = task.subtasks.filter(s => s.completed).length;
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

  // Filter logic
  const filteredTasks = useMemo(() => {
    let result = tasks.filter(task => {
      // Tab filters (skip for kanban mode on 'open' tab to show all)
      if (viewMode === 'list' || activeTab !== 'open') {
        if (activeTab === 'open' && task.status === 'done') return false;
        if (activeTab === 'today' && !isTaskDueToday(task.dueDate)) return false;
        if (activeTab === 'tomorrow' && !isTaskDueTomorrow(task.dueDate)) return false;
        if (activeTab === 'week' && !isTaskDueThisWeek(task.dueDate)) return false;
        if (activeTab === 'completed' && task.status !== 'done') return false;
      }

      // Search
      if (searchQuery && !task.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;

      // Quick filters
      if (quickStatus && task.status !== quickStatus) return false;
      if (quickDue === 'today' && !isTaskDueToday(task.dueDate)) return false;
      if (quickDue === 'week' && !isTaskDueThisWeek(task.dueDate)) return false;

      // Advanced filters (from drawer)
      if (statusFilter !== 'all' && task.status !== statusFilter) return false;
      if (priorityFilter !== 'all' && task.priority !== priorityFilter) return false;

      return true;
    });
    
    // Sort logic
    result.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'created':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case 'due':
          // Tasks without due dates go last, otherwise sort by actual date
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
  }, [tasks, viewMode, activeTab, searchQuery, quickStatus, quickDue, statusFilter, priorityFilter, sortBy, sortDirection]);

  const clearFilters = () => {
    setQuickStatus(null);
    setQuickDue(null);
    setStatusFilter('all');
    setPriorityFilter('all');
  };

  const hasActiveFilters = quickStatus || quickDue || statusFilter !== 'all' || priorityFilter !== 'all';

  const tabs: { id: ViewTab; label: string; count: number }[] = [
    { id: 'open', label: 'Open', count: tasks.filter(t => t.status !== 'done').length },
    { id: 'today', label: 'Today', count: tasks.filter(t => isTaskDueToday(t.dueDate) && t.status !== 'done').length },
    { id: 'tomorrow', label: 'Tomorrow', count: tasks.filter(t => isTaskDueTomorrow(t.dueDate) && t.status !== 'done').length },
    { id: 'week', label: 'Week', count: tasks.filter(t => isTaskDueThisWeek(t.dueDate) && t.status !== 'done').length },
    { id: 'completed', label: 'Done', count: tasks.filter(t => t.status === 'done').length },
  ];

  const handleOpenTask = (task: Task) => {
    setSelectedTaskId(task.id);
    setDrawerOpen(true);
  };

  const handleCreateTask = async () => {
    if (newTaskTitle.trim()) {
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
    }
  };

  const handleQuickComplete = (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    const newStatus = task.status === 'done' ? 'todo' : 'done';
    void updateTask(taskId, { 
      status: newStatus,
      completedAt: newStatus === 'done' ? new Date() : undefined,
    });
  };

  const handleStatusChange = (taskId: string, status: TaskStatus, e: React.MouseEvent) => {
    e.stopPropagation();
    void updateTask(taskId, { 
      status,
      completedAt: status === 'done' ? new Date() : undefined,
    });
  };

  const toggleTaskExpansion = (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedTasks(prev => {
      const next = new Set(prev);
      if (next.has(taskId)) {
        next.delete(taskId);
      } else {
        next.add(taskId);
      }
      // Persist expanded tasks
      persistPrefs({ expandedTasks: Array.from(next) });
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
      <div className={cn("mx-auto px-6 py-8", viewMode === 'kanban' ? 'max-w-full' : 'max-w-4xl')}>
        {/* Header */}
        <header className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground mb-1">Tasks</h1>
            <p className="text-sm text-muted-foreground">
              {filteredTasks.length} task{filteredTasks.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* View mode toggle */}
            <div className="flex items-center p-1 bg-secondary/50 rounded-lg">
              <button
                onClick={() => handleSetViewMode('list')}
                className={cn(
                  'p-1.5 rounded-md transition-all',
                  viewMode === 'list'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
                title="List view"
              >
                <LayoutList className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleSetViewMode('kanban')}
                className={cn(
                  'p-1.5 rounded-md transition-all',
                  viewMode === 'kanban'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
                title="Kanban view"
              >
                <Columns3 className="w-4 h-4" />
              </button>
            </div>
            <Button className="gap-2" onClick={() => setShowNewTaskInput(true)}>
              <Plus className="w-4 h-4" />
              New Task
            </Button>
          </div>
        </header>

        {/* View tabs - only show in list mode */}
        {viewMode === 'list' && (
          <div className="flex items-center gap-1 mb-4 p-1 bg-secondary/50 rounded-lg w-fit">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleSetActiveTab(tab.id)}
                className={cn(
                  'px-3 py-1.5 text-sm font-medium rounded-md transition-all',
                  activeTab === tab.id
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {tab.label}
                <span className={cn(
                  'ml-1.5 text-xs',
                  activeTab === tab.id ? 'text-muted-foreground' : 'text-muted-foreground/60'
                )}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Search + Quick filters + Sort */}
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
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
                  'px-2.5 py-1 text-xs font-medium rounded-full border transition-all',
                  quickStatus === 'doing'
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-background text-muted-foreground border-border hover:border-primary/50'
                )}
              >
                In Progress
              </button>
              <button
                onClick={() => setQuickDue(quickDue === 'today' ? null : 'today')}
                className={cn(
                  'px-2.5 py-1 text-xs font-medium rounded-full border transition-all flex items-center gap-1',
                  quickDue === 'today'
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-background text-muted-foreground border-border hover:border-primary/50'
                )}
              >
                <Calendar className="w-3 h-3" />
                Due Today
              </button>
            </div>
          )}

          {/* Clear filters */}
          {hasActiveFilters && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-7 text-xs text-muted-foreground"
              onClick={clearFilters}
            >
              <X className="w-3 h-3 mr-1" />
              Clear
            </Button>
          )}

          {/* Sort dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5">
                <ArrowUpDown className="w-4 h-4" />
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
                  className={cn(
                    "flex items-center justify-between",
                    sortBy === option.value && "bg-secondary"
                  )}
                >
                  {option.label}
                  {sortBy === option.value && (
                    <span className="text-xs text-muted-foreground">
                      {sortDirection === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Advanced filters drawer */}
          <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5">
                <SlidersHorizontal className="w-4 h-4" />
                Filters
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Advanced Filters</SheetTitle>
              </SheetHeader>
              <div className="space-y-6 mt-6">
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
                          <span className={cn("flex items-center gap-2", config.color)}>
                            <Flag className="w-3 h-3" />
                            {config.label}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
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
          <div className="mb-4 p-3 bg-secondary/30 rounded-lg border border-border">
            <div className="flex items-center gap-2">
              <Circle className="w-5 h-5 text-muted-foreground flex-shrink-0" />
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
                className="border-0 bg-transparent focus-visible:ring-0 shadow-none px-0"
              />
              <Button size="sm" onClick={handleCreateTask} disabled={!newTaskTitle.trim()}>
                Add
              </Button>
              <Button variant="ghost" size="sm" onClick={() => {
                setShowNewTaskInput(false);
                setNewTaskTitle('');
              }}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Task views */}
        {viewMode === 'kanban' ? (
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
                        className="flex items-center gap-3 py-2 px-2 -mx-2 hover:bg-secondary/30 rounded-lg transition-colors cursor-pointer group"
                        onClick={() => handleOpenTask(task)}
                      >
                        {/* Quick complete circle */}
                        <button
                          onClick={(e) => handleQuickComplete(task.id, e)}
                          className={cn(
                            "flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all hover:scale-110",
                            task.status === 'done'
                              ? "bg-success border-success text-success-foreground"
                              : "border-muted-foreground/40 hover:border-success hover:bg-success/10"
                          )}
                        >
                          {task.status === 'done' && (
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          )}
                        </button>

                        {/* Expand arrow for subtasks */}
                        {hasSubtasks ? (
                          <button
                            onClick={(e) => toggleTaskExpansion(task.id, e)}
                            className="flex-shrink-0 p-0.5 hover:bg-secondary rounded transition-colors"
                          >
                            <ChevronDown className={cn(
                              "w-4 h-4 text-muted-foreground transition-transform",
                              isExpanded && "rotate-180"
                            )} />
                          </button>
                        ) : (
                          <div className="w-5" /> // Spacer for alignment
                        )}
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className={cn(
                              'text-sm font-medium truncate',
                              task.status === 'done' ? 'line-through text-muted-foreground' : 'text-foreground'
                            )}>
                              {task.title}
                            </p>
                            {progress !== null && (
                              <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                <Progress value={progress} className="h-1 w-12" />
                                {progress}%
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            {task.dueDate && (
                              <Badge variant="outline" className="text-[10px] h-5 px-1.5 gap-1 font-normal">
                                <Calendar className="w-2.5 h-2.5" />
                                {task.dueDate}
                              </Badge>
                            )}
                            {task.topicIds.slice(0, 2).map(topicId => {
                              const name = getTopicName(topicId);
                              return name ? (
                                <Badge key={topicId} variant="secondary" className="text-[10px] h-5 px-1.5 text-info font-normal">
                                  [[{name}]]
                                </Badge>
                              ) : null;
                            })}
                            {task.topicIds.length > 2 && (
                              <Badge variant="secondary" className="text-[10px] h-5 px-1.5 text-muted-foreground font-normal">
                                +{task.topicIds.length - 2}
                              </Badge>
                            )}
                            {task.tags.slice(0, 2).map(tag => (
                              <Badge key={tag} variant="secondary" className="text-[10px] h-5 px-1.5 text-primary font-normal">
                                #{tag}
                              </Badge>
                            ))}
                            {task.tags.length > 2 && (
                              <Badge variant="secondary" className="text-[10px] h-5 px-1.5 text-muted-foreground font-normal">
                                +{task.tags.length - 2}
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Priority chip */}
                        <Badge 
                          variant="secondary"
                          className={cn(
                            'text-[10px] h-5 px-1.5 font-normal',
                            priorityConfig[task.priority].bg,
                            priorityConfig[task.priority].color
                          )}
                        >
                          {priorityConfig[task.priority].label}
                        </Badge>

                        <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>

                      {/* Expanded subtasks */}
                      {hasSubtasks && isExpanded && (
                        <div className="ml-12 pl-3 border-l-2 border-border/50 pb-2">
                          {task.subtasks.map((subtask) => (
                            <div
                              key={subtask.id}
                              className="flex items-center gap-2 py-1.5 px-2 hover:bg-secondary/20 rounded-md group/subtask"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                onClick={(e) => handleSubtaskToggle(task.id, subtask.id, e)}
                                className={cn(
                                  "flex-shrink-0 w-4 h-4 rounded border flex items-center justify-center transition-all hover:scale-110",
                                  subtask.completed
                                    ? "bg-success border-success text-success-foreground"
                                    : "border-muted-foreground/40 hover:border-success hover:bg-success/10"
                                )}
                              >
                                {subtask.completed && (
                                  <CheckCircle2 className="w-2.5 h-2.5" />
                                )}
                              </button>
                              <span className={cn(
                                "text-xs flex-1",
                                subtask.completed && "line-through text-muted-foreground"
                              )}>
                                {subtask.title}
                              </span>
                              {/* Subtask tags */}
                              {subtask.tags && subtask.tags.length > 0 && (
                                <div className="flex items-center gap-1">
                                  {subtask.tags.slice(0, 2).map(tag => (
                                    <Badge key={tag} variant="secondary" className="text-[9px] h-4 px-1 text-primary font-normal">
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
                <CheckSquare className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No tasks found</h3>
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
      <TaskDetailsDrawer 
        taskId={selectedTaskId} 
        open={drawerOpen} 
        onOpenChange={setDrawerOpen}
      />
    </AppLayout>
  );
};

export default Tasks;
