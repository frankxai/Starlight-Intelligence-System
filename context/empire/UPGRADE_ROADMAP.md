# UPGRADE ROADMAP

> Prioritized from the 2026-07-25 system-wide audit. Ordering principle: trust first, then revenue, then reach.
> Status legend: ☐ open · ◐ in progress (this session) · ☑ done (this session)
> 2026-08-21: portfolio integration wave — 144 open PRs triaged, 31 good branches merged to main across 12 repos (arcanea canon-gate program complete, SIS control plane, release-foundation family, frankx.ai #505-#508 hub chain + guards). Frank-decision and stale-close lists delivered in-session. Remaining armed: website#456 (media-guard hardening) + #479 on auto-merge.
> 2026-08-14: automation-layer audit complete — findings, self-healing playbook, and Frank-only levers live in `AUTOMATION_HEALTH.md` (sibling file). First fix shipped: agentic-ops-hub#42 (off-machine fleet dead-man's switch). frankx.ai#460 (Wave 0 auction trust repair) MERGED 2026-08-14 by Frank after the C940 exact-head review cleared — fabricated auction sale records removed, prints reopened as live silent-bid drops with window + minimum-bid + send-failure enforcement; auto-deployed to production. arcanea#102 (canon gate: lore-release-gate skill + rubric + lore-lint + CI ratchet) merged same day on Frank's approval.

## Wave 0 — Trust repairs (hours each; do before driving any traffic)

> 2026-07-25 session: Wave 0 shipped — frankx.ai#362 MERGED + live; arcanea store quarantine in arcanea-ai-app#206 (held in draft by Frank pending deps + Visual QA repairs); awesome-agentic-income#4 open. Wave 1 session 2: frankx.ai#369 (conversion layer), agenticpassiveincome#20 + agenticincome#18 (Polar fail-closed), ICP_FLOW_MAP + POSITIONING_PLAYBOOK added.
> 2026-07-26: Frank authorized lead-review-and-merge. MERGED to main: SIS#52 (this index), awesome-agentic-income#4, agenticpassiveincome#20, agenticincome#18, frankx.ai#369 (auto-deploys production). arcanea-ai-app#206 stays draft per Frank's hold.
> 2026-07-26 continuation: frankx.ai#371 (email capture on the last 3 hubs) + #372 (metadata sprint, 4 T1 roots) MERGED and live. Arcanea deps repair found ALREADY DONE on main (#212, 2026-07-25) — `pnpm audit --audit-level high` clean; #206's deps precondition is satisfied, Visual QA half remains with Frank. Residual on arcanea: 6 moderate + 2 low advisories (hono/protobufjs chains, need major bumps) — left for a Frank-approved pass.
> 2026-08-10: arcanea-ai-app#206 CLOSED by Frank as superseded — his A0 trust purge #239 (on main) removed the simulated store outright, a stronger disposition than the quarantine labels. Hold released; no residual work from #206.

- ☑ frankx.ai: fix broken nav link `/products/music-school` → `/music/learn` (repo's own wiring registry already verified the target)
- ☑ frankx.ai `/tools`: delete fabricated `usageCount`/`rating`/"50K+ Monthly Uses"/"4.8/5" and Premium badges on the 6 stub tools
- ☑ frankx.ai `/skills`: replace "Channel Frequency Alchemist" / "Consult Soul Strategist" example strings
- ☑ frankx.ai `/research`: rewrite the FlagshipArticles block ("Conscious AI Operating Systems"); remove fictional research-team personas
- ☑ frankx.ai `/vault`: generate layout metadata from `data/vault-manifest.json` (claims 484/30, actual 1507/55)
- ☑ frankx.ai `/resources`: replace missing priority-loaded hero image (LCP 404)
- ☑ frankx.ai `/coaching`: fix 40+/38 contradiction
- ☑ frankx.ai `/shop`: fix "$19" floor (actual $27)
- ☑ frankx.ai `/community`: fix "Active"-badged newsletter card linking to `/start`
- ☑ arcanea.ai `/studio/store`: RESOLVED by Frank's A0 trust purge (arcanea-ai-app#239, merged 756f3f8, 2026-08-10) — store surface removed via notFound(), DEMO_STATS/fake case studies killed. The quarantine PR #206 was closed as superseded; per Frank's disposition, simulated commerce is not to be revived — next is honest env-gated Stripe rails (A1+).
- ☐ arcanea.ai: route all public numbers through `lib/facts.ts`; delete `/arcanea-os` fabricated stats
- ☑ awesome-agentic-income: fix "Unlock premium Agent Swarms" CTA (#4 merged 2026-07-26)
- ☑ frankx.ai `/auctions`: fabricated Feb-2026 sale records ($187/$197/$297 to "Anonymous" buyers, predating the data file and any payment rail) removed; prints reopened as live silent-bid drops with fail-closed window gating (`lib/auctions.ts`), server-side minimum-bid validation, awaited email sends returning 502 on failure, and a mutant-verified contract test wired into merge:gate (frankx.ai#460, merged 2026-08-14 after the full 4-layer review gauntlet + C940 exact-head review)
- ☐ ai-music-academy: decision — rehabilitate voice + metrics, or archive and move assets to music-intelligence-systems

## Wave 1 — Revenue (days; the compounding unlock)

1. ☑ **One Polar.sh checkout integration** — MERGED TO MAIN 2026-07-26 (agenticpassiveincome#20 + agenticincome#18, triple-gated fail-closed; activation = Frank's checklist in each runbook — env vars + catalog status flip are his calls, never an agent's). Original item: shared by agenticincome + agenticpassiveincome → ships Stream Pack 01 ($47) and Blueprint ($67). Runbooks already exist (`ops/POLAR-SETUP.md`, `FULFILLMENT_RUNBOOK.md`).
2. ◐ **frankx.ai payment-rail decision**: DECIDED + ENGINEERING SHIPPED 2026-07-28 — Lemon Squeezy rail, frankx.ai#397 merged. `/checkout/[slug]` now fail-closed triple-gated (registry paid-product → hardcoded env-key map → store+variant env vars); €97/€497 404s eliminated (honest launch-list fallback). Activation = Frank's checklist in `docs/commerce/lemon-squeezy-activation.md` (5 env vars in Vercel, then test-mode order). Still open: variant IDs for the top-3 templates, Gumroad subdomain unification, flipping product CTAs from /waitlist to /checkout once live.
3. ☐ **arcanea.ai `/pricing`**: wire the three CTAs to the existing `/api/stripe/checkout`. Fix `**40%**` markdown bug.
4. ☑ agentic-business-os packs → LISTED GATED 2026-08-07: claims-guard-pack $39 + abos-pack-bundle $99 on the agenticincome Polar catalog (agenticincome#23, agentic-business-os#3 with honest PRODUCT.md manifests). Fail-closed: no `for sale` status, no env vars — activation needs packaged zip + Polar product + status flip, all Frank's. Note: source repos are MIT + public, so all product copy frames purchase as the packaged edition supporting development; exclusivity pricing would need the repos private first (Frank's call).
5. ☑ vibe-os → LISTED GATED 2026-08-07: vibe-os-pack $24 on the same catalog (agenticincome#23, vibe-os#4 root PRODUCT.md — disk-generated contents table, hard NOT-section: no medical/therapeutic claims, not a music generator, not exclusive). Same fail-closed activation path.
6. ◐ frankx.ai `/work-with-me`: mailto replaced with real /api/studio-inquiry route + stateful form (#369 MERGED 2026-07-26, live in production). Tier pricing on /coaching still open.

## Wave 2 — Conversion & proof (1–2 weeks)

- ☐ Social proof pipeline: collect real quotes → populate `data/products.json` `socialProof.quotes[]` → mount the already-built Testimonials components. Never invent proof.
- ☑ Email capture: COMPLETE — /prompt-library + /ai-architect-academy in #369; /agentic-ai-center, /research, /vault in #371 (merged 2026-07-26, live). All five planned surfaces now mount EmailSignup.
- ☑ Header nav: 'Work with Frank' group MERGED in #369 (2026-07-26, live). Original item: (workshops, coaching, work-with-me, shop) to NavigationMega; define the membership ladder (community → inner-circle → founders-circle).
- ◐ Imagery sprint: frankx.ai#398 MERGED 2026-07-28 — subject-matched existing assets placed on /shop (3 tiles + real alt text), /work-with-me (stage photo as proof), /start-here (six-primitives visual), /workshops (own hero art); honest-match discipline skipped /templates + /community (no truthful asset exists). Still open: generate the 7 product OG covers from their existing specs (unblocks /products + /templates), 93 blog-hero backfill, arcanea covers/portraits. The 2 mismatched auction images resolved in frankx.ai#460 (merged 2026-08-14: 1:1 session → real Oracle stage photo; ACOS setup → ACOS pack art).
- ☑ Metadata sprint: DONE in #372 (merged 2026-07-26). Full 55-route T1 sweep found 6 gaps: 4 fixed via sibling layout.tsx (/auctions, /collectibles, /dashboard, /onboarding), 2 are pure redirects (inert). The audit's 12 "most important gaps" had all gained layout-level metadata since 2026-07-25 — verified individually.

## Wave 3 — Structure (weeks; needs Frank's URL/SEO approval per repo doctrine)

- ☐ frankx.ai IA consolidation by NAVIGATION (never deletion): one assessment entry point, one commerce hierarchy (shop → templates/products/downloads), one getting-started path, membership ladder.
- ☐ Arcanea OSS repo: replace stale apps/web with real export or demote to packages/docs mirror; archive the ~140 root strategy docs; stop teaching Cinzel.
- ☐ Registry governance: build the skills-governance skill in SIS (counts, duplication, staleness, doc-drift checks; regenerates awesome-lists); declare `canonical_source` in mirror repos.
- ☐ Reconcile agent-legibility standards (llms.txt/ais-profile · reality.md · CLAUDE.md).
- ☐ Vercel hygiene: cull 14 never-deployed/scratch projects; resolve the arcanea.ai apex; retire or redirect trinityaicoaching.
- ☐ FrankX private repo: reconcile the three ACOS variants.

## Wave 4 — Scale without Frank (the YC lens)

- ☐ Productize the delivery loop: every paid artifact delivered by the existing webhook→Resend fulfilment path; support = docs + community; updates = git tags → "free updates" promise kept automatically.
- ☐ Private Intel ($19/mo) on Polar subscriptions — the two awesome-lists already compound weekly as raw material.
- ☐ Estate/army commissioning (per DELIVERY.md §7) becomes the high-ticket tier above self-serve packs.
- ☐ Copy the marine reference architecture (commons → gated MCP → agents) into music and mind verticals.
