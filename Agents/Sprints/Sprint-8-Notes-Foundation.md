# Sprint 8: Notes Foundation — Sprint Contract

**Status:** PENDING APPROVAL
**Theme:** Notes Foundation — Transform Journal into Notes with user-controlled entry creation, per-entry metadata, collapsible entries, and content splitting
**Branch:** `sprint/8-notes-foundation`
**Director:** Active
**Date:** February 24, 2026
**Vision Position:** Phase 1 — Cloud Command Center (~95% complete)

---

## Context

Sprint 7 shipped the Journal Canvas — a continuous writing surface replacing the old form-based entry system. User feedback after living with it reveals three foundational issues:

1. **Phantom entries:** The 30-minute gap auto-creation fires on every page load/device switch, creating empty entries the user didn't request
2. **No per-entry organization:** Topics, tags, and mood apply to the whole day, not individual entries — users can't categorize different thoughts within the same day
3. **Conceptual mismatch:** "Journal" is too narrow — the page is really a general-purpose notes surface where "Journal" should be one topic among many

These must be fixed before intelligence features (search, AI organize) can be layered on in Sprint 9.

**Source documents:**
- User feedback session (Feb 24, 2026) — 6 items identified
- `Quality/Agent-11-Docs/Feature-Bible-Journal-Page.md` v0.2
- `Quality/Agent-11-Docs/Feature-Bible-Settings.md` (GAP_THRESHOLD noted as hardcoded)
- `Engineering/Agent-7-Docs/Code-Audit-Sprint-0-Review.md` (active P0/P1 journal concerns)
- `Design/Agent-Design-Docs/Interaction-Patterns.md` (Pattern 6: Inline Editor)
- `Engineering/Agent-3-Docs/Journal-System-Design.md` (future file-based architecture)
- Sprint 7 implementation analysis (JournalCanvas.tsx, JournalDetailsPanel.tsx, journal.service.ts)

---

## User Decisions (Confirmed — Feb 24, 2026)

- **Rename:** Journal → Notes (page, route, nav, all user-visible text)
- **Entry creation:** ONLY on explicit user action (first keystroke on empty day, "New Entry" button, or "Split to New Entry")
- **Per-entry model:** ONE topic + MANY tags + ONE mood per entry (enforced at app level; DB array stays for flexibility)
- **Split behavior:** Highlight text → "Split to New Entry" → text MOVES to new entry (cut, not copy)
- **Collapsible entries:** Chevron on each entry header to collapse/expand
- **Future vision:** Topic-based privacy settings (e.g., "Journal" topic with AI read restrictions) — noted for Phase 4+, NOT Sprint 8 scope

---

## Agent Assignments

| Agent | Role | Parcels |
|---|---|---|
| **Design Agent** | EntryHeader pill layout, split interaction, collapsible entry design | Pre-work (embedded in parcel specs) |
| **Agent 2** (Staff Software Engineer) | Implementation | P1–P7 |
| **Agent 7** (Code Reviewer) | Code review gate | P8 |
| **Agent 11** (Feature Integrity Guardian) | Feature Bible update + integrity gate | P8 |

**Not needed:** Agent 3 (no architecture changes — data model preserved), Agent 4 (no security scope), Agent 5 (research continues independently), Agent 8 (no business model impact), Agent 9 (no DevOps changes)

---

## Parcels

### P1: Fix Entry Creation Bug
**Priority:** P0 (bug fix)

Remove the auto-create-on-page-load logic. Entries are created ONLY by user action.

**Changes:**
- In `JournalCanvas.tsx`: delete the auto-append block in the dateStr `useEffect` (lines ~302-334) that creates an empty entry when `gap >= GAP_THRESHOLD_MINUTES`
- Remove `GAP_THRESHOLD_MINUTES` constant (no longer needed)
- Keep `handleFirstWrite` — creating an entry on first keystroke into an empty canvas is correct
- Verify: opening `/journal` with existing entries does NOT create phantom entries; opening with no entries shows blank editor; first keystroke creates entry

**Files:**
- Modify: `daily-flow/src/components/journal/JournalCanvas.tsx`

---

### P2: Rename Journal → Notes
**Priority:** P1 (cosmetic)

Change all user-visible text from "Journal" to "Notes". Keep all internal code names, filenames, DB table, and Edge Function names unchanged.

**Changes:**
- Route: `/journal` → `/notes` with `<Navigate from="/journal" to="/notes" replace />` redirect for bookmarks
- Nav label: `'Journal'` → `'Notes'` in Sidebar.tsx
- Page heading: `<h1>Journal</h1>` → `<h1>Notes</h1>` in JournalPage.tsx
- Widget titles: JournalWidget.tsx `"Journal"` → `"Notes"`
- Activity labels: TodayActivityWidget.tsx `'Journal'` → `'Notes'`
- Day view: InlineJournal.tsx `"Journal"` → `"Notes"`, `"No journal entries yet"` → `"No notes yet"`
- Day review: DayReview.tsx `"Journal Entries"` → `"Notes"`
- Shutdown: DailyShutdown.tsx `"words in your journal"` → `"words in your notes"`
- Data settings: DataSettings.tsx `"journal entries"` → `"note entries"`
- localStorage draft key: check for old `journal-canvas-draft-{date}` keys on load and migrate to `notes-canvas-draft-{date}`
- DO NOT rename: file names, TypeScript types, Zustand store keys, DB table `journal_entries`, Edge Function `ai-journal-extract`

**Files:**
- Modify: `daily-flow/src/App.tsx`
- Modify: `daily-flow/src/components/layout/Sidebar.tsx`
- Modify: `daily-flow/src/pages/JournalPage.tsx`
- Modify: `daily-flow/src/components/widgets/JournalWidget.tsx`
- Modify: `daily-flow/src/components/widgets/TodayActivityWidget.tsx`
- Modify: `daily-flow/src/components/widgets/JournalTimelineWidget.tsx`
- Modify: `daily-flow/src/components/day-view/InlineJournal.tsx`
- Modify: `daily-flow/src/components/DayReview.tsx`
- Modify: `daily-flow/src/components/day-view/DailyShutdown.tsx`
- Modify: `daily-flow/src/components/settings/DataSettings.tsx`

---

### P3: "New Entry" Button
**Priority:** P0 (UX)
**Depends on:** P1

Add an explicit "New Entry" button to the canvas toolbar (right side, after a separator).

**Changes:**
- Add `Plus` icon button labeled "New Entry" on the right side of the JournalCanvas toolbar
- On click: create new `JournalEntry` via `addJournalEntry()` → compose new EntryHeader HTML → append to editor → focus cursor after new divider
- Disabled while `pendingNewEntryRef.current === true` (prevent double-creation)
- Update `sectionsRef` and `savedContentsRef` after creation
- This replaces the old auto-create-on-gap behavior removed in P1

**Files:**
- Modify: `daily-flow/src/components/journal/JournalCanvas.tsx`

---

### P4: EntryHeader Node with Per-Entry Metadata Pills
**Priority:** P0 (feature)
**Depends on:** P1, P3

Replace the simple `TimestampDivider` atom node with a rich `EntryHeader` React NodeView that shows per-entry metadata as clickable pills.

**4a: EntryHeaderNode.ts** — TipTap Node definition
- Replaces `TimestampDivider` node, uses `ReactNodeViewRenderer` for rendering
- Attributes: `entryId` (string), `timestamp` (ISO string), `collapsed` (boolean, default false)
- `parseHTML`: matches existing `div[data-timestamp-divider]` for backward compatibility with stored HTML
- `atom: true`, `selectable: false`, `draggable: false` (same as current TimestampDivider)

**4b: EntryHeader.tsx** — React NodeView component
- Reads entry metadata from Zustand store via `entryId`
- Renders: collapse chevron (left) → timestamp → topic pill (clickable) → tag pills (clickable, max 3 + overflow) → mood emoji (clickable)
- Topic pill: click opens TopicPagePicker popover — single-select, replacing previous topic
- Tag pills: click to remove, "+" button opens InlineTagInput
- Mood emoji: click opens 5-point mood selector popover
- Metadata changes call `updateJournalEntry(entryId, { topicIds: [id], tags, moodScore })` directly
- All popovers use Radix UI Popover (already in dependencies) for portal-based rendering (avoids z-index issues inside TipTap)

**4c: EntryMetadataPills.tsx** — Shared pill rendering component
- Renders: optional topic badge (with icon + name), tag badges (hash + name), mood emoji
- Clickable variant (for EntryHeader) and read-only variant (for collapsed summary)

**4d: Update JournalCanvas.tsx**
- Replace `TimestampDivider` extension with `EntryHeaderNode` extension
- Update `composeHTML` to generate EntryHeader-compatible HTML (same `data-timestamp-divider` attribute for backward compat)
- `extractSections` parser unchanged (still splits on `data-timestamp-divider`)
- Add active entry tracking: detect which entry the cursor is in by finding nearest preceding EntryHeader node

**4e: Update JournalPage.tsx**
- Add `activeEntryId` state, fed from `JournalCanvas.onActiveEntryChange` callback
- Remove day-level metadata aggregation — per-entry metadata is now handled by EntryHeader directly

**Files:**
- New: `daily-flow/src/components/journal/EntryHeaderNode.ts`
- New: `daily-flow/src/components/journal/EntryHeader.tsx`
- New: `daily-flow/src/components/journal/EntryMetadataPills.tsx`
- Modify: `daily-flow/src/components/journal/JournalCanvas.tsx`
- Modify: `daily-flow/src/pages/JournalPage.tsx`
- Deprecate: `daily-flow/src/components/journal/TimestampDivider.ts` (keep for reference, no longer imported)

---

### P5: Collapsible Entries
**Priority:** P1 (UX)
**Depends on:** P4

Add chevron toggle to collapse/expand individual entry sections.

**Changes:**
- EntryHeader (from P4) already has the `collapsed` attribute and chevron UI
- This parcel implements the content hiding behavior:
  - **Approach:** JavaScript DOM walking from EntryHeader component. When `collapsed` toggles, walk subsequent sibling DOM nodes until the next `[data-entry-header]` element and toggle `display: none` on each
  - CSS-only sibling selectors (`~`) are insufficient because they apply to ALL subsequent siblings, not just until the next matching one
- Collapsed summary line: timestamp + topic name + tag count badge + mood emoji (one-line, read-only `EntryMetadataPills`)
- Default state: all entries expanded. User collapses manually.
- Collapsing does NOT affect auto-save (content stays in DOM, just hidden from view)
- The most recent (bottom) entry should remain expanded when navigating to a date

**Files:**
- Modify: `daily-flow/src/components/journal/EntryHeader.tsx`
- Modify: `daily-flow/src/components/journal/JournalCanvas.tsx` (CSS styles)

---

### P6: "Split to New Entry" via BubbleMenu
**Priority:** P0 (feature)
**Depends on:** P3, P4

Highlight text → floating menu → "Split to New Entry" → text moves to a new entry section with its own topic.

**Changes:**

**6a: SplitToNewEntryMenu.tsx** — BubbleMenu content
- Shows when text is selected within an entry section
- Contains: Scissors icon + "Split to New Entry" button + optional quick topic picker
- Does NOT show if selection spans across multiple entry sections (crosses an EntryHeader)

**6b: Add BubbleMenu to JournalCanvas.tsx**
- Import `BubbleMenu` from `@tiptap/react` (package already installed: `@tiptap/extension-bubble-menu`)
- Render `SplitToNewEntryMenu` inside the BubbleMenu

**6c: Split logic — `splitToNewEntry(topicId?: string)` function:**
1. Get selected HTML from editor (ProseMirror selection slice)
2. Identify which entry the selection is in (nearest preceding EntryHeader's `entryId`)
3. Delete selected content from current entry (ProseMirror transaction)
4. Create new `JournalEntry` via `addJournalEntry({ content: selectedHTML, date, tags: [], topicIds: topicId ? [topicId] : [] })`
5. Insert new EntryHeader + extracted content after current section in the editor
6. Update `sectionsRef`, `savedContentsRef`
7. Save dirty sections (both source entry with content removed, and new entry)
8. Focus cursor at end of new entry

**Files:**
- New: `daily-flow/src/components/journal/SplitToNewEntryMenu.tsx`
- Modify: `daily-flow/src/components/journal/JournalCanvas.tsx`

---

### P7: Sidebar DetailsPanel → Per-Entry Mode
**Priority:** P1
**Depends on:** P4

The sidebar Details panel shows metadata for the active entry (where cursor is), not the whole day.

**Changes:**
- JournalCanvas exposes `onActiveEntryChange(entryId: string | null)` callback
- JournalPage tracks `activeEntryId` state and passes it to DetailsPanel
- JournalDetailsPanel receives a single entry's metadata (via `activeEntryId` → store lookup) instead of aggregated day-level data
- Keep AI Extract at day-level scope (sends all entries for the date to the Edge Function — AI benefits from full context)
- Sidebar section anchors show active entry highlighted (existing `activeSectionId` behavior)
- When no entry is active (e.g., cursor not in editor), sidebar shows "Select an entry" placeholder

**Files:**
- Modify: `daily-flow/src/components/journal/JournalCanvas.tsx`
- Modify: `daily-flow/src/pages/JournalPage.tsx`
- Modify: `daily-flow/src/components/journal/JournalDetailsPanel.tsx`

---

### P8: Quality Gates
**Priority:** Gate
**Depends on:** P1–P7

1. Deterministic checks: `cd daily-flow && npm run lint && npm run typecheck && npm run test && npm run build`
2. Agent 7 code audit on sprint branch
3. Agent 11 feature integrity check — update Feature Bible Journal→Notes (v0.3)
4. Fix all P0 issues from gates
5. Sandbox review: `npm run dev` on sprint branch, user reviews running app
6. Sprint retrospective added to this file
7. Merge to main + tag `post-sprint-8` + deploy to Netlify

---

## Pre-Requisite: Activate mood_score Column

Before P4 can display per-entry mood, the dormant `mood_score` column must be activated:
- Apply existing migration: `daily-flow/supabase/migrations/20260221000001_add_mood_score.sql`
- Regenerate Supabase types
- Flip `MOOD_SCORE_COLUMN_EXISTS = true` in `daily-flow/src/services/journal.service.ts`
- Remove the guard logic that suppresses mood writes

This is a 5-minute task but blocks per-entry mood display.

---

## Dependencies

```
P1 (Fix entry creation) ─────┬──→ P3 (New Entry button) ──→ P6 (Split to New Entry)
                              │
P2 (Rename → Notes)           │   (parallel, no deps)
                              │
mood_score activation ────────┼──→ P4 (EntryHeader + pills) ──→ P5 (Collapsible)
                              │                                │
                              └────────────────────────────────┴──→ P7 (Sidebar per-entry)
                                                                       │
P1–P7 ──→ P8 (Quality Gates)
```

Parallelizable: P1 + P2 + mood_score activation can run simultaneously.
Then: P3 + P4 can start once P1 is done.
Then: P5 + P6 + P7 once P3/P4 are done.
Finally: P8 gates.

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| EntryHeader ReactNodeView complexity (popovers inside TipTap) | Medium | High | Use Radix UI Popover (portal-based, already in deps) for all inline pickers |
| CSS section collapsing insufficient | High | Medium | Plan for JS DOM walking approach (not CSS-only); CSS `~` selector can't target "until next match" |
| Split-to-new-entry ProseMirror transaction corruption | Medium | High | Build as atomic ProseMirror command; test edge cases (start of section, end of section, entire section) |
| Backward compatibility with existing divider HTML | Low | High | EntryHeaderNode `parseHTML` matches same `div[data-timestamp-divider]` selector |
| Route change breaking bookmarks | Low | Low | `<Navigate>` redirect from `/journal` to `/notes` |
| mood_score migration on live DB | Low | Medium | Migration already exists and was tested; just needs to be applied |

---

## Deferred to Sprint 9+

- Full-text search across note entries
- AI "Organize My Day" (inline annotations + sidebar summary)
- AI section labels in sidebar (semantic labels replacing timestamps)
- Entry templates (Morning Pages, Meeting Notes, etc.)
- Word count / writing stats / streaks
- Topic-based privacy settings (AI read/write permissions per topic)
- Keyboard shortcuts
- Internal code rename (JournalEntry → NoteEntry, file renames) — tech debt cleanup
- Projects system (blocked on Agent 5 research)

---

## Definition of Done — Sprint Level

```
Entry Creation:
  [ ] Opening /notes with existing entries does NOT create phantom entries
  [ ] Opening on a new device does NOT create phantom entries
  [ ] "New Entry" button creates a fresh timestamped section
  [ ] First keystroke on empty day creates an entry
  [ ] "Split to New Entry" moves selected text to a new entry section

Per-Entry Metadata:
  [ ] Each entry shows topic pill, tag pills, mood emoji in its header
  [ ] Clicking topic pill opens single-select topic picker (replaces, not appends)
  [ ] Clicking tag pill allows removal; "+" adds new tags
  [ ] Clicking mood emoji opens mood selector
  [ ] Metadata saves to the correct individual JournalEntry record
  [ ] mood_score column is active and working end-to-end

Collapsible Entries:
  [ ] Chevron on each entry header toggles collapse/expand
  [ ] Collapsed shows: timestamp + topic + tag count + mood summary
  [ ] Collapsing does not affect auto-save
  [ ] Multiple entries can be independently collapsed

Rename:
  [ ] Route /notes works, /journal redirects to /notes
  [ ] All user-visible text says "Notes" not "Journal"
  [ ] Internal code names and DB table unchanged

Sidebar:
  [ ] DetailsPanel shows active entry's metadata (not day-level aggregate)
  [ ] AI Extract still works (day-level scope)
  [ ] Section anchors show active entry highlighted

Quality:
  [ ] npm run lint passes
  [ ] npm run typecheck passes (0 errors)
  [ ] npm run test passes
  [ ] npm run build succeeds
  [ ] Agent 7 code review: no unresolved P0s
  [ ] Agent 11 feature integrity: PASS
  [ ] User approves running app in sandbox review
```

---

## Verification Plan

1. **Dev server test:** `cd daily-flow && npm run dev` on sprint branch
2. **Bug fix verification:** Open /notes, verify no phantom entries created. Close tab, wait 30+ min, reopen — no new entries. Open in a second browser tab — no new entries.
3. **New Entry:** Click "New Entry" button, verify new timestamped section appears with cursor focused
4. **Per-entry metadata:** Add topic to entry 1, different topic to entry 2 — verify they save independently. Add tags, set mood on each entry.
5. **Split to New Entry:** Write a paragraph, select part of it, click "Split to New Entry" in bubble menu. Verify: text removed from original, new entry created below with the text. Assign a topic to the new entry.
6. **Collapsible:** Click chevron on first entry, verify content hides and summary line shows. Click again, verify content returns. Verify auto-save still works while collapsed.
7. **Rename:** Navigate to /journal, verify redirect to /notes. Check nav sidebar shows "Notes". Check all widget titles.
8. **Deterministic checks:** `cd daily-flow && npm run lint && npm run typecheck && npm run test && npm run build`

---

*Sprint 8 Contract — Compiled by the Director*
*February 24, 2026*
