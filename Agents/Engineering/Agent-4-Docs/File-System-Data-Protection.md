# File System & Data Protection — Detailed Security Design

**Source:** Extracted from Agent 4 Security & Reliability spec, Sections 6 + 10
**Parent:** [Agent-4-Security-Reliability-Engineer.md](../Agent-4-Security-Reliability-Engineer.md)

---

# 6. File System & Data Protection

## 6.1 Encryption at Rest

| Layer | Protection |
|-------|-----------|
| **Full Disk Encryption** | macOS FileVault — **REQUIRED, non-negotiable** |
| **SQLite database** | Encrypted via FileVault (whole-disk). Optional: SQLCipher for DB-level encryption |
| **AI provider keys** | FileVault + file permissions (chmod 600) |
| **.kaivoo directory** | FileVault + restricted file permissions |

```bash
# Verify FileVault is enabled
sudo fdesetup status
# Expected: FileVault is On.

# If not enabled:
sudo fdesetup enable
# CRITICAL: Store recovery key securely (password manager, NOT on the Mac Mini)
```

## 6.2 File Permission Hardening

```bash
# Vault directory — user read/write only
chmod 700 ~/Kaivoo
chmod -R u=rwX,go= ~/Kaivoo

# Config directory — user read/write only
chmod 700 ~/Kaivoo/.kaivoo
chmod 600 ~/Kaivoo/.kaivoo/ai-providers.json
chmod 600 ~/Kaivoo/.kaivoo/config.json
chmod 600 ~/Kaivoo/.kaivoo/kaivoo.db

# PM2 and Node processes run as the same user (no root)
# NEVER run the Hub server as root
```

## 6.3 SQLite Integrity Protection

```typescript
// WAL mode for crash resistance
db.pragma('journal_mode = WAL');

// Synchronous NORMAL for balance of safety and performance
// FULL is safest but slower — use if on UPS power
db.pragma('synchronous = NORMAL');

// Integrity check on startup
const result = db.pragma('integrity_check');
if (result[0].integrity_check !== 'ok') {
  logger.error('DATABASE INTEGRITY CHECK FAILED', result);
  // Alert user, attempt recovery from backup
}

// Auto-checkpoint WAL every 1000 pages
db.pragma('wal_autocheckpoint = 1000');
```

## 6.4 Soft Delete & Trash System

```
DELETION FLOW:
  User/Agent requests delete
    │
    ▼
  Move to .kaivoo/trash/ (with timestamp prefix)
    │
    ▼
  Retain for 30 days
    │
    ▼
  Auto-purge after 30 days (cron job)

SAFETY:
  - No immediate permanent deletes via API
  - Trash is included in backups
  - Recovery: move file from trash back to original location
  - Audit log records who/what triggered the delete
```

## 6.5 File Versioning (Optional but Recommended)

```bash
# Initialize git in the Vault for version history
cd ~/Kaivoo
git init
git add -A
git commit -m "Initial vault state"

# Hub server auto-commits on meaningful changes
# (not every keystroke — batch commits every 5 minutes or on file save)
```

```typescript
// Auto-commit on file changes (debounced)
import simpleGit from 'simple-git';

const git = simpleGit(VAULT_ROOT);
let commitTimer: NodeJS.Timeout;

function scheduleCommit() {
  clearTimeout(commitTimer);
  commitTimer = setTimeout(async () => {
    const status = await git.status();
    if (!status.isClean()) {
      await git.add('-A');
      await git.commit(`Auto-save ${new Date().toISOString()}`);
    }
  }, 5 * 60 * 1000); // Commit every 5 minutes of activity
}
```

---

# 10. macOS Host Hardening

## 10.1 Required macOS Settings

```
CRITICAL:
  □ FileVault: ON (full-disk encryption)
  □ Firewall: ON + Stealth Mode
  □ Auto-login: DISABLED (require password after sleep/screensaver)
  □ Remote Login (SSH): DISABLED (unless needed, then key-only)
  □ Screen sharing: DISABLED
  □ AirDrop: DISABLED
  □ Automatic Updates: ON (security updates)
  □ Gatekeeper: ON (App Store + identified developers)
  □ SIP (System Integrity Protection): ON (never disable)

RECOMMENDED:
  □ Firmware password: SET (prevents boot from external media)
  □ Find My Mac: ON (remote wipe capability if stolen)
  □ Login window: Show name and password (not user list)
  □ Require password immediately after sleep
  □ Lock screen after 5 minutes of inactivity
  □ Disable Bluetooth if not needed
  □ Use a dedicated macOS user account for Kaivoo Hub
```

## 10.2 Process Isolation

```
KAIVOO PROCESSES:

  User: kaivoo-hub (dedicated macOS user — recommended)

  Processes:
    PM2 → node hub-server.js    (Express + WebSocket)
    PM2 → ollama serve          (Local LLM — separate process)

  DO NOT:
    - Run Hub as root
    - Run Hub as the admin user (create dedicated user)
    - Give Hub user sudo privileges
    - Store personal files in Hub user's home directory
```
