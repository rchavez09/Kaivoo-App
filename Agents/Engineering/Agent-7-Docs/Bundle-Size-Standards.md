# Bundle Size Standards

**Source:** Extracted from Agent 7 Code Reviewer spec, Section 6
**Parent:** [Agent-7-Code-Reviewer.md](../Agent-7-Code-Reviewer.md)

---

## 6.1 Size Targets

```
BUDGET:
  Initial JS (gzipped):     < 200 KB
  Initial CSS (gzipped):    < 20 KB
  Per-route chunk (gzipped): < 100 KB
  Total app (gzipped):       < 500 KB

CURRENT (as of Sprint 0):
  Initial JS:  482 KB (gzipped) — 2.4x over budget
  Initial CSS: 14.7 KB (gzipped) — under budget ✓
```

## 6.2 Code Splitting Rules

```
RULE: Every page route must use React.lazy() + Suspense.

RULE: Libraries used on only 1-2 pages must be in separate chunks:
  - recharts → vendor-recharts chunk (Insights only)
  - @tiptap/* → vendor-tiptap chunk (Journal only)

RULE: vite.config.ts must have manualChunks configuration.
```

## 6.3 Import Hygiene

```
CHECK: Are imports tree-shakeable?

ANTI-PATTERN:
  import * as RechartsPrimitive from 'recharts';  // Imports everything

CORRECT PATTERN:
  import { BarChart, XAxis, YAxis, Tooltip } from 'recharts';  // Tree-shakes

CHECK: Are heavy dependencies lazy-loaded?

RULE: If a dependency is > 50 KB gzipped and used on < 3 pages,
it must be dynamically imported or in a separate chunk.
```
