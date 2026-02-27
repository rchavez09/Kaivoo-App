# Sprint 17: Routines & Habits — Full Habit Tracking System

**Status:** Approved
**Created:** February 26, 2026
**Branch:** `sprint/17-routines-habits`
**Theme:** Transform the basic routines system into a full habit tracking experience with streaks, strength scores, analytics, and mood correlation

---

## Goal

Ship the complete Routines & Habits page: habits list with time-of-day sections, three habit types (Positive, Negative, Multi-count), streak counters, habit strength scores, analytics dashboard with mood-habit correlation, and an upgraded Today widget. Migrate existing routines into the new unified system.

---

## Vision Alignment

- **Phase:** 1 — Cloud Command Center (~99% → ~100% complete)
- **Milestone:** Core feature enhancement — extends Sprints 7-8, 14 work
- **Impact:** Users get a complete habit tracking system integrated with their daily command center. Mood-habit correlation is a differentiator no competitor in the combined productivity space offers.
- **Research:** Feature Bible v0.2 complete. 8-app competitive analysis (Streaks, Habitica, Daylio, Fabulous, Productive, Done, Loop, Atoms). All user Q&A resolved.

---

## Agents

| Agent | Role |
|---|---|
| Visual Design Agent | Gate 1: Component specs (habit row, sections, animations, strength bar, calendar dots, detail drawer, analytics cards) |
| Accessibility & Theming Agent | Gate 1: Dark mode tokens, focus states, ARIA for progress indicators, screen reader announcements, color-blind safe habit colors |
| UX Completeness Agent | Gate 1: State inventory (empty, first-time, all-complete, no-data analytics), navigation flows, error states |
| Agent 12 (Data Engineer) | Schema design (`habits` + `habit_completions`), routines migration, RLS, TS type generation |
| Agent 2 (Software Engineer) | All UI implementation — page, components, service layer, Zustand store, Recharts integration |
| Agent 7 (Code Reviewer) | Quality gate — code audit on all parcels |
| Agent 11 (Feature Integrity) | Today page regression check, Feature Bible compliance verification |

---

## Parcels

### P0 — Design Gate 1
**Agents:** Visual Design + Accessibility & Theming + UX Completeness
**Status:** Pending
**Blocks:** P2, P3, P4, P5, P6, P7

Deliverables:
- Visual Design: Component-level specs for HabitRow, TimeBlockSection, CompletionAnimation, StrengthBar, CalendarDots, HabitDetailDrawer, AnalyticsCards, MilestoneBadge
- Accessibility: Dark mode color tokens, focus order, ARIA roles for progress indicators, screen reader completion announcements, `prefers-reduced-motion` for animations, color-blind safe palette
- UX Completeness: Full state inventory (empty habits, first habit creation, all-complete celebration, no-data analytics, error states), Today ↔ Routines navigation flow

### P1 — Schema & Migration
**Agent:** Agent 12
**Status:** Pending
**Blocks:** P2, P3, P4, P5, P6, P7
**Parallel with:** P0

Deliverables:
- New `habits` table (id, user_id, name, icon, color, type, time_block, schedule, target_count, strength, current_streak, best_streak, is_archived, created_at, updated_at)
- New `habit_completions` table (id, habit_id, user_id, date, completed, count, skipped, created_at)
- RLS policies (using `(select auth.uid())` subquery form)
- Migration script: existing `routines` → `habits` + `habit_completions` (completed_dates array → individual completion rows)
- TypeScript types generated
- Supabase service layer (CRUD + completion queries + analytics aggregations)

### P2 — Core Page & Habits List
**Agent:** Agent 2
**Status:** Pending
**Depends on:** P0, P1

Deliverables:
- `RoutinesPage` shell with Today/Analytics view toggle
- `HabitRow` component — displays habit name, icon, color, streak, strength, completion state
- `TimeBlockSection` — Morning/Afternoon/Evening/Anytime grouping headers
- Three habit types rendered correctly:
  - Positive: tap to complete with color-fill animation
  - Negative (zero-target): pre-completed, tap to log slip
  - Multi-count: progress ring showing count/target
- Zustand store for habits state management
- Route registration with `React.lazy()` + Suspense

### P3 — CRUD & Scheduling
**Agent:** Agent 2
**Status:** Pending
**Depends on:** P2

Deliverables:
- `HabitFormDrawer` — create/edit habit with fields: name, icon picker, color picker, type, time block, schedule
- Frequency scheduling UI: daily, specific days (day-of-week checkboxes), X times/week
- Archive and delete actions with confirmation
- Optimistic updates with rollback on failure

### P4 — Streaks & Gamification
**Agent:** Agent 2
**Status:** Pending
**Depends on:** P2

Deliverables:
- Streak counter display (current + best) per habit
- Habit strength score (0-100%) with exponential smoothing algorithm (Loop pattern, half_life ≈ 13 days for daily)
- Strength recalculation on completion/miss
- `MilestoneBadge` component for 7/30/100-day achievements
- Visual celebration moment on milestone hit (respects `prefers-reduced-motion`)

### P5 — Habit Detail View
**Agent:** Agent 2
**Status:** Pending
**Depends on:** P3, P4

Deliverables:
- `HabitDetailDrawer` — drill-in view per habit
- Calendar dots (monthly view showing completed/partial/missed/future days)
- Strength over time chart (Recharts line chart)
- Mood impact section (avg mood on days with/without this habit)
- Completion rate (last 30 days)
- Edit/Archive actions from detail view

**Note:** Recharts must be in a separate vendor chunk (`vendor-recharts`) per Agent 7 bundle standards.

### P6 — Analytics Dashboard
**Agent:** Agent 2
**Status:** Pending
**Depends on:** P5

Deliverables:
- Analytics view (toggled from Today view on RoutinesPage)
- This Week overview — daily completion counts + percentages
- Habit Strength Rankings — all habits sorted by strength with bar visualization
- Monthly calendar — completed/partial/missed dot calendar for all habits or filtered per habit
- Mood-habit correlation — "Days you X correlate with Y% higher mood" insights using Day Brief mood data
- Overall strength score across all habits

### P7 — Today Widget Sync
**Agent:** Agent 2
**Status:** Pending
**Depends on:** P2

Deliverables:
- Upgrade existing Today page Routines widget to use new habits data
- Add streak counts + strength indicators to widget habit rows
- Two-way sync: completing a habit on Today page updates Routines page state (and vice versa)
- Ensure no regressions to existing Today page functionality (Agent 11 to verify)

### P8 — Housekeeping
**Agent:** Director
**Status:** Pending

Deliverables:
- Sprint 17 retrospective
- Vision.md update (Calendar milestone → DONE, Routines & Habits milestone added)
- Next-Sprint-Planning.md reset for Sprint 18
- Archive resolved agent docs (verify Sprint 12 P0 findings resolved)

### P9 — Quality Gates
**Agents:** Agent 7 + Agent 11 + 3 Design Agents
**Status:** Pending
**Depends on:** P2-P8

Checklist:
- [ ] `npm run lint` passes
- [ ] `npm run typecheck` passes
- [ ] `npm run test` passes
- [ ] `npm run build` passes
- [ ] Agent 7 code audit — no unresolved P0 issues
- [ ] Agent 11 feature integrity — Today page not regressed, Feature Bible P0 items all shipped
- [ ] Visual Design Agent — visual quality pass
- [ ] Accessibility & Theming Agent — a11y pass
- [ ] UX Completeness Agent — state completeness pass
- [ ] Sandbox review — dev server on sprint branch, user approves UX

---

## Key Technical Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Habit strength algorithm | Exponential smoothing (Loop pattern) | Psychologically honest — missing 1 day doesn't destroy progress |
| Data migration | Merge (upgrade) — routines → habits | User-confirmed. One unified system. |
| Negative habit UX | Zero-target (Done model) | Tracks failure frequency, better analytics data |
| Charts library | Recharts (existing dep) | Already used for other charts; must be in vendor chunk |
| Completion animation | Color-fill on tap | Researched across 8 apps — satisfying micro-reward |
| Today widget | Upgrade in place | Two-way sync with new habits data model |

---

## Deferred to Sprint 18+

| Item | Category | Notes |
|---|---|---|
| "Don't Miss Twice" forgiveness | Feature | P1 stretch — 1-day buffer before streak breaks |
| Year in Pixels (annual heatmap) | Feature | P1 stretch — Daylio pattern |
| Export/import habits + completions | Feature | P1 — extend existing export system |
| Timed habits (4th type) | Feature | P2 — requires timer UI |
| Habit categories (user-defined) | Feature | P2 |
| Habit suggestions library | Feature | P2 |
| Captures page deprecation | Housekeeping | User deferred — not yet |
| Week view (calendar) | Feature | High — extends Sprint 16 |
| Full-text search | Feature | High — deferred since Sprint 7 |
| AI "Organize My Day" | Feature | High — requires AI infrastructure |
| Filter/entity toggle system | Feature | Medium |
| Entry templates | Feature | Medium |

---

---

## Sprint Retrospective

**Completed:** February 26, 2026
**Parcels Completed:** All (P0–P9)
**Branch:** `sprint/17-routines-habits` → merged to `main` (commit `a45927d`)

### What Was Delivered
- Full habits system: three habit types (Positive, Negative, Multi-count), streaks, strength scores (exponential smoothing)
- Routines → Habits migration (existing routines upgraded to new data model)
- Analytics dashboard with mood-habit correlation
- Today widget redesign with streak/strength indicators and two-way sync
- Habit detail view with calendar dots, strength-over-time charts
- `habits` columns added to `routines` + `routine_completions` tables (Sprint 17 migration)
- Accessibility fixes: focus ring on view switcher, aria-pressed on Review toggle

### Verification Results
- Deterministic checks: lint, typecheck, test, build — all passed
- Agent 7 code audit: passed (addDays import restored, resolveTaskDay extracted, unused totalMeetings removed)
- Agent 11 feature integrity: Today page verified, no regressions
- Design review: passed
- Sandbox review: user approved

### Key Learnings
- Habits export/import was already covered by existing DataSettings — no extra work needed
- Code splitting (React.lazy + vendor chunks) already in place from earlier sprints

*Sprint 17: Routines & Habits — Completed February 26, 2026*
*Sprint Protocol v1.5*
