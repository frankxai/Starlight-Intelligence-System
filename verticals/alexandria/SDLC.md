# SDLC — Starlight Alexandria

> Experiment-first delivery. The unit of work is an experiment with a falsifier; the unit of proof is a receipt; the unit of release is a signed receipt someone else can re-check.

---

## The loop

```
 need ─▶ catalogue ─▶ experiment ─▶ receipt ─▶ eval ─▶ canary ─▶ production ─▶ ledger ─▶ (next need)
         (Library)     (Forge)     (Router)   (Forge)  (Exchange)  (Exchange)   (Receipts)
```

| Stage | Entry criterion | Exit artifact | Gate |
|---|---|---|---|
| **Need** | A House names a need in one sentence with the entity type (wallet, company, paper, series, creator) | Need line in the House's daily log | none |
| **Catalogue** | `alexandria_plan` returns a recommended capability inside budget, or a provider PR adds one | Plan with price | Catalogue validator (`validateCatalog`) must pass; prices reconciled against `catalogueVersion` |
| **Experiment** | Need recurs or a revenue claim depends on it | Entry in `experiments/registry.json` with metric, falsifier, budget, close date | `validateRegistry`; one metric only |
| **Receipt** | Experiment is `running` | Receipt ids in the ledger | Router budget gate; errors never billed |
| **Eval** | ≥ 1 receipt | Verdict `proven` / `falsified` with receipt ids | `transition()` refuses verdicts without receipts |
| **Canary** | Proven, customer-facing | One paying or pilot reader on the artifact for a bounded window | Design verifier for anything visual; `estate-guard` for anything with an API route; editorial gate (`CREATOR.md`) for copy |
| **Production** | Canary metric met | Listed on Exchange, signed receipts, Polar product | Board (`/starlight-board`) if a substrate file changes; otherwise `/superintelligence` operational tier |
| **Ledger** | Always | Append-only receipts; `MEMORY.md` changelog; vault write | Never rewritten |

---

## Gates that are not optional

1. **Price before run.** Any code path that reaches a transport without passing `Library.estimate` and the budget check is a bug, not a shortcut.
2. **Receipt before claim.** Public copy that states a number or a fact about a third party cites a receipt id or a `METRICS_TRUTH` entry.
3. **Falsifier before build.** No House ships a command or an endpoint whose experiment lacks a falsifier sentence that names the fallback.
4. **Human before money, publish, keys.** FrankX hard stops. Agents draft and verify; Frank deploys, posts, sends, approves.
5. **Scan before merge** for MCP configs, hooks, API routes: `node .claude/ci/estate-guard-scan.mjs --root .`.

---

## Tests as the contract

| Test | What it proves |
|---|---|
| `test/v93-alexandria.test.ts` | 7-file + catalogue + registry presence; validator rejects malformed entries; routing determinism; price-before-run; budget fail-closed; receipt hash stability; earned attestation; Forge status machine; MCP tool list and argument rejection |
| `test/v79-vertical-coverage.test.ts` | `alexandria` is a declared-live domain sub-stack with the 7-file contract |
| `npm run lint` (`tsc --noEmit`) | strict TypeScript across `src/alexandria/` |

`node --import tsx --test test/v93-alexandria.test.ts` runs the first. `npm run test:operational` includes it.

---

## Release cadence

- **Daily (Forge pulse):** `alexandria_experiments` — overdue first. An overdue experiment is closed (`falsified`, `parked`) or re-dated with a reason the same day.
- **Weekly (Synthesis):** one receipted brief per active product line. Receipt ids in the brief footer.
- **Monthly (Library):** reconcile `providers.json` against Firecrawl's `catalogueVersion`; bump `reconciledAt`; prices that moved get a changelog line.
- **Quarterly (Treasury):** partnership and allocator pipeline review against `CAPITAL.md` falsifiers.

---

## Versioning

- Catalogue: `providers.json.version` semver; additive = minor, price change = patch with changelog, removed provider = major.
- Vertical: `alexandria@vX.Y` in `MEMORY.md`; the attestation block cites it.
- SIP: unchanged by this vertical. If receipts need a new layer, that is a SIP minor bump through `/starlight-board`, not a local edit.

---

**Built on SIP** · `alexandria@v0.1` · SIP v1.1.1
