# Sprint 13: Polish

**Theme:** Pure UX debt + code quality + accessibility cleanup
**Status:** COMPLETE
**Merged:** February 25, 2026
**Branch:** `sprint/13-polish`
**Created:** February 25, 2026
**Approved by:** User

---

## Goal

Pay down all accumulated P1/P2 debt from Sprints 11-12. Unify semantic color tokens, improve the project color picker, decompose oversized components, fix accessibility gaps, and add projects to the export/import flow. No new features — pure polish.

---

## Input Sources

| Source | Document | Key Takeaway |
|---|---|---|
| Vision.md | v3.3 | Phase 1 ~97% — polish and debt paydown before new features |
| Sprint-12-Craft.md | Retrospective | Top 3: color picker, token unification, ProjectDetail decomposition |
| Sprint-12-Craft.md | Deferred Items | 20 items, 3 High priority, ~10 Medium |
| Agent 7 Docs | 8 active docs | Standards stable; no new blockers |
| Agent 11 Docs | 6 active docs | Feature Bibles stable; Projects Q1-Q6 pending user review |
| Design Agent Docs | 9 active docs | Design system + dark mode spec stable |
| User input | Sprint 13 planning | Defer search; pure polish sprint; token unification approved |

---

## Agent Roster

| Agent | Role | Parcels | Model |
|---|---|---|---|
| Director | Orchestrator | Sprint creation, Vision update | Opus |
| Agent 2 | Staff Software Engineer | P1–P12 (all implementation) | Opus |
| Agent 3 | System Architect | P6 (architecture review) | Sonnet |
| Agent 7 | Code Reviewer | P14 (code audit gate) | Sonnet |
| Agent 11 | Feature Integrity Guardian | P15 (regression gate) | Sonnet |
| Visual Design Agent | Visual Designer | P2 Gate 1, P16 | Sonnet |
| Accessibility & Theming Agent | Accessibility Specialist | P1 verification, P2 Gate 1, P16 | Opus |
| UX Completeness Agent | UX Specialist | P2 Gate 1, P16 | Opus |

---

## Track 1: Token Unification

**Agents:** Agent 2 (implementation), Accessibility & Theming Agent (verification)

| # | Parcel | Priority | Status |
|---|---|---|---|
| P1 | Unify `text-info` → `text-info-foreground` codebase-wide | P0 | ⬜ Pending |

**Scope:** Replace all `text-info` with `text-info-foreground` across ~13 files (~22 occurrences). Audit for similar issues with `text-success`, `text-warning`, `text-destructive`. Leave `bg-info/*` usages unchanged (those are correct).

**Definition of Done:**
- Zero instances of `text-info` used as foreground text color
- Dark mode contrast verified for all changed elements
- Accessibility & Theming Agent confirms token correctness

---

## Track 2: UX Polish

**Agents:** Agent 2 (implementation), Design Agents (Gate 1 for P2), UX Completeness Agent (review)

| # | Parcel | Priority | Status |
|---|---|---|---|
| P2 | Project color palette — richer picker | P0 | ⬜ Pending |
| P3 | Topic editable after project creation | P1 | ⬜ Pending |
| P4 | Date range validation — end before start | P1 | ⬜ Pending |
| P5 | Date input debouncing (`onChange` → `onBlur`) | P1 | ⬜ Pending |

### P2 Details
Design Agents produce pre-implementation spec (Gate 1) before Agent 2 codes. More color options, custom hex input, better visual layout.

### P3 Details
Allow changing the associated topic in ProjectDetail Settings. May require data model consideration.

### P4 Details
Prevent end date before start date in ProjectDetail Settings and CreateProjectDialog. Show inline error.

### P5 Details
Migrate date inputs from `onChange` (saves on every keystroke) to `onBlur` (saves on focus loss).

**Definition of Done:**
- Color picker has expanded palette + custom hex input
- Topic can be changed on existing projects
- Invalid date ranges are blocked with user-visible feedback
- Date changes save on blur, not on every change

---

## Track 3: Code Quality

**Agents:** Agent 2 (implementation), Agent 3 (architecture review for P6), Agent 7 (code audit)

| # | Parcel | Priority | Status |
|---|---|---|---|
| P6 | ProjectDetail decomposition | P1 | ⬜ Pending |
| P7 | useKaivooActions cleanup | P2 | ⬜ Pending |
| P8 | Lift task stats out of ProjectCard | P2 | ⬜ Pending |

### P6 Details
Extract `ProjectSettings` and `ProjectTaskList` into separate components. Target: each file <300 lines. Currently 617 lines.

### P7 Details
Remove pass-through store reads from useKaivooActions that just re-export without transformation. Consumers should use selectors directly.

### P8 Details
ProjectCard currently fetches/computes its own task stats. Lift computation to parent (Projects page) and pass as props to reduce per-card overhead.

**Definition of Done:**
- ProjectDetail.tsx < 300 lines; extracted components are self-contained
- useKaivooActions exports only action functions, not raw state reads
- ProjectCard receives task stats as props, no internal data fetching

---

## Track 4: Accessibility

**Agents:** Agent 2 (implementation), Accessibility & Theming Agent (verification)

| # | Parcel | Priority | Status |
|---|---|---|---|
| P9 | `prefers-reduced-motion` CSS | P2 | ⬜ Pending |
| P10 | Progress bar ARIA in ProjectCard | P2 | ⬜ Pending |
| P11 | widget-card padding alignment (`p-5` → `p-6`) | P2 | ⬜ Pending |

**Definition of Done:**
- Animations respect `prefers-reduced-motion`
- Screen readers announce project progress percentage
- All widget cards use `p-6` padding consistently

---

## Track 5: Data Integrity

**Agents:** Agent 2 (implementation), Agent 11 (feature integrity)

| # | Parcel | Priority | Status |
|---|---|---|---|
| P12 | Projects in DataSettings export/import | P1 | ⬜ Pending |

**Definition of Done:**
- DataSettings export includes all project data
- DataSettings import restores projects with all fields intact
- Agent 11 verifies no existing export/import functionality regressed

---

## Track 6: Verification Gate

| # | Parcel | Priority | Status |
|---|---|---|---|
| P13 | Deterministic checks | Gate | ⬜ Pending |
| P14 | Agent 7 code audit | Gate | ⬜ Pending |
| P15 | Agent 11 feature integrity | Gate | ⬜ Pending |
| P16 | 3-agent design review | Gate | ⬜ Pending |
| P17 | Sandbox review | Gate | ⬜ Pending |

---

## Dependencies & Execution Plan

```
Phase A — Quick Wins (parallel, start immediately):
  ├── P1  (Token unification) — no dependencies
  ├── P4  (Date range validation) — no dependencies
  ├── P5  (Date input debouncing) — no dependencies
  ├── P9  (prefers-reduced-motion) — no dependencies
  ├── P10 (Progress bar ARIA) — no dependencies
  └── P11 (widget-card padding) — no dependencies

Phase B — Medium Items (parallel, start immediately):
  ├── P2  (Color picker) — needs Design Gate 1 first
  ├── P3  (Topic editable) — no dependencies
  ├── P6  (ProjectDetail decomposition) — no dependencies
  ├── P7  (useKaivooActions cleanup) — no dependencies
  ├── P8  (Task stats lift) — no dependencies
  └── P12 (Projects export/import) — no dependencies

Phase C — Verification (after all parcels):
  P13 → P14 → P15 → P16 → P17 → Merge to main → Deploy
```

---

## Definition of Done (Sprint-Level)

- [ ] Zero `text-info` used as foreground text color (token audit clean)
- [ ] Project color picker has expanded palette + custom hex input
- [ ] Topic changeable on existing projects
- [ ] Date range validation prevents invalid ranges
- [ ] Date inputs save on blur, not onChange
- [ ] ProjectDetail.tsx decomposed to <300 lines per file
- [ ] useKaivooActions exports only actions (no pass-through reads)
- [ ] ProjectCard receives stats as props
- [ ] `prefers-reduced-motion` respected globally
- [ ] Progress bar has ARIA attributes
- [ ] widget-card uses `p-6` padding
- [ ] Projects included in DataSettings export/import
- [ ] `npm run lint && npm run typecheck && npm run test && npm run build` all pass
- [ ] Agent 7 code audit: PASS (0 unresolved P0)
- [ ] Agent 11 feature integrity: PASS (0 regressions)
- [ ] 3-agent design review: all PASS (0 unresolved P0)
- [ ] Sandbox review: user approved

---

## Deferred (Not in Sprint 13)

| Item | Reason | When |
|---|---|---|
| Full-text search | User decision — defer until polish complete | Sprint 14+ |
| AI "Organize My Day" | Requires AI integration infrastructure | Sprint 15+ |
| Calendar page redesign | Large scope, deserves dedicated sprint | Sprint 14+ |
| Entry templates | Feature work | Sprint 14+ |
| Automated design-lint CI step | Prove 3-agent manual process further | Sprint 14+ |
| Notes rename tech debt (JournalEntry → NoteEntry) | Low urgency | Backlog |
| CODE-02/03 (duplicated config) | Low urgency | Backlog |