# 3-Agent Design Review — Sprint 12: Projects Pages

**Date:** February 24, 2026
**Scope:** Projects.tsx, ProjectDetail.tsx, ProjectCard.tsx, CreateProjectDialog.tsx, TimelineProjectBar.tsx, project-config.tsx
**Sprint:** 12 (Craft)

---

## Agent 1: Visual Design Agent — PASS WITH NOTES

**Hierarchy:** ISSUE — Card grid gap-5 (20px) below 32px spec; tab-to-search gap mb-4 below 24px spec
**Brand:** ISSUE — Project color palette undocumented vs brand tokens; widget-card p-5 (20px) vs spec 24px
**Composition:** PASS — Minor timeline magic numbers
**Craft:** ISSUE — transition-all overscoped; priority flag inline alignment; inconsistent empty state icon sizes

### P1 Findings
| # | File | Line | Issue | Fix |
|---|---|---|---|---|
| V-P1-A | Projects.tsx | 161 | `gap-5` (20px) between project cards | Change to `gap-8` (32px) |
| V-P1-B | ProjectDetail.tsx | 269, 434 | `mb-6`/`mt-6` between widget cards | Change to `mb-8`/`mt-8` (32px) |
| V-P1-C | Projects.tsx | 103 | `mb-4` between tabs and search | Change to `mb-6` (24px) |
| V-P1-D | CreateProjectDialog.tsx | 185 | Color swatch aria-label uses raw hex | Use `PROJECT_COLOR_NAMES[c]` |
| V-P1-E | ProjectCard.tsx | 46 | `transition-all` overscoped | Change to `transition-[transform,border-color,box-shadow]` |
| V-P1-F | ProjectDetail.tsx | 405-407 | Priority Flag icon misaligned | Wrap in `inline-flex items-center gap-0.5` |

---

## Agent 2: Accessibility & Theming Agent — FAIL

**Contrast:** ISSUE — P0 dark mode semantic colors invisible
**ARIA:** ISSUE — Missing tablist label, tab controls, select labels
**Focus:** ISSUE — Task rows and description not keyboard accessible
**Inclusive:** PASS WITH NOTES — Touch targets below spec
**Dark Mode:** ISSUE — P0 critical contrast failure

### P0 Findings (Blocks Merge)
| # | File | Line | Issue | Fix |
|---|---|---|---|---|
| A-P0-1 | index.css / project-config.tsx | 168-173 / 13-15 | `text-info/success/warning` = near-black in dark mode (~1:1 contrast on card) | Use `text-info-foreground` / `text-success-foreground` / `text-warning-foreground` everywhere |
| A-P0-2 | CreateProjectDialog.tsx / ProjectDetail.tsx | 177 / 445 | Color swatch 28x28px < 44px touch target | Increase to `w-8 h-8` with padding wrapper |

### P1 Findings
| # | File | Line | Issue | Fix |
|---|---|---|---|---|
| A-P1-1 | Projects.tsx | 103-128 | Tablist missing `aria-label`; tabs missing `aria-controls` | Add `aria-label` to tablist, `aria-controls` + `id` to tabs, `role="tabpanel"` to grid |
| A-P1-2 | ProjectDetail.tsx | 362 | Task row div not keyboard accessible | Add `role="button"` `tabIndex={0}` `onKeyDown` |
| A-P1-3 | ProjectDetail.tsx | 188, 252 | Title/description click-to-edit not keyboard accessible | Add `role="button"` `tabIndex={0}` `onKeyDown` |
| A-P1-4 | CreateProjectDialog.tsx | 116, 135 | Status/Topic select labels not associated | Add `aria-label` to SelectTrigger |
| A-P1-5 | ProjectDetail.tsx | 203 | Status SelectTrigger lacks accessible label | Add `aria-label="Change project status"` |
| A-P1-6 | project-config.tsx | 57-63 | `getContrastTextColor` uses BT.601, not WCAG luminance | Replace with sRGB linearization formula |

---

## Agent 3: UX Completeness Agent — PASS WITH NOTES

**States:** ISSUE — No loading guard; false empty state on cold load
**Navigation:** PASS WITH NOTES — 404 handled, breadcrumbs present
**Input Patterns:** ISSUE — No date range validation; date inputs fire on every keystroke
**Edit-in-Place:** PASS WITH NOTES — Topic not editable after creation
**Anti-Patterns:** ISSUE — Dialog closes on failure; link popover no feedback

### P0 Findings (Blocks Merge)
| # | File | Line | Issue | Fix |
|---|---|---|---|---|
| U-P0-1 | Projects.tsx / ProjectDetail.tsx | 32 / 48 | No loading guard — false "No projects" on cold load | Read `isLoaded` from store; show skeleton while false |
| U-P0-2 | CreateProjectDialog.tsx | 62-75 | Dialog closes on DB failure, discarding input | Check `addProject` return; keep dialog open on failure |

### P1 Findings
| # | File | Line | Issue | Fix |
|---|---|---|---|---|
| U-P1-1 | ProjectDetail.tsx | 224 | Topic is read-only after creation | Replace Badge with inline Select |
| U-P1-2 | ProjectDetail.tsx | 467, 475 | Date inputs fire updateProject on every keystroke | Use `onBlur` instead of `onChange` |
| U-P1-3 | CreateProjectDialog.tsx / ProjectDetail.tsx | 153-169 / 460-479 | No date range validation (end < start allowed) | Validate on submit/blur |
| U-P1-4 | ProjectDetail.tsx | 317-330 | "Link existing" popover gives no feedback | Close popover or show confirmation after linking |

---

## Combined P0 Summary (Must Fix Before Merge)

1. **Dark mode contrast collapse** — `text-info/success/warning` tokens are background-tints in dark mode, not foreground-safe colors
2. **Touch target violation** — Color swatch buttons are 28x28px, need ≥44px
3. **False empty state** — No loading guard; store `isLoaded` not checked
4. **Dialog data loss** — CreateProjectDialog closes on DB failure
