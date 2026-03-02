# Next Sprint Planning — Sprint 21

**Status:** NOT STARTED — awaiting Sprint 20 completion
**Compiled by:** Director
**Date:** TBD

---

## Previous Sprint Summary

**Sprint 20 (Local-First Foundation):** IN PROGRESS
- See `Sprint-20-Local-First-Foundation.md` for live status

---

## Backlog — Prioritized

### From Sprint 20 Backlog (Ordered)

| Item | Depends On | Priority |
|---|---|---|
| Local-first storage (SQLite full implementation) | Sprint 20 adapter layer | **Must-have Phase A** |
| Vault file browser UI | Sprint 20 LocalAdapter + Tauri FS | **Must-have Phase A** |
| Setup wizard + vault selection + Obsidian import | Vault file browser | **Must-have Phase A** |
| File attachments + image embedding | Vault | **Must-have Phase A** |
| Cross-platform CI builds (macOS/Windows/Linux) | Sprint 20 Tauri scaffold | **Must-have Phase A** |
| AI settings page + BYO API key wizard | Independent | CEO Priority #2 |
| AI chat concierge | AI settings | CEO Priority #3 |
| Google Calendar integration | Independent | CEO Priority #4 |
| Gmail integration | Google Calendar | CEO Priority #5 |

### Quality Debt

| Item | Source | Notes |
|---|---|---|
| parentId topic nesting | Issue #9 | Dead schema — clean up during local-first migration |
| Hardcoded Daily Notes topic | Issue #10 | Address during vault/topics restructure |
| Notifications & reminders | Ongoing | Should-have Phase A |

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

Sprint 21 scope TBD. Likely candidates: local-first SQLite implementation + vault file browser UI (completing the local-first foundation started in Sprint 20). AI settings could run as a parallel track if Sprint 20 finishes cleanly.

---

*Next Sprint Planning — Awaiting Sprint 20 completion*
