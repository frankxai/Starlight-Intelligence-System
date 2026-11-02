# Fleet runtime qualification, Codex, 2 November 2026

Author: Codex. Revision: 5. State: real startup and redirect failures reproduced and repaired;
runtime rerun and independent review pending. Source base: PR527,
`c5f223a7493d3bb4fd5a22698cb68ef529af308a`. This extends that existing repair;
its author and original verification remain credited in the original PR.

The qualifier bundles the actual `wrangler.jsonc` entry and runs it in workerd
with SQLite-backed `FleetDelivery` storage. It checks concurrent replay,
persistence across process restart, uncertain-result holds, real-runtime source
denial and missing-binding refusal. A test-only entry wrapper is deliberately
avoided because it could hide an invalid production module export.

The first admitted runtime run, 41391881186 attempt 2 at e3a53ac, fails all five
cases during actual workerd startup: `MAX_BODY_BYTES` is a numeric named export,
which workerd cannot mount as an entry. This failure was invisible to Node's
unit suite. A dedicated production `src/worker.ts` now exports only the default
handler and `FleetDelivery`; the committed Wrangler main points to it. Node's
library/test imports stay unchanged. The qualifier still reads and bundles the
actual configured entry, with no test-only override or skipped assertion.

The next runtime exposes a second compatibility defect: Workers rejects
`redirect: error` before sending a request. Cloudflare supports `manual` and
`follow`; the correction uses `manual` and retains the existing non-2xx rejection
and uncertain journal hold. A sixth real-runtime case returns a redirect, asserts
exactly one fixture attempt, restarts and confirms replay remains held. Any call
to the redirect destination fails the fixture and cannot be hidden as HTTP 500.
Source: https://developers.cloudflare.com/workers/runtime-apis/request/.

All outward provider calls terminate at an asserted in-process fixture. No
Cloudflare API, Cloud Run execution, real credential, queue message or deployed
resource is used. The fixture writes only a fresh owned temporary persistence
directory, disposes each runtime and verifies the cleanup target before removal.

The toolchain is pinned: Wrangler 4.156.1, Miniflare 5.20261101.0-beta and esbuild
0.28.2, with a dedicated npm lockfile. The Miniflare version matches this stable
Wrangler release's dependency. Its v4-options compatibility converter is explicit.
No application dependency, production binding, route, migration or secret changes.
The production entry path changes as described above; no remote deployment occurs.

Commands from this directory:

```sh
npm ci --ignore-scripts --workspaces=false
npm test
npm run test:runtime
```

The full source suite also executes the runner contract through Bash fixtures;
use Linux for that complete suite. The selected 114 ingress cases pass locally
on Windows with zero failures/skips. The 15 Bash runner cases were not included
in that local command. This is distinct from the original 129-case Linux receipt.

Native hosted Fleet ingress contracts run 41391090600 executes all 129 source
cases with zero failures/skips at `223b2f99b17746fbbaf2bac8be1f8c5e5c57221e`.
Those provider/storage calls are doubles. The dedicated toolchain's npm audit
reports zero advisories at observation; it does not audit the entire repository.

Local native runtime/build work is machine-held. The runtime suite now has a
retained startup failure and no PASS verdict yet. The prior workflow owner explicitly released its
lane at 05:00 UTC. After fresh routing and ownership checks, the runtime job is
integrated into the existing workflow. CI must execute both source and runtime
commands at the exact candidate before qualification is accepted. A startup
failure is a genuine qualification failure to repair.

`ci-runtime.patch` preserves the prepared workflow change. Its YAML structure
and `git apply --check` passed before application. It adds a separate
five-minute, ready-for-review-gated runtime job, pinned read-only actions, frozen
dependency installation without lifecycle scripts and a high-severity audit gate.
Existing source checks remain. The presence or applicability of this patch is
not an executed runtime result. Prior preparation revisions remain in Git history.

Restart tests establish the stated persistence scope. They do not certify abrupt
provider termination, a production migration, Cloud Run etag semantics, image or
network isolation, short-lived credentials, monetary reservation, cancellation,
artifact acceptance or a production release. SIS issue514 and the original PR's
remaining acceptance gates stay open. Preserve journal state and uncertain holds.

References: existing PR527 source, its README/verification record, pinned npm
package metadata and the actual runtime fixtures. Source and provider outcomes
must remain separately identified in subsequent receipts.
