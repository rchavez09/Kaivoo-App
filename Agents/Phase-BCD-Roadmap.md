# Phase B/C/D — Future Roadmap

**Status:** PLANNED — begins after Phase A ships
**Updated:** March 6, 2026

This document contains the long-term vision, detailed architecture, and future phase milestones. Phase A execution lives in `Phase-A-Roadmap.md`.

---

## The North Star: Personal OS

The long-term vision is not a productivity app. It's a **personal operating system for the AI era** — the intelligent layer between you and your digital life.

### The Thesis

Apps are going away now that AI is here. MCP (Model Context Protocol) is where the market is going. If Kaivoo builds the first cross-platform MCP foundation layer, it becomes a massive disruptor.

The old system: you open Word and start typing. The new system: you see a document brief on your todos, click execute, the AI has all your notes and context, produces a high-quality brief, exports it to the correct project, and maybe sends it to the right person.

### Your Machine as a Server

Like Plex proved for media, your desktop can be your personal cloud:

**Mode A — Desktop is awake (Plex model):**
- Tauri app runs a lightweight local server
- Companion app connects over LAN or secure tunnel (Tailscale, Cloudflare Tunnel)
- Real-time access to all files — search, preview, open, interact

**Mode B — Desktop is asleep (Sync model):**
- Encrypted sync of metadata + recent files to cloud relay
- Companion app works offline with synced data
- Full files pulled on-demand when desktop wakes
- This is what the Web Access + Sync subscription pays for

The killer product is **both** — Mode A when your machine is reachable, Mode B as fallback. Users don't think about modes. It just works.

### The MCP Foundation Layer

1. **Indexes and understands everything on your machine** — files, notes, projects, calendar, media
2. **Exposes it all via MCP** so any AI can access it with user permission
3. **Orchestrates actions** — create docs, send emails, move files, notify people
4. **Syncs selectively to cloud** for mobile/always-on access
5. **Self-builds** — new pages, widgets, and capabilities through conversation

Nobody is building cross-platform, local-first, MCP-native, user-owned personal infrastructure with optional cloud. That's white space.

### Why Now

- Post-AI, people generate more local files than ever
- Cloud storage is expensive and fragmented
- Privacy is a buying trigger, not a niche
- MCP is early but growing fast — building the foundation now means being ready when the wave hits
- The Plex model is proven. Obsidian proved the appetite for local-first.

---

## The Concierge — Detailed Architecture

### Hatching

During first-run setup (Phase A wizard) and account creation (Phase B), users "hatch" their concierge — choosing a name, communication style, and preferences.

**Phase A hatching:** Part of the setup wizard. Name your concierge, choose a tone. Lightweight, warm, memorable. **(DONE — Sprint 23)**

**Phase B hatching:** Extended onboarding wizard. Concierge leads a guided tour — "I'm [name], and here's what we can do together." Stays in line with "guided, not open-ended."

### The Soul File

A lightweight, persistent memory layer for personality and continuity:
- User's name and preferences
- Concierge name and personality settings
- Communication style
- Patterns observed over time
- Things the user asked it to remember

Readable, editable by the user (Core Principle #2). Grows naturally through use. A few KB of structured data, not an embedding store.

### 7-Layer Memory Architecture

The concierge's memory is Kaivoo's competitive moat. Architecture follows a **cortex/hippocampus split** — unbounded long-term storage, lean compiled snapshot per session.

**Principle:** "The memory is in the data. The model is just the reader." Swap the AI provider, keep the memory, continuity persists.

#### Layer 1: Soul File (Identity — always loaded)
Core personality and preferences. A few KB. **Deterministic injection** — compiled from stored data, never AI-generated. **(DONE — Sprint 24)**

#### Layer 2: Working Memory (Session context)
Lean snapshot assembled at session start. Discarded and rebuilt each session. **(DONE — Sprint 24)**

#### Layer 3: Long-Term Memory (Fact store)
Full `ai_memories` table. Can grow to thousands of entries. **(DONE — Sprint 24)**

#### Layer 4: Pre-Compaction Flush
Before context truncation, concierge writes lasting notes to memory. **(MVP — Sprint 29)**

#### Layer 5: Hybrid Memory Search (Phase B)
- Semantic search (vector similarity)
- Keyword search (BM25/FTS)
- Weighted hybrid merge (default 70/30 semantic/keyword)
- Temporal decay — newer memories score higher
- Diversity re-ranking

#### Layer 6: Memory Consolidation (Phase B — "Sleep Cycle")
Between sessions, offline process consolidates conversation logs into long-term memory. Runs on cloud infrastructure (Tier 2 feature).

#### Layer 7: Coherence Monitoring (Phase B)
Detect within-session drift via behavioral signals. Silent re-anchor injection. **(Basic version in MVP — Sprint 29)**

#### Revenue Alignment

| Memory Layer | Tier 1 (Desktop $49/$99) | Tier 2 (Web Access + Sync) |
|---|---|---|
| Soul file (identity) | Included | Included |
| Working memory | Included | Included |
| Long-term memory | Included (keyword search) | Included (hybrid search) |
| Pre-compaction flush | Included | Included |
| Hybrid memory search | — | Included |
| Memory consolidation | — | Included |
| Coherence monitoring | Basic | Advanced |

### Concierge Scope Boundary

**Productivity Concierge (Phase A):**
- Full tool-use agent — 18 tools for tasks, journal, calendar, captures, etc.
- BYO API keys — any provider
- Security guardrails: confirmation for destructive actions, audit trail
- **It helps you execute your day. It does not build software.**

**Orchestrator Concierge (Phase B):**
- Everything above, plus sprint orchestration, agent coordination, build pipeline
- Companion app messaging — same brain, same memory
- Multi-model routing across roles
- Remote-triggered code execution with security gates
- **It builds things for you.**

### One Brain, Many Surfaces

Same concierge, same soul, same memory — **separate conversation threads** with **shared context**. Desktop chat and companion chat are separate threads. One brain, many mouths.

**Why we own the channel:** No third-party API dependencies. Full UX control. Native context access. Privacy — conversations never touch external platforms.

### The Companion App

Stripped-down mobile version: concierge chat, today view, quick capture, notifications. Not a full port. Requires Tier 2 subscription (needs cloud sync).

---

## Modular Toggle Architecture

Productivity and builder modules are **settings-driven toggles**:
- **Productivity modules:** Journal, Tasks, Projects, Calendar, Routines, Captures, Email
- **Builder modules:** Sprint Dashboard, Agent Roster, Sandbox, Deployment Status
- **Full Stack:** Toggle everything on

### 1st-Party Modules & Marketplace

Every module follows the **Page + Today Widget** pattern. 1st-party modules serve as marketplace templates.

---

## Productization Requirement

Both products ship as **clean template systems**. No Kaivoo-specific content in user-facing specs. Productization sprint required before Orchestrator ships.

---

## Platform Vision

### Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                     KAIVOO PERSONAL OS                       │
│                                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐     │
│  │Marketing │  │  Sales   │  │  Doc     │  │  User-   │     │
│  │  Tools   │  │Dashboard │  │  Mgmt    │  │  Built   │     │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘     │
│       └──────────────┴──────────────┴──────────────┘         │
│                          │                                   │
│  ┌─────────────────────────────────────────────────────┐     │
│  │       AI CONCIERGE + SELF-BUILDER                   │     │
│  │  Routes tasks · Suggests · Executes · Builds new    │     │
│  └─────────────────────────────────────────────────────┘     │
│                          │                                   │
│  ┌─────────────────────────────────────────────────────┐     │
│  │       MCP FOUNDATION LAYER                          │     │
│  │  Local file index · Cross-device access · Protocol  │     │
│  └─────────────────────────────────────────────────────┘     │
│                          │                                   │
│  ┌─────────────────────────────────────────────────────┐     │
│  │       INTEGRATIONS & SKILLS LAYER                   │     │
│  │  Gmail · Calendar · Slack/Teams · Skills Store      │     │
│  └─────────────────────────────────────────────────────┘     │
│                          │                                   │
│  ┌─────────────────────────────────────────────────────┐     │
│  │       SYNC & ACCESS LAYER                           │     │
│  │  Local server (Mode A) · Cloud sync (Mode B)        │     │
│  │  Desktop ↔ Mobile companion · Encrypted relay       │     │
│  └─────────────────────────────────────────────────────┘     │
│                          │                                   │
│  ┌─────────────────────────────────────────────────────┐     │
│  │       CORE FOUNDATION (Command Space)               │     │
│  │  Journal · Todos · Calendar · Captures · Vault      │     │
│  │  Theming · White-Label Config · Auth · Data Layer   │     │
│  │  SQLite (local) · Supabase (cloud)                  │     │
│  └─────────────────────────────────────────────────────┘     │
└──────────────────────────────────────────────────────────────┘
```

### Intelligent Capability Boundaries

The concierge is self-aware about what it can and can't do. Partial help when possible, silence when appropriate. This behavior is core to trust.

### Customization & White-Labeling

Every instance can be branded. Logo, colors, app name — stored as settings.
- **Phase A:** Settings-driven branding config (lightweight)
- **Phase B:** Full white-label capabilities

### Concierge-as-Builder

- **Phase B (personal):** "Add a field to my Captures for priority level." Concierge modifies the user's instance through conversation.
- **Phase C (marketplace):** Users package concierge-built creations and sell them.
- **Phase D (self-building):** "I wish we had an app for tracking invoices." The concierge builds entirely new capabilities.

---

## Phase B: Cloud Platform + Orchestrator
*Two revenue streams: Web Access subscriptions + Orchestrator for builders. ARR engine. Target $1M.*

### Orchestrator (Product 2)

| Milestone | Status |
|---|---|
| Productize agent system — markdown specs → executable templates | PLANNED |
| Orchestrator dashboard — sprint completions, sandbox, deploy status | PLANNED |
| Multi-model routing engine — assign models to roles, cost tracking | PLANNED |
| Companion app concierge — same brain/memory, remote task execution | PLANNED |
| Exec approval system — confirmation flows, unique approval IDs, timeouts | PLANNED |
| "New Project" wizard — concierge generates Vision + first sprint | PLANNED |
| Productization sprint — clean templates, blank-slate onboarding | PLANNED |
| Security model — auth for remote execution, blast-radius controls | PLANNED |
| Orchestrator-as-addon — toggle for existing productivity users | PLANNED |
| Orchestrator subscription billing — premium pricing, Stripe recurring | PLANNED |

### Cloud Platform

| Milestone | Status |
|---|---|
| Companion App — concierge chat, today view, quick capture, notifications | PLANNED |
| Hybrid memory search — vector + BM25 + temporal decay | PLANNED |
| Memory consolidation (sleep cycle) | PLANNED |
| Advanced coherence monitoring | PLANNED |
| Context assembly interface — pluggable `assembleConciergeContext()` | PLANNED |
| Shared notes, tasks, calendars — collaboration foundation | PLANNED |
| Role-based access — admin / manager / member | PLANNED |
| AI Concierge Level 2 — proactive suggestions | PLANNED |
| Skills & integration architecture — plugin API, module SDK | PLANNED |
| Integration: Slack/Teams | PLANNED |
| Marketing widget, Sales dashboard, Document management | PLANNED |
| RAG + semantic search | PLANNED |
| Journal AI analysis | PLANNED |
| Subscription billing — Stripe recurring | PLANNED |
| Monitoring & observability | PLANNED |

## Phase C: Platform & Marketplace

| Milestone | Status |
|---|---|
| Skills store & marketplace | PLANNED |
| Module SDK — Page + Today Widget packaging format | PLANNED |
| Concierge-as-Builder (marketplace) — publish and sell creations | PLANNED |
| Revenue sharing — creators earn, Kaivoo earns commission | PLANNED |
| AI Concierge Level 3 — autonomous operation | PLANNED |
| Full white-label Workshop | PLANNED |
| Business Hub (multi-user, roles, team vaults) | PLANNED |

## Phase D: MCP Foundation & Personal OS

| Milestone | Status |
|---|---|
| Local file indexing engine — all files, not just vault | PLANNED |
| MCP server layer — expose all data as MCP resources/tools | PLANNED |
| MCP-native architecture — every feature as MCP tool first | PLANNED |
| Cross-device MCP over secure tunnel | PLANNED |
| Local server mode (Mode A) — HTTP/WebSocket server | PLANNED |
| Secure tunnel integration (Tailscale, Cloudflare, libp2p) | PLANNED |
| Cloud relay mode (Mode B) — encrypted sync to Supabase | PLANNED |
| Selective sync protocol | PLANNED |
| AI Concierge Level 4 — self-building | PLANNED |
| Sandboxed page builder | PLANNED |
| Flow automation engine | PLANNED |
| Universal file search | PLANNED |
| File type handlers (PPT, video, PDF, spreadsheets) | PLANNED |
| Desktop widget system — system tray, always-on | PLANNED |
| Voice interface | PLANNED |

---

## Phase B Target Metrics

| Metric | Target |
|---|---|
| Monthly Recurring Revenue (MRR) | $83K ($1M ARR) |
| Customer Acquisition Cost (CAC) | < $50 |
| Monthly Churn Rate | < 5% |
| Lifetime Value (LTV) | > $400 |
| LTV:CAC Ratio | > 3:1 |
| Net Promoter Score (NPS) | > 50 |

## The $1M Target

| Scenario | Tier 1 One-Time | Tier 2+ Subscriptions | Timeline |
|---|---|---|---|
| Conservative | 2,000 founding ($98K) | + subscription ARR | 24-30 months |
| Moderate | 3,500 founding ($172K) | + subscription ARR | 18-24 months |
| Aggressive | 5,000+ founding ($245K+) | + subscription ARR | 12-18 months |

---

*Phase B/C/D Roadmap — Created March 6, 2026 — Extracted from Vision v7.1 during CEO Session #8 restructure.*
