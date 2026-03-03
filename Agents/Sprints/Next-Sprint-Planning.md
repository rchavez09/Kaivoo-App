# Next Sprint Planning — Sprint 24

**Status:** NOT STARTED — awaiting Sprint 23 completion
**Compiled by:** Director
**Date:** TBD

---

## Previous Sprint Summary

**Sprint 23 (Setup & AI Foundation):** IN PROGRESS
- See `Sprint-23-Setup-AI-Foundation.md` for live status

---

## Backlog — Prioritized

### From Sprint 23 Backlog (Ordered)

| Item | Depends On | Priority |
|---|---|---|
| File attachments + image embedding | Sprint 22 vault (ready) | **Must-have Phase A** |
| Google Calendar integration | Independent | **Must-have Phase A** |
| Gmail integration | Google Calendar | **Must-have Phase A** |
| License key system | Independent | **Must-have Phase A** |
| Landing page & marketing site | Independent | **Must-have Phase A** |
| Stripe integration (one-time payment) | License key system | **Must-have Phase A** |
| EULA / legal documentation | Independent | **Must-have Phase A** |

### Vault Enhancements (Post Sprint 22)

| Item | Source | Notes |
|---|---|---|
| Drag-and-drop file upload | Agent 3 Vault-System-Design | After file browser is stable |
| Wikilinks + backlinks | Agent 3 Vault-System-Design | Requires content indexing |
| File type filtering (PDF, image, etc.) | Agent 3 Vault-System-Design | After basic browser works |
| Git versioning for .md files | Agent 3 Vault-System-Design | Optional, nice-to-have |
| Folder templates ("New Client Project") | Agent 3 Vault-System-Design | After core vault is stable |
| Vault organization: move, sort, manual reorder | CEO Session #4 + Agent 3 Hub API | Move files/folders between topics/projects (API spec'd), sort by name/date/type, manual drag reorder (dnd-kit in stack, needs `sort_order` in SQLite metadata). Hybrid approach: opinionated defaults + full user freedom. After vault browser is stable |

### Quality Debt

| Item | Source | Notes |
|---|---|---|
| Notifications & reminders | Ongoing | Should-have Phase A |
| Bundle size optimization (482KB JS, 2.4x over budget) | Agent 7 | Code splitting, lazy loading heavy imports |
| `local-entities-core.ts` (611L) / `local-entities-ext.ts` (670L) file size | Sprint 22 retro | Minor overage, further splitting needed |

### Deferred Features (P2)

| Item | Source |
|---|---|
| "Don't Miss Twice" forgiveness | Sprint 18 |
| Year in Pixels | Sprint 18 |
| AI "Organize My Day" | Sprint 18 |
| Filter/entity toggle system | Sprint 18 |
| Timed habits | Sprint 18 |
| Cross-platform shortcut recording | Sprint 18 |

---

## Planning Notes

Sprint 24 scope TBD. Likely candidates: File attachments + image embedding (depends on vault, now stable), Google Calendar integration (independent, high user value). Landing page + Stripe could parallel-track if a marketing sprint is warranted.

---

*Next Sprint Planning — Awaiting Sprint 23 completion*
