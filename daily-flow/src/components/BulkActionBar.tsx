import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Trash2, Flag, Circle, Calendar } from 'lucide-react';
import { TaskStatus, TaskPriority } from '@/types';
import { statusConfig, priorityConfig } from '@/lib/task-config';
import { cn } from '@/lib/utils';
import { addDays, nextMonday, format } from 'date-fns';

interface BulkActionBarProps {
  selectedCount: number;
  onBulkStatusChange: (status: TaskStatus) => void;
  onBulkPriorityChange: (priority: TaskPriority) => void;
  onBulkDueDateChange: (date: string | null) => void;
  onBulkDelete: () => void;
}

const BulkActionBar = ({
  selectedCount,
  onBulkStatusChange,
  onBulkPriorityChange,
  onBulkDueDateChange,
  onBulkDelete,
}: BulkActionBarProps) => {
  const [dueDateOpen, setDueDateOpen] = useState(false);

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 bg-background border border-border rounded-xl shadow-lg">
      <span className="text-sm font-medium text-foreground whitespace-nowrap">
        {selectedCount} selected
      </span>

      <div className="w-px h-6 bg-border" />

      {/* Status */}
      <Select onValueChange={(v) => onBulkStatusChange(v as TaskStatus)}>
        <SelectTrigger className="w-[130px] h-8 text-xs">
          <div className="flex items-center gap-1.5">
            <Circle className="w-3 h-3" />
            <SelectValue placeholder="Set Status" />
          </div>
        </SelectTrigger>
        <SelectContent>
          {Object.entries(statusConfig).map(([key, config]) => (
            <SelectItem key={key} value={key}>
              <span className={cn("flex items-center gap-2", config.color)}>
                {config.icon}
                {config.label}
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Priority */}
      <Select onValueChange={(v) => onBulkPriorityChange(v as TaskPriority)}>
        <SelectTrigger className="w-[130px] h-8 text-xs">
          <div className="flex items-center gap-1.5">
            <Flag className="w-3 h-3" />
            <SelectValue placeholder="Set Priority" />
          </div>
        </SelectTrigger>
        <SelectContent>
          {Object.entries(priorityConfig).map(([key, config]) => (
            <SelectItem key={key} value={key}>
              <span className={cn("flex items-center gap-2", config.color)}>
                <Flag className="w-3 h-3" />
                {config.label}
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Due Date */}
      <Popover open={dueDateOpen} onOpenChange={setDueDateOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5">
            <Calendar className="w-3 h-3" />
            Set Due Date
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="center">
          <div className="flex flex-col">
            <div className="flex flex-col gap-1 p-2 border-b border-border">
              <Button
                variant="ghost"
                size="sm"
                className="justify-start text-xs h-7"
                onClick={() => {
                  onBulkDueDateChange(format(addDays(new Date(), 1), 'yyyy-MM-dd'));
                  setDueDateOpen(false);
                }}
              >
                Tomorrow
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="justify-start text-xs h-7"
                onClick={() => {
                  onBulkDueDateChange(format(nextMonday(new Date()), 'yyyy-MM-dd'));
                  setDueDateOpen(false);
                }}
              >
                Next Week
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="justify-start text-xs h-7 text-destructive"
                onClick={() => {
                  onBulkDueDateChange(null);
                  setDueDateOpen(false);
                }}
              >
                Clear Due Date
              </Button>
            </div>
            <CalendarComponent
              mode="single"
              onSelect={(date) => {
                if (date) {
                  onBulkDueDateChange(format(date, 'yyyy-MM-dd'));
                  setDueDateOpen(false);
                }
              }}
            />
          </div>
        </PopoverContent>
      </Popover>

      <div className="w-px h-6 bg-border" />

      {/* Delete */}
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="destructive" size="sm" className="h-8 text-xs gap-1.5">
            <Trash2 className="w-3 h-3" />
            Delete
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {selectedCount} task{selectedCount !== 1 ? 's' : ''}?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the selected task{selectedCount !== 1 ? 's' : ''} and all their subtasks.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={onBulkDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default BulkActionBar;
