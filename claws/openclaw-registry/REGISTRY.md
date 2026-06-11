# SIS OpenClaw Registry

> Curated, signed skill registry for SIS Claws operating through the OpenClaw runtime. This registry is the authoritative list of skills that SIS trusts for OpenClaw execution. No external ClawHub skills are auto-trusted.

---

## Security Posture

Third-party ClawHub skills have had documented security incidents (early 2026): malicious skills targeting local credentials, wallet keys, browser session data, and shell access. This registry enforces:

1. **Source-only from this repo** — All skills come from `skills/` in `frankxai/Starlight-Intelligence-System`
2. **Declared minimum permissions** — Every skill's `SKILL.md` header declares exact permission requirements
3. **Hash-verified installation** — `openclaw install` verifies SHA-256 hash against this registry before loading *(planned v0.2 — design contract, not yet executable)*
4. **Sentinel runtime monitoring** — Sentinel Claw compares declared vs actual behavior during execution *(planned v0.2)*
5. **Zero shell access by default** — No SIS skill requests shell access. Bootstrap Claw is the only exception and uses a hard allowlist

> **v0.1 status (Metrics Truth Rule):** Items 1, 2, and 5 are enforced today via the source-control gate and Sentinel review on PR. Items 3-4 (hash verification, runtime monitoring) are the intended design contract — executable enforcement is a tracked v0.2 follow-up. Hash fields in this registry are placeholders until then.

---

## Registry Format

```json
{
  "id": "skill-id",
  "path": "skills/<domain>/<skill-name>",
  "version": "0.1.0",
  "hash": "<sha256-of-SKILL.md>",
  "permissions": ["filesystem:read", "sis_vaults:read"],
  "signed_by": "frankxai",
  "status": "active"
}
```

---

## Active Skills

### Memory Domain

| Skill | Permissions | Status |
|-------|------------|--------|
| `memory/vault-management` | `sis_vaults:read_write` | active |
| `memory/knowledge-synthesis` | `sis_vaults:read` | active |
| `memory/context-preservation` | `sis_vaults:read` | active |
| `memory/memory-consolidation` | `sis_vaults:read_write` | active |
| `memory/capture-discipline` | `sis_vaults:write` | active |
| `memory/insight-distillation` | `sis_vaults:read_write` | active |
| `memory/sis-memory-orchestrator` | `sis_vaults:read_write` | active |

### Intelligence Domain

| Skill | Permissions | Status |
|-------|------------|--------|
| `intelligence/strategic-reasoning` | none | active |
| `intelligence/systems-thinking` | none | active |
| `intelligence/pattern-recognition` | none | active |
| `intelligence/decision-framework` | none | active |
| `intelligence/genius-excavation` | `filesystem:read`, `sis_vaults:read_write` | active |
| `intelligence/knowledge-reclamation` | `filesystem:read`, `sis_vaults:read_write` | active |
| `intelligence/hermes-search` | `sis_vaults:read`, `network:ingest` | active |

### Safety Domain (Sentinel-managed)

| Skill | Permissions | Status |
|-------|------------|--------|
| `safety/permission-gate` | none (observer) | active |
| `safety/secret-detector` | `filesystem:read` (scan only) | active |
| `safety/private-public-split` | `filesystem:read` | active |
| `safety/mutation-approval` | none (gate only) | active |

### Orchestration Domain

| Skill | Permissions | Status |
|-------|------------|--------|
| `orchestration/multi-agent-coordination` | none | active |
| `orchestration/workflow-design` | none | active |
| `orchestration/context-engineering` | none | active |
| `orchestration/council-run` | none | active |
| `orchestration/swarm-plan` | none | active |
| `orchestration/task-router` | none | active |
| `orchestration/conformance-check` | `filesystem:read` | active |

### Integration Domain

| Skill | Permissions | Status |
|-------|------------|--------|
| `integration/repo-bridge` | `filesystem:read`, `network:ingest` (GitHub) | active |
| `integration/ecosystem-sync` | `network:ingest` | active |
| `integration/universal-adapter` | `network:ingest` | active |
| `integration/local-folder-scan` | `filesystem:read` | active |
| `integration/drive-ingest` | `network:ingest` (Drive read) | active |
| `integration/notion-ingest` | `network:ingest` (Notion read) | active |

---

## Blocked Skills

Skills that will never be permitted in SIS Claws regardless of source:

| Pattern | Reason |
|---------|--------|
| Shell exec (unrestricted) | Arbitrary command execution |
| Browser/keychain read | Credential theft surface |
| Crypto wallet access | Financial security boundary |
| Outbound POST without explicit approval | Exfiltration surface |
| `sis_vaults:write` outside Memory Claw | Unauthorized vault mutation |

---

## Adding a New Skill

1. Create `skills/<domain>/<skill-name>/SKILL.md` with permission header
2. Add entry to this registry with SHA-256 hash
3. Submit PR — Sentinel review required
4. On merge, skill becomes installable via `openclaw install`

**Permission header format in SKILL.md:**
```yaml
---
skill: <skill-id>
version: 0.1.0
permissions:
  filesystem: none | read | write
  sis_vaults: none | read | read_write | write
  shell: none | allowlist
  network: none | ingest | publish
mutation_default: false
private_data_export: blocked
---
```

---

## Skill Signing

Skills are signed via the GitHub commit signature of the `frankxai` account. The hash in this registry is the SHA-256 of the skill's `SKILL.md` file at the registered version. `openclaw install` verifying this before loading is a v0.2 deliverable; today the trust anchor is the signed commit on the canonical repo.

Future: GPG key signing for independent verifiability outside GitHub.

---

*Built on SIP · Sentinel-reviewed · MIT · SIS OpenClaw Registry v0.1.0*
