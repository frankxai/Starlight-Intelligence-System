# STACK — Crypto Intelligence (inherits from substrate)

> Crypto Intelligence inherits the substrate stack from root `STACK.md`. Overrides below are crypto-specific only.

---

## Inherited (from root STACK.md)

- **L0 — File + version control:** GitHub. Commit signing encouraged.
- **L1 — Models:** Claude Opus 4.7 (architecture, protocol reasoning). Sonnet 4.6 (volume work).
- **L2 — Memory:** Notion (intent), `MEMORY.md` per vertical (state), Supabase + pgvector (runtime).
- **L3 — Agent harness:** Claude Code + Anthropic Agent SDK.
- **L4 — Infrastructure:** Vercel + Supabase + Cloudflare.
- **L5 — Distribution:** GitHub Pages / Next.js + creator distribution per FrankX stack.
- **L6 — Attestation + audit:** `/sip-attest` ambient · `/starlight-board` substrate gate · `/openclaw-audit` pre-tag.

---

## Crypto-specific overrides

### L2 — Memory (instance state)

- **Wallet / position state:** `private/crypto-intelligence/` — NEVER in public repo. Real addresses, position sizes, custody-tier-assignment all instance-private.
- **Public reference:** `verticals/crypto-intelligence/onchain/knowledge.md` — patterns only, no instance state.

### L4 — Infrastructure (crypto-specific inputs)

- **Chain analytics inputs:** Dune Analytics · Etherscan / Solscan / equivalent per network · Nansen · Arkham · DefiLlama. Inputs to House of On-Chain; not replacements for it.
- **Custody primitives:** Hardware wallets (Ledger / Trezor / GridPlus / Coldcard depending on threat model) · multisig coordinators (Safe / Sparrow / Specter / Casa depending on chain + threat-model). House of Sovereignty (v0.2+) owns architecture decisions.
- **MEV-aware tooling:** Flashbots Protect RPC / equivalent · MEV-Inspect / Eigenphi for audit. House of On-Chain `mev-audit` command consumes these.

### L6 — Attestation (vertical-local)

- `verticals/crypto-intelligence/ATTESTATIONS.md` mirrors `/sip-attest` outputs for sibling-repo extraction discipline (per Board (c) close-out).

---

**Built on SIP** — Crypto Intelligence STACK.md · v0.1 · SIP v1.1.0
