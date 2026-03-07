# Next Sprint Planning

**Updated:** March 6, 2026
**Last completed:** Sprint 27 (Desktop Verification)
**Current sprint:** Sprint 28 (Launch Ready) — ACTIVE
**Source:** Sprint 27 retrospective, Vision v7.0, CEO Strategic Brief, CEO Session #7 (Adam/OpenClaw analysis)

---

## Sprint 28: Launch Ready — ACTIVE

See `Sprint-28-Launch-Ready.md` for full plan.

**Theme:** Close the last mile — deploy backend services, build the storefront, draft legal. No new features. The product code is done. This sprint makes it purchasable.
**Parcels:** 11 (revenue pipeline, landing page, legal)
**Branch:** `sprint/28-launch-ready`

---

## Sprint 29: Harden & Launch

**Theme:** Security hardening, accessibility, E2E testing, and launch execution.
**Timeline:** After Sprint 28 merges.

- Product Hunt launch execution
- Security hardening (Stripe webhook timestamp, CORS, rate limiting)
- Accessibility P1s (17 items from Sprint 25 design review)
- E2E test infrastructure (Playwright)
- Getting started guide / onboarding docs
- Terms of Service
- Community setup (Discord or GitHub Discussions)
- Basic analytics + error reporting (privacy-respecting)
- Code signing resolution (if accounts verified)
- Extract import functions to utility files (Agent 7 P1-1 from Sprint 27)
- Import validation with Zod schema (Agent 7 P1-2 from Sprint 27)
- Duplicate import warning dialog (Agent 7 P1-3 from Sprint 27)
- Agent 11 Sprint 26 non-blocking concerns (empty state, widgetSettings, HTML-to-markdown, TS casts)

---

## Post-Launch Fast-Follow (Sprint 30+)

### Concierge Memory Architecture (CEO Session #7 — Priority)

The concierge memory architecture is Kaivoo's competitive moat. These items build the 7-layer cortex/hippocampus model from Vision v7.0.

| Item | Notes | Vision Layer |
|---|---|---|
| Pre-compaction memory flush | Before context truncation, force concierge to write lasting notes to `ai_memories`. Prevents context loss in long chats. Small, high-impact. | Layer 4 |
| Deterministic context assembly | Audit Sprint 24's 6-layer system prompt. Ensure soul/memory injection is compiled from structured data, not AI-generated. Define `assembleConciergeContext()` abstraction. | Layer 1-2 |
| Concierge coherence monitoring (basic) | Lightweight drift detection: is the concierge still referencing soul personality? Still citing user data accurately? Log drift signals for Phase B advanced monitoring. | Layer 7 (basic) |

### Integrations & Enhancements

| Item | Notes |
|---|---|
| Google Calendar integration | MCP server exists: `mcp-server-google-calendar` |
| Gmail integration | MCP server exists: `mcp-server-gmail` |
| Topic-level AI access controls | Per-topic `ai_access` toggle |
| Mobile responsive design | Layout, touch targets, navigation. PWA support. Foundation for companion app. |
| White-label config | Logo, colors, app name as settings |
| Notifications & reminders | System notifications for tasks, calendar events |
| Import progress indicator | Agent 7 P2-2 from Sprint 27 |
| Image resize handles in editor | Sprint 27 |

### Phase B Foundation (Research Sprint)

These items run as research parcels to de-risk Phase B architecture:

| Item | Owner | Notes |
|---|---|---|
| Hybrid memory search architecture | Agent 3 | Embedding provider selection, SQLite vector extension, temporal decay tuning, token budget for hippocampus |
| Memory consolidation pipeline design | Agent 3 | Sleep cycle: diff-based consolidation, dedup, relevance scoring, stale memory pruning |
| Companion app architecture | Agent 3 | Stripped-down mobile: concierge chat, today view, quick capture. PWA vs. native. Session scoping (one brain, many mouths). |
| Concierge coherence signal definition | Agent 3 | What behavioral signals define "drift"? Personality consistency, data citation accuracy, generic-vs-personalized scoring |
| Exec approval system design | Agent 4 | Study OpenClaw's pattern: unique approval IDs, timeouts, audit trail. Design Kaivoo's version for Orchestrator. |
| Memory hippocampus token budget | Agent 5 | How many tokens for compiled working memory? Cost implications at scale across providers. |
| Companion app sync costs | Agent 5 | Per-user sync bandwidth, concierge API routing, push notification infrastructure costs |
| Memory tier pricing model | Agent 8 | Is hybrid search + sleep cycle compelling for subscription conversion? Willingness-to-pay vs. free AI chat. |

---

## Backlog (Lower Priority)

### Vault Enhancements

| Item | Notes |
|---|---|
| In-vault markdown editor | Full editing surface inside the vault browser (Phase B) |
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

*Next Sprint Planning — Updated March 6, 2026 — Sprint 28 (Launch Ready) active, Sprint 29 (Harden & Launch) staged. Post-launch roadmap updated with concierge memory architecture (CEO Session #7, Adam/OpenClaw analysis), companion app as communication layer, Phase B research parcels.*
