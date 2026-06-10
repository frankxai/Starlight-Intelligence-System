# Handover — frankx.ai eval surface (SUPERSEDES 2026-06-09 Model-Arena-only handover)

> Built on SIP. From: SIS exec-board audit 2026-06-10. To: a FrankX-context session in
> `C:/Users/frank/frankx-prod-sync` (the Vercel-linked prod repo). The 2026-06-09
> handover is stale — it predates the Proving Ground and led with the *less*
> differentiated artifact (Model Arena). Lead with the Proving Ground.

## Why this matters (CEO finding)

The whole-system eval + routing work is the single most differentiated thing the system
shipped this week — "most projects publish a model benchmark; almost none publish a
whole-system eval with weaknesses named and dated." It is **live on the methodology
surface** (starlightintelligence.org) but **404 on the distribution surface**
(`www.frankx.ai/research/proving-ground`), where the audience actually is. Until it's on
frankx.ai, ~24h of strong work creates zero market leverage.

## Task

Add the eval work to the frankx.ai Research Intelligence Hub, **leading with the Proving
Ground**, Model Arena as supporting evidence.

1. New research domain in `frankx-prod-sync/lib/research/domains.ts` (slug
   `proving-ground` or `starlight-proving-ground`), filed in the Models/Tools group.
   Headline: **whole-system eval across 7 lanes, Luminor-kernel evaluators, Starlight
   Board verdicts; first run caught its own unregistered agent; load-bearing weakness
   memory precision@10 = 0.20.**
2. A second entry (or sub-section) for the Model Arena (3 rounds + the 4-way lineup),
   framed honestly as an **output-discipline ranking, NOT overall best/worst** (see the
   "what this card does NOT measure" note on the SIS surface — Opus is not "worst," the
   cards just don't test reasoning yet).
3. Sources → the live SIS surfaces + the GitHub mirror:
   - https://starlightintelligence.org/research/proving-ground
   - https://starlightintelligence.org/research/model-arena
   - https://github.com/frankxai/starlight-evals  (the forkable harness — link it as the CTA)
4. Deploy: `cd frankx-prod-sync && vercel --prod` (auto-deploy is broken; manual ship).
   **This is a production push to the public brand property — Frank-ack required before
   the deploy** (gated per autonomy boundary).

## Honesty guardrails (carry these — they ARE the brand)

- Every number cites a receipt. Keep the named-weakness discipline.
- Do NOT call the Starlight Queen a "self-rewriting continuous loop" — it is currently a
  **manual routing doctrine** (no router code yet). The SIS docs were corrected 2026-06-10.
- Anti-Goodhart line stays: "these numbers describe the system; do not optimize to them."

## Also queued for the SIS site (handled separately, not frankx.ai)

Sitemap research routes, per-page OG images, hero count reconciliation, fork CTA — all
shipped on the SIS surface 2026-06-10. frankx.ai should mirror the OG + CTA patterns.

Built on SIP — Starlight Intelligence Protocol.
