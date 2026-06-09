---
name: crypto-onchain-validator-econ
description: Validator economics summary for a network. Per-chain depth (Ethereum / Solana / Cosmos / per-L2). Commission rates, slashing history, MEV-share dynamics, decentralization metrics. Ships validator-econ-<network-slug>-<date>.md.
allowed-tools: Read, Write, Grep, Glob, WebFetch
argument-hint: <network-slug>
vertical: crypto-intelligence
house: onchain
tier: Domain Sub-Stack Tier
---

# /crypto-onchain-validator-econ

Load `verticals/crypto-intelligence/SOUL.md`, `verticals/crypto-intelligence/onchain/agent.md`, `verticals/crypto-intelligence/onchain/skill.md`, `verticals/crypto-intelligence/onchain/knowledge.md` (Validator economics per-network section).

## Input

$ARGUMENTS — network-slug (ethereum / solana / cosmoshub / osmosis / arbitrum-sequencer / etc.)

## R5 non-advisory clause (mandatory inline)

> *This is system architecture, not financial / investment / tax / legal advice. Outputs frame decisions; jurisdiction-specific counsel signs off on instruments. The practitioner accepts capital risk; the substrate accepts no claim. Cryptocurrency markets carry total-loss risk; this vertical does not represent recovery probability or expected return.*

## Process

### Step 1 — Resolve network + load network-specific knowledge

Per `knowledge.md` Validator economics section, each network has materially different:
- Consensus type (PoS / PoSA / DPoS / hybrid)
- Slashing conditions (double-sign / liveness / governance-misbehavior)
- MEV-share dynamics (MEV-Boost / Jito / etc.)
- Decentralization metrics (Nakamoto coefficient, geographic distribution, client diversity)
- Liquid-staking integration (Lido / Rocket Pool / Marinade / Stride etc.)

Reject generalized "PoS validator" framing — every network analysis is per-chain.

### Step 2 — Commission + reward analysis

- **Base reward rate** — current issuance + fee-burn dynamics (e.g., Eth post-EIP-1559)
- **Commission distribution** — validator commission rates (median + outliers + concentration)
- **Liquid-staking premium/discount** — where applicable, vs. solo-staking yield
- **MEV-share** — what fraction of MEV flows to validators vs. searchers vs. proposers

### Step 3 — Slashing history

- Recent slashings (last 12 months)
- Slashing root causes (operational vs. malicious vs. governance-misbehavior)
- Validator-set churn rate
- Slashed-validator reputation impact (does the operator still validate?)

### Step 4 — Decentralization metrics

- **Nakamoto coefficient** — number of entities needed to halt the chain (33% for liveness, 51% for confirmation)
- **Geographic distribution** — country-level concentration
- **Client diversity** — software-client market share (geth-vs-erigon-vs-besu-vs-nethermind for Eth, jito-solana-vs-stock-solana for SOL, etc.)
- **Stake concentration** — Lido share for Eth, Solana foundation share, validator-set caps for Cosmos, etc.

### Step 5 — Liquid-staking layer (if relevant)

- Premium / discount of liquid-staking derivative vs. base asset
- Withdrawal queue dynamics (Eth withdrawal cycle, Solana unstaking delay, Cosmos unbonding period)
- LST market depth + concentration risk

### Step 6 — Compose-with downstream

- House of Sovereignty (v0.2): `Feeds: /crypto-sov-custody-design` (validator selection IS a custody-tier decision)
- House of Allocation (v0.2): `Feeds: /crypto-alloc-sizing` (staking vs. liquid-staking vs. unstaked sizing)
- House of Research (v0.2): `Feeds: /crypto-res-protocol-thesis` (validator decentralization grounds network thesis)

### Step 7 — Ship named artifact

Write to: `verticals/crypto-intelligence/onchain/artifacts/validator-econ-<network-slug>-<yyyy-mm-dd>.md`

## Output shape

```markdown
# Validator Economics — <network-slug> — <yyyy-mm-dd>

> [R5 clause verbatim]

## Network
- Slug: <slug> · Consensus: <PoS / PoSA / DPoS / hybrid>
- Snapshot timestamp: <ts>

## Chain-data sources
- [per-network canonical sources cited]

## Reward + commission analysis
- Base reward rate: <rate> · issuance / fee dynamics: <notes>
- Commission distribution: <median / outliers / concentration>
- Liquid-staking premium/discount: <if applicable>
- MEV-share: <validator / searcher / proposer split>

## Slashing history (12mo)
- Slashing events: <n> · root-cause distribution: <ops / malicious / governance>
- Validator-set churn: <rate>
- [significant slashings + post-mortem notes]

## Decentralization metrics
- Nakamoto coefficient: <liveness / confirmation>
- Geographic distribution: <country concentration>
- Client diversity: <software-client market share>
- Stake concentration: <top entities + share>

## Liquid-staking layer (if applicable)
- Derivatives: <list + market depth>
- Withdrawal dynamics: <queue / unbonding>
- Premium/discount: <current>

## Mechanism notes
- [per-network mechanism citations — no generalized "PoS" framing]

## Uncertainty flags
- [where validator-self-reporting is incomplete; where slashing reporting has lags]

## Composes-with downstream
- Feeds: [sister Houses]

---
**Built on SIP** — Crypto / House of On-Chain · validator-econ · <yyyy-mm-dd> · SIP v1.1.0
---
```

## Quality gates

- [ ] R5 clause inline
- [ ] Per-network depth (no generalized "PoS validator" framing)
- [ ] Sources cited per knowledge.md per-network section
- [ ] Slashing history covers 12mo with root-cause distribution
- [ ] Decentralization metrics named with measurement source
- [ ] Composes-with declared
- [ ] Named artifact written
- [ ] "Built on SIP" footer

## Rules

- **Per-network depth non-substitutable.** Every chain has materially different slashing conditions, MEV-share dynamics, decentralization characteristics. "Validators get rewards" is not analysis.
- **Liquid-staking premium/discount is a market signal, not a buy signal.** Output characterizes; does not recommend.
- **Validator decentralization metrics inform protocol-thesis but don't substitute for it.** Composes with House of Research at v0.2.

---

**Built on SIP** — /crypto-onchain-validator-econ · v0.1 proof-of-pattern · SIP v1.1.0
