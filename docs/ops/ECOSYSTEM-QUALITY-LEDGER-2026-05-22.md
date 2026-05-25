# Ecosystem Quality Ledger — 2026-05-22

## Current Quality Bar

| Area | State | Evidence | Next Gate |
|---|---|---|---|
| SIS harness | Green | `npm run verify` passed after temp cleanup; v80/harness passed targeted checks | Keep temp cleanup in mind for pack-runtime tests |
| SIS public/operator truth | Improved | AGENTS count, architecture diagram, readiness doc, Phase 0 docs updated | Add generated-count guards for remaining prompt drift patterns |
| SIS memory foundations | In execution | Phase 0 R2 note exists; charter reflects actual eval schema | R1 concurrent-write smoke + eval results |
| SIS memory consolidation | Observable, not fully calibrated | Non-zero insights; promotions/contradictions still zero | Fixture-backed contradiction/promotion calibration |
| ACOS harness | Green | `npm run verify` passed | Add generated-output installer tests |
| ACOS installer | Better, still needs generated-output tests | LF guard, OpenCode templating, truthful build message | Temp-dir smoke tests for all portable platforms |
| Cross-repo coordination | Safe but incomplete | Claude active in other repos; no direct collisions | One explicit FrankX/Arcanea pickup note if those repos are touched |

## First-Principles Standard

- A surface is not “supported” until its generated files parse and point at current paths.
- A metric is not “healthy” until a falsifiable fixture can make it fail.
- A memory pipeline is not “compounding” until receipts show non-zero signal from the live corpus.
- A platform prompt is not “current” if counts are hand-copied without a harness guard.
- A readiness doc should separate playbook existence from installed runtime proof.

## Work Queued By Leverage

1. Add ACOS generated-output installer tests. This catches Codex/Gemini/Antigravity/OpenCode regressions better than string checks.
2. Add SIS memory calibration fixtures. This turns the open zero-count issue into a pass/fail gate.
3. Extend SIS v80 platform-prompt test to catch parenthetical rule-count claims near `skills/skill-rules.json`.
4. Reconcile ACOS docs around “embedded” vs “summarized” skills for non-Claude adapters.
5. Keep full SIS and ACOS verify as the merge gate; both passed in this pass.

Built on SIP — quality ledger, operational tier.
