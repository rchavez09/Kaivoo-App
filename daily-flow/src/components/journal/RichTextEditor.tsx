import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Highlight from '@tiptap/extension-highlight';
import { TextStyle } from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Placeholder from '@tiptap/extension-placeholder';
import Image from '@tiptap/extension-image';
import { WikiLinkNode } from './WikiLinkNode';
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
  Palette,
  ImagePlus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Toggle } from '@/components/ui/toggle';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useCallback, useEffect, useRef } from 'react';

const MAX_IMAGE_BYTES = 200_000; // 200KB target

/** Compress an image file to JPEG ≤ MAX_IMAGE_BYTES using canvas downscaling. */
async function compressImage(file: File): Promise<File> {
  if (file.size <= MAX_IMAGE_BYTES) return file;

  const bitmap = await createImageBitmap(file);
  let { width, height } = bitmap;

  // Scale down proportionally until area is reasonable for target size
  const scaleFactor = Math.sqrt(MAX_IMAGE_BYTES / file.size);
  width = Math.round(width * scaleFactor);
  height = Math.round(height * scaleFactor);

  const canvas = new OffscreenCanvas(width, height);
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  // Try progressively lower quality until under budget (integer loop avoids float drift)
  for (let q = 8; q >= 3; q -= 1) {
    const blob = await canvas.convertToBlob({ type: 'image/jpeg', quality: q / 10 });
    if (blob.size <= MAX_IMAGE_BYTES || q === 3) {
      return new File([blob], file.name.replace(/\.[^.]+$/, '') + '.jpg', { type: 'image/jpeg' });
    }
  }

  // Unreachable (loop always returns at q === 3) but satisfies TypeScript
  const blob = await canvas.convertToBlob({ type: 'image/jpeg', quality: 0.3 });
  return new File([blob], file.name.replace(/\.[^.]+$/, '') + '.jpg', { type: 'image/jpeg' });
}

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
  /** Upload an image file and return its public URL. When provided, images are uploaded to storage instead of embedded as base64. */
  onImageUpload?: (file: File) => Promise<string>;
  /** Called when a [[wiki-link]] is clicked. Receives the path text (e.g., "Topic" or "Topic/Page"). */
  onWikiLinkClick?: (path: string) => void;
}

const RichTextEditor = ({
  content,
  onChange,
  placeholder = 'Start writing...',
  className,
  editable = true,
  onImageUpload,
  onWikiLinkClick,
}: RichTextEditorProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const insertImageRef = useRef<(file: File) => void>(() => {});

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
      Image.configure({
        inline: true,
        allowBase64: true,
      }),
      WikiLinkNode,
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
      handlePaste: (_view, event) => {
        const items = event.clipboardData?.items;
        if (!items) return false;
        for (const item of items) {
          if (item.type.startsWith('image/')) {
            event.preventDefault();
            const file = item.getAsFile();
            if (file) insertImageRef.current(file);
            return true;
          }
        }
        return false;
      },
      handleDrop: (_view, event) => {
        const files = event.dataTransfer?.files;
        if (!files?.length) return false;
        for (const file of files) {
          if (file.type.startsWith('image/')) {
            event.preventDefault();
            insertImageRef.current(file);
            return true;
          }
        }
        return false;
      },
      handleClick: (_view, _pos, event) => {
        const target = event.target as HTMLElement;
        if (target.classList.contains('wiki-link') && onWikiLinkClick) {
          const path = target.getAttribute('data-wiki-link');
          if (path) {
            event.preventDefault();
            onWikiLinkClick(path);
          }
          return true;
        }
        return false;
      },
    },
  });

  const insertImageFromFile = useCallback(
    (file: File) => {
      if (!editor) return;
      if (onImageUpload) {
        // Upload to storage, verify the image loads, then insert
        const toastId = toast.loading(`Uploading ${file.name}…`);
        void (async () => {
          let uploadedUrl: string | null = null;
          try {
            const compressed = await compressImage(file);
            uploadedUrl = await onImageUpload(compressed);

            // Verify the image is accessible before inserting
            const img = new window.Image();
            await new Promise<void>((resolve, reject) => {
              img.onload = () => resolve();
              img.onerror = () => reject(new Error('Image not accessible'));
              img.src = uploadedUrl!;
            });

            editor.chain().focus().setImage({ src: uploadedUrl, alt: file.name }).run();
            toast.dismiss(toastId);
          } catch (e) {
            toast.dismiss(toastId);
            // Upload succeeded but image URL not accessible — insert as a clickable link
            if (e instanceof Error && e.message === 'Image not accessible' && uploadedUrl) {
              editor
                .chain()
                .focus()
                .insertContent(`<a href="${uploadedUrl}" target="_blank" rel="noopener">${file.name}</a>`)
                .run();
              toast.warning('Image uploaded but preview unavailable — inserted as link');
            } else {
              toast.error(e instanceof Error ? e.message : 'Image upload failed');
            }
          }
        })();
      } else {
        // Fallback: compress then embed as base64
        void (async () => {
          try {
            const compressed = await compressImage(file);
            const reader = new FileReader();
            reader.onload = () => {
              if (typeof reader.result === 'string') {
                editor.chain().focus().setImage({ src: reader.result }).run();
              }
            };
            reader.readAsDataURL(compressed);
          } catch {
            // Compression failed — fall back to raw embed
            const reader = new FileReader();
            reader.onload = () => {
              if (typeof reader.result === 'string') {
                editor.chain().focus().setImage({ src: reader.result }).run();
              }
            };
            reader.readAsDataURL(file);
          }
        })();
      }
    },
    [editor, onImageUpload],
  );
  insertImageRef.current = insertImageFromFile;

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) insertImageFromFile(file);
      e.target.value = '';
    },
    [insertImageFromFile],
  );

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
    <div className={cn('overflow-hidden rounded-lg border border-border bg-background', className)}>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 border-b border-border bg-muted/30 px-2 py-1.5">
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

        <div className="mx-1 h-5 w-px bg-border" />

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

        <div className="mx-1 h-5 w-px bg-border" />

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

        <div className="mx-1 h-5 w-px bg-border" />

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
                    'h-6 w-6 rounded border border-border transition-transform hover:scale-110',
                    !c.color && 'bg-foreground',
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
                    'h-6 w-6 rounded border border-border transition-transform hover:scale-110',
                    !c.color && 'bg-background line-through',
                  )}
                  style={{ backgroundColor: c.color || undefined }}
                  title={c.name}
                />
              ))}
            </div>
          </PopoverContent>
        </Popover>

        <div className="mx-1 h-5 w-px bg-border" />

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

        <div className="mx-1 h-5 w-px bg-border" />

        {/* Blockquote */}
        <Toggle
          size="sm"
          pressed={editor.isActive('blockquote')}
          onPressedChange={() => editor.chain().focus().toggleBlockquote().run()}
          className="h-8 w-8 p-0"
        >
          <Quote className="h-4 w-4" />
        </Toggle>

        <div className="mx-1 h-5 w-px bg-border" />

        {/* Image insert */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          className="h-8 w-8 p-0"
          aria-label="Insert image"
        >
          <ImagePlus className="h-4 w-4" />
        </Button>
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileInputChange} />
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
          caret-color: currentColor;
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
        .ProseMirror img {
          max-width: 100%;
          height: auto;
          border-radius: 0.375rem;
          margin: 0.5rem 0;
        }
        .ProseMirror .wiki-link {
          display: inline;
          padding: 0.125rem 0.375rem;
          border-radius: 0.25rem;
          background: hsl(var(--secondary));
          color: hsl(var(--primary));
          font-size: 0.8125rem;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.15s;
        }
        .ProseMirror .wiki-link:hover {
          background: hsl(var(--secondary) / 0.8);
          text-decoration: underline;
        }
        .ProseMirror .wiki-link:focus-visible {
          outline: 2px solid hsl(var(--primary));
          outline-offset: 2px;
        }
      `}</style>
    </div>
  );
};

export default RichTextEditor;
