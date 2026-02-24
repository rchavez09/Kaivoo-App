# Anti-Patterns to Avoid

**Source:** Extracted from Agent 6 (Usability Architect) during Design Agent merge — Section 16 (9 anti-patterns with corrections)
**Parent:** [Agent-Design.md](../Agent-Design.md)

---

## The 9 Anti-Patterns

```
1. DON'T: Force users to "go to the right page" to do something
   DO: Let them act on data wherever they see it

2. DON'T: Make past data read-only with no escape hatch
   DO: Allow retroactive edits with appropriate guardrails

3. DON'T: Show data without context (e.g., a task with no date context)
   DO: Always show when something happened or is due

4. DON'T: Build complex explicit linking systems ("link this meeting to this task")
   DO: Use date proximity and AI to infer connections

5. DON'T: Overwhelm with all data at once
   DO: Progressive disclosure — summary → detail on demand

6. DON'T: Make "insights" just be "statistics"
   DO: Insights should tell stories: "You're building momentum" or
       "Tuesday is consistently your most productive day"

7. DON'T: Require the user to configure which calendars to see
   DO: Auto-discover calendars after OAuth, let user toggle visibility

8. DON'T: Treat self-hosted as a limitation
   DO: Frame data ownership as a superpower — "Your data never leaves this machine"

9. DON'T: Build features that only work with an internet connection
   DO: Core features work offline. AI features degrade gracefully to local LLM.
```

---

## How to Use This List

During Design Review (Step 5 of the Design Review Methodology), cross-reference every UI change against these 9 anti-patterns. The most commonly violated are:

- **Anti-pattern 1** (forcing navigation) — watch for any UI that requires users to leave their current view to act on visible data
- **Anti-pattern 3** (missing date context) — every task, entry, and meeting should display its date
- **Anti-pattern 5** (data overwhelm) — check that progressive disclosure is applied: glanceable summary first, detail on tap/click
