# Sprint 6: Feature Depth — Sprint Contract

**Status:** AWAITING APPROVAL
**Theme:** Feature Depth — Tasks page power features + simple task recurrence
**Branch:** `sprint/6-feature-depth`
**Director:** Active
**Date:** February 23, 2026
**Vision Position:** Phase 1 — Cloud Command Center (~92% complete)

---

## Context

Phase 1 is further along than Vision.md reflects — Design System migration, code splitting, and the Today page Tasks widget restore are all DONE (verified by codebase audit). The biggest remaining user-facing gaps are on the **Tasks page** (missing topic/tag filtering and bulk actions per Agent 11's Bible) and **task recurrence** (Vision Phase 1 milestone, deferred since Sprint 2). Journal improvements deferred to Sprint 7 per user decision.

This sprint transforms the Tasks page from "feature-complete" to "power-user ready" by adding the filtering, bulk operations, and recurrence that Agent 11 identified as critical gaps.

---

## User Decisions (Confirmed)

- **Theme:** Feature Depth
- **Recurrence complexity:** Simple (Daily / Weekly / Monthly)
- **Journal:** Deferred to Sprint 7
- **Tasks page:** Topic/tag filtering AND bulk actions both wanted

---

## Agent Assignments

| Agent | Role | Parcels |
|---|---|---|
| **Agent 2** (Staff Software Engineer) | Implementation | P1–P5 |
| **Agent 10** (QA Architect) | Test Implementation | P6 |
| **Agent 11** (Feature Integrity Guardian) | Gate | P7 |
| **Agent 7** (Code Reviewer) | Gate | P8 |

**Not needed:** Agent 1/6 (no new pages or major UX redesign — filtering and bulk actions follow existing patterns), Agent 3 (no architecture changes), Agent 4 (no security scope), Agent 5 (no research), Agent 8 (no business model impact), Agent 9 (no DevOps changes)

---

## Parcels

### Track 1: Tasks Page — Filtering & Counts

#### P1: Topic & Tag Filtering in Advanced Filters Drawer
**Owner:** Agent 2
**Priority:** P0

Add topic and tag filter dropdowns to the existing Filters Sheet in `Tasks.tsx`.

**Changes:**
- Add `topicFilter: string | 'all'` state (persisted to localStorage with other view prefs)
- Add `tagFilter: string | 'all'` state (persisted to localStorage)
- Add Topic `<Select>` to Filters Sheet — populated from `topics` + `topicPages` in store
- Add Tag `<Select>` to Filters Sheet — populated from all unique tags across tasks
- Apply topic/tag filters in the `filteredTasks` useMemo chain (after tab filter, alongside status/priority filters)
- Add quick-filter chips for active topic/tag in the filter bar (showing `[[TopicName]]` or `#tag` as dismissable chips)
- Clicking a topic badge on a task row activates that topic as filter (same UX as Today Tasks widget)
- Clicking a tag badge on a task row activates that tag as filter
- "Clear all filters" button clears topic/tag filters too

**Files:**
- `daily-flow/src/pages/Tasks.tsx` — add filter state, filter logic, chip rendering, badge click handlers
- localStorage key `kaivoo-tasks-view-preferences` — add topicFilter, tagFilter fields

**Definition of Done:**
- Topic dropdown shows all topics, selecting one filters task list
- Tag dropdown shows all tags, selecting one filters task list
- Combined filtering works (tab + topic + tag + status + priority + search)
- Badge clicks activate filters
- Filters persist across page reloads
- Clear button resets all

---

#### P2: Tab Counts Respect Active Filters
**Owner:** Agent 2
**Priority:** P1

Currently tab counts (Open: 8, Today: 3, etc.) always show totals regardless of active search/filters.

**Changes:**
- Move tab count computation to after all non-tab filters are applied (search, topic, tag, status, priority)
- Counts should reflect: "of the tasks matching your current filters, how many are in each tab?"
- Memoize the count computation (currently computed inline every render)

**Files:**
- `daily-flow/src/pages/Tasks.tsx` — restructure `filteredTasks` useMemo to separate pre-tab filtering from tab-specific filtering

**Definition of Done:**
- Search "pricing" → tab counts only count tasks matching "pricing"
- Active topic filter → tab counts only count tasks in that topic
- Clearing filters restores full counts

---

### Track 2: Tasks Page — Bulk Actions

#### P3: Multi-Select Mode + Bulk Action Bar
**Owner:** Agent 2
**Priority:** P1

**Changes:**
- Add `selectionMode: boolean` toggle button in Tasks page header (next to view mode toggle)
- Add `selectedTaskIds: Set<string>` local state
- When `selectionMode = true`:
  - Show a `Checkbox` on each task row (left of the quick-complete circle)
  - Header shows selected count: "3 selected"
  - "Select All" / "Deselect All" buttons
- Sticky action bar at bottom when selections exist:
  - **[Set Status ▾]** — dropdown: Backlog, Todo, Doing, Blocked, Done
  - **[Set Priority ▾]** — dropdown: Low, Medium, High
  - **[Set Due Date ▾]** — date picker with "Tomorrow", "Next Week", "Clear" shortcuts
  - **[Delete]** — with confirmation dialog (AlertDialog)
- All bulk operations call `updateTask` / `deleteTask` in a loop via `useKaivooActions`
- Exit selection mode when all selections cleared or toggle pressed again
- Selection mode works in List view only (Kanban is drag-focused, skip for now)

**Files:**
- `daily-flow/src/pages/Tasks.tsx` — selection state, toggle, action bar
- New: `daily-flow/src/components/tasks/BulkActionBar.tsx` — sticky bottom bar component

**Definition of Done:**
- Can enter/exit selection mode
- Can select individual tasks via checkboxes
- Select All / Deselect All work
- Bulk status change works
- Bulk priority change works
- Bulk due date change works
- Bulk delete with confirmation works
- Action bar shows selected count
- Exiting selection mode clears selections

---

### Track 3: Task Recurrence

#### P4: Recurrence Data Model + Service Layer
**Owner:** Agent 2
**Priority:** P1

**Changes:**
- Define `RecurrenceRule` type in `src/types/index.ts`:
  ```ts
  interface RecurrenceRule {
    type: 'daily' | 'weekly' | 'monthly';
    interval: number; // every N days/weeks/months (default 1)
  }
  ```
- Add `recurrence?: RecurrenceRule` to `Task` interface
- Supabase migration: `ALTER TABLE tasks ADD COLUMN recurrence_rule jsonb DEFAULT NULL`
- Regenerate Supabase types (or manually add to `types.ts`)
- Update `dbToTask()` in `tasks.service.ts` to hydrate `recurrence` from `recurrence_rule`
- Update `updateTask()` service to persist `recurrence_rule` as JSONB
- Update `createTask()` service to accept and persist `recurrence_rule`
- Update store actions in `useKaivooActions` to pass recurrence through

**Files:**
- `daily-flow/src/types/index.ts` — RecurrenceRule type + Task interface
- `daily-flow/src/services/tasks.service.ts` — dbToTask, createTask, updateTask
- `daily-flow/src/integrations/supabase/types.ts` — add recurrence_rule column type
- `daily-flow/src/hooks/useKaivooActions.ts` — pass recurrence through create/update

**Definition of Done:**
- RecurrenceRule type exists
- Tasks can be created with recurrence
- Tasks can be updated with recurrence
- Recurrence persists to Supabase and loads back correctly
- Existing tasks without recurrence are unaffected (null/undefined)

---

#### P5: Recurrence UI + Auto-Generation Logic
**Owner:** Agent 2
**Priority:** P1

**Changes:**
- **TaskDetailsDrawer:** Add "Recurrence" card section between Dates and Description
  - `<Select>` with options: None, Daily, Weekly, Monthly
  - Selecting a type sets `recurrence: { type, interval: 1 }`
  - Show recurrence icon (🔄) + label on the task row in Tasks page and Today widget
  - Recurrence badge visible: "🔄 Daily", "🔄 Weekly", "🔄 Monthly"
- **Auto-generation logic:** When a recurring task is marked `done`:
  1. Create a new task with the same title, description, tags, topicIds, priority, and recurrence rule
  2. Set `dueDate` to next occurrence:
     - Daily: tomorrow
     - Weekly: same day next week
     - Monthly: same date next month
  3. New task status = `todo`
  4. Original completed task keeps its `completedAt` and `status = done` — it becomes the historical record
  5. Toast: "Next occurrence created for [date]"
- Show recurrence indicator on task rows in both Tasks page and Today TasksWidget

**Files:**
- `daily-flow/src/components/TaskDetailsDrawer.tsx` — recurrence UI section
- `daily-flow/src/hooks/useKaivooActions.ts` — auto-generate next occurrence on completion
- `daily-flow/src/pages/Tasks.tsx` — recurrence badge on task rows
- `daily-flow/src/components/widgets/tasks/SortableTaskRow.tsx` — recurrence badge on Today widget rows

**Definition of Done:**
- Can set recurrence (Daily/Weekly/Monthly) in task detail drawer
- Recurrence badge visible on task rows
- Completing a recurring task auto-creates next occurrence
- Next occurrence has correct due date
- Toast confirms next occurrence
- Removing recurrence (set to None) stops auto-generation
- Today widget shows recurrence badges

---

### Track 4: Test Expansion

#### P6: Tests for New Features
**Owner:** Agent 10
**Priority:** P1

**Changes:**
- **Recurrence tests:**
  - Unit tests for next-occurrence date calculation (daily/weekly/monthly edge cases)
  - Store integration test: completing a recurring task creates a new one
- **Filter tests:**
  - Unit tests for topic/tag filter logic
  - Tab count computation with active filters
- **Bulk action tests:**
  - Store integration test: batch update status/priority on multiple tasks
  - Batch delete

**Target:** Maintain 80%+ coverage on `src/lib/`, push toward 30% overall

**Definition of Done:**
- All new business logic has unit tests
- Edge cases covered (month-end recurrence, empty filter states, empty selections)
- `npm run test` passes
- No coverage regression

---

### Track 5: Quality Gates

#### P7: Agent 11 Feature Integrity Check
**Owner:** Agent 11
**Priority:** Gate

Run full Tasks Page Bible checklist + Today Page Bible checklist. Verify:
- All existing Tasks page features intact after filtering + bulk actions + recurrence additions
- Today widget recurrence badges work correctly
- No regressions in task completion, subtasks, Kanban, detail drawer

---

#### P8: Agent 7 Code Audit
**Owner:** Agent 7
**Priority:** Gate

Full code audit of Sprint 6 changes. Focus: filter implementation correctness, bulk action safety (no accidental mass deletes without confirmation), recurrence edge cases, type safety, test coverage.

---

## Dependencies

```
Track 1 (Filtering):
  P1 (Topic/tag filters) ──→ P2 (Filtered tab counts)

Track 2 (Bulk Actions):
  P3 (no dependencies — can parallel with Track 1)

Track 3 (Recurrence):
  P4 (Data model) ──→ P5 (UI + auto-generation)

Track 4 (Tests):
  P1, P3, P4, P5 ──→ P6 (Tests for all new features)

Track 5 (Gates):
  P1–P6 ──→ P7 (Agent 11) + P8 (Agent 7)
```

**Parallelization:** Tracks 1, 2, and 3 are independent and can be built in parallel or any order. Track 4 follows after features are complete. Track 5 gates everything.

---

## Definition of Done — Sprint Level

```
Features:
  □ Topic/tag filtering works in Tasks page advanced filters
  □ Quick filter chips show active topic/tag
  □ Badge clicks activate filters
  □ Tab counts respect all active filters
  □ Bulk selection mode with checkboxes
  □ Bulk actions: status, priority, due date, delete
  □ Recurrence (Daily/Weekly/Monthly) settable in task detail drawer
  □ Completing recurring task auto-creates next occurrence
  □ Recurrence badges visible on task rows (Tasks page + Today widget)

Quality:
  □ All new logic has unit/integration tests
  □ npm run test passes
  □ npm run lint passes
  □ npm run typecheck passes (0 errors)
  □ npm run build succeeds

Gates:
  □ Agent 11 Tasks Page + Today Page Bible checklists pass
  □ Agent 7 code audit passes (no P0s)
  □ User reviews running app and approves UX
  □ Sprint branch merged to main
  □ Main tagged as post-sprint-6
  □ Deploy to Netlify
  □ Sprint retrospective added
  □ Vision.md updated (mark Design System + code splitting DONE, Phase 1 → ~95%)
```

---

## Deferred to Sprint 7+

- Journal: Continuous writing mode, inline tags, search, keyboard shortcuts
- Tasks Page: Kanban improvements (empty column drops, search in Kanban)
- Tasks Page: "Ongoing" task label
- Task templates, archive vs delete
- Full-text search across all content
- Analytics & Insights rebuild
- Notifications & reminders
- PWA support
- Agent 7 P3 debt (CODE-06/07/08)
- SEC-06 (CSP headers)

---

## Housekeeping (During Sprint)

- Update `Vision.md`: Mark "Design System migration" as DONE, mark "CI/CD pipeline" as DONE (Sprint 5)
- Update `Feature-Bible-Tasks-Page.md`: Record user answers to Q2 (bulk actions = yes), Q3 (recurrence = simple)
- Update `Feature-Bible-Index.md` after sprint

---

*Sprint 6 Contract — Compiled by the Director*
*February 23, 2026*
