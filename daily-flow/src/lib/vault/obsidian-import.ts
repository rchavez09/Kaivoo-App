/**
 * Obsidian Import Service — Sprint 23 P6
 *
 * Desktop-only: copies .md files from an Obsidian vault into Kaivoo's
 * Topics/ structure. Non-destructive (source files are never modified).
 */

export interface ImportProgress {
  phase: 'scanning' | 'importing' | 'complete';
  current: number;
  total: number;
  currentFile?: string;
}

export interface ImportResult {
  filesImported: number;
  foldersCreated: number;
  hashtags: string[];
  skipped: number;
  errors: string[];
}

/** Extract inline #hashtags from markdown content (not ## headings) */
export function extractHashtags(content: string): string[] {
  const matches = content.match(/(?:^|\s)#([a-zA-Z][\w-]*)/g);
  if (!matches) return [];
  return [...new Set(matches.map((m) => m.trim().replace(/^#/, '').toLowerCase()))];
}

/** Extract tags from YAML frontmatter */
export function extractFrontmatterTags(content: string): string[] {
  const fmMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (!fmMatch) return [];
  const fm = fmMatch[1];

  // tags: [tag1, tag2]
  const inlineMatch = fm.match(/^tags:\s*\[([^\]]*)\]/m);
  if (inlineMatch) {
    return inlineMatch[1]
      .split(',')
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);
  }

  // tags:\n  - tag1\n  - tag2
  const listMatch = fm.match(/^tags:\s*\n((?:\s+-\s+\S+\n?)*)/m);
  if (listMatch) {
    return listMatch[1].match(/-\s+(\S+)/g)?.map((m) => m.replace(/^-\s+/, '').toLowerCase()) || [];
  }

  return [];
}

interface ScannedFile {
  fullPath: string;
  relativePath: string;
  name: string;
}

/** Recursively scan a directory for .md files */
async function scanDirectory(dirPath: string, relativePath: string = ''): Promise<ScannedFile[]> {
  const { readDir } = await import('@tauri-apps/plugin-fs');
  const entries = await readDir(dirPath);
  const files: ScannedFile[] = [];

  for (const entry of entries) {
    if (entry.name.startsWith('.')) continue;

    const entryRelative = relativePath ? `${relativePath}/${entry.name}` : entry.name;
    const entryFull = `${dirPath}/${entry.name}`;

    if (entry.isDirectory) {
      const subFiles = await scanDirectory(entryFull, entryRelative);
      files.push(...subFiles);
    } else if (entry.name.endsWith('.md')) {
      files.push({ fullPath: entryFull, relativePath: entryRelative, name: entry.name });
    }
  }

  return files;
}

/**
 * Import an Obsidian vault into Kaivoo's Topics/ structure.
 *
 * Each Obsidian folder maps to a subfolder under Topics/.
 * Files are copied (never moved or deleted from the source).
 * Existing files in the destination are skipped.
 */
export async function importObsidianVault(
  obsidianPath: string,
  kaivooVaultPath: string,
  onProgress?: (progress: ImportProgress) => void,
): Promise<ImportResult> {
  const { readTextFile, writeTextFile, mkdir, exists } = await import('@tauri-apps/plugin-fs');

  const result: ImportResult = {
    filesImported: 0,
    foldersCreated: 0,
    hashtags: [],
    skipped: 0,
    errors: [],
  };

  // Phase 1: Scan source vault
  onProgress?.({ phase: 'scanning', current: 0, total: 0 });

  let mdFiles: ScannedFile[];
  try {
    mdFiles = await scanDirectory(obsidianPath);
  } catch (e) {
    result.errors.push(`Failed to scan vault: ${e instanceof Error ? e.message : String(e)}`);
    return result;
  }

  if (mdFiles.length === 0) {
    onProgress?.({ phase: 'complete', current: 0, total: 0 });
    return result;
  }

  // Phase 2: Copy files into Topics/
  const allHashtags = new Set<string>();
  const createdDirs = new Set<string>();

  for (let i = 0; i < mdFiles.length; i++) {
    const file = mdFiles[i];
    onProgress?.({
      phase: 'importing',
      current: i + 1,
      total: mdFiles.length,
      currentFile: file.relativePath,
    });

    try {
      const targetPath = `${kaivooVaultPath}/Topics/${file.relativePath}`;
      const targetDir = targetPath.substring(0, targetPath.lastIndexOf('/'));

      // Create parent directories
      if (!createdDirs.has(targetDir)) {
        if (!(await exists(targetDir))) {
          await mkdir(targetDir, { recursive: true });
          result.foldersCreated++;
        }
        createdDirs.add(targetDir);
      }

      // Skip existing files
      if (await exists(targetPath)) {
        result.skipped++;
        continue;
      }

      // Read source, write to destination
      const content = await readTextFile(file.fullPath);
      await writeTextFile(targetPath, content);
      result.filesImported++;

      // Extract hashtags
      const inlineTags = extractHashtags(content);
      const fmTags = extractFrontmatterTags(content);
      for (const t of [...inlineTags, ...fmTags]) {
        allHashtags.add(t);
      }
    } catch (e) {
      result.errors.push(`${file.relativePath}: ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  result.hashtags = [...allHashtags].sort();
  onProgress?.({ phase: 'complete', current: mdFiles.length, total: mdFiles.length });

  return result;
}
