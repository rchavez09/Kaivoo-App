# Database & Query Standards

**Source:** Extracted from Agent 7 Code Reviewer spec, Section 7
**Parent:** [Agent-7-Code-Reviewer.md](../Agent-7-Code-Reviewer.md)

---

## 7.1 Query Rules

```
RULE: Every query must include:
  1. .eq('user_id', userId) — ownership filter (even with RLS)
  2. .select('column1,column2,...') — no .select('*') in production
  3. .order() — deterministic ordering
  4. .limit() — bounded results (or documented reason for unbounded)

RULE: No N+1 queries. If you need related data, use:
  - .select('*, subtasks(*)') for Supabase joins
  - Promise.all() for parallel independent queries
  - NEVER: loop over results and fetch related data per item
```

## 7.2 Index Requirements

```
RULE: Every column used in .eq(), .gte(), .order(), or WHERE
must have an index or be part of a composite index.

RULE: All user_id foreign keys must have indexes.

MINIMUM INDEXES (non-negotiable):
  tasks(user_id, created_at DESC)
  journal_entries(user_id, timestamp DESC)
  captures(user_id, date DESC)
  meetings(user_id, start_time DESC)
  topics(user_id, name)
  topic_pages(topic_id)
  subtasks(task_id)
  routines(group_id)
  routine_completions(user_id, routine_id, date)
```

## 7.3 Write Operations

```
RULE: Create operations must return the created object (use .select().single()).
RULE: Update/delete operations must filter by both id AND user_id.
RULE: Bulk operations should use transactions where available.
```
