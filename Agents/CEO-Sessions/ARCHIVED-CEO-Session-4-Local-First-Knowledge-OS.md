# CEO Session #4 — Local-First Knowledge OS

**Date:** March 1, 2026
**Participants:** Founder + CEO Agent
**Status:** Approved — Ready for Director handoff

---

## Strategic Brief: Topics as Local-First Knowledge OS

### Opportunity

The $249 one-time purchase model is fundamentally incompatible with the current Supabase cloud architecture. Selling a desktop product that depends on cloud infrastructure the company pays for indefinitely creates inverted unit economics — every sale increases hosting costs with no recurring revenue to cover them. Meanwhile, the Topics page (CEO Priority #1) is an underbuilt feature that should be the centerpiece of the product's value proposition.

These two problems solve each other: rebuilding Topics as a local-first file system creates the storage model the business requires AND delivers the "second brain" experience that justifies the $249 price tag.

### Target User

**The AI Power User / Self-Hoster** — uses Obsidian, Notion, or Apple Notes. Privacy-conscious. Wants to own their data as real files on their own machine. Willing to pay $249 for a polished, AI-enhanced productivity app that replaces their fragmented stack. The phrase "choose a folder and you're done" resonates deeply with this persona.

### Core Insight

Topics shouldn't be a tagging system that aggregates content from other surfaces. **Topics should BE the file system** — the single source of truth where all content and files live, browsable like Finder, but intelligent like a second brain. Journal entries, project notes, captures, attached files, embedded images — everything flows into Topics. Every other surface in the app (Today, Projects, Tasks) is a filtered view into Topics, not a separate data store.

The folder hierarchy on disk IS the topic hierarchy in the app. Users can browse their vault in Finder without the app. The app makes it smart — searchable, taggable, linked, AI-enhanced.

### Decisions Made

#### 1. Local-First Storage — Phase A Must-Have

| Item | Previous Status | New Status |
|---|---|---|
| Desktop packaging (Electron/Tauri) | Should-have | **Must-have** |
| Local save / data export | Should-have | **Must-have** (it's the entire storage model) |
| File attachments | Should-have | **Must-have** (files in the folder structure) |
| Data layer abstraction | Not planned | **Must-have** (SQLite locally, Supabase for Phase B cloud) |

**Supabase stays for development.** The team continues building against Supabase during development. The data layer abstraction enables swapping to SQLite for the shipped product without rewriting the frontend.

#### 2. Topics Hierarchy

Topics is the top-level organizational layer. The hierarchy is:

```
Topics > Projects > Tasks/Files
```

But not everything under a Topic must be a Project. A Topic can contain:
- Just notes (Recipes — no projects, just markdown files)
- Multiple projects (NUWAVE — five campaigns, each a project)
- Loose files and notes alongside projects
- Nothing at all (empty topic waiting to be filled)

**Projects are children of Topics, not siblings or parents.**

#### 3. Folder Structure on Disk

When the user chooses a vault folder (e.g., `~/Documents/Kaivoo`), the app creates:

```
~/Documents/Kaivoo/
├── Topics/
│   ├── NUWAVE/                          ← Topic
│   │   ├── Campaign-1/                  ← Project (child of topic)
│   │   │   ├── project.md
│   │   │   ├── launch-spot-v2.mp4       ← Attached file
│   │   │   ├── deck-final.pptx
│   │   │   └── instagram-carousel.png
│   │   ├── Campaign-2/                  ← Another project
│   │   └── notes.md                     ← Loose notes (not in a project)
│   │
│   ├── Recipes/                         ← Topic (no projects, just notes)
│   │   ├── Pasta-Recipe.md
│   │   └── .attachments/
│   │       └── pasta-screenshot.jpg     ← Image embedded in note
│   │
│   └── Work/
│       ├── Client-X/                    ← Sub-topic or project
│       └── Client-Y/
│
├── Journal/
│   ├── 2026-03-01.md
│   └── 2026-03-02.md
├── Captures/
├── .kaivoo/
│   ├── db.sqlite          ← Index, metadata, relationships, search
│   ├── soul.json          ← Concierge personality/memory
│   └── settings.json      ← App config, AI keys, preferences
```

**Real files on disk. SQLite as the metadata/index layer.** Files are browsable in Finder without the app. The app makes them smart.

#### 4. Convention with Flexibility

The app is **opinionated by default, permissive by nature**:
- The setup wizard creates the default folder structure
- The app suggests filing locations based on context (topic, tags, project)
- But if a user manually rearranges files in Finder, the app detects the change and updates its index
- New users get guided structure. Power users rearrange however they want

**Source of truth for relationships** (which project a file belongs to, which topic a note is under) lives in the **SQLite metadata** — not in folder position. The folder structure is the default representation, but it's a view, not a constraint.

#### 5. Hashtags as Virtual Groupings (Not Folders)

Hashtags like `#video`, `#presentation`, `#reference` are **filters**, not physical subfolders. A file can have multiple tags but can only be in one folder. The Topics browser lets you view content as if tags were folders, but the underlying storage stays flat within each topic/project folder.

#### 6. File Attachments and Images in Notes

Two use cases, both Phase A must-haves:

**Files attached to projects/tasks:** A project folder can contain any file — PPTs, videos, images, PDFs. These are stored in the project's folder on disk and indexed by the app. Searchable by name, tag, file type, and parent topic/project.

**Images embedded in notes:** Users can paste or attach an image into a journal entry, capture, or note. The image is saved to a `.attachments/` folder adjacent to the note. In the app, the image renders inline within the note. When browsing Topics or searching, the note appears with its embedded image.

#### 7. Export Entry to Document

Users can export a journal entry, capture, or any text content to a standalone file:
- Hit export on an entry
- Choose a location in the Topics folder structure
- The text becomes a `.md` file in that location
- It's now a first-class document in Topics — browsable, searchable, taggable

#### 8. One Codebase, Swappable Backend

```
┌─────────────────────────────────────────┐
│           React Frontend                │
│         (same codebase)                 │
├─────────────────────────────────────────┤
│         Data Service Layer              │
│   topics.service / journal.service      │
├──────────────┬──────────────────────────┤
│ LocalAdapter │     CloudAdapter         │
│  (SQLite +   │     (Supabase)           │
│  file system)│                          │
└──────────────┴──────────────────────────┘
```

- Phase A ships with LocalAdapter only (desktop app)
- Phase B adds CloudAdapter (existing Supabase code, minimally refactored)
- Phase B cloud subscribers get sync between local and cloud
- The React code doesn't care which adapter it's using
- **No codebase split until Phase A ships**

#### 9. Cross-Platform from One Codebase

Both Electron and Tauri produce builds for all three platforms:
- `.dmg` for macOS
- `.exe` / `.msi` for Windows
- `.AppImage` / `.deb` for Linux

No separate codebases. Platform differences (file paths, system tray, auto-update, code signing) are build configuration, not application code.

#### 10. Obsidian Import

**Scope:** File copy. A feature, not a headline.

- Setup wizard offers "Import from Obsidian?" option
- User picks their vault folder
- Kaivoo copies `.md` files into the Topics folder structure
- Existing Obsidian folder hierarchy maps to Topics/sub-topics
- `#hashtags` and `[[wiki-links]]` are indexed (compatible syntax)
- No plugin data, no `.obsidian/` config, no frontmatter parsing, no backlink graph
- Default is copy (safe). Power user option to adopt the folder in-place.

#### 11. Setup Experience (Phase A)

1. User downloads Kaivoo desktop app
2. Setup wizard: "Choose a folder for your Kaivoo vault"
3. AI configuration: pick provider, enter API key, set depth preference
4. Concierge hatching: name it, set tone
5. Optional: import from Obsidian vault
6. Guided tour of the product
7. Done. No account needed. No cloud. Everything local.

#### 12. Phase B Cloud Play (Strengthened)

Local-first in Phase A makes the Phase B subscription more compelling:
- Phase A: "$249. Everything's local. You own it."
- Phase B: "Want it on your phone? Want cross-device sync? Want your team to share? That's One Workflow Cloud — $X/mo."

The subscription sells **sync, access, and collaboration** — not storage the user can already do locally. This is the Obsidian model but with a premium starting point justified by the AI concierge and full feature set.

---

### Recommendation

The Director should sequence Phase A sprints to account for this architectural shift:

**Immediate priorities:**
1. **Sprint 19 (Topics & Quality)** can proceed as planned — the Topics UX restructure and bundle optimization are still valid and needed. But the Topics restructure should be designed with the local-first file browser in mind, even if it's still running on Supabase for now.

2. **Electron vs. Tauri evaluation** — Agent 9 must deliver this quickly. It blocks the desktop packaging sprint and every local-first feature.

3. **Data layer abstraction design** — Agent 3 must design the adapter interface and SQLite schema. This can run as a research parcel in parallel with Sprint 19.

**Near-term sprint candidates (post-Sprint 19):**
- Desktop packaging sprint (depends on Electron/Tauri decision)
- Data layer abstraction sprint (refactor services to adapter pattern)
- Local storage sprint (SQLite + file system implementation)
- File attachments + image embedding sprint
- Setup wizard + Obsidian import sprint

**The Director decides sequencing.** The CEO's guidance is: desktop packaging and data abstraction are the critical path. Everything else builds on top of them.

### Open Questions (for Research)

| Question | Owner | Urgency |
|---|---|---|
| Electron vs. Tauri — which framework for desktop packaging? | Agent 9 (DevOps) | **Blocks everything** — evaluate immediately |
| SQLite schema — mirror Supabase or redesign for local-first? | Agent 3 (Architect) | High — design the adapter interface and local schema |
| File watching — how does the app detect manual file changes on disk? | Agent 3 (Architect) | Medium — needed for "permissive by nature" design |
| Obsidian `[[wiki-link]]` compatibility — any syntax conflicts with Kaivoo's implementation? | Agent 2 (Software Engineer) | Low — verify during import sprint |
| Auto-update mechanism for desktop app — how do users get updates? | Agent 9 (DevOps) | Medium — needed before Phase A ships |
| Code signing — Apple notarization + Windows signing process | Agent 9 (DevOps) | Medium — needed before distribution |

### Vision Alignment

This directly serves:
- **Core Principle #1** ("You own your data. Every file is a real file.")
- **Core Principle #2** ("No black boxes." — SQLite and files are inspectable)
- **Core Principle #6** ("Built to ship." — local-first solves the unit economics problem)
- **Core Principle #7** ("Revenue is a feature." — the business model now works)
- **Phase A Remaining: Topics page restructure** (elevated from UX fix to strategic centerpiece)
- **Phase A Remaining: Local save / data export** (now the entire storage architecture)
- **Phase A Remaining: File attachments** (now integral to the file system)
- **Phase B: One Workflow Cloud** (strengthened — cloud sync becomes the subscription value, not basic storage)
- **Phase C: The Vault** (the Phase A local file system IS the early version of The Vault)

### Vision.md Updates Required

The following items need to be updated in Vision.md to reflect this session's decisions:

1. **Topics page restructure** — update description from "intuitive organization, cleaner UX" to "local-first knowledge OS, file-system-like browser, single source of truth for all content and files"
2. **Local save / data export** — update from standalone item to "core storage architecture (SQLite + file system vault)"
3. **File attachments** — promote to must-have, note it's part of the local file system
4. **Desktop packaging** — promote from should-have to must-have with note about business model requirement
5. **Add new item:** Data layer abstraction (LocalAdapter/CloudAdapter pattern)
6. **Add new item:** Setup wizard vault selection + Obsidian import
7. **Phase C: The Vault** — add note that Phase A local file system is the architectural foundation for The Vault
8. **Key decisions resolved** — add CEO Session #4 decisions

---

*CEO Session #4 — March 1, 2026*
*Strategic brief approved. Ready for Director handoff.*
