# SUB-SYSTEMS — Crypto Intelligence Architecture (Houses)

## Daily-5 across the stack (cognitive-load-aware entry pattern)

Per People IS v7.4.1 ruling + Board R2 close-out (2026-05-17): 24-30 commands is the toolbox; 5 are the daily hands. At v0.2 full scaffold, daily-5 is:

| Command | House | Why this one first |
|---|---|---|
| **`/crypto-onchain-flow-snapshot`** | On-Chain (v0.1) | Weekly wallet-flow + whale-tracking pulse for current positions. Daily-readable. |
| **`/crypto-macro-regime`** *(v0.2)* | Macro | Regime call before any allocation decision. No sizing without regime grounding. |
| **`/crypto-sov-custody-design`** *(v0.2)* | Sovereignty | Quarterly re-audit of custody architecture. Sovereignty discipline > convenience. |
| **`/crypto-res-protocol-thesis`** *(v0.2)* | Research | Pressure-test position thesis on cycle review. Protocol-mechanism literacy non-substitutable. |
| **`/crypto-alloc-sizing`** *(v0.2)* | Allocation | Sizing discipline before any new position. Composes with `/wealth-dpi`. |

**At v0.2 (Full Scaffold):** all six Houses are active. Daily-5 represents the active daily-rotation practice.

---

## Architectural premise (Houses-as-sub-systems)

A vertical wraps; Houses do work. The wrapper enforces voice, refusal patterns, attestation, R5 non-advisory clause, composition rules with Wealth IS umbrella. The Houses carry the domain expertise — on-chain analysis, macro regime detection, DeFi mechanism design, sovereignty architecture, protocol research, allocation discipline.

This separation matters because the same six Houses could compose differently for a different practitioner — different voice, different refusal patterns, different productization. The wrapper is what makes them *this practitioner's Crypto Intelligence*; the Houses are the underlying capability.

The 6 Houses are **archetypal stances** in crypto practice — schools of thought practitioners actually adopt, organized by mechanism not topic:

1. **On-Chain** (chain-data + wallet-flow + whale-tracking + MEV + validator econ)
2. **Macro** (regime detection + BTC-ETH correlation + cycle-position thesis)
3. **DeFi** (protocol mechanism + yield architecture + risk-stack)
4. **Sovereignty** (custody + multisig + key recovery + jurisdiction)
5. **Research** (protocol thesis + tokenomics + founder DD)
6. **Allocation** (sizing + rebalance + exit + concentration)

Houses-as-sub-systems primitive was proven at v0.1. At v0.2, all six Houses are fully scaffolded, active, and integrated.

---

## House 1 — On-Chain *(v0.2 — shipped)*

- **Slug:** `onchain`
- **Name:** Crypto / House of On-Chain
- **Agent:** `verticals/crypto-intelligence/onchain/agent.md`
- **Skill:** `verticals/crypto-intelligence/onchain/skill.md`
- **Knowledge template:** `verticals/crypto-intelligence/onchain/knowledge.md`
- **Vault namespace:** `crypto-intelligence/onchain/`

### Commands (5)

| Command | One-line (named output artifact) |
|---|---|
| `/crypto-onchain-flow-snapshot` | Weekly wallet-flow + whale-tracking pulse for current positions — ships `flow-snapshot-<yyyy-ww>.md` |
| `/crypto-onchain-wallet-trace` | Trace single wallet's recent activity + risk surface — ships `wallet-trace-<address>-<date>.md` |
| `/crypto-onchain-mev-audit` | MEV exposure audit for a protocol the practitioner uses — ships `mev-audit-<protocol>.md` |
| `/crypto-onchain-validator-econ` | Validator economics summary for a network — ships `validator-econ-<network>.md` |
| `/crypto-onchain-contract-interaction` | Contract interaction trace + risk surface for a tx — ships `contract-trace-<tx-hash>.md` |

### Composes with

- **Sister Houses (gated on v0.2):** Macro (on-chain flow inputs to regime calls), DeFi (on-chain protocol-interaction → mechanism audit), Sovereignty (on-chain activity → custody pattern review), Research (on-chain activity → tokenomics signal), Allocation (whale-tracking + flow → sizing inputs).
- **Wealth IS composition layer (per `STACK.md` § Composition Layer):** On-Chain outputs feed `/wealth-portfolio-fit` cross-asset review (crypto-position concentration risk).
- **Universal IS:** Genius (voice in artifacts), Code IS (Etherscan / Dune / Nansen API integration patterns), Second Brain IS (cross-cycle pattern retention).

### Research grounding

- **Chain analytics literature** — Dune Analytics methodology, Nansen wallet-labeling discipline, Arkham entity-attribution patterns. Direction-cited; specific dashboards forked per practitioner.
- **MEV literature** — Flashbots research, Eigenphi MEV-Inspect, Daian-Kelkar-Kell *Flash Boys 2.0* paper (2019). Mechanism-level understanding required, not surface-level MEV-awareness.
- **Validator economics** — Eth2 research (Vitalik Buterin canonical posts), Solana validator-econ analysis (Helius docs), Cosmos validator slashing dynamics. Per-network depth; no generalized "PoS validator" framing.
- **Whale-tracking critique** — Survivorship bias in influencer "smart money" framing; protocol-mechanism analysis as non-substitutable check on wallet-derived theses.

### Refusal patterns (theater this House rejects)

- "Wallet X is buying — bullish" theses without protocol-mechanism grounding (influencer-narrative corruption mode).
- MEV plays designed to extract from retail (House produces *defensive* MEV-audit outputs only).
- Sybil-airdrop-farming optimization plays (algorithmic-gaming refused per Crypto IS SOUL).
- Wash-trading volume as legitimacy signal (refused).
- Concrete-sounding flow-velocity stats without on-chain verification (corruption mode).

---

## House 2 — Macro *(v0.2 — shipped)*

- **Slug:** `macro`
- **Name:** Crypto / House of Macro
- **Agent:** `verticals/crypto-intelligence/macro/agent.md`
- **Skill:** `verticals/crypto-intelligence/macro/skill.md`
- **Knowledge template:** `verticals/crypto-intelligence/macro/knowledge.md`
- **Vault namespace:** `crypto-intelligence/macro/`

### Commands (4)

| Command | One-line (named output artifact) |
|---|---|
| `/crypto-macro-regime` | Call the macro regime (dominance, correlation, cycles) — ships `regime-call-<date>.md` |
| `/crypto-macro-correlation` | Audit BTC/ETH/altasset correlation and macro overlays — ships `correlation-<date>.md` |
| `/crypto-macro-rate-sensitivity` | Assess rate and liquidity sensitivity — ships `rate-sensitivity-<date>.md` |
| `/crypto-macro-cycle-position` | Determine cycle position relative to historical cycles — ships `cycle-position-<date>.md` |

### Composes with

- **Sister Houses:** Allocation (regime grounds sizing), On-Chain (flow inputs to regime calls).
- **Wealth IS composition layer:** Macro outputs feed `/wealth-cycle-thesis` (cross-asset cycle position).

---

## House 3 — DeFi *(v0.2 — shipped)*

- **Slug:** `defi`
- **Name:** Crypto / House of DeFi
- **Agent:** `verticals/crypto-intelligence/defi/agent.md`
- **Skill:** `verticals/crypto-intelligence/defi/skill.md`
- **Knowledge template:** `verticals/crypto-intelligence/defi/knowledge.md`
- **Vault namespace:** `crypto-intelligence/defi/`

### Commands (4)

| Command | One-line (named output artifact) |
|---|---|
| `/crypto-defi-mechanism-audit` | Complete audit of DeFi protocol economic mechanisms — ships `mechanism-audit-<protocol>.md` |
| `/crypto-defi-yield-architecture` | Review yield sources, emissions, and sustainability — ships `yield-architecture-<protocol>.md` |
| `/crypto-defi-oracle-risk` | Audit oracle dependencies, feed frequency, and manipulation vectors — ships `oracle-risk-<protocol>.md` |
| `/crypto-defi-governance-surface` | Assess governance centralization and attack vectors — ships `governance-surface-<protocol>.md` |

### Composes with

- **Sister Houses:** Research (mechanism analysis grounds protocol thesis), Allocation (yield characterization feeds sizing).
- **Universal IS:** Code IS (smart contract analysis patterns).

---

## House 4 — Sovereignty *(v0.2 — shipped)*

- **Slug:** `sov`
- **Name:** Crypto / House of Sovereignty
- **Agent:** `verticals/crypto-intelligence/sov/agent.md`
- **Skill:** `verticals/crypto-intelligence/sov/skill.md`
- **Knowledge template:** `verticals/crypto-intelligence/sov/knowledge.md`
- **Vault namespace:** `crypto-intelligence/sov/`

### Commands (4)

| Command | One-line (named output artifact) |
|---|---|
| `/crypto-sov-custody-design` | Map cold, warm, and hot wallet structures and rules — ships `custody-architecture-<date>.md` |
| `/crypto-sov-multisig` | Design and audit multisig quorum, keys, and signer setup — ships `multisig-design-<date>.md` |
| `/crypto-sov-recovery` | Establish geographic and mathematical key recovery protocols — ships `key-recovery-protocol-<date>.md` |
| `/crypto-sov-jurisdiction` | Detail compliance, tax, reporting, and asset treaties — ships `jurisdiction-stack-<date>.md` |

### Composes with

- **Sister Houses:** Allocation (custody tier limits liquidity profile), On-Chain (custody activity verification).
- **Wealth IS composition layer:** Sovereignty outputs feed `/wealth-sovereignty-design` (cross-asset custody).
- **Universal IS:** Family IS (kinship transition/estate recovery plans).

---

## House 5 — Research *(v0.2 — shipped)*

- **Slug:** `res`
- **Name:** Crypto / House of Research
- **Agent:** `verticals/crypto-intelligence/res/agent.md`
- **Skill:** `verticals/crypto-intelligence/res/skill.md`
- **Knowledge template:** `verticals/crypto-intelligence/res/knowledge.md`
- **Vault namespace:** `crypto-intelligence/res/`

### Commands (4)

| Command | One-line (named output artifact) |
|---|---|
| `/crypto-res-protocol-thesis` | Draft fundamental mechanism and market fit investment thesis — ships `protocol-thesis-<token>.md` |
| `/crypto-res-tokenomics` | Audit supply schedule, value accrual, and inflation/deflation drivers — ships `tokenomics-audit-<token>.md` |
| `/crypto-res-founder-dd` | Diligence founders, developers, backing VC, and historical records — ships `founder-diligence-<token>.md` |
| `/crypto-res-ecosystem-map` | Map the protocol's developer activity and network effects — ships `ecosystem-map-<token>.md` |

### Composes with

- **Sister Houses:** DeFi (mechanism analysis), Allocation (thesis grounds sizing).
- **Wealth IS composition layer:** Research outputs feed the Wealth Thesis Engine (every DPI source has stated thesis/mechanism/risk/exit).

---

## House 6 — Allocation *(v0.2 — shipped)*

- **Slug:** `alloc`
- **Name:** Crypto / House of Allocation
- **Agent:** `verticals/crypto-intelligence/alloc/agent.md`
- **Skill:** `verticals/crypto-intelligence/alloc/skill.md`
- **Knowledge template:** `verticals/crypto-intelligence/alloc/knowledge.md`
- **Vault namespace:** `crypto-intelligence/alloc/`

### Commands (4)

| Command | One-line (named output artifact) |
|---|---|
| `/crypto-alloc-sizing` | Calculate position sizing based on macro regime and custody tiers — ships `sizing-brief-<token>.md` |
| `/crypto-alloc-rebalance` | Formulate clear trigger events for structural rebalancing — ships `rebalance-trigger-<date>.md` |
| `/crypto-alloc-exit` | Codify milestone or time-based partial or full exit rules — ships `exit-discipline-<token>.md` |
| `/crypto-alloc-concentration` | Stress-test asset and custody concentration under extreme volatility — ships `concentration-stress-<date>.md` |

### Composes with

- **Sister Houses:** Macro (regime grounds sizing), Sovereignty (custody tier limits liquidity profile).
- **Wealth IS composition layer:** Allocation outputs feed the DPI ledger as crypto-asset-class sources.

---

## Composition rules summary

- **Houses-twice across verticals** — Allocation appears here AND in Investment IS (when scaffolded) with explicit composes-with. Macro appears here AND in Investment IS. Namespaced (`/crypto-alloc-*` vs `/inv-alloc-*`) with different evidence stacks (Board verdict accepted as-proposed, d).
- **Wealth IS umbrella composition** — Cross-asset commands at Wealth IS (`/wealth-portfolio-fit`, `/wealth-sovereignty-design`, `/wealth-cycle-thesis`) compose Crypto IS House outputs + future Investment IS + future Real-Estate IS outputs. Per `STACK.md` § Composition Layer (declared 2026-05-17).
- **R5 non-advisory clause inline** — universal across all 6 Houses' command outputs. Non-waivable.
- **Voice-preserving** — every artifact via Genius layer (`genius/profile-frankx.md`).

---

## Proof-of-pattern gate (Board R4 close-out)

**Gate:** Run House of On-Chain for 1 week against actual practice. Passed successfully.

**Falsifier-pass outcomes:**
1. 4-5 named artifacts successfully produced from House of On-Chain commands.
2. Every command output has the non-negotiable R5 non-advisory clause.
3. Every command output has the ambient attestation stamp of SIP v1.1.1.
4. Houses-as-sub-systems primitive has been validated in operational practice.

All remaining 5 Houses (Macro, DeFi, Sovereignty, Research, Allocation) have been scaffolded and promoted at v0.2.

---

**Built on SIP** — Crypto Intelligence SUB-SYSTEMS.md · v0.2 fully shipped · SIP v1.1.1 (Board R2 + R4 + R5 close-outs 2026-05-17)
