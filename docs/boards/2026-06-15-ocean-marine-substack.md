# Starlight Board — Register Ocean / Marine Intelligence as a SIS domain sub-stack

**Date:** 2026-06-15
**Tier:** substrate (touches domain sub-stack pattern + VERTICALS.md + skill-rules.json + /spawn-domain-stack)
**Run:** board-before-tag, per CLAUDE.md substrate governance gate.

## Proposal

Register Ocean / Marine Intelligence as a domain sub-stack in SIS: (1) `marine-intelligence` domain in skill-rules.json; (2) ambient SIP attestation across the ocean triad; (3) document the triad in VERTICALS.md / STACK.md as the first Commons/IS/OS sub-stack; (4) generalize `/spawn-domain-stack` with a `--public-corpus` variant. The ocean repos (blue-life-commons, marine-mcp, marine-agent-skills, ocean-intelligence-system) shipped 2026-06-15; this proposal concerns only the substrate registration + the pattern change.

## Verdict: PROCEED-WITH-REVISE

**Most load-bearing concern (Overseer):** category error — Ocean is an *operated public initiative in external repos*, not an in-repo anonymized forkable reference like People/Sound/Crypto; registering it as the latter corrodes the domain-sub-stack contract downstream verticals rely on.

**Strongest case to proceed:** the Commons/IS/OS triad is a genuinely novel, reusable substrate primitive worth encoding into `/spawn-domain-stack`.

## REVISE items (all honored this session)

1. **Classify correctly.** Filed in VERTICALS.md under *sovereign operated verticals* as "sovereign vertical (operated + public commons)", sibling to Music IS — NOT under the anonymized forkable-reference sub-stacks. ✅
2. **skill-rules resolves in-repo.** Added `skills/marine-intelligence/contribute.md` pointer skill; the `marine-intelligence-contribute` rule's `skill` field resolves to it (verified). ✅
3. **Generalize, don't special-case.** Added the `--public-corpus` variant to `/spawn-domain-stack` documenting the triad shape + its non-waivable rules (free commons, review-gated IS, standards-not-votes, in-repo anchor, correct classification, mature-funding-default). Ocean is named as the reference instance. ✅

## Vector challenges (summary)

- **Sovereign:** worth the name; low-irreversibility registration (external repos de-registerable).
- **Seer:** success-case governance/liability load on the substrate; future spawn users expecting in-repo scaffolds.
- **Harmonizer:** breaks the "anonymized in-repo scaffold" contract unless classified as operated-vertical-publishing-commons.
- **Strategist:** the public-corpus primitive has high option value as a template for future public-good domains.
- **Verifier:** skill-rules pointing at an external-repo skill would silently no-op; fixed with the in-repo pointer.

---
**Built on SIP** · Starlight Board · 2026-06-15
