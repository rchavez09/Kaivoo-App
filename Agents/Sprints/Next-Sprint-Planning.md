# Next Sprint Planning

**Updated:** March 4, 2026
**Last completed:** Sprint 26 (Feature Completion)
**Current sprint:** Sprint 27 (Desktop Verification) — PLANNING
**Source:** Sprint 26 post-mortem, Sprint Protocol v2.0

---

## Sprint 27: Desktop Verification — ACTIVE

See `Sprint-27-Desktop-Verification.md` for full plan.

**Theme:** Verify all Sprint 26 features work on desktop (Tauri + local SQLite). Sprint 26 skipped Track B sandbox testing — this sprint closes that gap.
**Parcels:** 5 (build verification, topic content, attachments, export, fixes)

---

## Sprint 28: Launch Ready (Next)

**Theme:** Close the last mile — deploy backend services, build the storefront, draft legal. Everything between "code complete" and "accepting money."
**Timeline:** After Sprint 27 merges.
**Scope philosophy:** No new features. Pure deployment, configuration, storefront, and legal. The product code is done. This sprint makes it purchasable.

### Track 1: Revenue Pipeline (P0)

Everything needed to go from "user clicks Buy" to "user has a working license in their app." All Sprint 25 pre-release TODO items plus end-to-end verification.

| # | Parcel | Agent | Priority |
|---|---|---|---|
| P1 | **Upload signing keys** — Add `TAURI_SIGNING_PRIVATE_KEY` to GitHub Secrets. Add license Ed25519 private key as Supabase Edge Function env var `LICENSE_PRIVATE_KEY`. | User + Agent 9 | P0 |
| P2 | **Configure Stripe products** — Create two products in Stripe Dashboard: "Kaivoo Founding Member" ($49) and "Kaivoo Standard" ($99). Record price IDs. Configure webhook endpoint + signing secret. | User + Agent 4 | P0 |
| P3 | **Deploy Edge Functions** — Deploy `license-keygen`, `license-lookup`, and `stripe-checkout` to Supabase. Set env vars. Verify reachable. | Agent 2 + Agent 9 | P0 |
| P4 | **Create Storage bucket** — Create `attachments` bucket in Supabase Storage. Configure RLS policies. | Agent 12 | P0 |
| P5 | **End-to-end payment test** — Full flow in Stripe test mode: Checkout → webhook → license key → email → activate in app. Verify both tiers. | Agent 2 + Agent 4 | P0 |

### Track 2: Landing Page (P0)

| # | Parcel | Agent | Priority |
|---|---|---|---|
| P6 | **Landing page build** — Astro static site. Hero, Features, Soul File callout, Screenshots, Pricing, FAQ, Footer. CTA → Stripe Checkout. | Agent 2 + Design Agents | P0 |
| P7 | **Deploy landing page** — Netlify site. Custom domain. SSL. OG meta tags. | Agent 9 | P0 |
| P8 | **App screenshots** — 4-6 polished screenshots (light + dark mode). | User + Design Agents | P0 |

### Track 3: Legal & Launch Prep (P1)

| # | Parcel | Agent | Priority |
|---|---|---|---|
| P9 | **EULA draft** — Attorney-review draft. Standard software license patterns. | Agent 5 | P0 |
| P10 | **Privacy Policy draft** — Local-first data handling, BYO-key model, Stripe processing. | Agent 5 | P0 |
| P11 | **Product Hunt listing draft** — Title, tagline, description, maker story, screenshots. | Agent 8 | P1 |

---

## Sprint 29: Harden & Launch

- Product Hunt launch execution
- Security hardening (Stripe webhook timestamp, CORS, rate limiting)
- Accessibility P1s (17 items from Sprint 25 design review)
- E2E test infrastructure (Playwright)
- Getting started guide / onboarding docs
- Terms of Service
- Community setup (Discord or GitHub Discussions)
- Basic analytics + error reporting (privacy-respecting)
- Code signing resolution (if accounts verified)

---

## Post-Launch Fast-Follow (Sprint 30+)

| Item | Notes |
|---|---|
| Google Calendar integration | MCP server exists: `mcp-server-google-calendar` |
| Gmail integration | MCP server exists: `mcp-server-gmail` |
| Soul file Phase 2 | Embedding-based retrieval, memory decay, MCP server |
| Topic-level AI access controls | Per-topic `ai_access` toggle |
| Mobile responsive design | Layout, touch targets, navigation. PWA support. |
| White-label config | Logo, colors, app name as settings |
| Notifications & reminders | System notifications for tasks, calendar events |

---

## Backlog (Lower Priority)

### Vault Enhancements

| Item | Notes |
|---|---|
| In-vault markdown editor | Full editing surface inside the vault browser (Phase B) |
| Wikilinks + backlinks | Requires content indexing |
| File type filtering (PDF, image, etc.) | After basic browser works |
| Folder templates ("New Client Project") | After core vault is stable |
| Vault organization: move, sort, manual reorder | Hybrid approach: opinionated defaults + full user freedom |

### Deferred Features (P2)

| Item | Source |
|---|---|
| "Don't Miss Twice" forgiveness | Sprint 18 |
| Year in Pixels | Sprint 18 |
| AI "Organize My Day" | Sprint 18 |
| Filter/entity toggle system | Sprint 18 |
| Timed habits | Sprint 18 |
| Cross-platform shortcut recording | Sprint 18 |

---

*Next Sprint Planning — Updated March 4, 2026 — Sprint 27 (Desktop Verification) active, Sprint 28 (Launch Ready) staged, Sprint 29+ outlined*
