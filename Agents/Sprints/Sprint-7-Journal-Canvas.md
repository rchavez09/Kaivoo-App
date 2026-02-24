# Sprint 7: Journal Canvas — Sprint Contract

**Status:** APPROVED
**Theme:** Journal Canvas — Transform the Journal from a form-based entry system into a continuous writing surface
**Branch:** `sprint/7-journal-canvas`
**Director:** Active
**Date:** February 23, 2026
**Vision Position:** Phase 1 — Cloud Command Center (~95% complete)

---

## Context

The Journal page works technically — TipTap editor, auto-save drafts, AI extraction, calendar sidebar — but the UX feels like filling out a web form, not writing in a notebook. The user confirmed (Q&A Feb 23) that this is the #1 reason they keep reverting to Obsidian for journaling. The discrete "write → save → clear → start over" flow creates friction that breaks the writing experience.

Sprint 7 is a paradigm shift: the Journal becomes a **Daily Canvas** — one continuous writing surface per day with timestamp sections, continuous auto-save, and zero-friction opening. Topics, tags, mood, and AI extraction are preserved but relocated out of the writing flow. The underlying data model (discrete `JournalEntry` records) stays the same; the canvas is a presentation layer.

**Source documents:**
- `Quality/Agent-11-Docs/Feature-Bible-Journal-Page.md` v0.2 (Q&A resolved, canvas design)
- `Sprints/Sprint-6-Feature-Depth.md` — Deferred items: "Journal: Continuous writing mode, inline tags, search, keyboard shortcuts"
- User Q&A session (Feb 23, 2026) — 6 questions resolved
- `Engineering/Agent-3-Docs/Journal-System-Design.md` — Phase 3 journal file format (informs future markdown export)
- `Design/Agent-Design-Docs/Use-Cases.md` — UC2 (Journal Time Travel)
- `Design/Agent-Design-Docs/Interaction-Patterns.md` — Pattern 6 (Inline Editor)
- `Design/Agent-Design-Docs/Screen-Specifications.md` — Screen 7 (Journal)
- All 42 non-archived agent docs scanned for concerns (Feb 23, 2026)

---

## User Decisions (Confirmed — Feb 23, 2026)

- **Canvas model:** YES — one continuous writing surface per day
- **Data model:** Continuous view layer over discrete `JournalEntry` records (backward-compatible)
- **Sidebar:** Calendar + section anchors (timestamp-based for Sprint 7, AI labels Sprint 8)
- **AI organize:** Inline annotations + sidebar summary panel (Sprint 8 — intelligence layer)
- **Sprint 7 scope:** Canvas Core Only — ship the paradigm shift, intelligence comes next
- **Metadata location:** Relocated to collapsible sidebar Details panel (not removed)
- **Captures in sidebar:** Removed (journal-only focus)
- **Tag input:** Inline autocomplete replaces prompt()
- **Privacy:** AI opt-in per action (user-triggered, never passive)

---

## Agent Assignments

| Agent | Role | Parcels |
|---|---|---|
| **Design Agent** | Canvas layout spec, sidebar redesign, metadata relocation | P0 (pre-work, embedded in Bible v0.2) |
| **Agent 2** (Staff Software Engineer) | Implementation | P1–P7 |
| **Agent 5** (Research Analyst) | Parallel research: Projects + Entity Graph patterns | R1–R2 (non-blocking) |
| **Agent 11** (Feature Integrity Guardian) | Feature Bible update + integrity gate | P0, P8 |
| **Agent 7** (Code Reviewer) | Code review gate | P9 |

**Not needed this sprint:** Agent 3 (no architecture changes — data model preserved), Agent 4 (no security scope), Agent 8 (no business model impact), Agent 9 (no DevOps changes), Agent 10 (test strategy stable — Agent 2 writes tests with implementation)

---

## Pre-Work (Completed Before Coding)

### P0: Update Journal Feature Bible
**Owner:** Director + Agent 11
**Status:** DONE

- Recorded user Q&A answers (Q1–Q6) in Feature Bible v0.2
- Updated page layout wireframe for canvas model
- Updated use cases for canvas paradigm
- Updated interaction spec for canvas model
- Updated Must-Never-Lose checklist to reflect relocated metadata
- Captures removed from sidebar spec

---

## Parcels

### Track A: Canvas Core (P0 — The Paradigm Shift)

#### P1: Continuous Canvas View
**Owner:** Agent 2
**Priority:** P0

Render all of a day's entries as one seamless TipTap document with lightweight timestamp dividers.

**Changes:**
- Create a new `JournalCanvas` component that:
  - Fetches all `JournalEntry` records for the selected date
  - Composes them into a single HTML string with timestamp dividers between sections
  - Renders them in one TipTap editor instance
  - Tracks which section the cursor is in (maps edits back to the correct `JournalEntry` record)
- Timestamp dividers: `<hr data-timestamp="2026-02-23T14:30:00" />` with styled display `── 2:30 PM ──`
- Clicking a past date in the calendar renders that day's canvas the same way
- Editing any section auto-saves to the correct underlying `JournalEntry`

**Files:**
- New: `daily-flow/src/components/journal/JournalCanvas.tsx` — continuous canvas component
- Modified: `daily-flow/src/pages/JournalPage.tsx` — replace current editor area with JournalCanvas
- Modified: `daily-flow/src/components/journal/RichTextEditor.tsx` — may need extension for timestamp dividers

**Definition of Done:**
- All entries for a date render as one continuous document
- Timestamp dividers visually separate sections
- Edits in any section save to the correct JournalEntry record
- Past dates render the same continuous view

---

#### P2: Auto-Append on Return
**Owner:** Agent 2
**Priority:** P0

When the user opens Journal and today already has content, the canvas shows everything with a cursor at the bottom. A new timestamp divider is auto-inserted when writing resumes after a gap.

**Changes:**
- On page load: if entries exist for today, render canvas with cursor at end
- If no entries: show blank TipTap editor with placeholder
- When user starts typing after a 30+ minute gap since the last entry's `timestamp`:
  - Auto-insert a new timestamp divider
  - Create a new `JournalEntry` record behind the scenes
- The 30-minute threshold prevents constant new sections during an active writing session

**Files:**
- `daily-flow/src/components/journal/JournalCanvas.tsx` — gap detection, auto-append logic
- `daily-flow/src/hooks/useKaivooActions.ts` — new entry creation from canvas

**Definition of Done:**
- Opening journal with existing entries shows canvas with cursor at bottom
- Writing after a gap auto-creates a new timestamped section
- Writing within an active session doesn't create unnecessary sections
- Opening journal with no entries shows blank editor

---

#### P3: Continuous Auto-Save
**Owner:** Agent 2
**Priority:** P0

Replace the "Save Entry" / "Update Entry" button paradigm with continuous debounced auto-save.

**Changes:**
- Debounced save to Supabase (3 seconds after last keystroke)
- Per-section save: track dirty state per `JournalEntry` record, only save changed sections
- Status indicator in header: "Saving..." → "Saved ✓" → "Offline (draft saved)"
- localStorage draft stays as offline fallback (saves entire canvas state)
- Remove "Save Entry" and "Update Entry" buttons from the main editor area
- Toast notifications removed for saves (too noisy with continuous save — status indicator is sufficient)

**Files:**
- `daily-flow/src/components/journal/JournalCanvas.tsx` — debounced save logic
- `daily-flow/src/pages/JournalPage.tsx` — status indicator, remove save buttons
- `daily-flow/src/services/journal.service.ts` — may need batch update support

**Definition of Done:**
- Edits auto-save to Supabase after 3-second debounce
- Status indicator shows save state accurately
- No "Save Entry" / "Update Entry" buttons in the editor area
- Offline: drafts save to localStorage, indicator shows "Offline"
- No data loss on rapid edits, tab close, or navigation

---

#### P4: Zero-Friction Opening
**Owner:** Agent 2
**Priority:** P0

Navigate to `/journal` and start writing immediately.

**Changes:**
- On page load: date header + editor. Nothing else above the canvas.
- If today has entries → show continuous canvas with cursor at end
- If today has no entries → show blank editor with placeholder "Start writing..."
- Remove topic/tag bar from above the editor
- Remove mood selector from below the editor
- Remove action bar (Save/Extract buttons) from below the editor
- All relocated metadata goes to sidebar Details panel (see P5)

**Files:**
- `daily-flow/src/pages/JournalPage.tsx` — simplify layout, remove form elements from editor area

**Definition of Done:**
- Journal page opens with just: date header → toolbar → canvas
- No topics, tags, mood, or buttons between the header and the writing surface
- Page load to cursor-ready in < 500ms (perceived)

---

### Track B: Metadata & UX (P0 — Remove Form Feel)

#### P5: Relocate Topics, Tags, Mood, AI Extract to Sidebar
**Owner:** Agent 2
**Priority:** P0

Move all metadata controls out of the main writing flow and into the sidebar.

**Changes:**
- Add a collapsible "Details" panel in the sidebar below the section anchors
- Panel contains:
  - **Topics:** [Add Topic] button + TopicPagePicker + badge list with remove
  - **Tags:** Inline autocomplete input (replaces `prompt()`) + badge list with remove
  - **Mood:** 5-point emoji scale (same UX, just relocated)
  - **[Extract with AI]** button
  - AI extraction results (when available)
- Details panel applies to the entire day's canvas (not per-section)
- Metadata saves to the most recent `JournalEntry` record (or a designated "day metadata" record)
- Inline tag autocomplete: type `#` or just start typing → dropdown with existing tags, type to filter, Enter to add, create new by typing new name

**Files:**
- New: `daily-flow/src/components/journal/JournalDetailsPanel.tsx` — collapsible metadata panel
- New: `daily-flow/src/components/journal/InlineTagInput.tsx` — autocomplete tag input
- Modified: `daily-flow/src/pages/JournalPage.tsx` — remove metadata from editor area
- Modified: `daily-flow/src/components/journal/JournalCalendarSidebar.tsx` — add Details panel

**Definition of Done:**
- Topics, tags, mood, and AI extract all accessible in sidebar Details panel
- Inline tag input with autocomplete works (no more prompt())
- Mood selector works in sidebar
- AI extraction works from sidebar
- All metadata saves correctly to Supabase
- Details panel is collapsible (doesn't clutter sidebar when not needed)

---

### Track C: Sidebar Redesign (P1)

#### P6: Section Anchors
**Owner:** Agent 2
**Priority:** P1

Replace the discrete entry list in the sidebar with section anchors.

**Changes:**
- "Today's Sections" header in sidebar below calendar
- List of timestamp anchors derived from timestamp dividers in the canvas
- Each anchor shows the timestamp (e.g., "8:15 AM", "10:30 AM")
- Click anchor → scrolls canvas to that section
- Active section highlighted based on cursor position in canvas (scroll-spy behavior)
- For past dates: same behavior (sections from that day's canvas)
- Remove: discrete entry list with content previews
- Remove: captures from sidebar
- Remove: "New entry for [date]" button (auto-append handles new sections)

**Files:**
- Modified: `daily-flow/src/components/journal/JournalCalendarSidebar.tsx` — replace entry list with section anchors
- `daily-flow/src/components/journal/JournalCanvas.tsx` — expose section positions for scroll-spy

**Definition of Done:**
- Sidebar shows "Today's Sections" with timestamp anchors
- Clicking anchor scrolls canvas to that section
- Active section highlighted as cursor moves
- No more discrete entry list or captures in sidebar
- Past dates show their sections correctly

---

### Track D: Tech Debt Piggyback (P2)

#### P7: Journal-Adjacent Cleanup
**Owner:** Agent 2
**Priority:** P2

Fold in small tech debt items from Agent 7's Sprint 6 deferred P1s that naturally fit the journal rebuild.

**Changes:**
- Date format standardization in journal-related components (consistent `format()` usage from date-fns)
- aria-labels for all journal page interactive elements (editor, sidebar calendar, mood selector, section anchors, Details panel)
- Ensure WCAG AA compliance per Design Agent accessibility checklist

**Files:**
- Various journal components touched in P1–P6

**Definition of Done:**
- Consistent date formatting across journal components
- All interactive elements have aria-labels
- Keyboard navigation works for sidebar elements
- No accessibility regressions

---

### Track E: Quality Gates (P0)

#### P8: Agent 11 Feature Integrity Check
**Owner:** Agent 11
**Priority:** Gate

Run the updated Must-Never-Lose checklist from Feature Bible v0.2 against the canvas implementation.

**Focus areas:**
- Canvas rendering (all entries visible, timestamp dividers present)
- Auto-save (no data loss, correct entry mapping)
- Metadata (topics/tags/mood still save correctly from sidebar)
- AI extraction (still works from sidebar)
- Calendar sidebar (date navigation, section anchors)
- Cross-page consistency (Calendar Review, Today mood, Topics page, global tags)

**Definition of Done:**
- All Must-Never-Lose items pass
- No regressions from Sprint 6 state
- Any new items from canvas model added to checklist

---

#### P9: Agent 7 Code Audit
**Owner:** Agent 7
**Priority:** Gate

Full code audit of Sprint 7 changes.

**Focus areas:**
- TipTap multi-entry rendering: performance with 10+ sections per day
- Auto-save debounce: no race conditions, no duplicate saves
- Section-to-entry mapping: edits save to correct `JournalEntry` record
- Data integrity: no data loss on rapid edits, tab close, navigation away
- Inline tag input: no XSS from user-typed tag names
- Component decomposition: JournalCanvas not becoming a monolith
- Type safety: no `any` types in new code
- Accessibility: aria-labels, keyboard navigation
- Bundle impact: new components properly code-split

**Definition of Done:**
- No unresolved P0 issues
- All P1 issues documented (can defer to Sprint 8 if non-blocking)

---

### Track F: Parallel Research (Non-Blocking)

#### R1: Agent 5 — Project Management Patterns Brief
**Owner:** Agent 5
**Priority:** Research (non-blocking)

Research how Linear, Asana, Notion, Monday, Sunsama handle projects for solo/small-team users. Deliverable feeds Sprint 8+ Projects system design.

**Source:** `Research/Agent-5-Docs/Research-Brief-Request-Project-Management-Patterns.md`

---

#### R2: Agent 5 — Entity Graph Patterns Brief
**Owner:** Agent 5
**Priority:** Research (non-blocking)

Research how Obsidian, Notion, Roam, Tana, Capacities handle entity connections. Deliverable feeds Sprint 8+ Connected Context architecture.

**Source:** `Research/Agent-5-Docs/Research-Brief-Request-Entity-Graph-Patterns.md`

---

## Dependencies

```
Pre-work:
  P0 (Bible update) ──→ All implementation parcels       ✅ DONE

Code tracks (parallelizable):
  Track A: P1 (Canvas) → P2 (Auto-append) → P3 (Auto-save) → P4 (Zero-friction)
  Track B: P5 (Metadata relocation) — parallel with Track A, starts after P1
  Track C: P6 (Section anchors) — parallel with Track B, depends on P1
  Track D: P7 (Tech debt) — parallel, woven into P1–P6 work

Gates (sequential after all code):
  P1–P7 ──→ Deterministic checks (lint, typecheck, test, build)
         ──→ P8 (Agent 11 integrity) + P9 (Agent 7 code audit)
         ──→ Fix all P0 issues
         ──→ SANDBOX REVIEW: User reviews running app
         ──→ Sprint retrospective
         ──→ Merge to main + tag + deploy

Research (fully parallel, non-blocking):
  R1, R2 run independently throughout sprint
```

---

## Definition of Done — Sprint Level

```
Canvas Experience:
  □ Opening /journal shows today's canvas immediately (or blank editor)
  □ Multiple entries render as one continuous document with timestamp dividers
  □ Writing auto-saves continuously (no "Save" button paradigm)
  □ Returning after a gap auto-appends a new timestamped section
  □ Past dates render the same continuous canvas view
  □ Editing any section saves to the correct JournalEntry record

Metadata:
  □ Topics, tags, mood, AI extract accessible in sidebar Details panel
  □ Tag input uses inline autocomplete (no prompt())
  □ All metadata still saves correctly to Supabase
  □ Details panel is collapsible

Sidebar:
  □ Calendar with dots preserved
  □ Section anchors replace discrete entry list
  □ Clicking section anchor scrolls canvas to that section
  □ Active section highlighted (scroll-spy)
  □ Captures removed from sidebar

Quality:
  □ npm run lint passes
  □ npm run typecheck passes (0 errors)
  □ npm run test passes
  □ npm run build succeeds
  □ Agent 11 Must-Never-Lose checklist: PASS
  □ Agent 7 code review: no unresolved P0s
  □ aria-labels on all journal interactive elements
  □ Consistent date formatting
  □ User approves running app in sandbox

Housekeeping:
  □ Feature Bible Journal Page at v0.2 (DONE — pre-work)
  □ Feature Bible Index updated
  □ Vision.md updated (Core feature enhancement → IN PROGRESS)
  □ Sprint retrospective added to this file
  □ Next-Sprint-Planning.md reset for Sprint 8
```

---

## Deferred to Sprint 8+

- Full-text search across journal entries
- AI "Organize My Day" (inline annotations + sidebar summary panel)
- AI section labels in sidebar (replacing timestamps with semantic labels)
- Entry templates (Morning Pages, Meeting Notes, Weekly Review)
- Word count / writing stats / streaks
- Keyboard shortcuts (beyond TipTap defaults)
- Markdown export (Phase 3)
- Journal ↔ Daily Digest connection (Phase 4+)
- Tasks Page: Kanban improvements (empty column drops, search)
- Tasks Page: "Ongoing" task label
- Task templates, archive vs delete
- Analytics & Insights rebuild
- Notifications & reminders
- PWA support
- Agent 7 P1: recurrence badge DRY extraction
- Agent 7 P3 debt (CODE-06/07/08)
- SEC-06 (CSP headers)

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| TipTap performance with many entries in one editor | Medium | High | Test with 10+ entries/day. Fallback: lazy rendering for old sections |
| Auto-save race conditions (rapid edits across sections) | Medium | High | Per-section dirty tracking, queued saves, optimistic UI |
| Section-to-entry mapping accuracy | Medium | High | Robust cursor position tracking, unit tests for mapping logic |
| Canvas feels different on past dates vs today | Low | Medium | Same rendering for all dates. Past dates fully editable. |
| Metadata relocation confuses existing users | Low | Low | Collapsible Details panel is discoverable. No features removed. |

---

*Sprint 7 Contract — Compiled by the Director*
*February 23, 2026*
