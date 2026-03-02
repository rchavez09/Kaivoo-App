# Sprint 14: Connect — Project Notes

**Status:** COMPLETE
**Merged:** February 25, 2026
**Created:** February 25, 2026
**Branch:** `sprint/14-connect`
**Theme:** Connect — Add a Project Notes system so users can capture thoughts for a project mid-flow and manage them from within the project.

---

## Goal

Allow users to create, view, and edit notes within projects. Notes can be created from anywhere in the app ("mid-flow") and are visible/editable on the project detail page.

---

## Vision Alignment

- **Phase:** 1 — Cloud Command Center (~97% complete)
- **Milestone:** Core feature enhancement (journal, topics, notes, captures)
- **Impact:** Extends the Projects system with a dedicated notes layer. Sets groundwork for Phase 4 AI Orchestrator (project notes = context for AI project work).

---

## Parcels

### Track 1: Foundation

#### P1 — Data Model & Migration
**Agent:** Agent 12 (Data Engineer)
**Status:** Pending

**Scope:**
- Create `project_notes` table in Supabase:
  ```
  project_notes
  ├── id          UUID (PK, gen_random_uuid())
  ├── user_id     UUID (FK → auth.users, NOT NULL)
  ├── project_id  UUID (FK → projects.id, NOT NULL)
  ├── content     TEXT (NOT NULL, default '')
  ├── created_at  TIMESTAMPTZ (default now())
  └── updated_at  TIMESTAMPTZ (default now())
  ```
- RLS policies: user can only CRUD their own notes (use `(select auth.uid())` subquery form)
- Indexes: `project_notes_user_id_idx`, `project_notes_project_id_idx`
- ON DELETE CASCADE from `projects.id` (when a project is deleted, its notes are deleted)
- `updated_at` auto-update trigger

**Definition of Done:**
- [ ] Migration applied successfully
- [ ] RLS policies verified with test queries
- [ ] Security advisor check passes

---

#### P2 — Types, Service Layer, Store
**Agent:** Agent 2 (Software Engineer)
**Depends on:** P1
**Status:** Pending

**Scope:**
- Add `ProjectNote` interface to `src/types/index.ts`
- Create `src/services/project-notes.service.ts` (fetchByProject, create, update, delete)
- Add project notes slice to Zustand store (array in store, CRUD actions)
- Add project notes actions to `useKaivooActions.ts` (Supabase sync + optimistic updates + rollback)
- Load project notes in `useDatabase.ts` initial fetch

**Definition of Done:**
- [ ] Types exported and used
- [ ] Service layer follows Agent 7 query standards (specific columns, user_id filter, order, limit)
- [ ] Optimistic updates with rollback on failure
- [ ] Project notes load on app init and are available in store

---

### Track 2: UI

#### P3 — Design Gate 1: Pre-Implementation Specs
**Agents:** Visual Design + Accessibility & Theming + UX Completeness
**Status:** Pending

**Scope:**
Three design specs required before coding begins:

**A) Project Notes section on ProjectDetail page:**
- Where does it sit relative to existing sections (description, stats, tasks, settings)?
- Note list layout (card list? inline list? timeline?)
- Empty state, loading state, error state
- Note card: content preview, timestamp, edit/delete actions
- Inline editing vs. modal editing

**B) Quick-add-to-project interaction:**
- Where does the "add note to project" trigger live?
- Project picker UX (dropdown? search? recent projects?)
- Minimal friction — must be achievable in 2-3 clicks max

**C) Note editing within project:**
- Inline edit (click to edit content in place)?
- Expandable card?
- Full-page editor for longer notes?

**Definition of Done:**
- [ ] Visual Design: component spec (layout, typography, spacing, colors)
- [ ] Accessibility & Theming: ARIA plan, focus order, dark mode token choices, keyboard nav
- [ ] UX Completeness: state inventory, navigation flows, input patterns, edit-where-you-see-it compliance

---

#### P4 — ProjectDetail Notes Section
**Agent:** Agent 2 (Software Engineer)
**Depends on:** P2, P3
**Status:** Pending

**Scope:**
- New `ProjectNotesList` component (extracted, like `ProjectTaskList` and `ProjectSettings`)
- Render all notes for the current project
- Inline "Add note" input at the top
- Edit note content in place (click to edit, blur/Enter to save)
- Delete note with confirmation
- Empty state: encouraging message to add first note
- Loading skeleton while fetching
- Sort: newest first (by `created_at`)
- Follow design spec from P3

**Definition of Done:**
- [ ] Notes display correctly on project detail page
- [ ] CRUD operations work with optimistic updates
- [ ] All states handled (empty, loading, error)
- [ ] Keyboard accessible, ARIA attributes per design spec
- [ ] Dark mode verified

---

#### P5 — Quick-Add Note to Project
**Agent:** Agent 2 (Software Engineer)
**Depends on:** P2, P3
**Status:** Pending

**Scope:**
- Implement the "add note to project from anywhere" interaction per design spec
- Project picker: searchable dropdown of user's active projects
- Text input for note content
- Submit creates the note and shows confirmation
- Accessible from any page in the app
- Must be achievable in 2-3 interactions (open → pick project → type → submit)

**Definition of Done:**
- [ ] Can create a project note from any page
- [ ] Project picker shows active projects (not archived)
- [ ] Note appears immediately in the target project's notes list
- [ ] Low friction — feels fast and natural mid-flow
- [ ] Keyboard accessible

---

#### P6 — Export/Import Support
**Agent:** Agent 2 (Software Engineer)
**Depends on:** P2
**Status:** Pending

**Scope:**
- Add `projectNotes` to the DataSettings export schema
- Include project notes in full data export
- Import restores project notes (matched by project name/id)
- Follows patterns established in Sprint 13 (P12)

**Definition of Done:**
- [ ] Export includes project notes
- [ ] Import restores project notes correctly
- [ ] Existing export/import functionality unaffected

---

### Track 3: Quality

#### P7 — Feature Bible Update
**Agent:** Agent 11 (Feature Integrity Guardian)
**Depends on:** P4, P5, P6
**Status:** Pending

**Scope:**
- Update `Feature-Bible-Projects-Page.md` with Project Notes section
- Add must-never-lose items for notes CRUD
- Regression checklist for existing Projects functionality

**Definition of Done:**
- [ ] Feature Bible updated with notes section
- [ ] Must-never-lose items documented
- [ ] Regression checklist verified

---

#### P8 — Quality Gates
**Agents:** Agent 7 + Agent 11 + 3 Design Agents
**Depends on:** P4, P5, P6, P7
**Status:** Pending

**Scope:**
- Deterministic checks: `npm run lint && npm run typecheck && npm run test && npm run build`
- Agent 7 code audit (database patterns, component quality, accessibility, performance)
- Agent 11 feature integrity check (no regressions to existing Projects functionality)
- 3-agent design review (visual, accessibility, UX completeness)
- Sandbox review: user reviews running app on sprint branch

**Definition of Done:**
- [ ] All deterministic checks pass
- [ ] Agent 7: no unresolved P0s
- [ ] Agent 11: no regressions
- [ ] 3-agent design review: all PASS
- [ ] Sandbox: user approves

---

## Agent Assignments

| Agent | Parcels | Role |
|---|---|---|
| Agent 12 (Data Engineer) | P1 | Migration, RLS, indexes |
| Agent 2 (Software Engineer) | P2, P4, P5, P6 | Types, services, store, all UI components |
| Visual Design Agent | P3, P8 | Component visual specs, post-implementation review |
| Accessibility & Theming Agent | P3, P8 | ARIA, focus, dark mode tokens, post-implementation review |
| UX Completeness Agent | P3, P8 | States, navigation, edit patterns, post-implementation review |
| Agent 11 (Feature Integrity) | P7, P8 | Feature Bible, regression check |
| Agent 7 (Code Reviewer) | P8 | Code audit |

## Dependencies

```
P1 (Data Model) ──→ P2 (Service/Store) ──→ P4 (ProjectDetail Notes)
                                        ──→ P5 (Quick-Add)
                                        ──→ P6 (Export/Import)
P3 (Design Gate 1) ──→ P4, P5

P4, P5, P6 ──→ P7 (Feature Bible) ──→ P8 (Quality Gates)
```

## Sprint-Level Definition of Done

- [ ] `project_notes` table exists with RLS + indexes
- [ ] Notes CRUD works end-to-end (Supabase ↔ Store ↔ UI)
- [ ] ProjectDetail page shows notes section with full CRUD
- [ ] User can create a note for a project from anywhere in the app
- [ ] Notes are included in data export/import
- [ ] Feature Bible updated with notes must-never-lose items
- [ ] All deterministic checks pass (lint, typecheck, test, build)
- [ ] Agent 7 code audit: no unresolved P0s
- [ ] Agent 11 feature integrity: no regressions
- [ ] 3-agent design review: all PASS
- [ ] Sandbox: user approves running app on sprint branch

---

## Deferred to Sprint 15+

| Item | Category | Notes |
|---|---|---|
| Full-text search | Feature | High priority — deferred since Sprint 7 |
| AI "Organize My Day" | Feature | High priority — requires AI infrastructure |
| Calendar page redesign | Feature | Medium — large scope, own sprint |
| Entry templates | Feature | Medium |
| Automated design-lint CI step | DevOps | Medium |
| Notes rename tech debt (JournalEntry → NoteEntry) | Code Quality | Low — revisit when Notes system matures |
| CODE-02/03 (duplicated config) | Code Quality | Low |

---

*Sprint 14: Connect — Approved February 25, 2026*
*Sprint Protocol v1.5*
