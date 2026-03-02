import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { StickyNote } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useKaivooStore } from '@/stores/useKaivooStore';
import { useKaivooActions } from '@/hooks/useKaivooActions';
import { toast } from 'sonner';

interface QuickAddNoteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Pre-select a project (e.g., when opened from a project detail page) */
  defaultProjectId?: string;
}

const QuickAddNoteDialog = ({ open, onOpenChange, defaultProjectId }: QuickAddNoteDialogProps) => {
  const projects = useKaivooStore((s) => s.projects);
  const { addProjectNote } = useKaivooActions();

  const activeProjects = useMemo(() => projects.filter((p) => p.status !== 'archived'), [projects]);

  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setSelectedProjectId(defaultProjectId || '');
      setContent('');
      setSaving(false);
      // Focus textarea after a brief delay for dialog animation
      const timer = setTimeout(() => textareaRef.current?.focus(), 100);
      return () => clearTimeout(timer);
    }
  }, [open, defaultProjectId]);

  const handleSave = useCallback(async () => {
    if (!selectedProjectId || !content.trim()) return;
    setSaving(true);
    try {
      const result = await addProjectNote({ projectId: selectedProjectId, content: content.trim() });
      if (result) {
        const projectName = activeProjects.find((p) => p.id === selectedProjectId)?.name || 'project';
        toast.success(`Note added to ${projectName}`);
        onOpenChange(false);
      }
    } finally {
      setSaving(false);
    }
  }, [selectedProjectId, content, addProjectNote, activeProjects, onOpenChange]);

  const canSave = selectedProjectId && content.trim() && !saving;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <StickyNote className="h-4 w-4 text-primary" />
            Quick Note
          </DialogTitle>
        </DialogHeader>

        <div className="mt-2 space-y-4">
          {/* Project picker */}
          <div>
            <label htmlFor="quick-note-project" className="mb-1.5 block text-sm font-medium text-foreground">
              Project
            </label>
            <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
              <SelectTrigger id="quick-note-project" className="w-full">
                <SelectValue placeholder="Select a project..." />
              </SelectTrigger>
              <SelectContent>
                {activeProjects.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    <span className="flex items-center gap-2">
                      {p.color && (
                        <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: p.color }} />
                      )}
                      {p.name}
                    </span>
                  </SelectItem>
                ))}
                {activeProjects.length === 0 && (
                  <div className="px-3 py-2 text-sm text-muted-foreground">No active projects</div>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Note content */}
          <div>
            <label htmlFor="quick-note-content" className="mb-1.5 block text-sm font-medium text-foreground">
              Note
            </label>
            <Textarea
              ref={textareaRef}
              id="quick-note-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                  e.preventDefault();
                  if (canSave) handleSave();
                }
              }}
              placeholder="What's on your mind..."
              className="min-h-[100px] resize-none"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              {/Mac|iPhone|iPad/.test(navigator.userAgent) ? '\u2318' : 'Ctrl'}+Enter to save
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!canSave}>
              {saving ? 'Saving...' : 'Add Note'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QuickAddNoteDialog;
