---
date: 2026-05-29
convened: 2026-05-28
command: /starlight-board
tier: substrate (STACK.md § Composition Layer)
proposal: Wealth IS Composition Layer falsifier — fires 2026-06-16
verdict: REVISE
---

# Starlight Board — Wealth IS Composition Layer falsifier

**Convened:** 2026-05-28 (recorded 2026-05-29)
**Deadline under test:** 2026-06-16 (30 days post-2026-05-17 declaration)
**Days remaining at convene:** 19

## Context

`STACK.md` § Composition Layer falsifier (and `verticals/wealth/README.md:84`):

> If `verticals/wealth/commands/` is empty at 30 days post-declaration, the composition-layer concept failed for Wealth IS — collapse to ACL-only role (declarative reference, no operational commands). Deadline: 2026-06-16.

State at convene: `verticals/wealth/commands/` does not exist. Only `/wealth-dpi` ships, and it lives at `.claude/commands/wealth-dpi.md` — not the falsifier's required path. The falsifier requires ≥3 **cross-domain** commands (rules above Crypto + Investment sub-stacks), distinct from Wealth's existing per-IS framework commands (dpi / thesis / gate).

## Proposal under test

Choose among:
- **(A) SHIP** ≥3 cross-domain Wealth commands at `verticals/wealth/commands/` before 2026-06-16
- **(B) AMEND** the falsifier to count the existing per-IS commands
- **(C) let it COLLAPSE** to ACL-only as the falsifier designed

## Board

**Sovereign** (ambition + irreversibility): Shipping three commands *to beat a clock* is exactly the unearned-abstraction vanity the substrate is built to refuse — is a rushed composition layer worth your name on it? Collapse is fully reversible: the primitive stays defined in `STACK.md` for all 10 IS, and you can re-declare Wealth's instance the day a real cross-asset rule actually exists.

**Seer** (foresight + second-order): In 18 months, does a cross-asset allocation layer *above* Crypto + Investment IS reflect a real recurring decision you face, or a diagram you drew? Ship-to-pass mints maintenance surface for unvalidated demand — and the success case (commands exist, nobody runs them) is worse than the failure case.

**Harmonizer** (alignment + resistance): The falsifier *is* the prior commitment — amending it to credit dpi/thesis/gate breaks your own test, because those are per-IS framework commands, not the cross-domain composition commands the falsifier demands. Option B is the one move that violates a commitment already made; reject it.

**Strategist** (leverage + option value): Collapse-to-ACL preserves the most option value at the lowest cost — the composition primitive survives in `STACK.md`, Wealth IS simply doesn't instantiate operational commands until earned. A rushed ship unlocks only a passed test; it closes off the clean future where you build cross-asset commands against a real allocation decision.

**Verifier** (reality + execution cost): The cheapest experiment isn't three commands — it's naming *one* real cross-asset decision you face in the next 19 days (e.g. "what % across crypto + traditional sits in X given regime Y"). If you can name it, the first command writes itself; if you can't, the falsifier has already returned its verdict.

**Overseer**: The single most load-bearing concern — shipping commands to beat a falsifier *inverts the falsifier's purpose*, which is to kill abstractions that didn't earn operational surface. The single strongest case for a ship — if a cross-asset allocation decision is genuinely queued, three real commands is a 2-3 hour build and the layer is legitimate. The deciding question is purely empirical: is there one real cross-domain decision in the next 19 days, or not?

## Verdict: REVISE

Don't ship-to-beat-the-clock and don't let it silently lapse. Make one explicit call before 2026-06-16:

- **If ≥1 genuine cross-asset decision is queued** → author 3 real cross-domain commands at `verticals/wealth/commands/`.
- **Else** → let the falsifier fire as designed; collapse Wealth IS to ACL-only (re-declarable later when demand emerges).
- **In all cases, reject Option B** — crediting existing per-IS commands games the test.

## Decision gate

Owner: Frank. Deadline: 2026-06-16. Default if no explicit decision: **collapse to ACL-only** (the falsifier's designed outcome — no action required, fully reversible).

---

**Built on SIP** v1.1.1 — substrate-tier board verdict · `/starlight-board` · functional-vector composition (canon-free)
