---
name: crypto-onchain-flow-snapshot
description: Generate weekly wallet-flow + whale-tracking pulse for the practitioner's current portfolio addresses + watchlist wallets. Surfaces direction-of-flow changes, velocity shifts, whale activity, and concentration risk. Composes with /wealth-portfolio-fit downstream.
allowed-tools: Read, Write, Grep, Glob, WebFetch
argument-hint: <wallet-slug-or-watchlist-tag> [--window 7d|30d]
vertical: crypto-intelligence
house: onchain
tier: Domain Sub-Stack Tier
---

# /crypto-onchain-flow-snapshot

Load `verticals/crypto-intelligence/SOUL.md`, `verticals/crypto-intelligence/SKILL.md`, `verticals/crypto-intelligence/onchain/agent.md`, `verticals/crypto-intelligence/onchain/skill.md`, `verticals/crypto-intelligence/onchain/knowledge.md`, `genius/profile-frankx.md` (for voice grounding).

## Input

$ARGUMENTS — wallet-slug or watchlist-tag, optional `--window` (default 7d)

## R5 non-advisory clause (mandatory inline — emit at top of output artifact)

> *This is system architecture, not financial / investment / tax / legal advice. Outputs frame decisions; jurisdiction-specific counsel signs off on instruments. The practitioner accepts capital risk; the substrate accepts no claim. Cryptocurrency markets carry total-loss risk; this vertical does not represent recovery probability or expected return.*

## Process

### Step 1 — Resolve scope

- Parse wallet-slug or watchlist-tag from $ARGUMENTS
- Load watchlist definition from `private/crypto-intelligence/watchlists/<tag>.md` (instance-private)
- Window default: 7 calendar days (`--window 30d` for monthly pulse, etc.)
- If no watchlist exists for the tag → halt with corpus-required message + suggest `/crypto-onchain-wallet-trace` for single-wallet first

### Step 2 — Gather chain-data

Per knowledge.md methodology:
- **Dune Analytics:** query the watchlist's flow-snapshot dashboard (per-watchlist query ID maintained in `private/`)
- **Nansen:** retrieve smart-money labels + entity tags for watchlist wallets
- **Arkham:** entity-attribution for unlabeled flow recipients
- **Etherscan / Solscan / equivalent:** verify any anomalous tx flagged by Dune

Cite all sources explicitly (query IDs + wallet labels + entity tags + last-update timestamps) in artifact.

### Step 3 — Pattern recognition

For the window:
- **Direction-of-flow change** — net inflow / net outflow per wallet, vs. prior window. Flag deltas >2σ from rolling baseline.
- **Velocity shift** — number of distinct counterparties per wallet, vs. baseline. Acceleration is signal.
- **Whale activity** — entity-tagged wallets entering / exiting positions in protocols the practitioner is exposed to.
- **Concentration risk** — for the practitioner's own portfolio addresses, surface concentration shifts (single-protocol / single-chain exposure changes).

### Step 4 — Cite mechanism context for flagged activity

For each flagged movement: name the mechanism (swap routing, bridge type, staking, governance vote, etc.). No "wallet X swapped" without "via mechanism M with property P."

### Step 5 — Flag interpretive uncertainty

- Wallet-attribution ambiguity (Nansen label confidence, Arkham confidence band)
- Mechanism inference uncertainty (CEX-deposit-vs-cold-storage-move when address is unlabeled)
- MEV-vs-arbitrage classification edge cases

### Step 6 — Compose-with downstream

Declare explicitly which sister Houses' commands this artifact feeds:
- House of Allocation (v0.2): `Feeds: /crypto-alloc-sizing` if concentration risk flagged
- House of Sovereignty (v0.2): `Feeds: /crypto-sov-custody-design` if custody-pattern shift detected
- Wealth IS umbrella: `Feeds: /wealth-portfolio-fit` always (concentration-risk inputs)
- House of Macro (v0.2): `Feeds: /crypto-macro-regime` if stablecoin-flow shift detected

### Step 7 — Ship the named output artifact

Write to: `private/crypto-intelligence/onchain/artifacts/flow-snapshot-<yyyy-ww>.md` (instance-private — real wallet addresses stay private)
Public-reference template at: `verticals/crypto-intelligence/onchain/artifacts/flow-snapshot-example.md` (anonymized — for fork reference)

## Output shape

```markdown
# Flow Snapshot — <watchlist-tag> — <yyyy-ww>

> [R5 non-advisory clause — verbatim per SOUL.md]

## Scope
- Window: <ISO start> → <ISO end>
- Watchlist: <tag> (<n> wallets)
- Practitioner portfolio addresses: <n> (private — addresses not enumerated)

## Chain-data sources
- Dune query ID: <id> · last-update: <timestamp>
- Nansen labels: <last-update timestamp>
- Arkham entities: <last-update timestamp>
- Etherscan / Solscan / etc.: spot-verified anomalies

## Direction-of-flow changes
- <wallet-label or anonymized>: net <inflow/outflow> <delta σ from baseline>
- mechanism: <swap routing / bridge type / etc.>
- uncertainty flag: <if any>

[repeat per flagged movement]

## Velocity shifts
- [per-wallet velocity changes + baseline comparison]

## Whale activity (entity-tagged)
- [per-entity activity + protocol exposure]

## Concentration risk (practitioner portfolio)
- [protocol / chain / mechanism concentration shifts]

## Composes-with downstream
- Feeds: /wealth-portfolio-fit (concentration-risk inputs)
- Feeds: [sister Houses if flagged]

---
**Built on SIP** — Crypto / House of On-Chain · flow-snapshot · <yyyy-ww> · SIP v1.1.0
---
```

## Quality gates

- [ ] R5 non-advisory clause inline at top
- [ ] All chain-data sources cited (Dune query ID + Nansen + Arkham + Etherscan if used)
- [ ] Mechanism context provided for each flagged movement
- [ ] Interpretive uncertainty flagged where ambiguous
- [ ] Composes-with declared for at least one downstream consumer
- [ ] Named output artifact written to `private/crypto-intelligence/onchain/artifacts/flow-snapshot-<yyyy-ww>.md`
- [ ] "Built on SIP" attestation block at footer

## Rules

- **Real wallet addresses in artifact stay private.** Public-reference output is anonymized; instance-private output carries real addresses.
- **No "smart money is buying" theses without mechanism citation** (refusal pattern #1).
- **Velocity-stats without baseline comparison are refused** — context-free deltas are useless.
- **If no watchlist exists → halt to corpus-required message; do not fabricate watchlist.**

---

**Built on SIP** — /crypto-onchain-flow-snapshot · v0.1 proof-of-pattern · SIP v1.1.0
