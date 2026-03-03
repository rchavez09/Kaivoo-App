# Sprint 24 — Soul File & Concierge Intelligence

**Theme:** Make the concierge actually know you. Fix P0 bugs. Build the tool-use action system. Upgrade BYO-key to support any provider.
**Branch:** `sprint/24-soul-file-concierge`
**Status:** PLANNING
**Compiled by:** Director
**Date:** March 3, 2026

---

## Input Sources

| Source | Key Takeaways |
|---|---|
| Vision.md v5.0 | Soul file is the differentiator. "Day execution" positioning. Three-tier revenue model adopted. Concierge upgraded to full action agent. |
| CEO Session #5 | "Soul file is what makes people say 'I can't go back to ChatGPT.'" Gmail/Calendar deferred to post-launch. Cleanup sprint required. |
| Sprint 23 Retrospective | 12/12 parcels done. Deferred: file attachments, Google Calendar, Gmail, concierge agent routing, bundle optimization, file size overage, vault organization, wikilinks. |
| Next-Sprint-Planning.md | Sprint 24 scope: 5 tracks (P0 bugs, soul file foundation, tool-use system, memory UI, universal BYO-key). |
| Cleanup-Backlog.md | BUG-1 (wizard repeats), BUG-2 (API key persistence), UX-1 (subtask reorder), UX-2 (journal sidebar titles), UX-3 (BYOK limited to 3 providers). Full tool catalog (~20 tools). |
| Agent 3 — Soul-User-Memory.md | Soul file format (`.kaivoo/soul.json`), markdown sections (Identity, Communication Style, Goals, Preferences). |
| Agent 3 — Concierge-Orchestration-Design.md | Orchestration architecture: intent parsing → agent routing → context search → dispatch → vault save. |
| Agent 3 — Hub-Server-API-Reference.md | `/api/concierge/soul` endpoint spec. Conversation persistence. Agent/skill dispatch routes. |
| Agent 3 — Data-Model-Architecture.md | SQLite schema for conversations, search index, soul file. Files vs DB decision matrix. |
| Agent 3 — ADR-DataAdapter-Interface.md | DataAdapter abstraction (15 entity sub-adapters). Concierge reads through this layer. |
| Agent 4 — AI-Agent-Sandboxing.md | Permission levels (L0-L3). Prompt injection defenses. Soul file read-only for agents — only user edits via Settings UI. |
| Agent 4 — Security-Checklist-By-Phase-Sprint-0.md | Phase 4 security gates: agent permission model, sandboxing, prompt injection defenses. |
| Agent 7 — Code-Audit-Sprint-21-Adapter-Layer.md | 7 P1 adapter bugs (zero try/catch, FTS5 stale after writes, habits/routines collision). Some affect Concierge data queries. |
| Agent 8 — Competitive-Landscape-Report.md | Soul File + Concierge Intelligence is the key differentiator vs Notion (AI but no self-hosted) and Obsidian (self-hosted but no native AI). |
| Marketing-Copy-Draft.md | "The only AI assistant that remembers you — and lets you read, edit, and export everything it knows." |

---

## Candidate Backlog (Ranked)

| # | Item | Priority | Source | Decision |
|---|---|---|---|---|
| 1 | BUG-1: Setup wizard repeats every login | P0 | Cleanup-Backlog | **IN** — blocks usable product |
| 2 | BUG-2: API key not saved between sessions | P0 | Cleanup-Backlog | **IN** — blocks AI usage entirely |
| 3 | Soul file data model (`ai_memories`, `ai_conversation_summaries`) | P0 | CEO Session #5 | **IN** — foundation for everything |
| 4 | Enhanced SoulConfig interface | P0 | Next-Sprint-Planning | **IN** — expands soul identity |
| 5 | System prompt assembler (6-layer) | P0 | Next-Sprint-Planning | **IN** — replaces 2-line builder |
| 6 | User-triggered memory ("remember this") | P0 | Next-Sprint-Planning | **IN** — emotional hook |
| 7 | Tool schema definitions (~20 tools) | P0 | Cleanup-Backlog | **IN** — core to product promise |
| 8 | Tool executor bridge (Zustand wiring) | P0 | Cleanup-Backlog | **IN** — makes tools work |
| 9 | Create tools (5 tools) | P0 | Cleanup-Backlog | **IN** — create_task, create_journal, etc. |
| 10 | Read/search tools (9 tools) | P0 | Cleanup-Backlog | **IN** — get_tasks, search, etc. |
| 11 | Update/complete tools (5 tools) | P0 | Cleanup-Backlog | **IN** — complete_task, log_routine, etc. |
| 12 | Security guardrails for tool-use | P0 | Agent 4 | **IN** — confirmation, audit trail, undo |
| 13 | App context injection (today's data in system prompt) | P0 | Next-Sprint-Planning | **IN** — concierge sees your day |
| 14 | Edge function / client-side tool execution flow | P0 | Next-Sprint-Planning | **IN** — LLM → tool call → execute → respond |
| 15 | Soul File settings page | P1 | Next-Sprint-Planning | **IN** — view/edit/delete memories |
| 16 | Extraction pipeline (post-conversation) | P1 | Next-Sprint-Planning | **IN** — automatic memory building |
| 17 | Conversation summaries | P1 | Next-Sprint-Planning | **IN** — summary + key_facts after each convo |
| 18 | Memory notification | P1 | Next-Sprint-Planning | **IN** — "{name} remembered N things" |
| 19 | Vercel AI SDK migration | P1 | Next-Sprint-Planning | **PARTIAL** — migrate core, defer full provider matrix |
| 20 | Provider settings UI update | P1 | Next-Sprint-Planning | **PARTIAL** — add common providers dropdown |
| 21 | UX-1: Subtask reorder | P1 | Cleanup-Backlog | **DEFERRED** → Sprint 25 |
| 22 | UX-2: Journal sidebar titles | P2 | Cleanup-Backlog | **DEFERRED** → Sprint 25 |
| 23 | OpenRouter integration | P1 | Next-Sprint-Planning | **DEFERRED** → Sprint 25 |
| 24 | File attachments | P1 | Sprint 23 deferred | **DEFERRED** → Sprint 25 |
| 25 | Bundle optimization | P1 | Sprint 23 deferred | **DEFERRED** → Sprint 25 |
| 26 | Agent 7 P1 adapter bugs (Sprint 21) | P1 | Agent 7 audit | **PARTIAL** — fix bugs that affect Concierge data queries |

---

## Proposed Scope — 5 Tracks, 20 Parcels

### Track 1: P0 Bug Fixes (Do First)

These must be resolved before any other track work — they block the product being usable.

| # | Parcel | Agent | Status | Priority |
|---|---|---|---|---|
| P1 | **BUG-1: Setup wizard repeats** — Investigate why `kaivoo-setup-complete` flag isn't persisting. Add backup persistence to SQLite (desktop) and Supabase `user_preferences` (web). Verify across deploy preview origins. | Agent 2 | PENDING | P0 |
| P2 | **BUG-2: API key persistence** — Move API key from `sessionStorage` to secure storage. **Desktop:** `tauri-plugin-stronghold` or `tauri-plugin-keyring` (OS keychain). **Web:** Encrypted localStorage with user-derived key OR "remember for this device" checkbox. Agent 4 security review required before implementation. | Agent 2 + Agent 4 | PENDING | P0 |

### Definition of Done — Track 1
- [ ] Setup wizard runs once and only once — flag persists across tab close, browser restart, and different deploy preview origins
- [ ] Backup flag stored in SQLite (desktop) or Supabase user_preferences (web) in addition to localStorage
- [ ] API key persists across sessions securely
- [ ] Desktop: API key stored in OS keychain or encrypted vault (not localStorage/sessionStorage)
- [ ] Web: API key stored in encrypted localStorage with "remember this device" user consent
- [ ] Agent 4 security review PASS on the API key storage approach

---

### Track 2: Soul File Foundation

The emotional core of the product. What makes people say "I can't go back to ChatGPT."

| # | Parcel | Agent | Status | Priority |
|---|---|---|---|---|
| P3 | **Enhanced SoulConfig** — Expand `SoulConfig` interface: `userName`, `userAddress`, `verbosity`, `backstory`, `communicationNotes`, `goals`, `workingStyle`. Migrate existing soul data from Sprint 23 format. Update soul file read/write in settings.ts and soul.json. | Agent 2 + Agent 3 | PENDING | P0 |
| P4 | **`ai_memories` table** — SQLite table: `id`, `content`, `category` (preference/fact/goal/relationship/pattern), `source` (hatching/user_edit/extraction/explicit), `created_at`, `updated_at`, `active`. Dual-adapter: LocalMemoryAdapter (SQLite) + SupabaseMemoryAdapter. CRUD operations. FTS5 index for dedup/search. | Agent 2 + Agent 3 | PENDING | P0 |
| P5 | **`ai_conversation_summaries` table** — SQLite table: `id`, `conversation_id`, `summary`, `key_facts` (JSON array), `created_at`. Dual-adapter. Conversation ID links to existing chat-service conversation IDs. | Agent 2 + Agent 3 | PENDING | P0 |
| P6 | **System prompt assembler** — 6-layer assembly replacing current 2-line builder in `settings.ts:buildSystemPrompt()`. Layers: 1) Identity (name, tone, backstory) → 2) User Profile (SoulConfig fields) → 3) Memories (top-N from ai_memories, prioritized by recency + category) → 4) Recent Conversations (last 3-5 summaries from ai_conversation_summaries) → 5) App Context (tasks due today, calendar events, journal status, active projects — read from Zustand stores) → 6) Behavioral Rules (depth preference, guardrails). Token budget management (estimate ~2K tokens for context). | Agent 2 + Agent 3 | PENDING | P0 |
| P7 | **User-triggered memory** — When user says "remember this", "don't forget", "keep in mind", or similar phrases, concierge acknowledges and saves to `ai_memories` with `source='explicit'`. Pattern matching on user intent, not brittle keyword matching. Confirmation response: "Got it — I'll remember that." | Agent 2 | PENDING | P0 |

### Definition of Done — Track 2
- [ ] `SoulConfig` has all new fields (userName, userAddress, verbosity, backstory, communicationNotes, goals, workingStyle)
- [ ] Existing Sprint 23 soul data (name + tone) migrated seamlessly — no data loss
- [ ] `ai_memories` table created in SQLite with full CRUD + FTS5 search
- [ ] `ai_conversation_summaries` table created in SQLite with dual-adapter
- [ ] System prompt assembler produces a well-structured prompt from all 6 layers
- [ ] System prompt stays within ~2K token budget (measured, not guessed)
- [ ] "Remember this" intent detected and saved to ai_memories with source='explicit'
- [ ] Concierge responses noticeably use stored memories and user profile in conversation

---

### Track 3: Concierge Tool-Use System

The concierge becomes a full action agent — anything the user can do through the UI, the concierge can do via conversation. This is what makes "day execution" real.

| # | Parcel | Agent | Status | Priority |
|---|---|---|---|---|
| P8 | **Tool schema definitions** — Define all tools as JSON schemas for LLM function calling. Organized by category: Create (5), Read/Search (9), Update/Complete (5), Navigate (1). Each tool has name, description, parameters (with types + required/optional), and return type. Stored as exportable TypeScript objects that map to provider-specific formats (OpenAI `tools` array, Anthropic `tool_use`). | Agent 2 + Agent 3 | PENDING | P0 |
| P9 | **Tool executor bridge** — Map each tool call to existing Zustand store actions and service layer functions. Central `executeToolCall(toolName, params)` function that routes to the correct store action. Returns structured results (success/failure + data) for LLM to summarize. No new business logic — just wiring. | Agent 2 | PENDING | P0 |
| P10 | **Create tools** — `create_task`, `create_journal_entry`, `create_calendar_event`, `create_capture`, `create_note`. Each wired to existing store actions. Validate parameters, execute via adapter, return confirmation with created entity details. | Agent 2 | PENDING | P0 |
| P11 | **Read/search tools** — `search`, `get_tasks`, `get_journal`, `get_calendar`, `get_notes`, `get_routines`, `get_file`, `get_captures`, `get_projects`. Each reads from existing Zustand stores or queries via adapter. Returns formatted results suitable for LLM context. | Agent 2 | PENDING | P0 |
| P12 | **Update/complete tools** — `complete_task`, `update_task`, `log_routine`, `log_habit`, `update_settings`. Each wired to existing store actions. `complete_task` and `update_task` use read-before-write for ambiguous references (search first, confirm match, then act). | Agent 2 | PENDING | P0 |
| P13 | **Security guardrails** — Confirmation prompt for destructive actions (delete, bulk update). Audit trail via `ai_action_logs` (already exists in `useAIActionLog`). Undo capability for all create/update actions. No API key exposure through tool calls. Rate limiting (max 5 tool calls per turn). Settings changes require confirmation. | Agent 2 + Agent 4 | PENDING | P0 |
| P14 | **Chat flow update for tool execution** — Update `ai-chat` edge function and/or client-side chat service to handle tool-use responses. Flow: User message → LLM → tool_call response → app executes tool → result sent back to LLM → LLM gives natural language response. Support multi-turn tool use (LLM can chain multiple tool calls). Streaming must work with tool-use. | Agent 2 | PENDING | P0 |

### Definition of Done — Track 3
- [ ] ~20 tool schemas defined as TypeScript objects with JSON Schema format
- [ ] Tool schemas work with OpenAI function calling format (primary) and Anthropic tool_use format
- [ ] `executeToolCall()` correctly routes to existing store actions for all tools
- [ ] All 5 create tools work end-to-end: user says "create a task for tomorrow" → task appears in task list
- [ ] All 9 read/search tools work: user says "what tasks do I have today?" → concierge lists today's tasks
- [ ] All 5 update/complete tools work: user says "check off my running routine" → routine logged
- [ ] Read-before-write: ambiguous references (e.g., "the NUWAVE task") trigger search + confirmation
- [ ] Destructive actions show confirmation before executing
- [ ] All tool calls logged to `ai_action_logs` with undo data
- [ ] Chat flow handles tool_call → execute → respond cycle with streaming
- [ ] Multi-turn tool use works (LLM can call multiple tools in sequence)

---

### Track 4: Memory UI & Extraction

Making the soul file visible, editable, and self-building.

| # | Parcel | Agent | Status | Priority |
|---|---|---|---|---|
| P15 | **Soul File settings page** — New section in Settings: "Soul File" or "AI Memory". Shows all memories in a scrollable list grouped by category. Each memory: content, category badge, source badge, created date. Edit/delete each memory. Add new memory manually. Edit personality fields (name, tone, backstory, communication notes, goals). Toggle memory active/inactive. | Agent 2 | PENDING | P1 |
| P16 | **Extraction pipeline** — After conversation ends (user closes chat or starts new conversation), send conversation to a cheap/fast model (Haiku or GPT-4o-mini) with an extraction prompt: "Extract facts, preferences, goals, and patterns about the user from this conversation." Compare extracted facts against existing memories via FTS5 search. Decision: ADD (new fact), UPDATE (existing fact with new info), or SKIP (duplicate). Batch insert/update to `ai_memories` with `source='extraction'`. | Agent 2 + Agent 3 | PENDING | P1 |
| P17 | **Conversation summaries** — After each conversation ends, generate a summary + key_facts array using the same cheap model. Store in `ai_conversation_summaries`. System prompt assembler injects last 3-5 summaries. Summaries are concise (1-2 sentences + 3-5 key facts as JSON array). | Agent 2 | PENDING | P1 |
| P18 | **Memory notification** — After extraction completes, show a subtle toast notification: "{concierge_name} remembered {N} new things about you" → tapping opens the Soul File settings page. If 0 new things extracted, no notification. Notification uses existing toast system. | Agent 2 | PENDING | P1 |

### Definition of Done — Track 4
- [ ] Soul File settings page accessible from Settings → Soul File (or AI Memory)
- [ ] All memories displayed in list, grouped by category, with edit/delete/add
- [ ] Personality fields (name, tone, backstory, communication notes, goals) editable from this page
- [ ] Extraction pipeline runs automatically when conversation ends
- [ ] Extracted facts compared against existing memories (FTS5 dedup) — ADD/UPDATE/SKIP
- [ ] Conversation summaries generated and stored after each conversation
- [ ] Last 3-5 summaries injected into system prompt by the assembler
- [ ] Toast notification appears after extraction: "{name} remembered N new things"
- [ ] Tapping notification navigates to Soul File settings page

---

### Track 5: Universal BYO-Key (Partial)

Expand provider support beyond the current 3. Full matrix deferred to Sprint 25 — this sprint focuses on the infrastructure migration.

| # | Parcel | Agent | Status | Priority |
|---|---|---|---|---|
| P19 | **Vercel AI SDK migration** — Replace current per-provider chat service with Vercel AI SDK (`ai` package). Install `ai`, `@ai-sdk/openai`, `@ai-sdk/anthropic`, `@ai-sdk/google`. Unified `streamText()` / `generateText()` interface. Preserve streaming SSE behavior. Tool-use support built into the SDK (critical for Track 3). Update edge function to use Vercel AI SDK. | Agent 2 + Agent 3 | PENDING | P1 |
| P20 | **Provider settings UI update** — Expand provider dropdown: OpenAI, Anthropic, Google Gemini, Groq, Mistral, DeepSeek, Ollama, + "Custom (OpenAI-compatible)" option. For OpenAI-compatible providers (Groq, DeepSeek, Mistral, Together AI), use `@ai-sdk/openai` with `baseURL` override. User enters: provider name + API key + optional base URL + model name. Model dropdown updates per provider. | Agent 2 | PENDING | P1 |

### Definition of Done — Track 5
- [ ] Vercel AI SDK (`ai` package) installed and integrated
- [ ] `streamText()` replaces current per-provider streaming implementation
- [ ] Tool-use flows through Vercel AI SDK's native tool calling support
- [ ] OpenAI, Anthropic, and Google Gemini work via native SDK providers
- [ ] Groq, Mistral, DeepSeek work via OpenAI-compatible `baseURL` override
- [ ] Ollama still works (local endpoint)
- [ ] Provider settings UI shows expanded dropdown with 7+ providers
- [ ] "Custom (OpenAI-compatible)" option allows arbitrary endpoint
- [ ] Existing conversations and settings migrate without data loss

---

## Dependencies

```
Track 1 (P1-P2: Bug Fixes) ──→ Track 2 (P3-P7: Soul File) ──→ Track 3 (P8-P14: Tool-Use)
                                       │                              │
                                       │                              ├── P8 (schemas) before P9 (executor)
                                       │                              ├── P9 (executor) before P10-P12 (tools)
                                       │                              └── P13 (guardrails) parallel with P10-P12
                                       │
                                       └── P6 (system prompt) feeds into P14 (chat flow)

Track 4 (P15-P18: Memory UI) ── depends on Track 2 (P4-P5 tables exist)
                                  ── P16 (extraction) depends on P6 (system prompt assembler)

Track 5 (P19-P20: BYO-Key) ── independent of Tracks 2-4
                              ── P19 (SDK migration) should happen early — Track 3 tool-use
                                 benefits from Vercel AI SDK's native tool calling support
```

**Recommended execution order:**
1. **P19** (Vercel AI SDK migration) — early, unblocks tool-use via SDK
2. **P1-P2** (Bug fixes) — parallel with P19
3. **P3-P5** (Soul data model) — after bugs fixed
4. **P6** (System prompt assembler) — after data model exists
5. **P7** (User-triggered memory) — after data model exists
6. **P8-P9** (Tool schemas + executor) — after SDK migration
7. **P10-P14** (Tools + guardrails + chat flow) — after executor bridge
8. **P15-P18** (Memory UI + extraction) — after soul data model + tools working
9. **P20** (Provider UI) — after SDK migration stable

---

## Agent Assignments

| Agent | Parcels | Focus |
|---|---|---|
| **Agent 2** (Staff Engineer) | P1, P2, P3, P7, P8, P9, P10, P11, P12, P14, P15, P17, P18, P20 | Primary implementer — React components, Zustand wiring, service layer, UI |
| **Agent 3** (Architect) | P3, P4, P5, P6, P8, P16, P19 | Data model design, system prompt architecture, SDK migration, extraction pipeline |
| **Agent 4** (Security) | P2, P13 | API key storage security review, tool-use guardrails review |
| **Agent 7** (Code Reviewer) | All parcels | Quality gate — reviews every parcel before completion |
| **Agent 11** (Feature Integrity) | All parcels | Regression check — ensures existing features aren't broken |
| **Design Agents** | P15, P18, P20 | UI review for Soul File page, notification design, provider settings UI |

---

## Sprint-Level Definition of Done

- [ ] `cd daily-flow && npm run lint && npm run typecheck && npm run test && npm run build` — all pass
- [ ] Setup wizard runs once and only once (BUG-1 resolved)
- [ ] API keys persist across sessions securely (BUG-2 resolved)
- [ ] Soul file stores user memories in SQLite `ai_memories` table
- [ ] Concierge system prompt uses 6-layer assembly with memories, profile, and app context
- [ ] Concierge can create tasks, journal entries, calendar events via natural language
- [ ] Concierge can search/read tasks, journal, calendar, notes, routines via natural language
- [ ] Concierge can complete tasks, log routines/habits via natural language
- [ ] Tool-use has security guardrails (confirmation, audit trail, undo)
- [ ] "Remember this" saves to ai_memories and concierge uses it in future conversations
- [ ] Soul File settings page shows all memories with edit/delete/add
- [ ] Extraction pipeline auto-learns from conversations
- [ ] At least 7 LLM providers supported (up from 3)
- [ ] Agent 7 code audit — 0 unresolved P0
- [ ] Agent 11 feature integrity — DoD verified
- [ ] 3-agent design review — all PASS
- [ ] E2E test against deploy preview
- [ ] Sandbox review by user (Phase 5)

---

## Deliberately Deferred

| Item | Why | Target |
|---|---|---|
| UX-1: Subtask reorder | Not related to AI/concierge focus | Sprint 25 |
| UX-2: Journal sidebar titles | Minor UX, not blocking | Sprint 25 |
| OpenRouter integration | Nice-to-have after core SDK migration | Sprint 25 |
| File attachments | Vault stable, AI is priority | Sprint 25 |
| Bundle optimization (482KB JS) | Not blocking Phase A ship | Sprint 25 |
| `local-entities-core.ts` / `ext.ts` file size | Minor overage | Sprint 25 |
| Vault organization (move, sort, reorder) | After vault + AI stable | Sprint 25+ |
| Wikilinks + backlinks | Requires content indexing | Sprint 25+ |
| Google Calendar integration | Post-launch fast-follow | Sprint 27+ |
| Gmail integration | Post-launch fast-follow | Sprint 27+ |
| Topic-level AI access controls | Phase B feature | Post-launch |
| Mobile responsive design | Phase B+ | Post-launch |
| Navigate_to tool | Low priority — users can navigate themselves | Sprint 25 |

---

## Metrics

| Metric | Before (Sprint 23) | Target | Actual |
|---|---|---|---|
| Tests passing | 265 | 290+ | |
| LLM providers supported | 3 | 7+ | |
| Concierge tools | 0 | ~20 | |
| AI memories stored | 0 | Working (CRUD + FTS5) | |
| System prompt layers | 2 | 6 | |
| API key persists across sessions | No | Yes (secure) | |
| Setup wizard runs once | No (repeats) | Yes | |
| Conversation summaries | 0 | Auto-generated | |
| Memory extraction | None | Auto after convo ends | |

---

## Quality Gates

```
[ ] Deterministic checks: lint (0 errors), typecheck (clean), test (pass), build (success)
[ ] Agent 7 code audit: 0 unresolved P0
[ ] Agent 11 feature integrity: PASS — existing features preserved
[ ] 3-agent design review: all PASS (for UI parcels: P15, P18, P20)
[ ] E2E test against deploy preview URL
[ ] Sandbox review by user (Phase 5)
```

---

## Risk Register

| Risk | Mitigation |
|---|---|
| Vercel AI SDK migration breaks existing chat | Migrate incrementally — OpenAI first, then add providers. Keep fallback to current implementation until SDK is verified. |
| Tool-use adds latency to chat responses | Tool execution is client-side (Zustand actions are synchronous). Only the LLM round-trip adds latency. Monitor and optimize if needed. |
| Extraction pipeline produces garbage memories | Use structured extraction prompt with categories. FTS5 dedup prevents duplicates. User can delete bad memories from Soul File page. |
| Token budget exceeded by system prompt | Measure token count per layer. Hard cap at ~2K tokens for context. Prioritize recent memories, truncate oldest. |
| API key encryption on web is weak | Agent 4 reviews approach. Encrypted localStorage with PBKDF2-derived key is the minimum bar. "Remember this device" checkbox gives user control. |
| Sprint is too large (20 parcels) | Tracks 4-5 are P1 and can be descoped if Track 1-3 run long. Core deliverable is: bugs fixed + soul file works + concierge acts. |

---

*Sprint 24 — Soul File & Concierge Intelligence — March 3, 2026*
