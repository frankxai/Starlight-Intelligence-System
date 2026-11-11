# Evolution runtime receipts

State: source-only implementation under SIS #545 / draft PR #546. This module
verifies completed comparison evidence. It does not start a mission, reserve
money, authorize a release or connect a customer database.

`adjudicate.mjs` remains the sole comparison method. `runtime-receipts.mjs`
adds server authorization, content verification and trusted identities before
calling that method. Both can be imported as ES modules. The digest layer uses
Web Crypto, TextEncoder and structuredClone. Signatures are delegated to the
existing `src/run-receipt.ts` DSSE verifier through a server-owned callback;
that implementation uses `node:crypto` (Workers require `nodejs_compat`). Native
Node execution is tested. Hosted Workers and Vercel execution are pending.

## Run the proof

```sh
node --test test/evolution-adjudication.test.mjs test/evolution-runtime-receipts.test.mjs
```

The suite uses synthetic observations and ephemeral Ed25519 keys. A test with
`independently_observed` input exercises that contract branch; it is not an
independently observed model experiment. No test calls a model or cloud provider.
The targeted GitHub workflow uses no secrets, installs no dependencies and
uploads no artifacts. Automatic execution skips draft PRs.

## Host interface

```js
import { adjudicateRuntimeExperiment } from './runtime-receipts.mjs';
import { verifyRunReceipt } from '../../../src/run-receipt.ts';

const result = await adjudicateRuntimeExperiment(experiment, envelopes, {
  nowMs: Date.now(),
  maxAgeMs: 5 * 60 * 1000,
  keys: trustedIssuerKeys,
  verifyRunReceipt,
  authorize: authorizeExistingTenantComparison,
});
```

The server owns this entire third argument. Never deserialize it from client
input. `authorize` must authenticate the current session, check active membership
and read permission, resolve the frozen benchmark, and resolve two distinct runs
through a reviewed tenant-to-run mapping. Reject stale/revoked membership and
unmapped legacy runs. On success return:

```js
{ tenantScope, experimentDigest, taskSetDigest, runIds: [baselineRunId, candidateRunId] }
```

The verifier calls authorization before reading receipt payloads or selecting
issuer keys. A missing callback, denied result or exception returns `BLOCKED`.
The authorization adapter is not implemented here: existing `agent_runs` has no
tenant column, so a host cannot safely infer ownership from that table alone.

`keys` is a server-owned map keyed by the canonical `keyIdOf(publicKey)`. Each entry
has `id`, `provider`, `role` (`runner` or `checker`), `publicKeyPem` (Ed25519 PEM) and
optional `revoked`. Runner entries also declare `runtimeProviders`. Keys must
come from the existing reviewed issuer authority, never from an envelope/JWK
sent by a candidate. Runner and checker must differ in identity and provider.
Provider identity here means the registered maker/checker system, not the cloud
that hosts it. Key distribution, revocation and real issuer qualification remain
host responsibilities. A signature authenticates an issuer's statement, not the
truth of an artifact assessment.

## Signed envelope

Each of `envelopes.baseline` and `envelopes.candidate` contains:

| Field | Meaning |
| --- | --- |
| `payload` | Exact UTF-8 JSON text, at most 32 KiB |
| `runner` | Canonical DSSE run-receipt envelope issued by a trusted runner |
| `checker` | Canonical DSSE run-receipt envelope issued by a trusted independent checker |

Create these with existing `signRunReceipt`; verify with existing
`verifyRunReceipt`. Each canonical receipt names `subject.digest.sha256` equal to
`await receiptDigest(payload)`, has verdict `PASS`, `run.correlationId` equal to
the payload's run ID, and `run.kind` equal to `evolution.runner` or
`evolution.checker`. Runner start/end times match the artifact; both issuances
must be after completion and no later than the host clock. This binds both
independent statements to identical artifact
bytes without introducing another signature protocol. Each DSSE payload is
bounded to 64 KiB of base64 text before invoking the canonical verifier. Key IDs
are accepted only from its verified result. The server-owned verifier callback
must be the canonical implementation; clients cannot supply a verifier function.

The JSON payload has `schema` = `starlight.evolution-runtime-receipt/v1`,
`experimentId`, `experimentDigest`, `tenantScope`, `taskSetDigest`, `runId`,
`sourceRevision`, `capabilityVersion`, `runtime`, `status`, `evidenceLevel`,
`metrics`, `startedAt` and `completedAt`. Metrics have the existing adjudicator's
shape. Timestamps must be parseable, ordered, not in the future and within the
host's freshness window (maximum 24 hours). Only `completed` status qualifies.
Retain failed, timed-out and unknown-effect receipts in their existing owner;
they do not become completed evidence through this verifier.

`runtime` is also required in the frozen experiment's baseline and candidate:
`{ provider, kind, version, sourceDigest }`. Supported pairs are
`cloudflare/pi`, `cloudflare/browser-run` and `vercel/sandbox`. `sourceDigest` is
the SHA-256 of the locked runtime descriptor (exact image/package/CLI manifest).
The signed runtime object must exactly match the preregistered object. Supporting
an identifier does not establish that its provider adapter is connected.

`experimentDigest(experiment)` binds sorted JSON keys, the hypothesis, budget,
task set, source revisions, runtime descriptors, identities, evidence labels and
metrics. It excludes the two derived receipt digests and checker subject digests
to avoid a circular hash. It accepts bounded JSON data, not classes or executable
objects. This application encoding is versioned here; it is not RFC 8785.
After signing, fill the derived receipt hashes. The verifier recomputes them from
signed payload bytes and passes those hashes to the existing adjudicator.

Unknown cost remains `null` and is blocked by the existing method. Comparison
metrics are USD; existing canonical receipt totals are EUR. Preserve their
separate meanings and recorded FX provenance; do not silently convert or add
them twice. The zero-cost canonical receipts in the tests are synthetic only.
A signature
does not turn fixture observations into real evidence. All results retain
`releaseAuthorized: false`. Results omit tenant IDs, key IDs, raw payloads and
underlying exception messages. Keep full envelopes private; a UI should render
the authorized projection and preserve a link to its existing evidence owner.

## Existing service boundaries

| Service | Required adapter responsibility | This increment |
| --- | --- | --- |
| GitHub / SIS | Own comparison method and exact source | Runtime verifier, native tests and targeted CI source |
| Cloudflare | Existing Queen/mission owner runs admitted Pi/Browser work and emits a receipt | Implemented verification contract; no Worker changed |
| Vercel / Nexus | Authenticate server requests, render authorized comparisons, emit Sandbox receipts | Implemented verification contract; no route or deployment changed |
| Supabase | Existing membership, entitlement, budget and tenant-to-run authority | Read-only schema/policy/grant audit; no migration or data writes |

Do not add a second evaluation store, issuer registry, scheduler or adjudicator.
Execution still needs an atomic reservation through existing budget services,
idempotent admission, recovery, signed real receipts and independent exact-head
review. Completed comparison verification is not execution admission. Readiness
and deployment evidence are recorded in the linked runtime proof note.

## Sources

- [Cloudflare Web Crypto](https://developers.cloudflare.com/workers/runtime-apis/web-crypto/)
- [Canonical run-receipt signer/verifier](../../../src/run-receipt.ts)
- [Vercel Sandbox SDK](https://vercel.com/docs/sandbox/sdk-reference)
- [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Existing Nexus experience issue](https://github.com/frankxai/starlightintelligence.ai/issues/295)
- [Runtime proof note](../../../docs/prd/starlight-evolution-runtime-proof-2026-11-05.md)

Built on SIP — Starlight Intelligence Protocol.
