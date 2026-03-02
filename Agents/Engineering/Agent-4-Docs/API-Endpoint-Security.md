# API & Endpoint Security — Detailed Security Design

**Source:** Extracted from Agent 4 Security & Reliability spec, Section 5
**Parent:** [Agent-4-Security-Reliability-Engineer.md](../Agent-4-Security-Reliability-Engineer.md)

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
