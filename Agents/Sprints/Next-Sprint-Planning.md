# Next Sprint Planning

**Updated:** March 6, 2026
**Last completed:** Sprint 28 (Launch Ready)
**Current sprint:** Sprint 29 (Flow Rebrand) — ACTIVE
**Source:** CEO Session #9 (Flow rebrand), Phase-A-Roadmap, Sprint 28 retrospective, Agent docs scan

---

## Sprint 29: Flow Rebrand — ACTIVE

See `Sprint-29-Flow-Rebrand.md` for full plan.

**Theme:** Rename everything from "Kaivoo" to "Flow by Kaivoo." Landing page rebuild, legal updates, in-app rename, wizard copy. No new features, no bug fixes — just identity.
**Parcels:** 7 (in-app rebrand + external rebrand)
**Branch:** `sprint/29-flow-rebrand`

---

## Sprint 30: Bug Bash + Concierge Hardening

**Theme:** Fix P1 bugs, harden the concierge memory architecture, polish uploads.
**Timeline:** After Sprint 29 merges.

**Bugs (Must Fix):**
- Data loss: TopicPage unmount doesn't flush pending saves (Agent 7 P1-A)
- Base64 image unbounded growth (~2.7MB per image, Agent 7 P1-B)
- Missing Supabase migration for content column (Agent 3 / Agent 7 P2-A)
- Subtask reorder not working
- Today page widgets not reorderable
- Calendar widget showing old Supabase data / can't toggle on with no events
- Search prefix matching ("NU" doesn't find "NUWAVE")

**Concierge Hardening:**
- Pre-compaction memory flush (Layer 4)
- Deterministic context assembly (Layer 1-2)
- Basic coherence monitoring (Layer 7 basic)

**UX Polish:**
- Image renaming on uploads
- Upload system polish (progress, drag-drop zones)

---

## Sprint 31: Tasks + Projects Merge

**Theme:** UX redesign — merge Tasks and Projects into a single page.
**Timeline:** After Sprint 30 merges. Research session required first.

- Project detail view with left AI panel + right task list + tabbed sub-nav
- Tasks unassigned to a project appear in default/unassigned view
- Reference design: NUWAVE Mainframe screenshot (see Phase-A-Roadmap)

---

## Sprint 32: Knowledge Unification

**Theme:** Research and merge Vault + Topics into unified knowledge browser.
**Timeline:** After Sprint 31 merges.

---

## Sprint 33: Cleanup + Hardening

**Theme:** Code quality, accessibility, technical debt, security.
**Timeline:** After Sprint 32 merges.

- Code quality: extract import utilities, Zod validation, duplicate import warning (Agent 7 Sprint 27)
- Accessibility: dark mode contrast fix (3.8:1 → 4.5:1), Sprint 25 P1s (17 items)
- Technical debt: empty state/editor co-presence, adapter gaps, htmlToPlainMarkdown, TS casts (Agent 11 Sprint 26)
- Security: CORS hardening, rate limiting
- Plus any issues surfaced during Sprints 29–32

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

*Next Sprint Planning — Updated March 6, 2026 — Sprint 28 (Launch Ready) complete. Sprint 29 (Flow Rebrand) active per CEO Session #9. Sprint plan aligned with Phase-A-Roadmap (Sprints 29–34). Post-launch roadmap preserved.*
