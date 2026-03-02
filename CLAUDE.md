# Kaivoo Control Center

## Project Structure

- `daily-flow/` — The React application (Vite + React 18 + TypeScript + Supabase)
- `Branding/` — Brand identity and design system documents
- `Agents/` — Multi-agent coordination system (see below)

## Agent System

### The CEO
`Agents/CEO.md` — Strategic layer above all operations. Activated with **"CEO mode"** prefix. Brainstorms market opportunities, challenges assumptions, synthesizes scattered ideas into strategic themes, and hands direction to the Director. This is the strategy room — not for sprint planning.

### The Director
`Agents/Director.md` — The operational orchestrator (COO role). Activated with **"Director mode"** prefix, or by default for sprint planning. Sits above all departments. Translates strategic direction from CEO sessions into executable sprints. When you need to plan a sprint or coordinate agents, start here.

### Vision
`Agents/Vision.md` — The North Star. A living roadmap that all sprints lead toward. Updated as phases complete.

### Departments

| Department | Folder | Agents |
|---|---|---|
| Product | `Agents/Product/` | Agent 8 (Product Manager) |
| Engineering | `Agents/Engineering/` | Agent 2 (Software Engineer), Agent 3 (Architect), Agent 4 (Security), Agent 12 (Data Engineer) |
| DevOps | `Agents/DevOps/` | Agent 9 (DevOps Engineer) |
| Quality | `Agents/Quality/` | Agent 7 (Code Reviewer), Agent 10 (QA Architect — activates Sprint 4+), Agent 11 (Feature Integrity Guardian) |
| Design | `Agents/Design/` | Visual Design Agent, Accessibility & Theming Agent, UX Completeness Agent |
| Research | `Agents/Research/` | Agent 5 (Research Analyst) |
| Marketing | `Agents/Marketing/` | TBD |

### Sprint System
- Protocol: `Agents/Sprints/Sprint-Protocol.md`
- Sprint files: `Agents/Sprints/Sprint-{N}-{Theme}.md` (highest number = current)
- Planning: `Agents/Sprints/Next-Sprint-Planning.md`

## Commands

All commands run from `daily-flow/`:

```bash
npm run dev          # Start dev server (Vite)
npm run build        # Production build
npm run test         # Run tests (Vitest)
npm run test:watch   # Tests in watch mode
npm run test:coverage # Tests with coverage report
npm run lint         # ESLint
npm run format:check # Prettier check
npm run format       # Prettier fix
npm run typecheck    # TypeScript type check (tsc --noEmit)
```

**Pre-commit quality check:** `cd daily-flow && npm run lint && npm run typecheck && npm run test && npm run build`

**Deploy to production:** Merge PR to `main` on GitHub → Netlify auto-deploys via `netlify.toml`
**Deploy previews:** Open PR from sprint branch → Netlify generates a preview URL automatically
**Manual deploy (fallback only):** `cd daily-flow && npm run build && npx netlify-cli deploy --prod --dir=dist --site de0f2e66-5652-4a86-952c-9ee803e80893`

## Key Rules

1. **When invoking an agent**, load ONLY their main `.md` spec file — not their Docs/ folder
2. **Agent Docs/ folders** contain findings and concerns — read these during sprint planning
3. **Agent spec files** contain ONLY role/spec/instructions — never sprint-specific content
4. **Sprint files** are never deleted — they are historical records
5. **Agent documents** are archived (`ARCHIVED-` prefix), never deleted
6. **The Director** orchestrates all sprint planning through `Vision.md` and `Sprint-Protocol.md`
7. **Sprint work** happens on dedicated branches (`sprint/N-theme`), never directly on `main` — see Sprint Protocol v1.7
8. **Before merging to main**, Agent 7 (code) AND Agent 11 (feature integrity) AND all 3 design agents AND E2E tester must pass
9. **Production deploys** happen automatically when PRs merge to `main` via Netlify — no manual deploys
10. **Sandbox testing** uses Netlify deploy preview URLs (accessible from any device), not localhost
