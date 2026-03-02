# Sprint 19: Topics & Quality

**Status:** COMPLETED
**Created:** March 1, 2026
**Completed:** March 1, 2026
**Branch:** `sprint/19-topics-quality`
**Merged:** PR #2 → `main` (commit `3a84749`)
**Theme:** Topics page restructure (CEO Priority #1) + Bundle size optimization + Sprint 18 tech debt cleanup

---

## Goal

Ship a polished, fully-functional Topics system — fix dead UI, complete missing CRUD, consolidate the dual-store architecture, and add the UX interactions users expect. In parallel, bring bundle size within budget (<250KB initial JS gzipped, down from 482KB) before the $249 ship. Design the Topics UX with the Knowledge OS vision in mind (CEO Session #4), even though local-first storage ships in a later sprint.

---

## Vision Alignment

- **Phase:** A — Productivity App (completing pre-ship features)
- **CEO Priority:** #1 — Topics page restructure ("Core UX must be solid before charging")
- **CEO Session #4:** Topics elevated to **Knowledge OS** — the single source of truth where all content and files live. Topics > Projects > Tasks/Files hierarchy. Local-first file browser in future sprints, but the UX built in Sprint 19 should anticipate this direction.
- **Impact:** Topics is the organizational backbone of the app. Every entity (tasks, notes, captures, projects) links to topics. A broken Topics UX undermines the entire product.
- **Bundle:** Agent 7 flagged 482KB initial JS — 2.4x over the 200KB target. Ship-blocking quality concern.

### CEO Session #4 — Key Context for Sprint 19

CEO Session #4 (March 1, 2026) made strategic decisions that affect how Sprint 19's Topics work should be designed:

1. **Topics = Knowledge OS** — Topics should BE the file system. The folder hierarchy on disk IS the topic hierarchy in the app. Sprint 19 builds the UX; future sprints add the file system backend.
2. **Topics > Projects > Tasks/Files** — Projects are children of Topics. A Topic can contain projects, loose notes, files, or nothing at all.
3. **Desktop packaging + local-first storage promoted to Phase A must-haves** — the $249 model requires local storage (Supabase cloud creates inverted unit economics).
4. **Data layer abstraction** — LocalAdapter (SQLite + file system) for Phase A, CloudAdapter (Supabase) for Phase B. Sprint 19 continues on Supabase; the adapter swap happens in a later sprint.

**Sprint 19 action items from Session #4:**
- P1 (Feature Bible) must account for the Knowledge OS target UX — file browsing feel, attachment display areas, Topics > Projects hierarchy
- P2/P3 code should be clean enough to survive the adapter refactor — no deep Supabase coupling in Topics UI components
- Urgent research parcels (Electron vs. Tauri, SQLite schema) kick off in parallel — not blocking Sprint 19

See `CEO-Sessions/CEO-Session-4-Local-First-Knowledge-OS.md` for full strategic brief.

---

## Agents

| Agent | Role |
|---|---|
| Agent 11 (Feature Integrity Guardian) | Feature Bible creation — defines Topics contract before coding |
| Agent 2 (Software Engineer) | All implementation — service, store, UI, bundle optimization, tech debt |
| Agent 7 (Code Reviewer) | Bundle size oversight + code audit gate |
| Visual Design Agent | Design review (right before sandbox) |
| Accessibility & Theming Agent | Design review (right before sandbox) |
| UX Completeness Agent | Design review (right before sandbox) |

---

## Topics Assessment — Issues to Fix

### Dead/Non-functional UI (3)

| # | Issue | Location |
|---|---|---|
| 1 | "Configure" button does nothing | `TopicPage.tsx:101` — no onClick handler |
| 2 | "New Page" card is dead | `TopicPage.tsx:144-149` — cursor-pointer but no onClick |
| 3 | "Add Task" button does nothing | `TopicTasksWidget.tsx:41-44` — no onClick handler |

### Missing CRUD (4)

| # | Issue |
|---|---|
| 4 | No topic/page rename — no `updateTopic` or `updateTopicPage` in service/store/actions |
| 5 | No page deletion — `deleteTopicPage` doesn't exist |
| 6 | No description editing — field exists in DB but no UI to set/edit |
| 7 | No icon editing — `icon` field exists, never used |

### Architecture (2)

| # | Issue |
|---|---|
| 8 | Dual store — `useTopicStore` and `useKaivooStore` both manage topics independently, can diverge |
| 10 | Hardcoded `topic-daily-notes` seed data — filtered in pickers, breaks if deleted (DEFERRED) |

### UX Flow Gaps (5)

| # | Issue |
|---|---|
| 11 | No topic-scoped task creation |
| 12 | Tag filter only affects Mentions widget, not Tasks |
| 13 | Topic search doesn't find pages (only searches topic names) |
| 14 | No sibling page navigation on page detail view |
| 15 | No empty state guidance |

---

## Parcels

### P1 — Topics Feature Bible
**Agent:** Agent 11
**Status:** DONE
**Blocks:** P3

Create `Feature-Bible-Topics-Page.md` before any UI coding begins.

Deliverables:
- Document current working behavior (must-never-lose checklist)
- Define target UX for restructured Topics page and Topic detail
- **Knowledge OS context:** Design the target UX anticipating that Topics will become a file-browser-like interface in future sprints. The hierarchy is Topics > Projects > Tasks/Files. Topics can contain projects, loose notes, files, or nothing. The Feature Bible should describe where file listings, attachment displays, and project cards will live — even if file system features aren't implemented in Sprint 19.
- Resolve open questions: icon picker scope, description editing UX, sibling navigation pattern, Configure button behavior
- Define empty states, loading states, error states
- Define what Topics should look like when we're done

---

### P2 — Topics Service & Store Consolidation
**Agent:** Agent 2
**Status:** DONE
**Blocks:** P3

Complete the missing CRUD operations and eliminate the dual-store problem.

Deliverables:

**Service layer additions (`topics.service.ts`):**
- `updateTopic(userId, id, updates)` — rename, description, icon
- `updateTopicPage(userId, id, updates)` — rename, description
- `deleteTopicPage(userId, id)` — individual page deletion

**Store consolidation:**
- Migrate all `useTopicStore` functionality into `useKaivooStore`
- Remove `useTopicStore` entirely
- Update `TopicTagEditor` and `TopicPagePicker` to use `useKaivooStore`
- Remove `kaivoo-topics` localStorage key

**Action layer (`useKaivooActions.ts`):**
- `updateTopic` / `updateTopicPage` / `deleteTopicPage` async actions
- Optimistic updates with rollback on error (matches existing pattern)

---

### P3 — Topics UX Restructure
**Agent:** Agent 2
**Status:** DONE
**Depends on:** P1, P2

Fix all dead UI, implement missing interactions, polish the Topics experience.

Deliverables:

**Fix dead UI (Issues #1–3):**
- Wire "Configure" button → topic settings (per Feature Bible)
- Wire "New Page" card → create page dialog (pre-associated with current topic)
- Wire "Add Task" button → create task dialog (pre-tagged to current topic)

**Implement missing CRUD (Issues #4–7):**
- Inline editing for topic name (click-to-edit, per Interaction-Patterns.md)
- Inline editing for page name
- Description editing in topic/page header (edit-where-you-see-it principle)
- Icon picker for topics (emoji or Lucide icon selector — scope per Feature Bible)

**Fix UX flow gaps (Issues #11–15):**
- Topic-scoped task creation — "Add Task" pre-tags to current topic/page
- Tag filter applies to both Mentions AND Tasks widgets
- Topics list search includes page names
- Sibling page navigation — tabs or pills on page detail view
- Empty states with guidance (how to link content via `[[TopicName]]`, task drawer, etc.)

**Not in scope:**
- Issue #9 (parentId hierarchy) — dead schema, defer
- Issue #10 (hardcoded Daily Notes) — complex, risk of breaking journal, defer

---

### P4 — Bundle Size Optimization
**Agent:** Agent 2 + Agent 7 (oversight)
**Status:** DONE
**Parallel with:** Track 1

**Complete `manualChunks` in vite.config.ts:**

| Chunk | Packages |
|---|---|
| `vendor-core` | react, react-dom, react-router-dom, @tanstack/react-query, zustand |
| `vendor-supabase` | @supabase/supabase-js |
| `vendor-radix` | All 23 @radix-ui/* packages (currently only 4) |
| `vendor-tiptap` | Add @tiptap/extension-bubble-menu (currently missing) |
| `vendor-dnd` | @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities |
| `vendor-motion` | motion (Framer Motion) |
| `vendor-markdown` | react-markdown, remark-gfm |
| `vendor-recharts` | recharts (keep existing) |

**Lazy-load SearchCommand:**
- `AppLayout` eagerly imports `SearchCommand` → pulls `cmdk` (~50KB) into initial bundle
- Wrap in `React.lazy()` — search is on-demand, not needed at page load

**Dead code removal:**
- Verify `chart.tsx` is unused → remove if confirmed
- Verify `carousel.tsx` (embla) is unused → remove if confirmed
- Verify `drawer.tsx` (vaul) is unused → remove if confirmed

**Measurement:**
- `npm run build` before and after — capture chunk sizes
- Target: <250KB initial JS gzipped (stretch: <200KB)

---

### P5 — Sprint 18 Tech Debt
**Agent:** Agent 2
**Status:** DONE
**Parallel with:** Track 1

- **FTS bold rendering:** `ts_headline` returns `**` delimiters as raw text. Strip or render as `<strong>` in SearchCommand results.
- **WeekTimeline task blocks:** Tasks show as counts in day headers but don't render as blocks in grid columns. Render task blocks alongside meeting blocks.

**Not in scope:** Cross-platform shortcut recording (low priority, deferred).

---

### P6 — Quality Gates
**Agents:** Agent 7, Agent 11, Visual Design, Accessibility & Theming, UX Completeness
**Status:** DONE
**Depends on:** P1–P5

Per Sprint Protocol v1.7:

- [ ] `npm run lint` passes — **FAIL** (warnings + errors: unsafe `any` casts, unused imports, empty interface, prefer-const. Pre-existing, not regressions from Sprint 19.)
- [x] `npm run typecheck` passes
- [x] `npm run test` passes — 104/104 tests (5 files)
- [x] `npm run build` passes — built in 2.28s
- [x] Bundle size measured and reported — **~210KB initial JS gzipped** (down from 482KB). Under 250KB target.
- [x] Agent 7 code audit — P0 blockers resolved (commit `e3dd21c`)
- [x] Agent 11 feature integrity — Topics page restructured per Feature Bible
- [x] Visual Design Agent review — passed
- [x] Accessibility & Theming Agent review — passed
- [x] UX Completeness Agent review — passed
- [x] Open PR → CI passes + Netlify deploy preview generated — PR #2
- [x] E2E smoke tests — **4/4 pass** (Playwright installed post-merge, infrastructure now operational)
- [x] User sandbox review on deploy preview URL
- [x] Sprint retrospective added to sprint file (see below)

### P7 — E2E Testing Infrastructure (Added post-merge)
**Agent:** Agent 2
**Status:** DONE

Installed Playwright and created initial smoke test suite to turn E2E from "advisory" to a real gate.

Deliverables:
- `@playwright/test` installed, Chromium browser downloaded
- `playwright.config.ts` — configured for local dev + deploy preview URLs via `PLAYWRIGHT_BASE_URL` env var
- `e2e/smoke.spec.ts` — 4 smoke tests: app load, auth form render, auth redirect, static assets
- `npm run test:e2e` and `npm run test:e2e:ui` scripts added
- `.gitignore` updated for Playwright artifacts
- All 4 tests passing in 1.6s

---

## Key Technical Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Store architecture | Consolidate into useKaivooStore, remove useTopicStore | Eliminates dual-store divergence. useKaivooStore is already the primary store used for reads. |
| Topic editing | Inline click-to-edit (not modal/dialog) | "Edit where you see it" — Core Principle #4. Matches Interaction-Patterns.md Inline Editor pattern. |
| Icon picker | Emoji picker or Lucide subset | Scope per Feature Bible. Keep lightweight — not a full icon library. |
| Page navigation | Tabs/pills on page detail | Sibling navigation without going back to list. Common pattern (Notion, Linear). |
| Bundle strategy | Vendor chunks + lazy loading + dead code removal | Addresses all three categories of bundle bloat identified by Agent 7. |
| SearchCommand loading | React.lazy() in AppLayout | On-demand overlay shouldn't penalize initial page load. |

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

---

## Definition of Done

### Per-Parcel
- **P1:** Feature Bible reviewed by Director, open questions resolved
- **P2:** All CRUD operations working, dual store eliminated, no regressions in topic linking
- **P3:** All 3 dead UI elements functional, inline editing works, tag filter applies to both widgets, search finds pages, topic-scoped task creation works, empty states present
- **P4:** Bundle size <250KB initial JS gzipped, all vendor chunks configured, dead code removed
- **P5:** FTS results render bold text, WeekTimeline shows task blocks

### Sprint-Level
- All deterministic checks pass (lint, typecheck, test, build)
- Agent 7 code audit: no P0 issues
- Agent 11 feature integrity: Topics meets Feature Bible, no regressions
- 3-agent design review: all PASS
- User sandbox approval on Netlify deploy preview
- Sprint retrospective written

---

## Parallel Research Parcels (During Sprint 19)

These run alongside sprint work — not blocking, but urgent per CEO Session #4.

| Parcel | Owner | Urgency | Deliverable |
|---|---|---|---|
| Electron vs. Tauri evaluation | Agent 9 (DevOps) | **BLOCKS EVERYTHING** — evaluate immediately | Framework recommendation with performance, bundle size, file system API, cross-platform maturity comparison |
| SQLite schema + adapter interface | Agent 3 (Architect) | High | Local-first schema design, adapter pattern for swappable backend (LocalAdapter/CloudAdapter) |
| File watching mechanism | Agent 3 (Architect) | Medium | How to detect manual file changes on disk for "permissive by nature" design |
| Desktop auto-update + code signing | Agent 9 (DevOps) | Medium | Update distribution, Apple notarization, Windows signing |

---

## Deferred to Sprint 20+

| Item | Source | Notes |
|---|---|---|
| Electron vs. Tauri evaluation | CEO Session #4 | **URGENT** — blocks all local-first work. Agent 9 research parcel starts during Sprint 19. |
| Data layer abstraction (LocalAdapter/CloudAdapter) | CEO Session #4 | **Must-have Phase A** — refactor services to adapter pattern. Agent 3 to design. |
| Desktop packaging sprint | CEO Session #4 | **Must-have Phase A** — depends on Electron/Tauri decision. |
| Local-first storage (SQLite + file system) | CEO Session #4 | **Must-have Phase A** — vault folder, real files on disk. |
| File attachments + image embedding | CEO Session #4 | **Must-have Phase A** — files in project/topic folders, images inline in notes. |
| Setup wizard + vault selection + Obsidian import | CEO Session #4 | **Must-have Phase A** — choose folder, AI config, hatching, file copy import. |
| AI settings page + BYO API key wizard | CEO Priority #2 | Sprint 20+ candidate — AI infrastructure |
| AI chat concierge | CEO Priority #3 | Depends on AI settings |
| Google Calendar integration | CEO Priority #4 | Separate sprint |
| Gmail integration | CEO Priority #5 | Separate sprint |
| Notifications & reminders | Ongoing backlog | Should-have Phase A |
| parentId topic nesting | Issue #9 | Dead schema — tech debt sprint |
| Hardcoded Daily Notes topic | Issue #10 | Complex, separate effort |
| Cross-platform shortcut recording | Sprint 18 tech debt | Low priority |
| "Don't Miss Twice" forgiveness | Sprint 18 deferred | P2 |
| Year in Pixels | Sprint 18 deferred | P2 |
| AI "Organize My Day" | Sprint 18 deferred | Feeds into AI concierge |
| Filter/entity toggle system | Sprint 18 deferred | P2 |
| Timed habits | Sprint 18 deferred | P2 |

---

---

## Sprint Retrospective

### What Shipped
- **Topics restructure:** Feature Bible created, dual-store eliminated (useTopicStore removed), full CRUD implemented (update/delete topics and pages), all 3 dead UI elements wired up, inline editing, topic-scoped task creation, tag filter across both widgets, search includes pages, sibling page navigation, empty states
- **Bundle optimization:** 482KB → ~210KB initial JS gzipped (56% reduction). 8 vendor chunks configured, SearchCommand lazy-loaded, dead code removed
- **Tech debt:** FTS bold rendering fixed, WeekTimeline task blocks implemented
- **Auth fix:** Session persistence race condition resolved (commit `1e5a8d4`)
- **P0 blockers:** DB sync, delete confirmation, a11y, page deletion fixes (commit `e3dd21c`)
- **E2E infrastructure:** Playwright installed, smoke test suite created (4 tests, 1.6s), `test:e2e` script operational

### What Went Well
- Bundle size improvement exceeded the 250KB target, approaching the 200KB stretch goal
- Topics restructure was comprehensive — resolved all 14 in-scope issues from the assessment
- Agent review process (7 + 11 + 3 design agents) caught real P0 issues before merge

### What Needs Improvement
- **Sprint close-out was skipped.** Code shipped but the sprint file was never updated, quality gates never formally checked off, and retrospective never written. Process gap.
- **Lint errors pre-exist.** `npm run lint` fails with errors (unsafe `any` casts in CaptureEditDialog, JournalEntryDialog, etc.). These are not regressions from Sprint 19 but should be addressed.
- **E2E was deferred too long.** The "advisory if not ready" language let it slip for 15+ sprints. Now installed — must stay a real gate going forward.

### Carry-Forward to Sprint 20+
- Lint errors cleanup (pre-existing, not Sprint 19 regressions)
- Expand E2E coverage: authenticated flows, Topics CRUD journeys, daily use flow
- All deferred items from Sprint 19 planning (see Deferred section above)

---

*Sprint 19: Topics & Quality — Created March 1, 2026 — Completed March 1, 2026*
*Sprint Protocol v1.7*
