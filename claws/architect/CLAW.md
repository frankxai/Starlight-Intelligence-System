# SIS Architect Claw

> For builders: turn SIS itself into deployable systems.

**Status:** Phase 4 — planned. The meta-Claw. Helps build SIS while using SIS.

---

## Contract (Draft)

```yaml
name: sis-architect-claw
version: 0.0.1
purpose: Read repos, generate architecture maps, create MCP adapters, build tests, produce diagrams, prepare releases, and audit package boundaries.
phase: 4

permissions:
  filesystem: read_write
  sis_vaults: read_write
  shell: strict_allowlist
  network: optional

outputs:
  - Architecture maps
  - MCP adapter scaffolds
  - Test suites
  - Diagrams
  - Release packages
  - Package boundary audit reports

safety:
  mutation_default: false
  private_data_export: blocked
  requires_sentinel: true
```

## Skills (Planned)

- Repo architecture mapping
- MCP adapter generation
- Test generation
- Diagram generation (Mermaid, C4)
- Release preparation
- Package boundary auditing

## MCP (Planned)

- `github-mcp` — repo analysis, issues, releases
- `filesystem-mcp` — read/write scaffolding
- `shell-mcp` (strict allowlist) — build and test execution

---

*Built on SIP · sis-architect-claw v0.0.1 (draft) · MIT*
