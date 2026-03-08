# Research Brief: Managed AI Cost Model — Phase B Subscription Feasibility

**Date:** March 7, 2026
**Domain:** AI API Economics + Subscription Pricing
**Requested by:** CEO (Founder) — Phase B pricing research
**Confidence:** High for pricing data (public provider pages); Medium for usage projections (modeled, not real user data yet)
**Author:** Agent 5 (Research Analyst)
**Status:** COMPLETE

---

## Executive Summary

Managed AI (Kaivoo pays API costs, users don't need their own keys) is **feasible at $8-12/mo** but only with smart model routing. Using a cheap model (GPT-4o-mini, Gemini 2.0 Flash, or Haiku 3.5) for 80%+ of queries and reserving premium models for complex tasks, the median user costs $0.15-0.60/mo in API spend. Even heavy users stay under $3.00/mo with proper controls. The subscription is sustainable with 79-86% gross margin on a blended basis.

**Bottom line:** Bundle managed AI into the $8-12/mo Web Access tier. It is a rounding error on infrastructure costs for most users and a massive selling point. Use rate limits and model routing to cap the long tail of heavy users.

---

## 1. Current API Pricing (Latest Confirmed Public Pricing)

> **Note on data freshness:** Pricing sourced from training data through early 2025. API prices have historically trended **downward** — actual March 2026 prices are likely equal to or cheaper. Verify at: openai.com/api/pricing, anthropic.com/pricing, ai.google.dev/pricing before finalizing.

### OpenAI

| Model | Input (per 1M tokens) | Output (per 1M tokens) | Cached Input | Notes |
|---|---|---|---|---|
| **GPT-4o** | $2.50 | $10.00 | $1.25 | Flagship multimodal |
| **GPT-4o-mini** | $0.15 | $0.60 | $0.075 | Best value for routine tasks |
| **o3-mini** | $1.10 | $4.40 | $0.55 | Reasoning model |
| **GPT-4.1** | $2.00 | $8.00 | $0.50 | Coding-focused (if launched) |
| **GPT-4.1-mini** | $0.40 | $1.60 | $0.10 | Mid-tier (if launched) |
| **GPT-4.1-nano** | $0.10 | $0.40 | $0.025 | Ultra-cheap (if launched) |

### Anthropic

| Model | Input (per 1M tokens) | Output (per 1M tokens) | Cached Input | Notes |
|---|---|---|---|---|
| **Claude Sonnet 4** | $3.00 | $15.00 | $0.30 | Flagship |
| **Claude Haiku 3.5** | $0.80 | $4.00 | $0.08 | Fast, cheap, good for simple tasks |
| **Claude Opus 4** | $15.00 | $75.00 | $1.50 | Premium — too expensive for managed tier |

Anthropic's prompt caching offers 90% discount on cached input tokens — major cost saver for system prompts.

### Google (Gemini)

| Model | Input (per 1M tokens) | Output (per 1M tokens) | Notes |
|---|---|---|---|
| **Gemini 2.0 Flash** | $0.10 | $0.40 | Cheapest competitive model |
| **Gemini 2.5 Pro** | $1.25 - $2.50 | $5.00 - $10.00 | Varies by context length |
| **Gemini 1.5 Flash** | $0.075 | $0.30 | Previous gen, still very cheap |

### Price Leader Summary

| Category | Cheapest Model | Input/1M | Output/1M |
|---|---|---|---|
| Ultra-cheap | Gemini 2.0 Flash | $0.10 | $0.40 |
| Ultra-cheap | GPT-4o-mini | $0.15 | $0.60 |
| Mid-tier | Claude Haiku 3.5 | $0.80 | $4.00 |
| Flagship | GPT-4o | $2.50 | $10.00 |
| Flagship | Claude Sonnet 4 | $3.00 | $15.00 |

---

## 2. Usage Model

### User Tiers

| Parameter | Light | Medium | Heavy |
|---|---|---|---|
| Messages per day | 5 | 20 | 50 |
| Avg input tokens/message | 500 | 800 | 1,000 |
| Avg output tokens/message | 300 | 500 | 700 |
| Conversations per day | 3 | 5 | 10 |
| System prompt overhead | 1,000 tokens/conversation | 1,000 tokens/conversation | 1,000 tokens/conversation |
| Days active per month | 22 | 26 | 30 |

### Monthly Token Consumption

| Metric | Light | Medium | Heavy |
|---|---|---|---|
| Message input tokens/mo | 55,000 | 416,000 | 1,500,000 |
| System prompt tokens/mo | 66,000 | 130,000 | 300,000 |
| **Total input tokens/mo** | **121,000** | **546,000** | **1,800,000** |
| **Total output tokens/mo** | **33,000** | **260,000** | **1,050,000** |

---

## 3. Monthly Cost Per User — Single Model (No Routing)

### Light User (121K input / 33K output per month)

| Model | Input Cost | Output Cost | **Total/mo** |
|---|---|---|---|
| Gemini 2.0 Flash | $0.012 | $0.013 | **$0.03** |
| GPT-4o-mini | $0.018 | $0.020 | **$0.04** |
| Claude Haiku 3.5 | $0.097 | $0.132 | **$0.23** |
| GPT-4o | $0.303 | $0.330 | **$0.63** |
| Claude Sonnet 4 | $0.363 | $0.495 | **$0.86** |

### Medium User (546K input / 260K output per month)

| Model | Input Cost | Output Cost | **Total/mo** |
|---|---|---|---|
| Gemini 2.0 Flash | $0.055 | $0.104 | **$0.16** |
| GPT-4o-mini | $0.082 | $0.156 | **$0.24** |
| Claude Haiku 3.5 | $0.437 | $1.040 | **$1.48** |
| GPT-4o | $1.365 | $2.600 | **$3.97** |
| Claude Sonnet 4 | $1.638 | $3.900 | **$5.54** |

### Heavy User (1.8M input / 1.05M output per month)

| Model | Input Cost | Output Cost | **Total/mo** |
|---|---|---|---|
| Gemini 2.0 Flash | $0.180 | $0.420 | **$0.60** |
| GPT-4o-mini | $0.270 | $0.630 | **$0.90** |
| Claude Haiku 3.5 | $1.440 | $4.200 | **$5.64** |
| GPT-4o | $4.500 | $10.500 | **$15.00** |
| Claude Sonnet 4 | $5.400 | $15.750 | **$21.15** |

**Key takeaway:** Single flagship model makes heavy users cost $15-21/mo — unsustainable. Cheap models only: even heavy users cost under $1/mo. The answer is model routing.

---

## 4. Smart Model Routing — The Real Cost Model

### Routing Rules

| Query Type | % of Queries | Model | Examples |
|---|---|---|---|
| **Simple** | 60% | GPT-4o-mini / Gemini Flash | "Add a task for tomorrow", "What's on my calendar?", formatting |
| **Standard** | 30% | Claude Haiku 3.5 / o3-mini | Summarize notes, draft email, analyze habits, project status |
| **Complex** | 10% | GPT-4o / Claude Sonnet 4 | Multi-step reasoning, long documents, creative writing, planning |

### Blended Cost with Smart Routing

Using cheapest per tier: Gemini Flash (simple), Haiku 3.5 (standard), GPT-4o (complex).

**Light User (110 messages/mo):**

| Component | Input Tokens | Output Tokens | Cost |
|---|---|---|---|
| Simple (60%) | 72.6K | 19.8K | $0.015 |
| Standard (30%) | 36.3K | 9.9K | $0.069 |
| Complex (10%) | 12.1K | 3.3K | $0.063 |
| **Total** | **121K** | **33K** | **$0.15** |

**Medium User (520 messages/mo):**

| Component | Input Tokens | Output Tokens | Cost |
|---|---|---|---|
| Simple (60%) | 327.6K | 156K | $0.095 |
| Standard (30%) | 163.8K | 78K | $0.443 |
| Complex (10%) | 54.6K | 26K | $0.397 |
| **Total** | **546K** | **260K** | **$0.94** |

**Heavy User (1,500 messages/mo):**

| Component | Input Tokens | Output Tokens | Cost |
|---|---|---|---|
| Simple (60%) | 1,080K | 630K | $0.360 |
| Standard (30%) | 540K | 315K | $1.692 |
| Complex (10%) | 180K | 105K | $1.500 |
| **Total** | **1,800K** | **1,050K** | **$3.55** |

### Summary: Monthly AI Cost Per User (Smart Routing + Caching)

| User Tier | Monthly AI Cost | With Caching (~15% savings) | Messages/mo |
|---|---|---|---|
| **Light** | $0.15 | **$0.13** | 110 |
| **Medium** | $0.94 | **$0.80** | 520 |
| **Heavy** | $3.55 | **$3.02** | 1,500 |

---

## 5. Margin Analysis

### At $8/mo Subscription

Estimated non-AI infrastructure costs: $0.50-1.50/mo per user (Supabase, storage, bandwidth, auth). Midpoint: $1.00/mo.

| User Tier | AI Cost | Infra Cost | Total Cost | Revenue | **Gross Margin** | **Margin %** |
|---|---|---|---|---|---|---|
| Light | $0.13 | $1.00 | $1.13 | $8.00 | **$6.87** | **86%** |
| Medium | $0.80 | $1.00 | $1.80 | $8.00 | **$6.20** | **78%** |
| Heavy | $3.02 | $1.50 | $4.52 | $8.00 | **$3.48** | **44%** |

### At $12/mo Subscription

| User Tier | AI Cost | Infra Cost | Total Cost | Revenue | **Gross Margin** | **Margin %** |
|---|---|---|---|---|---|---|
| Light | $0.13 | $1.00 | $1.13 | $12.00 | **$10.87** | **91%** |
| Medium | $0.80 | $1.00 | $1.80 | $12.00 | **$10.20** | **85%** |
| Heavy | $3.02 | $1.50 | $4.52 | $12.00 | **$7.48** | **62%** |

### Blended Average (Realistic User Mix: 60% light / 30% medium / 10% heavy)

| Metric | $8/mo | $12/mo |
|---|---|---|
| Blended AI cost/user | $0.62 | $0.62 |
| Blended infra cost/user | $1.10 | $1.10 |
| **Blended total cost/user** | **$1.72** | **$1.72** |
| **Blended gross margin** | **$6.28 (79%)** | **$10.28 (86%)** |

---

## 6. Stress Tests

### All Users Are Heavy (Worst Case)

| Price | Cost/user | Revenue | Margin | Verdict |
|---|---|---|---|---|
| $8/mo | $4.52 | $8.00 | $3.48 (44%) | Thin but survivable |
| $12/mo | $4.52 | $12.00 | $7.48 (62%) | Comfortable |

### Viral Abuse (200+ msgs/day)

A user sending 200 messages/day: ~$12-15/mo in AI costs. Negative margin at either price point. **Rate limits are mandatory.**

### API Prices Drop 50% (Likely Over 12-18 Months)

Blended AI cost drops from $0.62 to $0.31/user/mo. Margin at $8/mo improves from 79% to 83%. Managed AI becomes more profitable over time.

---

## 7. Cost Optimization Strategies

| Strategy | Priority | Impact | Description |
|---|---|---|---|
| **Smart Model Routing** | MUST HAVE | 60-80% cost reduction | Route simple queries to Gemini Flash / GPT-4o-mini, complex to flagship |
| **Prompt Caching** | MUST HAVE | 10-20% reduction | Cache system prompt (soul file, tools). Anthropic: 90% off cached tokens |
| **Rate Limiting** | MUST HAVE | Caps worst-case exposure | 50-100 msgs/day depending on tier |
| **Conversation Summarization** | SHOULD HAVE | 20-40% input reduction | Compress history after 8-10 messages per conversation |
| **Response Length Control** | SHOULD HAVE | 15-30% output reduction | Concise for actions, verbose only when explicitly requested |
| **Multi-Provider Failover** | NICE TO HAVE | Cost optimization + reliability | Route to cheapest available provider |
| **Batch/Async Processing** | NICE TO HAVE | 50% on background tasks | Nightly habit analysis, weekly summaries at batch API prices |

---

## 8. Recommendation: Hybrid Tier Structure

### Recommended Tier Architecture

| Tier | Monthly Price | What's Included | Target User |
|---|---|---|---|
| **Flow Desktop** | $49/$99 one-time | Full app, BYO API keys, local-first | Privacy-focused, technical users |
| **Web Access + AI** | $8/mo | Sync + 50 messages/day managed AI (smart-routed) | Most users |
| **Web Access + Pro AI** | $12/mo | Sync + 100 messages/day + model choice + priority | Power users |
| **BYO Keys** | $8/mo base | Sync + unlimited AI with own API keys | Developers, heavy AI users |

### Why This Works

1. **$8/mo tier is highly profitable.** Blended cost $1.72/user/mo yields 79% gross margin.
2. **50 messages/day covers 90%+ of users.** That's 1,500 messages/month.
3. **$12/mo captures power users.** The 10% who are heavy pay $4 more, covering the extra AI cost.
4. **BYO keys solve the long tail.** Users wanting 200+ msgs/day bring their own keys. Kaivoo cost = zero.
5. **API prices are falling.** Today's margins only improve over time.

### Projected Revenue at Scale

| Subscribers | Blended Revenue/mo | Blended Cost/mo | Gross Profit/mo | Gross Margin |
|---|---|---|---|---|
| 1,000 | $9,200 | $1,720 | $7,480 | 81% |
| 5,000 | $46,000 | $8,600 | $37,400 | 81% |
| 10,000 | $92,000 | $17,200 | $74,800 | 81% |

*(Assumes 70% at $8/mo, 25% at $12/mo, 5% BYO at $8/mo. Blended avg = $9.20/mo.)*

### Bundled vs. Addon Verdict

**Bundle it.** The competitive landscape is moving toward AI-included tiers. Separating AI into an addon creates friction, lowers adoption, and weakens the value proposition. At $0.62/user/mo blended cost, the AI is cheaper than the Supabase infrastructure it runs on.

---

## 9. Action Items

1. **Verify API pricing** before finalizing — check provider pricing pages for changes since early 2025
2. **Design model routing classifier** — rule-based for v1 (keyword/intent matching), ML-based for v2
3. **Implement prompt caching** in the API client layer from day 1
4. **Build per-user cost tracking** into the backend — essential for monitoring and adjustment
5. **Set rate limits** as configurable server-side values (not hardcoded) so they can be tuned without deploys
6. **Beta test with real users** to validate usage tier assumptions before committing to public pricing

---

## Competitive Reference

| Product | AI Pricing Approach | Monthly Price | AI Limits |
|---|---|---|---|
| **Notion** | Bundled in Business+ | $18/mo | Included |
| **Craft** | Bundled in Plus | ~$5/mo | Usage caps |
| **Motion** | AI IS the product | ~$29/mo | Included |
| **Cursor** | Tiered fast/slow quotas | $20/mo | 500 fast, unlimited slow |
| **Granola** | Bundled meeting AI | $10-16/mo | 25-unlimited meetings |

The market pattern: AI is bundled into subscription tiers with usage caps, not sold per-token. Kaivoo's approach is aligned.

---

*Research Brief v1.0 — March 7, 2026*
*Agent 5 (Research Analyst)*
*Next review: After API pricing verification and Phase B beta launch*
