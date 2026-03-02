# Error Monitoring Standards

**Source:** Extracted from Agent 7 Code Reviewer spec, Section 10
**Parent:** [Agent-7-Code-Reviewer.md](../Agent-7-Code-Reviewer.md)

---

## 10.1 Unhandled Exception Rules

```
RULE: ErrorBoundary must wrap:
  1. The entire app root (catch-all)
  2. Each page route (page-level recovery)
  3. Each widget on the dashboard (widget-level isolation)

RULE: ErrorBoundary fallback must include:
  - Friendly error message (not technical)
  - "Try Again" button (reset error state)
  - "Reload Page" button (full refresh)
  - Error details hidden behind expandable section (dev only)
```

## 10.2 Silent Failure Detection

```
CHECK: Are all async operations in try/catch?
CHECK: Do catch blocks notify the user (not just console.error)?
CHECK: Are promise rejections handled (no unhandledrejection)?
CHECK: Do optimistic updates roll back on failure?
CHECK: Are network timeouts handled gracefully?
```

## 10.3 Edge Cases

```
CHECK: What happens when:
  - User has 0 tasks/entries/routines? (empty states)
  - User has 10,000+ items? (pagination/virtualization)
  - Network drops mid-save? (retry/rollback)
  - User opens app in two tabs? (state sync)
  - User's session expires mid-action? (re-auth flow)
  - Database returns null for a required field? (null safety)
  - Date is in a different timezone? (UTC consistency)
```
