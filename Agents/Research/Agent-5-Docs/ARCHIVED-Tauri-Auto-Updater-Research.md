# Tauri 2.0 Auto-Updater Research

**Agent:** Agent 5 (Research Analyst)
**Date:** March 3, 2026
**Context:** Kaivoo desktop app (Tauri 2.0) needs to push updates to users like Obsidian does with Electron

---

## How It Works

The `@tauri-apps/plugin-updater` is a first-party Tauri v2 plugin that implements a pull-based update system. The app calls `check()` against a remote JSON endpoint, compares versions via semver, downloads the platform-appropriate binary, verifies an Ed25519 signature, and installs the update.

The developer controls 100% of the UX — Tauri provides the primitives (`check`, `download`, `install`), not an opinionated flow.

---

## Installation & Configuration

### Rust Side

Add to `Cargo.toml`:
```toml
[dependencies]
tauri-plugin-updater = "2"
```

Register in `lib.rs`:
```rust
fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_updater::Builder::new().build())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

### JavaScript Side

```bash
npm install @tauri-apps/plugin-updater @tauri-apps/plugin-process
```

### Tauri Config (`tauri.conf.json`)

```json
{
  "plugins": {
    "updater": {
      "pubkey": "dW50cnVzdGVkIGNvbW1lbnQ...",
      "endpoints": [
        "https://github.com/rchavez09/Kaivoo-App/releases/latest/download/latest.json"
      ]
    }
  }
}
```

### Permissions (Capabilities)

Add to capabilities JSON:
```json
{
  "permissions": [
    "updater:default",
    "process:allow-restart"
  ]
}
```

---

## Update Manifest Format

Two formats supported:

### Flat (Single Platform)
```json
{
  "version": "1.2.0",
  "notes": "Bug fixes and performance improvements",
  "pub_date": "2026-03-03T00:00:00Z",
  "url": "https://github.com/.../Kaivoo_1.2.0_aarch64.app.tar.gz",
  "signature": "dW50cnVzdGVkIGNvbW1lbnQ..."
}
```

### Multi-Platform (Recommended)
```json
{
  "version": "1.2.0",
  "notes": "Bug fixes and performance improvements",
  "pub_date": "2026-03-03T00:00:00Z",
  "platforms": {
    "darwin-aarch64": {
      "url": "https://github.com/.../Kaivoo_1.2.0_aarch64.app.tar.gz",
      "signature": "dW50cnVzdGVkIGNvbW1lbnQ..."
    },
    "darwin-x86_64": {
      "url": "https://github.com/.../Kaivoo_1.2.0_x64.app.tar.gz",
      "signature": "dW50cnVzdGVkIGNvbW1lbnQ..."
    },
    "windows-x86_64": {
      "url": "https://github.com/.../Kaivoo_1.2.0_x64-setup.nsis.zip",
      "signature": "dW50cnVzdGVkIGNvbW1lbnQ..."
    },
    "linux-x86_64": {
      "url": "https://github.com/.../Kaivoo_1.2.0_amd64.AppImage.tar.gz",
      "signature": "dW50cnVzdGVkIGNvbW1lbnQ..."
    }
  }
}
```

The `tauri-action` GitHub Action generates this `latest.json` automatically.

---

## Hosting Options

| Option | Cost | Complexity | Notes |
|---|---|---|---|
| **GitHub Releases** | Free | Lowest | `tauri-action` handles everything automatically |
| S3 / Cloudflare R2 | ~$1-5/mo | Medium | More control, custom domain |
| CrabNebula Cloud | Paid | Low | Tauri-specific hosting, auto-signing, analytics |
| Custom server | Varies | High | Full control, most maintenance |

**Recommendation: GitHub Releases.** Free, zero infrastructure, `tauri-action` generates the manifest and uploads binaries. Endpoint: `https://github.com/rchavez09/Kaivoo-App/releases/latest/download/latest.json`. Can migrate later if needed.

---

## Update Flow UX

The plugin gives you full control. Recommended pattern:

### On App Launch (Background)
```typescript
import { check } from '@tauri-apps/plugin-updater';
import { relaunch } from '@tauri-apps/plugin-process';

async function checkForUpdates() {
  const update = await check();
  if (update) {
    // Show non-blocking toast: "Update available (v1.2.0)"
    // User clicks "Update" → download + install
    await update.downloadAndInstall();
    await relaunch();
  }
}
```

### With Progress Tracking
```typescript
await update.downloadAndInstall((event) => {
  switch (event.event) {
    case 'Started':
      console.log(`Download started, size: ${event.data.contentLength}`);
      break;
    case 'Progress':
      console.log(`Downloaded ${event.data.chunkLength} bytes`);
      break;
    case 'Finished':
      console.log('Download finished');
      break;
  }
});
```

### Recommended UX for Kaivoo
- **On launch:** Silent background check, non-blocking toast if update available
- **In Settings:** Manual "Check for Updates" button with version info
- **For critical updates:** Add `"force": true` to manifest, show blocking modal
- This matches Obsidian's model exactly

---

## Platform Differences

| Platform | Binary Format | OS-Level Signing | Updater Signing |
|---|---|---|---|
| **macOS** | `.app.tar.gz` | Apple Developer ID ($99/yr) + notarization | Ed25519 (mandatory) |
| **Windows** | `.nsis.zip` | Authenticode (optional but recommended) | Ed25519 (mandatory) |
| **Linux** | `.AppImage.tar.gz` | None needed | Ed25519 (mandatory) |

- **macOS:** Requires code signing + notarization for Gatekeeper. Without it, users get "unidentified developer" warning.
- **Windows:** Without Authenticode, SmartScreen shows "unknown publisher" warning. Reputation builds over time.
- **Linux:** No OS-level signing concerns. Ed25519 is sufficient.
- **Windows installer:** Use `passive` install mode for silent-ish updates (progress bar, no user interaction needed).

---

## Signing

### Ed25519 Updater Signing (Mandatory)

This is **required** and cannot be disabled. It's separate from OS-level code signing.

Generate key pair:
```bash
npx tauri signer generate -w ~/.tauri/kaivoo.key
```

This produces:
- **Private key** (`~/.tauri/kaivoo.key`) — used during CI builds to sign binaries. Store as GitHub Secret.
- **Public key** — goes in `tauri.conf.json` under `plugins.updater.pubkey`

The updater verifies every downloaded binary against this public key before installing. Tampered binaries are rejected.

### OS-Level Signing (Separate)

- **macOS:** Apple Developer ID certificate + notarization (see Code Signing Research doc)
- **Windows:** Authenticode certificate (see Code Signing Research doc)
- These are independent from Ed25519 updater signing

---

## Delta Updates

**Not supported.** Tauri downloads the full binary for every update.

This is acceptable because:
- Tauri app bundles are small (15-30 MB) compared to Electron (150MB+)
- No near-term plans from Tauri team to add delta updates
- At this scale, bandwidth costs are negligible

---

## Real-World Examples

Several open-source Tauri apps use the updater successfully:
- **Tauri's own example apps** in the plugin repository
- The `tauri-action` GitHub Action is the standard CI/CD approach — generates signed binaries and `latest.json` manifest in one step

The typical setup:
1. Push a git tag (`v1.2.0`)
2. GitHub Actions runs `tauri-action`
3. Action builds for all platforms, signs with Ed25519 key
4. Uploads binaries + `latest.json` to GitHub Releases
5. Running apps detect the new version on next check

---

## Implementation Estimate

This can fit within a single sprint as part of the Ship Readiness work:

### Foundation (1-2 parcels)
- Add `tauri-plugin-updater` to Cargo.toml and `lib.rs`
- Generate Ed25519 signing keys
- Configure `tauri.conf.json` with pubkey and endpoint
- Add capabilities permissions

### CI/CD (1-2 parcels)
- Create `.github/workflows/release.yml` with `tauri-action`
- Store signing key as GitHub Secret
- Configure 3-platform build matrix (macOS, Windows, Linux)
- Test: push a tag, verify binaries + manifest appear in Releases

### UX (1-2 parcels)
- `useAppUpdater.ts` hook — background check on launch, manual check from Settings
- `UpdateNotification.tsx` component — toast notification with "Update" / "Later" actions
- Settings page: version info + "Check for Updates" button
- Progress indicator during download

### Key Files to Modify
- `daily-flow/src-tauri/Cargo.toml`
- `daily-flow/src-tauri/tauri.conf.json`
- `daily-flow/src-tauri/capabilities/*.json`
- `daily-flow/src-tauri/src/lib.rs`
- `daily-flow/package.json`
- New: `daily-flow/src/hooks/useAppUpdater.ts`
- New: `daily-flow/src/components/UpdateNotification.tsx`
- New: `.github/workflows/release.yml`

---

## Recommendation for Kaivoo

**Use GitHub Releases + `tauri-action` + Ed25519 signing.** This is the simplest, cheapest, most battle-tested path:

1. **Zero hosting cost** — GitHub Releases is free
2. **Automated** — `tauri-action` builds, signs, and publishes in one CI step
3. **Secure** — mandatory Ed25519 signature verification on every update
4. **Obsidian-like UX** — silent background check, non-blocking notification, user-initiated restart
5. **Small binaries** — 15-30 MB full downloads, no delta updates needed
6. **Upgradeable** — can migrate to CrabNebula Cloud or custom server later without changing the app code (just change the endpoint URL)

The auto-updater is one of Tauri's most mature plugins. This is solved infrastructure, not invention.

---

*Agent 5 Research — March 3, 2026*
