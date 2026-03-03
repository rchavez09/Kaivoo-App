# Kaivoo — Product Vision

**Version:** 4.7
**Last Updated:** March 3, 2026
**Status:** Living document — updated as phases complete and priorities shift

---

## What Is Kaivoo?

Kaivoo is an AI-powered workflow OS that puts the power of a whole business in your hands. It starts as a personal productivity command center — your journal, todos, calendar, captures, and second brain under one roof — and scales into a collaborative platform where solopreneurs and small teams run their entire operation from one place.

The platform ships as **two products on one foundation:**

- **Product 1: Kaivoo Productivity** ($99 one-time / $49 founding member) — A polished, self-contained productivity app. Journal, tasks, projects, calendar, captures, widgets, theme customization, data export. Local-first, you own everything. The Obsidian + Notion + Calendar replacement.

- **Product 2: Kaivoo Orchestrator** (premium subscription, pricing TBD) — An AI agent orchestration platform for builders. Sprint management, multi-model routing, messaging-based control (Telegram or equivalent), autonomous build-review-test-push pipeline. For developers and solo builders who want an AI dev team they can manage from their phone.

- **Full Stack:** Both together. Productivity modules + Orchestrator modules, one platform. Toggle what you need in settings.

**Phase A** ships the Productivity app. **Phase B** adds the Orchestrator as a standalone product AND as an integration/addon for productivity users, plus the One Workflow cloud platform (oneworkflow.ai) with collaboration, business tools, and AI-powered widgets.

The AI isn't a chat box. It's an engine underneath purpose-built tools. Users see specific actions and clear outcomes — not blank prompts. Every widget tells them exactly what it does and what's possible. One button to the moon.

**One sentence:** One workflow. One place. One AI brain that grows from personal assistant to autonomous operator.

**The product promise:** Start with the essentials — journal, tasks, calendar, email, AI concierge — and scale into a full AI-powered operating system for your life and your business. Or skip straight to the builder tools and let your AI team ship code while you're on the couch.

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

9. **Guided, not open-ended.** AI powers everything but users see specific actions, not blank prompts. Every widget defines its capability. No decision paralysis. No prompt engineering. The AI is the engine — the app is the car. Think side-scroller, not open world.

10. **Progressive autonomy.** Start manual, graduate to assisted, evolve to autonomous. The AI earns trust by suggesting before it acts. Every suggestion teaches the user what's possible. The goal: your AI runs your business while you steer.

---

## The Autonomy Ladder

The product evolves through three levels of AI involvement. Each level builds on the last.

### Level 1: You Drive (Phase A)
You do everything. The app is your command center. AI is available when you ask — "draft this email," "summarize this note," "what's on my calendar." The concierge responds to requests. It doesn't initiate.

### Level 2: AI Suggests (Phase B — Concierge)
The AI starts watching and suggesting. "You have a PPT due at 3pm — want me to draft it?" "You got 4 emails from this client — want me to summarize and draft responses?" "You haven't checked Project X in 5 days — here's the status." It sees your data, understands your patterns, and offers to act. You approve. It executes.

This is the "I can do that for you" layer. Critically, it teaches the user what's possible. Every suggestion is a discovery moment: "Oh, it can do *that*?" This solves the blank-chat-box problem — users don't need to know what to ask because the AI tells them what it can do.

### Level 3: AI Operates (Future)
The AI doesn't ask. It just does. Your todo list isn't yours — it's the AI's work queue. Emails get answered. Reports get generated. Follow-ups happen. You review and course-correct. You're the CEO of your own operation, and the AI is your staff.

---

## The Concierge — Identity & Soul

The AI concierge isn't a nameless chatbot. It's a character the user creates and bonds with.

### Hatching

During first-run setup (Phase A wizard) and account creation (Phase B), users "hatch" their concierge — choosing a name, a communication style (formal, casual, direct, warm), and basic preferences. This moment is intentional: people form bonds with things they name. A concierge named "Atlas" that calls you by name and knows you prefer bullet points over paragraphs isn't a tool — it's a partner.

The hatching experience draws inspiration from the AI community's concept of "hatching" — the first interaction that gives an AI its identity. It's not just setup. It's an origin moment. The user is creating something, and that emotional investment drives engagement and retention.

**Phase A hatching:** Part of the setup wizard. Name your concierge, choose a tone, tell it what to call you. Lightweight, warm, memorable.

**Phase B hatching:** Extended onboarding wizard. Name your concierge, set your communication style, then the concierge itself leads a guided tour of the platform — "I'm [name], and here's what we can do together." This is where the user discovers the platform's full power, guided by the AI they just created. Stays in line with "guided, not open-ended" — the concierge shows you what's possible instead of dropping you on a blank dashboard.

### The Soul File

A lightweight, persistent memory layer that gives the concierge personality and continuity. Not a full RAG knowledge base — just the essentials:

- User's name and how they want to be addressed
- Concierge name and personality settings (tone, verbosity, formality)
- Communication style preference ("give me bullet points," "be brief," "explain your reasoning")
- Key patterns observed over time (e.g., "reviews email first thing," "prefers tasks grouped by project")
- Things the user has explicitly told the concierge to remember

The soul file is readable and editable by the user (Core Principle #2 — no black boxes). It grows naturally through use, not through invasive data collection. It's the difference between an assistant that knows you and one that doesn't.

**Design constraint:** The soul must be lightweight enough to load on every interaction without adding latency. A few KB of structured data, not an embedding store. Phase B's RAG and semantic search layer can deepen the concierge's knowledge, but the core soul stays fast and simple.

### Concierge Scope Boundary

The concierge has two capability tiers, cleanly separated by product:

**Productivity Concierge (Product 1 — Phase A):**
- Find notes, summarize content
- Add/complete tasks, add calendar events
- Add context to existing data
- Trainable personality (hatching, soul file, tone preferences)
- Long-term memory stored in files, recall-only (no autonomous actions)
- BYO API keys — Claude, ChatGPT, Llama, any provider the user wants
- **It helps you manage your day. It does not build things.**

**Orchestrator Concierge (Product 2 — Phase B):**
- Everything above, plus...
- Sprint orchestration, agent coordination, build-review-test-push pipeline
- Messaging control (Telegram or equivalent)
- Multi-model routing across roles (e.g., cheap model for chat, Sonnet for search, Opus for building, Gemini for testing)
- Remote-triggered code execution with security gates
- **It builds things for you.**

Same concierge architecture. Same soul file. Same hatching. Different capability ceiling. The Orchestrator unlocks the builder layer — it doesn't replace the productivity layer.

---

## Modular Toggle Architecture

Productivity modules and builder modules are **settings-driven toggles**, not hardwired surfaces. The core platform supports both experiences:

- **Productivity modules:** Journal, Tasks, Projects, Calendar, Routines, Captures, Email — toggle on for the productivity app experience
- **Builder modules:** Sprint Dashboard, Agent Roster, Sandbox, Production Connections, Deployment Status — toggle on for the orchestrator experience
- **Full Stack:** Toggle everything on

The Settings page has a "Modules" section. Users activate what they need. The dashboard adapts to show the relevant surfaces. A pure-builder user sees sprint completions and deployment status, not journal entries. A pure-productivity user sees their day view and tasks, not build logs.

This architecture also enables the **integration play**: an SMB using the productivity app can upgrade to add Orchestrator capabilities. They point it at any repo, any tech stack, and it builds — not just widgets for Kaivoo, but anything. Premium pricing reflects premium capability.

---

## Productization Requirement

Both products ship as **clean template systems**. No Kaivoo-specific content in user-facing specs.

- **Vision.md** → Guided template: "Describe your product. What problem does it solve? Who's the customer?"
- **Director.md** → Generic sprint orchestrator: "I read your Vision, plan your sprints, coordinate your agents."
- **Agent specs** → Role templates: "Software Engineer," "Code Reviewer," "Architect" — no project-specific content
- **Sprint Protocol** → Generic framework, stripped of Kaivoo references
- **First-run experience** → "Describe your project. What's your tech stack? What does your team look like?" — the concierge generates initial Vision, agent roster, and first sprint

**The story:** "Kaivoo was built by this system. Now you can build your thing with it too."

A productization sprint is required before the Orchestrator ships — clean templates, blank-slate onboarding, no user will accidentally clone Kaivoo's internal roadmap.

---

## Platform Vision — The Central Hub

### The Foundation

The Journal, Daily View, Todo system, Calendar, Email, and Captures aren't features — they're the **foundation layer** that everything else builds on. The Command Space is the central nervous system: the place where a user lives, thinks, plans, and operates. Every module and integration extends this foundation rather than replacing it.

Think of it as a lego castle. The Command Space is the baseplate and first few layers. Modules are the towers, walls, and turrets you build on top. The foundation ships with every instance. What you build on it is up to you.

### Architecture

```
┌───────────────────────────────────────────────────────────┐
│                    ONE WORKFLOW PLATFORM                    │
│                                                           │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │Marketing │  │  Sales   │  │  Doc     │  │  User-   │  │
│  │  Tools   │  │Dashboard │  │  Mgmt    │  │  Built   │  │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘  │
│       └──────────────┴──────────────┴──────────────┘      │
│                          │                                │
│  ┌────────────────────────────────────────────────────┐   │
│  │       AI CONCIERGE (The Orchestrator)               │   │
│  │  Routes tasks · Suggests actions · Learns you       │   │
│  │  Watches → Offers → Executes (with permission)      │   │
│  └────────────────────────────────────────────────────┘   │
│                          │                                │
│  ┌────────────────────────────────────────────────────┐   │
│  │       INTEGRATIONS & SKILLS LAYER                   │   │
│  │  Gmail · Calendar · Slack/Teams · Skills Store      │   │
│  └────────────────────────────────────────────────────┘   │
│                          │                                │
│  ┌────────────────────────────────────────────────────┐   │
│  │       CORE FOUNDATION (Command Space)               │   │
│  │  Journal · Todos · Calendar · Captures · Vault      │   │
│  │  Theming · White-Label Config · Auth · Data Layer   │   │
│  └────────────────────────────────────────────────────┘   │
└───────────────────────────────────────────────────────────┘
```

**Core Foundation (always present):** Journal, Daily View, Projects & Tasks, Calendar, Captures, Second Brain, AI Concierge, Theming, White-Label Config, Auth, Data Layer.

**Integrations Layer:** Email (Gmail/Outlook), Calendar sync, messaging (Slack/Teams integration), and the skills store. Users connect their existing tools — they don't replace them. Everything flows through one place.

**Business Widgets (Phase B):** Marketing tools, sales dashboards, document management, CRM — purpose-built interfaces with AI underneath. Not chat prompts. Specific tools. Clear outcomes.

### How It Works — The Solopreneur Example

A freelance marketing consultant opens One Workflow. Their Day View shows todos, calendar, journal, captures, and email — all in one place. The AI concierge notices a todo: "Create social media content for Client X's spring campaign."

It surfaces a suggestion: "I can draft 5 Instagram captions based on Client X's brand guidelines. Want me to start?" The user taps yes. The Marketing widget activates. Copy appears. The user reviews, edits, and exports — never leaving the app.

The concierge didn't wait to be asked. It saw the task, knew it could help, and offered. The user didn't need to know what prompt to write or what tool to use. The system guided them.

### Intelligent Capability Boundaries

The AI concierge is self-aware about what the platform can and can't do. It doesn't fail silently and it doesn't overpromise.

**When partial help is possible:** A user's todo says "Create a :30 commercial." No video production capability exists yet. The concierge doesn't ignore it — it offers what it can: *"I can't help you make a video yet, but I can draft a few script options and sketch out a storyboard. Want me to do that?"* The user still gets value. The gap is visible, not hidden.

**When no help applies:** "Eat healthy." "Go to gym." These are personal tasks. The concierge recognizes them and stays out of the way. The intelligence is in knowing when to help, when to offer partial help, and when to say nothing.

This behavior is core to trust. Users need to know the AI is honest about its limits — and genuinely useful within them.

### Customization & White-Labeling

Every instance can be branded. Logo, colors, app name — stored as settings, not hardcoded. This serves two purposes:

1. **Personal users:** Make it feel like theirs. Custom themes, layout preferences.
2. **SMBs and agencies:** White-label the platform with their own brand for internal or client-facing use.

**Phase A:** Settings-driven branding config (logo, colors, app name). Lightweight. Architectural foundation.
**Phase B:** Full white-label capabilities. Workshop AI for deeper customization.

### Module Demand Intelligence

For cloud subscribers (not self-hosted users who own their data), anonymized and aggregated todo list patterns become a product intelligence signal. When thousands of users are creating tasks like "edit video for YouTube" or "design social media posts," that data directly informs which widget or module to build next.

The platform doesn't guess what users want — it watches what they're already trying to do and builds the tools to help them do it.

**Privacy boundary:** This only applies to cloud subscribers who consent to anonymized usage analytics. Self-hosted users own their data completely — nothing is collected, nothing is transmitted. This distinction is non-negotiable (see Core Principle #1).

### Concierge-as-Builder

The concierge doesn't just operate within the app — it builds within the app. Users describe what they want in natural language, and the concierge creates it: new pages, widgets, integrations, and workflows.

**Personal customization (Phase B):** "I want my Notes in rich text, not markdown." "Add a field to my Captures for priority level." "Build me a client dashboard that pulls from Projects and Email." The concierge modifies and extends the user's instance through conversation. No code. No prompts. Just outcomes.

**Marketplace creation (Phase C):** Users package their concierge-built creations and list them for others to install. A marketing consultant builds a "Client Pulse" dashboard, polishes it, and sells it for $9.99. The platform earns commission. The ecosystem grows.

**Guardrails:**
- The Core Foundation (Journal, Todos, Calendar, Captures, Auth, Data Layer) is immutable — the concierge builds on top of it, never modifies it
- User-built modules run in sandboxed environments with declared capability permissions
- Marketplace listings go through automated quality and security review before publishing

### 1st-Party Modules & Marketplace Architecture

Kaivoo ships its own business widgets (Marketing Tools, Sales Dashboard, Document Management) as **1st-party modules** built in the same Page + Today Widget format that the marketplace uses. These serve two purposes:

1. **Product value:** Polished, supported business tools that subscribers pay for
2. **Template standard:** The reference implementation for how marketplace modules should be built — packaging structure, permission declarations, widget patterns, data access conventions

Every 1st-party module passes through the same packaging checks that marketplace submissions require. This ensures the format is proven, documented, and battle-tested before third-party creators use it. When a user wants to build their own module, they can study how the 1st-party ones work — the format is the teacher.

**The Page + Today Widget pattern:** Every module consists of at least a full Page (the workspace) and a Today Widget (the at-a-glance summary). This is the atomic unit of the platform. The Marketing Tools module has a Marketing page and a "Content Due Today" widget. A user-built Reddit Scraper has a Reddit Feed page and a "Trending Topics" widget. Same structure, infinite variety.

---

## Target Customer

### Phase A: The Individual

**The AI Power User** — Uses ChatGPT/Claude daily but frustrated by context loss, fragmented workflows, and lack of personalization. Willing to pay $49-99 once for something that actually remembers them and integrates into their life.

**The Self-Hoster** — Privacy-conscious, technically capable. Runs Nextcloud, Home Assistant, or Obsidian. Wants a polished local-first app on their own hardware. Willing to pay $49-99 for a packaged solution that saves them weeks of DIY setup.

**The Productivity Optimizer** — Uses Notion/Sunsama/Obsidian but wants a unified workflow — journal, tasks, calendar, captures in one place. Willing to pay for the "10x moment" of replacing their fragmented stack.

### Phase B: The Business Operator

**The Solopreneur** — Runs one or more ventures. Currently duct-taping Notion + Google Calendar + spreadsheet CRM + a separate AI chat. Wants one AI-powered place that replaces the stack. Willing to pay $29-49/mo for the tool that runs their whole operation.

**The Agency Owner** — Runs a marketing agency, consulting firm, or creative studio. Uses One Workflow as their operational hub — client meetings, deliverables, project tracking — with business widgets to execute work directly from their dashboard. High willingness-to-pay.

**The Small Team** — 2-25 people who want shared AI-powered productivity without HubSpot/Salesforce complexity or pricing. Shared tasks, shared calendars, role-based access. One tool for the whole team.

**The Builder** — Wants to create their own integrations and skills on top of the platform. Skills store / marketplace customer.

**The Solo Builder (Orchestrator)** — A developer or technical founder building a product alone or with a tiny team. Currently babysitting AI code assistants, manually managing context, doing the review-test-push loop dozens of times a day. Wants an autonomous AI dev team they can text from their couch. High willingness-to-pay ($99-199/mo) for a system that turns "boot up sprint 5" into tested, reviewed code.

---

## Business Model

### Two-Phase Revenue Strategy

#### Phase A: One-Time Purchase (Revenue Now)

| Tier | Price | What They Get | Target |
|---|---|---|---|
| **Standard** | $99 one-time | Full productivity app, widget system, theme customization, data export, 1 year of updates, single device | AI power users, productivity optimizers, self-hosters |
| **Founding Member** | $49 one-time | Everything in Standard + permanent discount on Phase B subscription tiers | All buyers before Phase B launches (no cap) |

**What's included in Phase A:** Journal, tasks, calendar, captures, daily view, widget system, theme customization, data export (markdown/JSON), 1 year of updates, single device.

**What's NOT in Phase A (deferred to Phase B):** AI features, multi-device sync, marketplace, collaboration.

**License:** Proprietary EULA. Personal or internal business use only. No redistribution, resale, sublicensing, or derivative products for sale. Source access (if provided) is for customization only. License key required for activation.

**Pricing strategy:** Volume over margin. $49 is impulse pricing — no week of deliberation. Every Phase A buyer is a warm lead for Phase B subscriptions. "Pay once, own forever" resonates with subscription-fatigued market.

**Revenue milestone:** 2,000+ founding member sales = ~$100K. This funds Phase B development and validates demand.

#### Phase B: One Workflow Cloud Subscription (ARR)

| Tier | Price | What They Get | Target |
|---|---|---|---|
| **One Workflow Solo** | TBD (research needed) | Managed hosting, managed AI, full feature access, email/calendar/messaging integration | Solopreneurs, freelancers |
| **One Workflow Team** | TBD (research needed) | Solo tier + shared workspaces, task assignment, role-based access (admin/manager/member) | Small teams (2-25) |
| **Business Widgets** | TBD (addon pricing) | Marketing tools, sales dashboards, document management, CRM — per-widget or bundled | Teams needing business-grade tools |

**Pricing note:** Subscription pricing requires research on AI token costs per user, competitive pricing teardowns (HubSpot, Monday, Notion), and addon model analysis. Agent 5 + Agent 8 to deliver before Phase B pricing is finalized.

**The HubSpot play:** Cut their pricing at the core. Target the SMBs that are confused by HubSpot's 47 tiers and using a tenth of its features. Simple pricing. Clear capabilities. AI that actually helps instead of adding complexity.

### Revenue Target: $1M ARR

| Scenario | Phase A One-Time | Phase B Subscriptions (TBD pricing) | Timeline |
|---|---|---|---|
| Conservative | 2,000 founding members ($98K) | + subscription ARR (pricing TBD) | 24-30 months |
| Moderate | 3,500 founding members ($172K) | + subscription ARR (pricing TBD) | 18-24 months |
| Aggressive | 5,000+ founding members ($245K+) | + subscription ARR (pricing TBD) | 12-18 months |

*Phase A projections based on $49 founding member pricing. Phase B subscription pricing requires research on AI token costs, competitive pricing, and addon model. Agent 5 + Agent 8 to deliver when Phase B feature scope is finalized.*

### Widget & Module Add-Ons (Phase B+)

| Widget/Module | Price Model | What They Get |
|---|---|---|
| **Command Space** | Included | Core foundation — journal, todos, calendar, captures, daily view, AI concierge |
| **Marketing Tools** | Addon (TBD) | Content creation, social media, campaign planning, brand guidelines |
| **Sales Dashboard** | Addon (TBD) | Pipeline tracking, contact management, lightweight CRM |
| **Document Management** | Addon (TBD) | Upload, organize, share, version business documents |
| **Skills Store** | Marketplace pricing | Community-built integrations and skills |

*Widget pricing TBD — per-seat, per-widget, or bundled tiers. Research required on token costs and competitive positioning.*

---

## Phased Roadmap

### Phase A: Ship & Sell the Productivity App
*Finish the product. Charge $99/$49. Hit $100K. Learn from real users.*

#### Completed (Sprints 0–18)

| Milestone | Status | Sprint |
|---|---|---|
| Foundation scaffold (Lovable prototype) | DONE | Sprint 0 |
| Security hardening + performance + code quality | DONE | Sprint 1 |
| Error sanitization, accessibility, TrackingWidget refactor, test infrastructure | DONE | Sprint 4 |
| CI/CD pipeline, Zustand optimization, service typing, test expansion (81 tests) | DONE | Sprint 5 |
| Design System migration (Kaivoo palette, components) | DONE | Sprint 3–5 (incremental) |
| Unified Day View (Today page redesign) | DONE | Sprint 3 |
| Task recurrence (Daily/Weekly/Monthly), Tasks page filtering & bulk actions | DONE | Sprint 6 |
| Calendar page redesign — month grid + hourly day view, meetings-first hierarchy | DONE | Sprint 16 |
| Core feature enhancement (journal, topics, notes, captures) | DONE | Sprints 7–8, 14 |
| Routines & Habits — streaks, strength, analytics, mood correlation, Today widget redesign | DONE | Sprint 17 |
| Global full-text search (FTS, GIN indexes, command palette, search trigger) | DONE | Sprint 18 |
| Calendar week view (7-column hourly grid, 3-mode switcher) | DONE | Sprint 18 |
| Customizable keyboard shortcuts (Settings UI, shortcut recorder, browser conflict validation) | DONE | Sprint 18 |
| Market analysis & competitive landscape (Agent 8) | DONE | Sprint 2 (parallel) |
| Customer personas & pricing validation | DONE | Sprint 2 (parallel) |
| CI/CD pipeline — automated builds, testing, deployment | DONE | Sprint 5 |
| Projects system — Project → Task → Subtask hierarchy, project date ranges | DONE | Sprint 8 |

#### Remaining (Pre-Ship)

| Milestone | Status | Priority |
|---|---|---|
| Topics as Knowledge OS — vault file browser (Topics/Projects/Journal/Library/Inbox), Obsidian-compatible markdown export, topic nesting with recursive tree, dual-adapter architecture (LocalVaultAdapter + VirtualVaultAdapter) | **DONE** | Sprint 22 |
| Desktop packaging (Tauri 2.0) — macOS scaffold complete, .dmg builds. Windows/Linux CI in Sprint 22. | **DONE** | Sprint 20 |
| Data layer abstraction — DataAdapter pattern (4 interfaces, 15 entity sub-adapters). SupabaseAdapter + LocalAdapter. Runtime switching via `isTauri()`. | **DONE** | Sprint 20 |
| Local-first storage — SQLite CRUD persistence, FTS5 search, local auth session. Data persists to disk without Supabase. | **DONE** | Sprint 21 |
| File attachments + image embedding — files in project/topic folders, images embedded inline in notes, `.attachments/` storage | PLANNED | Must-have |
| AI settings page + BYO API key wizard — choose provider, enter keys, test connection | **DONE** (Sprint 23) | Must-have |
| AI chat concierge — in-app conversational AI, messaging app integration (Telegram) | **DONE** (Sprint 23 — in-app chat; Telegram deferred to Phase B) | Must-have |
| Google Calendar integration — OAuth, two-way sync | PLANNED | Must-have |
| Gmail integration — read, send, organize email within the app | PLANNED | Must-have |
| Setup wizard + Concierge Hatching — vault folder selection, AI config, Obsidian import (file copy), concierge hatching, guided tour | **DONE** (Sprint 23) | Must-have |
| License key system — activation, tier validation, commercial distribution | PLANNED | Must-have |
| Landing page & marketing site | PLANNED | Must-have |
| Stripe integration — one-time payment flow | PLANNED | Must-have |
| EULA / legal documentation — proprietary license, redistribution terms, privacy policy | PLANNED | Must-have |
| Product Hunt launch | PLANNED | Must-have |
| White-label config layer — logo, colors, app name as settings (not hardcoded) | PLANNED | Should-have |
| Outlook integration — email + calendar (fast-follow after Google) | PLANNED | Should-have |
| PWA (installable, offline read) | PLANNED | Should-have |
| Notifications & reminders | PLANNED | Should-have |

### Phase B: One Workflow Cloud Platform + Orchestrator
*Two revenue streams: One Workflow subscriptions for solopreneurs/teams + Kaivoo Orchestrator for builders. ARR engine. Target $1M.*

#### Orchestrator (Product 2)

| Milestone | Status |
|---|---|
| Productize agent system — markdown specs → executable agent templates | PLANNED |
| Orchestrator dashboard — sprint completions, production connections, sandbox, deployment status | PLANNED |
| Multi-model routing engine — assign models to roles, API key management, cost tracking | PLANNED |
| Messaging integration (Telegram or alternative) — first-class control surface, not just notifications | PLANNED |
| "New Project" wizard — concierge generates Vision, agent roster, first sprint from conversation | PLANNED |
| Productization sprint — clean templates, strip Kaivoo-specific content, blank-slate onboarding | PLANNED |
| Security model — auth for remote-triggered execution, confirmation flows, blast-radius controls | PLANNED |
| Orchestrator-as-addon — toggle for existing productivity app users to add builder capabilities | PLANNED |
| Orchestrator subscription billing — premium pricing, Stripe recurring | PLANNED |

#### One Workflow Cloud

| Milestone | Status |
|---|---|
| Shared notes, tasks, calendars — collaboration foundation | PLANNED |
| Task assignment & delegation — assign, track, complete | PLANNED |
| Role-based access — admin / manager / member tiers | PLANNED |
| Team onboarding — invite, set roles, configure shared workspaces | PLANNED |
| AI Concierge Level 2 — proactive suggestions, "I can do that for you" prompts | PLANNED |
| Skills & integration architecture — plugin API, MCP-based skills store design | PLANNED |
| Integration: Slack/Teams — connect (not rebuild), messages flow through One Workflow | PLANNED |
| Marketing widget — content creation, social media, campaign planning | PLANNED |
| Sales dashboard widget — pipeline tracking, contact management, lightweight CRM | PLANNED |
| Document management widget — upload, organize, share, version | PLANNED |
| The Concierge — AI routing engine (Claude/OpenAI/Gemini, Ollama for self-hosted) | PLANNED |
| Soul file — concierge identity, user preferences, communication style, persistent memory | PLANNED |
| Concierge-as-Builder — personal customization through conversation (pages, widgets, field changes) | PLANNED |
| Concierge Hatching (Phase B) — extended onboarding wizard, guided platform tour led by the concierge | PLANNED |
| 1st-party modules — Marketing, Sales, Docs built in Page + Today Widget format (marketplace template) | PLANNED |
| RAG + semantic search (embeddings, vector store) | PLANNED |
| Journal AI analysis (patterns, themes, mood over time) | PLANNED |
| Subscription billing — Stripe recurring payments, tier management | PLANNED |
| Monitoring & observability for production users | PLANNED |
| Analytics & insights dashboard rebuild | PLANNED |
| "One Workflow" branding & marketing site (oneworkflow.ai) | PLANNED |

### Phase C: Platform & Marketplace
*Open the ecosystem. Let users and developers build on top of One Workflow.*

| Milestone | Status |
|---|---|
| Skills store & marketplace — browse, install, rate community and 1st-party modules | PLANNED |
| Module SDK — documentation, tooling, and Page + Today Widget packaging format for builders | PLANNED |
| Concierge-as-Builder (marketplace) — users publish concierge-built creations, automated quality/security review | PLANNED |
| Revenue sharing — creators earn from marketplace sales, Kaivoo earns commission | PLANNED |
| AI Concierge Level 3 — autonomous operation, AI executes without asking | PLANNED |
| Email/CMS/Social Media/Website Hosting widgets — addon business tools | PLANNED |
| Full white-label Workshop — deep customization, branding, layout composition | PLANNED |
| Business Hub (multi-user, roles, team vaults) | PLANNED |
| The Theater — media previews (PDF, video, audio, slides) | PLANNED |
| The Vault — full file system + file browser (Phase A local-first storage is the architectural foundation) | PLANNED |
| Self-hosted hub (Node.js + SQLite, Dockerized, multi-device sync) | PLANNED |
| Trading Bot module (requires legal/compliance review before development) | PLANNED |
| YouTube / Content Factory module | PLANNED |
| Additional community-driven modules via Skills Store | PLANNED |

---

## Research Parcels (Active)

These run in parallel with sprint work, not blocking it.

| Parcel | Owner | Deliverable | Status |
|---|---|---|---|
| Token cost modeling | Agent 5 | Cost-per-user estimates at light/medium/heavy AI usage tiers | PLANNED |
| Competitive pricing teardown | Agent 8 | HubSpot, Monday, Notion, Asana pricing analysis — where the floor is for SMBs | PLANNED |
| Addon pricing model | Agent 8 | Per-seat vs. per-workspace vs. usage-based analysis with widget addon tiers | PLANNED |
| Legal / EULA research | Agent 5 | EULA template, redistribution terms, privacy policy framework — to be reviewed by attorney | PLANNED |
| "One Workflow" positioning validation | Agent 8 | Does the name resonate? Does "replace your stack" land with target personas? | PLANNED |
| Marketplace model analysis | Agent 8 | Shopify Apps, Figma Community, Notion Templates — commission structures, quality control, creator incentives | PLANNED |
| Sandboxed module runtime | Agent 3 | Evaluate iframe sandboxing, Web Components, controlled runtimes for user-built modules — security vs. capability | PLANNED |
| Messaging channel evaluation | Agent 5 | Telegram Bot API capabilities/limitations vs. custom messaging layer — viability for Orchestrator control surface | PLANNED |
| Agent system productization | Agent 3 | How to turn markdown agent specs into executable, shippable agent templates without losing simplicity | PLANNED |
| Solo Builder market validation | Agent 8 | Is the autonomous AI dev team market big enough? Willingness-to-pay for $99-199/mo Orchestrator subscription | PLANNED |
| Remote execution security model | Agent 4 | Auth, confirmation flows, blast-radius controls for text-triggered code execution and git operations | PLANNED |
| Orchestrator pricing model | Agent 8 | Subscription vs. usage-based vs. hybrid pricing for Product 2 | PLANNED |
| Productization template design | Agent 3 + Agent 8 | What does a blank agent system look like for a new user? Guided not empty. First-run wizard design | PLANNED |
| Multi-model orchestration overhead | Agent 5 | Users pay API costs — what's the platform orchestration overhead on top? | PLANNED |
| Electron vs. Tauri evaluation | Agent 9 | Desktop framework for Phase A — performance, bundle size, file system API, cross-platform maturity, Rust vs. Node | **DONE (Sprint 20)** — Tauri 2.0 selected |
| SQLite schema + adapter interface | Agent 3 | Local-first schema design. Mirror Supabase or redesign? Adapter pattern for swappable backend. | **DONE (Sprint 20)** — DataAdapter pattern implemented |
| File watching mechanism | Agent 3 | How to detect manual file changes on disk for "permissive by nature" design | PLANNED |
| Desktop auto-update + code signing | Agent 9 | Update distribution mechanism, Apple notarization, Windows signing | PLANNED |

---

## Current Position

**We are in:** Phase A — Productivity App (completing pre-ship features)
**Active sprint:** None (Sprint 22 just completed)
**Last completed:** Sprint 22 (Knowledge Vault) — vault file browser, markdown export, adapter stabilization, topic nesting

**Sprint 22 delivered:** Knowledge Vault with dual-adapter architecture (LocalVaultAdapter for Tauri desktop, VirtualVaultAdapter for web). File browser at `/vault` with 5 root folders (Topics/Projects/Journal/Library/Inbox), tree navigation, search, breadcrumbs, entity deep-linking. Obsidian-compatible markdown export with YAML frontmatter for 5 entity types. Topic parentId nesting with recursive tree rendering. Adapter stabilization: `local.ts` split into 6 modules, SearchIndexer for per-CRUD FTS5 indexing, entity_type discriminator, empty-set guards. 265 tests (39 new). Agent 7 found 6 P0 issues (path traversal, YAML injection, cascade delete, caching, routing, idempotent migration) — all fixed. 3-agent design review passed. See `Sprints/Sprint-22-Knowledge-Vault.md`.

**Sprint 21 delivered:** Local-first storage — SQLite CRUD persistence for all 13 entities, FTS5 search with `search_all` function, local auth session management. See `Sprints/Sprint-21-Local-First-Storage.md`.

**Sprint 20 delivered:** DataAdapter abstraction layer (4 top-level interfaces, 15 entity sub-adapters), runtime switching via `isTauri()`. LocalDataAdapter with static factory pattern + SQLite schema for all 13 entities. SupabaseDataAdapter wrapping existing queries. AdapterProvider React context with Suspense boundary. Tauri 2.0 scaffold (Cargo.toml, plugins: sql/fs/shell, capabilities, RGBA icon generation). 18 Playwright E2E tests. Sprint Protocol v1.8 (living sprint file + E2E gate). See `Sprints/Sprint-20-Local-First-Foundation.md`.

**Sprint 19 delivered:** Topics restructure (parent-child topic pages, inline edit, emoji picker), bundle optimization (8 vendor chunks via Vite manualChunks), tech debt cleanup. See `Sprints/Sprint-19-Topics-Quality.md`.

**Sprint 18 delivered:** Supabase Postgres FTS with GIN indexes across 10 tables, `search_all` RPC with `websearch_to_tsquery`, SearchCommand command palette (Cmd+K), SearchTrigger bar on Today page, Calendar week view (7-column hourly grid, 3-mode switcher), customizable keyboard shortcuts system (Settings UI, shortcut recorder, browser conflict validation). See `Sprints/Sprint-18-Search-Week-View.md`.

**Sprint 17 delivered:** Three habit types (Positive, Negative, Multi-count), streaks, exponential-smoothing strength scores, analytics dashboard with mood-habit correlation, Today widget upgrade with two-way sync, habit detail view with calendar dots. See `Sprints/Sprint-17-Routines-Habits.md`.

**Sprint 14 delivered:** Project Notes CRUD (project_notes table, RLS, service layer, Zustand store). ProjectDetail Notes section with inline editing. Quick Add note-to-project from anywhere (Cmd+Shift+N). Notes included in data export/import. See `Sprints/Sprint-14-Connect.md`.

**Key decisions resolved (CEO Session — March 1, 2026):**
- ~~Business model: one-time only vs. subscription~~ → **Two-phase strategy** (Phase A: $99/$49 one-time, Phase B: subscription ARR)
- ~~Product positioning~~ → **AI-powered workflow OS** — guided, outcome-first AI, not blank chat boxes
- ~~Enterprise vs. SMB focus~~ → **SMB focus** — solopreneurs to small teams (1-25), no "enterprise" language
- ~~Rebrand timing~~ → **Phase A ships under current branding, Phase B launches as "One Workflow by Kaivoo Media"**
- ~~White-label architecture~~ → **Build config layer now (Phase A), full white-label in Phase B**
- ~~Skills/integration priority~~ → **Elevated from Phase 8 to Phase B core** — design alongside AI orchestrator
- ~~Phase B subscription pricing~~ → **Deferred pending research** on token costs and competitive analysis
- ~~Legal protection~~ → **Required before Phase A ship** — EULA, license key, redistribution restrictions

**Key decisions resolved (earlier sprints):**
- ~~Design System migration vs. feature work~~ → **Both in Sprint 2** (merged sprint)
- ~~React Query adoption~~ → **Full migration** approved
- ~~Business model validation~~ → **Agent 8 delivered** (Competitive Landscape + Customer Persona reports)
- ~~Projects data model~~ → **Implemented in Sprint 8** (Project → Task linking, status transitions, timeline view)
- ~~Design Agent structure~~ → **Split into 3 agents in Sprint 12** (Visual Design, Accessibility & Theming, UX Completeness)

**Key decisions resolved (CEO Session #2 — March 1, 2026):**
- ~~Concierge identity~~ → **Users name and personalize their concierge** — soul file for memory/personality, hatching during setup wizard
- ~~Concierge-as-Builder~~ → **Confirmed for Phase B (personal) and Phase C (marketplace)** — AI builds pages, widgets, and customizations through conversation
- ~~1st-party module format~~ → **Page + Today Widget pattern** — Kaivoo's own modules serve as marketplace templates, same packaging checks
- ~~Phase B onboarding~~ → **Concierge-led guided tour** — the hatched concierge walks users through platform capabilities

**Key decisions resolved (CEO Session #3 — March 1, 2026):**
- ~~Single product vs. multi-product~~ → **Two products on one platform** — Kaivoo Productivity ($99/$49 one-time) + Kaivoo Orchestrator (premium subscription)
- ~~Concierge scope~~ → **Clean boundary** — Productivity concierge = helper (find, summarize, add, recall). Orchestrator concierge = builder (sprint, agents, deploy). Same architecture, different capability ceiling.
- ~~Modular toggle architecture~~ → **Settings-driven modules** — productivity and builder features as toggleable surfaces, dashboard adapts to active modules
- ~~Productization requirement~~ → **Clean templates required before Orchestrator ships** — no Kaivoo-specific content in user-facing agent specs, blank-slate onboarding
- ~~Orchestrator as integration~~ → **Confirmed** — SMBs can add Orchestrator as addon to productivity app, works with any repo/tech stack, premium pricing
- ~~Phase A concierge BYO keys~~ → **Scoped to productivity use** — users connect Claude, ChatGPT, Llama, any provider. Multi-model routing architecture ships in Phase A but only productivity capabilities exposed.
- ~~Phase A vs. Phase B priority~~ → **Ship productivity app first** — revenue now funds Orchestrator development. Research runs in parallel.

**Key decisions resolved (CEO Session #4 — March 1, 2026):**
- ~~Local-first storage phasing~~ → **Phase A must-have** — one-time purchase model requires local storage. Supabase cloud dependency creates inverted unit economics. Local-first solves business model and aligns with Core Principle #1.
- ~~Desktop packaging priority~~ → **Promoted to Phase A must-have** — required for file system access. One codebase, three platform builds (macOS, Windows, Linux).
- ~~Topics page role~~ → **Knowledge OS** — Topics is the top-level hierarchy (Topics > Projects > Tasks/Files). Smart file browser, single source of truth for all content and files. Convention with flexibility: opinionated default, permissive by nature.
- ~~Data architecture for local~~ → **Swappable backend** — Data layer abstraction with LocalAdapter (SQLite + file system) for Phase A and CloudAdapter (Supabase) for Phase B. One codebase, no split.
- ~~File attachments priority~~ → **Promoted to Phase A must-have** — files in project/topic folders, images embedded inline in notes.
- ~~Hashtags as folders vs. filters~~ → **Virtual groupings (filters)** — hashtags are metadata filters, not physical subfolders. Files can have multiple tags but live in one folder.
- ~~Folder structure ownership~~ → **SQLite is source of truth** — folder structure on disk is the default representation, but metadata/relationships tracked in SQLite. If user rearranges files manually, app detects and updates index.
- ~~Obsidian import scope~~ → **File copy, feature not headline** — copy .md files into Topics, index #hashtags and [[wiki-links]], no plugins/frontmatter/graph. Default copy, optional adopt-in-place.
- ~~Supabase during development~~ → **Keep for dev/test** — Supabase stays for development. Shipped product uses local SQLite. Data layer abstraction enables the swap.
- ~~Codebase split~~ → **No split until Phase A ships** — same React frontend, same repo, adapter pattern handles local vs. cloud.
- ~~Entry export~~ → **Export to file** — journal entries/captures can be exported as .md files to chosen Topics folder location.

**Key decisions resolved (Sprint 20 — March 2, 2026):**
- ~~Electron vs. Tauri~~ → **Tauri 2.0** — 3-10MB bundles vs. 150MB+ Electron, Rust backend, native system tray, plugin ecosystem. Scaffold complete, first build compiled 539 Rust crates. See `Sprints/Sprint-20-Local-First-Foundation.md`.
- ~~SQLite schema design~~ → **Mirror Supabase with camelCase** — 13-entity SQLite schema mirroring Supabase tables. DataAdapter abstraction with `LocalDataAdapter` (SQLite) and `SupabaseDataAdapter` (Supabase). Runtime switching via `isTauri()`. One codebase, swappable backend.
- ~~Data architecture for local~~ → **Implemented** — DataAdapter pattern with 4 top-level interfaces (DataAdapter, AuthAdapter, SearchAdapter, StorageAdapter) and 15 entity sub-adapters. Static factory pattern eliminates uninitialized state.

**Key decisions resolved (CEO Strategic Brief — March 2, 2026):**
- ~~Phase A pricing~~ → **$99 standard / $49 founding member** (one-time). Volume over margin. Every Phase A buyer is a Phase B subscription lead. Founding member status closes when Phase B launches. No cap. See `Research/Agent-5-Docs/CEO-Strategic-Brief-Phase-A-Pricing.md`.
- ~~Phase A feature scope~~ → **No AI in Phase A**. AI features (concierge, BYO keys) deferred to Phase B. Phase A ships: journal, tasks, calendar, captures, widgets, themes, data export.

**Key decisions resolved (Sprint 21 — March 2, 2026):**
- ~~Phase A sprint sequencing~~ → Sprint 21: Local-First Storage (DONE). Sprint 22: Knowledge Vault (DONE). Sprint 23: Setup & AI Foundation (DONE). Sprint 24+: Calendar, email, licensing, launch.

**Key decisions ahead:**
- **File watching mechanism** — How does the app detect manual file changes on disk? Agent 3.
- **Desktop auto-update** — How do users get updates for the desktop app? Agent 9.
- **Code signing** — Apple notarization + Windows signing. Agent 9.
- **Phase B subscription pricing** — Pending research on token costs, competitive pricing, addon model
- **Skills store architecture** — MCP-based vs. custom plugin API (Agent 3 to evaluate during Phase B)
- **Sandboxed module runtime** — How user-built modules run safely (iframe, Web Components, controlled runtime) (Agent 3)
- **Marketplace commission model** — Revenue split that attracts creators without undercutting platform revenue (Agent 8)
- **Legal review** — EULA needs attorney review before Phase A ships
- **Messaging channel for Orchestrator** — Telegram vs. custom vs. multi-platform (Agent 5 research)
- **Agent system productization** — How to ship executable agent templates without losing markdown simplicity (Agent 3)
- **Orchestrator pricing** — Subscription, usage-based, or hybrid (Agent 8)
- **Solo Builder market validation** — Is the market real and big enough? (Agent 8)
- **Remote execution security** — Auth and blast-radius controls for text-triggered git operations (Agent 4)

---

## Target Metrics

### Phase A (Technical Quality + Ship Readiness)

| Metric | Target |
|---|---|
| Lighthouse Score | > 95 (all categories) |
| First Contentful Paint | < 1.2s |
| Initial Bundle (gzipped) | < 200KB |
| API Response Time (p50) | < 100ms |
| Accessibility | WCAG AA compliance |
| Code Audit Score | 8.5+/10 |
| Phase A Sales | 2,000+ founding members ($100K) |
| Time to Value (setup → "aha moment") | < 5 minutes |

### Phase B (Business Metrics)

| Metric | Target |
|---|---|
| Monthly Recurring Revenue (MRR) | $83K ($1M ARR) |
| Customer Acquisition Cost (CAC) | < $50 |
| Monthly Churn Rate | < 5% |
| Lifetime Value (LTV) | > $400 |
| LTV:CAC Ratio | > 3:1 |
| Net Promoter Score (NPS) | > 50 |

---

## The $1M Target

The north star business goal is **$1M in annual revenue** — through one-time sales (Phase A) and subscriptions (Phase B). This target guides every product and prioritization decision:

- Phase A sales fund Phase B development — no speculative investment
- Phase A users validate Phase B assumptions — build on pull, not guesses
- Features that increase willingness-to-pay are prioritized over nice-to-haves
- Every phase must move us closer to a chargeable product
- Agent 8 (Product Manager) owns the strategy to get there
- The Director ensures sprints balance technical excellence with commercial readiness

---

## The Competitive Edge

Why One Workflow wins where others don't:

1. **Guided AI, not open-ended AI.** Claude and ChatGPT are power tools with no instruction manual. They hand you infinite capability and zero direction. One Workflow gives users specific tools with clear outcomes. No prompt engineering. No decision paralysis.

2. **Replace the stack, don't add to it.** Notion + Google Calendar + journal app + CRM spreadsheet + AI chat = 5 tabs, 5 logins, 5 subscriptions. One Workflow = one place.

3. **HubSpot for humans.** HubSpot is 47 tiers of confusion built for enterprises. One Workflow is clear, simple, and built for the solopreneur and small team that uses a tenth of HubSpot's features and pays too much for it.

4. **AI that teaches you what it can do.** The concierge doesn't wait for instructions — it suggests actions based on your data. Every suggestion is a discovery moment. Users don't need to know what's possible because the AI shows them.

5. **Grows with you.** Start personal, go professional. The same tool that manages your journal and habits also runs your team's projects and client work. No migration. No second tool. One workflow.

---

## How This Document Is Used

1. **The CEO** owns this document philosophically — is Kaivoo/One Workflow solving the right problem?
2. **The Director** reads this before every sprint planning session
3. **All agents** can reference this for product context
4. **Agent 8 (Product Manager)** uses this to align business strategy with engineering reality
5. **The user** updates this when priorities shift or new features are requested
6. **Sprint retrospectives** update the Status column as milestones complete

When a milestone moves from PLANNED to DONE, update the Status and Sprint columns. When new milestones are added, place them in the appropriate phase.

---

*Vision v4.6 — March 2, 2026*
*v4.6: Sprint 22 (Knowledge Vault) complete. Vault file browser with 5-folder structure (Topics/Projects/Journal/Library/Inbox), dual-adapter architecture, Obsidian-compatible markdown export, topic nesting, adapter stabilization (local.ts split, SearchIndexer, entity_type discriminator). 265 tests. 6 P0 security/correctness fixes. See `Sprints/Sprint-22-Knowledge-Vault.md`.*
*v4.5: CEO Strategic Brief — Phase A pricing revised ($99 standard / $49 founding member). Volume-over-margin strategy. AI features deferred to Phase B. Sprint 21 (Local-First Storage) started — SQLite persistence, adapter completion, FTS5 search, local auth. Sprint sequencing resolved through Sprint 24+. Revenue projections updated for new pricing. See `Research/Agent-5-Docs/CEO-Strategic-Brief-Phase-A-Pricing.md`.*
*v4.4: Sprint 20 completion — Tauri 2.0 selected, DataAdapter pattern implemented, SQLite schema designed, 18 E2E tests, lint cleanup. See `Sprints/Sprint-20-Local-First-Foundation.md`.*
*v4.3: CEO Session #4 — Local-First Knowledge OS. Topics elevated to single source of truth for all content and files (Topics > Projects > Tasks/Files hierarchy). Desktop packaging (Electron/Tauri) promoted to Phase A must-have. Data layer abstraction: LocalAdapter (SQLite + file system) for Phase A, CloudAdapter (Supabase) for Phase B, swappable backend, no codebase split. File attachments + image embedding promoted to must-have. Hashtags as virtual filters not folders. Convention-with-flexibility folder structure (opinionated default, permissive by nature). Obsidian import (file copy, not headline). Entry-to-file export. Setup wizard includes vault folder selection.*
*v4.2: CEO Session #3 — Two-product architecture (Kaivoo Productivity + Kaivoo Orchestrator). Concierge scope boundary (productivity helper vs. builder). Modular toggle architecture (settings-driven module activation). Productization requirement (clean templates, no Kaivoo-specific content in shipped specs). Orchestrator as addon/integration for SMBs. Solo Builder target customer added. Phase B split into Orchestrator + One Workflow Cloud sections. Seven new research parcels assigned (messaging channel, agent productization, Solo Builder market, remote execution security, Orchestrator pricing, template design, multi-model overhead).*
*v4.1: CEO Session #2 — Concierge Identity & Soul (naming, hatching, soul file). Concierge-as-Builder (personal customization Phase B, marketplace creation Phase C). 1st-party modules as marketplace templates (Page + Today Widget format). Phase B concierge-led onboarding wizard. New research parcels: marketplace model analysis (Agent 8), sandboxed module runtime (Agent 3).*
*v4.0: CEO Session strategic pivot — Two-phase revenue strategy (Phase A: $249 productivity app, Phase B: One Workflow cloud subscription). New core principles: "Guided, not open-ended" and "Progressive autonomy." Autonomy Ladder (manual → concierge → autonomous). SMB focus, enterprise language dropped. White-label architecture. Skills/integration architecture elevated. Research parcels assigned. Competitive edge articulated.*
*v3.7: Sprint 18 — Search + Calendar Week View + Keyboard Shortcuts. Phase 1 ~100%*
*v3.6: Sprint 17 — Routines & Habits shipped*
*v3.5: Sprint 16 — Calendar redesign*
*v3.4: Sprint 14 — Project Notes, UX polish*
*v3.3: Sprint 12 — Design Agent split, code quality verified*
*v3.2: Sprint 7 — Supabase cloud migration*
*v3.0: Platform pivot — modular architecture, Command Space as foundation*
