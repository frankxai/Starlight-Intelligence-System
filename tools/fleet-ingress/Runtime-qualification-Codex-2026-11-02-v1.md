# Fleet runtime qualification, Codex, 2 November 2026

Author: Codex. Revision: 1. State: qualifier implemented; real runtime execution
and independent review pending. Source base: PR527,
`c5f223a7493d3bb4fd5a22698cb68ef529af308a`. This extends that existing repair;
its author and original verification remain credited in the original PR.

The qualifier bundles the actual `wrangler.jsonc` entry and runs it in workerd
with SQLite-backed `FleetDelivery` storage. It checks concurrent replay,
persistence across process restart, uncertain-result holds, real-runtime source
denial and missing-binding refusal. A test-only entry wrapper is deliberately
avoided because it could hide an invalid production module export.

All outward provider calls terminate at an asserted in-process fixture. No
Cloudflare API, Cloud Run execution, real credential, queue message or deployed
resource is used. The fixture writes only a fresh owned temporary persistence
directory, disposes each runtime and verifies the cleanup target before removal.

The toolchain is pinned: Wrangler 4.156.1, Miniflare 5.20261101.0-beta and esbuild
0.28.2, with a dedicated npm lockfile. The Miniflare version matches this stable
Wrangler release's dependency. Its v4-options compatibility converter is explicit.
No application dependency, production binding, route, migration or secret changes.

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

Local native runtime/build work is machine-held. The new runtime suite has not
yet run and has no PASS verdict. A peer owns the workflow write lane at preparation;
the existing workflow remains untouched until ownership is free. Once admitted,
CI must install the frozen dedicated dependencies and run both commands on the
exact candidate. A startup failure is a genuine qualification failure to repair.

Restart tests establish the stated persistence scope. They do not certify abrupt
provider termination, a production migration, Cloud Run etag semantics, image or
network isolation, short-lived credentials, monetary reservation, cancellation,
artifact acceptance or a production release. SIS issue514 and the original PR's
remaining acceptance gates stay open. Preserve journal state and uncertain holds.

References: existing PR527 source, its README/verification record, pinned npm
package metadata and the actual runtime fixtures. Source and provider outcomes
must remain separately identified in subsequent receipts.
