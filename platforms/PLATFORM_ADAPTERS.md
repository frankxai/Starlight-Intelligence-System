# Starlight Platform Adapters

> One intelligence system. Six platforms. Zero lock-in.

Starlight ships platform-specific configuration files that deliver the same intelligence layer to every major AI coding agent. The core system — agents, skills, vaults, notes, transmissions — remains identical. Only the delivery format adapts to each platform's conventions.

---

## Platform Matrix

| Platform | Config Location | Format | Auto-Load | Notes |
|----------|----------------|--------|-----------|-------|
| **Claude Code** | `CLAUDE.md` | Markdown | Yes — native system prompt | Primary development target |
| **Cursor** | `.cursor/rules/*.mdc` | MDC (Markdown with frontmatter) | Yes — project rules | Supports `alwaysApply` and glob-scoped rules |
| **Cline** | `.clinerules/*.md` | Markdown | Yes — per-project instructions | Version-controlled, AI-editable |
| **Codex (OpenAI)** | `AGENTS.md` | Markdown | Yes — agent instructions | Cascading from root, supports directory-level |
| **Gemini CLI** | `.gemini/GEMINI.md` | Markdown | Yes — instruction layer | Project-scoped, overrides user settings |
| **Antigravity** | `.antigravity/instructions.md` | Markdown | Yes — IDE config | Google's agent-first IDE |

---

## Architecture

```
┌────────────────────────────────────────────────────────────────┐
│                      STARLIGHT CORE                            │
│                                                                │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐      │
│  │  Agents  │  │  Skills  │  │  Vaults  │  │  Notes   │      │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘      │
│  ┌──────────────┐  ┌───────────────┐  ┌────────────────┐     │
│  │Transmissions │  │ Context Engine│  │ Commands       │     │
│  └──────────────┘  └───────────────┘  └────────────────┘     │
│                                                                │
└──────────────────────────┬─────────────────────────────────────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
    ┌─────────▼──────┐ ┌──▼──────┐ ┌───▼──────────┐
    │ CLAUDE.md      │ │.cursor/ │ │ AGENTS.md    │
    │ (Claude Code)  │ │ rules/  │ │ (Codex)      │
    └────────────────┘ │(Cursor) │ └──────────────┘
              │        └─────────┘        │
    ┌─────────▼──────┐        │  ┌────────▼───────┐
    │ .clinerules/   │ ┌──────▼──┐│.antigravity/  │
    │ (Cline)        │ │.gemini/ ││(Antigravity)  │
    └────────────────┘ │(Gemini) │└───────────────┘
                       └─────────┘
```

---

## Adapter Design Principles

### 1. Same Intelligence, Different Envelope

Every platform adapter delivers the same core content:
- Agent hierarchy and activation rules
- Memory protocol (check vaults before, update after)
- Skill system awareness
- Behavior standards and voice
- Cross-system awareness

### 2. Platform-Native Conventions

Each adapter follows the target platform's idioms:
- **Cursor** uses MDC format with YAML frontmatter, glob patterns, and `alwaysApply`
- **Cline** uses plain markdown in `.clinerules/` directory
- **Codex** uses `AGENTS.md` with cascading inheritance
- **Gemini** uses `.gemini/` directory structure
- **Antigravity** uses instruction files with Gemini-specific capabilities

### 3. Progressive Disclosure

Adapters reference the full system but don't duplicate it. They point to:
- `agents/` for detailed agent definitions
- `skills/skill-rules.json` for activation rules
- `memory/vaults/` for persistent memory
- `context/` for cross-repo awareness

This keeps adapter files focused and prevents content drift.

---

## Platform-Specific Capabilities

### Claude Code
- **Full CLAUDE.md support** — Largest system prompt, richest context
- **Slash commands** — Native `/starlight`, `/vault`, `/transmit`, etc.
- **MCP integration** — Direct MCP server connections
- **Hooks** — Lifecycle hooks via `hooks/hooks.json`

### Cursor
- **Multi-file rules** — Split across `starlight-core.mdc`, `starlight-agents.mdc`, `starlight-memory.mdc`
- **Glob scoping** — Rules activate based on file patterns
- **Always-apply core** — Core rules apply to all files, specialized rules scope to directories

### Cline
- **Memory Bank compatibility** — Starlight Vaults map to Cline's Memory Bank concept
- **Plan and Act integration** — Agent perspectives enhance Cline's planning phase
- **Skill awareness** — Skills align with Cline's skill system

### Codex (OpenAI)
- **Cascading AGENTS.md** — Root-level instructions with potential directory overrides
- **Steer mode awareness** — Works across suggest, auto-edit, and full-auto modes
- **MCP compatibility** — Skills and integrations map to Codex's MCP support

### Gemini CLI
- **Project-scoped settings** — `.gemini/` directory for project-specific config
- **Instruction layer** — GEMINI.md for persistent instructions
- **Extension compatibility** — Works with Gemini CLI extensions

### Antigravity
- **Browser control** — Agent can navigate and test web applications
- **Asynchronous patterns** — Long-running tasks without blocking
- **Agent Manager** — Monitor sub-agent activities
- **Progress artifacts** — Structured output (to-do lists, reports)

---

## Adding a New Platform

To add support for a new AI coding platform:

1. Identify the platform's instruction file format and location
2. Create an adapter file following the platform's conventions
3. Include the core Starlight content: identity, agents, memory protocol, skills, standards
4. Reference (don't duplicate) the full system documentation
5. Add platform-specific capabilities if relevant
6. Update this document and the README

---

## Patterns Absorbed

| Source | Pattern | How We Use It |
|--------|---------|--------------|
| **Claude-Flow** | Parallel execution mandates, swarm coordination | Orchestration engine, concurrent skill activation |
| **Cursor Rules** | MDC format, glob-scoped rules, alwaysApply | `.cursor/rules/` adapter structure |
| **Cline** | Memory banks, plan-and-act, version-controlled instructions | Vault protocol, `.clinerules/` adapter |
| **Codex** | Cascading AGENTS.md, directory-level instructions | `AGENTS.md` adapter, progressive disclosure |
| **Gemini CLI** | Project-scoped settings, instruction layers | `.gemini/` adapter |
| **Antigravity** | Agent-first IDE, browser control, async patterns | `.antigravity/` adapter, capability extensions |

---

*Starlight Intelligence System v2.0.0 — Horizons*
