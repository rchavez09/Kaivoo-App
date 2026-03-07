# Code Audit -- Sprint 30: Bug Bash + Concierge Hardening
**Agent 7 -- Code Reviewer**
**Date:** 2026-03-06
**Branch:** sprint/30-bug-bash-concierge
**Parcels reviewed:** P1--P12 (7 bug fixes, 3 concierge hardening, 2 UX polish)

---

## Executive Summary

Sprint 30 directly addresses every P1 finding from the Sprint 26 code audit. The TopicPage data-loss bug (P1-A) is fixed across three scenarios (unmount, same-component navigation, tab close). The base64 image bloat (P1-B) is solved with a proper compression pipeline. The Supabase migration gap (P2-A) is closed with `content` columns now in generated types and all casts removed. The concierge hardening work (P8/P9/P10) is architecturally clean and follows the Vision v7.2 layer model. The attachment rename pipeline (P11) is a complete vertical slice across all layers. One P1 issue found (pre-compaction flush memory source tag). No P0 blockers.

**Verdict: PASS WITH CONDITIONS** -- fix the one P1 before merge.

---

## P0 -- Ship Blockers

*None.*

---

## P1 -- Fix This Sprint

### P1-A: `preCompactionFlush` saves memories with source `'extraction'` instead of `'pre_compaction_flush'`
**File:** `daily-flow/src/lib/ai/extraction.ts` line 237
**Dimension:** CODE / DATA INTEGRITY

The sprint file (P8) explicitly states the source should be `'pre_compaction_flush'` to distinguish pre-compaction memories from regular extraction memories. However, the `addMemory` call on line 237 passes `'extraction'` as the source -- identical to the regular `extractMemories` function on line 122.

This means there is no way to distinguish memories created by the pre-compaction flush from those created by normal end-of-conversation extraction. For Layer 7 coherence monitoring and future memory curation, this distinction matters.

**Current code (line 237):**
```ts
const memory = await addMemory(fact.content, fact.category, 'extraction');
```

**Fix:**
```ts
const memory = await addMemory(fact.content, fact.category, 'pre_compaction_flush');
```

Note: Verify that the `addMemory` function and its `source` parameter type accept the string `'pre_compaction_flush'`. If the type is a union of string literals, add the new value.

---

## P2 -- Should Fix

### P2-A: `beforeunload` flush calls async functions but browser may not wait
**File:** `daily-flow/src/pages/TopicPage.tsx` lines 138--153
**Dimension:** CODE / RELIABILITY

The `beforeunload` handler calls `void updateTopicPage(...)` and `void updateTopic(...)`, which are async functions (they go through the adapter and ultimately make network requests or SQLite writes). During `beforeunload`, browsers aggressively tear down the page. The `void` prefix fires the promise but there is no guarantee the browser will allow the network request to complete.

For the Supabase (web) path, the request may be dropped before reaching the server. This is a known browser limitation. The mitigation is to use `navigator.sendBeacon` or ensure the debounce timeout (1500ms) is short enough that saves complete before the user closes the tab in most cases.

**Severity:** P2 because the debounce already fires saves every 1500ms, so the maximum data loss window is 1.5 seconds of typing. The `beforeunload` handler is a best-effort improvement and is still better than not having one. For the desktop (Tauri) path, local SQLite writes are synchronous-enough to succeed.

**Recommendation:** Accept as-is for v1. If data loss reports emerge post-launch, consider switching to `navigator.sendBeacon` with a serialized update payload.

---

### P2-B: `compressImage` unreachable fallback code
**File:** `daily-flow/src/components/journal/RichTextEditor.tsx` lines 57--61
**Dimension:** CODE

The loop `for (let quality = 0.8; quality >= 0.3; quality -= 0.1)` includes a `quality <= 0.3` escape condition inside the loop body (line 52). This means the function always returns inside the loop. The fallback code after the loop (lines 58--60) is unreachable dead code.

This is not a bug -- the function behaves correctly. But the unreachable fallback is misleading and adds unnecessary bytes.

**Current:**
```ts
for (let quality = 0.8; quality >= 0.3; quality -= 0.1) {
    const blob = await canvas.convertToBlob({ type: 'image/jpeg', quality });
    if (blob.size <= MAX_IMAGE_BYTES || quality <= 0.3) {
      // Always returns here on last iteration
      return new File([blob], name, { type: 'image/jpeg' });
    }
  }
  // Unreachable
  const blob = await canvas.convertToBlob({ type: 'image/jpeg', quality: 0.3 });
  return new File([blob], ...);
```

**Recommendation:** Remove the dead code after the loop, or restructure the loop to make the control flow clearer.

---

### P2-C: Floating-point comparison in compression loop
**File:** `daily-flow/src/components/journal/RichTextEditor.tsx` line 50
**Dimension:** CODE

The loop `for (let quality = 0.8; quality >= 0.3; quality -= 0.1)` subtracts 0.1 from a floating-point number on each iteration. Due to IEEE 754 precision, after 5 iterations `quality` could be `0.30000000000000004` rather than exactly `0.3`, potentially causing the loop to execute one extra or one fewer iteration than intended.

**Severity:** P2 because the `quality <= 0.3` check inside the loop body acts as a safety net -- even if the loop runs one extra time, it still returns. No user-visible bug, but the pattern is fragile.

**Recommendation:** Use an integer counter instead:
```ts
for (let q = 8; q >= 3; q--) {
  const quality = q / 10;
  // ...
}
```

---

### P2-D: `assembleConciergeContext` hardcodes `hasTools: true`
**File:** `daily-flow/src/lib/ai/prompt-assembler.ts` line 237
**Dimension:** CODE / EXTENSIBILITY

The new `assembleConciergeContext` function always passes `hasTools: true` to `assembleSystemPrompt`. If a future context (e.g., a lightweight quick-reply mode, or a read-only summary mode) needs to omit tool instructions from the system prompt, the function cannot accommodate it.

**Current:**
```ts
return assembleSystemPrompt({
    soul,
    depth: settings.depth,
    memories: activeMemories,
    summaries,
    appContext,
    hasTools: true,
  });
```

**Recommendation:** Accept for now. The concierge currently always has tools. Add a parameter when a no-tools mode is needed.

---

### P2-E: `coherence-monitor.ts` -- personality drift only checks `playful` tone
**File:** `daily-flow/src/lib/ai/coherence-monitor.ts` lines 103--117
**Dimension:** CODE / COMPLETENESS

The personality drift check (heuristic #3) only fires when `soul.tone === 'playful'`. If the tone is `'professional'` or `'casual'`, no drift detection runs for tone mismatch. A `professional` concierge using slang/emojis, or a `casual` concierge suddenly becoming overly formal, would go undetected.

**Severity:** P2 because this is Phase A (observation-only) and the sprint file explicitly says "Start with logging only." The current implementation is a reasonable starting point.

**Recommendation:** In a future sprint, add inverse checks for `professional` (detect casual/playful language) and `casual` (detect overly formal language).

---

### P2-F: `SupabaseAttachmentAdapter.renameFile` does not sanitize input
**File:** `daily-flow/src/lib/adapters/supabase-attachments.ts` lines 65--71
**Dimension:** SECURITY

The `renameFile` method passes `newName` directly to Supabase Storage `move()` without any sanitization. While Supabase Storage likely rejects path traversal attempts server-side, the `LocalAttachmentAdapter` correctly applies `sanitizeFilename()` to both old and new names. The Supabase adapter should do the same for defense-in-depth.

**Current:**
```ts
async renameFile(entityId: string, oldName: string, newName: string): Promise<string> {
    const oldPath = this.storagePath(entityId, oldName);
    const newPath = this.storagePath(entityId, newName);
    const { error } = await this.supabase.storage.from(BUCKET).move(oldPath, newPath);
    if (error) throw new Error(`Rename failed: ${error.message}`);
    return newName;
  }
```

**Fix:** Add basic sanitization:
```ts
const safeName = newName.replace(/[/\\:\0]/g, '_').replace(/^\.+/, '') || 'unnamed';
```

---

### P2-G: `SupabaseAttachmentAdapter.renameFile` does not check for name collision
**File:** `daily-flow/src/lib/adapters/supabase-attachments.ts` lines 65--71
**Dimension:** CODE / DATA INTEGRITY

The `LocalAttachmentAdapter.renameFile` correctly checks `if (await exists(newPath))` before renaming and throws a user-friendly error. The `SupabaseAttachmentAdapter` does not check -- if a file with `newName` already exists in the bucket, Supabase Storage `move()` may silently overwrite it, causing data loss.

**Recommendation:** Add a `list` check before `move`:
```ts
const { data: existing } = await this.supabase.storage.from(BUCKET).list(this.storagePath(entityId));
if (existing?.some((f) => f.name === newName)) {
  throw new Error(`A file named "${newName}" already exists`);
}
```

---

## What's Clean -- Per-Parcel Breakdown

### P1 (TopicPage data loss fix) -- PASS
**Files changed:** `daily-flow/src/pages/TopicPage.tsx`

All three data-loss scenarios from Sprint 26 P1-A are now addressed:

1. **Component unmount** (lines 122--135): Cleanup effect correctly reads `pendingSaveRef.current` and fires the save.
2. **Same-component navigation** (lines 79--92): The effect triggered by `[topicId, pageId]` flushes the PREVIOUS pending save before syncing editor state to the new entity. This correctly handles the case where React reuses the same `TopicPage` component instance when navigating between topics.
3. **Tab close** (lines 138--153): `beforeunload` event listener flushes pending saves.

The `pendingSaveRef` pattern is well-designed -- it captures the correct `isPage`, `pageId`, and `topicId` at the time of the last edit, so the flush always targets the right entity even if the component has already re-rendered for a new route.

The `eslint-disable-line react-hooks/exhaustive-deps` on line 92 is acceptable here -- the effect intentionally triggers only on route parameter changes, and including `page?.content` / `topic?.content` in deps would cause unwanted re-syncs during editing.

---

### P2 (Base64 image size cap) -- PASS
**Files changed:** `daily-flow/src/components/journal/RichTextEditor.tsx`

The `compressImage()` function (lines 33--61) is a solid implementation:

- Uses `createImageBitmap` + `OffscreenCanvas` -- the modern, efficient approach for image processing in the browser.
- Progressive quality reduction from 0.8 to 0.3 ensures reasonable visual quality.
- `scaleFactor = Math.sqrt(MAX_IMAGE_BYTES / file.size)` is the correct formula for proportional area reduction.
- Applied to both the upload path (line 173) and the base64 fallback path (line 205), covering paste, drag-drop, and file picker.
- The fallback catch block (lines 213--222) correctly falls back to raw embedding if compression fails (e.g., browser doesn't support OffscreenCanvas).

This directly resolves Sprint 26 P1-B (unbounded base64 growth).

---

### P3 (Content column types + cast cleanup) -- PASS
**Files changed:** `daily-flow/src/integrations/supabase/types.ts`, `daily-flow/src/services/topics.service.ts`

The generated types now include `content: string | null` in Row, Insert, and Update for both `topics` and `topic_pages` tables. This confirms the Supabase migration was applied.

The service layer cleanup is complete:
- `dbToTopic` and `dbToTopicPage` now use `row.content ?? undefined` (direct property access, no cast).
- `createTopic` and `createTopicPage` no longer need `as Record<string, unknown>` on the insert payload.

This directly resolves Sprint 26 P2-A and P3-E.

---

### P4 (Subtask reorder cast cleanup) -- PASS
**Files changed:** `daily-flow/src/lib/adapters/supabase.ts`

Single-line change: `((r as Record<string, unknown>).sort_order as number) ?? 0` replaced with `r.sort_order ?? 0`. This works because the `subtasks` table already had `sort_order: number | null` in the generated types. The previous cast was unnecessary.

---

### P5 (Widget reorder verification) -- PASS (no code changes)
The sprint file confirms P5 was verified working -- the full `@dnd-kit` pipeline + dual-layer persistence was already functional. No code changes needed.

---

### P6 (ScheduleWidget empty state fix) -- PASS
**Files changed:** `daily-flow/src/components/today/ScheduleWidget.tsx`

Clean fix. The early `return null` when `meetings.length === 0` is replaced with a conditional rendering pattern inside the widget card. The widget now always renders its chrome (header with icon and title) and shows "No meetings today" in the empty state. The meeting count badge is now conditionally rendered only when there are meetings.

This is correct behavior for a dashboard widget -- users should see that the widget exists even when there's nothing on the schedule.

---

### P7 (Search prefix matching) -- PASS (no changed files in diff)
The sprint file indicates this was a Supabase-side change (switching from `websearch_to_tsquery` to `to_tsquery` with `:*` suffix). The search service file was not modified in this diff, which is consistent with the change being in the edge function or RPC. Verified working per sprint file.

---

### P8 (Pre-compaction memory flush) -- PASS with P1 note
**Files changed:** `daily-flow/src/lib/ai/extraction.ts`

The `preCompactionFlush()` function (lines 160--248) is well-architected:

- Separate prompt (`PRE_COMPACTION_PROMPT`) optimized for long conversations, with higher fact limit (8 vs 5).
- Correct deduplication against existing memories.
- Correct guard: requires at least 3 user messages and valid API key.
- Message content truncated to 300 chars per message (vs 500 in regular extraction) -- appropriate for long conversations where breadth matters more than depth.
- The `PRE_COMPACTION_THRESHOLD` (40 visible messages) is exported as a named constant and consumed by ConciergeChat.

The integration in ConciergeChat (lines 200--203) correctly runs the flush BEFORE system prompt assembly, ensuring memories are saved before the context window fills up.

**Issue:** See P1-A above -- the `source` parameter should be `'pre_compaction_flush'` not `'extraction'`.

---

### P9 (Deterministic context assembly) -- PASS
**Files changed:** `daily-flow/src/lib/ai/prompt-assembler.ts`, `daily-flow/src/components/ai/ConciergeChat.tsx`

`assembleConciergeContext()` (lines 224--239) is a clean single-entry-point function that:
1. Reads soul config from settings (deterministic -- localStorage)
2. Reads AI settings from settings (deterministic -- localStorage)
3. Reads memories from memory-service (deterministic -- database)
4. Filters to active memories only
5. Reads summaries from memory-service (deterministic -- database)
6. Delegates to the existing `assembleSystemPrompt()` with structured data

The ConciergeChat refactor replaces 8 lines of inline data-gathering with a single `await assembleConciergeContext(appContext)` call. The old imports (`getMemories`, `getSummaries` from memory-service) and inline assembly logic are removed. This is a net reduction in ConciergeChat complexity and eliminates the risk of the chat component assembling the prompt differently from other potential consumers.

---

### P10 (Coherence monitor) -- PASS
**Files changed:** `daily-flow/src/lib/ai/coherence-monitor.ts` (new file), `daily-flow/src/components/ai/ConciergeChat.tsx`

The coherence monitor is appropriately scoped for Phase A:

1. **Name mismatch** (lines 60--76): Checks for the concierge claiming to be ChatGPT, Claude, Gemini, etc. High severity, correct.
2. **Generic response** (lines 79--99): Only flags when user has a name set AND 3+ user messages AND response >200 chars AND no personalization detected. The thresholds are reasonable to avoid false positives.
3. **Personality drift** (lines 103--117): Checks for formal language when tone is `playful`. See P2-E for the limitation.

Storage in localStorage with a 200-entry cap is appropriate for Phase A observation-only mode.

The integration in ConciergeChat (lines 297--302) runs synchronously (not in the fire-and-forget async block), which is correct since `checkCoherence` is a pure heuristic check with no async operations.

---

### P11 (Attachment rename pipeline) -- PASS with P2 notes
**Files changed:** `daily-flow/src/lib/adapters/types.ts`, `daily-flow/src/lib/adapters/supabase-attachments.ts`, `daily-flow/src/lib/adapters/local-attachments.ts`, `daily-flow/src/hooks/useAttachments.ts`, `daily-flow/src/components/attachments/FileList.tsx`, `daily-flow/src/components/attachments/EntityAttachments.tsx`, `daily-flow/src/components/projects/ProjectAttachments.tsx`

Complete vertical slice across all architectural layers:

1. **Interface** (`types.ts`): `renameFile?` added as optional method on `AttachmentAdapter`. The optional marker is correct -- `NoOpAttachmentAdapter` (web without storage) does not need to implement it.
2. **Supabase adapter** (`supabase-attachments.ts`): Uses Supabase Storage `move()`. See P2-F and P2-G for input sanitization and collision check notes.
3. **Local adapter** (`local-attachments.ts`): Uses Tauri `rename()` with `sanitizeFilename()` on both old and new names, plus `exists()` collision check. Well-implemented.
4. **Hook** (`useAttachments.ts`): `rename` function added with correct guard (`if (!attachments.renameFile)`), optimistic local state update, and error handling with toast.
5. **FileList UI** (`FileList.tsx`): Inline rename UI with pencil icon trigger, text input with extension preservation, Enter/Escape/blur handlers. The extension is correctly stripped from the edit input and re-appended on commit.
6. **Consumer components** (`EntityAttachments.tsx`, `ProjectAttachments.tsx`): Both correctly destructure `rename` and pass it as `onRename` to `FileList`.

The UI interaction pattern (pencil icon -> input field -> Enter to confirm / Escape to cancel / blur to confirm) is consistent with the existing `InlineEdit` component patterns in the codebase.

---

### P12 (Upload system polish) -- PASS
**Files changed:** `daily-flow/src/components/attachments/FileDropZone.tsx`, `daily-flow/tailwind.config.ts`

Two clean UX improvements:

1. **Indeterminate progress bar** (`FileDropZone.tsx` lines 113--120): Replaces the spinner-only state with a spinner + text + animated progress bar. The `animate-indeterminate` class is correctly defined in `tailwind.config.ts` with a `translateX(-100%)` to `translateX(400%)` keyframe at 1.5s ease-in-out.
2. **Upload icon scale** (`FileDropZone.tsx` line 123): `Upload` icon scales up 25% on drag-enter via `scale-125` class, providing visual feedback that the drop zone is active. The transition is smooth via `transition-transform`.

Both additions are CSS-only with no JavaScript complexity.

---

## Score Card

| Dimension | Score | Notes |
|---|---|---|
| PERF | 8/10 | Image compression pipeline solves the base64 bloat. `scaleFactor` approach is efficient. |
| SECURITY | 8/10 | Local adapter sanitizes filenames correctly. Supabase adapter missing sanitization (P2-F). |
| CODE | 8/10 | Clean architecture throughout. Pre-compaction source tag wrong (P1-A). Minor dead code (P2-B). |
| BUNDLE | 9/10 | No new dependencies added. `coherence-monitor.ts` is lightweight (~3KB). |
| DATABASE | 9/10 | Content column migration applied. Generated types updated. All casts removed. |
| CACHING | 9/10 | Attachment rename correctly updates local state optimistically. No stale cache risks. |
| A11Y | 8/10 | Rename button has `aria-label`. FileDropZone maintains correct ARIA patterns. Image insert button now has `aria-label`. |
| ERRORS | 8/10 | Comprehensive error handling in rename pipeline, compression fallback, and pre-compaction flush. `beforeunload` async limitation is documented (P2-A). |
| ARCHITECTURE | 9/10 | `assembleConciergeContext` is a textbook single-entry-point pattern. Coherence monitor is correctly decoupled. Rename pipeline is a clean vertical slice. |
| REFACTOR | 9/10 | ConciergeChat prompt assembly simplified. Topic service casts removed. Sprint 26 debt addressed. |

**Overall Grade: A- (85/100)**

This is a strong bug-fix sprint that directly addresses the P1 findings from Sprint 26. The concierge hardening work is architecturally sound and follows the Vision v7.2 layer model. The only P1 is a single-line fix (memory source tag). The P2 items are minor and can be addressed in Sprint 33 (Cleanup + Hardening) if not fixed before merge.

---

## Condition for PASS

Fix **P1-A** (change `'extraction'` to `'pre_compaction_flush'` in `preCompactionFlush` on line 237 of `extraction.ts`) before merge. All other findings are P2 or lower and can be deferred.

---

*Code Audit -- Sprint 30 -- Completed March 6, 2026 by Agent 7 (Code Reviewer)*
