# Accessibility Checklist

**Source:** Extracted from Agent 1 (Senior UI Designer) during Design Agent merge — Section 5 (Accessibility Compliance)
**Parent:** [Agent-Design.md](../Agent-Design.md)

---

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
| Deep Navy on Warm Sand | 16.2:1 | AAA |
| Charcoal on Warm Sand | 14.1:1 | AAA |
| Resonance Teal on Warm Sand | 5.4:1 | AAA |
| White on Resonance Teal | 4.6:1 | AA |
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
