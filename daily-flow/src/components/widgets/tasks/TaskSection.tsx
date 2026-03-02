import React from 'react';
import {
  CheckSquare,
  AlertTriangle,
  Flag,
  Calendar,
  Clock,
  Pause,
  Archive,
  Folder,
  Hash,
  ChevronRight,
  ChevronDown,
  CheckCircle2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Task } from '@/types';
import { SortableTaskRow, TaskRow } from './SortableTaskRow';
import type { TasksWidgetSection, TasksWidgetSettings, SectionId } from './TasksWidgetConfig';
import type { TaskVariant, SectionDisplayConfig } from './task-section-utils';
import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { SensorDescriptor, SensorOptions } from '@dnd-kit/core';

/** Icon lookup from string name to JSX element. */
const SECTION_ICONS: Record<string, React.ReactNode> = {
  CheckSquare: <CheckSquare className="h-3.5 w-3.5" />,
  AlertTriangle: <AlertTriangle className="h-3.5 w-3.5" />,
  Flag: <Flag className="h-3.5 w-3.5" />,
  Calendar: <Calendar className="h-3.5 w-3.5" />,
  Clock: <Clock className="h-3.5 w-3.5" />,
  Pause: <Pause className="h-3.5 w-3.5" />,
  Archive: <Archive className="h-3.5 w-3.5" />,
  Folder: <Folder className="h-3.5 w-3.5" />,
  Hash: <Hash className="h-3.5 w-3.5" />,
};

interface TaskSectionProps {
  section: TasksWidgetSection;
  config: SectionDisplayConfig;
  pending: Task[];
  completed: Task[];
  isExpanded: boolean;
  showCompleted: boolean;
  settings: TasksWidgetSettings;
  expandedTasks: Set<string>;
  sensors: SensorDescriptor<SensorOptions>[];
  onToggleSectionExpanded: (sectionId: SectionId) => void;
  onToggleCompletedInSection: (sectionId: SectionId, e: React.MouseEvent) => void;
  onQuickComplete: (task: Task, e: React.MouseEvent) => void;
  onToggleTaskExpanded: (taskId: string, e: React.MouseEvent) => void;
  onSubtaskToggle: (taskId: string, subtaskId: string, e: React.MouseEvent) => void;
  onTaskClick: (task: Task, e: React.MouseEvent) => void;
  onSetTaskOrder: (sectionId: SectionId, taskIds: string[]) => void;
}

const TaskSection = React.memo(function TaskSection({
  section,
  config,
  pending,
  completed,
  isExpanded,
  showCompleted,
  settings,
  expandedTasks,
  sensors,
  onToggleSectionExpanded,
  onToggleCompletedInSection,
  onQuickComplete,
  onToggleTaskExpanded,
  onSubtaskToggle,
  onTaskClick,
  onSetTaskOrder,
}: TaskSectionProps) {
  const isEmpty = pending.length === 0 && completed.length === 0;
  if (isEmpty && settings.hideEmptySections) return null;

  const variant: TaskVariant = section.id === 'overdue' ? 'overdue' : 'default';
  const showDueDate = section.id === 'overdue' || section.id === 'dueThisWeek' || section.type === 'topic';

  const icon = SECTION_ICONS[config.icon] || SECTION_ICONS.CheckSquare;

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = pending.findIndex((t) => t.id === active.id);
      const newIndex = pending.findIndex((t) => t.id === over.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        const newOrder = arrayMove(pending, oldIndex, newIndex).map((t) => t.id);
        onSetTaskOrder(section.id, newOrder);
      }
    }
  };

  return (
    <div>
      {/* Section Header */}
      <button
        onClick={() => onToggleSectionExpanded(section.id)}
        className="mt-3 flex w-full items-center gap-2 rounded-lg bg-muted/40 px-2 py-2 transition-colors first:mt-0 hover:bg-muted/60"
      >
        {isExpanded ? (
          <ChevronDown className={cn('h-3.5 w-3.5', config.iconColor)} />
        ) : (
          <ChevronRight className={cn('h-3.5 w-3.5', config.iconColor)} />
        )}
        <span className={config.iconColor}>{icon}</span>
        <span className={cn('text-xs font-semibold uppercase tracking-wider', config.labelColor)}>{section.label}</span>
        <span className={cn('text-xs', pending.length > 0 ? 'text-foreground' : 'text-muted-foreground')}>
          ({pending.length}
          {settings.showCompletedTasks && completed.length > 0 ? ` + ${completed.length} done` : ''})
        </span>
      </button>

      {/* Section Content */}
      {isExpanded && (
        <div className="mt-1">
          {isEmpty && (
            <p className="rounded-lg bg-muted/30 px-2 py-3 text-center text-sm text-muted-foreground">
              {config.emptyText}
            </p>
          )}

          {pending.length > 0 && (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={pending.map((t) => t.id)} strategy={verticalListSortingStrategy}>
                {pending.map((task) => (
                  <SortableTaskRow
                    key={task.id}
                    task={task}
                    variant={variant}
                    showDueDate={showDueDate}
                    isExpanded={expandedTasks.has(task.id)}
                    isDraggable
                    onQuickComplete={onQuickComplete}
                    onToggleExpanded={onToggleTaskExpanded}
                    onSubtaskToggle={onSubtaskToggle}
                    onTaskClick={onTaskClick}
                  />
                ))}
              </SortableContext>
            </DndContext>
          )}

          {settings.showCompletedTasks && completed.length > 0 && (
            <>
              <button
                onClick={(e) => onToggleCompletedInSection(section.id, e)}
                className="mt-1 flex items-center gap-1.5 py-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                {showCompleted ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                <CheckCircle2 className="h-3 w-3" />
                <span>{completed.length} completed</span>
              </button>
              {showCompleted &&
                completed.map((task) => (
                  <TaskRow
                    key={task.id}
                    task={task}
                    variant="completed"
                    showDueDate={showDueDate}
                    isExpanded={expandedTasks.has(task.id)}
                    onQuickComplete={onQuickComplete}
                    onToggleExpanded={onToggleTaskExpanded}
                    onSubtaskToggle={onSubtaskToggle}
                    onTaskClick={onTaskClick}
                  />
                ))}
            </>
          )}
        </div>
      )}
    </div>
  );
});

export default TaskSection;
