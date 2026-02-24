# The Soul (User Memory) — Detailed Design

**Source:** Extracted from Agent 3 System Architect spec, Section 9 (The Soul)
**Parent:** [Agent-3-System-Architect.md](../Agent-3-System-Architect.md)

---

## Purpose

The Soul is a persistent memory file that gives the Concierge context about who it's talking to. It is **not** a conversation log — it's a living document that captures the essence of the user's personality, preferences, goals, and communication style.

## File Format

```markdown
<!-- .kaivoo/soul.md -->
---
last_updated: 2026-02-20
update_frequency: weekly
---

# Soul — User Profile

## Identity
- Name: [User's name]
- Role: Founder, designer, builder
- Companies: Kaivoo, NUWAVE

## Communication Style
- Prefers direct, concise responses
- Likes when ideas are organized visually (tables, diagrams)
- Values honesty over politeness — "tell me if my idea is bad"
- Tends to think big picture first, then zoom into details
- Sometimes rambles when brainstorming — help focus the ideas

## Goals (Current)
- Build Kaivoo Hub into a self-hosted personal OS
- Launch NUWAVE marketing platform
- Establish daily journaling + routine tracking habit
- Read 24 books this year

## Working Style
- Most productive in the morning
- Prefers async work — don't assume urgency
- Uses multiple AI tools and expects them to work together
- Values ownership and self-sovereignty over convenience

## Struggles
- Tendency to scope-creep — help keep focus tight
- Sometimes needs help prioritizing between competing projects
- Can get stuck in planning mode — gently push toward execution

## Preferences
- Dark mode preferred
- Prefers Markdown for documents
- Brands he cares about: Kaivoo, NUWAVE
- AI preferences: Claude for complex reasoning, GPT for creativity,
  Local LLM for quick/cheap tasks
```

## How the Soul Gets Updated

The Soul is NOT updated after every conversation. Updates happen:

1. **On user request:** "Update my soul file — I've shifted focus to X"
2. **Weekly auto-review:** The Concierge reviews the week's conversations and proposes updates. User approves before changes are written.
3. **Manual editing:** User can open and edit `soul.md` directly like any file.

The Concierge reads `soul.md` at the start of each session. It's a small file (< 2KB) so it adds minimal context overhead.
