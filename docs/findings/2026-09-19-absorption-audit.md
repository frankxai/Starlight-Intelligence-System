# Finding — the fleet reports coverage it does not carry

**Date:** 2026-09-19 · **Severity:** high · **Owner:** `agent:starlight-caio` (agent admission)
**Machine-checked by:** `scripts/estate-graph.mjs` INV-10 and INV-11

---

## The measurement

151 agent cards under `agents/`. Each card's body normalised to 5-word shingles, compared pairwise by Jaccard.

| | |
|---|---|
| Cards scanned | **151** |
| Cards in a ≥85%-identical cluster | **61 (40%)** |
| Clusters | **14** |
| Adapter cards naming an upstream absent from `context/empire/upstreams.json` | **7** |

Reproduce: `node scripts/estate-graph.mjs`

## The sharpest case

Ten `starlight-adapter-*` cards, **125 lines each**:

```
agno · autogen · crewai · dify · hermes · langgraph · mastra · ollama · openai · paperclip
```

CrewAI orchestrates role-playing crews. LangGraph traces cyclical state graphs. They are architecturally
opposite. Their cards differ by **five lines**:

```diff
- # Starlight CrewAI Orchestrator
+ # Starlight LangGraph Router
- > Formats goal prompts to invoke CrewAI role-playing agents.
+ > Traces cyclical agent pathways and state branches in LangGraph.
- **Activates:** Context relates to Partner operations, crewai orchestrator tasks...
+ **Activates:** Context relates to Partner operations, langgraph router tasks...
- - Prompt contains keywords: *crewai orchestrator*, *crewai, orchestrator*, *partner*
+ - Prompt contains keywords: *langgraph router*, *langgraph, router*, *partner*
```

Everything else — Capabilities, Reasoning Protocol, the lot — is byte-identical. All ten share the generic
`INGEST → ANALYZE → FORMULATE → EXECUTE` block and the same four capabilities ("Domain Assessment", "Context
Compilation", "Execution Routing", "Validation Check").

**1,250 lines of registry carrying zero knowledge of any of those ten systems.**

Seven of the ten — agno, autogen, crewai, dify, hermes, ollama, **paperclip** — name systems that are not in
`context/empire/upstreams.json` at all. Two registries that should agree, and nothing was checking.

## The other thirteen clusters

The pattern is not confined to adapters.

| Cluster | Cards |
|---|---|
| Infrastructure ops | 7 — backup · cdn · cluster · cost · deploy · hardware · logs |
| Research fetchers | 6 — arxiv · biorxiv · openalex · pmc · distill · crypto-research |
| Marine | 6 — acoustics · coastal · dive · pollution · vessel · water |
| Health | 5 — diet · sleep · stress · training · health-is |
| Space | 5 — debris · downlink · orbit · payload · telemetry |
| Distribution | 5 — instagram · linkedin · newsletter · tiktok · x |
| Asset generation | 4 — higgsfield · midjourney · nano-banana · video-assembler |
| Longevity | 3 — biomarkers · research · supplements |
| Legal ×3, astronomy ×1, research-format ×1 | 2 each |

Separately: **15 cards have no Capabilities section at all**, including all five `sis-extractor-*`, all seven
`starlight-energy-*`, the Evaluator, and the Voice Operator.

## Why this happened

Generating a card is cheap. Reading a codebase is expensive. Absent a gate, the cheap thing wins and the
registry inflates. Nothing in the estate distinguished *registered* from *known*, so "144 agents" became a
number that could only grow.

This is not laziness. It is a missing contract, and the fix is a contract.

## What this means for absorption

**The estate does not have an absorption gap. It has an absorption-theater problem.** Absorbing more upstreams
before fixing the inbound path produces more stubs at a higher rate.

The order is therefore: gate first, then absorb.

- **Gate, shipped:** `INV-10` (near-duplicate cards) and `INV-11` (adapter naming an untracked upstream) in
  `scripts/estate-graph.mjs`. Both error-severity; the build fails.
- **Contract, shipped:** [`claude-skills-library/ABSORPTION.md`](https://github.com/frankxai/claude-skills-library/blob/58437dbdee3928415f9a9b7f740c06a5a1c38bdb/ABSORPTION.md)
  and `scripts/absorb.mjs` — four gates that refuse rather than warn. Gate 3 (distinctness, ≥85% Jaccard)
  makes this exact duplicate class un-creatable on the way in.
- **Registries split:** `context/empire/upstreams.json` stays the **watch list** (15 entries, adoption states,
  a real policy). `ABSORBED.md` in the skills library is the **took list**. Watching is not absorbing, and the
  two files should be able to say so.

## The three-way distinction the estate was collapsing

| Move | Means | Right when |
|---|---|---|
| **Depend** | Pin it. Their code, their cadence. | It is a library and works as one. |
| **Absorb** | Take the pattern, re-express it here, carry provenance and license. | The value is encoded expertise. |
| **Adapt** | A card that routes to a system you run. | You actually run it. |

All ten adapter cards are in the third column. None of them earns it.

## Disposition — Frank's call, not an agent's

Three options per cluster. An agent does not delete a registered agent.

1. **Earn it.** Someone who runs that system writes a real card. Realistic for `langgraph`, `mastra`,
   `openai` — all three are in the upstream registry and under evaluation.
2. **Collapse it.** Seven ops cards become one `starlight-ops` with a capability matrix. Six marine cards
   become one. This is the right answer for most of the thirteen non-adapter clusters: they are *parameters
   of one agent*, not agents.
3. **Delete it.** For the seven adapters naming untracked systems, absent anyone running them.

The headline number moves either way. `metric:fleet-registration-drift` (owned by CAIO) exists to track it,
and "144 agents" should be restated once the disposition lands — `metrics/METRICS_TRUTH.md` applies to our own
counts before it applies to anything public.

Built on SIP.
