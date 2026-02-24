# Feature Use Case Bible — Notes Page (formerly Journal)

**Version:** 0.3 (Sprint 8 — Notes Foundation)
**Status:** ACTIVE — Sprint 8 baseline
**Scope:** NOTES PAGE ONLY (`/notes`) — the dedicated writing surface
**Compiled by:** The Director + Agent 11 (Feature Integrity Guardian)
**Date:** February 24, 2026
**Purpose:** Define what the Notes page does, how it's used in real life, what "working" looks like, and what must never be lost.

---

## How This Document Relates to the Today Bible

The **Today Bible** states: "Journal Widget → Removed from Today. Journaling moves entirely to the Notes Page." The Today page has no notes widget — writing lives here. The Day Brief's AI summary can *reference* note entries, and the floating chat can create quick captures that become notes-adjacent, but the *writing* happens on this page.

---

# NOTES PAGE

## Identity

**The Notes page is your writing surface.** Not a form. Not an entry system. A canvas where you write freely — reflections, meeting notes, brain dumps, quick thoughts, long-form processing — all in one continuous flow per day.

**Core principle:** Canvas first. The notes page should feel like opening a notebook, not filling out a form. Start writing immediately. The friction between "I want to write" and "I'm writing" must be zero.

**Design paradigm (Sprint 7→8):** The page uses a **Daily Canvas** — one continuous writing surface per day, composed of timestamped sections that auto-save continuously. Each section is an independent entry with its own metadata (topic, tags, mood). The underlying data model (discrete `JournalEntry` records) is preserved; the canvas is a presentation layer.

**Sprint 8 evolution:** "Journal" renamed to "Notes" across all user-visible surfaces. The page is a general-purpose writing surface — journaling is one use case, not the only one. Users create entries explicitly (no phantom auto-creation). Each entry has its own topic, tags, and mood. Entries are collapsible. Text can be split into new entries.

---

## Page Layout (Sprint 8 — Notes Foundation)

```
┌──────────────────────────────────────────────┬─────────────────────┐
│  📖 Notes                                     │  ◄ February 2026 ►  │
│  Monday, February 24, 2026         Saved ✓    │  Su Mo Tu We Th Fr Sa│
│                                               │     •  •     •  •   │
│  ┌──────────────────────────────────────────┐ │        ● ← selected │
│  │ [↩][↪] [H1][H2] [B][I][S] [🎨] [•][1.]│ │                      │
│  │ [❝]                     [+ New Entry]   │ │  Today's Sections    │
│  │─────────────────────────────────────────│ │  ┌──────────────────┐│
│  │                                         │ │  │ 8:15 AM     ●   ││
│  │ ▼ 8:15 AM ──── Work ── #planning 😊    │ │  │ 10:30 AM         ││
│  │  Woke up feeling good. Had a dream      │ │  │ 2:45 PM          ││
│  │  about the product launch...            │ │  └──────────────────┘│
│  │                                         │ │                      │
│  │ ► 10:30 AM ── Meetings ── #q2 😐       │ │  ┌──────────────────┐│
│  │  (collapsed — 1 topic, 1 tag, mood)     │ │  │ Details      [▾] ││
│  │                                         │ │  │ (active entry)   ││
│  │ ▼ 2:45 PM ──── ·topic ── + 🙂          │ │  │ Topic: Work      ││
│  │  Yoga was amazing. I feel calm and      │ │  │ Tags: #planning  ││
│  │  centered. The breathing exercises...   │ │  │ Mood: 😊          ││
│  │  [━━ Split to New Entry ━━]             │ │  │ [Extract with AI]││
│  │  █ ← cursor (keep writing)             │ │  └──────────────────┘│
│  │                                         │ │                      │
│  └──────────────────────────────────────────┘ │                      │
└───────────────────────────────────────────────┴─────────────────────┘
```

**Key changes from v0.2 (Sprint 7):**
- "Journal" → "Notes" everywhere user-visible
- Route `/journal` → `/notes` (with redirect)
- Entry headers show per-entry metadata: topic pill + tag pills + mood emoji
- Entries are collapsible (chevron ▼/►)
- "New Entry" button in toolbar (explicit entry creation only)
- "Split to New Entry" bar appears when text is selected
- Sidebar Details panel shows active entry's metadata (not day-level)
- No phantom auto-creation on page load (30-min gap logic removed)

---

## The Real Use Case (Updated for Sprint 8)

### Use Case 1: Morning Brain Dump
You wake up, open Kaivoo, navigate to Notes. The canvas is blank — just a date header and an empty editor with a blinking cursor. You start writing. An entry is auto-created on first keystroke. It auto-saves continuously. You close the tab. Done.

### Use Case 2: Midday Meeting Notes
It's 2 PM. You click "New Entry" in the toolbar. A new timestamped section appears. You dump meeting notes. Then you click the topic pill on the entry header and assign it to "Meetings/Q2 Roadmap". You add tags `#pricing` and `#action-items`. Later, hit "Extract with AI" in the sidebar to surface tasks.

### Use Case 3: Splitting a Multi-Topic Entry
You wrote a long brain dump mixing work stress, exercise plans, and a great conversation. You select the exercise section, click "Split to New Entry" → the text moves to its own entry. You assign it the "Health/Exercise" topic. Now each entry is independently organized.

### Use Case 4: Reviewing a Collapsed Day
You're reviewing Wednesday. Multiple entries exist. You collapse the meeting notes (click chevron) — it shows a summary line: "10:30 AM — Meetings — #q2 — 😐". You expand only the entries you want to re-read.

### Use Case 5: Quick Note (30 seconds)
It's 9 PM. You open Notes, write one line. It auto-saves. Done. 15 seconds.

### Use Case 6: Per-Entry Organization
Monday has 5 entries. Each has a different topic: Journal, Work/Planning, Meetings, Health, Personal. You can see at a glance what each entry is about from the topic pills in the entry headers.

---

## What Currently Works (Sprint 8 State)

### Editor
- **TipTap rich text editor** (via @tiptap/react)
- Toolbar with: Undo/Redo, H1/H2, Bold/Italic/Strikethrough, Text color picker (9 colors), Highlight color picker (7 colors), Bullet list, Ordered list, Blockquote
- **"New Entry" button** on right side of toolbar (explicit entry creation)
- Placeholder text: "Start writing..."
- Prose styling with dark mode support
- Minimum height: 400px — generous writing space
- Content synced as HTML

### Entry Headers (Sprint 8)
- **EntryHeader ReactNodeView** — rich header replacing simple timestamp dividers
- Each entry shows: collapse chevron → timestamp → topic pill → tag pills (max 3 + overflow) → mood emoji
- **Topic pill**: click opens Popover with topic/page picker — single-select, replaces previous
- **Tag pills**: click X to remove, "+" button opens inline input
- **Mood emoji**: click opens Popover with 5-point mood selector
- All metadata changes saved directly to individual JournalEntry records
- Backward-compatible with existing stored HTML (same `data-timestamp-divider` selector)

### Entry Creation (Sprint 8 — Fixed)
- **Entries created ONLY by user action:**
  1. First keystroke on empty canvas (creates first entry for the day)
  2. "New Entry" button in toolbar
  3. "Split to New Entry" from selected text
- **No phantom entries**: opening the page, switching tabs, or waiting 30+ minutes does NOT create empty entries
- Replaces Sprint 7's auto-creation-on-gap behavior

### Collapsible Entries (Sprint 8)
- Chevron on each entry header toggles collapse/expand
- Collapsed view: one-line summary with timestamp + topic + tag count + mood emoji
- Hidden content marked with `contenteditable="false"` and `aria-hidden` to prevent cursor entry
- Collapsing does NOT affect auto-save (content preserved in ProseMirror document)
- Multiple entries independently collapsible

### Split to New Entry (Sprint 8)
- Select text within an entry → "Split to New Entry" bar appears below toolbar
- Click → selected text is CUT from current entry and MOVED to a new entry section
- New entry appears after the source entry with its own header
- Split button hidden when selection spans across entry headers
- Disabled while another entry creation is pending

### Continuous Auto-Save
- Writing auto-saves to Supabase continuously (debounced 3 seconds)
- Per-section dirty tracking — only changed sections are saved
- Status indicator: "Saving..." → "Saved" → "Unsaved changes" (on error)
- Toast notification on save failure
- localStorage draft as offline fallback
- No explicit save action needed

### Sidebar Details Panel (Sprint 8 — Per-Entry Mode)
- Shows metadata for the **active entry** (where cursor is positioned)
- Active entry detected by walking ProseMirror document from cursor position
- When no entry is active: shows "Click in an entry to see its details" placeholder
- Contains: Topic picker, Tag input (inline autocomplete), Mood selector, AI Extract button
- **AI Extract remains day-level scope** — sends all entries for the date to Edge Function

### AI Extraction
- "Extract with AI" button in sidebar Details panel (always visible)
- Sends content to `ai-journal-extract` Supabase Edge Function
- Sends context: existing topics, tags, open tasks
- Returns suggestions: tasks, captures, subtasks (with topics, tags, due dates)
- Each suggestion has Approve button → creates the item
- Approved items show green checkmark
- Loading state during extraction

### Calendar Sidebar
- Mini calendar with month navigation (prev/next)
- Days with entries marked with dots
- Selected date highlighted, today outlined
- Clicking a date loads that day's canvas
- Section anchors: clickable timestamp list (scroll to section)
- Active section highlighted based on cursor position

### Routing (Sprint 8)
- Route: `/notes` (primary)
- Redirect: `/journal` → `/notes` (for bookmarks)
- Nav sidebar: "Notes" label with BookOpen icon

---

## Data Model (Unchanged)

```
JournalEntry: {
  id, date (YYYY-MM-DD), content (HTML string), tags[],
  topicIds[], moodScore? (1-5), createdAt, updatedAt, timestamp
}
```

**Per-entry metadata model (Sprint 8):**
- ONE topic per entry (enforced at app level; DB `topicIds` array preserved for flexibility)
- MANY tags per entry
- ONE mood per entry (1-5 scale)
- Topic, tags, and mood save independently to each entry's DB record

**Internal code names unchanged:** All TypeScript types, Zustand store keys, file names, DB table (`journal_entries`), and Edge Function (`ai-journal-extract`) retain "journal" naming. Only user-visible text uses "Notes".

---

## Must-Never-Lose Checklist: Notes Page

### Editor
- [ ] TipTap rich text editor with full toolbar
- [ ] Toolbar: Undo/Redo, H1/H2, Bold/Italic/Strikethrough
- [ ] Toolbar: Text color picker (9 colors), Highlight color picker (7 colors)
- [ ] Toolbar: Bullet list, Ordered list, Blockquote
- [ ] Toolbar: "New Entry" button (right side)
- [ ] Placeholder text visible on empty canvas
- [ ] Minimum 400px editor height (expands with content)
- [ ] Dark mode prose support

### Entry Headers (Sprint 8+)
- [ ] EntryHeader ReactNodeView with collapse chevron
- [ ] Per-entry topic pill (clickable, single-select)
- [ ] Per-entry tag pills (clickable remove, add button)
- [ ] Per-entry mood emoji (clickable selector)
- [ ] Metadata saves to individual JournalEntry records
- [ ] Backward compatible with existing stored HTML

### Entry Creation (Sprint 8+)
- [ ] No phantom entries on page load / tab switch / time gap
- [ ] First keystroke on empty canvas creates entry
- [ ] "New Entry" button creates timestamped section
- [ ] "Split to New Entry" moves selected text to new entry
- [ ] Split hidden when selection crosses entry boundaries

### Collapsible Entries (Sprint 8+)
- [ ] Chevron toggles collapse/expand
- [ ] Collapsed summary: timestamp + topic + tags + mood
- [ ] Cursor blocked from entering collapsed content
- [ ] Auto-save unaffected by collapse state

### Canvas & Auto-Save
- [ ] All entries for a date render as one continuous document
- [ ] Timestamp dividers (entry headers) between sections
- [ ] Continuous auto-save to Supabase (debounced 3s)
- [ ] Per-section dirty tracking
- [ ] Toast notification on save failure
- [ ] localStorage draft as offline fallback
- [ ] Status indicator: "Saved" / "Saving..." / "Unsaved changes"
- [ ] Opening /notes shows today's canvas (or blank editor)

### Per-Entry Metadata (Sprint 8+)
- [ ] Topic: one per entry, TopicPagePicker popover
- [ ] Tags: many per entry, inline autocomplete input
- [ ] Mood: 1-5 emoji scale, toggle on/off
- [ ] Metadata persists across page reloads (Supabase)
- [ ] Mood clear (toggle off) properly nullifies in DB

### AI Extraction
- [ ] "Extract with AI" button (day-level scope)
- [ ] Sends content to Edge Function with context
- [ ] Results: approvable task/capture/subtask suggestions
- [ ] Approve creates item, shows "Created" state
- [ ] Loading spinner during extraction

### Calendar Sidebar
- [ ] Mini calendar with month navigation
- [ ] Dots on days with entries, selected date highlighted
- [ ] Section anchors (clickable timestamps, scroll to section)
- [ ] Active section highlighted

### Sidebar Details Panel (Sprint 8+)
- [ ] Shows active entry's metadata (not day-level aggregate)
- [ ] Active entry detected from cursor position
- [ ] "Click in an entry" placeholder when no entry active
- [ ] Topic, Tags, Mood editors for active entry
- [ ] AI Extract button (always visible, day-level scope)

### Routing (Sprint 8+)
- [ ] Route: `/notes`
- [ ] Redirect: `/journal` → `/notes`
- [ ] All user-visible text says "Notes" (not "Journal")
- [ ] Internal code names and DB table unchanged

### Cross-Page Consistency
- [ ] Note entries appear in Calendar Review mode
- [ ] Mood score reflects in Day Brief mood display (Today page)
- [ ] Topics linked in entries appear on Topics page
- [ ] Tags used in entries appear in global tag system
- [ ] Widgets (Today, Day View) show "Notes" labels

---

## What's Still Missing After Sprint 8

### Missing: Full-Text Search Across Entries (Sprint 9)
No way to search content of past note entries.

### Missing: AI "Organize My Day" (Sprint 9)
AI reads today's canvas and organizes: detects topics, suggests tags/tasks per section, inline annotations + sidebar summary.

### Missing: AI Section Labels in Sidebar (Sprint 9)
Sidebar shows timestamp-only anchors. Future: AI-detected semantic labels.

### Missing: Entry Templates (Sprint 9)
No way to start with a template (Morning Pages, Meeting Notes, Weekly Review).

### Missing: Word Count / Writing Stats (Sprint 9+)
No word count, reading time, or writing streaks.

### Missing: Keyboard Shortcuts (Sprint 9+)
No keyboard shortcuts for common actions.

### Missing: Topic-Based Privacy (Phase 4+)
Per-topic AI read/write permissions (e.g., "Journal" topic with AI restrictions).

### Missing: Internal Code Rename (Tech Debt)
JournalEntry → NoteEntry, journal file names → notes file names. Deferred to keep Sprint 8 scope manageable.

---

*Feature Use Case Bible — Notes Page — v0.3*
*Updated by The Director + Agent 11 (Feature Integrity Guardian)*
*February 24, 2026*
*Changes: Journal → Notes rename, per-entry metadata, collapsible entries, split to new entry, explicit entry creation, sidebar per-entry mode*
