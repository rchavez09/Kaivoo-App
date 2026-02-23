import { useState, useMemo, useCallback } from 'react';
import { RotateCcw, Check, Pencil } from 'lucide-react';
import { format } from 'date-fns';
import { useKaivooStore } from '@/stores/useKaivooStore';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useKaivooActions } from '@/hooks/useKaivooActions';
import { useDatabaseOperations } from '@/hooks/useDatabase';
import { useInvalidate } from '@/hooks/queries';
import { toast } from 'sonner';
import { RoutineItem } from '@/types';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core';
import RoutineGroupSection from './tracking/RoutineGroupSection';
import RoutineEditPanel from './tracking/RoutineEditPanel';
import { RoutineItemButtonContent } from './tracking/RoutineButton';

interface TrackingWidgetProps {
  date?: Date;
}

const TrackingWidget = ({ date }: TrackingWidgetProps = {}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newRoutineName, setNewRoutineName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('sun');
  const [selectedGroupId, setSelectedGroupId] = useState<string>('__uncategorized__');
  const [newGroupName, setNewGroupName] = useState('');
  const [showGroupForm, setShowGroupForm] = useState(false);
  const [activeRoutine, setActiveRoutine] = useState<RoutineItem | null>(null);

  const { user } = useAuth();
  const routines = useKaivooStore(s => s.routines);
  const routineGroups = useKaivooStore(s => s.routineGroups);
  const storeIsCompleted = useKaivooStore(s => s.isRoutineCompleted);
  const { toggleRoutineCompletion: storeToggle } = useKaivooActions();

  const dateStr = useMemo(() => date ? format(date, 'yyyy-MM-dd') : undefined, [date]);

  const isRoutineCompleted = useCallback(
    (routineId: string) => storeIsCompleted(routineId, dateStr),
    [storeIsCompleted, dateStr]
  );

  const toggleRoutineCompletion = useCallback(
    (routineId: string) => storeToggle(routineId, dateStr),
    [storeToggle, dateStr]
  );
  const db = useDatabaseOperations();
  const { invalidate } = useInvalidate();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  // Group routines by groupId
  const groupedRoutines = useMemo(() => {
    const grouped: Record<string, RoutineItem[]> = { uncategorized: [] };
    routineGroups.forEach(g => { grouped[g.id] = []; });
    routines.forEach(r => {
      if (r.groupId && grouped[r.groupId]) {
        grouped[r.groupId].push(r);
      } else {
        grouped.uncategorized.push(r);
      }
    });
    Object.keys(grouped).forEach(key => {
      grouped[key].sort((a, b) => a.order - b.order);
    });
    return grouped;
  }, [routines, routineGroups]);

  const totalCount = routines.length;
  const completedCount = routines.filter(r => isRoutineCompleted(r.id)).length;
  const overallProgress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const handleAddRoutine = async () => {
    if (!newRoutineName.trim() || !user) {
      if (!user) toast.error('Please sign in to add routines');
      return;
    }
    try {
      const groupId = selectedGroupId === '__uncategorized__' ? undefined : selectedGroupId;
      const groupRoutines = routines.filter(r => r.groupId === groupId);
      await db.createRoutine(newRoutineName.trim(), selectedIcon, groupRoutines.length, groupId);
      invalidate('routines');
      setNewRoutineName('');
      setSelectedIcon('sun');
    } catch (e: unknown) {
      console.error('[TrackingWidget:addRoutine]', e);
      toast.error('Failed to add routine. Please try again.');
    }
  };

  const handleAddGroup = async () => {
    if (!newGroupName.trim() || !user) {
      if (!user) toast.error('Please sign in to add groups');
      return;
    }
    try {
      await db.createRoutineGroup(newGroupName.trim(), 'sun', undefined, routineGroups.length);
      invalidate('routines', 'routineGroups');
      setNewGroupName('');
      setShowGroupForm(false);
      toast.success(`Created "${newGroupName.trim()}" group`);
    } catch (e: unknown) {
      console.error('[TrackingWidget:addGroup]', e);
      toast.error('Failed to add group. Please try again.');
    }
  };

  const handleRemoveRoutine = async (id: string) => {
    if (!user) return;
    try {
      await db.deleteRoutine(id);
      invalidate('routines');
    } catch (e: unknown) {
      console.error('[TrackingWidget:removeRoutine]', e);
      toast.error('Failed to delete routine. Please try again.');
    }
  };

  const handleDeleteGroup = async (groupId: string) => {
    if (!user) return;
    try {
      await db.deleteRoutineGroup(groupId);
      invalidate('routines', 'routineGroups');
      toast.success('Group deleted, routines moved to Uncategorized');
    } catch (e: unknown) {
      console.error('[TrackingWidget:deleteGroup]', e);
      toast.error('Failed to delete group. Please try again.');
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    const routine = routines.find(r => r.id === event.active.id);
    if (routine) setActiveRoutine(routine);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveRoutine(null);
    if (!over || !user) return;

    const routineId = active.id as string;
    const routine = routines.find(r => r.id === routineId);
    if (!routine) return;

    const targetGroupId = over.id as string;
    const newGroupId = targetGroupId === 'uncategorized' ? undefined : targetGroupId;
    const isGroupDropZone = targetGroupId === 'uncategorized' || routineGroups.some(g => g.id === targetGroupId);
    if (!isGroupDropZone) return;

    const currentGroupId = routine.groupId || undefined;
    if (currentGroupId === newGroupId) return;

    try {
      await db.updateRoutine(routineId, { groupId: newGroupId ?? null });
      invalidate('routines');
      const targetGroupName = newGroupId
        ? routineGroups.find(g => g.id === newGroupId)?.name
        : 'Uncategorized';
      toast.success(`Moved "${routine.name}" to ${targetGroupName}`);
    } catch (e: unknown) {
      console.error('[TrackingWidget:dragEnd]', e);
      toast.error('Failed to move routine. Please try again.');
    }
  };

  return (
    <div className="widget-card animate-fade-in" style={{ animationDelay: '0.15s' }} id="day-section-routines">
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
            {isEditing ? <Check className="w-3 h-3" /> : <Pencil className="w-3 h-3" />}
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

      {isEditing && (
        <p className="text-xs text-muted-foreground mb-3">
          Drag routines between groups to reorganize
        </p>
      )}

      {isEditing && (
        <RoutineEditPanel
          routineGroups={routineGroups}
          newRoutineName={newRoutineName}
          setNewRoutineName={setNewRoutineName}
          selectedIcon={selectedIcon}
          setSelectedIcon={setSelectedIcon}
          selectedGroupId={selectedGroupId}
          setSelectedGroupId={setSelectedGroupId}
          onAddRoutine={handleAddRoutine}
          newGroupName={newGroupName}
          setNewGroupName={setNewGroupName}
          showGroupForm={showGroupForm}
          setShowGroupForm={setShowGroupForm}
          onAddGroup={handleAddGroup}
        />
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="space-y-4">
          {routineGroups.map(group => (
            <RoutineGroupSection
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
          <RoutineGroupSection
            group={null}
            routines={groupedRoutines.uncategorized || []}
            isEditing={isEditing}
            onToggleRoutine={toggleRoutineCompletion}
            onDeleteRoutine={handleRemoveRoutine}
            isRoutineCompleted={isRoutineCompleted}
            droppableId="uncategorized"
          />
        </div>

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
