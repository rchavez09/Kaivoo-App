# Next Sprint Planning

**Status:** Sprint 19 — awaiting planning
**Last Reset:** March 1, 2026 (CEO Sessions #1–3 strategic direction applied)

---

## CEO Strategic Brief — March 1, 2026 (Sessions #1–3)

**Context:** Three CEO sessions produced a two-product architecture. Vision.md updated to v4.2. All sprint work now operates under the Phase A mandate: **finish the productivity app and ship it as a $249 one-time purchase.** The Orchestrator (Product 2) is defined but does NOT enter sprint work until Phase A ships and generates revenue.

**Director action required:**
1. Read `Vision.md` v4.2 — two-product architecture, concierge scope boundary, modular toggle architecture, productization requirement
2. Prioritize Phase A pre-ship features (see below) over backlog items
3. Assign research parcels to Agents 3, 4, 5, and 8 (run in parallel with sprints — see Research Parcels in Vision.md)
4. Apply core principles ("Guided, not open-ended" + "Progressive autonomy") to all design and UX decisions
5. AI settings + BYO API key wizard must be architected with multi-model routing in mind — this is shared infrastructure with the Orchestrator, but only productivity concierge capabilities ship in Phase A

### CEO Session #3 — Key Decisions

**Two products, one platform:**
- **Product 1: Kaivoo Productivity** ($249) — the app we're shipping now
- **Product 2: Kaivoo Orchestrator** (premium subscription) — autonomous AI dev team, ships in Phase B
- Modules are toggleable in settings — productivity vs. builder surfaces

**Concierge scope for Phase A (productivity only):**
- Find notes, summarize content, add/complete tasks, add events, add context
- Trainable personality (hatching, soul file, tone preferences)
- Long-term memory stored in files, recall-only
- BYO API keys (Claude, ChatGPT, Llama, any provider)
- **Does NOT build things. Does NOT orchestrate sprints. Does NOT trigger code execution.**

**Productization requirement:**
- Before the Orchestrator ships, a productization sprint must clean all Kaivoo-specific content from agent specs, Vision template, Sprint Protocol
- Users get blank templates, not a clone of Kaivoo's roadmap
- This does NOT block Phase A — it's a Phase B prerequisite

**New research parcels assigned (parallel, not blocking):**
- Messaging channel evaluation (Agent 5) — Telegram viability for Orchestrator
- Agent system productization (Agent 3) — markdown specs → executable templates
- Solo Builder market validation (Agent 8) — is the market real?
- Remote execution security model (Agent 4) — text-triggered git ops security
- Orchestrator pricing (Agent 8) — subscription vs. usage-based
- Productization template design (Agent 3 + Agent 8) — blank-slate onboarding
- Multi-model orchestration overhead (Agent 5) — platform cost on top of user API costs

### Phase A Pre-Ship Features (CEO Priority Order)

These must be completed before the productivity app can be sold at $249.

| Feature | Priority | Notes |
|---|---|---|
| Topics page restructure | Must-have | Core UX must be solid before charging. Assess current pain points. |
| AI settings page + BYO API key wizard | Must-have | Choose provider, enter keys, test connection. This is the AI value prop. |
| AI chat concierge (in-app, productivity scope) | Must-have | Find notes, summarize, add tasks/events, add context. Trainable personality. Recall-only memory. Level 1 autonomy — responds when asked. Does NOT build or orchestrate. |
| Google Calendar integration (OAuth, two-way sync) | Must-have | Productivity app without calendar sync is incomplete. |
| Gmail integration (read, send, organize) | Must-have | Email is where half of business happens. |
| Local save / data export | Must-have | Table stakes for $249 one-time purchase. Users must own data on disk. |
| Setup wizard (first-run experience) | Must-have | Hosting choice, AI config, profile setup. Makes it feel like a real product. |
| License key system | Must-have | Activation, tier validation. Required for commercial distribution. |
| EULA / legal documentation | Must-have | Proprietary license. Agent 5 research parcel → attorney review. |
| Stripe integration (one-time payment) | Must-have | Payment flow for $249 purchase. |
| Landing page / marketing site | Must-have | Where people buy it. |
| Product Hunt launch | Must-have | Primary distribution channel for Phase A. |
| White-label config layer | Should-have | Logo, colors, app name as settings. Lightweight architectural foundation for Phase B. |
| Outlook integration | Should-have | Fast-follow after Google Calendar + Gmail proves the pattern. |
| Messaging app integration (Telegram) | Phase B | Orchestrator control surface. Research parcel assigned to Agent 5. |
| PWA (installable, offline read) | Should-have | Nice-to-have for Phase A, important for mobile use. |
| Desktop packaging (Electron or Tauri) | Should-have | Agent 9 to evaluate. Not blocking Phase A ship. |

### Research Parcels (Parallel — Not Blocking Sprints)

| Parcel | Owner | Deliverable |
|---|---|---|
| Token cost modeling | Agent 5 | Cost-per-user estimates at light/medium/heavy AI usage tiers |
| Competitive pricing teardown | Agent 8 | HubSpot, Monday, Notion, Asana pricing analysis |
| Addon pricing model | Agent 8 | Per-seat vs. per-workspace vs. usage-based with widget addon tiers |
| Legal / EULA research | Agent 5 | EULA template, redistribution terms, privacy policy framework |
| "One Workflow" positioning validation | Agent 8 | Name resonance, "replace your stack" messaging |

### New Core Principles to Apply

All design and UX decisions must now also consider:

- **Principle 9: Guided, not open-ended.** AI powers everything but users see specific actions, not blank prompts. Every widget defines its capability. No decision paralysis. The AI is the engine — the app is the car.
- **Principle 10: Progressive autonomy.** Start manual, graduate to assisted, evolve to autonomous. The AI earns trust by suggesting before it acts. Every suggestion teaches the user what's possible.

---

## Input Sources

### Sprint 18 Deferred Items
Source: `Sprints/Sprint-18-Search-Week-View.md` — Deferred to Sprint 19+

| Item | Category | Priority Estimate | Status |
|---|---|---|---|
| File attachments (search + upload) | Feature | Should-have (Phase A) | Backlog |
| "Don't Miss Twice" forgiveness (streak buffer) | Feature | P2 — nice-to-have | Backlog |
| Year in Pixels (annual heatmap) | Feature | P2 — nice-to-have | Backlog |
| AI "Organize My Day" | Feature | Feeds into AI concierge (Phase A) | Backlog |
| Filter/entity toggle system (Calendar + Timeline) | Feature | P2 | Backlog |
| Timed habits (4th type, requires timer UI) | Feature | P2 | Backlog |

### Ongoing Backlog
Source: Various sprints — carried forward

| Item | Category | Priority Estimate | Status |
|---|---|---|---|
| Habit categories (user-defined) | Feature | P2 | Backlog |
| Habit suggestions library | Feature | P2 | Backlog |
| Entry templates | Feature | P2 | Backlog |
| Notes rename tech debt (JournalEntry → NoteEntry) | Code Quality | Low | Backlog |
| Captures page deprecation (route + data cleanup) | Housekeeping | User deferred | Backlog |
| Project Milestones on timeline | Feature | P2 from Agent 11 | Backlog |
| Timeline task-level view | Feature | P2 from Agent 11 | Backlog |
| Project duplication | Feature | P3 from Agent 11 | Backlog |
| Dedicated Archive action | Feature | P3 from Agent 11 | Backlog |
| Automated design-lint CI step | DevOps | Medium | Backlog |
| Projects system — Topic → Project → Task → Subtask hierarchy | Feature | P2 — Phase B | Backlog |
| Project templates | Feature | P2 — Phase B | Backlog |
| Tasks Timeline view | Feature | P2 — Phase B | Backlog |
| Analytics & insights dashboard rebuild | Feature | P2 — Phase A or B | Backlog |
| Notifications & reminders | Feature | Should-have (Phase A) | Backlog |

### Sprint 18 Technical Debt
- WeekTimeline: tasks show as counts in headers but don't render as blocks in grid columns
- FTS headline delimiters (`**`) appear as raw text — could render as bold
- Cross-platform shortcut recording only captures for current platform

### Agent Docs to Scan for Sprint 19 Planning
- `Engineering/Agent-7-Docs/` — Bundle size standards (needs re-measurement), query/a11y/error standards
- `Quality/Agent-11-Docs/` — Feature Bibles (living contracts — load relevant Bible per sprint)
- `Design/Agent-Design-Docs/` — Design system, interaction patterns, use cases

---

## Director Session — Process Improvements (March 1, 2026)

These items are **pre-sprint infrastructure work** — done before Sprint 19 kicks off to ensure the team has the right tools and process for the remaining Phase A sprints.

### Completed (This Session)

| Item | Status | Details |
|---|---|---|
| `netlify.toml` created | DONE | Build config, SPA redirects, deploy previews enabled, branch deploys disabled |
| Sprint Protocol updated to v1.7 | DONE | Deploy preview sandbox, E2E testing gate, deployment pipeline docs, safety/rollback guarantees |
| `CLAUDE.md` updated | DONE | Deploy instructions reflect auto-deploy pipeline, new key rules for deploy previews and E2E |

### Pending — User Action Required

| Item | Action | Notes |
|---|---|---|
| Verify GitHub → Netlify integration | User checks Netlify dashboard | Connect `rchavez09/Kaivoo-App` if not already linked. Set production branch to `main`. Add env vars (`VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`). |
| Test auto-deploy pipeline | Push `netlify.toml` to main | Verify Netlify picks up the config and deploys. Do this before Sprint 19 starts. |
| Test deploy previews | Open a test PR | Verify Netlify generates a preview URL. Test from phone. |

### E2E Testing Strategy — Research Findings

**Source:** Agent 5 research brief on Gemini Pro browser testing (March 1, 2026)

**Key finding:** Gemini has no native browser control (Project Mariner is a research prototype, not a public API). The practical approach is **Gemini + Playwright**: Playwright drives the browser, Gemini provides the AI reasoning layer (decides what to click, what to verify, catches visual/UX issues).

**Recommended architecture — Hybrid approach:**

| Layer | Tool | Purpose | When |
|---|---|---|---|
| Layer 1: Traditional E2E | Playwright | Fast, deterministic tests for critical paths (login, CRUD, navigation) | Every PR — blocking |
| Layer 2: AI-driven E2E | Gemini 2.0 Flash + Playwright | Exploratory testing, visual regression, UX quality assessment | Deploy previews — advisory (blocking in Phase 4) |

**Recommended framework:** Stagehand (TypeScript, wraps Playwright, supports Gemini) or browser-use (Python, more mature).

**Cost:** ~$0.25–5/month at our scale (Gemini Flash is extremely cheap: $0.002–0.005 per test run).

**Setup plan:**
1. Add `e2e/` directory with Playwright config + AI agent orchestrator
2. Traditional Playwright tests for critical paths (auth, task CRUD, navigation)
3. AI agent tests receive markdown test plans derived from Feature Bible + sprint DoD
4. Tests run against Netlify deploy preview URLs (CI-compatible, headless Chromium)
5. Auth handled by injecting Supabase session into localStorage (no AI login needed)

**What this enables:**
- Tests that survive UI redesigns (AI finds elements by intent, not selectors)
- Visual/UX quality checks without reference screenshots
- Non-engineers (product, design agents) can write test plans in plain English
- Exploratory testing: "Navigate around the app and report anything broken"

### Agent Roster Changes

| Change | Details | Status |
|---|---|---|
| **Agent 10 — Activate** | QA Architect owns test strategy, E2E test plans, coordinates with E2E tester. Has been dormant since Sprint 4. | Ready to activate Sprint 19 |
| **Agent 9 — Activate** | DevOps Engineer owns deployment pipeline, Netlify config, CI/CD, Docker. Spec exists but nothing implemented. | Partially activated (netlify.toml done, more to come) |
| **Agent 13 — Propose** | E2E Tester. Gemini-powered browser testing agent. Receives test plans, runs against deploy preview URLs, produces pass/fail reports. | Spec needed — informed by research above |

### Sprint Protocol v1.7 Changes Summary

The Sprint Protocol has been updated with:
1. **Deploy preview sandbox** — Localhost replaced with Netlify deploy preview URLs (test from any device)
2. **E2E testing gate** — AI-powered E2E tester runs against preview URL before user sandbox review
3. **GitHub auto-deploy** — Merging PR to main auto-deploys to production, no manual deploy step
4. **Deployment pipeline docs** — New section documenting the full pipeline
5. **Safety guarantees** — Tags as rollback points, git revert for bad merges, deploy previews isolated from production, PR audit trail
6. **No manual deploys rule** — `NEVER manually deploy to Netlify` added to rules

---

*Template per Sprint Protocol v1.7 — Updated March 1, 2026 with CEO Strategic Briefs (Sessions #1–3) and Director Process Improvements*
