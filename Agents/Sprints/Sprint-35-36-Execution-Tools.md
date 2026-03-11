# Sprint 35-36 — Fix Execution Tools + Data Awareness

**Theme:** Make the AI DO things, not just talk.
**Branch:** `sprint/35-36-execution-tools`
**Status:** IN PROGRESS
**Compiled by:** Dev Director
**Date:** March 10, 2026

---

## Why This Sprint Exists

Sprint 34 gave the concierge a real home — full-page chat, persistent conversations, model selection. But the AI still can't reliably *do things*. Execution tools are broken or unreliable, the concierge has limited awareness of user data, and tool schemas may not work across all providers. This sprint bridges "chatbot" to "assistant" — and is prerequisite infrastructure for the orchestrator (Sprints 39+).

**Result:** Users can ask the concierge to create tasks, summarize journals, draft briefs, check calendars, and query their data — and it actually works, across any configured provider.

---

## Input Sources

| Source | Key Takeaways |
|---|---|
| Next-Sprint-Planning.md | Sprint 35-36 defined: fix top 7 tools, expand context, cross-provider schemas, data awareness |
| Sprint 34 Retrospective | Task date format bug: `getTasksDueToday()` uses `'Today'` literal vs `yyyy-MM-dd` — breaks AI task lookup |
| Agent 7 (Sprint 30 audit) | P1-A: Memory source tag mismatch — `preCompactionFlush` saves as `'extraction'` instead of `'pre_compaction_flush'`. One-line fix. |
| Agent 11 (Sprint 30) | RISK-3: Pre-compaction latency 2-5s on long convos. Noted but deferred. |
| Agent 7 (Sprint 21 audit) | P1-2: FTS5 stale index after writes. Noted but deferred (desktop-only). |

---

## Parcels

### Track 1 — Fix Execution Tools (Agent 2)

#### P1: Task Date Format Fix + Top 7 Tools End-to-End
**Source:** Next-Sprint-Planning.md, Sprint 34 Retrospective
**Status:** TODO
**Agent:** Agent 2

Debug and fix each execution tool in priority order. Includes fixing the `getTasksDueToday()` date format bug from Sprint 34 sandbox.

**Top 7 tools (priority order):**
1. Create task — verify creates with correct schema, returns confirmation
2. Update task — verify finds by name/ID, updates fields, handles edge cases
3. Summarize journal — verify reads recent entries, produces summary
4. Draft project brief — verify reads project data, generates brief
5. Auto-file capture — verify captures filed to correct location
6. Calendar awareness — verify reads upcoming events, today's schedule
7. Morning briefing — verify aggregates tasks + calendar + journal into briefing

**Definition of Done:**
- [ ] `getTasksDueToday()` fixed to compare `yyyy-MM-dd` format (not `'Today'` literal)
- [ ] Each of the 7 tools tested end-to-end: invoke → execute → return meaningful result
- [ ] Tool error messages are user-friendly (not raw stack traces)
- [ ] Tests added/updated for each fixed tool
- [ ] Sandbox validation: each tool works in live chat

---

#### P2: Expand Prompt Context Window
**Source:** Next-Sprint-Planning.md
**Status:** TODO
**Agent:** Agent 2
**Depends on:** P1 (task date fix needed first)

Give the AI more data to work with in each interaction.

**Definition of Done:**
- [ ] 7-day task window injected into prompt context (past 3 days + today + next 3 days)
- [ ] Upcoming deadlines (tasks due within 7 days) included
- [ ] Recent notes/captures (last 5-10) included
- [ ] Current projects with status included
- [ ] Context stays within reasonable token budget (~2000 tokens for data context)
- [ ] Context loading doesn't add perceptible latency to first response

---

### Track 2 — Cross-Provider + Data Awareness (Agent 2, Agent 3)

#### P3: Tool Schema Compatibility Across All 8 Providers
**Source:** Next-Sprint-Planning.md
**Status:** TODO
**Agent:** Agent 2, Agent 3

Ensure tool definitions (JSON schemas) work correctly with all configured providers.

**Providers:** Claude, GPT-4, Gemini, Llama, Mistral, DeepSeek, Grok, Ollama (local)

**Definition of Done:**
- [ ] Tool schemas validated against each provider's expected format
- [ ] Provider-specific serialization issues identified and fixed
- [ ] Graceful fallback if a provider doesn't support tool use (tools disabled, not crash)
- [ ] At minimum: Claude + GPT-4 + Gemini fully tested with all 7 tools

---

#### P4: Wire Up AI Data Queries
**Source:** Next-Sprint-Planning.md
**Status:** TODO
**Agent:** Agent 2
**Depends on:** P1 (tools must work first)

The concierge should answer questions about user data directly.

**Definition of Done:**
- [ ] "What tasks are due this week?" → returns actual task list
- [ ] "Show me my recent notes about X" → searches and returns matching notes
- [ ] "What's the status of project Y?" → returns project details
- [ ] "What did I journal about yesterday?" → returns journal entry/summary
- [ ] Data queries use existing DataAdapter (no new data layer)
- [ ] Results formatted readably in chat (not raw JSON)

---

### Track 3 — Quick Wins (Agent 2)

#### P5: Memory Source Tag Fix
**Source:** Agent 7 Sprint 30 Code Audit (P1-A)
**Status:** TODO
**Agent:** Agent 2

One-line fix: change `preCompactionFlush` source from `'extraction'` to `'pre_compaction_flush'`.

**Definition of Done:**
- [ ] Source tag corrected in `preCompactionFlush`
- [ ] Existing memories with wrong tag don't break (backwards compatible)

---

## Quality Gates

```
□ npm run format
□ npm run lint (0 errors)
□ npm run typecheck (PASS)
□ npm run test (all pass + new tests for tool execution)
□ npm run build (PASS)
□ PR opened to main, CI passes
□ E2E tests pass against deploy preview URL
□ Sandbox: verify each of the 7 tools works live in chat
□ Merge PR to main
```

---

## Deliberately Deferred

- FTS5 stale index after writes (Agent 7 P1-2) — desktop-only, not blocking V1 web trial
- Pre-compaction latency UX (Agent 11 RISK-3) — cosmetic, not blocking
- TopicAdapter/HabitAdapter crash guards (Agent 7 P1-5, P1-6) — real bugs but not in AI execution path
- Configurable Heartbeat → Sprint 37
- Neuron Memory V1 → Sprint 38
- Orchestrator Page → Sprints 39-45

---

## Metrics

| Metric | Target | Actual |
|---|---|---|
| Parcels | 5 | |
| Build passes | Yes | |
| Lint clean | Yes | |
| Typecheck clean | Yes | |
| Tests pass | Yes | |
| E2E pass | Yes | |
| Tools working (of 7) | 7/7 | |

---

*Sprint 35-36 — Compiled March 10, 2026 by Dev Director*
