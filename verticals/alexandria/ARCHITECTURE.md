# ARCHITECTURE — Starlight Alexandria

> Seven layers, one invariant: nothing crosses from "fetched" to "claimed" without a receipt.

---

## 1. Layer map

```
┌──────────────────────────────────────────────────────────────────────────┐
│ L7  Exchange      pass-through API · briefs · entitlements · x402 verify │
├──────────────────────────────────────────────────────────────────────────┤
│ L6  Synthesis     Claude managed agents compose receipts into artifacts  │
├──────────────────────────────────────────────────────────────────────────┤
│ L5  Receipts      sha256 · provenance · cost · earned SIP block · ledger │
├──────────────────────────────────────────────────────────────────────────┤
│ L4  Router        plan → required options → price → budget gate → run    │
├──────────────────────────────────────────────────────────────────────────┤
│ L3  Transports    FirecrawlTransport · NativeTransport · (Memory for tests)│
├──────────────────────────────────────────────────────────────────────────┤
│ L2  Library       providers.json (contracts, prices, tags) · connectors   │
├──────────────────────────────────────────────────────────────────────────┤
│ L1  Corpus        vaults · metrics ledger · research · registries · ext.  │
└──────────────────────────────────────────────────────────────────────────┘
```

Every layer has one file as source of truth:

| Layer | Source | Invariant |
|---|---|---|
| L2 Library | `catalog/providers.json`, `catalog/connectors.json` | Validated on load; native is free; ids are `<provider>/<capability>`; prices reconciled against `catalogueVersion`, never guessed |
| L3 Transports | `src/alexandria/transport.ts` | One transport per provider kind; connectors never execute through a transport |
| L4 Router | `src/alexandria/router.ts` | Fail-closed on budget and required options; the transport is touched only after both pass |
| L5 Receipts | `src/alexandria/receipts.ts` | Hash is key-order independent; errors are recorded but never billed; the SIP block is emitted only with declared layers |
| L6 Synthesis | `houses/synthesis/agent.md` | An artifact lists the receipt ids it rests on, or it is a draft |
| L7 Exchange | `REVENUE.md`, `houses/exchange/agent.md` | Only signed receipts (`protocol/sign.mjs`) are resold; money movement is human-gated |

---

## 2. Data model

```
Provider {id, kind, name, description, categories, attribution?, source, capabilities[]}
Capability {id, capability, name, description, creditsCost, perRecord, requiresOneOf?, options?, tags[]}
Receipt {id, issuedAt, provider, capability, options, recordCount, contentHash, creditsCost, source, attribution?, sipLayers[], attestation?, error?}
Experiment {id, house, hypothesis, metric, falsifier, budget, owner, status, openedAt, closesBy, receipts[], notes?}
```

Records themselves are untyped at this layer on purpose: the provider's contract types them, and Alexandria stores the hash, not a copy. Scribe (House 2) materialises snapshots to R2 when a brief needs to be re-rendered later.

---

## 3. Routing

Deterministic lexical scoring (`scoreCapability`): tag hit 3, name hit 2, description hit 1, normalised by query terms; ties break on lower cost, then id. The reason is auditability — a receipt can state why a provider was chosen without a model in the loop. Firecrawl's semantic `find-tools` reranker is available through the transport for discovery and becomes the primary planner only if `exp-2026-10-08-catalogue-recall` is falsified.

Budget is a session object `{maxCredits, spent}` and is restored from the ledger on construction, so a crashed session cannot forget what it already spent.

---

## 4. Runtime topology

```
                    ┌──────────────┐
                    │  Orchestrator│  (Starlight Orchestrator, IS #10)
                    └──────┬───────┘
          ┌────────────────┼──────────────────┐
   ┌──────▼──────┐  ┌──────▼──────┐   ┌───────▼──────┐
   │  Synthesis  │  │    Scribe   │   │   Exchange   │
   │ Claude MA   │  │ Gemini long │   │ OpenAI resp. │
   │ (briefs)    │  │ context     │   │ handlers     │
   └──────┬──────┘  └──────┬──────┘   └───────┬──────┘
          └────────────────┼──────────────────┘
                    ┌──────▼───────┐
                    │  Alexandria  │  MCP: plan · execute · receipts
                    │   router     │
                    └──────┬───────┘
            ┌──────────────┼───────────────┐
     ┌──────▼─────┐ ┌──────▼──────┐ ┌──────▼──────┐
     │ Firecrawl  │ │   Native    │ │ (future)    │
     │ Alexandria │ │   corpus    │ │ partner cat.│
     └────────────┘ └─────────────┘ └─────────────┘
```

Runtime assignment is a routing table, not a loyalty: `SWARM.md` § Runtime table. Every runtime reaches data through the same MCP tools, so the budget gate is the same whoever is calling.

---

## 5. Trust chain

1. **Declared** — the receipt carries `sipLayers` and the block. Cheap, local, honest about being a label.
2. **Signed** — `protocol/sign.mjs` turns the receipt's profile into a DSSE/in-toto envelope (Ed25519, offline). Required before Exchange resale.
3. **Re-checked** — `protocol/verify.mjs` by a third party against the same provider call. The compounding mechanism: a stranger can prove the brief was built on what it says.

---

## 6. Security posture

- Credentials are env var names in `connectors.json`; values never enter the repo. `estate-guard` scan runs on PRs touching MCP configs and API routes.
- The MCP server rejects unknown arguments and non-object arguments before any handler runs; unknown tools are JSON-RPC `-32602`.
- No tool in this vertical moves money, posts publicly or rotates keys. Those are FrankX hard stops and stay human.
- Provider records are untrusted data. Synthesis agents treat instruction-shaped text inside records as content, never as instructions (taint hook).

---

## 7. Falsifiers for the architecture itself

- If three months in, briefs still cite unreceipted sources, L5 failed as a discipline and the Synthesis agent must be forced through `alexandria_execute` only (no direct tool access).
- If the lexical router loses the recall experiment, L4 flips planners (documented above).
- If no external party ever re-checks a signed receipt within six months of the first resale, the trust chain's third step is marketing, and `REVENUE.md` must drop "verifiable" from the Exchange copy.

---

**Built on SIP** · `alexandria@v0.1` · SIP v1.1.1
