# Kaivoo Command Center — React App Conventions

## Tech Stack

React 18 + TypeScript + Vite + Supabase + Tailwind CSS + shadcn/ui

## Architecture

| Layer | Location | Pattern |
|---|---|---|
| Pages | `src/pages/` | Lazy-loaded via React Router 6 |
| Components | `src/components/` | PascalCase files, props via interfaces |
| Stores | `src/stores/` | Zustand with `useXyzStore` naming, `persist` middleware for localStorage |
| Services | `src/services/` | `xyz.service.ts` — DB row → app type converters + CRUD functions |
| Hooks | `src/hooks/` | `useXyz` naming. Query hooks in `hooks/queries/` (React Query) |
| Types | `src/types/` | Centralized interfaces in `index.ts`. PascalCase. Union types for enums |
| Utilities | `src/lib/` | `utils.ts` (cn helper), `dateUtils.ts` (date-fns), `task-config.tsx` |
| Tests | `src/test/` | Vitest. `*.test.ts(x)` suffix. Mocked Supabase via `vi.hoisted()` + `vi.mock()` |

## Coding Standards

- **Exports:** Named exports preferred. Components can use default export.
- **State:** Zustand domain stores (not one mega-store). Selectors only — never subscribe to full store.
- **Data fetching:** React Query (`@tanstack/react-query`) for server state. Supabase client from `@/integrations/supabase/client`.
- **Service pattern:** `dbToX()` converter + `fetchX()` + `createX()` / `updateX()` / `deleteX()` per entity.
- **Styling:** Tailwind utility classes only. No CSS modules. Use `cn()` from `lib/utils` for conditional classes.
- **Theming:** HSL CSS variables in `index.css`, referenced via Tailwind config. Dark mode via `class` strategy.
- **Forms:** React Hook Form + Zod validation.
- **Toasts:** Sonner (`sonner` package).
- **Auth:** `useAuth()` hook. Protected routes via `ProtectedRoute` component.
- **Path aliases:** `@/` maps to `src/`.

## Important Patterns

- Routes are lazy-loaded in `App.tsx` — new pages must follow this pattern.
- Data loading is wrapped in `DataLoader` component.
- Error boundaries via `ErrorBoundary` component.
- Service functions handle the Supabase ↔ app type conversion — components never see raw DB rows.
- All dates use `date-fns` — never raw `Date` manipulation.
