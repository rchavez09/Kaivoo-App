# Design Review — Sprint 30 (Bug Bash + Concierge Hardening)

**Date:** March 2026
**Sprint scope:** Primarily backend fixes. UI changes limited to 3 parcels:
- **P6:** Calendar widget empty state (ScheduleWidget.tsx)
- **P11:** File rename inline UI (FileList.tsx)
- **P12:** Upload polish — indeterminate progress bar + drag icon scale (FileDropZone.tsx)

---

## Visual Design Agent

**Verdict:** PASS

### Hierarchy: PASS
- **P6 (ScheduleWidget):** The empty state message ("No meetings today") uses `text-sm text-muted-foreground` centered within the widget card. It maintains the correct Task-First hierarchy — the schedule widget remains subordinate to the task area above it. The empty state does not compete for attention.
- **P11 (FileList):** The rename input appears inline, replacing the filename text. The pencil icon trigger uses `h-3.5 w-3.5` sizing consistent with the adjacent ExternalLink and Trash2 icons. Visual weight is well-balanced — the rename input has a subtle `border-primary/50` border that draws appropriate attention without overwhelming.
- **P12 (FileDropZone):** The indeterminate progress bar sits below the upload icon and label, following natural top-to-bottom reading flow. The `scale-125` on the Upload icon during drag is a subtle visual cue that does not break hierarchy.

### Brand: PASS
- All colors use design system tokens: `text-muted-foreground`, `text-foreground`, `text-primary`, `bg-primary`, `bg-secondary`, `border-border`, `border-primary`. No arbitrary hex values introduced.
- Typography is consistent: `text-sm font-medium` for filenames, `text-xs` for upload labels, `text-[10px]` and `text-[11px]` for metadata (file size, max size hint) — consistent with existing patterns in the codebase.
- The `bg-[hsl(var(--surface-elevated))]` in FileList uses the defined `--surface-elevated` token (light: `220 14% 93%`, dark: `246 34% 22%`), which is part of the design system.
- Lucide icons (Pencil, Upload, Loader2) are consistent with the outline icon style used throughout the app.

### Composition: PASS
- **P11 (FileList):** The action buttons (Pencil, ExternalLink, Trash2) use identical sizing (`p-1.5`, `h-3.5 w-3.5`) and spacing (`gap-0.5`), maintaining consistent rhythm across the action bar.
- **P12 (FileDropZone):** The upload state layout (`flex-col items-center gap-2`) mirrors the default state layout, preserving visual cohesion between states.
- File list items use `gap-2` between them via the parent `grid gap-1.5`, maintaining consistent spacing rhythm.

### Craft: PASS
- **P6:** The empty state is intentionally designed (centered message with padding `py-4`) rather than blank space. This is a proper empty state treatment.
- **P11:** The rename input pre-fills with the filename without extension — a polished detail. Hover states on action buttons use `hover:bg-secondary/50 hover:text-foreground` with `transition-opacity`, providing smooth feedback. The `md:opacity-0 md:group-hover:opacity-100` pattern progressively reveals actions on desktop hover while keeping them visible on mobile — a craft-conscious responsive approach.
- **P12:** The indeterminate progress bar (`h-1 w-full max-w-[200px] rounded-full bg-secondary` with `animate-indeterminate`) is properly styled with contained max-width. The animation keyframes (`translateX(-100%)` to `translateX(400%)`) at 1.5s ease-in-out provide smooth, non-jarring movement.
- All interactive elements have hover states with appropriate transitions.

**Findings:** None. All three UI changes are visually consistent and well-crafted for the scope of the sprint.

---

## Accessibility & Theming Agent

**Verdict:** PASS WITH CONDITIONS

### Contrast (Light): PASS
- **P6:** `text-muted-foreground` on `card` background (white). In light theme, muted-foreground is approximately `#525A6A` on `#FFFFFF`. Computed contrast ratio is approximately 6.3:1, well above the 4.5:1 threshold for the `text-sm` (14px) body text.
- **P11:** Filename text uses `text-foreground` (~`#1A1F2E`) on `--surface-elevated` (~`#EDEFF1`). Contrast is approximately 9.5:1 — PASS. The rename input uses `text-foreground` on `bg-transparent` (inheriting the surface-elevated background) — same ratio, PASS.
- **P12:** Upload text uses `text-muted-foreground` on the default border zone background. During upload, the indeterminate bar uses `bg-primary` on `bg-secondary` — both are non-text UI elements, requiring 3:1 contrast per WCAG 1.4.11. Primary (`#3B8C8C`) on secondary (~`#F0F2F5`) exceeds 3:1 — PASS.

### Contrast (Dark): PASS
- **P6:** `text-muted-foreground` (~`#979DA8`) on card background (~`#181531`). Estimated contrast approximately 5.0:1 — PASS for `text-sm`.
- **P11:** `text-foreground` (~`#F0ECE5`) on `--surface-elevated` (~`#261F47`). Estimated contrast approximately 8.5:1 — PASS. The `border-primary/50` on the rename input would be approximately `#43A8A8` at 50% opacity against the dark background — visible as a UI boundary indicator.
- **P12:** `bg-primary` (~`#43A8A8`) on `bg-secondary` (~`#1F1A3D`). Non-text contrast is approximately 4.8:1 — PASS.

### ARIA: PASS
- **P6:** The empty state is a simple `<p>` element — no interactive role needed, semantically correct.
- **P11:** The rename button has `aria-label={`Rename ${file.name}`}` — properly labeled icon button. The open link has `aria-label={`Open ${file.name}`}`. The delete button has `aria-label={`Delete ${file.name}`}`. All icon-only actions are properly labeled.
- **P12:** The drop zone has `role="button"` and `aria-label="Drop files here or click to upload"` — correct. The hidden file input has `tabIndex={-1}` to remove it from the tab order — correct.

### Focus: PASS
- **P11:** The rename input (`<input>`) is natively focusable. `onBlur` commits the rename. `onKeyDown` handles Enter (commit) and Escape (cancel) — full keyboard operability. The pencil button is a `<button>` element, natively focusable.
- **P12:** The drop zone has `tabIndex={0}` and an `onKeyDown` handler for Enter and Space — keyboard accessible. Focus management is correct.

### Inclusive: PASS WITH CONDITIONS
- **Reduced motion:** The `animate-indeterminate` animation in FileDropZone and `animate-spin` on Loader2, plus `scale-125` transition on the Upload icon, are all covered by the global `prefers-reduced-motion: reduce` rule in `index.css` which sets `animation-duration: 0.01ms !important` and `transition-duration: 0.01ms !important` on all elements. PASS.
- **Color independence:** The source color dots in ScheduleWidget (green/purple/orange) still convey calendar source alongside a text label (`{source}` — "google", "outlook", "manual"). PASS — not new to this sprint, pre-existing pattern with text supplement.
- **Touch targets:** The action buttons in FileList use `p-1.5` on a `h-3.5 w-3.5` icon, giving approximately 22x22px touchable area. On mobile these are always visible (`opacity-60`), but the touch target is below the 44x44px WCAG recommendation.

**Condition (P2):** The action buttons in FileList (rename, open, delete) have touch targets below 44x44px on mobile. Currently they are ~22px square. Consider adding `min-h-[44px] min-w-[44px]` or increasing padding on mobile breakpoints. This is pre-existing to this sprint (the open and delete buttons already existed at this size), but the new rename button inherits the same constraint. Non-blocking for Sprint 30 — track for a future accessibility pass.

### Dark Mode Pass: PASS
- The `--surface-elevated` token has a dedicated dark mode value (`246 34% 22%`, ~`#261F47`) that provides visible separation from `--card` (~`#181531`). File items will be visually distinct in dark mode.
- The `border-primary/50` on the rename input will render as a visible teal border in dark mode.
- The indeterminate progress bar (`bg-primary` on `bg-secondary`) will be visible — teal bar on dark purple background.
- No merging backgrounds, vanishing text, or invisible borders detected.

**Findings:**
- **P2 — Touch targets on FileList action buttons.** Pre-existing pattern, but the new rename button inherits the same sub-44px sizing. Non-blocking; address in a future accessibility sprint.

---

## UX Completeness Agent

**Verdict:** PASS

### States: PASS
- **P6 (ScheduleWidget):** The key change in this sprint. Previously returned `null` when no meetings existed (blank space — a P0 violation). Now shows `"No meetings today"` centered in the widget with appropriate `py-4` padding. The populated state remains unchanged. The count badge conditionally renders only when `meetings.length > 0`. This directly resolves the empty-state gap.
- **P11 (FileList):**
  - **Empty state:** Returns `null` when `files.length === 0` — this is correct behavior for an attachment list (the drop zone remains visible as the CTA).
  - **Loading state:** Shows a centered `Loader2` spinner when `isLoading` is true — appropriate for an indeterminate file list fetch.
  - **Error state:** URL fetch failures are silently caught (link simply hidden) — acceptable since the filename and file size remain visible. Delete failures reset the loading state cleanly.
  - **Rename flow:** Handles empty input (no-op), unchanged name (no-op), and preserves file extension automatically. Keyboard support: Enter to commit, Escape to cancel, blur to commit. Complete interaction cycle.
- **P12 (FileDropZone):**
  - **Idle state:** Shows upload icon + instructional text + max size hint.
  - **Dragging state:** Changes border to `border-primary`, adds `bg-primary/5` tint, icon scales up, text changes to "Drop to upload." Clear visual differentiation.
  - **Uploading state:** Disables interaction (`pointer-events-none opacity-60`), shows spinner + filename + indeterminate progress bar. All states accounted for.
  - **Error state:** File size violations trigger a toast error before upload starts — correct inline error handling.

### Navigation: PASS
- No new routes, pages, or modals introduced. All changes are inline within existing views. No navigation dead ends created.

### Input Patterns: PASS
- **P11 rename:** The inline rename input is a `<input type="text">` for a filename — appropriate input type. The edit affordance is a visible pencil icon button (Lucide `Pencil`), satisfying the "edit affordance must be visible" criterion. On mobile, the icon is visible at reduced opacity (`opacity-60`); on desktop, it appears on hover (`md:group-hover:opacity-100`). The input is visually distinct from the display state (bordered input vs. underlined link text). Extension is preserved automatically — users edit only the base name.
- **P12 upload:** Click-to-browse uses a hidden `<input type="file">` triggered by the visible drop zone — standard pattern. The `multiple` attribute allows batch uploads.

### Edit-in-Place: PASS
- **P11:** File rename is fully inline — pencil icon click transforms the filename into an editable input within the same row. No navigation, no modal, no drawer. This is textbook "edit where you see it" compliance.
- The rename flow is: see filename -> click pencil -> edit in-place -> Enter/blur to save. Primary action requires exactly 2 clicks (pencil click + Enter) — within the 2-click threshold.

### Anti-Patterns: PASS
- **AP-1 (Forced navigation):** No forced navigation introduced. Rename, delete, and upload all happen inline.
- **AP-5 (Data overwhelm):** File lists are bounded by actual uploaded files — no pagination needed at this stage.
- No other anti-patterns triggered by these changes.

**Findings:** None. All three UI changes are UX-complete for their scope.

---

## Overall

**Verdict:** PASS

All three design agents pass. The single condition raised (P2 touch target sizing on FileList action buttons) is a pre-existing pattern inherited by the new rename button, not a regression introduced in Sprint 30. It is non-blocking and tracked for a future accessibility improvement pass.

**Summary of changes reviewed:**
| Parcel | File | Change | Status |
|---|---|---|---|
| P6 | `ScheduleWidget.tsx` | Empty state message instead of null | Clean PASS |
| P11 | `FileList.tsx` | Inline rename UI with pencil icon | Clean PASS |
| P12 | `FileDropZone.tsx` | Indeterminate progress bar + drag scale | Clean PASS |

This sprint's UI changes are minimal, well-scoped, and consistent with the existing design system. No merge blockers from Design.
