# Next Sprint Planning

**Status:** Collecting inputs for Sprint 8
**Last Reset:** February 23, 2026 (Sprint 7 approved)

---

## Input Sources

### Sprint 7 Deferred Items
Source: `Sprints/Sprint-7-Journal-Canvas.md` — Deferred to Sprint 8+

| Item | Category | Priority Estimate |
|---|---|---|
| Journal: Full-text search across entries | Feature | High (user-requested, part of intelligence layer) |
| Journal: AI "Organize My Day" (inline annotations + sidebar summary) | Feature | High (user-requested, Sprint 8 intelligence layer) |
| Journal: AI section labels in sidebar | Feature | Medium (replaces timestamp anchors) |
| Journal: Entry templates (Morning Pages, Meeting Notes, etc.) | Feature | Medium (user confirmed interest) |
| Journal: Word count / writing stats / streaks | Enhancement | Medium |
| Journal: Keyboard shortcuts | Enhancement | Low (auto-save eliminates Cmd+S) |
| Journal: Configurable session gap threshold (Settings page) | Enhancement | Low (currently 30min hardcoded in `GAP_THRESHOLD_MINUTES`) |
| Journal: Apply `mood_score` DB migration + flip `MOOD_SCORE_COLUMN_EXISTS` flag | Tech Debt | Medium (migration file exists, just needs to be applied) |
| Tasks: Kanban improvements (empty column drops, search in Kanban) | Enhancement | Medium |
| Tasks: "Ongoing" task label | Enhancement | Low |
| Task templates, archive vs delete | Feature | Medium |
| Full-text search across all content | Feature | Medium |
| Analytics & Insights rebuild | Feature | Medium |
| Notifications & reminders | Feature | Medium |
| PWA support | Infrastructure | Low |
| Agent 7 P1: recurrence badge DRY extraction | Tech Debt | Low |
| Agent 7 P3 debt (CODE-06/07/08) | Tech Debt | Low |
| SEC-06 (CSP headers) | Security | Medium |

### User Ideation Session — Feb 23, 2026
Source: Director-facilitated brainstorm on Tasks page evolution (carried from Sprint 7 planning)

**Projects System (new entity):**
- Topic → Project → Task → Subtask hierarchy
- Projects have date ranges (start/end), serving as overarching timelines
- Topics remain on journal entries, captures, and optionally on Projects
- Tasks drop Topics, keep hashtags only — Projects become the organizational parent

**Project Templates:**
- Save reusable task/subtask structures
- Apply templates to new projects, customize per instance
- AI chat kickoff: "Create a new project with the usual template"

**Tasks Timeline View (new view mode):**
- Third view mode alongside List and Kanban
- Project-first visual: project bars span date ranges

**Calendar Page Redesign:**
- Meetings-first visual weight (opposite of Timeline view)

### Research Queue (In Progress During Sprint 7)
| Brief | Agent | Status | Blocks |
|---|---|---|---|
| Project management patterns (solo/small-team tools) | Agent 5 | In progress (Sprint 7 R1) | Projects data model design |
| Entity relationship / graph patterns (AI-searchable connections) | Agent 5 | In progress (Sprint 7 R2) | Connected Context architecture |

### Agent Docs to Scan
The Director should scan these Docs/ folders for active concerns when planning Sprint 8:
- `Engineering/Agent-7-Docs/` — Review-Quick-Reference.md, Bundle-Size-Standards.md
- `Quality/Agent-11-Docs/` — Feature Bible files (Journal v0.2 post-Sprint 7)
- `Quality/Agent-10-Docs/` — Test strategy

---

## Candidate Backlog

### Sprint 8 Theme Candidates

**Option A: Journal Intelligence**
Focus: Full-text search, AI "Organize My Day," AI section labels, templates. Completes the Journal vision started in Sprint 7. Lower risk (builds on stable canvas).

**Option B: Projects Foundation**
Focus: Projects data model, basic CRUD, projects UI, tasks nested in projects. Major new entity. Higher risk, but advances Vision Phase 1 toward completion. Depends on Agent 5 research briefs landing.

**Option C: Mixed — Journal Intelligence + Projects Research**
Focus: Journal intelligence features (Sprint 8a) + Projects design/architecture work (Sprint 8b). Agent 5 research informs Projects data model while Journal features ship.

*(Director to recommend sequencing after Sprint 7 completes and Agent 5 research briefs land.)*

---

## Proposed Scope

*(Pending: Sprint 7 must complete first. Agent 5 research briefs should land during Sprint 7. Director to propose sequencing based on Sprint 7 retrospective and research findings.)*

---

*Template per Sprint Protocol v1.3*
