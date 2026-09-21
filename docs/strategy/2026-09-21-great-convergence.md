# The great convergence — one substrate, one operator, one product spine

**Status:** strategy and decision record, 2026-09-21. Operational tier. Substrate-class items are flagged for `/starlight-board` before any tag.
**Companion:** `docs/strategy/convergence-map.html` (interactive map; every node carries the repo or file that proves its status).
**Hackathon stage one:** `docs/hackathons/2026-09-23-accel-ai-innovate-amsterdam.md` plus `desk-prototype.html`.
**Sources for external facts:** the dated technical brief in appendix B. Nothing about a vendor is asserted here without a source there.

---

## 0. The decision in one paragraph

The estate stops being forty-odd repos and fifty-nine Vercel projects that share a founder, and becomes one system with three fixed points. **One substrate:** SIS vaults, receipts, work-graph ledger, SIP attestation. **One operator:** Frank holding the irreversible, the Starlight Queen routing, the Board gating substrate change, the Console and cockpit as the screen. **One product spine:** a founder question becomes a cited brief, a brief becomes a constellation of typed artifacts, artifacts render behind adapters and publish behind an approval receipt. Every surface (frankx.ai, gencreator.ai, starlightintelligence.org and .ai, arcanea.ai, the PWA shells, a future desktop cockpit, every MCP client) is a projection of that one loop over that one memory. Thinking runs on open weights on Token Factory with the cascade as the cost doctrine. Design is the highest bar we own, enforced by the pinned kernel and the web-excellence gate. The agentic development life cycle replaces the SDLC with seven gates and one learning loop.

## 1. Fixed points and what they forbid

| Fixed point | Holds | Forbids |
|---|---|---|
| One substrate | Six JSONL vaults as truth; sqlite-vec sidecar and Supabase pgvector as rebuildable or shared indexes; one work-graph ledger per campaign; SIP receipts on every artifact | A graph per agent, a hosted vector DB as source of truth, a third orchestrator, a second memory product |
| One operator | Frank signs the irreversible; Queen routes typed envelopes; Board gates substrate change before tag; Console and cockpit are the screen | Agents merging to production main, publishing, paying, rotating keys; substrate change shipped under `/superintelligence` without Board |
| One product spine | Desk → Constellation → Renderers → Publish, receipts at every stage, truth classes on every artifact | Chat wrappers, per-surface pipelines, generators as the engine, pre-cached output shown as live |

These three are operational reformulations of `SOUL.md`. Sovereignty before convenience is why the vault is JSONL and Pinecone is rejected. Attestation is not decorative is why the receipt is the product. The voice is why this document has no adjectives it cannot prove.

## 2. Architecture: the nine layers

Read top to bottom as "what a founder touches" to "what holds it up". The map shows the same nine with live wiring.

1. **Surfaces.** Four brand surfaces on Vercel plus community, PWA shells and a planned desktop cockpit. Each has a pinned design contract and a brand pack. No surface owns state the others cannot read.
2. **Product spine.** Desk (stage one, 23 Sept), Constellation (CreatorPack, truth classes), Renderers (Higgsfield, OpenArt, Suno behind adapters), Publish (research hub, schema, llms.txt, RSS, approval receipt), Room mode (shared vault, QR).
3. **Operator.** Frank, Queen, Board, the seven council seats and the leadership tier of the registry (this is what "generals" means here: named seats with domains, not a rank), HX and AX directors as two accountabilities to add to the registry, Claws with Sentinel always on, Console and cockpit.
4. **ADLC.** Spec → Route → Build → Prove → Gate → Ship → Learn. Section 4.
5. **Runtime.** AI SDK 6 (ToolLoopAgent, Output.object, AI Gateway with fallback order), the openai-compatible provider pointed at Token Factory, Workflow Development Kit for durable multi-step runs with Sandbox as a step, Eve as the Companion runtime provider, MCP servers as the agent-facing API, Railway for what must not sleep, Vercel for surfaces and previews.
6. **Harness.** AGENTS.md as the shared instruction file across Claude Code, Codex CLI, Grok Build and Antigravity; CLAUDE.md, GROK.md, GEMINI.md as supplements; SOUL.md as the drift test; SKILL.md packs installed by script; the /si cognition router as the dispatcher. Kimi is the next lane.
7. **Memory.** Vaults, sidecar, palace, Supabase for shared and multi-tenant state, work-graph ledger. AgentDB allowed only as a derived learning index. mem0 as an optional adapter for partner estates. Pinecone rejected.
8. **Models.** Claude at the protocol layer where reasoning compounds. Open weights below it: DeepSeek V4 for synthesis, Nemotron 3 Nano for extraction, Qwen3-Embedding for recall, a second family as judge, Kimi K3 and GLM-5.3 as swappable lanes. Model IDs are config strings.
9. **Design.** The pinned kernel, four brand packs, design.md and taste.md per repo, the web-excellence pack with its hooks and CI lint, the two-track motion system, and the liquid-object bar the Desk prototype sets.

## 3. Runtime decisions, each with the reason

- **AI SDK 6 is the agent runtime for every surface.** ToolLoopAgent gives the loop, `needsApproval` gives the human gate for free, Output.object gives typed artifacts, Gateway gives provider fallback by string. One `createOpenAICompatible` call with the Token Factory base URL makes the whole cascade config.
- **Workflow Development Kit runs anything longer than one request.** Constellation runs, room-mode queues, LoRA jobs, publish pipelines. Each step is an isolated route with recorded I/O and deterministic replay; there is no execution-time limit. Sandbox as a serializable step is how coding agents get a durable VM lifetime.
- **Railway runs what must not sleep.** Stateful MCP over SSE, n8n, private networking between workers. Vercel fronts; Railway keeps the daemons. This is STACK.md L4, unchanged.
- **Supabase is shared runtime state, never the founder's private vault.** Postgres with RLS, hybrid search with RRF over full text and pgvector, Queues on pgmq, pg_cron and Edge Functions for background work. Multi-tenant estates and the GenCreator members table live here.
- **Nebius Token Factory is the open-model engine.** EU-hosted, OpenAI-compatible, serverless fine-tuning and a discounted batch API confirmed. Prompt caching is not shipped there yet; the cascade is designed so caching is a later win, not a dependency. When it lands, prefix reuse across the six stages is the next cost step.
- **Eve stays the Companion provider name.** The Token Factory cascade becomes a second provider behind the same AgentRuntime contract, with the same start, result, resume, approval and usage receipts. Two providers, one contract, switch by config.

## 4. ADLC: the agentic development life cycle

The SDLC assumed a human wrote every line and a review caught the rest. The 2026 literature (appendix B, section G) converged on the same shape we already run: a six-layer reference architecture, spec-driven validation for multi-agent systems, and AI-specific gates inside existing ceremonies. Ours has seven gates and one loop.

| Gate | Artifact in | Artifact out | Who may not self-grade |
|---|---|---|---|
| Spec | Ask | `/spec` or a typed Foundry task envelope with required, preferred, forbidden capabilities | The agent that will build it |
| Route | Envelope | Queen route receipt: permission, autonomy, agent-necessity, evidence gates | The lane that wants the work |
| Build | Route receipt | Branch per agent, worktree for heavy parallel work, staged by pathspec, one CLI per lane | Nobody grades here; only the next gate |
| Prove | Branch | `/prove` evidence receipt, proving ground and arena runs, recall eval in CI | The builder |
| Gate | Evidence | web-release-gate audit with screenshots at 375, 768, 1440; editorial and design contract CI; lore lint; Board for substrate | The builder and the router |
| Ship | Green PR | Draft PR, CI, Vercel preview, human marks ready and merges, Vercel deploys main | Any agent (production main is never pushed directly) |
| Learn | Receipts | `/evolve` doctrine patches and routing deltas, Queen ratify with A1 and A2 gates | The Queen alone (Board ratifies) |

Three properties make it a life cycle rather than a checklist. Every gate emits a receipt, so the ledger is complete. The work-graph knows what is legal next, so no gate can be skipped by a confident agent. Learn feeds Route, so the routing table is the compounding asset.

## 5. Cost doctrine (what we copy from the labs)

- **Cascade by work type.** Small model where the work is mechanical (extraction, classification, dedupe), large where it is judgment (synthesis), a different family as judge. Nemotron 3 Nano at 3B active, DeepSeek V4 for synthesis, GPT-OSS or Nemotron Super as judge.
- **Sparse attention and MoE are the provider's job; ours is to send fewer tokens.** DeepSeek V4's sparse attention and Kimi K3's delta attention make 1M contexts cheap on their side. On ours: retrieve six sources not sixty, extract claims before synthesis, never paste a vault into a prompt.
- **Prefix caching where discounted.** DeepSeek, Anthropic, OpenAI and Google discount cache hits; Nebius does not yet. Structure prompts as stable prefix plus variable tail now so the discount applies the day it ships.
- **Batch for anything not real-time.** Constellation drafts, evals, embeddings backfills. Token Factory's batch discount applies.
- **LoRA to shrink the model that carries a format.** Sixty published briefs teach a small Qwen3 the six-section format; the large model is then only paid for judgment.
- **Every run prints its cost.** The receipt is the cost control. A pipeline that cannot print euros per artifact is not finished.

## 6. Team: seats, not roles

The estate already has 144 registered agents and seven council seats. Convergence adds accountability, not headcount.

| Seat | Human | Agent counterpart | Owns |
|---|---|---|---|
| Sovereign | Frank | Starlight Queen | The irreversible; substrate-class merges; approvals |
| Board | Frank plus named advisors when convened | `/starlight-board` vectors | Pre-tag gate on substrate change |
| Architecture (CTO) | Frank | Architect seat | Runtime, memory, harness decisions above |
| Product (CEO lens) | Frank | Prime seat | The spine, the horizon table, what ships when |
| Marketing (CMO lens) | Frank | Creator IS agents, GenCreator Companion | Constellation, publish, AEO and SEO |
| Design (CDO) | Frank, HX director to name | Weaver seat, design-verifier agent | Kernel, packs, taste, the liquid-object bar |
| AI (CAIO) | Frank | Navigator seat, Queen learn loop | Model lanes, cost doctrine, evals |
| HX director | to name | design agents | Every surface a person touches, against design.md and taste.md |
| AX director | to name | Sentinel seat, harness adapters | Every surface an agent runs in: file contracts, tools, receipts |
| Producers | cohort and alliance operators | Claws | Room mode, workshops, estate commissioning |

One person holds several seats today. That is fine. What matters is that each decision is logged under the seat that owns it, so the seat can be handed to a person or an agent later without re-deciding the doctrine.

## 7. Design standard: the highest bar we own

- **Authority order is fixed and pinned.** The kernel in `starlight-design-intelligence`, pinned by commit in each repo's `.starlight/design-contract.json`; then the repo's design.md and taste.md; then channel contracts; then the live implementation as evidence only. When implementation and contract disagree, fix the implementation.
- **Four registers, one kernel.** FrankX: obsidian, emerald and cyan, restraint. SIS: void, JetBrains Mono, violet and cyan. GenCreator: paper, one spot colour, Instrument Serif, sentence case. Arcanea: teal, cosmic blue, gold, Geist. A surface never borrows another's register.
- **The bar is Vercel, Linear, Stripe, Apple Pro pages, Anthropic, Ableton.** Restraint, density without overwhelm, motion that is structural. The reference list in FrankX taste.md applies to every surface.
- **Liquid objects.** Interface elements that behave like objects with material and momentum: the printed receipt, the graph node that blooms, the constellation card. Apple-grade physics on the few things that deserve it, stillness everywhere else. Two motion tracks: Framer for micro-interactions and one hero moment, GSAP with ScrollTrigger for scroll choreography, sixty frames, deliberate reduced-motion fallback, `domAnimation` never `domMax`.
- **Gate, not opinion.** The web-excellence pack's hooks fire on the first UI edit and block a stop without an audit; CI lints newly added lines; screenshots at three widths are committed as evidence; no self-assigned scores. `design.md` and `taste.md` outrank every skill.
- **Copy is design material.** Sentence case, no prestige words, no invented claims, the editorial contract per brand. The editorial CI runs on every PR.

## 8. Surfaces and how they interconnect

| Surface | Role | Reads | Writes | Ships through |
|---|---|---|---|---|
| starlightintelligence.org | Open protocol, Explorer, research, public vaults | metrics ledger, public vault, palace | nothing | `site/` on Vercel |
| starlightintelligence.ai | Product: Desk, operator views | Desk vault, ledger, receipts | briefs, atoms, receipts | Vercel project, 23 Sept |
| gencreator.ai | Creator Mission, CreatorPack, Companion, research hub | Supabase members, packs, Desk briefs | constellations, approvals, published MDX | Vercel, fra1 |
| frankx.ai | AI Architect trunk, blog, research, products | published research, receipts for proof | nothing agentic in production yet | Vercel, main deploys |
| arcanea.ai | Creative universe, design system, canon | canon vault, lore gate | canon through `/lock-decision` only | Vercel, monorepo |
| Community, PWA, desktop cockpit | Participation, mobile, operator desk | the same vault and ledger | packets, questions, lane actions | Vercel; cockpit local |
| MCP clients (Claude Code, Codex, Grok, Antigravity, Cowork, partner Jarvis-class agents) | Agent-facing surface | SIS, cockpit, marine, arcanea MCP tools | memory atoms, dispatches | local and Railway |

Interconnection is the memory and the receipts, not shared UI code. A brief written on the Desk is readable from gencreator.ai's constellation, visible in the Console graph, and citable on frankx.ai because all four read the same vault and verify the same receipt.

## 9. Horizons

| When | Ships | Where it lands | Gate |
|---|---|---|---|
| **23 Sept** | Desk stage one; constellation text artifacts on Token Factory; Flux cover; work-graph ledger on the operator screen; stretch Higgsfield clip | starlightintelligence.ai preview, hackathon PR | day plan quality bar |
| **Week after** | Publish adapter to gencreator.ai with schema, llms.txt, RSS behind the approval receipt; Suno and OpenArt adapters; Console reads the Desk vault; NebiusEmbeddingProvider merged | PRs in SIS and gencreator.ai | web-release-gate, editorial CI, Board if the vault contract changes |
| **October** | Token Factory cascade as a second AgentRuntime provider behind the Eve contract; WDK-backed constellation runs; room mode as a cohort feature; HX and AX seats added to the registry | gencreator.ai, SIS registry | Board for the registry; ADR in gencreator |
| **Q4** | Desktop cockpit shell over Console and lanes; Kimi lane in the router; LoRA'd brief and post models per creator; frankx.ai research hub consumes Desk receipts as proof objects | cockpit, SIS, frankx.ai-vercel-website | homepage preservation contract for frankx; Board for substrate |
| **Standing** | Every estate commissioning (DELIVERY §7) provisions this exact loop as the client's operator; Trinity is instance one | estate-provision | Board per estate |

Production main on any surface is reached only through its own PR gate. This document and the map ship now on the SIS branch; each horizon row names its PR.

## 10. What this document does not do

It does not change the substrate. SIP, the sovereignty clause, the file contract and the vault taxonomy are untouched. It does not adopt a framework: no claude-flow as orchestrator, no GraphRAG as memory, no hosted vector DB as truth. It does not promise numbers: every figure in the prototype is labelled illustrative until a receipt replaces it.

---

## Appendix A. Repo inventory (survey 2026-09-21)

_Appended from the automated survey below._

## Appendix B. Dated technical brief (external facts, 2026-09-21)

Compiled from Context7 and public sources on 2026-09-21. Versions and dates are as found; re-verify before quoting publicly.

- **AI SDK 6** (npm `ai`, major released May 2026): `ToolLoopAgent` with `stopWhen` and `needsApproval`; `Output.object` for structured output; AI Gateway routing by `provider/model` string with `providerOptions.gateway.order` fallback; `@ai-sdk/openai-compatible` with a custom `baseURL` for Token Factory. Sources: vercel.com/blog/ai-sdk-6; github.com/vercel/ai (openai-compatible README, gateway and structured-data docs).
- **Workflow Development Kit** (Vercel, open source, public beta): each step an isolated route with recorded I/O, deterministic replay, no execution-time limit, Sandbox as a serializable step. Sources: vercel.com/blog/a-new-programming-model-for-durable-execution; workflow-sdk.dev.
- **Supabase**: hybrid search as two CTEs (tsvector plus pgvector) fused by RRF with tunable weights and `rrf_k`; Queues on pgmq, pg_cron, pg_net, Edge Functions for background jobs. Sources: supabase.com/docs/guides/ai/hybrid-search; supabase.com/blog/processing-large-jobs-with-edge-functions.
- **Railway**: long-running workers, SSE MCP, private networking; usage-based on a small base plan. Sources: vercel.com/kb/guide/vercel-vs-railway; getdeploying.com/railway-vs-vercel.
- **mem0** v2.0.7 (2026-06-17): OpenAI-compatible drop-in client; self-hosted server API differs from hosted. **AgentDB** (ruvnet): learning retrieval index with feedback on used results. **Pinecone**: repositioned around Nexus. Local sqlite-vec covers small to medium single-tenant corpora. Sources: docs.mem0.ai; github.com/ruvnet/agentdb; enterprisetimes.co.uk (Pinecone, 2026-05-04).
- **Models**: DeepSeek V4 Pro 1.6T/49B active and Flash 284B/13B, sparse attention, 1M context, Nebius pricing published; Kimi K3 2.8T/104B active, native vision (2026-07-16); GLM-5.3 (2026-08-14); Qwen3.5 multimodal 1M context; Nemotron 3 Nano, Super (2026-03-11), Ultra (2026-06-04) with data and recipes released. Sources: morphllm.com; openrouter.ai; nvidianews.nvidia.com.
- **Token Factory**: serverless fine-tuning and batch API with discount confirmed; prompt caching an open feature request. Sources: nebius.com/services/token-factory; ideas.nebius.com.
- **Coding CLIs**: Codex CLI v0.155.0 (2026-09-17) reads AGENTS.md; Antigravity 2.1.1 (2026-06-22) with a five-agent manager and verifiable artifacts; Grok Build open-sourced July 2026, eight subagents, 2M context, reads AGENTS.md; Kimi CLI at parity. Sources: gradually.ai; marktechpost.com; codeagentswarm.com; blog.arcbjorn.com.
- **Agentic SDLC**: arXiv 2604.26275 (six-layer reference architecture, A-SDLC), 2606.15283 (pragmatic path), 2606.30546 (MAS-Lab spec-driven validation), 2606.04967 (process taxonomy).

Built on SIP.
