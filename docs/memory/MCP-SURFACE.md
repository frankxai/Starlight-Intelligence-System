# SIS memory MCP surface

Status: consolidation contract
Reviewed: 2026-07-12

## Canonical direction

Run one demand-scoped SIS memory facade per machine and route every local harness through one authenticated Gateway/single-writer broker. Do not enable Canvas, SIS, or Substrate globally. Do not spawn one heavyweight provider per terminal or agent.

The current repo has several overlapping servers. Until consolidation is complete, identify them by role rather than by the ambiguous “Starlight MCP” name.

| Surface | Entry point | Current role | Memory authority | Recommendation |
|---|---|---|---|---|
| Operational package MCP | `dist/mcp-server.js` (`starlight-mcp`) | `sis_*` vault, temporal, goal, and registry tools | Writes operational JSONL directly | Supported compatibility surface; route writes through Gateway next. |
| Memory MCP v0.1 | `src/mcp-server-v01.ts` | `sis.*` memory/vault/agent/council tools | Uses VaultMemory plus ledgers | Experimental; merge useful tools into the canonical facade. |
| Substrate MCP | `dist/starlight-mcp.js` (`starlight-substrate-mcp`) | Registry, protocol, alliance, attestation | No operational memory authority | Keep demand-scoped and separate from daily memory. |
| IS orchestration MCP | `src/mcp-is.ts` | Intelligence-system routing | Orchestration, not canonical memory | Keep role-explicit. |
| Private memory bus | `private/memory-bus/server.py` | `memory_commit`, `memory_recall`, `memory_health`, `memory_audit_tail` | Private local JSONL index | Prototype/indexer surface; do not advertise as the production bus yet. |
| HTTP Memory Gateway | `src/gateway/daemon.ts` | Authenticated memory/session API | Intended broker boundary | Promote to the single operational backend. |

## Required topology

```text
Codex / Claude / Gemini / Hermes / OpenCode / custom agents
                           |
                           v
              one local SIS MCP facade
                           |
                           v
       one loopback Gateway + bearer auth + harness id
             |                         |
             v                         v
 canonical event protocol       per-harness SessionStore
             |
             +--> rebuildable indexes
             +--> durable provider outbox
             +--> encrypted device replication
```

The facade may be stdio while the Gateway is loopback HTTP or in-process. The critical invariant is one canonical write path, not one transport.

## Security invariants

- Bind network transports to loopback unless a reviewed mutual-auth transport is added.
- Require bearer authentication and a validated `X-SIS-Harness` identifier for HTTP.
- Enforce tenant/workspace/user/agent/session scope server-side; never trust a model-generated path or namespace.
- Accept only the six canonical vault identifiers on vault writes.
- Cap request size, query limit, result size, and execution time.
- Serialize canonical writes with owner-tokened locks until the broker owns the only writer.
- Treat `secret` as never external. Treat `private` as local unless explicitly approved. Send external providers only normalized facts/summaries and pseudonymous scopes.
- Keep canonical event ids and provider shadow ids distinct.
- Emit an audit receipt for write, forget, export, replication, provider projection, and policy denial.

## Tool naming target

Use one versioned family at the facade:

```text
sis.memory.remember
sis.memory.recall
sis.memory.forget
sis.memory.export
sis.memory.health
sis.session.get
sis.session.add
sis.session.pop
sis.session.clear
sis.vault.stats
sis.vault.consolidate
sis.provider.status
sis.provider.replay
```

Keep legacy `sis_*` aliases for one deprecation window. Every alias must call the same backend handler; it must not implement a second storage path.

## Health response target

`sis.memory.health` should report evidence, not a constant status:

- canonical event count and last accepted event id;
- current writer identity and lock age;
- index event watermark and lag;
- session-store health;
- consolidation age per vault;
- replication peer watermarks and unresolved conflicts;
- provider outbox pending/failed/dead-letter counts;
- privacy-policy version;
- MemPalace snapshot id/freshness;
- degraded reasons and operator actions.

## Demand-scoped activation

Use the smallest one-run command that provides the required capability:

- `codex-sis` for SIS work;
- `codex-canvas` for Canvas work;
- `codex-substrate` for substrate work;
- `codex-starlight` only when one task genuinely needs all three.

Closing that task should close its owned stdio processes. Never kill another task's MCP descendants manually, and never duplicate these servers in global harness configuration.

## Migration

1. Inventory actual harness configs and remove stale executable paths.
2. Put the Gateway behind the operational MCP facade.
3. Redirect all `sis_append_entry`, confirm, invalidate, contradiction, and v0.1 memory writes to Gateway commands.
4. Add the durable event/outbox protocol and idempotency keys.
5. Move reads to one hybrid index service with event-watermark consistency.
6. Deprecate direct JSONL writes, then the private bus API if it cannot implement the same protocol.
7. Publish one compatibility matrix and one conformance test run for every supported harness.

---

Built on SIP — Starlight Intelligence Protocol v1.1.1
