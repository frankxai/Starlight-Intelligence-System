# Cloudflare protected API containment — 20 October 2026

Status: **deployed containment**, not customer API activation. The production worker now refuses protected API work while verified identity/membership and durable lease arbitration remain unconfigured.

## Problem and correction

Read-only inspection of the previously active Cloudflare bundle found a tenant resolver that accepted arbitrary bearer-shaped strings and a caller-selected tenant header, manufacturing plan/quota state without verification. Its coordinator also returned acquired/active responses without durable arbitration. Current repository source already contained explicit containment, but the live October 11 deployment did not.

The release ported only the current mainline ingress/health/coordinator containment into the existing compiled worker. No account grant, provider credential, schema, database, namespace, route, schedule or binding expansion was made. Unreachable legacy implementation code remains unqualified. Public palace bytes were preserved; its visualization numbers are not evidence of real workloads.

Owner source: `services/starlight-cloud-worker/src/index.ts`, inspected file blob `0324828152166b16daad9f410cc8822acc45a63b`. Mainline synthetic tests inspected: `test/cloud-worker-e2e.test.ts`, blob `ae53fd7b8fd33cd822c26bcf1b3e0c944da9ab89`. The runtime candidate is a narrowly scoped compiled-bundle port of that fix, not a claim that all current mainline source was rebuilt or deployed.

## Release identity

| Record | Value |
| --- | --- |
| Worker | `starlight-cloud-worker` |
| Previous deployment | `7eab5b72-71b0-4880-9a60-a450abd116a4` |
| Previous version | `3aaaf62b-2d5f-47e4-ad7f-fd8a948f9c95` |
| Normalized previous module SHA-256 | `3253fd648d945fd7df6df2804b8559ebbf89fd0e8dc0699a1bec982841884047` |
| Reviewed candidate/deployed module SHA-256 | `6683f6a82379f1f395ecf789dfaeffd81873a0e961d17e5db4470905ebf67577` |
| New version | `f82e6fee-d38f-4516-b8ef-d0d2a6d8e1da` |
| Version created | `2026-10-20T01:17:04.442388Z` |
| New deployment | `fff9b87c-0451-4ef4-a51e-0d08cd9cb392` |
| Deployment created | `2026-10-20T01:17:53.617398Z` |
| Configured traffic | 100% new version |

The original compiled multipart module was normalized by extracting the `index.js` part and removing its stale source-map comment; the recorded digest identifies that preserved recovery artifact. It contains no issued credential literals in the inspected code. Preserve the original version and the normalized module privately for incident analysis; do not restore its vulnerable authentication as routine recovery.

## Verification

The exact candidate passed **33/33** synthetic Node tests and `node --check`. A separate reviewing agent inspected the complete diff and request/coordinator tests and independently reran all 33 tests before publication. Cases cover the old fabricated-identity behavior, malformed authorization, ten protected paths for two caller-selected tenants, malformed bodies rejected before parsing, zero binding/outbound effects, public health/preflight/palace preservation, and coordinator denial.

Cloudflare preflight established the expected previous active version and latest uploaded version before staging. The version upload used strict inheritance of all eight existing bindings. Original/staged binding values were compared internally and matched; values were not printed. Downloaded staged module content matched the independently reviewed local module exactly before deployment, establishing the same recorded SHA-256. After the separate deployment operation, the provider returned the new version at 100%, and downloaded content again matched exactly.

Binding names only: `AI`, `API_VERSION`, `DEFAULT_HALF_LIFE_DAYS`, `ENVIRONMENT`, `STARLIGHT_DB`, `STARLIGHT_KV`, `STARLIGHT_VECTORS`, `SWARM_COORDINATOR`. Compatibility stayed `2026-10-10` with `nodejs_compat`; usage model stayed standard. Logpush stayed false, tail consumers and cron schedules stayed empty, and no observability field was returned. No resource deletion, data migration or durable state reset occurred.

At `2026-10-20T01:18:26Z`, the independent reviewer opened `https://starlight-cloud-worker.frankxai.workers.dev/health` in the browser and observed `protectedApi.status = unavailable`, reason `identity_membership_verifier_missing`, and D1/KV/Vectorize presence flags. This is public health evidence. No production forged-identity request, protected customer-data request, paid inference or tenant-isolation acceptance test was performed. Synthetic denials and deployed-source equality establish the containment path; they do not establish customer API readiness or historical absence of access.

## Reproduce and inspect

The adjacent deterministic reproduction script takes the preserved normalized prior module as input, checks its exact digest, applies six byte-range edits, checks the expected candidate digest, and writes a new file exclusively. It uses only Node builtins and has no network/deployment capability. The adjacent patch records the complete source change. The candidate verification file uses only synthetic requests and never reaches live services.

```bash
node reproduce-cloudflare-containment.mjs original-deployed.mjs worker.mjs
node --test verify-candidate.mjs
node --check worker.mjs
```

Run in an isolated directory with the preserved `original-deployed.mjs` next to these files. The original and generated worker modules are deployment evidence, not dependencies of the application's normal build or test path. Reproduction was run successfully against the preserved original and yielded the exact approved digest.

## Recovery and remaining work

The old immutable version remains available, but redeploying it reopens the verified vulnerability. Prefer keeping protected APIs unavailable or deploying a reviewed unavailable responder while repairing this candidate. Keep all backing data and historical consumption evidence. Do not silently refund unknown model usage.

Before future activation, implement verified identity/membership/entitlement and budget authority, durable tenant-scoped lease arbitration, protected-data isolation, redacted run/cost attribution, explicit retention/recovery and actual acceptance tests. Presence of AI/D1/KV/Vectorize/DO bindings does not qualify any of these.

The app-owned curator release remains a separate Vercel/Supabase activation path and requires no coupling to this worker. This release grants no paid allowance, activates no checkout and makes no customer inference claim.
