# EMPIRE INDEX

> The single source of truth for every domain, live site, repo, and surface in the FrankX / Starlight / Arcanea portfolio.
> Built 2026-07-25 by the system-wide upgrade audit (6 parallel agent sweeps, all claims verified against filesystem and the Vercel API).
> Companion files: `portfolio-mesh.yaml` (machine-readable registry), `UPGRADE_ROADMAP.md` (prioritized actions), `audits/` (full evidence).
>
> **The mesh is generated, not hand-written (since 2026-07-30).** Curated judgement lives in `mesh.curated.json`; every count is derived from the filesystem by `scripts/mesh-generate.mjs` under a written counting contract, and `npm run mesh:check` fails CI if the committed artifacts drift. Regenerate with `npm run mesh:generate` from a machine holding the whole portfolio. Do not hand-edit `portfolio-mesh.yaml` / `portfolio-mesh.json`. Numbers elsewhere in *this* file are still the hand-audited 2026-07-25 figures — where they disagree with the mesh, the mesh is right.

---

## 1 · The live estate — 19 production sites

| Domain | Repo / project | State | Grade | One-line status |
|---|---|---|---|---|
| **frankx.ai** | frankx.ai-vercel-website | live, deploys daily | B | 501 pages; world-class benchmarks exist (/agents, /courses); commerce is broken end-to-end (see §3) |
| **starlightintelligence.org** | `site` project | live | — | substrate public site + research surface |
| **agenticincome.ai** | agenticincome | live | A- | $67 Blueprint drafted; checkout not wired |
| **agenticpassiveincome.com** | agenticpassiveincome | live | A | $47 Stream Pack content-complete; checkout not wired |
| **disruptivepassiveincome.com** | dpi-open-core | live | — | domain migrated to newer project |
| **go.agenticincome.ai** | go-agenticincome | live | — | funnel |
| **aiarchitectacademy.com** | aiarchitectacademy | live | — | academy |
| **realityarchitect.ai** | realityarchitect | live | A | flagship: method + standard + assessment, voice-perfect |
| **gencreator.ai** | gencreator-ai | live | — | creator CoE |
| **gencreator.community** | gencreator-community | live | — | community |
| **vibeclubs.ai** | vibeclubs-web | live | — | events |
| **bluelifecommons.org** | blue-life-commons | live | A | flagship: governed marine commons + site |
| **oceanintelligence.app** | ocean-intelligence | live | A | flagship: 9 MCP connectors, tests, daily-refresh demo |
| **arcanea.academy** | arcanea-academy | live | — | Arcanea learning |
| **arcanea.dev / arcanean.org / arcanealabs.com** | arcanea-domain-portals | live | — | portal shell |
| **starlightintelligence.academy** | starlight-intelligence-academy | live | — | academy |
| **cecilia.chat** | cecilia-chat | live | — | client |
| **anaceciliacancino.com** | ana | live | — | client |
| **animelegends.ai** | anime-legends | live | — | anime vertical |

**Stale (domain live, deploys old):** lobe.arcanea.ai (~146 days) · trinityaicoaching (10 months, still linked from frankx.ai/trinity-ai) · my-library · vercel-ai-gateway-demo · v0-ai-misuse-mitigation · anime-studio-landing (ERROR).
**Never deployed / scratch (cull candidates, 14 projects):** 9 never-deployed + 5 v0-*.
**⚠ Arcanea apex problem:** no healthy project in the team holds an arcanea.ai apex domain; `arcanea-ai-appx` (named production in repo docs) is in ERROR state.

Full matrix: `audits/2026-07-25-vercel-deploy-matrix.md`.

---

## 2 · The repo portfolio — 42 repos by verdict

**Flagships (protect and amplify):** ocean-intelligence-system · blue-life-commons · realityarchitect · frankx.ai-vercel-website (breadth) · arcanea-ai-app (chat/lore/ecosystem surfaces) · Starlight-Intelligence-System (substrate; only repo whose documented counts match its filesystem exactly).

**Revenue-ready (days from checkout):** agenticpassiveincome · agenticincome · agentic-business-os (packs) · vibe-os (packaging only).

**Promising:** frankx-palace · frankx-mind-palace · marine-mcp · bless · agentic-intelligence-system · agentic-ops-hub (best-organized infra) · payment-intelligence-system (most technically real; UNAUDITED).

**Needs decision:** ai-music-academy (hype voice + unverified metrics, dead 6 months — rehabilitate or archive; redirect assets to music-intelligence-systems) · arcanea OSS repo (stale divergent fork teaching the banned design system publicly) · vibe-os (monetize or archive).

**Charter-only:** music-intelligence-systems · starlight-mind-os-pro (by design).

Registry detail (457 skill files → ~357 unique, duplication clusters, coverage gaps): `audits/2026-07-25-registry-sweep.md` + `portfolio-mesh.yaml`.

---

## 3 · The commerce truth (the empire's critical path)

Across the whole portfolio, **working payment code exists in three places and customer-reachable checkout exists in zero:**

1. **frankx.ai** — Stripe pipeline fully wired (checkout API + webhook + Resend fulfilment) with no caller; Lemon Squeezy client complete with 0/21 IDs configured; 15-SKU template storefront rendering disabled buttons; €97/€497 CTAs 404ing.
2. **arcanea.ai** — Stripe checkout/portal/webhook + credits routes built; `/pricing` shows $0/$12/$39 with no buttons; `/studio/store` ships **fake payment confirmations** (ship-blocker).
3. **income cluster** — two products fully drafted ($47 + $67), Polar.sh named as merchant of record, runbooks written, checkout never built.

**The single highest-leverage engineering theme portfolio-wide: wire ONE checkout per property.** Everything else compounds behind it.

---

## 4 · Integrity & trust debt (fix before scaling traffic)

| Severity | Item | Where |
|---|---|---|
| SHIP-BLOCKER | Fake Stripe/on-chain payment confirmations | arcanea.ai `/studio/store` |
| HIGH | Fabricated usage counts/ratings on stub tools | frankx.ai `/tools` |
| HIGH | Fabricated infra stats (10M+ req/day, 99.9% uptime) | arcanea.ai `/arcanea-os` |
| HIGH | Four contradictory library-collection counts; three agent counts | arcanea.ai (lib/facts.ts exists, unused) |
| HIGH | Unverified revenue claims in public repo | ai-music-academy |
| MED | Vault metadata 3x wrong (484/30 vs 1507/55) | frankx.ai `/vault` |
| MED | Spiritual-language violations in committed code | frankx.ai `/skills`, `/research` |
| MED | Voice break "Unlock premium Agent Swarms" | awesome-agentic-income |
| MED | 40+/38 agent contradiction on one page | frankx.ai `/coaching` |

---

## 5 · Structural findings

- **frankx.ai IA sprawl**: 214 route dirs; 8 overlapping quiz routes, 8 commerce surfaces, 5 lab/studio names, 3 membership tiers with no ladder, 3 getting-started pages. Money pages (workshops, coaching, work-with-me, shop) absent from the header nav. Full inventory: `audits/2026-07-25-frankx-route-inventory.md`.
- **Imagery paradox**: frankx.ai holds 1,883 images in public/ while 15 of 23 commercial routes render zero; 44% of blog posts point at heroes that don't exist. Arcanea holds 205 images while its book catalog, agent marketplace, and character hub use emoji/Unicode glyphs.
- **Social proof**: zero testimonials anywhere on frankx.ai (components built, never imported).
- **Three agent-legibility standards** (llms.txt/ais-profile, reality.md, CLAUDE.md/AGENTS.md) evolving independently.
- **Marine stack is the reference architecture**: commons → review-gated MCP → agent layer. Copy this layering for music and mind verticals.

---

## 6 · Where everything is

| Question | Answer |
|---|---|
| What's live? | §1 + `audits/2026-07-25-vercel-deploy-matrix.md` |
| What's on every frankx.ai route? | `audits/2026-07-25-frankx-route-inventory.md` |
| What's the copy/offer/visual state of the money pages? | `audits/2026-07-25-frankx-deep-audit.md` |
| What's the Arcanea state? | `audits/2026-07-25-arcanea-audit.md` |
| What can we sell this week? | `audits/2026-07-25-income-cluster-audit.md` |
| What skills/agents exist where? | `portfolio-mesh.yaml` + `audits/2026-07-25-registry-sweep.md` |
| What are the verticals worth? | `audits/2026-07-25-verticals-audit.md` |
| What do we do first? | `UPGRADE_ROADMAP.md` |
