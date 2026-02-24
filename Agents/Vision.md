# Kaivoo — Product Vision

**Version:** 3.2
**Last Updated:** February 23, 2026
**Status:** Living document — updated as phases complete and priorities shift

---

## What Is Kaivoo?

Kaivoo is a modular AI operating system built on a central Command Space — your journal, todos, calendar, captures, and second brain under one roof. It starts as a cloud-hosted Command Center for daily productivity, evolves into a self-hosted AI Hub, and scales into a platform where specialized modules (marketing agency, trading bot, content factory) plug into your personal foundation. The Command Space is the nervous system. Modules make it powerful.

**One sentence:** Your hub. Your modules. Your AI. Your rules. Your business.

**The product promise:** Start with the essentials — journal, tasks, calendar — and scale into a full AI-powered operating system. Buy it once and self-host, or subscribe and let us handle the infrastructure. Either way, you're in control.

---

## Core Principles

These are non-negotiable. Every feature, sprint, and decision must align with them.

1. **You own your data.** Every file is a real file. No vendor lock-in. No cloud dependency for core functionality. Export everything, always.

2. **AI serves you, not the other way around.** You choose which AI to use. You provide your own keys. AI agents are transparent markdown files you can read and edit. No black boxes.

3. **Day-centric design.** The "today" view is the home screen. Everything radiates from "what am I doing today?" — journal, tasks, routines, meetings, captures.

4. **Edit where you see it.** If you can see data, you can edit it in place. No hunting through menus. Progressive disclosure over hidden complexity.

5. **Quiet confidence.** The interface doesn't shout. Warm Sand, Deep Navy, Resonance Teal. Apple HIG-level craft. Clarity over cleverness. Warmth through restraint.

6. **Built to ship.** Every feature is built with productization in mind. If it can't be packaged, installed, and used by a paying customer, it's not done.

7. **Revenue is a feature.** The business model isn't an afterthought bolted on at Phase 5. Monetization architecture is baked into technical decisions from day one.

8. **Modular by design.** The Command Space is the foundation. Everything else plugs in as a module. New capabilities extend the platform without breaking existing functionality. Users build up like a lego castle — same foundation, unique structure.

---

## Platform Vision — The Central Hub

### The Foundation

The Journal, Daily View, Todo system, Calendar, and Captures aren't features — they're the **foundation layer** that everything else builds on. Kaivoo's Command Space is the central nervous system: the place where a user lives, thinks, plans, and operates. Every module extends this foundation rather than replacing it.

Think of it as a lego castle. The Command Space is the baseplate and first few layers. Modules are the towers, walls, and turrets you build on top. The foundation ships with every Kaivoo instance. What you build on it is up to you.

### How It Works — The Agency Owner Example

A marketing agency owner opens Kaivoo. Their Day View shows todos, calendar, journal, captures — the same foundation everyone shares. But they also have the Marketing Agency module active.

They join a client meeting through their Kaivoo calendar. The client wants a landing page focused on their spring campaign. They add it to their todo list. The AI orchestrator detects the task context, asks if it should start working. The user confirms.

The Marketing Agency module's agents activate: Research agent does competitive analysis. Copywriter drafts the landing page copy. Designer builds the layout. UX/UI and code engineers produce the page. DevOps deploys it. The deliverable lands back in the user's Kaivoo workspace. The todo updates. The client work is tracked, versioned, and stored.

The foundation stayed constant. The module made it powerful.

### Architecture

```
┌───────────────────────────────────────────────────────────┐
│                      KAIVOO PLATFORM                      │
│                                                           │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │Marketing │  │ Trading  │  │ YouTube  │  │  User-   │  │
│  │  Agency  │  │   Bot    │  │ Factory  │  │  Built   │  │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘  │
│       └──────────────┴──────────────┴──────────────┘      │
│                          │                                │
│  ┌────────────────────────────────────────────────────┐   │
│  │          AI ORCHESTRATOR (The Concierge)            │   │
│  │   Routes tasks · Coordinates agents · Learns you   │   │
│  └────────────────────────────────────────────────────┘   │
│                          │                                │
│  ┌────────────────────────────────────────────────────┐   │
│  │          CORE FOUNDATION (Command Space)            │   │
│  │   Journal · Todos · Calendar · Captures · Vault    │   │
│  │   Theming · Workshop · Auth · Data Layer           │   │
│  └────────────────────────────────────────────────────┘   │
└───────────────────────────────────────────────────────────┘
```

**Core Foundation (always present):** Journal, Daily View, Todos, Calendar, Captures, Second Brain, AI Orchestrator, Theming, Workshop, Auth, Data Layer.

**Modules (plug in):** Each module registers its own AI agents with the orchestrator, adds its own UI sections/pages, reads from and writes to core data (todos, calendar, journal), and has its own specialized tools and workflows.

### Customization — No Two Users Look the Same

Every Kaivoo instance is unique. Users customize their experience through the Workshop AI — from branding and color schemes to dashboard layout and active modules. When you say "customize my dashboard to reflect these brand guidelines," the Workshop AI applies it. Foundation updates ship without breaking user customizations.

**Access tiers:**
- **Subscribers:** AI-assisted customization within guardrails — theme builder, widget arrangement, preset layouts
- **Full access / Self-hosted:** Full Workshop access — build custom integrations, deep customization, module development

### Intelligent Capability Boundaries

The AI orchestrator is self-aware about what the platform can and can't do. It doesn't fail silently and it doesn't overpromise.

**When partial help is possible:** A user's todo says "Create a :30 commercial." No video production module exists yet. The orchestrator doesn't ignore it — it offers what it can: *"I can't help you make a video yet, but I can draft a few script options and sketch out a storyboard. Want me to do that?"* The user still gets value. The gap is visible, not hidden.

**When no help applies:** "Eat healthy." "Go to gym." These are personal tasks. The orchestrator recognizes them and stays out of the way. The intelligence is in knowing when to help, when to offer partial help, and when to say nothing.

This behavior is core to trust. Users need to know the AI is honest about its limits — and genuinely useful within them.

### Module Demand Intelligence

For cloud subscribers (not self-hosted users who own their data), anonymized and aggregated todo list patterns become a product intelligence signal. When thousands of users are creating tasks like "edit video for YouTube" or "design social media posts," that data directly informs which module to build next.

The platform doesn't guess what users want — it watches what they're already trying to do and builds the tools to help them do it. This creates a data-driven module roadmap that follows actual demand rather than assumptions.

**Privacy boundary:** This only applies to cloud subscribers who consent to anonymized usage analytics. Self-hosted users own their data completely — nothing is collected, nothing is transmitted. This distinction is non-negotiable (see Core Principle #1).

### Module Roadmap

| # | Module | Role | Status |
|---|--------|------|--------|
| — | **Command Space** | Core Foundation — journal, todos, calendar, captures, daily view | In progress (~90%) |
| 2 | **Marketing Agency** | Brand guidelines → campaigns, copy, landing pages, social content, asset generation | Planned — begins after Command Space is monetizing |
| 3 | **Trading Bot** | Multi-strategy automated trading, multi-account management, backtesting | Deferred — requires legal/compliance review before development |
| N | **Future Modules** | Prioritized by Module Demand Intelligence — build what users are already trying to do | Long-term — platform architecture must be proven first |

**Revenue gate:** Each module begins development only after the previous module is generating revenue. No speculative investment in Module 3 before Module 2 proves the architecture.

---

## Target Customer

### Primary Personas

**The AI Power User** — Uses ChatGPT/Claude daily but frustrated by context loss, fragmented workflows, and lack of personalization. Willing to pay $29-49/mo for something that actually remembers them and integrates into their life.

**The Self-Hoster** — Privacy-conscious, technically capable. Runs Nextcloud, Home Assistant, or Obsidian. Wants AI on their own hardware with their own keys. Willing to pay $199 once for a polished, packaged solution that saves them weeks of DIY setup.

**The Productivity Optimizer** — Uses Notion/Sunsama/Obsidian but wants AI deeply woven into their daily workflow, not a separate chat window. Willing to pay for the "10x moment" of AI that actually understands their day.

### Secondary Personas (Phase 6+)

**The Agency Owner** — Runs a marketing agency, consulting firm, or creative studio. Uses Kaivoo as their operational hub — client meetings, deliverables, project tracking — with specialized modules (Marketing Agency) to execute client work directly from their todo list. Core + module pricing.

**The Solo Entrepreneur** — Runs multiple ventures or side projects. Wants an all-in-one AI-powered command center that handles productivity, marketing, content creation, and beyond — all from one dashboard. High willingness-to-pay for modules that replace entire SaaS subscriptions.

**The Small Team** — 3-10 people who want shared AI-powered productivity without enterprise pricing. $99/mo team tier.

**The Builder** — Wants to create their own agents, skills, and integrations on top of Kaivoo's platform. Workshop/marketplace customer.

---

## Business Model

### Hybrid Model (Recommended — pending Agent 8 market validation)

| Tier | Price | What They Get | Target |
|---|---|---|---|
| **Kaivoo Self-Hosted** | $199 one-time | Downloadable installer, full app, BYO API keys, local data, all updates for 1 year | Self-hosters, developers, privacy-first users |
| **Kaivoo Cloud** | $29-49/mo | Managed hosting, managed AI (no API keys needed), web access from any device, automatic backups | "Just make it work" users, non-technical users |
| **Kaivoo Team** | $99/mo (up to 10 seats) | Cloud tier + shared workspaces, team vaults, role-based access | Small teams, agencies, studios |

### Revenue Target: $1M ARR

| Scenario | Mix | Timeline |
|---|---|---|
| Conservative | 500 self-hosted ($99.5K) + 2,000 cloud subs at $39/mo ($936K/yr) | 24-30 months |
| Moderate | 1,000 self-hosted ($199K) + 1,500 cloud subs at $39/mo ($702K/yr) + 10 teams at $99/mo ($11.9K/yr) | 18-24 months |
| Aggressive | Focus on cloud subs: 2,200 at $39/mo = $1.03M ARR | 12-18 months |

*These projections are estimates. Agent 8 (Product Manager) will validate with market research.*

### Module Add-Ons (Phase 7+)

| Module | Price | What They Get |
|---|---|---|
| **Command Space** | Included | Core foundation — journal, todos, calendar, captures, daily view, AI orchestrator |
| **Marketing Agency** | $29-49/mo or $149 one-time | Brand guidelines ingestion → campaigns, copy, landing pages, social content. Full AI agent team. |
| **Trading Bot** | TBD (pending legal review) | Multi-strategy automated trading, multi-account management, backtesting. |
| **Custom Modules** | Marketplace pricing | User-built and community modules via the Workshop. |

*Module pricing is preliminary. Agent 8 will validate with market research as each module approaches development.*

---

## Phased Roadmap

### Phase 1: Cloud Command Center (Current)
*Ship a polished, production-grade web app on Supabase.*

| Milestone | Status | Sprint |
|---|---|---|
| Foundation scaffold (Lovable prototype) | DONE | Sprint 0 |
| Security hardening + performance + code quality | DONE | Sprint 1 |
| Error sanitization, accessibility, TrackingWidget refactor, test infrastructure | DONE | Sprint 4 |
| CI/CD pipeline, Zustand optimization, service typing, test expansion (81 tests) | DONE | Sprint 5 |
| Design System migration (Kaivoo palette, components) | DONE | Sprint 3–5 (incremental) |
| Unified Day View (Today page redesign) | DONE | Sprint 3 |
| Task recurrence (Daily/Weekly/Monthly), Tasks page filtering & bulk actions | DONE | Sprint 6 |
| Core feature enhancement (better journal, search) | PLANNED | — |
| Search & file attachments | PLANNED | — |
| Analytics & insights dashboard rebuild | PLANNED | — |
| Notifications & reminders | PLANNED | — |
| PWA (installable, offline read) | PLANNED | — |

### Phase 2: Product Foundation
*Make Kaivoo installable, configurable, and ready to distribute.*

| Milestone | Status | Sprint |
|---|---|---|
| Market analysis & competitive landscape (Agent 8) | DONE | Sprint 2 (parallel) |
| Customer personas & pricing validation | DONE | Sprint 2 (parallel) |
| Desktop packaging (Electron or Tauri) — macOS, Windows, Linux | PLANNED | — |
| Setup wizard — hosting choice, AI config, account setup | PLANNED | — |
| BYO API key architecture — secure storage, multi-provider routing | PLANNED | — |
| Configuration system — settings that persist across install/update | PLANNED | — |
| CI/CD pipeline — automated builds, testing, deployment | DONE | Sprint 5 |
| Dockerized local stack — one-command self-hosted setup | PLANNED | — |
| Telegram bot integration — mobile access channel | PLANNED | — |
| License key / account system | PLANNED | — |

### Phase 3: Self-Hosted Hub
*The local-first experience: run Kaivoo on your own hardware.*

| Milestone | Status | Sprint |
|---|---|---|
| Hub server setup (Node.js + Express + SQLite) | PLANNED | — |
| The Vault — file system + file browser | PLANNED | — |
| Journal on disk (markdown files) | PLANNED | — |
| Dashboard migration (Supabase → SQLite) | PLANNED | — |
| Multi-device sync via WebSocket | PLANNED | — |
| Remote access via Tailscale | PLANNED | — |

### Phase 4: AI Integration
*Add the Concierge AI orchestrator and semantic search.*

| Milestone | Status | Sprint |
|---|---|---|
| The Concierge — AI routing engine (Ollama + Claude/OpenAI/Gemini) | PLANNED | — |
| Agent file parser (markdown → structured config) | PLANNED | — |
| Soul file — persistent AI memory | PLANNED | — |
| RAG + semantic search (embeddings, vector store) | PLANNED | — |
| Journal AI analysis (patterns, themes, mood over time) | PLANNED | — |

### Phase 5: Distribution & Monetization
*Start charging money. Launch publicly.*

| Milestone | Status | Sprint |
|---|---|---|
| Stripe integration — subscription + one-time payment flows | PLANNED | — |
| Landing page & marketing site | PLANNED | — |
| Product Hunt launch | PLANNED | — |
| Self-hosted marketplace listing (GitHub, indie platforms) | PLANNED | — |
| User onboarding flow optimization | PLANNED | — |
| Feedback collection & NPS system | PLANNED | — |
| Monitoring & observability for production users | PLANNED | — |

### Phase 6: Platform Architecture
*Transform Kaivoo from a product into a platform. The Command Space becomes the foundation for modules.*

| Milestone | Status | Sprint |
|---|---|---|
| Module system architecture — registration, lifecycle, sandboxing | PLANNED | — |
| Integration API — modules read/write core data (todos, calendar, journal) | PLANNED | — |
| AI Orchestrator enhancement — route tasks to module agents based on context | PLANNED | — |
| The Workshop — AI-powered customization engine (theming, layout, branding) | PLANNED | — |
| Guardrailed customization for subscribers (presets, theme builder, widget arrangement) | PLANNED | — |
| Full Workshop access for self-hosted users (custom integrations, deep customization) | PLANNED | — |
| Sharing & collaboration (multi-user topics) | PLANNED | — |
| Team workspaces with role-based access | PLANNED | — |

### Phase 7: Module 2 — Marketing Agency
*The first extension module. Proves the platform architecture works.*

| Milestone | Status | Sprint |
|---|---|---|
| Brand guidelines ingestion — upload brand docs, AI extracts tokens and voice | PLANNED | — |
| Marketing agent team — Research, Copywriter, Designer, UX/UI, Engineer agents | PLANNED | — |
| Content generation — landing pages, social posts, email campaigns, ad copy | PLANNED | — |
| Campaign management — plan, schedule, track marketing campaigns | PLANNED | — |
| Asset repository — generated materials stored and versioned in the Vault | PLANNED | — |
| Client/project management — track deliverables, meetings, feedback per client | PLANNED | — |
| Todo integration — AI orchestrator detects marketing tasks, offers to engage agents | PLANNED | — |

### Phase 8: Workshop & Marketplace
*Let users build and share their own modules.*

| Milestone | Status | Sprint |
|---|---|---|
| Module SDK — documentation and tooling for building custom modules | PLANNED | — |
| Module marketplace — browse, install, rate community modules | PLANNED | — |
| Revenue sharing — creators earn from marketplace module sales | PLANNED | — |
| The Theater — media previews (PDF, video, audio, slides) | PLANNED | — |
| Business Hub (multi-user, roles, team vaults) | PLANNED | — |
| Enterprise tier exploration | PLANNED | — |

### Phase 9+: Future Modules
*Expand the module ecosystem as the platform matures.*

| Milestone | Status | Sprint |
|---|---|---|
| Trading Bot module — multi-strategy automated trading (requires legal/compliance review before development) | PLANNED | — |
| YouTube / Content Factory module — video production, thumbnails, publishing pipeline | PLANNED | — |
| Additional community-driven modules via Workshop & Marketplace | PLANNED | — |

---

## Current Position

**We are in:** Phase 1 — Cloud Command Center (~95% complete)
**Active sprint:** None (Sprint 7 planning next)
**Last completed:** Sprint 6 (Feature Depth) — Task recurrence, Tasks page topic/tag filtering, bulk actions, 23 new tests (104 total)

**Sprint 6 delivered:** Topic & tag filtering in Tasks page advanced filters with quick-filter chips and badge click activation. Filtered tab counts. Multi-select mode with bulk status/priority/due date/delete actions. Task recurrence (Daily/Weekly/Monthly) with auto-generation on completion. Recurrence badges on task rows. 23 new tests (104 total). Agent 11 (56/56 PASS) + Agent 7 (all P0s fixed) gates passed. See `Sprints/Sprint-6-Feature-Depth.md`.

**Sprint 5 delivered:** GitHub Actions CI pipeline (lint → format → typecheck → test → build), GitHub remote repository, Zustand selector migration (22 files, zero full-store subscriptions), TasksWidget decomposition, service layer typing (0 `any`), shared config consolidation, 4 accessibility fixes, 34 new tests (81 total, 83% coverage on src/lib/). Agent 11 + Agent 7 gates both passed (8/10 score). See `Sprints/Sprint-5-Pipeline-Polish.md`.

**Sprint 4 delivered:** Error message sanitization (FloatingChat, AIInbox, TrackingWidget), TrackingWidget decomposed into 4 focused modules, mood history append-only pattern, 22 aria-labels across 9 widgets, test strategy + coverage tooling + 47 tests (dateUtils, tracking-types). Agent 11 + Agent 7 gates both passed. See `Sprints/Sprint-4-Secure-Stabilize.md`.

**Sprint 3 delivered:** Widget-based TodayDashboard with configurable layout (drag-to-reorder, add/remove, vertical/horizontal toggle), date-aware activity trace, self-contained ScheduleWidget, FloatingChat, Feature Use Case Bible. See `Sprints/Sprint-3-Restore-Define.md`.

**Key decisions resolved:**
- ~~Design System migration vs. feature work~~ → **Both in Sprint 2** (merged sprint)
- ~~React Query adoption~~ → **Full migration** approved
- ~~Business model validation~~ → **Agent 8 delivered** (Competitive Landscape + Customer Persona reports)

**Key decisions ahead:**
- **Desktop framework choice** — Electron vs. Tauri (Agent 9 to evaluate)
- **Platform architecture scoping** — When to begin module system design alongside core product work
- **Module 2 revenue gate** — Command Space must be generating revenue before Marketing Agency development begins
- **Trading Bot legal review** — Required before any technical planning on Module 3
- **Workshop architecture** — How deep does AI-powered customization go? Theming only, or layout and component composition?

---

## Target Metrics

### Phase 1 (Technical Quality)

| Metric | Target |
|---|---|
| Lighthouse Score | > 95 (all categories) |
| First Contentful Paint | < 1.2s |
| Initial Bundle (gzipped) | < 200KB |
| API Response Time (p50) | < 100ms |
| Accessibility | WCAG AA compliance |
| Code Audit Score | 8.5+/10 |

### Phase 5+ (Business Metrics)

| Metric | Target |
|---|---|
| Monthly Recurring Revenue (MRR) | $83K ($1M ARR) |
| Customer Acquisition Cost (CAC) | < $50 |
| Monthly Churn Rate | < 5% |
| Lifetime Value (LTV) | > $400 |
| LTV:CAC Ratio | > 3:1 |
| Net Promoter Score (NPS) | > 50 |
| Time to Value (setup → "aha moment") | < 5 minutes |

---

## The $1M Target

The north star business goal is **$1M in annual revenue** — whether through subscriptions, one-time sales, or a combination. This target guides every product and prioritization decision:

- Features that increase willingness-to-pay are prioritized over nice-to-haves
- Every phase must move us closer to a chargeable product
- Agent 8 (Product Manager) owns the strategy to get there
- The Director ensures sprints balance technical excellence with commercial readiness

---

## How This Document Is Used

1. **The Director** reads this before every sprint planning session
2. **All agents** can reference this for product context
3. **Agent 8 (Product Manager)** uses this to align business strategy with engineering reality
4. **The user** updates this when priorities shift or new features are requested
5. **Sprint retrospectives** update the Status column as milestones complete

When a milestone moves from PLANNED to DONE, update the Status and Sprint columns. When new milestones are added, place them in the appropriate phase.

---

*Vision v3.0 — February 22, 2026*
*Updated to reflect platform pivot: modular architecture, Command Space as foundation, Marketing Agency as Module 2, long-term module ecosystem*
*Synthesized from Agent 2 (Cloud Roadmap), Agent 3 (Hub Architecture), Agent 8 (Product Strategy), and user platform vision*
