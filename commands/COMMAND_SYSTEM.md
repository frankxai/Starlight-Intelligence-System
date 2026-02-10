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
