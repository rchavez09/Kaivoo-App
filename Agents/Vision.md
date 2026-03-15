# Kaivoo — Product Vision

**Version:** 7.12
**Last Updated:** March 14, 2026
**Status:** Living document — updated as phases complete and priorities shift

---

## What Is Kaivoo?

Kaivoo is **personal infrastructure for the AI era.** It starts as a plug-and-play AI productivity app — your journal, todos, calendar, captures, and second brain under one roof — and evolves into a cross-platform MCP foundation layer: the intelligent orchestration layer between you and everything on your machine, accessible from anywhere.

The application layer is dying. AI collapses the need for separate apps — you don't need a word processor if AI generates the document, a file manager if AI knows where everything is, or an email client if AI sends the email. What replaces apps is an **intelligent command layer** that understands intent and orchestrates execution. Kaivoo is building that layer.

### The Trajectory

```
TODAY         →  Plug & play AI productivity app (ship, sell, learn)
NEAR-TERM     →  MCP foundation layer (your machine, known to AI, accessible everywhere)
LONG-TERM     →  Personal OS (the intelligent layer between you and your digital life)
```

### The Products

**The Desktop App Is the Product.**

- **Flow Desktop** ($99 one-time / $49 founding member) — The flagship. Journal, tasks, projects, calendar, captures, vault, routines, widgets, theme customization, data export. AI concierge with BYO API keys. Soul file. Local-first — everything runs on your machine, your data never leaves, Kaivoo's ongoing cost per user is zero. That's why one-time pricing works. **Multiple apps in one + an AI that knows you, remembers you, and executes for you. You own everything. Forever.**

- **Kaivoo Web Access + Sync** ($8-12/mo subscription) — Access your desktop data from any browser, even when your machine sleeps. Supabase-hosted sync. Managed AI (we provide the keys). The subscription covers real infrastructure costs: storage, bandwidth, auth, database, file uploads — all cost money per user per month. One-time pricing here would be a liability, not a sale. **Cancel anytime and download everything. You're paying for infrastructure, not permission.**

- **Kaivoo Companion App** (requires Web Access subscription) — Mobile/tablet access. Concierge chat, today view, quick capture, notifications. The companion *needs* cloud sync to see your desktop data — this isn't an artificial gate, it's an architectural reality. **Your AI in your pocket.**

- **Kaivoo Orchestrator** (premium subscription, pricing TBD) — AI agent orchestration for builders. Flow orchestration, multi-model routing, autonomous Flows with per-Flow scheduling, sprint management, messaging-based control, autonomous build-review-test-push pipeline. For developers and solo builders who want an AI dev team they can text from their couch.

**Phase A** ships Flow Desktop (the flagship). **Phase B** adds Web Access, Companion, and Orchestrator. **Phase C** opens the marketplace. **Phase D** builds the MCP foundation layer and personal OS trajectory.

### The Funnel

```
FREE WEB TRIAL (14 days)
│  Sign up, full experience, BYO key, no payment
│  "Try the AI that remembers you"
│  Trial users are already on web infrastructure
│
├──→ BUY DESKTOP ($49/$99 one-time)
│    Everything local. BYO keys. Zero ongoing costs.
│    "You own everything. Forever."
│    Highest-value users — most likely to add sync later.
│
└──→ SUBSCRIBE WEB ($8-12/mo)
     Keep web access after trial ends.
     Full app, Supabase storage, managed AI option.
     "We handle the infrastructure."

DESKTOP OWNERS (warm leads for cloud)
│
└──→ ADD WEB ACCESS + SYNC ($8-12/mo)
     Mobile access via Companion App.
     Cloud sync when desktop sleeps.
     "Your data, available everywhere."
```

Both paths lead to revenue. Desktop buyers are the most engaged users and the strongest conversion candidates for cloud add-ons. The funnel isn't free → paid. It's paid → *more* paid.

### Cost-to-Serve Logic

The pricing model follows the economics, not the other way around:

- **Desktop (one-time):** User downloads the app, everything runs on their machine. Kaivoo's ongoing cost is zero. No servers, no storage, no bandwidth. One-time pricing works because there's nothing to pay for after the sale.
- **Web (subscription):** User's data lives on Supabase. Storage, bandwidth, auth, database rows, file uploads — all cost money per user per month. A one-time payment here is a liability, not a sale. Subscription is the only sustainable model.
- **Free trial (web):** Limited duration, no payment. Top of funnel. Try the concierge, see the soul file, create some tasks. Fall in love, then buy desktop or subscribe.

This is the Obsidian model — but stronger. Obsidian's core app is free; they depend entirely on Sync ($4/mo) and Publish ($8/mo) conversions. Kaivoo gets paid at the door ($49/$99) AND on cloud add-ons. Revenue from both sides.

The AI isn't a chat box. It's an engine underneath purpose-built tools. Users see specific actions and clear outcomes — not blank prompts. Every widget tells them exactly what it does and what's possible. One button to the moon.

**One sentence:** Your machine. Your data. Your AI. Accessible from everywhere. Owned by you.

**The product promise:** Start with the essentials — journal, tasks, calendar, captures, AI concierge — and scale into a personal OS that knows everything on your machine, acts on your behalf, and even builds new capabilities when you ask for them.

---

## Core Principles

These are non-negotiable. Every feature, sprint, and decision must align with them.

1. **You own your data.** Every file is a real file. No vendor lock-in. No cloud dependency for core functionality. Export everything, always.

2. **AI serves you, not the other way around.** You choose which AI to use. You provide your own keys. AI agents are transparent markdown files you can read and edit. No black boxes.

3. **Day execution.** The "today" view is the home screen — not just for planning, but for *doing*. Today is where notes become actions and actions become delegated AI work. Everything radiates from "what am I doing right now, what does my AI know about me, and what can it help me with?"

4. **Edit where you see it.** If you can see data, you can edit it in place. No hunting through menus. Progressive disclosure over hidden complexity.

5. **Quiet confidence.** The interface doesn't shout. Warm Sand, Deep Navy, Resonance Teal. Apple HIG-level craft. Clarity over cleverness. Warmth through restraint.

6. **Built to ship.** Every feature is built with productization in mind. If it can't be packaged, installed, and used by a paying customer, it's not done.

7. **Revenue is a feature.** The business model isn't an afterthought bolted on at Phase 5. Monetization architecture is baked into technical decisions from day one.

8. **Modular by design.** The Command Space is the foundation. Everything else plugs in as a module. New capabilities extend the platform without breaking existing functionality. Users build up like a lego castle — same foundation, unique structure.

9. **Guided, not open-ended.** AI powers everything but users see specific actions, not blank prompts. Every widget defines its capability. No decision paralysis. No prompt engineering. The AI is the engine — the app is the car. Think side-scroller, not open world.

10. **Progressive autonomy.** Start manual, graduate to assisted, evolve to autonomous. The AI earns trust by suggesting before it acts. Every suggestion teaches the user what's possible. The goal: your AI runs your business while you steer.

11. **MCP-native.** The Model Context Protocol is the backbone, not a bolt-on. Every data source, tool, and action in Kaivoo is exposed via MCP so any AI can access it with permission. This makes Kaivoo the foundation layer that AI agents talk to when they need to know about *you* — your files, your tasks, your calendar, your projects, your everything. Protocol-first architecture means the product improves as the MCP ecosystem grows.

12. **Self-building.** The ultimate expression of an MCP-native platform: users can ask Kaivoo to build new capabilities for itself. "I wish we had a page for tracking client invoices" → the AI researches, plans, and builds it. The product isn't just a tool — it's a platform that evolves through conversation. The Core Foundation is immutable. Everything on top of it is fair game.

---

## The Flow Orchestration Model

Flow is Kaivoo's orchestration platform — the system that lets you define autonomous processes that run automatically, powered by AI agents and reusable skills. This is the PRIMARY product direction, not a "Phase B maybe" — this is what we're building.

### The Four-Layer Hierarchy

```
Flow → Agents + Skills + Apps
```

**Flows** are scheduled processes that run automatically. Think "Morning Briefing Flow" or "Weekly Report Generator Flow." Each Flow has a schedule (daily at 8am, every Monday, etc.), a series of steps, and optional approval gates. Flows orchestrate everything below them.

**Agents** are specialized AI roles with specific capabilities. The PPT Generator agent knows how to create presentations. The Web Scraper agent knows how to extract data from websites. The Task Monitor agent watches your todos and surfaces insights. Each agent can be assigned a specific AI model (cheap model for simple tasks, Sonnet for complex work, Opus for creative writing) and has declared permissions (read calendar, write files, send emails). Agents execute the work within Flows.

**Skills** are reusable actions that agents can perform. "Generate PPT from notes," "Summarize email thread," "Create task from calendar event," "Export project as PDF." Skills are the atomic units of capability. Agents use skills to do their work. Users can create custom skills through conversation with the AI — no code required.

**Apps** are external platform connections via MCP (Model Context Protocol). PowerPoint, Google Calendar, Gmail, Slack, GitHub — all exposed as Apps that agents can interact with. Install an App, grant permissions, and your agents can read/write data across your entire digital workspace.

### User-Facing Example: Morning Briefing Flow

A user creates a "Morning Briefing Flow" that runs every weekday at 7:30am:

1. **Task Monitor agent** reads today's tasks and surfaces priorities
2. **Calendar agent** checks today's meetings and prep requirements
3. **Email agent** scans overnight emails for urgent items
4. **PPT Generator agent** creates a daily brief slide deck if presentation is due today
5. **Notification agent** sends a summary to the user's phone via the Companion App

All of this happens autonomously. The user wakes up to a prepared briefing. No prompts. No manual steps. Just outcomes.

The same agents and skills used to build this Flow can be recombined into a "Weekly Report Flow," a "Client Onboarding Flow," or a "Content Publishing Flow." Infinite combinations. Same building blocks.

### The Meta-Product Story

**Flow was built using Flows.** The Sprint orchestration system managing Kaivoo's development right now — the Director coordinating agents, the build-review-test-push pipeline, the autonomous sprint execution — is built on the Flow model. This isn't vaporware. We're eating our own dog food.

Now you can build your thing with Flows too. Your morning routine. Your client work. Your content factory. Your dev pipeline. The SAME SYSTEM that built Kaivoo is yours to configure for whatever you're building.

This is the orchestration platform vision — and it's the primary product direction from Phase A forward.

---

## The Autonomy Ladder

The product evolves through three levels of AI involvement. Each level builds on the last.

### Level 1: You Drive (Phase A)
You do everything. The app is your command center. AI is available when you ask — "draft this email," "summarize this note," "what's on my calendar." The concierge responds to requests. It doesn't initiate.

### Level 2: AI Suggests (Phase B — Concierge)
The AI starts watching and suggesting. "You have a PPT due at 3pm — want me to draft it?" "You got 4 emails from this client — want me to summarize and draft responses?" "You haven't checked Project X in 5 days — here's the status." It sees your data, understands your patterns, and offers to act. You approve. It executes.

This is the "I can do that for you" layer. Critically, it teaches the user what's possible. Every suggestion is a discovery moment: "Oh, it can do *that*?" This solves the blank-chat-box problem — users don't need to know what to ask because the AI tells them what it can do.

### Level 3: AI Operates (Phase C+)
The AI doesn't ask. It just does. Your todo list isn't yours — it's the AI's work queue. Emails get answered. Reports get generated. Follow-ups happen. You review and course-correct. You're the CEO of your own operation, and the AI is your staff.

### Level 4: AI Builds (Phase D)
The AI doesn't just operate within the app — it extends the app itself. "I wish we had a page for tracking client invoices." The concierge researches what's needed, plans the implementation, builds the page, and deploys it to your instance. You don't file a feature request. You don't wait for the next release. You describe what you want, and the platform evolves. The product becomes self-improving through conversation.

---

## The North Star: Personal OS

The long-term vision for Kaivoo is not a productivity app. It is a **personal operating system for the AI era** — the intelligent layer between you and your digital life.

### The Thesis

The way computer operating systems work is dying. Apps are going away now that AI is here. MCP (Model Context Protocol) is where the market is going. If Kaivoo builds the first cross-platform MCP foundation layer, it becomes a massive disruptor.

The old system: you open Word and start typing. The new system: you see a document brief on your todos, click execute, the AI has all your notes and context, produces a high-quality brief, exports it to the correct project, and maybe sends it to the right person. You can message the concierge from your phone to send that document to a client. The document is ready and available to you anywhere — desktop, mobile, shared link.

AI is radically changing not just how we work, but how we interact with computers. Kaivoo is at the forefront.

### The Architecture — Your Machine as a Server

Like Plex proved for media, your desktop can be your personal cloud:

**Mode A — Desktop is awake (Plex model):**
- Tauri app runs a lightweight local server
- Companion app connects over LAN or secure tunnel (Tailscale, Cloudflare Tunnel)
- Real-time access to all files — search, preview, open, interact
- Desktop must be on — fine for 80% of use cases

**Mode B — Desktop is asleep (Sync model):**
- Encrypted sync of metadata + recent files to cloud relay
- Companion app works offline with synced data
- Full files pulled on-demand when desktop wakes
- This is what the Cloud Companion subscription pays for

The killer product is **both** — Mode A when your machine is reachable, Mode B as fallback. Users don't think about modes. It just works.

### The Companion App — Your Concierge in Your Pocket

The companion app is a stripped-down mobile version of Kaivoo focused on two things: **accessing your data** and **messaging your concierge**. It is not a full-featured mobile port — it's a purpose-built companion that extends the desktop experience to your phone.

**Core surfaces:**
- **Concierge chat** — Message your AI from anywhere. Same soul, same memory, same tools. "Add a task for tomorrow: review the Q2 report." Done.
- **Today view** — Quick glance at your day: tasks, calendar, journal prompt
- **Quick capture** — Photos, voice notes, text captures that sync to your vault
- **Notifications** — Task reminders, calendar alerts, concierge suggestions (Level 2+)

**What it is NOT:**
- Not a full editor (vault browsing and editing happen on desktop)
- Not a standalone app (requires Cloud Companion subscription for sync)
- Not a third-party messaging wrapper (we own the entire stack)

**Architecture:** The companion app connects to Kaivoo's cloud relay (Supabase). Conversation threads are stored per-surface (companion vs. desktop) but share the same concierge brain, soul file, and memory. When the desktop is awake, the companion can reach it directly (Mode A). When the desktop sleeps, the companion works with synced data (Mode B).

**Revenue:** The companion app is a Tier 2 (Web Access + Sync) feature. It requires the sync infrastructure subscription — not as an artificial gate, but because the companion needs cloud sync to access desktop data. Desktop-only users who run everything locally use only the desktop app.

### What Makes This Different

| | Obsidian | Notion | Kaivoo |
|---|---|---|---|
| Scope | Markdown notes + images | Cloud workspace | All files — PPTs, videos, PDFs, notes, everything |
| Data ownership | Local vault | Cloud-only, vendor lock-in | Local-first, your machine, your data |
| Access | Sync copies across devices | Browser | Live access to your machine + selective cloud sync |
| Intelligence | Plugin-based, user-assembled | Built-in AI (cloud) | Built-in: search, concierge, MCP, self-building |
| MCP | None | None | Native — every data source exposed as MCP |
| Self-building | No | No | "I wish we had X" → AI builds it |
| Identity | Note-taking app | Team workspace | Personal infrastructure / productivity OS |

### The MCP Foundation Layer

Kaivoo's MCP layer is what makes the personal OS vision possible:

1. **Indexes and understands everything on your machine** — files, notes, projects, calendar, media
2. **Exposes it all via MCP** so any AI can access it with user permission
3. **Orchestrates actions** — create docs, send emails, move files, notify people
4. **Syncs selectively to cloud** for mobile/always-on access
5. **Self-builds** — new pages, widgets, and capabilities through conversation

Nobody is building cross-platform, local-first, MCP-native, user-owned personal infrastructure with optional cloud. That's white space.

### Why Now

- Post-AI, people generate more local files than ever — exports, PDFs, decks, recordings, datasets
- Cloud storage is expensive and fragmented (Google Drive, Dropbox, iCloud, OneDrive)
- Privacy is a buying trigger, not a niche — "your data never leaves your machine" is a headline feature
- MCP is early but growing fast — building the foundation layer now means being ready when the wave hits
- The Plex model is proven. Obsidian proved the appetite for local-first. Nobody's combined them for general productivity.

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

### Concierge Memory Architecture

The concierge's memory is Kaivoo's competitive moat. Every productivity app will bolt on AI chat. Very few will build memory that makes the AI genuinely know you. The architecture follows a **cortex/hippocampus split** — unbounded long-term storage, with a lean compiled snapshot for each session.

**The principle:** "The memory is in the data. The model is just the reader." The LLM is stateless compute. All persistence, identity, and continuity live in structured data the user owns. Swap the AI provider, keep the memory, and continuity persists.

#### Layer 1: Soul File (Identity — always loaded)
The core personality and preferences. A few KB. Loaded on every interaction. This is the "who I am" layer — name, tone, relationship with the user. **Deterministic injection** — compiled from stored data, never AI-generated. The concierge's sense of self is a read, not an inference. This prevents personality drift across sessions.

#### Layer 2: Working Memory (Session context — compiled per session)
A lean, targeted snapshot assembled at session start from long-term storage. Contains: user's name, active tasks/projects, recent conversation summary, top relevant memories for the current context. Discarded and rebuilt each session. Stays lean to preserve context window for actual work.

#### Layer 3: Long-Term Memory (Fact store — grows forever)
The full `ai_memories` table — every fact, preference, decision, and conversation summary. The cortex. Can grow to thousands of entries without impacting session performance because only relevant memories are surfaced via search.

#### Layer 4: Pre-Compaction Memory Flush
Before context truncation in long conversations, the concierge automatically writes lasting notes to memory. A silent system message says "save any important facts or decisions before we continue." The AI writes to `ai_memories`, *then* compaction happens. Session boundaries become non-events — nothing important is lost.

#### Layer 5: Hybrid Memory Search (Phase B — Cloud Companion)
When the memory store grows beyond simple keyword matching, hybrid search surfaces the right memories at the right time:
- **Semantic search** (vector similarity) — finds conceptually related memories
- **Keyword search** (BM25/FTS) — finds exact term matches
- **Weighted hybrid merge** — configurable ratio (default 70/30 semantic/keyword)
- **Temporal decay** — newer memories score higher (configurable half-life)
- **Diversity re-ranking** — prevents redundant results

This enables the concierge to recall patterns, preferences, and context that simple substring matching misses. "What does this user prefer for morning planning?" requires semantic recall, not keyword search.

#### Layer 6: Memory Consolidation (Phase B — "Sleep Cycle")
Between sessions, an offline process consolidates short-term conversation logs into long-term memory:
- Summarize recent conversations
- Extract new facts and preferences
- Merge into long-term memory with deduplication
- Update relevance scores on existing memories
- Prune stale or superseded facts

The concierge gets smarter between sessions, not just during them. This is a managed Cloud Companion feature — the consolidation runs on Kaivoo's infrastructure.

#### Layer 7: Coherence Monitoring (Phase B — Concierge Level 2+)
Long conversations degrade AI coherence before context limits hit. The model doesn't announce it — it quietly drifts. Coherence monitoring detects this via behavioral signals:
- Is the concierge still referencing the soul file personality?
- Is it still citing user data accurately?
- Has it started giving generic responses instead of personalized ones?

When drift is detected, a silent re-anchor injection restores coherence. The user never sees the mechanic — they just experience an AI that **stays sharp** across long sessions.

#### Revenue Alignment

| Memory Layer | Tier 1 (Desktop $49/$99) | Tier 2 (Web Access + Sync) |
|---|---|---|
| Soul file (identity) | Included | Included |
| Working memory (compiled context) | Included | Included |
| Long-term memory (fact store) | Included (keyword search) | Included (hybrid search) |
| Pre-compaction flush | Included | Included |
| Hybrid memory search | — | Included |
| Memory consolidation (sleep cycle) | — | Included |
| Coherence monitoring | Basic | Advanced |

Desktop users get a concierge that remembers. Subscribers get a concierge that **learns, consolidates, and stays sharp**. The memory architecture is the subscription differentiator.

### Concierge Scope Boundary

The concierge has two capability tiers, cleanly separated by product:

**Productivity Concierge (Product 1 — Phase A):**
- **Full tool-use agent** — anything the user can do in the UI, the concierge can do via conversation
- Create tasks, journal entries, calendar events, captures, notes
- Complete tasks, log routines and habits, update settings
- Search across all data — notes, journal, tasks, captures, vault files
- Read specific files, entries, and documents on demand
- Trainable personality (hatching, soul file, tone preferences)
- Persistent memory via soul file — learns and remembers across conversations
- BYO API keys — Claude, ChatGPT, Gemini, Mistral, Groq, Ollama, any provider
- Security guardrails: confirmation for destructive actions, audit trail, undo, no autonomous bulk operations
- **It helps you execute your day. It does not build software.**

**Orchestrator Concierge (Product 2 — Phase B):**
- Everything above, plus...
- Sprint orchestration, agent coordination, build-review-test-push pipeline
- Companion app messaging — message your concierge from anywhere, same brain, same memory
- Multi-model routing across roles (e.g., cheap model for chat, Sonnet for search, Opus for building, Gemini for testing)
- Remote-triggered code execution with security gates and exec approval flows
- **It builds things for you.**

Same concierge architecture. Same soul file. Same hatching. Different capability ceiling. The Orchestrator unlocks the builder layer — it doesn't replace the productivity layer.

### One Brain, Many Surfaces

The concierge is accessible from multiple surfaces but operates as a single intelligence:

- **Desktop app** — Full concierge chat with tool use, context panel, conversation history
- **Companion app** — Stripped-down mobile interface for messaging the concierge on the go
- **Future surfaces** — Notifications, widgets, voice (Phase D)

**Architecture principle:** Same concierge, same soul, same memory — but **separate conversation threads** with **shared context**. When you message your concierge from the companion app "remind me to finish the proposal," it shows up in your Tasks on desktop. But the companion conversation history and the desktop chat history are separate threads. One brain, many mouths.

**Why we own the channel:** Building our own communication layer through the companion app gives us end-to-end control over the experience. The concierge lives in *your* app — not Telegram, not WhatsApp, not someone else's platform. This means:
- No third-party API dependencies or rate limits
- Full control over UX, notifications, and interaction patterns
- Concierge context (your tasks, calendar, data) is natively available — no bridging
- Push notifications, typing indicators, and rich responses designed for our use case
- Privacy: your AI conversations never touch a third-party messaging platform

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

**The story:** "Flow was built using Flows. Now you can build your thing with Flows too."

A productization sprint is required before the Orchestrator ships — clean templates, blank-slate onboarding, no user will accidentally clone Kaivoo's internal roadmap.

---

## Platform Vision — The Central Hub

### The Foundation

The Journal, Daily View, Todo system, Calendar, Email, and Captures aren't features — they're the **foundation layer** that everything else builds on. The Command Space is the central nervous system: the place where a user lives, thinks, plans, and operates. Every module and integration extends this foundation rather than replacing it.

Think of it as a lego castle. The Command Space is the baseplate and first few layers. Modules are the towers, walls, and turrets you build on top. The foundation ships with every instance. What you build on it is up to you.

### Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                     KAIVOO PERSONAL OS                         │
│                                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐     │
│  │Marketing │  │  Sales   │  │  Doc     │  │  User-   │     │
│  │  Tools   │  │Dashboard │  │  Mgmt    │  │  Built   │     │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘     │
│       └──────────────┴──────────────┴──────────────┘         │
│                          │                                   │
│  ┌─────────────────────────────────────────────────────┐     │
│  │       AI CONCIERGE + SELF-BUILDER                    │     │
│  │  Routes tasks · Suggests · Executes · Builds new     │     │
│  │  "I wish we had X" → researches, plans, builds it    │     │
│  └─────────────────────────────────────────────────────┘     │
│                          │                                   │
│  ┌─────────────────────────────────────────────────────┐     │
│  │       MCP FOUNDATION LAYER                           │     │
│  │  Local file index · Cross-device access · Protocol   │     │
│  │  Every data source exposed as MCP · AI-accessible    │     │
│  └─────────────────────────────────────────────────────┘     │
│                          │                                   │
│  ┌─────────────────────────────────────────────────────┐     │
│  │       INTEGRATIONS & SKILLS LAYER                    │     │
│  │  Gmail · Calendar · Slack/Teams · Skills Store       │     │
│  └─────────────────────────────────────────────────────┘     │
│                          │                                   │
│  ┌─────────────────────────────────────────────────────┐     │
│  │       SYNC & ACCESS LAYER                            │     │
│  │  Local server (Mode A) · Cloud sync (Mode B)         │     │
│  │  Desktop ↔ Mobile companion · Encrypted relay        │     │
│  └─────────────────────────────────────────────────────┘     │
│                          │                                   │
│  ┌─────────────────────────────────────────────────────┐     │
│  │       CORE FOUNDATION (Command Space)                │     │
│  │  Journal · Todos · Calendar · Captures · Vault       │     │
│  │  Theming · White-Label Config · Auth · Data Layer    │     │
│  │  SQLite (local) · Supabase (cloud companion)         │     │
│  └─────────────────────────────────────────────────────┘     │
└──────────────────────────────────────────────────────────────┘
```

**Core Foundation (always present):** Journal, Daily View, Projects & Tasks, Calendar, Captures, Second Brain, AI Concierge, Theming, White-Label Config, Auth, Data Layer.

**Integrations Layer:** Email (Gmail/Outlook), Calendar sync, messaging (Slack/Teams integration), and the skills store. Users connect their existing tools — they don't replace them. Everything flows through one place.

**Business Widgets (Phase B):** Marketing tools, sales dashboards, document management, CRM — purpose-built interfaces with AI underneath. Not chat prompts. Specific tools. Clear outcomes.

### How It Works — The Solopreneur Example

A freelance marketing consultant opens Flow. Their Day View shows todos, calendar, journal, captures, and email — all in one place. The AI concierge notices a todo: "Create social media content for Client X's spring campaign."

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

**Self-building (Phase D):** "I wish we had an app for tracking invoices." The concierge doesn't just modify existing surfaces — it researches what's needed, plans the implementation, and builds entirely new pages, widgets, and integrations. The user describes intent. The AI ships the feature. The platform evolves through conversation. This is the ultimate expression of MCP-native architecture: the product *is* the platform *is* the builder.

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

**The Agency Owner** — Runs a marketing agency, consulting firm, or creative studio. Uses Flow as their operational hub — client meetings, deliverables, project tracking — with business widgets to execute work directly from their dashboard. High willingness-to-pay.

**The Small Team** — 2-25 people who want shared AI-powered productivity without HubSpot/Salesforce complexity or pricing. Shared tasks, shared calendars, role-based access. One tool for the whole team.

**The Builder** — Wants to create their own integrations and skills on top of the platform. Skills store / marketplace customer.

**The Solo Builder (Orchestrator)** — A developer or technical founder building a product alone or with a tiny team. Currently babysitting AI code assistants, manually managing context, doing the review-test-push loop dozens of times a day. Wants an autonomous AI dev team they can text from their couch. High willingness-to-pay ($99-199/mo) for a system that turns "boot up sprint 5" into tested, reviewed code.

---

## Business Model

### Revenue Strategy

The desktop app is local-first and yours forever. Cloud services are subscriptions that cover real infrastructure costs — not feature gates. **"You own your data"** is non-negotiable: at any time, users can download their data and run everything locally.

#### Free Tier: Web Trial (Top of Funnel)

| | |
|---|---|
| **Price** | Free — 14-day full-experience trial |
| **What you get** | Full web app experience. BYO API key. Concierge chat. Soul file. Journal, tasks, calendar, captures. No feature gating — everything works during trial. |
| **Target** | Anyone curious. Zero commitment, zero friction. |

**Strategy:** Time-limited, not feature-limited. Full experience creates the "aha moment" (target: < 5 minutes to value). No payment required. Trial users are already on web infrastructure, so converting to web subscription is seamless. Natural urgency — the clock is ticking, then either buy desktop or subscribe.

**Cost exposure:** Each free trial user costs Supabase rows, auth, and bandwidth with zero revenue. 14-day limit controls burn. Agent 5 to model per-user trial cost.

#### Tier 1: Kaivoo Desktop (One-Time Purchase — The Flagship)

| | |
|---|---|
| **Price** | $49 one-time (Founding Member) / $99 one-time (Standard) |
| **What you get** | The full app. Local-first. Journal, tasks, calendar, captures, vault, routines, today view, concierge chat. BYO API keys. Soul file. Data export. Desktop app. **You own everything. Forever.** |
| **Target** | AI power users, self-hosters, privacy-conscious users, Obsidian/Notion migrants |

**Founding Member pricing ($49)** closes when Tier 2 launches. No cap. Every founding member gets permanent discount on future subscription tiers.

**What's included:** Journal, tasks, projects, calendar, captures, vault/knowledge OS, routines & habits, today view, widget system, theme customization, data export (markdown/JSON), AI concierge with BYO keys, soul file (persistent AI memory you own and edit), desktop app (macOS/Windows/Linux).

**License:** Proprietary EULA. Personal or internal business use only. No redistribution, resale, sublicensing, or derivative products for sale. License key required for activation.

**Why one-time works:** User downloads the app, everything runs on their machine. Kaivoo's ongoing cost per user is zero — no servers, no storage, no bandwidth. BYO-key means zero AI API costs. 70-80% gross margins. "Pay once, own forever" resonates with a subscription-fatigued market.

**Revenue milestone:** 2,000+ founding member sales = ~$100K. This funds Tier 2 development and validates demand.

**Desktop buyers are the highest-value users.** They paid $49-99 upfront, they're invested, and they're the most likely to convert to web sync when they want mobile access. The funnel isn't free → paid. It's paid → *more* paid.

#### Tier 2: Web Access + Sync + Companion (Subscription — ARR)

| | |
|---|---|
| **Price** | $8-12/mo base (or ~$99/yr) — final pricing pending research. May be tiered by storage (e.g., 5GB / 25GB / 100GB like Google Drive). Managed AI may be bundled or addon depending on cost modeling. |
| **What you get** | **Web access** (browser-based app, always available), **cloud sync** (your data available even when your desktop sleeps), **Companion App** (mobile/tablet — concierge chat, today view, quick capture), managed AI (we provide the keys — or BYO), cloud backup, file storage, Google Calendar integration, Gmail integration, priority updates, future integrations. **We handle the infrastructure.** |
| **Target** | Desktop owners who want mobile access. Users who want convenience over DIY. Solopreneurs. |

**Why subscription is the only option here:** User data lives on Supabase. Storage, bandwidth, auth, database rows, file uploads — all cost money per user per month. A one-time payment for cloud infrastructure is a liability, not a sale. Subscription is the only sustainable model.

**The value prop:** Your desktop won't always be on. Web Access syncs your data to Supabase so you can access notes, files, and projects from your phone, tablet, or any browser — even when your machine sleeps. The Companion App puts your concierge in your pocket. Cancel anytime and download everything. You're paying for infrastructure, not permission.

**Companion App requires this tier** — not as an artificial gate, but because the companion *needs* cloud sync infrastructure to access your desktop data. Users understand "your phone needs cloud sync to see your desktop data." That's honest, not extractive.

**Why this works:** You're not charging for features. You're charging for "we handle it." That's the JetBrains model. That's the Obsidian Sync model. The app is yours. The service is a subscription. Forced SaaS is dead — elective SaaS (sync, managed AI, integrations that require server-side infrastructure) is the future.

#### Tier 3: Kaivoo for Builders (Premium Subscription — Future)

| | |
|---|---|
| **Price** | $29-49/mo — pricing pending market validation |
| **What you get** | Everything in Cloud Companion + Orchestrator modules, MCP connectors, agent system, sprint management, build-review-test pipeline, multi-model routing. **Your AI team.** |
| **Target** | Solo developers, technical founders, agencies building with AI |

**When:** Not at launch. Tier 3 ships when Tier 2 has enough users to validate demand for more autonomy. Research runs in parallel.

#### Tier 4: Kaivoo Personal OS (Premium — Long-term)

| | |
|---|---|
| **Price** | TBD — premium subscription or one-time + subscription hybrid |
| **What you get** | Everything below + **full MCP foundation layer** — local file indexing engine, cross-device orchestration, self-building capabilities ("I wish we had X" → AI builds it), flow automation (triggers, actions, multi-service orchestration), advanced file intelligence (search across all files on your machine, not just the vault). **Your machine becomes intelligent infrastructure.** |
| **Target** | Power users, technical professionals, anyone who wants their computer to work *for* them |

**When:** Phase D. The MCP ecosystem needs to mature, and Tiers 1-3 need to validate the market. Research starts now. Architecture decisions are made MCP-first from today.

**Pricing note:** Tier 2-4 subscription pricing requires research on AI token costs per user, competitive pricing teardowns, sync infrastructure costs, and addon model analysis. Agent 5 + Agent 8 to deliver before subscription tiers launch.

### Revenue Target: $1M ARR

| Scenario | Tier 1 One-Time | Tier 2+3 Subscriptions | Timeline |
|---|---|---|---|
| Conservative | 2,000 founding members ($98K) | + subscription ARR (pricing TBD) | 24-30 months |
| Moderate | 3,500 founding members ($172K) | + subscription ARR (pricing TBD) | 18-24 months |
| Aggressive | 5,000+ founding members ($245K+) | + subscription ARR (pricing TBD) | 12-18 months |

*Tier 1 projections based on $49 founding member pricing. Subscription pricing requires research on AI token costs, competitive pricing, and addon model. Agent 5 + Agent 8 to deliver when Tier 2 feature scope is finalized.*

**Unit economics advantage:** BYO-key model means Kaivoo carries zero AI inference costs. Tier 1 buyers cost almost nothing to support (no cloud, no API costs). Tier 2 subscribers generate ARR with structurally high margins (70-80%) compared to AI-heavy SaaS products.

### Widget & Module Add-Ons (Future)

| Widget/Module | Price Model | What They Get |
|---|---|---|
| **Command Space** | Included (Desktop / Tier 1) | Core foundation — journal, todos, calendar, captures, daily view, AI concierge |
| **Web Access + Sync + Companion** | Tier 2 subscription | Browser access, cloud sync, mobile companion, managed API keys |
| **Marketing Tools** | Addon (TBD) | Content creation, social media, campaign planning, brand guidelines |
| **Sales Dashboard** | Addon (TBD) | Pipeline tracking, contact management, lightweight CRM |
| **Document Management** | Addon (TBD) | Upload, organize, share, version business documents |
| **Orchestrator** | Tier 3 subscription | Sprint management, agent system, MCP connectors, build pipeline |
| **Skills Store** | Marketplace pricing | Community-built integrations and skills |

*Widget/addon pricing TBD — per-seat, per-widget, or bundled tiers. Research required on token costs and competitive positioning.*

---

## Phased Roadmap

### Launch Sequence

Desktop and web launch on parallel tracks:

1. **Web free trial launches first** — no Apple cert dependency. Sign-up flow, 14-day full experience, "subscribe" or "buy desktop" CTAs. Doesn't need Stripe checkout or license key validation — just a sign-up flow, usage limits, and conversion prompts.
2. **Desktop ships when certs clear** — Apple notarization + code signing happen in parallel with feature work. Desktop is the flagship product; it launches when it's ready, not gated by web.
3. **Companion app follows Tier 2** — ships when Web Access subscription infrastructure is live.

Both tracks can run in parallel. Web trial infrastructure is already partially built (Supabase auth, the full React app). Desktop needs signing certs.

### Phase A: Ship & Sell the Desktop App
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
| File attachments + image embedding — files in project/topic/journal folders, images uploaded to storage and embedded inline in rich text editor, `.attachments/` storage (desktop), Supabase Storage bucket (web) | **DONE** (Sprint 25 projects, Sprint 26 topics + journal + inline images) | Must-have |
| Topic content editing — rich text body on topics and topic pages, Tiptap editor, auto-save, content column in DB | **DONE** (Sprint 26) | Must-have |
| AI settings page + BYO API key wizard — choose provider, enter keys, test connection | **DONE** (Sprint 23) | Must-have |
| AI chat concierge — in-app conversational AI | **DONE** (Sprint 23 — in-app chat) | Must-have |
| Soul file — persistent AI memory (SQLite `ai_memories` table, fact extraction pipeline, user-editable memory UI, app context injection, conversation summaries). The concierge learns, remembers, and sees your data. | **DONE** (Sprint 24) | Must-have |
| Pre-compaction memory flush — before context truncation in long conversations, concierge writes lasting notes to memory. Prevents context loss. | **DONE** (Sprint 30) | Must-have |
| Deterministic context assembly — ensure soul/memory injection is compiled from structured data, not AI-generated. Prevents personality drift. | **DONE** (Sprint 30) | Must-have |
| Setup wizard + Concierge Hatching — vault folder selection, AI config, Obsidian import (file copy), concierge hatching, guided tour | **DONE** (Sprint 23) | Must-have |
| License key system — activation, tier validation, commercial distribution | **DONE** (Sprint 25 — Ed25519 offline verification, Stripe checkout, activation UX) | Must-have |
| Landing page & marketing site | PLANNED (Week 1) | Must-have |
| Stripe integration — one-time payment flow | **DONE** (Sprint 25 — $49/$99 Checkout, Edge Functions) | Must-have |
| EULA / legal documentation — proprietary license, redistribution terms, privacy policy | PLANNED (Sprint 57) | Must-have |
| Product Hunt launch | PLANNED (April 16, 2026) | Must-have |
| **Full-page AI Chat** — `/chat` route, conversation list, persistent history, model selector | **DONE** (Sprint 34) | **Must-have** |
| **AI Execution Tools + Data Awareness** — 19 tools working end-to-end, cross-provider tool schemas (8 providers), argument validation with self-correcting errors, Ollama OpenAI-compat mode, Gemini tool-use round-trips, text fallback extraction | **DONE** (Sprint 35-36) | **Must-have** |
| **Configurable Heartbeat** — proactive AI that acts without being asked. Background timer (Rust + TypeScript), configurable scheduling (Off, Hourly, Custom days/times), AI inference integration, desktop + web notifications. Reads tasks, calendar, journal, soul file. | **DONE** (Sprint 37) | **Must-have** |
| **Neuron Memory V1** — 3-tier memory architecture (Core Identity / Active Context / Episodic), memory consolidation during heartbeat (Jaccard dedup, stale pruning, promotion/demotion), context-aware loading with relevance scoring (~3500 token budget), quiet hours, insights history UI, tier-aware memory management settings. | **DONE** (Sprint 38) | **Must-have** |
| **Orchestrator Page** — 4-tab page: **Flows** (CRUD, scheduling, triggers, step builder), **Agents** (CRUD, model assignment, permissions, assign skills), **Skills** (CRUD, AI skill creation, reusable actions), **Apps** (discover MCPs, connect external platforms, manage credentials). Users define their own AI agent teams and Flows. | **IN PROGRESS** — Agents + Skills tabs DONE (Sprint 39), Flows tab next (Sprint 40), Apps tab (Sprint 41+) | **Must-have** |
| **Flow Execution Engine** — multi-model routing, context passing between steps, approval gates, action logging, rate limiting. The orchestrator actually runs Flows autonomously. | PLANNED (Sprints 46-47) | **Must-have** |
| **Artifact System** — sandboxed iframe widgets. AI generates HTML/CSS/JS, renders in split-pane preview. Persistent custom widgets saveable to library. Addable to Today page and project pages. Export to vault. Editable via conversation. | PLANNED (Sprints 48-49) | **Must-have** |
| **Safety Layer** — confirmation gates, skill permissions, Flow approval gates, rollback, rate limiting. Safe autonomy as a product principle. | PLANNED (Sprint 50) | **Must-have** |
| **Thinking Transparency** — visible AI reasoning during Flows and heartbeat. Action log accessible in-app. | PLANNED (Sprint 51) | **Must-have** |
| Google Calendar integration — OAuth, two-way sync (investigate MCP for faster delivery) | PLANNED | Post-launch fast-follow |
| Gmail integration — read, send, organize email within the app (investigate MCP for faster delivery) | PLANNED | Post-launch fast-follow |
| White-label config layer — logo, colors, app name as settings (not hardcoded) | PLANNED | Should-have |
| Outlook integration — email + calendar (fast-follow after Google) | PLANNED | Should-have |
| PWA (installable, offline read) | PLANNED | Should-have |
| Notifications & reminders | PLANNED | Should-have |

### Phase B: Flow Cloud Platform + Orchestrator V2
*Two revenue streams: Flow subscriptions for solopreneurs/teams + Orchestrator V2 for builders. ARR engine. Target $1M.*

**Note:** Orchestrator V1 moved to Phase A per CEO Session #13. Phase B expands the orchestrator with advanced features.

#### Orchestrator V2 (Expansion)

| Milestone | Status |
|---|---|
| Orchestrator dashboard — sprint completions, production connections, sandbox, deployment status | PLANNED |
| Advanced multi-model routing — cost tracking, per-agent budgets, model performance comparison | PLANNED |
| Companion app concierge — message your AI from the companion app, same brain/memory, remote task execution | PLANNED |
| Exec approval system — confirmation flows for remote-triggered actions, unique approval IDs, timeouts, audit trail | PLANNED |
| "New Project" wizard — concierge generates Vision, agent roster, first sprint from conversation | PLANNED |
| MCP marketplace — browse, rate, review community MCPs | PLANNED |
| Productization sprint — clean templates, strip Kaivoo-specific content, blank-slate onboarding | PLANNED |
| Advanced security model — auth for remote-triggered execution, blast-radius controls, sandboxed agent execution | PLANNED |
| Orchestrator subscription billing — premium pricing, Stripe recurring | PLANNED |

#### Flow Cloud

| Milestone | Status |
|---|---|
| **Companion App** — stripped-down mobile app: concierge chat, today view, quick capture, notifications. Connects via cloud relay. | PLANNED |
| **Hybrid memory search** — vector + BM25 + temporal decay + diversity re-ranking for concierge memory recall | PLANNED |
| **Memory consolidation (sleep cycle)** — offline process consolidates conversation logs into long-term memory between sessions | PLANNED |
| **Coherence monitoring** — detect within-session concierge drift via behavioral signals, silent re-anchoring | PLANNED |
| **Context assembly interface** — pluggable `assembleConciergeContext()` abstraction for deterministic system prompt compilation | PLANNED |
| Shared notes, tasks, calendars — collaboration foundation | PLANNED |
| Task assignment & delegation — assign, track, complete | PLANNED |
| Role-based access — admin / manager / member tiers | PLANNED |
| Team onboarding — invite, set roles, configure shared workspaces | PLANNED |
| AI Concierge Level 2 — proactive suggestions, "I can do that for you" prompts | PLANNED |
| Skills & integration architecture — plugin API, module SDK, documentation-first skill manifests | PLANNED |
| Integration: Slack/Teams — connect (not rebuild), messages flow through Flow | PLANNED |
| Marketing widget — content creation, social media, campaign planning | PLANNED |
| Sales dashboard widget — pipeline tracking, contact management, lightweight CRM | PLANNED |
| Document management widget — upload, organize, share, version | PLANNED |
| The Concierge — AI routing engine (Claude/OpenAI/Gemini, Ollama for self-hosted) | PLANNED |
| Concierge-as-Builder — personal customization through conversation (pages, widgets, field changes) | PLANNED |
| Concierge Hatching (Phase B) — extended onboarding wizard, guided platform tour led by the concierge | PLANNED |
| 1st-party modules — Marketing, Sales, Docs built in Page + Today Widget format (marketplace template) | PLANNED |
| RAG + semantic search (embeddings, vector store) | PLANNED |
| Journal AI analysis (patterns, themes, mood over time) | PLANNED |
| Subscription billing — Stripe recurring payments, tier management | PLANNED |
| Monitoring & observability for production users | PLANNED |
| Analytics & insights dashboard rebuild | PLANNED |
| ~~"One Workflow" branding & marketing site~~ — **Superseded by CEO Session #9: Flow by Kaivoo (kaivoo.com)** | **SUPERSEDED** |

### Phase C: Platform & Marketplace
*Open the ecosystem. Let users and developers build on top of Flow.*

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

### Phase D: MCP Foundation & Personal OS
*Build the intelligent layer between users and their digital life. Kaivoo becomes personal infrastructure.*

| Milestone | Status |
|---|---|
| **MCP Foundation Layer** | |
| Local file indexing engine — index and understand all files on the user's machine, not just the vault. Personal search engine. | PLANNED |
| MCP server layer — expose all Kaivoo data sources (tasks, notes, calendar, files, projects) as MCP resources and tools | PLANNED |
| MCP-native architecture — every new feature built as MCP tool first, UI second | PLANNED |
| Cross-device MCP — expose MCP endpoints over secure tunnel for remote AI access | PLANNED |
| **Sync & Access** | |
| Local server mode (Mode A) — Tauri app runs lightweight HTTP/WebSocket server, companion connects over LAN or tunnel | PLANNED |
| Secure tunnel integration — Tailscale, Cloudflare Tunnel, or libp2p for remote desktop access | PLANNED |
| Cloud relay mode (Mode B) — encrypted metadata + file sync to Supabase for always-on access when desktop sleeps | PLANNED |
| Companion app — mobile/tablet web app for accessing desktop data remotely | PLANNED |
| Selective sync protocol — smart sync of recent/priority files, on-demand pull for everything else | PLANNED |
| **Self-Building** | |
| AI Concierge Level 4 — self-building capabilities, "I wish we had X" → AI researches, plans, builds | PLANNED |
| Sandboxed page builder — AI generates new pages/widgets within security sandbox | PLANNED |
| Documentation-first module manifests — modules ship as readable manifests the concierge reads and writes. The AI is the plugin loader. | PLANNED |
| Flow automation engine — triggers, conditions, actions across services (send email when X, notify when Y) | PLANNED |
| Cross-service orchestration — AI coordinates actions across email, calendar, files, external APIs | PLANNED |
| **File Intelligence** | |
| Universal file search — search across all files on machine (not just vault), smarter than Spotlight/Windows Search | PLANNED |
| File type handlers — preview and interact with PPTs, videos, PDFs, spreadsheets, images from within Kaivoo | PLANNED |
| Context-aware file intelligence — AI understands file contents, relationships, and relevance to current work | PLANNED |
| **Personal OS** | |
| Desktop widget system — system tray, desktop widgets, always-on presence | PLANNED |
| Notification orchestration — unified notifications across all connected services | PLANNED |
| Voice interface — talk to your concierge, hands-free operation | PLANNED |
| Activity awareness — understand what the user is working on (with permission) to offer contextual help | PLANNED |

---

## Research Parcels (Active)

These run in parallel with sprint work, not blocking it.

| Parcel | Owner | Deliverable | Status |
|---|---|---|---|
| **Tier 2 Pricing & Cost Research** | | | |
| Supabase cost-per-user modeling | Agent 5 | Actual Supabase costs per web user at light/medium/heavy usage: database rows, auth sessions, storage (MB/GB), bandwidth, edge function invocations, realtime connections. Model at 100/1K/10K users. What does each tier of user cost us per month? | PLANNED |
| Managed AI cost-per-user modeling | Agent 5 | Cost of providing managed AI keys (we pay, user doesn't BYO). Token costs per conversation at light (5 msgs/day) / medium (20 msgs/day) / heavy (50+ msgs/day) usage across providers (OpenAI, Anthropic, Google). What's the margin at $8/mo vs. $12/mo? Is managed AI sustainable at Tier 2 pricing or does it need its own addon? | PLANNED |
| Storage tier modeling | Agent 5 | Google Drive-style tiered storage analysis. What does Supabase charge per GB for file storage + bandwidth? Model tiers: 1GB free trial / 5GB base subscriber / 25GB mid / 100GB+ power user. At what storage level does a $8-12/mo subscription become unprofitable? What are the breakpoints? | PLANNED |
| Free trial cost modeling | Agent 5 | Per-user cost of 14-day web trial on Supabase (rows, auth, bandwidth, storage). What's the burn rate per free user? At what trial volume does this become a problem? What usage limits (if any) keep trial costs under $0.50/user? | PLANNED |
| Cloud storage competitive teardown | Agent 8 | Google Drive ($1.99/100GB), iCloud ($0.99/50GB), OneDrive ($1.99/100GB), Dropbox ($11.99/2TB), Obsidian Sync ($4/mo/1GB), Notion ($8-10/mo/unlimited). What's the market expectation for storage at each price point? Where does Kaivoo fit? | PLANNED |
| Tier 2 subscription pricing recommendation | Agent 8 | Synthesize Agent 5's cost models + competitive teardown into a pricing recommendation. Flat rate vs. tiered (e.g., $8/mo for 5GB, $12/mo for 25GB, $20/mo for 100GB)? Should managed AI be bundled or addon? What margin target is sustainable? What price maximizes desktop→subscriber conversion? | PLANNED |
| Competitive pricing teardown (productivity) | Agent 8 | HubSpot, Monday, Notion, Asana, Sunsama pricing analysis — where the floor is for SMBs. Focus on what users get at the $8-12/mo tier across competitors | PLANNED |
| Addon pricing model | Agent 8 | Per-seat vs. per-workspace vs. usage-based analysis with widget addon tiers | PLANNED |
| Legal / EULA research | Agent 5 | EULA template, redistribution terms, privacy policy framework — to be reviewed by attorney | PLANNED |
| ~~"One Workflow" positioning validation~~ | ~~Agent 8~~ | ~~Superseded by CEO Session #9 — product renamed to "Flow by Kaivoo"~~ | **SUPERSEDED** |
| Marketplace model analysis | Agent 8 | Shopify Apps, Figma Community, Notion Templates — commission structures, quality control, creator incentives | PLANNED |
| Sandboxed module runtime | Agent 3 | Evaluate iframe sandboxing, Web Components, controlled runtimes for user-built modules — security vs. capability | PLANNED |
| Companion app architecture | Agent 3 | Stripped-down mobile app: concierge chat, today view, quick capture, notifications. PWA vs. native. Session scoping for multi-surface concierge (one brain, many mouths). | PLANNED |
| Concierge coherence signals | Agent 3 | Define behavioral signals for concierge drift detection — personality consistency, data citation accuracy, generic-vs-personalized response scoring. What's the "scratchpad" equivalent for our system? | PLANNED |
| Hybrid memory search architecture | Agent 3 | Embedding provider selection (OpenAI, local via transformers.js), SQLite vector extension vs. separate store, temporal decay tuning, token budget for hippocampus compilation | PLANNED |
| Memory consolidation pipeline | Agent 3 | Sleep cycle design: diff-based consolidation, dedup strategy, relevance scoring, stale memory pruning. Runs between sessions on cloud infrastructure. | PLANNED |
| Exec approval system design | Agent 4 | Study OpenClaw's exec approval pattern: unique approval IDs, timeouts, audit trail, challenge-response. Design Kaivoo's version for Orchestrator remote execution. | PLANNED |
| Companion app sync costs | Agent 5 | Cost modeling for companion app cloud relay — per-user sync bandwidth, concierge API routing, push notification infrastructure. Feeds into Supabase cost-per-user modeling above. | PLANNED |
| Memory tier pricing model | Agent 8 | Hybrid memory search + sleep cycle consolidation as subscription differentiators — willingness-to-pay analysis, competitive positioning vs. free AI chat | PLANNED |
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
| MCP server architecture | Agent 3 | How to expose Kaivoo data (tasks, notes, calendar, files) as MCP resources/tools. Protocol design, permission model, local vs. remote access | PLANNED |
| Local file indexing engine | Agent 3 | Architecture for indexing all files on machine (not just vault). Performance at scale, incremental updates, search ranking | PLANNED |
| Secure tunnel evaluation | Agent 9 | Tailscale vs. Cloudflare Tunnel vs. libp2p vs. custom — for remote desktop access from companion app. Setup friction, reliability, security | PLANNED |
| Companion app architecture | Agent 3 | Stripped-down mobile app with concierge chat, today view, quick capture, notifications. Session scoping for multi-surface concierge. PWA vs. native. Cloud relay architecture. | PLANNED |
| Self-building sandbox model | Agent 3 + Agent 4 | How the AI builds new pages/widgets safely. Sandboxing, capability permissions, immutable core protection, rollback | PLANNED |
| Plex/Obsidian model analysis | Agent 5 | How Plex (local server + remote access) and Obsidian Sync (encrypted relay) work technically. Lessons for Kaivoo's Mode A/B architecture | PLANNED |
| Cloud sync infrastructure costs | Agent 5 | Cost modeling for Supabase relay (Mode B) at scale — per-user sync bandwidth, storage, always-on relay pricing | PLANNED |
| MCP ecosystem landscape | Agent 5 | Current state of MCP ecosystem — who's building what, adoption curves, partnership opportunities, timing risk assessment | PLANNED |

---

## Current Position

**We are in:** Phase A — Productivity App (the wedge — final pre-launch sprints, shipping toward the personal OS vision)
**Active sprint:** None
**Last completed:** Sprint 32 (Knowledge Unification) — 10/10 parcels across 3 tracks. Vault and Topics merged into unified "Knowledge" page at `/topics` with two tabs (Topics | Vault). Sidebar reduced from 8 to 7 entries (Library icon). `TopicsContent` and `VaultContent` extracted as named exports, lazy-loaded via React.lazy + Suspense. Tab state persisted via `useLocalStorage` + `useSearchParams` for deep linking. `forceMount` on Vault tab prevents state loss on tab switch. `/vault` redirects to `/topics?tab=vault`. Topic detail breadcrumbs updated to "Knowledge". E2E tests updated for Sprint 31+32 route changes. 265 tests. See `Sprints/Sprint-32-Knowledge-Unification.md`.

**Sprint 31 delivered:** Tasks + Projects Merge — 14/14 parcels across 4 tracks. Track 0: Unified `/projects` page with top-level tabs (All Tasks | Projects), lazy-loaded TasksContent via React.lazy + Suspense, `/tasks` redirects to `/projects`. Track 1: Project detail tabbed sub-nav (Tasks/Documents/Notes/Chat), Inbox virtual project for unassigned tasks, `sortDoneToBottom` extracted, chat placeholder with disabled buttons. Track 2: Sidebar Tasks entry removed, search paths updated, widget links updated, all navigation points to `/projects`. Track 3: Sprint 30 carryover — `onLinkTask` made optional, ProjectNotesList spacing fixed. Post-audit: O(N+M) taskStatsMap optimization, settings moved from inline section to gear icon dialog, ARIA `aria-pressed` pattern on filter tabs, `focus-visible:ring-*` on 5 element types, Inbox hover translate instead of shadow, sidebar sign-out `aria-label`. 265 tests. See `Sprints/Sprint-31-Tasks-Projects-Merge.md`.

**Sprint 30 delivered:** Bug Bash + Concierge Hardening — 15/15 parcels across 4 tracks. Track 1: 7 bugs fixed (2 P0 data-loss: TopicPage navigation flush + base64 image 200KB cap; content column migration; subtask/widget reorder verified; calendar empty state; search prefix matching). Track 2: Concierge memory architecture hardened (pre-compaction flush at 40 msgs, deterministic context assembly via `assembleConciergeContext()`, coherence monitoring with 3 heuristic checks). Track 3: Image rename pipeline + upload progress polish. Track 4 (sandbox discoveries): AI conversations/coherence logs moved from localStorage to adapter pattern (SQLite + Supabase + RLS), AI Conversations vault folder, desktop vault fix (VirtualVaultAdapter for browsing, LocalVaultAdapter preserved as fileVault for exports). 265 tests. See `Sprints/Sprint-30-Bug-Bash-Concierge.md`.

**Sprint 29 delivered:** Flow Rebrand — Full product rename from "Kaivoo" to "Flow by Kaivoo." In-app text, page titles, sidebar, settings, wizard, window title all updated. Sign-out button hidden on desktop. Landing page rebuilt with Flow identity. EULA + Privacy Policy updated. 6/7 parcels done (P7 screenshots deferred). See `Sprints/Sprint-29-Flow-Rebrand.md`.

**Sprint 24 delivered:** Soul File & Concierge Intelligence — soul file personality (name, tone, backstory, communication prefs, working style), AI memory system (localStorage + SQLite CRUD, substring dedup, category/source tracking), 18-tool concierge with multi-round tool-use loops (create/read/update tasks, journal, calendar, notes, captures, projects, routines, habits, memory), 6-layer system prompt assembly (soul + memories + summaries + app context + tools), provider-agnostic SSE streaming via Supabase Edge Function (OpenAI, Anthropic, Google, Groq, Mistral, DeepSeek, Ollama, OpenAI-compatible), Anthropic message transformation for tool-use round-trips, memory extraction pipeline (LLM-based fact extraction with batch dedup), conversation summaries, per-provider API key caching, WCAG AA accessibility (aria-checked radio groups, non-color selection indicators, token-based contrast). 265 tests. See `Sprints/Sprint-24-Soul-File-Concierge.md`.

**Sprint 23 delivered:** Setup & AI Foundation — 4-track sprint. Track 1: Sprint 22 quality debt (9 Agent 7 P1 findings, WAI-ARIA tree roles, AlertDialog, loading skeleton). Track 2: Setup wizard (first-launch detection, vault folder picker, Obsidian import, concierge hatching, guided tour). Track 3: AI foundation (provider settings for OpenAI/Anthropic/Ollama, BYO API key config, chat concierge with SSE streaming, conversation persistence, soul config system prompt). Track 4: Desktop CI/CD (GitHub Actions 3-platform matrix, Rust caching, code signing env vars). 12/12 parcels done. See `Sprints/Sprint-23-Setup-AI-Foundation.md`.

**Sprint 22 delivered:** Knowledge Vault with dual-adapter architecture (LocalVaultAdapter for Tauri desktop, VirtualVaultAdapter for web). File browser at `/vault` with 5 root folders (Topics/Projects/Journal/Library/Inbox), tree navigation, search, breadcrumbs, entity deep-linking. Obsidian-compatible markdown export with YAML frontmatter for 5 entity types. Topic parentId nesting with recursive tree rendering. Adapter stabilization: `local.ts` split into 6 modules, SearchIndexer for per-CRUD FTS5 indexing, entity_type discriminator, empty-set guards. 265 tests (39 new). Agent 7 found 6 P0 issues (path traversal, YAML injection, cascade delete, caching, routing, idempotent migration) — all fixed. 3-agent design review passed. See `Sprints/Sprint-22-Knowledge-Vault.md`.

**Sprint 21 delivered:** Local-first storage — SQLite CRUD persistence for all 13 entities, FTS5 search with `search_all` function, local auth session management. See `Sprints/Sprint-21-Local-First-Storage.md`.

**Sprint 20 delivered:** DataAdapter abstraction layer (4 top-level interfaces, 15 entity sub-adapters), runtime switching via `isTauri()`. LocalDataAdapter with static factory pattern + SQLite schema for all 13 entities. SupabaseDataAdapter wrapping existing queries. AdapterProvider React context with Suspense boundary. Tauri 2.0 scaffold (Cargo.toml, plugins: sql/fs/shell, capabilities, RGBA icon generation). 18 Playwright E2E tests. Sprint Protocol v1.8 (living sprint file + E2E gate). See `Sprints/Sprint-20-Local-First-Foundation.md`.

**Sprint 19 delivered:** Topics restructure (parent-child topic pages, inline edit, emoji picker), bundle optimization (8 vendor chunks via Vite manualChunks), tech debt cleanup. See `Sprints/Sprint-19-Topics-Quality.md`.

**Sprint 18 delivered:** Supabase Postgres FTS with GIN indexes across 10 tables, `search_all` RPC with `websearch_to_tsquery`, SearchCommand command palette (Cmd+K), SearchTrigger bar on Today page, Calendar week view (7-column hourly grid, 3-mode switcher), customizable keyboard shortcuts system (Settings UI, shortcut recorder, browser conflict validation). See `Sprints/Sprint-18-Search-Week-View.md`.

**Sprint 17 delivered:** Three habit types (Positive, Negative, Multi-count), streaks, exponential-smoothing strength scores, analytics dashboard with mood-habit correlation, Today widget upgrade with two-way sync, habit detail view with calendar dots. See `Sprints/Sprint-17-Routines-Habits.md`.

**Sprint 14 delivered:** Project Notes CRUD (project_notes table, RLS, service layer, Zustand store). ProjectDetail Notes section with inline editing. Quick Add note-to-project from anywhere (Cmd+Shift+N). Notes included in data export/import. See `Sprints/Sprint-14-Connect.md`.

**Key decisions resolved (CEO Session — March 1, 2026):**
- ~~Business model: one-time only vs. subscription~~ → **Two-phase strategy** (Phase A: $99/$49 one-time, Phase B: subscription ARR)
- ~~Product positioning~~ → **AI-powered Flow orchestration OS** — guided, outcome-first AI, not blank chat boxes
- ~~Enterprise vs. SMB focus~~ → **SMB focus** — solopreneurs to small teams (1-25), no "enterprise" language
- ~~Rebrand timing~~ → **Completed Sprint 29** — app renamed to "Flow by Kaivoo" (was "Kaivoo"). Shipped pre-launch, zero switching cost.
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

**Key decisions resolved (CEO Session #5 — March 3, 2026):**
- ~~SaaS vs. local-first vs. infrastructure~~ → **Three-tier model** — Tier 1: $49 one-time local-first app (BYO keys), Tier 2: subscription for managed AI/sync/integrations, Tier 3: premium subscription for builders/orchestrator. Local-first is the wedge. Subscription is elective convenience, not forced.
- ~~Phase A pricing~~ → **Revised to three tiers** — replaces two-phase strategy. $49 Core / $99 Standard / subscription Pro / subscription Builders. Founding member $49 closes when Tier 2 launches.
- ~~"Day-centric" vs. "day execution" positioning~~ → **Day execution** — "Today is where notes become actions and actions become delegated AI work." Sharper than "day-centric" and uncontested. Sunsama owns "daily planning." Kaivoo owns "day execution."
- ~~ChatGPT memory crisis as positioning pillar~~ → **Toned down** — position soul file as "own your AI's memory" rather than anchoring on a specific catastrophe claim. The user frustration is real but the narrative should stand on its own merit, not require an enemy to fail.
- ~~Soul file architecture~~ → **Phase 1: SQLite fact store + enhanced system prompt assembly + user-editable memory UI. Phase 2: extraction pipeline (cheap model auto-extracts facts after conversations). Phase 3: embeddings + MCP.** Start simple, upgrade when needed.
- ~~Gmail/Calendar at launch~~ → **Deferred to post-launch fast-follow** — investigate MCP for faster delivery. Launch story is "AI concierge that knows you" not "email client."
- ~~Phase A feature scope~~ → **Ship what's built + soul file + licensing + landing page + legal.** Everything else is fast-follow. We're close — finish, don't strip.

**Key decisions resolved (CEO Session #6 — March 4, 2026):**
- ~~Product identity~~ → **Personal infrastructure for the AI era** — starts as plug-and-play AI productivity (the wedge), evolves into cross-platform MCP foundation layer, long-term trajectory is personal OS. "Plex started as 'play my movies.' Obsidian as 'edit my notes.' Kaivoo starts as 'plug and play AI productivity.'"
- ~~MCP role in architecture~~ → **MCP-native from day one** — not a bolt-on. Every data source exposed as MCP resource. Every action as MCP tool. New Core Principles #11 (MCP-native) and #12 (Self-building) added.
- ~~Cloud vs. local-only~~ → **Local-first with SaaS attachments** — desktop is primary, cloud sync is optional paid companion for always-on mobile access. Users can download data anytime and run fully locally. "You own your data" enforced at every tier.
- ~~Always-on assumption~~ → **Dual-mode architecture** — Mode A (desktop awake, direct access like Plex) + Mode B (desktop asleep, encrypted cloud sync). Users don't think about modes. It just works.
- ~~Companion app~~ → **Web-based companion for mobile/tablet** — not a full native app initially. Accesses data via local server (Mode A) or cloud sync (Mode B). Paid feature via Cloud Companion subscription.
- ~~Self-building capability~~ → **Phase D milestone** — "I wish we had an app for X" → AI researches, plans, builds. Autonomy Ladder Level 4. Core Foundation remains immutable; everything on top is fair game.
- ~~Apps dying thesis~~ → **Captured as strategic thesis** — apps are the old model, MCP + intelligent orchestration is the new model. Kaivoo aims to be the first cross-platform MCP foundation layer. Not replacing OS now, but the trajectory points there.
- ~~Phase D added~~ → **MCP Foundation & Personal OS phase** — local file indexing, MCP server layer, secure tunnel, companion app, self-building, flow automation, universal file search, voice interface. Research parcels assigned.
- ~~Business model~~ → **Four-tier model** — Tier 1 (Core, one-time), Tier 2 (Cloud Companion, subscription), Tier 3 (Builders, subscription), Tier 4 (Personal OS, premium). Tier 2 reframed from "Pro" to "Cloud Companion" to reflect the local-first + SaaS hybrid.
- ~~Near-term plan~~ → **Ship the wedge, build toward the vision.** Current codebase is the foundation. Tauri, SQLite, DataAdapter, UI — all stay. Framing shifts from "productivity app" to "personal infrastructure layer." Bug fixes and launch prep continue as planned.

**Key decisions resolved (CEO Session #7 — March 6, 2026):**
- ~~Communication channel for Orchestrator~~ → **Build our own through the companion app** — not Telegram, not WhatsApp. The companion app IS the mobile communication layer. E2E control over experience, no third-party API dependencies, native context access, privacy (conversations never touch external platforms).
- ~~Concierge memory as feature vs. moat~~ → **Competitive moat** — memory architecture (hybrid search, coherence monitoring, sleep cycle consolidation, deterministic boot) is the defensibility. "The AI that actually remembers you" differentiates from every bolt-on AI chat.
- ~~Companion app scope~~ → **Stripped-down mobile version** — concierge chat, today view, quick capture, notifications. Not a full port. Requires Cloud Companion subscription (sync infrastructure).
- ~~Memory architecture~~ → **7-layer cortex/hippocampus model** — soul file (identity), working memory (compiled per session), long-term memory (grows forever), pre-compaction flush, hybrid search (Phase B), memory consolidation (Phase B), coherence monitoring (Phase B). Revenue-aligned: Core gets layers 1-4, Cloud Companion gets layers 5-7.
- ~~Skills/module architecture validation~~ → **Documentation-first manifests confirmed** — OpenClaw's production-validated pattern (skills as markdown the AI reads, not code the gateway loads) validates Kaivoo's module architecture. Modules ship as Page + Today Widget + skill manifest + concierge context snippet.
- ~~Exec approval for Orchestrator~~ → **Study OpenClaw's pattern** — unique approval IDs, timeouts, audit trail, challenge-response. Agent 4 research parcel assigned.

**Key decisions resolved (CEO Session #8 — March 6, 2026):**
- ~~Desktop vs. web as primary~~ → **Desktop is the flagship product.** Web access and companion app are premium add-ons (Tier 2 subscription). Desktop one-time pricing works because cost-to-serve is zero. Web subscription is the only sustainable model because Supabase infrastructure costs money per user per month.
- ~~Free trial model~~ → **14-day full-experience web trial** — time-limited, not feature-limited. Full experience triggers the "aha moment." Converts to desktop purchase or web subscription. No feature-gating complexity.
- ~~Companion app gating~~ → **Requires Tier 2 subscription** — architectural necessity (needs cloud sync), not artificial paywall. Users understand "your phone needs cloud sync."
- ~~Launch sequencing~~ → **Web trial first (no cert dependency), desktop when Apple certs clear.** Parallel tracks. Web trial doesn't need full Stripe checkout — just sign-up, usage limits, and conversion CTAs.
- ~~Cost-to-serve reasoning~~ → **Documented in Vision.** Desktop = zero marginal cost (one-time works). Web = per-user infrastructure (subscription required). Free trial = controlled burn (14-day limit). This is the Obsidian model but stronger — Kaivoo gets paid at the door AND on cloud add-ons.
- ~~Tier naming~~ → **Tier 1: "Kaivoo Desktop" (was "Core"). Tier 2: "Web Access + Sync + Companion" (was "Cloud Companion").** Names reflect what users actually get.

**Key decisions ahead:**
- **File watching mechanism** — How does the app detect manual file changes on disk? Agent 3.
- **Desktop auto-update** — How do users get updates for the desktop app? Agent 9.
- **Code signing** — Apple notarization + Windows signing. Agent 9.
- **Phase B subscription pricing** — Pending research on token costs, competitive pricing, addon model
- **Skills store architecture** — MCP-based vs. custom plugin API (Agent 3 to evaluate during Phase B)
- **Sandboxed module runtime** — How user-built modules run safely (iframe, Web Components, controlled runtime) (Agent 3)
- **Marketplace commission model** — Revenue split that attracts creators without undercutting platform revenue (Agent 8)
- **Legal review** — EULA needs attorney review before Phase A ships
- **Companion app as communication layer** — Concierge chat, session scoping (one brain, many mouths), push notifications. Resolved: build our own, not Telegram (Agent 3)
- **Agent system productization** — How to ship executable agent templates without losing markdown simplicity (Agent 3)
- **Orchestrator pricing** — Subscription, usage-based, or hybrid (Agent 8)
- **Solo Builder market validation** — Is the market real and big enough? (Agent 8)
- **Remote execution security** — Auth and blast-radius controls for text-triggered git operations (Agent 4)
- **MCP server design** — How to expose Kaivoo data as MCP resources/tools (Agent 3)
- **Local file indexing architecture** — How to index all files on a machine at scale (Agent 3)
- **Secure tunnel for remote access** — Tailscale vs. Cloudflare Tunnel vs. alternatives (Agent 9)
- **Companion app architecture** — PWA vs. native, offline-first design, selective sync protocol, concierge session scoping (Agent 3)
- **Concierge coherence signals** — What behavioral signals define "drift" for Kaivoo's concierge? Personality consistency, data citation accuracy, generic-vs-personalized scoring (Agent 3)
- **Memory hippocampus token budget** — How many tokens for the compiled working memory snapshot? Cost implications at scale (Agent 5)
- **Memory tier differentiation** — Is hybrid search + sleep cycle compelling enough for subscription conversion? Willingness-to-pay vs. free AI chat (Agent 8)
- **Self-building sandbox** — How AI builds new pages safely within security boundaries (Agent 3 + Agent 4)
- **Cloud sync cost modeling** — Per-user infrastructure costs for Mode B relay (Agent 5)
- **GitHub Actions optimization** — Desktop Build workflow burning too many CI minutes. Only run on main, add path filters, drop multi-platform from PRs (Agent 9)
- **Repo visibility** — Public (unlimited CI minutes, code visible) vs. Pro (3,000 min/mo, $4/mo). Workflow optimization is the real fix regardless.

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

Why Kaivoo wins where others don't:

1. **Own your AI's memory.** ChatGPT's memory is opaque, unreliable, and not yours. Kaivoo's soul file is a readable, editable, exportable record that you own. No surprises. No silent resets. No vendor holding your AI relationship hostage.

2. **Day execution, not day planning.** Sunsama helps you plan your day. Kaivoo helps you *execute* it. Today is where notes become actions and actions become delegated AI work. The Autonomy Ladder isn't a roadmap feature — it's the product philosophy.

3. **Guided AI, not open-ended AI.** Claude and ChatGPT are power tools with no instruction manual. They hand you infinite capability and zero direction. Kaivoo gives users specific tools with clear outcomes. No prompt engineering. No decision paralysis.

4. **Replace the stack, don't add to it.** Notion + Google Calendar + journal app + CRM spreadsheet + AI chat = 5 tabs, 5 logins, 5 subscriptions. Kaivoo = one place.

5. **BYO everything.** Bring your own API keys. Bring your own models. Your data stays local. Your AI costs are transparent. No markup, no lock-in, no cloud dependency for core functionality. Or let us handle it — your choice.

6. **AI that teaches you what it can do.** The concierge doesn't wait for instructions — it suggests actions based on your data. Every suggestion is a discovery moment. Users don't need to know what's possible because the AI shows them.

7. **Grows with you.** Start personal, go professional. The same tool that manages your journal and habits also runs your team's projects and client work. No migration. No second tool. One Flow.

8. **MCP-native from day one.** While everyone else bolts MCP onto existing products, Kaivoo is built protocol-first. Every data source is an MCP resource. Every action is an MCP tool. This means any AI — not just Kaivoo's concierge — can access your data with permission. As the MCP ecosystem grows, Kaivoo becomes more powerful automatically.

9. **Your machine, accessible everywhere.** Plex proved the model for media. Kaivoo applies it to productivity. Your desktop is your server. Your phone is your remote. No cloud dependency for core functionality — but optional cloud sync when you want always-on access. Nobody else offers this for productivity.

10. **Self-building.** Tell Kaivoo what you wish it could do, and it builds it. Not a feature request. Not a plugin marketplace search. A conversation that ends with a new capability. The product evolves through use, not through release cycles.

---

## How This Document Is Used

1. **The CEO** owns this document philosophically — is Flow by Kaivoo solving the right problem?
2. **The Director** reads this before every sprint planning session
3. **All agents** can reference this for product context
4. **Agent 8 (Product Manager)** uses this to align business strategy with engineering reality
5. **The user** updates this when priorities shift or new features are requested
6. **Sprint retrospectives** update the Status column as milestones complete

When a milestone moves from PLANNED to DONE, update the Status and Sprint columns. When new milestones are added, place them in the appropriate phase.

---

*Vision v7.12 — March 14, 2026*
*v7.12: Sprint 39 (Orchestrator Foundation) complete. 6/6 parcels. Orchestrator Page shipped with `/orchestrator` route, 4-tab layout (Flows, Agents, Skills, Apps), and full CRUD for Agents and Skills tabs. Data model: 3 new tables (agents, skills, agent_skills junction) with SQLite + Supabase adapters following DataAdapter pattern. Agents: card grid, create/edit dialog with model selector (all 8 providers), system prompt, active toggle, skill assignment via badge toggles. Skills: card grid, create/edit with action-type-aware config (prompt template, tool name, composite placeholder). Supabase migration applied with RLS policies. Bug fixes: heartbeat error toast debounce (1hr cooldown), MemoryManagement delete confirmation dialog. Housekeeping: InsightsHistoryModal migrated to shadcn Dialog. Sandbox caught 2 bugs: missing Supabase types (typed client rejected unknown tables) and dialog not opening from empty state (early return bypassed dialog JSX) — both fixed. 295 tests, 22/22 E2E. Orchestrator milestone updated to IN PROGRESS. See `Sprints/Sprint-39-Orchestrator-Foundation.md`.*

*Vision v7.11 — March 14, 2026*
*v7.11: Sprint 38 (Neuron Memory V1) complete. 7/7 parcels. 3-tier memory architecture (core_identity / active_context / episodic) with SQLite + Supabase migrations. Context-aware loading with relevance scoring (recency × frequency × importance) and 3500-token budget enforcement. Memory consolidation pipeline: Jaccard word-similarity dedup (≥0.7 threshold, same category), stale pruning (>90 days + low access + low importance), promotion (episodic→active_context on high access/importance), demotion (active_context→episodic on staleness). Quiet hours / DND for heartbeat notifications (overnight range support). Insights history modal with date filters, actionable toggle, pagination. Tier-aware Memory Management settings UI with token budget bar, promote/demote/delete per memory. Fixed pre-existing await-thenable lint errors (CI blocker) and schema index ordering bug (desktop crash). 30 new tests (295 total). 22/22 E2E passed. Desktop + web sandbox approved. See Sprints/Sprint-38-Neuron-Memory.md.*
*v7.10: Sprint 37 (Configurable Heartbeat) complete. 7/7 parcels. Proactive AI heartbeat now configurable: background timer (Rust thread + TypeScript setInterval), 3 frequency modes (Off, Hourly N-hour intervals, Custom days/times), custom schedule UI (DayOfWeekSelector with weekday/weekend/all-day presets, TimePickerList with up to 3 daily times, auto-save on change), AI inference integration (reads tasks/calendar/journal/soul file, returns actionable insights or NO_ACTION), desktop + web notifications (Tauri sendNotification + browser Notification API). Simplified from 6 preset modes to 3 user-controlled modes per user feedback ("custom hours can cover work hours/morning/evening"). Key bug fixes: Rust Arc<Mutex> deadlock (nested lock removed), 60s stop delay (interruptible sleep pattern checks stop flag every 1s), missing @tauri-apps/plugin-notification package. Quality gates: 100% pass (format, lint, typecheck, test, build, cargo check, clippy). Sandbox testing: Track A web + Track B desktop both approved. Agent 7: 0 P0s. Design agents: 3 P1s fixed (gap-3 spacing, button variants, time input width). 600 lines across 7 files. See Sprints/Sprint-37-Configurable-Heartbeat.md.*
*v7.8: Sprint 35-36 (Fix Execution Tools + Data Awareness) complete. 6/6 parcels. AI tool execution now works end-to-end: 19 tools with hardened schemas (`additionalProperties: false`, enriched descriptions, aligned enums), argument validation with self-correcting error messages, cross-provider tool support for all 8 providers (OpenAI, Anthropic, Gemini, Groq, DeepSeek, Mistral, OpenRouter, Ollama). Key fixes: edge function deployed (was never deployed — root cause of all failures), Ollama switched to OpenAI-compatible endpoint for native tool calling, Gemini functionCall/functionResponse message transformation, overdue task detection via `parseDate()` for all stored date formats, `toggleHabitCompletion` routed through action layer. Edge function v10 deployed. Agent 7 audit: 0 P0s, 9 P1s (top 3 fixed), 10 P2s. Agent 11: PASS. See `Sprints/Sprint-35-36-Execution-Tools.md`.*
*v7.7: Sprint 34 (Full-Page AI Chat) complete. `/chat` route with conversation list, persistent history (SQLite + Supabase), model selector, shared `useConciergeChat` hook powering both widget and full-page chat. See `Sprints/Sprint-34-Full-Page-Chat.md`.*
*v7.6: Sprint 33 (Bug Bash) complete. 10/10 parcels. All user-facing bugs from CEO #12 audit fixed: HTML rendering in content surfaces (DayReview + TopicCapturesWidget), Kanban all-column drag-and-drop, wiki-link `[[Topic/Page]]` rendering as clickable links (custom Tiptap WikiLinkNode + preprocessor for existing content), Library sidebar icon → FolderOpen, Gantt view hidden. Cleanup: seed data removed from store, `to_tsquery` sanitized, compressImage float fix, `.env` in .gitignore. 6 P1s caught by verification agents + 2 sandbox issues, all fixed. E2E infrastructure repaired (22/22 pass). Process improvements: format-first quality gates, E2E in sprint gate chain. Ready for AI feature sprints (Sprint 34+). See `Sprints/Sprint-33-Bug-Bash-Vault.md`.*
*v7.5: Sprint 31 (Tasks + Projects Merge) complete. 14/14 parcels. Unified `/projects` page with top-level tabs (All Tasks | Projects), lazy-loaded TasksContent, `/tasks` redirect, project detail tabbed sub-nav (Tasks/Documents/Notes/Chat), Inbox virtual project, sidebar Tasks entry removed, all navigation updated. Post-audit: O(N+M) stats optimization, settings moved to gear icon dialog, ARIA improvements (aria-pressed, focus-visible rings), hover translate pattern. 265 tests. Current position updated.*
*v7.4: Sprint 30 (Bug Bash + Concierge Hardening) complete. 15/15 parcels. 7 bugs fixed (2 P0 data-loss), concierge memory architecture hardened (pre-compaction flush, deterministic context assembly, coherence monitoring), upload polish, AI conversations moved to adapter pattern (localStorage→SQLite/Supabase), desktop vault fixed (VirtualVaultAdapter for browsing). 265 tests. Current position updated.*
*v7.3: Sprint 29 (Flow Rebrand) complete. Product renamed from "Kaivoo" to "Flow by Kaivoo." In-app rename (all user-visible text), landing page rebuilt with Flow identity, EULA + Privacy Policy updated, Product Hunt listing rewritten, strategic docs updated. Internal identifiers preserved. Sign-out hidden on desktop. Agent 7 caught 6 missed renames — all fixed. Screenshots deferred to Sprint 33. Rebrand decision updated. Current position updated.*
*v7.2: Sprint 28 (Launch Ready) complete. Landing page (Astro + Tailwind, 11 sections, dark/light toggle) deployed to Netlify. EULA and Privacy Policy drafts ready for attorney review. Product Hunt listing drafted. Revenue pipeline deferred to future sprint — user wants more features before launch. Custom domain pending DNS config. CTA buttons placeholder until Stripe configured. Current position updated.*
*v7.9: Flow Orchestration Model — Added new "Flow Orchestration Model" section after Core Principles establishing the 4-layer hierarchy (Flows → Agents + Skills + Apps) as the PRIMARY product direction. Updated Orchestrator product description to explicitly mention "Flow orchestration, autonomous Flows with per-Flow scheduling." Updated Orchestrator Page milestone to use new 4-tab structure: Flows (CRUD, scheduling, triggers, step builder), Agents (model assignment, assign skills), Skills (reusable actions), Apps (MCP discovery). Renamed "Workflow Execution Engine" to "Flow Execution Engine." Updated marketing story to "Flow was built using Flows." Updated Safety Layer and Thinking Transparency to reference "Flows" instead of "workflows." Updated product positioning to "AI-powered Flow orchestration OS." Updated competitive edge tagline to "One Flow" (was "One workflow"). Updated version history references from "One Workflow" to "Flow Cloud." Terminology consistently updated: "Flow" (capitalized) for Kaivoo's orchestration feature, "workflow" (lowercase) for generic automation concepts.*
*v7.1: CEO Session #8 — Desktop as flagship, web as premium. Pricing model clarified: desktop one-time ($49/$99) works because cost-to-serve is zero; web subscription ($8-12/mo) required because Supabase infrastructure costs per user per month. Free 14-day web trial added as top of funnel (full experience, time-limited not feature-limited). Companion App explicitly gated behind Tier 2 subscription (architectural necessity, not paywall). Launch sequence documented: web trial first (no cert dependency), desktop when Apple certs clear. Conversion funnel added: Free → Buy Desktop or Subscribe Web; Desktop owners → Add Web Sync. Cost-to-serve reasoning documented. Tier naming updated: "Kaivoo Desktop" (was Core), "Web Access + Sync + Companion" (was Cloud Companion). Tier 2 pricing research expanded: 7 new research parcels covering Supabase cost-per-user modeling, managed AI costs, storage tier modeling (Google Drive-style), free trial burn rate, cloud storage competitive teardown (Google Drive/iCloud/OneDrive/Dropbox/Obsidian Sync), subscription pricing recommendation, and productivity competitor pricing. Tiered storage pricing added as possibility ($8 base / higher tiers for more storage). Managed AI noted as potentially separate addon if cost modeling shows it's unsustainable at base subscription price. Obsidian model comparison strengthened — Kaivoo gets paid at the door AND on cloud add-ons.*
*v7.0: Concierge Memory Architecture (7-layer cortex/hippocampus model). Companion app as communication layer (replaces Telegram). Hybrid memory search, coherence monitoring, sleep cycle consolidation, pre-compaction flush added to Phase B roadmap. Exec approval system for Orchestrator. Documentation-first module manifests confirmed. New research parcels: coherence signals, hybrid search architecture, memory consolidation pipeline, companion app sync costs, memory tier pricing. Informed by analysis of Adam Framework and OpenClaw Gateway.*
*v6.1: Sprint 27 (Desktop Verification) complete. Verified all Sprint 26 features on Tauri desktop. Found and fixed 8 issues across code audit (2) and Track B sandbox testing (6): inline image URL protocol, data import auth gate, CSP for asset protocol, Tauri v2 dot-prefix glob scoping, dark mode cursor, native drag-drop interception, blob URLs for local files, Opener plugin for file opening. Key learning: Tauri v2 deny-by-default capabilities have non-obvious behaviors only discoverable at runtime. 5/5 parcels + 8-commit hotfix. See `Sprints/Sprint-27-Desktop-Verification.md`.*
*v6.0: CEO Session #6 — Strategic evolution from productivity app to personal infrastructure for the AI era. New identity: "Your machine. Your data. Your AI. Accessible from everywhere. Owned by you." MCP-native architecture adopted as core principle (#11). Self-building adopted as core principle (#12). Autonomy Ladder extended to Level 4 (AI Builds). New "North Star: Personal OS" section — thesis on apps dying, MCP as the future, Plex model for productivity, dual-mode architecture (local server + cloud sync). Business model expanded to four tiers: Core (one-time), Cloud Companion (subscription, replaces "Pro"), Builders (premium), Personal OS (long-term premium). Phase D added: MCP Foundation & Personal OS (local file indexing, MCP server layer, secure tunnel, companion app, self-building, flow automation, universal file search, voice interface). Architecture diagram updated with MCP Foundation Layer and Sync & Access Layer. Competitive edge expanded (#8 MCP-native, #9 your machine accessible everywhere, #10 self-building). 9 new research parcels assigned. Near-term plan unchanged: ship the wedge (plug-and-play AI productivity), build toward the vision.*
*v5.4: Sprint 26 (Feature Completion) complete. 9/9 parcels done. File attachments now work on topics, journal entries, and projects (was project-only). Inline images upload to Supabase Storage bucket (was base64). Topic content editing shipped (Tiptap rich text + content DB column + auto-save). Desktop JSON + markdown export working. FloatingChat removed (ConciergeChat is sole chat). File attachments and topic content editing milestones marked DONE. See `Sprints/Sprint-26-Feature-Completion.md`.*
*v5.3: Sprint 26 (Feature Completion) started. Code-vs-Vision audit found 5 gaps: attachments project-only, no topic content editing, desktop export broken, vault markdown export orphaned, FloatingChat legacy overlap. File attachments milestone corrected from DONE to PARTIAL. Topic content editing added as new milestone. Launch prep bumped to Sprint 27.*
*v5.2: Sprint 25 (Ship Prep & Desktop Polish) complete. Ed25519 license key system with offline verification, Stripe Checkout ($49/$99), auto-updater foundation (tauri-plugin-updater + release workflow), file attachments with drag-and-drop, subtask reorder (dnd-kit), OpenRouter provider, bundle optimization (497KB→381KB), 8 desktop sandbox fixes (Tauri permissions, adapter race condition, vault scope, habit completion reactivity). 17/17 parcels done. See `Sprints/Sprint-25-Ship-Prep.md`.*
*v5.1: Sprint 24 (Soul File & Concierge Intelligence) complete. Soul file personality system, AI memory CRUD with dedup pipeline, 18-tool concierge with tool-use loops, 6-layer prompt assembly, provider-agnostic streaming (8 providers), Anthropic message transformation, memory extraction, conversation summaries, WCAG AA accessibility fixes. Soul file milestone marked DONE. See `Sprints/Sprint-24-Soul-File-Concierge.md`.*
*v5.0: CEO Session #5 — Strategic pivot to three-tier revenue model (Core $49 one-time / Pro subscription / Builders subscription). "Day execution" replaces "day-centric" as core positioning. Soul file elevated to Phase A must-have (persistent AI memory the user owns). ChatGPT memory crisis narrative toned down — "own your AI's memory" framing. Gmail/Calendar deferred to post-launch fast-follow (investigate MCP). BYO-key economics validated by market research (TypingMind, JetBrains precedents). Competitive edge section rewritten around ownership, execution, and BYO-everything. Sprint 23 (Setup & AI Foundation) complete.*
*v4.6: Sprint 22 (Knowledge Vault) complete. Vault file browser with 5-folder structure (Topics/Projects/Journal/Library/Inbox), dual-adapter architecture, Obsidian-compatible markdown export, topic nesting, adapter stabilization (local.ts split, SearchIndexer, entity_type discriminator). 265 tests. 6 P0 security/correctness fixes. See `Sprints/Sprint-22-Knowledge-Vault.md`.*
*v4.5: CEO Strategic Brief — Phase A pricing revised ($99 standard / $49 founding member). Volume-over-margin strategy. AI features deferred to Phase B. Sprint 21 (Local-First Storage) started — SQLite persistence, adapter completion, FTS5 search, local auth. Sprint sequencing resolved through Sprint 24+. Revenue projections updated for new pricing. See `Research/Agent-5-Docs/CEO-Strategic-Brief-Phase-A-Pricing.md`.*
*v4.4: Sprint 20 completion — Tauri 2.0 selected, DataAdapter pattern implemented, SQLite schema designed, 18 E2E tests, lint cleanup. See `Sprints/Sprint-20-Local-First-Foundation.md`.*
*v4.3: CEO Session #4 — Local-First Knowledge OS. Topics elevated to single source of truth for all content and files (Topics > Projects > Tasks/Files hierarchy). Desktop packaging (Electron/Tauri) promoted to Phase A must-have. Data layer abstraction: LocalAdapter (SQLite + file system) for Phase A, CloudAdapter (Supabase) for Phase B, swappable backend, no codebase split. File attachments + image embedding promoted to must-have. Hashtags as virtual filters not folders. Convention-with-flexibility folder structure (opinionated default, permissive by nature). Obsidian import (file copy, not headline). Entry-to-file export. Setup wizard includes vault folder selection.*
*v4.2: CEO Session #3 — Two-product architecture (Kaivoo Productivity + Kaivoo Orchestrator). Concierge scope boundary (productivity helper vs. builder). Modular toggle architecture (settings-driven module activation). Productization requirement (clean templates, no Kaivoo-specific content in shipped specs). Orchestrator as addon/integration for SMBs. Solo Builder target customer added. Phase B split into Orchestrator + Flow Cloud sections. Seven new research parcels assigned (messaging channel, agent productization, Solo Builder market, remote execution security, Orchestrator pricing, template design, multi-model overhead).*
*v4.1: CEO Session #2 — Concierge Identity & Soul (naming, hatching, soul file). Concierge-as-Builder (personal customization Phase B, marketplace creation Phase C). 1st-party modules as marketplace templates (Page + Today Widget format). Phase B concierge-led onboarding wizard. New research parcels: marketplace model analysis (Agent 8), sandboxed module runtime (Agent 3).*
*v4.0: CEO Session strategic pivot — Two-phase revenue strategy (Phase A: $249 productivity app, Phase B: Flow cloud subscription). New core principles: "Guided, not open-ended" and "Progressive autonomy." Autonomy Ladder (manual → concierge → autonomous). SMB focus, enterprise language dropped. White-label architecture. Skills/integration architecture elevated. Research parcels assigned. Competitive edge articulated.*
*v3.7: Sprint 18 — Search + Calendar Week View + Keyboard Shortcuts. Phase 1 ~100%*
*v3.6: Sprint 17 — Routines & Habits shipped*
*v3.5: Sprint 16 — Calendar redesign*
*v3.4: Sprint 14 — Project Notes, UX polish*
*v3.3: Sprint 12 — Design Agent split, code quality verified*
*v3.2: Sprint 7 — Supabase cloud migration*
*v3.0: Platform pivot — modular architecture, Command Space as foundation*
