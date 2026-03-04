---
name: sprint-verify
description: "Run the Sprint Protocol Phase 4 verification gates in sequence. Enforces the correct order: deterministic checks → Agent 7 code audit → Agent 11 feature integrity → design review → sprint file checkpoint → open PR → E2E tests → generate sandbox testing checklist. Use after all sprint parcels are done."
user-invocable: true
disable-model-invocation: true
argument-hint: "[sprint-number]"
allowed-tools: Bash(cd daily-flow && npm run *), Bash(git *), Read, Glob, Grep, Write, Edit, Agent
---

# Sprint Verification — Phase 4 Gate Sequence

You are running the Sprint Protocol v1.9 Phase 4 verification pipeline for **Sprint $0**.

## Setup

1. Read the sprint file: find `Agents/Sprints/Sprint-$0-*.md` (glob for the theme slug)
2. Confirm you are on the correct sprint branch (should be `sprint/$0-*`)
3. Extract the sprint's Definition of Done and parcel list — you will need these for the sandbox checklist at the end

## Gate Sequence

Run each gate in order. **STOP immediately if a gate fails.** Fix the issue, then re-run from Gate 1 (deterministic checks must always pass after any code change).

### Gate 1: Deterministic Checks

```bash
cd daily-flow && npm run lint && npm run typecheck && npm run test && npm run build
```

All four must pass. If any fail, STOP and fix before proceeding.

### Gate 2: Agent 7 — Code Audit

1. Read the Agent 7 spec: `Agents/Engineering/Agent-7-Code-Reviewer.md`
2. Get the diff of all changes on this sprint branch: `git diff main...HEAD`
3. Run a code audit following Agent 7's review protocol
4. Produce a report: `Agents/Engineering/Agent-7-Docs/Code-Audit-Sprint-$0-Review.md`
5. If any **P0 issues** are found → STOP. Report them. Fix, then restart from Gate 1.
6. P1/P2 issues are logged in the report but do not block.

### Gate 3: Agent 11 — Feature Integrity

1. Read the Agent 11 spec: `Agents/Quality/Agent-11-Feature-Integrity-Guardian.md`
2. Read the Feature Bible index: `Agents/Quality/Agent-11-Docs/Feature-Bible-Index.md`
3. Read all non-ARCHIVED Feature Bible pages in `Agents/Quality/Agent-11-Docs/`
4. Run the feature integrity check — verify no regressions against the Feature Bible
5. If any **regressions** are found → STOP. Report them. Fix, then restart from Gate 1.

### Gate 4: Design Review (UI sprints only)

Ask the user: "Does this sprint include UI changes that need design review?" If no, skip to Gate 5.

If yes, run all 3 design agents **sequentially** (each produces a verdict document):

1. **Visual Design Agent** — Read spec: `Agents/Design/Agent-Visual-Design.md`
   - 4-step review: Hierarchy, Brand, Composition, Craft
   - Produce: `Agents/Design/Agent-Design-Docs/Design-Review-Sprint-$0-Visual.md`

2. **Accessibility & Theming Agent** — Read spec: `Agents/Design/Agent-Accessibility-Theming.md`
   - 4-step review: Contrast (both themes), ARIA, Focus, Inclusive + dark mode pass
   - Produce: `Agents/Design/Agent-Design-Docs/Design-Review-Sprint-$0-Accessibility.md`

3. **UX Completeness Agent** — Read spec: `Agents/Design/Agent-UX-Completeness.md`
   - 5-step review: States, Navigation, Input Patterns, Edit-in-Place, Anti-Patterns
   - Produce: `Agents/Design/Agent-Design-Docs/Design-Review-Sprint-$0-UX.md`

All 3 must PASS. If any **P0 issues** → STOP. Fix, then restart from Gate 1.

### Gate 5: Sprint File Checkpoint

Read the sprint file and verify:

- [ ] All parcels have a final status: DONE, PARTIAL, or CUT
- [ ] Quality gate checkboxes are checked as each gate passes
- [ ] Bundle size or other metrics have actual numbers (not TBD)
- [ ] Any cut/descoped parcels have a reason noted
- [ ] The sprint file reflects reality — no stale or placeholder content

If anything is missing, update the sprint file before proceeding.

### Gate 6: Open PR + CI

1. Push the sprint branch to GitHub
2. Open a PR from the sprint branch to `main` using the GitHub API:
   ```bash
   TOKEN=$(echo "protocol=https\nhost=github.com\n" | git credential fill 2>/dev/null | grep password | sed 's/password=//')
   ```
   Use the token to create the PR via `https://api.github.com/repos/rchavez09/Kaivoo-App/pulls`
3. The PR title should be: `Sprint $0: {Theme}`
4. The PR body should summarize parcels delivered and gates passed
5. Wait for CI to pass (check via GitHub API)
6. Capture the Netlify deploy preview URL from the PR (check deployment status or PR comments)

### Gate 7: E2E Tests

```bash
cd daily-flow && PLAYWRIGHT_BASE_URL={deploy-preview-url} npm run test:e2e
```

Must PASS before proceeding. If tests fail, STOP and fix.

---

## Output: Sandbox Testing Checklist

After all 7 gates pass, generate a **Sandbox Testing Checklist** for the user. This is the handoff to Phase 5 (User Acceptance & Merge).

Read the sprint file's Definition of Done and parcels, then produce a checklist in this format:

```markdown
## Sandbox Testing Checklist — Sprint $0

**Deploy Preview URL:** {url}
**Recommended devices:** {phone, desktop, or both — based on sprint scope}

### New Features to Test
For each parcel delivered, list:
- [ ] {Feature name}: {Specific action to take} → {Expected result}

### Regression Checks
Based on the Feature Bible, list key flows to verify still work:
- [ ] {Flow name}: {Quick verification step}

### Visual & Theme Checks
- [ ] Light mode: {specific screens to check}
- [ ] Dark mode: {specific screens to check}

### Edge Cases
- [ ] {Any edge cases from the DoD}
```

Present this checklist to the user. **The skill ends here.** The user takes over for sandbox testing (Phase 5).

---

## Rules

- **Never skip gates.** Even if you think a gate will pass, run it.
- **Always restart from Gate 1** after fixing P0 issues (code changes may introduce new failures).
- **Gate order is sacred.** Do not reorder gates — the sequence is designed so each gate builds on the previous.
- **The sprint file is the source of truth.** Every gate result should be reflected in the sprint file's Quality Gates section as you go.
- **P0 = blocker, P1/P2 = log and continue.** Only P0 issues stop the pipeline.
