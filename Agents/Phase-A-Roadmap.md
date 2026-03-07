# Phase A — Ship & Sell Flow Desktop

**Status:** ACTIVE — Final MVP sprints
**Target:** $99/$49 one-time. 2,000+ founding members. $100K.
**Updated:** March 6, 2026
**Closes out when:** Flow Desktop v1 ships and is purchasable.

---

## MVP Definition

The MVP is not "minimum." It's the product you're proud to charge $49-99 for. These are the items that must ship in v1 — everything else is post-launch iteration.

### Above the Line (Ships in v1)

**Page Consolidation & UX:**
- Merge Tasks + Projects into a single page (see Sprint 30 reference design below)
- Research Vault + Topics unification → merge into unified knowledge browser (Sprint 31)
- Remove "Sign Out" button on desktop (conditionally hide via `isTauri()`)
- Vault CRUD operations — rearrange, rename, delete files

**Bugs (Must Fix):**
- Subtask reorder not working
- Today page widgets not reorderable
- Calendar widget showing old Supabase data
- Calendar widget can't toggle on when no events exist
- Search requires full word match ("NU" doesn't find "NUWAVE") — needs prefix matching

**Concierge Hardening:**
- Pre-compaction memory flush (Layer 4) — save facts before context truncation
- Deterministic context assembly (Layer 1-2) — audit Sprint 24 prompt, ensure structured data injection
- Basic coherence monitoring (Layer 7 basic) — lightweight drift detection logging

**UX Polish:**
- Wizard language refinement
- Image renaming on uploads
- Upload system polish (progress, drag-drop zones, intuitive file placement)

**Launch Infrastructure:**
- Landing page (DONE — Sprint 28, deployed to Netlify) — **REWORK in Sprint 29: rebuild as Flow by Kaivoo + new MVP narrative**
- EULA + Privacy Policy drafts (DONE — Sprint 28) — **REWORK in Sprint 29: update for Flow product name, Kaivoo as company**
- Product Hunt listing draft (DONE — Sprint 28) — **REWORK in Sprint 29: rewrite for Flow identity**
- Code signing: Developer ID Application cert + Apple notarization + Azure Trusted Signing
- Revenue pipeline: Stripe config, Edge Function deploy, payment testing
- Landing page update for v7.1 funnel (add "Try Free" CTA alongside "Buy Desktop")

**Cleanup + Hardening (Sprint 33):**
- Code quality: extract import utilities, Zod validation, duplicate import warning (Agent 7 Sprint 27)
- Accessibility: dark mode contrast fix (primary/foreground 3.8:1 → 4.5:1), Sprint 25 P1s (17 items)
- Technical debt: empty state/editor co-presence, adapter gaps, htmlToPlainMarkdown, TS casts (Agent 11 Sprint 26)
- Security: CORS hardening, rate limiting
- Plus any issues surfaced during Sprints 29–32

### Below the Line (Post-Launch Fast-Follow)

- AI memory import from any provider (Claude, ChatGPT, Llama, etc.) — requires research on export formats
- Voice transcription (notes, AI chat) — high value, high scope
- Multi-API key routing ("Sonnet for chat, Opus for thinking") — Phase B Orchestrator foundation
- Per-page Today widgets — needs design work first
- Upload system as full Google Drive experience — v1 needs "good enough," v2 makes it great
- Google Calendar integration (MCP server exists)
- Gmail integration (MCP server exists)
- White-label config
- Notifications & reminders
- PWA support

---

## Sprint Plan (28–34)

| Sprint | Theme | Scope | Status |
|---|---|---|---|
| **28** | Launch Ready | Landing page, legal docs, Product Hunt listing | **DONE** |
| **29** | Flow Rebrand | In-app rename (Kaivoo → Flow), landing page rebuild, legal updates, Product Hunt rewrite, wizard copy, sign-out removal, screenshots | **IN PROGRESS** |
| **30** | Bug Bash + Concierge Hardening | 5 bug fixes, pre-compaction flush, deterministic context assembly, coherence monitoring, image rename, upload polish | PLANNED |
| **31** | Tasks + Projects Merge | UX redesign — single page, project detail with sub-nav tabs. Research in separate session first. | PLANNED |
| **32** | Knowledge Unification | Vault + Topics research → merge into unified knowledge browser | PLANNED |
| **33** | Cleanup + Hardening | Code quality (Agent 7), accessibility (dark mode contrast, Sprint 25 P1s), technical debt (Agent 11), security hardening, plus issues surfaced in 29–32 | PLANNED |
| **34** | Ship Prep | Code signing (Developer ID Application cert + notarization), revenue pipeline deployment, landing page v7.1 update, final QA | PLANNED |
| **LAUNCH** | Flow Desktop v1 ships | Web free trial can follow as fast-follow or concurrent | — |

### Sprint 31 Reference Design — Tasks + Projects Merge

The target UX is a project detail view that opens like a task detail panel, with integrated AI collaboration and tabbed sub-navigation. Reference: NUWAVE Mainframe project screenshot.

**Layout — Two panels:**

**Left Panel — AI Collaboration Area:**
- Project-specific concierge chat context
- Quick action chips: "Plan this project," "Prioritize tasks," "Brainstorm ideas"
- Rich text input with file attachment, project tagging, model selection
- The concierge scoped to this project's context

**Right Panel — Task Management:**
- Project progress bar (X / Y tasks completed)
- Task list with inline completion
- Bottom navigation tabs: Tasks | Documents | Meetings | Notes | Settings | Links

**Key principle:** The project IS the page. No separate Projects page and Tasks page — the project detail view contains everything. Tasks that aren't assigned to a project still appear in a default/unassigned view.

*Detailed research and design to be conducted in a separate session before Sprint 30 begins.*

---

## Launch Sequence

Desktop and web launch on parallel tracks:

1. **Web free trial launches first** — no Apple cert dependency. Sign-up flow, 14-day full experience, "subscribe" or "buy desktop" CTAs.
2. **Desktop ships when certs clear** — Apple notarization + code signing happen in parallel. Desktop is the flagship.
3. **Companion app follows Tier 2** — ships when Web Access subscription infrastructure is live.

**Code Signing (Apple — Desktop Distribution):**
- Apple Developer account: CREATED
- Certificate needed: **Developer ID Application** (for direct distribution, NOT App Store)
- Do NOT need: App Store Distribution certificate (not listing on Mac App Store for Phase A)
- Flow: Developer ID Application cert → sign .dmg → submit to Apple notarization → staple ticket → distribute
- Agent 9 to provide step-by-step execution guide in Sprint 34

**Code Signing (Windows — Azure Trusted Signing):**
- Azure account: CREATED
- Service: Azure Trusted Signing (~$9.99/mo)
- Agent 9 to provide setup guide in Sprint 34

---

## Milestones — Completed

| Milestone | Sprint |
|---|---|
| Foundation scaffold (Lovable prototype) | Sprint 0 |
| Security hardening + performance + code quality | Sprint 1 |
| Error sanitization, accessibility, TrackingWidget refactor, test infrastructure | Sprint 4 |
| CI/CD pipeline, Zustand optimization, service typing, test expansion (81 tests) | Sprint 5 |
| Design System migration (Kaivoo palette, components) | Sprint 3–5 |
| Unified Day View (Today page redesign) | Sprint 3 |
| Task recurrence (Daily/Weekly/Monthly), Tasks page filtering & bulk actions | Sprint 6 |
| Calendar page redesign — month grid + hourly day view | Sprint 16 |
| Core feature enhancement (journal, topics, notes, captures) | Sprints 7–8, 14 |
| Routines & Habits — streaks, strength, analytics, mood correlation | Sprint 17 |
| Global full-text search (FTS, GIN indexes, command palette) | Sprint 18 |
| Calendar week view (7-column hourly grid, 3-mode switcher) | Sprint 18 |
| Customizable keyboard shortcuts | Sprint 18 |
| Market analysis & competitive landscape (Agent 8) | Sprint 2 |
| Customer personas & pricing validation | Sprint 2 |
| Projects system — Project → Task → Subtask hierarchy | Sprint 8 |
| Topics as Knowledge OS — vault file browser, markdown export, topic nesting | Sprint 22 |
| Desktop packaging (Tauri 2.0) — macOS scaffold, .dmg builds | Sprint 20 |
| Data layer abstraction — DataAdapter pattern, runtime switching | Sprint 20 |
| Local-first storage — SQLite CRUD, FTS5 search, local auth | Sprint 21 |
| File attachments + inline images | Sprint 25–26 |
| Topic content editing — Tiptap rich text, auto-save | Sprint 26 |
| AI settings page + BYO API key wizard | Sprint 23 |
| AI chat concierge — in-app conversational AI | Sprint 23 |
| Soul file — persistent AI memory, fact extraction, user-editable memory UI | Sprint 24 |
| Setup wizard + Concierge Hatching | Sprint 23 |
| License key system — Ed25519 offline verification, Stripe checkout | Sprint 25 |
| Stripe integration — $49/$99 Checkout, Edge Functions | Sprint 25 |
| Desktop verification — 8 Tauri-specific issues found and fixed | Sprint 27 |
| Landing page + legal docs + Product Hunt listing | Sprint 28 |

## Milestones — Remaining

| Milestone | Status | Sprint |
|---|---|---|
| Flow rebrand (in-app, landing page, legal, Product Hunt) | **IN PROGRESS** | Sprint 29 |
| Bug fixes (subtask reorder, widget reorder, calendar, search) | PLANNED | Sprint 30 |
| Pre-compaction memory flush | PLANNED | Sprint 30 |
| Deterministic context assembly | PLANNED | Sprint 30 |
| Basic coherence monitoring | PLANNED | Sprint 30 |
| UX polish (image rename, uploads) | PLANNED | Sprint 30 |
| Tasks + Projects merge | PLANNED | Sprint 31 |
| Vault + Topics unification | PLANNED | Sprint 32 |
| Cleanup + hardening (code quality, a11y, security) | PLANNED | Sprint 33 |
| Code signing + notarization | PLANNED | Sprint 34 |
| Revenue pipeline deployment | PLANNED | Sprint 34 |
| Landing page v7.1 update (free trial CTA) | PLANNED | Sprint 34 |

---

## Current Position

**Active sprint:** Sprint 29 — Flow Rebrand (IN PROGRESS — P1-P6 complete, P7 screenshots awaiting user)
**Branch:** `sprint/29-flow-rebrand`
**Tests:** 265 passing
**Sprint sequence:** 6 focused sprints remaining (29–34). Each sprint is single-themed and tightly scoped for focused sandbox testing.
**Landing page:** Rebuilt as Flow by Kaivoo in Sprint 29. Deployed to Netlify.

---

## Target Metrics

| Metric | Target |
|---|---|
| Lighthouse Score | > 95 (all categories) |
| First Contentful Paint | < 1.2s |
| Initial Bundle (gzipped) | < 200KB |
| API Response Time (p50) | < 100ms |
| Accessibility | WCAG AA compliance |
| Code Audit Score | 8.5+/10 |
| Phase A Sales | 2,000+ founding members ($100K) |
| Time to Value (setup → "aha moment") | < 5 minutes |

---

*Phase A Roadmap — Closes out when Flow Desktop v1 ships and is purchasable.*
*Updated March 6, 2026 — Sprint plan restructured from 4 sprints (29–32) to 6 focused sprints (29–34). Each sprint is single-themed for tighter scope and focused sandbox testing. Cleanup + Hardening sprint (33) added as quality buffer before Ship Prep. AI memory import moved to post-launch (requires research across providers). Director Session.*
*Updated March 6, 2026 — Sprint 29 expanded to include Flow rebrand (CEO Session #9).*
*Created March 6, 2026 — Extracted from Vision v7.1 during CEO Session #8 restructure.*
