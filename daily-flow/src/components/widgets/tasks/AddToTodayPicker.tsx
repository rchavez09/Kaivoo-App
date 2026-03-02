import React, { useState } from 'react';
import { CalendarPlus, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
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
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-2 text-muted-foreground hover:text-foreground"
          title="Add existing tasks to today"
          aria-label="Add existing tasks to today"
        >
          <CalendarPlus className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="border-b border-border p-3">
          <h4 className="text-sm font-medium">Add tasks to Today</h4>
          <p className="mt-0.5 text-xs text-muted-foreground">Select tasks to add to your today view</p>
        </div>
        <ScrollArea className="max-h-64">
          <div className="space-y-1 p-2">
            {pinnedTasks.length > 0 && (
              <div className="mb-2">
                <p className="px-2 py-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                  In Today View
                </p>
                {pinnedTasks.map((task) => (
                  <button
                    key={task.id}
                    onClick={() => onRemoveFromToday(task.id)}
                    className="group flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors hover:bg-secondary/50"
                  >
                    <div className="flex h-4 w-4 flex-shrink-0 items-center justify-center rounded border-2 border-primary bg-primary">
                      <Check className="h-3 w-3 text-primary-foreground" />
                    </div>
                    <span className="flex-1 truncate">{task.title}</span>
                  </button>
                ))}
              </div>
            )}
            {otherTasks.length > 0 && (
              <div>
                <p className="px-2 py-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                  Other Tasks
                </p>
                {otherTasks.map((task) => (
                  <button
                    key={task.id}
                    onClick={() => onAddToToday(task.id)}
                    className="group flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors hover:bg-secondary/50"
                  >
                    <div className="h-4 w-4 flex-shrink-0 rounded border-2 border-muted-foreground/30 group-hover:border-primary/50" />
                    <span className="flex-1 truncate">{task.title}</span>
                    {task.dueDate && (
                      <Badge variant="outline" className="h-4 px-1 text-[10px] font-normal">
                        {task.dueDate}
                      </Badge>
                    )}
                  </button>
                ))}
              </div>
            )}
            {otherTasks.length === 0 && pinnedTasks.length === 0 && (
              <p className="py-4 text-center text-sm text-muted-foreground">No tasks available</p>
            )}
            {otherTasks.length === 0 && pinnedTasks.length > 0 && (
              <p className="py-2 text-center text-xs text-muted-foreground">All tasks are already in your Today view</p>
            )}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
});

export default AddToTodayPicker;
