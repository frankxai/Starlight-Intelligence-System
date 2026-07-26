# frankx.ai deep commercial-page audit — 2026-07-25

> Source: system-wide upgrade audit. 24 key routes read in full; claims verified against filesystem (image existence, payment IDs, API routes).

## The headline finding: three payment rails, zero reachable

| Rail | State |
|---|---|
| Stripe | `/api/checkout` + webhook + Resend fulfilment fully wired for 3 hardcoded slugs — **no component anywhere calls it** (dead code) |
| Lemon Squeezy | Full client + webhook + BuyButton — **0 of 21 product/variant IDs configured** (all empty strings) |
| Gumroad | Only reachable purchase path — hardcoded external hrefs, split across TWO different store subdomains (frankx vs frankxai.gumroad.com), all marked needs-verification in the repo's own audit |

Plus: `/checkout` has no page.tsx while `data/products.json` sends €97 and €497 products to `/checkout/starter-kit` and `/checkout/command-center` — **both hard 404s**. Repo's own product-delivery audit: 16 products — 1 healthy, 5 broken, 10 needs-work.

**Zero testimonials sitewide** — all 20 products have empty `quotes[]`; three testimonial components exist and are imported by nothing.

## Route verdicts

| Route | Copy | Verdict | Key fact |
|---|---|---|---|
| /agents | A- | **world-class — the benchmark** | live data counts, honest "what it isn't," inline EmailSignup |
| /agentic-ai-center | A- | world-class | lean RSC, real JSON-LD, argues against overusing agents |
| /courses | A | world-class | editorial trust + commercial-independence disclosure |
| /workshops | A- | good | provenance labels runtime-enforced — the pattern for /tools |
| /start-here | A- | good copy / broken funnel | promises "€197, 30-day refund" Toolkit that isn't purchasable |
| /shop/templates | A- | **broken storefront** | best commerce copy+components; **all 15 buttons disabled "Coming Soon"** |
| /templates | A | good | names its own funnel honestly; IA collision with /shop/templates |
| /start | B+ | good | competes with /start-here |
| /about | B+ | good | 13 images verified; undated claims; unexplained Arcanea deity names |
| /shop | B+ | needs-upgrade | all 4 tiles use unrelated blog/gallery art; "$19" floor is wrong ($27) |
| /prompt-library | B+ | good, conversion-dead | 130+ patterns, zero capture |
| /blog index | B | good | **93/209 posts (44%) point at hero images that don't exist** — silently masked by fallback |
| /products | B | needs-upgrade | no prices on any card; "Soulbook" spiritual bleed ×6 |
| /coaching | B- | good | only working intake pipeline on site; no tier prices; 40+ vs 38 agent contradiction on same page |
| /work-with-me | B | needs-upgrade | €3k–€25k offers behind a **broken mailto: form**; zero imagery/proof/guarantee |
| /community | B- | needs-upgrade | "Active"-badged Signal Newsletter links to /start; present-tense copy for unbuilt features |
| /waitlist | B | thin | value exchange undefined |
| /resources | B- | **broken** | priority-loaded hero image **does not exist** — 404 on the LCP element |
| /vault | B- | needs-upgrade | layout metadata claims "484 assets. 30 collections" vs manifest 1507/55 |
| /research index | C | needs-upgrade | "Conscious AI Operating Systems" (forbidden word) + 5 fictional research-team personas as credibility |
| /tools | C | **worst integrity risk** | fabricated usageCount/rating/"50K+ Monthly Uses"/"4.8/5" — 6 of 8 tools are waitlist stubs |
| /skills | D | needs-upgrade | committed example strings: "Channel Frequency Alchemist", "Consult Soul Strategist" |
| /consulting | — | dead code | 5-line redirect + orphaned 563-line ConsultingClient.tsx (zero imports) |
| /checkout | — | missing | no index page; success/cancel exist with no caller |

## Cross-cutting

1. **15 of 23 commercial routes have zero imagery** while `public/` holds 1,883 images.
2. **The ai-slop gate has a blind spot**: `scripts/audit-ai-slop.mjs` bans only AI-tone phrases — zero spiritual/guru terms ("soul", "consciousness", "frequency", "manifestation" all pass). This is why /skills and /research violations ship. NOTE: adding terms will fail CI on existing content/ corpus (soul-frequency posts) — triage content first.
3. Internal links healthy: 0 missing route targets across 47 unique hrefs. Breakage is images + payment IDs, not navigation.
4. Design system (for upgrades): void #0a0a0b → space #111113 → elevated #1a1a1f; tech spectrum emerald #10b981/cyan #06b6d4 OR soul amber/gold — never mixed; Inter body + Poppins display; eyebrow = 11px/0.25em/60%; glass = `bg-white/[0.03] border-white/[0.06] backdrop-blur`; primary CTAs rounded-full; no text animation ever.

## Top 10 upgrade targets (ranked by revenue leverage)

1. **/shop/templates checkout wiring** — $27–$297 × 15 SKUs, converts $0 → working storefront.
2. **Payment-rail decision site-wide** — pick ONE rail; fix the €97/€497 404s; unify Gumroad subdomains.
3. **/tools fabricated proof removal** — largest trust liability.
4. **/work-with-me form + proof** — €3k–€25k offers on a mailto: form; working pattern exists at /api/coaching-apply.
5. **Social proof deployment** — 0 quotes sitewide; components already built.
6. **/resources hero 404** — one-line LCP fix.
7. **/coaching tier pricing** — budget self-selection.
8. **Imagery on the 15 zero-image commercial routes** + backfill 93 blog heroes.
9. **/research FlagshipArticles + /skills triggerPhrases** brand violations (+ slop-gate ban list, after content triage).
10. **Email capture on the 5 dead-end hubs** — copy the /agents pattern verbatim.

Benchmarks to copy: /agents, /workshops, /courses, /agentic-ai-center, /start-here.
