# The Workshop (Developer Mode) — Detailed Design

**Source:** Extracted from Agent 3 System Architect spec, Section 8
**Parent:** [Agent-3-System-Architect.md](../Agent-3-System-Architect.md)

---

## 8.1 Purpose

The Workshop is Kaivoo Hub's self-extension system. It allows the user — or the AI — to build new capabilities directly from within the app, without ever opening a code editor or terminal. Crucially, **it is completely unrestricted**. You are not limited to just building plugins; you can use the Workshop to fundamentally alter the Hub's core source code and architecture.

The key innovation: **the Concierge can use the Workshop to build things it doesn't know how to do yet, up to and including rewriting its own core logic.** If a user asks for a feature that doesn't exist, the Concierge triggers a Research → Plan → Approve → Build → Deploy pipeline. You can also connect external developer agents (like Claude Code, Codex, or Antigravity) directly into this mode to work alongside you as unrestricted co-pilots.

## 8.2 What Can Be Built

| Buildable | What It Is | Stored At |
|-----------|-----------|----------|
| **Core Architecture** | The Hub's own source code | `~/Kaivoo-Server/` (The actual app directory) |
| **External Agents** | Connect Claude Code, Codex, etc. | `.kaivoo/dev-agents/` |
| **Agents** | New AI agent definitions | `.kaivoo/agents/new-agent.md` |
| **Skills** | New capabilities agents can use | `.kaivoo/skills/new-skill.md` + optional script |
| **Widgets** | New Dashboard cards (React components) | `.kaivoo/plugins/widgets/widget-name/` |
| **MCPs** | Model Context Protocol tool servers | `.kaivoo/plugins/mcps/mcp-name/` |
| **Integrations** | External service connectors (API configs) | `.kaivoo/plugins/integrations/service.json` |
| **Templates** | Journal, folder, or document templates | Anywhere in vault as `.md` |
| **Routing Rules** | Concierge routing preferences | `.kaivoo/routing-rules.json` |
| **Theme Overrides** | Custom CSS, layout tweaks | `.kaivoo/theme/overrides.css` |

## 8.3 The Research → Plan → Approve → Build → Deploy Pipeline

When the user asks for something that doesn't exist:

```
USER REQUEST
    │
    ▼
CONCIERGE recognizes: "I can't do this yet"
    │
    ▼
┌──────────────────────────────────────────────┐
│  STEP 1: RESEARCH                            │
│  Concierge dispatches Research Agent          │
│  • Web search for best approaches             │
│  • Review existing skills/agents for overlap  │
│  • Evaluate complexity and requirements       │
│  • Identify npm packages, APIs, patterns      │
│  AI Provider: local LLM (cheap) or user pref  │
└──────────────────┬───────────────────────────┘
                   │
                   ▼
┌──────────────────────────────────────────────┐
│  STEP 2: PLAN                                │
│  Research Agent returns findings              │
│  Concierge creates a build plan:              │
│  • What to build (widget? MCP? skill?)        │
│  • Which approach (API vs scraping vs ...)    │
│  • What dependencies are needed               │
│  • Estimated complexity                       │
│  • Alternative approaches with trade-offs     │
└──────────────────┬───────────────────────────┘
                   │
                   ▼
┌──────────────────────────────────────────────┐
│  STEP 3: APPROVE                             │
│  Concierge presents plan to USER             │
│  User can:                                   │
│  • ✅ Approve as-is                           │
│  • ✏️ Modify the plan                         │
│  • ❌ Cancel                                  │
│  • 🔄 Ask for different approach              │
└──────────────────┬───────────────────────────┘
                   │ (user approves)
                   ▼
┌──────────────────────────────────────────────┐
│  STEP 4: BUILD                               │
│  Concierge dispatches Builder Agent           │
│  Builder uses preferred heavy AI (Claude Opus)│
│  • Creates all required files                 │
│  • Installs npm dependencies if needed        │
│  • Writes manifest.json for plugins           │
│  • Creates README documentation               │
│  AI Provider: claude/opus (complex code gen)  │
└──────────────────┬───────────────────────────┘
                   │
                   ▼
┌──────────────────────────────────────────────┐
│  STEP 5: DEPLOY                              │
│  Hub server detects new plugin files          │
│  • Validates manifest                         │
│  • Registers in registry.json                 │
│  • Hot-reloads widget/MCP/skill               │
│  • Notifies all connected clients via WS      │
│  • Logs build in build-log.json               │
│  New capability is LIVE                       │
└──────────────────────────────────────────────┘
```

## 8.4 Complete Use Case: Twitter Reel Widget

```
USER: "Hey, I really like this Twitter scraper that pulls top performing
       X posts. Can we replicate something like this in our dashboard
       and add a blog-like reel widget that I can swipe through?"

CONCIERGE (thinking):
  → No existing agent/skill/widget for Twitter/X data
  → This requires building something new
  → Activate: Research Agent

CONCIERGE → USER:
  "I don't know how to do that yet — but I'll figure it out.
   Let me have the Research Agent look into the best approach.
   I'll come back with a plan for your review."

─── Research Agent runs (local LLM or GPT-4o-mini) ───

CONCIERGE → USER:
  "Here's what the Research Agent found:

   APPROACH A: Twitter/X API (Official)
   • Requires X Developer account ($100/mo basic tier)
   • Rate limited to 10,000 tweets/month
   • Clean, reliable, TOS-compliant
   • Pulls: likes, retweets, impressions, engagement rate

   APPROACH B: RSS + Nitter Scraping (No API key)
   • Free, no API key needed
   • Less data (no impression/engagement metrics)
   • May break if Nitter goes down

   RECOMMENDATION: Approach A for real analytics.
   Approach B for a quick prototype.

   The build would involve:
   1. A new MCP tool server: 'twitter-scraper'
   2. A new Skill: 'fetch-top-tweets'
   3. A new Dashboard Widget: 'Twitter Reel'

   Estimated build: ~2 hours of agent work.
   Would you like me to execute? You can modify the plan first."

USER: "Let's go with Approach A. I have an X developer account.
       Make the widget swipeable — vertical cards like Reels."

CONCIERGE → BUILDER AGENT (via Claude Opus):
  Build plan dispatched with full context.

BUILDER AGENT creates:
  .kaivoo/plugins/mcps/twitter-scraper/
    ├── manifest.json
    ├── server.ts        ← MCP server connecting to X API
    └── README.md

  .kaivoo/skills/fetch-top-tweets.md
    ← Skill definition pointing to MCP endpoint

  .kaivoo/plugins/widgets/twitter-reel/
    ├── manifest.json
    ├── index.tsx        ← React component with swipeable cards
    ├── styles.css       ← Kaivoo-themed styling
    └── README.md

HUB SERVER:
  → Detects new files via chokidar
  → Validates manifests
  → Registers in registry.json
  → Hot-reloads plugin system
  → Broadcasts 'plugin:installed' via WebSocket

CONCIERGE → USER:
  "All done! Here's what was built:

   ✅ MCP: twitter-scraper (connects to X API)
   ✅ Skill: fetch-top-tweets
   ✅ Widget: Twitter Reel (swipeable vertical cards)

   I need your X API key to activate the scraper.
   Go to Settings → Integrations → Twitter/X to add it.

   The widget is available in your Dashboard now.
   Click [+ Add Widget] → 'Twitter Reel'.

   [Preview Widget] [Add to Dashboard] [View Source Code]"
```

## 8.5 Plugin Architecture

### Widget Manifest
```json
{
  "id": "twitter-reel",
  "name": "Twitter Reel",
  "description": "Swipeable feed of top-performing X posts",
  "version": "1.0.0",
  "author": "builder-agent",
  "created": "2026-02-21T00:00:00Z",
  "category": "social",
  "size": ["medium", "large"],
  "requires": ["twitter-scraper"],
  "settings": {
    "username": { "type": "string", "label": "X Username" },
    "count": { "type": "number", "label": "Posts to show", "default": 10 },
    "timeframe": { "type": "select", "options": ["24h", "7d", "30d"], "default": "7d" }
  }
}
```

### MCP Server Manifest
```json
{
  "id": "twitter-scraper",
  "name": "Twitter/X Scraper",
  "description": "Fetches tweets and engagement data from X API",
  "version": "1.0.0",
  "author": "builder-agent",
  "transport": "stdio",
  "entry": "server.ts",
  "requires_keys": ["twitter_api_key", "twitter_api_secret"],
  "tools": [
    {
      "name": "fetch_top_tweets",
      "description": "Fetch top performing tweets for a username",
      "parameters": {
        "username": "string",
        "count": "number",
        "timeframe": "string"
      }
    }
  ]
}
```

### Plugin Registry
```json
// .kaivoo/plugins/registry.json
{
  "widgets": [
    { "id": "twitter-reel", "path": "widgets/twitter-reel", "active": true },
    { "id": "github-activity", "path": "widgets/github-activity", "active": true }
  ],
  "mcps": [
    { "id": "twitter-scraper", "path": "mcps/twitter-scraper", "active": true }
  ],
  "integrations": [
    { "id": "twitter", "path": "integrations/twitter.json", "active": false }
  ]
}
```

## 8.6 Developer Mode UI

When Developer Mode is toggled on in Settings, the app reveals additional panels:

```
┌─────────────────────────────────────────────────────────────────┐
│  🔧 DEVELOPER MODE                                    [ON/OFF]  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  AGENTS                          SKILLS                         │
│  ├── ppt-creator         [Edit]  ├── web-scraping       [Edit]  │
│  ├── journal-analyst     [Edit]  ├── pdf-generation     [Edit]  │
│  ├── web-researcher      [Edit]  ├── fetch-top-tweets   [Edit]  │
│  ├── research-agent      [Edit]  └── [+ New Skill]              │
│  ├── builder-agent       [Edit]                                 │
│  └── [+ New Agent]                                              │
│                                                                 │
│  WIDGETS (Plugins)               MCPs (Tool Servers)            │
│  ├── Twitter Reel ✅     [Edit]  ├── twitter-scraper ✅ [Edit]  │
│  ├── GitHub Activity ✅  [Edit]  ├── web-scraper ✅     [Edit]  │
│  └── [+ New Widget]              └── [+ New MCP]                │
│                                                                 │
│  INTEGRATIONS                    SYSTEM                         │
│  ├── Twitter/X 🔴 (needs key)   ├── Hub Source Code   [Edit]   │
│  ├── Google Calendar ✅          ├── Deep Edit Mode    [Terminal]│
│  └── [+ New Integration]         ├── Connect Claude Code [Sync] │
│                                  ├── Build Log         [View]   │
│                                                                 │
│  BUILD LOG (recent)                                             │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ Feb 21, 00:15  Builder Agent  Twitter Reel widget  ✅   │    │
│  │ Feb 21, 00:12  Research Agent X API research       ✅   │    │
│  │ Feb 20, 23:45  User           journal-analyst edit ✅   │    │
│  │ Feb 20, 22:00  Builder Agent  web-scraper MCP      ✅   │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                [View Full Log]  │
│                                                                 │
│  [+ Build Something New]  — Describe what you want, AI builds   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

Each item's [Edit] button opens the source file (.md for agents/skills, .tsx for widgets, .ts for MCPs) in a built-in code/markdown editor. Changes are hot-reloaded.

## 8.7 Approval Gates (Safety)

Since the Workshop gives AI the ability to create code that runs on the Hub, clear safety levels are enforced:

```
APPROVAL LEVELS:

Level 0 — AUTO (no approval needed):
  • Creating/editing .md files (agents, skills, docs)
  • Updating routing rules or soul.md
  • Creating folder structures
  • Modifying templates

Level 1 — REVIEW PLAN (approve before build starts):
  • Creating new widgets (React components)
  • Creating new MCP servers (Node.js code)
  • Adding new npm dependencies
  • Creating new integrations

Level 2 — REVIEW CODE (approve before deploy):
  • Any code that runs server-side
  • Any code that makes external API calls
  • Any code that accesses the file system beyond the vault
  • Any changes to Hub server configuration
  • Any code that installs system-level dependencies

USER CONTROLS (in Settings → Developer Mode):
  ○ Auto-approve Level 0         [ON by default]
  ○ Auto-approve Level 1         [OFF by default]
  ○ Always review code (Level 2) [ON by default, cannot be disabled]
  ○ Require confirmation for npm install  [ON by default]
```

### Rollback

Every Workshop build is logged in `.kaivoo/build-log.json` with:
- What was created/modified
- Who initiated it (user or which agent)
- Timestamp
- Snapshot of previous state

```json
// .kaivoo/build-log.json (excerpt)
[
  {
    "id": "build-001",
    "timestamp": "2026-02-21T00:15:00Z",
    "initiated_by": "builder-agent",
    "requested_by": "user",
    "action": "create",
    "items": [
      "plugins/widgets/twitter-reel/manifest.json",
      "plugins/widgets/twitter-reel/index.tsx",
      "plugins/widgets/twitter-reel/styles.css",
      "plugins/mcps/twitter-scraper/manifest.json",
      "plugins/mcps/twitter-scraper/server.ts",
      "skills/fetch-top-tweets.md"
    ],
    "status": "deployed",
    "rollback_available": true
  }
]
```

User can rollback any build from the Build Log, which removes all created files and unregisters the plugin from the registry.

## 8.8 Workshop API Endpoints

```
GET    /api/workshop/plugins              → List all plugins (widgets, MCPs, integrations)
GET    /api/workshop/plugin/:id           → Plugin details + source files
POST   /api/workshop/plugin               → Create/install plugin
PUT    /api/workshop/plugin/:id           → Update plugin files
DELETE /api/workshop/plugin/:id           → Uninstall plugin
POST   /api/workshop/plugin/:id/toggle    → Enable/disable plugin

GET    /api/workshop/agents               → List agent definitions
GET    /api/workshop/agent/:name          → Read agent .md file
PUT    /api/workshop/agent/:name          → Update agent .md file
POST   /api/workshop/agent               → Create new agent
DELETE /api/workshop/agent/:name          → Delete agent

GET    /api/workshop/skills               → List skill definitions
GET    /api/workshop/skill/:name          → Read skill .md file
PUT    /api/workshop/skill/:name          → Update skill .md file
POST   /api/workshop/skill               → Create new skill
DELETE /api/workshop/skill/:name          → Delete skill

GET    /api/workshop/build-log            → Build history
POST   /api/workshop/build-log/:id/rollback → Rollback a build

POST   /api/workshop/build               → Trigger Research→Plan→Build pipeline
  Body: { description: string, preferences?: object }
  Response: SSE stream of pipeline progress
```

## 8.9 Unrestricted External Agents (Claude Code / Codex)

Because the Hub enables unrestricted access to its own architecture, you can connect dedicated developer agents directly to the Workshop.

Instead of just using the Concierge's internal `Builder Agent`, you can map a local terminal connection to tools like **Claude Code**, **Codex**, or **Antigravity**.

When connected, these external agents have:
- Full read/write access to the Hub's core source directories (Node.js backend, React frontend).
- The ability to execute terminal commands (e.g., `npm install`, `git commit`).
- A live chat interface within the Developer Mode UI that functions like a terminal integrated directly into your Kaivoo dashboard.

**Example Use Case:**
You open Developer Mode and click `[Connect Claude Code]`. A terminal-like chat window appears.
"Hey, I want to rip out the default TipTap markdown editor we currently use for the Journal, and replace it with a custom block-based editor similar to Notion. Please restructure the React components in the core app and update the database schema if needed."

The external agent begins working on the core app's source code, completely bypassing the plugin system, giving you limitless control over the platform's evolution.
