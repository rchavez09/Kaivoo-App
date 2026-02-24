# Kaivoo Design System

**Source:** Extracted from Agent 1 (Senior UI Designer) during Design Agent merge — Sections 1, 2, 4, 6, 7, and Designer's Notes
**Parent:** [Agent-Design.md](../Agent-Design.md)

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
