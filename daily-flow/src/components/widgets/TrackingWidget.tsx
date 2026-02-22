import { useState, useMemo } from 'react';
import { 
  RotateCcw, Check, Droplets, Brain, Dumbbell, BookOpen, Coffee, 
  Pencil, Plus, X, Sun, Moon, Heart, Utensils, ChevronDown, ChevronRight,
  GripVertical, FolderPlus, Trash2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useKaivooStore } from '@/stores/useKaivooStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { useKaivooActions } from '@/hooks/useKaivooActions';
import { useDatabaseOperations } from '@/hooks/useDatabase';
import { useInvalidate } from '@/hooks/queries';
import { toast } from 'sonner';
import { RoutineGroup, RoutineItem } from '@/types';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  useDroppable,
} from '@dnd-kit/core';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Icon map for routine icons
const iconMap: Record<string, React.ElementType> = {
  droplets: Droplets,
  brain: Brain,
  dumbbell: Dumbbell,
  'book-open': BookOpen,
  coffee: Coffee,
  sun: Sun,
  moon: Moon,
  heart: Heart,
  utensils: Utensils,
};

const availableIcons = Object.keys(iconMap);

interface RoutineItemButtonProps {
  routine: RoutineItem;
  completed: boolean;
  isEditing: boolean;
  onToggle: () => void;
  onDelete: () => void;
  isDragging?: boolean;
}

const RoutineItemButtonContent = ({ routine, completed, isEditing, onToggle, onDelete, isDragging }: RoutineItemButtonProps) => {
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

const DraggableRoutine = ({ routine, completed, isEditing, onToggle, onDelete }: DraggableRoutineProps) => {
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

const GroupSection = ({ 
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
              <Button variant="ghost" size="icon" aria-label="Delete group" className="h-6 w-6 text-destructive hover:text-destructive">
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

const TrackingWidget = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [newRoutineName, setNewRoutineName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('sun');
  const [selectedGroupId, setSelectedGroupId] = useState<string>('__uncategorized__');
  const [newGroupName, setNewGroupName] = useState('');
  const [showGroupForm, setShowGroupForm] = useState(false);
  const [activeRoutine, setActiveRoutine] = useState<RoutineItem | null>(null);
  
  const { user } = useAuth();
  const { 
    routines,
    routineGroups,
    isRoutineCompleted,
  } = useKaivooStore();
  const { toggleRoutineCompletion } = useKaivooActions();
  const db = useDatabaseOperations();
  const { invalidate } = useInvalidate();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );
  
  // Group routines by groupId
  const groupedRoutines = useMemo(() => {
    const grouped: Record<string, RoutineItem[]> = { uncategorized: [] };
    
    routineGroups.forEach(g => {
      grouped[g.id] = [];
    });
    
    routines.forEach(r => {
      if (r.groupId && grouped[r.groupId]) {
        grouped[r.groupId].push(r);
      } else {
        grouped.uncategorized.push(r);
      }
    });
    
    // Sort routines by order within each group
    Object.keys(grouped).forEach(key => {
      grouped[key].sort((a, b) => a.order - b.order);
    });
    
    return grouped;
  }, [routines, routineGroups]);

  const totalCount = routines.length;
  const completedCount = routines.filter(r => isRoutineCompleted(r.id)).length;
  const overallProgress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const handleAddRoutine = async () => {
    if (!newRoutineName.trim()) return;

    if (!user) {
      toast.error('Please sign in to add routines');
      return;
    }

    try {
      const groupId = selectedGroupId === '__uncategorized__' ? undefined : selectedGroupId;
      const groupRoutines = routines.filter(r => r.groupId === groupId);
      await db.createRoutine(newRoutineName.trim(), selectedIcon, groupRoutines.length, groupId);
      invalidate('routines');
      setNewRoutineName('');
      setSelectedIcon('sun');
    } catch (e: any) {
      toast.error(e?.message ?? 'Failed to add routine');
    }
  };

  const handleAddGroup = async () => {
    if (!newGroupName.trim()) return;

    if (!user) {
      toast.error('Please sign in to add groups');
      return;
    }

    try {
      await db.createRoutineGroup(newGroupName.trim(), 'sun', undefined, routineGroups.length);
      invalidate('routines', 'routineGroups');
      setNewGroupName('');
      setShowGroupForm(false);
      toast.success(`Created "${newGroupName.trim()}" group`);
    } catch (e: any) {
      toast.error(e?.message ?? 'Failed to add group');
    }
  };

  const handleRemoveRoutine = async (id: string) => {
    if (!user) return;
    try {
      await db.deleteRoutine(id);
      invalidate('routines');
    } catch (e: any) {
      toast.error(e?.message ?? 'Failed to delete routine');
    }
  };

  const handleDeleteGroup = async (groupId: string) => {
    if (!user) return;
    try {
      await db.deleteRoutineGroup(groupId);
      invalidate('routines', 'routineGroups');
      toast.success('Group deleted, routines moved to Uncategorized');
    } catch (e: any) {
      toast.error(e?.message ?? 'Failed to delete group');
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    const routine = routines.find(r => r.id === event.active.id);
    if (routine) {
      setActiveRoutine(routine);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveRoutine(null);

    if (!over || !user) return;

    const routineId = active.id as string;
    const routine = routines.find(r => r.id === routineId);
    if (!routine) return;

    // Determine the target group from the droppable ID
    const targetGroupId = over.id as string;
    const newGroupId = targetGroupId === 'uncategorized' ? undefined : targetGroupId;
    
    // Check if this is actually a group drop zone (not another routine)
    const isGroupDropZone = targetGroupId === 'uncategorized' || routineGroups.some(g => g.id === targetGroupId);
    if (!isGroupDropZone) return;

    // Skip if dropping on the same group
    const currentGroupId = routine.groupId || undefined;
    if (currentGroupId === newGroupId) return;

    try {
      await db.updateRoutine(routineId, { groupId: newGroupId ?? null });
      invalidate('routines');
      const targetGroupName = newGroupId 
        ? routineGroups.find(g => g.id === newGroupId)?.name 
        : 'Uncategorized';
      toast.success(`Moved "${routine.name}" to ${targetGroupName}`);
    } catch (e: any) {
      toast.error(e?.message ?? 'Failed to move routine');
    }
  };

  return (
    <div className="widget-card animate-fade-in" style={{ animationDelay: '0.15s' }}>
      <div className="widget-header">
        <div className="flex items-center gap-2">
          <RotateCcw className="w-4 h-4 text-primary" />
          <span className="widget-title">Tracking</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">
            {completedCount}/{totalCount}
          </span>
          <Button
            variant="ghost"
            size="icon"
            aria-label={isEditing ? "Done editing" : "Edit routines"}
            className="h-6 w-6"
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? (
              <Check className="w-3 h-3" />
            ) : (
              <Pencil className="w-3 h-3" />
            )}
          </Button>
        </div>
      </div>

      {/* Overall progress bar */}
      <div className="h-1.5 bg-secondary rounded-full overflow-hidden mb-4">
        <div 
          className="h-full bg-primary rounded-full transition-all duration-300 ease-out"
          style={{ width: `${overallProgress}%` }}
        />
      </div>

      {/* Edit mode hint */}
      {isEditing && (
        <p className="text-xs text-muted-foreground mb-3">
          Drag routines between groups to reorganize
        </p>
      )}

      {/* Edit mode: Add new routine / group */}
      {isEditing && (
        <div className="mb-4 space-y-3">
          {/* Add routine form */}
          <div className="p-3 bg-secondary/30 rounded-lg space-y-3">
            <div className="flex gap-2">
              <Input
                placeholder="New routine name..."
                value={newRoutineName}
                onChange={(e) => setNewRoutineName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddRoutine()}
                className="flex-1 h-8 text-sm"
              />
              <Select value={selectedGroupId} onValueChange={setSelectedGroupId}>
                <SelectTrigger className="w-[140px] h-8 text-sm">
                  <SelectValue placeholder="Group" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__uncategorized__">Uncategorized</SelectItem>
                  {routineGroups.map(g => (
                    <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button size="sm" onClick={handleAddRoutine} className="h-8 px-3">
                <Plus className="w-3 h-3 mr-1" />
                Add
              </Button>
            </div>
            <div className="flex gap-1 flex-wrap">
              {availableIcons.map((iconName) => {
                const Icon = iconMap[iconName];
                return (
                  <button
                    key={iconName}
                    onClick={() => setSelectedIcon(iconName)}
                    className={cn(
                      "w-7 h-7 rounded-md flex items-center justify-center transition-colors",
                      selectedIcon === iconName 
                        ? "bg-primary text-primary-foreground" 
                        : "bg-secondary hover:bg-secondary/80 text-muted-foreground"
                    )}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </button>
                );
              })}
            </div>
          </div>
          
          {/* Add group section */}
          {showGroupForm ? (
            <div className="p-3 bg-secondary/30 rounded-lg flex gap-2">
              <Input
                placeholder="New group name..."
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddGroup()}
                className="flex-1 h-8 text-sm"
                autoFocus
              />
              <Button size="sm" onClick={handleAddGroup} className="h-8 px-3">
                <Plus className="w-3 h-3 mr-1" />
                Add
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setShowGroupForm(false)} className="h-8 px-2">
                <X className="w-3 h-3" />
              </Button>
            </div>
          ) : (
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full gap-2"
              onClick={() => setShowGroupForm(true)}
            >
              <FolderPlus className="w-3 h-3" />
              New Group
            </Button>
          )}
        </div>
      )}

      {/* Routine groups with drag-and-drop */}
      <DndContext 
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="space-y-4">
          {/* Render actual groups first */}
          {routineGroups.map(group => (
            <GroupSection
              key={group.id}
              group={group}
              routines={groupedRoutines[group.id] || []}
              isEditing={isEditing}
              onToggleRoutine={toggleRoutineCompletion}
              onDeleteRoutine={handleRemoveRoutine}
              onDeleteGroup={() => handleDeleteGroup(group.id)}
              isRoutineCompleted={isRoutineCompleted}
              droppableId={group.id}
            />
          ))}
          
          {/* Uncategorized section last */}
          <GroupSection
            group={null}
            routines={groupedRoutines.uncategorized || []}
            isEditing={isEditing}
            onToggleRoutine={toggleRoutineCompletion}
            onDeleteRoutine={handleRemoveRoutine}
            isRoutineCompleted={isRoutineCompleted}
            droppableId="uncategorized"
          />
        </div>

        {/* Drag overlay */}
        <DragOverlay>
          {activeRoutine ? (
            <div className="opacity-90">
              <RoutineItemButtonContent
                routine={activeRoutine}
                completed={isRoutineCompleted(activeRoutine.id)}
                isEditing={false}
                onToggle={() => {}}
                onDelete={() => {}}
              />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {totalCount === 0 && (
        <div className="py-6 text-center">
          <p className="text-sm text-muted-foreground">No routines yet. Click the pencil to add some!</p>
        </div>
      )}
    </div>
  );
};

export default TrackingWidget;