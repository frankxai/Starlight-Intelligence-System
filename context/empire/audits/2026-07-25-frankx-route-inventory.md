# frankx.ai full route inventory — 2026-07-25

> Source: system-wide upgrade audit. 214 top-level route dirs (206 dirs + 8 route-group children), 501 page.tsx files. Tiering: T1 core commercial · T2 content/authority · T3 personal/experimental · T4 stub/duplicate/infra.

## Tier distribution

| Tier | Count | % |
|---|---|---|
| T1 core commercial | 55 | 26% |
| T2 content/authority | 67 | 31% |
| T3 personal/experimental | 39 | 18% |
| T4 stub/duplicate/infra | 53 | 25% |

~Half of T4 is legitimate infra (api, rss.xml, llms.txt, auth, legal, route-group wrappers). The genuinely thin/orphaned set: `sis` (redirect), `trinity-ai` (redirect), `intelligence-map`, `insights`, `quest`, `dare`, `realm`, `prototype`, `prototypes`, `vision`, `graph`, `network`, `observatory`, `plan`, `progress`, `content-strategy` (title literally "FrankX (Private)"), `product-development`, `command-center`, `superpowers`, `showcase`, `updates`, `changelog`, `partners`, `de`, `feed`, `links`, `linktree`, `ai-architectures` (literal "Coming soon").

## T1 commercial routes (the 55 that sell or convert)

`(landing)/connect`, `acos`, `affiliates`, `agents`, `ai-architect-academy`, `ai-assessment`, `ai-coe`, `ai-coe-readiness`, `artists/[slug]`, `assess`, `assessment`, `auctions`, `books`, `checkout`, `coaching`, `collectibles`, `community`, `consulting`, `contact`, `courses`, `dashboard`, `downloads`, `drops`, `enterprise`, `founder-playbook`, `founders-circle`, `foundry`, `free-playbook`, `gencreator`, `hospitality-os`, `inner-circle`, `investor`, `labs`, `licensing`, `media-kit`, `music`, `music-lab`, `music-os`, `n8n`, `onboarding`, `operator-scorecard`, `os`, `partnerships`, `portal`, `products` (16 pages), `prompt-library`, `shop`, `soul-frequency-assessment`, `soul-frequency-quiz`, `sprint`, `templates`, `testimonials`, `thank-you`, `vibe`, `waitlist`, `work`, `work-with-me`, `workshops` (10 pages)

## Critical findings

1. **Broken nav link**: `NavigationMega.tsx` links `/products/music-school` — route does not exist. Fix href or add redirect.
2. **Commercial routes orphaned from the header nav**: `workshops`, `enterprise`, `coaching`, `work-with-me`, `sprint`, `shop`, `founders-circle`, `inner-circle`, `waitlist` are NOT in `NavigationMega`. The primary nav carries 37 routes, mostly content — the money pages are unreachable from the header.
3. **103 of 214 route roots have no metadata export** at the entry page.tsx (some may inherit via layout.tsx — spot-check before fixing). The most important gaps: `products`, `shop`, `courses`, `workshops`, `music`, `research`, `consulting`, `coaching`, `community`, `templates`, `learn`, `about`.
4. **Dead/legacy nav components**: `Navigation.tsx`, `Navigation2025.tsx`, `MobileNavOverlay.tsx` exist but are not wired into the root layout (`NavigationMega` is the live header).
5. **Footer** links only the legal cluster — no commercial or content routes.

## Consolidation clusters (fix navigation, never delete traffic-bearing URLs)

| Cluster | Routes | Severity |
|---|---|---|
| AI-architecture naming | `ai-architect`, `ai-architect-academy`, `ai-architecture`, `ai-architectures` | High — 4 near-identical names, one a "Coming soon" stub |
| Assessments/quizzes | `assess`, `assessment`, `ai-assessment`, `ai-coe`, `ai-coe-readiness`, `operator-scorecard`, `soul-frequency-assessment`, `soul-frequency-quiz` | High — 8 overlapping lead-gen quizzes, no canonical entry |
| Commerce surfaces | `shop`, `products`, `templates`, `downloads`, `free-playbook`, `collectibles`, `auctions`, `drops` | High — no clear hierarchy of "where do I buy" |
| Music surfaces | `music`, `music-lab`, `music-intelligence`, `music-os`, `vibe`, `products/vibe-os` | High |
| Studio/lab naming | `studio`, `content-studio`, `design-lab`, `lab`, `labs` | Medium |
| Membership tiers | `community`, `inner-circle`, `founders-circle` | High — 3 pitches, no ladder |
| Getting-started | `start`, `start-here`, `onboarding` | Medium |
| Services | `work`, `work-with-me`, `for`, `consulting`, `coaching`, `sprint` | Medium — overlapping hire-me surfaces |
| Prompts | `prompt-library`, `prompts`, `drops` | Medium |
| Intelligence naming | `intelligence-atlas`, `intelligence-map`, `intelligence-system`, `starlight-intelligence-system`, `sis` | Medium |
| Hospitality | `hospitality-intelligence`, `hospitality-os` | Low |
| Philosophy/spiritual | `the-secret`, `think-and-grow-rich`, `manifestation`, `the-light-within`, `chronicle`, `soulbook`, `(rails)/*` | Low — unify under one hub |
| Family/personal (intentional) | `familie`, `family`, `papa` (HARD-STOP, never edit), `opa-und-oma`, `lebensbaum`, `erde`, `de`, `svijet`, `harzfenster`, `hoffnung`, `globe` | Confirm noindex where intended |

## Full 214-route table

Preserved in the audit transcript; tier + purpose per route captured above and in EMPIRE_INDEX.md. Notable per-route facts: `admin` (23 pages, internal), `design-lab` (31 pages), `products` (16), `music` (14), `studio` (14), `research` (12), `workshops` (10).
