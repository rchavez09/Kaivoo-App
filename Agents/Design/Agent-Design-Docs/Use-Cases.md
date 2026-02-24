# Use Cases — UC1 through UC11

**Source:** Extracted from Agent 6 (Usability Architect) during Design Agent merge — Sections 3-13 (all 11 use cases) + Section 17 (Open Questions)
**Parent:** [Agent-Design.md](../Agent-Design.md)

---

# Use Case 1: Unified Day View

## 1.1 The Problem

The Calendar page has 4 separate modes (Tasks, Meetings, Combined, Day Review). Combined shows meetings and tasks, but not journal entries or routines. Day Review shows everything but is read-only. There's no single interactive view that shows the complete picture of a day.

## 1.2 The Scenario

> Kai opens Kaivoo on his phone at 9pm. He wants to review his day: what meetings did he have, what tasks did he finish, did he journal, did he do his routines? He also realizes he forgot to mark his "Read for 30 min" routine — he did it at lunch but forgot to check it off. He wants to do all of this without switching between 4 different views.

## 1.3 Proposed Solution: The Day Timeline

```
┌─────────────────────────────────────────────────────────────────┐
│  ◀  Thursday, February 20, 2026                    [Today] ▶   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ROUTINES                                          4/6 done     │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ ✅ Morning Meditation    ✅ Exercise     ✅ Read 30min   │    │
│  │ ✅ Journal               ○ Review Tasks  ○ Evening Walk  │    │
│  └─────────────────────────────────────────────────────────┘    │
│  ↑ Tappable! Toggle any routine, even for past days             │
│                                                                 │
│  TIMELINE                                                       │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                                                         │    │
│  │  9:00  ── 📅 Team Standup (Google Calendar)             │    │
│  │            30m · Zoom · 4 attendees                     │    │
│  │                                                         │    │
│  │  10:30 ── ✅ Finalize Kaivoo color tokens               │    │
│  │            Completed at 10:47am                         │    │
│  │                                                         │    │
│  │  11:00 ── 📅 Design Review with Sarah (Teams)          │    │
│  │            1h · Teams · 2 attendees                     │    │
│  │                                                         │    │
│  │  12:30 ── 📝 Journal Entry                              │    │
│  │            "Had a great design review. Sarah loved..."  │    │
│  │            ↑ Tap to expand and edit                     │    │
│  │                                                         │    │
│  │  2:00  ── ✅ Update brand guidelines PDF                │    │
│  │  2:15  ── ✅ Send client proposal draft                 │    │
│  │                                                         │    │
│  │  3:00  ── 📅 Client Call: NUWAVE (Manual)              │    │
│  │            1h · Phone                                   │    │
│  │                                                         │    │
│  │  5:30  ── 📝 AI Capture                                 │    │
│  │            "Research Tailscale vs Cloudflare Tunnel"    │    │
│  │                                                         │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                 │
│  SUMMARY                                                        │
│  4/6 routines · 3 meetings · 3 tasks completed · 1 entry       │
│  523 words journaled · Mood: Good                               │
│                                                                 │
│  TASKS STILL PENDING                                            │
│  ○ Review competitor pricing (due today)                        │
│  ○ Draft weekly newsletter (due tomorrow)                       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## 1.4 Key Interactions

| Element | Tap/Click Action | Long Press / Secondary |
|---------|-----------------|----------------------|
| Routine chip | Toggle complete/incomplete | Open routine detail |
| Meeting block | Expand: show notes, attendees, join link | Navigate to meeting detail |
| Task (completed) | No action (already done) | Undo completion |
| Task (pending) | Mark as done | Open task detail drawer |
| Journal entry | Expand inline preview | Open in full editor |
| AI Capture | Expand to full content | Convert to task |
| Date arrows | Navigate to previous/next day | — |
| "Today" button | Jump to current date | — |

## 1.5 Data Sources

```
Timeline events are merged from:
  1. Meetings table (startTime gives position)
  2. Tasks where completedAt date matches (completedAt gives position)
  3. Tasks where dueDate matches but not completed (shown in "Pending" section)
  4. Journal entries where date matches (timestamp gives position)
  5. Captures where date matches (createdAt gives position)
  6. Routine completions where date matches (shown in Routines section)

Sorted by: timestamp (meetings by startTime, tasks by completedAt,
entries by timestamp, captures by createdAt)
```

## 1.6 Where This Lives

This replaces the current "Day Review" mode in CalendarPage. It becomes the default view when you click any date on the calendar. It's also accessible from:
- Tapping a day on the Dashboard mini-calendar widget
- Clicking a date in the Journal sidebar
- Clicking a bar in the Insights chart
- Any date reference anywhere in the app

---

# Use Case 2: Journal Time Travel

## 2.1 The Problem

The Journal page only supports writing new entries. The sidebar calendar shows dots on days with entries and lists them when clicked, but the entries are buttons that do nothing. You cannot go back and read, edit, or append to past entries.

## 2.2 The Scenario

> Kai wrote a journal entry on Monday about a client meeting. On Wednesday, the client responds with feedback. Kai wants to go back to Monday's entry and add a follow-up note, not create a new Wednesday entry about it. He also wants to re-read what he wrote to remember the context.

## 2.3 Proposed Solution

```
JOURNAL SIDEBAR — ENHANCED:

┌──────────────────────────┐
│  ◀  February 2026  ▶    │
│                          │
│  [Calendar Grid]         │
│  Days with entries show  │
│  dots (already works)    │
│                          │
├──────────────────────────┤
│  February 20             │
│  2 entries               │
│                          │
│  ┌────────────────────┐  │
│  │ ● 8:15 AM          │  │  ← Click to load into editor
│  │ "Had a great       │  │
│  │  morning. Started   │  │
│  │  the day with..."  │  │
│  │         [Edit] [▶] │  │
│  └────────────────────┘  │
│                          │
│  ┌────────────────────┐  │
│  │ ● 6:30 PM          │  │
│  │ "Wrapping up the   │  │
│  │  design review..." │  │
│  │         [Edit] [▶] │  │
│  └────────────────────┘  │
│                          │
│  [+ New Entry for Feb 20]│  ← Always available
│                          │
└──────────────────────────┘
```

## 2.4 Key Behaviors

```
CLICKING A PAST DATE:
  1. Sidebar shows all entries for that date
  2. Main editor loads the most recent entry for that date
  3. Editor is in "editing past entry" mode (subtle indicator)
  4. Changes save to the EXISTING entry (not create a new one)

CLICKING [Edit] ON A SPECIFIC ENTRY:
  1. That specific entry loads into the main editor
  2. All tags and topic associations load
  3. Content is editable
  4. Save updates the existing entry

CLICKING [+ New Entry for Feb 20]:
  1. Creates a new blank entry dated Feb 20
  2. Multiple entries per day are fine (morning reflection, evening review)
  3. Editor is in "new entry" mode

VISUAL INDICATORS:
  - Current day entries: normal styling
  - Past day entries in editor: subtle "Editing entry from Feb 20" banner
  - Modified entries: "Last edited: Feb 21 at 3pm" metadata
```

## 2.5 Hub Phase Enhancement

When we move to markdown files (Hub Phase 2), this becomes even more natural:

```
Journal/2026/02 - February/2026-02-20.md

The file IS the journal entry. Loading it into the editor is just
reading a file. Saving is writing the file. Multiple entries per
day could be:
  - One file with ## sections (Morning, Evening)
  - Multiple files: 2026-02-20-morning.md, 2026-02-20-evening.md

The markdown approach makes "time travel" trivial — it's just
opening a file from a different date.
```

---

# Use Case 3: Calendar Source Aggregation

## 3.1 The Problem

All meetings are manually entered. There's no connection to Google Calendar, Outlook/Teams, or any external calendar source. For someone with 5-10 meetings a day across work and personal calendars, manual entry is a non-starter.

## 3.2 The Scenario

> Kai has 3 calendar sources: personal Google Calendar, work Google Calendar (different account), and Microsoft Teams meetings from his client's org. He wants all of these visible in Kaivoo alongside his manually created events. He doesn't want to manage them in Kaivoo — just see them. He creates manual events in Kaivoo for things not on any external calendar.

## 3.3 Proposed Solution

```
SETTINGS → CALENDAR SOURCES

┌──────────────────────────────────────────────────────────────┐
│  Calendar Sources                                            │
│                                                              │
│  ✅ Personal Gmail (kai@gmail.com)                           │
│     Google Calendar · Last synced: 2 min ago                 │
│     Calendars: [✅ Personal] [✅ Birthdays] [○ Holidays]     │
│     Color: 🔵 Blue                                           │
│     [Resync] [Disconnect]                                    │
│                                                              │
│  ✅ Work Gmail (kai@company.com)                             │
│     Google Calendar · Last synced: 2 min ago                 │
│     Calendars: [✅ Work] [✅ Team Meetings]                   │
│     Color: 🟢 Green                                          │
│     [Resync] [Disconnect]                                    │
│                                                              │
│  ✅ Microsoft Teams (kai@client.com)                         │
│     Outlook/Teams · Last synced: 5 min ago                   │
│     Calendars: [✅ Default]                                   │
│     Color: 🟣 Purple                                         │
│     [Resync] [Disconnect]                                    │
│                                                              │
│  ✅ Kaivoo (manual events)                                   │
│     Always active · Local                                    │
│     Color: 🟠 Teal (primary)                                 │
│                                                              │
│  [+ Connect Calendar Source]                                 │
│                                                              │
│  Sync frequency: [Every 5 minutes ▼]                         │
│  Show declined events: [Off]                                 │
└──────────────────────────────────────────────────────────────┘
```

## 3.4 Calendar Display with Sources

```
CALENDAR DAY VIEW — MEETINGS SECTION:

  📅 9:00  Team Standup                    🟢 Work
           30m · Zoom · 4 attendees
           [Join Meeting]

  📅 10:00 Design Review                   🟣 Teams
           1h · Microsoft Teams · Sarah, Mike
           [Join Meeting]

  📅 12:00 Lunch with Alex                 🔵 Personal
           1h · Cafe Roma

  📅 2:00  Client Presentation             🟠 Kaivoo
           1.5h · Conference Room B
           [Edit] [Delete]

  ↑ Color dots indicate source
  ↑ External events are read-only (no Edit/Delete)
  ↑ Kaivoo events are fully editable
```

## 3.5 Sync Architecture

```
READ-ONLY SYNC (Phase 3 — Dashboard Migration):
  Hub Server pulls events from external sources
  → Stores in meetings table with source field
  → Displays alongside manual Kaivoo events
  → External events cannot be edited in Kaivoo
  → Sync runs on configurable interval (default: 5 min)
  → Webhooks for Google Calendar (push notifications)
  → Delta queries for Microsoft Graph (incremental)

FUTURE (Phase 8+):
  → Two-way sync (create events in Kaivoo → pushed to Google/Outlook)
  → But start read-only. Get the display right first.
```

## 3.6 Technical Requirements

```
GOOGLE CALENDAR:
  • OAuth 2.0 consent screen (scope: calendar.readonly)
  • Events.list with timeMin/timeMax for date range queries
  • Sync token for incremental updates
  • Webhook (Events.watch) for push notifications
  • Token refresh handled by Hub server (never expires if refreshed)

MICROSOFT GRAPH:
  • OAuth 2.0 with Azure AD
  • /me/calendarView for date range queries
  • Change notifications (subscription-based webhooks)
  • Delta query for incremental sync
  • Teams meeting detection via isOnlineMeeting field

STORAGE:
  • External events stored in meetings table
  • is_external = true, source = 'google' | 'outlook' | 'teams'
  • external_id = provider's event ID (for dedup on re-sync)
  • Hub never modifies external events — read-only mirror
```

---

# Use Case 4: Retroactive Routine Completion

## 4.1 The Problem

Routines can only be toggled for the current day from the Today page. If you forget to mark a routine yesterday, there's no way to go back and check it off. The DayReview component shows routine status for past days but doesn't allow toggling.

## 4.2 The Scenario

> It's Wednesday morning. Kai opens his Day Review for Tuesday and sees his "Read for 30 min" routine is unchecked. He definitely read last night — he just forgot to mark it in the app. He wants to tap the routine and check it off for Tuesday, with his streak updating correctly.

## 4.3 Proposed Solution

**Approach: Confirmation-Required Backdating (within 7 days)**

```
USER TAPS UNCHECKED ROUTINE FOR A PAST DAY:

┌────────────────────────────────────────┐
│                                        │
│  Mark "Read 30 min" as complete        │
│  for Tuesday, February 19?             │
│                                        │
│  This will update your streak.         │
│                                        │
│        [Cancel]    [Mark Done ✓]       │
│                                        │
└────────────────────────────────────────┘

After confirmation:
  • Routine completion record created for Feb 19
  • Streak recalculated (gap filled)
  • Visual update: chip turns green with checkmark
  • Toast: "Routine marked as done for Feb 19"
```

**Rules:**
```
1. Can backdate up to 7 days (configurable in settings)
2. Shows confirmation dialog (not instant toggle)
3. Backdated completions are stored with actual timestamp:
   { routineId, date: "2026-02-19", completed_at: "2026-02-21T09:15:00" }
4. Streaks are recalculated when backdated entries fill gaps
5. Insights charts update to reflect the change
6. No visual distinction between "on time" and "backdated" completions
   (we trust the user — they're only accountable to themselves)
```

## 4.4 Where Retroactive Toggle Appears

| Location | How |
|----------|-----|
| Unified Day View | Routine chips are tappable for any date within 7 days |
| Calendar Day Review mode | Same chips, same behavior |
| Dashboard Routines widget | Only current day (no change) |
| Insights page | Click a bar chart day → opens Day View → toggle from there |

---

# Use Case 5: Insight Zoom Levels

## 5.1 The Problem

The Insights page is locked to weekly view. You can navigate weeks with arrows, but there's no monthly, quarterly, or yearly perspective. The only metric tracked is routine completion — no task trends, journal consistency, or cross-metric correlation.

## 5.2 The Scenario

> Kai wants to see if his productivity has improved since January. He wants to zoom out from "this week" to "this month" to "this quarter" and see whether his routine consistency, task completion rate, and journaling habit are trending up or down.

## 5.3 Proposed Solution: Multi-Scale Insights

```
INSIGHTS PAGE — REDESIGNED HEADER:

┌─────────────────────────────────────────────────────────────────┐
│  Insights                                                       │
│  Track your progress and patterns                               │
│                                                                 │
│  [Day] [Week] [Month] [Quarter] [Year]          ◀ Feb 2026 ▶  │
│         ^^^^                                                    │
│         (currently active)                                      │
└─────────────────────────────────────────────────────────────────┘
```

### Day View
```
Full Unified Day View (Use Case 1) — accessible from Insights as a drill-down.
Click any data point in Week/Month/Year → zooms to Day View for that date.
```

### Week View (current, enhanced)
```
WHAT EXISTS NOW:
  ✅ Routine completion bar chart (Mon-Sun)
  ✅ Routine breakdown with progress bars
  ✅ Week navigation arrows
  ✅ Group filtering

ADDITIONS:
  + Tasks completed vs tasks created this week
  + Journal entries: days written + word count
  + Mood trend (if using mood tracking in journal)
  + "Week Score" composite metric
  + Comparison to previous week ("↑12% routine completion")
```

### Month View
```
┌─────────────────────────────────────────────────────────────┐
│  February 2026                              ◀  ▶           │
│                                                             │
│  ACTIVITY HEATMAP (GitHub-style)                            │
│  Mo Tu We Th Fr Sa Su                                       │
│  ██ ██ ██ ░░ ██ ██ ░░    Week 1                            │
│  ██ ██ ██ ██ ██ ░░ ██    Week 2                            │
│  ██ ██ ██ ██ ██ ██ ██    Week 3 ← Full week!              │
│  ██ ██ ░░                 Week 4 (partial)                  │
│                                                             │
│  ██ = Active day (journaled OR completed task OR routine)   │
│  ░░ = Inactive day                                          │
│  Click any cell → drill to Day View                         │
│                                                             │
│  MONTHLY METRICS                                            │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐      │
│  │ 87%      │ │ 23/28    │ │ 18       │ │ 4,200    │      │
│  │ Routine  │ │ Tasks    │ │ Journal  │ │ Words    │      │
│  │ Rate     │ │ Done     │ │ Days     │ │ Written  │      │
│  │ ↑5%      │ │ ↑3       │ │ ↓2       │ │ ↑800     │      │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘      │
│  vs January    vs January   vs January   vs January         │
│                                                             │
│  ROUTINE CONSISTENCY (sparkline per routine)                │
│  Morning Meditation  ████████░░████████████  85%            │
│  Exercise            ████░░██░░████████░░██  65%            │
│  Read 30 min         ██████████████████████  95%            │
│                                                             │
│  BEST STREAKS THIS MONTH                                    │
│  🔥 12-day journaling streak (Feb 5-16)                     │
│  🔥 8-day exercise streak (Feb 10-17)                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Quarter View
```
Q1 2026 (Jan - Mar)

Trend lines across 3 months:
  - Routine completion rate: [sparkline ────╱──]  Trending up
  - Task completion:         [sparkline ──╱────]  Trending up
  - Journal consistency:     [sparkline ────────]  Stable
  - Average mood:            [sparkline ──╱╲──╱]  Variable

Month-over-month comparison table:
  | Metric          | Jan    | Feb    | Mar   | Trend |
  |-----------------|--------|--------|-------|-------|
  | Routine Rate    | 72%    | 87%    | —     | ↑     |
  | Tasks Completed | 45     | 52     | —     | ↑     |
  | Journal Days    | 22/31  | 18/21  | —     | →     |
  | Words Written   | 8,400  | 4,200  | —     | ↓     |
```

### Year View
```
2026 Year in Progress

GitHub-style contribution graph (365 cells):
  Each cell = one day, colored by activity level
  Light → Dark = Less active → More active

Annual metrics with rolling averages:
  - Best month: February (87% routine rate)
  - Longest streak: 12 days (journaling, Feb 5-16)
  - Total tasks completed: 97
  - Total words journaled: 12,600
  - Most productive day of week: Tuesday
```

## 5.4 Key Interaction: Drill-Down

Every data point is clickable:
- Click a day cell in the heatmap → Day View
- Click a week in the month view → Week View
- Click a month in the quarter view → Month View
- Click a routine sparkline → Routine detail with full history

This creates a seamless zoom: Year → Quarter → Month → Week → Day

---

# Use Case 6: Cross-Entity Day Drilling

## 6.1 The Problem

Date references appear everywhere in the app — task due dates, meeting dates, journal dates, insight chart bars — but clicking them doesn't do anything. There's no way to go from "this task is due Feb 20" to "what else was happening on Feb 20?"

## 6.2 The Scenario

> Kai sees a task due on February 20. He wonders: "What meetings did I have that day? Did I write about this in my journal?" He wants to click "Feb 20" and see the full context.

## 6.3 Proposed Solution: The Date Chip

```
ANYWHERE a date appears in the app, it becomes a clickable chip:

  Task: "Finalize proposal"
  Due: [Feb 20] ← Clickable!
       Clicking opens a popover or navigates to the Unified Day View

  Meeting: "Client Call"
  Date: [Feb 20] at 3:00 PM ← Clickable!

  Insight chart bar for Wednesday → Clickable!
  Navigates to Day View for that Wednesday
```

**Implementation pattern:**
```tsx
// A reusable DateChip component
<DateChip date="2026-02-20" />

// Renders as a subtle, tappable chip
// On click: navigates to /calendar?date=2026-02-20&mode=review
// Or: opens a Day Summary popover (lighter weight)
```

---

# Use Case 7: Drop File → Get Insights (Phase 4+)

## 7.1 The Problem

Getting insights from files (PDFs, videos, presentations) currently requires opening them in a separate tool, reading/watching them, and manually extracting key points. There's no way to ask "what are the key takeaways from this video?" without leaving Kaivoo.

## 7.2 The Scenario

> Kai saves a 45-minute conference talk video to ~/Kaivoo/Library/Videos/. He doesn't have time to watch it. He wants to ask the Concierge: "What were the key points from that conference talk I saved?" and get a summary without ever opening the video.

## 7.3 Proposed Solution: The Insight Pipeline

```
USER DROPS FILE → KAIVOO PROCESSES AUTOMATICALLY:

1. FILE DETECTION (chokidar)
   ~/Kaivoo/Library/Videos/conference-talk.mp4 detected

2. TEXT EXTRACTION (background job)
   Video → ffmpeg → audio.wav → Whisper → transcript.md
   PDF → pdf-parse → text
   PPTX → pptx parser → text
   Transcript saved alongside original:
     conference-talk.mp4
     conference-talk.transcript.md  ← Auto-generated

3. CHUNKING & EMBEDDING (background job)
   Transcript split into semantic chunks
   Each chunk embedded via nomic-embed-text (Ollama)
   Embeddings stored in vector DB (sqlite-vss)

4. READY FOR QUERY
   File appears in Vault with "Indexed ✓" indicator
   Concierge can now answer questions about this file

USER → CONCIERGE:
  "Summarize the conference talk I saved yesterday"

CONCIERGE:
  → Searches vector DB for relevant chunks
  → Retrieves top-k matches
  → Sends to LLM with context
  → Returns structured summary

  "Here are the key takeaways from 'conference-talk.mp4':
   1. [Point one with timestamp reference]
   2. [Point two]
   3. [Point three]

   The speaker also recommended these resources:
   - [Resource 1]
   - [Resource 2]

   Full transcript available: conference-talk.transcript.md"
```

## 7.4 Vault Integration

```
FILES VIEW — ENHANCED:

  📹 conference-talk.mp4        320 MB    Feb 20, 2026
     Library/Videos/            #conference #tech
     [▶ Play] [📄 Transcript] [💬 Ask AI]  [Indexed ✓]
                                              ↑
                                    Indicates file is in vector DB

  📄 quarterly-report.pdf       2.4 MB    Feb 18, 2026
     Library/Documents/         #nuwave #report
     [📖 Read] [💬 Ask AI]     [Indexed ✓]

  📊 brand-deck.pptx            5.1 MB    Feb 15, 2026
     Library/Presentations/     #kaivoo #branding
     [📊 Preview] [💬 Ask AI]  [Indexed ✓]
```

## 7.5 NotebookLM-Style Integration (Future)

```
OPTION A: Build our own (Phase 4-6)
  Use the Concierge + RAG pipeline to replicate NotebookLM functionality
  locally. This is what the architecture already supports.

OPTION B: Folder sync to NotebookLM (if API becomes available)
  Watch a folder → auto-upload new files to a NotebookLM notebook
  → Query via API → Display results in Kaivoo
  This depends on Google releasing a NotebookLM API.

OPTION C: Hybrid
  Use local RAG for quick queries (Ollama + sqlite-vss)
  Use cloud LLM (Claude/GPT) for deep analysis when needed
  Use NotebookLM for specific use cases (Audio Overviews)

RECOMMENDATION: Start with Option A (fully self-hosted), design for
Option C (hybrid). Don't depend on NotebookLM API existing.
```

---

# Use Case 8: Connected Context

## 8.1 The Problem

Events in Kaivoo exist in isolation. A meeting doesn't know about the tasks it spawned. A task doesn't know about the journal entry where it was discussed. A routine completion doesn't know that today was also the day of a big presentation.

## 8.2 The Scenario

> Kai had a client meeting on Monday that led to 3 new tasks. He journaled about the meeting Monday evening. He completed 2 of the 3 tasks by Wednesday. He wants to see this chain: Meeting → Tasks → Journal → Completion — as a connected story, not scattered data.

## 8.3 Proposed Solution: Implicit Connections via Day

Rather than building explicit "link this meeting to this task" functionality (which creates user burden), leverage the Day as the connection:

```
MEETING: "Client Meeting" — Feb 17
  → Same day context: 3 tasks created Feb 17, 1 journal entry Feb 17
  → Shown as: "Also on this day: 3 tasks created, 1 journal entry"

TASK: "Send revised proposal" — Created Feb 17, Due Feb 19, Done Feb 19
  → Created on same day as meeting → implicit connection
  → Completed on Feb 19 → that day's context shown in Day View

JOURNAL ENTRY: Feb 17
  → Contains text about "client meeting" and "proposal"
  → AI can extract: "This entry discusses the Client Meeting"
  → Shown as: Related meeting suggestion
```

**Phase 4+ (Concierge):**
```
USER: "What came out of Monday's client meeting?"

CONCIERGE:
  → Finds meeting on Feb 17: "Client Meeting"
  → Finds tasks created on Feb 17 (same day heuristic)
  → Finds journal entries for Feb 17
  → Finds task completions linked to those tasks
  → Assembles narrative:

  "Your client meeting on Monday (Feb 17) led to:
   - 3 tasks created that day
     ✅ Send revised proposal (completed Feb 19)
     ✅ Update pricing sheet (completed Feb 18)
     ○ Schedule follow-up call (due Feb 24)
   - You journaled about it: 'Had a productive meeting...'
   - Related capture: 'Client wants 15% discount for annual'"
```

---

# Use Case 9: Mood Tracking

## 9.1 The Problem

Kaivoo captures activity data (tasks, routines, journal entries) but has no way to capture how the user *feels*. Without mood data, the Insights page can only answer "what did I do?" — not "how did I feel?" or "what makes me feel good?" This is the difference between a productivity tracker and a self-awareness tool.

## 9.2 The Scenario

> Kai finishes his evening journal entry. As he saves, a subtle row appears: "How are you feeling?" with five emoji options. He taps "Good" — one tap, less than a second. Over the next month, his Insights page starts showing a mood heatmap alongside his activity heatmap, and the correlation engine discovers that he feels "Great" on 80% of the days he does his morning routine.

## 9.3 Proposed Solution: One-Tap Mood Selector

```
JOURNAL SAVE FLOW — MOOD SELECTOR:

After user saves a journal entry, before the save animation completes:

┌──────────────────────────────────────────────────────────────┐
│                                                              │
│  Entry saved.                                                │
│                                                              │
│  How are you feeling?                                        │
│                                                              │
│    😊        🙂        😐        😔        😞               │
│   Great     Good     Okay      Low     Rough                │
│                                                              │
│                                          [Skip]             │
│                                                              │
└──────────────────────────────────────────────────────────────┘

After selection:
  • Subtle confirmation: "Got it — feeling Good today."
  • Stores mood_score (1-5) on the journal entry
  • Also stores a daily_mood record for the day (latest entry wins)
  • No further interaction required
```

## 9.4 Key Design Decisions

```
1. OPTIONAL, NEVER MANDATORY
   - "Skip" is always visible and never guilt-trips
   - After 3 consecutive skips, reduce prompt frequency (show every other day)
   - User can disable in Settings

2. ONE MOOD PER DAY (for analytics)
   - If user journals twice, the latest mood wins for that day's record
   - Both entries retain their individual mood_score
   - Daily mood = most recent journal entry's mood

3. WHERE MOOD APPEARS
   - Journal entry metadata (small emoji next to timestamp)
   - Unified Day View summary header
   - Monthly Insights heatmap (colored by mood instead of/alongside activity)
   - Correlation engine input

4. NO MOOD HISTORY EDITING
   - Users can't go back and change past moods (unlike routines)
   - Mood is a point-in-time capture — changing it retroactively
     defeats the purpose of honest tracking
   - Exception: Daily Shutdown flow allows setting mood for today

5. DATA MODEL
   - Journal entry: add mood_score: number | null (1-5)
   - Daily aggregate: daily_mood table (date, mood_score, source_entry_id)
   - Insights: moods queryable by date range for heatmaps and correlations
```

## 9.5 Also Available In

| Location | Behavior |
|----------|----------|
| Journal save | Primary capture point (described above) |
| Daily Shutdown flow (UC10, Step 4) | "Rate your day" — same 5-emoji selector |
| Unified Day View | Display only (shows mood for that day if recorded) |
| Insights Monthly heatmap | Color cells by mood: green gradient (Great→Good→Okay) to red gradient (Low→Rough) |

---

# Use Case 10: Daily Shutdown Ritual

## 10.1 The Problem

There's no "end of day" experience in Kaivoo. Users open the app, write, check things off, and close it. There's no sense of closure, no forward planning, and no habit loop that pulls them back tomorrow. Sunsama's daily shutdown ritual has the highest engagement of any feature in the productivity app space — 70%+ daily return rates.

## 10.2 The Scenario

> It's 9pm. Kai opens Kaivoo and sees a gentle prompt: "Ready to wrap up your day?" He taps it and enters a 60-second flow: review what he accomplished, reschedule 2 unfinished tasks to tomorrow, glance at tomorrow's calendar, rate his mood. A satisfying completion animation plays. He closes the app feeling organized and calm.

## 10.3 Proposed Solution: 4-Step Shutdown Flow

```
TRIGGER:
  - Manual: "Shutdown" button in navigation or Unified Day View
  - Auto-prompt: After 8pm (configurable), show subtle banner:
    "Ready to wrap up? [Start Shutdown]  [Not yet]"
  - Never forced. Never blocks normal app usage.

─────────────────────────────────────────────────────────────

STEP 1 — REVIEW TODAY
┌──────────────────────────────────────────────────────────┐
│  Today's Review                              Step 1 of 4 │
│                                                          │
│  ✅ 5 tasks completed                                    │
│  ✅ 4/6 routines done                                    │
│  📝 2 journal entries (523 words)                         │
│  📅 3 meetings attended                                   │
│                                                          │
│  "Nice work. You completed more tasks than yesterday."    │
│                                                          │
│                                      [Continue →]        │
└──────────────────────────────────────────────────────────┘

─────────────────────────────────────────────────────────────

STEP 2 — HANDLE UNFINISHED
┌──────────────────────────────────────────────────────────┐
│  Unfinished Business                         Step 2 of 4 │
│                                                          │
│  These tasks were due today but aren't done:             │
│                                                          │
│  ○ Review competitor pricing                             │
│    [→ Tomorrow] [→ This Week] [✓ Done] [✕ Drop]         │
│                                                          │
│  ○ Draft weekly newsletter                               │
│    [→ Tomorrow] [→ This Week] [✓ Done] [✕ Drop]         │
│                                                          │
│  ↑ One tap per task. No forms, no date pickers.          │
│                                                          │
│                                      [Continue →]        │
└──────────────────────────────────────────────────────────┘

─────────────────────────────────────────────────────────────

STEP 3 — PREVIEW TOMORROW
┌──────────────────────────────────────────────────────────┐
│  Tomorrow at a Glance                        Step 3 of 4 │
│                                                          │
│  📅 Meetings:                                             │
│    9:00  Team Standup (Google Calendar)                   │
│    2:00  Client Presentation (Teams)                     │
│                                                          │
│  📋 Tasks due:                                            │
│    ○ Review competitor pricing (rescheduled from today)  │
│    ○ Send invoice to client                              │
│                                                          │
│  💡 Routines: 6 scheduled                                │
│                                                          │
│  [+ Add task for tomorrow]                               │
│                                                          │
│                                      [Continue →]        │
└──────────────────────────────────────────────────────────┘

─────────────────────────────────────────────────────────────

STEP 4 — RATE & CLOSE
┌──────────────────────────────────────────────────────────┐
│  One last thing...                           Step 4 of 4 │
│                                                          │
│  How was today?                                          │
│                                                          │
│    😊        🙂        😐        😔        😞           │
│   Great     Good     Okay      Low     Rough            │
│                                                          │
│  Today in one sentence (optional):                       │
│  ┌──────────────────────────────────────────────┐        │
│  │ Productive day, got the design review done    │        │
│  └──────────────────────────────────────────────┘        │
│                                                          │
│                                   [Complete Shutdown ✓]  │
└──────────────────────────────────────────────────────────┘

─────────────────────────────────────────────────────────────

COMPLETION STATE:
┌──────────────────────────────────────────────────────────┐
│                                                          │
│                      ✓                                   │
│                                                          │
│              Day complete.                               │
│          See you tomorrow.                               │
│                                                          │
│   (satisfying animation — checkmark draws in,            │
│    subtle celebration, then fade to calm)                 │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

## 10.4 Key Design Decisions

```
1. TOTAL TIME TARGET: 30-60 SECONDS
   - Steps 1 and 3 are view-only (just scan and continue)
   - Step 2 requires one tap per unfinished task (max 2-3 tasks typically)
   - Step 4 is one tap for mood + optional sentence
   - If there are no unfinished tasks, Step 2 is auto-skipped

2. NEVER PUNITIVE
   - Step 1 always leads with what was accomplished, not what's missing
   - The tone is "nice work" not "you missed 2 routines"
   - Skippable at any step — user can bail without guilt

3. DATA STORED
   - Daily summary record: { date, tasks_completed, tasks_rolled, mood_score,
     one_liner, shutdown_completed_at }
   - Rolled tasks get their due date updated automatically
   - Mood feeds into correlation engine (same as UC9)

4. WHEN TO SHOW AUTO-PROMPT
   - Default: 8:00 PM (configurable in Settings)
   - Only shows if user hasn't already completed shutdown today
   - Shows as a non-blocking banner, not a modal
   - Dismissed with one tap if not ready

5. WHERE IT LIVES
   - Accessible from: sidebar navigation "Shutdown" item,
     Unified Day View footer, Dashboard widget
   - Not a separate "page" — it's a modal/drawer overlay
```

---

# Use Case 11: Automated Correlation Discovery

## 11.1 The Problem

The Insights page shows metrics in isolation: routine completion %, task count, journal streak. But users want to know *why* some days feel better or more productive than others. No personal productivity tool currently surfaces cross-metric correlations. Exist.io did this before shutting down and it was their most loved feature.

## 11.2 The Scenario

> Kai has been using Kaivoo for 6 weeks. He opens his Monthly Insights view and sees a new section: "Discoveries." The first card reads: "On days you do your morning routine, you complete 40% more tasks." The second: "Your mood is 'Great' on 80% of days you journal before 9am." He's never noticed these patterns himself. This is why he uses Kaivoo.

## 11.3 Proposed Solution: Nightly Correlation Engine

```
HOW IT WORKS:

1. DAILY DATA NORMALIZATION (runs at midnight or on app open)
   For each day with data, compute:
   ┌────────────────────────────────────────────────────────┐
   │  Metric                    │ Type    │ Example          │
   │────────────────────────────│─────────│──────────────────│
   │  routine_completion_rate   │ 0.0-1.0 │ 0.83 (5/6)      │
   │  tasks_completed           │ count   │ 7                │
   │  tasks_created             │ count   │ 3                │
   │  journal_entries           │ count   │ 2                │
   │  words_journaled           │ count   │ 523              │
   │  mood_score                │ 1-5     │ 4 (Good)         │
   │  meetings_attended         │ count   │ 3                │
   │  captures_created          │ count   │ 1                │
   │  first_activity_time       │ hour    │ 7.5 (7:30 AM)    │
   │  specific_routine_done     │ 0/1     │ per routine ID   │
   └────────────────────────────────────────────────────────┘

2. CORRELATION ANALYSIS (runs weekly or on-demand)
   - Pearson correlation between every metric pair
   - Filter: |r| > 0.3 AND p-value < 0.05
   - Minimum 14 data points required before showing results
   - Re-run weekly as data accumulates (correlations get stronger/weaker)

3. NATURAL LANGUAGE GENERATION
   Template-based v1:
   ┌────────────────────────────────────────────────────────┐
   │  Template                                              │
   │──────────────────────────────────────────────────────── │
   │  "On days you {A}, you {B} {X}% {more/less}"          │
   │  "Your mood tends to be {better/worse} on days you {A}"│
   │  "{A} and {B} tend to go together"                     │
   │  "You're most productive on {day of week}"             │
   │  "Your {metric} is trending {up/down} this month"      │
   └────────────────────────────────────────────────────────┘

   LLM-generated v2 (Phase 4):
   Send top correlations to Concierge for narrative generation
   "Based on 6 weeks of data, here's what I notice about your patterns..."

4. SURFACING
   ┌──────────────────────────────────────────────────────────┐
   │  DISCOVERIES THIS MONTH                                  │
   │                                                          │
   │  💡 On days you exercise, you complete                   │
   │     40% more tasks  (r=0.45, 28 data points)            │
   │                                                          │
   │  💡 Your mood is "Great" on 80% of days                  │
   │     you journal before 9am                               │
   │                                                          │
   │  💡 You're most productive on Tuesdays                   │
   │     (avg 8.2 tasks completed vs 5.1 overall)             │
   │                                                          │
   │  💡 Morning meditation correlates with                   │
   │     23% higher routine completion rate                   │
   │                                                          │
   │  [See all correlations →]                                │
   └──────────────────────────────────────────────────────────┘
```

## 11.4 Where Correlations Appear

| Location | What's shown |
|----------|-------------|
| Monthly Insights | "Discoveries this month" section (top 3-5 correlations) |
| Quarterly Insights | "Your top patterns this quarter" with trend arrows |
| Daily Shutdown (Step 1) | Occasional: "Fun fact: today was a high-productivity day — you also exercised today." |
| Concierge (Phase 4+) | Answerable: "What helps me be more productive?" → pulls from correlation data |

## 11.5 Privacy & Data

```
- All correlation computation happens locally (Hub server or in-browser)
- No data leaves the device
- Raw data stays in SQLite/local store
- Correlation results cached for fast Insights page load
- User can delete correlation data without deleting source data
- "Discoveries" section can be hidden in Settings
```

## 11.6 Prerequisites

| Prerequisite | Sprint/Phase | Status |
|-------------|-------------|--------|
| Mood tracking (UC9) | Sprint 1 | Designed |
| 14+ days of data | — | User-dependent |
| Daily metrics normalization | Sprint 2 | New item |
| Correlation analysis logic | Phase 3-6 | New item |
| Natural language templates | Phase 3 | New item |

---

# Appendix: Open Questions

## Answered by Research (Agent 5 — Sprint 0 Findings)

```
Q1: What's the optimal time limit for retroactive routine backdating?
    ANSWER: 7 days with one-tap toggle + toast confirmation.
    Beyond 7 days: toggle + confirmation dialog.
    Based on Streaks (zero friction, any past day) and Done (same).
    For a personal tool, trust the user. 7-day default is configurable.
    See Part 4 of Research Brief for full pattern.

Q2: For the Unified Day View, clock times or chronological list?
    ANSWER: Chronological list (not clock-positioned timeline).
    Structured uses clock-positioned timeline (24-hour vertical) which
    works great on tablet/desktop but wastes space on mobile when
    meetings are sparse. Sunsama uses chronological list and it
    works on all screen sizes. Start with chronological list.
    Consider clock-positioned as an optional "Timeline mode" later.

Q3: Minimum data history for zoom levels?
    ANSWER: Show tabs but with empty states.
    Monthly: "Keep using Kaivoo for 2 more weeks to see monthly trends."
    Quarterly: "You'll see quarterly insights after your first full month."
    This is better than hiding tabs (users discover features by seeing them).
    Minimum for correlations: 14 data points (Finding 6).

Q4: Google Calendar first, or both at launch?
    ANSWER: Google Calendar first. Microsoft Graph in fast-follow.
    Google is most common, better documented, webhooks last 30 days
    (vs 3 days for Microsoft). See Part 2 of Research Brief.

Q5: Processing time for 45-min video on Mac Mini?
    ANSWER: ~5-10 minutes with faster-whisper medium on Apple Silicon.
    Acceptable UX: show "Processing... estimated ~8 min" with progress bar.
    Cloud alternative: AssemblyAI LeMUR does it in ~2-3 min for $0.05-0.10.
    Offer both: local (free, slower) and cloud (BYOK, faster). See Finding 4.

Q6: How important is Audio Overview (podcast feature)?
    ANSWER: Nice-to-have, not core. Text summaries first.
    NotebookLM's Audio Overview is impressive but technically complex
    (requires TTS model fine-tuning for conversational style).
    Priority: text summaries → structured Q&A → audio overview (Phase 8+).
```

## Still Open

```
Q7: For Connected Context, is same-day proximity sufficient?
    PARTIALLY ANSWERED: Same-day is the v1 heuristic. Good enough
    for most cases. Phase 4+ adds AI-powered linking that can
    cross day boundaries (e.g., task created Tuesday about Monday's
    meeting) using semantic similarity of content.

Q8: Should the Daily Shutdown auto-prompt time be based on
    user's typical last-activity time, or a fixed configurable time?
    (e.g., if user typically finishes at 6pm, prompt at 6:30pm
    vs fixed 8pm default)

Q9: For mood tracking, should we support custom mood labels
    beyond the default 5? Some users might want "Energized",
    "Anxious", "Focused" etc. Or keep it simple with 5 states?

Q10: For the correlation engine, should correlations that weaken
     over time be auto-removed, or kept with a "no longer significant"
     indicator? Users might want to see what USED to correlate.
```
