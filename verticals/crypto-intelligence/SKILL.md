---
name: crypto-intelligence
description: Vertical-tier skill auto-activates when working inside verticals/crypto-intelligence/ or invoking any /crypto-* command. Enforces R5 non-advisory clause, voice (architect), refusal patterns, composition-with-Wealth-IS rules, and sovereignty discipline.
triggers:
  - keywords [crypto, cryptocurrency, blockchain, on-chain, wallet, defi, validator, mev, custody, multisig]
  - command-prefix /crypto-*
  - working-directory verticals/crypto-intelligence/
---

# SKILL — Crypto Intelligence (vertical-tier)

> Vertical-tier skill loads when working inside Crypto Intelligence. Enforces the wrapper rules so the Houses inherit them automatically — voice, refusal patterns, R5 non-advisory clause, sovereignty discipline, composition with Wealth IS umbrella, attestation discipline.

---

## When this skill fires

- Working inside `verticals/crypto-intelligence/`
- Invoking any `/crypto-*` command (`/crypto-onchain-flow-snapshot`, `/crypto-onchain-wallet-trace`, `/crypto-onchain-mev-audit`, etc.)
- User asks about cryptocurrency / blockchain / on-chain / DeFi / validator / MEV / custody / multisig topics within the Crypto Intelligence context
- Cross-asset commands at Wealth IS umbrella (`/wealth-portfolio-fit`, `/wealth-cycle-thesis`, `/wealth-sovereignty-design`) consume Crypto IS House outputs

---

## Inheritance (Houses inherit these)

Every House command output inherits from this skill:

1. **R5 non-advisory clause inline** (mandatory, non-waivable):
   > *This is system architecture, not financial / investment / tax / legal advice. Outputs frame decisions; jurisdiction-specific counsel signs off on instruments. The practitioner accepts capital risk; the substrate accepts no claim. Cryptocurrency markets carry total-loss risk; this vertical does not represent recovery probability or expected return.*

2. **Voice: architect (primary)** per `AGENTS.md` voice mappings. First-principles, decision-first, normative over descriptive, no hedging when structurally avoidable. Refuses influencer-shitposter cadence, institutional-research voice without sovereignty discipline, cypherpunk-zine tone.

3. **Refusal patterns** (per SOUL.md):
   - Concrete-sounding-stat-without-source (corruption mode — refused universally)
   - "Smart money" follow-theses without protocol-mechanism grounding (refused)
   - Execution-as-output (vertical organizes thinking; no automated trading)
   - Algorithmic-gaming plays / wash-trading-aware-of-it (refused)
   - Sample-without-clearance crypto narratives (refused — narrative-clearance discipline ports from Sound IS sample-clearance)
   - Custody recommendations defaulting to exchange-custody for friction-reduction (refused)
   - Cycle-blind sizing recommendations (refused — every sizing decision opens with current cycle-position thesis from House of Macro at v0.2+)

4. **Composition with Wealth IS** (per `STACK.md` § Composition Layer):
   - On-Chain → `/wealth-portfolio-fit` (concentration risk inputs)
   - Macro (v0.2) → `/wealth-cycle-thesis` (cross-asset cycle position)
   - Sovereignty (v0.2) → `/wealth-sovereignty-design` (cross-asset custody)
   - Research (v0.2) → Wealth IS Thesis engine (per R3.a)
   - Allocation (v0.2) → Wealth IS DPI ledger (per R3.a)

5. **Attestation discipline:** Every shipped artifact carries "Built on SIP" attestation block (ambient per v7.4). `ATTESTATIONS.md` ledger mirrors entries for sibling-repo extraction discipline (per Board open-question (c) close-out).

---

## MCP-shape declaration (for sibling-repo export hook — Board (c) close-out)

The Crypto Intelligence vertical exposes its operational surface via MCP tools so that when extracted to `github.com/frankxai/crypto-intelligence-system` at v0.2+, consumers see the same tool surface:

```yaml
mcp_tools_planned:
  - name: crypto_onchain_flow_snapshot
    description: Generate weekly wallet-flow + whale-tracking pulse for a wallet slug
    inputs: { wallet_slug: string }
    outputs: { artifact_path: string, regime_flag: enum }
  - name: crypto_onchain_wallet_trace
    description: Trace single wallet recent activity + risk surface
    inputs: { address: string, days: number }
    outputs: { artifact_path: string }
  - name: crypto_onchain_mev_audit
    description: MEV exposure audit for a protocol the practitioner uses
    inputs: { protocol_slug: string }
    outputs: { artifact_path: string, exposure_summary: object }
  - name: crypto_onchain_validator_econ
    description: Validator economics summary for a network
    inputs: { network_slug: string }
    outputs: { artifact_path: string }
  - name: crypto_onchain_contract_interaction
    description: Contract interaction trace + risk surface for a tx
    inputs: { tx_hash: string }
    outputs: { artifact_path: string, risk_flags: array }

mcp_resources_planned:
  - vault: crypto-intelligence/onchain/
  - corpus: crypto-intelligence/onchain/knowledge.md
  - sibling-repo-target: github.com/frankxai/crypto-intelligence-system (v0.2+ extraction target)
```

At v0.1, commands are markdown-doc shape (matches Sound IS / People IS pattern). MCP-tool exposure ships at v0.2+ if proof-pass succeeds AND the practice actually demands programmatic access (Verifier-defended falsifier).

---

## Process when invoked

1. **Load context** — `genius/profile-frankx.md` for voice grounding, `verticals/crypto-intelligence/SOUL.md` for non-negotiables, `verticals/wealth/README.md` for composition-layer rules, current House's `knowledge.md` for domain grounding.
2. **Verify R5 clause is inline** in output template before execution. If missing, abort and flag.
3. **Run House command** — produces named output artifact per `SUB-SYSTEMS.md` schedule.
4. **Embed attestation block** — ambient per v7.4; mirror entry to `ATTESTATIONS.md` for public artifacts.
5. **Surface composition outputs** — if the artifact feeds a Wealth IS composition command, name the upstream feed explicitly.

---

**Built on SIP** — Crypto Intelligence SKILL.md (vertical-tier) · v0.1 · SIP v1.1.0 (Board R5 + (c) close-outs 2026-05-17)
