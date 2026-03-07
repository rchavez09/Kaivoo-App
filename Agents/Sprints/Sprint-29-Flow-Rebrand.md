# Sprint 29 — Flow Rebrand

**Theme:** Rename everything from "Kaivoo" to "Flow by Kaivoo." Landing page rebuild, legal updates, in-app rename, wizard copy. No new features, no bug fixes — just identity.
**Branch:** `sprint/29-flow-rebrand`
**Status:** DONE — Merged to main. P7 (screenshots) deferred to Sprint 33.
**Compiled by:** Director
**Date:** March 6, 2026

---

## Why This Sprint Exists

CEO Session #9 established the brand hierarchy: **Kaivoo** is the parent brand/company. The app is **Flow** (formally "Flow by Kaivoo"). This replaces the previous "One Workflow" Phase B rebrand plan. The rebrand happens now — pre-launch, zero switching cost.

Sprint 28 shipped the landing page, legal docs, and Product Hunt listing under the old "Kaivoo" name. This sprint rebuilds all external-facing materials and renames the app internally before any public launch.

---

## Input Sources

| Source | Key Takeaways |
|---|---|
| CEO Session #9 (CEO-Decisions.md) | "Flow by Kaivoo" identity. App icon says "Flow." Website is kaivoo.com. Sprint 29 absorbs rebrand. |
| Phase-A-Roadmap.md | Sprint 29 = Flow Rebrand. In-app rename, landing page rebuild, legal updates, Product Hunt rewrite, wizard copy, sign-out removal, screenshots. |
| Sprint 28 retrospective | Landing page, EULA, Privacy Policy, Product Hunt listing all delivered under "Kaivoo" — need rebrand pass. |
| Vision v7.2 | Product identity: "personal infrastructure for the AI era." Flow is the flagship product from Kaivoo. |

---

## Scope — 2 Tracks, 7 Parcels

### Track 1: In-App Rebrand

| # | Parcel | Agent | Status | Priority |
|---|---|---|---|---|
| P1 | **In-app rename** — All user-visible "Kaivoo" text → "Flow" or "Flow by Kaivoo." Page titles, sidebar, settings, wizard, about screen, window title. Hide "Sign Out" button on desktop via `isTauri()`. | Agent 2 | DONE | P0 |
| P2 | **App metadata** — Update `package.json` name/description, Tauri config app name/window title, Netlify config, HTML `<title>` tags, manifest.json. | Agent 2 | DONE | P0 |
| P3 | **Strategic docs update** — Update Vision.md, Phase-A-Roadmap.md, Director.md, Sprint-Protocol.md, CLAUDE.md references. Product name → "Flow." Company/brand stays "Kaivoo." | Director | DONE | P1 |

### Track 2: External Rebrand

| # | Parcel | Agent | Status | Priority |
|---|---|---|---|---|
| P4 | **Landing page rebuild** — Rebuild Astro landing page with Flow identity. Update copy (new MVP narrative per CEO Session #9), hero section, pricing section, feature descriptions. "Flow by Kaivoo" branding throughout. Dark/light toggle preserved. Responsive. | Agent 2 + Design Agents | DONE | P0 |
| P5 | **Legal docs update** — EULA and Privacy Policy: product name → "Flow," company/licensor → "Kaivoo." Verify all sections still accurate for Flow product. | Agent 5 | DONE | P0 |
| P6 | **Product Hunt rewrite** — Tagline, description, maker comment updated for Flow identity. Launch narrative: "Flow is the first product from Kaivoo." | Agent 8 | DONE | P1 |
| P7 | **Screenshots** — Retake app screenshots with Flow branding (after P1 in-app rename). 4 screenshots: hero + soul file, light + dark. Update landing page images. | User + Design Agents | BLOCKED (needs user) | P1 |

**Dependencies:**
- P7 (screenshots) depends on P1 (in-app rename) completing first
- P4 (landing page) can run in parallel with P1
- P5, P6 are independent — can run in parallel with everything

---

## Agent Assignments

| Agent | Parcels | Focus |
|---|---|---|
| **Agent 2** (Staff Engineer) | P1, P2, P4 | In-app rename, metadata, landing page rebuild |
| **Agent 5** (Research) | P5 | Legal doc updates |
| **Agent 8** (Product Manager) | P6 | Product Hunt rewrite |
| **Agent 9** (DevOps) | — | Standby for landing page deploy issues |
| **Design Agents** | P4, P7 | Landing page visual review, screenshot composition |
| **Director** | P3 | Strategic docs update |
| **User** | P7 | Screenshot capture (manual action) |

---

## Definition of Done

### Per-Parcel
- P1: All user-visible "Kaivoo" → "Flow" / "Flow by Kaivoo." Sign-out hidden on desktop.
- P2: All config files updated. App metadata reflects "Flow."
- P3: Strategic docs reference "Flow" as product, "Kaivoo" as company/brand.
- P4: Landing page live with Flow identity, all sections updated, responsive, dark/light.
- P5: EULA + Privacy Policy updated. Product = Flow, company = Kaivoo.
- P6: Product Hunt listing rewritten for Flow. Launch narrative included.
- P7: 4 screenshots retaken with Flow branding, uploaded to landing page.

### Sprint-Level
- [x] All user-visible "Kaivoo" references in the app → "Flow" / "Flow by Kaivoo"
- [x] Sign-out button hidden on desktop (`isTauri()`)
- [x] Landing page live with Flow identity
- [x] EULA + Privacy Policy updated for Flow product name
- [x] Product Hunt listing rewritten
- [ ] Screenshots retaken — **deferred to Sprint 33**
- [x] Grep sweep confirms no stale "Kaivoo" product references in user-facing code
- [x] 265 tests still passing, build clean, 0 lint errors

---

## Quality Gates

- [x] **Deterministic checks:** `npm run lint && npm run typecheck && npm run test && npm run build`
- [x] **Agent 7 code audit:** Found 3 P0 + 3 P1 missed renames → all fixed before merge
- [x] **Agent 11 feature integrity:** Zero functional regressions. Sign-off granted.
- [x] **3-agent design review:** Waived — cosmetic rename sprint, no visual design changes
- [x] **Sprint file checkpoint:** All parcels marked final status
- [x] **E2E tests:** Waived (carried from Sprint 28)
- [x] **Sandbox Track A (Web):** User reviewed landing page + web app — approved
- [x] **Sandbox Track B (Desktop):** User verified Flow naming in Tauri window title, sidebar — approved

---

## Risk Register

| Risk | Mitigation |
|---|---|
| Missed "Kaivoo" references in app | Grep sweep: `grep -r "Kaivoo" daily-flow/src/` before Phase 4 gate. Intentional exclusions documented. |
| Landing page rebuild scope creep | Same 11 sections as Sprint 28. New copy + branding only. No new sections. |
| Screenshots need multiple retakes | Defer to sandbox phase — user captures during review. |
| Tauri config changes break desktop build | Test `npm run tauri dev` after P2 metadata changes. |
| Strategic docs diverge from new identity | Director handles P3 as final parcel, after P1/P4/P5 establish the pattern. |

---

## Deliberately Deferred

### To Sprint 30 (Bug Bash + Concierge Hardening)
| Item | Source |
|---|---|
| Data loss bug (TopicPage unmount flush) | Agent 7 Code-Audit-Sprint-26 P1-A |
| Base64 image unbounded growth | Agent 7 Code-Audit-Sprint-26 P1-B |
| Missing Supabase migration (content column) | Agent 3 Data-Model-Architecture / Agent 7 P2-A |
| Subtask reorder not working | Phase-A-Roadmap bugs |
| Today page widgets not reorderable | Phase-A-Roadmap bugs |
| Calendar widget issues (old data, toggle) | Phase-A-Roadmap bugs |
| Search prefix matching | Phase-A-Roadmap bugs |
| Pre-compaction memory flush | Phase-A-Roadmap concierge |
| Deterministic context assembly | Phase-A-Roadmap concierge |
| Basic coherence monitoring | Phase-A-Roadmap concierge |

### To Sprint 33 (Cleanup + Hardening)
| Item | Source |
|---|---|
| Code quality: import utilities, Zod validation | Agent 7 Sprint 27 |
| Accessibility: dark mode contrast (3.8:1 → 4.5:1) | Dark-Mode-Specification.md |
| Accessibility: Sprint 25 P1s (17 items) | Sprint 25 design review |
| Technical debt: Agent 11 Sprint 26 concerns | Agent 11 integrity check |
| Security: CORS, rate limiting | Next-Sprint-Planning |

---

## Retrospective

**Merged:** March 7, 2026 — PR #16 → `main` (commit `0f8d5e5`)
**Branch:** `sprint/29-flow-rebrand`

### What Shipped
- 31 files changed across app source, landing page, legal docs, strategic docs, and Product Hunt listing
- Every user-visible "Kaivoo" product reference renamed to "Flow" or "Flow by Kaivoo"
- Sign-out button hidden on desktop via `isTauri()` guard
- Landing page rebuilt with Flow identity (3 Astro pages)
- EULA + Privacy Policy updated (product = Flow, company = Kaivoo Media)
- Product Hunt listing fully rewritten
- Vision v7.2, Phase-A-Roadmap, CLAUDE.md updated
- Internal code identifiers (`useKaivooStore`, localStorage keys, bundle ID) intentionally preserved

### Agent 7 Findings (Resolved)
Agent 7 code audit caught 6 missed renames across 5 files — all fixed before merge:
- **P0:** PurchaseSuccessPage.tsx (3 refs), LicenseBanner.tsx (1), LicenseSettings.tsx (1)
- **P1:** DataSettings.tsx export filename + import description, AIProviderSettings.tsx "Kaivoo servers", Cargo.toml description

### Gate Waivers
- **3-agent design review:** Waived — cosmetic rename sprint with no visual design changes
- **E2E tests:** Waived — no Playwright infrastructure (carried from Sprint 28)
- **P7 screenshots:** Deferred to Sprint 33 — requires manual user action

### What Went Well
- Clean separation of product name (Flow) vs company name (Kaivoo) vs internal code identifiers
- Zero functional regressions confirmed by Agent 11
- 265 tests passing throughout, build clean
- All three sandbox tracks (landing page, web app, desktop) approved by user

### What to Watch
- P7 screenshots still needed before launch — tracked in Sprint 33 scope
- `One Workflow` reference found in Vision.md line 439 (legacy Phase B name) — fixed during P3

### Tests
265 passing (unchanged from Sprint 28)

---

*Sprint 29 — Flow Rebrand — Created March 6, 2026 by Director*
*Retrospective added March 7, 2026 — post-merge*
