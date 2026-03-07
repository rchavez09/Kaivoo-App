/**
 * EntityAttachments — Sprint 26 P1/P2
 *
 * Generic attachment section for any entity (topic, journal entry, etc.).
 * Wraps FileDropZone + FileList with the useAttachments hook.
 */

import { Paperclip } from 'lucide-react';
import { useAttachments } from '@/hooks/useAttachments';
import FileDropZone from '@/components/attachments/FileDropZone';
import FileList from '@/components/attachments/FileList';

interface EntityAttachmentsProps {
  entityId: string;
  label?: string;
  compact?: boolean;
}

const EntityAttachments = ({ entityId, label = 'Attachments', compact = false }: EntityAttachmentsProps) => {
  const { files, isLoading, uploading, upload, remove, rename, getUrl, openFile } = useAttachments(entityId);

  if (compact) {
    return (
      <div className="space-y-2">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        <FileList
          files={files}
          onDelete={remove}
          onRename={rename}
          getUrl={getUrl}
          onOpen={openFile}
          isLoading={isLoading}
        />
        <FileDropZone onUpload={upload} uploading={uploading} />
      </div>
    );
  }

  return (
    <div className="widget-card">
      <div className="widget-header">
        <h2 className="widget-title">
          <Paperclip className="mr-1 inline h-4 w-4" aria-hidden="true" />
          {label}
        </h2>
        <span className="text-xs text-muted-foreground">
          {files.length > 0 && `${files.length} file${files.length === 1 ? '' : 's'}`}
        </span>
      </div>

      <FileList
        files={files}
        onDelete={remove}
        onRename={rename}
        getUrl={getUrl}
        onOpen={openFile}
        isLoading={isLoading}
      />

      <div className={files.length > 0 ? 'mt-3' : undefined}>
        <FileDropZone onUpload={upload} uploading={uploading} />
      </div>
    </div>
  );
};

export default EntityAttachments;
