/**
 * Vault Tests — Sprint 22 P10
 *
 * Unit tests for:
 *  - Path helpers (sanitizeName, getJournalFolderPath, etc.)
 *  - Markdown export (journalToMarkdown, captureToMarkdown, etc.)
 *  - VirtualVaultAdapter (tree building from entity data)
 */

import { describe, it, expect, vi } from 'vitest';
import {
  sanitizeName,
  getJournalFolderPath,
  getJournalFilePath,
  getTopicFolderPath,
  getTopicPageFolderPath,
  getCaptureFilePath,
  VAULT_FOLDERS,
} from '../types';
import {
  journalToMarkdown,
  captureToMarkdown,
  topicToMarkdown,
  topicPageToMarkdown,
  projectNoteToMarkdown,
} from '../export';
import { VirtualVaultAdapter } from '../virtual-vault';
import type { DataAdapter } from '../../adapters/types';
import type { JournalEntry, Capture, Topic, TopicPage, Project } from '@/types';

// ═══════════════════════════════════════════════════════
// Path Helpers
// ═══════════════════════════════════════════════════════

describe('sanitizeName', () => {
  it('removes filesystem-unsafe characters', () => {
    expect(sanitizeName('hello<world>')).toBe('helloworld');
    expect(sanitizeName('path/to\\file')).toBe('pathtofile');
    expect(sanitizeName('file:name')).toBe('filename');
    expect(sanitizeName('file"name"')).toBe('filename');
    expect(sanitizeName('file|name?')).toBe('filename');
    expect(sanitizeName('file*name')).toBe('filename');
  });

  it('collapses multiple spaces into one', () => {
    expect(sanitizeName('hello   world')).toBe('hello world');
    expect(sanitizeName('  spaced  out  ')).toBe('spaced out');
  });

  it('returns Untitled for empty or whitespace-only input', () => {
    expect(sanitizeName('')).toBe('Untitled');
    expect(sanitizeName('   ')).toBe('Untitled');
    expect(sanitizeName('***')).toBe('Untitled');
  });

  it('preserves normal characters', () => {
    expect(sanitizeName('My Project 2026')).toBe('My Project 2026');
    expect(sanitizeName('NUWAVE')).toBe('NUWAVE');
    expect(sanitizeName('hello-world_v2')).toBe('hello-world_v2');
  });
});

describe('getJournalFolderPath', () => {
  it('formats date into Journal/YYYY/MM - MonthName', () => {
    expect(getJournalFolderPath('2026-01-15')).toBe('Journal/2026/01 - January');
    expect(getJournalFolderPath('2026-03-02')).toBe('Journal/2026/03 - March');
    expect(getJournalFolderPath('2026-12-31')).toBe('Journal/2026/12 - December');
  });

  it('pads single-digit months', () => {
    expect(getJournalFolderPath('2026-02-01')).toBe('Journal/2026/02 - February');
    expect(getJournalFolderPath('2026-09-15')).toBe('Journal/2026/09 - September');
  });
});

describe('getJournalFilePath', () => {
  it('appends date.md to folder path', () => {
    expect(getJournalFilePath('2026-03-02')).toBe('Journal/2026/03 - March/2026-03-02.md');
    expect(getJournalFilePath('2026-01-01')).toBe('Journal/2026/01 - January/2026-01-01.md');
  });
});

describe('getTopicFolderPath', () => {
  it('maps topic name to Topics/{name}', () => {
    expect(getTopicFolderPath('NUWAVE')).toBe('Topics/NUWAVE');
    expect(getTopicFolderPath('Personal')).toBe('Topics/Personal');
  });

  it('sanitizes unsafe characters', () => {
    expect(getTopicFolderPath('My Project: v2')).toBe('Topics/My Project v2');
  });
});

describe('getTopicPageFolderPath', () => {
  it('nests page under topic', () => {
    expect(getTopicPageFolderPath('NUWAVE', 'Branding')).toBe('Topics/NUWAVE/Branding');
    expect(getTopicPageFolderPath('Personal', 'Fitness')).toBe('Topics/Personal/Fitness');
  });
});

describe('getCaptureFilePath', () => {
  it('formats as Inbox/capture-{date}-{shortId}.md', () => {
    const path = getCaptureFilePath('2026-03-02', 'abc12345-6789-0000-0000-000000000000');
    expect(path).toBe('Inbox/capture-2026-03-02-abc12345.md');
  });

  it('truncates ID to 8 characters', () => {
    const path = getCaptureFilePath('2026-01-01', 'deadbeef-long-uuid-string');
    expect(path).toBe('Inbox/capture-2026-01-01-deadbeef.md');
  });
});

// ═══════════════════════════════════════════════════════
// Markdown Export
// ═══════════════════════════════════════════════════════

describe('journalToMarkdown', () => {
  const entry: JournalEntry = {
    id: 'j1',
    date: '2026-03-02',
    content: 'Today was productive. Finished the vault module.',
    tags: ['work', 'coding'],
    topicIds: ['t1', 't2'],
    moodScore: 4,
    label: 'Evening Reflection',
    createdAt: new Date('2026-03-02T20:00:00Z'),
    updatedAt: new Date('2026-03-02T21:30:00Z'),
    timestamp: new Date('2026-03-02T20:00:00Z'),
  };

  it('includes YAML frontmatter with date, tags, mood', () => {
    const md = journalToMarkdown(entry);
    expect(md).toContain('---');
    expect(md).toContain('date: 2026-03-02');
    expect(md).toContain('tags: [work, coding]');
    expect(md).toContain('mood: 4');
  });

  it('includes created and modified timestamps', () => {
    const md = journalToMarkdown(entry);
    expect(md).toMatch(/created: 2026-03-02T20:00:00/);
    expect(md).toMatch(/modified: 2026-03-02T21:30:00/);
  });

  it('uses label as title when available', () => {
    const md = journalToMarkdown(entry);
    expect(md).toContain('# Evening Reflection');
  });

  it('falls back to date-based title when no label', () => {
    const noLabel = { ...entry, label: undefined };
    const md = journalToMarkdown(noLabel);
    expect(md).toContain('# Journal — 2026-03-02');
  });

  it('includes content body', () => {
    const md = journalToMarkdown(entry);
    expect(md).toContain('Today was productive. Finished the vault module.');
  });

  it('resolves topic IDs to names when map provided', () => {
    const topicNames = new Map([
      ['t1', 'NUWAVE'],
      ['t2', 'Personal'],
    ]);
    const md = journalToMarkdown(entry, topicNames);
    expect(md).toContain('topics: [NUWAVE, Personal]');
  });

  it('omits topics field when no topicIds', () => {
    const noTopics = { ...entry, topicIds: [] };
    const md = journalToMarkdown(noTopics);
    expect(md).not.toContain('topics:');
  });

  it('omits mood when undefined', () => {
    const noMood = { ...entry, moodScore: undefined };
    const md = journalToMarkdown(noMood);
    expect(md).not.toContain('mood:');
  });
});

describe('journalToMarkdown — YAML escaping', () => {
  it('escapes tags containing special YAML characters', () => {
    const entry: JournalEntry = {
      id: 'j-esc',
      date: '2026-03-02',
      content: 'Test',
      tags: ['normal', 'has: colon', 'has "quotes"'],
      topicIds: [],
      createdAt: new Date('2026-03-02T20:00:00Z'),
      updatedAt: new Date('2026-03-02T21:30:00Z'),
      timestamp: new Date('2026-03-02T20:00:00Z'),
    };
    const md = journalToMarkdown(entry);
    expect(md).toContain('tags: [normal, "has: colon", "has \\"quotes\\""]');
  });
});

describe('captureToMarkdown', () => {
  const capture: Capture = {
    id: 'c1',
    content: 'Quick thought about architecture patterns.',
    source: 'quick',
    date: '2026-03-02',
    tags: ['idea'],
    topicIds: [],
    createdAt: new Date('2026-03-02T14:30:00Z'),
  };

  it('includes frontmatter with date, source, tags', () => {
    const md = captureToMarkdown(capture);
    expect(md).toContain('---');
    expect(md).toContain('date: 2026-03-02');
    expect(md).toContain('source: quick');
    expect(md).toContain('tags: [idea]');
  });

  it('includes content body', () => {
    const md = captureToMarkdown(capture);
    expect(md).toContain('Quick thought about architecture patterns.');
  });
});

describe('topicToMarkdown', () => {
  it('generates README with icon, name, description', () => {
    const topic: Topic = {
      id: 't1',
      name: 'NUWAVE',
      description: 'Main project workspace',
      icon: '🚀',
      createdAt: new Date('2026-01-01'),
    };
    const md = topicToMarkdown(topic);
    expect(md).toContain('# 🚀 NUWAVE');
    expect(md).toContain('Main project workspace');
    expect(md).toContain('---');
  });

  it('handles topic without icon or description', () => {
    const topic: Topic = {
      id: 't2',
      name: 'Personal',
      createdAt: new Date('2026-01-01'),
    };
    const md = topicToMarkdown(topic);
    expect(md).toContain('# Personal');
    expect(md).not.toContain('undefined');
  });
});

describe('topicPageToMarkdown', () => {
  it('generates page with name and description', () => {
    const page: TopicPage = {
      id: 'p1',
      topicId: 't1',
      name: 'Branding',
      description: 'Brand guidelines and assets',
      createdAt: new Date('2026-02-01'),
    };
    const md = topicPageToMarkdown(page);
    expect(md).toContain('# Branding');
    expect(md).toContain('Brand guidelines and assets');
  });
});

describe('projectNoteToMarkdown', () => {
  it('generates note with created and modified', () => {
    const md = projectNoteToMarkdown({
      id: 'n1',
      projectId: 'p1',
      content: 'Sprint 22 progress notes.',
      createdAt: new Date('2026-03-01'),
      updatedAt: new Date('2026-03-02'),
    });
    expect(md).toContain('---');
    expect(md).toContain('Sprint 22 progress notes.');
    expect(md).toMatch(/created:/);
    expect(md).toMatch(/modified:/);
  });
});

// ═══════════════════════════════════════════════════════
// VirtualVaultAdapter
// ═══════════════════════════════════════════════════════

function createMockDataAdapter(overrides?: {
  journals?: JournalEntry[];
  captures?: Capture[];
  topics?: Topic[];
  topicPages?: TopicPage[];
  projects?: Project[];
}): DataAdapter {
  const journals = overrides?.journals ?? [];
  const captures = overrides?.captures ?? [];
  const topics = overrides?.topics ?? [];
  const topicPages = overrides?.topicPages ?? [];
  const projects = overrides?.projects ?? [];

  return {
    initialize: vi.fn(),
    dispose: vi.fn(),
    journalEntries: { fetchAll: vi.fn().mockResolvedValue(journals) },
    captures: { fetchAll: vi.fn().mockResolvedValue(captures) },
    topics: { fetchAll: vi.fn().mockResolvedValue(topics) },
    topicPages: { fetchAll: vi.fn().mockResolvedValue(topicPages) },
    projects: { fetchAll: vi.fn().mockResolvedValue(projects) },
    // Stub remaining adapters (not used by VirtualVaultAdapter.getTree)
    tasks: { fetchAll: vi.fn().mockResolvedValue([]) },
    subtasks: { fetchAll: vi.fn().mockResolvedValue([]) },
    tags: { fetchAll: vi.fn().mockResolvedValue([]) },
    routines: { fetchAll: vi.fn().mockResolvedValue([]) },
    routineGroups: { fetchAll: vi.fn().mockResolvedValue([]) },
    routineCompletions: { fetchAll: vi.fn().mockResolvedValue([]) },
    habits: { fetchAll: vi.fn().mockResolvedValue([]) },
    habitCompletions: { fetchAll: vi.fn().mockResolvedValue([]) },
    meetings: { fetchAll: vi.fn().mockResolvedValue([]) },
    projectNotes: { fetchAll: vi.fn().mockResolvedValue([]) },
  } as unknown as DataAdapter;
}

describe('VirtualVaultAdapter', () => {
  it('returns empty tree with 5 root folders when no data adapter', async () => {
    const vault = new VirtualVaultAdapter(null);
    const tree = await vault.getTree();

    expect(tree.name).toBe('Vault');
    expect(tree.isDirectory).toBe(true);
    expect(tree.children).toHaveLength(5);
    expect(tree.children!.map((c) => c.name)).toEqual([
      VAULT_FOLDERS.TOPICS,
      VAULT_FOLDERS.PROJECTS,
      VAULT_FOLDERS.JOURNAL,
      VAULT_FOLDERS.LIBRARY,
      VAULT_FOLDERS.INBOX,
    ]);
  });

  it('returns empty tree with 5 root folders when data adapter has no entities', async () => {
    const vault = new VirtualVaultAdapter(createMockDataAdapter());
    const tree = await vault.getTree();

    expect(tree.children).toHaveLength(5);
    const journal = tree.children!.find((c) => c.name === VAULT_FOLDERS.JOURNAL)!;
    expect(journal.children).toHaveLength(0);
  });

  it('builds journal tree from journal entries', async () => {
    const journals: JournalEntry[] = [
      {
        id: 'j1',
        date: '2026-03-01',
        content: 'Day 1',
        tags: [],
        topicIds: [],
        createdAt: new Date(),
        updatedAt: new Date('2026-03-01T20:00:00Z'),
        timestamp: new Date(),
      },
      {
        id: 'j2',
        date: '2026-03-02',
        content: 'Day 2',
        tags: [],
        topicIds: [],
        createdAt: new Date(),
        updatedAt: new Date('2026-03-02T20:00:00Z'),
        timestamp: new Date(),
      },
      {
        id: 'j3',
        date: '2026-02-15',
        content: 'Feb entry',
        tags: [],
        topicIds: [],
        createdAt: new Date(),
        updatedAt: new Date('2026-02-15T20:00:00Z'),
        timestamp: new Date(),
      },
    ];

    const vault = new VirtualVaultAdapter(createMockDataAdapter({ journals }));
    const tree = await vault.getTree();

    const journal = tree.children!.find((c) => c.name === VAULT_FOLDERS.JOURNAL)!;
    expect(journal.children).toHaveLength(1); // 1 year: 2026
    expect(journal.children![0].name).toBe('2026');
    expect(journal.children![0].children).toHaveLength(2); // 2 months: March, February

    // Most recent month first
    const march = journal.children![0].children![0];
    expect(march.name).toBe('03 - March');
    expect(march.children).toHaveLength(2); // 2 entries

    const feb = journal.children![0].children![1];
    expect(feb.name).toBe('02 - February');
    expect(feb.children).toHaveLength(1);
  });

  it('maps topics to Topics/ folders with child pages', async () => {
    const topics: Topic[] = [
      { id: 't1', name: 'NUWAVE', createdAt: new Date() },
      { id: 't2', name: 'Personal', createdAt: new Date() },
    ];
    const topicPages: TopicPage[] = [
      { id: 'p1', topicId: 't1', name: 'Branding', createdAt: new Date() },
      { id: 'p2', topicId: 't1', name: 'Engineering', createdAt: new Date() },
    ];

    const vault = new VirtualVaultAdapter(createMockDataAdapter({ topics, topicPages }));
    const tree = await vault.getTree();

    const topicsNode = tree.children!.find((c) => c.name === VAULT_FOLDERS.TOPICS)!;
    expect(topicsNode.children).toHaveLength(2);

    const nuwave = topicsNode.children!.find((c) => c.name === 'NUWAVE')!;
    expect(nuwave.entityRef).toEqual({ type: 'topic', id: 't1' });
    expect(nuwave.children).toHaveLength(2);
    expect(nuwave.children![0].name).toBe('Branding');
    expect(nuwave.children![0].entityRef).toEqual({ type: 'topic_page', id: 'p1', parentId: 't1' });
  });

  it('maps captures to Inbox/ files', async () => {
    const captures: Capture[] = [
      {
        id: 'abc12345-rest-of-uuid',
        content: 'Quick thought',
        source: 'quick',
        date: '2026-03-02',
        tags: [],
        topicIds: [],
        createdAt: new Date('2026-03-02T14:30:00Z'),
      },
    ];

    const vault = new VirtualVaultAdapter(createMockDataAdapter({ captures }));
    const tree = await vault.getTree();

    const inbox = tree.children!.find((c) => c.name === VAULT_FOLDERS.INBOX)!;
    expect(inbox.children).toHaveLength(1);
    expect(inbox.children![0].name).toBe('capture-2026-03-02-abc12345.md');
    expect(inbox.children![0].entityRef).toEqual({ type: 'capture', id: 'abc12345-rest-of-uuid' });
  });

  it('places standalone projects under Projects/ root', async () => {
    const projects: Project[] = [
      {
        id: 'proj1',
        name: 'Kaivoo v2',
        status: 'active' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    const vault = new VirtualVaultAdapter(createMockDataAdapter({ projects }));
    const tree = await vault.getTree();

    const projectsNode = tree.children!.find((c) => c.name === VAULT_FOLDERS.PROJECTS)!;
    expect(projectsNode.children).toHaveLength(1);
    expect(projectsNode.children![0].name).toBe('Kaivoo v2');
    expect(projectsNode.children![0].entityRef).toEqual({ type: 'project', id: 'proj1' });
  });

  it('places topic-linked projects under Projects/ (flat)', async () => {
    const topics: Topic[] = [{ id: 't1', name: 'NUWAVE', createdAt: new Date() }];
    const projects: Project[] = [
      {
        id: 'proj1',
        name: 'Rebrand',
        topicId: 't1',
        status: 'active' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    const vault = new VirtualVaultAdapter(createMockDataAdapter({ topics, projects }));
    const tree = await vault.getTree();

    // Topic goes under Topics/
    const topicsNode = tree.children!.find((c) => c.name === VAULT_FOLDERS.TOPICS)!;
    expect(topicsNode.children).toHaveLength(1);
    expect(topicsNode.children![0].name).toBe('NUWAVE');

    // Project goes under Projects/ (flat, regardless of topicId)
    const projectsNode = tree.children!.find((c) => c.name === VAULT_FOLDERS.PROJECTS)!;
    expect(projectsNode.children).toHaveLength(1);
    expect(projectsNode.children![0].name).toBe('Rebrand');
    expect(projectsNode.children![0].entityRef).toEqual({ type: 'project', id: 'proj1' });
  });

  it('listFolder returns children of a path', async () => {
    const topics: Topic[] = [{ id: 't1', name: 'NUWAVE', createdAt: new Date() }];
    const vault = new VirtualVaultAdapter(createMockDataAdapter({ topics }));

    const rootChildren = await vault.listFolder('');
    expect(rootChildren.map((c) => c.name)).toEqual([
      VAULT_FOLDERS.TOPICS,
      VAULT_FOLDERS.PROJECTS,
      VAULT_FOLDERS.JOURNAL,
      VAULT_FOLDERS.LIBRARY,
      VAULT_FOLDERS.INBOX,
    ]);

    const topicsChildren = await vault.listFolder(VAULT_FOLDERS.TOPICS);
    expect(topicsChildren).toHaveLength(1);
    expect(topicsChildren[0].name).toBe('NUWAVE');
  });

  it('exists returns true for existing paths, false for missing', async () => {
    const topics: Topic[] = [{ id: 't1', name: 'NUWAVE', createdAt: new Date() }];
    const vault = new VirtualVaultAdapter(createMockDataAdapter({ topics }));

    expect(await vault.exists(VAULT_FOLDERS.TOPICS)).toBe(true);
    expect(await vault.exists('Topics/NUWAVE')).toBe(true);
    expect(await vault.exists('Topics/NonExistent')).toBe(false);
  });

  it('readFile generates markdown from cached entity data', async () => {
    const journals: JournalEntry[] = [
      {
        id: 'j1',
        date: '2026-03-02',
        content: 'Hello world',
        tags: ['test'],
        topicIds: [],
        createdAt: new Date('2026-03-02T10:00:00Z'),
        updatedAt: new Date('2026-03-02T10:00:00Z'),
        timestamp: new Date(),
      },
    ];
    const mockAdapter = createMockDataAdapter({ journals });
    const vault = new VirtualVaultAdapter(mockAdapter);

    const md = await vault.readFile('Journal/2026/03 - March/2026-03-02.md');
    expect(md).toContain('date: 2026-03-02');
    expect(md).toContain('Hello world');

    // Verify fetchAll was called only once (via getTree cache), not twice
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(mockAdapter.journalEntries.fetchAll).toHaveBeenCalledTimes(1);
  });

  it('readFile returns empty string for non-existent path', async () => {
    const vault = new VirtualVaultAdapter(createMockDataAdapter());
    const md = await vault.readFile('Journal/nonexistent.md');
    expect(md).toBe('');
  });

  it('setDataAdapter updates the data source', async () => {
    const vault = new VirtualVaultAdapter(null);

    // No data → empty tree
    let tree = await vault.getTree();
    expect(tree.children!.find((c) => c.name === VAULT_FOLDERS.TOPICS)!.children).toHaveLength(0);

    // Set data adapter with topics
    const topics: Topic[] = [{ id: 't1', name: 'Work', createdAt: new Date() }];
    vault.setDataAdapter(createMockDataAdapter({ topics }));

    // Now tree should include the topic
    tree = await vault.getTree();
    expect(tree.children!.find((c) => c.name === VAULT_FOLDERS.TOPICS)!.children).toHaveLength(1);
  });
});
