# Backup & Disaster Recovery — Detailed Security Design

**Source:** Extracted from Agent 4 Security & Reliability spec, Sections 12 + 13
**Parent:** [Agent-4-Security-Reliability-Engineer.md](../Agent-4-Security-Reliability-Engineer.md)

---

# 12. Backup Strategy

## 12.1 The Problem

```
YOUR MAC MINI IS A SINGLE POINT OF FAILURE.

  If it dies, you lose:
    ✗ All journal entries (irreplaceable personal memories)
    ✗ All project files and notes
    ✗ All task history and routines
    ✗ All agent definitions and customizations
    ✗ All conversation history with AI
    ✗ The Soul file (your AI's understanding of you)
    ✗ All media files stored in the Vault

  This is UNACCEPTABLE per our risk appetite (§2.2).
```

## 12.2 Backup Architecture (3-2-1 Rule)

```
THE 3-2-1 BACKUP RULE:
  3 copies of your data
  2 different storage media
  1 off-site (different physical location)

IMPLEMENTATION:

  COPY 1: Live data on Mac Mini SSD (primary)
    └── ~/Kaivoo/ (Vault + .kaivoo/)

  COPY 2: Time Machine to external drive (local backup)
    └── Connected USB/Thunderbolt drive
    └── Automatic hourly snapshots
    └── Keeps history going back months

  COPY 3: Encrypted cloud sync (off-site backup)
    └── Option A: Backblaze B2 (cheapest, ~$0.005/GB/month)
    └── Option B: iCloud Drive (if already paying for iCloud+)
    └── Option C: Encrypted rsync to another machine
    └── ALWAYS encrypted before upload
```

## 12.3 Backup Tiers

### Tier 1: Time Machine (Automatic, Local)

```
SETUP:
  □ Connect external drive (recommend 1TB+ SSD for speed)
  □ Enable Time Machine in System Preferences
  □ Include ~/Kaivoo/ in backup scope
  □ Verify Time Machine is running (check menu bar icon)

WHAT IT COVERS:
  ✓ Complete file system snapshot every hour
  ✓ Point-in-time recovery (go back to any hour)
  ✓ Handles accidental deletes and file corruption
  ✓ Automatic, zero-maintenance

LIMITATIONS:
  ✗ Same physical location — fire, theft, flood destroys both
  ✗ External drive failure = backup lost
  ✗ Not a disaster recovery solution on its own
```

### Tier 2: SQLite Automated Backup (Application-Level)

```typescript
// Hub server runs automated SQLite backups
import { execSync } from 'child_process';
import { resolve } from 'path';

const DB_PATH = resolve(KAIVOO_DIR, 'kaivoo.db');
const BACKUP_DIR = resolve(KAIVOO_DIR, 'backups');

async function backupDatabase() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = resolve(BACKUP_DIR, `kaivoo-${timestamp}.db`);

  // Use SQLite's online backup API (safe even during writes)
  db.exec(`VACUUM INTO '${backupPath}'`);

  // Keep last 7 daily backups + last 4 weekly backups
  cleanOldBackups(BACKUP_DIR, {
    dailyKeep: 7,
    weeklyKeep: 4,
  });

  logger.info(`Database backed up to ${backupPath}`);
}

// Run every 6 hours
setInterval(backupDatabase, 6 * 60 * 60 * 1000);

// Also backup on graceful shutdown
process.on('SIGTERM', async () => {
  await backupDatabase();
  process.exit(0);
});
```

### Tier 3: Encrypted Off-Site Sync (Disaster Recovery)

```bash
# Option A: Backblaze B2 with rclone (recommended — cheapest)

# Install rclone
brew install rclone

# Configure Backblaze B2 backend
rclone config
# Choose: Backblaze B2
# Enter: account ID + application key
# Enable: server-side encryption (or use rclone crypt)

# Create encrypted remote
rclone config
# Choose: Encrypt/Decrypt a remote (crypt)
# Remote: b2:kaivoo-backup
# Password: [strong passphrase — store in password manager]
# Salt: [random salt — store in password manager]

# Sync script (run daily via cron/launchd)
#!/bin/bash
# kaivoo-backup.sh
VAULT_PATH="$HOME/Kaivoo"
REMOTE="kaivoo-crypt:"

# Sync vault files (encrypted)
rclone sync "$VAULT_PATH" "$REMOTE/vault" \
  --exclude ".kaivoo/logs/**" \
  --exclude "node_modules/**" \
  --transfers 4 \
  --log-file "$VAULT_PATH/.kaivoo/logs/backup.log" \
  --log-level INFO

echo "Backup completed: $(date)" >> "$VAULT_PATH/.kaivoo/logs/backup.log"
```

```bash
# Option B: iCloud Drive sync (simplest if already using iCloud+)
# The Vault already lives in iCloud Drive if the project folder is there.
# HOWEVER: iCloud is NOT encrypted with your own key.
#
# For sensitive data, use Cryptomator to create an encrypted vault
# within iCloud Drive:
#   brew install --cask cryptomator
#   Create vault in ~/Library/Mobile Documents/com~apple~CloudDocs/KaivooBackup/
#   Mount, sync .kaivoo/ directory into it
```

```bash
# Option C: rsync to another machine on your network
# If you have another Mac/NAS on your network:
rsync -avz --delete \
  --exclude ".kaivoo/logs/" \
  --exclude "node_modules/" \
  ~/Kaivoo/ \
  user@other-machine:/backup/kaivoo/
```

## 12.4 Backup Schedule Summary

| Backup | Frequency | Retention | Off-site? | Automated? |
|--------|-----------|-----------|-----------|------------|
| Time Machine | Hourly | Months | No | Yes |
| SQLite VACUUM INTO | Every 6 hours | 7 daily + 4 weekly | No | Yes |
| Git auto-commit (Vault .md files) | Every 5 min (active) | Full history | No | Yes |
| Encrypted cloud sync (rclone/B2) | Daily | 30 days | Yes | Yes (cron) |
| Manual full export | Monthly | Keep 3 | Yes (cloud) | No |

## 12.5 What to Backup (Priority Order)

```
CRITICAL (irreplaceable):
  ├── Journal/                    Daily journal .md files
  ├── Projects/                   All project files and notes
  ├── .kaivoo/kaivoo.db          Tasks, routines, meetings, metadata
  ├── .kaivoo/soul.md            AI personality/memory
  ├── .kaivoo/agents/            Custom agent definitions
  ├── .kaivoo/skills/            Custom skill definitions
  ├── .kaivoo/config.json        Hub configuration
  └── .kaivoo/ai-providers.json  API keys (encrypted)

IMPORTANT (hard to recreate):
  ├── Library/                    Books, research, references
  ├── Brand Guidelines/           Brand assets
  ├── .kaivoo/plugins/           Custom widgets and MCPs
  ├── .kaivoo/conversations/     AI conversation history
  └── .kaivoo/backups/           SQLite backup copies

REPLACEABLE (can reinstall/re-download):
  ├── node_modules/              npm install recreates these
  ├── .kaivoo/logs/              Useful but not critical
  └── Inbox/                     Temporary captures (should be triaged)
```

---

# 13. Disaster Recovery

## 13.1 Recovery Targets

```
RPO (Recovery Point Objective): How much data can you lose?
  Target: ≤ 1 hour
  Achieved by: Time Machine hourly + SQLite backup every 6 hours
  Worst case: Up to 6 hours of SQLite data if Time Machine also fails

RTO (Recovery Time Objective): How fast can you be back online?
  Target: ≤ 4 hours
  Achieved by: Pre-documented recovery procedures below
  Includes: New Mac Mini setup if hardware replacement needed
```

## 13.2 Scenario Playbooks

### Scenario A: Power Outage (Mac Mini Shuts Down Unexpectedly)

```
IMPACT: Low to Medium
  - SQLite WAL mode protects against corruption
  - Files in mid-write may be incomplete
  - Hub server stops, clients lose connection

RECOVERY:
  1. Power returns → Mac Mini auto-boots (configure in System Preferences)
  2. PM2 auto-restarts Hub server
  3. SQLite runs integrity check on startup
  4. If integrity check passes → normal operation resumes
  5. If integrity check fails → restore from latest .kaivoo/backups/

PREVENTION:
  □ UPS battery backup ($50-100) — keeps Mini running for 15-30 min
  □ PM2 configured for auto-restart
  □ macOS: System Preferences → Energy → Start up after power failure: ON
  □ SQLite WAL mode + synchronous=NORMAL
```

### Scenario B: SSD Failure (Mac Mini Storage Dies)

```
IMPACT: Critical
  - All live data on Mac Mini is lost
  - Mac Mini cannot boot

RECOVERY (if Time Machine drive survives):
  1. Get replacement Mac Mini or repair SSD
  2. Boot from macOS Recovery
  3. Restore from Time Machine backup
  4. Verify ~/Kaivoo/ is intact
  5. Restart Hub server via PM2
  6. Full recovery in ~2-4 hours

RECOVERY (if Time Machine drive also fails):
  1. Get replacement Mac Mini
  2. Install macOS, Node.js, PM2, Ollama, Tailscale
  3. Install rclone, configure B2 remote
  4. Restore from encrypted cloud backup:
     rclone sync kaivoo-crypt: ~/Kaivoo/
  5. Restore SQLite from backup:
     cp ~/Kaivoo/.kaivoo/backups/latest.db ~/Kaivoo/.kaivoo/kaivoo.db
  6. npm install in Hub server directory
  7. pm2 start ecosystem.config.js
  8. Full recovery in ~2-4 hours (depending on download speed)
```

### Scenario C: Accidental Data Deletion

```
IMPACT: Medium
  - User or AI agent deletes important files

RECOVERY (within trash retention):
  1. Check .kaivoo/trash/ — file may be there (30-day retention)
  2. Restore from trash via UI or manually move file back

RECOVERY (past trash retention or permanent delete):
  1. Time Machine: Enter Time Machine → navigate to date → restore file
  2. Git: git log --all -- path/to/file → git restore --source=HASH path/to/file
  3. Cloud backup: rclone copy kaivoo-crypt:vault/path/to/file ~/Kaivoo/path/to/

PREVENTION:
  - Soft delete via trash (§6.4)
  - Git versioning for .md files (§6.5)
  - AI agents blocked from permanent deletes
```

### Scenario D: Mac Mini Stolen

```
IMPACT: Critical (data exposure + data loss)

IMMEDIATE:
  1. Use Find My Mac to remotely lock or wipe the device
  2. FileVault encryption protects data at rest (attacker needs password)
  3. Rotate ALL API keys immediately:
     - Supabase project keys
     - Anthropic API key
     - OpenAI API key
     - Any other AI provider keys
  4. Revoke Tailscale device from Tailscale admin panel
  5. Change Supabase Auth password

RECOVERY:
  1. Get replacement Mac Mini
  2. Restore from encrypted cloud backup (Scenario B procedure)
  3. Generate new API keys and update ai-providers.json

PREVENTION:
  - FileVault encryption (data unreadable without password)
  - Strong login password (not a PIN)
  - Find My Mac enabled
  - Physical security (locked room, cable lock if needed)
```

### Scenario E: SQLite Database Corruption

```
IMPACT: High (tasks, routines, meetings lost — files are safe)

DETECTION:
  - Hub server runs PRAGMA integrity_check on startup
  - If check fails, log ALERT and attempt recovery

RECOVERY:
  1. Stop Hub server
  2. Attempt: sqlite3 kaivoo.db ".recover" | sqlite3 recovered.db
  3. If .recover works → replace kaivoo.db with recovered.db
  4. If .recover fails → restore from .kaivoo/backups/latest.db
  5. Restart Hub server
  6. Some recent data may be lost (up to 6 hours)

PREVENTION:
  - WAL mode (crash-resistant)
  - VACUUM INTO backup every 6 hours
  - Integrity check on every startup
```

## 13.3 Recovery Priority Order

```
When restoring from backup, restore in this order:

  1. ~/Kaivoo/.kaivoo/config.json        (Hub can start)
  2. ~/Kaivoo/.kaivoo/kaivoo.db          (Dashboard works)
  3. ~/Kaivoo/Journal/                    (Journal entries)
  4. ~/Kaivoo/Projects/                   (Project files)
  5. ~/Kaivoo/.kaivoo/soul.md            (AI personalization)
  6. ~/Kaivoo/.kaivoo/agents/            (Custom agents)
  7. ~/Kaivoo/.kaivoo/ai-providers.json  (AI features)
  8. ~/Kaivoo/Library/                    (Reference files)
  9. ~/Kaivoo/.kaivoo/plugins/           (Custom plugins)
  10. ~/Kaivoo/.kaivoo/conversations/    (AI history)
```
