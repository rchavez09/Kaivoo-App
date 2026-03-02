# Feature Use Case Bible — Projects Page

**Version:** 0.2 (Sprint 14 — Project Notes)
**Status:** DRAFT — Awaiting user review and Q&A
**Scope:** PROJECTS MODULE — Projects list (`/projects`), Project Detail (`/projects/:projectId`), Timeline View, Project Selector (in TaskDetailsDrawer), and Project Badges (on task rows)
**Compiled by:** Agent 11 (Feature Integrity Guardian)
**Date:** February 24, 2026
**Sprint introduced:** Sprint 9 (Projects Foundation)
**Purpose:** Define what the Projects module does, how it's used in real life, what "working" looks like, and what must never be lost.

---

## How This Document Relates to Other Bibles

The **Tasks Bible** (`Feature-Bible-Tasks-Page.md`) documents the Tasks page which now includes a **Timeline view mode** (list/kanban/timeline toggle). The Timeline view renders projects, not tasks — it lives in the Tasks page but is entirely project-centric.

The **TaskDetailsDrawer** (documented in the Tasks Bible) now has a **Project selector** section — a dropdown that assigns/unassigns a task to a project. That integration is documented here as well.

**The relationship:** Projects are containers that group tasks. The Projects page manages projects themselves. The Tasks page lets you assign tasks to projects and see project context on task rows. The Timeline view is a Gantt-style visualization of project date ranges, accessible from the Tasks page's view mode toggle.

---

# PROJECTS LIST PAGE (`/projects`)

## Identity

**The Projects page is your project command center.** It shows all your projects as a card grid, organized by status. If Tasks is "what's on my plate?", Projects is "what am I working toward?" — the higher-level containers that give tasks meaning and direction.

**Core principle:** Visual, status-driven overview. Each project is a card with color accent, status badge, topic, date range, and task progress. You should be able to glance at this page and know the state of every project in under 5 seconds.

---

## Page Layout

```
+------------------------------------------------------------------+
|  Projects                                    [+ New Project]      |
|  3 projects                                                       |
+------------------------------------------------------------------+
|                                                                    |
|  [All 3] [Active 1] [Planning 1] [Done 1]        <- status tabs   |
|                                                                    |
|  [Search projects...]  [All topics v]             <- filters       |
|                                                                    |
|  +------------------+  +------------------+  +------------------+  |
|  | === color bar === |  | === color bar === |  | === color bar === | |
|  | Project Alpha     |  | Project Beta      |  | Project Gamma    | |
|  | Active         [z]|  | Planning       [P]|  | Done          [v]| |
|  | Description...    |  | Description...    |  |                   | |
|  | [Kaivoo] Feb 1-28 |  | [Work]            |  | Jan 1 - Jan 31   | |
|  | 3/5 done   60%    |  | 0/2 done    0%    |  | 5/5 done  100%   | |
|  | ========--        |  | ----------        |  | ================ | |
|  +------------------+  +------------------+  +------------------+  |
|                                                                    |
+------------------------------------------------------------------+
```

**Component:** `src/pages/Projects.tsx`

---

## The Real Use Case

### Use Case 1: Checking Project Health at a Glance

You open the Projects page. Three cards stare back at you. "Kaivoo v2" has a blue bar, Active status, and "3/8 done (38%)" — you know it's behind. "Client Website" is green, Done, "12/12 done (100%)" — shipped. "Research Phase" is gray, Planning, "0/0 done" — not started. You know exactly where everything stands without clicking anything.

### Use Case 2: Creating a New Project

You click "New Project". A dialog opens. You type "Marketing Launch", add a description, set status to "Planning", pick the "Work" topic, choose a start/end date, and pick an orange color. Click Create. The card appears in the grid instantly.

### Use Case 3: Filtering to Active Projects Only

You have 8 projects but only care about the live ones. Click the "Active" tab. Now you see only the 3 active projects. Or type "launch" in the search bar to narrow further. Or pick the "Work" topic filter to see only work-related projects.

### Use Case 4: Drilling Into a Project

You click a project card. It navigates to `/projects/:projectId` — the project detail page where you can see and manage all tasks linked to that project.

---

## What Currently Works (Sprint 9 State)

### Header
- **Title:** "Projects" with total project count below ("3 projects")
- **New Project button:** Opens the Create Project dialog
- **Component:** `Projects.tsx` header section

### Status Tabs
- **6 tabs:** All, Active, Planning, Paused, Done, Archived
- Tabs with zero projects are hidden (except "All" and "Active" which always show)
- Each tab shows its count (e.g., "Active 2")
- Counts are computed from unfiltered project list (not affected by search or topic filter)
- Active tab has highlighted background + shadow
- **Component:** `STATUS_TABS` array in `Projects.tsx`

### Search
- Real-time text search across project **name** and **description**
- Search icon with input field, placeholder "Search projects..."
- Filters the card grid instantly as you type
- **Component:** `searchQuery` state in `Projects.tsx`

### Topic Filter
- Dropdown select: "All topics" plus every topic (excluding `topic-daily-notes`)
- Filters projects by their `topicId` field
- Only visible when there are topics to filter by
- **Component:** `topicFilter` state + `filteredTopics` in `Projects.tsx`

### Card Grid
- Responsive grid: 1 column on mobile, 2 on medium, 3 on large screens
- Cards sorted by: status order first (planning < active < paused < completed < archived), then by `updatedAt` descending within same status
- **Component:** `filtered` useMemo in `Projects.tsx`, renders `ProjectCard` per project

### Project Card (`ProjectCard.tsx`)
- **Color accent strip:** 1px-height colored bar at the top of each card, using the project's assigned color (or auto-assigned from palette based on index)
- **Name:** Font-medium, truncated, turns primary color on hover
- **Status badge:** Pill-style badge in top-right with icon + label, colored per status config
- **Description:** 2-line clamp, shown only when description exists
- **Meta row:** Topic badge (if topic assigned, styled `text-info`), date range (calendar icon + "Feb 1 - Feb 28" format)
- **Task progress:** Shows "3/5 done" + "60%" + colored progress bar (bar color matches project color). Only visible when project has tasks.
- **Click behavior:** Navigates to `/projects/${project.id}`
- **Hover behavior:** Card lifts slightly (`hover:-translate-y-0.5`)
- **Component:** `src/components/projects/ProjectCard.tsx` (React.memo wrapped)

### Empty States
- **No projects at all:** Briefcase icon + "No projects yet" + "Create your first project..." + Create Project button
- **No matching projects (after filtering):** Briefcase icon + "No matching projects" + "Try adjusting your filters or search query."
- **Component:** Conditional rendering in `Projects.tsx`

### Create Project Dialog (`CreateProjectDialog.tsx`)
- **Opens via:** "New Project" button (or empty state Create button)
- **Fields:**
  - **Name** (required): Text input, autofocused, Enter key triggers create
  - **Description** (optional): Textarea, "What is this project about?"
  - **Status:** Dropdown select, defaults to "planning". Options: Planning, Active, Paused, Done, Archived (each with icon + color)
  - **Topic:** Dropdown select, defaults to "None". Shows all topics except `topic-daily-notes`
  - **Start Date / End Date:** Native date inputs (type="date"), side by side
  - **Color:** Palette of 12 color swatches. Selected swatch shows border + scale. If no color picked, auto-assigns based on `projects.length % 12`
- **Create button:** Disabled until name is non-empty. Shows Plus icon + "Create" label
- **Cancel button:** Closes dialog without creating
- **On create:** Calls `addProject()`, shows "Project created" toast, resets form, closes dialog
- **Validation:** Only name is required; toast error "Project name is required" if empty name submitted
- **Component:** `src/components/projects/CreateProjectDialog.tsx`

---

# PROJECT DETAIL PAGE (`/projects/:projectId`)

## Identity

**The Project Detail page is your project workspace.** It shows everything about a single project — its name, status, description, dates, linked tasks, and task progress. This is where you manage the tasks that belong to a project, add new tasks, link existing ones, and track progress toward completion.

---

## Page Layout

```
+------------------------------------------------------------------+
|  Projects > Project Alpha                       <- breadcrumb      |
+------------------------------------------------------------------+
|                                                                    |
|  * Project Alpha                               <- editable name    |
|  [Active v]  [Kaivoo]  Feb 1, 2026 - Feb 28    42% complete       |
|                                                                    |
|  Description text here, click to edit...        <- editable desc   |
|                                                                    |
|  +--------------------------------------------------------------+  |
|  | 8 tasks    5 open    3 done                        42%        | |
|  | =====================-----------                              | |
|  +--------------------------------------------------------------+  |
|                                                                    |
|  +--------------------------------------------------------------+  |
|  | Tasks                          [Link existing] |              | |
|  +--------------------------------------------------------------+  |
|  | o  Add a task to this project...            [Add] |           | |
|  +--------------------------------------------------------------+  |
|  | o  Design mockup                  High   Feb 23   >          | |
|  |    === 2/4 subtasks                                          | |
|  | o  Write tests                    Medium          >          | |
|  | v  Deploy staging (done)          Low    Feb 22   >          | |
|  +--------------------------------------------------------------+  |
|                                                                    |
|  +--------------------------------------------------------------+  |
|  | Notes                                          2 notes        | |
|  +--------------------------------------------------------------+  |
|  | Thought about the API design...        2 min ago  [ed] [del] | |
|  | Remember to check the timeline...      1 hour ago [ed] [del] | |
|  | [Write a note...                          ] [Add Note]       | |
|  +--------------------------------------------------------------+  |
|                                                                    |
|  +--------------------------------------------------------------+  |
|  | Settings                                                      | |
|  | Color: [o][o][o][o][o][o][o][o][o][o][o][o]                  | |
|  | Start Date: [____]    End Date: [____]                        | |
|  | [Delete Project]                                              | |
|  +--------------------------------------------------------------+  |
|                                                                    |
+------------------------------------------------------------------+
```

**Component:** `src/pages/ProjectDetail.tsx`

---

## What Currently Works (Sprint 9 State)

### Breadcrumb Navigation
- Shows: `Projects > Project Name`
- "Projects" is a clickable link back to `/projects`
- Project name is plain text (truncated)
- **Component:** `<nav>` element in `ProjectDetail.tsx`

### Project Not Found State
- If `projectId` doesn't match any project: shows "Project not found" with explanation text and "Back to Projects" button
- **Component:** Conditional return when `!project`

### Inline Name Editing
- Click the project name to enter edit mode
- Input field appears, autofocused, styled as transparent (matches heading style)
- **Save:** On blur or Enter key. Only saves if name is non-empty and changed.
- **Toast:** "Project name updated" on save
- **Color dot:** Small colored circle (3x3 rounded-full) to the left of the name, using project color
- **Component:** `editingName` / `nameInput` state, `handleNameSave` callback

### Status Selector
- Pill-style select trigger showing current status icon + label, colored per status config
- Dropdown with all 5 statuses, each with icon + label + color
- **Change:** Instant, calls `updateProject()`. No toast.
- **Component:** `<Select>` in header area

### Meta Row
- Shows in one row: status pill, topic badge (if assigned), date range (if any dates set), completion percentage (right-aligned, if tasks exist)
- **Date format:** "MMM d, yyyy" (e.g., "Feb 1, 2026")
- **Component:** Header `<div>` below name

### Inline Description Editing
- Click the description area to enter edit mode
- Textarea appears, autofocused, min-height 80px
- **Save:** On blur. Saves even empty (clears description).
- **Placeholder:** "Add a description..." shown in italic muted style when no description
- **Hover:** Pencil icon fades in on hover (edit affordance)
- **Component:** `editingDesc` / `descInput` state, `handleDescSave` callback

### Stats Bar (widget-card)
- Only visible when project has tasks (`stats.total > 0`)
- Shows: **X tasks**, **Y open**, **Z done** (done count in success color)
- Completion percentage on right
- Progress bar (shadcn `<Progress>`, h-2 height)
- **Component:** Stats card section in `ProjectDetail.tsx`

### Task List (widget-card)
- **Widget header:** "Tasks" title with "Link existing" button on the right
- **Add task input:** Inline input at top with Circle icon + text input + "Add" button
  - Enter key triggers creation
  - Created with defaults: `status: 'todo'`, `priority: 'medium'`
  - Inherits project's `topicId` in `topicIds` array
  - Sets `projectId` to current project
- **Task rows:** Each task shows:
  - **Completion toggle:** Circle icon (uncompleted) or CheckCircle2 (done, green). Click toggles between `done` and `todo` status. `e.stopPropagation()` prevents opening drawer.
  - **Title:** Truncated, strikethrough + muted when done
  - **Subtask progress:** Mini progress bar (h-1.5, w-16) + "2/4" count. Only shown for tasks with subtasks.
  - **Priority badge:** Flag icon + label, colored per priority config
  - **Due date:** Short format ("Feb 23"), only shown when task has due date
  - **Chevron:** Right-pointing arrow, fades in on hover (drawer affordance)
- **Click task row:** Opens TaskDetailsDrawer for that task
- **Sort order:** Incomplete tasks first (done sorted to bottom), then by `createdAt` descending
- **Empty state:** "No tasks yet" with "Add a task above or link an existing one" hint
- **Component:** Task list section in `ProjectDetail.tsx`

### Link Existing Task (Popover)
- **Trigger:** "Link existing" button in task list header
- **Popover content:**
  - Search input at top ("Search tasks...")
  - Scrollable list of linkable tasks (max height 224px)
  - **Linkable tasks:** Tasks where `projectId !== project.id` AND `status !== 'done'`. Searched by title. Limited to 20 results. Sorted by `createdAt` descending.
  - Each task row shows Circle icon + truncated title
  - **Click task:** Sets `task.projectId = project.id`, shows toast `Linked "Task Title"`
  - **Empty states:** "No matching tasks" (when searching) or "No unassigned tasks" (when no search)
- **Component:** `linkPopoverOpen` / `linkSearch` state, `linkableTasks` useMemo

### Settings Card (widget-card)
- **Color picker:** 12 color swatches (same `PROJECT_COLORS` palette as create dialog). Selected swatch shows border + scale. Click updates project color immediately.
- **Start Date / End Date:** Native date inputs (type="date"), side by side. Changes save immediately via `updateProject()`.
- **Delete Project button:** Destructive ghost button. Opens AlertDialog confirmation.
  - **Confirmation dialog:** "Delete project?" with description: "This will delete the project 'Name'. Tasks in this project will be unlinked but not deleted."
  - **Delete action:** Calls `deleteProject()`, shows "Project deleted" toast, navigates to `/projects`
  - **Task behavior on delete:** Tasks with `projectId === deletedProject.id` get their `projectId` set to `undefined` (orphaned, not deleted)
- **Component:** Settings section in `ProjectDetail.tsx`

### Task Details Drawer
- Reuses the shared `TaskDetailsDrawer` component
- Opens when a task row is clicked
- Same behavior as documented in Tasks Bible
- **Component:** `<TaskDetailsDrawer>` in `ProjectDetail.tsx`

---

# PROJECT NOTES (Sprint 14)

## Identity

**Project Notes let you capture thoughts for a project mid-flow.** From anywhere in the app, press Cmd+Shift+N (or Ctrl+Shift+N on Windows/Linux) to open a quick-add dialog, pick a project, type your thought, and get back to what you were doing. Notes are then visible and editable on the project detail page.

**Core principle:** Minimal friction. You should be able to capture a project-related thought in 2-3 interactions without losing your current flow.

---

## Project Notes Section on ProjectDetail

### Location
- Between the **Tasks** section and the **Settings** section on the Project Detail page
- Uses `widget-card` styling matching the Tasks and Settings sections

### Layout

```
+--------------------------------------------------------------+
| Notes                                              2 notes    |
+--------------------------------------------------------------+
|                                                                |
|  This is a note about the project...              2 min ago   |
|  [edit] [delete]                                               |
|                                                                |
|  Another thought I had earlier today...           1 hour ago  |
|  [edit] [delete]                                               |
|                                                                |
|  +----------------------------------------------------------+ |
|  | Write a note...                               [Add Note] | |
|  +----------------------------------------------------------+ |
|                                                                |
+--------------------------------------------------------------+
```

### What Currently Works (Sprint 14 State)

#### Notes List
- All notes for the current project, sorted newest-first by `createdAt`
- **Progressive disclosure:** Shows first 5 notes by default, "Show N more" button to reveal rest
- **Long notes:** Content clamped to 4 lines with "Show more" / "Show less" toggle
- **Timestamps:** Relative time format ("2 min ago", "1 hour ago", "Feb 24") using `date-fns` `formatDistanceToNow` / `format`
- **Component:** `src/components/projects/ProjectNotesList.tsx`

#### Inline Editing
- Click the pencil icon (or press Enter when focused) to enter edit mode
- Textarea replaces the note content area
- **Save:** Click "Save" button or press Enter (without Shift)
- **Cancel:** Click "Cancel" button or press Escape
- **Shift+Enter:** Inserts a newline (does not save)
- Empty content reverts edit (no save)

#### Delete Confirmation
- Click the trash icon to show inline confirmation strip (not a modal)
- Confirmation strip shows "Delete this note?" with "Delete" (destructive) and "Cancel" buttons
- Stays inline within the note card — no dialog overlay
- **Component:** `confirmingDeleteId` state in `ProjectNotesList`

#### Add Note Input
- Inline input at the bottom of the notes section
- Textarea with "Write a note..." placeholder
- "Add Note" button (disabled when input is empty)
- **Enter** key creates the note (Shift+Enter for newlines)
- Input clears after successful creation
- Toast: "Note added" on success

#### Empty State
- When project has no notes: StickyNote icon + "No notes yet" + "Capture thoughts, ideas, or reminders for this project."
- Add-note input still visible below the empty state

---

## Quick-Add Note Dialog

### Identity
**The Quick-Add Note dialog lets you create a project note from anywhere in the app** without navigating away from your current page.

### Trigger
- **Keyboard shortcut:** Cmd+Shift+N (Mac) / Ctrl+Shift+N (Windows/Linux)
- Available from any page in the app (registered in `AppLayout.tsx`)

### Dialog Layout

```
+----------------------------------------------+
|  [sticky-note icon] Quick Note               |
+----------------------------------------------+
|                                                |
|  Project                                       |
|  [Select a project... v]                       |
|                                                |
|  Note                                          |
|  [What's on your mind...                    ]  |
|  [                                          ]  |
|                                                |
|  Cmd+Enter to save                             |
|                                                |
|              [Cancel]  [Add Note]              |
+----------------------------------------------+
```

### What Currently Works (Sprint 14 State)

#### Project Picker
- Select dropdown showing all **active** projects (filters out `status === 'archived'`)
- Each option shows: color dot + project name
- **Pre-selection:** When opened from a project detail page (`/projects/:projectId`), the current project is pre-selected
- **Empty projects:** Shows "No active projects" placeholder when user has no projects

#### Note Input
- Textarea, auto-focused after dialog opens (100ms delay for animation)
- Placeholder: "What's on your mind..."
- **Cmd/Ctrl+Enter:** Saves the note (keyboard shortcut hint shown below)

#### Save Behavior
- "Add Note" button disabled until both project is selected AND content is non-empty
- On save: creates note via `addProjectNote()`, shows toast "Note added to {projectName}", closes dialog
- On cancel or dialog close: form resets

#### Form Reset
- Form resets every time dialog opens (content cleared, project re-set to default)

### Component
- `src/components/projects/QuickAddNoteDialog.tsx`
- Mounted in `src/components/layout/AppLayout.tsx` next to `FloatingChat`

---

## Project Notes Data Model

```typescript
interface ProjectNote {
  id: string;
  projectId: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Database Table (`project_notes`)
- RLS: all policies use `(select auth.uid())` subquery form
- `ON DELETE CASCADE` from `projects.id` — when a project is deleted, all its notes are automatically deleted
- Indexes on `user_id` and `project_id`
- `updated_at` auto-update trigger

### Service Layer (`project-notes.service.ts`)
- `fetchProjectNotes(userId)`: All notes for user, ordered by `created_at` desc
- `createProjectNote(userId, note)`: Insert + return converted note
- `updateProjectNote(userId, id, updates)`: Partial update (content only)
- `deleteProjectNote(userId, id)`: Hard delete

### Store Layer (`useKaivooStore.ts`)
- `projectNotes: ProjectNote[]` in store
- CRUD methods: `addProjectNote`, `updateProjectNote`, `deleteProjectNote`
- `getNotesByProject(projectId)`: Filtered + sorted by createdAt desc
- CASCADE cleanup: `deleteProject` also removes associated notes from local store

### Actions Layer (`useKaivooActions.ts`)
- Optimistic updates with rollback on error for all CRUD operations
- Error toasts on failure

### Export/Import (`DataSettings.tsx`)
- Project notes included in full data export
- Import restores notes with `project_id` remapping via `projectIdMap`

---

## Project Notes Interaction Spec

### ProjectDetail — Notes Section

```
Note content here...                    2 min ago
                                    [pencil] [trash]

Click pencil    -> Enter edit mode (textarea replaces content)
Enter           -> Save changes
Escape          -> Cancel edit
Shift+Enter     -> Newline in edit mode
Click trash     -> Show inline delete confirmation
"Delete"        -> Delete note + toast
"Cancel"        -> Dismiss confirmation
"Show more"     -> Expand clamped note
"Show N more"   -> Show remaining notes beyond first 5
```

### Quick-Add Note Dialog

```
Cmd+Shift+N     -> Open dialog from any page
Select project  -> Pick from active projects
Type note       -> Content textarea
Cmd/Ctrl+Enter  -> Save note
Escape          -> Close dialog
"Add Note"      -> Save + toast + close
"Cancel"        -> Close without saving
```

---

# TIMELINE VIEW (Tasks Page, timeline mode)

## Identity

**The Timeline view is a Gantt-style visualization of your projects over time.** It shows horizontal colored bars for each project that has dates, positioned on a day-level date axis. This gives you a visual feel for how projects overlap, when they start and end, and where "today" falls relative to your project timeline.

**Access:** Tasks page (`/tasks`) -> view mode toggle -> timeline icon (GanttChart)

---

## Page Layout

```
+------------------------------------------------------------------+
|  Project  | Jan         |  February 2026        |  Mar            |
|  column   | 18 19 .. 31 |  1  2  3 ... 14 ... 28|  1  2 ... 14   |
+------------------------------------------------------------------+
|           |             |     |                   |                |
|  Alpha    |    =========|=====|===================|===             |
|           |             |     |                   |                |
|  Beta     |             |     |======             |                |
|           |             |     |                   |                |
|  Gamma    |             | ====|=========          |                |
|           |             |  ^  |                   |                |
|           |             |today|                   |                |
+------------------------------------------------------------------+
|         Scroll horizontally to explore the timeline               |
+------------------------------------------------------------------+
```

**Component:** `src/components/timeline/TimelineView.tsx` + `TimelineHeader.tsx` + `TimelineProjectBar.tsx`

---

## What Currently Works (Sprint 9 State)

### Date Range Calculation
- Shows current month plus 2 weeks padding on each side
- Range: `startOfMonth(now) - 14 days` to `endOfMonth(now) + 14 days`
- Day width: 32px per day
- Label column width: 200px (fixed, sticky left)
- **Component:** `rangeStart` / `days` useMemo in `TimelineView.tsx`

### Auto-Scroll to Today
- On mount, scrolls horizontally to center "today" in the viewport
- Uses `useEffect` with `scrollRef`
- **Component:** `useEffect` in `TimelineView.tsx`

### Timeline Header (`TimelineHeader.tsx`)
- **Two rows:**
  - **Month row (28px):** Groups days by month, shows "MMMM yyyy" labels (e.g., "February 2026"). Each month label spans its number of days.
  - **Day row (24px):** Individual day numbers. Weekend days have muted background + muted text. Today is highlighted with primary background + bold text.
- **Sticky:** Stays at top when scrolling vertically
- **Component:** `src/components/timeline/TimelineHeader.tsx`

### Today Line
- Vertical line (`w-0.5`, primary color) running from top to bottom of the project bar area
- Positioned at the center of today's day column
- z-index 10 (above bars)
- **Component:** `todayLeft` calculation + absolute div in `TimelineView.tsx`

### Weekend Shading
- Saturday and Sunday columns get a subtle muted background (`bg-muted/15`) spanning the full height
- **Component:** Weekend shading loop in `TimelineView.tsx`

### Project Bars (`TimelineProjectBar.tsx`)
- **Visibility:** Only projects with at least one date (startDate or endDate) are shown
- **Date fallback:** If only `startDate` set, end defaults to startDate + 30 days. If only `endDate` set, start defaults to endDate - 30 days.
- **Bar appearance:** Rounded rectangle, colored with project's color, 8px height (h-8 with top-1 offset), minimum width 24px
- **Bar content:** Shows "done/total" task count (e.g., "3/5") in white text, only when project has tasks
- **Left label:** Project name as text label in a fixed 200px column on the left side (sticky)
- **Click behavior:** Navigates to `/projects/${project.id}` (project detail page)
- **Keyboard accessible:** `role="button"`, `tabIndex={0}`, Enter/Space triggers navigation, focus ring visible
- **Hover:** `brightness-110` effect
- **Aria label:** Describes project name, status, and task progress
- **Sort order:** By status order first, then by start date within same status
- **Component:** `src/components/timeline/TimelineProjectBar.tsx`

### Empty State
- When no projects have dates: Briefcase icon + "No projects with dates" + "Add a start or end date to your projects to see them on the timeline."
- Shows "Create Project" button (if `onCreateProject` prop provided) or "Go to Projects" button (links to `/projects`)
- **Component:** Empty state conditional in `TimelineView.tsx`

### Container
- Bordered card with rounded corners (`border border-border rounded-xl`)
- Horizontal scroll with max height `calc(100vh - 280px)`
- Footer hint: "Scroll horizontally to explore the timeline"
- **Component:** Outer container in `TimelineView.tsx`

---

# PROJECT SELECTOR (TaskDetailsDrawer)

## Identity

**The Project selector lets you assign or unassign a task to/from a project directly from the task detail drawer.** It appears as a card section with a Layers icon and a dropdown.

---

## What Currently Works

### Location
- Inside `TaskDetailsDrawer.tsx`, between the Recurrence section and the Description section
- Styled as a card section: `bg-panel-task-section rounded-xl p-4 space-y-2 shadow-sm`

### Selector Behavior
- **Label:** "Project" with Layers icon
- **Dropdown trigger:** Shows current project name with a color dot, or "None" if unassigned
  - Color dot: `w-2 h-2 rounded-full`, uses `project.color` or fallback `#888`
  - Project name: truncated
- **Dropdown options:**
  - "None" (first option, value `'none'`)
  - All projects from store, each showing color dot + name
- **Change:** Calls `updateTask(task.id, { projectId: ... })` + shows "Changes saved" toast
  - Selecting "None" sets `projectId` to `undefined`
  - Selecting a project sets `projectId` to that project's ID
- **Component:** Project `<Select>` section in `TaskDetailsDrawer.tsx`

---

# PROJECT BADGES (Task Rows — Tasks Page List View)

## Identity

**Project badges appear on task rows in the Tasks page list view, showing which project a task belongs to.** They provide at-a-glance project context without opening the task drawer.

---

## What Currently Works

### Badge Appearance
- Small secondary badge with: color dot (`w-2 h-2 rounded-full`) + project name
- Styled: `text-[10px] h-5 px-1.5 gap-1 font-normal`
- Color dot uses `project.color` or fallback `#888`
- Only shown when `task.projectId` is set and project is found in store

### Badge Location
- In the meta row of task list items (below the title), alongside due date badge, recurrence badge, and topic badges
- Appears first in the meta row (before date, recurrence, topics, tags)

### Not Present On
- **Kanban cards:** The `SortableTaskCard` and `TaskCard` components in `KanbanBoard.tsx` do NOT show project badges. They show due date, priority, topics, and tags — but no project badge.
- **Project Detail task rows:** Task rows on the Project Detail page do not show a project badge (redundant since you're already viewing that project)

---

# DATA MODEL

## Project Type

```typescript
type ProjectStatus = 'planning' | 'active' | 'paused' | 'completed' | 'archived';

interface Project {
  id: string;
  name: string;
  description?: string;
  topicId?: string;        // Links project to a topic
  status: ProjectStatus;
  color?: string;          // Hex color string (e.g., '#3B82F6')
  icon?: string;           // Not used in UI yet
  startDate?: string;      // 'yyyy-MM-dd' format
  endDate?: string;        // 'yyyy-MM-dd' format
  createdAt: Date;
  updatedAt: Date;
}
```

## Status Configuration (`project-config.tsx`)

| Status | Label | Icon | Color Class | BG Class | Order |
|--------|-------|------|-------------|----------|-------|
| `planning` | Planning | PenLine | `text-muted-foreground` | `bg-muted/50` | 0 |
| `active` | Active | Zap | `text-info` | `bg-info/10` | 1 |
| `paused` | Paused | Pause | `text-warning` | `bg-warning/10` | 2 |
| `completed` | Done | CheckCircle2 | `text-success` | `bg-success/10` | 3 |
| `archived` | Archived | Archive | `text-muted-foreground` | `bg-muted/30` | 4 |

## Color Palette (`PROJECT_COLORS`)

12 colors: blue, purple, pink, red, orange, amber, green, teal, cyan, indigo, fuchsia, stone.

Auto-assignment: `getProjectColor(project, index)` returns `project.color` or `PROJECT_COLORS[index % 12]`.

## Task-Project Link

- Tasks have an optional `projectId?: string` field
- One task can belong to at most one project
- One project can have many tasks
- When a project is deleted, its tasks get `projectId = undefined` (orphaned, NOT deleted)
- When a task is created from the Project Detail page, it inherits the project's `topicId` in its `topicIds` array

## Service Layer (`projects.service.ts`)

- `dbToProject()`: Converts Supabase row to app `Project` type (camelCase, null-to-undefined)
- `fetchProjects(userId)`: Fetches all projects for user, ordered by `created_at` desc
- `createProject(userId, project)`: Inserts project row, returns converted `Project`
- `updateProject(userId, id, updates)`: Partial update, auto-sets `updated_at`
- `deleteProject(userId, id)`: Hard deletes the project row (task unlinking handled in store/actions layer)

## Store Layer (`useKaivooStore.ts`)

- `projects: Project[]`: Array in Zustand store
- `addProject()`: Generates ID, sets `createdAt`/`updatedAt`, appends to array
- `updateProject(id, updates)`: Spread updates + fresh `updatedAt`
- `deleteProject(id)`: Removes project AND orphans all tasks that had `projectId === id`
- `getTasksByProject(projectId)`: Returns filtered tasks array

## Actions Layer (`useKaivooActions.ts`)

- `addProject()`: Optimistic for local, DB-first for authenticated users
- `updateProject()`: Optimistic update with rollback on error
- `deleteProject()`: Optimistic delete + task orphaning, with full rollback (re-links tasks) on error
- All errors show toast and rollback state

---

# WHAT DOESN'T WORK / WHAT'S MISSING

### Missing: Project Badges on Kanban Cards
Kanban cards (`SortableTaskCard` in `KanbanBoard.tsx`) show due date, priority, topics, and tags — but NOT the project badge. If you use Kanban view and have tasks across multiple projects, you cannot see which project a task belongs to without opening the drawer.

### Missing: Tab Counts Not Filtered
Status tab counts on the Projects page always reflect the total project count per status, regardless of search or topic filter. If you search for "launch" and get 1 result, the Active tab still says "Active 3".

### Missing: Sorting Options
No sort dropdown on the Projects page. Sort is fixed: status order, then `updatedAt` desc. Cannot sort by name, date range, progress, etc.

### Missing: Timeline Zoom / Date Range Control
The timeline shows a fixed range (current month +/- 2 weeks). No way to zoom out to see a quarter or year, or zoom in to see a single week. No left/right navigation arrows.

### Missing: Timeline Task-Level Bars
The timeline only shows project-level bars. No way to see individual task bars within a project on the timeline.

### Missing: Project Milestones
No milestone concept within projects. No way to mark key dates or deliverables on the timeline.

### Missing: Project Archiving vs. Deletion
Currently delete is the only option. The "archived" status exists and works, but there is no "archive" action separate from manually changing status to "archived". Could benefit from a dedicated archive button.

### Missing: Project Duplication
No way to duplicate a project (with or without tasks). Useful when starting similar projects.

### Edge Case: Timeline Date Fallback
If a project has only `startDate`, the timeline shows a bar from startDate to startDate+30 days. If only `endDate`, it shows endDate-30 to endDate. This is a reasonable fallback but could confuse users who don't realize the bar extends beyond their set date.

### Edge Case: Project Color Auto-Assignment
Color auto-assignment uses `projects.length % 12` for new projects in the create dialog, and `index % 12` for display. If a project is deleted, indices shift — causing all auto-colored projects to potentially change color. Projects with explicit color are unaffected.

### Edge Case: Kanban Card Project Not Visible
The Kanban card drag overlay (`TaskCard` component used in `DragOverlay`) also does not show project context.

---

# WHAT IT SHOULD BECOME

### Sprint 11+ Enhancements (Prioritized)

#### 1. Project Badges on Kanban Cards (P1)
Add the color-dot + name badge to `SortableTaskCard` in `KanbanBoard.tsx`, same pattern as the list view task row.

#### 2. Timeline Zoom & Navigation (P1)
- Date range selector: Week / Month / Quarter / Year
- Left/right arrows to shift the visible range
- Scroll to today button

#### 3. Filtered Tab Counts (P2)
Status tab counts should reflect search + topic filter, not total.

#### 4. Sort Options (P2)
Add sort dropdown: Name, Created Date, Updated Date, Start Date, End Date, Progress %.

#### 5. Project Milestones (P3)
Diamond markers on the timeline for key dates within a project.

#### 6. Timeline Task-Level View (P3)
Expand a project bar to see individual task bars nested within.

---

# INTERACTION SPEC

### Project Card (Projects Page)

```
+------------------+
| === color bar === |
| Project Alpha     |
| [Active]          |
| Description...    |
| [Topic] Jan-Feb   |
| 3/5 done   60%   |
| =========---     |
+------------------+

Tap card       -> Navigate to /projects/:id (project detail)
Hover card     -> Slight upward lift (-translate-y-0.5)
```

### Project Detail — Name

```
* Project Alpha

Click name     -> Enter edit mode (input replaces text)
Blur / Enter   -> Save name (toast "Project name updated")
Empty name     -> Reverts (no save)
```

### Project Detail — Description

```
Description text here...   [pencil icon on hover]

Click area     -> Enter edit mode (textarea appears)
Blur           -> Save description
Empty          -> Clears description (saves as undefined)
```

### Project Detail — Task Row

```
o  Design mockup                  High   Feb 23   >
   === 2/4

Click circle   -> Toggle done/undone (status = done/todo)
Click row      -> Open TaskDetailsDrawer
Hover row      -> Show chevron affordance
```

### Project Detail — Link Existing Task

```
[Link existing]   -> Open popover
[Search tasks...] -> Filter linkable tasks
Click task        -> Set projectId = this project, toast
```

### Project Detail — Add Task

```
o  Add a task to this project...   [Add]

Type title -> Enter or click Add -> Task created with projectId + topicId
```

### Project Detail — Delete

```
[Delete Project]  -> Open AlertDialog
  "This will delete 'Name'. Tasks will be unlinked but not deleted."
  [Cancel] [Delete] -> deleteProject() + toast + navigate to /projects
```

### Timeline — Project Bar

```
Click bar      -> Navigate to /projects/:id
Hover bar      -> brightness-110
Enter/Space    -> Navigate (keyboard accessible)
Bar shows      -> "done/total" in white text
```

### Task Details Drawer — Project Selector

```
Project
[* Project Alpha v]

Open dropdown  -> See all projects with color dots
Select project -> updateTask(projectId) + toast
Select "None"  -> unlink task from project
```

---

## OPEN QUESTIONS FOR USER

### Q1: Timeline zoom — what time ranges matter?
The current fixed month+2weeks view works for short-term projects. Do you need:
- **Week view** (zoomed in, useful for sprints)?
- **Quarter view** (zoomed out, useful for roadmap)?
- **Year view** (high-level planning)?

### Q2: Project milestones — is this a priority?
Would you use milestone markers on the timeline to track key deliverable dates within a project? Or are task due dates sufficient?

### Q3: Project Kanban badges — is this a pain point?
When using Kanban view, do you notice the missing project badge? Is it something you actively need, or do you primarily use Kanban within a project context?

### Q4: Project templates — would you use them?
If you could save a project structure (name template, default tasks, default topic) as a template, would that speed up project creation?

### Q5: Any project management pain points?
Are there things about the Projects module that frustrate you or feel missing that we haven't covered?

---

## MUST-NEVER-LOSE CHECKLIST: PROJECTS MODULE

### Projects List Page (`/projects`)
- [ ] Card grid layout (responsive: 1/2/3 columns)
- [ ] Status tabs: All, Active, Planning, Paused, Done, Archived
- [ ] Tab counts per status
- [ ] Empty tabs hidden (except All and Active)
- [ ] Search across project name and description
- [ ] Topic filter dropdown
- [ ] Card sort: status order, then updatedAt desc
- [ ] New Project button opens create dialog
- [ ] Empty state with create button when no projects
- [ ] Empty state with filter hint when no matches

### Project Card
- [ ] Color accent strip at top
- [ ] Project name (truncated, hover primary)
- [ ] Status badge (icon + label + color)
- [ ] Description (2-line clamp, optional)
- [ ] Topic badge (optional)
- [ ] Date range with calendar icon (optional)
- [ ] Task progress: "X/Y done" + percentage + colored progress bar
- [ ] Click navigates to project detail
- [ ] Hover lift animation

### Create Project Dialog
- [ ] Name field (required, autofocus, Enter to create)
- [ ] Description field (optional, textarea)
- [ ] Status selector (defaults to Planning)
- [ ] Topic selector (defaults to None)
- [ ] Start/End date inputs
- [ ] Color palette (12 colors, auto-assign if not picked)
- [ ] Create button (disabled when name empty)
- [ ] Cancel button
- [ ] Form reset after creation
- [ ] Success toast on create

### Project Detail Page
- [ ] Breadcrumb: Projects > Project Name (Projects is clickable link)
- [ ] Not-found state with back button
- [ ] Inline name editing (click, blur/Enter to save, toast)
- [ ] Color dot next to name
- [ ] Status selector (pill-style, instant save)
- [ ] Topic badge display
- [ ] Date range display (MMM d, yyyy format)
- [ ] Completion percentage in header
- [ ] Inline description editing (click, blur to save, pencil hover icon)
- [ ] Stats bar: total tasks, open, done, progress bar (only when tasks exist)
- [ ] Task list with completion toggle, title, subtask progress, priority, due date, chevron
- [ ] Task sort: incomplete first, then createdAt desc
- [ ] Task click opens TaskDetailsDrawer
- [ ] Completion toggle stops propagation (doesn't open drawer)
- [ ] Strikethrough + muted for completed tasks
- [ ] Add task inline input (Enter or Add button)
- [ ] New task inherits projectId and project's topicId
- [ ] Link existing task popover (search, click to link, toast)
- [ ] Linkable tasks: not already in project, not done, max 20
- [ ] Settings card: color picker, start/end date inputs, delete button
- [ ] Delete confirmation dialog ("Tasks will be unlinked but not deleted")
- [ ] Delete action: removes project, orphans tasks, toast, navigate to /projects
- [ ] Empty task list state

### Timeline View
- [ ] Accessible from Tasks page view mode toggle (3rd icon: GanttChart)
- [ ] Shows only projects with at least one date
- [ ] Day-level date axis with month grouping
- [ ] Today highlighted in header (primary bg, bold)
- [ ] Today vertical line (primary color)
- [ ] Weekend column shading
- [ ] Project label column (fixed 200px, sticky left)
- [ ] Colored project bars positioned by date range
- [ ] Bar minimum width 24px
- [ ] Bar shows "done/total" task count in white text
- [ ] Date fallback: missing start = end-30d, missing end = start+30d
- [ ] Click bar navigates to project detail
- [ ] Keyboard accessible (Enter/Space to navigate, focus ring)
- [ ] Auto-scroll to center today on mount
- [ ] Horizontal scroll with footer hint
- [ ] Bar sort: status order, then start date
- [ ] Empty state when no projects have dates
- [ ] Aria labels on bars

### Project Selector (TaskDetailsDrawer)
- [ ] Appears between Recurrence and Description sections
- [ ] Layers icon + "Project" label
- [ ] Dropdown shows: "None" + all projects with color dots
- [ ] Current selection shows color dot + project name (or "None")
- [ ] Change saves immediately + toast
- [ ] Selecting "None" unlinks task (projectId = undefined)

### Project Badges (Tasks Page List View)
- [ ] Color dot + project name badge on task rows
- [ ] Only shown when task has projectId and project exists
- [ ] Appears first in meta row (before date, recurrence, topics)

### Project Notes (ProjectDetail)
- [ ] Notes section between Tasks and Settings on project detail
- [ ] Notes sorted newest-first by createdAt
- [ ] Progressive disclosure: first 5 notes, "Show N more" for rest
- [ ] Long note clamping (4 lines) with "Show more" / "Show less"
- [ ] Relative timestamps on each note
- [ ] Inline editing: click pencil → textarea → Enter to save, Escape to cancel
- [ ] Shift+Enter inserts newline in edit mode (does not save)
- [ ] Empty content reverts edit without saving
- [ ] Inline delete confirmation strip (not modal)
- [ ] Add note input at bottom with Enter to create
- [ ] Empty state with StickyNote icon and encouraging text
- [ ] Add input remains visible in empty state
- [ ] Note count in section header

### Quick-Add Note Dialog
- [ ] Cmd+Shift+N (Mac) / Ctrl+Shift+N opens from any page
- [ ] Project picker shows active projects only (not archived)
- [ ] Color dots in project picker
- [ ] Pre-selects current project when on project detail page
- [ ] Textarea auto-focuses on open
- [ ] Cmd/Ctrl+Enter to save
- [ ] Button disabled until project selected AND content non-empty
- [ ] Success toast with project name
- [ ] Form resets on each open
- [ ] "No active projects" shown when no projects exist

### Project Notes Data Integrity
- [ ] Notes CASCADE-deleted when project is deleted (both DB and local store)
- [ ] Notes included in data export
- [ ] Notes import remaps project_id via projectIdMap
- [ ] Optimistic updates with rollback on error
- [ ] Error toasts on all failed note operations
- [ ] RLS: all note queries filtered by user_id

### Data Integrity
- [ ] Project deletion orphans tasks (projectId = undefined), does NOT delete tasks
- [ ] Optimistic updates with rollback on error (including task re-linking on failed delete)
- [ ] Error toasts on all failed operations
- [ ] RLS: all queries filtered by user_id

### Cross-Page Consistency
- [ ] Task completed on Project Detail updates Tasks page and Today widget
- [ ] Task created on Project Detail appears in Tasks page
- [ ] Project selector in TaskDetailsDrawer reflects project changes immediately
- [ ] Project card progress updates when tasks are completed/created anywhere
- [ ] Timeline bars reflect project date changes immediately

---

*Feature Use Case Bible — Projects Module — v0.1*
*Compiled by Agent 11 (Feature Integrity Guardian)*
*February 24, 2026*
