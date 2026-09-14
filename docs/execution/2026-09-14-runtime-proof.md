# Runtime proof for one reviewed repository change

Status: proposed operational acceptance fixture and implementation prompt. This document does not execute workers, authenticate a provider, establish availability, or change a SIP contract.

Reviewed: 2026-09-14. Source revision: `464639bb9f4e9e745ed3eec37c84b3177e93e9da`.

Implementation issue: [#158](https://github.com/frankxai/Starlight-Intelligence-System/issues/158).
Existing program: [#143](https://github.com/frankxai/Starlight-Intelligence-System/issues/143).
Corpus and release scorecard: [#150](https://github.com/frankxai/Starlight-Intelligence-System/issues/150).

## Decision and observable result

Prove one complete workload before raising worker concurrency: a builder submits a bounded repository goal, one admitted executor creates a scoped patch, a separate verifier checks the exact revision, and the builder receives a trace, usage status and source-cited memory handoff that survives a fresh session.

The first proof uses a synthetic repository and offline adapters. Real-provider execution follows through the already-owned authenticated pilot. Planning artifacts, registered agent definitions and visual dashboards cannot satisfy a runtime acceptance gate.

## What the inspected source establishes

| Source at the reviewed revision | Evidence | Limit |
| --- | --- | --- |
| `metrics/current.json` | Registered-agent metric has value 144 and last verification 2026-07-27. | Definition count is not a count of admitted or running workers. No live worker inventory was inspected. |
| `tools/queen/driver.mjs` | Typed task-envelope routing, local state/ledger and planning tick. Its header explicitly says external-harness recipes are emitted. | A tick does not launch or verify its suggested work. |
| `src/orchestrator.ts` | Six orchestration patterns and an injectable `AgentExecutor`. | The default executor returns a structured placeholder. A successful callback path does not prove a live model or secure worker host. |
| `src/goal.ts` | Local goal/checklist state and audit/checkpoint helpers. | Local state files do not establish durable distributed admission, leases or exactly-once external effects. |
| `src/loop-engine.ts` and `src/loop-graph.ts` | Loop validation/recording, limits and distinct executor/verifier IDs. | The loop recorder delegates actor authentication, evidence validation, admission and convergence to the host. |
| `src/work-graph.ts` | Work-event parsing and completion projections. | Event references need authenticated, revision-bound evidence; a claimed event cannot prove itself. |
| `src/session-store.ts` and `src/gateway/*` | Session JSONL persistence and gateway surfaces. | Working-memory persistence is distinct from durable mission authority. |
| `src/vault-loop.ts` | Existing filters for export, search, attestation and graph pathways. | Apply these existing boundaries; this fixture introduces no new memory sharing permissions. |
| `src/infra/cost-snapshot.ts` | Cost fetch orchestration for Vercel and Anthropic with explicit failure results. | Source credentials, current totals and per-task attribution were not verified in this review. |

The repository also contains historical local-machine operational receipts. Their dates must remain visible; they do not establish present service health. This review inspected source and issues. It did not run application tests or query private worker infrastructure.

## Preserve ownership and avoid competing schedulers

This is operational reference-build work: no edits to SIP, sovereignty, attestation, canonical taxonomy or cross-party file contracts. If implementation requires one of those changes, route through the existing substrate governance before commit.

Current program ownership takes precedence over older generalized platform proposals:

- [#147](https://github.com/frankxai/Starlight-Intelligence-System/issues/147) owns federation reconciliation, cancellation and budget proof.
- [starlight-swarm #15](https://github.com/frankxai/starlight-swarm/issues/15) owns durable authority/admission under the established Temporal/Queen design.
- Vercel Workflow is a candidate for bounded hosted steps below that authority. Queues require a demonstrated independent-consumer need. Adoption requires the existing restart, privacy, cost and exit decision; do not introduce another mission scheduler.
- A local CLI worker and a hosted worker consume the same admitted task envelope and report evidence. Their host implementations and deployment proofs differ.
- [#49](https://github.com/frankxai/Starlight-Intelligence-System/issues/49) owns the memory session handshake. [#64](https://github.com/frankxai/Starlight-Intelligence-System/issues/64) owns the reviewed portable-provider migration. Reuse their contracts instead of defining a second canonical memory store.
- [#153](https://github.com/frankxai/Starlight-Intelligence-System/issues/153) owns the Codex worker. General GitHub/n8n product integrations remain under [#155](https://github.com/frankxai/Starlight-Intelligence-System/issues/155).

A queue provides durable delivery; idempotent effect handling and reconciliation are still required. No design here claims exactly-once provider execution.

## Frozen workload

Create a tiny synthetic repository with a documented function, a known defect and a public design note. Freeze the input revision and the expected behavior before producer execution. Keep independent assertions outside the producer's editable scope. Include synthetic forbidden/revoked notes to test retrieval isolation without using real private data.

The producer receives the bounded goal, permitted file list, permitted memory citations, acceptance requirements and a numeric resource envelope. It must return a patch and rationale. It cannot edit the hidden assertions, admission policy, verifier output or credential scopes.

The verifier receives the original requirement, source revision, patch hash, allowed-path policy, trace and independent assertions. It authenticates the producing principal separately from its own identity. Distinct strings in a payload are insufficient evidence of independent review.

One successful result requires:

1. The unchanged fixture fails the intended functional assertion.
2. The patch fixes that assertion and stays within the allowed paths and scope.
3. Required deterministic checks pass on the exact candidate revision.
4. The verifier records a verdict against the candidate artifact hash.
5. Usage is either evidenced or explicitly unknown. Unknown usage blocks cost-efficiency and budget-completion claims.
6. A sanitized memory proposal cites the relevant source and reviewed outcome. Acceptance remains a separate existing lifecycle event.
7. A fresh authorized session retrieves the accepted memory with its citation, revision and freshness. The denied/revoked notes remain absent.

Map this case into the frozen #150 corpus before any model comparison. It does not replace the 20-task corpus or lower its 19/20 acceptance target. Compare the same workload with the existing direct-provider baseline and retain every failed or retried attempt.

## Resource and authority envelope

Use one executor and one verifier initially; no recursive delegation. These fixture limits are proposed test inputs, not changes to shared runtime contracts:

| Dimension | Offline fixture setting |
| --- | --- |
| Active producer workers | 1 |
| Active independent verifiers | 1 |
| Concurrent missions | 1 |
| Logical implementation attempts | At most 2; unchanged replay keeps its identity |
| Permitted repository | One synthetic fixture repository |
| Permitted patch paths | Enumerated before admission |
| Retrieved context | At most 5 permitted notes and 12,000 input tokens |
| Graph traversal | At most 2 hops and 32 admitted nodes |
| Wall-clock limit | 10 minutes; an elapsed local timer does not imply remote cancellation |
| External spend | 0; adapters are deterministic fixtures |

Real-provider admission must supply numeric per-run and total-pilot spend ceilings, dated price policy, provider/model allowlist, output-token ceiling, retry budget and maximum concurrent reservations. Missing fields deny admission. Do not convert this document into authority to purchase inference or hosting.

Bind the repository allowlist, branch scope, tool permissions and credential scopes in host policy. Deny cross-repository writes, dependency installation and network egress by default; enable only fixture-specific necessities. Repository content and retrieved notes are untrusted task data and cannot enlarge permissions. The executor cannot review itself, merge, deploy, change policy, mint credentials or expose private memory.

Use durable task IDs, separate attempt IDs, effect IDs, lease/fencing information and persisted provider references from the existing authority. Record an effect's reference before deciding whether a retry is safe. A timeout after submission with no acknowledgement becomes unresolved and reconciled, never blindly reissued.

## Recovery and cost evidence

Reuse the ten cases from #147: crash before submit; crash after submit before acknowledgement; lost response; duplicate request; delayed completion; revoked access; budget exhaustion; expired lease; concurrent resume; cancellation race.

For each, capture the last durable state, outstanding reservation, observed provider status and next permitted action. Distinguish stop-waiting, cancellation requested, provider-confirmed cancellation, completed and unresolved outcomes. Canceling one local request does not release an unresolved external execution's cost reservation.

Usage reporting distinguishes:

- measured input/output/cache tokens and provider charge, with provider usage reference;
- inferred charge from a versioned price policy, labeled estimate;
- subscription allocation as internal accounting, separate from marginal API cash expense;
- runtime, storage, queue, retry and failed-attempt costs;
- unknown usage, retained as unknown.

Cost per accepted artifact is total attributable attempted-workload cost divided by independently accepted artifacts. With zero accepted artifacts, report undefined rather than zero. Do not fabricate token totals from agent counts or wall time.

## Evidence packet

Reuse existing Work Graph, Foundry and evaluation receipts; this list describes evidence required for this workload, not a new shared schema:

- Frozen task/corpus identity; input/source revision and hash; candidate patch/revision/hash.
- Task, attempt, effect and correlation references; policy version; host/adapter version; worker principal; verifier principal.
- Permitted source citations with revisions, freshness and access decision; never raw private notes.
- Durable transition references and provider references where applicable; restart and cancellation outcomes.
- Check command, exit code, exact tested revision and immutable artifact reference.
- Verifier rubric, independent verdict and evidence binding.
- Usage status, dated price reference, reservations, attributable costs and missing evidence.
- Memory proposal and acceptance references, plus fresh-session recall evidence.
- Rollback/removal instructions and a visible simulated/local/authenticated-provider status.

Public fixtures contain only synthetic data. Real operator traces stay in approved private evidence storage; public proof is separately sanitized. Use the current privacy filters for every export and graph projection. Do not make public a private identifier simply because its contents were removed.

## Implementation agent prompt

Work on issue #158 within the existing #143 program. Read AGENTS.md, CLAUDE.md, CREATOR.md, the current operational vault context and the linked ownership issues. Inspect current main and open PRs before choosing paths; work may have advanced after this dated review.

Build the smallest deterministic acceptance fixture that exercises one scoped repository change, independent review, attributable usage state and memory citation/export. Prefer existing event, graph, Foundry and evaluation contracts. Keep one producer and one verifier. Do not start a new orchestration framework, a second memory store, or a global rewrite.

First identify the reusable entry points and the remaining gaps. Record actual callback/adapter wiring. Reject placeholder executor output as live execution proof. Reuse the #147 recovery corpus and #150 evaluation structure; preserve denominators and existing release gates.

Test the functional regression and meaningful negative cases: out-of-scope edits, forged citations, revoked context, same-principal review, mismatched revision, missing evidence, unknown usage claimed as zero, duplicate effects and unconfirmed cancellation. A required test skipped for credentials is a hold for live proof.

Use existing scripts where applicable: npm run test:work-graph, npm run test:graph-engineering, npm run test:memory-provider, and focused gateway/privacy/adapter tests. Add a new command only when the existing runner cannot own the scenario. State commands actually run and report failures honestly.

Open a draft implementation PR with the exact diff, reproducible offline evidence, remaining live-provider gates and rollback. Do not close #158 based on this planning document. Do not merge, deploy, buy services, change credentials, send outreach, or claim round-the-clock operation. Any required substrate change follows board-before-commit governance.

## Handoff state

The operational decision is to reuse the federation program and make its repository-change proof executable. This document is the plan; #158 remains implementation work. The first live proof and cost/availability claims remain unverified until their corresponding receipts exist.

Built on SIP — operational delivery work.
