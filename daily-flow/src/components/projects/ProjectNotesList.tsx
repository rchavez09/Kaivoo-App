import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { StickyNote, Plus, Pencil, Trash2, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { useKaivooStore } from '@/stores/useKaivooStore';
import { useKaivooActions } from '@/hooks/useKaivooActions';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface ProjectNotesListProps {
  projectId: string;
}

const INITIAL_VISIBLE = 5;

const ProjectNotesList = ({ projectId }: ProjectNotesListProps) => {
  const projectNotes = useKaivooStore((s) => s.projectNotes) ?? [];
  const { addProjectNote, updateProjectNote, deleteProjectNote } = useKaivooActions();

  const notes = useMemo(
    () =>
      (projectNotes || [])
        .filter((n) => n.projectId === projectId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [projectNotes, projectId],
  );

  const [newContent, setNewContent] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [showAll, setShowAll] = useState(false);

  const editRef = useRef<HTMLTextAreaElement>(null);
  const newNoteRef = useRef<HTMLTextAreaElement>(null);
  // Refs for focus restoration
  const editButtonRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const deleteButtonRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const deleteCancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (editingId && editRef.current) {
      editRef.current.focus();
      editRef.current.setSelectionRange(editRef.current.value.length, editRef.current.value.length);
    }
  }, [editingId]);

  // Focus Cancel button when delete confirmation appears
  useEffect(() => {
    if (deletingId && deleteCancelRef.current) {
      deleteCancelRef.current.focus();
    }
  }, [deletingId]);

  const handleAdd = useCallback(async () => {
    const text = newContent.trim();
    if (!text) return;
    try {
      await addProjectNote({ projectId, content: text });
      setNewContent('');
    } catch {
      toast.error('Failed to save note. Please try again.');
    }
  }, [newContent, projectId, addProjectNote]);

  const handleEditStart = useCallback((noteId: string, content: string) => {
    setEditingId(noteId);
    setEditContent(content);
  }, []);

  const handleEditSave = useCallback(async () => {
    if (!editingId) return;
    const text = editContent.trim();
    if (!text) return; // Don't clear edit mode on empty content
    const noteId = editingId;
    try {
      await updateProjectNote(editingId, { content: text });
    } catch {
      toast.error('Failed to save note. Please try again.');
    }
    setEditingId(null);
    setEditContent('');
    // Restore focus to the edit button
    requestAnimationFrame(() => {
      editButtonRefs.current.get(noteId)?.focus();
    });
  }, [editingId, editContent, updateProjectNote]);

  const handleEditCancel = useCallback(() => {
    const noteId = editingId;
    setEditingId(null);
    setEditContent('');
    // Restore focus to the edit button
    if (noteId) {
      requestAnimationFrame(() => {
        editButtonRefs.current.get(noteId)?.focus();
      });
    }
  }, [editingId]);

  const handleDelete = useCallback(
    async (noteId: string) => {
      try {
        await deleteProjectNote(noteId);
      } catch {
        toast.error('Failed to delete note. Please try again.');
      }
      setDeletingId(null);
    },
    [deleteProjectNote],
  );

  const handleDeleteCancel = useCallback((noteId: string) => {
    setDeletingId(null);
    // Restore focus to the delete button
    requestAnimationFrame(() => {
      deleteButtonRefs.current.get(noteId)?.focus();
    });
  }, []);

  const toggleExpand = useCallback((noteId: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(noteId)) next.delete(noteId);
      else next.add(noteId);
      return next;
    });
  }, []);

  const visibleNotes = showAll ? notes : notes.slice(0, INITIAL_VISIBLE);
  const hiddenCount = notes.length - INITIAL_VISIBLE;

  return (
    <div className="widget-card">
      <div className="widget-header">
        <h2 className="widget-title">Notes</h2>
        <span className="text-xs text-muted-foreground">
          {notes.length > 0 && `${notes.length} note${notes.length === 1 ? '' : 's'}`}
        </span>
      </div>

      {/* Notes list */}
      {notes.length > 0 ? (
        <div role="list" aria-label="Project notes" className="divide-y divide-border">
          {visibleNotes.map((note) => {
            const isEditing = editingId === note.id;
            const isDeleting = deletingId === note.id;
            const isExpanded = expandedIds.has(note.id);
            const timestamp = format(new Date(note.createdAt), 'MMM d, yyyy · h:mm a');

            return (
              <div key={note.id} role="listitem" className="py-3 first:pt-0">
                {isDeleting ? (
                  <div role="alert" className="flex items-center gap-3 rounded-lg bg-destructive/10 px-3 py-2">
                    <span className="flex-1 text-sm text-foreground">Delete this note?</span>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="h-7 text-xs"
                      onClick={() => handleDelete(note.id)}
                    >
                      Delete
                    </Button>
                    <Button
                      ref={deleteCancelRef}
                      size="sm"
                      variant="ghost"
                      className="h-7 text-xs"
                      onClick={() => handleDeleteCancel(note.id)}
                    >
                      Cancel
                    </Button>
                  </div>
                ) : isEditing ? (
                  <div>
                    <Textarea
                      ref={editRef}
                      aria-label="Edit note content"
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Escape') handleEditCancel();
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleEditSave();
                        }
                      }}
                      className="mb-2 min-h-[80px] resize-none text-sm"
                    />
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="ghost" className="h-7 gap-1 text-xs" onClick={handleEditCancel}>
                        <X className="h-3 w-3" /> Cancel
                      </Button>
                      <Button
                        size="sm"
                        className="h-7 gap-1 text-xs"
                        onClick={handleEditSave}
                        disabled={!editContent.trim()}
                      >
                        <Check className="h-3 w-3" /> Save
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="group">
                    <div
                      role="button"
                      tabIndex={0}
                      aria-label={`Edit note: ${note.content.slice(0, 50)}${note.content.length > 50 ? '...' : ''}`}
                      className="-mx-2 cursor-pointer rounded-lg px-2 py-1 transition-colors hover:bg-secondary/30"
                      onClick={() => handleEditStart(note.id, note.content)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleEditStart(note.id, note.content);
                        }
                      }}
                    >
                      <p
                        className={cn(
                          'whitespace-pre-wrap break-words text-sm text-foreground',
                          !isExpanded && 'line-clamp-4',
                        )}
                      >
                        {note.content}
                      </p>
                    </div>

                    {/* Check if content is long enough to need expand */}
                    {note.content.length > 200 && (
                      <button
                        className="ml-2 mt-1 text-xs text-primary hover:text-primary/80"
                        onClick={() => toggleExpand(note.id)}
                      >
                        {isExpanded ? 'Show less' : 'Show more'}
                      </button>
                    )}

                    <div className="mt-2 flex items-center gap-2 px-2">
                      <span className="flex-1 text-xs text-muted-foreground">
                        {timestamp}
                        {new Date(note.updatedAt).getTime() - new Date(note.createdAt).getTime() > 1000 && ' (edited)'}
                      </span>
                      <button
                        ref={(el) => {
                          if (el) editButtonRefs.current.set(note.id, el);
                        }}
                        aria-label={`Edit note from ${timestamp}`}
                        className="rounded-md p-2 text-muted-foreground opacity-60 transition-opacity hover:bg-secondary/50 hover:text-foreground focus-visible:opacity-100 md:opacity-0 md:group-hover:opacity-100"
                        onClick={() => handleEditStart(note.id, note.content)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        ref={(el) => {
                          if (el) deleteButtonRefs.current.set(note.id, el);
                        }}
                        aria-label={`Delete note from ${timestamp}`}
                        className="rounded-md p-2 text-muted-foreground opacity-60 transition-opacity hover:bg-destructive/10 hover:text-destructive focus-visible:opacity-100 md:opacity-0 md:group-hover:opacity-100"
                        onClick={() => setDeletingId(note.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-12 text-center" role="status" aria-label="No notes yet">
          <StickyNote className="mx-auto mb-3 h-10 w-10 text-muted-foreground/30" />
          <h3 className="mb-1 text-sm font-medium text-foreground">No notes yet</h3>
          <p className="text-xs text-muted-foreground">Capture thoughts, ideas, or references for this project.</p>
        </div>
      )}

      {/* Show more / less toggle */}
      {hiddenCount > 0 && !showAll && (
        <button
          className="mt-2 w-full py-1 text-center text-xs text-primary hover:text-primary/80"
          onClick={() => setShowAll(true)}
        >
          Show {hiddenCount} more note{hiddenCount === 1 ? '' : 's'}
        </button>
      )}
      {showAll && notes.length > INITIAL_VISIBLE && (
        <button
          className="mt-2 w-full py-1 text-center text-xs text-primary hover:text-primary/80"
          onClick={() => setShowAll(false)}
        >
          Show less
        </button>
      )}

      {/* Add note input */}
      <div className="mt-4 rounded-lg border border-border bg-[hsl(var(--surface-elevated))] p-3">
        <div className="flex items-start gap-2">
          <StickyNote className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
          <Textarea
            ref={newNoteRef}
            aria-label="New note for this project"
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleAdd();
              }
            }}
            placeholder="Add a note to this project..."
            className="min-h-[40px] resize-none border-0 bg-transparent px-0 text-sm shadow-none focus-visible:ring-0"
            rows={1}
          />
        </div>
        {newContent.trim() && (
          <div className="mt-2 flex justify-end">
            <Button size="sm" onClick={handleAdd}>
              <Plus className="mr-1 h-4 w-4" />
              Add Note
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectNotesList;
