/**
 * Vault Export — Sprint 22 P8
 *
 * Converts app entities (journal entries, captures, etc.) to
 * Obsidian-compatible markdown files with YAML frontmatter.
 */

import type { JournalEntry, Capture, Topic, TopicPage, Project, ProjectNote } from '@/types';
import type { VaultAdapter } from './types';
import { getJournalFilePath, getCaptureFilePath, getTopicFolderPath, getTopicPageFolderPath } from './types';

// ═══════════════════════════════════════════════════════
// YAML Frontmatter Serializer
// ═══════════════════════════════════════════════════════

/** Format a Date as ISO-8601 without the trailing Z (local-style, Obsidian standard). */
function formatDate(d: Date): string {
  return d.toISOString().replace('Z', '');
}

/** Escape a user-controlled string for safe YAML value embedding. */
function escapeYaml(value: string): string {
  if (/[\n\r:#{}[\],&*?|>!%@`"']/.test(value) || value.trim() !== value) {
    return `"${value.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n')}"`;
  }
  return value;
}

/** Serialize tags as YAML list: [tag1, tag2] — escapes each tag value. */
function formatTags(tags: string[]): string {
  if (!tags.length) return '[]';
  return `[${tags.map(escapeYaml).join(', ')}]`;
}

/** Build YAML frontmatter block from key-value pairs. Omits undefined/null values.
 *  Values are emitted as-is — caller must escape user-controlled strings via escapeYaml. */
function buildFrontmatter(fields: Record<string, string | number | undefined>): string {
  const lines: string[] = ['---'];
  for (const [key, value] of Object.entries(fields)) {
    if (value === undefined || value === null) continue;
    lines.push(`${key}: ${value}`);
  }
  lines.push('---');
  return lines.join('\n');
}

// ═══════════════════════════════════════════════════════
// Entity → Markdown converters
// ═══════════════════════════════════════════════════════

/** Convert a journal entry to an Obsidian-compatible .md file. */
export function journalToMarkdown(
  entry: JournalEntry,
  topicNames?: Map<string, string>,
): string {
  const topics = entry.topicIds
    .map((id) => topicNames?.get(id) ?? id)
    .filter(Boolean);

  const frontmatter = buildFrontmatter({
    date: entry.date,
    tags: formatTags(entry.tags),
    topics: topics.length ? formatTags(topics) : undefined,
    mood: entry.moodScore ?? undefined,
    created: formatDate(entry.createdAt),
    modified: formatDate(entry.updatedAt),
  });

  const title = entry.label
    ? `# ${entry.label}`
    : `# Journal — ${entry.date}`;

  return `${frontmatter}\n\n${title}\n\n${entry.content}\n`;
}

/** Convert a capture to an Obsidian-compatible .md file. */
export function captureToMarkdown(
  capture: Capture,
  topicNames?: Map<string, string>,
): string {
  const topics = capture.topicIds
    .map((id) => topicNames?.get(id) ?? id)
    .filter(Boolean);

  const frontmatter = buildFrontmatter({
    date: capture.date,
    source: escapeYaml(capture.source),
    tags: formatTags(capture.tags),
    topics: topics.length ? formatTags(topics) : undefined,
    created: formatDate(capture.createdAt),
  });

  return `${frontmatter}\n\n${capture.content}\n`;
}

/** Convert a topic to a README.md for its folder. */
export function topicToMarkdown(topic: Topic): string {
  const frontmatter = buildFrontmatter({
    created: formatDate(topic.createdAt),
  });

  const icon = topic.icon ? `${topic.icon} ` : '';
  const title = `# ${icon}${topic.name}`;
  const desc = topic.description ? `\n\n${topic.description}` : '';

  return `${frontmatter}\n\n${title}${desc}\n`;
}

/** Convert a topic page to a .md file. */
export function topicPageToMarkdown(page: TopicPage): string {
  const frontmatter = buildFrontmatter({
    created: formatDate(page.createdAt),
  });

  const desc = page.description ? `\n\n${page.description}` : '';
  return `${frontmatter}\n\n# ${page.name}${desc}\n`;
}

/** Convert a project note to a .md file. */
export function projectNoteToMarkdown(note: ProjectNote): string {
  const frontmatter = buildFrontmatter({
    created: formatDate(note.createdAt),
    modified: formatDate(note.updatedAt),
  });

  return `${frontmatter}\n\n${note.content}\n`;
}

// ═══════════════════════════════════════════════════════
// Batch export to vault
// ═══════════════════════════════════════════════════════

export interface ExportResult {
  exported: number;
  errors: string[];
}

/** Export all journal entries to the vault as .md files. */
export async function exportJournals(
  entries: JournalEntry[],
  vault: VaultAdapter,
  topicNames: Map<string, string>,
): Promise<ExportResult> {
  let exported = 0;
  const errors: string[] = [];

  for (const entry of entries) {
    try {
      const path = getJournalFilePath(entry.date);
      const content = journalToMarkdown(entry, topicNames);
      await vault.writeFile(path, content);
      exported++;
    } catch (e) {
      errors.push(`Journal ${entry.date}: ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  return { exported, errors };
}

/** Export all captures to the vault as .md files. */
export async function exportCaptures(
  captures: Capture[],
  vault: VaultAdapter,
  topicNames: Map<string, string>,
): Promise<ExportResult> {
  let exported = 0;
  const errors: string[] = [];

  for (const capture of captures) {
    try {
      const path = getCaptureFilePath(capture.date, capture.id);
      const content = captureToMarkdown(capture, topicNames);
      await vault.writeFile(path, content);
      exported++;
    } catch (e) {
      errors.push(`Capture ${capture.id.slice(0, 8)}: ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  return { exported, errors };
}

/** Export all topics (as README.md per folder) and topic pages. */
export async function exportTopics(
  topics: Topic[],
  topicPages: TopicPage[],
  vault: VaultAdapter,
): Promise<ExportResult> {
  let exported = 0;
  const errors: string[] = [];

  for (const topic of topics) {
    try {
      const folderPath = getTopicFolderPath(topic.name);
      await vault.createDir(folderPath);
      await vault.writeFile(`${folderPath}/README.md`, topicToMarkdown(topic));
      exported++;
    } catch (e) {
      errors.push(`Topic "${topic.name}": ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  const topicMap = new Map(topics.map((t) => [t.id, t]));
  for (const page of topicPages) {
    try {
      const topic = topicMap.get(page.topicId);
      if (!topic) continue;
      const pagePath = getTopicPageFolderPath(topic.name, page.name);
      await vault.createDir(pagePath);
      await vault.writeFile(`${pagePath}/README.md`, topicPageToMarkdown(page));
      exported++;
    } catch (e) {
      errors.push(`Page "${page.name}": ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  return { exported, errors };
}

/** Export everything to the vault. */
export async function exportAll(
  data: {
    journals: JournalEntry[];
    captures: Capture[];
    topics: Topic[];
    topicPages: TopicPage[];
  },
  vault: VaultAdapter,
): Promise<ExportResult> {
  const topicNames = new Map(data.topics.map((t) => [t.id, t.name]));
  const results = await Promise.all([
    exportJournals(data.journals, vault, topicNames),
    exportCaptures(data.captures, vault, topicNames),
    exportTopics(data.topics, data.topicPages, vault),
  ]);

  return {
    exported: results.reduce((sum, r) => sum + r.exported, 0),
    errors: results.flatMap((r) => r.errors),
  };
}
