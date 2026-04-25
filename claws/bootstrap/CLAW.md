# SIS Bootstrap Claw

> Install SIS cleanly on a local machine. Boring, ruthless, excellent.

---

## Contract

```yaml
name: sis-bootstrap-claw
version: 0.1.0
purpose: Install SIS on a user's machine, initialize six vaults, configure platform adapters, and verify local retrieval works.
phase: 1

permissions:
  filesystem: read_write
  sis_vaults: read_write
  shell: strict_allowlist
  network: required

inputs:
  - local machine (no upload required)

outputs:
  - ~/.starlight/ directory tree
  - ~/.starlight/config/workspace.json
  - Platform adapter configs (Claude Code / Cursor / Codex / Gemini CLI)
  - Conformance test report

commands:
  - /sis-install
  - /sis-verify
  - /sis-reconfigure

skills:
  requires:
    - safety/permission-gate
    - safety/secret-detector
  activates:
    - orchestration/workflow-design
    - orchestration/parallel-execution
    - memory/vault-management

mcp:
  required:
    - filesystem-mcp
    - sis-memory-mcp
    - sentinel-mcp
  optional:
    - github-mcp

safety:
  mutation_default: true
  private_data_export: blocked
  requires_sentinel: true

agents:
  primary: starlight-orchestrator
  supporting:
    - starlight-sentinel
    - starlight-architect
```

---

## What Bootstrap Claw Does

The Bootstrap Claw is the entry point for every new SIS installation. Without it, SIS remains impressive to builders but fragile for professionals. It handles:

1. **Prerequisites check** — verifies Node ≥18, pnpm or bun, required MCP servers
2. **Directory initialization** — creates `~/.starlight/` with the canonical structure
3. **Vault initialization** — writes empty JSONL files for all six vaults with proper headers
4. **Index creation** — initializes `starlight.sqlite` for hybrid FTS+semantic retrieval
5. **Adapter configuration** — writes platform adapter configs for Claude Code, Cursor, Codex, Gemini CLI
6. **Workspace file** — creates `.sis-workspace.json` at the user's chosen project root
7. **Conformance check** — runs `sis-conformance` suite to verify local retrieval works
8. **MCP registration** — adds `sis-memory-mcp` to the active platform's MCP config

---

## Workspace Layout Produced

```
~/.starlight/
├── vaults/
│   ├── strategic.jsonl          # empty, headers written
│   ├── technical.jsonl
│   ├── creative.jsonl
│   ├── operational.jsonl
│   ├── wisdom.jsonl
│   └── horizon.jsonl
├── indexes/
│   └── starlight.sqlite         # initialized, empty
├── config/
│   └── workspace.json           # machine config + Claw inventory
├── attestations/
│   └── LEDGER.jsonl             # initialized, empty
├── exports/
└── logs/
    └── bootstrap.log
```

---

## Commands

### `/sis-install`

Full installation flow. Idempotent — safe to re-run.

```
1. Check prerequisites (Node, pnpm/bun, disk space)
2. Create ~/.starlight/ directory tree
3. Initialize six vaults (empty JSONL with vault headers)
4. Initialize SQLite index
5. Write platform adapter configs
6. Write workspace.json
7. Register sis-memory-mcp in platform MCP config
8. Run conformance tests
9. Report: install status + any failures
```

### `/sis-verify`

Non-destructive health check. Runs conformance tests without modifying anything.

```
1. Check directory structure integrity
2. Validate JSONL vault files (parseable, correct schema)
3. Check SQLite index health
4. Verify MCP server connectivity
5. Test one round-trip write + read + delete per vault
6. Report: pass/fail per check
```

### `/sis-reconfigure`

Reconfigure platform adapters after switching platforms or moving the SIS directory.

```
1. Detect current active platform (Claude Code / Cursor / Codex / Gemini CLI)
2. Re-write adapter config files
3. Update workspace.json with new paths
4. Verify MCP registration
5. Report: reconfiguration complete
```

---

## Safety

- Shell commands are executed against a strict allowlist (no arbitrary shell expansion)
- All file writes are logged to `~/.starlight/logs/bootstrap.log`
- Existing vault data is never overwritten — Bootstrap checks before writing
- Sentinel Claw gates any shell operation above directory creation

---

*Built on SIP · sis-bootstrap-claw v0.1.0 · MIT*
