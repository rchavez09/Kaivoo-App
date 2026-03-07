# Research Brief Request: Entity Relationship & Graph Patterns for AI-Searchable Connections

**Date:** February 23, 2026
**Domain:** Domain 1 (PKM) + Domain 5 (AI-Assisted Knowledge Work)
**Requested by:** Director (user ideation session)
**Priority:** Medium — informs Connected Context architecture and AI search optimization
**Assigned to:** Agent 5 (Research Analyst)

---

## Context

With the introduction of Projects, Kaivoo's entity graph becomes richer:

```
Topic ↔ Project ↔ Task ↔ Subtask
  ↕        ↕
Journal  Capture
Entry
```

The user specifically called out:
1. Wanting Obsidian-style "mind mapping" that helps connect the dots between entities
2. Wanting these connections to help the AI (Concierge) quickly sort and filter out irrelevant information when searching
3. A folder-structure approach that feels natural and scales

This research informs how we design the relationship layer between entities, both for human navigation (UI) and AI retrieval (vector search, context assembly).

---

## Questions to Answer

### 1. How Does Obsidian's Graph View Work?

- What types of connections does Obsidian track? (explicit links, backlinks, tags, folders)
- How is the graph rendered? (force-directed? hierarchical?)
- Do users actually use the graph view for discovery, or is it mostly a novelty?
- What are the most common Obsidian community plugins for connection discovery? (Dataview, Smart Connections, Graph Analysis)
- What do users say works and what doesn't at scale (1000+ notes)?

### 2. How Do Other Tools Handle Entity Connections?

| Tool | Connection Type | Research Focus |
|---|---|---|
| **Obsidian** | Bidirectional links, tags, folders | Graph view, backlinks panel, search |
| **Notion** | Database relations, rollups, backlinks | How relations between databases work; limits and frustrations |
| **Roam Research** | Bidirectional links, block references | The "networked thought" model — what survives contact with real usage? |
| **Logseq** | Bidirectional links, properties, queries | Graph + outliner hybrid — how do users navigate connections? |
| **Tana** | Supertags, fields, live searches | Structured + unstructured hybrid — interesting for AI retrieval |
| **Capacities** | Objects with typed relations | "Object-oriented" PKM — how does typing connections help or hurt? |

For each, document:
- How connections are created (explicit user action vs. automatic inference)
- How connections are surfaced in the UI (sidebar, graph, inline)
- How connections are queried (search, filters, graph traversal)
- User reception — what do power users love, what do casual users ignore?

### 3. Entity Relationships for AI Retrieval

This is the critical question for Kaivoo's Concierge (Phase 4):

- When the AI needs to answer "Show me everything about the Toll Ring Campaign," how should the data be structured for fast, accurate retrieval?
- **Explicit relations** (Project has Tasks, Task has Subtasks, Project belongs to Topic) vs. **implicit relations** (same-day heuristic, semantic similarity) — which tools use which, and what works better for AI?
- How do RAG pipelines handle hierarchical data? (Should a Project's embedding include its tasks? Should a task's context include its parent project?)
- How does Notion AI search across related databases? What patterns does it use?
- How does Obsidian's Smart Connections plugin work? (Embedding-based similarity across notes)

### 4. Folder Structure vs. Graph vs. Hybrid

- Obsidian lets you use folders AND links — which pattern do users prefer at scale?
- Notion's database approach: everything is a row in a database, related via properties — how does this feel for users coming from folder-based tools?
- Is there a best-practice pattern for: hierarchical organization (folders/projects) for humans + graph/embedding connections for AI?
- How do tools handle the "where does this belong?" problem when an entity relates to multiple parents? (e.g., a task relevant to two projects)

### 5. What Makes Connections Useful (Not Just Pretty)?

- What's the difference between tools where connections actually help users vs. tools where the graph view is just a cool screenshot?
- Research the "backlinks panel" pattern (Obsidian, Roam, Logseq) — how often do users act on backlink suggestions?
- What about "related items" suggestions? (e.g., "You wrote about this topic in your journal on Feb 15" shown alongside a task)
- How do users discover connections they didn't know about? (serendipitous discovery)

---

## Deliverable

A research brief (per Agent 5 Output Format §10.1) with:
1. Comparison table of connection models across tools (explicit vs. implicit, typed vs. untyped)
2. Recommendations for Kaivoo's entity relationship design (what to build first, what to defer)
3. AI retrieval patterns — how to structure hierarchical data for RAG/semantic search
4. Folder structure recommendations (flat + relations vs. nested hierarchy vs. hybrid)
5. "Nice-to-have vs. essential" connections — what actually helps users vs. what's feature bloat
6. Specific UX patterns for surfacing connections (backlinks panel, related items, graph view)

---

## How This Will Be Used

- **Agent 3 (System Architect):** Database schema for entity relations, embedding strategy for hierarchical data
- **Agent 2 (Software Engineer):** UI components for surfacing connections
- **Design Agent:** UX patterns for connection discovery, graph/map views
- **Director:** Scoping Connected Context feature across multiple sprints
- **Phase 4 (AI Integration):** Concierge retrieval architecture, context assembly from related entities

---

*Research Brief Request — Director v1.3 — February 23, 2026*
