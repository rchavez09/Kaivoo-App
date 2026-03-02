# Design Exploration: Projects, Timeline View, and Calendar Redesign

**Date:** February 23, 2026
**Source:** Director-facilitated ideation session with user
**Status:** Exploration — awaiting Agent 5 research before wireframing
**Assigned to:** Design Agent

---

## Overview

Three connected design challenges emerged from the user ideation session:

1. **Projects as a new entity** — how projects appear in the Tasks page, how tasks nest inside them
2. **Timeline view** — a third view mode (List | Kanban | Timeline) that is project-first
3. **Calendar page redesign** — meetings-first visual weight, inverse of the Timeline view

All three share a **layered filter system** that lets users toggle Projects, Tasks, and Meetings visibility independently.

---

## Design Challenge 1: Projects in the Tasks Page

### Entity Hierarchy
```
Topic (NUWAVE) — persists across time, links journal/captures/projects
└── Project ("Toll Ring Campaign") — has date range (Jan–Mar)
    ├── Task: "Video Production" #video
    │   ├── Subtask: Record Video
    │   ├── Subtask: Edit
    │   └── Subtask: Animation
    └── Task: "Design" #design
        ├── Subtask: Landing Page
        ├── Subtask: PPT Design
        └── Subtask: One Pager
```

### Questions for Design Agent
- How do Projects appear in the List view? As collapsible sections? As a separate tab? As a sidebar filter?
- How does the Tasks page handle "standalone tasks" (tasks not inside any project)? Do they still work as they do today?
- What does a Project detail view look like? (Summary, task list, progress, date range, template source)
- How does creating a task inside a project differ from creating a standalone task?
- What does the Project creation flow look like? (Name, date range, topic, apply template?)

### Key Constraint
Tasks currently have Topics. Under the new model, Tasks drop Topics (keeping only hashtags) and Projects become the parent organizer. Projects optionally link to Topics. The migration should feel natural — users who never create Projects still have a working task list.

---

## Design Challenge 2: Timeline View (Tasks Page)

### Visual Concept
```
Tasks Page:  [List]  [Kanban]  [Timeline]
                                 ▲ new

┌─────────────────────────────────────────────────────────────┐
│  Jan          Feb          Mar          Apr                  │
│  ─────────────────────────────────────────────               │
│                                                              │
│  ████████████ Toll Ring Campaign ██████████████              │
│    ├── ▓▓▓ Video Production ▓▓▓                              │
│    ├── ▓▓▓▓▓▓ Design ▓▓▓▓▓▓                                 │
│    └── ▓▓ Social Media ▓▓                                    │
│               ● Kickoff    ● Review    ● Delivery            │
│               Meeting      Meeting     Meeting               │
│                                                              │
│  ████████ Q2 Brand Refresh █████████████████████             │
│    ├── ▓▓▓ Brand Audit ▓▓▓                                   │
│    └── ▓▓▓▓▓ Asset Redesign ▓▓▓▓▓                           │
│                                                              │
│  [Show: ☑ Projects  ☑ Tasks  ☐ Meetings]                    │
│  [Filter: All Topics ▼]  [Filter: All Projects ▼]           │
└─────────────────────────────────────────────────────────────┘
```

### Visual Priority (Project-First)
- **Projects:** Dominant — full-width bars with project name, colored by topic or status
- **Tasks:** Secondary — narrower bars within the project's visual lane
- **Meetings:** Minimal — small dots or markers on the timeline, hoverable for details

### Interactions to Design
- Drag project bar to change date range
- Drag task bar within project lane to reschedule
- Resize bar edges to change start/end date
- Click project bar to expand/collapse task lanes
- Click meeting dot to see meeting details popover
- Click empty space to add new task/project at that date
- Scroll horizontally through time (week, month, quarter zoom levels?)

### Key Design Questions
- What zoom levels make sense? (Week / Month / Quarter?)
- How does the timeline handle tasks without dates?
- Should standalone tasks (no project) appear in the timeline?
- How do we prevent visual overwhelm when many projects overlap?
- How does this view work on mobile? (Is it desktop/tablet only?)

---

## Design Challenge 3: Calendar Page Redesign (Meetings-First)

### Visual Concept
```
Calendar Page:  [Day]  [Week]  [Month]

┌─────────────────────────────────────────────────────────────┐
│  Week of Feb 16, 2026                                        │
│  Mon     Tue     Wed     Thu     Fri     Sat     Sun         │
│                                                              │
│  ┌───┐  ┌───┐  ┌───┐                    ┌───┐               │
│  │9am│  │10a│  │9am│                    │11a│               │
│  │Sta│  │Des│  │Cli│                    │Bru│               │
│  │ndu│  │ign│  │ent│                    │nch│               │
│  │p  │  │Rev│  │Cal│                    │   │               │
│  └───┘  │iew│  │l  │                    └───┘               │
│         └───┘  └───┘                                         │
│  ┌───┐         ┌───┐                                         │
│  │2pm│         │3pm│                                         │
│  │Tea│         │Int│                                         │
│  │m  │         │ern│                                         │
│  │Syn│         │al │                                         │
│  │c  │         │Rev│                                         │
│  └───┘         └───┘                                         │
│                                                              │
│  ··· Toll Ring Campaign ···     (subtle project line)        │
│  • Video  • Design              (task dots, hoverable)       │
│                                                              │
│  [Show: ☐ Projects  ☐ Tasks  ☑ Meetings]                    │
│  [Filter: All Topics ▼]  [Filter: All Projects ▼]           │
└─────────────────────────────────────────────────────────────┘
```

### Visual Priority (Meetings-First)
- **Meetings:** Dominant — full blocks with time, title, duration, join link
- **Projects:** Subtle — thin horizontal lines spanning their date range
- **Tasks:** Minimal — small dots or pills, hoverable for detail

### Same Filter System
Both the Timeline view and Calendar page share the same toggle/filter controls:
- Show/hide: Projects, Tasks, Meetings (checkboxes)
- Filter by: Topic, Project (dropdowns)
- The visual weight just flips between the two pages

### Key Design Questions
- Does the Calendar page still need Day/Week/Month view modes, or does the Timeline view absorb some of this?
- How do manually-entered meetings coexist with future API-synced meetings?
- What's the empty state when there are no meetings? (This is the current situation for users without calendar integrations)
- Should the "meetings-first" Calendar view also serve as the landing page for the Daily Shutdown flow (UC10)?

---

## Shared Design Pattern: Layered Filter System

Both views use the same filter component:

```
┌─────────────────────────────────────────────────┐
│  Show:  [☑ Projects]  [☑ Tasks]  [☐ Meetings]  │
│  Filter: [All Topics ▼]  [All Projects ▼]       │
│  View:  [Only "Toll Ring Campaign" ×]            │
└─────────────────────────────────────────────────┘
```

- Checkboxes toggle entity types on/off
- Dropdowns filter within entity types
- "Only show X" creates a focused view (removable chip)
- State persists per page (Timeline remembers its filters, Calendar remembers its own)
- Same component, different default state per page

---

## Dependencies

| Dependency | Status | Blocks |
|---|---|---|
| Agent 5: Project management patterns research | Requested | Data model decisions, hierarchy depth |
| Agent 5: Entity graph patterns research | Requested | Connection model, folder structure |
| Projects data model finalized | Pending research | All wireframes involving Projects |
| User confirmation on Topics migration | Confirmed (ideation session) | Tasks lose Topics, keep hashtags |

---

## Next Steps

1. **Wait for Agent 5 research** — patterns research will inform hierarchy depth and timeline visualization
2. **Wireframe Projects in List view** — how projects appear alongside standalone tasks
3. **Wireframe Timeline view** — project bars, task lanes, meeting dots, filter controls
4. **Wireframe Calendar redesign** — meetings-first, project/task dots, shared filter system
5. **Wireframe Project Templates flow** — create template, apply to new project, customize

---

*Design Exploration — Director v1.3 — February 23, 2026*
