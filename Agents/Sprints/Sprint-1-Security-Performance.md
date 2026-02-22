# Sprint 1 — Security, Performance & Foundation

**Sprint Goal:** Raise audit score from 4.1/10 → 7+/10 by fixing all ship-blocking security issues, eliminating performance bottlenecks, and hardening code quality.

**Start:** February 21, 2026
**Baseline:** Code Audit v0.1 — Grade C+ (4.1/10)
**Target:** Grade B+ (7.5+/10)
**Source Documents:** [Code-Audit-Sprint-0-Review.md](../Engineering/Agent-7-Docs/Code-Audit-Sprint-0-Review.md) | [Research-Brief-Sprint-0-Findings.md](../Research/Agent-5-Docs/Research-Brief-Sprint-0-Findings.md)

---

## Sprint Structure

Three parallel tracks. Track A is the **gate** — no feature work ships until security lands.

```
Track A: Security & Data Integrity ████████████░░░░░░░░  (Week 1, blocking)
Track B: Performance               ░░░░████████████░░░░  (Weeks 1-2, parallel)
Track C: Code Quality & Features   ░░░░░░░░░░░░████████  (Weeks 2-3, after A)
                                   ─────────────────────
                                   W1      W2      W3
```

---

## Track A: Security & Data Integrity

> **Status: BLOCKING** — Nothing ships until all 6 parcels are complete.
> **Goal:** Ensure no user can read, modify, or delete another user's data.

### A1 — Add `user_id` filter to all fetch queries

| | |
|---|---|
| **Audit Ref** | SEC-01 (P0 Critical) |
| **Owner** | Agent 4 (Security & Reliability) |
| **Reviewer** | Agent 7 (Code Reviewer) |
| **Priority** | P0 — Ship Blocker |

**Problem:** All 11 service fetch functions accept `userId` but never include it in the Supabase query. If RLS is misconfigured, every user's data is returned to every other user.

**Fix:** Add `.eq('user_id', userId)` to every fetch function.

**Files:**
- `src/services/tasks.service.ts` — `fetchTasks` (L22-28), `fetchSubtasks` (L31-37)
- `src/services/journal.service.ts` — `fetchJournalEntries` (L17-23)
- `src/services/captures.service.ts` — `fetchCaptures` (L17-23)
- `src/services/meetings.service.ts` — `fetchMeetings` (L18-24)
- `src/services/topics.service.ts` — `fetchTopics` (L29-35), `fetchTopicPages` (L38-44), `fetchTags` (L47-53)
- `src/services/routines.service.ts` — `fetchRoutines` (L23-29), `fetchRoutineGroups` (L32-38), `fetchRoutineCompletions` (L41-46)

**Pattern:**
```typescript
// Add to every fetch function:
.eq('user_id', userId)
```

**Done when:** All 11 fetch functions filter by `user_id`. Verified by reading each service file.

---

### A2 — Add ownership check to all update/delete operations

| | |
|---|---|
| **Audit Ref** | SEC-02 (P0 Critical) |
| **Owner** | Agent 4 (Security & Reliability) |
| **Reviewer** | Agent 7 (Code Reviewer) |
| **Priority** | P0 — Ship Blocker |
| **Depends on** | A1 (same files, apply together) |

**Problem:** All `update` and `delete` functions filter only by `id`, not `user_id`. Any authenticated user who guesses a UUID can modify or delete another user's data.

**Fix:** Add `userId` parameter to all update/delete functions and add `.eq('user_id', userId)` filter.

**Files:**
- `src/services/tasks.service.ts` — `updateTask` (L75), `deleteTask` (L79-81), `updateSubtask` (L102), `deleteSubtask` (L106-108)
- `src/services/journal.service.ts` — `updateJournalEntry` (~L49), `deleteJournalEntry` (~L54)
- `src/services/captures.service.ts` — `updateCapture` (L51), `deleteCapture` (L55-57)
- `src/services/meetings.service.ts` — `updateMeeting` (~L35), `deleteMeeting` (~L40)
- `src/services/routines.service.ts` — All mutators
- `src/hooks/useDatabase.ts` — Update call signatures to pass `userId`
- `src/hooks/useKaivooActions.ts` — Pass `userId` through to all update/delete calls

**Pattern:**
```typescript
// Before
export const updateTask = async (id: string, updates: Partial<Task>) => {
  const { error } = await supabase.from('tasks').update(dbUpdates).eq('id', id);
};

// After
export const updateTask = async (userId: string, id: string, updates: Partial<Task>) => {
  const { error } = await supabase.from('tasks').update(dbUpdates)
    .eq('id', id)
    .eq('user_id', userId);
};
```

**Done when:** Every update/delete operation includes `user_id` ownership filter. `useDatabase.ts` and `useKaivooActions.ts` pass `userId` through the call chain.

---

### A3 — Add optimistic write rollback on failure

| | |
|---|---|
| **Audit Ref** | SEC-03 (P0 Critical) |
| **Owner** | Agent 2 (Staff Software Engineer) |
| **Reviewer** | Agent 7 (Code Reviewer) |
| **Priority** | P0 — Ship Blocker |
| **Depends on** | A2 (updated function signatures) |

**Problem:** The store is mutated before the database call. On failure, the error is silently logged and the UI remains in a diverged state. The user believes their change was saved when it wasn't.

**Fix:** Snapshot the previous state before optimistic update. On database failure, roll back the store mutation and show a user-facing error toast.

**File:** `src/hooks/useKaivooActions.ts`

**Affected operations:** `updateTask`, `deleteTask`, `updateCapture`, `deleteCapture`, `updateJournalEntry`, `deleteJournalEntry`, `updateMeeting`, `deleteMeeting`, `updateRoutine`, `deleteRoutine`, and all other write operations.

**Pattern:**
```typescript
const updateTask = async (id: string, updates: Partial<Task>) => {
  const prev = store.tasks.find(t => t.id === id);
  store.updateTask(id, updates);          // optimistic update
  if (user) {
    try {
      await db.updateTask(user.id, id, updates);
    } catch (e) {
      if (prev) store.updateTask(id, prev);  // rollback
      toast.error('Failed to save changes.');
      console.error('[updateTask]', e);
    }
  }
};
```

**Done when:** Every write operation in `useKaivooActions.ts` has rollback logic and shows a toast on failure. No silent `console.error`-only paths remain.

---

### A4 — Sanitize error messages shown to users

| | |
|---|---|
| **Audit Ref** | SEC-04 (P1 High) |
| **Owner** | Agent 2 (Staff Software Engineer) |
| **Reviewer** | Agent 4 (Security & Reliability) |
| **Priority** | P1 |

**Problem:** Backend errors leak database column names, RLS policy details, or stack traces to users.

**Fix:** Replace raw `error.message` in user-facing UI with generic messages. Keep detailed errors in `console.error` for debugging. Add dev-only detail toggle to ErrorBoundary.

**Files:**
- `src/components/ErrorBoundary.tsx` (L46-49) — Hide `error.message` behind dev-only toggle
- `src/pages/Auth.tsx` (L46-48, L72-74) — Replace `toast.error(error.message)` with generic messages
- `src/components/widgets/AIInboxWidget.tsx` (L200-202) — Keep console.error, add user-facing toast

**Done when:** No raw `error.message` is rendered in any user-facing UI element. ErrorBoundary shows details only in development mode.

---

### A5 — Create database migration with missing indexes

| | |
|---|---|
| **Audit Ref** | DB-01 (P1 High) |
| **Owner** | Agent 3 (System Architect) |
| **Reviewer** | Agent 4 (Security & Reliability) |
| **Priority** | P1 |

**Problem:** Only 1 database index exists across 11 tables. Every primary query pattern does a full table scan.

**Fix:** Create a new Supabase migration file with indexes for all primary query patterns.

**File:** New migration in `supabase/migrations/`

**Migration SQL:**
```sql
CREATE INDEX idx_tasks_user_created ON tasks(user_id, created_at DESC);
CREATE INDEX idx_journal_user_timestamp ON journal_entries(user_id, timestamp DESC);
CREATE INDEX idx_captures_user_date ON captures(user_id, date DESC);
CREATE INDEX idx_meetings_user_start ON meetings(user_id, start_time DESC);
CREATE INDEX idx_topics_user_name ON topics(user_id, name);
CREATE INDEX idx_topic_pages_topic ON topic_pages(topic_id);
CREATE INDEX idx_subtasks_task ON subtasks(task_id);
CREATE INDEX idx_routines_group ON routines(group_id);
CREATE INDEX idx_routine_completions_lookup
  ON routine_completions(user_id, routine_id, date);
```

**Done when:** Migration file exists and has been applied to the Supabase project. All 9 indexes verified via Supabase dashboard.

---

### A6 — Bound routine_completions query

| | |
|---|---|
| **Audit Ref** | DB-02 (P1 High) |
| **Owner** | Agent 4 (Security & Reliability) |
| **Reviewer** | Agent 7 (Code Reviewer) |
| **Priority** | P1 |

**Problem:** `fetchRoutineCompletions` fetches ALL completion records ever. A user with 1 year of daily routines returns 3,650+ rows every page load.

**Fix:** Add 90-day rolling window filter + `user_id` filter + descending sort.

**File:** `src/services/routines.service.ts` (L41-46)

```typescript
export const fetchRoutineCompletions = async (userId: string) => {
  const cutoff = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
  const { data, error } = await supabase
    .from('routine_completions')
    .select('*')
    .eq('user_id', userId)
    .gte('completed_at', cutoff)
    .order('completed_at', { ascending: false });
  if (error) throw error;
  return data || [];
};
```

**Done when:** Query is bounded to 90 days and filtered by `user_id`.

---

## Track B: Performance

> **Status: PARALLEL** — Can start immediately alongside Track A.
> **Goal:** Cut initial bundle by 50%+, eliminate unnecessary re-renders and refetches.

### B1 — Code split all page routes with React.lazy

| | |
|---|---|
| **Audit Ref** | PERF-01 (P0 Critical) |
| **Owner** | Agent 2 (Staff Software Engineer) |
| **Reviewer** | Agent 3 (System Architect) |
| **Priority** | P0 |

**Problem:** All 10 page components are eagerly imported. 1,625 KB monolithic JS bundle.

**Fix:** Replace all static imports with `React.lazy()` and wrap routes in `<Suspense>`.

**File:** `src/App.tsx` (L10-18)

```typescript
import { lazy, Suspense } from 'react';

const Today = lazy(() => import("./pages/Today"));
const Tasks = lazy(() => import("./pages/Tasks"));
const CalendarPage = lazy(() => import("./pages/CalendarPage"));
const Topics = lazy(() => import("./pages/Topics"));
const TopicPage = lazy(() => import("./pages/TopicPage"));
const Insights = lazy(() => import("./pages/Insights"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));
const JournalPage = lazy(() => import("./pages/JournalPage"));
const Auth = lazy(() => import("./pages/Auth"));
const NotFound = lazy(() => import("./pages/NotFound"));
```

**Done when:** All page imports use `React.lazy()`. Routes wrapped in `<Suspense>` with a fallback. Build produces multiple chunks instead of one monolith.

---

### B2 — Add vendor chunk splitting to Vite config

| | |
|---|---|
| **Audit Ref** | PERF-01 (P0 Critical) |
| **Owner** | Agent 3 (System Architect) |
| **Reviewer** | Agent 2 (Staff Software Engineer) |
| **Priority** | P0 |

**Problem:** No `build.rollupOptions.output.manualChunks` in `vite.config.ts`. Recharts (~200KB) and TipTap (~100KB) load for every user even if they never visit Insights or Journal.

**Fix:** Add manual chunks for heavy vendor libraries.

**File:** `vite.config.ts`

```typescript
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        'vendor-recharts': ['recharts'],
        'vendor-tiptap': ['@tiptap/react', '@tiptap/starter-kit',
          '@tiptap/extension-highlight', '@tiptap/extension-color',
          '@tiptap/extension-text-style', '@tiptap/extension-placeholder'],
        'vendor-radix': ['@radix-ui/react-dialog', '@radix-ui/react-popover',
          '@radix-ui/react-dropdown-menu', '@radix-ui/react-alert-dialog'],
      }
    }
  }
}
```

**Target:** 1,625 KB → ~800 KB initial load (50%+ reduction).

**Done when:** `npm run build` produces separate vendor chunks. Initial bundle under 900 KB.

---

### B3 — Replace full reload() with surgical store mutations

| | |
|---|---|
| **Audit Ref** | PERF-03 (P1 High) |
| **Owner** | Agent 2 (Staff Software Engineer) |
| **Reviewer** | Agent 7 (Code Reviewer) |
| **Priority** | P1 |
| **Depends on** | A3 (same file, apply after rollback logic) |

**Problem:** After every `addTask`, `addJournalEntry`, `addCapture`, etc., a full `reload()` fetches all 11 Supabase tables. Creating a single task re-downloads every meeting, routine, capture, and journal entry.

**Fix:** After successful database create, add the returned record directly to the store instead of calling `reload()`.

**File:** `src/hooks/useKaivooActions.ts` (L24)

```typescript
// Before
const addTask = async (taskData) => {
  if (user) {
    const task = await db.createTask(taskData);
    await reload();  // ← 11 parallel queries for 1 task create
    return task;
  }
  return store.addTask(taskData);
};

// After
const addTask = async (taskData) => {
  if (user) {
    const task = await db.createTask(taskData);
    store.addTask(task);  // ← direct store mutation, no reload
    return task;
  }
  return store.addTask(taskData);
};
```

**Done when:** Zero `reload()` calls remain after individual create operations. Only the initial page load and explicit refresh actions trigger a full reload.

---

### B4 — Switch to Zustand selector subscriptions in widgets

| | |
|---|---|
| **Audit Ref** | PERF-02 (P1 High) |
| **Owner** | Agent 2 (Staff Software Engineer) |
| **Reviewer** | Agent 7 (Code Reviewer) |
| **Priority** | P1 |

**Problem:** Every widget destructures the full Zustand store, causing re-renders on any mutation to any slice.

**Files:**
- `src/components/widgets/TodayActivityWidget.tsx` (~L81) — 6 slices + 2 methods
- `src/components/widgets/TasksWidget.tsx` (~L61) — tasks, topics, tags
- `src/components/widgets/DailyBriefWidget.tsx` (~L8) — tasks, meetings, routines, completions
- `src/components/widgets/AIInboxWidget.tsx` (~L131) — topics, topicPages, tags, tasks

```typescript
// Before
const { tasks, meetings, routines, routineCompletions } = useKaivooStore();

// After
const tasks = useKaivooStore(s => s.tasks);
const meetings = useKaivooStore(s => s.meetings);
```

**Done when:** No widget component destructures the full store. Every `useKaivooStore()` call uses a selector function.

---

### B5 — Fix unstable useMemo dependencies

| | |
|---|---|
| **Audit Ref** | PERF-05 (P1 High) |
| **Owner** | Agent 2 (Staff Software Engineer) |
| **Reviewer** | Agent 7 (Code Reviewer) |
| **Priority** | P1 |

**Problem:** `new Date()` creates a new object every render, causing `useMemo` to always recompute.

**File:** `src/components/widgets/DailyBriefWidget.tsx` (L10, L51-63, L66-84)

```typescript
// Before
const today = new Date();
const taskStats = useMemo(() => { ... }, [tasks, today]);

// After
const todayStr = useMemo(() => format(new Date(), 'yyyy-MM-dd'), []);
const taskStats = useMemo(() => { ... }, [tasks, todayStr]);
```

**Done when:** No `new Date()` appears in any `useMemo` dependency array. All date dependencies use stable string representations.

---

## Track C: Code Quality & Small Features

> **Status: GATED** — Starts after Track A is complete.
> **Goal:** Eliminate tech debt, add mood tracking data layer.

### C1 — Extract shared utility modules

| | |
|---|---|
| **Audit Ref** | CODE-02, CODE-03 (P2 Medium) |
| **Owner** | Agent 2 (Staff Software Engineer) |
| **Reviewer** | Agent 7 (Code Reviewer) |
| **Priority** | P2 |

**Problem:** `statusConfig` and `priorityConfig` are copy-pasted across 3 files. `getTodayString()` is duplicated in 7+ places.

**Fix:**
1. Create `src/lib/task-config.ts` — export shared `statusConfig` and `priorityConfig`
2. Create or update `src/lib/dateUtils.ts` — export shared `getTodayString()`
3. Update all consumers to import from shared modules

**Consumers to update:**
- `src/pages/Tasks.tsx` (L55-67)
- `src/components/TaskDetailsDrawer.tsx` (L43-55)
- `src/components/widgets/TasksWidget.tsx` (L46-52)
- `src/stores/useKaivooStore.ts`
- `src/stores/useRoutineStore.ts`
- 7+ components with inline `format(new Date(), 'yyyy-MM-dd')`

**Done when:** `statusConfig`, `priorityConfig`, and `getTodayString()` each have exactly one definition. All consumers import from the shared module.

---

### C2 — Add mood selector to journal save flow

| | |
|---|---|
| **Research Ref** | Finding 9 — Mood Selector (P0 Small Effort) |
| **Owner** | Agent 1 (Senior UI Designer) + Agent 2 (Staff Software Engineer) |
| **Reviewer** | Agent 6 (Usability Architect) |
| **Priority** | P0 (data value) |

**Problem:** Without mood data, the correlation engine (Phase 6) can only compare activity metrics. Mood data unlocks the question users actually care about: "What makes me feel good?"

**Fix:** Add a one-tap mood selector (5 states) that appears at journal entry save time.

**UI Spec:**
```
How are you feeling?
😊  🙂  😐  😔  😞
Great Good Okay Low  Rough

[Skip]
```

**Rules:**
- Appears once per save, not on every keystroke
- "Skip" always available — never mandatory
- Stores as `mood_score` (1-5) on journal entry
- Subtle, non-intrusive — aligns with Kaivoo Design System v2.0

**Files:**
- `src/pages/JournalPage.tsx` — Add mood selector UI to save flow
- `src/services/journal.service.ts` — Add `mood_score` to create/update
- `src/types/index.ts` — Add `mood_score?: number` to `JournalEntry` type
- `supabase/migrations/` — New migration adding `mood_score` column to `journal_entries` table
- `src/integrations/supabase/types.ts` — Regenerate after migration

**Done when:** Users can optionally select a mood when saving a journal entry. Mood is stored in the database. Skip option works. No visual disruption to existing journal flow.

---

### C3 — Type the service layer (remove `any` types)

| | |
|---|---|
| **Audit Ref** | CODE-01 (P2 Medium) |
| **Owner** | Agent 2 (Staff Software Engineer) |
| **Reviewer** | Agent 7 (Code Reviewer) |
| **Priority** | P2 |

**Problem:** 17 instances of `any` across 6 service files and 2 hooks. Type safety is undermined.

**Fix:** Import `Tables` type from Supabase generated types and apply to all `dbTo*` converters and `dbUpdates` objects.

```typescript
import { Tables } from '@/integrations/supabase/types';
export const dbToTask = (row: Tables<'tasks'>, subtasks: Subtask[] = []): Task => ...
```

**Files (17 instances):**
- `src/services/tasks.service.ts` (L5, L63, L96)
- `src/services/captures.service.ts` (L5, L46)
- `src/services/journal.service.ts` (2 instances)
- `src/services/meetings.service.ts` (1 instance)
- `src/services/routines.service.ts` (2 instances)
- `src/services/topics.service.ts` (3 instances)
- `src/hooks/useDatabase.ts` (L51, L64, L76)
- `src/hooks/useKaivooActions.ts` (L206, L228)

**Done when:** Zero `any` types remain in the service layer. `npm run typecheck` passes with no errors.

---

### C4 — Add aria-labels to icon-only buttons

| | |
|---|---|
| **Audit Ref** | A11Y-01 (P2 Medium) |
| **Owner** | Agent 6 (Usability Architect) |
| **Reviewer** | Agent 1 (Senior UI Designer) |
| **Priority** | P2 |

**Problem:** Icon-only buttons across the app are missing `aria-label`, making them invisible to screen reader users.

**Pattern found in:** Insights, Tasks, CalendarPage, and all widgets with `<Button variant="ghost" size="icon">`.

```typescript
// Before
<Button variant="ghost" size="icon" onClick={...}>
  <ChevronLeft className="h-4 w-4" />
</Button>

// After
<Button variant="ghost" size="icon" aria-label="Previous week" onClick={...}>
  <ChevronLeft className="h-4 w-4" />
</Button>
```

**Done when:** Every `<Button size="icon">` in the app has an appropriate `aria-label`. Verified by searching for `size="icon"` and confirming each has a label.

---

### C5 — Fix useEffect cleanup gaps

| | |
|---|---|
| **Audit Ref** | CODE-05 (P2 Medium) |
| **Owner** | Agent 2 (Staff Software Engineer) |
| **Reviewer** | Agent 7 (Code Reviewer) |
| **Priority** | P2 |

**Problem:** Custom hooks have async operations without cleanup, leading to potential state updates on unmounted components.

**Files:**
- `src/hooks/useWidgetSettings.ts` — Debounced `setTimeout` queues stale saves → add cleanup to clear timeout
- `src/hooks/useAIActionLog.ts` — `fetchLogs` in `useEffect` with no abort controller → add `AbortController`
- `src/hooks/useAISettings.ts` — Async fetch with no cleanup on unmount → add abort/cancelled flag

**Done when:** All three hooks properly clean up async operations on unmount. No "state update on unmounted component" warnings possible.

---

## Dependency Graph

```
TRACK A (Security — BLOCKING)
──────────────────────────────
A1 (fetch user_id filters) ──┐
                              ├──→ A3 (rollback logic) ──→ GATE ──→ Track C
A2 (update/delete filters) ──┘
A4 (error sanitization) ─────────→ independent
A5 (DB indexes) ─────────────────→ independent
A6 (bound queries) ──────────────→ independent (apply with A1)

TRACK B (Performance — PARALLEL)
────────────────────────────────
B1 (React.lazy) ─────────────────→ independent
B2 (vendor chunks) ──────────────→ independent (pair with B1)
B3 (remove reload) ──────────────→ depends on A3 (same file)
B4 (Zustand selectors) ──────────→ independent
B5 (useMemo deps) ───────────────→ independent

TRACK C (Quality — AFTER TRACK A)
──────────────────────────────────
C1 (shared utils) ───────────────→ independent
C2 (mood selector) ──────────────→ independent
C3 (type service layer) ─────────→ after A1/A2 (same files)
C4 (aria-labels) ────────────────→ independent
C5 (hook cleanup) ───────────────→ independent
```

**High-contention files** (touched by multiple parcels — coordinate sequencing):
- `src/hooks/useKaivooActions.ts` — A2, A3, B3
- `src/services/*.service.ts` — A1, A2, A6, C3
- `src/hooks/useDatabase.ts` — A2, C3

---

## Agent Assignment Summary

| Agent | Role | Parcels | Focus |
|-------|------|---------|-------|
| **Agent 1** | Senior UI Designer | C2 | Mood selector UI design aligned with Design System v2.0 |
| **Agent 2** | Staff Software Engineer | A3, A4, B1, B3, B4, B5, C1, C3, C5 | Primary implementation across all tracks |
| **Agent 3** | System Architect | A5, B2 | Database indexing strategy + build optimization |
| **Agent 4** | Security & Reliability | A1, A2, A6 | All user_id filtering + query bounding |
| **Agent 5** | Research Analyst | — | Sprint 2 pre-research (Unified Day View, Calendar Sync patterns) |
| **Agent 6** | Usability Architect | C4 | Accessibility audit + aria-label implementation |
| **Agent 7** | Code Reviewer | All reviews | Gate every parcel before merge. Re-audit at sprint end. |

---

## Deferred to Sprint 2

These items are explicitly **not in scope** for Sprint 1:

| Item | Reason |
|------|--------|
| **Unified Day View** (Research P0) | Needs security foundation. Largest feature — deserves dedicated sprint focus. |
| **Daily Shutdown Flow** (Research Sprint 2) | Depends on Unified Day View. |
| **Date Chip Drilling** (Research P1) | Nice-to-have. Needs cross-component coordination. |
| **Monthly Insights Heatmap** (Research P1) | Medium effort, better paired with mood data from C2 after it has time to accumulate. |
| **TasksWidget Decomposition** (PERF-04) | 1,069-line file → 4-5 files. Large refactor, needs dedicated focus. |
| **React Query Decision** (CODE-04) | Adopt or remove. Architectural decision that affects the whole data layer. |
| **og:image / SEO** (SEO-01) | Low urgency. Needs design asset creation. |
| **Password Minimum** (SEC-05) | Supabase Auth config change. Low effort but low priority. |
| **CSP Headers** (SEC-06) | Infrastructure concern, not a code change. |
| **AIInboxWidget Decomposition** (CODE-08) | 972-line file. Same rationale as TasksWidget — dedicated sprint. |

---

## Definition of Done

### Per-Parcel Criteria
- [ ] Code changes implemented and reviewed by assigned reviewer
- [ ] `npm run build` passes (0 errors)
- [ ] `npm run typecheck` passes (0 errors)
- [ ] `npm test` passes (all tests green)
- [ ] Agent 7 approves the changes

### Sprint Exit Criteria
- [ ] All Track A parcels (A1-A6) complete — zero user_id filter gaps
- [ ] All Track B parcels (B1-B5) complete — bundle under 900 KB
- [ ] All Track C parcels (C1-C5) complete — zero `any` types in services
- [ ] Agent 7 produces Sprint 1 Audit Report with updated scorecard
- [ ] Target: Overall score 7.5+/10 (up from 4.1/10)

---

## Verification Plan

### During Sprint
1. After each parcel: `npm run build && npm run typecheck && npm test`
2. After Track A: Manually verify no fetch/update/delete query is missing `user_id`
3. After Track B: Run `npm run build` and check output chunk sizes
4. After C2: Test mood selector save flow end-to-end (save with mood, save without, skip)

### End of Sprint
1. Agent 7 runs full code audit using same methodology as Sprint 0 review
2. Compare scorecard dimensions: Security, Performance, Code Quality, Bundle Size, Database, Caching, Accessibility, Error Handling
3. Verify all P0 issues from original audit are resolved
4. Document remaining items and new findings for Sprint 2 planning

---

---

## Sprint Retrospective

**Completed:** February 21, 2026
**Parcels Completed:** 16/16 (A1-A6, B1-B5, C1-C5)
**Status:** COMPLETED

### What Was Delivered
- **Track A (Security):** user_id filters on all 11 queries, ownership checks on all update/delete ops, optimistic rollback with toast errors, sanitized error messages, 9 database indexes, 90-day bounded routine_completions
- **Track B (Performance):** React.lazy code splitting for all 10 pages, vendor chunks (recharts 148KB, tiptap 421KB, radix 71KB), surgical Zustand setState replacing reload(), selector subscriptions in 3 widgets, stable useMemo deps
- **Track C (Quality):** shared task-config.tsx with 3 consumers updated, mood selector (1-5 scale) in journal, all `any` types replaced with `Tables<>` across 7 files, 15 aria-labels on icon buttons, useEffect cleanup in 3 hooks

### Verification
- `tsc --noEmit` — 0 errors
- `vite build` — passes in 2.5s
- `vitest run` — 1/1 tests passing

### Deferred to Sprint 2
See "Deferred to Sprint 2" section above (10 items including Unified Day View, TasksWidget decomposition, React Query decision, CSP headers).

### Key Learnings
- Zustand `store.addTask()` regenerates IDs via `generateId()` — surgical inserts must use `useKaivooStore.setState()` directly to preserve DB UUIDs
- Background agents (B4, C3, C4) ran effectively in parallel while main thread handled sequential work

---

*Sprint 1 v1.0 — February 21, 2026*
*Compiled from Code Audit v0.1 (Agent 7) and Research Brief v1.1 (Agent 5 + Agent 6)*
