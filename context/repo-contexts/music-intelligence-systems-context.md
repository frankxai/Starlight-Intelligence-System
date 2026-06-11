# Music Intelligence Systems Context - Ecosystem Music Agent Hub

> *Starlight's understanding of the music-intelligence-systems hub*

**Repository:** frankxai/music-intelligence-systems
**Last Updated:** 2026-06-11
**Version:** v1 (Hub live 2026-06-11)

---

## What Music Intelligence Systems Is

The hub and registry for music agents across the FrankX ecosystem - a cross-repo catalog of ~30 music agents with JSON schemas, portable agent exports, and a music-psychology research framework. It indexes agents that live in their home repos (FrankX, ACOS, vibe-os, ai-music-academy) and ships them in portable formats: Claude Projects, Custom GPTs, Gemini Gems, and generic system prompts.

**Core Philosophy:** One registry, many runtimes. Agents stay in their home repos; the hub indexes, schemas, and exports.

---

## Architecture Summary

```
music-intelligence-systems
==========================

ECOSYSTEM.md (cross-repo map)
  ├── registry/      — canonical index of ~30 music agents + skills
  ├── schemas/       — JSON schemas for agent/skill registry entries
  ├── exports/       — portable formats (Claude Project / Custom GPT / Gemini Gem / generic)
  └── research/      — music-psychology framework (methodology + open questions registry)
```

---

## Key Components

### Registry
- **~30 music agents** indexed across the ecosystem (FrankX Pillar-2 producers, ACOS Music Producer, vibe-os, ai-music-academy)
- **4 new hub-native agents:** Lyric Writer, Film/Sync Composer, Music Theory Teacher, Orchestration Architect
- **JSON-schema validated** entries (`schemas/`)

### Portable Exports
- **4 target formats:** Claude Projects, Custom GPTs, Gemini Gems, generic system prompts
- Mirrors the Starlight ecosystem-export pattern (claude-project / chatgpt-project / gemini-gem targets)

### Research Framework
- **`research/`** — music-psychology methodology plus an open-questions registry
- Pairs with vibe-os research docs (state-change whitepaper, music-psychology, frequency research)

---

## Key Patterns the Hub Uses from Starlight

| Pattern | Starlight Source | Hub Integration |
|---------|------------------|-----------------|
| Sound domain decomposition | `verticals/sound-intelligence/` (6 sub-systems, 30 `/sound-*` commands) | Reference for agent taxonomy - consumed, never duplicated |
| Music IS operations | Music IS vertical patterns (7 Music IS agents) | Reference for production/release agent shapes |
| Portable exports | Ecosystem export targets | Same export-target pattern for music agents |
| Attribution | SIP attestation | SIP-attribution style footers on exports |

The hub **consumes** sound-intelligence and Music IS vertical patterns as references. It never duplicates Starlight substrate.

---

## Integration Points

- **Context snapshot:** this file (`context/repo-contexts/music-intelligence-systems-context.md`)
- **Transmission:** announced on `transmissions/channels/broadcast-channel.md` (2026-06-11)
- **Sibling repos:** vibe-os (state-change engine + MCP server), ai-music-academy (curriculum + portable agents), awesome-music-agent-skills (curated list), claude-skills-library (free skills), FrankX (Pillar-2 agents + catalog data)
- **Public surface:** frankx.ai/music-intelligence

---

## Current State

- Hub live as of 2026-06-11 with registry, schemas, exports, research framework, and ECOSYSTEM.md map
- 4 new hub-native agents shipped (Lyric Writer, Film/Sync Composer, Music Theory Teacher, Orchestration Architect)
- vibe-os shipped its MCP server (`mcp-server/server.py`, 7 tools: state listing, vibe/transition/custom prompt generation, frequency presets, frequency session design with WAV rendering, session mix planning)

---

## What Starlight Provides to the Hub

1. **Reference patterns** from the sound-intelligence vertical and Music IS agents
2. **Export-target conventions** for portable agent packaging
3. **Attribution discipline** - SIP-attribution style footers on generated exports
4. **Persistent memory** via Vaults for cross-session music intelligence
