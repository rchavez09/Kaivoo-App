# Next Sprint Planning

**Status:** Collecting inputs for Sprint 17
**Last Reset:** February 25, 2026 (Sprint 16 approved)

---

## Input Sources

### Sprint 16 Deferred Items
Source: `Sprints/Sprint-16-Calendar.md` — Deferred to Sprint 17+

| Item | Category | Priority Estimate |
|---|---|---|
| Week view (7-column hourly grid) | Feature | **High** (extends Sprint 16 calendar work) |
| Full-text search | Feature | **High** (deferred since Sprint 7) |
| AI "Organize My Day" | Feature | **High** (deferred since Sprint 7) |
| Filter/entity toggle system (Calendar + Timeline) | Feature | Medium |
| Entry templates | Feature | Medium |
| Automated design-lint CI step | DevOps | Medium |
| Notes rename tech debt (JournalEntry → NoteEntry) | Code Quality | Low |
| Project Milestones on timeline | Feature | P2 from Agent 11 |
| Timeline task-level view | Feature | P2 from Agent 11 |
| Project duplication | Feature | P3 from Agent 11 |
| Dedicated Archive action | Feature | P3 from Agent 11 |

### Agent Docs to Scan
The Director should scan these Docs/ folders for active concerns when planning Sprint 17:
- `Engineering/Agent-7-Docs/` — Sprint 16 code audit findings
- `Quality/Agent-11-Docs/` — Feature Bible updates post-Sprint 16 (Calendar Bible)
- `Design/Agent-Design-Docs/` — 3-agent audit findings from Sprint 16

---

## Candidate Backlog

*(Pending: Sprint 16 must complete first. Director to propose sequencing based on Sprint 16 retrospective.)*

---

## Proposed Scope

*(Pending Sprint 16 completion.)*

---

## Sprint 17+ Pipeline: Routines & Habits Page

**Status:** Research complete, Feature Bible v0.2 ready, all user Q&A resolved
**Bible:** `Quality/Agent-11-Docs/Feature-Bible-Routines-Habits.md`
**Pre-requisites:** Design Agent Gate 1 specs only (user Q&A done)

### Research Base
Competitive analysis of 8 habit tracking apps: Streaks, Habitica, Daylio, Fabulous, Productive, Done, Loop Habit Tracker, Atoms.

### Key Design Decisions (Research-Informed + User-Confirmed)
- **Layout:** Time-of-day sections (Morning/Afternoon/Evening/Anytime)
- **Habit types:** Positive + Negative (zero-target) + Multi-count. Timed deferred.
- **Streak model:** Habit strength score (0-100%) + streak counter + milestone badges (7/30/100 days)
- **Frequency:** Daily, specific days, X times/week
- **Completion UX:** Color-fill animation on tap
- **Analytics:** Full — calendar dots, strength chart, completion %, mood-habit correlation, weekly dashboard, strength rankings
- **Negative habits:** Zero-target model (tap to log slips, tracks failure frequency)
- **Today widget:** Upgrade with streak counts + strength indicators
- **Data model:** Merge existing routines into new habit schema (migration required)
- **Gamification:** Moderate — milestone badges with visual celebrations

### Sprint 17 Scope Estimate (P0 — 14 items)
- Full habits list with time-of-day sections (Morning/Afternoon/Evening/Anytime)
- Three habit types: Positive, Negative (zero-target), Multi-count (progress ring)
- Habit completion with color-fill animation
- Streak counter (current + best) + habit strength score (0-100%)
- Milestone badges for streak achievements (7, 30, 100 days)
- Habit CRUD (create, edit, archive, delete) with icon, color, schedule
- Frequency scheduling (daily, specific days, X times/week)
- Habit detail view with calendar dots + strength chart
- Full analytics: weekly dashboard, strength rankings, monthly calendar
- Mood-habit correlation (leverages existing Day Brief mood data)
- Today widget upgrade with streak counts + strength indicators
- Data migration from existing routines → new habit schema
- Two-way sync between Today widget and Routines page

### Also Removed
- **Captures page deprecated** — Notes page covers the use case. Route and data model to be cleaned up.

---

*Template per Sprint Protocol v1.5*
