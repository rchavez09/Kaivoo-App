/**
 * Knowledge Vault — Sprint 22 P6/P7/P8
 *
 * Barrel exports for the vault module.
 */

export type { VaultNode, VaultAdapter } from './types';
export {
  VAULT_FOLDERS,
  ROOT_FOLDERS,
  sanitizeName,
  getJournalFolderPath,
  getJournalFilePath,
  getTopicFolderPath,
  getTopicPageFolderPath,
  getCaptureFilePath,
} from './types';
export { LocalVaultAdapter } from './local-vault';
export { VirtualVaultAdapter } from './virtual-vault';
export {
  journalToMarkdown,
  captureToMarkdown,
  topicToMarkdown,
  topicPageToMarkdown,
  projectNoteToMarkdown,
  exportJournals,
  exportCaptures,
  exportTopics,
  exportAll,
} from './export';
export type { ExportResult } from './export';
