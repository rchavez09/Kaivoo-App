import React from 'react';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TopicTagEditor } from './TopicTagEditor';
import { cn } from '@/lib/utils';
import type { Suggestion } from './ai-inbox-types';

interface ThoughtSuggestionCardProps {
  suggestion: Suggestion;
  index: number;
  onToggle: (index: number) => void;
  onUpdate: (index: number, updates: Record<string, unknown>) => void;
}

const ThoughtSuggestionCard = React.memo(function ThoughtSuggestionCard({
  suggestion,
  index,
  onToggle,
  onUpdate,
}: ThoughtSuggestionCardProps) {
  return (
    <div
      className={`rounded-xl border p-3 transition-colors ${
        suggestion.selected ? 'border-primary/30 bg-primary/5' : 'border-border bg-muted/30 opacity-60'
      }`}
    >
      <div className="flex items-start gap-3">
        <Checkbox checked={suggestion.selected} onCheckedChange={() => onToggle(index)} />
        <div className="flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {suggestion.type === 'task' ? 'Task' : suggestion.type === 'subtask' ? 'Subtask' : 'Note'}
            </Badge>

            {suggestion.type === 'task' && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn('h-6 gap-1 px-2 text-xs', !suggestion.dueDate && 'text-muted-foreground')}
                  >
                    <CalendarIcon className="h-3 w-3" />
                    {suggestion.dueDate || 'No date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={suggestion.dueDate ? new Date(suggestion.dueDate) : undefined}
                    onSelect={(date) => {
                      onUpdate(index, { dueDate: date ? format(date, 'yyyy-MM-dd') : null });
                    }}
                    initialFocus
                    className={cn('pointer-events-auto p-3')}
                  />
                </PopoverContent>
              </Popover>
            )}

            {suggestion.type === 'task' && (
              <Select
                value={suggestion.priority}
                onValueChange={(value: 'low' | 'medium' | 'high') => {
                  onUpdate(index, { priority: value });
                }}
              >
                <SelectTrigger className="h-6 w-auto border-0 bg-transparent px-2 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            )}

            {suggestion.type === 'subtask' && (
              <Badge variant="secondary" className="text-xs text-muted-foreground">
                &rarr; {suggestion.parentTaskTitle}
              </Badge>
            )}
          </div>
          <p className="text-sm">
            {suggestion.type === 'task' || suggestion.type === 'subtask' ? suggestion.title : suggestion.content}
          </p>

          {suggestion.type !== 'subtask' && (
            <TopicTagEditor
              topicPath={suggestion.topicPath}
              tags={suggestion.tags}
              isNewTopic={suggestion.isNewTopic}
              suggestedNewTopics={suggestion.suggestedNewTopics}
              suggestedNewTags={suggestion.suggestedNewTags}
              onTopicChange={(topicPath, isNew) => {
                onUpdate(index, { topicPath, isNewTopic: isNew });
              }}
              onTagsChange={(tags, hasNew) => {
                onUpdate(index, { tags, isNewTag: hasNew });
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
});

export default ThoughtSuggestionCard;
