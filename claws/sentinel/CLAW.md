# SIS Sentinel Claw

> Permissions, secrets, privacy, and mutation gates. Runs as a cross-cutting concern on every other Claw.

---

## Contract

```yaml
name: sis-sentinel-claw
version: 0.1.0
purpose: Gate permissions, detect secrets, enforce private/public splits, and require explicit approval before any Claw mutates user files or exports vault data.
phase: 1

permissions:
  filesystem: read
  sis_vaults: read
  shell: none
  network: none

inputs:
  - permission requests from other Claws
  - file paths pending mutation
  - content pending export
  - vault entries pending external write

outputs:
  - APPROVE / DENY decisions (programmatic)
  - /security/PERMISSION_LOG.jsonl
  - /security/SECRET_SCAN_REPORT.md
  - /security/AUDIT_TRAIL.jsonl

commands:
  - /sentinel-audit
  - /sentinel-scan-secrets
  - /sentinel-review-permissions
  - /sentinel-approve
  - /sentinel-deny

skills:
  requires:
    - safety/permission-gate
    - safety/secret-detector
    - safety/private-public-split
    - safety/mutation-approval
  activates:
    - intelligence/pattern-recognition
    - intelligence/decision-framework

mcp:
  required:
    - sentinel-mcp
    - filesystem-mcp
  optional: []

safety:
  mutation_default: false
  private_data_export: blocked
  requires_sentinel: false

agents:
  primary: starlight-sentinel
  supporting:
    - starlight-prime
```

---

## What Sentinel Claw Does

Sentinel Claw is the immune system of the Claw swarm. It does not perform creative work, memory operations, or knowledge extraction. It gates everything else.

Every Claw that touches the filesystem, executes shell commands, or writes to external surfaces **must pass through Sentinel's permission gate.** This is enforced by the Claw contract schema — any Claw with `requires_sentinel: true` cannot execute mutations without calling Sentinel first.

Sentinel's job is not to say no. It is to make sure the right person is saying yes.

---

## Four Core Functions

### 1. Permission Gate

Evaluates permission requests from other Claws before mutations execute:

```
Request arrives from Claw X:
  - Claw X wants to: [write file / execute shell / export data / move file]
  - Target: [path / service / vault]
  - Reason: [declared purpose]

Sentinel evaluates:
  - Is this within Claw X's declared permission surface?
  - Does this match the declared mutation_default?
  - Has the user explicitly approved this class of mutation?
  - Is the target path within the declared workspace?

Decision: APPROVE (with log) or DENY (with reason)
```

### 2. Secret Detection

Scans content before it exits the local machine:

```
Scan triggers:
  - Before any file is written outside ~/.starlight/
  - Before any vault export is generated
  - Before any content is sent to an external MCP server

Detection patterns:
  - API keys (common prefixes: sk-, pk-, ghp_, xoxb-, etc.)
  - Passwords in common patterns
  - Private keys (-----BEGIN PRIVATE KEY-----)
  - Email addresses in unexpected contexts
  - Phone numbers
  - Credit card patterns
  - Social security / government ID patterns

On detection: BLOCK export + report to user. Never auto-redact silently.
```

### 3. Private/Public Split

Enforces the boundary between private vault content and public-facing exports:

```
Private (never exported without explicit approval):
  - Personal details (names, addresses, relationships)
  - Financial specifics (account numbers, valuations)
  - Medical or health references
  - Content tagged as private in vault metadata
  - Entries from Horizon Vault (requires PR-level review)

Public (safe for export by default):
  - Frameworks and mental models
  - Technical patterns
  - Strategic decisions (non-sensitive)
  - Creative concepts
  - Professional voice fingerprint elements
```

### 4. Mutation Approval

For any Claw with `mutation_default: false` (most Claws), Sentinel enforces the explicit approval flow:

```
Proposed mutation arrives:
  → Sentinel presents: "Claw X wants to [action] affecting [N files/entries]"
  → User sees a clear summary of what will change
  → User types "I confirm" or provides specific approval
  → Sentinel logs the approval with: timestamp, Claw ID, action, user confirmation
  → Mutation proceeds
  → Result logged to AUDIT_TRAIL.jsonl
```

---

## Commands

### `/sentinel-audit`

Review the audit trail for the current session or a specified time range.

```
Usage: /sentinel-audit [--since YYYY-MM-DD] [--claw <name>]

Produces: readable summary of all approved/denied actions
```

### `/sentinel-scan-secrets`

Scan a file or directory for credential patterns before export.

```
Usage: /sentinel-scan-secrets --target <path>

Produces: SECRET_SCAN_REPORT.md
Never modifies the target — read-only scan.
```

### `/sentinel-review-permissions`

Review what permissions each installed Claw has declared and whether they match actual behavior.

```
Usage: /sentinel-review-permissions [--claw <name>]

Produces: permission surface summary per Claw
Flags: any Claw that has exceeded its declared permissions
```

### `/sentinel-approve`

Programmatic approval for mutation requests (used by other Claws in their flows).

```
Internal use only. Not for direct user invocation.
Records approval in PERMISSION_LOG.jsonl.
```

### `/sentinel-deny`

Programmatic denial with reason (used by other Claws in their flows).

```
Internal use only. Not for direct user invocation.
Records denial in PERMISSION_LOG.jsonl.
```

---

## Audit Trail Schema

```json
{
  "timestamp": "ISO-8601",
  "requesting_claw": "sis-reclamation-claw",
  "action_type": "file_move | vault_write | shell_exec | export",
  "target": "/path/or/service",
  "decision": "APPROVE | DENY",
  "reason": "within declared permissions + user confirmed",
  "user_confirmation": "I confirm",
  "session_id": "uuid"
}
```

---

## Security Invariants

1. **Sentinel cannot be bypassed** — any Claw with `requires_sentinel: true` in its contract is blocked from mutations until Sentinel issues a programmatic APPROVE
2. **Secret detection is synchronous** — exports are blocked at the point of detection, not async
3. **Audit trail is append-only** — AUDIT_TRAIL.jsonl uses append-only writes; no entry is ever deleted
4. **Sentinel cannot write vault content** — it reads but never writes to vaults, preventing Sentinel from being used as a channel for covert writes
5. **Third-party Claw skills are not auto-trusted** — skills from outside the SIS signed registry are flagged and require manual Sentinel review before activation

---

*Built on SIP · sis-sentinel-claw v0.1.0 · MIT*
