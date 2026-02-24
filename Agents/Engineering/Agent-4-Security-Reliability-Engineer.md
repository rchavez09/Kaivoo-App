# Agent 4: Security & Reliability Engineer — Kaivoo Hub Defense Blueprint
## Threat Model, Data Protection & Disaster Recovery · Specification v1.1

**Role:** Security & Reliability Engineer
**Model:** Sonnet
**Department:** Engineering
**Mission:** Define a comprehensive security posture, threat model, backup strategy, and disaster recovery plan for Kaivoo Hub — ensuring that a self-hosted personal AI operating system running on a single Mac Mini is resilient against data loss, unauthorized access, supply chain compromise, and AI agent misuse.

**Date:** February 2026
**Status:** APPROVED — Ready for implementation
**Applies to:** All systems (Vault, Journal, Dashboard, Concierge, Theater, Workshop)

---

# Table of Contents

## Core Sections (this file)

1. [Security Philosophy](#1-security-philosophy)
2. [Threat Model](#2-threat-model)
3. [Security Review Checklist](#3-condensed-security-review-checklist)

## Detailed Design Documents (Agent-4-Docs/)

| # | Document | Covers |
|---|----------|--------|
| 1 | [Network-Security.md](Agent-4-Docs/Network-Security.md) | Network architecture, firewall, Express binding, Cloudflare tunnel |
| 2 | [Authentication-Sessions.md](Agent-4-Docs/Authentication-Sessions.md) | Auth architecture, session controls, httpOnly cookies |
| 3 | [API-Endpoint-Security.md](Agent-4-Docs/API-Endpoint-Security.md) | Middleware stack, path traversal, input validation, response headers |
| 4 | [File-System-Data-Protection.md](Agent-4-Docs/File-System-Data-Protection.md) | Encryption, permissions, SQLite integrity, soft delete, versioning, macOS hardening, process isolation |
| 5 | [AI-Agent-Sandboxing.md](Agent-4-Docs/AI-Agent-Sandboxing.md) | Risk analysis, permission model, plugin sandboxing, prompt injection |
| 6 | [Secrets-Key-Management.md](Agent-4-Docs/Secrets-Key-Management.md) | Secret inventory, key rules, ai-providers.json |
| 7 | [Dependency-Supply-Chain.md](Agent-4-Docs/Dependency-Supply-Chain.md) | npm controls, plugin dependency isolation |
| 8 | [Backup-Disaster-Recovery.md](Agent-4-Docs/Backup-Disaster-Recovery.md) | Backup architecture, tiers, schedule, disaster recovery scenarios, recovery order |
| 9 | [Health-Monitoring-Alerting.md](Agent-4-Docs/Health-Monitoring-Alerting.md) | Health endpoints, dashboard widget, alerting, logging, audit trail |
| 10 | [Incident-Response-Playbook.md](Agent-4-Docs/Incident-Response-Playbook.md) | Detection flow, emergency contacts, UPS, backup automation, audit script |
| 11 | [Security-Checklist-By-Phase-Sprint-0.md](Agent-4-Docs/Security-Checklist-By-Phase-Sprint-0.md) | Phase-by-phase security implementation plan |

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

# 3. Condensed Security Review Checklist

Use this checklist during sprint security reviews. Each item links to the detailed design document for full context.

## Network & Access Control
- [ ] No ports open to public internet; Express bound to Tailscale IP only
- [ ] Tailscale ACLs restrict which devices reach port 3000
- [ ] CORS locked to Tailscale hostname; Host header validated
- [ ] Rate limiting active: 100 req/min general, 10 req/min AI
- [ ] WebSocket connections require valid JWT on handshake

> Details: [Network-Security.md](Agent-4-Docs/Network-Security.md)

## Authentication & Sessions
- [ ] Tokens stored in httpOnly/Secure/SameSite=Strict cookies (not localStorage)
- [ ] Access token TTL = 15 min; refresh token TTL = 7 days, rotated on use
- [ ] Brute force protection: lockout after 5 failed attempts
- [ ] CSRF protection via SameSite + custom header (X-Kaivoo-Client)

> Details: [Authentication-Sessions.md](Agent-4-Docs/Authentication-Sessions.md)

## API & Input Safety
- [ ] All inputs validated with Zod schemas before processing
- [ ] Path traversal guard: resolve + startsWith check on all file paths
- [ ] .kaivoo/ directory blocked from Vault API access
- [ ] Response headers set: CSP, X-Frame-Options DENY, nosniff, Referrer-Policy

> Details: [API-Endpoint-Security.md](Agent-4-Docs/API-Endpoint-Security.md)

## File System & Data
- [ ] FileVault enabled (non-negotiable)
- [ ] File permissions: 700 on ~/Kaivoo, 600 on config/db files
- [ ] SQLite WAL mode + integrity check on startup
- [ ] Soft delete via .kaivoo/trash/ with 30-day retention
- [ ] Hub server never runs as root; dedicated macOS user recommended

> Details: [File-System-Data-Protection.md](Agent-4-Docs/File-System-Data-Protection.md)

## AI Agent Safety
- [ ] Each agent gets scoped AgentContext with explicit permission level (0-3)
- [ ] Agent outputs validated: paths checked, dangerous patterns scanned
- [ ] Soul file (.kaivoo/soul.md) is READ-ONLY for all agents
- [ ] Plugins run in sandboxed iframes (widgets) or restricted child_process (MCP)

> Details: [AI-Agent-Sandboxing.md](Agent-4-Docs/AI-Agent-Sandboxing.md)

## Secrets & Dependencies
- [ ] API keys server-side only; never sent to browser client
- [ ] Keys not in source control; .kaivoo/ in .gitignore; chmod 600
- [ ] Key rotation every 90 days; rotation reminders in Dashboard
- [ ] package-lock.json committed; `npm ci` in CI; `npm audit` on install
- [ ] Plugin dependencies isolated per-plugin (not in Hub node_modules)

> Details: [Secrets-Key-Management.md](Agent-4-Docs/Secrets-Key-Management.md), [Dependency-Supply-Chain.md](Agent-4-Docs/Dependency-Supply-Chain.md)

## Backup & Recovery
- [ ] 3-2-1 backup: Time Machine (local) + SQLite VACUUM INTO (6h) + encrypted cloud sync (daily)
- [ ] RPO target: 1 hour; RTO target: 4 hours
- [ ] Recovery playbooks documented for: power outage, SSD failure, theft, accidental delete, DB corruption
- [ ] Backup schedule verified via health check endpoint

> Details: [Backup-Disaster-Recovery.md](Agent-4-Docs/Backup-Disaster-Recovery.md)

## Monitoring & Incident Response
- [ ] /api/health endpoint checks: database, file system, Ollama, disk space, last backup
- [ ] Alerts fire on: disk < 10%, integrity check fail, backup overdue, auth failures
- [ ] All AI agent actions logged to SQLite + .kaivoo/logs/ (JSON lines, 90-day retention)
- [ ] Incident response flow documented: Detect → Assess → Contain → Recover → Review → Document

> Details: [Health-Monitoring-Alerting.md](Agent-4-Docs/Health-Monitoring-Alerting.md), [Incident-Response-Playbook.md](Agent-4-Docs/Incident-Response-Playbook.md)

---

# 4. Reference Pointers

## Phase-by-Phase Implementation
> The Director incorporates the security checklist into sprint planning.
> See: [Security-Checklist-By-Phase-Sprint-0.md](Agent-4-Docs/Security-Checklist-By-Phase-Sprint-0.md)

## Related Agent Specs
- **Agent 3 (Architect):** Defines the system architecture that security controls protect
- **Agent 9 (DevOps):** Implements deployment, CI/CD, and infrastructure hardening
- **Agent 7 (Code Reviewer):** Reviews code for security issues during sprint gates

---

**Kaivoo Hub — Security & Reliability Specification v1.1**
**February 2026**

*Your data. Your machine. Your protection. Your recovery plan.*
