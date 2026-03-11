# Sprint 34 — Full-Page AI Chat + Conversation History

**Theme:** Give the concierge a real home.
**Branch:** `sprint/34-full-page-chat`
**Status:** COMPLETE
**Compiled by:** Dev Director
**Date:** March 10, 2026

---

## Why This Sprint Exists

The floating chat bubble is a demo toy. A full-page chat with persistent conversations is what makes the concierge feel like a real AI assistant — and is table stakes for the orchestrator work in Sprints 39+. This sprint delivers the chat page, conversation history, and model selection.

**Result:** Users have a dedicated AI chat experience with persistent conversations they can revisit, search, rename, and delete.

---

## Input Sources

| Source | Key Takeaways |
|---|---|
| Next-Sprint-Planning.md | Sprint 34 defined: full-page chat, conversation sidebar, persistent storage, model selector |
| Sprint 33 Retrospective | Clean merge. 10/10 parcels. 22/22 E2E. No regressions. Ready for feature work. |
| Agent 11 Sprint 30 (RISK-3) | Pre-compaction latency on long convos (2-5s). Consider "Saving insights..." UX. |
| Agent 3 | Bundle ~482 KB gzipped. New route must be code-split (React.lazy). |

---

## Architecture Decisions

- **Code splitting:** `/chat` route loaded via `React.lazy()` + `Suspense` — zero impact to initial bundle
- **Storage:** Follows existing DataAdapter pattern (Supabase for web, SQLite for desktop)
- **AI service:** Reuses existing `AIConcierge` service — this is a UI sprint, not an AI rewrite
- **Streaming:** Port existing streaming hooks from floating chat — no new AI plumbing needed

---

## Parcels

### Track 1 — Chat Page (Agent 2)

#### P1: `/chat` Route — Full-Page Chat Interface
**Source:** Next-Sprint-Planning.md
**Status:** TODO
**Agent:** Agent 2

Full-page chat at `/chat` with message list, input area, and streaming responses. Layout: conversation sidebar on left, chat area on right.

**Definition of Done:**
- [ ] `/chat` route exists, accessible from sidebar navigation
- [ ] Message list displays user and assistant messages with proper styling
- [ ] Input area with send button and Enter-to-submit
- [ ] Streaming responses render token-by-token
- [ ] Route is code-split via React.lazy() — no initial bundle impact
- [ ] Responsive layout (sidebar collapses on mobile)

---

#### P2: Conversation List Sidebar
**Source:** Next-Sprint-Planning.md
**Status:** TODO
**Agent:** Agent 2
**Depends on:** P1

Sidebar showing all conversations. Navigate between them, search, delete, rename.

**Definition of Done:**
- [ ] Conversation list displays all saved conversations (newest first)
- [ ] Click to switch between conversations (loads message history)
- [ ] "New Chat" button creates a fresh conversation
- [ ] Search/filter conversations by title or content
- [ ] Right-click or menu: rename conversation
- [ ] Right-click or menu: delete conversation (with confirmation)

---

#### P3: Persistent Conversation Storage
**Source:** Next-Sprint-Planning.md
**Status:** TODO
**Agent:** Agent 2, Agent 12
**Depends on:** P1

Conversations persist across sessions via DataAdapter pattern.

**Definition of Done:**
- [ ] Conversation model: id, title, created_at, updated_at
- [ ] Message model: id, conversation_id, role, content, model, provider, created_at
- [ ] CRUD operations via DataAdapter (Supabase + SQLite dual-layer)
- [ ] Auto-title: first message or AI-generated title
- [ ] Messages load on conversation switch
- [ ] New conversations auto-save on first message

---

#### P4: Model/Provider Selector
**Source:** Next-Sprint-Planning.md
**Status:** TODO
**Agent:** Agent 2
**Depends on:** P1

Model and provider selection accessible from the chat page. Reuse existing provider configuration.

**Definition of Done:**
- [ ] Dropdown or selector showing configured providers and models
- [ ] Selected model persists per conversation
- [ ] Model shown in chat header or message metadata
- [ ] Reuses existing provider config — no new settings surfaces

---

#### P5: Floating Button → Quick Access
**Source:** Next-Sprint-Planning.md
**Status:** TODO
**Agent:** Agent 2
**Depends on:** P1

Keep floating chat button as quick-access. Add "Open full chat" link that navigates to `/chat`.

**Definition of Done:**
- [ ] Floating button still opens inline chat popover
- [ ] "Open full chat" link/button in popover navigates to `/chat`
- [ ] When on `/chat` route, floating button is hidden (avoid duplication)

---

## Quality Gates

```
□ npm run format
□ npm run lint (0 errors)
□ npm run typecheck (PASS)
□ npm run test (all pass + new tests for conversation CRUD)
□ npm run build (PASS)
□ PR opened to main, CI passes
□ E2E tests pass against deploy preview URL
□ Sandbox: user reviews deploy preview
□ Merge PR to main
```

---

## Deliberately Deferred

- AI execution tools debugging → Sprint 35-36
- Configurable Heartbeat → Sprint 37
- Neuron Memory V1 → Sprint 38
- Orchestrator Page → Sprints 39-45

---

## Metrics

| Metric | Target | Actual |
|---|---|---|
| Parcels | 5 | 5/5 |
| Build passes | Yes | Yes (2.56s) |
| Lint clean | Yes | 0 errors |
| Typecheck clean | Yes | Clean |
| Tests pass | Yes | 265/265 |
| E2E pass | Yes | 22/22 on deploy preview |

---

## Retrospective

### What Shipped

Sprint 34 delivered the full-page AI chat experience plus significant UX polish found during sandbox testing. Two commits merged via PR #22:

1. **Core delivery** (`de1fccc`): ChatPage, useConciergeChat shared hook, /chat route, sidebar nav, floating chat coordination
2. **Sandbox fixes** (`1b3c6a7`): Markdown rendering, rename focus race fix, auto-expanding textarea, desktop text selection containment, message count color

**Key architecture wins:**
- **Shared hook extraction** — `useConciergeChat` consolidates ~290 lines of chat state/streaming/tool-loop/persistence logic that was previously duplicated between ConciergeChat (floating) and ChatPage. Both components now consume the same hook with an options/callbacks pattern (`UseConciergeChatOptions`) to handle component-specific behavior. Uses `callbacksRef` to keep `handleSend` stable.
- **Zero deferred debt** — Founder explicitly requested no deferrals given the tight launch timeline. The shared hook was extracted during Sprint 34 rather than deferred to 35.
- **Code-split correctly** — ChatPage chunk is 10.21 KB / 3.52 KB gzipped. Shared hook chunk (57.90 KB / 15.63 KB gzipped) is loaded by both chat surfaces.

### Sandbox Findings (All Fixed)

| Finding | Root Cause | Fix |
|---|---|---|
| Rename locks immediately after appearing | DropdownMenu focus return races with rename input focus (50ms delay too short) | Increased focus delay to 300ms; added blur timeout (200ms) with onFocus cancel |
| Message count invisible on active conversation | `text-muted-foreground` too dim against `bg-accent` | Conditional `text-foreground/60` for active state |
| Textarea doesn't expand for long messages | Fixed height, no auto-resize | `useEffect` watching `input` — auto-sizes up to 200px (ChatPage) / 160px (floating) |
| Responses render as raw markdown text | `{msg.content}` rendered plain text | `ReactMarkdown` + `remarkGfm` with prose classes for assistant messages and streaming |
| Text selection bleeds outside bubble on desktop | WebKit selection rendering in Tauri | `isolate` + `select-text` + `overflow-hidden` on message bubbles |
| Task lookup failed (AI couldn't find tasks due today) | **Pre-existing** date format mismatch: `getTasksDueToday()` compares against literal `'Today'` string but tasks stored as `yyyy-MM-dd` | Flagged for Sprint 35 — not a Sprint 34 regression |

### Velocity

- Planning → merge: ~4 hours (including Agent 7 review, shared hook extraction, sandbox testing, 6 bug fixes)
- No deferrals to future sprints (first time enforced this policy)
- Quality gates passed on every iteration

### What Went Well

- Founder caught 6 real issues during sandbox testing on Tauri desktop — validates the sandbox step
- `react-markdown` + `remark-gfm` were already in `package.json` — zero new dependencies for rich text rendering
- The shared hook pattern pays off immediately: sandbox bug fixes applied once, fixed in both surfaces

### What to Watch

- **Task date format inconsistency** is a real bug affecting AI tool execution. `getTasksDueToday()` uses `'Today'` literal vs `yyyy-MM-dd` used everywhere else. Should be fixed early in Sprint 35-36.
- **Pre-existing lint warnings** remain at 863. Not blocking but worth a cleanup sprint post-launch.

---

*Sprint 34 Retrospective — Written March 10, 2026, after merge to main*
