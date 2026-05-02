# Cross-repo distribution packets

> Documents that name where insights from `.intake/` should land in sibling repos. Never auto-written — Frank actions cross-party moves manually per the sovereignty clause.

## Pattern

When `/process-inbox` (or a manual processing session) finds an insight that belongs in a sibling repo rather than in SIS, it writes a distribution packet here. Each packet contains:

1. **Source** — which `.intake/` file the insight came from
2. **Target repo** — full path on the local machine
3. **Target file path** within that repo
4. **Status** — AWAITING manual move / GATED on `/starlight-board` / ARCHIVED
5. **Why this lives there, not in SIS** — sovereignty rationale
6. **What to drop** — content payload(s) ready to write
7. **Action checklist** — concrete steps for Frank

## Why we do not auto-write to sibling repos

- **Sovereignty.** Per SIP § 5, each repo has its own decision rights. SIS does not silently push content into another node's repo.
- **Brand register.** Each repo has its own canon (FrankX commercial / Arcanea mythic / private operator-tier). Auto-writes risk register pollution.
- **Attestation.** Cross-repo content needs explicit attestation; manual placement ensures the destination repo's `Built on SIP` chain is intact.

## Index

| Date | Packet | Target | Status |
|---|---|---|---|
| 2026-05-03 | [FrankX pricing + sprint landings](2026-05-03-frankx-pricing-and-sprint-landings.md) | `C:\Users\frank\FrankX` | Awaiting manual move |
| 2026-05-03 | [Arcanea Luminor sidebar (CopilotKit)](2026-05-03-arcanea-luminor-sidebar-copilotkit.md) | `C:\Users\frank\Arcanea` | Gated on `/starlight-board` |
| 2026-05-03 | [arcanea-flow Calculator pattern](2026-05-03-arcanea-flow-calculator-pattern.md) | `C:\Users\frank\arcanea-flow` | Gated on `/starlight-board` |
| 2026-05-03 | [ACOS productization](2026-05-03-agentic-creator-os-acos-productization.md) | `C:\Users\frank\agentic-creator-os` | Awaiting manual move |
| 2026-05-03 | [private/ PV-Lager instance](2026-05-03-private-pv-lager-energy.md) | `private/verticals/pv-lager/` | Gated on Energy IS ratification |

---

**Built on SIP** · Starlight Intelligence Protocol v1.1.0
