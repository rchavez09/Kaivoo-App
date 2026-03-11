# Sprint 37 — Configurable Heartbeat

**Theme:** Proactive AI — the concierge acts without being asked.
**Branch:** `sprint/37-configurable-heartbeat`
**Status:** IN PROGRESS
**Compiled by:** Dev Director
**Date:** March 11, 2026

---

## Why This Sprint Exists

Sprint 35-36 made the AI concierge capable of executing actions reliably across all providers. But the concierge is still **reactive** — it only acts when the user opens chat and asks. This sprint makes the AI **proactive** — a background heartbeat that monitors user context (tasks, calendar, journal, soul file) and surfaces insights or actions without being prompted.

This is foundational infrastructure for the orchestrator (Sprints 39+) and a core differentiator: the AI doesn't just respond to you, it works *for* you in the background.

**Result:** Users configure how often the heartbeat runs (morning only, evening summary, every N hours, custom cron, or off). When the heartbeat fires, it reads user context and generates proactive insights. If actionable, the system sends a notification. The user sees value from the AI even when they're not actively using the app.

---

## Input Sources

| Source | Key Takeaways |
|---|---|
| Next-Sprint-Planning.md | Sprint 37 defined: background timer, settings UI, context-aware insights, notifications |
| Vision.md v7.8 | Core principle #3: "AI serves you, not the other way around" — proactive insights align with this |
| Sprint 24 (Soul File + Concierge) | Soul file structure is established, context assembly pattern exists in `prompt-assembler.ts` |
| Sprint 30 (Pre-compaction flush) | `PRE_COMPACTION_THRESHOLD` pattern — heartbeat will need similar context thresholds |

---

## Parcels

### Track 1 — Background Timer Infrastructure (Agent 2, Agent 3)

#### P1: Background Timer (Tauri Process) with Configurable Interval
**Source:** Next-Sprint-Planning.md
**Status:** PENDING
**Agent:** Agent 2, Agent 3

Build a background timer that runs independently of the UI. On desktop (Tauri), this runs as a system process. On web, this runs as a Web Worker or service worker (within browser constraints).

**Desktop implementation (Tauri):**
- Use Tauri's event system + Rust backend timer
- Timer runs even when app is minimized or in background
- Configurable interval (stored in settings)
- Emits events to frontend when heartbeat triggers

**Web implementation (fallback):**
- Use `setInterval` in a Web Worker (runs while tab is open)
- Or use service worker with `postMessage` (runs even when tab is closed, but requires HTTPS)
- Note: web has browser limitations — background execution is not guaranteed

**Definition of Done:**
- [ ] Tauri backend command: `start_heartbeat(interval_seconds)`, `stop_heartbeat()`
- [ ] Timer fires at configured interval
- [ ] Frontend receives heartbeat event via Tauri event listener
- [ ] Timer persists across app restarts (reads interval from settings on launch)
- [ ] Web fallback: `setInterval` in main thread (acceptable for V1 — Web Worker is Phase B optimization)
- [ ] Settings store includes `heartbeatEnabled: boolean`, `heartbeatInterval: number` (in seconds)

---

#### P2: Settings UI for Heartbeat Frequency
**Source:** Next-Sprint-Planning.md
**Status:** PENDING
**Agent:** Agent 2
**Depends on:** P1 (timer must exist before UI can configure it)

Add a "Proactive Insights" section to Settings with heartbeat configuration:

**UI options:**
1. **Off** (disabled)
2. **Morning only** (once at 8am)
3. **Evening summary** (once at 6pm)
4. **Every N hours** (dropdown: 1h, 2h, 4h, 6h, 12h)
5. **Custom** (cron-style input for advanced users)

**Settings page structure:**
```
AI Settings
  └─ Proactive Insights
      ├─ Enable heartbeat (toggle)
      ├─ Frequency (dropdown with options above)
      └─ Advanced: Custom schedule (cron input, shown only if "Custom" selected)
```

**Implementation:**
- Update `src/pages/Settings.tsx` with new section
- Wire to settings store (`useSettingsStore`)
- On change, call Tauri `start_heartbeat(interval)` to restart timer with new interval
- Validate cron input (if custom) — use `cronstrue` library for human-readable preview

**Definition of Done:**
- [ ] Settings UI section added to Settings page
- [ ] All 5 frequency options available
- [ ] Cron input validates and shows preview ("Every day at 8:00 AM")
- [ ] Changing frequency restarts the timer with new interval
- [ ] Settings persist to local storage (web) and Tauri store (desktop)

---

### Track 2 — Heartbeat Logic (Agent 2)

#### P3: Heartbeat Reads User Context and Surfaces Proactive Insights
**Source:** Next-Sprint-Planning.md
**Status:** PENDING
**Agent:** Agent 2
**Depends on:** P1 (timer fires events), P2 (user has configured frequency)

When the heartbeat timer fires, run a background AI inference that reads user context and generates proactive insights.

**Context inputs (same as concierge prompt assembly):**
- Soul file (Core Identity from settings)
- Tasks: overdue, due today, upcoming (next 3 days)
- Calendar: today's meetings, next 3 days
- Journal: today's entry (if exists), yesterday's entry summary
- Current time, day of week, date

**Heartbeat prompt structure:**
```
You are {user's concierge name}, acting as their proactive assistant.

Current context:
- Date: {today}
- Time: {current time}
- Overdue tasks: {list}
- Today's tasks: {list}
- Upcoming tasks (next 3 days): {list}
- Today's calendar: {meetings}
- Journal entry today: {summary or "Not started"}

Based on this context, identify:
1. Urgent items that need attention
2. Potential scheduling conflicts
3. Patterns or insights (e.g., "You've been journaling daily for 7 days")
4. Proactive suggestions (e.g., "Consider time-blocking for [task X]")

If nothing actionable, respond with "NO_ACTION".
If actionable, respond with a concise insight (max 2 sentences).
```

**Inference:**
- Use the user's configured default model (from AI settings)
- Max tokens: 150 (keep it concise)
- Temperature: 0.3 (deterministic, not creative)
- Store result in `heartbeat_insights` table (SQLite/Supabase)

**Insight types:**
- **Urgent:** "You have 3 overdue tasks"
- **Conflict:** "Your 2pm meeting overlaps with a blocked focus time"
- **Pattern:** "You've completed your morning routine 5 days in a row"
- **Suggestion:** "Consider scheduling [task X] — it's been in 'doing' for 3 days"

**Definition of Done:**
- [ ] Heartbeat event listener triggers AI inference
- [ ] Context assembly reuses `assembleConciergeContext()` pattern from `prompt-assembler.ts`
- [ ] Prompt is optimized for proactive insights (not conversation)
- [ ] Inference runs asynchronously (doesn't block UI)
- [ ] Result stored in `heartbeat_insights` table with timestamp
- [ ] "NO_ACTION" responses are logged but not shown to user
- [ ] Actionable insights trigger notification (P4)

---

#### P4: Notification When Heartbeat Finds Something Actionable
**Source:** Next-Sprint-Planning.md
**Status:** PENDING
**Agent:** Agent 2
**Depends on:** P3 (heartbeat generates insights)

When the heartbeat generates an actionable insight (not "NO_ACTION"), send a notification to the user.

**Desktop (Tauri):**
- Use Tauri's notification API
- System tray notification (macOS: top-right, Windows: bottom-right)
- Click notification → opens app and navigates to `/chat` with the insight pre-loaded

**Web:**
- Use browser Notification API (requires user permission)
- Fallback: in-app toast notification if permission denied
- Click notification → focuses tab and navigates to `/chat`

**Notification format:**
```
Title: "Proactive Insight"
Body: {insight text from P3}
Icon: App icon
```

**User preferences (settings):**
- Enable/disable notifications (separate from heartbeat enable/disable)
- Notification sound (on/off)

**Definition of Done:**
- [ ] Desktop: Tauri notification appears when insight is actionable
- [ ] Web: Browser notification appears (if permission granted) or toast fallback
- [ ] Click notification → opens `/chat` with insight context
- [ ] Settings include "Enable notifications" toggle
- [ ] Notification sound toggle (desktop only — browser auto-mutes)
- [ ] Notification permission requested on first heartbeat trigger (web)

---

## Quality Gates

```
[ ] npm run format
[ ] npm run lint (0 errors)
[ ] npm run typecheck (PASS)
[ ] npm run test (all pass)
[ ] npm run build (PASS)
[ ] PR opened to main, CI passes
[ ] E2E tests pass against deploy preview URL
[ ] Agent 7 code audit — no P0s
[ ] Agent 11 feature integrity check — PASS
[ ] 3-agent design review (if UI changes warrant)
[ ] Sandbox: verify heartbeat triggers, notification appears, insight quality
[ ] Merge PR to main
```

---

## Files to Modify/Create

**New files:**
- `src/lib/heartbeat/heartbeat-service.ts` — orchestrates heartbeat execution
- `src/lib/heartbeat/heartbeat-prompt.ts` — prompt template for proactive insights
- `src-tauri/src/heartbeat.rs` — Rust timer implementation (Tauri)
- Database migration: `heartbeat_insights` table

**Modified files:**
- `src/pages/Settings.tsx` — add Proactive Insights section
- `src/stores/settings.ts` — add `heartbeatEnabled`, `heartbeatInterval`, `heartbeatNotifications`
- `src/lib/ai/prompt-assembler.ts` — reuse context assembly for heartbeat
- `src-tauri/src/main.rs` — register heartbeat commands
- `src-tauri/Cargo.toml` — add dependencies (if needed)

---

## Deliberately Deferred

- Advanced scheduling logic (e.g., "only on weekdays", "quiet hours") → Phase B
- Heartbeat history UI (view past insights) → Phase B
- Heartbeat learns from user feedback ("don't notify for this type of insight") → Phase B
- Multi-agent heartbeat (different agents for different insight types) → Orchestrator phase
- Web Worker implementation (web currently uses main thread `setInterval`) → Phase B optimization

---

## Metrics

| Metric | Target | Actual |
|---|---|---|
| Parcels | 4 | — |
| Build passes | Yes | — |
| Lint clean | Yes | — |
| Typecheck clean | Yes | — |
| Tests pass | Yes | — |
| E2E pass | Yes | — |
| Heartbeat fires on schedule | Yes | — |
| Notification appears (desktop) | Yes | — |
| Insight quality (human eval) | Useful in 70%+ of triggers | — |

---

## Definition of Sprint Success

Sprint 37 succeeds when:
1. Users can configure heartbeat frequency (off, morning, evening, every N hours, custom)
2. Heartbeat timer runs in background (Tauri) at configured interval
3. On each heartbeat, AI reads user context and generates proactive insight
4. If insight is actionable, system sends notification
5. Click notification → opens chat with insight pre-loaded
6. Settings persist across app restarts
7. All quality gates pass (build, lint, typecheck, tests, Agent 7, Agent 11)
8. Sandbox validation: heartbeat triggers correctly, insights are relevant, notifications work

---

*Sprint 37 — Compiled March 11, 2026 by Dev Director*
