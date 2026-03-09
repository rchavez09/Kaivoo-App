# Competitive Pricing Teardown: Cloud Storage & Productivity Tools

**Date:** March 7, 2026
**Author:** Agent 8 (Product Manager)
**Status:** COMPLETE
**Context:** Kaivoo Web Access + Sync (Tier 2) is targeting $8-12/mo. This teardown examines what users expect at that price point.

**Note:** Pricing data based on training data through May 2025 + existing Competitive Landscape Report (Feb 2026). Most services change pricing 1-2x/year. Figures marked (*) should be verified before publishing externally.

---

## PART 1: Cloud Storage Competitive Teardown

| Product | Free Tier | ~$1-3/mo Tier | ~$5-10/mo Tier | ~$10-15/mo Tier | What's Bundled Beyond Storage |
|---|---|---|---|---|---|
| **Google One** | 15 GB (shared across Gmail, Drive, Photos) | $1.99/mo = 100 GB | $2.99/mo = 200 GB | $9.99/mo = 2 TB | Google Workspace features (Docs, Sheets, Slides), shared family storage (up to 5 members on 200GB+), Google One AI Premium ($19.99/mo) adds Gemini Advanced + 2TB |
| **iCloud+** | 5 GB | $0.99/mo = 50 GB | $2.99/mo = 200 GB | $9.99/mo = 2 TB; $29.99/mo = 6 TB; $59.99/mo = 12 TB | iCloud Private Relay, Hide My Email, Custom Email Domain, HomeKit Secure Video, Photos sync, Mail, device backup, Keychain sync. All tiers get all features — only storage differs |
| **OneDrive** | 5 GB | — | Microsoft 365 Basic: $1.99/mo = 100 GB | Personal: $6.99/mo = 1 TB; Family: $9.99/mo = 6 TB (1TB each, up to 6 users) | **The value king.** 365 Personal includes full Word, Excel, PowerPoint, Outlook, OneNote, 1 TB OneDrive, 50 GB Outlook mailbox, Microsoft Copilot access |
| **Dropbox** | 2 GB | — | — | Plus: $11.99/mo = 2 TB; Professional: $24/mo* = 3 TB + eSign | Smart Sync, version history (30/180 days by tier), Dropbox Paper, Transfer (up to 100 GB files), Backup, Passwords, Vault |
| **Obsidian Sync** | 0 (local only, free app) | $4/mo = 1 GB (per vault) | $8/mo = 10 GB (per vault) | — | End-to-end encrypted sync across devices. Version history (1 year on $8 plan, 2 months on $4 plan). Up to 5 vaults on $8 plan. **No file hosting, no web access — purely vault sync** |
| **Notion** | Free (unlimited pages, 5 MB file upload limit) | — | Plus: $10/mo ($8/mo annual) = unlimited file uploads | Business: $15/mo/user = SAML SSO, advanced permissions, Notion AI included | Free tier is generous on content but cripples file uploads to 5 MB. Plus raises limit to ~5 GB per file. No explicit storage cap on pages/blocks — charges for seats and features, not GB |
| **Craft** | Free (limited to 1,000 blocks + 1 space) | — | Pro: $5/mo ($4/mo annual) | — | Unlimited blocks, unlimited spaces, PDF export, Markdown export, real-time collaboration, AI Assistant included. **Best value in the notes space at $5/mo.** iCloud-based sync |

### Cloud Storage Benchmarks by Price Point

| Price Point | Storage Users Expect | Set by |
|---|---|---|
| **Free** | 5-15 GB | Google (15 GB), iCloud (5 GB), OneDrive (5 GB) |
| **$1-2/mo** | 50-100 GB | iCloud ($0.99/50GB), Google ($1.99/100GB) |
| **$3/mo** | 200 GB | Google ($2.99/200GB), iCloud ($2.99/200GB) |
| **$5-7/mo** | 1 TB | OneDrive 365 Personal ($6.99/1TB + Office suite) |
| **$8-12/mo** | 2 TB | Google ($9.99/2TB), iCloud ($9.99/2TB), Dropbox Plus ($11.99/2TB) |

**Critical insight for Kaivoo at $8-12/mo:** Users are anchored to **2 TB of raw storage** at this price. Kaivoo is NOT a raw file storage product. Messaging must reframe value away from GB and toward what's stored (journals, tasks, projects, AI context) and what's done with it (sync, mobile access, managed AI).

---

## PART 2: Productivity Tool Pricing Teardown

| Product | Free Tier | Budget ($3-5/mo) | Mid ($8-12/mo) | Premium ($15-30/mo) | Target User |
|---|---|---|---|---|---|
| **Sunsama** | 14-day trial only | — | — | $16/mo (annual) or $20/mo | Intentional planners, daily ritualists |
| **Todoist** | 5 projects | Pro: $4/mo | — | Business: $6-8/mo/user | GTD practitioners |
| **TickTick** | Most features | Premium: $2.79/mo | — | — | Budget-conscious task managers |
| **Asana** | 10 users, basic | — | Starter: $10.99/user/mo | Advanced: $24.99/user/mo | Teams, project managers |
| **Monday.com** | 2 users | — | Basic: $9/seat/mo; Standard: $12/seat/mo | Pro: $19/seat/mo | Teams, visual managers |
| **Linear** | 250 active issues | — | Standard: $8/user/mo | Plus: $14/user/mo | Engineering teams |
| **ClickUp** | 100 MB storage | — | Unlimited: $7/user/mo | Business: $12/user/mo | "Everything app" teams |
| **Fantastical** | Basic calendar | Premium: $4.75/mo | — | — | Calendar power users (Apple) |
| **Notion Calendar** | **Free** | — | — | — | Notion + Google Cal users |
| **Morgen** | 1 calendar | — | Pro: $9/mo | — | Multi-calendar power users |

### What $8-12/mo Gets You Across the Market

| Category | Table-Stakes at $8-12/mo | Premium / Not Expected |
|---|---|---|
| **Tasks** | Unlimited tasks, projects, labels, reminders, mobile | AI prioritization, team workspaces, advanced automations |
| **Calendar** | Multi-calendar sync, time blocking, scheduling links | AI auto-scheduling, travel time estimates |
| **Notes/Docs** | Unlimited pages, basic formatting, file attachments | Full block editor, databases, embeds, API access |
| **Storage** | 1-5 GB attached files (productivity tools); 2 TB (pure storage) | Unlimited file storage, version history >30 days |
| **Sync** | Cross-device sync (desktop + mobile + web) | E2E encryption, offline-first, selective sync |
| **AI** | Basic AI features (summarize, rewrite, generate) | Deep AI (auto-scheduling, personalized insights, agent orchestration) |
| **Integrations** | Google Calendar, basic app connections | Zapier/Make, API access, webhooks |

---

## KEY INSIGHTS

### 1. The $8-12/mo Zone Is Fiercely Competitive

Most crowded price band in productivity SaaS. Users can choose from Notion Plus ($8-10), Linear Standard ($8), Morgen Pro ($9), Obsidian Sync ($8), Todoist + TickTick combined ($7). Users at this price point are sophisticated enough to compare but not committed enough to stomach $20+/mo without clear differentiation. **This is the "prove it" tier.**

### 2. Storage Is NOT the Value at $8-12/mo in Productivity Tools

Pure storage services deliver 2 TB for $10/mo. Productivity tools deliver 1-5 GB for $8-12/mo, and nobody complains. The value is in **what the tool does with your data**, not how much it stores.

**Kaivoo implication:** Do not compete on GB. Compete on what happens inside those GB — journal intelligence, task automation, calendar-aware AI, cross-entity linking, soul file context.

### 3. The "Bundle Replacement" Frame Is Powerful

| What Kaivoo Replaces | Separate Cost |
|---|---|
| Todoist Pro (tasks) | $4/mo |
| Obsidian Sync (notes sync) | $8/mo |
| Notion Plus (docs/knowledge) | $10/mo |
| Fantastical Premium (calendar) | $4.75/mo |
| Day One Premium (journal) | $4.17/mo |
| **Separate total** | **$30.92/mo** |
| **Kaivoo Web** | **$8-12/mo** |

### 4. AI Is the Differentiator Nobody Has Nailed at This Price

At $8-12/mo: Todoist/TickTick have minimal AI. Obsidian has zero native AI. Notion AI is only bundled at Business ($15+). Craft has lightweight AI at $5/mo. Morgen/Fantastical have no meaningful AI.

**Nobody at $8-12/mo offers a personal AI concierge that knows your journal, tasks, calendar, routines, and context.** This is Kaivoo's opening.

### 5. Per-Seat vs. Per-User Changes Everything

Team tools (Asana, Monday, Linear, ClickUp) are priced per-seat — effective cost is 3-10x sticker price for even small teams. Kaivoo at $8-12/mo is personal — no seat multiplication. Matters for solo founders, freelancers, knowledge workers who want serious tools without collaboration overhead.

---

## POSITIONING RECOMMENDATION

### Price Point: $9/mo (Annual) / $12/mo (Monthly)

- **$9/mo annual ($108/yr):** Just above Obsidian Sync ($8/mo), Notion Plus ($8/mo annual), Morgen ($9/mo annual). Feels like a steal for scope.
- **$12/mo monthly:** Standard "no commitment" premium. Below Notion Plus monthly. Signals real product.
- **25% annual savings** incentivizes commitment, improves cash flow, reduces churn.

### Position in Market

```
$0        $4-5       $8-12         $16-20        $29+
|          |           |              |             |
TickTick   Todoist    KAIVOO WEB    Sunsama       Motion
Notion Cal  Craft     Notion Plus   Notion Biz    Akiflow
           Obsidian   Morgen
           Sync $4    Linear
                      Obsidian
                      Sync $8
```

### Value Messaging

**Do say:**
- "Your journal, tasks, calendar, and AI — synced everywhere for less than Notion"
- "Replace 5 apps with 1. Access from any device."
- "AI that knows you. BYO keys or use ours."

**Don't say:**
- Anything about GB of storage (you lose to Google/iCloud immediately)
- "Unlimited" anything (sets unsustainable expectations)
- Comparisons to team tools (different category)

---

## What $8-12/mo Buys Across the Market (Summary)

| Product | Price | Storage | AI | Tasks | Calendar | Notes/Journal | Mobile | Sync |
|---|---|---|---|---|---|---|---|---|
| Google One | $9.99/mo | 2 TB | Separate | No | No | No | Yes | Yes |
| iCloud+ | $9.99/mo | 2 TB | No | No | No | No | Yes | Yes |
| Notion Plus | $8-10/mo | ~5 GB | Limited | Basic | No | Yes | Yes | Yes |
| Obsidian Sync | $8/mo | 10 GB | No | Plugins | No | Yes | Yes | E2E |
| Morgen Pro | $9/mo | N/A | No | Integration | Yes | No | Yes | Yes |
| Linear Std | $8/mo | N/A | Limited | Issues | No | No | Yes | Yes |
| Todoist Pro | $4/mo | N/A | Basic | Yes | Sync only | No | Yes | Yes |
| Craft Pro | $5/mo | ~GB | Basic | No | No | Yes | Yes | Yes |
| **Kaivoo Web** | **$8-12/mo** | **Supabase** | **Yes (concierge)** | **Yes** | **Yes** | **Yes** | **Yes** | **Yes** |

**Bottom line:** At $8-12/mo, no single competitor offers tasks + calendar + journal + AI concierge + cross-device sync in one product. They each cover 1-2 columns. Kaivoo covers all of them.
