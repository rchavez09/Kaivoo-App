# Sprint 31 — Tasks + Projects Merge

**Theme:** Merge Tasks and Projects into a unified page with top-level tabs and tabbed project detail.
**Branch:** `sprint/31-tasks-projects-merge`
**Status:** IMPLEMENTATION COMPLETE — Awaiting Phase 4 Gates
**Compiled by:** Director
**Date:** March 7, 2026

---

## Why This Sprint Exists

Phase A roadmap requires merging Tasks and Projects into a unified page before v1 launch. Currently these are two separate sidebar items with separate pages, fragmenting the project management experience. Research into ClickUp 4.0 and Linear confirmed that both global ("all tasks") and project-scoped views must coexist — the merge makes projects the primary organizing structure while keeping a global lens available.

---

## Input Sources

| Source | Key Takeaways |
|---|---|
| Phase-A-Roadmap | Sprint 31 = Tasks + Projects Merge. Reference design defined. |
| Sprint 30 retrospective | Bundle size audit deferred to "Sprint 31 or 33." P1 memory source tag bug. |
| Agent 7 Sprint 30 audit | P1: memory source tag mismatch. P2-F: renameFile missing sanitization. P2-G: renameFile no collision check. |
| Agent 11 Sprint 30 review | P2: `to_tsquery` special character handling risk. |
| ClickUp 4.0 / Linear research | Both global + project-scoped views must coexist. Tabs approach validated. |
| Architecture audit | Tasks.tsx, Projects.tsx, ProjectDetail.tsx, Sidebar.tsx, store, adapters — all reviewed. |

---

## Design Decision

**Approach: Tabs on the Projects page.**

1. Single "Projects" sidebar entry (remove "Tasks" — reduces sidebar from 9 to 8 items)
2. `/projects` page gets two top-level tabs: **All Tasks** | **Projects**
   - "All Tasks" tab = current Tasks page features (filters, kanban, list, bulk actions, timeline)
   - "Projects" tab = current card grid + "Inbox" card (unassigned tasks)
3. Clicking a project card → `/projects/:id` → enhanced detail with tabbed sub-nav:
   - **Tasks** | **Documents** | **Notes** | **Chat**
4. `/tasks` route redirects to `/projects` for backward compatibility

```
SIDEBAR                         PROJECTS PAGE (/projects)
┌──────────┐                    ┌──────────────────────────────────┐
│ Today    │                    │ [All Tasks] [Projects]           │
│ Notes    │                    │ ──────────────────────────────── │
│ Projects │ ←── single entry   │                                  │
│ Routines │                    │ All Tasks tab:                   │
│ Calendar │                    │   Filters, kanban, list, bulk    │
│ Vault    │                    │   (current Tasks page content)   │
│ Topics   │                    │                                  │
│ Insights │                    │ Projects tab:                    │
│          │                    │   Card grid + Inbox card         │
└──────────┘                    └──────────────────────────────────┘
                                           │ click project card
                                           ▼
                                PROJECT DETAIL (/projects/:id)
                                ┌──────────────────────────────────┐
                                │ ← Projects                       │
                                │ NUWAVE Mainframe      ████ 6/10  │
                                │                                  │
                                │ [Tasks] [Documents] [Notes] [Chat]│
                                │ ──────────────────────────────── │
                                │                                  │
                                │ (active tab content)             │
                                │                                  │
                                └──────────────────────────────────┘
```

---

## Scope — 4 Tracks, 14 Parcels

### Track 0: Quick Fixes (Sprint 30 Carryover)

| # | Parcel | Agent | Status | Priority |
|---|---|---|---|---|
| P1 | **Fix memory source tag** — Change `'extraction'` → `'pre_compaction_flush'` in `extraction.ts:237`. 5-minute fix, critical for coherence monitoring Layer 7. | Agent 2 | ✅ DONE (Sprint 30) | **P1** |
| P2 | **Filename sanitization** — Add `sanitizeFilename()` to `SupabaseAttachmentAdapter.renameFile`. Prevents path traversal and invalid characters. | Agent 2 | ✅ DONE (Sprint 30) | **P2** |
| P3 | **Rename collision check** — Add file existence check before rename in `SupabaseAttachmentAdapter.renameFile`. Prevents silent overwrites. | Agent 2 | ✅ DONE (Sprint 30) | **P2** |

**Notes:** All three were already implemented in Sprint 30 commit `cddc470`. Verified via code review.

### Track 1: Projects Page — Top-Level Tabs

| # | Parcel | Agent | Status | Priority |
|---|---|---|---|---|
| P4 | **Add top-level tabs to Projects page** — Two tabs: "All Tasks" and "Projects". Default to "All Tasks" tab. Use shadcn Tabs component. Persist selected tab in localStorage. | Agent 2 | ✅ DONE | **P0** |
| P5 | **Migrate Tasks page into "All Tasks" tab** — Render the existing Tasks component as the content of the "All Tasks" tab. Preserve all features: filters, kanban, list view, timeline, bulk actions, sort, search. The Tasks component manages its own state — minimal refactoring needed. | Agent 2 | ✅ DONE | **P0** |
| P6 | **Move Projects grid into "Projects" tab** — Current card grid + status tabs + search + sort become the "Projects" tab content. | Agent 2 | ✅ DONE | **P0** |
| P7 | **Add "Inbox" card to Projects tab** — Virtual project card showing count of tasks where `projectId === undefined`. Clicking opens Inbox detail view (same layout as project detail, Tasks tab only). | Agent 2 | ✅ DONE | **P1** |

**Implementation notes:**
- `Tasks.tsx` refactored to export `TasksContent` (without AppLayout) for embedding. Default export preserved as thin wrapper.
- `Projects.tsx` rewritten with shadcn `<Tabs>` — top-level tab persisted via `useLocalStorage('kaivoo-projects-top-tab', 'all-tasks')`.
- Inbox card shows count of tasks with no `projectId`, navigates to `/projects/inbox`.

### Track 2: Project Detail — Tabbed Sub-Navigation

| # | Parcel | Agent | Status | Priority |
|---|---|---|---|---|
| P8 | **Add tabbed sub-nav to ProjectDetail** — Replace stacked sections with tabs: Tasks \| Documents \| Notes \| Chat. Use shadcn Tabs. Default to Tasks tab. Persist in localStorage. | Agent 2 | ✅ DONE | **P0** |
| P9 | **Refactor existing sections into tabs** — Move `ProjectTaskList` → Tasks tab. Move `ProjectAttachments` → Documents tab. Move `ProjectNotesList` → Notes tab. `ProjectSettings` remains accessible via gear icon in header (not a tab). | Agent 2 | ✅ DONE | **P0** |
| P10 | **Build Chat tab** — Project-scoped concierge. Opens a chat interface pre-loaded with the project's context (name, description, task list, notes). Uses the existing concierge architecture but injects project context into the system prompt. Quick action chips: "Plan this project," "Prioritize tasks," "Brainstorm ideas." | Agent 2 | ✅ DONE (placeholder) | **P1** |

**Implementation notes:**
- `ProjectDetail.tsx` rewritten with tabbed sub-nav. Tab persisted via `useLocalStorage('kaivoo-project-detail-tab', 'tasks')`.
- Inbox route (`/projects/inbox`) handled as special case — shows unassigned tasks only, no tabs.
- Chat tab implemented as placeholder with quick action chips (Plan, Prioritize, Brainstorm). Full concierge integration deferred.
- Settings section moved below tabs, always visible.

### Track 3: Navigation & Routing

| # | Parcel | Agent | Status | Priority |
|---|---|---|---|---|
| P11 | **Update sidebar** — Remove "Tasks" entry. Keep "Projects" (Briefcase icon). Sidebar goes from 9 to 8 items. | Agent 2 | ✅ DONE | **P1** |
| P12 | **Redirect `/tasks` → `/projects`** — Add route redirect for backward compatibility. Any bookmarks or links to `/tasks` land on the "All Tasks" tab of Projects page. | Agent 2 | ✅ DONE | **P1** |
| P13 | **Update Today dashboard** — Task widget links that previously navigated to `/tasks` should navigate to project context where applicable. "View all tasks" link → `/projects` (All Tasks tab). | Agent 2 | ✅ DONE | **P2** |
| P14 | **Update search/command palette** — Any search results that linked to `/tasks` should link to `/projects` instead. | Agent 2 | ✅ DONE | **P2** |

**Implementation notes:**
- Sidebar: Removed Tasks nav item + unused `CheckSquare` icon import.
- App.tsx: `/tasks` route → `<Navigate to="/projects" replace />`. Removed Tasks lazy import.
- TasksWidget + TodayAgendaWidget: `to="/tasks"` → `to="/projects"`.
- `local-search.ts` + `search.service.ts`: task/subtask `getEntityPath` → `'/projects'`.
- Test files updated: `local.test.ts`, `local-integration.test.ts`, `supabase.test.ts`.

---

## Agent Assignments

| Agent | Parcels | Focus |
|---|---|---|
| **Agent 2** (Staff Engineer) | P1–P14 | All implementation |
| **Agent 3** (Architect) | P4, P5, P8 (consult) | Architecture review — tab structure, routing, state management |
| **Design Agents** (3-agent) | Pre-sandbox review | UX review of merged page — tab layout, Inbox card, project detail tabs |
| **Agent 7** (Code Reviewer) | All parcels | Quality gate — reviews every parcel |
| **Agent 11** (Feature Integrity) | Sprint-level | Regression check — Tasks + Projects feature coverage in merged view |

---

## Definition of Done

### Per-Parcel
- P1: Memory source tag reads `'pre_compaction_flush'` in extraction.ts. Coherence monitor can distinguish pre-compaction memories.
- P2: `renameFile` rejects filenames with path traversal characters (`/`, `..`, `\0`).
- P3: `renameFile` checks if target filename exists before renaming. Returns error on collision.
- P4: Projects page renders two tabs. Tab selection persists across navigation.
- P5: "All Tasks" tab shows all tasks with filters, kanban, list, timeline, bulk actions. No feature regression from current Tasks page.
- P6: "Projects" tab shows card grid with status tabs, search, sort. No regression from current Projects page.
- P7: "Inbox" card shows count of unassigned tasks. Click opens detail view with task list.
- P8: Project detail renders tabbed sub-nav. Tab selection persists.
- P9: Tasks, Documents, Notes content matches current stacked layout. No regression.
- P10: Chat tab opens project-scoped concierge with project context injected.
- P11: Sidebar shows "Projects" only. No "Tasks" entry.
- P12: `/tasks` redirects to `/projects` with "All Tasks" tab active.
- P13: Today dashboard "view all" links navigate to `/projects`.
- P14: Search results link to `/projects` instead of `/tasks`.

### Sprint-Level
- All deterministic checks pass: `npm run lint && npm run typecheck && npm run test && npm run build`
- No regressions in task CRUD, project CRUD, subtask operations, bulk actions
- Both web and desktop work (adapter parity)
- Agent 7 code audit: no unresolved P0 issues
- Agent 11 feature integrity: no regressions against Feature Bibles

---

## Quality Gates

- [x] Deterministic checks pass: `npm run lint && npm run typecheck && npm run test && npm run build`
- [ ] Agent 7 code audit completed (no unresolved P0 issues)
- [ ] Agent 11 feature integrity check passed (no regressions)
- [ ] 3-agent design review completed (all PASS, no unresolved P0 issues)
- [ ] Sprint file is current: all parcels have final status
- [ ] E2E test: `npm run test:e2e` passes against deploy preview URL
- [ ] Sandbox Track A (Web): User has reviewed deploy preview and approved
- [ ] All sprint files committed to sprint branch

---

## Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Tasks page state management is complex (~1025 lines) — embedding in a tab may cause issues | Render Tasks component as-is inside tab content. It manages its own state. Minimal refactoring. |
| Kanban board drag-and-drop may conflict with tab container | Test dnd-kit within tab container early. If issues, constrain drag context to tab content area. |
| Chat tab scope is open-ended | Keep it simple: inject project context into existing concierge, not a new chat system. Quick action chips optional for Sprint 31. |
| Users may expect `/tasks` to still work | P12 handles redirect. Also update any hardcoded links in Today dashboard and search. |

---

## Deliberately Deferred

### To Sprint 33 (Cleanup + Hardening)
| Item | Source |
|---|---|
| Bundle size audit (<512KB budget) | Sprint 30 retro |
| Adapter layer P1 issues (7 items) | Agent 7 Sprint 21 |
| Dark mode contrast (3.8:1 → 4.5:1) | Sprint 25 |
| Accessibility: touch targets (P2) | Sprint 30 design review |
| Screenshots for Sprint 29 rebrand | Sprint 29 |
| Prettier pre-commit hook | Sprint 30 retro |
| `to_tsquery` special character sanitization | Agent 11 Sprint 30 |
| Pre-compaction flush latency status message | Agent 11 Sprint 30 |
| Enhanced Tasks tab features in project detail (filters, kanban, bulk actions within a project) | Future enhancement |
| Full concierge integration in project Chat tab | Sprint 31 P10 placeholder |

---

*Sprint 31 — Tasks + Projects Merge — Created March 7, 2026 by Director*
