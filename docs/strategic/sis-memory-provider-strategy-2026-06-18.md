# SIS Memory Provider Strategy — Sovereign Router, Swappable Capability Backends

**Date:** 2026-06-18  
**Status:** strategic recommendation / architecture brief  
**Scope:** Starlight Intelligence System (SIS), Arcanea/ACOS agent fleet, Hermes Agent memory-provider landscape  
**Decision posture:** SIS remains the canonical control plane. External memory systems are adapters, accelerators, or product-tier backends — never the source of authority.

---

## Executive recommendation

Do **not** make SIS depend on one external memory vendor. The best long-term architecture is:

> **SIS is the sovereign memory router, policy layer, evaluator, and canonical event log. Memory providers are interchangeable capability backends.**

This matches the current SIS repo direction:

- `AGENTS.md` already defines SIS as a persistent context and memory architecture, with event-sourced SQLite hybrid indexing, six semantic vaults, sanitization, MCP exposure, and multi-harness adapters.
- `memory/README.md` already states the filesystem is the source of truth, in plain Markdown + JSONL, with Obsidian as only one viewer.
- `src/memory.ts`, `src/vault-memory.ts`, `src/session-store.ts`, and `src/memory-eval.ts` already implement the primitives SIS needs: append-only event logs, vault classification, hybrid retrieval, privacy filtering, per-harness working memory, and deterministic retrieval evaluation.
- Hermes Agent's memory provider documentation validates the external-provider pattern: one external provider can be active in Hermes at a time, while built-in memory remains active and additive. SIS should generalize that into **multi-provider internal routing** rather than copying the one-provider constraint.

**Default path for Frank / Arcanea / SIS:** local-first sovereign memory as the base, with optional routed mirrors into Mem0, Hindsight, Honcho, Supermemory, Holographic/OpenViking/ByteRover/RetainDB/Memori depending on product and tenant class.

---

## What was validated

### 1. Hermes memory-provider docs

The current Hermes docs list external memory providers as additive plugins: built-in `MEMORY.md` / `USER.md` remains active while exactly one external provider is configured. The page currently documents **8 external provider plugins** in the intro/config examples, while the provider sections enumerate the following provider families:

- Honcho
- OpenViking
- Mem0
- Hindsight
- Holographic
- RetainDB
- ByteRover
- Supermemory
- Memori

This matters for SIS because Hermes proves the provider interface pattern, but also exposes a strategic limitation for SIS: Hermes is user-agent scoped and one-provider-active; SIS is a fleet substrate and should support multiple active providers behind one internal API.

Relevant Hermes behavior from the docs:

- provider context injection before turns
- relevant-memory prefetch
- post-response turn sync
- session-end extraction where supported
- mirroring built-in memory writes to the provider
- provider-specific memory tools

SIS should reuse the lifecycle shape, not the single-provider constraint.

### 2. Existing SIS architecture

The repo is already closer to a sovereign memory substrate than to a wrapper around any SaaS:

| Existing SIS surface | Current evidence | Strategic implication |
|---|---|---|
| Canonical vaults | `memory/README.md`, `memory/VAULT_ARCHITECTURE.md` | SIS already has a durable knowledge taxonomy. Providers should map into it. |
| Event-sourced memory | `src/memory.ts` append-only JSONL events | Good base for provenance, replay, sync, and provider mirroring. |
| Session working memory | `src/session-store.ts` | Can be the fast-path current-context layer. |
| Hybrid retrieval | `src/vault-memory.ts` RRF lexical + semantic hashing | Gives local fallback and eval baseline independent of vendors. |
| Evaluation harness | `src/memory-eval.ts`, eval-50 references | SIS can compare providers empirically rather than by hype. |
| Local-first sovereignty | `memory/README.md` no external embeddings / filesystem truth | Provider policy must preserve privacy and exportability. |
| Prior memory-bus doctrine | `transmissions/channels/memory-bus.md` | Singleton mediator pattern remains correct; provider adapters should hang behind the bus/router. |

### 3. Perplexity recommendation: mostly correct, with refinements

The supplied research is directionally right:

- **Correct:** SIS should be the source of truth, not Mem0/Supermemory/Letta/etc.
- **Correct:** provider references should be secondary indexes, not primary identifiers.
- **Correct:** different providers optimize different capability axes.
- **Correct:** local-first plus selective cloud mirrors is the safest default.
- **Needs refinement:** Hermes documents Honcho, OpenViking, ByteRover, RetainDB, and Memori too; SIS should include them in the provider taxonomy even if not first-wave adapters.
- **Needs refinement:** `starlight-memory` should not immediately replace SIS memory. It should start as an internal package/module boundary, then extract only when the interface is stable and there is a real distribution reason.

---

## Architecture: four SIS memory layers

```text
┌────────────────────────────────────────────────────────────────────────────┐
│ Arcanea / ACOS / Hermes / Claude Code / Cursor / Codex / Grok / Antigravity │
│                         agents call SIS only                               │
└──────────────────────────────────┬─────────────────────────────────────────┘
                                   │
┌──────────────────────────────────▼─────────────────────────────────────────┐
│ 1. SIS Memory API Layer                                                     │
│ remember · recall · reflect · profile · forget · ingest_session             │
│ link_entity · score_trust · evaluate · export · redact                      │
└──────────────────────────────────┬─────────────────────────────────────────┘
                                   │
┌──────────────────────────────────▼─────────────────────────────────────────┐
│ 2. SIS Policy + Routing Layer                                                │
│ tenant policy · privacy class · modality · workflow intent · cost/latency    │
│ provider scorecards · trust/confidence · retention · provenance              │
└──────────────────────────────────┬─────────────────────────────────────────┘
                                   │
┌──────────────────────────────────▼─────────────────────────────────────────┐
│ 3. Provider Adapter Layer                                                    │
│ local_core · holographic · openviking · byterover · mem0 · hindsight         │
│ honcho · supermemory · retaindb · memori · letta-runtime                     │
└──────────────────────────────────┬─────────────────────────────────────────┘
                                   │
┌──────────────────────────────────▼─────────────────────────────────────────┐
│ 4. Canonical Storage + Governance Layer                                      │
│ JSONL truth · SQLite/FTS indexes · vault markdown · KG projections           │
│ audit log · provider shadow refs · eval traces · privacy/retention rules     │
└────────────────────────────────────────────────────────────────────────────┘
```

Core rule:

> Every write lands in SIS first. Providers receive derived copies, summaries, embeddings, documents, or graph projections only after policy gates pass.

---

## Canonical SIS memory object

SIS needs a provider-neutral memory envelope. Providers can store richer versions, but every backend must round-trip into this shape.

```ts
export interface SISMemoryRecord {
  memory_id: string;
  tenant_id: string;
  workspace_id?: string;
  agent_id?: string;
  user_id?: string;

  source: {
    system: 'sis' | 'hermes' | 'claude-code' | 'cursor' | 'codex' | 'grok' | 'voice' | 'import' | string;
    session_id?: string;
    turn_id?: string;
    uri?: string;
  };

  modality: 'text' | 'voice' | 'image' | 'video' | 'file' | 'code' | 'event';
  memory_type: 'working' | 'episodic' | 'semantic' | 'procedural' | 'profile' | 'policy' | 'aspirational';
  vault?: 'strategic' | 'technical' | 'creative' | 'operational' | 'wisdom' | 'horizon';

  raw_content?: string;
  normalized_fact?: string;
  summary?: string;

  entities: Array<{ id?: string; name: string; type?: string; confidence?: number }>;
  relations: Array<{ subject: string; predicate: string; object: string; confidence?: number }>;

  time_range?: { start?: string; end?: string; observed_at?: string };
  importance: number;   // 0..1
  confidence: number;   // 0..1 factual confidence
  trust: number;        // 0..1 source/provider/user-feedback trust

  privacy_class: 'public' | 'private-shareable' | 'private' | 'secret' | 'regulated';
  retention_policy: 'ephemeral' | 'rolling_90d' | 'permanent' | 'append_only' | 'delete_by';
  retention_until?: string;

  provenance: Array<{
    event_id: string;
    transform: 'raw' | 'redacted' | 'extracted' | 'summarized' | 'embedded' | 'graph_projected' | 'provider_imported';
    at: string;
  }>;

  provider_shadow_refs: Record<string, {
    provider_record_id: string;
    container?: string;
    url?: string;
    last_synced_at: string;
    sync_state: 'pending' | 'synced' | 'failed' | 'deleted';
  }>;
}
```

Design invariants:

1. `memory_id` is always SIS-owned.
2. `provider_shadow_refs` are secondary indexes only.
3. Raw sensitive content can remain local while providers receive redacted summaries.
4. All provider writes are replayable from the SIS event log.
5. Evaluation traces are first-class records, not ad-hoc benchmark notes.

---

## Provider role matrix

| Provider / pattern | Best role in SIS | Authority level | Use when | Avoid when |
|---|---:|---:|---|---|
| **SIS `local_core`** | Canonical event log, vaults, local retrieval, privacy gate | Primary | Always | Never as optional; this is the base |
| **Holographic** | Local SQLite facts, trust scoring, contradiction/HRR-style compositional recall | Adapter / local accelerator | privacy-sensitive local agents; no external dependencies | enterprise connector ingestion is the main need |
| **OpenViking** | Self-hosted hierarchical knowledge browsing and tiered context | Adapter / local knowledge manager | users want file-system-like browsing and self-hosted server | you need managed extraction with no infra |
| **ByteRover** | Developer-oriented local-first CLI knowledge tree | Adapter / dev workflow memory | coding agents, portable CLI memory | product SaaS profile memory is the target |
| **Mem0** | Managed extraction, deduplication, semantic search/reranking | Cloud accelerator | general SaaS assistant memory; low maintenance | strict local-only tenants or regulated raw data |
| **Hindsight** | Knowledge graph/entity recall and `reflect`-style synthesis | Graph/synthesis backend | entity-heavy projects, relationships, research memory, cross-memory synthesis | simple profile facts only |
| **Honcho** | User/agent peer modeling, alignment, dialectic/context injection | Identity/user-model backend | multi-agent peer modeling and cross-session user alignment | you only need a vector document store |
| **Supermemory** | Connectors, session graph ingest, enterprise context plumbing | Enterprise context backend | Gmail/Drive/Notion/GitHub/S3-like connected context, compliance packaging | core sovereign truth layer |
| **RetainDB** | Cloud hybrid search + typed memory API | Cloud backend option | teams already on RetainDB or want simple typed cloud memory | local-first/offline requirement |
| **Memori** | Cloud/user memory backend to watch/evaluate | Candidate adapter | if it outperforms on evals or product fit | before scoring against SIS evals |
| **Letta** | Optional agent runtime with self-editing memory | Runtime plugin, not core storage | running Letta subagents or MemGPT-style agents | making SIS depend on Letta as memory authority |
| **MemPalace-style local store** | Verbatim capture + memory palace/Obsidian bridge | Local capture/index pattern | "what was said" recall, voice/session atom capture | as the only curated knowledge layer |

---

## Routing policy

SIS should route by policy, not preference.

| Condition | Primary route | Mirror route | Notes |
|---|---|---|---|
| `privacy_class in ['secret', 'regulated']` | `local_core` only | none unless tenant explicitly enables compliant backend | Redaction before any external call. |
| `tenant.privacy_sensitive == true` | `local_core + holographic/openviking` | optional encrypted/self-hosted | Preserve offline operation. |
| `workflow.general_assistant` | `local_core` | `mem0` optional | Mem0 handles extraction/dedup if allowed. |
| `workflow.entity_reasoning` | `local_core` | `hindsight` | Project entities/relations; keep canonical record local. |
| `workflow.multi_agent_alignment` | `local_core` | `honcho` | Useful for peer/user representations. |
| `tenant.enterprise_connector_heavy` | `local_core` | `supermemory` | Connectors are capability; SIS remains authority. |
| `workflow.developer_cli_memory` | `local_core` | `byterover` | Good for coding-agent portable knowledge. |
| `workflow.knowledge_browsing` | `local_core` | `openviking` | Tiered browsing and resources. |
| `workflow.local_compositional_recall` | `local_core` | `holographic` | Trust scoring and contradiction probes. |

Pseudocode:

```ts
function routeMemory(record: SISMemoryRecord, policy: TenantPolicy): ProviderRoute[] {
  const routes: ProviderRoute[] = [{ provider: 'local_core', mode: 'canonical_write' }];

  if (record.privacy_class === 'secret' || record.privacy_class === 'regulated') {
    return routes;
  }

  if (policy.localOnly) {
    return [...routes, { provider: policy.localProvider ?? 'holographic', mode: 'derived_write' }];
  }

  if (record.memory_type === 'profile' || policy.defaultCloudMemory === 'mem0') {
    routes.push({ provider: 'mem0', mode: 'redacted_fact_write' });
  }

  if (record.entities.length || record.relations.length || policy.graphMemory) {
    routes.push({ provider: 'hindsight', mode: 'graph_projection' });
  }

  if (policy.enterpriseConnectors) {
    routes.push({ provider: 'supermemory', mode: 'document_or_session_ingest' });
  }

  if (policy.peerModeling) {
    routes.push({ provider: 'honcho', mode: 'peer_observation' });
  }

  return routes;
}
```

---

## Provider scoring / evaluation

SIS should treat provider choice as an empirical scoreboard. The local eval harness already creates the right cultural pattern: measure retrieval quality, latency, and weakness notes.

Minimum scorecard per provider:

| Metric | Why it matters |
|---|---|
| Recall@5 / Hit@10 / MRR@10 | Did the right memory return? |
| Precision@10 | Did it return too much junk? |
| Contradiction rate | Does it surface stale/wrong facts? |
| User-correction rate | How often Frank/users have to fix memory. |
| Latency p50/p95 | Whether it can run in turn loop. |
| Cost per 1k turns | SaaS viability. |
| Privacy leak risk | Whether raw/private content leaves SIS. |
| Exportability | Can SIS replay/rebuild if vendor disappears? |
| Connector coverage | Enterprise product value. |
| Operational complexity | Infra/user setup burden. |

First benchmark suite:

1. Current SIS eval-50.
2. LongMemEval/LoCoMo-style long-horizon tasks as imported/adapted datasets.
3. Frank/Arcanea product traces, redacted and classified.
4. Synthetic contradiction/staleness tests.
5. Multi-agent cross-session recall tests.

Gate for any provider becoming default:

- passes privacy policy for the tenant class
- improves at least one key metric over `local_core`
- can export or replay enough metadata to preserve SIS authority
- has adapter tests and failure-mode behavior

---

## Resource constraints: dozens of agents per machine

Frank's real operating environment is not one assistant process. It is dozens of terminal coding agents, harnesses, and background workers on the same machine. The memory architecture must therefore optimize for **fan-in and singleton services**, not per-agent provider runtimes.

Hard constraints:

1. **Never spawn heavyweight memory providers per terminal agent.** Local graph/vector servers, embedded HNSW indexes, local Mem0-style runtimes, Letta runtimes, and connector daemons must run as one shared service per machine/tenant or be remote APIs.
2. **SIS Memory Gateway is the fan-in point.** Agents call the gateway/router; the gateway batches writes, caches recalls, and controls provider cadence.
3. **External cloud providers are async mirrors by default.** A provider outage or rate limit should degrade enrichment, not block canonical SIS writes.
4. **Bound recall context.** Every provider needs max results, max tokens/chars, TTL cache, and per-session cadence controls.
5. **Prefer local_core for hot path.** The turn loop should hit lightweight JSONL/SQLite/FTS/hybrid indexes first; graph/cloud extraction runs off the hot path unless explicitly requested.
6. **Provider adapters declare process model.** Each adapter must mark itself as `embedded_lightweight`, `shared_daemon`, `remote_api`, `shared_daemon_or_remote_api`, or `external_runtime`, plus whether per-agent instances are allowed.

Initial implementation in this repo now encodes this policy under `src/memory-provider/`:

- `types.ts` — provider-neutral SIS record, route, policy, and capability types.
- `resources.ts` — default provider resource profiles and singleton/shared-daemon requirements.
- `router.ts` — privacy-aware routing that keeps `local_core` canonical and mirrors only when policy allows.
- `test/memory-provider-router.test.ts` — regression tests for local-first authority, secret blocking, graph/cloud routing, and no per-agent heavyweight provider spawning.

---

## First-wave implementation plan

### Phase 0 — lock the contract

- Create `src/memory-provider/types.ts` with `MemoryProvider`, `MemoryRouter`, `ProviderRoute`, and `SISMemoryRecord`.
- Add no-op/local implementation that wraps existing `MemoryManager`, `VaultMemory`, and `SessionStore`.
- Document the mapping from six vaults to memory types.
- Add tests for provider-shadow refs, privacy routing, and replay from JSONL.

### Phase 1 — three adapters only

Start narrow:

1. `local_core` — canonical, always on.
2. `holographic` or `openviking` — local/provider comparison path.
3. `mem0` or `hindsight` — cloud capability path.

Recommended first trio for Frank:

- `local_core`
- `hindsight` for graph/reflection experiments
- `mem0` for managed extraction comparison

Reason: this validates all strategic dimensions quickly: sovereign base, graph reasoning, managed cloud extraction.

### Phase 2 — enterprise/context tier

Add `supermemory` only when there is a product/customer need for connector-heavy ingestion and compliance packaging. It is highly relevant for revenue-facing deployments, but should not be the core memory authority.

### Phase 3 — runtime adapters

Letta should live here: optional runtime integration for Letta subagents, not as the central SIS memory architecture.

---

## Should we create `starlight-memory` as a new repo?

**Recommendation: not yet as a separate repo. Yes as a bounded internal module/package.**

Create a separate repository only after the provider contract survives 2-3 real adapters and evals.

### Why not split immediately

- Current memory code is deeply coupled to SIS vault doctrine, SIP attestation, privacy classes, repo-local evals, and agent harnesses.
- Splitting too early risks creating another abstraction repo before the interface is proven.
- The current repo already exports `./memory`, `./vaults`, `./retrieval`, `./session-store`, and has optional peer deps for memory systems.

### What to do now

Create this shape inside SIS first:

```text
src/memory-provider/
  types.ts
  router.ts
  policy.ts
  providers/
    local-core.ts
    mem0.ts
    hindsight.ts
    supermemory.ts   # stub until needed
  eval.ts
  README.md
```

Then optionally expose as an npm subpath:

```json
"./memory-provider": {
  "types": "./dist/memory-provider/index.d.ts",
  "import": "./dist/memory-provider/index.js"
}
```

### When to extract to `frankxai/starlight-memory`

Extract only when at least three of these are true:

- Arcanea/ACOS and SIS both consume it independently.
- There are 3+ real provider adapters with tests.
- The eval suite runs provider comparisons in CI.
- External users need the memory layer without the rest of SIS.
- The package has a stable schema/versioning story.

If/when extracted, `starlight-memory` should be:

- a library + adapter suite
- not the canonical storage for Frank's memory
- governed by SIS/SIP schemas
- versioned with migration tooling

---

## Long-term default stance

For Frank's machine and Arcanea users:

1. **Canonical:** SIS local event log + vaults + SQLite/FTS/hybrid indexes.
2. **Default optional cloud:** Mem0 for managed extraction and simple semantic recall.
3. **Default graph:** Hindsight for entity/relationship/reflection-heavy work.
4. **Enterprise/context:** Supermemory for connector-heavy SaaS/customer environments.
5. **Local sovereign alternatives:** Holographic/OpenViking/ByteRover/MemPalace-style stores depending on UX and deployment.
6. **Runtime experiments:** Letta as a subagent runtime, not the memory authority.
7. **Continuous evaluator:** every provider earns its place by score, not narrative.

---

## Strategic decision

SIS should not become "the Mem0 wrapper" or "the Supermemory wrapper." It should become the layer that lets Frank and future customers say:

> Our memory is ours. Our providers are replaceable. Our intelligence compounds.

Built on SIP — sovereign memory router strategy.
