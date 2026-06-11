# REGISTRY — SIP MCP Server Registry

Flat file registry per `SIP.md` § Layer 3. v1.1 will promote this to a queryable MCP server (`starlight-mcp`). Until then, this file is the canonical registry.

Every MCP server claiming SIP compliance carries `mcp.json` in its repo root and is appended here on registration.

## Schema

```yaml
name: <mcp-server-name>
sip_version: <semver>
owner: <entity>
status: active | dormant | deprecated
repo: <github url>
endpoint: <url or stdio>
provides: [<namespaced tool names>]
requires: [<other mcp dependencies>]
license: <spdx identifier>
attestation: built_on_sip
```

## Active servers

### arcanea-mcp
- **sip_version:** 1.0.0
- **owner:** Arcanea BV (Frank Riemer)
- **status:** active
- **repo:** `frankxai/arcanea-mcp`
- **endpoint:** stdio (local) + hosted TBD
- **provides:**
  - `arcanea.canon.validate` — check Guardian / Vel'Tara / Hz references
  - `arcanea.guardians.list` — canonical Guardian set
  - `arcanea.veltara.resolve` — Guardian → Vel'Tara → Hz triple lookup
  - `arcanea.lore.fetch` — canon passage retrieval
  - `arcanea.archetype.query` — pressure-test proposals against archetype set
  - (31 tools total — see repo for full manifest)
- **requires:** none
- **license:** MIT for server code, CC-BY-NC for canon payloads

### starlight-mcp
- **sip_version:** 1.1.0
- **owner:** Frank Riemer / Starlight Holding BV
- **status:** active
- **repo:** `frankxai/Starlight-Intelligence-System`
- **endpoint:** stdio (local) — `starlight-substrate-mcp` bin
- **provides:**
  - `starlight_registry_query` — query this registry as MCP
  - `starlight_verticals_list` — sovereign vertical enumeration from VERTICALS.md
  - `starlight_attestation_verify` — verify a "Built on SIP" block per SIP § Layer 2
  - `starlight_alliance_status` — alliance rows from local MEMORY.md (Notion integration planned for v1.2)
- **requires:** none
- **license:** MIT

### sis-memory-mcp
- **sip_version:** 1.1.0
- **owner:** Frank Riemer / Starlight Holding BV
- **status:** active
- **repo:** `frankxai/Starlight-Intelligence-System`
- **endpoint:** stdio (local) — `starlight-mcp` bin (planned: dedicated `sis-memory-mcp` bin in v8)
- **provides:**
  - `sis_vault_read` — read entries from a named vault
  - `sis_vault_write` — write a memory entry to a vault
  - `sis_vault_search` — full-text + semantic search across vaults
  - `sis_vault_reconcile` — detect duplicates and contradictions
  - `sis_vault_decay` — archive stale operational entries
  - `sis_vault_promote` — elevate a validated entry to a higher vault
  - `sis_export` — render vault content as platform-ready memory pack
  - `sis_health` — vault health metrics
- **requires:** none
- **license:** MIT
- **note:** This is the canonical vault write surface. External MCPs (filesystem, github, google-drive) are ingestion-only; they do not write to vaults.

### sentinel-mcp
- **sip_version:** 1.1.0
- **owner:** Frank Riemer / Starlight Holding BV
- **status:** planned (v8)
- **repo:** `frankxai/Starlight-Intelligence-System`
- **endpoint:** stdio (local)
- **provides:**
  - `sentinel_permission_gate` — evaluate mutation requests against Claw permission contracts
  - `sentinel_secret_scan` — scan content for credentials before export
  - `sentinel_private_public_split` — classify vault entries for safe export
  - `sentinel_mutation_approve` — interactive approval flow for file mutations
  - `sentinel_audit_trail` — query the permission audit log
- **requires:** none
- **license:** MIT

## Claw Registry

SIS Claws are installable operational units built on this substrate. Each Claw declares its permission surface, skill requirements, and MCP dependencies in a `CLAW.md` contract.

### Schema

```yaml
name: sis-<name>-claw
version: <semver>
status: active | planned | draft
phase: <1-4>
repo: <github url>
purpose: <one sentence>
permissions: { filesystem, sis_vaults, shell, network }
requires_sentinel: true | false
```

### Active Claws (Phase 1 + 2)

| Claw | Phase | Status | Purpose |
|------|-------|--------|---------|
| `sis-bootstrap-claw` | 1 | active | Install SIS on a local machine |
| `sis-memory-claw` | 1 | active | Operate six vaults as living memory |
| `sis-sentinel-claw` | 1 | active | Permissions, secrets, mutation gates |
| `sis-genius-claw` | 2 | active | Extract Genius Profile from scattered source material |
| `sis-reclamation-claw` | 2 | active | Turn knowledge chaos into a functional second brain |

### Planned Claws (Phase 3 + 4)

| Claw | Phase | Status | Purpose |
|------|-------|--------|---------|
| `sis-creator-claw` | 3 | planned | Convert memory into publishable assets |
| `sis-business-claw` | 3 | planned | Turn intelligence into an offer architecture |
| `sis-attestation-claw` | 3 | planned | Provenance ledger for SIP artifacts |
| `sis-architect-claw` | 4 | planned | Turn SIS itself into deployable systems |

See `CLAWS.md` for the full Claw specification, contract schema, and swarm architecture.

## Registration

To register a SIP-compliant MCP server:

1. Add `mcp.json` to the server's repo root per `SIP.md` § 3 schema.
2. Open PR against this file with the server block.
3. Starlight reviews for SIP compliance (file contract, attestation discipline, sovereignty clause). No taste judgments — protocol compliance only.
4. On merge, server is listed.

Starlight does not gate registration by vertical, owner, or commercial status. SIP is open.

## Deregistration

- Servers that fall out of SIP compliance (e.g., break attestation) are marked `status: deprecated` with a reason line.
- Server owners may request `status: dormant` at any time.
- Attribution history of artifacts built against a deprecated server is immutable.

---

**Built on SIP** · Registry v1.0 · MIT
