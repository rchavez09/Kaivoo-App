# Sprint 22 — Knowledge Vault

**Theme:** Transform Topics into a file-backed Knowledge OS with vault folder structure, file browser UI, and markdown export — while stabilizing the adapter layer from Sprint 21.
**Branch:** `sprint/22-knowledge-vault`
**Status:** IN PROGRESS
**Started:** March 2, 2026
**Compiled by:** Director

---

## Input Sources

| Source | Key Takeaways |
|---|---|
| Vision.md v4.5 | "Topics as Knowledge OS" is #1 remaining must-have after local-first storage |
| Sprint 21 Retro | 5 P1 carry-overs (local.ts split, try/catch, FTS5 stale index, habits discriminator, adapter re-creation) |
| Sprint 21 Deferred | Vault file browser UI, entry-to-file export, Desktop CI/CD all unblocked |
| Agent 3 — Vault-System-Design.md | Complete vault blueprint (folder structure, frontmatter format, Obsidian compatibility, file browser features) |
| Agent 11 — Feature-Bible-Topics-Page.md | Topics page v0.1 with 14 known issues |
| Quality Debt | Issue #9 (parentId topic nesting), Issue #10 (hardcoded Daily Notes topic) |

---

## Track 1: Adapter Stabilization (Tech Debt)

Sprint 21 Agent 7 carry-overs + 2 new bugs found in post-merge audit (Code-Audit-Sprint-21-Adapter-Layer.md). Fix first, build second — this is the code the vault builds on.

| # | Parcel | Agent | Status | Priority |
|---|---|---|---|---|
| P1 | ~~Split `local.ts`~~ → **Commit the file split** (6 untracked files + modified `local.ts` from previous session) | Agent 2 | IN PROGRESS (code done, uncommitted) | P1 |
| P2 | Add try/catch + error handling to local CRUD (~80 operations) | Agent 2 | NOT STARTED | P1 |
| P3 | FTS5 incremental index updates (per-CRUD write, not startup-only rebuild) | Agent 2 | NOT STARTED | P1 |
| P4 | Add `type` discriminator column to `routines` table (habits vs routines) + filter completions by entity type | Agent 12 | NOT STARTED | P1 |
| P5 | Fix Supabase adapter re-creation on `user?.id` change (memoize auth/search independently) | Agent 2 | NOT STARTED | P1 |
| P5b | **(NEW)** Add empty-set guard to `LocalTopicAdapter.update` and `LocalTopicPageAdapter.update` — crashes on `update(id, {})` | Agent 2 | NOT STARTED | P1 |
| P5c | **(NEW)** Fix `HabitCompletionAdapter.toggle` — inserts with `count = NULL` instead of `count = 1` | Agent 2 | NOT STARTED | P2 |

### Definition of Done — Track 1
- [ ] `local.ts` split committed (6 submodules, all ≤600 lines) — **code exists, needs git commit**
- [ ] Every local CRUD operation wrapped in try/catch with meaningful error propagation
- [ ] FTS5 index updated on every insert/update/delete (not just startup rebuild)
- [ ] `routines` table has `type TEXT DEFAULT 'routine'` column; habits written with `type='habit'`
- [ ] `routine_completions` queries filtered by entity type (JOIN on routines.type or subquery)
- [ ] Supabase adapter instances memoized (not re-created on every `user?.id` change)
- [ ] TopicAdapter.update and TopicPageAdapter.update handle empty input without SQL error
- [ ] HabitCompletion toggle inserts with `count = 1`

---

## Track 2: Knowledge Vault UI

The core deliverable. Builds on Agent 3's Vault-System-Design.md.

| # | Parcel | Agent | Status | Priority |
|---|---|---|---|---|
| P6 | Vault folder structure — `Journal/`, `Projects/`, `Library/`, `Inbox/` with topic-to-folder mapping | Agent 3 + Agent 2 | NOT STARTED | P0 |
| P7 | File browser component — tree view, folder navigation, file listing, breadcrumbs | Agent 2 | NOT STARTED | P0 |
| P8 | Entry-to-file export — journal entries, notes, captures → `.md` files with YAML frontmatter | Agent 2 | NOT STARTED | P0 |
| P9 | Topics quality debt — fix parentId nesting (Issue #9) + hardcoded Daily Notes (Issue #10) | Agent 2 | NOT STARTED | P1 |

### Definition of Done — Track 2
- [ ] Vault folder structure created on disk at user-chosen root (desktop) or virtual (web)
- [ ] `Journal/YYYY/MM-MonthName/` date-based hierarchy for journal entries
- [ ] `Projects/` maps to existing Topics, each topic = folder
- [ ] `Library/` for reference material, `Inbox/` for captures
- [ ] File browser component renders real folder tree from vault path
- [ ] Tree view with expand/collapse, folder navigation, file listing
- [ ] Breadcrumb navigation showing current path
- [ ] Journal entries export to `.md` files with YAML frontmatter (tags, created, modified)
- [ ] Exported files are Obsidian-compatible (standard YAML frontmatter)
- [ ] parentId topic nesting cleaned up (Issue #9)
- [ ] Hardcoded Daily Notes topic removed/refactored (Issue #10)

---

## Track 3: Quality Gate

| # | Parcel | Agent | Status |
|---|---|---|---|
| P10 | Vault adapter tests + file browser component tests | Agent 2 + Agent 10 | NOT STARTED |
| P11 | Agent 7 code audit | Agent 7 | NOT STARTED |
| P12 | Agent 11 feature integrity check (Topics Bible update) | Agent 11 | NOT STARTED |

### Definition of Done — Track 3
- [ ] Unit tests for vault folder creation, file export, and tree rendering
- [ ] Integration tests for CRUD → FTS5 index update round-trip
- [ ] Agent 7: no unresolved P0 issues
- [ ] Agent 11: Topics Feature Bible updated to v0.2, no regressions

---

## Sprint-Level Definition of Done

- [ ] `cd daily-flow && npm run lint && npm run typecheck && npm run test && npm run build` — all pass
- [ ] Vault folder structure visible in desktop app file system
- [ ] File browser navigable with real topic/entry data
- [ ] Journal entries export to `.md` files with YAML frontmatter
- [ ] All 5 Sprint 21 P1 carry-overs resolved
- [ ] Agent 7 code audit — no unresolved P0s
- [ ] Agent 11 feature integrity — Topics Bible updated, no regressions
- [ ] 3-agent design review — all PASS (if UI changes warrant)
- [ ] Sprint retrospective added before merge

---

## Dependencies

```
Track 1 (P1-P5) ──→ Track 2 (P6-P9) ──→ Track 3 (P10-P12)
     │                    │
     │                    ├── P6 (folder structure) before P7 (file browser)
     │                    └── P7 (file browser) before P8 (export)
     │
     ├── P1 (split local.ts) before P2 (add try/catch)
     └── P4 (habits discriminator) is independent
```

---

## Deliberately Deferred

| Item | Why | Target |
|---|---|---|
| Desktop CI/CD (macOS/Windows/Linux builds) | Independent track, not blocking vault work | Sprint 23 |
| Setup wizard + vault selection + Obsidian import | Depends on vault being solid first | Sprint 23 |
| File attachments + image embedding | Depends on vault | Sprint 23 |
| AI settings page + BYO API key wizard | Independent, not on critical path yet | Sprint 23-24 |
| Drag-and-drop upload | Vault feature — after file browser is stable | Sprint 23 |
| Git versioning for .md files | Nice-to-have, not blocking | Sprint 23+ |
| Wikilinks + backlinks | Requires content indexing infrastructure | Sprint 23+ |
| File type filtering (PDF, image, etc.) | After basic file browser is working | Sprint 23+ |

---

## Metrics

| Metric | Before | Target | Actual |
|---|---|---|---|
| `local.ts` line count | 1,384 | ≤600 per file | |
| Local CRUD operations with try/catch | 0 | 80+ | |
| FTS5 index update strategy | startup-only | per-CRUD | |
| Routines table has type discriminator | No | Yes | |
| Adapter re-creation on user change | Yes (bug) | No (memoized) | |
| Vault folders created on disk | 0 | 4+ (Journal, Projects, Library, Inbox) | |
| File browser renders tree | No | Yes | |
| Journal entries exportable to .md | No | Yes | |
| Existing tests passing | 226 | 226+ | |
