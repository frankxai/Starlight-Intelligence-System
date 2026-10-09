# Terminal execution and private handoffs

This operational SDK slice records a work attempt before dispatch, preserves its
result for editing, and exports evidence to another harness. It does not replace
the estate queue, fleet admission, product workflows or native conversations.
Tracking issues: #143 and #144. The six domain entries are descriptors, not live
domain agents or installed products.

## Use from the existing CLI

Build with `npm run build`, then run `node dist/cli.js domain list` or
`node dist/cli.js harness doctor`. Discovery starts no worker. Doctor reports
native harnesses as `not-probed`; it does not certify installation or credentials.

The SDK exports are `@arcanea/starlight-intelligence-system/runtime-bridge` and
`@arcanea/starlight-intelligence-system/terminal-runtime`. The package is not
published by this change.

A work packet is plain JSON:

```json
{
  "version": "starlight.terminal-run.v1",
  "runId": "creator-draft-001",
  "domain": "gencreator",
  "workRef": "issue:5",
  "sourceRefs": ["source:owned-article-v1"],
  "request": {
    "protocol": "starlight.worker.v1",
    "taskId": "creator-draft-001",
    "agent": "writer",
    "input": "Create an editable draft from the source supplied here.",
    "context": {}
  }
}
```

The operator separately supplies a private host binding:

```json
{
  "version": "starlight.terminal-host.v1",
  "packetSha256": "<terminalDigest(parsedPacket)>",
  "timeoutMs": 30000,
  "contextKeys": [],
  "admission": {
    "authorityRef": "operator:local",
    "reservationRef": "reservation:owned-attempt",
    "budgetCeilingCents": 0,
    "expiresAt": "<future UTC timestamp>"
  },
  "runtime": {
    "kind": "process",
    "id": "owned-worker",
    "executable": "<absolute native executable path>",
    "executableSha256": "<SHA-256 of executable bytes>",
    "cwd": "<absolute owned working directory>",
    "args": ["<fixed host-owned arguments>"]
  }
}
```

Calculate the packet digest using the exported `terminalDigest` function after
`parseTerminalPacket`; ordinary JSON string hashing uses a different ordering.
Pin all script/config dependencies referenced by the host's arguments through
the host's existing source admission. The executable hash alone does not pin
scripts or authorize filesystem effects. Never construct arguments from task text.

```text
starlight run start --file <absolute-packet> --host <absolute-host> --authorize
starlight run inspect creator-draft-001
starlight run handoff creator-draft-001
starlight run import --file <absolute-private-handoff>
```

`--journal <absolute-directory>` chooses an operator-owned journal. The default
is `~/.starlight/runs/terminal`. Handoffs and inspect output include prompts and
artifacts: keep them private. `run resume` exports the same evidence as `handoff`;
it does not restart a worker or transfer a native conversation.

## Worker and authority boundaries

A process worker receives one `starlight.worker.v1` request on stdin. It returns
exactly one JSON object on stdout, with the same protocol/taskId and either
`{"status":"completed","output":"..."}` or
`{"status":"failed","error":"..."}`. Include the protocol and taskId keys in
the actual response. Requests and responses are bounded to 64 KiB. Shell launchers
are rejected. No ambient environment is inherited by the process CLI transport;
SDK hosts may pass an explicit environment. Diagnostics are drained without
being saved. The host remains responsible for script integrity, credentials,
workspace isolation and containment of descendants. Killing the spawned child
does not establish that all its effects or descendants stopped.

HTTP bindings use `kind: "http"`, `id`, and `endpoint`. HTTPS is required unless
the operator explicitly permits numeric loopback HTTP at `127.0.0.1` or `[::1]`.
Hostnames and other loopback addresses are excluded from this exception.
`tokenEnv` names a host environment
variable for a bearer token; credentials stay out of portable packets. The SDK
also accepts an already connected, host-owned MCP client. These are worker
transports; they do not make MCP, ACP, A2A or native harness protocols equivalent.

SDK callers must supply the authenticated host `admit` callback. The CLI requires
`--authorize` plus an exact packet digest; it is a local operator interface,
not a remote authentication service. Admission metadata records the host's
reservation and ceiling. This library does not enforce a provider spending cap,
reserve global resources or check revocation itself. The host must enforce those
before effects. Local timeout is not evidence that spending ceased.

## Recovery and acceptance

A run ID binds one immutable packet. It is saved as `running` before dispatch.
Exclusive writer locks reject concurrent submissions. Successful output is
`produced`, with a checksum, `verification: "pending"`, and `usage: "unknown"`.
Empty/malformed output, timeout or transport loss becomes `unknown`. Reopening
the journal returns existing evidence without redispatch, including `running`
or `unknown` evidence imported from another harness.

A crash, unknown outcome or failed receipt save retains a writer lock with a
unique owner marker. Read-only inspection and deduplication remain available.
Successful or explicitly failed outcomes release only their own unchanged marker.
Never remove a retained lock by age. Its owner must reconcile
the original worker and authorize any distinct attempt through the existing
admission system. There is no automatic retry or reconciliation API in this slice.
Atomic rename and file fsync protect normal interruption; durability across power
loss and multi-machine filesystems has not been certified. Use an operator-owned
directory and appropriate Windows ACLs; POSIX mode bits are not Windows ACLs.

Handoff checksums detect accidental changes, not forgery. Import treats evidence
as unverified, rejects unknown fields and mismatched identities, and grants no
execution authority. Imported authority references are historical evidence.

The process smoke tests produce deterministic editable text, not model-generated
creative work. Native Codex/Claude/OpenCode adapters, billing evidence, live
creator acceptance, six working product packs, hosted console integration,
academy progress and opt-in learning remain open. No competitive advantage or
production readiness is established by these tests.

## Source and checks

RuntimeBridge and its existing tests were selectively reused from SIS revision
`b6bfebb4efb1a5565df3c657857218b125562492`, preserving the original checkout.
This branch starts from `421c873533ea68791b38a37378f28f0c88b709a2`.

Run `npm run test:terminal`, `npm run lint`, `npm run build`, and the orchestrator
regression tests. The fail-closed default executor rejects orchestration without
an explicitly bound executor instead of emitting a fabricated processed result.
