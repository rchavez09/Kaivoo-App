# Next Sprint Planning

**Status:** Sprint 19 — awaiting planning
**Last Reset:** February 26, 2026 (Sprint 18 completed)

---

## Input Sources

### Sprint 18 Deferred Items
Source: `Sprints/Sprint-18-Search-Week-View.md` — Deferred to Sprint 19+

| Item | Category | Priority Estimate | Status |
|---|---|---|---|
| File attachments (search + upload) | Feature | P1 | Backlog |
| "Don't Miss Twice" forgiveness (streak buffer) | Feature | P1 | Backlog |
| Year in Pixels (annual heatmap) | Feature | P1 stretch | Backlog |
| AI "Organize My Day" | Feature | High (deferred since Sprint 7) | Backlog (requires AI infra) |
| Filter/entity toggle system (Calendar + Timeline) | Feature | Medium | Backlog |
| Timed habits (4th type, requires timer UI) | Feature | P2 | Backlog |

### Ongoing Backlog
Source: Various sprints — carried forward

| Item | Category | Priority Estimate | Status |
|---|---|---|---|
| Habit categories (user-defined) | Feature | P2 | Backlog |
| Habit suggestions library | Feature | P2 | Backlog |
| Entry templates | Feature | Medium | Backlog |
| Notes rename tech debt (JournalEntry → NoteEntry) | Code Quality | Low | Backlog |
| Captures page deprecation (route + data cleanup) | Housekeeping | User deferred | Backlog |
| Project Milestones on timeline | Feature | P2 from Agent 11 | Backlog |
| Timeline task-level view | Feature | P2 from Agent 11 | Backlog |
| Project duplication | Feature | P3 from Agent 11 | Backlog |
| Dedicated Archive action | Feature | P3 from Agent 11 | Backlog |
| Automated design-lint CI step | DevOps | Medium | Backlog |
| Projects system — Topic → Project → Task → Subtask hierarchy | Feature | PLANNED in Vision | Backlog |
| Project templates | Feature | PLANNED in Vision | Backlog |
| Tasks Timeline view | Feature | PLANNED in Vision | Backlog |
| Analytics & insights dashboard rebuild | Feature | PLANNED in Vision | Backlog |
| Notifications & reminders | Feature | PLANNED in Vision | Backlog |
| PWA (installable, offline read) | Feature | PLANNED in Vision | Backlog |

### Sprint 18 Technical Debt
- WeekTimeline: tasks show as counts in headers but don't render as blocks in grid columns
- FTS headline delimiters (`**`) appear as raw text — could render as bold
- Cross-platform shortcut recording only captures for current platform

### Agent Docs to Scan for Future Sprints
- `Engineering/Agent-7-Docs/` — Bundle size standards (needs re-measurement), query/a11y/error standards
- `Quality/Agent-11-Docs/` — Feature Bibles (living contracts — load relevant Bible per sprint)
- `Design/Agent-Design-Docs/` — Design system, interaction patterns, use cases

---

*Template per Sprint Protocol v1.6*
