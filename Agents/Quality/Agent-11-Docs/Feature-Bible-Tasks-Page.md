# Feature Use Case Bible — Tasks Page

**Version:** 0.1 (Initial Draft)
**Status:** DRAFT — Awaiting user review and Q&A
**Scope:** TASKS PAGE ONLY (`/tasks`) — the full task management page, distinct from the Today page's Tasks widget
**Compiled by:** The Director + Agent 11 (Feature Integrity Guardian)
**Date:** February 23, 2026
**Purpose:** Define what the Tasks page does, how it's used in real life, what "working" looks like, and what must never be lost.

---

## How This Document Relates to the Today Bible

The **Today page** has a Tasks *widget* — a focused, day-scoped view of your tasks (Due Today, Overdue, High Priority, etc.) embedded in the dashboard. That widget is fully documented in `Feature-Bible-Today-Page.md` (Today Page Bible).

The **Tasks page** (`/tasks`) is the *full* task management surface — every task you've ever created, across all dates, with powerful filtering, sorting, multiple view modes, and a Kanban board. It's where you go when you need to plan, organize, and manage your entire task inventory.

**The relationship:** Today's Tasks widget shows you *what to do today*. The Tasks page shows you *everything*.

---

# TASKS PAGE

## Identity

**The Tasks page is your full task command center.** It's where you see all your tasks — past, present, and future — organized by status, filtered by any dimension, and viewable as a list or a Kanban board. If Today is "what am I doing right now?", Tasks is "what's on my plate across everything?"

**Core principle:** Power without overwhelm. Give the user every tool to slice and dice their tasks, but keep the default view clean and fast. The most common action — scanning open tasks — should take zero configuration.

---

## Page Layout

The Tasks page has two view modes: **List** and **Kanban**. Both share the same header, search, and filtering UI. The view mode toggle persists across sessions.

```
┌─────────────────────────────────────────────────────────────────┐
│  TASKS                                      [List] [Kanban]     │
│  12 tasks                                   [+ New Task]        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  [Open 8] [Today 3] [Tomorrow 2] [Week 5] [Done 14]  ← tabs   │
│                                                                 │
│  🔍 Search tasks...    [In Progress] [Due Today]   [Sort ↕]    │
│                                        [Clear]     [Filters]   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │  □  Review PR #42                               ⚡ High    ││
│  │     📅 Feb 23 · [[Kaivoo]] · #code                         ││
│  │     ▸ 2/4 subtasks                              ▷          ││
│  │─────────────────────────────────────────────────────────────││
│  │  □  Send invoice to client                      🔵 Medium  ││
│  │     📅 Feb 20 · [[Work/Billing]]                           ││
│  │─────────────────────────────────────────────────────────────││
│  │  ✓  Deploy staging                              🟢 Low     ││
│  │     📅 Feb 22 · [[Kaivoo]] · #deploy            (done)     ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## The Real Use Case

### Use Case 1: Weekly Planning Session

It's Sunday night. You open the Tasks page. You tap the **Week** tab — now you see everything due this week. You scan through, realize 3 tasks are too ambitious for Monday, so you open each one and push the due date to Wednesday. You switch to the **Open** tab to check if anything is languishing without a due date. You find 2 and set them for Thursday. Weekly planning done in 2 minutes.

### Use Case 2: Kanban Workflow for a Project

You're working on a feature. You switch to **Kanban** view. Five columns: Backlog, Todo, Doing, Blocked, Done. You drag "Design mockup" from Backlog to Todo. You drag "Write tests" from Todo to Doing. You see "Waiting on API" stuck in Blocked — you check the description and realize you need to ping Sarah. The visual flow gives you project momentum at a glance.

### Use Case 3: Finding a Specific Task

You remember creating a task about "competitor pricing" weeks ago. You type "pricing" in the search bar — it instantly filters to 2 results. You tap the one you want, the detail drawer slides open, you update the description and set it to high priority.

### Use Case 4: Deep Filtering for Context Switching

You're about to do Kaivoo work. You open Filters, set status to "In Progress" and priority to "High". Now you see only your most critical active work. You knock them out one by one, checking them off with a single tap.

---

## What Currently Works (Sprint 4 State)

The Tasks page is **one of the most complete pages in the app**. It has a rich feature set that mostly works well:

### View Modes
- **List view** — Tab-based filtering with 5 tabs: Open, Today, Tomorrow, Week, Done
- **Kanban view** — 5-column board: Backlog, Todo, Doing, Blocked, Done
- View mode persists to localStorage across sessions

### Filtering & Search
- **Search** — Real-time text search across task titles
- **Quick filter chips** — "In Progress" and "Due Today" toggles
- **Advanced filters drawer** — Status and Priority dropdown selects
- **Clear all filters** button when any filter is active
- **Sort dropdown** — Sort by: Date Created, Due Date, Priority, Title, Status (asc/desc)
- Sort preference persists to localStorage

### Task List (List View)
- Task rows with: checkbox, title (strikethrough when done), priority badge, chevron
- Due date badge on tasks with dates
- Topic badges (first 2 shown, "+N" overflow)
- Tag badges (first 2 shown, "+N" overflow)
- Subtask expansion: chevron arrow → expands inline subtask list with completion toggles
- Subtask progress bar + percentage on parent task
- Subtask tags displayed inline
- Empty state with helpful message

### Kanban Board
- 5 columns with colored headers matching status config
- Drag-and-drop between columns using @dnd-kit
- Cards show: title, subtask progress bar, due date, priority badge, topic/tag badges
- Grip handle appears on hover for dragging
- Drag overlay shows a card preview while dragging
- Column task counts in header
- Empty column state

### Task Creation
- "New Task" button in header
- Inline creation input: type title → Enter to create → task detail drawer opens automatically
- Created with defaults: status=todo, priority=medium

### Task Detail Drawer (Shared with Today)
- Title editing (inline, save on blur)
- Status selector (pill-style dropdown: Backlog, Todo, Doing, Blocked, Done)
- Priority selector (pill-style dropdown: Low, Medium, High)
- Start date picker with calendar popover + "Today" / "Clear" shortcuts
- Due date picker with calendar popover + "Today" / "Tomorrow" shortcuts
- Description textarea (save on blur)
- Topics section: linked topics as badges, add from existing or create new (Topic/Page path)
- Tags section: tag badges with remove, add new tag input
- Subtasks section: progress bar + percentage, completion toggles, inline title editing, delete, add new subtask input
- Footer: created date, delete button with destructive styling
- Gradient background themed for tasks

### Data Model
```
Task: {
  id, title, description?, status (backlog|todo|doing|blocked|done),
  priority (low|medium|high), dueDate?, startDate?, tags[],
  topicIds[], subtasks[], sourceLink?, createdAt, completedAt?
}

Subtask: {
  id, title, completed, completedAt?, tags[]
}
```

### Persistence
- View preferences (active tab, view mode, sort, expanded tasks) → localStorage
- Task data → Supabase (via useKaivooActions)

---

## What Doesn't Work / What's Missing

### Missing: Topic/Tag Filtering
The Today page's Tasks *widget* has topic filtering and hashtag filtering (per the Today Bible). The Tasks *page* does **not** have topic or tag filtering — only status and priority in the advanced filters drawer. This is a gap. When you have 50+ tasks across Work, Kaivoo, Personal, etc., you need to filter by topic.

### Missing: Bulk Actions
No way to select multiple tasks and perform batch operations (set priority, change due date, move to topic, mark done). When you have 10 overdue tasks that all need to move to next week, you have to open each one individually.

### Missing: Task Recurrence
No recurring tasks. "Write weekly report" has to be manually re-created every week. This is a Vision Phase 1 planned milestone.

### Missing: Task Count by Tab Not Filtered
The tab counts (Open: 8, Today: 3) always show the total count regardless of search query or active filters. If you search for "pricing" and get 2 results, the tab still says "Open: 8". Minor but confusing.

### Kanban: No Column Drop Zones
You can only drop a card onto another card in a column, not into an empty area within a column. If a column has cards, you can drop; if it's empty, the drop detection is unreliable. This limits drag-and-drop usability.

### Kanban: Search Doesn't Filter Columns
When you search in Kanban mode, the entire board shows all tasks (the search filter doesn't apply in Kanban on the 'open' tab). This is an intentional code path but may confuse users.

### Missing: "Ongoing" Task Label
From the Today Bible (Q3), tasks without due dates should have an "Ongoing" label — visible across dates, never overdue. Not yet implemented.

---

## What It Should Become

### Sprint 6+ Enhancements (Prioritized)

#### 1. Topic & Tag Filtering (P1)
Add topic and tag filters to the Advanced Filters drawer. Also consider a filter bar that shows active topic/tag chips:

```
🔍 Search...  [In Progress] [Due Today] [[Kaivoo]] [#code]  [Sort] [Filters]
```

Clicking a topic badge on a task row should activate that topic as a filter (same behavior as the Today Tasks widget).

#### 2. Bulk Actions (P2)
Add multi-select mode:
- Long-press or checkbox column to enter selection mode
- Selection toolbar appears: "3 selected — [Set Priority ▾] [Set Date ▾] [Move Topic ▾] [Mark Done] [Delete]"
- Especially valuable for weekly planning: select 5 tasks → "Move to next week"

#### 3. Task Recurrence (P2 — Vision Phase 1)
Recurring task creation:
- Frequency options: Daily, Weekly (pick days), Monthly (pick date), Custom
- Generates next instance when current is completed
- Shows recurrence icon + frequency label on task row
- Recurrence settings in task detail drawer

#### 4. Tab Count Respect Filters (P2)
When search or filters are active, tab counts should reflect the filtered set, not the total set.

#### 5. Kanban Improvements (P2)
- Empty column drop zones (reliable drag into empty columns)
- Column WIP limits (optional: "Max 3 tasks in Doing")
- Search/filter applies in Kanban mode
- Column collapse/expand

#### 6. "Ongoing" Task Support (P2)
Tasks without due dates get an "Ongoing" label. They appear in the Open tab but never in overdue sections. The Today widget shows them in a dedicated section.

#### 7. Task Templates (P3)
Save frequently-used task structures as templates:
- "Weekly Report" template: title, subtasks pre-filled, recurring weekly
- "Client Onboarding" template: 8 subtasks, topic auto-set
- Accessible from "New Task" dropdown

#### 8. Archive vs. Delete (P3)
Currently delete is permanent. Add an archive state:
- Archived tasks disappear from all views but can be restored
- "Archived" tab or filter option
- Delete becomes a destructive action with stronger confirmation

---

## Interaction Spec

### Task Row (List View)

```
┌──────────────────────────────────────────────────────────────┐
│  □  Review PR #42                                ⚡ High  ▷  │
│     📅 Feb 23 · [[Kaivoo]] · #code                           │
│     ▸ 2/4 subtasks  ████░░ 50%                               │
└──────────────────────────────────────────────────────────────┘

Tap checkbox    → Toggle done/undone (instant, optimistic update)
Tap task title  → Opens task detail drawer
Tap ▸ arrow     → Expand subtasks inline
Tap topic badge → (Future: filter by that topic)
Tap tag badge   → (Future: filter by that tag)
Hover row       → Shows ▷ chevron (affordance for drawer)
```

### Kanban Card

```
┌──────────────────────────────┐
│  ⠿ Review PR #42            │
│     ████░░ 50%               │
│     📅 Feb 23  ⚡ High       │
│     [[Kaivoo]] · #code       │
└──────────────────────────────┘

Tap card        → Opens task detail drawer
Grab ⠿ handle   → Drag to another column (changes status)
Drop on column  → Status updates to that column's status
```

### Tab Bar

```
[Open 8] [Today 3] [Tomorrow 2] [Week 5] [Done 14]

Tap tab → Filters task list to that time scope
Active tab → highlighted with background + shadow
Counts → update live as tasks change
Only visible in List mode (hidden in Kanban)
```

### New Task Flow

```
Tap [+ New Task] → Inline input appears above task list
Type title → Enter → Task created (todo, medium priority)
                  → Detail drawer auto-opens for further editing
Escape          → Cancel creation
```

### Task Detail Drawer

```
┌─────────────────────────────────────────────────┐
│  [Title — editable inline]                       │
│                                                  │
│  [Todo ▾]  [Medium ▾]     ← status & priority   │
│                                                  │
│  ┌─ Start Date ─────┐  ┌─ Due Date ──────────┐  │
│  │ Set start         │  │ Feb 23              │  │
│  │ [Today] [Clear]   │  │ [Today] [Tomorrow]  │  │
│  └───────────────────┘  └─────────────────────┘  │
│                                                  │
│  ┌─ Description ─────────────────────────────┐   │
│  │ Add a description...                      │   │
│  └───────────────────────────────────────────┘   │
│                                                  │
│  ┌─ Topics ──────────────────────────────────┐   │
│  │ [[Kaivoo]] × · [+ Add topic]              │   │
│  └───────────────────────────────────────────┘   │
│                                                  │
│  ┌─ Tags ────────────────────────────────────┐   │
│  │ #code × · [Add tag...]                    │   │
│  └───────────────────────────────────────────┘   │
│                                                  │
│  ┌─ Subtasks ─────────────── 2/4 (50%) ──────┐  │
│  │ ████░░░░░░░░                               │  │
│  │ ✓ Write tests                              │  │
│  │ ✓ Review code                              │  │
│  │ ○ Deploy to staging                        │  │
│  │ ○ Update docs                              │  │
│  │ ○ Add subtask...                           │  │
│  └───────────────────────────────────────────┘   │
│                                                  │
│  Created Feb 20, 2026              [🗑 Delete]   │
└─────────────────────────────────────────────────┘

All edits save on blur — no "Save" button
Status/priority change → instant, shows toast
Title/description → save on blur, shows toast
Subtask toggle → instant optimistic update
```

---

## Open Questions for User

### Q1: Topic/tag filtering on the Tasks page — how should it work?
**Option A:** Add topic and tag dropdowns to the Advanced Filters drawer (simple, consistent with existing pattern)
**Option B:** Topic/tag chips in the quick filter bar (more visible, faster access)
**Option C:** Both — quick chips for frequently-used topics + full list in drawer

### Q2: Bulk actions — is this a priority?
The weekly planning use case ("select 5 tasks → move to next week") is real. But it adds complexity. Is this something you'd use regularly, or is it a nice-to-have?

### Q3: Task recurrence — what frequency options matter most?
- Daily, Weekly, Monthly are obvious
- Specific days (Mon/Wed/Fri)?
- "Every 2 weeks"?
- "First Monday of the month"?
How complex should the recurrence system be?

### Q4: Kanban — is it used regularly?
The Kanban board exists and works. Is it a feature you actively use, or is it more of a "nice to have" that doesn't need investment right now? This determines whether Kanban improvements (column drops, WIP limits, filtering) get prioritized.

### Q5: Archive vs. permanent delete?
Currently deleting a task is permanent. Should we add an archive step? Or is permanent delete fine for your workflow?

### Q6: Any other task management pain points?
Are there things about the Tasks page that frustrate you or feel missing that we haven't covered?

---

## Must-Never-Lose Checklist: Tasks Page

### View Modes
- [ ] List view with tab-based filtering (Open, Today, Tomorrow, Week, Done)
- [ ] Kanban view with 5 status columns (Backlog, Todo, Doing, Blocked, Done)
- [ ] View mode toggle in header (persists to localStorage)
- [ ] View preferences persist across sessions (active tab, sort, expanded tasks)

### Search & Filtering
- [ ] Real-time search across task titles
- [ ] Quick filter chips: "In Progress", "Due Today"
- [ ] Advanced filters drawer: Status, Priority dropdowns
- [ ] Clear all filters button
- [ ] Sort dropdown: Date Created, Due Date, Priority, Title, Status
- [ ] Sort direction toggle (asc/desc)

### Task List (List View)
- [ ] Task rows show: checkbox, title, priority badge, chevron
- [ ] Due date badge on dated tasks
- [ ] Topic badges (first 2 + overflow count)
- [ ] Tag badges (first 2 + overflow count)
- [ ] Subtask expansion (inline, toggleable)
- [ ] Subtask progress bar + percentage on parent
- [ ] Inline subtask completion toggle
- [ ] Subtask tags visible
- [ ] Strikethrough title for completed tasks
- [ ] Empty state with helpful message
- [ ] Tab counts update live

### Kanban Board
- [ ] 5 columns with status-colored headers
- [ ] Drag-and-drop between columns (status change)
- [ ] Card shows: title, progress, due date, priority, topic/tags
- [ ] Drag handle on hover
- [ ] Drag overlay preview
- [ ] Column task counts
- [ ] Empty column state

### Task Creation
- [ ] "New Task" button in header
- [ ] Inline title input (Enter to create, Escape to cancel)
- [ ] Auto-opens detail drawer after creation
- [ ] Defaults: status=todo, priority=medium

### Task Detail Drawer
- [ ] Title editing (inline, saves on blur)
- [ ] Status selector (5 statuses)
- [ ] Priority selector (3 priorities)
- [ ] Start date picker with calendar + shortcuts
- [ ] Due date picker with calendar + shortcuts
- [ ] Description textarea (saves on blur)
- [ ] Topics: view linked, add existing, create new (Topic/Page path)
- [ ] Tags: view, add, remove
- [ ] Subtasks: progress bar, toggle, inline edit title, delete, add new
- [ ] Created date display
- [ ] Delete button with destructive styling
- [ ] All changes save immediately (no Save button)
- [ ] Toast feedback on changes

### Cross-Page Consistency
- [ ] Task completion on Tasks page updates Today Tasks widget chip count
- [ ] Task creation on Tasks page appears in Today widget (if due today)
- [ ] Task detail drawer is the same component shared across Tasks page and Today page

---

*Feature Use Case Bible — Tasks Page — v0.1*
*Compiled by The Director + Agent 11 (Feature Integrity Guardian)*
*February 23, 2026*
