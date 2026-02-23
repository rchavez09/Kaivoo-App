import { Check, X, Sun } from 'lucide-react';
import { cn } from '@/lib/utils';
import { RoutineItem } from '@/types';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { iconMap } from './tracking-types';

interface RoutineItemButtonProps {
  routine: RoutineItem;
  completed: boolean;
  isEditing: boolean;
  onToggle: () => void;
  onDelete: () => void;
  isDragging?: boolean;
}

export const RoutineItemButtonContent = ({ routine, completed, isEditing, onToggle, onDelete, isDragging }: RoutineItemButtonProps) => {
  const Icon = iconMap[routine.icon || 'sun'] || Sun;

  return (
    <div className={cn("relative", isDragging && "opacity-50")}>
      <button
        onClick={() => !isEditing && onToggle()}
        disabled={isEditing}
        className={cn(
          'w-full flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all duration-200',
          completed
            ? 'bg-primary/10 text-primary'
            : 'bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground',
          isEditing && 'opacity-75 cursor-grab'
        )}
      >
        <div className={cn(
          'w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200',
          completed
            ? 'bg-primary text-primary-foreground'
            : 'bg-background'
        )}>
          {completed ? (
            <Check className="w-4 h-4" />
          ) : (
            <Icon className="w-4 h-4" />
          )}
        </div>
        <span className="text-[10px] font-medium text-center leading-tight line-clamp-2">
          {routine.name}
        </span>
      </button>

      {isEditing && (
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center shadow-sm hover:bg-destructive/90 transition-colors z-10"
          aria-label={`Delete ${routine.name}`}
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </div>
  );
};

interface DraggableRoutineProps {
  routine: RoutineItem;
  completed: boolean;
  isEditing: boolean;
  onToggle: () => void;
  onDelete: () => void;
}

export const DraggableRoutine = ({ routine, completed, isEditing, onToggle, onDelete }: DraggableRoutineProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: routine.id,
    disabled: !isEditing,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...(isEditing ? listeners : {})}>
      <RoutineItemButtonContent
        routine={routine}
        completed={completed}
        isEditing={isEditing}
        onToggle={onToggle}
        onDelete={onDelete}
        isDragging={isDragging}
      />
    </div>
  );
};
