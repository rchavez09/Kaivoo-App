# CEO Decisions — Historical Record

All strategic decisions made during CEO Mode sessions, preserved as a historical record. Referenced by Vision.md and phase roadmaps.

**Updated:** March 6, 2026 (CEO Session #9 added)

---

## CEO Session #1 — March 1, 2026

- **Business model:** Two-phase strategy (Phase A: $99/$49 one-time, Phase B: subscription ARR)
- **Product positioning:** AI-powered workflow OS — guided, outcome-first AI, not blank chat boxes
- **Enterprise vs. SMB focus:** SMB focus — solopreneurs to small teams (1-25), no "enterprise" language
- **Rebrand timing:** Phase A ships under current branding, Phase B launches as "One Workflow by Kaivoo Media"
- **White-label architecture:** Build config layer now (Phase A), full white-label in Phase B
- **Skills/integration priority:** Elevated from Phase 8 to Phase B core — design alongside AI orchestrator
- **Phase B subscription pricing:** Deferred pending research on token costs and competitive analysis
- **Legal protection:** Required before Phase A ship — EULA, license key, redistribution restrictions

## CEO Session #2 — March 1, 2026

- **Concierge identity:** Users name and personalize their concierge — soul file for memory/personality, hatching during setup wizard
- **Concierge-as-Builder:** Confirmed for Phase B (personal) and Phase C (marketplace)
- **1st-party module format:** Page + Today Widget pattern — Kaivoo's own modules serve as marketplace templates
- **Phase B onboarding:** Concierge-led guided tour

## CEO Session #3 — March 1, 2026

- **Single product vs. multi-product:** Two products on one platform — Kaivoo Productivity + Kaivoo Orchestrator
- **Concierge scope:** Clean boundary — Productivity = helper, Orchestrator = builder. Same architecture, different capability ceiling.
- **Modular toggle architecture:** Settings-driven modules — productivity and builder as toggleable surfaces
- **Productization requirement:** Clean templates required before Orchestrator ships
- **Orchestrator as integration:** SMBs can add Orchestrator as addon, works with any repo/tech stack
- **Phase A concierge BYO keys:** Scoped to productivity use. Multi-model routing architecture in Phase A, only productivity capabilities exposed.
- **Phase A vs. Phase B priority:** Ship productivity app first — revenue funds Orchestrator development.

## CEO Session #4 — March 1, 2026

- **Local-first storage:** Phase A must-have — one-time purchase requires local storage
- **Desktop packaging:** Promoted to Phase A must-have
- **Topics page role:** Knowledge OS — Topics > Projects > Tasks/Files hierarchy
- **Data architecture:** Swappable backend — DataAdapter with LocalAdapter + CloudAdapter
- **File attachments:** Promoted to Phase A must-have
- **Hashtags:** Virtual groupings (filters), not physical subfolders
- **Folder structure:** SQLite is source of truth
- **Obsidian import:** File copy, feature not headline
- **Codebase split:** No split until Phase A ships

## Earlier Sprint Decisions

- Design System migration vs. feature work → Both in Sprint 2
- React Query adoption → Full migration approved
- Business model validation → Agent 8 delivered
- Projects data model → Implemented Sprint 8
- Design Agent structure → Split into 3 agents Sprint 12

## Sprint 20 Decisions — March 2, 2026

- **Electron vs. Tauri:** Tauri 2.0 selected
- **SQLite schema:** Mirror Supabase with camelCase, DataAdapter pattern
- **Data architecture:** Implemented — 4 interfaces, 15 sub-adapters

## CEO Strategic Brief — March 2, 2026

- **Phase A pricing:** $99 standard / $49 founding member. Volume over margin.
- ~~**Phase A feature scope:** No AI in Phase A~~ — **SUPERSEDED by CEO Session #5**

## CEO Session #5 — March 3, 2026

- **Revenue model:** Three-tier — $49 one-time / subscription / premium subscription
- **Positioning:** "Day execution" replaces "day-centric" — uncontested positioning
- **ChatGPT memory narrative:** Toned down — "own your AI's memory" framing
- **Soul file architecture:** Phase 1: SQLite. Phase 2: extraction. Phase 3: embeddings + MCP.
- **Gmail/Calendar:** Deferred to post-launch fast-follow
- **Phase A scope:** Ship what's built + soul file + licensing + landing page + legal. **(SUPERSEDES "No AI in Phase A")**

## CEO Session #6 — March 4, 2026

- **Product identity:** Personal infrastructure for the AI era
- **MCP role:** MCP-native from day one — Core Principles #11 and #12
- **Cloud vs. local-only:** Local-first with SaaS attachments
- **Always-on:** Dual-mode — Mode A (desktop awake) + Mode B (cloud sync)
- **Companion app:** Web-based companion, paid feature
- **Self-building:** Phase D milestone
- **Business model:** Four-tier — Core, Cloud Companion, Builders, Personal OS
- **Phase D added:** MCP Foundation & Personal OS phase

## CEO Session #7 — March 6, 2026

- **Communication channel:** Build our own through companion app — not Telegram/WhatsApp
- **Concierge memory as moat:** Memory architecture is the defensibility
- **Companion app scope:** Stripped-down mobile. Requires sync subscription.
- **Memory architecture:** 7-layer cortex/hippocampus model. Desktop gets layers 1-4, subscribers 5-7.
- **Skills/module architecture:** Documentation-first manifests confirmed
- **Exec approval:** Study OpenClaw's pattern for Orchestrator

## CEO Session #8 — March 6, 2026

- **Desktop as flagship:** Desktop is the product. Web access and companion are premium add-ons (subscription).
- **Free trial:** 14-day full-experience web trial — time-limited, not feature-limited
- **Companion app gating:** Requires Tier 2 — architectural necessity (needs cloud sync)
- **Launch sequencing:** Web trial first (no cert dependency), desktop when Apple certs clear
- **Cost-to-serve:** Desktop = zero marginal cost (one-time works). Web = per-user infrastructure (subscription required).
- **Tier naming:** "Kaivoo Desktop" (Tier 1), "Web Access + Sync + Companion" (Tier 2)
- **Tier 2 pricing research:** 7 new parcels for storage/AI/competitive modeling
- **MVP defined:** 5 sprints (28-32). Tasks+Projects merge, Vault+Topics unification, bug fixes, concierge hardening, code signing.
- **Vision.md split:** Into 5 documents — Vision (strategic), Phase-A-Roadmap, Phase-BCD-Roadmap, Research-Parcels, CEO-Decisions.

## CEO Session #9 — March 6, 2026

- **Brand hierarchy established:** Kaivoo is the parent brand/company. The app is no longer called "Kaivoo" — it's called **Flow** (formally "Flow by Kaivoo").
- **"One Workflow" retired:** The previous Phase B rebrand plan is replaced by the Flow identity effective immediately (pre-launch — zero switching cost).
- **Flow naming convention:** Product is "Flow by Kaivoo" in marketing, "Flow" in everyday use. App icon says "Flow." Website is kaivoo.com with Flow as flagship product.
- **"Flow OS" reserved as marketing tagline only** — not the product name. Used in copy like "Your personal Flow OS."
- **Pulse (working name):** Second product — meditation hardware device. ~6-month horizon. Not in scope for current sprints but informs brand architecture.
- **Launch narrative:** "Flow is the first product from Kaivoo" — hints at portfolio without over-promising.
- **Portfolio model:** Follows "Beats by Dre" pattern — product leads, brand is the credibility stamp. Future products follow the pattern: "[Product] by Kaivoo."
- **Sprint 29 absorbs rebrand:** Landing page rebuild (Flow identity + new MVP narrative), in-app naming changes, legal doc updates, Product Hunt rewrite, strategic doc updates — all folded into Sprint 29 alongside bug bash + concierge hardening.
- **Sprints 30–32 unchanged:** Tasks+Projects merge, Knowledge Unification, Ship Prep — original scope preserved.
- **MVP scope reconfirmed:** All four remaining sprints (29–32) ship before launch. No compression. "Ship something you're proud of."

---

## Key Decisions Ahead

- ~~**"One Workflow" rebrand** — Still planned for Phase B? Needs decision.~~ **RESOLVED — CEO Session #9: Flow by Kaivoo.**
- **Phase B subscription pricing** — Pending Tier 2 pricing research parcels
- **File watching mechanism** — How does the app detect manual file changes on disk? (Agent 3)
- **Desktop auto-update** — Update distribution mechanism (Agent 9)
- **Skills store architecture** — MCP-based vs. custom plugin API (Agent 3, Phase B)
- **Sandboxed module runtime** — How user-built modules run safely (Agent 3)
- **Marketplace commission model** — Revenue split (Agent 8)
- **Legal review** — EULA needs attorney review before Phase A ships
- **Agent system productization** — Executable agent templates (Agent 3)
- **Orchestrator pricing** — Subscription, usage-based, or hybrid (Agent 8)
- **MCP server design** — Expose Kaivoo data as MCP resources/tools (Agent 3)
- **Companion app architecture** — PWA vs. native, session scoping (Agent 3)
- **Windows/Linux builds** — macOS scaffold done. Cross-platform CI status needs verification.

---

*CEO Decisions — Created March 6, 2026 — Extracted from Vision v7.1 during restructure.*
