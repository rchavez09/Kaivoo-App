# V1 Launch Checklist — Daily Tracker

**Launch Date:** April 14, 2026
**Start Date:** March 9, 2026
**Tracks:** Dev (engineering) + Marketing (distribution) running in parallel

---

## WEEK 1 — Foundation + Marketing Launch (Mar 9-15)

### Day 1 — Sunday, March 9
**Dev:**
- [ ] Sprint 33 P1: Fix HTML rendering throughout app
- [ ] Sprint 33 P2: Fix Kanban board — all states functional
- [ ] Sprint 33 P9: Add `.env` to `.gitignore`

**Marketing:**
- [ ] Choose landing page tool (Framer, Carrd, or custom)
- [ ] Draft landing page copy: headline, subhead, email capture, countdown to April 14
- [ ] Create TikTok account (if not existing)
- [ ] Script first TikTok/short: "Your AI has a memory. You've never read it."

### Day 2 — Monday, March 10
**Dev:**
- [ ] Sprint 33 P3: Wiki-link rendering as clickable links
- [ ] Sprint 33 P4: Library sidebar icon → Folder
- [ ] Sprint 33 P5: Hide Gantt chart

**Marketing:**
- [ ] Landing page LIVE with email capture + countdown
- [ ] Record and post first TikTok/YouTube short
- [ ] Create Twitter/X account or activate existing — first thread posted
- [ ] Create Discord server with channels: #general, #feedback, #announcements

### Day 3 — Tuesday, March 11
**Dev:**
- [ ] Sprint 33 P6: Remove hardcoded seed data from useKaivooStore
- [ ] Sprint 33 P7: `to_tsquery` special character sanitization
- [ ] Sprint 33 P8: Dead code + floating-point fix in compressImage
- [ ] Sprint 33 quality gates: lint, typecheck, test, build
- [ ] Sprint 33 PR opened → merge to main

**Marketing:**
- [ ] Post in r/selfhosted (authentic, not promotional)
- [ ] Post in r/ObsidianMD (discuss local-first AI, not product pitch)
- [ ] Second TikTok/short recorded and posted

### Day 4 — Wednesday, March 12
**Dev:**
- [ ] Sprint 34 P1: `/chat` route — full-page chat interface
- [ ] Sprint 34 P2: Conversation list sidebar (navigate, search, delete, rename)
- [ ] Sprint 34 P3: Persistent conversation storage (SQLite)

**Marketing:**
- [ ] Twitter/X thread: "I'm building OpenClaw for people who don't code"
- [ ] Reddit: post in r/LocalLLaMA or r/artificial
- [ ] Third TikTok/short

### Day 5 — Thursday, March 13
**Dev:**
- [ ] Sprint 34 P4-P5: Model selector + floating button "Open full chat" link
- [ ] Sprint 34 PR → merge
- [ ] Sprint 35 start: Begin debugging top execution tools

**Marketing:**
- [ ] LinkedIn post: founder story / build journey
- [ ] Engage with comments on all platforms (respond to everyone)
- [ ] Check email signup count — note baseline

### Day 6 — Friday, March 14
**Dev:**
- [ ] Sprint 35-36: Fix top 7 execution tools (create task, update task, summarize journal, draft project brief, auto-file capture, calendar awareness, morning briefing)
- [ ] Wire up AI data awareness — 7-day task window, upcoming deadlines, recent notes

**Marketing:**
- [ ] Fourth TikTok/short: "I built an app using the app's own AI agent system"
- [ ] Email welcome sequence drafted (3 emails: welcome, what's coming, launch day)
- [ ] Week 1 metrics snapshot: signups, followers, views

### Day 7 — Saturday, March 15
**Dev:**
- [ ] Sprint 35-36 continued: Ensure tool schemas work across providers
- [ ] Sprint 35-36 PR → merge
- [ ] Sprint 37 start: Configurable Heartbeat — background timer + settings UI

**Marketing:**
- [ ] Post build journey content (screenshot of sprint history, commit graph)
- [ ] Respond to all DMs/comments from the week

### Week 1 Checkpoint
| Metric | Target | Actual |
|---|---|---|
| Sprints completed | 33, 34, 35-36 started | |
| Landing page live | Yes | |
| Email signups | 25+ | |
| Content pieces posted | 5+ | |
| Discord created | Yes | |
| Platforms active | TikTok, Twitter, Reddit, Discord | |

---

## WEEK 2 — Orchestrator UI (Mar 16-22)

### Day 8 — Sunday, March 16
**Dev:**
- [ ] Sprint 37: Heartbeat — settings UI (frequency: morning, evening, custom interval, off)
- [ ] Sprint 37: Heartbeat reads tasks, calendar, journal, soul file → insights
- [ ] Sprint 37: Notification when heartbeat finds something actionable

**Marketing:**
- [ ] TikTok/short: Demo the heartbeat — "My AI woke up before me"
- [ ] YouTube: first longer video (3-5 min) — product vision or build journey

### Day 9 — Monday, March 17
**Dev:**
- [ ] Sprint 37 PR → merge
- [ ] Sprint 38: Neuron Memory — tiered soul file structure (Core Identity + Active Context + Episodic)
- [ ] Sprint 38: Context-aware memory loading (~3500 token budget)

**Marketing:**
- [ ] Content: "The soul file bloat problem and how we solved it"
- [ ] Reddit: engage in AI memory/agent discussion threads
- [ ] Check and respond to all community engagement

### Day 10 — Tuesday, March 18
**Dev:**
- [ ] Sprint 38: Memory consolidation during heartbeat (dedup, summarize, prune, promote)
- [ ] Sprint 38: Migration — flat soul file → tiered structure
- [ ] Sprint 38 PR → merge

**Marketing:**
- [ ] TikTok/short: "Here's what my AI remembers about me — and I can edit every word"
- [ ] Product Hunt page drafted (don't publish yet)
- [ ] Email to list: "Here's what we're building" update

### Day 11 — Wednesday, March 19
**Dev:**
- [ ] Sprint 39-40: Orchestrator page — `/orchestrator` route with tabbed layout
- [ ] Sprint 39-40: Agents tab — CRUD, model assignment, avatar/icon
- [ ] Sprint 39-40: Agent permissions — data access scope, action permissions

**Marketing:**
- [ ] Content: "Why AI agents need permissions — the OpenClaw security lesson"
- [ ] LinkedIn: share a specific insight from building
- [ ] Engage with new Discord members

### Day 12 — Thursday, March 20
**Dev:**
- [ ] Sprint 39-40: Pre-loaded starter agents (Researcher, Writer, Engineer, Reviewer, Designer)
- [ ] Sprint 39-40: Agent persistence (SQLite + Supabase adapter)
- [ ] Sprint 39-40 PR → merge

**Marketing:**
- [ ] TikTok/short: Show the Agents tab — "Meet my AI team"
- [ ] Twitter thread: breakdown of the agent system architecture
- [ ] Check email signup growth

### Day 13 — Friday, March 21
**Dev:**
- [ ] Sprint 41-42: Skills tab — CRUD, trigger types, input/output, tool access
- [ ] Sprint 41-42: Pre-loaded starter skills (Summarize, Draft, Research, Review, Create Artifact)
- [ ] Sprint 41-42: AI skill creation — user requests → concierge writes new skill

**Marketing:**
- [ ] Content: "I asked my AI to learn a new skill. It wrote the skill file itself."
- [ ] Reddit: post showing the skill creation flow
- [ ] Week 2 metrics snapshot

### Day 14 — Saturday, March 22
**Dev:**
- [ ] Sprint 41-42: Skill permissions (read-only vs read-write)
- [ ] Sprint 41-42 PR → merge
- [ ] Sprint 43-44 start: Workflows tab

**Marketing:**
- [ ] YouTube: longer demo video of Agents + Skills in action
- [ ] Respond to all community feedback from the week

### Week 2 Checkpoint
| Metric | Target | Actual |
|---|---|---|
| Sprints completed | 37, 38, 39-40, 41-42 | |
| Heartbeat working | Yes | |
| Neuron Memory working | Yes | |
| Orchestrator: Agents tab | Done | |
| Orchestrator: Skills tab | Done | |
| Email signups | 100+ | |
| Content pieces posted | 12+ total | |
| Discord members | 25+ | |

---

## WEEK 3 — Execution Engine + Artifacts (Mar 23-29)

### Day 15 — Sunday, March 23
**Dev:**
- [ ] Sprint 43-44: Workflows tab — CRUD, ordered step builder (agent + skill + gate)
- [ ] Sprint 43-44: Trigger configuration (manual, scheduled, event-based)

**Marketing:**
- [ ] TikTok/short: "Watch me build a workflow with 3 AI agents"
- [ ] Community engagement — respond to everyone

### Day 16 — Monday, March 24
**Dev:**
- [ ] Sprint 43-44: Workflow execution view — show each step, thinking, intermediate outputs
- [ ] Sprint 43-44 PR → merge
- [ ] Sprint 45: MCPs tab — MCP client protocol implementation

**Marketing:**
- [ ] Content: "The difference between MCPs and integrations — and why it matters"
- [ ] Email to list: sneak peek of the orchestrator

### Day 17 — Tuesday, March 25
**Dev:**
- [ ] Sprint 45: Discover (AI search of MCP registries) + Connect (one-click + auth)
- [ ] Sprint 45: Built-in MCPs: File System + Flow Data
- [ ] Sprint 45 PR → merge

**Marketing:**
- [ ] TikTok/short: "My AI found and connected an MCP in 30 seconds"
- [ ] Post in relevant MCP/AI communities
- [ ] LinkedIn update on progress

### Day 18 — Wednesday, March 26
**Dev:**
- [ ] Sprint 46-47: Workflow execution engine — multi-model routing
- [ ] Sprint 46-47: Context passing between workflow steps
- [ ] Sprint 46-47: Approval gates — pause, show result, wait for approve/redirect

**Marketing:**
- [ ] Record demo: PPT creation using Researcher → Writer → Designer agents
- [ ] Twitter thread: "Here's what multi-model routing actually looks like"

### Day 19 — Thursday, March 27
**Dev:**
- [ ] Sprint 46-47: Action logging (full audit trail) + rate limiting
- [ ] Sprint 46-47 PR → merge
- [ ] Sprint 48-49 start: Artifact preview panel — split-pane layout + iframe sandbox

**Marketing:**
- [ ] TikTok/short: "My AI built this presentation using 3 agents"
- [ ] Early access signup form added to landing page ("Get beta access")
- [ ] Check email signups

### Day 20 — Friday, March 28
**Dev:**
- [ ] Sprint 48-49: Save artifact as custom widget (name, icon, description)
- [ ] Sprint 48-49: Custom Widgets library page (browse, toggle, edit, delete)
- [ ] Sprint 48-49: Add custom widgets to Today page + project pages

**Marketing:**
- [ ] Content: "Self-building software — how my app creates its own widgets"
- [ ] Email to list: "Beta access opening next week"
- [ ] Week 3 metrics snapshot

### Day 21 — Saturday, March 29
**Dev:**
- [ ] Sprint 48-49: Export/download artifacts to vault + edit via conversation
- [ ] Sprint 48-49 PR → merge
- [ ] Sprint 50 start: Safety layer — confirmation gates, permissions

**Marketing:**
- [ ] YouTube: full orchestrator demo (5-7 min) — workflows + artifacts + MCPs
- [ ] Respond to all community engagement

### Week 3 Checkpoint
| Metric | Target | Actual |
|---|---|---|
| Sprints completed | 43-44, 45, 46-47, 48-49 | |
| Orchestrator: Workflows tab | Done | |
| Orchestrator: MCPs tab | Done | |
| Workflow execution engine | Working | |
| Artifact system | Working | |
| Email signups | 200+ | |
| Content pieces posted | 20+ total | |
| Discord members | 50+ | |
| Demo videos recorded | 2+ | |

---

## WEEK 4 — Polish + Beta (Mar 30 - Apr 5)

### Day 22 — Sunday, March 30
**Dev:**
- [ ] Sprint 50: Safety layer — skill permissions enforcement, workflow approval gates
- [ ] Sprint 50: Rollback capability + rate limiting UI

**Marketing:**
- [ ] Send beta invites to email list (first 25-50 signups)
- [ ] TikTok/short: "Safe AI autonomy — why guardrails matter"

### Day 23 — Monday, March 31
**Dev:**
- [ ] Sprint 50 PR → merge
- [ ] Sprint 51: Thinking transparency — visible reasoning in workflows + heartbeat
- [ ] Sprint 51: Action log page — full audit trail

**Marketing:**
- [ ] Content: "Every AI decision my app makes is logged and visible"
- [ ] Collect first beta tester feedback

### Day 24 — Tuesday, April 1
**Dev:**
- [ ] Sprint 51 PR → merge
- [ ] Sprint 52-53: Integration testing — full workflow runs end-to-end
- [ ] Sprint 52-53: Heartbeat + orchestrator integration

**Marketing:**
- [ ] Email beta testers: "What's working? What's broken?"
- [ ] Product Hunt page finalized (still not launched)
- [ ] Line up 10+ Product Hunt supporters

### Day 25 — Wednesday, April 2
**Dev:**
- [ ] Sprint 52-53: Neuron memory under load, cross-provider testing
- [ ] Sprint 52-53 PR → merge

**Marketing:**
- [ ] TikTok/short: beta tester reaction or quote
- [ ] Founding member pricing announced on landing page
- [ ] Twitter: "2 weeks to launch" countdown

### Day 26 — Thursday, April 3
**Dev:**
- [ ] Sprint 54: Polish pass — UX refinement on orchestrator, chat, heartbeat, artifact panel
- [ ] Sprint 54: Design agent review on key surfaces

**Marketing:**
- [ ] Launch day social content pre-created (all platforms)
- [ ] Email blast sequence finalized (announcement → reminder → launch day)
- [ ] Collect beta tester testimonials/quotes

### Day 27 — Friday, April 4
**Dev:**
- [ ] Sprint 54 PR → merge
- [ ] Sprint 55: Build demo scenarios — PPT workflow, morning briefing, skill creation, widget build

**Marketing:**
- [ ] Record the launch demo video (the one that goes everywhere)
- [ ] LinkedIn: "11 days to launch" with founder reflection
- [ ] Week 4 metrics snapshot

### Day 28 — Saturday, April 5
**Dev:**
- [ ] Sprint 55: All 4 demo scenarios working and recorded
- [ ] Sprint 55 PR → merge

**Marketing:**
- [ ] Polish demo video
- [ ] Pre-schedule launch day posts (all platforms)
- [ ] Discord: "Launch week starts Monday" announcement

### Week 4 Checkpoint
| Metric | Target | Actual |
|---|---|---|
| Sprints completed | 50, 51, 52-53, 54, 55 | |
| Safety layer | Done | |
| Thinking transparency | Done | |
| Integration tests | Passing | |
| Demo scenarios | 4 working | |
| Beta testers active | 10+ | |
| Beta bugs reported | Tracked | |
| Email signups | 350+ | |
| Content pieces posted | 30+ total | |
| Discord members | 75+ | |
| Demo video recorded | Yes | |

---

## WEEK 5 — Ship (Apr 6-13)

### Day 29 — Sunday, April 6
**Dev:**
- [ ] Sprint 56: Bug fixes from beta feedback (prioritize by severity)

**Marketing:**
- [ ] "One week to launch" content across all platforms
- [ ] Final email list check — warm up the list

### Day 30 — Monday, April 7
**Dev:**
- [ ] Sprint 56 continued: Critical beta bugs fixed
- [ ] Sprint 56 PR → merge

**Marketing:**
- [ ] TikTok/short: "7 days until launch"
- [ ] Share demo video teaser (30-second clip)

### Day 31 — Tuesday, April 8
**Dev:**
- [ ] Sprint 57: Code signing (Apple notarization if cert resolves)
- [ ] Sprint 57: EULA finalized

**Marketing:**
- [ ] Twitter: "6 days" countdown with feature highlight
- [ ] Engage with all comments and DMs

### Day 32 — Wednesday, April 9
**Dev:**
- [ ] Sprint 57: Final deploy pipeline verification
- [ ] Sprint 57: Web trial deployment tested end-to-end
- [ ] Sprint 57 PR → merge

**Marketing:**
- [ ] Email to list: "5 days to launch — here's what you're getting"
- [ ] TikTok/short: Behind-the-scenes of final prep

### Day 33 — Thursday, April 10
**Dev:**
- [ ] Sprint 58: Demo video finalized (orchestrator building a real artifact)
- [ ] Sprint 58: Product Hunt listing finalized
- [ ] Sprint 58: Landing page updated with launch messaging

**Marketing:**
- [ ] Product Hunt "coming soon" page goes live
- [ ] Discord: "4 days — get ready" with demo video
- [ ] Pre-schedule ALL launch day posts

### Day 34 — Friday, April 11
**Dev:**
- [ ] Sprint 59: Buffer — fix whatever broke, final smoke test

**Marketing:**
- [ ] "3 days" countdown
- [ ] Confirm all launch day sequences are ready
- [ ] Final email blast ready to send

### Day 35 — Saturday, April 12
**Dev:**
- [ ] Final smoke test: all features work, demo scenarios run clean
- [ ] Web trial URL confirmed working
- [ ] Desktop download link ready (if code signing resolved)

**Marketing:**
- [ ] "2 days" content
- [ ] Rest. Seriously. Rest before launch day.

### Day 36 — Sunday, April 13
**Dev:**
- [ ] FREEZE. No code changes. Everything deployed and tested.

**Marketing:**
- [ ] "Tomorrow" post across all platforms
- [ ] Final Discord message: "Launch day is tomorrow"
- [ ] Email: "We launch tomorrow — here's what to expect"
- [ ] Sleep early. Tomorrow is the day.

---

## DAY 37 — Monday, April 14 — LAUNCH DAY

### Morning (6-8 AM)
- [ ] Product Hunt listing goes LIVE
- [ ] Email blast sent: "We're live"
- [ ] Twitter/X announcement thread posted
- [ ] LinkedIn launch post published
- [ ] Discord: "WE'RE LIVE" announcement with links

### Midday (10 AM - 12 PM)
- [ ] TikTok launch video posted
- [ ] YouTube launch video posted
- [ ] Reddit posts in target communities (r/selfhosted, r/productivity, r/artificial)
- [ ] Respond to EVERY Product Hunt comment
- [ ] Respond to EVERY social media comment
- [ ] Monitor for critical bugs — be ready to hotfix

### Afternoon (2-5 PM)
- [ ] Second wave social posts (behind-the-scenes, reactions, stats)
- [ ] Continue responding to all comments
- [ ] Track metrics: signups, downloads, Product Hunt ranking
- [ ] Email list: "Thank you" to early supporters

### Evening
- [ ] Capture Day 1 metrics
- [ ] Celebrate. You shipped. Whatever happens next, you launched.

---

## Post-Launch (Apr 15+)
- [ ] Day 2 email: "Here's what people are saying"
- [ ] Collect user feedback systematically
- [ ] Prioritize post-launch bug fixes
- [ ] Plan Sprint 60+ based on real user data
- [ ] Keep content cadence (don't go silent after launch)
- [ ] Start planning Phase B based on what you learned

---

## Running Metrics Tracker

| Metric | Week 1 | Week 2 | Week 3 | Week 4 | Week 5 | Launch Day |
|---|---|---|---|---|---|---|
| Email signups | | | | | | |
| TikTok followers | | | | | | |
| YouTube subscribers | | | | | | |
| Twitter followers | | | | | | |
| Discord members | | | | | | |
| Content pieces (total) | | | | | | |
| Sprints completed | | | | | | |
| Beta testers | — | — | — | | | |
| Product Hunt upvotes | — | — | — | — | — | |
| Downloads/signups | — | — | — | — | — | |

---

*V1 Launch Checklist — Created March 8, 2026 — CEO Session #13. April 14 launch. Scope LOCKED.*
