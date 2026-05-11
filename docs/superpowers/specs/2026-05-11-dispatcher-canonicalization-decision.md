# Dispatcher Canonicalization — Decision Document

**Date:** 2026-05-11
**Tier:** substrate (touches orchestration contract + name register)
**Status:** UNRESOLVED — Frank decides between two valid options
**Pre-board:** `/starlight-board` required before commit/tag if the chosen option modifies `STACK.md` or `VERTICALS.md`
**Context:** Wave 2 / cluster B / B2 from `2026-05-11-jarvis-grade-design.md`

---

## The fork

Two dispatcher implementations exist concurrently:

1. **`@arcanea/orchestrator`** (`arco` binary) — Globally installed at v1.2.1, owns Claude/Codex/Gemini/OpenCode dispatch logic, 21/21 tests pass, verified 2026-05-06 in `STATUS-2026-05-06.md`. **Working dispatcher today.**
2. **`starlight dispatch`** (`src/cli.ts:703`) — Thin shell-out to `arco run`. As of Wave 2 / B1 (2026-05-11), passes `STARLIGHT_HARNESS_PROMPT` env var to arco for per-harness policy injection. **Bridge, not implementation.**

The substrate currently has two names for one capability. The fork is brand-level: does Starlight own the dispatcher name, or compose Arcanea's?

---

## Option A — Promote `arco` → `@starlight/orchestrator`

**The move:** Fork `@arcanea/orchestrator` → rename → publish under `@starlight/orchestrator` on npm → update SIS `src/cli.ts` to depend on the Starlight package → deprecate the Arcanea dependency.

**Pros**
- Starlight owns its full stack. No external runtime dependency on Arcanea for sovereign deploys.
- Aligns with SIP § 5 sovereignty clause — substrate composability without naming asymmetry.
- Easier to evolve: substrate-tier changes to dispatch don't need Arcanea coordination.
- Forks adopting SIP can use `@starlight/orchestrator` without inheriting Arcanea brand.

**Cons**
- One-time work: fork, rename, publish, cross-repo update across SIS + ACOS + GenCreator + library-os + Arcanea AI + Arcanea (the consumer repo). ~half-day.
- Bifurcates maintenance: bug fixes need to land in both Starlight and Arcanea packages for a while (unless `@arcanea/orchestrator` becomes a thin re-export of `@starlight/orchestrator`).
- Risks dispatcher-spec drift between the two names if maintainers diverge.
- npm namespace cost: Starlight Holding may want `@starlight` scope for other packages too — this is the precedent.

**Compatibility shim:** Publish `@arcanea/orchestrator@1.3.0` as a thin `module.exports = require('@starlight/orchestrator')` to avoid breaking existing arco users mid-flight.

---

## Option B — Adopt `arco` as Starlight's canonical dispatcher dependency

**The move:** Document `@arcanea/orchestrator` as the canonical SIS dispatcher dependency in `STACK.md` + `core/orchestrator/STATUS.md`. SIS continues to depend on the Arcanea package; `starlight dispatch` remains a thin bridge to `arco`. No fork, no rename.

**Pros**
- Zero migration work. Status quo + documentation.
- Arcanea team continues to own dispatcher evolution — natural fit since they built it.
- One name, one binary, one test suite — no bifurcation risk.
- Honest about provenance: SIS composes Arcanea's work, attributes it cleanly.

**Cons**
- SIS substrate has a runtime dependency on the Arcanea brand. Sovereign-deploy forks inherit "powered by Arcanea" attribution in their dispatcher chain.
- If Arcanea sunsets the package, SIS would need to fork on emergency timeline.
- Naming asymmetry persists — `starlight dispatch` shells out to `arco`, which feels weaker than `starlight` owning the namespace.
- Doesn't match the Frank-as-Starlight-Holding posture for substrate.

---

## Option C (hidden third option) — Vendor arco into SIS as `core/orchestrator/dispatcher/`

**The move:** Copy `@arcanea/orchestrator` source into `core/orchestrator/dispatcher/` as a SIS-internal package, keep upstream attribution, don't publish to npm.

**Pros**
- Sovereign code path without npm overhead.
- SIS still attributes Arcanea via NOTICE / SOURCE comments.
- No external dependency at runtime.

**Cons**
- Manual sync work whenever upstream Arcanea makes changes.
- Confuses the "one canonical source" pattern.
- Risks divergence faster than Option A's shim.

**Not recommended** — Option A's publish-with-shim is strictly better than vendoring.

---

## Decision matrix

| Criterion | A (promote) | B (adopt) | C (vendor) |
|---|---|---|---|
| Migration cost | half-day | 0 | half-day |
| Sovereignty (Frank's principle) | ✓✓ | ✓ (with attribution) | ✓✓ |
| Naming clarity | ✓✓ | △ (asymmetric) | ✓ |
| Maintenance overhead | ↑ short-term, = long-term | = | ↑ ongoing sync |
| Forks (other sovereign users) | ✓✓ clean | △ inherits brand | △ confusing |
| Test risk | shim well-tested? | none | none |
| Substrate-tier-board verdict prediction | PROCEED-with-shim-mandate | PROCEED-with-doc-update | REVISE |

---

## My recommendation

**Option A — Promote, with `@arcanea/orchestrator@1.3.0` compat shim.**

Three reasons:
1. **Sovereignty is the whole point of SIP.** Substrate depending on a vertical brand (Arcanea is one of Frank's verticals, not the substrate) creates a coupling that contradicts the layer model.
2. **Forks need a clean path.** Anyone forking SIS shouldn't inherit Arcanea brand-attribution just to get a working dispatcher.
3. **The shim is cheap insurance.** `@arcanea/orchestrator@1.3.0 = require('@starlight/orchestrator')` is one line, breaks nobody, and keeps Arcanea's existing arco users on the same package they installed.

If Option B is picked instead: **explicitly document the dependency in `STACK.md`** — the only thing worse than dependency-on-vertical is hidden dependency-on-vertical.

---

## What ships first regardless of A/B

- B1 (Wave 2, 2026-05-11) — `starlight dispatch` passes `STARLIGHT_HARNESS_PROMPT` env to arco. This is the SIS-side wire; both options need it. Already shipped this session.
- Arcanea-side: `arco run` reads `process.env.STARLIGHT_HARNESS_PROMPT` and prepends to target CLI's system prompt before spawn. **Owner:** whoever ends up canonical per A/B. Falsifiable by: dispatch a prompt through arco, observe target CLI's system prompt in audit log.

---

## Frank decides

This document parks here until Frank renders the call. No code moves until then. Next session, `/decide dispatcher A|B` collapses the fork.

**Built on SIP** — Starlight Intelligence Protocol v1.1.1
- Layers used: [file-contract, attestation, sovereignty]
- Verticals: core/orchestrator
- Generated: 2026-05-11
- Tier: substrate (decision document; subsequent code-move would require board pre-pass)
- Attestation: This decision artifact is itself a SIP file-contract participant. The chosen option (A/B/C) shall be recorded as a substrate amendment with a board verdict at decision-time.
