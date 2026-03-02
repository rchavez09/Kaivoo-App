# Incident Response Playbook — Detailed Security Design

**Source:** Extracted from Agent 4 Security & Reliability spec, Section 15 + Appendices A/B/C
**Parent:** [Agent-4-Security-Reliability-Engineer.md](../Agent-4-Security-Reliability-Engineer.md)

---

# 15. Incident Response Playbook

## 16.1 Detection → Response Flow

```
  DETECT
    │  Health check fails, alert fires, or suspicious log entry
    ▼
  ASSESS
    │  What happened? What data is affected? Is it ongoing?
    ▼
  CONTAIN
    │  Stop the bleeding: kill process, revoke key, block access
    ▼
  RECOVER
    │  Restore from backup, fix vulnerability, restart services
    ▼
  REVIEW
    │  What caused it? Update procedures to prevent recurrence
    ▼
  DOCUMENT
       Record in .kaivoo/logs/incidents/ for future reference
```

## 16.2 Emergency Contacts & Resources

```
IMMEDIATE ACTIONS CHEAT SHEET:

  Stop Hub server:
    pm2 stop all

  Revoke Tailscale device:
    https://login.tailscale.com/admin/machines

  Rotate Supabase keys:
    https://supabase.com/dashboard → Settings → API

  Rotate Anthropic key:
    https://console.anthropic.com/settings/keys

  Rotate OpenAI key:
    https://platform.openai.com/api-keys

  Remote wipe Mac Mini:
    https://www.icloud.com/find

  Restore from Time Machine:
    Boot → hold Option → select Time Machine drive

  Restore from cloud backup:
    rclone sync kaivoo-crypt: ~/Kaivoo/
```

---

# Appendix A: UPS Battery Backup Recommendation

```
WHY:
  A UPS protects against the most common failure: power outage.
  Without a UPS, a sudden power loss during a SQLite write or
  file save can corrupt data.

RECOMMENDED:
  APC Back-UPS 425VA (BE425M) — ~$50
    - Powers Mac Mini for ~15-30 minutes
    - Enough time for graceful shutdown
    - USB connection for auto-shutdown signal

  Configure macOS:
    System Preferences → Battery → UPS
    → Shut down after UPS battery reaches 20%
    → OR: Install apcupsd for more control

  This single purchase eliminates the #2 most likely threat (T2).
```

---

# Appendix B: Backup Automation (launchd)

```xml
<!-- ~/Library/LaunchAgents/com.kaivoo.backup.plist -->
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN"
  "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>com.kaivoo.backup</string>
  <key>ProgramArguments</key>
  <array>
    <string>/bin/bash</string>
    <string>/Users/kaivoo-hub/Kaivoo/.kaivoo/scripts/backup.sh</string>
  </array>
  <key>StartCalendarInterval</key>
  <dict>
    <key>Hour</key>
    <integer>3</integer>
    <key>Minute</key>
    <integer>0</integer>
  </dict>
  <key>StandardOutPath</key>
  <string>/Users/kaivoo-hub/Kaivoo/.kaivoo/logs/backup-stdout.log</string>
  <key>StandardErrorPath</key>
  <string>/Users/kaivoo-hub/Kaivoo/.kaivoo/logs/backup-stderr.log</string>
</dict>
</plist>
```

```bash
# Load the backup schedule
launchctl load ~/Library/LaunchAgents/com.kaivoo.backup.plist
```

---

# Appendix C: Quick Security Audit Script

```bash
#!/bin/bash
# kaivoo-security-audit.sh
# Run periodically to verify security posture

echo "=== Kaivoo Hub Security Audit ==="
echo "Date: $(date)"
echo ""

# FileVault
echo "--- FileVault ---"
sudo fdesetup status
echo ""

# Firewall
echo "--- Firewall ---"
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --getglobalstate
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --getstealthmode
echo ""

# File Permissions
echo "--- File Permissions ---"
echo "Vault root:"
ls -la ~/Kaivoo/ | head -5
echo "Config files:"
ls -la ~/Kaivoo/.kaivoo/ai-providers.json 2>/dev/null || echo "Not found"
ls -la ~/Kaivoo/.kaivoo/config.json 2>/dev/null || echo "Not found"
ls -la ~/Kaivoo/.kaivoo/kaivoo.db 2>/dev/null || echo "Not found"
echo ""

# Listening Ports
echo "--- Open Ports ---"
lsof -i -P -n | grep LISTEN | grep -v "^com.apple"
echo ""

# npm Audit
echo "--- npm Audit ---"
cd ~/Kaivoo/.kaivoo/hub-server && npm audit --production 2>/dev/null || echo "Hub server not found"
echo ""

# Backup Status
echo "--- Backup Status ---"
echo "Time Machine:"
tmutil latestbackup 2>/dev/null || echo "No Time Machine backup found"
echo "SQLite Backups:"
ls -lt ~/Kaivoo/.kaivoo/backups/*.db 2>/dev/null | head -3 || echo "No SQLite backups"
echo "Cloud Backup Log:"
tail -1 ~/Kaivoo/.kaivoo/logs/backup.log 2>/dev/null || echo "No backup log"
echo ""

# Disk Space
echo "--- Disk Space ---"
df -h / | tail -1
echo ""

echo "=== Audit Complete ==="
```
