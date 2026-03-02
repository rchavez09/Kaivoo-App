# Accessibility Standards

**Source:** Extracted from Agent 7 Code Reviewer spec, Section 9
**Parent:** [Agent-7-Code-Reviewer.md](../Agent-7-Code-Reviewer.md)

---

## 9.1 Hard Requirements (WCAG AA)

```
RULE: All interactive elements must be keyboard accessible.
  - Buttons: focusable + Enter/Space to activate
  - Links: focusable + Enter to follow
  - Custom controls: proper role + aria attributes + keyboard support

RULE: All images must have alt text.
  - Decorative images: alt=""
  - Informative images: descriptive alt text

RULE: Color contrast must meet WCAG AA:
  - Normal text: 4.5:1 contrast ratio
  - Large text (18px+ or 14px+ bold): 3:1 contrast ratio
  - UI components: 3:1 against adjacent colors

RULE: All form inputs must have associated labels.
  - Use htmlFor on <Label> matching id on <Input>
  - Or use aria-label for icon-only inputs

RULE: Icon-only buttons MUST have aria-label.
```

## 9.2 Dynamic Content

```
RULE: Loading/saving states must be announced to screen readers.
  <div aria-live="polite" className="sr-only">
    {isLoading && 'Loading...'}
    {isSaving && 'Saving...'}
  </div>

RULE: Route changes must manage focus.
  - On navigation, focus should move to the main content area
  - Modals/dialogs must trap focus and return focus on close

RULE: Error messages must be associated with their inputs.
  <Input aria-describedby="email-error" />
  <span id="email-error" role="alert">Invalid email</span>
```

## 9.3 Motion

```
RULE: All animations must respect prefers-reduced-motion.
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      transition-duration: 0.01ms !important;
    }
  }
```
