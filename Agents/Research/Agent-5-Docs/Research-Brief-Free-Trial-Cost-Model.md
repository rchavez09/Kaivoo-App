# Research Brief: Free Trial Cost Model

**Date:** March 7, 2026
**Domain:** Infrastructure Economics / Tier 2 Pricing
**Requested by:** CEO (Founder) — Tier 2 pricing research
**Author:** Agent 5 (Research Analyst)
**Status:** COMPLETE
**Dependencies:** Supabase Cost-Per-User Model, Managed AI Cost Model

---

## Question

What is the per-user cost of a 14-day free web trial on Supabase? What usage limits keep trial cost under $0.50/user? What's the burn rate per free user?

---

## 1. Trial User Behavior Model

Trial users are exploratory — lower engagement than paying light users. Based on SaaS trial benchmarks:

| Parameter | Trial User (14 days) | Paying Light User (30 days) |
|---|---|---|
| Active days | 5-8 of 14 | 22 of 30 |
| DB writes | ~200 rows total | 1,500/mo |
| DB reads | ~1,000 queries total | 6,000/mo |
| Storage uploaded | 10-50 MB | 100 MB cumulative |
| Bandwidth consumed | 50-200 MB total | 500 MB/mo |
| Edge function calls | ~50 total | 150/mo |
| AI messages (if included) | ~30 total | 110/mo |
| Realtime connections | 1, ~3 hrs total | 1, 15 hrs/mo |

---

## 2. Per-Trial-User Cost Breakdown

### Infrastructure Only (No AI)

| Resource | Usage | Unit Cost | Trial Cost |
|---|---|---|---|
| Database disk | ~1 MB | $0.125/GB | $0.0001 |
| File storage | 30 MB avg | $0.021/GB | $0.0006 |
| Bandwidth | 125 MB avg | $0.09/GB | $0.011 |
| Edge functions | 50 invocations | $2/1M | $0.0001 |
| Auth | 1 MAU | $0.00325/MAU (over 100K) | $0.00 |
| Realtime | Negligible | — | $0.00 |
| **Infra subtotal** | | | **$0.012** |

### With Managed AI (Trial-Limited)

| AI Tier | Messages | Token Cost | Trial AI Cost |
|---|---|---|---|
| **No AI in trial** | 0 | $0 | **$0.00** |
| **Limited AI (10 msgs)** | 10 | ~$0.015/msg routed | **$0.15** |
| **Moderate AI (30 msgs)** | 30 | ~$0.015/msg routed | **$0.45** |
| **Full AI (50 msgs/day)** | ~200 (over 14 days) | ~$0.015/msg | **$3.00** |

### Total Trial Cost Per User

| Trial Configuration | Infra Cost | AI Cost | **Total Cost** | Under $0.50? |
|---|---|---|---|---|
| **Web only, no AI** | $0.012 | $0.00 | **$0.01** | Yes |
| **Web + 10 AI msgs total** | $0.012 | $0.15 | **$0.16** | Yes |
| **Web + 30 AI msgs total** | $0.012 | $0.45 | **$0.46** | Yes (barely) |
| **Web + 50 AI msgs/day** | $0.012 | $3.00 | **$3.01** | No |

---

## 3. Recommended Trial Configuration

### Target: Under $0.50/user

| Parameter | Limit | Rationale |
|---|---|---|
| **Duration** | 14 days | Industry standard. Long enough to form habit, short enough to create urgency |
| **Storage** | 500 MB | Enough to test file uploads. Not enough to use as free storage |
| **AI messages** | 25 total (not per day) | Enough to experience the concierge. Creates "I want more" moment. Cost: ~$0.38 |
| **Edge functions** | No limit | Negligible cost |
| **Realtime** | No limit | Negligible cost |
| **Features** | Full access | Don't cripple the experience. Let them see everything |

**Estimated cost per trial user: $0.39**

### Why 25 AI Messages

- 25 messages over 14 days = ~2 messages/day
- Enough for: "What's on my schedule today?" + "Summarize my journal this week" + a few task/project queries
- Creates the "aha moment" — the concierge knows their data
- Low enough to stay well under $0.50 even with premium model routing
- When they run out: "Upgrade to Web Access for unlimited AI" (actually 50/day, but feels unlimited)

---

## 4. Trial-to-Paid Conversion Economics

### SaaS Trial Benchmarks

| Metric | Industry Average | Best-in-Class |
|---|---|---|
| Trial-to-paid conversion | 10-15% | 25-40% |
| Credit card upfront conversion | 40-60% | 70%+ |
| No-CC trial conversion | 2-5% | 10-15% |

### Kaivoo Trial Economics

| Scenario | Trial Users | Cost/User | Total Spend | Converts (10%) | Revenue/mo | Payback |
|---|---|---|---|---|---|---|
| **100 trials/mo** | 100 | $0.39 | $39 | 10 | $100 | Instant |
| **1,000 trials/mo** | 1,000 | $0.39 | $390 | 100 | $1,000 | Instant |
| **10,000 trials/mo** | 10,000 | $0.39 | $3,900 | 1,000 | $10,000 | Instant |

**Even at a pessimistic 10% conversion, each trial cohort pays for itself in month 1.** At $0.39/trial user and $10/mo revenue from converters, Kaivoo needs just 4% conversion to break even on trial costs.

### Customer Acquisition Cost (CAC) from Trial

| Conversion Rate | Trial Cost ($0.39) | Effective CAC |
|---|---|---|
| 5% | $0.39 x 20 non-converters | **$7.80** |
| 10% | $0.39 x 10 non-converters | **$3.90** |
| 15% | $0.39 x 7 non-converters | **$2.73** |
| 25% | $0.39 x 4 non-converters | **$1.56** |

For context: SaaS CAC benchmarks are typically $50-500 for SMB and $200-2000 for enterprise. A $4-8 CAC from organic trials is exceptional.

---

## 5. Trial Abuse Prevention

| Risk | Mitigation | Cost Impact |
|---|---|---|
| **Repeat signups** | Email verification + rate limit per email domain | Negligible |
| **Storage dumping** | 500 MB hard cap | Caps at $0.01 storage |
| **AI abuse** | 25 message hard cap (not per day) | Caps at $0.38 |
| **Bot signups** | CAPTCHA on registration | Zero infrastructure cost |
| **Expired trial data** | Auto-delete after 30 days post-expiry | Reclaims storage |

### Data Retention Policy

| Event | Action | Rationale |
|---|---|---|
| Trial expires | Read-only access for 7 days | Grace period, conversion nudge |
| Trial + 7 days | Account locked, data retained 30 days | "Your data is waiting" email |
| Trial + 37 days | Data deleted, account deactivated | Reclaim storage |
| User converts during any grace period | Full access restored immediately | Zero friction |

---

## 6. Alternative: No-Trial "Try Free on Desktop" Model

Since Flow Desktop is free (one-time purchase for premium features), an alternative to a web trial:

| Model | Cost to Kaivoo | Conversion Path |
|---|---|---|
| **Web trial (14 days)** | $0.39/user | Trial → Subscribe ($10/mo) |
| **Desktop free tier** | $0/user | Download → Use → Want sync → Subscribe ($10/mo) |

The desktop-first path costs Kaivoo nothing but has a longer conversion funnel. The web trial costs pennies but puts users directly into the subscription funnel.

**Recommendation:** Offer both. Desktop is the zero-cost acquisition channel. Web trial is the fast-conversion channel. Both feed into the $10/mo subscription.

---

## 7. Key Takeaways

1. **A 14-day trial costs $0.39/user** with 25 AI messages and 500 MB storage. Well under the $0.50 target.

2. **Without AI, the trial costs $0.01/user.** AI is 97% of trial cost. The 25-message cap is the critical control.

3. **Break-even at 4% conversion.** Even pessimistic scenarios are profitable from month 1.

4. **CAC from organic trials: $4-8.** Orders of magnitude cheaper than paid acquisition.

5. **Full feature access during trial.** Don't cripple the experience — let users see everything. Limit only storage (500 MB) and AI (25 msgs).

6. **Auto-delete trial data after 37 days.** Prevents dead accounts from accumulating storage costs.

7. **Dual acquisition: desktop free + web trial.** Zero-cost and low-cost channels feeding the same subscription.

---

*Research Brief v1.0 — March 7, 2026*
*Agent 5 (Research Analyst)*
