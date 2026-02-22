*Extracted from Agent 2 spec — February 22, 2026*

# 5. API Endpoint Inventory

## 5.2 Direct Supabase Client Operations (via Service Layer)

```
TASKS
  GET    tasks?user_id=eq.{id}&status=in.(todo,doing)&order=created_at.desc
  GET    tasks?id=eq.{taskId}&select=*,subtasks(*)
  POST   tasks { title, status, priority, ... }
  PATCH  tasks?id=eq.{taskId} { status, priority, ... }
  DELETE tasks?id=eq.{taskId}

SUBTASKS
  GET    subtasks?task_id=eq.{taskId}&order=position
  POST   subtasks { task_id, title, position }
  PATCH  subtasks?id=eq.{id} { completed, completed_at }
  DELETE subtasks?id=eq.{id}

JOURNAL ENTRIES
  GET    journal_entries?user_id=eq.{id}&date=eq.{date}&order=timestamp
  POST   journal_entries { date, content, tags, topic_ids }
  PATCH  journal_entries?id=eq.{id} { content, tags }
  DELETE journal_entries?id=eq.{id}

CAPTURES
  GET    captures?user_id=eq.{id}&date=eq.{date}&order=created_at.desc
  POST   captures { content, source, date, tags, topic_ids }
  PATCH  captures?id=eq.{id} { content, tags }
  DELETE captures?id=eq.{id}

TOPICS
  GET    topics?user_id=eq.{id}&archived=is.false&order=position
  POST   topics { name, description, icon, color }
  PATCH  topics?id=eq.{id} { name, archived, position }
  DELETE topics?id=eq.{id}

MEETINGS
  GET    meetings?user_id=eq.{id}&start_time=gte.{dayStart}&start_time=lt.{dayEnd}
  POST   meetings { title, start_time, end_time, ... }
  PATCH  meetings?id=eq.{id} { title, notes, ... }
  DELETE meetings?id=eq.{id}

ROUTINES/GROUPS/COMPLETIONS
  GET    routines?user_id=eq.{id}&order=position
  POST   routines { name, icon, group_id, target_days }
  PATCH  routines?id=eq.{id} { name, position }
  DELETE routines?id=eq.{id}
  POST   routine_completions { routine_id, date }
  DELETE routine_completions?routine_id=eq.{id}&date=eq.{date}

PROFILES
  GET    profiles?user_id=eq.{id}
  PATCH  profiles?user_id=eq.{id} { display_name, timezone, theme }

NOTIFICATIONS
  GET    notifications?user_id=eq.{id}&read_at=is.null&order=created_at.desc&limit=20
  PATCH  notifications?id=eq.{id} { read_at: now() }
```

## 5.3 Edge Function Endpoints

```
AI FUNCTIONS (existing + enhanced):
  POST /functions/v1/ai-journal-extract
    Body: { content: string, userId: string }
    Response: { tasks: Task[], captures: Capture[], tags: string[], topics: string[] }
    Rate limit: 20/min per user

  POST /functions/v1/ai-inbox
    Body: { items: InboxItem[], userId: string }
    Response: { processed: ProcessedItem[] }

  POST /functions/v1/ai-link-capture
    Body: { url: string, userId: string }
    Response: { title, description, thumbnail, content }

  POST /functions/v1/ai-video-capture
    Body: { videoUrl: string, userId: string }
    Response: { transcript, summary, captures: Capture[] }

NEW FUNCTIONS:
  POST /functions/v1/api-search
    Body: { query: string, filters: { type?, dateRange?, topicId? } }
    Response: { results: SearchResult[], total: number }

  POST /functions/v1/webhooks-calendar
    Body: Google Calendar push notification payload
    Response: { synced: number }

  POST /functions/v1/cron-daily-digest
    Body: { userId: string } (called by cron scheduler)
    Response: { sent: boolean }

  POST /functions/v1/export-data
    Body: { format: 'json' | 'csv', dateRange?, entities: string[] }
    Response: { downloadUrl: string }

  POST /functions/v1/api-tasks
    Body: { action: 'create'|'update'|'complete'|'archive', data: any }
    Response: { task: Task }
    Purpose: Business logic validation (e.g., auto-complete parent when all subtasks done)
```
