# Test Strategy — Sprint 4 (Secure & Stabilize)

**Agent 10 — QA Architect**
**Activated**: Sprint 4
**Date**: 2026-02-22

## Scope

Sprint 4 focuses on security hardening, code quality, and establishing the test foundation. Test coverage targets pure utility functions and shared type contracts.

## Test Framework

- **Runner**: Vitest 3.2 (configured in `vitest.config.ts`)
- **Environment**: jsdom
- **Coverage**: @vitest/coverage-v8 (lcov + text reporters)
- **DOM Testing**: @testing-library/react + @testing-library/jest-dom

## Test Categories

### 1. Unit Tests (Sprint 4 Focus)
- `dateUtils.ts` — 43 test cases covering parsing, formatting, relative labels, comparisons
- `tracking-types.ts` — Icon map completeness and validity
- `example.test.ts` — Smoke test (scaffolded pre-Sprint 4)

### 2. Integration Tests (Sprint 5+ Targets)
- Service layer: mock Supabase client, verify `user_id` filtering on every query
- Store actions: verify optimistic update + rollback on error
- Widget rendering: test critical path rendering (Today dashboard)

### 3. E2E Tests (Phase 3+ / Sprint 7+)
- Full user flow: login → create task → complete routine → verify activity feed

## Coverage Thresholds

Sprint 4 establishes baseline. Targets:
- **Sprint 4**: Coverage reporting enabled, no enforced thresholds
- **Sprint 5**: 40% line coverage on `src/lib/`
- **Sprint 6**: 30% line coverage overall

## Critical Path Tests

### dateUtils (`src/lib/__tests__/dateUtils.test.ts`)
Critical because date parsing/formatting is used across every widget:
- `parseDate()` — Handles "Today", "Tomorrow", ISO, Date objects, null
- `formatStorageDate()` — Ensures consistent yyyy-MM-dd storage
- `isOverdue()` / `isToday()` / `isTomorrow()` — Drive task section logic
- `getRelativeDateLabel()` — Used in agenda/calendar widgets
- `getDurationMinutes()` / `formatDuration()` — Meeting duration display

### tracking-types (`src/components/widgets/tracking/__tests__/tracking-types.test.ts`)
Validates the icon map contract used by the TrackingWidget system:
- All expected icons exist in the map
- `availableIcons` array is in sync with `iconMap`
- Every entry is a renderable React component

## Running Tests

```bash
npm test              # Single run
npm run test:watch    # Watch mode
npm run test:coverage # With coverage report
```

## Next Steps (Sprint 5)
- Add Supabase client mock and service layer tests
- Add store integration tests (optimistic write patterns)
- Add widget render tests for Today page critical path
- Enforce coverage thresholds in CI
