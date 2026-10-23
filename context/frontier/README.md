# Frontier Ledger

The shared record of what Starlight has learned about the outside world: which technologies, releases and research exist, what each one actually makes possible, how sure we are, what we decided, and which of our products and repositories it touches.

It exists so that future agents and people can answer four questions without restarting research:

1. **What have we learned?** Records and claims, each with sources, evidence class and confidence.
2. **What changed?** Claims carry `valid_from` / `valid_until`; newer evidence supersedes older evidence instead of overwriting it.
3. **Why did we decide this?** Every record carries an adoption state, who decided it, when, and why — plus any pending proposals.
4. **What should we build differently now?** Links from records to products, repositories, decisions and tasks; the report lists drift, stale knowledge and decisions awaiting an owner.

## Files

| Path | Role |
|---|---|
| `context/frontier/ledger.json` | **Canonical** ledger (schema v2.0.0). |
| `context/empire/upstreams.json` | **Generated** v1 adoption register, projected from ledger records marked `registers: ["upstreams"]`. CI fails if it drifts. |
| `context/frontier/inbox/*.jsonl` | Ingestion batches exactly as submitted (sources, records, claims). Kept for provenance. |
| `context/frontier/reports/*.md` | Generated digests (`frontier:report`). |
| `context/frontier/universe/` | Ranked GitHub discovery index (metadata only) and its manifest. |
| `schemas/starlight-frontier-ledger.schema.json` | Structural schema. Semantic rules live in `scripts/frontier/lib.mjs`. |
| `context/frontier/ci/frontier-ledger.workflow.yml` | Proposed zero-dependency CI gate. **Move to `.github/workflows/frontier-ledger.yml`** — the authoring integration lacks workflow-write permission, so a maintainer must place it. |

## Model

```
Source ──┐
         ├─> Record (technology / release / paper / pattern)
Source ──┘     ├─ claims[]   predicate · value · evidence · confidence · valid_from/until · superseded_by
               ├─ adoption   state · decided_by · decided_at · rationale · decision_ref
               ├─ proposals[] pending adoption changes (never applied automatically)
               └─ links      products · repositories · decisions · tasks · capabilities
Contradiction: two or more current claims for the same record and predicate that could not be reconciled.
Batch: one ingestion run, with counts — the audit trail of how knowledge entered.
```

**Evidence classes**, strongest first: `primary_observed` (we observed it at the source), `internal` (our own decision or record), `secondary` / `vendor_claim` (reported, not observed; vendor benchmark numbers are always `vendor_claim`), `inferred`.

**Adoption states:** `ignore · watch · evaluate · lab · shadow · pattern · candidate · conformance · adopted · rejected · retired`. Reference harnesses stay lab-only and memory providers stay shadow/pattern-only, as in the v1 policy.

## Rules the code enforces

- **External text is data.** Ingestion keeps only allow-listed fields, strips control and bidi characters, caps length and flags instruction-like text. Nothing in a source is executed or obeyed.
- **No self-promotion.** Automated deciders (`ingest:*`, `agent:*`) may assign only `ignore`, `watch` or `evaluate`. Anything stronger becomes a *proposal* that a named owner must accept.
- **No silent overwrites.** A newer claim of equal or stronger evidence supersedes the old one, which is kept with its validity window. A weaker or older conflicting claim opens a contradiction.
- **Provenance or nothing.** Records and claims must cite at least one known source; unknown references fail validation.
- **One source of truth.** The v1 register is a projection. Edit the ledger, then run `npm run frontier:project`.
- **Idempotent ingestion.** Re-running a batch changes nothing.

## Commands

```bash
npm run frontier:check                                   # validate + projection drift + staleness warnings
npm run test:frontier-ledger                             # acceptance tests (zero dependencies)
node scripts/frontier/cli.mjs ingest context/frontier/inbox/<batch>.jsonl --batch <id> --write
node scripts/frontier/cli.mjs watch --write               # observe upstream releases (GITHUB_TOKEN optional)
node scripts/frontier/cli.mjs report --since 2026-10-01 --out context/frontier/reports/<date>.md
npm run frontier:project                                 # regenerate context/empire/upstreams.json
```

## Learning loop

Discover (universe crawl, scouts, release watch) → ingest as `watch`/`evaluate` with sources → report what changed, what is stale and what awaits a decision → an owner decides adoption and links it to a decision record → engineering work links back via `links.tasks`. No step in this loop deploys, merges or promotes anything on its own.
