# Agent 3: System Architect — Kaivoo Hub Master Blueprint
## Self-Hosted Personal AI Operating System · Architecture Specification v1.0

**Role:** System Architect
**Mission:** Define the complete architecture for Kaivoo Hub — a self-hosted personal AI operating system that runs on a dedicated Mac Mini, stores all data as local files, orchestrates AI agents across multiple providers, and is accessible from any device via web browser.

**Date:** February 2026
**Status:** APPROVED — Ready for implementation
**Hardware Target:** Mac Mini, 16GB RAM, 512GB SSD, macOS

---

# Table of Contents

1. [Vision & Core Concepts](#1-vision--core-concepts)
2. [System Overview](#2-system-overview)
3. [System 1: The Vault (File System)](#3-system-1-the-vault)
4. [System 2: The Journal](#4-system-2-the-journal)
5. [System 3: The Dashboard](#5-system-3-the-dashboard)
6. [System 4: The Concierge (AI Orchestration)](#6-system-4-the-concierge)
7. [System 5: The Theater (Media)](#7-system-5-the-theater)
8. [System 6: The Workshop (Developer Mode)](#8-system-6-the-workshop)
9. [The Soul (User Memory)](#9-the-soul)
10. [Technology Stack](#10-technology-stack)
11. [Hub Server Architecture](#11-hub-server-architecture)
12. [Data Model: Files vs Database](#12-data-model)
13. [Real-Time Sync](#13-real-time-sync)
14. [Security & Authentication](#14-security--authentication)
15. [Remote Access](#15-remote-access)
16. [Reference Pointers](#16-reference-pointers) *(Migration Plan, Roadmap, Future Extensions, Mac Mini Setup)*

---

# 1. Vision & Core Concepts

## 1.1 What Is Kaivoo Hub?

Kaivoo Hub is a **self-hosted personal AI operating system**. It runs continuously on a dedicated Mac Mini and is accessed from any device (phone, laptop, desktop) via a web browser. All data — journal entries, notes, files, media, tasks, routines — lives on the Hub machine as real files in a user-chosen folder. AI agents operate on these files using the user's own API keys.

## 1.2 Core Philosophy

```
1. YOU OWN YOUR DATA
   Every file is a real file on your disk. Open it in Finder,
   Obsidian, VS Code, or any other tool. No vendor lock-in.
   No cloud dependency. No subscription required for your own data.

2. AI SERVES YOU, NOT THE OTHER WAY AROUND
   You choose which AI to use. You provide your own keys.
   AI agents are defined as simple markdown files you can
   read, edit, and understand. No black boxes.

3. ONE HUB, EVERY DEVICE
   Your phone, laptop, and desktop are all thin clients.
   The Hub is the single source of truth. Changes are instant
   and synchronized via WebSocket.

4. FILES FIRST, DATABASE SECOND
   If data can be a file, it's a file. Database is reserved
   for structured metadata (tags, tasks, routines, search index)
   that doesn't make sense as individual files.
```

## 1.3 The Six Subsystems

| # | System | Purpose |
|---|--------|---------|
| 1 | **The Vault** | File system. Folders, files, media. Obsidian-compatible markdown. Any file type. Tags, search, filters. |
| 2 | **The Journal** | Daily entries as .md files. Rich text. AI-powered pattern analysis across time. |
| 3 | **The Dashboard** | Command center. Widgets, routines, tasks, calendar. The "Today" view. |
| 4 | **The Concierge** | AI orchestrator. Routes requests to agents, manages skills, relays results. |
| 5 | **The Theater** | Media playback and previews. Plex-like filtering for video, PDF, presentations. |
| 6 | **The Workshop** | Developer mode. Self-extending platform. Build widgets, MCPs, skills, agents, and integrations — via UI or AI. |

Plus one cross-cutting concern:

| System | Purpose |
|--------|---------|
| **The Soul** | Persistent user memory file. Communication style, goals, struggles, preferences. Referenced by AI for personalized interaction. |

---

# 2. System Overview

## 2.1 High-Level Architecture

```
YOUR DEVICES (thin clients)                  KAIVOO HUB (Mac Mini)
┌──────────────┐                            ┌────────────────────────────────────┐
│   📱 Phone    │                            │                                    │
│   (Safari)   │─── HTTPS (Tailscale) ────► │  ┌────────────────────────────┐    │
├──────────────┤                            │  │   Node.js Server (Express)  │    │
│   💻 Laptop   │─── HTTPS (Tailscale) ────► │  │   • Serves React SPA        │    │
│   (Chrome)   │                            │  │   • REST API (/api/*)        │    │
├──────────────┤                            │  │   • WebSocket (real-time)    │    │
│   🖥️ Desktop  │─── HTTPS (Tailscale) ────► │  │   • File watcher (chokidar) │    │
│   (Firefox)  │                            │  └──────────┬─────────────────┘    │
└──────────────┘                            │             │                      │
                                            │  ┌──────────▼─────────────────┐    │
All devices see the SAME app.               │  │   LOCAL FILE SYSTEM         │    │
All changes happen on THIS machine.         │  │   ~/Kaivoo/ (user-chosen)   │    │
                                            │  └──────────┬─────────────────┘    │
                                            │             │                      │
                                            │  ┌──────────▼─────────────────┐    │
                                            │  │   SQLite Database           │    │
                                            │  │   .kaivoo/kaivoo.db         │    │
                                            │  │   Tags, tasks, routines,    │    │
                                            │  │   search index, settings    │    │
                                            │  └──────────┬─────────────────┘    │
                                            │             │                      │
                                            │  ┌──────────▼─────────────────┐    │
                                            │  │   AI Layer                  │    │
                                            │  │   • Ollama (local LLMs)     │    │
                                            │  │   • Claude API              │    │
                                            │  │   • OpenAI API              │    │
                                            │  │   • Gemini API              │    │
                                            │  └────────────────────────────┘    │
                                            └────────────────────────────────────┘
```

---

# 3. System 1: The Vault

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

---

# 4. System 2: The Journal

## 4.1 Journal File Format

```markdown
<!-- ~/Kaivoo/Journal/2026/02 - February/2026-02-20.md -->
---
date: 2026-02-20
mood: good
tags: [kaivoo, productivity, design]
word_count: 847
---

# Thursday, February 20, 2026

## Morning Reflection
Woke up energized today. Been thinking about the Kaivoo architecture
shift — moving from cloud to self-hosted feels right. There's something
powerful about **owning your own data**.

## Work Log
- Finished the [[Kaivoo Design System]] color migration
- Had a great conversation about the Hub architecture
- Need to look into #tailscale for remote access

## Evening
Read another chapter of [[Atomic Habits]]. The idea of "environment design"
connects to what I'm building with Kaivoo.

## Captures
- [ ] Research Tailscale vs Cloudflare Tunnel
- [ ] Order Mac Mini for Hub setup
- [x] Update CSS tokens to Kaivoo palette
```

Files are organized: `Journal/YYYY/MM - MonthName/YYYY-MM-DD.md`

The app renders these as rich text (bold, italic, headers, checkboxes, links) while the underlying file is plain markdown you can open anywhere.

## 4.2 Journal Templates

Users can create templates in `Journal/Templates/`. When creating a new entry, they can choose a template or use the default. Templates are just .md files with placeholder tokens:

```markdown
---
date: {{date}}
mood:
tags: []
---

# {{day_name}}, {{full_date}}

## Morning Reflection


## What I'm Working On


## Gratitude
1.
2.
3.

## End of Day Review

```

## 4.3 Journal AI Superpowers

| Feature | What It Does | AI Provider |
|---------|-------------|-------------|
| **Pattern Analysis** | "What themes appeared most in Jan 2026?" Reads all entries in range, identifies recurring topics | User's default journal AI |
| **Mood Tracking** | Auto-detect mood from writing tone, or manual. Visualize over time. | Local LLM (cheap) |
| **Auto-tagging** | Suggest tags after writing based on content | Local LLM |
| **Weekly Digest** | Auto-generated summary: word count, top themes, mood trends | User's default journal AI |
| **Capture Extraction** | Pull out `- [ ]` items and surface as tasks on Dashboard | No AI needed (regex) |
| **Cross-referencing** | "What did I write about Kaivoo last week?" | Search index + AI summary |

---

# 5. System 3: The Dashboard

## 5.1 What Stays From Current App

The Dashboard (Today page) keeps its existing widget-based architecture:
- Customizable widget grid with drag-to-reorder
- Daily Brief, Journal, Tasks, Calendar, Tracking widgets
- Routines with streak tracking
- Settings page

## 5.2 What Changes

| Component | Current (Supabase) | New (Hub) |
|-----------|-------------------|-----------|
| Data source | Supabase PostgreSQL | Hub API → SQLite + files |
| Tasks | Supabase table | SQLite table |
| Routines | Supabase table | SQLite table |
| Journal widget | Supabase table | Reads from Journal/ folder |
| Calendar | Supabase table | SQLite table (with optional Google Calendar sync) |
| Widget config | Supabase table | SQLite table |

## 5.3 New Dashboard Widgets

| Widget | Data Source |
|--------|-------------|
| **Recent Files** | File watcher → last 10 modified files |
| **Starred Items** | SQLite bookmarks |
| **AI Concierge Chat** | Inline chat with the Concierge |
| **Storage Usage** | Disk space indicator |
| **Routine Reports** | SQLite → streak charts, completion rates |
| **Vault Stats** | Total files, total size, files by type breakdown |

---

# 6. System 4: The Concierge (AI Orchestration)

## 6.1 Architecture

```
USER MESSAGE
    │
    ▼
┌──────────────────────────────────────────────────────┐
│                 THE CONCIERGE                         │
│                                                      │
│  Runs on: Local LLM (Ollama/Llama 3) by default     │
│  Purpose: Understand intent → route to best agent    │
│                                                      │
│  Step 1: Parse user intent                           │
│  Step 2: Search .kaivoo/agents/ for best match       │
│  Step 3: Check if agent needs skills from            │
│          .kaivoo/skills/                             │
│  Step 4: Determine AI provider (agent preference     │
│          OR user override: "use Claude Opus")        │
│  Step 5: Search relevant repositories for context    │
│          (e.g., Brand Guidelines/ folder)            │
│  Step 6: Ask user for missing context                │
│  Step 7: Dispatch to agent with full context         │
│  Step 8: Relay results + save output to Vault        │
│  Step 9: Update conversation log                     │
│                                                      │
│  References: .kaivoo/soul.md for user personality    │
└──────────────────────────────────────────────────────┘
```

## 6.2 Agent File Format

```markdown
<!-- .kaivoo/agents/ppt-creator.md -->
---
name: PPT Creator
description: Creates professional PowerPoint presentations from source material
preferred_ai: claude/opus
fallback_ai: openai/gpt4o
skills_required: [web-scraping, file-management]
input_types: [url, text, file-reference]
output_type: pptx
output_folder: Agent Workspace/Design Agent
ask_for_location: true
ask_for_tags: true
ask_for_brand: true
brand_search_folder: Brand Guidelines
---

# PPT Creator Agent

## Role
You are a professional presentation designer. You create clear,
visually structured PowerPoint presentations from source material.

## Process
1. Receive source material (URL, text, or file reference)
2. If URL: use the web-scraping skill to extract content
3. If brand guidelines provided: apply brand colors and style
4. Analyze and structure the content into slides
5. Generate the PPT
6. Save to output folder, creating a contextual subfolder if needed
7. Apply relevant tags based on content analysis

## Output Organization
When no specific save location is given:
- Create a subfolder in your output folder named after the brand/project
- Name the file descriptively based on content
- Auto-tag with relevant keywords from the content

## Required Context (ask via Concierge if not provided)
- Target audience
- Desired slide count (suggest a default based on content)
- Brand guidelines to use (search Brand Guidelines/ folder)
- File format (PDF, PPTX, or both)
```

## 6.3 Skill File Format

```markdown
<!-- .kaivoo/skills/web-scraping.md -->
---
name: Web Scraping
description: Extract content from websites for analysis
type: tool
endpoint: /api/skills/web-scrape
parameters:
  - name: url
    type: string
    required: true
  - name: depth
    type: number
    default: 1
    description: How many pages deep to crawl
  - name: extract_images
    type: boolean
    default: false
  - name: output_format
    type: string
    default: markdown
    options: [markdown, json, text]
---

# Web Scraping Skill

Fetches web page content and returns structured text.
Strips ads, navigation, and boilerplate. Returns main content body.
Can crawl multiple pages at specified depth.
```

## 6.4 Complete Use Case Walkthrough

```
USER:  "Hey, can you scrape the data from https://example.com/security
        and create a ppt for NUWAVE?"

CONCIERGE (internal reasoning):
  → Intent: Create a presentation
  → Source: URL (https://example.com/security)
  → Brand: NUWAVE
  → Best agent: ppt-creator (matches "create PPT")
  → Agent needs: web-scraping skill ✓
  → Agent config says: ask_for_brand = true
  → Search Brand Guidelines/ folder for "NUWAVE"
  → Found: Brand Guidelines/NUWAVE/NUWAVE-Brand-Guide.md
  → Agent config says: ask_for_location = false (no specific request)
  → Output folder: Agent Workspace/Design Agent/
  → AI provider: claude/opus (agent preference)
  → Missing: format, slide count, audience

CONCIERGE → USER:
  "Got it! I'll have the PPT Creator handle this using Claude Opus.
   I found your NUWAVE Brand Guidelines — want me to use those?
   A couple quick questions:
   1. Format — PPT, PDF, or both?
   2. Any specific slide count?
   3. Who's the audience?"

USER:  "PPT would be great. 10ish slides. Internal team."

CONCIERGE → PPT CREATOR AGENT (via Claude Opus):
  - Source content: [scraped text from URL]
  - Brand guidelines: [NUWAVE-Brand-Guide.md content]
  - Format: PPTX
  - Slides: ~10
  - Audience: Internal team
  - Save to: Agent Workspace/Design Agent/

PPT CREATOR (internal reasoning):
  → Content is about security practices
  → Create subfolder: "NUWAVE Design/"
  → Filename: "Security Practices Overview.pptx"
  → Tags: #nuwave #security #presentation #internal

PPT CREATOR → CONCIERGE:
  { status: "complete",
    file: "Agent Workspace/Design Agent/NUWAVE Design/Security Practices Overview.pptx",
    slides: 10,
    tags: ["nuwave", "security", "presentation", "internal"] }

CONCIERGE → USER:
  "All done! Created a 10-slide PPT using your NUWAVE brand guidelines.

   📄 Security Practices Overview.pptx
   📁 Agent Workspace/Design Agent/NUWAVE Design/
   🏷️ #nuwave #security #presentation #internal

   [Open File] [Preview] [Move to Different Folder] [Edit Tags]"
```

## 6.5 AI Provider Configuration

```json
// .kaivoo/ai-providers.json
{
  "providers": {
    "claude": {
      "api_key": "sk-ant-...",
      "models": {
        "opus": "claude-opus-4-20250514",
        "sonnet": "claude-sonnet-4-20250514",
        "haiku": "claude-3-5-haiku-20241022"
      }
    },
    "openai": {
      "api_key": "sk-...",
      "models": {
        "gpt4o": "gpt-4o",
        "gpt4o-mini": "gpt-4o-mini"
      }
    },
    "gemini": {
      "api_key": "AIza...",
      "models": {
        "pro": "gemini-2.0-pro",
        "flash": "gemini-2.0-flash"
      }
    },
    "local": {
      "type": "ollama",
      "endpoint": "http://localhost:11434",
      "models": {
        "llama3": "llama3:8b",
        "mistral": "mistral:latest",
        "codellama": "codellama:latest"
      }
    }
  },
  "defaults": {
    "concierge": "local/llama3",
    "journal_analysis": "openai/gpt4o",
    "heavy_tasks": "claude/opus",
    "quick_tasks": "openai/gpt4o-mini",
    "auto_tagging": "local/llama3",
    "text_extraction": "local/llama3"
  }
}
```

## 6.6 Conversation Persistence

Conversations are saved as .md files in `.kaivoo/conversations/`:

```markdown
<!-- .kaivoo/conversations/2026-02-20-nuwave-ppt.md -->
---
date: 2026-02-20T15:30:00
participants: [user, concierge, ppt-creator]
ai_provider: claude/opus
output_files:
  - Agent Workspace/Design Agent/NUWAVE Design/Security Practices Overview.pptx
tags: [nuwave, security, ppt]
---

**User:** Hey, can you scrape the data from https://example.com/security
and create a ppt for NUWAVE?

**Concierge:** Got it! I'll have the PPT Creator handle this using Claude Opus.
I found your NUWAVE Brand Guidelines — want me to use those?
...

**User:** PPT would be great. 10ish slides. Internal team.

**Concierge:** All done! Created a 10-slide PPT...
```

**Important:** The Concierge does NOT automatically search conversation history. It only searches when the user explicitly references a past conversation ("remember that PPT we made?"). This keeps the Concierge fast and focused.

---

# 7. System 5: The Theater (Media)

## 7.1 File Type Registry

| Category | Extensions | Viewer Technology |
|----------|------------|-------------------|
| **Video** | .mp4, .mov, .webm, .avi, .mkv | Video.js player |
| **Audio** | .mp3, .wav, .m4a, .flac | Waveform player (WaveSurfer.js) |
| **Document** | .pdf | PDF.js |
| **Presentation** | .pptx, .key | pptx-to-html conversion |
| **Spreadsheet** | .xlsx, .csv | SheetJS table viewer |
| **Image** | .png, .jpg, .svg, .gif, .webp | Lightbox gallery |
| **Markdown** | .md | Kaivoo rich renderer |
| **Code** | .js, .py, .ts, .sql, etc. | Monaco / syntax highlight |
| **Archive** | .zip, .tar.gz | Contents listing |
| **Other** | * | File info + download |

## 7.2 Theater Search & Filtering

```
┌─────────────────────────────────────────────────────────────────┐
│  🔍 Search: "kaivoo"                                            │
│                                                                 │
│  Type: [All] [📹 Video] [📄 PDF] [🖼️ Image] [📊 PPT] [📝 MD]   │
│  Tags: [#kaivoo ×] [+ Add tag...]                               │
│  Folder: [All Folders ▼]                                        │
│  Date: [Any time ▼]        Sort: [Modified ▼]                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  📹 Product Demo.mp4                  2.4 GB    Feb 18, 2026   │
│     Projects/Kaivoo/Videos/           #kaivoo #demo             │
│                                                                 │
│  📄 Brand Guidelines.pdf              1.2 MB    Feb 15, 2026   │
│     Brand Guidelines/Kaivoo/          #kaivoo #brand            │
│                                                                 │
│  📝 Architecture.md                   24 KB     Feb 20, 2026   │
│     Projects/Kaivoo/Engineering/      #kaivoo #architecture     │
│                                                                 │
│  🖼️ kaivoo-logo.png                   180 KB    Jan 10, 2026   │
│     Projects/Kaivoo/Branding/         #kaivoo #logo             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

# 8. System 6: The Workshop (Developer Mode)

## 8.1 Purpose

The Workshop is Kaivoo Hub's self-extension system. It allows the user — or the AI — to build new capabilities directly from within the app, without ever opening a code editor or terminal. Crucially, **it is completely unrestricted**. You are not limited to just building plugins; you can use the Workshop to fundamentally alter the Hub's core source code and architecture.

The key innovation: **the Concierge can use the Workshop to build things it doesn't know how to do yet, up to and including rewriting its own core logic.** If a user asks for a feature that doesn't exist, the Concierge triggers a Research → Plan → Approve → Build → Deploy pipeline. You can also connect external developer agents (like Claude Code, Codex, or Antigravity) directly into this mode to work alongside you as unrestricted co-pilots.

## 8.2 What Can Be Built

| Buildable | What It Is | Stored At |
|-----------|-----------|----------|
| **Core Architecture** | The Hub's own source code | `~/Kaivoo-Server/` (The actual app directory) |
| **External Agents** | Connect Claude Code, Codex, etc. | `.kaivoo/dev-agents/` |
| **Agents** | New AI agent definitions | `.kaivoo/agents/new-agent.md` |
| **Skills** | New capabilities agents can use | `.kaivoo/skills/new-skill.md` + optional script |
| **Widgets** | New Dashboard cards (React components) | `.kaivoo/plugins/widgets/widget-name/` |
| **MCPs** | Model Context Protocol tool servers | `.kaivoo/plugins/mcps/mcp-name/` |
| **Integrations** | External service connectors (API configs) | `.kaivoo/plugins/integrations/service.json` |
| **Templates** | Journal, folder, or document templates | Anywhere in vault as `.md` |
| **Routing Rules** | Concierge routing preferences | `.kaivoo/routing-rules.json` |
| **Theme Overrides** | Custom CSS, layout tweaks | `.kaivoo/theme/overrides.css` |

## 8.3 The Research → Plan → Approve → Build → Deploy Pipeline

When the user asks for something that doesn't exist:

```
USER REQUEST
    │
    ▼
CONCIERGE recognizes: "I can't do this yet"
    │
    ▼
┌──────────────────────────────────────────────┐
│  STEP 1: RESEARCH                            │
│  Concierge dispatches Research Agent          │
│  • Web search for best approaches             │
│  • Review existing skills/agents for overlap  │
│  • Evaluate complexity and requirements       │
│  • Identify npm packages, APIs, patterns      │
│  AI Provider: local LLM (cheap) or user pref  │
└──────────────────┬───────────────────────────┘
                   │
                   ▼
┌──────────────────────────────────────────────┐
│  STEP 2: PLAN                                │
│  Research Agent returns findings              │
│  Concierge creates a build plan:              │
│  • What to build (widget? MCP? skill?)        │
│  • Which approach (API vs scraping vs ...)    │
│  • What dependencies are needed               │
│  • Estimated complexity                       │
│  • Alternative approaches with trade-offs     │
└──────────────────┬───────────────────────────┘
                   │
                   ▼
┌──────────────────────────────────────────────┐
│  STEP 3: APPROVE                             │
│  Concierge presents plan to USER             │
│  User can:                                   │
│  • ✅ Approve as-is                           │
│  • ✏️ Modify the plan                         │
│  • ❌ Cancel                                  │
│  • 🔄 Ask for different approach              │
└──────────────────┬───────────────────────────┘
                   │ (user approves)
                   ▼
┌──────────────────────────────────────────────┐
│  STEP 4: BUILD                               │
│  Concierge dispatches Builder Agent           │
│  Builder uses preferred heavy AI (Claude Opus)│
│  • Creates all required files                 │
│  • Installs npm dependencies if needed        │
│  • Writes manifest.json for plugins           │
│  • Creates README documentation               │
│  AI Provider: claude/opus (complex code gen)  │
└──────────────────┬───────────────────────────┘
                   │
                   ▼
┌──────────────────────────────────────────────┐
│  STEP 5: DEPLOY                              │
│  Hub server detects new plugin files          │
│  • Validates manifest                         │
│  • Registers in registry.json                 │
│  • Hot-reloads widget/MCP/skill               │
│  • Notifies all connected clients via WS      │
│  • Logs build in build-log.json               │
│  New capability is LIVE                       │
└──────────────────────────────────────────────┘
```

## 8.4 Complete Use Case: Twitter Reel Widget

```
USER: "Hey, I really like this Twitter scraper that pulls top performing
       X posts. Can we replicate something like this in our dashboard
       and add a blog-like reel widget that I can swipe through?"

CONCIERGE (thinking):
  → No existing agent/skill/widget for Twitter/X data
  → This requires building something new
  → Activate: Research Agent

CONCIERGE → USER:
  "I don't know how to do that yet — but I'll figure it out.
   Let me have the Research Agent look into the best approach.
   I'll come back with a plan for your review."

─── Research Agent runs (local LLM or GPT-4o-mini) ───

CONCIERGE → USER:
  "Here's what the Research Agent found:

   APPROACH A: Twitter/X API (Official)
   • Requires X Developer account ($100/mo basic tier)
   • Rate limited to 10,000 tweets/month
   • Clean, reliable, TOS-compliant
   • Pulls: likes, retweets, impressions, engagement rate

   APPROACH B: RSS + Nitter Scraping (No API key)
   • Free, no API key needed
   • Less data (no impression/engagement metrics)
   • May break if Nitter goes down

   RECOMMENDATION: Approach A for real analytics.
   Approach B for a quick prototype.

   The build would involve:
   1. A new MCP tool server: 'twitter-scraper'
   2. A new Skill: 'fetch-top-tweets'
   3. A new Dashboard Widget: 'Twitter Reel'

   Estimated build: ~2 hours of agent work.
   Would you like me to execute? You can modify the plan first."

USER: "Let's go with Approach A. I have an X developer account.
       Make the widget swipeable — vertical cards like Reels."

CONCIERGE → BUILDER AGENT (via Claude Opus):
  Build plan dispatched with full context.

BUILDER AGENT creates:
  .kaivoo/plugins/mcps/twitter-scraper/
    ├── manifest.json
    ├── server.ts        ← MCP server connecting to X API
    └── README.md

  .kaivoo/skills/fetch-top-tweets.md
    ← Skill definition pointing to MCP endpoint

  .kaivoo/plugins/widgets/twitter-reel/
    ├── manifest.json
    ├── index.tsx        ← React component with swipeable cards
    ├── styles.css       ← Kaivoo-themed styling
    └── README.md

HUB SERVER:
  → Detects new files via chokidar
  → Validates manifests
  → Registers in registry.json
  → Hot-reloads plugin system
  → Broadcasts 'plugin:installed' via WebSocket

CONCIERGE → USER:
  "All done! Here's what was built:

   ✅ MCP: twitter-scraper (connects to X API)
   ✅ Skill: fetch-top-tweets
   ✅ Widget: Twitter Reel (swipeable vertical cards)

   I need your X API key to activate the scraper.
   Go to Settings → Integrations → Twitter/X to add it.

   The widget is available in your Dashboard now.
   Click [+ Add Widget] → 'Twitter Reel'.

   [Preview Widget] [Add to Dashboard] [View Source Code]"
```

## 8.5 Plugin Architecture

### Widget Manifest
```json
{
  "id": "twitter-reel",
  "name": "Twitter Reel",
  "description": "Swipeable feed of top-performing X posts",
  "version": "1.0.0",
  "author": "builder-agent",
  "created": "2026-02-21T00:00:00Z",
  "category": "social",
  "size": ["medium", "large"],
  "requires": ["twitter-scraper"],
  "settings": {
    "username": { "type": "string", "label": "X Username" },
    "count": { "type": "number", "label": "Posts to show", "default": 10 },
    "timeframe": { "type": "select", "options": ["24h", "7d", "30d"], "default": "7d" }
  }
}
```

### MCP Server Manifest
```json
{
  "id": "twitter-scraper",
  "name": "Twitter/X Scraper",
  "description": "Fetches tweets and engagement data from X API",
  "version": "1.0.0",
  "author": "builder-agent",
  "transport": "stdio",
  "entry": "server.ts",
  "requires_keys": ["twitter_api_key", "twitter_api_secret"],
  "tools": [
    {
      "name": "fetch_top_tweets",
      "description": "Fetch top performing tweets for a username",
      "parameters": {
        "username": "string",
        "count": "number",
        "timeframe": "string"
      }
    }
  ]
}
```

### Plugin Registry
```json
// .kaivoo/plugins/registry.json
{
  "widgets": [
    { "id": "twitter-reel", "path": "widgets/twitter-reel", "active": true },
    { "id": "github-activity", "path": "widgets/github-activity", "active": true }
  ],
  "mcps": [
    { "id": "twitter-scraper", "path": "mcps/twitter-scraper", "active": true }
  ],
  "integrations": [
    { "id": "twitter", "path": "integrations/twitter.json", "active": false }
  ]
}
```

## 8.6 Developer Mode UI

When Developer Mode is toggled on in Settings, the app reveals additional panels:

```
┌─────────────────────────────────────────────────────────────────┐
│  🔧 DEVELOPER MODE                                    [ON/OFF]  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  AGENTS                          SKILLS                         │
│  ├── ppt-creator         [Edit]  ├── web-scraping       [Edit]  │
│  ├── journal-analyst     [Edit]  ├── pdf-generation     [Edit]  │
│  ├── web-researcher      [Edit]  ├── fetch-top-tweets   [Edit]  │
│  ├── research-agent      [Edit]  └── [+ New Skill]              │
│  ├── builder-agent       [Edit]                                 │
│  └── [+ New Agent]                                              │
│                                                                 │
│  WIDGETS (Plugins)               MCPs (Tool Servers)            │
│  ├── Twitter Reel ✅     [Edit]  ├── twitter-scraper ✅ [Edit]  │
│  ├── GitHub Activity ✅  [Edit]  ├── web-scraper ✅     [Edit]  │
│  └── [+ New Widget]              └── [+ New MCP]                │
│                                                                 │
│  INTEGRATIONS                    SYSTEM                         │
│  ├── Twitter/X 🔴 (needs key)   ├── Hub Source Code   [Edit]   │
│  ├── Google Calendar ✅          ├── Deep Edit Mode    [Terminal]│
│  └── [+ New Integration]         ├── Connect Claude Code [Sync] │
│                                  ├── Build Log         [View]   │
│                                                                 │
│  BUILD LOG (recent)                                             │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ Feb 21, 00:15  Builder Agent  Twitter Reel widget  ✅   │    │
│  │ Feb 21, 00:12  Research Agent X API research       ✅   │    │
│  │ Feb 20, 23:45  User           journal-analyst edit ✅   │    │
│  │ Feb 20, 22:00  Builder Agent  web-scraper MCP      ✅   │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                [View Full Log]  │
│                                                                 │
│  [+ Build Something New]  — Describe what you want, AI builds   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

Each item's [Edit] button opens the source file (.md for agents/skills, .tsx for widgets, .ts for MCPs) in a built-in code/markdown editor. Changes are hot-reloaded.

## 8.7 Approval Gates (Safety)

Since the Workshop gives AI the ability to create code that runs on the Hub, clear safety levels are enforced:

```
APPROVAL LEVELS:

Level 0 — AUTO (no approval needed):
  • Creating/editing .md files (agents, skills, docs)
  • Updating routing rules or soul.md
  • Creating folder structures
  • Modifying templates

Level 1 — REVIEW PLAN (approve before build starts):
  • Creating new widgets (React components)
  • Creating new MCP servers (Node.js code)
  • Adding new npm dependencies
  • Creating new integrations

Level 2 — REVIEW CODE (approve before deploy):
  • Any code that runs server-side
  • Any code that makes external API calls
  • Any code that accesses the file system beyond the vault
  • Any changes to Hub server configuration
  • Any code that installs system-level dependencies

USER CONTROLS (in Settings → Developer Mode):
  ○ Auto-approve Level 0         [ON by default]
  ○ Auto-approve Level 1         [OFF by default]
  ○ Always review code (Level 2) [ON by default, cannot be disabled]
  ○ Require confirmation for npm install  [ON by default]
```

### Rollback

Every Workshop build is logged in `.kaivoo/build-log.json` with:
- What was created/modified
- Who initiated it (user or which agent)
- Timestamp
- Snapshot of previous state

```json
// .kaivoo/build-log.json (excerpt)
[
  {
    "id": "build-001",
    "timestamp": "2026-02-21T00:15:00Z",
    "initiated_by": "builder-agent",
    "requested_by": "user",
    "action": "create",
    "items": [
      "plugins/widgets/twitter-reel/manifest.json",
      "plugins/widgets/twitter-reel/index.tsx",
      "plugins/widgets/twitter-reel/styles.css",
      "plugins/mcps/twitter-scraper/manifest.json",
      "plugins/mcps/twitter-scraper/server.ts",
      "skills/fetch-top-tweets.md"
    ],
    "status": "deployed",
    "rollback_available": true
  }
]
```

User can rollback any build from the Build Log, which removes all created files and unregisters the plugin from the registry.

## 8.8 Workshop API Endpoints

```
GET    /api/workshop/plugins              → List all plugins (widgets, MCPs, integrations)
GET    /api/workshop/plugin/:id           → Plugin details + source files
POST   /api/workshop/plugin               → Create/install plugin
PUT    /api/workshop/plugin/:id           → Update plugin files
DELETE /api/workshop/plugin/:id           → Uninstall plugin
POST   /api/workshop/plugin/:id/toggle    → Enable/disable plugin

GET    /api/workshop/agents               → List agent definitions
GET    /api/workshop/agent/:name          → Read agent .md file
PUT    /api/workshop/agent/:name          → Update agent .md file
POST   /api/workshop/agent               → Create new agent
DELETE /api/workshop/agent/:name          → Delete agent

GET    /api/workshop/skills               → List skill definitions
GET    /api/workshop/skill/:name          → Read skill .md file
PUT    /api/workshop/skill/:name          → Update skill .md file
POST   /api/workshop/skill               → Create new skill
DELETE /api/workshop/skill/:name          → Delete skill

GET    /api/workshop/build-log            → Build history
POST   /api/workshop/build-log/:id/rollback → Rollback a build

POST   /api/workshop/build               → Trigger Research→Plan→Build pipeline
  Body: { description: string, preferences?: object }
  Response: SSE stream of pipeline progress
```

## 8.9 Unrestricted External Agents (Claude Code / Codex)

Because the Hub enables unrestricted access to its own architecture, you can connect dedicated developer agents directly to the Workshop.

Instead of just using the Concierge's internal `Builder Agent`, you can map a local terminal connection to tools like **Claude Code**, **Codex**, or **Antigravity**. 

When connected, these external agents have:
- Full read/write access to the Hub's core source directories (Node.js backend, React frontend).
- The ability to execute terminal commands (e.g., `npm install`, `git commit`).
- A live chat interface within the Developer Mode UI that functions like a terminal integrated directly into your Kaivoo dashboard.

**Example Use Case:**
You open Developer Mode and click `[Connect Claude Code]`. A terminal-like chat window appears.
"Hey, I want to rip out the default TipTap markdown editor we currently use for the Journal, and replace it with a custom block-based editor similar to Notion. Please restructure the React components in the core app and update the database schema if needed."

The external agent begins working on the core app's source code, completely bypassing the plugin system, giving you limitless control over the platform's evolution.

---

# 9. The Soul (User Memory)

## 8.1 Purpose

The Soul is a persistent memory file that gives the Concierge context about who it's talking to. It is **not** a conversation log — it's a living document that captures the essence of the user's personality, preferences, goals, and communication style.

## 8.2 File Format

```markdown
<!-- .kaivoo/soul.md -->
---
last_updated: 2026-02-20
update_frequency: weekly
---

# Soul — User Profile

## Identity
- Name: [User's name]
- Role: Founder, designer, builder
- Companies: Kaivoo, NUWAVE

## Communication Style
- Prefers direct, concise responses
- Likes when ideas are organized visually (tables, diagrams)
- Values honesty over politeness — "tell me if my idea is bad"
- Tends to think big picture first, then zoom into details
- Sometimes rambles when brainstorming — help focus the ideas

## Goals (Current)
- Build Kaivoo Hub into a self-hosted personal OS
- Launch NUWAVE marketing platform
- Establish daily journaling + routine tracking habit
- Read 24 books this year

## Working Style
- Most productive in the morning
- Prefers async work — don't assume urgency
- Uses multiple AI tools and expects them to work together
- Values ownership and self-sovereignty over convenience

## Struggles
- Tendency to scope-creep — help keep focus tight
- Sometimes needs help prioritizing between competing projects
- Can get stuck in planning mode — gently push toward execution

## Preferences
- Dark mode preferred
- Prefers Markdown for documents
- Brands he cares about: Kaivoo, NUWAVE
- AI preferences: Claude for complex reasoning, GPT for creativity,
  Local LLM for quick/cheap tasks
```

## 8.3 How the Soul Gets Updated

The Soul is NOT updated after every conversation. Updates happen:

1. **On user request:** "Update my soul file — I've shifted focus to X"
2. **Weekly auto-review:** The Concierge reviews the week's conversations and proposes updates. User approves before changes are written.
3. **Manual editing:** User can open and edit `soul.md` directly like any file.

The Concierge reads `soul.md` at the start of each session. It's a small file (< 2KB) so it adds minimal context overhead.

---

# 9. Technology Stack

## 9.1 Hub Server (Backend)

| Layer | Technology | Why |
|-------|-----------|-----|
| **Runtime** | Node.js 20 LTS | Same language as frontend. Excellent fs APIs. |
| **Framework** | Express.js (or Fastify) | Battle-tested, simple, huge ecosystem |
| **Database** | SQLite (better-sqlite3) | Single file, zero config, embedded, perfect for single-user |
| **File Watching** | chokidar | Cross-platform file system watcher for real-time indexing |
| **WebSocket** | ws (or Socket.IO) | Real-time sync across devices |
| **Text Extraction** | pdf-parse (PDF), mammoth (DOCX), pptx (PPTX) | Extract searchable text from binary files |
| **Search** | SQLite FTS5 | Full-text search, built into SQLite |
| **Process Manager** | PM2 | Keeps Hub running 24/7, auto-restarts, log management |
| **Git (optional)** | simple-git | File versioning via git commits |

## 9.2 Frontend (Client)

| Layer | Technology | Why |
|-------|-----------|-----|
| **Framework** | React 18 + Vite | Keep current stack. Fast DX. |
| **Styling** | Tailwind CSS + shadcn/ui | Keep current. Re-themed to Kaivoo Design System. |
| **State** | Zustand (UI) + React Query (server) | UI-only state in Zustand. Server data via React Query → Hub API |
| **Markdown** | TipTap (editing) + marked/remark (rendering) | Rich text editing and rendering for journal/notes |
| **File Previews** | PDF.js, Video.js, SheetJS, Monaco | In-browser previews for all file types |
| **Real-time** | WebSocket client | Live updates when files change |
| **Routing** | React Router v6 | Keep current |

## 9.3 AI Layer

| Component | Technology | Why |
|-----------|-----------|-----|
| **Local LLM** | Ollama | Runs Llama 3, Mistral locally on Mac Mini (16GB RAM supports 8B models) |
| **Cloud APIs** | Direct HTTP calls to Claude, OpenAI, Gemini | No framework overhead. BYOK. |
| **RAG Pipeline** | LangChain.js or custom | Retrieve relevant file chunks → send to AI with context |
| **Embeddings** | Local via Ollama (nomic-embed-text) | Semantic search without cloud dependency |
| **Vector Store** | SQLite with vector extension (sqlite-vss) or ChromaDB | Stores embeddings for semantic search |

## 9.4 Infrastructure

| Component | Technology | Why |
|-----------|-----------|-----|
| **Remote Access** | Tailscale (primary) or Cloudflare Tunnel | Secure access from any device without port forwarding |
| **Auth** | Supabase Auth | Keep existing. Handles login/signup. |
| **HTTPS** | Tailscale auto-TLS or self-signed + Cloudflare | Encrypted connections |
| **Monitoring** | PM2 dashboard + optional Sentry | Process health, error tracking |

---

# 10. Hub Server Architecture

## 10.1 API Endpoints

### Vault (File System)
```
GET    /api/vault/tree                    → Full directory tree
GET    /api/vault/tree/:path              → Subtree from path
GET    /api/vault/file/:path              → File content (text) or download (binary)
POST   /api/vault/file/:path              → Create file
PUT    /api/vault/file/:path              → Update file content
DELETE /api/vault/file/:path              → Soft delete (move to trash)
POST   /api/vault/folder/:path            → Create folder
POST   /api/vault/move                    → Move file/folder { from, to }
POST   /api/vault/upload/:path            → Upload binary file
GET    /api/vault/search?q=&type=&tags=   → Search files
GET    /api/vault/recent                  → Recently modified files
GET    /api/vault/starred                 → Bookmarked files
POST   /api/vault/star/:path              → Toggle star
GET    /api/vault/tags                    → All tags with counts
GET    /api/vault/storage                 → Disk usage stats
```

### Journal
```
GET    /api/journal/entries?from=&to=     → Entries in date range
GET    /api/journal/entry/:date           → Single entry by date
POST   /api/journal/entry/:date           → Create/update entry
GET    /api/journal/templates             → Available templates
GET    /api/journal/stats?from=&to=       → Word count, mood, streaks
```

### Tasks
```
GET    /api/tasks?status=&tag=&sort=      → Filtered task list
POST   /api/tasks                         → Create task
PUT    /api/tasks/:id                     → Update task
DELETE /api/tasks/:id                     → Delete task
GET    /api/tasks/:id/subtasks            → Subtasks
POST   /api/tasks/:id/subtasks            → Create subtask
PUT    /api/tasks/reorder                 → Reorder tasks
```

### Routines
```
GET    /api/routines                      → All routines + groups
POST   /api/routines                      → Create routine
PUT    /api/routines/:id                  → Update routine
POST   /api/routines/:id/complete/:date   → Mark complete
DELETE /api/routines/:id/complete/:date   → Unmark complete
GET    /api/routines/report?from=&to=     → Completion rates, streaks
```

### Concierge (AI)
```
POST   /api/concierge/message             → Send message to Concierge
GET    /api/concierge/conversations        → List conversations
GET    /api/concierge/conversation/:id     → Single conversation
GET    /api/concierge/agents               → List available agents
GET    /api/concierge/skills               → List available skills
GET    /api/concierge/providers            → List AI providers + status
PUT    /api/concierge/providers            → Update AI provider config
GET    /api/concierge/soul                 → Read soul file
PUT    /api/concierge/soul                 → Update soul file
```

### Settings
```
GET    /api/settings                      → App settings
PUT    /api/settings                      → Update settings
GET    /api/settings/widgets              → Widget layout
PUT    /api/settings/widgets              → Update widget layout
```

## 10.2 WebSocket Events

```
SERVER → CLIENT:
  file:created    { path, type }           → New file detected
  file:modified   { path, type }           → File changed
  file:deleted    { path }                 → File removed
  file:moved      { from, to }            → File moved/renamed
  task:updated    { id, changes }          → Task state change
  routine:updated { id, changes }          → Routine completion
  concierge:message { conversationId, message }  → AI response chunk
  concierge:complete { conversationId, result }  → AI task done

CLIENT → SERVER:
  subscribe:folder  { path }              → Watch specific folder
  unsubscribe:folder { path }             → Stop watching
```

## 10.3 File Watcher Flow

```
File changed on disk (any source: Finder, Obsidian, AI agent, etc.)
    │
    ▼
chokidar detects change
    │
    ▼
Hub Server processes:
  1. If .md: re-parse frontmatter, update tags in SQLite, update FTS index
  2. If binary: update file_index metadata (size, modified_at, hash)
  3. Broadcast WebSocket event to all connected clients
    │
    ▼
All browsers update in real-time
```

---

# 11. Data Model: Files vs Database

## 11.1 Decision Matrix

| Data Type | Storage | Reasoning |
|-----------|---------|-----------|
| **Journal entries** | 📁 Files (.md) | Human-readable, Obsidian-compatible, versionable |
| **Notes / pages** | 📁 Files (.md) | Same as journal |
| **Uploaded media** | 📁 Files (original format) | Must be real files |
| **Agent definitions** | 📁 Files (.md) | Human-editable, versionable |
| **Skill definitions** | 📁 Files (.md) | Human-editable, versionable |
| **Soul file** | 📁 File (.md) | Human-editable |
| **Conversations** | 📁 Files (.md) | Human-readable, searchable |
| **Brand guidelines** | 📁 Files (.md) | Human-editable |
| **Tasks** | 🗄️ SQLite | Structured (status, priority, dates, ordering) |
| **Subtasks** | 🗄️ SQLite | Structured (parent relationship, ordering) |
| **Routines** | 🗄️ SQLite | Structured (streaks, completions, schedules) |
| **Routine completions** | 🗄️ SQLite | Time-series data |
| **Tags index** | 🗄️ SQLite | Fast lookup, count aggregation |
| **File index** | 🗄️ SQLite | Search, filter, sort by metadata |
| **Search index** | 🗄️ SQLite FTS5 | Full-text search |
| **Embeddings** | 🗄️ SQLite-vss or ChromaDB | Semantic search vectors |
| **Widget settings** | 🗄️ SQLite | Structured layout config |
| **App settings** | 📁 File (JSON) | Human-editable, simple |
| **AI provider config** | 📁 File (JSON) | Contains API keys, human-editable |
| **Meetings** | 🗄️ SQLite | Structured (times, attendees, calendar sync) |
| **Starred items** | 🗄️ SQLite | Simple bookmarks |

## 11.2 SQLite Schema

```sql
-- Tasks (migrated from Supabase)
CREATE TABLE tasks (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'todo' CHECK (status IN ('backlog','todo','doing','done','archived')),
  priority TEXT DEFAULT 'none' CHECK (priority IN ('none','low','medium','high','urgent')),
  due_date TEXT,
  start_date TEXT,
  estimated_minutes INTEGER,
  actual_minutes INTEGER,
  tags TEXT DEFAULT '[]',       -- JSON array
  topic_path TEXT,              -- folder path in vault
  parent_id TEXT REFERENCES tasks(id),
  position INTEGER DEFAULT 0,
  source_link TEXT,
  recurrence TEXT,              -- JSON: { type, interval, days }
  created_at TEXT DEFAULT (datetime('now')),
  completed_at TEXT,
  archived_at TEXT
);

-- Subtasks
CREATE TABLE subtasks (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  task_id TEXT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  completed INTEGER DEFAULT 0,
  position INTEGER DEFAULT 0,
  completed_at TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Routines
CREATE TABLE routine_groups (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  name TEXT NOT NULL,
  icon TEXT,
  color TEXT,
  position INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE routines (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  name TEXT NOT NULL,
  icon TEXT,
  group_id TEXT REFERENCES routine_groups(id),
  position INTEGER DEFAULT 0,
  target_days TEXT DEFAULT '[1,2,3,4,5,6,7]',  -- JSON array
  reminder_time TEXT,
  streak INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE routine_completions (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  routine_id TEXT NOT NULL REFERENCES routines(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  completed_at TEXT DEFAULT (datetime('now')),
  notes TEXT,
  UNIQUE(routine_id, date)
);

-- Meetings
CREATE TABLE meetings (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  title TEXT NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  location TEXT,
  description TEXT,
  attendees TEXT DEFAULT '[]',   -- JSON array
  is_external INTEGER DEFAULT 0,
  source TEXT,
  external_id TEXT,
  topic_path TEXT,
  notes TEXT,
  tags TEXT DEFAULT '[]',
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- File Index (metadata for all vault files)
CREATE TABLE file_index (
  path TEXT PRIMARY KEY,          -- relative to vault root
  filename TEXT NOT NULL,
  extension TEXT,
  file_type TEXT,                 -- 'video','document','image','presentation','markdown','code','audio','archive','other'
  size_bytes INTEGER,
  tags TEXT DEFAULT '[]',         -- JSON array
  frontmatter TEXT,               -- JSON of YAML frontmatter
  content_hash TEXT,
  created_at TEXT,
  modified_at TEXT,
  extracted_text TEXT              -- for search (PDFs, PPTX, etc.)
);

-- Full-Text Search
CREATE VIRTUAL TABLE search_index USING fts5(
  path,
  filename,
  content,
  tags,
  tokenize='porter'
);

-- Tags (aggregated)
CREATE TABLE tags (
  name TEXT PRIMARY KEY,
  count INTEGER DEFAULT 1,
  color TEXT,
  last_used TEXT
);

-- Starred Items
CREATE TABLE starred (
  path TEXT PRIMARY KEY,
  starred_at TEXT DEFAULT (datetime('now'))
);

-- Widget Settings
CREATE TABLE widget_settings (
  widget_key TEXT PRIMARY KEY,
  settings TEXT NOT NULL,          -- JSON
  position INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- App Settings
CREATE TABLE app_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

-- Indexes
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_due ON tasks(due_date);
CREATE INDEX idx_tasks_created ON tasks(created_at DESC);
CREATE INDEX idx_routines_group ON routines(group_id);
CREATE INDEX idx_routine_comp_date ON routine_completions(date);
CREATE INDEX idx_routine_comp_routine ON routine_completions(routine_id);
CREATE INDEX idx_meetings_time ON meetings(start_time);
CREATE INDEX idx_file_index_type ON file_index(file_type);
CREATE INDEX idx_file_index_modified ON file_index(modified_at DESC);
```

---

# 12. Real-Time Sync

## 12.1 Architecture

```
DEVICE A (Phone)          HUB SERVER              DEVICE B (Laptop)
    │                         │                         │
    │  WS: connected          │          WS: connected  │
    │◄────────────────────────│────────────────────────►│
    │                         │                         │
    │  User edits journal     │                         │
    │  PUT /api/journal/...   │                         │
    │────────────────────────►│                         │
    │                         │  Write to disk          │
    │                         │  Update SQLite index    │
    │                         │                         │
    │  WS: file:modified      │  WS: file:modified     │
    │◄────────────────────────│────────────────────────►│
    │                         │                         │
    │  (already has latest)   │  React Query invalidate │
    │                         │  Re-fetch + re-render   │
    │                         │                         │
```

All file operations go through the Hub API. The Hub writes to disk, updates indexes, and broadcasts changes to all connected WebSocket clients. Clients use React Query's cache invalidation to re-render.

---

# 13. Security & Authentication

## 13.1 Auth Flow

```
1. User opens https://kaivoo-hub.tailnet/ (or Cloudflare Tunnel URL)
2. React app loads
3. Browser sends httpOnly cookie with existing session token
4. If no valid session → redirect to /auth (login/signup)
5. Hub server proxies credentials to Supabase Auth
6. Supabase Auth validates → returns JWT + refresh token
7. Hub server sets httpOnly, Secure, SameSite=Strict cookies
   (access_token: 15 min TTL, refresh_token: 7 day TTL, rotated on use)
8. All subsequent Hub API calls automatically include cookies
9. Hub server validates JWT signature + expiry on every request
```

**Why httpOnly cookies instead of localStorage?** *(Updated per Agent 4: Security)*
- localStorage is accessible to any JavaScript — vulnerable to XSS
- Workshop plugins/widgets could exfiltrate tokens from localStorage
- httpOnly cookies are invisible to JavaScript, automatically sent with requests
- SameSite=Strict prevents CSRF attacks
- Hub server acts as auth proxy: browser never touches raw JWTs

**Why keep Supabase Auth for a local app?**
- Password hashing, session management, and JWT are solved problems
- Future multi-tenant/business hub will need proper auth anyway
- Supabase Auth is free tier and handles edge cases (password reset, session refresh)

## 13.2 Network Security

```
TAILSCALE:
  - All traffic encrypted (WireGuard)
  - Only devices on your Tailnet can reach the Hub
  - No open ports on router
  - No exposure to public internet

CLOUDFLARE TUNNEL (alternative):
  - HTTPS via Cloudflare's infrastructure
  - Access via kaivoo.yourdomain.com
  - Cloudflare Access can add additional login layer
  - Slightly more latency but no Tailscale app needed on devices
```

## 13.3 API Key Security

- AI API keys stored in `.kaivoo/ai-providers.json` on the Hub machine
- Keys never sent to the browser client
- All AI calls happen server-side (Hub → AI provider)
- File permissions: `chmod 600 .kaivoo/ai-providers.json`

---

# 14. Remote Access

## 14.1 Tailscale Setup (Recommended)

```
1. Install Tailscale on Mac Mini (Hub)
2. Install Tailscale on phone, laptop, desktop
3. All devices join the same Tailnet
4. Mac Mini accessible at: http://kaivoo-hub:3000
5. Optional: Enable Tailscale HTTPS for auto-TLS certificate
6. Optional: Use MagicDNS for friendly names
```

**Cost:** Free for personal use (up to 3 users, 100 devices)

## 14.2 Cloudflare Tunnel (Alternative)

```
1. Register domain (e.g., kaivoo.app) — ~$10/year
2. Install cloudflared on Mac Mini
3. Create tunnel: cloudflared tunnel create kaivoo
4. Configure: route kaivoo.yourdomain.com → localhost:3000
5. Access from anywhere: https://kaivoo.yourdomain.com
6. Optional: Cloudflare Access for additional auth layer
```

---

# 16. Reference Pointers

> **Migration Plan:** See [Agent-3-Docs/Architecture-Migration-Plan.md](Agent-3-Docs/Architecture-Migration-Plan.md) for the Supabase → Local migration plan.

> **Development Roadmap:** See [Vision.md](../../Vision.md) for the phased roadmap. The Director manages sprint planning.

> **Future Extensions:** See [Vision.md](../../Vision.md) Phase 5 for growth and scaling plans.

> **Mac Mini Setup:** See [Agent-3-Docs/Operations-Mac-Mini-Setup.md](Agent-3-Docs/Operations-Mac-Mini-Setup.md) for the deployment checklist.

---

# Appendix B: Key File Specifications

## Markdown File (Journal / Note)
```markdown
---
tags: [tag1, tag2]
created: 2026-02-20T14:30:00
modified: 2026-02-20T15:45:00
mood: good                          # Journal only
word_count: 847                     # Auto-calculated
---

# Title

Content with **bold**, *italic*, [[wikilinks]], and #inline-tags.

- [ ] Unchecked task
- [x] Checked task

> Blockquote

```code block```
```

## Agent File
```markdown
---
name: Agent Name
description: What this agent does
preferred_ai: claude/opus
fallback_ai: openai/gpt4o
skills_required: [skill-name-1, skill-name-2]
input_types: [url, text, file-reference]
output_type: pptx | pdf | md | txt
output_folder: Agent Workspace/Subfolder
ask_for_location: true | false
ask_for_tags: true | false
ask_for_brand: true | false
brand_search_folder: Brand Guidelines
---

# Agent Name

## Role
Description of what this agent does.

## Process
1. Step one
2. Step two

## Required Context
- What it needs to know to do its job
```

## Skill File
```markdown
---
name: Skill Name
description: What this skill does
type: tool
endpoint: /api/skills/skill-name
parameters:
  - name: param1
    type: string
    required: true
  - name: param2
    type: number
    default: 1
---

# Skill Documentation
How the skill works and what it produces.
```

---

**Kaivoo Hub — System Architecture v1.0**
**February 2026**

*Your data. Your machine. Your AI. Your rules. Your platform.*
