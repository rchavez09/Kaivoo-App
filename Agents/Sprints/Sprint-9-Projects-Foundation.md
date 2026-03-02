# Sprint 9: Projects Foundation + Timeline — Sprint Contract

**Status:** PENDING APPROVAL
**Theme:** Projects Foundation — New `projects` entity, task-project linking, projects page, project detail view, and Timeline View v1
**Branch:** `sprint/9-projects-foundation`
**Director:** Active
**Date:** February 24, 2026
**Vision Position:** Phase 1 — Cloud Command Center (~95% → ~98% on completion)

---

## Context

Sprint 8 shipped Notes Foundation (renamed Journal → Notes, per-entry metadata, collapsible entries, split-to-new-entry). The next major gap in Phase 1 is the **Projects system** — a key architectural entity that gives tasks hierarchical grouping, date-range scoping, and a visual timeline.

Currently, tasks live flat (grouped only by Topics via `topic_ids` array). Users managing multi-task initiatives (marketing campaigns, product launches, renovation projects) have no way to group related tasks under a container with start/end dates.

**Agent 5 Research Findings** (see `Agent-5-Docs/Research-Brief-Project-Management-Patterns.md`):
- 3 active hierarchy levels is the sweet spot (Project > Task > Subtask). 4+ overwhelms solo users (ClickUp, Notion evidence).
- Topics should be **facets** (associations), not containers. A Project has one primary Topic; Tasks keep independent `topic_ids`.
- Notion-style Project Bars (horizontal bars on date axis) is the right v1 timeline — not Gantt.
- Progressive adoption: tasks without a project continue working unchanged.

**Source documents:**
- `Research/Agent-5-Docs/Research-Brief-Project-Management-Patterns.md` (Feb 24, 2026)
- `Research/Agent-5-Docs/Research-Brief-Request-Entity-Graph-Patterns.md` (deferred to Sprint 10+)
- `Quality/Agent-11-Docs/Feature-Bible-Tasks-Page.md` v0.1
- `Engineering/Agent-7-Docs/Review-Quick-Reference.md`
- `Sprints/Next-Sprint-Planning.md` — Sprint 8 deferred items

---

## User Decisions (Confirmed — Feb 24, 2026)

- **Scope:** Projects Foundation + Timeline View (not just data model)
- **Topics coexist with Projects:** Tasks can have both a `project_id` (containment) AND `topic_ids` (categorization)
- **Topics are facets, not containers:** Projects have one `topic_id`, but Topics don't "own" Projects hierarchically
- **Timeline v1:** Notion-style Project Bars (horizontal bars on date axis, click-to-drill-in)
- **Progressive adoption:** Existing tasks without projects continue working — `project_id` is nullable

---

## Agent Assignments

| Agent | Role | Parcels |
|---|---|---|
| **Agent 12** (Data Engineer) | Database migration, RLS, indexes | P1 |
| **Agent 2** (Staff Software Engineer) | Implementation | P2–P8 |
| **Design Agent** | ProjectCard, ProjectDetail, Timeline visual design | Pre-work (embedded in parcel specs) |
| **Agent 7** (Code Reviewer) | Code review gate | P9 |
| **Agent 11** (Feature Integrity Guardian) | Feature Bible update + integrity gate | P9 |

**Not needed this sprint:** Agent 3 (no infra changes), Agent 4 (RLS follows established patterns), Agent 5 (research delivered), Agent 8 (no pricing impact), Agent 9 (no DevOps changes)

---

## Parcels

### P1: Database Migration — Projects Table + Tasks FK
**Priority:** P0 (foundation)

Create the `projects` table and add `project_id` FK to `tasks` via Supabase migration.

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

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own projects"
  ON projects FOR ALL
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

ALTER TABLE tasks ADD COLUMN project_id uuid REFERENCES projects(id) ON DELETE SET NULL;

CREATE INDEX idx_projects_user_status ON projects(user_id, status);
CREATE INDEX idx_tasks_project_id ON tasks(project_id);
```

- RLS uses `(select auth.uid())` subquery form (per project convention)
- `ON DELETE SET NULL` — deleting a project orphans tasks, doesn't cascade-delete
- `text` dates match existing `tasks.due_date` / `tasks.start_date` convention
- After migration: regenerate TypeScript types, run security advisors

---

### P2: Types + Service Layer
**Priority:** P0
**Depends on:** P1

**2a: Types** — Add to `daily-flow/src/types/index.ts`:
- `ProjectStatus` type: `'planning' | 'active' | 'paused' | 'completed' | 'archived'`
- `Project` interface: id, name, description, topicId, status, color, icon, startDate, endDate, createdAt, updatedAt
- Add `projectId?: string` to `Task` interface

**2b: New service** — `daily-flow/src/services/projects.service.ts`:
- `dbToProject(row)` converter
- `fetchProjects(userId)` — ordered by created_at desc
- `createProject(userId, project)` / `updateProject(userId, id, updates)` / `deleteProject(userId, id)`
- Follows exact pattern from `tasks.service.ts` and `topics.service.ts`

**2c: Update tasks.service.ts:**
- `dbToTask`: add `projectId: row.project_id ?? undefined`
- `createTask`: include `project_id` in payload
- `updateTask`: handle `projectId` in updates

---

### P3: Store + Actions + Query Pipeline
**Priority:** P0
**Depends on:** P2

Wire Projects into the full data flow (same pattern as every other entity):

- **queryKeys.ts:** Add `projects: (userId) => ['kaivoo', 'projects', userId]`
- **useInvalidate.ts:** Add `'projects'` to `EntityType` union
- **useKaivooQueries.ts:** Add `fetchProjects` query, convert with `dbToProject`, include in `setFromDatabase()`
- **useKaivooStore.ts:** Add `projects: Project[]`, CRUD methods, `getTasksByProject(id)` helper, update `DatabaseData` and `partialize`
- **useDatabase.ts:** Add `fetchProjects` to `loadData`, add CRUD wrappers to `useDatabaseOperations`
- **useKaivooActions.ts:** Add `addProject`, `updateProject`, `deleteProject` with optimistic updates + `invalidate('projects')`

---

### P4: Project Config + Color Palette
**Priority:** P1
**Depends on:** P2

New file: `daily-flow/src/lib/project-config.tsx` (analogous to `task-config.tsx`):
- `projectStatusConfig` — icon, label, color, bg per status (planning, active, paused, completed, archived)
- `PROJECT_COLORS` — 12 visually distinct hex colors for timeline bars
- `getProjectColor(project, index)` — returns project.color or auto-assigns from palette

---

### P5: Projects Page (`/projects`)
**Priority:** P1
**Depends on:** P3, P4

**New route** at `/projects` with responsive card grid.

**Page layout:**
- Header: "Projects" h1, count badge, "New Project" button
- Status tabs: All | Active | Planning | Paused | Completed (with count badges)
- Search bar + topic filter dropdown
- Card grid: 1 col mobile, 2 col md, 3 col lg

**ProjectCard** (`daily-flow/src/components/projects/ProjectCard.tsx`):
- Left accent bar (4px, project color), name, description snippet (2 lines), status badge, topic badge, date range ("Jan 15 – Mar 30"), task count ("3/8 done"), progress bar
- Click navigates to `/projects/:projectId`

**CreateProjectDialog** (`daily-flow/src/components/projects/CreateProjectDialog.tsx`):
- Dialog form: name (required), description, topic (single-select), status, color picker (swatches), start date, end date
- Auto-assigns color if user doesn't pick one

**Files:** New: `ProjectsPage.tsx`, `ProjectCard.tsx`, `CreateProjectDialog.tsx`. Modify: `App.tsx` (routes), `Sidebar.tsx` (nav item)

---

### P6: Project Detail View (`/projects/:projectId`)
**Priority:** P1
**Depends on:** P5, P3

**Page at** `/projects/:projectId` showing project info + its tasks.

**Layout:**
- Breadcrumb: Projects > [Name]
- Header: project name (inline-editable), status pill, topic badge, date range, color dot
- Description: inline-editable textarea
- Stats bar: total tasks, open, completed, progress %
- Task list: filtered to `task.projectId === projectId`, sorted. Reuse `KanbanBoard` component for kanban mode.
- Add task button: creates task with `projectId` pre-set
- Settings: edit color, dates, archive, delete (with confirmation)

**Approach:** Simplified task rendering (no bulk actions, no tabs). If Tasks.tsx extraction proves clean, create a shared `TaskListView` component — otherwise accept limited duplication and refactor in Sprint 10.

**Files:** New: `ProjectDetailPage.tsx`. Modify: `App.tsx` (route).

---

### P7: Project Selector in TaskDetailsDrawer
**Priority:** P1
**Depends on:** P3

Add project picker to the task edit drawer.

**UI:** New card section with:
- Label: Layers icon + "Project"
- Current project badge (color dot + name) — click to unassign
- Select dropdown listing all projects (color dot + name + status badge per option)
- "None" option to unassign

**Also:** Show project badge on task rows in Tasks.tsx and KanbanBoard.tsx (color dot + name).

**Files:** Modify: `TaskDetailsDrawer.tsx`, `Tasks.tsx` (project badge on rows), `KanbanBoard.tsx` (project badge on cards)

---

### P8: Timeline View v1 — Project Bars
**Priority:** P1 (signature feature)
**Depends on:** P3, P4, P5

Notion-style horizontal timeline showing project bars on a date axis. Third view mode on Tasks page.

**Components:**
- `TimelineView.tsx` — main container with scroll, date range calculation
- `TimelineHeader.tsx` — month/day labels, today marker
- `TimelineProjectBar.tsx` — colored horizontal bar, positioned by start/end dates

**Core logic:**
- Date axis: visible range = current month ± 2 weeks padding
- Day column width: 32px (month zoom)
- Bar positioning: `left = daysBetween(rangeStart, startDate) * dayWidth`, `width = daysBetween(startDate, endDate) * dayWidth`
- Today line: 2px solid primary color, full height
- Click bar → navigate to `/projects/:id`
- Auto-scroll to center today on mount
- Empty state: "No projects with dates" + create CTA

**Integration:** Add `'timeline'` to ViewMode type in Tasks.tsx. Third toggle button (GanttChart icon). When timeline mode: hide task-specific tabs/filters, show TimelineView with all projects.

**Scope note:** Ship with month zoom only. Quarter zoom deferred to Sprint 10.

**Files:** New: `timeline/TimelineView.tsx`, `timeline/TimelineHeader.tsx`, `timeline/TimelineProjectBar.tsx`. Modify: `Tasks.tsx` (view mode toggle).

---

### P9: Quality Gates
**Priority:** Gate
**Depends on:** P1–P8

1. Deterministic checks: `cd daily-flow && npm run lint && npm run typecheck && npm run test && npm run build`
2. Supabase advisors: `get_advisors` security + performance
3. Agent 7 code review on sprint branch
4. Agent 11 feature integrity — update Feature Bible (new Projects section, verify Tasks/Notes unbroken)
5. Fix all P0 issues from gates
6. Sandbox review: `npm run dev` on sprint branch, user reviews running app
7. Sprint retrospective added to this file
8. Merge to main + tag `post-sprint-9` + deploy to Netlify

---

## Dependencies

```
P1 (Migration) ──→ P2 (Types + Service) ──→ P3 (Store + Actions)
                                              │
                   P4 (Config/Colors) ←───────┤
                                              │
                         ┌────────────────────┼─────────────────┐
                         │                    │                 │
                    P5 (Projects Page)   P7 (Drawer Selector)   P8 (Timeline)
                         │                                      │
                    P6 (Detail Page) ──────────────────────────┘
                         │
                    P9 (Quality Gate) ←── all P1–P8
```

Parallelizable after P3: P5 + P7 can run simultaneously. P8 can start once P4 is done.
P6 depends on P5 (routing) but can start in parallel once route exists.

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Timeline date math bugs (off-by-one, timezone) | Medium | Medium | Use date-fns consistently. Test with edge cases: single-day projects, year-spanning projects, no-date projects. |
| Tasks.tsx complexity (980 lines + new view mode) | Low | Medium | Timeline toggle is simple conditional render. Complexity lives in TimelineView component, not Tasks.tsx. |
| Project detail duplicating task list code | Medium | Low | Ship simplified version first. Extract shared TaskListView in Sprint 10 if needed. |
| RLS policy misconfiguration | Low | High | Run `get_advisors` security check after migration. Established pattern from 14 existing tables. |
| Mobile timeline usability | Medium | Low | Horizontal scroll with "scroll to explore" hint. Timeline is power-user feature; list view is default on mobile. |

---

## Scope Cuts (if needed, in order)

1. **Cut first:** Quarter zoom on timeline — ship month only
2. **Cut second:** Kanban view in project detail — list view only
3. **Cut third:** Project badges on KanbanBoard cards (keep drawer selector + list view badges)
4. **Cut fourth:** TaskListView extraction — accept duplication, refactor Sprint 10

**MUST NOT cut:** Migration (P1), service layer (P2-P3), Projects page (P5), drawer selector (P7), Timeline v1 (P8)

---

## Deferred to Sprint 10+

- Project templates (relative due dates, instantiation, "save as template")
- Swimlane timeline (group by Topic)
- Task-level bars on timeline
- Drag-and-resize on timeline bars
- Project progress/burndown analytics
- Project-scoped Kanban board
- Quarter zoom level on timeline
- Entity graph / connection discovery (Agent 5 research brief pending)
- Full-text search across all content
- AI "Organize My Day" and journal intelligence features
- Calendar page redesign

---

## Definition of Done — Sprint Level

```
Projects Entity:
  [ ] projects table exists with RLS
  [ ] project_id FK on tasks (nullable)
  [ ] Project CRUD works (create, read, update, delete)
  [ ] Projects page shows card grid with status tabs
  [ ] Project detail page shows project info + filtered tasks
  [ ] CreateProjectDialog creates projects with all fields

Task-Project Linking:
  [ ] TaskDetailsDrawer shows project selector
  [ ] Assigning/unassigning a task to a project persists
  [ ] Task rows show project badge (color dot + name)
  [ ] Deleting a project orphans tasks (doesn't delete them)
  [ ] Existing tasks without projects continue working unchanged

Timeline View:
  [ ] Timeline is third view mode on Tasks page (List/Kanban/Timeline toggle)
  [ ] Project bars render at correct positions based on start/end dates
  [ ] Today line visible
  [ ] Clicking a bar navigates to project detail
  [ ] Projects without dates are hidden from timeline
  [ ] Empty state when no dated projects exist

Navigation:
  [ ] "Projects" appears in sidebar nav
  [ ] /projects route works
  [ ] /projects/:id route works with correct project

Quality:
  [ ] npm run lint passes
  [ ] npm run typecheck passes (0 errors)
  [ ] npm run test passes
  [ ] npm run build succeeds
  [ ] Supabase advisors: no new security warnings
  [ ] Agent 7 code review: no unresolved P0s
  [ ] Agent 11 feature integrity: PASS (Tasks, Notes, existing features unbroken)
  [ ] User approves running app in sandbox review
```

---

## Verification Plan

1. **Migration:** Confirm `projects` table and `project_id` column exist via Supabase MCP
2. **CRUD:** Create a project, edit its name/status/dates, delete it — verify each persists
3. **Task linking:** Open TaskDetailsDrawer, assign a task to a project, refresh — verify it persists. Unassign — verify.
4. **Projects page:** Verify card grid renders, status tabs filter correctly, search works, create dialog creates projects
5. **Project detail:** Navigate to `/projects/:id`, verify correct project info and filtered task list
6. **Timeline:** Switch to Timeline view, verify project bars at correct positions, today line, click navigation
7. **Edge cases:** Project with no dates (hidden from timeline, visible in list). Delete project (tasks orphaned, visible in "no project" context). Project spanning year boundary.
8. **Regression:** Tasks page List/Kanban views unchanged. Notes page works. Today page widgets work.
9. **Deterministic checks:** `cd daily-flow && npm run lint && npm run typecheck && npm run test && npm run build`

---

*Sprint 9 Contract — Compiled by the Director*
*February 24, 2026*
