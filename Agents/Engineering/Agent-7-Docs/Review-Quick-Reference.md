# Review Checklist (Quick Reference)

**Source:** Extracted from Agent 7 Code Reviewer spec, Appendix B
**Parent:** [Agent-7-Code-Reviewer.md](../Agent-7-Code-Reviewer.md)

---

```
BEFORE EVERY PR:

□ Performance
  □ No entire-store subscriptions
  □ useMemo/useCallback have stable dependencies
  □ No inline objects in JSX props
  □ Components in lists are memoized
  □ No useEffect missing cleanup

□ Security
  □ All queries filter by user_id
  □ All update/delete checks ownership
  □ No secrets in client code
  □ Error messages sanitized
  □ Inputs validated with Zod

□ Code Quality
  □ No `any` types without TODO comment
  □ No duplicated logic (3+ places)
  □ Component under 400 lines
  □ No dead code or commented-out code
  □ Consistent naming conventions

□ Bundle
  □ New page uses React.lazy()
  □ Heavy imports are code-split
  □ No import * from large libraries

□ Database
  □ Queries use .eq('user_id', userId)
  □ Queries use .select() with specific columns
  □ Queries have .order() and .limit()
  □ New query patterns have supporting indexes

□ Accessibility
  □ Interactive elements are keyboard accessible
  □ Icon buttons have aria-label
  □ Form inputs have associated labels
  □ Loading states announced to screen readers
  □ Color contrast meets WCAG AA

□ Error Handling
  □ No silent catch blocks
  □ Optimistic updates have rollback
  □ User sees error notification on failure
  □ ErrorBoundary covers new components
```
