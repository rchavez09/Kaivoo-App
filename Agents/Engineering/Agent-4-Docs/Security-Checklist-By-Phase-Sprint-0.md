# Security Checklist by Phase

*Extracted from Agent 4 spec — February 22, 2026*
*This is a phased implementation plan, not a role definition.*

## Phase 0: Architecture & Setup

```
- [ ] Enable FileVault on Mac Mini
- [ ] Set strong login password (12+ characters)
- [ ] Enable macOS Firewall + Stealth Mode
- [ ] Disable Remote Login, Screen Sharing, AirDrop
- [ ] Install Tailscale, configure Tailnet
- [ ] Enable Find My Mac
- [ ] Set up Time Machine with external drive
- [ ] Create dedicated macOS user for Hub (optional but recommended)
- [ ] Configure auto-boot on power restore
- [ ] Purchase and connect UPS battery backup
- [ ] Store FileVault recovery key in password manager
```

## Phase 1: Vault + File Browser

```
- [ ] Implement path traversal prevention (safePath function)
- [ ] Block .kaivoo/ access via Vault API
- [ ] Set file permissions (chmod 700 ~/Kaivoo)
- [ ] Implement soft delete + trash system
- [ ] Initialize git in Vault (version history)
- [ ] Add rate limiting middleware
- [ ] Add CORS restrictions
- [ ] Add security response headers (CSP, etc.)
- [ ] Implement input validation (Zod) on all endpoints
- [ ] Add request logging (audit trail)
```

## Phase 2: Journal on Disk

```
- [ ] Validate journal date paths (no traversal)
- [ ] Sanitize markdown content (prevent XSS if rendered as HTML)
- [ ] Set max file size limits for journal entries
```

## Phase 3: Dashboard Migration

```
- [ ] Migrate JWT from localStorage to httpOnly cookies
- [ ] Implement CSRF protection (SameSite=Strict + custom header)
- [ ] Add WebSocket authentication (JWT on handshake)
- [ ] Implement SQLite WAL mode + integrity checks
- [ ] Set up automated SQLite backups (every 6 hours)
- [ ] Implement brute force protection on auth endpoints
```

## Phase 4: The Concierge — AI Orchestration

```
- [ ] Implement agent permission model (Levels 0-3)
- [ ] Build agent sandboxing (scoped file access)
- [ ] Add prompt injection defenses (system prompt boundaries)
- [ ] Validate all agent outputs before execution
- [ ] Protect Soul file as read-only for agents
- [ ] Log all AI actions to audit trail
- [ ] Implement agent timeout limits
- [ ] Add AI rate limiting per provider
```

## Phase 5-6: Theater + RAG

```
- [ ] Validate file types before rendering (no executable files)
- [ ] Sanitize embedded content (PDF.js, video sources)
- [ ] Rate limit embedding generation
- [ ] Restrict RAG search to Vault content only
```

## Phase 7: Remote Access + Polish

```
- [ ] Enable Tailscale HTTPS (auto-TLS)
- [ ] Configure Tailscale ACLs (restrict device access)
- [ ] Set up encrypted cloud backup (rclone + B2)
- [ ] Schedule daily cloud backup (launchd/cron)
- [ ] Test full disaster recovery procedure
- [ ] Verify backup restoration works
- [ ] Add health monitoring endpoint
- [ ] Add System Health widget to Dashboard
```

## Phase 8: The Workshop — Developer Mode

```
- [ ] Implement iframe sandboxing for widgets
- [ ] Implement child_process isolation for MCPs
- [ ] Add npm audit before plugin dependency install
- [ ] Isolate plugin node_modules
- [ ] Implement approval gates (Level 1 = review plan, Level 2 = review code)
- [ ] Add build-log.json with rollback capability
- [ ] Block plugins from accessing .kaivoo/ or Hub node_modules
- [ ] Implement resource limits (memory, CPU, execution time)
- [ ] Test Workshop security: can a malicious agent escape sandbox?
```
