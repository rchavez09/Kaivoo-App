# Product Strategy Brief — The Kaivoo Platform Pivot

**Date:** February 24, 2026
**Author:** Agent 8 (Product Manager) + Director
**Confidence:** High (market-validated, competitive data current as of Feb 24, 2026)
**Status:** v1.0 — Strategic Foundation
**Supersedes:** Previous hybrid model ($199 self-hosted + $29-49/mo cloud) from Vision v3.2

---

## Executive Summary

Kaivoo is pivoting from a "buy the software" model to a **platform-as-a-service** model. The codebase is no longer for sale. Instead, Kaivoo becomes an AI-powered operating system that users access as a service, build upon, and extend through a community marketplace.

This pivot is driven by three market realities:

1. **The SaaS-pocalypse creates an opening.** $1T+ wiped from software stocks in 2026. Per-seat pricing is dying. New AI-native products built for outcomes, not access, have a structural advantage over legacy SaaS.

2. **Agent orchestration is commoditizing.** Claude Cowork ($20/mo) and Google Antigravity (free) now ship multi-agent orchestration. Kaivoo's moat is NOT the orchestration — it's the **opinionated foundation, pre-built productivity layer, agent configurations, and community marketplace.**

3. **The "behind the curve" audience is massive.** Lovable proved that 8M+ people will pay a premium to skip the learning curve. Kaivoo's proposition is stronger: we don't just help you build from scratch — we give you a foundation that already works, and you build ON TOP of it.

**One sentence:** Kaivoo is the opinionated AI platform where the hard parts are already done — use our foundation, extend it with the marketplace, or build your own features on top of it.

---

## The Strategic Pivot: What Changes

| Dimension | Old Model (Vision v3.2) | New Model (Platform Pivot) |
|---|---|---|
| **Code ownership** | User buys and owns codebase ($199) | User accesses platform as a service. Never downloads the engine. Owns their DATA, not the platform code. |
| **Self-hosted option** | Core offering | Deprecated as a primary offering. May revisit as enterprise tier in Phase 7+. |
| **Pricing model** | Subscription + one-time purchase | Tiered subscription + usage-based AI credits + marketplace revenue share |
| **AI pricing** | BYO keys (user pays their own API costs) | Platform manages AI routing. Multi-model strategy with tiered token allocations. BYO keys as optional cost-saver. |
| **Marketplace** | Phase 8 (far future) | Core to the strategy from launch. Community-built extensions, templates, and modules. |
| **Target audience** | AI power users + self-hosters + productivity optimizers | Primary: "Behind the curve" users who want AI-powered productivity without the learning curve. Secondary: Builders who want to create and sell on the platform. |
| **Competitive position** | "Home Assistant for productivity" | "The AI platform with the foundation already built — use it, extend it, build on it" |

### What Stays the Same

- **Day-centric design** — The Command Space (journal, tasks, calendar, captures) remains the foundation
- **Data ownership** — Users own their DATA (journals, tasks, projects). Exportable always. No vendor lock-in on your content.
- **Agent transparency** — Agents are still markdown-based specs. Users can read and understand what the AI is doing.
- **Quiet confidence** — Apple HIG-level craft. Warm Sand, Deep Navy, Resonance Teal.
- **Revenue target** — $1M ARR remains the North Star

---

## Pricing Architecture

### Design Principles

1. **Entry price must be dead simple.** No "credits" confusion at the base tier. Flat monthly fee.
2. **AI costs scale with usage, not with seat count.** Per-seat is dying. Token-based AI pricing aligns cost with value.
3. **The marketplace is a revenue multiplier, not an afterthought.** Community builders earn money. Kaivoo takes a cut. Network effects build the moat.
4. **Different AI models for different jobs.** Not every feature needs Opus. Smart routing reduces costs and improves margins.

### The Three Tiers

#### Tier 1: Foundation — $14.99/mo (annual: $11.99/mo)

**For:** People who love the system but don't need AI to build. They want the productivity platform — the command center, the widgets, the workflow.

| Includes | Details |
|---|---|
| **Command Space** | Journal, Tasks, Calendar, Captures, Daily View — the full productivity foundation |
| **Widget System** | Browse and activate pre-built widgets (email reader, habit tracker, notes, etc.) |
| **Marketplace Access** | Browse, purchase, and install community-built widgets, templates, and page layouts |
| **Theme Customization** | Color schemes, layout preferences, basic personalization |
| **Data Export** | Full export of all personal data (markdown, JSON) at any time |
| **AI Features** | None. Zero AI token usage. Pure platform. |

**Why this tier exists:** Not everyone wants AI. Some people just want a beautiful, opinionated productivity system that works. This tier captures the Sunsama/Notion audience who are exhausted by complexity. It also serves as the acquisition funnel — get them on the platform, let AI upsell itself.

**Competitive positioning:** Cheaper than Sunsama ($16-20/mo), comparable to Notion Plus ($12/mo), but with a day-centric design and widget extensibility neither offers.

---

#### Tier 2: Command — $29.99/mo (annual: $24.99/mo)

**For:** Users who want AI woven into their daily workflow. Email integration, calendar intelligence, the Concierge service, AI-powered insights.

| Includes | Details |
|---|---|
| **Everything in Foundation** | Full Command Space + widgets + marketplace |
| **The Concierge (AI Assistant)** | Context-aware AI that knows your journal, tasks, calendar, and patterns |
| **AI-Powered Integrations** | Email reader/responder widget, smart calendar suggestions, task prioritization |
| **Monthly Token Allocation** | 500K tokens/month included (covers ~50-100 meaningful AI interactions/day) |
| **Multi-Model Routing** | Platform intelligently routes to the right model per task (see Model Strategy below) |
| **AI Insights Dashboard** | "You're most productive on Tuesdays." "Exercise correlates with your best journal entries." |
| **Priority Support** | Faster response times |

**Token overage:** $5 per additional 100K tokens. Transparent usage dashboard shows exactly where tokens are going.

**Why this tier exists:** This is the core revenue driver. It's the "AI power user + productivity optimizer" tier. The Concierge service — AI that actually knows your day, your projects, your patterns — is the 10x moment that justifies the price.

**Competitive positioning:** Replaces ChatGPT Plus ($20) + Sunsama ($20) + Notion AI ($20) = $60/mo. Kaivoo Command at $29.99/mo is a net savings with deeper integration.

---

#### Tier 3: Builder — $49.99/mo (annual: $39.99/mo) + Usage

**For:** Power users and creators who want to use the Concierge and Workshop to BUILD things. New pages, custom widgets, integrations, automations — and sell them in the marketplace.

| Includes | Details |
|---|---|
| **Everything in Command** | Full AI-powered platform |
| **The Workshop (AI Builder)** | Natural language → working features. "Build me a page that shows my stock portfolio." |
| **Monthly Token Allocation** | 2M tokens/month included (covers heavy building + daily use) |
| **Builder-Grade AI Models** | Access to higher-capability models (Opus-class) for complex generation tasks |
| **Marketplace Publishing** | Create, list, and sell widgets/templates/pages in the Kaivoo Marketplace |
| **Revenue Share** | Earn 85% of marketplace sales (Kaivoo takes 15%) |
| **Custom Agent Configurations** | Create and modify agent team structures for specialized workflows |
| **API Access** | Programmatic access to Kaivoo data and features for custom integrations |
| **Beta Features** | Early access to new platform capabilities |

**Token overage:** $4 per additional 100K tokens (volume discount vs. Command tier).

**Usage-based AI billing for heavy builders:**

| Monthly Token Usage | Cost |
|---|---|
| Included (2M) | $0 (in subscription) |
| 2M - 5M | $4 per 100K tokens |
| 5M - 10M | $3.50 per 100K tokens |
| 10M+ | $3 per 100K tokens |

**Why this tier exists:** This is where the magic happens. Builders create the marketplace ecosystem. They're not just customers — they're platform contributors. The economics are designed to be generous: 85% revenue share (better than Shopify's 80-85%, far better than Apple's 70%), and declining token costs reward heavy usage.

**Competitive positioning:** vs. Lovable ($25-200/mo): Lovable lets you build apps from scratch. Kaivoo gives you a FOUNDATION to build on — journal, tasks, calendar, captures, agent system already in place. You're not starting from zero. For the $800+ the founder spent on Lovable, they could have had 16+ months of Builder tier.

---

### Tier Comparison Matrix

| Feature | Foundation ($14.99) | Command ($29.99) | Builder ($49.99+) |
|---|---|---|---|
| Command Space (journal, tasks, calendar, captures) | Yes | Yes | Yes |
| Widget system | Yes | Yes | Yes |
| Marketplace browsing & purchasing | Yes | Yes | Yes |
| Theme customization | Basic | Full | Full + custom CSS |
| AI Concierge | No | Yes | Yes |
| AI integrations (email, smart calendar) | No | Yes | Yes |
| AI Insights dashboard | No | Yes | Yes |
| Monthly token allocation | 0 | 500K | 2M |
| The Workshop (AI builder) | No | No | Yes |
| Marketplace publishing & selling | No | No | Yes |
| Custom agent configurations | No | No | Yes |
| API access | No | No | Yes |
| Revenue share from marketplace sales | N/A | N/A | 85% to creator |

---

## Multi-Model AI Strategy

### The Problem

AI model costs vary dramatically. Using Opus for everything would make the platform unaffordable. Using only cheap models would make it feel dumb. The solution: **intelligent routing** — the right model for the right job.

### Model Routing Matrix

| Task Category | Model Tier | Examples | Est. Cost per Interaction |
|---|---|---|---|
| **Quick responses** | Economy (Haiku-class / GPT-4o-mini) | Task categorization, simple suggestions, UI text generation, search | $0.001-0.005 |
| **Daily intelligence** | Standard (Sonnet-class / GPT-4o) | Journal analysis, email summarization, calendar optimization, pattern recognition | $0.01-0.05 |
| **Complex generation** | Premium (Opus-class / GPT-4-turbo) | Workshop page building, complex code generation, multi-step planning, agent coordination | $0.05-0.25 |
| **Specialized tasks** | Best-fit routing | Image gen → DALL-E/Midjourney API. Code → Claude. Writing → GPT. Research → Perplexity API. | Varies |

### Provider Strategy

| Provider | Strength | Use Case in Kaivoo | Pricing Tier |
|---|---|---|---|
| **Anthropic (Claude)** | Best at code generation, structured thinking, long context | Workshop (building features), agent coordination, complex analysis | Premium |
| **OpenAI (GPT)** | Best at conversational AI, creative writing, broad knowledge | Concierge conversations, email drafting, content suggestions | Standard |
| **Google (Gemini)** | Best at multimodal, search integration, large context windows | Research tasks, document analysis, image understanding | Standard |
| **Local/Open Source (Ollama)** | Free, private, offline-capable | BYO-key users, privacy-sensitive tasks, high-volume low-complexity | Economy (user-hosted) |

### BYO Keys as Cost Optimizer

Users on any paid tier can optionally connect their own API keys to:
- **Reduce token consumption** from their Kaivoo allocation (BYO key calls don't count against monthly limits)
- **Use preferred models** (e.g., always use Claude for everything if they prefer)
- **Access local models** via Ollama for zero-cost AI on non-critical tasks

This is positioned as a **power user feature**, not a requirement. The platform handles everything by default.

### Margin Analysis

| Tier | Monthly Revenue | Est. AI Cost (avg user) | Gross Margin |
|---|---|---|---|
| Foundation | $14.99 | $0 (no AI) | ~95% (infra only) |
| Command | $29.99 | $3-8/mo (smart routing) | 73-90% |
| Builder | $49.99 + usage | $10-25/mo (heavier usage) | 50-80% |

**Key insight:** The Foundation tier is nearly pure margin. It funds the AI infrastructure for Command and Builder tiers. This is the same strategy Notion uses — free/cheap tiers subsidize the AI-heavy tiers.

---

## Marketplace Economics

### The Vision

The Kaivoo Marketplace is an app store where community members build and sell:

| Category | Examples | Typical Price Range |
|---|---|---|
| **Widgets** | Email reader, stock ticker, weather dashboard, Pomodoro timer, habit streak tracker | $0 (free) - $4.99/mo |
| **Page Templates** | CRM dashboard, content calendar, project tracker, meeting notes system | $2.99 - $14.99 one-time |
| **Full Pages/Modules** | Music synthesizer, trading dashboard, social media manager, invoice generator | $4.99 - $29.99/mo |
| **Agent Configurations** | Marketing agent team, coding assistant setup, research pipeline, writing workflow | $9.99 - $19.99 one-time |
| **Integrations** | Spotify widget, GitHub activity feed, Slack notifications, Stripe revenue dashboard | $0 (free) - $4.99/mo |
| **Themes** | Full visual themes, icon packs, layout presets | $2.99 - $9.99 one-time |

### Revenue Share Model

| Creator Lifetime Marketplace Revenue | Kaivoo's Cut | Creator Keeps |
|---|---|---|
| First $10,000 | 0% | 100% |
| $10,001 - $100,000 | 10% | 90% |
| $100,001+ | 15% | 85% |

**Why this is generous:**
- **0% on first $10K** follows the Shopify/Atlassian playbook that works. It says: "We invest in you until you're successful."
- **10-15%** is more generous than Apple (30%), Shopify (15-20%), and Atlassian (16-25%).
- The GPT Store's failure (vague monetization, poor discoverability, pennies per conversation) is the cautionary tale. Kaivoo's marketplace must have **real payments from day one** and **real analytics for creators**.

### Marketplace Quality Strategy

Lessons from the GPT Store failure (3M created, 159K listed — 95% attrition):

1. **Curated, not flooded.** Review process for all marketplace submissions (target: < 5 business days).
2. **Quality tiers.** "Verified" badge for creators who pass code review + user satisfaction thresholds.
3. **Creator analytics dashboard.** Installs, revenue, ratings, retention, churn. Creators who understand their users build better products.
4. **Discoverability infrastructure.** Search, categories, "Staff Picks," algorithmic recommendations, ratings, reviews. This is NOT optional — it's the marketplace.
5. **Template-first pipeline.** Start with templates and configurations (low barrier). Graduate to coded widgets and full pages (higher barrier, higher value). This creates a natural creator pipeline.

### Marketplace as Moat

The marketplace creates three defensive layers:

1. **Supply-side lock-in:** Creators invest time building for Kaivoo's platform. They won't rebuild for a competitor.
2. **Demand-side network effects:** More marketplace items → more users → more creators → more items. Classic platform flywheel.
3. **Data gravity:** Users who install marketplace widgets and customize their platform create deep switching costs.

---

## Competitive Positioning

### The Landscape (February 2026)

```
                    BUILD FROM SCRATCH
                          │
              Lovable ────┤──── Cursor/Antigravity
              (non-dev)   │    (developer)
                          │
                          │
        ────────────────KAIVOO────────────────
        │                 │                   │
   Foundation        AI Platform         Marketplace
   (use it)         (extend it)        (community builds it)
                          │
                          │
              OpenClaw ───┤──── Claude Cowork
              (raw agent) │    (generic agent)
                          │
                    RAW AI TOOLS
```

### Positioning Statement

**For** knowledge workers and builders who want AI-powered productivity without the learning curve,
**Kaivoo is** an AI operating system with the foundation already built
**that** gives you a working command center (journal, tasks, calendar, captures), an AI concierge that knows your day, and a marketplace of community-built extensions.
**Unlike** Lovable (build from scratch), Claude Cowork (generic agent), or Notion (bolted-on AI),
**Kaivoo** starts where others leave off — the hard parts are done, and you build up from there.

### Head-to-Head Positioning

| vs. Competitor | Their Pitch | Our Counter |
|---|---|---|
| **Lovable** | "Build any app with AI" | "We already built the foundation. You spent $800 on Lovable to build what Kaivoo gives you on day one. Build ON TOP of us, not from zero." |
| **Claude Cowork** | "AI agent that does your work" | "Cowork is a generic agent. Kaivoo is an opinionated SYSTEM — agents configured for productivity, pre-built workflows, a community marketplace. It's not just an agent, it's a platform." |
| **OpenClaw** | "Open-source AI assistant in your chat apps" | "OpenClaw is raw and channel-native. Kaivoo is a polished operating system with a visual command center. OpenClaw got acquired by OpenAI. Kaivoo is independent and community-driven." |
| **Notion** | "All-in-one workspace" | "Notion is a blank canvas. You spend 100 hours building your system. Kaivoo works in 5 minutes. Day-centric, AI-native, not a database tool pretending to be a planner." |
| **Sunsama** | "The daily planner for busy professionals" | "Sunsama is beautiful but static — no AI, no journal, no extensibility, no marketplace. Kaivoo is Sunsama's design philosophy with AI superpowers and community extensions." |

---

## Updated Customer Personas

### Primary Persona: The "Behind the Curve" User

**Who:** Someone who sees what AI can do — sees people building tools with Lovable, Claude Code, Antigravity — but doesn't have the technical skills or the time to learn. They're not dumb; they're busy. They know AI is the future and they're looking for a shortcut.

**Quote:** "I see people building incredible stuff with AI but I wouldn't know where to start. I just want something that works."

**Why Kaivoo:** We are the shortcut. We already built the agent system. We already built the productivity foundation. We already figured out the hard parts. Use our platform and skip the learning curve that cost early adopters months and thousands of dollars.

**Tier:** Foundation → Command (natural upsell path)
**Price sensitivity:** $15-30/mo is comfortable. Values time savings over cost.
**Size:** Massive. This is the mainstream adoption wave that follows every technology curve.

### Secondary Persona: The Builder

**Who:** AI-savvy users who already use Claude Code, Cursor, or Lovable. They understand agents and prompts. They want a platform to build ON, not build FROM SCRATCH. They see the marketplace as a revenue opportunity.

**Quote:** "I can build this stuff myself, but why would I when I can build on an existing foundation and sell my work?"

**Why Kaivoo:** The productivity foundation is already there. The agent system is already there. The marketplace gives them an audience. They build a stock trading widget, list it for $9.99/mo, and earn passive income while Kaivoo handles distribution and payments.

**Tier:** Builder ($49.99/mo + usage)
**Price sensitivity:** Low. They're making money on the platform. The subscription is a business expense.
**Size:** Smaller but high-value. These are the people who build the marketplace and make the platform sticky.

### Tertiary Persona: The Existing Three (AI Power User, Productivity Optimizer, Self-Hoster)

These personas from the v1.0 Customer Persona Research remain valid. The platform pivot doesn't eliminate them — it reframes how they interact with Kaivoo:

- **AI Power User** → Command tier. The Concierge service is their 10x moment.
- **Productivity Optimizer** → Foundation → Command. Day-centric design + widget marketplace replaces their fragmented stack.
- **Self-Hoster** → Revisited in Phase 7+ as an enterprise/advanced tier, or served by BYO-key option on any tier.

---

## IP Protection Strategy

### The Core Tension

The user wants to give people "full access to build anything" while preventing code/system theft. This is the Lovable model — and Lovable solved it cleanly:

**Users own their OUTPUT. They never touch the ENGINE.**

### How This Works for Kaivoo

| Layer | User Access | Protection |
|---|---|---|
| **Platform Code** (React app, agent system, orchestrator, services) | Never visible. Cloud-hosted. SaaS model. | Standard SaaS protection — code never leaves the server. |
| **Agent Configurations** (markdown specs) | Readable. Users can see how agents think and modify their own copies. | Template-level IP. The configuration is visible but the orchestration engine that executes it is not. Like seeing a recipe but not owning the kitchen. |
| **User-Built Content** (pages, widgets, custom agents) | Fully owned by the user. Exportable. | User's IP. They can sell it, share it, or keep it private. |
| **Marketplace Items** | Source visible to buyers (like Shopify themes). | Creator sets terms. Kaivoo enforces license compliance. |
| **Workshop AI** (the builder engine) | Users interact via natural language. | The model, prompts, and orchestration logic are server-side. Users see results, not mechanisms. |

### Guardrails

1. **No source code download.** The platform runs as a service. You access it through a browser.
2. **Agent specs are templates, not the system.** Sharing your agent markdown is like sharing a recipe — without the chef, the kitchen, and the ingredients pipeline, it's just text.
3. **Rate limiting and abuse detection.** Automated systems to detect bulk scraping or systematic extraction attempts.
4. **Terms of Service.** Clear prohibition on reverse engineering, systematic replication of platform architecture, or reselling platform access.
5. **The real moat isn't the code.** It's the community, the marketplace, the data gravity, and the continuous improvement. By the time someone replicates the codebase, Kaivoo is three versions ahead with a thriving marketplace they can't copy.

---

## Revenue Projections (Revised)

### $1M ARR Scenarios

| Scenario | Mix | Monthly Revenue | ARR | Timeline |
|---|---|---|---|---|
| **Conservative** | 1,500 Foundation + 800 Command + 200 Builder + marketplace | $22.5K + $24K + $10K + $5K = ~$61.5K/mo | ~$738K | 18-24 months |
| **Moderate** | 2,000 Foundation + 1,200 Command + 400 Builder + marketplace | $30K + $36K + $20K + $10K = ~$96K/mo | ~$1.15M | 12-18 months |
| **Aggressive** | 3,000 Foundation + 2,000 Command + 600 Builder + marketplace | $45K + $60K + $30K + $20K = ~$155K/mo | ~$1.86M | 9-12 months |

**Key assumption:** Marketplace revenue starts small ($2-5K/mo) but compounds as the creator ecosystem grows. By month 18, marketplace could represent 15-25% of total revenue.

### Unit Economics (Target)

| Metric | Target | Notes |
|---|---|---|
| **CAC (Customer Acquisition Cost)** | < $40 | Content marketing, community, YouTube reviews |
| **Blended ARPU** | $28/mo | Weighted average across tiers |
| **Gross Margin** | 75-85% | Foundation (95%) pulls up Command (80%) and Builder (60%) |
| **Monthly Churn** | < 4% | Data gravity + marketplace installations reduce churn |
| **LTV** | > $500 | At $28 ARPU and 4% churn, LTV = $700 |
| **LTV:CAC** | > 10:1 | Strong unit economics if CAC stays < $40 |
| **Payback Period** | < 2 months | At $28 ARPU and $40 CAC |

---

## The "SaaS is Dead" Opportunity

### Why This Moment Matters

- **$1T+ wiped from software stocks** in 2026. Per-seat SaaS is dying. Investors are looking for the NEXT model.
- **"Service-as-Software"** is emerging — AI does the work, you pay for outcomes. Kaivoo's Concierge IS this model.
- **Incumbents are distracted.** Salesforce, ServiceNow, Adobe are all scrambling to retrofit AI. Their architectures were built for human operators. Kaivoo is AI-native from the ground up.
- **The funding environment is shifting.** VC money is flowing to AI-native platforms, away from traditional SaaS. Kaivoo's architecture aligns with where capital is going.

### Kaivoo's Timing Advantage

1. **Lovable proved the market.** 8M users, $200M ARR. People will pay for "skip the learning curve."
2. **OpenClaw proved the architecture.** Markdown-based agent skills work at scale (200K GitHub stars). But it got acquired and has security problems. Opportunity for a polished, secure alternative.
3. **Claude Cowork commoditized orchestration.** This means orchestration alone is no longer a moat — but an opinionated, pre-configured system WITH a marketplace IS a moat.
4. **The "behind the curve" wave is just starting.** Early adopters figured out AI agents in 2024-2025. The mainstream market is arriving in 2026. They need a platform, not raw tools.

---

## Phased Rollout Recommendation

### Phase A: Foundation Launch (Current → 3 months)

**Goal:** Ship the Command Space as a polished cloud platform. No AI features yet. Foundation tier only.

- Complete the remaining Phase 1 items (search, analytics, notifications, PWA)
- Launch publicly with Foundation tier ($14.99/mo)
- Build the widget system architecture
- Begin marketplace infrastructure (browse, install, rate)
- Target: 500-1,000 Foundation users

### Phase B: AI Integration (3-6 months)

**Goal:** Add the Concierge and multi-model routing. Launch Command tier.

- Build the AI orchestrator with intelligent model routing
- Ship the Concierge (context-aware AI assistant)
- Launch Command tier ($29.99/mo)
- Ship 3-5 AI-powered widgets (email reader, smart calendar, task prioritizer)
- Target: 1,000-2,000 total users (mix of Foundation and Command)

### Phase C: Builder Platform (6-9 months)

**Goal:** Launch the Workshop and marketplace. Enable builders.

- Ship the Workshop (AI-powered builder)
- Launch Builder tier ($49.99/mo + usage)
- Open marketplace for community submissions
- Seed marketplace with 20-30 first-party templates/widgets
- Revenue share payments active from day one
- Target: 2,000-4,000 total users, 50+ marketplace items

### Phase D: Scale (9-18 months)

**Goal:** Hit $1M ARR. Grow the marketplace flywheel.

- YouTube/influencer marketing campaign
- Product Hunt launch
- Community building (Discord, Reddit, Twitter)
- Enterprise tier exploration (teams, SSO, self-hosted option for large orgs)
- Target: 5,000+ users, 200+ marketplace items, $80K+ MRR

---

## Open Questions for Founder Decision

1. **Self-hosted: Kill it or park it?** The platform pivot argues for cloud-only. But the self-hoster persona is real and vocal. Recommendation: Park self-hosted for Phase D+ as an enterprise/advanced tier. Don't promise it now.

2. **Free tier: Yes or no?** Lovable has a free tier (5 credits/day). A free Foundation tier with limited widgets could be a powerful acquisition funnel. Risk: free users cost infrastructure money without revenue. Recommendation: 14-day free trial, no permanent free tier.

3. **BYO keys: Which tiers?** Currently proposed as optional on all paid tiers. Alternative: BYO keys only on Builder tier as a power user feature. Recommendation: Available on Command and Builder tiers. Keeps Foundation simple.

4. **Marketplace launch timing:** Should we wait for Builder tier, or seed the marketplace with first-party content at Foundation launch? Recommendation: Seed with 10-15 first-party templates/widgets at Foundation launch. Opens marketplace to community when Builder tier ships.

5. **Token allocation amounts:** The 500K/2M monthly allocations are estimates. Need real usage data to calibrate. Recommendation: Launch with these numbers, monitor actual usage for 60 days, adjust before public marketing locks in expectations.

---

## Risks and Mitigations

| Risk | Severity | Mitigation |
|---|---|---|
| **Lovable/Cursor eat our market** | High | They build FROM SCRATCH. We build ON A FOUNDATION. Different value prop. Emphasize: "Why start from zero when the hard parts are done?" |
| **Claude Cowork adds productivity features** | High | Anthropic is an AI company, not a productivity company. Their Cowork is generic. Kaivoo is opinionated and specialized. Stay ahead on UX and domain depth. |
| **Marketplace doesn't attract creators** | Medium | Generous revenue share (85-100%), seed with first-party content, creator analytics, 0% on first $10K. Don't repeat the GPT Store mistake. |
| **AI costs exceed pricing** | Medium | Smart model routing keeps costs down. Foundation tier is pure margin. Monitor usage closely and adjust token allocations. |
| **"SaaS recovery" — stocks bounce back, narrative shifts** | Low | The structural shift is real even if stocks recover. Per-seat is still dying. Outcome-based is still emerging. Build for the new model regardless. |
| **User privacy concerns with cloud-only** | Medium | Data ownership guarantees, export tools, transparent privacy policy, optional E2E encryption for sensitive data. BYO keys for users who don't want AI data flowing through Kaivoo servers. |

---

## Next Steps

1. **Founder review and approval** of this strategy brief
2. **Vision.md v4.0 rewrite** to reflect the platform pivot
3. **Technical architecture assessment** (Agent 3) — what does the widget system, marketplace, and multi-model routing require?
4. **Marketplace system design** (Agent 3 + Agent 2) — data model, API, creator tools, payment integration
5. **Security review** (Agent 4) — IP protection, rate limiting, abuse detection, cloud-only security posture
6. **Competitive monitoring cadence** — Agent 8 to produce monthly competitive landscape updates, starting with Lovable's next pricing changes and Claude Cowork's enterprise expansion

---

## Sources

### Market Data
- [Lovable: $200M ARR, 8M users, $6.6B valuation](https://techcrunch.com/2025/12/18/vibe-coding-startup-lovable-raises-330m-at-a-6-6b-valuation/)
- [OpenClaw: 200K GitHub stars, acqui-hired by OpenAI](https://techcrunch.com/2026/02/15/openclaw-creator-peter-steinberger-joins-openai/)
- [Claude Cowork: triggered $285B stock crash](https://www.cnbc.com/2026/02/06/ai-anthropic-tools-saas-software-stocks-selloff.html)
- [The SaaSpocalypse: $1T+ wiped from software stocks](https://fortune.com/2026/02/06/anthropic-claude-opus-4-6-stock-selloff-new-upgrade/)

### Pricing Intelligence
- [Lovable pricing: Free → $25-200/mo credit-based](https://lovable.dev/pricing)
- [Cursor pricing: Free → $20-200/mo](https://cursor.com/pricing)
- [Replit: raised to $100/mo Pro tier (Feb 2026)](https://replit.com/pricing)
- [Notion Business: $20/mo including GPT-5 + Claude](https://notion.so/pricing)

### Strategic Analysis
- [SaaStr: The 2026 SaaS Crash analysis](https://www.saastr.com/the-2026-saas-crash-its-not-what-you-think/)
- [Bain: Will Agentic AI Disrupt SaaS?](https://www.bain.com/insights/will-agentic-ai-disrupt-saas-technology-report-2025/)
- [Deloitte: SaaS meets AI agents](https://www.deloitte.com/us/en/insights/industry/technology/technology-media-and-telecom-predictions/2026/saas-ai-agents.html)
- [Fortune: AI agents aren't eating SaaS, they're using it](https://fortune.com/2026/02/10/ai-agents-anthropic-openai-arent-killing-saas-salesforce-servicenow-microsoft-workday-cant-sleep-easy/)

### Marketplace Models
- [Shopify App Store: 15-20% cut, 0% on first $1M](https://shopify.dev/docs/apps/launch/distribution/revenue-share)
- [Notion Templates: 10% + $0.40 per transaction](https://www.notion.com/help/selling-on-marketplace)
- [GPT Store: cautionary tale — vague monetization, poor discoverability](https://medium.com/@vihanga.himantha/the-40b-pivot-how-openais-gpt-store-failure-teaches-founders-when-to-kill-their-darlings-7094529070d1)
- [Atlassian Marketplace: 16-25%, differential pricing drives architecture](https://www.atlassian.com/blog/developer/updates-to-marketplace-revenue-share-2026)

---

*Product Strategy Brief v1.0 — February 24, 2026*
*Agent 8 (Product Manager) + Director*
*Next review: After founder approval, before Vision.md v4.0 rewrite*