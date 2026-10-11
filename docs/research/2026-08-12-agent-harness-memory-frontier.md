# Agent Harness and Memory Frontier

Research cutoff: 2026-08-12

Method: official documentation, repositories, releases, security notices, and primary research only

Machine-readable tracking: [`context/empire/upstreams.json`](../../context/empire/upstreams.json)

## Name resolution

- “Roof Flow” is almost certainly [Ruflo](https://github.com/ruvnet/ruflo), formerly Claude Flow.
- “my open agent” is almost certainly [Oh My OpenAgent / OmO](https://github.com/code-yeongyu/oh-my-openagent), formerly Oh My OpenCode.
- “mem pallets” is most likely [MemPalace](https://github.com/MemPalace/mempalace). The newer Rust [`mempal`](https://github.com/ZhangHanDong/mempal) and procedural-memory research project [`MemP`](https://github.com/zjunlp/MemP) are secondary references.

## Harness verdicts

| Upstream | State at cutoff | Importable primitive | Starlight boundary |
|---|---|---|---|
| [Ruflo](https://github.com/ruvnet/ruflo/releases) | v3.38.0, 2026-08-11 | Optional plugins, signed authorization receipts, budgets, OTel, poisoning defenses, package verification, doctor/migrations | Lab/reference only. Recent releases repaired divergent install tracks, an unpinned launch, missing plugins, hundreds of stale references, false-success memory writes, and lost concurrent updates |
| [Oh My OpenAgent](https://github.com/code-yeongyu/oh-my-openagent/releases) | stable v4.19.4; v5.0.0-beta.6 in lab | Planner-reviewer-executor separation, model routing, hash-anchored edits, LSP/AST checks, worktree confinement, authoritative completion events | Pin stable; treat v5 as experimental. Reject unbounded loops, default telemetry, and mythology as architecture |
| [Omnigent](https://github.com/omnigent-ai/omnigent) | v0.9.0, 2026-08-11 | Common harness runner, capability catalog, policy/budget layer, isolated runners, egress credential injection, live/scheduled sessions | Best control-plane comparator, still 0.x; retain explicit approval authority |
| [OpenAI Codex](https://developers.openai.com/codex/) | Active official harness | Short layered `AGENTS.md`, repo docs as truth, Agent Skills, bounded subagents, isolated worktrees | Use as a first-class adapter; do not share writing worktrees |
| [OpenAI Agents SDK](https://openai.github.io/openai-agents-js/) | Active TypeScript/Python SDKs | Agent loop, tools, handoffs, sessions, guardrails, tracing, sandbox workspaces | Strong TypeScript product-loop base behind Starlight contracts; sessions are not long-term truth |
| [Claude Code](https://docs.anthropic.com/en/docs/claude-code/sub-agents) | Active; teams experimental | Hooks, skills, isolated subagents, plan approval, long-running handoffs | Bounded adapter; teams only when parallel value justifies material token cost |
| [Pydantic AI Harness](https://pydantic.dev/docs/ai/harness/) | v0.18.1 | Capabilities, CAS/idempotency, budgets, Temporal/DBOS/Prefect/Restate durability | Preferred Python worker/eval comparator; API remains 0.x |
| [Mastra AgentController](https://mastra.ai/docs/harness/agent-controller) | Beta | Sessions, modes, approvals, steer/interrupt/queue, clone, channels, events, subagents, workspaces | Experience-layer reference behind an adapter; not a canonical schema |
| [LangGraph](https://docs.langchain.com/oss/python/langgraph/overview) | Mature low-level workflow runtime | Deterministic graphs, checkpoints, interrupts, replay/time travel | Workflow/checkpoint layer only; durable-wrap all external effects |
| [OpenCode](https://opencode.ai/docs/) | Active provider-neutral agent | ACP, LSP diagnostics, per-agent permissions | Interop adapter; override its default-allow behavior with Starlight fail-closed policy |

The architectural invariant is a deterministic durable workflow outside bounded agentic steps. A single controller owns task state, policy, budgets, approval, and terminal completion. Each writing worker receives an isolated worktree or sandbox.

## Memory verdicts

| Upstream | Strongest idea | Limitation | Role in Starlight |
|---|---|---|---|
| [Graphiti](https://help.getzep.com/graphiti/getting-started/overview) | Bitemporal facts, invalidation, hybrid graph search, episode provenance | Namespace is not authorization; documentation/release drift exists | Primary temporal projection candidate, never raw-evidence authority |
| [Letta Code](https://github.com/letta-ai/letta-code) | Git-backed MemFS, pinned/on-demand memory, agent-private guards, dreaming and doctor | Git history is not bitemporal truth; shared rewrites can be last-writer-wins | Identity/procedural-memory pattern and adapter |
| [Hindsight](https://github.com/vectorize-io/hindsight) | Separates facts, experiences, entity summaries, and evolving beliefs | Application must enforce authorization | Highest-priority shadow comparison for evidence-versus-belief |
| [Mem0](https://docs.mem0.ai/changelog/highlights) | ADD-only extraction, entity-assisted hybrid retrieval, temporal ranking, expiration, decay | OSS v3 removed graph drivers while overview docs remain inconsistent; managed features dominate | Optional personalization provider with executable feature contracts |
| [Cognee](https://github.com/topoteretes/cognee/releases) | Explicit `remember → recall → improve` promotion lifecycle | Broad multi-engine operations and reported lock-recovery risk | Optional gated enrichment worker |
| [MemPalace](https://github.com/MemPalace/mempalace) | Verbatim-first, local-first evidence preservation | Palace hierarchy is metadata scoping; retrieval benchmark is not answer accuracy | Raw-recall shadow baseline or local sidecar |
| [MemP](https://arxiv.org/abs/2508.06433) | Distills, corrects, and deprecates procedures from successful trajectories | Research code, not production infrastructure | Design basis for proposed skill promotion |
| [LangGraph memory](https://docs.langchain.com/oss/python/concepts/memory) | Thread checkpoints separate from cross-thread store | No canonical provenance, temporal truth, or tenant boundary | Runtime state consumer only |
| [OpenAI conversation state](https://developers.openai.com/api/docs/guides/conversation-state) | Response chaining, durable conversations, hosted retrieval, compaction | Hosted retention and opaque compaction have different privacy semantics | Execution context only; use `store=false` for sensitive flows |

### Immediate version and security rules

- Graphiti: track v0.29.3; enforce `graphiti-core >= 0.28.2` and Graphiti MCP `>= 1.0.2` because older search filters were vulnerable to Cypher injection.
- Letta: track `letta-ai/letta-code` (v0.30.19 at cutoff), not the legacy `letta-ai/letta` server.
- Cognee: track v1.4.2 and test concurrent `improve`, partial failures, stale locks, and recovery.
- Mem0: target v3 and contract-test actual OSS behavior. Current migration notes say graph memory is Platform-only even though a generic comparison page still suggests an external OSS graph.
- MemPalace: its default branch is `develop`; deploy only a release or immutable image digest.
- OpenAI: verify retention, `store=false`, export/delete, and ZDR behavior for every execution mode used.

MemPalace’s public 96.6% LongMemEval R@5 result measures retrieval recall. An [independent 2026 replication](https://arxiv.org/abs/2604.21284) found most of the result came from verbatim Chroma retrieval; hierarchy and lossy compression performed worse. It is a useful evidence-preservation baseline, not proof that a palace metaphor is a superior memory architecture.

## Target memory model

Canonical object types:

- `Episode`: immutable source event or artifact.
- `Claim`: extracted assertion with valid and transaction time.
- `EvidenceLink`: exact supporting or contradicting source span.
- `IdentityPreference`: explicit, independently governed preference.
- `Procedure`: versioned skill with provenance, preconditions, tests, and lifecycle.
- `Reflection`: derived belief or conclusion, never mislabeled as evidence.
- `ContextCheckpoint`: ephemeral runtime state.
- `Tombstone`: deletion or revocation propagated to every projection.

Required fields include tenant, vault, workspace, subject, actor, source URI and content hash, observed/valid/ingested times, supersession and contradiction links, trust and extraction confidence, classification, consent, ACL, retention, model/schema version, and writer run.

Retrieval authenticates and authorizes before candidate generation; routes lexical, semantic, entity, graph, temporal, episodic, and procedural search in parallel; fuses and reranks by evidence, trust, temporal validity, importance, recency, and diversity; fetches raw spans; compiles cited bounded context; and abstains when evidence is absent.

Context compaction, memory consolidation, and procedural learning are separate jobs. A background consolidator may propose localized claims or skill changes with evidence and tests; it may not globally rewrite memory or promote its own output into trusted truth.

## Evaluation contract

Evaluate provider behavior with Starlight-native private fixtures plus LoCoMo, LongMemEval, BEAM, MemoryAgentBench, and SocialMemBench. Score independently:

- write precision and extraction recall;
- evidence recall/MRR/nDCG;
- answer correctness and citation grounding;
- current-state and point-in-time temporal accuracy;
- contradiction/update behavior;
- identity and group-memory separation;
- selective forgetting and deletion completeness;
- poisoning resistance and zero cross-tenant leakage;
- compaction fidelity and procedural transfer;
- P50/P95 latency, tokens, cost, index size, and recovery time.

Do not publish retrieval-only metrics as intelligence or answer accuracy. A [2026 metric audit](https://arxiv.org/html/2606.22030v2) found a 27.5-point gap between strict token-F1 and a generous LLM judge on identical outputs; judgment methodology is part of the result.

## Promotion order

1. Standardize Starlight contracts and shorten repo entry-point instructions.
2. Stabilize Codex and Claude adapters with isolated worktrees and completion receipts.
3. Evaluate OpenAI Agents SDK or Mastra patterns for the TypeScript experience layer.
4. Use Pydantic AI Harness for Python workers/evals and LangGraph only for deterministic durable flows.
5. Shadow-test Graphiti, Hindsight, MemPalace, Mem0, and Cognee against Starlight-native memory gates.
6. Benchmark Ruflo, OmO, and Omnigent behind quarantined adapters; extract primitives through ADRs only.
