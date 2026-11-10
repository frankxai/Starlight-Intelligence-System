# Nexus lease runtime qualification

The service-private lease core is a proposed dependency for the existing
`SwarmCoordinator`. Production HTTP and Durable Object entrypoints remain
contained. No authentication, deployment, device enrollment or execution grant
is enabled by these tests.

Run the deterministic checks from the repository root on Node 24:

```sh
node --experimental-strip-types --test test/swarm-lease-state.test.mjs
```

The separate runtime package pins Miniflare `5.20261023.3-beta` and workerd
`1.20261023.1`. Its lock is the complete dependency closure from the existing
qualified agent-plane toolchain. It changes no production dependency. Install
it in isolation and run the local runtime qualification:

```sh
pnpm --dir services/starlight-cloud-worker/tests/runtime install --ignore-workspace --frozen-lockfile --ignore-scripts
node services/starlight-cloud-worker/tests/qualify-lease-workerd.mjs
```

An already installed copy can be selected by setting `NEXUS_MINIFLARE_PATH` to
its absolute package directory. The script verifies both exact runtime versions;
no machine-specific path is committed. Qualification first reused that pinned
installation. The final isolated frozen install passed with pnpm 11.25.0 and
lifecycle scripts disabled; all six native scenarios then passed using the
isolated package with no module-path override. Earlier offline installation lacked
cached registry metadata, and the default online install rejected unapproved
workerd lifecycle scripts. The documented command runs no install scripts and
preserves supply-chain checks; no build approval or policy bypass was added.

The fixture uses real local SQLite-backed Durable Object transactions. Six
scenarios cover competing acquisitions, tenant/resource mismatch, stale owner
rejection, persisted recovery after disposing and recreating the runtime,
transaction rollback, and conflicting or time-reversed retries. Temporary data
is deleted after each run. No remote account or provider API is called.

The test-only Worker accepts synthetic identity and time. It must never be
deployed or used as an authentication adapter. The lease core owns exact opaque
resource IDs, not filesystem path overlap. Idempotency is bounded by the
operation's original `notAfter` deadline; a replay is a historical acknowledgement.
Every actual effect receiver must atomically enforce the current fencing value.
A lease does not prove that a disconnected process stopped, grant a tool or
spend permission, or authorize an irreversible action.
