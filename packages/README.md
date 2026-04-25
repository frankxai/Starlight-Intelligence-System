# SIS Packages

> Monorepo packages for the Starlight Intelligence System. Each package is independently publishable under `@arcanea/sis-*`.

---

## Package Map

```
packages/
├── sis-core/          — Substrate types, vault schema, SIP constants, shared utilities
├── sis-mcp/           — MCP server implementation (sis-memory-mcp, sentinel-mcp)
├── sis-cli/           — `starlight` CLI binary
├── sis-openclaw/      — OpenClaw skill pack for SIS Claws
├── sis-skills/        — Compiled skill definitions + activation rules
├── sis-adapters/      — Platform adapters (Claude Code, Cursor, Codex, Gemini CLI)
└── sis-conformance/   — SIP conformance test harness
```

---

## Package Descriptions

### `sis-core`

**npm:** `@arcanea/sis-core`

The foundation package. Exports:
- TypeScript types for all vault entry schemas
- SIP protocol constants (versions, required files)
- Vault JSONL read/write utilities
- SQLite index initialization and query helpers
- Workspace config schema and loader

All other packages depend on `sis-core`. It has no dependencies on them.

### `sis-mcp`

**npm:** `@arcanea/sis-mcp`

MCP server implementations. Exports:
- `sis-memory-mcp` — the canonical vault MCP server (read/write/search six vaults)
- `sentinel-mcp` — permission gate, secret detection, audit trail MCP server

These are the only MCP servers that write to canonical vault memory. External MCPs (filesystem, github, google-drive) are ingestion-only.

### `sis-cli`

**npm:** `@arcanea/sis-cli`

The `starlight` CLI binary. Implements:
- `starlight install` — Bootstrap Claw entry point
- `starlight remember` — Memory Claw `/sis-remember`
- `starlight search` — Memory Claw `/sis-search`
- `starlight reconcile` — Memory Claw `/sis-reconcile`
- `starlight decay` — Memory Claw `/sis-decay`
- `starlight promote` — Memory Claw `/sis-promote`
- `starlight export` — Memory Claw `/sis-export`
- `starlight verify` — Bootstrap Claw `/sis-verify`
- `starlight audit` — Sentinel Claw `/sentinel-audit`

### `sis-openclaw`

**npm:** `@arcanea/sis-openclaw`

OpenClaw skill pack for ambient execution of SIS Claws. Packages the five founding Claws as OpenClaw-compatible skills with:
- Signed skill manifests
- Minimal permission declarations
- Local-first execution (no cloud dependency)
- Integration with `sis-memory-mcp` and `sentinel-mcp`

Install via: `openclaw install frankxai/sis-bootstrap-claw`

### `sis-skills`

**npm:** `@arcanea/sis-skills`

Compiled skill definitions and activation rules for distribution. Includes:
- All 16 core SIS skills (intelligence, orchestration, memory, integration)
- 4 safety skills (permission-gate, secret-detector, private-public-split, mutation-approval)
- `skill-rules.json` with activation triggers
- Platform-specific skill loader adapters

### `sis-adapters`

**npm:** `@arcanea/sis-adapters`

Platform adapter configuration generators. Supports:
- Claude Code (`.claude/` config)
- Cursor (`.cursor/` config)
- Codex (`AGENTS.md` + `.codex/` config)
- Gemini CLI (`.gemini/` config)
- OpenCode (`.opencode/` config)

Each adapter configures MCP server registration, skill loading, and vault path mapping for the target platform.

### `sis-conformance`

**npm:** `@arcanea/sis-conformance`

SIP compliance test harness. Tests:
- File contract completeness (SKILL.md, AGENTS.md, MEMORY.md present)
- Vault schema validity (JSONL parseable, entry format correct)
- MCP server connectivity (round-trip test per tool)
- Attestation block format (SIP § Layer 2 compliance)
- Claw contract schema validation

Run: `npx sis-conformance --path ./`

---

## Dependency Graph

```
sis-conformance
  └── sis-core

sis-adapters
  └── sis-core

sis-skills
  └── sis-core

sis-openclaw
  ├── sis-core
  ├── sis-mcp
  └── sis-skills

sis-cli
  ├── sis-core
  └── sis-mcp

sis-mcp
  └── sis-core

sis-core
  └── (no SIS dependencies)
```

---

## Build Order

1. `sis-core`
2. `sis-mcp`
3. `sis-cli`, `sis-skills`, `sis-adapters` (parallel)
4. `sis-openclaw`
5. `sis-conformance` (depends on all above for full test coverage)

---

*Built on SIP · packages v0.1.0 · MIT*
