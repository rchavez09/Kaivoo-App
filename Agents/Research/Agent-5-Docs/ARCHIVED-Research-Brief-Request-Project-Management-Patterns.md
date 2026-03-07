# Research Brief Request: Project Management Patterns for Solo/Small-Team Productivity

**Date:** February 23, 2026
**Domain:** Domain 2 (Calendar & Time Management) + Domain 1 (PKM)
**Requested by:** Director (user ideation session)
**Priority:** High — blocks Projects data model design
**Assigned to:** Agent 5 (Research Analyst)

---

## Context

The user wants to evolve Kaivoo's flat task system into a hierarchical project management system. The proposed hierarchy is:

```
Topic (client/brand/life area — persists across time)
└── Project (scoped initiative with date range — has a start, has an end)
    └── Task (unit of work, tagged with hashtags)
        └── Subtask (granular steps)
```

Currently: Tasks can link to Topics and have Subtasks. There is no Project entity.

The user's primary use case is marketing campaign management (e.g., "Toll Ring Campaign" under the "NUWAVE" topic, containing Video, Design, and Social Media tasks, each with their own subtasks).

This research informs the data model, UI patterns, and scope decisions for the Projects feature.

---

## Questions to Answer

### 1. How do solo/small-team productivity tools implement Projects?

Research these tools specifically:

| Tool | Why |
|---|---|
| **Linear** | Best-in-class project/cycle management for small teams. How do they structure Project → Issue → Sub-issue? |
| **Asana** | Mature project system. How do Portfolios → Projects → Tasks → Subtasks work? What's overkill for solo users? |
| **Notion** | Database-driven projects. How do users build project management systems with databases + relations? What works, what breaks at scale? |
| **Monday.com** | Board → Group → Item hierarchy. How does the visual grouping work? |
| **Sunsama** | Task-centric with project grouping. How lightweight is their project concept? |
| **Todoist** | Projects as folders for tasks. Simple but limited — what do users outgrow? |
| **ClickUp** | Space → Folder → List → Task → Subtask. Most hierarchical — where does it become too much? |

For each, document:
- The hierarchy depth (how many levels?)
- How projects relate to timelines/dates (project start/end dates? milestone dates?)
- How tasks are created within projects (inline? separate page? templates?)
- What users praise and what they complain about (Reddit, community forums)
- Mobile experience — does the hierarchy work on small screens?

### 2. What's the right hierarchy depth for a solo user?

- Is 4 levels (Topic → Project → Task → Subtask) too deep?
- Do any tools successfully use a 4-level hierarchy without overwhelming solo users?
- What's the pattern for "progressive complexity" — simple by default, powerful when needed?
- How do tools handle the transition from "I just want a todo list" to "I need project management"?

### 3. Project Templates — What Works?

- How do tools implement reusable project templates?
- Can templates include pre-configured tasks, subtasks, relative due dates (e.g., "Task 1 due at project start + 7 days")?
- How do users create templates — from scratch, or "save current project as template"?
- What's the UX for applying a template? (Select template → customize → create)
- Are there community/marketplace template libraries? Do users actually use them?

### 4. Project Timelines — Visual Patterns

- How do tools visualize project timelines? (Gantt, timeline bars, calendar overlay?)
- What's the minimum viable timeline view? (just project bars? or tasks within projects too?)
- How do drag-and-resize interactions work on project/task date ranges?
- How do tools handle tasks without dates inside a project that has dates?
- Mobile timeline views — do any tools do this well?

### 5. Tags/Hashtags vs. Topics vs. Projects — How Do Others Handle Taxonomy?

- How do tools separate "categorization" (tags/labels) from "hierarchy" (projects/folders)?
- Is there a pattern where the parent entity (Project) carries the organizational context and the child entity (Task) carries lightweight labels/hashtags?
- How does Obsidian handle tags vs. folders vs. links? What can we learn for task organization?

---

## Deliverable

A research brief (per Agent 5 Output Format §10.1) with:
1. Comparison table of project hierarchies across tools
2. Recommended hierarchy depth for Kaivoo (with evidence)
3. Template system patterns (top 3 approaches with trade-offs)
4. Timeline visualization patterns (lightweight vs. full Gantt)
5. Tag vs. hierarchy taxonomy recommendations
6. Specific user quotes/complaints that validate or challenge the proposed approach

---

## How This Will Be Used

- **Agent 2 (Software Engineer):** Data model design for Projects entity
- **Agent 3 (System Architect):** Database schema, relationship design, migration from Topics-on-tasks
- **Design Agent:** UI patterns for project views, timeline, templates
- **Director:** Sprint scoping — how much of this fits in one sprint?

---

*Research Brief Request — Director v1.3 — February 23, 2026*
