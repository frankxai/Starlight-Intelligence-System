# SWARM — Starlight Alexandria

> How the Houses run as a swarm across Claude managed agents, OpenAI Agents, Gemini and OpenRouter, with one budget gate and one receipt ledger.

---

## Runtime table

| Work | Runtime | Why | Fallback |
|---|---|---|---|
| Synthesis briefs, long-horizon research, receipts-aware tool use | **Claude managed agents** (Anthropic) | Best tool discipline over many steps; server-side sessions persist the budget object | Claude Code local session |
| Structured extraction, second-opinion verification of a brief's claims against its receipts | **OpenAI Agents / Responses** with Structured Outputs | Independent judge; schema-enforced output | Claude with JSON schema |
| Long-context corpus passes (Scribe), multimodal reads of filings and charts | **Gemini** | Context window and native grounding | Chunked Claude pass |
| Volume classification, tagging, routing A/B | **OpenRouter** (machine-global default) | Cost and model choice inside experiments | Haiku |
| Deterministic routing, pricing, receipts | **No model** (`src/alexandria/`) | Auditability | none |

Rule: the runtime that *writes* a claim never *judges* it. Synthesis (Claude) writes; Verification (OpenAI) checks claims against receipt hashes; Gemini reads what neither can hold in context.

---

## Topology

Hierarchical, Queen-led (per `core/ORCHESTRATION_ENGINE.md` and the `starlight-queen` pattern). The Queen is the Synthesis House agent for the active product line; Houses are workers with append-only ledger access; only the Queen calls `alexandria_execute` for paid capabilities. Workers call free capabilities (native, `creditsCost: 0`) directly.

```
Queen (Synthesis)            budget owner; calls paid capabilities; signs the brief
 ├─ Library worker           alexandria_find / alexandria_plan (free)
 ├─ Scribe worker            native corpus reads; snapshot materialisation
 ├─ Verifier (OpenAI)        re-derives claims from receipts; emits pass/fail per claim
 ├─ Forge worker             updates experiment status with receipt ids
 └─ Exchange worker          prepares the Polar product / endpoint listing (never publishes)
```

Max concurrency per session: 6 workers (ACOS circuit-breaker and memory-guardian limits apply). Budget per session defaults to 200 credits; the Queen raises it only with an experiment id.

---

## Worked flow — Monday whale brief (Crypto IS composition)

Prices below are the catalogue's per-call credits on `reconciledAt`; derived, not estimated.

| Step | Capability | Credits | Output |
|---|---|---|---|
| 1 | `gmgn-ai/crypto/wallet_rank` (chain: sol) | 5 | top wallets |
| 2 | `gmgn-ai/crypto/wallet_profile` × 8 | 40 | PnL, holdings, tags per wallet |
| 3 | `gmgn-ai/crypto/trending_tokens` | 5 | what they are rotating into |
| 4 | `defillama-com/crypto/stablecoin_chains` | 5 | liquidity context |
| 5 | `fiscal-ai/ownership/institutional-holders` (one listed proxy) | 15 | traditional allocator read |
| 6 | `sis-vaults/search` ("whale brief last week") | 0 | continuity |
| 7 | Verifier pass over the draft: every number → receipt id | 0 credits (model cost only) | pass/fail table |
| | **Total** | **70** | brief + 13 receipts |

The brief ships with the receipt ids in the footer and the earned SIP block (`sipLayers: [attestation]`). Falsifier for the format lives in `exp-2026-10-08-whale-brief-receipts`.

---

## Worked flow — frontier research digest (Creator IS composition)

| Step | Capability | Credits |
|---|---|---|
| 1 | `firecrawl-research-index/search` (question) | 0 |
| 2 | `firecrawl-research-index/related` (seed) | 0 |
| 3 | `arxiv-org/papers/list_category` (cs.AI, today) | 5 |
| 4 | `semanticscholar-org/papers/get_citations` × 3 | 15 |
| 5 | `sis-research/list` (prior extracts) | 0 |
| 6 | Scribe (Gemini) reads abstracts; Synthesis writes; Verifier checks | — |
| 7 | `/creator-pipeline` → short script + thread + newsletter section, receipts attached | — |
| | **Total** | **20** |

---

## Tests and experiments as swarm citizens

- Every worker's output that will be reused is a receipt or an experiment update, never free text in chat.
- `exp-2026-10-08-generation-lane-bakeoff` is the template for any model or lane bakeoff: fixed brief, three lanes, design-verifier judge, first-render pass count.
- Flaky provider calls are receipted with `error` and never billed; the Forge counts them as evidence about the provider, not noise.

---

## Human gates inside the swarm

| Action | Who | Mechanism |
|---|---|---|
| Raise session budget above 200 credits | Frank | experiment id required |
| Publish a brief externally | Frank | Postiz draft, never auto-post |
| Resell a receipt on the Exchange | Frank | signed receipt + Polar product |
| Any money movement | Frank | no tool exists; payment-intelligence-system verifies mandates only |
| Add a provider with required attribution | Frank | catalogue PR with the attribution string |

---

**Built on SIP** · `alexandria@v0.1` · SIP v1.1.1
