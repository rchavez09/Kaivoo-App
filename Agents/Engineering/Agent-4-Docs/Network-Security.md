# Network Security — Detailed Security Design

**Source:** Extracted from Agent 4 Security & Reliability spec, Section 3
**Parent:** [Agent-4-Security-Reliability-Engineer.md](../Agent-4-Security-Reliability-Engineer.md)

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
