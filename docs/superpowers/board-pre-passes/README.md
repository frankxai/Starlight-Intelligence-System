# `/starlight-board` pre-pass packets

> Substrate-tier proposals waiting for `/starlight-board` ratification. Each packet is a fully-spec'd input ready to feed the board for pressure-testing.

## Why pre-pass packets exist

Per the **board-before-tag invariant** (`CLAUDE.md` v7.5.1+, naming reconciled v7.9.2 / 2026-05-03), substrate-level changes invoke `/starlight-board` BEFORE commit/tag. A pre-pass packet is the structured input the board reads:

- Proposal description
- Why it's substrate-tier (which load-bearing files / rules / taxonomy it touches)
- What ships if PROCEED
- What stays untouched if PROCEED
- Pre-pass questions per pressure vector (Sovereign / Seer / Harmonizer / Strategist / Verifier)
- Claude's pre-pass synthesis (not the board's verdict — just a structured starting point)

The board reads the packet, runs its 5+1 pressure test, and produces a verdict.

## How a packet becomes a board run

```
/starlight-board "<proposal title from packet>"
```

Frank (or a session acting on Frank's behalf) runs the command with the packet as input. The board produces a verdict (`PROCEED` / `REVISE` / `STOP`) with rationale. The verdict is then captured at `docs/boards/<topic>-<date>.md`.

If `REVISE`, the packet is updated with the revisions, and the board runs again. Packets do not become outdated — they are versioned and accumulate.

## Index — awaiting board verdict

| Date | Packet | Tier | Coupling |
|---|---|---|---|
| 2026-05-03 | [SovereignNode + Calculator + ValidationRequirement substrate addition](2026-05-03-calculator-validation-substrate.md) | Substrate (file contract + Domain Sub-Stack pattern + attestation) | Independent |
| 2026-05-03 | [Energy IS as 4th Domain Sub-Stack](2026-05-03-energy-is-domain-substack.md) | Substrate (adds Domain Sub-Stack) | Depends on Calculator/Validation packet |
| 2026-05-03 | [CopilotKit as standardized agent-UI runtime](2026-05-03-copilotkit-adoption.md) | Operational-leaning (cross-repo coupling) | Independent |

## Index — past verdicts

(none yet for this packet style — historical board verdicts pre-2026-05-03 lived under `docs/boards/`)

## Naming reconciliation

Per `CLAUDE.md` v7.9.2 (2026-05-03), `/starlight-board` is the canonical command for SIS-substrate-tier governance. `/luminor-board` remains available as the Arcanea-canonical variant for proposals that explicitly compose Arcanea canon (Guardian names, Vel'Tara, etc.) under CC-BY-NC. Same shape; different canon attribution.

---

**Built on SIP** · Starlight Intelligence Protocol v1.1.0
