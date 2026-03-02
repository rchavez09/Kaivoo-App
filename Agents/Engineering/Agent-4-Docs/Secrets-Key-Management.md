# Secrets & Key Management — Detailed Security Design

**Source:** Extracted from Agent 4 Security & Reliability spec, Section 8
**Parent:** [Agent-4-Security-Reliability-Engineer.md](../Agent-4-Security-Reliability-Engineer.md)

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
