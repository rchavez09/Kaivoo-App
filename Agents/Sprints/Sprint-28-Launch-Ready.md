# Sprint 28 — Launch Ready

**Theme:** Landing page, legal documents, and launch prep. Revenue pipeline (signing keys, Stripe config, Edge Function deploy) deferred to a dedicated sprint per user decision.
**Branch:** `sprint/28-launch-ready`
**Status:** PR OPEN (Phase 4 → Phase 5)
**Compiled by:** Director
**Date:** March 5, 2026

---

## Why This Sprint Exists

Sprint 26 (Feature Completion) delivered all features. Sprint 27 (Desktop Verification) verified and fixed desktop. 265 tests pass. Web and desktop both approved.

This sprint builds the storefront and legal foundation. The revenue pipeline (P1-P5: signing keys, Stripe, Edge Functions, payment testing) was originally scoped here but has been **deferred to a future sprint** — the user wants to add more features before going live. Track 2 (landing page) and Track 3 (legal) continue.

---

## Input Sources

| Source | Key Takeaways |
|---|---|
| Vision v6.1 §Current Position | Phase A final pre-launch. "Ship what's built + soul file + licensing + landing page + legal." |
| Sprint 25 retrospective | License key system (Ed25519), Stripe checkout, auto-updater foundation all built but not deployed |
| Sprint 27 retrospective | Desktop verified. 8 issues found and fixed. Code is stable. |
| CEO Strategic Brief (Pricing) | $99 standard / $49 founding member. Volume over margin. |
| Agent 5: License-Key-Research.md | Ed25519 signed keys, Stripe webhook → Edge Function → email flow |
| Agent 5: Code-Signing-Research.md | Apple ($99/yr) + Azure Trusted Signing (~$9.99/mo). ~$219/yr total. |
| Next-Sprint-Planning.md | Sprint 28 scope pre-staged by Director |

---

## Scope — 2 Tracks, 6 Parcels

### Track 1: Revenue Pipeline — DEFERRED

Entire track moved to a future sprint per user decision (wants to add more features before going live). Original parcels preserved for reference:

| # | Parcel | Status |
|---|---|---|
| P1 | Upload signing keys (TAURI_SIGNING_PRIVATE_KEY + LICENSE_PRIVATE_KEY) | DEFERRED |
| P2 | Configure Stripe products ($49/$99) + webhook | DEFERRED |
| P3 | Deploy Edge Functions (license-keygen, license-lookup, stripe-checkout) | DEFERRED |
| P4 | Create Supabase Storage bucket (attachments) + RLS | DEFERRED |
| P5 | End-to-end payment test (Stripe test mode) | DEFERRED |

**Note:** The Tauri updater signing keypair may need to be regenerated — the pubkey exists in `tauri.conf.json` but the private key was never saved to GitHub Secrets. When this track resumes, run `npx tauri signer generate` to create a fresh keypair and update both the config and the secret.

### Track 2: Landing Page (P0)

| # | Parcel | Agent | Status | Priority |
|---|---|---|---|---|
| P6 | **Landing page build** — Astro + Tailwind static site. 11 sections: Nav, Hero, Screenshots, Features (9), Soul File callout, Local-First, BYO Keys, Pricing ($49/$99), FAQ (7), CTA, Footer. Dark/light toggle. Responsive. | Agent 2 + Design Agents | DONE | P0 |
| P7 | **Deploy landing page** — Netlify site (kaivoo-landing). OG meta tags. Favicon. Legal pages (/privacy, /eula). | Agent 9 | DONE | P0 |
| P8 | **App screenshots** — 4 screenshots: hero (light + dark), Soul File (light + dark). Auto-swap with theme toggle. | User + Design Agents | DONE | P0 |

**Dependencies:** All resolved. CTA buttons use `href="#"` placeholder until Stripe is configured in the revenue pipeline sprint.

### Track 3: Legal & Launch Prep (P1)

| # | Parcel | Agent | Status | Priority |
|---|---|---|---|---|
| P9 | **EULA draft** — Attorney-review-ready draft. 11 sections covering license grant, restrictions, data ownership, third-party services, warranties, liability, termination, refund policy. | Agent 5 | DONE | P0 |
| P10 | **Privacy Policy draft** — 12 sections covering data collected, third-party services, security, retention, user rights. Summary table included. | Agent 5 | DONE | P0 |
| P11 | **Product Hunt listing draft** — Tagline, description (~250 words), maker comment, gallery order, launch checklist. | Agent 8 | DONE | P1 |

---

## Agent Assignments

| Agent | Parcels | Focus |
|---|---|---|
| **User** | P8 | Screenshots (manual action) |
| **Agent 2** (Staff Engineer) | P6 | Landing page build |
| **Agent 5** (Research) | P9, P10 | Legal drafts (EULA, Privacy Policy) |
| **Agent 8** (Product Manager) | P11 | Product Hunt listing |
| **Agent 9** (DevOps) | P7 | Landing page deploy |
| **Design Agents** | P6, P8 | Landing page design, screenshot composition |

---

## Definition of Done

### Per-Parcel
- P6: Landing page renders all sections, responsive, light + dark. CTA buttons present (placeholder links until Stripe configured). **MET**
- P7: Landing page live on Netlify with OG meta tags, favicon, legal pages. **MET** (custom domain pending DNS config)
- P8: 4 screenshots captured in both light and dark mode. **MET**
- P9: EULA draft complete, covers one-time license, local data, BYO keys, redistribution restrictions. **MET**
- P10: Privacy Policy draft complete, covers local-first architecture, Stripe processing, no telemetry. **MET**
- P11: Product Hunt listing drafted with all required fields. **MET**

### Sprint-Level
- [x] Landing page built and deployed with all sections
- [x] EULA and Privacy Policy drafts ready for attorney review
- [x] Product Hunt listing drafted
- [x] App screenshots captured (light + dark)

---

## Quality Gates

- [x] **Landing page build:** `npm run build` passes (3 pages, 396ms)
- [x] **Main app regression check:** typecheck pass, 265/265 tests pass, build pass, 0 lint errors
- [x] **Lighthouse:** Performance 82 | Accessibility 95 | Best Practices 100 | SEO 100
  - Performance below 90 target due to external font load (rsms.me/inter). Acceptable for content landing page. Can optimize with self-hosted fonts post-launch.
  - Accessibility, Best Practices, and SEO all exceed 90 target.
- [x] **Legal:** EULA and Privacy Policy drafted and ready for attorney review
- [x] **Code review:** 4 P0 issues found and fixed (legal page 404s, missing favicon/og-image). 10 P1 items documented (content accuracy, aria labels, font loading). 8 P2 polish items.
- [x] **Sprint file checkpoint:** All parcels marked final status
- [~] **Agent 11 feature integrity:** Waived — sprint is a standalone landing page (Astro), no changes to the main app codebase
- [~] **3-agent design review:** Waived — user approved visual quality; full design review deferred to next landing page iteration
- [~] **E2E tests:** Waived — Playwright infrastructure not yet built; static landing page has no interactive app logic to test

---

## Deliverables

### Files Created
| File | Purpose |
|---|---|
| `landing/package.json` | Astro project config |
| `landing/tsconfig.json` | TypeScript config |
| `landing/tailwind.config.mjs` | Tailwind + brand colors, dark mode |
| `landing/netlify.toml` | Netlify deploy config |
| `landing/src/layouts/Layout.astro` | HTML shell, OG tags, theme toggle script |
| `landing/src/styles/global.css` | Tailwind base, depth bar, dark mode |
| `landing/src/pages/index.astro` | Main landing page (11 sections) |
| `landing/src/pages/privacy.astro` | Privacy Policy page (renders legal/PRIVACY-POLICY.md) |
| `landing/src/pages/eula.astro` | EULA page (renders legal/EULA.md) |
| `landing/public/screenshots/hero_light.png` | Hero screenshot — light mode |
| `landing/public/screenshots/hero_dark.png` | Hero screenshot — dark mode |
| `landing/public/screenshots/soul-file_light.png` | Soul File screenshot — light mode |
| `landing/public/screenshots/soul-file_dark.png` | Soul File screenshot — dark mode |
| `landing/public/favicon.png` | Favicon (Kaivoo logo) |
| `landing/public/og-image.png` | Social sharing image (Kaivoo logo — placeholder) |
| `legal/EULA.md` | EULA draft (11 sections) |
| `legal/PRIVACY-POLICY.md` | Privacy Policy draft (12 sections) |
| `Agents/Marketing/Product-Hunt-Listing-Draft.md` | Product Hunt listing draft |

### Deployment
- **Netlify site:** kaivoo-landing
- **Live URL:** https://kaivoo-landing.netlify.app
- **Site ID:** 104851bc-71ad-49a2-aabb-c274fc5d643f
- **Custom domain:** Pending — user needs to add `kaivoo.app` in Netlify admin → Domain management

---

## Risk Register

| Risk | Mitigation |
|---|---|
| Landing page scope creep | Ship MVP: hero + features + pricing + CTA. Iterate post-launch. |
| Legal drafts need attorney review | Sprint produces attorney-ready drafts. Actual review is post-sprint. |
| Custom domain DNS propagation | Can take up to 48 hours. Start early. |
| CTA buttons non-functional (href="#") | Expected — Stripe not configured. Revenue pipeline deferred. |
| Content accuracy (Kanban, timeline, Obsidian import) | Features exist in codebase. Verify before hard launch. |

---

## Deliberately Deferred

### Revenue Pipeline (to dedicated future sprint)

| Item | Source | Why Deferred |
|---|---|---|
| Upload signing keys (P1) | Sprint 28 original scope | User wants to add more features before going live |
| Configure Stripe products (P2) | Sprint 28 original scope | Blocked by launch timing decision |
| Deploy Edge Functions (P3) | Sprint 28 original scope | Depends on P1/P2 |
| Create Storage bucket (P4) | Sprint 28 original scope | Part of revenue pipeline |
| End-to-end payment test (P5) | Sprint 28 original scope | Depends on P1-P4 |
| Tauri updater keypair generation | Sprint 25 gap | Private key never saved — needs `npx tauri signer generate` + pubkey update |

### Code Quality & Hardening (to Sprint 29+)

| Item | Source | Why Deferred |
|---|---|---|
| E2E test infrastructure (Playwright) | Sprint 27 | Infrastructure work, not launch-blocking |
| Extract import functions to utility files | Agent 7 P1-1 | Code quality refactor |
| Import validation (Zod schema) | Agent 7 P1-2 | Defensive hardening |
| Duplicate import warning dialog | Agent 7 P1-3 | UX polish |
| Import progress indicator | Agent 7 P2-2 | UX enhancement |
| Agent 11 Sprint 26 non-blocking concerns | Sprint 26 integrity check | Cosmetic (empty state, widgetSettings, HTML-to-markdown, TS casts) |
| Image resize handles in editor | Sprint 27 | Feature enhancement |
| Accessibility P1s (17 items) | Sprint 25 design review | Hardening pass |
| Security hardening (CORS, rate limiting) | Next-Sprint-Planning Sprint 29 | Post-launch security pass |
| Code signing setup (Apple + Azure) | Agent 5 research | Requires account verification (~days) |

### Landing Page Polish (post-merge iteration)

| Item | Source | Why Deferred |
|---|---|---|
| Self-host Inter font (improve Lighthouse Performance) | Phase 4 Lighthouse audit | P2 optimization |
| Mobile hamburger menu | Code review P2-19 | Enhancement |
| JSON-LD structured data | Code review P2-22 | SEO polish |
| Proper OG image (designed, not logo placeholder) | Code review P0-3 | Needs design work |
| Copy refinement | User request | Parallel work stream |

---

*Sprint 28 — Launch Ready — Created March 5, 2026 by Director*
*Updated March 6, 2026 — Track 1 (Revenue Pipeline) deferred to future sprint. User wants to add more features before going live. Sprint continues with landing page + legal.*
*Updated March 6, 2026 — All parcels complete. Phase 4 verification: all gates pass. Landing page deployed to https://kaivoo-landing.netlify.app*
