# Next Sprint Planning

**Updated:** March 7, 2026
**Last completed:** Sprint 31 (Tasks + Projects Merge)
**Current sprint:** Sprint 32 (Knowledge Unification) — PLANNING
**Source:** Phase-A-Roadmap, Sprint 31 retrospective + deferred items, Agent docs scan (March 7, 2026), Vision v7.5

---

## Sprint 32: Knowledge Unification — PLANNING

See `Sprint-32-Knowledge-Unification.md` for full plan.

**Theme:** Merge Vault and Topics into a unified "Knowledge" page with top-level tabs.
**Parcels:** 10 (3 tracks: Knowledge Page Tabs, Navigation & Routing, Polish & Consistency)
**Branch:** `sprint/32-knowledge-unification`

---

## Sprint 33: Cleanup + Hardening

**Theme:** Code quality, accessibility, technical debt, security.
**Timeline:** After Sprint 32 merges.

- Code quality: extract import utilities, Zod validation, duplicate import warning (Agent 7 Sprint 27)
- Accessibility: dark mode contrast fix (3.8:1 → 4.5:1), Sprint 25 P1s (17 items), touch targets (P2)
- Technical debt: empty state/editor co-presence, adapter gaps, htmlToPlainMarkdown, TS casts (Agent 11 Sprint 26)
- Adapter layer P1 issues: try/catch, FTS5 stale index, habits/routines discriminator, adapter recreation, empty-input guard (Agent 7 Sprint 21)
- Security: CORS hardening, rate limiting
- Concierge: `to_tsquery` sanitization, coherence monitor tone expansion, dead code cleanup, floating-point fix, pre-compaction flush status message
- Full concierge integration in project Chat tab (Sprint 31 P10)
- ProjectDetail component splitting (~476 lines)
- Bundle size audit (<512KB budget)
- Screenshots retake (Sprint 29 P7)
- Prettier pre-commit hook
- Plus any issues surfaced during Sprint 32

---

## Sprint 34: Ship Prep

**Theme:** Code signing, revenue pipeline deployment, final QA.
**Timeline:** After Sprint 33 merges.

- Code signing: Developer ID Application cert + Apple notarization + Azure Trusted Signing
- Revenue pipeline: Stripe config, Edge Function deploy, payment testing
- Landing page v7.1 update (add "Try Free" CTA alongside "Buy Desktop")
- Final QA pass

---

## Post-Launch Fast-Follow (Sprint 35+)

### Concierge Memory Architecture (CEO Session #7 — Priority)

The concierge memory architecture is Flow's competitive moat. These items build the 7-layer cortex/hippocampus model from Vision v7.0.

| Item | Notes | Vision Layer |
|---|---|---|
| Pre-compaction memory flush | **DONE** (Sprint 30) | Layer 4 |
| Deterministic context assembly | **DONE** (Sprint 30) | Layer 1-2 |
| Concierge coherence monitoring (basic) | **DONE** (Sprint 30) | Layer 7 (basic) |

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
| Exec approval system design | Agent 4 | Study OpenClaw's pattern: unique approval IDs, timeouts, audit trail. Design Flow's version for Orchestrator. |
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

*Next Sprint Planning — Updated March 7, 2026 — Sprint 31 (Tasks + Projects Merge) shipped. Sprint 32 (Knowledge Unification) in planning. Design decision: top-level tabs on Topics page (Topics | Vault), renamed sidebar entry to "Knowledge". Follows Sprint 31 tabs-merge pattern. Sprint plan aligned with Phase-A-Roadmap (Sprints 32–34).*
