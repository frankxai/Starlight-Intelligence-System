# Agentic estate production architecture — runtime, SDLC, revenue portfolio, capital

**Date:** 2026-10-08
**Status:** Proposed. Operational-tier decision with one substrate-adjacent item (§4 runtime contract) that goes to `/starlight-board` before any `SIP.md`/`STACK.md` edit. Nothing here changes the 10-IS taxonomy.
**Decision owner:** Frank
**Reference implementation:** `frankxai/starlight-swarm` `src/managed-runtime/` (shipped with this proposal, dry-run only)
**Scope:** Turn the estate from a portfolio of well-governed repos into a production company that ships assets, meters usage, and compounds recurring revenue on several fronts at once, without weakening the fail-closed rules the estate already has.

---

## 1. The decision

Build one **production spine** with five planes and run every revenue stream on it. Stop building per-brand runtimes.

1. **Control plane: SIS.** Contracts, identity, memory policy, attestation, budgets, the registry of streams and experiments. Already exists; this doc adds two registries (§6, §7).
2. **Runtime plane: managed agents, three providers, one contract.** Anthropic Managed Agents, the OpenAI Agents SDK over the Responses API, and Gemini managed agents (Interactions API, Antigravity agent) sit behind a single `ManagedAgentRuntime` port. Workload class decides the provider; policy decides the ceiling; every run emits a receipt.
3. **Durable execution plane.** Cloudflare Workflows for agent-centric and cross-service jobs, Vercel Workflows for app-local jobs. One workflow, one durable owner. This is the accepted rule in `starlight-swarm/docs/TEAM-RUNTIME-ADR-2026-08-06.md` (4 October 2026 decision). Temporal, trigger.dev and n8n are not backbones.
4. **Data and asset plane.** Supabase Postgres with row-level security for runtime state, Cloudflare R2 for media, Git for durable `MEMORY.md` state, Notion for intent. Unchanged from `STACK.md` L2.
5. **Money plane: fail-closed, verify-only.** `payment-intelligence-system` verifies AP2 mandates and spend caps; rails (x402, ACP, MPP, card networks) settle elsewhere; humans approve capital. No agent in this architecture holds a transfer tool. This is non-negotiable and already encoded.

The moat is not a model. It is **attested memory plus receipts plus governance plus distribution**, compounding across every stream the spine runs. A competitor can rent the same models tomorrow. They cannot rent four years of attested receipts, a registry of streams with kill criteria that fired, or an audience that trusts the receipts.

---

## 2. What exists (evidence-backed, same-turn reads)

| Asset | Repo and path | State | Role in this architecture |
|---|---|---|---|
| SIP substrate, 10-IS stack, 144 agents, 88 skills | `Starlight-Intelligence-System` (`SIP.md`, `STACK.md`, `metrics/current.json` as of 2026-07-28) | live | Control plane |
| Queen/worker swarm with escalation spine, benevolence charter, verify-only payments adapter | `starlight-swarm/src/swarm/` v0.3 dry-run | tested, never wired to funds | Governance kernel the runtime calls before any side effect |
| Team runtime planner, pack compiler, prepared-runtime bundles, Cloudflare/Vercel workflow decision | `starlight-swarm/runtime/`, `docs/TEAM-RUNTIME-ADR-2026-08-06.md` | report-only; live pilot open in swarm issue 15 | Durable execution plane |
| Fail-closed payments MCP (verify_mandate, check_spend_cap, record_audit_entry, require_human_approval) | `payment-intelligence-system/mcp/src/` v0.2, Ed25519 verification | unaudited scaffold, not for live funds | Money plane |
| Agentic Business OS template with packs and downstream registry | `agentic-business-os/` (one registered downstream, Damfrost, since 2026-06-11) | live template | Stream R3 product |
| GenCreator Companion with a sealed `AgentRuntime` contract, budget reservations, usage receipts | `gencreator.ai/lib/agent-runtime-contract.ts` (ADR-008, ADR-010) | alpha on hold, no public checkout | First tenant of the runtime port; its contract shapes the estate contract |
| Estate commissioning workflow, SOW template, Trinity playbook | `Starlight-Intelligence-System/docs/delivery/` | v0.1, board-gated | Stream R1 and R2 delivery |
| Wealth IS composition layer (DPI ledger, thesis engine, gate ladder) | `verticals/wealth/` | composition-layer v0.2 | Investment theses and gates for R10 |
| Ops ledger, estate registry (68 repos, 12 production tier as of 2026-07-16) | `agentic-ops-hub/ops/`, `estate-registry.json` | live | Receipts of record |
| Estate guard scanner and gate | `claude-skills-library/packs/estate-guard`, installed in twenty repos | live, weekly sweep | SDLC gate |

Gaps the inventory exposes: no provider-neutral runtime contract above GenCreator, no registry of revenue streams with gates, no experiment ledger, no metered pass-through surface, and no capital-stack plan with dates. This document and the reference implementation close the first three and plan the last two.

---

## 3. Target architecture

```
                 ┌──────────────────────────────────────────────────────┐
                 │  CONTROL PLANE · SIS                                  │
                 │  SIP contract · identity · memory policy · budgets    │
                 │  stream registry · experiment ledger · attestation    │
                 └───────────────┬───────────────────────┬──────────────┘
                                 │ policy                │ receipts
   ┌─────────────────────────────▼─────────────┐   ┌─────▼─────────────────────┐
   │  RUNTIME PLANE · ManagedAgentRuntime      │   │  LEDGERS                   │
   │  router: workload class → provider/model  │   │  ops ledger (git)          │
   │  ┌──────────┐ ┌──────────┐ ┌───────────┐  │   │  usage receipts (Supabase) │
   │  │Anthropic │ │ OpenAI   │ │ Gemini    │  │   │  SIP attestation blocks    │
   │  │Managed   │ │ Agents   │ │ managed   │  │   └────────────────────────────┘
   │  │Agents    │ │ SDK      │ │ agents    │  │
   │  └──────────┘ └──────────┘ └───────────┘  │
   └───────┬───────────────────────────────────┘
           │ every side effect passes classify() + checkCharter()
   ┌───────▼──────────────────┐   ┌──────────────────────┐   ┌─────────────────────┐
   │ DURABLE EXECUTION        │   │ DATA + ASSETS        │   │ MONEY (verify-only) │
   │ Cloudflare Workflows     │   │ Supabase RLS · R2    │   │ AP2 mandate check   │
   │ Vercel Workflows         │   │ Git MEMORY.md        │   │ spend caps · audit  │
   │ one workflow, one owner  │   │ Notion intent        │   │ human approval      │
   └──────────────────────────┘   └──────────────────────┘   └─────────────────────┘
           │
   ┌───────▼──────────────────────────────────────────────────────────────────────┐
   │ DISTRIBUTION + METERING                                                       │
   │ frankx.ai · arcanea.ai · gencreator.ai · starlightintelligence.org            │
   │ YouTube · TikTok · Spotify/Suno catalog · LinkedIn · newsletter               │
   │ MCP endpoints (marine-mcp, payments-mcp verify-only) · x402 pay-per-call      │
   └───────────────────────────────────────────────────────────────────────────────┘
```

### 3.1 Connector matrix

| Need | Connector | Why this one | Fail mode handled by |
|---|---|---|---|
| Long-horizon agent with hosted sandbox, versioned config, outcomes grading, scheduled deployments | Anthropic Managed Agents (`client.beta.agents` / `sessions`, beta `managed-agents-2026-04-01`) | Harness and deployment supplied; session budgets are hard dollar caps; vault credentials never enter the sandbox | Session `budget_reached` pause, `tool_confirmation` deny when unattended |
| Tool-heavy orchestration where we own the loop, handoffs, guardrails, tracing | OpenAI Agents SDK (`@openai/agents`) over the Responses API | Hosted tools (web search, file search, code interpreter, image generation) and handoffs with built-in tracing. AgentKit's Agent Builder and Evals are scheduled to stop on 30 November 2026 per OpenAI's own notice; ChatKit stays. Build on the SDK and Responses, not on Agent Builder. | Runner-level model settings and max turns; our budget wrapper |
| Sandboxed research and file work at low token cost, free tier for experiments | Gemini managed agents (Interactions API, Antigravity agent on Gemini 3.8 Flash; docs updated 2026-09-17) | Google-hosted Linux sandbox with network allowlist and managed credentials; environment compute not billed during preview | Network allowlist, credential IDs injected at egress |
| Durable multi-step jobs | Cloudflare Workflows, Vercel Workflows | Accepted estate rule, one durable owner per workflow | Leases, heartbeat timeouts, kill-switch names already in `runtime:prepare` bundles |
| Video generation | Seedance 2.0 / 2.5 via BytePlus ModelArk (direct, lowest price), fal.ai (broadest catalog), Higgsfield (consumer and character consistency); Kling 3.0; Veo 3.1 | Price and quality tiers differ by a factor of four; route by shot class (§5.3). Sora API shut down on 24 September 2026, so nothing routes there. | Per-shot credit budget in the runtime; brand gate before publish |
| Image generation | Nano Banana Pro via `scripts/nb-generate.mjs`, Seedream 5.0, FLUX.2 | Existing gen lanes in `lib/gen/lanes.ts` | Visual gate (`@visual-brand-guidelines`) |
| Music | Suno via `/create-music`, catalog indexer, mastering QC | 12,000+ song catalog is an existing asset | Release manager refuses on QC fail |
| Commerce | LemonSqueezy (digital), Whop (memberships), Stripe (services, invoices), Polar (open-source sponsorship) | `STACK.md` L5 default plus the Companion alpha's merchant-of-record rule | No public checkout until a stream passes its gate |
| Agent commerce rails | x402 (settlement, Linux Foundation governed), AP2 (authorization), MPP (Stripe plus Tempo, recurring and streaming, launched March 2026), ACP (checkout) | Our MCP verifies; rails settle | Verify-only by design |
| Distribution | Postiz self-hosted, YouTube Data API via vidIQ tools, TikTok Symphony Creative Studio (Symphony Agent announced October 2026), LinkedIn, Resend | Already in the ACOS and FrankX stacks | Human sends blasts and posts (hard stop) |
| Observability | Langfuse (self-hosted, currently stopped per ops ledger 2026-10-02), Sentry, Vercel observability | Restart Langfuse only when the first metered stream is live | Receipts are the fallback record |

---

## 4. Multi-provider managed agent runtime

### 4.1 The port

One TypeScript contract, `ManagedAgentRuntime`, with four operations: `provision` (agent config, once, versioned), `start` (session or run against a stored agent id, with a budget reservation), `steer` (message, tool result, approve or deny), `receipt` (the sealed usage and attestation record). Provider adapters implement the port. Nothing above the port knows which provider ran.

The contract is a sibling of GenCreator's `AgentRuntime` (ADR-008): same budget-reservation discipline (integer minor units, no floats; micro-USD here, cents there), same sealed-envelope rule, same usage receipt. GenCreator becomes tenant one, not a fork.

Reference implementation: `starlight-swarm/src/managed-runtime/`. Dry-run only. Adapters are written against the documented SDK shapes and take an injected client, so the test suite runs with no network and no keys.

### 4.2 Routing policy (workload class → provider)

| Workload class | Default provider | Model class | Why |
|---|---|---|---|
| `architecture`, `canon`, `protocol-reasoning`, `board-review` | Anthropic | top reasoning tier | Protocol-heavy work compounds best here; `STACK.md` L1 stance |
| `long-horizon-build`, `repo-steward`, `scheduled-deliverable` | Anthropic Managed Agents | operational tier, outcomes rubric on | Hosted sandbox, versioned agent, scheduled deployments, hard session budget |
| `tool-orchestration`, `multi-agent-handoff`, `customer-chat` | OpenAI Agents SDK | operational tier | Handoffs, guardrails, hosted tools, tracing |
| `bulk-extraction`, `classification`, `research-scan`, `sandbox-research` | Gemini managed agents | flash tier | Lowest cost per sandboxed loop, free tier for experiments |
| `volume-creator-work` | Anthropic or OpenAI by live cost | small tier | Router picks by measured cost per completed task, not per request |
| `offline-sovereign` | self-hosted Llama or Mistral | n/a | Air-gapped canon work |

Rules the router enforces: no provider receives raw vault content; every run carries a microdollar ceiling; a run that would exceed its ceiling escalates to `founder-board` through the swarm's `classify()`; a provider outage degrades to the next provider in the same class only for reversible work.

### 4.3 Evals and experiments

Every stream runs on hypotheses, not opinions. An **experiment** has a hypothesis, one primary metric, a baseline, a threshold, a kill criterion with a date, and a status. The runtime refuses to promote a stream past `pilot` without a passing experiment. `starlight-evals` stays the independent proof plane; the experiment ledger (`src/managed-runtime/experiments.ts`) is the registry that points at its runs.

Promotion ladder, same as the swarm's: `dry-run → shadow → pilot → standing`. Shadow means the agent runs and writes receipts but a human performs the side effect. Pilot means the agent performs reversible side effects under cap. Standing means scheduled, budgeted, kill-switched.

### 4.4 Cost discipline

Caches first (stable prefixes, deterministic tool lists), then effort, then model choice, then provider. Judge cost per completed task. One model per cache namespace. The runtime records `inputTokens`, `outputTokens`, `cacheReadTokens`, `costMicroUsd`, and `completed` on every receipt so the comparison is measured, never assumed.

---

## 5. SDLC for an agent-run company

### 5.1 The loop

```
intent (Notion, MEMORY.md) → stream or experiment entry → draft PR on agent/<harness>/<scope>
→ gates (estate-guard scan · type · lint · tests · evals · visual proof where UI)
→ independent review on the exact head (Grok or Claude, text-only, receipt in ops ledger)
→ merge by Frank or merge-steward under repo rules → deploy by git integration (Vercel) or workflow
→ receipts (usage, attestation, ops ledger) → experiment evaluated → promote or kill
```

### 5.2 Gates that already exist and are now mandatory per stream

- **Estate guard** on any PR touching workflows, hooks, settings, MCP configs, skills, API routes. CI fails on a high finding.
- **Merge gate** (`pnpm merge:gate`) on web repos: claims, strict language, internal links.
- **Web release gate** for any UI: audit findings plus before and after captures at 375, 768, 1440.
- **Integrity guard** before anything public: brand, claims, voice, schema.
- **Durable-output-sink law** for routines: a run that commits nothing must not report green.
- **Human gate** for the hard stops: force-push to production main, newsletter blasts, auto-posting, key rotation, irreversible migrations, money movement.

### 5.3 Media production SDLC (the content factory)

Shot classes decide the model, the budget, and the gate:

| Shot class | Model lane | Budget per shot | Gate |
|---|---|---|---|
| Hero cinematic, character continuity across shots | Seedance 2.0 (up to 9 image, 3 video, 3 audio references) via BytePlus direct or Higgsfield | highest | Visual council plus brand gate |
| Motion b-roll, social loops | Kling 3.0 standard | low | Brand gate |
| Cheapest with native audio | Veo 3.1 Lite | lowest | Brand gate |
| Talking head, lyric video, lo-fi visualizer | Existing `/talking-head-ship`, Remotion batch | fixed | QC plus release manager |

Pricing as of September and October 2026 from provider and aggregator pages (confirm before budgeting): Seedance 2.0 at roughly $0.15 per second at 720p direct on BytePlus ModelArk and roughly $0.30 per second on fal.ai; Kling 3.0 at roughly $0.08 to $0.14 per second; Veo 3.1 Lite at $0.05 per second with audio at 720p; Veo 3.1 full at $0.40 per second with audio. Sources: Teamday provider comparison (September 2026), Overchat model comparison (July 2026), SaaS CRM Review (October 2026). These are not our numbers; they are inputs to the per-shot budget field.

Every published asset carries provenance (model, prompt hash, references, rights check) in its sidecar. The visual intelligence registry already indexes sidecars.

---

## 6. Revenue portfolio (ranked, with gates and kill criteria)

Ranking rule: recurring before one-off, owned asset before platform-dependent, verified demand before build. No invented figures. Where a number appears it is a placeholder the owner sets in the registry.

| # | Stream | Mechanism | Connectors | Promotion gate | Kill criterion |
|---|---|---|---|---|---|
| R1 | Estate commissioning | Full Mind plus Mesh plus Steward build for one principal or alliance, SOW, Pilot-to-Standing | SIS delivery docs, swarm packs, Managed Agents, Stripe invoices | One signed SOW with named pilot roles | No signed SOW within 90 days of the first three qualified conversations |
| R2 | Steward retainer | Monthly operations, evolution, and access on a running estate | Scheduled Managed Agents deployments, ops ledger, Slack | One estate at Standing | Retainer churns before month three |
| R3 | Agentic OS installs (Foundry) | Evaluated installs of `agentic-business-os` and siblings, template plus packs | GitHub template, `downstreams.json`, Stripe | Second registered downstream beyond Damfrost | Fewer than two installs by Q1 2027 |
| R4 | GenCreator Companion | Source to Creator Mission to review to export; CreatorPack | gencreator.ai, Supabase, Companion alpha gates | Alpha gates pass; merchant of record chosen | Companion alpha fails its own ADR-010 gates |
| R5 | Media production engine | Shorts, lyric videos, cinematic reels from the catalog and the research hub; ad revenue, sync, sponsorship | Seedance, Kling, Veo via fal or BytePlus, Suno, YouTube, TikTok Symphony, Spotify | Twelve weeks of weekly output with receipts; first sync or sponsorship inquiry logged | Output cadence breaks for four consecutive weeks |
| R6 | Metered agent services | MCP endpoints and APIs sold per call to agents: marine knowledge, research, payments verification; x402 pay-per-call, API keys for Web2 | marine-mcp, payments-mcp verify-only, Cloudflare Workers, x402 | One external agent paying per call in a pilot | No external caller within 60 days of the pilot going live |
| R7 | Memberships and retreats | GenCreator community, Vibeclubs formats, co-creation retreats | Whop or Skool, Circle, Resend | Cohort filled with delivery evidence complete | Cohort under minimum viable size |
| R8 | Digital products and templates | Prompt library, packs, courses, books | LemonSqueezy, frankx.ai product routes | Product page passes integrity guard | Under threshold units in 90 days (owner sets) |
| R9 | Agentic income network | Affiliate comparison engine, bound links, scheduled posts under queen gate | agenticincome, Postiz | Affiliate queen at Pilot | Payout below the stream cap for two quarters |
| R10 | Capital and deal intelligence for principals | Advisory and co-investment theses for HNW and crypto-native principals, built on Wealth IS and Investment IS; never custody, never money movement | `/wealth-thesis-review`, Investment IS, SOW | One principal retains the thesis service | Thesis service produces no decision the principal acts on in two quarters |

Portfolio rule: at most three streams in Pilot at once. The founder board decides which three. Everything else stays in dry-run or shadow and keeps writing receipts.

### 6.1 Whales, principals, and the pass-through model

The buyers who move the portfolio are principals: founders, crypto-native operators, HNW families, funds. They buy three things: a sovereign estate they own (R1, R2), theses they can act on (R10), and metered access to intelligence their own agents can call (R6). The pass-through model is honest: our runtime routes their workloads to the best provider under their budget, carries their attestation, and meters the call. We never hold their keys in a sandbox (vault credentials, injected at egress) and we never move their money (verify-only). That is the pitch, and it is also already the architecture.

---

## 7. Web2 and Web3 communities

- **Commons / IS / OS triad** is the pattern for every public-good initiative: free corpus, review-gated MCP, productized runtime. Ocean Intelligence is the reference instance. Spawn more with `/spawn-domain-stack --public-corpus`.
- **Web2 rails front-stage**: Open Collective, GitHub Sponsors, Zenodo for research artifacts, YouTube and newsletter for distribution.
- **Web3 rails backstage**: x402 for agent-to-agent pay-per-call, Gitcoin and Hypercerts for public-good funding, AP2 mandates for authorization. Adoption figures for x402 are contested (Chainalysis counted more than 100 million payments on Base; a March 2026 CoinDesk piece citing Artemis called roughly half of volume gamified). Do not cite a single volume number as settled. Build the rail as an option, not as the plan.
- **Attribution receipts** are the community currency: every artifact composed on SIP carries the block; every receipt is verifiable. This is what makes a community of builders rather than consumers.

---

## 8. Partnerships and capital stack

### 8.1 Credits (verified against program pages, October 2026; confirm before budgeting)

| Program | Self-serve | Partner or funded tier | Validity | Fit |
|---|---|---|---|---|
| Google for Startups Cloud | $2,000 | up to $200,000; up to $350,000 for AI-first startups between Seed and Series A | 2 years, year two reimburses 20 percent | Gemini managed agents, Vertex |
| Cloudflare for Startups | $10,000 | $100,000 or $350,000 ($350,000 tier requires $5M+ raised from an affiliated partner; Workers AI capped at $50,000 inside it) | 1 year | Workflows, Workers, R2, the durable execution plane |
| AWS Activate | up to $5,000 | up to $200,000 Portfolio tier via an Activate Provider | up to 2 years | Bedrock access to Claude where a client needs AWS |
| Microsoft for Startups | up to $5,000 | $100,000 to $150,000 via Investor Network | 1 year | Foundry access to Claude for enterprise clients |
| Vercel for Startups | — | up to $30,000, approved partner, Series A or less; AI Accelerator cohorts separate | cohort-based | Web surfaces |
| Claude for Startups | — | requires institutional equity funding, company under four years old, no prior credits | — | Managed Agents |
| OpenAI for Startups | — | referral code from a partner VC; no published amount | — | Agents SDK |
| Oracle for Startups | — | discount persists as you scale | ongoing | Enterprise lane; keep independence disclaimer |

The bootstrapped stack totals roughly $18,000 to $22,000 across the four self-serve tiers. The partner door changes the order of magnitude. Decision: apply to every self-serve tier this month; take the partner door only through an investor or accelerator that sits in the Google, Cloudflare, and AWS partner networks.

### 8.2 Entity and investor posture

Starlight Holding BV and Arcanea BV already separate substrate from canon IP. Investors buy into the holding, never into encoded-self (SIP §5.7). A co-investment vehicle for R10 is a separate entity with licensed counsel; Wealth IS architects the system and does not give financial advice. Any raise is sized to the credits it unlocks and the three streams in Pilot, not to a narrative.

---

## 9. 90-day plan (owners are agents; Frank approves gates)

| Window | Deliverable | Owner | Gate |
|---|---|---|---|
| Days 1–7 | Runtime port merged in starlight-swarm (this PR), stream and experiment registries populated with placeholders set by Frank | `general-cto`, `general-cfo` | Tests green, estate-guard clean |
| Days 1–14 | Apply to all self-serve credit tiers; record approvals in the ops ledger | `general-cfo` | Receipts in ledger |
| Days 8–30 | First shadow run: Anthropic Managed Agents repo steward on one bounded repo, outcomes rubric, hard session budget | `general-cto` | Receipts, no side effects |
| Days 8–30 | Media engine shadow: twelve shots across three shot classes with provenance sidecars; nothing published | `visual-design-gods`, `music-producer` | Visual council pass |
| Days 15–45 | R1 pipeline: three qualified estate conversations, SOW template v0.2 | `general-ceo` | One signed SOW |
| Days 30–60 | R6 pilot: marine-mcp metered endpoint behind Cloudflare Workers with API keys; x402 as optional rail | `general-cto` | One external caller |
| Days 30–60 | Pick the three Pilot streams at `/starlight-board` | Frank | Board verdict recorded |
| Days 45–90 | Promote one stream to Standing with scheduled deployment, budget, kill switch | `general-coo` | Four weekly receipts |
| Day 90 | Portfolio review against kill criteria; kill at least one stream that missed | `general-ceo` | Ledger entry |

---

## 10. The narrative (public, voice-compliant)

We run an estate of intelligence systems on an open protocol. Every agent that works for us or for a client leaves a receipt: what ran, where, what it cost, what it changed, and who approved it. Money never moves without a human. The same spine that writes our music videos verifies a client's payment mandate and stewards a repository overnight. You can fork the protocol for free. You pay us to build and run the estate you own.

That is the whole story. No guru claims, no revolution, no metaphysics. Receipts.

---

## 11. Falsifiers (remove the proposal if these fail)

- If no stream reaches Pilot with a passing experiment by day 60, the runtime port is premature; keep the governance kernel and drop the multi-provider layer.
- If the three providers cannot be exercised through one port without leaking provider-specific shape above it within two weeks of implementation, the abstraction is wrong; collapse to Anthropic Managed Agents plus one.
- If credits applications return nothing by day 30, the capital section is wishful; re-plan on cash.
- If the ops ledger shows a routine reporting green with no committed output, the SDLC section has not been enforced; stop adding streams until it is.

---

## Sources read this turn

- `starlight-swarm/README.md`, `docs/TEAM-RUNTIME-ADR-2026-08-06.md` (4 October 2026 decision), `src/swarm/escalation.ts`, `src/swarm/streams.ts`
- `payment-intelligence-system/docs/PAYMENT-PROTOCOLS.md` (June 2026 state), `CLAUDE.md`
- `gencreator.ai/lib/agent-runtime-contract.ts`, `CLAUDE.md` (ADR-007, ADR-008, ADR-010)
- `Starlight-Intelligence-System/STACK.md`, `VERTICALS.md`, `DELIVERY.md` §7, `docs/delivery/estate-army-commissioning-workflow.md`, `docs/strategic/sip-web4-substrate-strategy.md`, `verticals/wealth/README.md`, `metrics/current.json`
- `agentic-ops-hub/ops/OPS-LEDGER.md` (entries through 2026-10-07), `estate-registry.json`
- Anthropic Managed Agents documentation (beta `managed-agents-2026-04-01`), Gemini API agents overview (updated 2026-09-17), OpenAI Agents SDK documentation and the AgentKit sunset notice for Agent Builder and Evals (30 November 2026)
- Provider pricing comparisons: Teamday (September 2026), Overchat (July 2026), SaaS CRM Review (October 2026); cloud credit program summaries (October 2026); x402 and AP2 explainers (Eco, Blockleaders, Danieloon, 2026)

Built on SIP.
