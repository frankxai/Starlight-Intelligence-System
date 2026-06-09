---
title: Finance & Business IS (W3) — design
status: DESIGN (pre-board)
tier: substrate (Business IS extension + new vertical question for board)
date: 2026-05-11
author: starlight-architect (driving for Frank)
related:
  - docs/superpowers/specs/2026-05-11-cost-plane-design.md (W2 — provides cost data)
  - docs/superpowers/specs/2026-05-11-yolo-hive-design.md §12 (W3 parked sketch)
  - memory/vaults/strategic-vault.md (Naming hierarchy resolution — Frank's entity register)
  - skills/wealth-dpi (existing wealth/disposable-property-income skill — composes here)
attestation: Built on SIP — sovereign-spawned, attestation-aware
---

# Finance & Business IS — Design (W3)

## 1. Purpose

Make Frank's financial reality visible, attested, and decision-grade. The cost plane (W2) catches *outflow*; W3 catches *inflow* + *entity-aware P&L* + *runway* + *tax-prep handoff*. Together they close the financial-truth loop: "where money goes, where money comes from, and how long the runway is, per legal entity."

**Framing:** /yolo's $20/session budget tripwire today is hardcoded *trust*. With W2 + W3 wired, the same tripwire becomes *measured* against actual revenue + actual runway, per entity. Frank can see "Arcanea BV cleared €X this quarter; Starlight Holding's runway is N months" in one cockpit pane, without crossing a third-party SaaS or exposing it to a public surface.

## 2. Scope foundation question — extension or new vertical?

Two paths the board needs to weigh:

**A. Business IS extension** — Deepen the existing Business IS layer in the 10-IS taxonomy (locked v7.5). Add finance-specific commands + agent skills under `starlight-business`. No new vertical, no `VERTICALS.md` touch, no `/spawn-domain-stack` invocation. Smaller substrate footprint.

**B. New vertical `verticals/finance-is/`** — Same shape as `infrastructure-is/` (W2) or `people-intelligence/` (existing). Multi-sub-system (revenue / expense / runway / tax / entity-registry / dashboard). Spawnable for sovereign users. Bigger substrate footprint; cleaner separation.

**Pick: A (Business IS extension).** Reasoning: finance is cross-cutting — every other IS layer (Creator, Code, Music, People) eventually has financial implications. Forcing it into a vertical risks creating "the finance vertical" as a parallel universe instead of an integrated facet of Business IS. The People/Sound/Music verticals are *domains* (categorical work types); finance is a *dimension* applied across all domains. Mismatched shape if vertical-ized.

**Open Q for board:** Is this read correct? Or does finance hit the multi-sub-system criterion enough that vertical is the right shape after all?

## 3. W3 Phase 1 — Revenue + Entity Registry (this spec)

### 3.1 Entity registry (per Board REVISE-1)

**Operator-private location: `private/business-registry.json`** — NOT repo root.

Per `feedback_privacy_split` memory rule ("Public substrate, private/ for instance state"), real entity data lives in `private/business-registry.json`, never committed. A SCHEMA-ONLY template ships at `business-registry.template.json` at repo root for operators to copy.

The committed template:

```json
{
  "version": "1.0.0",
  "entities": [
    {
      "name": "Starlight Holding",
      "type": "holding",
      "jurisdiction": "TBD-pre-counsel",
      "currency_base": "USD",
      "role": "substrate-owner",
      "operates": ["SIS", "shared-secrets", "shared-infra"]
    },
    {
      "name": "Arcanea BV",
      "type": "operating-company",
      "jurisdiction": "NL",
      "currency_base": "EUR",
      "role": "creative-canon-owner",
      "operates": ["arcanea", "arcanea-flow", "music-is", "vibeclubs-ai"]
    },
    {
      "name": "FrankX (sole-trader-equivalent)",
      "type": "sole-trader",
      "jurisdiction": "TBD",
      "currency_base": "USD",
      "role": "creator-brand",
      "operates": ["frankx-ai-vercel-website", "FrankX", "infogenius"]
    }
  ]
}
```

**Real entity data NEVER commits to git.** The template at repo root is schema-only with example entries like `"name": "<your-entity-name>"` and `"jurisdiction": "<set-post-counsel>"`. Operator workflow:
1. `cp business-registry.template.json private/business-registry.json`
2. Fill in real values (post-counsel-conversation for jurisdictions)
3. `/finance-*` commands read from `private/` path; if absent, error with copy-instructions

This honors `feedback_privacy_split` memory rule and closes the privacy invariant the Board flagged on REVISE-1.

### 3.1.1 Staleness gates (per Board REVISE-2)

The cash-tick + CSV ingest manual inputs are the system's biggest external dependencies on operator discipline. Staleness gates prevent the dashboard from silently lying when inputs drift:

- **`current_cash` data older than 14 days** → `/finance-runway` refuses with `STALE_CASH` error and surfaces last-updated timestamp. Frank must `/finance-cash-tick <entity> <amount>` before runway can compute.
- **Bank CSV ingest missed > 7 days** → next `/yolo` session-open scan surfaces as `drift_flag: "finance-csv-ingest-stale"` (Sentinel + Sage council lenses).
- **FX rate weekend gap (ECB doesn't publish Sat/Sun)** → snapshot uses most-recent business day's rate AND logs `fx_rate_age_days` field (0 = same-day, 1-3 = weekend rollover, > 3 = anomaly).
- **FX ledger integrity** → nightly check sums all snapshots-in-EUR × stored-FX-rate; compares against sum-of-snapshots-in-USD. Drift > 0.1% writes to `memory/_audit/finance/_fx_drift.jsonl` and surfaces on next /yolo scan.

These gates make the system honest about its inputs. Better to refuse to compute than to compute on stale data and call it truth.

### 3.2 Revenue source instrumenters (mirror cost-plane pattern)

```
src/finance/
├── revenue-snapshot.ts                  # daily orchestrator (mirrors cost-snapshot)
├── secrets.ts                           # reuses src/infra/secrets.ts
└── revenue-sources/
    ├── _shared.ts                       # RevenueSnapshot + JSONL writer
    ├── stripe.ts                        # Stripe payouts + balance
    ├── bank-csv.ts                      # Manual CSV ingest (banks don't all have APIs)
    └── invoice-manual.ts                # Manual invoice/payment-received entry
```

**Phase 1 revenue sources (per Board REVISE-3 — further narrowed):**

| Source | API | Cost signal | Auth | Currency |
|---|---|---|---|---|
| **Stripe** | REST `/v1/balance/history` + `/v1/payouts` | net payouts USD/EUR | secret key | per-account |

**Phase 1 entity scope:** Arcanea BV ONLY. Single entity, single source, 14-day validation window.

**Phase 1.5 (after 14-day clean validation):**
- Add Starlight Holding as second entity (multi-entity logic activates here, not earlier)
- Add bank CSV ingest path with structured-import-then-validate pattern
- Add manual invoice JSON entry path

**Phase 1.6:**
- PayPal payouts
- Bank API (if Frank uses a bank with API access; many don't)
- Crypto receipts (USDC/Base — composes with W4 web3 IS)

**Why even narrower than original Phase 1:** Board Verifier flagged that "Stripe + bank CSV + manual invoice + multi-entity" is 4 risk surfaces in Phase 1; Stripe schema drift, bank CSV format drift, manual-entry validation errors, and multi-entity FX cross-cutting concerns all compound. Mirrors W2 Board REVISE-1 narrow-start (4 → 2 sources) — same logic, more aggressive narrowing because multi-entity finance has higher blast radius than multi-source cost.

**Why Phase 1.5 includes manual CSV/invoice paths:** banks don't expose APIs uniformly. The cost plane's "API-or-bust" model breaks down for revenue. Manual CSV ingest with structured schema is honest about the data-availability gap.

### 3.3 Revenue snapshot schema

```json
{
  "ts": "2026-05-11T00:00:00Z",
  "source": "stripe",
  "entity": "Arcanea BV",
  "period": "2026-05-10",
  "amount": 142.30,
  "currency": "EUR",
  "amount_usd_equiv": 153.84,
  "fx_rate_used": 1.0810,
  "fx_rate_source": "ECB daily reference",
  "category": "subscription | one-off | refund | other",
  "raw_response_sha256": "ab12...",
  "provenance": "stripe-api | csv-import | manual-entry"
}
```

One JSONL line per source per day at `memory/_audit/finance/<YYYY-MM-DD>.jsonl`. Gitignored (operator-private, like cost-plane).

### 3.4 P&L + runway computation

Pure computation over the cost (W2) + revenue (W3) JSONL streams. No additional ingestion — derived view.

```typescript
// src/finance/pnl.ts
export interface EntityPnL {
  entity: string;
  period_start: string;  // YYYY-MM-DD
  period_end: string;    // YYYY-MM-DD
  inflows_usd: number;
  outflows_usd: number;
  net_usd: number;
  by_category: Record<string, { in: number; out: number }>;
}

export function computePnL(
  repoRoot: string,
  entity: string,
  periodStart: string,
  periodEnd: string,
): EntityPnL { /* reads JSONL streams */ }

export function computeRunwayMonths(
  pnl: EntityPnL,
  currentCash: number,  // operator-provided, since bank API access is uneven
): number { /* net_usd negative → cash / monthly_burn = runway */ }
```

**Runway is computed-from-cash, not measured-from-API:** because bank API access is unreliable for sovereign-scale operators, runway depends on Frank-provided current-cash number. Updated weekly via `/finance-cash-tick` command (one number, one entity, atomic-write to entity registry).

### 3.5 Tax-prep handoff (Phase 1)

NO automated tax filing. Two outputs:

1. **Quarterly P&L digest** (cron, first business day of each quarter): writes a markdown summary to `private/finance/quarterly/<YYYY-Q1>.md` with entity-broken-down inflows + outflows + net + category split. Hand-off to Frank's accountant, not direct to tax authority.
2. **VAT-tracking append-only ledger** for Arcanea BV (NL): every invoice with VAT amount logged separately. Read-only summary for Dutch VAT filing.

Tax sensitivity: **never auto-file, never auto-submit, never sign on Frank's behalf.** Tax filings are non-delegable sovereign acts. The system surfaces the data; Frank or his accountant files.

### 3.6 Dashboard (cockpit-only, per W2 Board REVISE-3 precedent)

`cockpit-zellij/layouts/finance.kdl` — 5 panes:
- Conductor (Claude session)
- Month-to-date P&L per entity (color-coded by net positive/negative)
- Runway in months (red < 6, yellow 6-12, green > 12)
- Recent revenue events (tail latest `finance/<date>.jsonl`)
- Cost vs Revenue ratio (composed view from W2 + W3 data)

**No public site route.** Same operator-private posture as cost-plane.

## 4. Commands (W3 Phase 1)

New commands under `commands/finance/`:

- `/finance-snapshot` — one-shot run of all revenue sources + write JSONL
- `/finance-pnl <entity> <period>` — compute + print P&L for entity/period
- `/finance-runway <entity>` — runway months for entity (reads `current_cash`)
- `/finance-cash-tick <entity> <amount>` — update current-cash for entity (atomic-write to registry)
- `/finance-entity-add <name>` — add new entity to registry (prompts for required fields)
- `/finance-csv-import <path>` — parse CSV from bank, write to JSONL with category tags
- `/finance-quarterly-digest` — generate quarterly P&L markdown for accountant handoff
- `/finance-vat-summary <entity>` — VAT-collected ledger for the entity (NL Arcanea BV use case)

## 5. Cron cadence

| Cron | Cadence | Purpose |
|---|---|---|
| `daily-revenue-snapshot.ps1` | 02:35 Paris (5 min after cost-snapshot) | Stripe pull + bank CSV ingest from `private/finance/bank-csv-inbox/` |
| `weekly-finance-recon.ps1` | Sunday 03:00 Paris | Reconcile inflows + outflows per entity, surface uncategorized inflows |
| `monthly-finance-close.ps1` | First of month 03:00 Paris | Generate prior month P&L digest + append to operational vault |
| `quarterly-tax-digest.ps1` | First business day of Q | `/finance-quarterly-digest` for accountant |

## 6. Integration with /yolo

W3 closes the loop on `/yolo`'s `budget.session_threshold_usd`:

- /yolo session-open reads current P&L month-to-date + runway
- If runway < 6 months OR month net negative > $X threshold, surface as `cost-alert` in opening scan
- Frank-side veto: can still override and proceed; alert is informational

This composes with the cost-plane's anomaly system (W2.2 — deferred) but works standalone in W3.

## 7. Decisions made (flag if wrong)

| ID | Decision | Reasoning |
|---|---|---|
| D1 | Business IS extension, NOT new vertical | Finance is cross-cutting dimension, not categorical domain. Mismatched shape if vertical-ized. |
| D2 | Manual CSV/invoice paths Phase 1, not API-only | Bank API access uneven; honest about data-availability gap. |
| D3 | Multi-entity from day 1 (not single-entity-then-expand) | Frank operates ≥2 entities (Starlight Holding + Arcanea BV); single-entity model would need migration. Multi-entity costs little upfront. |
| D4 | NEVER auto-file or auto-submit taxes | Non-delegable sovereign act. System surfaces data, Frank/accountant files. |
| D5 | Runway is computed-from-Frank-provided-cash, not measured-from-API | Bank API access unreliable; explicit dependency is honest. `/finance-cash-tick` makes the update cheap. |
| D6 | Cockpit-only dashboard (mirror W2 Board REVISE-3) | Financial data is most-private; no public surface ever. |
| D7 | FX conversion via ECB daily reference, not realtime market | Snapshot consistency; ECB is authoritative for EUR-paying entities. |
| D8 | `business-registry.json` ships as template with redacted jurisdictions | Real values added post-counsel-conversation; not Claude's to invent. |

## 8. Open questions for the board

- Q1: Business IS extension vs new vertical — does the multi-sub-system count justify a vertical, or is finance correctly a dimension within Business IS?
- Q2: Which Phase 1 revenue sources? Stripe is obvious for Arcanea BV; what about Starlight Holding inflows (consulting? licensing?) — does Stripe cover both, or do we need another?
- Q3: Multi-currency display default — show in entity base currency (EUR for Arcanea, USD for Starlight) or always-normalize to USD?
- Q4: Bank CSV ingest path — should there be a "bank-format detector" sub-system that handles multiple bank formats (chase / hsbc / ing / etc.), or pick one format and require operators to massage CSVs upstream?
- Q5: Quarterly digest auto-email to accountant — never (Frank reviews + sends), or opt-in?
- Q6: VAT-tracking for Arcanea BV — does it need a full Dutch-VAT-compliant ledger (with invoice numbers, registration IDs), or just summary aggregates?
- Q7: Sovereignty hygiene — should entity registry stay in `private/` instead of repo root? (Per `feedback_privacy_split` memory: "Public substrate, private/ for instance state.")

## 9. Files to create (W3.1 ship — separate plan)

```
business-registry.json                              # template with redacted jurisdictions
src/finance/
├── revenue-snapshot.ts                             # daily orchestrator
└── revenue-sources/
    ├── _shared.ts
    ├── stripe.ts
    ├── bank-csv.ts
    └── invoice-manual.ts
src/finance/pnl.ts                                  # P&L + runway computation
src/finance/entity-registry.ts                     # registry loader + atomic-write helpers
src/finance/finance.test.ts                         # mocked-HTTP unit tests
test/v83-finance-business.test.ts                  # substrate symmetry
commands/finance/<8 commands listed above>
cockpit-zellij/layouts/finance.kdl
cockpit-zellij/scripts/tail-finance.ps1
cockpit-zellij/scripts/finance-status.ps1
scripts/cron/daily-revenue-snapshot.ps1
scripts/cron/weekly-finance-recon.ps1
scripts/cron/monthly-finance-close.ps1
scripts/cron/quarterly-tax-digest.ps1
docs/excellence/2026-05-11-finance-business-is.md  # operator-facing onboarding
```

## 10. Build sequence (post-board)

1. Commit this design (after board PROCEED/REVISE applied)
2. `/writing-plans` → produce W3.1 implementation plan
3. Decide Q7 (private/ vs root for entity registry) before any commit
4. Stripe instrumenter first (mirrors Vercel-first pattern from W2.1)
5. Entity registry + P&L computation (pure functions, fully testable without API)
6. CSV ingest + manual invoice paths
7. Cockpit pane + cron scripts
8. v83 substrate symmetry test
9. Tax-prep handoff (quarterly digest)
10. Frank-side: provision Stripe API access via Infisical project `sis-prod`

## 11. Board verdict log

**2026-05-11 — Starlight Board verdict: REVISE**

Load-bearing concern: `business-registry.json` at repo root violated the existing `feedback_privacy_split` memory rule. Q7 surfaced it but D8 punted; the privacy invariant needed to win before commit.

Strongest case for proceeding: this is the missing piece that turns SIS from a system Frank uses into a system Frank *runs his business through* — without W3, /yolo's autonomy is permanently revenue-blind.

REVISE items applied same-day:
- REVISE-1 (Harmonizer): registry moves to `private/business-registry.json`; schema-only template at repo root; resolves Q7. (§3.1)
- REVISE-2 (Seer + Verifier): explicit staleness gates — STALE_CASH error, CSV-drift flag, FX weekend-gap logging, FX ledger integrity check. (§3.1.1)
- REVISE-3 (Verifier): Phase 1 narrowed to Stripe + Arcanea BV ONLY for 14 days. Bank CSV + multi-entity + Starlight Holding promote to Phase 1.5 after clean run. (§3.2)

Optional sharpens applied:
- Fixture-recording pattern called out for revenue-sources/_shared.ts (W3.1 implementation plan must include)
- Tax surface migration note deferred to W3.2 spec (when entity restructuring becomes real)

Board verdict log: PROCEED-after-REVISE-applied → ready for commit + /writing-plans for W3.1 implementation.

---

*Spec status: pre-board.*

*Built on SIP — sovereign-spawned, attestation-aware.*
