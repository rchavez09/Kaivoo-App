*Extracted from Agent 3 spec — February 22, 2026*

# Migration Plan (Supabase → Local)

## Phase 1: Export

```
1. Export all Supabase data via pg_dump or API calls
2. Parse each table into appropriate format:
   - journal_entries → .md files in Journal/
   - topics → folders in Projects/
   - topic_pages → .md files inside topic folders
   - tasks → SQLite tasks table
   - subtasks → SQLite subtasks table
   - routines → SQLite routines table
   - routine_completions → SQLite routine_completions table
   - meetings → SQLite meetings table
   - captures → .md files in Inbox/
   - widget_settings → SQLite widget_settings table
   - ai_settings → .kaivoo/config.json
```

## Phase 2: Build Hub Server

```
1. Set up Node.js + Express server
2. Implement Vault API endpoints (file CRUD + tree)
3. Implement SQLite schema + migrations
4. Implement file watcher (chokidar)
5. Implement WebSocket server
6. Serve React SPA as static files
```

## Phase 3: Adapt Frontend

```
1. Replace all Supabase client calls with Hub API calls
2. Replace useDatabase.ts → Hub API service layer
3. Replace Zustand store data fetching → React Query + Hub API
4. Keep Supabase Auth (JWT validation on Hub server)
5. Add file browser component
6. Add markdown viewer/editor for vault files
```

## Phase 4: AI Integration

```
1. Install Ollama on Mac Mini
2. Implement Concierge API endpoint
3. Build agent/skill file parser
4. Implement conversation persistence
5. Create Soul file + reading logic
6. Build AI provider routing
7. Implement RAG pipeline (index → embed → retrieve → generate)
```
