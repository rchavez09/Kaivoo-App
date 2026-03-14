# Sprint 38 — Neuron Memory V1

**Theme:** Intelligent Memory Architecture — the concierge remembers smarter, not bigger
**Branch:** `sprint/38-neuron-memory`
**Status:** APPROVED — Ready to begin
**Compiled by:** Dev Director
**Date:** March 14, 2026

---

## Sprint Overview

**Theme:** Intelligent Memory Architecture — the concierge remembers smarter, not bigger.

**Why this sprint exists:**
Sprint 37 delivered proactive AI with the heartbeat system, but it exposed a critical scalability problem: **soul file bloat**. The current soul file loads everything into every conversation — Core Identity, communication preferences, working patterns, episodic memories — all mixed together in a flat structure. As users accumulate memories, the soul file grows unbounded, consuming context window space that should be used for actual work.

This sprint implements a **3-tier memory architecture** (Neuron Memory V1) that separates identity from context from episodes, loads only what's relevant for each conversation, and consolidates memories during heartbeat cycles to keep the system lean and fast.

**Result:** The concierge's memory becomes scalable, context-aware, and efficient. Core identity (who am I?) loads in every conversation. Active context (what's happening now?) loads dynamically based on current tasks/projects. Episodic memory (what have we done?) is searched on-demand, not force-loaded. Memory consolidation during heartbeat deduplicates, summarizes, and prunes stale entries. Token budget stays under control (~3500 tokens for memory injection), preserving context window for tool execution and reasoning.

---

## Input Sources

| Source | Key Takeaways |
|---|---|
| **Vision.md v7.9 (lines 732, 287-344)** | Sprint 38 is a **Phase A must-have**. Neuron Memory V1 defined: tiered soul file (Core Identity + Active Context + Episodic Memory), memory consolidation during heartbeat (dedup, summarize, prune, promote), context-aware loading (~3500 token budget). Solves soul file bloat. Memory architecture is the competitive moat ("the AI that actually remembers you") — Sprint 30 established deterministic context assembly and pre-compaction flush as foundation layers. |
| **Sprint 37 Retrospective** | Heartbeat shipped successfully. Proactive insights working. Soul file loaded in heartbeat prompts — this is where bloat will become visible first. Memory consolidation is the natural next step after heartbeat infrastructure is live. |
| **Sprint 37 Deferred Items (lines 345-351)** | Quiet hours / Do Not Disturb mode → Sprint 38 (Settings UI to disable heartbeat during specific hours). Heartbeat history UI (view past insights) → Sprint 38 (Insights tab in Settings). Multiple time pickers (up to 3 custom times/day) → DONE in Sprint 37 P7. Notification batching (daily digest mode) → Sprint 39. |
| **Sprint 30 Retrospective** | Pre-compaction memory flush implemented (writes to `ai_memories` before truncation). Deterministic context assembly via `assembleConciergeContext()` prevents personality drift. This is the foundation for Neuron Memory V1 — the architecture is already in place, we're now adding tiers and consolidation. |
| **Sprint 24 (Soul File + Concierge)** | Current soul file structure: flat file with identity + preferences + episodic memories all mixed. Memory extraction pipeline established (LLM-based fact extraction, batch dedup, category/source tracking). `ai_memories` SQLite table exists. Context assembly pattern exists in `prompt-assembler.ts`. |
| **Agent 3 Docs (Soul-User-Memory.md, Concierge-Orchestration-Design.md)** | Memory architecture design notes: cortex/hippocampus split (unbounded long-term storage, lean compiled snapshot per session). Soul file = identity (always loaded), Working memory = compiled context (session-specific), Long-term memory = fact store (searched on-demand). Pre-compaction flush pattern established. Consolidation is the next layer. |

---

## Candidate Backlog

All items sourced from Vision.md Phase A Remaining milestones (line 732), Sprint 37 deferred items, and memory architecture design (Agent 3 Docs).

### Priority 1: Neuron Memory V1 (Core Sprint Scope)

| Item | Source | Rationale |
|---|---|---|
| **3-tier memory schema** | Vision.md line 732, Agent 3 Docs/Soul-User-Memory.md | Separate Core Identity (always loaded) + Active Context (project/task-aware) + Episodic Memory (searched on-demand). This is the foundation — everything else builds on this structure. |
| **Memory consolidation during heartbeat** | Vision.md line 732, Sprint 30 (pre-compaction flush pattern) | Dedup, summarize, prune stale entries, promote important facts. Runs automatically during heartbeat cycles — no manual intervention. Keeps memory lean. |
| **Context-aware memory loading** | Vision.md line 732, Sprint 24 (assembleConciergeContext pattern) | Load only relevant memories based on current conversation context (active tasks, projects, calendar events). Token budget: ~3500 tokens total for memory injection. |
| **Memory tier promotion/demotion rules** | Agent 3 Docs/Soul-User-Memory.md | Define when episodic memories get promoted to Active Context (repeated patterns), when Active Context gets demoted to Episodic (stale), when entries get pruned (low relevance + age). |
| **Settings UI: Memory Management** | New | Users can view memory tiers, manually promote/demote/delete entries, see token budget usage, trigger manual consolidation. Transparency over black-box memory. |

### Priority 2: Heartbeat Enhancements (Sprint 37 Carryover)

| Item | Source | Rationale |
|---|---|---|
| **Quiet hours / Do Not Disturb mode** | Sprint 37 deferred (line 345) | Settings UI: "Do Not Disturb" with start/end time pickers (e.g., 10pm-7am). Heartbeat still runs but doesn't send notifications during quiet hours. Important for sleep/focus time. |
| **Heartbeat history UI** | Sprint 37 deferred (line 347) | New Settings section: "Proactive Insights History" — view past insights, timestamps, context snapshot. Helps users understand what the heartbeat is doing. |

### Priority 3: Nice-to-Haves (Defer if scope is tight)

| Item | Source | Rationale |
|---|---|---|
| Memory export (JSON/Markdown) | New | Let users export their full memory store (all tiers) for backup or migration. Aligns with Core Principle #1 (you own your data). |
| Memory search UI | New | Search across all memory tiers from Settings. Find "what does the AI remember about [topic]?" |

---

## Proposed Scope — Sprint 38

**Theme:** Neuron Memory V1 + Heartbeat Refinement

### Track 1: Neuron Memory V1 (Core) — Agent 2, Agent 3

#### P1: 3-Tier Memory Schema & Migration
**Agent:** Agent 2 (implementation), Agent 3 (architecture review)

Restructure `ai_memories` table to support 3 tiers:

**New schema:**
```sql
CREATE TABLE ai_memories (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  tier TEXT NOT NULL CHECK (tier IN ('core_identity', 'active_context', 'episodic')),
  category TEXT,  -- existing: 'preference', 'fact', 'pattern', 'decision'
  content TEXT NOT NULL,
  source TEXT,
  importance_score REAL DEFAULT 0.5,  -- new: 0.0-1.0, used for promotion/demotion
  last_accessed_at TIMESTAMP,  -- new: tracks relevance via recency
  access_count INTEGER DEFAULT 0,  -- new: tracks relevance via frequency
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Tier definitions:**
- **core_identity:** User's name, concierge name, communication style, core preferences. Always loaded. Examples: "User prefers bullet points over paragraphs," "Call user 'Kai'," "Concierge name is 'Atlas'."
- **active_context:** Project-specific context, current goals, active habits/routines, work-in-progress patterns. Loaded when relevant to current conversation. Examples: "User is working on Project X," "Morning routine streak: 7 days."
- **episodic:** Historical facts, past decisions, one-time events, old patterns. Searched on-demand only. Examples: "User completed Sprint 30 on March 7," "User prefers Claude for creative writing tasks."

**Migration:**
- Existing `ai_memories` entries default to `episodic` tier
- LLM-based classification pass: analyze existing memories, assign to correct tier
- User's settings (soul config) become `core_identity` entries
- Current task/project/routine patterns become `active_context` entries

**Definition of Done:**
- [ ] Schema updated with 3 new columns: `tier`, `importance_score`, `last_accessed_at`, `access_count`
- [ ] Migration script classifies existing memories into tiers
- [ ] Zustand store updated to support tier filtering
- [ ] Service layer includes tier-aware CRUD operations
- [ ] Tests cover tier filtering and migration

---

#### P2: Context-Aware Memory Loading
**Agent:** Agent 2
**Depends on:** P1 (schema must exist)

Update `assembleConciergeContext()` (from Sprint 30) to load memories based on tier + relevance:

**Loading rules:**
1. **core_identity:** Always load all (expect ~5-10 entries, ~500 tokens)
2. **active_context:** Load all (expect ~10-20 entries, ~1000 tokens)
3. **episodic:** Search based on current conversation context (top 10 most relevant, ~2000 tokens)

**Relevance scoring for episodic search:**
- Keyword match (current tasks, projects, calendar events mentioned)
- Recency (newer = higher score)
- Frequency (access_count)
- Importance score (manually set or LLM-derived)

**Token budget enforcement:**
- Max ~3500 tokens total for memory injection
- If over budget, truncate episodic results first (keep core + active untouched)

**Definition of Done:**
- [ ] `assembleConciergeContext()` loads tier-aware memories
- [ ] Episodic search uses relevance scoring (keyword + recency + frequency + importance)
- [ ] Token budget enforced (3500 tokens max)
- [ ] Memory injection includes tier labels for debugging ("Core Identity: ...")
- [ ] Tests cover tier loading and token budget enforcement

---

#### P3: Memory Consolidation During Heartbeat
**Agent:** Agent 2
**Depends on:** P1 (schema), P2 (loading)

Add consolidation logic to heartbeat service (runs after insight generation):

**Consolidation steps:**
1. **Deduplication:** Merge semantically identical memories (LLM-based similarity check)
2. **Summarization:** Combine related episodic memories into summaries (e.g., 5 "user prefers X" → 1 "user's preferences: X, Y, Z")
3. **Pruning:** Delete low-relevance episodic memories older than 90 days with access_count < 2
4. **Promotion:** Move frequently accessed episodic memories (access_count > 10) to active_context
5. **Demotion:** Move stale active_context memories (not accessed in 30 days) to episodic

**Frequency:** Run consolidation during every heartbeat cycle (but skip if last consolidation was <24 hours ago)

**User visibility:** Log consolidation results to `heartbeat_insights` table ("Consolidated 3 memories, pruned 2 stale entries")

**Definition of Done:**
- [ ] Consolidation logic runs during heartbeat
- [ ] Dedup uses LLM similarity check (cosine similarity >0.9 or semantic equivalence)
- [ ] Pruning removes stale episodic memories (90 days + low access)
- [ ] Promotion/demotion rules enforced (access_count + recency thresholds)
- [ ] Consolidation results logged to `heartbeat_insights`
- [ ] Settings toggle: "Enable memory consolidation" (on by default)
- [ ] Tests cover all 5 consolidation steps

---

#### P4: Memory Tier Promotion/Demotion Rules
**Agent:** Agent 2, Agent 3 (rules definition)
**Depends on:** P3 (consolidation)

Formalize rules for tier transitions:

**Promotion (episodic → active_context):**
- Condition: access_count ≥ 10 OR importance_score ≥ 0.8
- Action: Update tier, reset access_count to 0
- Example: "User prefers Claude for writing" gets accessed 10+ times → promoted to active_context

**Demotion (active_context → episodic):**
- Condition: last_accessed_at > 30 days ago AND access_count < 5
- Action: Update tier, keep importance_score
- Example: "User working on Project X" not mentioned in 30 days → demoted to episodic

**Pruning (episodic → deleted):**
- Condition: last_accessed_at > 90 days ago AND access_count < 2 AND importance_score < 0.3
- Action: DELETE from `ai_memories`
- Example: One-time fact from 3 months ago, never re-accessed, low importance → deleted

**Core identity never changes:**
- core_identity entries are manually managed via Settings UI only
- No automatic promotion/demotion/pruning

**Definition of Done:**
- [ ] Promotion/demotion/pruning rules documented in code comments
- [ ] Rules execute during consolidation (P3)
- [ ] Edge cases handled (e.g., empty tiers, all episodic, etc.)
- [ ] Tests cover all transition scenarios

---

### Track 2: Settings UI — Memory Management (Agent 2, Design Agents)

#### P5: Memory Management Settings UI
**Agent:** Agent 2
**Depends on:** P1 (schema), P2 (loading)

Add a new section to Settings: **Memory Management**

**UI structure:**
```
Settings > AI Settings > Memory Management
  ├─ Memory Tiers Overview
  │   ├─ Core Identity (X entries, ~Y tokens)
  │   ├─ Active Context (X entries, ~Y tokens)
  │   └─ Episodic Memory (X entries, ~Y tokens)
  ├─ Memory Budget: 3200 / 3500 tokens (progress bar)
  ├─ View & Edit Memories (button → opens modal)
  └─ Consolidation Settings
      ├─ Enable automatic consolidation (toggle, on by default)
      └─ Run consolidation now (button)
```

**Memory Editor Modal:**
- 3 tabs (Core Identity | Active Context | Episodic)
- List of memories per tier with edit/delete/promote/demote buttons
- Manual tier assignment (drag-and-drop or dropdown)
- Add new memory manually
- Search across all tiers

**Definition of Done:**
- [ ] Settings section added to AI Settings page
- [ ] Token budget visualization (progress bar)
- [ ] Memory editor modal with 3 tabs
- [ ] CRUD operations: view, edit, delete, promote, demote, add
- [ ] Accessibility: keyboard navigation, ARIA labels, focus management
- [ ] Design agent review: UX Completeness + Accessibility
- [ ] Tests cover Settings UI interactions

---

### Track 3: Heartbeat Enhancements (Agent 2)

#### P6: Quiet Hours / Do Not Disturb Mode
**Agent:** Agent 2
**Depends on:** Sprint 37 P2 (Settings UI exists)

Add "Do Not Disturb" settings to Proactive Insights section:

**Settings UI:**
```
Settings > AI Settings > Proactive Insights
  └─ Do Not Disturb
      ├─ Enable (toggle)
      ├─ Start time (time picker, default 10:00 PM)
      └─ End time (time picker, default 7:00 AM)
```

**Behavior:**
- Heartbeat still runs during quiet hours (insights still generated)
- Notifications are suppressed (no desktop/web notifications during quiet hours)
- Insights are logged to history but not shown until quiet hours end

**Definition of Done:**
- [ ] Settings UI added to Proactive Insights section
- [ ] Time picker component (24-hour format)
- [ ] Heartbeat service checks quiet hours before sending notifications
- [ ] Insights logged but not shown during quiet hours
- [ ] Tests cover quiet hours logic

---

#### P7: Heartbeat Insights History UI
**Agent:** Agent 2
**Depends on:** Sprint 37 P3 (heartbeat insights table exists)

Add "Insights History" view to Settings:

**Settings UI:**
```
Settings > AI Settings > Proactive Insights
  └─ Insights History (button → opens modal)
```

**Insights History Modal:**
- List of past insights (newest first)
- Columns: Timestamp | Insight text | Actionable (yes/no) | Notification sent (yes/no)
- Filter: Actionable only, Last 7 days, Last 30 days, All time
- Pagination (20 per page)
- Click insight → view context snapshot (tasks, calendar, journal at that time)

**Definition of Done:**
- [ ] Modal component created
- [ ] Fetches from `heartbeat_insights` table
- [ ] Filters work (actionable, date range)
- [ ] Pagination works
- [ ] Context snapshot view (read-only)
- [ ] Tests cover history fetching and filters

---

## Dependencies

```
P1 (Schema) → P2 (Loading) → P3 (Consolidation) → P4 (Rules)
                            ↓
                            P5 (Settings UI)

P6 (Quiet Hours) ← Sprint 37 P2 (Settings UI)
P7 (History) ← Sprint 37 P3 (heartbeat_insights table)
```

Tracks 1 and 2 are sequential within themselves but Track 3 can run in parallel.

---

## Agent Assignments

| Parcel | Primary Agent | Review/Support |
|---|---|---|
| P1: Schema & Migration | Agent 2 | Agent 3 (architecture), Agent 7 (code audit) |
| P2: Context-Aware Loading | Agent 2 | Agent 3 (review), Agent 7 (code audit) |
| P3: Consolidation Logic | Agent 2 | Agent 3 (review), Agent 7 (code audit) |
| P4: Promotion/Demotion Rules | Agent 2 + Agent 3 | Agent 7 (code audit) |
| P5: Memory Management UI | Agent 2 | UX Completeness Agent, Accessibility Agent, Agent 7 |
| P6: Quiet Hours | Agent 2 | Agent 7 (code audit) |
| P7: Insights History UI | Agent 2 | UX Completeness Agent, Accessibility Agent, Agent 7 |

**Quality Gates:**
- Agent 7 (Code Reviewer): Audit all parcels before Phase 4
- Agent 11 (Feature Integrity): Verify no regressions in concierge memory, soul file, heartbeat
- Design Agents (UX Completeness, Accessibility): Review P5 + P7 (Settings UI)

---

## Definition of Done (Sprint-Level)

Sprint 38 succeeds when:

1. **3-tier memory schema** is live (Core Identity, Active Context, Episodic) with migration complete
2. **Context-aware memory loading** only loads relevant memories per conversation (token budget ≤ 3500)
3. **Memory consolidation** runs during heartbeat (dedup, summarize, prune, promote, demote)
4. **Settings UI** allows users to view, edit, promote, demote, and delete memories across all 3 tiers
5. **Quiet hours mode** suppresses notifications during configured hours without stopping heartbeat
6. **Insights history UI** shows past heartbeat insights with filters and context snapshots
7. All quality gates pass (build, lint, typecheck, tests, Agent 7, Agent 11, design agents)
8. Sandbox validation: memory consolidation works, token budget stays within limits, Settings UI is clear and accessible

---

## Deliberately Deferred

- Hybrid memory search (vector + BM25 + temporal decay) → Phase B (Cloud Companion)
- Memory consolidation "sleep cycle" (offline process between sessions) → Phase B
- Coherence monitoring (drift detection via behavioral signals) → Phase B
- Memory export (JSON/Markdown) → Sprint 39 or later
- Memory search UI (search across all tiers) → Sprint 39 or later
- Notification batching (daily digest mode) → Sprint 39
- Multi-agent heartbeat (different agents for different insight types) → Orchestrator phase
- Web Worker heartbeat implementation → Phase B optimization

---

## Estimated Metrics

| Metric | Target |
|---|---|
| Parcels | 7 |
| Code added | ~800-1000 lines |
| Files created | ~5 (consolidation service, memory tier helpers, Settings UI components) |
| Files modified | ~10 (assembleConciergeContext, heartbeat service, Settings page, schema migration) |
| Build passes | Yes |
| Lint clean | Yes |
| Typecheck clean | Yes |
| Tests pass | 265+ (add ~20 new tests for memory tiers, consolidation, Settings UI) |
| Token budget | ≤ 3500 for memory injection |
| Memory consolidation efficiency | Reduce episodic memory by 20-30% after first consolidation run |

---

## Success Criteria

**Technical:**
- Soul file bloat solved — token budget stays under 3500 regardless of memory growth
- Consolidation runs automatically, no manual intervention required
- Memory tiers are transparent and editable by users

**User Experience:**
- Users understand what the AI remembers about them (tier visibility in Settings)
- Quiet hours work as expected (no notifications during sleep/focus time)
- Insights history provides clarity into heartbeat behavior

**Quality:**
- No regressions in concierge memory, soul file, or heartbeat functionality
- Accessibility WCAG AA compliance on all new Settings UI
- Code audit passes with 0 P0 issues

---

## Quality Gates

```
[ ] npm run format
[ ] npm run lint (0 errors, warnings accepted as-is)
[ ] npm run typecheck (PASS)
[ ] npm run test (265+ tests PASS)
[ ] npm run build (PASS)
[ ] cd daily-flow/src-tauri && cargo check (PASS)
[ ] cd daily-flow/src-tauri && cargo clippy (PASS, warnings acceptable)
[ ] PR opened to main, CI passes
[ ] E2E tests pass against deploy preview URL
[ ] Agent 7 code audit — no P0s
[ ] Agent 11 feature integrity check — PASS
[ ] Design agents review (P5 + P7 Settings UI) — PASS, no P0s
[ ] Sandbox Track A (Web): verify memory consolidation, Settings UI, quiet hours
[ ] Sandbox Track B (Desktop): verify memory consolidation, heartbeat notifications during quiet hours
[ ] Merge PR to main
```

---

*Sprint 38 — Compiled March 14, 2026 by Dev Director*
*Approved March 14, 2026 — Ready to execute*
