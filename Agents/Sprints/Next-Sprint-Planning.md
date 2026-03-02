# Next Sprint Planning — Sprint 19: Topics & Quality

**Status:** Sprint 19 — awaiting approval (requires Director review of CEO Session #4)
**Compiled by:** Director
**Date:** March 1, 2026

---

## CEO Session #4 — Strategic Direction Change

> **Read before planning:** `CEO-Sessions/CEO-Session-4-Local-First-Knowledge-OS.md`
>
> CEO Session #4 elevated local-first storage and desktop packaging to Phase A must-haves. The Topics page restructure is still Sprint 19 priority, but should be designed with the local-first file browser vision in mind. Key impacts on Sprint 19:
>
> 1. **Topics UX work (P1, P2, P3) proceeds as planned** — the UX fixes are still valid and needed regardless of storage backend
> 2. **Topics architecture should anticipate the Knowledge OS direction** — the Feature Bible (P1) should account for file browsing, attachment display, and the Topics > Projects > Tasks hierarchy
> 3. **Post-Sprint 19, the Director must sequence:** Electron/Tauri evaluation → data layer abstraction → local storage → file attachments → setup wizard. These are new Phase A must-haves.
> 4. **New urgent research parcels:** Electron vs. Tauri (Agent 9), SQLite schema design (Agent 3) — should start in parallel with Sprint 19
>
> Vision.md updated to v4.3. See decision details in the strategic brief.

---

## Input Sources

| Source | Document | Key Inputs |
|---|---|---|
| Vision.md v4.3 | `Agents/Vision.md` | Topics = Knowledge OS (CEO Session #4). Local-first, desktop packaging, file attachments all promoted to must-have. |
| CEO Session #4 | `CEO-Sessions/CEO-Session-4-Local-First-Knowledge-OS.md` | Topics as local-first file browser. Swappable backend. Obsidian import. One codebase, three platforms. |
| Sprint 18 | `Sprints/Sprint-18-Search-Week-View.md` | 6 deferred items, 3 tech debt items |
| Agent 7 | `Engineering/Agent-7-Docs/Bundle-Size-Standards.md` | Initial JS at 482KB — 2.4x over 200KB budget |
| Agent 7 | `Engineering/Agent-7-Docs/Review-Quick-Reference.md` | Quality checklist: lazy loading, code splitting, memoization |
| Agent 11 | `Quality/Agent-11-Docs/Feature-Bible-Index.md` | Topics page Bible: NOT STARTED |
| Agent 5 | `Research/Agent-5-Docs/Research-Brief-Project-Management-Patterns.md` | Topics as facets (not containers), entity hierarchy |
| Design Docs | `Design/Agent-Design-Docs/Exploration-Projects-Timeline-Calendar.md` | Topic = "ambient" layer above Projects |
| Design Docs | `Design/Agent-Design-Docs/Anti-Patterns.md` | Anti-pattern #1: forcing navigation to act on visible data |
| Design Docs | `Design/Agent-Design-Docs/Interaction-Patterns.md` | Inline Editor pattern, Expandable Card pattern |
| CEO Sessions | `Next-Sprint-Planning.md` (previous) | Phase A mandate, core principles 9 & 10 |
| Codebase scan | Topics page, TopicPage, service, stores | 15 UX issues identified (see assessment below) |
| Codebase scan | vite.config.ts, package.json, App.tsx | Bundle optimization opportunities identified |

---

## Topics Page Assessment — Current State

### What Exists
- **Topics list page** (`/topics`) — flat list of topics with expand/collapse for pages, search bar, create dialog
- **Topic detail page** (`/topics/:topicId`) — header, pages carousel, tags widget, mentions widget, tasks widget
- **Page detail page** (`/topics/:topicId/pages/:pageId`) — same layout minus pages carousel
- **Data model** — `topics` table (id, name, description, icon, parent_id, user_id) + `topic_pages` table (id, name, description, topic_id, user_id)
- **Linking** — `topic_ids` string array on tasks, journal_entries, captures (stores both topic and page IDs mixed)
- **Service layer** — fetchTopics, fetchTopicPages, createTopic, createTopicPage, deleteTopic (incomplete)
- **Stores** — `useTopicStore` AND `useKaivooStore` both manage topic state independently (dual-store problem)

### Issues Found (15 total)

**Critical — Dead/Non-functional UI (3)**

| # | Issue | Location | Impact |
|---|---|---|---|
| 1 | "Configure" button does nothing | `TopicPage.tsx:101` | No onClick handler. User clicks, nothing happens. |
| 2 | "New Page" card is dead | `TopicPage.tsx:144-149` | Has `cursor-pointer` class but no onClick. Users will click expecting to create a page. |
| 3 | "Add Task" button does nothing | `TopicTasksWidget.tsx:41-44` | No onClick handler. Most natural action on a topic detail page doesn't work. |

**Missing CRUD Operations (4)**

| # | Issue | Impact |
|---|---|---|
| 4 | No topic/page rename | No `updateTopic` or `updateTopicPage` in service/store/actions. Only option is delete (destroys associations). |
| 5 | No page deletion | `deleteTopicPage` doesn't exist. Once created, a page can never be removed individually. |
| 6 | No description editing | Description field exists in DB and types but no UI to set/edit it. Create dialogs only accept `name`. |
| 7 | No icon editing | `icon` field exists on Topic type and in DB, never set or displayed. |

**Data/Architecture Issues (3)**

| # | Issue | Impact |
|---|---|---|
| 8 | Dual store (useTopicStore + useKaivooStore) | Both persist topics independently. Can diverge. useKaivooStore is used for reads, useTopicStore used by TopicTagEditor and TopicPagePicker. |
| 9 | `parentId` on Topic never used in UI | DB supports nesting, but UI renders flat list. Dead schema creating false expectations. |
| 10 | Hardcoded `topic-daily-notes` seed data | Hardcoded ID in useKaivooStore, filtered out in pickers. If user deletes it, journal filtering breaks. |

**UX Flow Gaps (5)**

| # | Issue | Impact |
|---|---|---|
| 11 | No topic-scoped task creation | Can't create a task pre-tagged to the current topic from the detail page. |
| 12 | Tag filter only affects Mentions, not Tasks | Selecting a tag hides matching entries but Tasks widget ignores the filter. Feels broken. |
| 13 | Topic search doesn't find pages | `filteredTopics` only checks `topic.name`. Searching "Amani" (a page) returns nothing. |
| 14 | No sibling page navigation | On a page detail, no way to switch to a sibling page without going back to the topic list. |
| 15 | No empty state guidance | Topic detail with no entries/tasks shows nothing helpful. Should guide users on how to link content. |

---

## Bundle Size Assessment

**Current state:** 482KB initial JS (gzipped) — budget is 200KB. 2.4x over.

**Root causes identified:**

| Issue | Impact | Fix |
|---|---|---|
| Only 4 of 23 `@radix-ui/*` packages in vendor chunk | ~19 packages in main bundle | Complete the `vendor-radix` chunk |
| No core vendor chunk (react, react-dom, tanstack, zustand) | Framework code in main bundle | Add `vendor-core` chunk |
| No supabase vendor chunk | ~200KB unmanaged | Add `vendor-supabase` chunk |
| `SearchCommand` eagerly loaded in AppLayout | `cmdk` (~50KB) in initial bundle | Lazy-load SearchCommand |
| `motion` (Framer Motion) has no chunk | ~100KB unmanaged, only used by Insights | Add `vendor-motion` chunk |
| `chart.tsx` imports `* as RechartsPrimitive` but is never imported by any component | Dead code, recharts built but unused | Remove `chart.tsx` or confirm unused |
| `carousel.tsx` (embla) and `drawer.tsx` (vaul) appear unused | Installed but no imports found | Remove if confirmed dead |
| `@tiptap/extension-bubble-menu` missing from tiptap chunk | Falls into main bundle | Add to `vendor-tiptap` |
| `react-markdown` + `remark-gfm` no chunk | Only used in TopicCapturesWidget | Add `vendor-markdown` chunk |
| `@dnd-kit/*` no chunk | ~80KB, used in Tasks/Kanban/Routines | Add `vendor-dnd` chunk |

**Target:** <250KB initial JS gzipped (stretch: <200KB)

---

## Sprint 19 — Proposed Scope

**Theme:** Topics & Quality
**Goal:** Ship a polished, fully-functional Topics system (CEO Priority #1) and bring bundle size within budget before the $249 ship.

### Tracks

```
Track 1: Topics Restructure ─── P1 Feature Bible → P2 Service/Store → P3 UI/UX
Track 2: Bundle Optimization ── P4 (parallel with Track 1)
Track 3: Tech Debt Cleanup ──── P5 (parallel, small)
Track 4: Quality Gates ──────── P6 (sequential, end of sprint)
```

---

### P1 — Topics Feature Bible
**Agent:** Agent 11 (Feature Integrity Guardian)
**Status:** PENDING
**Blocks:** P3

Create `Feature-Bible-Topics-Page.md` before any UI coding begins. This is the contract that defines what Topics must do and what must never break.

Deliverables:
- Document current working behavior (must-never-lose checklist)
- Define target UX for restructured Topics page and Topic detail
- Resolve open questions: icon picker scope, description editing UX, sibling navigation pattern
- Define empty states, loading states, error states
- Define what the "Configure" button should do (inline settings vs. dialog)

---

### P2 — Topics Service & Store Consolidation
**Agent:** Agent 2 (Software Engineer)
**Status:** PENDING
**Blocks:** P3

Fix the backend before fixing the UI. Complete the missing CRUD operations and eliminate the dual-store problem.

Deliverables:
- **Service layer additions:**
  - `updateTopic(userId, id, updates)` — rename, description, icon
  - `updateTopicPage(userId, id, updates)` — rename, description
  - `deleteTopicPage(userId, id)` — individual page deletion
- **Store consolidation:**
  - Migrate all `useTopicStore` functionality into `useKaivooStore`
  - Remove `useTopicStore` entirely
  - Update `TopicTagEditor` and `TopicPagePicker` to use `useKaivooStore`
  - Remove `kaivoo-topics` localStorage key (cleanup)
- **Action layer:**
  - `updateTopic` / `updateTopicPage` / `deleteTopicPage` async actions in `useKaivooActions`
  - Optimistic updates with rollback on error (matches existing pattern)

---

### P3 — Topics UX Restructure
**Agent:** Agent 2 (Software Engineer)
**Status:** PENDING
**Depends on:** P1 (Feature Bible), P2 (Service/Store)

Fix all dead UI, implement missing interactions, polish the Topics experience.

Deliverables:

**Fix dead UI (Issues #1–3):**
- Wire "Configure" button → topic settings (inline or dialog — per Feature Bible)
- Wire "New Page" card → create page dialog (pre-associated with current topic)
- Wire "Add Task" button → create task dialog (pre-tagged to current topic)

**Implement missing CRUD (Issues #4–7):**
- Inline editing for topic name (click-to-edit pattern from Interaction-Patterns.md)
- Inline editing for page name
- Description editing — add description field to topic/page header (edit-where-you-see-it)
- Icon picker for topics (emoji or Lucide icon selector — scope per Feature Bible)

**Fix UX flow gaps (Issues #11–15):**
- Topic-scoped task creation — "Add Task" creates task pre-tagged to current topic/page
- Tag filter applies to both Mentions widget AND Tasks widget
- Topics list search includes page names (not just topic names)
- Sibling page navigation — tabs or horizontal pill selector on page detail view
- Empty states — guidance text explaining how to link content to topics (`[[TopicName]]` syntax, task drawer, etc.)

**Not in scope (deferred):**
- Issue #9 (parentId hierarchy) — dead schema, no UI change. Clean up in future tech debt sprint.
- Issue #10 (hardcoded Daily Notes) — complex, risk of breaking journal flow. Separate sprint.

---

### P4 — Bundle Size Optimization
**Agent:** Agent 2 (Software Engineer) + Agent 7 (Code Reviewer, oversight)
**Status:** PENDING
**Parallel with:** Track 1

Deliverables:

**Complete `manualChunks` in vite.config.ts:**
```
vendor-core:      react, react-dom, react-router-dom, @tanstack/react-query, zustand
vendor-supabase:  @supabase/supabase-js
vendor-radix:     all 23 @radix-ui/* packages (currently only 4)
vendor-tiptap:    add @tiptap/extension-bubble-menu (currently missing)
vendor-dnd:       @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities
vendor-motion:    motion (Framer Motion)
vendor-markdown:  react-markdown, remark-gfm
vendor-recharts:  recharts (keep existing — verify if chart.tsx is dead code)
```

**Lazy-load SearchCommand:**
- `AppLayout` eagerly imports `SearchCommand` → pulls `cmdk` into initial bundle
- Wrap in `React.lazy()` — search is an on-demand overlay, not needed at page load

**Dead code removal:**
- Verify `chart.tsx` is unused → remove if confirmed (eliminates recharts from initial load)
- Verify `carousel.tsx` (embla) is unused → remove if confirmed
- Verify `drawer.tsx` (vaul) is unused → remove if confirmed

**Measurement:**
- Run `npm run build` before and after, capture chunk sizes
- Report initial JS gzipped size — target <250KB (stretch <200KB)

---

### P5 — Sprint 18 Tech Debt
**Agent:** Agent 2 (Software Engineer)
**Status:** PENDING
**Parallel with:** Track 1

Small cleanup items from Sprint 18 retrospective:

- **FTS headline bold rendering:** `ts_headline` returns `**` delimiters as raw text. Strip or render as `<strong>` in SearchCommand results display.
- **WeekTimeline task blocks:** Tasks currently show as counts in day headers but don't render as blocks in the grid columns. Render task blocks alongside meeting blocks in week view.

**Not in scope:** Cross-platform shortcut recording (low priority, deferred).

---

### P6 — Quality Gates
**Agents:** Agent 7, Agent 11, Visual Design Agent, Accessibility & Theming Agent, UX Completeness Agent
**Status:** PENDING
**Depends on:** P1–P5

Per Sprint Protocol v1.7:

- [ ] `npm run lint` passes
- [ ] `npm run typecheck` passes
- [ ] `npm run test` passes
- [ ] `npm run build` passes
- [ ] Bundle size measured and reported (target <250KB initial JS gzipped)
- [ ] Agent 7 code audit — no unresolved P0 issues
- [ ] Agent 11 feature integrity — Topics page meets Feature Bible contract, Today page not regressed
- [ ] Visual Design Agent review — hierarchy, brand, composition, craft
- [ ] Accessibility & Theming Agent review — contrast, ARIA, focus, dark mode
- [ ] UX Completeness Agent review — states, navigation, input patterns, edit-in-place
- [ ] Open PR → CI passes + Netlify deploy preview generated
- [ ] E2E test against deploy preview (if E2E infrastructure ready; advisory if not)
- [ ] User sandbox review on deploy preview URL
- [ ] Sprint retrospective added to sprint file

---

## Agent Assignments

| Agent | Department | Parcels | Role |
|---|---|---|---|
| Agent 2 | Engineering | P2, P3, P4, P5 | Primary implementer — all code changes |
| Agent 7 | Quality | P4, P6 | Bundle size oversight + code audit gate |
| Agent 11 | Quality | P1, P6 | Feature Bible creation + integrity gate |
| Visual Design | Design | P6 | Design review (right before sandbox) |
| Accessibility & Theming | Design | P6 | Accessibility + dark mode review |
| UX Completeness | Design | P6 | State completeness + UX flow review |

---

## Dependencies

```
P1 (Feature Bible) ──┐
                      ├──→ P3 (UI/UX Restructure) ──→ P6 (Quality Gates)
P2 (Service/Store) ──┘                                      ↑
                                                             │
P4 (Bundle Optimization) ───────────────────────────────────┘
P5 (Tech Debt) ─────────────────────────────────────────────┘
```

- P1 and P2 can run in parallel
- P3 depends on both P1 and P2
- P4 and P5 are independent — can run in parallel with everything
- P6 gates run after all implementation is complete

---

## Definition of Done

### Per-Parcel
- P1: Feature Bible reviewed by Director, open questions resolved
- P2: All CRUD operations working, dual store eliminated, no regressions in topic linking
- P3: All 3 dead UI elements functional, inline editing works, tag filter applies to both widgets, search finds pages, topic-scoped task creation works, empty states present
- P4: Bundle size <250KB initial JS gzipped, all vendor chunks configured, dead code removed
- P5: FTS results render bold text, WeekTimeline shows task blocks

### Sprint-Level
- All deterministic checks pass (lint, typecheck, test, build)
- Agent 7 code audit: no P0 issues
- Agent 11 feature integrity: Topics page meets Feature Bible, no regressions on other pages
- 3-agent design review: all PASS
- User sandbox approval on Netlify deploy preview
- Sprint retrospective written

---

## Deferred to Sprint 20+

| Item | Source | Notes |
|---|---|---|
| Electron vs. Tauri evaluation | CEO Session #4 | **URGENT** — blocks all local-first work. Agent 9 research parcel, start during Sprint 19. |
| Data layer abstraction (LocalAdapter/CloudAdapter) | CEO Session #4 | **Must-have Phase A** — refactor services to adapter pattern. Agent 3 to design. |
| Desktop packaging sprint | CEO Session #4 | **Must-have Phase A** — depends on Electron/Tauri decision. |
| Local-first storage (SQLite + file system) | CEO Session #4 | **Must-have Phase A** — vault folder, real files on disk. |
| File attachments + image embedding | CEO Session #4 | **Must-have Phase A** — files in project/topic folders, images inline in notes. |
| Setup wizard + vault selection + Obsidian import | CEO Session #4 | **Must-have Phase A** — choose folder, AI config, hatching, file copy import. |
| AI settings page + BYO API key wizard | CEO Priority #2 | Sprint 20 candidate — AI infrastructure |
| AI chat concierge | CEO Priority #3 | Depends on AI settings (#2) |
| Google Calendar integration | CEO Priority #4 | Separate sprint |
| Gmail integration | CEO Priority #5 | Separate sprint |
| Notifications & reminders | Ongoing backlog | Should-have Phase A |
| parentId topic nesting | Issue #9 | Dead schema — clean up in tech debt sprint |
| Hardcoded Daily Notes topic | Issue #10 | Complex, risk of breaking journal. Separate effort. |
| Cross-platform shortcut recording | Sprint 18 tech debt | Low priority |
| "Don't Miss Twice" forgiveness | Sprint 18 deferred | P2 |
| Year in Pixels | Sprint 18 deferred | P2 |
| AI "Organize My Day" | Sprint 18 deferred | Feeds into AI concierge |
| Filter/entity toggle system | Sprint 18 deferred | P2 |
| Timed habits | Sprint 18 deferred | P2 |
| Agent 8 Product Strategy Brief reconciliation | Agent 8 Docs | SaaS pricing in brief conflicts with CEO $249 decision. Reconcile when Phase B pricing research starts. |

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Topics restructure scope creep (too many UX improvements) | Medium | Schedule slip | Feature Bible defines exact scope. Defer nice-to-haves to Sprint 20. |
| Bundle optimization doesn't reach 200KB target | Medium | Low | 250KB is acceptable. 200KB is stretch goal. Major gains come from vendor chunks and lazy loading. |
| Dual store removal causes subtle regressions | Low | Medium | Test all topic linking flows after consolidation. Agent 11 Feature Bible is the regression contract. |
| Topics search-for-pages change breaks TopicPagePicker | Low | Low | TopicPagePicker already handles both — just extending the Topics list filter. |

---

*Sprint 19 Plan — Compiled by Director, March 1, 2026*
*Awaiting user approval*
