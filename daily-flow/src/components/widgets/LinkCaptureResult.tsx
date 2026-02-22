import React from 'react';
import { Globe, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { TopicTagEditor } from './TopicTagEditor';
import type { LinkNote, LinkTask, LinkCaptureResponse } from './ai-inbox-types';

interface LinkCaptureResultProps {
  linkResult: LinkCaptureResponse;
  editedNote: LinkNote;
  linkTasks: LinkTask[];
  isProcessing: boolean;
  onEditNote: (note: LinkNote) => void;
  onToggleLinkTask: (index: number) => void;
  onApprove: () => void;
  onCancel: () => void;
}

const LinkCaptureResult = React.memo(function LinkCaptureResult({
  linkResult,
  editedNote,
  linkTasks,
  isProcessing,
  onEditNote,
  onToggleLinkTask,
  onApprove,
  onCancel,
}: LinkCaptureResultProps) {
  const selectedTaskCount = linkTasks.filter(t => t.selected).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium flex items-center gap-2">
          <Globe className="h-4 w-4 text-primary" />
          {linkResult.pageTitle || 'Link Capture'}
        </h4>
        <Badge variant="outline" className="text-xs capitalize">
          {linkResult.contentType || 'page'}
        </Badge>
      </div>

      {/* Editable Note */}
      <div className="p-3 rounded-xl border bg-primary/5 border-primary/30 space-y-3">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">Note</Badge>
        </div>

        <Input
          value={editedNote.title}
          onChange={(e) => onEditNote({ ...editedNote, title: e.target.value })}
          className="font-medium bg-background"
          placeholder="Note title"
        />

        <Textarea
          value={editedNote.content}
          onChange={(e) => onEditNote({ ...editedNote, content: e.target.value })}
          className="min-h-[150px] text-sm bg-background"
          placeholder="Note content"
        />

        <TopicTagEditor
          topicPath={editedNote.topicPath}
          tags={editedNote.tags}
          isNewTopic={editedNote.isNewTopic}
          onTopicChange={(topicPath, isNew) => {
            onEditNote({ ...editedNote, topicPath, isNewTopic: isNew });
          }}
          onTagsChange={(tags, hasNew) => {
            onEditNote({ ...editedNote, tags, isNewTag: hasNew });
          }}
        />
      </div>

      {/* Optional Tasks */}
      {linkTasks.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">Optional tasks to create:</p>
          {linkTasks.map((task, index) => (
            <div
              key={index}
              className={`p-2 rounded-lg border flex items-center gap-2 ${
                task.selected ? 'bg-primary/5 border-primary/30' : 'bg-muted/30 border-border opacity-60'
              }`}
            >
              <Checkbox
                checked={task.selected}
                onCheckedChange={() => onToggleLinkTask(index)}
              />
              <span className="text-sm flex-1">{task.title}</span>
              <Badge variant="outline" className="text-xs">{task.priority}</Badge>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <Button onClick={onApprove} disabled={isProcessing} className="flex-1">
          <Check className="h-4 w-4 mr-2" />
          Save Note{selectedTaskCount > 0 && ` + ${selectedTaskCount} Tasks`}
        </Button>
        <Button variant="outline" onClick={onCancel} disabled={isProcessing}>
          <X className="h-4 w-4 mr-2" />
          Cancel
        </Button>
      </div>
    </div>
  );
});

export default LinkCaptureResult;
