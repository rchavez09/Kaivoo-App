# Sprint 37 P6-P7 Implementation Plan — Full Scheduling Control

**Created:** March 11, 2026, 8:30 PM
**Status:** READY FOR IMPLEMENTATION
**Estimated Time:** 3-4 hours
**Next Session:** Continue from this plan

---

## Context

**User Feedback (Phase 5 Sandbox):**
> "I wish there was a way to set the time. Like, instead of Morning (8am) and Evening (set time), I wish you had more control. Like M-F at 6am - User chooses schedule. Or run every x amount of times per day, or on a specific interval."

**Decision:** Implement **Option B** - Multiple time pickers (up to 3 times per day) with full day-of-week control.

**Design Agent Reviews Completed:**
- ✅ UX Completeness: APPROVED (with corrections for full control, not just presets)
- ✅ Accessibility: APPROVED (ARIA implementation documented)
- ✅ Visual Design: APPROVED (spacing/typography guidance provided)

---

## What We're Building

### User Experience

**Simple Mode (Quick Presets):**
```
○ Off
○ Morning Focus (M-F at 8am)
○ Evening Focus (Daily at 6pm)
○ Work Hours (M-F at 8am, 12pm, 5pm)
○ Every N hours [▼ 4 hours]
● Custom schedule  ← User selects this for full control
```

**Advanced Mode (Custom Schedule - Expands when "Custom" selected):**
```
┌─────────────────────────────────────────────┐
│ Custom Schedule                              │
├─────────────────────────────────────────────┤
│ Run on:                                      │
│ [Weekdays] [Weekends] [Every day]           │ ← Quick presets
│                                              │
│ Su  Mo  Tu  We  Th  Fr  Sa                  │ ← Day toggles (Visual P1 fixes applied)
│ ○   ●   ●   ●   ●   ●   ○                  │
│                                              │
│ At these times:                              │
│ [🕐 6:00 AM] [×]                            │ ← Time picker 1
│ [🕐 12:00 PM] [×]                           │ ← Time picker 2
│ [🕐 8:24 PM] [×]                            │ ← Time picker 3
│ [+ Add time] (max 3)                         │
│                                              │
│ ⓘ Heartbeat will run on selected days at    │
│   the times above. Max 3 times per day.      │
├─────────────────────────────────────────────┤
│ [Cancel] [Save Schedule]                    │
└─────────────────────────────────────────────┘
```

**User can:**
- Select any combination of days (M-F, weekends, M/W/F, every day, etc.)
- Set 1-3 custom times per day (6:00 AM, 12:00 PM, 8:24 PM, etc.)
- Save → Heartbeat runs only on selected days at specified times

---

## Implementation Checklist

### Part 1: Day-of-Week Selector Component (P6)

**File:** `/Users/kaivoo/GitHub Library/Kaivoo-App/daily-flow/src/components/settings/DayOfWeekSelector.tsx`

**Implementation Notes:**
- Use code example from Accessibility Agent review (includes all ARIA attributes)
- Apply Visual Design P1 fixes:
  - ✅ `gap-3` (12px) between day buttons (not gap-2)
  - ✅ Two-letter abbreviations: Su Mo Tu We Th Fr Sa (not S M T W T F S)
  - ✅ `space-y-4` (16px) vertical gap between quick presets and day toggles
- ARIA requirements:
  - ✅ `aria-pressed` on each day button
  - ✅ `role="group"` + `aria-labelledby` on day container
  - ✅ Descriptive `aria-label` on quick preset buttons

**Code Template (from Accessibility Agent):**
```tsx
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface DayOfWeekSelectorProps {
  value: number[]; // [0-6] where 0=Sunday, 6=Saturday
  onChange: (days: number[]) => void;
}

const DAYS = [
  { index: 0, abbr: 'Su', name: 'Sunday' },
  { index: 1, abbr: 'Mo', name: 'Monday' },
  { index: 2, abbr: 'Tu', name: 'Tuesday' },
  { index: 3, abbr: 'We', name: 'Wednesday' },
  { index: 4, abbr: 'Th', name: 'Thursday' },
  { index: 5, abbr: 'Fr', name: 'Friday' },
  { index: 6, abbr: 'Sa', name: 'Saturday' },
];

export function DayOfWeekSelector({ value, onChange }: DayOfWeekSelectorProps) {
  const toggleDay = (dayIndex: number) => {
    if (value.includes(dayIndex)) {
      onChange(value.filter(d => d !== dayIndex));
    } else {
      onChange([...value, dayIndex].sort());
    }
  };

  const selectWeekdays = () => onChange([1, 2, 3, 4, 5]);
  const selectWeekends = () => onChange([0, 6]);
  const selectEveryDay = () => onChange([0, 1, 2, 3, 4, 5, 6]);

  return (
    <div className="space-y-4">  {/* Visual P1-3: space-y-4 (16px) */}
      {/* Quick Presets */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={selectWeekdays}
          aria-label="Select weekdays (Monday through Friday)"  {/* Accessibility P1 */}
        >
          Weekdays
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={selectWeekends}
          aria-label="Select weekends (Saturday and Sunday)"
        >
          Weekends
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={selectEveryDay}
          aria-label="Select every day (all 7 days)"
        >
          Every day
        </Button>
      </div>

      {/* Day Toggles */}
      <div role="group" aria-labelledby="day-selector-label">  {/* Accessibility P1 */}
        <span id="day-selector-label" className="sr-only">
          Days of week
        </span>
        <div className="flex gap-3">  {/* Visual P1-1: gap-3 (12px) */}
          {DAYS.map(({ index, abbr, name }) => {
            const isSelected = value.includes(index);
            return (
              <Button
                key={index}
                variant={isSelected ? 'default' : 'outline'}
                size="icon"
                aria-pressed={isSelected}  {/* Accessibility P1 */}
                aria-label={`${name}, ${isSelected ? 'selected' : 'not selected'}`}
                onClick={() => toggleDay(index)}
                className={cn(
                  'h-11 w-11', // 44x44px touch target (WCAG 2.5.8)
                  isSelected && 'font-semibold' // Visual reinforcement (not color-only)
                )}
              >
                {abbr}  {/* Visual P1-2: Two-letter (Su Mo Tu...) */}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Optional: Live region for screen reader summary */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {value.length === 0 && 'No days selected'}
        {value.length === 7 && 'All days selected'}
        {value.length > 0 && value.length < 7 &&
          `${value.length} day${value.length > 1 ? 's' : ''} selected`
        }
      </div>
    </div>
  );
}
```

**Testing Checklist:**
- [ ] Tab through all buttons (3 presets + 7 days)
- [ ] Space/Enter activates buttons
- [ ] Screen reader announces "Monday, selected" / "Sunday, not selected"
- [ ] Quick presets update all day toggles correctly
- [ ] Visual spacing looks balanced (gap-3 between days, space-y-4 vertical)

---

### Part 2: Time Picker Component (NEW)

**File:** `/Users/kaivoo/GitHub Library/Kaivoo-App/daily-flow/src/components/settings/TimePickerList.tsx`

**Component Spec:**
```tsx
interface TimePickerListProps {
  value: string[]; // ["06:00", "12:00", "20:24"]
  onChange: (times: string[]) => void;
  maxTimes?: number; // default 3
}
```

**UI Pattern:**
```tsx
export function TimePickerList({ value, onChange, maxTimes = 3 }: TimePickerListProps) {
  const addTime = () => {
    if (value.length < maxTimes) {
      onChange([...value, '08:00']); // Default to 8:00 AM
    }
  };

  const removeTime = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const updateTime = (index: number, newTime: string) => {
    const updated = [...value];
    updated[index] = newTime;
    onChange(updated);
  };

  return (
    <div className="space-y-3">
      <Label>At these times:</Label>

      {/* Time inputs */}
      {value.map((time, index) => (
        <div key={index} className="flex items-center gap-2">
          <Input
            type="time"
            value={time}
            onChange={(e) => updateTime(index, e.target.value)}
            className="w-32"
            aria-label={`Time ${index + 1}`}
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => removeTime(index)}
            aria-label={`Remove time ${time}`}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ))}

      {/* Add time button */}
      {value.length < maxTimes && (
        <Button
          variant="outline"
          size="sm"
          onClick={addTime}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add time (max {maxTimes})
        </Button>
      )}

      {/* Help text */}
      {value.length > 0 && (
        <p className="text-sm text-muted-foreground">
          Heartbeat will run {value.length} time{value.length > 1 ? 's' : ''} per day on selected days.
        </p>
      )}
    </div>
  );
}
```

**Key Implementation Details:**
- Use native `<input type="time">` for accessibility (native time picker on mobile)
- Allow removal of any time (except if only 1 time - require at least 1)
- Sort times chronologically when saving (6:00 AM, 12:00 PM, 8:24 PM)
- Validate no duplicate times (e.g., can't add 8:00 AM twice)

**Testing Checklist:**
- [ ] Native time picker opens on mobile
- [ ] Can add up to 3 times
- [ ] "Add time" button disabled when 3 times exist
- [ ] Can remove individual times
- [ ] Times are stored in 24-hour format ("20:24" not "8:24 PM")
- [ ] Help text updates count correctly

---

### Part 3: Settings Schema Update

**File:** `/Users/kaivoo/GitHub Library/Kaivoo-App/daily-flow/src/lib/ai/settings.ts`

**Current Schema:**
```typescript
export interface HeartbeatSettings {
  enabled: boolean;
  frequency: 'off' | 'morning' | 'evening' | 'hourly' | 'custom';
  intervalSeconds: number;
  customCron?: string;
  notificationsEnabled: boolean;
}
```

**New Schema (with full scheduling control):**
```typescript
export interface HeartbeatSettings {
  enabled: boolean;
  frequency: 'off' | 'morning' | 'evening' | 'hourly' | 'work-hours' | 'custom';

  // For 'hourly' mode:
  intervalSeconds: number; // 3600, 7200, 14400, 21600, 43200 (1h, 2h, 4h, 6h, 12h)

  // For 'custom' mode:
  customDays?: number[];        // [1,2,3,4,5] = Monday-Friday (0=Sunday, 6=Saturday)
  customTimes?: string[];       // ["06:00", "12:00", "20:24"] - 24-hour format, sorted

  // Deprecated (remove or mark optional for backward compatibility):
  customCron?: string;

  notificationsEnabled: boolean;
}
```

**Default Values:**
```typescript
export const getDefaultHeartbeatSettings = (): HeartbeatSettings => ({
  enabled: false,
  frequency: 'off',
  intervalSeconds: 14400, // 4 hours
  customDays: [1, 2, 3, 4, 5], // Weekdays default
  customTimes: ['08:00'], // 8:00 AM default
  notificationsEnabled: true,
});
```

**Migration Note:**
If existing users have `customCron` set, we need to either:
- Keep it for backward compatibility (ignore it, show "Custom" with default values)
- Or parse common cron patterns into customDays/customTimes (complex, defer to later)

**Recommendation:** For Sprint 37, ignore `customCron` if present. Show "Custom" mode with default values (M-F at 8:00 AM). User can reconfigure.

---

### Part 4: Heartbeat Settings UI Update (P7)

**File:** `/Users/kaivoo/GitHub Library/Kaivoo-App/daily-flow/src/components/settings/HeartbeatSettings.tsx`

**Current Implementation (P1-P4):**
- Radio group with 5 options (Off, Morning, Evening, Hourly, Custom)
- Custom shows cron input (not user-friendly)

**New Implementation (P5-P7):**
```tsx
import { DayOfWeekSelector } from './DayOfWeekSelector';
import { TimePickerList } from './TimePickerList';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';

export function HeartbeatSettings() {
  const settings = getHeartbeatSettings();
  const [frequency, setFrequency] = useState(settings.frequency);
  const [customDays, setCustomDays] = useState(settings.customDays || [1,2,3,4,5]);
  const [customTimes, setCustomTimes] = useState(settings.customTimes || ['08:00']);
  const [intervalSeconds, setIntervalSeconds] = useState(settings.intervalSeconds);

  const handleSave = async () => {
    await updateHeartbeatSettings({
      enabled: frequency !== 'off',
      frequency,
      intervalSeconds,
      customDays: frequency === 'custom' ? customDays : undefined,
      customTimes: frequency === 'custom' ? customTimes.sort() : undefined,
      notificationsEnabled: settings.notificationsEnabled,
    });

    // Restart heartbeat with new settings
    if (frequency !== 'off') {
      await restartHeartbeat();
    } else {
      await stopHeartbeat();
    }

    toast.success('Heartbeat schedule updated');
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Proactive Insights</h3>
        <p className="text-sm text-muted-foreground">
          AI checks your context and surfaces insights at scheduled times.
        </p>
      </div>

      <RadioGroup value={frequency} onValueChange={setFrequency}>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="off" id="off" />
          <Label htmlFor="off">Off</Label>
        </div>

        <div className="flex items-center space-x-2">
          <RadioGroupItem value="morning" id="morning" />
          <Label htmlFor="morning">Morning Focus (M-F at 8am)</Label>
        </div>

        <div className="flex items-center space-x-2">
          <RadioGroupItem value="evening" id="evening" />
          <Label htmlFor="evening">Evening Focus (Daily at 6pm)</Label>  {/* UX P1-1: 6pm not 8pm */}
        </div>

        <div className="flex items-center space-x-2">
          <RadioGroupItem value="work-hours" id="work-hours" />
          <Label htmlFor="work-hours">Work Hours (M-F at 8am, 12pm, 5pm)</Label>
        </div>

        <div className="flex items-center space-x-2">
          <RadioGroupItem value="hourly" id="hourly" />
          <Label htmlFor="hourly" className="flex items-center gap-2">
            Every
            <Select
              value={intervalSeconds.toString()}
              onValueChange={(val) => setIntervalSeconds(parseInt(val))}
              disabled={frequency !== 'hourly'}
            >
              <option value="3600">1 hour</option>
              <option value="7200">2 hours</option>
              <option value="14400">4 hours</option>
              <option value="21600">6 hours</option>
              <option value="43200">12 hours</option>
            </Select>
          </Label>
        </div>

        <div className="flex items-center space-x-2">
          <RadioGroupItem value="custom" id="custom" />
          <Label htmlFor="custom">Custom schedule</Label>
        </div>
      </RadioGroup>

      {/* Custom Schedule Detail Panel */}
      {frequency === 'custom' && (
        <div className="ml-7 mt-4 rounded-lg bg-muted/50 p-4 space-y-4">  {/* Visual P2-3: subtle background */}
          <DayOfWeekSelector value={customDays} onChange={setCustomDays} />
          <TimePickerList value={customTimes} onChange={setCustomTimes} maxTimes={3} />
        </div>
      )}

      <div className="flex gap-2">
        <Button onClick={handleSave}>Save Schedule</Button>
        <Button variant="outline" onClick={() => setFrequency(settings.frequency)}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
```

**Key Changes:**
1. Added "Work Hours" preset (M-F at 8am, 12pm, 5pm)
2. Changed "Evening" to 6pm (per UX P1-1)
3. Custom mode now shows:
   - DayOfWeekSelector (with all P1 fixes)
   - TimePickerList (new component, up to 3 times)
   - Subtle background (`bg-muted/50`) per Visual P2-3
4. Save button restarts heartbeat timer with new schedule

**Testing Checklist:**
- [ ] Selecting "Custom" expands detail panel
- [ ] Day selector and time picker work together
- [ ] Changing frequency to another option collapses custom panel
- [ ] Save button persists settings to database
- [ ] Cancel button reverts to saved settings
- [ ] Heartbeat timer restarts with new interval/schedule

---

### Part 5: Backend Logic Update (`shouldRunNow()`)

**File:** `/Users/kaivoo/GitHub Library/Kaivoo-App/daily-flow/src/lib/heartbeat/heartbeat-service.ts`

**Current `shouldRunNow()` (P1-P4):**
```typescript
function shouldRunNow(settings: HeartbeatSettings): boolean {
  if (!settings.enabled || settings.frequency === 'off') {
    return false;
  }

  const now = new Date();
  const hour = now.getHours();

  switch (settings.frequency) {
    case 'morning':
      return hour === 8; // Only at 8am
    case 'evening':
      return hour === 18; // Only at 6pm (was 20 for 8pm)
    case 'hourly':
      return true; // Always run (interval handled by timer)
    default:
      return false;
  }
}
```

**New `shouldRunNow()` (P5-P7):**
```typescript
function shouldRunNow(settings: HeartbeatSettings): boolean {
  if (!settings.enabled || settings.frequency === 'off') {
    return false;
  }

  const now = new Date();
  const currentDay = now.getDay(); // 0=Sunday, 6=Saturday
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentTime = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;

  switch (settings.frequency) {
    case 'morning':
      // M-F at 8am
      return [1, 2, 3, 4, 5].includes(currentDay) && currentTime === '08:00';

    case 'evening':
      // Daily at 6pm (UX P1-1: 6pm not 8pm)
      return currentTime === '18:00';

    case 'work-hours':
      // M-F at 8am, 12pm, 5pm
      const isWeekday = [1, 2, 3, 4, 5].includes(currentDay);
      const isWorkTime = ['08:00', '12:00', '17:00'].includes(currentTime);
      return isWeekday && isWorkTime;

    case 'hourly':
      // Always run (interval handled by timer)
      return true;

    case 'custom':
      // User-defined days and times
      if (!settings.customDays || !settings.customTimes) {
        return false; // Invalid custom config
      }

      // Check if today is selected
      if (!settings.customDays.includes(currentDay)) {
        return false;
      }

      // Check if current time matches any of the custom times
      return settings.customTimes.includes(currentTime);

    default:
      return false;
  }
}
```

**Key Implementation Details:**
1. **Time matching:** Use exact time string comparison ("08:00", "20:24") with 1-minute precision
2. **Weekday matching:** New presets (morning, work-hours) check day-of-week
3. **Custom mode:** Check both days AND times arrays
4. **Edge case:** If custom mode has empty days or times, return false (prevent errors)

**Testing Strategy:**
- Unit tests for each frequency mode
- Mock `Date()` to test specific days/times
- Edge cases:
  - Sunday at 8:00 AM with "Morning Focus" → should NOT run (weekday only)
  - Saturday at 6:00 PM with "Evening Focus" → SHOULD run (daily)
  - Custom mode with M/W/F at 8:24 PM on Tuesday → should NOT run (not selected day)

---

### Part 6: Tauri Timer Update (Optional)

**File:** `/Users/kaivoo/GitHub Library/Kaivoo-App/daily-flow/src-tauri/src/heartbeat.rs`

**Current:** Timer fires at fixed interval (e.g., every 4 hours)

**Question:** Do we need to change the timer logic for custom mode?

**Answer:** No changes needed! Here's why:

**Current flow:**
1. Rust timer emits event every N seconds (e.g., 3600s = 1 hour)
2. TypeScript `onHeartbeatTick()` receives event
3. `shouldRunNow()` checks if AI should actually run
4. If true → run inference, if false → skip

**For custom mode:**
- Set timer interval to 60 seconds (1 minute) for precise time matching
- `shouldRunNow()` will check every minute if current time matches custom times
- This works for all frequencies (morning, evening, work-hours, custom)

**Code change (minimal):**
```rust
// In start_heartbeat() Rust command
pub fn start_heartbeat(app: AppHandle, interval_seconds: u64) -> Result<String, String> {
    // For custom mode, force 60-second interval for time precision
    let effective_interval = if interval_seconds == 0 {
        60 // 1 minute for custom/preset modes
    } else {
        interval_seconds // Use specified interval for hourly mode
    };

    // ...rest of existing logic
}
```

**TypeScript side:**
```typescript
export async function restartHeartbeat(): Promise<void> {
  const settings = getHeartbeatSettings();

  let intervalSeconds: number;
  switch (settings.frequency) {
    case 'hourly':
      intervalSeconds = settings.intervalSeconds; // User's choice (1h, 2h, 4h, etc.)
      break;
    case 'custom':
    case 'morning':
    case 'evening':
    case 'work-hours':
      intervalSeconds = 60; // Check every 1 minute for precise time matching
      break;
    default:
      return; // Off mode
  }

  await invoke('start_heartbeat', { intervalSeconds });
}
```

**Trade-off:**
- ✅ **Pro:** Simple logic, works for all modes, precise time matching
- ⚠️ **Con:** Checking every minute uses slightly more CPU (minimal impact)
- Alternative: Use cron-style calculation to only wake at exact times (complex, defer to Phase B)

**Recommendation:** Use 60-second interval for Sprint 37 simplicity.

---

## Database Schema (No Changes Needed)

**File:** `/Users/kaivoo/GitHub Library/Kaivoo-App/daily-flow/supabase/migrations/20260311_heartbeat_insights.sql`

**Current schema already supports custom mode:**
```sql
CREATE TABLE heartbeat_insights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  insight TEXT NOT NULL,
  is_actionable BOOLEAN NOT NULL DEFAULT true,
  context_snapshot JSONB,
  frequency_setting TEXT,  -- Stores "custom", "morning", etc.
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

No migration needed. Settings are stored in `ai_settings` table (existing) or local storage (web).

---

## Quality Gates Checklist (After Implementation)

### Deterministic Checks
- [ ] `npm run format` (Prettier)
- [ ] `npm run lint` (0 errors)
- [ ] `npm run typecheck` (TypeScript passes)
- [ ] `npm run test` (all tests pass)
- [ ] `npm run build` (production build succeeds)
- [ ] `cd src-tauri && cargo check` (Rust compiles)
- [ ] `cd src-tauri && cargo clippy` (Rust linter)

### Agent Reviews
- [x] Agent 7 (Code Audit) - Already passed for P1-P4, re-run for P6-P7
- [x] Agent 11 (Feature Integrity) - Re-run to check no regressions
- [x] UX Completeness - APPROVED (with full control implementation)
- [x] Accessibility - APPROVED (ARIA requirements documented)
- [x] Visual Design - APPROVED (spacing/typography fixes documented)

### Testing
- [ ] E2E tests pass against deploy preview
- [ ] Sandbox Track A (web): Test custom schedule with multiple times
- [ ] Sandbox Track B (desktop): Test Rust timer with 60s interval

---

## Files to Create/Modify Summary

### New Files (2)
1. `daily-flow/src/components/settings/DayOfWeekSelector.tsx` (~120 lines)
2. `daily-flow/src/components/settings/TimePickerList.tsx` (~80 lines)

### Modified Files (4)
1. `daily-flow/src/components/settings/HeartbeatSettings.tsx` (expand from ~160 → ~220 lines)
2. `daily-flow/src/lib/ai/settings.ts` (update interface, add customDays/customTimes)
3. `daily-flow/src/lib/heartbeat/heartbeat-service.ts` (update shouldRunNow() logic)
4. `daily-flow/src-tauri/src/heartbeat.rs` (optional: add 60s interval logic)

### Total New Code
- ~400 lines (2 new components + logic updates)

---

## Estimated Time Breakdown

| Task | Time | Notes |
|------|------|-------|
| **P6: DayOfWeekSelector component** | 45 min | Use Accessibility Agent code example, apply P1 fixes |
| **P7: TimePickerList component** | 30 min | Simple CRUD for time array |
| **Settings UI integration** | 45 min | Update HeartbeatSettings.tsx with custom panel |
| **Settings schema update** | 15 min | Add customDays/customTimes to interface |
| **Backend shouldRunNow() logic** | 30 min | Update switch statement for all modes |
| **Rust timer interval update** | 15 min | Optional: add 60s mode logic |
| **Testing (manual)** | 30 min | Test all frequencies + custom mode |
| **Quality gates** | 30 min | Run format, lint, typecheck, test, build, cargo check |
| **Total** | **3h 40min** | |

---

## Session Continuation Checklist (Tomorrow)

**Start here when resuming:**

1. **Read this plan** (you're doing it now!)
2. **Create DayOfWeekSelector.tsx** using Accessibility Agent code example
3. **Create TimePickerList.tsx** using spec above
4. **Update HeartbeatSettings.tsx** to integrate both components
5. **Update settings.ts schema** (add customDays/customTimes)
6. **Update heartbeat-service.ts** (shouldRunNow() logic)
7. **Optional: Update heartbeat.rs** (60s interval mode)
8. **Run quality gates** (format, lint, typecheck, test, build, cargo check/clippy)
9. **Commit changes** to sprint branch
10. **Push to PR #24**
11. **Re-run E2E tests** against new deploy preview
12. **Sandbox test** custom mode with multiple times
13. **Get user approval** (Phase 5 round 2)
14. **Merge to main** ✅

---

## Design Agent P1 Fixes Reference

**Quick lookup for tomorrow:**

### UX P1-1
- Evening preset: **6pm** (not 8pm)

### Accessibility P1 (ARIA)
- Day buttons: `aria-pressed={isSelected}`
- Day container: `role="group" aria-labelledby="day-selector-label"`
- Preset buttons: `aria-label="Select weekdays (Monday through Friday)"`

### Visual P1
- Day button gap: `gap-3` (12px, not gap-2)
- Day abbreviations: **Su Mo Tu We Th Fr Sa** (not S M T W T F S)
- Vertical spacing: `space-y-4` between quick presets and day toggles

---

## Success Criteria

**Sprint 37 is complete when:**
- [x] P1-P4 original scope complete (background timer, presets, AI inference, notifications)
- [ ] P5 design agent reviews complete (UX, Accessibility, Visual Design) ← DONE
- [ ] P6 DayOfWeekSelector implemented with all P1 fixes
- [ ] P7 Custom scheduling with multiple time pickers (1-3 times/day)
- [ ] User can set heartbeat for M-F at 6:00 AM
- [ ] User can set heartbeat for M/W/F at 8:24 PM
- [ ] User can set heartbeat for M-F at 6:00 AM, 12:00 PM, 8:24 PM (3 times)
- [ ] Settings persist across app restarts
- [ ] Heartbeat only fires on selected days at specified times
- [ ] All quality gates pass (format, lint, typecheck, test, build, cargo check)
- [ ] Sandbox approval (Track A + optional Track B)
- [ ] PR merged to main
- [ ] Tag post-sprint-37
- [ ] Retrospective written

---

**End of Implementation Plan**

**Next Session:** Start with "Session Continuation Checklist" → Build DayOfWeekSelector.tsx

**Estimated Completion:** 3-4 hours of focused implementation + testing
