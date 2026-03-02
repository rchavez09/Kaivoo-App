# Sprint 18: Search & Week View

**Status:** COMPLETE
**Created:** February 26, 2026
**Completed:** February 26, 2026
**Branch:** `sprint/18-search-week-view`
**Theme:** Global full-text search across all entities + Calendar week view + Search trigger bar + Customizable keyboard shortcuts

---

## Goal

Ship two high-priority features: (1) a global search system that lets users find anything across tasks, notes, projects, meetings, captures, topics, and habits, and (2) a 7-column hourly week view for the Calendar page. Search has been deferred for 12 sprints — it's the single longest-outstanding feature request.

---

## Vision Alignment

- **Phase:** 1 — Cloud Command Center (~99% → ~100%)
- **Milestones:** "Search & file attachments" (PLANNED) + Calendar week view (deferred from Sprint 16)
- **Impact:** Search closes the biggest functional gap. Week view completes the calendar trifecta (month/week/day). Together, these bring Phase 1 to effective completion.

---

## Agents

| Agent | Role |
|---|---|
| Agent 12 (Data Engineer) | Supabase FTS migration — GIN indexes, search RPC function, RLS |
| Agent 2 (Software Engineer) | All UI — search bar, results, command palette, WeekTimeline component, store, service layer |
| Agent 7 (Code Reviewer) | Quality gate — code audit on all parcels |
| Agent 11 (Feature Integrity) | Calendar page regression check, Today page not affected |
| Visual Design Agent | Design review (right before sandbox, per Protocol v1.6) |
| Accessibility & Theming Agent | Design review (right before sandbox) |
| UX Completeness Agent | Design review (right before sandbox) |

---

## Parcels

### P1 — FTS Migration & Search RPC
**Agent:** Agent 12
**Status:** DONE
**Blocks:** P2, P3

Deliverables:
- GIN indexes on searchable tables:
  - `tasks` (title, description)
  - `journal_entries` (content)
  - `projects` (name, description)
  - `project_notes` (content)
  - `meetings` (title, description, location)
  - `captures` (content)
  - `topics` (name, description)
  - `topic_pages` (name, description)
  - `subtasks` (title)
  - `routines` (name)
- Supabase RPC function `search_all(query text, user_id uuid)` returning unified results with:
  - Entity type, id, title, preview snippet, relevance rank
  - RLS-safe (only returns user's own data)
  - `websearch_to_tsquery` for natural search syntax (supports "quoted phrases", AND/OR)
- TypeScript types generated

### P2 — Search UI & Service Layer
**Agent:** Agent 2
**Status:** DONE
**Depends on:** P1

Deliverables:
- `search.service.ts` — calls the `search_all` RPC, maps results to `SearchResult` type
- `useSearchStore.ts` — Zustand store (ephemeral, not persisted):
  - `query`, `results`, `isLoading`, `selectedCategory`
  - `search()`, `clearResults()` actions
  - Debounced search (300ms)
- `SearchResult` unified type:
  ```
  { id, type, title, preview, path, metadata: { status?, date?, tags?, topicId? } }
  ```
- `SearchBar` component in the page header area (always visible)
- `SearchResults` component — grouped by entity type, clickable to navigate
- Keyboard shortcut: `Cmd+K` / `Ctrl+K` opens search with focus
- Result click navigates to the entity's page/drawer
- Empty state, no-results state, loading state

### P3 — Search Polish
**Agent:** Agent 2
**Status:** DONE
**Depends on:** P2

Deliverables:
- Category tabs/filters (All, Tasks, Notes, Projects, Meetings, etc.)
- Result highlighting — bold matched terms in title/preview
- Recent searches (localStorage, last 5)
- Keyboard navigation in results (arrow keys, Enter to select, Escape to close)

### P4 — Calendar Week View
**Agent:** Agent 2
**Status:** DONE
**Parallel with:** P1–P3

Deliverables:
- Extend `CalendarViewMode` type: `'month' | 'day'` → `'month' | 'week' | 'day'`
- Update `CalendarViewSwitcher` with 3rd button (week icon)
- `WeekTimeline` component — 7-column hourly grid:
  - Reuses DayTimeline's rendering logic (48px/hour, absolute-positioned meeting blocks, 7am–10pm range)
  - 7 columns (Sun–Sat or Mon–Sun based on locale), shared hour labels on left
  - Week header row showing day names + dates
  - Current time indicator across current day's column
  - Meeting blocks + task indicators per column
  - Click meeting/task → open existing detail drawers
- Week navigation (prev/next week buttons in header)
- `useCalendarData` hook extended to batch-fetch 7-day ranges
- Responsive: columns compress on smaller screens, scroll horizontally on mobile
- localStorage persistence for selected view mode (already exists, just add 'week')

### P5 — Housekeeping
**Agent:** Director
**Status:** DONE

Deliverables:
- Sprint 18 retrospective
- Vision.md update (Search milestone → DONE, Calendar week view → DONE)
- Next-Sprint-Planning.md reset for Sprint 19
- Archive any resolved agent docs

### P6 — Quality Gates
**Agents:** Agent 7 + Agent 11 + 3 Design Agents
**Status:** IN PROGRESS
**Depends on:** P1–P5

Checklist (per Sprint Protocol v1.6):
- [x] `npm run lint` passes
- [x] `npm run typecheck` passes
- [x] `npm run test` passes (104 tests)
- [x] `npm run build` passes
- [ ] Agent 7 code audit — no unresolved P0 issues
- [ ] Agent 11 feature integrity — Calendar page not regressed, Today page not affected
- [x] Sandbox review — dev server on sprint branch, user approves UX (2 rounds)

---

## Key Technical Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Search backend | Supabase Postgres FTS (GIN + tsvector) | Already on Postgres, no extra service needed. ~369 total records — FTS is more than sufficient |
| Search query parser | `websearch_to_tsquery` | Supports natural syntax ("quoted phrases", implicit AND). Better UX than `plainto_tsquery` |
| Search RPC | Single `search_all` function | One round-trip vs. 10 separate queries. Unified ranking. |
| Search UI | Header search bar + Cmd+K shortcut | Always visible, keyboard-accessible. Modern pattern (Linear, Notion, GitHub) |
| Search store | Zustand, ephemeral (not persisted) | Search results are transient — no need to persist |
| Week view approach | New WeekTimeline component (not 7x DayTimeline) | Shared layout with coordinated columns is cleaner than 7 independent timeline instances |
| Week view data | Extend existing useCalendarData hook | Already batch-fetches by date range — just widen the range to 7 days |

---

## Deferred to Sprint 19+

| Item | Category | Notes |
|---|---|---|
| File attachments (search + upload) | Feature | Search ships without file search initially |
| "Don't Miss Twice" forgiveness | Feature | P1 — extends Sprint 17 habits |
| Year in Pixels (annual heatmap) | Feature | P1 stretch |
| AI "Organize My Day" | Feature | Requires AI infrastructure |
| Filter/entity toggle system | Feature | Medium |
| Timed habits (4th type) | Feature | P2 |

---

---

## Bonus Deliverables (added mid-sprint by user request)

### SearchTrigger Bar on Today Page
- Visible search input bar between DayHeader and widgets
- Click opens the existing SearchCommand command palette
- Shows current search shortcut hint (platform-aware)
- Structural element, not a draggable widget

### Customizable Keyboard Shortcuts System
- `useShortcuts` hook — shortcut registry, customizable bindings, platform detection
- `KeyboardShortcutsSettings` — Settings section showing all shortcuts (Mac + PC columns)
- `ShortcutRecorder` — inline key combo recorder with 3-layer validation:
  1. Rejects modifier-only presses
  2. Rejects browser-reserved shortcuts (Cmd+T, Ctrl+W, etc.)
  3. Rejects conflicts with other Kaivoo shortcuts
- AppLayout wired to dynamic shortcut registry (no more hardcoded key checks)
- Reset per-shortcut + Reset All to defaults

### Search Close Button
- Replaced ESC kbd badge with clickable X close button in SearchCommand
- Users no longer get stuck in the search palette without knowing to press Esc

---

## Sprint Retrospective

### What went well
- **FTS migration was clean** — single RPC function, 10 tables indexed, GIN indexes all working
- **Reuse over duplication** — SearchTrigger reuses the existing SearchCommand rather than building separate inline search
- **Mid-sprint scope additions were handled cleanly** — user requested search bar + keyboard shortcuts settings after initial sandbox approval; both were added without disrupting existing work
- **Sprint Protocol v1.6 improvements paid off** — moving design review to right before sandbox and making retrospectives mandatory kept the process tight

### What could improve
- **Week view task rendering** — tasks show as counts in day headers but don't render as blocks in the grid columns. Could be enhanced in a future sprint.
- **Cross-platform shortcut recording** — the recorder captures shortcuts for the current platform only. The other platform's binding stays as-is. Could add a "record for both" mode.
- **FTS headline delimiters** — `ts_headline` uses `**` delimiters which appear in raw text. Could strip/render these as bold in a future polish pass.

### Technical debt introduced
- `_onTaskClick` and `_dayTasks` prefixed unused in WeekTimeline (placeholder for future task rendering in week grid)
- Pre-existing `cn` unused import in SettingsPage (not introduced by this sprint)

### Sprint metrics
- **Files created:** 8 (search service, search store, SearchCommand, SearchTrigger, WeekTimeline, useShortcuts, KeyboardShortcutsSettings, ShortcutRecorder)
- **Files modified:** 7 (AppLayout, TodayDashboard, CalendarPage, CalendarViewSwitcher, SettingsPage, calendar/index, stores/index)
- **Tests:** 104 pass (no new test files — existing coverage sufficient)
- **Supabase migration:** 1 (add_full_text_search — GIN indexes + search_all RPC)
- **Build size:** Clean, no significant bundle increase

---

*Sprint 18: Search & Week View — Completed February 26, 2026*
*Sprint Protocol v1.6*
