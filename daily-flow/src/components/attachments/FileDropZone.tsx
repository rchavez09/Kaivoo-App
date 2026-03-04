/**
 * FileDropZone — Sprint 25 P15
 *
 * Drag-and-drop zone + click-to-upload button.
 * Accepts common file types (images, PDFs, documents). Max 10MB per file.
 */

import { useCallback, useRef, useState, DragEvent } from 'react';
import { Upload, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

interface FileDropZoneProps {
  onUpload: (file: File) => Promise<void>;
  uploading?: string | null;
  className?: string;
}

const FileDropZone = ({ onUpload, uploading, className }: FileDropZoneProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dragCountRef = useRef(0);

  const handleFiles = useCallback(
    async (fileList: FileList | null) => {
      if (!fileList || fileList.length === 0) return;
      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i];
        if (file.size > MAX_FILE_SIZE) {
          toast.error(`${file.name} is too large (max 10MB)`);
          continue;
        }
        await onUpload(file);
      }
    },
    [onUpload],
  );

  const handleDragEnter = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCountRef.current++;
    if (dragCountRef.current === 1) {
      setIsDragging(true);
    }
  }, []);

  const handleDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCountRef.current--;
    if (dragCountRef.current === 0) {
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dragCountRef.current = 0;
      setIsDragging(false);
      void handleFiles(e.dataTransfer.files);
    },
    [handleFiles],
  );

  const handleClick = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      void handleFiles(e.target.files);
      // Reset so the same file can be selected again
      e.target.value = '';
    },
    [handleFiles],
  );

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="Drop files here or click to upload"
      className={cn(
        'flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed px-4 py-6 text-center transition-colors',
        isDragging
          ? 'border-primary bg-primary/5 text-primary'
          : 'border-border text-muted-foreground hover:border-primary/40 hover:bg-secondary/20',
        uploading && 'pointer-events-none opacity-60',
        className,
      )}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      {uploading ? (
        <>
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="text-xs">Uploading {uploading}...</span>
        </>
      ) : (
        <>
          <Upload className="h-6 w-6" />
          <span className="text-xs">{isDragging ? 'Drop to upload' : 'Drop files here or click to browse'}</span>
          <span className="text-[10px] text-muted-foreground/60">Max 10MB per file</span>
        </>
      )}
      <input ref={inputRef} type="file" multiple className="hidden" onChange={handleInputChange} tabIndex={-1} />
    </div>
  );
};

export default FileDropZone;
