# SIS Operational Work Graph

**Status:** executable operational contract  
**Scope:** operational tier; no SIP substrate change  
**Parent law:** [`docs/graph-engineering/CONTRACT.md`](../graph-engineering/CONTRACT.md) — this file is **layer A** (workflow / receipts), not memory, not a per-agent graph  
**Implementation:** `src/work-graph.ts`, `src/work-graph-cli.ts`, `packages/core/schemas/work-graph-event.schema.json`

## Decision

SIS will connect conversations, agents, repositories, CI, deployments, and memory through one **evidence-backed work graph**. It will not copy every transcript into one database and it will not promote agent summaries directly into durable semantic memory.

The graph's unit is an immutable event carrying one `workId` and one `correlationId` from intent to verified delivery:

```text
intent/session
  -> admitted work + explicit gates
  -> agent run
  -> artifact
  -> change/PR
  -> checks
  -> deployment (when required)
  -> independent verification
  -> completion receipt
```

A conversation is evidence of intent. A branch is evidence of implementation activity. A passing check is evidence of validation. A production endpoint is evidence of deployment. None of these alone means the work is complete.

## Why this is the missing wire

The estate already has strong pieces:

- SIS has append-only JSONL ledgers, SQLite shadow indexes, WorkPackets, AgentEvents, Artifacts, Decisions, and evidence-backed graph edges.
- `starlight-memory` has the provider-neutral memory contract and sovereign `local_core` authority.
- `starlight-agent-config` has the repository estate manifest and operating doctrine.
- private `agentic-ops` has the durable multi-machine bus and lifecycle receipts.
- `agentic-ops-hub` has cross-harness instruction distribution and sanitized fleet coordination.
- `starlight-command-center` has read-only collectors and the Observatory UI.
- Hermes, Telegram, Codex, Claude, and Antigravity each preserve their own session histories.

What was missing was a portable contract that links these surfaces without making any adapter or transcript store authoritative.

## Ownership map — one writer per truth

| Concern | Canonical owner | Other surfaces |
|---|---|---|
| SIS protocol and public operational contracts | `Starlight-Intelligence-System` | consumers/adapters |
| Repo routing and estate classification | `starlight-agent-config/core/estate/repo-estate.control.json` | cached projections only |
| Memory provider contract and policy | `starlight-memory` / sovereign `local_core` | Hindsight, Honcho, Mem0 as derived adapters |
| Private live work events and machine bus | private `agentic-ops` / `~/.starlight` runtime | SIS schema; Observatory projections |
| Cross-harness instruction fan-out | `agentic-ops-hub` | generated AGENTS/Claude/Cursor files |
| Operator UI | `starlight-command-center` Observatory | read-only projection |
| Session transcripts | originating harness | references and summaries only |
| Source code and delivery truth | canonical product repo + GitHub + CI/deployer | graph evidence refs |

This explicitly rejects the older proposal to commit private session atoms into the public SIS repository or append every run to repo `MEMORY.md`.

## Memory architecture

Top agent systems separate memory by function and authority:

| Layer | Contents | Lifecycle | Authority |
|---|---|---|---|
| Working context | current prompt, scratch, temporary plans | short-lived | active session only |
| Checkpoint state | resumable workflow state, queues, retries | durable until workflow closes | runtime orchestrator |
| Episodic ledger | immutable work events and receipts | append-only/audit retention | private work graph |
| Semantic memory | stable facts, decisions, patterns | reviewed promotion, contradiction and expiry checks | sovereign local core |
| Procedural memory | skills, runbooks, policies, schemas | Git review and versioning | owning repo |
| Profile memory | compact preferences and identity facts | curated; private | Hermes/user memory store |
| Knowledge graph | relations with evidence and valid-time/observed-time | derived and rebuildable | projection, never primary truth |

### Promotion rule

No transcript, model inference, or work event becomes semantic memory automatically.

Promotion requires:

1. a stable claim rather than task progress;
2. provenance back to an evidence reference;
3. privacy and retention classification;
4. contradiction/staleness evaluation;
5. human or policy-authorized promotion;
6. a reversible provider projection.

Raw transcripts stay at their originating harness. The graph stores identifiers, summaries, and evidence URIs—not secrets or transcript bodies.

## Event contract

Every event includes:

- `eventId`: idempotency key;
- `workId`: the durable unit of work;
- `correlationId`: cross-system trace identity;
- `projectId`: canonical project/repo identity;
- `source.system` and `source.sourceId`: provenance;
- `occurredAt` and `observedAt`: bitemporal ordering;
- `evidenceRefs[]`: mandatory proof links;
- visibility and retention labels;
- a bounded summary and optional structured data.

Identical retries are deduplicated. Reuse of an event ID with a different payload is a conflict. Completion is refused until an explicit `work.admitted` event supplies the required proof gates and every required gate is satisfied.

## Adapter model

Adapters translate source-native facts into the contract. They do not decide global truth.

| Adapter | Emits |
|---|---|
| Hermes / Telegram | `intent.captured`, `work.admitted`, `work.blocked` |
| Codex / Claude / Antigravity | `run.started`, `artifact.produced` |
| GitHub | `change.opened` |
| CI | `check.passed` |
| Vercel/Railway/runtime | `deployment.succeeded` |
| checker / Observatory | `verification.passed` |
| orchestrator | `work.completed` only after projection gates pass |

MCP and A2A are transport/capability adapters. Neither owns the ledger, memory authority, or completion decision.

## Usage

Build and validate the checked-in example:

```bash
npm run build
node dist/work-graph-cli.js validate examples/work-graph/product-delivery.jsonl
node dist/work-graph-cli.js project examples/work-graph/product-delivery.jsonl
```

Package consumers can use:

```ts
import { parseWorkGraphJsonl, projectWorkGraph } from "@arcanea/starlight-intelligence-system/work-graph";
```

The CLI exits non-zero for malformed input, conflicting event IDs, or a premature completion attempt.

## Adoption sequence

1. **Kernel (this change):** schema, parser, idempotent projector, proof gates, CLI, tests.
2. **Private runtime:** implement one append-only writer in `agentic-ops`; never put live private events in this public repo.
3. **First producer:** GitHub PR/check collector, because every coding harness converges there.
4. **Session adapters:** Hermes, Codex, Claude, and Antigravity emit intent/run/artifact refs.
5. **Projection:** Observatory reads a materialized private projection rather than crawling every source directly.
6. **Memory promotion:** selected stable outcomes flow through `starlight-memory`; external providers remain replaceable shadows.
7. **Cross-machine:** YogaBook writes its own heartbeat/events; C940 writes its own. No observer may impersonate a peer.

Each step must keep a compatibility reader until the new projection has parity and the old collector can be retired safely.

## Acceptance gates

The operationalization is not complete until a real work item demonstrates:

- one correlation ID across a session, repo, PR, CI run, deployment, and verification;
- retry-safe ingestion;
- no private content in public repositories;
- completion refused when any admitted proof is missing;
- projection rebuild from the append-only ledger;
- Observatory rendering from the projection;
- export and deletion/forget policy for memory-provider shadows;
- measured retrieval quality and contradiction rate before changing memory defaults.

## Primary architecture sources

Verified reachable 2026-08-05:

- [Temporal Workflow Execution](https://docs.temporal.io/workflow-execution) — durable, replayable workflow state and retry-safe execution.
- [LangGraph Persistence](https://docs.langchain.com/oss/python/langgraph/persistence) — checkpointed agent state and resumability.
- [Model Context Protocol specification 2026-07-28](https://modelcontextprotocol.io/specification/2026-07-28) — capability/tool transport boundary.
- [W3C PROV-DM](https://www.w3.org/TR/prov-dm/) — entity/activity/agent provenance model.
- [OpenTelemetry GenAI Semantic Conventions](https://github.com/open-telemetry/semantic-conventions-genai) — correlation and observability conventions.
- [A2A Protocol](https://a2a-protocol.org/latest/) — agent-to-agent task interoperability.

These sources reinforce the same boundary: durable workflow state, provenance, transport, telemetry, and semantic memory are related but distinct planes.

Built on SIP — operational tier.

## Projection privacy boundary

This operational work-graph projector consumes trusted, private operator records. It
is not the Community OS event or consent kernel and is not a public-export or
retention-enforcement API. Its source references and open data fields may contain
operator-private information. Keep its output private; use the host's redaction,
retention and access policies before any export. Never feed raw community messages
into this graph or infer member consent from graph visibility labels.

The initial loop contract uses `brakes.allowedActions` as an allowlist. Earlier draft
`silenceTriggers` spelling was misleading and is not supported; migrate it to
`allowedActions` without changing its values. An absent list fails closed.