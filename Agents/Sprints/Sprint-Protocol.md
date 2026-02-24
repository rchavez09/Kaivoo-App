# Sprint Protocol — Kaivoo Agent Coordination System

**Version:** 1.0
**Last Updated:** February 22, 2026

---

## 1. Organizational Structure

### Departments
| Department | Agents | Focus |
|---|---|---|
| Product | Agent 8 | Market intelligence, pricing, go-to-market, feature prioritization |
| Engineering | Agent 2, Agent 3, Agent 4 | Implementation, architecture, security |
| DevOps | Agent 9 | CI/CD, Docker, packaging, deployment, monitoring |
| Quality | Agent 7, Agent 10, Agent 11 | Code review, test strategy, feature integrity |
| Design | Agent 1, Agent 6 | Visual design, UX, interaction patterns |
| Research | Agent 5 | Technology scouting, competitive analysis |
| Marketing | TBD | Content, growth, brand |

### The Director
Sits above all departments at `Agents/Director.md`. Owns the product vision (`Agents/Vision.md`), orchestrates sprint planning, and coordinates cross-department work. The Director is the single entry point for all sprint lifecycle operations.

---

## 1B. Version Control & Sandbox Strategy

### Git Branching Protocol

Every sprint MUST be developed on a dedicated branch. The `main` branch is the stable, user-approved baseline.

```
BRANCH NAMING:
  sprint/N-theme-slug     (e.g., sprint/3-restore-define)
  hotfix/description      (e.g., hotfix/capture-input-fix)

LIFECYCLE:
  1. Sprint approved → Create branch: git checkout -b sprint/N-theme-slug
  2. All sprint work happens on the sprint branch
  3. Sprint completes → Run deterministic checks (lint, typecheck, test, build)
  4. Agent 7 code audit + Agent 11 feature integrity check on the branch
  5. Fix all P0 issues from gates before proceeding
  6. SANDBOX REVIEW: Start dev server on sprint branch (npm run dev)
     → User reviews the running app and approves UX
     → This is a blocking gate — do NOT merge without user approval
  7. Sprint retrospective section added to sprint file
  8. Merge to main: git merge --no-ff sprint/N-theme-slug
  9. Tag main: git tag post-sprint-N
  10. Deploy to production (Netlify)
  11. If sprint is rejected → branch is abandoned, main is untouched

RULES:
  - NEVER commit sprint work directly to main
  - Tag main after every successful sprint merge: post-sprint-N
  - If a sprint breaks core functionality, the user can revert:
      git checkout main (returns to last approved state)
  - Sprint branches are preserved after merge (never deleted)
  - Hotfix branches are for critical fixes between sprints
```

### Pre-Merge Checklist (Sprint Branch → Main)

Before any sprint branch merges to main, ALL of the following must pass:

```
□ Deterministic checks pass: npm run lint && npm run typecheck && npm run test && npm run build
□ Agent 7 code audit completed (no unresolved P0 issues)
□ Agent 11 feature integrity check passed (no regressions)
□ SANDBOX: Dev server started on sprint branch, user has reviewed the running app and approved UX
□ Sprint retrospective section added to sprint file
□ All sprint files committed to the sprint branch
```

### Recovery Protocol

If a sprint has already been merged and causes regressions:

```
1. Create a hotfix branch from main
2. Fix the specific regressions (do NOT revert the entire sprint)
3. If regressions are too extensive to hotfix:
   a. git revert the merge commit
   b. Create a new sprint branch to redo the work properly
4. Document what went wrong in the sprint retrospective
```

### Why This Exists

Sprint 2 (Core Experience) was merged without a branching strategy. The Unified Day View replaced the widget-based Today dashboard, causing regressions in routine management, todo configuration, journal entry flow, and capture functionality. This protocol ensures that never happens again. Main is always safe.

---

## 2. Folder Structure

```
Agents/
  Director.md                              # Orchestrator (above departments)
  Vision.md                                # Living North Star roadmap

  Product/
    Agent-8-Product-Manager.md             # Market intelligence, pricing, GTM
    Agent-8-Docs/

  Engineering/
    Agent-{N}-{Role}.md                    # Role spec ONLY
    Agent-{N}-Docs/                        # Working documents

  DevOps/
    Agent-9-DevOps-Engineer.md             # CI/CD, Docker, packaging, deployment
    Agent-9-Docs/

  Quality/
    Agent-7-Code-Reviewer.md              # Code review gate (note: spec file in Engineering/)
    Agent-10-QA-Architect.md              # Test strategy, CI test suite
    Agent-10-Docs/
    Agent-11-Feature-Integrity-Guardian.md # Feature regression gate
    Agent-11-Docs/                         # Feature Use Case Bible, regression checks

  Design/
    Agent-{N}-{Role}.md
    Agent-{N}-Docs/

  Research/
    Agent-{N}-{Role}.md
    Agent-{N}-Docs/

  Marketing/
    (agents TBD)

  Sprints/
    Sprint-Protocol.md                     # This document
    Sprint-{N}-{Theme}.md                  # One per sprint, preserved forever
    Next-Sprint-Planning.md                # Staging area for next sprint
```

### What goes WHERE

| Content | Location |
|---------|----------|
| Agent role, spec, instructions | `{Department}/Agent-{N}-{Role}.md` |
| Agent findings, concerns, notes | `{Department}/Agent-{N}-Docs/{document}.md` |
| Sprint plan and tracking | `Sprints/Sprint-{N}-{Theme}.md` |
| Next sprint staging | `Sprints/Next-Sprint-Planning.md` |
| Product vision and roadmap | `Vision.md` |
| This protocol | `Sprints/Sprint-Protocol.md` |

### What NEVER happens

- Sprint-specific content NEVER goes in agent spec files
- Completed sprint files are NEVER deleted or renamed
- Agent documents are NEVER deleted (archived with prefix, not destroyed)
- Agent spec files are NEVER used for findings or notes

---

## 3. Naming Conventions

### Sprint Files
- `Sprint-{N}-{Theme-Slug}.md` — the highest number is the current sprint
- Theme slug is 2-3 words capturing the sprint's focus (e.g., `Security-Performance`, `Core-Experience`)
- Sprint files keep their name forever — no renaming when complete

### Agent Documents
- **Active:** `{Type}-Sprint-{N}-{Descriptor}.md`
- **Archived:** `ARCHIVED-{Type}-Sprint-{N}-{Descriptor}.md`

Common document types:
| Type Prefix | Used By | Purpose |
|---|---|---|
| `Code-Audit` | Agent 7 | Code review reports |
| `Research-Brief` | Agent 5 | Research findings |
| `Security-Concern` | Agent 4 | Security gap reports |
| `Design-Note` | Agent 1, 6 | Design decisions |
| `Architecture-Decision` | Agent 3 | Architecture Decision Records |
| `Implementation-Note` | Agent 2 | Technical notes |
| `Concern` | Any agent | Generic concern |

---

## 4. Sprint Lifecycle

### Phase 1: Planning

**Trigger:** Previous sprint complete, or user initiates.

**Actions:**
1. Director reads `Vision.md` to understand current roadmap position
2. Director scans ALL `Agent-{N}-Docs/` folders for non-ARCHIVED documents
3. Director reads the "Deferred to Sprint N+1" section from the current sprint file
4. Director compiles everything into `Next-Sprint-Planning.md` with attribution
5. Director assigns parcels to agents and organizes into tracks
6. User reviews and approves

### Phase 2: Sprint Start

**Trigger:** User approves `Next-Sprint-Planning.md`.

**Actions:**
1. Create `Sprint-{N}-{Theme}.md` from the approved plan
2. Reset `Next-Sprint-Planning.md` to blank template

### Phase 3: Execution

**During sprint:**
- Agents work their assigned parcels
- New findings go to the agent's `Docs/` folder as new documents
- The sprint file is updated only for status tracking (marking parcels complete)
- Mid-sprint documents feed the NEXT sprint, not the current one

### Phase 4: Completion

**Trigger:** All parcels meet Definition of Done, or sprint is timeboxed.

**Actions:**
1. Agent 7 produces a final audit report: `Code-Audit-Sprint-{N}-Review.md`
2. Add `## Sprint Retrospective` section to the sprint file:
   - Completed date
   - Parcels completed (X/Y)
   - What was delivered (brief summary)
   - Verification results (build, typecheck, tests)
   - Deferred items
   - Key learnings
3. Director updates `Vision.md` to reflect progress

### Phase 5: Archival

**Trigger:** Next sprint planning begins.

**Actions:**
1. Review all documents in every `Agent-{N}-Docs/` folder
2. If ALL concerns in a document have been addressed → rename with `ARCHIVED-` prefix
3. If any concerns remain → leave active (next sprint planning will reference it)

**Decision rule:**
```
For each document in Agent-{N}-Docs/:
  IF every concern has been implemented or explicitly won't-fixed:
    RENAME to ARCHIVED-{original-name}.md
  ELSE:
    Leave as-is (active)
```

---

## 5. How Agent Findings Feed Into Sprints

```
Agent works during Sprint N
       |
       v
Agent writes finding to their Docs/ folder
(e.g., Security-Concern-Sprint-1-Token-Handling.md)
       |
       v
Sprint N completes
       |
       v
Sprint N+1 planning begins
       |
       v
Director scans ALL Agent-{N}-Docs/ folders
for non-ARCHIVED documents
       |
       v
Each finding is evaluated for Sprint N+1 scope
       |
       v
Accepted items become parcels in Sprint-{N+1}-{Theme}.md
with attribution: "Source: Agent 4, Security-Concern-Sprint-1-..."
       |
       v
After the sprint addresses the finding,
the source document gets ARCHIVED- prefix
```

---

## 6. The Sprint Planning Flow (User Perspective)

```
User: "I want to add feature X"
         |
         v
Director reads Vision.md
(Where does X fit in the roadmap?)
         |
         v
Director identifies relevant agents
(Engineering? Design? Research?)
         |
         v
Director scans agent Docs/ folders
(Any existing concerns related to X?)
         |
         v
Director compiles Next-Sprint-Planning.md
(Parcels, assignments, dependencies)
         |
         v
User approves -> Sprint-{N}-{Theme}.md created
         |
         v
Agents execute their parcels
         |
         v
Sprint completes -> Retrospective added
         |
         v
Vision.md updated (mark phase progress)
```

---

*Sprint Protocol v1.2 — February 23, 2026*
*v1.0: Initial protocol*
*v1.1: Added Section 1B (Version Control & Sandbox Strategy), added Agent 11 to Quality department*
*v1.2: Explicit sandbox review step in lifecycle + pre-merge checklist. Deterministic checks before agent gates.*
