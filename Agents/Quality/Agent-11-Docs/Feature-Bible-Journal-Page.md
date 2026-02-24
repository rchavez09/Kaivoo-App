# Feature Use Case Bible — Journal Page

**Version:** 0.2 (Q&A Resolved, Canvas Design Direction)
**Status:** ACTIVE — Sprint 7 baseline
**Scope:** JOURNAL PAGE ONLY (`/journal`) — the dedicated writing surface
**Compiled by:** The Director + Agent 11 (Feature Integrity Guardian)
**Date:** February 23, 2026
**Purpose:** Define what the Journal page does, how it's used in real life, what "working" looks like, and what must never be lost.

---

## How This Document Relates to the Today Bible

The **Today Bible** states: "Journal Widget → Removed from Today. Journaling moves entirely to the Journal Page." The Today page has no journal widget — journaling lives here. The Day Brief's AI summary can *reference* journal entries, and the floating chat can create quick captures that become journal-adjacent, but the *writing* happens on this page.

---

# JOURNAL PAGE

## Identity

**The Journal page is your writing surface.** Not a form. Not an entry system. A canvas where you write freely — reflections, meeting notes, brain dumps, quick thoughts, long-form processing — all in one continuous flow per day.

**Core principle:** Canvas first. The journal should feel like opening a notebook, not filling out a form. Start writing immediately. No topics, tags, or mood selectors blocking the path to words. The friction between "I want to write" and "I'm writing" must be zero.

**Design paradigm (Sprint 7):** The journal shifts from a form-based discrete entry model to a **Daily Canvas** — one continuous writing surface per day, composed of timestamped sections that auto-save continuously. The underlying data model (discrete `JournalEntry` records) is preserved; the canvas is a presentation layer.

---

## Page Layout (Sprint 7 — Canvas Model)

The Journal page has a two-panel layout: a continuous canvas on the left, and a calendar + section anchors sidebar on the right.

```
┌──────────────────────────────────────────────┬─────────────────────┐
│  📖 Journal                                   │  ◄ February 2026 ►  │
│  Sunday, February 23, 2026         Saved ✓    │  Su Mo Tu We Th Fr Sa│
│                                               │     •  •     •  •   │
│  ┌──────────────────────────────────────────┐ │        ● ← selected │
│  │ [B][I][S][H1][H2][🎨][📝][•][1.][❝]   │ │                      │
│  │─────────────────────────────────────────│ │  Today's Sections    │
│  │                                         │ │  ┌──────────────────┐│
│  │  ── 8:15 AM ──────────────────────────  │ │  │ 8:15 AM          ││
│  │  Woke up feeling good. Had a dream      │ │  │ 10:30 AM         ││
│  │  about the product launch...            │ │  │ 2:45 PM          ││
│  │                                         │ │  │ 9:20 PM          ││
│  │  ── 10:30 AM ─────────────────────────  │ │  └──────────────────┘│
│  │  Meeting notes: Q2 roadmap review.      │ │                      │
│  │  Sarah's pricing model looks solid.     │ │  ┌──────────────────┐│
│  │  Key takeaways:                         │ │  │ Details      [▾] ││
│  │  • Revenue target is achievable         │ │  │ Topics: ...      ││
│  │  • Need to finalize landing page        │ │  │ Tags: ...        ││
│  │  • Need new equipment for the office    │ │  │ Mood: 🙂         ││
│  │                                         │ │  │ [Extract with AI]││
│  │  ── 2:45 PM ──────────────────────────  │ │  └──────────────────┘│
│  │  Yoga was amazing. I feel calm and      │ │                      │
│  │  centered. The breathing exercises...   │ │                      │
│  │                                         │ │                      │
│  │  ── 9:20 PM ──────────────────────────  │ │                      │
│  │  Evening wind-down. Good day overall.   │ │                      │
│  │  Wins: Got the deploy done. Had a       │ │                      │
│  │  good conversation with Sarah.          │ │                      │
│  │  █ ← cursor (keep writing)             │ │                      │
│  │                                         │ │                      │
│  └──────────────────────────────────────────┘ │                      │
└───────────────────────────────────────────────┴─────────────────────┘
```

**Key changes from v0.1:**
- Topics, tags, mood, and AI extraction moved to a collapsible "Details" section in the sidebar (not in the writing flow)
- Entry list replaced with "Today's Sections" (clickable timestamp anchors)
- No "Save Entry" / "Update Entry" buttons — continuous auto-save
- Status indicator shows "Saved ✓" / "Saving..." (not "Draft saved 3:45 PM")
- Captures removed from sidebar (journal-only focus)

---

## The Real Use Case (Updated)

### Use Case 1: Morning Brain Dump

You wake up, open Kaivoo, navigate to Journal. The canvas is blank — just a date header and an empty editor with a blinking cursor. You start writing about your day ahead — what you're thinking, what's stressing you, what you're excited about. You write for 5 minutes. It auto-saves continuously. You close the tab. Done.

### Use Case 2: Midday Meeting Notes

It's 2 PM. You just got out of a meeting. You open Journal — your morning writing is already there. A new timestamp divider (`── 2:15 PM ──`) appears automatically. You dump everything: decisions made, action items, who said what. Then you open the Details panel in the sidebar and hit "Extract with AI" — it reads today's entire canvas and surfaces tasks. You approve each one.

### Use Case 3: Multi-Topic Day

In one day you write about your relationship, work stress, needing new equipment, yoga, and evening wins. All in one continuous flow. You don't organize any of it beforehand — you just write. Later (Sprint 8+), the AI reads your day and organizes it: detects 5 topics, suggests tags, creates tasks from action items. The intelligence comes *after* the writing, not before.

### Use Case 4: Quick Note (30 seconds)

It's 9 PM. You open Journal, write one line: "Good day. Got the deploy done." It auto-saves. You close the tab. The whole interaction takes 15 seconds. The journal accepts whatever you give it.

### Use Case 5: Reviewing Past Days

You're reviewing your week on Sunday. You click back to Wednesday in the calendar sidebar. Wednesday's canvas loads — all entries from that day rendered as one continuous document with timestamp dividers. You read through it. You click into a section and add a note: "Update: this turned out better than expected." It auto-saves.

### Use Case 6: Quick Capture (Not Journaling)

You're in a meeting and need to jot something down. You open Journal because it's the fastest writing surface you have. You type a few bullet points. It saves. Later, you can extract tasks from it or just leave it as notes. The journal doesn't care whether you're "journaling" or "noting" — it's just a place to write.

---

## What Currently Works (Sprint 6 State)

### Editor
- **TipTap rich text editor** (via @tiptap/react)
- Toolbar with: Undo/Redo, H1/H2, Bold/Italic/Strikethrough, Text color picker (9 colors), Highlight color picker (7 colors), Bullet list, Ordered list, Blockquote
- Placeholder text: "Start writing your thoughts, ideas, or reflections..."
- Prose styling with dark mode support
- Minimum height: 400px — generous writing space
- Content synced as HTML

### Draft Auto-Save
- Drafts save to localStorage every 2 seconds after edits
- Draft key is date-based: `journal-draft-YYYY-MM-DD`
- On page load, restores draft (content, tags, topic paths)
- Shows "Draft saved [time]" or "Unsaved changes" indicator
- Draft cleared after successful save to Supabase

### Topic & Tag Management
- [Add Topic] button → opens TopicPagePicker dropdown
- Topics displayed as badges with folder/file icons, removable
- New topics auto-created if path doesn't exist (e.g., "Work/Planning" creates both)
- [Add Tag] button → prompt for tag name (normalized to lowercase, # stripped)
- Tags displayed as outline badges, removable

### Mood Selector
- 5-point emoji scale: Great (5), Good (4), Okay (3), Low (2), Rough (1)
- Tap to set, tap again to unset
- Active mood highlighted with ring
- Mood saved with journal entry

### Save Flow
- "Save Entry" button → creates new journal entry via Supabase
- Entry includes: content (HTML), date, tags, topicIds, moodScore
- Topic paths resolved to IDs (auto-creates missing topics)
- After save: clears editor, clears draft, resets all state
- Toast confirmation with timestamp

### Edit Flow
- Click an entry in the sidebar → loads into editor
- Header shows "Editing entry from [date]"
- "New Entry" button appears to start fresh
- "Update Entry" replaces "Save Entry" label
- Update saves changes to existing entry (doesn't create new)

### AI Extraction
- "Extract with AI" button → sends plain text to `ai-journal-extract` Supabase Edge Function
- Sends context: existing topics, tags, and open tasks
- Returns suggestions: tasks, captures, subtasks (with suggested topics, tags, due dates)
- Each suggestion has an "Approve" button → creates the item
- Approved items show "Created" state with green checkmark
- Handles: task creation with topics/tags, subtask creation on existing tasks

### Calendar Sidebar (Right Panel)
- Mini calendar with month navigation (prev/next)
- Days with entries marked with dots
- Selected date highlighted
- Clicking a date: loads entries for that date in the list below
- Entry list: sorted by time (newest first), shows time + content preview (100 chars, HTML stripped)
- Journal entries are clickable → loads into editor
- Captures also shown (non-clickable, different styling)
- "New entry for [date]" button at bottom
- Date selection resets editor to create mode

### Data Model
```
JournalEntry: {
  id, date (YYYY-MM-DD), content (HTML string), tags[],
  topicIds[], moodScore? (1-5), createdAt, updatedAt, timestamp
}
```

---

## What Sprint 7 Changes (Canvas Redesign)

### Changed: Continuous Canvas View (replaces discrete entry display)
All entries for a given date are rendered as one seamless TipTap document with lightweight timestamp dividers. The user writes in one continuous flow. New sections are auto-appended when the user returns after a gap. The underlying data model (discrete `JournalEntry` records) is preserved — the canvas is a presentation layer.

### Changed: Continuous Auto-Save (replaces "Save Entry" / "Update Entry" buttons)
Writing auto-saves to Supabase continuously (debounced 3 seconds). No explicit save action needed. Status indicator shows "Saving..." → "Saved ✓" instead of form-style buttons. localStorage draft stays as offline fallback.

### Changed: Zero-Friction Opening (replaces form-first layout)
Navigate to `/journal` → if entries exist for today, show the canvas with cursor at end. If no entries, show blank editor with TipTap placeholder. No topics, tags, mood, or action buttons above the editor. Date header is the only non-editor element above the canvas.

### Changed: Metadata Relocation (topics/tags/mood move to sidebar)
Topics, tags, mood selector, and AI extraction move out of the main editor area and into a collapsible "Details" section in the sidebar. All functionality preserved — just repositioned so they don't block the writing flow.

### Changed: Inline Tag Input (replaces prompt() dialog)
Tag creation uses inline autocomplete input instead of browser `prompt()`. Type `#` → dropdown with existing tags, type to filter, Enter to add.

### Changed: Section Anchors (replaces discrete entry list in sidebar)
Sidebar shows "Today's Sections" — clickable timestamp anchors that scroll the canvas to that section. Replaces the old entry list (which showed discrete entries as clickable cards).

### Preserved: Calendar Mini-View
Calendar stays exactly as-is: dots on days with entries, month navigation, clicking a date loads that day's canvas.

### Removed: Captures in Sidebar
Captures no longer shown in the journal sidebar. The journal page is for journal entries only.

---

## What's Still Missing After Sprint 7

### Missing: Full-Text Search Across Entries (Sprint 8)
No way to search the content of past journal entries. Planned for Sprint 8 as part of the intelligence layer.

### Missing: AI "Organize My Day" (Sprint 8)
AI reads today's canvas and organizes it: detects topics, suggests tags/tasks per section, provides inline annotations + sidebar summary panel. Planned for Sprint 8.

### Missing: AI Section Labels in Sidebar (Sprint 8)
Sprint 7 sidebar shows timestamp-only section anchors. Sprint 8 replaces these with AI-detected semantic labels (e.g., "Relationship thoughts," "Meeting notes," "Yoga reflection").

### Missing: Entry Templates (Sprint 8)
No way to start with a template (Morning Pages, Meeting Notes, Weekly Review). Planned for Sprint 8 — templates seed the canvas with a light scaffold.

### Missing: Word Count / Writing Stats (Sprint 8+)
No word count, reading time, or writing streaks. Enhancement for Sprint 8+.

### Missing: Keyboard Shortcuts (Sprint 8+)
Auto-save eliminates Cmd+S. Other shortcuts (Cmd+Shift+E for AI extract) deferred.

### Missing: Markdown Support / Export (Phase 3)
Editor uses HTML internally (TipTap). No markdown mode, no export. Phase 3 dependency (Self-Hosted Hub, journal as markdown files on disk).

### Missing: Journal ↔ Daily Digest Connection (Phase 4+)
Journal entries should feed into the Daily Digest. Pipeline not yet built. Phase 4+ dependency.

---

## Interaction Spec (Sprint 7 — Canvas Model)

### Main Canvas Area

```
Header:
  📖 Journal
  "Sunday, February 23, 2026"
  Status indicator: "Saved ✓" / "Saving..." / "Offline (draft saved)"

Editor:
  Rich text toolbar (undo/redo, headings, formatting, colors, lists, quote)
  Continuous canvas:
    - All entries for selected date rendered as one TipTap document
    - Timestamp dividers between sections (── HH:MM AM/PM ──)
    - Cursor at bottom of latest section
    - New timestamp auto-inserted after 30+ minute gap
  TipTap editor area (min 400px height, expands with content)
  Prose styling with dark mode support
  Placeholder: "Start writing..." (when canvas is empty)
```

### Calendar + Sections Sidebar

```
Mini calendar:
  [◄] February 2026 [►]
  7-column day grid (Su-Sa)
  Dots on days with entries
  Selected date highlighted (primary color)
  Today outlined (ring)

Section anchors:
  "Today's Sections"
  List of timestamp anchors (e.g., "8:15 AM", "10:30 AM", "2:45 PM")
  Click → scrolls canvas to that section
  Active section highlighted based on cursor position

Details panel (collapsible):
  [▾ Details]
  Topics: [Add Topic] + badge list
  Tags: inline autocomplete input + badge list
  Mood: 5-point emoji scale
  [Extract with AI] button

  AI Extraction results (conditional):
    Appears when extraction returns results
    Each item: type badge, title, topic path, [Approve] or [Created ✓]
```

### Date Navigation

```
Click date in calendar → loads that day's canvas
  - Today: editable, cursor at bottom
  - Past dates: editable (click into any section, edit, auto-saves)
Click section anchor → scrolls to that section in the canvas
```

---

## Resolved Questions (User Q&A — February 23, 2026)

### Q1: Continuous writing mode — is this the right direction?
**Answer: YES — One canvas, continuous flow.**

The user confirmed that the discrete entry model feels like "a web form I am filling out and submitting" — subconsciously cringe-inducing. Obsidian's appeal is the open, airy, continuous experience. The user wants ONE canvas per day where they dump everything — relationship thoughts, work, meeting notes, exercise, wins — all in one flow. They don't want to organize beforehand; they want to write freely and have the system help organize *after*.

**Key user insight:** "My goal, and really the goal of this page, is to give an easy method to the madness. Yes. I want one canvas. And also, yes, I want to be able to filter and sort things."

**Design decision:** Continuous view layer over discrete `JournalEntry` records. Canvas is the presentation; entries are the data model.

### Q2: AI Extraction — how useful is this in practice?
**Answer: Useful — ties into the "smart after" philosophy.**

The user sees AI extraction as part of the broader intelligence layer: write freely, then AI organizes. The extraction feature itself is useful but needs to be part of a larger system that reads the full day's canvas and detects topics, tasks, and patterns. Investment continues, but as part of Sprint 8's intelligence layer.

### Q3: Captures in the sidebar — useful or noise?
**Answer: Remove captures from sidebar. Replace with section anchors.**

The user suggested topics/hashtags-based organization instead of showing captures. The sidebar should show section anchors (timestamps for now, AI-detected semantic labels in Sprint 8). Captures don't belong on the Journal page.

### Q4: Templates — would you use them?
**Answer: Yes, but as canvas seeds, not form structures.**

The user liked the idea. Design decision: templates seed the canvas with a light scaffold (questions/prompts) that the user writes over, around, or deletes. Not form fields — just suggested starting points. Deferred to Sprint 8 (canvas core must land first).

### Q5: Journal entry privacy / sensitivity?
**Answer: Important — AI should be opt-in per action.**

Not everything should be reviewed by AI. Design decision: AI features are opt-in per action (user presses a button, AI processes). AI never passively reads journal content. Future: per-section privacy markers.

### Q6: What's your actual journaling pattern?
**Answer: Daily, multi-purpose — journaling, notes, brain dumps.**

The user journals every day. Sometimes it's reflection, sometimes meeting notes, sometimes quick jots. They use Obsidian for flow, Notepad for quick persistence, sometimes Word. Key insight: the Journal page isn't just a diary — it's the user's primary writing surface. It must be as fast as Notepad and as fluid as Obsidian.

**Key user insight:** "Sometimes I will be in a meeting and just need to jot something down. My go to has been opening a new word document, opening up a new Notepad page, and Obsidian."

---

## Must-Never-Lose Checklist: Journal Page

### Editor
- [ ] TipTap rich text editor with full toolbar
- [ ] Toolbar: Undo/Redo, H1/H2, Bold/Italic/Strikethrough
- [ ] Toolbar: Text color picker (9 colors)
- [ ] Toolbar: Highlight color picker (7 colors)
- [ ] Toolbar: Bullet list, Ordered list, Blockquote
- [ ] Placeholder text visible on empty canvas
- [ ] Minimum 400px editor height (expands with content)
- [ ] Dark mode prose support

### Canvas & Auto-Save (Sprint 7+)
- [ ] All entries for a date render as one continuous document
- [ ] Timestamp dividers between sections
- [ ] New timestamp section auto-inserted on return (30+ min gap)
- [ ] Continuous auto-save to Supabase (debounced)
- [ ] localStorage draft as offline fallback
- [ ] Status indicator: "Saved ✓" / "Saving..." / "Offline"
- [ ] Opening /journal shows today's canvas immediately (or blank editor)
- [ ] No form fields above the editor (date header only)

### Draft & Save (Pre-Sprint 7 — adapted)
- [ ] Auto-save draft to localStorage as offline fallback
- [ ] Draft restored on page load (if no Supabase entries exist)
- [ ] Save to Supabase with content, date, tags, topicIds, moodScore

### Entry Editing (Canvas Model)
- [ ] Click into any section in canvas → edit in place
- [ ] Edits auto-save to the correct underlying JournalEntry record
- [ ] Past dates are editable (click into section, edit, auto-saves)
- [ ] Clicking a past date in calendar loads that day's canvas

### Topics & Tags (Relocated to Sidebar Details)
- [ ] Add Topic via TopicPagePicker (in sidebar Details panel)
- [ ] Topics shown as badges (folder/file icon) with remove
- [ ] New topics auto-created from path (e.g., "Work/Planning")
- [ ] Add Tag via inline autocomplete input (replaces prompt())
- [ ] Tags shown as outline badges with remove
- [ ] Tags normalized to lowercase, # stripped

### Mood (Relocated to Sidebar Details)
- [ ] 5-point emoji scale visible in sidebar Details panel
- [ ] Tap to set mood, tap again to unset
- [ ] Active mood highlighted
- [ ] Mood saved with journal entry
- [ ] Mood loaded when viewing day with existing mood

### AI Extraction (Relocated to Sidebar Details)
- [ ] "Extract with AI" button in sidebar Details panel
- [ ] Sends content to edge function
- [ ] Sends context: existing topics, tags, open tasks
- [ ] Results displayed as approvable items
- [ ] Item types: task, capture, subtask
- [ ] Each item shows: type badge, title, topic, parent task (if subtask)
- [ ] "Approve" creates the item, shows "Created" state
- [ ] Loading state during extraction

### Calendar Sidebar
- [ ] Mini calendar with month navigation
- [ ] Dots on days with entries
- [ ] Selected date highlighted
- [ ] Today outlined
- [ ] Section anchors for selected date (clickable, scroll to section)
- [ ] Clicking past date loads that day's canvas

### Sidebar Details Panel
- [ ] Collapsible panel below section anchors
- [ ] Contains: Topics, Tags, Mood, AI Extract
- [ ] All metadata saves correctly to underlying JournalEntry records

### Cross-Page Consistency
- [ ] Journal entries created here appear in Calendar Review mode
- [ ] Mood score from journal reflects in Day Brief mood display (Today page)
- [ ] Topics linked in journal entries appear on Topics page
- [ ] Tags used in journal entries appear in the global tag system

---

*Feature Use Case Bible — Journal Page — v0.2*
*Updated by The Director + Agent 11 (Feature Integrity Guardian)*
*February 23, 2026*
*Changes: Q&A resolved, Canvas design direction established, Sprint 7 baseline*
