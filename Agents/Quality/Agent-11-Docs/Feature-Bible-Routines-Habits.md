# Feature Use Case Bible — Routines & Habits Page

**Version:** 0.2 (Research Brief + User Q&A Resolved)
**Status:** RESEARCH COMPLETE, Q&A RESOLVED — Awaiting Sprint 17 planning + Design Agent specs
**Scope:** ROUTINES & HABITS PAGE (`/routines`) — the full routine management and habit tracking surface, distinct from the Today page's Routines widget
**Compiled by:** Director + Research (competitive analysis of 8 apps)
**Date:** February 25, 2026
**Target Sprint:** 17+
**Purpose:** Define what the Routines & Habits page should do, based on competitive research across top habit tracking apps, existing Kaivoo patterns, and user workflow.

---

## How This Document Relates to the Today Bible

The **Today page** has a Routines *widget* — a focused, day-scoped view of today's routines with icon buttons, categories (Morning, Evening, etc.), and checkmark completion. That widget is fully documented in `Feature-Bible-Today-Page.md`.

The **Routines & Habits page** (`/routines`) is the *full* routine management and habit tracking surface — every routine, habit history, streaks, analytics, and scheduling configuration. It's where you go when you need to manage, analyze, and build your habits over time.

**The relationship:** Today's Routines widget shows you *what to do now*. The Routines & Habits page shows you *the full picture* — how you're doing, what's working, and where to improve.

---

## Competitive Research Summary

**Apps studied:** Streaks, Habitica, Daylio, Fabulous, Productive, Done, Loop Habit Tracker, Atoms

### Key Patterns Across the Category

The habit tracking category has converged on a set of proven UX patterns. The best apps share these:

1. **Streak counters** as the primary engagement mechanism (every app)
2. **Calendar dot/heatmap views** for visual history (Loop, Done, Daylio, Streaks)
3. **Time-of-day grouping** for daily organization (Productive, Fabulous)
4. **Satisfying completion micro-interactions** (Streaks: hold-to-fill; Atoms: color burst; Done: gray-to-color)
5. **Flexible frequency scheduling** beyond daily (specific days, X/week, X/month)
6. **Per-habit analytics** with completion rate, trends, and streaks
7. **Color-coding per habit** for visual identity and ambient progress

### Design Decisions Informed by Research

| Decision | Chosen Pattern | Source | Rationale |
|---|---|---|---|
| **Page layout** | Time-of-day sections (Morning/Afternoon/Evening) | Productive, Fabulous | Matches our existing Today widget categories. Natural daily rhythm. |
| **Completion interaction** | Tap with color-fill animation | Streaks, Done, Atoms | Elevates existing Today widget checkmark. Satisfying micro-reward. |
| **Streak model** | Habit strength score (0-100%) + streak counter | Loop + all apps | Strength score is psychologically superior (missing 1 day doesn't destroy progress). Streak counter provides "don't break the chain" motivation. Both together = best of both worlds. |
| **Frequency options** | Daily, specific days, X times/week | Streaks, Loop, Done | Covers 95% of real use cases. Our current daily-only model is too limited. |
| **Analytics** | Calendar dots + completion % + current/best streak + weekly trend | Loop, Done, Daylio | Proven patterns. Calendar dots are visual, completion % is motivating, trends show trajectory. |
| **Mood correlation** | Connect routines to existing Day Brief mood data | Daylio (unique to our app) | We already track mood — this is a differentiator no competitor has in a combined productivity app. |
| **Negative habits** | Pre-completed, un-check on failure | Streaks | Brilliant inversion — default is success, only interact when you slip. |
| **Forgiveness** | "Don't Miss Twice" buffer on streaks | Atoms | Reduces perfectionism anxiety. Matches behavioral science. |

---

## Proposed Page Architecture

### Primary View: Today's Routines (Action Mode)

The default view when you land on `/routines`. Shows what you need to do today, organized by time of day.

```
┌──────────────────────────────────────────────────────────────────┐
│  Routines & Habits                          [Today] [Analytics]  │
│  8 habits · 3/8 done today                  [+ New Habit]        │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─ Overall Today Progress ──────────────────────────────────┐   │
│  │  ████████░░░░░░░░░░  38%    3 of 8 complete               │   │
│  └───────────────────────────────────────────────────────────┘   │
│                                                                   │
│  ═══ Morning ═══════════════════════════════════════════════════  │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  💧  Drink Water                    🔥 42 days    ✓ Done   │  │
│  │      Daily · Strength: 94%                                  │  │
│  ├────────────────────────────────────────────────────────────┤  │
│  │  🧘  Meditate 10min                 🔥 12 days    ○        │  │
│  │      Daily · Strength: 67%                                  │  │
│  ├────────────────────────────────────────────────────────────┤  │
│  │  🏋️  Exercise                       🔥 8 days     ○        │  │
│  │      Mon/Wed/Fri · Strength: 71%                            │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                   │
│  ═══ Afternoon ════════════════════════════════════════════════   │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  📖  Read 20 pages                  🔥 5 days     ○        │  │
│  │      Daily · Strength: 58%                                  │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                   │
│  ═══ Evening ══════════════════════════════════════════════════   │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  🚫  No Junk Food                   🔥 15 days    ✓ Auto   │  │
│  │      Negative · Strength: 82%         (pre-completed)       │  │
│  ├────────────────────────────────────────────────────────────┤  │
│  │  📓  Journal                        🔥 3 days     ○        │  │
│  │      Daily · Strength: 45%                                  │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                   │
│  ═══ Anytime ══════════════════════════════════════════════════   │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  💧  Drink Water (8x/day)           ⏺⏺⏺⏺⏺○○○  5/8     │  │
│  │      Multi-count · Strength: 76%                            │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

### Secondary View: Analytics Mode

Accessed via the [Analytics] toggle. Shows habit history, trends, and insights.

```
┌──────────────────────────────────────────────────────────────────┐
│  Routines & Habits                          [Today] [Analytics]  │
│  8 habits · Overall strength: 74%           [+ New Habit]        │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─ This Week ───────────────────────────────────────────────┐   │
│  │  Mon  Tue  Wed  Thu  Fri  Sat  Sun                         │   │
│  │  6/8  7/8  5/8  8/8  ·    ·    ·     ← dot = future       │   │
│  │  75%  88%  63%  100%                                       │   │
│  └───────────────────────────────────────────────────────────┘   │
│                                                                   │
│  ┌─ Habit Strength Rankings ─────────────────────────────────┐   │
│  │  💧 Drink Water          ████████████████████░  94%        │   │
│  │  🚫 No Junk Food         ████████████████░░░░░  82%        │   │
│  │  💧 Water 8x/day         ███████████████░░░░░░  76%        │   │
│  │  🏋️ Exercise              ██████████████░░░░░░░  71%        │   │
│  │  🧘 Meditate              █████████████░░░░░░░░  67%        │   │
│  │  📖 Read                  ███████████░░░░░░░░░░  58%        │   │
│  │  📓 Journal               █████████░░░░░░░░░░░░  45%        │   │
│  └───────────────────────────────────────────────────────────┘   │
│                                                                   │
│  ┌─ Mood Correlation ────────────────────────────────────────┐   │
│  │  "Days you exercise correlate with 23% higher mood"        │   │
│  │  "Your best mood days include: Exercise + Meditate + Read" │   │
│  │  "Journaling habit is strongest on weekends"               │   │
│  └───────────────────────────────────────────────────────────┘   │
│                                                                   │
│  ┌─ Monthly Calendar (tap habit to filter) ──────────────────┐   │
│  │                  February 2026                              │   │
│  │  Mo Tu We Th Fr Sa Su                                       │   │
│  │   ●  ●  ●  ●  ●  ○  ○    ● = completed all                │   │
│  │   ●  ●  ◐  ●  ●  ●  ○    ◐ = partial                      │   │
│  │   ●  ●  ●  ●  ○  ○  ○    ○ = missed                       │   │
│  │   ●  ●  ●  ·  ·  ·  ·    · = future                       │   │
│  └───────────────────────────────────────────────────────────┘   │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

### Habit Detail View (Drill-in)

Clicking any habit opens a detail drawer/page with full history and stats.

```
┌──────────────────────────────────────────────────────────────┐
│  🧘 Meditate 10min                              [Edit] [⋮]   │
│                                                                │
│  Current streak: 12 days                                       │
│  Best streak: 28 days                                          │
│  Strength: 67%                                                 │
│  Completion rate: 72% (last 30 days)                           │
│                                                                │
│  Schedule: Daily                                               │
│  Time block: Morning                                           │
│  Type: Positive                                                │
│                                                                │
│  ┌─ Calendar ────────────────────────────────────────────┐    │
│  │         February 2026                                  │    │
│  │  Mo Tu We Th Fr Sa Su                                  │    │
│  │   ●  ●  ●  ●  ●  ○  ●                                 │    │
│  │   ●  ●  ○  ●  ●  ●  ●                                 │    │
│  │   ●  ●  ●  ●  ○  ○  ●                                 │    │
│  │   ●  ●  ●  ·  ·  ·  ·                                 │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                │
│  ┌─ Strength Over Time ──────────────────────────────────┐    │
│  │   100%|                              ____              │    │
│  │    75%|              ______/‾‾‾‾‾‾‾‾‾                  │    │
│  │    50%|    ___/‾‾‾‾‾‾                                  │    │
│  │    25%|___/                                             │    │
│  │     0%└────────────────────────────────────────────    │    │
│  │        Jan 26  Jan 31  Feb 5   Feb 10  Feb 15  Feb 20  │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                │
│  ┌─ Mood Impact ─────────────────────────────────────────┐    │
│  │  Days with meditation: avg mood 4.2/5                  │    │
│  │  Days without: avg mood 3.4/5                          │    │
│  │  Confidence: High (45 data points)                     │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                │
└──────────────────────────────────────────────────────────────┘
```

---

## Data Model (Proposed)

### Habit Type

```typescript
type HabitType = 'positive' | 'negative' | 'timed' | 'multi-count';
type TimeBlock = 'morning' | 'afternoon' | 'evening' | 'anytime';

interface HabitSchedule {
  type: 'daily' | 'specific_days' | 'x_per_week' | 'x_per_month';
  days?: number[];          // 0=Sun, 1=Mon, ... 6=Sat (for specific_days)
  timesPerPeriod?: number;  // for x_per_week, x_per_month
}

interface Habit {
  id: string;
  userId: string;
  name: string;
  icon: string;             // Emoji or icon identifier
  color: string;            // Hex color
  type: HabitType;
  timeBlock: TimeBlock;
  schedule: HabitSchedule;
  targetCount?: number;     // For multi-count (e.g., 8 glasses of water)
  targetMinutes?: number;   // For timed habits
  strength: number;         // 0-100, exponential smoothing score
  currentStreak: number;
  bestStreak: number;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### Habit Completion Type

```typescript
interface HabitCompletion {
  id: string;
  habitId: string;
  userId: string;
  date: string;             // 'yyyy-MM-dd'
  completed: boolean;       // false = missed/skipped, true = done
  count?: number;           // For multi-count habits
  minutes?: number;         // For timed habits
  skipped: boolean;         // Skipped (preserves streak) vs missed (breaks streak)
  moodScore?: number;       // Link to mood entry for that day (for correlation)
  createdAt: Date;
}
```

### Habit Strength Algorithm (from Loop)

```
After each day:
  If completed: strength = strength + (1 - strength) * decay_factor
  If missed:    strength = strength * decay_factor

Where decay_factor = 0.5^(1/half_life)
  - Daily habits: half_life ≈ 13 days
  - Weekly habits: half_life ≈ 7 weeks
```

This means:
- Perfect daily habit → 80% at 1 month, 96% at 2 months, 99% at 3 months
- Missing a week after a strong streak → dips but recovers quickly
- Psychologically honest: reflects actual consistency, not binary success/failure

---

## Feature Priorities (Updated per User Q&A)

### P0 — Core (Must Ship in Sprint 17)

1. **Full habits list with time-of-day sections** (Morning/Afternoon/Evening/Anytime)
2. **Three habit types:** Positive, Negative (zero-target), Multi-count (progress ring)
3. **Habit completion** with satisfying color-fill animation
4. **Streak counter** per habit (current + best)
5. **Habit strength score** (0-100%) with exponential smoothing
6. **Milestone badges** for streak achievements (7, 30, 100 days) with visual celebration
7. **Habit CRUD** (create, edit, archive, delete) with icon, color, schedule
8. **Frequency scheduling** — daily, specific days, X times/week
9. **Habit detail view** with calendar dots + strength chart
10. **Full analytics:** weekly dashboard, strength rankings, monthly calendar, completion %
11. **Mood-habit correlation** — connect completions to Day Brief mood data
12. **Today widget upgrade** — add streak counts + strength indicators to existing widget
13. **Data migration** — existing routines → new habit data model (unified system)
14. **Sync** — completions on Today widget or Routines page update both

### P1 — Fast Follow (Sprint 17 stretch or Sprint 18)

15. **"Don't Miss Twice" forgiveness** — 1-day buffer before streak breaks
16. **Year in Pixels** — annual heatmap visualization (Daylio pattern)
17. **Export/import** — habits + completions in data export

### P2 — Enhancements (Sprint 18+)

18. **Timed habits** — built-in timer for duration-based habits (4th type)
19. **Habit categories** — user-defined categories beyond time blocks
20. **Habit suggestions** — curated library of popular habits

### P3 — Future (Sprint 19+)

21. **Habit stacking** — sequential routine builder (Fabulous pattern)
22. **Custom rewards** — earn points, define real-life treats (Habitica pattern)
23. **Identity-based habit creation** — "I do X to become Y" (Atoms pattern)
24. **Advanced gamification** — levels, XP, unlockables (if moderate badges prove engaging)

---

## User Q&A — Resolved February 25, 2026

### Q1: Habit types for v1?
**Answer: Positive + Negative + Multi-count.** Timed habits deferred to Sprint 18+.
- Positive: Standard habits to build (exercise, read, meditate)
- Negative: Habits to break (no junk food, no smoking) — zero-target model
- Multi-count: "X times per day" habits (drink 8 glasses of water) with progress ring

### Q2: Analytics depth for v1?
**Answer: Full.** Ship with mood-habit correlation, weekly dashboard, strength rankings.
- Calendar dot view per habit
- Habit strength score chart (0-100% over time)
- Completion rate per habit
- Mood-habit correlation (leverage existing Day Brief mood data — unique differentiator)
- Weekly overview dashboard with daily completion summaries
- Strength rankings across all habits

### Q3: Today widget integration?
**Answer: Upgrade widget.** Today widget gains streak counts and strength indicators from the new habit system. Richer glanceable data on the Today page, powered by the same unified data model.

### Q4: Gamification level?
**Answer: Moderate.** Streaks + strength score + milestone badges for streak achievements (7 days, 30 days, 100 days). Visual celebration moments on milestone hits. No points/levels/rewards system.

### Q5: Merge or coexist?
**Answer: Merge (upgrade).** Migrate existing routines into the new habit data model. One unified system. Existing routine data (completed_dates, streaks, categories) will be migrated into the new habit + habit_completions schema. Breaking change to data model — migration required.

### Q6: Negative habit UX?
**Answer: Zero target (Done model).** Set a target of 0 occurrences. Tap to log each slip. Tracks frequency of failure rather than assuming success. This gives better data for analytics (how often do I slip? trending up or down?).

---

## Design Agent Gate Requirements

Before Sprint 17 implementation begins:

1. **Visual Design Agent** — Component specs: habit row, time-block section headers, completion animation, strength bar, calendar dots, habit detail drawer, analytics cards
2. **Accessibility & Theming Agent** — Dark mode tokens, focus states, ARIA for progress indicators, screen reader announcements for completions, color-blind safe habit colors
3. **UX Completeness Agent** — State inventory (empty habits, first-time experience, all-complete state, no-data analytics), navigation flow (Today ↔ Routines page), error states

---

## Relationship to Existing Data

### Current Routines in Supabase

The existing `routines` table has:
- `id, user_id, name, icon, category, is_completed_today, frequency, target_days, completed_dates, streak, best_streak, created_at, updated_at`

### Migration Strategy (TBD — depends on Q5 answer)

If merging: the existing `routines` table would need new columns (type, time_block, schedule, strength, color) and a new `habit_completions` table for per-day tracking. Existing `completed_dates` array could be migrated to individual completion rows.

If coexisting: new `habits` and `habit_completions` tables alongside existing `routines`. Routines continue to power the Today widget, habits power the new page.

---

*Feature Use Case Bible — Routines & Habits Page — v0.1 (Research Brief)*
*Compiled by Director + Research (competitive analysis of 8 apps)*
*February 25, 2026*
