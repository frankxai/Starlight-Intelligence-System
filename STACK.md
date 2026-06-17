# STACK — The Recommended Sovereign Stack

Default choices, not mandates. Adopt what resonates. Every vertical and alliance may override any layer — but every override should be declared in the vertical's `STACK.md`.

## The 10 Intelligence Systems (per MASSIVE_ACTION_PLAN.md, accepted 2026-04-25)

The substrate ships **10 universal Intelligence Systems** that compose for every sovereign person. Two additions promoted from sub-domain to top-level (Code IS, Voice & Video IS); Substrate renamed to **Starlight Orchestrator** at the top because it routes the other nine. Spiritual remains optional/private.

| # | Public name | Premium label | Substrate home |
|---|---|---|---|
| 1 | Self IS | Founder Performance Intelligence | Genius layer + `starlight-genius` agent |
| 2 | Wealth IS | Capital & Deal Intelligence | `verticals/wealth/` · `/wealth-dpi` |
| 3 | Family IS | Family Office Intelligence | `verticals/family/` (was Relational layer; renamed) |
| 4 | Business IS | Executive Operating Intelligence | `verticals/business/` · `starlight-business` |
| 5 | Creator IS | Media & Influence Intelligence | GenCreator + `/creator-pipeline` |
| 6 | Second Brain IS | Private Knowledge Intelligence | `starlight-secondbrain` + Brain Atlas |
| 7 | Code IS | Product & Automation Intelligence | `verticals/code/` (extends `/arco` + `/ao`) |
| 8 | Voice & Video IS | Narrative Media Intelligence | `verticals/voice-video/` |
| 9 | Brand IS | Reputation & Positioning Intelligence | Vision-Brand layer (renamed) |
| 10 | **Starlight Orchestrator** | Private Intelligence Office | `core/orchestrator/` (master layer) |

Health (formerly layer 7) becomes a cross-cutting rhythm rather than a top-level IS — see `docs/ARCHITECTURE.md` § Cross-cutting layers. It still ships with `starlight-embodiment` + `/design-regimen` + `/energy-audit` and remains fully operational; the change is positioning (cross-cutting vs. top-level), not capability.

Domain sub-stacks (e.g., People Intelligence) compose **inside** the 10-IS stack — a sovereign practitioner spawns a domain vertical of 4-7 functional sub-systems via `/spawn-domain-stack` once the universal layers are running.

Domain sub-stacks come in two **shapes**: (a) the default in-repo anonymized forkable scaffold for a private sovereign practice (People / Sound / Crypto); and (b) the **Commons/IS/OS triad** for an *operated public-good initiative* — a free public corpus (Commons), a review-gated MCP + contributor skill pack that serve it (IS-engine), and a productized runtime that consumes them (OS). The triad ships via `/spawn-domain-stack --public-corpus`. Reference instance: **Ocean / Marine Intelligence** (`blue-life-commons` + `marine-mcp` + `marine-agent-skills` + `ocean-intelligence-system`, 2026-06-15) — see `VERTICALS.md` § Ocean Intelligence and `docs/boards/2026-06-15-ocean-marine-substack.md`.

## Starlight Orchestrator subsystems

The Orchestrator is the master routing layer (#10 above). It composes additively — never as a new top-level IS. Subsystems below are slots the Orchestrator may grow into without violating the locked 10-IS taxonomy.

**v8.4 Self-Advancing Visual Composition advancement (2026-06-12):** Visual Intelligence elevated as first-class cross-cutting / Orchestrator Composition Layer (native image/video as memory/LEDGER/palace/attestation modality across all 10 IS; mempalace v2 with visual embeddings + 3D viz; Queen LEDGER artifacts). "Composer" formalized as unifying cross-cutting pattern (agentic coding from Composer 2.5 + music composition + creative synthesis + visual composition). See `docs/strategic/2026-06-self-advancing-visual-composition.md`, `docs/visuals/VISUALS.md` (7 canonical artifacts), Queen v0.2 (closed semi-autonomous loop with Visual Eval + Advancement Ledger + velocity/falsifiers), and updated routing classes (agentic-composer-long, visual-synthesis, parallel-harness-measure). All via Composition Layer precedent (no 10-IS change). Falsifiers and receipts govern promotion.

### Subsystems (planned · sovereign-class)

- **Predictive Layer** — *status: planned · sovereign-class · Sov1*. Forward-prediction mechanism that emits a new `prediction.error` event on the brain event bus when retrieve confidence falls below threshold OR when a planning layer's expected-embedding diverges from the retrieved top-hit embedding by more than a threshold. Lineage: predictive-coding research (Friston 2010, *Nature Rev. Neurosci.*) and the Joint-Embedding Predictive Architecture position paper (LeCun 2022; Meta FAIR reference implementations: [`facebookresearch/ijepa`](https://github.com/facebookresearch/ijepa), [`facebookresearch/jepa`](https://github.com/facebookresearch/jepa)). SIS adopts the **signal**, not the training loop — see `docs/research/2026-05-11-jepa-prediction-extract.md` §4. **Falsifier:** if no SIS surface consumes `prediction.error` by v0.3, this entry MUST be removed.
- Cross-reference: `docs/strategic/2026-05-11-predictive-cognition-substrate-analysis.md` §3 (concept-mapping gap analysis) and `docs/boards/2026-05-11-predictive-cognition-substrate-bundle.md` Proposal S1 (board pre-pass).

Subsystem additions do NOT change the IS count. The 10-IS table above remains the canonical taxonomy. Subsystems are routing-layer internals.

## Composition Layer (substrate primitive, declared 2026-05-17)

A **Composition Layer** is a tier inside a universal IS that owns cross-domain rules above a set of Domain Sub-Stacks composed under that IS. Any universal IS may evolve into a composition layer; doing so does NOT change the 10-IS count — the IS row stays, its operational shape gains a tier.

**Substrate doctrine** (introduced via `docs/boards/2026-05-17-crypto-investment-spawn.md` R1.a close-out, Frank-acked):

A universal IS at row #N may compose over its Domain Sub-Stacks via commands and rules declared at the IS-itself. Composition-layer commands read from sub-vertical outputs and produce cross-domain artifacts (cross-asset portfolio fit, cross-clinical-and-nutrition regimen, cross-product-and-creator pipeline, etc.). The composition layer is **not** a new top-level IS; it is the operational shape of an existing IS that has spawned Domain Sub-Stacks beneath it.

**First reference instance:** Wealth IS at `verticals/wealth/` (declared 2026-05-17). Wealth IS preserves its existing DPI ledger + Thesis engine + Gate ladder framework set as its own commands (`/wealth-dpi`, `/wealth-thesis-review`, `/wealth-gate-progress`) while Crypto Intelligence + Investment Intelligence Domain Sub-Stacks compose under it via explicit `Composes-with: Wealth IS / <framework>` declarations in their SUB-SYSTEMS.md.

**When to declare composition-layer evolution:**

- A universal IS has spawned ≥2 Domain Sub-Stacks beneath it.
- Cross-domain rules emerge that don't belong to any single sub-stack (e.g., cross-asset allocation rules above Crypto + Investment + future Real-Estate IS).
- The IS-itself already had named framework content from prior versions that requires preservation.

**Falsifier:** A composition layer must ship ≥3 cross-domain commands within 30 days of declaration. If `verticals/<is-name>/commands/` is empty at 30 days post-declaration, the composition concept failed for that IS — collapse to ACL-only role (declarative reference, no operational commands).

**Pattern available to:** Self IS, Wealth IS, Family IS, Business IS, Creator IS, Second-Brain IS, Code IS, Voice-Video IS, Brand IS, Starlight Orchestrator. Not all will use it; the pattern is opt-in per IS.

## Design principles

1. **Sovereignty over convenience.** Prefer open protocols, forkable standards, exportable data. No irrecoverable vendor capture.
2. **Composition over replacement.** Every layer is swappable. Memory can move from Notion to a self-hosted alternative without rewriting the agent harness.
3. **Attestation by default.** Every layer participant supports or tolerates "Built on SIP" attribution.
4. **Rate of change tolerance.** Foundations change slowly (file contract, attestation). Harness changes fast (models, agents, tools). Pick layers with the right tempo.

## Layer map

### L0 — File + version control
- **GitHub** (source of truth) — repos named per `VERTICALS.md`.
- Canonical registry file: `arcanea-ecosystem/repos.json`.
- Commit signing encouraged. GPG or sigstore.

### L1 — Models (LLM layer)
- **Primary:** Claude Opus 4.7 (Anthropic) — architecture, canon work, protocol reasoning.
- **Operational:** Claude Sonnet 4.6 (Anthropic) — volume creator work, agent harness.
- **Multi-model composition:** OpenRouter when model diversity buys robustness (e.g., Gemini for long context, GPT for specific tool chains).
- **Grok (xAI):** High-context (200k) excellence/subagent/MCP harness tier for 99% e2e QA, parallel subagent orchestration, repo-mastery + gstack conceptual verification. Complements via src/adapters/grok.ts + core/orchestrator/harnesses/grok/.
- **Offline / sovereignty fallback:** Llama 3.x or Mistral self-hosted for air-gapped canon work.

Stance: Claude is primary because the reasoning quality compounds best with SIP's protocol-heavy workflows. Diversify below the protocol layer, not at it.

### L2 — Memory
- **Intent authority:** Notion (Command Center). The "why" lives here. Command Center DBs: Trinity-Cycles, Decision Log, Vertical Registry, Commitments Ledger.
- **Durable state:** `MEMORY.md` per vertical / alliance, in Git. The "what holds now" lives here.
- **Runtime state:** Supabase Postgres + Row-Level Security. The "what's happening now" lives here.
- **Vector memory:** Supabase pgvector for semantic retrieval across canon and past artifacts.

Stance: Notion for human authority, Git for version-controlled state, Supabase for runtime. Do not collapse these into one system — each has a different rate of change and audience.

### L3 — Agent harness
- **Development:** Claude Code for protocol-layer work. Skill files + slash commands resolve here first.
- **Production:** Anthropic Agent SDK (TypeScript / Python) for deployed agents.
- **Orchestration:** Custom — prefer `AGENTS.md`-defined voices over opaque multi-agent frameworks. Luminor Board pattern for high-stakes pressure-testing.
- **MCP:** Official MCP SDK. 31-tool `arcanea-mcp` is the reference; vertical MCPs follow the same shape.

Stance: Keep the harness thin. The power is in the file contract and the command taxonomy, not in an agent framework.

### L4 — Infrastructure
- **Frontend:** Vercel + Next.js for web surfaces (arcanea.ai, frankx.ai, starlightintelligence.org).
- **Backend / auth / DB:** Supabase.
- **Edge / proxy:** Cloudflare for DNS + DDoS + Workers where latency matters.
- **Automation:** n8n self-hosted on Railway for cross-service workflows.

### L5 — Distribution
- **Long-form:** GitHub Pages / Next.js-rendered canonical docs at each vertical's domain.
- **Creator distribution:** Postiz (self-hosted) + Blotato — multi-platform orchestration.
- **Newsletter:** choice left to vertical (FrankX uses its own stack).
- **Commerce:** LemonSqueezy for digital product launches. Gumroad discouraged — SIP artifacts should not be listed there by default (thin positioning risk).

### L6 — Attestation + audit
- **Primary:** `/sip-attest` command generates the Built on SIP block at artifact ship time.
- **CI integration:** GitHub Actions hook runs `/sip-attest` on release tags; fails the build if attestation is missing from cross-node artifacts.
- **Canon validation:** vertical-specific MCP tools — e.g., `arcanea-mcp.canon-validate` for Arcanea canon (Guardian / Vel'Tara / Hz). Substrate does not mandate canon validation; verticals that import canon adopt their canon-source's validator.
- **Integrity audit:** `/openclaw-audit` for high-stakes releases (security, open/closed rulings).

## Opinionated defaults

- **Language for agent / script code:** TypeScript primary, Python when the ecosystem demands it (ML, data).
- **Config format:** YAML for human-facing config (`.arc`, `.nea`), JSON for machine-only (MCP declarations, API payloads).
- **Markdown flavor:** CommonMark + GFM tables. No proprietary extensions.

## Refresh cadence

- **L0–L1:** reviewed annually. Model of choice may shift with generational releases.
- **L2:** reviewed semi-annually. Memory architecture is load-bearing.
- **L3:** reviewed quarterly. Agent harness evolves fast.
- **L4–L5:** reviewed as vendor terms or performance demand.
- **L6:** reviewed per SIP major version.

---

**Built on SIP** · v1 · MIT
