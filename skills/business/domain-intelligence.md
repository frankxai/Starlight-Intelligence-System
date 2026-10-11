---
name: business/domain-intelligence
domain: business
description: Design and operate Web2/Web3 domain intelligence systems for domain discovery, valuation triage, agency-style expert swarms, portfolio strategy, marketplace listing, revenue routing, ENS/Web3 name verification, and human-gated domain trading workflows.
triggers:
  keywords: ["domain intelligence", "domain investing", "domain trading", "domain portfolio", "domain valuation", "domain appraisal", "domain agency", "domain naming", "buy domain", "sell domain", "lease domain", "ENS", "web3 domain", "domain marketplace"]
  agents: ["starlight-business", "starlight-architect", "starlight-orchestrator", "starlight-sentinel"]
  intents: ["domain-business", "domain-valuation", "portfolio-strategy", "web3-names", "marketplace-listing"]
priority: high
load_level: core
---

# Domain Intelligence

Use this skill when the work concerns domain names as business assets: finding names, ranking candidates, verifying Web2/Web3 ownership state, building domain portfolios, listing or leasing names, routing domains into revenue funnels, or building a domain trading operating system.

## Source Order

1. `C:\Users\frank\plugins\domain-intelligence-system\skills\domain-intelligence\SKILL.md` for the installable Codex workflow.
2. `C:\Users\frank\starlight\repos\frankx-domain-command\registry\domains.json` for current FrankX portfolio truth.
3. `C:\Users\frank\starlight\repos\frankx-domain-command\registry\domain-assets.json`, `domain-valuations.json`, `domain-revenue.json`, `domain-marketplaces.json`, and `web3-domain-assets.json` for private business state when present.
4. `C:\Users\frank\starlight\repos\frankx-domain-command\registry\domain-agency-swarm.json` for Portfolio Strategist, Name Miner, Brand Strategist, Web Designer, Copywriter, SEO/Demand, CRO/Analytics, Broker, Web3 Identity, IP/Risk, and Operator roles.
5. Live registrar/RDAP, DNS, marketplace, ENS, chain explorer, comparable-sales, and trademark evidence only when requested or available.

## Operating Rules

- Separate evidence from inference. Use `provider-verified`, `repo-evidenced`, `doc-evidenced`, or `needs-provider-verification`.
- Treat buys, renewals beyond routine ops, transfers, listings, delistings, repricing, wallet signatures, and marketplace actions as human-gated money moves.
- Do not recommend trademark collision, impersonation, typosquatting, celebrity names, or regulated claims.
- Do not promise profit. Return a thesis, evidence, risk, ask band, and next verification.
- Keep premium name lists, registrar evidence, wallet mapping, buyer conversations, and private revenue details out of public artifacts.

## Workflow

1. Define the mandate: target buyer, budget, holding period, TLDs, Web2/Web3 split, and route: flip, lease, build, redirect, or protect.
2. Route through the smallest agency expert set when quality matters: strategy, naming, brand, demand, web design, copy, CRO, broker, Web3, risk, and ledger.
3. Build candidate set with exact domain, TLD, acquisition cost, renewal cost, source, buyer thesis, and category.
4. Verify Web2 facts with registrar/RDAP/DNS evidence; verify Web3 facts with owner, resolver, expiry, wrapper, subname, and marketplace evidence.
5. Run scoring only as triage; then review comps, trademark/UDRP risk, liquidity, renewal costs, and buyer list.
6. Select route: buy gate, list/lease gate, build gate, redirect/alias gate, or pass.
7. Ledger the decision in the private command repo or SIS memory with privacy classification.

## Output Shape

Return: domain, lane, active agency roles, buyer thesis, evidence status, score or value class, risk gate, suggested ask band, monetization route, human approval needed, artifacts produced, and next verification.

---
**Built on SIP** - Starlight Intelligence Protocol
- Layers used: [skill-activation, file-contract, sovereignty, privacy-gating]
- Operational pair: domain-intelligence-system Codex plugin plus frankx-domain-command private ledgers
---
