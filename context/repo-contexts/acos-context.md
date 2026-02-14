# ACOS Context - Agentic Creator OS

> *Starlight's understanding of the Agentic Creator OS*

**Repository:** frankxai/agentic-creator-os
**Last Updated:** 2026-02-10
**Version:** v6 (Evolved)

---

## What ACOS Is

Agentic Creator OS is the creator productivity operating system - a markdown/JSON-based configuration system that gives Claude multi-agent orchestration, smart routing, auto-activating skills, and 25+ commands through the CLAUDE.md system prompt.

**Core Philosophy:** Configuration over code. Files over ephemera. Systems over tools.

---

## Architecture Summary

```
ACOS v6 Architecture
=====================

CLAUDE.md (System Prompt)
  ├── Frank DNA (voice, values, identity)
  ├── Agent System (40+ agents, smart routing)
  ├── Skill System (80+ skills, auto-activation)
  ├── Command System (25+ slash commands)
  └── GSD Methodology (structured productivity)
```

---

## Key Components

### Agent System
- **40+ specialized agents** organized by domain
- **Smart routing** that selects agents based on task analysis
- **Progressive disclosure** - load only needed agent context
- **Agent booting** via `/boot [agent-name]` command

### Skill System
- **80+ skills** with auto-activation via `skill-rules.json`
- **Keyword + intent + agent matching** for activation
- **Four load levels:** metadata → summary → core → full
- **Skills organized by domain categories**

### Command System
- **25+ slash commands** including /project, /agent, /skill, /gsd, /creative
- **Command parsing** with argument support
- **Extensible** - new commands added via configuration

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
