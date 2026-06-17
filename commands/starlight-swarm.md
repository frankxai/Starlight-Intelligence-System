# /starlight-swarm Command

> Create approval-gated multi-CLI swarm packets across the first Starlight repo ring.

**Tier:** Operational  
**Primary Agent:** Starlight Orchestrator  
**Autonomy:** `plan_approve`  
**Provider Mode:** `adapter_stubs`

---

## What it does

`/starlight-swarm` plans multi-repo, multi-CLI work without executing it. It inspects the configured v1 repo ring, checks available CLI/provider lanes, and emits structured packets that can later be approved and dispatched.

v1 never mutates repos and never calls paid/external generation providers by default.

Initial repo ring:

| Repo | Role |
|---|---|
| SIS | Memory, context, command, and control spine |
| Starlight Voice | Voice cockpit and local sidecar |
| Arcanea | Current working `@arcanea/orchestrator` dispatcher dependency |

Provider posture:

| Provider | v1 behavior |
|---|---|
| Claude / Codex / OpenCode | Detected and represented as dry-run execution lanes |
| Grok | Detected when `grok` is installed; dry-run packets only |
| Antigravity | Detected through `agy*` wrappers; dry-run packets only |
| Gemini | Registered, may be missing locally |
| Higgsfield | Registered as unavailable until a real CLI/API path is configured |

---

## Usage

### `/starlight-swarm <goal>`

Create a dry-run swarm plan and append an audit record.

```bash
/starlight-swarm evolve the SIS orchestrator and voice cockpit integration
```

### `/starlight-swarm --dry-run <goal>`

Same as the default v1 behavior, explicit for operator clarity.

```bash
/starlight-swarm --dry-run build the cosmos MCP planning packets
```

### `/starlight-swarm status`

Show repo and provider readiness summary.

### `/starlight-swarm providers`

List dry-run provider adapters and whether the local command/wrapper is available.

### `/starlight-swarm repos`

List the v1 repo ring, branch, and dirty-state summary.

---

## CLI Equivalent

```bash
starlight starlight-swarm --dry-run "build the cosmos MCP planning packets"
starlight starlight-swarm status
starlight starlight-swarm providers
starlight starlight-swarm repos
```

Audit records are written to:

```text
private/voice-operator/logs/swarm.jsonl
```

---

## Safety Contract

- Repo mutation requires explicit approval outside the generated plan.
- External provider calls are disabled in v1.
- Higgsfield is a registered placeholder until a real local adapter is configured.
- Arcanea orchestrator remains the working dispatcher dependency.
- arcanea-flow remains a connected sibling, not vendored into SIS.

---

*Operational tier. Built on SIP.*
