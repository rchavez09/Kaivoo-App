import { useState, useMemo, useCallback, useEffect } from 'react';
import { CheckSquare, ChevronRight, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Link } from 'react-router-dom';
import { useKaivooStore } from '@/stores/useKaivooStore';
import { Task, TaskStatus } from '@/types';
import { useKaivooActions } from '@/hooks/useKaivooActions';
import { toast } from 'sonner';
import {
  TasksWidgetConfigDialog,
  useTasksWidgetSettings,
  type SectionId,
  TaskSection,
  AddToTodayPicker,
  getTasksForSection,
  getSectionDisplayConfig,
  isDueToday,
  isOverdue,
  isDueThisWeek,
} from './tasks';
import {
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';

const COLLAPSED_SECTIONS_KEY = 'kaivoo-tasks-widget-collapsed-sections';
const COLLAPSED_COMPLETED_KEY = 'kaivoo-tasks-widget-collapsed-completed';
const EXPANDED_TASKS_KEY = 'kaivoo-tasks-widget-expanded-tasks';

interface TasksWidgetProps {
  date?: Date;
  onTaskClick?: (taskId: string) => void;
}

const TasksWidget = ({ date, onTaskClick }: TasksWidgetProps) => {
  const tasks = useKaivooStore(s => s.tasks);
  const topics = useKaivooStore(s => s.topics);
  const tags = useKaivooStore(s => s.tags);
  const { addTask, updateTask, toggleSubtask } = useKaivooActions();
  const { settings, loading: settingsLoading, updateSettings, updateSection, addSection, removeSection, reorderSections, setTaskOrderForSection } = useTasksWidgetSettings();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    tags.forEach(t => tagSet.add(t.name));
    tasks.forEach(task => task.tags?.forEach(tag => tagSet.add(tag)));
    return Array.from(tagSet).sort().map(name => {
      const existing = tags.find(t => t.name === name);
      return existing || { id: `derived-${name}`, name, color: null };
    });
  }, [tags, tasks]);

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [showInput, setShowInput] = useState(false);

  // Persisted UI state
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem(EXPANDED_TASKS_KEY);
      if (stored) return new Set(JSON.parse(stored));
    } catch { /* localStorage unavailable */ }
    return new Set();
  });

  const computeExpandedSections = useCallback((s: typeof settings): Set<SectionId> => {
    if (s.collapseSectionsByDefault) return new Set<SectionId>();
    try {
      const stored = localStorage.getItem(COLLAPSED_SECTIONS_KEY);
      if (stored) {
        const collapsed = new Set<SectionId>(JSON.parse(stored));
        return new Set(s.sections.map(sec => sec.id).filter(id => !collapsed.has(id)));
      }
    } catch { /* localStorage unavailable */ }
    return new Set(s.sections.map(sec => sec.id));
  }, []);

  const computeShowCompleted = useCallback((s: typeof settings): Set<SectionId> => {
    try {
      const stored = localStorage.getItem(COLLAPSED_COMPLETED_KEY);
      if (stored) {
        const collapsed = new Set<SectionId>(JSON.parse(stored));
        return new Set(s.sections.map(sec => sec.id).filter(id => !collapsed.has(id)));
      }
    } catch { /* localStorage unavailable */ }
    if (s.collapseCompletedByDefault) return new Set();
    return new Set(s.sections.map(sec => sec.id));
  }, []);

  const [expandedSections, setExpandedSections] = useState<Set<SectionId>>(() => computeExpandedSections(settings));
  const [showCompletedInSection, setShowCompletedInSection] = useState<Set<SectionId>>(() => computeShowCompleted(settings));

  const settingsSectionsJson = JSON.stringify(settings.sections.map(s => ({ id: s.id, visible: s.visible })));
  useEffect(() => {
    setExpandedSections(computeExpandedSections(settings));
    setShowCompletedInSection(computeShowCompleted(settings));
  }, [settingsSectionsJson, settings.collapseSectionsByDefault, settings.collapseCompletedByDefault, computeExpandedSections, computeShowCompleted]);

  // Handlers
  const toggleTaskExpanded = useCallback((taskId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedTasks(prev => {
      const next = new Set(prev);
      if (next.has(taskId)) { next.delete(taskId); } else { next.add(taskId); }
      localStorage.setItem(EXPANDED_TASKS_KEY, JSON.stringify(Array.from(next)));
      return next;
    });
  }, []);

  const toggleSectionExpanded = useCallback((sectionId: SectionId) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(sectionId)) { next.delete(sectionId); } else { next.add(sectionId); }
      const allIds = settings.sections.map(s => s.id);
      localStorage.setItem(COLLAPSED_SECTIONS_KEY, JSON.stringify(allIds.filter(id => !next.has(id))));
      return next;
    });
  }, [settings.sections]);

  const toggleCompletedInSection = useCallback((sectionId: SectionId, e: React.MouseEvent) => {
    e.stopPropagation();
    setShowCompletedInSection(prev => {
      const next = new Set(prev);
      if (next.has(sectionId)) { next.delete(sectionId); } else { next.add(sectionId); }
      const allIds = settings.sections.map(s => s.id);
      localStorage.setItem(COLLAPSED_COMPLETED_KEY, JSON.stringify(allIds.filter(id => !next.has(id))));
      return next;
    });
  }, [settings.sections]);

  const handleQuickComplete = useCallback((task: Task, e: React.MouseEvent) => {
    e.stopPropagation();
    const newStatus: TaskStatus = task.status === 'done' ? 'todo' : 'done';
    updateTask(task.id, { status: newStatus, completedAt: newStatus === 'done' ? new Date() : undefined });
  }, [updateTask]);

  const handleSubtaskToggle = useCallback((taskId: string, subtaskId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    toggleSubtask(taskId, subtaskId);
  }, [toggleSubtask]);

  const handleTaskClick = useCallback((task: Task, e: React.MouseEvent) => {
    if (onTaskClick) { e.stopPropagation(); onTaskClick(task.id); }
  }, [onTaskClick]);

  const handleAddTask = async () => {
    if (!newTaskTitle.trim()) return;
    try {
      await addTask({ title: newTaskTitle.trim(), status: 'todo', priority: 'medium', dueDate: 'Today', tags: [], topicIds: [], subtasks: [] });
      setNewTaskTitle('');
      setShowInput(false);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed to add task');
    }
  };

  // Computed data
  const sortedSections = useMemo(() => [...settings.sections].sort((a, b) => a.order - b.order), [settings.sections]);

  const totalPending = useMemo(() => {
    let count = 0;
    settings.sections.forEach(section => {
      if (section.visible) count += getTasksForSection(section, tasks, settings.taskOrder, date).pending.length;
    });
    return count;
  }, [tasks, settings.sections, settings.taskOrder]);

  const pinnedTodayPendingTasks = useMemo(() => tasks.filter(t => t.status !== 'done' && t.dueDate === 'Today'), [tasks]);
  const otherTasks = useMemo(() => tasks.filter(t => t.dueDate !== 'Today' && t.status !== 'done' && !isDueToday(t.dueDate) && !isOverdue(t.dueDate) && !isDueThisWeek(t.dueDate)), [tasks]);

  if (settingsLoading) {
    return (
      <div className="widget-card animate-fade-in" style={{ animationDelay: '0.05s' }} id="day-section-tasks">
        <div className="widget-header">
          <div className="flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-primary" />
            <span className="widget-title">Tasks</span>
          </div>
        </div>
        <p className="text-sm text-muted-foreground py-6 text-center">Loading...</p>
      </div>
    );
  }

  return (
    <div className="widget-card animate-fade-in" style={{ animationDelay: '0.05s' }} id="day-section-tasks">
      <div className="widget-header">
        <div className="flex items-center gap-2">
          <CheckSquare className="w-4 h-4 text-primary" />
          <span className="widget-title">Tasks</span>
          <span className="text-xs text-muted-foreground font-normal ml-1">{totalPending} pending</span>
        </div>
        <div className="flex items-center gap-1">
          <TasksWidgetConfigDialog
            settings={settings}
            topics={topics}
            tags={allTags}
            onUpdateSettings={updateSettings}
            onUpdateSection={updateSection}
            onAddSection={addSection}
            onRemoveSection={removeSection}
            onReorderSections={reorderSections}
          />

          <AddToTodayPicker
            pinnedTasks={pinnedTodayPendingTasks}
            otherTasks={otherTasks}
            onAddToToday={(id) => updateTask(id, { dueDate: 'Today' })}
            onRemoveFromToday={(id) => updateTask(id, { dueDate: undefined })}
          />

          <Link to="/tasks">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground h-8 px-2">
              <span className="text-xs">View all</span>
              <ChevronRight className="w-3 h-3 ml-1" />
            </Button>
          </Link>
        </div>
      </div>

      <div className="space-y-1">
        {sortedSections.map(section => {
          if (!section.visible) return null;
          const config = getSectionDisplayConfig(section);
          const { pending, completed } = getTasksForSection(section, tasks, settings.taskOrder, date);
          return (
            <TaskSection
              key={section.id}
              section={section}
              config={config}
              pending={pending}
              completed={completed}
              isExpanded={expandedSections.has(section.id)}
              showCompleted={showCompletedInSection.has(section.id)}
              settings={settings}
              expandedTasks={expandedTasks}
              sensors={sensors}
              onToggleSectionExpanded={toggleSectionExpanded}
              onToggleCompletedInSection={toggleCompletedInSection}
              onQuickComplete={handleQuickComplete}
              onToggleTaskExpanded={toggleTaskExpanded}
              onSubtaskToggle={handleSubtaskToggle}
              onTaskClick={handleTaskClick}
              onSetTaskOrder={setTaskOrderForSection}
            />
          );
        })}
      </div>

      <div className="mt-4 pt-3 border-t border-border/50">
        {showInput ? (
          <div className="flex gap-2">
            <Input
              placeholder="New task..."
              value={newTaskTitle}
              onChange={e => setNewTaskTitle(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') handleAddTask();
                if (e.key === 'Escape') { setShowInput(false); setNewTaskTitle(''); }
              }}
              autoFocus
              className="h-8 text-sm"
            />
            <Button size="sm" onClick={handleAddTask} className="h-8 px-3">Add</Button>
          </div>
        ) : (
          <Button variant="ghost" size="sm" onClick={() => setShowInput(true)} className="w-full justify-start text-muted-foreground hover:text-foreground h-8">
            <Plus className="w-4 h-4 mr-2" />
            Add task
          </Button>
        )}
      </div>
    </div>
  );
};

export default TasksWidget;
