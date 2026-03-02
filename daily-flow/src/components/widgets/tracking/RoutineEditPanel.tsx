import { Plus, X, FolderPlus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RoutineGroup } from '@/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { iconMap, availableIcons } from './tracking-types';

interface RoutineEditPanelProps {
  routineGroups: RoutineGroup[];
  newRoutineName: string;
  setNewRoutineName: (name: string) => void;
  selectedIcon: string;
  setSelectedIcon: (icon: string) => void;
  selectedGroupId: string;
  setSelectedGroupId: (id: string) => void;
  onAddRoutine: () => void;
  newGroupName: string;
  setNewGroupName: (name: string) => void;
  showGroupForm: boolean;
  setShowGroupForm: (show: boolean) => void;
  onAddGroup: () => void;
}

const RoutineEditPanel = ({
  routineGroups,
  newRoutineName,
  setNewRoutineName,
  selectedIcon,
  setSelectedIcon,
  selectedGroupId,
  setSelectedGroupId,
  onAddRoutine,
  newGroupName,
  setNewGroupName,
  showGroupForm,
  setShowGroupForm,
  onAddGroup,
}: RoutineEditPanelProps) => {
  return (
    <div className="mb-4 space-y-3">
      {/* Add routine form */}
      <div className="space-y-3 rounded-lg bg-secondary/30 p-3">
        <div className="flex gap-2">
          <Input
            placeholder="New routine name..."
            value={newRoutineName}
            onChange={(e) => setNewRoutineName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onAddRoutine()}
            className="h-8 flex-1 text-sm"
          />
          <Select value={selectedGroupId} onValueChange={setSelectedGroupId}>
            <SelectTrigger className="h-8 w-[140px] text-sm">
              <SelectValue placeholder="Group" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__uncategorized__">Uncategorized</SelectItem>
              {routineGroups.map((g) => (
                <SelectItem key={g.id} value={g.id}>
                  {g.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button size="sm" onClick={onAddRoutine} className="h-8 px-3">
            <Plus className="mr-1 h-3 w-3" />
            Add
          </Button>
        </div>
        <div className="flex flex-wrap gap-1">
          {availableIcons.map((iconName) => {
            const Icon = iconMap[iconName];
            return (
              <button
                key={iconName}
                onClick={() => setSelectedIcon(iconName)}
                aria-label={`Select ${iconName} icon`}
                className={cn(
                  'flex h-7 w-7 items-center justify-center rounded-md transition-colors',
                  selectedIcon === iconName
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-muted-foreground hover:bg-secondary/80',
                )}
              >
                <Icon className="h-3.5 w-3.5" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Add group section */}
      {showGroupForm ? (
        <div className="flex gap-2 rounded-lg bg-secondary/30 p-3">
          <Input
            placeholder="New group name..."
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onAddGroup()}
            className="h-8 flex-1 text-sm"
            autoFocus
          />
          <Button size="sm" onClick={onAddGroup} className="h-8 px-3">
            <Plus className="mr-1 h-3 w-3" />
            Add
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setShowGroupForm(false)}
            className="h-8 px-2"
            aria-label="Cancel adding group"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      ) : (
        <Button variant="outline" size="sm" className="w-full gap-2" onClick={() => setShowGroupForm(true)}>
          <FolderPlus className="h-3 w-3" />
          New Group
        </Button>
      )}
    </div>
  );
};

export default RoutineEditPanel;
