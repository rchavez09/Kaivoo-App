# Caching Strategy

**Source:** Extracted from Agent 7 Code Reviewer spec, Section 8
**Parent:** [Agent-7-Code-Reviewer.md](../Agent-7-Code-Reviewer.md)

---

## 8.1 Data Freshness Tiers

```
TIER 1 — Static (cache 24h, refresh on mutation):
  - Topics, Topic Pages
  - Tags
  - Routine definitions
  - Routine groups

TIER 2 — Semi-static (cache 1h, refresh on mutation):
  - Tasks (change multiple times per day)
  - Journal entries (change daily)
  - Meetings (change weekly)

TIER 3 — Dynamic (cache 5 min, refresh on focus):
  - Routine completions (change multiple times per day)
  - Captures (change frequently)
  - AI action logs

TIER 4 — Real-time (no cache, always fresh):
  - Auth state
  - UI state (sidebar, theme)
```

## 8.2 Cache Invalidation Rules

```
RULE: After any mutation, invalidate the affected query cache.

RULE: React Query staleTime must match the data freshness tier:
  Tier 1: staleTime = 24 * 60 * 60 * 1000 (24h)
  Tier 2: staleTime = 60 * 60 * 1000 (1h)
  Tier 3: staleTime = 5 * 60 * 1000 (5min)
  Tier 4: staleTime = 0

RULE: Full-page reload (reload()) is banned after single-entity mutations.
Use surgical cache updates instead.
```
