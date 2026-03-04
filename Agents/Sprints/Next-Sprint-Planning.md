# Next Sprint Planning

**Updated:** March 3, 2026
**Last completed:** Sprint 23 (Setup & AI Foundation)
**Source:** CEO Session #5 — Vision v5.0 strategic pivot

---

## Strategic Context (CEO Session #5)

- **Three-tier revenue model adopted:** Core $49 one-time (BYO keys) / Pro subscription (managed AI + sync) / Builders subscription (orchestrator)
- **"Day execution" positioning:** Kaivoo owns "day execution" — today is where notes become actions and actions become delegated AI work
- **Soul file is the differentiator:** Persistent AI memory the user owns, reads, edits, and exports. This is the "own your AI's memory" story.
- **Gmail/Calendar deferred to post-launch:** Launch story is "AI concierge that knows you" — not "email client"
- **Cleanup sprint required:** User-reported P0 bugs (wizard repeat, API key persistence) must be resolved before ship

---

## Sprint 24: Soul File & Concierge Intelligence

**Theme:** Make the concierge actually know you. Fix P0 bugs. Upgrade BYO-key to support any provider.
**Priority:** This is the emotional core of the product. The soul file is what makes people say "I can't go back to ChatGPT."

### Track 1: P0 Bug Fixes (P0 — Do First)

| Parcel | Description |
|---|---|
| **BUG-1: Setup wizard repeats** | Investigate why `kaivoo-setup-complete` flag isn't persisting between sessions. Also persist to SQLite (desktop) or Supabase user_preferences (web) as backup. See `Cleanup-Backlog.md`. |
| **BUG-2: API key persistence** | Move from `sessionStorage` to secure storage. **Desktop:** `tauri-plugin-stronghold` or `tauri-plugin-keyring` (OS keychain). **Web:** Encrypted localStorage with user-derived key OR "remember for this device" checkbox. Agent 4 security review required. |

### Track 2: Soul File Foundation (P0)

| Parcel | Description |
|---|---|
| Enhanced SoulConfig | Expand interface: `userName`, `userAddress`, `verbosity`, `backstory`, `communicationNotes`. Migrate existing soul data. |
| `ai_memories` table | SQLite table: id, content, category (preference/fact/goal/relationship/pattern), source (hatching/user_edit/extraction/explicit), created_at, updated_at, active. Dual-adapter (LocalAdapter + SupabaseAdapter). |
| `ai_conversation_summaries` table | SQLite table: id, conversation_id, summary, key_facts (JSON), created_at. |
| System prompt assembler | 6-layer assembly: Identity → User Profile → Memories → Recent Conversations → App Context → Behavioral Rules. Replaces current 2-line builder. |
| User-triggered memory | When user says "remember this" or similar, concierge acknowledges and saves to `ai_memories` with source='explicit'. |

### Track 3: Concierge Tool-Use System (P0)

The concierge becomes a **full action agent** — anything the user can do through the UI, the concierge can do via conversation. This is what makes "day execution" real.

| Parcel | Description |
|---|---|
| Tool schema definitions | Define all tools as JSON schemas for LLM function calling. ~20 tools across create/read/update/navigate categories. See `Cleanup-Backlog.md` for full catalog. |
| Tool executor bridge | Map each tool call to existing Zustand store actions / service layer functions. No new business logic — just wiring. |
| Create tools | `create_task`, `create_journal_entry`, `create_calendar_event`, `create_capture`, `create_note` — all map to existing store actions. |
| Read/search tools | `search`, `get_tasks`, `get_journal`, `get_calendar`, `get_notes`, `get_routines`, `get_file`, `get_captures`, `get_projects` — all map to existing queries/stores. |
| Update/complete tools | `complete_task`, `update_task`, `log_routine`, `log_habit`, `update_settings` — map to existing actions. |
| Security guardrails | Confirmation for destructive actions, audit trail via `ai_action_logs`, undo capability, no API key exposure, read-before-write for ambiguous references. |
| App context injection | System prompt includes: tasks due today, calendar events, journal status, active projects. Read from Zustand stores. |
| Edge function / client-side tool execution | Update chat flow to handle tool-use responses: LLM returns tool call → app executes → result sent back → LLM gives natural language response. |

### Track 4: Memory UI & Extraction (P1)

| Parcel | Description |
|---|---|
| Soul File settings page | Settings > Soul File — view all memories in list, edit/delete each, add manually. Edit personality (name, tone, backstory, communication notes). |
| Extraction pipeline | After conversation ends, send to cheap model (Haiku/GPT-4o-mini) with extraction prompt. Compare against existing via FTS5. ADD/UPDATE/SKIP. |
| Conversation summaries | After each conversation, generate summary + key_facts. Store in `ai_conversation_summaries`. Inject last 3-5 into system prompt. |
| Memory notification | After extraction, show subtle notification: "{name} remembered N new things" → tapping opens memory list. |

### Track 5: Universal BYO-Key (P1)

| Parcel | Description |
|---|---|
| Vercel AI SDK migration | Replace current per-provider chat service with Vercel AI SDK (`ai` package). Unified interface for all providers. Streaming support built in. |
| OpenAI-compatible providers | Support Groq, DeepSeek, Mistral, Together AI, and any OpenAI-compatible endpoint via `baseURL` override. User enters: provider name + API key + base URL (optional) + model name. |
| Provider settings UI update | Dropdown with common providers (OpenAI, Anthropic, Google Gemini, Groq, Mistral, DeepSeek, Ollama) + "Custom (OpenAI-compatible)" option for any arbitrary endpoint. |
| OpenRouter option | Add OpenRouter as a "one key, all models" convenience option. User enters one key, picks from OpenRouter's model list. |
| Edge function update | Update `ai-chat` edge function to handle the expanded provider set OR move chat to client-side (Tauri desktop) to eliminate the proxy requirement. |

**Research finding:** Many providers now expose OpenAI-compatible endpoints natively (Groq, DeepSeek, Mistral, Together, Ollama). The OpenAI SDK + `baseURL` override covers ~8 providers with zero extra dependencies. Vercel AI SDK adds native Anthropic + Google Gemini support on top.

---

## Sprint 25: Cleanup & Ship Prep

**Theme:** Fix remaining UX issues. Prepare ship infrastructure. Make everything feel finished.

### Track 1: UX Cleanup (P1)

| Parcel | Description |
|---|---|
| **UX-1: Subtask reorder** | Add `sort_order` column to subtasks. Implement drag-to-reorder with dnd-kit. Update LocalAdapter + SupabaseAdapter. |
| **UX-2: Journal sidebar titles** | Show renamed entry name alongside timestamp in right panel: "{time} — {title}" instead of just "{time}". |
| Bundle optimization | Currently 482KB JS — target < 350KB. Review Vite chunks, lazy load heavy imports. |
| File size overages | Split `local-entities-core.ts` (611L) and `local-entities-ext.ts` (670L). |
| General polish pass | User will likely report more issues during Sprint 24 testing — reserve capacity for fixes. |

### Track 2: Licensing & Payments (P0)

| Parcel | Description |
|---|---|
| License key system | Key generation, activation flow, tier validation (Core $49 / Standard $99 / Founding Member) |
| Stripe integration | One-time payment, webhook for key delivery, receipt email |

### Track 3: Marketing & Legal (P0)

| Parcel | Description |
|---|---|
| Landing page | Positioning, pricing table, screenshots, CTA → purchase flow. "Own your AI's memory" messaging. See `Marketing/Marketing-Copy-Draft.md` for raw copy. |
| EULA / legal | Proprietary license, privacy policy, terms of service. Attorney review required. |

### Track 4: Final Polish (P1)

| Parcel | Description |
|---|---|
| File attachments | Files in project/topic folders, images inline in notes, `.attachments/` storage |
| Desktop polish | .dmg clean install, auto-update mechanism, Tauri bug fixes |
| Getting started guide | Quick setup doc, BYO key walkthrough, FAQ |

---

## Sprint 26: Launch

- Product Hunt listing + launch day plan
- Community setup (Discord or GitHub Discussions)
- Basic analytics + error reporting (privacy-respecting)
- Monitor, respond, iterate

---

## Post-Launch Fast-Follow (Sprint 27+)

| Item | Notes |
|---|---|
| Google Calendar integration | MCP server exists: `mcp-server-google-calendar` (nspady). Evaluate for faster delivery than OAuth from scratch. |
| Gmail integration | MCP server exists: `mcp-server-gmail`. Evaluate alongside Calendar. |
| Soul file Phase 2 | Embedding-based retrieval when memories > 200, memory decay, MCP server exposure |
| Topic-level AI access controls | Per-topic `ai_access` toggle so users can mark sensitive topics as off-limits to concierge |
| Mobile responsive design | Layout, touch targets, navigation for mobile screens. PWA support. |
| Outlook integration | After Google Calendar/Gmail |
| White-label config | Logo, colors, app name as settings |
| Notifications & reminders | System notifications for tasks, calendar events |

### Research Findings: Universal BYO-Key

**Vercel AI SDK** (`ai` package) is the recommended TypeScript-native solution. Supports 15+ providers with a unified interface. Streaming built-in. Provider plugins: `@ai-sdk/openai`, `@ai-sdk/anthropic`, `@ai-sdk/google`, `@ai-sdk/mistral`.

**OpenAI-compatible endpoints** (zero extra deps):
- Groq: `https://api.groq.com/openai/v1`
- DeepSeek: `https://api.deepseek.com/v1`
- Mistral: `https://api.mistral.ai/v1`
- Together AI: `https://api.together.xyz/v1`
- Ollama: `http://localhost:11434/v1`

**OpenRouter** (`https://openrouter.ai/api/v1`): One API key → 100+ models. Good as "easy mode" default.

**Secure key storage:**
- Desktop: `tauri-plugin-stronghold` (encrypted vault) or `tauri-plugin-keyring` (OS keychain)
- Web: Encrypted localStorage or IndexedDB with user-derived key

### Research Findings: Google Calendar/Gmail MCP

- `mcp-server-google-calendar` by nspady — OAuth2, read/write, well-maintained
- `mcp-server-gmail` — community-built, OAuth2, read/search/send
- Google may have official MCP servers by now — check latest ecosystem

### MCP Security Notes

Any MCP integration must include:
- Scoped permissions per server
- User approval for actions
- Audit trail for tool calls
- Localhost-only for local MCP servers (no external SSRF)
- Prompt injection safeguards when models can access sensitive data

---

## Backlog (Lower Priority)

### Vault Enhancements

| Item | Notes |
|---|---|
| Drag-and-drop file upload | After file browser is stable |
| Wikilinks + backlinks | Requires content indexing |
| File type filtering (PDF, image, etc.) | After basic browser works |
| Folder templates ("New Client Project") | After core vault is stable |
| Vault organization: move, sort, manual reorder | Hybrid approach: opinionated defaults + full user freedom |

### Deferred Features (P2)

| Item | Source |
|---|---|
| "Don't Miss Twice" forgiveness | Sprint 18 |
| Year in Pixels | Sprint 18 |
| AI "Organize My Day" | Sprint 18 |
| Filter/entity toggle system | Sprint 18 |
| Timed habits | Sprint 18 |
| Cross-platform shortcut recording | Sprint 18 |

---

*Next Sprint Planning — Updated March 3, 2026 — Reflects CEO Session #5, Vision v5.0, user-reported bugs, and LLM MCP research*
