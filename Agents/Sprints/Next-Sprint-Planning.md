# Sprint 3 — Phase 1B: Widget Flexibility & Activity Trace

**Compiled by:** The Director
**Date:** February 22, 2026
**Sprint:** 3 (Restore & Define) — continuation of Phase 1
**Branch:** `sprint/3-restore-define`
**Status:** AWAITING USER APPROVAL

---

## Context

Sprint 3 Phase 1 (Parcels P1–P7) has been implemented on the sprint branch. The widget-based Today dashboard is restored with DayBriefWidget, TasksWidget, TrackingWidget, ScheduleWidget, FloatingChat, and DailyShutdown. All widgets are date-aware. Build passes (`tsc --noEmit` + `vite build`).

**User review surfaced three issues before we can proceed to Phase 2 (audit + merge):**

1. **Layout is hardcoded** — Tasks and Routines are forced into a side-by-side 2-column grid. User wants them **stacked vertically** and wants to **choose their own layout**.
2. **Activity trace is missing** — The `TodayActivityWidget` (a collapsible live feed of completed tasks, routines, journal entries, and captures) was not wired into the new dashboard. User explicitly misses this feature: *"I used to have a live trace of everything I got completed. This was on a dropdown, so I could hide it if necessary."*
3. **No widget configurability** — User cannot add/remove/reorder widgets. The existing `WidgetContainer.tsx` (348 lines, complete with @dnd-kit drag-to-reorder, add/remove picker, vertical/horizontal layout toggle) exists but is not used by TodayDashboard.

---

## Input Sources

| Source | Attribution | Key Takeaway |
|--------|------------|--------------|
| User feedback (Session Feb 22) | User | Stacked vertical layout, user-configurable arrangement, activity trace restored |
| `Agents/Vision.md` v3.0 | Director | Phase 1 — Cloud Command Center. Principle #3: Day-centric design. Principle #4: Edit where you see it. |
| `Agents/Quality/Agent-11-Docs/Feature-Use-Case-Bible.md` v0.4 | Agent 11 | Must-Never-Lose: activity feed showing today's completions |
| `Agents/Quality/Agent-11-Docs/Feature-Bible-Settings.md` v0.1 | Agent 11 | Widget arrangement is a user preference that should persist |
| `daily-flow/src/components/widgets/WidgetContainer.tsx` | Existing code | Complete drag-to-reorder system, layout toggle, add/remove picker — already built |
| `daily-flow/src/components/widgets/TodayActivityWidget.tsx` | Existing code | 499-line widget, fully functional with expand/collapse — not wired to TodayDashboard |
| `daily-flow/src/hooks/useWidgetSettings.ts` | Existing code | Persistence hook for widget config (Supabase + localStorage fallback, 400ms debounce) |
| `Agents/Design/Agent-6-Docs/Use-Case-Prioritization-Sprint-0.md` | Agent 6 | Foundation-tier use cases include configurable dashboard layout |

---

## Agent Assignments

| Agent | Role | Involvement | Rationale |
|-------|------|-------------|-----------|
| **Agent 2** (Staff Software Engineer) | Implementation | All 3 parcels | Code changes to TodayDashboard, ScheduleWidget, TodayActivityWidget |
| **Agent 6** (Usability Architect) | Consult | Default widget order, layout toggle placement | Ensures the default experience feels right before user customizes |
| **Agent 11** (Feature Integrity Guardian) | Gate | Post-implementation Bible regression check | Verify activity trace, widget config, and all Phase 1 features are intact |
| **Agent 7** (Code Reviewer) | Gate | Code audit on full sprint branch before merge | Quality gate per protocol |

**Not needed for this phase:**
- Agent 1 (no new visual design — using existing WidgetContainer UI)
- Agent 3 (no architecture changes — using existing hooks and patterns)
- Agent 4 (no security implications — no new data access patterns)
- Agent 5 (no research needed)
- Agent 8 (no business model impact)
- Agent 9 (no DevOps changes)
- Agent 10 (test infra not yet active — Sprint 4+)

---

## Parcels

### P1B-1: Make ScheduleWidget Self-Contained
**Owner:** Agent 2

**Problem:** ScheduleWidget currently receives `meetings` as a prop filtered externally by TodayDashboard. For WidgetContainer to render it, each widget must be self-contained (receive only `date` and fetch its own data).

**Changes:**
- Add `date?: Date` prop to ScheduleWidget
- Read meetings from `useKaivooStore` directly, filtered by `date`
- Remove `meetings` prop (or keep as optional override)
- Keep `onMeetingClick` callback prop

**Files:** `daily-flow/src/components/today/ScheduleWidget.tsx`

---

### P1B-2: Make TodayActivityWidget Date-Aware
**Owner:** Agent 2

**Problem:** TodayActivityWidget is hardcoded to `new Date()`. It needs to show activity for the selected date when navigating to past/future days.

**Changes:**
- Add optional `date?: Date` prop
- When `date` is provided, filter journal entries, tasks, captures, routine completions for that date instead of today
- Keep all existing functionality: expand/collapse, click-through to drawers, edit/delete actions, timeline UI

**Files:** `daily-flow/src/components/widgets/TodayActivityWidget.tsx`

---

### P1B-3: Refactor TodayDashboard to Use WidgetContainer
**Owner:** Agent 2 | **Consult:** Agent 6

**Problem:** TodayDashboard has a hardcoded 2-column grid layout. User can't choose vertical vs horizontal, can't reorder widgets, can't hide/show them.

**Changes:**
- Replace the hardcoded layout in `TodayDashboard.tsx` with `WidgetContainer`
- Define available widget types: `day-brief`, `tasks`, `routines`, `schedule`, `activity`
- Implement `renderWidget(config)` function that maps widget type → React component with `date` prop
- Use `useWidgetSettings('today-dashboard', defaultConfig)` for persistence
- DayHeader and DailyShutdown remain **outside** the WidgetContainer (structural, not optional)
- Wire callback props through: `onTaskClick`, `onMeetingClick`, journal/capture actions

**Agent 6 guidance — Default widget order (vertical layout):**
1. Day Brief (insight chips + summary + mood)
2. Tasks (configurable sections)
3. Routines (icon buttons + progress bars)
4. Today's Activity (live completion trace, collapsible)
5. Schedule (meetings, auto-hides when empty)

**Default layout:** Vertical (stacked). User can switch to horizontal via WidgetContainer's built-in toggle.

**Files:** `daily-flow/src/components/today/TodayDashboard.tsx`

---

## Dependencies

```
P1B-1 (ScheduleWidget self-contained) ──┐
                                          ├──→ P1B-3 (WidgetContainer refactor)
P1B-2 (ActivityWidget date-aware) ───────┘
                                          │
                                          ↓
                                    Phase 2 Gates
                                    (Agent 11 + Agent 7 + User UX Review)
```

P1B-1 and P1B-2 can run **in parallel** — they're independent widget changes. P1B-3 depends on both being complete (all widgets must be self-contained before wiring into WidgetContainer).

---

## Definition of Done

```
P1B-1 (ScheduleWidget):
  □ Accepts date prop, reads meetings from store
  □ No external data passing needed from parent

P1B-2 (TodayActivityWidget):
  □ Accepts optional date prop
  □ Shows activity for selected date (not hardcoded to today)
  □ Collapsible via chevron toggle
  □ Click-through works (task → drawer, journal/capture → edit/delete)

P1B-3 (WidgetContainer Integration):
  □ TodayDashboard uses WidgetContainer for layout
  □ Default layout is vertical (stacked)
  □ User can toggle to horizontal (2-column) via built-in control
  □ User can drag-to-reorder widgets in edit mode
  □ User can add/remove widgets via picker
  □ Widget order and layout persist across sessions (useWidgetSettings)
  □ DayHeader and DailyShutdown remain outside the container

Sprint-Level:
  □ tsc --noEmit passes with 0 errors
  □ vite build succeeds
  □ Visual review on dev server confirms all widgets render correctly
```

---

## After Phase 1B Completes

Once these 3 parcels are done, we proceed to the existing Phase 2 gates:

1. **Agent 11 regression check** — Run full Bible checklist on sprint branch
2. **Agent 7 code audit** — Audit all Sprint 3 changes (P1 through P1B)
3. **User UX review** — User reviews running app on dev server, approves before merge
4. **Merge to main** — `git merge sprint/3-restore-define`
5. **Tag** — `git tag post-sprint-3`
6. **Sprint retrospective** — Added to Sprint-3 file

---

## Deferred Items (Not In Scope)

These remain on the backlog for future sprints:
- Task recurrence system (Vision Phase 1)
- Search & file attachments (Vision Phase 1)
- Notifications & reminders (Vision Phase 1)
- PWA support (Vision Phase 1)
- Data import tools — Notion, Obsidian (Agent 8)
- CI/CD pipeline (Agent 9)
- Electron vs Tauri evaluation (Agent 9)

---

*Compiled by the Director — February 22, 2026*
*Pending user approval before implementation begins*
