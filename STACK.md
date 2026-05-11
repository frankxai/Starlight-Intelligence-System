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

## Starlight Orchestrator subsystems

The Orchestrator is the master routing layer (#10 above). It composes additively — never as a new top-level IS. Subsystems below are slots the Orchestrator may grow into without violating the locked 10-IS taxonomy.

### Subsystems (planned · sovereign-class)

- **Predictive Layer** — *status: planned · sovereign-class · Sov1*. Forward-prediction mechanism that emits a new `prediction.error` event on the brain event bus when retrieve confidence falls below threshold OR when a planning layer's expected-embedding diverges from the retrieved top-hit embedding by more than a threshold. Lineage: predictive-coding research (Friston 2010, *Nature Rev. Neurosci.*) and the Joint-Embedding Predictive Architecture position paper (LeCun 2022; Meta FAIR reference implementations: [`facebookresearch/ijepa`](https://github.com/facebookresearch/ijepa), [`facebookresearch/jepa`](https://github.com/facebookresearch/jepa)). SIS adopts the **signal**, not the training loop — see `docs/research/2026-05-11-jepa-prediction-extract.md` §4. **Falsifier:** if no SIS surface consumes `prediction.error` by v0.3, this entry MUST be removed.
- Cross-reference: `docs/strategic/2026-05-11-predictive-cognition-substrate-analysis.md` §3 (concept-mapping gap analysis) and `docs/boards/2026-05-11-predictive-cognition-substrate-bundle.md` Proposal S1 (board pre-pass).

Subsystem additions do NOT change the IS count. The 10-IS table above remains the canonical taxonomy. Subsystems are routing-layer internals.

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
