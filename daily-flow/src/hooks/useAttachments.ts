/**
 * useAttachments — Sprint 25 P15
 *
 * Hook that wraps the AttachmentAdapter from the provider context.
 * Manages upload state, file list, and error handling for a given entity.
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { useAdapters } from '@/lib/adapters/provider';
import type { AttachmentInfo } from '@/lib/adapters/types';
import { toast } from 'sonner';

interface UseAttachmentsReturn {
  files: AttachmentInfo[];
  isLoading: boolean;
  uploading: string | null; // filename being uploaded, or null
  upload: (file: File) => Promise<void>;
  remove: (filename: string) => Promise<void>;
  getUrl: (filename: string) => Promise<string>;
  openFile: (filename: string) => Promise<void>;
  refresh: () => Promise<void>;
}

export function useAttachments(entityId: string | undefined): UseAttachmentsReturn {
  const { attachments } = useAdapters();
  const [files, setFiles] = useState<AttachmentInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const entityIdRef = useRef(entityId);
  entityIdRef.current = entityId;

  const refresh = useCallback(async () => {
    if (!entityId) return;
    setIsLoading(true);
    try {
      const list = await attachments.listFiles(entityId);
      // Only update if entityId hasn't changed during the async call
      if (entityIdRef.current === entityId) {
        setFiles(list);
      }
    } catch {
      // listFiles returns [] on error in adapters
    } finally {
      if (entityIdRef.current === entityId) {
        setIsLoading(false);
      }
    }
  }, [entityId, attachments]);

  useEffect(() => {
    setFiles([]);
    void refresh();
  }, [refresh]);

  const upload = useCallback(
    async (file: File) => {
      if (!entityId) return;
      setUploading(file.name);
      try {
        const info = await attachments.uploadFile(entityId, file);
        setFiles((prev) => [info, ...prev]);
        toast.success(`Uploaded ${info.name}`);
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Upload failed';
        toast.error(msg);
      } finally {
        setUploading(null);
      }
    },
    [entityId, attachments],
  );

  const remove = useCallback(
    async (filename: string) => {
      if (!entityId) return;
      try {
        await attachments.deleteFile(entityId, filename);
        setFiles((prev) => prev.filter((f) => f.name !== filename));
        toast.success(`Deleted ${filename}`);
      } catch {
        toast.error('Failed to delete file');
      }
    },
    [entityId, attachments],
  );

  const getUrl = useCallback(
    async (filename: string) => {
      if (!entityId) return '';
      return attachments.getFileUrl(entityId, filename);
    },
    [entityId, attachments],
  );

  const openFile = useCallback(
    async (filename: string) => {
      if (!entityId) return;
      if (attachments.openFile) {
        await attachments.openFile(entityId, filename);
      } else {
        const url = await attachments.getFileUrl(entityId, filename);
        window.open(url, '_blank');
      }
    },
    [entityId, attachments],
  );

  return { files, isLoading, uploading, upload, remove, getUrl, openFile, refresh };
}
