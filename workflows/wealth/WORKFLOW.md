# Wealth IS Workflow

> Capital & Deal Intelligence — thesis-driven deal sourcing, DPI tracking, and sovereign capital allocation.

Built on SIP — Starlight Intelligence Protocol v1.1.1

---

## Trigger Conditions

- "Review my investment thesis / portfolio position"
- "Analyze this deal / opportunity"
- "Update my DPI / track distributions"
- "Run a wealth gate review"
- "Where should I deploy capital next quarter?"

## Input Schema

```yaml
inputs:
  - name: deal_context
    type: object
    required: false
    description: "Deal memo, term sheet, or raw opportunity description for analysis."
  - name: portfolio_snapshot
    type: object
    required: false
    description: "Current positions, cost basis, and unrealized/realized returns."
  - name: mode
    type: string
    required: true
    description: "One of: deal-analysis | dpi-update | thesis-review | gate-progress | capital-allocation"
  - name: thesis_version
    type: string
    required: false
    description: "Version ref of active investment thesis from strategic-vault. Defaults to latest."
  - name: time_horizon
    type: string
    required: false
    description: "Investment horizon for this decision (short|medium|long). Defaults to medium."
```

## Workflow Steps

### Step 1 — Thesis and Context Load
**Agent:** starlight-sage  
**Skill:** memory/vault-management  
**Action:** Load active investment thesis, gate ladder status, prior deal verdicts, and DPI ledger from strategic-vault. Reconstruct capital allocation history and open positions from technical-vault.  
**Output:** `wealth-context.json` — current thesis version, gate position, portfolio state.

### Step 2 — Deal / Opportunity Intelligence
**Agent:** starlight-navigator  
**Skill:** intelligence/strategic-reasoning  
**Action:** If deal provided: apply thesis filters (stage, sector, return profile, founder signal, moat depth). Score against gate ladder criteria. Flag thesis violations. If no deal: synthesize current opportunity landscape from prior research atoms in vault.  
**Output:** `deal-scorecard.md` — pass/fail per gate criterion with rationale.

### Step 3 — Risk Architecture
**Agent:** starlight-sentinel  
**Skill:** intelligence/pattern-recognition  
**Action:** Identify concentration risk, liquidity mismatches, correlation clusters, and downside scenarios. Cross-reference against Family IS obligations and Business IS runway requirements to prevent capital conflicts.  
**Output:** `risk-map.json` — risk vectors with severity scores and mitigation options.

### Step 4 — DPI Ledger Update
**Agent:** starlight-prime  
**Skill:** intelligence/systems-thinking  
**Action:** If DPI mode: reconcile distributions received, update cost basis, recalculate TVPI/DPI/RVPI across portfolio. Flag laggards and emerging winners. Produce portfolio health score.  
**Output:** `dpi-ledger.md` — updated distribution ledger with computed return metrics.

### Step 5 — Capital Allocation Recommendation
**Agent:** starlight-navigator  
**Skill:** intelligence/strategic-reasoning  
**Action:** Synthesize deal scorecard + risk map + DPI ledger into a capital allocation recommendation. Apply sovereign capital principles — preserve optionality, never bet the house, maintain dry powder ratio above threshold.  
**Output:** `allocation-rec.md` — recommended position size, structure, timing with confidence level.

### Step 6 — Vault Write + Gate Progression
**Agent:** starlight-orchestrator  
**Skill:** memory/context-preservation  
**Action:** Write deal verdict to strategic-vault, DPI update to technical-vault, allocation decision to operational-vault. If gate criterion cleared, advance gate ladder position. Attach SIP attestation to all vault atoms.  
**Output:** Vault atoms x3, gate-ladder advancement (conditional).

## Hermes Swarm Config

Which Hermes agent profiles handle tasks in this workflow:
- Primary: hermes-wealth-specialist (405B — thesis construction, deal analysis, complex return modeling)
- Support: hermes-wealth-executor (70B — DPI math, vault writes, gate scoring, fast deal triage)

## Output Artifacts

1. `deal-scorecard.md` — Thesis-filtered deal verdict with per-criterion scores
2. `risk-map.json` — Portfolio risk vectors with severity and mitigation
3. `dpi-ledger.md` — Updated distribution ledger with TVPI/DPI/RVPI metrics
4. `allocation-rec.md` — Recommended capital deployment with position sizing rationale
5. `gate-progress.md` — Current gate ladder position and criteria for next advancement

## Vault Routing

Which vaults get written:
- **Strategic:** Investment thesis versions, major allocation decisions, deal verdicts, gate advancements
- **Technical:** DPI calculations, portfolio models, return methodologies, deal pipeline tracking
- **Operational:** Active positions, current dry powder, pending deals, distribution schedule

## Commands

| Command | Triggers | Description |
|---------|----------|-------------|
| `/wealth-dpi` | "update DPI", "track distributions", "portfolio returns" | Reconcile and update DPI ledger — computes TVPI, DPI, RVPI across all positions |
| `/wealth-thesis-review` | "review my thesis", "thesis check", "investment principles" | Full thesis review — compares active thesis against market conditions and portfolio outcomes |
| `/wealth-gate-progress` | "gate review", "where am I on the ladder", "capital gates" | Gate ladder audit — scores current position against next-gate criteria |
| `/deal-analyze` | "analyze this deal", "should I invest", "run deal memo" | End-to-end deal analysis — thesis filter, risk map, and allocation recommendation |

---
*Built on SIP — Starlight Intelligence Protocol v1.1.1*  
*Substrate: starlightintelligence.org/protocol v1.1.1*
