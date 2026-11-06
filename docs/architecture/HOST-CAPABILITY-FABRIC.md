# Starlight Universal Host Capability Fabric — bounded v0 proposal

**State:** source-tested proposal; not merged, enrolled, connected, deployed or authorized to dispatch.  
**Existing owners:** `Starlight-Intelligence-System` #398 (local lifecycle), #143/#151 (federation and capability evidence), `frankxai/agentic-ops` #5 (sole execution authority), #50 (bus reconciliation), #149 (hybrid capacity), #312 (customer-run security floor).  
**Problem:** Starlight cannot answer, from ChatGPT or a cloud session, which *real host* has which *operable* harness/skill/tool right now. Static model rosters, old heartbeats, ChatGPT plugin listings and process detection are different evidence types. None alone constitutes dispatch authority.

## One contract, six orthogonal truths

| Plane | Canonical owner | Example | A fact it does **not** prove |
|---|---|---|---|
| Identity/config | Reviewed private Ops Registry + existing `multi-machine/hermes-bus/machines.json` | Node ID, expected hostname, owner, accepted agent boundary | Node online |
| Inventory/inspection | SIS #398 host-local adapters; Scout v0 adds read-only locations | Local CLI executable, skill manifest, MCP config name, npm project dependencies | Tool works, account authenticated, session running |
| Authentication/probe | SIS #151 federation adapter | Signed host challenge, authenticated provider probe, verified protocol version | Broad permission to run tasks |
| Work authority | Ops #5 Queen, grants, leases, budgets, policy | Exact WorkPacket/action/digest, expiry, execution budget | Work completed correctly |
| Lifecycle/evidence | Provider adapters + existing release receipts | Process/session ID, status, logs, cost, git SHA, eval results | Deployment/customer acceptance |
| User experience | Starlight Console and a future OAuth-backed ChatGPT MCP plugin | `fleet.list`, `fleet.plan`, `fleet.dispatch` (gated), `fleet.observe` | Any direct LAN reachability from ChatGPT |

Avoid a fourth queue, cloned agent framework, invented machine roster, unbounded local subprocess manager or Syncthing-based last-write-wins lease store. Machine list is reviewed configuration; ephemeral liveness belongs to authenticated operational projection with TTL, not Git `main`. Historical proofs remain immutable.

## Current read-only implementation

`tools/fleet/host-scout.mjs` uses only Node built-ins. It scans known executable names on PATH without launching them, manifest file *names* from Claude/agent/Codex/OpenCode skill paths, MCP server **names** in known configs, Claude plugin registration names, local `package.json` dependency declarations and physical resource headroom. It neither reads provider token values into results nor traverses symlinked SKILL manifests. It does not inspect or start processes; the existing SIS session manager owns that function.

```
node tools/fleet/host-scout.mjs --machine-id laptop-one --project-root /path/to/repo > host-private.json
node --test test/host-scout.test.mjs test/reconcile-hosts.test.mjs
```

`--include-local-paths` is only for a locally retained private report; avoid exporting it through shared or public MCP projections. Default hostnames can itself be private; the broker must redact or pseudonymize them per tenant. **Never publish a raw generated report into a public Git repository.** A local `observationSha256` means integrity of that output, not a signature or enrolled-device attestation.

`tools/fleet/reconcile-hosts.mjs` projects observations against an explicit reviewed allowlist, marks stale/invalid/wrong-host/unverified states and requires an externally implemented envelope verifier. It never admits dispatch. This is not an operational auth system. Identity verification needs enrolled public keys, server-issued nonce, challenge-bound signature, host enrollment/revocation, monotonic sequence, known signing algorithm and an expiry/replay window. Software-key signatures authenticate the keyholder, not TPM-backed hardware unless separately proven.

**Incomplete v0 inventory:** Python/uv/Conda, npm global tree, Rust/Cargo, VS Code/Cursor extensions, Windows services/Task Scheduler, Docker, hosted agents and supplier quotas still require bounded adapters. Local executable discovery alone does not establish actual installed package versions or successful provider authentication. Agent sessions require existing SIS lifecycle adapters. Unknown is a first-class result, not a false absence.

## User intent → execution eligibility

A request is compiled into a bounded task envelope:

```
Task { objective, artifact, repo+baseSha, requiredCapabilities, privacyClass,
       owner, inputDigest, allowedEffects, budget, deadline, stopRule,
       verification, rollback, idempotencyKey }
```

Placement is a **deterministic intersection** of owned execution rights, verified host identity, fresh heartbeat, tested adapter, actual required skills/versions, approved repository/worktree lease, current process/resource headroom, trust zone, allowed model/provider, quota, cost, and evaluation capacity. LLMs can propose ranking; only the existing authoritative service can reserve, admit and dispatch the exact packet. No capability inventory field can issue its own grant.

**Three distinct statuses:** `discovered` (inventory), `tested` (bounded probe on this host/scope), `admitted` (exact action grant). A process can be running while unauthenticated; a hosted API can be authenticated while quota-exhausted; a model can be capable while forbidden from a private repo. Never collapse these into one `online` Boolean.

## Execution boundary matrix

| Surface | Can safely do today with its **own** credentials | Requires additional verified integration |
|---|---|---|
| ChatGPT native connected GitHub/Vercel | Repository/PR/deployment reads and authorized connector writes | Execute native processes on a private laptop; interact with local Claude/Codex session; query hidden cloud tasks |
| ChatGPT + future `Starlight Fleet` plugin | Authenticated remote MCP operations **after hosted broker deployed** | User OAuth, broker-issued policy, enrolled agent with outbound connection, verified end-to-end receipt |
| Codex local CLI | Local `codex exec` and programmatic SDK/app-server lifecycle on host, under CLI sandbox/approval policy | Remotely start another person's CLI or access cloud Codex runs without supported provider API and grants |
| Claude Code local | Local CLI or Agent SDK processes with scoped tools, subject to authentication and provider terms | Account-level Claude Cloud jobs/tasks/status integration; cannot infer API credits from chat subscription |
| Hermes / OpenCode / Gemini CLI | Their own local authorized tools and adapters; process/session evidence on their node | Federated control and provider-specific authenticated statuses |
| GitHub Actions | Hosted deterministic CI or explicitly trusted self-hosted runner workflows | Permanent local fleet coordinator; runner authorization/secure isolation and supported scopes |
| Railway | Stateful long-running worker bridge/sidecar if an existing deployment is qualified | Local machine identity, user machine permission and reliable outbound link |
| Cloudflare Workers/DO | Broker endpoint, scoped data, hibernating WebSocket coordination and status projection | OS process/CLI execution (must delegate to trusted worker) |
| Vercel/Eve/Agents API | Hosted bounded agents/services under connected project/provider context | Permission to call an unrelated local CLI or self-authorize production release |
| Syncthing/Tailscale | Fast file mirroring and network reachability where configured | Task lease, command authority, signed provenance, guaranteed host liveness |

Cloud Codex and Claude may expose multiple run products; model-facing chat subscription, provider SDK API access, local CLI session and remote cloud account are separate entitlements and consent boundaries. Anthropic explicitly states that third-party developers may not offer claude.ai login or rate limits inside their products without prior approval; commercial Starlight Claude Agent SDK orchestration must use approved API-key/managed-agent methods, not users' subscription sessions as a resold backend. The user's own interactive Remote Control session is a different, Anthropic-controlled feature that keeps execution on the host. OpenAI managed Codex Agents API has separately metered API usage. Never capture/proxy personal subscription tokens to build a multi-tenant API.

## Network/control placement

1. **Node agent:** Run local Scout + SIS #398 native lifecycle inside an opt-in, least-privileged local service. It owns OS-specific adapters, whitelist of available CLI actions, process isolation/kill, local file permissions and outbound connection. It does **not** grant itself remote privileges.
2. **Broker:** Reuse accepted private Ops authority (#5) and existing persistent-entity transport. Cloudflare DO WebSocket may be a low-cost presence/duplex adapter; Railway may hold a long-lived bridge where justified. Only one service actually owns grants/leases/costs. Reconnects reconcile previous effects, never replay writes by assumption.
3. **CLI adapter:** Prefer Codex app-server or SDK and Anthropic Agent SDK for structured events/approval flows; fall back to tightly scoped, supported bounded CLI invocations (`codex exec`, `claude -p`) with OS Job Objects/cgroups. Do not make an arbitrary `shell(command)` remote tool.
4. **Cloud adapter:** Connect to provider-supported task/session APIs, GitHub job IDs and deployment IDs, with explicit per-user auth. `status` and `cancel` are honest when provider cannot cancel remotely.
5. **ChatGPT surface:** Private OAuth 2.1 remote MCP plugin: read-only `fleet_list_nodes`, `fleet_capabilities`, `fleet_sessions`, `fleet_get_run`, `fleet_get_evidence`; controlled `fleet_prepare_work`, `fleet_submit_work`, `fleet_request_cancel`, `fleet_get_approval`. AuthN AuthZ on each tool; no keys or arbitrary executables in tool arguments. `fleet_submit_work` only accepts broker-issued packet/approval IDs.
6. **Console:** The same tools back premium, proof-first UI: Machines / Tools / Sessions / Jobs / Policies / Costs / Incidents. Drill to freshness, source, release SHA and reviewer. A healthy UI cannot substitute for actual device provenance.

### Source-aware consent

Personal mode: user owns machine, repo, CLI auth, policy and approved actions. Hosted mode: optional managed coordination, never silent file exfiltration. Team mode: tenant/resource/role isolation and audit. Client/customer repos stay blocked until Ops #312's security floor passes; no untrusted PR code on founder machine or shared Windows session.

### Failure semantics

- Missing/stale heartbeat: show OFFLINE/STALE, no new local job.
- `SKILL.md` on disk: `MANIFEST_PRESENT`, never `SKILL_LOADED` or `INSTALLED_IN_ALL_HARNESSES`.
- MCP configured but handshake untested: CONFIGURED_UNVERIFIED; no tool call.
- Identity mismatch or new/unrecognized host: quarantine and require enrollment.
- Task timed out after remote dispatch: UNKNOWN_EFFECT; inspect external reference before retry.
- Cloud service reports succeeded without exact artifact proof: RESULT_UNVERIFIED.
- Host disconnected during execution: no instant "canceled" claim; preserve lease and reconcile on rejoin.
- Revoked credential/key: deny fresh tasks, invalidate cached capability probes, do not claim already-dispatched tasks stopped.
- Unauthorized merge or production promotion: held; protected-branch/release authority still governs.

## Evidence and release ladder

- **v0 (this draft):** portable read-only capability snapshot, safe schema projection, deterministic tests. No remote collection, no machine authentication, no cloud task lifecycle, no provider login.
- **v1:** integrate SIS lifecycle sessions + additional library/install adapters; validate on real Yoga Book and C940; private signed observations and fresh heartbeats into existing Ops projection. A full local command should return results in seconds with no raw secrets in transport.
- **v2:** round-trip private ChatGPT plugin read-only fleet awareness via OAuth2.1; live `get machines/capabilities/jobs` proven against two hosts. Explicit unavailable/expired states.
- **v3:** one sandboxed approved Codex or Claude task dispatched via the existing Ops work packet/lease from ChatGPT, source-linked repo PR produced, independently reviewed. Inject disconnect/restart/duplicate/kill/revocation cases and prove no duplicated effects.
- **v4:** cloud session/agent reference adapters, progress streams, cost reconciliation, browser-based previews and scoped customer enrollment/productization.

**Pilot bar:** 2 real enrolled devices, 2 successful read-only inventories, exact-session snapshots, 1 real authenticated provider capability probe per host, 1 controlled dispatched PR with checks, 1 independent review receipt, zero duplicate effects in 10 injected retry cases; report P95 control-plane ack and full costs. Until the verified pilot, claims of universal execution or always-on availability remain proposals.

## Useful primary references (review at implementation time)

- OpenAI Codex app-server / SDK: https://developers.openai.com/blog/codex-as-a-platform
- OpenAI Agents API: https://developers.openai.com/api/docs/guides/agents-api/overview
- ChatGPT MCP plugin auth: https://developers.openai.com/plugins/build/auth
- ChatGPT MCP server: https://developers.openai.com/plugins/build/mcp-server
- Cloudflare Durable Object WebSockets: https://developers.cloudflare.com/durable-objects/best-practices/websockets/
- Existing canonical owners: SIS #398/#151/#143; Ops #5/#50/#149/#312.

- Anthropic Agent SDK terms and integration boundary: https://code.claude.com/docs/en/agent-sdk/overview
- Anthropic local Remote Control (host must stay on): https://code.claude.com/docs/en/remote-control
