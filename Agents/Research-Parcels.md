# Research Parcels

All research parcels tracked in one place. These run in parallel with sprint work, not blocking it — but priority parcels (marked **PRIORITY**) should be actively executed, not deferred.

**Updated:** March 7, 2026

---

## Tier 2 Pricing & Cost Research (PRIORITY — Informs Launch)

These parcels must complete before Tier 2 (Web Access + Sync) launches. Several inform the free trial viability.

| Parcel | Owner | Deliverable | Status |
|---|---|---|---|
| Supabase cost-per-user modeling | Agent 5 | Actual Supabase costs per web user at light/medium/heavy usage: database rows, auth sessions, storage (MB/GB), bandwidth, edge function invocations, realtime connections. Model at 100/1K/10K users. | **DONE** (March 7) — `Agent-5-Docs/Research-Brief-Supabase-Cost-Per-User.md` |
| Managed AI cost-per-user modeling | Agent 5 | Cost of providing managed AI keys. Token costs per conversation at light (5 msgs/day) / medium (20 msgs/day) / heavy (50+ msgs/day) across providers. Margin at $8/mo vs. $12/mo? Is managed AI sustainable at Tier 2 or needs own addon? | **DONE** (March 7) — `Agent-5-Docs/Research-Brief-Managed-AI-Cost-Model.md` |
| Storage tier modeling | Agent 5 | Google Drive-style tiers. Supabase per-GB pricing for storage + bandwidth. Model: 1GB trial / 5GB base / 25GB mid / 100GB+ power. At what level does $8-12/mo become unprofitable? | **DONE** (March 7) — `Agent-5-Docs/Research-Brief-Storage-Tier-Model.md` |
| Free trial cost modeling | Agent 5 | Per-user cost of 14-day web trial (rows, auth, bandwidth, storage). Burn rate per free user? What limits keep trial under $0.50/user? | **DONE** (March 7) — `Agent-5-Docs/Research-Brief-Free-Trial-Cost-Model.md` |
| Cloud storage competitive teardown | Agent 8 | Google Drive ($1.99/100GB), iCloud ($0.99/50GB), OneDrive ($1.99/100GB), Dropbox ($11.99/2TB), Obsidian Sync ($4/mo/1GB), Notion ($8-10/mo). Market expectations per price point. | **DONE** (March 7) — `Agent-8-Docs/Competitive-Pricing-Teardown.md` |
| Tier 2 pricing recommendation | Agent 8 | Synthesize cost models + competitive teardown. Flat vs. tiered? Managed AI bundled or addon? Margin target? Price that maximizes desktop→subscriber conversion? | **DONE** (March 7) — `Agent-8-Docs/Tier-2-Pricing-Recommendation.md` |
| Competitive pricing teardown (productivity) | Agent 8 | HubSpot, Monday, Notion, Asana, Sunsama — what users get at $8-12/mo across competitors | **DONE** (March 7) — `Agent-8-Docs/Competitive-Pricing-Teardown.md` |

---

## Phase A Research (Active)

| Parcel | Owner | Deliverable | Status |
|---|---|---|---|
| Legal / EULA research | Agent 5 | EULA template, redistribution terms, privacy policy framework | **DONE** (Sprint 28) |
| Addon pricing model | Agent 8 | Per-seat vs. per-workspace vs. usage-based analysis | PLANNED |
| ~~"One Workflow" positioning validation~~ | ~~Agent 8~~ | ~~Superseded by CEO Session #9 — product renamed to "Flow by Kaivoo"~~ | **SUPERSEDED** |
| Electron vs. Tauri evaluation | Agent 9 | Desktop framework selection | **DONE** (Sprint 20) — Tauri 2.0 |
| SQLite schema + adapter interface | Agent 3 | Local-first schema, adapter pattern | **DONE** (Sprint 20) |
| Desktop auto-update + code signing | Agent 9 | Update distribution, Apple notarization, Windows signing | PLANNED |

---

## Phase B Architecture Research

| Parcel | Owner | Deliverable | Status |
|---|---|---|---|
| Hybrid memory search architecture | Agent 3 | Embedding provider (OpenAI, transformers.js), SQLite vector extension, temporal decay, token budget | PLANNED |
| Memory consolidation pipeline | Agent 3 | Sleep cycle: diff-based consolidation, dedup, relevance scoring, stale pruning | PLANNED |
| Companion app architecture | Agent 3 | Stripped-down mobile: PWA vs. native. Session scoping (one brain, many mouths). Cloud relay. | PLANNED |
| Concierge coherence signals | Agent 3 | Behavioral signals for drift: personality consistency, data citation accuracy, generic-vs-personalized scoring | PLANNED |
| Exec approval system design | Agent 4 | OpenClaw pattern: unique approval IDs, timeouts, audit trail, challenge-response | PLANNED |
| Companion app sync costs | Agent 5 | Per-user sync bandwidth, concierge API routing, push notifications. Feeds into Supabase cost modeling. | PLANNED |
| Memory tier pricing model | Agent 8 | Is hybrid search + sleep cycle compelling for subscription conversion? Willingness-to-pay vs. free AI chat. | PLANNED |
| Agent system productization | Agent 3 | Markdown agent specs → executable, shippable templates without losing simplicity | PLANNED |
| Solo Builder market validation | Agent 8 | Is the autonomous AI dev team market big enough? Willingness-to-pay at $99-199/mo | PLANNED |
| Remote execution security model | Agent 4 | Auth, confirmation flows, blast-radius controls for text-triggered code/git operations | PLANNED |
| Orchestrator pricing model | Agent 8 | Subscription vs. usage-based vs. hybrid for Product 2 | PLANNED |
| Productization template design | Agent 3 + 8 | What does a blank agent system look like? Guided not empty. First-run wizard design | PLANNED |
| Multi-model orchestration overhead | Agent 5 | Users pay API costs — what's platform orchestration overhead? | PLANNED |
| Memory hippocampus token budget | Agent 5 | How many tokens for compiled working memory? Cost at scale across providers | PLANNED |
| MCP file-linking compatibility | Agent 3 + 5 | Test top 3-5 existing MCP servers (Google Drive, Dropbox, OneDrive) for compatibility, stability, auth flow, and UX quality. What does MCP client support require in Flow? **CEO Session #11: Moved from Phase D to Phase B.** | **PRIORITY** — PLANNED |
| MCP ecosystem landscape | Agent 5 | Current MCP ecosystem — who's building what, adoption curves, timing risk. **Moved from Phase C/D per CEO Session #11.** | **PRIORITY** — PLANNED |

---

## Phase C/D Research

| Parcel | Owner | Deliverable | Status |
|---|---|---|---|
| Marketplace model analysis | Agent 8 | Shopify Apps, Figma Community, Notion Templates — commissions, quality control, creator incentives | PLANNED |
| Sandboxed module runtime | Agent 3 | iframe sandboxing, Web Components, controlled runtimes for user modules | PLANNED |
| File watching mechanism | Agent 3 | Detect manual file changes on disk for "permissive by nature" design | PLANNED |
| MCP server architecture | Agent 3 | Expose Kaivoo data as MCP resources/tools. Protocol design, permission model | PLANNED |
| Local file indexing engine | Agent 3 | Index all files on machine. Performance at scale, incremental updates, search ranking | PLANNED |
| Secure tunnel evaluation | Agent 9 | Tailscale vs. Cloudflare Tunnel vs. libp2p for remote desktop access | PLANNED |
| Self-building sandbox model | Agent 3 + 4 | How AI builds pages safely. Sandboxing, capability permissions, rollback | PLANNED |
| Plex/Obsidian model analysis | Agent 5 | How Plex and Obsidian Sync work technically. Lessons for Mode A/B | PLANNED |
| Cloud sync infrastructure costs | Agent 5 | Cost modeling for Supabase relay at scale — sync bandwidth, storage, pricing | PLANNED |
| ~~MCP ecosystem landscape~~ | ~~Agent 5~~ | ~~Moved to Phase B Architecture Research — CEO Session #11~~ | **MOVED** |

---

*Research Parcels — Created March 6, 2026 — Extracted from Vision v7.1 during CEO Session #8 restructure.*
