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

export const RoutineItemButtonContent = ({
  routine,
  completed,
  isEditing,
  onToggle,
  onDelete,
  isDragging,
}: RoutineItemButtonProps) => {
  const Icon = iconMap[routine.icon || 'sun'] || Sun;

  return (
    <div className={cn('relative', isDragging && 'opacity-50')}>
      <button
        onClick={() => !isEditing && onToggle()}
        disabled={isEditing}
        aria-label={`${completed ? 'Unmark' : 'Mark'} ${routine.name} as ${completed ? 'incomplete' : 'complete'}`}
        className={cn(
          'flex w-full flex-col items-center gap-1.5 rounded-xl p-3 transition-all duration-200',
          completed
            ? 'bg-primary/10 text-primary'
            : 'bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground',
          isEditing && 'cursor-grab opacity-75',
        )}
      >
        <div
          className={cn(
            'flex h-8 w-8 items-center justify-center rounded-full transition-all duration-200',
            completed ? 'bg-primary text-primary-foreground' : 'bg-background',
          )}
        >
          {completed ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
        </div>
        <span className="line-clamp-2 text-center text-[10px] font-medium leading-tight">{routine.name}</span>
      </button>

      {isEditing && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="absolute -right-1 -top-1 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-destructive-foreground shadow-sm transition-colors hover:bg-destructive/90"
          aria-label={`Delete ${routine.name}`}
        >
          <X className="h-3 w-3" />
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
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
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
