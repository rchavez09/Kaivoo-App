# Sprint 3: Restore & Define

**Status:** IN PROGRESS
**Branch:** `sprint/3-restore-define`
**Started:** February 22, 2026
**Vision Position:** Phase 1 — Cloud Command Center
**Previous Sprint:** Sprint 2 — Core Experience

---

## Sprint Goal

Restore the widget-based Today dashboard that was lost in Sprint 2's Unified Day View rebuild. Establish the Feature Use Case Bible as a regression contract. Keep Sprint 2 wins (date navigation, design system, React Query) intact.

---

## Phase 0: Use Case Bible (Pre-Code)

| Deliverable | Status | Notes |
|---|---|---|
| Today Page Bible | COMPLETE (v0.4) | `Agents/Quality/Agent-11-Docs/Feature-Use-Case-Bible.md` |
| Settings Bible | COMPLETE (v0.1) | `Agents/Quality/Agent-11-Docs/Feature-Bible-Settings.md` |
| Bible Index | COMPLETE (v1.0) | `Agents/Quality/Agent-11-Docs/Feature-Bible-Index.md` |

---

## Phase 1: Restore What Was Lost

### Contract Items

| Parcel | Description | Status | Owner |
|--------|------------|--------|-------|
| P1 | Replace UnifiedDayView with widget-based TodayDashboard | IN PROGRESS | Agent 2 |
| P2 | Wire TasksWidget to Today (date-aware configurable sections) | PENDING | Agent 2 |
| P3 | Wire TrackingWidget/Routines to Today (date-aware) | PENDING | Agent 2 |
| P4 | Enhance DayBriefWidget (3 zones: chips, AI summary, mood) | PENDING | Agent 2 |
| P5 | Create ScheduleWidget (meetings list) | PENDING | Agent 2 |
| P6 | Create FloatingChat (global, basic commands) | PENDING | Agent 2 |
| P7 | Remove Journal/Captures from Today page | PENDING | Agent 2 |

### Approach: Extend, Don't Replace

- Reuse existing widgets from `components/widgets/` (TasksWidget, TrackingWidget, DailyBriefWidget)
- Keep DayHeader, DailyShutdown, useDayData from Sprint 2
- Sprint 2 day-view components (UnifiedDayView, TimelineColumn, TaskPanel, etc.) stay in codebase but are no longer used on Today
- All widgets made date-aware to support date navigation

---

## Phase 2: Solidify the Foundation

| Parcel | Description | Status | Owner |
|--------|------------|--------|-------|
| Agent 11 regression check | Run full Bible checklist before merge | PENDING | Agent 11 |
| Agent 7 code audit | Audit sprint branch before merge | PENDING | Agent 7 |
| User UX review | User reviews running app | PENDING | User |

---

## Definition of Done

```
Phase 0 Gate: ✅
  ✅ Feature Use Case Bible is complete and user-approved
  ✅ Settings Bible extracted

Phase 1 Gate:
  □ Today page has widget-based layout (Day Brief, Tasks, Routines, Schedule)
  □ Tasks widget has configurable sections, settings, topic/tag filtering
  □ Routines widget has icon buttons, progress bars, add/delete/edit, groups
  □ Day Brief has insight chips, template-based summary, mood selector
  □ Schedule widget shows meetings for the day
  □ Floating chat available on all pages with basic commands
  □ Date navigation works across all widgets
  □ Sprint 2 wins preserved: design system, React Query

Phase 2 Gate:
  □ Agent 11 regression check passes
  □ Agent 7 code audit passes (no P0 issues)
  □ User has reviewed the running app and approved the UX

Sprint-Level:
  □ tsc --noEmit passes with 0 errors
  □ vite build succeeds
  □ Sprint branch merged to main
  □ Main tagged as post-sprint-3
  □ Sprint retrospective added
  □ Vision.md updated
```

---

## Sprint Retrospective

*(To be completed after sprint)*

---

*Sprint 3 — Created February 22, 2026*
