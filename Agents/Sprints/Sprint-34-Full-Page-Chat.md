# Sprint 34 — Full-Page AI Chat + Conversation History

**Theme:** Give the concierge a real home.
**Branch:** `sprint/34-full-page-chat`
**Status:** IN PROGRESS
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
| Parcels | 5 | |
| Build passes | Yes | |
| Lint clean | Yes | |
| Typecheck clean | Yes | |
| Tests pass | Yes | |
| New tests added | Yes | |

---

*Sprint 34 — Full-Page AI Chat — Compiled March 10, 2026*
