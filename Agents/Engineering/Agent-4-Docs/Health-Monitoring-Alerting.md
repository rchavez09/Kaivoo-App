# Health Monitoring & Alerting — Detailed Security Design

**Source:** Extracted from Agent 4 Security & Reliability spec, Sections 14 + 11
**Parent:** [Agent-4-Security-Reliability-Engineer.md](../Agent-4-Security-Reliability-Engineer.md)

---

# 14. Health Monitoring & Alerting

## 14.1 Health Check Endpoint

```typescript
// GET /api/health — used by monitoring and clients
app.get('/api/health', async (req, res) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    checks: {
      database: await checkDatabase(),
      fileSystem: await checkFileSystem(),
      ollama: await checkOllama(),
      diskSpace: await checkDiskSpace(),
      lastBackup: await checkLastBackup(),
    },
  };

  const allOk = Object.values(health.checks).every(c => c.status === 'ok');
  health.status = allOk ? 'ok' : 'degraded';

  res.status(allOk ? 200 : 503).json(health);
});

async function checkDiskSpace() {
  // Alert if less than 10% free space
  const { free, total } = await getDiskUsage('/');
  const percentFree = (free / total) * 100;
  return {
    status: percentFree > 10 ? 'ok' : 'warning',
    free_gb: (free / 1e9).toFixed(1),
    percent_free: percentFree.toFixed(1),
  };
}

async function checkLastBackup() {
  // Alert if no backup in last 24 hours
  const backups = await getBackupFiles();
  const latest = backups[0];
  const hoursSinceBackup = latest
    ? (Date.now() - latest.mtime) / (1000 * 60 * 60)
    : Infinity;
  return {
    status: hoursSinceBackup < 24 ? 'ok' : 'warning',
    last_backup: latest?.name,
    hours_ago: hoursSinceBackup.toFixed(1),
  };
}
```

## 14.2 Dashboard Health Widget

```
The Dashboard should include a "System Health" widget showing:

  ┌─────────────────────────────────────┐
  │  System Health                      │
  │                                     │
  │  ● Server       Online (3d 14h)     │
  │  ● Database     Healthy             │
  │  ● Disk Space   412 GB free (80%)   │
  │  ● Last Backup  2 hours ago         │
  │  ● Ollama       Running (llama3)    │
  │  ● Tailscale    Connected (3 peers) │
  │                                     │
  │  ⚠ 1 Warning: Cloud backup overdue  │
  └─────────────────────────────────────┘
```

## 14.3 Alerting

```
ALERT CHANNELS:
  - Dashboard notification (Sonner toast)
  - System notification (macOS Notification Center via node-notifier)
  - Optional: Email via Supabase Edge Function
  - Optional: Pushover/Ntfy for mobile push notifications

ALERT CONDITIONS:
  - Disk space < 10% free
  - Database integrity check failed
  - No successful backup in 24 hours
  - Ollama not responding
  - Hub server crash/restart (PM2 event)
  - 5+ auth failures in 10 minutes
  - AI agent execution error
  - Rate limit exceeded
```

---

# 11. Logging, Audit Trail & Monitoring

## 11.1 What Gets Logged

| Event | Log Level | Details |
|-------|-----------|---------|
| Auth success/failure | INFO/WARN | IP, timestamp, user agent |
| API requests | INFO | Method, path, status, latency |
| File operations | INFO | Action (create/update/delete), path, size |
| AI agent invocations | INFO | Agent name, provider, tokens used, duration |
| AI agent file writes | WARN | Agent name, file path, file size |
| Permission denials | WARN | What was blocked, why, who triggered |
| Workshop builds | WARN | What was built, approval status, build log |
| Plugin installs | WARN | Plugin name, version, npm audit results |
| Errors | ERROR | Stack trace, request context |
| Security events | ALERT | Rate limit hits, path traversal attempts, auth failures |

## 11.2 Log Storage

```
LOGS:
  Location: .kaivoo/logs/
  Format: JSON lines (one JSON object per line)
  Rotation: Daily, retain 90 days
  Max size: 100MB per file, auto-rotate

  Files:
    .kaivoo/logs/hub-YYYY-MM-DD.log          (general server logs)
    .kaivoo/logs/audit-YYYY-MM-DD.log         (security audit trail)
    .kaivoo/logs/ai-YYYY-MM-DD.log            (AI agent activity)

  IMPORTANT:
    - Logs NEVER contain API keys, passwords, or JWT tokens
    - Logs included in backups
    - Logs viewable via Settings > Security > Audit Log (future UI)
```

## 11.3 AI Action Audit Trail

```typescript
// Every AI agent action is logged to SQLite AND log file
interface AIAuditEntry {
  id: string;
  timestamp: string;
  agent_name: string;
  action_type: 'read' | 'write' | 'delete' | 'execute' | 'api_call';
  target_path?: string;
  ai_provider: string;
  ai_model: string;
  tokens_used: { input: number; output: number };
  duration_ms: number;
  approval_status: 'auto' | 'user_approved' | 'user_denied';
  result: 'success' | 'error' | 'blocked';
  error_message?: string;
}
```
