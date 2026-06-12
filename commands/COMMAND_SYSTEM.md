# Starlight Command System

> *"Commands are the interface between intention and intelligence."*

---

## Overview

Starlight Commands are slash-command interfaces that provide direct access to Starlight's intelligence capabilities. Inspired by ACOS's 25+ command system, Starlight commands are the primary way users interact with the intelligence backbone.

---

## Available Commands

| Command | Purpose | Primary Agent |
|---------|---------|---------------|
| `/starlight` | System control and status | Prime |
| `/vault` | Memory operations | Sage |
| `/transmit` | Cross-system communication | Orchestrator |
| `/synthesize` | Multi-source synthesis | Prime + Council |
| `/council` | Convene agent council | Prime |
| `/navigate` | Strategic planning | Navigator |
| `/si` | Route work to the right CLI or native generation tool | Orchestrator |
| `/so` | Orchestrate multi-lane dispatch, packets, and verification | Orchestrator |
| `/starlight-swarm` | Create approval-gated multi-CLI swarm packets | Orchestrator |

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
