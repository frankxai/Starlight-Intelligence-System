# Cloud Worker containment verifier

Author: Codex. Created: 2026-11-02. Revision: 1. Review state: locally tested source candidate; exact-head independent review and hosted qualification pending.

## Problem and correction

Accepted main already contains ingress and direct-coordinator containment from PR461. Protected requests cannot execute until verified identity and tenant membership exist. The separate `test:cloud-live` script still used an embedded fallback credential, attempted memory writes, queries, model calls and lease acquisition/release, and printed a fixed 100 percent success label even when checks failed. Those actions are unsuitable for routine production verification, particularly while ingress is deliberately disabled.

The existing command now performs four sequential GETs: health, one anonymous request to a reserved nonexistent route, and the same route with an explicitly unissued synthetic credential for two tenant headers. It never reads a real API key, sends a request body, invokes a model, queries private memory or changes a lease. The unknown route avoids exercising a protected implementation even if it is an older permissive deployment.

Each request has a five-second total deadline including response reading, a sixteen-KiB JSON body limit, strict UTF-8 decoding, no cache and no redirects. Target configuration must be an HTTPS origin without embedded credentials, path, query or fragment. Request and stream cancellation are attempted on exit; local cancellation does not prove remote processing stopped.

Only the expected application JSON and HTTP statuses establish this narrow containment result. A WAF challenge, 404, redirect, transport error, timeout, malformed/oversized response or a successful protected response produces `unverified` and a nonzero CLI exit. Provider errors and raw bodies are excluded from output. `productionReady` is always false, including a fully passing containment probe.

## Usage and evidence

Run `npm run test:cloud-live` for the existing default origin. An approved alternative ingress can be selected through `STARLIGHT_CLOUD_URL`; the command does not discover or enable routes. A disabled workers.dev endpoint is expected to remain unverified here. Provider control-plane evidence is a separate observation, not a reason to manufacture a successful application probe.

Run `node --test test/cloud-worker-live.test.mjs` for dependency-free offline regressions. The existing Harness check workflow runs this command after Node setup and before dependency installation; no live network probe is added to CI. Existing permissions, runner, draft admission, timeout and full test commands remain unchanged.

Sixteen offline cases cover expected denial, older health/404 behavior, successful protected responses, edge blocks, redirects, invalid JSON/UTF-8, declared/streamed size limits, request and body deadlines, cancellation, target validation, redaction and CLI failure. The existing fifty cloud-worker component/containment tests also pass using the already-installed tsx loader. Neither suite establishes deployed identity, durable arbitration or remote write recovery.

A bounded live run on 2026-11-02 returned four 404 responses and correctly exited1 with `unverified`. A separate authenticated Cloudflare API read reported workers.dev and preview ingress disabled for the shared Worker. That does not prove absence of custom-domain or service-binding access, nor does it establish deployed source equivalence. No provider resource, routing setting, permission, credential, database, inference, scheduler or billing configuration was changed.

## Next release gates

Preserve accepted containment and the current ingress configuration. Existing operational tracking is private programme issue260; use it for account-specific findings. Obtain independent exact-head review of this verifier before merging. Its purpose is safe observation, not activation approval.

The protected service still needs its existing identity/membership authority, two-tenant negative tests, truthful durable acknowledgements, atomic owner/fenced coordination, bounded cost admission and uncertain-effect recovery. Qualify those in the owning runtime, then record exact deployment/version, canary behavior and rollback under the existing release authority. Do not add an allow flag, caller-selected tenant trust or a second budget/authentication service to bypass missing evidence.

Official references inspected: [workers.dev routing and disabled ingress](https://developers.cloudflare.com/workers/configuration/routing/workers-dev/), [Worker version URLs](https://developers.cloudflare.com/workers/versions-and-deployments/version-urls/), and [service bindings](https://developers.cloudflare.com/workers/runtime-apis/bindings/service-bindings/). The product-specific Cloudflare skill was read. Its absent optional local references were replaced by current official documentation. No runtime or API dependency was upgraded.

Source: SIS main `7e4ca5b295e4c0097576045326762d278514e360`; isolated branch `codex/cloud-worker-auth-boundary-20261102`. Root instructions SHA-256 `99966be6368a23c2e6ad53ba3201642e3c192fe45ff67f6079365d9a60593c11`. Policy loading and source tests do not establish deployed enforcement.
