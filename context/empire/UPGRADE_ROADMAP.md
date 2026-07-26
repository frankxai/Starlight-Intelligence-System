# UPGRADE ROADMAP

> Prioritized from the 2026-07-25 system-wide audit. Ordering principle: trust first, then revenue, then reach.
> Status legend: ☐ open · ◐ in progress (this session) · ☑ done (this session)

## Wave 0 — Trust repairs (hours each; do before driving any traffic)

> 2026-07-25 session: Wave 0 shipped — frankx.ai#362 MERGED + live; arcanea store quarantine in arcanea-ai-app#206 (held in draft by Frank pending deps + Visual QA repairs); awesome-agentic-income#4 open. Wave 1 session 2: frankx.ai#369 (conversion layer), agenticpassiveincome#20 + agenticincome#18 (Polar fail-closed), ICP_FLOW_MAP + POSITIONING_PLAYBOOK added.
> 2026-07-26: Frank authorized lead-review-and-merge. MERGED to main: SIS#52 (this index), awesome-agentic-income#4, agenticpassiveincome#20, agenticincome#18, frankx.ai#369 (auto-deploys production). arcanea-ai-app#206 stays draft per Frank's hold. Next: arcanea deps-security PR.

- ☑ frankx.ai: fix broken nav link `/products/music-school` → `/music/learn` (repo's own wiring registry already verified the target)
- ☑ frankx.ai `/tools`: delete fabricated `usageCount`/`rating`/"50K+ Monthly Uses"/"4.8/5" and Premium badges on the 6 stub tools
- ☑ frankx.ai `/skills`: replace "Channel Frequency Alchemist" / "Consult Soul Strategist" example strings
- ☑ frankx.ai `/research`: rewrite the FlagshipArticles block ("Conscious AI Operating Systems"); remove fictional research-team personas
- ☑ frankx.ai `/vault`: generate layout metadata from `data/vault-manifest.json` (claims 484/30, actual 1507/55)
- ☑ frankx.ai `/resources`: replace missing priority-loaded hero image (LCP 404)
- ☑ frankx.ai `/coaching`: fix 40+/38 contradiction
- ☑ frankx.ai `/shop`: fix "$19" floor (actual $27)
- ☑ frankx.ai `/community`: fix "Active"-badged newsletter card linking to `/start`
- ☑ arcanea.ai `/studio/store`: quarantine fake payment confirmations (SHIP-BLOCKER — gate behind flag or wire real checkout)
- ☐ arcanea.ai: route all public numbers through `lib/facts.ts`; delete `/arcanea-os` fabricated stats
- ☑ awesome-agentic-income: fix "Unlock premium Agent Swarms" CTA (#4 merged 2026-07-26)
- ☐ ai-music-academy: decision — rehabilitate voice + metrics, or archive and move assets to music-intelligence-systems

## Wave 1 — Revenue (days; the compounding unlock)

1. ☑ **One Polar.sh checkout integration** — MERGED TO MAIN 2026-07-26 (agenticpassiveincome#20 + agenticincome#18, triple-gated fail-closed; activation = Frank's checklist in each runbook — env vars + catalog status flip are his calls, never an agent's). Original item: shared by agenticincome + agenticpassiveincome → ships Stream Pack 01 ($47) and Blueprint ($67). Runbooks already exist (`ops/POLAR-SETUP.md`, `FULFILLMENT_RUNBOOK.md`).
2. ☐ **frankx.ai payment-rail decision**: pick ONE (recommendation: Lemon Squeezy — client + webhook already built, EU-friendly MoR). Configure variant IDs for the top 3 templates (rag-system-blueprint $197, multi-agent-blueprint $297, nextjs-saas-boilerplate $197). Fix the €97/€497 `/checkout/*` 404s. Unify the two Gumroad subdomains.
3. ☐ **arcanea.ai `/pricing`**: wire the three CTAs to the existing `/api/stripe/checkout`. Fix `**40%**` markdown bug.
4. ☐ agentic-business-os packs → list claims-guard ($29–49) + bundle ($99) on the chosen storefront.
5. ☐ vibe-os → $19–29 pack (pure packaging).
6. ◐ frankx.ai `/work-with-me`: mailto replaced with real /api/studio-inquiry route + stateful form (#369 MERGED 2026-07-26, live in production). Tier pricing on /coaching still open.

## Wave 2 — Conversion & proof (1–2 weeks)

- ☐ Social proof pipeline: collect real quotes → populate `data/products.json` `socialProof.quotes[]` → mount the already-built Testimonials components. Never invent proof.
- ◐ Email capture: /prompt-library + /ai-architect-academy MERGED in #369 (2026-07-26); /agentic-ai-center, /research, /vault still open. Original item: (`/prompt-library`, `/ai-architect-academy`, `/agentic-ai-center`, `/research`, `/vault`) — copy the `/agents` inline EmailSignup pattern verbatim.
- ☑ Header nav: 'Work with Frank' group MERGED in #369 (2026-07-26, live). Original item: (workshops, coaching, work-with-me, shop) to NavigationMega; define the membership ladder (community → inner-circle → founders-circle).
- ☐ Imagery sprint: place existing assets (1,883 on frankx.ai, 205 on arcanea) onto the 15 zero-image commercial routes; backfill the 93 missing blog heroes; generate book covers + agent portraits for Arcanea (guardian v3 webp pipeline proves the path).
- ☐ Metadata sprint: add metadata exports to the T1 hub roots missing them (spot-check layout.tsx inheritance first).

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
