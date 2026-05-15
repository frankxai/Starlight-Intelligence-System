# Starlight Intelligence System

> **A protocol for sovereign creator alliances — and a reference implementation you can run today.**
>
> SIS is two layers: a substrate (SIP) anyone can adopt, fork, or build on — and an operational layer (Frank's reference build) that runs on top of it.

[![version](https://img.shields.io/badge/version-8.0.0-7fffd4?style=flat-square&labelColor=0d1117)](https://github.com/frankxai/Starlight-Intelligence-System/releases)
[![protocol](https://img.shields.io/badge/SIP-v1.1.1-c084fc?style=flat-square&labelColor=0d1117)](SIP.md)
[![license](https://img.shields.io/badge/license-MIT-white?style=flat-square&labelColor=0d1117)](LICENSE)
[![protocol page](https://img.shields.io/badge/protocol-starlightintelligence.org%2Fprotocol-78a6ff?style=flat-square&labelColor=0d1117)](https://starlightintelligence.org/protocol)
[![deploy](https://github.com/frankxai/Starlight-Intelligence-System/actions/workflows/vercel-deploy.yml/badge.svg)](https://github.com/frankxai/Starlight-Intelligence-System/actions/workflows/vercel-deploy.yml)
[![github stars](https://img.shields.io/github/stars/frankxai/Starlight-Intelligence-System?style=flat-square&labelColor=0d1117&color=ffd700)](https://github.com/frankxai/Starlight-Intelligence-System/stargazers)

---

## Two layers, one repo

| Layer | What it is | What lives here | License | Adopt how |
|-------|-----------|-----------------|---------|-----------|
| **Substrate (SIP)** | A six-layer protocol that lets sovereign parties compose intelligence systems without losing sovereignty. | `SIP.md`, `SIS.md`, `ALLIANCE.md`, `STACK.md`, `VOICES.md`, `VERTICALS.md`, `MEMORY.md`, `REGISTRY.md`, `SKILL.md`, `.claude/commands/` | MIT | Read `SIP.md`, attest with `/sip-attest`, fork what you need. |
| **Operational (reference build)** | This repo's working implementation: 7 named agents, 6 semantic vaults, 16 skills, MCP server, 6 strategic commands, multi-platform adapters. Frank's daily-driver. | `agents/`, `memory/`, `skills/`, `commands/`, `core/`, `context/`, `src/` (npm package) | MIT | Install `@arcanea/starlight-intelligence-system`, run the MCP server, write to your vaults. |

You can adopt **just the substrate** (fork SIP for your own work), **just the operational layer** (use the MCP server for AI memory), or **the full stack** (Frank's reference build, end to end). They are independent.

> **Operator? Start at [SETUP.md](./SETUP.md)** — covers `private/` instance state, Infisical Path A vs env-var Path B, Windows + Linux cron wiring, cockpit launch, and a smoke test, end-to-end in roughly 30 min.
>
> **New to the protocol?** Don't fork this repo. Fork the **[SIP adoption kit](https://github.com/frankxai/starlight)** — eleven markdown files, no code, [ship your first attested artifact in 60 seconds](https://github.com/frankxai/starlight#readme). Compose upward when you're ready.
>
> **New in v7.3.1** (2026-04-24): Newcomer surface shipped — `/welcome`, `/intake`, `/sovereign-spawn` protocol commands + Concierge + Envoy front-door agents + ecosystem export schemas (Claude Projects, ChatGPT Projects, Gemini Gems, Cursor, Cowork) + attested-modality scaffolds (audio/image/video/compose). Read [`ONBOARDING.md`](ONBOARDING.md), [`DELIVERY.md`](DELIVERY.md), [`docs/ecosystem-integration.md`](docs/ecosystem-integration.md). Board-verdict driven ship — see [ATTESTATIONS.md § v7.3.1](ATTESTATIONS.md).

[![Built on SIP](https://starlightintelligence.org/badge/v1.1.1)](https://starlightintelligence.org/protocol)

---

## Why It Matters

```mermaid
flowchart TB
  Human["Human intent"]
  Vaults["6 semantic vaults<br/>JSONL source of truth"]
  Index["SQLite + FTS5<br/>rebuildable index"]
  MCP["MCP server<br/>10 sis_* tools"]
  Adapters["Claude Code · Cursor · Codex · Gemini · OpenCode"]
  Repos["Repo-specific agent harnesses"]
  Output["Safer, memory-aware agent work"]

  Human --> Vaults
  Vaults --> Index
  Index --> MCP
  MCP --> Adapters
  Adapters --> Repos
  Repos --> Output
  Output --> Vaults
```

| Capability | What It Gives Agents |
| --- | --- |
| Semantic vaults | Durable memory across sessions and tools |
| Temporal confidence | Old knowledge decays unless reconfirmed |
| Contradiction detection | Conflicting memories become visible |
| Platform adapters | Same substrate across Claude, Cursor, Codex, Gemini, OpenCode |
| MCP server | Tool-native access to memory and retrieval |
| Harness checks | Prompt surfaces stay aligned with reality |

Run the local harness guard:

```bash
npm run agents:harness-check
```

---

## The substrate (SIP)

**Starlight Intelligence Protocol** — the contract that lets sovereign parties compose intelligence systems without losing sovereignty. Six layers:

1. **File contract** — canonical names and shapes for `SKILL.md`, `AGENTS.md`/`VOICES.md`, `MEMORY.md`, `CANON.md`, `SOUL.md`, `STACK.md`, `.claude/commands/*`, plus `.arc` / `.nea` / `.skill` extensions.
2. **Attestation protocol** — verifiable "Built on SIP" attribution via `/sip-attest`. Refuses decorative use.
3. **MCP registry standard** — how MCP servers declare, compose, version (`mcp.json` schema).
4. **Command taxonomy** — protocol / alliance / vertical / sovereign tiers with explicit decision rights.
5. **Sovereignty + attribution clause** — the non-negotiable social contract.
6. **Archetype extension** — optional canon adoption (Arcanea archetypes available CC-BY-NC).

**Canonical URL:** [starlightintelligence.org/protocol](https://starlightintelligence.org/protocol) · **Source of truth:** [`SIP.md`](SIP.md) in this repo.

### Substrate files at a glance

| File | What it does |
|------|--------------|
| [`SIP.md`](SIP.md) | The protocol spec (six layers). |
| [`SIS.md`](SIS.md) | Substrate map — verticals, composition rules, what SIS does and doesn't provide. |
| [`ALLIANCE.md`](ALLIANCE.md) | The alliance forging method — how 2-5 sovereign nodes compose without collapsing into one entity. |
| [`STACK.md`](STACK.md) | Recommended sovereign stack (L0-L6). Defaults, not mandates. |
| [`VOICES.md`](VOICES.md) | Five canonical voice archetypes (architect, sovereign-creator, protocol-defender, implementer, overseer). |
| [`VERTICALS.md`](VERTICALS.md) | Public registry of sovereign verticals + alliance class definitions. |
| [`MEMORY.md`](MEMORY.md) | Template for per-instance state. |
| [`REGISTRY.md`](REGISTRY.md) | MCP server registry. |
| [`SKILL.md`](SKILL.md) | Substrate-layer behavior (what AI adopts when working at this layer). |
| `.claude/commands/` | 9 reference slash commands (`/sip-attest`, `/alliance-forge`, `/alliance-reflect`, `/alliance-decide`, `/vertical-spawn`, `/luminor-board`, `/sovereign-signal`, `/openclaw-audit`, `/wealth-dpi`). |

### Forge an alliance, spawn a vertical

```bash
# Pressure-test before committing
/luminor-board "Open-source the agent layer or keep it closed?"

# Forge an alliance under SIP
/alliance-forge trinity "Frank,Ahmad,Logan,Shahvaiz"

# Spawn a vertical IS under SIS
/vertical-spawn anime-legends "anime-aesthetic fiction + character design"

# Attest a shipped artifact
/sip-attest path/to/artifact.md
```

Every cross-party artifact carries the "Built on SIP" attestation block. Silent composition is a breach.

---

## The operational layer (reference build)

This repo also ships Frank's working implementation — the daily-driver intelligence system that runs on top of SIP. Use it directly, fork it, or replace it entirely with your own layer above the substrate.

### Quick start (operational layer, 2 minutes)

**Option 1: As an MCP server (recommended for AI tools)**

```json
{
  "mcpServers": {
    "starlight": {
      "command": "node",
      "args": [
        "node_modules/@arcanea/starlight-intelligence-system/dist/mcp-server.js",
        "--vault-dir",
        "~/.starlight/vaults"
      ]
    }
  }
}
```

Restart Claude Code. You now have ten `sis_*` tools available in every session.

**Option 2: As a library**

```bash
pnpm add @arcanea/starlight-intelligence-system
```

```ts
import { StarlightIntelligence } from "@arcanea/starlight-intelligence-system";
import { createAdapter } from "@arcanea/starlight-intelligence-system/adapters";

const sis = new StarlightIntelligence();
sis.initialize();

sis.remember({
  content: "Always Read a file before editing — catches stale state",
  category: "pattern",
  tags: ["workflow", "edit-safety"],
  confidence: 0.95,
});

const adapter = createAdapter("claude-code");
const context = await adapter.generate({ vaultDir: "~/.starlight/vaults" });
```

### The six vaults

| Vault | Symbol | Purpose | Example entry |
|---|---|---|---|
| Strategic | ◆ | Business insights, architecture decisions, competitive moats | `"Open Core + Founding Circle beats premium tiers at this stage"` |
| Technical | ⬡ | Implementation learnings, stack decisions, patterns | `"SQLite FTS5 with bm25 beats embeddings for <10k entries"` |
| Creative | ✦ | Design preferences, aesthetic rules, voice, lore | `"Never Cinzel. Space Grotesk display, Inter body."` |
| Operational | ▸ | Workflow patterns, execution lessons, process rules | `"Max 2 worktrees. Digest pattern for terminal output."` |
| Wisdom | ◎ | Deep principles, truths, cross-domain insights | `"Memory that compounds is intelligence that grows"` |
| Horizon | ↗ | Vision statements, append-only ledger of human intentions | `"Build the substrate that makes AI agents continuous"` |

Each vault is a JSONL file. Human-readable. Git-versionable. Greppable.

### What the operational layer adds on top of SIP

- **SQLite hybrid retrieval** — `src/retrieval.ts` builds a rebuildable FTS5 shadow index over JSONL vaults with bm25 ranking.
- **Temporal reasoning** — `src/temporal.ts` adds validity windows and a 90-day confidence half-life.
- **Contradiction detection** — `src/contradiction.ts` finds conflicting entries via word-trigram Jaccard with opposing-signal boosting.
- **Dreaming** — `src/dreaming.ts` processes session transcripts in the background.
- **Five platform adapters** — Claude Code, Cursor, Codex, Gemini CLI, OpenCode share the same vaults.
- **MCP v2** — `src/mcp-server.ts` ships ten tools over JSON-RPC 2.0 stdio.

### MCP tools

| Tool | Description |
|---|---|
| `sis_vault_search` | Free-text search across vaults |
| `sis_recent_entries` | Latest entries from one or all vaults |
| `sis_stats` | Total entry counts per vault |
| `sis_append_entry` | Write a new entry to a vault |
| `sis_entry_types` | List supported vault types and entry categories |
| `sis_search` | Hybrid semantic + keyword search with bm25 + temporal filtering |
| `sis_confirm` | Touch `lastConfirmed` on an entry |
| `sis_invalidate` | Mark an entry as expired |
| `sis_contradict` | Flag two entries as contradictory |
| `sis_stale` | List entries not confirmed within a threshold |

### Platform adapters

| Platform | Memory file | MCP config | Max tokens |
|---|---|---|---|
| Claude Code | `CLAUDE.md` | `~/.claude/settings.json` → `mcpServers` | 200,000 |
| Cursor | `.cursorrules` | Cursor settings → MCP | 128,000 |
| Codex | `AGENTS.md` | `~/.codex/config.toml` | 192,000 |
| Gemini CLI | `GEMINI.md` | `~/.gemini/settings.json` | 1,000,000 |
| OpenCode | `AGENTS.md` (compact) | `~/.opencode/config.json` | 128,000 |

### The 7 named agents (operational layer)

The reference build maps SIP's 5 voice archetypes to 7 named runtime agents — Orchestrator, Prime, Architect, Navigator, Sentinel, Weaver, Sage. Full registry: [`agents/AGENT_REGISTRY.md`](agents/AGENT_REGISTRY.md).

Voice archetypes are abstract; named agents are specific implementations. Anyone forking SIP can choose entirely different agents above the substrate.

---

## Fork patterns

| If you want to... | Take | Leave |
|------------------|------|-------|
| Adopt SIP for your own creator stack | `SIP.md`, `SKILL.md`, `VOICES.md`, `.claude/commands/sip-attest.md`, `.claude/commands/alliance-forge.md` | Everything in `agents/`, `memory/`, `skills/`, `src/` |
| Use the MCP memory server, no protocol | `src/`, `dist/`, npm package | Substrate spec files |
| Forge an alliance under SIP | `SIP.md`, `ALLIANCE.md`, `VOICES.md`, all 9 commands in `.claude/commands/` | Operational layer |
| Run the full reference build | All of it | Nothing |

---

## Public canonical URL

[`starlightintelligence.org/protocol`](https://starlightintelligence.org/protocol) mirrors `SIP.md`. This repo is the source of truth.

---

## Architecture (operational layer)

```
            ┌─────────────────────────────────────────┐
            │  JSONL vaults  (source of truth)        │
            │  ~/.starlight/vaults/*.jsonl            │
            │  human-readable · git-versionable       │
            └────────────────┬────────────────────────┘
                             │
                             │  rebuildable from JSONL
                             ▼
            ┌─────────────────────────────────────────┐
            │  SQLite + FTS5  (shadow index)          │
            │  bm25 ranking · temporal filters        │
            └────────────────┬────────────────────────┘
                             │
                             │  JSON-RPC 2.0 over stdio
                             ▼
            ┌─────────────────────────────────────────┐
            │  MCP server  (10 sis_* tools)           │
            └────────────────┬────────────────────────┘
                             │
        ┌────────────────────┼────────────────────────┐
        ▼            ▼       ▼       ▼        ▼       ▼
   Claude Code   Cursor   Codex   Gemini   OpenCode   Your tool
```

---

## Development

```bash
git clone https://github.com/frankxai/Starlight-Intelligence-System.git
cd Starlight-Intelligence-System
pnpm install
pnpm run build       # tsc to dist/
pnpm test            # 82+ orchestrator tests
pnpm run lint        # tsc --noEmit
```

`src/` is under 3,000 lines of TypeScript with zero runtime dependencies outside `better-sqlite3`. Substrate docs (`SIP.md`, `SIS.md`, etc.) are markdown-only — no build dependency.

---

## License

- **Code (operational layer + substrate-tier commands):** MIT — see [`LICENSE`](LICENSE).
- **Substrate spec docs** (`SIP.md`, `SIS.md`, `ALLIANCE.md`, `STACK.md`, `VOICES.md`, `VERTICALS.md`, `MEMORY.md`, `REGISTRY.md`, `SKILL.md`): MIT, same `LICENSE`. The "Built on SIP" attestation request is a social-layer convention captured in [`NOTICE`](NOTICE), not a license restriction.
- **Arcanea canon (if your fork composes with it):** CC-BY-NC 4.0, © Arcanea BV. Lives in `frankxai/arcanea-ecosystem`; canon is compose-only — not redistributed under this repo's MIT.
- **Trademarks:** ARCANEA, FRANKX, STARLIGHT INTELLIGENCE — registered or in registration, reserved rights.

"Built on SIP" is an attestation phrase, not a trademark. Use of the phrase requires actual SIP composition per `/sip-attest` rules. Full attribution + canon + trademark summary in [`NOTICE`](NOTICE) (Apache-style — `LICENSE` for legal rights, `NOTICE` for propagation conventions).

---

## Related

- [Arcanea](https://arcanea.ai) — Creator platform; canon-defining vertical built on SIS
- [FrankX](https://frankx.ai) — Architect brand; SIP thought leadership
- [Public Vaults](https://starlightintelligence.org) — Browse and fork vaults
- [Protocol page](https://starlightintelligence.org/protocol) — Canonical SIP spec
- [GitHub](https://github.com/frankxai/Starlight-Intelligence-System) — Source, issues, discussions

---

**Built on SIP** · Starlight Intelligence Protocol · v1.1.1 · v8.0.0 · MIT
