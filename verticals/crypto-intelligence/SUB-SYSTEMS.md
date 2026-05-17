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

**At v0.1 (Board R4 gate):** only House of On-Chain commands ship. Daily-5 names what becomes daily on v0.2-proof-pass.

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

Houses-as-sub-systems primitive is on proof-of-pattern at v0.1 per Board R4 — only House of On-Chain scaffolded. Falsifier: if House of On-Chain can't ship 4-5 named artifacts in 1 week, primitive failed for crypto → fall back to functional sub-systems matching People IS shape.

---

## House 1 — On-Chain *(v0.1 — scaffolded — proof-of-pattern)*

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

## House 2 — Macro *(v0.2 — gated on v0.1 proof-pass)*

- **Slug:** `macro`
- **Scope (planned):** Regime detection (BTC dominance, ETH-BTC correlation, alt-cycle position), macro overlay (DXY, rates, equity correlation), cycle-position thesis.
- **Commands (4-5, gated):** `/crypto-macro-regime`, `/crypto-macro-correlation`, `/crypto-macro-rate-sensitivity`, `/crypto-macro-cycle-position`.
- **Composes with:** Wealth IS `/wealth-cycle-thesis` (cross-asset cycle position), House of Allocation (regime grounds sizing).

---

## House 3 — DeFi *(v0.2 — gated)*

- **Slug:** `defi`
- **Scope (planned):** Mechanism audit, yield architecture (real-yield vs emissions-yield), oracle risk stack, governance attack surface, liquidity-mechanism analysis.
- **Commands (4-5, gated):** `/crypto-defi-mechanism-audit`, `/crypto-defi-yield-architecture`, `/crypto-defi-oracle-risk`, `/crypto-defi-governance-surface`.
- **Composes with:** House of Research (mechanism analysis grounds protocol thesis), House of Allocation (yield characterization inputs to sizing).

---

## House 4 — Sovereignty *(v0.2 — gated)*

- **Slug:** `sov`
- **Scope (planned):** Custody architecture (cold + warm + hot tier separation), multisig design (threat model → quorum/key-distribution), key recovery protocol (Shamir / multi-sig + geography), jurisdiction stack (tax + reporting + treaty discipline).
- **Commands (4-5, gated):** `/crypto-sov-custody-design`, `/crypto-sov-multisig`, `/crypto-sov-recovery`, `/crypto-sov-jurisdiction`.
- **Composes with:** Wealth IS `/wealth-sovereignty-design` (cross-asset custody), Family IS (multi-generational considerations).

---

## House 5 — Research *(v0.2 — gated)*

- **Slug:** `res`
- **Scope (planned):** Protocol thesis (mechanism + market + team + tokenomics + cycle-fit), tokenomics audit (supply schedule + governance + value-accrual), founder/team diligence, ecosystem mapping.
- **Commands (4-5, gated):** `/crypto-res-protocol-thesis`, `/crypto-res-tokenomics`, `/crypto-res-founder-dd`, `/crypto-res-ecosystem-map`.
- **Composes with:** Wealth IS Thesis engine (per R3.a — Crypto-Research outputs feed Wealth IS Thesis engine), House of DeFi (mechanism analysis), House of Allocation (thesis grounds sizing).

---

## House 6 — Allocation *(v0.2 — gated)*

- **Slug:** `alloc`
- **Scope (planned):** Position sizing (regime-aware, cycle-aware, custody-tier-aware), rebalance triggers, exit discipline, concentration stress, time-horizon discipline.
- **Commands (4-5, gated):** `/crypto-alloc-sizing`, `/crypto-alloc-rebalance`, `/crypto-alloc-exit`, `/crypto-alloc-concentration`.
- **Composes with:** Wealth IS DPI ledger (per R3.a — Crypto-Allocation outputs feed DPI ledger as crypto-asset-class sources), House of Macro (regime grounds sizing), House of Sovereignty (custody-tier informs liquidity profile).

---

## Composition rules summary

- **Houses-twice across verticals** — Allocation appears here AND in Investment IS (when scaffolded) with explicit composes-with. Macro appears here AND in Investment IS. Namespaced (`/crypto-alloc-*` vs `/inv-alloc-*`) with different evidence stacks (Board verdict accepted as-proposed, d).
- **Wealth IS umbrella composition** — Cross-asset commands at Wealth IS (`/wealth-portfolio-fit`, `/wealth-sovereignty-design`, `/wealth-cycle-thesis`) compose Crypto IS House outputs + future Investment IS + future Real-Estate IS outputs. Per `STACK.md` § Composition Layer (declared 2026-05-17).
- **R5 non-advisory clause inline** — universal across all 6 Houses' command outputs. Non-waivable.
- **Voice-preserving** — every artifact via Genius layer (`genius/profile-frankx.md`).

---

## Proof-of-pattern gate (Board R4 close-out)

**Gate:** Run House of On-Chain for 1 week against actual practice. Falsifier: if 4-5 named artifacts cannot be produced in the week, Houses-as-sub-systems primitive failed for crypto.

**Falsifier-pass criteria:**
1. 4-5 named artifacts produced from House of On-Chain commands (testable: are the files in `crypto-intelligence/onchain/artifacts/` or instance-private equivalent?)
2. Each artifact opens with R5 non-advisory clause (testable: grep for clause text)
3. Each artifact passes corruption-mode test (testable: pick three, verify protocol-mechanism citation present)
4. Houses-as-sub-systems primitive feels natural in practice (judgment call — Frank's read after 1 week)

**On v0.1-proof-pass:** Scaffold remaining 5 Houses + 24-25 commands + Investment IS at `verticals/investment-intelligence/` per Board R4. Pattern choice (markdown-doc vs substrate-extension) revealed by what served the proof.

**On v0.1-proof-fail:** Re-iterate at `PROPOSAL.md`. Fall back to functional sub-systems matching People IS shape (e.g., Crypto / Hiring-equivalent = Onboarding / Performance-equivalent = Thesis-Review / etc.). Houses register dropped; functional decomposition adopted.

---

**Built on SIP** — Crypto Intelligence SUB-SYSTEMS.md · v0.1 proof-of-pattern · SIP v1.1.0 (Board R2 + R4 + R5 close-outs 2026-05-17)
