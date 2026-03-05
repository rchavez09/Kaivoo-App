/**
 * FileList — Sprint 25 P15, Sprint 26 cleanup
 *
 * Displays attached files as a compact list: editable name, size, open link, delete.
 * No image preview thumbnails — keeps the UI clean and consistent for all file types.
 */

import { useState, useCallback, useEffect } from 'react';
import { FileText, Image, FileSpreadsheet, File, Trash2, ExternalLink, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AttachmentInfo } from '@/lib/adapters/types';

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileIcon(mimeType: string) {
  if (mimeType.startsWith('image/')) return Image;
  if (mimeType === 'application/pdf' || mimeType.startsWith('text/')) return FileText;
  if (mimeType.includes('spreadsheet') || mimeType === 'text/csv') return FileSpreadsheet;
  return File;
}

interface FileListProps {
  files: AttachmentInfo[];
  onDelete: (filename: string) => Promise<void>;
  getUrl: (filename: string) => Promise<string>;
  onOpen?: (filename: string) => void;
  isLoading?: boolean;
  className?: string;
}

interface FileItemProps {
  file: AttachmentInfo;
  onDelete: (filename: string) => Promise<void>;
  getUrl: (filename: string) => Promise<string>;
  onOpen?: (filename: string) => void;
}

const FileItem = ({ file, onDelete, getUrl, onOpen }: FileItemProps) => {
  const [url, setUrl] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const Icon = getFileIcon(file.mimeType);

  useEffect(() => {
    let cancelled = false;
    void getUrl(file.name)
      .then((u) => {
        if (!cancelled) setUrl(u);
      })
      .catch(() => {
        // URL unavailable — link will be hidden
      });
    return () => {
      cancelled = true;
    };
  }, [file.name, getUrl]);

  const handleDelete = useCallback(async () => {
    setDeleting(true);
    try {
      await onDelete(file.name);
    } finally {
      setDeleting(false);
      setConfirmDelete(false);
    }
  }, [file.name, onDelete]);

  const handleOpen = useCallback(
    (e: React.MouseEvent) => {
      if (onOpen) {
        e.preventDefault();
        onOpen(file.name);
      }
    },
    [file.name, onOpen],
  );

  return (
    <div className="group flex items-center gap-2 overflow-hidden rounded-md border border-border bg-[hsl(var(--surface-elevated))] px-3 py-2">
      <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />

      <div className="min-w-0 flex-1 overflow-hidden">
        {url ? (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleOpen}
            className="block truncate text-sm font-medium text-foreground underline decoration-muted-foreground/40 underline-offset-2 hover:decoration-foreground"
            title={file.name}
          >
            {file.name}
          </a>
        ) : (
          <p className="truncate text-sm font-medium text-foreground" title={file.name}>
            {file.name}
          </p>
        )}
        <p className="text-[11px] text-muted-foreground">{formatFileSize(file.size)}</p>
      </div>

      {/* Actions */}
      <div className="flex shrink-0 items-center gap-0.5">
        {url && (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleOpen}
            aria-label={`Open ${file.name}`}
            className="rounded-md p-1.5 text-muted-foreground opacity-60 transition-opacity hover:bg-secondary/50 hover:text-foreground md:opacity-0 md:group-hover:opacity-100"
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        )}

        {confirmDelete ? (
          <div className="flex items-center gap-1">
            <button
              className={cn(
                'rounded-md px-2 py-1 text-[11px] font-medium text-destructive-foreground',
                'bg-destructive hover:bg-destructive/90',
              )}
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Delete'}
            </button>
            <button
              className="rounded-md px-2 py-1 text-[11px] text-muted-foreground hover:bg-secondary/50"
              onClick={() => setConfirmDelete(false)}
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            aria-label={`Delete ${file.name}`}
            className="rounded-md p-1.5 text-muted-foreground opacity-60 transition-opacity hover:bg-destructive/10 hover:text-destructive md:opacity-0 md:group-hover:opacity-100"
            onClick={() => setConfirmDelete(true)}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};

const FileList = ({ files, onDelete, getUrl, onOpen, isLoading, className }: FileListProps) => {
  if (isLoading) {
    return (
      <div className={cn('flex items-center justify-center py-4', className)}>
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (files.length === 0) return null;

  return (
    <div className={cn('grid gap-1.5', className)}>
      {files.map((file) => (
        <FileItem key={file.name} file={file} onDelete={onDelete} getUrl={getUrl} onOpen={onOpen} />
      ))}
    </div>
  );
};

export default FileList;
