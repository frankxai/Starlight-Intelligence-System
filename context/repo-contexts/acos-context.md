# ACOS Context - Agentic Creator OS

> *Starlight's understanding of the Agentic Creator OS*

**Repository:** frankxai/agentic-creator-os
**Last Updated:** 2026-05-20
**Version:** v11.0.0

---

## What ACOS Is

Agentic Creator OS is the creator productivity operating system - a markdown/JSON-based configuration system that gives AI coding agents multi-agent orchestration, smart routing, auto-activating skills, commands, safety hooks, and plugin packaging through the CLAUDE.md / AGENTS.md surfaces.

**Core Philosophy:** Configuration over code. Files over ephemera. Systems over tools.

---

## Architecture Summary

```
ACOS v11 Architecture
=====================

CLAUDE.md (System Prompt)
  ├── Frank DNA (voice, values, identity)
  ├── Agent System (38 agents, smart routing)
  ├── Skill System (90+ skills, auto-activation)
  ├── Command System (65+ slash commands)
  ├── v10 Safety Hooks (retained baseline)
  └── v11 Plugin Ecosystem (Claude plugin packaging)
```

---

## Key Components

### Agent System
- **38 specialized agents** organized by domain
- **Smart routing** that selects agents based on task analysis
- **Progressive disclosure** - load only needed agent context
- **Agent booting** via `/boot [agent-name]` command

### Skill System
- **90+ skills** with auto-activation via `skill-rules.json`
- **Keyword + intent + agent matching** for activation
- **Four load levels:** metadata → summary → core → full
- **Skills organized by domain categories**

### Command System
- **65+ slash commands** including ACOS and gstack workflows
- **Command parsing** with argument support
- **Extensible** - new commands added via configuration
- **Health command:** `.agent-harness.json` now points to `npm run build:all`; ACOS currently has no `test` script.

### GSD Methodology
- **Get Stuff Done** - structured productivity framework
- **Phase-based:** Research → Plan → Execute → Review
- **Context management** built-in
- **Session continuity** through state files

---

## Key Patterns Starlight Uses from ACOS

| Pattern | ACOS Implementation | Starlight Integration |
|---------|--------------------|-----------------------|
| Configuration-first | CLAUDE.md + JSON configs | All Starlight config is MD/JSON |
| Skill auto-activation | skill-rules.json | Starlight skill-rules.json |
| Agent routing | Smart router in CLAUDE.md | Routing Matrix |
| Progressive disclosure | 4-level agent loading | 4-level skill loading |
| Commands | /command pattern | Starlight commands |
| Frank DNA | Voice and identity config | Embedded in all agents |

---

## Integration Points

- **Transmission Channel:** transmissions/channels/acos-channel.md
- **Skill Sync:** ACOS skill patterns inform Starlight skill design
- **Agent Sync:** ACOS agent patterns inform Starlight agent design
- **Command Sync:** ACOS commands map to Starlight commands

---

## What Starlight Provides to ACOS

1. **Persistent memory** via Vaults (ACOS is session-based, Starlight persists)
2. **Cross-system intelligence** from Arcanea and AI-Ops
3. **Strategic reasoning** that spans beyond individual sessions
4. **Wisdom accumulation** from across the ecosystem
