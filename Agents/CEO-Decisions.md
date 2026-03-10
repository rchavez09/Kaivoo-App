# CEO Decisions — Historical Record

All strategic decisions made during CEO Mode sessions, preserved as a historical record. Referenced by Vision.md and phase roadmaps.

**Updated:** March 9, 2026 (CEO Session #14 added)

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

## CEO Session #10 — March 7, 2026

**Context:** All 7 Tier 2 pricing research parcels completed. CEO reviewed cost models + competitive teardown and made final pricing decisions.

- **Tier 2 pricing approved:** $9/mo annual ($108/yr) / $12/mo monthly. Two tiers — Starter (10 GB, 50 AI msgs/day) and Pro (100 GB, 100 AI msgs/day + model choice).
- **Managed AI: Bundle it.** AI included in subscription (smart-routed, $0.62/user/mo blended cost). BYO Keys option available at same price for developers who want unlimited AI with their own API keys.
- **Free trial: CC required.** 14-day trial with credit card upfront. Higher conversion rate (~40-60%) over no-CC variant. 25 AI messages during trial, 500 MB storage.
- **Storage strategy: Play A (Workflow Hub).** Tiered storage up to 100 GB max. Kaivoo stores workflow data (scripts, plans, notes, images, docs). Large media files (video, raw footage) stay in Google Drive/Dropbox/NAS — Kaivoo links to them. Do NOT compete on raw storage with Google ($9.99/2TB).
- **No 1-2 TB tiers.** Margins collapse at TB scale (27-34%). Can't out-storage Google. If demand proves wrong, add Play B tiers in Phase B/C with Cloudflare R2 architecture.
- **Gross margins:** Starter 81-86%, Pro 72-78%, BYO Keys 88-91%. Blended cost ~$1.70/user/mo.
- **Break-even:** 3 users at $10/mo covers Supabase Pro base.

**Research documents:**
- `Agents/Research/Agent-5-Docs/Research-Brief-Supabase-Cost-Per-User.md`
- `Agents/Research/Agent-5-Docs/Research-Brief-Managed-AI-Cost-Model.md`
- `Agents/Research/Agent-5-Docs/Research-Brief-Storage-Tier-Model.md`
- `Agents/Research/Agent-5-Docs/Research-Brief-Free-Trial-Cost-Model.md`
- `Agents/Product/Agent-8-Docs/Competitive-Pricing-Teardown.md`
- `Agents/Product/Agent-8-Docs/Tier-2-Pricing-Recommendation.md`

## CEO Session #11 — March 7, 2026

**Context:** CEO reviewed the Play A (Workflow Hub) storage strategy and asked how external file linking works for desktop-only users and at what phase MCP integrations should land.

- **MCP file linking: Moved from Phase D to Phase B.** External file access via MCP (Google Drive, Dropbox, OneDrive) is too valuable to defer to Phase D. Ships in Phase B alongside subscription infrastructure.
- **Don't reinvent — plug in.** Google Drive, Dropbox, and OneDrive all have production-ready MCP servers already (Anthropic official, Dropbox official, Microsoft official). Kaivoo builds MCP *client* support, not custom integrations. Every service with an MCP server becomes available automatically.
- **Desktop-only file linking works.** MCP servers run locally on the user's machine with their own OAuth tokens. Desktop (Tier 1) users get the same file linking as subscribers — zero cost to Kaivoo. The subscription upgrade pitch: "Your file links work great on desktop. Want them synced to your phone and web? That's Tier 2."
- **Phase A: Manual URL pasting.** Simple URL field on attachments. Functional but not the headline feature. File linking becomes a headline in Phase B when MCP makes it seamless.
- **Research parcel added:** MCP file-linking ecosystem evaluation — test top 3-5 existing MCP servers for compatibility, stability, and UX quality. Must complete before Phase B scoping.

## CEO Session #12 — March 7, 2026

**Context:** Pre-launch product audit. CEO did a deep dive across the entire app and surfaced ~15 items spanning bugs, unfinished features, and new requirements. Strategic triage separated launch blockers from Phase B deferrals.

### Decisions Made

- **Vault architecture elevated to pre-launch.** Individual `.md` files per entry (not merged `date.md`). Filing logic: topic assigned → `Topics/{topic-name}/`, no topic → `Notes/{Year}/{Month}/`. "Journal" folder renamed to "Notes." Core Principle #1 ("you own your data") demands the vault be correct at launch.
- **AI Chat Page elevated to pre-launch.** Full-page chat interface with conversation history (SQLite), navigable conversation list, model selection (BYO keys). The AI concierge is the product — a sidebar-only experience undersells it.
- **AI Data Awareness elevated to pre-launch.** Context injection (today's tasks, upcoming deadlines, active projects, recent notes). Read tools (query tasks, notes, projects). Write tools (create tasks, update status, create notes). Summarization. "What's due this week?" must work on day one.
- **Gantt Chart: Hide until Phase B.** Current implementation is superficial (colored lines only). Evaluate `frappe-gantt` (MIT) for Phase B rebuild with proper zoom, dependencies, milestones, and drag interactions.
- **Pages = Projects UX unification: Phase B.** Universal "entity page" template is the right direction but a major redesign. Deferred.
- **Privacy toggle (hide from AI): Phase B.** Important trust feature but not launch-blocking.
- **Deep Insights/Analytics: Phase B.** Needs 30-90 days of user data to design around.
- **Custom Kanban states: Phase B.** Fix existing states pre-launch; user-created states later.

### Pre-Launch Bug Fixes Confirmed

- HTML rendering bugs throughout the app (content displaying as raw HTML)
- Kanban board — fix all existing states (currently only Todo→Done works)
- Wiki-link rendering — `[[Page]]` should render as clickable highlighted links like hashtags
- Library icon → use Folder icon (current icon looks like Insights)
- "Journal" → "Notes" folder rename in vault
- Remove AI features toggle in Settings (vestigial)
- Remove or clarify "Inbox" (undefined purpose)
- Topic/Project color settings
- Settings audit (quick pass)

### Phase B Roadmap Items (from this session)

- Pages = Projects UX unification (universal entity page template)
- Gantt Chart upgrade (frappe-gantt, proper implementation)
- Calendar view on Projects page
- Privacy toggle on Topics/Projects (hide from AI)
- Deep Insights/Analytics dashboard
- Custom Kanban states (user-created)
- AI Chat: multi-model routing, file attachments, voice input
- AI Data Awareness: calendar events, routine/habit management, file operations, proactive notifications

### Sprint Sequencing Recommendation (for Director)

1. Sprint 33: Bug bash + vault architecture + hide Gantt + settings audit
2. Sprint 34: AI Chat Page + AI data awareness (context injection + read tools)
3. Sprint 35: AI data awareness (write tools + summarization + testing)
4. Sprint 36: Integration testing, polish, ship prep

---

## CEO Session #13 — March 8, 2026

**Context:** Strategic pivot session. Honest product/code audit revealed strong technical foundation but zero distribution. Deep research into OpenClaw (214K GitHub stars, autonomous AI agent) revealed the market gap: nobody has shipped a polished, consumer-facing, local-first autonomous AI agent platform as a desktop app. The multi-agent system used to build Kaivoo (12+ agents, sprint protocol, CEO/Director structure) IS the product — turned inward.

### Strategic Pivot

- **Product redefined:** Flow is not a productivity app with AI chat. Flow is a **personal AI agent orchestration platform** — the accessible, safe version of what OpenClaw does for developers.
- **The launch story:** "I built this app using the app's own multi-agent system. 33 sprints, 12 agents, CEO sessions, sprint protocols. The git history is the proof. Now that system is in your hands."
- **Primary positioning:** "OpenClaw for everyone" — autonomous AI agent capabilities, safe and accessible, wrapped in a polished app.
- **Anti-positioning:** NOT "another Notion alternative." NOT "AI chatbot in a productivity app."

### V1 Definition — Locked (No Scope Changes Until Post-Launch)

**Launch Date: ~~April 14, 2026~~ → April 16, 2026 (CEO Session #14)**

**What ships:**
1. **Core App** — Bug fixes only. HTML rendering, Kanban all states, wiki-links, hide Gantt, remove seed data, search sanitization. NO new productivity features.
2. **AI Chat Page** — Full-page `/chat` with conversation history, persistent storage, soul file integration, continuous memory.
3. **Configurable Heartbeat** — Background timer, settings (morning briefing, evening summary, custom interval, off), proactive insights from tasks/calendar/journal.
4. **Orchestrator Page** — 4 tabs:
   - **Agents:** CRUD, model assignment (Claude/Gemini/GPT/Codex/local), system prompt, permissions. Pre-loaded starters.
   - **Skills:** CRUD, AI skill creation from user request. Pre-loaded starters.
   - **Workflows:** Ordered step builder (agent + skill + approval gate), triggers (manual/scheduled/event), execution view with thinking transparency.
   - **MCPs:** Discover (AI-powered search of MCP ecosystem), Connect (one-click with auth), Manage (widget cards, toggle). Connect-not-create model. Ships with File System + Flow Data MCPs built-in.
5. **Artifact System** — Sandboxed iframe widgets. AI generates HTML/CSS/JS, renders in preview. Persistent custom widgets saveable to library. Addable to Today page and project pages alongside built-in widgets. Template/guardrails (name, icon, description). Export/download to vault. Editable via conversation.
6. **Neuron Memory (V1)** — Tiered soul file: Core Identity (~500 tokens, always loaded) + Active Context (~1000 tokens, always loaded) + Episodic Memory (individual entries, loaded by relevance, ~2000 token budget). Memory consolidation during heartbeat (dedup, summarize, prune, promote). Solves soul file bloat without requiring full vector search infrastructure.
7. **Thinking Transparency** — Visible AI reasoning during workflows and heartbeat. Action log.
8. **Safety Layer** — Confirmation gates, skill permissions, workflow approval gates, rollback, rate limiting.
9. **Ship Requirements** — Landing page, EULA, code signing (attempted), beta testers (5-7 days), Product Hunt, demo video.

**What does NOT ship (post-launch, no exceptions):**
- Vault architecture overhaul, color pickers, settings audit, dark mode contrast, Pages=Projects unification, Gantt rebuild, calendar on Projects, privacy toggles, deep insights, custom Kanban states, AI voice/file attachments, mobile companion, full MCP marketplace, self-building React components, multi-user/team features.

### Organizational Change

- **Director** (`Agents/Director.md`) renamed to **Dev Director** — owns engineering sprints, code quality, feature delivery.
- **Marketing Director** created (`Agents/Marketing/Director-Marketing.md`) — owns distribution, audience building, content strategy, launch coordination. Runs in parallel with Dev Director.
- Both directors report to the CEO. Both tracks run simultaneously starting March 9.

### Timeline

- **Week 1 (Mar 9-15):** Bug bash + AI foundation + marketing launch (landing page, first content)
- **Week 2 (Mar 16-22):** Orchestrator UI (Agents/Skills/Workflows/MCPs tabs) + content cadence
- **Week 3 (Mar 23-29):** Workflow execution engine + artifact system + demo videos
- **Week 4 (Mar 30-Apr 5):** Neuron memory + polish + beta testers (early access from email list)
- **Week 5 (Apr 6-13):** Ship prep + bug fixes from beta + launch sequence
- **April 16:** LAUNCH (Thursday — moved from Apr 14, CEO Session #14)

### Market Research Findings

- **OpenClaw:** 214K GitHub stars, 700+ skills, 50+ integrations. Autonomous AI agent. But: 512 vulnerabilities, 135K exposed instances, bulk-deleted researcher's emails, steep learning curve, breaks when third-party apps update. Developer-only tool.
- **AI Personal OS market:** $35.7B by 2030 at 19% CAGR. CosmOS (Humane→HP, $116M acquisition) is hardware-first. OpenDAN is early-stage. Nobody has shipped a polished consumer-facing desktop version.
- **AI Agent Orchestration market:** Projected $8.5B by 2026, $35B by 2030. Enterprise-focused (UiPath, Microsoft AutoGen, CrewAI). No consumer-facing orchestration platform exists.
- **Distribution gap identified:** Zero audience, no waitlist, no email list, no social following. Marketing track running in parallel is non-negotiable.

## CEO Session #14 — March 9, 2026

**Context:** Founder was ready to begin content recording (4 TikToks + 1 YouTube video planned for Week 1) but returned from a dentist appointment with facial numbness — unable to record on-camera content. Additionally identified two unaccounted-for blockers: office recording setup and email marketing infrastructure (Kit, TikTok account, YouTube account not yet created).

### Decisions Made

- **Launch date moved from April 14 (Tuesday) to April 16 (Thursday).** Two-day shift. Thursday is a stronger Product Hunt launch day (higher traffic than Tuesday). Dev track is unaffected — extra 2 days absorb into Week 5 buffer sprint (Sprint 59) and extend beta testing window from ~5-7 days to ~7-9 days.
- **Week 1 marketing track restructured.** Original plan assumed Day 1 = recording. Reality: accounts and recording setup must happen first. Week 1 now split into:
  - **Days 1-2 (Mar 9-10):** Infrastructure — Kit account, TikTok account, YouTube channel, office setup, email capture wired to landing page. Twitter/X can start immediately (text-only).
  - **Days 3-7 (Mar 11-15):** Content launch — first TikToks/shorts recorded and posted, Twitter threads, Reddit posts, Discord server.
- **Email capture is highest-priority setup task.** Landing page with broken/unwired email form loses signups permanently. Kit → landing page integration must be verified end-to-end before any traffic is driven.
- **No scope change to dev track or marketing deliverables.** Same content output by end of Week 1, just sequenced realistically. Same sprint plan, same feature scope.

---

## Key Decisions Ahead

- ~~**"One Workflow" rebrand** — Still planned for Phase B? Needs decision.~~ **RESOLVED — CEO Session #9: Flow by Kaivoo.**
- ~~**Phase B subscription pricing** — Pending Tier 2 pricing research parcels~~ **RESOLVED — CEO Session #10: $9/$12 approved**
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
