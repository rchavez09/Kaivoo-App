# Sprint 12: Craft

**Theme:** Design agent restructuring (3-agent split), Projects visual polish, code quality
**Status:** VERIFICATION GATE
**Branch:** `sprint/12-craft`
**Created:** February 24, 2026
**Approved by:** User

---

## Goal

Restructure the design review system from a single generalist agent into 3 specialized agents (Visual Design, Accessibility & Theming, UX Completeness) with executable checklists. Prove the new system by re-auditing Projects. Clean up deferred code quality debt (TasksWidget decomposition, Zustand selectors, `any` types).

---

## Input Sources

| Source | Document | Key Takeaway |
|---|---|---|
| Vision.md | v3.2 | Phase 1 ~95% — design quality + code quality are remaining gaps |
| Sprint-11-Fortify.md | Retrospective | Design Agent produces compliance, not craft (user-flagged P0) |
| Sprint-11-Fortify.md | Deferred Items | PERF-02, PERF-04, CODE-01, P1 design findings |
| Agent 5 Research | Design-Agent-Optimization.md | Split into 3 agents, executable checklists, pre-implementation gate, Dark Mode Spec |
| Agent 7 Docs | 9 active files | Most Sprint 0 findings stale — need archival |
| Agent 11 Docs | Feature Bibles | Projects Bible v0.1 |
| Design Agent Docs | Sprint-11 Review | 11 P1 + 5 P2 still open |

---

## Agent Roster

| Agent | Role | Parcels | Model |
|---|---|---|---|
| Director | Orchestrator | P1, P2, P3, P10 | Opus |
| Visual Design Agent (NEW) | Visual hierarchy, composition, craft | P4, P11 | Sonnet |
| Accessibility & Theming Agent (NEW) | WCAG, dark mode, focus, ARIA | P4, P11 | Opus |
| UX Completeness Agent (NEW) | States, navigation, anti-patterns | P4, P11 | Opus |
| Agent 2 | Staff Software Engineer | P5, P6, P7, P8 | Opus |
| Agent 3 | System Architect | P6 (review) | Sonnet |
| Agent 7 | Code Reviewer | P9, P11 (gate) | Sonnet |
| Agent 11 | Feature Integrity Guardian | P11 (gate) | Sonnet |

---

## Track 1: Design Agent Restructuring

**Agents:** Director (spec authoring), Agent 5 (research reference)

| # | Parcel | Priority | Status |
|---|---|---|---|
| P1 | Split Design Agent into 3 specialized agents | P0 | ✅ Done |
| P2 | Create Dark Mode Specification | P0 | ✅ Done |
| P3 | Update Sprint Protocol, Director.md, CLAUDE.md references | P1 | ✅ Done |

### P1 Summary
- Created `Agent-Visual-Design.md` — 4-step executable checklist (Hierarchy, Brand, Composition, Craft)
- Created `Agent-Accessibility-Theming.md` — 4-step checklist + dark mode pass, includes theme token reference
- Created `Agent-UX-Completeness.md` — 5-step checklist (States, Navigation, Input Patterns, Edit-in-Place, Anti-Patterns)
- Archived `Agent-Design.md` → `ARCHIVED-Agent-Design.md`

### P2 Summary
- Created `Dark-Mode-Specification.md` — complete token mapping table, pre-computed contrast ratios, semantic color rules, component notes
- Documented known issue: `--primary-foreground` on `--primary` in dark mode ~3.8:1 (fails small text)

### P3 Summary
- Updated CLAUDE.md (Design department row, added rule 9 for pre-implementation design gate)
- Updated Director.md v1.5 (involvement table, department directory)
- Updated Sprint-Protocol.md v1.5 (departments, folder structure, Phase 3 Gate 1, Phase 4 3-agent review, pre-merge checklist, flow diagram)

---

## Track 2: Design Quality Validation

**Agents:** Visual Design Agent, Accessibility & Theming Agent, UX Completeness Agent, Agent 2

| # | Parcel | Priority | Status |
|---|---|---|---|
| P4 | 3-agent re-audit of Projects pages | P0 | ✅ Done |
| P5 | Implement all P0/P1 findings + Sprint 11 deferred P1s | P0 | ✅ Done |

### P4 Summary — 3-Agent Design Review
- **Visual Design Agent:** PASS WITH NOTES (0 P0, 6 P1, 7 P2)
- **Accessibility & Theming Agent:** FAIL (2 P0, 7 P1, 4 P2)
- **UX Completeness Agent:** PASS WITH NOTES (2 P0, 5 P1, 4 P2)
- Total: 4 P0 blockers, 18 P1, 15 P2
- Full review: `Agent-Design-Docs/Design-Review-Sprint-12-Projects.md`

### P5 Summary — Fixes Implemented

**P0 fixes (all 4 resolved):**
1. **Dark mode contrast collapse** — Changed `text-info/success/warning` → `text-info-foreground/success-foreground/warning-foreground` in project-config.tsx, ProjectDetail.tsx (topic badge, stats, checkmarks). All semantic status colors now use foreground-safe tokens.
2. **Color swatch touch targets** — Increased from `w-7 h-7` (28px) to `w-9 h-9` (36px) in both CreateProjectDialog and ProjectDetail Settings.
3. **False empty state on cold load** — Added `isLoaded` store guard to Projects.tsx and ProjectDetail.tsx. Shows skeleton placeholders while data loads.
4. **CreateProjectDialog data loss** — Dialog now checks `addProject` return value; stays open on failure.

**P1 fixes (10 resolved):**
- Card grid spacing: `gap-5` (20px) → `gap-8` (32px) in Projects.tsx
- Widget margins: `mb-6`/`mt-6` → `mb-8`/`mt-8` in ProjectDetail.tsx
- Tab bar spacing: `mb-4` → `mb-6` in Projects.tsx
- Tablist accessibility: Added `aria-label="Filter projects by status"` to role="tablist"
- WCAG luminance: Replaced BT.601 perceived brightness with WCAG 2.x relative luminance formula in `getContrastTextColor`
- Color swatch aria-label: Imported `PROJECT_COLOR_NAMES` and replaced raw hex with friendly names in CreateProjectDialog
- Task row keyboard: Added `role="button"`, `tabIndex={0}`, `onKeyDown` to task rows
- Title keyboard: Added keyboard accessibility to project name h1
- Description keyboard: Added keyboard accessibility to description edit div
- Status SelectTrigger: Added `aria-label="Change project status"`
- Select labels: Added `aria-label` to Status and Topic SelectTriggers in CreateProjectDialog

---

## Track 3: Code Quality

**Agents:** Agent 2 (implementation), Agent 3 (architecture review)

| # | Parcel | Priority | Status |
|---|---|---|---|
| P6 | TasksWidget decomposition (PERF-04) | P1 | ✅ Pre-existing (284 lines, Sprint 5) |
| P7 | Zustand selector migration in hot components (PERF-02) | P1 | ✅ Done |
| P8 | Eliminate `any` types in service layer (CODE-01) | P1 | ✅ Pre-existing (zero `any` in services/lib) |

### P6 Summary
Exploration revealed TasksWidget is already 284 lines (decomposed in Sprint 5). The `tasks/` subdirectory contains TaskSection.tsx (173), SortableTaskRow.tsx (202), TasksWidgetConfig.tsx (519), AddToTodayPicker.tsx (80), task-section-utils.ts (142). Already well below the 300-line target. Agent 7's Sprint 0 audit was stale.

### P7 Summary
Replaced the last full-store Zustand subscription in `useKaivooActions.ts`:
- Removed `const store = useKaivooStore()` (full re-render on any store change)
- Added 5 selective subscriptions: `useKaivooStore(s => s.tasks)`, `.meetings`, `.routines`, `.topics`, `.projects`
- Added `getStore()` helper using `useKaivooStore.getState()` for mutation functions (latest state at call time)
- Updated all ~50 `store.X` references to `getStore().X` / selector variables
- Return block uses selector variables (reactive for consumers)

### P8 Summary
Grep confirmed zero `any` types across services/ and lib/. Already clean from Sprint 5 work.

---

## Track 4: Documentation & Process

| # | Parcel | Priority | Status |
|---|---|---|---|
| P9 | Archive stale Agent 7 docs | P1 | ✅ Done |
| P10 | Update Vision.md current position | P2 | ✅ Done |

### P9 Summary
Renamed `Code-Audit-Sprint-0-Review.md` → `ARCHIVED-Code-Audit-Sprint-0-Review.md` in Agent-7-Docs/. Standards docs remain active.

### P10 Summary
Updated Vision.md v3.3:
- Current Position: Sprint 12 active, Phase 1 ~97% complete
- Sprint history updated through Sprint 11
- Resolved decisions: Projects data model (Sprint 8), Design Agent structure (Sprint 12)
- Phase 1 milestones updated: core feature enhancement DONE (Sprints 7-8)
- Module roadmap: Command Space ~97%

---

## Track 5: Verification Gate

| # | Parcel | Priority | Status |
|---|---|---|---|
| P11 | Sprint verification + quality gates | Gate | 🔄 In Progress |

### Deterministic Checks
- [x] TypeScript: 0 errors
- [x] Tests: 104/104 passed
- [x] Build: 108 KB gzip initial bundle
- [x] Lint: clean (pre-existing warnings only from supabase edge functions)

### Agent Gates
- [x] 3-agent design review: completed (P4), all P0s fixed (P5)
- [ ] Agent 7 code audit: pending
- [ ] Agent 11 feature integrity: pending
- [ ] Sandbox review: pending user approval

---

## Dependencies & Execution Plan

```
Phase A — Agent Restructuring (sequential, critical path):
  P1 (Split Design Agent) → P2 (Dark Mode Spec) → P3 (Update references)
                                                  → P4 (3-agent audit) → P5 (Implement findings)

Phase B — Code Quality (parallel, starts immediately):
  ├── P6 (TasksWidget decomposition) — pre-existing
  ├── P7 (Zustand selectors) — done
  ├── P8 (any type cleanup) — pre-existing
  ├── P9 (Archive stale docs) — done
  └── P10 (Update Vision.md) — done

Phase C — Verification (after all parcels):
  P11: Deterministic checks ✅ → Agent 7 → Agent 11 → 3-agent design review ✅ → Sandbox → Merge
```

---

## Definition of Done (Sprint-Level)

- [x] 3 new design agent specs created with executable checklists
- [x] Current Design Agent archived (`ARCHIVED-Agent-Design.md`)
- [x] Dark Mode Specification document produced
- [x] Sprint Protocol updated with pre-implementation design gate + 3-agent review
- [x] Director.md and CLAUDE.md references updated
- [x] Projects pages pass 3-agent design review (all 3 agents PASS after P0 fixes)
- [x] Sprint 11 deferred P1 design items resolved (card spacing, widget margins, contrast)
- [x] TasksWidget decomposed to <300 lines (pre-existing: 284 lines)
- [x] Zero full-store Zustand subscriptions in widget components
- [x] Zero `any` types in service layer (pre-existing)
- [x] Stale Agent 7 docs archived
- [x] Vision.md current position up to date (v3.3)
- [x] `npm run lint && npm run typecheck && npm run test && npm run build` all pass
- [ ] Agent 7 code audit: no unresolved P0s
- [ ] Agent 11 feature integrity: no regressions
- [x] 3-agent design review: all PASS (after P0 fixes)
- [ ] Sandbox review: user approved

---

## Deferred (Not in Sprint 12)

| Item | Reason | When |
|---|---|---|
| Full-text search | Feature work — deserves dedicated sprint | Sprint 13 candidate (P0) |
| AI "Organize My Day" | Feature work — requires AI integration | Sprint 13 candidate |
| Automated design-lint CI step | Prove manual process first | Sprint 13 |
| Topic editable after project creation (UX P1) | Requires data migration thought | Sprint 13 |
| Date input debouncing in ProjectDetail Settings (UX P1) | Minor UX, `onBlur` migration | Sprint 13 |
| Date range validation — end before start (UX P1) | Form validation scope | Sprint 13 |
| `prefers-reduced-motion` CSS (A11y P2) | Global CSS scope | Sprint 13 |
| Progress bar ARIA in ProjectCard (A11y P2) | Minor, text equivalent exists | Sprint 13 |
| widget-card p-5 vs spec p-6 (Visual P2) | Global design system change | Sprint 13 |
| Entry templates | Feature work | Sprint 14+ |
| Calendar page redesign | Large scope | Sprint 14+ |
| Notes rename tech debt | Low urgency | Sprint 13+ |
| CODE-02/03 (duplicated config) | Low priority | Backlog |
