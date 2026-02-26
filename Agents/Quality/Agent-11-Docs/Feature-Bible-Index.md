# Feature Use Case Bible — Index

**Purpose:** Master map of all Feature Bible files. Each Bible covers one page or module of the Kaivoo app.
**Version:** 1.2
**Date:** February 24, 2026

---

## Bible Files

| Bible | File | Status | Covers |
|-------|------|--------|--------|
| **Today Page** | `Feature-Bible-Today-Page.md` | v0.4 — All questions resolved, settings extracted | Day Brief, Tasks widget, Routines widget, Schedule widget, Floating Chat, Daily Shutdown, Date Navigation |
| **Settings** | `Feature-Bible-Settings.md` | v0.1 — Extracted from Today Bible | All user-facing settings consolidated: Day Brief AI, Tasks widget, Schedule Mode, Routines management, Daily Shutdown, Concierge |
| **Tasks Page** | `Feature-Bible-Tasks-Page.md` | v0.1 DRAFT — Awaiting user Q&A | List/Kanban views, filtering, sorting, task detail drawer, subtasks, creation flow |
| **Journal Page** | `Feature-Bible-Journal-Page.md` | v0.2 — Q&A resolved, Canvas design, Sprint 7 baseline | Daily Canvas (continuous writing), calendar sidebar with section anchors, AI extraction, mood, auto-save, inline tag input |
| **Projects Page** | `Feature-Bible-Projects-Page.md` | v0.2 — Sprint 14 Project Notes | Projects list (card grid, status tabs, search, topic filter, create dialog), Project Detail (inline editing, task list, **project notes**, link existing, stats bar, settings, delete), Timeline View (Gantt bars, today line, date axis, click-to-drill), Project Selector in TaskDetailsDrawer, Project Badges on task rows, **Quick-Add Note (Cmd+Shift+N)** |
| **Routines & Habits Page** | TBD | Not started | Full category management, goal tracking, gamification, challenges (discovered from Today Bible Q11/Q12) |
| **Calendar Page** | TBD | Not started | Calendar integrations, event management |
| **Captures** | TBD | Not started | Quick capture, processing, organization |
| **Insights Page** | TBD | Not started | Analytics, correlations, trends |
| **Topics Page** | TBD | Not started | Knowledge base, folders, topic management |

---

## How to Use

1. **Sprint planning:** Load the Bible(s) relevant to the sprint's scope — not all of them
2. **Agent 11 regression checks:** Use the Must-Never-Lose checklists in each page Bible
3. **Settings work:** All settings specs live in the Settings Bible — feature Bibles reference it
4. **New page work:** Create the Bible BEFORE sprint code begins (Director + Agent 6 compile, user approves)

## Rules

- Each page Bible follows the standard structure: What It Is, Real Use Case, What Worked, What Didn't Work, What It Should Become, Interaction Spec, Must-Never-Lose Checklist
- **Settings tables live in the Settings Bible**, not in feature Bibles. Feature Bibles mention that settings exist and cross-reference the Settings Bible for full spec.
- Resolved Questions stay in the Bible where they were asked (they provide feature context)
- Bibles are created when a page is sprint-scoped, not before — no speculative docs

---

*Feature Bible Index v1.5 — February 25, 2026*
*v1.2: Journal Page Bible v0.2 (Q&A resolved, Canvas design direction, Sprint 7 baseline)*
*v1.3: Added Projects Page entry (Sprint 9 delivered, Bible pending for Sprint 11)*
*v1.4: Projects Page Bible v0.1 completed — full coverage of Projects list, Project Detail, Timeline View, Project Selector, Project Badges, data model*
*v1.5: Projects Page Bible v0.2 — Added Project Notes (Sprint 14): notes section on ProjectDetail, Quick-Add dialog, data model, must-never-lose checklist*
