# Security Review — Sprint 20: Tauri Capabilities & Permissions

**Reviewer:** Agent 4 (Security & Reliability Engineer)
**Date:** March 2, 2026
**Sprint:** 20 — Local-First Foundation
**Parcel:** P3

---

## Executive Summary

Reviewed and hardened Tauri 2.0 capability configuration for the Kaivoo desktop app. The initial scaffold (P2) used broad placeholder permissions. This review scopes all permissions to the minimum required for current functionality, enforces deny-by-default, and adds a Content Security Policy.

**Verdict: PASS** — permissions are now scoped appropriately for Sprint 20 scope.

---

## Findings & Changes

### 1. File System Permissions — TIGHTENED

**Before (P2 scaffold):**
- `fs:default` granted baseline FS access (unnecessary surface area)
- `$HOME/**` read access on 3 permissions — could read SSH keys, browser profiles, etc.
- Write access limited to `$APPDATA/**` (acceptable but broad)

**After (P3):**
- Removed `fs:default` — only explicitly granted operations are allowed
- All FS operations scoped to `$APPDATA/.kaivoo/**` and `$APPDATA/com.kaivoo.desktop/**`
- No access to `$HOME` outside APPDATA
- Added `fs:allow-remove` for future file cleanup (scoped to app dirs only)

**Rationale:** The app currently uses SQLite via tauri-plugin-sql (which manages its own DB path). No production code reads arbitrary files. Future Vault features (Sprint 21+) will need a separate, user-chosen directory — that should be added as a separate scoped capability when implemented, not pre-granted.

### 2. SQL Plugin Permissions — ACCEPTABLE

- `sql:default` provides full access to tauri-plugin-sql
- The plugin creates databases in the app's data directory by default
- Current code: `Database.load("sqlite:kaivoo.db")` — scoped to app directory
- No raw SQL exposure to the frontend beyond parameterized queries
- **Risk:** Low — plugin handles path scoping internally

### 3. Shell Permissions — ACCEPTABLE

- `shell:allow-open` — allows opening URLs in the default browser
- Used for OAuth redirects and external links
- Does not allow arbitrary shell command execution
- **Risk:** Low

### 4. Content Security Policy — ADDED

**Before:** `"csp": null` — no restrictions on script sources, connections, etc.

**After:**
```
default-src 'self';
script-src 'self';
style-src 'self' 'unsafe-inline';
img-src 'self' data: blob: https:;
font-src 'self' data:;
connect-src 'self' https://*.supabase.co wss://*.supabase.co;
frame-src 'none';
object-src 'none';
base-uri 'self'
```

**Directive breakdown:**
| Directive | Value | Reason |
|---|---|---|
| `default-src` | `'self'` | Deny-by-default for unlisted resource types |
| `script-src` | `'self'` | Only app scripts — no CDN, no inline, no eval |
| `style-src` | `'self' 'unsafe-inline'` | App styles + CSS-in-JS (Tailwind runtime). `unsafe-inline` required for styled components. |
| `img-src` | `'self' data: blob: https:` | Local images + data URIs (icons) + blob (captures) + HTTPS (avatars, external images) |
| `font-src` | `'self' data:` | Bundled fonts + data URI fonts |
| `connect-src` | `'self' https://*.supabase.co wss://*.supabase.co` | API calls + realtime subscriptions to Supabase |
| `frame-src` | `'none'` | No iframes — prevents clickjacking |
| `object-src` | `'none'` | No plugins (Flash, Java, etc.) |
| `base-uri` | `'self'` | Prevents base tag injection |

**Note:** When the app goes fully local-first (no Supabase), the `connect-src` Supabase entries should be removed.

### 5. Core Permissions — ACCEPTABLE

- `core:default` — required Tauri IPC permissions
- Standard for all Tauri apps
- **Risk:** None

---

## Capability Scope Summary

| Resource | Read | Write | Delete | Scope |
|---|---|---|---|---|
| SQLite database | Yes | Yes | N/A | `$APPDATA/` (plugin-managed) |
| App config files | Yes | Yes | Yes | `$APPDATA/.kaivoo/**` |
| App data files | Yes | Yes | Yes | `$APPDATA/com.kaivoo.desktop/**` |
| Home directory | No | No | No | Denied |
| System files | No | No | No | Denied |
| Shell commands | No | No | No | Denied (only `open` allowed) |
| Network | N/A | N/A | N/A | `self` + `*.supabase.co` only |

---

## Sprint 21+ Recommendations

1. **Vault Directory Access** — When implementing the Vault file system, add a _separate_ capability file (`capabilities/vault.json`) with user-chosen directory scope. Use Tauri's directory picker dialog to get the path at runtime, then validate it against the scoped permission.

2. **Remove Supabase CSP entries** — Once the app is fully local-first, remove `https://*.supabase.co` and `wss://*.supabase.co` from `connect-src`.

3. **Consider `style-src` hardening** — Investigate replacing `'unsafe-inline'` with nonce-based styles if Tailwind JIT output can be configured to use nonces.

4. **Auto-update signing** — When implementing auto-updates, ensure the Tauri updater is configured with mandatory code signing. Add update endpoint to CSP `connect-src`.

5. **Plugin audit** — Review tauri-plugin-sql and tauri-plugin-fs for known CVEs before first production release.

---

## Files Modified

| File | Change |
|---|---|
| `src-tauri/capabilities/default.json` | Removed `fs:default`, removed `$HOME/**` access, scoped all FS to `$APPDATA/.kaivoo/**` and `$APPDATA/com.kaivoo.desktop/**`, added `fs:allow-remove` |
| `src-tauri/tauri.conf.json` | Added CSP policy (was `null`) |
