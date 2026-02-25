import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Calendar, Flag, Hash, Link2, Plus, Trash2,
  Circle, CheckCircle2, X as XIcon, Check, PlayCircle, RefreshCw, Layers
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { TaskStatus, TaskPriority, RecurrenceType } from '@/types';
import { useKaivooStore } from '@/stores/useKaivooStore';
import { useKaivooActions } from '@/hooks/useKaivooActions';
import { toast } from 'sonner';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
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
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';

import { statusConfig, priorityConfig } from '@/lib/task-config';

interface TaskDetailsDrawerProps {
  taskId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TaskDetailsDrawer = ({ taskId, open, onOpenChange }: TaskDetailsDrawerProps) => {
  const tasks = useKaivooStore(s => s.tasks);
  const projects = useKaivooStore(s => s.projects);
  const topics = useKaivooStore(s => s.topics);
  const topicPages = useKaivooStore(s => s.topicPages);
  const resolveTopicPath = useKaivooStore(s => s.resolveTopicPath);
  const { updateTask, deleteTask, addSubtask, toggleSubtask, updateSubtask, deleteSubtask } = useKaivooActions();
  
  // State for inline subtask editing
  const [editingSubtaskId, setEditingSubtaskId] = useState<string | null>(null);
  const [editingSubtaskTitle, setEditingSubtaskTitle] = useState('');

  // Get current task from store (will update when subtasks change)
  const task = useMemo(() => tasks.find(t => t.id === taskId), [tasks, taskId]);
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [newSubtask, setNewSubtask] = useState('');
  const [newTag, setNewTag] = useState('');
  const [topicPickerOpen, setTopicPickerOpen] = useState(false);
  const [newTopicName, setNewTopicName] = useState('');

  // Build topic options list - must be before any conditional returns
  const topicOptions = useMemo(() => {
    const options: { id: string; name: string; isPage: boolean }[] = [];
    topics.forEach(topic => {
      if (topic.id !== 'topic-daily-notes') {
        options.push({ id: topic.id, name: topic.name, isPage: false });
        const pages = topicPages.filter(p => p.topicId === topic.id);
        pages.forEach(page => {
          options.push({ id: page.id, name: `${topic.name}/${page.name}`, isPage: true });
        });
      }
    });
    return options;
  }, [topics, topicPages]);

  const showSavedFeedback = useCallback(() => {
    toast.success('Changes saved', { 
      duration: 1500,
      icon: <Check className="w-4 h-4" />,
    });
  }, []);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
    }
  }, [task]);

  if (!task) return null;

  const completedSubtasks = task.subtasks.filter(s => s.completed).length;
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
    updateTask(task.id, { tags: task.tags.filter(t => t !== tagToRemove) });
  };

  const handleDelete = () => {
    deleteTask(task.id);
    onOpenChange(false);
  };

  const handleToggleTopic = (topicId: string) => {
    const isSelected = task.topicIds.includes(topicId);
    if (isSelected) {
      updateTask(task.id, { topicIds: task.topicIds.filter(id => id !== topicId) });
    } else {
      updateTask(task.id, { topicIds: [...task.topicIds, topicId] });
    }
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

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto bg-gradient-to-b from-panel-task-from to-panel-task-to border-l-4 border-panel-task-accent/30">
        <SheetHeader className="space-y-4 pb-4 mb-2">
          <SheetTitle className="sr-only">Edit Task</SheetTitle>
          <div className="flex items-start gap-2">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleTitleBlur}
              className="text-lg font-semibold border-0 px-0 focus-visible:ring-0 shadow-none flex-1 bg-transparent"
              placeholder="Task title"
            />
          </div>
          
          {/* Status & Priority row - styled pills */}
          <div className="flex items-center gap-2">
            <Select 
              value={task.status} 
              onValueChange={(v) => updateTask(task.id, { 
                status: v as TaskStatus,
                completedAt: v === 'done' ? new Date() : undefined
              })}
            >
              <SelectTrigger className={cn(
                "w-auto h-8 text-xs border-0 shadow-none px-3 rounded-full font-medium inline-flex flex-row items-center gap-1.5",
                statusConfig[task.status].bg,
                statusConfig[task.status].color
              )}>
                {statusConfig[task.status].icon}
                <span>{statusConfig[task.status].label}</span>
              </SelectTrigger>
              <SelectContent>
                {Object.entries(statusConfig).map(([key, config]) => (
                  <SelectItem key={key} value={key}>
                    <span className={cn("inline-flex flex-row items-center gap-2", config.color)}>
                      {config.icon}
                      {config.label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select 
              value={task.priority} 
              onValueChange={(v) => updateTask(task.id, { priority: v as TaskPriority })}
            >
              <SelectTrigger className={cn(
                "w-auto h-8 text-xs border-0 shadow-none px-3 rounded-full font-medium inline-flex flex-row items-center gap-1.5",
                priorityConfig[task.priority].bg,
                priorityConfig[task.priority].color
              )}>
                <Flag className="w-3 h-3" />
                <span>{priorityConfig[task.priority].label}</span>
              </SelectTrigger>
              <SelectContent>
                {Object.entries(priorityConfig).map(([key, config]) => (
                  <SelectItem key={key} value={key}>
                    <span className={cn("inline-flex flex-row items-center gap-2", config.color)}>
                      <Flag className="w-3 h-3" />
                      {config.label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </SheetHeader>

        <div className="py-6 space-y-4">
          {/* Dates Row - Start and Due Date side by side */}
          <div className="grid grid-cols-2 gap-3">
            {/* Start Date */}
            <div className="bg-panel-task-section rounded-xl p-4 space-y-2 shadow-sm">
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <PlayCircle className="w-3.5 h-3.5" />
                Start Date
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="sm" className="w-full justify-start text-left font-normal bg-card/50 hover:bg-card text-xs">
                    {task.startDate || 'Set start'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={task.startDate ? new Date(task.startDate) : undefined}
                    onSelect={(date) => {
                      updateTask(task.id, { 
                        startDate: date ? format(date, 'MMM d, yyyy') : undefined 
                      });
                      showSavedFeedback();
                    }}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                  <div className="p-2 border-t border-border flex gap-1">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-xs flex-1"
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
                      className="text-xs flex-1"
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
            <div className="bg-panel-task-section rounded-xl p-4 space-y-2 shadow-sm">
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                Due Date
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="sm" className="w-full justify-start text-left font-normal bg-card/50 hover:bg-card text-xs">
                    {task.dueDate || 'Set due'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={task.dueDate ? new Date(task.dueDate) : undefined}
                    onSelect={(date) => {
                      updateTask(task.id, { 
                        dueDate: date ? format(date, 'MMM d, yyyy') : undefined 
                      });
                      showSavedFeedback();
                    }}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                  <div className="p-2 border-t border-border flex gap-1">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-xs flex-1"
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
                      className="text-xs flex-1"
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
          <div className="bg-panel-task-section rounded-xl p-4 space-y-2 shadow-sm">
            <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <RefreshCw className="w-3.5 h-3.5" />
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
              <SelectTrigger className="bg-card/50 border-0 text-xs h-8">
                <span className="flex items-center gap-1.5">
                  {task.recurrence ? (
                    <>
                      <RefreshCw className="w-3 h-3 text-info" />
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
          <div className="bg-panel-task-section rounded-xl p-4 space-y-2 shadow-sm">
            <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" />
              Project
            </label>
            <Select
              value={task.projectId ?? 'none'}
              onValueChange={(v) => {
                updateTask(task.id, { projectId: v === 'none' ? undefined : v });
                showSavedFeedback();
              }}
            >
              <SelectTrigger className="bg-card/50 border-0 text-xs h-8">
                <span className="flex items-center gap-1.5 truncate">
                  {task.projectId ? (
                    <>
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: projects.find(p => p.id === task.projectId)?.color || '#888' }}
                      />
                      {projects.find(p => p.id === task.projectId)?.name || 'Unknown'}
                    </>
                  ) : (
                    'None'
                  )}
                </span>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {projects.map(p => (
                  <SelectItem key={p.id} value={p.id}>
                    <span className="inline-flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: p.color || '#888' }} />
                      {p.name}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Description - card section */}
          <div className="bg-panel-task-section rounded-xl p-4 space-y-2 shadow-sm">
            <label className="text-xs font-medium text-muted-foreground">Description</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onBlur={handleDescriptionBlur}
              placeholder="Add a description..."
              className="min-h-[100px] resize-none bg-card/50 border-0"
            />
          </div>

          {/* Topics - card section */}
          <div className="bg-panel-task-section rounded-xl p-4 space-y-2 shadow-sm">
            <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <Link2 className="w-3.5 h-3.5" />
              Topics
            </label>
            <div className="flex flex-wrap gap-1.5">
              {task.topicIds.map(id => {
                const name = getTopicName(id);
                return name ? (
                  <Badge 
                    key={id} 
                    variant="secondary" 
                    className="text-xs text-info cursor-pointer hover:bg-destructive/10 hover:text-destructive transition-colors bg-card/80"
                    onClick={() => handleToggleTopic(id)}
                  >
                    [[{name}]] <XIcon className="w-2.5 h-2.5 ml-1" />
                  </Badge>
                ) : null;
              })}
              <Popover open={topicPickerOpen} onOpenChange={setTopicPickerOpen}>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-6 text-xs gap-1 text-muted-foreground">
                    <Plus className="w-3 h-3" />
                    Add topic
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64 p-2" align="start">
                  {/* Create new topic input */}
                  <div className="flex items-center gap-1 mb-2 pb-2 border-b border-border">
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
                      className="h-7 text-xs flex-1"
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
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>
                  <div className="space-y-1 max-h-48 overflow-y-auto">
                    {topicOptions.map(option => {
                      const isSelected = task.topicIds.includes(option.id);
                      return (
                        <button
                          key={option.id}
                          onClick={() => handleToggleTopic(option.id)}
                          className={cn(
                            "w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded-md hover:bg-secondary transition-colors text-left",
                            isSelected && "bg-secondary"
                          )}
                        >
                          <Checkbox checked={isSelected} className="pointer-events-none" />
                          <span className={option.isPage ? "text-muted-foreground" : ""}>
                            {option.isPage ? `  ${option.name}` : option.name}
                          </span>
                        </button>
                      );
                    })}
                    {topicOptions.length === 0 && (
                      <p className="text-xs text-muted-foreground p-2">No topics yet. Create one above!</p>
                    )}
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Tags - card section */}
          <div className="bg-panel-task-section rounded-xl p-4 space-y-2 shadow-sm">
            <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <Hash className="w-3.5 h-3.5" />
              Tags
            </label>
            <div className="flex flex-wrap gap-1.5">
              {task.tags.map(tag => (
                <Badge 
                  key={tag} 
                  variant="secondary" 
                  className="text-xs text-primary cursor-pointer hover:bg-destructive/10 hover:text-destructive transition-colors bg-card/80"
                  onClick={() => handleRemoveTag(tag)}
                >
                  #{tag} <XIcon className="w-2.5 h-2.5 ml-1" />
                </Badge>
              ))}
              <div className="flex items-center gap-1">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                  placeholder="Add tag..."
                  className="h-6 text-xs w-24 px-2 bg-card/50 border-0"
                />
                <Button variant="ghost" size="icon" aria-label="Add tag" className="h-6 w-6" onClick={handleAddTag}>
                  <Plus className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </div>

          {/* Subtasks - card section */}
          <div className="bg-panel-task-section rounded-xl p-4 space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-muted-foreground">Subtasks</label>
              {totalSubtasks > 0 && (
                <span className="text-xs text-muted-foreground">
                  {completedSubtasks}/{totalSubtasks} ({progress}%)
                </span>
              )}
            </div>
            
            {totalSubtasks > 0 && (
              <Progress value={progress} className="h-1.5" />
            )}
            
            <div className="space-y-1">
              {task.subtasks.map(subtask => (
                <div 
                  key={subtask.id}
                  className="flex items-center gap-2 py-1.5 px-2 -mx-2 rounded-lg hover:bg-card/50 group"
                >
                  <button
                    onClick={() => toggleSubtask(task.id, subtask.id)}
                    className="flex-shrink-0"
                  >
                    {subtask.completed ? (
                      <CheckCircle2 className="w-4 h-4 text-success" />
                    ) : (
                      <Circle className="w-4 h-4 text-muted-foreground" />
                    )}
                  </button>
                  {editingSubtaskId === subtask.id ? (
                    <Input
                      value={editingSubtaskTitle}
                      onChange={(e) => setEditingSubtaskTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          if (editingSubtaskTitle.trim()) {
                            updateSubtask(task.id, subtask.id, { title: editingSubtaskTitle.trim() });
                          }
                          setEditingSubtaskId(null);
                        } else if (e.key === 'Escape') {
                          setEditingSubtaskId(null);
                        }
                      }}
                      onBlur={() => {
                        if (editingSubtaskTitle.trim() && editingSubtaskTitle !== subtask.title) {
                          updateSubtask(task.id, subtask.id, { title: editingSubtaskTitle.trim() });
                        }
                        setEditingSubtaskId(null);
                      }}
                      className="flex-1 h-7 text-sm"
                      autoFocus
                    />
                  ) : (
                    <span 
                      className={cn(
                        "flex-1 text-sm cursor-pointer hover:text-foreground",
                        subtask.completed && "line-through text-muted-foreground"
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
                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => deleteSubtask(task.id, subtask.id)}
                  >
                    <Trash2 className="w-3 h-3 text-muted-foreground hover:text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
            
            <div className="flex items-center gap-2">
              <Circle className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <Input
                value={newSubtask}
                onChange={(e) => setNewSubtask(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddSubtask()}
                placeholder="Add subtask..."
                className="h-8 text-sm border-dashed bg-card/50"
              />
              <Button variant="ghost" size="sm" onClick={handleAddSubtask} disabled={!newSubtask.trim()}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="pt-4 border-t border-border/50 flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            Created {format(new Date(task.createdAt), 'MMM d, yyyy')}
          </span>
          <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={handleDelete}>
            <Trash2 className="w-4 h-4 mr-1" />
            Delete
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default TaskDetailsDrawer;