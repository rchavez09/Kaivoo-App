# Feature Use Case Bible

**Version:** 0.4 (Today Page Bible — settings extracted)
**Status:** COMPLETE — All questions resolved, settings moved to `Feature-Bible-Settings.md`
**Scope:** TODAY PAGE ONLY — see `Feature-Bible-Index.md` for all Bibles
**Compiled by:** The Director + Agent 6 (Usability Architect)
**Date:** February 22, 2026
**Purpose:** Define what every page and widget does, how it's used in real life, what "working" looks like, and what must never be lost. This document is the contract for Sprint 3 and all future sprints.

---

## How to Read This Document

Each section follows this structure:

1. **What It Is** — One-sentence definition
2. **The Real Use Case** — How the user actually uses this in daily life (not theory)
3. **What Worked** — Features that are proven and must be preserved
4. **What Didn't Work** — Features that failed in practice and why
5. **What It Should Become** — The evolved design, informed by real usage
6. **Interaction Spec** — Concrete behaviors, states, and edge cases
7. **Must-Never-Lose Checklist** — The regression contract

---

# TODAY PAGE

## Identity

**Today is your command center.** It is the home screen. It answers one question: *"What do I need to do right now?"*

Today is not a timeline. It is not a read-only summary. It is an interactive, widget-based dashboard where you can see, act, and move on. You should be able to open Today, spend 30 seconds scanning your day, and know exactly where you stand.

**Core principle:** Glanceable first, actionable second, beautiful third. If you can't get the picture in under 5 seconds, the design has failed.

---

## Page Layout

The Today page is a widget-based dashboard. Widgets are distinct, focused cards — each one does one job well. The layout is responsive: on desktop, widgets arrange in a 2-column grid; on mobile, they stack vertically.

```
┌─────────────────────────────────────────────────────────────────┐
│  TODAY — Saturday, February 22, 2026          [< >] [Calendar]  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─── Day Brief ──────────────────────────────────────────────┐ │
│  │  Full-width at the top. Your morning briefing.             │ │
│  │  3 insight chips + AI summary + mood selector              │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ┌─── Tasks ───────────────┐  ┌─── Routines ────────────────┐ │
│  │  Due Today (3)       ▼  │  │  ☀️ Morning    ████░░ 4/6   │ │
│  │  □ Review PR #42       │  │  🧘 Meditate    ✅            │ │
│  │  □ Update docs         │  │  💪 Exercise    ✅            │ │
│  │  □ Fix login bug       │  │  📖 Read 30min  ✅            │ │
│  │                         │  │  ☕ No coffee   ○             │ │
│  │  Overdue (1)         ▼  │  │  📝 Journal    ✅            │ │
│  │  □ Send invoice        │  │  🌙 Evening Walk ○            │ │
│  │                         │  │                              │ │
│  │  High Priority (2)   ▼  │  │  [+ Add Routine]            │ │
│  │  □ Client proposal     │  │                              │ │
│  │  □ Budget review       │  │                              │ │
│  │                         │  │                              │ │
│  │  Due This Week (5)   ▼  │  │                              │ │
│  │  (collapsed)           │  │                              │ │
│  └─────────────────────────┘  └──────────────────────────────┘ │
│                                                                 │
│  ┌─── Today's Schedule ───────────────────────────────────────┐ │
│  │  (Only shows if calendar sources are connected)            │ │
│  │  9:00  Team Standup        🟢 Work Google Cal   30min     │ │
│  │  11:00 Design Review       🟣 Teams             1hr      │ │
│  │  2:00  Client Call         🟠 Manual             1hr      │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                 │
│  [Begin Daily Shutdown]                                         │
│                                                                 │
│                                              💬 (floating chat) │
└─────────────────────────────────────────────────────────────────┘
```

**What is NOT on the Today page:**
- Journal entry creation (moved to Journal page — see Journal section)
- AI Inbox widget (replaced by floating chat icon)
- Captures list (captured via floating chat, processed elsewhere)

**What IS on the Today page:**
- Day Brief widget (top, full-width)
- Tasks widget (main column) — evolves into Task + Timeline fusion in Sprint 4+
- Routines widget (side column)
- Today's Schedule widget (full-width, conditional on calendar integration) — merges into Task + Timeline fusion in Sprint 4+
- Daily Shutdown trigger (bottom)
- Floating AI chat icon (bottom-right corner)

---

## Widget 1: Day Brief

### What It Is

Your morning briefing. A full-width card at the top of Today that gives you a glanceable summary of your day in 3 seconds, plus AI-powered context to help you make better decisions.

### The Real Use Case

You wake up, open Kaivoo. The Day Brief immediately tells you:
- **Tasks: 0/3 completed** — you have 3 tasks due today
- **Meetings: 5 today** — it's a packed meeting day
- **Routines: 2/6 done** — you've done your morning meditation and exercise

With that information alone, you realize: *"I have 5 meetings and 3 tasks. I need to move some tasks to tomorrow — I won't have time for all of them on a day this busy."* The Day Brief helped you make that call in under 5 seconds.

The AI adds: *"Busy meeting day ahead — you might want to keep tasks to 1-2 essentials. Your journaling streak is at 8 days. Yesterday's entry mentioned the client presentation is stressing you out — take it one step at a time."*

If the AI has nothing meaningful to add, it falls back to a configurable default (see AI Summary Settings below). By default, this is an inspiring quote of the day — but the user controls this entirely.

### What Worked (Pre-Sprint 2)

- **Three insight chips** — Tasks X/Y, Meetings count, Routines X/Y
- **Live updating** — When you complete a task or routine, the chips update in real-time
- **Progress bar** — Visual sense of "how far through my day am I?"
- These three things together made it the fastest way to gauge your day

### What Was Missing

- **AI integration** — No intelligence layer. Just raw numbers.
- **Mood tracking** — No way to set how you're feeling
- **Goal awareness** — No connection to your bigger picture

### What It Should Become

The Day Brief evolves into three zones:

```
┌─────────────────────────────────────────────────────────────────┐
│  DAY BRIEF                                                      │
│                                                                 │
│  ZONE 1: INSIGHT CHIPS (live-updating)                          │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐            │
│  │  📋 Tasks     │ │  📅 Meetings  │ │  🔄 Routines │            │
│  │  1/3 done    │ │  5 today     │ │  2/6 done    │            │
│  │  ████░░░░    │ │              │ │  ████░░░░░░  │            │
│  └──────────────┘ └──────────────┘ └──────────────┘            │
│                                                                 │
│  ZONE 2: AI SUMMARY                                             │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  💡 "Busy meeting day ahead — consider keeping tasks    │    │
│  │  to 1-2 essentials. Your journaling streak is at 8      │    │
│  │  days — nice momentum!"                                 │    │
│  │                                                         │    │
│  │  Fallback: "The secret of getting ahead is getting      │    │
│  │  started." — Mark Twain                                 │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                 │
│  ZONE 3: MOOD SELECTOR                                          │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  How are you feeling?                                   │    │
│  │  😊 Great   🙂 Good   😐 Okay   😔 Low   😞 Rough     │    │
│  │                                     Currently: 🙂 Good  │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Zone 1: Insight Chips (Preserved from Pre-Sprint 2)

Three chips, always visible, always live-updating:

| Chip | Shows | Live Update Trigger |
|------|-------|-------------------|
| Tasks | X/Y completed today | Task completed or created with today's due date |
| Meetings | N meetings today | Meeting added/removed for today |
| Routines | X/Y done today | Routine toggled |

Each chip has a subtle progress bar beneath it. The Tasks chip fills as you complete tasks. The Routines chip fills as you check off routines. The Meetings chip is count-only (no progress bar — meetings aren't "completable").

**Clicking a chip** scrolls to the relevant widget below (Tasks chip → Tasks widget, etc.).

### Zone 2: AI Summary

The AI summary provides contextual intelligence about your day. It draws from:

| Data Source | Example Insight |
|------------|----------------|
| Task load vs. meeting load | "You have 5 meetings and 8 tasks today — consider moving some tasks to tomorrow when you're free." |
| Routine streaks | "Your meditation streak is at 12 days — longest ever!" |
| Journal patterns | "You mentioned feeling stressed about the presentation yesterday. Remember: one step at a time." |
| Mood trends | "You've been in a good mood 4 days running. Keep it up." |
| Goal context | "This week's focus: finish the client proposal. You're 2/4 subtasks in." |
| Day-of-week patterns | "Tuesdays are usually your most productive day — lean into it." |

**Priority cascade:** The AI picks the most relevant 1-2 insights. If nothing meaningful exists (new user, no patterns yet), fall back to the user's configured default (see Settings below).

**AI summary is read-only.** You scan it, you internalize it, you move on. No interaction needed.

#### AI Summary Settings

The user has full control over what the AI sees, what it does, and what happens when it has nothing to say. Settings include: master enable/disable toggle, fallback content when no insights (quote, custom prompt, or nothing), AI data access toggles (journal, mood, tasks, routines, meetings, chat), and insight generation frequency.

**Full settings spec:** See `Feature-Bible-Settings.md` → Day Brief AI section.

#### AI Architecture: The Daily Digest Pipeline

**Note for Agent 3 (Architect):** The AI Summary should be a lightweight consumer, not a heavyweight processor. The architecture should follow a pipeline pattern:

```
DAILY DIGEST PIPELINE:

1. DAILY DIGEST FILE (auto-generated, not AI)
   Every day, the system generates a structured markdown file:
   ~/Kaivoo/Digests/2026-02-22.md

   Contents (auto-populated from app data):
   ┌────────────────────────────────────────────────────────┐
   │  # Daily Digest — February 22, 2026                    │
   │                                                        │
   │  ## Tasks                                               │
   │  - Completed: Deploy staging, Review budget             │
   │  - Created: Fix login bug                               │
   │  - Moved to tomorrow: Send invoice                      │
   │  - Subtasks completed: 3                                │
   │                                                        │
   │  ## Meetings                                            │
   │  - 9:00 Team Standup (30min)                            │
   │  - 11:00 Design Review (1hr)                            │
   │  - 2:00 Client Presentation (1.5hr)                     │
   │                                                        │
   │  ## Routines                                            │
   │  - Completed: Meditate, Exercise, Read, Journal (4/6)   │
   │  - Missed: No coffee, Evening walk                      │
   │  - Streak: Meditate 12 days, Read 8 days                │
   │                                                        │
   │  ## Mood Timeline                                       │
   │  - 8:15 AM → Great                                      │
   │  - 2:30 PM → Low                                        │
   │  - 8:45 PM → Good                                       │
   │                                                        │
   │  ## AI Conversations                                    │
   │  - "Remind me to add a slide to Friday presentation"    │
   │    → Created subtask under Friday Presentation          │
   │  - "Just got out of yoga! Feeling great!"               │
   │    → Marked Exercise complete, mood set to Great         │
   │                                                        │
   │  ## Daily Shutdown                                      │
   │  - Completed at 9:15 PM                                 │
   │  - Mood: Good                                           │
   │  - One-liner: "Productive day, got design review done"  │
   │  - Tasks rolled to tomorrow: Send invoice               │
   │                                                        │
   │  ## Journal Summary                                     │
   │  - 2 entries, 523 words total                           │
   │  - Topics: work, stress, client presentation            │
   └────────────────────────────────────────────────────────┘

   This file is NOT generated by AI — it's a structured data export.
   It gets created/updated throughout the day as events happen.
   It's the single source of truth for "what happened today."

2. AI REVIEW (lightweight, scheduled)
   A small, fast AI model (not the heavy orchestrator) reads
   the Daily Digest file and generates the Day Brief message
   for the NEXT day.

   Schedule: Configurable — default 11:00 PM daily
   Options: Daily (11pm, 2am, 6am — user picks), Weekly, Monthly

   Input: Today's digest file + last 7 days of digests (for trends)
          + user's AI data access settings (respects toggles)
   Output: 1-2 sentence insight stored in a brief_cache

   This is a LIGHTWEIGHT call — the digest file is small,
   the prompt is simple, the model can be small (Haiku-class).
   It does NOT need to read raw journal entries or full task
   histories — the digest file is the pre-processed summary.

3. DAY BRIEF DISPLAY (instant, no AI call)
   When the user opens Today, the Day Brief reads from
   brief_cache — no live AI call, no latency, instant display.
   The AI already ran overnight and produced the message.

   If no cached brief exists (first day, AI disabled, etc.),
   fall back to the user's configured default.
```

**Why this architecture matters:**
- The Daily Digest file is useful beyond the Day Brief — it feeds the correlation engine (UC11), the Concierge (Phase 4), and future analytics
- The AI review is a scheduled background job, not a blocking UI call — the Today page loads instantly
- The model choice for the review step should be lightweight and fast — this is a Haiku-class job, not an Opus-class job. Agent 3 should spec the exact model routing.
- Users who want weekly instead of daily reviews just change the schedule — the digest files still accumulate daily

**Phase dependency:** Full AI review pipeline requires Phase 4 (Concierge + model routing). For Sprint 3, implement:
- The Daily Digest file generation (structured data export — no AI needed)
- Template-based Day Brief (no AI, just rules):
  - If meetings > 4: "Busy meeting day — keep tasks light."
  - If routine streak > 3: "Your [routine] streak is at X days!"
  - If overdue tasks > 0: "You have X overdue tasks — might want to tackle those first."
  - Default: user's configured fallback (inspiring quote by default)

### Zone 3: Mood Selector — Dynamic Throughout the Day

**This is a key evolution from Agent 6's original UC9 design.** Mood is not a once-per-day snapshot. It's dynamic. You can change it as your day unfolds.

**The scenario:**
> You wake up feeling great → set mood to 😊 Great.
> Afternoon: terrible meeting → come back and change to 😔 Low.
> Evening: you journal, get your feelings out → change to 🙂 Good.

**The system tracks all mood changes for the day:**

```
Mood Timeline (stored per day):
┌──────────────────────────────────────────────┐
│  8:15 AM   → 😊 Great                        │
│  2:30 PM   → 😔 Low                          │
│  8:45 PM   → 🙂 Good                         │
└──────────────────────────────────────────────┘
```

**Data model:**
```
mood_entries table:
  id, user_id, date, mood_score (1-5), recorded_at (timestamp)

One row per mood change. Multiple rows per day are expected.
Daily summary: latest mood_score is the "current" mood.
Full history: all entries for correlation analysis.
```

**AI insight from mood data:**
> "I noticed you were in a good mood this morning and dropped to low after your 2:00 PM client call. You bounced back after journaling tonight. Journaling might be something that helps your mood."

This is the kind of insight that makes Kaivoo different from every other productivity app. It connects the dots between your activities and how you feel.

**Interaction — In the Day Brief:**
- Mood selector is always visible in the Day Brief
- Current mood is highlighted (subtle glow or filled state)
- Tapping a different mood saves immediately (no confirmation)
- Micro-animation: the selected emoji subtly pulses, then settles
- "Currently: 🙂 Good" label updates
- If you've already set a mood today, the selector shows your current selection but remains tappable

**Interaction — Via Chat / Telegram (Natural Language Mood + Actions):**

Mood and routine completions aren't limited to tapping buttons in the app. The floating chat (and future Telegram bot) should understand natural language that implies mood and actions.

**The scenario:**
> You just finished your yoga class. You pull out your phone and text the Kaivoo chat (or Telegram bot): "Hey, just got out of my yoga class! Feeling great! :)"

The orchestrator interprets this and does two things:
1. **Marks the Exercise/Yoga routine as complete** (if the user has a matching routine)
2. **Sets mood to Great** on the app

The response: *"Nice! Marked your Yoga routine as done and set your mood to Great. Keep it up!"*

This interaction gets saved in the Daily Digest file:
```
## AI Conversations
- 10:15 AM: "Just got out of my yoga class! Feeling great!"
  → Marked Yoga routine complete
  → Mood set to Great
```

The next morning's Day Brief could then say: *"Your mood was great after yoga yesterday! Exercise seems to boost your mood — keep it up."*

**More examples of natural language actions:**

| User says | Orchestrator does |
|-----------|------------------|
| "Just meditated for 20 minutes, feeling calm" | Mark Meditation routine complete, set mood to Good |
| "Terrible meeting with the client. I'm frustrated." | Set mood to Low. No routine action. |
| "Done with my run! 5K today" | Mark Exercise routine complete, set mood based on tone (Great) |
| "Heading to bed, exhausted" | Could trigger Daily Shutdown prompt or set mood to Low |
| "Feeling so much better after journaling" | Set mood to Good. Note correlation: journaling → mood improvement |

**Key rules:**
- Routine matching is fuzzy — "yoga class" matches a "Yoga" or "Exercise" routine
- Mood inference is tone-based — "Feeling great!", "awesome", "so good" → Great; "frustrated", "exhausted", "terrible" → Low
- The orchestrator always confirms what it did — no silent actions
- If ambiguous, the orchestrator asks: *"Want me to mark your Exercise routine as done?"*
- All of this feeds into the Daily Digest file and the correlation engine

**Phase dependency:** Full natural language understanding requires Phase 4 (Concierge). For Sprint 3, the floating chat handles explicit commands only ("mark yoga done", "set mood to great"). Implicit understanding ("Just got out of yoga! Feeling great!") comes with the Concierge.

**What it must never become:**
- Mandatory (always optional, never nag)
- A blocker (never prevents you from doing other things)
- Cluttered (5 options max, simple emoji, one tap)

### Must-Never-Lose Checklist: Day Brief

- [ ] Three insight chips (Tasks, Meetings, Routines) visible at top of Today
- [ ] Chips show live counts that update when data changes
- [ ] Progress bars on Tasks and Routines chips
- [ ] Clicking a chip scrolls to the relevant widget
- [ ] Mood selector visible and functional
- [ ] Mood can be changed multiple times per day
- [ ] All mood changes are recorded with timestamps
- [ ] AI summary (or quote fallback) displays below chips

---

## Widget 2: Tasks

### What It Is

Your task command center. The most important and most-used widget on the Today page. Shows your tasks organized in configurable, collapsible sections with powerful filtering.

### The Real Use Case

You open Today. The Tasks widget shows:
- **Due Today (3)** — expanded, showing your 3 tasks for today
- **Overdue (1)** — expanded, red flag, you need to deal with this
- **High Priority (2)** — expanded, these are important even if not due today
- **Due This Week (5)** — collapsed, you'll get to these later

You scan the Due Today section, check off "Deploy staging" with one tap, and it moves to the Completed section (collapsed by default so it's out of your way). The Day Brief chip updates: Tasks 1/3.

You realize the overdue invoice is blocking other work, so you tap it, add a subtask "Get PO number from Sarah," and set it to high priority. Done.

Then you switch the filter to "Work" topic only — now you see only work-related tasks. You switch to "Kaivoo" — now you see only Kaivoo tasks. You add a #ppt hashtag filter — now you see only presentation tasks. This filtering is how you focus when context-switching between responsibilities.

### What Worked (Pre-Sprint 2) — CRITICAL TO RESTORE

This widget was the **bread and butter** of daily use. Everything about it worked. Changing it was a mistake.

**Configurable sections with dropdowns:**

| Section | Default State | What It Shows |
|---------|--------------|---------------|
| Due Today | Expanded | Tasks where dueDate = today |
| Overdue | Expanded | Tasks where dueDate < today and not completed |
| High Priority | Expanded | Tasks with priority = high, regardless of due date |
| Due This Week | Collapsed | Tasks where dueDate is within current week |
| Completed | Collapsed | Tasks completed today |

Sections are collapsible dropdown menus — this keeps the widget compact. If you have 0 overdue tasks, the Overdue section can be hidden entirely (via settings). If you have 15 "Due This Week" tasks, they're collapsed so they don't overwhelm your Today view.

**Filtering by topic and hashtag:**

| Filter Type | Example | Behavior |
|------------|---------|----------|
| Topic | "Work", "Kaivoo", "Personal" | Show only tasks tagged with that topic |
| Hashtag | #video, #ppt, #email | Show only tasks with that hashtag |
| Combined | Topic: "Work" + Hashtag: #ppt | Show only work presentations |

This filtering was easy to use and extremely practical for context-switching.

**Settings (per-widget configuration):**

Configurable via gear icon in widget header: hide empty sections, show/collapse completed tasks, collapse sections by default, toggle visible sections. All changes apply immediately — no "Save" button.

**Full settings spec:** See `Feature-Bible-Settings.md` → Tasks Widget section.

### What Was Lost in Sprint 2

Sprint 2 replaced this with a flat `TaskPanel` that only has:
- Pending tasks (flat list)
- Completed tasks (single section)
- No configurable sections
- No topic/hashtag filtering
- No settings panel
- No dropdown collapsing

**This is the #1 priority regression to fix.** The TaskPanel is useful as a component for the Unified Day View (if used elsewhere), but the Today page needs the full TasksWidget back.

### What It Should Become

**Sprint 3:** Restore the pre-Sprint 2 TasksWidget core — all configurable sections, topic/hashtag filtering, settings panel. This is non-negotiable and the #1 priority.

**Sprint 4+:** Evolve the Tasks widget into something even better by fusing it with a Day Timeline to create a **time-blocking planning surface.** This is the big idea below.

**Improvements included in Sprint 3 restore:**

1. **Quick add at the top** — A text input at the top of the widget: "Add a task..." → creates a task due today with one keystroke (Enter). Already existed, keep it.

2. **Subtask preview** — Show "2/4 subtasks" beneath a task title. Tapping expands to show subtasks inline.

---

### The Big Evolution: Task + Timeline Fusion (Sprint 4+)

**The insight:** The old Calendar/Schedule widget was dead space because meetings were manual. But the Tasks widget was the most-used feature. What if instead of being separate widgets, they became two halves of one planning surface?

**The concept: Time-blocking.** Your unscheduled tasks live in the task widget (always visible). Your calendar events live in a timeline view. You enter "Schedule Mode" to bring up the timeline and drag tasks into specific time slots. Once scheduled, you've planned *when* to do each thing.

This is the killer feature of Sunsama and Motion. But we can do it better because it lives inside the command center alongside routines, mood, and the AI brief — not in a separate app.

**Important layout decision:** The default Today page is tasks on top, schedule/timeline below — NOT side-by-side. Side-by-side is a planning mode you enter intentionally. Not everyone time-blocks their tasks, and the default view should feel natural for people who just want their task list and a quick glance at their calendar.

**Note for Agent 1 (UX Designer):** The exact layout and transitions for Schedule Mode need proper design exploration. The side-by-side planning view might work great on desktop but needs a different treatment on mobile. Consider slide-in drawer, full-screen planning mode, or swipe-between panels. This is a Sprint 4+ design task — please spec the UX before engineering begins.

#### Default View (What Most People See)

```
TODAY PAGE — DEFAULT LAYOUT

┌─── Day Brief ──────────────────────────────────────────────────┐
│  [insight chips] [AI summary] [mood]                           │
└────────────────────────────────────────────────────────────────┘

┌─── Tasks ──────────────────────┐  ┌─── Routines ──────────────┐
│  Due Today (3)              ▼  │  │  ☀️ Morning     ███░ 3/4  │
│  □ Review PR #42               │  │  🧘 ✅  💪 ✅  📖 ✅  ☕   │
│  □ Update docs                 │  │                            │
│  □ Fix login bug               │  │  🌙 Evening     ██░░ 2/3  │
│  Overdue (1)               ▼  │  │  📝 ✅  🦷 ✅  🚶         │
│  □ Send invoice                │  │                            │
│  ...                           │  │  🔥 75 Hard      ███░ 3/5 │
└────────────────────────────────┘  └────────────────────────────┘

┌─── Today's Schedule ──────────────────────────────────────────┐
│  9:00  Team Standup  🟢 Google · 30m                          │
│  11:00 Design Review 🟣 Teams · 1hr                           │
│  2:00  Client Call   🟠 Manual · 1hr                          │
│                                           [📅 Schedule Mode]  │
└───────────────────────────────────────────────────────────────┘

[Begin Daily Shutdown]                                    💬
```

Tasks on top. Schedule on bottom. Clean, focused, familiar. The **[Schedule Mode]** button in the calendar widget header is how you enter the planning view.

#### Schedule Mode (Time-Blocking Planning View)

When you tap **[Schedule Mode]**, the layout transforms into a side-by-side planning surface:

```
SCHEDULE MODE — PLANNING VIEW

┌─── Unscheduled Tasks ──────────┐  ┌─── Day Timeline ──────────────────┐
│                                │  │                                    │
│  + Add a task...               │  │  7:00                              │
│                                │  │  ┊                                 │
│  Due Today (3)              ▼  │  │  8:00  ┌──────────────────────┐   │
│  ┌─────────────────────────┐   │  │        │ ☀️ Morning Routines  │   │
│  │ □ Review PR #42    ⚡   │ ──│──│──drag──→│ (routine block)      │   │
│  │ □ Update docs           │   │  │  8:30  └──────────────────────┘   │
│  │ □ Fix login bug         │   │  │  ┊                                 │
│  └─────────────────────────┘   │  │  9:00  ┌──────────────────────┐   │
│                                │  │        │ 📅 Team Standup      │   │
│  Overdue (1)               ▼  │  │        │ 🟢 Google Cal · 30m  │   │
│  □ Send invoice                │  │  9:30  └──────────────────────┘   │
│                                │  │  ┊                                 │
│  High Priority (2)         ▼  │  │  10:00 ┌──────────────────────┐   │
│  □ Client proposal             │  │        │ 📋 Review PR #42     │   │
│  □ Budget review               │  │        │ (scheduled task) 30m │   │
│                                │  │  10:30 └──────────────────────┘   │
│  Due This Week (5)         ▼  │  │  ┊                                 │
│  (collapsed)                   │  │  11:00 ┌──────────────────────┐   │
│                                │  │        │ 📅 Design Review     │   │
│  Completed                 ▼  │  │        │ 🟣 Teams · 1hr       │   │
│  (collapsed)                   │  │  12:00 └──────────────────────┘   │
│                                │  │  ┊                                 │
│                                │  │  12:30  (free — lunch)             │
│                                │  │  ┊                                 │
│                                │  │  1:00  ┌──────────────────────┐   │
│                                │  │        │ 📋 Fix login bug     │   │
│                                │  │        │ (scheduled task) 2hr │   │
│                                │  │  3:00  └──────────────────────┘   │
│                                │  │  ┊                                 │
│                                │  │  3:00  ┌──────────────────────┐   │
│                                │  │        │ 📅 Client Call       │   │
│                                │  │        │ 🟠 Manual · 1hr      │   │
│                                │  │  4:00  └──────────────────────┘   │
│                                │  │  ┊                                 │
│                                │  │  5:00                              │
│  [Exit Schedule Mode]          │  │              [Day] [Week]          │
└────────────────────────────────┘  └────────────────────────────────────┘

📅 = Calendar event (from Google/Teams/manual) — read-only, can't move
📋 = Scheduled task (dragged from task list) — editable, resizable
☀️ = Routine block (optional — shows when routines are scheduled)
(free) = Unbooked gap — visible, inviting you to drag a task in
```

**How you enter and exit Schedule Mode:**
- **Enter:** Tap [Schedule Mode] button in the Schedule widget header
- **Exit:** Tap [Exit Schedule Mode] or press Escape
- **Persistence:** Scheduled tasks stay scheduled even after exiting Schedule Mode. They show a time indicator in the normal task list view: "📋 10:00-10:30"
- **Setting:** Users can set Schedule Mode as their default view if they prefer always-on time-blocking. See `Feature-Bible-Settings.md` → Schedule Mode section.

**How time-blocking works:**

| Action | What Happens |
|--------|-------------|
| **Drag task → Timeline** | Task appears as a time block at the drop position. Default duration: 30 minutes (configurable in settings). Task stays in the task list but shows a clock icon: "📋 10:00-10:30" |
| **Resize time block** | Drag the bottom edge of a scheduled task to expand or shrink. "Fix login bug" might need 2 hours — drag it from 1:00-3:00. |
| **Drag time block to move** | Pick up a scheduled task block and move it to a different time slot. |
| **Remove from timeline** | Drag back to the task list, or right-click → "Unschedule". Task returns to unscheduled state. |
| **Complete scheduled task** | Checkbox in the timeline block OR in the task list — both work, both sync. |
| **Free gap** | Gaps between events are visually clear. They're invitations: "You have 2 hours free between meetings — what will you work on?" |

**Default task duration:**
Default 30 minutes when dragging a task to the timeline. Individual tasks can be resized after placement. See `Feature-Bible-Settings.md` → Schedule Mode section for all options.

**Task states with time-blocking:**
```
UNSCHEDULED — Lives only in the task list (left side)
  "Review PR #42"

SCHEDULED — Lives in BOTH the task list AND the timeline
  Task list shows: "📋 Review PR #42  ·  10:00-10:30"
  Timeline shows: a colored block at that time slot

COMPLETED — Shown in task list's Completed section + timeline (dimmed)
  Both views update simultaneously
```

**What about tasks you DON'T want to schedule?**

Most tasks won't be time-blocked. The task list works exactly as before — all sections, filtering, settings. Time-blocking is additive. You're not forced to drag anything. The task list is the primary interface; the timeline is the planning surface for people who want to be intentional about *when* they do things.

#### Week View: Zoom Out for Weekly Planning

**The insight:** If you can see your whole week — meetings, scheduled tasks, free gaps — you can drag "Due This Week" tasks to the specific days you want to do them. This turns weekly planning from a mental exercise into a visual, drag-and-drop activity.

```
WEEK VIEW — Zoom out from Day to Week

┌─── This Week's Tasks ──────────┐  ┌─── Week Timeline ─────────────────────────────────────┐
│                                │  │        Mon     Tue     Wed     Thu     Fri             │
│  Due This Week (5)          ▼  │  │  8:00                                                  │
│  □ Client proposal             │  │  9:00  ▓stdup  ▓stdup  ▓stdup  ▓stdup  ▓stdup          │
│  □ Budget review           ──drag──→ 10:00         ░PR     ░prop.                          │
│  □ Newsletter                  │  │  11:00 ▓design         ▓1:1                            │
│  □ Update landing page         │  │  12:00                                                 │
│  □ Research competitors        │  │  1:00  ░login  ░budgt          ░lndpg                  │
│                                │  │  2:00                                                  │
│  Unscheduled Today (1)      ▼  │  │  3:00  ▓client                ▓all-h                  │
│  □ Send invoice                │  │  4:00                                                  │
│                                │  │                                                        │
│                                │  │  ▓ = Meeting    ░ = Scheduled task                     │
│                                │  │  Click any day column to zoom into Day View            │
└────────────────────────────────┘  └────────────────────────────────────────────────────────┘

Drag "Budget review" from the task list to Tuesday at 1:00 PM.
It's now scheduled: Tuesday, 1:00-1:30 PM (default 30 min).
The task's due date updates to Tuesday if it didn't have one.
```

**Week View behaviors:**

| Action | What Happens |
|--------|-------------|
| **Toggle Day/Week view** | Button in widget header: [Day] [Week]. Switches the timeline column. |
| **Drag task → specific day** | Task gets scheduled on that day at the dropped time. Due date updates if needed. |
| **Click a day column** | Zooms into the Day View for that date (uses existing date navigation) |
| **See the full picture** | All meetings from connected calendars + all scheduled tasks across the week. Instantly see: "Tuesday is packed, Thursday is wide open — I should move things to Thursday." |
| **"Due This Week" section** | In week view, the task list sidebar shows "Due This Week" expanded by default (in day view, it's collapsed). These are the tasks you're planning to drag. |

**Why this is powerful:**

The Day Brief tells you: "You have 5 meetings today and 8 tasks." That's the *problem*. The Task + Timeline fusion is the *solution*: you drag 5 of those tasks to tomorrow and Thursday when you're less busy. In 30 seconds, your day went from overwhelming to manageable — and you can see exactly when you'll do each thing.

This is the synthesis of:
- **Sunsama's** time-blocking UX
- **Structured's** visual timeline with free-gap visibility
- **Kaivoo's** existing Tasks widget (which was already the best part of the app)

**Sprint 3 vs Sprint 4+ split:**

| Sprint 3 (Restore) | Sprint 4+ (Evolve) |
|--------------------|--------------------|
| Full TasksWidget with all sections and settings | Time-blocking: drag tasks to timeline |
| Schedule widget shows meetings (manual or synced) | Fused Task + Timeline side-by-side layout |
| Widgets are separate | Drag-and-resize time blocks |
| No time-blocking | Week view with drag-to-day |
| | Default task duration setting |
| | Task state: unscheduled → scheduled → completed |

The sprint 3 restore gives us the foundation. Sprint 4+ adds the fusion. The task list sections, filtering, and settings carry forward into the fused view unchanged — they still work the same way on the left side. The timeline just adds a planning dimension on the right.

**Additional improvements (Sprint 4+):**

1. **Subtask preview** — Show "2/4 subtasks" beneath a task title. Tapping expands to show subtasks inline.

2. **Smart sections** — In addition to the existing time-based sections, allow custom sections:
   - "Waiting on others" — tasks tagged #waiting
   - "Quick wins" — tasks estimated < 15 min
   - These are opt-in via settings, not default

3. **Batch operations** — Select multiple tasks → "Move to tomorrow" / "Set priority" / "Add topic"

### Interaction Spec

**Task row:**
```
┌──────────────────────────────────────────────────────────┐
│  □  Review PR #42                            ⚡ High     │
│     Kaivoo · #code · Due today                           │
│     2/4 subtasks                                         │
└──────────────────────────────────────────────────────────┘

Tap checkbox  → Task marked complete, moves to Completed section
Tap task title → Opens task detail drawer (edit title, description, subtasks, due date, priority, topic, tags)
Tap topic/tag  → Filters widget to that topic/tag
Swipe left     → Quick actions: [Tomorrow] [Delete] [Priority]
```

**Section header:**
```
┌──────────────────────────────────────────────────────────┐
│  Due Today (3)                                    ▼      │
└──────────────────────────────────────────────────────────┘

Tap → Toggle collapsed/expanded
Number updates live as tasks are completed/added
```

**Settings gear:**
```
Gear icon in widget header → Opens settings panel
Settings panel is a drawer/popover, NOT a full page navigation
All changes apply immediately (no "Save" button needed)
```

### Must-Never-Lose Checklist: Tasks Widget

**Core (Sprint 3 — non-negotiable):**
- [ ] Configurable sections: Due Today, Overdue, High Priority, Due This Week, Completed
- [ ] Sections are collapsible dropdowns with item counts
- [ ] Hide empty sections setting works
- [ ] Show/collapse completed tasks settings work
- [ ] Collapse sections by default setting works
- [ ] Topic filtering (show tasks by topic: Work, Kaivoo, Personal, etc.)
- [ ] Hashtag filtering (show tasks by hashtag: #video, #ppt, etc.)
- [ ] Combined topic + hashtag filtering
- [ ] Settings panel accessible from widget header
- [ ] One-tap task completion (checkbox)
- [ ] Task detail drawer on title tap
- [ ] Quick add input at top of widget
- [ ] Live count updates when tasks change
- [ ] Day Brief Tasks chip stays in sync

**Time-Blocking Fusion (Sprint 4+ — additive, never removes core):**
- [ ] Day Timeline visible alongside task list
- [ ] Drag task from list → timeline to schedule it
- [ ] Scheduled tasks show in both list (with time) and timeline (as block)
- [ ] Resize time blocks by dragging edges
- [ ] Default task duration configurable in settings
- [ ] Week view toggle for weekly planning
- [ ] Drag task to specific day in week view
- [ ] Calendar events visible in timeline (read-only)
- [ ] Free gaps clearly visible between events

---

## Widget 3: Routines

### What It Is

Your daily habit tracker. Icon-based routines with big, satisfying checkmarks and a progress bar that makes you want to fill it.

### The Real Use Case

You open Today in the morning. The Routines widget shows your 6 daily routines with custom icons:
- 🧘 Meditate — not done yet
- 💪 Exercise — not done yet
- 📖 Read 30 min — not done yet
- ☕ No coffee after 2pm — not done yet
- 📝 Journal — not done yet
- 🌙 Evening walk — not done yet

Progress bar: 0/6 (empty).

You meditate, then tap the 🧘 icon — big satisfying checkmark animation. Progress bar: 1/6. You exercise, tap 💪 — checkmark. Progress bar: 2/6. By evening, you've done 5/6 and the progress bar is almost full. The gamification pull is real — you want to fill that bar.

Routines change over time. You start doing yoga, so you add a 🧘‍♀️ Yoga routine. Your "No coffee" experiment ends, so you delete it. The system handles this gracefully — historical data for deleted routines is preserved, but they stop appearing in the daily tracker.

### What Worked (Pre-Sprint 2)

- **Icon-based routines** — Each routine has a meaningful icon that matches the vibe. Meditation gets a meditation icon, not a generic checkbox.
- **Big checkmark animation** — Satisfying visual feedback when completing a routine
- **Progress bar** — Gamification that works. You genuinely want to fill it.
- **Add/change/delete routines** — Routines are not static. Life changes. You should be able to modify them anytime.
- **Customizable icons** — Important for personalization. The icon should match the activity.
- **Grouped by time of day** — Morning routines vs. evening routines (optional grouping)

### What Was Lost in Sprint 2

Sprint 2 moved routines into the `TimelineColumn` as small toggles positioned on a timeline. This lost:
- Big icon buttons with satisfying checkmarks
- The progress bar
- Add/delete/edit UI (no way to manage routines)
- The gamification feel
- The widget identity (routines became a sub-element of the timeline)

### What It Should Become

Restore the pre-Sprint 2 routine widget, then evolve it with **routine categories**, **variable frequency**, and **time-bound challenges**.

#### The Core Widget (Sprint 3 — Restore + Categories)

```
┌─────────────────────────────────────────────────────────────────┐
│  ROUTINES                                                       │
│                                                                 │
│  ☀️ Morning Routine                          ████████░░ 3/4    │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐                           │
│  │  🪥  │ │  🧴  │ │  🧘  │ │  📖  │                           │
│  │  ✅  │ │  ✅  │ │  ✅  │ │      │                           │
│  │Brush │ │ Wash │ │Medit.│ │ Read │                           │
│  └──────┘ └──────┘ └──────┘ └──────┘                           │
│                                                                 │
│  🌙 Evening Routine                          ██████░░░░ 2/3    │
│  ┌──────┐ ┌──────┐ ┌──────┐                                    │
│  │  🧴  │ │  🦷  │ │  🚶  │                                    │
│  │  ✅  │ │  ✅  │ │      │                                    │
│  │ Wash │ │Floss │ │Walk  │                                    │
│  └──────┘ └──────┘ └──────┘                                    │
│                                                                 │
│  🔥 75 Hard (Day 23/75)                      ██████░░░░ 3/5    │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐                  │
│  │  💧  │ │  🥶  │ │  📖  │ │  📸  │ │  🏋️  │                  │
│  │  ✅  │ │  ✅  │ │  ✅  │ │      │ │      │                  │
│  │Gallon│ │IcBath│ │ Read │ │Photo │ │W.Out │                  │
│  └──────┘ └──────┘ └──────┘ └──────┘ └──────┘                  │
│                                                                 │
│  🏊 Triathlon Training               Due this week: Swim 0/1   │
│  ┌──────┐ ┌──────┐ ┌──────┐                                    │
│  │  🏊  │ │  🚴  │ │  🏃  │                                    │
│  │      │ │ 1/3  │ │ 2/3  │                                    │
│  │Swim  │ │ Bike │ │ Run  │                                    │
│  │1x/wk │ │3x/wk │ │3x/wk │                                    │
│  └──────┘ └──────┘ └──────┘                                    │
│                                                                 │
│  [+ Add Routine]  [+ New Category]    [⚙ Manage Routines]      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Key differences from the old widget:**

The old widget had two fixed groups: Morning and Evening. The new widget supports **user-defined routine categories** that cover real-life scenarios:

#### Routine Categories

| Category Type | Example | How It Works |
|--------------|---------|-------------|
| **Daily routine** | Morning Routine, Evening Routine | Same as before — routines that happen every day. Progress bar shows X/Y for today. |
| **Time-bound challenge** | 75 Hard | A challenge with a fixed duration (e.g., 75 days). Shows "Day 23/75" in the header. Has a start date and an end date. When the challenge ends, routines stop appearing daily but historical data is preserved. Can be restarted. |
| **Variable frequency** | Triathlon Training | Routines within this category have individual frequencies: "Swim 1x/week", "Bike 3x/week", "Run 3x/week". Progress bar shows weekly completion: "Bike 1/3 this week". |
| **Custom** | Anything the user names | Free-form category. User picks the name, icon, and whether routines are daily, weekly, or custom frequency. |

#### Variable Frequency Routines

Not everything is daily. Some routines happen 3x/week, 1x/week, or on specific days. The system needs to support this:

```
ROUTINE FREQUENCY OPTIONS (set per routine):

  Daily       — Every day (default, current behavior)
  X per week  — N times per week, any days (e.g., "Bike 3x/week")
  Specific days — Only on selected days (e.g., "Swim: Mon, Wed, Fri")
  X per month — N times per month (e.g., "Deep clean 2x/month")
```

**How variable frequency shows on the Today page:**

| Frequency | What Appears Today | Progress Display |
|-----------|-------------------|-----------------|
| Daily | Always shows | ✅ or ○ |
| 3x/week, not done 3x yet | Shows (with "1/3 this week" label) | "🚴 Bike · 1/3 this week" |
| 3x/week, already done 3x | Hidden for today (or dimmed with ✅ "Done this week") | Completed state |
| Specific days (not today) | Hidden | — |
| Specific days (today) | Shows like daily | ✅ or ○ |

**The key insight:** On the Today page, you should only see routines that are *relevant to today*. If your swim day is Monday and it's Wednesday, you don't see Swim. But if you've only biked 1 of 3 times this week, Bike still shows because you still need to do it.

#### Time-Bound Challenges

A challenge is a special category that:
- Has a **start date** and a **duration** (e.g., 75 days, 30 days, 21 days)
- Shows a **day counter** in the header: "Day 23/75"
- Has its own progress bar for the overall challenge, separate from the daily progress
- **Ends automatically** — when the challenge duration is complete, a celebration moment happens and the routines stop appearing daily
- Can be **restarted** — if you fail or want to do another round
- **Break detection** — if you miss a day on a challenge where consecutive days matter (like 75 Hard), the system can optionally reset the counter or flag it (user's choice in settings: strict mode vs. forgiving mode)

```
CHALLENGE CREATION:
┌─────────────────────────────────────────────┐
│  New Challenge                               │
│                                              │
│  Name: [75 Hard                    ]         │
│  Icon: [🔥]                                  │
│  Duration: [75] days                         │
│  Start date: [Feb 22, 2026]                  │
│                                              │
│  Routines in this challenge:                 │
│  [+ Add] Drink gallon of water  💧  Daily   │
│  [+ Add] Ice bath               🥶  Daily   │
│  [+ Add] Read 10 pages          📖  Daily   │
│  [+ Add] Progress photo         📸  Daily   │
│  [+ Add] Workout                🏋️  Daily   │
│                                              │
│  Strict mode: [ON]                           │
│  (Reset day counter if you miss a day)       │
│                                              │
│  [Start Challenge]                           │
└─────────────────────────────────────────────┘
```

#### Category Management

Accessible from **[Manage Routines]** button in the widget or from Settings page. Users can create, edit, reorder, and delete categories. Individual routines have name, icon, frequency, and category assignment. Routines can be paused (stops appearing without deleting) or deleted (preserves historical data).

**Full settings spec:** See `Feature-Bible-Settings.md` → Routines Management section.

**Sprint 3 scope:** Restore the icon widget with categories. Categories replace the old Morning/Evening hardcoded groups. Users can create custom categories. Variable frequency and challenges are Sprint 4+ (additive — the category system is designed to support them later).

#### Improvements to explore (Sprint 4+):

1. **Streak display** — Small flame icon + number beneath a routine when you're on a streak: "🔥 12" (12-day streak). This taps into the same motivational pull as the progress bar.

2. **Routine history on long-press** — Long-press a routine icon → popover showing your completion history for the last 7 days (dots: ✅○✅✅✅○✅). Quick visual of consistency.

3. **Graceful routine changes** — When you add, modify, or delete a routine:
   - Historical data for the old routine is preserved in analytics
   - New routines start with a clean streak (not penalized for not existing before)
   - Deleted routines stop appearing in the daily tracker but remain in historical data and Insights
   - **Paused state:** routine stops appearing daily but isn't deleted (for seasonal habits like "swimming" in summer)

4. **Icon picker** — When adding/editing a routine, show a grid of relevant icons. Categorized: Wellness (🧘💪🏃), Learning (📖📝✏️), Health (💊💧🥗), Social (👥📞💬), Creative (🎨🎵📷).

5. **Challenge analytics** — When a challenge completes, show a summary: completion rate, streak data, mood correlations during the challenge period. "During your 75 Hard, your mood averaged 3.8/5 — 15% higher than before the challenge."

### Interaction Spec

**Routine icon button:**
```
Tap      → Toggle completion (✅ ↔ ○)
            Animation: icon pulses, checkmark fades in/out
            Category progress bar updates
            Day Brief Routines chip updates
Long-press → Show 7-day completion history popover (future)
```

**Variable frequency routine:**
```
Tap      → Toggle completion for today
            "Bike 2/3 this week" updates to "Bike 3/3 this week ✅"
            If weekly goal met, routine dims (done for the week)
```

**[+ Add Routine] button:**
```
Tap → Opens routine creation drawer:
  - Name input
  - Icon picker (grid of emoji/icons)
  - Category assignment (Morning / Evening / Custom / Challenge)
  - Frequency (Daily / Nx per week / Specific days / Nx per month)
  - [Save]
```

**[+ New Category] button:**
```
Tap → Opens category creation:
  - Name input
  - Icon picker
  - Type: Regular / Time-bound Challenge
  - If challenge: Duration (days), Start date, Strict mode toggle
  - [Create]
```

**[⚙ Manage Routines] button:**
```
Tap → Opens routine management in Settings:
  - Manage categories (reorder, edit, delete, pause)
  - Manage routines within categories (reorder, edit, delete, pause)
  - Challenge controls (restart, pause, view progress)
  - Frequency settings per routine
```

### Must-Never-Lose Checklist: Routines Widget

**Core (Sprint 3 — non-negotiable):**
- [ ] Icon-based routine buttons (not checkboxes, not toggles)
- [ ] Custom icons per routine (user-selected)
- [ ] Big, satisfying checkmark animation on completion
- [ ] Progress bar per category showing X/Y completed
- [ ] Progress bar visually fills as routines are completed
- [ ] Add new routine capability (name, icon, category, frequency)
- [ ] Edit existing routine (name, icon, category, frequency)
- [ ] Delete routine with confirmation
- [ ] User-defined categories (not limited to Morning/Evening)
- [ ] Create/edit/delete categories
- [ ] Day Brief Routines chip stays in sync
- [ ] Historical data preserved when routines are deleted
- [ ] Only today-relevant routines appear (hide routines not due today)

**Advanced (Sprint 4+ — additive):**
- [ ] Variable frequency routines (Nx/week, specific days, Nx/month)
- [ ] Weekly progress tracking for variable-frequency routines
- [ ] Time-bound challenges with day counter (Day X/Y)
- [ ] Challenge strict mode (reset on miss) vs. forgiving mode
- [ ] Challenge completion celebration
- [ ] Pause routine (stops appearing without deleting)
- [ ] Streak display per routine
- [ ] Challenge analytics on completion

---

## Widget 4: Today's Schedule (Calendar) → Merges into Task + Timeline Fusion

### What It Is

**Sprint 3:** A standalone widget showing today's calendar events.
**Sprint 4+:** The schedule merges into the Timeline side of the Task + Timeline fusion (see Widget 2 above). Calendar events become blocks in the same timeline where you schedule tasks.

### The Real Use Case

You open Today. The Schedule shows your meetings for the day:
- 9:00 Team Standup (from Google Calendar) — 30 min
- 11:00 Design Review (from Microsoft Teams) — 1 hr
- 2:00 Client Presentation (manually added in Kaivoo) — 1.5 hr

You glance at it and know: "I have 3 meetings today, with gaps between 9:30-11:00 and 12:00-2:00 for focused work." Then (Sprint 4+) you drag your tasks into those gaps.

### What Worked (Pre-Sprint 2)

Honestly? Not much. Calendar inputs were manual, so it was never used. The user stuck to Microsoft Teams for meetings and Google Calendar for scheduling. A manual meeting widget is not useful when your real calendar lives elsewhere.

### What Didn't Work

- **Manual-only input** — No one is going to re-enter their meetings into a second app. If meetings aren't auto-synced from Google/Outlook, this widget is dead space.

### What It Should Become

**This widget goes through three evolutionary stages:**

**Stage 1 — Sprint 3 (Standalone widget):**
- Shows manually created Kaivoo meetings as a simple list
- Display a clear call-to-action: "Connect Google Calendar or Outlook to see your meetings here. [Settings →]"
- Hideable if the user doesn't want to see it (setting: "Show schedule widget")
- If no meetings and no connected calendars, hide by default (don't waste space)

**Stage 2 — Phase 3 (Calendar integration):**
- Google Calendar and Microsoft Teams/Outlook events sync in automatically
- Still a standalone widget, but now actually useful because your real meetings appear

**Stage 3 — Sprint 4+ (Fused into Task + Timeline):**
- The schedule widget disappears as a separate entity
- Calendar events become blocks in the Day Timeline (right side of the fusion)
- Meetings and scheduled tasks live side-by-side on the same timeline
- This is where the Schedule widget's real value is realized — not as a list of meetings, but as the calendar layer in a planning surface

**Post-integration (Phase 3+):**
```
┌─────────────────────────────────────────────────────────┐
│  TODAY'S SCHEDULE                            3 meetings │
│                                                         │
│  9:00   Team Standup               🟢 Work Google Cal   │
│         30min · Zoom · 4 attendees     [Join Meeting]   │
│                                                         │
│  11:00  Design Review              🟣 Microsoft Teams   │
│         1hr · Teams · Sarah, Mike      [Join Meeting]   │
│                                                         │
│  2:00   Client Presentation        🟠 Kaivoo (manual)   │
│         1.5hr · Conference Room B      [Edit] [Delete]  │
│                                                         │
└─────────────────────────────────────────────────────────┘

Color dots = calendar source
External events = read-only (no Edit/Delete)
Kaivoo events = fully editable
[Join Meeting] = deep link to Zoom/Teams/Google Meet
```

**Key behaviors:**
- Events are sorted by start time
- Source indicator (color dot + label) shows where each event came from
- External events cannot be edited or deleted in Kaivoo (read-only mirror)
- Kaivoo manual events can be edited and deleted
- "Join Meeting" button pulls the meeting URL from the calendar source
- Day Brief Meetings chip shows the total count

### Must-Never-Lose Checklist: Schedule Widget

- [ ] Shows meetings for today sorted by time
- [ ] Source indicators for external calendars (when connected)
- [ ] External events are read-only
- [ ] Kaivoo manual events are editable/deletable
- [ ] Hideable when no calendars connected and no manual meetings
- [ ] Day Brief Meetings chip stays in sync

---

## Removed from Today: AI Inbox → Floating Chat

### What It Was

A widget on the Today page where you could dump thoughts and the AI would extract action items. Write a thought dump like "I have a meeting with the doctor tomorrow at 3, and I forgot to pick up groceries at 2" — and the AI would create a meeting for the doctor and a task for groceries.

### What Didn't Work

In practice, it was easier to just add tasks directly using the Tasks widget. The Tasks widget was so fast and convenient that going through the AI for task creation added friction instead of removing it. The AI Inbox ended up as a feature that looked impressive but wasn't used.

### What Replaces It: Floating Chat Icon

A small chat bubble icon in the bottom-right corner of the screen (not just Today — it's global). This is a quick-access AI assistant for fire-and-forget requests:

```
┌──────────────────────────────────────────────────┐
│                                            💬    │
│                                        ┌────────┐│
│                                        │ Chat   ││
│                                        │ bubble ││
│                                        └────────┘│
└──────────────────────────────────────────────────┘

Tapping 💬 opens a small chat drawer:

┌──────────────────────────────────────────────────┐
│  ┌─────────────────────────────────────────────┐ │
│  │  You: Remind me to add a slide to the       │ │
│  │  Friday presentation                        │ │
│  │                                             │ │
│  │  Kaivoo: Done — added "Add a slide" as a   │ │
│  │  subtask under "Friday Presentation."       │ │
│  │  ─────────────────────────────────────────  │ │
│  │                                             │ │
│  │  You: I have a doctor appointment tomorrow  │ │
│  │  at 3                                       │ │
│  │                                             │ │
│  │  Kaivoo: Created a meeting "Doctor           │ │
│  │  Appointment" for tomorrow at 3:00 PM.      │ │
│  └─────────────────────────────────────────────┘ │
│                                                  │
│  ┌─────────────────────────────────────────────┐ │
│  │  Quick thought or action...          [Send] │ │
│  └─────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────┘
```

**Use cases for the floating chat:**

#### Quick Actions (Sprint 3 — basic command parsing)
- "Remind me to..." → Creates a task
- "I have a meeting tomorrow at..." → Creates a meeting
- "Add a subtask to [task] for..." → Finds the task, adds a subtask
- "Move [task] to next week" → Reschedules
- "Mark yoga done" → Marks matching routine complete
- "Set mood to great" → Updates mood
- General thought dumps → Saved as a capture for later AI processing

#### Contextual Intelligence (Phase 4+ — Concierge)

This is where the floating chat becomes the **Concierge** — the full AI orchestrator from the Vision roadmap. It's not just a task creator; it's a context-aware assistant that can search across your entire Kaivoo workspace.

**The scenario:**
> You're about to walk into a meeting with your boss Mark. You open the chat: "What do I need to talk to Mark about today?"

The Concierge searches across:
- **Topics/hashtags** mentioning "Mark"
- **Recent journal entries** that reference Mark
- **Tasks** assigned to or related to Mark
- **Recent meetings** with Mark
- **Captures** mentioning Mark

Response: *"Based on your data: Sara mentioned wanting to discuss the Q2 budget with Mark (from your Feb 18 journal). You have 5 tasks tagged #mark, including 'Get PO approval' (overdue). Your Topics folder 'Project Atlas' has 2 pages mentioning Mark about the timeline. You also met with Mark on Feb 15 — your journal noted he was concerned about the deliverable deadline."*

This is essentially a **targeted NotebookLM** — but instead of uploading documents to a separate tool, your Kaivoo data *is* the notebook. The Concierge can search, cross-reference, and assemble context from everything you've captured.

**More Concierge use cases:**

| User says | Concierge does |
|-----------|---------------|
| "What do I need to talk to Mark about?" | Searches topics, tasks, journals, meetings for "Mark" context |
| "Summarize my week" | Reads last 7 Daily Digest files, generates narrative summary |
| "What tasks are blocking the client proposal?" | Finds "Client Proposal" task, checks subtasks, finds related tasks |
| "When did I last meet with the design team?" | Searches meetings for "design" |
| "What did I write about the pricing decision?" | Searches journal entries and captures for "pricing" |
| "Just got out of yoga! Feeling great!" | Marks routine, sets mood, logs to digest (see Mood section) |

**Architecture note for Agent 3:** The Concierge for the floating chat could be a single capable model (GPT-4 / Claude level) that receives structured context from Kaivoo's data layer, OR it could be a router that dispatches to specialized sub-agents (a search agent, a task agent, a journal agent). The routing architecture is a Phase 4 design decision. The floating chat UI is the same either way — the user just types and gets answers.

#### Web Scraping & Content Capture (Phase 4+ — Concierge)

The old Journal page had a "scrape the internet" tool. Since journaling is moving to the Journal Page and the AI Inbox is gone, web scraping becomes a **Concierge capability** accessed through the floating chat.

**The scenario:**
> You find a great pasta recipe online. You open the chat: "Hey, this website [link] looks interesting. I only want the recipe. Please save it in my pasta recipes folder."

The Concierge:
1. Scrapes the URL, extracts the page content
2. Parses out just the recipe (ignoring ads, navigation, popups)
3. Checks if a "Recipes/Pasta" topic folder exists — if not, creates it
4. Saves the recipe as a page under Recipes/Pasta
5. Responds: *"Saved! I grabbed the recipe for 'Cacio e Pepe' and put it in Recipes > Pasta. Want me to add the ingredients to your grocery list?"*

**More scraping use cases:**

| User says | Concierge does |
|-----------|---------------|
| "Scrape [link] and save to Telecom Competitors" | Scrapes site, saves to Topics > Telecom Competitors |
| "Save this article [link] to my Research folder" | Scrapes article content, saves as a page |
| "What does this page say about pricing? [link]" | Scrapes, summarizes the pricing section |
| "Compare these two pages [link1] [link2]" | Scrapes both, provides comparison |

**This connects to the bigger Vault/NotebookLM vision (Phase 4-6):**

The Topics system in Kaivoo is essentially a knowledge base. Web scraping is one way content gets in. Other sources:
- **PDF uploads** → extracted text saved to a topic page
- **Presentation files** → extracted text saved to a topic page
- **Video transcripts** → Whisper transcription saved to a topic page
- **Manual notes** → Journal entries linked to topics
- **Web scrapes** → Cleaned content saved to topic pages

Once content is in the Topics system, the Concierge can query across all of it: *"What have I collected about competitor pricing?"* — and it pulls from scraped web pages, uploaded PDFs, journal notes, and task descriptions. This is the NotebookLM-like experience, but built on your own data, in your own app.

**Phase dependency:** Web scraping requires Phase 4 (Concierge + HTTP fetch). For Sprint 3:
- The floating chat saves unrecognized inputs as captures
- Links pasted into chat are saved as link-type captures (URL + title)
- Full scraping, parsing, and intelligent saving comes with the Concierge

**Why this is better than the old AI Inbox widget:**
- It's not a widget taking up space on Today — it's available everywhere
- It's fire-and-forget: type, send, close
- It aligns with the future Telegram bot integration (same quick-hit interface, different channel)
- It doesn't compete with the Tasks widget for task creation
- It's for "hey, I just thought of this" moments AND for deeper queries
- It scales: quick actions in Sprint 3, full Concierge in Phase 4, web scraping and knowledge base in Phase 4-6

### Must-Never-Lose Checklist: Floating Chat

**Core (Sprint 3 — non-negotiable):**
- [ ] Chat icon visible on all pages (bottom-right)
- [ ] Tapping opens a compact chat drawer
- [ ] Text input with send button
- [ ] Basic task creation from natural language
- [ ] Basic routine completion from explicit commands
- [ ] Basic mood setting from explicit commands
- [ ] URLs pasted saved as link-type captures
- [ ] Unrecognized inputs saved as captures
- [ ] Conversation history persists during session
- [ ] Drawer dismissable without losing input

**Concierge (Phase 4+ — additive):**
- [ ] Contextual search across topics, tasks, journals, meetings, captures
- [ ] Natural language understanding (fuzzy routine matching, tone-based mood)
- [ ] Web scraping: extract content from URLs
- [ ] Intelligent content saving to Topics (auto-create folders)
- [ ] Cross-reference queries ("What do I need to talk to Mark about?")
- [ ] Conversation history persists across sessions

---

## Removed from Today: Journal Widget → Moved to Journal Page

### What It Was

An inline journal entry widget on the Today page. You'd write in the widget and hit submit to create a timestamped journal entry.

### What Didn't Work

The widget was too small and cramped. You couldn't get a real sense of what you were writing or how long your entry was. Journaling is a deep activity — it needs space, flow, and continuity. The widget treated journaling like a quick form submission.

In practice, the user went back to Obsidian for journaling because:
- Obsidian has a continuous flow — you can write, stop, come back, and keep going
- One markdown file that you constantly update
- You can go back and edit entries, even months later
- The workspace feels open and dedicated to writing

The Journal page in Kaivoo was also disappointing — just a blank text editor with entries on a sidebar. No sense of navigation, no calendar view, no folder structure.

### What Replaces It: A Full Journal Module (on the Journal Page)

Journaling is moving entirely to the Journal Page, which will be redesigned as a proper module with:
- **Calendar on the right** — showing days with entries, clickable to navigate
- **Folder/navigation structure on the left** — for organizing entries, topics, notebooks
- **Obsidian-like editor** — continuous writing flow, not submit-per-entry
- **Full AI features** built into the journal experience (not a separate widget)

This is covered in the Journal section of the Use Case Bible (to be written).

**Impact on Today page:**
- No journal widget on Today
- The Day Brief's AI summary can reference journal entries
- The floating chat can be used for quick thoughts (which can become journal entries or captures)
- The Daily Shutdown flow includes a one-line "today in a sentence" which saves as a journal-tagged entry
- Today stays clean and focused: Tasks, Calendar, Routines, and your command center

---

## Daily Shutdown Trigger

### What It Is

A button at the bottom of the Today page that launches the Daily Shutdown ritual — a guided 30-60 second end-of-day flow.

The Daily Shutdown is fully specified in Agent 6's UC10 (Use Case 10). This section only covers how it appears on the Today page.

### How It Appears on Today

```
Pre-8pm (configurable):
  No trigger shown (or very subtle "Plan tomorrow →" link)

After 8pm (configurable), if shutdown not completed today:
  ┌─────────────────────────────────────────────────┐
  │  Ready to wrap up your day?                      │
  │  [Begin Daily Shutdown]         [Not yet]        │
  └─────────────────────────────────────────────────┘

Always available (manual trigger):
  At the bottom of the Today page, always:
  [Begin Daily Shutdown]
```

**The shutdown flow itself is a modal/drawer overlay, not a page navigation.** You launch it from Today, complete the 4-5 steps, and return to Today (or close the app).

#### Daily Shutdown Settings

The auto-prompt behavior is fully configurable: master enable/disable toggle, configurable prompt time (default 8pm), and option to show/hide the manual trigger button. The auto-prompt should never feel like a nag — it's an engagement driver for those who use it, fully optional for those who don't.

**Full settings spec:** See `Feature-Bible-Settings.md` → Daily Shutdown section.

### Must-Never-Lose Checklist: Shutdown Trigger

- [ ] "Begin Daily Shutdown" button visible at bottom of Today page (toggleable in Settings)
- [ ] Auto-prompt appears after configurable time (default 8pm, adjustable in Settings)
- [ ] Auto-prompt can be toggled off entirely in Settings
- [ ] Auto-prompt is non-blocking (dismissable with "Not yet")
- [ ] Auto-prompt only shows if shutdown not already completed today
- [ ] Shutdown flow launches as overlay, not page navigation

---

## Date Navigation (Sprint 2 Win — Preserve)

Sprint 2 added date navigation to the Today page. This is a **keeper** and must be preserved.

- Left/right arrows for previous/next day
- "Today" button to snap back to current date
- URL reflects the date: `/today?date=2026-02-22`
- When viewing a past date, Today shows the historical state for that day (completed tasks, routine completions, journal entries, mood)
- All widgets update to show data for the selected date

**Key rule:** When viewing a past date, the page is still interactive (you can retroactively mark routines, per Agent 6's UC4). It is NOT a read-only museum.

### Must-Never-Lose Checklist: Date Navigation

- [ ] Left/right arrows for day navigation
- [ ] "Today" button to snap to current date
- [ ] URL updates with selected date
- [ ] All widgets show data for the selected date
- [ ] Past dates are interactive (retroactive routine completion within 7 days)

---

## Today Page: Full Must-Never-Lose Checklist

This is the aggregate checklist for the Today page. Before any sprint branch merges to main, Agent 11 verifies every item.

### Page-Level
- [ ] Today page is a widget-based dashboard (not a timeline-first layout)
- [ ] Widgets: Day Brief, Tasks, Routines, Schedule (conditional), Shutdown trigger
- [ ] Floating chat icon present (bottom-right)
- [ ] No journal widget on Today page (journaling lives on Journal page)
- [ ] Date navigation works (prev/next day, Today button, URL-driven)
- [ ] Responsive layout: 2-column grid on desktop, stacked on mobile
- [ ] Page loads in < 1 second on a warm cache

### Day Brief Widget
- [ ] Three insight chips: Tasks X/Y, Meetings N, Routines X/Y
- [ ] Live-updating chips (no manual refresh needed)
- [ ] Progress bars on Tasks and Routines chips
- [ ] AI summary or configurable fallback (quote, custom prompt, or nothing)
- [ ] AI data access toggles in Settings (journal, mood, tasks, routines, meetings, chat)
- [ ] Master toggle to disable AI Summary entirely
- [ ] Mood selector: 5 options, tappable, changeable throughout the day
- [ ] Mood history tracked with timestamps
- [ ] Mood settable via floating chat / Telegram (natural language, Phase 4+)

### Tasks Widget
- [ ] Configurable sections: Due Today, Overdue, High Priority, Due This Week, Completed
- [ ] Collapsible section dropdowns with counts
- [ ] Topic filtering
- [ ] Hashtag filtering
- [ ] Settings panel (hide empty, show/collapse completed, collapse by default)
- [ ] One-tap completion
- [ ] Task detail drawer
- [ ] Quick add input
- [ ] Live count sync with Day Brief

### Routines Widget
- [ ] Icon-based routine buttons with custom icons
- [ ] Checkmark animation on completion
- [ ] Progress bar per category (X/Y completed)
- [ ] Add/edit/delete routines
- [ ] User-defined categories (not limited to Morning/Evening)
- [ ] Create/edit/delete categories
- [ ] Only today-relevant routines appear
- [ ] Sync with Day Brief

### Schedule Widget (Sprint 3 standalone → Sprint 4+ merges into Task + Timeline)
- [ ] Shows today's meetings (manual or synced when available)
- [ ] Hideable when empty and no calendar connected
- [ ] Source indicators for external calendars
- [ ] Day Brief Meetings chip stays in sync
- [ ] Sprint 4+: Calendar events appear as blocks in Day Timeline
- [ ] Sprint 4+: Read-only calendar blocks (can't move meetings, only tasks)

### Floating Chat
- [ ] Available on all pages
- [ ] Compact drawer with text input
- [ ] Basic task creation from natural language (Sprint 3)
- [ ] Basic routine completion + mood setting from explicit commands (Sprint 3)
- [ ] URLs saved as link-type captures (Sprint 3)
- [ ] Contextual search across all data (Phase 4+)
- [ ] Web scraping + intelligent content saving (Phase 4+)
- [ ] Full Concierge AI processing (Phase 4+)

### Daily Shutdown
- [ ] Trigger button at bottom of Today page (toggleable in Settings)
- [ ] Auto-prompt after configurable time (default 8pm, adjustable in Settings)
- [ ] Auto-prompt toggleable on/off in Settings
- [ ] Non-blocking, dismissable
- [ ] Launches as overlay

### Date Navigation
- [ ] Prev/next arrows
- [ ] Today button
- [ ] URL-driven
- [ ] All widgets update for selected date
- [ ] Past dates are interactive

---

## Resolved Questions — Today Page

All questions resolved February 22, 2026 (user answers incorporated).

### Q1: Mini-calendar widget for date jumping?
**RESOLVED — No.** The existing calendar icon in the top-right header is the preferred approach. User can click it to jump to any date. No separate mini-calendar widget needed — it would be redundant.

### Q2: Floating chat conversation history persistence?
**RESOLVED — Daily MD memory files.** Chat history is stored in daily markdown memory files, not in long-term AI memory. Proposed folder structure: `Daily-2026-02-22/` containing `routines-2026-02-22.md`, `journal-2026-02-22.md`, `completed-tasks-2026-02-22.md`, etc. The Concierge AI gets a lightweight `concierge.md` preference file (updatable with context over time) but no long-term memory. Long-term memory lives in the "Brain" — the file vault itself (Obsidian-style). **Action:** Agent 3 to spec the exact folder structure and file format for daily data files.

### Q3: Pinned tasks?
**RESOLVED — No.** Instead, an "Ongoing" task label handles the persistent visibility use case — tasks without due dates that stay visible. The "reminder" use case (e.g., "take dog to grooming") is noted as a future consideration but not Sprint 3 scope.

### Q4: Mood change visual indicator?
**RESOLVED — Yes, with color coding.** Show a visual indicator on the Day Brief when mood has changed during the day. Color-coded: red = bad, blue-to-green = good. The mood timeline dots should reflect these colors. **Action:** Agent 1 to design the exact visual treatment for mood change indicators and color mapping.

### Q5: Day Brief AI summary for past dates?
**RESOLVED — Today only.** The AI summary only generates and displays for the current day. When viewing past dates via date navigation, the AI summary zone is hidden or shows a static note like "Summary available for today only."

### Q6: Focus Mode (Pomodoro-style)?
**RESOLVED — Yes.** Implement Focus Mode: hides everything except the current task and a timer. Launched from the Tasks widget. Pomodoro-style. **Sprint scope:** Sprint 4+ (additive feature, not blocking Sprint 3). **Action:** Agent 1 to design Focus Mode UX. Agent 6 to spec the interaction flow.

### Q7: Task + Timeline layout?
**RESOLVED (previously).** Default is tasks on top, schedule on bottom. Side-by-side planning view enters via [Schedule Mode] button. Agent 1 to design the exact UX for Schedule Mode, including mobile treatment. Users can set Schedule Mode as default in Settings.

### Q8: Daily Digest file format?
**RESOLVED — User-readable markdown in the Vault.** The Daily Digest file is a markdown file the user can read and optionally annotate. Stored in the Vault like any other file. This aligns with Core Principle #1 (you own your data) and the Obsidian-like philosophy.

### Q9: "Review Now" button for AI digest?
**RESOLVED — Yes.** Add a "Review Now" button that forces an immediate AI digest review. Useful for: "I just had a big day, I want my brief NOW." **Sprint scope:** Phase 4+ (requires AI pipeline). The button should be in the Day Brief widget, subtle but accessible.

### Q10: Fuzzy routine matching via chat?
**RESOLVED — Progressive learning.** The Concierge starts conservative — asks clarifying questions for ambiguous inputs:
- User: "I just went for a walk and I feel great!"
- Concierge: "That's great! Do you want me to: A) Complete your workout for the day, B) Complete your evening walk? And should I update your mood?"
- User confirms. Concierge asks: "Do you want me to remember this for future reference so I don't ask again?"

Over time, the Concierge learns user patterns and stops asking for confirmed mappings. Memory is lightweight — stored in `concierge.md` preference file. **Key constraint:** Don't bog down the system with too much memory. Basic preference learning only. **Action:** Agent 3 to spec the Concierge memory architecture. Research team to investigate Pinecone or similar for memory integration (see Q13).

### Q11: Routine categories on Today page?
**RESOLVED — Dedicated "Routines & Habits" page + limited display on Today.** Create a dedicated **Routines & Habits page** where users can go deep: unlimited categories, progress bars, gamification, goal tracking. On the Today page, display is limited — user chooses how many categories to show, or cap at ~3 visible categories. **Action:** Agent 1 and Agent 6 to determine the exact display limit and UX for category selection on Today vs. the full Routines page. This creates a new page in the app architecture.

### Q12: Time-bound challenge missed day UX?
**RESOLVED — Expand to goal tracking + honest-but-not-punitive notifications.** Time-bound challenges (75 Hard) expand into a broader **goal tracking** system. Example: "My goal is to work out 3 days a week." The system tracks progress, and the Daily Brief references it: "You're 4 days into the week and haven't worked out yet — everything okay?" The dedicated Routines & Habits page (Q11) handles detailed tracking. Missed day UX should feel honest but not punitive — a gentle nudge in the Daily Brief, not a blocking modal. **Action:** Agent 6 to spec the exact notification/nudge UX for missed days. Agent 1 to design the goal tracking UI on the Routines & Habits page.

### Q13: Default scraping rules for web content?
**RESOLVED — Yes, via Concierge memory.** The Concierge learns scraping preferences over time (e.g., "When I share a recipe link, always save to Recipes and extract just the recipe"). This ties into the same progressive learning system from Q10. **Action:** Research team (Agent 5) to investigate Pinecone or similar vector DB for Concierge memory integration. This is a Phase 4+ capability.

### Q14: Concierge context window setting?
**RESOLVED — Yes, default 30-day window + topic/hashtag-scoped search.** The Concierge does NOT search everything by default. It operates within a tight context window:

**Default behavior:**
- Concierge searches the **last 30 days** of data by default
- Search is scoped by the **topic/hashtag system** — the Concierge uses topics and hashtags as its primary navigation mechanism, not brute-force full-text search across all files
- Example: "What do I need to talk to Mark about?" → Concierge searches for `#Mark` hashtags and topics tagged/named "Mark" within the 30-day window
- Example: "Look through my NuWave topic and search for any Mark hashtags" → Concierge scopes to the NuWave topic folder, filters for `#Mark`, and summarizes findings

**Why this matters:**
- Prevents the AI from getting bogged down searching everything (token cost, latency, crash risk)
- Topics and hashtags are the user's organizational system — the AI should respect and leverage it, not bypass it
- Files should be easily found through the topic/hashtag taxonomy without AI needing to read every file
- If the user wants to go deeper than 30 days, they can manually browse the Obsidian-like journal/vault using the same topic/hashtag system — no AI needed for historical deep dives

**User-facing settings:** Search window (default 30 days, adjustable up to All time) and search scope (Topics & Hashtags first vs. Full search). User is always in control — wider windows show a token usage warning but never restrict. Per-prompt overrides always work regardless of the default setting.

**Full settings spec:** See `Feature-Bible-Settings.md` → Concierge section.

**Architecture note for Agent 3:** The topic/hashtag system is the Concierge's index. When files are created or updated, their topics and hashtags should be indexed (lightweight metadata, not full embeddings) so the Concierge can quickly scope its search. This is cheaper and faster than vector search for most queries. Vector/semantic search (Pinecone, see Q13) is the fallback for fuzzy queries where the user doesn't specify a topic or hashtag.

---

*Feature Use Case Bible — Today Page — v0.4*
*Compiled by The Director + Agent 6 (Usability Architect)*
*February 22, 2026*
*v0.1: Initial draft — all widgets defined*
*v0.2: Added AI Settings, Daily Digest Pipeline, natural language mood/routines, routine categories + challenges, Task + Timeline fusion, Concierge depth + web scraping, Daily Shutdown settings*
*v0.3: All 14 open questions resolved. New page: Routines & Habits (Q11/Q12). Concierge 30-day window + topic/hashtag search (Q14).*
*v0.4: Bible splitting executed. Settings tables extracted to `Feature-Bible-Settings.md`. Index created at `Feature-Bible-Index.md`. Today Bible now contains behavior/interaction specs only — settings cross-referenced.*
