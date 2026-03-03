/**
 * Virtual Vault Adapter — Sprint 22 P6
 *
 * Builds a virtual vault tree from database entities for web mode.
 * No real filesystem — the tree is computed from DataAdapter queries.
 * Each VaultNode carries an entityRef linking back to its DB entity.
 */

import type { JournalEntry, Capture, Topic, TopicPage, Project } from '@/types';
import type { DataAdapter } from '../adapters/types';
import type { VaultAdapter, VaultNode } from './types';
import {
  VAULT_FOLDERS,
  ROOT_FOLDERS,
  getJournalFolderPath,
  getTopicFolderPath,
  getProjectFolderPath,
  getCaptureFilePath,
  sanitizeName,
} from './types';
import { journalToMarkdown, captureToMarkdown, topicToMarkdown, topicPageToMarkdown } from './export';

interface CachedData {
  tree: VaultNode;
  journals: JournalEntry[];
  captures: Capture[];
  topics: Topic[];
  topicPages: TopicPage[];
  topicNames: Map<string, string>;
}

export class VirtualVaultAdapter implements VaultAdapter {
  private cache: CachedData | null = null;

  constructor(private dataAdapter: DataAdapter | null) {}

  /** Update the data adapter reference (e.g., when user logs in/out). */
  setDataAdapter(dataAdapter: DataAdapter | null): void {
    this.dataAdapter = dataAdapter;
    this.cache = null; // Invalidate cache on adapter change
  }

  async initialize(): Promise<void> {
    // Virtual vault has no filesystem — nothing to create
  }

  /** Invalidate the cached tree (call when underlying data changes). */
  invalidateCache(): void {
    this.cache = null;
  }

  private async ensureCache(): Promise<CachedData | null> {
    if (this.cache) return this.cache;
    if (!this.dataAdapter) return null;
    this.cache = await buildTreeWithData(this.dataAdapter);
    return this.cache;
  }

  async getTree(): Promise<VaultNode> {
    const cached = await this.ensureCache();
    return cached?.tree ?? buildEmptyTree();
  }

  async listFolder(relativePath: string): Promise<VaultNode[]> {
    const tree = await this.getTree();
    if (!relativePath || relativePath === '/') return tree.children ?? [];
    return findNode(tree, relativePath)?.children ?? [];
  }

  async exists(relativePath: string): Promise<boolean> {
    const tree = await this.getTree();
    return findNode(tree, relativePath) !== null;
  }

  async readFile(relativePath: string): Promise<string> {
    const cached = await this.ensureCache();
    if (!cached) return '';

    const node = findNode(cached.tree, relativePath);
    if (!node?.entityRef) return '';

    const { type, id } = node.entityRef;

    switch (type) {
      case 'journal': {
        const entry = cached.journals.find((e) => e.id === id);
        return entry ? journalToMarkdown(entry, cached.topicNames) : '';
      }
      case 'capture': {
        const capture = cached.captures.find((c) => c.id === id);
        return capture ? captureToMarkdown(capture, cached.topicNames) : '';
      }
      case 'topic': {
        const topic = cached.topics.find((t) => t.id === id);
        return topic ? topicToMarkdown(topic) : '';
      }
      case 'topic_page': {
        const page = cached.topicPages.find((p) => p.id === id);
        return page ? topicPageToMarkdown(page) : '';
      }
      default:
        return '';
    }
  }

  async writeFile(): Promise<void> {
    // No-op — writes go through DataAdapter
  }

  async createDir(): Promise<void> {
    // No-op — structure is derived from entities
  }

  async deleteNode(): Promise<void> {
    // No-op — deletes go through DataAdapter
  }
}

// ═══════════════════════════════════════════════════════
// Tree Builders (pure functions)
// ═══════════════════════════════════════════════════════

function buildEmptyTree(): VaultNode {
  return {
    name: 'Vault',
    path: '',
    isDirectory: true,
    children: ROOT_FOLDERS.map((name) => ({
      name,
      path: name,
      isDirectory: true,
      children: [],
    })),
  };
}

async function buildTreeWithData(data: DataAdapter): Promise<CachedData> {
  const [journals, captures, topics, topicPages, projects] = await Promise.all([
    data.journalEntries.fetchAll(),
    data.captures.fetchAll(),
    data.topics.fetchAll(),
    data.topicPages.fetchAll(),
    data.projects.fetchAll(),
  ]);
  const topicNames = new Map(topics.map((t) => [t.id, t.name]));
  const tree = buildTree(journals, captures, topics, topicPages, projects);
  return { tree, journals, captures, topics, topicPages, topicNames };
}

function buildTree(
  journals: JournalEntry[],
  captures: Capture[],
  topics: Topic[],
  topicPages: TopicPage[],
  projects: Project[],
): VaultNode {

  // ─── Journal tree: Journal/YYYY/MM - MonthName/date.md ───
  const journalByFolder = new Map<string, VaultNode[]>();
  for (const entry of journals) {
    const folderPath = getJournalFolderPath(entry.date);
    if (!journalByFolder.has(folderPath)) journalByFolder.set(folderPath, []);
    journalByFolder.get(folderPath)!.push({
      name: `${entry.date}.md`,
      path: `${folderPath}/${entry.date}.md`,
      isDirectory: false,
      modifiedAt: entry.updatedAt,
      entityRef: { type: 'journal', id: entry.id },
    });
  }
  const journalNode = buildJournalTree(journalByFolder);

  // ─── Topics tree: Topics/{topicName}/{pageName} ───
  const topicsChildren: VaultNode[] = [];

  for (const topic of topics) {
    const topicPath = getTopicFolderPath(topic.name);
    const children: VaultNode[] = [];

    // Topic pages as subfolders
    for (const page of topicPages.filter((p) => p.topicId === topic.id)) {
      children.push({
        name: sanitizeName(page.name),
        path: `${topicPath}/${sanitizeName(page.name)}`,
        isDirectory: true,
        children: [],
        entityRef: { type: 'topic_page', id: page.id, parentId: topic.id },
      });
    }

    topicsChildren.push({
      name: sanitizeName(topic.name),
      path: topicPath,
      isDirectory: true,
      children,
      entityRef: { type: 'topic', id: topic.id },
    });
  }

  // ─── Projects tree: Projects/{projectName} ───
  const projectsChildren: VaultNode[] = [];

  for (const project of projects) {
    const projectPath = getProjectFolderPath(project.name);
    projectsChildren.push({
      name: sanitizeName(project.name),
      path: projectPath,
      isDirectory: true,
      children: [],
      entityRef: { type: 'project', id: project.id },
    });
  }

  // ─── Inbox: captures as .md files ───
  const inboxChildren: VaultNode[] = captures.map((c) => ({
    name: `capture-${c.date}-${c.id.slice(0, 8)}.md`,
    path: getCaptureFilePath(c.date, c.id),
    isDirectory: false,
    modifiedAt: c.createdAt,
    entityRef: { type: 'capture' as const, id: c.id },
  }));

  return {
    name: 'Vault',
    path: '',
    isDirectory: true,
    children: [
      {
        name: VAULT_FOLDERS.TOPICS,
        path: VAULT_FOLDERS.TOPICS,
        isDirectory: true,
        children: topicsChildren,
      },
      {
        name: VAULT_FOLDERS.PROJECTS,
        path: VAULT_FOLDERS.PROJECTS,
        isDirectory: true,
        children: projectsChildren,
      },
      journalNode,
      {
        name: VAULT_FOLDERS.LIBRARY,
        path: VAULT_FOLDERS.LIBRARY,
        isDirectory: true,
        children: [],
      },
      {
        name: VAULT_FOLDERS.INBOX,
        path: VAULT_FOLDERS.INBOX,
        isDirectory: true,
        children: inboxChildren,
      },
    ],
  };
}

function buildJournalTree(folderMap: Map<string, VaultNode[]>): VaultNode {
  const years = new Map<string, Map<string, VaultNode[]>>();

  for (const [folderPath, files] of folderMap) {
    const parts = folderPath.split('/');
    const year = parts[1];
    const monthFolder = parts[2];
    if (!years.has(year)) years.set(year, new Map());
    years.get(year)!.set(monthFolder, files);
  }

  const yearNodes: VaultNode[] = [];
  for (const [year, months] of [...years].sort((a, b) => b[0].localeCompare(a[0]))) {
    const monthNodes: VaultNode[] = [];
    for (const [monthFolder, files] of [...months].sort((a, b) => b[0].localeCompare(a[0]))) {
      monthNodes.push({
        name: monthFolder,
        path: `${VAULT_FOLDERS.JOURNAL}/${year}/${monthFolder}`,
        isDirectory: true,
        children: files.sort((a, b) => b.name.localeCompare(a.name)),
      });
    }
    yearNodes.push({
      name: year,
      path: `${VAULT_FOLDERS.JOURNAL}/${year}`,
      isDirectory: true,
      children: monthNodes,
    });
  }

  return {
    name: VAULT_FOLDERS.JOURNAL,
    path: VAULT_FOLDERS.JOURNAL,
    isDirectory: true,
    children: yearNodes,
  };
}

function findNode(root: VaultNode, path: string): VaultNode | null {
  if (root.path === path) return root;
  if (!root.children) return null;
  for (const child of root.children) {
    const found = findNode(child, path);
    if (found) return found;
  }
  return null;
}
