# Starlight control plane

One task queue in the cloud that every Starlight agent can reach: Claude Code on the laptop,
Codex, Hermes, claude.ai routines, Claude managed agents, Cloudflare and Vercel agents. It runs
as a single SQLite-backed Durable Object, so leases, path collisions, human gates and
maker ≠ checker are decided in one serialized place.

Author: Claude (Opus 5.5), 2026-10-30. Review state: unreviewed draft, not deployed.

## Why

Measured on 2026-09-19 in `starlight/AGENTIC-SYSTEMS.md`: the estate queue (`business_queue.json`
behind the `starlight-bridge` MCP, plus the queen inbox) is stdio on the laptop. No cloud worker
can read it, so when the laptop is busy or closed, the estate stops. 42 of 83 heartbeats were
dead, Hermes was stalled and 45 of 50 Windows tasks were disabled.

The live `starlight-cloud-worker` already exposes `/v1/swarm/lease/*`, but it keeps leases in an
in-memory `Map`, so two isolates never see each other's claims. That is not coordination.

## What it enforces

| Rule | Source | Where |
|---|---|---|
| Priority is an integer 1-9, never a word | AGENTS.md §3 | `enqueue` |
| No task without a done condition | AGENTS.md §3 | `enqueue` |
| No completion without an evidence path | AGENTS.md §3 | `complete` |
| Two writers never hold overlapping paths in one repo | AGENTS.md §1, `tools/lane.mjs` | `claim` |
| Money, publish, external send, DNS, secrets, credentials, destructive and legal tasks wait for a human | Doctrine 0 | `enqueue`, `approve` |
| The verifier is a different provider than the maker | AGENTS.md §5, CROSS-MODEL-GATE.md | `verify` |
| A task is time-boxed; a dead worker's lease expires and the task returns | AGENTS.md §6 | `heartbeat`, `sweep`, alarm |

Approval of a gated task lets an agent stage the work. Executing money, publishing and sends stays
with Frank; the queue records who approved what.

## State machine

```
enqueue ──► held ──approve (human)──► ready ──claim──► leased ──complete──► awaiting_verify
             (gated)                    ▲  ▲              │                   │
                                        │  └─expire/release┘                   │
                                        └──────────── verify: fail ◄────────────┤
                                                                               └─ verify: pass ─► done
                         any retry past maxAttempts ─► dead
```

## API

Every route except `/health` needs `Authorization: Bearer <token>`. The token's SHA-256 maps to
an identity `{ agentId, harness, provider, roles }`; roles are `producer`, `worker`, `verifier`, `human`.

| Method | Path | Role | Body |
|---|---|---|---|
| GET | `/health` | none | |
| GET | `/v1/status` | any | |
| POST | `/v1/tasks` | producer | `id?, title, doneCondition, priority, repo, paths[], gates?, maxMinutes?, maxAttempts?` |
| POST | `/v1/tasks/claim` | worker | `repo?` |
| POST | `/v1/tasks/:id/heartbeat` | lease holder | |
| POST | `/v1/tasks/:id/complete` | lease holder | `resultRef` |
| POST | `/v1/tasks/:id/release` | lease holder | `reason?` |
| POST | `/v1/tasks/:id/verify` | verifier, other provider | `verdict: pass\|fail, note?` |
| POST | `/v1/tasks/:id/approve` | human | |
| GET | `/v1/tasks/:id` | any | task, lease and event log |

A supplied `id` makes `enqueue` idempotent, so producers can retry safely.

### MCP

`POST /mcp` serves the same operations as MCP tools over Streamable HTTP (JSON responses, no
sessions), behind the same bearer token. It answers both the stateless `2026-07-28` revision
(`server/discover`, per-request `_meta`) and the `initialize` handshake of `2025-11-25` and
`2025-06-18`. `tools/list` shows each identity only the tools its roles allow:
`queue_status`, `get_task`, `enqueue_task`, `claim_task`, `heartbeat_task`, `complete_task`,
`release_task`, `verify_task`, `approve_task`.

Claude Code, Codex and Claude managed agents can send a bearer header. claude.ai connectors
(the route into cloud routines) expect OAuth, which is not built yet.

## Files

- `src/core.ts`: the rules, over a two-method SQL interface. No Cloudflare imports.
- `src/ops.ts`: one operation in, one `{status, body}` out.
- `src/handler.ts`: authentication and routing.
- `src/mcp.ts`: the MCP endpoint, one tool per queue operation.
- `src/index.ts`: the Worker and the `ControlPlane` Durable Object (one instance, `estate`), with one alarm armed for the next lease expiry.
- `tests/`: 26 `node:test` cases against real SQL through `node:sqlite`. Run `node --test tests/*.test.mjs` (Node 24).

## Deploy (Frank's steps; not done)

1. `wrangler secret put AGENT_TOKENS` with the identity table. Generate each token once, give it to one agent, and store only its SHA-256.
2. `wrangler deploy` from this folder. `workers_dev` and preview URLs are off, so it needs a route on a domain you choose.

## Next slices

1. **OAuth for the MCP endpoint** (`@cloudflare/workers-oauth-provider`), so claude.ai routines can attach it as a connector. They reach tools through connectors, not raw egress.
2. **Bridge.** Make `starlight-bridge` `enqueue_task` write through to this queue, and give the queen a claim loop. The local queue becomes a cache.
3. **Retire the in-memory lease API** in `starlight-cloud-worker` once agents claim here.
4. **Read model.** Mirror events to D1 for the Observatory and the systems map; the Durable Object stays the only writer.

Not verified yet: a `workerd` run (vitest-pool-workers needs RAM the machine does not have today)
and a type-check against `@cloudflare/workers-types`.
