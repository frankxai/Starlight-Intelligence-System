---
date: 2026-07-02
convened: 2026-07-02
command: /starlight-board
tier: substrate (VERTICALS.md + verticals/wealth/ ACL collapse + new vertical spawn)
proposal: Spawn verticals/investment-intelligence/ with the IIS engine; affirm Wealth IS collapse to ACL-only
verdict: PROCEED
---

# Starlight Board — Investment Intelligence vertical spawn + Wealth IS ACL affirmation

**Convened:** 2026-07-02, under Frank's directive to review and consolidate the agentic wealth / investor / finance OS ("god mode on — review our agentic wealth OS…").

**Prior board references:**
- `docs/boards/2026-05-17-crypto-investment-spawn.md` — Investment IS held behind R4 proof-of-pattern gate; export-hook doctrine (open question (c)); R5 non-advisory clause.
- `docs/boards/2026-05-29-wealth-composition-falsifier.md` — falsifier deadline 2026-06-16; default outcome: collapse to ACL-only. **No explicit decision was recorded by deadline; the default fired.**

---

## Context

Three findings from the 2026-07-02 estate-wide review (full record: `docs/strategic/2026-07-02-wealth-os-architecture-review.md`):

1. **The falsifier fired.** `verticals/wealth/commands/` was empty at 2026-06-16. Per the 2026-05-29 board's designed default, Wealth IS collapses to ACL-only. Yet `verticals/wealth/MEMORY.md` v0.3 (written 2026-06-19) still narrates the cross-asset commands as "declared" — an internal inconsistency this board resolves.
2. **The R4 gate is passed.** Crypto Intelligence shipped its proof-of-pattern (House of On-Chain) and subsequently the full 6-House scaffold (v0.2). The 2026-05-17 board held Investment IS "until v0.1-proof-pass" — that condition is met.
3. **The engine already exists.** `FrankX/iis/` (Investment Intelligence System) is a spec-complete finance decision swarm: 11 agents in 3 layers (5 analysis blind-parallel → 3 risk with veto-on-size-not-direction → portfolio-manager + chief-of-staff), explicit model routing, 5 JSON schemas including a ReasoningBank trajectory store, adapters (FRED / DefiLlama / OpenBB), human-gate above any non-DCA action, and a privacy boundary. It is unrecognized by the substrate and un-extractable by other practitioners while it lives only in a private repo.

## Proposal under review

1. **Spawn `verticals/investment-intelligence/`** with the IIS engine **copied** (not moved) from `FrankX/iis/`. FrankX keeps the private operator instance (real portfolio data, `private/` state); Starlight carries the canonical pattern substrate.
2. **Affirm the falsifier outcome:** `verticals/wealth/` becomes an ACL-only composition manifest — a declarative reference pointing at the operational surfaces (FrankX wealth-ops, `/wealth-dpi`, `verticals/crypto-intelligence/`, `verticals/investment-intelligence/`) — with `MEMORY.md` corrected to record the collapse honestly. Re-declarable later per the falsifier's design.
3. **Add a fail-closed trade-gate MCP** inside the new vertical, mirroring `payment-intelligence-system/mcp` (approval tokens, caps, append-only JSONL audit, paper-broker default, live-broker adapters stubbed). Trading is a distinct risk domain from payments; the payments repo's charter ("no autonomous money movement, ever" — for payments) is respected by reusing the code shape, not the repo.
4. **Persona surfaces:** zero-terminal wealth-guardian template in `integrations/starter-packs/friend-starter/` (protected-executor persona); premium `investor-os-pack` in `agentic-business-os`; public OSS extraction to `github.com/frankxai/investment-intelligence-system` deferred to a Frank-local runbook (repo does not exist yet; out of this session's scope).

## Invariants (non-waivable, carried from prior boards)

- **R5 non-advisory clause** inline on every investment output: *"This is system architecture, not financial / investment / tax advice. Outputs frame decisions; jurisdiction-specific counsel signs off on instruments. The practitioner accepts capital risk; the substrate accepts no claim."*
- **Human gate above any non-DCA action.** The trade-gate MCP has no path to a live order without an explicit human approval token. DCA-whitelist auto-approval is the only exception, and it is still capped and audited.
- **No broker credentials in any repo.** Live adapters ship as stubs that throw `NOT_WIRED`; wiring happens on Frank's machine only.
- **Paper-by-default.** The only functional broker adapter in-repo is the paper broker.
- **Instance €-state stays private.** Engine patterns are MIT; balances, gate values, deal flow never land in Starlight or any public surface. `iis/scripts/privacy-check.mjs` logic gates every copy.
- **10-IS taxonomy NOT touched.** Wealth stays row #2; Investment Intelligence is a Domain Sub-Stack beneath it, symmetric with Crypto Intelligence.

## Board verdict (≤3 sentences per vector)

**Sovereign:** Promoting an engine that already exists and is already Frank's is the opposite of unearned abstraction — the 2026-05-17 board's concern was scaffolding before corpus, and the corpus (11 agents, 5 schemas, 4 commands, adapters, examples) has since been written against real practice. Copy-not-move preserves the private instance's sovereignty; the sovereignty clause extends to any practitioner who forks the vertical.

**Seer:** The blast-radius concern (readers mistake allocation output for advice) is answered structurally: R5 clause inline, human gate in code (not just doctrine), paper default, and an eval red/blue lane whose red objective is precisely "obtain a live order without approval." The 18-month failure mode — three wealth surfaces drifting apart — is exactly what shipping the composition manifest + one canonical vertical prevents.

**Harmonizer:** This closes the open inconsistency (MEMORY v0.3 vs falsifier default) rather than papering over it, honoring the 2026-05-29 board's own rejection of Option B. Investment IS spawning now honors the R4 sequencing the 2026-05-17 board demanded; nothing here re-litigates a prior commitment.

**Strategist:** The triad topology (Starlight canonical / FrankX private operator / business-os premium pack) is the same three-register split already proven for the creator stack, and the export hook (vertical-local files, copy-not-refactor extraction) was mandated by open question (c) in 2026-05-17. Option value: any practitioner can fork the vertical without inheriting Frank's data; Frank can extract the public repo whenever demand shows.

**Verifier:** The cheapest real test ships in the same change: a trade-gate MCP with a red e2e test ("live execute without approval must throw") that CI can run forever, plus schema validation for every engine file copied. If the engine patterns are as real as claimed, `validate-schemas.mjs` passes against the copies unchanged — and it does.

**Overseer:** The single most load-bearing fact is that this spawn imports proven material rather than inventing new substrate concepts — zero novel tiers, one new vertical under an existing pattern, one MCP under an existing code shape. The strongest residual risk is maintenance surface (two copies of the engine); the PRIVACY-BOUNDARY sync rule (engine files flow FrankX → Starlight, data never) bounds it.

## Verdict: PROCEED

Conditions (all landed in the same change-set as this record):

1. `verticals/wealth/README.md` rewritten as ACL composition manifest; `MEMORY.md` v0.4 records the collapse and corrects v0.3.
2. `verticals/investment-intelligence/` scaffolded from `_template` with the IIS engine copied under `engine/`, R5 clause in SOUL/SKILL, daily-5 declared (R2 discipline).
3. Trade-gate MCP with passing tests including the fail-closed red test.
4. `VERTICALS.md` + `REGISTRY.md` registration; `workflows/wealth/` superseded to point at the real topology.
5. `starlight-evals` gains an `investment-gate` red/blue lane.
6. Draft PRs only — Frank merges; nothing deploys from this session.

---

**Built on SIP** · Starlight Intelligence Protocol v1.1.1
- Layers used: [file-contract, attestation, sovereignty, commands]
- Board: 5 vectors + Overseer, canon-free Starlight register
- Generated: 2026-07-02
- Attestation is compounding, not credit transfer: every composition strengthens every node.
---
