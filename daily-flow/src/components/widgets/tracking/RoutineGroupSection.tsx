import { useState } from 'react';
import { RotateCcw, ChevronDown, ChevronRight, Trash2, Sun } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { RoutineGroup, RoutineItem } from '@/types';
import { useDroppable } from '@dnd-kit/core';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { DraggableRoutine } from './RoutineButton';
import { iconMap } from './tracking-types';

interface GroupSectionProps {
  group: RoutineGroup | null;
  routines: RoutineItem[];
  isEditing: boolean;
  onToggleRoutine: (id: string) => void;
  onDeleteRoutine: (id: string) => void;
  onDeleteGroup?: () => void;
  isRoutineCompleted: (id: string) => boolean;
  droppableId: string;
}

const RoutineGroupSection = ({
  group,
  routines,
  isEditing,
  onToggleRoutine,
  onDeleteRoutine,
  onDeleteGroup,
  isRoutineCompleted,
  droppableId,
}: GroupSectionProps) => {
  const [isOpen, setIsOpen] = useState(true);
  const completedCount = routines.filter(r => isRoutineCompleted(r.id)).length;
  const progress = routines.length > 0 ? (completedCount / routines.length) * 100 : 0;

  const groupName = group?.name || 'Uncategorized';
  const GroupIcon = group?.icon ? (iconMap[group.icon] || Sun) : RotateCcw;

  const { setNodeRef, isOver } = useDroppable({
    id: droppableId,
  });

  // Always show during editing for drop targets
  if (routines.length === 0 && !isEditing) return null;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="space-y-2">
      <div className="flex items-center gap-2">
        <CollapsibleTrigger asChild>
          <button className="flex items-center gap-2 flex-1 hover:bg-secondary/50 rounded-lg p-1.5 -ml-1.5 transition-colors">
            {isOpen ? (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            )}
            <GroupIcon className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">{groupName}</span>
            <span className="text-xs text-muted-foreground">
              {completedCount}/{routines.length}
            </span>
          </button>
        </CollapsibleTrigger>

        {isEditing && group && onDeleteGroup && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon" aria-label={`Delete ${group.name} group`} className="h-6 w-6 text-destructive hover:text-destructive">
                <Trash2 className="w-3 h-3" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete "{group.name}"?</AlertDialogTitle>
                <AlertDialogDescription>
                  The group will be deleted, but all routines will be moved to "Uncategorized". Your tracking history will be preserved.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={onDeleteGroup} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Delete Group
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-secondary rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <CollapsibleContent>
        <div
          ref={setNodeRef}
          className={cn(
            "grid grid-cols-5 gap-2 pt-2 min-h-[60px] rounded-lg transition-colors",
            isOver && isEditing && "bg-primary/10 ring-2 ring-primary/30"
          )}
        >
          {routines.map((routine) => (
            <DraggableRoutine
              key={routine.id}
              routine={routine}
              completed={isRoutineCompleted(routine.id)}
              isEditing={isEditing}
              onToggle={() => onToggleRoutine(routine.id)}
              onDelete={() => onDeleteRoutine(routine.id)}
            />
          ))}
        </div>

        {routines.length === 0 && isEditing && (
          <p className="text-xs text-muted-foreground text-center py-3">
            Drop routines here
          </p>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
};

export default RoutineGroupSection;
