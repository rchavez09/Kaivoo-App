# Sprint 15: Refine — UX Polish, Accessibility & Performance

**Status:** In Progress
**Created:** February 25, 2026
**Branch:** `sprint/15-refine`
**Theme:** Refine — Address remaining UX gaps, accessibility violations, and performance issues identified by agent audits. Clean up the foundation before adding new features.

---

## Goal

Ship a tighter, more polished app by fixing the remaining issues flagged across Sprint 12-14 agent audits, plus user-reported UX gaps. No new features — this sprint hardens what exists.

---

## Vision Alignment

- **Phase:** 1 — Cloud Command Center (~97% → ~98% complete)
- **Milestone:** Foundation hardening before Phase 1 feature completion
- **Impact:** Better accessibility (WCAG AA compliance), improved UX consistency, reduced bundle size, cleaner codebase

---

## Audit Summary

Before planning, all agent docs were scanned and findings were verified against the current codebase. **Most P0/P1 issues from Sprint 12 Design Review were already fixed in Sprints 13-14:**

| Issue | Status |
|---|---|
| Dark mode contrast tokens | FIXED (Sprint 13) |
| Loading guard / false empty state | FIXED |
| Filtered tab counts | FIXED |
| Date input performance | FIXED |
| ARIA labels on tabs | FIXED |
| Task row keyboard accessibility | FIXED |
| Click-to-edit keyboard accessibility | FIXED |
| Widget-card padding (p-5 → p-6) | FIXED |
| Grid gap (gap-5 → gap-8) | FIXED |

**Remaining issues form the scope of this sprint.**

---

## Parcels

### Track 1: UX Fixes

#### P1 — Notes Page Padding
**Agent:** Agent 2 (Software Engineer)
**Status:** Pending
**Source:** User-reported

**Problem:** The Notes page (JournalPage.tsx) lacks the outer padding that all other pages have. Content feels like it runs into the edges of the screen. Tasks, Topics, and Projects all use `px-6 py-8` wrapper pattern; Notes uses a different `flex h-full` layout with padding only on inner sections.

**Scope:**
- Add consistent padding to the Notes page outer container
- Ensure the sidebar and editor area both have proper breathing room
- Match the visual rhythm of other pages without breaking the split-pane layout

**Definition of Done:**
- [ ] Notes page has consistent padding matching other pages
- [ ] Sidebar and editor don't feel cramped
- [ ] No horizontal scrollbar introduced
- [ ] Dark mode and responsive breakpoints verified

---

#### P2 — Touch Target Compliance
**Agent:** Agent 2 (Software Engineer)
**Status:** Pending
**Source:** Design Agent audit (Sprint 12)

**Problem:** Color swatch buttons in ProjectSettings and CreateProjectDialog are `w-9 h-9` (36px), below the WCAG 2.5.8 minimum of 44px.

**Scope:**
- Increase color swatch buttons to meet 44px minimum touch target
- Apply to both `ProjectSettings.tsx` (line ~68) and `CreateProjectDialog.tsx` (line ~272)
- Use padding wrapper approach if visual size should remain smaller

**Definition of Done:**
- [ ] Color swatches meet 44px minimum interactive target
- [ ] Visual appearance still fits the design
- [ ] Both components updated consistently

---

#### P3 — Kanban Project Badges
**Agent:** Agent 2 (Software Engineer)
**Status:** Pending
**Source:** Agent 11 Feature Integrity audit

**Problem:** Kanban task cards show topic badges and tags but NOT which project the task belongs to. Users can't tell project context without opening the task drawer.

**Scope:**
- Add project badge to Kanban task cards (KanbanBoard.tsx)
- Show project name/color when task has a projectId
- Badge should be visually distinct from topic badges (use project color dot or colored border)
- Also add to DragOverlay's TaskCard for consistency during drag

**Definition of Done:**
- [ ] Kanban cards show project context when task has a projectId
- [ ] DragOverlay card also shows project badge
- [ ] Badge is visually distinct from topic badges
- [ ] Doesn't clutter cards that have no project
- [ ] Dark mode verified

---

#### P4 — Projects Sort Options
**Agent:** Agent 2 (Software Engineer)
**Status:** Pending
**Source:** Agent 11 Feature Integrity audit

**Problem:** Projects page has no sort options. Fixed sort: status order, then updatedAt desc. Users can't sort by name, creation date, or progress.

**Scope:**
- Add sort dropdown to Projects page header (next to search)
- Sort options: Last Updated (default), Name A-Z, Name Z-A, Created (newest), Created (oldest), Progress %
- Persist sort preference to localStorage
- Sort applies within the active tab filter

**Definition of Done:**
- [ ] Sort dropdown visible on Projects page
- [ ] All sort options work correctly
- [ ] Sort preference persists across sessions
- [ ] Sort works with tab filtering and search
- [ ] Keyboard accessible

---

### Track 2: Performance

#### P5 — Bundle Size Audit & Quick Wins
**Agent:** Agent 2 (Software Engineer) + Agent 3 (Architect)
**Status:** Pending
**Source:** Agent 7 standards (200 KB target vs 555 KB actual)

**Current State:**
- Total gzipped: ~555 KB (all chunks)
- Initial load: ~194 KB gzipped (close to 200 KB target thanks to code splitting)
- Biggest chunk: `vendor-tiptap` at 136 KB gzipped (Notes page only)
- `vendor-recharts` at 47 KB gzipped (Insights page only)
- `glowing-effect` at 23 KB gzipped

**Scope:**
- Audit all vendor chunks and identify tree-shaking opportunities
- Ensure `vendor-tiptap` is lazy-loaded (only when Notes page is visited)
- Investigate `glowing-effect` (23 KB) — is it needed? Can it be lighter?
- Verify all pages use `React.lazy() + Suspense`
- Document findings and quick wins; defer large refactors if needed

**Definition of Done:**
- [ ] Bundle audit documented (what loads when, critical path identified)
- [ ] Any quick wins applied (tree-shaking, unnecessary imports)
- [ ] All page routes confirmed lazy-loaded
- [ ] Initial load stays under 200 KB gzipped
- [ ] No regressions

---

### Track 3: Housekeeping

#### P6 — Vision & Sprint File Updates
**Agent:** Director
**Status:** Pending

**Scope:**
- Update Vision.md "Current Position" section (still says Sprint 12 active)
- Update Sprint 14 file status from "In Progress" to "Complete"
- Add Sprint 14 retrospective if missing
- Update Next-Sprint-Planning.md for Sprint 16

**Definition of Done:**
- [ ] Vision.md reflects current state (Sprint 14 complete, Sprint 15 in progress)
- [ ] Sprint 14 file marked complete with retrospective
- [ ] Next-Sprint-Planning.md reset for Sprint 16

---

### Track 4: Quality

#### P7 — Design Gate: Pre-Implementation Review
**Agents:** Visual Design + Accessibility & Theming + UX Completeness
**Status:** Pending

**Scope:**
Design specs needed for:
- P1: Notes page padding — what padding values? How does sidebar spacing change?
- P3: Kanban project badge — visual spec (size, color, position on card)
- P4: Sort dropdown — visual spec (placement, dropdown style, icons)

**Definition of Done:**
- [ ] Visual Design: specs for P1, P3, P4
- [ ] Accessibility & Theming: token choices, focus states, dark mode for new elements
- [ ] UX Completeness: state inventory for sort (empty results, persisted state)

---

#### P8 — Quality Gates
**Agents:** Agent 7 + Agent 11 + 3 Design Agents
**Depends on:** P1-P6 complete
**Status:** Pending

**Scope:**
- Deterministic checks: `npm run lint && npm run typecheck && npm run test && npm run build`
- Agent 7 code audit (focus: accessibility, performance, component quality)
- Agent 11 feature integrity check (no regressions to any existing features)
- 3-agent design review (visual, accessibility, UX completeness)
- Sandbox review: user reviews running app on sprint branch

**Definition of Done:**
- [ ] All deterministic checks pass
- [ ] Agent 7: no unresolved P0s
- [ ] Agent 11: no regressions
- [ ] 3-agent design review: all PASS
- [ ] Sandbox: user approves

---

## Agent Assignments

| Agent | Parcels | Role |
|---|---|---|
| Agent 2 (Software Engineer) | P1, P2, P3, P4, P5 | All implementation |
| Agent 3 (Architect) | P5 | Bundle analysis, architectural recommendations |
| Visual Design Agent | P7, P8 | Component visual specs, post-implementation review |
| Accessibility & Theming Agent | P7, P8 | ARIA, focus, dark mode, post-implementation review |
| UX Completeness Agent | P7, P8 | States, navigation, patterns, post-implementation review |
| Agent 11 (Feature Integrity) | P8 | Regression check |
| Agent 7 (Code Reviewer) | P8 | Code audit |
| Director | P6 | Vision & sprint file updates |

## Dependencies

```
P7 (Design Gate) ──→ P1 (Notes Padding)
                 ──→ P3 (Kanban Badges)
                 ──→ P4 (Sort Options)

P2 (Touch Targets) — no design dependency (spec is clear: reach 44px)
P5 (Bundle Audit) — no design dependency (engineering analysis)
P6 (Housekeeping) — no dependency

P1, P2, P3, P4, P5, P6 ──→ P8 (Quality Gates)
```

## Sprint-Level Definition of Done

- [ ] Notes page has consistent padding (no edge-running content)
- [ ] Color swatches meet 44px touch target minimum
- [ ] Kanban cards show project context
- [ ] Projects page has sort dropdown (persisted preference)
- [ ] Bundle audit complete, quick wins applied, initial load ≤ 200 KB
- [ ] Vision.md and Sprint 14 file updated
- [ ] All deterministic checks pass (lint, typecheck, test, build)
- [ ] Agent 7 code audit: no unresolved P0s
- [ ] Agent 11 feature integrity: no regressions
- [ ] 3-agent design review: all PASS
- [ ] Sandbox: user approves running app on sprint branch

---

## Deferred to Sprint 16+

| Item | Category | Notes |
|---|---|---|
| Full-text search | Feature | High priority — deferred since Sprint 7 |
| AI "Organize My Day" | Feature | High priority — requires AI infrastructure |
| Calendar page redesign | Feature | Medium — large scope, own sprint |
| Entry templates | Feature | Medium |
| Automated design-lint CI step | DevOps | Medium |
| Notes rename tech debt (JournalEntry → NoteEntry) | Code Quality | Low |
| CODE-02/03 (duplicated config) | Code Quality | Low |
| Project Milestones on timeline | Feature | P2 from Agent 11 |
| Timeline task-level view | Feature | P2 from Agent 11 |
| Project duplication | Feature | P3 from Agent 11 |
| Dedicated Archive action | Feature | P3 from Agent 11 |

---

*Sprint 15: Refine — Proposed February 25, 2026*
*Sprint Protocol v1.5*
