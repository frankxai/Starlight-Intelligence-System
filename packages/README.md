# `packages/` — substrate packages

> TypeScript packages that any Domain Sub-Stack composes with. Each package
> declares interfaces + base classes + canonical types. Implementations live
> per-vertical; the substrate provides the contract.

## Status

This directory contains two layers of packages:

**Substrate packages** — ratified 2026-05-03 per the `/starlight-board` SovereignNode + Calculator + ValidationRequirement proposal. These ship interface + types + base classes.

**SIS operational packages** — added as part of the SIS Claws architecture (v8.x scope). Each is independently publishable under `@arcanea/sis-*` and composes through the substrate layer.

---

## Substrate Packages

| Package | Purpose | Status |
|---|---|---|
| `@starlight/schemas` | Canonical entity types — SovereignNode + Profiles (Zod) | Foundation shipped 2026-05-03 |
| `@starlight/validation` | ValidationRequirement enum + jurisdiction extension mechanism | Foundation shipped 2026-05-03 |
| `@starlight/calculators` | Calculator interface + CalculatorResult + promotion-pipeline modes | Foundation shipped 2026-05-03 |
| `@starlight/agent-ui-runtime` | CopilotKit wrapper with strong-boundary enforcement | Scaffold + BOUNDARY.md only; full impl is cross-repo (Arcanea) |

### Composition rules

Every infra-touching Domain Sub-Stack (Energy, Home, Compute, Capital) **must** use:

1. `SovereignNode` from `@starlight/schemas` as its canonical entity type
2. `Calculator<I, O>` from `@starlight/calculators` for any numerical output (cost, sizing, ROI, capacity)
3. `ValidationRequirement` from `@starlight/validation` to gate any irreversible action

Non-infra-touching Domain Sub-Stacks (People, Sound, Music IS) opt out — their numerical claims are loose enough that LLM-prose is acceptable.

### The deterministic-not-LLM principle

Numerical and structural decisions never go through an LLM. The LLM does interpretation, extraction, and prose framing — never the math. This is a hard contract enforced by the package shape: a Calculator output carries `confidence` / `assumptions` / `warnings` / `required_validation` / `trace` and is auditable; an LLM output is not.

### Promotion pipeline

Every calculator carries a `mode` field with one of four values:

| Mode | Meaning | Use |
|---|---|---|
| `shadow` | Runs alongside legacy path; outputs logged but not shown to user | New calculators ship here |
| `live-with-warnings` | Outputs shown to user with explicit warning banner | After shadow corpus passes |
| `live` | Outputs shown to user as canonical | After live-with-warnings stabilizes |
| `deprecated` | Outputs hidden; calculator preserved for replay only | When superseded |

---

## SIS Operational Packages

```
packages/
├── sis-core/          — Substrate types, vault schema, SIP constants, shared utilities
├── sis-mcp/           — MCP server implementation (sis-memory-mcp, sentinel-mcp)
├── sis-cli/           — `starlight` CLI binary
├── sis-openclaw/      — OpenClaw skill pack for SIS Claws (curated, signed registry)
├── sis-skills/        — Compiled skill definitions + activation rules (75 rules)
├── sis-adapters/      — Platform adapters (Claude Code, Cursor, Codex, Gemini CLI)
└── sis-conformance/   — SIP conformance test harness
```

### `sis-core`
**npm:** `@arcanea/sis-core`

Foundation package. Exports TypeScript types for vault entry schemas, SIP protocol constants, and shared utilities. All other SIS packages depend on this.

### `sis-mcp`
**npm:** `@arcanea/sis-mcp`

MCP server implementations. Provides `sis-memory-mcp` (vault read/write/search) and `sentinel-mcp` (permission gates, secret detection, mutation approval). These are the only servers allowed to write canonical vault memory.

### `sis-cli`
**npm:** `@arcanea/sis-cli`

The `starlight` CLI binary. Commands: `starlight init`, `starlight remember`, `starlight search`, `starlight reconcile`, `starlight export`, `starlight verify`.

### `sis-openclaw`
**npm:** `@arcanea/sis-openclaw`

OpenClaw skill pack for SIS Claws. Contains curated, signed skills for the OpenClaw runtime. Does **not** depend on ClawHub — skills are sourced from this repo's `skills/` directory with explicit permission declarations. See `CLAWS.md` § Security Model for the signing and curation protocol.

### `sis-skills`
**npm:** `@arcanea/sis-skills`

Compiled skill definitions and activation rules (75 rules across 5 domains: intelligence, orchestration, memory, integration, safety). Source of truth is `skills/skill-rules.json`.

### `sis-adapters`
**npm:** `@arcanea/sis-adapters`

Platform adapters. Generates and validates config files for Claude Code (`.claude/`), Cursor (`.cursor/`), Codex (`.codex/`), Gemini CLI (`.gemini/`), and OpenCode.

### `sis-conformance`
**npm:** `@arcanea/sis-conformance`

SIP conformance test harness. Verifies that a SIS installation satisfies all protocol requirements: vault shape, MCP tool surface, attestation discipline, agent registry integrity.

---

## Cross-repo

When a sibling repo (`arcanea-flow`, `agentic-creator-os`, `arcanea`) wants to consume these packages, it imports via path resolution (today) or via npm install (v8.x). The cross-repo distribution packets at `docs/cross-repo-distributions/` name where each package consumer should land.

---

**Built on SIP** · Starlight Intelligence Protocol v1.1.0
- Layers used: [file-contract, attestation, sovereignty]
- Substrate ratified: 2026-05-03 (Board verdict at `docs/boards/2026-05-03-calculator-validation-substrate.md`)
- SIS Claws layer added: 2026-06-09 (CLAWS.md — Bootstrap, Memory, Sentinel, Genius, Reclamation, plus stubs for Creator, Business, Attestation, Architect)
