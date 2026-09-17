# Portable runtime bridge

Status: integrated local implementation, September 12, 2026. External services and production deployment remain unverified.

Use `FederatedRuntime` for capability routing across A2A, MCP and process workers. This guide covers its lower-level lifecycle owner, `RuntimeBridge`, for direct SDK and custom HTTP integrations. Architecture, upstream decisions, languages, host authority, hand compatibility and the verification matrix are maintained in [agent federation](agent-federation.md).

## Register a host-owned runtime

```ts
import { RuntimeBridge, createHttpWorkerRuntime } from
  '@arcanea/starlight-intelligence-system/runtime-bridge';

// Trusted bootstrap supplies configuration after host admission.
const bridge = new RuntimeBridge({
  runtimes: [createHttpWorkerRuntime({
    id: 'research-worker',
    endpoint: configuredWorkerUrl,
    headers: { authorization: configuredAuthorization },
  })],
  routes: { 'starlight-hermes': 'research-worker' },
  contextKeys: ['project', 'artifactRefs'],
  maxConcurrency: 2,
  maxRuns: 20,
  timeoutMs: 30_000,
});
engine.setExecutor(bridge.asExecutor());
```

The existing host must own mission admission, durable leases, spend and authorization before any capable call. A `WorkerRuntime.invoke(request, signal)` implementation is the seam for an admitted SDK activity. A bridge route selects that implementation; it does not grant authority. The custom HTTP adapter does not speak another agent platform's native API automatically.

Every selected agent requires an explicit route. Task context cannot register an endpoint, executable or tool. Only allowlisted context fields cross the bridge. The facade's runner projection is narrower: only the task ID and explicit prompt are forwarded.

## Worker envelope

The custom HTTP endpoint receives:

```json
{"protocol":"starlight.worker.v1","taskId":"example-1","agent":"starlight-hermes","input":"Research the supplied sources","context":{"project":"example"}}
```

It returns one terminal result:

```json
{"protocol":"starlight.worker.v1","taskId":"example-1","status":"completed","output":"Result text"}
```

A definite failure uses `status: "failed"` and a nonempty `error` instead of `output`. Provider error text is discarded from the receipt in favor of a fixed local code. Extra fields, mismatched task IDs, unsupported versions/statuses, non-JSON values and payloads over 64 KiB are rejected. The cap covers the serialized envelope, not just its text. JSON nesting is bounded to 20 levels.

`createMcpWorkerRuntime` requires this result in `structuredContent` by default. Its explicit `resultMode: 'text'` is for a synchronous tool whose text means completed work. For an existing tool with another schema, use `createMcpToolRunner` with `FederatedRuntime`. Both reject asynchronous MCP task handles. Neither initializes an MCP connection or claims compatibility with an untested authenticated server.

The shell-free process adapter retains its version `1.0` JSON-line envelope (`id`, `prompt` request; `id`, `output`, `exitCode` response). The facade translates its `AgentRunner` result to the worker envelope internally. A2A retains its stated text JSON-RPC 0.3.0 wire format. None of these formats replaces `starlight.hand.v1` or changes SIP.

## Identity and outcomes

Call `bridge.run(request, signal)` with a persisted task ID. Replaying the same supplied JSON returns the same receipt without resubmission. Object key ordering is normalized for identity; array ordering and values remain significant. Changing any supplied task value, including context later omitted from transmission, rejects ID reuse. Requests are copied before execution, preventing caller mutation during a run.

`asExecutor()` creates a new ID on every invocation. It is convenient for the existing orchestration callback, but durable callers must provide their own IDs through `run()` or the facade's `submit()`/`run()`.

A timeout, interruption, transport error or malformed reply yields `unknown`. The affected runtime is paused for this bridge's lifetime and the unresolved invocation keeps its capacity reservation. Local abort is not confirmation of remote cancellation. Creating a fresh bridge loses local deduplication; the owning durable host must reconcile the provider outcome before resubmitting effects. Confirmed success/failure releases the local reservation.

## Observation and limits

`snapshot()` is a read model for the existing Observatory, overlay or API:

| Field | Meaning |
|---|---|
| `activeCalls` | Calls still awaited locally |
| `reservedCalls` | Active plus unresolved submissions |
| `unresolvedCalls` | Unknown outcomes that still hold capacity |
| `remainingCapacity` | Local concurrency ceiling minus reservations |
| `submitted`, `remainingSubmissions` | Process-lifetime submission accounting |
| `pausedRuntimes`, `runs` | Selected IDs, states, times and fixed error codes |

Snapshots omit prompts, context, outputs, endpoint addresses, credentials and provider error text. Operational IDs still require host authorization. Reads never dispatch work. Execution receipts are not independent artifact acceptance.

The bridge has no durable store, fleet-wide admission, dollar-cost enforcement, global leases, retry scheduler, provider authentication setup or remote cancellation confirmation. `maxRuns` bounds submissions and retained deduplication entries, not money. HTTPS endpoints and initialized MCP clients are trusted host configuration; enforce network egress at the host. The process runner is not a sandbox or process-tree supervisor.

## Reproduce and continue

Use `npm run test:federation`, `npm run verify:federation-package` and `npm run demo:federation` with the [documented Python environment and toolchain](agent-federation.md#limits-and-verification). The demo starts a real Python process and a deterministic MCP callback, verifies two tasks, replays them without new submissions and exits. No model or external MCP server is involved.

The transport/lifecycle integration is mandatory in the same repository; there is no peer-checkout environment variable or separate runtime-bridge demo script. The package subpaths are `/federation` and `/runtime-bridge`. Clean matrix results, full package validation, independent review and authenticated provider evidence are still release requirements.

Continue through [implementation #144](https://github.com/frankxai/Starlight-Intelligence-System/issues/144), then the existing goal's capability packs, authenticated pilot, durable recovery, app projection, protected Vercel preview and independent evaluation. Reuse the existing runtime and command center.

Built on SIP — operational reference implementation.