# Starlight tenant platform (skeleton)

The runtime for managed agent teams: each paying customer gets their own agent, in their own
Worker, with a hard monthly spend cap. Built on Cloudflare Workers for Platforms and the
Agents SDK. Nothing here is deployed.

## How a request flows

1. `acme.<PLATFORM_DOMAIN>` hits the dispatcher Worker (`dispatcher/`).
2. The dispatcher takes the tenant id from the hostname only, checks the caller's bearer token
   against the hash in that tenant's ledger, and checks state and budget. The MCP OAuth
   callback carries no token, so it must instead present a `state` this tenant's agent issued
   in the last 10 minutes, and each state works once.
3. It reserves the metered cost of one call in the ledger (one request, CPU across the
   dispatch chain, three Durable Object requests, 30 s of agent wall time), then invokes `tenant--acme` from
   the `starlight-tenants` dispatch namespace with per-call limits (200 ms CPU, 50 subrequests)
   and `props.tenantId`. The platform token is stripped first.
4. The tenant Worker (`tenant-template/`) routes everything to one `TenantAgent` named by
   `props.tenantId`. MCP OAuth tokens added with `addMcpServer` stay in that agent's storage.

Isolation comes from Workers for Platforms itself (one script per tenant, no bindings to other
tenants) plus three rules the tests pin: identity only from the hostname, token checked per
tenant, ledger failure refuses the call.

## What each part does

| Path | Job |
|---|---|
| `dispatcher/src/core.ts` | Tenant ids, script names, plan limits, admission, state machine, cost model |
| `dispatcher/src/handler.ts` | Tenant traffic: auth, budget, dispatch |
| `dispatcher/src/lifecycle.ts` | `platform.<domain>`: signup, export, delete (admin token) |
| `dispatcher/src/index.ts` | Runtime glue and the `TenantLedger` Durable Object |
| `tenant-template/` | The Worker uploaded once per tenant |

## Run

```bash
pnpm test        # node:test, no install needed
pnpm cost        # cost scenarios from the live price constants in core.ts
```

## Cost (prices read 2026-10-29)

`pnpm cost` prints the scenarios. Platform fixed cost is $30/month (Workers Paid $5 +
Workers for Platforms $25, which includes 20M requests, 60M CPU-ms and 1,000 scripts). At 50,000
requests and 20 ms CPU per request per tenant, CPU overage starts around 60 tenants and adds
under $1/month at 100. A sandbox container
(1 vCPU, 4 GiB) costs about $0.11 per active hour, so 2 hours a day is about $6.50 per
tenant per month. Not modelled: Durable Object duration and storage, R2, model tokens.
Model tokens are the tenant's own key.

## Not done yet

- **Cost reconciliation.** The cap stops calls once the metered estimate reaches it. Agent wall
  time beyond 30 s per call (pending I/O can hold an object up to 15 minutes) and Durable
  Object storage are not yet read back from Cloudflare's analytics, so real cost can run past
  the recorded spend. Next step: a daily job that reads per-script usage and charges the gap.
- **Script removal on delete.** Delete suspends the tenant, wipes the agent's storage (OAuth
  tokens included), leaves a tombstone, then marks the tenant deleted. A call admitted just
  before the suspension can still write after the wipe. Removing the `tenant--<id>` script
  (which takes its Durable Objects with it) closes that gap; it needs the Cloudflare API and
  is a manual step for now.
- **Ledger Durable Object tests.** OAuth state expiry, single use and replay refusal live in
  `TenantLedger` and are covered only by the workerd run above, which has not happened yet.
- **Activation.** Tenants stay `pending_payment` until a verified payment webhook moves them to
  `active`. That path touches money and is Frank's to approve.
- **Real-runtime test.** The tests run the platform logic in Node. A `vitest-pool-workers`
  run against workerd (two tenants, one trying to reach the other's agent) waits for a
  machine with RAM headroom.
- **Type check.** `agents` and `@cloudflare/workers-types` are not installed here yet.
- **Tenant export of agent state** (only platform-side data is exported now).
- **Deploy.** Creating the namespace, enabling Workers for Platforms and setting
  `PLATFORM_ADMIN_TOKEN` are Frank's.
