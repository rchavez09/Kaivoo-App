# Feature Use Case Bible — Journal Page

**Version:** 0.1 (Initial Draft)
**Status:** DRAFT — Awaiting user review and Q&A
**Scope:** JOURNAL PAGE ONLY (`/journal`) — the dedicated journaling surface
**Compiled by:** The Director + Agent 11 (Feature Integrity Guardian)
**Date:** February 23, 2026
**Purpose:** Define what the Journal page does, how it's used in real life, what "working" looks like, and what must never be lost.

---

## How This Document Relates to the Today Bible

The **Today Bible** states: "Journal Widget → Removed from Today. Journaling moves entirely to the Journal Page." The Today page has no journal widget — journaling lives here. The Day Brief's AI summary can *reference* journal entries, and the floating chat can create quick captures that become journal-adjacent, but the *writing* happens on this page.

---

# JOURNAL PAGE

## Identity

**The Journal page is your writing space.** It's where you reflect, process, plan, and think out loud. Unlike the Today page (glanceable, action-oriented), the Journal page is intentionally spacious — it gives you room to write without distraction.

**Core principle:** Flow first. The journal should feel like opening a fresh notebook page. Start writing immediately, save effortlessly, and navigate your history through the calendar sidebar. The friction between "I want to write" and "I'm writing" should be zero.

---

## Page Layout

The Journal page has a two-panel layout: a main editor area on the left, and a calendar sidebar on the right.

```
┌─────────────────────────────────────────────┬────────────────────┐
│  📖 Journal                                  │   ◄ February 2026 ►│
│  Sunday, February 22, 2026    Draft 3:45 PM  │  Su Mo Tu We Th Fr Sa│
│                                              │     •  •     •  •   │
│  [Add Topic] [Add Tag]                       │        ● ← selected │
│  [[Work/Planning]] × · #reflection ×         │                     │
│                                              │  Today's Entries (2) │
│  ┌────────────────────────────────────────┐  │  ┌─────────────────┐│
│  │ [B][I][S][H1][H2][🎨][📝][•][1.][❝]  │  │  │ 3:45 PM        ✏│
│  │──────────────────────────────────────  │  │  │ Had a great     ││
│  │                                        │  │  │ meeting about...││
│  │ Had a great meeting about the Q2       │  │  │─────────────────││
│  │ roadmap today. Sarah presented the     │  │  │ 10:15 AM        ││
│  │ new pricing model and it looks solid.  │  │  │ Morning thoughts││
│  │                                        │  │  │ on the sprint...││
│  │ Key takeaways:                         │  │  └─────────────────┘│
│  │ • Revenue target is achievable         │  │                     │
│  │ • Need to finalize the landing page    │  │  [+ New entry]      │
│  │ • Competitor analysis due by Friday    │  │                     │
│  │                                        │  │                     │
│  │                                        │  │                     │
│  └────────────────────────────────────────┘  │                     │
│                                              │                     │
│  How are you feeling?                        │                     │
│  😊 🙂 😐 😔 😞  Currently: 🙂 Good       │                     │
│                                              │                     │
│  [✨ Extract with AI]        [💾 Save Entry] │                     │
│                                              │                     │
│  ┌─ AI Extracted Items ──────────────────┐   │                     │
│  │ ✨ Found 3 items to extract           │   │                     │
│  │ [task] Finalize landing page  [✓]     │   │                     │
│  │ [task] Competitor analysis    [✓]     │   │                     │
│  │ [subtask] → Q2 Roadmap       [Approve]│   │                     │
│  └───────────────────────────────────────┘   │                     │
└──────────────────────────────────────────────┴────────────────────┘
```

---

## The Real Use Case

### Use Case 1: Morning Journaling Ritual

You wake up, open Kaivoo, navigate to Journal. The editor is blank (or shows your saved draft from last night). You start writing about your day ahead — what you're thinking, what's stressing you, what you're excited about. You write for 5 minutes, hit Save. The entry appears in the sidebar. Done.

Tomorrow, you click the calendar dot for today and re-read what you wrote. You notice a pattern: you've been stressed about the client presentation for 3 days running. That awareness itself is valuable.

### Use Case 2: Meeting Notes → Actionable Tasks

You just got out of a meeting. You open Journal and dump everything: decisions made, action items, who said what. You tag it `[[Work/Client A]]` and `#meeting`. Then you hit "Extract with AI" — the AI reads your notes and surfaces:
- 3 tasks (with suggested topics, tags, and due dates)
- 1 subtask (attached to an existing task it found)

You approve each one with a tap. The tasks are created in your system, properly organized, without you having to manually create each one. Your meeting notes become actionable in 10 seconds.

### Use Case 3: Editing a Past Entry

You're reviewing your week on Sunday. You click back to Wednesday in the calendar sidebar. Two entries show up. You click the first one — it loads into the editor. You add a note at the bottom: "Update: this turned out better than expected." You hit Update Entry. The entry is amended, not replaced.

### Use Case 4: Quick Evening Reflection

It's 9 PM. You open Journal, write two sentences: "Good day. Got the deploy done and felt productive." Set mood to 🙂 Good. Save. The whole interaction takes 30 seconds. The journal doesn't demand long entries — it accepts whatever you give it.

---

## What Currently Works (Sprint 4 State)

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

## What Doesn't Work / What's Missing

### Missing: Continuous Writing Flow (Obsidian-like)
The Today Bible identified this as the #1 reason the user went back to Obsidian for journaling:
> "Obsidian has a continuous flow — you can write, stop, come back, and keep going. One markdown file that you constantly update."

Currently: each entry is a discrete save. You write, save, the editor clears. If you want to add to today's journal, you have to click the entry in the sidebar to reload it. This creates friction that breaks the flow. The ideal is a continuous document for the day that you keep adding to — more like appending to a file than submitting a form.

### Missing: Markdown Support / Export
The editor uses HTML internally (TipTap). There's no markdown mode and no way to export entries as markdown files. Per Core Principle #1 ("You own your data"), journal entries should be exportable as real files — ideally markdown.

### Missing: Entry Navigation Within the Editor
When viewing a past date with multiple entries, there's no way to quickly jump between them from the editor side. You have to use the sidebar. A "Previous entry / Next entry" navigation within the editor panel would help.

### Missing: Word Count / Writing Stats
No word count, reading time, or writing stats. Journaling streaks and volume are motivational signals — "You've written 2,340 words this week" or "8-day streak!"

### Missing: Full-Text Search Across Entries
No way to search the content of past journal entries. If you want to find "that entry where I wrote about the pricing meeting," you have to manually click through dates. The Calendar page's Review mode shows entries, but doesn't have search either.

### Tag Input UX
Currently uses `prompt()` for tag creation — a browser native dialog. This breaks the flow and feels janky. Should be an inline input or a dropdown with autocomplete from existing tags.

### Missing: Keyboard Shortcuts
No keyboard shortcuts for common actions (Cmd+S to save, Cmd+Enter to save, Cmd+Shift+E to extract). The rich text editor has its own shortcuts (Cmd+B for bold, etc.) but page-level shortcuts are missing.

### Missing: Entry Templates
No way to start with a template. Common patterns: "Morning Pages" (3 pages of stream-of-consciousness), "Daily Standup" (What did I do? What will I do? Blockers?), "Weekly Review" (Wins, Lessons, Next week priorities).

### Missing: Journal ↔ Daily Digest Connection
The Today Bible specifies a Daily Digest file that captures the day's activity. Journal entries should feed into the digest (word count, topics, mood) but this pipeline doesn't exist yet. Phase 4+ dependency.

---

## What It Should Become

### Sprint 6+ Enhancements (Prioritized)

#### 1. Continuous Writing Mode (P1)

**The big shift:** Instead of "write → save → clear → start over," the journal becomes a continuous document for the day. You open Journal, and if you've already written today, you see your existing content with a cursor at the bottom. You just keep writing.

```
┌──────────────────────────────────────────────────────────────┐
│  February 22, 2026                                           │
│                                                              │
│  10:15 AM ──────────────────────────────────────────         │
│  Morning thoughts. Woke up feeling good. Big meeting         │
│  today about the Q2 roadmap. Need to prepare the slides.     │
│                                                              │
│  3:45 PM ──────────────────────────────────────────          │
│  Great meeting. Sarah's pricing model looks solid.           │
│  Key takeaways:                                              │
│  • Revenue target is achievable                              │
│  • Need to finalize landing page by Friday                   │
│                                                              │
│  9:20 PM ──────────────────────────────────────────          │
│  Evening. Good day overall. Got the deploy done.             │
│  █ ← cursor (keep writing)                                   │
└──────────────────────────────────────────────────────────────┘
```

**How it works:**
- Opening Journal for today shows all today's entries as one continuous document with timestamp dividers
- New content is appended with an auto-generated timestamp
- Auto-saves continuously (debounced, like current draft behavior but to Supabase)
- Each timestamped section is still a discrete JournalEntry in the database — the continuous view is a presentation layer
- Editing a past section is allowed (click into it, edit, auto-saves)

**Backward compatibility:** This doesn't remove the current discrete entry model — it layers a continuous view on top. The sidebar still shows individual entries. The database model stays the same. The editor just presents them seamlessly.

#### 2. Inline Tag Input with Autocomplete (P1)

Replace `prompt()` with an inline tag input:
- Type `#` in the tag area → dropdown appears with existing tags
- Type to filter
- Enter to add
- Create new tags by typing a new name
- Same interaction as task tag input in TaskDetailsDrawer

#### 3. Full-Text Search Across Entries (P1)

Search box in the sidebar (above or replacing the calendar header):
```
┌───────────────────────┐
│ 🔍 Search entries...  │
└───────────────────────┘
```

- Searches across all journal entry content (stripped of HTML)
- Results show as a list replacing the date-based entry list
- Each result shows: date, time, content snippet with highlighted match
- Click result → loads entry into editor
- Clear search → returns to calendar view

#### 4. Word Count & Writing Stats (P2)

Bottom bar in the editor area:
```
423 words · 2 min read · Entry 3 of 3 today · 🔥 8-day streak
```

- Word count for current entry (live)
- Reading time estimate
- Entry count for selected date
- Writing streak (consecutive days with at least 1 entry)

#### 5. Keyboard Shortcuts (P2)

| Shortcut | Action |
|---|---|
| `Cmd+S` / `Ctrl+S` | Save entry |
| `Cmd+Enter` | Save entry (alternative) |
| `Cmd+Shift+E` | Extract with AI |
| `Cmd+Shift+N` | New entry |
| `Cmd+[` / `Cmd+]` | Previous/next day in calendar |

#### 6. Entry Templates (P3)

"New Entry" dropdown with template options:
- Blank (default)
- Morning Pages: "How are you feeling? What's on your mind? What do you want to accomplish today?"
- Daily Standup: "### What I did yesterday\n\n### What I'm doing today\n\n### Blockers"
- Weekly Review: "### Wins\n\n### Lessons\n\n### Next week priorities"
- Custom templates (user-created, saved in settings)

#### 7. Markdown Export (P3 — Vision Phase 3)

Export options:
- Export single entry as .md file
- Export date range as .md files (one per day, or one per entry)
- Export all entries as a .zip of .md files
- Markdown conversion from HTML (preserving headings, bold, lists, etc.)

This ties into Phase 3 (Self-Hosted Hub) where journal entries become actual markdown files on disk.

#### 8. Journal ↔ Insights Integration (P3)

Feed journal data into the Insights page:
- Words written per day/week/month (chart)
- Topics and tags most frequently used in journal entries
- Mood correlation with journal activity (do you journal more on good or bad days?)
- Writing time patterns (morning vs. evening writer?)

---

## Interaction Spec

### Main Editor Area

```
Header:
  📖 Journal
  "Sunday, February 22, 2026" (or "Editing entry from Feb 22, 2026")
  [New Entry] button (when editing existing)
  "Draft saved 3:45 PM" / "Unsaved changes" indicator

Topic/Tag bar:
  [Add Topic] → TopicPagePicker dropdown
  [Add Tag]   → Inline input (future: autocomplete)
  Active topics shown as badges (folder/file icon, × to remove)
  Active tags shown as outline badges (× to remove)

Editor:
  Rich text toolbar (undo/redo, headings, formatting, colors, lists, quote)
  TipTap editor area (min 400px height)
  Prose styling with dark mode support

Mood selector:
  "How are you feeling?"
  5 emoji buttons (tap to set, tap again to unset)
  Active mood highlighted with ring

Action bar:
  [Extract with AI] — left side (sends to edge function)
  [Save Entry] / [Update Entry] — right side

AI Extraction results (conditional):
  Appears below action bar when extraction returns results
  Each item: type badge, title, topic path, [Approve] or [Created ✓]
```

### Calendar Sidebar

```
Mini calendar:
  [◄] February 2026 [►]
  7-column day grid (Su-Sa)
  Dots on days with entries
  Selected date highlighted (primary color)
  Today outlined (ring)

Entry list:
  "Today's Entries" / "Feb 22, 2026"
  "2 entries"

  Entries sorted newest first:
    Time stamp · content preview (100 chars)
    Journal entries: clickable → loads into editor
    Captures: shown but not clickable
    Active entry highlighted with ring

  [+ New entry for today]
```

### Date Navigation

```
Click date in calendar → loads entries for that date
Click entry → loads into editor (edit mode)
Click [+ New entry] → clears editor (create mode)
Month nav arrows → shows adjacent months
```

---

## Open Questions for User

### Q1: Continuous writing mode — is this the right direction?
The Today Bible identified "Obsidian-like continuous flow" as the #1 journal improvement. The proposed solution layers a continuous view over discrete entries. Does this match how you'd want to use it? Or would you prefer a true single-document-per-day model (one big entry instead of multiple timestamped entries)?

### Q2: AI Extraction — how useful is this in practice?
The edge function exists and works. Have you used it? Is it genuinely useful, or is it a feature that sounds good but doesn't get used? This determines how much investment it gets in future sprints.

### Q3: Captures in the sidebar — useful or noise?
The sidebar currently shows both journal entries and captures for the selected date. Captures are non-clickable (can't edit them from Journal). Should captures stay in the sidebar, or should the Journal page only show journal entries?

### Q4: Templates — would you use them?
"Morning Pages," "Daily Standup," "Weekly Review" — are these patterns you'd actually start entries with, or do you prefer to just write freely?

### Q5: Journal entry privacy / sensitivity?
Some journal entries might be deeply personal. Are there any considerations for how journal data should be handled differently from tasks or captures? (This matters for AI extraction, Concierge access, and future team features.)

### Q6: What's your actual journaling pattern?
How often do you journal, and what does a typical session look like? (This helps us prioritize: if you journal daily in short bursts, continuous mode is critical. If you journal occasionally in long sessions, templates and search matter more.)

---

## Must-Never-Lose Checklist: Journal Page

### Editor
- [ ] TipTap rich text editor with full toolbar
- [ ] Toolbar: Undo/Redo, H1/H2, Bold/Italic/Strikethrough
- [ ] Toolbar: Text color picker (9 colors)
- [ ] Toolbar: Highlight color picker (7 colors)
- [ ] Toolbar: Bullet list, Ordered list, Blockquote
- [ ] Placeholder text visible on empty editor
- [ ] Minimum 400px editor height
- [ ] Dark mode prose support

### Draft & Save
- [ ] Auto-save draft to localStorage (debounced 2s)
- [ ] Draft restored on page load
- [ ] "Draft saved [time]" / "Unsaved changes" indicators
- [ ] Draft cleared after successful save
- [ ] Save to Supabase with content, date, tags, topicIds, moodScore
- [ ] Toast confirmation on save

### Entry Editing
- [ ] Click sidebar entry → loads into editor
- [ ] Header shows "Editing entry from [date]"
- [ ] "New Entry" button visible when editing
- [ ] "Update Entry" label replaces "Save Entry"
- [ ] Update saves to existing entry (doesn't create duplicate)
- [ ] "New Entry" clears editor and resets to create mode

### Topics & Tags
- [ ] Add Topic via TopicPagePicker
- [ ] Topics shown as badges (folder/file icon) with remove
- [ ] New topics auto-created from path (e.g., "Work/Planning")
- [ ] Add Tag functionality
- [ ] Tags shown as outline badges with remove
- [ ] Tags normalized to lowercase, # stripped

### Mood
- [ ] 5-point emoji scale visible below editor
- [ ] Tap to set mood, tap again to unset
- [ ] Active mood highlighted
- [ ] Mood saved with journal entry
- [ ] Mood loaded when editing existing entry

### AI Extraction
- [ ] "Extract with AI" button sends content to edge function
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
- [ ] Entry list for selected date (time + content preview)
- [ ] Journal entries clickable → loads into editor
- [ ] Active entry highlighted
- [ ] "New entry" button at bottom
- [ ] Date selection resets editor to create mode
- [ ] Captures shown in entry list (non-clickable)

### Cross-Page Consistency
- [ ] Journal entries created here appear in Calendar Review mode
- [ ] Mood score from journal reflects in Day Brief mood display (Today page)
- [ ] Topics linked in journal entries appear on Topics page
- [ ] Tags used in journal entries appear in the global tag system

---

*Feature Use Case Bible — Journal Page — v0.1*
*Compiled by The Director + Agent 11 (Feature Integrity Guardian)*
*February 23, 2026*
