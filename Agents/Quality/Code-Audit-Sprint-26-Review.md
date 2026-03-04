# Code Audit — Sprint 26: Feature Completion
**Agent 7 — Code Reviewer**
**Date:** 2026-03-04
**Branch:** sprint/26-feature-completion
**Parcels reviewed:** P1–P9 (Topic attachments, Journal attachments, Inline images, DB migration, Adapter updates, Topic content editor, Vault export, DataSettings, Remove FloatingChat)

---

## Executive Summary

Sprint 26 is a high-quality feature expansion. The architecture is sound, the data flow is consistent, and the removal of FloatingChat is clean. Three real issues require attention before ship: a P1 data-loss bug in the debounce flush path, a P1 content-bloat problem with base64 image storage, and a P2 missing Supabase migration. No P0 blockers found.

---

## P0 — Ship Blockers

*None.*

---

## P1 — Fix This Sprint

### P1-A: Debounce flush on unmount does NOT fire the save
**File:** `daily-flow/src/pages/TopicPage.tsx` lines 96–100
**Dimension:** ERRORS / CODE

The unmount cleanup cancels the timer but never executes the pending save. If a user types in the content editor and navigates away before the 1500 ms fires, their edit is silently dropped — no error, no toast, no retry.

**Current code:**
```tsx
// Flush pending save on unmount
useEffect(() => {
  return () => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
  };
}, []);
```

**Fix — flush the save synchronously on unmount:**
```tsx
const pendingSaveRef = useRef<{ html: string; isPage: boolean; pageId?: string; topicId?: string } | null>(null);

const handleContentChange = useCallback(
  (html: string) => {
    setEditorContent(html);
    pendingSaveRef.current = { html, isPage, pageId, topicId };
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      pendingSaveRef.current = null;
      if (isPage && pageId) {
        void updateTopicPage(pageId, { content: html });
      } else if (topicId) {
        void updateTopic(topicId, { content: html });
      }
    }, 1500);
  },
  [isPage, pageId, topicId, updateTopic, updateTopicPage],
);

useEffect(() => {
  return () => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    // Flush any pending save synchronously
    const pending = pendingSaveRef.current;
    if (pending) {
      if (pending.isPage && pending.pageId) {
        void updateTopicPage(pending.pageId, { content: pending.html });
      } else if (pending.topicId) {
        void updateTopic(pending.topicId, { content: pending.html });
      }
    }
  };
}, [updateTopic, updateTopicPage]);
```

---

### P1-B: Base64 images embedded in `content` column — unbounded storage growth
**File:** `daily-flow/src/components/journal/RichTextEditor.tsx` lines 85–88, `daily-flow/src/lib/adapters/local-schema.ts` line 216
**Dimension:** PERF / DATABASE

`Image.configure({ allowBase64: true })` encodes images directly into the HTML string that lands in the `content TEXT` column of both SQLite (desktop) and Supabase (web). A single 2MB PNG becomes ~2.7MB of base64 text stored inline in the row.

Consequences:
- Topic `fetchAll()` queries on desktop load the full base64 blobs into memory for every topic, every time (no lazy loading).
- On web, Supabase rows have a practical row-size limit; a few images can push a single topic over 1MB.
- The `htmlToPlainMarkdown` converter in `export.ts` line 98 converts `<img src="data:image/png;base64,...">` to `![](<3MB base64 string>)` — producing malformed, unsupported Obsidian markdown.

**Minimum required fix for P1 (web path):** Add a per-image size cap before insertion. Reject files over a configurable threshold (e.g., 200KB unencoded) and surface a toast:

```tsx
const insertImageFromFile = useCallback(
  (file: File) => {
    const MAX_BYTES = 200 * 1024; // 200 KB unencoded
    if (file.size > MAX_BYTES) {
      toast.error(`Image too large for inline embed (max 200 KB). Use the Attachments section instead.`);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string' && editor) {
        editor.chain().focus().setImage({ src: reader.result }).run();
      }
    };
    reader.readAsDataURL(file);
  },
  [editor],
);
```

**Longer-term (P2/P3):** Route images through the AttachmentAdapter and store a relative URL instead of base64. This is a larger architectural change best tracked separately.

---

## P2 — Fix Next Sprint

### P2-A: No Supabase migration for `content` column
**File:** `daily-flow/src/services/topics.service.ts` lines 10, 21 — `daily-flow/supabase/migrations/` (missing file)
**Dimension:** DATABASE

The desktop SQLite schema correctly adds the column via `ALTER TABLE topics ADD COLUMN content TEXT` (local-schema.ts line 216). The local adapter correctly reads and writes it. However, **no Supabase migration file exists** for the `content` column on the `topics` and `topic_pages` tables in the cloud database.

The service layer workaround — `(row as Record<string, unknown>).content as string | undefined` — confirms the column is not in the generated TypeScript types, which means it's not in the Supabase schema either. This causes content written on web to silently not persist (the insert succeeds because `as Record<string, unknown>` bypasses type checking, but the column doesn't exist on Supabase and the value is dropped).

**Required migration:**
```sql
-- supabase/migrations/20260304_add_topic_content.sql
ALTER TABLE topics ADD COLUMN IF NOT EXISTS content TEXT;
ALTER TABLE topic_pages ADD COLUMN IF NOT EXISTS content TEXT;
```

After applying, regenerate Supabase TypeScript types so the cast can be removed.

---

### P2-B: `htmlToPlainMarkdown` regex does not handle nested/multiline HTML
**File:** `daily-flow/src/lib/vault/export.ts` lines 85–104
**Dimension:** CODE / ERRORS

The regex-based HTML-to-markdown converter uses non-greedy single-line patterns (`(.*?)`) which will silently lose content when tags span multiple lines. Tiptap outputs multiline HTML for block-level content (e.g., long paragraphs, nested lists).

Example failure: a paragraph containing 200 words written across two wrapped lines will produce an empty string for that paragraph because `<p>(.*?)</p>` does not match across newlines by default in JS regex.

```ts
// Current — breaks on multiline content:
.replace(/<p>(.*?)<\/p>/gi, '$1\n\n')

// Fix — use [\s\S]*? to match across newlines:
.replace(/<p>([\s\S]*?)<\/p>/gi, '$1\n\n')
.replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, '> $1')
.replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, '# $1\n')
.replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, '## $1\n')
.replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, '### $1\n')
// ... etc for all block-level patterns
```

Note: This is a P2 (not P1) because the export is a new additive feature and silent content truncation on export is bad but not data loss in the primary app.

---

### P2-C: `DataSettings.handleExport` — `widgetSettings` and `aiSettings` silently omitted on desktop
**File:** `daily-flow/src/components/settings/DataSettings.tsx` lines 79–81
**Dimension:** CODE / ERRORS

In the adapter-based export path (desktop), `widgetSettings` and `aiSettings` are hardcoded to empty arrays. This is noted with no comment, and the user gets no indication their widget/AI configuration was not exported. Since these tables do exist in the local schema, the adapter should expose them or the export UI should clarify the limitation.

```ts
// Current — silently drops widget and AI settings on desktop export:
widgetSettings: [],
aiSettings: [],
profile: null,
```

**Fix:** Either add `widgetSettings` and `aiSettings` to the DataAdapter interface (preferred), or show a toast note: `toast.info('Widget and AI settings are not included in desktop exports')`.

---

### P2-D: `useEffect` dependency suppression — stale closure risk
**File:** `daily-flow/src/pages/TopicPage.tsx` line 78
**Dimension:** CODE

```tsx
useEffect(() => {
  setEditorContent(page?.content ?? topic?.content ?? '');
}, [topicId, pageId]); // eslint-disable-line react-hooks/exhaustive-deps
```

`page?.content` and `topic?.content` are read inside the effect but excluded from deps. If the store updates `topic.content` externally (e.g., real-time sync) while the same `topicId` is displayed, the editor will not re-sync. The lint suppression masks this.

The correct fix is to derive the content value outside the effect and include it:
```tsx
const sourceContent = page?.content ?? topic?.content ?? '';
useEffect(() => {
  setEditorContent(sourceContent);
}, [sourceContent]);
```

This does not cause a feedback loop because `setEditorContent` only sets local state, not the store.

---

## P3 — Backlog

### P3-A: Missing file-size guard on RichTextEditor drag-drop path
**File:** `daily-flow/src/components/journal/RichTextEditor.tsx` lines 112–122
**Dimension:** PERF

The drag-and-drop handler in `handleDrop` calls `insertImageRef.current(file)` without any size check. `FileDropZone` correctly enforces 10MB, but the inline image path has no equivalent limit. An 8MB JPEG dragged into the editor becomes ~11MB of base64 in the content field. If P1-B's 200KB cap is implemented, it covers this path too (since `insertImageRef.current` calls `insertImageFromFile`).

---

### P3-B: `EntityAttachments` — no `entityId` validity guard
**File:** `daily-flow/src/components/attachments/EntityAttachments.tsx` line 20
**Dimension:** ERRORS

`EntityAttachments` passes `entityId` directly to `useAttachments`, which guards against `undefined` but not against an empty string. In `TopicPage.tsx` line 356, `contentId` is derived as `pageId || topicId || ''`, meaning on a degenerate route (`/topics` without an ID), an empty string is passed to the attachment adapter.

**Fix:** Add a guard in `EntityAttachments`:
```tsx
if (!entityId) return null;
```

---

### P3-C: Toolbar buttons in RichTextEditor lack `aria-label`
**File:** `daily-flow/src/components/journal/RichTextEditor.tsx` line 333
**Dimension:** A11Y

The new image insert button uses `title="Insert image"` but not `aria-label`. For screen readers, `title` is unreliable. The pattern is inconsistent with the rest of the toolbar where `Toggle` components use `aria-pressed` semantics automatically. The image button uses `Button` variant.

```tsx
// Current:
<Button
  variant="ghost"
  size="sm"
  onClick={() => fileInputRef.current?.click()}
  className="h-8 w-8 p-0"
  title="Insert image"
>

// Fix:
<Button
  variant="ghost"
  size="sm"
  onClick={() => fileInputRef.current?.click()}
  className="h-8 w-8 p-0"
  aria-label="Insert image"
  title="Insert image"
>
```

---

### P3-D: `insertImageRef` pattern is functional but fragile
**File:** `daily-flow/src/components/journal/RichTextEditor.tsx` lines 67, 139
**Dimension:** CODE / REFACTOR

The `insertImageRef` pattern (a ref to a mutable callback, updated every render) is used to give the stable `handlePaste`/`handleDrop` closures (registered once in `useEditor`) access to the latest `insertImageFromFile` without re-registering the editor. This is a known pattern and it is correct here. However, a simpler equivalent is `useLatestRef` or just calling `insertImageFromFile` directly if `editor` is in scope.

No code change required — this is informational only. The current implementation is correct and won't cause bugs.

---

### P3-E: Supabase type cast `as Record<string, unknown>` should be temporary
**File:** `daily-flow/src/services/topics.service.ts` lines 10, 21
**Dimension:** CODE

```ts
content: (row as Record<string, unknown>).content as string | undefined,
```

This double-cast is the correct short-term workaround for a schema column that isn't in generated types yet. Once P2-A (Supabase migration) is applied and types are regenerated, these casts should be removed and replaced with the direct property access `row.content`.

Add a `// TODO: remove cast after types regenerated from migration` comment to make the intent clear.

---

## What's Clean — Notable Positives

- **Local schema migration strategy** (`local.ts` lines 104–121): The `ALTER TABLE` error-swallow pattern (`if (!stmt.toUpperCase().startsWith('ALTER')) throw e`) is correct and idiomatic for SQLite upgrade-in-place. The new `ADD COLUMN content` entries will safely apply to existing installs.

- **Debounce implementation** (`TopicPage.tsx` lines 80–93): The 1500ms debounce correctly clears existing timers on each keystroke. The cleanup effect correctly clears the pending timer. Only the missing flush on unmount (P1-A) is a gap.

- **`htmlToPlainMarkdown` structure** (`export.ts` lines 85–104): The overall order of operations (block elements before strip-all) is correct and won't garble output for single-line content. Only multiline patterns (P2-B) are affected.

- **FloatingChat removal** (`diff lines 13–268`): Clean deletion with no orphan imports found. AppLayout references were also cleaned up.

- **`DataSettings` adapter refactor** (`DataSettings.tsx` lines 46–84): The dual-path (adapter vs legacy Supabase) is well-structured and correctly guards the fallback. The `as unknown as Record<string, unknown>[]` casts are acceptable given the adapter's generic return types.

- **`EntityAttachments` generic wrapper** (`EntityAttachments.tsx`): Simple, correct, well-scoped. The `compact` prop pattern is clean.

- **`useKaivooActions` update** (`useKaivooActions.ts` lines 401, 431): Type signatures correctly widened to include `content?` for both `updateTopic` and `updateTopicPage`. Optimistic update and rollback pattern preserved.

---

## Score Card

| Dimension | Score | Notes |
|---|---|---|
| PERF | 6/10 | Base64 inline images (P1-B) are a real perf problem at scale. Adapter export is otherwise efficient (parallel Promise.all). |
| SECURITY | 9/10 | No new attack surfaces. No XSS introduced — TipTap sanitizes its own output. Supabase RLS unchanged. |
| CODE | 7/10 | Debounce flush gap (P1-A), lint suppression (P2-D), multiline regex (P2-B). Otherwise solid patterns. |
| BUNDLE | 8/10 | `@tiptap/extension-image` added at ^3.20.0, consistent with other tiptap deps. No new heavy dependencies. |
| DATABASE | 6/10 | Missing Supabase migration (P2-A) is a real gap — web users cannot persist content. SQLite path is correct. |
| CACHING | 8/10 | `invalidate('topics')` and `invalidate('topicPages')` called correctly on all content mutations. No stale cache risks identified. |
| A11Y | 7/10 | New image button missing `aria-label` (P3-C). FileDropZone has correct role/tabIndex/onKeyDown pattern. |
| ERRORS | 7/10 | Unmount save flush gap (P1-A). Empty `entityId` path (P3-B). Error handling in export and adapter paths is good. |
| SEO | 9/10 | No regressions. No new server-rendered content. |
| REFACTOR | 8/10 | FloatingChat removal is clean. DataSettings refactor keeps legacy fallback correctly. Type widening is consistent across all layers. |

**Overall Grade: B+ (77/100)**

The sprint delivers real user value and the architecture decisions are sound. Fix P1-A (data loss on unmount) and P1-B (size guard on inline images) before merging. Apply P2-A (Supabase migration) as the first action after — without it, web users lose all content they write in the new editor.
