# Dependency & Supply Chain Security — Detailed Security Design

**Source:** Extracted from Agent 4 Security & Reliability spec, Section 9
**Parent:** [Agent-4-Security-Reliability-Engineer.md](../Agent-4-Security-Reliability-Engineer.md)

---

# 9. Dependency & Supply Chain Security

## 9.1 npm Security Controls

```
RULES:

  1. LOCKFILE INTEGRITY
     - package-lock.json is committed to git
     - CI/deployment uses `npm ci` (not `npm install`)
     - Lockfile changes reviewed manually

  2. AUDIT ON INSTALL
     - Run `npm audit` on every install
     - Block installs with critical vulnerabilities
     - Review high-severity findings weekly

  3. DEPENDENCY REVIEW
     - New dependencies require justification
     - Prefer well-maintained packages (>1M weekly downloads)
     - Prefer packages with few transitive dependencies
     - Check package for known supply chain issues (Socket.dev)

  4. AUTOMATED SCANNING
     - Enable GitHub Dependabot (or manual weekly audit)
     - Renovate/Dependabot for automated update PRs
     - Pin exact versions in package.json (no ^)
```

## 9.2 Plugin Dependency Isolation

```
PLUGIN npm PACKAGES:

  Hub node_modules/        ← Hub server dependencies (trusted)
  plugins/
    widget-a/
      node_modules/        ← Widget A's dependencies (isolated)
      package.json
    mcp-b/
      node_modules/        ← MCP B's dependencies (isolated)
      package.json

  Plugins CANNOT require() from Hub's node_modules.
  Plugins CANNOT modify Hub's package.json or lockfile.
  Each plugin has its own install + audit cycle.
```
