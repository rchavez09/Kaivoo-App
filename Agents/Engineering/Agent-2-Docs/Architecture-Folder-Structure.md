*Extracted from Agent 2 spec — February 22, 2026*

# 3. Application Folder Structure

## 3.1 Proposed Directory Tree

```
kaivoo-command-center/
├── .github/
│   ├── workflows/
│   │   ├── ci.yml                    # Lint + test + build on PR
│   │   ├── deploy-preview.yml        # Deploy PR previews to Vercel
│   │   └── deploy-production.yml     # Deploy main to production
│   └── CODEOWNERS                    # Required reviewers per directory
│
├── public/
│   ├── favicon.ico
│   ├── manifest.json                 # PWA manifest
│   ├── robots.txt
│   └── icons/                        # PWA icons (192, 512)
│
├── src/
│   ├── app/
│   │   ├── App.tsx                   # Root component, providers, router
│   │   ├── routes.tsx                # Centralized route definitions
│   │   └── providers.tsx             # QueryClient, Auth, Theme, Tooltip
│   │
│   ├── assets/
│   │   ├── fonts/                    # Neue Haas Grotesk (when licensed)
│   │   └── images/                   # Static brand assets
│   │
│   ├── components/
│   │   ├── ui/                       # shadcn primitives (button, input, etc.)
│   │   ├── layout/
│   │   │   ├── AppLayout.tsx         # Main shell: header + sidebar + content
│   │   │   ├── Header.tsx            # Top navigation bar
│   │   │   ├── Sidebar.tsx           # Collapsible sidebar
│   │   │   ├── TabBar.tsx            # Mobile bottom tab bar
│   │   │   └── PageContainer.tsx     # Content wrapper with max-width
│   │   ├── widgets/
│   │   │   ├── WidgetContainer.tsx   # Drag-reorder widget shell
│   │   │   ├── DailyBriefWidget.tsx
│   │   │   ├── JournalWidget.tsx
│   │   │   ├── TasksWidget.tsx
│   │   │   ├── CalendarWidget.tsx
│   │   │   ├── TrackingWidget.tsx
│   │   │   ├── AIInboxWidget.tsx
│   │   │   └── TodayActivityWidget.tsx
│   │   ├── tasks/
│   │   │   ├── KanbanBoard.tsx
│   │   │   ├── TaskCard.tsx
│   │   │   ├── TaskDetailsDrawer.tsx
│   │   │   ├── TaskForm.tsx
│   │   │   └── TaskFilters.tsx
│   │   ├── journal/
│   │   │   ├── JournalEditor.tsx
│   │   │   ├── JournalEntryCard.tsx
│   │   │   └── JournalEntryDialog.tsx
│   │   ├── calendar/
│   │   │   ├── CalendarGrid.tsx
│   │   │   ├── MeetingCard.tsx
│   │   │   └── MeetingDetailsDrawer.tsx
│   │   ├── topics/
│   │   │   ├── TopicCard.tsx
│   │   │   ├── TopicPagePicker.tsx
│   │   │   └── TopicBreadcrumbs.tsx
│   │   ├── settings/
│   │   │   ├── ProfileSettings.tsx
│   │   │   ├── AppearanceSettings.tsx
│   │   │   ├── AISettingsCard.tsx
│   │   │   └── DataExportSettings.tsx
│   │   ├── feedback/
│   │   │   ├── ErrorBoundary.tsx
│   │   │   ├── LoadingSkeleton.tsx
│   │   │   ├── EmptyState.tsx
│   │   │   └── ErrorState.tsx
│   │   └── shared/
│   │       ├── ProtectedRoute.tsx
│   │       ├── DataLoader.tsx
│   │       ├── CaptureEditDialog.tsx
│   │       └── NavLink.tsx
│   │
│   ├── hooks/
│   │   ├── useAuth.tsx               # Auth context + provider
│   │   ├── useMobile.tsx             # Mobile breakpoint detection
│   │   ├── useToast.ts              # Toast notification hook
│   │   └── useDebounce.ts           # Input debouncing
│   │
│   ├── services/
│   │   ├── api/
│   │   │   ├── client.ts            # Supabase client singleton
│   │   │   ├── tasks.service.ts     # Task CRUD + business logic
│   │   │   ├── journal.service.ts   # Journal CRUD
│   │   │   ├── captures.service.ts  # Capture CRUD
│   │   │   ├── topics.service.ts    # Topic + TopicPage CRUD
│   │   │   ├── meetings.service.ts  # Meeting CRUD
│   │   │   ├── routines.service.ts  # Routine + Completion CRUD
│   │   │   ├── auth.service.ts      # Auth operations
│   │   │   ├── ai.service.ts        # AI Edge Function calls
│   │   │   ├── search.service.ts    # Full-text search
│   │   │   └── storage.service.ts   # File upload/download
│   │   └── queries/
│   │       ├── useTasksQuery.ts     # React Query hooks for tasks
│   │       ├── useJournalQuery.ts
│   │       ├── useCapturesQuery.ts
│   │       ├── useTopicsQuery.ts
│   │       ├── useMeetingsQuery.ts
│   │       ├── useRoutinesQuery.ts
│   │       └── useSearchQuery.ts
│   │
│   ├── stores/
│   │   ├── useUIStore.ts            # Sidebar, theme, layout preferences
│   │   └── useWidgetStore.ts        # Widget configuration
│   │
│   ├── types/
│   │   ├── index.ts                 # Re-exports
│   │   ├── task.types.ts
│   │   ├── journal.types.ts
│   │   ├── topic.types.ts
│   │   ├── meeting.types.ts
│   │   ├── routine.types.ts
│   │   ├── capture.types.ts
│   │   ├── user.types.ts
│   │   └── api.types.ts             # API response/request types
│   │
│   ├── utils/
│   │   ├── date.ts                  # Date formatting helpers
│   │   ├── validation.ts            # Zod schemas
│   │   ├── cn.ts                    # clsx + tailwind-merge
│   │   └── constants.ts             # App-wide constants
│   │
│   ├── styles/
│   │   ├── index.css                # Global styles + Kaivoo tokens
│   │   ├── tokens.css               # CSS custom properties
│   │   └── animations.css           # Keyframe definitions
│   │
│   ├── test/
│   │   ├── setup.ts                 # Vitest setup
│   │   ├── mocks/                   # Mock data factories
│   │   └── utils/                   # Test utilities
│   │
│   ├── main.tsx                     # Entry point
│   └── vite-env.d.ts
│
├── supabase/
│   ├── config.toml
│   ├── migrations/
│   │   ├── 001_initial_schema.sql
│   │   ├── 002_ai_features.sql
│   │   ├── 003_widget_settings.sql
│   │   ├── 004_search_indexes.sql       # NEW: Full-text search
│   │   ├── 005_user_preferences.sql     # NEW: Theme, locale
│   │   ├── 006_file_attachments.sql     # NEW: Storage references
│   │   ├── 007_notifications.sql        # NEW: In-app notifications
│   │   ├── 008_sharing.sql              # NEW: Shared topics/tasks
│   │   └── 009_analytics.sql            # NEW: Usage analytics
│   ├── functions/
│   │   ├── ai-inbox/
│   │   ├── ai-journal-extract/
│   │   ├── ai-link-capture/
│   │   ├── ai-video-capture/
│   │   ├── api-tasks/                   # NEW: Task API validation
│   │   ├── api-search/                  # NEW: Search endpoint
│   │   ├── webhooks-calendar/           # NEW: Google Calendar sync
│   │   ├── cron-daily-digest/           # NEW: Daily email digest
│   │   └── export-data/                 # NEW: Data export (JSON/CSV)
│   └── seed.sql                         # Development seed data
│
├── .env.example
├── .env.local                           # Local dev (gitignored)
├── .eslintrc.js
├── .prettierrc
├── index.html
├── package.json
├── tailwind.config.ts
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
├── vite.config.ts
├── vitest.config.ts
└── README.md
```
