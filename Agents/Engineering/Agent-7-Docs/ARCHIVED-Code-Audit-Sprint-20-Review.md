# Code Review -- Kaivoo Command Center Sprint 20 (Local-First Foundation)

Reviewer: Agent 7 (Code Reviewer) | Date: 2026-03-02 | Build: PASS | Verdict: **CONDITIONAL PASS**

---

## Summary

Sprint 20 introduces the adapter abstraction layer for local-first (Tauri/SQLite) support, wrapping existing Supabase services behind uniform interfaces, adding a local SQLite backend, a React context provider, and E2E test infrastructure. The architecture is sound -- clean interface segregation, runtime detection, dynamic imports for code splitting. However, there are several issues that must be addressed before merging.

**Files Reviewed:** 13 (5 new adapter files, 5 modified files, 3 E2E files)

---

## P0 -- CRITICAL (Ship Blockers)

### P0-1: Stale Closure in AdapterProvider Cleanup -- Data Loss Risk

**File:** `daily-flow/src/lib/adapters/provider.tsx` (lines 45-68)
**Category:** Correctness / Memory Leak
**Impact:** On unmount, `dispose()` is called on a stale `null` reference captured at initial render, meaning the SQLite database connection is never closed. On hot-reload or navigation-triggered remounts, orphaned connections accumulate.

The cleanup function captures `localAdapters` from the initial render closure (when it is `null`). By the time the effect cleans up, `localAdapters` has been updated via `setLocalAdapters`, but the cleanup function still sees the original `null` value.

```tsx
// BEFORE (provider.tsx:45-68)
useEffect(() => {
  if (!isLocal || initRef.current) return;
  initRef.current = true;

  (async () => {
    // ... sets localAdapters
  })();

  return () => {
    // BUG: localAdapters is captured as null from initial render
    void localAdapters?.data.dispose();
  };
}, [isLocal]);
```

```tsx
// AFTER -- use a ref to track the live adapter instance
const adapterRef = useRef<LocalAdapters | null>(null);

useEffect(() => {
  if (!isLocal || initRef.current) return;
  initRef.current = true;

  (async () => {
    try {
      const { LocalDataAdapter, LocalAuthAdapter, LocalSearchAdapter } = await import("./local");
      const data = new LocalDataAdapter();
      await data.initialize();
      const adapters: LocalAdapters = {
        data,
        auth: new LocalAuthAdapter(),
        search: new LocalSearchAdapter(),
      };
      adapterRef.current = adapters;
      setLocalAdapters(adapters);
    } catch (e) {
      console.error("[AdapterProvider] Failed to initialize LocalAdapter:", e);
    }
  })();

  return () => {
    void adapterRef.current?.data.dispose();
  };
}, [isLocal]);
```

### P0-2: useDatabase Still Calls Raw Supabase Service -- Breaks Local Mode

**File:** `daily-flow/src/hooks/useDatabase.ts` (lines 13, 44)
**Category:** Correctness
**Impact:** In Tauri/local mode, `fetchRawSubtasks(user.id)` calls Supabase directly, bypassing the adapter layer entirely. This means subtask loading will fail or return empty in desktop mode, breaking the entire task display.

```ts
// BEFORE (useDatabase.ts:13)
import { fetchSubtasks as fetchRawSubtasks } from '@/services/tasks.service';

// BEFORE (useDatabase.ts:44)
fetchRawSubtasks(user.id),
```

```ts
// AFTER -- use adapter for subtasks too, add taskId to Subtask type
// Short-term fix: use adapter.subtasks.fetchAll() and join in-memory
adapter.subtasks.fetchAll(),

// Then in the grouping logic, the subtask adapter's fetchAll for local
// already returns task_id info from the SQL query. Extend the Subtask type
// or add a SubtaskWithTaskId intermediate type.
```

This is a **hard blocker for desktop mode**. The TODO comment on line 12 acknowledges it but the current code ships broken local-first support.

### P0-3: LocalDataAdapter Entity Adapters Accessed Before initialize()

**File:** `daily-flow/src/lib/adapters/local.ts` (lines 793-807)
**Category:** Correctness
**Impact:** All entity adapter properties use definite assignment assertions (`!`). If any code path accesses `adapter.tasks` before `initialize()` completes (e.g., a race condition in the provider), it will throw a runtime error with a confusing "Cannot read properties of undefined" message instead of a meaningful error.

```ts
// BEFORE (local.ts:793-807)
tasks!: TaskAdapter;
subtasks!: SubtaskAdapter;
// ... all with ! assertions
```

```ts
// AFTER -- use a getter that throws a clear error if not initialized
private _tasks: TaskAdapter | null = null;
get tasks(): TaskAdapter {
  if (!this._tasks) throw new Error("LocalDataAdapter not initialized -- call initialize() first");
  return this._tasks;
}
// Repeat for all entity adapters, or use a Proxy pattern
```

---

## P1 -- HIGH (Fix This Sprint)

### P1-1: Silent Error Swallowed in useDatabase loadData

**File:** `daily-flow/src/hooks/useDatabase.ts` (lines 95-97)
**Category:** Error Handling
**Impact:** When the initial data load fails (network error, auth expiry, corrupted local DB), the user sees no indication that their data didn't load. They may interact with an empty UI thinking their data was deleted.

```ts
// BEFORE (useDatabase.ts:95-97)
} catch (error) {
  console.error('Error loading data from database:', error);
}
```

```ts
// AFTER -- surface the error to the user
} catch (error) {
  console.error('Error loading data from database:', error);
  toast.error('Failed to load your data. Please try refreshing.');
}
```

### P1-2: Local SQLite Schema Missing Habits Table -- Uses routines Table

**File:** `daily-flow/src/lib/adapters/local.ts` (lines 598-660)
**Category:** Correctness / Data Model
**Impact:** `LocalHabitAdapter` reads from/writes to the `routines` table (lines 601, 617, 648). While this mirrors the Supabase schema (where habits are stored in the `routines` table), it creates confusion and means the "routines" table serves double duty. The `LocalRoutineAdapter` (line 532) also reads the same `routines` table without filtering out habits, which means `adapter.routines.fetchAll()` returns habit rows too.

```ts
// BEFORE (local.ts:601)
const rows = await this.db.select<...>("SELECT * FROM routines WHERE is_archived = 0 ORDER BY \"order\"");

// BEFORE (local.ts:532)
const rows = await this.db.select<...>("SELECT * FROM routines ORDER BY \"order\"");
```

The `LocalRoutineAdapter.fetchAll()` does not filter by any criteria to separate routines from habits. If the app creates both routines and habits in the same table, `routines.fetchAll()` will return habits too, corrupting the routines list.

**Recommended fix:** Add a `type` or `is_habit` discriminator column, or filter by a convention (e.g., `WHERE type NOT IN ('positive', 'negative')` for routines vs habits).

### P1-3: SupabaseAuthAdapter.signInWithOAuth Uses Unsafe Type Cast

**File:** `daily-flow/src/lib/adapters/supabase.ts` (line 584)
**Category:** Security / Type Safety
**Impact:** The `provider` parameter is typed as `string` but cast to `"google" | "github"` without validation. If a caller passes an unexpected value (e.g., from user input), Supabase may throw an opaque error. More critically, this circumvents TypeScript's type safety for auth providers.

```ts
// BEFORE (supabase.ts:584)
provider: provider as "google" | "github",
```

```ts
// AFTER -- validate before casting
const SUPPORTED_PROVIDERS = ["google", "github"] as const;
type OAuthProvider = (typeof SUPPORTED_PROVIDERS)[number];

async signInWithOAuth(provider: string): Promise<void> {
  if (!SUPPORTED_PROVIDERS.includes(provider as OAuthProvider)) {
    throw new Error(`Unsupported OAuth provider: ${provider}`);
  }
  const { error } = await supabase.auth.signInWithOAuth({
    provider: provider as OAuthProvider,
  });
  if (error) throw error;
}
```

### P1-4: E2E Auth Setup Hardcodes Supabase Project URL and Ref

**File:** `daily-flow/e2e/auth.setup.ts` (lines 17-19)
**Category:** Security / Maintainability
**Impact:** The Supabase URL and project ref are hardcoded. This is a security concern (leaks infrastructure details into version control) and a maintainability concern (breaks if the project changes).

```ts
// BEFORE (auth.setup.ts:17-19)
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "https://qfumextzhucozitrvekv.supabase.co";
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY || "";
const PROJECT_REF = "qfumextzhucozitrvekv";
```

```ts
// AFTER -- derive from env vars, fail fast if missing
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
if (!SUPABASE_URL || !SUPABASE_KEY) {
  throw new Error("VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are required for E2E tests");
}
// Extract project ref from URL
const PROJECT_REF = new URL(SUPABASE_URL).hostname.split(".")[0];
```

### P1-5: AdapterProvider Creates New Supabase Adapter Instances on Every user.id Change

**File:** `daily-flow/src/lib/adapters/provider.tsx` (lines 71-87)
**Category:** Performance
**Impact:** The `useMemo` dependency on `user?.id` means that on every auth state change (including token refreshes that don't change the user ID), new `SupabaseAuthAdapter` and `SupabaseSearchAdapter` instances are created. While these are lightweight, it breaks referential equality and may cause unnecessary re-renders in consumers.

```tsx
// BEFORE (provider.tsx:82-84)
const auth = new SupabaseAuthAdapter();
const search = new SupabaseSearchAdapter();
const data = user ? new SupabaseDataAdapter(user.id) : null;
```

```tsx
// AFTER -- memoize Supabase adapters at module scope (they're stateless singletons)
const supabaseAuth = new SupabaseAuthAdapter();
const supabaseSearch = new SupabaseSearchAdapter();

// Inside useMemo:
const data = user ? new SupabaseDataAdapter(user.id) : null;
return { data, auth: supabaseAuth, search: supabaseSearch, isLocal: false };
```

### P1-6: Habits/Routines Table Schema Overlap -- Missing `user_id` Column in SQLite

**File:** `daily-flow/src/lib/adapters/local.ts` (lines 90-245)
**Category:** Security / Data Model
**Impact:** None of the SQLite tables have a `user_id` column. While this is acceptable for single-user desktop mode today, it creates a schema divergence from Supabase that will complicate future sync. More importantly, if multi-user desktop support is ever added, there is no user isolation in the data model.

This is acceptable for Sprint 20's scope (single-user desktop), but should be tracked for Sprint 21.

**Recommended:** Add `user_id TEXT` columns now (defaulting to `'local-user'`) to maintain schema parity with Supabase. This makes future sync vastly simpler.

---

## P2 -- MEDIUM (Fix Next Sprint)

### P2-1: LocalAdapter Inline SQL Queries -- No Parameterized Schema Migrations

**File:** `daily-flow/src/lib/adapters/local.ts` (lines 90-245, 815-818)
**Category:** Maintainability
**Impact:** The SQLite schema is defined as a single string constant split on `;`. This is fragile -- if any statement contains a semicolon in a default value or comment, it will break. There is no migration versioning, so schema changes in future sprints will require manual `ALTER TABLE` logic.

```ts
// BEFORE (local.ts:815-817)
const statements = SCHEMA_SQL.split(";").map((s) => s.trim()).filter(Boolean);
for (const stmt of statements) {
  await this.db.execute(stmt);
}
```

**Recommended:** Introduce a `schema_version` table and versioned migration functions for Sprint 21.

### P2-2: `any` Type Avoidance -- `Record<string, unknown>` Used Extensively

**File:** `daily-flow/src/lib/adapters/local.ts` (throughout)
**Category:** Type Safety
**Impact:** All SQLite queries return `Record<string, unknown>` and cast values inline with `as string`, `as number`, etc. This is better than `any` but provides no compile-time safety. A typo in a column name (e.g., `r.titl` instead of `r.title`) would silently produce `undefined`.

**Recommended:** Define row-level interfaces for each table (e.g., `interface TaskRow { id: string; title: string; ... }`) and use them as the generic parameter for `db.select<TaskRow[]>(...)`.

### P2-3: E2E Tests Use `page.click()` Instead of Locator-Based Actions

**File:** `daily-flow/e2e/authenticated.spec.ts` (lines 37-38, 43-44, 103, 113, 162)
**Category:** Maintainability
**Impact:** `page.click('a[href="/tasks"]')` is a deprecated pattern in Playwright. The recommended approach uses locator-based actions which auto-wait and are more resilient to timing issues.

```ts
// BEFORE (authenticated.spec.ts:37-38)
await page.click('a[href="/tasks"]');

// AFTER
await page.locator('a[href="/tasks"]').click();
```

### P2-4: E2E Auth Storage State Path Not in .gitignore

**File:** `daily-flow/e2e/auth.setup.ts` (line 21)
**Category:** Security
**Impact:** The storage state file (`e2e/.auth/user.json`) contains auth tokens. If not gitignored, it could be committed to version control.

**Recommended:** Verify that `e2e/.auth/` is in `.gitignore`. If not, add it.

### P2-5: ESLint Config Ignores `src-tauri` and `e2e` Entirely

**File:** `daily-flow/eslint.config.js` (line 8)
**Category:** Code Quality
**Impact:** The `e2e/` directory contains TypeScript files that won't be linted. While E2E tests have different concerns, basic linting (no-unused-vars, type safety) should still apply.

```js
// BEFORE (eslint.config.js:8)
{ ignores: ["dist", "src-tauri", "e2e", "playwright.config.ts", ...] }
```

**Recommended:** Create a separate ESLint config entry for `e2e/` with relaxed rules, rather than ignoring it entirely.

### P2-6: AuthAdapter Interface Accepts `string` for Provider but Supabase Is Narrower

**File:** `daily-flow/src/lib/adapters/types.ts` (line 481)
**Category:** Type Safety
**Impact:** `signInWithOAuth(provider: string)` is overly broad. The interface should use a union type so that the LocalAuthAdapter's no-op and the SupabaseAdapter's cast are both type-safe.

```ts
// BEFORE (types.ts:481)
signInWithOAuth(provider: string): Promise<void>;

// AFTER
signInWithOAuth(provider: "google" | "github"): Promise<void>;
```

### P2-7: `useDatabaseOperations` Not Memoized -- New Object Every Render

**File:** `daily-flow/src/hooks/useDatabase.ts` (lines 110-206)
**Category:** Performance
**Impact:** `useDatabaseOperations()` returns a new object with new function references on every render. Any component using destructured functions from this hook will re-render its children unnecessarily if those functions are passed as props.

```ts
// BEFORE (useDatabase.ts:110)
export const useDatabaseOperations = () => {
  const { data: adapter } = useAdapters();
  const ensureAdapter = () => { ... };
  return { createTask: ..., updateTask: ..., ... };
};
```

```ts
// AFTER -- wrap in useMemo
export const useDatabaseOperations = () => {
  const { data: adapter } = useAdapters();
  return useMemo(() => {
    const ensureAdapter = () => {
      if (!adapter) throw new Error('Not authenticated');
      return adapter;
    };
    return { createTask: ..., ... };
  }, [adapter]);
};
```

### P2-8: LocalAdapter parseJSON Silent Failure Masks Data Corruption

**File:** `daily-flow/src/lib/adapters/local.ts` (lines 256-263)
**Category:** Error Handling
**Impact:** If a JSON column contains malformed data, `parseJSON` silently returns the fallback. This masks data corruption -- the user would see missing tags/topics with no error message.

```ts
// BEFORE (local.ts:256-263)
const parseJSON = <T>(val: string | null | undefined, fallback: T): T => {
  if (!val) return fallback;
  try { return JSON.parse(val); }
  catch { return fallback; }
};
```

```ts
// AFTER -- log warnings for corrupted data
const parseJSON = <T>(val: string | null | undefined, fallback: T, context?: string): T => {
  if (!val) return fallback;
  try { return JSON.parse(val); }
  catch (e) {
    console.warn(`[LocalAdapter] Malformed JSON in ${context || 'unknown column'}:`, val);
    return fallback;
  }
};
```

---

## Observations (No Action Required)

1. **Well-designed interface segregation.** The `types.ts` file cleanly separates entity adapters from top-level adapters (`DataAdapter`, `AuthAdapter`, `SearchAdapter`, `FileAdapter`). The `AdapterSet` type provides a single injection point. This is good architecture.

2. **Supabase adapter is a thin delegation layer.** It correctly reuses all existing service functions, preserving battle-tested converter logic (dbToTask, dbToJournalEntry, etc.). No logic duplication.

3. **Dynamic import for local adapter is correct.** The `import("./local")` in provider.tsx ensures Tauri-specific code is not bundled in the web build. This is a good code-splitting pattern.

4. **Tauri CSP is well-scoped.** The `tauri.conf.json` CSP restricts `connect-src` to `self` and Supabase domains, `frame-src` to `none`, and `object-src` to `none`. The filesystem permissions use `$APPDATA` scoping. This is solid security posture.

5. **Playwright config structure is clean.** The setup/smoke/authenticated project split with `dependencies` is the recommended pattern. The custom `.env` loader avoids adding a build dependency.

6. **E2E tests cover the right user journeys.** Navigation, task CRUD flow, topic dialog, notes editor, settings, and calendar are all tested. The `waitForAppReady` helper is a good pattern.

---

## Prioritized Fix Roadmap

### Immediate (Before Merge)
- **P0-1:** Fix stale closure in AdapterProvider cleanup (use ref)
- **P0-2:** Replace raw `fetchSubtasks` call in useDatabase with adapter call
- **P0-3:** Add safety checks for uninitialized LocalDataAdapter entity adapters

### This Sprint (Within 1 Week)
- **P1-1:** Surface data loading errors to user via toast
- **P1-2:** Add filtering to separate routines from habits in LocalRoutineAdapter
- **P1-3:** Validate OAuth provider before cast
- **P1-4:** Remove hardcoded Supabase URL/ref from E2E setup
- **P1-5:** Memoize stateless Supabase adapter instances
- **P1-6:** Add user_id columns to SQLite schema for sync readiness

### Next Sprint
- **P2-1 through P2-8:** Type safety improvements, E2E locator updates, memoization, error logging

---

## Score Card

| Dimension | Score | Notes |
|-----------|-------|-------|
| PERF | 7/10 | Adapter re-instantiation on auth changes; useDatabaseOperations not memoized |
| SECURITY | 7/10 | Hardcoded Supabase URL in E2E; OAuth provider not validated; no user_id in SQLite |
| CODE | 8/10 | Clean interface design; some type safety gaps with Record<string, unknown> |
| BUNDLE | 9/10 | Dynamic imports correctly isolate local adapter; no unnecessary dependencies |
| DATABASE | 6/10 | Routines/habits table overlap; no migration versioning; no user_id in SQLite |
| CACHING | 8/10 | N/A for this sprint; existing patterns preserved |
| A11Y | N/A | No UI changes in this sprint |
| ERRORS | 5/10 | Silent failure in loadData catch; parseJSON swallows corruption; P0-3 crash risk |
| SEO | N/A | No SEO-relevant changes |
| REFACTOR | 8/10 | Good adapter pattern; clear upgrade path for Sprint 21 |
| **OVERALL** | **7/10** | **Grade: B -- CONDITIONAL PASS** |

---

## Verdict: CONDITIONAL PASS

The adapter architecture is well-designed and the Supabase adapter correctly preserves existing behavior. However, **3 P0 issues must be resolved before merge:**

1. The stale closure in `AdapterProvider` cleanup will leak database connections
2. The raw `fetchSubtasks` import in `useDatabase` completely breaks local mode
3. The unguarded `!` assertions on `LocalDataAdapter` entity properties create crash risk

Fix these three items and the sprint ships. The P1 items should be addressed within the sprint window but are not merge blockers.

---

**Agent 7 -- Production Readiness Auditor**
**Sprint 20 Local-First Foundation Review**
**March 2026**

*Good code is code that's been reviewed. Great code is code that survived Agent 7.*
