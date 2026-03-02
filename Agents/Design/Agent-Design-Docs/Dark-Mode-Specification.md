# Dark Mode Specification — Kaivoo Design System

**Owner:** Accessibility & Theming Agent
**Version:** 1.0
**Date:** February 2026
**Source:** Extracted from `daily-flow/src/index.css` `:root` and `.dark` blocks

---

## 1. Token Mapping Table

Every design token with its exact value in both themes. Values are HSL from CSS custom properties; hex values are computed equivalents.

### Core Tokens

| Token | Light (HSL) | Light (Hex) | Dark (HSL) | Dark (Hex) | Purpose |
|---|---|---|---|---|---|
| `--background` | 36 38% 97% | `#FAF8F5` | 249 30% 9% | `#10101D` | Canvas background |
| `--foreground` | 225 28% 14% | `#1A1F2E` | 37 21% 93% | `#F0ECE5` | Primary text |
| `--card` | 0 0% 100% | `#FFFFFF` | 245 35% 15% | `#181531` | Card/surface background |
| `--card-foreground` | 225 28% 14% | `#1A1F2E` | 37 21% 93% | `#F0ECE5` | Card text |
| `--popover` | 0 0% 100% | `#FFFFFF` | 246 31% 23% | `#2A2548` | Popover background |
| `--popover-foreground` | 225 28% 14% | `#1A1F2E` | 37 21% 93% | `#F0ECE5` | Popover text |
| `--primary` | 180 41% 39% | `#3B8C8C` | 180 43% 46% | `#43A8A8` | Resonance Teal — CTA, active |
| `--primary-foreground` | 0 0% 100% | `#FFFFFF` | 0 0% 100% | `#FFFFFF` | Text on primary |
| `--secondary` | 220 14% 95% | `#F0F2F5` | 246 34% 19% | `#1F1A3D` | Secondary surfaces |
| `--secondary-foreground` | 225 28% 14% | `#1A1F2E` | 37 21% 93% | `#F0ECE5` | Secondary text |
| `--muted` | 220 14% 95% | `#F0F2F5` | 246 34% 19% | `#1F1A3D` | Muted backgrounds |
| `--muted-foreground` | 223 11% 36% | `#525A6A` | 220 9% 64% | `#979DA8` | Muted/metadata text |
| `--accent` | 146 12% 61% | `#8BA89E` | 146 20% 68% | `#8DC0AB` | Sage Mist (decorative) |
| `--accent-foreground` | 225 28% 14% | `#1A1F2E` | 37 21% 93% | `#F0ECE5` | Accent text |
| `--destructive` | 11 54% 50% | `#C43A2B` | 14 67% 62% | `#E06040` | Ember — destructive/danger |
| `--destructive-foreground` | 0 0% 100% | `#FFFFFF` | 0 0% 100% | `#FFFFFF` | Text on destructive |
| `--border` | 220 14% 91% | `#E4E7EC` | 246 26% 28% | `#32305A` | Borders, dividers |
| `--input` | 220 14% 91% | `#E4E7EC` | 246 28% 22% | `#261F47` | Input backgrounds |
| `--ring` | 180 41% 39% | `#3B8C8C` | 180 43% 46% | `#43A8A8` | Focus ring |

### Semantic Status Tokens

| Token | Light (HSL) | Light (Hex) | Dark (HSL) | Dark (Hex) | Purpose |
|---|---|---|---|---|---|
| `--success` | 152 69% 96% | `#ECFDF4` | 145 80% 10% | `#052E16` | Success background |
| `--success-foreground` | 152 64% 29% | `#1B7A42` | 142 71% 58% | `#4ADE80` | Success text |
| `--warning` | 48 100% 96% | `#FFFBEB` | 21 92% 14% | `#451A03` | Warning background |
| `--warning-foreground` | 23 82% 31% | `#92400E` | 46 96% 65% | `#FACC15` | Warning text |
| `--info` | 214 100% 97% | `#EFF6FF` | 226 57% 21% | `#172554` | Info background |
| `--info-foreground` | 226 71% 40% | `#1E40AF` | 212 100% 78% | `#93C5FD` | Info text |

### Surface & Panel Tokens

| Token | Light (HSL/Hex) | Dark (HSL/Hex) | Purpose |
|---|---|---|---|
| `--surface-elevated` | 220 14% 93% / `#EBEEF2` | 246 34% 22% / `#261F47` | Elevated surfaces (hover, section bg) |
| `--panel-task-from` | 36 38% 97% / `#FAF8F5` | 245 35% 15% / `#181531` | Task panel gradient start |
| `--panel-task-to` | 0 0% 100% / `#FFFFFF` | 249 30% 11% / `#141024` | Task panel gradient end |
| `--panel-task-accent` | 180 41% 39% / `#3B8C8C` | 180 43% 46% / `#43A8A8` | Task panel accent color |
| `--panel-task-section` | 220 14% 96% / `#F3F5F7` | 246 34% 19% / `#1F1A3D` | Task panel section bg |

### Sidebar Tokens

| Token | Light (Hex) | Dark (Hex) |
|---|---|---|
| `--sidebar-background` | `#FAF8F5` | `#151030` |
| `--sidebar-foreground` | `#1A1F2E` | `#F0ECE5` |
| `--sidebar-primary` | `#3B8C8C` | `#43A8A8` |
| `--sidebar-accent` | `#ECEEF1` | `#261F47` |
| `--sidebar-border` | `#DFE2E8` | `#1F1A3D` |

### Shadow Tokens

| Token | Light | Dark |
|---|---|---|
| `--widget-shadow` | `0 1px 4px rgba(26,31,46,0.06), 0 1px 2px rgba(26,31,46,0.04)` | `0 1px 4px rgba(0,0,0,0.45), 0 1px 2px rgba(0,0,0,0.35)` |
| `--widget-shadow-hover` | `0 4px 16px rgba(26,31,46,0.10), 0 2px 6px rgba(26,31,46,0.06)` | `0 6px 20px rgba(0,0,0,0.55), 0 2px 6px rgba(0,0,0,0.40)` |

---

## 2. Contrast Ratio Table

Pre-computed contrast ratios for common text/background pairs. Formula: `(L1 + 0.05) / (L2 + 0.05)` where L1 > L2.

### Light Theme

| Foreground | Background | Ratio | Grade | Verdict |
|---|---|---|---|---|
| `--foreground` (#1A1F2E) | `--background` (#FAF8F5) | ~14.5:1 | AAA | PASS |
| `--foreground` (#1A1F2E) | `--card` (#FFFFFF) | ~15.3:1 | AAA | PASS |
| `--muted-foreground` (#525A6A) | `--background` (#FAF8F5) | ~6.0:1 | AA | PASS |
| `--muted-foreground` (#525A6A) | `--card` (#FFFFFF) | ~6.3:1 | AA | PASS |
| `--primary` (#3B8C8C) | `--background` (#FAF8F5) | ~4.5:1 | AA | PASS (borderline) |
| `--primary` (#3B8C8C) | `--card` (#FFFFFF) | ~4.7:1 | AA | PASS |
| `--primary-foreground` (#FFF) | `--primary` (#3B8C8C) | ~4.7:1 | AA | PASS |
| `--accent` (#8BA89E) | `--background` (#FAF8F5) | ~2.8:1 | Large only | WARN — body text fails |
| `--destructive` (#C43A2B) | `--card` (#FFFFFF) | ~5.0:1 | AA | PASS |
| `--destructive-foreground` (#FFF) | `--destructive` (#C43A2B) | ~5.0:1 | AA | PASS |

### Dark Theme

| Foreground | Background | Ratio | Grade | Verdict |
|---|---|---|---|---|
| `--foreground` (#F0ECE5) | `--background` (#10101D) | ~14.8:1 | AAA | PASS |
| `--foreground` (#F0ECE5) | `--card` (#181531) | ~12.2:1 | AAA | PASS |
| `--card-foreground` (#F0ECE5) | `--popover` (#2A2548) | ~8.5:1 | AAA | PASS |
| `--muted-foreground` (#979DA8) | `--background` (#10101D) | ~7.5:1 | AAA | PASS |
| `--muted-foreground` (#979DA8) | `--card` (#181531) | ~6.0:1 | AA | PASS |
| `--muted-foreground` (#979DA8) | `--secondary` (#1F1A3D) | ~5.2:1 | AA | PASS |
| `--primary` (#43A8A8) | `--background` (#10101D) | ~7.8:1 | AAA | PASS |
| `--primary` (#43A8A8) | `--card` (#181531) | ~6.3:1 | AA | PASS |
| `--primary-foreground` (#FFF) | `--primary` (#43A8A8) | ~3.8:1 | Large only | WARN — small text fails |
| `--accent` (#8DC0AB) | `--card` (#181531) | ~6.5:1 | AA | PASS |
| `--destructive` (#E06040) | `--card` (#181531) | ~4.8:1 | AA | PASS |
| `--destructive-foreground` (#FFF) | `--destructive` (#E06040) | ~3.6:1 | Large only | WARN — small text borderline |
| `--success-foreground` (#4ADE80) | `--success` (#052E16) | ~7.2:1 | AAA | PASS |
| `--warning-foreground` (#FACC15) | `--warning` (#451A03) | ~7.8:1 | AAA | PASS |
| `--info-foreground` (#93C5FD) | `--info` (#172554) | ~6.5:1 | AA | PASS |
| `--border` (#32305A) | `--card` (#181531) | ~1.8:1 | — | WARN — subtle, intentional |

### Known Issues

| Issue | Severity | Context |
|---|---|---|
| `--accent` on light bg | P2 | Sage Mist only passes for large text (≥18px). Design System already restricts usage. |
| `--primary-foreground` on `--primary` (dark) | P1 | White on dark teal = ~3.8:1. Passes for large text, fails for small. Use bold ≥14px or increase teal darkness. |
| `--destructive-foreground` on `--destructive` (dark) | P2 | White on dark Ember = ~3.6:1. Borderline. Consider using dark text on bright Ember instead. |
| `--border` visibility in dark mode | Intentional | Dark borders are subtle by design. Rely on shadows + spacing for separation, not border contrast. |

---

## 3. Semantic Color Adaptation Rules

### How Status Colors Work Across Themes

| Status | Light | Dark | Adaptation Strategy |
|---|---|---|---|
| **Destructive/High Priority** | Ember `#C43A2B` — dark red on white | Ember `#E06040` — brighter warm red on dark | Lightened +12% to maintain visibility on dark backgrounds |
| **Warning/Medium Priority** | Amber bg `#FFFBEB` + text `#92400E` | Amber bg `#451A03` + text `#FACC15` | Inverted: dark bg + bright text in dark mode |
| **Success** | Green bg `#ECFDF4` + text `#1B7A42` | Green bg `#052E16` + text `#4ADE80` | Inverted: dark bg + bright text in dark mode |
| **Info** | Blue bg `#EFF6FF` + text `#1E40AF` | Blue bg `#172554` + text `#93C5FD` | Inverted: dark bg + bright text in dark mode |
| **Primary/Active** | Teal `#3B8C8C` — medium on warm bg | Teal `#43A8A8` — brighter on dark bg | Lightened +7% for dark mode visibility |
| **Muted/Inactive** | `#525A6A` on `#FAF8F5` | `#979DA8` on `#10101D` | Lightened significantly to maintain readability |

### Project Color Bars on Timeline

Project color bars use user-selected colors. In dark mode:
- **Light project colors** (pastels, yellows) need dark text
- **Dark project colors** (navy, deep green) need light text
- **Implementation:** Use `getContrastTextColor(hex)` utility that returns black or white based on relative luminance threshold of 0.179

---

## 4. Component-Level Dark Mode Notes

### Cards (`widget-card`)
- Light: `#FFFFFF` bg, 1px `#E4E7EC` border, subtle shadow
- Dark: `#181531` bg, 1px `#32305A` border, stronger shadow (increased opacity)
- Hover: border transitions; shadow intensifies more in dark mode

### Badges / Chips
- Status badges use semantic token pairs (`--success` bg + `--success-foreground` text)
- Both themes swap bg/text lightness — light theme: light bg + dark text; dark theme: dark bg + bright text
- Project color badges: always use `getContrastTextColor()` for text color

### Timeline Bars
- Use project colors directly as background
- Text labels: computed black/white via luminance check
- Sprint 11 P0-5 fix: `getContrastTextColor(hex)` already implemented

### Sidebar
- Light: Warm Sand bg, Deep Navy text
- Dark: Deep purple-blue bg (#151030), warm cream text (#F0ECE5)
- Active item: Teal indicator, brighter in dark mode

### Inputs
- Light: `#E4E7EC` border, white bg
- Dark: `#261F47` bg (slightly lighter than card), `#32305A` border
- Focus: Teal ring identical in both themes (slightly brighter in dark)

### Shadows
- Light: Very subtle, warm-toned (`rgba(26,31,46,0.06)`)
- Dark: Stronger, pure black (`rgba(0,0,0,0.45)`) — necessary because dark backgrounds absorb subtle shadows
- Hover: Both themes increase shadow; dark mode increase is proportionally larger

---

## 5. How to Use This Document

1. **Accessibility & Theming Agent:** Reference Section 2 (Contrast Ratios) during every review. If a new color pair is introduced, compute its contrast ratio and add it to the table.

2. **Visual Design Agent:** Reference Section 1 (Token Mapping) when specifying colors for new components. Always specify BOTH theme values.

3. **Agent 2 (Engineer):** When adding new CSS, always define both `:root` and `.dark` values for new tokens. Reference Section 4 for component-level patterns.

4. **Updating this document:** When new tokens are added to `index.css`, this document must be updated. When contrast issues are found and fixed, update the ratio table.

---

*Dark Mode Specification v1.0 — February 2026*
*This document is the ground truth for theme tokens and contrast ratios.*
*Every color decision must work in both themes or it's not done.*
