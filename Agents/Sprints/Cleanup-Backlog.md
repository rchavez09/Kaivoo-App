# Cleanup Backlog — Pre-Launch Issues

**Source:** User testing feedback, March 3, 2026
**Priority:** These must be resolved before Phase A ship. Plan a cleanup sprint (or fold into Sprint 24/25).

---

## Bugs

### BUG-1: Setup wizard repeats on every login
**Severity:** P0 — Blocks usable product
**Symptom:** User goes through the full setup wizard every time they open the app, not just on first launch.
**Root cause (suspected):** `SetupGuard` in [App.tsx:49](daily-flow/src/App.tsx#L49) checks `localStorage.getItem('kaivoo-setup-complete')`. Possible causes:
- If running from a deploy preview (different origin each time), localStorage is origin-scoped and won't persist across different preview URLs
- If Supabase auth is clearing localStorage on session refresh
- If the wizard's `handleComplete` in [SetupWizard.tsx:78](daily-flow/src/pages/SetupWizard.tsx#L78) isn't being reached (user might be navigating away before the final step completes)
**Fix:** Investigate root cause. Consider also persisting the flag to SQLite (desktop) or Supabase `user_preferences` (web) as a backup to localStorage.

### BUG-2: API keys not saved between sessions
**Severity:** P0 — Blocks AI usage entirely
**Symptom:** User must re-enter their API key every time they open the app or close the tab.
**Root cause (confirmed):** API key is stored in `sessionStorage` ([settings.ts:28-40](daily-flow/src/lib/ai/settings.ts#L28-L40)), which clears on tab close. This was a Sprint 23 security decision (Agent 7 P0 finding to prevent key leakage via localStorage).
**Fix:** Move to a secure persistence layer:
- **Desktop (Tauri):** Use `tauri-plugin-stronghold` or system keychain (`tauri-plugin-keyring`) — encrypted vault, OS-level security
- **Web:** Encrypted localStorage with a user-derived key, OR IndexedDB with encryption, OR prompt for key on session start with "remember for this device" checkbox
- **Agent 4 (Security) should review** the approach before implementation
**Note:** This is the single biggest blocker to AI being usable. Users will not re-enter keys every session.

---

## UX Issues

### UX-1: Cannot reorder subtasks
**Severity:** P1
**Symptom:** Subtasks are displayed in creation order. User cannot drag to reorder.
**Fix:** Add `sort_order` column to subtasks table. Implement drag-to-reorder (dnd-kit is already in the dependency stack from Sprint 19). Update LocalAdapter + SupabaseAdapter.

### UX-2: Journal/notes sidebar shows only timestamp, not renamed entry name
**Severity:** P2
**Symptom:** In the right-hand panel of notes/journal, entries show only their timestamp. When a user renames an entry, the renamed title should appear alongside the timestamp (e.g., "2:30 PM — My Meeting Notes"), not just "2:30 PM".
**Fix:** Update the sidebar entry renderer to show `entry.title || entry.name` alongside the timestamp. If title is set, format as "{time} — {title}". If not, show just the time.

### UX-3: BYOK limited to 3 providers — should support any model
**Severity:** P1 — Affects product promise ("BYO everything")
**Symptom:** AI settings only offer OpenAI, Anthropic, Ollama. Users who want to use Gemini, Mistral, Groq, DeepSeek, Cohere, or any other provider can't.
**Fix options:**
- **Option A (Quick):** Add more providers to the hardcoded list (Gemini, Mistral, Groq, DeepSeek). Each needs its own API format handling in the edge function.
- **Option B (Scalable):** Use LiteLLM or a similar universal gateway that normalizes 100+ provider APIs into one OpenAI-compatible interface. User enters provider + model + key, the gateway handles the rest.
- **Option C (MCP):** Expose an MCP-based model connector that lets users plug in any MCP-compatible LLM server. Future-proof but more complex.
- **Recommendation:** Research pending (LLM MCP investigation). Likely Option B (LiteLLM / OpenAI-compatible proxy) is the fastest path to "any model."

---

## Concierge Tool-Use System (New Feature — Sprint 24)

The concierge must be a **full action agent** — anything the user can do through the UI, the concierge can do through conversation. This is what makes "day execution" real: the AI doesn't just know your data, it acts on it.

### TOOLS-1: Concierge as full action agent
**Priority:** P0 — Core to product promise
**Requirement:** The concierge can create, read, update, and complete any entity in the app via natural language. Examples:
- "Create a task for NUWAVE for tomorrow"
- "Remind me to take out the trash tomorrow" → creates a task
- "Create a new journal entry called Kaivoo for me"
- "Make a new calendar meeting for today at 2pm for car wash"
- "Check off my running routine and smoking habit"
- "What notes do I have for topic NUWAVE #Mark?"
- "Can you get me the PPT for the #gerry presentation?"
- "Change my settings to light mode"

### Tool Catalog

**Create tools:**
| Tool | Description | Parameters |
|---|---|---|
| `create_task` | Create a new task | title, project?, due_date?, priority?, description? |
| `create_journal_entry` | Create a journal entry | title?, content?, date? (defaults to today) |
| `create_calendar_event` | Create a calendar event/meeting | title, date, start_time, duration?, description? |
| `create_capture` | Quick capture a thought/note | content, tags?[] |
| `create_note` | Create a note in a topic | title, content?, topic? |

**Read/Search tools:**
| Tool | Description | Parameters |
|---|---|---|
| `search` | Full-text search across all entities | query, entity_type?, topic?, date_range? |
| `get_tasks` | List tasks with filters | status?, project?, due_date?, priority? |
| `get_journal` | Get journal entries | date? (defaults to today), date_range? |
| `get_calendar` | Get calendar events | date? (defaults to today), date_range? |
| `get_notes` | Get notes for a topic | topic, search_query? |
| `get_routines` | Get routines/habits status | date? (defaults to today) |
| `get_file` | Read a vault file by path/name | path_or_name, topic? |
| `get_captures` | Get recent captures | limit?, tags?[], date_range? |
| `get_projects` | List projects | status? |

**Update/Complete tools:**
| Tool | Description | Parameters |
|---|---|---|
| `complete_task` | Mark a task as done | task_name_or_id |
| `update_task` | Modify a task | task_name_or_id, title?, due_date?, priority?, status? |
| `log_routine` | Check off a routine for today | routine_name, date? |
| `log_habit` | Log a habit entry | habit_name, count?, date? |
| `update_settings` | Change app settings | setting_key, value |

**Navigation tools:**
| Tool | Description | Parameters |
|---|---|---|
| `navigate_to` | Open a page in the app | page (today/tasks/calendar/journal/vault/settings), params? |

### Architecture

Uses LLM provider's native **function calling / tool use** capability:
1. Tools defined as JSON schemas, sent with every chat request
2. LLM decides which tool(s) to call based on user's message
3. App executes the tool call against Zustand store actions / service layer
4. Result returned to LLM for natural language response
5. Action logged to `ai_action_logs` with undo capability

**Key:** Tools map directly to existing service layer functions and Zustand actions — no new business logic needed, just wiring.

### Security Guardrails

| Rule | Implementation |
|---|---|
| **No destructive actions without confirmation** | Delete operations require "Are you sure?" before execution |
| **Audit trail** | Every tool call logged to `ai_action_logs` (already exists) |
| **Undo** | Every action logged with enough data to reverse it (already built in `useAIActionLog`) |
| **Settings changes are reversible** | Theme/display changes immediate. Provider/key changes require confirmation. |
| **No API key access** | Concierge cannot read or expose API keys through tool calls |
| **Read-before-write** | For ambiguous references ("the NUWAVE task"), search first, confirm match, then act |

### DATA-2: Topic-level access controls (Future — Phase B)
**Priority:** Deferred
**Requirement:** User can mark certain Topics (e.g., "Journaling") as private/off-limits to the concierge. The concierge respects these boundaries.
**Implementation:** `ai_access` boolean on topics table. Concierge tool calls filter by `ai_access = true`. Settings UI to toggle per-topic.
**Note:** For Phase A launch, concierge has access to everything. Access controls come in Phase B.

---

## Not For Phase A

### MOBILE-1: App not mobile-friendly
**Priority:** Phase B+ (Post-launch)
**Symptom:** Layout, touch targets, and navigation not optimized for mobile screens.
**Fix:** Responsive design pass, PWA support, or dedicated mobile build. Deferred — desktop + web is the Phase A target.

---

*Cleanup Backlog — March 3, 2026*
