# Starlight control plane

One task queue in the cloud that every Starlight agent can reach: Claude Code on the laptop,
Codex, Hermes, claude.ai routines, Claude managed agents, Cloudflare and Vercel agents. It runs
as a single SQLite-backed Durable Object, so leases, path collisions, human gates and
maker ≠ checker are decided in one serialized place.

Author: Claude (Opus 5.5), 2026-10-30. Review state: queue passed Codex review (round 7); deploy tooling under review; not deployed.

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
| Completion needs a reference a verifier can open: an https URL, a commit SHA or a repo-relative file path | AGENTS.md §3 | `complete` |
| No two live leases name overlapping paths in one repo. A wildcard locks its whole directory; case, separators, `.` segments and trailing dots and spaces are folded | AGENTS.md §1, `tools/lane.mjs` | `claim` |
| Path segments and repo names have one spelling per file: plain ASCII letters, digits, `.`, `_`, `-`, `@`, `+`, no `~`, no spaces, no Windows device names, nothing rooted, no `:` | | `enqueue` |
| Only the exact lease holder (agent, harness and provider) with the lease's fence acts on it | AGENTS.md §1 | `heartbeat`, `complete`, `release` |
| Every task declares its gates (`["none"]` is an explicit statement). A declared money, publish, external-send, DNS, secrets, credentials, destructive or legal gate waits for a human, and so does a task the tripwire flags by its words or paths | Doctrine 0 | `enqueue`, `approve` |
| The verifier is a different provider than the maker, from a fixed provider list | AGENTS.md §5, CROSS-MODEL-GATE.md | auth, `verify` |
| A reused task id is accepted only for the identical task from the same producer | | `enqueue` |
| A task is time-boxed; a dead worker's lease expires and the task returns | AGENTS.md §6 | `heartbeat`, `sweep`, alarm |

The queue cannot read a producer's intent. Gates and the tripwire catch mislabelled work; what
stops a determined bypass is credential scope: workers never hold payment, publishing, DNS or
send credentials. Approval of a gated task lets an agent stage the work. Executing money,
publishing and sends stays with Frank, and the queue records who approved what.

The evidence check confirms a reference has an openable shape. Whether it exists and shows the
work is the verifier's job.

### Limits, stated plainly

- **Leases compare names, not files.** The queue runs in the cloud and cannot see a worktree, so
  symlinks, junctions and hard links that make two names reach one file are invisible to it.
  Don't write through links inside a leased path.
- **A lease cannot stop a stalled process from writing.** When a lease expires, the task can be
  claimed again, and the old worker's fence stops working for heartbeat, complete and release.
  Workers must heartbeat and stop writing the moment the queue refuses their fence. The queue does
  not enforce branch or worktree isolation: give each attempt its own `agent/<harness>/<scope>`
  branch and worktree, as AGENTS.md §1 already requires. Two attempts writing in one checkout can
  still overwrite each other.

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
| POST | `/v1/tasks` | producer | `id?, title, doneCondition, priority, repo, paths[], gates[], maxMinutes?, maxAttempts?` |
| POST | `/v1/tasks/claim` | worker | `repo?` → `{ task, expiresAt, fence }` |
| POST | `/v1/tasks/:id/heartbeat` | lease holder | `fence` |
| POST | `/v1/tasks/:id/complete` | lease holder | `fence, resultRef` |
| POST | `/v1/tasks/:id/release` | lease holder | `fence, reason?` |
| POST | `/v1/tasks/:id/verify` | verifier, other provider | `verdict: pass\|fail, note?` |
| POST | `/v1/tasks/:id/approve` | human | |
| GET | `/v1/tasks/:id` | any | task, lease and event log |

A supplied `id` makes `enqueue` idempotent, so producers can retry safely.

### MCP

`POST /mcp` serves the same operations as MCP tools over Streamable HTTP (JSON responses, no
sessions), behind the same bearer token. It answers both the stateless `2026-07-28` revision
(`server/discover`, per-request `_meta`) and the `initialize` handshake of `2025-11-25` and
`2025-06-18`. A `2026-07-28` request must carry matching `MCP-Protocol-Version`, `Mcp-Method` and (for `tools/call`) `Mcp-Name` headers plus `_meta` protocolVersion, or it gets 400. `tools/list` shows each identity only the tools its roles allow:
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
- `scripts/cp.mjs`: shell client. `scripts/mint-tokens.mjs`: token minting. `scripts/smoke.mjs`: post-deploy check.
- `tests/`: 53 `node:test` cases against real SQL through `node:sqlite`. Run `node --test tests/*.test.mjs` (Node 24).

## Deploy (Frank's steps; not done)

Steps 4 to 6 touch credentials, DNS and production, so they are yours; nothing here runs them for
you. Commands are PowerShell, run from this folder. Keep every token file outside the repo:
`mint-tokens.mjs` refuses to write raw tokens inside any git work tree.

1. **List the agents.** Create `$HOME\.starlight\control-plane\identities.json`, one entry per credential:
   `[{ "agentId": "queen", "harness": "claude", "provider": "anthropic", "roles": ["producer", "worker"] }, ...]`.
   Providers come from the fixed list in `src/core.ts`. Give at least one verifier a different
   provider than your workers, and give yourself `"provider": "human", "roles": ["human"]`.
2. **Mint the tokens.**
   ```powershell
   $cp = "$HOME\.starlight\control-plane"; New-Item -ItemType Directory -Force $cp | Out-Null
   node scripts/mint-tokens.mjs "$cp\identities.json" --table "$cp\agent-tokens.json" --tokens "$cp\new-tokens.json"
   ```
   `agent-tokens.json` holds only hashes; keep it, because a later run appends to it.
   `new-tokens.json` holds the raw tokens and is created readable by your user alone (the script
   checks the Windows ACL and deletes the file if it cannot). Hand each token to its agent, put
   them in Infisical, then delete the file.
3. **Check the bundle.** `wrangler deploy --dry-run --outdir dist` (about 31 KiB on 2026-10-30).
4. **Add a route and deploy.** `workers_dev` and preview URLs are off, so add
   `"routes": [{ "pattern": "cp.<your-domain>", "custom_domain": true }]` to `wrangler.jsonc` for a
   zone you own, then `wrangler deploy`. Until step 5 the Worker refuses every request, because it
   has no token table: it fails closed.
5. **Set the secret.** In Wrangler 4, `secret put` publishes a new Worker version at once, which
   is why it comes after the route exists.
   ```powershell
   Get-Content "$cp\agent-tokens.json" -Raw | wrangler secret put AGENT_TOKENS
   ```
   Every put replaces the whole table. To revoke an agent, delete its entry from
   `agent-tokens.json` and put it again. Optional: `wrangler secret put ALLOWED_ORIGINS` with a
   comma-separated list of browser origins. Agents send no `Origin`; a request that does, from an
   origin not on the list, gets 403.
6. **Smoke it.** Read the token from the file, so it never lands in shell history:
   ```powershell
   $env:CONTROL_PLANE_URL = "https://cp.<your-domain>"
   $env:CONTROL_PLANE_TOKEN = (Get-Content "$cp\new-tokens.json" -Raw | ConvertFrom-Json).'codex-1'
   node scripts/smoke.mjs --expect claim_task,verify_task
   ```
   Six read-only checks: up, refusing a missing and an unknown token, accepting this one, and
   answering MCP with the tools named in `--expect`. Run it once per role you minted.

### Try it locally first

`wrangler dev` runs the Worker in workerd with a local SQLite Durable Object. Mint throwaway
tokens into a temp folder, then start it with the table as a plain var (it holds only hashes):
```powershell
wrangler dev --port 8799 --persist-to "$env:TEMP\cp\state" --var "AGENT_TOKENS:$(Get-Content $env:TEMP\cp\agent-tokens.json -Raw)"
```
and point `smoke.mjs` and `cp.mjs` at `http://127.0.0.1:8799`.

## Next slices

1. **OAuth for the MCP endpoint** (`@cloudflare/workers-oauth-provider`), so claude.ai routines can attach it as a connector. They reach tools through connectors, not raw egress.
2. **Bridge.** Make `starlight-bridge` `enqueue_task` write through to this queue, and give the queen a claim loop. The local queue becomes a cache.
3. **Retire the in-memory lease API** in `starlight-cloud-worker` once agents claim here.
4. **Read model.** Mirror events to D1 for the Observatory and the systems map; the Durable Object stays the only writer.

Verified in workerd on 2026-10-30 (wrangler 4.152.0, `wrangler dev`, local SQLite Durable
Object): the smoke check (then 5 checks) passed 5 of 5, and the full loop ran over `cp.mjs` (enqueue, claim,
heartbeat, a wrong-agent heartbeat refused, complete, self-verify refused, cross-provider verify
to `done`, a money-gated task held until the human approved it). Not verified yet: lease expiry
firing through a real alarm (leases last 15 minutes), a production deploy, and a type-check
against `@cloudflare/workers-types`.
