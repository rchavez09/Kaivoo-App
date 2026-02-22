# Kaivoo Design System
## Human Interface Guidelines · Version 2.0

**Published:** February 2026
**Classification:** Internal · Design & Engineering
**Maintained by:** Kaivoo Design Systems Team
**Builds on:** Design System v1.0, Brand Identity v1.1, Brand Evolution v2.0 Strategy

---

> *"Calm is a technology."*
> Every pixel, every interaction, every transition should lower cognitive load first, then build confidence over time.

> *"Depth, not noise."*
> Every design decision asks: does this add depth or noise? The ocean metaphor is not decoration — it is a system.

---

# Table of Contents

1. [Design Principles](#1-design-principles)
2. [Foundations](#2-foundations)
   - 2.1 Color System
   - 2.2 Gradient System
   - 2.3 Typography
   - 2.4 Layout Grid
   - 2.5 Spacing System
   - 2.6 Glass-Morphism System
   - 2.7 Motion & Animation System
3. [Components](#3-components)
   - 3.1 Navigation
   - 3.2 Input
   - 3.3 Feedback
   - 3.4 Data Display
   - 3.5 Media
4. [Patterns](#4-patterns)
   - 4.1 Page Templates
   - 4.2 User Flows
   - 4.3 Feedback Patterns
   - 4.4 Data Visualization Patterns
   - 4.5 AI & Voice Patterns
   - 4.6 Neuro-Inclusive Design
   - 4.7 Morning Briefing Pattern
5. [Design Tokens](#5-design-tokens)
6. [Documentation](#6-documentation)
   - 6.1 Do's and Don'ts
   - 6.2 Implementation Guide
   - 6.3 Accessibility Reference
7. [Appendix](#7-appendix)
   - 7.1 Component Checklist
   - 7.2 Migration Guide: v1.0 → v2.0

---
---

# 1. Design Principles

Three principles govern every design decision at Kaivoo. They are ordered by priority — when principles conflict, the higher-numbered principle yields to the lower.

---

## Principle 1: Quiet Confidence

**The interface should feel like a deep breath — not a notification.**

Design with restraint. Remove elements until the removal would cause harm. Every color, shadow, and animation must earn its place. Quiet confidence means the interface never shouts, never competes for attention, and never creates anxiety. It simply works — and in working, it communicates mastery.

**In practice:**
- Use a single accent color per screen to guide attention
- Prefer whitespace over dividers to separate content
- Animations are functional (providing feedback), never decorative
- Typography carries the hierarchy — not color, not size extremes

**Example:** A dashboard showing biometric data uses Deep Navy type on Warm Sand, with ocean-gradient-tinted Glass Cards for scores and a single Resonance Teal CTA. The Depth Bar at the top provides the full gradient once — then the data speaks. The design listens.

---

## Principle 2: Clarity Over Cleverness

**If a user has to think about the interface, we have failed.**

Every element must communicate its purpose instantly. Labels are plain language. Icons are universally understood. Navigation is predictable. We never sacrifice comprehension for aesthetics, and we never use design patterns that require learning. The most sophisticated design is the one that feels obvious.

**In practice:**
- Buttons say what they do: "Save changes" not "Submit"
- Form fields show their expected format before the user types
- Error messages explain what went wrong AND how to fix it
- Navigation follows platform conventions — innovation happens in content, not in wayfinding

**Example:** An error state on a form field turns the border to Ember, displays the message "This email is already registered. Sign in instead?" with "Sign in" as a tappable link. No error codes. No ambiguity. Resolution is one tap away.

---

## Principle 3: Warmth Through Craft

**Technology should feel like it was made by people who care.**

Precision and humanity are not opposites. The subtle warmth of Warm Sand over clinical white. The considered pause of a 300ms ease-out. The generous line-height that lets body text breathe. The ocean gradient that appears as a precise 4px stripe, not a decorative wash. These choices are invisible individually but collectively create the feeling that someone thought about every detail — because they did.

**In practice:**
- Background is Warm Sand (#FAF8F5), never pure white (#FFFFFF)
- Border radii are generous (12–16px) but never fully round on rectangles
- Micro-interactions use water-inspired easing curves, never linear
- Content has breathing room — minimum 24px between content blocks

**Example:** A Shore Card uses 24px padding, 16px border-radius, a 1px Mist border, and sits on a Warm Sand canvas. On hover, it lifts 2px and an Ocean Foam tint washes in from the cursor position — like touching the surface of still water. It feels alive without being busy.

---

## Design Guideline: Depth, Not Noise

**The ocean metaphor is a system, not a decoration.**

Every visual layer has purpose and every color shift communicates information. The gradient appears as a stripe, not a wash. Interactions feel like touching water, not splashing it. Data closer to the surface (today, recent, quick) uses lighter ocean tones. Data from the depths (long-term, analytical, AI-generated) uses deeper tones. This is not aesthetic preference — it is information architecture expressed through color.

**In practice:**
- The Depth Bar is the only full-spectrum gradient element per viewport
- Card variants communicate content depth: Shore for daily, Depth for insights
- Ocean colors in data visualization encode temporal depth — recent is shallow, historical is deep
- Dark mode is not "dark" — it is the ocean at night. Purple undertones, not grey

---
---

# 2. Foundations

---

## 2.1 Color System

### 2.1.1 Brand Palette — Primary

Seven colors form the foundation of all Kaivoo interfaces. Each has a defined role — never use a color outside its designated purpose without design system team approval.

---

#### Deep Navy

```
Role:           Primary brand color · Text · Headers · UI anchors
Hex:            #1A1F2E
RGB:            26, 31, 46
HSL:            225°, 28%, 14%
Accessibility:  WCAG AAA on Warm Sand (contrast 16.2:1)
                WCAG AAA on Cloud (contrast 14.8:1)
                WCAG AAA on White (contrast 17.1:1)
```

**Usage:** Page titles, body text, navigation labels, icon strokes, logo rendering. Deep Navy is the voice of the brand — authoritative without being aggressive. Use for any text that must be read.

**Do not use:** As a large-area background in light mode (reserve for dark mode and emphasis moments like title slides).

---

#### Warm Sand

```
Role:           Primary background · Canvas · Breathing space
Hex:            #FAF8F5
RGB:            250, 248, 245
HSL:            36°, 38%, 97%
Accessibility:  Provides AAA contrast with Deep Navy (16.2:1)
                Provides AAA contrast with Charcoal (14.1:1)
                Provides AA contrast with Storm Blue (4.8:1)
```

**Usage:** Page backgrounds, card canvas, modal backgrounds, any surface where content lives. Warm Sand replaces pure white throughout the system — it is warmer, softer, and tells the nervous system "this is a safe surface." In the ocean metaphor, Warm Sand is the shore — the welcoming starting point.

**Do not use:** For text on dark backgrounds. For that purpose, use #F0EDE8 (warm off-white) or #FFFFFF depending on context.

---

#### Sage Mist

```
Role:           Primary accent · Decorative highlights · Brand moments
Hex:            #8FA89A
RGB:            143, 168, 154
HSL:            146°, 12%, 61%
Accessibility:  Does NOT meet AA for text on Warm Sand (3.0:1) — use for
                decorative elements only, never body text
                Meets AA Large Text on Warm Sand (3.0:1 ≥ 3.0:1)
                Meets AA for text on Deep Navy (7.2:1)
```

**Usage:** Accent lines, section dividers, selected-state backgrounds (at 15% opacity), progress indicators, secondary icon color. Sage Mist is the brand's nature signature — it should appear on every screen but never dominate.

**Do not use:** As text color on light backgrounds (fails WCAG AA). As a button background with white text (insufficient contrast). For any text purpose on light surfaces, use Sage Deep instead.

---

#### Sage Deep

```
Role:           Text-accessible Sage variant · Labels on light backgrounds
Hex:            #6B8F7A
RGB:            107, 143, 122
HSL:            145°, 14%, 49%
Accessibility:  Meets AA on Warm Sand (4.5:1)
                Meets AA on Cloud (4.1:1)
                Meets AA on White (4.7:1)
```

**Usage:** Wherever Sage Mist was previously specified as text on light backgrounds. Overline labels in sage tone, AI badge text, section markers, secondary accent text. Sage Deep is the text-safe variant of the Sage family.

**Do not use:** As a decorative fill or accent line (use Sage Mist for those). As a primary text color (use Deep Navy).

---

#### Resonance Teal

```
Role:           Primary CTA · Active states · Success indicators
                Also: Ocean Surface (alias in Ocean Gradient System)
Hex:            #3B8C8C
RGB:            59, 140, 140
HSL:            180°, 41%, 39%
Accessibility:  Meets AA for white text on Teal background (4.6:1)
                Meets AAA for white text at bold/large sizes
                Meets AAA on Warm Sand for text (5.4:1)
```

**Usage:** Primary action buttons, active navigation indicators, toggle-on states, success checkmarks, links in body text. This is the "do something" color — it invites without urgency. In the Ocean Gradient System, Resonance Teal serves as the midpoint anchor — Ocean Surface.

**Do not use:** For more than one primary action per screen. If two buttons compete in Resonance Teal, the user cannot prioritize.

---

#### Storm Blue

```
Role:           Secondary UI · Data visualization · Supporting depth
Hex:            #4A5E78
RGB:            74, 94, 120
HSL:            214°, 24%, 38%
Accessibility:  Meets AAA on Warm Sand (5.9:1)
                Meets AAA on Cloud (5.4:1)
                Meets AA for white text on Storm Blue bg (4.5:1)
```

**Usage:** Secondary text emphasis, chart axes, data visualization secondary series, metadata labels, icon secondary color. Storm Blue provides weight without competing with Deep Navy.

**Do not use:** As primary text color (use Deep Navy). As a CTA color (use Resonance Teal).

---

#### Dusk Rose

```
Role:           Emotional warmth · Shore accent · Illustrative accent
Hex:            #C4A08A
RGB:            196, 160, 138
HSL:            23°, 33%, 65%
Accessibility:  Does NOT meet AA for text on Warm Sand (2.3:1) — decorative only
                Meets AA on Deep Navy for text (6.9:1)
```

**Usage:** Illustration accents, wellness-context highlights, Sand Card left-border accent, data visualization tertiary series, empty state illustrations, onboarding warmth moments. Dusk Rose connects to the body, to emotion, to the shore.

**Do not use:** As text on light backgrounds. As a status color (use semantic colors instead).

---

### 2.1.2 Brand Palette — Secondary & Accents

Four secondary colors provide range and flexibility. These appear in data visualization, illustration, and specialized contexts.

```
────────────────────────────────────────────────────────────────────────────
COLOR               HEX        ROLE                            ACCESSIBILITY
────────────────────────────────────────────────────────────────────────────
Twilight Lavender   #9B8EB0    Night mode, premium features    AA on Deep Navy
Sunlit Amber        #D4A952    Energy, morning, activation     AA on Deep Navy
Ember               #C75C3A    Alerts, urgent states           AA for white text
Clarity Blue        #5B7FBF    Links, informational            AA on Warm Sand
────────────────────────────────────────────────────────────────────────────
```

**Sand Accents:** In the ocean metaphor, Dusk Rose and Sunlit Amber serve double duty as "sand accents" — warm tones that represent the shore. Use them for editorial content, testimonials, somatic exercise cards, and any context where grounded warmth is needed.

---

### 2.1.3 Ocean Gradient System

The ocean gradient is Kaivoo's signature visual innovation — a spectrum of 8 colors that moves from the bright shore through open water to the deep abyss. Each token maps to a depth zone and an emotional register. This system is simultaneously natural (the literal ocean), technological (gradients are modern digital design), and meaningful (depth = information depth).

---

#### The Depth Spectrum

```
────────────────────────────────────────────────────────────────────────────────
TOKEN           HEX        RGB              ZONE           EMOTIONAL REGISTER
────────────────────────────────────────────────────────────────────────────────
ocean-foam      #D4EDE4    212, 237, 228    Shore          Light, welcoming, gentle
ocean-shallow   #7EC8C8    126, 200, 200    Shallows       Clear, bright, playful
ocean-surface   #3B8C8C    59, 140, 140     Open Water     Alive, active, confident
ocean-mid       #2B6E8A    43, 110, 138     Midwater       Focused, determined
ocean-deep      #1E4D7A    30, 77, 122      The Deep       Contemplative, authoritative
ocean-twilight  #1E3364    30, 51, 100      Twilight Zone  Premium, transitional
ocean-abyss     #2A1B4E    42, 27, 78       The Abyss      Immersive, profound
ocean-trench    #1A1232    26, 18, 50       The Trench     Deepest rest, night
────────────────────────────────────────────────────────────────────────────────
```

**Critical alias:** `ocean-surface` (#3B8C8C) IS `resonanceTeal` — they are the same value. Use `ocean-surface` when working within the gradient system or depth metaphor. Use `resonanceTeal` when referring to CTA/interactive role.

---

#### Ocean Token Detail

**Ocean Foam**
```
Hex:            #D4EDE4
RGB:            212, 237, 228
HSL:            158°, 38%, 88%
Accessibility:  Does NOT meet AA for text on Warm Sand (1.3:1) — tint only
                Contrast on Deep Navy: 13.1:1 (AAA)
Usage:          Card hover tints (at 30% opacity), progress bar fills,
                interactive background highlights, shallow data viz
```

**Ocean Shallow**
```
Hex:            #7EC8C8
RGB:            126, 200, 200
HSL:            180°, 38%, 64%
Accessibility:  Meets AA Large on Warm Sand (3.1:1)
                Meets AA on Deep Navy (7.4:1)
Usage:          Interactive borders on hover, secondary progress fills,
                recent-data visualization, sparkline gradients,
                focus ring glow (at 20% opacity)
```

**Ocean Surface** (= Resonance Teal)
```
Hex:            #3B8C8C
RGB:            59, 140, 140
HSL:            180°, 41%, 39%
Accessibility:  Meets AA for white text (4.6:1)
                Meets AAA on Warm Sand (5.4:1)
Usage:          Primary CTA, active states, chart primary series,
                midpoint of depth gradient, primary data stroke
```

**Ocean Mid**
```
Hex:            #2B6E8A
RGB:            43, 110, 138
HSL:            198°, 52%, 35%
Accessibility:  Meets AA for white text (5.2:1)
                Meets AAA on Warm Sand (6.3:1)
Usage:          Chart secondary series, active navigation states,
                mid-depth data visualization, section accent
```

**Ocean Deep**
```
Hex:            #1E4D7A
RGB:            30, 77, 122
HSL:            209°, 61%, 30%
Accessibility:  Meets AAA for white text (7.8:1)
                Meets AAA on Warm Sand (9.4:1)
Usage:          Depth Card backgrounds, long-term data visualization,
                deep-analysis headlines, trend headers
```

**Ocean Twilight**
```
Hex:            #1E3364
RGB:            30, 51, 100
HSL:            222°, 54%, 25%
Accessibility:  Meets AAA for white text (10.2:1)
                Meets AAA on Warm Sand (11.8:1)
Usage:          Premium feature indicators, transition-to-night accents,
                Depth Card gradient endpoint, dark section backgrounds
```

**Ocean Abyss**
```
Hex:            #2A1B4E
RGB:            42, 27, 78
HSL:            258°, 49%, 21%
Accessibility:  Meets AAA for white text (12.5:1)
                Meets AAA on Warm Sand (13.8:1)
Usage:          Dark mode primary accent, premium feature highlights,
                night meditation mode, deepest insight cards
```

**Ocean Trench**
```
Hex:            #1A1232
RGB:            26, 18, 50
HSL:            255°, 47%, 13%
Accessibility:  Meets AAA for white text (15.1:1)
Usage:          Dark mode canvas alternative, deepest UI layer,
                used sparingly for maximum depth contrast
```

---

#### Ocean Framework — Mapping Depth to UI

| Ocean Zone | Depth | Kaivoo Expression | Emotional Register |
|------------|-------|-------------------|-------------------|
| **Shore** | Surface | Onboarding, first impressions, playful moments | Light, welcoming, warm sand |
| **Shallows** | 0–20m | Daily dashboard, morning briefing, quick check-ins | Clear, bright, ocean green to light blue |
| **Open Water** | 20–200m | Active sessions, breathing exercises, real-time biometrics | Vibrant teal, alive |
| **The Deep** | 200–1000m | Deep insights, long-term trends, AI analysis | Deep blue, contemplative, authoritative |
| **The Abyss** | 1000m+ | Premium features, night mode, profound rest | Deep purple to navy, immersive |

---

### 2.1.4 Semantic Colors — UI States

Semantic colors communicate system states. They override brand palette when conveying feedback.

---

#### Success

```
Light Mode                          Dark Mode
Foreground:  #1B7A4E                Foreground:  #4ADE80
Background:  #ECFDF5                Background:  #052E16
Border:      #86EFAC                Border:      #166534
Icon:        #1B7A4E                Icon:        #4ADE80
Contrast:    7.1:1 (fg on bg)       Contrast:    8.3:1 (fg on bg)
```

**Usage:** Confirmation messages, completed states, successful form submissions, positive data trends.

---

#### Warning

```
Light Mode                          Dark Mode
Foreground:  #92400E                Foreground:  #FCD34D
Background:  #FFFBEB                Background:  #451A03
Border:      #FDE68A                Border:      #78350F
Icon:        #92400E                Icon:        #FCD34D
Contrast:    7.5:1 (fg on bg)       Contrast:    9.1:1 (fg on bg)
```

**Usage:** Non-critical alerts, approaching limits, actions with consequences that are reversible.

---

#### Error

```
Light Mode                          Dark Mode
Foreground:  #991B1B                Foreground:  #FCA5A5
Background:  #FEF2F2                Background:  #450A0A
Border:      #FECACA                Border:      #7F1D1D
Icon:        #991B1B                Icon:        #FCA5A5
Contrast:    7.8:1 (fg on bg)       Contrast:    8.6:1 (fg on bg)
```

**Usage:** Validation errors, failed operations, destructive action warnings, critical system alerts. In a brand built on calm, error states must communicate importance without triggering alarm — use Ember (#C75C3A) for brand-consistent urgent states, reserve pure red for system-level errors only.

---

#### Info

```
Light Mode                          Dark Mode
Foreground:  #1E40AF                Foreground:  #93C5FD
Background:  #EFF6FF                Background:  #172554
Border:      #BFDBFE                Border:      #1E3A5F
Icon:        #1E40AF                Icon:        #93C5FD
Contrast:    8.2:1 (fg on bg)       Contrast:    8.9:1 (fg on bg)
```

**Usage:** Informational callouts, tips, feature education, contextual help. Info states should feel like a knowledgeable friend sharing insight — never like a system notification.

---

### 2.1.5 Semantic Health Colors

Health-specific semantic colors for biometric data, wellness contexts, and clinical indicators. These override brand palette in health data contexts — accuracy and clarity take absolute priority over aesthetics.

```
────────────────────────────────────────────────────────────────────────────────
STATE                  LIGHT MODE     DARK MODE      USAGE
────────────────────────────────────────────────────────────────────────────────
Optimal / Normal       #2D8659        #34C759        Healthy range, goals met
Elevated / Caution     #C49A2A        #FFD60A        Approaching threshold
Alert / High           #C44B3A        #FF6961        Outside healthy range
Below / Low            #5A54B0        #7D7AFF        Below target range
Sleep                  #5A54B0        #7D7AFF        Sleep stage data
Activity               #C4862A        #FFB340        Movement, exercise data
Heart / Cardio         #C44B5E        #FF375F        Heart rate, HRV data
Mindfulness            #8A52B0        #BF5AF2        Meditation, calm scores
Nervous System         #3B8C8C        #4BBFBF        Vagal tone, regulation
────────────────────────────────────────────────────────────────────────────────
```

**Note:** The Nervous System color (#3B8C8C) is Resonance Teal / Ocean Surface — Kaivoo's core identity color. This is intentional: nervous system regulation is the brand's central purpose.

**Rule:** Semantic health colors are used in data visualization, metric displays, and clinical indicators ONLY. They do not replace the brand palette for UI chrome, navigation, or decorative elements.

---

### 2.1.6 Neutral Scale

```
Name         Hex        Light Mode Usage                Dark Mode Equivalent
─────────────────────────────────────────────────────────────────────────────
Charcoal     #2D3142    Body text, primary labels        #F1F2F4
Slate        #525868    Secondary text, metadata         #9CA3AF
Silver       #9CA3AF    Disabled states, placeholders    #6B7280
Mist         #E5E7EB    Borders, dividers                #2D3142
Cloud        #F3F4F6    Card backgrounds, containers     #1A1F2E
─────────────────────────────────────────────────────────────────────────────
```

All neutrals carry a 2–3% blue undertone to harmonize with Deep Navy.

---

### 2.1.7 Dark Mode: "The Abyss"

Dark mode in v2.0 is not an inversion and not merely "dim." It is the same ocean at night — a distinct, premium experience with deep purple-navy undertones that no competitor uses. Where v1.0 dark mode used neutral blue-grey surfaces, v2.0 uses "The Abyss" — surfaces with intentional purple undertones that feel cinematic and contemplative.

```
Surface Hierarchy — The Abyss:
─────────────────────────────────────────────────────────────────────
Layer 0 — Canvas:        #12101E    (18, 16, 30)    Deep purple-navy base
Layer 1 — Card:          #1A1832    (26, 24, 50)    +4% brightness, purple lift
Layer 2 — Elevated:      #232040    (35, 32, 64)    +8% brightness, floating
Layer 3 — Overlay:       #2D294E    (45, 41, 78)    +12% brightness, modals
─────────────────────────────────────────────────────────────────────

Text Hierarchy — The Abyss:
─────────────────────────────────────────────────────────────────────
Primary text:            #F0EDE8    (Warm off-white — never pure #FFF)
Secondary text:          #9CA3AF    (Silver)
Tertiary text:           #6B7280    (Muted)
Disabled text:           #4B5563    (Barely visible)
─────────────────────────────────────────────────────────────────────

Dark Mode Contrast Ratios (Primary Text #F0EDE8 on Abyss surfaces):
─────────────────────────────────────────────────────────────────────
On Canvas (#12101E):     14.9:1     AAA ✓
On Card (#1A1832):       12.1:1     AAA ✓
On Elevated (#232040):   10.0:1     AAA ✓
On Overlay (#2D294E):     8.4:1     AAA ✓
─────────────────────────────────────────────────────────────────────
```

**The purple undertone is the key differentiator:**
- Oura uses cold, neutral dark (#000000 base)
- Whoop uses aggressive dark with red accents
- Apple Health uses system grey dark mode
- **Kaivoo uses deep ocean dark** — purple undertones create contemplation, not just darkness

---

#### Ocean Accent Colors — Dark Mode (Brightened)

Ocean gradient tokens are brightened for dark mode to maintain vibrancy and meet contrast requirements on Abyss surfaces.

```
────────────────────────────────────────────────────────────────────────────
TOKEN                   LIGHT MODE     DARK MODE      BRIGHTNESS CHANGE
────────────────────────────────────────────────────────────────────────────
ocean-foam              #D4EDE4        #A8E4D4        +40% lighter
ocean-shallow           #7EC8C8        #8AD4D4        +35% lighter
ocean-surface           #3B8C8C        #4BBFBF        +20% lighter
ocean-mid               #2B6E8A        #5B9BD5        +30% lighter
ocean-deep              #1E4D7A        #5B9BD5        +30% lighter
ocean-twilight          #1E3364        #7B8FD4        +25% lighter
ocean-abyss             #2A1B4E        #9B7BD4        Purple highlight
────────────────────────────────────────────────────────────────────────────

Brand Colors — Dark Mode Adjustments:
────────────────────────────────────────────────────────────────────────────
Sage Mist:               #A3C4B2        (Lightened +15% for contrast)
Resonance Teal:          #4DB8B8        (Lightened +20% for vibrancy)
Storm Blue:              #7B9AC2        (Lightened +25%)
Dusk Rose:               #D4B8A4        (Lightened +10%)
Ember:                   #E07A5C        (Lightened +15%)
Clarity Blue:            #7FA3E0        (Lightened +18%)
Sunlit Amber:            #E4C070        (Lightened +12%)
Twilight Lavender:       #B5A8CC        (Lightened +12%)
────────────────────────────────────────────────────────────────────────────
```

---

### 2.1.8 Color Usage Rules

```
Rule 1 — The 50/20/10/10/10 Ratio (v2.0)
  50%  Deep Navy + Warm Sand (Foundation — text and canvas)
  20%  Ocean Gradient System (Visual signature — interactions, data viz, accents)
  10%  Sand Accents (Dusk Rose, Sunlit Amber — warmth and editorial)
  10%  CTA (Resonance Teal / Ocean Surface — interactive actions)
  10%  Remaining palette (Storm Blue, Lavender, semantic colors)

Rule 2 — One CTA Color Per Screen
  Only one element per viewport should use Resonance Teal as a
  filled background. All other actions are outlined or text-only.

Rule 3 — Semantic Colors Override Brand Colors
  System feedback (success, error, warning, info) always uses
  semantic colors, never brand palette approximations. Health data
  always uses semantic health colors.

Rule 4 — Dark Mode Is "The Abyss," Not Inverted Light Mode
  Never simply swap foreground/background. Use the Abyss surface
  hierarchy and brightened accent colors. The purple undertone is
  intentional — do not flatten to neutral grey.

Rule 5 — Never Place Sage Mist Text on Warm Sand
  This combination fails WCAG AA (3.0:1). Use Sage Deep (#6B8F7A)
  for any sage-toned text on light backgrounds.

Rule 6 — Opacity for Subtle Tints
  When using brand or ocean colors as background tints (hover states,
  selected rows), apply at 8–15% opacity over the surface color.
  Never use full-saturation ocean colors as large backgrounds in
  the product UI (Depth Cards excepted).

Rule 7 — Gradient Is a Stripe, Not a Wash
  The full ocean gradient appears ONLY as the Depth Bar (4px stripe)
  or thin accent lines. Never as a full-area background wash,
  decorative overlay, or text fill. The gradient earns attention
  through restraint.

Rule 8 — Ocean Depth Encodes Information Depth
  Recent/surface data uses shallow ocean tones (Foam, Shallow).
  Historical/deep data uses deep ocean tones (Deep, Twilight, Abyss).
  This mapping is semantic — not decorative.
```

---
---

## 2.2 Gradient System

The gradient system defines how ocean colors combine into continuous spectrums. Every gradient has a name, a CSS definition, a usage context, and strict rules about where it may and may not appear.

---

### 2.2.1 Named Gradients

Seven named gradients serve distinct purposes across the system.

---

#### The Depth Spectrum (Full)

```css
--gradient-depth-full: linear-gradient(
  90deg,
  #D4EDE4 0%,      /* Ocean Foam — Shore */
  #7EC8C8 20%,     /* Ocean Shallow */
  #3B8C8C 40%,     /* Ocean Surface */
  #2B6E8A 55%,     /* Ocean Mid */
  #1E4D7A 70%,     /* Ocean Deep */
  #1E3364 85%,     /* Ocean Twilight */
  #2A1B4E 100%     /* Ocean Abyss */
);
```

**Usage:** Depth Bar (primary use), marketing hero sections, presentation slides, brand collateral. This is the signature gradient — used sparingly and precisely.

**Direction:** Always left-to-right (90deg) in horizontal contexts. Shore is left, Abyss is right.

---

#### Surface Section

```css
--gradient-depth-surface: linear-gradient(
  90deg,
  #D4EDE4 0%,      /* Ocean Foam */
  #7EC8C8 40%,     /* Ocean Shallow */
  #3B8C8C 100%     /* Ocean Surface */
);
```

**Usage:** Dashboard section accents, light interactive states, Shore Card bottom accent on hover, shallow data visualization fills, area chart backgrounds for recent data.

---

#### Deep Section

```css
--gradient-depth-deep: linear-gradient(
  90deg,
  #3B8C8C 0%,      /* Ocean Surface */
  #1E4D7A 50%,     /* Ocean Deep */
  #2A1B4E 100%     /* Ocean Abyss */
);
```

**Usage:** Depth Card backgrounds, premium insights, long-term analysis sections, AI-generated content backgrounds.

---

#### Abyss Section

```css
--gradient-depth-abyss: linear-gradient(
  90deg,
  #1E4D7A 0%,      /* Ocean Deep */
  #1E3364 40%,     /* Ocean Twilight */
  #2A1B4E 70%,     /* Ocean Abyss */
  #1A1232 100%     /* Ocean Trench */
);
```

**Usage:** Dark mode accent sections, night mode premium features, meditation screens, deep sleep tracking.

---

#### Ripple Hover

```css
--gradient-ripple: radial-gradient(
  circle at var(--mouse-x, 50%) var(--mouse-y, 50%),
  rgba(126, 200, 200, 0.12) 0%,
  rgba(59, 140, 140, 0.04) 40%,
  transparent 70%
);
```

**Usage:** Card hover states, interactive button feedback. Creates "touching water" effect that emanates from cursor position. Maximum opacity: 12%.

---

#### Score Arc

```css
--gradient-score-arc: conic-gradient(
  from 225deg,
  #D4EDE4,         /* Ocean Foam — Low scores */
  #7EC8C8,         /* Ocean Shallow — Mid-low */
  #3B8C8C,         /* Ocean Surface — Mid */
  #1E4D7A          /* Ocean Deep — High scores */
);
```

**Usage:** Regulation Score arc visualization. Low scores = shallow (light), high scores = deep (dark blue). The arc represents depth attained.

---

#### Chart Fill

```css
--gradient-chart-fill: linear-gradient(
  180deg,
  rgba(59, 140, 140, 0.20) 0%,
  rgba(30, 77, 122, 0.05) 100%
);
```

**Usage:** Area chart backgrounds in data visualizations. Creates depth effect in temporal data — brighter at top, fading to deep at bottom.

---

### 2.2.2 Gradient Usage Rules

```
Rule 1 — Gradient as Stripe, Not Wash
  Correct: 4px Depth Bar, thin accent line, card bottom border
  Incorrect: Full-width background, decorative overlay, ambient fill
  Why: Stripe = deliberate, designed, technological.
       Wash = decorative, ambient, wellness-generic.

Rule 2 — Directional Consistency
  ────────────────────────────────────────────────────────────
  GRADIENT              DIRECTION           EXCEPTION
  ────────────────────────────────────────────────────────────
  Depth Bar             Left → Right (90°)  NEVER vertical
  Card bottom accent    Left → Right (90°)  —
  Area chart fill       Top → Bottom (180°) Vertical only
  Depth Card bg         Top → Bottom (180°) Vertical only
  Hover ripple          Radial from cursor  Center-based
  Score arc             Conic (225° start)  Circular only
  Section divider       Left → Right (90°)  —
  Marketing hero        Diagonal (135°)     Presentation only
  ────────────────────────────────────────────────────────────

Rule 3 — Opacity Constraints
  ────────────────────────────────────────────────────────────
  USE CASE              OPACITY RANGE       PURPOSE
  ────────────────────────────────────────────────────────────
  Hover effect          5–15%               Felt more than seen
  Chart fill            15–25%              Transparent over data
  Card tint             30–40%              Visible but not heavy
  Accent overlay        20–35%              Distinct but restrained
  Depth Bar             80–100%             Always near-opaque
  ────────────────────────────────────────────────────────────

Rule 4 — No Stacking Beyond Two Layers
  Never stack more than 2 gradients in the same element.
  Base surface (solid or subtle gradient) + interactive overlay = maximum.

Rule 5 — No Animated Gradients (Except Depth Bar Shimmer)
  Constant rotating/moving gradients are prohibited.
  Allowed: state transitions (300–400ms), scroll-driven position shifts,
  opacity changes during interactions.
  Only exception: Depth Bar shimmer on page load (800ms, once per session).
```

---

### 2.2.3 Depth Bar Specification

The Depth Bar is Kaivoo's signature visual element — a thin horizontal gradient stripe that appears on every page. It is the brand's equivalent of Stripe's gradient header or Linear's accent line.

```
Physical Specifications:
────────────────────────────────────────────────────────────
Property          Value                Notes
────────────────────────────────────────────────────────────
Height            4px (digital)        2mm (print)
Width             Full container       Edge-to-edge, no margins
Gradient          --gradient-depth-full Full spectrum
Direction         Left → Right (90°)   ALWAYS horizontal
Border-radius     0px                  Flush with container
────────────────────────────────────────────────────────────

Positioning:
────────────────────────────────────────────────────────────
Context           Position
────────────────────────────────────────────────────────────
Web               Below header navigation, above main content
Mobile App        Below status bar, above primary navigation
Print             Bottom edge or top edge of surface
Presentations     Below title area on content slides
Email             Header area, full width
────────────────────────────────────────────────────────────

Dark Mode Treatment:
────────────────────────────────────────────────────────────
Opacity:          80% (softened against dark canvas)
Glow:             box-shadow: 0 1px 8px rgba(126, 200, 200, 0.15)
Purpose:          Maintains vibrancy while respecting dark aesthetic
────────────────────────────────────────────────────────────

Animation (Optional):
────────────────────────────────────────────────────────────
Type:             Subtle left-to-right shimmer on page load
Duration:         800ms, once per session
Easing:           ease-out
Reduce motion:    Disabled entirely (static gradient)
────────────────────────────────────────────────────────────
```

**The Depth Bar NEVER:**
- Appears vertically (always horizontal)
- Gets thicker than 6px
- Uses opacity below 60%
- Appears more than once per viewport
- Competes with the logo for visual attention
- Is used as a decorative wash or background

---
---

## 2.3 Typography

### 2.3.1 Brand Layer: Neue Haas Grotesk Display Pro + Spectral

The brand layer typefaces appear in marketing, landing pages, editorial content, and brand-forward product surfaces. Neue Haas Grotesk is the workhorse; Spectral is for long-form reading.

```
Primary:
  Family:         Neue Haas Grotesk Display Pro
  Classification: Neo-grotesque sans-serif
  License:        Commercial (Monotype)
  Fallback:       Helvetica Neue, Helvetica, Arial, system-ui, sans-serif

Secondary:
  Family:         Spectral
  Classification: Transitional serif, screen-optimized
  License:        Open Source (Google Fonts)
  Fallback:       Georgia, "Times New Roman", serif
```

---

### 2.3.2 Product Layer: Inter Variable

The product layer typeface for all in-app UI. Inter Variable provides continuous weight axis (100–900), tabular numerals for data alignment, and medical-grade readability.

```
Family:           Inter Variable
Classification:   Geometric humanist sans-serif
License:          Open Source (SIL Open Font License)
Weights:          100–900 (continuous variable axis)
Fallback:         system-ui, -apple-system, sans-serif

OpenType Features:
  tnum:           Tabular numerals (ON for all data displays)
  zero:           Slashed zero (ON for data contexts)
  case:           Case-sensitive forms (ON for all-caps)
  calt:           Contextual alternates (ON by default)
```

**When to use which layer:**
- **Neue Haas Grotesk:** Landing pages, marketing, brand-forward hero sections, onboarding
- **Inter Variable:** Dashboard, settings, data display, session UI, any in-app interface
- **Spectral:** Articles, guides, help documentation, editorial long-form
- **Never mix all three on one screen.** A screen is either brand-layer or product-layer, with Spectral appearing only in dedicated reading contexts.

---

### 2.3.3 Type Scale — Brand (Neue Haas Grotesk)

Each style maps to a semantic role. Sizes specified for Desktop (≥1024px), Tablet (768–1023px), Mobile (<768px).

```
────────────────────────────────────────────────────────────────────────────────
STYLE          FONT                WEIGHT    DESKTOP      TABLET       MOBILE
────────────────────────────────────────────────────────────────────────────────

Display        Neue Haas Grotesk   Medium    56px         44px         34px
               (500)
               Line-height:                  1.05         1.08         1.1
               Letter-spacing:               -0.025em     -0.025em     -0.02em
               Usage: Hero headlines, landing page features, campaign moments.
               Max: One Display element per page.
               v2.0 change: Weight upgraded from Light 300 to Medium 500.
               Spacing tightened from -0.02em to -0.025em for confidence.

────────────────────────────────────────────────────────────────────────────────

Headline       Neue Haas Grotesk   Medium    40px         34px         28px
               (500)
               Line-height:                  1.1          1.12         1.15
               Letter-spacing:               -0.015em     -0.01em      -0.01em
               Usage: Page titles (H1), primary section headers.

────────────────────────────────────────────────────────────────────────────────

Title 1        Neue Haas Grotesk   Medium    28px         26px         22px
               (500)
               Line-height:                  1.2          1.22         1.25
               Letter-spacing:               -0.01em      -0.01em      -0.005em
               Usage: Section headers (H2), modal titles, feature headings.

────────────────────────────────────────────────────────────────────────────────

Title 2        Neue Haas Grotesk   Medium    22px         20px         18px
               (500)
               Line-height:                  1.25         1.28         1.3
               Letter-spacing:               -0.005em     0            0
               Usage: Subsection headers (H3), card titles, settings labels.

────────────────────────────────────────────────────────────────────────────────

Title 3        Neue Haas Grotesk   Medium    18px         17px         16px
               (500)
               Line-height:                  1.3          1.3          1.35
               Letter-spacing:               0            0            0
               Usage: Minor headings (H4), list section headers, dialog subtitles.

────────────────────────────────────────────────────────────────────────────────

Body           Neue Haas Grotesk   Regular   17px         17px         17px
               (400)
               Line-height:                  1.5          1.5          1.55
               Letter-spacing:               +0.01em      +0.01em      +0.01em
               Usage: Default UI text, paragraphs, form labels.
               v2.0 change: Minimum raised from 16px to 17px for
               dyslexic readability. Letter-spacing widened +0.01em.

────────────────────────────────────────────────────────────────────────────────

Callout        Neue Haas Grotesk   Regular   15px         15px         15px
               (400)
               Line-height:                  1.45         1.45         1.5
               Letter-spacing:               0.005em      0.005em      0.005em
               Usage: Supporting text, helper text, secondary descriptions.

────────────────────────────────────────────────────────────────────────────────

Subheadline    Neue Haas Grotesk   Bold      13px         13px         13px
               (700)
               Line-height:                  1.4          1.4          1.4
               Letter-spacing:               0.04em       0.04em       0.04em
               Transform:                    UPPERCASE    UPPERCASE    UPPERCASE
               Usage: Overline labels, category tags, section labels.

────────────────────────────────────────────────────────────────────────────────

Footnote       Neue Haas Grotesk   Regular   13px         13px         13px
               (400)
               Line-height:                  1.4          1.4          1.4
               Letter-spacing:               0.005em      0.005em      0.005em
               Usage: Metadata, timestamps, table headers, breadcrumbs.

────────────────────────────────────────────────────────────────────────────────

Caption        Neue Haas Grotesk   Regular   11px         11px         11px
               (400)
               Line-height:                  1.35         1.35         1.35
               Letter-spacing:               0.01em       0.01em       0.01em
               Usage: Legal text, footnotes, chart axis labels, badge text.
               Accessibility: Use sparingly. Always pair with AAA contrast.

────────────────────────────────────────────────────────────────────────────────
```

---

### 2.3.4 Type Scale — Product UI (Inter Variable)

The product type scale is used within the app (dashboard, sessions, insights, settings).

```
────────────────────────────────────────────────────────────────────────────────
STYLE          FONT             WEIGHT    SIZE         LINE-HEIGHT  LETTER-SPACING
────────────────────────────────────────────────────────────────────────────────

Display        Inter Variable   Light     32–40px      1.15         -0.01em
               (300)
               Usage: In-app hero metrics, greeting headers ("Good morning")

H1             Inter Variable   SemiBold  24–28px      1.2          -0.005em
               (600)
               Usage: Page titles within app

H2             Inter Variable   SemiBold  20–22px      1.25         0
               (600)
               Usage: Section headers within app

H3             Inter Variable   Medium    17–18px      1.3          0
               (500)
               Usage: Card titles, subsection headers

Body           Inter Variable   Regular   17px         1.6          +0.01em
               (400)
               Usage: Default product text, descriptions, form labels
               Minimum: 17px (v2.0 dyslexic readability standard)

Body Small     Inter Variable   Regular   14px         1.5          +0.01em
               (400)
               Usage: Secondary descriptions, compact list items

Data Value     Inter Variable   Medium    24–48px      1.0          0
               (500, tnum ON)
               Usage: Hero metrics, score displays, large numbers
               Feature: Tabular numerals always enabled for alignment

Data Label     Inter Variable   Medium    12px         1.3          +0.04em
               (500, UPPERCASE)
               Usage: Metric labels, chart axis labels, overlines

Caption        Inter Variable   Regular   12px         1.4          +0.01em
               (400)
               Usage: Timestamps, metadata, fine print in product UI

────────────────────────────────────────────────────────────────────────────────
```

**Adaptive Typography via font-variation-settings:**

```
Context               Weight    Width    Spacing     Purpose
────────────────────────────────────────────────────────────
Standard reading      400       100%     +0.01em     Default product UI
Health alerts         600       100%     0           Attention, importance
Data labels           500       95%      +0.02em     Compact, readable
Ambient/glanceable    300       105%     +0.02em     Relaxed, low-pressure
User "large text"     400       100%     +0.015em    Accessibility option
────────────────────────────────────────────────────────────
```

---

### 2.3.5 Depth-Aware Typography

Type weight and color shift with content depth, reinforcing the ocean metaphor. This is not style variation — it is information architecture expressed through typography.

```
Surface Content (Dashboard, Quick Reads):
────────────────────────────────────────────────────────────────────
Element         Font / Weight       Size         Color
────────────────────────────────────────────────────────────────────
Headlines       Inter Medium 500    28–32px      Deep Navy (#1A1F2E)
Body            Inter Regular 400   17px         Charcoal (#2D3142)
Accents         Inter Medium 500    12–14px      Ocean Surface (#3B8C8C)
Canvas                                           Warm Sand (#FAF8F5)
────────────────────────────────────────────────────────────────────

Deep Content (Insights, Analysis, Long-form):
────────────────────────────────────────────────────────────────────
Element         Font / Weight       Size         Color
────────────────────────────────────────────────────────────────────
Headlines       NHG Medium 500      28–32px      Ocean Deep (#1E4D7A)
Body            Inter Regular 400   17px         Deep Navy (#1A1F2E)
Accents         Inter Medium 500    12–14px      Ocean Twilight (#1E3364)
Canvas                                           Warm Sand + Foam tint (5%)
────────────────────────────────────────────────────────────────────

Immersive Content (Night Mode, Meditation, Sessions):
────────────────────────────────────────────────────────────────────
Element         Font / Weight       Size         Color
────────────────────────────────────────────────────────────────────
Headlines       NHG Medium 500      28–32px      Warm off-white (#F0EDE8)
Body            Inter Regular 400   17px         Warm off-white (#D4D0C8)
Accents         Inter Medium 500    12–14px      Ocean Shallow (#7EC8C8)
Canvas                                           Ocean Abyss (#2A1B4E)
────────────────────────────────────────────────────────────────────
```

---

### 2.3.6 Editorial Type Scale (Spectral — Long-Form Only)

```
────────────────────────────────────────────────────────────────────────────
STYLE             WEIGHT       SIZE        LINE-HEIGHT    LETTER-SPACING
────────────────────────────────────────────────────────────────────────────
Lead Paragraph    Medium 500   20px        1.65           0
Body              Regular 400  18px        1.7            0
Body Compact      Regular 400  16px        1.6            0
Block Quote       Italic 400i  20px        1.6            0.005em
────────────────────────────────────────────────────────────────────────────

Maximum line length: 75 characters (approximately 680px at 18px body).
```

---

### 2.3.7 Font Pairing Rules

```
Rule 1 — Layer Separation
  Brand-layer surfaces use Neue Haas Grotesk exclusively.
  Product-layer surfaces use Inter Variable exclusively.
  Spectral appears only in dedicated editorial/reading contexts.
  Never mix all three on one screen.

Rule 2 — Never Mix Weights Gratuitously
  A single screen should use no more than 3 weights:
  Brand: Regular/Medium/Bold
  Product: Light/Regular/Medium or Regular/Medium/SemiBold

Rule 3 — Italic for Emphasis in Body, Not Bold
  Within Spectral body text, use italic for emphasis.
  Within product UI text, use Medium weight for emphasis on Regular base.

Rule 4 — UPPERCASE Is Reserved
  Only Subheadline (brand) and Data Label (product) styles use uppercase.
  Never apply uppercase to Body, Title, or Display styles.

Rule 5 — Tabular Numerals in Data Contexts
  All numeric data displays use Inter Variable with tnum feature enabled.
  This ensures columns of numbers align vertically.
```

---

### 2.3.8 Accessibility Requirements

```
Minimum Sizes:
  Body text (primary reading):    17px (v2.0 — raised from 16px)
  Interactive labels (buttons):   14px (with Medium/Bold weight)
  Caption / fine print:           11px (use sparingly, AAA contrast required)

Contrast Requirements:
  Body text:                      WCAG AAA (7:1 minimum)
  Large text (≥18px or ≥14px bold): WCAG AA (4.5:1 minimum)
  UI components:                  WCAG AA (3:1 minimum against adjacent)

Line Length:
  Optimal:                        50–75 characters per line
  Maximum:                        85 characters (never exceed)
  Minimum:                        30 characters (below this, reflow layout)

Line Height:
  Body text (long-form):          1.6–1.7 (v2.0 — increased for readability)
  Body text (UI):                 1.5–1.55
  Headlines:                      1.05–1.3

Customization (Required):
  4 user-selectable text size options in app settings
  Respect system-level font scaling
  Support prefers-contrast media query
```

---
---

## 2.4 Layout Grid

### 2.4.1 Responsive 12-Column Grid

```
────────────────────────────────────────────────────────────────────────────
BREAKPOINT        VIEWPORT       COLUMNS   GUTTER    MARGIN    MAX CONTENT
────────────────────────────────────────────────────────────────────────────
Desktop Large     ≥1440px        12        24px      80px      1280px
Desktop           1024–1439px    12        24px      64px      Fluid
Tablet            768–1023px     8         20px      40px      Fluid
Mobile Large      428–767px      4         16px      24px      Fluid
Mobile            375–427px      4         16px      20px      Fluid
Mobile Small      320–374px      4         12px      16px      Fluid
────────────────────────────────────────────────────────────────────────────
```

### 2.4.2 Asymmetric Grid (7/5)

The v2.0 dashboard layout uses a 7-column / 5-column asymmetric split instead of the v1.0 symmetric 6/6. This creates dynamic visual tension — like a wave that hasn't quite crested. It reads as alive and forward-moving without losing balance.

```
Asymmetric Layout (Dashboard):
─────────────────────────────────────────────────────────────────────
  ┌──────────────────────────────┬─────────────────────┐
  │                              │                     │
  │  Primary Content             │   Supporting         │
  │  7 columns (58%)             │   5 columns (42%)    │
  │                              │                     │
  │  - AI Insight Card           │  - Session list      │
  │  - Charts & trends           │  - Quick metrics     │
  │  - Deep analysis             │  - Shortcuts         │
  │                              │                     │
  └──────────────────────────────┴─────────────────────┘
─────────────────────────────────────────────────────────────────────

When to use 7/5:    Dashboard, insights pages, data-heavy layouts
When to use 6/6:    Settings, profile, checkout, forms
When to stack:      Tablet (<1024px) and mobile (<768px)
```

### 2.4.3 Breakpoint Definitions

```css
/* Breakpoints — Mobile First */
--breakpoint-sm:    375px;    /* Mobile baseline */
--breakpoint-md:    768px;    /* Tablet */
--breakpoint-lg:    1024px;   /* Desktop */
--breakpoint-xl:    1440px;   /* Desktop Large */
--breakpoint-2xl:   1920px;   /* Ultra-wide (content stays at 1280px max) */
```

### 2.4.4 Column Behavior

```
Desktop (12 columns):
  Navigation sidebar: 3 columns (collapsible)
  Main content: 7 columns (dashboard) or 6–9 columns (other pages)
  Secondary panel: 5 columns (dashboard) or 3 columns (other pages)

Tablet (8 columns):
  Navigation: Collapsed to top bar
  Main content: 8 columns (full width)
  Secondary panel: Hidden behind toggle or stacked below

Mobile (4 columns):
  Navigation: Tab bar (bottom) or hamburger menu
  Main content: 4 columns (full width)
  Secondary panel: Stacked below or accessible via tab
```

### 2.4.5 Safe Areas

```
iOS Safe Areas:
  Status bar:      59px top (Dynamic Island), 47px (Notch), 20px (Legacy)
  Home indicator:  34px bottom
  Side insets:     0px (portrait), varies (landscape)

Android Safe Areas:
  Status bar:      24–48px top
  Navigation bar:  48px bottom (gesture nav: 16px)

Content Safe Zone:
  Minimum 16px padding inside any safe area boundary
  Interactive elements fully within safe areas
  No tappable targets within 8px of screen edges
```

---
---

## 2.5 Spacing System

Base unit: **8px**. All spacing derives from the 8px base. Half-steps (4px, 12px) available for fine-tuning within components. External component spacing uses full steps only.

```
TOKEN       VALUE     USAGE
──────────────────────────────────────────────────────────────────
space-1     4px       Inline icon-to-label gap, tight internal padding
space-2     8px       Minimum padding in small components, form element gaps
space-3     12px      Small component padding (compact buttons, tags)
space-4     16px      Default component padding (buttons, inputs, cards)
space-5     24px      Card padding, content block spacing, modal body
space-6     32px      Section spacing within page, card grid gaps
space-7     48px      Major section dividers, page section spacing
space-8     64px      Page-level section breaks, large feature spacing
space-9     96px      Top-of-page hero padding, landing page sections
space-10    128px     Landing page hero padding (desktop), max vertical
──────────────────────────────────────────────────────────────────
```

**Spacing Guidelines:**
1. **Related elements are closer** — space-1 to space-3
2. **Vertical rhythm trumps symmetry** — Consistent vertical spacing within sections
3. **More space = more importance** — Space above headers communicates hierarchy
4. **Mobile spacing never less than desktop** — Maintain same tokens on mobile
5. **Touch targets:** Minimum 48×48px tappable area, 8px between adjacent targets (12px recommended)

---
---

## 2.6 Glass-Morphism System

Glass-morphism is Kaivoo's implementation of the "Liquid Glass" trend — adapted with warm undertones instead of the cold metallic default. Kaivoo glass feels like looking through warm sea glass, not through a corporate window.

---

### 2.6.1 Philosophy

Apple's glass is blue-white, sharp-edged, and cold. Kaivoo's glass is sand-warm, soft-edged, and organic. The blur creates a sense of floating on water — content feels ambient and breathable rather than layered and technical.

---

### 2.6.2 Technical Specifications

```
Light Mode Glass:
────────────────────────────────────────────────────────────────────
Property              Value                     Notes
────────────────────────────────────────────────────────────────────
backdrop-filter       blur(24px) saturate(1.1)  Core effect
background            rgba(250, 248, 245, 0.65) Warm Sand at 65%
border                0.5px solid rgba(255, 255, 255, 0.25)
border-radius         20px                      Slightly rounder than cards
box-shadow            0 4px 16px rgba(26, 31, 46, 0.06)
────────────────────────────────────────────────────────────────────

Dark Mode Glass:
────────────────────────────────────────────────────────────────────
Property              Value                     Notes
────────────────────────────────────────────────────────────────────
backdrop-filter       blur(20px) saturate(1.1)  Slightly less blur
background            rgba(26, 24, 50, 0.50)    Abyss Card at 50%
border                0.5px solid rgba(255, 255, 255, 0.12)
border-radius         20px                      Same as light mode
box-shadow            0 4px 16px rgba(18, 16, 30, 0.20)
────────────────────────────────────────────────────────────────────

Blur Distance by Context:
────────────────────────────────────────────────────────────────────
Context               Blur (px)   Purpose
────────────────────────────────────────────────────────────────────
Cards (Glass Card)    24px        Standard frosted glass
Modals                28px        Denser frosting for focus
Overlays / Sheets     32px        Maximum frosting
Subtle backgrounds    20px        Minimal effect
────────────────────────────────────────────────────────────────────

Background Opacity:
────────────────────────────────────────────────────────────────────
Situation             Opacity     Example
────────────────────────────────────────────────────────────────────
Default (light)       65%         rgba(250, 248, 245, 0.65)
Hover (light)         80%         rgba(250, 248, 245, 0.80)
Default (dark)        50%         rgba(26, 24, 50, 0.50)
Hover (dark)          65%         rgba(26, 24, 50, 0.65)
────────────────────────────────────────────────────────────────────
```

---

### 2.6.3 Where to Use / Where to Avoid

```
✓ USE glass-morphism for:
  - Dashboard summary cards (scores, metrics at a glance)
  - Ambient background states (floating navigation, FAB)
  - Modal overlays and bottom sheets
  - Onboarding/first-impression screens
  - Morning briefing pattern
  - Quick-glance metric cards

✗ DO NOT use glass-morphism for:
  - Health data entry or editing flows (opaque only)
  - Long-form text and educational content
  - Clinical or diagnostic displays
  - Data visualization chart areas
  - Alert or urgent notification content
  - Focus Mode interfaces (always opaque in Focus Mode)
  - Any context where text must be read carefully
```

---

### 2.6.4 Fallback Strategy

Glass-morphism requires `backdrop-filter` support. For unsupported browsers and Focus Mode:

```css
/* Fallback for unsupported browsers */
@supports not (backdrop-filter: blur(1px)) {
  .glass {
    background: rgba(250, 248, 245, 0.92);
    border: 1px solid rgba(126, 200, 200, 0.15);
    box-shadow: 0 8px 24px rgba(26, 31, 46, 0.12);
  }
}

/* Focus Mode override — always opaque */
[data-density="focus"] .glass {
  backdrop-filter: none;
  background: var(--color-warm-sand);
  border: 1px solid var(--color-mist);
}
```

**Critical rule:** Glass is enhancement, not foundation. Every glass element must be fully functional and readable with the opaque fallback.

---
---

## 2.7 Motion & Animation System

Every interaction should feel like touching water — responsive, yielding, alive, but never chaotic. Motion in Kaivoo is functional, never decorative. The ocean is always present in color; motion is enhancement, never requirement.

---

### 2.7.1 Motion Principles

```
1. Water, Not Fire
   Animations decelerate smoothly (like water settling),
   never snap or bounce aggressively.

2. Felt, Not Seen
   The best animations are the ones users don't consciously notice.
   Maximum opacity for interactive gradients: 12%.

3. Depth Communicates Direction
   Going deeper (into insights, into detail) = content descends.
   Surfacing (back to dashboard, to overview) = content rises.

4. Silence Is an Option
   Every animation has a static fallback. prefers-reduced-motion
   disables all motion — no exceptions.
```

---

### 2.7.2 Easing Curves

```
Base Curves (v1.0 — retained):
────────────────────────────────────────────────────────────────────
--ease-default:    cubic-bezier(0.4, 0, 0.2, 1)      Standard ease
--ease-out:        cubic-bezier(0.0, 0, 0.2, 1)      Decelerating
--ease-in:         cubic-bezier(0.4, 0, 1, 1)        Accelerating
--ease-spring:     cubic-bezier(0.34, 1.56, 0.64, 1) Slight overshoot
────────────────────────────────────────────────────────────────────

Ocean Curves (v2.0 — new):
────────────────────────────────────────────────────────────────────
--ease-water:      cubic-bezier(0.25, 0.1, 0.25, 1.0)
                   Like water settling — organic, natural

--ease-wave:       cubic-bezier(0.45, 0.05, 0.55, 0.95)
                   Oscillating wave — gentle, perpetual

--ease-dive:       cubic-bezier(0.4, 0, 0.2, 1)
                   Diving deeper — quick start, slow arrival

--ease-surface:    cubic-bezier(0.0, 0, 0.2, 1)
                   Surfacing — slow start, quick arrival
────────────────────────────────────────────────────────────────────
```

---

### 2.7.3 Duration Scale

```
Base Durations (v1.0 — retained):
────────────────────────────────────────────────────────────────────
--duration-instant:    100ms     Button press, micro-feedback
--duration-fast:       150ms     Micro-interactions
--duration-normal:     200ms     State changes
--duration-moderate:   250ms     Panel reveals
--duration-slow:       300ms     Page transitions
--duration-gentle:     400ms     Completion animations
────────────────────────────────────────────────────────────────────

Ocean Durations (v2.0 — new):
────────────────────────────────────────────────────────────────────
--duration-ripple:     300ms     Hover ripple effect
--duration-wave:       800ms     Wave/loading animation cycle
--duration-tide:       1200ms    Full tide cycle (loading states)
--duration-current:    250ms     Page transitions (ocean-themed)
────────────────────────────────────────────────────────────────────
```

---

### 2.7.4 Named Interactions

Six water-inspired interactions define the motion language.

---

#### 1. Ripple — Hover States

**Trigger:** Hover over card or interactive element

```
Sequence:
  1. Background tint shifts to Ocean Foam (#D4EDE4) at 30% opacity
  2. Radial gradient emanates from cursor position
  3. Subtle "ripple" of ocean gradient from hover point
  4. Duration: 300ms ease-water on entry
  5. On leave: ripple dissolves outward, 400ms ease-water

Maximum opacity:    12% (felt more than seen)
CSS implementation: var(--gradient-ripple) with cursor tracking
```

---

#### 2. Depth Dive — Scroll Transitions

**Trigger:** User scrolls down content

```
Sequence:
  1. Depth Bar at page top subtly shifts gradient position
  2. Section backgrounds can warm or cool based on content depth
  3. Scroll progress indicator uses ocean gradient instead of solid

Implementation:   CSS @supports (animation-timeline: view())
Fallback:         Static gradient, no position shift
```

---

#### 3. Current — Page Transitions

**Trigger:** Navigation between pages

```
Forward (Going deeper):
  Content shifts left and slightly down (like diving)
  New content rises from below, slightly blurred, sharpens
  Duration: 250ms var(--ease-dive)

Backward (Surfacing):
  Content shifts right and slightly up
  Previous content descends from above
  Duration: 250ms var(--ease-surface)

Implementation:   View Transitions API or custom animation
```

---

#### 4. Tide — Loading States

**Trigger:** Data loading, content fetching

```
Primary animation:
  Wave-form oscillation derived from brand pattern
  Duration: 1200ms var(--ease-wave) infinite

Skeleton screens:
  Ocean gradient shimmer instead of grey shimmer
  Gradient: Foam → Shallow → Foam at 5% opacity
  Duration: 1200ms loop
  Metaphor: "Content is rising to the surface"
```

---

#### 5. Swell — Mobile Pull to Refresh

**Trigger:** Pull-to-refresh gesture on mobile

```
Sequence:
  1. Pull down (0–50px): Wave builds in height
  2. Threshold reached: Wave crests
  3. Release: Content refreshes with gentle "wash" downward
  4. K icon centered in rising wave form

Wave height:      Proportional to pull distance
```

---

#### 6. Bubble — Notification Arrival

**Trigger:** New notification arrives

```
Sequence:
  1. Small circle appears at bottom (8px, Ocean Surface color)
  2. Rises upward with gentle deceleration
  3. Expands into full notification card at target position
  Duration: 400ms var(--ease-water) with slight overshoot
```

---

### 2.7.5 Reduce Motion Compliance

Every ocean animation has a mandatory static fallback. No exceptions.

```
────────────────────────────────────────────────────────────────────
ANIMATION           REDUCE MOTION FALLBACK
────────────────────────────────────────────────────────────────────
Ripple              Instant color change to Ocean Foam tint
Depth Dive          No scroll color shift, static gradient
Current             Instant page swap, no transition
Tide                Static progress bar (no wave motion)
Swell               Standard refresh indicator, no wave
Bubble              Instant notification appear, no rise
Depth Bar shimmer   Static gradient (no shimmer)
────────────────────────────────────────────────────────────────────

Implementation:
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }

Additionally: App settings provide a "Reduce Motion" toggle that
overrides even when the OS setting is not enabled.
```

---
---

# 3. Components

---

## 3.1 Navigation Components

---

### 3.1.1 Header / Navigation Bar

**Purpose:** Global navigation across the application. Persistent at the top of every screen. Updated in v2.0 to include the Depth Bar signature element.

**Anatomy:**
```
┌─────────────────────────────────────────────────────────────────────┐
│  ══════════════════════════════════════════════════════════════════  │
│  ^ DEPTH BAR (4px, full ocean gradient)                             │
│  [Logo]        [Nav Item] [Nav Item] [Nav Item]     [Search] [Avatar] │
│  (1) Brand     (2) Navigation Links                  (3) Actions      │
└─────────────────────────────────────────────────────────────────────┘

(1) Brand Area -- K icon + wordmark (combination mark), links to home
(2) Navigation Links -- 3-6 top-level items, Footnote weight
(3) Action Area -- Search icon, notification bell, user avatar
NEW: Depth Bar positioned flush above the navigation row
```

**States:**
```
Nav Item States:
  Default:      Charcoal text, no underline
  Hover:        Deep Navy text, 2px Ocean Foam underline (offset 6px below)
  Active:       Deep Navy text, 2px Resonance Teal underline
  Current Page: Deep Navy Medium weight, 2px Resonance Teal underline

Header States:
  Default:      Warm Sand background, 1px Mist bottom border
  Scrolled:     Warm Sand background, box-shadow 0 1px 3px rgba(26,31,46,0.06)
  Mobile:       Collapses to logo + hamburger icon

Dark Mode (Abyss):
  Background:   Abyss Canvas (#12101E)
  Nav Default:  Warm off-white (#F0EDE8)
  Nav Hover:    White, 2px Ocean Foam underline
  Nav Active:   White, 2px Ocean Surface (dark: #4BBFBF) underline
  Border:       1px solid rgba(255,255,255,0.06)
  Depth Bar:    Same gradient at 80% opacity, subtle glow:
                box-shadow 0 1px 8px rgba(126,200,200,0.15)
```

**Specifications:**
```
Height:            68px (desktop, incl. 4px Depth Bar), 60px (tablet), 52px (mobile)
Depth Bar height:  4px, flush top, full width
Padding:           0 space-6 (0 32px) desktop, 0 space-4 mobile
Logo height:       28px (desktop), 24px (mobile)
Nav item spacing:  space-6 (32px) between items
Nav item padding:  space-3 (12px) vertical
Font:              Footnote (13px, Regular 400, 0.005em tracking)
Active underline:  2px height, 0px border-radius, offset 6px
Background:        Warm Sand (#FAF8F5)
Border:            1px solid Mist (#E5E7EB) bottom
Z-index:           100
```

**Accessibility:**
```
- <nav> landmark with aria-label="Main navigation"
- Current page: aria-current="page"
- Keyboard: Tab through items, Enter/Space to activate
- Mobile menu: aria-expanded on hamburger, focus trap when open
- Skip link: "Skip to main content" as first focusable element
- Depth Bar: role="presentation" (decorative)
```

**Usage:**
- Use for all authenticated and marketing pages
- Maximum 6 navigation items (more causes decision fatigue -- antithetical to brand)
- Depth Bar is always present -- it is the signature brand element
- Do NOT use dropdown menus from the header; use page-level navigation instead

---

### 3.1.2 Tab Bar (Bottom Navigation -- Mobile)

**Purpose:** Primary navigation on mobile, persistent at screen bottom.

**Anatomy:**
```
Each tab: Icon (24px) + Label (Caption, 11px)
Maximum: 5 tabs. Minimum: 3 tabs.
```

**States:**
```
Default:     Silver icon + Silver label
Active:      Ocean Surface (#3B8C8C) icon + Deep Navy label (Medium weight)
Badge:       8px Ember dot on icon (top-right, no number for <10)

Dark Mode (Abyss):
  Background:  Abyss Canvas (#12101E), 1px rgba(255,255,255,0.06) top border
  Default:     rgba(255,255,255,0.4) icon + label
  Active:      Ocean Surface (dark: #4BBFBF) icon + Warm off-white label
```

**Specifications:**
```
Height:            83px (includes 34px safe area)
Content height:    49px (above safe area)
Background:        Warm Sand, 1px Mist top border
Icon size:         24x24px
Label font:        Caption (11px, Regular)
Tab width:         Equal distribution (100% / tab count)
Active indicator:  None -- color change is sufficient
Padding:           space-2 (8px) top, safe area bottom
```

**Accessibility:**
```
- role="tablist" on container, role="tab" on each item
- aria-selected="true" on active tab
- Haptic feedback on tap (iOS: UIImpactFeedbackGenerator light)
```

---

### 3.1.3 Sidebar Navigation

**Purpose:** Section-level navigation on desktop, typically for settings, dashboards, or multi-page flows.

**States:**
```
Default:     Charcoal text, no background
Hover:       Deep Navy text, Ocean Foam (#D4EDE4) at 30% background
Active:      Deep Navy Medium text, 3px Ocean Surface left border,
             Ocean Foam background at 10% opacity
Disabled:    Silver text, no interaction

Dark Mode (Abyss):
  Background:    Abyss Canvas (#12101E)
  Default:       Warm off-white (#F0EDE8)
  Hover:         White, Abyss Elevated (#232040) background
  Active:        White Medium, 3px Ocean Surface (dark: #4BBFBF) left border,
                 rgba(75,191,191,0.08) background
  Section label: rgba(255,255,255,0.5), uppercase
```

**Specifications:**
```
Width:             240px (fixed) or 3 columns
Item height:       40px
Item padding:      space-3 (12px) vertical, space-4 (16px) horizontal
Section label:     Subheadline (13px, Bold 700, uppercase, 0.04em tracking)
Section gap:       space-5 (24px) between sections
Active indicator:  3px left border, Ocean Surface (#3B8C8C), border-radius 2px
Background:        Cloud (#F3F4F6) or transparent
Font:              Callout (15px, Regular 400)
```

**Accessibility:**
```
- <nav> landmark with descriptive aria-label
- Section labels use role="heading" aria-level="2"
- aria-current="page" on active item
- Full keyboard navigation with arrow keys
```

---

### 3.1.4 Breadcrumbs

**Purpose:** Show location within a hierarchy. Used on content pages, settings, and multi-step flows.

**States:**
```
Link Default:   Clarity Blue text
Link Hover:     Clarity Blue text, underline
Current:        Charcoal text, no link, font-weight Medium

Dark Mode (Abyss):
  Link Default:   Clarity Blue (dark: #7FA3E0)
  Current:        Warm off-white, Medium weight
  Separator:      rgba(255,255,255,0.3)
```

**Specifications:**
```
Font:              Footnote (13px, Regular 400)
Separator:         " / " with space-1 (4px) padding each side
Current item:      Footnote Medium (13px, 500)
Spacing:           space-4 (16px) margin-bottom
Max items shown:   5 (collapse middle items to "..." on overflow)
```

**Accessibility:**
```
- <nav> with aria-label="Breadcrumb"
- <ol> list structure
- Current page: aria-current="page"
- Truncated items accessible via expandable menu
```

---
---

## 3.2 Input Components

---

### 3.2.1 Buttons

Six variants, each with a defined role in the interaction hierarchy. v2.0 adds ocean shimmer hover effect to Primary buttons.

**Anatomy (all variants):**
```
(1) Leading icon -- Optional, 18px, 4px gap to label
(2) Label -- Callout weight (15px), sentence case ("Save changes" not "Save Changes")
```

---

**Variant 1: Primary**
```
Role:       The single most important action on screen
Background: Resonance Teal (#3B8C8C)
Text:       White (#FFFFFF)
Border:     None
Radius:     12px
Shadow:     None

States:
  Default:    Background #3B8C8C
  Hover:      Background #347D7D (darken 8%) + ocean shimmer:
              Subtle left-to-right gradient sweep of the ocean spectrum
              at 5% opacity beneath the button background.
              CSS: background-image linear-gradient(90deg,
                   rgba(212,237,228,0.08) 0%,
                   rgba(126,200,200,0.06) 50%,
                   rgba(59,140,140,0.04) 100%)
              Animation: 600ms ease-water, once
  Active:     Background #2D6E6E (darken 15%), scale(0.98)
  Focused:    2px Resonance Teal outline, 2px offset
  Disabled:   Background Silver (#9CA3AF), text White at 70%
  Loading:    Background #347D7D, spinner replaces icon, label changes to "Saving..."

Dark Mode (Abyss):
  Default:    Background Ocean Surface (dark: #4BBFBF)
  Hover:      Background #3BAAAA + shimmer at 8% opacity
  Text:       Deep Navy (#1A1F2E) -- dark text on bright teal for contrast
```

**Variant 2: Secondary**
```
Role:       Supporting actions (Cancel, Back, alternative paths)
Background: Transparent
Text:       Deep Navy (#1A1F2E)
Border:     1.5px solid Mist (#E5E7EB)
Radius:     12px

States:
  Default:    Border Mist
  Hover:      Border Ocean Shallow (#7EC8C8) at 40%, background Ocean Foam at 8%
  Active:     Border Slate, background Mist, scale(0.98)
  Focused:    2px Resonance Teal outline, 2px offset
  Disabled:   Border Mist at 50%, text Silver

Dark Mode (Abyss):
  Text:       Warm off-white (#F0EDE8)
  Border:     1.5px solid rgba(255,255,255,0.12)
  Hover:      Border rgba(75,191,191,0.3), background rgba(75,191,191,0.06)
```

**Variant 3: Tertiary (Ghost)**
```
Role:       Low-emphasis actions (Learn more, View all, Edit)
Background: Transparent
Text:       Resonance Teal (#3B8C8C)
Border:     None
Radius:     8px

States:
  Default:    Text Resonance Teal
  Hover:      Background Ocean Foam (#D4EDE4) at 15%, text #347D7D
  Active:     Background Ocean Foam at 25%, scale(0.98)
  Focused:    2px Resonance Teal outline, 2px offset
  Disabled:   Text Silver

Dark Mode (Abyss):
  Text:       Ocean Surface (dark: #4BBFBF)
  Hover:      Background rgba(75,191,191,0.08)
```

**Variant 4: Destructive**
```
Role:       Irreversible or high-consequence actions (Delete, Remove)
Background: Transparent
Text:       Ember (#C75C3A)
Border:     1.5px solid Ember at 40%
Radius:     12px

States:
  Default:    Text Ember, border Ember at 40%
  Hover:      Background #FEF2F2, border Ember at 70%
  Active:     Background Ember, text White
  Focused:    2px Ember outline, 2px offset
  Disabled:   Text Silver, border Mist

Dark Mode (Abyss):
  Text:       Ember (dark: #E07A5C)
  Border:     1.5px solid rgba(224,122,92,0.3)
  Hover:      Background rgba(224,122,92,0.08), border rgba(224,122,92,0.5)
  Active:     Background #E07A5C, text Abyss Canvas
```

**Variant 5: Icon-Only**
```
Role:       Actions where the icon is universally understood (close, menu, search)
Background: Transparent
Icon:       Charcoal (#2D3142), 20px
Border:     None
Radius:     8px
Size:       40x40px (touch target: 44x44px with padding)

States:
  Default:    Icon Charcoal
  Hover:      Background Ocean Foam at 20%, icon Deep Navy
  Active:     Background Ocean Foam at 30%, scale(0.95)
  Focused:    2px Resonance Teal outline, 2px offset
  Disabled:   Icon Silver

Dark Mode (Abyss):
  Icon:       rgba(255,255,255,0.7)
  Hover:      Background rgba(75,191,191,0.08), icon White
```

**Variant 6: Link Button**
```
Role:       Inline actions that look like links but behave as buttons
Background: Transparent
Text:       Clarity Blue (#5B7FBF)
Border:     None
Underline:  On hover only

States:
  Default:    Text Clarity Blue, no underline
  Hover:      Text #4A6BA8, underline
  Active:     Text #3A5790
  Focused:    2px Resonance Teal outline, 2px offset
  Disabled:   Text Silver, no underline

Dark Mode (Abyss):
  Text:       Clarity Blue (dark: #7FA3E0)
  Hover:      Text #93B5F0, underline
```

**Button Specifications (all variants):**
```
SIZE        HEIGHT    PADDING (H)    FONT            MIN WIDTH
Large       48px      space-5 (24px) Body (17px)     120px
Medium      40px      space-4 (16px) Callout (15px)  96px
Small       32px      space-3 (12px) Footnote (13px) 72px

Border-radius:  12px (Large, Medium), 8px (Small)
Transition:     background 200ms ease-water, transform 100ms ease-out
Icon-label gap: space-1 (4px)
Full-width:     Available on all sizes, stretches to container width
```

**Button Accessibility:**
```
- Minimum touch target: 44x44px (even if visually smaller, pad with transparent hit area)
- Focus ring: 2px solid Resonance Teal, 2px offset (visible on all backgrounds)
- Disabled buttons: aria-disabled="true", cursor not-allowed, reduced opacity
- Loading buttons: aria-busy="true", announce state change to screen reader
- Icon-only: aria-label required (e.g., aria-label="Close dialog")
- Never disable without explanation -- show tooltip on disabled hover
```

**Button Usage:**
```
DO:
- Use only one Primary button per visible viewport
- Use sentence case: "Save changes" not "Save Changes"
- Include a verb: "Create account" not "Account"
- Place Primary on the right in button groups (except destructive flows)

DO NOT:
- Place two Primary buttons adjacent to each other
- Use Destructive for non-destructive actions
- Make buttons wider than 320px (use full-width instead)
- Use color alone to differentiate button meaning
```

---

### 3.2.2 Text Fields

**States:**
```
Default:     Border 1.5px Mist, background White (#FFFFFF)
Hover:       Border Silver
Focused:     Border 2px Resonance Teal, subtle shadow 0 0 0 3px Teal at 12%
Filled:      Border Mist, value in Deep Navy
Error:       Border 2px Error foreground, helper text becomes error message
Disabled:    Background Cloud, border Mist at 50%, text Silver, cursor not-allowed
Read-only:   Background Cloud, no border, text Charcoal, cursor default

Dark Mode (Abyss):
  Background:  Abyss Card (#1A1832)
  Border:      1.5px solid rgba(255,255,255,0.10)
  Text:        Warm off-white (#F0EDE8)
  Placeholder: rgba(255,255,255,0.35)
  Focused:     Border 2px Ocean Surface (dark: #4BBFBF),
               shadow 0 0 0 3px rgba(75,191,191,0.15)
  Error:       Border 2px Error (dark: #FCA5A5)
```

**Specifications:**
```
Height:            48px (Large), 40px (Medium -- default), 32px (Small)
Padding:           space-3 (12px) horizontal, centered vertical
Border-radius:     10px
Font (input):      Body (17px) -- never smaller (prevents iOS zoom)
Font (label):      Body (17px), margin-bottom space-1 (4px)
Font (helper):     Footnote (13px), margin-top space-1 (4px)
Transition:        border-color 150ms ease-water, box-shadow 150ms ease-water
```

**Variants:**
```
Standard:          Single-line text input
Password:          Masked input with show/hide toggle (eye icon)
Search:            Leading search icon, trailing clear button
Textarea:          Multi-line, min-height 96px, resize vertical only
Number:            Right-aligned text, optional stepper controls
```

**Accessibility:**
```
- Labels: Always visible (no placeholder-only labels), linked via htmlFor/id
- Required: aria-required="true" + visual asterisk
- Errors: aria-invalid="true" + aria-describedby pointing to error message
- Helper text: aria-describedby linking input to helper
- Autocomplete: Use appropriate autocomplete attributes
- Mobile: inputmode for keyboard type (numeric, email, tel, url)
```

---

### 3.2.3 Dropdown / Select

**Specifications:**
```
Trigger:           Same as Text Field (height, padding, border, radius)
Dropdown panel:    Background White, border 1px Mist, radius 12px
                   Shadow: 0 8px 24px rgba(26,31,46,0.08),
                           0 2px 8px rgba(26,31,46,0.04)
Option height:     40px
Option padding:    space-3 (12px) horizontal
Option font:       Callout (15px)
Selected marker:   Resonance Teal checkmark icon (18px), right-aligned
Hover background:  Ocean Foam (#D4EDE4) at 30%
Max visible:       6 options before scroll
Animation:         Scale from 0.95 + fade, 200ms ease-water

Dark Mode (Abyss):
  Panel bg:        Abyss Elevated (#232040)
  Border:          1px solid rgba(255,255,255,0.08)
  Shadow:          0 8px 24px rgba(0,0,0,0.3)
  Hover:           rgba(75,191,191,0.08)
  Selected:        Ocean Surface (dark: #4BBFBF) checkmark
```

**Accessibility:**
```
- Use native <select> on mobile for best UX
- Custom desktop: role="listbox", role="option", aria-selected
- Keyboard: Arrow keys navigate, Enter selects, Escape closes
- Type-ahead: Typing letters jumps to matching options
```

---

### 3.2.4 Toggle Switch

**States:**
```
Off Default:    Track Silver, thumb White with 1px Mist border
Off Hover:      Track Slate
On Default:     Track Resonance Teal (#3B8C8C), thumb White
On Hover:       Track #347D7D
Focused:        2px Resonance Teal outline, 2px offset
Disabled Off:   Track Mist, thumb Cloud
Disabled On:    Track Resonance Teal at 40%, thumb White at 70%

Dark Mode (Abyss):
  Off Track:     rgba(255,255,255,0.15)
  Off Thumb:     rgba(255,255,255,0.7)
  On Track:      Ocean Surface (dark: #4BBFBF)
  On Thumb:      White
```

**Specifications:**
```
Track size:        48x28px
Thumb size:        24x24px
Thumb offset:      2px from track edges
Border-radius:     14px (track), 12px (thumb)
Transition:        transform 200ms ease-water
Label gap:         space-3 (12px) from track
Label font:        Body (17px)
```

**Accessibility:**
```
- role="switch" with aria-checked
- Label linked via aria-labelledby or wrapping <label>
- Keyboard: Space toggles, focus visible on track
- State change announced to screen reader
```

---

### 3.2.5 Checkbox

**States:**
```
Unchecked:       Border 1.5px Mist, background White
Unchecked Hover: Border Ocean Shallow (#7EC8C8) at 60%
Checked:         Background Resonance Teal, white checkmark icon (14px, 2px stroke)
Checked Hover:   Background #347D7D
Indeterminate:   Background Resonance Teal, white dash icon
Focused:         2px Resonance Teal outline, 2px offset
Disabled:        Background Cloud, border Mist at 50%
Error:           Border Error foreground

Dark Mode (Abyss):
  Unchecked:     Border rgba(255,255,255,0.15), background transparent
  Checked:       Background Ocean Surface (dark: #4BBFBF)
  Hover:         Border rgba(75,191,191,0.4)
```

**Specifications:**
```
Box size:          20x20px
Border-radius:     6px
Checkmark:         2px stroke, rounded caps, White
Label gap:         space-2 (8px)
Group spacing:     space-3 (12px) between items
Transition:        background 150ms ease-water, border 150ms ease-water
Touch target:      44x44px (pad if needed)
```

---

### 3.2.6 Radio Button

**States:**
```
Unselected:      Border 1.5px Mist, background White
Unselected Hover: Border Ocean Shallow (#7EC8C8) at 60%
Selected:        Border Resonance Teal, inner dot Resonance Teal (8px)
Focused:         2px Resonance Teal outline, 2px offset
Disabled:        Border Mist at 50%, dot Silver (if selected)
Error:           Border Error foreground

Dark Mode (Abyss):
  Unselected:    Border rgba(255,255,255,0.15)
  Selected:      Border Ocean Surface (dark: #4BBFBF), dot #4BBFBF
```

**Specifications:**
```
Outer circle:      20x20px, border-radius 50%
Inner dot:         8x8px, border-radius 50%, centered
Label gap:         space-2 (8px)
Group spacing:     space-3 (12px) between options
Touch target:      44x44px
```

**Accessibility (Checkbox + Radio):**
```
- Checkbox: Native <input type="checkbox"> or role="checkbox" + aria-checked
- Radio: <fieldset> + <legend> grouping, native radio inputs
- Keyboard: Space toggles checkbox, arrow keys navigate radio group
- Error: aria-invalid="true" + aria-describedby
- Group label: Required <legend> or aria-labelledby
```

---

### 3.2.7 Slider / Range

**States:**
```
Default:     Track Mist, fill ocean gradient (Foam to Surface), thumb White with Teal border
Hover:       Thumb scales to 1.15, shadow 0 0 0 6px Teal at 12%
Active:      Thumb scales to 1.25, shadow 0 0 0 8px Teal at 18%
Focused:     2px Resonance Teal outline on thumb
Disabled:    Track Mist, fill Silver, thumb Cloud

Dark Mode (Abyss):
  Track:       rgba(255,255,255,0.10)
  Fill:        Ocean gradient (Foam dark to Surface dark)
  Thumb:       White with #4BBFBF border
```

**Specifications:**
```
Track height:      4px, border-radius 2px
Thumb size:        24x24px, border-radius 50%
Thumb border:      2px solid Resonance Teal
Fill:              linear-gradient(90deg, Ocean Foam, Ocean Surface) -- v2.0 gradient fill
Label font:        Body (17px), left-aligned
Value font:        Body (17px) Medium, right-aligned
Padding:           space-4 (16px) vertical for touch area
Touch target:      44x44px on thumb
```

---
---

## 3.3 Feedback Components

---

### 3.3.1 Alert / Banner

**Purpose:** Persistent, page-level messages that communicate system status or require user acknowledgment.

**Variants:**
```
Info:       Background Info.bg, border-left 3px Info.border, icon Info.icon
Success:    Background Success.bg, border-left 3px Success.border, icon Success.icon
Warning:    Background Warning.bg, border-left 3px Warning.border, icon Warning.icon
Error:      Background Error.bg, border-left 3px Error.border, icon Error.icon
Brand:      Background Ocean Foam (#D4EDE4) at 20%, border-left 3px Ocean Surface, icon Ocean Surface

Dark Mode (Abyss) -- all variants use dark semantic tokens:
  Info:     Background Info.bg.dark (#172554), border Info.border.dark (#1E3A5F)
  Success:  Background Success.bg.dark (#052E16), border Success.border.dark (#166534)
  Warning:  Background Warning.bg.dark (#451A03), border Warning.border.dark (#78350F)
  Error:    Background Error.bg.dark (#450A0A), border Error.border.dark (#7F1D1D)
  Brand:    Background rgba(75,191,191,0.08), border #4BBFBF
```

**Specifications:**
```
Padding:           space-4 (16px) all sides
Border-radius:     10px
Border-left:       3px solid (semantic color)
Icon size:         20x20px
Icon-text gap:     space-3 (12px)
Dismiss button:    32x32px, icon-only, right-aligned
Font:              Callout (15px)
Max width:         Matches content container
Animation:         Slide down + fade, 250ms ease-water
```

**Accessibility:**
```
- role="alert" for error/warning (announces immediately)
- role="status" for info/success (announces politely)
- Dismiss: aria-label="Dismiss alert"
- Keyboard: Tab to dismiss, Escape closes if dismissible
```

---

### 3.3.2 Toast / Snackbar

**Purpose:** Temporary, non-blocking feedback for completed actions. Auto-dismisses after 5 seconds. v2.0 uses "Bubble" animation -- rising from below.

**Specifications:**
```
Position:          Bottom-center (desktop), bottom full-width (mobile)
Bottom offset:     space-6 (32px) desktop, space-4 (16px) mobile
Width:             Auto (min 320px, max 560px desktop, 100% - 32px mobile)
Padding:           space-3 (12px) vertical, space-4 (16px) horizontal
Background:        Deep Navy (#1A1F2E)
Text:              #F1F2F4 (near-white), Callout (15px)
Icon:              20px, White or semantic color (success green, etc.)
Action button:     Ocean Surface (dark: #4BBFBF) text, Callout Medium
Border-radius:     12px
Shadow:            0 8px 24px rgba(26,31,46,0.16)
Z-index:           1000
Duration:          5000ms (auto-dismiss), pause on hover

Animation (v2.0 -- Bubble):
  Appear:  Small circle (8px, Ocean Surface) at bottom-center
           Rises upward with ease-surface deceleration
           Expands into full notification card at position
           Duration: 400ms
  Dismiss: Fade out + slight drop (4px), 200ms ease-dive

Reduce Motion:     Instant appear/disappear, no animation

Dark Mode (Abyss):
  Background:      Abyss Overlay (#2D294E)
  Border:          1px solid rgba(255,255,255,0.08)
  Shadow:          0 8px 24px rgba(0,0,0,0.3)
```

**Stacking:** Maximum 3 toasts visible. New toasts push older ones up by 8px.

**Accessibility:**
```
- role="status" with aria-live="polite"
- Action button: Keyboard-accessible, announced
- Auto-dismiss pauses when focused
- Undo actions: Sufficient time (5s minimum) per WCAG 2.2.1
```

---

### 3.3.3 Modal / Dialog

**Purpose:** Focused interaction that requires user attention. v2.0 adds a Glass variant for lightweight confirmations.

**Variants:**
```
Standard:    White background, full shadow hierarchy -- for forms, confirmations
Glass:       backdrop-filter: blur(24px) saturate(1.1)
             Warm Sand at 70% opacity
             0.5px white border at 25%
             border-radius 20px
             Used for: lightweight confirmations, "Are you sure?" prompts
```

**Specifications:**
```
Width:             480px (small), 640px (medium -- default), 800px (large)
Max height:        85vh (scroll internal body if needed)
Padding:           space-5 (24px) all sides
Border-radius:     16px (standard), 20px (glass)
Background:        White (standard) or glass treatment
Shadow:            0 24px 48px rgba(26,31,46,0.12),
                   0 8px 16px rgba(26,31,46,0.06)
Overlay:           Deep Navy at 40% opacity
Z-index:           1100

Title:             Title 2 (22px, Medium 500)
Title padding:     space-5 (24px) bottom
Divider:           1px solid Mist
Body padding:      space-5 (24px) vertical
Actions padding:   space-5 (24px) top
Action alignment:  Right-aligned, space-3 (12px) gap between buttons

Animation:
  Open:  Overlay fade 200ms, modal scale(0.95) to scale(1) + fade, 250ms ease-water
  Close: Reverse, 200ms ease-dive

Dark Mode (Abyss):
  Standard bg:   Abyss Elevated (#232040)
  Glass bg:      Abyss Card (#1A1832) at 70%, backdrop-filter: blur(24px)
  Divider:       1px solid rgba(255,255,255,0.06)
  Overlay:       #12101E at 60%
```

**Accessibility:**
```
- role="dialog" with aria-modal="true"
- aria-labelledby pointing to title
- Focus trap: Tab cycles within modal
- Initial focus: First interactive element (not close button)
- Escape key closes modal
- On close: Focus returns to trigger element
- Backdrop click closes (unless destructive confirmation)
```

---

### 3.3.4 Progress Indicators

**Linear Progress Bar:**
```
Height:       4px (default), 8px (large, for page-level)
Border-radius: 2px (4px track), 4px (8px track)
Fill:          linear-gradient(90deg, Ocean Foam, Ocean Shallow, Ocean Surface)
               -- v2.0 ocean gradient fill replaces solid teal
Track color:   Mist (#E5E7EB)
Transition:    Width 300ms ease-water
Label:         Optional, Footnote (13px), right-aligned percentage

Dark Mode (Abyss):
  Track:       rgba(255,255,255,0.08)
  Fill:        linear-gradient(90deg, #A8E4D4, #8AD4D4, #4BBFBF)
```

**Circular Progress (Spinner):**
```
Size:          16px (inline), 24px (button), 40px (page-level)
Stroke:        2px (16px), 3px (24px), 4px (40px)
Color:         Resonance Teal (default), White (on dark backgrounds)
Track:         Mist at 30% opacity
Animation:     360 degree rotation, 800ms linear infinite
```

**Tide Loader (v2.0 -- alternative to spinner):**
```
A small wave form derived from the brand wave pattern that
gently oscillates. Used for page-level loading states.

Width:         64px
Height:        24px
Animation:     Wave oscillation, 1200ms ease-wave infinite
Color:         Ocean gradient (Foam to Shallow to Surface)
Reduce motion: Static progress bar, no wave
```

**Accessibility:**
```
- role="progressbar" with aria-valuenow, aria-valuemin, aria-valuemax
- Indeterminate: aria-valuetext="Loading"
- Announce progress at 25% intervals for long operations
```

---

### 3.3.5 Skeleton Screen

**Purpose:** Placeholder content shown while data loads. v2.0 uses ocean gradient shimmer.

**Specifications:**
```
Background:        Cloud (#F3F4F6)
Shimmer (v2.0):    Ocean gradient sweep (Ocean Foam at 8%, Ocean Shallow at 5%, transparent),
                   1.5s ease-wave infinite
                   Content is "rising to the surface"
Border-radius:     Match the content being replaced:
                   - Text lines: 6px
                   - Avatars: 50%
                   - Cards: 16px
                   - Images: 12px
Height:            Match expected content height
Spacing:           Match expected content spacing exactly

Text skeleton:     Height 14px, width varies (100%, 80%, 60% for
                   multi-line), gap 8px between lines
Avatar skeleton:   40x40px circle
Card skeleton:     Full card dimensions with internal placeholders

Dark Mode (Abyss):
  Background:      Abyss Card (#1A1832)
  Shimmer:         Ocean gradient at 6% opacity on Abyss Elevated
```

**Accessibility:**
```
- aria-busy="true" on the container being loaded
- aria-label="Loading content" on skeleton region
- Reduce motion: Replace shimmer with static background
```

---
---

## 3.4 Data Display Components

---

### 3.4.1 Card System v2.0

**Purpose:** Container for discrete content. v2.0 replaces the five v1.0 variants with four named variants inspired by the ocean depth metaphor. Each variant serves a distinct content role.

---

**Variant 1: SHORE CARD (Default -- light surfaces)**

The everyday card. Replaces v1.0 Default, Elevated, and Interactive variants.

```
Background:     White (#FFFFFF)
Border:         1px solid Mist (#E5E7EB)
Radius:         16px
Shadow:         0 2px 8px rgba(26,31,46,0.05)
Padding:        space-5 (24px)

Hover (interactive):
  Background:   Ocean Foam (#D4EDE4) at 30%
  Border:       1px solid Ocean Shallow (#7EC8C8) at 40%
  Shadow:       0 4px 16px rgba(59,140,140,0.10)
  Transform:    translateY(-2px)
  Bottom accent: 2px gradient bar (Foam to Surface), border-radius 0 0 16px 16px

  This is the "touching the water" interaction.

Non-interactive: No hover effect, static card.

Dark Mode (Abyss):
  Background:   Abyss Card (#1A1832)
  Border:       1px solid rgba(255,255,255,0.06)
  Shadow:       None (use border for edge definition)
  Hover bg:     rgba(75,191,191,0.06)
  Hover border: rgba(75,191,191,0.15)
```

**Anatomy (all card variants share this base):**
```
(1) Media -- optional, full-bleed or inset
(2) Overline -- Subheadline (13px, Bold, uppercase, Sage Deep #6B8F7A)
(3) Title -- Title 2 (22px, Medium) or Title 3 (18px, Medium)
(4) Body -- Body (17px) or Callout (15px), Charcoal
(5) Actions -- space-4 (16px) top padding, 1px Mist divider
```

---

**Variant 2: DEPTH CARD (Data insights, deeper content)**

For AI-generated insights, weekly analysis, premium features. Dark gradient surface communicates "looking into deep water."

```
Background:     linear-gradient(180deg, Ocean Deep #1E4D7A, Ocean Twilight #1E3364)
Border:         1px solid rgba(255,255,255,0.08)
Radius:         16px
Text:           White (#F0EDE8) headline, warm off-white (#D4D0C8) body
Shadow:         0 4px 24px rgba(30,77,122,0.25)
Padding:        space-5 (24px)

Hover (interactive):
  Gradient shifts subtly (parallax depth illusion -- background-position animates)
  Border:       1px solid rgba(126,200,200,0.2)
  Shadow:       0 8px 32px rgba(30,77,122,0.30)

Accent elements on Depth Cards:
  CTA buttons:  Ocean Shallow (#7EC8C8) background, Deep Navy text
  Links:        Ocean Foam (#D4EDE4)
  Overline:     Ocean Shallow at 60%
  AI badge:     AI in Ocean Shallow, 1px border rgba(255,255,255,0.15)

Dark Mode (Abyss):
  Gradient:     linear-gradient(180deg, Ocean Twilight #1E3364, Ocean Abyss #2A1B4E)
  Shadow:       0 4px 24px rgba(42,27,78,0.3)
```

---

**Variant 3: GLASS CARD (Dashboard summaries, ambient info)**

For score summaries, quick metrics, morning briefing. These cards float on the content surface.

```
Background:     backdrop-filter: blur(24px) saturate(1.1)
                Warm Sand (#FAF8F5) at 65% opacity
Border:         0.5px solid rgba(255,255,255,0.25)
Radius:         20px
Shadow:         0 4px 16px rgba(26,31,46,0.06)
Padding:        space-5 (24px)

Hover (interactive):
  Background opacity increases to 80%
  Border:       0.5px solid rgba(126,200,200,0.3)

Fallback (no backdrop-filter support):
  Background:   Warm Sand (#FAF8F5) at 95% opacity, solid

Dark Mode (Abyss):
  Background:   Abyss Card (#1A1832) at 60% opacity
                backdrop-filter: blur(24px) saturate(1.1)
  Border:       0.5px solid rgba(255,255,255,0.10)
  Shadow:       0 4px 16px rgba(0,0,0,0.2)
```

---

**Variant 4: SAND CARD (Warm, editorial, emotional content)**

For somatic exercises, testimonials, journal prompts. Warm and grounded like the shoreline.

```
Background:     Warm Sand (#FAF8F5)
Border:         None
Radius:         16px
Shadow:         0 1px 3px rgba(26,31,46,0.04)
Left accent:    3px solid Dusk Rose (#C4A08A)
Padding:        space-5 (24px)

Hover (interactive):
  Shadow:       0 2px 8px rgba(26,31,46,0.06)
  Transform:    translateY(-1px)

Typography on Sand Cards:
  Title:        Deep Navy, Spectral italic for editorial warmth
  Body:         Charcoal, Spectral regular for long-form readability

Dark Mode (Abyss):
  Background:   Abyss Card (#1A1832)
  Left accent:  3px solid Dusk Rose (dark: #D4B8A4)
  Shadow:       None
```

---

**Compact Modifier (applicable to Shore and Sand):**
```
Padding:       space-3 (12px) instead of space-5 (24px)
Title:         Title 3 (18px) instead of Title 2 (22px)
Body:          Callout (15px) instead of Body (17px)
Min width:     200px
```

**Card Specifications (shared):**
```
Min width:         280px (standard), 200px (compact)
Max width:         Determined by grid column
Media radius:      12px (inset) or flush with card top (full-bleed)
Action area:       space-4 (16px) top padding, separated by 1px divider
```

**Card Accessibility:**
```
- Interactive cards: Wrap in <a> or <button>, or use role="link"
- Card title: Use appropriate heading level
- Media: Always include alt text
- Focus: Entire card is focusable if interactive
- Depth Cards: Ensure text contrast meets 4.5:1 on gradient backgrounds
- Glass Cards: Ensure text remains readable over any background content
```

---

### 3.4.2 Depth Bar (Component)

**Purpose:** Kaivoo's signature brand element -- a 4px horizontal gradient strip that uses the full ocean depth spectrum.

**Specifications:**
```
Height:          4px
Width:           Full-width of container (100%)
Gradient:        linear-gradient(90deg,
                   #D4EDE4 0%,      /* Ocean Foam */
                   #7EC8C8 20%,     /* Ocean Shallow */
                   #3B8C8C 40%,     /* Ocean Surface */
                   #2B6E8A 55%,     /* Ocean Mid */
                   #1E4D7A 70%,     /* Ocean Deep */
                   #1E3364 85%,     /* Ocean Twilight */
                   #2A1B4E 100%     /* Ocean Abyss */
                 )
Direction:       Left to right (Shore to Abyss)
Border-radius:   0 (flush with container edges)
Position:
  Web:           Fixed below header, above content
  App:           Below status bar, above navigation
  Cards:         Bottom accent on hover (2px variant)
Z-index:         101 (above header)

Animation:       Optional shimmer on page load --
                 background-size 200% 100%, animate background-position
                 left to right, 800ms ease-wave, once
                 Disabled for prefers-reduced-motion

Dark Mode (Abyss):
  Same gradient at 80% opacity
  Subtle glow: box-shadow 0 1px 8px rgba(126,200,200,0.15)
```

**Rules:**
```
The Depth Bar NEVER:
  - Appears vertically (always horizontal)
  - Gets thicker than 6px
  - Uses opacity below 60%
  - Appears more than once per viewport
  - Competes with the logo for attention
```

**Accessibility:**
```
- role="presentation" aria-hidden="true" (purely decorative)
- Does not receive focus
```

---

### 3.4.3 Table

**Purpose:** Display structured data for comparison and scanning.

**Specifications:**
```
Header:
  Background:      Cloud (#F3F4F6)
  Font:            Footnote Medium (13px, 500), Deep Navy
  Padding:         space-3 (12px) vertical, space-4 (16px) horizontal
  Border-bottom:   1px solid Mist
  Sort icon:       12px, Slate (inactive), Deep Navy (active)

Row:
  Background:      White (odd), Warm Sand (even -- subtle zebra)
  Padding:         space-3 (12px) vertical, space-4 (16px) horizontal
  Border-bottom:   1px solid Mist
  Font:            Callout (15px), Charcoal
  Hover:           Ocean Foam (#D4EDE4) at 15%
  Selected:        Ocean Foam at 10%, left border 3px Ocean Surface

Footer:
  Padding:         space-4 (16px)
  Font:            Footnote (13px), Slate
  Pagination:      Outlined buttons (32px height), active page filled Ocean Surface

Mobile:            Converts to stacked card layout at <768px

Dark Mode (Abyss):
  Header bg:       Abyss Card (#1A1832)
  Row odd:         Abyss Canvas (#12101E)
  Row even:        Abyss Card (#1A1832)
  Row hover:       rgba(75,191,191,0.06)
  Border:          rgba(255,255,255,0.06)
```

**Accessibility:**
```
- <table> with <thead>, <tbody>, proper <th> scope attributes
- Sortable columns: aria-sort="ascending" / "descending" / "none"
- Row selection: aria-selected on <tr>
- Pagination: <nav> with aria-label="Pagination"
- Caption: <caption> or aria-label on table
```

---

### 3.4.4 List

**Purpose:** Display ordered or grouped items for scanning and selection.

**Variants:** Simple, Rich, Navigational, Actionable

**Specifications:**
```
Item height:       48px (simple), 64px (rich), auto (multi-line)
Padding:           space-4 (16px) horizontal
Divider:           1px solid Mist (between items, not after last)
Hover:             Ocean Foam (#D4EDE4) at 15%
Active:            Ocean Foam at 25%
Selected:          Ocean Foam at 10%, left border 3px Ocean Surface

Dark Mode (Abyss):
  Divider:         rgba(255,255,255,0.06)
  Hover:           rgba(75,191,191,0.06)
  Selected:        rgba(75,191,191,0.08), left border 3px #4BBFBF
```

---

### 3.4.5 Stat / Metric

**Purpose:** Highlight a single key number with label and optional trend.

**Specifications:**
```
Label:             Subheadline (13px, Bold, uppercase, Slate)
Value:             Headline (40px desktop, 28px mobile)
                   v2.0: Inter Variable weight 300, tabular numerals ON
Trend:             Footnote (13px), Success.fg or Error.fg + arrow icon
Container:         Typically inside a Shore Card or Glass Card

Dark Mode (Abyss):
  Label:           rgba(255,255,255,0.5)
  Value:           Warm off-white (#F0EDE8)
  Trend positive:  Success (dark: #4ADE80)
  Trend negative:  Error (dark: #FCA5A5)
```

---

### 3.4.6 Chart Container

**Purpose:** Standardized wrapper for data visualizations. v2.0 updates the color sequence to depth-coded ocean gradient.

**Specifications:**
```
Container:         Shore Card, padding space-5 (24px)
Title:             Title 3 (18px, Medium)
Subtitle:          Footnote (13px, Slate)
Legend:             Footnote (13px), colored dot (8px) + label

Color Sequence v2.0 (depth-coded):
  Series 1:  Ocean Surface (#3B8C8C)
  Series 2:  Ocean Mid (#2B6E8A)
  Series 3:  Ocean Deep (#1E4D7A)
  Series 4:  Ocean Shallow (#7EC8C8)
  Series 5:  Ocean Twilight (#1E3364)
  Series 6:  Dusk Rose (#C4A08A)
  Series 7:  Sunlit Amber (#D4A952)

Area chart fills: Ocean gradient at 15-25% opacity
  Recent data (right) = lighter shades
  Older data (left) = deeper shades

Axis labels:       Caption (11px, Slate)
Grid lines:        1px dashed Mist at 50% opacity
Tooltip:           Deep Navy bg, White text, Callout (15px), radius 8px

Dark Mode (Abyss):
  Container:       Abyss Card background
  Series colors:   Use dark-mode ocean accent values
  Grid lines:      rgba(255,255,255,0.06) dashed
```

**Accessibility:**
```
- role="img" with descriptive aria-label summarizing the data
- Provide data table alternative (hidden, accessible)
- Color + pattern for distinguishing series (not color alone)
- Interactive tooltips: Keyboard navigable via arrow keys
```

---

### 3.4.7 Regulation Score Arc (NEW)

**Purpose:** Kaivoo's hero metric visualization -- a single synthesized score (0-100) representing nervous system regulation state.

**Specifications:**
```
Arc:
  Diameter:        120px (dashboard), 80px (compact), 200px (detail view)
  Stroke:          8px (120px), 6px (80px), 12px (200px)
  Sweep:           270 degrees (from 135 to 405, gap at bottom for breathing room)
  Background track: Mist (#E5E7EB) at 30%
  Foreground fill:  Conic gradient from Ocean Foam to Ocean Shallow to Ocean Surface to Ocean Deep
                    Low scores = light (Foam-Shallow) portion
                    High scores = extend into Deep-Twilight range

Score text:
  Font:            Inter Variable, weight 300
  Size:            48px (200px arc), 32px (120px arc), 24px (80px arc)
  Color:           Deep Navy
  Feature:         Tabular numerals ON

State label:
  Font:            Inter Variable, weight 500, 14px
  Color:           Slate
  States:          "Activated" (0-30), "Recovering" (31-55),
                   "Stabilizing" (56-70), "Regulated" (71-85),
                   "Deep Regulation" (86-100)

Animation:
  On load: Arc fills from 0 to current value, 800ms ease-water
  Reduce motion: Instant fill, no animation

Dark Mode (Abyss):
  Track:           rgba(255,255,255,0.08)
  Fill:            Dark-mode ocean accent gradient
  Score text:      Warm off-white (#F0EDE8)
```

**Accessibility:**
```
- role="img" with aria-label="Regulation score: [value] out of 100, [state]"
- Do not rely on arc color alone for state -- label is always visible
```

---

### 3.4.8 Sparkline (NEW)

**Purpose:** Inline micro-chart for trend indication within cards and summaries.

**Specifications:**
```
Stroke:       1.5px
Color:        Ocean gradient (Ocean Shallow to Ocean Surface)
              or semantic health color for health-specific data
Height:       24px (inline), 32px (card)
Width:        80px (inline), 120px (card)
Fill:         Gradient from stroke color to transparent, 15% opacity
End dot:      4px circle at current value, solid stroke color
Grid:         No visible grid lines
Baseline:     Optional dotted 0.5px Silver rule

Dark Mode (Abyss):
  Stroke:     Dark-mode ocean accent gradient
  End dot:    #4BBFBF
```

**Accessibility:**
```
- role="img" with aria-label describing the trend
  e.g., "Heart rate trend: 65 to 72 bpm over 7 days, increasing"
- Hidden data table accessible to screen readers
```

---

### 3.4.9 Data Card (NEW)

**Purpose:** Standardized container for a single health metric with sparkline.

**Specifications:**
```
Background:        White or Glass treatment (dashboard context)
Border:            None (shadow defines edge)
Shadow:            0 2px 8px rgba(26,31,46,0.05)
Radius:            16px
Padding:           space-5 (20px)
Min width:         160px

Label:             Inter Variable 500, 11px, Slate, uppercase, +0.04em tracking
Value:             Inter Variable 300, 36px (prominent) or 24px (compact), Deep Navy
                   Tabular numerals ON
Trend:             Inter Variable 400, 13px, semantic health color
Sparkline:         80-120px width, 24px height, below trend line

Dark Mode (Abyss):
  Background:      Abyss Card (#1A1832) or Glass on Abyss
  Label:           rgba(255,255,255,0.5)
  Value:           Warm off-white (#F0EDE8)
```

---

### 3.4.10 AI Insight Card (NEW)

**Purpose:** Display AI-generated health insights with transparency indicators.

**Specifications:**
```
Base:              Depth Card variant (gradient background)
AI badge:          "AI" -- Inter Variable 500, 12px
                   Sage Deep (#6B8F7A) on light / Ocean Shallow on dark
                   1px rounded border, 4px radius
Body:              Inter Variable 400, 17px, Warm off-white on Depth gradient
Data source:       Footnote (13px), Ocean Shallow, preceded by chart icon
Actions:           Primary CTA in Ocean Shallow bg / Dark text
                   Secondary as Ghost in Ocean Foam
Expand link:       "Why this suggestion?" -- Footnote, Ocean Foam, underline on hover

Urgency escalation (left-edge accent):
  Routine:         No accent (standard Depth Card)
  Attention:       Left accent shifts to Sunlit Amber (#D4A952)
  Important:       Left accent shifts to Ember (#C75C3A), subtle warm bg tint
  Urgent (health): Semantic Alert Red border, explicit healthcare CTA

  CRITICAL: Only genuine health signals may escalate to Important/Urgent.
  Never use urgency for engagement.

Dark Mode (Abyss):
  Gradient:        Ocean Twilight to Ocean Abyss
  AI badge:        Ocean Shallow (dark: #8AD4D4)
```

**Accessibility:**
```
- aria-label="AI-generated insight" on card
- "Why this suggestion?" must be keyboard-accessible
- Expand content: aria-expanded state managed correctly
```

---
---

## 3.5 Media Components

---

### 3.5.1 Image Container

**Purpose:** Display images with consistent styling and loading behavior.

**Specifications:**
```
Border-radius:     12px (default)
Aspect ratios:     16:9 (landscape), 3:2 (editorial), 1:1 (square), 4:5 (portrait)
Object-fit:        cover (default), contain (for logos/icons)
Background:        Cloud (#F3F4F6) -- shown during load
Loading:           Ocean shimmer skeleton to low-res blur-up to full image
Error state:       Cloud background with centered broken-image icon (Slate, 32px)
Caption:           Footnote (13px, Slate), space-2 (8px) below image

Dark Mode (Abyss):
  Background:      Abyss Card (#1A1832)
  Caption:         rgba(255,255,255,0.5)
```

**Accessibility:**
```
- alt text required on all images (descriptive, not "image of...")
- Decorative images: alt="" with role="presentation"
- Lazy loading: loading="lazy" for below-fold images
```

---

### 3.5.2 Video Player

**Purpose:** Embedded video with custom controls matching the design system.

**Specifications:**
```
Container:         Border-radius 16px, overflow hidden
Aspect ratio:      16:9 (default)
Controls bar:      48px height, Deep Navy at 85% opacity, bottom-aligned
Play button:       48x48px centered overlay
Progress bar:      4px track (White at 30%), fill uses ocean gradient
Time display:      Caption (11px), White
Controls:          Play/pause, volume, progress, fullscreen -- White icons (20px)

Dark Mode (Abyss):
  Controls bar:    Abyss Canvas at 90% opacity
  Progress fill:   Dark-mode ocean gradient
```

**Accessibility:**
```
- Captions track required
- Keyboard: Space = play/pause, arrow keys = seek, M = mute
- aria-label on video element
- Reduce motion: No autoplay
```

---

### 3.5.3 Avatar

**Purpose:** Represent users, contacts, or entities with a profile image or initials.

**Size Scale:**
```
XS   24x24px    Caption (11px)     Inline mentions
SM   32x32px    Footnote (13px)    Comment threads
MD   40x40px    Callout (15px)     List items, nav
LG   56x56px    Body (17px)        Profile cards
XL   80x80px    Title 3 (18px)     Profile headers
2XL  120x120px  Title 1 (28px)     Settings, profiles
```

**Specifications:**
```
Shape:             Circle (border-radius 50%)
Border:            2px solid White (when on colored backgrounds)
Initials bg:       Generated from user name hash, using ocean + brand palette:
                   Ocean Surface, Ocean Mid, Ocean Deep,
                   Sage Mist, Dusk Rose, Storm Blue, Twilight Lavender
Initials text:     White (#FFFFFF)
Status indicator:  10px dot (LG+), 8px dot (MD-), positioned bottom-right
  Online:          Success foreground, 2px White border
  Away:            Warning foreground
  Offline:         Silver
Group:             Overlap by 25% of diameter, max 4 visible + "+N" badge

Dark Mode (Abyss):
  Border:          2px solid Abyss Canvas
  Icon bg:         Abyss Elevated (#232040)
```

**Accessibility:**
```
- alt="[User name]" on image avatars
- Initials: aria-label="[User name]"
- Status: aria-label="[User name], online/away/offline"
```

---
---
---

# 4. Patterns

Patterns combine components into reusable layouts and interaction flows. They encode decisions so that each new screen does not require rethinking from first principles.

---

## 4.1 Page Templates

---

### 4.1.1 Landing Page v2.0

**Structure:**
```
HEADER (Navigation Bar with Depth Bar)
-------------------------------------------------------------

HERO SECTION (UPDATED: Dark background with ocean imagery)
  Background:     Deep Navy (#1A1F2E) with subtle ocean macro photography
                  (abstract water surface, grain texture at 5%)
  Headline:       Display (56-80px, NHG Medium 500, Warm off-white #F0EDE8)
  Lead:           Body (18px, Spectral, Ocean Foam #D4EDE4)
  [Primary CTA]  [Secondary CTA (ghost, white)]
  Glass Card:     App screenshot floating on the ocean imagery
  Depth Bar:      Full-width 4px, glowing on dark background
  Spacing:        space-10 (128px) top, space-9 (96px) bottom

-------------------------------------------------------------

SOCIAL PROOF BAR
  Cloud background, logo strip or metric callouts
  Spacing: space-7 (48px) vertical

-------------------------------------------------------------

FEATURE SECTIONS (x3)
  Alternating: Image left / Text right, then reverse
  7-column / 5-column split (v2.0 asymmetric grid)
  Section labels: Ocean Deep (#1E4D7A) -- not Sage Deep
  Spacing: space-9 (96px) between sections

-------------------------------------------------------------

TESTIMONIALS
  Sand Cards with Spectral italic pull quotes
  3-column grid or single featured quote
  Spacing: space-9 (96px) vertical

-------------------------------------------------------------

FINAL CTA SECTION
  Background: Ocean gradient (diagonal, Shore to Abyss)
  White text, large display size, centered
  [Primary CTA in white bg / Deep Navy text]
  Spacing: space-8 (64px) vertical

-------------------------------------------------------------
FOOTER

Layout: Max 1280px content width, centered
Background rhythm: Dark Hero > Warm Sand > Cloud > Warm Sand > Gradient
```

---

### 4.1.2 Dashboard v2.0

**Structure:**
```
DEPTH BAR (4px, full ocean gradient)
HEADER BAR
  "Good morning, [Name]" (Inter Variable 300, 28px, Deep Navy)
  [Search] [Settings] [Avatar]

-------------------------------------------------------------

SCORE ROW (3 Glass Cards, horizontal scroll mobile)
  [Regulation Score Arc]  [Sleep Quality Arc]  [Readiness Arc]
  Glass Card treatment, space-5 (24px) gap

-------------------------------------------------------------

MAIN CONTENT (7/5 asymmetric split)
  LEFT (7 columns):
    DEPTH CARD -- AI Insight
      "Your nervous system has been increasingly regulated..."
      [Start Morning Reset] [See Full Analysis]

  RIGHT (5 columns):
    SHORE CARD -- Today's Sessions
      List of 3 sessions with icons

-------------------------------------------------------------

FULL-WIDTH SHORE CARD
  WEEKLY TREND
  Area chart with ocean gradient fill, 7 days
  "Regulation Score: +12% vs. last week"

-------------------------------------------------------------

Mobile: Stacks vertically, Glass Cards horizontal-scroll,
        7/5 split becomes full-width stacked
Content padding: space-6 (32px) all sides
Card gap: space-5 (24px)
```

---

### 4.1.3 Settings Page

**Structure:**
```
SIDEBAR (240px) + CONTENT AREA

Sidebar: Section navigation with Ocean Surface active indicators
Content: Max 680px, centered within content area

Setting rows: Label + description (left) + Control (right)
Row padding: space-4 (16px) vertical
Divider: 1px Mist between rows
Section gap: space-7 (48px)

Mobile: Full-width, sidebar becomes back-navigation stack

Dark Mode (Abyss):
  Setting rows on Abyss Canvas
  Dividers: rgba(255,255,255,0.06)
```

---

### 4.1.4 Profile Page

**Structure:**
```
PROFILE HEADER
  [Avatar 2XL] Name (Headline), Title/Bio (Body, Slate)
  [Edit Profile] secondary button
  Spacing: space-7 (48px) bottom

TAB NAVIGATION (horizontal)
  Overview | Activity | Insights | Settings
  1px Mist bottom border, active: Ocean Surface underline

TAB CONTENT AREA
  Max width: 800px centered
```

---

### 4.1.5 Checkout / Multi-Step Flow

**Structure:**
```
HEADER (simplified -- logo + step indicator only)

Step indicator: Connected line (2px Mist), dots (12px)
  Completed: Ocean Surface dot with white checkmark
  Current: Ocean Surface dot, larger (16px)
  Upcoming: Mist dot

STEP CONTENT (max 560px, centered)
  Step Title (Title 1, 28px)
  Step description (Body, Charcoal)
  [Form fields for this step]
  [Back] [Continue -- Primary]

Button placement: Right-aligned, Back (secondary) + Continue (primary)
```

---

## 4.2 User Flows

---

### 4.2.1 Onboarding Flow v2.0

```
1. Welcome Screen (UPDATED)
   - Background: Deep Navy with subtle ocean macro photography
   - Depth Bar glowing at top
   - Display headline: "Welcome to Kaivoo" (NHG Medium 500, White)
   - Spectral body: Brief value proposition (2 sentences max), Ocean Foam
   - [Get Started] primary button
   - Glass Card floating preview of the app

2. Goal Selection (1 of 3 steps)
   - Background: Warm Sand canvas
   - Title 1: "What brings you here?"
   - Shore Card grid: 3-4 selectable cards (single-select)
   - Cards: Icon (32px, Ocean Surface) + Title + 1-line description
   - Selected: Ocean Surface border, Ocean Foam at 8% background

3. Personalization (2 of 3)
   - Title 1: "Let's personalize your experience"
   - 2-3 form fields (name, preferences)
   - Progressive disclosure -- minimum viable info

4. Completion
   - Title 1: "You're all set"
   - Ocean Surface checkmark animation (Ripple effect, 400ms)
   - [Go to Dashboard] primary button
   - No confetti. Calm confirmation.

RULES:
- Maximum 4 steps total
- Skip option always available (link button, bottom)
- Progress indicator visible throughout (uses Ocean Surface dots)
- Each step loads independently
```

---

### 4.2.2 Authentication Flow

```
Sign In:
  Width: 400px max, centered vertically and horizontally
  Background: Warm Sand

  [K icon] (centered, 48px)
  "Sign in to Kaivoo" (Title 1, centered)
  [Email field]
  [Password field] (with show/hide)
  [Sign in] primary button, full-width
  "Forgot password?" (link button)
  --- or ---
  [Continue with Google] outlined
  [Continue with Apple] outlined
  "Don't have an account? Sign up"

  Social buttons: 48px height, full-width, icon (20px) + label
  Error: Inline on field (Error border + message)

Dark Mode (Abyss):
  Background: Abyss Canvas
  Card: Abyss Elevated, centered
  Text: Warm off-white
```

---

### 4.2.3 Search Pattern

```
Trigger:     Search icon in header (icon-only button)
Overlay:     Full-width input at top, Cloud background (Abyss Elevated in dark),
             rest of page darkens (Deep Navy at 20%)
Input:       Large text field (48px), auto-focused, search icon leading
Results:     Below input, max 6 suggestions, divided into groups
Keyboard:    Arrow keys navigate, Enter selects, Escape closes
Animation:   Input slides down 48px, overlay fades, 200ms ease-water
```

---

### 4.2.4 Filter Pattern

```
Desktop: Sidebar or toolbar with checkbox groups, date ranges, dropdowns
Mobile: Bottom sheet triggered by "Filter" button with badge count
Active filters shown as chips with dismiss
"Showing N of M results" (Footnote, Slate)
```

---

### 4.2.5 Empty States v2.0

```
Illustration:  64-120px, Ocean Surface line art (updated from Sage Mist)
Title:         Title 2, Deep Navy -- "No sessions yet"
Body:          Body, Slate, max 2 lines -- encouraging, not apologetic
Action:        [Start a session] primary button

RULES:
- Always include a clear action to resolve the empty state
- Illustration uses ocean-toned line art (Ocean Surface or Ocean Mid)
- Tone is encouraging ("No data yet" not "Sorry, nothing here")
- Never leave a section completely blank

Dark Mode (Abyss):
  Illustration: Ocean Surface dark (#4BBFBF) line art
  Title: Warm off-white
  Body: rgba(255,255,255,0.5)
```

---

## 4.3 Feedback Patterns

---

### 4.3.1 Success Pattern

```
Inline:       Ocean Surface checkmark icon (18px) + "Changes saved" in Success.fg
              Appears inline near the trigger, fades after 3s
Toast:        Success icon + message + optional [View] action, auto-dismiss 5s
Full-page:    Large checkmark (64px, Ripple animation), Title 1, Body, [Continue]

Animation:    Checkmark draws on (stroke animation, 400ms ease-water)
              No confetti. No bouncing. Calm confirmation.
```

### 4.3.2 Error Pattern

```
Field-level:  Error border on field + message below in Error.fg
              Format: "[What went wrong]. [How to fix it]."
Form-level:   Alert banner (Error variant) at top, with anchor links
Page-level:   Full-page error with ocean line-art illustration,
              Title 1, Body, [Try again] + [Go back]
API errors:   Toast for recoverable, Modal for decisions
```

### 4.3.3 Loading Pattern

```
< 300ms:      No indicator (perceived as instant)
300ms-2s:     Spinner (inline or button-level)
2s-10s:       Skeleton screen with ocean shimmer
> 10s:        Tide Loader with progress description
              "Analyzing your data..." to "Almost there..."

RULES:
- Never show a spinner over content the user was reading
- Skeleton screens must match the layout of the content they replace
- Loading states are aria-busy="true"
- Reduce motion: Replace spinners with static "Loading..." text
```

---

## 4.4 Data Visualization Patterns (NEW)

---

### 4.4.1 Chart Color System v2.0

```
v1.0 chart colors were brand-palette-ordered.
v2.0 chart colors are depth-coded:

PRIMARY SERIES:    Ocean gradient (Surface to Deep to Abyss)
  Fills use gradient at 15-25% opacity
  Strokes use mid-gradient points

REGULATION SCORE ARC:
  Gradient from Ocean Foam to Ocean Surface to Ocean Deep
  Low scores = shallow (light) -- you haven't gone deep enough
  High scores = deep (dark blue) -- you've reached depth

AREA CHARTS:
  Fill: Ocean gradient (left to right matching time axis)
  Recent data (right) = lighter (Shallow)
  Older data (left) = deeper (Deep blues)

SPARKLINES:
  1.5px stroke with subtle gradient
  Ocean Shallow at start to Ocean Surface at current
```

---

### 4.4.2 Chart Design Rules

```
- Use arc/ring charts for single-metric scores (Regulation Score)
- Use sparklines for inline trend indication
- Use area charts (filled, 15% opacity) for time-series
- Use horizontal bar charts for comparative data
- AVOID: pie charts, 3D charts, radar/spider charts
- All charts must have a text-based alternative for screen readers
- Data-ink ratio: maximize -- remove every non-data element
- Never use color alone to distinguish data series (add patterns)
```

---

### 4.4.3 Temporal Health Timeline

```
Orientation: Horizontal scrolling
Time axis:   Bottom, Silver, Inter Variable 12px
Data lanes:  Stacked horizontal bands, one per metric
Lane height: 48px minimum
Lane colors: Semantic health palette (each metric gets its semantic color)
Interaction: Tap a point to expand into detail view
Connectors:  0.5px vertical lines connecting simultaneous events
```

---

## 4.5 AI and Voice Patterns (NEW)

---

### 4.5.1 AI Voice Principles

```
The AI within Kaivoo does not have a name, avatar, or personality
distinct from the brand. It IS Kaivoo speaking.

1. EXPLAIN, DON'T PRESCRIBE
   "Your HRV dropped 15% this week. This often correlates with
   increased stress or reduced sleep quality."

2. SHOW THE REASONING
   Always include "Why this suggestion?" expandable link.

3. OFFER OPTIONS, NOT ORDERS
   "You have three options: 2-minute breathing reset,
   5-minute vagal tone session, or skip for now."

4. ACKNOWLEDGE UNCERTAINTY
   "Your data suggests elevated stress, though this could
   also reflect increased physical activity."

5. NEVER DIAGNOSE
   "This pattern is worth discussing with your healthcare provider."

6. MATCH BRAND CALM AUTHORITY
   Short sentences. Active voice. No exclamation points.
   No emojis. No false enthusiasm.
```

---

### 4.5.2 AI Visual Design Language

```
AI CONTENT INDICATOR:
  All AI-generated insights carry a badge: "AI"
  Badge: Inter Variable 500, 12px, Sage Deep text, 1px rounded border
  Positioned top-right of AI content cards

CONVERSATIONAL HEALTH UI:
  Kaivoo messages: Sand Card treatment with Sage Mist left accent
  User responses: Cloud background cards
  Inline sparklines within AI responses use semantic palette
  Voice waveform: Flowing sine wave in Sage Mist

PROGRESSIVE DISCLOSURE:
  Default:        AI recommendation headline + primary action
  First expand:   Supporting data summary (1-2 sentences)
  Second expand:  Full data sources, confidence level, citations
  Always:         "This doesn't sound right" feedback button

ADAPTIVE URGENCY (left-edge accent on AI cards):
  Routine:    Sage Mist accent (standard)
  Attention:  Sunlit Amber (#D4A952)
  Important:  Ember (#C75C3A) + warm bg tint
  Urgent:     Semantic Alert Red + explicit healthcare CTA

  CRITICAL: Only genuine health signals may escalate.
```

---

## 4.6 Neuro-Inclusive Design (NEW)

---

### 4.6.1 Information Density Modes

```
Kaivoo products support three density modes, user-selectable via settings:

FOCUS MODE (Default for new users)
  - Single primary action per screen
  - Maximum 3 data points visible simultaneously
  - Large typography (20px body minimum)
  - Maximum whitespace, minimum chrome
  - All animations disabled by default

STANDARD MODE
  - Multiple actions available per screen
  - Up to 6 data points visible
  - Standard typography (17px body)
  - Balanced whitespace
  - Subtle, purposeful animations (respects OS Reduce Motion)

DETAIL MODE (Opt-in for power users)
  - Dense data dashboards available
  - Up to 12 data points visible
  - Compact typography (14px body minimum)
  - Reduced whitespace
  - Full animation system
```

---

### 4.6.2 Cognitive Load Management

```
- One primary call-to-action per screen
- Progressive disclosure for complex information
- Never auto-navigate or redirect without user action
- Notification escalation: quiet to gentle to prominent
  (never jump to urgent except genuine health emergencies)
- "Quiet Mode" option suppresses all non-critical notifications
- Maximum 7+/-2 items in any navigation or list
```

---

### 4.6.3 Sensory Safety

```
- No color combinations that vibrate (high-saturation complementary pairs)
- No high-contrast flashing (> 3 flashes per second)
- Sound design is opt-in, not default
- Haptic feedback: gentle, breath-rhythm inspired
- Breath-sync animations: static fallback + explicit user opt-in
```

---

## 4.7 Morning Briefing Pattern (NEW)

---

### 4.7.1 Morning Briefing Layout

```
This is Kaivoo's daily ritual interface -- the first thing users see.

GREETING
  "Good morning, [Name]" (Inter Variable 300, 28px, Deep Navy)
  Date below in Footnote, Slate

SCORE ROW (horizontal scroll on mobile)
  Three Glass Cards:
  [Regulation Score Arc]  [Sleep Quality Arc]  [Readiness Arc]
  Each: Glass Card, 120px arc, score + state label

AI INSIGHT (Depth Card, 7-column on desktop)
  AI-generated 2-3 sentence insight about recent patterns
  [Start Morning Reset] primary CTA
  [See Full Analysis] ghost CTA
  "Why this suggestion?" expandable

TODAY'S SESSIONS (Shore Card, 5-column on desktop)
  List of 3 recommended sessions:
  - Morning Reset (breathing)
  - Focus Flow (somatic)
  - Evening Wind-down (rest)
  Navigational list items with time estimates

WEEKLY TREND (Shore Card, full width)
  Area chart with ocean gradient fill, 7 days
  Headline metric: "Regulation Score: +12% vs. last week"

Mobile: Stacks vertically, Glass Cards become horizontal-scroll row
Dark Mode: All cards use Abyss variants, Depth Card uses deeper gradient
```

---
---
---

# 5. Design Tokens

Complete token structure for developer handoff. Tokens are the single source of truth -- never hardcode values in implementation.

## 5.1 Token JSON

```json
{
  "kaivoo": {
    "color": {
      "primary": {
        "deepNavy":       { "value": "#1A1F2E", "type": "color", "description": "Primary brand, text, headings" },
        "warmSand":       { "value": "#FAF8F5", "type": "color", "description": "Primary background, canvas" },
        "sageMist":       { "value": "#8FA89A", "type": "color", "description": "Primary accent, highlights" },
        "sageDeep":       { "value": "#6B8F7A", "type": "color", "description": "Text-accessible Sage variant" },
        "resonanceTeal":  { "value": "#3B8C8C", "type": "color", "description": "CTA, active states" },
        "stormBlue":      { "value": "#4A5E78", "type": "color", "description": "Secondary UI, data viz" },
        "duskRose":       { "value": "#C4A08A", "type": "color", "description": "Emotional warmth, illustration" }
      },
      "secondary": {
        "twilightLavender": { "value": "#9B8EB0", "type": "color", "description": "Night mode, premium" },
        "sunlitAmber":      { "value": "#D4A952", "type": "color", "description": "Energy, morning, activation" },
        "ember":            { "value": "#C75C3A", "type": "color", "description": "Alerts, urgent states" },
        "clarityBlue":      { "value": "#5B7FBF", "type": "color", "description": "Links, informational" }
      },
      "ocean": {
        "foam":      { "value": "#D4EDE4", "type": "color", "description": "Lightest tint, hover backgrounds" },
        "shallow":   { "value": "#7EC8C8", "type": "color", "description": "Light interactive states" },
        "surface":   { "value": "#3B8C8C", "type": "color", "description": "PRIMARY CTA (= Resonance Teal)" },
        "mid":       { "value": "#2B6E8A", "type": "color", "description": "Chart secondary, active nav" },
        "deep":      { "value": "#1E4D7A", "type": "color", "description": "Deep insights, trend headers" },
        "twilight":  { "value": "#1E3364", "type": "color", "description": "Premium features, night transition" },
        "abyss":     { "value": "#2A1B4E", "type": "color", "description": "Night mode accent, deepest" },
        "trench":    { "value": "#1A1232", "type": "color", "description": "Darkest point, dark mode alt" }
      },
      "neutral": {
        "charcoal":   { "value": "#2D3142", "type": "color" },
        "slate":      { "value": "#525868", "type": "color" },
        "silver":     { "value": "#9CA3AF", "type": "color" },
        "mist":       { "value": "#E5E7EB", "type": "color" },
        "cloud":      { "value": "#F3F4F6", "type": "color" }
      },
      "semantic": {
        "success": {
          "foreground": { "value": "#1B7A4E", "type": "color" },
          "background": { "value": "#ECFDF5", "type": "color" },
          "border":     { "value": "#86EFAC", "type": "color" }
        },
        "warning": {
          "foreground": { "value": "#92400E", "type": "color" },
          "background": { "value": "#FFFBEB", "type": "color" },
          "border":     { "value": "#FDE68A", "type": "color" }
        },
        "error": {
          "foreground": { "value": "#991B1B", "type": "color" },
          "background": { "value": "#FEF2F2", "type": "color" },
          "border":     { "value": "#FECACA", "type": "color" }
        },
        "info": {
          "foreground": { "value": "#1E40AF", "type": "color" },
          "background": { "value": "#EFF6FF", "type": "color" },
          "border":     { "value": "#BFDBFE", "type": "color" }
        }
      },
      "health": {
        "optimal":       { "value": "#2D8659", "type": "color", "dark": "#34C759" },
        "elevated":      { "value": "#C49A2A", "type": "color", "dark": "#FFD60A" },
        "alert":         { "value": "#C44B3A", "type": "color", "dark": "#FF6961" },
        "below":         { "value": "#5A54B0", "type": "color", "dark": "#7D7AFF" },
        "sleep":         { "value": "#5A54B0", "type": "color", "dark": "#7D7AFF" },
        "activity":      { "value": "#C4862A", "type": "color", "dark": "#FFB340" },
        "heart":         { "value": "#C44B5E", "type": "color", "dark": "#FF375F" },
        "mindfulness":   { "value": "#8A52B0", "type": "color", "dark": "#BF5AF2" },
        "nervousSystem": { "value": "#3B8C8C", "type": "color", "dark": "#4BBFBF" }
      },
      "dark": {
        "surface": {
          "canvas":     { "value": "#12101E", "type": "color", "description": "Abyss Canvas" },
          "card":       { "value": "#1A1832", "type": "color", "description": "Abyss Card" },
          "elevated":   { "value": "#232040", "type": "color", "description": "Abyss Elevated" },
          "overlay":    { "value": "#2D294E", "type": "color", "description": "Abyss Overlay" }
        },
        "text": {
          "primary":    { "value": "#F0EDE8", "type": "color" },
          "secondary":  { "value": "#9B97A0", "type": "color" },
          "tertiary":   { "value": "#6B6672", "type": "color" },
          "disabled":   { "value": "#4B4656", "type": "color" }
        },
        "ocean": {
          "foam":      { "value": "#A8E4D4", "type": "color" },
          "shallow":   { "value": "#8AD4D4", "type": "color" },
          "surface":   { "value": "#4BBFBF", "type": "color" },
          "deep":      { "value": "#5B9BD5", "type": "color" },
          "twilight":  { "value": "#7B8FD4", "type": "color" },
          "abyss":     { "value": "#9B7BD4", "type": "color" }
        },
        "brand": {
          "sageMist":       { "value": "#A3C4B2", "type": "color" },
          "resonanceTeal":  { "value": "#4BBFBF", "type": "color" },
          "stormBlue":      { "value": "#7B9AC2", "type": "color" },
          "duskRose":       { "value": "#D4B8A4", "type": "color" },
          "ember":          { "value": "#E07A5C", "type": "color" },
          "clarityBlue":    { "value": "#7FA3E0", "type": "color" },
          "sunlitAmber":    { "value": "#E4C070", "type": "color" },
          "twilightLavender": { "value": "#B5A8CC", "type": "color" }
        }
      }
    },

    "gradient": {
      "depthFull":    { "value": "linear-gradient(90deg, #D4EDE4 0%, #7EC8C8 20%, #3B8C8C 40%, #2B6E8A 55%, #1E4D7A 70%, #1E3364 85%, #2A1B4E 100%)", "type": "gradient" },
      "depthSurface": { "value": "linear-gradient(90deg, #D4EDE4 0%, #7EC8C8 40%, #3B8C8C 100%)", "type": "gradient" },
      "depthDeep":    { "value": "linear-gradient(90deg, #3B8C8C 0%, #1E4D7A 50%, #2A1B4E 100%)", "type": "gradient" },
      "depthAbyss":   { "value": "linear-gradient(90deg, #1E4D7A 0%, #1E3364 40%, #2A1B4E 70%, #1A1232 100%)", "type": "gradient" },
      "ripple":       { "value": "radial-gradient(circle, rgba(126,200,200,0.12) 0%, rgba(59,140,140,0.04) 40%, transparent 70%)", "type": "gradient" },
      "scoreArc":     { "value": "conic-gradient(from 225deg, #D4EDE4, #7EC8C8, #3B8C8C, #1E4D7A)", "type": "gradient" },
      "chartFill":    { "value": "linear-gradient(180deg, rgba(59,140,140,0.20) 0%, rgba(30,77,122,0.05) 100%)", "type": "gradient" }
    },

    "glass": {
      "blur":         { "value": "24px", "type": "dimension" },
      "saturate":     { "value": "1.1", "type": "number" },
      "bgOpacity":    { "value": "0.65", "type": "number" },
      "borderColor":  { "value": "rgba(255,255,255,0.25)", "type": "color" },
      "borderWidth":  { "value": "0.5px", "type": "dimension" },
      "radius":       { "value": "20px", "type": "dimension" }
    },

    "typography": {
      "fontFamily": {
        "brand":     { "value": "'Neue Haas Grotesk Display Pro', 'Helvetica Neue', Helvetica, Arial, system-ui, sans-serif" },
        "editorial": { "value": "'Spectral', Georgia, 'Times New Roman', serif" },
        "product":   { "value": "'Inter Variable', 'Inter', system-ui, -apple-system, sans-serif" }
      },
      "fontSize": {
        "display":      { "value": "56px" },
        "headline":     { "value": "40px" },
        "title1":       { "value": "28px" },
        "title2":       { "value": "22px" },
        "title3":       { "value": "18px" },
        "body":         { "value": "17px" },
        "callout":      { "value": "15px" },
        "subheadline":  { "value": "13px" },
        "footnote":     { "value": "13px" },
        "caption":      { "value": "11px" }
      }
    },

    "spacing": {
      "1":  { "value": "4px" },
      "2":  { "value": "8px" },
      "3":  { "value": "12px" },
      "4":  { "value": "16px" },
      "5":  { "value": "24px" },
      "6":  { "value": "32px" },
      "7":  { "value": "48px" },
      "8":  { "value": "64px" },
      "9":  { "value": "96px" },
      "10": { "value": "128px" }
    },

    "borderRadius": {
      "xs":    { "value": "4px" },
      "sm":    { "value": "6px" },
      "md":    { "value": "8px" },
      "lg":    { "value": "10px" },
      "xl":    { "value": "12px" },
      "2xl":   { "value": "16px" },
      "3xl":   { "value": "20px", "description": "Glass components" },
      "full":  { "value": "9999px" }
    },

    "shadow": {
      "xs":  { "value": "0 1px 2px rgba(26,31,46,0.04)" },
      "sm":  { "value": "0 1px 3px rgba(26,31,46,0.06)" },
      "md":  { "value": "0 4px 12px rgba(26,31,46,0.08)" },
      "lg":  { "value": "0 8px 24px rgba(26,31,46,0.08), 0 2px 8px rgba(26,31,46,0.04)" },
      "xl":  { "value": "0 24px 48px rgba(26,31,46,0.12), 0 8px 16px rgba(26,31,46,0.06)" },
      "ocean":  { "value": "0 4px 16px rgba(59,140,140,0.10)", "description": "Ocean-tinted card hover" },
      "depth":  { "value": "0 4px 24px rgba(30,77,122,0.25)", "description": "Depth Card" },
      "glow":   { "value": "0 1px 8px rgba(126,200,200,0.15)", "description": "Depth Bar dark mode glow" }
    },

    "animation": {
      "duration": {
        "instant":   { "value": "100ms" },
        "fast":      { "value": "150ms" },
        "normal":    { "value": "200ms" },
        "moderate":  { "value": "250ms" },
        "slow":      { "value": "300ms" },
        "gentle":    { "value": "400ms" },
        "ripple":    { "value": "300ms", "description": "Hover ripple" },
        "wave":      { "value": "800ms", "description": "Wave/loading cycle" },
        "tide":      { "value": "1200ms", "description": "Full tide cycle" },
        "current":   { "value": "250ms", "description": "Page transitions" }
      },
      "easing": {
        "default":   { "value": "cubic-bezier(0.4, 0, 0.2, 1)" },
        "easeOut":   { "value": "cubic-bezier(0.0, 0, 0.2, 1)" },
        "easeIn":    { "value": "cubic-bezier(0.4, 0, 1, 1)" },
        "spring":    { "value": "cubic-bezier(0.34, 1.56, 0.64, 1)" },
        "water":     { "value": "cubic-bezier(0.25, 0.1, 0.25, 1.0)", "description": "Organic ease" },
        "wave":      { "value": "cubic-bezier(0.45, 0.05, 0.55, 0.95)", "description": "Oscillating" },
        "dive":      { "value": "cubic-bezier(0.4, 0, 0.2, 1)", "description": "Going deeper" },
        "surface":   { "value": "cubic-bezier(0.0, 0, 0.2, 1)", "description": "Coming up" }
      }
    },

    "breakpoint": {
      "sm":   { "value": "375px" },
      "md":   { "value": "768px" },
      "lg":   { "value": "1024px" },
      "xl":   { "value": "1440px" },
      "2xl":  { "value": "1920px" }
    },

    "grid": {
      "desktop":    { "columns": 12, "gutter": "24px", "margin": "80px", "maxWidth": "1280px" },
      "asymmetric": { "primary": 7, "secondary": 5, "description": "7/5 split for dashboards" },
      "tablet":     { "columns": 8, "gutter": "20px", "margin": "40px" },
      "mobile":     { "columns": 4, "gutter": "16px", "margin": "20px" }
    },

    "zIndex": {
      "dropdown":   { "value": "200" },
      "sticky":     { "value": "300" },
      "header":     { "value": "100" },
      "depthBar":   { "value": "101" },
      "overlay":    { "value": "900" },
      "toast":      { "value": "1000" },
      "modal":      { "value": "1100" },
      "tooltip":    { "value": "1200" }
    }
  }
}
```

---
---

## 5.2 CSS Variable Mapping

```css
:root {
  /* Colors -- Primary */
  --color-deep-navy: #1A1F2E;
  --color-warm-sand: #FAF8F5;
  --color-sage-mist: #8FA89A;
  --color-sage-deep: #6B8F7A;
  --color-resonance-teal: #3B8C8C;
  --color-storm-blue: #4A5E78;
  --color-dusk-rose: #C4A08A;

  /* Colors -- Secondary */
  --color-twilight-lavender: #9B8EB0;
  --color-sunlit-amber: #D4A952;
  --color-ember: #C75C3A;
  --color-clarity-blue: #5B7FBF;

  /* Colors -- Ocean Gradient System (NEW v2.0) */
  --color-ocean-foam: #D4EDE4;
  --color-ocean-shallow: #7EC8C8;
  --color-ocean-surface: #3B8C8C;
  --color-ocean-mid: #2B6E8A;
  --color-ocean-deep: #1E4D7A;
  --color-ocean-twilight: #1E3364;
  --color-ocean-abyss: #2A1B4E;
  --color-ocean-trench: #1A1232;

  /* Colors -- Neutral */
  --color-charcoal: #2D3142;
  --color-slate: #525868;
  --color-silver: #9CA3AF;
  --color-mist: #E5E7EB;
  --color-cloud: #F3F4F6;

  /* Gradients (NEW v2.0) */
  --gradient-depth-full: linear-gradient(90deg, #D4EDE4 0%, #7EC8C8 20%, #3B8C8C 40%, #2B6E8A 55%, #1E4D7A 70%, #1E3364 85%, #2A1B4E 100%);
  --gradient-depth-surface: linear-gradient(90deg, #D4EDE4 0%, #7EC8C8 40%, #3B8C8C 100%);
  --gradient-depth-deep: linear-gradient(90deg, #3B8C8C 0%, #1E4D7A 50%, #2A1B4E 100%);
  --gradient-depth-abyss: linear-gradient(90deg, #1E4D7A 0%, #1E3364 40%, #2A1B4E 70%, #1A1232 100%);
  --gradient-ripple: radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(126,200,200,0.12) 0%, rgba(59,140,140,0.04) 40%, transparent 70%);
  --gradient-score-arc: conic-gradient(from 225deg, #D4EDE4, #7EC8C8, #3B8C8C, #1E4D7A);
  --gradient-chart-fill: linear-gradient(180deg, rgba(59,140,140,0.20) 0%, rgba(30,77,122,0.05) 100%);

  /* Glass-Morphism (NEW v2.0) */
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
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 24px;
  --space-6: 32px;
  --space-7: 48px;
  --space-8: 64px;
  --space-9: 96px;
  --space-10: 128px;

  /* Border Radius */
  --radius-xs: 4px;
  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 10px;
  --radius-xl: 12px;
  --radius-2xl: 16px;
  --radius-3xl: 20px;
  --radius-full: 9999px;

  /* Shadows */
  --shadow-xs: 0 1px 2px rgba(26,31,46,0.04);
  --shadow-sm: 0 1px 3px rgba(26,31,46,0.06);
  --shadow-md: 0 4px 12px rgba(26,31,46,0.08);
  --shadow-lg: 0 8px 24px rgba(26,31,46,0.08), 0 2px 8px rgba(26,31,46,0.04);
  --shadow-xl: 0 24px 48px rgba(26,31,46,0.12), 0 8px 16px rgba(26,31,46,0.06);
  --shadow-ocean: 0 4px 16px rgba(59,140,140,0.10);
  --shadow-depth: 0 4px 24px rgba(30,77,122,0.25);
  --shadow-glow: 0 1px 8px rgba(126,200,200,0.15);

  /* Animation -- Ocean Motion (NEW v2.0) */
  --ease-water: cubic-bezier(0.25, 0.1, 0.25, 1.0);
  --ease-wave: cubic-bezier(0.45, 0.05, 0.55, 0.95);
  --ease-dive: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-surface: cubic-bezier(0.0, 0, 0.2, 1);
  --ease-default: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);

  --duration-instant: 100ms;
  --duration-fast: 150ms;
  --duration-normal: 200ms;
  --duration-moderate: 250ms;
  --duration-slow: 300ms;
  --duration-gentle: 400ms;
  --duration-ripple: 300ms;
  --duration-wave: 800ms;
  --duration-tide: 1200ms;
  --duration-current: 250ms;

  /* Z-Index */
  --z-header: 100;
  --z-depth-bar: 101;
  --z-dropdown: 200;
  --z-sticky: 300;
  --z-overlay: 900;
  --z-toast: 1000;
  --z-modal: 1100;
  --z-tooltip: 1200;
}

/* Dark Mode: "The Abyss" */
@media (prefers-color-scheme: dark) {
  :root {
    /* Abyss Surfaces */
    --color-surface-canvas: #12101E;
    --color-surface-card: #1A1832;
    --color-surface-elevated: #232040;
    --color-surface-overlay: #2D294E;

    /* Text */
    --color-text-primary: #F0EDE8;
    --color-text-secondary: #9B97A0;
    --color-text-tertiary: #6B6672;
    --color-text-disabled: #4B4656;

    /* Ocean Accents (brightened for dark) */
    --color-ocean-foam: #A8E4D4;
    --color-ocean-shallow: #8AD4D4;
    --color-ocean-surface: #4BBFBF;
    --color-ocean-deep: #5B9BD5;
    --color-ocean-twilight: #7B8FD4;
    --color-ocean-abyss: #9B7BD4;

    /* Brand Colors (brightened) */
    --color-sage-mist: #A3C4B2;
    --color-resonance-teal: #4BBFBF;
    --color-storm-blue: #7B9AC2;
    --color-dusk-rose: #D4B8A4;
    --color-ember: #E07A5C;
    --color-clarity-blue: #7FA3E0;
    --color-sunlit-amber: #E4C070;
    --color-twilight-lavender: #B5A8CC;
  }
}
```

---
---
---

# 6. Documentation

---

## 6.1 Do's and Don'ts

Thirteen rules that govern every design decision. When in doubt, return here.

---

### 1. Whitespace

```
DO: Use generous whitespace between content blocks.
    Let elements breathe. Space-5 (24px) minimum between
    unrelated elements. Space-7 (48px) between page sections.

DON'T: Fill every pixel with content.
       A page crammed with cards, charts, and text overwhelms
       the nervous system -- the exact opposite of our brand promise.
```

---

### 2. Color Restraint

```
DO: Use the 50/20/10/10/10 ratio (v2.0).
    Deep Navy + Warm Sand (50%), Ocean Gradient (20%),
    Sand Accents (10%), CTA Teal (10%), Remaining (10%).

DON'T: Use multiple accent colors on one screen.
       Pick one accent per context and let it carry the weight.
```

---

### 3. Typography Hierarchy

```
DO: Establish a clear reading order with type scale.
    Display to Headline to Title to Body creates natural visual flow.

DON'T: Use bold text liberally to create emphasis.
       Use weight sparingly -- Medium for headings, Regular for body.
```

---

### 4. Button Hierarchy

```
DO: Use one Primary button per viewport.
    "Save changes" is Primary. "Cancel" is Secondary. "Delete" is Destructive.

DON'T: Place two Primary buttons side by side.
```

---

### 5. Feedback Clarity

```
DO: Write error messages that explain AND resolve.
    "This email is already registered. Sign in instead?"

DON'T: Use generic or technical error messages.
       "Error 422" means nothing to a user.
```

---

### 6. Motion and Animation

```
DO: Use animation to provide feedback and show relationships.
    Water-inspired motion reinforces the brand metaphor.

DON'T: Add decorative animations.
       If someone comments "nice animation," it's too much.
```

---

### 7. Accessibility First

```
DO: Design for accessibility from the start.
    Every component has focus states, ARIA labels, keyboard navigation.

DON'T: Use color alone to communicate meaning.
       Always pair color with text, icons, or patterns.
```

---

### 8. Content Density

```
DO: Show one idea per section, one action per moment.

DON'T: Overload screens with options and information.
       Prioritize, then use progressive disclosure.
```

---

### 9. Consistency Over Creativity

```
DO: Use established components for established patterns.

DON'T: Create custom one-off components for novel situations.
```

---

### 10. Dark Mode Intentionality

```
DO: Treat "The Abyss" dark mode as a re-expression, not an inversion.
    Purple-navy surfaces, warm off-white text, brightened accents.

DON'T: Simply swap foreground and background colors.
       The Abyss has its own surface hierarchy and personality.
```

---

### 11. Gradient Restraint (NEW v2.0)

```
DO: Use the ocean gradient as a system -- interaction states,
    data depth, navigation depth, and the Depth Bar.

DON'T: Use the gradient as a background wash.
       The gradient is NEVER wallpaper. It is an intentional,
       functional design element applied in specific contexts.
       A stripe is deliberate. A wash is decorative.
```

---

### 12. Glass Intentionality (NEW v2.0)

```
DO: Use glass-morphism for summary/dashboard screens,
    ambient info, and floating elements where visual
    sophistication enhances the experience.

DON'T: Use glass on data entry forms, long-form text,
       clinical displays, chart areas, or alerts.
       Legibility and cognitive accessibility always win.
       Focus Mode = opaque surfaces ONLY.
```

---

### 13. Anti-Gamification (NEW v2.0)

```
DO: Show progress through meaningful health data trends.
    "Your regulation consistency this week: remarkable."

DON'T: Use streaks, points, badges, or leaderboards.
       Gamification creates anxiety when broken --
       antithetical to Kaivoo's mission. Progress is shown
       through depth of data insight, not game mechanics.
```

---
---

## 6.2 Implementation Guide for Developers

### 6.2.1 Setup

```
1. INSTALL TOKENS
   Import the design token JSON into your project. Use a token
   translation tool (Style Dictionary, Tokens Studio) to generate
   platform-specific variables:
   - CSS custom properties for web
   - Swift/Kotlin constants for native
   - Tailwind config for Tailwind CSS projects

2. INSTALL FONTS
   Brand layer: Neue Haas Grotesk Display Pro (Monotype license)
   Editorial:   Spectral (Google Fonts, open source)
   Product UI:  Inter Variable (open source, rsms.me/inter)

   Load via @font-face with woff2 format. Subset to Latin.

3. SET DEFAULTS
   - html { font-family: var(--font-product); color: var(--color-charcoal); }
   - body { background: var(--color-warm-sand); }
   - * { box-sizing: border-box; }
   - No margin/padding resets -- use component-level spacing only.
```

### 6.2.2 Component Architecture Rules

```
1. COMPOSITION OVER INHERITANCE
   Build complex components from primitive ones.

2. TOKEN-ONLY VALUES
   Never hardcode colors, spacing, radii, or shadows.

3. RESPONSIVE BY DEFAULT
   Test at 375px, 768px, and 1440px.

4. ACCESSIBLE BY DEFAULT
   ARIA attributes, keyboard handlers, and focus management
   are part of the component, not added later.

5. STATE MANAGEMENT
   Every interactive component handles: default, hover, active,
   focused, disabled, loading, and error states.

6. OCEAN MOTION
   Use --ease-water for general transitions, --ease-dive for
   entering deeper content, --ease-surface for coming back up.
```

---
---

## 6.3 Accessibility Reference

### 6.3.1 WCAG 2.2 Level AA Compliance (Minimum)

```
Perceivable:
  - Text contrast: 4.5:1 minimum (7:1 for AAA, our target)
  - Non-text contrast: 3:1 minimum
  - Text resizable to 200% without loss
  - No content conveyed by color alone
  - Captions for all video
  - Alt text for all meaningful images

Operable:
  - All functionality available via keyboard
  - No keyboard traps
  - Focus order matches visual order
  - Focus indicators visible (2px Resonance Teal, 2px offset)
  - Touch targets minimum 44x44px (48x48px recommended)
  - No flashing more than 3 times per second

Understandable:
  - Language declared on page
  - Consistent navigation
  - Error identification with suggestions
  - Labels on all form inputs

Robust:
  - Valid HTML structure
  - ARIA roles used correctly
  - Status messages announced without focus change
```

### 6.3.2 Kaivoo-Specific Accessibility Standards

```
1. REDUCED MOTION
   - Respect prefers-reduced-motion
   - Replace all ocean animations with instant state changes
   - Never autoplay video or animation
   - Provide toggle in app settings

2. COGNITIVE LOAD
   - Maximum 7+/-2 items in any navigation or list
   - Progressive disclosure for complex forms
   - One primary action per screen
   - Clear, jargon-free language (8th-grade reading level)

3. FOCUS MANAGEMENT
   - Visible focus ring on all interactive elements
   - Focus trapped in modals and drawers
   - Focus returned to trigger on close
   - Skip navigation link as first element

4. SCREEN READER SUPPORT
   - Semantic HTML (no div-soup)
   - Landmark regions: header, nav, main, aside, footer
   - Heading hierarchy: H1 to H2 to H3 (never skip levels)
   - Live regions for dynamic content

5. COLOR INDEPENDENCE
   - Icons + color for all status indicators
   - Patterns available for chart data series
   - Focus indicators use both color and outline weight

6. NEURO-INCLUSIVE (NEW v2.0)
   - Three density modes (Focus, Standard, Detail)
   - No vibrating color combinations
   - Sound design opt-in only
   - Breath-sync animations require explicit opt-in
```

---
---

## 6.4 Color Contrast Compliance

```
KAIVOO COLOR CONTRAST -- WCAG 2.2 AA

Text/Background Combination        Contrast Ratio   Pass/Fail
----------------------------------------------------------------
Deep Navy on Warm Sand              15.2:1           AAA
Charcoal on Warm Sand               12.8:1           AAA
Slate on Warm Sand                   5.7:1           AA
Sage Deep on Warm Sand               4.5:1           AA
Sage Mist on Warm Sand               3.1:1           FAIL*
Warm off-white on Deep Navy         15.2:1           AAA
Ocean Surface on Warm Sand           4.6:1           AA (large)
Ocean Surface on White               4.9:1           AA
Ocean Deep on Warm Sand              7.8:1           AAA
Warm off-white on Abyss Canvas      13.8:1           AAA
Ocean Surface dark on Abyss Canvas   8.2:1           AAA

* Sage Mist (#8FA89A) on Warm Sand FAILS for body text.
  Use Sage Deep (#6B8F7A) for any text on light backgrounds.
  Sage Mist is valid for decorative elements, large display
  text (18pt+), and non-critical UI accents only.
```

---
---
---

# 7. Appendix

---

## 7.1 Component Checklist

All 42 components documented in this system:

```
NAVIGATION (4)
  * Header / Navigation Bar (with Depth Bar)
  * Tab Bar (Bottom Navigation)
  * Sidebar Navigation
  * Breadcrumbs

INPUT (7)
  * Button (6 variants: Primary, Secondary, Tertiary, Destructive, Icon-Only, Link)
  * Text Field (5 variants: Standard, Password, Search, Textarea, Number)
  * Dropdown / Select
  * Toggle Switch
  * Checkbox
  * Radio Button
  * Slider / Range

FEEDBACK (5)
  * Alert / Banner
  * Toast / Snackbar (Bubble animation)
  * Modal / Dialog (Standard + Glass variants)
  * Progress Indicators (Linear + Circular + Tide Loader)
  * Skeleton Screen (Ocean shimmer)

DATA DISPLAY (10)
  * Card System v2.0 (4 variants: Shore, Depth, Glass, Sand + Compact modifier)
  * Depth Bar
  * Table
  * List (4 variants: Simple, Rich, Navigational, Actionable)
  * Stat / Metric
  * Chart Container (depth-coded colors)
  * Regulation Score Arc (NEW)
  * Sparkline (NEW)
  * Data Card (NEW)
  * AI Insight Card (NEW)

MEDIA (3)
  * Image Container
  * Video Player
  * Avatar (3 variants: Image, Initials, Icon)

PATTERNS (12)
  * Landing Page v2.0 template
  * Dashboard v2.0 template (7/5 asymmetric)
  * Settings Page template
  * Profile Page template
  * Checkout / Multi-Step Flow template
  * Onboarding flow v2.0
  * Authentication flow
  * Search + Filter + Empty State patterns
  * Data Visualization Patterns (NEW)
  * AI and Voice Patterns (NEW)
  * Neuro-Inclusive Design modes (NEW)
  * Morning Briefing Pattern (NEW)
```

---

## 7.2 Migration Guide: v1.0 to v2.0

### Color System Changes

```
WHAT CHANGED:
  1. Ocean Gradient System added (8 new tokens: ocean-foam through ocean-trench)
  2. Dark mode surfaces: v1.0 blue-grey replaced by v2.0 purple-navy (Abyss)
  3. Color ratio: 60/15/15/10 becomes 50/20/10/10/10
  4. Sage Deep (#6B8F7A) added for accessible text on light backgrounds

TOKEN MIGRATION:
  v1.0 --color-surface-canvas: #0F1117  -->  v2.0: #12101E  (Abyss Canvas)
  v1.0 --color-surface-card: #1A1F2E    -->  v2.0: #1A1832  (Abyss Card)
  v1.0 --color-surface-elevated: #242938 -->  v2.0: #232040  (Abyss Elevated)
  v1.0 --color-surface-overlay: #2D3142  -->  v2.0: #2D294E  (Abyss Overlay)

NOTE: ocean-surface (#3B8C8C) is an explicit alias of resonanceTeal.
      Use ocean-* tokens in gradient/depth contexts.
      Use resonanceTeal for CTA role.
```

### Card System Changes

```
v1.0 VARIANT          v2.0 EQUIVALENT          NOTES
Default               Shore Card               Same role, updated hover states
Elevated              Shore Card               Shadow absorbed into Shore
Interactive           Shore Card (interactive)  Ocean Foam hover replaces Silver
Outlined              Shore Card               Border style maintained
Compact               Shore/Sand + Compact     Now a modifier, not a variant

NEW VARIANTS:
  Depth Card -- for AI insights, deep content (dark gradient)
  Glass Card -- for dashboard summaries (frosted glass)
  Sand Card  -- for editorial, emotional content (warm, Dusk Rose accent)
```

### Typography Changes

```
DISPLAY WEIGHT:     Light 300  -->  Medium 500
BODY MINIMUM:       16px  -->  17px
LETTER-SPACING:     -0.02em  -->  -0.025em (display only)
NEW FONT:           Inter Variable added for product UI layer
NEW SCALE:          Product UI type scale added (H1-H3, Body, Data Value, etc.)
```

### Component Changes

```
UPDATED:
  Header -- now includes 4px Depth Bar
  Buttons -- Primary hover has ocean shimmer effect
  Toast -- uses Bubble animation (rising from below)
  Modal -- Glass variant added
  Progress -- ocean gradient fill, Tide Loader added
  Skeleton -- ocean gradient shimmer
  All hover states -- Ocean Foam tint replaces Cloud/Silver

NEW COMPONENTS:
  Depth Bar (3.4.2)
  Regulation Score Arc (3.4.7)
  Sparkline (3.4.8)
  Data Card (3.4.9)
  AI Insight Card (3.4.10)

REMOVED:
  None -- all v1.0 components carried forward (renamed/evolved)
```

### Motion System Changes

```
NEW EASING CURVES:
  --ease-water, --ease-wave, --ease-dive, --ease-surface

NEW NAMED INTERACTIONS:
  Ripple, Depth Dive, Current, Tide, Swell, Bubble

ALL ANIMATIONS have reduce-motion fallbacks documented inline.
```

---
---

ENDMARKER_REPLACE
