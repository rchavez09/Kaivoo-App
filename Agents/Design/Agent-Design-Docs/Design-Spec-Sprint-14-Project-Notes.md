# Design Spec: Project Notes — Sprint 14, Parcel 3

**Feature:** Project Notes (CRUD + Quick-Add from anywhere)
**Sprint:** 14
**Parcel:** 3
**Gate:** 1 (Pre-Implementation)
**Date:** February 25, 2026
**Authors:** Visual Design Agent, Accessibility & Theming Agent, UX Completeness Agent

---

## Table of Contents

1. [Feature Summary](#1-feature-summary)
2. [Part A — Visual Design Spec](#2-part-a--visual-design-spec)
3. [Part B — Accessibility & Theming Spec](#3-part-b--accessibility--theming-spec)
4. [Part C — UX Completeness Spec](#4-part-c--ux-completeness-spec)
5. [Component Inventory](#5-component-inventory)
6. [Implementation Notes for Agent 2](#6-implementation-notes-for-agent-2)

---

## 1. Feature Summary

Users need lightweight, timestamped notes attached to projects. Notes are distinct from tasks (no status/priority/due date) and from journal entries (scoped to a project, not a date). Think of them as a project-scoped scratch pad.

**Requirements:**
1. View all notes for a project on ProjectDetail
2. Add a note from within the project
3. Edit notes inline (click to edit)
4. Delete notes (with confirmation)
5. Add a note to ANY project from ANYWHERE in the app (Quick-Add, 2-3 clicks max)

---

## 2. Part A — Visual Design Spec

### 2.1 Section Placement on ProjectDetail

The Notes section sits **between the Tasks section and the Settings section**. This follows the Task-First hierarchy (Section 2.2 of Visual Design Agent) — tasks are the primary actionable content and remain closest to the header. Notes are secondary supporting content. Settings remain last as the lowest-priority section.

```
ProjectDetail Layout:
  [Breadcrumb]
  [Header: name, status, topic, dates, progress]
  [Description]
  [Stats bar] (if tasks exist)
  [ProjectTaskList — widget-card]    <-- existing
  [ProjectNotesList — widget-card]   <-- NEW (this spec)
  [ProjectSettings — widget-card]    <-- existing (currently has mt-8)
```

The Notes section uses the standard `widget-card` class with `mt-8` spacing above it (matching the existing gap between Tasks and Settings).

### 2.2 Notes Section Header

Uses the established `widget-header` + `widget-title` pattern, matching ProjectTaskList exactly.

```
┌─────────────────────────────────────────────────────────┐
│  NOTES                                    [+ Add Note]  │
│  ─────────────────────────────────────────────────────── │
│                                                         │
│  (note cards or empty state here)                       │
│                                                         │
│  ┌─ Add note input ──────────────────────────────────┐  │
│  │  [icon] Write a note...                    [Save]  │  │
│  └────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

- **Title:** "Notes" — uses `widget-title` class (`text-sm font-semibold text-muted-foreground uppercase tracking-wider`)
- **Header button:** "+ Add Note" — uses `Button variant="ghost" size="sm"` with `h-7 text-xs gap-1` classes (matches the InlineJournal "Write" button pattern)
- Clicking the header button scrolls to the add-note input at the bottom and focuses it

### 2.3 Note Card Layout

Each note is a row within the notes list, separated by `divide-y divide-border` (matching ProjectTaskList's task row pattern).

```
┌─────────────────────────────────────────────────────────┐
│  Note content text goes here. Can be multiple lines     │
│  but is clamped to 4 lines in display mode with a       │
│  "Show more" expansion link.                            │
│                                                         │
│  Feb 25, 2:30 PM              [pencil-icon] [trash-icon]│
└─────────────────────────────────────────────────────────┘
```

**Display mode (read-only):**
- **Content:** `text-sm text-foreground` with `whitespace-pre-wrap` to preserve line breaks
- **Line clamp:** `line-clamp-4` by default. If content exceeds 4 lines, show a "Show more" text button (`text-xs text-primary cursor-pointer`) that expands to full content
- **Timestamp:** `text-xs text-muted-foreground` — format: `MMM d, h:mm a` (e.g., "Feb 25, 2:30 PM"). If note was edited, append "(edited)" after the timestamp
- **Action icons:** Pencil (edit) and Trash2 (delete) icons, both `w-3.5 h-3.5 text-muted-foreground`
  - Desktop: `opacity-0 group-hover:opacity-100 transition-opacity` (appear on hover)
  - Mobile: Always visible at reduced opacity (`opacity-60`)
- **Row padding:** `py-3 px-2 -mx-2` with `hover:bg-secondary/30 rounded-lg transition-colors` (matches task row hover)
- **Row wrapper:** Add `group` class for hover-reveal of action icons

**Edit mode (inline):**
- Triggered by clicking the pencil icon OR clicking the note content
- Content area transforms into a `<Textarea>` component
  - `min-h-[80px] text-sm resize-none` (matches InlineJournal composer)
  - Auto-focused on enter
  - Pre-populated with existing content
- Action row below textarea: `flex gap-2 justify-end mt-2`
  - "Cancel" — `Button variant="ghost" size="sm"`
  - "Save" — `Button size="sm"`, disabled when content is empty or unchanged
- Saving returns to display mode. Canceling (button or Escape) returns to display mode with no changes.

### 2.4 Add Note Input

Positioned at the **bottom** of the notes list (matching the "Add task" input placement convention from ProjectTaskList and UX Completeness Agent Step 3).

```
┌─────────────────────────────────────────────────────────┐
│  [StickyNote icon]  Write a note...              [Save] │
└─────────────────────────────────────────────────────────┘
```

- **Container:** `p-3 bg-[hsl(var(--surface-elevated))] rounded-lg border border-border` (exact match of ProjectTaskList add-task input)
- **Layout:** `flex items-start gap-2` (items-start not items-center, because textarea can grow)
- **Icon:** `StickyNote` from lucide-react, `w-5 h-5 text-muted-foreground shrink-0 mt-2` (mt-2 to align with first line of textarea)
- **Input:** `<Textarea>` with:
  - `border-0 bg-transparent focus-visible:ring-0 shadow-none px-0 min-h-[36px] resize-none text-sm`
  - `placeholder="Write a note..."`
  - Auto-grows with content (up to a reasonable max, then scrolls)
- **Submit button:** `Button size="sm"` — label "Save", disabled when textarea is empty
- **Keyboard:** Enter submits (single-line behavior). Shift+Enter adds a new line. This matches the task-add pattern.

### 2.5 Empty State

Shown when the project has zero notes. Follows the established empty state pattern from ProjectTaskList.

```
         [StickyNote icon — 40x40, text-muted-foreground/30]

              No notes yet

         Jot down ideas, decisions, or context
         for this project.
```

- **Icon:** `StickyNote` from lucide-react, `w-10 h-10 text-muted-foreground/30 mx-auto mb-3`
- **Heading:** `text-sm font-medium text-foreground mb-1` — "No notes yet"
- **Subtext:** `text-xs text-muted-foreground` — "Jot down ideas, decisions, or context for this project."
- **Container:** `py-12 text-center` (matches ProjectTaskList empty state)

### 2.6 Delete Confirmation

Uses inline confirmation, NOT a full AlertDialog (notes are lightweight — a modal feels heavy). Pattern: clicking trash icon replaces the note row actions with a confirmation strip.

```
  Are you sure?                        [Cancel] [Delete]
```

- **Text:** "Are you sure?" — `text-xs text-muted-foreground`
- **Cancel:** `Button variant="ghost" size="sm"` with `h-6 text-xs`
- **Delete:** `Button variant="ghost" size="sm"` with `h-6 text-xs text-destructive hover:text-destructive hover:bg-destructive/10`
- This avoids the cost of a full dialog for a lightweight delete. If the user has many notes or the note is long, the inline confirmation is proportional to the action's weight.

### 2.7 Quick-Add Note Dialog (Global)

This is the "add a note from anywhere" feature. It uses a **Command Dialog** pattern (the app already has `cmdk` and `CommandDialog` installed).

**Trigger:** Keyboard shortcut `Cmd+Shift+N` (Mac) / `Ctrl+Shift+N` (Windows/Linux). Also accessible via a dedicated button in the sidebar or the FloatingChat could gain a "note" command. The primary trigger is the keyboard shortcut.

**Dialog layout (CommandDialog-inspired, but custom):**

```
┌──────────────────────────────────────────────────────────────┐
│  Quick Note                                           [Esc] │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Project:  [  Search or select a project...            ▾  ]  │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │                                                        │  │
│  │  Write your note...                                    │  │
│  │                                                        │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│                                         [Cancel]   [Save]    │
└──────────────────────────────────────────────────────────────┘
```

- **Dialog:** Centered modal, `max-w-md` (448px), `rounded-2xl`, standard overlay (Deep Navy at 40% opacity)
- **Animation:** `scale(0.95) -> scale(1) + fade, 250ms ease-out` (matches Design System modal spec)
- **Title:** "Quick Note" — `text-base font-semibold text-foreground`
- **Project picker:** A `Select` dropdown (or `Popover` with search) listing all projects. Shows project color dot + name. If the user is currently on a ProjectDetail page, that project is pre-selected.
  - Uses `Popover` + search input (matching ProjectTaskList's "Link existing" popover pattern)
  - Shows project color dot (8px circle) + project name
  - Max 20 projects shown, with search filter
- **Note input:** `<Textarea>` with `min-h-[100px] resize-none` and placeholder "Write your note..."
- **Buttons:** `flex gap-2 justify-end`
  - "Cancel" — `Button variant="outline"` (or Escape key)
  - "Save" — `Button` (primary), disabled when no project selected or textarea empty
- **Success:** On save, show a Sonner toast: `Note added to "{Project Name}"`. Dialog closes.
- **Focus order:** Dialog opens -> project picker is focused (if no project pre-selected) OR textarea is focused (if project is pre-selected from current page context)

### 2.8 Typography Summary

| Element | Class / Style | Token |
|---|---|---|
| Section title ("NOTES") | `widget-title` | `text-sm font-semibold text-muted-foreground uppercase tracking-wider` |
| Note content | `text-sm text-foreground` | 14px, regular weight |
| Timestamp | `text-xs text-muted-foreground` | 12px, `#525A6A` light / `#979DA8` dark |
| "(edited)" label | `text-xs text-muted-foreground` | Same as timestamp |
| Empty state heading | `text-sm font-medium text-foreground` | 14px, medium weight |
| Empty state subtext | `text-xs text-muted-foreground` | 12px |
| "Show more" link | `text-xs text-primary cursor-pointer` | 12px, Resonance Teal |

### 2.9 Spacing Summary

| Gap | Value | Context |
|---|---|---|
| Between Tasks widget and Notes widget | `mt-8` (32px) | Standard widget-card gap |
| Between Notes widget and Settings widget | `mt-8` (32px) | Unchanged from current |
| Between note rows | `divide-y divide-border` | 1px border separators |
| Note row padding | `py-3 px-2` | Comfortable read spacing |
| Content to timestamp row | `mt-2` | Within a single note |
| Add-note input container | `mt-4` | Below the last note or empty state |

---

## 3. Part B — Accessibility & Theming Spec

### 3.1 ARIA Attributes

**Notes list container:**
```html
<div role="list" aria-label="Project notes">
```

**Individual note (display mode):**
```html
<div role="listitem" aria-label="Note from [timestamp]">
```

**Individual note (edit mode):**
```html
<div role="listitem" aria-label="Editing note from [timestamp]">
  <textarea aria-label="Edit note content" />
</div>
```

**Add-note input:**
```html
<textarea aria-label="New note for this project" />
```

**Edit button (per note):**
```html
<button aria-label="Edit note from [timestamp]">
```

**Delete button (per note):**
```html
<button aria-label="Delete note from [timestamp]">
```

**Delete confirmation (inline):**
```html
<div role="alert" aria-label="Confirm delete note">
  <button>Cancel</button>
  <button>Delete</button>
</div>
```

**Quick-Add dialog:**
```html
<div role="dialog" aria-label="Quick Note" aria-modal="true">
  <select aria-label="Select project for note" />
  <textarea aria-label="Note content" />
</div>
```

**Empty state:**
```html
<div role="status" aria-label="No notes yet">
```

### 3.2 Keyboard Navigation Plan

**Notes list on ProjectDetail:**

| Key | Context | Action |
|---|---|---|
| Tab | From Tasks widget | Focus moves to Notes section header "Add Note" button |
| Tab | Within Notes section | Cycles through: header button -> note row actions (edit, delete) for each note -> add-note textarea -> add-note save button |
| Enter | On note content | Enter edit mode (transforms to textarea) |
| Enter | On edit button | Enter edit mode |
| Enter | On delete button | Show inline delete confirmation |
| Escape | In edit mode | Cancel edit, return to display mode, focus returns to the note row |
| Escape | In delete confirmation | Cancel delete, focus returns to delete button |
| Enter | On "Save" (edit mode) | Save changes, exit edit mode |
| Shift+Enter | In textarea (edit or add) | Insert new line |
| Enter | In add-note textarea | Submit the note (single-line shortcut) |

**Quick-Add dialog:**

| Key | Context | Action |
|---|---|---|
| Cmd+Shift+N / Ctrl+Shift+N | Anywhere in app | Open Quick-Add dialog |
| Escape | In dialog | Close dialog, return focus to previous element |
| Tab | In dialog | Cycles: project picker -> textarea -> Cancel -> Save |
| Enter | On Save button | Save note, close dialog |
| Shift+Enter | In textarea | Insert new line |

### 3.3 Focus Management

**Entering edit mode:**
1. User clicks edit button or note content
2. Note transforms to textarea
3. Focus moves to textarea, cursor at end of content
4. Textarea has visible focus ring (`focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2`)

**Exiting edit mode (save):**
1. User clicks Save or presses Enter
2. Content saves, note returns to display mode
3. Focus returns to the edit button of that note row

**Exiting edit mode (cancel):**
1. User clicks Cancel or presses Escape
2. No changes saved, note returns to display mode
3. Focus returns to the edit button of that note row

**Delete flow:**
1. User clicks delete button
2. Inline confirmation appears, focus moves to "Cancel" button (safe default)
3. If user confirms: note removed, focus moves to the next note's edit button (or the add-note input if last note)
4. If user cancels: confirmation hides, focus returns to delete button

**Quick-Add dialog:**
1. Cmd+Shift+N opens dialog
2. Focus moves into dialog (project picker if no project context, textarea if project pre-selected)
3. Focus is trapped within dialog (Tab cycles only through dialog elements)
4. Escape or Cancel closes dialog
5. Focus returns to the element that was focused before dialog opened

### 3.4 Dark Mode Token Mapping

All elements use semantic tokens that automatically resolve in dark mode. No hardcoded hex values. Verification points:

| Element | Light Mode | Dark Mode | Token |
|---|---|---|---|
| Note content text | `#1A1F2E` on `#FFFFFF` | `#F0ECE5` on `#181531` | `text-foreground` on `bg-card` |
| Timestamp text | `#525A6A` on `#FFFFFF` | `#979DA8` on `#181531` | `text-muted-foreground` on `bg-card` |
| Section title | `#525A6A` on `#FFFFFF` | `#979DA8` on `#181531` | `widget-title` (uses `text-muted-foreground`) |
| Add-note input bg | `--surface-elevated` | `--surface-elevated` (dark) | `bg-[hsl(var(--surface-elevated))]` |
| Edit textarea border | `--border` | `--border` (dark) | Default Textarea component |
| Hover row bg | `--secondary` at 30% | `--secondary` at 30% | `hover:bg-secondary/30` |
| Action icons | `--muted-foreground` | `--muted-foreground` (dark) | `text-muted-foreground` |
| Delete text | `--destructive` | `--destructive` (dark: brighter) | `text-destructive` |
| "Show more" link | `--primary` | `--primary` (dark: brighter) | `text-primary` |

### 3.5 Contrast Verification Points

These pairs MUST be verified during Gate 3 review:

| Pair | Light Ratio | Dark Ratio | Standard |
|---|---|---|---|
| `text-foreground` on `bg-card` | ~15.5:1 | ~12.8:1 | >= 4.5:1 (body text) |
| `text-muted-foreground` on `bg-card` | ~5.8:1 | ~5.2:1 | >= 4.5:1 (body text) |
| `text-muted-foreground` on `surface-elevated` | Verify | Verify | >= 4.5:1 |
| `text-primary` on `bg-card` | ~4.6:1 | ~5.1:1 | >= 4.5:1 (body text, "Show more") |
| `text-destructive` on `bg-card` | ~5.2:1 | ~4.8:1 | >= 4.5:1 (delete text) |
| Action icons on card bg | ~5.8:1 | ~5.2:1 | >= 3:1 (UI components) |
| Border on card bg | Verify | Verify | >= 3:1 (UI components, WCAG 1.4.11) |

**Known risk:** `text-primary` (#3B8C8C) on `bg-card` (#FFFFFF) in light mode is close to the 4.5:1 threshold. The "Show more" link uses `text-xs` (12px) which is normal-size text requiring 4.5:1. If it fails at Gate 3, increase to `text-primary font-medium` or use `text-foreground underline` instead.

### 3.6 Color Independence

- **Edit affordance:** Pencil icon provides shape cue (not just color). Hover state provides additional bg-change cue.
- **Delete affordance:** Trash icon provides shape cue. The destructive color is supplemented by the icon shape.
- **Timestamps:** Text label, not color-coded.
- **"(edited)" indicator:** Text label, not a colored dot.

### 3.7 Reduced Motion

- Note row hover `transition-colors` and icon `transition-opacity` should respect `prefers-reduced-motion`:
  ```css
  @media (prefers-reduced-motion: reduce) {
    /* Transitions become instant */
    transition-duration: 0ms;
  }
  ```
- The Quick-Add dialog `scale(0.95)->scale(1)` animation should be disabled under reduced motion (use instant appear/disappear). The Dialog component from shadcn/Radix already handles this.

### 3.8 Touch Targets

- Edit and delete icon buttons: Render at 16px icon size but with `p-2` padding to achieve >= 40x40px touch target. Use `Button variant="ghost" size="icon"` with `h-8 w-8` minimum.
- On mobile (< 768px), action icons are always visible (no hover-reveal). Touch targets are `h-10 w-10` (44px) to meet WCAG 2.5.8.

---

## 4. Part C — UX Completeness Spec

### 4.1 State Inventory

Every data-dependent area of the Notes feature must handle ALL of these states:

| State | What It Looks Like | Implementation |
|---|---|---|
| **Empty** | Empty state illustration (Section 2.5). Add-note input still visible below. | `notes.length === 0` |
| **Loading** | Skeleton: 3 rows of shimmer blocks matching note layout (content area + timestamp). Uses `animate-pulse` divs matching the shape of note rows. | `isLoading === true` (React Query) |
| **Single note** | One note card + add-note input. No special handling needed. | `notes.length === 1` |
| **Many notes (5+)** | Notes displayed in reverse-chronological order (newest first). After 5 notes, remaining are collapsed behind a "Show N more notes" button. | Progressive disclosure — Anti-Pattern 5 compliance |
| **Many notes (20+)** | Same as above, but with virtual scrolling consideration for future. For Sprint 14, the "Show more" chunking (load 5 at a time) is sufficient. | Deferred: virtualization if usage warrants |
| **Editing a note** | Single note transforms to textarea. Other notes remain visible but non-interactive (subtle opacity reduction: `opacity-60 pointer-events-none` on sibling notes). | `editingNoteId === note.id` |
| **Saving (optimistic)** | Content updates immediately in UI. If server rejects, roll back and show toast error. | Optimistic update via React Query mutation |
| **Deleting** | Inline confirmation strip replaces action icons. On confirm: note fades out (`opacity-0 transition-opacity duration-200`) then removed from list. | Animate out, then remove from state |
| **Error (network)** | Toast: "Failed to save note. Please try again." Note content preserved in textarea so user doesn't lose work. | `onError` callback in mutation |
| **Error (validation)** | "Note cannot be empty." — inline message below textarea in `text-xs text-destructive`. | Client-side validation |

### 4.2 Navigation Flows

**Entry points to notes:**
1. **Direct:** User navigates to ProjectDetail page -> scrolls to Notes section
2. **Quick-Add (global):** User presses Cmd+Shift+N from any page -> Quick-Add dialog opens
3. **Header button:** User clicks "+ Add Note" in the notes section header -> scrolls to add-note input, focuses it

**Exit points from notes:**
1. **Natural:** User scrolls past notes to Settings, or scrolls up to Tasks. No explicit "exit."
2. **From edit mode:** Cancel button or Escape key returns to display mode
3. **From Quick-Add dialog:** Escape, Cancel button, or backdrop click closes dialog. Focus returns to previous element.

**After Quick-Add save:**
- Dialog closes
- Toast confirms: `Note added to "{Project Name}"`
- User remains on their current page (NOT navigated to ProjectDetail). The note will appear on ProjectDetail next time they visit.
- Optional future enhancement: toast includes "View" link that navigates to the project.

### 4.3 Edit-Where-You-See-It Compliance

| Visible Data | Can Edit Inline? | Method |
|---|---|---|
| Note content | Yes | Click content or pencil icon -> inline textarea |
| Note timestamp | No (system-generated) | N/A — read-only by design |
| "(edited)" flag | No (system-generated) | N/A — auto-set on update |

**Anti-Pattern 1 check (forced navigation):** PASS. Notes are edited where they are seen. No navigation to a separate "Edit Note" page.

**Anti-Pattern 5 check (data overwhelm):** PASS. Progressive disclosure via "Show more" after 5 notes. Individual notes use line-clamp-4 with expand.

### 4.4 Quick-Add Interaction Design

The Quick-Add must be **2-3 clicks max** from any page. Here is the exact flow:

**Flow A — Keyboard (1 step + typing):**
1. User presses `Cmd+Shift+N` (dialog opens, project picker focused if no context)
2. User types to search/select project (or it's pre-selected if on a ProjectDetail page)
3. User types note content
4. User presses `Cmd+Enter` (or clicks Save)
- **Total: 1 shortcut + typing + 1 shortcut = 2 deliberate actions**

**Flow B — From ProjectDetail page (1 click + typing):**
1. User clicks "+ Add Note" in the Notes section header
2. Input focuses at bottom of notes list
3. User types and presses Enter
- **Total: 1 click + typing + Enter = 2 actions**

**Flow C — From FloatingChat (future enhancement, not Sprint 14):**
- User types `note: [project name] [content]` in FloatingChat
- This is deferred to a future sprint but the data model should support it

**Quick-Add dialog pre-selection logic:**
- If user is on `/projects/:projectId` route -> pre-select that project, focus textarea
- If user is on any other route -> focus project picker, no pre-selection
- If user has only 1 project -> pre-select it, focus textarea
- Recently used projects appear first in the picker list

### 4.5 Progressive Disclosure

**Level 1 (Glanceable):** The Notes section header shows "NOTES" with a count badge if there are notes: `(3)` next to the title in `text-muted-foreground text-xs font-normal normal-case tracking-normal` to differentiate from the uppercase title.

**Level 2 (Scannable):** First 5 notes visible with line-clamp-4 on each. Remaining behind "Show N more" button.

**Level 3 (Full Detail):** "Show more" on a note expands its full content. All notes visible if user clicks "Show all."

### 4.6 Anti-Pattern Scan

| Anti-Pattern | Status | Notes |
|---|---|---|
| AP-1: Forced navigation | PASS | Edit inline, Quick-Add from anywhere |
| AP-2: Past data read-only | PASS | Notes can be edited at any time (no date lock) |
| AP-3: Data without date context | PASS | Every note has a visible timestamp |
| AP-5: Data overwhelm | PASS | Progressive disclosure: 5 visible, rest collapsed. Line-clamp on individual notes. |
| AP-6: Statistics not stories | N/A | Notes are qualitative, not metric-based |

### 4.7 Input Pattern Appropriateness

| Field | Input Type | Correct? |
|---|---|---|
| Note content | `<Textarea>` (multi-line text) | Yes — notes are free-form text |
| Project selection (Quick-Add) | Popover with search (constrained) | Yes — from a known set of projects |
| Delete confirmation | Inline confirmation strip | Yes — lightweight action, proportional UI |

### 4.8 Gestural Interactions (Mobile)

Following the Interaction Patterns Library:

- **Swipe left on note row:** Reveal delete action (red trash icon). Follows established swipe-left-to-delete pattern.
- **Long-press on note row:** Open context menu with "Edit" and "Delete" options. Matches task/capture long-press pattern.
- **Swipe right on note row:** No action (notes have no "completion" concept).

---

## 5. Component Inventory

### New Components to Build

| Component | File Path | Props |
|---|---|---|
| `ProjectNotesList` | `src/components/projects/ProjectNotesList.tsx` | `projectId: string` |
| `ProjectNoteCard` | `src/components/projects/ProjectNoteCard.tsx` | `note: ProjectNote, onEdit, onDelete` |
| `QuickAddNoteDialog` | `src/components/projects/QuickAddNoteDialog.tsx` | `open: boolean, onOpenChange, preSelectedProjectId?: string` |

### Existing Components to Reuse

| Component | Usage |
|---|---|
| `Button` (shadcn) | All buttons — ghost, sm, primary, destructive variants |
| `Textarea` (shadcn) | Note content input (add + edit) |
| `Popover` + `PopoverContent` + `PopoverTrigger` (shadcn) | Project picker in Quick-Add dialog |
| `Dialog` + `DialogContent` (shadcn/Radix) | Quick-Add dialog wrapper |
| `Input` (shadcn) | Search input within project picker popover |
| `toast` (Sonner) | Success/error notifications |

### Data Model (for Agent 12)

```typescript
interface ProjectNote {
  id: string;
  projectId: string;
  content: string;         // Plain text (no rich text for Sprint 14)
  createdAt: string;       // ISO timestamp
  updatedAt: string;       // ISO timestamp (used for "(edited)" display)
  userId: string;          // For RLS
}
```

- Notes are ordered by `createdAt DESC` (newest first)
- The `updatedAt !== createdAt` check determines whether to show "(edited)"
- RLS: Users can only read/write their own notes (`user_id = auth.uid()`)

---

## 6. Implementation Notes for Agent 2

1. **Follow ProjectTaskList as the structural template.** The Notes section mirrors its layout: `widget-card` wrapper, `widget-header` + `widget-title`, list with `divide-y`, add-input at bottom with `surface-elevated` background.

2. **Keyboard shortcut registration:** Register `Cmd+Shift+N` / `Ctrl+Shift+N` at the App level (in `AppLayout` or a global hook). Use `useEffect` with `keydown` listener. Ensure it doesn't conflict with browser shortcuts (`Ctrl+Shift+N` is "new incognito window" in Chrome — consider `Cmd+Shift+.` or `Cmd+J` as alternative if conflict testing reveals issues).

3. **Quick-Add dialog context:** The dialog component should be rendered in `AppLayout` (alongside FloatingChat) so it's available on every page. Use Zustand or React context for the `open` state + pre-selected project ID.

4. **Optimistic updates:** Use React Query's `useMutation` with `onMutate` for optimistic add/edit/delete. Match the existing pattern in `useKaivooActions`.

5. **Service layer:** Create `note.service.ts` following the existing pattern: `dbToProjectNote()` converter + `fetchProjectNotes()` + `createProjectNote()` + `updateProjectNote()` + `deleteProjectNote()`.

6. **No rich text in Sprint 14.** Plain `<Textarea>` only. Rich text (TipTap) can be added in a future sprint if user feedback warrants it. This keeps the scope tight.

7. **Responsive behavior:** On mobile (< 768px), the Notes section stacks normally in the single-column layout. Action icons are always visible (no hover-reveal). The Quick-Add dialog becomes a bottom sheet (standard Radix Dialog behavior on mobile, or override with `DialogContent` positioning).

---

*This spec was produced as a Gate 1 (pre-implementation) deliverable by all three Design Agents acting in concert. Agent 2 should implement against this spec. Gate 3 (pre-merge review) will verify the running implementation against these exact requirements.*
