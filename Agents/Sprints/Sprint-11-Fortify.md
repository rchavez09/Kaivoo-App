# Sprint 11: Fortify

**Theme:** Security hardening, performance optimization, database indexing, Projects UX polish
**Status:** COMPLETE
**Branch:** `sprint/11-fortify`
**Created:** February 24, 2026
**Approved by:** User

---

## Goal

Make Kaivoo production-grade — fix all P0 security and performance findings from Agent 7's audit, add defense-in-depth to the service layer, halve the bundle size, index the database, and polish the Projects UX with a Design Agent-led review.

---

## Input Sources

| Source | Document | Key Takeaway |
|---|---|---|
| Vision.md | v3.2 | Phase 1 ~95% — security/perf gaps block "ship-ready" status |
| Sprint-10-Stabilize.md | Retrospective | Data integrity fixed, Design Agent gate mandatory, stabilization sprints are valuable |
| Agent 7 Code Audit | `Agent-7-Docs/Code-Audit-Sprint-10-Review.md` | 3 P0 security, 2 P0 performance, 6 high-priority findings |
| Agent 11 Feature Bible | `Agent-11-Docs/Feature-Bible-Index.md` | Projects Page Bible missing — blocks further Projects work |
| Agent 12 | Supabase advisors | RLS optimized, but service layer has no defense-in-depth |
| Sprint 10 Deferred | Sprint file §Deferred | Projects UX overhaul, topic_id validation, test expansion |

---

## Agent Roster

| Agent | Role | Parcels | Model |
|---|---|---|---|
| Agent 2 | Staff Software Engineer | P1, P2, P3, P4, P5, P6, P10 | Opus |
| Agent 3 | System Architect | P5 (review), P7 (review) | Sonnet |
| Agent 4 | Security & Reliability | P1-P4 (review) | Sonnet |
| Agent 7 | Code Reviewer | P12 (gate) | Sonnet |
| Agent 11 | Feature Integrity Guardian | P11, P12 (gate) | Sonnet |
| Agent 12 | Data Engineer | P1-P2 (DB layer), P7, P8 | Sonnet |
| Design Agent | Lead Designer | P9, P10 (specs), P12 (gate) | Sonnet |

---

## Track 1: Security Hardening

**Agents:** Agent 2 (implementation), Agent 4 (review), Agent 12 (database layer)

| # | Parcel | Priority | Status |
|---|---|---|---|
| P1 | SEC-01: Add `user_id` filters to all service queries | P0 | ✅ Pre-existing (verified) |
| P2 | SEC-02: Add ownership checks to update/delete | P0 | ✅ Pre-existing (verified) |
| P3 | SEC-03: Optimistic update rollback | P0 | ✅ Pre-existing (verified) |
| P4 | SEC-04: Error message sanitization | P1 | ✅ Done (2 leaks fixed) |

### P1: SEC-01 — Add `user_id` filters to all service queries

**Description:** Every fetch function in the service layer must include `.eq('user_id', userId)` in the Supabase query. Defense-in-depth — RLS is the primary gate, but service-layer filtering prevents leaks if RLS is ever misconfigured.

**Definition of Done:**
- All service fetch functions (tasks, journal_entries, captures, meetings, topics, routines, routine_completions, topic_pages, projects) include `user_id` filter
- Verified by grep: zero fetch calls without `user_id`

### P2: SEC-02 — Add ownership checks to update/delete

**Description:** Every update/delete function must filter by both `id` AND `user_id`. Prevents UUID-guessing attacks even if RLS fails.

**Definition of Done:**
- All service mutator functions include `.eq('user_id', userId)` alongside `.eq('id', id)`
- Verified by grep

### P3: SEC-03 — Optimistic update rollback

**Description:** When a Supabase write fails, roll back the optimistic Zustand state change. Currently UI diverges from DB silently on failure.

**Definition of Done:**
- All optimistic updates in `useKaivooActions.ts` have try/catch with rollback
- On error: (1) revert store state, (2) show user-facing toast
- Unit tests for at least 3 rollback scenarios

### P4: SEC-04 — Error message sanitization

**Description:** Raw Supabase/Postgres errors must never reach the UI. Replace with user-friendly messages.

**Definition of Done:**
- All `catch` blocks in service layer and actions map errors to generic messages
- No database column names, RLS policy names, or stack traces visible in UI

---

## Track 2: Performance Optimization

**Agents:** Agent 2 (implementation), Agent 3 (architecture review)

| # | Parcel | Priority | Status |
|---|---|---|---|
| P5 | PERF-01: Route-level code splitting | P0 | ✅ Pre-existing (108 KB gzip) |
| P6 | PERF-03: Surgical store updates (remove full reload) | P0 | ✅ Pre-existing (React Query) |

### P5: PERF-01 — Route-level code splitting

**Description:** Wrap all page routes in `React.lazy()` with `Suspense` fallback. Configure Vite manual chunks for heavy deps (recharts, tiptap, radix). Target: ≤250 KB gzipped initial bundle.

**Definition of Done:**
- All page-level routes lazy-loaded
- Vite `manualChunks` config splits recharts, tiptap, and radix into separate chunks
- Initial bundle ≤250 KB gzipped (verified via `npm run build` output)

### P6: PERF-03 — Surgical store updates (remove full reload)

**Description:** Replace `reload()` calls after creates with surgical Zustand store inserts. Creating a task should NOT re-fetch all 11 tables.

**Definition of Done:**
- All `add*` functions in actions return the created record and insert it into the store directly
- `reload()` removed from all create paths
- Only used on initial app load + manual refresh

---

## Track 3: Database Optimization

**Agents:** Agent 12 (migrations), Agent 3 (review)

| # | Parcel | Priority | Status |
|---|---|---|---|
| P7 | DB-01: Add missing database indexes | P1 | ✅ Pre-existing (20+ indexes) |
| P8 | DB-02: Bound routine_completions query | P1 | ✅ Pre-existing (90-day cutoff) |

### P7: DB-01 — Add missing database indexes

**Description:** Create indexes for all primary query patterns. Currently only 1 index exists across 15 tables.

**Definition of Done:**
- Indexes created via Supabase migration for: `tasks(user_id, created_at)`, `tasks(user_id, status)`, `tasks(project_id)`, `journal_entries(user_id, timestamp)`, `captures(user_id, date)`, `meetings(user_id, start_time)`, `topics(user_id)`, `routines(user_id)`, `routine_completions(routine_id, completed_at)`, `projects(user_id, status)`, `topic_pages(topic_id)`
- Verified via `pg_indexes` query

### P8: DB-02 — Bound routine_completions query

**Description:** Add date filter to routine_completions fetch — currently loads ALL completions ever.

**Definition of Done:**
- Fetch limited to last 90 days via `.gte('completed_at', cutoff)`
- Verified: query returns bounded result set

---

## Track 4: Projects UX Polish

**Agents:** Design Agent (audit + specs), Agent 2 (implementation)

| # | Parcel | Priority | Status |
|---|---|---|---|
| P9 | Design Agent: Projects UX audit | P1 | ✅ Done (8 P0, 11 P1, 5 P2) |
| P10 | Projects UX fixes | P1 | ✅ Done (all 8 P0s fixed) |

### P9: Design Agent — Projects UX audit

**Description:** Design Agent runs 5-step review on Projects page + Project Detail page + Timeline view. Produces actionable findings with fixes. Dark mode pass included.

**Definition of Done:**
- Design review document produced
- All P0 issues identified
- Covers: calendar/date picker UX, color coding, dark mode contrast, card layout, Timeline readability

### P10: Projects UX fixes

**Description:** Implement Design Agent P0/P1 findings from P9. Scope limited to CSS/component fixes — no new data models.

**Definition of Done:**
- All Design Agent P0 findings resolved
- Dark mode contrast passes WCAG AA (4.5:1)
- Date picker usable
- Project cards follow Kaivoo Design System (widget-card pattern, 16px radius, Mist border)

---

## Track 5: Quality & Documentation

**Agents:** Agent 11 (Feature Bible), Agent 7 (final audit)

| # | Parcel | Priority | Status |
|---|---|---|---|
| P11 | Projects Page Feature Bible | P1 | ✅ Done (v0.1, 81 must-never-lose items) |
| P12 | Sprint verification + Agent 7 audit | Gate | ✅ Done |

### P11: Projects Page Feature Bible

**Description:** Agent 11 documents the Projects page, Project Detail page, and Timeline view in the Feature Use Case Bible. Required before any further Projects development.

**Definition of Done:**
- `Feature-Bible-Projects-Page.md` created in `Agent-11-Docs/`
- Covers: project CRUD, status transitions, task linking, timeline navigation, color coding, project detail view
- Feature Bible Index updated

### P12: Sprint verification + Agent 7 audit

**Description:** Full verification gate per Sprint Protocol v1.4.

**Definition of Done:**
- `npm run lint && npm run typecheck && npm run test && npm run build` all pass
- Agent 7 code audit: no unresolved P0s
- Agent 11 feature integrity: no regressions across all 10 pages
- Design Agent review: PASS (including dark mode)
- Sandbox review: user approved

---

## Dependencies

```
P9 (Design audit) → P10 (UX fixes)         [Design must finish before implementation]
P1-P4 (Security)  → P12 (Verification)      [All security work before final audit]
P5-P6 (Perf)      → P12 (Verification)      [All perf work before final audit]
P7-P8 (Database)  ║ independent              [Can run in parallel with everything]
P11 (Bible)       ║ independent              [Can run in parallel with everything]
```

## Parallel Execution Plan

```
Phase A (parallel):
  ├── Track 1: P1 → P2 → P3 → P4  (Security — sequential, each builds on previous)
  ├── Track 2: P5 ∥ P6             (Performance — independent of each other)
  ├── Track 3: P7 ∥ P8             (Database — independent of each other)
  ├── Track 4: P9                   (Design audit — runs first)
  └── Track 5: P11                  (Feature Bible — independent)

Phase B (after Phase A):
  └── Track 4: P10                  (UX fixes — depends on P9)

Phase C (after all parcels):
  └── P12: Deterministic checks → Agent 7 → Agent 11 → Design review → Sandbox → Merge
```

---

## Definition of Done (Sprint-Level)

- [x] All P0 security findings (SEC-01, SEC-02, SEC-03) resolved — pre-existing
- [x] All P0 performance findings (PERF-01, PERF-03) resolved — pre-existing
- [x] Database indexes created for all primary query patterns — pre-existing (20+)
- [x] Routine completions query bounded to 90 days — pre-existing
- [x] Error messages sanitized — no raw DB errors in UI
- [x] Projects UX passes Design Agent review (including dark mode) — P0s fixed, P1/P2 deferred to Sprint 12
- [x] Projects Page Feature Bible complete — v0.1, 81 items
- [x] `npm run lint && npm run typecheck && npm run test && npm run build` all pass
- [x] Initial bundle ≤250 KB gzipped — 108 KB
- [x] Agent 7 code audit: no unresolved P0s — pre-existing findings verified
- [x] Agent 11 feature integrity: no regressions
- [x] Sandbox review: user approved

---

## Deferred (Not in Sprint 11)

| Item | Reason |
|---|---|
| Full-text search | Feature work — fix foundations first |
| AI "Organize My Day" | Feature work — requires AI integration patterns |
| Entry templates | Feature work |
| Calendar page redesign | Feature work — large scope |
| PERF-02 (Zustand selectors) | Medium priority — defer to Sprint 12 |
| PERF-04 (TasksWidget decomposition) | Medium priority — defer to Sprint 12 |
| CODE-01 (any types) | Medium priority — defer to Sprint 12 |
| CODE-02/03 (duplicated config) | Low priority |
| Hub Server / Concierge / Workshop | Phase 2-4 — not Phase 1 scope |
| SaaS tier implementation | Business decision — not engineering sprint |

---

## Sprint Retrospective

- **Completed:** February 24, 2026
- **Parcels completed:** 12/12 (7 verified pre-existing, 5 executed)
- **What was delivered:**
  - Error message sanitization — no raw Supabase/Postgres errors reach the UI (P4)
  - Design Agent Projects UX audit — 8 P0, 11 P1, 5 P2 findings documented (P9)
  - All 8 P0 design fixes implemented — accessible ProjectCard, ARIA tabs, sticky timeline labels, contrast-aware bar text, inline edit affordance, dark mode CSS variables (P10)
  - Projects Page Feature Bible — 81 must-never-lose items across 6 feature surfaces (P11)
  - Verified: service-layer user_id filtering, ownership checks, optimistic rollback, code splitting, React Query invalidation, 20+ database indexes, bounded routine queries — all pre-existing from earlier sprints (P1-P3, P5-P8)
- **Verification results:**
  - TypeScript: 0 errors
  - Tests: 104/104 passed
  - Build: 108 KB gzip initial bundle (target was ≤250 KB)
  - Lint: clean (pre-existing warnings only)
  - Agent 7 audit: pre-existing findings verified resolved
  - Agent 11 Feature Bible: complete (v0.1)
  - Design Agent review: P0s fixed, P1/P2 deferred
- **Key learnings:**
  1. **Agent 7 audit docs were stale.** The Sprint 10 code audit flagged issues already fixed in Sprints 8-10. Saved significant time by verifying actual code before implementing. **Action:** Archive stale audit docs; re-audit from source each sprint.
  2. **Design Agent produces compliance findings, not design craft.** The 5-step review caught accessibility and CSS issues but missed composition, rhythm, and visual quality. The Projects UI is *correct* but not *polished*. **Action:** Rewrite Design Agent spec for Sprint 12 — add design craft evaluation step.
  3. **Slim sprints work.** When discovery reveals most work is pre-existing, pivoting to a focused scope is better than padding with unnecessary work.

### Deferred to Sprint 12
- Design Agent spec rewrite (design craft, not just compliance)
- Projects UI visual polish (re-audit with improved Design Agent)
- P1 design findings (date validation, grid layout, delete button style, timeline empty state)
- PERF-02 (Zustand selectors), PERF-04 (TasksWidget decomposition), CODE-01 (any types)
