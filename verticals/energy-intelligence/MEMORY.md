# Energy Intelligence — Memory

> Durable state, commitments, open forks — for the public reference vertical itself, not for sovereign instances.

## Status

Stub v0.1.0-scaffold. Sovereign instances (e.g., PV-Lager) carry their own MEMORY.md inside `private/verticals/<instance>/`.

## Open forks

| Fork | Decision needed | Pending on |
|---|---|---|
| Agent layer | When to author the 7 agent files (`agents/starlight-energy-{sizing,cost,installer,operations,buyer,grid,recovery}.md`) | v8.x scope after substrate stabilizes |
| Command layer | When to author 20-30 `.claude/commands/energy-*.md` files | After agent layer; v8.x scope |
| Calculator implementations | Which jurisdictions ship Calculator implementations first (DE for PV-Lager? US-CA next?) | Frank decision per pilot scope |
| Cross-repo placement | Whether the Energy IS reference adopters should fork into their own repos or stay sovereign-instance under SIS `private/` | Per-adopter decision |

## Recent commitments

- 2026-05-03 — Vertical scaffold ratified by `/starlight-board`. Foundation files (this 7-file contract) shipped. Substrate composition declared (`@starlight/schemas` + `@starlight/calculators` + `@starlight/validation`).
- 2026-05-03 — PV-Lager sovereign instance flagged for `private/verticals/pv-lager/` placement. Cross-repo distribution packet at `docs/cross-repo-distributions/2026-05-03-private-pv-lager-energy.md`.

## Refusals logged

- ChatGPT's 9-domain taxonomy attempt (rejected via PR #10) suggested "Energy" as a peer Intelligence System. Repo's locked v7.5 10-IS taxonomy wins; "Energy" enters as a Domain Sub-Stack via `/spawn-domain-stack`, NOT as a peer IS layer. Distinction matters.

## Audit trail

Every shipped artifact in this vertical carries `Built on SIP` attestation per the substrate. The audit trail lives in commit history + `docs/boards/2026-05-03-energy-is-domain-substack.md` (the ratification record).

## Cross-cutting memory references

- Substrate ratification: `docs/boards/2026-05-03-calculator-validation-substrate.md`
- This vertical's ratification: `docs/boards/2026-05-03-energy-is-domain-substack.md`
- Sovereign instance pattern: `private/verticals/pv-lager/INSTANCE.md` (when scaffolded)

---

**Built on SIP** · Starlight Intelligence Protocol v1.1.0
- Scaffold: 2026-05-03
