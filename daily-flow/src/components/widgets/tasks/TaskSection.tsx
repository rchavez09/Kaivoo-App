import React from 'react';
import {
  CheckSquare, AlertTriangle, Flag, Calendar, Clock, Pause, Archive, Folder, Hash,
  ChevronRight, ChevronDown, CheckCircle2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Task } from '@/types';
import { SortableTaskRow, TaskRow } from './SortableTaskRow';
import type { TasksWidgetSection, TasksWidgetSettings, SectionId } from './TasksWidgetConfig';
import type { TaskVariant, SectionDisplayConfig } from './task-section-utils';
import {
  DndContext,
  closestCenter,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import type { SensorDescriptor, SensorOptions } from '@dnd-kit/core';

/** Icon lookup from string name to JSX element. */
const SECTION_ICONS: Record<string, React.ReactNode> = {
  CheckSquare: <CheckSquare className="w-3.5 h-3.5" />,
  AlertTriangle: <AlertTriangle className="w-3.5 h-3.5" />,
  Flag: <Flag className="w-3.5 h-3.5" />,
  Calendar: <Calendar className="w-3.5 h-3.5" />,
  Clock: <Clock className="w-3.5 h-3.5" />,
  Pause: <Pause className="w-3.5 h-3.5" />,
  Archive: <Archive className="w-3.5 h-3.5" />,
  Folder: <Folder className="w-3.5 h-3.5" />,
  Hash: <Hash className="w-3.5 h-3.5" />,
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
      const oldIndex = pending.findIndex(t => t.id === active.id);
      const newIndex = pending.findIndex(t => t.id === over.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        const newOrder = arrayMove(pending, oldIndex, newIndex).map(t => t.id);
        onSetTaskOrder(section.id, newOrder);
      }
    }
  };

  return (
    <div>
      {/* Section Header */}
      <button
        onClick={() => onToggleSectionExpanded(section.id)}
        className="flex items-center gap-2 py-2 px-2 w-full bg-muted/40 hover:bg-muted/60 rounded-lg transition-colors mt-3 first:mt-0"
      >
        {isExpanded
          ? <ChevronDown className={cn("w-3.5 h-3.5", config.iconColor)} />
          : <ChevronRight className={cn("w-3.5 h-3.5", config.iconColor)} />}
        <span className={config.iconColor}>{icon}</span>
        <span className={cn("text-xs uppercase tracking-wider font-semibold", config.labelColor)}>
          {section.label}
        </span>
        <span className={cn("text-xs", pending.length > 0 ? "text-foreground" : "text-muted-foreground")}>
          ({pending.length}{settings.showCompletedTasks && completed.length > 0 ? ` + ${completed.length} done` : ''})
        </span>
      </button>

      {/* Section Content */}
      {isExpanded && (
        <div className="mt-1">
          {isEmpty && (
            <p className="text-sm text-muted-foreground py-3 px-2 text-center bg-muted/30 rounded-lg">
              {config.emptyText}
            </p>
          )}

          {pending.length > 0 && (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={pending.map(t => t.id)} strategy={verticalListSortingStrategy}>
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
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground py-1.5 mt-1 transition-colors"
              >
                {showCompleted ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                <CheckCircle2 className="w-3 h-3" />
                <span>{completed.length} completed</span>
              </button>
              {showCompleted && completed.map((task) => (
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
