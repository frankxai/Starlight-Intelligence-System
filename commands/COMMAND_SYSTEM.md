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

### /starlight-queen (/sq) - Queen Loop Driver

```
/starlight-queen status
/starlight-queen route <task-class>
/starlight-queen measure [--lane=...]
/starlight-queen learn
/starlight-queen ratify
/starlight-queen ledger [--append]
/sq [same subs]   # thin alias
/so [queen|status]   # Orchestrator quick-activate with Queen posture
```

Continuous ROUTE (table) → MEASURE (eval + gstack + Cost) → LEARN → RATIFY (A1/A2) → LEDGER. Grok: subagent parallelism + image_gen visuals. See dedicated `commands/starlight-queen.md` + `tools/proving-ground/ROUTING-DOCTRINE.md` + `routing-table.json` + `agents/starlight-orchestrator.md`.

### /starlight-architect - Design & Scaffold

```
/starlight-architect design <objective>
/starlight-architect review <artifact>
/starlight-architect scaffold <system>   # e.g. --for=queen
```

Leadership-tier enterprise architecture per agent protocol. This Queen command surface was Architect-scaffolded live under Grok. Full: `commands/starlight-architect.md` + `agents/starlight-architect.md`.
### /starlight-queen ( /sq ) - Continuous Queen Loop (Orchestrator Queen Role)

Model-tier routing + eval overseer. The closed loop: ROUTE (from routing-table.json + doctrine) → MEASURE (Proving Ground 7 lanes via /starlight-eval + gstack/arena/cost) → LEARN (re-derive table from receipts) → RATIFY (A1 stakes gate) → LEDGER (doctrine + vault + visuals).

See dedicated `commands/starlight-queen.md` for full subcommands, Grok subagent/gstack/image_gen/gateway execution, A1/A2/A3 bindings, and immediate drive steps in this harness. Shorts `/sq` and `/so` (Queen-enabled orchestrator quick surface).

### /starlight-architect - Architect Command Surface

Design, scaffold, review, tradeoff analysis for enterprise systems, harnesses, command surfaces, and structures (e.g. this Queen build was Architect-designed/scaffolded). 

See `commands/starlight-architect.md` + `agents/starlight-architect.md`. Dispatched via `/starlight architect`.

---

## Command Processing Flow

```
1. USER issues /command
2. INTELLIGENCE CORE parses command and arguments
3. ROUTING MATRIX identifies target agent(s)
4. CONTEXT ENGINE assembles relevant context
5. TARGET AGENT executes with skill support
6. SYNTHESIS PROTOCOL merges results (if multi-agent)
7. RESPONSE delivered to user
8. MEMORY WRITE captures significant results in vaults
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
