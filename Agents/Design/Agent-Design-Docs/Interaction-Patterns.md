# Interaction Patterns Library

**Source:** Extracted from Agent 6 (Usability Architect) Section 14 (6 patterns) + Agent 1 (Senior UI Designer) Sections 2.3-2.4 (gestures, context menus) during Design Agent merge
**Parent:** [Agent-Design.md](../Agent-Design.md)

---

# Reusable Interaction Patterns

## Pattern 1: The Inline Toggle

Used for: Routine completion, task check-off
Pattern: Tap → Confirmation (if backdated) → Instant visual update → Background save

```
Before: ○ Morning Meditation    (gray, unchecked)
After:  ✅ Morning Meditation   (primary color, checked, micro-animation)
```

## Pattern 2: The Expandable Card

Used for: Journal entries in Day View, meeting details, capture previews
Pattern: Show 2-line preview → Tap to expand full content → Tap again to collapse

## Pattern 3: The Date Chip

Used for: Every date reference in the app
Pattern: Subtle, tappable date badge → Navigates to Day View for that date

## Pattern 4: The Drill-Down Zoom

Used for: Insights page
Pattern: Year → Quarter → Month → Week → Day. Each level clickable to go deeper. Back button or zoom-level tabs to go wider.

## Pattern 5: The Source Indicator

Used for: Calendar events from external sources
Pattern: Small colored dot + source name. External = read-only. Kaivoo = editable.

## Pattern 6: The Inline Editor

Used for: Journal entries viewed in Day View
Pattern: Preview mode (read-only card) → Click "Edit" → Inline TipTap editor → Save → Return to preview

---

# Gesture Definitions (from Agent 1)

```
Swipe Right (on list items):     Mark task complete / Archive capture
Swipe Left (on list items):      Delete (with destructive confirmation)
Pull-to-Refresh (mobile):        Reload data from Supabase
Long-Press (on task/capture):    Open context menu (Edit, Delete, Move to Topic)
Pinch (on calendar):             Zoom day/week/month views (future)
```

---

# Context Menus (from Agent 1)

## Task Context Menu
```
  ● Edit task
  ● Change status → [Backlog, Todo, Doing, Blocked, Done]
  ● Change priority → [Low, Medium, High]
  ● Assign to topic
  ● Delete task (destructive)
```

## Journal Entry Context Menu
```
  ● Edit entry
  ● Add tags
  ● Link to topic
  ● Delete entry (destructive)
```

## Capture Context Menu
```
  ● Edit capture
  ● Convert to task
  ● Link to topic
  ● Delete capture (destructive)
```
