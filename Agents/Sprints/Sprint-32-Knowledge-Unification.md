# Sprint 32 — Knowledge Unification

**Theme:** Merge Vault and Topics into a unified "Knowledge" page with top-level tabs.
**Branch:** `sprint/32-knowledge-unification`
**Status:** ACTIVE
**Compiled by:** Director
**Date:** March 7, 2026

---

## Why This Sprint Exists

Phase A roadmap requires consolidating the sidebar before v1 launch. Currently Vault and Topics are two separate sidebar entries showing overlapping data — the Vault's `Topics/` folder IS the Topics hierarchy, viewed as a file tree. Users must choose between two mental models for the same underlying data. Sprint 31 proved the tabs-merge pattern works (Tasks + Projects → unified Projects page). Sprint 32 applies the same pattern to the knowledge layer.

**Result:** Sidebar drops from 8 to 7 items. One unified "Knowledge" entry. Two views of the same data, zero confusion.

---

## Input Sources

| Source | Key Takeaways |
|---|---|
| Phase-A-Roadmap | Sprint 32 = Knowledge Unification. Vault + Topics merge. |
| Sprint 31 retrospective | `TasksContent` extraction pattern validated. `useLocalStorage` for tab persistence. React.lazy + Suspense for code splitting. |
| Sprint 31 deferred | Full concierge Chat tab integration, bundle size audit, ProjectDetail splitting — all deferred to Sprint 33. |
| Agent 7 Sprint 30 audit | P2-B: dead code in compressImage. P2-C: floating-point comparison. P2-E: coherence monitor only checks `playful`. All deferred to Sprint 33. |
| Agent 11 Sprint 30 review | RISK-2: `to_tsquery` special character handling. RISK-3: pre-compaction flush latency. Both deferred to Sprint 33. |
| Architecture audit | Vault.tsx (524 lines), Topics.tsx (395 lines), TopicPage.tsx (522 lines), Sidebar.tsx, App.tsx — all reviewed. |
| Feature Bible: Topics Page v0.1 | Must-Never-Lose checklist defines regression contract. |

---

## Design Decision

**Approach: Tabs on the Topics page, renamed to "Knowledge".**

1. Single "Knowledge" sidebar entry (remove "Vault" — reduces sidebar from 8 to 7 items)
2. `/topics` page gets two top-level tabs: **Topics** | **Vault**
   - "Topics" tab = current Topics page (tree view, CRUD, search, expand/collapse, topic actions)
   - "Vault" tab = current Vault browser (file tree, breadcrumbs, search, statistics, keyboard nav)
3. `/vault` route redirects to `/topics?tab=vault` for backward compatibility
4. Topic detail (`/topics/:topicId` and `/topics/:topicId/pages/:pageId`) — unchanged
5. Sidebar icon: `BookOpen` or `Library` (knowledge-oriented, replaces FolderOpen)

```
SIDEBAR                         KNOWLEDGE PAGE (/topics)
┌──────────┐                    ┌──────────────────────────────────┐
│ Today    │                    │ [Topics] [Vault]                 │
│ Notes    │                    │ ──────────────────────────────── │
│ Projects │                    │                                  │
│ Routines │                    │ Topics tab:                      │
│ Calendar │                    │   Tree view, search, CRUD        │
│ Knowledge│ ←── unified        │   (current Topics.tsx content)   │
│ Insights │                    │                                  │
│ Settings │                    │ Vault tab:                       │
│          │                    │   File browser, breadcrumbs,     │
│          │                    │   search, stats, keyboard nav    │
└──────────┘                    └──────────────────────────────────┘
                                           │ click topic
                                           ▼
                                TOPIC DETAIL (/topics/:topicId)
                                ┌──────────────────────────────────┐
                                │ ← Knowledge                      │
                                │ 🎵 NUWAVE Mainframe              │
                                │                                  │
                                │ (existing topic detail — no      │
                                │  changes from Sprint 19/22/26)   │
                                │                                  │
                                └──────────────────────────────────┘
```

---

## Scope — 3 Tracks, 10 Parcels

### Track 1: Knowledge Page — Top-Level Tabs

| # | Parcel | Agent | Status | Priority |
|---|---|---|---|---|
| P1 | **Refactor Topics.tsx to export `TopicsContent`** — Extract the Topics page content (tree view, search, CRUD, dialogs) into a named export `TopicsContent` without AppLayout wrapper. Default export preserved as thin wrapper with AppLayout. Follows the `TasksContent` pattern from Sprint 31. | Agent 2 | PENDING | **P0** |
| P2 | **Refactor Vault.tsx to export `VaultContent`** — Extract the Vault browser content (file tree, breadcrumbs, search, statistics, keyboard navigation, ARIA) into a named export `VaultContent` without AppLayout wrapper. Default export preserved as thin wrapper. | Agent 2 | PENDING | **P0** |
| P3 | **Build unified Knowledge page with tabs** — Rewrite Topics.tsx (or create Knowledge.tsx) with shadcn `<Tabs>`. Two tabs: "Topics" and "Vault". Default to "Topics" tab. Lazy-load both tab contents with React.lazy + Suspense. Persist selected tab via `useLocalStorage('flow-knowledge-tab', 'topics')`. | Agent 2 | PENDING | **P0** |
| P4 | **Tab-aware URL state** — Support `/topics?tab=vault` query parameter so the Vault redirect lands on the correct tab. If `?tab=vault` is present, activate the Vault tab on mount. Tab switches update the URL query param without navigation. | Agent 2 | PENDING | **P1** |

### Track 2: Navigation & Routing

| # | Parcel | Agent | Status | Priority |
|---|---|---|---|---|
| P5 | **Update sidebar** — Rename "Topics" entry to "Knowledge". Change icon from `FolderOpen` to `BookOpen` (or `Library`). Remove "Vault" entry. Sidebar goes from 8 to 7 items. | Agent 2 | PENDING | **P1** |
| P6 | **Redirect `/vault` → `/topics?tab=vault`** — Add route redirect for backward compatibility. Any bookmarks or links to `/vault` land on the Vault tab of the Knowledge page. | Agent 2 | PENDING | **P1** |
| P7 | **Update search/command palette** — Any search results or navigation that previously linked to `/vault` should now link to `/topics?tab=vault`. Vault-related search result categories remain functional. | Agent 2 | PENDING | **P2** |
| P8 | **Update Today dashboard references** — If any Today widgets or links reference `/vault` directly, update them to `/topics?tab=vault`. | Agent 2 | PENDING | **P2** |

### Track 3: Polish & Consistency

| # | Parcel | Agent | Status | Priority |
|---|---|---|---|---|
| P9 | **Breadcrumb consistency** — Topic detail breadcrumb currently reads "Topics > TopicName". Update to "Knowledge > TopicName" to match the new sidebar label. Vault breadcrumbs within the Vault tab should show the folder path (existing behavior, preserved). | Agent 2 | PENDING | **P2** |
| P10 | **Page title and header updates** — Update the page `<title>` tag and any visible "Topics" or "Vault" page headers to reflect "Knowledge" branding. The tab labels remain "Topics" and "Vault" (descriptive of each view). | Agent 2 | PENDING | **P2** |

---

## Agent Assignments

| Agent | Parcels | Focus |
|---|---|---|
| **Agent 2** (Staff Engineer) | P1–P10 | All implementation |
| **Agent 3** (Architect) | P1, P2, P3 (consult) | Architecture review — tab structure, lazy loading, URL state management |
| **Design Agents** (3-agent) | Pre-sandbox review | UX review of merged page — tab layout, icon choice, breadcrumb consistency |
| **Agent 7** (Code Reviewer) | All parcels | Quality gate — reviews every parcel |
| **Agent 11** (Feature Integrity) | Sprint-level | Regression check — Topics + Vault feature coverage in merged view |

---

## Definition of Done

### Per-Parcel
- P1: `TopicsContent` export exists, renders identically to current Topics page content. No feature regression.
- P2: `VaultContent` export exists, renders identically to current Vault page content. Keyboard navigation, ARIA roles, search, breadcrumbs all intact.
- P3: Knowledge page renders two tabs. Tab selection persists across navigation via localStorage.
- P4: `/topics?tab=vault` activates Vault tab. Tab switches update query param. Direct URL access works.
- P5: Sidebar shows "Knowledge" with new icon. No "Vault" entry. 7 sidebar items total.
- P6: `/vault` redirects to `/topics?tab=vault` with Vault tab active.
- P7: Search results that linked to `/vault` now link to `/topics?tab=vault`.
- P8: Any Today widget links to `/vault` updated to `/topics?tab=vault`.
- P9: Topic detail breadcrumb reads "Knowledge > TopicName".
- P10: Page `<title>` reflects "Knowledge" branding.

### Sprint-Level
- All deterministic checks pass: `npm run lint && npm run typecheck && npm run test && npm run build`
- No regressions in topic CRUD, topic pages, vault browsing, file tree navigation
- No regressions in `[[double-bracket]]` linking, tag filtering, content aggregation
- Both web and desktop work (adapter parity)
- Agent 7 code audit: no unresolved P0 issues
- Agent 11 feature integrity: no regressions against Feature Bible (Topics Page v0.1)
- Vault keyboard navigation (arrow keys, Home/End) works within the Vault tab

---

## Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Vault.tsx is 524 lines with complex keyboard navigation + ARIA — extraction could break accessibility | Extract as-is into `VaultContent`. No refactoring during extraction. Test keyboard nav in sandbox. |
| Topics.tsx has dialog state (Create Topic, Create Page) that may not scope correctly inside a tab | Dialogs render at portal level (shadcn uses Radix portals). Should work inside tabs without issue. Verify early. |
| URL query param (`?tab=vault`) adds complexity to tab state | Keep it simple: read query param on mount, update on tab change. `useLocalStorage` is the persistence layer, query param is for deep linking only. |
| "Knowledge" branding may feel unfamiliar to existing users | Transitional — the tab labels "Topics" and "Vault" preserve the familiar terminology within the page. The sidebar label is the only new name. |

---

## Deliberately Deferred

### To Sprint 33 (Cleanup + Hardening)
| Item | Source |
|---|---|
| Bundle size audit (<512KB budget) | Sprint 30 retro |
| Full concierge integration in project Chat tab | Sprint 31 P10 placeholder |
| ProjectDetail component splitting (~476 lines) | Sprint 31 retro |
| `to_tsquery` special character sanitization | Agent 11 Sprint 30 |
| Coherence monitor: add professional/casual tone checks | Agent 7 P2-E Sprint 30 |
| Dead code in `compressImage` loop | Agent 7 P2-B Sprint 30 |
| Floating-point comparison in compression loop | Agent 7 P2-C Sprint 30 |
| Pre-compaction flush latency status message | Agent 11 Sprint 30 |
| Dark mode contrast (3.8:1 → 4.5:1) | Sprint 25 |
| Adapter layer P1 issues (7 items) | Agent 7 Sprint 21 |
| Accessibility: touch targets (P2) | Sprint 30 design review |
| Screenshots for Sprint 29 rebrand | Sprint 29 |
| Prettier pre-commit hook | Sprint 30 retro |
| Enhanced project-scoped task features (filters, kanban within project) | Sprint 31 |

### To Post-Launch
| Item | Source |
|---|---|
| In-vault markdown editor | Backlog |
| Wikilinks + backlinks | Backlog |
| File type filtering in vault | Backlog |
| Vault organization (move, sort, manual reorder) | Backlog |

---

*Sprint 32 — Knowledge Unification — Created March 7, 2026 by Director*
