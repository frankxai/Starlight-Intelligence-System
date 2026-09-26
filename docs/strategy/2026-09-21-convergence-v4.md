# The great convergence v4 — choose harder

**Status:** decision record and plan, 2026-09-21 (night); revised 2026-09-26 against SIS `main` at 515e6c0 and PR 189 at 910c7ed, with every change listed in section 12. Operational tier. Substrate untouched; two dimensions are blocked on Board and carry their Board proposals in section 7.
**Lineage:** v1 (`2026-09-21-great-convergence.md`, one path per layer), v2 (`2026-09-21-convergence-v2.md`, receipt-first), v3 (`2026-09-21-convergence-v3.md`, the option space for nine layers and the demo). The brief that produced this run asked for "v2"; the branch already carried v2 and v3 from the earlier session on the same day, so this is v4. Everything in v1 to v3 is the floor. Where v4 keeps a v3 choice it says so and adds what v3 did not measure; where it changes one it says why the v3 choice lost.
**Companions:** `convergence-map-v4.html` (twenty-one dimensions and the demo, three directions each, the chosen one lit, cost at three scales, falsifier and Board verdict per direction); `memory-log-prototype.html` (the most consequential architecture move); `ledger-countersign-prototype.html` (the most consequential trust move); appendix E (`2026-09-21-convergence-v4-appendix-e-facts.md`, dated facts with sources and the corrections to appendix C); appendix F (`2026-09-21-convergence-v4-appendix-f-verification.md`, every "live" claim in this document checked against a file this session).
**Rules held:** no production main pushed; `SIP.md`, `SIS.md`, `ALLIANCE.md`, `STACK.md`, `VERTICALS.md`, `VOICES.md`, `REGISTRY.md`, the sovereignty clause and the vault taxonomy unchanged; every euro shows its arithmetic and names its price source; every "live" claim names a file; every direction produces a receipt or is marked ineligible; sentence case; no adjective without a file or a receipt behind it.

---

## 0. Decision first

### 0.0 Five days later (26 September)

The count is still zero. SIS `main` at 515e6c0 has no `memory/_audit/receipts.jsonl`. The registry file `lib/trusted-keys.ts` is not on the web repo's `main` at all; it exists only on draft PR frankxai/starlight-intelligence-web#54, and the registry key (issue frankxai/starlight-intelligence-web#55) is open. SIS PR 189, web PR 54 and this PR are drafts. What did land, on PR 189 after this plan was first written: the Desk as code (`site/src/app/desk`, `site/src/lib/desk/cascade.ts`, 15 tests), a JSONL vault the Desk writes one belief per line with the `receiptId` that produced it (`site/src/lib/desk/vault.ts`), and `scripts/receipts/issue-and-share.mts`, which signs a draft, verifies it and prints the phone link and an A5 card. The day horizon in section 8 passed without a signed receipt reaching a ledger in any repository, so the week horizon moves by one week. One claim in the 21 September text was wrong on the day it was written: the routing table does auto-apply classes, and two of them break the doctrine's own sample floor (section 2.3, section 12).

### 0.1 The number this plan is organised around is zero

On the night this is written, the estate holds zero signed run receipts. `memory/_audit/receipts.jsonl` does not exist in the checkout (appendix F, row 1). The key registry on the web branch is an empty array (`lib/trusted-keys.ts`, `STARLIGHT_TRUSTED_KEYS = []`). The receipt that v3 issued for itself was an unsigned draft. Every one of the six receipt-native metrics in `narrative.md` section 9 reads zero, and the 144 registered agents, 88 skills and 150 commands are, in the words of the graph contract, registry theatre until one of them has a live process and a receipt.

v1 designed the architecture. v2 chose the object. v3 mapped the option space and priced it. None of the three chose against the zero. v4 does: **every direction below is judged first by whether it moves the count of signed receipts verified by a key that is not ours, and second by everything else.** A direction that cannot be tested against that count within one horizon is deferred, however elegant.

### 0.2 The choices, in one table

| # | Dimension | v3 chose | v4 chooses | Changed? |
|---|---|---|---|---|
| A1 | Surfaces | four brand sites, shared verifier kernel by copy, phone verify | four brand sites, the verifier as one MIT package, headless as the conformance test for every surface | changed |
| A2 | Product spine | Desk → Constellation → Renderers → Publish; marketplace deferred | same spine; a receipt at every stage is a merge gate; marketplace rejected as a product, kept as a ledger view | sharpened |
| A3 | Operator | Queen plus Board plus seats, constitution for low-stakes classes | constitution first for every class, Queen as the router inside it, budgets from ACOS circuit breakers as rules; market rejected | changed |
| A4 | ADLC | seven gates, executable spec at Prove | seven gates, one receipt per gate enforced in CI, continuous eval as the inner loop of Build only | sharpened |
| A5 | Runtime | AI SDK 7 plus Workflow Development Kit, Railway daemons | same reference runtime, plus a second conformant runtime that must pass the receipt suite by Q4 ("two runtimes, one receipt"); actor model rejected | changed |
| A6 | Harness | AGENTS.md shared, compiled files in Q4 | same, with the compiler's first target the three instruction files and its test the ContextCov pattern | sharpened |
| A7 | Memory | JSONL vaults as truth, event log for receipts only | one append-only signed log with the six vaults as its first projections; blocked on Board, proposal in section 7 | changed |
| A8 | Models and cost | cascade now, router at a thousand receipts, LoRA on proof | cascade with batch by default, a local lane for extraction, the router's precondition restated as a cohort rather than a date | sharpened |
| A9 | Design | liquid objects on each surface's tokens, package deferred | same, with exactly one shared package: the receipt (verifier and card), which is trust rather than design | changed |
| A10 | Demo | Desk plus phone verify | Desk plus phone verify plus countersign: the judge's phone signs a statement into the ledger | changed |
| B1 | Economics | not covered | retainers fund the year; open core holds; the receipt is the metering unit inside every price; per-receipt as a public price only after a thousand external verifications | new |
| B2 | Trust and provenance | one paragraph | an off-chain transparency log with countersignatures; C2PA manifests linked from `render.*` receipts; agent identity credentials deferred; on-chain only on the Crypto IS falsifier | new |
| B3 | Regulation and residency | one paragraph | a compliance receipt as a stage of the spine; the provider clause written precisely (Nebius stores in Finland, pins EU only on dedicated endpoints; Anthropic first-party has no EU geo) | new |
| B4 | Compute sovereignty | one paragraph | hosted Token Factory now; the local lane as `provider: local` for extraction and embeddings; own vLLM rejected on the crossover arithmetic; the cable-pulled falsifier by Q4 | new |
| B5 | Data flywheel and consent | one paragraph | the consent rule written; LoRA only on the creator's own receipts with a `train` decision; the router trains on routing metadata, never on content; renderer accounts stay the creator's | new |
| B6 | Interop standards | one paragraph | SIP graph extension ratification; the run-receipt conformance suite as the open standard's test; A2A cards and AP2 mandates carry receipt ids; x402 not adopted | new |
| B7 | Distribution through agents | one paragraph | the operator's agent is the primary customer; every public surface is agent-readable first; the seven `/sip-export` targets carry the verify tool | new |
| B8 | Voice, video, spatial | one paragraph | voice resumes only as a receipt producer; video stays a renderer; the palace stays a companion view; "palace as interface" rejected | new |
| B9 | Physical estate | one paragraph | physical assets are verticals only when they issue receipts; five of the fifty-nine Vercel projects are named and dormancy-marked | new |
| B10 | Education, community, games | one paragraph | one academy whose exercises end in a receipt the learner signs; Skool over Circle on fee arithmetic; games stay Arcanea's | new |
| B11 | Observability and cost | one paragraph | the receipt carries the trace id; ACOS breaker thresholds become constitution rules; promptfoo at Prove; observability as a product rejected | new |
| B12 | Portfolio, attention, risk | one paragraph | the receipt-or-dormant rule at ninety days; four load-bearing names; a risk register with owner seats and falsifiers | new |

Two moves are the most consequential. **Architecture:** the memory log (A7), because it turns three separate append-only logs and five hand-maintained projections into one mechanism with one signature model, and because it is the only direction that makes erasure a replay rather than an edit. **Trust:** the countersigned ledger (B2 with A10), because it makes "verified by others" a recount of signatures rather than a counter on our server, and because it is the cheapest move that can turn the zero into a number a stranger can check.

### 0.3 The three fixed points, restated for v4

One substrate: the signed event, of which the run receipt is the first kind. One operator: the constitution gates, the Queen routes, the Board ratifies, Frank holds the irreversible. One product spine: Desk → Constellation → Renderers → Publish, each stage a receipt producer, each receipt publishable to a log a stranger can countersign.

### 0.4 What is blocked on Board

Two dimensions choose a direction that touches the substrate and therefore ship nothing in this run: the memory log (A7, vault taxonomy and "what is truth") and the ratification of `starlight.run-receipt.v1` as a SIP graph extension (B6, `SIP.md` v1.2.0). Their Board proposals are in section 7. The registry seats for HX and AX directors (A3) also need Board, as v1 said; the proposal text is section 7.3.

---

## 1. Cost model used throughout

Every euro below derives from these unit costs and volumes. Prices are list prices dated 2026-09-21, sourced in appendix E; Nebius per-model rows are third-party mirrors of a login-walled list unless appendix E marks them official (Kimi K3, GLM-5.2, GLM-5.3-Flash, Llama 3.3 70B and two Qwen3 rows are from Nebius's own cookbooks). "Illustrative" means the formula is real and the inputs are list prices. Receipt medians replace every number once ten real runs exist.

**FX.** ECB reference rate for 2026-09-18, 1 EUR = 1.1460 USD, so 1 USD = 0.8726 EUR (appendix E, section 1). The same basis as appendix C, kept so the two documents compare. The 2026-09-21 fixing was 1.1490; the difference is 0.3 percent and changes no decision.

### 1.1 Unit costs per artifact (inference only)

| Symbol | Meaning | Real time | Batch (Nebius, 50 percent) | Source |
|---|---|---|---|---|
| `c_brief` | one Desk brief on the cascade: extract 8k in / 1k out on Nemotron 3 Nano (0.06 / 0.24), synthesize 10k / 1.5k on DeepSeek V4 Flash (0.14 / 0.28), judge 4k / 0.3k on GPT-OSS 120B (0.15 / 0.60), embed 2k on Qwen3-Embedding-8B (0.01); USD per million | $0.00334 = **€0.0029** | $0.0017 = **€0.0015** (batch prices rounded up to the cent per Nebius's page: 0.03 / 0.12, 0.07 / 0.14, 0.08 / 0.30, 0.01) | appendix E section 4; arithmetic in appendix C example 1, batch recomputed in appendix E |
| `c_art` | one constellation text artifact, 3k in / 0.6k out on V4 Flash | $0.000588 = **€0.000513** | $0.000294 = **€0.000257** | same |
| `c_local` | the same extraction on Nemotron 3 Nano 4B or 30B-A3B on Apple silicon (`provider: local`) | **€0.000** marginal; hardware amortised; the 30B-A3B needs 24.6 GB at Q4, the 4B needs 2.84 GB | n/a | appendix E section 6, measured on llama.cpp |
| `c_brief_claude` | the same brief on Claude Haiku 4.5 at list; Sonnet 5 at list | **€0.0314**; **€0.0628** | with batch: €0.0157; €0.0314 | platform.claude.com pricing, read in full 2026-09-21 |
| `c_image` | one Flux image on Token Factory | **€0.0011** (2025 press figure, current price unverified) | n/a | appendix C section A, unchanged |
| `c_track` | one commercially usable Suno track | **€0.44 per download** (Pro: $10 for 20 downloads a month; Premier: $30 for 60), because since about 2026-09-03 commercial rights attach to downloads while subscribed, and downloads are capped | n/a | appendix E section 8 |
| `c_comply` | one compliance check (2k tokens on Nemotron 3 Nano) | **€0.0001** | €0.00005 | appendix E section 4 |
| `c_receipt` | issuing, signing and appending one receipt | **€0.000**: `node:crypto`, no API call | n/a | `src/run-receipt.ts` |

### 1.2 Volumes per scale, per month

| Scale | Briefs | Artifacts | Images | Tracks | Publishes | Receipts issued | Notes |
|---|---|---|---|---|---|---|---|
| One founder | 20 | 120 | 20 | 4 | 20 | ≈ 200 | five briefs and thirty artifacts a week, one image a day, one track a week, one publish per brief; plus gate receipts (prove, ship) not counted here |
| One cohort of forty | 800 | 4,800 | 800 | 160 | 800 | ≈ 8,000 | forty founders at the same rate, one room a week |
| One thousand estates | 200,000 | 1,200,000 | 200,000 | 40,000 | 200,000 | ≈ 2,000,000 | ten founders' worth of volume per estate; steward time excluded |

Receipts per month is the new column. At founder volume, a thousand receipts take five months; at cohort volume, four days. Every direction that "waits for a thousand receipts" is therefore waiting for the cohort, and the plan says so where it matters (A8, B5).

### 1.3 Platform costs per month (list)

| Item | USD | EUR | Source |
|---|---|---|---|
| Vercel Pro seat (plus $20 usage credit) | 20 | 17.45 | appendix E section 9 (official snippet) |
| Supabase Pro (one project, $10 compute credit) | 25 | 21.82 | same |
| Railway, two small services (Hobby includes $5 usage; usage-based beyond) | ≈ 10 | ≈ 8.73 | same (third party) |
| Railway, one extra small service (projection runner, twin runtime, clearing) | ≈ 5 | ≈ 4.36 | estimate on the same basis |
| Apple Developer Program (per year) | 99 | 86.39 | official, fetched |
| Google Play registration (one time) | 25 | 21.82 | official snippet |
| Nebius H100 on demand / preemptible, per GPU-hour | 3.85 / 2.15 | 3.36 / 1.88 | docs.nebius.com (official snippet) |

### 1.4 The three-scale baseline for the chosen architecture

Inference at real-time prices, then at batch where the stage is not interactive (constellation and compliance are batchable; the Desk brief on stage is not).

| Scale | Briefs | Artifacts (batch) | Images | Compliance | Inference EUR | Platform EUR | Total EUR / month |
|---|---|---|---|---|---|---|---|
| One founder | 20 × 0.0029 = 0.058 | 120 × 0.000257 = 0.031 | 20 × 0.0011 = 0.022 | 20 × 0.0001 = 0.002 | **0.11** | Vercel 17.45 | **≈ 17.6** |
| One cohort of forty | 800 × 0.0029 = 2.32 | 4,800 × 0.000257 = 1.23 | 800 × 0.0011 = 0.88 | 800 × 0.0001 = 0.08 | **4.51** | Vercel 17.45 + Supabase 21.82 + Railway 8.73 + one runner 4.36 = 52.4 | **≈ 56.9** |
| One thousand estates, client-hosted | 200,000 × 0.0029 = 580 | 1,200,000 × 0.000257 = 308 | 200,000 × 0.0011 = 220 | 200,000 × 0.0001 = 20 | **1,128** | paid by each client (the estate's own Vercel, Supabase, Railway) | **≈ 1,128 in inference, billed through the clients' keys** |
| One thousand estates, Starlight-hosted (comparison only) | same | same | same | same | 1,128 | Supabase 1,000 × 21.82 = 21,820 plus Vercel usage plus a Railway cluster | **≈ 23,000 plus usage** |

Tracks are outside the table because the rights attach to the creator's own Suno account (B5): founder €8.73 a month on Pro, cohort 40 × €8.73 = €349, estates 1,000 × €8.73 = €8,726, always on the creator's card.

Reading: v3's platform line stands and its inference line falls by about a fifth once batch is the default for the non-interactive stages. The line that changes decisions is still who hosts at estate scale. Receipts replace every number here as they accumulate; the Sunday loop (section 4.2) reads `sis.receipt.list` and rewrites this table.

### 1.5 Corrections to appendix C that change arithmetic

1. Nebius batch is 50 percent of the real-time price, rounded up to the cent, per Nebius's own batch page and two Nebius posts; appendix C carried "30 percent, unverified". The Nebius batch rows halve.
2. Suno's commercial rights now attach to downloads while subscribed (20 a month on Pro, 60 on Premier), so a released track costs €0.44 and the account must be the creator's; appendix C priced tracks by credits.
3. Gemini's Flash row was stale (3.8 Flash is 0.75 / 3.75 through 2026-12-31, doubling on 2027-01-01); OpenAI's GPT-5.6 Sol 4 / 20 is promotional through at least 2026-11-21. Neither is on our path; both are in the comparison rows of appendix E.
4. Nebius's public endpoint compute location is dynamic; stored data lives in Finland; only a dedicated endpoint pins EU processing (appendix E section 4). "EU-hosted" in v1 to v3 becomes "EU-headquartered, EU-stored, EU-pinned on dedicated endpoints" (B3).
5. Anthropic's first-party API offers `inference_geo` of `"us"` or `"global"` only; there is no EU geo (appendix E section 12, fetched). Any sentence in v1 to v3 implying EU-resident Claude through the first-party API was wrong.

---

## 2. Part A: the nine layers and the demo, three directions each

Format per direction: **enables** (what it makes possible that the others cannot) · **costs** (euros per month at three scales, from section 1) · **forbids** · **falsifier** (the observation and the date by which it must exist) · **stresses** (the `SOUL.md` invariant: 1 sovereignty, 2 attestation, 3 MIT, 4 sovereignty clause, 5 abundance toward alliances, 6 voice) · **receipt** (produced or consumed). Then the choice and why the losers lost.

### 2.1 Surfaces

**A. Four brand sites plus PWA plus desktop cockpit, verifier shared by copy (v3).** Enables: each brand keeps its register and audience; `lib/run-receipt.ts` is byte-identical in SIS and the web repo by a maintained note. Costs: founder €0 extra, cohort €0, estates the client's projects. Forbids: one login across brands. Falsifier: by 2026-12-31 the two copies of the verifier differ in behaviour on one envelope (the note is a promise, and appendix F shows the copies already sit on different branches). Stresses: 1 (four surfaces drift into four products). Receipt: consumes every kind.

**B. One operator app that projects every brand (radical).** Enables: one place for Desk, constellation, ledger and every publish queue; desktop and mobile shells fall out of it. Costs: one Vercel project plus Supabase auth: founder €0 (local), cohort +€21.82, estates per-tenant compute on the hosted line (section 1.4). Forbids: brand-native registers on the operator surface; the .ai truth that no Starlight account exists (`app/start` still says so on main). Falsifier: by 2026-11-30 a founder outside the estate completes a Desk run and a publish approval without opening a brand site. Stresses: 1 (the first hosted operator app is exactly the object invariant 1 warns about) and 6. Receipt: produces and consumes every kind.

**C. Headless: everything through MCP, sites thin (conservative).** Enables: every host is the interface; the receipt travels as a tool result; no UI to maintain beyond marketing pages. Costs: lowest; estates ≈ two Railway services (€8.73). Forbids: the room demo, phone verify, anyone who does not run an agent, the design bar as a differentiator. Falsifier: by 2026-10-31 more than half of verifications arrive through the MCP tool rather than `/verify` or the API. Stresses: 5 (abundance needs a door non-builders can open). Receipt: through tools only.

**Choice: A, with two changes that C and B each contribute.** From C: headless is the conformance test for every surface. A surface that shows something not reachable through `sis.receipt.*`, `verify_run_receipt` or the ledger API is decoration and fails the web-release-gate; this makes the sites projections in fact rather than in prose. From B: nothing yet; the operator app returns only when a second brand site asks for a shared login, which none does. The verifier stops being a copy (A9). B lost because invariant 1 and the .ai "no account" truth both hold through the hackathon. C lost because the demo is for a room. Reversible: the conformance test is a CI check; removing it costs nothing.

### 2.2 Product spine

**A. Desk → Constellation → Renderers → Publish (v1 to v3).** Enables: one loop every surface projects; four receipt kinds; stage one is the 23 September build. Costs: the baseline line in section 1.4. Forbids: selling before a brief exists; renderers as the engine. Falsifier: by 2026-10-15 no person other than Frank has run the loop to a published page with an approval receipt; v4 pulls the first half of that forward to 23 September, where room mode must produce at least one `desk.brief` whose question came from a phone other than Frank's. Stresses: 2 (every stage must earn its attestation). Receipt: `desk.brief`, `constellation.artifact`, `render.*`, `publish`.

**B. A marketplace of receipts (radical).** Enables: founders buy proven briefs and constellations with their receipts; cost per artifact becomes price discovery. Costs: same inference plus a merchant of record: Polar Starter 5 percent plus $0.50, or Pro $20 a month at 3.8 percent plus $0.40 (appendix E section 10); founder €0, cohort fees only, estates fees only. Forbids: private-by-default receipts, and the gencreator.ai offer-truth gate (`lib/offer-truth.ts`: "Pricing not published" is the only price public copy may render until an offer is true). Falsifier: by 2027-01-31 fewer than ten receipts bought by someone other than their issuer. Stresses: 1 (a marketplace is a platform), 5 (selling briefs to alliances inverts the gift). Receipt: consumes `desk.brief` and `constellation.artifact`; produces `sale`.

**C. The estate factory as the product (conservative in shape).** Enables: every client gets the loop as their operator; revenue is the retainer; DELIVERY §7 describes it and the 2026-06-16 Board gated it (PROCEED-WITH-REVISE, six items, none of which the record shows closed). Costs: inference per estate as A; delivery is human time at the freelance benchmark €100 to €150 an hour (appendix E section 17, third party); platform the client's. Forbids: self-serve; scale beyond the steward bench. Falsifier: by 2026-12-31 fewer than three estates commissioned with the loop and a client-held key. Stresses: 5. Receipt: `estate.provision`, then every kind the estate runs.

**Choice: A as the spine, C as the channel that pays for it (B1), B rejected as a product.** The marketplace idea survives only as the public ledger view (`/ledger`, B2): what a receipt proves is visible, what a brief says is the creator's. B lost on the offer-truth gate as much as on timing: gencreator.ai cannot render a price until the offer is true, and no receipt has been bought because none has been issued. New in v4: a receipt at every stage is a merge gate (A4), so the spine cannot drift back to "pipeline with a receipt at the end". Irreversible: none.

### 2.3 Operator

**A. Queen plus Board plus council seats, constitution for low-stakes classes (v3).** Enables: typed envelopes (`foundry/examples/research-brief.task-envelope.json` carries budget, autonomy, evidence policy), route receipts, the Board gate, a person at the irreversible; A1 to A3 from the 2026-06-10 verdict as tests. Costs: none. Forbids: agents merging to production main, publishing, paying, rotating keys. Falsifier: by 2026-10-31 fewer than 50 routed envelopes in the route ledger (`tools/queen/ledger.jsonl`), or no ratified table change; today the routing table's `autoApply` is false on every class because the A2 sample floor is unmet (`tools/proving-ground/routing-table.json`, `rounds: 1`). Stresses: 4. Receipt: `queen.route`, `board.verdict`.

**B. A market: seats bid for envelopes with budgets drawn from receipts (radical).** Enables: cost-aware routing without a table; partner seats we do not control can bid. The 2026 papers cut both ways: AgentLance (2608.23867) shows one inserted preference nearly doubles a favoured agent's share under a centralised allocator, which is the argument for a market, and finds cost estimation and bidding strategy are the bottleneck, which is the argument against one before receipts exist. Costs: a clearing service (+€4.36 cohort, one per estate), and a budget ledger. Forbids: any seat without a receipt history; the Queen routing by doctrine when the price disagrees. Falsifier: by 2027-03-31 market routing beats the table on cost per artifact by less than 10 percent on 200 matched envelopes. Stresses: 4, 6. Receipt: `bid`, `award`.

**C. A constitution: rules compiled from `SOUL.md`, the Board record and the ACOS safety systems gate every route (v4's radical reading of the conservative direction).** Enables: the rules that exist in prose today become checks that run on every envelope of every class, with a person's decision receipt as the only way through for high-stakes classes; a partner estate adopts the rules without adopting the Queen; SARC (2605.07728) compiles obligations into four enforcement sites (pre-action gate, action-time monitor, post-action auditor, escalation router) with zero hard violations on a 50-seed eval, and ContextCov (2603.00822) turns instruction-file prose into executable constraints at 88.3 percent compliance against 67 percent. The ACOS v10 breaker thresholds (warn at 3, restrict at 5, break at 8 failures; `.claude/hooks/circuit-breaker.sh` lines 29 to 31) and the six agent IAM profiles become rules, so the budget idea from B survives without a market. Costs: a file and a test; no platform cost at any scale. Forbids: a route no rule allows; "just this once"; a high-stakes route without a human `decision` on the receipt. Falsifier: by 2026-11-30 the constitution blocks a route that a person then approves more than ten times (too tight) or never (decorative); and by 2026-12-31 a partner estate has adopted the rules file without the Queen (if none has, the portability claim is false). Stresses: 1 (the rules must be MIT and in the repo), 6 (compiled prose). Receipt: `route.check` on every `queen.route`; a human `decision` with `gate: "route"` on every high-stakes route.

**Choice: C as the frame, A as the router inside it, B rejected.** This inverts v3, which kept the Queen first and the constitution as an add-on for low-stakes classes. The inversion is justified by the table itself. Six of the fourteen classes in `tools/proving-ground/routing-table.json` are `autoApply: true`. Two of them (`constrained-output`, `interactive-agentic`) rest on three concordant rounds and meet the doctrine's A2 floor. The other four are Grok classes, and two of those (`memory-consolidation-queen`, `palace-visual-recall`) carry `confidence: high` with `rounds: 1`, which A2 forbids (`tools/proving-ground/ROUTING-DOCTRINE.md`: no high confidence with auto-apply before two concordant rounds). A router that already breaks its own floor needs its rules running as checks before it routes, and A2 is the first rule the constitution compiles (drift item 54). The constitution can run on the next envelope. Corrected on 26 September: the 21 September text said no class was auto-applied. Generals are the leadership-tier seats (Orchestrator, Prime, Architect) with named domains; HX and AX directors are two accountabilities that go to Board (section 7.3); producers are cohort and alliance operators running Claws; the Queen's board is the Starlight Board under the constitution's escalation rule. B lost because a market needs the receipt history the estate does not have, and because the sovereignty clause is not a price. Irreversible: none; the constitution is a test file, and its rules are re-derived on every Board record (v3's REVISE item stands).

### 2.4 ADLC

**A. Seven gates with one learn loop (v1 to v3).** Enables: every gate names who may not self-grade; Learn reads receipts. Costs: CI minutes. Forbids: a self-graded ship. Falsifier: by 2026-10-31 fewer than 80 percent of merged PRs across the four brand repos carry a receiptId or a web-release-gate audit. Stresses: 6. Receipt: `prove`, `ship`.

**B. Continuous eval-driven flow with no phases (radical).** Enables: every commit scored; the learn loop on every push; ACES (2608.20614) shows the skill gate can be a paired live trial rather than a review. Costs: about one brief per eval run: founder +€0.30 (100 evals), cohort +€12, estates per estate. Forbids: a human gate before the irreversible; 2604.27789 shows the deployer needs a checkpoint that blocks silent provider updates, which a threshold cannot express. Falsifier: by 2026-12-31 a passing change reaches production that a person would have stopped. Stresses: 4. Receipt: `eval` per commit.

**C. Executable spec harness at Prove (v3's instrument).** Enables: the spec runs; drift is caught by the spec; 2606.11686 shows a no-LLM, layer-isolated harness can run 238 cases in 2.4 seconds on every change, so the harness can be deterministic and cheap. Costs: authoring time; CI minutes. Forbids: an ask without a spec that can run. Falsifier: by 2026-11-30 the harness catches zero drift on ten features, or blocks more than a third. Stresses: 6. Receipt: `spec.run` attached to `prove`.

**Choice: A with C at Prove, and B adopted inside Build as the inner loop, never as the gate.** New in v4: one receipt per gate, enforced. The SIS `sip-self-receipt.yml` already attests the protocol profile with Sigstore keyless on every push to main that touches `protocol/`; v4 extends the pattern to a `gate.<name>` receipt per gate and a CI check that refuses a merge to any brand repo's main without a `prove` and a `ship` receipt id in the PR body. Papers beyond v1 appendix B's four, all 2026 and all verified to resolve (appendix E section 16): 2603.25697 (Kitchen Loop), 2608.20341 (SDAD), 2604.05278 (Spec Kit Agents), 2603.15676 (PROMOTE / HOLD / ROLLBACK), 2606.15474 (judge drift), 2608.20614 (ACES), 2606.11686 (layer-isolated harness), 2604.27789 (deployer-side gates), 2603.00822 (ContextCov), 2602.22302 (agent behavioural contracts), 2609.04681 (cost economics of the agentic SDLC, same author as 2604.26275). B lost because a threshold cannot sign.

### 2.5 Runtime

**A. AI SDK 7 ToolLoopAgent plus Workflow Development Kit on Vercel, Railway for daemons (v3).** Enables: agent-level `toolApproval` as the human gate; `usage` per step maps to `stages`; WDK steps with recorded I/O and replay; Gateway fallback by `order`; Token Factory as one `createOpenAICompatible` call. Facts as of 2026-09-21: `ai` 7.0.108, `workflow` 4.8.9 and 5.0.0-beta.55, a 25,000-event cap per run and a 2 / 5 / 10 minute inline budget (appendix E section 7); gencreator.ai is still on `ai ^4.0.0` and no estate repo declares `workflow` (appendix F). Costs: Vercel seat plus function usage; Railway two services: founder €17.45, cohort €48, estates per-estate projects. Forbids: a stateful MCP server on Vercel; a constellation run over 25,000 events. Falsifier: by 2026-10-31 a 30-artifact constellation cannot complete as a WDK workflow with a receipt per artifact. Stresses: 1 (a Vercel-specific durable primitive; 2609.17645 proposes replicating the WDK journal peer to peer precisely because the host holds it). Receipt: every stage is a step.

**B. Self-hosted durable runtime on Railway (conservative in tooling, radical in ownership).** Enables: no platform limits; private networking; one bill; the journal is ours. Costs: three to five services plus Postgres: founder +€20, cohort +€45, estates one deployment each; engineering hours are the real cost, at €100 to €150 an hour. Forbids: Vercel's preview-per-PR loop for the runtime; `toolApproval` unless rebuilt. Falsifier: by 2026-12-31 the self-hosted runtime completes fewer than 99 percent of steps on a month of real runs. Stresses: 1 in the good direction, 6. Receipt: same shape, our worker.

**C. Actor model: every seat a long-lived process with a mailbox (radical).** Enables: seats hold state between envelopes; matches the registry one to one. Costs: a supervisor and a mailbox store; the wrong cost shape for an estate that is mostly idle. Forbids: stateless previews, serverless pricing. Falsifier: by 2027-01-31 more than ten seats need state between envelopes rather than reading the vault. Stresses: 1 (actors accumulate state outside the vault), 6. Receipt: producible, but each actor needs a delegated key the registry does not model.

**Choice: A as the reference runtime, B as its conformance twin, C rejected.** New in v4: "two runtimes, one receipt". The web4 strategy already borrows the Ethereum framing; the part of that framing that matters is the two-client rule. A minimal second runtime (a plain Node worker on Railway that runs the same three stages and issues the same receipt) must pass the run-receipt conformance suite by the end of Q4, or the runtime is captured and invariant 1 is breached in fact. Cost: one Railway Hobby service (€4.36 a month) and roughly two to three days of engineering (≈ €1,700 to €2,600 at the freelance benchmark, one time). C lost because the registry shows zero seats that need a mailbox. Irreversible: none; the receipt is the interface.

### 2.6 Harness

**A. AGENTS.md shared, CLAUDE.md, GROK.md, GEMINI.md as supplements, packs by script, `/si` as dispatcher (v1 to v3).** Enables: four harnesses read one file; the web-excellence pack is in fifteen repos; `run.host` on the receipt is the drift detector. A fact v1 to v3 did not state: Claude Code reads CLAUDE.md, not AGENTS.md, natively (appendix E section 11), so "AGENTS.md as the shared file" is true for Codex, Cursor, Gemini CLI and Jules and false for the harness this estate runs most. Costs: none. Forbids: harness-specific behaviour that is not written down. Falsifier: by 2026-10-31 a run in Codex or Grok on the same brief produces stages that differ in kind from Claude Code's. Stresses: 6. Receipt: every host issues `run.host`.

**B. One compiled harness from `SOUL.md` and the registry (radical).** Enables: no hand-edited instruction file; drift is a diff in CI; `agentic-ops-hub` proves the sync at small scale. Costs: the compiler and a CI job per repo. Forbids: a repo-local CLAUDE.md edit that is not upstreamed. Falsifier: by 2026-11-30 fewer than half the active repos accept the compiled files without a manual override. Stresses: 1 (the compiler must be MIT), 6. Receipt: `harness.compile` per repo.

**C. Claude Code only, others as guests (conservative).** Enables: one harness to test. Costs: none. Forbids: the multi-CLI thesis and partner estates on other hosts. Falsifier: by 2026-10-15 more than a quarter of receipts come from hosts other than Claude Code. Stresses: 1. Receipt: from one host only.

**Choice: A now, B in Q4 for the three instruction files only, C rejected.** Sharpened: the compiler's first test is ContextCov's, not a diff. Compile the rules in `CLAUDE.md` and `AGENTS.md` into executable checks (the constitution, 2.3) and measure compliance on the last month's PRs before compiling prose for prose. B lost as a first step because the registry change it depends on (HX and AX) is at Board.

### 2.7 Memory

**A. Six JSONL vaults as truth, sqlite-vec sidecar, Supabase pgvector for shared state, palace as companion, AgentDB derived, mem0 adapter (v1 to v3).** Enables: sovereignty by file format; hybrid recall measured by `npm run eval:retrieval`. Facts: the primary substrate has been append-only JSONL since the 2026-05-24 flip (Board record 2026-05-23, 168 of 168 atoms migrated); `memory/vaults/*.md` in the repo are the six hand-maintained markdown vaults; `src/embedding.ts` has hashing and local transformer providers and no hosted one; `sqlite-vec`, `mem0` and `agentdb` are absent from SIS's dependencies and `agentdb` is declared in exactly one estate repo, frankx.ai-vercel-website, at `3.0.0-alpha.20`. Costs: founder €0, cohort +€21.82, estates per estate or the client's. Forbids: a hosted vector store as truth; Pinecone stays rejected because an index that cannot be exported byte for byte fails "replaceable without a rewrite", and no writing here defeats invariant 1. Falsifier: by 2026-11-30 recall at 10 falls below the sidecar's number on a corpus over 50,000 atoms. Stresses: 1, served. Receipt: consumes; the receipts ledger is a seventh file.

**B. Event-sourced memory: one append-only signed log, projections rebuilt per surface (v4's choice).** Enables: the vault JSONL, the work-graph events (`src/work-graph.ts`, ten event kinds from `intent.captured` to `work.completed`) and the receipts ledger become one log with one envelope (the DSSE envelope the receipt already uses); the six markdown vaults, the palace (`memory/palace/palace.json`), the console data layer, the SQLite index and the Supabase index become rebuildable projections run by one runner; deletion and consent become events with a replay; `AGENTS.md` already describes the vaults as "event-sourced JSONL truth" and "append-only event logs", so this direction aligns the doctrine's own words with its files. Evidence from the field: True Memory (2605.04897) keeps events verbatim in one SQLite file and moves the work to retrieval, scoring 93.0 percent on LoCoMo against Mem0's 61.4 under a matched answerer; Agent Zero Memory (2608.29606) derives an events timeline, an entity graph and a citation-locked fact layer from one history; MemDelta (2606.29914) warns that swapping only the embedder moves accuracy 6.2 points, so the projection must be rebuildable to re-measure. Costs: a projection runner: founder €0 (a script), cohort +€4.36, estates one per estate. Forbids: hand-editing a vault (the log is the write path); the six vaults being truth unless they become the log's first six projections, which is a taxonomy question and therefore Board. Falsifier: by 2026-12-31 a projection rebuilt from the log differs from the hand-maintained vault it replaces by more than 2 percent of atoms, or a full rebuild takes longer than one Sunday loop. Stresses: 1 (in the good direction: the log is a file) and the vault taxonomy boundary (Board). Receipt: every event is signed; `memory.project` per rebuild; `tombstone` and `consent.granted` are new event kinds.

**C. Typed knowledge graph with promotion rules as objects (radical on another axis).** Enables: atoms carry types and edges; promotion is a rule object with a receipt; contradiction detection (`src/contradiction.ts`, word-trigram Jaccard) becomes a graph query. Costs: a graph store: founder €0, cohort Supabase compute, estates per estate. Forbids: untyped atoms (most of the vault today); GraphRAG-style hosted graphs as truth (graph contract, forbid 4). Falsifier: by 2027-01-31 fewer than 30 percent of atoms are typed and linked. Stresses: 1 if hosted; the graph contract's four-graphs line. Receipt: `promote` per rule.

**Choice: B, blocked on Board; A stays in force until the Board decides; C's promotion rule adopted as an event kind.** v3 adopted B for receipts only and deferred the whole-memory question to Q1. v4 chooses it now and writes the proposal (section 7.1) because the estate already runs three append-only logs and five projections and pays the maintenance of five hand-kept views; the memory-log prototype demonstrates the mechanism with projections computed from the log in the page. The graph contract's promotion rule (six conditions: stable claim, evidence URI, privacy class, contradiction check, authorization, reversibility) becomes the `promote` event's schema. Erasure under GDPR article 17 on an append-only log is handled the standard way: a tombstone event, a rebuild that skips the subject, and per-subject encryption keys destroyed so that receipts keep their digest and lose the body; the plan says this rather than pretending the log is edited. A lost because it keeps five projections hand-maintained and offers no erasure story. C lost as a store. Irreversible: the event envelope, once signed events exist; hence Board first.

### 2.8 Models and cost

**A. The cascade (v1 to v3).** Enables: euros per artifact on every receipt; provider swap by config string. Costs: section 1.4; at list the brief is 10.8 times cheaper than one Haiku 4.5 call and 3.3 times after Haiku's cache and batch. Forbids: a lane without usage accounting. Falsifier: by 2026-10-31 on twenty matched briefs the cascade does not beat one Haiku 4.5 call at equal rubric score; the falsifier is quality, because the price gap is not in doubt. Stresses: 1, served by open weights. Receipt: `stages` with model, provider, tokens, euros, milliseconds.

**B. Per-creator LoRA fleets (radical).** Enables: a small Qwen3 carries each creator's format after sixty briefs; the training set is a list of receipt ids. Serving research now shows how to keep a fleet cheap (PreFT 2605.14217: prefill-only adapters keep multi-adapter decode throughput; ultra-LoRA 2608.03579; PLUME 2609.04715) and how to delete a user deterministically (2604.21571, deletable per-user proxies). Costs: training price on Token Factory is login-walled; the only public number is a stale 2025 figure of $0.40 per million training tokens for models under 20B. At that price a creator's sixty briefs at 3,000 tokens for three epochs is 540,000 tokens, $0.22, €0.19; cohort €7.6 a quarter; estates €190 a quarter; serving is "per-token billing" for hosted adapters, price unverified. Forbids: a creator with fewer than sixty receipts; a training run without a `train` decision on every source receipt; an adapter that cannot be exported (Nebius ToS §2 counts adapters as Customer's Content, which is the right answer, but export mechanics are unverified). Falsifier: by 2027-01-31 a blind rubric on ten creators does not prefer the adapter's output by more than the rubric's noise. Stresses: 1 (export), 4 (encoded-self boundary, SIP §5.7: a voice adapter is close to a fingerprint and must stay the creator's). Receipt: `train.lora` with evidence = source receipt ids.

**C. A router trained on our own receipts (radical).** Enables: the routing table stops being hand-derived. The 2026 routers to test against: TRACE-Router (2607.22465, routes once per task at admission and learns from the delayed task outcome, which is what a receipt is), OrcaRouter (2605.30736, seeded offline then online from partial feedback), ParetoBandit (2604.00136, a dollar ceiling enforced in closed loop), UCCI (2605.18796, calibrated cascade escalation, 31 percent cost cut at fixed quality on 75,000 production queries). Costs: a small classifier; the cost is the thousand receipts it needs. Forbids: routing before the receipts exist; routing high-stakes classes (A1 holds; the constitution runs first). Falsifier: by 2027-03-31 the router does not beat the hand cascade on cost per artifact at equal score on 200 matched briefs. Stresses: 4. Receipt: `route.model` with the router version.

**Choice: A with three sharpenings; C at a thousand receipts; B only where a receipt proves a format is stable.** First, batch is the default for every non-interactive stage (section 1.4), because Nebius's discount is 50 percent and the constellation is never watched live. Second, extraction and embeddings get a local lane (`provider: local`, Nemotron 3 Nano 4B on any 8 GB machine, the 30B-A3B on a 32 GB Mac; measured 86 tokens a second on an M4 Max, appendix E section 6), which is B4's cable-pulled falsifier made concrete. Third, "a thousand receipts" is restated as a precondition rather than a date: at founder volume it is five months away, at cohort volume four days, so the router experiment is scheduled for the first cohort week, not for Q1. Speculative decoding stays the provider's job (Token Factory's `-fast` flavours; vLLM 0.29 supports EAGLE-3, MTP, n-gram and draft-model methods, one per server); prefix caching stays absent on Token Factory and is priced only where it exists (2607.15516 measures Sonnet's cache threshold at about 3,500 tokens and writes at 12.5 times reads, so v3's 70 percent hit assumption is optimistic below that prompt size). Distillation from frontier traces (2604.07776, 2608.23911) is how B's small model would be made and is not on the path until B is.

### 2.9 Design

**A. Liquid objects on each surface's tokens, kernel shared, receipt card shared by copy (v3).** Enables: four registers stay distinct; the printed receipt is the one object with material. Costs: review time. Forbids: a library that flattens registers; anything that reads as generated. Falsifier: by 2026-12-31 the same component is built twice with different bugs. Stresses: 6. Receipt: `web.release` with screenshots at 375, 768 and 1440.

**B. One estate-wide design system package with four registers (radical).** Enables: one `@starlight/ui`; `@arcanea/design-system` 0.3.0 is the precedent. Costs: a package and a release process. Forbids: a surface-native component the package lacks. Falsifier: by 2027-01-31 the package is imported by fewer than three surfaces. Stresses: 6, 1. Receipt: `design.release`.

**C. Surface-native systems sharing only the kernel (conservative).** Enables: each surface at its own speed. Costs: duplication. Forbids: cross-surface consistency beyond the kernel. Falsifier: the same as A's. Stresses: 6. Receipt: `web.release`.

**Choice: A, with exactly one shared package, and it is not a design package.** The verifier and the receipt card ship as `@starlight/receipt` (MIT, no dependencies, `node:crypto` and WebCrypto), imported by the four brand repos and by any partner estate. The reason is trust rather than design: the two copies of `run-receipt.ts` are already on different branches of two repos (appendix F), and a verifier that drifts is worse than no verifier. The card takes the surface's tokens through CSS variables, so registers stay distinct. B stays deferred by the web roadmap's "not before" rule; C is what A already is. The survey adds three design-contract drifts to fix before any of this: gencreator.ai's `design.md` retires the blue, cyan and green triad while its `taste.md` still mandates it; frankx.ai's `CLAUDE.md` describes `design.md` as a full token spec while the file carries colours only and defers to a Windows path that does not exist in the repo; arcanea's `DESIGN.md` has the same unreachable path (appendix F section 3). Reject anything that reads as generated: the audit script from the pinned kernel is run on every public document in this PR (appendix F section 5).

### 2.10 The demo, 23 September

**A. The Desk with room mode (v1).** Enables: one question from the room becomes a cited brief with a receipt on stage; the room shares a vault. Costs: `c_brief` per question; a QR intake page. Forbids: nothing. Falsifier: the receipt on stage does not verify live. Stresses: 2. Receipt: `desk.brief`.

**B. A live estate build in front of the room (radical).** Enables: the strongest proof of the factory. Costs: the whole build window. Forbids: the Desk polish. Falsifier: the build finishes before 15:00 with a verified receipt. Stresses: 5. Receipt: `estate.provision`.

**C. Phone verify plus countersign (v4's radical reading of v3's phone verify).** Enables: the judge's phone verifies the brief they watched being made and then signs a statement into the ledger with a key the phone made; the count of distinct countersigning keys is the "verified by others" metric, recountable by anyone. WebCrypto Ed25519 has shipped in Safari 17, Firefox 130 and Chrome 137 (stable 2025-05-27), so the key is native on every 2023 or later phone; a pure-JS fallback verifies in about 0.5 milliseconds on desktop (noble-ed25519, appendix E section 11), and no published mobile figure exists, so the rehearsal measures it. Costs: the `r` parameter and QR already on the web branch (PR 54, commit 4b73528: "phone verify — /verify?r=, QR on the printed receipt, share link"); a ledger table and a countersign endpoint on the .ai project; no inference. Forbids: nothing; it composes with A. Falsifier: fewer than five phones countersign during the pitch, or any phone takes over a minute from scan to signature. Stresses: 2 (the attestation invariant made public and mutual). Receipt: consumes `desk.brief`; produces `countersign` (new kind, issued by the phone's key).

**Choice: A plus C; B rejected for the day.** v3's phone verify made the judges verifiers. v4 makes them signers. The difference is the difference between a counter on our server and a list of signatures a stranger can recount, and it is the only move on the day that turns the zero into a number nobody has to take our word for. The prototype is `ledger-countersign-prototype.html`; the inclusion proof in it is computed in the page. The registry key remains Frank's Desk key added by PR the night before (drift item 18).

---

## 3. Part B: the twelve dimensions v1 left out, three directions each

Same format. Where a dimension had one paragraph in v3, that paragraph is the "current default" direction unless the survey shows a different default in the files.

### 3.1 Economics

**A. Open core with managed tiers (the default in `LICENSING.md`, `docs/strategic/sip-web4-substrate-strategy.md`).** Enables: adoption of the protocol at zero price (invariant 3 makes the spec's licence permanent); a managed tier for what people will not run themselves. Facts: no open-core company in the surveyed set (GitLab, Supabase, Cal.com, PostHog, n8n, Sentry) publishes a free-to-paid conversion rate; licences verified from their LICENSE files are MIT plus proprietary `ee/` (GitLab, PostHog), Apache 2.0 (Supabase), Sustainable Use (n8n), FSL converting to Apache after two years (Sentry), and Cal.com moved its commercial edition closed in April 2026 while the community edition stayed MIT (appendix E section 17). Costs: the managed tier's platform line at each scale is the hosted row in section 1.4 (≈ €23,000 a month at a thousand estates before usage). Forbids: a tier that only works hosted (invariant 1). Falsifier: by 2027-03-31 the managed tier has fewer than ten paying tenants, in which case the tier is a cost centre for the retainers. Stresses: 3 (the spec must stay MIT while the tier is priced). Receipt: `subscription` (new kind, issued monthly per tenant).

**B. Everything priced per receipt (radical).** Enables: the price is a query over the ledger; a customer can audit the invoice from receipts they hold; precedents exist for per-artifact trust pricing (DocuSign's API overage is roughly $4 to $7 an envelope; Truepic starts at $1,000 a month with per-inspection rates; Sigstore is a free public good; appendix E section 17). Costs: at `c_brief` €0.0029 and `c_art` €0.000257, a price of €0.05 per receipt would carry a 17× to 195× markup on inference, so the unit price is a decision about value rather than cost; founder ≈ 200 receipts, cohort ≈ 8,000, estates ≈ 2,000,000 a month at that illustrative price = €10, €400, €100,000 a month (example, not a proposal). Forbids: any price before receipts exist; a public price on gencreator.ai before the offer-truth gate passes. Falsifier: by 2027-06-30 fewer than 1,000 receipts have been verified by keys that are not ours, in which case nobody is paying for verification and the unit is wrong. Stresses: 5 (charging alliances per receipt inverts the gift), 1 (a metered product must still export). Receipt: `invoice` referencing receipt ids.

**C. Estate retainers as the annuity (conservative, and the only direction with a document behind it).** Enables: revenue now, from the channel DELIVERY §7 already describes; the retainer's monthly report is a receipt list. Facts: the web4 doc states the range Frank chose to write (build €25,000 to €75,000, retainer €1,500 to €5,000 a month) and adds "exact numbers via Frank and board"; the 2026-06-16 Board gated pricing elevation on six REVISE items; European fractional CTO or AI-architect retainers benchmark at €2,500 to €12,000 a month for two to eight days a month (third party); professional-services project margin averaged 37.7 percent in 2025 (SPI Research, third party). Costs: human time; at €108 an hour (Dutch ICT freelance average, third party) a €3,000 retainer buys 28 hours a month, which is the steward's real capacity per estate. Forbids: scale beyond the steward bench; a retainer to an alliance (invariant 5 says those are gifts). Falsifier: by 2026-12-31 fewer than three retainers signed with a client-held key and a monthly receipt list, in which case the annuity is a plan. Stresses: 5. Receipt: `estate.provision`, then a monthly `steward.report` whose evidence is the month's receipt ids.

**Choice: C funds the year, A holds by invariant, B becomes the metering unit inside C and A rather than a public price.** Unit economics at three scales, all labelled example and derived from the facts above:

| Scale | Revenue model | Monthly revenue (example) | Monthly cost (section 1.4 plus people) | Note |
|---|---|---|---|---|
| One founder (Frank's own estate) | none; the estate is the proof object | €0 | ≈ €18 platform and inference | the cost of being able to show a receipt |
| One cohort of forty | seat price p on Skool Pro ($99 a month, 2.9 percent plus $0.30 per transaction, appendix E section 11) | 40 × p × 0.971 − 40 × 0.26 − 86.39; at p = €50 ≈ €1,845; at p = €100 ≈ €3,787; at p = €200 ≈ €7,670 | ≈ €57 platform and inference plus the host's hours | p is unset; the offer-truth gate decides when a number is public |
| One thousand estates, client-hosted | steward retainers at r per estate | 1,000 × r; at r = €1,500 (the low end of the stated range) €1.5 million a month | inference ≈ €1,128 billed through the clients' keys; stewards: 1,000 × 28 hours is 28,000 hours a month, which is 175 full-time stewards | the arithmetic says a thousand estates is a design load for the substrate and an impossibility for a bench; the factory promotes the reusable 80 percent back (Board 2026-06-16 REVISE 1) or the number is fiction |

The last row is the honest one: at a thousand estates, retainers are not the model. What scales is the receipt (B) on the substrate (A), which is why B is the metering unit from day one even though it is not the price. Losers: A alone cannot pay for the year; B alone has no customers because nothing has been verified.

### 3.2 Trust and provenance

**A. Signed SIP receipts as today (v2, v3).** Enables: DSSE plus in-toto plus Ed25519, one verifier for the conformance receipt and the run receipt (`src/run-receipt.ts`); a Sigstore keyless attestation of the protocol profile on every push to main that touches `protocol/` (`sip-self-receipt.yml`), which is already an entry in a public transparency log, though only for the profile. Costs: €0. Forbids: a claim without a key behind it. Falsifier: by 2026-10-31 the registry still holds zero keys. Stresses: 2. Receipt: the receipt itself.

**B. C2PA content credentials on every rendered asset plus verifiable credentials for agent identity (conservative, mainstream).** Enables: the marks platforms already read. Facts: C2PA 2.4 (April 2026) with Deployment Guidance 1.0 (2026-07-08); LinkedIn displays and preserves credentials, TikTok preserves, YouTube shows a capture note, X displays for Premium but strips, Meta reads then strips; Suno attaches C2PA to downloaded songs; Higgsfield claims a July 2026 trust list (unverified); OpenArt and ElevenLabs unknown (appendix E section 11). Two formal analyses (2604.24890, 2603.02378) find the specs fall short of their security goals. VC Data Model 2.0 is a Recommendation (2025-05-15); DID 1.1 is a Candidate Recommendation; the live agent-identity products are Entra Agent ID and Okta's Agent Gateway. Costs: none per asset (royalty-free); engineering to attach and to link. Forbids: relying on the manifest surviving a platform. Falsifier: by 2026-12-31 fewer than half of the rendered assets published through the spine still carry their manifest where they are viewed. Stresses: 1 (a trust list is someone else's registry). Receipt: `render.*` links the manifest; the receipt is still the proof object.

**C. An attestation transparency log with countersignatures, off-chain first (radical, v4's choice).** Enables: the public ledger of published receipts with an inclusion proof against a daily root; every verification by a stranger's phone appended as a signed statement; "verified by others" becomes a recount. The literature converged on this shape in 2026: Notarized Agents (2606.04193, receiver-signed receipts into a transparency log, with the caveat in the paper itself that no service has an incentive to emit them yet), Agent Flight Recorder (2609.01931, hash chains, Merkle batching, optional on-chain anchoring for cross-organisation disputes), offline-verifiable evidence bundles (2608.28542), ClaimReceipt (2609.01992, PASS / INVALID / INCONCLUSIVE per claim against a signed manifest). Infrastructure: Rekor v2 (tile-backed, self-hostable with Helm; the public instance rotates yearly and v1 caps entries at 100 KB), so the log can be our own Postgres table first and a self-hosted Rekor later without changing the receipt. Costs: a table and a cron on the .ai project's Supabase: founder €0 extra, cohort €0 extra, estates at ≈ 2 KB per entry and 2,000,000 entries a month ≈ 4 GB a month, which passes Supabase Pro's 8 GB in two months (extra disk is per gigabyte; price not verified this pass), so at estate scale the log is per estate or self-hosted Rekor on one small VM. Forbids: payload retention on the log (envelopes and hashes only); on-chain anchoring by default. Falsifier: by 2026-12-31 fewer than 100 countersignatures from keys that are not ours, or a rebuild of the inclusion proofs from the log disagrees with a published root. Stresses: 2 (made mutual), 1 (the log must be exportable and re-checkable offline). Receipt: `countersign`, `ledger.root` (daily).

**Choice: C on top of A, with B's manifests linked rather than trusted, and agent identity credentials deferred.** On-chain anchoring is allowed only where the Crypto IS falsifier earns it (a cross-organisation dispute that a published root did not settle); the Crypto IS proof-of-pattern (`VERTICALS.md`) has not passed, so the default is off-chain. AP2 mandates govern anything that moves money: `payment-intelligence-system` verifies Ed25519 AP2 mandates fail-closed with spend caps and an audit write before the decision (43 tests, `mcp/src/mandate.ts`, `spend-cap.ts`, `audit.ts`), never moves funds, and lists x402 as out of scope (appendix F section 3). A `spend` decision on a receipt therefore references a mandate id, and the receipt's `evidence` carries the audit entry. B lost as the primary because two formal analyses say the manifest is not proof and three platforms strip it.

### 3.3 Regulation and residency

**A. Posture notes on the surfaces (v3's paragraph).** Enables: honesty in prose. Costs: none. Forbids: nothing. Falsifier: a regulator or a client asks for evidence and the answer is a paragraph. Stresses: 2. Receipt: none; ineligible as a chosen direction.

**B. A compliance receipt as a stage of the spine (radical, v4's choice).** Enables: every publish carries a `compliance.check` receipt whose evidence lists: the Article 50 marking state (Article 50(1), (2) and (5) apply from 2026-08-02, not deferred by the Digital Omnibus, Regulation (EU) 2026/1744 in force 2026-07-27; systems on the market before 2026-08-02 have until 2026-12-02 for the machine-readable marking); the provider data clause in force for the run (Nebius: inputs and outputs stored in Finland and used to train speculative-decoding drafters unless Zero Data Retention is on; public endpoint compute location dynamic; EU pinned only on dedicated endpoints; Anthropic first-party: US or global only); the output-rights basis per renderer (Suno: rights assigned for downloads while subscribed, no copyright warranty; Higgsfield: no ownership claim, commercial on all plans, a training licence retained until deletion; OpenArt: commercial from Plus; ElevenLabs: paid plans only); the model licence per lane (DeepSeek V4 MIT, Qwen3.5 Apache 2.0, Nemotron Open Model License with a NOTICE file, Kimi K3 under its own licence with a separate agreement above $20 million of model-as-a-service revenue in twelve months, Llama 4 with the 700 million MAU clause); and the GPAI provider test for any fine-tune (a modifier becomes a provider only above roughly one third of the original training compute, so no LoRA in this plan crosses it). Costs: `c_comply` €0.0001 per publish; founder €0.002, cohort €0.08, estates €20 a month. Forbids: a publish without the receipt; a claim of "EU-hosted" that the receipt cannot show. Falsifier: by 2026-12-02 (the marking grace date) any asset published through the spine lacks a machine-readable marking, or by 2026-11-30 the compliance receipt has never blocked a publish (then it is decorative). Stresses: 2. Receipt: `compliance.check`.

**C. Legal review per release (conservative).** Enables: a human reads the terms. Costs: hours. Forbids: cadence. Falsifier: the review is skipped under time pressure, which it will be. Stresses: 6 (enterprise process). Receipt: none by default.

**Choice: B, with C reserved for the first release of each renderer adapter.** The residency rule that follows: thinking runs on Token Factory with Zero Data Retention on and the receipt records `provider: nebius-zdr`; anything that needs EU-pinned compute uses a dedicated endpoint and the receipt says so; Claude at the protocol layer is used through the first-party API for non-personal data only, or through an EU region of Bedrock, Vertex or Foundry where personal data is present, and the receipt names the route. The EU-US Data Privacy Framework stands after the General Court's 2025-09-03 ruling with the appeal C-703/25 P pending; the receipt does not depend on it. A and C lost because neither produces a receipt.

### 3.4 Compute sovereignty

**A. Hosted Token Factory (v1 to v3).** Enables: the cascade at list price with no operations; EU-headquartered; Zero Data Retention. Costs: section 1.4. Forbids: pinned EU compute without a dedicated endpoint (price login-walled). Falsifier: Nebius changes the ToS or the price such that a receipt's `provider` line becomes untrue, and the plan has no second lane. Stresses: 1. Receipt: `stages.provider`.

**B. Own vLLM on Nebius AI Cloud GPUs (conservative in ownership terms, expensive).** Enables: pinned region, our own drafters, no ToS clause. The arithmetic: one H100 at $3.85 an hour is €3.36, which is €2,419 a month on demand and €1,351 preemptible. DeepSeek V4 Flash at 284B parameters needs roughly 284 GB at FP8, an eight-GPU node, ≈ €19,350 a month on demand; the whole thousand-estate inference line is €1,128. Nemotron 3 Nano 30B-A3B fits one H100 at FP8, ≈ €2,419 a month, against an extraction spend of 200,000 briefs × $0.00072 = $144 ≈ €126 a month at estate scale. NVIDIA AI Enterprise for NIM adds $4,500 per GPU per year (third party). Costs: as stated. Forbids: the serverless price curve. Falsifier: monthly token spend on any single-GPU-sized model exceeds ≈ €2,400, the crossover; nothing in section 1.2 comes within a factor of ten of it. Stresses: 1 in the good direction; 6 (operations toil). Receipt: same, `provider: self-vllm`.

**C. On-device with an offline sovereign mode (radical, v4 adopts it as a lane).** Enables: extraction and embeddings on Apple silicon at zero marginal cost; a brief that runs end to end with the network cable pulled. Measured: Nemotron 3 Nano 30B-A3B at Q4 is 24.6 GB and runs at 86 tokens a second on an M4 Max, the 4B is 2.84 GB and runs at 16 tokens a second on an iPhone 17 Pro (llama.cpp discussion 20421, fetched); vLLM is not the local runtime, llama.cpp or MLX is. Costs: hardware amortised; €0 per token. Forbids: judgment-quality synthesis offline (the 30B-A3B extracts; it does not write), so an offline brief has a lower rubric score and the receipt says so. Falsifier: by 2026-12-31 no signed `desk.brief` exists with every stage `provider: local`; or the offline brief scores more than two rubric points below the cascade's on twenty matched questions. Stresses: 1, served fully. Receipt: `stages.provider: local`; `run.host` records the machine class.

**Choice: A now, C as the second lane from Q4, B rejected on the crossover.** The receipt makes the lane a config string, so the choice is reversible by editing one line. "The estate runs with the cable pulled" is the Q4 falsifier for C and the only one of the three that tests invariant 1 in public.

### 3.5 Data flywheel and consent

**A. Receipts as training data, implicitly (the default nobody wrote down).** Enables: nothing that the others do not. Forbids: nothing, which is the problem. Falsifier: a creator asks what was trained on their receipts and the answer is not a list. Stresses: 4 (encoded-self boundary). Receipt: none; ineligible.

**B. Per-creator adapters on that creator's data only; a router trained on routing receipts; synthetic evals from a public dataset (radical, v4's choice, with the rule written).** The consent rule, in full:

1. No artifact trains anything unless its receipt carries a `decision` with `gate: "train"`, `decidedBy: "human"` and `outcome: "approved"`, given by the creator whose data it is.
2. A training run issues a `train.lora` receipt whose `evidence` lists every source receipt id; a training set is a list of receipt ids and nothing else.
3. A creator's adapter is that creator's: exportable on request, deletable on request (2604.21571 gives the deterministic-unlearning shape), and never merged into a shared model. Starlight never trains a shared model on creator content.
4. The router trains only on routing metadata: model, provider, tokens, euros, milliseconds, rubric score, verdict. Never on prompt or output text.
5. Renderer accounts are the creator's own. Suno's rights attach to the subscribing account's downloads; Higgsfield retains a training licence until deletion; so a Starlight-held renderer account would hold the creator's rights and licence the creator's content to a third party. The adapter takes the creator's key.
6. Synthetic evals come from a public, human-reviewed dataset only. The "Horizon dataset" named in the brief does not exist in `starlight-evals` (appendix F); the public Horizon vault mirror (`starlight-horizon-dataset`, fifteen letters per `metrics/current.json`) is the candidate and is too small for anything but a smoke set.

Enables: a flywheel that a regulator, a creator and a court can each audit from receipts. Costs: LoRA as in 2.8 B; router €0; evals `c_brief` per synthetic question. Forbids: everything the rule forbids. Falsifier: by 2027-01-31 any `train.lora` receipt exists whose evidence includes a receipt without a `train` decision (the rule is not enforced), or no creator has granted one (the rule is too heavy). Stresses: 4, served. Receipt: `train.lora`, `consent.granted` (event kind, 2.7).

**C. No training on anything (conservative).** Enables: no consent surface. Costs: none. Forbids: the adapter fleet, the router, the flywheel. Falsifier: a competitor's per-creator adapter beats the cascade on voice by more than rubric noise (2.8 B's falsifier, from the other side). Stresses: none. Receipt: none produced; consumes nothing.

**Choice: B.** C is what the estate does today by default, and nobody chose it.

### 3.6 Interop standards

**A. MCP, A2A, AP2 and x402, AGENTS.md, SIP as memory protocol, an agent registry (the v3 paragraph).** Facts: MCP's current revision is 2026-07-28 with the TypeScript SDK split into `@modelcontextprotocol/server` and `/client` 2.0.0 (2026-07-27), OAuth 2.1 with Client ID Metadata Documents preferred, and an official registry still in preview at API v0.1; A2A v1.0 shipped 2026-03-12 with signed agent cards (JWS over JCS-canonical JSON at `/.well-known/agent-card.json`); AP2 v0.2 (April 2026) with intent, cart and payment mandates as W3C verifiable credentials, donated to the FIDO Alliance; x402 formalised under the Linux Foundation 2026-04-02 with a V2; AGENTS.md first committed 2025-08-21 and stewarded by the Agentic AI Foundation. Enables: the estate speaks every current protocol. Costs: none. Forbids: nothing. Falsifier: a partner cannot verify a Starlight receipt with a standard tool. Stresses: 1. Receipt: consumed by tools.

**B. SIP as an open standard with a conformance suite built from the proving ground (radical, v4's choice for the receipt).** Enables: a second implementation can prove it is conformant without asking us; `protocol/conform.mjs` already does this for the graph profile (rules G, C1, P1 to P5, 45 tests), so the pattern exists; the run receipt gets the same: fixtures, a checker, a receipt for the checker's own run. Costs: authoring; CI minutes. Forbids: a receipt format change without a version bump (the 90-day deprecation window in `SIP.md`). Falsifier: by 2027-03-31 no implementation other than ours passes the suite (then it is a spec with one client). Stresses: 3 (must stay MIT), 1. Receipt: `conformance` (the checker's own).

**C. Adopt others' standards only, publish none (conservative).** Enables: no maintenance. Forbids: the receipt as a standard. Falsifier: the receipt predicate type is copied by someone else with a different shape and the two cannot be told apart. Stresses: 2. Receipt: consumed only.

**Choice: B for the run receipt, A for everything else.** Concretely: ratify `starlight.run-receipt.v1` as a SIP graph extension at v1.2.0 (Board, section 7.2); publish the predicate type and the conformance suite; carry a receipt id in A2A agent-card metadata and in AP2 mandate references; hold x402 until an agent is a paying customer (B7), because population-scale measurement (2607.12575) shows x402 settlement counts do not measure adoption and the formal analysis (2609.00060) maps open issues in all four payment protocols. The "agent registry" in the brief is `REGISTRY.md` (flat file, "v1.1 will promote to a queryable MCP") and it stays a flat file until a second party registers.

### 3.7 Distribution through agents

**A. AEO and GEO, the seven export targets, the handover bundle, skill and plugin stores (the v3 paragraph).** Facts: the seven `/sip-export` targets are in SIS (`AGENTS.md`: claude-project, chatgpt-project, gemini-gem, cursor, cowork, microsoft-copilot, custom-gpt), not in `agentic-intelligence-system`, whose emitter has three generators (llms.txt, agents.json, JSON-LD); no skill or plugin store pays creators as of 2026-09-21 (the Anthropic skills repo describes no marketplace; the GPT Store pilot was US-only in January 2024 and its 2026 status is unconfirmed; Cursor and Codex plugin marketplaces have no payout). Enables: presence everywhere. Costs: none. Forbids: nothing. Falsifier: fewer than one in five verifications arrives through an agent host by 2026-12-31. Stresses: 5. Receipt: consumed.

**B. The primary customer is another agent (radical, v4's choice).** Enables: the operator's agent is the buyer of verification: it calls `verify_run_receipt` on the .ai MCP endpoint, reads `/ledger` as JSON, and countersigns with its own key (an agent's key is a key; the registry lists it with an owner). Every public surface is agent-readable first: `llms.txt`, `agents.md`, JSON-LD and the schema route already exist on the .ai site (`app/llms.txt`, `app/agents.md`, `app/schemas`). Costs: none beyond B2's ledger. Forbids: a page whose facts are not also a tool result (the headless conformance test of 2.1). Falsifier: by 2026-12-31 fewer than 100 countersignatures come from agent keys (as opposed to phones). Stresses: 1 (an agent customer must be able to leave with its receipts). Receipt: `countersign` with `actorId` an agent key.

**C. Human sites only (conservative).** Enables: focus. Forbids: the thesis. Falsifier: the sites get traffic and the tools get none. Stresses: 5. Receipt: none new.

**Choice: B, with A as its distribution and C rejected.** The seven export targets carry the verify tool; the OpenClaw and Jarvis handover bundle (`CLAWS.md`, phase 3 attestation claw, planned) becomes the receipt claw. AEO and GEO are a consequence: an agent that verified a receipt cites the page that holds it.

### 3.8 Voice, video, spatial

**A. Live voice on the Desk, programmable video, vision models, palace and console 3D (the v3 paragraph).** Facts: `starlight-voice` is paused at the v3 spec stage (`ECOSYSTEM_ARCHITECTURE.md`); the console ships a 2D force graph by default and a 3D scene as the signature view with the honesty rule "nothing pre-cached masquerades as live"; `CLAUDE.md` calls the palace a companion view and keeps the vaults authoritative; `gencreator.ai` has a HyperFrames compiler under `lib/post-production/`; the frankx repo has 34 real Descript references and one voice comparison post; Kimi K3 is 1M context with native vision, Nemotron 3 Nano Omni takes image, video and audio (third party). Enables: every modality. Costs: ElevenLabs Creator $22 for about 121 minutes (≈ €0.16 a minute); Higgsfield Starter $19 for 270 credits; per-clip credits unverified. Forbids: nothing. Falsifier: any modality ships without a receipt. Stresses: 2. Receipt: `voice.session`, `render.*`.

**B. The memory palace is the interface (radical).** Enables: spatial recall as the operator surface. Costs: R3F and a scene per estate. Forbids: the console's honesty rule unless the palace reads live data. Falsifier: the palace shows a room whose atom is not in the log. Stresses: 6 (spectacle over legibility; the Luminor REVISE that made the 2D view the default). Receipt: consumes; produces none. Rejected.

**C. Text first, media as renderers only (conservative).** Enables: focus. Forbids: voice as a producer. Falsifier: a cohort asks for voice and leaves. Stresses: 5. Receipt: `render.*` only.

**Choice: A with two rules, B rejected, C as the default until the rules are met.** Rule one: voice resumes only as a receipt producer (`voice.session` with the transcript's digest as subject), never as a chat surface. Rule two: video is a renderer behind an adapter (HyperFrames for programmable, Descript for edited, Higgsfield for generated), each a `spend` decision with a compliance receipt, each carrying its manifest where the renderer provides one (Suno does). Vision models enter the cascade as a lane for reading charts inside sources, with `stages.model` naming them.

### 3.9 Physical estate

**A. Separate Vercel projects per asset (the current default).** Facts, verified against the Vercel team this session: the team holds exactly 59 projects; `retreat-os`, `rova-resort`, `property-intelligence`, `aurevia-solar` and `solarcarport-tech` exist as projects; none of those five names appears in any of the eight surveyed repos except `property-intelligence` in frankx.ai's downloads (appendix F section 4). Enables: nothing shared. Costs: each project is a seat's usage. Forbids: receipts, because none of them issues one. Falsifier: any of the five issues a receipt without changing shape (then A was fine). Stresses: 1 (dormant surfaces are attack surface). Receipt: none; ineligible.

**B. One estate OS where physical assets and retreats are verticals with receipts (radical, v4's choice, bounded).** Enables: a retreat is `room.session` receipts plus `spend` decisions; a property is a vertical only when a decision about it produces a receipt (a purchase mandate, a solar yield log). Facts for context, all third party: 235 houseboats sold through NVM brokers in 2025 at an average of €466,000, a quarter in Amsterdam; Marbella €5,581 per square metre (May 2026), Fuerteventura La Oliva €3,680 (August 2026), Lanzarote ≈ €2,975 (Q1 2026); the Dutch netting scheme for solar ends 2027-01-01 with typical payback six to nine years; Spanish and Canary retreats list at €600 to €2,350 per seat for three to eight days, Croatian hosted weeks €500 to €1,950. Costs: none beyond the receipt. Forbids: a vertical without a receipt. Falsifier: by 2027-03-31 no `room.session` receipt exists for a retreat with more than five seats. Stresses: 5 (retreats are where alliances meet; the receipt must not turn the gift into a ledger of favours). Receipt: `room.session`, `spend`, `estate.provision`.

**C. Archive all five until a retreat is booked (conservative).** Enables: attention. Forbids: nothing that has happened. Falsifier: a booking arrives and the surface is gone. Stresses: none. Receipt: none.

**Choice: B for retreats and the houseboat as surfaces, C for the other three until a receipt exists.** Concretely: `retreat-os` and `rova-resort` are the retreat surface and get the `room.session` receipt when the first cohort room runs; `property-intelligence`, `aurevia-solar` and `solarcarport-tech` receive dormancy markers in the Vercel project description and in `VERTICALS.md`'s pattern (append-only, `status: dormant`) until one of them issues a receipt.

### 3.10 Education, community, games

**A. Several academies, several communities, games as a front door (the current default).** Facts: Vercel projects `aiarchitectacademy`, `starlight-intelligence-academy`, `arcanea-academy`, `vibeclubs-web`, `gencreator-community`, `frankx-community-hub` exist; gencreator.ai's ADR-001 chose Skool plus a custom hybrid and ADR-003 keeps LiveKit inside Vibeclubs; `anime-legends` skills are not in git (arcanea's skills index marks them external); games are Arcanea canon (CC-BY-NC). Enables: many doors. Costs: platform fees: Skool Pro $99 a month plus 2.9 percent and $0.30; Circle Professional $89 plus 2 percent on top of Stripe; at 40 seats × €100 the fee difference is under €10 a month, so the choice is by feature rather than fee. Forbids: focus. Falsifier: two academies teach the same exercise differently. Stresses: 6 (four voices). Receipt: none by default.

**B. The academy is the on-ramp to every estate commission; every exercise ends in a receipt the learner signs (radical, v4's choice).** Enables: a learner's first act is to verify a receipt on their phone (2.10), their second is to issue one with a throwaway key, their tenth is a commission conversation with a receipt list attached. Costs: `c_brief` per exercise; a Skool Pro plan €86 a month. Forbids: an exercise without a receipt; an academy that does not end in the estate path. Falsifier: by 2027-03-31 no commission conversation cites a learner's receipt list. Stresses: 5 (teaching is a gift until it is a commission). Receipt: `exercise` (issued by the learner's key).

**C. One academy, everything else archived (conservative).** Enables: attention. Forbids: Arcanea's academy, which is canon and not Starlight's to archive. Falsifier: none needed. Stresses: 5. Receipt: as B.

**Choice: B on `starlight-intelligence-academy`, with `aiarchitectacademy` redirected there and `arcanea-academy` left to Arcanea; Skool per ADR-001; games stay Arcanea's.** Vibeclubs remains the live-room surface (ADR-003) and issues `room.session` receipts as in 3.9.

### 3.11 Observability and cost control

**A. OpenTelemetry traces inside the receipt, a cost dashboard per seat, circuit breakers, promptfoo in CI (the v3 paragraph).** Facts: OpenTelemetry is prose in every estate repo with no `@opentelemetry/*` dependency or SDK initialisation anywhere; the GenAI semantic conventions are still marked Development and moved to `semantic-conventions-genai`; ACOS has real breakers (warn 3, restrict 5, break 8) and a JSONL cost tracker but no dashboard; promptfoo is configured in exactly one repo, `starlight-evals` (`promptfooconfig.yaml`, a local `claude` CLI provider), whose README banner marks it stale since 2026-07-10; SIS's cost plane has a schema template with daily caps ($5 Vercel, $20 Anthropic) and a snapshot cron (appendix F). Enables: the vocabulary. Costs: none until wired. Forbids: nothing. Falsifier: a runaway run is caught by a human rather than a breaker. Stresses: 2. Receipt: `evidence` carries a trace id.

**B. Agent observability as its own product (radical).** Enables: the vendors' business. Facts: every observability vendor in appendix C section G holds the proof on its side; the customer-held alternative is the receipt. Costs: a product. Forbids: the receipt thesis. Falsifier: a customer buys the dashboard and not the receipt. Stresses: 1. Receipt: vendor-held; rejected.

**C. The receipt is the only cost control, no dashboard (conservative).** Enables: no second metrics store (the v2 rule). Forbids: a breaker, which runs before the receipt exists. Falsifier: 2606.04056 catalogues 63 production budget-overrun incidents with dollar losses; 2608.26225 shows error-rate breakers miss a loop of 54 successful tool calls. Stresses: 2. Receipt: the receipt.

**Choice: A wired, with the breaker as a constitution rule (2.3) and no product.** Concretely: the ACOS thresholds become rules with the delegation as the unit (2608.26225's finding); a trace id goes in `evidence` as `{kind: "trace", ref}` with the OpenTelemetry attribute names used as they stand today (`gen_ai.provider.name`, `gen_ai.usage.input_tokens`) and re-mapped when the conventions stabilise; promptfoo runs at Prove (2.4) with `promptfoo-action@v1` posting the verdict on the PR; the cost plane's daily caps become the envelope's `budget.maxCostUsd` at route time. `starlight-evals` is promoted to the eval authority per the 2026-08-12 topology and its banner is refreshed by a run rather than an edit.

### 3.12 Portfolio, attention, risk

**A. Fifty-nine projects and forty-four repos, one founder, periodic audits (the current default).** Facts: 59 Vercel projects verified; the 2026-08-12 Board record counted 367 repositories across the connected accounts and disposed 26 in the topology; the survey shows the `ai` SDK at v4, v6.0.185 and v6.0.190 across three brand apps and React at 18.3.1, 19.2.8 and 19.3.0, with Next uniform at 16.3.5. Enables: everything stays. Costs: attention. Forbids: nothing, which is the risk. Falsifier: a dormant project ships a claim. Stresses: 6. Receipt: none.

**B. Receipt or dormant at ninety days (radical, v4's choice).** Enables: an archival policy that runs itself: a Vercel project or repo with no receipt in ninety days gets a dormancy marker (`VERTICALS.md` already has `status: dormant` as the append-only pattern; the Vercel project description carries the same word); a marker is removed by a receipt. A brand-register rule: four names are load-bearing (Starlight, FrankX, GenCreator, Arcanea) with Anime Legends as an Arcanea sub-brand; every other name on the 59 is a project name and may not appear in public copy as a brand. Costs: one Sunday loop query. Forbids: a project that lives on prose. Falsifier: by 2026-12-31 more than half the 59 projects have neither a receipt nor a marker. Stresses: 5 (an alliance surface that goes dormant must keep its attribution history). Receipt: the Sunday loop's `portfolio.review`.

**C. Archive by judgment, quarterly (conservative).** Enables: care. Costs: hours. Forbids: cadence. Falsifier: the quarter passes. Stresses: 6. Receipt: none.

**Choice: B.** The risk register, each with an owner seat, a trigger and the falsifier that would show the mitigation works:

| Risk | Owner seat | Trigger | Mitigation | Falsifier for the mitigation |
|---|---|---|---|---|
| Vercel lock-in | Architecture | WDK or Fluid pricing or limits change | two runtimes, one receipt (2.5) | the twin never passes conformance by 2026-12-31 |
| Model deprecation | AI | a lane's model id disappears (DeepSeek retired the V4 Flash name on its own API in 2026; Nebius still serves 0731) | every lane a config string; the receipt records the id, so old receipts stay verifiable | a receipt names a model no longer resolvable and the plan has no table mapping ids to successors |
| Key leakage | Sovereign | a private key appears in git, chat or a shared folder | `keygen` writes a `.gitignore`; keys revoked by PR, never rotated silently; the log records revocation | a revoked key still verifies on `/verify` a day after the PR |
| Agent runaway | Architecture | a delegation exceeds its budget or loops on successful calls | breakers as constitution rules with the delegation as the unit | a run exceeds `budget.maxCostUsd` without a `work.blocked` event |
| Dilution | Product | a fifth name appears in public copy as a brand | the brand-register rule; the editorial audit | a public page names a project as a brand and CI passes |
| Founder attention | Sovereign | the Sunday loop is skipped twice | the loop is a cloud routine under the durable-output-sink law (4.2) | two consecutive Sunday receipts are missing |
| Provider terms | AI | Nebius changes §7 or ZDR | `provider: nebius-zdr` in every receipt; the compliance receipt fails closed | a receipt says ZDR and the org setting is off |
| Regulatory | Product | 2026-12-02 marking grace ends | the compliance stage (3.3) | an asset published after 2026-12-02 lacks the marking |

---

## 4. Part C: three contracts that cut across everything

### 4.1 Metrics contract

Seven numbers. Each has a source that is a file or a query, a dashboard home that exists or is named as planned, and a value today. Nothing else is a headline metric; agent, skill and command counts stay inventory in `metrics/current.json`.

| Metric | Definition | Source (query) | Dashboard home | Value 2026-09-21 |
|---|---|---|---|---|
| Receipts per week | signed run receipts issued, by `run.kind` | `sis.receipt.list` over `memory/_audit/receipts.jsonl` | Console lane board (planned, drift item 8); Sunday loop | 0 (file absent) |
| Euros per receipt | median `totals.costEur` by `run.kind` | same | same; replaces section 1 as it accumulates | none |
| Grounding rate | cited claims over claims on `desk.brief`, from the judge stage's note | receipt `stages[judge].note` | Desk edge meter | none |
| Recall | recall at 5 and at 10 on the retrieval eval | `npm run eval:retrieval`; `BENCHMARKS.md` | `BENCHMARKS.md` | recall at 5 = 1.0 on 10 labelled queries (small sample); precision at 10 = 26 percent on the 50-query phase-0 set |
| Time to first receipt for a new founder | minutes from `/start` to a signed receipt with the founder's own key | the founder's first receipt's `issuedAt` minus the harness start event | academy exercise one | none |
| Publish cadence | `publish` receipts per week per surface | `sis.receipt.list` filtered by kind | gencreator.ai research hub feed | none |
| Revenue per estate | monthly retainer amount on the `steward.report` receipt | the report's `evidence` | the Sunday loop's finance line (private) | none |
| Verified by others | distinct countersigning keys that are not in our registry | the ledger's `countersign` entries | `/ledger` | 0 |

The last row is the one the capital narrative rests on, so it is listed even though the brief asked for seven.

### 4.2 Operating rhythm

Rhythm is a layer: each loop is a routine with a durable output, and a routine that leaves no artifact did not run. The estate already has the law: the durable-output-sink law in `docs/ops/AGENT-OPERATIONS-CONTRACT-2026-08-29.md` ("PR, committed file, or Slack DM; never report-only into run history") and the finding in the same file that three enabled routines ended their last run abandoned and that the registry documented 7 routines while the account held about 21.

| Loop | When | Reads | Produces | Durable output | Owner seat |
|---|---|---|---|---|---|
| Morning | daily | the last day's receipts; open PRs; the compliance receipts that failed | the day's envelope list, routed by the constitution | a committed `memory/_audit/agent-events/<date>.jsonl` line and a PR comment where a PR exists | Architecture |
| Desk | daily, as needed | a founder question | a `desk.brief` receipt | the receipt appended and, when published, in the ledger | Product |
| Friday | weekly (`/friday-loop` exists in the frankx repo: performance analysis, insight distillation, next-week seed) | everything published this week plus the trailing 28 days | insights promoted to frameworks when seen three times | an Obsidian note under `Insights/` and a Notion state change, per the command | Marketing |
| Sunday | weekly | `sis.receipt.list` by kind; `portfolio.review`; cost per receipt; `SOUL.md` drift check | the rewritten section 1 table; dormancy markers; the risk register's trigger check | a committed `portfolio.review` receipt and a PR when a marker changes | Sovereign |
| Board | on any substrate touch, and monthly for the docket | the proposals in section 7 and any REVISE items open | a verdict file in `docs/boards/` | the file | Board |
| Cloud routines | per the routine registry (`FrankX/docs/ops/SCHEDULED-ROUTINES.md`, reconciliation open) | as configured | as configured | a PR, a committed file or a message; a routine that cannot reach a sink is disabled | AX director (once seated) |

The Blessing Protocol named in the brief was not found in any checked-out repo (SIS, frankx.ai-vercel-website, gencreator.ai, the six read-only siblings); it is listed here as a named loop with no file, and the Sunday loop's first task is to find it or to write it (drift item 46).

### 4.3 Capital narrative (one page)

**Entity.** Starlight Holding BV is in formation (`SOUL.md`, author line). A Dutch BV requires a notarial deed, has a minimum capital of €0.01, costs roughly €500 to €1,500 in notary fees plus the €85.15 KVK registration, and registers its UBOs at incorporation; online formation takes days once identity checks clear (appendix E section 14). The innovation box taxes qualifying innovation profit at an effective 9 percent and WBSO's 2026 first bracket applies up to €391,020 of R&D wage cost with a 2026-09-30 application deadline (official pages, reached through search summaries). These are the facts that matter to an investor asking "is there a company"; none of them is a projection.

**The room on 23 September.** Accel AI Innovate: Amsterdam, at AI House, Gustav Mahlerplein 5, a one-day hackathon on open-weight models served through Nebius Token Factory with Lovable and Tavily, and an evening with Lovable's CTO and Granola's CEO alongside Accel partners (appendix E section 15). Accel's European fund invests from seed with tickets of $1 million to $20 million (third party). What the room will see is the Desk producing a signed receipt and their own phones countersigning it.

**What the company is.** The receipt layer for agent work: an open protocol (SIP, MIT, invariant 3), a local memory and council an agent runs inside, and a signed receipt at the end of every run that verifies with one key anywhere. The category is verifiable agent operations. The customer is the operator who already runs agents across several hosts and still wants the veto; increasingly that customer is another agent.

**Why now, in four facts with sources.** Instruction files have converged (AGENTS.md, stewarded by the Agentic AI Foundation since December 2025); proof has not. Regulation arrived at provenance before it arrived at models (Article 50 in force since 2026-08-02, marking grace to 2026-12-02). Open weights on EU-headquartered inference make cost a printable number (a brief at €0.0029 on the cascade, €0.0314 on the cheapest closed model at list). A survey of observability and agent vendors on 2026-09-21 found none issuing a signed, portable receipt a third party can verify; the closest are a hash-chained local file and a set of 2026 papers that describe the object and say nobody ships it.

**What the money would be for.** Not inference: the thousand-estate inference line is €1,128 a month. The money buys the two things the zero cannot buy itself: a bench of stewards for the estate channel (28 hours a month per estate at the Dutch freelance average) and the engineering to make the receipt a standard rather than a feature (the conformance suite, the second runtime, the transparency log). The open-core posture is the one in `docs/strategic/sip-web4-substrate-strategy.md`: the protocol, the reference scaffolds and the receipt format stay MIT; encoded-self artifacts are non-transferable by SIP §5.7; the commercial layers are commissioning, stewardship and any managed tier.

**What is not claimed.** No customer count, no revenue, no verified-receipt count, no valuation, no round size. Every one of those is zero or unset on the day this is written, and the narrative says so. The three numbers an investor should ask for at the next meeting are the three the ledger will show: receipts issued, receipts verified by keys that are not ours, and euros per receipt falling.

---

## 5. Board verdicts

Run against the five vectors and the Overseer in the shape of `.claude/commands/starlight-board.md`. Three dimensions get the full five-vector pass because their choices invert v3 or touch the substrate; the rest are recorded in the table. Vocabulary: PROCEED, PROCEED-WITH-REVISE (the modal verdict across 38 records and absent from the command, drift item 29), REJECT (the brief's word for STOP).

### 5.1 Memory (A7)

**Sovereign:** The log is a file; sovereignty improves. The irreversible part is the event envelope once signed events exist, so the envelope must be the receipt's DSSE envelope and the first projection must be byte-identical to the vault it replaces before anything is signed. **Seer:** In eighteen months either every surface reads one log or the estate has a fourth log next to the three it has now; the deciding factor is whether the projection runner is one job or one per surface. The harm in the success case is silent: a projection that lags looks like a vault that forgot. **Harmonizer:** `AGENTS.md` already claims event-sourced JSONL truth; the 2026-08-12 Board separated evidence from projections in exactly these words; the vault taxonomy's six names survive as projection names. It breaks the habit of hand-editing `memory/vaults/*.md`, which is the point. **Strategist:** Erasure as replay is the strongest privacy story the estate can tell a client or a regulator, and it is not available to any hand-maintained vault. **Verifier:** Fails first on the 2 percent diff: the hand vaults have drifted from the JSONL for months. Cheapest experiment: rebuild the operational vault alone from the existing JSONL and diff it, this week, before the Board sits. **Overseer:** The load-bearing concern is two truths during the migration window; the strongest case is that the estate already runs three logs and pays for five projections by hand. **Recommendation:** PROCEED-WITH-REVISE, blocked on Board. REVISE: the operational-vault rebuild diff before the Board; a dual-write window with an explicit rollback, as the 2026-05-23 record demanded for the last flip.

### 5.2 Operator (A3)

**Sovereign:** The constitution cannot route around § 5 because it is compiled from it; the risk is that a rule compiled once becomes a second doctrine nobody re-reads. **Seer:** Rules that block a person's route ten times will be disabled by the person; rules that never block are decorative; the falsifier window is right. **Harmonizer:** A1 to A3 from the 2026-06-10 verdict are honoured; the ACOS breaker thresholds are already doctrine in that repo ("never weaken safety hooks without an explicit operator decision"); the Queen loses nothing it exercises today, since no class has `autoApply`. **Strategist:** A rules file a partner estate can adopt without the Queen is the first thing in the operator layer that is exportable. **Verifier:** Cheapest experiment: compile A1 to A3 and the three breaker thresholds as tests and run them on the last month's envelopes in `tools/queen/ledger.jsonl`. **Overseer:** Concern: compiled prose reads compiled; case: the rules already exist and nothing runs them. **Recommendation:** PROCEED-WITH-REVISE. REVISE: re-derive on every Board record (from v3); the breaker's unit is the delegation rather than the message.

### 5.3 Economics (B1)

**Sovereign:** Retainers to alliances would invert invariant 5; the rule that alliances are gifts must be in the SOW template before the first retainer. **Seer:** At a thousand estates the bench is 175 stewards; the narrative must never let that arithmetic become a slide. **Harmonizer:** The 2026-06-16 Board gated pricing elevation on six REVISE items and none is recorded as closed; a retainer signed before they close breaks that record. **Strategist:** The receipt as the metering unit inside every price is what makes the later per-receipt price honest; it costs nothing to start metering now. **Verifier:** Fails first on the offer-truth gate: gencreator.ai will render "Pricing not published" until an offer is true, and that is correct. **Overseer:** Concern: revenue depends on a channel gated by an open Board record; case: nothing else in the plan pays for the year. **Recommendation:** PROCEED-WITH-REVISE. REVISE: close or re-verdict the six 2026-06-16 items before the first SOW; the SOW template carries the alliance-gift clause and the receipt-list clause.

### 5.4 The table

| Dimension | Choice | Load-bearing concern (Overseer) | Strongest case | Verdict |
|---|---|---|---|---|
| A1 Surfaces | four sites, one receipt package, headless conformance | a conformance test nobody runs | the verifier copies already diverge | PROCEED |
| A2 Spine | the spine with a receipt per stage as a merge gate | the loop has one user | stage one ships on the 23rd with a room | PROCEED |
| A3 Operator | constitution first | compiled prose | nothing runs the rules today | PROCEED-WITH-REVISE |
| A4 ADLC | seven gates, receipt per gate in CI, eval inside Build | ceremony | Sigstore attestation of the profile already runs on push | PROCEED |
| A5 Runtime | reference plus conformance twin | the twin is never built | the receipt is the interface, so it is two days of work | PROCEED |
| A6 Harness | AGENTS.md now, compiled files Q4, ContextCov first | voice | drift becomes a diff | PROCEED |
| A7 Memory | the log, blocked on Board | two truths in the window | three logs and five hand projections today | PROCEED-WITH-REVISE, blocked on Board |
| A8 Models | cascade, batch default, local lane, router at the cohort | the router learns our habits | euros print today | PROCEED |
| A9 Design | one shared package, and it is the receipt | sameness by package | a drifting verifier is worse than none | PROCEED |
| A10 Demo | Desk, phone verify, countersign | camera-to-signature time | the only move that turns the zero into a recount | PROCEED |
| B1 Economics | retainers, open core, receipt as meter | a gated channel | nothing else pays | PROCEED-WITH-REVISE |
| B2 Trust | transparency log with countersignatures | a log nobody writes to | the rehearsal writes to it on Tuesday | PROCEED |
| B3 Regulation | compliance receipt as a stage | a stage that never fails | the marking grace ends 2026-12-02 | PROCEED |
| B4 Compute | hosted now, local lane Q4, own vLLM rejected | a provider ToS change | the crossover is ten times away | PROCEED |
| B5 Consent | the rule as written | too heavy for creators | the alternative is the absence of a rule | PROCEED |
| B6 Interop | SIP extension plus conformance suite | a spec with one client | the graph profile already has the pattern | PROCEED-WITH-REVISE (Board for v1.2.0) |
| B7 Distribution | the agent is the customer | tools with no callers | the tools already exist on the branch | PROCEED |
| B8 Voice, video, spatial | receipt producers only; palace rejected as interface | a cohort wants voice | the honesty rule holds | PROCEED |
| B9 Physical | receipts or dormancy | a booking arrives at a dormant surface | five surfaces with zero receipts | PROCEED |
| B10 Education | one academy, exercises end in receipts | a second academy | the learner's first act is a verification | PROCEED |
| B11 Observability | wired, breakers as rules, no product | a dashboard that becomes a product | 63 catalogued overrun incidents | PROCEED |
| B12 Portfolio | receipt or dormant at ninety days | alliance surfaces marked dormant | 59 projects and one founder | PROCEED |

No dimension carries two STOP votes. Four carry REVISE items; two are blocked on Board.

---

## 6. Irreversible and reversible

**Irreversible, decided slowly and only at Board:** the event envelope for the memory log (once events are signed, the envelope is forever); the receipt predicate type and schema (versioned, never edited); the first registry key (revoked by PR, never rotated silently); the ratification of the run receipt as a SIP graph extension (a minor bump with a 90-day deprecation window); the HX and AX seats in the registry.

**Reversible, shipped first:** the conformance test for surfaces; the receipt-per-gate CI check; the constitution tests; the twin runtime; the batch default; the local lane; the `@starlight/receipt` package (a copy becomes an import); the countersign endpoint and ledger table; the compliance stage; the consent rule's schema fields; the dormancy markers; every prototype and every page.

The order of the horizons (section 8) follows this: everything reversible lands in the day and week rows; everything irreversible sits in the month row behind a Board file.

---

## 7. Board proposals for the blocked dimensions

### 7.1 Memory: the six vaults as the first six projections of one signed log

**Proposal.** Declare one append-only log as the memory substrate's write path. Every write is an event in the DSSE envelope the run receipt uses, signed by the writer's key. Event kinds: `atom.added`, `atom.superseded`, `promote` (with the six conditions of the graph contract's promotion rule as required fields), `contradiction.flagged`, `consent.granted`, `tombstone`, `receipt.issued`, plus the ten work-graph kinds already in `src/work-graph.ts`. The six vaults keep their names and their retention rules and become the first six projections; the palace, the SQLite index, the console data layer, the Supabase index and the public vault mirror are projections; one runner rebuilds any projection from the log. Erasure is a `tombstone` event, a rebuild, and destruction of the per-subject key.

**What changes in substrate terms.** "What is true" moves from the vault files to the log. The taxonomy (six vaults, their retention and their primary writers) does not change; the file contract does not change (`MEMORY.md` remains the durable-state file per SIP layer 1); no SIP text changes. The Board decides whether moving truth is a taxonomy change; v4's reading is that it is, so it is here.

**Cheapest experiment before the Board sits.** Rebuild the operational vault alone from the existing Path A JSONL and diff it against `memory/vaults/operational-vault.md`; publish the percentage. If it is above 2 percent, the log is incomplete and the proposal waits.

**Falsifier for the proposal.** If, after adoption, any projection cannot be rebuilt within one Sunday loop, or a hand edit to a vault file is needed to correct a projection, the log has failed and the vaults return to being truth.

### 7.2 SIP graph extension: ratify `starlight.run-receipt.v1` at SIP v1.2.0

**Proposal.** Add the run receipt predicate type (`https://starlightintelligence.ai/protocol/run-receipt/v1`) and `protocol/run-receipt.v1.schema.json` to the proposed SIP layer 7 (the evidence graph), following the 2026-09-19 precedent that named the graph "proposed" until ratified. Minor bump, additive, with the conformance suite (B6) as the acceptance test and the 90-day deprecation window for any future major.

**What changes in substrate terms.** `SIP.md` gains a layer 7 line and a changelog entry. Nothing in layers 1 to 6 changes.

**Cheapest experiment.** A second implementation (the twin runtime, A5) passes the suite.

### 7.3 Registry: HX and AX director seats

**Proposal.** Add two accountabilities to `agents/AGENT_REGISTRY.md` with one owner each: HX director (every surface a person touches, against each repo's `design.md` and `taste.md`) and AX director (every surface an agent runs in: file contracts, tools, receipts, routines). Generals remain the leadership tier with named domains. No new agent files; two rows and two owners.

**Cheapest experiment.** Assign the two owners for the day plan (the day-prep runbook already names Design and AX seats for 22 and 23 September) and record whether a decision was made under each seat.

---

## 8. Horizons

Each row names what ships, the repo or PR, the gate, the owner seat and the monthly euros at three scales for the state of the architecture at the end of that horizon (from section 1.4; platform at list, inference on the cascade with batch where the stage allows).

| Horizon | Ships | Lands in | Gate | Owner seat | Founder / cohort / estates (EUR per month) |
|---|---|---|---|---|---|
| **Day (22 to 23 Sept; passed)** | Status on 26 September: none of this row reached a ledger or a `main`; the Desk exists as code on PR 189. Planned: Desk key generated, public half added to the registry by PR; `/verify?r=` and QR (already on the web branch, PR 54); countersign endpoint and ledger table on the .ai project; the Desk issuing a signed `desk.brief` on stage; five-phone rehearsal measured from scan to signature; a `strategy.plan` receipt for this document | starlight-intelligence-web PR 54 and one follow-up PR; SIS PR 189 and this PR; the hackathon PR | tests, screenshots at 375 and 1440, the rehearsal timings in the PR body | Sovereign, Design, AX | 17.6 / 56.9 / 1,128 (unchanged) |
| **Week (to 7 Oct; moved from 30 Sept)** | first, the day-prep runbook's F1 to F3 (key, registry PR, the merges of web PR 54, SIS PR 189 and this PR); then the conformance test for surfaces; receipt-per-gate CI on SIS (`prove` and `ship` ids required in the PR body); constitution tests compiled from A1 to A3 and the three breaker thresholds, run on last month's route ledger; batch as the default for constellation and compliance stages; `compliance.check` stage; the operational-vault rebuild diff (7.1's experiment); Console lane board reading the ledger; Sunday loop as a routine with a durable sink | SIS, gencreator.ai, starlight-intelligence-web | CI, Console honesty rule, ADR-010, the durable-output-sink law | Architecture, Product | 17.6 / 56.9 / 1,128 |
| **Month (October)** | Board sits on 7.1, 7.2 and 7.3 (three files in `docs/boards/`); `@starlight/receipt` package published and imported by the four brand repos; the twin runtime scaffold on Railway; gencreator.ai from `ai ^4` to 7 behind the Eve contract; the consent schema fields (`gate: "train"`) on receipts; dormancy markers on the three physical projects; the SOW template with the alliance-gift and receipt-list clauses (after the 2026-06-16 items close) | SIS (Board records), npm, gencreator.ai, Railway, DELIVERY docs | Board, ADR, tests, the 2026-06-16 REVISE closure | Board, AI, Architecture, Sovereign | 17.6 / 61.3 (+4.36 twin) / 1,128 |
| **Quarter (Q4)** | the twin runtime passes the conformance suite; the local lane (`provider: local`) issues a signed brief with the cable pulled; the memory log's first projection (operational vault) if the Board proceeds; compiled instruction files for three repos with the ContextCov test; verify widget on .org, gencreator and frankx through the package; the academy's first exercise ends in a learner-signed receipt; the router experiment on the first cohort's receipts if a cohort has run | SIS, the four brand repos, academy, Railway | web-release-gate, homepage preservation contract on frankx, Board for the log, the A2 sample floor for the router | HX director, AX director, AI, Sovereign | 17.6 / 65.7 (+4.36 runner) / 1,128 |
| **Year (to Sept 2027)** | SIP v1.2.0 with the run receipt ratified and a second conformant implementation; the memory log as the write path across the estate; a public ledger with countersignatures from keys that are not ours; a per-receipt price published only if a thousand external verifications exist; three estates on retainer with client-held keys; the physical surfaces either issuing `room.session` receipts or archived | SIS, starlight-intelligence-web, estate-provision, the retreat surfaces | Board, the seven metrics | Board, Sovereign | 17.6 / 65.7 / 1,128 client-hosted; ≈ 23,000 plus usage if hosted |

---

## 9. What v1 got wrong

Eight from v1, with what v2 and v3 kept and what v4 changes. Items 1 to 10 in v3 section 7 stand and are not repeated.

1. **It never counted the receipts.** v1 made the receipt the product's proof object and never asked how many existed. Zero existed then and zero exist now. v4 organises every direction around that count.
2. **It said "EU-hosted" without reading the provider's terms.** Nebius's public endpoint processes wherever capacity is, stores in Finland, and uses inputs and outputs to train speculative-decoding drafters unless Zero Data Retention is on; only a dedicated endpoint pins EU compute. v1 through v3 wrote "EU-hosted" as if it were a property of the model.
3. **It priced Claude at the protocol layer as if it could be EU-resident.** The first-party API offers US or global inference geo only. The plan now names the route (first party for non-personal data; Bedrock, Vertex or Foundry EU regions otherwise) on every receipt.
4. **It treated AGENTS.md as the file every harness reads.** Claude Code, the harness this estate runs most, reads CLAUDE.md natively and AGENTS.md only through a supplement. v1's "shared instruction file" was true for the other harnesses.
5. **It priced tracks by credits.** Suno's terms now attach commercial rights to downloads while subscribed and cap them at 20 or 60 a month; a released track is €0.44 and the account must be the creator's. v1's renderer line treated rendering as a token cost.
6. **It kept the Queen first and the rules second.** The routing table auto-applies six classes, and two of them do so on a single round at high confidence, against the doctrine's own A2 floor. The rule existed in prose and nothing enforced it. v4 inverts the order: the constitution gates every envelope from the next one, its first compiled rule is A2, and the Queen routes inside it.
7. **It called the memory event-sourced in `AGENTS.md` and hand-maintained the vaults.** Three append-only logs and five hand projections coexisted with a doctrine sentence that said otherwise. v4 either makes the sentence true (Board) or removes it.
8. **It shared the verifier by copy and called it a kernel.** Two copies on two branches of two repos is drift with a note attached. v4 makes the receipt the one shared package and keeps design surface-native.
9. **It costed compute sovereignty as a posture rather than a crossover.** One H100 is €2,419 a month on demand; the whole thousand-estate inference line is €1,128. Own vLLM is not a sovereignty question at this scale; it is arithmetic, and the on-device lane is where sovereignty is actually testable.
10. **It described the estate's tooling from its prose.** OpenTelemetry is in no dependency tree; promptfoo is configured in one repo whose banner is 73 days stale; the "seven export targets" are a SIS command rather than a sibling's feature; the "Horizon dataset" does not exist. Every such claim in v4 names the file or says unverified.
11. **It assumed a thousand receipts was a matter of time.** At founder volume it is five months; at cohort volume it is four days. The router and the LoRA fleet wait for the cohort, and the plan now says so.
12. **It costed nothing at the level of a horizon.** The horizon table carried no euros. Section 8 carries three scales per row.

---

## 10. Drift ledger v2

Items 1 to 31 (v1 appendix A.2, v2 section 9, v3 section 8) stand; item 31 (the eight mis-stated map nodes) was done in v3. Added:

| # | Action | Repo | Horizon | Gate | Owner seat |
|---|---|---|---|---|---|
| 32 | Countersign endpoint and ledger table on the .ai project; `countersign` receipt kind; five-phone rehearsal measured from scan to signature | starlight-intelligence-web | day | tests; rehearsal timings in the PR body | Design, AX |
| 33 | Headless conformance test: every fact on a surface must be reachable through a tool or the ledger API; runs in the web-release-gate | starlight-intelligence-web, then the four brand repos | week | CI | HX director |
| 34 | Receipt per gate: `prove` and `ship` receipt ids required in the PR body by a CI check; `gate.<name>` receipts issued by the gate scripts | SIS | week | CI | Architecture |
| 35 | Constitution tests compiled from A1 to A3 and the ACOS breaker thresholds, the delegation as the unit; run on `tools/queen/ledger.jsonl` | SIS | week | tests | Architecture |
| 36 | Batch as the default for constellation and compliance stages; the receipt records `provider: nebius-batch` | gencreator.ai, SIS | week | unit tests | AI |
| 37 | `compliance.check` stage with the four evidence lists (marking, provider clause, output rights, model licence) | gencreator.ai, SIS | week | CI; fails closed | Product |
| 38 | Operational-vault rebuild diff from Path A JSONL, percentage published before the Board | SIS | week | the number | Architecture |
| 39 | Board files for 7.1 (memory log), 7.2 (SIP v1.2.0), 7.3 (HX and AX seats) | SIS `docs/boards/` | month | `/starlight-board` | Board |
| 40 | `@starlight/receipt` package (verifier and card, MIT, no dependencies); the two copies of `run-receipt.ts` become imports | SIS, starlight-intelligence-web, then gencreator.ai, frankx.ai-vercel-website, arcanea-ai-app | month | package tests; byte-identical output on the fixtures | Architecture |
| 41 | Twin runtime: a plain Node worker on Railway running three stages and issuing the same receipt; must pass the conformance suite | SIS, Railway | quarter | conformance suite | Architecture |
| 42 | Run-receipt conformance suite in `protocol/` on the graph profile's pattern; `conformance` receipt for the checker's own run | SIS | month | tests on Node 18, 20, 22 | AX director |
| 43 | Local lane: `provider: local` for extraction and embeddings on llama.cpp or MLX; a signed brief with the cable pulled; rubric gap measured on twenty questions | SIS | quarter | eval; the signed receipt | AI |
| 44 | Consent schema: `gate: "train"` decisions; `train.lora` receipts list source receipt ids; renderer accounts are the creator's | gencreator.ai, SIS | month | schema tests; the rule in `docs/receipts.md` | Product |
| 45 | Dormancy markers on `property-intelligence`, `aurevia-solar`, `solarcarport-tech`; the receipt-or-dormant rule in the Sunday loop | Vercel project descriptions, `VERTICALS.md` pattern | month | the Sunday `portfolio.review` receipt | Sovereign |
| 46 | Find or write the Blessing Protocol; register every loop in the routine registry with its durable sink | frankx.ai-vercel-website `docs/ops/`, SIS `docs/ops/` | week | the durable-output-sink law | Sovereign |
| 47 | Fix the three design-contract drifts: gencreator `taste.md` colour line, frankx `CLAUDE.md` description of `design.md`, the two unreachable Windows paths | gencreator.ai, frankx.ai-vercel-website, arcanea-ai-app | week | editorial and design contract CI | HX director |
| 48 | gencreator.ai from `ai ^4.0.0` to 7 behind the Eve contract; `usage` per step to `stages` | gencreator.ai | month | ADR, unit and e2e CI | AI |
| 49 | SOW template with the alliance-gift clause and the receipt-list clause; close or re-verdict the six 2026-06-16 REVISE items before the first retainer | SIS `docs/delivery/`, `docs/boards/` | month | Board | Sovereign |
| 50 | Trace id in `evidence`; promptfoo at Prove with `promptfoo-action@v1`; refresh the `starlight-evals` banner by a run | SIS, starlight-evals | month | CI | AI |
| 51 | `STATUS.md` says the v0.1 MCP server has 13 `sis.*` tools; the file has 24. Correct the count and add a harness check for it | SIS | day | harness check CI | Architecture |
| 52 | Academy exercise one: verify a receipt on a phone, then issue one with a throwaway key; the exercise receipt is signed by the learner | starlight-intelligence-academy | quarter | academy release | HX director |
| 53 | Correct the map: the v1 map says "AI SDK 6" in three nodes; the major is 7 and the v3 map already says so | SIS `docs/strategy/convergence-map.html` | day | appendix F | Architecture |
| 54 | Two Grok routing classes (`memory-consolidation-queen`, `palace-visual-recall`) are `autoApply: true` and `confidence: high` at `rounds: 1`, against A2. Set both to `autoApply: false`, `confidence: medium` until a second concordant round, and add a harness check that fails any class with `autoApply: true` and `rounds` below 2 | SIS `tools/proving-ground/routing-table.json`, harness check | week | harness check CI | AI |
| 55 | Treat the Desk vault (`site/src/lib/desk/vault.ts`: append-only JSONL, one belief per line, each carrying the `receiptId` that produced it) as the second projection in the 7.1 experiment, after the operational vault: it already writes the shape the memory log proposes | SIS | month | Board 7.1 | Architecture |

---

## 11. What this document does not do

It does not change the substrate: `SIP.md`, `SIS.md`, `ALLIANCE.md`, `STACK.md`, `VERTICALS.md`, `VOICES.md`, `REGISTRY.md`, the sovereignty clause and the vault taxonomy are untouched; the two directions that would touch them are Board proposals in section 7 and ship nothing here. It does not adopt an actor runtime, a market operator, headless surfaces, a hosted memory, a per-receipt public price, own GPUs, on-chain anchoring, or observability as a product. It does not promise numbers: every euro derives from a list price in appendix E and is labelled illustrative until receipts replace it; the seven metrics are zero or unset and the capital narrative says so. It does not convene the Board. It does not issue a signed receipt for itself, because no signing key exists on the authoring machine; it issues an unsigned draft and cites it in the PR body, as v3 did, and names that as the first thing the day row fixes.

## 12. Corrections, 26 September

This document was revised five days after it was written. Every change is listed here so a reader can tell the 21 September record from the revision.

1. **The routing table claim was wrong on the day.** The 21 September text (sections 2.3 and 9, appendix F row "Queen routing table", the map's operator row) said no class had `autoApply: true`. The check read three classes and generalised from them. At 04bb1b0, the commit this plan was verified against, six of fourteen classes were already auto-applied, two of them at `rounds: 1`. The operator choice stands; its reason changed (section 2.3), and drift item 54 fixes the two classes.
2. **The base moved.** This PR now sits on PR 189 at 910c7ed, which adds the Desk, the issue-and-share script, compact receipt links and the Desk vault. Appendix F section F.7 re-checks the claims those commits touch.
3. **The day horizon passed.** Section 0.0 records what did and did not land; section 8 marks the day row and moves the week row to 7 October with the runbook's F1 to F3 first.
4. **Two drift items added.** Item 54 (the routing table) and item 55 (the Desk vault as the second memory-log projection).

Nothing else in sections 1 to 11 changed. The euro figures, the Board verdicts and the choices other than the operator reason are as written on 21 September.

---

Built on SIP.
