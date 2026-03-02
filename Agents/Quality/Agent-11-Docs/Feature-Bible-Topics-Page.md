# Feature Use Case Bible — Topics Page

**Version:** 0.1 (Sprint 19 baseline)
**Status:** COMPLETE — All questions resolved, Knowledge OS context integrated
**Scope:** TOPICS PAGE ONLY — Topics list, Topic detail, Page detail, all topic widgets
**Compiled by:** Agent 11 (Feature Integrity Guardian)
**Date:** March 1, 2026
**Purpose:** Define what the Topics system does, what currently works, what's broken, what it should become in Sprint 19, and what must never be lost. This document is the contract for Sprint 19 P3 (UX Restructure) and all future topics work.

---

## How to Read This Document

Each section follows the standard Feature Bible structure:

1. **Core Principle** — One sentence defining what Topics is about
2. **Current Working Behavior** — What works today and must be preserved
3. **Issues to Fix** — What's broken or missing (Sprint 19 scope)
4. **Target UX** — What each surface should look like after Sprint 19
5. **Knowledge OS Future Context** — Strategic direction that informs Sprint 19 design decisions
6. **Empty States** — Every empty state defined
7. **Loading and Error States** — Skeleton, error, and rollback UX
8. **Resolved Questions** — Design decisions locked in
9. **Settings** — Topic-related settings (if any)
10. **Must-Never-Lose Checklist** — The regression contract

---

# TOPICS

## 1. Core Principle

**Topics is the knowledge layer — every piece of content in Kaivoo lives under a Topic.** Topics organize the user's world into named containers (Topics) with optional sub-containers (Pages). All journal entries, captures, tasks, and projects link to Topics via `[[double-bracket]]` syntax or explicit assignment. The Topics page is a browsable knowledge base, not a settings screen.

---

## 2. Current Working Behavior (Must-Never-Lose)

Everything in this section works today and must survive Sprint 19 intact.

### 2.1 Data Model

**Topic** (`src/types/index.ts:9-16`):
```typescript
interface Topic {
  id: string;
  name: string;
  parentId?: string;   // exists in schema but unused in UI
  icon?: string;       // exists in schema but never set via UI
  description?: string;
  createdAt: Date;
}
```

**TopicPage** (`src/types/index.ts:18-24`):
```typescript
interface TopicPage {
  id: string;
  topicId: string;     // parent topic
  name: string;
  description?: string;
  createdAt: Date;
}
```

**Key relationship:** TopicPage belongs to Topic. A Topic can have zero or many Pages. Pages cannot be nested under other Pages. Content entities (captures, journal entries, tasks) store a `topicIds: string[]` array that can reference both Topic IDs and Page IDs.

**Project-to-Topic link:** Projects have an optional `topicId?: string` field, establishing a parent-child relationship (Topics > Projects).

### 2.2 Topics List Page (`/topics`)

**File:** `src/pages/Topics.tsx`

What works:
- **Header** shows total count of topics and pages (`{topics.length} topics, {topicPages.length} pages`)
- **Create Topic dialog** — "New Topic" button opens a dialog with name input, Enter-to-submit
- **Search bar** — filters topics by name (case-insensitive `topic.name.includes(searchQuery)`)
- **Topic rows** — each row shows: expand/collapse chevron, folder icon, topic name (clickable, navigates to `/topics/:topicId`), content counts (`{captureCount} captures . {taskCount} tasks`)
- **Expand/collapse** — clicking the chevron toggles nested pages visibility. First topic (`topic-1`) starts expanded by default
- **Nested page rows** — indented under topic with left border, show: file icon, page name (clickable, navigates to `/topics/:topicId/pages/:pageId`), page-level content counts
- **Topic actions dropdown** — hover reveals a `...` menu with "Add Page" and "Delete Topic" options
- **Add Page via dropdown** — opens a Create Page dialog pre-associated with the topic
- **Delete Topic** — calls `deleteTopic()` which removes the topic and cascades to delete all its pages from the store
- **Create Page dialog** — separate dialog for creating a page under a specific topic
- **Empty state** — when no topics exist: folder icon, "No topics yet", guidance text "Create your first topic to organize your captures and tasks"
- **Search empty state** — "No topics found" with "Try a different search term"

### 2.3 Topic Detail Page (`/topics/:topicId`)

**File:** `src/pages/TopicPage.tsx`

What works:
- **Breadcrumb navigation** — `Topics > [TopicName]` for topics, `Topics > [TopicName] > [PageName]` for pages. Each segment is a clickable link
- **Header** — displays icon (FolderOpen for topics, FileText for pages), name, description (if set)
- **Pages section** — horizontal scrollable card row showing all pages under this topic. Each card shows: file icon, page name, mention count, task count. Cards link to `/topics/:topicId/pages/:pageId`. Only visible when viewing a topic (not a page)
- **Tags widget** (`TopicTagsWidget`) — collects all tags from journal entries, captures, and tasks linked to this topic/page. Displays as clickable pill chips sorted by usage count. Clicking a tag sets it as a filter. "Clear filter" link when a tag is active. Only renders when tags exist
- **Mentions widget** (`TopicCapturesWidget`) — combines journal entries and captures, sorted by date (newest first). Tag filter applies to this widget. Each item shows: source icon (BookOpen for journal, Globe for capture), content (with markdown rendering and expand/collapse for long content), date, time, tags. Captures are clickable and open `CaptureEditDialog` for editing. Empty state: `No mentions yet. Use [[TopicName]] in your journal to add content here.`
- **Tasks widget** (`TopicTasksWidget`) — shows tasks linked to this topic/page. Separated into pending (with priority color circles) and completed (strikethrough, max 2 shown, "+N more completed" overflow). Click toggles task status between todo and done. Empty state: `No tasks linked to {topicName} yet.`
- **Content aggregation** — when viewing a topic, content from ALL child pages bubbles up. The `getCapturesByTopic`, `getJournalEntriesByTopic`, and `getTasksByTopic` selectors in `useKaivooStore` automatically include content that references the topic OR any of its child pages
- **Not-found state** — if topic/page doesn't exist: folder icon, "Topic not found", "Back to Topics" button

### 2.4 `[[Double-bracket]]` Linking

**How it works:** When a user types `[[TopicName]]` or `[[TopicName/PageName]]` in a journal entry, capture, or task, the app resolves the path to topic/page IDs using `resolveTopicPath(path, autoCreate)`. If `autoCreate` is true, non-existent topics and pages are created on-the-fly.

- `resolveTopicPath("NUWAVE")` returns `["topic-1"]`
- `resolveTopicPath("NUWAVE/Amani")` returns `["topic-1", "page-1"]`
- The resolved IDs are stored in the entity's `topicIds` array

This linking is used in:
- `JournalWidget` / `JournalCanvas` — journal entry creation
- `CaptureEditDialog` — capture editing
- `TaskDetailsDrawer` — task topic assignment
- `FloatingChat` — AI-created content
- `DailyShutdown` — daily review entries

### 2.5 Topic Picker in Task Details

**File:** `src/components/TaskDetailsDrawer.tsx`

The task details drawer has a "Topics" section where the user can:
- See currently linked topics as `[[TopicName]]` badges
- Remove a topic link by clicking the X on a badge
- Add a topic link via a popover that lists all topics (with nested pages)
- Topics in the picker show expand/collapse for pages
- Selecting a topic adds its ID to the task's `topicIds` array

### 2.6 TopicTagEditor Component

**File:** `src/components/widgets/TopicTagEditor.tsx`

A reusable component used in capture editing and journal entry dialogs:
- Shows current topic as a badge (`[[TopicName]]`) or "Add topic" button
- Topic picker popover with: AI-suggested new topics, existing topics list (with expandable pages), create new topic input
- Tag management: existing tags as badges with remove buttons, add tag popover with AI-suggested and existing tags, create new tag input
- Marks new topics/tags with `[NEW]` indicator

### 2.7 TopicPagePicker Component

**File:** `src/components/TopicPagePicker.tsx`

A floating dropdown picker for selecting topics/pages:
- Lists all topics (except `topic-daily-notes`) with folder icons
- Expand to show nested pages
- Plus button to create a new page inline (text input appears under the topic)
- Click-outside-to-close behavior
- Used in journal linking contexts

### 2.8 Search Integration

**Files:** `src/services/search.service.ts`, `src/components/search/SearchCommand.tsx`

- Topics and topic pages are searchable entity types in the global search command (`Cmd+K`)
- Search results for topics navigate to `/topics/:topicId`
- Search results for topic pages navigate to `/topics/:topicId/pages/:pageId`
- Topics filter category exists in the search command filter tabs

### 2.9 Service Layer

**File:** `src/services/topics.service.ts`

Current operations:
- `fetchTopics(userId)` — fetch all topics ordered by `created_at`
- `fetchTopicPages(userId)` — fetch all pages ordered by `created_at`
- `fetchTags(userId)` — fetch all tags ordered by name
- `createTopic(userId, topic)` — creates topic with dedup (case-insensitive name match under same parent)
- `deleteTopic(userId, id)` — deletes topic
- `createTopicPage(userId, page)` — creates page with dedup (case-insensitive name match under same topic)
- `createTag(userId, name, color?)` — creates tag
- `dbToTopic(row)` / `dbToTopicPage(row)` / `dbToTag(row)` — DB row to app type converters

**Missing from service:** `updateTopic`, `updateTopicPage`, `deleteTopicPage`

### 2.10 Store Architecture (Current — Dual Store Problem)

Two stores manage topic state independently:

**`useKaivooStore`** (`src/stores/useKaivooStore.ts`) — the primary store used by all pages and components. Persists to `kaivoo-storage` localStorage key. Contains:
- `topics`, `topicPages`, `tags` arrays
- `addTopic`, `deleteTopic`, `addTopicPage`
- `getTopicById`, `getTopicByName`, `getTopicPages`
- `resolveTopicPath`, `getTopicPath`
- `getCapturesByTopic`, `getJournalEntriesByTopic`, `getTasksByTopic` (with child page aggregation)
- `addTag`, `getOrCreateTag`

**`useTopicStore`** (`src/stores/useTopicStore.ts`) — a secondary standalone store that duplicates topic/page/tag management. Persists to `kaivoo-topics` localStorage key. Contains the same operations as the topic section of `useKaivooStore`.

**Problem:** Both stores can get out of sync. `useKaivooStore` is the one actually used in all page components. `useTopicStore` is used by some pickers (`TopicTagEditor`, `TopicPagePicker`). Sprint 19 P2 eliminates `useTopicStore` entirely.

### 2.11 Actions Layer

**File:** `src/hooks/useKaivooActions.ts`

Topic-related actions with optimistic update + Supabase sync:
- `addTopic(topicData)` — creates topic in DB, adds to store, invalidates cache
- `addTopicPage(pageData)` — creates page in DB, adds to store, invalidates cache
- `deleteTopic(id)` — optimistic delete from store, then DB sync with rollback on error
- `resolveTopicPathAsync(path, autoCreate)` — async version of path resolution that uses DB-backed creation

**Missing from actions:** `updateTopic`, `updateTopicPage`, `deleteTopicPage`

---

## 3. Issues to Fix (Sprint 19 Scope)

### 3.1 Dead/Non-functional UI (3 issues)

| # | Issue | File:Line | Details |
|---|---|---|---|
| 1 | "Configure" button does nothing | `TopicPage.tsx:101-104` | `<Button>` with Settings2 icon, no `onClick` handler. Renders on every topic and page detail view. |
| 2 | "New Page" card is dead | `TopicPage.tsx:144-149` | Dashed-border card with Plus icon and "New Page" text. Has `cursor-pointer` class but no `onClick`. Appears at end of pages scroll row. |
| 3 | "Add Task" button does nothing | `TopicTasksWidget.tsx:41-44` | Ghost button with Plus icon and "Add Task" label in the tasks widget header. No `onClick` handler. |

### 3.2 Missing CRUD Operations (4 issues)

| # | Issue | Details |
|---|---|---|
| 4 | No topic/page rename | No `updateTopic` or `updateTopicPage` in service, store, or actions layer. The `name` field cannot be edited after creation. |
| 5 | No page deletion | `deleteTopicPage` does not exist anywhere. Users can delete entire topics but not individual pages. |
| 6 | No description editing | `description` field exists on both Topic and TopicPage types, is stored in the DB, and is displayed in the header when set, but there is no UI to create or edit it. |
| 7 | No icon editing | `icon` field exists on Topic type and in the DB schema, but is never set or displayed. All topics show a generic FolderOpen icon. |

### 3.3 Architecture Issues (2 issues)

| # | Issue | Details |
|---|---|---|
| 8 | Dual store divergence | `useTopicStore` and `useKaivooStore` both manage topics independently. `TopicTagEditor` and `TopicPagePicker` read from `useKaivooStore` directly but `useTopicStore` persists separately and can diverge. Consolidation needed. |
| 10 | Hardcoded `topic-daily-notes` | Initial mock data includes a hardcoded "Daily Notes" topic. `TopicPagePicker` filters it out. If deleted, related logic could break. **DEFERRED** — complex, risk of breaking journal. |

### 3.4 UX Flow Gaps (5 issues)

| # | Issue | Details |
|---|---|---|
| 11 | No topic-scoped task creation | The "Add Task" button in `TopicTasksWidget` has no handler. When it works, it should pre-tag the new task to the current topic/page. |
| 12 | Tag filter scope limited | `selectedTag` from `TopicTagsWidget` only filters the Mentions widget (`TopicCapturesWidget`). The Tasks widget (`TopicTasksWidget`) ignores the selected tag entirely. |
| 13 | Topic search doesn't find pages | The search bar in `Topics.tsx:79-81` only filters `topic.name`. It does not search page names. A user searching "Amani" would find nothing even though the "Amani" page exists under NUWAVE. |
| 14 | No sibling page navigation | When viewing a page (`/topics/:topicId/pages/:pageId`), there's no way to navigate to sibling pages without going back to the topic detail view. |
| 15 | No empty state guidance | The Topics list has basic empty states, but topic detail has no guidance for new topics with no content. Users don't know how to add content to a topic. |

---

## 4. Target UX (Sprint 19)

### 4.1 Topics List Page (`/topics`)

**Layout:** Max-width container (4xl), standard AppLayout with sidebar.

**Header:**
- Title: "Topics"
- Subtitle: `{N} topics, {M} pages`
- Action: "New Topic" button (existing, preserve)

**Search bar:**
- Searches BOTH topic names AND page names (case-insensitive)
- When a page matches, its parent topic should auto-expand to reveal the matching page
- Placeholder: `Search topics and pages...`

**Topic rows:**
- Expand/collapse chevron (existing, preserve)
- Topic icon: emoji chosen by user (or FolderOpen default if no icon set)
- Topic name: clickable, navigates to topic detail
- Description preview: first ~50 characters of description, truncated with ellipsis, muted text (only if description exists)
- Content counts: `{captureCount} captures . {taskCount} tasks` (existing, preserve)
- Actions dropdown (hover reveal, existing):
  - "Add Page" (existing, preserve)
  - "Rename" (new — triggers inline rename mode on the topic name)
  - "Delete Topic" (existing, preserve — destructive styling)

**Nested page rows:**
- Indented with left border line (existing, preserve)
- File icon, page name, page-level counts (existing, preserve)

**Create Topic dialog:** Preserve existing dialog behavior. No changes needed.

**Create Page dialog:** Preserve existing dialog behavior. No changes needed.

### 4.2 Topic Detail Page (`/topics/:topicId`)

**Breadcrumb:** `Topics > [TopicName]` (existing, preserve)

**Header:**
- **Icon:** Displayed to the left of the name. If set, shows the user's chosen emoji. If not set, shows FolderOpen icon. Clicking the icon opens the emoji picker (see Section 8 — Resolved Questions).
- **Name:** `<h1>` with inline click-to-edit. Double-click or click an edit icon to enter edit mode. Press Enter to save, Escape to cancel. Follows the Inline Editor pattern from `Interaction-Patterns.md`.
- **Description:** Below the name. If set, shows the description text. If empty, shows placeholder text "Add a description..." in muted/italic style. Click to enter edit mode (single-line text input). Press Enter to save, Escape to cancel.
- **Configure button:** REMOVED from header. Its functionality (rename, description, icon) is now handled inline. Delete is in the topic actions dropdown on the list page. No separate "Configure" button needed.

**Pages section:**
- Horizontal scrollable card row (existing, preserve)
- Each page card: file icon, page name, mention count, task count (existing, preserve)
- **"New Page" card:** Now functional. Clicking it opens the Create Page dialog with `topicId` pre-set to the current topic. Same dialog as the "Add Page" action in the list page dropdown.

**Projects section (new — anticipating Knowledge OS):**
- Heading: "Projects" with count
- Lists projects where `project.topicId === currentTopicId`
- Each project shown as a compact row or card: project icon/color, name, status badge, task count
- Clicking navigates to `/projects/:projectId`
- If no projects: show subtle empty state "No projects under this topic."
- This section is a read-only listing in Sprint 19 — project-to-topic assignment is done from the Projects page. No create/assign UI needed here yet. The purpose is to surface the Topics > Projects relationship and leave visual room for the Knowledge OS file-browser expansion.

**Tags widget:**
- Preserve existing behavior
- Tags are collected from all content (journal entries, captures, tasks) linked to this topic AND its child pages

**Mentions widget (Content section):**
- Preserve existing behavior
- Tag filter from Tags widget applies here (existing)
- Empty state: `No mentions yet. Use [[{TopicName}]] in your journal to add content here.`

**Tasks widget:**
- Preserve existing behavior (pending/completed split, priority colors, toggle)
- **"Add Task" button:** Now functional. Opens the standard create-task flow (or a lightweight inline input) with the task's `topicIds` pre-set to `[currentTopicId]`
- **Tag filter:** When a tag is selected in the Tags widget, the Tasks widget also filters to show only tasks with that tag. The `selectedTag` state needs to be passed to `TopicTasksWidget`.
- Empty state: `No tasks linked to {topicName} yet.`

**Empty state guidance (for new/empty topics):**
When a topic has no pages, no mentions, and no tasks, show a centered guidance block:
```
[FolderOpen icon]
"{TopicName}" has no content yet.

Here's how to add content to this topic:
  - Type [[{TopicName}]] in your journal to link entries here
  - Create a task and assign it to this topic
  - Add a page to organize sub-topics
```

### 4.3 Page Detail Page (`/topics/:topicId/pages/:pageId`)

**Breadcrumb:** `Topics > [TopicName] > [PageName]` (existing, preserve)

**Sibling page navigation (new):**
- Horizontal pill/tab row displayed between the breadcrumb and the header
- Shows all pages under the parent topic, sorted by creation date (newest first, matching existing sort)
- Active page is highlighted (primary color background/border)
- Other pages are clickable and navigate to their page detail
- If only one page exists under the topic, this row still renders (single pill) for visual consistency
- Scrolls horizontally if many pages

**Header:**
- Same as topic detail: inline-editable name, inline-editable description, icon (FileText default for pages, no custom icon in Sprint 19 — pages use the generic file icon)
- No "Configure" button

**Content sections:**
- Same widget stack as topic detail MINUS the Pages section (since you're already viewing a page)
- Tags widget, Mentions widget, Tasks widget — all scoped to `pageId` (not `topicId`)
- Tag filter applies to both Mentions and Tasks
- Empty state guidance:
```
[FileText icon]
"{PageName}" has no content yet.

Type [[{TopicName}/{PageName}]] in your journal to link entries here.
```

### 4.4 Summary of Preserved vs. Changed vs. New

| Element | Status |
|---|---|
| Topics list with expand/collapse | **PRESERVED** |
| Create Topic dialog | **PRESERVED** |
| Create Page dialog | **PRESERVED** |
| Topic detail breadcrumb | **PRESERVED** |
| Pages horizontal card row | **PRESERVED** |
| Tags widget | **PRESERVED** |
| Mentions widget (with tag filter) | **PRESERVED** |
| Tasks widget (pending/completed split) | **PRESERVED** |
| Content aggregation (child pages bubble up) | **PRESERVED** |
| `[[double-bracket]]` linking | **PRESERVED** |
| Topic picker in task details | **PRESERVED** |
| TopicTagEditor / TopicPagePicker | **PRESERVED** (store source changes in P2) |
| Search in global `Cmd+K` | **PRESERVED** |
| "Delete Topic" in dropdown | **PRESERVED** |
| Search bar on Topics list | **CHANGED** — now searches pages too |
| Topic row content | **CHANGED** — adds description preview |
| Topic detail header | **CHANGED** — inline editable name, description, icon |
| "Configure" button | **REMOVED** — replaced by inline editing |
| "New Page" card | **FIXED** — now wired to Create Page dialog |
| "Add Task" button | **FIXED** — now creates topic-scoped task |
| Tag filter → Tasks widget | **FIXED** — filter now applies to tasks too |
| Sibling page navigation | **NEW** |
| Projects section on topic detail | **NEW** |
| Empty state guidance | **NEW** |
| Topic rename (inline) | **NEW** |
| Page deletion | **NEW** |
| Description editing (inline) | **NEW** |
| Icon editing (emoji picker) | **NEW** |

---

## 5. Knowledge OS Future Context

These items are NOT implemented in Sprint 19 but inform WHERE we place UI sections and how we design the layout. Sprint 19 should leave room for these additions.

### 5.1 Topics as File System

In future sprints (post-Sprint 19), Topics will become a file-browser-like interface. The folder hierarchy on disk IS the topic hierarchy in the app. Users will be able to:
- Browse their vault in the Topics page like a file explorer
- See real files (PDFs, images, videos) alongside notes and tasks
- Drag files into Topics from their desktop
- Open files directly from the Topics browser

**Sprint 19 implication:** The topic detail page layout should have clear, labeled sections (Pages, Projects, Content, Tasks) that can accommodate a "Files" section in the future without a redesign.

### 5.2 Topics > Projects > Tasks/Files Hierarchy

CEO Session #4 established the hierarchy: Topics contain Projects, which contain Tasks and Files. A Topic can also contain loose notes, files, or nothing at all.

**Sprint 19 implication:** The new "Projects" section on topic detail establishes this relationship visually. Even though it's a read-only listing now, its position in the layout (between Pages and Content) signals the hierarchy.

### 5.3 The `.attachments/` Pattern

Images embedded in notes will be stored in a `.attachments/` folder adjacent to the note on disk.

**Sprint 19 implication:** No action needed, but the Mentions widget's markdown rendering already supports inline images. When the file system backend arrives, embedded images will render naturally.

### 5.4 Export-to-File from Journal/Captures

Users will be able to export a journal entry or capture to a standalone `.md` file in their Topics folder structure.

**Sprint 19 implication:** No action needed, but the Topics detail page's content sections should not assume content only arrives via `[[linking]]`. In future sprints, content may also exist as files in the topic folder.

### 5.5 Vault Folder Structure

The local vault follows this structure:
```
~/Documents/Kaivoo/
  Topics/
    TopicName/
      ProjectName/
        project.md
        attached-files...
      loose-notes.md
      .attachments/
  Journal/
  Captures/
  .kaivoo/
    db.sqlite
    settings.json
```

**Sprint 19 implication:** The service layer should avoid deep Supabase coupling in Topics UI components. The adapter swap (Supabase to SQLite) happens in a later sprint, but clean separation now makes that easier.

### 5.6 Layout Design Principle

Design the topic detail page as a **sectioned vertical layout** with clear headings:
1. Header (name, description, icon)
2. Sibling pages (only on page detail)
3. Pages (only on topic detail)
4. Projects (only on topic detail)
5. [Future: Files]
6. Content (Mentions — journal + captures)
7. Tasks

Each section can be empty, collapsed, or populated. This sectioned approach naturally accommodates the file browser expansion in future sprints.

---

## 6. Empty States

### 6.1 Topics List — No Topics

**Trigger:** `topics.length === 0` and no search query

**Display:**
```
[FolderOpen icon, large, muted]

No topics yet

Create your first topic to organize your captures and tasks.

[New Topic button]
```

**Current status:** EXISTS — preserve as-is.

### 6.2 Topics List — Search No Results

**Trigger:** `filteredTopics.length === 0` and search query is non-empty

**Display:**
```
[FolderOpen icon, large, muted]

No topics found

Try a different search term
```

**Current status:** EXISTS — preserve as-is. After Sprint 19, this applies to topic+page search.

### 6.3 Topic Detail — No Content (New Topic)

**Trigger:** Topic exists but has no pages, no mentions, and no tasks

**Display:**
```
[FolderOpen icon, muted]

"{TopicName}" has no content yet.

Here's how to add content to this topic:
  - Type [[{TopicName}]] in your journal to link entries here
  - Create a task and assign it to this topic
  - Add a page to organize sub-topics
```

**Current status:** NEW — implement in Sprint 19.

### 6.4 Topic Detail — No Pages

**Trigger:** Topic has content (mentions or tasks) but no pages

**Display:** The Pages section simply does not render (existing behavior — the section is conditionally shown only when `pagesInTopic.length > 0`). No special empty state needed; the "New Page" card handles discovery.

After Sprint 19: Consider showing the section heading with a single "New Page" card even when no pages exist, so the user knows pages are possible.

### 6.5 Topic Detail — No Tasks

**Trigger:** `tasks.length === 0` for this topic

**Display:**
```
[CheckSquare icon, muted]

No tasks linked to {topicName} yet.
```

**Current status:** EXISTS in `TopicTasksWidget` — preserve as-is. The "Add Task" button in the widget header provides the action.

### 6.6 Topic Detail — No Mentions

**Trigger:** No journal entries or captures linked to this topic (after tag filter applied)

**Display (no tag filter):**
```
[BookOpen icon, muted]

No mentions yet. Use [[{TopicName}]] in your journal to add content here.
```

**Display (with tag filter):**
```
No mentions with #{tagName} tag.
```

**Current status:** EXISTS in `TopicCapturesWidget` — preserve both variants.

### 6.7 Topic Detail — No Projects

**Trigger:** No projects with `topicId === currentTopicId`

**Display:**
```
No projects under this topic.
```

**Current status:** NEW — implement in Sprint 19. Keep subtle (muted text, no large icon). Projects section is secondary.

### 6.8 Page Detail — No Content

**Trigger:** Page has no mentions and no tasks

**Display:**
```
[FileText icon, muted]

"{PageName}" has no content yet.

Type [[{TopicName}/{PageName}]] in your journal to link entries here.
```

**Current status:** NEW — implement in Sprint 19.

### 6.9 Topic Not Found

**Trigger:** URL has a `topicId` or `pageId` that doesn't match any entity

**Display:**
```
[FolderOpen icon, muted]

Topic not found

[Back to Topics button]
```

**Current status:** EXISTS — preserve as-is.

---

## 7. Loading and Error States

### 7.1 Topics List Loading

**Trigger:** Initial page load before data is hydrated from localStorage/Supabase

**UX:** Since Zustand persists to localStorage, topics data is typically available synchronously on mount. No skeleton needed for the list page in the current architecture. If transitioning to async data loading (React Query), add a skeleton:
- 3-4 rows of: circle (chevron) + rectangle (name) + small text (counts)
- Animate with pulse

### 7.2 Topic Detail Loading

**Trigger:** Navigating to a topic detail page

**UX:** Same as above — data is synchronous from Zustand store. If async loading is added:
- Header skeleton: large rectangle (name) + small rectangle (description)
- Section skeletons: 2-3 card outlines for pages, 3-4 row outlines for mentions/tasks

### 7.3 Failed Topic Fetch (Supabase error)

**Trigger:** DB operation fails during data sync

**UX:** The app uses optimistic updates — store is updated immediately, DB sync happens in background. If DB sync fails:
- Toast error: "Failed to delete topic." / "Failed to save topic changes." etc.
- Store is rolled back to previous state (existing pattern in `useKaivooActions`)
- No visible error state on the page itself — the user sees the rollback as the action "not sticking"

### 7.4 Optimistic Update Rollback UX

**Pattern (existing, preserve):**
1. User performs action (e.g., delete topic)
2. Store updates immediately (topic disappears)
3. Supabase sync fires in background
4. On success: cache invalidated, done
5. On failure: store rolls back (topic reappears), toast shows error message

This pattern already exists for `deleteTopic`, `addTopic`, `addTopicPage`. Sprint 19 extends it to `updateTopic`, `updateTopicPage`, `deleteTopicPage`.

---

## 8. Resolved Questions

### Q1: What should the "Configure" button do?

**Resolution:** Remove the "Configure" button entirely. Its intended functionality — rename, description, icon, delete — is now served by:
- **Inline editing** for name and description (click-to-edit directly in the header)
- **Icon picker** (click the icon in the header)
- **Delete** accessible from the Topics list page dropdown

A separate "Configure" panel or dialog adds an unnecessary navigation step and violates Anti-Pattern #1 ("Don't force users to go to the right page to do something"). Inline editing follows the "edit where you see it" principle.

### Q2: What kind of icon picker?

**Resolution:** Emoji picker. Rationale:
- **Universal**: emojis are available on all platforms, no library dependency needed
- **Lightweight**: no icon library to bundle (avoids bundle size concerns — Sprint 19 P4)
- **Personal**: users instinctively pick emojis that feel right for their topics
- **Implementation**: use the native OS emoji picker (`Ctrl+.` on Windows, `Cmd+Ctrl+Space` on macOS) or a lightweight emoji grid component. A simple popover with common emoji categories is sufficient.
- **Default**: FolderOpen (lucide) icon when no emoji is set. The icon field stores the emoji string (e.g., `"🎵"`, `"💼"`, `"🏠"`)
- **Scope**: Topics only in Sprint 19. Pages keep the generic FileText icon.

### Q3: How should sibling page navigation work?

**Resolution:** Horizontal pill/tab row at the top of the page detail view, positioned between the breadcrumb and the header.

**Spec:**
- Shows all pages under the parent topic, sorted by `createdAt` descending (newest first)
- Active page: filled primary background, white/contrast text
- Other pages: ghost/outline style, muted text, hover state
- Each pill shows the page name (truncated if long)
- Clicking a pill navigates to that page's detail view
- Row scrolls horizontally if it overflows (no wrap)
- Renders even with a single page (for consistency and to show the user this is a page within a topic)

**Visual reference:** Similar to Notion's page tabs within a database, or Linear's issue tabs.

### Q4: How should description editing work?

**Resolution:** Click-to-edit inline text, positioned directly below the topic/page name in the header.

**Spec:**
- **Empty state:** Shows "Add a description..." in muted, italic text
- **Reading state:** Shows the description as regular muted text
- **Editing state:** Click anywhere on the description text (or the placeholder) to enter edit mode. Text becomes an input field. Press Enter to save, Escape to cancel. Click outside to save.
- **Single line:** Description is a short summary, not a rich text block. Single-line input, not textarea.
- **Max length:** No hard limit, but visual truncation at ~200 characters in reading mode with a tooltip for full text

This follows the Inline Editor pattern (Interaction-Patterns.md, Pattern 6) adapted for a simpler single-line context.

### Q5: How should inline topic/page rename work?

**Resolution:** Click-to-edit on the name text in the header.

**Spec:**
- Double-click on the topic/page name, OR click a small pencil icon that appears on hover
- Name text transforms into an input field, pre-filled with the current name, text selected
- Enter to save, Escape to cancel
- Validation: name must not be empty after trim. If empty, revert to previous name
- On save: call `updateTopic` or `updateTopicPage` with the new name
- The rename should also be accessible from the Topics list page via the dropdown menu ("Rename" option triggers inline editing on the topic row name)

---

## 9. Settings

No topic-specific settings live in the Settings page in Sprint 19.

**Future candidates (not Sprint 19):**
- Default topic for uncategorized content (auto-assign orphan captures)
- Topic sort order preference (alphabetical, creation date, most recent activity)
- Whether to show content counts on topic rows
- Archive/hide topics without deleting them

If any topic-related settings are added in future sprints, they should be documented in `Feature-Bible-Settings.md` and cross-referenced here.

---

## 10. Must-Never-Lose Checklist

Agent 11 uses this checklist during feature integrity checks. Every item must pass after Sprint 19 work.

### Existing Behavior (must survive Sprint 19)

- [ ] Topics list shows all topics with correct page counts
- [ ] Topic expand/collapse reveals nested pages
- [ ] Topic row shows capture count and task count
- [ ] Clicking a topic name navigates to `/topics/:topicId`
- [ ] Clicking a page name navigates to `/topics/:topicId/pages/:pageId`
- [ ] Create Topic dialog creates a new topic and it appears in the list
- [ ] Create Page dialog creates a new page under the selected topic
- [ ] Delete Topic removes the topic AND its pages from the store and DB
- [ ] `[[double-bracket]]` linking creates topic/page associations from journal entries
- [ ] `[[double-bracket]]` auto-creates topics/pages that don't exist yet
- [ ] Topic detail shows aggregated content from topic AND its child pages
- [ ] Tag filter on topic detail filters the Mentions widget
- [ ] Mentions widget shows journal entries and captures sorted by date
- [ ] Captures in Mentions widget are clickable and open CaptureEditDialog
- [ ] Tasks widget shows pending/completed tasks with priority colors
- [ ] Task toggle (click) changes status between todo/done
- [ ] Topic picker in TaskDetailsDrawer shows topics with expandable pages
- [ ] Topic picker adds/removes topic IDs on tasks
- [ ] TopicTagEditor in capture/journal dialogs allows topic and tag selection
- [ ] Breadcrumb navigation works: Topics > TopicName and Topics > TopicName > PageName
- [ ] Topic not found state shows correctly for invalid topic/page IDs
- [ ] Global search (Cmd+K) returns topic and page results with correct navigation
- [ ] Optimistic updates with rollback on DB error (delete, create)

### Sprint 19 New Behavior

- [ ] Topics list search finds both topic names AND page names
- [ ] When search matches a page, parent topic auto-expands
- [ ] Inline rename works on topic detail header (double-click or pencil icon)
- [ ] Inline rename calls `updateTopic` and persists to DB
- [ ] Inline description editing works (click placeholder or existing text)
- [ ] Description change persists to DB
- [ ] Icon picker opens on icon click, selected emoji persists
- [ ] "New Page" card on topic detail opens Create Page dialog with correct topicId
- [ ] "Add Task" button creates a task pre-tagged to the current topic/page
- [ ] Tag filter applies to BOTH Mentions and Tasks widgets
- [ ] Sibling page navigation pills show on page detail view
- [ ] Clicking a sibling page pill navigates to that page
- [ ] Active page is visually highlighted in the pill row
- [ ] Projects section shows projects linked to the topic
- [ ] Page deletion works (remove page, content associations update)
- [ ] Page deletion is accessible (from topic detail or page actions)
- [ ] Empty state guidance appears on new topics with no content
- [ ] Empty state guidance appears on new pages with no content
- [ ] Topics list dropdown includes "Rename" option
- [ ] `useTopicStore` is eliminated — all topic state in `useKaivooStore` only
- [ ] No regressions in any component that reads topic data

---

*Feature Bible: Topics Page v0.1 — March 1, 2026*
*Sprint 19: Topics & Quality*
*Compiled by Agent 11 (Feature Integrity Guardian)*
