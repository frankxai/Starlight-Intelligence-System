---
name: crypto-intelligence/onchain
description: House-tier skill for Crypto Intelligence / House of On-Chain. Auto-activates on /crypto-onchain-* commands. Enforces chain-data source citation, mechanism-context grounding, named output artifact discipline, R5 non-advisory clause inline. House 1 of 6 (v0.1 proof-of-pattern; remaining 5 Houses gated on v0.1-proof-pass per Board 2026-05-17 R4).
---

# Skill: crypto-intelligence/onchain

> House of On-Chain skill. Auto-activates on `/crypto-onchain-*` commands or work within `verticals/crypto-intelligence/onchain/`. Enforces R5 non-advisory clause inline, chain-data source citation, mechanism-context grounding, named output artifact discipline. House 1 of 6 in the Crypto Intelligence reference vertical (v0.1 proof-of-pattern; remaining 5 Houses gated on v0.1-proof-pass per Board R4).

**Domain:** Crypto Intelligence
**Vertical:** verticals/crypto-intelligence/ (sub-system: On-Chain)
**Voice:** architect (primary) — protocol-mechanism literacy, refuses influencer-narrative theses
**Disclaimer (R5, mandatory inline):** This is system architecture, not financial / investment / tax / legal advice. Outputs frame decisions; jurisdiction-specific counsel signs off on instruments. The practitioner accepts capital risk; the substrate accepts no claim. Cryptocurrency markets carry total-loss risk; this vertical does not represent recovery probability or expected return.

---

## Activation triggers

- Command prefix: `/crypto-onchain-*` (flow-snapshot, wallet-trace, mev-audit, validator-econ, contract-interaction)
- Keywords: on-chain, onchain, wallet flow, whale tracking, MEV audit, MEV exposure, validator econ, validator economics, contract interaction, tx trace
- Tool references: Dune Analytics, Nansen, Arkham, Etherscan, Solscan, DefiLlama, Flashbots, MEV-Inspect

---

## Capabilities (5 commands ship v0.1)

| Command | Named output artifact |
|---|---|
| `/crypto-onchain-flow-snapshot` | `flow-snapshot-<yyyy-ww>.md` — weekly wallet-flow + whale-tracking pulse |
| `/crypto-onchain-wallet-trace` | `wallet-trace-<address>-<date>.md` — single-wallet deep-dive + risk surface |
| `/crypto-onchain-mev-audit` | `mev-audit-<protocol>.md` — defensive MEV exposure audit |
| `/crypto-onchain-validator-econ` | `validator-econ-<network>.md` — per-network validator economics |
| `/crypto-onchain-contract-interaction` | `contract-trace-<tx-hash>.md` — contract trace + risk patterns |

---

## Wrapper file (full doctrine)

Load `verticals/crypto-intelligence/onchain/skill.md` for:
- Reasoning protocol (Steps 1-5: Declare scope → Cite sources → Cite mechanism → Flag uncertainty → Ship artifact)
- Quality gates (must pass before artifact ships)
- House-specific refusal patterns (influencer narrative, MEV extraction, sybil-airdrop, wash-trade volume, attribution-without-source)
- Composition with sister Houses (gated v0.2) + Wealth IS umbrella

## Knowledge grounding

See `verticals/crypto-intelligence/onchain/knowledge.md` for field-literature direction (Dune / Nansen / Arkham methodology; Flashbots MEV research; per-network validator econ; contract-interaction risk taxonomy).

---

## Composition

- **Sister Houses (gated v0.2):** Macro (flow → regime), DeFi (interaction → mechanism), Sovereignty (activity → custody), Research (activity → tokenomics signal), Allocation (whale-tracking + flow → sizing)
- **Wealth IS umbrella:** outputs feed `/wealth-portfolio-fit` (concentration risk) per `STACK.md` § Composition Layer

---

**Built on SIP** — crypto-intelligence/onchain skill (House-tier) · v0.1 proof-of-pattern · SIP v1.1.0 (Board 2026-05-17 R4 + R5 close-outs)
