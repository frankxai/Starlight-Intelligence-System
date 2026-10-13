# Convergence plan brief — portable agent prompt (v3)

**Status:** reusable brief, 2026-09-21. Operational tier. Paste into any harness (Claude Code, Codex CLI, Grok Build, Antigravity, Cowork) working in `Starlight-Intelligence-System` with the sibling repos checked out beside it. Parameters in `{braces}`. The v2 run of this brief produced `docs/strategy/2026-09-21-convergence-v2.md`; the next run produces v3 and must beat it.

**Why a file, not a chat message.** A brief that lives in the repo is versioned, diffable, and the same in every harness. It is the spec gate of the ADLC applied to strategy itself: the plan is an artifact with a receipt, so the brief that produced it must be one too.

---

## 0. Fixed points (not up for redecision in this run)

- **Foundation: receipt-first.** The signed run receipt (`starlight.run-receipt.v1`, `protocol/run-receipt.v1.schema.json`, `src/run-receipt.ts`) is the product. Operator and memory are how receipts are produced and kept. Do not reopen this; do stress it with falsifiers.
- **Substrate untouched.** `SIP.md`, `SIS.md`, `ALLIANCE.md`, `STACK.md`, `VERTICALS.md`, `VOICES.md`, `REGISTRY.md`, the sovereignty clause, the file contract and the vault taxonomy do not change in this run. A direction that needs them writes the Board proposal and marks the layer blocked on Board.
- **Voice.** `CREATOR.md` and `docs/strategy/narrative.md` govern every public sentence. Sentence case. No adjective without a file or a receipt behind it.
- **Never push to any production main.** Branch, draft PR, keep it green.

## 1. Read first, in this order

1. `docs/strategy/2026-09-21-convergence-v2.md` — the current plan (receipt-first, 21 dimensions, three contracts, capability map, horizons, drift ledger v2). This is the floor.
2. `docs/strategy/2026-09-21-great-convergence.md` — v1: nine layers, ADLC, cost doctrine, seats, design authority; appendix A 44-repo survey; appendix B dated facts.
3. `docs/strategy/convergence-map.html` — 66 nodes with live / partial / planned / rejected.
4. `docs/strategy/narrative.md`, `docs/receipts.md`, `protocol/run-receipt.v1.schema.json`, `src/run-receipt.ts`, `src/mcp-server-v01.ts` (the `sis.receipt.*` tools).
5. `docs/hackathons/2026-09-23-accel-ai-innovate-amsterdam.md`, `docs/hackathons/desk-prototype.html`.
6. `SOUL.md`, `STACK.md`, `CLAUDE.md`, `AGENTS.md`, `CLAWS.md`, `DELIVERY.md`, `docs/graph-engineering/CONTRACT.md`, `commands/starlight-queen.md`, `agents/AGENT_REGISTRY.md`, `console/README.md`, `cockpit/README.md`, `.claude/commands/starlight-board.md`, and the three Board records that bind this work: `docs/boards/2026-09-19-sip-graph-signed-receipts.md`, `docs/boards/2026-08-12-starlight-estate-convergence.md`, `docs/boards/2026-06-10-starlight-queen-verdict.md`.
7. Siblings beside this repo: `starlight-intelligence-web` (`lib/run-receipt.ts`, `app/verify`, `app/receipts`, `lib/trusted-keys.ts`), `gencreator.ai` (`lib/creator-pack-contract.ts`, `lib/agent-runtime-contract.ts`, `design.md`, `taste.md`), `frankx.ai-vercel-website` (`CLAUDE.md`, `design.md`, `taste.md`), `arcanea-ai-app` (`DESIGN.md`, `TASTE.md`), `agentic-creator-os` (higgsfield-operator and suno skills), `claude-skills-library/packs/web-excellence`.

Verify every "live" claim against a file. Where you cannot verify, write "unverified".

## 2. The mandate

The current plan chose one path per layer. This run shows the option space and then chooses harder. For each of the nine layers (surfaces, product spine, operator, ADLC, runtime, harness, memory, models and cost, design) and for the demo, produce exactly three directions: the current choice, one more radical, one more conservative. For each direction:

- what it makes possible that the others cannot;
- what it costs, in euros per month at three scales (one founder, one cohort of forty, one thousand estates) with the arithmetic shown;
- what it forbids;
- its falsifier: the observation that would prove it wrong, with the date by which the observation must exist;
- which `SOUL.md` invariant it stresses (1 sovereignty, 2 attestation, 3 MIT, 4 sovereignty clause, 5 abundance toward alliances, 6 voice);
- how it produces or consumes run receipts (a direction that cannot produce a receipt is not eligible).

Then choose, and say why the losers lost.

Foundations that must be argued, not listed:

- **Memory.** JSONL vaults plus sqlite-vec, versus an event-sourced log with projections rebuilt per surface, versus a typed knowledge graph with promotion rules as first-class objects. Place AgentDB (derived learning index only), Supabase pgvector with RRF (shared runtime state), mem0 (partner adapter), the memory palace, and the receipts ledger in each. Pinecone stays rejected unless invariant 1 is defeated in writing.
- **Runtime.** AI SDK 6 ToolLoopAgent plus Workflow Development Kit, versus a self-hosted durable runtime on Railway, versus an actor model where every seat is a long-lived process with a mailbox. Evaluate against Nebius Token Factory as the open-model engine, Eve as the GenCreator provider, MCP as the agent-facing API, and the receipt as the unit every runtime must emit.
- **Operator.** Queen plus Board plus council seats, versus a market (seats bid for envelopes with budgets drawn from receipts), versus a constitution (rules compiled from `SOUL.md` and the Board record that gate every route automatically). Say what generals, HX and AX directors, producers and the Queen's board mean in each.
- **ADLC.** The seven gates, versus a continuous eval-driven flow with no phases, versus a spec-driven validation harness where the spec is executable. Cite the 2026 papers in v1 appendix B and add at least three more with arXiv ids.
- **Models and cost.** The cascade, versus per-creator LoRA fleets, versus a router trained on our own receipts. Include speculative decoding, batch, prefix caching where discounted, distillation. Every option prints euros per artifact; the receipt is the measurement.
- **Design.** Liquid objects on the Explorer's tokens, versus one estate-wide design system package with four registers, versus surface-native systems sharing only the kernel. The bar is Apple, Linear, Vercel, Stripe, Anthropic. Reject anything that reads as generated.
- **Surfaces.** Four brand sites plus PWA plus a desktop cockpit, versus one operator app that projects every brand, versus headless (everything through MCP, sites thin). Include mobile, desktop, local, multi-tenant SaaS, and where the verifier lives in each.
- **Product spine.** Desk → Constellation → Renderers → Publish, versus a marketplace of receipts (founders buy proven briefs and constellations, each with its receipt), versus the estate factory as the product. Higgsfield, OpenArt and Suno are renderers only.
- **Demo.** The hackathon Desk with room mode, versus a live estate build in front of the room, versus a receipt anyone can verify from their phone in under a minute.

Beyond the nine layers, cover the twelve dimensions in the current plan's section 3 (economics, trust and provenance, regulation and residency, compute sovereignty, data flywheel and consent, interop standards, distribution through agents, voice/video/spatial, physical estate, education and community, observability and cost, portfolio and risk) at one paragraph each, receipt-first.

## 3. Method

- Pressure-test the final choice per layer with the five `/starlight-board` vectors (Sovereign, Seer, Harmonizer, Strategist, Verifier) and the Overseer, in the exact output shape of `.claude/commands/starlight-board.md`. Record the recommendation per layer: PROCEED, REVISE or STOP. If two vectors say STOP, REVISE is the ceiling.
- Use Context7 for any library cited (AI SDK, Workflow Development Kit, Supabase, mem0, AgentDB, sqlite-vec) and web search for models, prices, papers and standards. Date every external fact. Keep a provenance note per fact: official page, third party, or search summary.
- Name the irreversible decisions and the reversible ones. Reversible ones ship first.
- Every horizon row (day, week, month, quarter, year) names the repo or PR it lands in, the gate, and the owner seat.

## 4. Deliverables

1. `docs/strategy/{date}-convergence-v{n}.md` — decision first; the nine layers with three directions each and the choice; the twelve dimensions; Board verdicts; horizons at five scales with euros at three scales; a section "What v{n-1} got wrong" with at least five entries; a drift ledger with repo, horizon, gate, owner seat.
2. `docs/strategy/convergence-map-v{n}.html` — the option space, not only the chosen path: each layer lists three directions with the chosen one lit; the detail panel shows cost at three scales, falsifier, Board verdict, and the receipt it produces. Explorer tokens (void `#060609`, Newsreader, Inter, JetBrains Mono; violet `#a78bfa`, cyan `#67e8f9`, emerald `#34d399`, amber `#fbbf24`, rose `#fb7185`). Reduced motion honoured. Holds at 375. Illustrative numbers labelled.
3. One high-fidelity prototype for the single most consequential new move, as one HTML file in `docs/strategy/`, in the style of `docs/hackathons/desk-prototype.html`, with a screenshot pass at 375 and 1440 recorded in the PR.
4. A facts appendix with dates and sources, and a verification ledger of every "live" claim checked.

## 5. Acceptance

A reviewer with the domain can read the plan, disagree with a choice, and find the falsifier that would settle it, without asking the author anything. Every euro figure shows its arithmetic and its price source. Every "live" claim names a file. Every direction produces a receipt or is marked ineligible. `node --check` passes on every HTML file's script. The editorial contract CI passes on the PR.

## 6. Running this brief in each harness

| Harness | How |
|---|---|
| Claude Code | `claude` in the repo root, paste sections 0 to 5, or `/superintelligence` with this file as the argument |
| Codex CLI | `codex` reads `AGENTS.md`; paste this file as the first message |
| Grok Build | reads `GROK.md` or `AGENTS.md`; paste sections 0 to 5 |
| Antigravity | reads `AGENTS.md`; open this file and run "execute the brief" |
| Cowork | attach this file and the four read-first docs; the session runs read-only research, then hands drafts to a coding harness for the HTML deliverables |

Whatever the harness, the run ends by issuing a run receipt for itself with `sis.receipt.issue` (`run.kind: "strategy.plan"`, subject = the plan file's sha256) and citing the receiptId in the PR body.

---

Built on SIP.
