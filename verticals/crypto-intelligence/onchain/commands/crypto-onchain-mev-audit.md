---
name: crypto-onchain-mev-audit
description: MEV exposure audit for a protocol the practitioner uses. Characterizes sandwich-attack surface, JIT-liquidity exposure, oracle-update front-running, governance attack vectors. Defensive output only — no MEV-extraction strategies. Ships mev-audit-<protocol-slug>-<date>.md.
allowed-tools: Read, Write, Grep, Glob, WebFetch
argument-hint: <protocol-slug>
vertical: crypto-intelligence
house: onchain
tier: Domain Sub-Stack Tier
---

# /crypto-onchain-mev-audit

Load `verticals/crypto-intelligence/SOUL.md`, `verticals/crypto-intelligence/onchain/agent.md`, `verticals/crypto-intelligence/onchain/skill.md`, `verticals/crypto-intelligence/onchain/knowledge.md` (MEV literature section).

## Input

$ARGUMENTS — protocol-slug (DefiLlama slug or equivalent)

## R5 non-advisory clause (mandatory inline)

> *This is system architecture, not financial / investment / tax / legal advice. Outputs frame decisions; jurisdiction-specific counsel signs off on instruments. The practitioner accepts capital risk; the substrate accepts no claim. Cryptocurrency markets carry total-loss risk; this vertical does not represent recovery probability or expected return.*

## Refusal preamble (mandatory)

> *This audit is defensive — it characterizes the practitioner's MEV-extraction *exposure* when interacting with this protocol. It does NOT design extraction strategies, sandwich-attack plays, or retail-MEV plays. Per Crypto IS SOUL.md refusal pattern: MEV-extraction-from-retail outputs are refused universally by this vertical.*

## Process

### Step 1 — Resolve protocol

- Validate slug against DefiLlama / protocol-canonical-list
- Identify protocol type (AMM / lending / perps / yield-aggregator / governance / bridge / etc.)
- Load protocol whitepaper + audit-report context if available

### Step 2 — Map MEV-exposure surfaces

Per knowledge.md MEV literature:

**For AMMs:**
- Sandwich attack surface (depends on swap routing — public mempool vs MEV-Protect vs CoW vs 1inch Fusion)
- JIT liquidity exposure (LPs see attacks at swap moment)
- Slippage-vulnerability per swap-size

**For lending / borrowing:**
- Liquidation MEV (who has priority access to liquidations? Keepers, auction-bidders?)
- Oracle-update front-running (between Chainlink heartbeat and protocol price-read)
- Bad-debt socialization risk

**For perps:**
- Funding-rate manipulation exposure
- Liquidation cascade risk
- Oracle attack surface (more critical than for spot AMMs)

**For governance:**
- Last-minute proposal injection attack surface
- Vote-buying market exposure
- Quorum manipulation paths

**For bridges:**
- Bridge type (lock-and-mint = full mint-authority risk; burn-and-mint = limited; liquidity-network = different)
- Validator set centralization
- Slashing economics for bridge validators

### Step 3 — Cite empirical evidence

For each exposure surface, cite where the evidence comes from:
- **Flashbots research / MEV-Inspect / Eigenphi** for historical extraction data
- **Protocol audit reports** for known vulnerability classes
- **Post-mortems of past exploits** (Rekt News, public protocol post-mortems)
- **On-chain measurement** via Dune / Etherscan if practitioner needs current data

### Step 4 — Defensive recommendations

For the protocol's exposure surfaces, name defensive postures the practitioner can adopt:
- **Route swaps through:** Flashbots Protect / MEV-Protect / CoW Swap / 1inch Fusion (per protocol-fit)
- **Size discipline:** sandwich-resistance via smaller swaps + multiple routes
- **Slippage settings:** tighter slippage caps + JIT-aware tolerances
- **Approval hygiene:** time-limited approvals + revoke-after-use discipline
- **Custody-tier-aware participation:** large positions → cold custody; active trading → warm custody with revocation cadence

### Step 5 — Mechanism context

Name the mechanism behind each exposure surface. "Oracle-update front-running" depends on whether oracle is Chainlink (heartbeat-based, predictable update window), Pyth (pull-based, attestation-driven), Uniswap-TWAP (price-manipulation surface), or on-chain keeper (different attack profile).

### Step 6 — Compose-with downstream

- House of DeFi (v0.2): `Feeds: /crypto-defi-mechanism-audit` (this audit informs broader mechanism analysis)
- House of Allocation (v0.2): `Feeds: /crypto-alloc-sizing` (MEV exposure informs position-sizing in this protocol)
- House of Sovereignty (v0.2): `Feeds: /crypto-sov-custody-design` (custody-tier-vs-protocol-exposure)

### Step 7 — Ship named artifact

Write to: `verticals/crypto-intelligence/onchain/artifacts/mev-audit-<protocol-slug>-<yyyy-mm-dd>.md` (mostly public-reference; practitioner-specific defensive recommendations may move to `private/`)

## Output shape

```markdown
# MEV Audit — <protocol-slug> — <yyyy-mm-dd>

> [R5 clause verbatim]
> [Refusal preamble verbatim]

## Protocol
- Slug: <slug>
- Type: <AMM / lending / perps / yield / governance / bridge>
- DefiLlama URL: <url> · TVL snapshot: <amount> · timestamp: <ts>

## MEV-exposure surfaces

### Surface 1 — <surface name>
- **Mechanism:** <protocol-specific mechanism>
- **Evidence:** <Flashbots / MEV-Inspect / audit / post-mortem citation>
- **Practitioner exposure:** <how this affects practitioner's interactions>

[repeat per surface]

## Defensive postures
- [routing recommendations]
- [sizing discipline]
- [slippage / approval / custody-tier guidance]

## Mechanism notes
- [per-surface mechanism citations]

## Uncertainty flags
- [where MEV-extraction-vs-arbitrage is contested; where measurement data is incomplete]

## Composes-with downstream
- Feeds: [sister Houses]

---
**Built on SIP** — Crypto / House of On-Chain · mev-audit · <yyyy-mm-dd> · SIP v1.1.0
---
```

## Quality gates

- [ ] R5 clause inline
- [ ] Refusal preamble inline (MEV-extraction-from-retail refusal)
- [ ] Every exposure surface cites empirical evidence
- [ ] Defensive postures named (not extraction strategies)
- [ ] Mechanism context per surface
- [ ] Uncertainty flagged
- [ ] Composes-with declared
- [ ] Named artifact written
- [ ] "Built on SIP" footer

## Rules

- **DEFENSIVE ONLY.** No extraction-strategy outputs. No "how to sandwich-attack X" outputs. Universal refusal per Crypto IS SOUL.
- **Cite empirical evidence for every claimed exposure surface.** No "this protocol has MEV exposure because reasons."
- **Mechanism context non-substitutable.** "Oracle exposure" without naming Chainlink-vs-Pyth-vs-TWAP fails the gate.

---

**Built on SIP** — /crypto-onchain-mev-audit · v0.1 proof-of-pattern · SIP v1.1.0
