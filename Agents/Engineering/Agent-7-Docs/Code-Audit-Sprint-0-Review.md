# Code Review — Kaivoo Command Center v0.1 (Post-Sprint 0)

**Reviewer:** Agent 7 — Code Reviewer
**Date:** 2026-02-21
**Bundle:** 1,625 KB JS (482 KB gzipped) / 84 KB CSS (14.7 KB gzipped)
**Build:** PASS (0 type errors, 0 lint errors, 1/1 tests passing)

---

## P0 — CRITICAL (Ship Blockers)

### SEC-01: Every fetch query is missing `user_id` filter

All 11 service fetch functions accept `userId` as a parameter but never include it in the Supabase query. If RLS is misconfigured or disabled for debugging, **every user's data is returned to every other user**.

**Affected files:** All files in `src/services/`

| Service File | Function | Line |
|---|---|---|
| `tasks.service.ts` | `fetchTasks` | 22–28 |
| `tasks.service.ts` | `fetchSubtasks` | 31–37 |
| `journal.service.ts` | `fetchJournalEntries` | 17–23 |
| `captures.service.ts` | `fetchCaptures` | 17–23 |
| `meetings.service.ts` | `fetchMeetings` | 18–24 |
| `topics.service.ts` | `fetchTopics` | 29–35 |
| `topics.service.ts` | `fetchTopicPages` | 38–44 |
| `topics.service.ts` | `fetchTags` | 47–53 |
| `routines.service.ts` | `fetchRoutines` | 23–29 |
| `routines.service.ts` | `fetchRoutineGroups` | 32–38 |
| `routines.service.ts` | `fetchRoutineCompletions` | 41–46 |

**Example — `captures.service.ts:17–23`:**

```typescript
// BEFORE
export const fetchCaptures = async (userId: string) => {
  const { data, error } = await supabase
    .from('captures')
    .select('*')
    .order('created_at');    // ← userId is accepted but ignored
  if (error) throw error;
  return data || [];
};

// AFTER
export const fetchCaptures = async (userId: string) => {
  const { data, error } = await supabase
    .from('captures')
    .select('*')
    .eq('user_id', userId)   // ← defense in depth
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
};
```

---

### SEC-02: Update/delete operations have no ownership check

All `update` and `delete` service functions filter only by `id`, not by `user_id`. Any authenticated user who guesses a UUID can modify or delete any other user's data.

**Affected files:**

| Service File | Function | Line |
|---|---|---|
| `tasks.service.ts` | `updateTask` | 75 |
| `tasks.service.ts` | `deleteTask` | 79–81 |
| `tasks.service.ts` | `updateSubtask` | 102 |
| `tasks.service.ts` | `deleteSubtask` | 106–108 |
| `journal.service.ts` | `updateJournalEntry` | ~49 |
| `journal.service.ts` | `deleteJournalEntry` | ~54 |
| `captures.service.ts` | `updateCapture` | 51 |
| `captures.service.ts` | `deleteCapture` | 55–57 |
| `meetings.service.ts` | `updateMeeting` | ~35 |
| `meetings.service.ts` | `deleteMeeting` | ~40 |
| `routines.service.ts` | All mutators | Various |

**Example — `tasks.service.ts:62,79`:**

```typescript
// BEFORE
export const updateTask = async (id: string, updates: Partial<Task>) => {
  const { error } = await supabase.from('tasks').update(dbUpdates).eq('id', id);
};

export const deleteTask = async (id: string) => {
  const { error } = await supabase.from('tasks').delete().eq('id', id);
};

// AFTER — add userId parameter and ownership filter
export const updateTask = async (userId: string, id: string, updates: Partial<Task>) => {
  const { error } = await supabase.from('tasks').update(dbUpdates)
    .eq('id', id)
    .eq('user_id', userId);
};

export const deleteTask = async (userId: string, id: string) => {
  const { error } = await supabase.from('tasks').delete()
    .eq('id', id)
    .eq('user_id', userId);
};
```

**Note:** This requires updating `useDatabase.ts` / `useDatabaseOperations` to pass `userId` through to update/delete calls.

---

### SEC-03: Optimistic writes with no rollback

`useKaivooActions.ts:30–38` — The store is mutated *before* the database call. On failure, the error is silently logged and the UI remains in a diverged state. The user believes their change was saved when it wasn't.

This pattern repeats for: `updateTask`, `deleteTask`, `updateCapture`, `deleteCapture`, `updateJournalEntry`, `deleteJournalEntry`, `updateMeeting`, `deleteMeeting`, `updateRoutine`, `deleteRoutine`, and all other write operations.

**File:** `src/hooks/useKaivooActions.ts:30–38`

```typescript
// BEFORE
const updateTask = async (id: string, updates: Partial<Task>) => {
  store.updateTask(id, updates);          // ← permanent local mutation
  if (user) {
    try { await db.updateTask(id, updates); }
    catch (e) { console.error(e); }       // ← silent divergence
  }
};

// AFTER
const updateTask = async (id: string, updates: Partial<Task>) => {
  const prev = store.tasks.find(t => t.id === id);
  store.updateTask(id, updates);          // optimistic update
  if (user) {
    try {
      await db.updateTask(id, updates);
    } catch (e) {
      if (prev) store.updateTask(id, prev);  // ← rollback
      toast.error('Failed to save changes.');
      console.error('[updateTask]', e);
    }
  }
};
```

---

### PERF-01: 1,625 KB monolithic bundle — zero code splitting

`App.tsx:10–18` eagerly imports all 10 page components. `vite.config.ts` has no `build.rollupOptions.output.manualChunks`. Recharts (~200 KB) loads for every user even though only Insights uses it. TipTap (~100 KB) loads even if the user never opens Journal.

**File:** `src/App.tsx:10–18`

```typescript
// BEFORE — all pages eagerly loaded
import Today from "./pages/Today";
import Tasks from "./pages/Tasks";
import CalendarPage from "./pages/CalendarPage";
import Topics from "./pages/Topics";
import TopicPage from "./pages/TopicPage";
import Insights from "./pages/Insights";
import SettingsPage from "./pages/SettingsPage";
import JournalPage from "./pages/JournalPage";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

// AFTER — lazy load all pages
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

// Wrap routes in <Suspense>
```

**File:** `vite.config.ts` — add chunk splitting:

```typescript
// ADD to vite.config.ts
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

**Estimated savings:** 1,625 KB → ~800 KB initial load (50%+ reduction).

---

## P1 — HIGH (Fix This Sprint)

### PERF-02: Entire-store subscriptions in hot components

Every widget destructures the full Zustand store, causing re-renders on *any* mutation to *any* slice.

| File | Line | Slices subscribed |
|---|---|---|
| `widgets/TodayActivityWidget.tsx` | ~81 | 6 slices + 2 methods |
| `widgets/TasksWidget.tsx` | ~61 | tasks, topics, tags |
| `widgets/DailyBriefWidget.tsx` | ~8 | tasks, meetings, routines, completions |
| `widgets/AIInboxWidget.tsx` | ~131 | topics, topicPages, tags, tasks |

```typescript
// BEFORE — any store mutation re-renders all widgets
const { tasks, meetings, routines, routineCompletions } = useKaivooStore();

// AFTER — subscribe only to needed slices
const tasks = useKaivooStore(s => s.tasks);
const meetings = useKaivooStore(s => s.meetings);
```

---

### PERF-03: Full `reload()` after every single create

**File:** `src/hooks/useKaivooActions.ts:24`

After every `addTask`, `addJournalEntry`, `addCapture`, etc., a full `reload()` fetches all 11 Supabase tables. Creating a single task causes the app to re-download every meeting, routine, capture, and journal entry.

```typescript
// BEFORE
const addTask = async (taskData) => {
  if (user) {
    const task = await db.createTask(taskData);
    await reload();  // ← 11 parallel queries for 1 task create
    return task;
  }
  return store.addTask(taskData);
};

// AFTER — surgical store update
const addTask = async (taskData) => {
  if (user) {
    const task = await db.createTask(taskData);
    store.addTask(task);  // ← direct store mutation, no reload
    return task;
  }
  return store.addTask(taskData);
};
```

---

### PERF-04: TasksWidget.tsx is 1,069 lines

**File:** `src/components/widgets/TasksWidget.tsx`

A single file containing drag-and-drop, filtering, section rendering, configuration dialogs, and task row rendering. Impossible to memoize any individual piece.

**Decomposition target:**
- `TasksWidget.tsx` (~200 lines) — orchestrator
- `TaskFilterBar.tsx` (~150 lines) — search + sort + filter UI
- `TaskSection.tsx` (~150 lines) — collapsible section
- `SortableTaskRow.tsx` (~100 lines, React.memo) — individual row
- `TasksWidgetConfig.tsx` (exists at 513 lines, also needs splitting)

---

### PERF-05: Unstable `useMemo` dependencies defeat memoization

**File:** `src/components/widgets/DailyBriefWidget.tsx:10`

```typescript
// BEFORE — new Date() creates new object every render, useMemo always recomputes
const today = new Date();
const taskStats = useMemo(() => { ... }, [tasks, today]);

// AFTER — stable string dependency
const todayStr = useMemo(() => format(new Date(), 'yyyy-MM-dd'), []);
const taskStats = useMemo(() => { ... }, [tasks, todayStr]);
```

Same pattern in `DailyBriefWidget` lines 51–63 (`eventsToday`) and 66–84 (`nextEvent`).

---

### SEC-04: Raw error messages displayed to users

Backend errors leak database column names, RLS policy details, or stack traces.

| File | Line | Issue |
|---|---|---|
| `components/ErrorBoundary.tsx` | 46–49 | Renders `this.state.error.message` in `<pre>` |
| `pages/Auth.tsx` | 46–48 | `toast.error(error.message)` |
| `pages/Auth.tsx` | 72–74 | `toast.error(error.message)` |
| `widgets/AIInboxWidget.tsx` | 200–202 | `console.error('AI processing error:', error)` |
| `hooks/useKaivooActions.ts` | ~16 instances | `console.error(e)` only |

```typescript
// BEFORE
toast.error(error.message);

// AFTER
console.error('[Auth]', error);
toast.error('Sign in failed. Please check your credentials.');
```

For `ErrorBoundary.tsx`, hide error details behind a "Show Details" toggle that's only visible in development mode.

---

### DB-01: Only 1 database index exists across the entire schema

Only `idx_widget_settings_user_key` exists. Every primary query pattern does a full table scan.

**Required migration:**

```sql
-- Add to new migration file
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

---

### DB-02: Unbounded query on routine_completions

**File:** `src/services/routines.service.ts:41–46`

Fetches *all* completion records ever. A user with 1 year of daily routines (10 routines x 365 days) returns 3,650 rows every page load.

```typescript
// BEFORE
export const fetchRoutineCompletions = async (userId: string) => {
  const { data, error } = await supabase
    .from('routine_completions')
    .select('*');  // ← no user filter, no date filter, no limit
  if (error) throw error;
  return data || [];
};

// AFTER
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

---

## P2 — MEDIUM (Fix Next Sprint)

### CODE-01: `any` types across entire service layer

Every `dbTo*` converter uses `row: any`. Every `dbUpdates` object is typed `any`. **17 instances** across 6 service files.

| File | Count |
|---|---|
| `tasks.service.ts` | 3 (lines 5, 63, 96) |
| `captures.service.ts` | 2 (lines 5, 46) |
| `journal.service.ts` | 2 |
| `meetings.service.ts` | 1 |
| `routines.service.ts` | 2 |
| `topics.service.ts` | 3 |
| `hooks/useDatabase.ts` | 3 (lines 51, 64, 76) |
| `hooks/useKaivooActions.ts` | 2 (lines 206, 228) |

**Fix:** Import `Tables` type from Supabase generated types:
```typescript
import { Tables } from '@/integrations/supabase/types';
export const dbToTask = (row: Tables<'tasks'>, subtasks: Subtask[] = []): Task => ...
```

---

### CODE-02: Duplicated status/priority config objects

`statusConfig` and `priorityConfig` are copy-pasted across 3 files:

| File | Lines |
|---|---|
| `pages/Tasks.tsx` | 55–67 |
| `components/TaskDetailsDrawer.tsx` | 43–55 |
| `components/widgets/TasksWidget.tsx` | 46–52 |

**Fix:** Create `src/lib/task-config.ts` with shared exports.

---

### CODE-03: Duplicated `getTodayString()` utility

Defined independently in `useKaivooStore.ts`, `useRoutineStore.ts`, and inline in 7+ components as `format(new Date(), 'yyyy-MM-dd')`.

**Fix:** Create `src/lib/date-utils.ts` with `getTodayString()`.

---

### CODE-04: React Query installed but entirely unused

`@tanstack/react-query` is in `package.json`, `QueryClientProvider` wraps the app in `App.tsx:29`, but zero `useQuery`/`useMutation` hooks exist. ~40 KB of dead weight.

**Action:** Either remove it or migrate data fetching to use it (which also solves caching gaps).

---

### CODE-05: `useEffect` cleanup gaps in custom hooks

| File | Issue |
|---|---|
| `hooks/useWidgetSettings.ts` | Debounced setTimeout queues stale saves |
| `hooks/useAIActionLog.ts` | fetchLogs in useEffect with no abort controller |
| `hooks/useAISettings.ts` | Async fetch with no cleanup on unmount |

---

### A11Y-01: Icon-only buttons missing `aria-label`

Pattern found across Insights, Tasks, CalendarPage, and all widgets with `<Button variant="ghost" size="icon">`.

```typescript
// BEFORE
<Button variant="ghost" size="icon" onClick={...}>
  <ChevronLeft className="h-4 w-4" />
</Button>

// AFTER
<Button variant="ghost" size="icon" aria-label="Previous week" onClick={...}>
  <ChevronLeft className="h-4 w-4" />
</Button>
```

---

### A11Y-02: No `aria-live` regions for async state changes

Saving, loading, and AI extraction states change silently. Screen reader users get no notification.

```typescript
// Add to pages with async operations
<div aria-live="polite" className="sr-only">
  {isSaving && 'Saving entry...'}
  {isExtracting && 'AI is analyzing your entry...'}
</div>
```

---

### SEO-01: Missing `og:image` and `canonical` tags

**File:** `index.html:11–16`

`og:title` and `og:description` present but no `og:image`. Social shares render with no preview image.

```html
<!-- ADD -->
<meta property="og:image" content="/kaivoo-og.png" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<link rel="canonical" href="https://kaivoo.app" />
```

---

## P3 — LOW (Backlog)

| ID | Issue | File(s) |
|---|---|---|
| CODE-06 | 7+ files have their own localStorage try/catch pattern — extract `useLocalStorage` hook | Today.tsx, Tasks.tsx, JournalPage.tsx, TasksWidget.tsx |
| CODE-07 | Inconsistent hook naming — mix of `use-mobile.tsx` (kebab) and `useKaivooActions.ts` (camel) | `src/hooks/` |
| CODE-08 | `AIInboxWidget.tsx` is 972 lines — split into ThoughtProcessor, LinkProcessor, History | `src/components/widgets/` |
| PERF-06 | Store methods like `getWeeklyRoutineStats()` recompute on every call — memoize in consumers | `useKaivooStore.ts` |
| PERF-07 | `allTags` in TasksWidget rebuilt from Set on every render | `TasksWidget.tsx:79–95` |
| SEC-05 | Password minimum is 6 chars — OWASP recommends 12+ with complexity | `Auth.tsx:58–66` |
| SEC-06 | No Content Security Policy meta tag or headers | `index.html`, `vite.config.ts` |
| SEC-07 | No rate limiting on auth attempts (brute force possible) | `Auth.tsx` |
| A11Y-03 | 7 files use `autoFocus` — can disorient keyboard/screen-reader users | TaskDetailsDrawer, TopicPagePicker, etc. |
| A11Y-04 | `text-muted-foreground` used 336 times — needs axe contrast verification | `index.css` |
| DB-03 | UUID arrays (`topic_ids`, `tags`) should be junction tables for proper indexing | Database schema |
| DB-04 | No stale-data refresh — app stays open for hours, data diverges from DB | `useDatabase.ts` |
| SEO-02 | No JSON-LD structured data for search engines | `index.html` |

---

## Prioritized Fix Roadmap

### Week 1: Security & Stability
1. SEC-01 — Add `.eq('user_id', userId)` to all 11 fetch functions
2. SEC-02 — Add `userId` param + `.eq('user_id', userId)` to all update/delete functions
3. SEC-03 — Add rollback logic to optimistic writes in `useKaivooActions`
4. SEC-04 — Sanitize error messages shown to users
5. DB-01 — Create Supabase migration with all missing indexes

### Week 2: Performance
6. PERF-01 — Add `React.lazy()` + `Suspense` to all page routes
7. PERF-01 — Add `manualChunks` for recharts, tiptap, radix to `vite.config.ts`
8. PERF-02 — Switch to Zustand selectors in all widget components
9. PERF-03 — Replace `reload()` with surgical store mutations after creates
10. PERF-05 — Fix unstable useMemo dependencies in DailyBriefWidget

### Week 3: Code Quality
11. CODE-01 — Type the service layer — replace all `any` with Supabase generated types
12. CODE-02 — Extract shared `task-config.ts` (statusConfig, priorityConfig)
13. CODE-03 — Create `date-utils.ts` with shared date formatting
14. PERF-04 — Split `TasksWidget.tsx` into 4–5 focused components
15. CODE-05 — Add cleanup functions to custom hooks

### Week 4: Accessibility & Polish
16. A11Y-01 — Add `aria-label` to all icon-only buttons
17. A11Y-02 — Add `aria-live` regions for loading/saving states
18. A11Y-04 — Run axe audit on all pages for contrast ratios
19. SEO-01 — Add `og:image`, canonical URL
20. CODE-04 — Decide: adopt React Query or remove it from bundle

---

## Score Card

| Dimension | Score | Notes |
|---|---|---|
| Performance | 4/10 | Zero code splitting, entire-store subscriptions, full reload on every write |
| Security | 3/10 | Missing user_id on all queries, no ownership on updates, no rollback |
| Code Quality | 6/10 | Good structure post-Sprint 0, but 17+ `any` types and duplicated patterns |
| Bundle Size | 3/10 | 482 KB gzipped — 2.4x over 200 KB target |
| Database | 3/10 | 1 index across 11 tables, unbounded routine completions query |
| Caching | 2/10 | React Query imported but unused, full reload after every mutation |
| Accessibility | 6/10 | Good label associations, proper semantic HTML, but missing aria-labels on icon buttons |
| Error Handling | 4/10 | ErrorBoundary exists but silent failures everywhere, no rollbacks |
| SEO | 6/10 | Basic OG tags present, missing og:image and structured data |
| **OVERALL** | **4.1/10** | **Grade: C+** |

---

**Summary:** The Sprint 0 architectural foundation (service layer, domain stores, error boundaries) is solid. The app builds and runs cleanly. However, 3 critical security issues (SEC-01, SEC-02, SEC-03) are ship blockers — any authenticated user can read, modify, or delete any other user's data. The 1.6 MB monolithic bundle and full-reload-on-every-write pattern will degrade as data grows. Weeks 1–2 of the roadmap above will address all blockers; Weeks 3–4 bring the codebase to production quality.

---

**Kaivoo Command Center — Code Audit Report v0.1**
**February 2026**

*Reviewed by Agent 7. Next review scheduled after Sprint 1 completion.*
