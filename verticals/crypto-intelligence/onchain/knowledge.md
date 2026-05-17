# Knowledge — Crypto / House of On-Chain

> Field-literature direction + methodology references this House operates from. Direction-cited; not exhaustive bibliography. Practitioner forks add their own per-portfolio depth.

---

## Chain-analytics methodology

- **Dune Analytics** — SQL-over-decoded-blockchain methodology. Read: Dune docs on query composition + dashboard discipline. Forkable dashboards by community analysts (Hildobby, Defi Made Here, Hagaetc) as starting points for portfolio-specific queries.
- **Nansen** — wallet-labeling discipline + entity-attribution methodology. Smart-money labels are *one* signal; never the *only* signal (per refusal pattern #1 in skill.md).
- **Arkham** — entity-attribution + confidence-band methodology. Useful for whale-attribution claims (refusal pattern #6 requires entity-tag source).
- **DefiLlama** — TVL + protocol-snapshot methodology. Snapshot timestamp is mandatory citation (snapshots drift).
- **Etherscan / Solscan / equivalent** — per-chain block explorers. Source-of-truth for tx-hash / contract / wallet queries.

## MEV literature

- **Flashbots research** — canonical MEV literature. Read: Flashbots Discord research output, MEV-Boost relay design, MEV-Share architecture.
- **Daian, Kelkar, Kell et al.** — *Flash Boys 2.0* (2019) — foundational paper on MEV market structure. Mechanism-level understanding required, not surface-level "MEV is bad" framing.
- **MEV-Inspect / Eigenphi / EigenPHI dashboards** — empirical MEV-extraction measurement tooling.
- **MEV-Protect / Flashbots Protect RPC** — defensive infrastructure. House of On-Chain `mev-audit` characterizes *exposure*; practitioner decides whether to route through defensive RPC.

## Validator economics (per-network)

- **Ethereum (Proof of Stake):**
  - Vitalik Buterin canonical posts (vitalik.eth.limo / vitalik.ca archive) on PoS design, slashing dynamics, validator-econ
  - Eth2 Annotated Spec (Ben Edgington) for protocol-level grounding
  - Lido / Rocket Pool / EigenLayer mechanism docs for liquid-staking layer
- **Solana:** Helius docs on validator econ, Jito MEV-share dynamics, Marinade liquid-staking model
- **Cosmos:** Cosmos SDK staking docs, slashing dynamics per zone, IBC validator considerations
- **L2 sequencer econ** (separate domain): Arbitrum / Optimism / Base / zkSync sequencer-econ docs; centralization-vs-decentralization roadmaps per L2

Per-network depth required. No generalized "PoS validator" framing — each chain has materially different slashing conditions, MEV-share dynamics, decentralization characteristics.

## Contract-interaction risk

- **Smart contract risk categories:**
  - Proxy-contract upgrade authority (who controls the upgrade key?)
  - Multisig changes (signer additions/removals on critical multisigs)
  - Governance attack surface (vote-buying, last-minute proposal injection, quorum manipulation)
  - Oracle dependency (Chainlink vs Pyth vs Uniswap-TWAP vs on-chain-keeper — different attack surfaces)
  - Liquidity-mechanism exposure (Curve gauge, Convex / Aura layers, etc.)
- **Tools:**
  - Phalcon / Tenderly transaction-trace tooling
  - DeFiSafety / DefiLlama protocol risk scores (one signal, not the only signal)
  - Practitioner's own contract-read discipline (read the contract before depositing meaningful size)

## Cycle-position grounding (for sister House of Macro at v0.2)

On-chain flow data feeds regime calls. Direction-cite:
- BTC cycle position via Glassnode methodology (NUPL, MVRV-Z, realized-cap)
- ETH cycle position via ratio analysis + L2 activity decomposition
- Alt-cycle dynamics via dominance + rotation analysis
- Stablecoin flow (USDC/USDT/DAI) as macro-cycle signal

## Sovereignty discipline (for sister House of Sovereignty at v0.2)

On-chain activity informs custody-tier review:
- Frequent-tx wallets → warm-custody-tier candidate
- Long-hold wallets → cold-custody-tier
- Multisig coordination → key-rotation cadence
- Cross-chain bridging → bridge-risk tracking

## Corruption modes (per Crypto IS SOUL)

This House actively refuses:
- Influencer-narrative-derived theses without protocol-mechanism grounding
- MEV-extraction strategies (defensive audit only)
- Sybil-airdrop-farming plays
- Wash-trading volume as legitimacy
- Anonymous-wallet attribution without entity-tag source
- Concrete-sounding flow-velocity / TVL / yield stats without on-chain verification

---

**Built on SIP** — Crypto / House of On-Chain knowledge.md · v0.1 proof-of-pattern · SIP v1.1.0
