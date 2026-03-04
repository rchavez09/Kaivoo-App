import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Calendar,
  Flag,
  Hash,
  Link2,
  Plus,
  Trash2,
  Circle,
  CheckCircle2,
  X as XIcon,
  Check,
  PlayCircle,
  RefreshCw,
  Layers,
  GripVertical,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { TaskStatus, TaskPriority, RecurrenceType, Subtask } from '@/types';
import { useKaivooStore } from '@/stores/useKaivooStore';
import { useKaivooActions } from '@/hooks/useKaivooActions';
import { toast } from 'sonner';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { statusConfig, priorityConfig } from '@/lib/task-config';

// ─── Sortable Subtask Item ───

interface SortableSubtaskItemProps {
  subtask: Subtask;
  taskId: string;
  editingSubtaskId: string | null;
  editingSubtaskTitle: string;
  setEditingSubtaskId: (id: string | null) => void;
  setEditingSubtaskTitle: (title: string) => void;
  onToggle: (taskId: string, subtaskId: string) => void;
  onUpdate: (taskId: string, subtaskId: string, updates: { title: string }) => void;
  onDelete: (taskId: string, subtaskId: string) => void;
}

function SortableSubtaskItem({
  subtask,
  taskId,
  editingSubtaskId,
  editingSubtaskTitle,
  setEditingSubtaskId,
  setEditingSubtaskTitle,
  onToggle,
  onUpdate,
  onDelete,
}: SortableSubtaskItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: subtask.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group -mx-2 flex items-center gap-1 rounded-lg px-2 py-1.5 hover:bg-card/50',
        isDragging && 'z-10 bg-card opacity-90 shadow-md',
      )}
    >
      <button
        className="flex-shrink-0 cursor-grab touch-none text-muted-foreground/50 hover:text-muted-foreground active:cursor-grabbing"
        aria-label="Drag to reorder"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-3.5 w-3.5" />
      </button>
      <button onClick={() => onToggle(taskId, subtask.id)} className="flex-shrink-0">
        {subtask.completed ? (
          <CheckCircle2 className="h-4 w-4 text-success-foreground" />
        ) : (
          <Circle className="h-4 w-4 text-muted-foreground" />
        )}
      </button>
      {editingSubtaskId === subtask.id ? (
        <Input
          value={editingSubtaskTitle}
          onChange={(e) => setEditingSubtaskTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              if (editingSubtaskTitle.trim()) {
                onUpdate(taskId, subtask.id, { title: editingSubtaskTitle.trim() });
              }
              setEditingSubtaskId(null);
            } else if (e.key === 'Escape') {
              setEditingSubtaskId(null);
            }
          }}
          onBlur={() => {
            if (editingSubtaskTitle.trim() && editingSubtaskTitle !== subtask.title) {
              onUpdate(taskId, subtask.id, { title: editingSubtaskTitle.trim() });
            }
            setEditingSubtaskId(null);
          }}
          className="h-7 flex-1 text-sm"
          autoFocus
        />
      ) : (
        <span
          className={cn(
            'flex-1 cursor-pointer text-sm hover:text-foreground',
            subtask.completed && 'text-muted-foreground line-through',
          )}
          onClick={() => {
            setEditingSubtaskId(subtask.id);
            setEditingSubtaskTitle(subtask.title);
          }}
        >
          {subtask.title}
        </span>
      )}
      <Button
        variant="ghost"
        size="icon"
        aria-label="Delete subtask"
        className="h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
        onClick={() => onDelete(taskId, subtask.id)}
      >
        <Trash2 className="h-3 w-3 text-muted-foreground hover:text-destructive" />
      </Button>
    </div>
  );
}

// ─── Task Details Drawer ───

interface TaskDetailsDrawerProps {
  taskId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TaskDetailsDrawer = ({ taskId, open, onOpenChange }: TaskDetailsDrawerProps) => {
  const tasks = useKaivooStore((s) => s.tasks);
  const projects = useKaivooStore((s) => s.projects);
  const topics = useKaivooStore((s) => s.topics);
  const topicPages = useKaivooStore((s) => s.topicPages);
  const resolveTopicPath = useKaivooStore((s) => s.resolveTopicPath);
  const { updateTask, deleteTask, addSubtask, toggleSubtask, updateSubtask, deleteSubtask, reorderSubtasks } =
    useKaivooActions();

  // State for inline subtask editing
  const [editingSubtaskId, setEditingSubtaskId] = useState<string | null>(null);
  const [editingSubtaskTitle, setEditingSubtaskTitle] = useState('');

  // Get current task from store (will update when subtasks change)
  const task = useMemo(() => tasks.find((t) => t.id === taskId), [tasks, taskId]);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [newSubtask, setNewSubtask] = useState('');
  const [newTag, setNewTag] = useState('');
  const [topicPickerOpen, setTopicPickerOpen] = useState(false);
  const [newTopicName, setNewTopicName] = useState('');

  // Build topic options list - must be before any conditional returns
  const topicOptions = useMemo(() => {
    const options: { id: string; name: string; isPage: boolean }[] = [];
    topics.forEach((topic) => {
      options.push({ id: topic.id, name: topic.name, isPage: false });
      const pages = topicPages.filter((p) => p.topicId === topic.id);
      pages.forEach((page) => {
        options.push({ id: page.id, name: `${topic.name}/${page.name}`, isPage: true });
      });
    });
    return options;
  }, [topics, topicPages]);

  const showSavedFeedback = useCallback(() => {
    toast.success('Changes saved', {
      duration: 1500,
      icon: <Check className="h-4 w-4" />,
    });
  }, []);

  // dnd-kit sensors for subtask reorder (must be before early return)
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const sortedSubtasks = useMemo(
    () => (task ? [...task.subtasks].sort((a, b) => a.sortOrder - b.sortOrder) : []),
    [task],
  );

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
    }
  }, [task]);

  if (!task) return null;

  const completedSubtasks = task.subtasks.filter((s) => s.completed).length;
  const totalSubtasks = task.subtasks.length;
  const progress = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0;

  const handleTitleBlur = () => {
    if (title.trim() && title !== task.title) {
      updateTask(task.id, { title: title.trim() });
      showSavedFeedback();
    }
  };

  const handleDescriptionBlur = () => {
    if (description !== task.description) {
      updateTask(task.id, { description });
      showSavedFeedback();
    }
  };

  const handleAddSubtask = () => {
    if (newSubtask.trim()) {
      addSubtask(task.id, newSubtask.trim());
      setNewSubtask('');
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !task.tags.includes(newTag.trim().toLowerCase())) {
      updateTask(task.id, { tags: [...task.tags, newTag.trim().toLowerCase()] });
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    updateTask(task.id, { tags: task.tags.filter((t) => t !== tagToRemove) });
  };

  const handleDelete = () => {
    deleteTask(task.id);
    onOpenChange(false);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = sortedSubtasks.findIndex((s) => s.id === active.id);
    const newIndex = sortedSubtasks.findIndex((s) => s.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    const reordered = [...sortedSubtasks];
    const [moved] = reordered.splice(oldIndex, 1);
    reordered.splice(newIndex, 0, moved);
    reorderSubtasks(
      task.id,
      reordered.map((s) => s.id),
    );
  };

  const handleToggleTopic = (topicId: string) => {
    const isSelected = task.topicIds.includes(topicId);
    if (isSelected) {
      updateTask(task.id, { topicIds: task.topicIds.filter((id) => id !== topicId) });
    } else {
      updateTask(task.id, { topicIds: [...task.topicIds, topicId] });
    }
  };

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

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto border-l-4 border-panel-task-accent/30 bg-gradient-to-b from-panel-task-from to-panel-task-to sm:max-w-lg">
        <SheetHeader className="mb-2 space-y-4 pb-4">
          <SheetTitle className="sr-only">Edit Task</SheetTitle>
          <div className="flex items-start gap-2">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleTitleBlur}
              className="flex-1 border-0 bg-transparent px-0 text-lg font-semibold shadow-none focus-visible:ring-0"
              placeholder="Task title"
            />
          </div>

          {/* Status & Priority row - styled pills */}
          <div className="flex items-center gap-2">
            <Select
              value={task.status}
              onValueChange={(v) =>
                updateTask(task.id, {
                  status: v as TaskStatus,
                  completedAt: v === 'done' ? new Date() : undefined,
                })
              }
            >
              <SelectTrigger
                className={cn(
                  'inline-flex h-8 w-auto flex-row items-center gap-1.5 rounded-full border-0 px-3 text-xs font-medium shadow-none',
                  statusConfig[task.status].bg,
                  statusConfig[task.status].color,
                )}
              >
                {statusConfig[task.status].icon}
                <span>{statusConfig[task.status].label}</span>
              </SelectTrigger>
              <SelectContent>
                {Object.entries(statusConfig).map(([key, config]) => (
                  <SelectItem key={key} value={key}>
                    <span className={cn('inline-flex flex-row items-center gap-2', config.color)}>
                      {config.icon}
                      {config.label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={task.priority} onValueChange={(v) => updateTask(task.id, { priority: v as TaskPriority })}>
              <SelectTrigger
                className={cn(
                  'inline-flex h-8 w-auto flex-row items-center gap-1.5 rounded-full border-0 px-3 text-xs font-medium shadow-none',
                  priorityConfig[task.priority].bg,
                  priorityConfig[task.priority].color,
                )}
              >
                <Flag className="h-3 w-3" />
                <span>{priorityConfig[task.priority].label}</span>
              </SelectTrigger>
              <SelectContent>
                {Object.entries(priorityConfig).map(([key, config]) => (
                  <SelectItem key={key} value={key}>
                    <span className={cn('inline-flex flex-row items-center gap-2', config.color)}>
                      <Flag className="h-3 w-3" />
                      {config.label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </SheetHeader>

        <div className="space-y-4 py-6">
          {/* Dates Row - Start and Due Date side by side */}
          <div className="grid grid-cols-2 gap-3">
            {/* Start Date */}
            <div className="space-y-2 rounded-xl bg-panel-task-section p-4 shadow-sm">
              <label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <PlayCircle className="h-3.5 w-3.5" />
                Start Date
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start bg-card/50 text-left text-xs font-normal hover:bg-card"
                  >
                    {task.startDate || 'Set start'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={task.startDate ? new Date(task.startDate) : undefined}
                    onSelect={(date) => {
                      updateTask(task.id, {
                        startDate: date ? format(date, 'MMM d, yyyy') : undefined,
                      });
                      showSavedFeedback();
                    }}
                    initialFocus
                    className="pointer-events-auto p-3"
                  />
                  <div className="flex gap-1 border-t border-border p-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex-1 text-xs"
                      onClick={() => {
                        updateTask(task.id, { startDate: 'Today' });
                        showSavedFeedback();
                      }}
                    >
                      Today
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex-1 text-xs"
                      onClick={() => {
                        updateTask(task.id, { startDate: undefined });
                        showSavedFeedback();
                      }}
                    >
                      Clear
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            {/* Due Date */}
            <div className="space-y-2 rounded-xl bg-panel-task-section p-4 shadow-sm">
              <label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" />
                Due Date
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start bg-card/50 text-left text-xs font-normal hover:bg-card"
                  >
                    {task.dueDate || 'Set due'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={task.dueDate ? new Date(task.dueDate) : undefined}
                    onSelect={(date) => {
                      updateTask(task.id, {
                        dueDate: date ? format(date, 'MMM d, yyyy') : undefined,
                      });
                      showSavedFeedback();
                    }}
                    initialFocus
                    className="pointer-events-auto p-3"
                  />
                  <div className="flex gap-1 border-t border-border p-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex-1 text-xs"
                      onClick={() => {
                        updateTask(task.id, { dueDate: 'Today' });
                        showSavedFeedback();
                      }}
                    >
                      Today
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex-1 text-xs"
                      onClick={() => {
                        updateTask(task.id, { dueDate: 'Tomorrow' });
                        showSavedFeedback();
                      }}
                    >
                      Tomorrow
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Recurrence - card section */}
          <div className="space-y-2 rounded-xl bg-panel-task-section p-4 shadow-sm">
            <label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <RefreshCw className="h-3.5 w-3.5" />
              Recurrence
            </label>
            <Select
              value={task.recurrence?.type ?? 'none'}
              onValueChange={(v) => {
                if (v === 'none') {
                  updateTask(task.id, { recurrence: undefined });
                } else {
                  updateTask(task.id, { recurrence: { type: v as RecurrenceType, interval: 1 } });
                }
                showSavedFeedback();
              }}
            >
              <SelectTrigger className="h-8 border-0 bg-card/50 text-xs">
                <span className="flex items-center gap-1.5">
                  {task.recurrence ? (
                    <>
                      <RefreshCw className="h-3 w-3 text-info-foreground" />
                      {task.recurrence.type === 'daily' && 'Daily'}
                      {task.recurrence.type === 'weekly' && 'Weekly'}
                      {task.recurrence.type === 'monthly' && 'Monthly'}
                    </>
                  ) : (
                    'None'
                  )}
                </span>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Project - card section */}
          <div className="space-y-2 rounded-xl bg-panel-task-section p-4 shadow-sm">
            <label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <Layers className="h-3.5 w-3.5" />
              Project
            </label>
            <Select
              value={task.projectId ?? 'none'}
              onValueChange={(v) => {
                updateTask(task.id, { projectId: v === 'none' ? undefined : v });
                showSavedFeedback();
              }}
            >
              <SelectTrigger className="h-8 border-0 bg-card/50 text-xs">
                <span className="flex items-center gap-1.5 truncate">
                  {task.projectId ? (
                    <>
                      <span
                        className="h-2 w-2 shrink-0 rounded-full"
                        style={{ backgroundColor: projects.find((p) => p.id === task.projectId)?.color || '#888' }}
                      />
                      {projects.find((p) => p.id === task.projectId)?.name || 'Unknown'}
                    </>
                  ) : (
                    'None'
                  )}
                </span>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {projects.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    <span className="inline-flex items-center gap-1.5">
                      <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: p.color || '#888' }} />
                      {p.name}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Description - card section */}
          <div className="space-y-2 rounded-xl bg-panel-task-section p-4 shadow-sm">
            <label className="text-xs font-medium text-muted-foreground">Description</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onBlur={handleDescriptionBlur}
              placeholder="Add a description..."
              className="min-h-[100px] resize-none border-0 bg-card/50"
            />
          </div>

          {/* Topics - card section */}
          <div className="space-y-2 rounded-xl bg-panel-task-section p-4 shadow-sm">
            <label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <Link2 className="h-3.5 w-3.5" />
              Topics
            </label>
            <div className="flex flex-wrap gap-1.5">
              {task.topicIds.map((id) => {
                const name = getTopicName(id);
                return name ? (
                  <Badge
                    key={id}
                    variant="secondary"
                    className="cursor-pointer bg-card/80 text-xs text-info-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => handleToggleTopic(id)}
                  >
                    [[{name}]] <XIcon className="ml-1 h-2.5 w-2.5" />
                  </Badge>
                ) : null;
              })}
              <Popover open={topicPickerOpen} onOpenChange={setTopicPickerOpen}>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-6 gap-1 text-xs text-muted-foreground">
                    <Plus className="h-3 w-3" />
                    Add topic
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64 p-2" align="start">
                  {/* Create new topic input */}
                  <div className="mb-2 flex items-center gap-1 border-b border-border pb-2">
                    <Input
                      value={newTopicName}
                      onChange={(e) => setNewTopicName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && newTopicName.trim()) {
                          // Use resolveTopicPath with autoCreate to handle Topic/Page format
                          const resolvedIds = resolveTopicPath(newTopicName.trim(), true);
                          if (resolvedIds && resolvedIds.length > 0) {
                            // Add the most specific ID (page if exists, otherwise topic)
                            const targetId = resolvedIds[resolvedIds.length - 1];
                            if (!task.topicIds.includes(targetId)) {
                              updateTask(task.id, { topicIds: [...task.topicIds, targetId] });
                              toast.success(`Added "${newTopicName.trim()}" to task`);
                            } else {
                              toast.info('Already linked to this topic/page');
                            }
                          }
                          setNewTopicName('');
                        }
                      }}
                      placeholder="Create new topic..."
                      className="h-7 flex-1 text-xs"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2"
                      disabled={!newTopicName.trim()}
                      onClick={() => {
                        if (newTopicName.trim()) {
                          // Use resolveTopicPath with autoCreate to handle Topic/Page format
                          const resolvedIds = resolveTopicPath(newTopicName.trim(), true);
                          if (resolvedIds && resolvedIds.length > 0) {
                            // Add the most specific ID (page if exists, otherwise topic)
                            const targetId = resolvedIds[resolvedIds.length - 1];
                            if (!task.topicIds.includes(targetId)) {
                              updateTask(task.id, { topicIds: [...task.topicIds, targetId] });
                              toast.success(`Added "${newTopicName.trim()}" to task`);
                            } else {
                              toast.info('Already linked to this topic/page');
                            }
                          }
                          setNewTopicName('');
                        }
                      }}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="max-h-48 space-y-1 overflow-y-auto">
                    {topicOptions.map((option) => {
                      const isSelected = task.topicIds.includes(option.id);
                      return (
                        <button
                          key={option.id}
                          onClick={() => handleToggleTopic(option.id)}
                          className={cn(
                            'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors hover:bg-secondary',
                            isSelected && 'bg-secondary',
                          )}
                        >
                          <Checkbox checked={isSelected} className="pointer-events-none" />
                          <span className={option.isPage ? 'text-muted-foreground' : ''}>
                            {option.isPage ? `  ${option.name}` : option.name}
                          </span>
                        </button>
                      );
                    })}
                    {topicOptions.length === 0 && (
                      <p className="p-2 text-xs text-muted-foreground">No topics yet. Create one above!</p>
                    )}
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Tags - card section */}
          <div className="space-y-2 rounded-xl bg-panel-task-section p-4 shadow-sm">
            <label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <Hash className="h-3.5 w-3.5" />
              Tags
            </label>
            <div className="flex flex-wrap gap-1.5">
              {task.tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="cursor-pointer bg-card/80 text-xs text-primary transition-colors hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => handleRemoveTag(tag)}
                >
                  #{tag} <XIcon className="ml-1 h-2.5 w-2.5" />
                </Badge>
              ))}
              <div className="flex items-center gap-1">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                  placeholder="Add tag..."
                  className="h-6 w-24 border-0 bg-card/50 px-2 text-xs"
                />
                <Button variant="ghost" size="icon" aria-label="Add tag" className="h-6 w-6" onClick={handleAddTag}>
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>

          {/* Subtasks - card section */}
          <div className="space-y-3 rounded-xl bg-panel-task-section p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-muted-foreground">Subtasks</label>
              {totalSubtasks > 0 && (
                <span className="text-xs text-muted-foreground">
                  {completedSubtasks}/{totalSubtasks} ({progress}%)
                </span>
              )}
            </div>

            {totalSubtasks > 0 && <Progress value={progress} className="h-1.5" />}

            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={sortedSubtasks.map((s) => s.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-1">
                  {sortedSubtasks.map((subtask) => (
                    <SortableSubtaskItem
                      key={subtask.id}
                      subtask={subtask}
                      taskId={task.id}
                      editingSubtaskId={editingSubtaskId}
                      editingSubtaskTitle={editingSubtaskTitle}
                      setEditingSubtaskId={setEditingSubtaskId}
                      setEditingSubtaskTitle={setEditingSubtaskTitle}
                      onToggle={toggleSubtask}
                      onUpdate={updateSubtask}
                      onDelete={deleteSubtask}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>

            <div className="flex items-center gap-2">
              <Circle className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
              <Input
                value={newSubtask}
                onChange={(e) => setNewSubtask(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddSubtask()}
                placeholder="Add subtask..."
                className="h-8 border-dashed bg-card/50 text-sm"
              />
              <Button variant="ghost" size="sm" onClick={handleAddSubtask} disabled={!newSubtask.trim()}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between border-t border-border/50 pt-4">
          <span className="text-xs text-muted-foreground">
            Created {format(new Date(task.createdAt), 'MMM d, yyyy')}
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={handleDelete}
          >
            <Trash2 className="mr-1 h-4 w-4" />
            Delete
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default TaskDetailsDrawer;
