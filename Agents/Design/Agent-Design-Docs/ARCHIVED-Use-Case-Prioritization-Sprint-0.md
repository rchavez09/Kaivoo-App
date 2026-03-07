# Use Case Prioritization

*Extracted from Agent 6 spec — February 22, 2026*
*This is a sprint planning artifact, not a role definition.*

## Sprint 0 — Foundation

| Use Case | Priority | Effort | Rationale |
|----------|----------|--------|-----------|
| **UC2: Journal Time Travel** | P0 | Small | Sidebar entries already exist but buttons are dead. Load them into the editor. Highest ROI fix. |
| **UC4: Retroactive Routines** | P0 | Small | DayReview already shows routine chips. Make them tappable + add backdate logic. |
| Service layer abstraction | P0 | Medium | Not a use case, but foundational. Supabase -> Hub swap must be painless. |

## Sprint 1 — Core Experience

| Use Case | Priority | Effort | Rationale |
|----------|----------|--------|-----------|
| **UC1: Unified Day View** | P0 | Medium | Replaces read-only DayReview. Foundational for UC10 (Shutdown) and everything else. |
| **UC9: Mood Tracking** | P0 | Small | One-tap mood at journal save. Tiny effort, massive data value. Prerequisite for UC11 (Correlations). |
| **UC6: Date Chip Drilling** | P1 | Small | Reusable component. Quick win that connects the whole app. |
| **UC5: Insight Zoom — Monthly** | P1 | Medium | GitHub heatmap pattern. First useful zoom beyond weekly. |
| TipTap markdown round-trip audit | P1 | Small | Prevents data loss when migrating to file-based Hub. |

## Sprint 2 — Engagement & Ritual

| Use Case | Priority | Effort | Rationale |
|----------|----------|--------|-----------|
| **UC10: Daily Shutdown** | P1 | Medium | Sunsama's highest-engagement feature. Review today -> plan tomorrow -> rate mood -> close. |
| **UC5: Insight Zoom — Quarterly** | P1 | Medium | Trend sparklines across months. Natural extension of monthly view. |
| Task rollover (part of UC10) | P1 | Small | "-> Tomorrow" / "-> This Week" for unfinished tasks. |
| Auto-detected patterns in Insights | P2 | Small | "You're most productive on Tuesdays" — template-based for now. |

## Phase-Level (Architecture Migration)

| Use Case | Phase | Effort | Rationale |
|----------|-------|--------|-----------|
| **UC5: Insight Zoom — Yearly** | Phase 3 | Medium | Full GitHub-style 365-cell contribution graph. Needs more data history. |
| **UC3: Calendar Aggregation** | Phase 3 | Large | Requires OAuth flows, API integration, sync logic. Google first, Outlook second. |
| **UC11: Correlation Discovery** | Phase 3-6 | Medium | Data normalization in Phase 3, correlation engine + natural language in Phase 6. |
| **UC7: Drop File -> Insights** | Phase 4-6 | Large | Requires Concierge, RAG pipeline, vector DB, transcription. |
| **UC8: Connected Context** | Phase 4+ | Medium | Concierge-powered. Implicit connections via day proximity + AI. |

## Priority Legend

```
Sprint 0 = Fix what's broken (dead buttons, read-only past days)
Sprint 1 = Build the core differentiator (Unified Day View + mood data)
Sprint 2 = Build the engagement loop (Daily Shutdown drives daily return)
Phase 3+ = Scale with architecture (calendar sync, correlations, RAG)
```
