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

### starlight-mcp *(v1.1 — planned)*
- **sip_version:** 1.1.0 *(draft)*
- **owner:** Frank Riemer / Starlight Holding BV
- **status:** planned
- **repo:** `frankxai/starlight-mcp`
- **endpoint:** TBD
- **provides (planned):**
  - `starlight.registry.query` — query this registry as MCP
  - `starlight.verticals.list` — active vertical enumeration
  - `starlight.attestation.verify` — verify a "Built on SIP" block against source
  - `starlight.alliance.status` — alliance cycle state across Notion DBs
- **requires:** none
- **license:** MIT

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
