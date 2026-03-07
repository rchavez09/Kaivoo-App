# Privacy Policy

**Flow by Kaivoo**
**Effective Date:** [DATE]
**Version:** 1.0 (Draft — Pending Attorney Review)

---

Kaivoo Media ("Kaivoo," "we," "us," or "our") is committed to protecting your privacy. This Privacy Policy explains how the Flow desktop application and web application (collectively, the "Software") handle your information.

**The short version:** Flow is a local-first application. Your data stays on your device by default. We don't collect telemetry. We don't track you. We don't sell your data. We don't even have access to your data unless you explicitly use optional cloud features.

---

## 1. Our Privacy Principles

1. **Your data is yours.** We never claim ownership or rights to your content.
2. **Local by default.** Data is stored on your device, not our servers.
3. **No telemetry.** We do not collect usage analytics, session recordings, error reports, or behavioral data.
4. **No advertising.** We do not serve ads or share data with advertisers.
5. **No selling data.** We never sell, rent, or trade your personal information.
6. **Transparency.** This policy tells you exactly what data flows where and why.

---

## 2. Information We Collect

### 2.1 Information You Provide at Purchase

When you purchase a license, Stripe (our payment processor) collects:

- Email address
- Payment information (credit/debit card details)
- Billing address (if required by your payment method)

**We do not receive or store your payment card information.** Stripe processes your payment directly. We receive from Stripe only:

- A truncated, one-way hash of your email address (first 8 characters of SHA-256) — used to associate your license key with your purchase. Your full email address is not stored in our systems.
- Your purchase tier (Founding Member or Standard)
- A Stripe session identifier

### 2.2 Information Stored in the Software

The Software stores the following data **on your device** (desktop) or **in your authenticated cloud account** (web):

| Data Type | Examples | Storage Location |
|---|---|---|
| Journal entries | Daily notes, mood scores, tags | Local SQLite (desktop) or Supabase (web) |
| Tasks & subtasks | Titles, descriptions, due dates, priorities | Local SQLite or Supabase |
| Projects & notes | Project details, notes content | Local SQLite or Supabase |
| Captures | Quick thoughts, links, clippings | Local SQLite or Supabase |
| Topics & pages | Knowledge base entries, rich text content | Local SQLite or Supabase |
| Routines & habits | Names, schedules, completion records | Local SQLite or Supabase |
| Calendar events | Meeting titles, times, descriptions | Local SQLite or Supabase |
| File attachments | Documents, images, files you upload | Local filesystem (desktop) or Supabase Storage (web) |
| AI conversations | Chat history with the AI concierge | Local only (localStorage or SQLite) |
| AI memories | Facts the AI has learned about you | Local only (localStorage or SQLite) |
| Soul file | Your AI assistant's name, tone, and personality preferences | Local only (localStorage) |
| License key | Your activated license | Local only (localStorage or SQLite) |
| App settings | UI preferences, widget configuration | Local only |

**None of the above data is transmitted to Kaivoo Media's servers during normal use.**

### 2.3 Information We Do NOT Collect

We do not collect, and have no access to:

- Usage analytics or telemetry
- Session recordings or heatmaps
- Error reports or crash logs
- Keystroke data or input monitoring
- Device fingerprints or advertising identifiers
- Location data
- Contacts or address book information
- Browsing history
- Your AI API keys (these are encrypted locally and never sent to our servers)

---

## 3. How Your Data Is Used

### 3.1 License Verification

Your license key is verified **entirely offline** using cryptographic signature verification (Ed25519). After initial activation, the Software never contacts our servers to validate your license. We cannot track when or how often you use the Software.

### 3.2 Automatic Update Checks (Desktop Only)

The desktop application periodically checks for software updates by requesting a version manifest file from GitHub Releases. This request:

- Transmits **no user data** — no license key, user ID, email, or usage information
- Is a standard HTTPS request; GitHub receives your IP address and browser User-Agent string (standard for any web request)
- Can be verified by the user (the update URL is visible in the application configuration)

### 3.3 Cloud Features (Web Version — Optional)

If you choose to use the web version of the Software, your data is stored in Supabase under your authenticated account. This includes:

- An email address and password for account authentication (managed by Supabase Auth)
- All app data listed in Section 2.2 (stored in Supabase's database, protected by row-level security)
- File attachments (stored in Supabase Storage)

Your cloud data is isolated to your account and protected by row-level security policies. Other users cannot access your data. Kaivoo administrators do not access your data except as required to provide support at your request or as required by law.

---

## 4. Third-Party Services

The Software integrates with the following third-party services. Each integration is either optional or limited in scope:

### 4.1 Stripe (Payment Processing)

- **Purpose:** Process license purchases
- **Data shared:** Your payment information (handled directly by Stripe — we never see your card details)
- **When:** Only at the time of purchase
- **Their privacy policy:** [https://stripe.com/privacy](https://stripe.com/privacy)

### 4.2 AI Providers (User-Configured — BYO Keys)

- **Purpose:** Power the AI concierge and assistant features
- **Data shared:** When you use AI features, the following is sent to your chosen provider:
  - Your conversation messages
  - System context (including your soul file preferences, AI memories, and relevant app data for tool use)
  - Your API key (in the request header)
- **When:** Only when you actively use AI features (chat, tool use, memory extraction)
- **Your control:** You choose which provider to use. You provide your own API key. You can disable AI features entirely. You can review and delete your soul file and AI memories at any time.
- **Important:** Kaivoo does not control how third-party AI providers handle your data. Review your chosen provider's privacy policy:
  - OpenAI: [https://openai.com/privacy](https://openai.com/privacy)
  - Anthropic: [https://www.anthropic.com/privacy](https://www.anthropic.com/privacy)
  - Google: [https://policies.google.com/privacy](https://policies.google.com/privacy)
  - Ollama: Runs locally on your machine — no data leaves your device

### 4.3 Supabase (Cloud Infrastructure — Web Version)

- **Purpose:** Database, authentication, file storage, and serverless functions for the web version
- **Data shared:** Account credentials (email/password) and app data when using the web version
- **When:** Only when using the web version of the Software
- **Their privacy policy:** [https://supabase.com/privacy](https://supabase.com/privacy)

### 4.4 GitHub (Desktop Updates)

- **Purpose:** Host software update manifests
- **Data shared:** Standard HTTPS request metadata (IP address, User-Agent)
- **When:** Periodic update checks (desktop only)
- **Their privacy policy:** [https://docs.github.com/en/site-policy/privacy-policies](https://docs.github.com/en/site-policy/privacy-policies)

### 4.5 Optional Content Services (Edge Functions)

The following services are used by optional server-side features. They are only activated when you use specific features and require server-side API keys to be configured:

| Service | Feature | Data Sent |
|---|---|---|
| Firecrawl | Link capture (web scraping) | The URL you want to capture |
| ElevenLabs | Video capture (audio transcription) | Audio extracted from video |

These services are **not activated** unless you use the specific features that require them.

---

## 5. Data Security

### 5.1 Local Data Protection

- **Desktop:** Data is stored in SQLite databases on your local filesystem. File attachments are stored in your vault directory. Both are protected by your operating system's user account permissions and disk encryption (e.g., FileVault on macOS, BitLocker on Windows).
- **API keys:** Your AI provider API keys are encrypted using AES-GCM with a device-scoped key derived via PBKDF2 (100,000 iterations, SHA-256). Encrypted keys are stored in localStorage and are never transmitted to our servers.
- **License keys:** Stored locally after offline verification. No server communication required after activation.

### 5.2 Cloud Data Protection (Web Version)

- **Authentication:** Email/password authentication managed by Supabase Auth with secure session tokens.
- **Row-level security:** All database tables enforce row-level security policies, ensuring you can only access your own data.
- **Storage:** File attachments are stored in authenticated Supabase Storage buckets with user-scoped access policies.
- **Encryption in transit:** All communication with Supabase uses HTTPS/TLS encryption.

### 5.3 Payment Security

All payment processing is handled by Stripe, which is PCI DSS Level 1 certified — the highest level of certification in the payments industry. Your payment information never passes through our servers.

---

## 6. Data Retention and Deletion

### 6.1 Local Data (Desktop)

Your data exists only on your device. Uninstalling the Software and deleting the application data directory permanently removes all data. We have no copy of your local data and cannot recover it.

### 6.2 Cloud Data (Web Version)

If you use the web version, you may:

- **Export** all your data at any time (JSON or Markdown format)
- **Delete** your account and all associated data by contacting us at [CONTACT EMAIL]

### 6.3 Purchase Records

Stripe retains transaction records in accordance with their data retention policies and applicable financial regulations. The truncated email hash and license key stored in our systems can be deleted upon request.

---

## 7. Children's Privacy

The Software is not directed at children under the age of 13. We do not knowingly collect personal information from children under 13. If you believe a child under 13 has provided us with personal information, please contact us at [CONTACT EMAIL] and we will promptly delete such information.

---

## 8. International Data Transfers

If you use the web version of the Software, your data may be processed in data centers operated by Supabase in the United States. If you use third-party AI providers, your data may be processed in data centers operated by those providers in various locations. By using these optional features, you consent to the transfer of your data to these locations.

The desktop version of the Software processes all data locally on your device — no international data transfers occur.

---

## 9. Your Rights

Depending on your jurisdiction, you may have the right to:

- **Access** the personal data we hold about you
- **Correct** inaccurate personal data
- **Delete** your personal data
- **Export** your data in a portable format
- **Object** to processing of your personal data
- **Withdraw consent** for optional data processing

The Software's local-first architecture means you inherently have full control over most of your data. For data held in our systems (purchase records, license records), contact us at [CONTACT EMAIL].

For users in the European Economic Area (EEA), United Kingdom, or California, additional rights may apply under GDPR, UK GDPR, or CCPA respectively. Contact us to exercise these rights.

---

## 10. Changes to This Policy

We may update this Privacy Policy from time to time. Changes will be communicated through:

- The Software's update notes
- Our website
- In-app notification for material changes

The "Effective Date" at the top of this policy indicates when it was last updated. Continued use of the Software after changes constitutes acceptance of the updated policy.

---

## 11. Contact Us

For questions, concerns, or requests regarding this Privacy Policy or your personal data, contact us at:

**Email:** [CONTACT EMAIL]
**Website:** [WEBSITE URL]

---

## 12. Summary Table

| Question | Answer |
|---|---|
| Do you collect my data? | No. Your data stays on your device (desktop) or your cloud account (web). |
| Do you track me? | No. Zero analytics, zero telemetry. |
| Do you sell my data? | No. Never. |
| Can you see my AI conversations? | No. Conversations are stored locally only. |
| Can you see my API keys? | No. They are encrypted locally and never sent to our servers. |
| What does Stripe see? | Your payment details (card, email). We only receive a hashed email fragment and tier. |
| What do AI providers see? | Your conversations and context when you use AI features. You choose the provider. |
| Can I export everything? | Yes. JSON and Markdown exports available in Settings. |
| Can I delete everything? | Yes. Uninstall removes all local data. Contact us for cloud account deletion. |
| Do you use cookies? | The web version uses session cookies for authentication only. No tracking cookies. |

---

*Privacy Policy v1.0 Draft — Flow by Kaivoo — Kaivoo Media*
*Prepared for attorney review. Placeholders marked with [BRACKETS] require completion before publication.*
