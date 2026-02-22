# Agent 4: Security & Reliability Engineer — Kaivoo Hub Defense Blueprint
## Threat Model, Data Protection & Disaster Recovery · Specification v1.0

**Role:** Security & Reliability Engineer
**Mission:** Define a comprehensive security posture, threat model, backup strategy, and disaster recovery plan for Kaivoo Hub — ensuring that a self-hosted personal AI operating system running on a single Mac Mini is resilient against data loss, unauthorized access, supply chain compromise, and AI agent misuse.

**Date:** February 2026
**Status:** APPROVED — Ready for implementation
**Applies to:** All systems (Vault, Journal, Dashboard, Concierge, Theater, Workshop)

---

# Table of Contents

1. [Security Philosophy](#1-security-philosophy)
2. [Threat Model](#2-threat-model)
3. [Network Security](#3-network-security)
4. [Authentication & Session Management](#4-authentication--session-management)
5. [API & Endpoint Security](#5-api--endpoint-security)
6. [File System & Data Protection](#6-file-system--data-protection)
7. [AI Agent & Workshop Sandboxing](#7-ai-agent--workshop-sandboxing)
8. [Secrets & Key Management](#8-secrets--key-management)
9. [Dependency & Supply Chain Security](#9-dependency--supply-chain-security)
10. [macOS Host Hardening](#10-macos-host-hardening)
11. [Logging, Audit Trail & Monitoring](#11-logging-audit-trail--monitoring)
12. [Backup Strategy](#12-backup-strategy)
13. [Disaster Recovery](#13-disaster-recovery)
14. [Health Monitoring & Alerting](#14-health-monitoring--alerting)
15. [Security Checklist by Phase](#15-security-checklist-by-phase)
16. [Incident Response Playbook](#16-incident-response-playbook)

---

# 1. Security Philosophy

## 1.1 Guiding Principles

```
1. DEFENSE IN DEPTH
   No single control protects the system. Every layer — network,
   auth, file system, application, AI — has its own security
   boundary. If one fails, the next catches it.

2. LEAST PRIVILEGE
   Every process, agent, and plugin gets the minimum permissions
   it needs. AI agents cannot access files outside their scope.
   Plugins run in sandboxed contexts.

3. DATA SOVEREIGNTY THROUGH RESILIENCE
   Owning your data means protecting your data. Local-first
   doesn't mean unprotected. Backups are not optional — they
   are the core guarantee of the "you own your data" promise.

4. ASSUME BREACH, PLAN RECOVERY
   Hardware fails. SSDs die. Power goes out. The question is
   not "if" but "when." Recovery time and data loss targets
   must be defined and tested.

5. TRANSPARENCY OVER OBSCURITY
   Security controls are documented, auditable, and
   understandable. No black box security — you should
   know exactly what protects your data.
```

## 1.2 Risk Profile

Kaivoo Hub has a unique risk profile as a **single-user, self-hosted system**:

| Factor | Implication |
|--------|-------------|
| Single user | No multi-tenant isolation needed, but single point of failure |
| Self-hosted | No cloud provider redundancy, but full control |
| Local network | Reduced attack surface vs. public internet |
| AI agents with write access | Agents can modify files and execute code — highest risk vector |
| Workshop self-modification | The system can modify itself — requires strict guardrails |
| Personal data (journals, files) | High sensitivity — irreplaceable personal memories and work |
| Mac Mini as sole server | Single hardware failure = total downtime without backup plan |

---

# 2. Threat Model

## 2.1 Threat Matrix

| # | Threat | Likelihood | Impact | Mitigation Section |
|---|--------|-----------|--------|-------------------|
| T1 | **Hardware failure** (SSD death, Mac Mini failure) | Medium | Critical | §12, §13 |
| T2 | **Power outage** (data corruption mid-write) | Medium | High | §6, §12, §13 |
| T3 | **Network intrusion** via exposed port | Low (Tailscale) | Critical | §3 |
| T4 | **Stolen API keys** (AI provider credentials) | Low | High | §8 |
| T5 | **Malicious plugin/widget** (Workshop) | Medium | Critical | §7 |
| T6 | **AI agent prompt injection** | Medium | High | §7 |
| T7 | **Supply chain attack** (compromised npm package) | Low-Med | High | §9 |
| T8 | **Unauthorized physical access** | Low | Critical | §10 |
| T9 | **Accidental data deletion** (user or agent) | Medium | High | §6, §12 |
| T10 | **Session hijack** (stolen JWT) | Low | High | §4 |
| T11 | **Ransomware/malware on host** | Low | Critical | §10, §12 |
| T12 | **SQLite database corruption** | Low | High | §6, §12 |
| T13 | **Theft of Mac Mini** | Low | Critical | §6, §10, §13 |

## 2.2 Risk Appetite

```
UNACCEPTABLE:
  - Permanent data loss of journals, files, or project data
  - Unauthorized access to personal files from outside the Tailnet
  - AI agents silently exfiltrating data to external services
  - Unrecoverable system state after any single failure

TOLERABLE:
  - Brief downtime (< 4 hours) for hardware recovery
  - Loss of up to 1 hour of data in worst-case scenario
  - Temporary loss of AI features while maintaining file access
  - Manual intervention required for recovery (not fully automated)
```

---

# 3. Network Security

## 3.1 Network Architecture

```
INTERNET                        YOUR TAILNET (encrypted mesh)
┌─────────────┐                ┌──────────────────────────────────────┐
│             │                │                                      │
│  Public     │   BLOCKED      │  📱 Phone ◄──WireGuard──► Mac Mini  │
│  Internet   │───────X────── │  💻 Laptop ◄──WireGuard──► Mac Mini  │
│             │                │  🖥️ Desktop ◄──WireGuard──► Mac Mini │
│             │                │                                      │
└─────────────┘                └──────────────────────────────────────┘

NO PORTS OPEN TO PUBLIC INTERNET.
ALL TRAFFIC IS ENCRYPTED (WireGuard protocol).
ONLY TAILNET DEVICES CAN REACH THE HUB.
```

## 3.2 Network Controls

| Control | Implementation | Priority |
|---------|---------------|----------|
| No public ports | macOS Firewall ON, Stealth Mode enabled | Phase 0 |
| Tailscale-only access | Bind Express server to Tailscale IP only | Phase 0 |
| Tailscale ACLs | Restrict which devices can reach port 3000 | Phase 0 |
| HTTPS on Tailscale | Enable Tailscale HTTPS (auto-TLS via Let's Encrypt) | Phase 7 |
| DNS rebinding protection | Validate Host header on all requests | Phase 1 |
| Rate limiting | Express rate-limiter: 100 req/min general, 10 req/min AI | Phase 1 |
| CORS lockdown | Allow only Tailscale hostname as origin | Phase 1 |
| WebSocket auth | Require valid JWT on WS handshake, reject unauthenticated | Phase 3 |

## 3.3 Firewall Rules

```bash
# macOS Firewall (System Preferences → Network → Firewall)
# Enable firewall
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --setglobalstate on

# Enable stealth mode (don't respond to pings from unknown)
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --setstealthmode on

# Block all incoming except Tailscale
# Tailscale handles its own networking via userspace WireGuard
```

## 3.4 Express Server Binding

```typescript
// SECURITY: Bind ONLY to Tailscale interface, not 0.0.0.0
const TAILSCALE_IP = process.env.TAILSCALE_IP || '100.x.x.x';

app.listen(3000, TAILSCALE_IP, () => {
  console.log(`Hub listening on ${TAILSCALE_IP}:3000 (Tailscale only)`);
});

// NEVER: app.listen(3000) — this binds to all interfaces including LAN
```

## 3.5 Cloudflare Tunnel Hardening (If Used Instead of Tailscale)

```
If using Cloudflare Tunnel instead of Tailscale:
  □ Enable Cloudflare Access with email-based OTP
  □ Restrict to specific email addresses (your email only)
  □ Enable Cloudflare WAF rules
  □ Set session duration to 24 hours max
  □ Enable device posture checks if available
  □ Monitor Cloudflare Access logs for unauthorized attempts
```

---

# 4. Authentication & Session Management

## 4.1 Auth Architecture (Supabase Auth)

```
BROWSER                         HUB SERVER                  SUPABASE
  │                                 │                          │
  │  POST /auth/login               │                          │
  │  { email, password }            │                          │
  │────────────────────────────────►│                          │
  │                                 │  Verify credentials      │
  │                                 │─────────────────────────►│
  │                                 │  ◄─── JWT + Refresh ─────│
  │                                 │                          │
  │  ◄── Set httpOnly cookies ──────│                          │
  │  (access_token + refresh_token) │                          │
  │                                 │                          │
  │  GET /api/tasks                 │                          │
  │  Cookie: access_token=...       │                          │
  │────────────────────────────────►│                          │
  │                                 │  Validate JWT locally    │
  │                                 │  (verify signature +     │
  │                                 │   check expiry)          │
  │  ◄── 200 { tasks: [...] } ─────│                          │
```

## 4.2 Session Security Controls

| Control | Implementation |
|---------|---------------|
| **Token storage** | httpOnly, Secure, SameSite=Strict cookies — NOT localStorage |
| **Access token TTL** | 15 minutes (short-lived) |
| **Refresh token TTL** | 7 days, rotated on use |
| **Token validation** | Verify JWT signature + expiry on every API request |
| **Session revocation** | Supabase sign-out invalidates refresh token |
| **CSRF protection** | SameSite=Strict cookies + custom header check (X-Kaivoo-Client) |
| **Brute force protection** | Lock account after 5 failed attempts for 15 minutes |
| **Password requirements** | Minimum 12 characters, enforced by Supabase Auth settings |

## 4.3 Why httpOnly Cookies Over localStorage

```
CURRENT (Agent 3 spec): JWT in localStorage
  ❌ Accessible to any JavaScript on the page
  ❌ Vulnerable to XSS — any script can steal the token
  ❌ Plugin/widget JavaScript could exfiltrate tokens

RECOMMENDED: httpOnly Secure Cookies
  ✅ Not accessible to JavaScript (no document.cookie read)
  ✅ XSS cannot steal the token
  ✅ Automatically sent with requests (no manual header)
  ✅ SameSite=Strict prevents CSRF
  ⚠️ Requires Hub server to act as auth proxy (set/validate cookies)
```

**Migration note:** This is a **security upgrade to the Agent 3 spec.** The Hub server should proxy Supabase Auth and set httpOnly cookies instead of passing JWTs to the client.

---

# 5. API & Endpoint Security

## 5.1 Middleware Stack

```
Every request passes through this chain:

  Request
    │
    ▼
  ┌─────────────────────────────────────┐
  │  1. Rate Limiter                    │  100 req/min general
  │     (express-rate-limit)            │  10 req/min for AI endpoints
  ├─────────────────────────────────────┤
  │  2. CORS                            │  Tailscale hostname only
  │     (cors middleware)               │
  ├─────────────────────────────────────┤
  │  3. Auth Middleware                  │  Validate JWT from cookie
  │     (verify signature + expiry)     │  Reject if invalid → 401
  ├─────────────────────────────────────┤
  │  4. Input Validation                │  Zod schemas for all inputs
  │     (zod + express-validator)       │  Reject if invalid → 400
  ├─────────────────────────────────────┤
  │  5. Path Traversal Guard            │  Block ../ and symlink escape
  │     (resolve + startsWith check)    │  Reject if outside vault → 403
  ├─────────────────────────────────────┤
  │  6. Request Logging                 │  Log method, path, user, timestamp
  │     (morgan + custom audit logger)  │  AI operations logged in detail
  ├─────────────────────────────────────┤
  │  7. Route Handler                   │  Business logic
  └─────────────────────────────────────┘
```

## 5.2 Path Traversal Prevention (Critical for Vault)

The Vault API lets users read/write files. This is the highest-risk surface for path traversal attacks.

```typescript
import { resolve, normalize } from 'path';

const VAULT_ROOT = resolve(process.env.VAULT_PATH || '~/Kaivoo');

function safePath(userPath: string): string {
  // Normalize and resolve to absolute path
  const resolved = resolve(VAULT_ROOT, normalize(userPath));

  // CRITICAL: Ensure resolved path is inside vault root
  if (!resolved.startsWith(VAULT_ROOT + '/') && resolved !== VAULT_ROOT) {
    throw new ForbiddenError('Path traversal blocked');
  }

  // Block access to .kaivoo directory via Vault API
  const KAIVOO_DIR = resolve(VAULT_ROOT, '.kaivoo');
  if (resolved.startsWith(KAIVOO_DIR)) {
    throw new ForbiddenError('Access to .kaivoo directory denied');
  }

  return resolved;
}
```

## 5.3 Input Validation

```typescript
// Every API endpoint uses Zod schemas
import { z } from 'zod';

// Example: Task creation
const createTaskSchema = z.object({
  title: z.string().min(1).max(500).trim(),
  status: z.enum(['todo', 'doing', 'blocked', 'review', 'done']),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  due_date: z.string().datetime().optional(),
  tags: z.array(z.string().max(50)).max(20).optional(),
  topic_path: z.string().max(500).optional(),
});

// Example: File upload
const uploadSchema = z.object({
  path: z.string()
    .max(500)
    .refine(p => !p.includes('..'), 'Path traversal not allowed')
    .refine(p => !p.startsWith('/'), 'Absolute paths not allowed'),
  overwrite: z.boolean().default(false),
});
```

## 5.4 Response Security Headers

```typescript
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '0');  // Rely on CSP instead
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  res.setHeader('Content-Security-Policy',
    "default-src 'self'; " +
    "script-src 'self'; " +
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' blob: data:; " +
    "connect-src 'self' wss:; " +
    "font-src 'self'; " +
    "object-src 'none'; " +
    "base-uri 'self'; " +
    "form-action 'self';"
  );
  next();
});
```

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

# 7. AI Agent & Workshop Sandboxing

## 7.1 Why This Is the Highest Risk

```
THE RISK:
  The Concierge dispatches AI agents that can:
    - Read files from the Vault
    - Write files to the Vault
    - Execute code (Workshop builds)
    - Install npm packages (plugins)
    - Modify their own agent definitions

  A compromised or hallucinating agent could:
    - Delete critical files
    - Exfiltrate data via API calls
    - Install malicious packages
    - Modify other agents to propagate bad behavior
    - Overwrite the Soul file with manipulated context
```

## 7.2 Agent Permission Model

```
PERMISSION LEVELS:

  Level 0: READ-ONLY
    Can: Read files in specified directories
    Cannot: Write, delete, execute, network calls
    Use for: Research agents, analysis, search

  Level 1: READ + WRITE (SCOPED)
    Can: Read anywhere in Vault, write ONLY to Agent Workspace/
    Cannot: Delete outside workspace, execute, modify agents/skills
    Use for: Content creation agents (PPT creator, journal analyst)

  Level 2: READ + WRITE + EXECUTE (SUPERVISED)
    Can: All of Level 1, plus execute code in sandboxed environment
    Cannot: Modify .kaivoo/, access network, install global packages
    Requires: User approval gate (Level 1 or Level 2 in Workshop)
    Use for: Builder agents, plugin creators

  Level 3: FULL ACCESS (MANUAL APPROVAL ONLY)
    Can: Everything including .kaivoo/ modifications
    Requires: Explicit user approval for EACH action
    Use for: System maintenance, migration tasks
    NEVER: Automated or unattended
```

## 7.3 Agent Sandboxing Implementation

```typescript
// Each agent invocation gets a scoped context
interface AgentContext {
  agentName: string;
  permissionLevel: 0 | 1 | 2 | 3;
  readPaths: string[];          // Allowed read directories
  writePath: string;            // Single write directory
  maxFileSize: number;          // Max bytes per file write
  maxFiles: number;             // Max files per invocation
  allowNetwork: boolean;        // Can make external API calls
  allowExecute: boolean;        // Can run code
  timeout: number;              // Max execution time (ms)
}

// Example: PPT Creator Agent
const pptCreatorContext: AgentContext = {
  agentName: 'ppt-creator',
  permissionLevel: 1,
  readPaths: ['Brand Guidelines/', 'Projects/'],
  writePath: 'Agent Workspace/Presentations/',
  maxFileSize: 50 * 1024 * 1024,  // 50MB
  maxFiles: 10,
  allowNetwork: false,
  allowExecute: false,
  timeout: 5 * 60 * 1000,  // 5 minutes
};
```

## 7.4 Workshop Plugin Sandboxing

```
PLUGIN ISOLATION:

  Widgets (React components):
    - Run in an <iframe> with sandbox attributes
    - sandbox="allow-scripts" (no allow-same-origin)
    - postMessage API for communication with host
    - Cannot access cookies, localStorage, or DOM of main app
    - CSP restricts network access to Hub API only

  MCP Plugins (Node.js processes):
    - Spawned as child_process with restricted env
    - No access to VAULT_ROOT or .kaivoo/ directly
    - Communicate only via stdin/stdout (MCP protocol)
    - Resource limits: max 512MB memory, 30s execution time
    - No network access unless explicitly granted in manifest

  npm Dependencies (for plugins):
    - Installed in plugin-specific node_modules (isolated)
    - NOT installed globally or in Hub's node_modules
    - Package audit before installation (npm audit)
    - Lockfile required for reproducibility
```

## 7.5 AI Prompt Injection Defenses

```
DEFENSE LAYERS:

  1. SYSTEM PROMPT BOUNDARIES
     Agent system prompts include explicit boundaries:
     "You are operating within Kaivoo Hub. You may ONLY:
      - Read files from: [allowed paths]
      - Write files to: [allowed path]
      - You may NOT access, modify, or reference the .kaivoo directory.
      - You may NOT make network requests.
      - You may NOT modify your own agent definition."

  2. OUTPUT VALIDATION
     All agent outputs are validated before execution:
     - File paths checked against allowed directories
     - Code outputs scanned for dangerous patterns (eval, exec, fetch)
     - File sizes checked against limits
     - No execution of agent output without approval gate (Level 1+)

  3. INPUT SANITIZATION
     User inputs passed to agents are wrapped:
     - Clear delimiter between system instructions and user content
     - User content marked as untrusted data
     - Agent instructed to treat user content as data, not instructions

  4. SOUL FILE PROTECTION
     The Soul file (.kaivoo/soul.md) is READ-ONLY for agents:
     - Only the user can edit the Soul file (via Settings UI)
     - Agents can reference it for context
     - Agents CANNOT propose modifications to the Soul file
     - Any attempt to write to soul.md is blocked and logged
```

---

# 8. Secrets & Key Management

## 8.1 Secret Inventory

| Secret | Storage Location | Access |
|--------|-----------------|--------|
| Supabase Auth JWT secret | Supabase Cloud (managed) | Hub server validates |
| AI provider API keys | `.kaivoo/ai-providers.json` | Hub server only |
| Supabase service key | `.kaivoo/config.json` | Hub server only |
| FileVault recovery key | External (password manager) | Emergency only |
| Tailscale auth key | Tailscale dashboard | One-time setup |

## 8.2 Key Security Rules

```
RULES:

  1. API keys NEVER leave the Hub server
     - All AI calls are server-side (Hub → AI provider)
     - Browser client never sees or touches API keys
     - Keys are not included in API responses

  2. Keys are NOT in source control
     - .kaivoo/ is in .gitignore
     - ai-providers.json has chmod 600
     - No keys in environment variables visible to child processes
     - Keys loaded from file at startup, held in memory

  3. Key rotation
     - AI provider keys: Rotate every 90 days
     - Supabase service key: Rotate if compromised
     - Hub adds key rotation reminder to Dashboard

  4. Key format validation
     - Validate key format before storing (prefix checks)
     - Test API key with a minimal request before saving
     - Log key usage (not the key itself) for audit
```

## 8.3 ai-providers.json Structure

```json
{
  "providers": {
    "anthropic": {
      "enabled": true,
      "api_key": "sk-ant-...",
      "models": ["claude-sonnet-4-20250514", "claude-opus-4-20250514"],
      "rate_limit": { "requests_per_minute": 10 },
      "last_rotated": "2026-02-01T00:00:00Z"
    },
    "openai": {
      "enabled": true,
      "api_key": "sk-...",
      "models": ["gpt-4o", "gpt-4o-mini"],
      "rate_limit": { "requests_per_minute": 10 },
      "last_rotated": "2026-02-01T00:00:00Z"
    },
    "ollama": {
      "enabled": true,
      "base_url": "http://127.0.0.1:11434",
      "models": ["llama3:8b", "nomic-embed-text"]
    }
  }
}
```

---

# 9. Dependency & Supply Chain Security

## 9.1 npm Security Controls

```
RULES:

  1. LOCKFILE INTEGRITY
     - package-lock.json is committed to git
     - CI/deployment uses `npm ci` (not `npm install`)
     - Lockfile changes reviewed manually

  2. AUDIT ON INSTALL
     - Run `npm audit` on every install
     - Block installs with critical vulnerabilities
     - Review high-severity findings weekly

  3. DEPENDENCY REVIEW
     - New dependencies require justification
     - Prefer well-maintained packages (>1M weekly downloads)
     - Prefer packages with few transitive dependencies
     - Check package for known supply chain issues (Socket.dev)

  4. AUTOMATED SCANNING
     - Enable GitHub Dependabot (or manual weekly audit)
     - Renovate/Dependabot for automated update PRs
     - Pin exact versions in package.json (no ^)
```

## 9.2 Plugin Dependency Isolation

```
PLUGIN npm PACKAGES:

  Hub node_modules/        ← Hub server dependencies (trusted)
  plugins/
    widget-a/
      node_modules/        ← Widget A's dependencies (isolated)
      package.json
    mcp-b/
      node_modules/        ← MCP B's dependencies (isolated)
      package.json

  Plugins CANNOT require() from Hub's node_modules.
  Plugins CANNOT modify Hub's package.json or lockfile.
  Each plugin has its own install + audit cycle.
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

> **Security Checklist by Phase:** See [Agent-4-Docs/Security-Checklist-By-Phase-Sprint-0.md](Agent-4-Docs/Security-Checklist-By-Phase-Sprint-0.md) for the phase-by-phase security implementation plan. The Director incorporates this into sprint planning.

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

---

**Kaivoo Hub — Security & Reliability Specification v1.0**
**February 2026**

*Your data. Your machine. Your protection. Your recovery plan.*
