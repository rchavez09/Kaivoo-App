import { Plus, X, FolderPlus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RoutineGroup } from '@/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
      <div className="p-3 bg-secondary/30 rounded-lg space-y-3">
        <div className="flex gap-2">
          <Input
            placeholder="New routine name..."
            value={newRoutineName}
            onChange={(e) => setNewRoutineName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onAddRoutine()}
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
          <Button size="sm" onClick={onAddRoutine} className="h-8 px-3">
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
                aria-label={`Select ${iconName} icon`}
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
            onKeyDown={(e) => e.key === 'Enter' && onAddGroup()}
            className="flex-1 h-8 text-sm"
            autoFocus
          />
          <Button size="sm" onClick={onAddGroup} className="h-8 px-3">
            <Plus className="w-3 h-3 mr-1" />
            Add
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setShowGroupForm(false)} className="h-8 px-2" aria-label="Cancel adding group">
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
  );
};

export default RoutineEditPanel;
