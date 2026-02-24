import { useEffect, useRef, useCallback, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Highlight from '@tiptap/extension-highlight';
import { TextStyle } from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Placeholder from '@tiptap/extension-placeholder';
import {
  Bold, Italic, Strikethrough, Highlighter, List, ListOrdered,
  Heading1, Heading2, Quote, Undo, Redo, Palette,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Toggle } from '@/components/ui/toggle';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format, differenceInMinutes, isSameDay } from 'date-fns';
import { TimestampDivider } from './TimestampDivider';
import { useKaivooStore } from '@/stores/useKaivooStore';
import { useKaivooActions } from '@/hooks/useKaivooActions';
import { JournalEntry } from '@/types';
import { cn } from '@/lib/utils';

// --- Constants ---
const GAP_THRESHOLD_MINUTES = 30;
const SAVE_DEBOUNCE_MS = 3000;

const TEXT_COLORS = [
  { name: 'Default', color: null },
  { name: 'Gray', color: '#6B7280' },
  { name: 'Red', color: '#EF4444' },
  { name: 'Orange', color: '#F97316' },
  { name: 'Yellow', color: '#EAB308' },
  { name: 'Green', color: '#22C55E' },
  { name: 'Blue', color: '#3B82F6' },
  { name: 'Purple', color: '#A855F7' },
  { name: 'Pink', color: '#EC4899' },
];

const HIGHLIGHT_COLORS = [
  { name: 'None', color: null },
  { name: 'Yellow', color: '#FEF08A' },
  { name: 'Green', color: '#BBF7D0' },
  { name: 'Blue', color: '#BFDBFE' },
  { name: 'Purple', color: '#E9D5FF' },
  { name: 'Pink', color: '#FBCFE8' },
  { name: 'Orange', color: '#FED7AA' },
];

// --- Types ---
export interface CanvasSection {
  entryId: string;
  timestamp: Date;
}

interface JournalCanvasProps {
  selectedDate: Date;
  onSectionsChange: (sections: CanvasSection[]) => void;
  onSaveStatusChange: (status: 'saved' | 'saving' | 'unsaved' | 'idle') => void;
}

// --- Helpers ---
function composeHTML(entries: JournalEntry[]): string {
  if (entries.length === 0) return '';
  return entries.map(entry => {
    const ts = new Date(entry.timestamp);
    const label = `── ${format(ts, 'h:mm a')} ──`;
    const divider = `<div data-timestamp-divider="" data-timestamp="${ts.toISOString()}" data-entry-id="${entry.id}" contenteditable="false" class="timestamp-divider">${label}</div>`;
    return divider + (entry.content || '<p></p>');
  }).join('');
}

function extractSections(html: string): Array<{ entryId: string; content: string }> {
  const parser = new DOMParser();
  const doc = parser.parseFromString(`<body>${html}</body>`, 'text/html');
  const body = doc.body;

  const sections: Array<{ entryId: string; content: string }> = [];
  let currentEntryId: string | null = null;
  let currentNodes: Node[] = [];

  const flush = () => {
    if (currentEntryId) {
      const div = document.createElement('div');
      currentNodes.forEach(n => div.appendChild(n.cloneNode(true)));
      sections.push({ entryId: currentEntryId, content: div.innerHTML || '' });
    }
    currentNodes = [];
  };

  for (const child of Array.from(body.childNodes)) {
    if (child instanceof HTMLElement && child.hasAttribute('data-timestamp-divider')) {
      flush();
      currentEntryId = child.getAttribute('data-entry-id');
    } else if (currentEntryId !== null) {
      currentNodes.push(child);
    }
  }
  flush();
  return sections;
}

// --- Component ---
const JournalCanvas = ({ selectedDate, onSectionsChange, onSaveStatusChange }: JournalCanvasProps) => {
  const dateStr = format(selectedDate, 'yyyy-MM-dd');
  const isToday = isSameDay(selectedDate, new Date());

  const { addJournalEntry, updateJournalEntry } = useKaivooActions();

  // Subscribe to journalEntries for re-initialization when data arrives
  const journalEntries = useKaivooStore(s => s.journalEntries);

  // Track whether initial load populated the canvas
  const [initialLoadDone, setInitialLoadDone] = useState(false);

  // Refs for state that shouldn't cause re-renders
  const savedContentsRef = useRef<Map<string, string>>(new Map());
  const sectionsRef = useRef<CanvasSection[]>([]);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isComposingRef = useRef(false);
  const pendingNewEntryRef = useRef(false);
  const dateStrRef = useRef(dateStr);
  const latestHTMLRef = useRef('');

  // Stable callback refs to avoid stale closures
  const onSectionsChangeRef = useRef(onSectionsChange);
  onSectionsChangeRef.current = onSectionsChange;
  const onSaveStatusChangeRef = useRef(onSaveStatusChange);
  onSaveStatusChangeRef.current = onSaveStatusChange;

  // --- Save logic ---
  const saveDirtySections = useCallback(async (html: string) => {
    const sections = extractSections(html);
    const toSave: Array<{ entryId: string; content: string }> = [];

    for (const section of sections) {
      const saved = savedContentsRef.current.get(section.entryId);
      if (saved !== section.content) {
        toSave.push(section);
      }
    }

    if (toSave.length === 0) {
      onSaveStatusChangeRef.current('saved');
      return;
    }

    onSaveStatusChangeRef.current('saving');

    try {
      await Promise.all(
        toSave.map(({ entryId, content }) => updateJournalEntry(entryId, { content }))
      );
      for (const { entryId, content } of toSave) {
        savedContentsRef.current.set(entryId, content);
      }
      onSaveStatusChangeRef.current('saved');
    } catch (e) {
      console.error('[JournalCanvas] Auto-save failed:', e);
      onSaveStatusChangeRef.current('unsaved');
      // Fallback: save full HTML to localStorage
      localStorage.setItem(`journal-canvas-draft-${dateStrRef.current}`, html);
    }
  }, [updateJournalEntry]);

  // --- First-write: create entry when user types in empty canvas ---
  const handleFirstWrite = useCallback(async (editorHTML: string, editorInstance: ReturnType<typeof useEditor>) => {
    if (pendingNewEntryRef.current || sectionsRef.current.length > 0) return;
    pendingNewEntryRef.current = true;

    try {
      // Get the current content BEFORE the async call (user may still be typing)
      const typedContent = editorInstance ? editorInstance.getHTML() : editorHTML;

      const newEntry = await addJournalEntry({
        content: typedContent, // Save content immediately, not empty
        date: dateStrRef.current,
        tags: [],
        topicIds: [],
      });

      if (newEntry && editorInstance) {
        isComposingRef.current = true;

        const label = `── ${format(new Date(newEntry.timestamp), 'h:mm a')} ──`;
        // Get the LATEST content (user may have typed more during the await)
        const latestContent = editorInstance.getHTML();
        // Rebuild: divider + latest content
        const html = `<div data-timestamp-divider="" data-timestamp="${new Date(newEntry.timestamp).toISOString()}" data-entry-id="${newEntry.id}" contenteditable="false" class="timestamp-divider">${label}</div>${latestContent}`;
        editorInstance.commands.setContent(html);

        savedContentsRef.current.set(newEntry.id, typedContent);
        sectionsRef.current = [{ entryId: newEntry.id, timestamp: new Date(newEntry.timestamp) }];
        onSectionsChangeRef.current(sectionsRef.current);
        setInitialLoadDone(true);

        // If the user typed more during the await, save immediately
        if (latestContent !== typedContent) {
          void updateJournalEntry(newEntry.id, { content: latestContent });
          savedContentsRef.current.set(newEntry.id, latestContent);
        }

        // Restore cursor at end
        requestAnimationFrame(() => {
          editorInstance.commands.focus('end');
          isComposingRef.current = false;
        });
      }
    } catch (e) {
      console.error('[JournalCanvas] Failed to create first entry:', e);
    } finally {
      pendingNewEntryRef.current = false;
    }
  }, [addJournalEntry, updateJournalEntry]);

  // --- TipTap editor ---
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Highlight.configure({ multicolor: true }),
      TextStyle,
      Color,
      TimestampDivider,
      Placeholder.configure({
        placeholder: 'Start writing...',
        emptyEditorClass: 'is-editor-empty',
      }),
    ],
    content: '',
    onUpdate: ({ editor: ed }) => {
      if (isComposingRef.current) return;

      const html = ed.getHTML();
      latestHTMLRef.current = html;

      // First-write detection
      if (sectionsRef.current.length === 0 && !pendingNewEntryRef.current) {
        void handleFirstWrite(html, ed);
        return;
      }

      onSaveStatusChangeRef.current('unsaved');

      // Debounced save
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = setTimeout(() => {
        void saveDirtySections(html);
      }, SAVE_DEBOUNCE_MS);

      // localStorage draft (immediate)
      localStorage.setItem(`journal-canvas-draft-${dateStrRef.current}`, html);
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm dark:prose-invert max-w-none focus:outline-none min-h-[400px] px-4 py-3',
        role: 'textbox',
        'aria-label': 'Journal canvas editor',
      },
    },
  });

  // --- Initialize canvas on date change ---
  useEffect(() => {
    if (!editor) return;

    // Flush pending saves for previous date
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
      // Actually save instead of discarding
      if (latestHTMLRef.current && sectionsRef.current.length > 0) {
        void saveDirtySections(latestHTMLRef.current);
      }
    }

    dateStrRef.current = dateStr;
    isComposingRef.current = true;
    pendingNewEntryRef.current = false;

    // Read entries directly from store (not reactive to future store changes)
    const entries = useKaivooStore.getState().journalEntries
      .filter(e => e.date === dateStr)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    // Store saved contents
    savedContentsRef.current.clear();
    entries.forEach(e => savedContentsRef.current.set(e.id, e.content || ''));

    // Track sections
    sectionsRef.current = entries.map(e => ({
      entryId: e.id,
      timestamp: new Date(e.timestamp),
    }));
    onSectionsChangeRef.current(sectionsRef.current);

    // Compose and set content
    const html = composeHTML(entries);
    editor.commands.setContent(html || '');

    onSaveStatusChangeRef.current(entries.length > 0 ? 'saved' : 'idle');
    setInitialLoadDone(entries.length > 0);

    // Auto-append: if today and latest entry is old, create new section
    if (isToday && entries.length > 0) {
      const latest = entries[entries.length - 1];
      const gap = differenceInMinutes(new Date(), new Date(latest.timestamp));
      if (gap >= GAP_THRESHOLD_MINUTES) {
        // Create new section eagerly
        pendingNewEntryRef.current = true;
        addJournalEntry({
          content: '',
          date: dateStr,
          tags: [],
          topicIds: [],
        }).then(newEntry => {
          if (newEntry && editor) {
            const label = `── ${format(new Date(newEntry.timestamp), 'h:mm a')} ──`;
            const dividerHTML = `<div data-timestamp-divider="" data-timestamp="${new Date(newEntry.timestamp).toISOString()}" data-entry-id="${newEntry.id}" contenteditable="false" class="timestamp-divider">${label}</div><p></p>`;

            // Append to existing content
            const currentHTML = editor.getHTML();
            editor.commands.setContent(currentHTML + dividerHTML);

            savedContentsRef.current.set(newEntry.id, '');
            sectionsRef.current = [
              ...sectionsRef.current,
              { entryId: newEntry.id, timestamp: new Date(newEntry.timestamp) },
            ];
            onSectionsChangeRef.current(sectionsRef.current);
          }
          pendingNewEntryRef.current = false;
        }).catch(e => {
          console.error('[JournalCanvas] Auto-append failed:', e);
          pendingNewEntryRef.current = false;
        });
      }
    }

    requestAnimationFrame(() => {
      editor.commands.focus('end');
      isComposingRef.current = false;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor, dateStr]);

  // --- Re-initialize when store data arrives after mount ---
  useEffect(() => {
    // Skip if canvas already has content or editor isn't ready
    if (!editor || initialLoadDone || pendingNewEntryRef.current) return;

    const entries = journalEntries
      .filter(e => e.date === dateStr)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    if (entries.length === 0) return;

    // Entries arrived — initialize canvas
    isComposingRef.current = true;
    savedContentsRef.current.clear();
    entries.forEach(e => savedContentsRef.current.set(e.id, e.content || ''));
    sectionsRef.current = entries.map(e => ({
      entryId: e.id,
      timestamp: new Date(e.timestamp),
    }));
    onSectionsChangeRef.current(sectionsRef.current);

    const html = composeHTML(entries);
    editor.commands.setContent(html);
    onSaveStatusChangeRef.current('saved');
    setInitialLoadDone(true);

    requestAnimationFrame(() => {
      editor.commands.focus('end');
      isComposingRef.current = false;
    });
  }, [editor, dateStr, journalEntries, initialLoadDone]);

  // --- Flush saves on unmount ---
  const saveDirtySectionsRef = useRef(saveDirtySections);
  saveDirtySectionsRef.current = saveDirtySections;

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
        // Flush pending save immediately instead of discarding
        if (latestHTMLRef.current && sectionsRef.current.length > 0) {
          void saveDirtySectionsRef.current(latestHTMLRef.current);
        }
      }
    };
  }, []);

  if (!editor) return null;

  return (
    <div className="flex flex-col">
      {/* Toolbar */}
      <div className="border-b border-border/50 px-1 py-1.5 flex items-center gap-0.5 flex-wrap" role="toolbar" aria-label="Text formatting">
        <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} className="h-8 w-8 p-0" aria-label="Undo">
          <Undo className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} className="h-8 w-8 p-0" aria-label="Redo">
          <Redo className="h-4 w-4" />
        </Button>
        <div className="w-px h-5 bg-border mx-1" />
        <Toggle size="sm" pressed={editor.isActive('heading', { level: 1 })} onPressedChange={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className="h-8 w-8 p-0" aria-label="Heading 1">
          <Heading1 className="h-4 w-4" />
        </Toggle>
        <Toggle size="sm" pressed={editor.isActive('heading', { level: 2 })} onPressedChange={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className="h-8 w-8 p-0" aria-label="Heading 2">
          <Heading2 className="h-4 w-4" />
        </Toggle>
        <div className="w-px h-5 bg-border mx-1" />
        <Toggle size="sm" pressed={editor.isActive('bold')} onPressedChange={() => editor.chain().focus().toggleBold().run()} className="h-8 w-8 p-0" aria-label="Bold">
          <Bold className="h-4 w-4" />
        </Toggle>
        <Toggle size="sm" pressed={editor.isActive('italic')} onPressedChange={() => editor.chain().focus().toggleItalic().run()} className="h-8 w-8 p-0" aria-label="Italic">
          <Italic className="h-4 w-4" />
        </Toggle>
        <Toggle size="sm" pressed={editor.isActive('strike')} onPressedChange={() => editor.chain().focus().toggleStrike().run()} className="h-8 w-8 p-0" aria-label="Strikethrough">
          <Strikethrough className="h-4 w-4" />
        </Toggle>
        <div className="w-px h-5 bg-border mx-1" />
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" aria-label="Text color">
              <Palette className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-2" align="start">
            <div className="grid grid-cols-5 gap-1">
              {TEXT_COLORS.map((c) => (
                <button
                  key={c.name}
                  onClick={() => c.color ? editor.chain().focus().setColor(c.color).run() : editor.chain().focus().unsetColor().run()}
                  className={cn("h-6 w-6 rounded border border-border hover:scale-110 transition-transform", !c.color && "bg-foreground")}
                  style={{ backgroundColor: c.color || undefined }}
                  aria-label={`${c.name} text color`}
                />
              ))}
            </div>
          </PopoverContent>
        </Popover>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" aria-label="Highlight color">
              <Highlighter className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-2" align="start">
            <div className="grid grid-cols-4 gap-1">
              {HIGHLIGHT_COLORS.map((c) => (
                <button
                  key={c.name}
                  onClick={() => c.color ? editor.chain().focus().toggleHighlight({ color: c.color }).run() : editor.chain().focus().unsetHighlight().run()}
                  className={cn("h-6 w-6 rounded border border-border hover:scale-110 transition-transform", !c.color && "bg-background line-through")}
                  style={{ backgroundColor: c.color || undefined }}
                  aria-label={`${c.name} highlight`}
                />
              ))}
            </div>
          </PopoverContent>
        </Popover>
        <div className="w-px h-5 bg-border mx-1" />
        <Toggle size="sm" pressed={editor.isActive('bulletList')} onPressedChange={() => editor.chain().focus().toggleBulletList().run()} className="h-8 w-8 p-0" aria-label="Bullet list">
          <List className="h-4 w-4" />
        </Toggle>
        <Toggle size="sm" pressed={editor.isActive('orderedList')} onPressedChange={() => editor.chain().focus().toggleOrderedList().run()} className="h-8 w-8 p-0" aria-label="Ordered list">
          <ListOrdered className="h-4 w-4" />
        </Toggle>
        <div className="w-px h-5 bg-border mx-1" />
        <Toggle size="sm" pressed={editor.isActive('blockquote')} onPressedChange={() => editor.chain().focus().toggleBlockquote().run()} className="h-8 w-8 p-0" aria-label="Blockquote">
          <Quote className="h-4 w-4" />
        </Toggle>
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-auto">
        <EditorContent editor={editor} />
      </div>

      <style>{`
        .timestamp-divider {
          text-align: center;
          color: hsl(var(--muted-foreground));
          font-size: 0.75rem;
          letter-spacing: 0.05em;
          padding: 0.75rem 0;
          user-select: none;
          pointer-events: none;
          opacity: 0.7;
        }
        .ProseMirror {
          min-height: 400px;
        }
        .ProseMirror:focus {
          outline: none;
        }
        .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: hsl(var(--muted-foreground));
          opacity: 0.5;
          pointer-events: none;
          height: 0;
        }
      `}</style>
    </div>
  );
};

export default JournalCanvas;
