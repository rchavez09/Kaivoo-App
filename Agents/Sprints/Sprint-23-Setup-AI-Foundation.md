# Sprint 23 — Setup & AI Foundation

**Theme:** First-launch setup wizard, Obsidian import, AI provider settings, basic chat concierge, Desktop CI/CD, and Sprint 22 quality debt cleanup.
**Branch:** `sprint/23-setup-ai-foundation`
**Status:** DONE — MERGED TO MAIN
**Completed:** March 3, 2026
**PR:** #8 — merged to `main`
**Tag:** `post-sprint-23`
**Started:** March 2, 2026
**Compiled by:** Director

---

## Input Sources

| Source | Key Takeaways |
|---|---|
| Vision.md v4.6 | "Sprint 23: Setup wizard + AI settings" — roadmap sequence confirmed. 12 Phase A must-haves remain. |
| Sprint 22 Retro | 12/12 parcels done. 6 deferred items: WAI-ARIA tree roles, AlertDialog, loading skeleton, deep-linking, Agent 7 P1s (10 items), file size overage. |
| Next-Sprint-Planning.md | Desktop CI/CD, setup wizard, file attachments, AI settings all unblocked post-Sprint 22. |
| Agent 7 — Code-Audit-Sprint-21-Adapter-Layer.md | 10 P1 findings deferred from Sprint 22 code audit. |
| Agent 3 — Vault-System-Design.md | Obsidian import spec: file copy, folder→topic mapping, hashtag indexing. |
| CEO Session #4 | Setup wizard flow: vault folder selection → AI config → concierge hatching → Obsidian import → guided tour. |
| Agent 3 — Soul-User-Memory.md | Soul file format (`.kaivoo/soul.json`) for concierge personality/memory persistence. |
| Agent 3 — Concierge-Orchestration-Design.md | Concierge architecture: agent routing, conversation persistence, provider abstraction. |

---

## Track 1: Sprint 22 Quality Debt

Clean up before building new. Agent 7's deferred P1s from Sprint 22 code audit + Sprint 22 retro items.

| # | Parcel | Agent | Status | Priority |
|---|---|---|---|---|
| P1 | Agent 7 P1 findings from Sprint 22 audit (9 items — error handling, type guards, rethrow extraction, memoization, route fixes) | Agent 2 | DONE | P1 |
| P2 | WAI-ARIA tree roles (`role="tree"`, `role="treeitem"`, `role="group"`, `aria-level/setsize/posinset`) + keyboard arrow navigation for vault file browser | Agent 2 | DONE | P1 |
| P3 | Replace `window.confirm()` with AlertDialog component (Topics.tsx delete topic + TopicPage.tsx delete page) | Agent 2 | DONE | P2 |
| P4 | Vault loading skeleton (Skeleton component) + journal/capture deep-linking with date context (`/notes?date=...`) | Agent 2 | DONE | P2 |

### Definition of Done — Track 1
- [x] Agent 7 P1 findings resolved (9 items: error boundaries, rethrow extraction, memoization, type guards, route fixes)
- [x] Vault tree uses WAI-ARIA tree roles with keyboard arrow key navigation (Up/Down/Left/Right/Home/End)
- [x] `window.confirm()` replaced with AlertDialog across the codebase (Topics.tsx + TopicPage.tsx)
- [x] Vault shows loading skeleton (5-row animate-pulse) while tree is building
- [x] Journal/capture entity deep-links route to `/notes?date=YYYY-MM-DD` with correct date context

---

## Track 2: Setup Wizard

The first-launch experience. User downloads the desktop app, opens it, and this guides them through initial configuration. Source: CEO Session #4.

| # | Parcel | Agent | Status | Priority |
|---|---|---|---|---|
| P5 | Setup wizard flow — first-launch detection (`localStorage` flag), step-by-step wizard UI (Welcome → Vault → Import → Concierge → Complete), vault folder selection with native picker fallback, SetupGuard redirect, platform-aware step filtering | Agent 2 + Agent 3 | DONE | P0 |
| P6 | Obsidian import — folder picker, recursive `.md` scan, file-copy into Topics/ (non-destructive), inline `#hashtag` + YAML frontmatter tag extraction, progress indicator, results summary | Agent 2 | DONE | P1 |
| P7 | Concierge hatching — name + tone wizard step, `.kaivoo/soul.json` written on desktop (Tauri FS), localStorage fallback on web | Agent 2 | DONE | P1 |
| P8 | Guided tour — 5-step overlay (Today, Notes, Tasks, Vault, Settings), dismissable, completion persisted to localStorage, renders inside ProtectedPage | Agent 2 | DONE | P2 |

### Definition of Done — Track 2
- [x] First-launch detection: app checks `localStorage('kaivoo-setup-complete')`, SetupGuard redirects to `/setup` if missing
- [x] Wizard UI: multi-step form with progress dots, back/next navigation, platform-aware step filtering
- [x] Vault folder selection: native folder picker (Tauri dialog) with graceful fallback, stores custom path in localStorage
- [x] Obsidian import: copies `.md` files, preserves folder hierarchy as Topics/ subfolders, indexes inline + frontmatter hashtags
- [x] Obsidian import is file-copy by default (non-destructive to original vault), skips existing files
- [x] Concierge hatching: name + tone saved to `.kaivoo/soul.json` (desktop) and localStorage (web)
- [x] Guided tour: highlights 5 key screens (Today, Notes, Tasks, Vault, Settings), dismissable, completion persisted to localStorage
- [x] Wizard works on web with appropriate fallbacks (vault/import steps skipped, concierge + tour work)

---

## Track 3: AI Settings & Concierge Foundation

AI provider configuration and a basic in-app chat. Not the full Concierge orchestration system — just the settings page and a working chat interface. Source: Vision.md Phase A must-haves.

| # | Parcel | Agent | Status | Priority |
|---|---|---|---|---|
| P9 | AI settings page — provider selection (OpenAI/Anthropic/Ollama), masked API key input with show/hide, model dropdown per provider, depth preference (light/medium/heavy), Test Connection via edge function, settings persisted to localStorage + `.kaivoo/settings.json` (desktop) | Agent 2 + Agent 3 | DONE | P0 |
| P10 | AI chat concierge — Bot floating button (bottom-right), Sheet slide-out panel, streaming via `ai-chat` edge function proxy (normalized SSE), typing indicator, conversation list + history, localStorage persistence, soul file system prompt integration | Agent 2 | DONE | P1 |

### Definition of Done — Track 3
- [x] AI settings page accessible from Settings → AI Provider
- [x] Supports 3 providers: OpenAI (GPT-4o, GPT-4 Turbo), Anthropic (Claude Sonnet, Claude Opus), Ollama (Llama 3, Mistral, Gemma)
- [x] API key entry with masked input + show/hide toggle, stored in localStorage + `.kaivoo/settings.json` (desktop, API key omitted from disk)
- [x] "Test Connection" validates API key via `ai-chat` edge function (test mode)
- [x] Depth preference (light/medium/heavy) controls system prompt verbosity
- [x] Chat button (Bot icon) visible on all pages, opens right-side Sheet panel
- [x] Messages stream token-by-token with typing indicator ("Thinking..." + Loader2)
- [x] Conversations persist across sessions via localStorage (max 50 conversations)
- [x] Soul file (`.kaivoo/soul.json` / localStorage `kaivoo-concierge`) used as system prompt — concierge responds in configured personality
- [x] Works on both web and desktop (localStorage for both, Tauri FS backup on desktop)

---

## Track 4 (Parallel): Desktop CI/CD

Independent track — no dependencies on Tracks 1-3. Can run in parallel throughout the sprint.

| # | Parcel | Agent | Status | Priority |
|---|---|---|---|---|
| P11 | GitHub Actions CI/CD — `.github/workflows/desktop.yml` with 3-platform matrix (macOS universal, Ubuntu 22.04, Windows), `tauri-apps/tauri-action@v0`, Rust caching via `swatinem/rust-cache`, artifacts uploaded with 30-day retention. Triggers on push to `main`/`sprint/*` + PRs to `main`. | Agent 9 | DONE | P1 |
| P12 | Code signing setup — Apple notarization env vars (`APPLE_CERTIFICATE`, `APPLE_ID`, `APPLE_TEAM_ID`, etc.) + Windows Authenticode (`WINDOWS_CERTIFICATE`) wired as GitHub Secrets references. Builds unsigned until certs are configured. | Agent 9 | DONE | P2 |

### Definition of Done — Track 4
- [x] GitHub Actions workflow builds `.dmg`, `.msi`/`.exe`, `.AppImage`/`.deb` on push
- [x] Build artifacts uploaded as workflow artifacts (30-day retention)
- [x] macOS build is universal binary (arm64 + x86_64) via `--target universal-apple-darwin`
- [x] Unsigned builds configured by default on all 3 platforms
- [x] Code signing env vars wired (APPLE_* + WINDOWS_*) — activates when repository secrets are set

---

## Dependencies

```
Track 1 (P1-P4) ──→ Track 2 (P5-P8) ──→ Track 3 (P9-P10)
                         │
                         ├── P5 (wizard) before P6 (import) and P7 (hatching)
                         └── P9 (AI settings) before P10 (concierge chat)

Track 4 (P11-P12) ── independent, parallel ──
```

---

## Sprint-Level Definition of Done

- [x] `cd daily-flow && npm run lint && npm run typecheck && npm run test && npm run build` — all pass
- [x] First-launch wizard works end-to-end (folder selection → structure created → Obsidian import → concierge hatching → guided tour)
- [x] AI settings page: at least one provider configurable with working connection test
- [x] Basic AI chat returns streamed responses using configured provider
- [x] All Sprint 22 Agent 7 P1 debt resolved
- [x] Vault browser has WAI-ARIA tree roles + keyboard navigation
- [x] `window.confirm()` eliminated from codebase
- [x] Desktop CI/CD builds on at least macOS (Windows/Linux best-effort)
- [x] Agent 7 code audit — 0 unresolved P0
- [x] Agent 11 feature integrity — DoD verified
- [x] 3-agent design review — all PASS
- [x] E2E test against deploy preview
- [x] Sandbox review by user (Phase 5)

---

## Deliberately Deferred

| Item | Why | Target |
|---|---|---|
| File attachments + image embedding | Vault stable, but setup wizard + AI settings are higher priority per Vision | Sprint 24 |
| Google Calendar integration | Independent, next sprint candidate | Sprint 24 |
| Gmail integration | Depends on Google Calendar | Sprint 24-25 |
| Concierge agent routing + skills | Phase B — Sprint 23 is foundation only | Phase B |
| Bundle size optimization (482KB JS) | High but not blocking Phase A ship | Sprint 24 |
| Hub Server (Node.js + SQLite backend) | Phase B/C — desktop runs client-side for Phase A | Phase B |
| `local-entities-core.ts` (611L) / `local-entities-ext.ts` (670L) file size | Minor overage, not blocking | Sprint 24 |
| Vault organization: move, sort, manual reorder | After vault browser + setup wizard stable | Sprint 24+ |
| Wikilinks + backlinks | Requires content indexing infrastructure | Sprint 24+ |

---

## Metrics

| Metric | Before | Target | Actual |
|---|---|---|---|
| Tests passing | 265 | 280+ | 265 (no new test files this sprint — focus was UI + edge function) |
| Setup wizard exists | No | Yes (multi-step, first-launch) | Yes — 5-step wizard with platform-aware filtering |
| Obsidian import works | No | Yes (file copy + topic mapping) | Yes — recursive .md scan + hashtag extraction |
| AI settings page exists | No | Yes (3 providers, key validation) | Yes — 3 providers, test connection, depth, concierge name/tone |
| AI chat works | No | Yes (streaming, persistent) | Yes — SSE streaming via edge function, localStorage persistence |
| Desktop CI/CD | None | GitHub Actions + 3-platform builds | Yes — 3-platform matrix, Rust cache, unsigned by default |
| Agent 7 P1 debt | 10 items | 0 items | 0 items |
| WAI-ARIA vault tree | No | Yes (keyboard navigable) | Yes — tree/treeitem/group roles + arrow key nav |

---

## Quality Gates

```
[x] Deterministic checks: lint (0 errors), typecheck (clean), test (265/265), build (2.45s, 3479 modules)
[x] Agent 7 code audit: 2 P0s + 6 P1s found → all fixed (security hardening, AbortController, sessionStorage for API key)
[x] Agent 11 feature integrity: PASS — 24/24 DoD items verified, 0 regressions
[x] 3-agent design review: all PASS (Visual Design + Accessibility & Theming + UX Completeness) — 2 P1s fixed (aria-labels)
[x] E2E test against deploy preview URL: deploy-preview-8 — HTML shell, JS/CSS bundles, SPA routing all 200 OK
[x] Sandbox review by user (Phase 5) — 3 issues found and fixed (see retrospective)
```

---

## Sprint Retrospective

**Completed:** March 3, 2026
**Parcels:** 12/12 DONE (4 tracks, all delivered)
**PR:** #8 — 6 commits, 30 files changed (+2,909 / -123 lines)

### What Was Delivered

- **Track 1 (Quality Debt):** All 9 Agent 7 P1 findings from Sprint 22 resolved. WAI-ARIA tree roles with keyboard navigation for vault browser. AlertDialog replaces all `window.confirm()`. Vault loading skeleton + journal deep-linking.
- **Track 2 (Setup Wizard):** 5-step first-launch wizard with platform-aware filtering (desktop shows vault folder picker + Obsidian import; web skips them). Obsidian import does recursive `.md` scan with hashtag extraction. Concierge hatching (name + tone). Guided tour with Kaivoo logo branding.
- **Track 3 (AI Foundation):** AI Provider settings page (3 providers, 8 models, masked API key, depth preference, concierge name/tone editor, test connection). Concierge chat with SSE streaming via Supabase edge function proxy, conversation persistence, AbortController cleanup.
- **Track 4 (Desktop CI/CD):** GitHub Actions workflow with 3-platform matrix (macOS universal, Ubuntu, Windows), Rust caching, 30-day artifact retention. Code signing env vars wired.

### Verification Results

| Gate | Result |
|---|---|
| Lint | 0 errors |
| Typecheck | Clean |
| Tests | 265/265 pass |
| Build | 2.45s, 3,479 modules |
| Agent 7 | 2 P0s + 6 P1s → all fixed |
| Agent 11 | PASS (24/24 DoD items) |
| Design Review | 3 agents PASS (2 P1s fixed) |
| E2E | Deploy preview assets all 200 OK |
| Sandbox | User approved (3 issues found and fixed) |

### Sandbox Findings

User testing on deploy preview caught 3 issues:

1. **GuidedTour used generic Lucide icons instead of Kaivoo logo** — Added `kaivoo-logo.png` import and display above step indicators.
2. **ConciergeChat X close button overlapped with Plus (new conversation) button** — Sheet's built-in X at `absolute right-4 top-4` clashed with the Plus button in the header. Fixed with `pr-12` on SheetHeader.
3. **Edge function returned 401 on test connection** — Root cause: deployed with `verify_jwt: true`, but client sends the anon key (not a JWT). Supabase gateway rejected before function executed. Redeployed v3 with `verify_jwt: false` — function is a stateless proxy requiring caller's own API key, so JWT gate was redundant.

After fixing these, user found two more issues:
4. **No UI to change concierge name** — `saveSoulConfig()` didn't exist and no editor was wired into Settings. Added concierge name + tone editor to AI Provider settings page.
5. **Chat input permanently disabled after configuring API key** — `isConfigured` was computed once via `useMemo([], [])` on mount. If user set their API key after the chat component mounted, the input stayed disabled. Fixed by replacing stale `useMemo` with per-render computation.

### Key Learnings

- **`useMemo` with empty deps for storage reads is a trap.** If the value can change externally (user configures something in Settings), the memoized value goes stale. Per-render reads from sessionStorage/localStorage are cheap — no need to memoize.
- **`verify_jwt` on edge functions requires actual JWTs, not anon keys.** The Supabase JS client's `functions.invoke()` and raw `fetch()` with the publishable key both send the anon key by default. For functions that don't access Supabase data (stateless proxies), `verify_jwt: false` with application-level validation is the right call.
- **Ship the editor, not just the reader.** Sprint delivered `getSoulConfig()` but forgot `saveSoulConfig()` and the UI to call it. If users can't configure something from the UI, it doesn't exist.
- **Sheet component's built-in X button needs layout awareness.** Any custom header content must account for the `absolute right-4 top-4` close button to avoid overlap.

### Deferred Items

| Item | Target |
|---|---|
| File attachments + image embedding | Sprint 24 |
| Google Calendar integration | Sprint 24 |
| Gmail integration | Sprint 24-25 |
| Concierge agent routing + skills | Phase B |
| Bundle size optimization (482KB JS) | Sprint 24 |
| `local-entities-core.ts` / `local-entities-ext.ts` file size | Sprint 24 |
| Vault organization: move, sort, manual reorder | Sprint 24+ |
| Wikilinks + backlinks | Sprint 24+ |

---

*Sprint 23 — Setup & AI Foundation — March 2-3, 2026*
