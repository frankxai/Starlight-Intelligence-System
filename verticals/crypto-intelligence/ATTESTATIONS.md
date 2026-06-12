# ATTESTATIONS — Crypto Intelligence vertical-local ledger

> Per Board open-question (c) close-out (2026-05-17): vertical-local ATTESTATIONS.md exists at v0.1 so sibling-repo extraction at v0.2+ is a copy operation, not a refactor. When `github.com/frankxai/crypto-intelligence-system` is spawned as a separate sovereign repo, this ledger ships with it as-is.

---

## Purpose

Mirror of `/sip-attest` outputs for every public Crypto Intelligence artifact. Vertical-local ledger so attestation history travels with the vertical when extracted to sibling repo.

## Format

```
### [<ISO date>] — <artifact-title>

**Artifact:** <path or URL>
**Composition with:** Wealth IS composition layer (always, v0.1+) · <other IS/canon if any>
**Houses contributing:** <House of On-Chain · etc.>
**Voice:** architect (primary, per AGENTS.md)
**Commit SHA:** <pending until ship>

---
[Embedded /sip-attest block]
---
```

---

## Entries

### [2026-05-17] — Crypto Intelligence v0.1 proof-of-pattern spawn

**Artifact:** `verticals/crypto-intelligence/` (README.md, SOUL.md, SUB-SYSTEMS.md, onchain/ + 5 command stubs)
**Composition with:** Wealth IS composition layer (first composition-instance per `STACK.md` declaration 2026-05-17)
**Houses contributing:** House of On-Chain (scaffolded); Houses Macro / DeFi / Sovereignty / Research / Allocation (gated on v0.1-proof-pass)
**Voice:** architect (primary, per AGENTS.md voice mappings)
**Commit SHA:** pending 2026-05-17 commit
**Board verdict:** `docs/boards/2026-05-17-crypto-investment-spawn.md` — REVISE close-outs R1/R2/R3/R4/R5 + (c) addressed
**Genius prerequisite gate:** `genius/profile-frankx.md` + `genius/freedom-path-frankx.md` (shipped 2026-05-17)

---

```
---
**Built on SIP** — Starlight Intelligence Protocol

Substrate: starlightintelligence.org/protocol v1.1.0
Layers used: [file-contract, attestation, commands, sovereignty]

Verticals:
- starlight-intelligence-system@23cace2 · vertical: verticals/crypto-intelligence/ · v0.1 proof-of-pattern · House of On-Chain scaffolded · 5 commands stubbed
- starlight-intelligence-system@23cace2 · composition-layer: verticals/wealth/ v0.2 · first reference instance of Composition Layer substrate primitive (R1.a + R3.a close-outs)

Canon:
- none · Crypto Intelligence declines canon at the vertical layer · composition with Arcanea canon optional but not adopted

Nodes:
- Frank Riemer · role: architect + sovereign-creator + protocol-defender + implementer · single-sovereign authorship · synthesis edge from genius/profile-frankx.md (Oracle-grade × Composer-Gamer × Sovereign multi-vertical × Sovereignty-first × Genuine care)

Board:
- /starlight-board 2026-05-17 · verdict: REVISE → 5 items close-out same-session (R1/R3 Frank-acked; R2/R4/R5 operational; (c) export hook landed)

Generated: 2026-05-17
Attestation is compounding, not credit transfer: every composition strengthens every node.
---
```
### [2026-05-29] — Crypto Intelligence v0.2 fully active sub-stack ship

**Artifact:** `verticals/crypto-intelligence/` (Macro, DeFi, Sovereignty, Research, Allocation fully scaffolded and active with 20 total commands)
**Composition with:** Wealth IS composition layer (fully integrated; feeds DPI ledger, cycle-thesis, sovereignty-design, thesis engine)
**Houses contributing:** House of On-Chain, House of Macro, House of DeFi, House of Sovereignty, House of Research, House of Allocation (all six fully shipped at v0.2)
**Voice:** architect (primary, per AGENTS.md voice mappings)
**Commit SHA:** pending 2026-05-29 commit
**Board verdict:** Approved for v0.2 ship under Board R4 passing falsifier proof-of-pattern.
**Genius prerequisite gate:** `genius/profile-frankx.md` + `genius/freedom-path-frankx.md` (shipped)

---

```
---
**Built on SIP** — Starlight Intelligence Protocol

Substrate: starlightintelligence.org/protocol v1.1.1
Layers used: [file-contract, attestation, commands, sovereignty]

Verticals:
- starlight-intelligence-system@v8.0.0 · vertical: verticals/crypto-intelligence/ · v0.2 fully shipped · All 6 Houses active · 20 commands shipped
- starlight-intelligence-system@v8.0.0 · composition-layer: verticals/wealth/ v0.2 · Composition Layer substrate primitive fully active

Nodes:
- Frank Riemer · role: architect + sovereign-creator + protocol-defender + implementer · single-sovereign authorship · synthesis edge from genius/profile-frankx.md (Oracle-grade × Composer-Gamer × Sovereign multi-vertical × Sovereignty-first × Genuine care)

Board:
- /starlight-board 2026-05-29 · verdict: PROCEED with v0.2 ship, falsifier passed, dynamic discovery active

Generated: 2026-05-29
Attestation is compounding, not credit transfer: every composition strengthens every node.
---
```

---

## Sibling-repo extraction protocol (when triggered)

When a sovereign-forker requests Crypto IS as standalone (or Frank decides v0.2 timing is right per Board open-question (c)):

1. `cp -r verticals/crypto-intelligence/ ../crypto-intelligence-system/`
2. Adjust `STACK.md` pointer in extracted repo to reference SIS via composition-with declaration, not via path
3. Update `verticals/crypto-intelligence/README.md` in SIS to point at sibling repo
4. Continue both: SIS retains the vertical as reference scaffold; sibling repo carries operational instance
5. ATTESTATIONS.md mirrors in both

The MCP-shape declaration in `SKILL.md` is the export contract — sibling repo presents the same MCP tool surface to consumers.

---

**Built on SIP** — Crypto Intelligence ATTESTATIONS.md · v0.2 fully shipped · SIP v1.1.1 (v0.2 full scaffold live 2026-05-29)
