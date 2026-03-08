# Sprint 33 — Bug Bash

**Theme:** Fix user-facing bugs. Clean first impression. Ship-critical only.
**Branch:** `sprint/33-bug-bash-vault`
**Status:** PLANNING
**Compiled by:** Dev Director
**Date:** March 8, 2026 (rescoped from March 7 original)

---

## Why This Sprint Exists

CEO Session #13 redefined V1 as an AI agent orchestration platform with an April 14, 2026 launch date. Sprint 33 is rescoped to bug fixes only — no vault overhaul, no settings audit, no polish. The goal is to clear user-visible bugs in 1 day so we can move to the AI/Orchestrator features that define the product.

Vault architecture, color pickers, settings audit, and dark mode contrast are deferred to post-launch per V1 scope lock.

**Result:** No embarrassing bugs on first impression. Product functions cleanly. Ready for AI feature sprints.

---

## Input Sources

| Source | Key Takeaways |
|---|---|
| CEO Session #13 (March 8, 2026) | V1 redefined as AI orchestration platform. Sprint 33 rescoped to bug fixes only. April 14 launch. |
| CEO Session #12 (March 7, 2026) | Pre-launch audit: 15 items. Bug fixes kept, vault/settings/polish deferred post-launch. |
| Agent 7 Sprint 30 audit | P2-B: dead code in compressImage. P2-C: floating-point comparison. |
| Agent 11 Sprint 30 review | RISK-2: `to_tsquery` special character handling. |

---

## Parcels

### Track 1 — User-Facing Bug Fixes (Agent 2)

#### P1: Fix HTML Rendering Throughout App
**Source:** CEO #12
**Status:** PENDING
**Agent:** Agent 2

Content displays as raw HTML in topic folders and other areas throughout the app. Audit all content rendering paths — topic pages, notes, vault file preview, project descriptions — and ensure HTML is properly rendered or converted to markdown.

**Definition of Done:**
- [ ] No raw HTML visible anywhere in the app (topics, notes, projects, vault)
- [ ] Content renders correctly in both light and dark mode
- [ ] Manual walkthrough of all content-displaying surfaces confirms clean rendering

---

#### P2: Fix Kanban Board — All States Functional
**Source:** CEO #12
**Status:** PENDING
**Agent:** Agent 2

Currently only Todo→Done transitions work on the Kanban board. All existing states (Todo, In Progress, Done, and any others) must support drag-and-drop transitions between all valid state combinations.

**Definition of Done:**
- [ ] All existing Kanban states accept drag-and-drop from any other state
- [ ] Cards visually update column on drop
- [ ] State change persists after page refresh
- [ ] No console errors during any state transition

---

#### P3: Wiki-Link Rendering as Clickable Links
**Source:** CEO #12
**Status:** PENDING
**Agent:** Agent 2

`[[Page/Name]]` currently displays as raw text. Should render as a highlighted, clickable link — visually consistent with how `#hashtags` render. Clicking navigates to the referenced page/topic.

**Definition of Done:**
- [ ] `[[Page]]` and `[[Topic/Page]]` render as highlighted clickable links
- [ ] Visual style consistent with hashtag rendering
- [ ] Click navigates to the referenced entity
- [ ] Graceful handling of broken links (entity doesn't exist)

---

#### P4: Library Sidebar Icon → Folder
**Source:** CEO #12
**Status:** PENDING
**Agent:** Agent 2

Current Knowledge/Library icon looks too similar to the Insights icon. Replace with a Folder icon (user preferred the folder icon previously).

**Definition of Done:**
- [ ] Sidebar uses Folder icon for Knowledge entry
- [ ] Visually distinct from all other sidebar icons

---

#### P5: Hide Gantt Chart Until Phase B
**Source:** CEO #12
**Status:** PENDING
**Agent:** Agent 2

Current Gantt implementation is superficial (colored lines only). Hide the Gantt view from the UI entirely — remove the tab/toggle/route. Will be rebuilt properly in Phase B using `frappe-gantt` or similar.

**Definition of Done:**
- [ ] Gantt view is not accessible from any UI surface
- [ ] No dead routes or broken navigation from removal
- [ ] Code remains in codebase (commented or feature-flagged) for Phase B rebuild

---

### Track 2 — Cleanup (Agent 2)

#### P6: Remove Hardcoded Seed Data from useKaivooStore
**Source:** CEO #13 code audit
**Status:** PENDING
**Agent:** Agent 2

`useKaivooStore.ts` contains ~230 lines of hardcoded seed data including real project names ("NUWAVE", "Amani"), meeting names, and task descriptions. New users see these before auth loads. Remove all seed data — initial state should be empty arrays.

**Definition of Done:**
- [ ] All hardcoded seed data removed from initial state
- [ ] Initial state uses empty arrays for all entity collections
- [ ] App functions correctly with empty state (no crashes on empty lists)
- [ ] Demo/onboarding data handled separately if needed (not baked into store)

---

#### P7: `to_tsquery` Special Character Sanitization
**Source:** Agent 11 Sprint 30 (RISK-2)
**Status:** PENDING
**Agent:** Agent 2

Search queries with special characters (parentheses, ampersands, colons) can break `to_tsquery`. Sanitize input before passing to FTS.

**Definition of Done:**
- [ ] Special characters stripped or escaped before `to_tsquery`
- [ ] Search works with inputs containing `()`, `&`, `:`, `!`, `|`
- [ ] No console errors on edge-case search inputs

---

#### P8: Dead Code + Floating-Point Fix in compressImage
**Source:** Agent 7 Sprint 30 (P2-B, P2-C)
**Status:** PENDING
**Agent:** Agent 2

Remove dead code in `compressImage` loop and fix floating-point comparison.

**Definition of Done:**
- [ ] Dead code removed
- [ ] Floating-point comparison fixed (use epsilon or integer comparison)
- [ ] Image compression still works correctly

---

#### P9: Add `.env` to `.gitignore`
**Source:** CEO #13 code audit
**Status:** PENDING
**Agent:** Agent 2

`.env` file containing live Supabase keys is not in `.gitignore`. Add it to prevent credential exposure in git history.

**Definition of Done:**
- [ ] `.env` added to `.gitignore`
- [ ] `.env.example` remains tracked with placeholder values
- [ ] Verify `.env` is not already committed (if so, document for key rotation)

---

## Quality Gates

```
□ Deterministic checks: npm run lint && npm run typecheck && npm run test && npm run build
□ Agent 7 code audit (no unresolved P0)
□ Agent 11 feature integrity check (no regressions)
□ 3-agent design review: Visual Design + Accessibility & Theming + UX Completeness (all PASS)
□ Sprint file checkpoint: all parcels marked final status
□ PR opened to main, CI passes
□ E2E tests pass against deploy preview URL
□ Sandbox Track A (Web): User reviews deploy preview
□ Merge PR to main
```

---

## Deliberately Deferred (from original Sprint 33 scope)

### Moved to Post-Launch (per CEO #13 V1 scope lock)
- Vault architecture overhaul (individual .md files, topic-based filing) — CEO #12 P6-P9
- Topic/Project color pickers — CEO #12 P11
- Settings page audit — CEO #12 P12
- Dark mode contrast fix — Sprint 25 deferred
- Remove AI features toggle — CEO #12 P10
- Inbox → "Quick Captures" rename — CEO #12 P9
- Journal → Notes rename — CEO #12 P8

### To Sprint 34+ (V1 Launch Plan)
- Full-page AI Chat Page — Sprint 34
- AI execution tools debugging — Sprint 35-36
- Configurable Heartbeat — Sprint 37
- Neuron Memory V1 — Sprint 38
- Orchestrator Page (Agents/Skills/Workflows/MCPs) — Sprints 39-45
- Workflow Execution Engine — Sprints 46-47
- Artifact System — Sprints 48-49
- Safety Layer — Sprint 50
- Thinking Transparency — Sprint 51

See `Next-Sprint-Planning.md` for full 5-week plan → April 14 launch.

---

## Metrics

| Metric | Target | Actual |
|---|---|---|
| Parcels | 9 | |
| Build passes | Yes | |
| Lint clean | Yes | |
| Typecheck clean | Yes | |
| Tests pass | Yes | |

---

*Sprint 33 — Bug Bash — Originally compiled March 7, 2026. Rescoped March 8, 2026 per CEO Session #13.*
