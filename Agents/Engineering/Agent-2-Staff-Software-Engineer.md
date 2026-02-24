# Agent 2: Staff Software Engineer — Technical Architecture
## Kaivoo Command Center — Technical Design Document
### Google-Style TDD · Version 1.0

**Role:** Staff Software Engineer (Google Full-Stack background)
**Department:** Engineering
**Model:** Opus
**Hired by:** Kaivoo
**Mission:** Architect the Kaivoo Command Center from a Lovable-generated prototype into a production-grade, scalable web application capable of serving millions of users with clean code, modular infrastructure, and flawless UX.

**Date:** February 2026
**Authors:** Kaivoo Engineering Team
**Status:** APPROVED — Ready for implementation
**Reviewers:** [CTO], [VP Engineering], [UI Lead]

---

# Table of Contents

1. [Context & Current State Analysis](#1-context--current-state-analysis)
2. [Tech Stack Recommendation](#2-tech-stack-recommendation)
3. [Application Folder Structure](#3-application-folder-structure)
4. [Database Schema Design](#4-database-schema-design)
5. [API Endpoint Inventory](#5-api-endpoint-inventory)
6. [Authentication & Authorization](#6-authentication--authorization)
7. [State Management Strategy](#7-state-management-strategy)
8. [Third-Party Service Integrations](#8-third-party-service-integrations)
9. [Environment Setup](#9-environment-setup)
10. [Performance Targets](#10-performance-targets)
11. [Development Roadmap](#11-development-roadmap)

---

# 1. Context & Current State Analysis

## 1.1 What Exists Today

The Kaivoo Command Center (internally: "daily-flow") is a React SPA scaffolded by Lovable. It has a functional prototype with the following characteristics:

### Current Architecture
```
┌─────────────────────────────────────────────────────┐
│                    CLIENT (SPA)                      │
│  React 18 + TypeScript + Vite                       │
│  Tailwind CSS + shadcn/ui                           │
│  Zustand (state) + React Query                      │
│  React Router DOM v6                                 │
│  TipTap (rich text editor)                          │
│  Recharts (data visualization)                      │
│  dnd-kit (drag and drop)                            │
└─────────────┬───────────────────────────────────────┘
              │ Supabase JS Client (direct DB access)
              ▼
┌─────────────────────────────────────────────────────┐
│              SUPABASE (BaaS)                         │
│  PostgreSQL + Row Level Security                    │
│  Auth (email/password, OAuth)                       │
│  Edge Functions (4 AI functions)                    │
│  Realtime (subscriptions — unused)                  │
│  Storage (unused)                                   │
└─────────────────────────────────────────────────────┘
```

### Current Database Tables (11 tables)
| Table | Rows (est.) | Purpose |
|-------|-------------|---------|
| `profiles` | 1 per user | User display name, avatar |
| `topics` | ~10 per user | Organizational categories |
| `topic_pages` | ~30 per user | Sub-pages within topics |
| `tags` | ~20 per user | Flat tagging system |
| `tasks` | ~100 per user | Task management (5 statuses) |
| `subtasks` | ~300 per user | Checklist items within tasks |
| `journal_entries` | ~365 per user/year | Daily journal entries |
| `captures` | ~500 per user/year | Quick captures from various sources |
| `meetings` | ~200 per user/year | Calendar events |
| `routines` | ~10 per user | Habit tracking items |
| `routine_completions` | ~3650 per user/year | Daily routine check-offs |
| `routine_groups` | ~5 per user | Routine categorization |
| `ai_action_logs` | ~50 per user/month | AI action audit trail |
| `ai_settings` | 1 per user | AI feature toggle |
| `widget_settings` | ~7 per user | Dashboard widget config |

### Current Pages (10 routes)
| Route | Page | Description |
|-------|------|-------------|
| `/` | Today | Dashboard home with customizable widgets |
| `/auth` | Auth | Login/signup |
| `/journal` | JournalPage | Date-based journal entries |
| `/tasks` | Tasks | Kanban board + list view |
| `/calendar` | CalendarPage | Monthly calendar + meetings |
| `/topics` | Topics | Topic hub (card grid) |
| `/topics/:topicId` | TopicPage | Individual topic detail |
| `/topics/:topicId/pages/:pageId` | TopicPage | Topic sub-page |
| `/insights` | Insights | Analytics dashboard |
| `/settings` | SettingsPage | User settings |

### Current State Management
```
Zustand Store (useKaivooStore) — 1000+ lines
├── topics, topicPages (CRUD + query methods)
├── captures (CRUD + topic/tag/date filtering)
├── journalEntries (CRUD + date/topic filtering)
├── tasks (CRUD + subtask management + filtering)
├── tags (CRUD + getOrCreate)
├── meetings (CRUD + date filtering)
├── routines, routineGroups, routineCompletions
├── UI state (sidebarCollapsed)
└── setFromDatabase() — bulk hydration from Supabase

Database Hooks:
├── useDatabase.ts — Initial data load from Supabase + parallel fetch
├── useDatabaseOperations.ts — Individual CRUD operations to Supabase
├── useKaivooActions.ts — Orchestrates Store + DB operations together
├── useAISettings.ts — AI feature toggle
├── useAIActionLog.ts — AI audit logging
└── useWidgetSettings.ts — Widget configuration persistence
```

### Current Edge Functions (4)
| Function | Purpose |
|----------|---------|
| `ai-inbox` | AI-powered inbox processing |
| `ai-journal-extract` | Extract tasks/captures from journal text |
| `ai-link-capture` | Process links and extract metadata |
| `ai-video-capture` | Process video content for captures |

### Critical Issues Identified

1. **Monolithic Zustand Store:** 1000+ lines, handles all domains. Should be split by domain.
2. **Direct Supabase Client Access:** Frontend talks directly to Supabase. No API layer for business logic validation.
3. **No Error Boundaries:** App crashes propagate to white screen.
4. **Hardcoded Mock Data:** Initial store state includes mock data that ships to production.
5. **No Testing Infrastructure:** `vitest` configured but no meaningful tests exist.
6. **CSS Token Mismatch:** Current shadcn tokens (purple/violet) don't match Kaivoo Design System.
7. **No Offline Support:** App requires constant network connectivity.
8. **No Data Pagination:** All data fetched at once on login.
9. **Missing Indexes:** Database schema lacks optimization indexes.
10. **No Rate Limiting:** Edge functions have no rate limiting.

---

# 2. Tech Stack Recommendation

## 2.1 Frontend Stack

| Layer | Current | Recommended | Reasoning |
|-------|---------|-------------|-----------|
| **Framework** | React 18 + Vite | **React 18 + Vite** (keep) | Vite is fastest DX. React 18 is stable. No reason to migrate to Next.js unless we need SSR (we don't — this is a SPA). |
| **Language** | TypeScript | **TypeScript 5.x** (keep, upgrade strict) | Enable `strict: true`, `noUncheckedIndexedAccess: true` |
| **CSS** | Tailwind 3 + shadcn | **Tailwind 3 + shadcn** (keep, re-theme) | Re-theme shadcn components with Kaivoo tokens. Don't rebuild from scratch. |
| **State** | Zustand (single store) | **Zustand (domain-split stores)** | Split into 6 stores: `useTaskStore`, `useJournalStore`, `useTopicStore`, `useRoutineStore`, `useMeetingStore`, `useUIStore` |
| **Data Fetching** | React Query + direct Supabase | **React Query + Service Layer** | Service layer wraps Supabase calls, adds validation, error handling. React Query handles caching, invalidation, optimistic updates. |
| **Routing** | React Router v6 | **React Router v6** (keep) | Stable, sufficient for SPA routing. |
| **Rich Text** | TipTap | **TipTap** (keep) | Best React rich text editor. Keep current setup. |
| **Charts** | Recharts | **Recharts** (keep) | Good enough for current needs. Re-theme with Kaivoo colors. |
| **DnD** | dnd-kit | **dnd-kit** (keep) | Well-maintained, accessible drag-and-drop. |
| **Forms** | react-hook-form + zod | **react-hook-form + zod** (keep, expand) | Expand Zod schemas for all forms. |

## 2.2 Backend Stack

| Layer | Current | Recommended | Reasoning |
|-------|---------|-------------|-----------|
| **Platform** | Supabase (hosted) | **Supabase** (keep as primary) | Supabase provides Auth, DB, Realtime, Storage, Edge Functions. Moving off would add complexity with no benefit at our scale. |
| **Database** | PostgreSQL (via Supabase) | **PostgreSQL** (keep) | Best relational DB. Supabase manages infrastructure. |
| **Auth** | Supabase Auth | **Supabase Auth** (keep, expand) | Add Google/Apple OAuth, MFA, role-based access. |
| **Edge Functions** | Deno (Supabase Functions) | **Supabase Edge Functions** (keep, expand) | Add 8+ new functions for API validation, business logic. |
| **Realtime** | Available but unused | **Supabase Realtime** (activate) | Enable for real-time task updates, collaboration features. |
| **Storage** | Available but unused | **Supabase Storage** (activate) | For user avatars, file attachments, journal images. |
| **Search** | None | **PostgreSQL Full-Text Search** | pg_trgm + tsvector for journal/capture/task search. |
| **Caching** | None | **React Query built-in cache** | 5-minute stale time for lists, instant for mutations via optimistic updates. |

## 2.3 Hosting

| Component | Provider | Reasoning |
|-----------|----------|-----------|
| Frontend SPA | **Vercel** | Free tier, global CDN, instant deploys from Git, preview URLs per PR |
| Backend | **Supabase Cloud** | Already in use. Scale to Pro plan when needed ($25/mo) |
| Domain | **Cloudflare** | DNS, DDoS protection, edge caching |
| Monitoring | **Sentry** (frontend) + **Supabase Dashboard** (backend) | Error tracking, performance monitoring |
| Analytics | **PostHog** (self-hosted option) or **Plausible** | Privacy-first analytics, no cookie banner needed |

---

# 3. Application Folder Structure

> **Folder Structure:** See [Agent-2-Docs/Architecture-Folder-Structure.md](Agent-2-Docs/Architecture-Folder-Structure.md) for the detailed application folder structure.

---

# 4. Database Schema Design

> **Database Schema:** See [Agent-2-Docs/Architecture-Database-Schema.md](Agent-2-Docs/Architecture-Database-Schema.md) for the full ERD, ALTER TABLE migrations, and index definitions.

---

# 5. API Endpoint Inventory

## 5.1 Architecture Decision: Direct Supabase Client vs. Edge Functions

**Decision:** Hybrid approach.
- **Read operations:** Direct Supabase client with RLS (fast, no cold start)
- **Write operations requiring business logic:** Edge Functions (validation, side effects)
- **AI operations:** Edge Functions (API key security)
- **External integrations:** Edge Functions (webhook handlers)

> **Endpoint Details:** See [Agent-2-Docs/Architecture-API-Endpoints.md](Agent-2-Docs/Architecture-API-Endpoints.md) for the full list of direct Supabase client operations and Edge Function endpoints.

---

# 6. Authentication & Authorization

## 6.1 Auth Flow

```
SIGN UP:
  1. User enters email + password (or OAuth)
  2. Supabase Auth creates user in auth.users
  3. Trigger auto-creates profile in public.profiles
  4. User directed to onboarding flow (4 steps)
  5. Profile updated with preferences

SIGN IN (Cloud/Supabase phase):
  Email/Password → Supabase signInWithPassword → JWT stored in localStorage
  Google OAuth → Supabase signInWithOAuth({ provider: 'google' })
  Apple OAuth → Supabase signInWithOAuth({ provider: 'apple' })

SIGN IN (Hub phase — upgraded per Agent 4: Security):
  Email/Password → Hub server proxies to Supabase Auth
  JWT returned to Hub server (never exposed to browser)
  Hub sets httpOnly, Secure, SameSite=Strict cookies
  Browser automatically sends cookies on every request

SESSION:
  Cloud phase: JWT refresh handled by Supabase client (localStorage)
  Hub phase: httpOnly cookies, 15-min access token, 7-day refresh token
  Token expiry: 15 min (Hub auto-refreshes via cookie rotation)

SIGN OUT:
  Supabase signOut → Clear local state → Redirect to /auth
```

## 6.2 Authorization Model

```
CURRENT: Single-user (RLS: auth.uid() = user_id)
  - Every table has RLS policies checking auth.uid()
  - No shared resources, no admin roles

FUTURE: Multi-user with sharing
  Roles:
    owner:    Full CRUD on their data
    editor:   Read + write on shared entities
    viewer:   Read-only on shared entities
    admin:    Platform administration (future)

  Implementation:
    - shared_access table maps permissions
    - RLS policies expand: auth.uid() = user_id OR shared_access check
    - Edge Function validates sharing permissions before granting
```

---

# 7. State Management Strategy

## 7.1 Migration: Monolithic Store → Domain Stores + React Query

```
CURRENT (Zustand monolith):
  useKaivooStore → 1000+ lines, all domains, all CRUD

PROPOSED:
  ┌────────────────────────────────┐
  │       React Query Cache        │  ← Server state (source of truth)
  │  tasks, journal, captures,     │
  │  topics, meetings, routines    │
  │  profiles, notifications       │
  ├────────────────────────────────┤
  │       Zustand Stores           │  ← Client-only state
  │  useUIStore (sidebar, theme)   │
  │  useWidgetStore (layout)       │
  └────────────────────────────────┘
```

## 7.2 Data Flow Pattern

```
USER ACTION
    │
    ▼
Component calls useMutation (React Query)
    │
    ▼
Service Layer (tasks.service.ts)
    │
    ├── Validates input (Zod schema)
    │
    ├── Optimistic update to React Query cache
    │
    ├── Supabase client call
    │
    ├── On success: invalidate related queries
    │
    └── On error: roll back optimistic update, show toast

EXAMPLE: Complete a task
    1. User clicks checkbox
    2. TaskCard calls `useMutation(taskService.complete)`
    3. Optimistic: task moves to "done" column immediately
    4. Supabase: UPDATE tasks SET status='done', completed_at=now()
    5. Success: invalidate ['tasks'], ['insights'] queries
    6. Error: revert task to previous column, show error toast
```

## 7.3 React Query Configuration

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,     // 5 minutes
      gcTime: 30 * 60 * 1000,       // 30 minutes (formerly cacheTime)
      retry: 2,
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
    },
    mutations: {
      onError: (error) => toast.error(formatError(error)),
    },
  },
});
```

---

# 8. Third-Party Service Integrations

| Service | Provider | Purpose | Priority |
|---------|----------|---------|----------|
| **Auth OAuth** | Google, Apple (via Supabase) | Social login | P0 (MVP) |
| **AI/LLM** | OpenAI GPT-4o-mini (via Edge Functions) | Journal extraction, inbox processing | P0 (exists) |
| **Calendar Sync** | Google Calendar API | Two-way meeting sync | P1 |
| **Email** | Resend or Supabase Email | Password reset, daily digest | P1 |
| **File Storage** | Supabase Storage | Avatars, journal attachments | P1 |
| **Analytics** | PostHog (self-hosted) or Plausible | Usage analytics, feature adoption | P2 |
| **Error Tracking** | Sentry | Frontend error monitoring | P0 |
| **Search** | PostgreSQL pg_trgm + tsvector | Full-text search across entities | P1 |
| **Payments** | Stripe | Premium tier (future) | P3 |
| **Push Notifications** | Web Push API + Supabase | Task reminders, routine alerts | P2 |
| **Calendar (Outlook)** | Microsoft Graph API | Outlook calendar sync | P3 |

---

# 9. Environment Setup

## 9.1 Environment Variables

```bash
# .env.example

# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...

# Feature Flags
VITE_ENABLE_AI=true
VITE_ENABLE_CALENDAR_SYNC=false
VITE_ENABLE_SHARING=false

# Analytics (optional)
VITE_POSTHOG_KEY=phc_...
VITE_POSTHOG_HOST=https://app.posthog.com

# Error Tracking (optional)
VITE_SENTRY_DSN=https://...@sentry.io/...

# Edge Function Secrets (server-side only, set in Supabase dashboard)
# OPENAI_API_KEY=sk-...
# GOOGLE_CALENDAR_CLIENT_ID=...
# GOOGLE_CALENDAR_CLIENT_SECRET=...
# RESEND_API_KEY=re_...
# STRIPE_SECRET_KEY=sk_...
```

## 9.2 Environment Configurations

| Config | Development | Staging | Production |
|--------|-------------|---------|------------|
| Supabase URL | Local or dev project | Staging project | Production project |
| AI Features | Enabled (mock mode) | Enabled | Enabled |
| Error Tracking | Console only | Sentry (sampling 100%) | Sentry (sampling 10%) |
| Analytics | Disabled | Enabled (internal) | Enabled |
| Source Maps | Inline | Uploaded to Sentry | Uploaded to Sentry |
| CSP | Relaxed | Strict | Strict |
| CORS | * | *.kaivoo.com | *.kaivoo.com |

---

# 10. Performance Targets

> **Performance Targets:** See [Vision.md](../../Vision.md) for target metrics.

---

# 11. Development Roadmap

> **Development Roadmap:** See [Vision.md](../../Vision.md) for the phased roadmap. The Director manages sprint planning.

---

# Architecture Diagrams

## High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser/PWA)                         │
│                                                                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────────┐   │
│  │  React   │  │ React    │  │ Zustand   │  │   Service Layer  │   │
│  │  Router  │  │ Query    │  │ (UI only) │  │   (api/*.ts)     │   │
│  └────┬─────┘  └────┬─────┘  └──────────┘  └────────┬─────────┘   │
│       │              │                                 │             │
│       │              └──────────┬──────────────────────┘             │
│       │                         │                                    │
│       │                    ┌────┴─────┐                              │
│       │                    │ Supabase │                              │
│       │                    │  Client  │                              │
│       │                    └────┬─────┘                              │
└───────┼─────────────────────────┼───────────────────────────────────┘
        │                         │
        │              ┌──────────┴──────────┐
        │              │                     │
        │         Direct RLS            Edge Functions
        │         (reads)               (writes/AI)
        │              │                     │
        ▼              ▼                     ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      SUPABASE PLATFORM                              │
│                                                                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────────┐   │
│  │   Auth   │  │ Database │  │ Storage  │  │  Edge Functions  │   │
│  │  (JWT)   │  │ (Postgres│  │ (S3)     │  │  (Deno Runtime)  │   │
│  │          │  │  + RLS)  │  │          │  │                  │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────────────┘   │
│                                                                     │
│  ┌──────────┐  ┌──────────┐                                        │
│  │ Realtime │  │  Cron    │                                        │
│  │ (WS)     │  │  Jobs    │                                        │
│  └──────────┘  └──────────┘                                        │
└─────────────────────────────────────────────────────────────────────┘
        │                                    │
        ▼                                    ▼
┌──────────────┐                    ┌──────────────────┐
│   Vercel     │                    │  External APIs   │
│   (CDN +     │                    │  ● OpenAI        │
│    Hosting)  │                    │  ● Google Cal    │
│              │                    │  ● Resend        │
└──────────────┘                    │  ● Sentry        │
                                    │  ● PostHog       │
                                    └──────────────────┘
```

## Data Flow: Task Creation

```
User clicks [+ New task]
        │
        ▼
TaskForm.tsx validates with Zod
        │
        ▼
useMutation(taskService.create)
        │
        ├──────────────────────────┐
        │                          │
        ▼                          ▼
Optimistic update:            Supabase INSERT:
React Query cache             tasks.insert({...})
adds task immediately                │
        │                          │
        │                     ┌────┴────┐
        │                     │ Success │
        │                     └────┬────┘
        │                          │
        │                          ▼
        │                   Invalidate queries:
        │                   ['tasks'], ['insights']
        │                          │
        ▼                          ▼
UI shows new task           Toast: "Task created"
in correct column
```

---

# 12. Real-Time Features

## 12.1 Scope

Real-time capabilities are a first-class concern for Agent 2, not a separate agent's responsibility. This covers all live data synchronization, collaborative features, and event-driven UI updates across the Kaivoo platform.

## 12.2 Supabase Realtime (Phase 1 — Cloud)

Supabase Realtime is available but currently unused. Activation plan:

```
Priority 1 (Sprint 3-4):
  ├── Task status changes — reflect instantly across open tabs/devices
  ├── Journal auto-save — conflict-free editing with debounced sync
  ├── Routine completions — update summary header in real time
  └── Capture ingestion — new captures appear without refresh

Priority 2 (Phase 3+):
  ├── AI processing status — live progress indicators for AI operations
  ├── Notification delivery — in-app notification bell with live unread count
  └── Presence indicators — who's viewing what (multi-user, Phase 6+)

Priority 3 (Phase 6 — Platform):
  ├── Collaborative editing — multiple users on the same document/topic
  ├── Live activity feed — stream of actions across workspace
  └── Module event bus — modules publish/subscribe to real-time events
```

### Implementation Pattern

```typescript
// Supabase Realtime subscription pattern
const channel = supabase
  .channel('tasks-changes')
  .on(
    'postgres_changes',
    { event: '*', schema: 'public', table: 'tasks', filter: `user_id=eq.${userId}` },
    (payload) => {
      // Invalidate React Query cache to trigger re-render
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    }
  )
  .subscribe();

// Cleanup on unmount
return () => { supabase.removeChannel(channel); };
```

### React Hook Pattern

```typescript
// useRealtimeSubscription.ts — shared hook for all real-time subscriptions
function useRealtimeSubscription(table: string, filter?: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel(`${table}-realtime`)
      .on('postgres_changes', { event: '*', schema: 'public', table, filter }, () => {
        queryClient.invalidateQueries({ queryKey: [table] });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [table, filter, queryClient]);
}
```

## 12.3 WebSocket Server (Phase 3 — Self-Hosted Hub)

When Kaivoo moves to the self-hosted Hub (Node.js + Express + SQLite), real-time shifts from Supabase Realtime to a custom WebSocket server:

```
Hub Server
  ├── Express HTTP API (REST endpoints)
  └── WebSocket Server (ws or Socket.IO)
       ├── Connection management (auth via token, heartbeat, auto-reconnect)
       ├── Room-based subscriptions (per-user, per-workspace, per-document)
       ├── Event broadcasting (DB change → WS push → client invalidation)
       └── Presence tracking (online users, active views)
```

### Scaling Strategy

| Concurrent Users | Architecture | Notes |
|---|---|---|
| 1-100 | Single Node.js process, in-memory state | Default self-hosted setup |
| 100-1,000 | Single process with connection pooling | Monitor memory, tune heartbeat intervals |
| 1,000-10,000 | Multiple processes + Redis pub/sub | Cloud SaaS tier, horizontal scaling |
| 10,000+ | Dedicated WebSocket service (separate from API) | Enterprise/platform scale |

### Connection State Handling

```
Client connects
  ├── Auth handshake (JWT verification)
  ├── Subscribe to user's data channels
  ├── Receive initial state diff (changes since last sync)
  └── Enter live mode (receive pushes)

Connection drops
  ├── Client enters offline mode (React Query serves cached data)
  ├── Auto-reconnect with exponential backoff (1s, 2s, 4s, 8s, max 30s)
  ├── On reconnect: request changes since last received timestamp
  └── Merge server state with any offline mutations (conflict resolution)

Conflict Resolution Strategy:
  ├── Last-write-wins for simple fields (task status, routine completion)
  ├── Operational transform for rich text (journal entries via TipTap/Yjs)
  └── User prompt for ambiguous conflicts (rare — flag and ask)
```

## 12.4 Real-Time Search (Phase 4+)

```
User types in search box
  ├── Debounce 200ms
  ├── React Query with keepPreviousData: true (no flicker)
  ├── PostgreSQL pg_trgm fuzzy search (Phase 1)
  └── Semantic vector search via embeddings (Phase 4 — AI Integration)
```

---

# Appendix: Migration Checklist

## Phase 1: Non-Breaking Changes (can deploy immediately)
- [ ] Add database indexes
- [ ] Add new columns to existing tables
- [ ] Create new tables (notifications, file_attachments, etc.)
- [ ] Set up CI/CD pipeline
- [ ] Add Sentry error tracking
- [ ] Add ErrorBoundary component

## Phase 2: Refactoring (requires coordinated deploy)
- [ ] Split Zustand store into domain stores
- [ ] Create service layer
- [ ] Migrate CRUD operations to React Query mutations
- [ ] Restructure folder layout
- [ ] Update imports across all files

## Phase 3: Design System Migration (visual changes)
- [ ] Swap CSS tokens to Kaivoo palette
- [ ] Re-theme all shadcn components
- [ ] Update layout components (Header, Sidebar, TabBar)
- [ ] Implement responsive breakpoint behavior
- [ ] Dark mode with Kaivoo surface hierarchy

---

**Kaivoo Command Center — Technical Design Document v1.0**
**February 2026**

*Clean code is a technology. Scalable infrastructure is a craft. This document is how we build both.*
