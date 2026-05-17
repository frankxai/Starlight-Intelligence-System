---
name: crypto-onchain-contract-interaction
description: Trace a single tx-hash's contract-interaction graph + flag risk patterns (proxy upgrades, multisig changes, governance attack vectors, oracle dependencies, liquidity-mechanism exposure). Ships contract-trace-<tx-hash-short>.md.
allowed-tools: Read, Write, Grep, Glob, WebFetch
argument-hint: <tx-hash>
vertical: crypto-intelligence
house: onchain
tier: Domain Sub-Stack Tier
---

# /crypto-onchain-contract-interaction

Load `verticals/crypto-intelligence/SOUL.md`, `verticals/crypto-intelligence/onchain/agent.md`, `verticals/crypto-intelligence/onchain/skill.md`, `verticals/crypto-intelligence/onchain/knowledge.md` (Contract-interaction risk section).

## Input

$ARGUMENTS — tx-hash (required)

## R5 non-advisory clause (mandatory inline)

> *This is system architecture, not financial / investment / tax / legal advice. Outputs frame decisions; jurisdiction-specific counsel signs off on instruments. The practitioner accepts capital risk; the substrate accepts no claim. Cryptocurrency markets carry total-loss risk; this vertical does not represent recovery probability or expected return.*

## Process

### Step 1 — Resolve tx + chain

- Validate tx-hash format (per chain)
- Detect chain (EVM vs Solana vs Cosmos vs other)
- Pull tx metadata (block height, timestamp, sender, recipient, value, gas)

### Step 2 — Decode interaction graph

Using Phalcon / Tenderly / equivalent trace tooling:
- Internal-call tree (depth + branching)
- Token transfers per call (ERC-20 / ERC-721 / SPL / etc.)
- Storage writes (where state changed)
- Event emissions

### Step 3 — Identify contracts touched

For each contract in the trace:
- Contract address + deployment date
- Proxy pattern (is this a proxy? upgrade authority?)
- Audit status (per DeFiSafety / per-protocol audit-report-availability)
- Multisig wrapping (is the contract behind a multisig? signer composition?)
- Governance authority (token-vote / Gnosis Safe / DAO / centralized admin)

### Step 4 — Risk-pattern flagging

Per knowledge.md Contract-interaction risk taxonomy:

- **Proxy upgrade authority** — who controls the upgrade key? Single EOA? Multisig? Timelock? DAO?
- **Recent upgrade event** — has the proxy been upgraded recently? When? What changed?
- **Multisig signer changes** — has the multisig added/removed signers recently?
- **Open governance proposals** — any active proposals affecting this contract?
- **Oracle dependencies** — Chainlink heartbeat / Pyth pull / Uniswap-TWAP / on-chain-keeper — name the mechanism
- **Liquidity mechanism** — if AMM, name the curve type + LP-incentive structure
- **Token approval surface** — were approvals granted? To which contracts? Time-limited or unlimited?

### Step 5 — Mechanism context per significant call

For each meaningful interaction in the trace: name the mechanism. Same swap on Uniswap-V3 vs CoW vs 1inch is three different MEV-exposure profiles + three different settlement guarantees.

### Step 6 — Compose-with downstream

- House of DeFi (v0.2): `Feeds: /crypto-defi-mechanism-audit` (per-contract mechanism analysis aggregates here)
- House of Sovereignty (v0.2): `Feeds: /crypto-sov-custody-design` (approval surfaces + multisig discipline)
- House of Allocation (v0.2): `Feeds: /crypto-alloc-sizing` (contract-risk informs position-sizing in this protocol)

### Step 7 — Ship named artifact

Write to: `verticals/crypto-intelligence/onchain/artifacts/contract-trace-<tx-hash-short>.md` (truncate hash to first/last 4 chars: `0xabcd…1234`)

## Output shape

```markdown
# Contract Interaction Trace — <tx-hash-short> — <yyyy-mm-dd>

> [R5 clause verbatim]

## Transaction
- Full hash: <tx-hash>
- Chain: <chain> · Block: <height> · Timestamp: <ts>
- Sender: <address> · Recipient: <address> · Value: <amount>
- Gas: <used / limit / price>

## Chain-data sources
- Block explorer: <Etherscan / Solscan / etc. URL>
- Trace tooling: <Phalcon / Tenderly / equivalent>
- Audit references: <per-contract audit reports cited>

## Interaction graph (summary)
- Internal-call depth: <n> · Token transfers: <n> · Storage writes: <n>
- Contracts touched: <n>

## Contracts touched
### <contract address> — <protocol / name>
- Proxy: <yes/no> · Upgrade authority: <type>
- Audit: <status + report citation>
- Multisig: <yes/no + signer count + composition>
- Governance: <authority type>
- Recent significant events: <upgrades / signer changes / proposals>

[repeat per contract]

## Risk patterns flagged
- [per-pattern flags from Step 4]

## Mechanism context
- [per-significant-call mechanism citations]

## Uncertainty flags
- [where audit-status is incomplete; where proxy-upgrade-authority is ambiguous]

## Composes-with downstream
- Feeds: [sister Houses]

---
**Built on SIP** — Crypto / House of On-Chain · contract-trace · <yyyy-mm-dd> · SIP v1.1.0
---
```

## Quality gates

- [ ] R5 clause inline
- [ ] All contracts in trace identified with proxy / audit / multisig / governance attributes
- [ ] Risk patterns flagged (or "no risk patterns surfaced" with reasoning)
- [ ] Mechanism context per significant interaction
- [ ] Uncertainty flagged
- [ ] Composes-with declared
- [ ] Named artifact written
- [ ] "Built on SIP" footer

## Rules

- **Every contract gets the full attribute set** (proxy / upgrade-authority / audit / multisig / governance). No skipping for "low-importance" contracts — risk often hides in the unmonitored layers.
- **Trace tooling is one input, not the only input.** Cross-check against block-explorer ground-truth.
- **Audit status is a signal, not a proof.** A clean audit doesn't mean the contract is safe; an absent audit doesn't mean it's unsafe. Characterize; don't conclude.

---

**Built on SIP** — /crypto-onchain-contract-interaction · v0.1 proof-of-pattern · SIP v1.1.0
