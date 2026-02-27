# Design Review: Projects Pages (Sprint 11)

**Agent:** Design Agent
**Model:** Opus
**Date:** February 24, 2026
**Scope:** Projects.tsx, ProjectDetail.tsx, ProjectCard.tsx, CreateProjectDialog.tsx, TimelineView.tsx, TimelineProjectBar.tsx, TimelineHeader.tsx, TaskDetailsDrawer.tsx (project selector section)
**Classification:** Internal Design Review

---

## DESIGN REVIEW: FAIL

| Step | Verdict |
|------|---------|
| Hierarchy | Issue |
| Interactions | Issue |
| Accessibility | Issue |
| Responsive | Issue |
| Anti-patterns | Issue |

---

## Summary

The Projects feature set was built in Sprint 9 without a design-first pass. While the core functionality is solid and the component architecture is clean, there are 8 P0 violations (broken UX, accessibility failures, dark mode illegibility), 11 P1 inconsistencies, and 5 P2 polish items. The most critical issues involve missing `aria-label` attributes on interactive elements, dark mode contrast failures, undefined CSS variables causing invisible TaskDetailsDrawer backgrounds, and several responsive breakage scenarios.

---

## P0 Findings (Must Fix)

### P0-1: TaskDetailsDrawer panel-task CSS variables undefined -- invisible backgrounds

**File:** `daily-flow/src/components/TaskDetailsDrawer.tsx` line 161
**Also:** `daily-flow/tailwind.config.ts` lines 88-91

The `SheetContent` uses `bg-gradient-to-b from-panel-task-from to-panel-task-to` and every section card uses `bg-panel-task-section`. These reference `hsl(var(--panel-task-from))`, `hsl(var(--panel-task-to))`, `hsl(var(--panel-task-accent))`, and `hsl(var(--panel-task-section))` in the Tailwind config -- but **these CSS custom properties are never defined** in `index.css` (neither in `:root` nor `.dark`). This means the computed values fall back to `hsl()` with no arguments, which resolves to transparent/black in most browsers. The entire drawer may render with transparent or unpredictable backgrounds.

**Fix:** Add the following to `index.css`:

```css
:root {
  --panel-task-from: 36 38% 97%;        /* Warm Sand */
  --panel-task-to: 0 0% 100%;           /* White */
  --panel-task-accent: 180 41% 39%;     /* Resonance Teal */
  --panel-task-section: 220 14% 96%;    /* Cloud-light */
}

.dark {
  --panel-task-from: 245 35% 15%;       /* Card layer */
  --panel-task-to: 249 30% 11%;         /* Slightly deeper */
  --panel-task-accent: 180 43% 46%;     /* Teal brightened */
  --panel-task-section: 246 34% 19%;    /* Elevated layer */
}
```

---

### P0-2: ProjectCard color accent strip negative margin miscalculation

**File:** `daily-flow/src/components/projects/ProjectCard.tsx` line 49

The color strip uses `-mx-5 -mt-5` to bleed into the card edges. But `widget-card` applies `p-5` (20px). If the card padding or border-radius ever changes, or if widget-card shifts to `p-6` (24px, which the Design System specifies), the strip will either leave gaps or overflow incorrectly. More critically, the strip uses `rounded-t-2xl` but the card uses the inherited `rounded-2xl` from widget-card, creating a visual mismatch where the strip corners might not align precisely with the card corners.

**Fix:** Use `rounded-t-[inherit]` or extract a dedicated `project-card` variant that manages the accent strip through a wrapper div with `overflow-hidden` on the parent:

```tsx
<div className="widget-card overflow-hidden p-0">
  <div className="h-1" style={{ backgroundColor: color }} />
  <div className="p-5">
    {/* card content */}
  </div>
</div>
```

---

### P0-3: Status tab buttons missing accessible roles and aria attributes

**File:** `daily-flow/src/pages/Projects.tsx` lines 103-129

The status tab bar (All, Active, Planning, etc.) uses raw `<button>` elements inside a `<div>`. There is no `role="tablist"` on the container, no `role="tab"` on individual buttons, no `aria-selected` attribute to indicate the active tab, and no `aria-controls` linking tabs to their panels. Screen readers cannot identify these as tabs.

**Fix:**

```tsx
<div role="tablist" className="flex items-center gap-1 mb-4 p-1 bg-secondary/50 rounded-lg w-fit">
  {STATUS_TABS.map(tab => (
    <button
      key={tab.key}
      role="tab"
      aria-selected={activeTab === tab.key}
      onClick={() => setActiveTab(tab.key)}
      className={cn(/* ... */)}
    >
      {tab.label}
      <span className="ml-1.5 text-xs" aria-label={`${count} projects`}>{count}</span>
    </button>
  ))}
</div>
```

---

### P0-4: Timeline project bar label not sticky -- disappears on horizontal scroll

**File:** `daily-flow/src/components/timeline/TimelineProjectBar.tsx` lines 42-45

The label column header at the top of TimelineView is correctly `sticky left-0` (line 102 of TimelineView.tsx), but the **per-row project name labels** in TimelineProjectBar use `absolute left-0` without any sticky positioning. When the user scrolls horizontally to explore the timeline, the project labels scroll away and the bars become unidentifiable.

**Fix:** Change the label div from `absolute left-0` to `sticky left-0` with proper `z-10` and a background matching the row:

```tsx
<div className="sticky left-0 top-0 h-full flex items-center z-10 pr-2 bg-card" style={{ width: 200 }}>
```

The parent container must have `position: relative` and `overflow-x: visible` for sticky to work within the scroll context (or use the same pattern as the header -- placing the label in a separate sticky column outside the scrollable area).

---

### P0-5: Dark mode -- timeline bars have hardcoded colors with no contrast check against dark card background

**File:** `daily-flow/src/components/timeline/TimelineProjectBar.tsx` line 57
**Also:** `daily-flow/src/lib/project-config.tsx` lines 20-33

The timeline bar `backgroundColor` is set via inline `style={{ backgroundColor: color }}` using the `PROJECT_COLORS` array. Several of these colors have poor contrast against the dark mode card background (`hsl(245, 35%, 15%)` which is approximately `#1A1832`):

- `#2A1B4E` (not in palette but close to abyss) -- any dark purples would be invisible
- The bar text is `text-white` which is good for the bar itself, but the bar-to-background contrast for some colors like `#78716C` (stone) is borderline

The **white text on the bar** (`text-[10px] font-medium text-white`) also fails WCAG AA for `#F59E0B` (amber) and `#22C55E` (green) where the contrast ratio of white on these is approximately 2.0:1 and 2.8:1 respectively -- both below the 4.5:1 minimum for small text.

**Fix:** Add a contrast-aware text color utility. For each bar, compute whether white or dark text is more legible:

```ts
const getContrastTextColor = (bgHex: string): string => {
  const r = parseInt(bgHex.slice(1, 3), 16);
  const g = parseInt(bgHex.slice(3, 5), 16);
  const b = parseInt(bgHex.slice(5, 7), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? '#0A1628' : '#FFFFFF';
};
```

Apply to the text span in TimelineProjectBar.

---

### P0-6: ProjectCard used as `<button>` wrapping block content -- invalid HTML nesting

**File:** `daily-flow/src/components/projects/ProjectCard.tsx` lines 44-102

The entire card is wrapped in a `<button>` element, but it contains `<h3>`, `<p>`, `<div>` and other block-level elements. Per HTML spec, `<button>` may only contain phrasing content. While browsers are lenient, this causes screen readers to read the entire card as a single button label (concatenating all text), making it unusable for assistive technology.

**Fix:** Replace `<button>` with a `<div>` or `<article>` and use either:
1. A wrapping `<Link>` from react-router, or
2. An `onClick` handler on a `<div role="article">` with a visually hidden `<a>` or `<button>` inside that serves as the primary action target

Recommended pattern:

```tsx
<article
  className="widget-card overflow-hidden relative cursor-pointer group"
  onClick={() => navigate(`/projects/${project.id}`)}
>
  {/* Invisible a11y link */}
  <a
    href={`/projects/${project.id}`}
    className="absolute inset-0 z-10"
    aria-label={`Open project: ${project.name}`}
    tabIndex={0}
  />
  {/* ... card content ... */}
</article>
```

---

### P0-7: Inline edit name input has zero visual affordance -- looks like plain text

**File:** `daily-flow/src/pages/ProjectDetail.tsx` lines 179-186

The name editing input has `border-0 shadow-none focus-visible:ring-0 bg-transparent`. When active, there is literally no visual indicator distinguishing the editable field from display text. The only cue is `autoFocus`, but if focus is lost and re-clicked, the field is indistinguishable. This violates WCAG 1.4.11 (Non-text Contrast) -- form fields must have a visible boundary or 3:1 contrast against adjacent colors.

**Fix:** Add a subtle underline or dashed bottom border when in editing mode:

```tsx
className="text-2xl font-semibold h-auto py-0 border-0 border-b-2 border-dashed border-primary/40 shadow-none focus-visible:ring-2 focus-visible:ring-primary/30 bg-transparent"
```

---

### P0-8: Dark mode -- `bg-secondary/50` and `bg-secondary/30` create near-invisible surfaces

**File:** `daily-flow/src/pages/Projects.tsx` line 103 (`bg-secondary/50`)
**Also:** `daily-flow/src/pages/ProjectDetail.tsx` line 337 (`bg-secondary/30`), line 254 (`hover:bg-secondary/30`)

In dark mode, `--secondary` is `246 34% 19%` (approximately `#232040`). At 50% opacity on the dark canvas (`#12101E`), the computed background is essentially indistinguishable from the canvas. The status tab bar becomes nearly invisible. The add-task input area at 30% opacity has almost zero visual separation.

**Fix:** Use solid color tokens instead of opacity modifiers for dark mode backgrounds, or create a dedicated `--surface-elevated` variable:

```css
.dark {
  --surface-elevated: 246 34% 22%;
}
```

Then use `bg-[hsl(var(--surface-elevated))]` or add `dark:bg-secondary` (without the opacity) as an override.

---

## P1 Findings (Should Fix)

### P1-1: widget-card uses box-shadow but Design System says "no drop shadows at rest"

**File:** `daily-flow/src/index.css` lines 261-264

The `.widget-card` class applies `box-shadow: var(--widget-shadow)` at rest, which is `0 1px 4px rgba(26,31,46,0.06), 0 1px 2px rgba(26,31,46,0.04)`. The Kaivoo Design System v1.0 explicitly states: "No drop shadows at rest. Elevation via border only." The current shadow is very subtle, but it contradicts the spec. This may be an intentional evolution (v2.0?), but should be documented.

**Fix:** Either update the Design System document to reflect the v2.0 shadow decision, or remove the shadow at rest and rely solely on the 1px border:

```css
.widget-card {
  @apply bg-card rounded-2xl p-5 transition-all duration-200 border border-border/50;
  /* Remove: box-shadow: var(--widget-shadow); */
}
.widget-card:hover {
  box-shadow: var(--widget-shadow-hover);
}
```

---

### P1-2: Projects grid uses `lg:grid-cols-3` but max-w-4xl caps width -- 3 columns are cramped

**File:** `daily-flow/src/pages/Projects.tsx` line 159

The page container is `max-w-4xl` (896px). With `px-6` (24px each side), the content area is approximately 848px. At `lg:grid-cols-3` (1024px breakpoint), the container is only 848px wide, giving each card roughly 269px (minus gap). With card padding of 20px, that leaves approximately 229px for content -- tight for project names, descriptions, progress bars, and metadata.

**Fix:** Either:
1. Use `max-w-5xl` (1024px) for the Projects page to give cards more room, or
2. Use `lg:grid-cols-2` and only go to 3 columns at `xl` breakpoint:

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
```

---

### P1-3: ProjectCard description uses `line-clamp-2` but no title line clamp

**File:** `daily-flow/src/components/projects/ProjectCard.tsx` lines 53, 67

The project name uses `truncate` (single-line ellipsis) but some project names might benefit from 2-line wrapping. Meanwhile `line-clamp-2` on the description is good. The inconsistency means a long project name gets cut off harshly at one line while the description gets two lines of breathing room.

**Fix:** Allow up to 2 lines for the project name as well:

```tsx
<h3 className="font-medium text-base text-foreground line-clamp-2 group-hover:text-primary transition-colors">
```

---

### P1-4: CreateProjectDialog has no form validation beyond empty name -- no date logic

**File:** `daily-flow/src/components/projects/CreateProjectDialog.tsx` lines 54-76

Users can set an end date before the start date with no warning. There is no visual indication that the name field is required (only a toast error after clicking Create). The asterisk on "Name *" is helpful but insufficient -- there should be a red border/outline when submission fails.

**Fix:** Add client-side validation:

```tsx
const isDateInvalid = startDate && endDate && endDate < startDate;

// In JSX:
{isDateInvalid && (
  <p className="text-xs text-destructive">End date must be after start date.</p>
)}
```

Add a red border on the name input when submission fails:

```tsx
const [nameError, setNameError] = useState(false);
// In handleCreate:
if (!name.trim()) { setNameError(true); return; }
// In JSX:
<Input className={cn(nameError && 'border-destructive')} ... />
```

---

### P1-5: ProjectDetail breadcrumb link lacks keyboard focus styling

**File:** `daily-flow/src/pages/ProjectDetail.tsx` line 168

The breadcrumb "Projects" link is a react-router `<Link>` which inherits no explicit focus-visible styling. Default browser focus rings are often removed by the CSS reset. Without `focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2`, keyboard users cannot see where focus is.

**Fix:**

```tsx
<Link
  to="/projects"
  className="hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm"
>
  Projects
</Link>
```

---

### P1-6: Timeline empty state has no date context -- violates Anti-Pattern #3

**File:** `daily-flow/src/components/timeline/TimelineView.tsx` lines 64-84

The empty state says "No projects with dates" but does not show what the current date range is. Per Anti-Pattern #3 (from Anti-Patterns.md): "Showing data without date context" is prohibited. The empty state should mention the current month/range.

**Fix:** Add a date context line:

```tsx
<p className="text-sm text-muted-foreground mb-4">
  No projects with start or end dates for {format(new Date(), 'MMMM yyyy')}.
  Add dates to your projects to see them on the timeline.
</p>
```

---

### P1-7: ProjectDetail -- task completion toggle button has no aria-label

**File:** `daily-flow/src/pages/ProjectDetail.tsx` lines 365-380

The circular toggle button (Circle/CheckCircle2 icon) for marking tasks done has no `aria-label`. Screen readers will announce it as just "button" with no indication of its purpose.

**Fix:**

```tsx
<button
  aria-label={task.status === 'done' ? `Mark "${task.title}" as not done` : `Mark "${task.title}" as done`}
  onClick={(e) => { /* ... */ }}
  className="shrink-0"
>
```

---

### P1-8: ProjectDetail color picker swatch buttons have generic aria-labels

**File:** `daily-flow/src/pages/ProjectDetail.tsx` line 452

The aria-label is `Select color ${c}` where `c` is a hex code like `#3B82F6`. This is not helpful for screen reader users. They hear "Select color hash 3B82F6".

**Fix:** Map hex codes to friendly color names in `project-config.tsx`:

```ts
export const PROJECT_COLOR_NAMES: Record<string, string> = {
  '#3B82F6': 'Blue', '#8B5CF6': 'Purple', '#EC4899': 'Pink',
  // etc.
};
```

Then use: `aria-label={`Select ${PROJECT_COLOR_NAMES[c] || 'color'}`}`.

Same fix needed in `CreateProjectDialog.tsx` line 185.

---

### P1-9: Timeline footer hint text is 10px -- below minimum Caption size

**File:** `daily-flow/src/components/timeline/TimelineView.tsx` line 148

`text-[10px]` is below the Design System minimum of 11px (Caption). At 10px, it likely fails WCAG AA contrast even with perfect color pairing.

**Fix:** Use `text-[11px]` (Caption) or `text-xs` (12px).

---

### P1-10: Timeline day numbers also use 10px text

**File:** `daily-flow/src/components/timeline/TimelineHeader.tsx` line 60

Same as P1-9. `text-[10px]` on the day numbers is below the Design System Caption minimum. Given the tight 32px column width, 11px may require testing, but the spec floor must be respected.

**Fix:** Use `text-[11px]` minimum.

---

### P1-11: Delete project confirmation uses generic destructive button without Kaivoo spec

**File:** `daily-flow/src/pages/ProjectDetail.tsx` line 514

The AlertDialogAction for deletion uses `bg-destructive text-destructive-foreground hover:bg-destructive/90`. Per the Kaivoo Button Hierarchy, destructive buttons should be "Transparent, Ember text, 1.5px Ember/40% border" -- not filled. The filled red button is overly aggressive for the calm Kaivoo aesthetic.

**Fix:**

```tsx
<AlertDialogAction
  onClick={handleDelete}
  className="bg-transparent text-destructive border border-destructive/40 hover:bg-destructive/10"
>
  Delete
</AlertDialogAction>
```

---

## P2 Findings (Nice to Have)

### P2-1: ProjectCard hover state uses `hover:-translate-y-0.5` but Design System says `translateY(-1px)`

**File:** `daily-flow/src/components/projects/ProjectCard.tsx` line 46

`-translate-y-0.5` is 2px lift. The Design System specifies 1px (`translateY(-1px)`). The difference is subtle but the 2px lift feels slightly more aggressive than the "Quiet Confidence" brand.

**Fix:** Use `hover:-translate-y-px` (Tailwind utility for 1px).

---

### P2-2: App.css contains leftover Vite boilerplate

**File:** `daily-flow/src/App.css` (entire file)

This file contains the default Vite + React template CSS (`.logo`, `.card`, `.read-the-docs`). It is likely not imported anywhere meaningful but adds confusion.

**Fix:** Delete the file entirely or audit whether it is imported.

---

### P2-3: Timeline could benefit from keyboard-accessible scroll

**File:** `daily-flow/src/components/timeline/TimelineView.tsx` lines 91-145

The timeline is scrollable via mouse/trackpad only. There is no keyboard mechanism to scroll the timeline horizontally. Adding left/right arrow key support when the timeline is focused would improve accessibility.

**Fix:** Add `tabIndex={0}` to the scroll container and handle `onKeyDown` for ArrowLeft/ArrowRight to scroll by `DAY_WIDTH` increments.

---

### P2-4: ProjectDetail settings section lacks visual grouping with the task list

**File:** `daily-flow/src/pages/ProjectDetail.tsx` lines 433-493

The settings card appears below the task list with only `mt-6` separation. It is not visually distinguished as a secondary/admin section. Users may accidentally reach the delete button while scrolling through tasks.

**Fix:** Add a visual separator or use a collapsible/accordion pattern:

```tsx
<details className="widget-card mt-6 group">
  <summary className="widget-header cursor-pointer">
    <h2 className="widget-title">Settings</h2>
    <ChevronDown className="w-4 h-4 text-muted-foreground group-open:rotate-180 transition-transform" />
  </summary>
  {/* settings content */}
</details>
```

---

### P2-5: Timeline project bars don't show tooltips on hover

**File:** `daily-flow/src/components/timeline/TimelineProjectBar.tsx` lines 48-64

Hovering over a bar shows `hover:brightness-110` but no tooltip with project details (date range, status, progress). The `aria-label` is good for screen readers but sighted users get no additional information on hover.

**Fix:** Wrap the bar in a Radix `Tooltip` or add a native `title` attribute with formatted information:

```tsx
title={`${project.name}: ${formatDate(project.startDate)} - ${formatDate(project.endDate)} (${statusCfg.label})`}
```

---

## Dark Mode Specific Pass

### Summary of dark mode issues already covered:

| ID | Issue | Severity |
|----|-------|----------|
| P0-1 | `panel-task-*` CSS vars undefined -- drawer backgrounds transparent/broken | P0 |
| P0-5 | White text on bright timeline bars (amber, green) fails AA contrast | P0 |
| P0-8 | `bg-secondary/50` and `/30` opacity modifiers invisible on dark canvas | P0 |

### Additional dark mode observations:

**DM-1: ProjectCard color accent strip -- some colors blend with dark card background**
Colors like `#78716C` (stone) and the default assignment colors may not pop enough on the dark card background `hsl(245, 35%, 15%)`. Consider adding a 1px lighter border below the accent strip in dark mode.

**DM-2: Progress bar `bg-secondary` track is hard to see in dark mode**
In `ProjectCard.tsx` line 94, the progress track uses `bg-secondary` which in dark mode is `#232040`. On the card background `#1A1832`, this gives only ~5% lightness difference. Consider using `bg-border` or `bg-muted` for the track in dark mode.

**DM-3: Search input icon `text-muted-foreground` is adequate in dark mode**
Verified: `--muted-foreground` in dark mode is `220 9% 64%` (~`#9CA3AF`). Against dark input background `hsl(246, 28%, 22%)` (~`#2D2945`), the contrast ratio is approximately 4.8:1. This passes AA for normal text at the icon size.

**DM-4: Timeline header month labels `text-foreground` on `bg-background` are fine in dark mode**
Verified: warm off-white on deep purple canvas has excellent contrast (~12:1).

---

## Responsive Specific Pass

### R-1: Projects card grid does not handle small mobile viewports well

**File:** `daily-flow/src/pages/Projects.tsx` line 159

At 320px width (the minimum supported breakpoint), the single-column grid with `px-6` (24px padding) leaves only 272px for card content. The widget-card `p-5` (20px) further reduces to 232px. This is workable but the status tabs (`w-fit`) may overflow horizontally.

**Fix:** Add `overflow-x-auto` to the status tab container, or switch to a scrollable horizontal list on mobile:

```tsx
<div className="flex items-center gap-1 mb-4 p-1 bg-secondary/50 rounded-lg overflow-x-auto">
```

### R-2: Timeline is not usable on mobile

**File:** `daily-flow/src/components/timeline/TimelineView.tsx`

The timeline uses a fixed `LABEL_WIDTH = 200` and `DAY_WIDTH = 32`. On mobile (375px), the label alone takes 53% of the screen width, leaving barely enough room for 5 days of visible timeline. There is no mobile-specific adaptation (stacked cards, simplified view, etc.).

**Fix:** For viewports < 768px, either:
1. Reduce `LABEL_WIDTH` to 120px and `DAY_WIDTH` to 24px, or
2. Hide the timeline view entirely on mobile and show a simplified list-based date view, or
3. Make the label column collapsible

### R-3: CreateProjectDialog grid cols don't stack on mobile

**File:** `daily-flow/src/components/projects/CreateProjectDialog.tsx` lines 114, 151

The `grid grid-cols-2` layouts for Status+Topic and Start+End date rows do not have responsive breakpoints. On narrow mobile screens (< 375px), the two columns may be too cramped.

**Fix:** Use `grid grid-cols-1 sm:grid-cols-2 gap-3`.

---

## Cross-Cutting Recommendations

1. **Define all panel-task CSS variables** -- this is the single most impactful fix as it affects every task interaction across the app, not just Projects.

2. **Create a `getContrastColor()` utility** -- reusable for timeline bars, project card accent strips, and any future color-coded UI. Place in `daily-flow/src/lib/utils.ts`.

3. **Audit all `<button>` wrappers for block content** -- ProjectCard is not the only instance. Grep for `<button` containing `<div>` or `<h3>` elements app-wide.

4. **Standardize text size floors** -- no component should go below `text-[11px]` per the Caption spec. Replace all `text-[10px]` instances.

5. **Consider adding the Timeline as a view on the Projects page** -- currently it only lives on the Tasks page. A toggle between "Cards" and "Timeline" on `/projects` would improve project date visibility without requiring navigation.

---

*Design for how people actually work, not how they say they work. Calm is a technology.*
