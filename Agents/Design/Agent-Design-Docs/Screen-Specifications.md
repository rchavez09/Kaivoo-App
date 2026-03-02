# Screen Specifications — 8 Key Screens

**Source:** Extracted from Agent 1 (Senior UI Designer) during Design Agent merge — Section 3 (all 8 screen wireframes)
**Parent:** [Agent-Design.md](../Agent-Design.md)

---

## Screen 1: Today (Home Dashboard)

### Wireframe Description
```
┌─────────────────────────────────────────────────────────────┐
│  HEADER BAR (64px)                                          │
│  [K] Today  Journal  Tasks  Calendar  Topics  Insights [🔍][👤]│
├─────────────────────────────────────────────────────────────┤
│  max-width: 720px, centered                                  │
│                                                              │
│  Today                                    [⚙ Customize]      │
│  Wednesday, February 20, 2026                                │
│  ─────────                                                   │
│                                                              │
│  ┌─ DAILY BRIEF (full-width card) ───────────────────────┐  │
│  │  Good morning. Here's your day:                        │  │
│  │  ■ 3 tasks due  ■ 4 meetings  ■ 2/5 routines done    │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌─ JOURNAL (full-width card) ───────────────────────────┐  │
│  │  [Icon] What's on your mind?                           │  │
│  │  ┌──────────────────────────────────────────────────┐  │  │
│  │  │ Start typing... (rich text editor)                │  │  │
│  │  └──────────────────────────────────────────────────┘  │  │
│  │  [#tags] [[[topic]]]                  [Save] primary   │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌─ TASKS (half-width) ──┐  ┌─ CALENDAR (half-width) ────┐  │
│  │  OVERDUE                │  │  TODAY'S SCHEDULE           │  │
│  │  ☐ Review report (H)   │  │  9:00  Team standup        │  │
│  │  TODAY                  │  │  11:00 1:1 with Manager    │  │
│  │  ☐ Design sync (M)     │  │  14:00 Product review      │  │
│  │  ☐ Send notes (M)      │  │  16:30 Design sync         │  │
│  │                         │  │                            │  │
│  │  [View all tasks →]     │  │  [View calendar →]         │  │
│  └─────────────────────────┘  └────────────────────────────┘  │
│                                                              │
│  ┌─ TRACKING (half-width)─┐                                  │
│  │  ROUTINES                                                 │
│  │  ☑ Morning meditation  │                                  │
│  │  ☑ Exercise            │                                  │
│  │  ☐ Read 30 min         │                                  │
│  │  ☐ Journal evening     │                                  │
│  │  ── 2/4 complete ──    │                                  │
│  └─────────────────────────┘                                  │
│                                                              │
│  ┌─ TODAY'S ACTIVITY (full-width card) ──────────────────┐  │
│  │  Timeline: chronological feed of today's events        │  │
│  │  9:30 AM  📓 Journal entry: "Need to finalize..."     │  │
│  │  10:00 AM ✅ Completed: Gather financial data          │  │
│  │  11:15 AM 📓 Journal entry: "Amani requested..."      │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Component Inventory
| Element | Component | Spec |
|---------|-----------|------|
| Page title | Headline (40px, Medium 500) | Deep Navy |
| Date subtitle | Body (16px, Regular 400) | Slate |
| Customize button | Icon-Only button | Charcoal, 40×40px |
| Widget cards | Card (Default variant) | 1px Mist border, 16px radius, 24px padding |
| Widget titles | Subheadline (13px, Bold 700, uppercase) | Sage Mist |
| Task items | List (Actionable) | Checkbox + Body text |
| Meeting items | List (Simple) | Time (Footnote) + Title (Callout) |
| Routine items | List (Actionable) | Checkbox + Body text |
| Timeline items | List (Rich) | Time + Icon + Description |
| Section links | Link Button | Resonance Teal, Callout |

### Interaction Specifications
- **Tap task checkbox:** Toggle completion, animate checkmark (stroke draw, 400ms), move to completed section
- **Tap task title:** Open TaskDetailsDrawer (right panel on desktop, bottom sheet on mobile)
- **Tap meeting:** Open MeetingDetailsDrawer
- **Tap "Customize":** Open widget configuration panel (drag-to-reorder, toggle visibility)
- **Tap timeline entry:** Open edit dialog for that entry type
- **Long-press widget card:** Enter reorder mode (drag handles appear)

### Empty State
```
┌───────────────────────────────────────┐
│                                       │
│    [Sage Mist line-art illustration]  │
│    64px, centered                     │
│                                       │
│    Welcome to your day                │
│    (Title 2, Deep Navy)               │
│                                       │
│    Start by writing in your journal   │
│    or adding your first task.         │
│    (Body, Slate)                      │
│                                       │
│    [Start journaling] primary button  │
│                                       │
└───────────────────────────────────────┘
```

### Loading State
- Skeleton screens matching exact card dimensions
- Shimmer animation: Cloud → Mist → Cloud, 1.5s ease-in-out infinite
- Text skeletons: 14px height, widths at 100%, 80%, 60% for multi-line
- Widget card skeletons maintain 16px border-radius

### Error State
- Alert banner (Error variant) at top of content area
- Message: "Couldn't load your data. Check your connection and try again."
- [Retry] primary button + [Dismiss] secondary

---

## Screen 2: Journal Page

### Wireframe Description
```
┌─────────────────────────────────────────────────────────────┐
│  HEADER BAR                                                  │
├─────────────────────────────────────────────────────────────┤
│  max-width: 720px, centered                                  │
│                                                              │
│  Journal                                                     │
│  ─────────                                                   │
│                                                              │
│  ┌─ DATE NAVIGATION ────────────────────────────────────┐   │
│  │  [←]  February 20, 2026  [→]  [📅 Pick date]        │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌─ COMPOSE (card) ─────────────────────────────────────┐   │
│  │  [Rich text editor - TipTap]                          │   │
│  │  Placeholder: "What's on your mind?"                  │   │
│  │                                                        │   │
│  │  [#tags] [[[topics]]]          [Save entry] primary   │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  TODAY'S ENTRIES (Subheadline)                                │
│                                                              │
│  ┌─ Entry Card ─────────────────────────────────────────┐   │
│  │  9:30 AM                                    [•••]     │   │
│  │  Need to finalize the NUWAVE branding by end of       │   │
│  │  week. Key focus: modern, professional.               │   │
│  │  [#branding] [[NUWAVE]]                               │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌─ Entry Card ─────────────────────────────────────────┐   │
│  │  11:15 AM                                   [•••]     │   │
│  │  Amani requested updates to the dashboard layout.     │   │
│  │  Meeting scheduled for Thursday.                      │   │
│  │  [#meeting] [#design] [[NUWAVE/Amani]]                │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Empty State
"No entries for this date. Start writing to capture your thoughts."
[Start writing] button focuses the compose editor.

---

## Screen 3: Tasks (Kanban Board)

### Wireframe Description
```
┌─────────────────────────────────────────────────────────────────────┐
│  HEADER BAR                                                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Tasks                                    [+ New task]  [≡/⊞ View]  │
│  ─────                                                               │
│                                                                      │
│  [Filter: All ▼] [Priority ▼] [Topic ▼]      [🔍 Search tasks]     │
│                                                                      │
│  ┌─ BACKLOG ──┐ ┌─ TODO ─────┐ ┌─ DOING ────┐ ┌─ DONE ─────┐      │
│  │  count: 2  │ │  count: 3  │ │  count: 1  │ │  count: 4  │      │
│  │            │ │            │ │            │ │            │      │
│  │ ┌────────┐ │ │ ┌────────┐ │ │ ┌────────┐ │ │ ┌────────┐ │      │
│  │ │Task    │ │ │ │Task    │ │ │ │Task    │ │ │ │Task ✓  │ │      │
│  │ │card    │ │ │ │card    │ │ │ │card    │ │ │ │card    │ │      │
│  │ └────────┘ │ │ └────────┘ │ │ └────────┘ │ │ └────────┘ │      │
│  │            │ │            │ │            │ │            │      │
│  │ ┌────────┐ │ │ ┌────────┐ │ │            │ │ ┌────────┐ │      │
│  │ │Task    │ │ │ │Task    │ │ │            │ │ │Task ✓  │ │      │
│  │ │card    │ │ │ │card    │ │ │            │ │ │card    │ │      │
│  │ └────────┘ │ │ └────────┘ │ │            │ │ └────────┘ │      │
│  └────────────┘ └────────────┘ └────────────┘ └────────────┘      │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘

Task Card (within Kanban):
┌────────────────────────────┐
│  [●] High                  │  ← Priority dot (Ember for high, Sunlit Amber for medium, Sage Mist for low)
│  Review quarterly report   │  ← Title (Callout, 15px, Deep Navy)
│  Due: Today                │  ← Due date (Footnote, 13px, Ember if overdue, Slate if future)
│  ▓▓▓▓░░ 1/3 subtasks      │  ← Progress bar (Resonance Teal fill, Mist track)
│  [#work] [[NUWAVE]]       │  ← Tags + Topics (tag-chip, topic-chip)
└────────────────────────────┘
```

### List View Alternative
A toggle switches between Kanban (board) and List (table) views. The list view follows the Kaivoo Table component:
- Header: Cloud background, Footnote Medium, sortable columns
- Columns: Title, Status, Priority, Due Date, Tags, Topics
- Row hover: Sage Mist at 6% background
- Mobile: Converts to stacked card layout

---

## Screen 4: Calendar Page

### Wireframe
Monthly grid view with meeting indicators. Day cells show dot indicators (max 3 visible). Side panel shows selected day's schedule as a time-column list.

---

## Screen 5: Topics Hub

### Wireframe
Card grid (3 columns desktop, 2 tablet, 1 mobile). Each topic card shows: Icon (32px), Name (Title 3), Description (Callout, Slate), count of linked items. Tap navigates to Topic detail page.

---

## Screen 6: Topic Detail Page

### Wireframe
Breadcrumb navigation → Topic title with icon → Tab navigation (Captures | Tasks | Journal Entries | Sub-pages). Content area shows filtered lists from the main data store.

---

## Screen 7: Insights Page

### Wireframe
Dashboard layout with Stat/Metric cards (4-column row) showing: Tasks Completed This Week, Journal Entries, Routine Completion Rate, Active Topics. Below: Line chart (weekly task completion), Bar chart (daily activity). Uses Chart Container component with Resonance Teal as primary series.

---

## Screen 8: Settings Page

### Wireframe
Sidebar navigation (Profile, Account, Appearance, AI Settings, Notifications, Data). Max content width: 680px. Settings rows with label + description (left) and control (right). Toggle switches for theme, AI enable/disable. Destructive actions (delete account) at bottom with confirmation modal.
