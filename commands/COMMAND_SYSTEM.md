# Starlight Command System

> *"Commands are the interface between intention and intelligence."*

---

## Overview

Starlight Commands are slash-command interfaces that provide direct access to Starlight's intelligence capabilities. Inspired by ACOS's 25+ command system, Starlight commands are the primary way users interact with the intelligence backbone.

---

## Available Commands

| Command | Purpose | Primary Agent |
|---------|---------|---------------|
| `/starlight` ( /si ) | System control and status; dispatches queen/orchestrator/architect/sq/so | Prime / Orchestrator (Queen) / Architect |
| `/starlight-queen` ( /sq ) | Continuous Queen loop (route/measure/learn/ratify/ledger for model-tier + cost optimization) | Orchestrator (Queen role) |
| `/sq` | Alias for /starlight-queen | Orchestrator (Queen role) |
| `/so` | Quick-activate Orchestrator with Queen role enabled | Orchestrator (Queen role) |
| `/starlight-architect` | System design, scaffolding, trade-offs, planet-scale architecture (e.g. Queen surfaces) | Architect |
| `/vault` | Memory operations | Sage |
| `/transmit` | Cross-system communication | Orchestrator |
| `/synthesize` | Multi-source synthesis | Prime + Council |
| `/council` | Convene agent council | Prime |
| `/navigate` | Strategic planning | Navigator |
| `/si` | Route work to the right CLI or native generation tool | Orchestrator |
| `/so` | Orchestrate multi-lane dispatch, packets, and verification | Orchestrator |
| `/starlight-swarm` | Create approval-gated multi-CLI swarm packets | Orchestrator |
| `/forge` | Compile a skill, justified agent, swarm, vertical, or plugin | Queen + Foundry |
| `/prove` | Evaluate declared evidence lanes and issue a receipt | Sentinel + Foundry |
| `/evolve` | Propose the smallest responsible patch from a receipt | Queen + Foundry |

---

## Command Format

```
/command [subcommand] [arguments] [--flags]
```

### Examples
```
/starlight status
/vault read strategic --query "architecture decisions"
/transmit acos --priority high "Skill system updated"
/synthesize --sources vault,notes --topic "memory patterns"
/council --topic "ecosystem integration strategy"
/navigate --horizon 6months --domain technical
/si --tool agy --repo arc "open this in Antigravity"
/so --fanout "audit this flow across Codex, Gemini, and Grok"
/forge skill "turn this research workflow into a portable skill"
/prove ./generated/research-brief-forge
/evolve ./generated/research-brief-forge/evidence-receipt.json
```

---

## Command Details

### /starlight - System Control

```
/starlight status              Show system status (agents, vaults, channels)
/starlight agents              List all agents and their states
/starlight skills              List all skills and activation status
/starlight health              Run system health check
/starlight context             Show current context assembly
/starlight reset               Reset to fresh context (preserve vaults)
/starlight queen (or /sq)      Enter Queen loop surfaces (status/route/measure/learn/ratify/ledger)
/starlight orchestrator        Activate Orchestrator (Queen role enabled)
/starlight architect           Activate Architect for design/scaffold/review
/starlight so                  Quick Orchestrator + Queen posture
```

### /vault - Memory Operations

```
/vault read [vault] [--query]  Read from a vault with optional search
/vault write [vault] [content] Write an entry to a vault
/vault search [query]          Search across all vaults
/vault health                  Show vault health metrics
/vault consolidate             Run memory consolidation
/vault export [vault]          Export vault contents
```

### /transmit - Cross-System Communication

```
/transmit [channel] [message]  Send a transmission to a channel
/transmit broadcast [message]  Send to all channels (Prime auth required)
/transmit check [channel]      Check channel for new transmissions
/transmit sync                 Sync all channels
/transmit log                  Show transmission history
```

### /synthesize - Intelligence Synthesis

```
/synthesize [--sources] [--topic]  Synthesize from specified sources
/synthesize decision [topic]       Run decision framework synthesis
/synthesize knowledge [topic]      Run knowledge synthesis
/synthesize cross-repo [topic]     Run cross-repo synthesis
```

### /council - Agent Council

```
/council [--topic]             Convene full council on a topic
/council [--agents] [--topic]  Convene specific agents on a topic
/council review [artifact]     Council review of an artifact
/council decide [question]     Council decision on a question
```

### /navigate - Strategic Planning

```
/navigate plan [objective]     Create strategic plan for an objective
/navigate assess [situation]   Strategic assessment of a situation
/navigate decide [options]     Navigate a decision with trade-offs
/navigate roadmap [horizon]    Create a strategic roadmap
/navigate priorities           Review and update priorities
```

### /si - Starlight Intelligence Routing

```
/si [task]                         Pick the best local CLI/tool lane
/si --repo <key> [task]            Route against arc/sis/fx/g/vc/ani/dpi
/si --tool <tool> [task]           Force claude/codex/gemini/opencode/cursor/agy/grok/image
/si --dry-run [task]               Show route without execution
```

### /starlight-swarm - Approval-Gated Swarm Planning

```
/starlight-swarm [goal]            Emit dry-run multi-repo swarm packets
/starlight-swarm status            Show repo/provider readiness
/starlight-swarm providers         Show dry-run provider adapters
/starlight-swarm repos             Show configured v1 repo ring
```

### /so - Starlight Orchestrator Dispatch

```
/so [task]                         Decide, dispatch, verify
/so --fanout [task]                Split work across multiple lanes
/so --packet [task]                Emit a durable handoff packet
/so --tool image [prompt]          Use native image generation/editing tools
```

### /starlight-queen ( /sq ) - Continuous Queen Loop (Orchestrator Queen Role)

Model-tier routing + eval overseer. The closed loop: ROUTE (from routing-table.json + doctrine) → MEASURE (Proving Ground 7 lanes via /starlight-eval + gstack/arena/cost) → LEARN (re-derive table from receipts) → RATIFY (A1 stakes gate) → LEDGER (doctrine + vault + visuals).

See dedicated `commands/starlight-queen.md` for full subcommands, Grok subagent/gstack/image_gen/gateway execution, A1/A2/A3 bindings, and immediate drive steps in this harness. Shorts `/sq` and `/so` (Queen-enabled orchestrator quick surface).

### /starlight-architect - Architect Command Surface

Design, scaffold, review, tradeoff analysis for enterprise systems, harnesses, command surfaces, and structures (e.g. this Queen build was Architect-designed/scaffolded). 

See `commands/starlight-architect.md` + `agents/starlight-architect.md`. Dispatched via `/starlight architect`.

### /forge - Capability Compilation

```text
/forge skill <brief>
/forge agent <brief>
/forge swarm <brief>
/forge vertical <brief>
/forge plugin <brief>
```

The Queen writes a typed Task Envelope and resolves existing capabilities. Foundry then compiles the kind-specific pack. Agent creation fails unless a persistent decision-right, memory, tool, ownership, or ongoing-trigger boundary is proven.

See `commands/forge.md`, `foundry/contracts/`, and `tools/foundry/cli.mjs`.

### /prove - Evidence Receipt

Runs declared `static`, `behavioral`, `factual`, `artifact`, `taste`, `security`, `economic`, and `drift` lanes. Unrun required checks remain pending. The producing actor cannot be the sole required taste judge.

See `commands/prove.md`.

### /evolve - Receipt-Driven Improvement

Maps failed or pending required tests to the smallest responsible layer and emits a non-applying patch proposal. Security and drift changes require approval.

See `commands/evolve.md`.

---

## Command Processing Flow

```
1. USER issues /command
2. INTELLIGENCE CORE parses command and arguments
3. QUEEN writes or validates the Task Envelope
4. CAPABILITY GRAPH resolves skills, agents, tools, memory, and constraints
5. EXECUTION SHAPE selects one actor or a bounded topology
6. TARGET executes with declared permissions
7. PROVING GROUND evaluates required evidence lanes
8. RESPONSE returns artifact, receipt, uncertainty, and unresolved decisions
9. MEMORY WRITE captures only ratified learning
```

---

## Command Hooks

Commands can trigger hooks at various lifecycle points:

```
pre-command   → Before command execution (validation, context loading)
post-command  → After command execution (logging, vault writes)
on-error      → If command fails (error handling, fallback)
```

See `hooks/HOOK_ARCHITECTURE.md` for details.

---

*"A good command system makes the complex feel simple."*
