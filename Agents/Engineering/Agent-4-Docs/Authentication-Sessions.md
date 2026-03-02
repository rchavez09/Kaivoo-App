# Authentication & Session Management — Detailed Security Design

**Source:** Extracted from Agent 4 Security & Reliability spec, Section 4
**Parent:** [Agent-4-Security-Reliability-Engineer.md](../Agent-4-Security-Reliability-Engineer.md)

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
