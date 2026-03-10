# Next Sprint Planning

**Updated:** March 9, 2026
**Last completed:** Sprint 32 (Knowledge Unification)
**Current sprint:** Sprint 33 (Bug Bash) — IN PROGRESS
**Source:** CEO Session #13, V1 Launch Definition, OpenClaw market research, Sprint 32 deferred items, CEO Session #14 (timeline adjustment)
**Launch date:** April 16, 2026

---

## V1 Launch Plan — 5 Weeks to Ship

**Two parallel tracks running simultaneously:**
- **Dev Track** (Dev Director) — Engineering sprints, feature delivery, quality gates
- **Marketing Track** (Marketing Director) — Audience building, content, distribution

**Scope is LOCKED. No new features until post-launch. If it's not on this plan, it's post-launch.**

---

## Week 1: Foundation + Marketing Infrastructure (Mar 9-15)

### Dev Track (~8 sprints)

#### Sprint 33: Bug Bash (Scoped Down)
**Theme:** Fix user-facing bugs. Clean first impression. No vault overhaul.
**Branch:** `sprint/33-bug-bash-vault` (reuse existing)

| Parcel | Description | Agent |
|---|---|---|
| P1 | Fix HTML rendering throughout app | Agent 2 |
| P2 | Fix Kanban board — all states functional | Agent 2 |
| P3 | Wiki-link rendering as clickable links | Agent 2 |
| P4 | Library sidebar icon → Folder | Agent 2 |
| P5 | Hide Gantt chart until Phase B | Agent 2 |
| P6 | Remove hardcoded seed data from useKaivooStore | Agent 2 |
| P7 | `to_tsquery` special character sanitization | Agent 2 |
| P8 | Dead code + floating-point fix in compressImage | Agent 2 |
| P9 | Add `.env` to `.gitignore` | Agent 2 |

**Cut from original Sprint 33:** Vault architecture overhaul (P6-P9 original), topic/project color pickers (P11), settings audit (P12), dark mode contrast (P13), AI toggle removal (P10), inbox rename (P9). These are post-launch.

#### Sprint 34: Full-Page AI Chat + Conversation History
**Theme:** Give the concierge a real home.

| Parcel | Description | Agent |
|---|---|---|
| P1 | `/chat` route — full-page chat interface | Agent 2 |
| P2 | Conversation list sidebar (navigate, search, delete, rename) | Agent 2 |
| P3 | Persistent conversation storage (SQLite) | Agent 2 |
| P4 | Model/provider selector accessible from chat | Agent 2 |
| P5 | Keep floating button as quick-access, "Open full chat" links to `/chat` | Agent 2 |

#### Sprint 35-36: Fix Execution Tools + Data Awareness
**Theme:** Make the AI DO things, not just talk.

| Parcel | Description | Agent |
|---|---|---|
| P1 | Debug & fix top 7 execution tools end-to-end | Agent 2 |
| P2 | Expand prompt context: 7-day task window, upcoming deadlines, recent notes | Agent 2 |
| P3 | Ensure tool schemas work across all 8 providers | Agent 2, Agent 3 |
| P4 | Wire up AI data awareness — query tasks, notes, projects | Agent 2 |

**Top 7 tools (priority order):** Create task, update task, summarize journal, draft project brief, auto-file capture, calendar awareness, morning briefing.

#### Sprint 37: Configurable Heartbeat
**Theme:** Proactive AI — the concierge acts without being asked.

| Parcel | Description | Agent |
|---|---|---|
| P1 | Background timer (Tauri process) with configurable interval | Agent 2, Agent 3 |
| P2 | Settings UI: frequency (morning only, evening summary, every N hours, custom, off) | Agent 2 |
| P3 | Heartbeat reads tasks, calendar, journal, soul file → surfaces proactive insights | Agent 2 |
| P4 | Notification when heartbeat finds something actionable | Agent 2 |

#### Sprint 38: Neuron Memory V1
**Theme:** Structured memory that doesn't bloat.

| Parcel | Description | Agent |
|---|---|---|
| P1 | Tiered soul file structure: Core Identity + Active Context + Episodic Memory | Agent 2, Agent 3 |
| P2 | Memory consolidation during heartbeat (dedup, summarize, prune, promote) | Agent 2 |
| P3 | Context-aware memory loading (~3500 token budget per interaction) | Agent 2 |
| P4 | Migration: existing flat soul file → tiered structure | Agent 2 |

### Marketing Track (Parallel)

#### Days 1-2 (Mar 9-10): Infrastructure Setup
- [ ] Kit account created + email capture wired to landing page (PRIORITY — no lost signups)
- [ ] TikTok account created + profile/branding set up
- [ ] YouTube channel created + branding
- [ ] Office recording setup (lighting, camera angle, background)
- [ ] Twitter/X account active (text-only posts can start immediately)

#### Days 3-7 (Mar 11-15): Content Launch
- [ ] Landing page email capture verified end-to-end (test signup → Kit confirmation)
- [ ] Landing page countdown updated to April 16
- [ ] First 2-3 TikTok/YouTube shorts recorded and posted
- [ ] First Twitter/X threads posted
- [ ] Reddit: first posts in r/selfhosted, r/ObsidianMD, r/LocalLLaMA, r/artificial
- [ ] Discord server created with basic channels

---

## Week 2: Orchestrator UI (Mar 16-22)

### Dev Track (~7 sprints)

#### Sprint 39-40: Orchestrator Page — Agents Tab
**Theme:** Users define their own AI agents.

| Parcel | Description | Agent |
|---|---|---|
| P1 | `/orchestrator` route with tabbed layout (Agents, Skills, Workflows, MCPs) | Agent 2 |
| P2 | Agents CRUD: name, role description (markdown), model assignment, avatar/icon | Agent 2 |
| P3 | Agent permissions: data access scope, action permissions | Agent 2, Agent 4 |
| P4 | Pre-loaded starter agents: Researcher, Writer, Engineer, Reviewer, Designer | Agent 2 |
| P5 | Agent persistence (SQLite + Supabase adapter) | Agent 2, Agent 12 |

#### Sprint 41-42: Skills Tab + AI Skill Creation
**Theme:** Modular capabilities — including AI-authored skills.

| Parcel | Description | Agent |
|---|---|---|
| P1 | Skills CRUD: name, description, trigger type, input/output, tool access | Agent 2 |
| P2 | Pre-loaded starter skills: Summarize, Draft, Research, Review, Create Artifact | Agent 2 |
| P3 | AI skill creation: user requests → concierge writes new skill file | Agent 2 |
| P4 | Skill permissions: read-only vs read-write capability declarations | Agent 2, Agent 4 |

#### Sprint 43-44: Workflows Tab + Trigger Config
**Theme:** Chain agents and skills into executable sequences.

| Parcel | Description | Agent |
|---|---|---|
| P1 | Workflow CRUD: name, description, ordered list of steps | Agent 2 |
| P2 | Step builder: each step = agent + skill + approval gate (yes/no) | Agent 2 |
| P3 | Trigger configuration: manual, scheduled (cron-style), event-based | Agent 2 |
| P4 | Workflow execution view: show each step, agent thinking, intermediate outputs | Agent 2 |

#### Sprint 45: MCPs Tab — Discover & Connect
**Theme:** Connect to the MCP ecosystem, don't reinvent it.

| Parcel | Description | Agent |
|---|---|---|
| P1 | MCP client protocol implementation in concierge | Agent 2, Agent 3 |
| P2 | Discover: AI-powered search of MCP registries/directories | Agent 2 |
| P3 | Connect: one-click connection with auth prompts, widget cards | Agent 2 |
| P4 | Built-in MCPs: File System, Flow Data (tasks, journal, calendar, vault) | Agent 2 |

### Marketing Track (Parallel)

- [ ] Content cadence established (3-4x/week TikTok, daily Twitter)
- [ ] Email welcome sequence drafted
- [ ] YouTube channel set up, first longer video
- [ ] Product Hunt page drafted
- [ ] LinkedIn presence started
- [ ] Discord growing

---

## Week 3: Execution Engine + Artifacts (Mar 23-29)

### Dev Track (~7 sprints)

#### Sprint 46-47: Workflow Execution Engine
**Theme:** The orchestrator actually runs workflows.

| Parcel | Description | Agent |
|---|---|---|
| P1 | Multi-model routing: send prompts to agent-assigned model via API | Agent 2, Agent 3 |
| P2 | Context passing between workflow steps (output of step N → input of step N+1) | Agent 2 |
| P3 | Approval gates: pause execution, show user intermediate result, wait for approve/redirect | Agent 2 |
| P4 | Action logging: full audit trail of every agent decision and tool call | Agent 2 |
| P5 | Rate limiting on API calls to prevent cost spikes | Agent 2, Agent 4 |

#### Sprint 48-49: Artifact Preview Panel
**Theme:** AI builds things you can see and keep.

| Parcel | Description | Agent |
|---|---|---|
| P1 | Split-pane layout: orchestrator/chat on left, artifact preview (iframe) on right | Agent 2 |
| P2 | Sandboxed iframe renders AI-generated HTML/CSS/JS | Agent 2 |
| P3 | Save artifact as custom widget: name, icon, description (template/guardrails) | Agent 2 |
| P4 | Custom Widgets library page: browse, toggle on/off, edit, delete | Agent 2 |
| P5 | Add custom widgets to Today page and project pages alongside built-in widgets | Agent 2 |
| P6 | Export/download artifacts to vault | Agent 2 |
| P7 | Edit artifacts via conversation ("change the colors", "add a filter") | Agent 2 |

#### Sprint 50: Safety Layer
**Theme:** Safe autonomy — what OpenClaw gets wrong, we get right.

| Parcel | Description | Agent |
|---|---|---|
| P1 | Confirmation gates on all destructive actions | Agent 2, Agent 4 |
| P2 | Skill-level permissions enforcement (read-only skills can't write) | Agent 2, Agent 4 |
| P3 | Workflow-level approval gates at user-defined steps | Agent 2 |
| P4 | Rollback capability on reversible actions | Agent 2 |
| P5 | Rate limiting UI (show token/API usage, warn on spikes) | Agent 2 |

#### Sprint 51: Thinking Transparency
**Theme:** Show users what their AI is thinking.

| Parcel | Description | Agent |
|---|---|---|
| P1 | Visible reasoning during workflow execution: what it read, decided, why | Agent 2 |
| P2 | Thinking view in heartbeat runs | Agent 2 |
| P3 | Action log page: full audit trail accessible in-app | Agent 2 |

### Marketing Track (Parallel)

- [ ] Demo videos of orchestrator (multi-agent workflows, artifact building)
- [ ] Early access invites sent to email list (beta testers)
- [ ] Discord growing with engaged early adopters
- [ ] Community feedback collected and shared with Dev Director

---

## Week 4: Polish + Beta (Mar 30 - Apr 5)

### Dev Track (~5 sprints)

#### Sprint 52-53: Integration Testing
**Theme:** Everything works together.

| Parcel | Description | Agent |
|---|---|---|
| P1 | Full workflow runs: agent → skill → artifact end-to-end | Agent 2 |
| P2 | Heartbeat + orchestrator integration: scheduled workflows trigger correctly | Agent 2 |
| P3 | Neuron memory under load: consolidation runs clean, no bloat | Agent 2 |
| P4 | MCP connections stable with built-in MCPs | Agent 2 |
| P5 | Cross-provider testing: workflows run correctly on Claude, Gemini, GPT | Agent 2 |

#### Sprint 54: Polish Pass
**Theme:** First impressions matter.

| Parcel | Description | Agent |
|---|---|---|
| P1 | UX refinement on orchestrator page (all 4 tabs) | Agent 2, Design Agents |
| P2 | Artifact preview panel polish | Agent 2 |
| P3 | Chat page polish | Agent 2 |
| P4 | Heartbeat notification UX | Agent 2 |

#### Sprint 55: Demo Scenarios
**Theme:** Build the launch demos.

| Parcel | Description | Agent |
|---|---|---|
| P1 | PPT creation workflow: Research → Outline → Write → Design → Artifact | Agent 2 |
| P2 | Morning briefing workflow: Heartbeat → Calendar + Tasks + Journal → Summary | Agent 2 |
| P3 | "Create a skill" workflow: User request → AI writes skill → Skill available | Agent 2 |
| P4 | "Build a widget" workflow: User request → AI generates artifact → Saved as custom widget | Agent 2 |

### Marketing Track (Parallel)

- [ ] Beta access opened to email list subscribers (5-7 days of real user testing)
- [ ] Product Hunt page finalized, supporters lined up
- [ ] Launch day social content pre-created
- [ ] Email blast sequence ready
- [ ] Demo video polished for launch
- [ ] Founding member pricing announced

---

## Week 5: Ship (Apr 6-15)

### Dev Track (~4 sprints)

#### Sprint 56: Bug Fixes from Beta
**Theme:** Real users found real bugs. Fix them.

#### Sprint 57: Ship Prep
**Theme:** Legal, signing, deploy.

| Parcel | Description | Agent |
|---|---|---|
| P1 | Code signing: Apple notarization (if cert resolves) | Agent 9 |
| P2 | EULA finalized | Agent 8 |
| P3 | Final deploy pipeline verification | Agent 9 |
| P4 | Web trial launch (no cert dependency) | Agent 2, Agent 9 |

#### Sprint 58: Launch Assets
**Theme:** Demo video, Product Hunt, final prep.

| Parcel | Description | Agent |
|---|---|---|
| P1 | Demo video showing orchestrator building a real artifact | Founder + Agent 2 |
| P2 | Product Hunt listing finalized | Marketing Director |
| P3 | Landing page updated with launch messaging | Sales Page Copywriter |

#### Sprint 59: Buffer
**Theme:** Whatever broke, whatever we missed.

### Marketing Track

- [ ] Final countdown content across all channels
- [ ] Beta tester quotes/testimonials collected
- [ ] Launch day coordination plan finalized (exact times, channels, sequence)
- [ ] Post-launch content plan ready (first week)

---

## April 16, 2026 — LAUNCH DAY (Thursday)

- Product Hunt launch
- Email blast to full list
- Social media push (all channels, coordinated timing)
- Web free trial live
- Desktop download available (if code signing resolves; web trial regardless)
- Founding member pricing active (first 100 signups)

---

## Post-Launch (Sprint 60+)

### From V1 "Does NOT Ship" List
| Item | Priority |
|---|---|
| Vault architecture overhaul (individual .md files, topic-based filing) | High |
| Dark mode contrast fixes | Medium |
| Remove AI features toggle | Low |
| Settings audit | Low |
| Topic/project color pickers | Low |
| Pages = Projects UX unification | Phase B |
| Gantt Chart upgrade (frappe-gantt) | Phase B |
| Calendar on Projects page | Phase B |
| Privacy toggle (hide from AI) | Phase B |
| Deep Insights/Analytics | Phase B |
| Custom Kanban states | Phase B |
| AI Chat: voice input, file attachments | Phase B |
| Mobile companion app | Phase B |
| Full MCP marketplace | Phase B |
| Self-building React components | Phase C |
| Multi-user/team features | Phase C |

### Concierge Memory Architecture (Remaining Layers)
| Layer | Status | Phase |
|---|---|---|
| Layer 1: Soul file (identity) | DONE | — |
| Layer 2: Working memory (per session) | DONE | — |
| Layer 3: Long-term memory | DONE | — |
| Layer 4: Pre-compaction flush | DONE (Sprint 30) | — |
| Layer 5: Hybrid search (vector + BM25 + temporal decay) | PLANNED | Phase B |
| Layer 6: Memory consolidation (full sleep cycle) | V1 basic, full in Phase B | Phase B |
| Layer 7: Coherence monitoring | DONE basic (Sprint 30), expand Phase B | Phase B |
| Neuron Memory V1 (tiers + basic consolidation) | IN PLAN (Sprint 38) | V1 |

---

*Next Sprint Planning — Updated March 9, 2026 — CEO Session #14: launch date moved to April 16 (Thursday). Marketing Week 1 split into infrastructure setup (Days 1-2) and content launch (Days 3-7). Extra 2 days added to Week 5 buffer/beta window. Dev track unchanged.*
