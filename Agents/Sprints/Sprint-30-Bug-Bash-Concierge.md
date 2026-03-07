# Sprint 30 — Bug Bash + Concierge Hardening

**Theme:** Fix all launch-blocking bugs, harden the concierge memory architecture, polish the upload experience.
**Branch:** `sprint/30-bug-bash-concierge`
**Status:** PHASE 4 — VERIFICATION
**Compiled by:** Director
**Date:** March 7, 2026

---

## Why This Sprint Exists

Sprint 29 shipped the Flow identity. Now we fix what's broken and harden what differentiates us. Seven user-facing bugs need fixing before launch — two are data-loss-class (P0). The concierge memory architecture is Flow's competitive moat (Vision v7.2, Layers 1-2/4/7) and needs hardening before customers hit it. Upload polish rounds out the UX for v1.

---

## Input Sources

| Source | Key Takeaways |
|---|---|
| Sprint 29 retrospective | 10 items explicitly deferred to Sprint 30 (7 bugs, 3 concierge items) |
| Phase-A-Roadmap | Sprint 30 = Bug Bash + Concierge Hardening. 7 bugs, 3 concierge, 2 UX polish. |
| Agent 7 Code-Audit-Sprint-26 | P1-A (TopicPage data loss), P1-B (base64 image growth) — both P0 for launch |
| Agent 3 Data-Model-Architecture | Content column migration needed for Supabase parity |
| Vision v7.2 — Concierge Memory Architecture | Layer 4 (pre-compaction flush), Layer 1-2 (deterministic context), Layer 7 (coherence monitoring) |

---

## Scope — 3 Tracks, 12 Parcels

### Track 1: Bug Fixes

| # | Parcel | Agent | Status | Priority |
|---|---|---|---|---|
| P1 | **TopicPage data loss fix** — Added `beforeunload` handler + flush on topic/page navigation. Three data-loss scenarios covered: unmount, same-component nav, tab close. | Agent 2 | DONE | **P0** |
| P2 | **Base64 image size cap** — Added `compressImage()` with OffscreenCanvas + progressive JPEG quality (200KB target). Applied to both upload and base64 paths. | Agent 2 | DONE | **P0** |
| P3 | **Content column Supabase migration** — Migration applied (`ADD COLUMN IF NOT EXISTS`). Generated types updated. Workaround `Record<string, unknown>` casts removed from service layer. | Agent 12 | DONE | **P0** |
| P4 | **Subtask reorder** — Verified working. Full pipeline: UI → store → adapter → DB is correct. Cleaned up unnecessary cast. | Agent 2 | DONE (verified) | **P1** |
| P5 | **Today page widget reorder** — Verified working. Full @dnd-kit pipeline + dual-layer persistence (localStorage + Supabase) + RLS policies in place. | Agent 2 | DONE (verified) | **P1** |
| P6 | **Calendar widget fixes** — Replaced `return null` early return with empty state message inside widget card. Widget now always renders. | Agent 2 | DONE | **P1** |
| P7 | **Search prefix matching** — Replaced `websearch_to_tsquery` with `to_tsquery` using `:*` suffix for prefix matching. Local FTS5 already had prefix matching. | Agent 2 | DONE | **P1** |

**Dependencies:** P1 and P2 are highest priority — fix first. P3 (migration) is independent. P4–P7 can run in parallel after P1/P2.

### Track 2: Concierge Hardening

| # | Parcel | Agent | Status | Priority |
|---|---|---|---|---|
| P8 | **Pre-compaction memory flush (Layer 4)** — Added `preCompactionFlush()` in `extraction.ts`. Triggers at 40 visible messages, extracts up to 8 lasting memories with dedicated prompt. Hooked into ConciergeChat before system prompt assembly. | Agent 2 | DONE | **P0** |
| P9 | **Deterministic context assembly (Layer 1-2)** — Added `assembleConciergeContext()` in `prompt-assembler.ts`. Single entry point: soul + settings + memories + summaries → system prompt. ConciergeChat refactored to use it. No AI-generated text in system prompt. | Agent 2 + Agent 3 | DONE | **P1** |
| P10 | **Basic coherence monitoring (Layer 7)** — Created `coherence-monitor.ts` with 3 heuristic checks: name mismatch, generic response, personality drift. Logs to localStorage (`flow-coherence-log`). Observation-only. Hooked into ConciergeChat post-response. | Agent 2 | DONE | **P2** |

**Dependencies:** P8 is independent (can start immediately). P9 requires reading the existing system prompt code. P10 depends on P9 (needs to know the context assembly structure to detect drift from it).

### Track 3: UX Polish

| # | Parcel | Agent | Status | Priority |
|---|---|---|---|---|
| P11 | **Image rename on uploads** — Full pipeline: `renameFile` added to AttachmentAdapter interface + Supabase (`move`) + Local (Tauri `rename`) implementations. `useAttachments` hook exposes `rename`. FileList has inline rename UI (pencil icon → edit input → Enter/Escape/blur). | Agent 2 | DONE | **P2** |
| P12 | **Upload system polish** — Added indeterminate progress bar during upload. Upload icon scales up on drag-enter. `indeterminate` keyframe added to Tailwind config. | Agent 2 | DONE | **P2** |

**Dependencies:** P11 and P12 are independent. Lower priority — tackle after Track 1 and Track 2 are done.

---

## Agent Assignments

| Agent | Parcels | Focus |
|---|---|---|
| **Agent 2** (Staff Engineer) | P1, P2, P4, P5, P6, P7, P8, P9, P10, P11, P12 | All implementation — bugs, concierge, polish |
| **Agent 3** (Architect) | P9 (consult) | Context assembly architecture review |
| **Agent 12** (Data Engineer) | P3 | Supabase content column migration |
| **Agent 7** (Code Reviewer) | All parcels | Quality gate — reviews every parcel |
| **Agent 11** (Feature Integrity) | Sprint-level | Feature regression check against Feature Bibles |
| **Design Agents** | P5, P11, P12 (light touch) | Widget reorder UX, upload UX review |

---

## Definition of Done

### Per-Parcel
- P1: TopicPage saves flush on unmount. No data loss when navigating away mid-edit.
- P2: Pasted images compressed to <200KB. No unbounded base64 growth.
- P3: `content` column exists in Supabase `topics` and `topic_pages` tables. Migration applied.
- P4: Subtask drag-and-drop reorder persists correctly.
- P5: Today page widgets reorderable via drag-and-drop. Order persists in `widget_settings`.
- P6: Calendar widget shows fresh data. Calendar widget toggles on even with 0 events.
- P7: Search finds results on partial/prefix input ("NU" → "NUWAVE").
- P8: Long conversations trigger memory flush before context truncation.
- P9: System prompt is built deterministically from structured data. `assembleConciergeContext()` exists.
- P10: Drift signals logged after concierge responses. Logging table exists.
- P11: Users can rename uploaded images.
- P12: Upload progress visible. Drag-drop zones styled with clear feedback.

### Sprint-Level
- [x] All 7 bugs fixed and verified (P4/P5 were already working — verified; P1/P2/P3/P6/P7 fixed)
- [x] Zero data-loss scenarios remain (P1: 3 scenarios covered, P2: 200KB cap)
- [x] Concierge memory flush working in long conversations (P8: 40-msg threshold)
- [x] Context assembly is deterministic and auditable (P9: `assembleConciergeContext()`)
- [x] 265 tests passing (no regression)
- [x] Build clean, lint clean (0 errors), typecheck clean
- [ ] Bundle size within budget (<512KB uncompressed)

---

## Quality Gates

- [x] **Deterministic checks:** `npm run lint && npm run typecheck && npm run test && npm run build` — ALL PASS (265 tests, 0 lint errors, clean typecheck, build 2.58s)
- [x] **Agent 7 code audit:** PASS WITH CONDITIONS — 0 P0s, 1 P1 (fixed: memory source label), 7 P2s (accepted). Grade: A- (85/100). Report: `Agent-7-Docs/Code-Audit-Sprint-30-Review.md`
- [x] **Agent 11 feature integrity:** PASS — 0 regressions across 7 Feature Bibles, 3 P2 risks noted. Report: `Agent-11-Docs/Feature-Integrity-Sprint-30-Review.md`
- [x] **3-agent design review:** PASS — Visual Design PASS, Accessibility PASS WITH CONDITIONS (P2: touch targets pre-existing), UX Completeness PASS. Report: `Agent-Design-Docs/Design-Review-Sprint-30.md`
- [x] **Sprint file checkpoint:** All 12 parcels marked DONE, quality gates checked off
- [ ] **E2E tests:** Run against Netlify deploy preview URL

---

## Risk Register

| Risk | Mitigation |
|---|---|
| P1 (data loss) fix may require TipTap lifecycle changes | Research TipTap `onBeforeUnload` and React unmount patterns before implementation |
| P2 (base64) — canvas compression may reduce image quality | Use configurable quality threshold (0.8 JPEG), allow user to upload original as attachment |
| P3 (migration) — content column may conflict with existing data | Write migration as `ADD COLUMN IF NOT EXISTS` with nullable default |
| P8 (memory flush) — concierge may write low-quality memories under pressure | Define minimum quality criteria for flush-triggered memories |
| P10 (coherence) — false positives could generate noise | Start with logging only, no alerts. Review logs manually before automating. |
| 12 parcels is ambitious | P10, P11, P12 are P2 — can be descoped if sprint runs long |

---

## Deliberately Deferred

### To Sprint 33 (Cleanup + Hardening)
| Item | Source |
|---|---|
| Adapter layer P1 issues (7 items) | Agent 7 Code-Audit-Sprint-21 |
| Code quality: import utilities, Zod validation | Agent 7 Sprint 27 |
| Accessibility: dark mode contrast (3.8:1 → 4.5:1), Sprint 25 P1s (17 items) | Dark-Mode-Specification.md, Sprint 25 |
| Technical debt: empty state/editor co-presence, adapter gaps, htmlToPlainMarkdown, TS casts | Agent 11 Sprint 26 |
| Security: CORS hardening, rate limiting | Next-Sprint-Planning |
| Screenshots (P7 from Sprint 29) | Sprint 29 |

---

*Sprint 30 — Bug Bash + Concierge Hardening — Created March 7, 2026 by Director*
