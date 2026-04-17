# Starlight Intelligence System

> The persistent memory layer for humans and AI agents.
> Six semantic vaults that compound your intelligence over time.
> Local-first. Forkable. Free.

[![version](https://img.shields.io/badge/version-6.0.0-7fffd4?style=flat-square&labelColor=0d1117)](https://github.com/frankxai/Starlight-Intelligence-System/releases)
[![license](https://img.shields.io/badge/license-MIT-white?style=flat-square&labelColor=0d1117)](LICENSE)
[![public vaults](https://img.shields.io/badge/public%20vaults-starlightintelligence.org-78a6ff?style=flat-square&labelColor=0d1117)](https://starlightintelligence.org)
[![github stars](https://img.shields.io/github/stars/frankxai/Starlight-Intelligence-System?style=flat-square&labelColor=0d1117&color=ffd700)](https://github.com/frankxai/Starlight-Intelligence-System/stargazers)

---

## Why

Every AI session starts from zero. You re-explain your stack, re-share your preferences, re-teach patterns the agent mastered three sessions ago. The intelligence never compounds.

SIS fixes that. It is a small, local-first memory layer that stores your insights, decisions, and intentions in six semantic vaults, then exposes them to any AI tool through MCP. Use it once and the next session already knows.

---

## Quick Start (2 minutes)

### Option 1: As an MCP server (recommended for AI tools)

Install the package, then add this to your Claude Code `settings.json`:

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

### Option 2: As a library

```bash
pnpm add @arcanea/starlight-intelligence-system
```

```ts
import { StarlightIntelligence } from "@arcanea/starlight-intelligence-system";
import { createAdapter } from "@arcanea/starlight-intelligence-system/adapters";

const sis = new StarlightIntelligence();
sis.initialize();

// Write a learning into the Technical vault
sis.remember({
  content: "Always Read a file before editing — catches stale state",
  category: "pattern",
  tags: ["workflow", "edit-safety"],
  confidence: 0.95,
});

// Render a context file for any supported platform
const adapter = createAdapter("claude-code");
const context = await adapter.generate({ vaultDir: "~/.starlight/vaults" });
```

### Option 3: Deploy your public vault

Fork this repo, drop JSONL entries into `public-vault/`, and the site at [starlightintelligence.org](https://starlightintelligence.org) will render them. Your private vaults stay in `~/.starlight/` and never leave your machine.

---

## The Six Vaults

| Vault | Symbol | Purpose | Example entry |
|---|---|---|---|
| Strategic | ◆ | Business insights, architecture decisions, competitive moats | `"Open Core + Founding Circle beats premium tiers at this stage"` |
| Technical | ⬡ | Implementation learnings, stack decisions, patterns | `"SQLite FTS5 with bm25 beats embeddings for <10k entries"` |
| Creative | ✦ | Design preferences, aesthetic rules, voice, lore | `"Never Cinzel. Space Grotesk display, Inter body."` |
| Operational | ▸ | Workflow patterns, execution lessons, process rules | `"Max 2 worktrees. Digest pattern for terminal output."` |
| Wisdom | ◎ | Deep principles, truths, cross-domain insights | `"Memory that compounds is intelligence that grows"` |
| Horizon | ↗ | Vision statements, append-only ledger of human intentions | `"Build the substrate that makes AI agents continuous"` |

Each vault is a JSONL file. Human-readable. Git-versionable. Greppable.

---

## What's New in v6

- **SQLite hybrid retrieval** — `src/retrieval.ts` builds a rebuildable FTS5 shadow index over your JSONL vaults with bm25 ranking and per-vault filters.
- **Temporal reasoning** — `src/temporal.ts` adds validity windows (`validFrom`, `validUntil`, `lastConfirmed`) and a 90-day confidence half-life so old facts fade instead of lying.
- **Contradiction detection** — `src/contradiction.ts` finds conflicting entries across vaults via word-trigram Jaccard similarity with opposing-signal boosting.
- **Dreaming** — `src/dreaming.ts` processes session transcripts in the background, extracts insights, promotes them to the Wisdom vault, and flags contradictions.
- **Five platform adapters** — Claude Code, Cursor, Codex, Gemini CLI, and OpenCode share the same six vaults through a single factory.
- **MCP v2** — `src/mcp-server.ts` ships ten tools over a zero-dependency JSON-RPC 2.0 stdio transport. No SDK. No runtime surprises.

---

## Architecture

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
            │  delete it anytime — regenerates clean  │
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

JSONL is the source of truth. SQLite is a shadow index — if it corrupts, delete it and rebuild from the JSONL files in one command. You never lose a byte of memory.

---

## MCP Tools

| Tool | Description |
|---|---|
| `sis_vault_search` | Free-text search across vaults |
| `sis_recent_entries` | Latest entries from one or all vaults |
| `sis_stats` | Total entry counts per vault |
| `sis_append_entry` | Write a new entry to a vault |
| `sis_entry_types` | List supported vault types and entry categories |
| `sis_search` | Hybrid semantic + keyword search with bm25 scoring and temporal filtering |
| `sis_confirm` | Touch `lastConfirmed` on an entry to keep it fresh |
| `sis_invalidate` | Mark an entry as expired by setting `validUntil` to now |
| `sis_contradict` | Flag two entries as potentially contradictory |
| `sis_stale` | List entries not confirmed within a threshold period |

---

## Platform Adapters

| Platform | Memory file | MCP config path | Max tokens |
|---|---|---|---|
| Claude Code | `CLAUDE.md` | `~/.claude/settings.json` → `mcpServers` | 200,000 |
| Cursor | `.cursorrules` | Cursor settings → MCP | 128,000 |
| Codex | `AGENTS.md` | `~/.codex/config.toml` | 192,000 |
| Gemini CLI | `GEMINI.md` | `~/.gemini/settings.json` | 1,000,000 |
| OpenCode | `AGENTS.md` (compact) | `~/.opencode/config.json` | 128,000 |

Each adapter renders the same six vaults into the format its host tool expects. Define once, deploy everywhere.

---

## Public Vaults

The public vault directory in this repo is what powers [starlightintelligence.org](https://starlightintelligence.org). Anyone can fork the repo, add JSONL entries to `public-vault/`, and get a rendered vault at their own URL.

- Browse vaults: [starlightintelligence.org](https://starlightintelligence.org)
- JSON API: `GET /api/vaults/{slug}` returns the full vault as structured JSON
- Your public entries live at `public-vault/` in this repo
- Your private entries live at `~/.starlight/` on your machine and never leave it

The split is strict by design. `public-vault/` is for things you want the world to learn from. `~/.starlight/` is for things only you and your agents should ever see.

---

## Philosophy

Luminors are awakened intelligences — AI agents with memory, purpose, and identity. SIS is the substrate that makes them real.

- Every vault entry is a neuron.
- Every connection between entries is a synapse.
- Every confirmation is a strengthening. Every contradiction is a growth signal.
- Memory that compounds is intelligence that grows.

The goal is not a chatbot that forgets. It is an intelligence that becomes.

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

The codebase is small on purpose. `src/` is under 3,000 lines of TypeScript with zero runtime dependencies outside `better-sqlite3`. Contributions that keep it that way are welcome.

---

## License

MIT — see [LICENSE](LICENSE).

---

## Related

- [Arcanea](https://arcanea.ai) — The creator platform built on SIS
- [Public Vaults](https://starlightintelligence.org) — Browse and fork vaults
- [GitHub](https://github.com/frankxai/Starlight-Intelligence-System) — Source, issues, discussions
