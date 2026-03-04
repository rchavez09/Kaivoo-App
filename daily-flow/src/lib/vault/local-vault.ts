/**
 * Local Vault Adapter — Sprint 22 P6
 *
 * Desktop (Tauri) implementation of the vault file system.
 * Creates and manages real folders/files on disk via @tauri-apps/plugin-fs.
 */

import type { VaultAdapter, VaultNode } from './types';
import { ROOT_FOLDERS } from './types';

export class LocalVaultAdapter implements VaultAdapter {
  private constructor(private rootPath: string) {}

  /** The vault root directory path. */
  get root(): string {
    return this.rootPath;
  }

  /** Factory: resolve the vault root. Checks for user-selected path from setup wizard,
   *  falling back to the Tauri app data directory. */
  static async create(): Promise<LocalVaultAdapter> {
    const customPath = localStorage.getItem('kaivoo-vault-path');
    if (customPath) {
      return new LocalVaultAdapter(customPath);
    }
    const { appDataDir } = await import('@tauri-apps/api/path');
    const root = await appDataDir();
    return new LocalVaultAdapter(`${root}/vault`);
  }

  async initialize(): Promise<void> {
    const { mkdir, exists } = await import('@tauri-apps/plugin-fs');

    if (!(await exists(this.rootPath))) {
      await mkdir(this.rootPath, { recursive: true });
    }

    for (const folder of ROOT_FOLDERS) {
      const folderPath = `${this.rootPath}/${folder}`;
      if (!(await exists(folderPath))) {
        await mkdir(folderPath, { recursive: true });
      }
    }
  }

  async getTree(): Promise<VaultNode> {
    return this.buildTreeRecursive(this.rootPath, '');
  }

  async listFolder(relativePath: string): Promise<VaultNode[]> {
    const { readDir } = await import('@tauri-apps/plugin-fs');
    try {
      const entries = await readDir(this.resolve(relativePath));
      return entries
        .filter((e) => !e.name.startsWith('.'))
        .map((e) => ({
          name: e.name,
          path: relativePath ? `${relativePath}/${e.name}` : e.name,
          isDirectory: e.isDirectory,
        }))
        .sort(sortNodes);
    } catch {
      return [];
    }
  }

  async exists(relativePath: string): Promise<boolean> {
    const { exists } = await import('@tauri-apps/plugin-fs');
    return exists(this.resolve(relativePath));
  }

  async readFile(relativePath: string): Promise<string> {
    const { readTextFile } = await import('@tauri-apps/plugin-fs');
    return readTextFile(this.resolve(relativePath));
  }

  async writeFile(relativePath: string, content: string): Promise<void> {
    const { writeTextFile, mkdir, exists } = await import('@tauri-apps/plugin-fs');

    // Ensure parent directory exists
    const parts = relativePath.split('/');
    if (parts.length > 1) {
      const parentDir = this.resolve(parts.slice(0, -1).join('/'));
      if (!(await exists(parentDir))) {
        await mkdir(parentDir, { recursive: true });
      }
    }

    await writeTextFile(this.resolve(relativePath), content);
  }

  async createDir(relativePath: string): Promise<void> {
    const { mkdir } = await import('@tauri-apps/plugin-fs');
    await mkdir(this.resolve(relativePath), { recursive: true });
  }

  async deleteNode(relativePath: string): Promise<void> {
    const { remove } = await import('@tauri-apps/plugin-fs');
    await remove(this.resolve(relativePath), { recursive: true });
  }

  // ─── Private Helpers ───

  private resolve(relativePath: string): string {
    if (!relativePath) return this.rootPath;
    // Sanitize: reject path traversal attempts (../ or absolute paths)
    const segments = relativePath.split('/').filter(Boolean);
    if (segments.some((s) => s === '..' || s === '.')) {
      throw new Error('Path traversal not allowed');
    }
    const resolved = `${this.rootPath}/${segments.join('/')}`;
    if (!resolved.startsWith(this.rootPath + '/')) {
      throw new Error('Path traversal not allowed');
    }
    return resolved;
  }

  private async buildTreeRecursive(fullPath: string, relativePath: string): Promise<VaultNode> {
    const { readDir } = await import('@tauri-apps/plugin-fs');
    const name = relativePath.split('/').pop() || 'Vault';

    let children: VaultNode[] = [];
    try {
      const entries = await readDir(fullPath);
      const sorted = entries.filter((e) => !e.name.startsWith('.')).sort(sortEntries);

      children = await Promise.all(
        sorted.map(async (e) => {
          const childRelative = relativePath ? `${relativePath}/${e.name}` : e.name;
          if (e.isDirectory) {
            return this.buildTreeRecursive(`${fullPath}/${e.name}`, childRelative);
          }
          return { name: e.name, path: childRelative, isDirectory: false };
        }),
      );
    } catch {
      // Directory might not exist yet
    }

    return { name, path: relativePath, isDirectory: true, children };
  }
}

// Directories first, then alphabetical
function sortNodes(a: VaultNode, b: VaultNode): number {
  if (a.isDirectory !== b.isDirectory) return a.isDirectory ? -1 : 1;
  return a.name.localeCompare(b.name);
}

function sortEntries(a: { name: string; isDirectory: boolean }, b: { name: string; isDirectory: boolean }): number {
  if (a.isDirectory !== b.isDirectory) return a.isDirectory ? -1 : 1;
  return a.name.localeCompare(b.name);
}
