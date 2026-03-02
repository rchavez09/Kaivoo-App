# AI Agent & Workshop Sandboxing — Detailed Security Design

**Source:** Extracted from Agent 4 Security & Reliability spec, Section 7
**Parent:** [Agent-4-Security-Reliability-Engineer.md](../Agent-4-Security-Reliability-Engineer.md)

---

# 7. AI Agent & Workshop Sandboxing

## 7.1 Why This Is the Highest Risk

```
THE RISK:
  The Concierge dispatches AI agents that can:
    - Read files from the Vault
    - Write files to the Vault
    - Execute code (Workshop builds)
    - Install npm packages (plugins)
    - Modify their own agent definitions

  A compromised or hallucinating agent could:
    - Delete critical files
    - Exfiltrate data via API calls
    - Install malicious packages
    - Modify other agents to propagate bad behavior
    - Overwrite the Soul file with manipulated context
```

## 7.2 Agent Permission Model

```
PERMISSION LEVELS:

  Level 0: READ-ONLY
    Can: Read files in specified directories
    Cannot: Write, delete, execute, network calls
    Use for: Research agents, analysis, search

  Level 1: READ + WRITE (SCOPED)
    Can: Read anywhere in Vault, write ONLY to Agent Workspace/
    Cannot: Delete outside workspace, execute, modify agents/skills
    Use for: Content creation agents (PPT creator, journal analyst)

  Level 2: READ + WRITE + EXECUTE (SUPERVISED)
    Can: All of Level 1, plus execute code in sandboxed environment
    Cannot: Modify .kaivoo/, access network, install global packages
    Requires: User approval gate (Level 1 or Level 2 in Workshop)
    Use for: Builder agents, plugin creators

  Level 3: FULL ACCESS (MANUAL APPROVAL ONLY)
    Can: Everything including .kaivoo/ modifications
    Requires: Explicit user approval for EACH action
    Use for: System maintenance, migration tasks
    NEVER: Automated or unattended
```

## 7.3 Agent Sandboxing Implementation

```typescript
// Each agent invocation gets a scoped context
interface AgentContext {
  agentName: string;
  permissionLevel: 0 | 1 | 2 | 3;
  readPaths: string[];          // Allowed read directories
  writePath: string;            // Single write directory
  maxFileSize: number;          // Max bytes per file write
  maxFiles: number;             // Max files per invocation
  allowNetwork: boolean;        // Can make external API calls
  allowExecute: boolean;        // Can run code
  timeout: number;              // Max execution time (ms)
}

// Example: PPT Creator Agent
const pptCreatorContext: AgentContext = {
  agentName: 'ppt-creator',
  permissionLevel: 1,
  readPaths: ['Brand Guidelines/', 'Projects/'],
  writePath: 'Agent Workspace/Presentations/',
  maxFileSize: 50 * 1024 * 1024,  // 50MB
  maxFiles: 10,
  allowNetwork: false,
  allowExecute: false,
  timeout: 5 * 60 * 1000,  // 5 minutes
};
```

## 7.4 Workshop Plugin Sandboxing

```
PLUGIN ISOLATION:

  Widgets (React components):
    - Run in an <iframe> with sandbox attributes
    - sandbox="allow-scripts" (no allow-same-origin)
    - postMessage API for communication with host
    - Cannot access cookies, localStorage, or DOM of main app
    - CSP restricts network access to Hub API only

  MCP Plugins (Node.js processes):
    - Spawned as child_process with restricted env
    - No access to VAULT_ROOT or .kaivoo/ directly
    - Communicate only via stdin/stdout (MCP protocol)
    - Resource limits: max 512MB memory, 30s execution time
    - No network access unless explicitly granted in manifest

  npm Dependencies (for plugins):
    - Installed in plugin-specific node_modules (isolated)
    - NOT installed globally or in Hub's node_modules
    - Package audit before installation (npm audit)
    - Lockfile required for reproducibility
```

## 7.5 AI Prompt Injection Defenses

```
DEFENSE LAYERS:

  1. SYSTEM PROMPT BOUNDARIES
     Agent system prompts include explicit boundaries:
     "You are operating within Kaivoo Hub. You may ONLY:
      - Read files from: [allowed paths]
      - Write files to: [allowed path]
      - You may NOT access, modify, or reference the .kaivoo directory.
      - You may NOT make network requests.
      - You may NOT modify your own agent definition."

  2. OUTPUT VALIDATION
     All agent outputs are validated before execution:
     - File paths checked against allowed directories
     - Code outputs scanned for dangerous patterns (eval, exec, fetch)
     - File sizes checked against limits
     - No execution of agent output without approval gate (Level 1+)

  3. INPUT SANITIZATION
     User inputs passed to agents are wrapped:
     - Clear delimiter between system instructions and user content
     - User content marked as untrusted data
     - Agent instructed to treat user content as data, not instructions

  4. SOUL FILE PROTECTION
     The Soul file (.kaivoo/soul.md) is READ-ONLY for agents:
     - Only the user can edit the Soul file (via Settings UI)
     - Agents can reference it for context
     - Agents CANNOT propose modifications to the Soul file
     - Any attempt to write to soul.md is blocked and logged
```
