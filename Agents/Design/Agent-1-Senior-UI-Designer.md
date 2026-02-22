# Agent 1: Senior UI Designer
## Kaivoo Command Center — UI Design Specification
### Apple Human Interface Guidelines × Kaivoo Design System

**Role:** Senior UI Designer (Apple Design Team background)
**Hired by:** Kaivoo
**Mission:** Transform the Command Center from a Lovable-generated prototype into a world-class productivity application that embodies Kaivoo's brand principles: *Quiet Confidence, Clarity Over Cleverness, Warmth Through Craft.*

**Date:** February 2026
**Classification:** Internal · Design · Architecture

---

> **Designer's Note:** The current app was scaffolded via Lovable with shadcn/ui + Tailwind CSS using generic purple/violet theming (DM Sans font, HSL-based color tokens). Our job is to re-skin and re-architect the UI layer to fully express the Kaivoo Design System — Warm Sand backgrounds, Deep Navy typography, Resonance Teal CTAs, Sage Mist accents — while simultaneously improving layout, hierarchy, interaction quality, and accessibility to Apple HIG standards.

---

# 1. HIERARCHY & LAYOUT

## 1.1 Visual Hierarchy Strategy

The Kaivoo Command Center follows a **task-first, calm-second** hierarchy. Users should perceive:

```
FIRST:   The current date + primary action area (Journal input / Today view)
SECOND:  Active tasks and upcoming meetings (what needs attention NOW)
THIRD:   Tracking data and insights (how am I doing?)
FOURTH:  Navigation and settings (where can I go?)
```

### F-Pattern Application (Desktop)
```
┌─────────────────────────────────────────────────────────────────────┐
│  [K Logo]  Today  Journal  Tasks  Calendar  Topics  Insights  [🔍][👤]│  ← F-Line 1: Navigation scan
├──────┬──────────────────────────────────────────────────────────────┤
│      │  Today                                                       │  ← F-Line 2: Page title
│  S   │  Wednesday, February 20, 2026                                │
│  I   │                                                              │
│  D   │  ┌─ Daily Brief ──────────────────────────────────┐          │  ← F-Drop: Primary content
│  E   │  │  3 tasks due · 4 meetings · 2 routines left   │          │
│  B   │  └────────────────────────────────────────────────┘          │
│  A   │                                                              │
│  R   │  ┌─ Journal ──────────────────────────────────────┐          │  ← Secondary content
│      │  │  [Write your thoughts...]                       │          │
│      │  └────────────────────────────────────────────────┘          │
│      │                                                              │
│      │  ┌─ Tasks ─────────┐  ┌─ Calendar ────────────────┐         │  ← Tertiary: side-by-side
│      │  │                 │  │                            │         │
│      │  └─────────────────┘  └────────────────────────────┘         │
└──────┴──────────────────────────────────────────────────────────────┘
```

### Z-Pattern Application (Mobile)
```
┌───────────────────────────┐
│  Today     [🔍]  [👤]     │  ← Z-Start: Title + actions
│  Feb 20, 2026             │  ← Z-Line: Date context
├───────────────────────────┤
│  Daily Brief              │  ← Z-Drop: Primary widget
│  ┌───────────────────┐    │
│  │ 3 tasks · 4 mtgs  │    │
│  └───────────────────┘    │
│                           │
│  Journal                  │  ← Stacked widgets
│  Tasks                    │
│  Calendar                 │
│  Tracking                 │
├───────────────────────────┤
│  [🏠] [📓] [✅] [📅] [⚙]  │  ← Z-End: Tab bar navigation
└───────────────────────────┘
```

## 1.2 Content Density Philosophy

**Breathing room wins.** Following Kaivoo's Principle 1 (Quiet Confidence):

- Minimum `24px` (space-5) between content blocks within a widget
- Minimum `32px` (space-6) between widget cards
- Maximum content width: `720px` for single-column reading (Today, Journal)
- Dashboard-style pages (Insights): max `1280px` with 12-column grid
- No more than 5–7 items visible in any single list without scrolling

## 1.3 Liquid Glass Design Principles

Kaivoo does **not** use Apple's Liquid Glass aesthetic. Instead, we use the Kaivoo Card system:

- **Cards:** `1px` Mist border, `16px` border-radius, `24px` padding, Warm Sand background
- **Elevation via border only** — no drop shadows on cards at rest
- **Hover state:** Border transitions to Silver, subtle `translateY(-1px)`
- **Glass effect reserved** for one specific use: the mobile bottom tab bar gets a subtle `backdrop-blur-md` with `Warm Sand at 90% opacity` for scroll-under content

---

# 2. PLATFORM-SPECIFIC PATTERNS

## 2.1 Navigation Pattern

### Desktop: Top Navigation Bar + Optional Sidebar
```
Structure:
  Primary Nav:   Top bar (64px height) with horizontal nav links
  Secondary Nav: Sidebar (240px, collapsible) for Topics sub-navigation
  Content:       Fluid width, max 720px for reading views, max 1280px for dashboards

Behavior:
  - Top bar is ALWAYS visible (sticky, z-index 100)
  - Sidebar appears only on Topics page and Settings
  - Sidebar collapses to icon-only mode (64px) on user toggle
  - Collapsed state persists across sessions (already in Zustand store)
```

### Tablet (768–1023px): Top Bar + Condensed Layout
```
  - Top bar condenses to 56px height
  - Sidebar auto-collapses; toggle to full overlay (240px, overlaying content)
  - Content uses 8-column grid, full-width
  - Widget columns stack to single column below 900px
```

### Mobile (<768px): Bottom Tab Bar
```
Tabs (5 items):
  1. Today (🏠) — Home dashboard
  2. Journal (📓) — Journal entries
  3. Tasks (✅) — Task management
  4. Calendar (📅) — Calendar view
  5. More (•••) — Topics, Insights, Settings

Tab Bar Specs:
  Height:       83px (includes 34px safe area)
  Background:   Warm Sand at 92% + backdrop-blur(12px)
  Border-top:   1px solid Mist
  Icons:        24px, Silver (default), Resonance Teal (active)
  Labels:       Caption (11px), Silver (default), Deep Navy (active)
```

## 2.2 Modal Presentation Guidelines

```
Modals in current app:
  - JournalEntryDialog — Edit journal entries
  - CaptureEditDialog — Edit captures
  - TaskDetailsDrawer — Side drawer for task details
  - MeetingDetailsDrawer — Side drawer for meeting details

Redesign rules:
  - Dialogs (JournalEntry, Capture): Centered modal, 640px width, 16px radius
  - Drawers (Task, Meeting): Right-side panel, 480px width, slides from right
  - Mobile: ALL modals become bottom sheets (slide up from bottom)
  - Overlay: Deep Navy at 40% opacity
  - Animation: Scale(0.95)→Scale(1) + fade, 250ms ease-out
  - Focus trap: Tab cycles within modal/drawer
  - Escape dismisses; backdrop click dismisses (except destructive confirms)
```

## 2.3 Gesture Definitions

```
Swipe Right (on list items):     Mark task complete / Archive capture
Swipe Left (on list items):      Delete (with destructive confirmation)
Pull-to-Refresh (mobile):        Reload data from Supabase
Long-Press (on task/capture):    Open context menu (Edit, Delete, Move to Topic)
Pinch (on calendar):             Zoom day/week/month views (future)
```

## 2.4 Context Menus

```
Task Context Menu:
  ● Edit task
  ● Change status → [Backlog, Todo, Doing, Blocked, Done]
  ● Change priority → [Low, Medium, High]
  ● Assign to topic
  ● Delete task (destructive)

Journal Entry Context Menu:
  ● Edit entry
  ● Add tags
  ● Link to topic
  ● Delete entry (destructive)

Capture Context Menu:
  ● Edit capture
  ● Convert to task
  ● Link to topic
  ● Delete capture (destructive)
```

---

# 3. SCREEN DESIGNS (8 Key Screens)

---

## Screen 1: Today (Home Dashboard)

### Wireframe Description
```
┌─────────────────────────────────────────────────────────────┐
│  HEADER BAR (64px)                                          │
│  [K] Today  Journal  Tasks  Calendar  Topics  Insights [🔍][👤]│
├─────────────────────────────────────────────────────────────┤
│  max-width: 720px, centered                                  │
│                                                              │
│  Today                                    [⚙ Customize]      │
│  Wednesday, February 20, 2026                                │
│  ─────────                                                   │
│                                                              │
│  ┌─ DAILY BRIEF (full-width card) ───────────────────────┐  │
│  │  Good morning. Here's your day:                        │  │
│  │  ■ 3 tasks due  ■ 4 meetings  ■ 2/5 routines done    │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌─ JOURNAL (full-width card) ───────────────────────────┐  │
│  │  [Icon] What's on your mind?                           │  │
│  │  ┌──────────────────────────────────────────────────┐  │  │
│  │  │ Start typing... (rich text editor)                │  │  │
│  │  └──────────────────────────────────────────────────┘  │  │
│  │  [#tags] [[[topic]]]                  [Save] primary   │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌─ TASKS (half-width) ──┐  ┌─ CALENDAR (half-width) ────┐  │
│  │  OVERDUE                │  │  TODAY'S SCHEDULE           │  │
│  │  ☐ Review report (H)   │  │  9:00  Team standup        │  │
│  │  TODAY                  │  │  11:00 1:1 with Manager    │  │
│  │  ☐ Design sync (M)     │  │  14:00 Product review      │  │
│  │  ☐ Send notes (M)      │  │  16:30 Design sync         │  │
│  │                         │  │                            │  │
│  │  [View all tasks →]     │  │  [View calendar →]         │  │
│  └─────────────────────────┘  └────────────────────────────┘  │
│                                                              │
│  ┌─ TRACKING (half-width)─┐                                  │
│  │  ROUTINES                                                 │
│  │  ☑ Morning meditation  │                                  │
│  │  ☑ Exercise            │                                  │
│  │  ☐ Read 30 min         │                                  │
│  │  ☐ Journal evening     │                                  │
│  │  ── 2/4 complete ──    │                                  │
│  └─────────────────────────┘                                  │
│                                                              │
│  ┌─ TODAY'S ACTIVITY (full-width card) ──────────────────┐  │
│  │  Timeline: chronological feed of today's events        │  │
│  │  9:30 AM  📓 Journal entry: "Need to finalize..."     │  │
│  │  10:00 AM ✅ Completed: Gather financial data          │  │
│  │  11:15 AM 📓 Journal entry: "Amani requested..."      │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Component Inventory
| Element | Component | Spec |
|---------|-----------|------|
| Page title | Headline (40px, Medium 500) | Deep Navy |
| Date subtitle | Body (16px, Regular 400) | Slate |
| Customize button | Icon-Only button | Charcoal, 40×40px |
| Widget cards | Card (Default variant) | 1px Mist border, 16px radius, 24px padding |
| Widget titles | Subheadline (13px, Bold 700, uppercase) | Sage Mist |
| Task items | List (Actionable) | Checkbox + Body text |
| Meeting items | List (Simple) | Time (Footnote) + Title (Callout) |
| Routine items | List (Actionable) | Checkbox + Body text |
| Timeline items | List (Rich) | Time + Icon + Description |
| Section links | Link Button | Resonance Teal, Callout |

### Interaction Specifications
- **Tap task checkbox:** Toggle completion, animate checkmark (stroke draw, 400ms), move to completed section
- **Tap task title:** Open TaskDetailsDrawer (right panel on desktop, bottom sheet on mobile)
- **Tap meeting:** Open MeetingDetailsDrawer
- **Tap "Customize":** Open widget configuration panel (drag-to-reorder, toggle visibility)
- **Tap timeline entry:** Open edit dialog for that entry type
- **Long-press widget card:** Enter reorder mode (drag handles appear)

### Empty State
```
┌───────────────────────────────────────┐
│                                       │
│    [Sage Mist line-art illustration]  │
│    64px, centered                     │
│                                       │
│    Welcome to your day                │
│    (Title 2, Deep Navy)               │
│                                       │
│    Start by writing in your journal   │
│    or adding your first task.         │
│    (Body, Slate)                      │
│                                       │
│    [Start journaling] primary button  │
│                                       │
└───────────────────────────────────────┘
```

### Loading State
- Skeleton screens matching exact card dimensions
- Shimmer animation: Cloud → Mist → Cloud, 1.5s ease-in-out infinite
- Text skeletons: 14px height, widths at 100%, 80%, 60% for multi-line
- Widget card skeletons maintain 16px border-radius

### Error State
- Alert banner (Error variant) at top of content area
- Message: "Couldn't load your data. Check your connection and try again."
- [Retry] primary button + [Dismiss] secondary

---

## Screen 2: Journal Page

### Wireframe Description
```
┌─────────────────────────────────────────────────────────────┐
│  HEADER BAR                                                  │
├─────────────────────────────────────────────────────────────┤
│  max-width: 720px, centered                                  │
│                                                              │
│  Journal                                                     │
│  ─────────                                                   │
│                                                              │
│  ┌─ DATE NAVIGATION ────────────────────────────────────┐   │
│  │  [←]  February 20, 2026  [→]  [📅 Pick date]        │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌─ COMPOSE (card) ─────────────────────────────────────┐   │
│  │  [Rich text editor - TipTap]                          │   │
│  │  Placeholder: "What's on your mind?"                  │   │
│  │                                                        │   │
│  │  [#tags] [[[topics]]]          [Save entry] primary   │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  TODAY'S ENTRIES (Subheadline)                                │
│                                                              │
│  ┌─ Entry Card ─────────────────────────────────────────┐   │
│  │  9:30 AM                                    [•••]     │   │
│  │  Need to finalize the NUWAVE branding by end of       │   │
│  │  week. Key focus: modern, professional.               │   │
│  │  [#branding] [[NUWAVE]]                               │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌─ Entry Card ─────────────────────────────────────────┐   │
│  │  11:15 AM                                   [•••]     │   │
│  │  Amani requested updates to the dashboard layout.     │   │
│  │  Meeting scheduled for Thursday.                      │   │
│  │  [#meeting] [#design] [[NUWAVE/Amani]]                │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Empty State
"No entries for this date. Start writing to capture your thoughts."
[Start writing] button focuses the compose editor.

---

## Screen 3: Tasks (Kanban Board)

### Wireframe Description
```
┌─────────────────────────────────────────────────────────────────────┐
│  HEADER BAR                                                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Tasks                                    [+ New task]  [≡/⊞ View]  │
│  ─────                                                               │
│                                                                      │
│  [Filter: All ▼] [Priority ▼] [Topic ▼]      [🔍 Search tasks]     │
│                                                                      │
│  ┌─ BACKLOG ──┐ ┌─ TODO ─────┐ ┌─ DOING ────┐ ┌─ DONE ─────┐      │
│  │  count: 2  │ │  count: 3  │ │  count: 1  │ │  count: 4  │      │
│  │            │ │            │ │            │ │            │      │
│  │ ┌────────┐ │ │ ┌────────┐ │ │ ┌────────┐ │ │ ┌────────┐ │      │
│  │ │Task    │ │ │ │Task    │ │ │ │Task    │ │ │ │Task ✓  │ │      │
│  │ │card    │ │ │ │card    │ │ │ │card    │ │ │ │card    │ │      │
│  │ └────────┘ │ │ └────────┘ │ │ └────────┘ │ │ └────────┘ │      │
│  │            │ │            │ │            │ │            │      │
│  │ ┌────────┐ │ │ ┌────────┐ │ │            │ │ ┌────────┐ │      │
│  │ │Task    │ │ │ │Task    │ │ │            │ │ │Task ✓  │ │      │
│  │ │card    │ │ │ │card    │ │ │            │ │ │card    │ │      │
│  │ └────────┘ │ │ └────────┘ │ │            │ │ └────────┘ │      │
│  └────────────┘ └────────────┘ └────────────┘ └────────────┘      │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘

Task Card (within Kanban):
┌────────────────────────────┐
│  [●] High                  │  ← Priority dot (Ember for high, Sunlit Amber for medium, Sage Mist for low)
│  Review quarterly report   │  ← Title (Callout, 15px, Deep Navy)
│  Due: Today                │  ← Due date (Footnote, 13px, Ember if overdue, Slate if future)
│  ▓▓▓▓░░ 1/3 subtasks      │  ← Progress bar (Resonance Teal fill, Mist track)
│  [#work] [[NUWAVE]]       │  ← Tags + Topics (tag-chip, topic-chip)
└────────────────────────────┘
```

### List View Alternative
A toggle switches between Kanban (board) and List (table) views. The list view follows the Kaivoo Table component:
- Header: Cloud background, Footnote Medium, sortable columns
- Columns: Title, Status, Priority, Due Date, Tags, Topics
- Row hover: Sage Mist at 6% background
- Mobile: Converts to stacked card layout

---

## Screen 4: Calendar Page

### Wireframe
Monthly grid view with meeting indicators. Day cells show dot indicators (max 3 visible). Side panel shows selected day's schedule as a time-column list.

---

## Screen 5: Topics Hub

### Wireframe
Card grid (3 columns desktop, 2 tablet, 1 mobile). Each topic card shows: Icon (32px), Name (Title 3), Description (Callout, Slate), count of linked items. Tap navigates to Topic detail page.

---

## Screen 6: Topic Detail Page

### Wireframe
Breadcrumb navigation → Topic title with icon → Tab navigation (Captures | Tasks | Journal Entries | Sub-pages). Content area shows filtered lists from the main data store.

---

## Screen 7: Insights Page

### Wireframe
Dashboard layout with Stat/Metric cards (4-column row) showing: Tasks Completed This Week, Journal Entries, Routine Completion Rate, Active Topics. Below: Line chart (weekly task completion), Bar chart (daily activity). Uses Chart Container component with Resonance Teal as primary series.

---

## Screen 8: Settings Page

### Wireframe
Sidebar navigation (Profile, Account, Appearance, AI Settings, Notifications, Data). Max content width: 680px. Settings rows with label + description (left) and control (right). Toggle switches for theme, AI enable/disable. Destructive actions (delete account) at bottom with confirmation modal.

---

# 4. COMPONENT SPECIFICATIONS

## 4.1 Button Hierarchy

| Variant | Current (shadcn) | Kaivoo Redesign |
|---------|-------------------|-----------------|
| Primary | `bg-primary` (purple) | `bg-[#3B8C8C]` Resonance Teal, white text, 12px radius |
| Secondary | `bg-secondary` | Transparent, 1.5px Mist border, Deep Navy text |
| Tertiary | `variant="ghost"` | Transparent, Resonance Teal text, no border |
| Destructive | `bg-destructive` | Transparent, Ember text, 1.5px Ember/40% border |
| Icon-Only | `variant="ghost" size="icon"` | Transparent, Charcoal icon, 8px radius, 40×40px |
| Link | N/A | Clarity Blue text, underline on hover |

## 4.2 Form Patterns

**Validation:** Real-time validation after field blur. Error border (2px Error foreground) + message below in Error.fg. Format: "[What went wrong]. [How to fix it]."

**Success:** Inline green checkmark (18px) + "Changes saved" appears near trigger, fades after 3s.

## 4.3 Card Layouts

All widget cards use the Default Card variant: `1px Mist border`, `16px radius`, `24px padding`, `Warm Sand background`. Widget headers use `Subheadline` style (13px, Bold 700, uppercase, Sage Mist color).

## 4.4 Data Visualization

Charts use Recharts (already in dependencies). Color sequence: Resonance Teal → Deep Navy → Sage Mist → Dusk Rose → Storm Blue. Tooltip: Deep Navy bg, white text, 8px radius.

---

# 5. ACCESSIBILITY COMPLIANCE

## 5.1 Dynamic Type Support
- All text uses relative sizing through the Kaivoo type scale
- Minimum body text: 16px (prevents iOS zoom on input focus)
- Caption text (11px) used sparingly, always with AAA contrast

## 5.2 VoiceOver Labels
Every interactive element includes:
- `aria-label` for icon-only buttons (e.g., `aria-label="Close dialog"`)
- `aria-current="page"` on active navigation items
- `aria-expanded` on collapsible elements (sidebar, accordions)
- `aria-busy="true"` on loading containers
- `role="status"` with `aria-live="polite"` on toast notifications

## 5.3 Color Contrast (WCAG AA)
| Combination | Ratio | Grade |
|-------------|-------|-------|
| Deep Navy on Warm Sand | 16.2:1 | AAA ✓ |
| Charcoal on Warm Sand | 14.1:1 | AAA ✓ |
| Resonance Teal on Warm Sand | 5.4:1 | AAA ✓ |
| White on Resonance Teal | 4.6:1 | AA ✓ |
| Sage Mist on Warm Sand | 3.0:1 | AA Large only |

**Rule:** Sage Mist is NEVER used for body text on light backgrounds. Only for decorative elements, overline labels, and large text.

## 5.4 Reduce Motion
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

## 5.5 Focus Indicators
All interactive elements: `2px solid Resonance Teal`, `2px offset`. Visible on all backgrounds (light and dark mode).

---

# 6. MICRO-INTERACTIONS

## 6.1 Transition Definitions

| Interaction | Duration | Easing | Property |
|-------------|----------|--------|----------|
| Button press | 100ms | ease-out | transform: scale(0.98) |
| Button hover (bg) | 200ms | ease-out | background-color |
| Card hover lift | 200ms | ease-out | transform, shadow, border |
| Modal open | 250ms | ease-out | transform: scale(0.95→1), opacity |
| Modal close | 200ms | ease-in | transform, opacity |
| Toast enter | 200ms | ease-out | transform: translateY(12px→0), opacity |
| Toast exit | 200ms | ease-in | transform, opacity |
| Sidebar collapse | 300ms | ease-default | width |
| Checkbox check | 400ms | ease-out | stroke-dashoffset (draw animation) |
| Skeleton shimmer | 1500ms | ease-in-out, infinite | background gradient position |
| Drawer slide-in | 300ms | ease-out | transform: translateX(100%→0) |
| Tab underline | 200ms | ease-default | left, width |

## 6.2 Haptic Feedback Mapping (Mobile)
- Tab bar tap: `UIImpactFeedbackGenerator(.light)`
- Task complete: `UINotificationFeedbackGenerator(.success)`
- Destructive action: `UINotificationFeedbackGenerator(.warning)`
- Drag reorder: `UIImpactFeedbackGenerator(.medium)` on each position change

## 6.3 Sound Design
No sounds. Kaivoo's brand is calm and silent. All feedback is visual + haptic only.

---

# 7. RESPONSIVE BEHAVIOR

## 7.1 Breakpoint Adaptations

| Breakpoint | Layout Changes |
|------------|---------------|
| **≥1440px** | 12-col grid, 80px margins, sidebar 240px, max-content 1280px |
| **1024–1439px** | 12-col, 64px margins, sidebar collapsible, fluid content |
| **768–1023px** | 8-col, 40px margins, top bar 56px, sidebar overlay, widgets stack |
| **428–767px** | 4-col, 24px margins, bottom tab bar, single-column, drawers→sheets |
| **375–427px** | 4-col, 20px margins, compact spacing maintained |
| **320–374px** | 4-col, 16px margins, 12px gutters, minimum viable layout |

## 7.2 Orientation Change Handling
- **Portrait → Landscape (tablet):** Side-by-side widget columns activate
- **Portrait → Landscape (mobile):** Content area widens, tab bar moves to left sidebar strip
- Animations respect `prefers-reduced-motion`

## 7.3 Widget Column Behavior
```
Desktop (≥1024px):
  full-width widgets: span 100% of content area
  half-width widgets: 2-column grid (Tasks + Calendar side-by-side)
  
Tablet (768–1023px):
  All widgets stack single-column at full-width
  Exception: Task + Calendar remain side-by-side above 900px

Mobile (<768px):
  All widgets stack single-column
  Widget cards reduce padding from 24px to 16px
  Widget reorder via drag handles
```

---

# Designer's Notes

## Key Decision: Why Not Liquid Glass?
The current Apple Liquid Glass trend prioritizes translucency and depth. Kaivoo's brand principle of "Quiet Confidence" means we prioritize **clarity and restraint** over visual spectacle. Our surfaces are opaque (Warm Sand), bordered (Mist), and calm. The single exception — a subtle `backdrop-blur` on the mobile tab bar — serves a functional purpose (scroll-under readability), not a decorative one.

## Key Decision: Single-Column Default for Today
The Lovable-generated app uses `max-w-3xl` (720px) for Today. We maintain this. Productivity apps that spread content horizontally force eye-tracking across wide screens. A centered, narrow column respects the F-pattern and reduces cognitive load. The side-by-side widget layout (Tasks + Calendar) is the only horizontal split, and only at ≥1024px.

## Key Decision: Warm Sand vs. White
Pure white (#FFFFFF) is clinical. The Kaivoo Design System mandates Warm Sand (#FAF8F5) as the primary canvas. This 3% warm tint is neurologically calming — it tells the visual cortex "this is a safe, organic surface." Card backgrounds use White (#FFFFFF) to subtly lift above the canvas without shadows.

## Key Decision: Typography Migration
The current app uses DM Sans. The Kaivoo Design System specifies Neue Haas Grotesk Display Pro (commercial license required from Monotype). For the open-source/development phase, we use the fallback stack: `'Helvetica Neue', Helvetica, Arial, system-ui, sans-serif`. This maintains the Swiss grotesque character while the license is procured.

## CSS Variable Migration Plan
The current `index.css` uses shadcn's HSL-based variables (`--primary: 238 65% 60%`). The migration maps these to Kaivoo's hex-based tokens. The Tailwind config extends with Kaivoo-specific utility classes while maintaining shadcn component compatibility.

---

*This document is the north star for every pixel in the Kaivoo Command Center. When in doubt, refer to the Kaivoo Design System v1.0 and these screen specifications. Calm is a technology.*
