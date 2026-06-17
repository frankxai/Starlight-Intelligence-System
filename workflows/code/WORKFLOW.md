# Code IS Workflow

> Product & Automation Intelligence — design systems, ship code, automate operations, and build the substrate that makes everything else possible.

Built on SIP — Starlight Intelligence Protocol v1.1.1

---

## Trigger Conditions

- "Build / design / architect [system or feature]"
- "Review this code / PR / architecture"
- "Automate this workflow / operation"
- "Debug this / something is broken"
- "What's the state of my repos / codebase?"

## Input Schema

```yaml
inputs:
  - name: repo_context
    type: object
    required: false
    description: "Repo name, tech stack, current branch, relevant file paths."
  - name: task_description
    type: string
    required: true
    description: "What needs to be built, reviewed, debugged, or automated."
  - name: mode
    type: string
    required: true
    description: "One of: build | review | automate | debug | repo-audit | architecture-design"
  - name: harness
    type: string
    required: false
    description: "Active harness (claude-code|cursor|codex|gemini-cli|opencode). Defaults to claude-code."
  - name: agent_branch
    type: string
    required: false
    description: "Git branch for this agent's scope (agent/{harness}/{scope}). Required for multi-agent sessions."
```

## Workflow Steps

### Step 1 — Repo and Tech Context Load
**Agent:** starlight-sentinel  
**Skill:** memory/vault-management  
**Action:** Load repo state from technical-vault: last known architecture, active branches, agent board, tech stack decisions, and prior code review patterns. Check `.agent/active-agents.md` if it exists — never take a scope that overlaps another live agent. Load Karpathy hygiene rules from CLAUDE.md.  
**Output:** `repo-context.json` — architecture state, agent scopes, tech stack, quality baselines.

### Step 2 — Task Decomposition
**Agent:** starlight-orchestrator  
**Skill:** orchestration/parallel-execution  
**Action:** Decompose the task into atomic units. For build: spec -> architecture -> implementation -> tests. For debug: reproduce -> isolate -> fix -> verify. For automate: map workflow -> design hooks -> implement -> test. Assign each unit to the correct sub-agent or harness. Output the execution plan before touching any file.  
**Output:** `task-plan.md` — decomposed units with sequencing, agent assignments, and success criteria.

### Step 3 — Architecture Design
**Agent:** starlight-architect  
**Skill:** intelligence/systems-thinking  
**Action:** If architecture-design or build mode: design the system before writing code. Apply: no abstractions until second use site, surgical edits, trust internal callers, minimum code principle. Produce architecture doc with data model, interface contracts, and integration points.  
**Output:** `architecture.md` — system design with data model, contracts, and rationale.

### Step 4 — Implementation or Review
**Agent:** starlight-sentinel  
**Skill:** intelligence/pattern-recognition  
**Action:** If build: execute implementation plan against architecture. Match surrounding style, touch only what the task requires. If review: apply security scan, quality check, Karpathy hygiene audit. Flag hallucinated APIs, stale library assumptions, and speculative abstractions.  
**Output:** Code changes (via Edit/Write tools) or `review-report.md` with findings.

### Step 5 — Automation Layer
**Agent:** starlight-architect  
**Skill:** orchestration/workflow-design  
**Action:** If automate mode: design the automation as hooks, scripts, or MCP tools. Prefer idempotent operations. Document the trigger, action, and verification for each automation unit. Wire into the claude-code-hooks system where applicable.  
**Output:** `automation-spec.md` — trigger/action/verify for each automation unit, plus implementation.

### Step 6 — Vault Write + Git State
**Agent:** starlight-orchestrator  
**Skill:** memory/context-preservation  
**Action:** Write architecture decisions to technical-vault, review findings to operational-vault, and any reusable patterns to wisdom-vault. Update `active-agents.md` to reflect completed scope. Never commit unless explicitly asked — report what changed and why.  
**Output:** Vault atoms x3, agent board update.

## Hermes Swarm Config

Which Hermes agent profiles handle tasks in this workflow:
- Primary: hermes-code-specialist (405B — architecture design, complex system reasoning, security review, automation design)
- Support: hermes-code-executor (70B — task decomposition, fast code review, vault writes, repo state tracking)

## Output Artifacts

1. `repo-context.json` — Architecture state, agent scopes, tech stack baselines
2. `task-plan.md` — Decomposed execution plan with sequencing and success criteria
3. `architecture.md` — System design with data model, interface contracts, and rationale
4. `review-report.md` — Code review findings with security, quality, and hygiene flags
5. `automation-spec.md` — Trigger/action/verify specification for automation units

## Vault Routing

Which vaults get written:
- **Strategic:** Major architecture decisions, tech stack pivots, repo strategy changes
- **Technical:** Architecture docs, proven code patterns, API contracts, system designs, debug findings
- **Operational:** Active build state, current PR status, agent scopes, automation run logs
- **Wisdom:** Reusable code patterns, debugging heuristics, Karpathy hygiene lessons

## Commands

| Command | Triggers | Description |
|---------|----------|-------------|
| `/build` | "build this", "implement", "create feature", "ship this" | Full build workflow — task decomposition, architecture design, implementation, tests |
| `/code-review` | "review this code", "PR review", "security check" | Code review with security scan, quality check, and Karpathy hygiene audit |
| `/automate` | "automate this", "build a hook", "make this automatic" | Automation design — maps workflow, designs hooks/scripts/MCP tools, implements and verifies |
| `/repo-audit` | "state of my repos", "what's in progress", "codebase audit" | Multi-repo audit — branch state, agent scopes, tech debt signals, and architecture drift |

---
*Built on SIP — Starlight Intelligence Protocol v1.1.1*  
*Substrate: starlightintelligence.org/protocol v1.1.1*
