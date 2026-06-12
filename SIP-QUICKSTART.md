# SIP Quickstart — make your repo a sovereign intelligence system in an afternoon

> The minimum to be **SIP-conformant**: a contract any agent, on any harness, can read and write with provenance — without surrendering sovereignty. Full spec: [`SIP.md`](./SIP.md). This is the adopter's path.

You do **not** need this repo's code, agents, or stack to be SIP-conformant. SIP is a file + attestation contract. The reference implementation here is one way to satisfy it, not the requirement.

---

## The three tiers of conformance

| Tier | You have | Claim |
|------|----------|-------|
| **Core** | The 3 required files + attestation block | "SIP-conformant" |
| **Composed** | Core + MCP registry declaration + command taxonomy | "SIP-native" |
| **Allied** | Composed + a cross-party alliance under the sovereignty clause | "SIP alliance node" |

Most adopters want **Core**. It takes an afternoon.

---

## Core conformance — the checklist

### 1. Drop in the three required files (Layer 1)

At your repo root (or inside `.<vertical>/` for a sub-stack):

```
SKILL.md     # What an AI adopts when it loads this repo's context. The behavior contract.
AGENTS.md    # Your voices/agents (required only if you have >1 agent)
MEMORY.md    # Durable state: decisions, commitments, open forks. Append-only in spirit.
```

Optional but recommended: `SOUL.md` (the essence that must not drift), `CANON.md` (domain constants/archetypes), `STACK.md` (your tool choices — may inherit Starlight's).

**`MEMORY.md` is the load-bearing file.** It is your second brain's index. Keep entries small, dated, and linked. Markdown + YAML frontmatter + `[[wikilinks]]` makes it Obsidian-native and agent-readable at once — no database required.

A minimal `MEMORY.md` entry:

```markdown
---
name: chose-postgres-over-mongo
type: decision
date: 2026-06-06
---
Picked Postgres for the ledger. **Why:** relational integrity on attestation
chains matters more than write throughput here. Links: [[attestation-envelope]].
```

### 2. Attest every shared artifact (Layer 2 — the part that compounds)

Any artifact composing ≥1 SIP element carries this block. It is not credit *transfer* — it is credit *compounding* across every adopter downstream.

```
---
Built on SIP — Starlight Intelligence Protocol
- Substrate: starlightintelligence.org/protocol v1.1.1
- Verticals: [your-vertical]
- Canon: [none]
- Nodes: [your-sovereign-name]
Generated: 2026-06-06
---
```

Rules: substrate pinned by SemVer; vertical contributions pinned by commit SHA where available; unpinnable contributions marked `@unpinned`, **never fabricated**. Silent composition (using SIP and omitting the block) is a breach of the clause in step 4.

### 3. Declare your MCP surface, if you have one (Layer 3 — for SIP-native)

If you expose tools over MCP, add `mcp.json` at your repo root:

```json
{
  "name": "yourname-mcp",
  "sip_version": "1.1.1",
  "provides": ["yourname.memory", "yourname.attest"],
  "requires": [],
  "attestation": { "built_on_sip": true }
}
```

Skip this for Core conformance. It's the wedge for interop: a SIP-native MCP server is a second brain that **any** harness — Claude, Codex, Gemini, Grok — can read and write through one contract.

### 4. Accept the sovereignty clause (Layer 5 — non-negotiable)

By adopting SIP you accept, at minimum:

1. **Sovereignty** — you keep full decision rights in your declared domain. Advice ≠ override.
2. **Attribution** — every shared artifact carries the Built-on-SIP block.
3. **Commitment shape** — cross-party commitments name artifacts and dates, never intentions.
4. **Exit** — you can leave any composition; attribution history stays immutable.
5. **Encoded-self boundary** — the *pattern* (agents, skills, commands, governance) is forkable under each component's license. The *person* (voice clones, identity vectors, personal canon) is non-licensable and non-transferable. Forks inherit the pattern, never the person.

That's it. Three files + an attestation block + the clause = SIP-conformant.

---

## Verify your conformance

A repo is Core-conformant when all of these are true:

- [ ] `SKILL.md`, `MEMORY.md` exist at root (`AGENTS.md` too if >1 agent).
- [ ] At least one shared artifact carries a valid Built-on-SIP block with a pinned substrate version.
- [ ] No fabricated pins — unpinnable contributions are marked `@unpinned`.
- [ ] Your README or `SOUL.md` states which domain you hold sovereignty over.
- [ ] Nothing in your repo silently composes another party's canon without its license.

SIP-native adds: a valid `mcp.json` and commands following the `/sip-*` · `/alliance-*` · `/<vertical>-*` · `/<sovereign>-*` taxonomy (Layer 4), where lower tiers may depend on higher tiers but never the reverse.

---

## Why build your IS/OS on SIP

- **Portable memory.** Markdown + frontmatter + links. Opens in Obsidian, reads in any agent, survives any tool's death. No lock-in by construction.
- **Provenance for free.** The attestation block means contribution compounds instead of evaporating — yours and everyone's downstream.
- **Sovereignty by contract, not by hope.** The clause is the social contract that lets independent parties compose without one swallowing the others.
- **Harness-agnostic.** SIP is files and an envelope. It outlives any single model, CLI, or vendor.

Fork what you need. Attest what you ship. Hold your domain. That's the whole protocol.

---

**Built on SIP** · references `SIP.md` v1.1.1 · MIT
