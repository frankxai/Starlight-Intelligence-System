# memory/

> The persistent memory layer for the Starlight Intelligence System. Filesystem is the source of truth. Obsidian is one viewer; r3f `/brain` is another.

This directory is **dual-surface by design**:

- **For agents and scripts**: plain markdown + JSONL. Every entry is grep-able, diff-able, version-controlled. No proprietary format owns this data.
- **For Frank**: open this folder as an Obsidian vault for browse / search / Bases dashboards / Canvas mind-maps.

## Layout

| Path | What it is | Owner |
|---|---|---|
| `vaults/*.md` | Six permanent vaults — strategic, technical, creative, operational, wisdom, horizon | Per-vault writers (see `VAULT_ARCHITECTURE.md`) |
| `voice-sessions/{date}.md` | Daily capture log from Voice Operator | voice-operator |
| `knowledge-graph/index.jsonl` | Append-only event log; one line per packet | voice-operator pipeline |
| `knowledge-graph/_brain-cache.json` | UMAP+HDBSCAN-derived 3D scene cache for `/brain` | `brain_watchdog` daemon |
| `atlases/*.canvas` | Curated JSON Canvas exports (e.g. cluster mind-maps) | `scripts/kg_to_canvas.py` |
| `bases/*.base` | Obsidian Bases — live dashboards over the vault | hand-authored, generators welcome |
| `_audit/{date}.jsonl` | Privacy / read-write audit trail | `service.memory.audit` |
| `_handovers/` | Cross-session continuity docs | per-session human |
| `consolidation/` | Periodic merge / dedup outputs | weekly job |
| `intake/` | Inbound capture staging | `/capture-daily` |
| `voice-sessions/` | Voice Operator daily notes | voice-operator |
| `.obsidian/` | Vault config (viewer-only — workspace.json gitignored) | Frank |
| `VAULT_ARCHITECTURE.md` | The six-vault design: writers, readers, retention | substrate doc |
| `MEMORY.md` | Auto-memory index (in `~/.claude/projects/...`, not here) | Claude |

## Frontmatter contract

Every `vaults/*.md` and `voice-sessions/*.md` carries YAML frontmatter validated by:

```
python -m service.memory.frontmatter --check memory/
```

Run from `private/voice-operator/`.

**Vault schema** — see `VAULT_ARCHITECTURE.md` access matrix. Required keys:
`type: vault`, `vault`, `retention`, `writers`, `readers`, `last_consolidated`.

**Voice-session schema**: `type: voice-session`, `date`, `brand`, `decay_tier`, `intent_class`.

## Sovereignty rules

1. **No Obsidian Sync.** Use Git for substrate, Syncthing/iCloud only for personal scratch. Substrate sovereignty is non-negotiable.
2. **No external embeddings.** When sentiment / vector indexing lands, embeddings happen locally (`sentence-transformers`, never OpenAI/Cohere embedding APIs).
3. **Privacy Guardian gates writes.** Every external call (Anthropic, OpenRouter, fal, ElevenLabs) goes through `service.memory.guardian` for redaction first. See `skills/memory/sis-memory-orchestrator/`.
4. **Replaceable viewers.** Substrate is plain MD + JSONL. Obsidian is convenience, not lock-in. If Obsidian becomes hostile, switch to Logseq / Foam / a plain editor — the data still works.
5. **Bases are generated, not hand-curated.** `bases/*.base` should ship from a generator skill (planned: `obsidian-bases-author`). Until then, hand-authored ones live here as references.

## Refresh cadence

| Artifact | Refreshed by | Cadence |
|---|---|---|
| `_brain-cache.json` | `brain_watchdog` daemon | On `index.jsonl` write |
| `atlases/brain-clusters.canvas` | `scripts/kg_to_canvas.py` | Manual or post-`/brain` regen |
| Vault `last_consolidated` | `/orchestrate-brain` | Weekly |
| Operational vault entries >90d | consolidation job | Weekly archive sweep |

## Related

- `docs/superpowers/plans/2026-05-01-mirror-foundation.md` — current plan
- `skills/memory/sis-memory-orchestrator/SKILL.md` — substrate orchestration
- `private/voice-operator/service/memory/` — orchestration code
- `VAULT_ARCHITECTURE.md` — six-vault contract
- `src/gateway/` (protocol, server, daemon, session-store) — SIS Memory Gateway v0.1 (cross-harness SessionStore + loopback + RRF unification, per-harness namespaces e.g. grok-tui, claude-*, antigravity). Privacy-first (private tags dropped on search).
- `claws/memory/CLAW.md` — sis-memory-claw contract (/sis-remember etc.)
- `docs/strategic/sis-memory-provider-strategy-2026-06-18.md` — provider strategy: SIS as sovereign router with swappable local/cloud backends.

**Harness note:** All harnesses (Claude Code primary, Grok 4.3 TUI, Gemini, Antigravity swarm, Codex, Cursor) share the same vaults + gateway for session memory. Grok registers its sessions explicitly for unified recall across TUI invocations. See VAULT_ARCHITECTURE.md (private substrate mount) + tools/proving-ground/ for Queen integration.
