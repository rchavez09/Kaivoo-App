# Sprint 37 — Configurable Heartbeat

**Theme:** Proactive AI — the concierge acts without being asked.
**Branch:** `sprint/37-configurable-heartbeat`
**Status:** IN PROGRESS (Phase 5 scope expansion)
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
**Status:** DONE
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
**Status:** DONE
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
**Status:** DONE
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
**Status:** DONE
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

### Track 3 — Scheduling Flexibility (Phase 5 Expansion) (Agent 2, Design Agents)

**Context:** During Phase 5 sandbox testing, user feedback identified a critical UX gap: no day-of-week selection (M-F scheduling) and limited time control. Research shows this aligns with industry best practices (Headspace, Todoist, Google Calendar all support weekday-specific scheduling).

**Decision:** Expand Sprint 37 scope to include scheduling flexibility BEFORE merge. This prevents shipping incomplete UX and ensures design agent review happens before users see the feature.

---

#### P5: Design Agent Review for Scheduling UX
**Source:** Phase 5 sandbox feedback
**Status:** TODO
**Agent:** UX Completeness Agent, Accessibility & Theming Agent
**Depends on:** Research completed (done)

Before implementing new scheduling UI, get design agent approval on:
- Day-of-week selector pattern (toggle buttons vs checkboxes)
- Time picker interface (native vs custom)
- Simple vs Advanced mode toggle approach
- New preset naming ("Morning Focus M-F" vs "Weekday Morning")

**Definition of Done:**
- [ ] UX Completeness Agent reviews research findings
- [ ] Accessibility Agent validates day-of-week selector is keyboard navigable + screen reader friendly
- [ ] Visual Design Agent approves component mockups
- [ ] All design agents approve with 0 P0 issues

---

#### P6: Day-of-Week Selector Component
**Source:** Phase 5 sandbox feedback + research
**Status:** TODO
**Agent:** Agent 2
**Depends on:** P5 (design approval)

Build reusable `<DayOfWeekSelector>` component that allows users to choose which days heartbeat runs.

**Component spec:**
```tsx
<DayOfWeekSelector
  value={[1,2,3,4,5]}  // Monday-Friday
  onChange={(days) => updateSettings({ daysOfWeek: days })}
/>
```

**UI pattern:**
- 7 toggle buttons in a row: S M T W T F S
- Quick presets above: [Weekdays] [Weekends] [Every day]
- Filled = selected, outline = unselected
- Keyboard navigable (Tab + Space/Enter)
- Screen reader announces: "Monday, selected" / "Sunday, not selected"

**Definition of Done:**
- [ ] Component renders 7 day toggles + 3 quick presets
- [ ] Clicking a day toggles selection
- [ ] Quick presets update all 7 toggles
- [ ] Value persists to settings store
- [ ] Accessibility: keyboard navigation works, ARIA labels present
- [ ] Visual design matches app theme (uses shadcn/ui Button variants)

---

#### P7: New Scheduling Presets (Morning Focus M-F, Work Hours M-F)
**Source:** Phase 5 sandbox feedback + research
**Status:** TODO
**Agent:** Agent 2
**Depends on:** P6 (day selector component exists)

Update HeartbeatSettings UI with new presets that address user feedback:

**New presets:**
1. **Morning Focus** (M-F at 8am) — runs only on weekdays
2. **Work Hours** (M-F at 8am, 12pm, 5pm) — 3x/day on weekdays
3. **Custom schedule** (link/button) → shows day-of-week selector + time picker

**Settings schema update:**
```typescript
interface HeartbeatSettings {
  enabled: boolean;
  frequency: 'off' | 'morning' | 'evening' | 'hourly' | 'morning-focus' | 'work-hours' | 'custom';
  intervalSeconds: number; // for 'hourly' mode
  daysOfWeek?: number[]; // [0-6] Sunday=0, Saturday=6
  specificTimes?: string[]; // ["08:00", "12:00", "17:00"] for 'work-hours'
  notificationsEnabled: boolean;
}
```

**Backend changes:**
- Update `shouldRunNow()` to check day-of-week match
- Update `getIntervalSeconds()` to handle preset schedules
- Store settings in Supabase (web) + SQLite (desktop)

**Definition of Done:**
- [ ] "Morning Focus (M-F at 8am)" preset works correctly
- [ ] "Work Hours (M-F 8am/12pm/5pm)" preset works correctly
- [ ] "Custom schedule" shows day-of-week selector
- [ ] `shouldRunNow()` respects day-of-week settings
- [ ] Settings persist across app restarts
- [ ] Heartbeat only fires on selected days

---

## Quality Gates

```
[x] npm run format
[x] npm run lint (0 errors, 895 warnings — accepted as-is)
[x] npm run typecheck (PASS)
[x] npm run test (265/265 pass)
[ ] npm run build (PASS)
[ ] PR opened to main, CI passes
[ ] E2E tests pass against deploy preview URL
[ ] Agent 7 code audit — no P0s
[ ] Agent 11 feature integrity check — PASS
[ ] 3-agent design review (skipped — minimal UI changes, settings-only)
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

- ~~Advanced scheduling logic (e.g., "only on weekdays", "quiet hours")~~ → **MOVED TO SPRINT 37 P5-P7** (Phase 5 expansion)
- Quiet hours / Do Not Disturb mode → Sprint 38
- Multiple time pickers (up to 3 custom times/day) → Sprint 38
- Heartbeat history UI (view past insights) → Sprint 38
- Notification batching (daily digest mode) → Sprint 39
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

## Sprint Retrospective

**Completed:** March 14, 2026
**Duration:** 3 days (planning + implementation + quality gates)
**Status:** ✅ **SUCCESS** — All acceptance criteria met, sandbox approved, merged to main

### What We Built

Sprint 37 delivered a complete proactive AI heartbeat system with full user control over scheduling:

**Core Features Delivered:**
- ✅ Background heartbeat timer (Rust + TypeScript)
- ✅ Configurable scheduling (Off, Hourly, Custom)
- ✅ Custom schedule UI with day-of-week selector + multiple time pickers
- ✅ Auto-save settings (persists to localStorage)
- ✅ AI inference integration (reads context, generates insights)
- ✅ Desktop + web notifications
- ✅ Settings persistence across app restarts

**User Capability:**
Users can now set heartbeat to run at ANY days + ANY times:
- Example: M-F at 8:24 PM
- Example: M-F at 6:00 AM, 12:00 PM, 8:24 PM (3x per day)
- Example: Every 4 hours (interval-based)

### Scope Evolution

**Original Scope (P1-P4):**
- Simple presets (Morning, Evening, Hourly)
- Basic cron input for custom schedules

**Phase 5 Expansion (P5-P7):**
- User feedback: "I wish there was a way to set the time"
- Design agent reviews revealed UX gaps
- Scope expanded to include full day/time control
- Built DayOfWeekSelector + TimePickerList components
- Applied all design agent P1 fixes (accessibility, spacing, theming)

**Final Simplification:**
- Removed redundant presets (Morning, Evening, Work Hours)
- Simplified to 3 modes: Off, Hourly, Custom
- Custom mode can recreate all old presets with more flexibility

### Technical Challenges & Solutions

**Challenge 1: Rust Deadlock**
- **Issue:** Nested `Arc<Mutex>` caused double-lock when stopping heartbeat
- **Impact:** Desktop app froze when toggling heartbeat off
- **Solution:** Simplified to `Mutex<Option<Arc<Mutex<bool>>>>`, removed nested lock
- **Result:** Clean thread shutdown with no blocking

**Challenge 2: Long Stop Delay**
- **Issue:** Thread slept for full interval (60s) before checking stop flag
- **Impact:** 60-second freeze when turning off heartbeat
- **Solution:** Interruptible sleep (checks stop flag every 1 second)
- **Result:** <1s response time for stop operations

**Challenge 3: Missing npm Package**
- **Issue:** `@tauri-apps/plugin-notification` not installed
- **Impact:** Blank screen on desktop launch (import failure)
- **Solution:** Added package to dependencies
- **Result:** Desktop app launches cleanly

### Quality Gates Performance

**Phase 4 (Deterministic Checks):**
- ✅ Format (Prettier)
- ✅ Lint (0 errors, 896 pre-existing warnings)
- ✅ Typecheck (TypeScript clean)
- ✅ Tests (265 passed)
- ✅ Build (production successful)
- ✅ Cargo check (Rust clean)
- ✅ Cargo clippy (1 minor warning - unused mut)

**Phase 4 (Agent Reviews):**
- ✅ Agent 7 (Code Audit) - PASS with 3 P1 fixes applied
- ✅ Agent 11 (Feature Integrity) - PASS (no regressions)
- ✅ Design agents (UX, Accessibility, Visual) - PASS with P1 fixes applied

**Phase 5 (Sandbox Testing):**
- ✅ Track A (Web) - Approved (tested on deploy preview)
- ✅ Track B (Desktop) - Approved (tested with tauri dev)

### Metrics

| Metric | Target | Actual |
|---|---|---|
| **Code Added** | ~400 lines | ~600 lines (expanded scope) |
| **Files Created** | 5 | 7 (2 components + 5 backend files) |
| **Files Modified** | 4 | 6 (settings, integrations) |
| **Quality Gates** | 100% pass | 100% pass |
| **Agent Reviews** | 3 (Agent 7, 11, Design) | 6 (Agent 7, 11, UX, A11y, Visual, Implementation Plan) |
| **Bugs Fixed** | 0 (greenfield) | 3 (Rust deadlock, stop delay, missing package) |
| **User Approval** | Required | ✅ Granted (sandbox approved) |

### What Went Well

1. **Agile Scope Adjustment**
   - User feedback in Phase 5 led to better UX
   - Scope expansion was well-managed (P5-P7 added smoothly)
   - Final simplification reduced complexity

2. **Design Agent Integration**
   - 3-agent design review caught UX gaps before sandbox
   - P1 fixes applied systematically (accessibility, spacing)
   - Visual polish applied from the start

3. **Rust Bug Fixes**
   - Deadlock identified and fixed quickly
   - Interruptible sleep pattern improved responsiveness
   - Desktop experience is now smooth and reliable

4. **Auto-Save UX**
   - Removing manual "Save" button improved flow
   - Settings save instantly on change
   - Simpler mental model for users

### What Could Improve

1. **Earlier Desktop Testing**
   - Rust bugs only discovered during sandbox testing
   - Could have caught deadlock earlier with unit tests
   - **Action:** Add Rust unit tests for heartbeat module in future sprints

2. **Dependency Management**
   - Missing npm package caused initial blank screen
   - Should verify all imports before desktop build
   - **Action:** Add pre-build dependency check script

3. **Scope Creep Risk**
   - P5-P7 expansion added 2 days to sprint
   - Original estimate was 1 day (P1-P4 only)
   - **Lesson:** Phase 5 feedback can trigger scope expansion - budget time accordingly

### Key Learnings

1. **User Feedback is Gold**
   - "I wish there was a way to set the time" drove P5-P7 expansion
   - Listening to user needs led to better product
   - Sandbox testing is critical for UX validation

2. **Simplification > Feature Bloat**
   - Removing presets made UI cleaner
   - Custom mode is more powerful and flexible
   - Fewer options = better UX

3. **Rust Concurrency is Tricky**
   - Nested locks are dangerous (deadlock risk)
   - Interruptible sleep is better than long blocking sleep
   - Testing desktop features early saves time

### Next Steps

**Immediate:**
- ✅ Merged to main (PR #24)
- ✅ Tagged post-sprint-37
- ✅ Netlify auto-deployed to production
- ✅ Desktop builds available via tauri dev (unsigned for now)

**Future Enhancements (Not in Scope):**
- Desktop auto-updater (signed builds)
- Insight history view (Settings → Proactive Insights → History)
- Snooze notification feature
- Smart scheduling (ML-based optimal times)

### Vision Impact

Sprint 37 completes **Vision Phase 1 (Core Intelligence)** by adding proactive AI capabilities. Users no longer need to manually check in - Flow now reaches out proactively when it finds actionable insights.

**Vision Progress:**
- Phase 1 (Core Intelligence) → **100% Complete** ✅
- Phase 2 (Context Mastery) → Next focus area

---

*Sprint 37 — Compiled March 11, 2026 by Dev Director*
*Retrospective Written March 14, 2026 — Post-Merge to Main*
