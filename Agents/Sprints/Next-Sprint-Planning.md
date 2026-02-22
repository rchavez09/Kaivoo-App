# Next Sprint Planning — Sprint 3: Restore & Define

**Status:** PLANNING — Awaiting Use Case Bible from Agent 6 + User
**Compiled by:** The Director
**Date:** February 22, 2026
**Vision Position:** Phase 1 — Cloud Command Center
**Last Completed:** Sprint 2 — Core Experience (in progress, regressions identified)

---

## Sprint 3 Context

Sprint 2 (Core Experience) delivered real wins — date navigation, calendar improvements, design system overhaul, React Query migration — but the Unified Day View replaced the widget-based Today dashboard, causing significant regressions in core daily-use functionality. The user's command center no longer works the way they need it to.

**Sprint 3 priorities:**
1. Restore lost functionality to the Today page and core features
2. Establish the Feature Use Case Bible so this never happens again
3. Keep Sprint 2 wins (date nav, design system, React Query) intact
4. Platform ambitions (modules, marketplace, self-hosting) are ON HOLD until the core daily flow is solid

**New process for Sprint 3:**
- First sprint under the git branching/sandbox strategy (Sprint Protocol v1.1)
- Agent 11 (Feature Integrity Guardian) is active starting this sprint
- Use Case Bible must be complete BEFORE any code parcels begin

---

## Phase 0: Use Case Bible (Pre-Code — Blocks All Other Phases)

**Owner:** Agent 6 (Usability Architect) + Agent 11 (Feature Integrity Guardian) + User

The Feature Use Case Bible defines for every page and widget: what it does, how it's used, what "working" looks like, and what it must never lose. This document becomes the contract for Sprint 3 and all future sprints.

**Pages to cover:**
| Page | Key Questions |
|------|--------------|
| **Today** | What widgets belong here? What's the primary use case? How should routines, todos, journal, and captures appear? What role does the timeline play? |
| **Tasks** | How does the dashboard view work? What configurable sections exist (by topic, due tomorrow, this week, etc.)? How do Kanban and list views coexist? |
| **Journal** | What does a full journal entry look like vs. a quick thought? How does the AI extraction flow work? How do past entries work? |
| **Calendar** | What are the view modes? How does day drilling work? How do routines appear? |
| **Captures** | What is the capture input flow? Where can captures be created from? How are they processed? |
| **Insights** | What metrics matter? What are the zoom levels? Where do heatmaps and streaks live? |
| **Settings** | What can be configured? Routine add/delete/edit? Widget configuration? Todo section settings? |
| **Topics** | How does the knowledge base hierarchy work? How are topics linked to other entities? |

**Output:** `Agents/Quality/Agent-11-Docs/Feature-Use-Case-Bible.md`

**This phase is being handled in a separate conversation with the user and Agent 6.**

---

## Phase 1: Restore What Was Lost (Depends on Phase 0)

These items restore functionality that was working pre-Sprint 2 and was lost or degraded by the Unified Day View rebuild. Specific parcels TBD after Use Case Bible is finalized.

### Known Regressions to Address

| Regression | What Was Lost | What Replaced It | Priority |
|-----------|--------------|-----------------|----------|
| **Todo dashboard widget** | Configurable sections (by topic, due tomorrow, due this week, etc.) with settings tab | Flat TaskPanel with only pending/completed | Critical |
| **Routine management** | Add/delete/edit routines, big icon buttons to check off | Small toggles in timeline, no add/delete UI | Critical |
| **Journal entry from Today** | Full journal entry creation from the Today page | Compact InlineJournal that feels like a thought | Major |
| **Capture input** | Working quick-capture flow | CapturesList exists but input flow is broken | Critical |
| **Today page layout** | Widget-based dashboard — YOUR command center | Timeline-heavy layout optimized for meeting-heavy days | Major |

### Approach: Extend, Don't Replace

The Sprint 2 components (date navigation, DaySummaryBar, DateChip, design system) are **kept**. The goal is to bring back the widget-based dashboard experience while keeping the good things Sprint 2 added. Specifically:

- Today page returns to a widget-based layout with routines, todos, journal, captures as distinct widgets
- Date navigation and day-drilling from Sprint 2 are layered on top
- Routine widget gets big icon buttons back + add/delete/edit in Settings
- Todo widget gets configurable sections back + settings tab
- Journal widget supports full entry creation, not just compact inline
- Capture widget gets a working input flow
- Timeline becomes an optional/secondary view, not the main highlight

---

## Phase 2: Solidify the Foundation (Parallel with Phase 1)

### Agent 11 First Assignments
| Parcel | Description | Owner |
|--------|------------|-------|
| Feature Use Case Bible | Finalize and maintain the Bible (started in Phase 0) | Agent 11 + Agent 6 |
| Sprint 3 Impact Assessment | Verify Phase 1 parcels don't break Sprint 2 wins | Agent 11 |
| Pre-Merge Regression Check | Run full Bible checklist before sprint branch merges to main | Agent 11 |

### Process Improvements
| Parcel | Description | Owner |
|--------|------------|-------|
| Git branching setup | Sprint 3 branch: `sprint/3-restore-define` | Agent 2 |
| Sprint Protocol v1.1 | Branching rules added (DONE — Feb 22, 2026) | Director |
| Agent 11 activation | Feature Integrity Guardian spec (DONE — Feb 22, 2026) | Director |

---

## Candidate Items (Carried from Sprint 2 Backlog)

These items are ON HOLD. They will not be included in Sprint 3 unless the core daily flow is solid first.

### Deferred Platform Work
| Item | Source | Notes |
|------|--------|-------|
| Task recurrence system | Vision.md Phase 1 | After core restore |
| Search & file attachments | Vision.md Phase 1 | Separate sprint |
| Notifications & reminders | Vision.md Phase 1 | Separate sprint |
| PWA (installable, offline) | Vision.md Phase 1 | Separate sprint |
| Quarterly Insights view | UC5, Research P1 | After core restore |
| Auto-detected patterns | Research Finding 6 | Needs correlation engine (Phase 4+) |

### Deferred Agent 8 (Product) Items
| Item | Source | Notes |
|------|--------|-------|
| Data import tools (Notion + Obsidian) | Customer Persona Research | After core is solid |
| CalDAV support | Customer Persona Research | Phase 3+ |
| Pricing page / calculator | Competitive Landscape Report | Pre-launch |
| Source-available licensing decision | Customer Persona Research | Strategic decision |

### Deferred Agent 9 (DevOps) Items
| Item | Source | Notes |
|------|--------|-------|
| Dockerfile + docker-compose | Agent 9 spec | Can start after Sprint 3 |
| CI/CD pipeline (GitHub Actions) | Agent 9 spec | Can start after Sprint 3 |
| Electron vs Tauri evaluation | Agent 9 spec | Research task, no dependency |

---

## Agent Load (Preliminary)

| Agent | Sprint 3 Role | Load |
|-------|--------------|------|
| Agent 2 (Engineer) | Restore widgets, fix regressions | Heavy |
| Agent 6 (Usability) | Co-author Feature Use Case Bible | Medium (Phase 0) |
| Agent 7 (Code Review) | Audit sprint branch before merge | Medium |
| Agent 11 (Feature Integrity) | Bible, impact assessment, regression check | Medium |
| Agent 1 (UI Designer) | Widget redesign guidance | Light |
| Agent 3 (Architect) | Review restore approach | Light |

---

## Definition of Done (Sprint 3)

```
Phase 0 Gate:
  □ Feature Use Case Bible is complete and user-approved
  □ Every page and major widget is documented

Phase 1 Gate:
  □ Today page has widget-based layout with routines, todos, journal, captures
  □ Routine add/delete/edit works from Settings
  □ Routine widget has big icon buttons for check-off
  □ Todo widget has configurable sections (by topic, due date, etc.)
  □ Journal entry creation works from Today page (not just compact inline)
  □ Capture input flow works
  □ Sprint 2 wins preserved: date navigation, design system, React Query

Phase 2 Gate:
  □ Agent 11 regression check passes (all Bible items verified)
  □ Agent 7 code audit passes (no P0 issues)
  □ User has reviewed the running app and approved the UX

Sprint-Level:
  □ Sprint branch merged to main after all gates pass
  □ Main tagged as post-sprint-3
  □ Sprint retrospective added to Sprint-3 file
  □ Vision.md updated
```

---

*Next-Sprint-Planning — Updated February 22, 2026*
*Sprint 3 planning initiated in response to Sprint 2 regressions*
*Awaiting Use Case Bible completion before finalizing code parcels*
