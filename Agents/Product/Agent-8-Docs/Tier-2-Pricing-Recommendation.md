# Tier 2 Pricing Recommendation

**Date:** March 7, 2026
**Author:** Agent 8 (Product Manager)
**Status:** COMPLETE — CEO DECISIONS MADE (March 7)
**Inputs:** Supabase Cost Model (Agent 5), Managed AI Cost Model (Agent 5), Storage Tier Model (Agent 5), Free Trial Cost Model (Agent 5), Competitive Pricing Teardown (Agent 8)

---

## Executive Summary

All seven research parcels are complete. The numbers are clear:

- **Supabase infrastructure:** $0.10-0.25/user/mo
- **Managed AI (smart-routed):** $0.62/user/mo blended
- **Storage (10 GB):** $0.35-0.83/user/mo
- **Total blended cost:** ~$1.07-1.70/user/mo
- **Free trial:** $0.39/user (14 days, 25 AI messages)

**Recommendation: $9/mo annual ($108/yr) / $12/mo monthly. One plan. 10 GB storage. Managed AI bundled (50 msgs/day). 81-86% gross margin.**

---

## The Pricing Decision

### Recommended: $9/mo (annual) / $12/mo (monthly)

| Factor | Analysis |
|---|---|
| **Cost floor** | $1.70/user/mo blended (infra + AI + storage) |
| **$9/mo margin** | $7.30/user = 81% gross |
| **$12/mo margin** | $10.30/user = 86% gross |
| **Competitive anchor** | Notion Plus ($8-10), Obsidian Sync ($8), Morgen ($9) |
| **Annual discount** | 25% ($9 vs $12) — incentivizes commitment |
| **Break-even** | 3 users at $10/mo covers Supabase Pro base |
| **Psychological** | $9 = "under $10" feels accessible; $12 = still reasonable for no-commitment |

### Why Not $8/mo?

- Only $1 less than Notion Plus. Signals "cheap" rather than "great value"
- At $8/mo annual = $96/yr. Rounds awkwardly. $108/yr ($9/mo) is cleaner
- Margin: $6.30 vs $7.30 — 14% less profit per user for 11% less price
- No competitive reason to undercut — Kaivoo offers more scope than any $8/mo tool

### Why Not $10/mo?

- $10/mo is defensible but lands exactly at Notion Plus monthly pricing
- Forces direct comparison ("why should I switch from Notion?")
- $9/mo creates $1 gap that reframes it: "everything Notion does and more, for less"
- Annual at $9/mo = $108/yr. Clean number, easy to communicate

### Why Not $15/mo?

- Above the "prove it" zone for a new product without established brand
- Enters the Sunsama/Notion Business territory where expectations are higher
- Better to enter at $9-12 and raise after proving value + building brand
- Can always introduce a Pro tier at $15-20/mo later with advanced features

---

## The Complete Tier Architecture

| Tier | Price | What's Included | Target | Cost | Margin |
|---|---|---|---|---|---|
| **Flow Desktop** | $49 one-time (standard) / $99 (premium) | Full local app, BYO AI keys, SQLite, offline-first | Privacy-conscious, technical, no ongoing cost | $0/mo | 100% after COGS |
| **Web Access + AI** | $9/mo annual / $12/mo monthly | Cloud sync, web app, 10 GB storage, managed AI (50 msgs/day), mobile companion | Most subscribers | $1.70/mo | 81-86% |
| **BYO Keys option** | Same $9-12/mo | Same as above but user provides own API keys, unlimited AI | Developers, heavy AI users | $1.08/mo (no AI cost) | 88-91% |

### What's NOT in v1 (Future Expansion)

| Feature | When | Price Signal |
|---|---|---|
| Pro AI tier (100 msgs/day + model choice) | Phase B, if demand warrants | $15-18/mo |
| Team/workspace features | Phase C | Per-seat addon |
| Storage expansion packs | Phase B | $1/GB/mo overage |
| Priority support | Phase B | Bundled into higher tier |

---

## What $9-12/mo Gets the User

### The "Replace 5 Apps" Value Stack

| Capability | Replaces | Standalone Cost |
|---|---|---|
| Journal + daily notes + sync | Day One Premium | $4.17/mo |
| Tasks + projects + views | Todoist Pro | $4/mo |
| Knowledge base + topics | Notion Plus | $10/mo |
| Calendar integration | Fantastical Premium | $4.75/mo |
| Notes sync (E2E capable) | Obsidian Sync | $8/mo |
| AI concierge (knows your data) | Nothing comparable | — |
| **Total if bought separately** | | **$30.92/mo** |
| **Kaivoo Web Access + AI** | | **$9-12/mo** |

### The Messaging

**Primary:** "Your journal, tasks, calendar, and AI — synced everywhere. $9/mo."

**Secondary:** "Replace 5 apps. Access from any device. AI that knows you."

**Conversion nudge (from desktop):** "Love Flow on your Mac? Take it everywhere for $9/mo."

**Trial CTA:** "Try free for 14 days. No credit card required."

---

## Free Trial Design

From the Free Trial Cost Model:

| Parameter | Value | Cost Impact |
|---|---|---|
| Duration | 14 days | — |
| Features | Full access (all features unlocked) | — |
| Storage | 500 MB | $0.01 |
| AI messages | 25 total | $0.38 |
| Credit card required | No (for max signups) | — |
| **Total cost per trial user** | | **$0.39** |

**Conversion math:** At 10% trial-to-paid, CAC = $3.90. At 15% = $2.73. Both are exceptional.

**Post-trial:** Read-only for 7 days → locked for 30 days (data retained) → deleted. "Your data is waiting" email at each stage.

---

## Revenue Projections

### Assumptions
- 70% annual ($9/mo), 25% monthly ($12/mo), 5% BYO ($9/mo annual)
- Blended average revenue: $9.75/user/mo
- Blended cost: $1.70/user/mo
- Churn: 5%/mo (conservative for new product)

### Year 1 Projections (Starting Month 6 After Launch)

| Month | New Subs | Total Subs | MRR | Cost/mo | Gross Profit/mo |
|---|---|---|---|---|---|
| 1 | 50 | 50 | $488 | $85 | $403 |
| 3 | 50 | 143 | $1,394 | $243 | $1,151 |
| 6 | 75 | 310 | $3,023 | $527 | $2,496 |
| 12 | 100 | 680 | $6,630 | $1,156 | $5,474 |

### Year 2 (Accelerating)

| Month | New Subs | Total Subs | MRR | Cost/mo | Gross Profit/mo |
|---|---|---|---|---|---|
| 18 | 200 | 1,800 | $17,550 | $3,060 | $14,490 |
| 24 | 300 | 3,500 | $34,125 | $5,950 | $28,175 |

**ARR at 24 months: ~$410K** (at conservative growth + 5% churn)

---

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| AI costs higher than modeled | Low | Medium | Rate limits + model routing already conservative |
| Users expect more storage | Medium | Low | 10 GB is generous for productivity; overage at $1/GB |
| Notion/competitors drop prices | Low | Medium | Kaivoo's scope advantage survives price wars |
| Low trial conversion (<5%) | Medium | Medium | Test credit-card-upfront variant; improve onboarding |
| API price increases | Very Low | Medium | Multi-provider routing; BYO keys as fallback |
| Heavy user concentration | Low | Low | Even all-heavy scenario yields 44% margin at $8/mo |

---

## CEO Decisions (March 7, 2026)

### 1. Price Point: $9/mo annual / $12/mo monthly — APPROVED

### 2. Managed AI: BUNDLE with BYO option
- Managed AI bundled into subscription (smart-routed, rate-limited)
- BYO Keys option available for users who want to bring their own API keys
- Both options at same subscription price

### 3. Trial: CC REQUIRED
- 14-day free trial with credit card upfront
- Higher conversion rate (~40-60%) offsets fewer trial signups
- Cost per trial user: $0.39

### 4. Storage: TIERED (Play A — Workflow Hub)
- Kaivoo stores workflow data (scripts, plans, notes, images, docs)
- Large media files (video, raw footage) stay in Google Drive/Dropbox/NAS
- Max storage tier: 100 GB — do NOT compete on raw storage with Google/iCloud
- File linking for external storage services (Phase B feature)

### Approved Tier Architecture

| Tier | Price | Storage | AI | Target | Cost | Margin |
|---|---|---|---|---|---|---|
| **Starter** | $9/mo annual / $12/mo monthly | 10 GB | 50 msgs/day managed | Casual users, journalers | $1.70/mo | 81-86% |
| **Pro** | $16/mo annual / $20/mo monthly | 100 GB | 100 msgs/day + model choice | Power users, creators, freelancers | $4.50/mo | 72-78% |
| **BYO Keys** | $9/mo annual / $12/mo monthly | 10 GB | Unlimited (user's API keys) | Developers, heavy AI users | $1.08/mo | 88-91% |

### Strategic Rationale (CEO)
- **Play A (Workflow Hub):** Kaivoo is an intelligence layer, not a file locker. Creators already have Google Drive/Dropbox for raw files. Kaivoo adds the workflow intelligence on top.
- **No 1-2 TB tiers:** Can't out-storage Google ($9.99/2TB). Margins collapse at TB scale (27-34%). If demand proves us wrong, can add Play B tiers in Phase B/C with Cloudflare R2 architecture.
- **100 GB Pro is generous:** Covers ~50K journal entries + 10K images + 500 PDFs. A creator would need to work very hard to exceed this with non-video workflow data.

---

## Research Parcels — Status Update

| Parcel | Owner | Status | Document |
|---|---|---|---|
| Supabase cost-per-user modeling | Agent 5 | **DONE** | `Agent-5-Docs/Research-Brief-Supabase-Cost-Per-User.md` |
| Managed AI cost-per-user modeling | Agent 5 | **DONE** | `Agent-5-Docs/Research-Brief-Managed-AI-Cost-Model.md` |
| Storage tier modeling | Agent 5 | **DONE** | `Agent-5-Docs/Research-Brief-Storage-Tier-Model.md` |
| Free trial cost modeling | Agent 5 | **DONE** | `Agent-5-Docs/Research-Brief-Free-Trial-Cost-Model.md` |
| Cloud storage competitive teardown | Agent 8 | **DONE** | `Agent-8-Docs/Competitive-Pricing-Teardown.md` |
| Competitive pricing teardown (productivity) | Agent 8 | **DONE** | `Agent-8-Docs/Competitive-Pricing-Teardown.md` |
| Tier 2 pricing recommendation | Agent 8 | **DONE** | `Agent-8-Docs/Tier-2-Pricing-Recommendation.md` (this document) |

**All 7 Tier 2 pricing research parcels are now COMPLETE. CEO decisions recorded.**

---

*Tier 2 Pricing Recommendation v1.1 — March 7, 2026*
*Agent 8 (Product Manager)*
*CEO decisions recorded — ready for Vision update*
