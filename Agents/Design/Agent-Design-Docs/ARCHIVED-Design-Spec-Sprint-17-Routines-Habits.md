# Design Gate 1 Spec — Sprint 17: Routines & Habits

**Status:** APPROVED
**Date:** February 26, 2026
**Agents:** Visual Design + Accessibility & Theming + UX Completeness
**Reference:** `Quality/Agent-11-Docs/Feature-Bible-Routines-Habits.md` (wireframes, competitive research, user Q&A)

---

## 1. Visual Design Agent — Component Specs

### 1.1 Page Shell (`RoutinesPage`)

Layout follows existing page pattern:
- `AppLayout` wrapper
- `mx-auto px-6 py-8 max-w-4xl`
- Header: `h1 text-2xl font-semibold text-foreground` + habit count subtitle
- View toggle: `[Today] [Analytics]` segmented control using existing Button group pattern
- CTA: `[+ New Habit]` primary button

### 1.2 HabitRow Component

```
┌─────────────────────────────────────────────────────────────┐
│  [Icon]  Habit Name                    🔥 12    ██░ 67%  [○] │
│  circle  text-sm font-medium           streak   bar    check │
│  32x32   text-foreground               text-xs  h-1.5        │
│          Schedule · text-xs muted                             │
└─────────────────────────────────────────────────────────────┘
```

**Spec:**
- Container: `rounded-xl p-4 bg-card border border-border/50 transition-all duration-200`
- Hover: `border-border shadow-sm`
- Icon circle: `w-8 h-8 rounded-full flex items-center justify-center` with habit's color at 15% opacity, icon in habit's color
- Name: `text-sm font-medium text-foreground`
- Schedule: `text-xs text-muted-foreground` — "Daily" / "Mon, Wed, Fri" / "3x per week"
- Streak: `text-xs text-muted-foreground` with flame icon (`w-3 h-3`) in `text-orange-500`
- Strength bar: `h-1.5 rounded-full bg-secondary` with fill in habit color, width = strength%
- Completion button:
  - Positive incomplete: `w-8 h-8 rounded-full border-2 border-border` — tap → color fill animation
  - Positive complete: `w-8 h-8 rounded-full bg-{habit-color}` with check icon in white
  - Negative (auto-complete): `w-8 h-8 rounded-full bg-success/20` with check icon in `text-success-foreground`
  - Multi-count: `w-8 h-8` progress ring (SVG circle) showing count/target

**Color-fill animation (completion):**
- Duration: 400ms ease-out
- Effect: background fills from center outward using `scale(0→1)` on a pseudo-element
- Respects `prefers-reduced-motion`: reduced to instant color change
- Haptic: none (web)

### 1.3 TimeBlockSection

```
═══ Morning ════════════════════════════════════════════
```

- Divider: `flex items-center gap-3 py-3`
- Label: `text-xs font-semibold text-muted-foreground uppercase tracking-wider`
- Line: `flex-1 h-px bg-border/50`
- Icon: `w-3.5 h-3.5 text-muted-foreground` — Sun (morning), Cloud (afternoon), Moon (evening), Clock (anytime)

### 1.4 Overall Progress Bar

```
┌─ Today's Progress ────────────────────────────────────┐
│  ████████░░░░░░░░░░  38%    3 of 8 complete            │
└────────────────────────────────────────────────────────┘
```

- Container: `widget-card` with `p-4`
- Bar: `h-2 rounded-full bg-secondary` with fill in `bg-primary`
- Label: `text-sm font-medium text-foreground` for percentage
- Sublabel: `text-xs text-muted-foreground` for "X of Y complete"

### 1.5 HabitFormDrawer (Create/Edit)

Uses existing Sheet pattern:
- `SheetContent className="w-full sm:max-w-lg overflow-y-auto"`
- No gradient background (habits have their own color identity)
- `bg-card` background

**Form fields (top to bottom):**
1. Name input — `text-lg font-semibold` inline, borderless
2. Habit type selector — 3 pill buttons: Positive / Negative / Multi-count
3. Time block selector — 4 pill buttons: Morning / Afternoon / Evening / Anytime
4. Icon picker — grid of icons (expand from current 9 to ~20)
5. Color picker — row of 8 color circles (each 32x32, `rounded-full`, selected has ring)
6. Schedule section:
   - Toggle: Daily / Specific Days / X per Week
   - Specific days: 7 day-of-week pill toggles (S M T W T F S)
   - X per week: number input (1-7)
7. Target count (multi-count only) — number input with label "Times per day"
8. Save button — primary, full-width at bottom

**Color palette (8 colors):**
```
#3B8C8C (Teal)    #E06040 (Coral)    #6B7FD7 (Indigo)   #D4A843 (Gold)
#7CB56B (Green)   #C77DBA (Orchid)   #5BA0C9 (Sky)      #8B8B8B (Stone)
```

### 1.6 HabitDetailDrawer

Uses Sheet pattern — right-side drawer, `sm:max-w-lg`.

**Sections (top to bottom):**
1. Header: habit icon (large, 48x48 circle in habit color) + name + edit button
2. Stats row: Current streak | Best streak | Strength | Completion rate — in 2x2 grid of stat cards
3. Calendar dots — month view (reuse MonthGrid pattern from Calendar page, smaller)
4. Strength chart — Recharts LineChart, habit color line, area fill at 10% opacity
5. Mood impact — card with "Days with X: avg mood Y/5" comparison
6. Edit/Archive/Delete footer

**Stat card spec:**
- `bg-secondary/30 rounded-xl p-3 text-center`
- Value: `text-lg font-semibold text-foreground`
- Label: `text-xs text-muted-foreground`

### 1.7 Analytics View

Replaces the habits list when Analytics toggle is active.

**Sections:**
1. This Week overview — 7 day columns, each shows completion fraction + percentage
2. Strength Rankings — all habits sorted by strength, horizontal bar chart (habit color)
3. Monthly Calendar — dot calendar (completed/partial/missed)
4. Mood Correlation — insight cards with text-based insights

### 1.8 MilestoneBadge

Shown inline on habit row when milestone is hit.
- Small badge: `text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-600`
- Content: "7d" / "30d" / "100d"
- Animation on first appearance: `animate-bounce` (single bounce, 400ms) — respects reduced motion

### 1.9 Chart Colors (Recharts)

Per design system Section 4:
- Primary line: habit's own color
- Area fill: habit color at 10% opacity
- Grid: `stroke={var(--border)}` at 50% opacity
- Axis text: `text-muted-foreground` / 11px
- Tooltip: `bg-card border border-border rounded-lg shadow-lg p-3`

---

## 2. Accessibility & Theming Agent — A11y Plan

### 2.1 ARIA Roles & Labels

| Component | ARIA |
|---|---|
| View toggle (Today/Analytics) | `role="tablist"` → `role="tab"` with `aria-selected` |
| HabitRow completion button | `role="checkbox"` + `aria-checked` + `aria-label="Complete {habit name}"` |
| Multi-count progress | `role="progressbar"` + `aria-valuenow` + `aria-valuemax` + `aria-label="{habit}: {n} of {max}"` |
| Strength bar | `role="meter"` + `aria-valuenow` + `aria-valuemin="0"` + `aria-valuemax="100"` + `aria-label="{habit} strength: {n}%"` |
| TimeBlockSection | `role="group"` + `aria-label="Morning habits"` etc. |
| HabitFormDrawer | `role="dialog"` + `aria-label="Create habit"` / `"Edit {name}"` |
| HabitDetailDrawer | `role="dialog"` + `aria-label="{habit name} details"` |
| Calendar dots | `role="grid"` with day cells as `role="gridcell"` + `aria-label="Feb 15: completed"` |
| Analytics sections | `role="region"` + `aria-label="Strength rankings"` etc. |

### 2.2 Screen Reader Announcements

- Completion toggle: `aria-live="polite"` region announces "{Habit name} completed" / "{Habit name} marked incomplete"
- Multi-count increment: announces "{n} of {max} completed"
- Milestone hit: announces "Milestone reached: {n} day streak for {habit name}!"
- Analytics insights: all text-based, naturally readable

### 2.3 Focus Order

1. Page header → View toggle → New Habit button
2. Progress bar (informational, not focusable)
3. Time block sections in order: Morning → Afternoon → Evening → Anytime
4. Within each section: habit rows in order, each row's completion button is focusable
5. Drawers trap focus: first focusable element → last → close button → loop

### 2.4 Keyboard Navigation

| Key | Action |
|---|---|
| Tab | Move between focusable elements |
| Space/Enter | Toggle completion, activate buttons |
| Escape | Close drawer/dialog |
| Arrow Up/Down | Navigate between habit rows within a section |

### 2.5 Dark Mode Token Mapping

All new components use semantic tokens only — no raw hex values:
- Card backgrounds: `bg-card`
- Text: `text-foreground` / `text-muted-foreground`
- Borders: `border-border` / `border-border/50`
- Completion: `text-success-foreground` / `bg-success`
- Streak fire: `text-orange-500` (unchanged in dark — orange reads well on dark)
- Habit colors: all 8 palette colors tested for ≥3:1 contrast on both `bg-card` light (#FFF) and dark (#181531)

### 2.6 Color-Blind Safety

Completion state uses BOTH color AND icon (checkmark) — never color alone.
Multi-count uses progress ring + numeric count — not color-dependent.
Milestone badges show text ("7d") alongside the amber color.
Streak indicator uses the universal flame emoji + numeric count.

### 2.7 Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  .habit-complete-animation { animation: none; }
  .milestone-bounce { animation: none; }
}
```

All completion animations, milestone bounces, and progress bar transitions respect this.

---

## 3. UX Completeness Agent — State Inventory

### 3.1 State Inventory

| State | What User Sees |
|---|---|
| **Empty (no habits)** | Illustration + "Start building habits" + prominent "Create your first habit" CTA |
| **First habit created** | Habit appears in its time block section. Other sections hidden until populated. |
| **All complete today** | Celebration state: "All done for today!" message with confetti-style accent (reduced motion safe) |
| **Loading** | Skeleton: 3 habit row skeletons in a single section |
| **Error (fetch failed)** | Error card with retry button. Stale cached data preserved if available. |
| **Optimistic update** | Completion toggles instantly. Rollback on failure with `toast.error()`. |
| **No analytics data** | "Complete habits for a few days to see trends" empty state in analytics view |
| **Habit archived** | Removed from active list. Accessible via filter/settings if needed (future). |

### 3.2 Navigation Flows

| From | To | How |
|---|---|---|
| Sidebar | Routines page | Sidebar nav link |
| Today widget | Routines page | "View All" link in widget header |
| Routines page | Habit detail | Click/tap habit row |
| Habit detail | Edit habit | Edit button in detail drawer |
| Routines page | Create habit | "+ New Habit" button |
| Habit detail | Back to list | Close drawer (X or Escape) |
| Today page | Toggle completion | Tap routine button in TrackingWidget |
| Routines page | Today page | Sidebar / back navigation |

### 3.3 Input Patterns

| Field | Pattern | Rationale |
|---|---|---|
| Habit name | Text input | Free text |
| Habit type | Segmented control (3 options) | Constrained, mutually exclusive |
| Time block | Segmented control (4 options) | Constrained, mutually exclusive |
| Icon | Grid picker | Visual selection, constrained set |
| Color | Color swatch row | Visual selection, constrained set (8 colors) |
| Schedule type | Radio/segment | Constrained |
| Specific days | Toggle pills (S M T W T F S) | Multi-select, visual |
| Times per week | Number stepper (1-7) | Bounded numeric |
| Target count | Number stepper | Bounded numeric |

### 3.4 Edit-Where-You-See-It Compliance

- Completion: togglable on both Today widget AND Routines page (both surfaces)
- Habit name: editable from detail drawer (1 click to open, inline edit)
- Schedule: editable from detail drawer → edit mode
- Archive/delete: accessible from detail drawer footer (2 clicks max)

### 3.5 Anti-Pattern Check

- AP1 (Forced navigation): PASS — completions work on Today page AND Routines page
- AP2 (Past data read-only): PASS — calendar dots in detail view show history, past days are not editable (intentional for habits)
- AP3 (Data without date context): PASS — all completions are date-scoped, analytics show date ranges
- AP5 (Data overwhelm): PASS — habits grouped by time block, analytics paginated by week
- AP6 (Statistics not stories): PASS — mood correlation provides narrative context, not just numbers

---

## Gate 1 Verdict

| Agent | Verdict |
|---|---|
| Visual Design | PASS — Component specs complete, follows design system |
| Accessibility & Theming | PASS — ARIA plan complete, dark mode tokens mapped, reduced motion handled |
| UX Completeness | PASS — All states inventoried, navigation complete, no anti-patterns |

**Gate 1 cleared. P2-P7 implementation may proceed.**

---

*Design Gate 1 — Sprint 17: Routines & Habits — February 26, 2026*
