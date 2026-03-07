/**
 * Supabase Attachment Adapter — Sprint 25 P14
 *
 * Manages file attachments using Supabase Storage.
 * Files are stored in `attachments/{userId}/{entityId}/` bucket path.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type { AttachmentAdapter, AttachmentInfo } from './types';

const BUCKET = 'attachments';
export class SupabaseAttachmentAdapter implements AttachmentAdapter {
  constructor(
    private supabase: SupabaseClient,
    private userId: string,
  ) {}

  private storagePath(entityId: string, filename?: string): string {
    const base = `${this.userId}/${entityId}`;
    return filename ? `${base}/${filename}` : base;
  }

  async uploadFile(entityId: string, file: File): Promise<AttachmentInfo> {
    // Deduplicate filename
    let filename = file.name;
    const { data: existing } = await this.supabase.storage.from(BUCKET).list(this.storagePath(entityId));
    if (existing?.some((f) => f.name === filename)) {
      const ext = filename.lastIndexOf('.') > 0 ? filename.slice(filename.lastIndexOf('.')) : '';
      const base = ext ? filename.slice(0, -ext.length) : filename;
      filename = `${base}-${Date.now()}${ext}`;
    }

    const path = this.storagePath(entityId, filename);
    const { error } = await this.supabase.storage.from(BUCKET).upload(path, file, {
      contentType: file.type || 'application/octet-stream',
    });
    if (error) throw new Error(`Upload failed: ${error.message}`);

    const { data: urlData } = this.supabase.storage.from(BUCKET).getPublicUrl(path);

    return {
      name: filename,
      size: file.size,
      mimeType: file.type || 'application/octet-stream',
      url: urlData.publicUrl,
      createdAt: new Date(),
    };
  }

  async deleteFile(entityId: string, filename: string): Promise<void> {
    const { error } = await this.supabase.storage.from(BUCKET).remove([this.storagePath(entityId, filename)]);
    if (error) throw new Error(`Delete failed: ${error.message}`);
  }

  async getFileUrl(entityId: string, filename: string): Promise<string> {
    const { data } = this.supabase.storage.from(BUCKET).getPublicUrl(this.storagePath(entityId, filename));
    return data.publicUrl;
  }

  async openFile(entityId: string, filename: string): Promise<void> {
    const url = await this.getFileUrl(entityId, filename);
    window.open(url, '_blank');
  }

  async renameFile(entityId: string, oldName: string, newName: string): Promise<string> {
    // Sanitize: strip path separators and traversal sequences
    const safeName = newName.replace(/[/\\:\0]/g, '_').replace(/^\.+/, '') || 'unnamed';
    const oldPath = this.storagePath(entityId, oldName);
    // Check for collision
    const { data: existing } = await this.supabase.storage.from(BUCKET).list(this.storagePath(entityId));
    if (existing?.some((f) => f.name === safeName)) {
      throw new Error(`A file named "${safeName}" already exists`);
    }
    const newPath = this.storagePath(entityId, safeName);
    const { error } = await this.supabase.storage.from(BUCKET).move(oldPath, newPath);
    if (error) throw new Error(`Rename failed: ${error.message}`);
    return safeName;
  }

  async listFiles(entityId: string): Promise<AttachmentInfo[]> {
    const { data, error } = await this.supabase.storage
      .from(BUCKET)
      .list(this.storagePath(entityId), { sortBy: { column: 'created_at', order: 'desc' } });

    if (error) throw new Error(`List failed: ${error.message}`);
    if (!data) return [];

    return data
      .filter((f) => f.name !== '.emptyFolderPlaceholder')
      .map((f) => {
        const { data: urlData } = this.supabase.storage.from(BUCKET).getPublicUrl(this.storagePath(entityId, f.name));
        return {
          name: f.name,
          size: f.metadata?.size ?? 0,
          mimeType: (f.metadata?.mimetype as string) ?? 'application/octet-stream',
          url: urlData.publicUrl,
          createdAt: f.created_at ? new Date(f.created_at) : new Date(),
        };
      });
  }
}
