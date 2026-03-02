# Next Sprint Planning — Sprint 20

**Status:** NOT STARTED — awaiting Director planning session
**Compiled by:** Director
**Date:** March 1, 2026

---

## Previous Sprint Summary

**Sprint 19 (Topics & Quality):** COMPLETED — PR #2 merged to `main`
- Topics restructure shipped (Feature Bible, store consolidation, full CRUD, UX fixes)
- Bundle size: 482KB → ~210KB initial JS gzipped (56% reduction)
- Tech debt: FTS bold rendering, WeekTimeline task blocks
- E2E infrastructure: Playwright installed, 4 smoke tests passing
- See `Sprint-19-Topics-Quality.md` for full retrospective

---

## Backlog — Prioritized

### From CEO Session #4 (Phase A Must-Haves)

| Item | Owner | Priority | Notes |
|---|---|---|---|
| Electron vs. Tauri evaluation | Agent 9 (DevOps) | **BLOCKS EVERYTHING** | Framework decision needed before any local-first work |
| Data layer abstraction (LocalAdapter/CloudAdapter) | Agent 3 (Architect) | **Must-have Phase A** | Refactor services to adapter pattern |
| Desktop packaging sprint | Agent 9 (DevOps) | **Must-have Phase A** | Depends on Electron/Tauri decision |
| Local-first storage (SQLite + file system) | Agent 3 / Agent 2 | **Must-have Phase A** | Vault folder, real files on disk |
| File attachments + image embedding | Agent 2 | **Must-have Phase A** | Files in project/topic folders, images inline |
| Setup wizard + vault selection + Obsidian import | Agent 2 | **Must-have Phase A** | Choose folder, AI config, file copy import |

### From CEO Priorities

| Item | Priority | Notes |
|---|---|---|
| AI settings page + BYO API key wizard | CEO Priority #2 | AI infrastructure foundation |
| AI chat concierge | CEO Priority #3 | Depends on AI settings |
| Google Calendar integration | CEO Priority #4 | Separate sprint |
| Gmail integration | CEO Priority #5 | Separate sprint |

### Quality & Tech Debt

| Item | Source | Notes |
|---|---|---|
| Lint errors cleanup | Sprint 19 retro | Pre-existing unsafe `any` casts, unused imports, empty interfaces |
| E2E test expansion | Sprint 19 retro | Authenticated flows, Topics CRUD journeys, daily use flow |
| Notifications & reminders | Ongoing backlog | Should-have Phase A |
| parentId topic nesting | Issue #9 | Dead schema — tech debt |
| Hardcoded Daily Notes topic | Issue #10 | Complex, risk of breaking journal |

### Deferred Features

| Item | Source | Notes |
|---|---|---|
| "Don't Miss Twice" forgiveness | Sprint 18 | P2 |
| Year in Pixels | Sprint 18 | P2 |
| AI "Organize My Day" | Sprint 18 | Feeds into AI concierge |
| Filter/entity toggle system | Sprint 18 | P2 |
| Timed habits | Sprint 18 | P2 |
| Cross-platform shortcut recording | Sprint 18 | Low priority |

---

## Planning Notes

Sprint 20 scope TBD. Key decisions for Director:

1. **Does Sprint 20 focus on local-first foundation (Electron/Tauri + data layer)?** This is the CEO's strategic priority from Session #4 and blocks everything downstream.
2. **Or does Sprint 20 focus on AI infrastructure (settings + concierge)?** CEO Priority #2/#3, but doesn't depend on local-first.
3. **Quality baseline:** Lint errors should be cleaned up regardless of feature focus. E2E should expand to cover authenticated flows.

---

*Next Sprint Planning — Awaiting Director session*
