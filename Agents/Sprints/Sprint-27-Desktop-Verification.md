# Sprint 27 — Desktop Verification

**Theme:** Verify all Sprint 26 features work on desktop (Tauri + local SQLite). Sprint 26 skipped Track B sandbox testing entirely — this sprint closes that gap before launch prep begins.
**Branch:** `sprint/27-desktop-verification`
**Status:** DONE — merged to main (PR #12 + hotfix PR #13)
**Compiled by:** Director
**Date:** March 4, 2026

---

## Why This Sprint Exists

Sprint 26 (Feature Completion) delivered 9 parcels across 3 tracks — attachments everywhere, topic content editing, export & cleanup. All Phase 4 agent gates passed (Agent 7, Agent 11, 3-agent design review). However:

1. **E2E tests were skipped** — deferred with no replacement
2. **Track B (Desktop) sandbox testing never happened** — Sprint 26 includes desktop export (P8), local adapter updates (P5), and SQLite schema changes (P4), all of which require desktop verification
3. **Phase 3 infrastructure was incomplete** — Supabase migration and storage bucket were discovered missing during Track A sandbox, suggesting the execution phase wasn't thorough
4. **Only Track A (Web) was tested** before merge

The code is on `main` and web works. But desktop has never been verified for Sprint 26 features. This sprint does one thing: build, test, and fix.

---

## Input Sources

| Source | Key Takeaways |
|---|---|
| Sprint 26 retrospective | 4 sandbox findings caught at Track A. E2E deferred. Track B never run. |
| Sprint 26 Key Learning #1 | "Supabase infrastructure must be provisioned before sandbox" |
| Sprint Protocol v2.0 §1B | Track B applies "when sprint includes Tauri/desktop work" — Sprint 26 qualifies |
| Agent 11 Integrity Check Sprint 26 | PASS on code review, but 4 non-blocking concerns noted (empty state, widgetSettings export, HTML-to-markdown, TypeScript casts) |

---

## Scope — 1 Track, 5 Parcels

### Track 1: Desktop Verification & Fix

Build the desktop app, test every Sprint 26 feature on local SQLite, fix what's broken.

| # | Parcel | Agent | Status | Priority |
|---|---|---|---|---|
| P1 | **Desktop build verification** — Rust compiles cleanly (28s `cargo check`). Deterministic checks pass: 0 TS errors, 265/265 tests, build 2.60s. Tauri config valid. | Agent 2 | DONE | P0 |
| P2 | **Topic content editing on desktop** — Code audit: `local-topics.ts` correctly handles `content` field in all CRUD operations (fetchAll, create, update, fetchById). SQLite migration (`ALTER TABLE topics ADD COLUMN content TEXT` + same for `topic_pages`) is non-destructive and idempotent. TypeScript types updated. | Agent 2 | DONE | P0 |
| P3 | **Attachments on desktop** — Code audit found **CRITICAL bug**: `TopicPage.handleImageUpload` returned `info.url` (`attachment://` protocol) instead of calling `getFileUrl()` which uses Tauri's `convertFileSrc()`. Images uploaded to disk but displayed as links, not inline images. **Fixed**: now calls `attachments.getFileUrl(contentId, info.name)`, matching the pattern already used in `JournalEntryDialog.tsx`. Journal and project attachments were already correct. | Agent 2 | DONE | P0 |
| P4 | **Desktop data export** — Code audit found **CRITICAL bug**: `handleImport` required Supabase auth (`if (!user) return`) which is null on desktop. Import button appeared functional but silently did nothing. **Fixed**: added full adapter-based import path (`handleAdapterImport`) that handles both snake_case (web export) and camelCase (desktop export) formats, with complete ID remapping for all foreign keys including `topicIds` arrays. Legacy Supabase path preserved as `handleSupabaseImport`. | Agent 2 | DONE | P0 |
| P5 | **Fix issues found** — 3 fixes applied (see below). | Agent 2 | DONE | P0 |

### Fixes Applied (P5)

| # | Fix | File | What Changed |
|---|---|---|---|
| F1 | TopicPage inline image URL | `src/pages/TopicPage.tsx:105` | `return info.url` → `return attachments.getFileUrl(contentId, info.name)` |
| F2 | Desktop data import | `src/components/settings/DataSettings.tsx` | Added `handleAdapterImport()` with full adapter-based import (13 entity types, ID remapping, format detection). Guard changed from `if (!user) return` to `if (!user && !dataAdapter) return`. |
| F3 | topicIds remapping in import | `src/components/settings/DataSettings.tsx` | Added `.map(id => topicIdMap.get(id) ?? id)` to `topicIds` arrays in tasks, journals, and captures within `handleAdapterImport` (caught by Agent 7 P0-1). |

### Definition of Done

- [x] `cargo check` compiles Rust/Tauri code cleanly
- [x] Topic content (rich text) code paths verified for desktop/SQLite
- [x] Topic page content code paths verified for desktop/SQLite
- [x] File attachments code paths verified for desktop — inline image URL bug found and fixed
- [x] Inline images now use `getFileUrl()` → `convertFileSrc()` on desktop
- [x] JSON export works via adapter path (desktop)
- [x] Data import now works on desktop (was completely broken — fixed)
- [x] Markdown export works via adapter + vault path (desktop)
- [x] ConciergeChat is sole chat (FloatingChat deleted in Sprint 26)
- [x] All fixes passing `npm run typecheck && npm run test && npm run build` (0 errors, 265/265, 2.60s)

---

## Agent Assignments

| Agent | Parcels | Focus |
|---|---|---|
| **Agent 2** (Staff Engineer) | P1–P5 | Desktop build, code audit, bug fixes |
| **Agent 7** (Code Reviewer) | P5 | Review fixes — found P0-1 (topicIds remapping), fixed |
| **Agent 11** (Feature Integrity) | P5 | PASS — zero regressions |

---

## Quality Gates

- [x] **Deterministic checks:** lint (0 errors, 829 warnings), typecheck clean, 265/265 tests pass, build 2.60s
- [x] **Desktop build:** `cargo check` compiles Tauri Rust code (28s, 0 errors)
- [x] **Agent 7 code audit:** 72/100 initially → P0-1 fixed (topicIds remapping). P0-2 was false positive (count already present). Remaining P1s/P2s are non-blocking (file size, input validation, batch import — deferred).
- [x] **Agent 11 feature integrity:** PASS — no regressions. Supabase import path preserved byte-for-byte. All UI unchanged.
- [x] **Sprint file checkpoint:** All parcels marked DONE, gates checked off
- [ ] **E2E test:** Deferred (no Playwright tests for these features)

---

## Phase 5: Sandbox Testing

### Track A — Web
- Verify no regressions from P5 fixes on the Netlify deploy preview
- Key check: topic inline images still work on web (Supabase storage)

### Track B — Desktop (THE WHOLE POINT)
- User builds locally: `cd daily-flow && npm run tauri dev`
- **Testing checklist:**
  1. App launches, sidebar navigation works, all pages load
  2. Create a new topic → add rich text content → navigate away → return → content is there
  3. Upload a file attachment to a topic → file appears in list → click to open
  4. Open journal → select an entry → upload an attachment → verify it appears
  5. In the rich text editor, paste or drag an image → verify it uploads and renders inline
  6. Settings → Export Your Data (JSON) → open the file, verify entities present
  7. Settings → Import Data → select a previously exported JSON → verify toast shows correct counts
  8. Settings → Export to Markdown → verify files appear in vault directory
  9. Verify ConciergeChat button is present (bottom-right), no FloatingChat overlap
  10. Dark mode toggle → verify all above still looks correct

---

## Deliberately Deferred

| Item | Why | Target |
|---|---|---|
| E2E test infrastructure (Playwright) | Verification sprint is manual testing; Playwright setup is Sprint 28 scope | Sprint 28 |
| Extract import functions to separate files | Agent 7 P1-1: DataSettings.tsx at 911 lines. Import logic should move to utility files. | Sprint 28 |
| Import input validation (version check, Zod schema) | Agent 7 P1-2: Malformed JSON reaches adapter layer without validation. | Sprint 28 |
| Duplicate import warning dialog | Agent 7 P1-3: Repeated imports create duplicates. | Sprint 28 |
| Import progress indicator | Agent 7 P2-2: Sequential imports are slow for large datasets. | Sprint 28+ |
| Agent 11 concerns from Sprint 26 (empty state, widgetSettings) | Non-blocking cosmetic issues, not desktop-specific | Sprint 28+ |
| Image resize handles in editor | Cosmetic, not a verification concern | Sprint 28+ |

---

## Risk Register

| Risk | Mitigation |
|---|---|
| Tauri dev build fails (Rust toolchain, native deps) | ~~Check Rust/Tauri versions first.~~ VERIFIED: Rust 1.93.1, cargo check passes. |
| SQLite `content` column migration doesn't run | ~~Inspect `local-schema.ts`.~~ VERIFIED: ALTER TABLE is idempotent, errors silently swallowed on re-run. |
| Local attachment storage path doesn't exist | `LocalAttachments.uploadFile()` creates `.attachments/{entityId}/` on first upload. VERIFIED in code audit. |
| Inline images use wrong URL protocol on desktop | **FOUND AND FIXED** — was `attachment://`, now uses `convertFileSrc()` via `getFileUrl()`. |
| Data import broken on desktop | **FOUND AND FIXED** — was Supabase-only, now has full adapter path. |

---

---

## Sprint Retrospective

**Completed:** March 4, 2026
**Parcels:** 5/5 DONE (plus 8-commit hotfix cycle for sandbox findings)
**PRs:** #12 (sprint branch) + #13 (hotfix/desktop-sandbox-fixes)
**Tag:** `post-sprint-27`

### What Was Delivered

Sprint 27 verified and fixed all Sprint 26 features on desktop (Tauri + local SQLite). The sprint itself (PR #12) found and fixed 2 critical bugs: inline images using wrong URL protocol and data import completely broken on desktop. Track B sandbox testing then uncovered 6 additional desktop-specific issues that required an 8-commit hotfix cycle (PR #13):

1. **CSP blocking Tauri asset protocol** — added `asset:` and `http://asset.localhost` to Content-Security-Policy
2. **Tauri v2 glob doesn't match dot-prefixed paths** — `$APPDATA/**` silently failed for `.attachments/` directory. Fixed by adding explicit `$APPDATA/vault/.attachments/**` to all 9 fs permission scopes.
3. **Invisible cursor in dark mode** — ProseMirror default caret color blended with dark background (#12101E). Fixed with `caret-color: currentColor`.
4. **Drag-and-drop intercepted by Tauri** — Tauri's native `dragDropEnabled: true` (default) captured file drops before web `dataTransfer.files`. Fixed by setting `dragDropEnabled: false`.
5. **Inline images rendered as HTML links** — `convertFileSrc()` returned `asset://` URLs the webview couldn't load. Replaced with blob URLs via `readFile()` + `URL.createObjectURL()`.
6. **Clicking attachments did nothing** — `shell.open()` only handles URLs, not file paths. Installed `@tauri-apps/plugin-opener` and used `openPath()` for OS-native file opening.

### Verification Results

- **Deterministic checks:** lint clean, typecheck clean, 265/265 tests pass, build succeeds
- **Desktop build:** `cargo check` passes (Rust 1.93.1)
- **Agent 7:** Code audit passed (P0-1 topicIds remapping fixed)
- **Agent 11:** PASS — zero regressions
- **Track A (Web):** Approved
- **Track B (Desktop):** Approved after hotfix cycle — all 10 checklist items verified

### Sandbox Findings

Track B sandbox testing was the most productive phase of this sprint. The code-level audit (Phase 4) caught the 2 critical bugs, but 6 of 8 total issues were only discoverable by running the actual Tauri app. Key insight: **Tauri v2's deny-by-default capability system has non-obvious behaviors** (dot-prefix glob exclusion, native drag-drop interception, shell.open URL-only restriction) that no amount of code review can catch.

### Deferred Items

| Item | Target |
|---|---|
| E2E test infrastructure (Playwright) | Sprint 28 |
| Extract import functions to utility files | Sprint 28 |
| Import validation (Zod schema) | Sprint 28 |
| Duplicate import warning dialog | Sprint 28 |
| Import progress indicator | Sprint 28+ |
| Image resize handles in editor | Sprint 28+ |

### Key Learnings

1. **Tauri v2 glob matching skips dot-prefixed path components.** `$APPDATA/**` does NOT match `$APPDATA/vault/.attachments/file.png`. You must add explicit scopes for dot-prefixed directories. This applies to ALL fs permissions (read, write, stat, exists, mkdir, readDir, remove).

2. **`shell.open()` is URL-only.** For opening local files with the OS default app, use `@tauri-apps/plugin-opener` with `openPath()`. This is a separate plugin, not part of the shell plugin.

3. **`convertFileSrc()` asset protocol is fragile.** Blob URLs via `readFile()` + `URL.createObjectURL()` are more reliable for displaying local files in the webview. Asset protocol requires both a Cargo feature flag AND scope configuration AND CSP headers, and can still fail.

4. **Tauri's native drag-drop handler intercepts web drag events.** Set `dragDropEnabled: false` in window config if the web app handles its own file drops.

5. **Desktop sandbox testing catches what code review cannot.** 6 of 8 issues found in this sprint were runtime-only, invisible in code. The Sprint Protocol v2.0 Track B requirement proved essential.

---

*Sprint 27 — Desktop Verification — Created March 4, 2026 by Director*
*This sprint exists because Sprint 26 skipped Track B. The protocol requires it; the product needs it.*
