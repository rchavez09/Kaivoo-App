/**
 * ProjectAttachments — Sprint 25 P15
 *
 * Attachments section for the project detail page.
 * Wraps FileDropZone + FileList with the useAttachments hook.
 */

import { Paperclip } from 'lucide-react';
import { useAttachments } from '@/hooks/useAttachments';
import FileDropZone from '@/components/attachments/FileDropZone';
import FileList from '@/components/attachments/FileList';

interface ProjectAttachmentsProps {
  projectId: string;
}

const ProjectAttachments = ({ projectId }: ProjectAttachmentsProps) => {
  const { files, isLoading, uploading, upload, remove, rename, getUrl } = useAttachments(projectId);

  return (
    <div className="widget-card mt-8">
      <div className="widget-header">
        <h2 className="widget-title">
          <Paperclip className="mr-1 inline h-4 w-4" />
          Attachments
        </h2>
        <span className="text-xs text-muted-foreground">
          {files.length > 0 && `${files.length} file${files.length === 1 ? '' : 's'}`}
        </span>
      </div>

      <FileList files={files} onDelete={remove} onRename={rename} getUrl={getUrl} isLoading={isLoading} />

      <div className={files.length > 0 ? 'mt-3' : undefined}>
        <FileDropZone onUpload={upload} uploading={uploading} />
      </div>
    </div>
  );
};

export default ProjectAttachments;
