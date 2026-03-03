# Code Audit — Adapter Layer (Sprint 21 Post-Merge)

**Reviewer:** Agent 7 | **Date:** 2026-03-02 | **Scope:** `src/lib/adapters/` (2,746 lines, 11 files)
**Trigger:** Sprint 21 shipped without formal Phase 4 gate. This audit catches up before Sprint 22 builds on top.

---

## Summary

The adapter layer is **architecturally sound** — clean separation of concerns, consistent patterns, well-typed interfaces. The Sprint 20 abstraction and Sprint 21 implementation are solid foundations. However, 5 previously-identified P1 issues are confirmed, and **2 new P1 bugs** were found that weren't caught during Sprint 21's inline review.

**Verdict:** No P0 ship blockers. 7 P1 issues (5 known + 2 new). All fixable within Sprint 22 Track 1.

---

## File Size Check

| File | Lines | Status |
|---|---|---|
| `types.ts` | 532 | PASS |
| `supabase.ts` | 559 | PASS |
| `local-entities-ext.ts` | 496 | PASS |
| `local-entities-core.ts` | 425 | PASS |
| `local-schema.ts` | 178 | PASS |
| `local-search.ts` | 154 | PASS |
| `provider.tsx` | 128 | PASS |
| `local.ts` | 125 | PASS (barrel) |
| `index.ts` | 67 | PASS |
| `local-auth.ts` | 53 | PASS |
| `local-types.ts` | 29 | PASS |

All files under 600-line threshold. **The Sprint 22 P1 file split has already been executed on disk** (uncommitted — untracked files + modified `local.ts`). The split is clean: barrel module + 6 submodules.

---

## P0 — CRITICAL (Ship Blockers)

None.

---

## P1 — HIGH (Fix This Sprint)

### P1-1: Zero try/catch in local CRUD (~80 operations) — CONFIRMED
**Files:** `local-entities-core.ts` (all methods), `local-entities-ext.ts` (all methods)
**Impact:** If any SQLite operation fails, the error propagates as an unhandled rejection with no adapter-level context. The optimistic update layer (`useKaivooActions`) catches errors upstream, but error messages will be generic "database error" instead of "Failed to create task in local storage."
**Status:** Already tracked as Sprint 22 P2.

### P1-2: FTS5 index stale after writes — CONFIRMED
**File:** `local-search.ts` — `rebuildIndex()` called only at startup (provider.tsx:53)
**Impact:** User creates/edits/deletes an entity → searches for it → not found until next app restart. Real UX issue for desktop users who rely on search.
**Status:** Already tracked as Sprint 22 P3.

### P1-3: Habits/routines table collision (no discriminator) — CONFIRMED
**Files:** `local-entities-ext.ts:50` (`LocalRoutineAdapter.fetchAll`) and `local-entities-ext.ts:179` (`LocalHabitAdapter.fetchAll`)
**Impact:**
- `fetchAll()` on routines returns `SELECT * FROM routines ORDER BY "order"` — includes habits
- `fetchAll()` on habits filters by `is_archived = 0` — includes non-archived routines
- Both return wrong data for their query. Desktop users will see habits in routines list and routines in habits list.

**Status:** Already tracked as Sprint 22 P4.

### P1-4: Supabase adapter re-creation on user?.id change — CONFIRMED
**File:** `provider.tsx:67-83`
**Impact:** Every `user?.id` change (web mode) recreates `SupabaseAuthAdapter`, `SupabaseSearchAdapter`, AND `SupabaseDataAdapter`. Auth and search are stateless and have no `userId` dependency — they're recreated for nothing. This triggers unnecessary React context updates, causing all adapter consumers to re-render.

**BEFORE** (provider.tsx:67-83):
```tsx
const value = useMemo<AdapterContextValue>(() => {
  // ...
  const auth = new SupabaseAuthAdapter();
  const search = new SupabaseSearchAdapter();
  const data = user ? new SupabaseDataAdapter(user.id) : null;
  return { data, auth, search, isLocal: false };
}, [isLocal, localAdapters, user?.id]);
```

**AFTER:**
```tsx
const auth = useMemo(() => new SupabaseAuthAdapter(), []);
const search = useMemo(() => new SupabaseSearchAdapter(), []);
const data = useMemo(() => user ? new SupabaseDataAdapter(user.id) : null, [user?.id]);
// Only the context value depends on all three:
const value = useMemo(() => ({ data, auth, search, isLocal: false }), [data, auth, search]);
```

**Status:** Already tracked as Sprint 22 P5.

### P1-5 (NEW): TopicAdapter.update and TopicPageAdapter.update crash on empty input
**Files:** `local-entities-core.ts:329-352` (TopicAdapter), `local-entities-core.ts:381-402` (TopicPageAdapter)
**Impact:** If `update()` is called with `{}` (no fields to update), these adapters skip the `if (sets.length === 0) return;` guard that every other adapter has. They proceed to execute `UPDATE topics SET WHERE id = $1` — which is invalid SQL. This causes an unhandled SQLite error.

Compare with `LocalTaskAdapter.update` (line 126): `if (sets.length === 0) return;` — correct.
Compare with `LocalTopicAdapter.update` (line 329): no guard — BUG.

**BEFORE** (local-entities-core.ts:329-341):
```ts
async update(id: string, input: UpdateTopicInput): Promise<Topic> {
  const sets: string[] = [];
  const vals: unknown[] = [];
  let i = 1;
  const add = (c: string, v: unknown) => { ... };
  if (input.name !== undefined) add('name', input.name);
  if (input.description !== undefined) add('description', input.description);
  if (input.icon !== undefined) add('icon', input.icon);
  vals.push(id);
  await this.db.execute(`UPDATE topics SET ${sets.join(', ')} WHERE id = $${i}`, vals);
```

**AFTER:**
```ts
  if (input.icon !== undefined) add('icon', input.icon);
  if (sets.length === 0) {
    // No changes — return current row
    const rows = await this.db.select<Array<Record<string, unknown>>>('SELECT * FROM topics WHERE id = $1', [id]);
    // ... map and return
    return;
  }
  vals.push(id);
```

Same fix needed for `LocalTopicPageAdapter.update` at line 381.

### P1-6 (NEW): routine_completions shared between RoutineCompletionAdapter and HabitCompletionAdapter
**Files:** `local-entities-ext.ts:148-160` (RoutineCompletionAdapter), `local-entities-ext.ts:287-300` (HabitCompletionAdapter)
**Impact:** This is the completions-level manifestation of P1-3.
- `RoutineCompletionAdapter.fetchAll()` reads ALL `routine_completions` with 90-day window — includes habit completions
- `HabitCompletionAdapter.fetchAll()` reads ALL `routine_completions` with 365-day window — includes routine completions
- Both return contaminated data. When the type discriminator (P1-3) is added to `routines`, a JOIN or subquery should filter completions to only match the correct entity type.

### P1-7: Sprint 22 P1 (file split) — uncommitted work on disk
**Discovery:** `local-types.ts`, `local-schema.ts`, `local-entities-core.ts`, `local-entities-ext.ts`, `local-auth.ts`, `local-search.ts` are all untracked (`??`). `local.ts` is modified (`M`). A previous session performed the split but never committed.
**Risk:** If the branch is reset or the working directory is cleaned, this work is lost. Should be committed as the first action on Sprint 22.

---

## P2 — MEDIUM (Fix Next Sprint)

### P2-1: Dual user identity — CONFIRMED
**Files:** `local-auth.ts:29` (generates UUID), `provider.tsx` consumes `useAuth` which uses `id: 'local-user'` shim
**Impact:** Two different identities for the same local desktop user. Low risk now (single-user desktop), but will cause issues if sync/export features reference user IDs.

### P2-2: HabitCompletion toggle inserts with NULL count
**File:** `local-entities-ext.ts:302-311`
**Impact:** `toggle()` inserts a `routine_completions` row without setting `count`. The schema has `count INTEGER` with no default, so it's NULL. The `incrementCount` method (line 321) correctly inserts with `count = 1`. If the app reads `count` expecting a number for countable habits, NULL may cause display issues or NaN in calculations.

**BEFORE** (local-entities-ext.ts:306):
```ts
await this.db.execute('INSERT INTO routine_completions (id, routine_id, date) VALUES ($1,$2,$3)', [
  uuid(), habitId, date,
]);
```

**AFTER:**
```ts
await this.db.execute('INSERT INTO routine_completions (id, routine_id, date, count) VALUES ($1,$2,$3,1)', [
  uuid(), habitId, date,
]);
```

### P2-3: No error path tests — CONFIRMED
All 76 local adapter tests are happy-path only. No tests for: malformed input, database connection failures, SQL constraint violations, or concurrent access.

### P2-4: Missing composite index — FALSE POSITIVE (resolved)
Sprint 21 noted `routine_completions(routine_id, date)` needed a composite index. However, the schema (local-schema.ts:119) has `UNIQUE(routine_id, date)` which creates an implicit composite index. This is already covered.

---

## P3 — LOW (Backlog)

### P3-1: Repetitive dynamic SET pattern
The `update()` method's `sets/vals/add` closure is copy-pasted across ~15 entity adapters. Could extract to a utility, but each adapter is now in its own contained file, so the duplication is tolerable.

### P3-2: Type assertions on SQLite rows
Every `fetchAll()` casts `Record<string, unknown>` fields with `as string`, `as number`. A row mapper would be safer but over-engineering for now.

---

## Score Card

| Dimension | Score | Notes |
|---|---|---|
| Performance | 7/10 | Adapter re-creation on user?.id change. FTS rebuild is sequential. |
| Security | 9/10 | All queries parameterized. No secrets exposed. Local auth is minimal-risk. |
| Code Quality | 7/10 | Clean architecture, but try/catch gap and two missing guards. |
| Bundle | 9/10 | Well code-split via dynamic import. Local adapter only loads in Tauri. |
| Database | 6/10 | Habits/routines table collision. Completions contamination. FTS stale. |
| Caching | 8/10 | React Query handles caching upstream. Adapter is stateless (correct). |
| A11Y | N/A | No UI components in adapter layer. |
| Errors | 4/10 | Zero try/catch across ~80 operations. Silent propagation. |
| SEO | N/A | Not applicable. |
| Refactor | 8/10 | File split done (uncommitted). Types are clean. Interfaces well-defined. |
| **OVERALL** | **7/10** | **Grade: B** — Strong foundation with known debt being addressed in Sprint 22. Two new bugs (P1-5, P1-6) should be added to Sprint 22 scope. |

---

## Prioritized Fix Roadmap (Sprint 22 Track 1)

| Order | Issue | ID | Action |
|---|---|---|---|
| 1 | Commit the file split | P1-7 | `git add` the 6 new files + modified `local.ts`. Commit immediately. |
| 2 | Add empty-set guards to Topic/TopicPage update | P1-5 | 2 methods, ~5 lines each. Quick fix. |
| 3 | Add type discriminator to routines | P1-3 | Schema migration + filter queries. Already scoped as Sprint 22 P4. |
| 4 | Filter completions by entity type | P1-6 | JOIN or subquery after discriminator lands. |
| 5 | Add try/catch to local CRUD | P1-1 | ~80 operations. Already scoped as Sprint 22 P2. |
| 6 | FTS5 incremental updates | P1-2 | Already scoped as Sprint 22 P3. |
| 7 | Memoize Supabase auth/search adapters | P1-4 | Already scoped as Sprint 22 P5. |
| 8 | Fix habit toggle count | P2-2 | 1-line fix. |

---

*Code Audit — Sprint 21 Adapter Layer*
*Agent 7 | March 2, 2026*
*Post-merge audit triggered by skipped Phase 4 gates*
