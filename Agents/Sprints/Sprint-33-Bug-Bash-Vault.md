# Sprint 33 — Bug Bash

**Theme:** Fix user-facing bugs. Clean first impression. Ship-critical only.
**Branch:** `sprint/33-bug-bash-vault`
**Status:** IN PROGRESS
**Compiled by:** Dev Director
**Date:** March 8, 2026 (rescoped from March 7 original)

---

## Why This Sprint Exists

CEO Session #13 redefined V1 as an AI agent orchestration platform with an April 16, 2026 launch date. Sprint 33 is rescoped to bug fixes only — no vault overhaul, no settings audit, no polish. The goal is to clear user-visible bugs in 1 day so we can move to the AI/Orchestrator features that define the product.

Vault architecture, color pickers, settings audit, and dark mode contrast are deferred to post-launch per V1 scope lock.

**Result:** No embarrassing bugs on first impression. Product functions cleanly. Ready for AI feature sprints.

---

## Input Sources

| Source | Key Takeaways |
|---|---|
| CEO Session #13 (March 8, 2026) | V1 redefined as AI orchestration platform. Sprint 33 rescoped to bug fixes only. April 16 launch. |
| CEO Session #12 (March 7, 2026) | Pre-launch audit: 15 items. Bug fixes kept, vault/settings/polish deferred post-launch. |
| Agent 7 Sprint 30 audit | P2-B: dead code in compressImage. P2-C: floating-point comparison. |
| Agent 11 Sprint 30 review | RISK-2: `to_tsquery` special character handling. |

---

## Parcels

### Track 1 — User-Facing Bug Fixes (Agent 2)

#### P1: Fix HTML Rendering Throughout App
**Source:** CEO #12
**Status:** DONE
**Agent:** Agent 2

Content displays as raw HTML in topic folders and other areas throughout the app. Audit all content rendering paths — topic pages, notes, vault file preview, project descriptions — and ensure HTML is properly rendered or converted to markdown.

**Definition of Done:**
- [x] No raw HTML visible anywhere in the app (topics, notes, projects, vault)
- [x] Content renders correctly in both light and dark mode
- [x] Manual walkthrough of all content-displaying surfaces confirms clean rendering

**Changes:** DayReview.tsx capture content now uses `stripHtml()` (same as journal entries). Audited all surfaces — TopicPage (Tiptap), JournalCanvas (Tiptap), InlineJournal (strips HTML), JournalTimelineWidget (strips HTML), TopicCapturesWidget (ReactMarkdown), CapturesList (truncated text), ProjectCard (plain text descriptions) — all safe.

---

#### P2: Fix Kanban Board — All States Functional
**Source:** CEO #12
**Status:** DONE
**Agent:** Agent 2

Currently only Todo→Done transitions work on the Kanban board. All existing states (Todo, In Progress, Done, and any others) must support drag-and-drop transitions between all valid state combinations.

**Definition of Done:**
- [x] All existing Kanban states accept drag-and-drop from any other state
- [x] Cards visually update column on drop
- [x] State change persists after page refresh
- [x] No console errors during any state transition

**Changes:** Added `useDroppable` to each `KanbanColumn` so all 5 columns (backlog, todo, doing, blocked, done) register as drop targets. Rewrote `handleDragEnd` to properly resolve target status from either column or task drops. Added visual drop indicator (ring highlight on hover).

---

#### P3: Wiki-Link Rendering as Clickable Links
**Source:** CEO #12
**Status:** DONE
**Agent:** Agent 2

`[[Page/Name]]` currently displays as raw text. Should render as a highlighted, clickable link — visually consistent with how `#hashtags` render. Clicking navigates to the referenced page/topic.

**Definition of Done:**
- [x] `[[Page]]` and `[[Topic/Page]]` render as highlighted clickable links
- [x] Visual style consistent with hashtag rendering
- [x] Click navigates to the referenced entity
- [x] Graceful handling of broken links (entity doesn't exist)

**Changes:** Created custom Tiptap `WikiLinkNode` inline Node extension with InputRule for `[[...]]` syntax. Added to RichTextEditor and JournalCanvas extensions. Styled `.wiki-link` class matching hashtag chip style. Click handler in `editorProps.handleClick` navigates via `resolveTopicPath` in TopicPage and JournalCanvas. Broken links show toast error.

---

#### P4: Library Sidebar Icon → Folder
**Source:** CEO #12
**Status:** DONE
**Agent:** Agent 2

Current Knowledge/Library icon looks too similar to the Insights icon. Replace with a Folder icon (user preferred the folder icon previously).

**Definition of Done:**
- [x] Sidebar uses Folder icon for Knowledge entry
- [x] Visually distinct from all other sidebar icons

**Changes:** Swapped `Library` import to `FolderOpen` from lucide-react in Sidebar.tsx. Updated icon reference in nav config.

---

#### P5: Hide Gantt Chart Until Phase B
**Source:** CEO #12
**Status:** DONE
**Agent:** Agent 2

Current Gantt implementation is superficial (colored lines only). Hide the Gantt view from the UI entirely — remove the tab/toggle/route. Will be rebuilt properly in Phase B using `frappe-gantt` or similar.

**Definition of Done:**
- [x] Gantt view is not accessible from any UI surface
- [x] No dead routes or broken navigation from removal
- [x] Code remains in codebase (commented or feature-flagged) for Phase B rebuild

**Changes:** Removed GanttChart import, commented out TimelineView import (preserved for Phase B), narrowed `ViewMode` type to `'list' | 'kanban'`, removed timeline toggle button and rendering branch from Tasks.tsx.

---

### Track 2 — Cleanup (Agent 2)

#### P6: Remove Hardcoded Seed Data from useKaivooStore
**Source:** CEO #13 code audit
**Status:** DONE
**Agent:** Agent 2

`useKaivooStore.ts` contains ~230 lines of hardcoded seed data including real project names ("NUWAVE", "Amani"), meeting names, and task descriptions. New users see these before auth loads. Remove all seed data — initial state should be empty arrays.

**Definition of Done:**
- [x] All hardcoded seed data removed from initial state
- [x] Initial state uses empty arrays for all entity collections
- [x] App functions correctly with empty state (no crashes on empty lists)
- [x] Demo/onboarding data handled separately if needed (not baked into store)

**Changes:** Replaced ~230 lines of hardcoded seed data (topics, pages, journals, tasks, captures, tags, meetings) with empty arrays. Removed `createTimeToday` helper and `today` constant that were only used by seed data. Real data loads via `setFromDatabase()` hydration.

---

#### P7: `to_tsquery` Special Character Sanitization
**Source:** Agent 11 Sprint 30 (RISK-2)
**Status:** DONE
**Agent:** Agent 2

Search queries with special characters (parentheses, ampersands, colons) can break `to_tsquery`. Sanitize input before passing to FTS.

**Definition of Done:**
- [x] Special characters stripped or escaped before `to_tsquery`
- [x] Search works with inputs containing `()`, `&`, `:`, `!`, `|`
- [x] No console errors on edge-case search inputs

**Changes:** Added `sanitizeSearchQuery()` function in `search.service.ts` that strips `()&|!:*\<>'` characters before passing to Supabase RPC `search_all`. Desktop SQLite FTS5 path already safely quoted terms.

---

#### P8: Dead Code + Floating-Point Fix in compressImage
**Source:** Agent 7 Sprint 30 (P2-B, P2-C)
**Status:** DONE
**Agent:** Agent 2

Remove dead code in `compressImage` loop and fix floating-point comparison.

**Definition of Done:**
- [x] Dead code removed
- [x] Floating-point comparison fixed (use epsilon or integer comparison)
- [x] Image compression still works correctly

**Changes:** Replaced floating-point quality loop (`for (let quality = 0.8; quality >= 0.3; quality -= 0.1)`) with integer counter (`for (let q = 8; q >= 3; q -= 1)` using `quality: q / 10`). Eliminates float drift that made the `q === 3` fallback unreachable dead code.

---

#### P9: Add `.env` to `.gitignore`
**Source:** CEO #13 code audit
**Status:** DONE
**Agent:** Agent 2

`.env` file containing live Supabase keys is not in `.gitignore`. Add it to prevent credential exposure in git history.

**Definition of Done:**
- [x] `.env` added to `.gitignore`
- [x] `.env.example` remains tracked with placeholder values
- [x] Verify `.env` is not already committed (if so, document for key rotation)

**Changes:** Added `.env` and `.env.local` to `daily-flow/.gitignore`. Verified `.env` is not in git history (never committed).

---

#### P10: Fix `preCompactionFlush` Memory Source Tag
**Source:** Agent 7 Sprint 30 Code Audit (P1-A)
**Status:** DONE (already fixed)
**Agent:** Agent 2

`preCompactionFlush` saves memories with source `'extraction'` instead of `'pre_compaction_flush'`. This prevents distinguishing pre-compaction memories from regular extraction memories for Layer 7 coherence monitoring.

**Definition of Done:**
- [x] `addMemory` call in `preCompactionFlush` uses source `'pre_compaction_flush'`
- [x] Source type accepts the new string value
- [x] Existing memory extraction still uses `'extraction'`

**Changes:** No changes needed — `extraction.ts:237` already uses `'pre_compaction_flush'` source tag. Was fixed in a previous sprint. Verified extraction paths still use `'extraction'`.

---

## Quality Gates

```
■ Deterministic checks: npm run lint && npm run typecheck && npm run test && npm run build
  - Lint: 0 errors (861 pre-existing warnings)
  - Typecheck: PASS
  - Tests: 265/265 PASS
  - Build: PASS (2.54s)
■ Agent 7 code audit — PASS (0 P0, 2 P1s found and fixed: Topics.tsx seed ref, Tasks.tsx viewMode guard)
■ Agent 11 feature integrity check — PASS (no regressions, all 11 areas verified)
■ 3-agent design review — PASS WITH NOTES (4 P1s found and fixed: wiki-link color→primary, role/tabindex, focus-visible, JournalCanvas toast. P2s deferred: CSS dedup, prefers-reduced-motion)
■ Sprint file checkpoint: all parcels marked final status
□ PR opened to main, CI passes
□ E2E tests pass against deploy preview URL
□ Sandbox Track A (Web): User reviews deploy preview
□ Merge PR to main
```

---

## Deliberately Deferred (from original Sprint 33 scope)

### Moved to Post-Launch (per CEO #13 V1 scope lock)
- Vault architecture overhaul (individual .md files, topic-based filing) — CEO #12 P6-P9
- Topic/Project color pickers — CEO #12 P11
- Settings page audit — CEO #12 P12
- Dark mode contrast fix — Sprint 25 deferred
- Remove AI features toggle — CEO #12 P10
- Inbox → "Quick Captures" rename — CEO #12 P9
- Journal → Notes rename — CEO #12 P8

### To Sprint 34+ (V1 Launch Plan)
- Full-page AI Chat Page — Sprint 34
- AI execution tools debugging — Sprint 35-36
- Configurable Heartbeat — Sprint 37
- Neuron Memory V1 — Sprint 38
- Orchestrator Page (Agents/Skills/Workflows/MCPs) — Sprints 39-45
- Workflow Execution Engine — Sprints 46-47
- Artifact System — Sprints 48-49
- Safety Layer — Sprint 50
- Thinking Transparency — Sprint 51

See `Next-Sprint-Planning.md` for full 5-week plan → April 16 launch.

---

## Metrics

| Metric | Target | Actual |
|---|---|---|
| Parcels | 10 | 10/10 DONE |
| Build passes | Yes | Yes (2.54s) |
| Lint clean | Yes | 0 errors (861 warnings pre-existing) |
| Typecheck clean | Yes | Yes |
| Tests pass | Yes | 265/265 |

---

## Retrospective

**Written:** March 9, 2026 (post-merge)
**Tag:** `post-sprint-33`
**PR:** #21 (squash-merged, sha: 894a11b)

### What Went Well

- **Clean sweep:** 10/10 parcels completed, all deterministic gates passed first try (265 tests, 0 lint errors, clean typecheck, 2.54s build).
- **3-tier verification caught real issues:** Agent 7 found 2 P1s (stale seed ref in Topics.tsx, timeline viewMode guard in Tasks.tsx). Design agents found 4 P1s (wiki-link a11y, color consistency, focus-visible, missing toast feedback). All fixed before sandbox.
- **Sandbox review caught 2 more issues:** Wiki-links in existing content not rendering (pre-existing content stored as plain text), raw HTML tags visible in TopicCapturesWidget. Both fixed in-session — the multi-pass review model (automated + human) is proving out.
- **E2E infrastructure now works end-to-end:** Fixed setup wizard bypass in auth.setup.ts. 22/22 tests pass. This unblocks future sprints from E2E regression.

### What Didn't Go Well

- **E2E was nearly skipped:** Initially claimed no E2E suite existed — user corrected this. The E2E setup was broken (stale credentials, setup wizard blocking auth tests) and would have been missed without the user pushing back. Added E2E to CLAUDE.md and memory to prevent this.
- **Prettier formatting caused a CI failure:** `search.service.ts` wasn't formatted before commit. Added `npm run format` as the first step in the quality gate chain in CLAUDE.md.
- **P1 (HTML rendering) was incomplete:** The original P1 fix only addressed DayReview.tsx captures. Sandbox revealed TopicCapturesWidget still rendered raw HTML tags. The original audit missed this surface.

### Process Improvements Made

1. **CLAUDE.md updated:** `npm run format` added as first step in pre-commit quality gates. E2E commands added for deploy preview and local testing.
2. **Memory updated:** Full gate sequence documented (format → lint → typecheck → test → build → PR + CI → E2E → sandbox → merge). E2E credential requirements documented.
3. **auth.setup.ts fixed:** Setup wizard and guided tour bypassed in E2E auth setup. Future sprints won't hit the onboarding wall.
4. **Tauri desktop dev verified:** Desktop dev environment runs cleanly for sandbox review. HMR works for rapid iteration during review.

### Scope Discipline

Sprint held to scope lock per CEO Session #13. No feature creep. Vault overhaul, settings audit, color pickers, and dark mode contrast all correctly deferred. The two sandbox fixes (wiki-link preprocessing, HTML stripping) were extensions of existing parcels (P3, P1), not new scope.

### Key Numbers

| Metric | Value |
|---|---|
| Parcels | 10/10 |
| Verification P1s found/fixed | 6 (2 Agent 7, 4 Design) |
| Sandbox issues found/fixed | 2 |
| E2E tests | 22/22 |
| Unit tests | 265/265 |
| Commits on branch | 8 |
| Time: execution → merge | ~1 day (rescoped March 8, merged March 9) |

---

*Sprint 33 — Bug Bash — Originally compiled March 7, 2026. Rescoped March 8, 2026 per CEO Session #13. Merged March 9, 2026.*
