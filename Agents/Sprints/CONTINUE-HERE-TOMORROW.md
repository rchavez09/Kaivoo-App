# 🚀 START HERE TOMORROW — Sprint 37 Continuation

**Date Created:** March 11, 2026, 8:45 PM
**Status:** Ready for implementation
**Time Required:** 3-4 hours

---

## Quick Context

You're in **Dev Director mode** completing **Sprint 37: Configurable Heartbeat**.

**What happened today:**
1. ✅ Completed P1-P4 (background timer, settings UI, AI inference, notifications)
2. ✅ Phase 4 verification passed (CI, Agent 7, Agent 11, E2E tests)
3. ✅ Phase 5 sandbox testing revealed UX gap: No day-of-week + custom time control
4. ✅ Expanded scope: P5-P7 (design review + full scheduling control)
5. ✅ Design agent reviews complete (UX, Accessibility, Visual Design - all APPROVED)
6. ⏸️ **Stopped here:** Implementation plan created, ready to code tomorrow

**What's left:**
- P6: Build DayOfWeekSelector component (~45 min)
- P7: Build TimePickerList + integrate into settings (~75 min)
- Backend logic update (~30 min)
- Testing + quality gates (~60 min)
- **Total: ~3-4 hours**

---

## User Requirement (Key Quote)

> "If a user wants to set the heartbeat at 8:24 pm, he should be able to do so. That's why we did the research, that's why we're doing all of this. I want the user to have complete control of time, and frequency, vs us deciding for them."

**Translation:**
- ❌ NOT just renaming presets (Morning 8am → Morning Focus M-F 8am)
- ✅ BUILD full custom scheduler: User picks ANY days + ANY times (1-3 per day)
- ✅ Example: M-F at 6:00 AM, 12:00 PM, and 8:24 PM

---

## Step-by-Step: What to Do Tomorrow

### 1. Open the Implementation Plan
📄 **File:** `Agents/Sprints/Sprint-37-Implementation-Plan.md`

This has:
- Complete code examples (copy-paste ready)
- All design agent P1 fixes documented
- Testing checklists
- Quality gate requirements

### 2. Start Coding (Follow This Order)

**Step 1: Create DayOfWeekSelector.tsx** (~45 min)
- File: `daily-flow/src/components/settings/DayOfWeekSelector.tsx`
- Use Accessibility Agent code example (in implementation plan)
- Apply P1 fixes:
  - `gap-3` between day buttons
  - Two-letter abbreviations (Su Mo Tu We Th Fr Sa)
  - `space-y-4` vertical spacing
  - ARIA attributes (aria-pressed, role="group", etc.)

**Step 2: Create TimePickerList.tsx** (~30 min)
- File: `daily-flow/src/components/settings/TimePickerList.tsx`
- Code example in implementation plan
- Native `<input type="time">` for accessibility
- Allow 1-3 times, with add/remove buttons

**Step 3: Update HeartbeatSettings.tsx** (~45 min)
- File: `daily-flow/src/components/settings/HeartbeatSettings.tsx`
- Add "Work Hours" preset
- Change "Evening" to 6pm (per UX P1-1)
- Add custom schedule detail panel (shows DayOfWeekSelector + TimePickerList)

**Step 4: Update Settings Schema** (~15 min)
- File: `daily-flow/src/lib/ai/settings.ts`
- Add `customDays?: number[]`
- Add `customTimes?: string[]`

**Step 5: Update Backend Logic** (~30 min)
- File: `daily-flow/src/lib/heartbeat/heartbeat-service.ts`
- Update `shouldRunNow()` switch statement
- Add cases for: morning (M-F check), work-hours, custom (day + time arrays)

**Step 6: Optional - Rust Timer Update** (~15 min)
- File: `daily-flow/src-tauri/src/heartbeat.rs`
- Add 60-second interval mode for precise time matching
- Code example in implementation plan

### 3. Run Quality Gates (~30 min)

```bash
cd daily-flow
npm run format
npm run lint
npm run typecheck
npm run test
npm run build

cd src-tauri
cargo check
cargo clippy
```

### 4. Test Manually (~30 min)

**Test Cases:**
- Custom schedule: M-F at 6:00 AM → Should only run weekdays at 6am
- Custom schedule: M/W/F at 8:24 PM → Should only run Mon/Wed/Fri at 8:24pm
- Custom schedule: M-F at 6:00 AM, 12:00 PM, 8:24 PM → Should run 3x/day on weekdays
- Work Hours preset → Should run M-F at 8am, 12pm, 5pm
- Evening preset → Should run daily at 6pm (not 8pm)

### 5. Commit & Push

```bash
git add .
git commit -m "P6-P7: Full scheduling control (day-of-week + multiple times)

Components:
- DayOfWeekSelector: Su Mo Tu We Th Fr Sa toggles with quick presets
- TimePickerList: 1-3 custom times per day (native time picker)
- HeartbeatSettings: Custom schedule detail panel with both components

Backend:
- shouldRunNow() logic updated for all frequencies
- Custom mode: checks customDays + customTimes arrays
- Work Hours preset: M-F at 8am, 12pm, 5pm

Design P1 Fixes Applied:
- gap-3 spacing between day buttons
- Two-letter day abbreviations (Su Mo Tu We Th Fr Sa)
- space-y-4 vertical gap between presets and toggles
- ARIA: aria-pressed, role='group', descriptive labels
- Evening preset: 6pm (not 8pm)

User can now set ANY days + ANY times (e.g., M-F at 8:24 PM).

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"

git push origin sprint/37-configurable-heartbeat
```

### 6. Sandbox Test Round 2

Wait for Netlify deploy preview → Test custom scheduling:
- [ ] Day selector works (toggle days, quick presets)
- [ ] Time picker works (add/remove times, native picker on mobile)
- [ ] Settings persist across reload
- [ ] Heartbeat fires only on selected days at specified times

### 7. User Approval → Merge → Done!

Once approved:
```bash
gh pr merge 24 --squash
git tag post-sprint-37
git push origin post-sprint-37
```

Then write retrospective in `Sprint-37-Configurable-Heartbeat.md`.

---

## Files Reference

**Implementation Plan (main reference):**
- `Agents/Sprints/Sprint-37-Implementation-Plan.md`

**Sprint File (context):**
- `Agents/Sprints/Sprint-37-Configurable-Heartbeat.md`

**Design Agent Reviews (completed):**
- Inline in implementation plan (UX P1, Accessibility P1, Visual P1)

**PR to update:**
- PR #24: https://github.com/rchavez09/Kaivoo-App/pull/24

---

## Key Design Decisions (For Reference)

1. **Why 1-3 times max?** Research showed 4/day is fatigue threshold. 3/day is safe.
2. **Why 60-second timer interval?** Precise time matching for custom mode (check every minute).
3. **Why two-letter day abbreviations?** "S" ambiguous for Sat/Sun, "Su/Sa" is clear.
4. **Why gap-3 not gap-2?** 44px buttons need 12px breathing room (Visual Design principle).
5. **Why native time picker?** Accessibility (screen readers), mobile UX (native spinners).

---

## Troubleshooting

**If you get stuck:**
1. Check implementation plan for code examples
2. Reference Accessibility Agent review for ARIA requirements
3. Reference Visual Design Agent review for spacing/theming
4. Test with keyboard only (Tab, Space, Enter) to verify a11y
5. Test in both light and dark themes

**Common issues:**
- Time picker not working on mobile → Make sure it's `<input type="time">`, not custom
- Day toggles not announcing state → Check `aria-pressed` attribute
- Custom panel not showing → Verify `frequency === 'custom'` conditional render

---

## Success Criteria

**You're done when:**
- [ ] User can select M-F via day toggles
- [ ] User can add 1-3 custom times (e.g., 6:00 AM, 8:24 PM)
- [ ] Settings persist across app restart
- [ ] Heartbeat fires ONLY on selected days at specified times
- [ ] All quality gates pass (format, lint, typecheck, test, build, cargo check)
- [ ] Sandbox testing approved by user
- [ ] PR merged to main
- [ ] Tag `post-sprint-37` created
- [ ] Retrospective written

---

**Estimated Time: 3-4 hours** (if you follow the plan step-by-step)

**Good luck! 🚀**
