# Kaivoo Design System v2.0 — Quick Reference
## For Sprint Implementation Use

**Full archive:** `Kaivoo-Design-System-v2.0.md` — Contains full prose, rationale, examples, migration guide, and JSON tokens.

---

## Key Rules (Read First)

```
1.  ONE CTA PER SCREEN         Only one Resonance Teal filled button per viewport
2.  WARM SAND, NOT WHITE        Canvas is #FAF8F5, never pure #FFFFFF
3.  SAGE MIST ≠ TEXT            Never use Sage Mist (#8FA89A) as text on light bg (fails AA). Use Sage Deep (#6B8F7A)
4.  GRADIENT = STRIPE           Ocean gradient is a 4px Depth Bar or thin accent — never a background wash
5.  DEPTH = INFORMATION         Shallow ocean tones = recent/surface data. Deep tones = historical/analytical data
6.  17px BODY MINIMUM           Body text is never smaller than 17px (dyslexic readability standard)
7.  ERRORS EXPLAIN + RESOLVE    "[What went wrong]. [How to fix it]." — never generic codes
8.  DARK MODE = ABYSS           Purple-navy surfaces, not inverted light mode. Never flatten to neutral grey
9.  MOTION IS OPTIONAL          Every animation has a static fallback. prefers-reduced-motion disables all
10. BUTTONS SAY WHAT THEY DO    "Save changes" not "Submit". Include a verb. Sentence case.
11. COLOR RATIO 50/20/10/10/10  Deep Navy+Sand (50%), Ocean Gradient (20%), Sand Accents (10%), CTA (10%), Rest (10%)
12. GLASS ≠ DATA ENTRY          Glass-morphism for dashboards/summaries only. Forms, charts, alerts = opaque
13. NO GAMIFICATION             No streaks, points, badges, leaderboards. Progress through data insight.
```

---

# 1. Design Principles

| Principle | Summary | Key Rule |
|-----------|---------|----------|
| Quiet Confidence | Interface feels like a deep breath, not a notification | One accent per screen; animations functional only; whitespace over dividers |
| Clarity Over Cleverness | If a user thinks about the interface, we failed | Plain language labels; errors explain + resolve; platform-convention navigation |
| Warmth Through Craft | Technology should feel made by people who care | Warm Sand not white; generous radii (12-16px); 300ms ease-out; breathing room |
| Depth Not Noise | Ocean metaphor is a system, not decoration | Gradient as stripe; depth = information depth; ocean colors encode temporal depth |

---

# 2. Color System

## 2.1 Brand Palette — Primary

| Color | Hex | Role | Contrast on Warm Sand |
|-------|-----|------|----------------------|
| Deep Navy | #1A1F2E | Primary text, headings, UI anchors | 16.2:1 AAA |
| Warm Sand | #FAF8F5 | Primary canvas, backgrounds | — |
| Sage Mist | #8FA89A | Accent lines, decorative highlights (NOT text) | 3.0:1 FAIL for text |
| Sage Deep | #6B8F7A | Text-accessible sage variant, labels on light bg | 4.5:1 AA |
| Resonance Teal | #3B8C8C | Primary CTA, active states, success indicators | 5.4:1 AAA |
| Storm Blue | #4A5E78 | Secondary UI, data viz, metadata | 5.9:1 AAA |
| Dusk Rose | #C4A08A | Emotional warmth, editorial accents, illustrations | 2.3:1 decorative only |

## 2.2 Brand Palette — Secondary

| Color | Hex | Role |
|-------|-----|------|
| Twilight Lavender | #9B8EB0 | Night mode, premium features |
| Sunlit Amber | #D4A952 | Energy, morning, activation |
| Ember | #C75C3A | Alerts, urgent/destructive states |
| Clarity Blue | #5B7FBF | Links, informational |

## 2.3 Ocean Gradient Tokens

| Token | Hex | Zone | Usage |
|-------|-----|------|-------|
| ocean-foam | #D4EDE4 | Shore | Hover tints (30% opacity), progress fills |
| ocean-shallow | #7EC8C8 | Shallows | Interactive borders, secondary fills, sparklines |
| ocean-surface | #3B8C8C | Open Water | **= Resonance Teal.** Primary CTA, chart series 1 |
| ocean-mid | #2B6E8A | Midwater | Chart series 2, active nav states |
| ocean-deep | #1E4D7A | The Deep | Deep insights, Depth Card bg, trend headers |
| ocean-twilight | #1E3364 | Twilight | Premium features, dark section backgrounds |
| ocean-abyss | #2A1B4E | Abyss | Dark mode accent, deepest insight cards |
| ocean-trench | #1A1232 | Trench | Darkest canvas alternative, use sparingly |

## 2.4 Semantic UI Colors

| State | Light FG | Light BG | Light Border | Dark FG | Dark BG | Dark Border |
|-------|----------|----------|-------------|---------|---------|-------------|
| Success | #1B7A4E | #ECFDF5 | #86EFAC | #4ADE80 | #052E16 | #166534 |
| Warning | #92400E | #FFFBEB | #FDE68A | #FCD34D | #451A03 | #78350F |
| Error | #991B1B | #FEF2F2 | #FECACA | #FCA5A5 | #450A0A | #7F1D1D |
| Info | #1E40AF | #EFF6FF | #BFDBFE | #93C5FD | #172554 | #1E3A5F |

## 2.5 Health Semantic Colors

| State | Light | Dark | Usage |
|-------|-------|------|-------|
| Optimal | #2D8659 | #34C759 | Healthy range, goals met |
| Elevated | #C49A2A | #FFD60A | Approaching threshold |
| Alert | #C44B3A | #FF6961 | Outside healthy range |
| Below | #5A54B0 | #7D7AFF | Below target |
| Sleep | #5A54B0 | #7D7AFF | Sleep stage data |
| Activity | #C4862A | #FFB340 | Movement, exercise |
| Heart | #C44B5E | #FF375F | Heart rate, HRV |
| Mindfulness | #8A52B0 | #BF5AF2 | Meditation, calm |
| Nervous System | #3B8C8C | #4BBFBF | Vagal tone (= Resonance Teal) |

## 2.6 Neutral Scale

| Name | Hex | Usage | Dark Equivalent |
|------|-----|-------|----------------|
| Charcoal | #2D3142 | Body text, primary labels | #F1F2F4 |
| Slate | #525868 | Secondary text, metadata | #9CA3AF |
| Silver | #9CA3AF | Disabled states, placeholders | #6B7280 |
| Mist | #E5E7EB | Borders, dividers | #2D3142 |
| Cloud | #F3F4F6 | Card backgrounds, containers | #1A1F2E |

## 2.7 Dark Mode — "The Abyss"

**Surfaces:**

| Layer | Hex | Usage |
|-------|-----|-------|
| Canvas | #12101E | Page background |
| Card | #1A1832 | Card backgrounds |
| Elevated | #232040 | Modals, floating panels |
| Overlay | #2D294E | Modal overlays |

**Text:**

| Level | Hex |
|-------|-----|
| Primary | #F0EDE8 (warm off-white, never pure #FFF) |
| Secondary | #9CA3AF |
| Tertiary | #6B7280 |
| Disabled | #4B5563 |

**Dark Mode — Brightened Accents:**

| Token | Light | Dark |
|-------|-------|------|
| ocean-foam | #D4EDE4 | #A8E4D4 |
| ocean-shallow | #7EC8C8 | #8AD4D4 |
| ocean-surface | #3B8C8C | #4BBFBF |
| ocean-mid | #2B6E8A | #5B9BD5 |
| ocean-deep | #1E4D7A | #5B9BD5 |
| ocean-twilight | #1E3364 | #7B8FD4 |
| ocean-abyss | #2A1B4E | #9B7BD4 |
| Sage Mist | #8FA89A | #A3C4B2 |
| Resonance Teal | #3B8C8C | #4BBFBF |
| Storm Blue | #4A5E78 | #7B9AC2 |
| Dusk Rose | #C4A08A | #D4B8A4 |
| Ember | #C75C3A | #E07A5C |
| Clarity Blue | #5B7FBF | #7FA3E0 |
| Sunlit Amber | #D4A952 | #E4C070 |
| Twilight Lavender | #9B8EB0 | #B5A8CC |

## 2.8 Color Usage Rules

```
Rule 1 — 50/20/10/10/10 Ratio: Deep Navy+Sand (50%), Ocean (20%), Sand Accents (10%), CTA (10%), Rest (10%)
Rule 2 — One CTA per screen: Only one Resonance Teal filled background per viewport
Rule 3 — Semantic overrides brand: System feedback always uses semantic colors, not brand approximations
Rule 4 — Abyss is not inverted: Purple-navy surfaces + brightened accents. Never neutral grey.
Rule 5 — Sage Mist ≠ text: Use Sage Deep (#6B8F7A) for any sage-toned text on light backgrounds
Rule 6 — Opacity for tints: Brand/ocean colors as bg tints = 8-15% opacity. Never full-saturation large areas.
Rule 7 — Gradient = stripe: Full ocean gradient only as Depth Bar (4px) or thin accent. Never a wash.
Rule 8 — Depth encodes info: Recent/surface → shallow tones. Historical/deep → deep tones. Semantic, not decorative.
```

## 2.9 Contrast Compliance

| Combination | Ratio | Grade |
|-------------|-------|-------|
| Deep Navy on Warm Sand | 15.2:1 | AAA |
| Charcoal on Warm Sand | 12.8:1 | AAA |
| Slate on Warm Sand | 5.7:1 | AA |
| Sage Deep on Warm Sand | 4.5:1 | AA |
| Sage Mist on Warm Sand | 3.1:1 | **FAIL** (decorative only) |
| Warm off-white on Deep Navy | 15.2:1 | AAA |
| Ocean Surface on Warm Sand | 4.6:1 | AA large |
| Ocean Deep on Warm Sand | 7.8:1 | AAA |
| Warm off-white on Abyss Canvas | 13.8:1 | AAA |
| Ocean Surface dark on Abyss Canvas | 8.2:1 | AAA |

---

# 3. Gradients

## 3.1 Named Gradients (CSS)

```css
--gradient-depth-full: linear-gradient(90deg, #D4EDE4 0%, #7EC8C8 20%, #3B8C8C 40%, #2B6E8A 55%, #1E4D7A 70%, #1E3364 85%, #2A1B4E 100%);
/* Usage: Depth Bar, brand collateral. Always L→R. */

--gradient-depth-surface: linear-gradient(90deg, #D4EDE4 0%, #7EC8C8 40%, #3B8C8C 100%);
/* Usage: Dashboard accents, Shore Card hover accent, shallow data viz fills */

--gradient-depth-deep: linear-gradient(90deg, #3B8C8C 0%, #1E4D7A 50%, #2A1B4E 100%);
/* Usage: Depth Card backgrounds, AI insight cards, long-term analysis */

--gradient-depth-abyss: linear-gradient(90deg, #1E4D7A 0%, #1E3364 40%, #2A1B4E 70%, #1A1232 100%);
/* Usage: Dark mode accent sections, night/meditation screens */

--gradient-ripple: radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(126,200,200,0.12) 0%, rgba(59,140,140,0.04) 40%, transparent 70%);
/* Usage: Card/button hover states. Max opacity 12%. */

--gradient-score-arc: conic-gradient(from 225deg, #D4EDE4, #7EC8C8, #3B8C8C, #1E4D7A);
/* Usage: Regulation Score arc. Low=shallow, High=deep. */

--gradient-chart-fill: linear-gradient(180deg, rgba(59,140,140,0.20) 0%, rgba(30,77,122,0.05) 100%);
/* Usage: Area chart backgrounds. Top→Bottom. */
```

## 3.2 Gradient Rules

| Rule | Direction | Notes |
|------|-----------|-------|
| Depth Bar | L→R (90°) | NEVER vertical |
| Card bottom accent | L→R (90°) | |
| Area chart fill | Top→Bottom (180°) | Vertical only |
| Depth Card bg | Top→Bottom (180°) | Vertical only |
| Hover ripple | Radial from cursor | |
| Score arc | Conic (225° start) | Circular only |

**Opacity:** Hover 5-15% · Chart fill 15-25% · Card tint 30-40% · Depth Bar 80-100%

## 3.3 Depth Bar

```
Height: 4px | Width: 100% container | Gradient: --gradient-depth-full | Direction: always L→R
Position: Below header, above content | Z-index: 101 | Border-radius: 0
Dark mode: 80% opacity + glow: box-shadow 0 1px 8px rgba(126,200,200,0.15)
Animation: Optional shimmer on load, 800ms ease-wave, once per session
NEVER: vertical, thicker than 6px, below 60% opacity, more than once per viewport
```

---

# 4. Typography

## 4.1 Font Families

```
Brand:     'Neue Haas Grotesk Display Pro', 'Helvetica Neue', Helvetica, Arial, system-ui, sans-serif
Editorial: 'Spectral', Georgia, 'Times New Roman', serif
Product:   'Inter Variable', 'Inter', system-ui, -apple-system, sans-serif

Brand = landing pages, marketing, onboarding. Product = all in-app UI. Editorial = long-form reading only.
Never mix all three on one screen. Inter Variable: enable tnum (tabular numerals) for all data displays.
```

## 4.2 Product UI Type Scale (Inter Variable)

| Style | Weight | Size | Line-Height | Letter-Spacing | Usage |
|-------|--------|------|-------------|----------------|-------|
| Display | Light 300 | 32-40px | 1.15 | -0.01em | Hero metrics, greeting headers |
| H1 | SemiBold 600 | 24-28px | 1.2 | -0.005em | Page titles |
| H2 | SemiBold 600 | 20-22px | 1.25 | 0 | Section headers |
| H3 | Medium 500 | 17-18px | 1.3 | 0 | Card titles, subsection headers |
| Body | Regular 400 | 17px | 1.6 | +0.01em | Default text, form labels. **Minimum 17px** |
| Body Small | Regular 400 | 14px | 1.5 | +0.01em | Secondary descriptions, compact lists |
| Data Value | Medium 500, tnum | 24-48px | 1.0 | 0 | Hero metrics, score displays |
| Data Label | Medium 500, UPPER | 12px | 1.3 | +0.04em | Metric labels, chart axis labels |
| Caption | Regular 400 | 12px | 1.4 | +0.01em | Timestamps, metadata |

## 4.3 Brand Type Scale (Neue Haas Grotesk) — Condensed

| Style | Weight | Desktop | Mobile | Line-Height | Usage |
|-------|--------|---------|--------|-------------|-------|
| Display | Medium 500 | 56px | 34px | 1.05-1.1 | Hero headlines (1 per page max) |
| Headline | Medium 500 | 40px | 28px | 1.1-1.15 | Page titles (H1) |
| Title 1 | Medium 500 | 28px | 22px | 1.2-1.25 | Section headers (H2), modal titles |
| Title 2 | Medium 500 | 22px | 18px | 1.25-1.3 | Subsection headers (H3), card titles |
| Title 3 | Medium 500 | 18px | 16px | 1.3-1.35 | Minor headings (H4) |
| Body | Regular 400 | 17px | 17px | 1.5-1.55 | UI text, paragraphs |
| Callout | Regular 400 | 15px | 15px | 1.45-1.5 | Supporting text, helper text |
| Subheadline | Bold 700, UPPER | 13px | 13px | 1.4 | Overline labels, category tags |
| Footnote | Regular 400 | 13px | 13px | 1.4 | Metadata, timestamps |
| Caption | Regular 400 | 11px | 11px | 1.35 | Legal, footnotes (use sparingly, AAA only) |

## 4.4 Typography Rules

```
- Body text minimum: 17px (v2.0 dyslexic readability)
- UPPERCASE reserved for Subheadline and Data Label only
- Max 3 weights per screen: Regular/Medium/Bold (brand) or Regular/Medium/SemiBold (product)
- Italic for emphasis in Spectral body; Medium weight for emphasis in product UI
- Tabular numerals (tnum) ON for all data displays
- Line length: 50-75 chars optimal, 85 max
- Contrast: Body text AAA (7:1), Large text AA (4.5:1), UI components AA (3:1)
```

---

# 5. Layout & Spacing

## 5.1 Responsive Grid

| Breakpoint | Viewport | Columns | Gutter | Margin | Max Content |
|------------|----------|---------|--------|--------|-------------|
| Desktop Large | ≥1440px | 12 | 24px | 80px | 1280px |
| Desktop | 1024-1439px | 12 | 24px | 64px | Fluid |
| Tablet | 768-1023px | 8 | 20px | 40px | Fluid |
| Mobile Large | 428-767px | 4 | 16px | 24px | Fluid |
| Mobile | 375-427px | 4 | 16px | 20px | Fluid |
| Mobile Small | 320-374px | 4 | 12px | 16px | Fluid |

Dashboard uses **7/5 asymmetric split** (primary 7 cols / secondary 5 cols) at ≥1024px.

```css
--breakpoint-sm: 375px;
--breakpoint-md: 768px;
--breakpoint-lg: 1024px;
--breakpoint-xl: 1440px;
--breakpoint-2xl: 1920px;
```

## 5.2 Spacing Scale

| Token | Value | Usage |
|-------|-------|-------|
| space-1 | 4px | Icon-label gaps, tight internal padding |
| space-2 | 8px | Min padding in small components, form gaps |
| space-3 | 12px | Small component padding (compact buttons, tags) |
| space-4 | 16px | Default component padding (buttons, inputs, cards) |
| space-5 | 24px | Card padding, content block spacing, modal body |
| space-6 | 32px | Section spacing within page, card grid gaps |
| space-7 | 48px | Major section dividers |
| space-8 | 64px | Page-level section breaks |
| space-9 | 96px | Hero padding, landing page sections |
| space-10 | 128px | Landing page hero (desktop max) |

**Rules:** Related = closer (1-3). Vertical rhythm > symmetry. Touch targets: 48×48px min, 8px between.

---

# 6. Glass-Morphism

| Property | Light Mode | Dark Mode |
|----------|-----------|-----------|
| backdrop-filter | blur(24px) saturate(1.1) | blur(20px) saturate(1.1) |
| background | rgba(250,248,245, 0.65) | rgba(26,24,50, 0.50) |
| border | 0.5px solid rgba(255,255,255, 0.25) | 0.5px solid rgba(255,255,255, 0.12) |
| border-radius | 20px | 20px |
| box-shadow | 0 4px 16px rgba(26,31,46, 0.06) | 0 4px 16px rgba(18,16,30, 0.20) |
| Hover bg opacity | 80% | 65% |

**Blur by context:** Cards 24px · Modals 28px · Overlays 32px · Subtle 20px

**USE for:** Dashboard summaries, floating nav, modal overlays, morning briefing, quick metrics
**DON'T use for:** Data entry forms, long-form text, charts, alerts, Focus Mode (always opaque)

```css
@supports not (backdrop-filter: blur(1px)) {
  .glass { background: rgba(250,248,245, 0.92); border: 1px solid rgba(126,200,200, 0.15); }
}
[data-density="focus"] .glass { backdrop-filter: none; background: var(--color-warm-sand); border: 1px solid var(--color-mist); }
```

---

# 7. Motion & Animation

## 7.1 Easing Curves

| Token | Value | Use |
|-------|-------|-----|
| --ease-default | cubic-bezier(0.4, 0, 0.2, 1) | Standard |
| --ease-out | cubic-bezier(0.0, 0, 0.2, 1) | Decelerating |
| --ease-in | cubic-bezier(0.4, 0, 1, 1) | Accelerating |
| --ease-spring | cubic-bezier(0.34, 1.56, 0.64, 1) | Slight overshoot |
| --ease-water | cubic-bezier(0.25, 0.1, 0.25, 1.0) | Organic, natural (primary) |
| --ease-wave | cubic-bezier(0.45, 0.05, 0.55, 0.95) | Oscillating, perpetual |
| --ease-dive | cubic-bezier(0.4, 0, 0.2, 1) | Going deeper |
| --ease-surface | cubic-bezier(0.0, 0, 0.2, 1) | Coming back up |

## 7.2 Duration Scale

| Token | Value | Use |
|-------|-------|-----|
| --duration-instant | 100ms | Button press, micro-feedback |
| --duration-fast | 150ms | Micro-interactions |
| --duration-normal | 200ms | State changes |
| --duration-moderate | 250ms | Panel reveals |
| --duration-slow | 300ms | Page transitions |
| --duration-gentle | 400ms | Completion animations |
| --duration-ripple | 300ms | Hover ripple |
| --duration-wave | 800ms | Wave/loading cycle |
| --duration-tide | 1200ms | Full tide cycle (loading) |
| --duration-current | 250ms | Page transitions (ocean) |

## 7.3 Named Interactions

| Interaction | Trigger | Duration | Key Behavior |
|-------------|---------|----------|-------------|
| Ripple | Card/button hover | 300ms ease-water | Radial gradient from cursor, Ocean Foam 30% opacity. Max 12% |
| Depth Dive | Scroll down | Continuous | Depth Bar gradient shifts, section bg warms/cools |
| Current | Page navigation | 250ms | Forward: content shifts left+down (dive). Back: right+up (surface) |
| Tide | Data loading | 1200ms loop | Wave oscillation or ocean shimmer skeleton |
| Swell | Pull-to-refresh | Gesture-driven | Wave builds proportional to pull, crests at threshold |
| Bubble | Notification | 400ms ease-water | 8px circle rises from bottom, expands into card |

## 7.4 Reduce Motion

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

Fallbacks: Ripple→instant color change · Dive→static · Current→instant swap · Tide→static bar · Swell→standard indicator · Bubble→instant appear

---

# 8. Navigation Components

## 8.1 Header / Nav Bar

```
Height:      68px desktop (incl 4px Depth Bar), 60px tablet, 52px mobile
Depth Bar:   4px flush top, full width, z-101
Background:  Warm Sand, 1px Mist bottom border. Scrolled: +shadow 0 1px 3px rgba(26,31,46,0.06)
Nav font:    Footnote (13px, Regular), 32px gap between items
States:      Default=Charcoal | Hover=Deep Navy + 2px Ocean Foam underline | Active=Deep Navy + 2px Teal underline
Dark:        Abyss Canvas bg, Warm off-white text, #4BBFBF active underline
A11y:        <nav aria-label="Main navigation">, aria-current="page", skip link first
Max items:   6 nav items. No dropdown menus from header.
```

## 8.2 Tab Bar (Mobile)

```
Height:      83px (49px content + 34px safe area)
Background:  Warm Sand, 1px Mist top border
Icons:       24px. Default=Silver, Active=Ocean Surface (#3B8C8C)
Labels:      Caption 11px. Default=Silver, Active=Deep Navy
Max tabs:    5. Min: 3. Equal width distribution.
Dark:        Abyss Canvas, default rgba(255,255,255,0.4), active #4BBFBF
A11y:        role="tablist", aria-selected on active. Haptic: light impact on tap.
```

## 8.3 Sidebar

```
Width:       240px fixed (or 3 columns), collapsible
Item:        40px height, Callout 15px, space-3 vertical / space-4 horizontal padding
Active:      3px Ocean Surface left border, Deep Navy Medium text, Ocean Foam 10% bg
Hover:       Deep Navy text, Ocean Foam 30% bg
Dark:        Abyss Canvas bg, white text, #4BBFBF left border active
```

## 8.4 Breadcrumbs

```
Font: Footnote 13px. Separator: " / " with 4px padding. Current: Medium 500, Charcoal.
Links: Clarity Blue, underline on hover. Max 5 items (collapse middle to "...").
```

---

# 9. Input Components

## 9.1 Buttons

| Variant | Background | Text | Border | Radius |
|---------|-----------|------|--------|--------|
| Primary | Resonance Teal #3B8C8C | White | None | 12px |
| Secondary | Transparent | Deep Navy | 1.5px Mist | 12px |
| Tertiary | Transparent | Resonance Teal | None | 8px |
| Destructive | Transparent | Ember #C75C3A | 1.5px Ember 40% | 12px |
| Icon-Only | Transparent | Charcoal icon 20px | None | 8px, 40×40px |
| Link | Transparent | Clarity Blue #5B7FBF | None | — |

**Hover states:** Primary→#347D7D + ocean shimmer 5%. Secondary→Ocean Shallow border 40% + Foam 8% bg. Tertiary→Foam 15% bg. Destructive→#FEF2F2 bg + Ember 70% border. Icon→Foam 20% bg. Link→underline.
**Active:** scale(0.98) on all except Icon (0.95). **Focus:** 2px Resonance Teal outline, 2px offset (all).
**Disabled:** Silver bg/text, aria-disabled="true".

| Size | Height | Padding (H) | Font | Min Width |
|------|--------|-------------|------|-----------|
| Large | 48px | 24px | Body 17px | 120px |
| Medium | 40px | 16px | Callout 15px | 96px |
| Small | 32px | 12px | Footnote 13px | 72px |

**Dark:** Primary→#4BBFBF bg, Deep Navy text. Secondary→white text, rgba border. All accents use dark variants.
**A11y:** Min touch 44×44px. Icon-only requires aria-label. Sentence case. One Primary per viewport.

## 9.2 Text Fields

```
Default:   1.5px Mist border, White bg, 10px radius
Focused:   2px Teal border, shadow 0 0 0 3px Teal 12%
Error:     2px Error fg border + message below
Height:    48px (L), 40px (M default), 32px (S)
Font:      Body 17px (never smaller — prevents iOS zoom). Label: Body 17px, 4px margin-bottom
Dark:      Abyss Card bg, rgba(255,255,255,0.10) border, #4BBFBF focus
A11y:      Always visible labels (no placeholder-only). aria-required, aria-invalid, aria-describedby
```

## 9.3 Dropdown / Select

```
Trigger: same as Text Field. Panel: White bg, 1px Mist border, 12px radius, shadow-lg
Option: 40px height, 12px padding, Callout 15px. Hover: Ocean Foam 30%. Selected: Teal checkmark.
Max 6 visible before scroll. Animation: scale(0.95)+fade, 200ms ease-water.
Dark: Abyss Elevated panel, rgba border/shadow, #4BBFBF checkmark.
A11y: Native <select> on mobile. Arrow keys navigate, Enter selects, Escape closes.
```

## 9.4 Toggle Switch

```
Track: 48×28px, 14px radius. Thumb: 24×24px, 12px radius, 2px offset.
Off: Silver track, White thumb. On: Teal track, White thumb.
Transition: 200ms ease-water. Dark: rgba track, #4BBFBF on.
A11y: role="switch", aria-checked, Space toggles.
```

## 9.5 Checkbox

```
Box: 20×20px, 6px radius, 1.5px Mist border. Checked: Teal bg, white checkmark (14px, 2px stroke).
Hover: Ocean Shallow 60% border. Indeterminate: Teal bg, white dash.
Group spacing: 12px. Touch target: 44×44px. Transition: 150ms ease-water.
```

## 9.6 Radio Button

```
Outer: 20×20px circle, 1.5px Mist border. Selected: Teal border + 8px Teal inner dot.
Group spacing: 12px. Touch target: 44×44px.
A11y: <fieldset>+<legend>, native radios, arrow keys navigate.
```

## 9.7 Slider

```
Track: 4px, 2px radius, Mist. Fill: ocean gradient (Foam→Surface). Thumb: 24×24px circle, 2px Teal border.
Hover: thumb scale 1.15 + 6px Teal 12% glow. Active: scale 1.25. Touch target: 44×44px.
```

---

# 10. Feedback Components

## 10.1 Alert / Banner

```
Variants: Info | Success | Warning | Error | Brand (Ocean Foam 20% + Ocean Surface border)
Structure: 3px semantic left border, 10px radius, 16px padding all sides
Icon: 20px, 12px gap to text. Font: Callout 15px. Dismiss: 32×32px icon button, right-aligned.
Animation: Slide down + fade, 250ms ease-water.
A11y: role="alert" (error/warning), role="status" (info/success). Escape closes if dismissible.
```

## 10.2 Toast / Snackbar

```
Position:   Bottom-center desktop (min 320px, max 560px), bottom full-width mobile
Background: Deep Navy. Text: #F1F2F4, Callout 15px. Action: #4BBFBF text.
Radius: 12px. Shadow: shadow-lg. Z-index: 1000.
Duration:   5000ms auto-dismiss, pause on hover. Max 3 stacked (8px gap).
Animation:  Bubble — 8px circle rises from bottom, expands, 400ms. Dismiss: fade+drop 200ms.
Dark:       Abyss Overlay bg, rgba border.
```

## 10.3 Modal / Dialog

```
Variants:   Standard (White bg, 16px radius) | Glass (blur 24px, Warm Sand 70%, 20px radius)
Sizes:      480px (S) | 640px (M default) | 800px (L). Max height: 85vh.
Padding:    24px all sides. Title: Title 2 (22px Medium). Divider: 1px Mist.
Overlay:    Deep Navy 40%. Z-index: 1100.
Animation:  Open: scale(0.95→1)+fade, 250ms ease-water. Close: reverse, 200ms ease-dive.
Dark:       Standard=Abyss Elevated. Glass=Abyss Card 70%. Overlay=#12101E 60%.
A11y:       role="dialog" aria-modal="true". Focus trap. Escape closes. Focus returns to trigger.
```

## 10.4 Progress Indicators

```
Linear: 4px height (8px large), Mist track, ocean gradient fill. Radius: 2px/4px.
Spinner: 16px (inline), 24px (button), 40px (page). Teal stroke, 800ms rotation.
Tide Loader: 64×24px wave, ocean gradient, 1200ms ease-wave loop. Reduce motion: static bar.
```

## 10.5 Skeleton Screen

```
Background: Cloud. Shimmer: Ocean gradient (Foam 8%, Shallow 5%, transparent), 1.5s ease-wave loop.
Radius: Text=6px, Avatars=50%, Cards=16px, Images=12px.
Text skeleton: 14px height, widths 100%/80%/60%, 8px gap.
Dark: Abyss Card bg, 6% opacity shimmer. A11y: aria-busy="true", aria-label="Loading content".
```

## 10.6 Loading Duration Thresholds

```
< 300ms:    No indicator (perceived instant)
300ms-2s:   Spinner (inline or button-level)
2s-10s:     Skeleton screen with ocean shimmer
> 10s:      Tide Loader with progress description ("Analyzing..." → "Almost there...")
```

---

# 11. Data Display Components

## 11.1 Card System v2.0

| Variant | Background | Border | Radius | Shadow | Hover | Use |
|---------|-----------|--------|--------|--------|-------|-----|
| Shore | White | 1px Mist | 16px | shadow-xs | Foam 30% bg + Shallow 40% border + translateY(-2px) + 2px gradient accent | Default card |
| Depth | gradient(180°, Deep→Twilight) | 1px rgba white 8% | 16px | shadow-depth | Gradient shift + Shallow 20% border | AI insights, deep content |
| Glass | blur(24px) Warm Sand 65% | 0.5px rgba white 25% | 20px | shadow-md | Opacity to 80% + Shallow 30% border | Dashboard summaries |
| Sand | Warm Sand | None | 16px | shadow-xs | shadow-sm + translateY(-1px) | Editorial, emotional content |

**Shared:** Padding=space-5 (24px). Compact modifier: 12px padding, Title 3, Callout body. Min 280px (200px compact).
**Anatomy:** Overline (13px Bold UPPER, Sage Deep) → Title (Title 2/3) → Body (Body/Callout) → Actions (16px top pad, 1px divider)
**Sand Card:** 3px Dusk Rose left accent. Uses Spectral italic for titles.
**Dark:** Shore→Abyss Card. Depth→Twilight→Abyss gradient. Glass→Abyss Card 60%. Sand→Abyss Card + dark Dusk Rose accent.

## 11.2 Table

```
Header:  Cloud bg, Footnote Medium 13px, 12px/16px padding, 1px Mist bottom
Row:     White (odd) / Warm Sand (even), Callout 15px, hover Ocean Foam 15%
Selected: Foam 10% + 3px Ocean Surface left border. Mobile: stacked card layout <768px
Dark:    Abyss Card header, Canvas/Card alternating rows, rgba borders, rgba(75,191,191,0.06) hover
```

## 11.3 List

```
Variants:  Simple (48px) | Rich (64px) | Navigational | Actionable (auto height)
Padding:   16px horizontal. Divider: 1px Mist (not after last).
Hover:     Ocean Foam 15%. Selected: Foam 10% + 3px Ocean Surface left border.
Dark:      rgba dividers, rgba(75,191,191,0.06) hover, #4BBFBF selected border.
```

## 11.4 Stat / Metric

```
Label:   Subheadline (13px Bold UPPER, Slate). Value: Headline (40px desktop, 28px mobile), Inter Light 300, tnum.
Trend:   Footnote 13px, Success/Error color + arrow icon. Container: Shore or Glass Card.
```

## 11.5 Chart Container

```
Container: Shore Card, 24px padding. Title: Title 3 18px. Legend: Footnote 13px + 8px colored dot.
Color sequence: Ocean Surface → Mid → Deep → Shallow → Twilight → Dusk Rose → Sunlit Amber
Area fills: Ocean gradient 15-25% opacity. Axis: Caption 11px Slate. Grid: 1px dashed Mist 50%.
Tooltip: Deep Navy bg, White text, Callout 15px, 8px radius.
A11y: role="img" + aria-label. Provide hidden data table. Color + pattern for series.
```

---

# 12. Media Components

## 12.1 Image Container

```
Radius: 12px. Ratios: 16:9 | 3:2 | 1:1 | 4:5. Object-fit: cover. Loading bg: Cloud.
Loading: ocean shimmer → blur-up → full. Error: Cloud bg + broken-image icon (Slate 32px).
A11y: alt text required. Decorative: alt="" role="presentation". Lazy load below-fold.
```

## 12.2 Avatar

| Size | Dimensions | Font | Use |
|------|-----------|------|-----|
| XS | 24×24 | Caption 11px | Inline mentions |
| SM | 32×32 | Footnote 13px | Comment threads |
| MD | 40×40 | Callout 15px | List items, nav |
| LG | 56×56 | Body 17px | Profile cards |
| XL | 80×80 | Title 3 18px | Profile headers |
| 2XL | 120×120 | Title 1 28px | Settings, profiles |

Circle shape. 2px White border on colored bg. Initials bg from ocean+brand palette hash. Status dot: 10px (LG+), 8px (MD-), bottom-right.

---

# 13. Page Templates (Condensed)

## 13.1 Dashboard

```
Depth Bar → Header ("Good morning, [Name]", Inter Light 28px)
Score Row: 3 Glass Cards, horizontal scroll mobile
Main: 7/5 asymmetric split. Left=Depth Card (AI insight). Right=Shore Card (sessions list).
Full-width Shore Card: Weekly trend area chart. Mobile: all stacks vertically.
Card gap: 24px. Content padding: 32px.
```

## 13.2 Settings

```
Sidebar (240px) + Content (max 680px centered). Setting rows: label+description left, control right.
Row padding: 16px vertical. Divider: 1px Mist. Section gap: 48px. Mobile: sidebar→back-nav stack.
```

## 13.3 Empty States

```
Illustration: 64-120px Ocean Surface line art. Title: Title 2 Deep Navy.
Body: max 2 lines, Slate, encouraging tone ("No data yet" not "Sorry, nothing here").
Action: Primary button to resolve the empty state. Never leave a section completely blank.
```

---

# 14. Accessibility Checklist

```
FOCUS:      2px solid Resonance Teal, 2px offset on ALL interactive elements
TOUCH:      Minimum 44×44px (48×48px recommended), 8px between adjacent targets
KEYBOARD:   All functionality keyboard-accessible. Tab order = visual order. No keyboard traps.
ARIA:       aria-current="page" on active nav. aria-expanded on collapsibles. aria-busy on loading.
            role="dialog" aria-modal="true" on modals. Focus trap in modals/drawers.
MOTION:     Respect prefers-reduced-motion. Provide app-level toggle. No autoplay.
COLOR:      Never use color alone for meaning. Always pair with text/icons/patterns.
HEADINGS:   H1→H2→H3, never skip levels. Semantic HTML, no div-soup.
LANDMARKS:  header, nav, main, aside, footer. Skip nav link as first element.
CONTRAST:   Body text 7:1 (AAA target). Large text 4.5:1. UI components 3:1.
```

---

# 15. Do's and Don'ts

| # | DO | DON'T |
|---|-----|-------|
| 1 | Generous whitespace (24px min between blocks, 48px between sections) | Fill every pixel with content |
| 2 | 50/20/10/10/10 color ratio. One accent per context. | Multiple accent colors on one screen |
| 3 | Clear type hierarchy: Display→Headline→Title→Body | Bold text liberally for emphasis |
| 4 | One Primary button per viewport | Two Primary buttons side by side |
| 5 | Error messages that explain AND resolve | Generic "Error 422" messages |
| 6 | Animation for feedback and relationships (water-inspired) | Decorative animations (if noticed, too much) |
| 7 | A11y from start: focus, ARIA, keyboard for every component | Color alone to communicate meaning |
| 8 | One idea per section, one action per moment | Overload screens with options |
| 9 | Established components for established patterns | Custom one-off components |
| 10 | Abyss dark mode: purple-navy surfaces, warm off-white | Simply swap fg/bg colors |
| 11 | Ocean gradient as stripe/system (interaction, data, Depth Bar) | Gradient as background wash/wallpaper |
| 12 | Glass for summaries/dashboards. Opaque for forms/data/alerts. | Glass on data entry, charts, Focus Mode |
| 13 | Progress through data insight trends | Streaks, points, badges, leaderboards |

---

# 16. CSS Variables

```css
:root {
  /* Colors — Primary */
  --color-deep-navy: #1A1F2E;
  --color-warm-sand: #FAF8F5;
  --color-sage-mist: #8FA89A;
  --color-sage-deep: #6B8F7A;
  --color-resonance-teal: #3B8C8C;
  --color-storm-blue: #4A5E78;
  --color-dusk-rose: #C4A08A;

  /* Colors — Secondary */
  --color-twilight-lavender: #9B8EB0;
  --color-sunlit-amber: #D4A952;
  --color-ember: #C75C3A;
  --color-clarity-blue: #5B7FBF;

  /* Colors — Ocean */
  --color-ocean-foam: #D4EDE4;
  --color-ocean-shallow: #7EC8C8;
  --color-ocean-surface: #3B8C8C;
  --color-ocean-mid: #2B6E8A;
  --color-ocean-deep: #1E4D7A;
  --color-ocean-twilight: #1E3364;
  --color-ocean-abyss: #2A1B4E;
  --color-ocean-trench: #1A1232;

  /* Colors — Neutral */
  --color-charcoal: #2D3142;
  --color-slate: #525868;
  --color-silver: #9CA3AF;
  --color-mist: #E5E7EB;
  --color-cloud: #F3F4F6;

  /* Gradients */
  --gradient-depth-full: linear-gradient(90deg, #D4EDE4 0%, #7EC8C8 20%, #3B8C8C 40%, #2B6E8A 55%, #1E4D7A 70%, #1E3364 85%, #2A1B4E 100%);
  --gradient-depth-surface: linear-gradient(90deg, #D4EDE4 0%, #7EC8C8 40%, #3B8C8C 100%);
  --gradient-depth-deep: linear-gradient(90deg, #3B8C8C 0%, #1E4D7A 50%, #2A1B4E 100%);
  --gradient-depth-abyss: linear-gradient(90deg, #1E4D7A 0%, #1E3364 40%, #2A1B4E 70%, #1A1232 100%);
  --gradient-ripple: radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(126,200,200,0.12) 0%, rgba(59,140,140,0.04) 40%, transparent 70%);
  --gradient-score-arc: conic-gradient(from 225deg, #D4EDE4, #7EC8C8, #3B8C8C, #1E4D7A);
  --gradient-chart-fill: linear-gradient(180deg, rgba(59,140,140,0.20) 0%, rgba(30,77,122,0.05) 100%);

  /* Glass-Morphism */
  --glass-blur: 24px;
  --glass-saturate: 1.1;
  --glass-bg-opacity: 0.65;
  --glass-border: 0.5px solid rgba(255,255,255,0.25);
  --glass-radius: 20px;

  /* Typography */
  --font-brand: 'Neue Haas Grotesk Display Pro', 'Helvetica Neue', Helvetica, Arial, system-ui, sans-serif;
  --font-editorial: 'Spectral', Georgia, 'Times New Roman', serif;
  --font-product: 'Inter Variable', 'Inter', system-ui, -apple-system, sans-serif;

  /* Spacing */
  --space-1: 4px;   --space-2: 8px;   --space-3: 12px;  --space-4: 16px;
  --space-5: 24px;  --space-6: 32px;  --space-7: 48px;  --space-8: 64px;
  --space-9: 96px;  --space-10: 128px;

  /* Border Radius */
  --radius-xs: 4px;   --radius-sm: 6px;   --radius-md: 8px;   --radius-lg: 10px;
  --radius-xl: 12px;  --radius-2xl: 16px; --radius-3xl: 20px; --radius-full: 9999px;

  /* Shadows */
  --shadow-xs: 0 1px 2px rgba(26,31,46,0.04);
  --shadow-sm: 0 1px 3px rgba(26,31,46,0.06);
  --shadow-md: 0 4px 12px rgba(26,31,46,0.08);
  --shadow-lg: 0 8px 24px rgba(26,31,46,0.08), 0 2px 8px rgba(26,31,46,0.04);
  --shadow-xl: 0 24px 48px rgba(26,31,46,0.12), 0 8px 16px rgba(26,31,46,0.06);
  --shadow-ocean: 0 4px 16px rgba(59,140,140,0.10);
  --shadow-depth: 0 4px 24px rgba(30,77,122,0.25);
  --shadow-glow: 0 1px 8px rgba(126,200,200,0.15);

  /* Animation */
  --ease-water: cubic-bezier(0.25, 0.1, 0.25, 1.0);
  --ease-wave: cubic-bezier(0.45, 0.05, 0.55, 0.95);
  --ease-dive: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-surface: cubic-bezier(0.0, 0, 0.2, 1);
  --ease-default: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);

  --duration-instant: 100ms;  --duration-fast: 150ms;    --duration-normal: 200ms;
  --duration-moderate: 250ms; --duration-slow: 300ms;    --duration-gentle: 400ms;
  --duration-ripple: 300ms;   --duration-wave: 800ms;    --duration-tide: 1200ms;
  --duration-current: 250ms;

  /* Z-Index */
  --z-header: 100;    --z-depth-bar: 101;  --z-dropdown: 200;  --z-sticky: 300;
  --z-overlay: 900;   --z-toast: 1000;     --z-modal: 1100;    --z-tooltip: 1200;
}

/* Dark Mode: "The Abyss" */
@media (prefers-color-scheme: dark) {
  :root {
    --color-surface-canvas: #12101E;
    --color-surface-card: #1A1832;
    --color-surface-elevated: #232040;
    --color-surface-overlay: #2D294E;

    --color-text-primary: #F0EDE8;
    --color-text-secondary: #9B97A0;
    --color-text-tertiary: #6B6672;
    --color-text-disabled: #4B4656;

    --color-ocean-foam: #A8E4D4;     --color-ocean-shallow: #8AD4D4;
    --color-ocean-surface: #4BBFBF;  --color-ocean-deep: #5B9BD5;
    --color-ocean-twilight: #7B8FD4; --color-ocean-abyss: #9B7BD4;

    --color-sage-mist: #A3C4B2;         --color-resonance-teal: #4BBFBF;
    --color-storm-blue: #7B9AC2;        --color-dusk-rose: #D4B8A4;
    --color-ember: #E07A5C;             --color-clarity-blue: #7FA3E0;
    --color-sunlit-amber: #E4C070;      --color-twilight-lavender: #B5A8CC;
  }
}
```

---

# 17. Component Index

```
NAVIGATION (4): Header/Nav Bar, Tab Bar, Sidebar, Breadcrumbs
INPUT (7):      Button (6 variants), Text Field (5 variants), Dropdown, Toggle, Checkbox, Radio, Slider
FEEDBACK (5):   Alert/Banner, Toast, Modal (Standard+Glass), Progress (Linear+Circular+Tide), Skeleton
DATA (10):      Card (Shore/Depth/Glass/Sand+Compact), Depth Bar, Table, List (4 variants),
                Stat/Metric, Chart Container, Score Arc*, Sparkline*, Data Card*, AI Insight Card*
MEDIA (3):      Image Container, Video Player*, Avatar (Image/Initials/Icon)

* Health/premium components — specs in full archive only
```

---

*Quick Reference condensed from Kaivoo Design System v2.0 (4553 lines → ~1050 lines)*
*For full prose, rationale, user flows, AI patterns, neuro-inclusive design, and migration guide → see full archive*
