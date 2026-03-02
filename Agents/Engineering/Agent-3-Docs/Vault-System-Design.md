# The Vault (File System) — Detailed Design

**Source:** Extracted from Agent 3 System Architect spec, Section 3
**Parent:** [Agent-3-System-Architect.md](../Agent-3-System-Architect.md)

---

## 3.1 Vault Folder Structure

```
~/Kaivoo/                                  ← User-chosen root directory
│
├── Journal/                               ← System 2 home
│   ├── 2026/
│   │   ├── 01 - January/
│   │   │   ├── 2026-01-01.md
│   │   │   └── ...
│   │   └── 02 - February/
│   │       ├── 2026-02-20.md
│   │       └── ...
│   └── Templates/
│       ├── daily-reflection.md
│       └── weekly-review.md
│
├── Projects/                              ← Replaces "Topics"
│   ├── Kaivoo/
│   │   ├── README.md                     ← Folder description
│   │   ├── Branding/
│   │   │   ├── kaivoo-logo.png
│   │   │   └── Design System.md
│   │   ├── Engineering/
│   │   └── Meeting Notes/
│   ├── NUWAVE/
│   │   ├── README.md
│   │   ├── Branding/
│   │   │   └── NUWAVE Brand Guidelines.md
│   │   └── Projects/
│   └── Personal/
│       ├── Fitness/
│       └── Reading List/
│
├── Library/                               ← Reference material, uploads
│   ├── Books/
│   ├── Videos/
│   ├── Research/
│   └── Courses/
│
├── Brand Guidelines/                      ← Brand guide repository
│   ├── Kaivoo/
│   │   └── Kaivoo-Design-System.md
│   └── NUWAVE/
│       └── NUWAVE-Brand-Guide.md
│
├── Inbox/                                 ← Quick captures
│   └── capture-2026-02-20-1430.md
│
├── Agent Workspace/                       ← Where agents save output
│   ├── Design Agent/
│   │   ├── NUWAVE Design/
│   │   │   └── Security Practices.pptx
│   │   └── Kaivoo Design/
│   ├── Research Agent/
│   └── Writing Agent/
│
└── .kaivoo/                               ← System config (hidden)
    ├── config.json                        ← App settings, vault path
    ├── kaivoo.db                          ← SQLite database
    ├── soul.md                            ← User memory file
    ├── agents/                            ← Agent definitions
    │   ├── ppt-creator.md
    │   ├── journal-analyst.md
    │   ├── web-researcher.md
    │   ├── code-architect.md
    │   ├── research-agent.md              ← Researches how to build things
    │   └── builder-agent.md               ← Builds plugins, widgets, MCPs
    ├── skills/                            ← Skill definitions
    │   ├── web-scraping.md
    │   ├── pdf-generation.md
    │   └── file-management.md
    ├── plugins/                           ← Workshop: installed plugins
    │   ├── widgets/                       ← Custom Dashboard widgets
    │   │   └── twitter-reel/
    │   │       ├── manifest.json
    │   │       ├── index.tsx
    │   │       └── styles.css
    │   ├── mcps/                          ← MCP tool servers
    │   │   └── twitter-scraper/
    │   │       ├── manifest.json
    │   │       └── server.ts
    │   ├── integrations/                  ← External service connectors
    │   │   └── twitter.json
    │   └── registry.json                  ← Master plugin list
    ├── ai-providers.json                  ← API keys per provider
    ├── routing-rules.json                 ← Concierge routing preferences
    ├── build-log.json                     ← Workshop build history
    ├── conversations/                     ← Chat history (opt-in search)
    │   ├── 2026-02-20-ppt-request.md
    │   └── 2026-02-20-journal-analysis.md
    └── trash/                             ← Soft-deleted files (30 day)
```

## 3.2 File Metadata (Obsidian-Compatible)

Every `.md` file supports YAML frontmatter:

```markdown
---
tags: [kaivoo, branding, design-system]
created: 2026-02-20T14:30:00
modified: 2026-02-20T15:45:00
---

# My Document Title

Content with [[wikilinks]] to other files and #inline-tags.
```

**Indexing:** On startup and via file watcher, the Hub server parses frontmatter and inline tags from all `.md` files and indexes them into SQLite for fast search and filtering.

**Non-markdown files** (PDF, PPTX, images, video) get metadata stored in SQLite:
```sql
-- file_index table
path TEXT PRIMARY KEY,      -- relative to vault root
filename TEXT,
extension TEXT,
file_type TEXT,             -- 'video', 'document', 'image', 'presentation', etc.
size_bytes INTEGER,
tags TEXT,                  -- JSON array
created_at TEXT,
modified_at TEXT,
content_hash TEXT,          -- for change detection
extracted_text TEXT,         -- text extracted from PDFs, PPTX, etc.
search_vector TEXT          -- FTS5 searchable content
```

## 3.3 Tags and Linking System

```
TAGS:
  Three sources, all indexed into one unified tag system:
  1. YAML frontmatter:  tags: [kaivoo, branding]
  2. Inline hashtags:   #kaivoo
  3. Manual assignment:  Added via the UI (stored in SQLite)

  All three are equivalent. UI shows unified tag list.
  Tags are case-insensitive, hyphen-separated.

WIKILINKS:
  [[Page Name]]           → Resolves to any .md file with that name
  [[Folder/Page Name]]    → Resolves to specific path
  [[Page Name|Display]]   → Alias display text

  Backlinks are computed and shown in the file viewer sidebar.
  "5 files link to this document"
```

## 3.4 Vault Features

| Feature | Description |
|---------|-------------|
| **File browser** | Full tree view with expand/collapse. Drag-and-drop to move files. Right-click context menu. |
| **Drag-and-drop upload** | Drop any file into the browser → saved to current folder (or Inbox default) |
| **Search** | Full-text search across all indexed files (markdown text + extracted text from PDFs/PPTX) |
| **Filter by type** | Video, PDF, Image, Presentation, Markdown, Spreadsheet, Audio, Code, Archive |
| **Filter by tag** | Any combination of tags, AND/OR logic |
| **Sort** | By name, modified date, size, type |
| **Folder templates** | "New Client Project" creates pre-made subfolder structure |
| **Starred items** | Bookmark any file or folder. Shows on Dashboard |
| **Recent files** | Widget showing recently modified files |
| **Trash** | Soft delete → `.kaivoo/trash/` with 30-day retention |
| **Git versioning** | Optional. Every .md save = git commit. Full version history. |
| **Obsidian import** | Point at existing Obsidian vault. Indexes everything. Existing notes/links/tags work. |
| **Storage indicator** | "Using 48GB of 512GB" |
