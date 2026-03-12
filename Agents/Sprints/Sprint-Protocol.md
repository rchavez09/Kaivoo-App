# Sprint Protocol — Kaivoo Agent Coordination System

**Version:** 2.0
**Last Updated:** March 3, 2026

---

## 1. Organizational Structure

### Departments
| Department | Agents | Focus |
|---|---|---|
| Product | Agent 8 | Market intelligence, pricing, go-to-market, feature prioritization |
| Engineering | Agent 2, Agent 3, Agent 4 | Implementation, architecture, security |
| DevOps | Agent 9 | CI/CD, Docker, packaging, deployment, monitoring |
| Quality | Agent 7, Agent 10, Agent 11 | Code review, test strategy, feature integrity |
| Design | Visual Design Agent, Accessibility & Theming Agent, UX Completeness Agent | Visual craft, accessibility, dark mode, UX completeness, interaction patterns |
| Research | Agent 5 | Technology scouting, competitive analysis |
| Marketing | Sales Page Copywriter | Sales page copy, landing pages, conversion optimization |

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
  6. Sprint file checkpoint: all parcels marked final status, gates checked off
  7. Open PR from sprint branch → main on GitHub
     → CI runs automatically (lint, typecheck, test, build)
     → Netlify generates a deploy preview URL (unique per PR)
     → PR diff includes updated sprint file
  8. E2E TESTING: npm run test:e2e against deploy preview URL (PLAYWRIGHT_BASE_URL)
     → Smoke tests + journey tests derived from sprint DoD + Feature Bible
     → Produces pass/fail report with screenshots on failure
  9. SANDBOX REVIEW (two-track — Director selects applicable tracks per sprint):

     TRACK A — WEB (always applies):
       → User reviews Netlify deploy preview URL from any device
       → Director provides a testing checklist (screens, flows, devices)
       → Test from phone, laptop, anywhere — no localhost required

     TRACK B — DESKTOP (applies when sprint includes Tauri/desktop work):
       → User builds and runs locally: cd daily-flow && npm run tauri dev
       → Or builds installer: npm run tauri build (right-click → Open to bypass unsigned warning)
       → Director provides a desktop-specific checklist (native features, file system, updater, etc.)
       → Unsigned builds are acceptable for sandbox — signing is a distribution concern, not a testing concern

     → User approves BOTH applicable tracks or requests changes
     → This is a blocking gate — do NOT merge without user approval
  10. Merge PR to main on GitHub
      → Netlify auto-deploys web to production (no manual deploy step)
      → Desktop releases are separate: push a version tag (v*) → release workflow builds + publishes to GitHub Releases
  11. Tag main: git tag post-sprint-N
  12. Sprint retrospective added to sprint file on main (post-merge commit)
     → Reflects the FULL sprint including sandbox findings
     → Committed directly to main, not a separate PR
  13. Director updates Vision.md to reflect progress
  14. If sprint is rejected → PR is closed, branch is abandoned, main is untouched

RULES:
  - NEVER commit sprint work directly to main
  - NEVER manually deploy to Netlify — production deploys via GitHub merge only
  - Tag main after every successful sprint merge: post-sprint-N
  - Sprint branches are preserved after merge (never deleted)
  - Hotfix branches are for critical fixes between sprints

SAFETY:
  - Deploy previews are ISOLATED from production — they cannot break live
  - Only merges to main trigger production deployment
  - Tags (post-sprint-N) provide known-good rollback points
  - If a merged sprint breaks production:
      1. git revert the merge commit → push → Netlify auto-deploys reverted state
      2. Or: git reset --hard post-sprint-(N-1) → force push (last resort)
  - Sprint branches are never deleted — you can always inspect what was merged
  - GitHub PR history provides full audit trail of what was reviewed and approved
```

### Pre-Merge Checklist (Sprint Branch → Main)

Before any sprint branch PR merges to main, ALL of the following must pass:

```
□ Deterministic checks pass:
  - Web: cd daily-flow && npm run lint && npm run typecheck && npm run test && npm run build
  - Desktop (if sprint includes Tauri work): cd daily-flow/src-tauri && cargo check && cargo clippy
□ GitHub Actions CI passes on the PR (automated — same checks as above)
□ Agent 7 code audit completed (no unresolved P0 issues)
  - For Tauri sprints: Agent 7 MUST run cargo check + cargo clippy during audit
□ Agent 11 feature integrity check passed (no regressions)
□ 3-agent design review completed (for UI sprints): Visual Design + Accessibility & Theming + UX Completeness — all PASS, no unresolved P0 issues. Design review happens RIGHT BEFORE sandbox.
□ Sprint file is current: all parcels have final status, quality gates checked off, metrics recorded
□ E2E TEST: npm run test:e2e passes against the Netlify deploy preview URL (PLAYWRIGHT_BASE_URL)
□ SANDBOX Track A (Web): User has reviewed Netlify deploy preview URL and approved UX (any device)
□ SANDBOX Track B (Desktop — if applicable): User has built locally (tauri dev or tauri build) and approved native features
□ All sprint files committed to the sprint branch (sprint file included in the PR diff)

POST-MERGE (done on main after merge):
□ Pre-release setup complete (desktop sprints only — secrets, keypairs, external services)
□ Version tag pushed to trigger desktop release (desktop sprints only — v* tag)
□ Vision.md updated to reflect sprint progress
□ Sprint retrospective added to sprint file (committed directly to main)
```

### Deployment Pipeline

```
GitHub repo (rchavez09/Kaivoo-App)
     │
     ├── Push to sprint/* branch → CI runs (lint, typecheck, test, build)
     │
     ├── PR opened to main → CI runs + Netlify deploy preview generated
     │                        Preview URL: deploy-preview-{N}--{site}.netlify.app
     │                        Accessible from any device (phone, laptop, etc.)
     │
     ├── PR merged to main → Netlify auto-deploys WEB to production
     │                        No manual deployment step required
     │
     └── Tag pushed (v*) → release.yml builds desktop apps (macOS, Windows, Linux)
                            Signed binaries + latest.json uploaded to GitHub Releases
                            Auto-updater picks up new version on next launch

WEB PIPELINE:
  Config: netlify.toml (repo root) — base=daily-flow, publish=dist, Node 20
  Env vars: Set in Netlify dashboard (VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY)

DESKTOP PIPELINE:
  Config: .github/workflows/release.yml — triggered by v* tag push
  Signing: Apple (APPLE_* secrets) + Azure Trusted Signing (AZURE_* secrets)
  Updater: Ed25519 signed manifest (TAURI_SIGNING_PRIVATE_KEY)
  Output: GitHub Releases (macOS .dmg, Windows .exe/.nsis, Linux .AppImage/.deb)
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
    Agent-Visual-Design.md            # Visual hierarchy, composition, craft
    Agent-Accessibility-Theming.md    # WCAG, dark mode, ARIA, focus
    Agent-UX-Completeness.md          # States, navigation, anti-patterns
    Agent-Design-Docs/                # Shared: design system, screen specs, dark mode spec, use cases
    ARCHIVED-Agent-Design.md
    ARCHIVED-Agent-1-Senior-UI-Designer.md
    ARCHIVED-Agent-6-Usability-Architect.md

  Research/
    Agent-{N}-{Role}.md
    Agent-{N}-Docs/

  Marketing/
    Agent-Sales-Page-Copywriter.md       # Direct response conversion copy
    Agent-Marketing-Docs/                # Shared working documents
    Marketing-Copy-Draft.md              # Raw copy material from CEO sessions

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
| `Design-Note` | Design Agents | Design decisions |
| `Design-Review` | Design Agents | Pre-merge design review verdicts |
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
- **Sprint file is a living document — update it as you work, not after:**
  - When a parcel starts → mark it `IN PROGRESS` in the sprint file
  - When a parcel completes → mark it `DONE` immediately (don't batch)
  - When scope changes mid-sprint → add/remove parcels with a note
  - The sprint file should always reflect reality, not be backfilled later
- Mid-sprint documents feed the NEXT sprint, not the current one

### Phase 4: Verification

**Trigger:** All parcels meet Definition of Done, or sprint is timeboxed.

**Actions:**
1. Run deterministic checks on sprint branch:
   `npm run lint && npm run typecheck && npm run test && npm run build`
2. Agent 7 produces a code audit report: `Code-Audit-Sprint-{N}-Review.md`
3. Agent 11 runs feature integrity check against Feature Bible
4. Fix all P0 issues from code audit and feature integrity gates
5. **3-AGENT DESIGN REVIEW (for UI sprints) — right before sandbox:**
   Each design agent independently reviews the running app on the sprint branch:
   - **Visual Design Agent:** 4-step review (Hierarchy, Brand, Composition, Craft)
   - **Accessibility & Theming Agent:** 4-step review (Contrast both themes, ARIA, Focus, Inclusive) + separate dark mode pass
   - **UX Completeness Agent:** 5-step review (States, Navigation, Input Patterns, Edit-in-Place, Anti-Patterns)
   Each agent produces a separate verdict document. All 3 must PASS. No unresolved P0 issues allowed before proceeding.
6. Fix all P0 issues from design review
7. **SPRINT FILE CHECKPOINT:** Before opening the PR, verify the sprint file is current:
   - All parcels marked with final status (DONE / PARTIAL / CUT)
   - Quality gate checkboxes checked off as they pass
   - Bundle size or other metrics recorded with actual numbers
   - If any parcel was cut or descoped, note why
   - **This is not optional paperwork — the sprint file ships with the code.**
8. **OPEN PR:** Push sprint branch to GitHub, open PR to main
   - GitHub Actions CI runs automatically (lint, typecheck, test, build)
   - Netlify generates a deploy preview URL for the PR
   - CI must pass before proceeding
   - **The PR must include the updated sprint file** — reviewer should see parcel statuses and gate results in the diff
9. **E2E TEST:** Run `npm run test:e2e` against the Netlify deploy preview URL
   - Set `PLAYWRIGHT_BASE_URL` to the deploy preview URL
   - Smoke tests must PASS. Journey tests (if written) run against sprint DoD + Feature Bible
   - Must PASS before proceeding to Phase 5

### Phase 5: User Acceptance & Merge

**Trigger:** All Phase 4 gates pass (deterministic checks, agent gates, design review, E2E).

**Actions:**
1. **SANDBOX REVIEW (two-track):** Director presents the user with a **Sandbox Testing Checklist** derived from the sprint's Definition of Done and parcels. Director selects which tracks apply based on the sprint's deliverables.

   **Track A — Web** (always applies):
   - The Netlify deploy preview URL
   - Specific screens/pages to visit
   - Specific user flows to walk through (mapped from sprint DoD)
   - What to look for: new features, regressions, visual quality, dark mode
   - Device recommendations (phone, desktop, or both)
   - User reviews from any device — phone, laptop, coffee shop, anywhere

   **Track B — Desktop** (applies when sprint includes Tauri/desktop work):
   - Build instructions: `cd daily-flow && npm run tauri dev` (or `npm run tauri build` for installer)
   - Desktop-specific features to test: native menus, file system access, auto-updater, local SQLite, etc.
   - What to look for: features that behave differently on desktop vs. web
   - Unsigned builds are fine for sandbox — right-click → Open bypasses Gatekeeper on macOS
   - Signing is a **distribution** concern, not a testing concern — don't block sandbox on signing setup

   - This is a **blocking gate** — do NOT proceed without user approval on ALL applicable tracks
2. User approves UX or requests changes
   - If changes requested → fix on sprint branch, push, re-run Phase 4 gates as needed
   - Cycle until user approves
3. **MERGE PR** to main on GitHub (Netlify auto-deploys web to production)
4. **TAG MAIN:** `git tag post-sprint-N`
5. **PRE-RELEASE SETUP (desktop sprints only):** If the sprint includes desktop/Tauri work that requires a public release, complete the pre-release checklist before pushing a version tag. This covers configuration that can't happen until after merge (secrets, external service setup, account verification). The Director includes a sprint-specific pre-release checklist in the sprint file. Items may be:
   - **Blocking release:** Must be done before `v*` tag push (e.g., signing keys, updater keypair)
   - **Blocking specific features:** Release can proceed but feature won't work until done (e.g., Stripe config, Edge Function deploy)
   - **Blocked externally:** Waiting on third parties (e.g., Apple/Azure account verification) — release proceeds without, follow up when unblocked
   Once blocking items are resolved → push version tag (`git tag v1.0.0 && git push origin v1.0.0`) to trigger the release workflow.
6. **DIRECTOR UPDATES `Vision.md`** to reflect progress
7. **SPRINT RETROSPECTIVE:** Add `## Sprint Retrospective` section to the sprint file.
   This is written AFTER merge, reflecting the FULL sprint lifecycle including sandbox findings.
   Committed directly to main (not a separate PR). Include:
   - Completed date
   - Parcels completed (X/Y)
   - What was delivered (brief summary)
   - Verification results (build, typecheck, tests, agent gates)
   - Sandbox findings (what the user caught, if anything)
   - Deferred items
   - Key learnings

### Phase 6: Archival

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
User approves → Sprint-{N}-{Theme}.md created
         |
         v
Agents execute their parcels
         |
         v
═══════════════════════════════════
  PHASE 4: VERIFICATION
═══════════════════════════════════
         |
         v
Deterministic checks (lint, typecheck, test, build)
         |
         v
Agent 7 code audit + Agent 11 feature integrity
         |
         v
Fix P0 issues from code/integrity gates
         |
         v
3-agent design review (right before sandbox)
         |
         v
Fix P0 issues from design review
         |
         v
Sprint file checkpoint: parcels marked DONE, gates checked off
         |
         v
Open PR to main → CI runs + Netlify deploy preview generated
(PR includes updated sprint file in the diff)
         |
         v
E2E TEST: npm run test:e2e against deploy preview URL
         |
         v
═══════════════════════════════════
  PHASE 5: USER ACCEPTANCE & MERGE
═══════════════════════════════════
         |
         v
SANDBOX REVIEW (two-track):
  Track A (Web): User reviews deploy preview URL (any device)
  Track B (Desktop): User builds locally (tauri dev/build), tests native features
  (Director provides specific testing checklist per track)
         |
         v
User approves all applicable tracks → Merge PR to main
(Netlify auto-deploys web to production)
         |
         v
Tag main (post-sprint-N)
         |
         v
[Desktop sprints only]
Pre-release setup: keypairs, secrets, external service config
         |
         v
Push version tag (v*) → release workflow builds desktop apps
         |
         v
Vision.md updated
         |
         v
Sprint retrospective added to sprint file on main
(Reflects full sprint including sandbox + release findings)
```

---

*Sprint Protocol v1.9 — March 2, 2026*
*v1.0: Initial protocol*
*v1.1: Added Section 1B (Version Control & Sandbox Strategy), added Agent 11 to Quality department*
*v1.2: Explicit sandbox review step in lifecycle + pre-merge checklist. Deterministic checks before agent gates.*
*v1.3: Sandbox review woven into Phase 4 lifecycle + user-perspective flow. Agent 1+6 merged to Design Agent. Design references updated throughout.*
*v1.4: Mandatory Design Agent gate in Phase 4 (5-step review + dark mode pass). Design Agent added to Phase 1 (screen specs for new UI). Pre-merge checklist updated. Sprint 10 stabilization drove this change.*
*v1.5: Design Agent split into 3 specialized agents (Visual Design, Accessibility & Theming, UX Completeness). Added pre-implementation design gate (Gate 1) in Phase 3. Phase 4 now requires 3 independent design verdicts. Sprint 12 restructuring per Agent 5 research.*
*v1.6: Removed pre-implementation design gate (Gate 1). Design review now happens right before sandbox preview in Phase 4. Cleaner flow: build → code review → integrity check → design review → sandbox.*
*v1.7: Deployment pipeline overhaul. GitHub → Netlify auto-deploy (netlify.toml config). Sandbox replaced localhost with Netlify deploy preview URLs (test from any device). Added E2E testing gate (AI-powered browser testing against preview URL). Added Deployment Pipeline section. Strengthened safety/rollback guarantees. Manual Netlify deploys eliminated.*
*v1.8: Sprint file as living document. Phase 3 now requires updating parcel status during execution (not after). Added "Sprint File Checkpoint" step in Phase 4 before PR — sprint file must be current and included in the PR diff. E2E gate updated to use Playwright (`npm run test:e2e` with `PLAYWRIGHT_BASE_URL`). Driven by Sprint 19 retro: code shipped but sprint file was never updated.*
*v1.9: Phase restructure — split old Phase 4 into Phase 4 (Verification, ends at E2E) and Phase 5 (User Acceptance & Merge). Retrospective moves AFTER merge to reflect full sprint including sandbox findings. Sandbox review now requires a structured testing checklist from the Director (specific screens, flows, devices — not just "go look at it"). Added `/sprint-verify` skill for automated gate enforcement. Driven by Sprint 22 retro: retrospective written before sandbox caused premature "done" signal, Phase 4 testing was skipped.*
*v2.0: Two-track sandbox testing. Phase 5 now supports Track A (Web — Netlify deploy preview) and Track B (Desktop — local Tauri build). Director selects applicable tracks per sprint. Desktop pipeline added (release.yml → GitHub Releases via v* tag). Pre-merge checklist updated. Unsigned desktop builds acceptable for sandbox testing. Driven by Sprint 25: first desktop-focused sprint exposed that web-only sandbox process couldn't cover Tauri features.*
