# Sprint 10: Stabilize — Sprint Contract

**Status:** COMPLETE
**Theme:** Stabilize — Data integrity repair, Notes page bug fixes, feature health audit, process hardening
**Branch:** `sprint/10-stabilize`
**Director:** Active
**Date:** February 24, 2026
**Vision Position:** Phase 1 — Cloud Command Center (quality hardening, no new features)

---

## Context

After 9 sprints of feature development, the product needs a stabilization pass. Three categories of issues surfaced:

1. **Data corruption from Supabase migration.** The user migrated to a new Supabase instance independently. The `topics` table was recreated with new UUIDs, but `topic_ids` arrays in captures (5), tasks (43), and journal_entries (11) still reference 14 old UUIDs from the previous instance. **Zero matches** — every topic reference is orphaned. The Topics page shows "0 Captures 0 Tasks" for all topics because no items resolve to current topic IDs.

2. **Notes page bugs from Sprint 8.** The split-to-new-entry feature, collapse system, and navigation state have compounding issues: split creates duplicate clips when entries are collapsed, can delete adjacent entries, and navigating away/back destroys the latest note and un-collapses everything.

3. **Process gap — Design Agent not enforced.** Sprint 9 listed Design Agent as "pre-work (embedded in parcel specs)" rather than an active review gate. The user caught dark mode contrast issues, missing calendar pickers, and UX problems during sandbox review that the agent should have flagged. Agent 5 research brief on restructuring is running in parallel (for Sprint 11).

---

## Agent Assignments

| Agent | Role | Parcels |
|---|---|---|
| **Agent 12** (Data Engineer) | Topic UUID remapping, integrity audit, prevention triggers | P1 |
| **Agent 2** (Staff Software Engineer) | Notes page bug fixes | P2–P5 |
| **Agent 11** (Feature Integrity Guardian) | Full feature health audit, Feature Bible updates | P6 |
| **Agent 7** (Code Reviewer) | Code review gate | P7 |
| **Director** | Sprint Protocol update (design gate enforcement) | P8 |

---

## Parcels

### P1: Data Integrity — Topic UUID Remapping + Prevention
**Priority:** P0 (data corruption)
**Status:** DONE

### P2: Fix composeHTML() — Preserve Collapse State
**Priority:** P0 (root cause of bugs 1, 3, 4)
**Status:** DONE

### P3: Fix Split-to-New-Entry — Duplicate Clips + Adjacent Entry Deletion
**Priority:** P0 (data loss)
**Depends on:** P2
**Status:** DONE

### P4: Fix Navigation State Loss — Entry Disappearance on Route Change
**Priority:** P0 (data loss)
**Depends on:** P2
**Status:** DONE

### P5: Persist Collapse State Across Sessions
**Priority:** P1 (UX)
**Depends on:** P2
**Status:** DONE

### P6: Feature Health Audit
**Priority:** P1 (quality gate)
**Depends on:** P1
**Status:** DONE

### P7: Quality Gates
**Priority:** Gate
**Depends on:** P1–P6
**Status:** DONE

### P8: Sprint Protocol Update — Design Gate Enforcement
**Priority:** P1 (process)
**Status:** DONE

---

*See plan file for full parcel details, dependencies, risks, and Definition of Done.*

---

## Sprint Retrospective

**Completed:** February 24, 2026
**Parcels completed:** 8/8

### What Was Delivered

**Data Integrity (P1):**
- Mapped 14 orphaned topic UUIDs across 3 old→new topic pairs (Kaivoo, NUWAVE, Rainbow Apartments) plus topic_pages references
- Executed Supabase migration remapping all orphaned `topic_ids` in tasks (43), journal_entries (11), and captures (5)
- Created `clean_orphaned_topic_ids()` trigger on `topics` and `topic_pages` deletion — prevents future orphans
- Verified all cross-table FK relationships healthy
- Supabase security + performance advisors: no new warnings

**Notes Page Bug Fixes (P2–P5):**
- `composeHTML()` now accepts a `collapseState` parameter — no more hardcoded `data-collapsed="false"`
- Added `getEditorCollapseState()`, `saveCollapseState()`, `loadCollapseState()`, `cleanOldCollapseKeys()` helpers
- `splitToNewEntry()` rebuilt: reads entry list from editor content (not Zustand store), eliminating the race condition that caused duplicate entries
- `handleDeleteEntry()` rewritten: uses `entryId` attribute matching instead of fragile position tracking
- Collapse state persists to localStorage with 7-day TTL cleanup
- Collapse state preserved across splits, deletes, date changes, and navigation

**Feature Health Audit (P6):**
- Agent 11 audited all 10 pages — all PASS
- Feature Bible Index updated to v1.3 (Projects Page entry added)
- No new regressions found from Sprint 10 changes

**Process Hardening (P8):**
- Sprint Protocol updated to v1.4
- Mandatory Design Agent gate in Phase 4 (5-step methodology + dark mode pass)
- Design Agent screen specs required in Phase 1 for new UI
- Pre-merge checklist updated

**Research (parallel):**
- Agent 5 completed Design Agent optimization research brief (387 lines)
- Recommends splitting Design Agent into 3 specialized agents for Sprint 11

### Verification Results

| Check | Result |
|---|---|
| `npm run typecheck` | 0 errors |
| `npm run build` | Success |
| `npm run test` | 104/104 passed |
| `npm run lint` | Sprint 10 files clean (pre-existing errors in other files) |
| Agent 7 code review | PASS — no P0 issues |
| Agent 11 feature audit | PASS — all 10 pages healthy |
| Supabase advisors | No new warnings |
| Sandbox review | User approved |

### Deferred to Sprint 11+

- Projects UX overhaul (Design Agent-led): calendar picker, color wheel, dark mode contrast, quick-edit, subtask display, navigation, timeline placement
- Design Agent restructuring (informed by Agent 5 research brief)
- Full-text search
- AI "Organize My Day"
- Journal intelligence features
- Calendar page redesign
- Application-level topic_id validation (filter orphans on data load)
- Test coverage expansion for UI components
- Projects Page Feature Bible (needed before any further Projects work)

### Key Learnings

1. **Store reads during optimistic updates cause race conditions.** The `splitToNewEntry` bug was caused by reading `useKaivooStore.getState()` after `addJournalEntry()` triggered an optimistic update. Always use editor content as source of truth during editor operations.
2. **Position-based ProseMirror operations are fragile.** After any document mutation, positions shift. Use node attribute matching (`entryId`) instead of positional tracking.
3. **Design Agent must be an active gate, not passive pre-work.** Sprint 9's approach of embedding design specs in parcel descriptions wasn't enough — the user caught dark mode and UX issues that should have been flagged by an agent review step.
4. **Stabilization sprints are valuable.** After 9 feature sprints, dedicating a sprint to data integrity, bug fixes, and process hardening caught real issues and improved the foundation.

---

*Sprint 10 Contract — Compiled by the Director*
*February 24, 2026*
