# Starlight Intelligence System — Architecture Guide
## June 2026 Reference Build

> **Who this is for:** Solution architects, AI engineers, and operators building on the SIS stack. This document covers how all pieces fit together — from your phone to your VPS to your local machine to Vercel and Railway. Read this before touching config files.

---

## Table of Contents

1. [The Mental Model](#1-the-mental-model)
2. [The Full Stack Map](#2-the-full-stack-map)
3. [The 10 Intelligence Systems](#3-the-10-intelligence-systems)
4. [Repo Ecosystem Map](#4-repo-ecosystem-map)
5. [Agent Architecture](#5-agent-architecture)
6. [Multi-Agent Orchestration Patterns](#6-multi-agent-orchestration-patterns)
7. [MCP Architecture](#7-mcp-architecture)
8. [Infrastructure Topology](#8-infrastructure-topology)
9. [The Hermes + Claude Code + OpenClaw Stack](#9-the-hermes--claude-code--openclaw-stack)
10. [Cross-Surface Data Flow](#10-cross-surface-data-flow)
11. [Security & Secrets](#11-security--secrets)
12. [Observability & Evals](#12-observability--evals)
13. [Deployment Runbook](#13-deployment-runbook)

---

## 1. The Mental Model

SIS is a **sovereign intelligence substrate** — not an app, not a framework, not a chatbot. It is the persistent memory, identity, and governance layer that your entire AI fleet shares.

```
Your Intent
    │
    ▼
┌─────────────────────────────────────────────────────┐
│         STARLIGHT INTELLIGENCE SYSTEM (SIS)          │
│  ┌─────────────────────────────────────────────────┐ │
│  │  SIP — Starlight Intelligence Protocol          │ │
│  │  Contract · Attestation · MCP registry          │ │
│  └─────────────────────────────────────────────────┘ │
│  ┌──────────┐  ┌───────────┐  ┌────────────────────┐ │
│  │ 6 Vaults │  │ MCP Server│  │ 56 Agents / 77 Skills│ │
│  │  JSONL   │  │ sis_* tools│  │ Council + Specialists│ │
│  └──────────┘  └───────────┘  └────────────────────┘ │
└─────────────────────────────────────────────────────┘
    │               │               │
    ▼               ▼               ▼
Claude Code      Cursor         Codex / Gemini CLI
    │               │               │
    └───────────────┴───────────────┘
                    │
                    ▼
         Agentic OS Family
   (Creator OS / Business OS / etc.)
```

**Three things architects must internalize:**

1. **SIS is the shared brain.** Every coding agent, every surface, every repo gets the same memory, identity, and governance via the MCP server. Per-tool memory is table stakes — cross-tool, cross-repo, attested memory is the SIS value.

2. **The 10 IS taxonomy is locked.** You do not add Intelligence Systems to the table. You compose domain sub-stacks inside existing IS slots. This prevents org chart sprawl.

3. **SIP is the contract layer.** Every repo in the ecosystem declares its SIP compliance. This is how alliances (other builders using the stack) interoperate without losing sovereignty.

---

## 2. The Full Stack Map

```
┌─────────────────────────── SURFACE LAYER ───────────────────────────────┐
│  Phone (Telegram)  │  Browser  │  IDE (Cursor/Windsurf)  │  Terminal     │
└────────────────────┴───────────┴────────────────────────┴────────────────┘
                              │
          ┌───────────────────┼───────────────────┐
          ▼                   ▼                   ▼
┌─────────────────┐  ┌────────────────┐  ┌──────────────────┐
│  HERMES AGENT   │  │ OPENCLAW GATE  │  │  CLAUDE CODE     │
│  (VPS · always- │  │  (Railway ·    │  │  (local machine ·│
│   on orchestrat)│  │   event router)│  │   coding exec)   │
└────────┬────────┘  └───────┬────────┘  └────────┬─────────┘
         │                   │                    │
         └───────────────────┼────────────────────┘
                             │  MCP Bridge (SSH stdio / Railway WS)
                             ▼
┌────────────────────────────────────────────────────────────────┐
│                   SIS MCP SERVER                               │
│  sis_read · sis_write · sis_search · sis_attest                │
│  sis_council · sis_harvest · sis_validate · sis_skill_check    │
│  sis_cost_tick · sis_yolo_scope                                │
│  ──────────────────────────────────────────────────────────    │
│  6 Semantic Vaults (JSONL)   SQLite + FTS5 index               │
│  ~/.starlight/vaults/        ~/.starlight/index.db             │
└────────────────────────────────────────────────────────────────┘
                             │
         ┌───────────────────┼───────────────────┐
         ▼                   ▼                   ▼
┌────────────────┐  ┌─────────────────┐  ┌──────────────────┐
│  Vercel        │  │  Railway        │  │  Local Machine   │
│  frankx.ai     │  │  OpenClaw gate  │  │  Git worktrees   │
│  arcanea.ai    │  │  API backends   │  │  Claude Code     │
│  starlightin.. │  │  Hermes crons   │  │  Gemini CLI      │
└────────────────┘  └─────────────────┘  └──────────────────┘
```

---

## 3. The 10 Intelligence Systems

The taxonomy is **locked**. Do not add rows. Compose domain sub-stacks inside existing IS slots.

| # | Public Name | Premium Label | Substrate Home | Primary Repo |
|---|---|---|---|---|
| 1 | Self IS | Founder Performance Intelligence | `verticals/self/` | SIS |
| 2 | Wealth IS | Capital & Deal Intelligence | `verticals/wealth/` | SIS |
| 3 | Family IS | Family Office Intelligence | `verticals/family/` | SIS |
| 4 | Business IS | Executive Operating Intelligence | `verticals/business/` | `agentic-business-os` |
| 5 | Creator IS | Media & Influence Intelligence | `verticals/sound-intelligence/` | `agentic-creator-os` |
| 6 | Second Brain IS | Private Knowledge Intelligence | `verticals/secondbrain/` | SIS |
| 7 | Code IS | Product & Automation Intelligence | `verticals/code/` | SIS |
| 8 | Voice & Video IS | Narrative Media Intelligence | `verticals/voice-video/` | SIS |
| 9 | Brand IS | Reputation & Positioning Intelligence | `verticals/brand/` | `frankx.ai-vercel-website` |
| 10 | **Starlight Orchestrator** | Private Intelligence Office | `core/orchestrator/` | SIS (this repo) |

### Domain Sub-Stacks (compose inside IS rows)

| Sub-Stack | Parent IS | Repos |
|---|---|---|
| People Intelligence | Business IS (#4) | SIS `verticals/people-intelligence/` |
| Sound Intelligence | Creator IS (#5) | SIS `verticals/sound-intelligence/` |
| Music IS | Creator IS (#5) | SIS `verticals/music-is/` |
| Crypto Intelligence | Wealth IS (#2) | SIS `verticals/wealth/` |
| Ocean / Marine Intelligence | Code IS (#7) | `blue-life-commons` |
| Arcanea Intelligence | Creator IS (#5) | `arcanea-ai-app` |

---

## 4. Repo Ecosystem Map

```
frankxai/ (GitHub org)
│
├── Starlight-Intelligence-System    ← SUBSTRATE (this repo)
│   ├── SIP.md, STACK.md, SIS.md     Protocol specs
│   ├── agents/                      56 agents (council + specialists)
│   ├── skills/                      77 auto-activating skills
│   ├── verticals/                   10 IS implementations
│   ├── src/                         MCP server TypeScript source
│   ├── core/                        Orchestrator runtime
│   └── .claude/commands/            100+ slash commands
│
├── agentic-creator-os               Layer 1: Creator OS (v11)
│   ├── template/                    Instantiable starter
│   ├── packs/                       Skill packs
│   └── Built on SIS substrate
│
├── agentic-business-os              Layer 1: Business OS
│   ├── template/                    Next.js site + agent harness
│   ├── packs/                       Skill packs
│   └── Built on SIS substrate
│
├── arcanea-ai-app                   Vertical product (Creator IS)
│   └── arcanea.ai
│
├── frankx.ai-vercel-website         Brand IS (#9)
│   └── frankx.ai
│
├── claude-skills-library            Shared skills registry
│
├── prompt-library                   Shared prompt registry
│
├── starlight                        SIP adoption kit (minimal fork)
│
├── blue-life-commons                Ocean Intelligence (public corpus)
│
├── cosmic-landing-template          Shared UI template
│
├── arcanea-claw                     OpenClaw integration for Arcanea
│
└── vibe-os / library-os / bless     Vertical products
```

### Downstream inheritance rule

Every OS-family repo carries:
```
LAYER 0  →  Starlight-Intelligence-System  (substrate, SIP)
LAYER 1  →  OS repo (Creator OS, Business OS, etc.)
LAYER 2  →  Instance (your brand's private fork)
```

The `harness-sync.mjs` script opens readable PRs when the substrate improves. **Never auto-merges.**

---

## 5. Agent Architecture

### The 7-Archetype Council (top tier)

The Council is the governance and wisdom layer — not execution agents, but review, arbitration, and decision agents.

| Archetype | Role | Bias |
|---|---|---|
| Feminine | Relational coherence, user empathy, narrative | Synthesis |
| Masculine | Structural integrity, delivery, accountability | Execution |
| Neutral | Epistemic clarity, evidence weighing | Analysis |
| Divine | Sovereign vision, long-horizon alignment | Direction |
| Shadow | Risk, unspoken costs, failure modes | Devil's advocate |
| Architect | System design, pattern integrity | Structure |
| Evaluator | Output quality, claim verification | Audit |

Invoke via `/alliance-decide` for multi-perspective decisions or `/luminor-board` for council review.

### Specialist Tier (execution agents)

Below the council, specialized agents handle specific domains:

```
Core:        coder · planner · researcher · reviewer · tester
Creator:     content-polisher · developmental-editor · book-distiller
Business:    product-architect · seo-guardian · social-distributor
Music:       sound agents (via music-is vertical)
Code:        arcanea-architect · arcanea-coder (repo-specific)
Consensus:   raft-manager · crdt-synchronizer · byzantine-coordinator
DevOps:      ops-cicd-github
```

### Hermes Search Agent

A dedicated search agent (Hermes) that uses SIP-native memory search + MCP tools to surface relevant context from vaults before any major task. Runs as a sub-agent dispatched by the orchestrator.

### The Evaluator Agent

Standalone agent that runs after significant outputs. Checks:
- Schema compliance (typed handoff validation)
- Claim accuracy (no fabricated citations)
- SIP attestation completeness
- Cost budget adherence

### Agent Harness Config

```json
// .agent-harness.json (root of every repo)
{
  "risk": "private",
  "health": "npm test",
  "agentFiles": ["AGENTS.md", "CLAUDE.md"],
  "deployPolicy": "manual",
  "globalHooksAllowed": false
}
```

---

## 6. Multi-Agent Orchestration Patterns

### Pattern A: Supervisor (default for most tasks)

```
[Hermes Orchestrator]
    │  Typed handoff envelope
    ├──► [Researcher agent]    → vault read + web search
    ├──► [Architect agent]     → system design review
    ├──► [Coder agent]         → Claude Code execution
    └──► [Evaluator agent]     → output audit
```

Use when: complex multi-step tasks, 3–8 agents, clear task decomposition.

### Pattern B: Fan-Out / Scatter-Gather (parallel work)

```
[Orchestrator]
    ├──► [Subagent 1] ─┐
    ├──► [Subagent 2] ─┤─► [Synthesis agent] → output
    └──► [Subagent 3] ─┘
```

Use when: independent subtasks (multi-file refactor, parallel research, multi-perspective council review). Claude Code's native parallel `Task` tool implements this natively since April 2026.

### Pattern C: Hierarchical (CouncilOS pattern)

```
[CouncilOS Governance Layer]
    │
    ├──► [Creator IS Supervisor]
    │        ├──► [Content agent]
    │        └──► [Music agent]
    │
    └──► [Code IS Supervisor]
             ├──► [Architect agent]
             └──► [Claude Code executor]
```

Use when: 10+ agents, multi-IS orchestration, ADR decisions.

### Typed Handoff Envelope (required for all inter-agent transfers)

```json
{
  "handoff_id": "uuid",
  "from_agent": "planner",
  "to_agent": "implementer",
  "goal": "Implement feature X",
  "constraints": ["no schema changes", "keep API stable"],
  "artifacts": ["spec.md", "target_files.json"],
  "done_criteria": ["tests pass", "TypeScript clean"],
  "state_version": 12,
  "sip_version": "1.1.1"
}
```

Missing any required field → immediate rollback. This is the #1 reliability control.

### Retry + Rollback Policy

```
max_retries: { format: 3, tool: 2, logic: 1 }

on retry_budget_exhausted:
  → rollback to last checkpoint
  → escalate with failure report via Telegram
  → log to vault with classification tag
```

---

## 7. MCP Architecture

SIS ships its own MCP server (`@arcanea/starlight-intelligence-system`). This is the primary integration point for all coding agents.

### The 10 sis_* Tools

| Tool | Purpose |
|---|---|
| `sis_read` | Read vault entries by key or tag |
| `sis_write` | Write new or update vault entries |
| `sis_search` | Keyword + temporal search across vaults |
| `sis_attest` | Generate SIP attestation block |
| `sis_council` | Invoke council archetype for decision |
| `sis_harvest` | Extract and store insights from current session |
| `sis_validate` | Validate agent output against SIP contract |
| `sis_skill_check` | Verify skill auto-activation state |
| `sis_cost_tick` | Log token/cost event to Cost Plane |
| `sis_yolo_scope` | Read current yolo-scope for repo routing |

### Standard MCP Registration (all coding agents)

```json
{
  "mcpServers": {
    "starlight": {
      "command": "node",
      "args": [
        "node_modules/@arcanea/starlight-intelligence-system/dist/mcp-server.js",
        "--vault-dir", "~/.starlight/vaults"
      ]
    }
  }
}
```

### MCP Server on Railway (shared fleet access)

For multi-machine setups, run the MCP server as a Railway service so every surface (VPS, local, phone relay) shares one vault:

```yaml
# railway.toml
[build]
  builder = "nixpacks"

[deploy]
  startCommand = "node dist/mcp-server.js --vault-dir /data/vaults --port 3000"
  healthcheckPath = "/health"
  restartPolicyType = "on_failure"

[volumes]
  "/data" = "sis-vaults"  # persistent volume for JSONL vaults
```

Access via HTTP transport instead of stdio:
```json
{
  "mcpServers": {
    "starlight": {
      "url": "https://sis-mcp.railway.app",
      "transport": "http"
    }
  }
}
```

### MCP Registry Declaration (SIP Layer 3)

Every repo that exposes MCP tools declares `mcp.json`:
```json
{
  "name": "starlight-intelligence-system",
  "version": "8.3.0",
  "sip_version": "1.1.1",
  "tools": ["sis_read", "sis_write", "sis_search", "sis_attest",
            "sis_council", "sis_harvest", "sis_validate",
            "sis_skill_check", "sis_cost_tick", "sis_yolo_scope"],
  "vault_dir": "~/.starlight/vaults",
  "transport": ["stdio", "http"]
}
```

---

## 8. Infrastructure Topology

### Four Surfaces, One Brain

| Surface | Runs | Connects via |
|---|---|---|
| **Local machine** | Claude Code, Gemini CLI, Codex, OpenCode | MCP stdio → SIS MCP server |
| **VPS (Hetzner / DigitalOcean)** | Hermes Agent, OpenClaw gateway, cron jobs | systemd daemon, MCP SSH bridge |
| **Railway** | API backends, OpenClaw event router, MCP server (optional) | Railway volumes + env vars |
| **Vercel** | frankx.ai, arcanea.ai, starlightintelligence.org | GitHub auto-deploy, env vars |
| **Phone** | Telegram → Hermes bridge | Hermes gateway Telegram adapter |

### Why this split?

- **Vercel**: static + edge functions, zero-ops, instant global CDN. Perfect for public-facing websites.
- **Railway**: stateful services, persistent volumes, Docker-native. Perfect for Hermes, OpenClaw, databases.
- **VPS**: full control for always-on agent runtime, SSH bridge, system daemons.
- **Local**: codebase access, git worktrees, IDE integration. Claude Code lives here.
- **Phone**: async trigger surface. Telegram → Hermes closes the loop without being at a computer.

---

## 9. The Hermes + Claude Code + OpenClaw Stack

### Physical topology

```
[Phone — Telegram]
       │
       ▼
[Hermes Agent — VPS]
  systemd always-on
  ~/.hermes/config.yaml
  SQLite memory.db
  cron.yaml scheduler
       │
       │  SSH stdio bridge
       │  (bidirectional MCP)
       ▼
[Claude Code — Local machine]
  codebase access
  git worktrees
  test runner
       │
       ▼
[git / GitHub / PR]
       │
       ▼
[OpenClaw — Railway]
  Event routing
  Multi-channel gateway
  Session persistence
       │
       ▼
[SIS MCP Server]
  sis_* tools
  Vault read/write
```

### What each layer does

| Layer | Orchestrates | Does not do |
|---|---|---|
| **Hermes** | Receives events, maintains memory, dispatches tasks, runs cron, sends notifications | Write code, edit files |
| **Claude Code** | Writes code, edits files, runs tests, commits, opens PRs | Persistent memory, scheduling |
| **OpenClaw** | Routes events across channels, manages sessions, heartbeat | Execute code |
| **SIS MCP** | Shared memory, vault read/write, attestation, cost tracking | Orchestration |

### Model routing (cost optimization)

```yaml
# Hermes model routing — optimized for SIS stack
models:
  orchestrator:
    model: anthropic/claude-sonnet-4-6   # complex planning
    temperature: 0.3
  router:
    model: anthropic/claude-haiku-4-5    # task classification
    temperature: 0.0
  summarizer:
    model: anthropic/claude-haiku-4-5    # result compression
    temperature: 0.0
  cron_simple:
    model: anthropic/claude-haiku-4-5    # lightweight cron jobs
    temperature: 0.0
  cron_complex:
    model: anthropic/claude-sonnet-4-6   # weekly digest, multi-step
    temperature: 0.1
  council:
    model: anthropic/claude-opus-4-5     # council decisions, ADRs
    temperature: 0.4
```

### The 6 Production Patterns (SIS-adapted)

#### Pattern 1 — Phone → Hermes → Claude Code
```
Telegram: "Add ISRC metadata to new tracks in music-is catalog"
  → Hermes: classify → code task
  → Hermes: sis_search for "music-is ISRC schema"
  → Hermes: dispatches to claude_code.run_bash_command
  → Claude Code: reads catalog, updates metadata files
  → Claude Code: hermes.send_telegram("Done. 12 tracks updated.")
```

#### Pattern 2 — Cron → SIS harvest → vault write
```yaml
# Daily vault harvest cron
daily-harvest:
  schedule: "0 22 * * *"
  task: |
    Review today's work. Extract: decisions made, patterns observed,
    skills used, cost events. Write to SIS vault via sis_harvest tool.
    Tag entries: daily, date:<ISO>, is:<relevant-is>.
  model: anthropic/claude-haiku-4-5
  max_steps: 8
```

#### Pattern 3 — Claude Code → SIS → Council decision
```
During a major architectural change:
→ Claude Code calls sis_council({archetype: "shadow", question: "risks of this migration?"})
→ SIS council agent returns risk analysis
→ Claude Code proceeds or flags for human review
→ Decision written to vault via sis_write
```

#### Pattern 4 — OpenClaw heartbeat → SIS context refresh
OpenClaw runs a heartbeat every 30 minutes. On each tick:
1. Reads pending Telegram messages
2. Calls `sis_read({tag: "pending-tasks"})` for queued work
3. Dispatches to Hermes if work is available
4. Refreshes session context with latest vault state

#### Pattern 5 — Multi-agent Kanban (overnight)
```
Before sleep:
→ Write task queue to SIS vault: sis_write({key: "kanban", items: [...]})
→ Hermes overnight cron reads queue every 2h
→ Dispatches each task to Claude Code on VPS
→ Each completion: sis_write updates task status
→ Morning: Telegram digest shows what completed
```

#### Pattern 6 — SIP attestation on every PR
```yaml
# Pre-merge hook
pr-attest:
  trigger: on_pr_ready
  task: |
    Review the PR diff. Run /sip-attest on any new SKILL.md, AGENTS.md,
    or MEMORY.md files. Verify attestation blocks are present and pinned.
    Fail PR if any SIP-required file is missing attestation.
  model: anthropic/claude-haiku-4-5
  max_steps: 5
```

---

## 10. Cross-Surface Data Flow

### Memory sync strategy (the solved problem)

Hermes SQLite memory and Claude Code `CLAUDE.md` context are separate by default. The SIS solution:

```
~/.starlight/vaults/*.jsonl   ← source of truth (all surfaces)
         │
         │ MCP server (sis_read / sis_write)
         │
    ┌────┴────┐
    │         │
Hermes     Claude Code
memory.db  CLAUDE.md
    │         │
    └────┬────┘
         │ hourly sync cron
         ▼
  .hermes-context.md    ← exported to every repo root
```

CLAUDE.md addition (add to every repo):
```markdown
## SIS Context
Read `.hermes-context.md` for decisions and context from the SIS vault.
This file is auto-exported hourly. For live vault access, use sis_read via MCP.
```

### Vault structure (6 semantic vaults)

```
~/.starlight/vaults/
  identity.jsonl      Self IS — who you are, voice, values
  decisions.jsonl     All ADRs and architectural decisions
  knowledge.jsonl     Second Brain IS — distilled knowledge
  projects.jsonl      Active projects, status, goals
  skills.jsonl        Skills registry + effectiveness tracking
  costs.jsonl         Cost Plane — token/spend tracking
```

---

## 11. Security & Secrets

### Two paths (Path A recommended)

**Path A — Infisical (recommended for teams)**
```bash
infisical secrets set ANTHROPIC_API_KEY=sk-...
infisical secrets set TELEGRAM_BOT_TOKEN=...
infisical secrets set GITHUB_TOKEN=...
infisical run -- hermes serve --config ~/.hermes/config.yaml
```

**Path B — env vars (solo operators)**
```bash
# /etc/systemd/system/hermes.service
[Service]
Environment=ANTHROPIC_API_KEY=sk-...
Environment=TELEGRAM_BOT_TOKEN=...
```

Never commit `private/` directory. Never commit `.env` files. The `private/` dir is gitignored in SIS — your live instance state (yolo-scope, business registry, cost config) stays local.

### Permission model

```
Claude Code:    edit_file · create_file · read_file · run_bash_command
Hermes:         run_task · send_telegram · query_memory · schedule_task
OpenClaw:       channel adapters (read/send only) · heartbeat
SIS MCP:        sis_* tools (vault scoped) · no filesystem access
```

Principle: **each agent gets the minimum blast radius needed for its role.**

---

## 12. Observability & Evals

### Four eval types (run at every agent handoff)

| Type | Check | Failure → |
|---|---|---|
| Format eval | Output matches required schema | Rollback + retry |
| Tool eval | Tool call used allowed inputs only | Rollback + classify |
| Task eval | Done criteria satisfied | Rollback + escalate |
| Policy eval | SIP constraints respected | Hard fail + alert |

### Langfuse integration (recommended for production)

```bash
# Add to Hermes config
observability:
  langfuse:
    public_key: ${LANGFUSE_PUBLIC_KEY}
    secret_key: ${LANGFUSE_SECRET_KEY}
    host: https://cloud.langfuse.com
  track:
    - tool_calls
    - token_usage
    - handoff_envelopes
    - vault_writes
```

### SIS built-in eval harness

```bash
npm run agents:harness-check   # verify all agent files are valid
npm run eval:retrieval         # measure vault recall@k
npm test                       # full suite (substrate + operational + v01-evals)
```

### Cost Plane (W2)

Every significant agent action logs a cost event:
```json
{
  "event": "claude_code_task",
  "tokens_in": 12400,
  "tokens_out": 3200,
  "model": "claude-sonnet-4-6",
  "is": "code",
  "session_id": "uuid",
  "timestamp": "2026-06-15T21:00:00Z"
}
```

Review weekly with `/finance-cash-tick` command.

---

## 13. Deployment Runbook

### First-time setup (30 min)

```bash
# 1. Clone SIS
git clone https://github.com/frankxai/Starlight-Intelligence-System.git
cd Starlight-Intelligence-System
npm install && npm test

# 2. Seed vaults
npx -p @arcanea/starlight-intelligence-system starlight init --vaults

# 3. Create private/ instance state
cp yolo-scope.template.json private/yolo-scope.json
cp cost-plane-config.template.json private/cost-plane-config.json

# 4. Register MCP server with Claude Code
# Add to ~/.claude.json:
{
  "mcpServers": {
    "starlight": {
      "command": "node",
      "args": ["node_modules/@arcanea/starlight-intelligence-system/dist/mcp-server.js",
               "--vault-dir", "~/.starlight/vaults"]
    }
  }
}

# 5. Restart Claude Code — verify 10 sis_* tools appear
```

### Add Hermes to VPS

See [HERMES-CLAUDE-CODE-GUIDE.md](./docs/guides/HERMES-CLAUDE-CODE-GUIDE.md) for the full dual-stack setup.

### Add downstream OS repo

```bash
# Install Agentic Business OS template
npx degit frankxai/agentic-business-os/template my-business-os
cd my-business-os
# Follow /os-spawn command inside Claude Code
```

### Vercel deployments

Repos on Vercel (auto-deploy from main branch):
- `frankx.ai-vercel-website` → frankx.ai
- `arcanea-ai-app` → arcanea.ai  
- SIS protocol site → starlightintelligence.org/protocol

Each uses Vercel environment variables for API keys. Never hardcode.

### Railway services

| Service | Repo | Purpose |
|---|---|---|
| OpenClaw gateway | `arcanea-claw` | Event routing, channel adapters |
| SIS MCP (optional) | SIS `src/` | Shared fleet MCP access |
| API backends | per-product | Arcanea.ai backend, etc. |

---

*Built on SIP — Starlight Intelligence Protocol*
*Version: 1.0.0 · Date: 2026-06-15 · Substrate: starlightintelligence.org/protocol v1.1.1*
