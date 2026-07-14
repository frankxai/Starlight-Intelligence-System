# SIS memory architecture review and provider decision

Status: accepted direction; local hardening implemented; external activation gated
Date: 2026-07-12
Scope: SIS operational memory, Memory Gateway, MCP surfaces, MemPalace, cross-agent/cross-device behavior, Hindsight, Honcho, and Hermes Agent integration patterns

## Executive verdict

SIS has the right strategic center: sovereign canonical truth, append-oriented events, six semantic vaults, local derived indexes, explicit privacy classes, and provider adapters that remain subordinate to SIS. That is a stronger foundation for Frank's multi-agent estate than replacing memory with a single hosted vendor.

The implementation is not yet a world-class cross-device production system. Before this review it was best described as **strong architecture with alpha/beta implementation**:

- single-process memory worked, but a new Gateway or v0.1 MCP process did not load persisted memory;
- HTTP session namespaces collapsed to one `http` harness;
- the operational MCP accepted arbitrary vault names on writes, enabling path traversal;
- the active private memory bus had a real corpus but only lexical recall, no enforced namespace ACL, no sanitization boundary, and no proof that all harnesses used it;
- the canonical JSONL writer was protected only by a crash-wedgable lock;
- cross-device conflict freedom was claimed, but the active design still shares mutable files and relies on manual sync-conflict handling;
- MemPalace was a compelling static visualization, not a live memory control plane.

This change set moves the bounded single-machine path forward: restart recall, persisted vault identity, HTTP harness isolation, request size limits, owner-tokened stale-lock recovery, MCP vault validation, serialized writes, fail-closed external privacy, pseudonymous provider scopes, Hindsight/Honcho adapter contracts, and a provider-neutral eval fixture are implemented and tested.

Readiness after this pass:

| Capability | State | Meaning |
|---|---|---|
| Sovereign canonical model | Strong | The architectural authority boundary is correct. |
| Single-process local memory | Beta | Works and has regression coverage; retrieval is still lightweight. |
| Cross-agent on one machine | Beta | Gateway namespace isolation and restart recall are now proven; one-writer enforcement remains incomplete. |
| Cross-device memory | Alpha | Design direction exists; no physical two-device partition/recovery proof exists. |
| MemPalace | Prototype | Static palace/chronicle experience; not connected to live Gateway state. |
| Hindsight integration | Adapter-contract ready | Safe projection contract exists; native engine has not been run locally. |
| Honcho integration | Adapter-contract ready | Safe peer projection contract exists; native engine has not been run locally. |
| Production observability/evals | Early beta | Deterministic contract evals exist; native vendor and large-corpus evals remain gated. |

## What is actually present

### Canonical and derived memory

1. The six Markdown/JSONL vaults express strategic, technical, creative, operational, wisdom, and horizon memory.
2. `MemoryManager` maintains an append-oriented JSONL event log and an in-memory word index.
3. `VaultMemory` adds vault classification and local lexical/HashingTF rank fusion.
4. SQLite/FTS and embedding components exist elsewhere in the repo, but they are not one coherent always-on retrieval service across every MCP and Gateway path.
5. The private memory-bus corpus inspected during this review contained 345 atoms across 46 namespaces. Every sampled source was the cross-repo indexer; this proves indexing activity, not direct multi-agent transactional adoption.

### Own MCP and Gateway

SIS does have its own MCP and memory system. It is useful, but the surfaces are fragmented:

- `dist/mcp-server.js` is the package's operational `starlight-mcp` bin and exposes the `sis_*` vault/tool surface.
- `mcp-server-v01.ts` exposes a separate `sis.*` v0.1 surface and is not the package bin.
- `dist/starlight-mcp.js` is the substrate registry/attestation server, not the operational vault server.
- `mcp-is.ts` is an intelligence-system orchestration surface.
- `private/memory-bus/server.py` is a separate local stdio JSON-RPC memory bus with lexical recall.

The design intent is good; the product boundary is not yet clean. The target is one demand-scoped memory MCP facade per machine, backed by one Gateway/broker and one canonical event protocol. See `docs/memory/MCP-SURFACE.md`.

### MemPalace usage

MemPalace is currently used as a visual language, palace route, and historical/frozen artifact lineage. It is **not** the active memory database or a verified live view:

- `memory/mempalace/` and `memory/mempalace_sovereign/` were absent in this checkout;
- the site palace components use hard-coded vault cards, graph labels, counts, and simulated voice activity;
- the UI phrases “real excerpts from live memory” and “Obsidian bridge live now” are not supported by the active implementation inspected here;
- the Memory Gateway does not publish a palace graph/snapshot API consumed by the site.

MemPalace should remain, but as a read-only projection with explicit freshness and provenance. Until that connection exists, label it “concept/demo data,” not “live.”

## Runtime evidence

### Vault health

`node dist/cli.js vault health` reported:

- 6/6 vaults present;
- all vault consolidation stamps 62 days stale;
- knowledge-graph index empty and brain cache absent;
- sovereign and legacy/frozen MemPalace corpora absent;
- 31 consolidation receipts, latest 2026-07-12;
- memory-bus launcher and private path present.

### Active memory-bus retrieval baseline

The existing 50-query lexical-overlap eval was run against the active 345-atom private bus:

| Metric | Result |
|---|---:|
| hit@10 | 0.88 |
| hit@5 | 0.74 |
| precision@10 | 0.382 |
| MRR@10 | 0.526 |
| p50 latency | 174.128 ms |
| p95 latency | 258.578 ms |

This is a useful engineering baseline, not publication-grade evidence. The judge is token overlap, the current code labels hit@5 as `recall5`, and the fixture does not exercise restart, privacy, concurrent writers, cross-agent sessions, cross-device partitions, or provider outages.

### New deterministic provider eval

`npm run eval:memory-providers` runs one native local adapter and two contract simulations on the same six-record fixture:

| Candidate | Execution mode | hit@1 | hit@3 | MRR | Forbidden leaks | Forget | Quality-eligible? |
|---|---|---:|---:|---:|---:|---:|---|
| SIS local core | local engine | 1.0 | 1.0 | 1.0 | 0 | pass | No; synthetic regression fixture |
| Hindsight adapter | simulated client contract | 1.0 | 1.0 | 1.0 | 0 | pass | No |
| Honcho adapter | simulated client contract | 1.0 | 1.0 | 1.0 | 0 | pass | No |

The Hindsight/Honcho numbers prove SIS scoping and adapter behavior only. They do not measure either vendor's native retrieval, model quality, latency, hosted reliability, or cost.

## Hindsight, Honcho, and Hermes

Hermes Agent's provider architecture was a useful reference: its built-in `MEMORY.md`/`USER.md` memory remains additive while one external provider plugin may be active, with prefetch, post-turn sync, session extraction, mirror writes, and provider tools. SIS should reuse the lifecycle pattern, not Hermes's single-provider authority model. Sources: [Hermes memory providers](https://github.com/NousResearch/hermes-agent/blob/main/website/docs/user-guide/features/memory-providers.md) and [Hermes persistent memory](https://hermes-agent.nousresearch.com/docs/user-guide/features/memory/).

The local Hermes installation lists both plugins, but neither provider dependency nor provider credentials/base URL were configured. Docker was unavailable and the machine-performance gate returned HOLD. A native bake-off was therefore intentionally not fabricated.

| Dimension | SIS | Hindsight | Honcho |
|---|---|---|---|
| Best role | Canonical sovereign ledger and routing policy | Temporal/graph recall and reflection projection | User/peer representation and dialectic projection |
| Memory model | Events, vaults, provenance, policies | Retain, recall, reflect; semantic + lexical + graph + temporal retrieval | Workspaces, peers, sessions, messages, conclusions, representations |
| Authority | Primary | Accelerator only | Accelerator only |
| Deployment | Local files/Gateway today | Self-hosted/embedded or hosted | Hosted or self-hosted service |
| License posture | MIT repo | MIT | AGPL-3.0 repository; service terms separate |
| SIS alignment | Native | High for graph/temporal/reflection lane | High for encoded-self/peer lane; weaker as general canonical memory |
| Main risk | Implementation fragmentation and cross-device gaps | LLM/database operations, duplication, provider consistency | Privacy depth, peer identity semantics, AGPL/commercial review, remote dependence |
| Decision | Keep and harden | First shadow candidate | Optional isolated peer-model experiment |

Hindsight's official project describes hybrid semantic, BM25, graph, and temporal retrieval with Retain/Recall/Reflect and publishes its own benchmark repository. Honcho describes peer-centric representations and publishes its own evals. Those vendor-reported results are not directly comparable to the SIS 50-query fixture or to each other without identical datasets, models, prompts, token budgets, and judge configuration. Sources: [Hindsight](https://github.com/vectorize-io/hindsight), [Hindsight benchmarks](https://github.com/vectorize-io/hindsight-benchmarks), [Honcho](https://github.com/plastic-labs/honcho), and [Honcho evals](https://honcho.dev/evals/).

## Decision

1. **SIS remains the only canonical authority.** External systems store deletable, rebuildable projections referenced by `provider_shadow_refs`.
2. **Hindsight is the first candidate for a 14-day shadow bake-off.** Test graph-heavy semantic memories and reflection; do not use it for secrets, raw transcripts, or canonical deletion truth.
3. **Honcho is a separate peer-model lane.** Enable only for an explicit user/agent representation experiment; do not treat its conclusions as facts without provenance and confidence.
4. **No external provider is active by default.** Secrets and private records stay local. `private-shareable` is the normal maximum class. Private/regulated mirroring requires explicit policy approval.
5. **Raw content and raw scope identifiers do not cross provider adapters.** Adapters emit normalized facts/summaries and pseudonymous scope keys. A production estate should replace unsalted hashes with a tenant-held HMAC key.
6. **External activation is human-gated.** Credentials, hosted spend, provider terms, AGPL implications, data-processing regions, and retention/deletion guarantees require approval.

## Target production architecture

```text
agent harnesses
    |
    v
one demand-scoped SIS MCP facade per machine
    |
    v
one authenticated Gateway / single-writer broker
    |-----------------------> SessionStore (per harness / session)
    |
    +--> canonical immutable events (per-device segments, event ids, tombstones)
    |        |
    |        +--> local SQLite FTS/vector/KG indexes (fully rebuildable)
    |        +--> encrypted replication outbox
    |        +--> audit / receipts / consolidation queue
    |
    +--> redaction + policy router
             +--> Hindsight shadow projection (optional)
             +--> Honcho peer projection (optional)
             +--> other provider projections (optional)
```

The cross-device truth layer should not be one shared mutable JSONL file. Use immutable per-device segments such as:

```text
events/<tenant>/<device>/<yyyy-mm>/<sequence>-<event-id>.json
```

Each event needs `event_id`, `tenant_id`, `device_id`, HLC/Lamport time, source harness/agent/session, schema version, payload digest, privacy class, and operation (`upsert`, `tombstone`, `supersede`). Replication becomes set union; conflicts are resolved by explicit semantic rules, not last-writer-wins file replacement. SQLite, embeddings, graph edges, MemPalace scenes, and vendor mirrors remain derived views.

## Delivery sequence and gates

### P0 completed in this pass

- load persisted memory in Gateway and v0.1 MCP constructors;
- restore vault identity from persisted `vault:*` tags;
- preserve configured RRF channel weights in returned scores;
- continue loading after an isolated corrupt JSONL line;
- propagate and validate HTTP harness namespaces;
- enforce a one MiB HTTP body limit;
- add owner-tokened stale-lock recovery;
- validate canonical MCP vaults and serialize append/update/contradiction writes;
- make private external mirrors opt-in and pseudonymize provider scopes;
- fix Mem0 deletion through provider shadow ids;
- add Hindsight and Honcho client-injected adapters;
- add deterministic provider, privacy, restart, lock, namespace, and traversal tests.

### P0 still required before “production cross-device” may be claimed

- converge operational MCP/Gateway/bus into one canonical facade and correct every harness config path;
- add a durable provider outbox with idempotency keys, retries, dead-letter state, and replay;
- replace shared mutable event logs with per-device immutable segments;
- implement encrypted device enrollment, replication acknowledgements, tombstone propagation, and key rotation;
- add a two-physical-device partition/rejoin test with simultaneous writes and deletes;
- expose a signed/fresh Gateway palace snapshot and correct static MemPalace claims;
- ensure all direct writers are removed or routed through the single-writer broker;
- make consolidation freshness and index lag visible in health status.

### P1 live shadow bake-off

Run the same quality-eligible suite against approved Hindsight and Honcho endpoints:

- LongMemEval/LoCoMo-compatible cases plus SIS-specific policy, contradiction, provenance, temporal, peer, privacy, and cross-agent cases;
- fixed model/judge configuration and token budget;
- cold/warm p50/p95/p99 latency, ingestion lag, failure rate, retry rate, and cost per 1,000 memories;
- 24-hour restart/replay, provider outage, timeout, duplicate delivery, and deletion verification;
- zero raw/private/secret payload leakage in captured client requests.

Promotion requires a signed scorecard, no privacy leaks, deletion and export proof, and a measurable improvement on the lane it is meant to serve. A provider does not win by averaging unrelated capabilities.

## Acceptance criteria for the world-class claim

The system may be called production-grade cross-agent/cross-device memory only when all are true:

- 100 concurrent local writers complete without lost or duplicated canonical events;
- restart and index rebuild preserve 100% of accepted events and tombstones;
- two physical devices converge after offline concurrent mutation and deletion;
- tenant, workspace, user, agent, and session isolation have zero forbidden recalls;
- secret/private boundary tests observe zero outbound content or raw scope identifiers;
- local top-10 recall meets the declared corpus-size SLO and records p50/p95/p99;
- provider outage degrades projections, never canonical writes;
- export, forget, retention, and audit receipts are machine-verifiable;
- MemPalace displays signed source ids and freshness rather than hard-coded “live” state;
- an independent verifier reproduces the release scorecard.

## Rollback

The local correctness changes are isolated to Gateway, locking, MCP writes, and provider adapters. To roll back vendor work, remove provider routing/adapter imports and keep `local_core`; canonical data is untouched because all external stores are projections. Do not roll back canonical events to match a provider. If a provider corrupts or diverges, stop its projection worker, mark its shadow refs failed, delete/recreate its container, and replay approved redacted records from SIS.

---

Built on SIP — Starlight Intelligence Protocol v1.1.1
