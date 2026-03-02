# The Concierge (AI Orchestration) — Detailed Design

**Source:** Extracted from Agent 3 System Architect spec, Section 6
**Parent:** [Agent-3-System-Architect.md](../Agent-3-System-Architect.md)

---

## 6.1 Architecture

```
USER MESSAGE
    │
    ▼
┌──────────────────────────────────────────────────────┐
│                 THE CONCIERGE                         │
│                                                      │
│  Runs on: Local LLM (Ollama/Llama 3) by default     │
│  Purpose: Understand intent → route to best agent    │
│                                                      │
│  Step 1: Parse user intent                           │
│  Step 2: Search .kaivoo/agents/ for best match       │
│  Step 3: Check if agent needs skills from            │
│          .kaivoo/skills/                             │
│  Step 4: Determine AI provider (agent preference     │
│          OR user override: "use Claude Opus")        │
│  Step 5: Search relevant repositories for context    │
│          (e.g., Brand Guidelines/ folder)            │
│  Step 6: Ask user for missing context                │
│  Step 7: Dispatch to agent with full context         │
│  Step 8: Relay results + save output to Vault        │
│  Step 9: Update conversation log                     │
│                                                      │
│  References: .kaivoo/soul.md for user personality    │
└──────────────────────────────────────────────────────┘
```

## 6.2 Agent File Format

```markdown
<!-- .kaivoo/agents/ppt-creator.md -->
---
name: PPT Creator
description: Creates professional PowerPoint presentations from source material
preferred_ai: claude/opus
fallback_ai: openai/gpt4o
skills_required: [web-scraping, file-management]
input_types: [url, text, file-reference]
output_type: pptx
output_folder: Agent Workspace/Design Agent
ask_for_location: true
ask_for_tags: true
ask_for_brand: true
brand_search_folder: Brand Guidelines
---

# PPT Creator Agent

## Role
You are a professional presentation designer. You create clear,
visually structured PowerPoint presentations from source material.

## Process
1. Receive source material (URL, text, or file reference)
2. If URL: use the web-scraping skill to extract content
3. If brand guidelines provided: apply brand colors and style
4. Analyze and structure the content into slides
5. Generate the PPT
6. Save to output folder, creating a contextual subfolder if needed
7. Apply relevant tags based on content analysis

## Output Organization
When no specific save location is given:
- Create a subfolder in your output folder named after the brand/project
- Name the file descriptively based on content
- Auto-tag with relevant keywords from the content

## Required Context (ask via Concierge if not provided)
- Target audience
- Desired slide count (suggest a default based on content)
- Brand guidelines to use (search Brand Guidelines/ folder)
- File format (PDF, PPTX, or both)
```

## 6.3 Skill File Format

```markdown
<!-- .kaivoo/skills/web-scraping.md -->
---
name: Web Scraping
description: Extract content from websites for analysis
type: tool
endpoint: /api/skills/web-scrape
parameters:
  - name: url
    type: string
    required: true
  - name: depth
    type: number
    default: 1
    description: How many pages deep to crawl
  - name: extract_images
    type: boolean
    default: false
  - name: output_format
    type: string
    default: markdown
    options: [markdown, json, text]
---

# Web Scraping Skill

Fetches web page content and returns structured text.
Strips ads, navigation, and boilerplate. Returns main content body.
Can crawl multiple pages at specified depth.
```

## 6.4 Complete Use Case Walkthrough

```
USER:  "Hey, can you scrape the data from https://example.com/security
        and create a ppt for NUWAVE?"

CONCIERGE (internal reasoning):
  → Intent: Create a presentation
  → Source: URL (https://example.com/security)
  → Brand: NUWAVE
  → Best agent: ppt-creator (matches "create PPT")
  → Agent needs: web-scraping skill ✓
  → Agent config says: ask_for_brand = true
  → Search Brand Guidelines/ folder for "NUWAVE"
  → Found: Brand Guidelines/NUWAVE/NUWAVE-Brand-Guide.md
  → Agent config says: ask_for_location = false (no specific request)
  → Output folder: Agent Workspace/Design Agent/
  → AI provider: claude/opus (agent preference)
  → Missing: format, slide count, audience

CONCIERGE → USER:
  "Got it! I'll have the PPT Creator handle this using Claude Opus.
   I found your NUWAVE Brand Guidelines — want me to use those?
   A couple quick questions:
   1. Format — PPT, PDF, or both?
   2. Any specific slide count?
   3. Who's the audience?"

USER:  "PPT would be great. 10ish slides. Internal team."

CONCIERGE → PPT CREATOR AGENT (via Claude Opus):
  - Source content: [scraped text from URL]
  - Brand guidelines: [NUWAVE-Brand-Guide.md content]
  - Format: PPTX
  - Slides: ~10
  - Audience: Internal team
  - Save to: Agent Workspace/Design Agent/

PPT CREATOR (internal reasoning):
  → Content is about security practices
  → Create subfolder: "NUWAVE Design/"
  → Filename: "Security Practices Overview.pptx"
  → Tags: #nuwave #security #presentation #internal

PPT CREATOR → CONCIERGE:
  { status: "complete",
    file: "Agent Workspace/Design Agent/NUWAVE Design/Security Practices Overview.pptx",
    slides: 10,
    tags: ["nuwave", "security", "presentation", "internal"] }

CONCIERGE → USER:
  "All done! Created a 10-slide PPT using your NUWAVE brand guidelines.

   📄 Security Practices Overview.pptx
   📁 Agent Workspace/Design Agent/NUWAVE Design/
   🏷️ #nuwave #security #presentation #internal

   [Open File] [Preview] [Move to Different Folder] [Edit Tags]"
```

## 6.5 AI Provider Configuration

```json
// .kaivoo/ai-providers.json
{
  "providers": {
    "claude": {
      "api_key": "sk-ant-...",
      "models": {
        "opus": "claude-opus-4-20250514",
        "sonnet": "claude-sonnet-4-20250514",
        "haiku": "claude-3-5-haiku-20241022"
      }
    },
    "openai": {
      "api_key": "sk-...",
      "models": {
        "gpt4o": "gpt-4o",
        "gpt4o-mini": "gpt-4o-mini"
      }
    },
    "gemini": {
      "api_key": "AIza...",
      "models": {
        "pro": "gemini-2.0-pro",
        "flash": "gemini-2.0-flash"
      }
    },
    "local": {
      "type": "ollama",
      "endpoint": "http://localhost:11434",
      "models": {
        "llama3": "llama3:8b",
        "mistral": "mistral:latest",
        "codellama": "codellama:latest"
      }
    }
  },
  "defaults": {
    "concierge": "local/llama3",
    "journal_analysis": "openai/gpt4o",
    "heavy_tasks": "claude/opus",
    "quick_tasks": "openai/gpt4o-mini",
    "auto_tagging": "local/llama3",
    "text_extraction": "local/llama3"
  }
}
```

## 6.6 Conversation Persistence

Conversations are saved as .md files in `.kaivoo/conversations/`:

```markdown
<!-- .kaivoo/conversations/2026-02-20-nuwave-ppt.md -->
---
date: 2026-02-20T15:30:00
participants: [user, concierge, ppt-creator]
ai_provider: claude/opus
output_files:
  - Agent Workspace/Design Agent/NUWAVE Design/Security Practices Overview.pptx
tags: [nuwave, security, ppt]
---

**User:** Hey, can you scrape the data from https://example.com/security
and create a ppt for NUWAVE?

**Concierge:** Got it! I'll have the PPT Creator handle this using Claude Opus.
I found your NUWAVE Brand Guidelines — want me to use those?
...

**User:** PPT would be great. 10ish slides. Internal team.

**Concierge:** All done! Created a 10-slide PPT...
```

**Important:** The Concierge does NOT automatically search conversation history. It only searches when the user explicitly references a past conversation ("remember that PPT we made?"). This keeps the Concierge fast and focused.
