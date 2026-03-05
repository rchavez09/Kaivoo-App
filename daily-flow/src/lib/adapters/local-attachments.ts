/**
 * Local Attachment Adapter — Sprint 25 P14
 *
 * Manages file attachments using Tauri filesystem plugin.
 * Files are stored in `.attachments/{entityId}/` within the vault root.
 */

import type { AttachmentAdapter, AttachmentInfo } from './types';

/** Strip path separators, traversal sequences, and leading dots from filenames. */
function sanitizeFilename(name: string): string {
  // Remove path separators and null bytes
  let safe = name.replace(/[/\\:\0]/g, '_');
  // Remove leading dots (hidden files / traversal)
  safe = safe.replace(/^\.+/, '');
  // Fallback for empty result
  if (!safe) safe = 'unnamed';
  // Limit length
  if (safe.length > 200) {
    const ext = safe.lastIndexOf('.') > 0 ? safe.slice(safe.lastIndexOf('.')) : '';
    safe = safe.slice(0, 200 - ext.length) + ext;
  }
  return safe;
}

export class LocalAttachmentAdapter implements AttachmentAdapter {
  constructor(private vaultRoot: string) {}

  private entityDir(entityId: string): string {
    return `${this.vaultRoot}/.attachments/${entityId}`;
  }

  async uploadFile(entityId: string, file: File): Promise<AttachmentInfo> {
    const { mkdir, writeFile, exists } = await import('@tauri-apps/plugin-fs');
    const dir = this.entityDir(entityId);

    // Ensure directory exists
    if (!(await exists(dir))) {
      await mkdir(dir, { recursive: true });
    }

    // Sanitize filename to prevent path traversal
    let filename = sanitizeFilename(file.name);
    const filePath = `${dir}/${filename}`;
    if (await exists(filePath)) {
      const ext = filename.lastIndexOf('.') > 0 ? filename.slice(filename.lastIndexOf('.')) : '';
      const base = ext ? filename.slice(0, -ext.length) : filename;
      filename = `${base}-${Date.now()}${ext}`;
    }

    // Write file bytes
    const buffer = await file.arrayBuffer();
    await writeFile(`${dir}/${filename}`, new Uint8Array(buffer));

    return {
      name: filename,
      size: file.size,
      mimeType: file.type || 'application/octet-stream',
      url: `attachment://${entityId}/${filename}`,
      createdAt: new Date(),
    };
  }

  async deleteFile(entityId: string, filename: string): Promise<void> {
    const { remove } = await import('@tauri-apps/plugin-fs');
    const safe = sanitizeFilename(filename);
    await remove(`${this.entityDir(entityId)}/${safe}`);
  }

  async getFileUrl(entityId: string, filename: string): Promise<string> {
    const { readFile } = await import('@tauri-apps/plugin-fs');
    const safe = sanitizeFilename(filename);
    const data = await readFile(`${this.entityDir(entityId)}/${safe}`);
    const blob = new Blob([data], { type: guessMimeType(safe) });
    return URL.createObjectURL(blob);
  }

  async openFile(entityId: string, filename: string): Promise<void> {
    const { open } = await import('@tauri-apps/plugin-shell');
    const safe = sanitizeFilename(filename);
    await open(`file://${this.entityDir(entityId)}/${safe}`);
  }

  async listFiles(entityId: string): Promise<AttachmentInfo[]> {
    const { readDir, exists, stat } = await import('@tauri-apps/plugin-fs');
    const dir = this.entityDir(entityId);

    if (!(await exists(dir))) return [];

    const entries = await readDir(dir);
    const results: AttachmentInfo[] = [];

    for (const entry of entries) {
      if (entry.isDirectory) continue;
      const filePath = `${dir}/${entry.name}`;
      const info = await stat(filePath);
      results.push({
        name: entry.name,
        size: info.size,
        mimeType: guessMimeType(entry.name),
        url: `attachment://${entityId}/${entry.name}`,
        createdAt: info.mtime ? new Date(info.mtime) : new Date(),
      });
    }

    return results.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
}

function guessMimeType(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase();
  const types: Record<string, string> = {
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    gif: 'image/gif',
    webp: 'image/webp',
    svg: 'image/svg+xml',
    pdf: 'application/pdf',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    txt: 'text/plain',
    md: 'text/markdown',
    csv: 'text/csv',
    json: 'application/json',
  };
  return types[ext ?? ''] ?? 'application/octet-stream';
}
