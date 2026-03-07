# Research Brief: Project Management Patterns for Solo/Small-Team Productivity

**Date:** 2026-02-24
**Domain:** Domain 2 (Calendar & Time Management) + Domain 1 (PKM)
**Requested by:** Director (user ideation session)
**Confidence:** High

---

## 1. Competitive Comparison Table

| Tool | Hierarchy Depth | Levels | Timeline Approach | Tag/Label System | Progressive Complexity |
|------|:-:|---|---|---|---|
| **Linear** | 3 | Workspace > Project > Issue (+ sub-issues) | Project roadmap: horizontal bars, milestone markers. No Gantt. | Labels (multi-select, colored). Separate from hierarchy. Cycles for time-boxing. | Issues work standalone. Projects optional. Labels optional. Cycles optional. |
| **Todoist** | 3 | Project > Section > Task (+ sub-tasks) | No timeline view. Calendar feed only. Board view available. | Labels (colored, multi-select). Filters combine labels + projects. | Start with Inbox (no project). Move tasks to projects when ready. Sections optional. |
| **Sunsama** | 2 | Channel (integration source) > Task | No timeline. Daily planner: drag tasks onto calendar time blocks. | Tags/contexts for categorization. Channels map to integrations. | Task-first. No project hierarchy at all. |
| **Notion** | Unlimited | Database relations. Typical: Area > Project > Task > Sub-task. User-defined depth. | Timeline view = horizontal bars on date axis. Supports sub-items. Database-native. | Multi-select properties, relations to tag databases. Fully custom. | Empty database = just rows. Add properties, relations, views as needed. |
| **ClickUp** | 5 | Workspace > Space > Folder > List > Task (+ subtask + checklist) | Full Gantt view with dependencies. Timeline view (simpler). Calendar view. | Tags (colored, global). Separate from hierarchy. Also: Custom Fields. | "Everything" view flattens hierarchy. Can ignore Spaces/Folders initially. |

### Key Observations

- **Linear** is the clearest model for Kaivoo's use case. Three levels, labels orthogonal to hierarchy, projects have roadmap views.
- **Todoist** users frequently request timeline views — a known gap.
- **Notion's** unlimited depth leads to "my system collapsed" posts. But its timeline view (horizontal date bars) is the gold standard.
- **ClickUp** is the cautionary tale: 5 levels = solo users collapse to 3 anyway.

---

## 2. Recommended Hierarchy: 3 Active Levels + 1 Ambient Level

```
Topic (ambient context — NOT a container, just a facet/association)
   |
Project (primary organizational container — has dates, has status)
   |
Task (unit of work — has status, priority, tags, optional dates)
   |
Subtask (granular step — checkbox, minimal metadata)
```

### Why NOT strict 4-level nesting

Topics as containers (Topic > Project > Task > Subtask) creates mandatory 4-level drill-down. Evidence:
- **ClickUp:** Solo users ignore 2 of 5 levels.
- **Notion:** "I spend more time organizing than doing."
- **Linear:** Explicitly capped at 3 levels by design choice.
- **Todoist:** 3 levels covers vast majority of use cases.

### Topics as Facets, Not Containers

```
CONTAINMENT (hierarchy):       FACETING (association):
  Topic                          Topic <-- associated with --> Project
    |-- Project                  Topic <-- associated with --> Journal Entry
        |-- Task                 Topic <-- associated with --> Capture
            |-- Subtask          Project --> contains --> Task --> contains --> Subtask
```

Benefits:
- Navigation depth is 3 (Project > Task > Subtask)
- Filtering/context via Topics ("show me everything NUWAVE")
- A task belongs to a Project AND is tagged with a Topic

---

## 3. Top 3 Lightweight Timeline Patterns

### Pattern 1: Project Bars (Notion-style) — RECOMMENDED FOR SPRINT 9

```
         Feb         Mar         Apr         May
         |           |           |           |
[==== Toll Ring Campaign ========]
    [==== Website Redesign =================]
                    [==== Q2 Content Plan ====]
```

Horizontal bars on date axis. Each bar = one project. Click to drill in. Requires only `start_date` and `end_date`. Low implementation complexity.

### Pattern 2: Stacked Timeline (Sunsama-inspired Weekly) — DEFER

Week view with tasks stacking in day columns. Overlaps with Calendar page redesign.

### Pattern 3: Swimlane Timeline (Linear Roadmap) — SPRINT 10+

Project Bars grouped into horizontal swimlanes by Topic. Natural evolution from Pattern 1.

---

## 4. Tags + Projects + Topics Coexistence Model

### Recommended Model

```
CONTAINMENT (singular, hierarchical):
  Task.project_id  -> UUID  (nullable — task can be unassigned)
  Subtask.task_id  -> UUID  (required)

CATEGORIZATION (plural, flat/faceted):
  Task.tags        -> text[]   (hashtags: #video, #design)
  Task.topic_ids   -> uuid[]   (keep existing field)
  Project.topic_id -> UUID     (singular — one primary Topic per project)
```

### Schema Changes

1. Tasks get new nullable `project_id` column (FK to `projects.id`)
2. Existing `topic_ids` on tasks remains (backward compatible)
3. Projects get `topic_id` column (singular FK, nullable)
4. No data migration needed — existing tasks continue working

---

## 5. Project Dates and Undated Tasks

Rules:
1. Project appears on timeline IF it has a `start_date`
2. Tasks WITHOUT dates appear in List/Kanban views of the project
3. No enforcement that task dates must fall within project date range
4. "Ongoing" projects (no `end_date`) render with faded/arrow right edge
5. Show "Unscheduled" section for undated tasks

---

## 6. Sprint 9 vs. Defer

### Ship in Sprint 9

| Feature | Rationale |
|---|---|
| `projects` table | Core entity |
| `project_id` on tasks (nullable FK) | Links tasks to projects |
| Project CRUD service layer | Basic operations |
| Project detail view | "Inside a project" screen |
| Projects list/grid | Entry point |
| Project selector in TaskDetailsDrawer | Assign tasks to projects |
| Timeline View v1 (Project Bars) | Horizontal bars on date axis |
| View mode toggle: List / Kanban / Timeline | Third option |

### Defer to Sprint 10+

- Project templates (relative dates, instantiation)
- Swimlane timeline (grouping by Topic)
- Task-level bars on timeline
- Drag-and-resize on timeline
- Project progress/burndown
- Project-scoped Kanban

---

## 7. Proposed Data Model

```sql
CREATE TABLE projects (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES auth.users(id),
  name        text NOT NULL,
  description text,
  topic_id    uuid REFERENCES topics(id) ON DELETE SET NULL,
  status      text NOT NULL DEFAULT 'planning'
              CHECK (status IN ('planning', 'active', 'paused', 'completed', 'archived')),
  color       text,
  icon        text,
  start_date  text,
  end_date    text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE tasks
  ADD COLUMN project_id uuid REFERENCES projects(id) ON DELETE SET NULL;

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own projects"
  ON projects FOR ALL
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE INDEX idx_projects_user_status ON projects(user_id, status);
CREATE INDEX idx_tasks_project_id ON tasks(project_id);
```

---

## Trade-offs

| Decision | Gain | Give Up |
|---|---|---|
| Topics as facets, not containers | Simpler navigation (3 levels), cross-cutting filtering | No "drill into Topic to see Projects" view |
| Project Bars (not Gantt) | Simplicity, fast to build, works on mobile | No dependency tracking |
| Nullable project_id | Backward compatibility, progressive adoption | "Unassigned" tasks need an Inbox/orphan list |
| Singular topic_id on projects | Simpler data model, clear ownership | Project can't formally belong to two Topics |

---

*Research Brief — Agent 5 v1.1 — February 24, 2026*
