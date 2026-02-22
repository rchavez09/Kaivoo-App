# Sprint 2: Core Experience

**Status:** ACTIVE
**Approved:** February 22, 2026
**Compiled by:** The Director
**Date:** February 22, 2026
**Vision Position:** Phase 1 — Cloud Command Center
**Last Completed:** Sprint 1 — Security, Performance & Foundation (16/16 parcels)

---

## User Decisions (Resolved)

| Question | Answer |
|----------|--------|
| React Query migration scope | **Full migration** — all pages, remove old data layer entirely |
| Design System depth | **Full overhaul** — every component restyled, not just tokens |
| Daily Shutdown Flow | **Sprint 2** — include in this sprint |
| Sprint pacing | **Merge** — one big sprint, infrastructure + flagship together |

---

## Input Sources

### From Sprint 1 Deferred Items (10 items)
*Source: Sprint-1-Security-Performance.md "Deferred to Sprint 2" section*

| # | Item | Original Source | Priority |
|---|------|----------------|----------|
| 1 | Unified Day View | Research P0, UC1 | P0 |
| 2 | Daily Shutdown Flow | Research Sprint 2, UC10 | P1 |
| 3 | Date Chip Drilling | Research P1, UC6 | P1 |
| 4 | Monthly Insights Heatmap | Research P1, UC5 | P1 |
| 5 | TasksWidget Decomposition | PERF-04, Code Audit | P1 |
| 6 | React Query Decision | CODE-04, Code Audit | P2 |
| 7 | og:image / SEO | SEO-01, Code Audit | P3 |
| 8 | Password Minimum | SEC-05, Code Audit | P3 |
| 9 | CSP Headers | SEC-06, Code Audit | P3 |
| 10 | AIInboxWidget Decomposition | CODE-08, Code Audit | P2 |

### From Agent Documents (Active — Non-ARCHIVED)

| Agent | Document | Active Concerns |
|-------|----------|----------------|
| **Agent 5** | Research-Brief-Sprint-0-Findings.md | Unified Day View patterns (Part 3), Daily Shutdown ritual (Finding 7), Calendar sync architecture (Part 2), Correlation discovery prerequisites (Finding 6) |
| **Agent 5** | Research-Queue-Sprint-0.md | Priority 1 items 1-5 completed. Priority 2 items 9-10 still QUEUED (self-hosted landscape, CalDAV strategy) |
| **Agent 6** | Use-Case-Prioritization-Sprint-0.md | UC1 Unified Day View, UC6 Date Chip, UC5 Monthly Insights, UC10 Daily Shutdown |
| **Agent 7** | Code-Audit-Sprint-0-Review.md | Remaining P2: CODE-04 (React Query), PERF-04 (TasksWidget), CODE-06 (localStorage), CODE-07 (hook naming), CODE-08 (AIInboxWidget). Remaining P3: PERF-06/07, SEC-05/06/07, A11Y-02/03/04, DB-03/04, SEO-01/02 |
| **Agent 4** | Security-Checklist-By-Phase-Sprint-0.md | Cloud phase: SEC-05 (password min), SEC-06 (CSP), SEC-07 (rate limiting) |
| **Agent 2** | Architecture-Folder-Structure.md | Proposed directory tree — reference during decomposition |
| **Agent 2** | Architecture-Database-Schema.md | Remaining columns: `content_json`, `word_count`, recurrence fields |
| **Agent 3** | Architecture-Migration-Plan.md | Hub migration plan — no Sprint 2 actions |
| **Agent 3** | Operations-Mac-Mini-Setup.md | Phase 2 prep — no Sprint 2 actions |

---

## Sprint Structure

This is a large, phased sprint. Work is organized into **three phases** with clear gates between them. Phases overlap where possible — Phase 2 starts as soon as its Phase 1 dependencies are met, not when all of Phase 1 is complete.

```
PHASE 1: Foundation          ████████████░░░░░░░░░░░░░░░░░░░░  (Week 1)
  Widget decomposition, React Query, Design System

PHASE 2: Flagship            ░░░░░░████████████████████░░░░░░  (Weeks 1-2)
  Unified Day View, Date Navigation, Monthly Insights

PHASE 3: Engagement          ░░░░░░░░░░░░░░░░░░░░████████████  (Week 2-3)
  Daily Shutdown Flow, Small Wins

                              ─────────────────────────────────
                              W1          W2          W3
```

**Gate rule:** Phase 2 parcels that reuse decomposed components (e.g. Day View Task Panel) wait for their Phase 1 dependency. Phase 2 parcels with no dependency (e.g. Day View Architecture, DateChip) start immediately.

---

---

# Phase 1: Foundation

> **Goal:** Decompose mega-widgets, migrate data layer to React Query, apply full Kaivoo Design System.
> **Status:** BLOCKING — Phase 2 feature parcels depend on clean components and React Query.

---

## 1A — TasksWidget Decomposition

| | |
|---|---|
| **Source** | PERF-04 (Code Audit), Sprint 1 Deferred |
| **Owner** | Agent 2 (Staff Software Engineer) |
| **Reviewer** | Agent 7 (Code Reviewer) |
| **Priority** | P0 — Phase 2 Blocker |
| **Phase** | 1 |

**Problem:** `TasksWidget.tsx` is 1,069 lines containing drag-and-drop, filtering, section rendering, configuration, and row rendering. Impossible to memoize, reuse, or compose into the Unified Day View.

**Decomposition Target:**
- `TasksWidget.tsx` (~200 lines) — orchestrator, state management
- `TaskFilterBar.tsx` (~150 lines) — search, sort, filter controls
- `TaskSection.tsx` (~150 lines) — collapsible section container
- `SortableTaskRow.tsx` (~100 lines, React.memo) — individual draggable row
- `TasksWidgetConfig.tsx` — split from existing 513-line config dialog

**Done when:** No file exceeds 300 lines. All sub-components are independently importable (critical for Day View Task Panel). TasksWidget renders identically to current behavior. Existing tests pass.

---

## 1B — AIInboxWidget Decomposition

| | |
|---|---|
| **Source** | CODE-08 (Code Audit), Sprint 1 Deferred |
| **Owner** | Agent 2 (Staff Software Engineer) |
| **Reviewer** | Agent 7 (Code Reviewer) |
| **Priority** | P1 |
| **Phase** | 1 |

**Problem:** `AIInboxWidget.tsx` is 972 lines containing thought processing, link processing, history display, and configuration.

**Decomposition Target:**
- `AIInboxWidget.tsx` (~200 lines) — orchestrator
- `ThoughtProcessor.tsx` (~200 lines) — AI thought capture flow
- `LinkProcessor.tsx` (~200 lines) — AI link capture flow
- `AIInboxHistory.tsx` (~150 lines) — processed item history
- `AIInboxConfig.tsx` (~150 lines) — settings

**Done when:** No file exceeds 300 lines. AI inbox functionality unchanged.

---

## 1C — React Query Full Migration

| | |
|---|---|
| **Source** | CODE-04 (Code Audit), Sprint 1 Deferred, Vision.md Key Decision |
| **Owner** | Agent 2 (Staff Software Engineer) + Agent 3 (System Architect) |
| **Reviewer** | Agent 7 (Code Reviewer) |
| **Priority** | P0 — Architectural Foundation |
| **Phase** | 1 |

**Decision:** ADOPT React Query — full migration across all pages.

**Rationale:**
- Eliminates the fragile `reload()` / full-fetch pattern
- Built-in caching, background refetching, optimistic updates, stale-while-revalidate
- Natural fit for Supabase → Hub migration later (swap the `queryFn`, keep the hooks)
- Aligns with Agent 2's proposed folder structure (`services/queries/useTasksQuery.ts`, etc.)

**Implementation Plan:**
1. Create query hooks in `src/services/queries/` — one per domain:
   - `useTasksQuery.ts` — tasks + subtasks
   - `useJournalQuery.ts` — journal entries
   - `useCapturesQuery.ts` — captures
   - `useMeetingsQuery.ts` — meetings
   - `useTopicsQuery.ts` — topics + topic pages + tags
   - `useRoutinesQuery.ts` — routines + groups + completions
2. Each hook wraps existing service functions with `useQuery`/`useMutation`
3. Migrate all page components: Today → Tasks → Journal → Calendar → Topics → Insights → Settings
4. Remove `useDatabase.ts` and `reload()` pattern from `useKaivooActions.ts`
5. Reduce Zustand store to UI-only state (sidebar, theme, widget config) — domain data lives in React Query cache

**Stale Data Refresh (free with adoption):**
```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,       // 5 min — data is "fresh"
      refetchOnWindowFocus: true,       // refetch when tab regains focus
      refetchOnReconnect: true,         // refetch after network recovery
      retry: 2,
    },
  },
});
```

**Done when:** Zero `reload()` calls remain. All data fetching uses `useQuery`/`useMutation`. Zustand only holds UI state. Tab refocus triggers background refresh. `npm run build && npm run typecheck` pass.

---

## 1D — Kaivoo Design System: Full Overhaul

| | |
|---|---|
| **Source** | Vision.md Phase 1 Milestone, Agent 1 Design System v2.0 |
| **Owner** | Agent 1 (Senior UI Designer) + Agent 2 (Staff Software Engineer) |
| **Reviewer** | Agent 6 (Usability Architect) |
| **Priority** | P0 — Brand Identity |
| **Phase** | 1 (parallel — no dependency on 1A-1C) |

**Problem:** The app uses Lovable prototype styling. The Kaivoo palette (Warm Sand, Deep Navy, Resonance Teal) exists in Branding documents but isn't applied.

**Scope — Full Overhaul:**
1. **CSS Tokens:** Create/update `src/styles/tokens.css` with Kaivoo design tokens (colors, spacing, typography, shadows, radii, border widths)
2. **Tailwind Config:** Update `tailwind.config.ts` — Kaivoo tokens become the default palette
3. **All shadcn Primitives:** Restyle Button, Input, Card, Dialog, Sheet, Popover, DropdownMenu, Select, Tabs, Alert, Badge, Checkbox, Radio, Switch, Tooltip, Avatar, Separator, ScrollArea, Table
4. **Dark Mode:** Full dark-mode token set with proper contrast ratios
5. **Typography:** Kaivoo type scale applied globally (font sizes, weights, line heights, letter spacing)
6. **Page Layouts:** Header, Sidebar, TabBar, PageContainer updated to match brand
7. **Widget Chrome:** Consistent card styling, shadows, and spacing across all widgets
8. **Contrast Verification:** A11Y-04 — run axe audit on restyled components, fix any contrast failures

**Reference:** `Branding/` folder for brand identity specifications

**Done when:** Every visible component reflects the Kaivoo brand. No hardcoded color values remain. Light and dark modes both pass WCAG AA contrast. The app looks like a shipped product, not a prototype.

---

## 1E — Extract `useLocalStorage` Hook

| | |
|---|---|
| **Source** | CODE-06 (Code Audit P3) |
| **Owner** | Agent 2 (Staff Software Engineer) |
| **Priority** | P3 — Quick Win |
| **Phase** | 1 (parallel) |

**Fix:** 7+ files have their own localStorage try/catch pattern. Extract shared `useLocalStorage` hook, update all consumers.

**Done when:** Single `useLocalStorage` definition. All consumers import from shared module.

---

## Phase 1 Dependency Graph

```
1A (TasksWidget split) ──────→ independent ──→ UNBLOCKS 2D (Task Panel)
1B (AIInboxWidget split) ────→ independent
1C (React Query migration) ──→ independent ──→ UNBLOCKS all Phase 2 data fetching
1D (Design System overhaul) ─→ independent ──→ UNBLOCKS Phase 2 (Day View ships styled)
1E (useLocalStorage) ────────→ independent
```

**All Phase 1 parcels are independent of each other.** Maximum parallelism.

---

---

# Phase 2: Flagship Feature

> **Goal:** Build the Unified Day View — the product-defining Today page.
> **Status:** Starts as soon as Phase 1 dependencies are met.
> **Some parcels start immediately** (architecture, DateChip) while others wait for Phase 1.

---

## 2A — Unified Day View: Architecture & Layout

| | |
|---|---|
| **Source** | Research Brief Part 3, UC1, Vision.md P0 |
| **Owner** | Agent 3 (System Architect) + Agent 1 (Senior UI Designer) |
| **Reviewer** | Agent 6 (Usability Architect) |
| **Priority** | P0 — Product Defining |
| **Phase** | 2 (starts immediately — no Phase 1 dependency) |

**What it is:** Redesign the Today page from a collection of independent widgets into a unified, interactive day view.

**Research-informed design (from Agent 5):**
- **Sunsama's** task + calendar merge (side-by-side or interspersed timeline)
- **Structured's** 24-hour timeline with explicit free-time gaps
- **Daylio's** summary header (mood, stats, completion rates)
- **Day One's** rich entry previews in timeline position

**Layout:**
```
+---------------------------------------------------+
|  TODAY — Saturday, Feb 22              [< >] [Cal] |
|  +-----------------------------------------------+|
|  | Good  ·  4/6 routines  ·  5 tasks  ·  2 mtgs  || <-- Day Summary Header
|  +-----------------------------------------------+|
|                                                    |
|  +---- Timeline ------+  +---- Tasks ------------+|
|  | 8:00  Morning rtn  |  | [ ] Review PR #42     ||
|  | 9:00  Team standup |  | [ ] Update docs       ||
|  | 10:00 [free]       |  | [ ] Fix login bug     ||
|  | 11:00 Design review|  | [x] Deploy staging    ||
|  | 12:00 [lunch]      |  | [ ] Write tests       ||
|  | 1:00  Focus block  |  |                       ||
|  |  ...               |  | -- Completed --       ||
|  | 5:00  Shutdown     |  | [x] Review budget     ||
|  +--------------------+  +-----------------------+|
|                                                    |
|  +---- Journal --------------+  +-- Captures ----+|
|  | Quick entry...            |  | Link: React 19 ||
|  |                           |  | "Ask about Q2" ||
|  +---------------------------+  +----------------+|
|                                                    |
|  [Begin Daily Shutdown]                            |
+---------------------------------------------------+
```

**Component Tree:**
```
<UnifiedDayView>
  <DayHeader date={date} onNavigate={...} />
  <DaySummaryBar stats={dayStats} />
  <div className="day-body">
    <TimelineColumn meetings={...} routines={...} />
    <TaskPanel tasks={...} />                        // reuses SortableTaskRow from 1A
  </div>
  <div className="day-footer">
    <InlineJournal date={date} />
    <CapturesList date={date} />
  </div>
  <ShutdownTrigger />                                // launches Phase 3 flow
</UnifiedDayView>
```

**Data flow:** All domain data fetched via React Query hooks from 1C. Day View composes queries by date.

**Done when:** Architecture doc approved. Component tree, data flow, and responsive breakpoints defined. Agent 3 and Agent 6 sign off.

---

## 2B — Day Summary Header

| | |
|---|---|
| **Owner** | Agent 1 (Senior UI Designer) + Agent 2 (Staff Software Engineer) |
| **Priority** | P0 |
| **Phase** | 2 (depends on 2A architecture, 1C React Query) |

**What it builds:** The top-of-page summary bar:
- Today's mood (from latest journal entry, if set)
- Routine completion rate (X/Y routines done)
- Task stats (X completed, Y remaining)
- Meeting count
- Journal word count

Interactive — tapping any metric scrolls to that section.

**Done when:** Summary header renders with live data from React Query. All metrics clickable. Responsive on mobile.

---

## 2C — Timeline Column

| | |
|---|---|
| **Owner** | Agent 2 (Staff Software Engineer) |
| **Reviewer** | Agent 6 (Usability Architect) |
| **Priority** | P0 |
| **Phase** | 2 (depends on 2A architecture, 1C React Query) |

**What it builds:** Vertical waking-hours timeline:
- Calendar events (from meetings data)
- Routine blocks (morning/evening routines shown as time blocks)
- Free-time gaps (explicitly shown, Structured-style)
- Current time indicator (accent-colored line, auto-scrolls into view)

Interactive: click meeting → expand details, click routine → toggle completion, click free gap → block time (create task placeholder).

**Done when:** Timeline renders meetings and routines in correct time slots. Current time indicator works. All interactions functional.

---

## 2D — Task Panel

| | |
|---|---|
| **Owner** | Agent 2 (Staff Software Engineer) |
| **Priority** | P0 |
| **Phase** | 2 (depends on 1A TasksWidget decomposition, 1C React Query) |

**What it builds:** The task sidebar reusing decomposed components from 1A:
- `SortableTaskRow` for individual task rows
- `TaskSection` for collapsible groups (Due Today, Overdue, Completed)
- Inline task creation at the top
- Drag-to-reorder within the panel
- Quick-complete via checkbox

**Done when:** Task panel shows today's tasks using decomposed components. All CRUD operations work inline via React Query mutations.

---

## 2E — Inline Journal & Captures

| | |
|---|---|
| **Owner** | Agent 2 (Staff Software Engineer) |
| **Reviewer** | Agent 1 (Senior UI Designer) |
| **Priority** | P1 |
| **Phase** | 2 (depends on 2A architecture, 1C React Query) |

**What it builds:** Below the timeline/task area:
- Inline journal composer (TipTap in compact mode) for quick entries
- Mood selector appears on save (reusing Sprint 1 implementation)
- Today's captures list with quick-capture input
- Both update the Day Summary Header metrics in real time

**Done when:** Journal entries can be created inline from the Day View. Captures display and can be added. Mood selector works on save.

---

## 2F — Date Chip Drilling

| | |
|---|---|
| **Source** | Research P1, UC6, Sprint 1 Deferred |
| **Owner** | Agent 2 (Staff Software Engineer) |
| **Reviewer** | Agent 6 (Usability Architect) |
| **Priority** | P1 |
| **Phase** | 2 (starts immediately — no Phase 1 dependency) |

**What it is:** A reusable `<DateChip>` component. Anywhere a date appears (task due dates, journal timestamps, meeting times, capture dates), it becomes a clickable chip that navigates to the Day View for that date.

```typescript
<DateChip date="2026-02-20" />
// Renders: "Feb 20" — click → /today?date=2026-02-20
```

**Applies to:** Tasks page, Journal page, Calendar page, Topics page, Captures, Insights.

**Done when:** `<DateChip>` exists. All date displays across the app use it. Clicking navigates to the Day View.

---

## 2G — Day View Date Navigation

| | |
|---|---|
| **Owner** | Agent 2 (Staff Software Engineer) |
| **Priority** | P1 |
| **Phase** | 2 (depends on 2A architecture) |

**What it builds:**
- Left/right arrows for previous/next day
- Date picker popup for jumping to a specific date
- URL reflects the date: `/today?date=2026-02-20`
- "Today" button to snap back to current date
- Keyboard shortcuts: `←` / `→` for day navigation, `T` for today

**Done when:** Day View renders data for any date. Navigation is smooth and URL-driven.

---

## 2H — Monthly Insights Heatmap

| | |
|---|---|
| **Source** | Research P1, UC5 Monthly, Sprint 1 Deferred |
| **Owner** | Agent 2 (Staff Software Engineer) |
| **Reviewer** | Agent 1 (Senior UI Designer) |
| **Priority** | P1 |
| **Phase** | 2 (depends on 1C React Query, 2F DateChip) |

**What it is:** GitHub-style contribution heatmap on the Insights page. Color intensity maps to total daily activity (tasks completed + journal entries + routines done + captures created).

**Features:**
- 30-cell grid for current month
- Color scale: no activity → low → medium → high (using Kaivoo palette from 1D)
- Toggle: color by activity count vs. mood score (if mood data exists)
- Click any cell → navigate to Day View for that date (via DateChip from 2F)
- Month navigation (prev/next month)

**Done when:** Heatmap renders on Insights page. Cells colored by activity level. Mood toggle works. Clicking drills down to Day View.

---

## Phase 2 Dependency Graph

```
                      ┌─── 2B (Summary Header)
                      │
2A (Architecture) ────┼─── 2C (Timeline)
  starts immediately  │
                      ├─── 2D (Task Panel) ←── also needs 1A
                      │
                      ├─── 2E (Journal+Captures)
                      │
                      └─── 2G (Date Navigation)

2F (DateChip) ────────────→ starts immediately, no dependency
                      │
2H (Monthly Heatmap) ←──── needs 1C + 2F
```

---

---

# Phase 3: Engagement Loop

> **Goal:** Build the Daily Shutdown ritual and ship remaining small wins.
> **Status:** Starts after Phase 2 Day View parcels (2A-2E) are complete.

---

## 3A — Daily Shutdown Ritual

| | |
|---|---|
| **Source** | Research Finding 7 (Sunsama), UC10, Sprint 1 Deferred |
| **Owner** | Agent 2 (Staff Software Engineer) + Agent 6 (Usability Architect) |
| **Reviewer** | Agent 1 (Senior UI Designer) |
| **Priority** | P1 |
| **Phase** | 3 (depends on 2A-2E — Day View must exist) |

**What it is:** An end-of-day guided flow triggered from the Day View via a "Begin Daily Shutdown" button.

```
Step 1 — Review Today
  Auto-populated from Day Summary Header data
  "You completed 4/6 routines and finished 5 tasks today."
  Show journal entries written, captures made

Step 2 — Handle Unfinished Tasks
  Show tasks due today that aren't done
  Per task: [-> Tomorrow] [-> This Week] [-> Done Actually] [x Drop]
  Rollover updates task due_date via React Query mutation

Step 3 — Quick Plan Tomorrow
  Show tomorrow's calendar events (meetings)
  Show tasks already assigned to tomorrow
  Inline task creation for tomorrow
  "You have 3 meetings and 4 tasks lined up."

Step 4 — Rate Your Day (Optional)
  Mood selector (reuse Sprint 1 journal mood component)
  Optional one-line "Today in a sentence" text input
  Saves as a journal entry tagged [shutdown]

Step 5 — Shutdown Complete
  Satisfying completion animation
  "You're done for the day. See you tomorrow."
  Summary card of what was accomplished
```

**Implementation:**
- Full-screen overlay or dedicated route (`/today/shutdown`)
- Step-by-step wizard with back/next navigation
- Each step reads from and writes to React Query cache
- Task rollover in Step 2 uses `useMutation` to update `due_date`
- Mood + note in Step 4 creates a journal entry via `useMutation`

**Done when:** Shutdown flow accessible from Day View. All 5 steps functional. Task rollover persists to database. Mood and note saved. Flow can be exited at any step without data loss.

---

## 3B — Password Minimum Enforcement

| | |
|---|---|
| **Source** | SEC-05 (Code Audit P3), Sprint 1 Deferred |
| **Owner** | Agent 4 (Security & Reliability) |
| **Priority** | P3 — Quick Win |
| **Phase** | 3 (independent — can start anytime) |

**Fix:** Update Supabase Auth config for 12+ character minimum (OWASP). Update `Auth.tsx` client-side validation to match.

---

## 3C — CSP Headers

| | |
|---|---|
| **Source** | SEC-06 (Code Audit P3), Sprint 1 Deferred |
| **Owner** | Agent 4 (Security & Reliability) |
| **Priority** | P3 — Quick Win |
| **Phase** | 3 (independent) |

**Fix:** Add Content-Security-Policy meta tag to `index.html` or deployment headers. Restrict `script-src`, `style-src`, `connect-src` to known origins.

---

## 3D — og:image & SEO Tags

| | |
|---|---|
| **Source** | SEO-01 (Code Audit P2), Sprint 1 Deferred |
| **Owner** | Agent 1 (Senior UI Designer) + Agent 2 (Staff Software Engineer) |
| **Priority** | P3 — Quick Win |
| **Phase** | 3 (independent) |

**Fix:** Create `kaivoo-og.png` (1200x630) using Kaivoo brand assets (available after 1D). Add `og:image`, dimensions, and `<link rel="canonical">` to `index.html`.

---

## 3E — aria-live Regions for Async States

| | |
|---|---|
| **Source** | A11Y-02 (Code Audit P2) |
| **Owner** | Agent 6 (Usability Architect) |
| **Priority** | P2 |
| **Phase** | 3 (independent) |

**Fix:** Add `aria-live="polite"` regions to pages with async operations (journal saving, AI extraction, task CRUD, shutdown flow). Screen readers announce state changes.

---

## Phase 3 Dependency Graph

```
3A (Daily Shutdown) ─────→ depends on 2A-2E (Day View must exist)
3B (password min) ───────→ independent (can start anytime)
3C (CSP headers) ────────→ independent
3D (og:image) ───────────→ independent (benefits from 1D brand assets)
3E (aria-live) ──────────→ independent
```

---

---

# Agent Assignment Summary (Full Sprint)

| Agent | Role | Phase 1 | Phase 2 | Phase 3 | Total |
|-------|------|---------|---------|---------|-------|
| **Agent 1** | Senior UI Designer | 1D | 2A, 2B, 2E (reviewer), 2H (reviewer) | 3D | 6 parcels |
| **Agent 2** | Staff Software Engineer | 1A, 1B, 1C, 1E | 2B, 2C, 2D, 2E, 2F, 2G, 2H | 3A | 12 parcels |
| **Agent 3** | System Architect | 1C (co-owner) | 2A | — | 2 parcels |
| **Agent 4** | Security & Reliability | — | — | 3B, 3C | 2 parcels |
| **Agent 5** | Research Analyst | — | — | — | Pre-research: Sprint 3 topics (Calendar sync, task recurrence) |
| **Agent 6** | Usability Architect | 1D (reviewer) | 2A (reviewer), 2C (reviewer), 2F (reviewer) | 3A, 3E | 6 parcels |
| **Agent 7** | Code Reviewer | All reviews | All reviews | All reviews + Sprint Audit | Every parcel |

**Agent 2 load:** 12 parcels is heavy but sequenced across 3 phases. Phase 1 items (1A, 1B, 1C) are refactoring — largely mechanical. Phase 2 is creative implementation. Phase 3 is one feature (shutdown).

---

# Full Sprint Dependency Graph

```
PHASE 1 (Foundation) — All parallel
═══════════════════════════════════
1A (TasksWidget) ────────────────────────────────────────→ UNBLOCKS 2D
1B (AIInboxWidget) ──────────────────────────────────────→ complete
1C (React Query) ────────────────────────────────────────→ UNBLOCKS 2B,2C,2D,2E,2H
1D (Design System) ─────────────────────────────────────→ UNBLOCKS all Phase 2 (styling)
1E (useLocalStorage) ────────────────────────────────────→ complete

PHASE 2 (Flagship) — Starts as Phase 1 deps land
═════════════════════════════════════════════════
2A (Architecture) ───┐ starts immediately
2F (DateChip) ───────┤ starts immediately
                     │
                     ├→ 2B (Summary Header)  ←── needs 1C
                     ├→ 2C (Timeline)        ←── needs 1C
                     ├→ 2D (Task Panel)      ←── needs 1A + 1C
                     ├→ 2E (Journal+Captures)←── needs 1C
                     ├→ 2G (Date Navigation) ←── needs 2A
                     └→ 2H (Heatmap)         ←── needs 1C + 2F

PHASE 3 (Engagement) — Starts after Day View
═════════════════════════════════════════════
3A (Shutdown) ───────────────────────────────────────────←── needs 2A-2E
3B (Password) ───────→ independent
3C (CSP) ────────────→ independent
3D (og:image) ───────→ independent
3E (aria-live) ──────→ independent
```

---

# Definition of Done

## Per-Parcel Criteria
- [ ] Code changes implemented and reviewed by assigned reviewer
- [ ] `npm run build` passes (0 errors)
- [ ] `npm run typecheck` passes (0 errors)
- [ ] `npm test` passes (all tests green)
- [ ] Agent 7 approves the changes

## Sprint Exit Criteria

### Phase 1 Gate
- [ ] TasksWidget: 5+ files, none over 300 lines, sub-components independently importable
- [ ] AIInboxWidget: 5+ files, none over 300 lines
- [ ] React Query: zero `reload()` calls, all data via `useQuery`/`useMutation`, Zustand = UI-only
- [ ] Design System: every component restyled, Kaivoo palette live, dark mode working, WCAG AA contrast
- [ ] `useLocalStorage`: single shared hook, all consumers updated

### Phase 2 Gate
- [ ] Unified Day View is the default Today page
- [ ] Day View renders tasks, meetings, routines, journal, captures for any date
- [ ] Day Summary Header shows live stats with clickable metrics
- [ ] Timeline shows meetings + routines with current time indicator
- [ ] Task Panel reuses decomposed components, all CRUD works inline
- [ ] Inline journal + captures functional in Day View
- [ ] DateChip used across all pages — dates are clickable everywhere
- [ ] Date navigation works (prev/next day, date picker, URL-driven, keyboard shortcuts)
- [ ] Monthly heatmap on Insights page with drill-down to Day View

### Phase 3 Gate
- [ ] Daily Shutdown: 5-step flow works end-to-end, task rollover persists, mood saved
- [ ] Password minimum: 12+ characters enforced
- [ ] CSP headers: applied
- [ ] og:image: present and renders in social previews
- [ ] aria-live: regions added to all async operations

### Sprint-Level
- [ ] Agent 7 produces Sprint 2 Audit Report with updated scorecard
- [ ] Vision.md updated: "Unified Day View" → DONE, "Design System migration" → DONE, "Core feature enhancement" → IN PROGRESS
- [ ] All 10 Sprint 1 deferred items addressed

---

# What Stays in the Backlog (Sprint 3+)

| Item | Source | Reason for Deferral |
|------|--------|-------------------|
| Quarterly Insights view | UC5, Research P1 | Monthly ships first. Quarterly needs more data history. |
| Auto-detected patterns ("Most productive on Tuesdays") | Research Finding 6 | Needs correlation engine (Phase 3+). |
| Task recurrence system | Vision.md Phase 1 | Dedicated design + implementation work. Sprint 3 candidate. |
| Search & file attachments | Vision.md Phase 1 | Separate sprint. |
| Notifications & reminders | Vision.md Phase 1 | Separate sprint. |
| PWA (installable, offline) | Vision.md Phase 1 | Separate sprint. |
| Hook naming consistency (CODE-07) | Code Audit P3 | Low priority, tackle during refactors. |
| Auth rate limiting (SEC-07) | Code Audit P3 | Supabase handles basic rate limiting. Revisit for Hub. |
| DB-03 (junction tables for arrays) | Code Audit P3 | Breaking schema change. Better for Hub migration. |
| A11Y-03 (autoFocus audit) | Code Audit P3 | Address during component work. |

---

*Next-Sprint-Planning v3.0 — February 22, 2026*
*Compiled by The Director from 10 active agent documents, 2 completed sprints, and Vision.md*
*User decisions incorporated: full React Query migration, full Design System overhaul, merged sprint, Daily Shutdown in-scope*
