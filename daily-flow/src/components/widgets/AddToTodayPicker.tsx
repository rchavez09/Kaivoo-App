import React, { useState } from 'react';
import { CalendarPlus, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Task } from '@/types';

interface AddToTodayPickerProps {
  pinnedTasks: Task[];
  otherTasks: Task[];
  onAddToToday: (taskId: string) => void;
  onRemoveFromToday: (taskId: string) => void;
}

const AddToTodayPicker = React.memo(function AddToTodayPicker({
  pinnedTasks,
  otherTasks,
  onAddToToday,
  onRemoveFromToday,
}: AddToTodayPickerProps) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground h-8 px-2" title="Add existing tasks to today" aria-label="Add existing tasks to today">
          <CalendarPlus className="w-4 h-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-3 border-b border-border">
          <h4 className="font-medium text-sm">Add tasks to Today</h4>
          <p className="text-xs text-muted-foreground mt-0.5">Select tasks to add to your today view</p>
        </div>
        <ScrollArea className="max-h-64">
          <div className="p-2 space-y-1">
            {pinnedTasks.length > 0 && (
              <div className="mb-2">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground px-2 py-1 font-medium">In Today View</p>
                {pinnedTasks.map(task => (
                  <button key={task.id} onClick={() => onRemoveFromToday(task.id)} className="w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded-md hover:bg-secondary/50 transition-colors text-left group">
                    <div className="w-4 h-4 rounded border-2 border-primary bg-primary flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-primary-foreground" />
                    </div>
                    <span className="truncate flex-1">{task.title}</span>
                  </button>
                ))}
              </div>
            )}
            {otherTasks.length > 0 && (
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground px-2 py-1 font-medium">Other Tasks</p>
                {otherTasks.map(task => (
                  <button key={task.id} onClick={() => onAddToToday(task.id)} className="w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded-md hover:bg-secondary/50 transition-colors text-left group">
                    <div className="w-4 h-4 rounded border-2 border-muted-foreground/30 flex-shrink-0 group-hover:border-primary/50" />
                    <span className="truncate flex-1">{task.title}</span>
                    {task.dueDate && <Badge variant="outline" className="text-[10px] h-4 px-1 font-normal">{task.dueDate}</Badge>}
                  </button>
                ))}
              </div>
            )}
            {otherTasks.length === 0 && pinnedTasks.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">No tasks available</p>
            )}
            {otherTasks.length === 0 && pinnedTasks.length > 0 && (
              <p className="text-xs text-muted-foreground text-center py-2">All tasks are already in your Today view</p>
            )}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
});

export default AddToTodayPicker;
