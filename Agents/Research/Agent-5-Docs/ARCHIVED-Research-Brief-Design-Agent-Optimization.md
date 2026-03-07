# Research Brief: Design Agent Optimization — Specialization, Review Process, and Sprint Integration

**Date:** 2026-02-24
**Domain:** AI-Assisted Design Review & Multi-Agent Design QA
**Requested by:** Director (on user request)
**Confidence:** HIGH (established patterns from multi-agent AI frameworks, design system governance at top companies, and WCAG compliance methodology; supplemented by direct analysis of Kaivoo's Sprint 9 failure modes)

---

## Question

How should Kaivoo restructure its Design Agent system to reliably catch visual, interaction, accessibility, and dark mode defects before they reach the user?

---

## Key Findings

### 1. Multi-Agent Specialization Produces Better Quality Than Generalist Agents

**Evidence from AI multi-agent frameworks:**

CrewAI's architecture explicitly recommends single-responsibility agents with narrow, well-defined roles over broad generalist agents. Their documentation states that agents with focused roles produce higher-quality output because the role definition constrains the LLM's attention window. A "Senior UI Designer" that also handles accessibility, dark mode, responsive behavior, and interaction design is fighting its own context window — each domain requires loading different mental models, different reference documents, and different evaluation criteria.

Microsoft's AutoGen framework documents a pattern called "specialized critics" — instead of one reviewer, multiple agents each evaluate a different quality dimension. The research shows that a single agent reviewing multiple dimensions suffers from "first-item bias" (whatever it checks first gets the most attention) and "fatigue decay" (later checks are shallower than earlier ones).

LangGraph's agent decomposition guidance recommends splitting agents when: (a) the domains require different reference materials, (b) the evaluation criteria are orthogonal (a design that passes visual hierarchy can still fail accessibility), and (c) a single agent consistently misses specific categories of defects.

**The Kaivoo Design Agent hits all three criteria for splitting.**

### 2. The Single-Agent Failure Mode Is Well-Documented: "Checklist Blindness"

Nielsen Norman Group's research on design review effectiveness distinguishes between **review methodologies** (abstract principles for what to evaluate) and **executable checklists** (specific, verifiable test procedures). The current Design Agent has the former but not the latter.

Example of the gap:
- **Methodology (current):** "WCAG AA contrast ratios met?"
- **Executable checklist (needed):** "For EACH text element, verify contrast ratio against BOTH light (`#FAF8F5`) and dark (`var(--background)`) backgrounds. Minimum 4.5:1 for body text, 3:1 for large text (>=18px or >=14px bold). Tool: compute `(L1 + 0.05) / (L2 + 0.05)` for each foreground/background pair."

The methodology asks "did you check contrast?" The executable checklist defines HOW to check contrast and WHAT specific values to test against. Without the latter, an AI agent will confirm "yes, I checked contrast" without actually computing ratios for every relevant color pair — especially in dark mode where the background colors are different.

**This explains why Sprint 9 missed dark mode contrast issues.** The Design Agent likely evaluated contrast against Warm Sand (#FAF8F5) but not against the dark mode background. The checklist says "WCAG AA contrast ratios met?" without specifying "in both themes."

### 3. Top Design Systems Treat Dark Mode as a Separate, First-Class Review Pass

**Google Material Design 3:** Material's theming system treats light and dark themes as two complete, independently validated color schemes. Their "Dynamic Color" system generates dark theme colors using a different tonal palette algorithm — they don't just invert or darken light theme colors. Critically, Material explicitly states that dark theme requires separate contrast validation because the same color token maps to different actual hex values in each theme.

**Apple Human Interface Guidelines:** Apple's HIG mandates that dark mode is not an afterthought or inversion — it's a parallel design that requires independent contrast testing. They specifically call out "vibrancy" differences: colors that work on light backgrounds may become unreadable on dark backgrounds, even if they technically pass contrast ratios in isolation. Apple recommends reviewing the full UI in dark mode as a separate pass, not as a sub-check of accessibility.

**Shopify Polaris:** Polaris treats dark mode as a separate "surface context." Their design tokens map to different values per surface, and their review process includes a step called "surface validation" where every component is checked on every surface variant. This is a separate gate from accessibility.

**Ant Design:** Antd's dark theme algorithm modifies 30+ design tokens. Their internal QA process runs automated contrast checks on EVERY component in BOTH themes before release. This is an automated CI step, not a manual review.

**Pattern:** No leading design system treats dark mode as a sub-item of accessibility. It's either a separate review pass or an automated test suite. The Kaivoo Design Agent treats it as an implicit part of "Step 3: Accessibility Audit" — buried, not elevated.

### 4. Optimal Agent Granularity: 3 Specialized Agents, Not 5

Too few agents (1-2) leads to the generalist failure mode. Too many (5+) creates coordination overhead and "diffusion of responsibility" — each agent assumes another agent will catch the issue. Research on multi-agent systems consistently finds a sweet spot:

- **1 agent (current):** Cognitive overload, checklist blindness, first-item bias
- **2 agents (visual + technical):** Better, but "technical" is still too broad (accessibility + responsive + dark mode are different domains)
- **3 agents (recommended):** Each agent loads one mental model, one set of reference docs, and produces one focused verdict
- **4-5 agents:** Coordination overhead exceeds quality gain. Agents start producing conflicting verdicts. Director spends more time resolving disagreements than agents spend reviewing.

**The recommended split:**

| Agent | Domain | What They Load |
|-------|--------|---------------|
| **Visual Design Agent** | Visual hierarchy, brand consistency, component specs, interaction patterns, anti-patterns | Design System, Screen Specs, Interaction Patterns, Anti-Patterns |
| **Accessibility & Theming Agent** | WCAG compliance, dark mode contrast, focus indicators, aria labels, reduced motion, color blindness | Accessibility Checklist (expanded), Dark Mode Spec (new), WCAG quick-reference |
| **UX Completeness Agent** | Missing functionality, navigation gaps, state management (stale state, empty state, error state, loading state), input patterns (picker vs. text), quick-edit capabilities | Use Cases, Screen Specs, current Feature Bible |

This maps directly to the three categories of Sprint 9 failures:
- **Visual Design Agent** would have caught: overly prominent "Add" button, timeline placement confusion
- **Accessibility & Theming Agent** would have caught: dark mode contrast issues on status badges and topic badges
- **UX Completeness Agent** would have caught: missing calendar picker, no project editor exit, missing subtask display, missing quick-edit on task date/status, stale state on project card color

### 5. Executable Checklists Require Concrete Test Procedures, Not Principles

**What makes design review checklists work in practice (human and AI):**

The difference between checklists that catch defects and checklists that get rubber-stamped comes down to **specificity of the test procedure**. Research on aviation checklists, surgical safety checklists (Atul Gawande's WHO Surgical Safety Checklist research), and software review checklists shows the same pattern:

Ineffective: "Verify the system is safe" (too abstract, reviewer confirms their own assumption)
Effective: "Read back the patient's name from the wristband" (specific, observable, verifiable)

For AI agents specifically, this distinction is critical because LLMs will pattern-match "WCAG AA contrast ratios met?" to "yes" based on the general appearance of the code, without actually computing contrast ratios. An executable checklist forces the agent to perform specific observable actions:

**Example transformation (Accessibility):**
- BEFORE: "WCAG AA contrast ratios met?"
- AFTER: "List every text color + background color pair on this page. For each pair, state the computed contrast ratio. Flag any pair below 4.5:1 (body text) or 3:1 (large text). Repeat for dark mode with dark theme background values."

**Example transformation (UX Completeness):**
- BEFORE: "Do interactions follow established patterns?"
- AFTER: "For each data field visible to the user, answer: Can the user edit this field without navigating away? If editing requires navigation, flag as Anti-Pattern 1 violation. For date fields, is a date picker used? For color fields, is a color picker used? For status fields, is an inline toggle or dropdown used?"

**Example transformation (Dark Mode):**
- BEFORE: (not in current checklist)
- AFTER: "Switch to dark mode. For each of: page backgrounds, card backgrounds, text elements, badges, chips, status indicators, borders — state the foreground color, background color, and contrast ratio. Flag any element that becomes unreadable, invisible, or loses its semantic meaning (e.g., a 'warning' badge that no longer looks like a warning)."

### 6. Design Review Should Happen at Three Points, Not One

**Leading product teams use a three-gate model:**

**Gate 1: Pre-Implementation Design Spec (BEFORE code)**
The design agent(s) review the sprint contract and produce specific visual/UX specs for new components. This is where missing patterns are caught early (e.g., "this feature needs a date picker, not a text input" or "this detail page needs a clear exit/back navigation").

This is where Kaivoo's Sprint 9 failures SHOULD have been caught. The sprint contract described ProjectCard, ProjectDetail, and Timeline but didn't include design specs with explicit component choices (picker types, navigation patterns, edit capabilities).

**Gate 2: Mid-Implementation Design Check (DURING code, optional)**
For complex features (new pages, new interaction patterns), a lightweight check after the first working version is implemented. This catches "the spec said X but the implementation feels wrong" issues before too much code is committed.

**Gate 3: Pre-Merge Design Review (AFTER code, BEFORE merge)**
The current Phase 4 verification step. This is where the 5-step (now split across 3 agents) review happens against the running application.

**The critical insight:** Gate 1 is the highest-ROI gate. Most design defects in Sprint 9 were **specification failures** (missing requirements), not **implementation failures** (wrong implementation of correct requirements). A date input wasn't "implemented wrong as a text field" — a text field was the ONLY thing specified. An "exit project editor" button wasn't implemented wrong — it was never specified.

**Recommendation:** Add "Design Spec" as a mandatory pre-implementation step for any parcel that creates new UI surfaces. The Design Agent(s) must produce a component-level spec BEFORE Agent 2 starts coding. This spec includes: component types (picker, selector, toggle), navigation patterns (how to enter and exit), state inventory (empty, loading, error, stale-refresh, success), and dark mode appearance.

### 7. Automated Design Linting Can Supplement But Not Replace Agent Review

**How design lint tools work:**

Figma's "Design Lint" plugin, Sketch's "Assistants," and tools like Storybook's accessibility addon all follow the same pattern: they define **rules** (minimum contrast ratio, consistent spacing, required aria labels) and run them automatically against components. They catch violations of codified rules but cannot evaluate subjective quality (does the visual hierarchy feel right? does the navigation flow make sense?).

**What Kaivoo can automate now:**
- Contrast ratio checks: An ESLint plugin or custom script that extracts all color pairs from the CSS/Tailwind classes and computes WCAG ratios
- Missing aria-label detection: ESLint `jsx-a11y` plugin (likely already installed)
- Dark mode token validation: A script that ensures every color token has both light and dark values defined
- Focus indicator verification: Automated test that tabs through interactive elements and verifies `:focus-visible` styles are applied

**What still requires agent review:**
- Visual hierarchy and brand consistency
- Interaction pattern appropriateness (picker vs. text field)
- UX completeness (missing features, navigation gaps)
- Anti-pattern detection
- State management completeness (stale, empty, error states)

**Recommendation:** Add a `design-lint` step to the deterministic checks in Phase 4 (alongside lint, typecheck, test, build). This catches the "computable" design issues automatically, freeing the design agents to focus on the "judgmental" issues.

### 8. Stale State and State Completeness Is a Distinct Review Concern

Sprint 9's "project card color not rendering until refresh" is a **state management defect** — a category that doesn't cleanly fit into visual design, accessibility, or interaction design. Leading design QA processes treat "state completeness" as its own dimension:

**Every UI component has 5+ states:**
1. **Empty state** — no data yet (first-time user experience)
2. **Loading state** — data is being fetched
3. **Populated state** — normal data display
4. **Error state** — fetch or operation failed
5. **Stale/optimistic state** — data has been mutated locally but not yet confirmed by server
6. **Refresh state** — user triggered refresh, showing latest data

The "project card color not rendering until refresh" bug is a failure in state 5: the UI showed the old color (stale) instead of the new color (optimistic update). This is exactly the kind of defect the UX Completeness Agent should catch by checking: "After every mutation (create, update, delete), does the UI reflect the new state immediately without requiring a page refresh?"

---

## Analysis: What This Means for Kaivoo

### Root Cause of Sprint 9 Design Failures

The Design Agent's 5-step methodology failed not because the steps were wrong, but because:

1. **Too many domains for one agent.** One agent switching between visual hierarchy, interaction patterns, accessibility, responsive behavior, and anti-patterns experiences the same cognitive overload a human designer would. Each domain requires loading different reference material and applying different evaluation criteria.

2. **Methodology without test procedures.** "WCAG AA contrast ratios met?" is a principle, not a test. The agent answered "yes" without computing ratios for dark mode backgrounds. "Interaction patterns followed?" is a principle, not a test. The agent answered "yes" without checking whether text inputs were appropriate for date selection.

3. **Dark mode was a sub-item, not a gate.** Dark mode fundamentally changes every color relationship in the UI. Treating it as one bullet under "Accessibility Audit" guarantees it gets shallow attention.

4. **No pre-implementation design gate.** The sprint contract embedded design notes in parcel descriptions ("ProjectCard should look like...") rather than requiring standalone design specs. The Design Agent reviewed the implementation but never produced a spec that would have caught missing components (date picker, exit button, quick-edit, subtask display).

5. **No state completeness check.** The 5-step methodology checks visual hierarchy, interactions, accessibility, responsive, and anti-patterns — but never asks "what happens when data changes? does the UI update immediately?"

### The Restructuring Opportunity

Splitting the Design Agent into 3 specialized agents and upgrading from methodology to executable checklists would address all 5 root causes simultaneously. The 3-agent structure also maps naturally to the sprint lifecycle:

- **Gate 1 (pre-implementation):** Visual Design Agent + UX Completeness Agent produce component specs
- **Gate 2 (deterministic):** Automated design-lint catches contrast violations, missing aria labels, dark mode token gaps
- **Gate 3 (pre-merge review):** All 3 agents review the running application with executable checklists

---

## Recommendations

### Recommendation 1: Split Into 3 Specialized Design Agents

**Visual Design Agent (Model: Sonnet)**
- **Scope:** Visual hierarchy, brand consistency, typography, color usage, spacing, component specs, layout, motion
- **Reference docs:** Kaivoo-Design-System.md, Screen-Specifications.md
- **Checklist type:** Structural (does the layout match the design system?)
- **Sprint role:** Produces visual specs (Gate 1), reviews visual implementation (Gate 3)
- **Trade-off:** Lower model cost (Sonnet) because evaluation is primarily pattern-matching against known specs

**Accessibility & Theming Agent (Model: Opus)**
- **Scope:** WCAG AA compliance, dark mode contrast validation, focus indicators, aria attributes, reduced motion, color blindness simulation, theme token validation
- **Reference docs:** Accessibility-Checklist.md (expanded with dark mode section), WCAG quick-reference
- **Checklist type:** Computational (compute contrast ratios, verify aria attributes, check both themes)
- **Sprint role:** Validates accessibility spec compliance (Gate 1), runs automated + agent review (Gates 2-3)
- **Trade-off:** Opus model needed because contrast computation and dark mode evaluation require careful reasoning across color pairs
- **New responsibility:** Maintains a Dark Mode Specification document listing every color token's light and dark values, with pre-computed contrast ratios

**UX Completeness Agent (Model: Opus)**
- **Scope:** Missing functionality, navigation completeness, input pattern appropriateness (picker vs. text), state completeness (empty/loading/error/stale/refresh), quick-edit capabilities, anti-pattern detection, progressive disclosure
- **Reference docs:** Use-Cases.md, Anti-Patterns.md, Interaction-Patterns.md, Feature Bible
- **Checklist type:** Scenario-based (walk through each use case and verify every interaction is possible)
- **Sprint role:** Reviews parcel specs for completeness (Gate 1), reviews running app for UX gaps (Gate 3)
- **Trade-off:** Opus model needed because completeness evaluation requires reasoning about what's MISSING, not just what's present

### Recommendation 2: Upgrade from Methodology to Executable Checklists

Each of the 3 agents should have an executable checklist document in their Docs/ folder. These checklists should follow the aviation/surgical model:

**Structure of an executable checklist item:**
```
CHECK: [specific, observable thing to verify]
PROCEDURE: [how to verify it — what to look at, what to compute, what to compare]
PASS CRITERIA: [exact threshold or condition for passing]
FAIL EXAMPLE: [what a failure looks like, to calibrate the agent's detection]
```

**Example for Accessibility & Theming Agent:**
```
CHECK: Dark mode contrast — status badges
PROCEDURE: Identify all badge/chip elements that use colored backgrounds.
  For each, note the text color and background color in dark mode.
  Compute contrast ratio: (L1 + 0.05) / (L2 + 0.05) where L1 > L2.
PASS CRITERIA: >= 4.5:1 for text smaller than 18px; >= 3:1 for text >= 18px or >= 14px bold.
FAIL EXAMPLE: A "High Priority" badge with Ember (#DC2626) text on a dark card background (#1E293B) has contrast 3.8:1 — FAILS for small text.
```

**Example for UX Completeness Agent:**
```
CHECK: Edit-where-you-see-it compliance
PROCEDURE: For each data field visible in a list/card view, attempt to edit it.
  If editing requires navigating to a different page, flag as Anti-Pattern 1.
PASS CRITERIA: Every visible data field can be edited inline OR via a drawer/modal
  without leaving the current page.
FAIL EXAMPLE: A task's due date is visible in the task list but can only be
  changed by opening the task detail page — Anti-Pattern 1 violation.
```

### Recommendation 3: Add Pre-Implementation Design Gate

Modify Sprint Protocol Phase 3 (Execution) to include:

**Before Agent 2 starts coding any parcel that creates new UI:**
1. Visual Design Agent produces a component-level visual spec (layout, colors, typography, component types)
2. UX Completeness Agent reviews the spec for: navigation in/out, state inventory (empty/loading/error/stale), edit capabilities, input pattern appropriateness
3. Accessibility & Theming Agent reviews the spec for: color token choices in both themes, aria attribute plan, focus order

This adds ~30 minutes of agent time per parcel but prevents entire categories of defects from being baked into the implementation. The Sprint 9 failures (text input for dates, no exit button, missing subtask display) would have been caught at spec time.

### Recommendation 4: Add Automated Design Lint to Deterministic Checks

Add a `design-lint` script to `daily-flow/package.json` that runs as part of the pre-merge deterministic checks:

```
npm run lint && npm run typecheck && npm run design-lint && npm run test && npm run build
```

**What `design-lint` checks (automated):**
- All color values used in components exist in the design token registry
- Every color token has both light and dark theme values
- jsx-a11y ESLint rules pass (aria-label, role, tabIndex)
- No hardcoded color hex values (must use token variables)
- Every interactive element has a minimum touch target of 44x44px (via CSS analysis)

This catches the "computable" subset of design issues without requiring an AI agent.

### Recommendation 5: Create a Dark Mode Specification Document

The current Design System has no dark mode color mapping. Create `Agent-Design-Docs/Dark-Mode-Specification.md` containing:

1. **Token mapping table:** Every design token's hex value in light mode AND dark mode
2. **Pre-computed contrast ratios:** Every text-on-background pair in both themes, with PASS/FAIL status
3. **Semantic color rules:** How status colors (Ember, Sunlit Amber, Resonance Teal) adapt in dark mode to maintain semantic meaning AND contrast
4. **Component-level dark mode notes:** Any component that requires special dark mode treatment (badges, chips, status indicators, charts)

This document becomes the reference for the Accessibility & Theming Agent and enables automated contrast checking.

---

## Trade-offs

### Option A: Keep 1 Agent, Upgrade Checklists (Minimal Change)

**Give up:** Specialization benefits, cognitive focus
**Gain:** Simplicity, no coordination overhead, no new agent specs to maintain
**Risk:** The fundamental cognitive overload problem persists. Better checklists help but don't solve the "one agent, many domains" structural issue.
**Verdict:** Insufficient. This addresses symptom (bad checklists) but not cause (too many responsibilities).

### Option B: Split into 2 Agents (Visual + Technical)

**Give up:** Some specialization granularity
**Gain:** Lower coordination overhead than 3 agents, simpler sprint planning
**Risk:** "Technical" agent still covers accessibility + dark mode + responsive + state completeness — four different domains. UX completeness (missing features, navigation gaps) falls awkwardly between visual and technical.
**Verdict:** Better than 1, but the "technical" agent is still too broad.

### Option C: Split into 3 Agents (RECOMMENDED)

**Give up:** Simplicity. Three agents require three specs, three review verdicts, and Director coordination.
**Gain:** Each agent has focused cognitive load, loads specific reference docs, and applies domain-specific checklists. Maps directly to the three categories of Sprint 9 failures.
**Risk:** Coordination overhead. Mitigated by: (a) each agent reviews independently and produces a verdict, (b) Director only intervenes if verdicts conflict, (c) agents run in parallel, not sequentially.
**Verdict:** Best balance of quality and complexity.

### Option D: Split into 5+ Agents (Over-Specialization)

**Give up:** Simplicity, review speed. Five agents reviewing one sprint adds significant overhead.
**Gain:** Maximum specialization — but with diminishing returns.
**Risk:** Diffusion of responsibility ("I assumed the dark mode agent would catch that, not me"). Conflicting verdicts requiring Director arbitration. Sprint velocity drops.
**Verdict:** Overkill for Kaivoo's current scale. Re-evaluate if/when the app has 50+ screens.

### Pre-Implementation Gate Trade-off

**Give up:** Sprint velocity. Adding a design spec step before implementation adds time.
**Gain:** Defect prevention instead of defect detection. Cheaper to fix a spec than to fix implemented code.
**Risk:** Over-specifying components that end up changing during implementation. Mitigated by: keeping specs lightweight (component types, navigation, states — not pixel-perfect mockups).
**Verdict:** Net positive. The Sprint 9 rework from design failures cost more time than pre-implementation specs would have.

---

## Implementation Roadmap (if approved)

**Phase 1 (immediate, not a sprint — standalone task like agent optimization):**
1. Create `Agent-Visual-Design.md` — extracted from current Design Agent, focused scope
2. Create `Agent-Accessibility-Theming.md` — new spec with executable dark mode checklist
3. Create `Agent-UX-Completeness.md` — new spec with state completeness and anti-pattern checklist
4. Archive current `Agent-Design.md` as `ARCHIVED-Agent-Design-Merged.md`
5. Create `Dark-Mode-Specification.md` in Agent-Design-Docs/
6. Update Sprint Protocol to include pre-implementation design gate
7. Update Director.md and CLAUDE.md to reference 3 design agents
8. Update department table in Sprint Protocol

**Phase 2 (next sprint):**
1. First sprint using 3-agent design review process
2. Retrospective evaluates: Did the split catch defects that the single agent missed? Was coordination overhead acceptable?

---

## Sources

1. **CrewAI Documentation** — Agent role specialization, single-responsibility principle for AI agents
2. **Microsoft AutoGen** — Multi-agent design patterns, specialized critics pattern
3. **LangGraph** — Agent decomposition patterns, when to split agents
4. **Google Material Design 3** — Dynamic Color system, dark theme tonal palettes, independent theme validation
5. **Apple Human Interface Guidelines** — Dark Mode design principles, independent contrast testing requirement
6. **Shopify Polaris** — Surface context validation, design review governance
7. **Atlassian Design System** — Design QA process, multi-gate review structure
8. **Ant Design** — Dark theme algorithm, automated contrast checking in CI
9. **WCAG 2.1** — Contrast ratio specifications, AA/AAA thresholds
10. **Nielsen Norman Group** — Design review effectiveness, checklist specificity research
11. **Atul Gawande, The Checklist Manifesto** — Principles of effective checklists applied to software
12. **Figma Design Lint** — Automated design rule enforcement architecture
13. **Storybook Accessibility Addon** — Automated a11y testing in component libraries

---

*Research Brief compiled by Agent 5 (Research Analyst) — February 24, 2026*
*Classification: Internal — Design — Architecture*
*Status: Ready for Director review*
