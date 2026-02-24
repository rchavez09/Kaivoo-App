# Hub Server API Reference

**Source:** Extracted from Agent 3 System Architect spec, Section 10
**Parent:** [Agent-3-System-Architect.md](../Agent-3-System-Architect.md)

---

## 10.1 API Endpoints

### Vault (File System)
```
GET    /api/vault/tree                    → Full directory tree
GET    /api/vault/tree/:path              → Subtree from path
GET    /api/vault/file/:path              → File content (text) or download (binary)
POST   /api/vault/file/:path              → Create file
PUT    /api/vault/file/:path              → Update file content
DELETE /api/vault/file/:path              → Soft delete (move to trash)
POST   /api/vault/folder/:path            → Create folder
POST   /api/vault/move                    → Move file/folder { from, to }
POST   /api/vault/upload/:path            → Upload binary file
GET    /api/vault/search?q=&type=&tags=   → Search files
GET    /api/vault/recent                  → Recently modified files
GET    /api/vault/starred                 → Bookmarked files
POST   /api/vault/star/:path              → Toggle star
GET    /api/vault/tags                    → All tags with counts
GET    /api/vault/storage                 → Disk usage stats
```

### Journal
```
GET    /api/journal/entries?from=&to=     → Entries in date range
GET    /api/journal/entry/:date           → Single entry by date
POST   /api/journal/entry/:date           → Create/update entry
GET    /api/journal/templates             → Available templates
GET    /api/journal/stats?from=&to=       → Word count, mood, streaks
```

### Tasks
```
GET    /api/tasks?status=&tag=&sort=      → Filtered task list
POST   /api/tasks                         → Create task
PUT    /api/tasks/:id                     → Update task
DELETE /api/tasks/:id                     → Delete task
GET    /api/tasks/:id/subtasks            → Subtasks
POST   /api/tasks/:id/subtasks            → Create subtask
PUT    /api/tasks/reorder                 → Reorder tasks
```

### Routines
```
GET    /api/routines                      → All routines + groups
POST   /api/routines                      → Create routine
PUT    /api/routines/:id                  → Update routine
POST   /api/routines/:id/complete/:date   → Mark complete
DELETE /api/routines/:id/complete/:date   → Unmark complete
GET    /api/routines/report?from=&to=     → Completion rates, streaks
```

### Concierge (AI)
```
POST   /api/concierge/message             → Send message to Concierge
GET    /api/concierge/conversations        → List conversations
GET    /api/concierge/conversation/:id     → Single conversation
GET    /api/concierge/agents               → List available agents
GET    /api/concierge/skills               → List available skills
GET    /api/concierge/providers            → List AI providers + status
PUT    /api/concierge/providers            → Update AI provider config
GET    /api/concierge/soul                 → Read soul file
PUT    /api/concierge/soul                 → Update soul file
```

### Settings
```
GET    /api/settings                      → App settings
PUT    /api/settings                      → Update settings
GET    /api/settings/widgets              → Widget layout
PUT    /api/settings/widgets              → Update widget layout
```

## 10.2 WebSocket Events

```
SERVER → CLIENT:
  file:created    { path, type }           → New file detected
  file:modified   { path, type }           → File changed
  file:deleted    { path }                 → File removed
  file:moved      { from, to }            → File moved/renamed
  task:updated    { id, changes }          → Task state change
  routine:updated { id, changes }          → Routine completion
  concierge:message { conversationId, message }  → AI response chunk
  concierge:complete { conversationId, result }  → AI task done

CLIENT → SERVER:
  subscribe:folder  { path }              → Watch specific folder
  unsubscribe:folder { path }             → Stop watching
```

## 10.3 File Watcher Flow

```
File changed on disk (any source: Finder, Obsidian, AI agent, etc.)
    │
    ▼
chokidar detects change
    │
    ▼
Hub Server processes:
  1. If .md: re-parse frontmatter, update tags in SQLite, update FTS index
  2. If binary: update file_index metadata (size, modified_at, hash)
  3. Broadcast WebSocket event to all connected clients
    │
    ▼
All browsers update in real-time
```
