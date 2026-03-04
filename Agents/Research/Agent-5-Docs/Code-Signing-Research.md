# Code Signing Research: Tauri 2.0 Desktop Distribution

**Agent 5 (Research Analyst) | March 2026**
**Scope:** macOS, Windows, Linux signing requirements for Kaivoo desktop app
**Context:** Tauri 2.0 app with existing GitHub Actions CI/CD matrix (`desktop.yml`)

---

## Table of Contents

1. Apple Notarization (macOS)
2. Windows Code Signing
3. Linux Distribution
4. CI/CD Integration
5. Cost Summary
6. Timeline & Priority
7. Recommendation for Kaivoo

---

## 1. Apple Notarization (macOS)

### 1.1 Certificates Required

Two certificates from Apple are involved in distributing a macOS app outside the App Store:

| Certificate | Purpose | Where Obtained |
|---|---|---|
| **Developer ID Application** | Signs the `.app` bundle itself (the executable code) | Apple Developer Portal > Certificates |
| **Developer ID Installer** | Signs the `.pkg` installer (if distributing via `.pkg`) | Apple Developer Portal > Certificates |

For Tauri's `.dmg` distribution, only the **Developer ID Application** certificate is strictly required. The `.dmg` disk image is signed separately, but Tauri handles this automatically when the signing identity is provided.

You also need an **Apple Developer Team ID** (a 10-character alphanumeric string tied to your Apple Developer account).

### 1.2 Apple Developer Program

- **Cost:** $99 USD/year (individual or organization)
- **Organization enrollment** requires a D-U-N-S number (free to obtain but takes 1-2 weeks)
- **Individual enrollment** is immediate with an Apple ID
- Enrollment grants access to: code signing certificates, notarization service, TestFlight (iOS), App Store Connect
- The program must remain active to keep certificates valid; if it lapses, existing signed apps continue to work, but you cannot sign new builds

### 1.3 The Notarization Process

Notarization is Apple's automated security check. It is **not** App Store review. The process:

1. **Build** the app with Hardened Runtime enabled and sign it with a Developer ID Application certificate
2. **Submit** the signed app to Apple's notarization service (via `notarytool` or `xcrun altool`)
3. **Apple scans** the binary for malware, validates the signature, checks for private API usage, and verifies Hardened Runtime entitlements
4. **Apple returns** a ticket (a cryptographic receipt) — typically within **2-15 minutes**, though it can occasionally take up to an hour during peak times
5. **Staple** the ticket to the app bundle so it can be verified offline

Tauri's build tooling (via `tauri-action` in CI or `tauri build` locally) automates steps 2-5 when the correct environment variables are set. You do not need to manually run `notarytool`.

### 1.4 Hardened Runtime

Since macOS 10.15 (Catalina), notarization requires the **Hardened Runtime** capability:

- Restricts the app from: loading unsigned libraries, using debugging APIs, modifying protected resources
- Tauri 2.0 **enables Hardened Runtime by default** when signing for macOS
- Entitlements Tauri typically requests (and you may need to customize):
  - `com.apple.security.cs.allow-jit` — required for the WebView's JavaScript engine
  - `com.apple.security.cs.allow-unsigned-executable-memory` — sometimes needed for V8/JavaScriptCore
  - `com.apple.security.cs.allow-dyld-environment-variables` — rarely needed
- Entitlements are configured in `src-tauri/Entitlements.plist` (Tauri creates a default if absent)

### 1.5 What Happens WITHOUT Notarization

| macOS Version | Behavior for Unsigned/Un-notarized App |
|---|---|
| **macOS 10.15+** | Gatekeeper blocks the app. User sees: **"Kaivoo can't be opened because Apple cannot check it for malicious software."** No option to open directly. |
| **Workaround** | User must right-click > Open (or go to System Preferences > Security & Privacy > "Open Anyway"). This warning reappears on every new version. |
| **macOS 15 (Sequoia)+** | Apple further tightened Gatekeeper. The right-click workaround still works but requires navigating to System Settings > Privacy & Security > scroll down > "Open Anyway". More friction than before. |

**Impact on user trust:** The "unidentified developer" / "can't check for malicious software" warning is a significant barrier. Non-technical users will likely abandon the installation. For a product targeting productivity users (Kaivoo's audience), this is a material conversion problem.

### 1.6 Beta Distribution Without Notarization

It is **technically possible** but creates significant friction:

- **Ad hoc distribution:** You can send unsigned `.dmg` files, but every user must perform the right-click workaround
- **Beta testers** who are developers will tolerate this; general users will not
- **Recommendation:** Even for beta/founding member launch, macOS notarization should be considered essential unless the beta audience is exclusively developers

### 1.7 Tauri-Specific: macOS Signing in the Build Process

Tauri 2.0 uses the `tauri-action` GitHub Action (already in Kaivoo's `desktop.yml`). The signing is controlled via environment variables:

| Environment Variable | Purpose |
|---|---|
| `APPLE_CERTIFICATE` | Base64-encoded `.p12` certificate file |
| `APPLE_CERTIFICATE_PASSWORD` | Password for the `.p12` file |
| `APPLE_SIGNING_IDENTITY` | Name of the certificate (e.g., `"Developer ID Application: Your Name (TEAMID)"`) |
| `APPLE_ID` | Apple ID email used for notarization submission |
| `APPLE_PASSWORD` | App-specific password (generated at appleid.apple.com, NOT your Apple ID password) |
| `APPLE_TEAM_ID` | 10-character team identifier |

**These are already scaffolded in Kaivoo's `desktop.yml`** (lines 72-78). When the secrets are populated in GitHub repository settings, signing activates automatically.

The Tauri build process:
1. Compiles the Rust backend + bundles the frontend
2. Creates the `.app` bundle
3. Signs the `.app` with the Developer ID Application certificate
4. Creates the `.dmg` disk image containing the signed `.app`
5. Signs the `.dmg` itself
6. Submits to Apple's notarization service via `notarytool`
7. Waits for approval and staples the ticket
8. Uploads the signed, notarized artifact

All of this happens within `tauri build` / `tauri-action` — no additional scripting required.

---

## 2. Windows Code Signing

### 2.1 Certificates Required

Windows uses **Authenticode** code signing. There are two tiers:

| Certificate Type | SmartScreen Impact | Hardware Requirement | Typical Cost |
|---|---|---|---|
| **OV (Organization Validation)** | Starts with zero reputation; builds over time through downloads/installs | Since June 2023, must be stored on a hardware token (USB) or cloud HSM | $200-500/year |
| **EV (Extended Validation)** | Immediate SmartScreen reputation (bypasses "unknown publisher" warnings from day one) | Always requires hardware token or cloud HSM | $350-600/year |

**Important industry change (2023-2024):** Microsoft and CAs now require ALL code signing certificates (OV and EV) to be stored on FIPS 140-2 Level 2 hardware security modules (HSMs). You can no longer get a simple `.pfx` file for OV certificates. Options:

- **Physical USB token** (e.g., SafeNet/Thales) — shipped by the CA, requires physical access (problematic for CI/CD)
- **Cloud HSM signing** — services like Azure Key Vault, AWS CloudHSM, DigiCert KeyLocker, SSL.com eSigner, Sectigo Code Signing Cloud

### 2.2 Certificate Providers and Costs

| Provider | OV Code Signing | EV Code Signing | Cloud HSM Option |
|---|---|---|---|
| **DigiCert** | ~$499/year | ~$599/year | DigiCert KeyLocker (included with cert) |
| **Sectigo (Comodo)** | ~$209/year | ~$379/year | Sectigo Cloud Signing |
| **SSL.com** | ~$209/year (basic) | ~$349/year | eSigner cloud signing (included) |
| **GlobalSign** | ~$229/year | ~$349/year | Cloud HSM available |
| **SignPath** | Free tier for OSS | Free tier for OSS | Cloud-based (CI/CD native) |

**Note:** Prices fluctuate. Resellers often offer significant discounts on Sectigo and DigiCert certificates.

### 2.3 SmartScreen Reputation

Microsoft SmartScreen is the primary gatekeeper on Windows:

- **EV certificate:** Provides immediate reputation. Users will not see SmartScreen warnings from the first release.
- **OV certificate:** Starts with zero reputation. SmartScreen warnings ("Windows protected your PC" / "Unknown publisher") will appear until enough users have downloaded and installed the app. The reputation threshold is opaque — Microsoft does not publish exact numbers, but community consensus suggests approximately 500-1,000+ installs over several weeks.
- **No certificate:** SmartScreen shows a scary red/orange warning: "Windows protected your PC — Microsoft Defender SmartScreen prevented an unrecognized app from starting." Users must click "More info" > "Run anyway."

### 2.4 What Happens WITHOUT Signing

| Scenario | User Experience |
|---|---|
| **Unsigned app** | SmartScreen red warning. "Microsoft Defender SmartScreen prevented an unrecognized app from starting. Running this app might put your PC at risk." Requires clicking "More info" then "Run anyway." Chrome/Edge may also flag the download. |
| **OV-signed (new)** | SmartScreen yellow/blue warning initially: "Windows protected your PC — The publisher could not be verified." Less scary than unsigned. Builds reputation over time. |
| **EV-signed** | No SmartScreen warning. Clean install experience from day one. |

### 2.5 Beta Distribution Without Signing

- **Feasible for technical beta testers** who understand the SmartScreen workaround
- **Not recommended for general users** — the red SmartScreen warning is alarming and undermines trust
- Windows Defender may also quarantine unsigned executables in some configurations
- **Recommendation:** Get at minimum an OV certificate before distributing to non-developer users. EV is strongly preferred for a polished launch.

### 2.6 Tauri-Specific: Windows Signing in the Build Process

Tauri 2.0 supports Windows code signing via environment variables (already scaffolded in `desktop.yml` lines 80-81):

| Environment Variable | Purpose |
|---|---|
| `WINDOWS_CERTIFICATE` | Base64-encoded `.pfx` certificate file (for legacy file-based certs) |
| `WINDOWS_CERTIFICATE_PASSWORD` | Password for the `.pfx` file |

**However**, due to the 2023 HSM requirement, the traditional `.pfx` approach may not work with new certificates. Modern approaches for CI/CD:

**Option A: Azure Trusted Signing (Recommended — Best Value)**
- Microsoft's own managed code signing service (launched 2024)
- ~$9.99/month (~$120/year) — significantly cheaper than traditional CAs
- Includes EV-equivalent SmartScreen reputation from day one
- Integrates with GitHub Actions via `azure/trusted-signing-action`
- Requires an Azure subscription (free tier available)
- This is emerging as the most cost-effective option for small teams

**Option B: Cloud HSM via Certificate Authority**
- Use a cloud signing service (SSL.com eSigner, DigiCert KeyLocker)
- Add a post-build signing step in the GitHub Actions workflow
- The `tauri-action` creates the unsigned `.exe`/`.msi`/`.nsis`, then a subsequent step signs it via API

**Option C: SignPath.io**
- Free for open-source projects
- Paid plans for commercial software (~$150+/month)
- CI/CD native — designed specifically for build pipeline integration

Tauri's `.nsis` (NSIS installer) and `.msi` (WiX installer) outputs are the files that need signing. The build creates the installer, and signing is applied to the final artifact.

---

## 3. Linux Distribution

### 3.1 Is Signing Relevant?

Linux has **no centralized code signing enforcement** equivalent to macOS Gatekeeper or Windows SmartScreen. There is no gatekeeper that blocks unsigned applications.

### 3.2 Standard Practice by Format

| Format | Signing Practice | Impact of Not Signing |
|---|---|---|
| **AppImage** | No standard signing mechanism. AppImage has an optional signature spec, but almost no one uses it. Users are accustomed to downloading and running unsigned AppImages. | None — this is the norm. |
| **.deb (Debian/Ubuntu)** | Packages in official repositories are GPG-signed by the repository maintainer. For direct downloads, signing is uncommon. Users installing `.deb` files via `dpkg -i` see no signature check. | No user-visible impact for direct download distribution. |
| **.rpm (Fedora/RHEL)** | RPM has built-in GPG signing support. Repository packages are signed. Direct downloads are sometimes signed but enforcement is optional. | No user-visible impact for direct download distribution. |
| **Flatpak/Snap** | Store-based distribution handles signing automatically. | N/A — handled by the store. |

### 3.3 Recommendation for Linux

- **Do nothing** for the initial release. Linux users expect to install software via direct download without signing.
- If Kaivoo later establishes its own APT/DNF repository, set up GPG signing for the repository metadata at that time.
- AppImage is the most universal Linux format and requires no signing infrastructure.
- Tauri 2.0 produces `.deb` and `.AppImage` by default on Linux. Both work without signing.

---

## 4. CI/CD Integration

### 4.1 Current State (Kaivoo)

Kaivoo's `desktop.yml` already has:
- A 3-platform build matrix (macOS universal, Ubuntu 22.04, Windows latest)
- `tauri-action@v0` for building
- Placeholder environment variables for macOS and Windows signing secrets
- Artifact upload for all bundle formats

The infrastructure is ready — it only needs the actual secrets populated.

### 4.2 Storing Certificates Securely in GitHub Actions

| Secret | How to Generate | Storage |
|---|---|---|
| `APPLE_CERTIFICATE` | Export the Developer ID Application certificate from Keychain Access as `.p12`, then `base64 -i certificate.p12` | GitHub repository secret |
| `APPLE_CERTIFICATE_PASSWORD` | The password you set when exporting the `.p12` | GitHub repository secret |
| `APPLE_SIGNING_IDENTITY` | The exact name from Keychain, e.g., `"Developer ID Application: Kaivoo LLC (ABC123DEF4)"` | GitHub repository secret |
| `APPLE_ID` | Your Apple Developer account email | GitHub repository secret |
| `APPLE_PASSWORD` | App-specific password from appleid.apple.com > Sign-In and Security > App-Specific Passwords | GitHub repository secret |
| `APPLE_TEAM_ID` | Found in Apple Developer Portal > Membership | GitHub repository secret |
| `WINDOWS_CERTIFICATE` | For cloud HSM: API credentials for the signing service. For legacy `.pfx`: `base64 -i cert.pfx` | GitHub repository secret |
| `WINDOWS_CERTIFICATE_PASSWORD` | Password for the `.pfx` or API key for the cloud HSM service | GitHub repository secret |

### 4.3 macOS CI/CD Flow (Ready to Activate)

The current `desktop.yml` workflow will handle macOS signing automatically once secrets are set. **No workflow changes needed.** Steps that `tauri-action` performs internally:

1. Decodes the base64 certificate and imports it into the CI keychain
2. Signs the app bundle with the Developer ID Application identity
3. Creates and signs the `.dmg`
4. Submits to Apple notarization service via `notarytool`
5. Polls for completion (typically 2-10 minutes)
6. Staples the notarization ticket to the `.dmg`
7. Uploads the signed, notarized artifact

### 4.4 Windows CI/CD Flow (May Need Modification)

The current `desktop.yml` has `WINDOWS_CERTIFICATE` and `WINDOWS_CERTIFICATE_PASSWORD`, which work for legacy `.pfx`-based signing. For modern HSM-based signing, you would need to add a step after the Tauri build.

**Example for Azure Trusted Signing (if chosen):**

```yaml
- name: Sign Windows artifacts
  if: matrix.platform == 'windows-latest'
  uses: azure/trusted-signing-action@v0
  with:
    azure-tenant-id: ${{ secrets.AZURE_TENANT_ID }}
    azure-client-id: ${{ secrets.AZURE_CLIENT_ID }}
    azure-client-secret: ${{ secrets.AZURE_CLIENT_SECRET }}
    endpoint: https://eus.codesigning.azure.net/
    trusted-signing-account-name: ${{ secrets.SIGNING_ACCOUNT }}
    certificate-profile-name: ${{ secrets.CERTIFICATE_PROFILE }}
    files-folder: daily-flow/src-tauri/target/release/bundle/nsis/
    files-folder-filter: exe
```

**Example for SSL.com eSigner:**

```yaml
- name: Sign Windows artifacts
  if: matrix.platform == 'windows-latest'
  uses: sslcom/esigner-codesign@main
  with:
    command: sign
    username: ${{ secrets.SSLCOM_USERNAME }}
    password: ${{ secrets.SSLCOM_PASSWORD }}
    totp_secret: ${{ secrets.SSLCOM_TOTP }}
    file_path: daily-flow/src-tauri/target/release/bundle/nsis/Kaivoo_0.1.0_x64-setup.exe
```

### 4.5 Linux CI/CD Flow

No changes needed. Linux builds do not require signing.

---

## 5. Cost Summary

### 5.1 Essential (Minimum for Distribution)

| Item | Cost | Frequency |
|---|---|---|
| Apple Developer Program | $99 | Annual |
| **Subtotal** | **$99/year** | |

### 5.2 Recommended (Smooth User Experience on Both Platforms)

| Item | Cost | Frequency |
|---|---|---|
| Apple Developer Program | $99 | Annual |
| Azure Trusted Signing | ~$120 (~$9.99/mo) | Annual |
| **Subtotal** | **~$219/year** | |

### 5.3 Traditional (Full CA Certificate Route)

| Item | Cost | Frequency |
|---|---|---|
| Apple Developer Program | $99 | Annual |
| OV Code Signing Cert (SSL.com/Sectigo) | $209-499 | Annual |
| Cloud HSM addon (if not included) | $0-120 | Annual |
| **Subtotal** | **~$308-$619/year** | |

---

## 6. Timeline & Priority

### 6.1 What's Required vs. What Can Be Deferred

| Item | Priority | Reasoning |
|---|---|---|
| **macOS notarization** | **REQUIRED for any user-facing release** | Without it, macOS users cannot easily install the app. The Gatekeeper warning is a hard blocker for non-developer users. macOS Sequoia makes it even harder to bypass. |
| **Windows OV/EV signing** | **STRONGLY RECOMMENDED for launch** | SmartScreen warnings scare users. An unsigned app may be flagged or quarantined. EV eliminates warnings immediately; OV requires reputation buildup. |
| **Linux signing** | **DEFER indefinitely** | Not needed. Linux users expect unsigned direct downloads. |

### 6.2 Minimum Viable Signing Setup for Beta/Founding Member Launch

**Phase 1: Before First Beta (1-2 days of setup time)**
1. Enroll in Apple Developer Program ($99) — immediate for individual
2. Generate Developer ID Application certificate
3. Create app-specific password for notarization
4. Populate the 6 macOS secrets in GitHub repository settings
5. Run a test build to verify notarization succeeds

**Phase 2: Before Public/Founding Member Launch (1-3 days)**
1. Set up Azure Trusted Signing ($9.99/month) OR purchase an OV/EV cert from SSL.com
2. Add Windows signing step to `desktop.yml` if using cloud HSM
3. Populate Windows signing secrets
4. Run a test build to verify signing

**Phase 3: Deferred**
- Linux repository signing (only if/when an APT/DNF repository is established)
- Mac App Store submission (different certificate type, different process entirely)

---

## 7. Recommendation for Kaivoo

### The Simplest Viable Path

**For beta/founding member launch, Kaivoo needs exactly two things:**

#### Step 1: Apple Developer Program Enrollment — $99/year (DO THIS FIRST)

- Enroll at developer.apple.com/programs/enroll/
- Individual enrollment is fastest (same day)
- Organization enrollment requires D-U-N-S number (1-2 weeks)
- Generate a "Developer ID Application" certificate from the portal
- Export it as `.p12` from Keychain Access
- Create an app-specific password at appleid.apple.com
- Populate the 6 `APPLE_*` secrets in GitHub repository settings
- **The existing `desktop.yml` handles everything else automatically**

#### Step 2: Azure Trusted Signing — ~$9.99/month ($120/year) (BEST VALUE FOR WINDOWS)

- This is Microsoft's own code signing service, launched in 2024
- Provides **EV-equivalent SmartScreen reputation from day one** at a fraction of traditional EV cert cost
- No physical USB token needed — fully cloud-based, CI/CD friendly
- Requires an Azure account (free tier exists; signing is the only paid component)
- Add the `azure/trusted-signing-action` step to `desktop.yml` after the Tauri build
- Alternative: SSL.com eSigner with OV cert (~$209/year) if Azure is not preferred

#### Step 3: Linux — Do Nothing

No signing needed. Ship the `.AppImage` and `.deb` as-is.

### Total Annual Cost: ~$219/year

This gets Kaivoo:
- Clean macOS installation (no Gatekeeper warnings, fully notarized)
- Clean Windows installation (no SmartScreen warnings from day one)
- Linux works out of the box without any signing

### What's Already Done in the Codebase

The project's `desktop.yml` CI/CD workflow is already structured correctly:
- macOS signing environment variables are scaffolded (lines 72-78)
- Windows signing environment variables are scaffolded (lines 80-81)
- The `tauri-action` handles the macOS signing/notarization pipeline internally
- Artifact upload captures all signed bundles
- Only the actual secret values need to be populated

### Action Items (Ordered)

1. **Enroll in Apple Developer Program** (1 day, $99)
2. **Generate Developer ID Application certificate** and export as `.p12` (30 minutes)
3. **Create app-specific password** at appleid.apple.com (5 minutes)
4. **Populate macOS secrets** in GitHub repo settings (10 minutes)
5. **Test a macOS build** to verify notarization (30 minutes)
6. **Set up Azure Trusted Signing** ($9.99/month) OR purchase SSL.com OV cert (1-2 hours)
7. **Add Windows signing step** to `desktop.yml` if using cloud HSM approach (30 minutes)
8. **Populate Windows secrets** in GitHub repo settings (10 minutes)
9. **Test a Windows build** to verify signing (30 minutes)

**Total estimated setup time:** 1-2 days (mostly waiting for Apple enrollment approval)

### Risk Note

If budget is a constraint for the very first beta (founding members only who are known and technical), it is possible to defer ALL signing and instruct beta testers to bypass Gatekeeper (macOS) and SmartScreen (Windows) manually. However, this creates a poor first impression and should only be considered for a closed alpha with fewer than ~10 technical testers. For any distribution beyond that — including a founding member launch — signing is essential.

---

*Agent 5 Research — March 3, 2026*
*Research compiled from Tauri 2.0 documentation, Apple Developer documentation, Microsoft code signing requirements, and certificate authority pricing.*
