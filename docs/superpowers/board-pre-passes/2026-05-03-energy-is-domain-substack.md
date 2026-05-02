# Board pre-pass — Energy IS as 4th reference Domain Sub-Stack

> **Source:** `.intake/processed/2026-05-03/2 Chatgpt 02.05 - Copy.txt` (extracted from rejected 9-domain taxonomy)
> **Tier:** Substrate (adds a Domain Sub-Stack)
> **Status:** AWAITING `/starlight-board` ratification

---

## Proposal

Spawn an **Energy IS** (Energy Intelligence System) as the 4th reference Domain Sub-Stack alongside People IS, Sound IS, and Music IS.

The 6-7 sub-system shape:

| Sub-system | Purpose | Primary command (proposed) |
|---|---|---|
| **Sizing** | PV array sizing, battery capacity, inverter selection given household / business profile | `/energy-sizing` |
| **Cost** | CapEx, OpEx, payback, NPV, IRR — all deterministic via Calculator pattern | `/energy-cost` |
| **Installer** | Installer-project-brief generation, certified-installer routing, site-survey scheduling | `/energy-installer-brief` |
| **Operations** | Day-to-day yield, monitoring, fault detection, predictive maintenance | `/energy-ops` |
| **Buyer** | Buyer-side clarity (homeowner / SMB / community) — what to ask, what to refuse, what to verify | `/energy-buyer` |
| **Grid** | Grid-operator confirmations, feed-in tariffs, regulatory compliance per region | `/energy-grid` |
| **Recovery** *(optional)* | Storm / grid-failure / battery-fault recovery protocols | `/energy-recovery` |

## Why this is substrate

It adds a `verticals/energy-intelligence/` to the repo with the standard 7-file contract (README · SUB-SYSTEMS · AGENTS · SOUL · STACK · CANON · MEMORY) plus QUICK-START. That's a structural addition — every adopter of the SIS substrate gets it as a reference.

## Why this needs `/starlight-board`

Adding a Domain Sub-Stack is structural. Sets a precedent for how future sub-stacks compose, what the agent layer looks like, what attestation discipline applies. The 4th vertical defines the pattern's plurality (3 was reference; 4+ is generalizable shape).

## Coupling to the Calculator + ValidationRequirement substrate addition

Energy IS would be the **first** Domain Sub-Stack to natively use the Calculator + ValidationRequirement pattern proposed in the sibling pre-pass (`2026-05-03-calculator-validation-substrate.md`). The two proposals compose:

- If both PROCEED → Energy IS uses calculators throughout, validation requirements are enforced, PV-Lager pilot becomes the operator-tier instantiation.
- If Calculator/Validation STOPS → Energy IS still ships, but uses LLM-prose for numerical claims (worse outcome, weaker defensibility).
- If Calculator/Validation PROCEEDS but Energy IS STOPS → the pattern lands in some other infra domain (Home IS, Compute IS).

## What ships if PROCEED

1. **`verticals/energy-intelligence/`** — full 7-file contract scaffolded
2. **6-7 agents** at `agents/starlight-energy-{sizing,cost,installer,operations,buyer,grid,recovery}.md`
3. **20-30 commands** at `.claude/commands/energy-*.md`
4. **`/spawn-domain-stack`** updated to reference Energy IS as a 4th example
5. **`docs/ARCHITECTURE.md`** updated to list Energy IS in the Domain Sub-Stack Tier
6. **`docs/forking-domain-stacks.md`** updated with Energy IS as the canonical "infra-touching domain" example

## What stays in `private/`

- **PV-Lager-specific configuration** — Frank's brother's installer business is a sovereign instance, not the public reference. Lives in `private/verticals/pv-lager/` per privacy framework.
- **Frank-family customer lists, supplier contracts, pricing tables** — never in public substrate.

## Pre-pass questions for the board

1. **Sovereign vector** — Is "Energy" the right name? Or is it "Infrastructure" / "PowerOps" / "ClimateOps"? Naming is irreversible at scale.
2. **Seer vector** — Energy intersects with regulatory / certification / liability in ways People / Sound / Music IS do not. Is the substrate ready to carry that responsibility, or does it expose us?
3. **Harmonizer vector** — PV-Lager (Frank's brother's business) has its own constraints. Does forcing his instantiation through a public reference vertical create friction? Or does the sovereign-instance-in-private/ pattern (already established) handle it?
4. **Strategist vector** — Energy IS could be the first commercial wedge for Tier-1 sprint clients (small installers needing AI). What does it unlock that People / Sound / Music IS doesn't?
5. **Verifier vector** — Without the Calculator/Validation substrate addition, Energy IS would be a reference vertical that ships LLM-prose for numerical claims. That's a worse product than what we have. Can we afford to ship Energy IS without the calculator pattern landing first?

## Recommendation (Claude's pre-pass synthesis)

**Likely PROCEED-WITH-REVISE** — gate Energy IS on Calculator/Validation substrate landing first. Sequencing:

1. Board ratifies Calculator/Validation pattern
2. Calculator/Validation substrate ships (~2-3 weeks)
3. Board ratifies Energy IS proposal (separate session)
4. Energy IS ships using the new pattern (~3-4 weeks)
5. PV-Lager pilot in `private/` instantiates Energy IS as the reference (~ongoing)

If Calculator/Validation STOPS, this proposal also STOPS — Energy IS without that substrate is a worse product than not shipping.

---

**Built on SIP** · Starlight Intelligence Protocol v1.1.0
- Layers used: [file-contract, attestation, sovereignty]
- Pre-pass packet drafted: 2026-05-03
- Coupling: depends on `2026-05-03-calculator-validation-substrate.md`
- Board verdict: AWAITING — ready for `/starlight-board "Energy IS as 4th Domain Sub-Stack"`
