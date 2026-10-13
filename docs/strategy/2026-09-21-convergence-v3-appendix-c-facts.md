# Convergence v3 — appendix C: dated external facts (2026-09-21)

Compiled 2026-09-21 by the research pass for `2026-09-21-convergence-v3.md`. Extends and corrects v1 appendix B. Every fact carries a date and a source; "unverified" means no readable source states it. Nebius per-model prices are third-party mirrors of a login-walled list and are to be re-checked in the console on the day.


**FX used throughout:** ECB euro reference rate 2026-09-18, 1 EUR = 1.1460 USD, so 1 USD = 0.8726 EUR (search: ECB Data Portal, https://data.ecb.europa.eu/key-figures/ecb-interest-rates-and-exchange-rates/exchange-rates). Market quote 2026-09-21 ~1.1477–1.1489 (search: wise.com, tradingeconomics.com). All EUR figures below use 0.8726.

## A. Nebius Token Factory — prices and capabilities

Nebius's own price list is behind login (`tokenfactory.nebius.com/organization/prices`; snippet of nebius.com/services/token-factory). The rows below are third-party mirrors of that list and disagree on some models; where they disagree, both values are given. USD per 1M tokens; EUR at 0.8726.

| Model (Nebius id) | Input $ / € | Output $ / € | Context | Source (date) |
|---|---|---|---|---|
| DeepSeek V4 Pro (`deepseek-ai/DeepSeek-V4-Pro`, GA 0813) | 1.75 / 1.53 **or** 2.00 / 1.75 | 3.50 / 3.05 **or** 4.00 / 3.49 | 164K (requesty) or 1.0M (mastra) | requesty.ai/models/nebius; mastra.ai/models/providers/nebius (snippets, 2026-09-21) |
| DeepSeek V4 Flash 0731 (`deepseek-ai/DeepSeek-V4-Flash-0731`, 284B/13B active) | 0.14 / 0.122 | 0.28 / 0.244 | 1.0M (1.05M on OpenRouter) | mastra.ai; openrouter.ai/provider/nebius (snippets) |
| Nemotron 3 Nano 30B-A3B (`nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B`) | 0.06 / 0.052 | 0.24 / 0.209 | unverified | openrouter.ai/nvidia/nemotron-3-nano-30b-a3b, Nebius provider row (snippet) |
| Nemotron 3 Super 120B-A12B (`nvidia/nemotron-3-super-120b-a12b`) | 0.30 / 0.262 | 0.90 / 0.785 | unverified | search: getmaxim.ai + requesty (Nebius rows); OpenRouter floor across providers is 0.08/0.45 |
| Nemotron 3 Ultra 550B-A55B (`nvidia/Nemotron-3-Ultra-550b-a55b`) | 1.00 / 0.873 | 3.00 / 2.62 | unverified | search: requesty.ai/models/nebius/nvidia-nemotron-3-ultra-550b-a55b; OpenRouter floor 0.50/2.20 |
| Qwen3.5-397B-A17B (`Qwen/Qwen3.5-397B-A17B`) | 0.60 / 0.524 | 4.00 / 3.49 | 262K | mastra.ai (snippet) |
| Qwen3-Embedding-8B (`Qwen/Qwen3-Embedding-8B`) | 0.01 / 0.0087 | n/a | 41K | mastra.ai; openrouter.ai/qwen/qwen3-embedding-8b (snippets) |
| GLM-5.1 (`zai-org/GLM-5.1`) | 1.40 / 1.22 | 4.40 / 3.84 | 200K | requesty.ai (snippet) |
| GLM-5.2 (`zai-org/GLM-5.2`) | 1.40 / 1.22 **or** 1.00 / 0.873 | 4.40 / 3.84 **or** 4.00 / 3.49 | 1.0M | requesty vs mastra (snippets) |
| GLM-5.3-Flash (`zai-org/GLM-5.3-Flash`; GLM-5.3 also listed, price unverified) | 0.15 / 0.131 | 0.50 / 0.436 | 1.0M | mastra.ai; pricepertoken.com/endpoints/nebius lists 5.3 (snippets) |
| Kimi K3 (`moonshotai/Kimi-K3`) | 3.00 / 2.62 | 15.00 / 13.09 | 1.0M, 131K max out | mastra.ai; requesty.ai (snippets) |
| GPT-OSS 120B (`openai/gpt-oss-120b`) | 0.15 / 0.131 **or** 0.10 / 0.087 | 0.60 / 0.524 **or** 0.50 / 0.436 | 131K | openrouter.ai/provider/nebius row (snippet) vs search: llmgateway.io. A "deactivation 2026-08-31" claim in a search summary is unverified; pricepertoken still lists it 2026-09-21 |
| Gemma 3 27B-it (`google/gemma-3-27b-it`, vision-capable per model card; vision on Nebius unverified) | 0.10 / 0.087 **or** 0.06 / 0.052 | 0.30 / 0.262 **or** 0.20 / 0.175 | unverified | search: getmaxim.ai vs futureagi.com |
| Flux (image) | from $0.0013 / image (Jan 2025 press release, AI Studio era; current price unverified) | — | up to 2000x2000 | search: nebius.com newsroom 2025-01-22 |

Capabilities (official docs via snippets, 2026-09-21 unless dated):
- Endpoint `https://api.tokenfactory.nebius.com/v1/`; a US regional endpoint `api.tokenfactory.us-central1.nebius.com` exists (snippet, nebius.com/services/token-factory/nemotron).
- **Flavors:** `base` and `-fast` (append to model name); Fast uses smaller batches, more compute and **speculative decoding**; outputs identical, prices differ (docs.tokenfactory.nebius.com/ai-models-inference/overview). Fast-flavor prices not seen. **Custom speculator training** (train your own draft model) is a post-training product (docs …/post-training/overview).
- **Batch inference:** documented at docs.tokenfactory.nebius.com/data-lab/batch-inference; the discount percentage is **unverified** (appendix B said "discount confirmed" without a number; a third-party page claims 30%, deploybase.ai, undated).
- **Prompt / prefix caching: not offered.** Feature request "Support Implicite/Explicite Prompt Caching", status "In Review", 31 votes, opened ~6 months ago, latest comment "19 days ago" (ideas.nebius.com/p/support-impliciteexplicite-prompt-caching, snippet). Any Nebius "cache hit price" you see in search summaries is not from Nebius.
- **Fine-tuning:** supervised FT with LoRA or full weights; API params `lora`, `lora_r` 8–128, `lora_alpha`, `lora_dropout`, `context_length` 8192 default up to 131072; fine-tunable bases include DeepSeek V3/V4, Gemma 4 (full FT only), gpt-oss-20b/120b BF16 (LoRA + full), Qwen3 dense/MoE/coder, Llama 3.x; W&B and HF integrations. Hosted adapters billed "transparent $/token". **Per-token training price: unverified** (login-walled). (docs …/post-training/models, …/how-to-fine-tune; snippets.)
- **Data:** ToS §7 says Nebius "collects and processes both Input and Output data for the purpose of training smaller Models used exclusively for Speculative Decoding"; a zero-retention mode is offered per FAQ; OpenRouter lists Nebius as "Zero retention / does not train". ToS moves to docs.nebius.com/legal/agreement on 2026-09-28 (snippet). State this precisely in any privacy claim.
- **Not seen on Token Factory:** an official MCP server, video generation, prompt caching. (§3 of the hackathon doc stands.)

## B. Comparison prices (USD per 1M tokens; EUR = ×0.8726)

| Provider / model | Input | Cache hit | Output | Batch | Notes / source |
|---|---|---|---|---|---|
| Anthropic Claude Opus 5 | 5.00 | 0.50 (0.1×); 5m write 6.25, 1h write 10 | 25.00 | −50% (2.50/12.50) | official platform.claude.com/docs/en/about-claude/pricing (fetched 2026-09-21) |
| Anthropic Claude Sonnet 5 | 2.00 (introductory price made permanent; the 2026-09-01 rise to 3/15 was cancelled) | 0.20 | 10.00 | −50% (1/5) | same page |
| Anthropic Claude Haiku 4.5 | 1.00 | 0.10 | 5.00 | −50% (0.50/2.50) | same page; 200K context (claude-api skill table, cached 2026-06-24) |
| Anthropic Claude Fable 5.1 | 10.00 | 0.25 (0.025×) | 50.00 | −50% | same page; for reference only |
| OpenAI GPT-6 Astra (2026-09-03) | 10.00 | 1.00 | 50.00 | −50% (third party) | snippet openai.com/api/pricing; batch/cache-write 1.25× from search: benchlm.ai, morphllm.com |
| OpenAI GPT-5.6 Sol / Terra / Luna | 4.00 / 2.00 / 0.20 (Sol cut from 5.00 on 2026-07-30) | 0.40 / 0.20 / 0.02 | 20.00 / 12.00 / 1.20 | −50% | snippet openai.com/api/pricing; cut date: search cloudzero.com |
| Google Gemini 3.1 Pro preview | 2.00 (≤200K) / 4.00 (>200K) | ~0.20 (third party) | 12.00 / 18.00 | −50% (third party) | snippet ai.google.dev/gemini-api/docs/gemini-3; cache: search curlscape.com |
| Google Gemini 3 Flash preview / 3.1 Flash-Lite | 0.50 / 0.25 | 3.x Flash line: 0.0375 through 2026-12-31 (+ storage 0.50 per 1M tok-hour) | 3.00 / 1.50 | −50% | snippet ai.google.dev pricing (Gemini 3.6–3.8 Flash rows); newer 3.5–3.8 Flash at intro 0.75/3.75 (search puter.com) |
| DeepSeek direct `deepseek-flash` (= V4.1 Flash; V4 Flash names retired) | 0.15 off-peak (0.30 peak) | 0.003 off-peak (0.006 peak) | 0.60 off-peak (third party) | none found (unverified) | snippet api-docs.deepseek.com/quick_start/pricing; output & peak: search aipricing.guru; −60% cut effective 2026-09-10 (search kucoin) |
| DeepSeek direct `deepseek-v4-pro` | 0.66 off-peak | 0.022 off-peak | 1.98 off-peak (third party) | — | same |
| Together V4 Flash 0731 / V4 Pro 0813 / V4.1 Flash / gpt-oss-120B | 0.14 / 1.32 / 0.30 / 0.15 | 0.03 / 0.13 / 0.006 / — | 0.28 / 3.96 / 1.20 / 0.60 | −50% (third party) | snippet docs.together.ai/docs/serverless/models; batch: search computeprices.com; LoRA adapters served on dedicated endpoints only |
| Fireworks V4 Flash 0731 / V4 Pro 0813 / V4.1 Flash / gpt-oss-120B | 0.22 / 1.32 / 0.30 / 0.15 | 0.007 / 0.044 / 0.006 / 0.015 | 0.66 / 3.96 / 1.20 / 0.60 | −50% (official) | snippet docs.fireworks.ai/serverless/pricing; LoRA SFT from $0.50 per 1M training tokens ≤16B (search morphllm) |
| Groq gpt-oss-120B | 0.15 | 0.075 (50%) | 0.60 | −50%, 24h–7d window | snippet console.groq.com/docs/models (500 tok/s, 131K); cache/batch: search eesel.ai, cloudzero.com |

Cross-provider floor for DeepSeek V4 Flash 0731 on OpenRouter is $0.04/$0.16 (snippet openrouter.ai/deepseek/deepseek-v4-pro-0813 sidebar); Nebius at 0.14/0.28 is mid-pack on price and the only EU-domiciled option in the table.

## C. Cost per artifact (EUR, arithmetic shown)

Assumptions: extraction step also emits ~1k output tokens (spec gives input only); Nebius rows use DeepSeek V4 Flash 0.14/0.28, Nemotron Nano 0.06/0.24, GPT-OSS 120B 0.15/0.60, Qwen3-Embedding 0.01; Claude has no embedding endpoint, so the €0.00002 Qwen embed is kept in the Claude rows. Retrieval (6 sources) is search-API cost, excluded here.

**(1) Desk brief on Nebius.** Extract 8,000×0.06 + 1,000×0.24 = $0.00048+0.00024 = $0.00072. Synthesize 10,000×0.14 + 1,500×0.28 = $0.0014+0.00042 = $0.00182. Judge 4,000×0.15 + 300×0.60 = $0.0006+0.00018 = $0.00078. Embed 2,000×0.01 = $0.00002. **Total $0.00334 = €0.0029.**

**(2) 30-artifact constellation on Nebius.** Per artifact 3,000×0.14 + 600×0.28 = $0.00042+0.000168 = $0.000588. ×30 = **$0.01764 = €0.0154.**

**(3) Same jobs on Claude.** Brief totals: 22,000 in, 2,800 out (all stages on one model).
- Sonnet 5: 22,000×2 + 2,800×10 = $0.044+0.028 = $0.072 (+$0.00002) → **€0.0628**; constellation 30×(3,000×2 + 600×10)/1M = 30×$0.012 = $0.36 → **€0.314**.
- Haiku 4.5: 22,000×1 + 2,800×5 = $0.022+0.014 = $0.036 → **€0.0314**; constellation 30×$0.006 = $0.18 → **€0.157**.
- Ratio vs Nebius: brief 21.6× (Sonnet) / 10.8× (Haiku); constellation 20.4× / 10.2×.

**(4) Batch.** Anthropic −50%: Sonnet brief €0.0314, constellation €0.157; Haiku brief €0.0157, constellation €0.0785. Nebius: batch exists, discount unverified; at the third-party 30% figure the brief would be €0.0020 and the constellation €0.0108. Note the Fireworks/Together *batch* price for V4 Flash 0731 on OpenRouter is $0.11/$0.33, i.e. above Nebius's standard price.

**(5) 70% prefix cache hits.** Anthropic: effective input multiplier 0.3×1.0 + 0.7×0.1 = 0.37 (5m write premium of 1.25× on the first request ignored; add ~+1% on a 30-item run).
- Sonnet 5: brief 22,000×2×0.37/1M + 2,800×10/1M = $0.01628+0.028 = $0.04428 → **€0.0386**; constellation 30×(3,000×2×0.37 + 600×10)/1M = 30×$0.00822 = $0.2466 → **€0.215**. With batch stacked: €0.0193 / €0.108.
- Haiku 4.5: brief $0.00814+0.014 = $0.02214 → **€0.0193**; constellation 30×$0.00411 = $0.1233 → **€0.108**. With batch: €0.0097 / €0.054.
- Nebius: no caching, figures unchanged (€0.0029 / €0.0154). Even after cache+batch, Sonnet stays ~6.6× and Haiku ~3.3× the Nebius cost on the brief; the Nebius advantage is therefore real but narrower than the headline 20×, and it disappears entirely against DeepSeek direct off-peak (brief ≈ 22,000×(0.3×0.15+0.7×0.003) + 2,800×0.60 = $0.00104+0.00168 = $0.00272 → €0.0024), which is not EU-hosted.

## D. Runtime libraries (Context7 + npm registry, 2026-09-21)

- **AI SDK — correction to appendix B: the current major is 7, not 6.** npm `ai` latest 7.0.108 (published 2026-09-21); `ai-v6` tag 6.0.287. AI SDK 7 announced 2026-06-25 (search: vercel.com/blog/ai-sdk-7; x.com/vercel). Breaking: ESM-only, Node 22; `usage` now aggregates all steps and `totalUsage` is deprecated; `cachedInputTokens`/`reasoningTokens` moved to `inputTokenDetails.cacheReadTokens` / `outputTokenDetails.reasoningTokens` (Context7 /vercel/ai, migration-guide-7-0). `ToolLoopAgent` takes `instructions`, `tools`, `stopWhen` (default `isStepCount(20)`, or `isLoopFinished()`), `output`, `prepareStep`, and **`toolApproval`** — per-tool `'user-approval'`, `{type:'denied', reason}` or a function `(input, {runtimeContext}) => ...`; approval policy placement is one of the v6→v7 semantic migrations (Context7 /vercel/ai reference 16-tool-loop-agent, 06-tool-approvals). `Output.object({schema})` on `generateText`; failure surfaces as `AI_NoObjectGeneratedError` / `AI_NoOutputGeneratedError` (10-generating-structured-data). Gateway fallback: `providerOptions.gateway.order: [...]` and `only: [...]`, combinable with a `models` fallback list (Context7 /websites/vercel_ai-gateway, provider-options and model-fallbacks). `createOpenAICompatible({name, baseURL, apiKey, includeUsage: true})` — `includeUsage` is required to get usage on streamed responses; `metadataExtractor` captures provider-specific fields (Context7 /vercel/ai, openai-compatible index). npm `@ai-sdk/openai-compatible` 3.0.53, `@ai-sdk/gateway` 4.0.88.
- **Workflow Development Kit.** npm `workflow` latest 4.8.9 (2026-09-21), 5.0.0-beta.54. Steps are `'use step'` functions with full Node access; `'use workflow'` functions run in a deterministic sandbox (no native fetch/setTimeout/fs); all step I/O is serialized to an event log for replay; `getStepMetadata().stepId` is the idempotency key for external writes; `fn.maxRetries = n` per step; `sleep('1d')`, `createWebhook()` for pause/resume (Context7 /vercel/workflow). Limits (Vercel-hosted): 10,000 steps per run, 50 MB max payload, 8 KiB attribute write, 255-byte step name; v5 enforces 25,000 events per run (`WORKFLOW_MAX_EVENTS`); inline execution budget 2m/5m/10m tiered by runtime deadline (`WORKFLOW_V2_TIMEOUT_MS`). Pricing: "Workflow Data Written" 1 GB included on Hobby, $0.50/GB on demand, retained data billed per GB-month; step functions billed at normal function compute; queues via Vercel Queues (snippet vercel.com/docs/workflows/pricing). Appendix B's "no execution-time limit" is true of wall-clock across sleeps, not of a single inline step.
- **Supabase.** Hybrid search: two CTEs (`fts @@ websearch_to_tsquery`, `embedding <#> query`) each limited to `least(match_count,30)*2`, full outer join, score `1/(rrf_k+rank)` weighted by `full_text_weight` and `semantic_weight` (both default 1), `rrf_k` default 50 (Context7 /supabase/supabase guides/ai/hybrid-search). Queues: pgmq via `pgmq_public.read/delete` RPC from Edge Functions, exactly-once within a visibility window. Scheduling: `cron.schedule` + `net.http_post` with secrets from Vault. Edge Function limits: 256 MB memory, wall clock 150 s (Free) / 400 s (Paid), 2 s CPU per request, 150 s idle timeout (guides/functions/limits). Unchanged from appendix B except the explicit limits.
- **mem0 — correction to appendix B (v2.0.7).** npm `mem0ai` 3.2.0 (2026-09-18); PyPI `mem0ai` 2.1.0 (2026-09-18). API surface identical on self-hosted `Memory` and hosted `MemoryClient`: `add / search / get / get_all / update / delete / delete_all / history`, scoped by `user_id`, `agent_id`, `run_id`; filters support `AND/OR/NOT` and `*`; reranking, expiration, custom extraction instructions; hosted adds `batchUpdate`, `batchDelete`, webhooks (Context7 /mem0ai/mem0 LLM.md, platform-vs-oss). A Vercel AI SDK provider v3.0.3 shipped 2026-09-18 (github.com/mem0ai/mem0/releases).
- **AgentDB (ruvnet).** npm `agentdb` latest 3.0.0-alpha.20 (2026-07-30) — still alpha. "Learning index" in its own words: "AgentDB watches which results your agent actually used, learns from that signal, and ranks the next query better … Self-learning search improves up to 36% from feedback alone" (github.com/ruvnet/agentdb README). Docs add ReasoningBank (PatternMatcher, ExperienceCurator, MemoryOptimizer, ContextSynthesizer), Reflexion episodic replay, causal memory, and Merkle-proof "explainable recall" (Context7 /websites/agentdb_ruv_io). The 36% figure is vendor-claimed, unverified.
- **sqlite-vec.** Latest v0.1.9, 2026-03-31 (DELETE fix on vec0 metadata columns); v0.1.7 restored proper DELETE and added KNN constraints/pagination (github.com/asg017/sqlite-vec/releases). `vec_version()`; `vec0` virtual tables with typed metadata columns usable as KNN filters; quantization via `vec_quantize_int8`, `vec_quantize_binary` (length divisible by 8; float or int8 input), `vec_quantize_float16`, and `vec_quantize('sqf16'|'sqi8'|'bq2', …)` (Context7 /asg017/sqlite-vec api-reference, guides/scalar-quant, guides/binary-quant).

## E. Papers, 2026 (arXiv id; month from id)

Already cited in appendix B: 2604.26275 (A-SDLC six-layer architecture), 2606.15283 (pragmatic path), 2606.30546 (MAS-Lab), 2606.04967 (process taxonomy).

Agentic development life cycle / spec-driven / eval-driven:
- **2608.20341** (Aug) SDAD: formalises Spec-Driven Agentic Development — specification quality is "execution fuel"; our brief is the spec.
- **2609.00252** (Sep) SDD for Agentic SE: names the "productivity paradox" (individual speed up, team throughput down) and positions specs as the team-scale discipline.
- **2604.05278** (Apr) Spec Kit Agents: read-only probing hooks per phase (Specify/Plan/Tasks/Implement) cut hallucinated APIs; 128 runs, 32 features, 5 repos.
- **2603.25697** (Mar) Kitchen Loop: spec surface + synthetic power user + "unbeatable tests the author cannot fake" + drift-control pause gates — closest published analogue to our seven gates.
- **2603.08806** (Mar) TDAD: prompts as compiled artifacts; a second agent refines until behavioural tests pass — eval-driven development for tool-using agents.
- **2606.02755** (Jun) Acceptance-test-driven evaluation protocols: stakeholder goals become executable behavioural contracts and release gates.
- **2603.15676** (Mar) Automated self-testing quality gate with PROMOTE/HOLD/ROLLBACK on five dimensions incl. evidence coverage.
- **2606.15474** (Jun) "Who drifted, the system or the judge": anchor set + e-process to attribute drift to the LLM judge — needed if GPT-OSS judges V4 Flash over time.
- **2606.20615** (Jun) protocol DSL for AI-SDLC human-agent boundaries with enforcement invariants.

Receipts, attestation, provenance:
- **2609.12582** (Sep) NovaFabric: tamper-evident, replayable "Run Capsule" for agent runs; provider-neutral; cites EU AI Act/ISO 42001 record-keeping.
- **2606.04193** (Jun) Notarized Agents: the *receiver* of a call signs a receipt into a transparency log — inverts the trust boundary from self-reported traces.
- **2608.00801** (Aug) Action evidence packages composed with IETF RATS hardware attestation — the "signed, append-only record of what an agent did" vocabulary.
- **2608.17176** (Aug) Durable policy-decision receipts (Ed25519-signed, crash-safe).
- **2606.22560** (Jun) Evidence-bound gateway-path provenance: proves which provider/model actually served a call and whether fallback occurred — directly relevant to AI Gateway `order` fallbacks.
- **2603.28988** (Mar) Attesting LLM pipelines: in-toto/DSSE-style binding of training/release claims to artifacts.
- **2604.24890** (Apr) formal analysis: current C2PA specs "fail to achieve their claimed security goals" — cite before leaning on C2PA for agent runs.
- **2608.18398** (Aug) LEDGER claim-to-evidence trace graphs; **2606.04990** (Jun) survey of evidence tracing in LLM agents.

Routing, speculative decoding, distillation, LoRA fleets:
- **2604.14531** (Apr) TRACER: trains a surrogate on the LLM's own production logs, defers when unsure — "routing trained on logs".
- **2604.23577** (Apr) RouteNLP: closed-loop router + conformal cascade + distillation co-optimisation; enterprise partner >$200K/month with 70% routine queries.
- **2606.22840** (Jun) RLM-Cascade: response-level speculative decoding at the proxy layer; −45.8% API cost on a Claude Code workload with 88.8% draft use.
- **2607.12696** (Jul) cost-aware speculative decoding for MoE (expert-scattering); **2607.04244** (Jul) quantised target + distilled drafter for Qwen3.5-4B.
- **2606.02437** (Jun) "Towards million personal models": adapters as persistent per-user state on a shared base — the LoRA-fleet thesis.
- **2608.05483** (Aug) PLoRA: pooled-memory multi-LoRA serving for 1000+ adapters; **2604.07173** (Apr) InfiniLoRA disaggregated LoRA serving; **2604.16583** (Apr) POLAR adapter caching/routing at the edge; **2605.13779** (May) MinT managed LoRA training+serving for "millions of LLMs".

## F. Standards and regulation (as of 2026-09-21)

- **EU AI Act Article 50.** 50(1), (2), (5) apply from **2026-08-02**; not deferred by the Digital Omnibus (which moved Annex III high-risk to 2027-12-02). Grace: generative systems placed on the market before 2026-08-02 have until **2026-12-02** for the 50(2) machine-readable marking, and **2027-02-02** (Paul Weiss) for watermark-detection interoperability. Commission published final transparency guidelines and confirmed the Code of Practice on AI-generated content as adequate (July 2026). Fines up to €15M or 3% turnover. Sources: snippets artificialintelligenceact.eu/transparency-rules-article-50; digital-strategy.ec.europa.eu quick-facts; paulweiss.com client memo; search cooley.com 2026-08-03, faegredrinker.com 2026-07.
- **C2PA.** Current spec **2.4, 2026-04-21**; 2.3 (2026-01-08) added manifests for unstructured text (renumbered A.8 in 2.4) and live-stream video. No agent-run / action-provenance extension found — **unverified** (search: encypher.com, Wikipedia "Content Credentials", spec.c2pa.org 2.4 URLs). Security caveat: 2604.24890 above.
- **A2A** 1.0 released 2026-04-09 under the Linux Foundation; 150+ orgs; signed Agent Cards, multi-tenancy (search: linuxfoundation.org press, opensource.googleblog.com 2026-04). **AP2** announced 2025-09-16 (Google, 60+ partners); v0.2 and contribution to the FIDO Alliance April 2026 (search: cloud.google.com blog; eco.com — the FIDO step is third-party, unverified). **x402**: LF announced the x402 Foundation 2026-04-02 (Coinbase/Cloudflare contribution), operational launch 2026-07-14 with 40 founding members (search: linuxfoundation.org press, x402.org).
- **MCP.** The **2026-07-28** revision is current and final (RC locked 2026-05-21): stateless core, Multi Round-Trip Requests, `Mcp-Method` header routing, cacheable `tools/list` with `ttlMs`, OAuth hardening (RFC 9207, Client ID Metadata Documents), Tasks and MCP Apps as formal extensions, Roots/Sampling/Logging deprecated with 12-month support. No later revision or RC date announced (blog.modelcontextprotocol.io/posts/2026-07-28, fetched). The .ai site's 2026-07-28 claim is **confirmed**.
- **Agent Skills** spec at agentskills.io/specification (Anthropic, released 2025-12-18; ~40 products by 2026-06). **Agent Plugins 1.0.0** shipped **2026-08-06** (one search summary says 2026-08-12 — unverified which): `plugin.json` + `skills/` + `mcp.json`; initiated by Vercel with AWS, Anysphere, GitHub, Microsoft, OpenAI; **Anthropic not a signatory**, though the CLI translates into Claude Code plugins; v1 has no permission model, sandboxing, signatures or secrets (search: eesel.ai, digitalapplied.com, qveris.ai).

## G. How comparable companies narrate proof (customer-held vs vendor-held)

- **Vercel eve "Agent Runs"** (changelog 2026-06-26): per-session run with trigger, duration, tokens, drill-down to every model/tool call; vendor-held in the dashboard, up to 30-day retention with Observability Plus; OTel spans can be exported to your own backend (search: vercel.com/changelog/eve-agent-observability).
- **LangSmith**: the "trace"; vendor-held (GCP us-central-1) unless Enterprise self-host/BYOC; bulk export to S3 Parquet is Enterprise-only for sign-ups after 2026-08-03; max retention cut 400→180 days in Sept 2026 (search: docs.langchain.com/langsmith/data-export, langchain.com/pricing).
- **Braintrust**: logs/spans + experiments; hybrid deployment with a self-hosted data plane; export to S3/GCS as JSONL/Parquet — customer-held when self-hosted (search: braintrust.dev docs export, github braintrustdata/helm). May 2026 AWS breach reported (search: sentrial.com) — unverified.
- **Arize**: OpenInference spans on OpenTelemetry; Phoenix is OSS/self-hosted (customer-held), AX managed (vendor-held) (search: github Arize-ai/openinference, phoenix).
- **Humanloop**: acquired by Anthropic and sunset (search: atlan.com; unverified date). **Galileo**: Cisco announced 2026-04-09, closed 2026-05-22, folded into Splunk Observability (search: blogs.cisco.com, networkworld.com).
- **Sierra**: "Agent Development Life Cycle" post 2026-07-16; conversation-level audit trails showing knowledge sources consulted, systems accessed and why; vendor-held in Sierra's platform (search: sierra.ai blog; getmacha.com, lorikeetcx.ai third-party).
- **Decagon**: "Watchtower" reviews every conversation against custom criteria; Agent Versioning; vendor-held; granular audit logs flagged as underdeveloped by third parties (search: decagon.ai/product/watchtower, eesel.ai).
- **Cognition Devin**: the proof object is the PR plus a vendor-held session; transcripts export only via a third-party browser extension (search: github wookat/devin-session-exporter; fast.io changelog).
- **Factory Droid**: Factory-side audit events for cloud features, **customer-owned OTEL telemetry** by default, opt-in message-content spans for session auditing — customer-held telemetry (search: docs.factory.ai/enterprise/compliance-audit-and-monitoring).
- **Paperclip** (81.2k stars): "issues" carrying work products, plus durable "activity" (mutations, cost events, approvals) "so operators can audit what happened and why"; self-hosted Postgres, no vendor account — customer-held (github.com/paperclipai/paperclip README, fetched).
- **Ruflo** (ruvnet): "trajectories" and "audit trail on both sides" of federation, stored in local AgentDB under `.claude/`/`.harness/`; HIPAA/SOC2/GDPR "compliance modes" — customer-held (github.com/ruvnet/ruflo README, fetched).
- **gstack** (Garry Tan, 133.9k stars): PRs from `/ship`, `/qa` bug reports with fix commits, before/after screenshots; "review receipts and egress logs" stored **hash-chained, tamper-evident** in `~/.gstack/security/`; test evidence "machine-local by design" — customer-held, and the only one in this list using the word "receipt" (github.com/garrytan/gstack README, fetched).

Pattern: the observability vendors and the CX-agent vendors hold the proof; the open-source operator tools (Paperclip, Ruflo, gstack) and Factory's telemetry leave it with the customer. Nobody in this list issues a signed, portable receipt a third party can verify; the closest are gstack's hash chain and the 2026 papers in §E.

## Provenance notes

- **Official pages read in full:** platform.claude.com pricing; github.com/{mem0ai/mem0,asg017/sqlite-vec,ruvnet/agentdb,nebius/token-factory-cookbook,paperclipai/paperclip,ruvnet/ruflo,garrytan/gstack}; blog.modelcontextprotocol.io 2026-07-28; npm registry (`npm view`); PyPI JSON API; Context7 for /vercel/ai, /websites/vercel_ai-gateway, /vercel/workflow, /supabase/supabase, /mem0ai/mem0, /websites/agentdb_ruv_io, /asg017/sqlite-vec; claude-api skill (Anthropic model table cached 2026-06-24, cross-checked against the live pricing page).
- **Official pages via Firecrawl snippet only (blocked for direct fetch):** nebius.com, docs.tokenfactory.nebius.com, ideas.nebius.com, openrouter.ai, openai.com/api/pricing, ai.google.dev, api-docs.deepseek.com, docs.together.ai, docs.fireworks.ai, console.groq.com, vercel.com/docs/workflows/pricing, artificialintelligenceact.eu, digital-strategy.ec.europa.eu, paulweiss.com.
- **Third-party mirrors (prices):** mastra.ai, requesty.ai, pricepertoken.com, typingmind.com, getmaxim.ai, llmgateway.io, morphllm.com, benchlm.ai, cloudzero.com, eesel.ai, aipricing.guru, computeprices.com. Nebius per-model prices rest entirely on these; treat every Nebius row as "re-check in the console on the day".
- **Search summaries only (no page read):** Nemotron Super/Ultra Nebius rows, Gemma 3 and Flux prices, DeepSeek output prices and peak/off-peak, Gemini cache-hit for Pro, A2A/AP2/x402 dates, Agent Plugins dates, C2PA 2.4 content, Sierra/Decagon/Devin/Factory descriptions, Humanloop/Galileo/Braintrust corporate events, ECB FX rate.
- **Corrections to appendix B:** AI SDK is at v7 (since 2026-06-25), not v6; `needsApproval` is now `toolApproval`; `usage` semantics changed; mem0 is 3.2.0 npm / 2.1.0 PyPI, not 2.0.7; AgentDB is 3.0.0-alpha.20; Workflow DK has hard per-run limits (10,000 steps, 50 MB, 25,000 events) and a data-written price; Nebius prompt caching is still absent and the batch discount is unquantified; MCP 2026-07-28 confirmed.

## C.3 Euros per month at three scales (chosen architecture, from section 1 of the plan)

Inference uses the worked examples above: brief €0.0029, constellation artifact €0.000513 (€0.0154 / 30), Flux image €0.0011 ($0.0013 × 0.8726, 2025 press figure, unverified today). Clips and tracks (Higgsfield, Suno) are per-provider and receipted as `spend` decisions; they are not in these rows. Platform list prices: Vercel Pro $20 per seat, Supabase Pro $25 per project, Railway two small services ≈ $10 (usage-based; estimate). EUR at 0.8726.

| Scale | Briefs | Artifacts | Images | Inference EUR | Platform EUR | Total EUR / month |
|---|---|---|---|---|---|---|
| One founder (local vault, one Vercel seat) | 20 × 0.0029 = 0.058 | 120 × 0.000513 = 0.062 | 20 × 0.0011 = 0.022 | **0.14** | Vercel 17.45 | **≈ 17.6** |
| One cohort of forty (shared room vault on Supabase, Railway daemons) | 800 × 0.0029 = 2.32 | 4,800 × 0.000513 = 2.46 | 800 × 0.0011 = 0.88 | **5.66** | Vercel 17.45 + Supabase 21.82 + Railway 8.73 = 48.0 | **≈ 53.7** |
| One thousand estates, client-hosted (each estate on its own accounts) | 200,000 × 0.0029 = 580 | 1,200,000 × 0.000513 = 616 | 200,000 × 0.0011 = 218 | **1,414** | paid by each client | **≈ 1,414 in inference, billed through the clients' keys** |
| One thousand estates, Starlight-hosted (for comparison only) | same | same | same | 1,414 | Supabase 1,000 × 21.82 = 21,820 + Vercel usage + Railway cluster | **≈ 23,300 plus usage** |

Comparison rows, same volumes, single closed model for every stage (no cascade):

| Scale | Claude Sonnet 5 (list) | Claude Haiku 4.5 (list) | Sonnet 5 with batch and 70% cache | Nebius cascade |
|---|---|---|---|---|
| One founder | 20 × 0.0628 + 120 × 0.01047 = **2.51** | 20 × 0.0314 + 120 × 0.00523 = **1.26** | 20 × 0.0193 + 120 × 0.0036 = **0.82** | **0.12** |
| One cohort | **100.5** | **50.3** | **32.7** | **4.78** |
| One thousand estates | **25,120** | **12,560** | **8,180** | **1,196** |

Reading: at every scale the platform line, not the inference line, is the cost that matters, and at estate scale the choice of who hosts is worth twenty times the inference. The cascade's advantage over a single closed model is 10× to 20× at list, 3× to 7× after that provider's cache and batch discounts, and zero against DeepSeek direct off-peak, which is not EU-hosted. Receipts replace every number in this table as they accumulate.

Built on SIP.
