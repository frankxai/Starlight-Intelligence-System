# SIS Claws — Installable Operational Units

> **Substrate + Protocol + Packaged Agency.** Claws are the layer that makes SIS act.

Version: `v1.0.0`
Source of truth: `frankxai/Starlight-Intelligence-System`, file `CLAWS.md`.

---

## The Distinction That Matters

SIS has six concentric layers. Confusing them is the fastest way to build unmaintainable intelligence systems:

| Layer | What it is | Examples |
|-------|-----------|---------|
| **SIS** | The sovereign memory substrate | Six vaults, MCP server, platform adapters |
| **SIP** | The protocol + social contract | File contract, attestation, command taxonomy |
| **Agents** | Cognitive roles — reasoning personas | Prime, Architect, Sentinel, Weaver, Sage… |
| **Skills** | Callable capabilities — what an agent *can do* | Pattern Recognition, Vault Management… |
| **MCP** | Tool interface — external surface | filesystem, github, google-drive, sis-memory |
| **Claws** | Installable operational units — packaged agency | Bootstrap, Genius, Reclamation, Memory, Sentinel… |

**Agents think. Skills are capabilities. MCP connects. Claws act.**

A Claw owns exactly one lifecycle. One workspace contract. One permission surface. One artifact type. One measurable output. That bounded contract is what separates product infrastructure from toy agents.

### Glossary — "Claw" is used three ways; don't conflate them

| Term | What it means | Where it lives |
|------|--------------|----------------|
| **SIS Claw** | An installable operational unit defined by this spec (`claws/*/CLAW.md`) | This repo |
| **OpenClaw** | An external open-source personal AI agent platform — one of the agentic runtimes SIS Claws can install into. Not a SIS component; SIS does not own or govern it. | OSS ecosystem |
| **ClawHub** | OpenClaw's community skill marketplace. SIS trusts only its own curated registry, never ClawHub auto-loads. | OSS ecosystem |
| **Music IS Claws** (`Claw-X`, `Claw-IG`) | Per-platform social distribution units inside the Music Intelligence System — unrelated to this spec | `verticals/` Music IS |

**Runtime-agnostic by design:** SIS is the substrate; Claws are the packaged agency. They are built to install into *any* agentic system — Claude Code, Cursor, Codex, Gemini CLI, Antigravity, OpenCode, OpenClaw, or any AGENTS.md-compatible runtime. OpenClaw is the documented reference runtime below because it has a native install/skill model, not because SIS prefers or requires it. Adopter identities are kept in the private alliance register, never in public substrate files.

---

## Claw Contract Schema

Every Claw carries this contract at `claws/<name>/CLAW.md`:

```yaml
name: sis-<name>-claw
version: <semver>
purpose: <one sentence — what the user ends up with>
phase: <1 | 2 | 3 | 4>

permissions:
  filesystem: read | read_write | none
  sis_vaults: read | read_write | none
  shell: strict_allowlist | none
  network: required | optional | none

inputs: [<what the Claw consumes>]
outputs: [<files or artifacts the Claw produces>]

commands: [</slash-commands the Claw registers>]

skills:
  requires: [<skill ids>]
  activates: [<skill ids auto-loaded during Claw execution>]

mcp:
  required: [<mcp server names>]
  optional: [<mcp server names>]

safety:
  mutation_default: false | true
  private_data_export: blocked | allowed_with_approval
  requires_sentinel: true | false

agents:
  primary: <agent name>
  supporting: [<agent names>]
```

---

## The Five-Claw Founding Suite (Phase 1 + 2)

The five Claws below form the complete founding loop:

```
Install → Remember → Discover → Organize → Protect
   ↑                                              ↓
   └──────────────── Sentinel ──────────────────→─┘
```

All higher Claws (Creator, Business, Attestation, Architect) are expansion packs that depend on these five being healthy.

### Phase 1 — Make SIS Installable

| Claw | File | Purpose |
|------|------|---------|
| **Bootstrap** | `claws/bootstrap/CLAW.md` | Install SIS cleanly on a local machine |
| **Memory** | `claws/memory/CLAW.md` | Operate six vaults as living memory |
| **Sentinel** | `claws/sentinel/CLAW.md` | Permissions, secrets, mutation gates |

Phase 1 Claws are prerequisites. Without install, memory, and safety, every higher Claw is fragile.

### Phase 2 — Make the First Transformation Undeniable

| Claw | File | Purpose |
|------|------|---------|
| **Genius** | `claws/genius/CLAW.md` | Extract the user's distinctive intelligence from scattered source material |
| **Reclamation** | `claws/reclamation/CLAW.md` | Turn scattered knowledge chaos into a functional second brain |

Phase 2 delivers the core user miracle: *"my scattered life has architecture."*

### Phase 3 — Make It Economically Useful (Future)

| Claw | Purpose |
|------|---------|
| **Creator** | Convert memory into publishable assets |
| **Business** | Turn intelligence into an offer architecture |
| **Attestation** | Make "Built on SIP" a real verifiable ledger |

### Phase 4 — Make It Self-Improving (Future)

| Claw | Purpose |
|------|---------|
| **Architect** | Turn SIS itself into deployable systems |
| **Conformance** | Validate SIP compliance across the ecosystem |
| **Release** | Package and ship Claw updates |

---

## The Swarm Structure

Claws are not standalone. They compose into a swarm under SIS Prime:

```
SIS Prime
│
├── Bootstrap Claw       → install, configure, verify
├── Genius Claw          → extract uniqueness
├── Reclamation Claw     → organize scattered knowledge
├── Memory Claw          → maintain vaults (called by all other Claws)
├── Attestation Claw     → ledger + provenance (future)
├── Creator Claw         → publishable output (future)
├── Business Claw        → offer/product system (future)
├── Architect Claw       → repo/system evolution (future)
└── Sentinel Claw        → permissions, security, privacy (always active)
```

**Sentinel runs as a cross-cutting concern.** It is not a pipeline stage — it gates every Claw that touches local files, vaults, or external services.

---

## Local-First Storage Contract

SIS Claws default to local machine sovereignty. The canonical storage layout:

```
~/.starlight/
├── vaults/
│   ├── strategic.jsonl
│   ├── technical.jsonl
│   ├── creative.jsonl
│   ├── operational.jsonl
│   ├── wisdom.jsonl
│   └── horizon.jsonl
├── indexes/
│   └── starlight.sqlite
├── config/
│   └── workspace.json
├── attestations/
│   ├── YYYY-MM-DD-artifact-name.json
│   └── LEDGER.jsonl
├── exports/
└── logs/
```

**Ingestion rule:** External sources (Google Drive, Notion, Canva, PDFs, repos) are sources, not the substrate. Data flows in, never out without explicit approval.

```
External sources → Ingestion → Classification → SIS vaults → Platform exports
                  (Claws)    (Genius / Reclamation)         (Claude Code / Codex / ChatGPT)
```

**Cloud rule:** Only public vault, docs, attestation ledger, and install packages go to cloud. The canonical agent memory layer stays local.

---

## MCP Stack

| MCP Server | Role | Required by |
|-----------|------|-------------|
| `sis-memory-mcp` | Read/write/search six vaults | All Claws |
| `filesystem-mcp` | Ingest local folders | Bootstrap, Genius, Reclamation |
| `github-mcp` | Repo analysis, issues, releases | Bootstrap, Architect |
| `google-drive-mcp` | Source ingestion | Genius, Reclamation |
| `notion-mcp` | Optional second-brain import | Genius, Reclamation |
| `sqlite-mcp` | Index inspection, retrieval metrics | Memory |
| `browser-mcp` | Research and page capture | Genius |
| `sentinel-mcp` | Permission gates, secret detection, mutation approval | Sentinel (all Claws) |

**Architecture rule:** External MCPs may ingest. Only `sis-memory-mcp` writes canonical vault memory. This prevents tool chaos and preserves the sovereignty contract.

---

## Packages Layout

```
packages/
├── sis-core/          — substrate: types, vault schema, SIP constants
├── sis-mcp/           — MCP server implementation (sis-memory-mcp)
├── sis-cli/           — `starlight` CLI (sis remember / search / reconcile / decay / promote / export)
├── sis-openclaw/      — OpenClaw skill pack for SIS Claws
├── sis-skills/        — Compiled skill definitions + activation rules
├── sis-adapters/      — Platform adapters (Claude Code, Cursor, Codex, Gemini CLI)
└── sis-conformance/   — SIP conformance test harness

claws/
├── bootstrap/         — Install and configure SIS
├── memory/            — Vault operations
├── genius/            — Genius Profile extraction
├── reclamation/       — Knowledge reorganization
├── sentinel/          — Security and permission gating
├── creator/           — (future) Content production
├── business/          — (future) Offer architecture
├── attestation/       — (future) Provenance ledger
└── architect/         — (future) System evolution
```

---

## Installation Flow (reference runtime: OpenClaw)

OpenClaw is the reference install runtime because it ships a native skill-install model. The same Claw contracts install into any other agentic system via its platform adapter (Claude Code skills, Cursor rules, Codex, Gemini CLI, Antigravity).

```bash
openclaw install frankxai/sis-bootstrap-claw
openclaw install frankxai/sis-memory-claw
openclaw install frankxai/sis-genius-claw
openclaw install frankxai/sis-reclamation-claw
openclaw install frankxai/sis-sentinel-claw
```

Each install:
1. Reads `CLAW.md` — validates permissions, MCP requirements, safety flags
2. Checks system prerequisites (Node, pnpm/bun, required MCP servers)
3. Installs Claw-specific skills into `~/.starlight/skills/`
4. Registers commands into the active platform adapter
5. Runs conformance test
6. Writes Claw status to `~/.starlight/config/workspace.json`

---

## OpenClaw Security Model

> **v0.1 proof-of-pattern.** The security model described below is the intended design contract. The `mutation_default: false` invariant is currently enforced by convention (declared in each `CLAW.md` and checked by the Claw conformance test) and by code review gate. The full install-validation pipeline (hash verification, Sentinel runtime monitoring, openclaw CLI enforcement) is deferred to a tracked follow-up — the same ship pattern used for `crypto-intelligence/onchain` v0.1. This note will be removed when executable enforcement lands.

**Context:** Third-party ClawHub skills have had documented security incidents in early 2026 — malicious skills targeting local credentials, wallet keys, browser session data, and shell access. SIS does not depend on the general ClawHub ecosystem.

### SIS curated skill registry

All SIS skills are sourced from this repository's `skills/` directory only. No skill is auto-loaded from ClawHub or external registries without passing through the following gate:

```
1. DECLARATION   — Skill declares exact permissions in SKILL.md header
2. REVIEW        — Sentinel reviews permission surface against declared purpose
3. SIGNING       — Skill hash registered in skills/SKILL_REGISTRY.md with signing key
4. INSTALLATION  — openclaw install verifies hash before loading
5. RUNTIME GATE  — Sentinel Claw monitors actual behavior vs declared permissions
```

### Permission surface model

| Permission | What it covers | Claw access |
|-----------|---------------|-------------|
| `filesystem:read` | Read local files (no write) | Most Claws |
| `filesystem:write` | Write to `~/.starlight/` only | Memory Claw only |
| `filesystem:write_user` | Write outside `~/.starlight/` | Bootstrap + requires explicit approval |
| `network:ingest` | Outbound read (Drive, Notion, web research) | Genius, Reclamation, Hermes |
| `network:publish` | Outbound write (GitHub, social) | Creator, Attestation |
| `shell:none` | No shell access | All SIS Claws (default) |
| `shell:allowlist` | Specific commands only (npm, git) | Bootstrap only, hard allowlist |
| `sis_vaults:read` | Read vault atoms | Genius, Reclamation, Creator |
| `sis_vaults:write` | Write vault atoms | Memory Claw only |

### Hermes + OpenClaw

The `starlight-hermes` agent is the search backbone for all OpenClaw operations. When a Claw needs to find something — prior patterns, existing vault atoms, related files — it routes through Hermes rather than performing raw filesystem searches. This ensures:

- All search results carry provenance
- Privacy boundaries are respected (second-brain, health namespaces require explicit scope)
- Contradictions are surfaced before a Claw acts on stale data

**Hermes as an OpenClaw extension (tracked follow-up):** Hermes is portable by design. The plan is to ship it as a standalone OpenClaw-compatible skill/agent (`sis-hermes`, part of the `sis-openclaw` pack) so OpenClaw users get provenance-tracked search even without the full SIS Claw suite — usable in sync with SIS or as a standalone alternative.

### Install validation

Every `openclaw install frankxai/sis-*-claw` performs:

```
1. Hash verification  — CLAW.md hash matches signed registry entry
2. Permission audit   — declared permissions are the minimum needed (Sentinel review)
3. Prerequisite check — required MCP servers present and version-compatible
4. Isolation check    — no two installed Claws share a mutable filesystem path
5. Conformance test   — runs sis-conformance against the installed Claw
```

Claws that fail any check are not installed. The user sees a clear rejection reason.

---

## Hermes Integration

The Hermes agent (`starlight-hermes.md`) integrates directly with the Claw layer:

| Claw | Hermes Role |
|------|-------------|
| Bootstrap | N/A (Hermes not yet installed at bootstrap time) |
| Memory | Hermes provides vault search to prevent duplicate writes |
| Sentinel | Hermes traces provenance during security audits |
| Genius | Hermes mines corpus for pattern extraction |
| Reclamation | Hermes detects duplicates across source folders |
| Creator | Hermes surfaces prior voice + content assets |
| Attestation | Hermes surfaces prior attestation records |
| Architect | Hermes maps existing code + docs before generating new |

**Architecture rule:** Claws call Hermes for all retrieval. Claws never perform raw filesystem glob searches on the vault directory. This keeps provenance intact and contradiction detection active.

---

## Safety Invariants (default contract)

1. **`mutation_default: false`** — No Claw mutates user files without explicit approval. Plans are produced first. Bootstrap is the single declared exception (`mutation_default: true` — it exists to install; every mutation is still gated by explicit install approval).
2. **`private_data_export: blocked`** — No Claw exports vault content to external services without Sentinel gate approval.
3. **Sentinel cross-cuts** — The Sentinel Claw's `permission-gate` and `secret-detector` skills run on every Claw that touches filesystem or network.
4. **Signed skill registry** — SIS maintains a curated, signed skill registry. Random third-party ClawHub skills are not auto-trusted.
5. **Minimal permission surface** — Each Claw declares the minimum permissions needed. Claws cannot escalate at runtime.

---

## Relation to SIP

**Tier classification:** The Claw suite (`CLAWS.md` + `claws/*/CLAW.md`) is an **operational-tier** construct that SIS provides on top of the substrate. It does NOT modify the SIP Layer-1 file contract — `CLAW.md` is not a required SIP file class, and the Claws architecture is not a SIP protocol mandate. Forks implementing SIP are not required to implement Claws.

Claws are SIP-compliant operational units. Each Claw:

- Carries the SIP file contract (`CLAW.md` + `AGENTS.md` + `SKILLS.md` at minimum)
- Emits `/sip-attest` on every artifact it produces
- Declares its sovereignty scope (it does not override the user's files by default)
- Registers in `REGISTRY.md` on publication

---

*Built on SIP v1.1.1 — Starlight Claws spec v1.0.0 · authored by Starlight Architect · MIT*
