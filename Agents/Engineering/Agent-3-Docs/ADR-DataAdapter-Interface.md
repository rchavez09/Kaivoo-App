# ADR: DataAdapter Interface Design

**Status:** Accepted
**Date:** March 2, 2026
**Sprint:** 20 — Local-First Foundation (P4)
**Authors:** Agent 3 (Architect) + Agent 2 (Software Engineer)

---

## Context

Kaivoo's service layer currently makes 18+ direct Supabase calls across 10 service files. To support both web (Supabase) and desktop (local SQLite via Tauri) backends, we need an abstraction layer that decouples data operations from the storage implementation.

## Decision

Introduce a **four-adapter architecture** with entity-specific sub-adapters:

```
AdapterProvider
├── DataAdapter        → 15 entity sub-adapters (TaskAdapter, etc.)
├── AuthAdapter        → signIn, signUp, signOut, onAuthStateChange
├── SearchAdapter      → fullTextSearch across all entities
└── FileAdapter        → readFile, writeFile, listDir, watchDir
```

### Key Design Choices

**1. Entity sub-adapters, not generic CRUD**

Each entity type gets its own typed adapter interface (`TaskAdapter`, `HabitAdapter`, etc.) rather than a single `query<T>(table, filter)` method. This preserves full type safety and allows entity-specific operations (e.g., `HabitAdapter.archive()`, `RoutineCompletionAdapter.toggle()`).

**2. userId injected at construction, not per-call**

The current service layer passes `userId` to every function. The adapter receives `userId` once during construction. This simplifies the API and naturally maps to local-first (desktop has no userId concept).

**3. Converters live inside adapters**

The `dbToTask()`, `dbToCapture()`, etc. converter functions move from standalone service utilities into their respective adapter implementations. Components only see app-level types (`Task`, not `Tables<'tasks'>`).

**4. Input types separate from domain types**

`CreateTaskInput` and `UpdateTaskInput` are distinct from `Task`. Create inputs omit `id` and `createdAt`. Update inputs make all fields optional and allow `null` for clearable fields.

**5. AdapterProvider injected via React context**

A single `AdapterProvider` object holds all four adapters. Created once at app startup based on runtime detection (`isTauri()` → local adapters, otherwise → Supabase adapters). Injected via React context, consumed by hooks.

## Adapter Coverage

| Entity | Sub-Adapter | Operations |
|--------|-------------|------------|
| tasks | `TaskAdapter` | fetchAll, create, update, delete |
| subtasks | `SubtaskAdapter` | fetchAll, create, update, delete |
| journal_entries | `JournalAdapter` | fetchAll, create, update, delete |
| captures | `CaptureAdapter` | fetchAll, create, update, delete |
| topics | `TopicAdapter` | fetchAll, create, update, delete |
| topic_pages | `TopicPageAdapter` | fetchAll, create, update, delete |
| tags | `TagAdapter` | fetchAll, create |
| routines | `RoutineAdapter` | fetchAll, create, update, delete |
| routine_groups | `RoutineGroupAdapter` | fetchAll, create, update, delete |
| routine_completions | `RoutineCompletionAdapter` | fetchAll, toggle |
| habits (routines) | `HabitAdapter` | fetchAll, create, update, delete, archive, updateStrengthAndStreak |
| habit_completions | `HabitCompletionAdapter` | fetchAll, toggle, incrementCount |
| meetings | `MeetingAdapter` | fetchAll, create, update, delete |
| projects | `ProjectAdapter` | fetchAll, create, update, delete |
| project_notes | `ProjectNoteAdapter` | fetchAll, create, update, delete |

## Implementation Plan

| Parcel | Task | Adapter |
|--------|------|---------|
| P4 (this) | Define TypeScript interfaces | `src/lib/adapters/types.ts` |
| P5 | Wrap existing services | `src/lib/adapters/supabase.ts` |
| P6 | Refactor hooks to use adapters | `useDatabase.ts`, `useKaivooActions.ts` |
| P7 | Stub local SQLite adapter | `src/lib/adapters/local.ts` |
| P8 | Runtime switching mechanism | `src/lib/adapters/provider.tsx` |

## File Locations

```
src/lib/adapters/
├── types.ts           ← Interface definitions (P4 — done)
├── index.ts           ← Re-exports (P4 — done)
├── supabase.ts        ← SupabaseAdapter (P5)
├── local.ts           ← LocalAdapter stub (P7)
└── provider.tsx       ← React context + runtime switching (P8)
```

## Consequences

**Positive:**
- Service layer fully decoupled from Supabase
- Desktop app can use SQLite without changing any component code
- Type-safe throughout — no `any` or runtime casts needed
- Testable — adapters can be mocked independently

**Negative:**
- Additional abstraction layer adds ~200 lines of type definitions
- SupabaseAdapter (P5) will initially be a thin wrapper around existing services
- Two implementations to maintain long-term (Supabase + Local)

---

*Architecture Decision Record — Sprint 20 P4 — March 2, 2026*
