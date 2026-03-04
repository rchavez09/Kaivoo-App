# Next Sprint Planning

**Updated:** March 3, 2026
**Last completed:** Sprint 24 (Soul File & Concierge)
**Current sprint:** Sprint 25 (Ship Prep & Desktop Polish) — in progress
**Source:** Vision v5.1, Sprint 24 retrospective, Agent 5 research (license keys, code signing, auto-updater)

---

## Sprint 25: Ship Prep & Desktop Polish (ACTIVE)

See `Sprint-25-Ship-Prep.md` for full spec.

**Theme:** Make the product purchasable, installable, and updatable. Fix deferred UX debt.
**Tracks:** UX Debt (4 parcels) + License Keys (4 parcels) + Desktop Distribution (5 parcels) + File Attachments (2 parcels) + Quality & Bundle (2 parcels) = 17 parcels.

---

## Sprint 26: Launch Prep

**Theme:** Landing page, legal, marketing site, Product Hunt prep. The last mile before real users.

### Track 1: Landing Page & Marketing Site (P0)

| Parcel | Description |
|---|---|
| Landing page | Positioning, pricing table, screenshots, CTA → Stripe Checkout flow. "Own your AI's memory" messaging. Deploy to marketing domain. |
| Product Hunt listing draft | Title, tagline, description, screenshots, maker story. Ready to submit on launch day. |

### Track 2: Legal (P0)

| Parcel | Description |
|---|---|
| EULA / proprietary license | License terms for one-time purchase. Personal or internal business use. No redistribution. Attorney review required. |
| Privacy policy | Data handling, BYO-key model, local-first storage, no telemetry. |
| Terms of service | For web version and any future subscription tiers. |

### Track 3: Polish & Hardening (P1)

| Parcel | Description |
|---|---|
| Getting started guide | Quick setup doc, BYO key walkthrough, FAQ. In-app or shipped with desktop. |
| General polish pass | Reserve capacity for issues discovered during Sprint 25 testing. |
| Navigate_to tool | Low priority — if time permits. |

---

## Sprint 27: Launch

- Product Hunt listing + launch day plan
- Community setup (Discord or GitHub Discussions)
- Basic analytics + error reporting (privacy-respecting)
- Monitor, respond, iterate

---

## Post-Launch Fast-Follow (Sprint 28+)

| Item | Notes |
|---|---|
| Google Calendar integration | MCP server exists: `mcp-server-google-calendar`. Evaluate for faster delivery. |
| Gmail integration | MCP server exists: `mcp-server-gmail`. Evaluate alongside Calendar. |
| Soul file Phase 2 | Embedding-based retrieval when memories > 200, memory decay, MCP server exposure |
| Topic-level AI access controls | Per-topic `ai_access` toggle |
| Mobile responsive design | Layout, touch targets, navigation. PWA support. |
| Outlook integration | After Google Calendar/Gmail |
| White-label config | Logo, colors, app name as settings |
| Notifications & reminders | System notifications for tasks, calendar events |
| E2E tests for AI features | Mock LLM responses or recorded fixtures |
| Supabase Edge Function deployment pipeline | CI step for `supabase functions deploy` |

---

## Backlog (Lower Priority)

### Vault Enhancements

| Item | Notes |
|---|---|
| Drag-and-drop file upload | After file browser is stable |
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

*Next Sprint Planning — Updated March 3, 2026 — Sprint 25 active, Sprint 26+ staged*
