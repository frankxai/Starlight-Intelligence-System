# Starlight playbooks

Turn a reusable workflow into an inspectable plan: who contributes, what they
need, which work can happen together, and where a person needs to decide.

This private, unpublished MIT package compiles versioned JSON playbooks into
bounded acyclic graphs and projects their progress from host-verified receipts.
It has no runtime dependencies and uses standard Web APIs. It does not dispatch
models or tools, create schedules, authenticate a user, or settle credits.

## Try the local founder example

From this directory, after installing the repository's locked toolchain:

```sh
pnpm run build
pnpm test
node examples/run.mjs /tmp/starlight-founder-drafts
```

The example verifies the SHA-256 pins of its included skill, tool, document schema
and founder context, then runs deterministic local templates. It writes seven
editable Markdown documents, the compiled plan, receipts and progress. It stops
at `approve-kit`; it never manufactures a human approval. No models, network
requests or publishing actions are involved. The sample company and commercial
assumptions are illustrative, and the structural evaluator does not validate
market demand or business outcomes.

## Compile and inspect

```ts
import { compilePlaybook, projectExecution } from '@starlight-intelligence/playbooks';

const plan = await compilePlaybook(manifestJson);
const state = await projectExecution(plan, durableJournalJson, {
  runId: authenticatedRun.id,
  verifyReceipt: (receipt, context) => trustedHost.verifyReceipt(receipt, context),
});
```

The import illustrates the workspace package API; no public npm installation is
claimed. Preserve the original manifest alongside its digest. Recompile it after
restoring a process or Worker. Arbitrary deserialized plan objects are rejected;
the reducer only accepts an immutable plan produced by this compiler instance.

## Manifest contract

`starlight.playbook.v1` contains a stable ID, exact semantic version, title,
resource lockfile, declared call limits and a composed flow. Every resource has
an ID, kind, exact version, SHA-256 content pin and HTTPS or registry URI. Skills,
tools, models, memory and output schemas are separately typed. Memory bindings
also name the purpose for which the host resolves that revision. No private
context text or credentials belong in a playbook.

| Pattern | Compiled behavior |
| --- | --- |
| `sequence` | Each child waits for the previous child's terminal nodes. |
| `parallel` | Independent children converge through a generated join. |
| `router` | A host-verified decision selects exactly one named branch. Other branches are skipped. |
| `evaluator` | A verdict binds the exact digest of an earlier produced artifact. A failed verdict blocks progress. |
| `approval` | A host-verified approval binds the exact earlier artifact. A rejection blocks progress. |
| `task` | A bounded action declares skill, optional model, tools, memory purposes and output schema. |

The compiler preserves the existing operational loop vocabulary through
sequence/chain, parallel/diamond and router patterns. It does not replace
`src/loop-graph.ts`, the operational loop engine, or the existing work graph.
Evaluator-driven optimization loops require a separately reviewed bounded
expansion; this version does not silently retry or create graph cycles.

Flow IDs are unique and exclude dots; generated `join.<id>` identifiers therefore
cannot collide with author-defined IDs. A review subject must be an output node
on the dependency path and guaranteed to run in the review's branch. Unknown
fields, mutable version selectors, forward references and unsupported patterns
are rejected. Limits include 128 KiB input, 16 nesting levels, 128 flow objects,
128 compiled nodes and at most eight concurrent started nodes.

Every call limit is a **declared upper bound**, not a price, grant or report of
usage. The compiler conservatively sums all branches, including mutually
exclusive routes. The host must independently resolve actual provider/tool
capabilities, enforce per-call and monetary admission, and record actual usage.

## Receipt contract and authority

`starlight.playbook-receipt.v1` binds run, plan digest, node, event ID and status.
Events are an ordered journal: `started`, then `completed`, `failed` or `unknown`.
Completion requires an output digest and the pattern's decision evidence.
Duplicate byte-equivalent JSON events replay once; a reused ID with different
evidence fails. No extra claimed permission fields are accepted.

`verifyReceipt` is mandatory and must return the boolean `true`. The authenticated
host checks origin, tenant/principal, actual output digest/schema and routing or
evaluation evidence. Approval receipts additionally require the host's
authenticated human attestation; an `attestationRef` string alone proves nothing.
This callback is a trust boundary. Passing `() => true` for untrusted client input
is insecure. The example instead verifies only receipts issued by its own local
adapter in the same process; that demonstrates replay, not production provenance.

The reducer checks readiness and concurrency when replaying every start. Failed,
unknown or rejected nodes block all new starts. Already-started parallel work
may finish, but cannot create another start while blocked. There is no retry,
lease-expiry reset or unknown-to-completed transition in this version. A recovery
extension must preserve the durable effect history and separately establish
whether an external effect occurred.

The projection contains no output bodies or private memory, only state and hashes.
It is not a lock. Two callers reading the same projection can see the same work;
the runtime must atomically claim it and persist the effect journal before dispatch.

## Hosted integration

Cloudflare is the hosted execution owner. Integrate this package into the existing
workflow rather than adding a second scheduler:

1. Resolve pinned resources from server-owned registries. Authenticate memory
   scope, revision and purpose. Treat retrieved text as untrusted input.
2. Bind the plan digest and selected memory revision to server-owned job admission,
   along with tenant, principal, policy and reservation identity.
3. Atomically claim each ready node in the existing durable journal. Reauthorize
   tools and memory and admit every priced call, including embeddings.
4. Execute through the existing effect boundary and persist verified receipts.
   Reconcile uncertain external effects before any separately reviewed recovery.
5. Render the same plan and receipts in the headquarters UI, mobile and MCP/CLI.

Compilation and receipt replay are safe to repeat. Cloudflare `step.do` alone
does not make external effects idempotent; follow the
[Workflows rules](https://developers.cloudflare.com/workflows/build/rules-of-workflows/),
verified 31 October 2026. Durable claims, pricing and effect reconciliation stay
in the host runtime. A manifest never grants authority.

## Verification boundary

Tests exercise digest determinism, all patterns, branch suppression, scope and
artifact bindings, host verification, replay conflicts, unknown effects,
concurrency and resource/input limits. A fresh-process smoke check removes Node
`process`, `Buffer` and `global` before importing the runtime and compiling a plan.
That proves portability of these exercised APIs under Node's Web APIs; it does
not prove a browser or Cloudflare deployment. Hosted effects, production memory
resolution, credit admission and authenticated approvals require integration tests.
