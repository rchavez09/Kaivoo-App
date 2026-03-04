# License Key Research: Offline-Capable Systems for Desktop Apps

**Agent 5 (Research Analyst) | March 2026**
**Context:** Kaivoo is a local-first Tauri 2.0 desktop app, one-time purchase at $49-99, targeting ~2,000 founding members initially.

---

## 1. Offline-Capable License Key Patterns

### Pattern A: Cryptographically Signed Keys (Pure Offline)

The simplest tamper-resistant pattern. The server signs a payload containing license data with a private key. The desktop app embeds the public key and verifies the signature locally. No server contact needed after initial key delivery.

**How it works:**

```
Server (at purchase time):
  payload = { tier: "pro", email_hash: "a1b2c3", issued: "2026-03-01", type: "lifetime" }
  signature = Ed25519.sign(payload, PRIVATE_KEY)
  license_key = base64url(payload + signature)

Desktop App (at activation):
  (payload, signature) = decode(license_key)
  valid = Ed25519.verify(payload, signature, PUBLIC_KEY)  // PUBLIC_KEY embedded in binary
  if valid -> unlock features based on payload.tier
```

**Strengths:** Zero server infrastructure for validation. Works completely offline. Cryptographically tamper-proof (modifying any payload byte invalidates the signature).

**Weaknesses:** Cannot revoke keys after issuance. Cannot limit device count without a server. Key can be shared freely (but see Section 5 on why this matters less than you think).

### Pattern B: Online Activation + Offline Use (Phone-Home Once)

The app contacts a server once during activation, then stores a local activation token. Periodic online check-ins are optional.

**Strengths:** Can enforce device limits. Can revoke keys (for refunds/chargebacks). Can track activation counts.

**Weaknesses:** Requires running a server (or using a service like Keygen.sh). First-launch requires internet. More complex implementation.

### Pattern C: Time-Limited Tokens with Refresh (SaaS-Adjacent)

Used by JetBrains and similar. **Not recommended for Kaivoo** — this is a subscription model pattern, not a one-time purchase pattern.

### How Real Products Handle It

| Product | Model | Approach |
|---|---|---|
| **Sublime Text** | One-time ($99) | Signed key, pure offline. Gentle nagging popup if unlicensed — app remains fully functional. The gold standard for indie simplicity. |
| **Sketch** | Subscription (was one-time) | Online activation, periodic check-in. Machine-locked. |
| **JetBrains** | Subscription + fallback perpetual | Online activation, periodic phone-home. Complex; enterprise-grade. Overkill for indie. |
| **Panic (Nova, Transmit)** | One-time | Signed key + optional online activation for device tracking. Good indie reference. |
| **1Password** (legacy v7) | One-time | Signed license key, pure offline. Simple and effective. |

### Simplest Tamper-Resistant Pattern

**Ed25519-signed key with embedded payload (Pattern A).** This is what Sublime Text effectively does:

- Ed25519 produces compact signatures (64 bytes)
- Verification is fast (microseconds) with no external dependencies
- The public key in the binary is not a secret — it only verifies, it cannot generate keys
- Modifying any bit of the payload invalidates the signature
- An attacker would need to patch the binary to bypass verification (at which point no DRM can help anyway)

---

## 2. Key Format Design

### What Data to Embed

| Field | Type | Purpose | Example |
|---|---|---|---|
| `version` | u8 | Key format version (for future changes) | `1` |
| `tier` | u8 | Product tier (0=Starter, 1=Pro, 2=Lifetime) | `1` |
| `issued_at` | u32 | Unix timestamp (days since epoch) | `20514` |
| `email_hash` | [u8; 4] | First 4 bytes of SHA-256 of email | `a1b2c3d4` |
| `flags` | u8 | Bitflags for features, beta access, etc. | `0b00000001` |

**Total payload: ~12 bytes.** Ed25519 signature adds 64 bytes. Total: 76 bytes.

**What NOT to embed:** Full email (privacy), expiry date (lifetime licenses), machine ID (prevents legitimate re-installs).

### Recommended Key Format

Base64url-encoded signed blob in a Sublime Text-style wrapper:

```
----- BEGIN KAIVOO LICENSE -----
Kaivoo Pro - Single User License
{"v":1,"t":1,"i":20514,"e":"a1b2c3d4"}
kJ3nR7xQ2mP8vL4wT9bY5cF6hA0dG1sU8iE3oN7qK2jM
5xW4rB9tH6yC0fV1gZ3pS8uD7lI2aO5eR4nQ9mJ6kL0w
----- END KAIVOO LICENSE -----
```

- Human-readable header builds trust (user can see their tier)
- JSON payload is inspectable
- Familiar format for developers
- Can be pasted into a text input or saved as a `.kaivoo-license` file

---

## 3. Activation Flow

### Recommended: Flow A (Pure Offline)

```
Purchase -> Stripe Webhook -> Supabase Edge Function signs key -> Email to customer
Customer pastes key -> App verifies signature locally -> Features unlocked (forever, offline)
```

| Pros | Cons |
|---|---|
| Zero ongoing infrastructure | Cannot revoke keys |
| Works without internet forever | Cannot limit device count |
| Simplest to implement | Shared keys work on unlimited machines |
| No downtime risk | No activation analytics |
| Privacy-friendly | |

### Minimum Server-Side Infrastructure

For pure offline: Just a key-signing function. A single Supabase Edge Function triggered by a Stripe webhook. No database needed. Cost: effectively $0 at this scale.

---

## 4. Existing Solutions and Libraries

### Keygen.sh

Full-featured license key management API. Pricing: Free tier (25 licenses, testing only), Indie ($49/month, 250 licenses), Business ($249/month, unlimited). **Verdict: Overkill and overpriced for 2,000 founding members.** Worth revisiting at 10,000+ customers.

### LemonSqueezy

All-in-one: payment, storefront, license keys, delivery. Pricing: 5% + $0.50 per transaction. Includes automatic key generation, activation API, device limits, refund-to-revocation. **Verdict: Best all-in-one option if you are OK with online activation.** Cost: ~$2.95 per $49 sale (6% effective).

### Gumroad

10% flat fee. Basic license system (lookup table, not cryptographically signed). **Not recommended over LemonSqueezy.**

### Open-Source Libraries (Roll Your Own)

**Rust (for Tauri client-side verification):**
- `ed25519-dalek` — the go-to Ed25519 implementation. Battle-tested. ~50-100 lines for verification.
- `ring` — Google's crypto library. Heavier but even more battle-tested.

**TypeScript (for server-side key generation):**
- `@noble/ed25519` — modern, audited, by Paul Miller. Excellent for server-side generation.
- `tweetnacl` — minimal, audited NaCl implementation.

**Complexity of rolling your own: LOW.** ~30 lines TypeScript for generation, ~40 lines Rust for verification. 1-2 hours implementation, half a day with testing.

---

## 5. Anti-Piracy Reality Check

### The Math

- Total addressable revenue: 2,000 x $49 = $98,000
- Industry piracy rate for niche productivity tools: 5-15%
- Realistic lost revenue from piracy: $5,000-$15,000
- Cost of sophisticated DRM: 40-100+ hours of engineering + ongoing maintenance

**The ROI on sophisticated DRM is negative at this scale.**

### What Successful Indie Devs Say

- **Sublime Text:** Fully functional without a license. Dismissible popup. Revenue: millions. Philosophy: "Make it easy to pay, don't punish paying customers."
- **Panic (Nova, Transmit):** Simple key, minimal enforcement. Piracy has never been a meaningful business threat.
- **DHH (37signals/Once):** If someone pirates your product, they probably would not have paid anyway.

### The Real Threat Model at 2,000 Users

1. **Casual sharing:** Costs maybe a few sales. Not worth fighting.
2. **Key posted on a forum:** Unlikely at this scale. Your product is too niche.
3. **Binary patching:** Nobody is reverse engineering a $49 niche app with 2,000 users.
4. **Chargebacks:** A payment processor problem, not a DRM problem.

### The Cost of Over-Engineering

Complex activation frustrates legitimate users. Activation servers go down. Device limits cause reinstall issues. Internet-required activation contradicts "local-first." Time spent on DRM is time not spent on features.

**If you spend more than a day on license enforcement, you are over-investing relative to the threat.**

---

## 6. Integration with Payment

### Payment Integration Comparison

| Factor | Stripe + Custom | LemonSqueezy | Gumroad |
|---|---|---|---|
| Fee per $49 sale | $1.72 | $2.95 | $4.90 |
| Fee per $99 sale | $3.17 | $5.45 | $9.90 |
| License key built-in | No (you build it) | Yes | Yes (basic) |
| Offline key verification | Your design | No (API-based) | No (API-based) |
| Tax/VAT handling | No (use Stripe Tax) | Yes | Yes |
| Custom key format | Yes | No | No |
| Setup effort | Medium (1-2 days) | Low (hours) | Low (hours) |

---

## 7. Recommendation for Kaivoo

### Primary: Stripe + Ed25519 Signed Keys (Pure Offline)

**Architecture:**

```
Website -> Stripe Checkout -> Webhook -> Supabase Edge Function (signs key) -> Email to customer
Customer pastes key -> App verifies offline -> Done forever
```

**Why this path:**

1. **Aligns with "local-first" identity.** Pure offline verification. No phone-home.
2. **Minimal infrastructure.** One Supabase Edge Function. You already have Supabase.
3. **Lowest ongoing cost.** Stripe fees only (~$1.72 per $49 sale).
4. **Appropriate security.** Ed25519 is cryptographically strong. Nobody is forging keys.
5. **Simple implementation.** ~40 lines Rust + ~30 lines TypeScript. Half a day of work.
6. **No customer friction.** Paste a key, done forever. No internet. No device limits.

**Activation UX:** Full-featured app with a gentle, persistent, unobtrusive banner: "Enjoying Kaivoo? Enter your license key to remove this message." No feature restrictions. No nag popups. No countdown timers. Sublime Text proved this model works.

**Estimated effort: 4-8 hours total** (Edge Function + Rust verification + React UI + testing).

### Alternative: LemonSqueezy All-in-One

If absolute minimum dev effort is the priority and you accept higher fees, online activation requirement, and vendor dependency. Setup: 2-4 hours.

### What to Build Later (If Needed)

- Device limits: only if key sharing becomes measurable (it almost certainly will not)
- Key revocation: only if chargeback abuse becomes a pattern
- Online activation: only if you add a subscription tier
- Keygen.sh: only at 10,000+ users

### Summary Decision Matrix

| Criterion | Stripe + Ed25519 | LemonSqueezy | Keygen.sh |
|---|---|---|---|
| Aligns with local-first | **Best** | Acceptable | Acceptable |
| Implementation effort | 4-8 hours | 2-4 hours | 4-8 hours |
| Ongoing cost (monthly) | $0 | $0 | $49-249/month |
| Per-sale cost ($49) | $1.72 | $2.95 | $1.72 + sub |
| Offline verification | Full | After first activation | After first activation |
| **Recommended** | **Yes (primary)** | **Yes (alternative)** | **No (overkill)** |

---

*Agent 5 Research — March 3, 2026*
