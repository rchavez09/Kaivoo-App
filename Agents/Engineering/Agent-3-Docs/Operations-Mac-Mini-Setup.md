*Extracted from Agent 3 spec — February 22, 2026*

# Mac Mini Hub Setup Checklist

```
HARDWARE:
  □ Mac Mini M-series, 16GB RAM, 512GB SSD
  □ Ethernet connection (preferred over WiFi for reliability)
  □ UPS battery backup — REQUIRED (e.g., APC Back-UPS 425VA ~$50)
    Prevents data corruption on power loss. See Agent 4 §12, Appendix A.
  □ External SSD/HDD for Time Machine backup — REQUIRED

SOFTWARE:
  □ macOS (latest stable)
  □ Xcode Command Line Tools
  □ Homebrew
  □ Node.js 20 LTS (via nvm)
  □ PM2 (npm install -g pm2)
  □ Ollama (https://ollama.ai)
  □ Tailscale (https://tailscale.com)
  □ Git (for file versioning)
  □ rclone (for encrypted off-site backup)

SECURITY (see Agent 4 for full details):
  □ FileVault: ENABLED — non-negotiable for personal data
  □ macOS Firewall: ON + Stealth Mode
  □ Find My Mac: ON (remote wipe if stolen)
  □ Auto-login: DISABLED
  □ Remote Login (SSH): DISABLED
  □ Screen sharing: DISABLED
  □ Strong login password (12+ characters)
  □ Store FileVault recovery key in password manager (NOT on Mac Mini)

BACKUP (see Agent 4 §12-13 for full strategy):
  □ Time Machine to external drive (hourly, automatic)
  □ Encrypted cloud sync via rclone + Backblaze B2 (daily, automated)
  □ SQLite VACUUM INTO backup (every 6 hours, automated by Hub server)

OLLAMA MODELS (16GB RAM budget):
  □ llama3:8b (~4.7GB) — Concierge router, auto-tagging, quick tasks
  □ nomic-embed-text (~274MB) — Embedding generation for semantic search
  □ Total: ~5GB VRAM usage, leaves headroom for the app

NETWORK:
  □ Tailscale installed on Mac Mini + all access devices
  □ OR: Cloudflare Tunnel configured with domain
  □ Static IP or DHCP reservation on local network
  □ Energy Saver: prevent Mac from sleeping ("caffeinate" or System Preferences)
  □ Bind Express server to Tailscale IP only (never 0.0.0.0)
  □ Configure Tailscale ACLs to restrict device access
```
