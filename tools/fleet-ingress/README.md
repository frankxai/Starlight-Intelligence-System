# Fleet ingress: admitted work, inspectable dispatch

This candidate repairs the existing GitHub-to-Cloud-Run path. It is not a new task
scheduler, a budget service, a NVIDIA runtime or a deployment authorization.
The existing `wrangler.jsonc` remains unchanged: public subdomains and previews
stay disabled and the new delivery binding is not activated by this change.

## What changed

A signed webhook proves the payload was signed with the configured secret. It
does not prove the repository, installation, commit or requested work is allowed.
The router now requires an expiring operator-installed policy with exact repository
IDs/names, installation IDs, reviewed commit SHAs and event-specific refs.

Pull requests must be open, non-draft and same-repository. Queued workflow jobs
must have both `self-hosted` and `starlight-runner` labels and an approved branch.
Event shape is checked because GitHub's HMAC signs the body, not the event header.
Missing fields fail closed. Repository renames require an explicit policy update.
This restricted profile does not support repository-only webhooks without an App
installation identity, fork PRs, arbitrary commands or mutable dependency fallback.

`FleetDelivery` uses transactional Durable Object storage as a dispatch journal.
It stores a hash, policy ID, timestamp, state and operation name; it does not store
source payloads, credentials, prompts or personal memory. Each exact signed body
gets at most one attempted Cloud Run request within the same preserved namespace.
This is not semantic deduplication across different GitHub events for one commit,
not exactly-once execution, and not a replacement for the existing task owner.

```text
verified body -> source grant -> persistent uncertain claim -> Cloud Run request
                                                    |          |
                                                    |          +-- valid operation -> accepted
                                                    +-- any ambiguity -> reconciliation hold
```

The uncertain claim is committed BEFORE the external request. No network effect
occurs inside the storage transaction. Transaction retry cannot repeat the cloud
request. If the process dies, storage fails after dispatch, the provider returns
an error, or the response is ambiguous, automatic replay remains blocked. The
tradeoff is deliberate: a request that never ran can require manual reconciliation.

Accepted operation receipts are sanitized and explicitly not completion evidence.
The HTTP caller receives no raw provider response, token, payload or stack trace.
A 1 MiB byte limit and two-second read deadline bound inbound parsing; the provider
receipt is limited to 64 KiB. The provider call has a five-second request timeout,
no redirects, one task and a policy-selected duration of at most 900 seconds.
Storage latency is not included in a claimed end-to-end latency SLO; none is claimed.

## Runner contract

The previous ingress supplied `REPO` and `COMMIT_SHA`; the entrypoint read
`STARLIGHT_REPO` and a branch/default `main`. This candidate aligns the names:

- `STARLIGHT_REPO`: exact `owner/repository`.
- `STARLIGHT_COMMIT_SHA`: exact approved 40-character lowercase commit SHA.
- `STARLIGHT_TIMEOUT_SECONDS`: integer 1 through 900.

The runner fetches that SHA from the fixed GitHub HTTPS origin, checks out detached
HEAD and checks `rev-parse HEAD` before any package install or test. No ref fallback
is allowed. It runs one fixed Node verification profile: frozen pnpm dependencies
or `npm ci`, then tests. Install lifecycle scripts are disabled. Native dependencies
requiring install scripts need a separately qualified image/profile; they are not
silently enabled here. Legacy positional arguments, `STARLIGHT_COMMAND`,
`STARLIGHT_REF` and callback overrides are refused.

Git credentials use a transient scoped header, not a clone URL or persisted config.
Inherited Git configuration, tracing and credential helpers are disabled. The child
package/test process receives a clean environment without inherited provider and
checkout tokens. The runner uses an isolated temporary workspace and emits a local
exit receipt that does NOT establish artifact acceptance.

**This is not a hostile-code sandbox.** Same-UID process inspection, mounted files,
cloud metadata credentials, egress, package-manager configuration and an untrusted
repository's own test code require the deployment's independent isolation policy.
The existing Dockerfile has mutable tool downloads; it is not newly qualified here.
No image was built, pushed or deployed by this patch.

## Policy input

`FLEET_ADMISSION_POLICY` must be installed by the trusted operator. It is never
read from a webhook, prompt, generated document or model output. The deliberately
expired example below must not be activated unchanged:

```json
{
  "version": 1,
  "policy_id": "synthetic-source-review",
  "expires_at": "2000-01-01T00:00:00.000Z",
  "job_etag": "replace-with-reviewed-job-etag",
  "max_duration_seconds": 60,
  "grants": [{
    "repository_id": 123,
    "repository": "fixture/example",
    "installation_id": 456,
    "commits": ["aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"],
    "events": ["push"],
    "push_refs": ["refs/heads/main"],
    "pr_base_refs": [],
    "workflow_branches": []
  }]
}
```

The configured Cloud Run target must be operator-controlled, with least-privilege
short-lived authentication. This code retains the existing bearer-token binding;
it does not implement a federation or token-renewal service. A supplied job etag
must come from the reviewed job. Provider conflict behavior must be demonstrated
before relying on it as image/configuration pinning. Qualify the returned operation
name's project representation against the configured target; unexpected names are
held as uncertain, never retried automatically.

A grant expires for NEW dispatches. Expiry does not cancel an already running job.
Source admission, runtime qualification, monetary reservation and human acceptance
are separate checks. The policy is NOT an authenticated user identity, a monetary
budget or an execution capability for other tools.

## Durable binding: separate activation change

After independent source review and local Workers runtime testing, an operator may
prepare this binding and a new SQLite-backed class migration in the existing worker
configuration. Do not copy it to production as part of source review:

```json
{
  "durable_objects": {
    "bindings": [{ "name": "FLEET_DELIVERIES", "class_name": "FleetDelivery" }]
  },
  "migrations": [{ "tag": "fleet-delivery-v1", "new_sqlite_classes": ["FleetDelivery"] }]
}
```

Preserve existing migrations, bindings, routes and security holds. The exported
class is accessed through a private binding; there is no new public receipt API.
With no binding this candidate returns `503 ledger_unavailable` and never falls
back to direct dispatch. Never rotate, delete, restore backward or clear the journal
namespace while replayable grants remain active. Those operations can remove the
at-most-one-attempt history. Do not put uncertain claims on an automatic TTL.

## Response and recovery

| Response | Meaning | Operator action |
| --- | --- | --- |
| 400 / 401 / 403 | Invalid input/signature or work outside the grant | Correct the source/grant through normal review; do not broaden it automatically. |
| 408 / 413 | Read deadline or byte limit exceeded | Inspect the sender; no dispatch was admitted. |
| 503 | Required configuration, binding or journal unavailable | Keep execution blocked and repair the dependency. |
| 202 `dispatch_accepted` | A valid provider operation was recorded | The task owner tracks execution and artifact validation separately. |
| 200, `duplicate: true` | This exact body already has an accepted receipt | Reuse the receipt; do not dispatch again. |
| 502 then 409 `runner_dispatch_uncertain` | One attempt may have reached the provider | Inspect provider executions and audit logs; no automatic resubmission. |

A reconciliation operator must use provider records and the expected source/job,
not interpret a timeout or an empty list as proof of no execution. This release
exposes no automatic reset or manual requeue API. Document the disposition and keep
the original record. A reauthorized new attempt belongs to the existing task owner
with a new budget reservation and auditable approval, not an edited delivery header.

## Activation acceptance

Before any live use, demonstrate real Cloudflare storage concurrency and object
recreation; a fail-before/after-dispatch crash rehearsal; exact image digest and
Cloud Run etag behavior; an isolated non-root runner; checkout SHA verification;
network/metadata controls; `maxRetries=0` (provider retries are independent of this
journal); scoped expiring credentials; root-budget reservation; cancellation and
completion reconciliation; customer artifact acceptance; and an explicit deployment
approval. Task count and timeout are resource limits, not a spend cap.

The larger gateway proposal in PR #507 touches the ingress. Integrate exact heads
one at a time and preserve this boundary's regression tests. No main merge, provider
activation, GPU purchase, credit allocation or account-policy change is implied.

## NVIDIA and heterogeneous-runtime integration

The next admitted slice should route one existing research task to two independently
qualified runtime adapters. NVIDIA/OpenShell is one candidate, not a default trust
boundary. The execution profile must bind hardware/architecture, OS, driver,
container digest, serving engine, model revision, quantization, context/concurrency,
RAM/VRAM working limits and measured quality/latency. An AMD, Intel or Apple profile
requires its own evidence; do not copy NVIDIA qualification across devices.

The existing task owner retains retries, budget, cancellation and acceptance. This
journal remains an ingress implementation detail. Memory supplies approved,
revision-pinned context, never credentials or authority. Vercel/Command Center
surfaces show the actual state: blocked, dispatch accepted, uncertain, execution
complete, artifact accepted. They must not display a green completion from HTTP 202.
The offline placement planner remains advisory until runtime evidence and authority
are verified. No NVIDIA, AMD, Intel or Apple throughput is benchmarked by these tests.

## Verification

From repository root, with Node 22.16 or a compatible newer runtime and Bash:

```sh
node --experimental-strip-types --test tools/fleet-ingress/tests/*.test.mjs
bash -n tools/runner/runner-entrypoint.sh
```

Optional scoped strict check using an existing TypeScript 5.8.3 compiler:

```sh
tsc --noEmit --target ES2022 --module ESNext --moduleResolution bundler \
  --allowImportingTsExtensions --strict --noUnusedLocals --noUnusedParameters \
  --lib ES2022,DOM tools/fleet-ingress/src/*.ts
```

All cloud/provider, Git and package-manager operations in the suite are doubles.
Storage tests enforce a serialized transaction contract and survive object instance
recreation; they do not replace tests in the actual Workers runtime or a real container.
The scoped GitHub workflow is read-only, path-filtered and has no deployment, schedule,
credential access, package installation or artifact upload. Full-repository CI and
independent review remain separate gates. See [verification receipt](verification.json).

Technical references inspected 31 October 2026:
- https://docs.github.com/en/webhooks/using-webhooks/validating-webhook-deliveries
- https://developers.cloudflare.com/durable-objects/api/sqlite-storage-api/
- https://docs.cloud.google.com/run/docs/reference/rest/v2/projects.locations.jobs/run

Built on SIP — this change preserves source/effect/receipt boundaries within the
existing reference implementation. This declaration is not a signed attestation.
