# Sprint 16: Calendar — Calendar Page Redesign

**Status:** In Progress
**Created:** February 25, 2026
**Branch:** `sprint/16-calendar`
**Theme:** Calendar — Transform the basic single-day calendar into a proper month grid + hourly day view

---

## Goal

Ship a real calendar experience: month grid with event dots, hourly day timeline with meeting blocks, view switcher with persistence, and a working "New Event" button. Meetings-first visual hierarchy.

---

## Vision Alignment

- **Phase:** 1 — Cloud Command Center (~98% → ~99% complete)
- **Milestone:** Calendar page redesign (explicit Phase 1 milestone in Vision.md)
- **Impact:** Users can see their month at a glance, view meetings on a timeline, and create events properly

---

## Parcels

### P0 — Design Gate (Gate 1)
**Agents:** Visual Design + Accessibility & Theming + UX Completeness
**Status:** In Progress

### P1 — Data Layer
**Agent:** Agent 2
**Status:** Pending
- `getMeetingsForDateRange` selector + `useCalendarData` hook

### P2 — View Switcher + CalendarPage Shell
**Agent:** Agent 2
**Status:** Pending
- CalendarViewSwitcher + CalendarPage rewrite

### P3 — MonthGrid + Day Cells
**Agent:** Agent 2
**Status:** Pending
- MonthGrid + MonthGridDayCell components

### P4 — DayTimeline (Hourly View)
**Agent:** Agent 2
**Status:** Pending
- Hourly timeline following TimelineColumn pattern

### P5 — DaySidebar (Month View Detail Panel)
**Agent:** Agent 2
**Status:** Pending
- Selected day's meetings + tasks in month view

### P6 — Accessibility + Polish
**Agent:** Agent 2
**Status:** Pending
- ARIA, keyboard nav, dark mode, responsive

### P7 — Housekeeping
**Agent:** Director
**Status:** Pending

### P8 — Quality Gates
**Agents:** Agent 7 + Agent 11 + 3 Design Agents
**Status:** Pending

---

## Deferred to Sprint 17+

| Item | Category | Notes |
|---|---|---|
| Week view (7-column hourly grid) | Feature | Prove day timeline first |
| Filter/entity toggle system | Feature | Needs shared filter architecture |
| Drag-to-reschedule meetings | Feature | Complex interaction |
| Calendar API sync (Google/Outlook) | Integration | Separate sprint |
| Full-text search | Feature | High priority — deferred since Sprint 7 |
| AI "Organize My Day" | Feature | Requires AI infrastructure |
| Entry templates | Feature | Medium |
| Automated design-lint CI step | DevOps | Medium |
| Notes rename tech debt | Code Quality | Low |

---

*Sprint 16: Calendar — Proposed February 25, 2026*
*Sprint Protocol v1.5*
