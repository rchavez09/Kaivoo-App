import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Highlight from '@tiptap/extension-highlight';
import { TextStyle } from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Placeholder from '@tiptap/extension-placeholder';
import { 
  Bold, 
  Italic, 
  Strikethrough, 
  Highlighter, 
  List, 
  ListOrdered,
  Heading1,
  Heading2,
  Quote,
  Undo,
  Redo,
  Palette
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Toggle } from '@/components/ui/toggle';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { useEffect } from 'react';

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

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
  editable?: boolean;
}

const RichTextEditor = ({ 
  content, 
  onChange, 
  placeholder = "Start writing...",
  className,
  editable = true
}: RichTextEditorProps) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Highlight.configure({
        multicolor: true,
      }),
      TextStyle,
      Color,
      Placeholder.configure({
        placeholder,
        emptyEditorClass: 'is-editor-empty',
      }),
    ],
    content,
    editable,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm dark:prose-invert max-w-none focus:outline-none min-h-[400px] px-4 py-3',
      },
    },
  });

  // Update content when prop changes externally
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className={cn("border border-border rounded-lg overflow-hidden bg-background", className)}>
      {/* Toolbar */}
      <div className="border-b border-border bg-muted/30 px-2 py-1.5 flex items-center gap-0.5 flex-wrap">
        {/* Undo/Redo */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="h-8 w-8 p-0"
        >
          <Undo className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="h-8 w-8 p-0"
        >
          <Redo className="h-4 w-4" />
        </Button>

        <div className="w-px h-5 bg-border mx-1" />

        {/* Headings */}
        <Toggle
          size="sm"
          pressed={editor.isActive('heading', { level: 1 })}
          onPressedChange={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className="h-8 w-8 p-0"
        >
          <Heading1 className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive('heading', { level: 2 })}
          onPressedChange={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className="h-8 w-8 p-0"
        >
          <Heading2 className="h-4 w-4" />
        </Toggle>

        <div className="w-px h-5 bg-border mx-1" />

        {/* Text formatting */}
        <Toggle
          size="sm"
          pressed={editor.isActive('bold')}
          onPressedChange={() => editor.chain().focus().toggleBold().run()}
          className="h-8 w-8 p-0"
        >
          <Bold className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive('italic')}
          onPressedChange={() => editor.chain().focus().toggleItalic().run()}
          className="h-8 w-8 p-0"
        >
          <Italic className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive('strike')}
          onPressedChange={() => editor.chain().focus().toggleStrike().run()}
          className="h-8 w-8 p-0"
        >
          <Strikethrough className="h-4 w-4" />
        </Toggle>

        <div className="w-px h-5 bg-border mx-1" />

        {/* Text Color */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Palette className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-2" align="start">
            <div className="grid grid-cols-5 gap-1">
              {TEXT_COLORS.map((c) => (
                <button
                  key={c.name}
                  onClick={() => {
                    if (c.color) {
                      editor.chain().focus().setColor(c.color).run();
                    } else {
                      editor.chain().focus().unsetColor().run();
                    }
                  }}
                  className={cn(
                    "h-6 w-6 rounded border border-border hover:scale-110 transition-transform",
                    !c.color && "bg-foreground"
                  )}
                  style={{ backgroundColor: c.color || undefined }}
                  title={c.name}
                />
              ))}
            </div>
          </PopoverContent>
        </Popover>

        {/* Highlight */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Highlighter className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-2" align="start">
            <div className="grid grid-cols-4 gap-1">
              {HIGHLIGHT_COLORS.map((c) => (
                <button
                  key={c.name}
                  onClick={() => {
                    if (c.color) {
                      editor.chain().focus().toggleHighlight({ color: c.color }).run();
                    } else {
                      editor.chain().focus().unsetHighlight().run();
                    }
                  }}
                  className={cn(
                    "h-6 w-6 rounded border border-border hover:scale-110 transition-transform",
                    !c.color && "bg-background line-through"
                  )}
                  style={{ backgroundColor: c.color || undefined }}
                  title={c.name}
                />
              ))}
            </div>
          </PopoverContent>
        </Popover>

        <div className="w-px h-5 bg-border mx-1" />

        {/* Lists */}
        <Toggle
          size="sm"
          pressed={editor.isActive('bulletList')}
          onPressedChange={() => editor.chain().focus().toggleBulletList().run()}
          className="h-8 w-8 p-0"
        >
          <List className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive('orderedList')}
          onPressedChange={() => editor.chain().focus().toggleOrderedList().run()}
          className="h-8 w-8 p-0"
        >
          <ListOrdered className="h-4 w-4" />
        </Toggle>

        <div className="w-px h-5 bg-border mx-1" />

        {/* Blockquote */}
        <Toggle
          size="sm"
          pressed={editor.isActive('blockquote')}
          onPressedChange={() => editor.chain().focus().toggleBlockquote().run()}
          className="h-8 w-8 p-0"
        >
          <Quote className="h-4 w-4" />
        </Toggle>
      </div>

      {/* Editor content */}
      <EditorContent editor={editor} />

      {/* Custom styles for placeholder */}
      <style>{`
        .is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          color: hsl(var(--muted-foreground));
          opacity: 0.6;
          pointer-events: none;
          position: absolute;
          height: 0;
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

export default RichTextEditor;
