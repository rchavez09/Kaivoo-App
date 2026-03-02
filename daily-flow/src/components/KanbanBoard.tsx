import { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Flag, Calendar, GripVertical } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { Task, TaskStatus } from '@/types';
import { useKaivooStore } from '@/stores/useKaivooStore';
import { useKaivooActions } from '@/hooks/useKaivooActions';
import { statusConfig, priorityConfig } from '@/lib/task-config';

const COLUMNS: TaskStatus[] = ['backlog', 'todo', 'doing', 'blocked', 'done'];

interface KanbanBoardProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
}

interface SortableTaskCardProps {
  task: Task;
  onTaskClick: (task: Task) => void;
}

const SortableTaskCard = ({ task, onTaskClick }: SortableTaskCardProps) => {
  const topics = useKaivooStore((s) => s.topics);
  const topicPages = useKaivooStore((s) => s.topicPages);
  const projects = useKaivooStore((s) => s.projects);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const project = task.projectId ? projects.find((p) => p.id === task.projectId) : null;

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

  const getProgress = () => {
    if (task.subtasks.length === 0) return null;
    const completed = task.subtasks.filter((s) => s.completed).length;
    return Math.round((completed / task.subtasks.length) * 100);
  };

  const progress = getProgress();

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group cursor-pointer rounded-xl border border-border/50 bg-card p-3 shadow-sm transition-all hover:shadow-md',
        isDragging && 'opacity-50 shadow-lg',
      )}
      onClick={() => onTaskClick(task)}
    >
      {project && (
        <div className="mb-2 flex items-center gap-1.5">
          <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: project.color }} />
          <span className="truncate text-[10px] font-medium text-muted-foreground">{project.name}</span>
        </div>
      )}
      <div className="flex items-start gap-2">
        <button
          {...attributes}
          {...listeners}
          className="mt-0.5 cursor-grab opacity-0 transition-opacity active:cursor-grabbing group-hover:opacity-100"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </button>
        <div className="min-w-0 flex-1">
          <p
            className={cn(
              'line-clamp-2 text-sm font-medium',
              task.status === 'done' ? 'text-muted-foreground line-through' : 'text-foreground',
            )}
          >
            {task.title}
          </p>

          {progress !== null && (
            <div className="mt-2 flex items-center gap-1.5">
              <Progress value={progress} className="h-1.5 flex-1" />
              <span className="text-[10px] text-muted-foreground">{progress}%</span>
            </div>
          )}

          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            {task.dueDate && (
              <Badge variant="outline" className="h-5 gap-1 px-1.5 text-[10px] font-normal">
                <Calendar className="h-2.5 w-2.5" />
                {task.dueDate}
              </Badge>
            )}
            <Badge
              variant="secondary"
              className={cn(
                'h-5 px-1.5 text-[10px] font-normal',
                priorityConfig[task.priority].bg,
                priorityConfig[task.priority].color,
              )}
            >
              <Flag className="mr-0.5 h-2.5 w-2.5" />
              {priorityConfig[task.priority].label}
            </Badge>
          </div>

          {(task.topicIds.length > 0 || task.tags.length > 0) && (
            <div className="mt-2 flex flex-wrap items-center gap-1">
              {task.topicIds.slice(0, 1).map((topicId) => {
                const name = getTopicName(topicId);
                return name ? (
                  <Badge
                    key={topicId}
                    variant="secondary"
                    className="h-5 px-1.5 text-[10px] font-normal text-info-foreground"
                  >
                    [[{name}]]
                  </Badge>
                ) : null;
              })}
              {task.topicIds.length > 1 && (
                <Badge variant="secondary" className="h-5 px-1.5 text-[10px] font-normal text-muted-foreground">
                  +{task.topicIds.length - 1}
                </Badge>
              )}
              {task.tags.slice(0, 1).map((tag) => (
                <Badge key={tag} variant="secondary" className="h-5 px-1.5 text-[10px] font-normal text-primary">
                  #{tag}
                </Badge>
              ))}
              {task.tags.length > 1 && (
                <Badge variant="secondary" className="h-5 px-1.5 text-[10px] font-normal text-muted-foreground">
                  +{task.tags.length - 1}
                </Badge>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const TaskCard = ({ task, onTaskClick }: { task: Task; onTaskClick: (task: Task) => void }) => {
  const topics = useKaivooStore((s) => s.topics);
  const topicPages = useKaivooStore((s) => s.topicPages);
  const projects = useKaivooStore((s) => s.projects);
  const project = task.projectId ? projects.find((p) => p.id === task.projectId) : null;

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

  const getProgress = () => {
    if (task.subtasks.length === 0) return null;
    const completed = task.subtasks.filter((s) => s.completed).length;
    return Math.round((completed / task.subtasks.length) * 100);
  };

  const progress = getProgress();

  return (
    <div className="rounded-xl border border-border bg-card p-3 shadow-lg">
      {project && (
        <div className="mb-2 flex items-center gap-1.5">
          <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: project.color }} />
          <span className="truncate text-[10px] font-medium text-muted-foreground">{project.name}</span>
        </div>
      )}
      <p
        className={cn(
          'line-clamp-2 text-sm font-medium',
          task.status === 'done' ? 'text-muted-foreground line-through' : 'text-foreground',
        )}
      >
        {task.title}
      </p>

      {progress !== null && (
        <div className="mt-2 flex items-center gap-1.5">
          <Progress value={progress} className="h-1.5 flex-1" />
          <span className="text-[10px] text-muted-foreground">{progress}%</span>
        </div>
      )}

      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        {task.dueDate && (
          <Badge variant="outline" className="h-5 gap-1 px-1.5 text-[10px] font-normal">
            <Calendar className="h-2.5 w-2.5" />
            {task.dueDate}
          </Badge>
        )}
        <Badge
          variant="secondary"
          className={cn(
            'h-5 px-1.5 text-[10px] font-normal',
            priorityConfig[task.priority].bg,
            priorityConfig[task.priority].color,
          )}
        >
          <Flag className="mr-0.5 h-2.5 w-2.5" />
          {priorityConfig[task.priority].label}
        </Badge>
      </div>
    </div>
  );
};

interface KanbanColumnProps {
  status: TaskStatus;
  tasks: Task[];
  onTaskClick: (task: Task) => void;
}

const KanbanColumn = ({ status, tasks, onTaskClick }: KanbanColumnProps) => {
  const config = statusConfig[status];

  return (
    <div className="flex w-[280px] min-w-[280px] flex-col rounded-xl bg-secondary/30">
      {/* Column header */}
      <div className={cn('flex items-center gap-2 rounded-t-xl px-3 py-2.5', config.bgHeader)}>
        <span className={config.color}>{config.icon}</span>
        <span className="text-sm font-medium">{config.label}</span>
        <span className="ml-auto rounded-full bg-background/50 px-1.5 py-0.5 text-xs text-muted-foreground">
          {tasks.length}
        </span>
      </div>

      {/* Tasks */}
      <div className="scrollbar-thin max-h-[calc(100vh-280px)] flex-1 space-y-2 overflow-y-auto p-2">
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <SortableTaskCard key={task.id} task={task} onTaskClick={onTaskClick} />
          ))}
        </SortableContext>

        {tasks.length === 0 && (
          <div className="py-8 text-center">
            <p className="text-xs text-muted-foreground">No tasks</p>
          </div>
        )}
      </div>
    </div>
  );
};

const KanbanBoard = ({ tasks, onTaskClick }: KanbanBoardProps) => {
  const { updateTask } = useKaivooActions();
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const tasksByStatus = COLUMNS.reduce(
    (acc, status) => {
      acc[status] = tasks.filter((t) => t.status === status);
      return acc;
    },
    {} as Record<TaskStatus, Task[]>,
  );

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find((t) => t.id === event.active.id);
    if (task) {
      setActiveTask(task);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const activeTask = tasks.find((t) => t.id === active.id);
    if (!activeTask) return;

    // Check if dropped over a column (status)
    const newStatus = COLUMNS.find((status) => {
      const columnTasks = tasksByStatus[status];
      return columnTasks.some((t) => t.id === over.id) || over.id === status;
    });

    // Also check if dropped in empty column area
    const droppedOnTask = tasks.find((t) => t.id === over.id);
    const finalStatus = droppedOnTask ? droppedOnTask.status : newStatus;

    if (finalStatus && finalStatus !== activeTask.status) {
      void updateTask(activeTask.id, {
        status: finalStatus,
        completedAt: finalStatus === 'done' ? new Date() : undefined,
      });
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="scrollbar-thin flex gap-4 overflow-x-auto pb-4">
        {COLUMNS.map((status) => (
          <KanbanColumn key={status} status={status} tasks={tasksByStatus[status]} onTaskClick={onTaskClick} />
        ))}
      </div>

      <DragOverlay>{activeTask ? <TaskCard task={activeTask} onTaskClick={() => {}} /> : null}</DragOverlay>
    </DndContext>
  );
};

export default KanbanBoard;
