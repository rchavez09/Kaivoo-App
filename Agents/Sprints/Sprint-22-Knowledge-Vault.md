# Sprint 22 — Knowledge Vault

**Theme:** Transform Topics into a file-backed Knowledge OS with vault folder structure, file browser UI, and markdown export — while stabilizing the adapter layer from Sprint 21.
**Branch:** `sprint/22-knowledge-vault`
**Status:** QUALITY GATES IN PROGRESS
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
| P1 | Split `local.ts` → 6 submodules (local-schema, local-types, local-auth, local-entities-core, local-entities-ext, local-search) | Agent 2 | DONE | P1 |
| P2 | Add try/catch + error handling to local CRUD (~80 operations) | Agent 2 | DONE | P1 |
| P3 | FTS5 incremental index updates — SearchIndexer interface injected into entity adapters, per-CRUD upsert/remove | Agent 2 | DONE | P1 |
| P4 | Add `entity_type` discriminator column to `routines` table (habits vs routines) + filter completions by entity type | Agent 12 | DONE | P1 |
| P5 | Fix Supabase adapter re-creation on `user?.id` change (memoize auth/search independently) | Agent 2 | DONE | P1 |
| P5b | Add empty-set guard to `LocalTopicAdapter.update` and `LocalTopicPageAdapter.update` | Agent 2 | DONE | P1 |
| P5c | Fix `HabitCompletionAdapter.toggle` — inserts with `count = 1` | Agent 2 | DONE | P2 |

### Definition of Done — Track 1
- [x] `local.ts` split committed (6 submodules: local-schema 185L, local-types 37L, local-auth 59L, local-entities-core 611L, local-entities-ext 670L, local-search 120L)
- [x] Every local CRUD operation wrapped in try/catch with meaningful error propagation
- [x] FTS5 index updated on every insert/update/delete via SearchIndexer interface
- [x] `routines` table has `entity_type TEXT DEFAULT 'routine'` column; habits written with `entity_type='habit'`
- [x] `routine_completions` queries filtered by entity type
- [x] Supabase adapter instances memoized (not re-created on every `user?.id` change)
- [x] TopicAdapter.update and TopicPageAdapter.update handle empty input without SQL error
- [x] HabitCompletion toggle inserts with `count = 1`

---

## Track 2: Knowledge Vault UI

The core deliverable. Builds on Agent 3's Vault-System-Design.md.

| # | Parcel | Agent | Status | Priority |
|---|---|---|---|---|
| P6 | Vault folder structure — VaultAdapter interface + VaultNode type + LocalVaultAdapter (Tauri) + VirtualVaultAdapter (web) + path helpers | Agent 3 + Agent 2 | DONE | P0 |
| P7 | File browser page — tree view, expand/collapse, search filter, breadcrumbs, entity deep-linking, sidebar nav | Agent 2 | DONE | P0 |
| P8 | Entry-to-file export — Obsidian-compatible markdown with YAML frontmatter (journalToMarkdown, captureToMarkdown, topicToMarkdown, topicPageToMarkdown, projectNoteToMarkdown) + batch exporters | Agent 2 | DONE | P0 |
| P9 | Topics quality debt — parentId nesting with recursive tree rendering (Issue #9) + hardcoded Daily Notes removed (Issue #10) | Agent 2 | DONE | P1 |

### Definition of Done — Track 2
- [x] Vault folder structure: VaultAdapter with dual implementations (LocalVaultAdapter for Tauri, VirtualVaultAdapter for web)
- [x] `Journal/YYYY/MM - MonthName/` date-based hierarchy for journal entries
- [x] `Projects/` maps to existing Topics, each topic = folder
- [x] `Library/` for reference material, `Inbox/` for captures
- [x] File browser component at `/vault` renders folder tree with expand/collapse
- [x] Tree view with folder/file icons, search filter, entity deep-linking
- [x] Breadcrumb navigation showing current path
- [x] Journal entries, captures, topics, topic pages, project notes export to `.md` with YAML frontmatter
- [x] Exported files are Obsidian-compatible (standard YAML frontmatter)
- [x] parentId topic nesting with recursive tree rendering + "Add Subtopic" action (Issue #9)
- [x] Hardcoded Daily Notes topic removed from store + 6 filter guards removed (Issue #10)

---

## Track 3: Quality Gate

| # | Parcel | Agent | Status |
|---|---|---|---|
| P10 | Vault tests — 39 tests (path helpers, markdown export, VirtualVaultAdapter tree building, readFile caching, YAML escaping) | Agent 2 | DONE |
| P11 | Agent 7 code audit — 22 findings (6 P0, 10 P1, 6 P2). All 6 P0 issues FIXED. | Agent 7 | DONE |
| P12 | Agent 11 feature integrity check — Track 1/2/3 DoD verified | Agent 11 | DONE |

### P0 Fixes Applied (from Agent 7 audit)
| # | Finding | Fix |
|---|---|---|
| P0-1 | Path traversal in `LocalVaultAdapter.resolve()` | Added segment sanitization: reject `..` and `.`, verify resolved path stays within rootPath |
| P0-2 | YAML injection in frontmatter export | Added `escapeYaml()` for user-controlled values (tags, source); `formatTags` escapes each item |
| P0-3 | `topic_page` route navigates to wrong URL | Added `parentId` to entityRef type; Vault.tsx uses `/topics/{topicId}/pages/{pageId}` |
| P0-4 | `deleteTopic` doesn't cascade to child subtopics | Recursive descendant collection via `parentId` chain; deletes all children + their pages |
| P0-5 | `VirtualVaultAdapter.readFile()` does 6-7 fetchAll calls | Added `CachedData` with `ensureCache()` — tree + entities fetched once, reused by readFile |
| P0-6 | Non-idempotent UPDATE migration runs every startup | Moved UPDATE into conditional block that only runs when ALTER TABLE succeeds (first time) |

### Definition of Done — Track 3
- [x] 39 unit tests for path helpers, markdown export, VirtualVaultAdapter (tree building, readFile, cache invalidation)
- [ ] Integration tests for CRUD → FTS5 index update round-trip *(deferred — covered by local-integration.test.ts existing tests)*
- [x] Agent 7: all 6 P0 issues resolved
- [x] Agent 11: Track 1/2/3 DoD verified, Topics page nesting working

---

## Sprint-Level Definition of Done

- [x] `cd daily-flow && npm run lint && npm run typecheck && npm run test && npm run build` — all pass (265/265 tests, build 2.38s)
- [x] Vault folder structure: VaultAdapter with LocalVaultAdapter (desktop) + VirtualVaultAdapter (web)
- [x] File browser navigable at `/vault` with real topic/entry data
- [x] Journal entries, captures, topics export to `.md` files with YAML frontmatter
- [x] All Sprint 21 P1 carry-overs resolved (P1-P5 + P5b + P5c)
- [x] Agent 7 code audit — all 6 P0s fixed
- [x] Agent 11 feature integrity — DoD verified
- [ ] 3-agent design review — pending
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
| Agent 7 P1 findings (10 items) | Should-fix, not blocking sprint | Sprint 23 |

---

## Metrics

| Metric | Before | Target | Actual |
|---|---|---|---|
| `local.ts` line count | 1,384 | ≤600 per file | 6 files: 185, 37, 59, 611, 670, 120 (2 slightly over) |
| FTS5 index update strategy | startup-only | per-CRUD | per-CRUD via SearchIndexer |
| Routines table has type discriminator | No | Yes | `entity_type` column added |
| Adapter re-creation on user change | Yes (bug) | No (memoized) | Fixed |
| Vault folders created | 0 | 4+ (Journal, Projects, Library, Inbox) | 4 root folders |
| File browser renders tree | No | Yes | Yes (Vault.tsx at /vault) |
| Journal entries exportable to .md | No | Yes | Yes + captures, topics, topic pages, project notes |
| Tests passing | 226 | 226+ | 265 (39 new vault tests) |
| Agent 7 P0 issues | — | 0 | 0 (6 found, all fixed) |

---

## Quality Gates

```
[x] Deterministic checks: lint ✓, typecheck ✓, test (265/265) ✓, build ✓
[x] Agent 7 code audit: 22 findings, 6 P0 all fixed
[x] Agent 11 feature integrity: DoD verified
[x] 3-agent design review: all PASS WITH NOTES (0 P0, 5 P1, 17 P2)
    - Visual Design: PASS WITH NOTES (0 P0, 1 P1, 5 P2)
    - Accessibility & Theming: PASS WITH NOTES (0 P0, 3 P1, 7 P2)
    - UX Completeness: PASS WITH NOTES (0 P0, 1 P1, 5 P2)
    P1 fixes applied: aria-labels on tree buttons/search, delete confirmation, focus-visible rings, 24px tree indent
[ ] E2E test against deploy preview
[ ] Sandbox review by user
[x] Sprint retrospective (below)
```

---

## Sprint Retrospective

**Completed:** March 2, 2026
**Parcels:** 12/12 complete (P1-P5c + P6-P12)

### What Was Delivered

**Track 1 — Adapter Stabilization:** Extracted monolithic `local.ts` (1,384 lines) into 6 focused modules. Added SearchIndexer for FTS5 per-CRUD indexing, `entity_type` discriminator for habits vs routines, empty-set guards, and habit toggle fix. All 7 Sprint 21 carry-overs resolved.

**Track 2 — Knowledge Vault UI:** Full vault system with dual-adapter architecture (LocalVaultAdapter for Tauri desktop filesystem, VirtualVaultAdapter for web virtual tree). File browser page at `/vault` with tree navigation, search, breadcrumbs, entity deep-linking. Obsidian-compatible markdown export with YAML frontmatter for 5 entity types. Topic parentId nesting with recursive tree rendering. Hardcoded Daily Notes topic removed (Issue #10).

**Track 3 — Quality Gate:** 39 new vault tests (265 total). Agent 7 found 22 issues (6 P0); all P0s fixed (path traversal, YAML injection, topic_page routing, deleteTopic cascade, readFile caching, idempotent migration). 3-agent design review: all PASS WITH NOTES.

### Verification Results

- **TypeScript:** Clean (`tsc --noEmit`)
- **Tests:** 265/265 pass (39 new)
- **Build:** Succeeds in 2.38s
- **Lint:** Warnings only (all pre-existing)
- **Agent 7:** All 6 P0 fixed, 10 P1 + 6 P2 deferred to Sprint 23
- **Agent 11:** DoD verified across all 3 tracks
- **Design Review:** 3/3 PASS WITH NOTES. Quick P1 fixes applied (aria-labels, delete confirmation, focus rings, 8px-aligned indent)

### Deferred Items

| Item | Reason | Target |
|---|---|---|
| WAI-ARIA tree roles (`role="tree"`, `role="treeitem"`) | Significant refactor — needs proper keyboard arrow navigation | Sprint 23 |
| Vault loading skeleton (animate-pulse) | Cosmetic polish | Sprint 23 |
| Replace `window.confirm()` with AlertDialog | Requires state management for confirmation dialogs | Sprint 23 |
| Journal/capture deep-linking with date context | Route to `/notes?date=...` instead of generic `/notes` | Sprint 23 |
| Agent 7 P1 findings (10 items) | Should-fix, not sprint-blocking | Sprint 23 |
| local-entities-core.ts (611L) and local-entities-ext.ts (670L) exceed ≤600L DoD | Minor overage, would need further splitting | Sprint 23 |

### Key Learnings

1. **Dual-adapter pattern works well.** VaultAdapter interface with LocalVaultAdapter + VirtualVaultAdapter mirrors DataAdapter cleanly. The cache layer (`CachedData` + `ensureCache()`) eliminated 5-7 redundant fetchAll calls.
2. **Security review as gate is high-value.** Agent 7 caught path traversal and YAML injection that would have shipped otherwise.
3. **Sprint file as living document (v1.8 protocol) pays off.** Updating parcel status during execution kept the sprint file accurate without backfill effort.
