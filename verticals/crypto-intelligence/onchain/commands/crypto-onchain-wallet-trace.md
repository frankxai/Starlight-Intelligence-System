---
name: crypto-onchain-wallet-trace
description: Trace a single wallet's recent activity + risk surface. Used when /crypto-onchain-flow-snapshot flags an address or when the practitioner needs a deep-dive on a specific wallet. Ships wallet-trace-<address-short>-<date>.md.
allowed-tools: Read, Write, Grep, Glob, WebFetch
argument-hint: <address> [--days 30]
vertical: crypto-intelligence
house: onchain
tier: Domain Sub-Stack Tier
---

# /crypto-onchain-wallet-trace

Load `verticals/crypto-intelligence/SOUL.md`, `verticals/crypto-intelligence/SKILL.md`, `verticals/crypto-intelligence/onchain/agent.md`, `verticals/crypto-intelligence/onchain/skill.md`, `verticals/crypto-intelligence/onchain/knowledge.md`.

## Input

$ARGUMENTS — address (required), optional `--days <n>` (default 30)

## R5 non-advisory clause (mandatory inline)

> *This is system architecture, not financial / investment / tax / legal advice. Outputs frame decisions; jurisdiction-specific counsel signs off on instruments. The practitioner accepts capital risk; the substrate accepts no claim. Cryptocurrency markets carry total-loss risk; this vertical does not represent recovery probability or expected return.*

## Process

### Step 1 — Resolve address

- Validate address format (per chain: 0x… for EVM, base58 for Solana, bech32 for Cosmos, etc.)
- Detect chain from address shape (or fail-soft to user clarification)
- Reject obviously-invalid input

### Step 2 — Entity attribution

- **Nansen label:** retrieve if available; cite confidence
- **Arkham entity:** retrieve if attributed; cite confidence band
- If anonymous → flag as "unattributed wallet" — no name-inference allowed (refusal pattern #6)

### Step 3 — Activity trace

For the `--days` window:
- Recent txs sorted by recency + value
- Counterparty wallets (Nansen labels where available)
- Protocols interacted with (DefiLlama protocol slugs)
- Token holdings delta over window
- Bridge activity (cross-chain movements)

### Step 4 — Risk surface flagging

- **Proxy / multisig changes** — was the wallet a signer on a multisig that changed configuration?
- **Governance votes** — any governance participation; if so, on which proposals + side
- **MEV exposure** — txs routed through public mempool vs. MEV-Protect; sandwich-vulnerable swap patterns
- **Bridge risk** — bridges used + bridge type (lock-and-mint vs burn-and-mint vs liquidity-network)
- **Contract approval surface** — open token approvals to risky contracts

### Step 5 — Mechanism context

For each significant interaction: name the mechanism. Same wallet swap on Uniswap V3 vs. CoW vs. 1inch is three different MEV-exposure profiles.

### Step 6 — Compose-with downstream

- Sister Houses (v0.2): House of Sovereignty if custody-pattern signal; House of Allocation if position-sizing signal; House of Research if tokenomics signal
- Wealth IS umbrella: `/wealth-portfolio-fit` if the wallet is one of the practitioner's own positions

### Step 7 — Ship named artifact

Write to: `private/crypto-intelligence/onchain/artifacts/wallet-trace-<address-short>-<yyyy-mm-dd>.md` (instance-private for practitioner's own wallets; public-reference anonymized template at `verticals/crypto-intelligence/onchain/artifacts/wallet-trace-example.md`)

## Output shape

```markdown
# Wallet Trace — <address-short> — <yyyy-mm-dd>

> [R5 non-advisory clause verbatim]

## Address
- Full: <address> (or [redacted] if practitioner-private)
- Chain: <chain>
- Entity attribution: <Nansen label / Arkham entity / unattributed> · confidence: <band>

## Window
- <ISO start> → <ISO end>
- Days: <n>

## Chain-data sources
- Nansen: <last-update>
- Arkham: <last-update>
- <Block explorer>: <verified tx-hashes>
- Dune query (if applicable): <id>

## Activity summary
- Tx count: <n> · Value moved: <amount> · Counterparties: <unique-n>

## Top counterparties (entity-tagged where available)
- [list with labels + tx-count + value]

## Protocols interacted with (DefiLlama-slug)
- [list with mechanism notes]

## Token holdings delta over window
- [token in/out per significant position]

## Risk surface
- Proxy/multisig changes: <flagged / none>
- Governance: <proposals + side, if any>
- MEV exposure: <patterns>
- Bridge activity: <bridges + types>
- Open token approvals: <risky-contract flags>

## Mechanism notes
- [per-interaction mechanism citations]

## Uncertainty flags
- [where entity-attribution is ambiguous; where MEV-vs-arbitrage classification is contested]

## Composes-with downstream
- Feeds: [sister Houses / Wealth IS umbrella as applicable]

---
**Built on SIP** — Crypto / House of On-Chain · wallet-trace · <yyyy-mm-dd> · SIP v1.1.0
---
```

## Quality gates

- [ ] R5 clause inline
- [ ] Entity attribution cited with confidence band
- [ ] Activity trace covers full --days window
- [ ] Risk-surface flagged (or "no risk patterns surfaced" with reasoning)
- [ ] Mechanism context for significant interactions
- [ ] Uncertainty flagged where ambiguous
- [ ] Composes-with declared
- [ ] Named artifact written
- [ ] "Built on SIP" footer

## Rules

- **No name-inference for unattributed wallets.** "Anonymous wallet" stays anonymous unless tag-sourced (refusal pattern #6).
- **No "wallet X is bullish/bearish" framing.** Activity is activity; thesis comes from House of Research at v0.2.
- **Practitioner-own wallets: redact address in any public-reference output.**

---

**Built on SIP** — /crypto-onchain-wallet-trace · v0.1 proof-of-pattern · SIP v1.1.0
