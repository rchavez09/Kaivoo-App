/**
 * Vault Types — Sprint 22 P6
 *
 * Type definitions, constants, and path helpers for the Knowledge Vault
 * file structure. Used by both LocalVaultAdapter (desktop) and
 * VirtualVaultAdapter (web).
 */

// ═══════════════════════════════════════════════════════
// VaultNode — tree structure for the file browser
// ═══════════════════════════════════════════════════════

export interface VaultNode {
  name: string;
  /** Path relative to vault root (e.g., 'Journal/2026/03 - March') */
  path: string;
  isDirectory: boolean;
  children?: VaultNode[];
  size?: number;
  modifiedAt?: Date;
  /** Entity reference — links virtual nodes back to DB entities */
  entityRef?: {
    type: 'journal' | 'capture' | 'topic' | 'topic_page' | 'project' | 'project_note';
    id: string;
    /** Parent entity ID (e.g., topicId for topic_page, projectId for project_note) */
    parentId?: string;
  };
}

// ═══════════════════════════════════════════════════════
// VaultAdapter interface
// ═══════════════════════════════════════════════════════

export interface VaultAdapter {
  /** Create root folder structure (Journal/, Projects/, Library/, Inbox/) */
  initialize(): Promise<void>;

  /** Get the full vault tree for file browser rendering */
  getTree(): Promise<VaultNode>;

  /** List contents of a single folder (relative path) */
  listFolder(relativePath: string): Promise<VaultNode[]>;

  /** Check if a path exists in the vault */
  exists(relativePath: string): Promise<boolean>;

  /** Read file contents */
  readFile(relativePath: string): Promise<string>;

  /** Write file contents (creates parent dirs as needed) */
  writeFile(relativePath: string, content: string): Promise<void>;

  /** Create a directory */
  createDir(relativePath: string): Promise<void>;

  /** Delete a file or folder */
  deleteNode(relativePath: string): Promise<void>;
}

// ═══════════════════════════════════════════════════════
// Folder Structure Constants
// ═══════════════════════════════════════════════════════

export const VAULT_FOLDERS = {
  TOPICS: 'Topics',
  PROJECTS: 'Projects',
  JOURNAL: 'Journal',
  LIBRARY: 'Library',
  INBOX: 'Inbox',
} as const;

export const ROOT_FOLDERS = [
  VAULT_FOLDERS.TOPICS,
  VAULT_FOLDERS.PROJECTS,
  VAULT_FOLDERS.JOURNAL,
  VAULT_FOLDERS.LIBRARY,
  VAULT_FOLDERS.INBOX,
] as const;

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const;

// ═══════════════════════════════════════════════════════
// Path Helpers
// ═══════════════════════════════════════════════════════

/** Sanitize a name for use as a folder/file name */
export function sanitizeName(name: string): string {
  // eslint-disable-next-line no-control-regex
  return (
    name
      .replace(/[<>:"/\\|?*\x00-\x1f]/g, '')
      .replace(/\s+/g, ' ')
      .trim() || 'Untitled'
  );
}

/** Journal folder path for a date: Journal/2026/03 - March */
export function getJournalFolderPath(date: string): string {
  const d = new Date(date + 'T00:00:00'); // Avoid timezone shift
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const monthName = MONTH_NAMES[d.getMonth()];
  return `${VAULT_FOLDERS.JOURNAL}/${year}/${month} - ${monthName}`;
}

/** Journal file path for a date: Journal/2026/03 - March/2026-03-02.md */
export function getJournalFilePath(date: string): string {
  return `${getJournalFolderPath(date)}/${date}.md`;
}

/** Topic folder path: Topics/{topicName} */
export function getTopicFolderPath(topicName: string): string {
  return `${VAULT_FOLDERS.TOPICS}/${sanitizeName(topicName)}`;
}

/** Topic page folder path: Topics/{topicName}/{pageName} */
export function getTopicPageFolderPath(topicName: string, pageName: string): string {
  return `${VAULT_FOLDERS.TOPICS}/${sanitizeName(topicName)}/${sanitizeName(pageName)}`;
}

/** Project folder path: Projects/{projectName} */
export function getProjectFolderPath(projectName: string): string {
  return `${VAULT_FOLDERS.PROJECTS}/${sanitizeName(projectName)}`;
}

/** Capture file path: Inbox/capture-{date}-{shortId}.md */
export function getCaptureFilePath(date: string, captureId: string): string {
  const shortId = captureId.slice(0, 8);
  return `${VAULT_FOLDERS.INBOX}/capture-${date}-${shortId}.md`;
}
