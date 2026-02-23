# Sprint 5: Pipeline & Polish

**Status:** IN PROGRESS
**Branch:** `sprint/5-pipeline-polish`
**Started:** February 23, 2026
**Vision Position:** Phase 1 — Cloud Command Center (~85% complete)
**Previous Sprint:** Sprint 4 — Secure & Stabilize

---

## Sprint Goal

Establish a professional CI/CD pipeline (GitHub remote + Netlify auto-deploy + GitHub Actions test gate) so that merging to main automatically deploys. Then ship a batch of code quality improvements closing Agent 7's P2 backlog: Zustand selector migration, TasksWidget decomposition, service layer typing, React Query resolution, and test expansion.

---

## Input Sources

| Source | Attribution | Key Takeaway |
|---|---|---|
| User request (Feb 23) | User | GitHub remote repository + Netlify CI/CD auto-deploy is #1 priority |
| `Sprints/Sprint-4-Secure-Stabilize.md` (Retrospective) | Sprint 4 | 4 Agent 7 P2 items, deferred: CI/CD, Design System, task recurrence, search, PWA, data import |
| `Engineering/Agent-7-Docs/Code-Audit-Sprint-0-Review.md` | Agent 7 | P2 items: CODE-01 (17 `any` types), CODE-02 (duplicated configs), CODE-04 (React Query unused), CODE-05 (useEffect cleanup), PERF-02 (Zustand full-store subs), PERF-04 (TasksWidget 1,069 lines), PERF-05 (unstable useMemo) |
| `Quality/Agent-10-Docs/Test-Strategy-Sprint-4.md` | Agent 10 | Sprint 5 targets: service layer mock tests, store integration tests, widget render tests, enforce 40% coverage on `src/lib/` |
| `Engineering/Agent-4-Docs/Security-Checklist-By-Phase-Sprint-0.md` | Agent 4 | CSP headers, rate limiting — Phase 1 security items (stretch goal) |
| `Vision.md` v3.1 | Vision | CI/CD pipeline is a Phase 2 milestone; GitHub integration advances deployment maturity |
| `Quality/Agent-11-Docs/Feature-Use-Case-Bible.md` v0.4 | Agent 11 | Today Page regression contract — all checklist items must remain intact |

---

## Agent Assignments

| Agent | Role | Parcels | Rationale |
|---|---|---|---|
| **Agent 9** (DevOps Engineer) | Implementation | P1–P3 | GitHub setup, Netlify integration, CI pipeline |
| **Agent 2** (Staff Software Engineer) | Implementation | P4–P11 | All code quality changes |
| **Agent 10** (QA Architect) | Test Implementation | P12–P14 | Test expansion per Sprint 4 strategy |
| **Agent 11** (Feature Integrity Guardian) | Gate | P15 | Bible regression check before merge |
| **Agent 7** (Code Reviewer) | Gate | P16 | Code audit before merge |

**Not needed:** Agent 1 (no new UI), Agent 3 (no architecture changes), Agent 4 (CSP is stretch only), Agent 5 (no research), Agent 6 (no UX changes), Agent 8 (no business model impact)

---

## Parcels

### Track 1: DevOps Pipeline

#### P1: GitHub Remote Repository Setup
**Owner:** Agent 9
**Priority:** P0

**Changes:**
- Create GitHub repository (private, under user's account)
- Add remote to local git repo
- Push all branches + tags to GitHub
- Verify branch history is intact on GitHub

**Status:** PENDING

---

#### P2: Netlify Git Integration
**Owner:** Agent 9
**Priority:** P0

**Changes:**
- Connect Netlify site (`de0f2e66-5652-4a86-952c-9ee803e80893`) to GitHub repo
- Configure build settings: base directory `daily-flow/`, build command `npm run build`, publish directory `dist/`
- Configure deploy branch: `main` (production)
- Enable deploy previews for sprint branches
- Verify `public/_redirects` works with Git-based deploys

**Status:** PENDING

---

#### P3: CI Test Gate (GitHub Actions)
**Owner:** Agent 9 + Agent 10
**Priority:** P1

**Changes:**
- Create `.github/workflows/ci.yml`
- Trigger: push to `main`, push to `sprint/*` branches, pull requests
- Steps: `npm ci` → `tsc --noEmit` → `npm test` → `npm run build`

**Status:** PENDING

---

### Track 2: Code Quality — Agent 7 P2 Debt

#### P4: Sprint 4 Agent 7 P2 Fixes (4 items)
**Owner:** Agent 2
**Priority:** P1

**Changes:**
- P2-1: Add missing `aria-label` on routine toggle button in `RoutineButton.tsx`
- P2-2: More explicit `CollapsibleTrigger` in `RoutineGroupSection.tsx`
- P2-3: Mood buttons should use `aria-label` instead of `title` in `DailyBriefWidget.tsx`
- P2-4: Add null guard on `getTopicPath` in `JournalTimelineWidget.tsx`

**Files:** `RoutineButton.tsx`, `RoutineGroupSection.tsx`, `DailyBriefWidget.tsx`, `JournalTimelineWidget.tsx`

**Status:** PENDING

---

#### P5: Zustand Selector Migration (PERF-02)
**Owner:** Agent 2
**Priority:** P1

**Problem:** Every widget destructures the full Zustand store, causing re-renders on any mutation to any slice.

**Changes:**
- Convert all `const { x, y, z } = useKaivooStore()` patterns to individual selectors
- Target files: `TodayActivityWidget.tsx`, `TasksWidget.tsx`, `DailyBriefWidget.tsx`, `AIInboxWidget.tsx`
- Audit remaining consumers for the same pattern

**Status:** PENDING

---

#### P6: TasksWidget Decomposition (PERF-04)
**Owner:** Agent 2
**Priority:** P1

**Problem:** `TasksWidget.tsx` is 1,069 lines.

**Changes:** Decompose into:
- `TasksWidget.tsx` (~200 lines) — orchestrator
- `TaskFilterBar.tsx` (~150 lines) — search + sort + filter UI
- `TaskSection.tsx` (~150 lines) — collapsible section container
- `SortableTaskRow.tsx` — extract if not already standalone + wrap in `React.memo`

**Files:** `daily-flow/src/components/widgets/TasksWidget.tsx` → split into `tasks/` subfolder

**Status:** PENDING

---

#### P7: Service Layer Typing (CODE-01)
**Owner:** Agent 2
**Priority:** P1

**Problem:** 17 instances of `any` across 8 files.

**Changes:**
- Replace all `row: any` with `row: Tables<'table_name'>` in service converters
- Type all `dbUpdates` objects
- Type remaining `any` in `useDatabase.ts` and `useKaivooActions.ts`

**Files:** `src/services/*.ts`, `src/hooks/useDatabase.ts`, `src/hooks/useKaivooActions.ts`

**Status:** PENDING

---

#### P8: React Query — Adopt or Remove (CODE-04)
**Owner:** Agent 2
**Priority:** P1

**Decision:** Evaluate during sprint. Remove if migration > 1 day; adopt if feasible.

**Status:** PENDING

---

#### P9: Unstable useMemo Fix (PERF-05)
**Owner:** Agent 2
**Priority:** P2

**Changes:**
- Replace `new Date()` useMemo dependencies with stable string in `DailyBriefWidget.tsx`

**Status:** PENDING

---

#### P10: Extract Shared Config + Utils (CODE-02, CODE-03)
**Owner:** Agent 2
**Priority:** P2

**Changes:**
- Create `src/lib/task-config.ts` with shared `statusConfig` and `priorityConfig`
- Consolidate `getTodayString()` duplicates into `src/lib/dateUtils.ts`

**Status:** PENDING

---

#### P11: useEffect Cleanup Gaps (CODE-05)
**Owner:** Agent 2
**Priority:** P2

**Changes:**
- `useWidgetSettings.ts`: Clear debounced setTimeout on unmount
- `useAIActionLog.ts`: Add AbortController to fetchLogs
- `useAISettings.ts`: Add cleanup on unmount

**Status:** PENDING

---

### Track 3: Test Expansion

#### P12: Service Layer Mock Tests
**Owner:** Agent 10
**Priority:** P1

**Changes:**
- Create Supabase client mock
- Test all fetch functions verify `user_id` filtering
- Test error handling

**Status:** PENDING

---

#### P13: Store Integration Tests
**Owner:** Agent 10
**Priority:** P1

**Changes:**
- Test optimistic update + rollback pattern
- Test surgical store mutation

**Status:** PENDING

---

#### P14: Widget Render Tests
**Owner:** Agent 10
**Priority:** P2

**Changes:**
- Smoke-test TodayDashboard, TasksWidget, TrackingWidget, DailyBriefWidget

**Status:** PENDING

---

### Track 4: Quality Gates

#### P15: Agent 11 Feature Integrity Check
**Owner:** Agent 11
**Priority:** Gate

Run full Today Page Feature Use Case Bible checklist. Verify all widgets intact after decomposition and selector migration.

**Status:** PENDING

---

#### P16: Agent 7 Code Audit
**Owner:** Agent 7
**Priority:** Gate

Full code audit of Sprint 5 changes. Focus: decomposition correctness, selector completeness, type safety, CI config.

**Status:** PENDING

---

## Dependencies

```
Track 1 (Pipeline):
  P1 (GitHub remote) ──→ P2 (Netlify Git) ──→ P3 (CI Actions)

Track 2 (Code Quality):
  P4-P11 ──→ P15 (Agent 11) + P16 (Agent 7)

Track 3 (Tests):
  P7 ──→ P12 (Service tests)
  P5 ──→ P13 (Store tests)
  P6 ──→ P14 (Widget tests)
```

---

## Definition of Done

```
Pipeline:
  □ GitHub remote configured and all history pushed
  □ Netlify auto-deploys from main branch pushes
  □ CI runs tsc + tests + build on every push/PR
  □ Sprint branch pushes trigger CI

Code Quality:
  □ All 4 Sprint 4 P2 items resolved
  □ All widget components use Zustand selectors
  □ TasksWidget decomposed into <300-line files
  □ 0 instances of `any` in service layer
  □ React Query either fully adopted or fully removed
  □ useMemo dependencies are stable
  □ Shared config extracted
  □ All useEffect hooks have proper cleanup

Testing:
  □ Service layer tests verify user_id filtering
  □ Store tests verify optimistic update + rollback
  □ Widget render smoke tests pass
  □ 40% line coverage on src/lib/
  □ npm run test passes with meaningful test count

Sprint-Level:
  □ tsc --noEmit passes (0 errors)
  □ vite build succeeds
  □ All tests pass in CI
  □ Agent 11 regression check passes
  □ Agent 7 code audit passes (no P0s)
  □ User reviews running app
  □ Sprint branch merged to main
  □ Merge to main triggers successful Netlify deploy
  □ Main tagged as post-sprint-5
  □ Sprint retrospective added
  □ Vision.md updated
```

---

## Deferred to Sprint 6+

- Design System migration (Kaivoo palette, components)
- Task recurrence system
- Search & file attachments
- Notifications & reminders
- PWA support
- Data import tools (Notion, Obsidian)
- Electron vs Tauri evaluation (Phase 2)
- Remaining 7 Feature Bibles
- CODE-06-08 (localStorage pattern, hook naming, AIInboxWidget split)
- SEC-06 (CSP headers)

---

*Sprint 5 — Created February 23, 2026*
*Compiled by the Director*
