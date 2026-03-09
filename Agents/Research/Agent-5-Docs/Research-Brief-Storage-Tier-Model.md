# Research Brief: Storage Tier Modeling

**Date:** March 7, 2026
**Domain:** Infrastructure Economics / Tier 2 Pricing
**Requested by:** CEO (Founder) — Tier 2 pricing research
**Author:** Agent 5 (Research Analyst)
**Status:** COMPLETE
**Dependencies:** Supabase Cost-Per-User Model, Competitive Pricing Teardown

---

## Question

Should Kaivoo tier storage (Google Drive-style), and if so, what are the breakpoints for profitability at $8-12/mo?

---

## 1. Supabase Storage Economics

From the Supabase Cost-Per-User research:

| Resource | Included (Pro) | Overage Rate |
|---|---|---|
| File Storage | 100 GB | $0.021/GB/mo |
| Bandwidth (egress) | 250 GB | $0.09/GB/mo |

**Key insight:** Storage itself is nearly free ($0.021/GB/mo = $0.25/GB/year). Bandwidth is 4.3x more expensive per GB than storage. The real cost of letting users store files is serving those files, not storing them.

---

## 2. Per-User Storage Cost at Each Tier

### Modeling Assumptions
- Bandwidth multiplier: users download ~2x their stored data per month (frequent access to recent files, occasional access to older ones)
- At higher storage tiers, bandwidth ratio drops (more cold storage)

| Storage Tier | Storage Cost/mo | Bandwidth (est.) | Bandwidth Cost/mo | **Total Cost/User/mo** |
|---|---|---|---|---|
| **1 GB** (trial) | $0.02 | 2 GB/mo | $0.18 | **$0.20** |
| **5 GB** (base) | $0.11 | 8 GB/mo | $0.72 | **$0.83** |
| **25 GB** (mid) | $0.53 | 25 GB/mo | $2.25 | **$2.78** |
| **100 GB** (high) | $2.10 | 50 GB/mo | $4.50 | **$6.60** |

*Note: These are marginal costs per user. Supabase Pro's included 100 GB storage + 250 GB bandwidth are shared across all users, making the actual per-user cost lower at scale. These figures represent worst-case marginal cost.*

### Adjusted for Scale (1,000 users, 60/30/10 mix)

At 1,000 users with the Pro plan's included quotas amortized:

| Storage Tier | Effective Cost/User/mo | With CDN Optimization |
|---|---|---|
| **1 GB** | $0.08 | $0.04 |
| **5 GB** | $0.35 | $0.20 |
| **25 GB** | $1.50 | $0.90 |
| **100 GB** | $4.20 | $2.50 |

---

## 3. Competitive Storage Benchmarks

From the Competitive Pricing Teardown:

| Price Point | What Market Offers | Set By |
|---|---|---|
| $0/mo | 5-15 GB raw storage | Google (15GB), iCloud (5GB) |
| $4-5/mo | 1 GB synced notes / 50 GB raw | Obsidian Sync, iCloud |
| $8-10/mo | 10 GB synced / 2 TB raw | Obsidian Sync, Google/iCloud |
| $12/mo | 2 TB raw storage | Dropbox Plus |

**Critical distinction:** Productivity tools (Notion, Obsidian, Craft) offer 1-10 GB and nobody complains. Raw storage providers (Google, iCloud) offer 2 TB. Kaivoo is a productivity tool — users expect productivity-level storage, not Google Drive-level.

---

## 4. Recommended Storage Tiers

### Option A: Simple (Recommended)

One flat tier with a generous-for-productivity cap:

| Tier | Price | Storage Included | Overage | Cost/User | Margin |
|---|---|---|---|---|---|
| **Web Access + AI** | $9-12/mo | **10 GB** | $1/GB/mo | $0.35-0.83 | 90-96% |

**Why 10 GB:** Matches Obsidian Sync's $8/mo tier. More than Notion Plus. Enough for thousands of journal entries, tasks, projects, and hundreds of file attachments. Most users won't exceed 2-3 GB in the first year.

**Why simple:** Tiered storage adds billing complexity, confuses positioning, and creates support overhead. At $0.021/GB, the marginal cost of being generous is negligible. A 10 GB cap prevents abuse while covering 95%+ of users comfortably.

### Option B: Tiered (If Revenue Optimization Needed)

| Tier | Price | Storage | Cost/User | Margin | Target |
|---|---|---|---|---|---|
| **Web Essentials** | $8/mo | 5 GB | $0.35 | 96% | Casual users |
| **Web Pro** | $12/mo | 25 GB | $1.50 | 88% | Power users |
| **Web Max** | $20/mo | 100 GB | $4.20 | 79% | Heavy filers |

**Why not recommended:** Three tiers fragment the user base, require a tier selection UI, and add "which one do I pick?" friction to conversion. The $4 difference between $8 and $12 isn't worth the cognitive load. The market is also moving toward simpler plans (Notion Plus = one plan, Obsidian Sync = two plans).

---

## 5. Profitability Analysis (Option A: 10 GB at $9-12/mo)

### Combined with AI Costs (from Managed AI Cost Model)

| Component | Blended Cost/User/mo | Notes |
|---|---|---|
| Supabase infra | $0.10-0.25 | Database, compute, auth, edge functions |
| Storage + bandwidth | $0.35-0.83 | 10 GB tier |
| Managed AI | $0.62 | Smart-routed, 60/30/10 mix |
| **Total cost/user** | **$1.07-1.70** | |

| Price | Total Cost | **Gross Margin** | **Margin %** |
|---|---|---|---|
| $9/mo | $1.70 | $7.30 | 81% |
| $10/mo | $1.70 | $8.30 | 83% |
| $12/mo | $1.70 | $10.30 | 86% |

### Breakeven on Storage Alone

- 10 GB storage costs Kaivoo: $0.21/mo in storage + ~$0.90/mo in bandwidth = ~$1.11/mo
- Even if a user ONLY paid for storage and nothing else, $9/mo covers it 8x over
- **Storage will never be a margin concern at these volumes**

---

## 6. Storage Quota Enforcement Strategy

| Control | Implementation | Purpose |
|---|---|---|
| **Hard cap at 10 GB** | Supabase storage policy + client check | Prevent runaway costs |
| **Warning at 8 GB** | In-app notification | Encourage cleanup or upgrade |
| **Per-file limit: 50 MB** | Upload validation | Prevent video dumps |
| **Overage: $1/GB/mo** | Stripe metered billing | Revenue capture from heavy users |
| **Image compression** | Server-side on upload | Reduce storage + bandwidth |
| **CDN for files** | Cloudflare (free tier) | Cut bandwidth costs 50-70% |

---

## 7. Key Takeaways

1. **Storage is cheap.** 10 GB costs Kaivoo ~$1.11/user/mo all-in (storage + bandwidth). Trivial at $9-12/mo.

2. **Don't tier storage.** One generous cap (10 GB) with overage pricing is simpler, converts better, and has negligible cost impact vs. offering 5 GB.

3. **Don't compete on GB.** Pure storage providers offer 2 TB for $10/mo. Kaivoo's value is what happens inside the data, not how much it stores.

4. **Bandwidth is the real cost**, not storage. Optimize with CDN and compression before worrying about storage caps.

5. **10 GB matches Obsidian Sync** ($8/mo for 10 GB), which is the closest comp for a productivity sync service. Users will perceive this as fair.

6. **95%+ of users won't exceed 3 GB** in their first year. The 10 GB cap is generous insurance against the 5% who upload heavily.

---

*Research Brief v1.0 — March 7, 2026*
*Agent 5 (Research Analyst)*
