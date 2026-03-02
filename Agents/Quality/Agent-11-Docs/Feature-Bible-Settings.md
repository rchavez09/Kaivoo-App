# Feature Bible — Settings Page

**Version:** 0.1
**Status:** Extracted from Today Page Bible (v0.3) — canonical source for all settings specs
**Date:** February 22, 2026
**Purpose:** Consolidate every user-facing setting in one place. Feature Bibles reference this file instead of duplicating settings tables. When a new page Bible adds settings, they are added here.

---

## How to Read This Document

Settings are organized by **Settings page section** — each section maps to a collapsible group on the Settings page UI. Each setting has a default, options, and description.

**Convention:** When a feature Bible says *"Configurable — see Settings Bible"*, the full spec is here.

---

## Day Brief AI

*Source: Today Page Bible — Widget 1: Day Brief, Zone 2*

These settings live on the Settings page under a **"Day Brief AI"** section.

| Setting | Default | Options | Description |
|---------|---------|---------|-------------|
| **Enable AI Summary** | ON | ON / OFF | Master toggle. OFF = no AI summary zone at all; Day Brief shows only insight chips + mood. |
| **Fallback when no insights** | "Inspiring quote" | "Inspiring quote" / "Custom message" / "Nothing" / Custom prompt | What to show when the AI has nothing meaningful to say. |
| **Custom fallback prompt** | (empty) | Free text | If set, this prompt is sent to the AI as the fallback instruction. Examples: "Give me a stoic quote", "Remind me of my yearly goals", "Tell me something interesting about history" |
| **AI data access — Journal entries** | ON | ON / OFF | AI can reference journal patterns and content |
| **AI data access — Mood history** | ON | ON / OFF | AI can reference mood trends |
| **AI data access — Task data** | ON | ON / OFF | AI can reference task completion, overdue counts, patterns |
| **AI data access — Routine data** | ON | ON / OFF | AI can reference routine streaks and completion rates |
| **AI data access — Meeting data** | ON | ON / OFF | AI can reference meeting load and calendar patterns |
| **AI data access — AI chat history** | ON | ON / OFF | AI can reference past conversations from the floating chat |
| **Insight frequency** | Daily | Daily / Weekly / Monthly | How often the AI generates fresh insights |

**Why this matters:** Some users want the AI reading everything for the richest insights. Others are privacy-sensitive even within their own app. The user is always in control.

---

## Tasks Widget

*Source: Today Page Bible — Widget 2: Tasks*

These settings are accessible from the **gear icon in the Tasks widget header** (drawer/popover, not a full page navigation). All changes apply immediately — no "Save" button needed.

| Setting | Default | Options | Description |
|---------|---------|---------|-------------|
| **Hide empty sections** | ON | ON / OFF | Don't show sections with 0 items (e.g., hide "Overdue (0)") |
| **Show completed tasks** | ON | ON / OFF | Keep completed tasks visible in a Completed section |
| **Collapse completed by default** | ON | ON / OFF | Completed section starts collapsed |
| **Collapse sections by default** | OFF | ON / OFF | All sections start collapsed (except explicitly expanded ones) |
| **Visible sections** | All ON | Per-section toggles | Toggle which sections appear: Due Today, Overdue, High Priority, Due This Week, Completed |

---

## Schedule Mode / Time-Blocking (Sprint 4+)

*Source: Today Page Bible — Task + Timeline Fusion*

These settings live on the Settings page under a **"Today Layout"** section.

| Setting | Default | Options | Description |
|---------|---------|---------|-------------|
| **Default Today layout** | Standard | Standard / Schedule Mode | Standard = tasks on top, schedule on bottom (default). Schedule Mode = side-by-side Task + Timeline planning view as the default. |
| **Default time block duration** | 30 minutes | 15min / 30min / 45min / 1hr / 1.5hr / 2hr | When dragging a task to the timeline, this is the initial block size. Individual tasks can be resized after placement. |

---

## Routines Management

*Source: Today Page Bible — Widget 3: Routines*

Accessible from **[Manage Routines]** button in the Routines widget or from the Settings page under **"Routines"**.

### Category Management

| Action | Description |
|--------|-------------|
| **Create category** | Name, icon, type (Regular / Time-bound Challenge). If challenge: duration (days), start date, strict mode toggle. |
| **Edit category** | Change name, icon, type |
| **Reorder categories** | Drag handle to reorder display order |
| **Delete category** | With confirmation — preserves historical data |
| **Pause/Restart challenge** | For time-bound challenges only |

### Individual Routine Settings

| Setting | Options | Description |
|---------|---------|-------------|
| **Name** | Free text | Routine display name |
| **Icon** | Emoji picker | Custom icon per routine |
| **Category** | User's categories | Which category this routine belongs to |
| **Frequency** | Daily / Nx per week / Specific days / Nx per month | How often this routine appears |
| **Pause** | ON / OFF | Stops appearing without deleting — for seasonal habits |
| **Delete** | With confirmation | Removes routine, preserves historical data |

### Today Page Display (from Q11)

| Setting | Default | Options | Description |
|---------|---------|---------|-------------|
| **Categories shown on Today** | Up to 3 | User selects which categories | Limits how many routine categories appear on the Today page. Full management lives on the dedicated Routines & Habits page. |

*Note: Exact display limit and UX to be finalized by Agent 1 and Agent 6.*

---

## Daily Shutdown

*Source: Today Page Bible — Daily Shutdown Trigger*

These settings live on the Settings page under a **"Daily Shutdown"** section.

| Setting | Default | Options | Description |
|---------|---------|---------|-------------|
| **Enable auto-prompt** | ON | ON / OFF | Master toggle. OFF = no auto-prompt appears, but the manual "Begin Daily Shutdown" button is still always available. |
| **Auto-prompt time** | 8:00 PM | 6:00 PM to 11:00 PM in 30-min increments | What time the auto-prompt banner appears on the Today page. |
| **Show manual trigger** | ON | ON / OFF | Whether the "Begin Daily Shutdown" button appears at the bottom of the Today page. If OFF, shutdown is only accessible via auto-prompt or sidebar nav. |

**Why this matters:** Not everyone wants a nightly prompt. Some users plan in the morning or weekly. The auto-prompt should never feel like a nag.

---

## Concierge

*Source: Today Page Bible — Q14*

These settings live on the Settings page under a **"Concierge"** section.

| Setting | Default | Options | Description |
|---------|---------|---------|-------------|
| **Search window** | 30 days | 7 days / 14 days / 30 days / 90 days / All time | How far back the Concierge looks by default. **Fully user-adjustable.** Selecting wider windows (90 days, All time) shows a one-time warning: *"Wider search windows use more AI tokens per query. Topic and hashtag filters help keep searches efficient."* The system warns but never restricts — if the user wants to search the entire vault, that's their choice. |
| **Search scope** | Topics & Hashtags first | Topics & Hashtags first / Full search | How the Concierge navigates data. Default uses the topic/hashtag taxonomy to narrow file sets before AI reads anything. "Full search" does broader text search within the time window. |

**Key behaviors:**
- User can override the default window per-prompt: "Search the last 6 months for anything about pricing" — the Concierge respects the explicit instruction regardless of the setting.
- Topic/hashtag scoping keeps even "All time" searches efficient — the index narrows the file set before the AI touches anything.

**Architecture note for Agent 3:** The topic/hashtag system is the Concierge's index. Files' topics and hashtags should be indexed as lightweight metadata (not full embeddings) for fast scoping. Vector/semantic search (Pinecone — see Q13 in Today Bible) is the fallback for fuzzy queries where the user doesn't specify a topic or hashtag.

---

## Settings Not Yet Specified

The following pages will add settings when their Bibles are written:

- **Journal Page** — editor preferences, AI analysis toggles, template settings, **journal session gap threshold** (currently hardcoded at 30 min in `JournalCanvas.tsx:GAP_THRESHOLD_MINUTES` — controls when a new timestamped entry section is created vs. appending to the existing one)
- **Insights Page** — correlation engine settings, date ranges, visible charts
- **Topics Page** — default topic structure, scraping preferences
- **Captures** — auto-processing rules, default save locations
- **Calendar Page** — connected calendar sources, sync frequency, default calendar for new events

---

*Feature Bible — Settings Page — v0.1*
*Extracted from Today Page Bible v0.3*
*February 22, 2026*
*New settings sections will be added as page Bibles are written*
