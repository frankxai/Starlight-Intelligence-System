# Convergence v4 — appendix E: dated external facts (2026-09-21)

Compiled 2026-09-21 by four research passes (prices, standards and regulation, papers, economics) for `2026-09-21-convergence-v4.md`. Extends and corrects v3 appendix C; the corrections are consolidated in section 18. Every row carries a source and a provenance class. Classes: **official** (page, registry or licence file read in full), **official snippet** (the owner's page reached only through a search-index snippet because the session's egress proxy blocked the domain), **third party** (a named non-owner page), **search summary** (an aggregated search answer with the page it summarised), **unverified** (no readable source; last known value given). The proxy blocked most vendor and government domains this session; platform.claude.com, developer.apple.com, github.com, raw.githubusercontent.com, npm and PyPI were readable in full. Re-read every non-official row from an unrestricted network before publishing a number.

## 1. FX

| Fact | Value | Source | Class |
|---|---|---|---|
| ECB euro reference rate 2026-09-18 | 1 EUR = 1.1460 USD (1 USD = 0.8726 EUR) | ecb.europa.eu eurofxref PDF | official snippet |
| ECB euro reference rate 2026-09-21 | 1.1490 (0.8703) | ECB reference rates page | official snippet |
| Basis used in v3 appendix C and in v4 | 0.8726 | arithmetic | — |

## 2. Anthropic Claude API (official, read in full at platform.claude.com/docs/en/about-claude/pricing)

USD per million tokens.

| Model | Input | Cache write 5m / 1h | Cache read | Output | Batch in / out |
|---|---|---|---|---|---|
| Claude Fable 5.1 | 10.00 | 12.50 / 20.00 | 0.25 (0.025×) | 50.00 | 5.00 / 25.00 |
| Claude Opus 5 | 5.00 | 6.25 / 10.00 | 0.50 | 25.00 | 2.50 / 12.50 |
| Claude Sonnet 5 | 2.00 (introductory price made permanent; the 2026-09-01 rise did not happen) | 2.50 / 4.00 | 0.20 | 10.00 | 1.00 / 5.00 |
| Claude Haiku 4.5 | 1.00 | 1.25 / 2.00 | 0.10 | 5.00 | 0.50 / 2.50 |

Also on the page: batch is 50 percent off and stacks with caching; `inference_geo: "us"` adds 1.1× on 4.6+ models; the 4.7+ tokenizer produces about 30 percent more tokens for the same text; web search $10 per 1,000; Managed Agents runtime $0.08 per session-hour.

## 3. Comparison prices, OpenAI and Google (official snippets; labels partly third party)

| Model | Input | Cached input | Output | Batch | Note |
|---|---|---|---|---|---|
| GPT-6 Astra | 10.00 | 1.00 | 50.00 | −50% (third party) | flagship |
| GPT-5.6 Sol | 4.00 | 0.40 | 20.00 | −50% | promotional "at least through 2026-11-21"; not a permanent cut |
| GPT-5.6 Terra / Luna | 2.00 / 0.20 | 0.20 / 0.02 | 12.00 / 1.20 | −50% | cache write 1.25×; prompts over 272K billed 2× / 1.5× |
| Gemini 3.1 Pro (preview) | 2.00 (≤200K) / 4.00 | 0.20 / 0.40 | 12.00 / 18.00 | −50% | cache storage $4.50 per 1M token-hour |
| Gemini 3.8 Flash | 0.75 through 2026-12-31, then 1.50 | 0.075 → 0.15 | 3.75 → 7.50 | −50% | v3 appendix C's "Gemini 3 Flash 0.50 / 3.00" row was stale; its 0.0375 figure was the batch cache rate |
| Gemini 3.1 Flash-Lite | 0.25 | 0.025 | 1.50 | −50% | |

## 4. Nebius Token Factory

List is login-walled at tokenfactory.nebius.com. Rows marked official snippet come from Nebius's own cookbooks (dev.nebius.com) or docs; others are third-party mirrors.

| Model (id) | Input | Output | Context | Class |
|---|---|---|---|---|
| Kimi K3 (`moonshotai/Kimi-K3`) | 3.00 | 15.00 | 1M | official snippet (cookbook) |
| GLM-5.2 (`zai-org/GLM-5.2`) | 1.40 | 4.40 | 1M | official snippet |
| GLM-5.3-Flash | 0.15 | 0.50 | — | official snippet |
| MiniMax-M3 | 0.30 | 1.20 | 1M | official snippet |
| Llama 3.3 70B Instruct (latest Llama seen on Nebius; no Llama 4 row found) | 0.13 | 0.40 | 128K | official snippet |
| Qwen3-235B-A22B-Instruct-2507 / Qwen3-30B-A3B-Instruct-2507 | 0.20 / 0.10 | 0.60 / 0.30 | — | official snippet |
| Qwen3.5-397B-A17B | 0.60 | 4.00 | 262K | third party |
| DeepSeek V4 Pro | 1.75 | 3.50 | 164K to 1M (mirrors disagree) | third party |
| DeepSeek V4 Flash 0731 | 0.14 | 0.28 | 1M | third party |
| Nemotron 3 Nano 30B-A3B | 0.06 | 0.24 | — | third party |
| GPT-OSS 120B | 0.15 (or 0.10) | 0.60 (or 0.50) | 131K | third party |
| Qwen3-Embedding-8B | 0.01 | — | 41K | third party |
| Flux image | from $0.0013 per image (2025 press figure) | | | unverified today |

Capabilities and terms (docs.tokenfactory.nebius.com and nebius.com, official snippets):

- **Batch inference:** 50 percent of the real-time price, rounded up to the cent (0.13 / 0.40 becomes 0.07 / 0.20), per the batch page and two Nebius posts. v3 appendix C carried "30 percent, unverified".
- **Prompt or prefix caching:** not offered; the feature request is "In Review".
- **Flavours:** `base` and `-fast` (speculative decoding); custom drafter training is a post-training product.
- **Dedicated endpoints:** 99.9 percent SLA, optional regional pinning to EU or US data centres; price login-walled.
- **Fine-tuning:** supervised, LoRA or full, via `POST /v1/fine_tuning/jobs` with `lora_r` 8 to 128; hosted adapters billed per token; per-token training price unverified (the only public number is a stale 2025 figure of $0.40 per million tokens for models under 20B).
- **Data:** ToS §7: inputs and outputs are collected "for the purpose of training smaller Models used exclusively for Speculative Decoding", opt-out any time; Zero Data Retention toggle exists and "may impact inference speed"; §2 counts adapters, fine-tuned models and datasets as Customer's Content; stored data lives in Finland regardless of processing location; public endpoint compute location is dynamic; only a dedicated endpoint pins a region; a US endpoint `api.tokenfactory.us-central1.nebius.com` exists; the ToS moves to docs.nebius.com/legal/agreement on 2026-09-28.

## 5. Nebius AI Cloud GPUs and NVIDIA NIM

| Item | Value | Class |
|---|---|---|
| H100 NVLink, per GPU-hour | $3.85 on demand, $2.15 preemptible; reserved not self-serve, about $2 on large commitments (third party) | official snippet (docs.nebius.com pricing) |
| H200 NVLink | $4.50 / $2.45 (a rise to 5.40 reported, date unverified) | official snippet / third party |
| B200 NVLink | $7.15 / $3.95 (a rise to 8.50 reported, date unverified) | official snippet / third party |
| Regions | Finland (eu-north1), Paris (eu-west1), Kansas City (us-central1); no per-region delta published | official snippet |
| NVIDIA AI Enterprise for NIM | $4,500 per GPU per year (1 to 4 year terms), 5-year $18,000, perpetual $22,500; marketplace $1 per GPU-hour; 90-day evaluation | third party (nvidia.com blocked) |

## 6. Nemotron Nano on Apple silicon; vLLM

| Item | Value | Class |
|---|---|---|
| Nemotron 3 Nano 30B-A3B, Q4_K_M, llama.cpp | 24.6 GB; 86.2 tokens a second generation on M4 Max; prompt processing about 1,200 tokens a second | third party, measured (github.com/ggml-org/llama.cpp discussion 20421, fetched) |
| Nemotron 3 Nano 4B, Q4_K_M | 2.84 GB; 88.4 tokens a second on M4 Max; 16 tokens a second on iPhone 17 Pro | same |
| Nemotron 3 Nano 30B-A3B, MLX 5-bit | 83 tokens a second on M4 Pro 48 GB | search summary |
| Nemotron 3 Nano Omni 30B-A3B | text, image, video and audio in; 300K context; released 2026-04-28 | third party |
| Nemotron 3.5 Lightning | 31.6B total, 3.6B active, 1M context | third party |
| vLLM 0.29.0 (PyPI 2026-09-09) | speculative decoding methods: draft model, n-gram, suffix, MTP, EAGLE / EAGLE-3, DFlash, Medusa, PARD, MLP; one method per server; multi-LoRA with `--max-loras`, runtime load and unload endpoints, LoRAResolver plugins; prefix caching documented with `enable_prefix_caching=True` | official (docs fetched from GitHub) and official snippet |

## 7. Runtime libraries (npm, PyPI, Context7, 2026-09-21)

| Package | Version | Facts | Class |
|---|---|---|---|
| `ai` (Vercel AI SDK) | 7.0.108 (published 2026-09-21); `ai-v6` tag 6.0.287 | current major is 7 (announced 2026-06-25); ESM-only; provider spec v4; `ToolLoopAgent` with `instructions` (renamed from `system`), `tools`, `stopWhen`, `toolApproval` (renamed from `needsApproval`), `output`, `prepareStep`; `usage` aggregates all steps; `Output.object` on `generateText`; Gateway fallback by `providerOptions.gateway.order`; `createOpenAICompatible({ baseURL, includeUsage: true })` | official |
| `@ai-sdk/openai-compatible` / `@ai-sdk/gateway` | 3.0.53 / 4.0.88 | | official |
| `workflow` (Workflow Development Kit) | 4.8.9; 5.0.0-beta.55 | `WORKFLOW_MAX_EVENTS` 25,000 per run, strictly enforced in v5; inline budget 2 / 5 / 10 minutes tiered by runtime deadline; run region fixed at creation; the 10,000-step and 50 MB payload limits are from the v3 pass and were not re-returned | official |
| `@modelcontextprotocol/server` and `/client` | 2.0.0 (2026-07-27); legacy `@modelcontextprotocol/sdk` 1.30.0 | | official (npm) |
| `promptfoo` | 0.123.1 (2026-09-18); `promptfoo/promptfoo-action@v1` | | official |
| Langfuse / Braintrust | server 4.33.0; npm `braintrust` 3.34.0 | alternatives, one line each | official / search summary |
| `mem0ai` | npm 3.2.0, PyPI 2.1.0 (2026-09-18) | absent from every estate repo | official |
| `agentdb` | 3.0.0-alpha.20 | declared only in frankx.ai-vercel-website | official |
| `sqlite-vec` | 0.1.9 (2026-03-31) | absent from every estate repo | official |

## 8. Media tools: prices and output rights

| Product | Plan | Price | Allowance | Rights | Class |
|---|---|---|---|---|---|
| Suno | Pro | $10 a month ($8 annual) | 2,500 credits (about 5 per song); **20 downloads a month** | commercial rights attach to songs downloaded while subscribed (help centre "Upcoming Changes FAQ", edited about 2026-09-03); Suno assigns its right, title and interest in Output; no warranty that copyright vests; ToS updated 2026-08-10; Suno attaches C2PA content credentials to downloads | official snippet |
| Suno | Premier | $30 ($24 annual) | 10,000 credits; **60 downloads a month** | same | official snippet |
| Higgsfield | Starter / Plus / Ultra | $19 / $47 annual ($59 monthly) / $99 annual ($129 monthly) | 270 / 1,200 / 3,000 credits | July 2026 terms: no ownership claim on outputs, commercial use on all plans, rights survive cancellation; Higgsfield retains a limited licence to operate and to train until deletion; enterprise content not used for training; a "Higgsfield Trust List" for C2PA reported (unverified) | third party; rights search summary |
| OpenArt | Starter / Plus / Pro / Wonder | $14 / $34 / $56 / $240 monthly | 4,000 / 12,000 / 24,000 / 106,000 credits | commercial from Plus; no ownership claim on output; C2PA status unknown | third party; rights search summary |
| ElevenLabs | Free / Starter / Creator / Pro / Scale / Business | $0 / $6 / $22 / $99 / $299 / $990 | 10k / 30k / 121k / 600k / 1.8M / 6M credits (about 1 per character, about 1,000 per minute) | commercial licence from Starter; free requires attribution | official snippet |

## 9. Platforms and stores

| Item | Value | Class |
|---|---|---|
| Vercel Pro | $20 per seat per month plus $20 usage credit; Active CPU $0.128 per CPU-hour base, $0.184 Frankfurt; provisioned memory $0.0106 to $0.0183 per GB-hour; edge requests about $2 per million | official snippet / third party |
| Supabase Pro | $25 a month with a $10 compute credit; additional projects from $10; 8 GB disk, 250 GB bandwidth; pgvector on all plans | official snippet |
| Railway | Hobby $5 a month including $5 usage; Pro $20 per seat; $20 per vCPU-month, $10 per GB-month | third party |
| Fly.io | shared-cpu-1x 256 MB about $2 a month (sources disagree) | third party, conflicting |
| Apple Developer Program | $99 per year | official, fetched |
| Google Play registration | $25 one time | official snippet |

## 10. Community and checkout fees

| Product | Plan | Fee | Class |
|---|---|---|---|
| Skool | Hobby $9 a month; Pro $99 ($82 annual) | Hobby 10 percent plus $0.30; Pro 2.9 percent plus $0.30 up to $899, 3.9 percent above | official snippet |
| Circle | Professional $89, Business $199, Enterprise $419 a month (annual) | 2 / 1 / 0.5 percent plus Stripe | third party |
| Gumroad | none | 10 percent plus $0.50 plus processing; 30 percent on Discover | third party |
| Stripe (EU) | none | 1.5 percent plus €0.25 EEA cards; 3.25 percent plus €0.25 non-EEA | third party |
| Polar (merchant of record) | Starter free; Pro $20; Growth $100; Scale $400 | 5 percent plus $0.50; 3.8 percent plus $0.40; 3.6 percent plus $0.35; 3.4 percent plus $0.30; organisations created before 2026-05-27 keep 4 percent plus $0.40 | third party |
| Lemon Squeezy (merchant of record) | none | 5 percent plus $0.50; plus 1.5 percent international, 0.5 percent subscriptions | third party |
| Whop | none | about 6.5 to 7 percent all in | third party |
| Udemy | none | 37 percent to the instructor on organic sales; subscription pool 15 percent from January 2026 | search summary |
| Apple App Store Small Business Program | none | 15 percent under $1 million | official, fetched |
| Anthropic skills, GPT Store, Cursor and Codex plugin marketplaces | — | no creator payout confirmed on any official page; the "15 percent skills marketplace" claim appears only on unofficial sites; the GPT Store pilot was US-only in January 2024 | official (absence) / unverified |

## 11. Standards

| Standard | Facts | Class |
|---|---|---|
| Model Context Protocol | current revision 2026-07-28 (RC locked 2026-05-21): stateless core, Multi Round-Trip Requests, `Mcp-Method` routing, cacheable `tools/list`, formal extensions, 12-month deprecation; OAuth 2.1 with Client ID Metadata Documents preferred over dynamic registration, RFC 9207 `iss` validation mandatory; official registry in preview, API frozen at v0.1, not GA | search summary (owner pages) / official (registry README) |
| A2A | v1.0 shipped 2026-03-12 (the 2026-04-09 date is the Linux Foundation one-year release); signed agent cards as JWS over JCS-canonical JSON at `/.well-known/agent-card.json`; multi-tenancy; part of the Agentic AI Foundation | search summary / official (GitHub) |
| AP2 | announced 2025-09-16; v0.2 April 2026 adds human-not-present payments; mandates (intent, cart, payment) as W3C verifiable credentials; donated to the FIDO Alliance (owner's page) | search summary |
| x402 | Coinbase whitepaper 2025-05-06; formalised under the Linux Foundation 2026-04-02 with 22 named launch members; a V2 exists (session tokens, multi-chain), date not captured; v3 appendix C's "2026-07-14, 40 members" not found | official (GitHub) / search summary |
| C2PA | spec 2.4 (April 2026); Deployment Guidance 1.0 (2026-07-08); Interim Trust List frozen 2026-01-01; durable credentials via soft bindings and a manifest repository; platform matrix: LinkedIn displays and preserves, TikTok preserves, YouTube shows a capture note, X displays for Premium but strips, Meta reads then strips; two formal analyses find the spec falls short of its security goals (2604.24890, 2603.02378) | search summary / third party |
| W3C VC 2.0 / DID | VC Data Model 2.0 Recommendation 2025-05-15; DID 1.1 Candidate Recommendation 2026-03-05; agent identity products: Microsoft Entra Agent ID, Okta Agent Gateway (July 2026) | search summary / third party |
| in-toto, DSSE, SLSA, Rekor | in-toto attestation spec v1.2, DSSE `payloadType application/vnd.in-toto+json`; SLSA v1.2; Rekor v1 public log caps entries at 100 KB, self-host documented; Rekor v2 (rekor-tiles) public instance `log2025-1.rekor.sigstore.dev`, yearly rotation, Helm chart for private deployment, v2.3.0 2026-06-10 | official (GitHub) |
| WebCrypto Ed25519 | Safari 17.0 (2023), Firefox 130 (2024), Chrome 137 stable 2025-05-27; no published mobile verify benchmark; noble-ed25519 pure JS verifies in 498 µs on an Apple M4 desktop | third party / official (library README) |
| OpenTelemetry GenAI conventions | still Development, not stable; moved to `open-telemetry/semantic-conventions-genai`; core attributes `gen_ai.provider.name`, `gen_ai.request.model`, `gen_ai.usage.input_tokens` | official (GitHub) / third party |
| AGENTS.md | first commit 2025-08-21; stewarded by the Agentic AI Foundation since December 2025; read by Codex, Cursor, Gemini CLI, Jules, Copilot and others; Claude Code reads CLAUDE.md natively | official (GitHub) / third party |
| Agent Skills / Agent Plugins | agentskills.io spec (2025-12-18); Agent Plugins 1.0.0 (2026-08-06, unverified day) without a permission model | search summary (from v3 appendix C) |

## 12. Regulation and residency

| Item | Facts | Class |
|---|---|---|
| EU AI Act base timeline | in force 2024-08-01; prohibitions 2025-02-02; GPAI obligations 2025-08-02; general application 2026-08-02 | search summary |
| Digital Omnibus on AI | Regulation (EU) 2026/1744; political agreement 2026-05-07; Council approval 2026-06-29; in force 2026-07-27; Annex III high-risk deferred to 2027-12-02, Annex I to 2028-08-02 | search summary (official pages) |
| Article 50 | 50(1), (2), (5) apply from 2026-08-02, not deferred; systems on the market before that date have until 2026-12-02 for the machine-readable marking | third party |
| GPAI Code of Practice | final; signatories include Google, Meta, Microsoft, OpenAI, Mistral, Anthropic; a fine-tuner becomes a provider only when the modification significantly changes the model, indicatively above one third of the original training compute | search summary |
| EU-US Data Privacy Framework | General Court dismissed the challenge 2025-09-03; appeal C-703/25 P pending | third party |
| Anthropic first-party API residency | `inference_geo` is `"us"` or `"global"` only; no EU inference geo; EU residency via Bedrock, Vertex or Foundry regions | **official, fetched** |
| OpenAI | `eu.api.openai.com` with EU storage and regional processing for eligible projects | search summary |
| Google | Vertex AI `eu` multi-region; the newest Gemini models' EU coverage lags (third party) | search summary / third party |
| US Copyright Office | Part 2 report 2025-01-29: human authorship required; prompts alone insufficient | search summary (official) |
| European Parliament | resolution 2026-03-10: fully AI-generated content without human creative input is public domain; no EU-level rule yet | search summary / third party |

## 13. Model licences

| Model | Licence | Class |
|---|---|---|
| Kimi K3 | "Kimi K3 License": MIT-like; a separate agreement is required if model-as-a-service revenue exceeds US$20 million in any twelve months; UI attribution above 100 million MAU or $20 million monthly revenue | **official, fetched** |
| Llama 4 | Community License (2025-04-05): 700 million MAU clause, "Built with Llama" attribution; the licence text carries no EU multimodal exclusion (the reported exclusion sits on download terms, unverified) | official (licence fetched) / third party |
| Qwen3 / 3.5 | Apache 2.0 | search summary |
| DeepSeek V4 | MIT | search summary |
| Nemotron | NVIDIA Nemotron Open Model License: commercial use and derivatives, NOTICE file attribution | search summary |
| Gemma | Gemma Terms of Use plus Prohibited Use Policy | search summary |

## 14. Dutch BV, WBSO, innovation box

| Item | Value | Class |
|---|---|---|
| BV incorporation | notarial deed mandatory; minimum capital €0.01; notary €500 to €1,500 (KVK figure), online from about €350 to €650; KVK fee €85.15; the notary files KVK and UBO registration; digital incorporation typically days; VAT number within about two weeks | search summary (official pages) / third party |
| Innovation box | effective 9 percent on qualifying innovation profit; requires a WBSO S&O statement or a patent | search summary (official) |
| WBSO 2026 | first bracket 36 percent, starters 50 percent, second bracket 16 percent; threshold €391,020; self-employed fixed deduction €15,979 plus €7,996 starter; 2026 deadline 2026-09-30 | search summary (official) / third party |

## 15. Accel and the room

| Item | Value | Class |
|---|---|---|
| Accel AI Innovate: Amsterdam | 2026-09-23, AI House Amsterdam (Gustav Mahlerplein 5); one-day hackathon on open-weight models served through Nebius Token Factory with Lovable and Tavily; evening 17:30 to 20:30 with Fabian Hedin (Lovable CTO) and Ben Fletcher (Accel), Chris Pedregal (Granola CEO) and Matt Robinson (Accel); winners get a Founders Pack; alongside HumanX Amsterdam 22 to 24 September | search summary / third party |
| Accel Europe | Fund VIII $650 million, seed to Series A, tickets $1 million to $20 million; a 2026 raise of $3.5 billion across four early-stage funds reported | third party |
| Accel Atoms | up to $1 to 2 million; India-anchored, not a Europe programme | search summary |

## 16. Papers (arXiv ids verified through the Firecrawl research index; arxiv.org was egress-blocked)

**Verification of the 32 ids cited in v1 appendix B and v3 appendix C:** all resolve to their claimed titles; no mismatch. Two name collisions to watch: a second "TRACER" (2602.11409) and a second "PLoRA" (2508.02932) exist; the appendices cite the right ones. 2606.04193 (Notarized Agents) states that no service has an incentive to emit its receipts in 2026.

**New papers cited in v4, by topic (2025 to 2026, mostly 2026; id, title, one line):**

Lifecycle and gates: 2608.20614 ACES (skill gates as paired live trials, NVIDIA); 2606.11686 layer-isolated no-LLM regression harness (238 cases in 2.4 s); 2604.27789 deployer-side gates for silent provider updates; 2603.00822 ContextCov (instruction files compiled into executable constraints, 88.3 percent compliance); 2602.22302 agent behavioural contracts; 2609.04681 cost economics of the agentic SDLC; 2601.04620 AgentDevel (agents as release engineering).

Routing: 2607.22465 TRACE-Router (route once per task, learn from the delayed outcome); 2605.30736 OrcaRouter (offline seed, online bandit); 2604.00136 ParetoBandit (dollar ceiling in closed loop); 2605.18796 UCCI (calibrated cascade, 31 percent cost cut on 75k production queries); 2606.19376 SLARouter; 2605.16604 R2V (step-level escalation).

Caching, batching, distillation: 2607.19214 keepalive economics (cache eviction measured across four providers); 2607.15516 two-tier cache cost model on Sonnet (about 3,500-token threshold, writes 12.5× reads); 2609.19657 PrefixBench-H100; 2605.28268 routing with batch prompting; 2608.23911 PROOF-Gen; 2604.07776 structured distillation of web agents; 2608.07885 skills instead of reasoning tokens.

Adapter fleets: 2604.06370 ForkKV; 2605.14217 PreFT (prefill-only adapters); 2608.03579 ultra-LoRA serving; 2607.28848 DeltaServe; 2609.04715 PLUME; 2604.21571 deletable per-user proxies.

Memory: 2605.04897 True Memory (verbatim event log, LoCoMo 93.0 vs Mem0 61.4); 2603.04814 fact memory vs long context cost; 2606.29914 MemDelta (benchmark confounds; embedder swap moves accuracy 6.2 points); 2608.29606 Agent Zero Memory (events timeline, graph, curated facts); 2608.22215 write routing and slow consolidation; 2605.07313 scale-conditioned memory evaluation.

Provenance and receipts: 2609.01931 Agent Flight Recorder; 2607.05397 Proof of Execution; 2606.04104 Proof-Carrying Agent Actions; 2608.28542 offline-verifiable evidence bundles; 2609.01992 ClaimReceipt; 2607.20860 IRIS gateway auditing; 2609.17645 State Without a Landlord (peer-replicated durable-workflow journal targeting the Workflow SDK); 2603.02378 authenticated contradictions (C2PA plus watermark).

Observability and cost: 2606.04056 catalogue of 63 budget-overrun incidents; 2607.01641 infinite agentic loops (IAL-Scan over 6,549 repositories); 2608.26225 Agent Mesh (147 incidents; error-rate breakers miss loops of successful calls); 2609.20301 AgentPProf; 2609.01466 live trace ledger; 2606.15954 Green SARC.

Agentic commerce: 2607.12575 x402 population-scale measurement; 2609.00060 formal analysis of agent payment protocols; 2604.15367 SoK on agentic-commerce security; 2609.11757 AP2 whisper attacks; 2609.02208 refundable settlement profile; 2606.08790 RAILS clearing; 2608.01341 402Pilot.

Operator structures: 2608.23867 Markets, Not Planners (AgentLance); 2607.09600 Agora auctions; 2609.02580 double-auction replication; 2605.07728 SARC (obligations compiled into four enforcement sites); 2603.13189 constitutional multi-agent governance; 2606.19464 deontic policies; 2609.14767 flat versus hierarchical paired experiment; 2603.22651 orchestration patterns with cost; 2608.26480 manager-worker scaffold isolated; 2605.13851 invisible orchestrators.

First authors were retrieved for about forty of these and are in the research file; the rest can be closed in one request to `export.arxiv.org` from an unblocked machine. No 2026 paper quantifies batch-API discounts across providers; no C2PA-for-agent-runs study exists.

## 17. Economics benchmarks

| Fact | Value | Class |
|---|---|---|
| Open-core conversion rates | none of GitLab, Supabase, Cal.com, PostHog, n8n, Sentry publishes one | unverified (absence) |
| Open-core licences | GitLab MIT Expat plus proprietary `ee/`; Supabase Apache 2.0; PostHog MIT Expat plus `ee/`; n8n Sustainable Use License 1.0; Sentry FSL-1.1-Apache-2.0 (converts after two years); Cal.com community edition MIT, commercial edition closed since April to May 2026 | official (LICENSE files) |
| Open-core tiers | GitLab Premium $29 / Ultimate $99 per user; Supabase Pro $25 / Team $599; Cal.com Teams $12 to $15 / Organizations $37; n8n Starter €20; Sentry Team from $26; PostHog usage-based with 1M free events | search summary |
| Fractional CTO or AI-architect retainers, Western Europe | €2,500 to €12,000 a month for two to eight days a month | third party (consultancy benchmark) |
| AI agency retainers | $2,000 to $20,000 a month; median SMB $2,800 to $7,000 | third party |
| Professional-services margins | project gross margin 37.7 percent (2025); EBITDA 9.9 percent | third party (SPI Research) |
| Per-artifact trust pricing precedents | DocuSign API $50 a month for 40 envelopes, $300 for 100, overage about $4 to $7; Truepic from $1,000 a month with per-inspection rates; Sigstore free public good; C2PA royalty-free; CertiK and Onfido quote per engagement | third party / official (Sigstore, C2PA) |
| Creator economy | Goldman Sachs about $250 billion, approaching $480 billion by 2027 (2023); SignalFire 50 million creators, 2 million full time (2020); NeoReach 2025: over 15 percent of full-time creators earn $100k or more, over half under $15k | search summary / third party |
| Retreats | Spain multi-day €600 to €1,500 typical; Canaries €1,575 to €2,350; Croatia hosted week €500 to €1,950; group sizes not stated on any listing | third party |
| Houseboats and villas | NVM 2026 release: 235 houseboats sold in 2025 at €466,000 average, a quarter in Amsterdam; Funda Amsterdam listings €299k to €1,995k; idealista Marbella €5,581 per m² (May 2026), Fuerteventura La Oliva €3,680 (August 2026), Lanzarote about €2,975 (Q1 2026) | third party / search summary |
| Solar, Netherlands | netting scheme ends 2027-01-01 with no phase-out; typical payback six to nine years; solar carport economics not found | search summary / unverified |
| AI margins | Bessemer February 2026: 50 to 60 percent gross margin for AI companies versus 80 to 90 for SaaS; ICONIQ 2026: 41 → 45 → about 52 → 59 percent projected 2027; a16z LLMflation about 10× per year inference cost decline (November 2024) | opinion pieces |
| Talent, Amsterdam 2026 | senior frontend €80,000 average; senior product designer €89,400; AI engineer €85,000 to €175,000 total; freelance AI engineer €100 to €150 an hour; ICT freelancer average €108 an hour | third party |

## 18. Corrections to v3 appendix C (consolidated)

1. Nebius batch discount is 50 percent, rounded up to the cent; appendix C said 30 percent, unverified.
2. Gemini's Flash row was stale; 3.8 Flash is 0.75 / 3.75 with intro prices through 2026-12-31; the 0.0375 cache figure was the batch rate.
3. GPT-5.6 Sol's 4 / 20 is promotional through at least 2026-11-21, not a permanent cut.
4. Nebius's public endpoint compute location is dynamic; data is stored in Finland; EU processing is pinned only on dedicated endpoints; ZDR must be on for "no training on our traffic" to be true.
5. Nebius LoRA training price remains unverified; the stale 2025 figure is $0.40 per million tokens.
6. Kimi K3, GLM-5.2, GLM-5.3-Flash, Llama 3.3 70B and two Qwen3 rows are now official snippets from Nebius cookbooks; DeepSeek V4 Pro settles at 1.75 / 3.50; no Llama 4 row on Nebius.
7. Nebius GPU list prices confirmed on the docs page; a reported rise is undated.
8. Workflow DK beta is 5.0.0-beta.55; `ai` 7.0.108; same-day churn, so quote the date.
9. FX: 1.1460 is the 09-18 fixing; 1.1490 is 09-21.
10. Suno's terms changed around 2026-09-03: rights attach to downloads while subscribed, capped at 20 or 60 a month.
11. MCP SDK is split into `@modelcontextprotocol/server` and `/client` 2.0.0; the official registry is still preview.
12. A2A v1.0 shipped 2026-03-12; 2026-04-09 is the milestone release.
13. AP2's donation to the FIDO Alliance is stated on the owner's page; upgrade from unverified.
14. x402 Foundation launch listed 22 members on 2026-04-02; the "40 members, 2026-07-14" claim was not found; a V2 exists.
15. C2PA: add Deployment Guidance 1.0, the frozen Interim Trust List and the platform matrix; Suno emits C2PA.
16. EU AI Act: the Omnibus is Regulation (EU) 2026/1744, in force 2026-07-27; Annex I deferred to 2028-08-02.
17. WebCrypto Ed25519: Chrome 137 shipped 2025-05-27, not 2026.
18. OpenTelemetry GenAI conventions are still Development.
19. AI SDK 7 also renamed `system` to `instructions`.
20. Anthropic's first-party API has no EU inference geo.
21. Rekor v1 caps entries at 100 KB; Rekor v2's public instance rotates yearly.
22. New rows appendix C lacked: Suno, Higgsfield, OpenArt and ElevenLabs prices and rights; Vercel compute rates; Railway; Fly; store fees; community and checkout fees; NIM licensing; Nemotron sizes and Apple-silicon measurements; vLLM features; model licences; Dutch BV facts; the Accel event; every paper in section 16; every economics row in section 17.

## 19. Provenance and network note

Read in full: platform.claude.com pricing and data-residency pages; developer.apple.com programme and small-business pages; the LICENSE files of GitLab, Supabase, PostHog, n8n, Sentry, Cal.com, Kimi K3, Llama 4 on GitHub; the READMEs of the MCP registry, A2A, x402, in-toto attestation, Rekor, rekor-tiles, semantic-conventions-genai, agents.md, noble-ed25519; the vLLM LoRA and prefix-caching docs; the llama.cpp Nemotron discussion; npm and PyPI registries; Context7 for `ai`, `workflow`. Reached only through snippets or third parties: every other vendor and government page named above. Papers: verified through the Firecrawl research index because arxiv.org was blocked; each id appeared verbatim with its title in a tool result.

Built on SIP.
