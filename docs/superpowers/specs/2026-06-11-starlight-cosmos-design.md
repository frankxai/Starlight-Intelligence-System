# Starlight Cosmos — Design Spec + Superintelligence Verdict

> 2026-06-11 · `/si` → `/superintelligence` L99 → execution. Operational-tier (site surfaces + plan docs).
> Built on SIP. Three research agents (site inventory, API verification, competitor scan) fed this synthesis.

---

## 1. The Real Question

Surface ask: "build /cosmos and /asteroids with NASA/SpaceX/JWST data and galleries."

Real question: **can SIS occupy the unowned intersection of (cosmos data) × (structured knowledge) × (agentic tooling) × (business systems) — and make the website the front door to it?**

The cosmos pages are not a science-outreach side quest. They are the first *public, beautiful, data-alive demonstration* of the SIS thesis: knowledge as first-class, agent-consumable substrate. Every card we publish for humans is simultaneously a future MCP resource for agents. The site is the demo; the MCP is the product; the repos are the distribution.

## 2. First Principles Foundation

1. **Data wants to be proxied.** Verified 2026-06-11: NASA Images API + ESA Webb D2D are keyless/CORS-open; NeoWs needs a key (DEMO_KEY measured at 10 req/hr); Exoplanet TAP + JPL SBDB emit no CORS headers; api.spacexdata.com is **dead** (522, repo archived 2026-06-06). Conclusion: all external data flows server-side through ISR-cached fetches with graceful fallbacks. Site CSP (`connect-src 'self'`) already enforces this.
2. **Experiences die; knowledge compounds.** 100,000 Stars (the aesthetic benchmark) is abandonware since 2012. Asterank (the only asteroid-economics tool) froze ~2013. What survives is structured, maintained knowledge with distribution. So: MD cards + registry are the spine; visuals are the skin.
3. **The agent surface is the moat.** Every competitor ships JSON wrappers or closed UIs. Nobody ships knowledge cards as MCP resources, prompts as exploration trails, or viz state as an agent-controllable target. SIS already has the substrate vocabulary (SIP attestation, registries, vaults) to do this natively.
4. **Mobile-first means content-first.** No three.js this session. A deterministic CSS/SVG starfield + NASA's own imagery outperforms a heavy WebGL scene on phones — and the incumbents prove fidelity isn't the wedge.

## 3. Multi-Perspective Synthesis

- **User:** wants to *feel* the cosmos in 10 seconds (imagery, motion), then go deep (cards), then *do something* (prompts, business lens). Three layers, one entry.
- **Architect:** mirror the proven in-repo patterns exactly — registry in `src/lib/` + MD in `content/` + ISR pages (the `/research` pipeline). New deps: zero.
- **Operator:** every external fetch is try/catch with a committed fallback; a dead NASA endpoint must never 500 the page or fail the build. DEMO_KEY default, `NASA_API_KEY` env upgrade path.
- **Skeptic:** "another scope expansion?" — mitigated: zero new packages, pure additive routes, content system designed for incremental population, MCP stays a plan doc this session.
- **Futurist:** cards → MCP resources; prompts → MCP prompts; asteroid economics → MCP tools; gallery → viz-control tools. The site IS the spec for the MCP.
- **Economist:** AstroForge/Karman+/TransAstra hit milestones 2026-2027 → news tailwind for asteroid-economics content. SEO: per-object pages are proven traffic (spacereference.org) with embarrassingly thin incumbent content.

## 4. Contrarian Considerations

- *"NASA Eyes already won 3D."* True — so we don't compete on simulation. We compete on knowledge + agents, where they're structurally unable to follow (closed source, institutional).
- *"Nobody needs another APOD wrapper."* Correct. APOD is garnish. The spine is cards + economics + prompts — which no wrapper has.
- *"Asterank values are junk science."* Partly true — its valuation model is Kepler-era. We label all economics as estimates with sources, and the v2 plan rebuilds the model with 2026 launch costs. Honesty is the differentiator.
- *"Cards will rot like every content project."* The registry + multi-session population plan + per-card `updated` dates + the existing vault/chronicle discipline are the countermeasure. Cards are small, individually shippable units.

## 5. Cross-Domain Insights

- **From SIS itself:** the research registry pattern (`lib/research.ts` + `content/research/*.md` + aliases + ISR) is exactly the right shape for cosmos cards — proven, SEO-friendly, agent-readable.
- **From games:** progression design — hub → gallery (awe) → card (depth) → prompt (action) is a quest loop, not a wiki.
- **From finance:** asteroid economics as scenario analysis (delta-v as cost-of-capital analog) — the framing that makes /asteroids a business tool, not trivia.

## 6. Recommended Approach (this session)

**Build in `site/` (operational tier), additive only:**

| Surface | Source | Caching |
|---|---|---|
| `/cosmos` hub | starfield (deterministic SVG) + APOD (api.nasa.gov, key-or-DEMO) + launches (LL2) + featured cards + view nav | ISR 3600s+, full fallbacks |
| `/cosmos/gallery` | NASA Images API (keyless) collections: galaxies / nebulae / JWST + ESA Webb D2D | ISR 86400s |
| `/cosmos/cards` + `/cosmos/cards/[slug]` | `lib/cosmos.ts` registry + `content/cosmos/*.md` | SSG via generateStaticParams |
| `/asteroids` | NeoWs feed (server, key-or-DEMO, fallback snapshot) + mining lens + asteroid cards + prompts | ISR 3600s |

**Knowledge card schema** (registry-driven, mirrors research pattern):
`kind` (star · planet · moon · asteroid · galaxy · nebula · element · law · concept · mission), `tldr`, `facts[]` (label/value/source), `prompts[]` (the thinking layer — 3-4 exploration prompts per card), `contentFile`, `tags`, `accent`, `related[]`, `sources[]`. Seed batch this session: ~16 cards across all kinds, incl. 16 Psyche, Bennu, Ceres, platinum-group metals, gold (neutron-star mergers), stellar fusion, spectroscopy ("how stars tell us their secrets").

**Data layer:** `src/lib/cosmos/` — `cards.ts` (registry), `nasa.ts` (typed fetchers, every one try/catch → null), `fallback/` (committed JSON snapshots so the experience never goes dark).

**Out of scope this session (deliberately):** three.js scene, MCP implementation, cosmos-engine code changes, Asterank-v2 economics engine.

## 7. Multi-Session Roadmap

1. **S+1 — Population wave 1:** +20 cards (planets complete, key moons, more elements/laws), `/cosmos/launches` view, EPIC earth view.
2. **S+2 — Starlight Cosmos MCP v0.1** (see §8) in `starlight-cosmos-engine/mcp-servers/mcp-cosmos` — consolidates the stubs (`mcp-nasa-media`, `mcp-esa-webb`, `mcp-arxiv-space`).
3. **S+3 — Asteroid economics v2:** SBDB + NHATS + parameterized mission-cost model (modern $/kg launch costs), scenario sliders, exportable feasibility memos. UI + MCP tools from one engine.
4. **S+4 — 3D layer:** r3f starfield with real HYG subset (~1.5 MB, mag<6.5), imagery pinned in 3D ("this Webb deep field sits HERE"), camera state as MCP-controllable target.
5. **Continuous:** card population every session (target 100+ cards), `awesome-cosmos-ai-agents` grows as the directory, knowledge-tree links cards into the graph.

## 8. Cosmos MCP Plan (the adoption play)

**Verified gap:** NASA's only official MCP is Earth-science-only (13★); community leader is a 90★ thin wrapper; zero servers combine imagery + bodies + economics + knowledge + viz control. The bar for "default space MCP" is unusually low.

**`@starlight/cosmos-mcp` v0.1 tool surface:**
- Tools: `search_imagery` (NASA Images + ESA Webb), `apod`, `neo_feed`, `body_lookup` (SBDB), `exoplanet_query` (TAP), `upcoming_launches` (LL2), `asteroid_value_estimate` (labeled-estimate model)
- **Resources:** every cosmos knowledge card (`cosmos://cards/{slug}`) — the thing nobody else ships
- **Prompts:** guided exploration trails ("evaluate mining feasibility of {asteroid}", "explain what spectroscopy reveals about {star}")
- v0.2: `viz_navigate` — drive the site's (future) 3D scene from an agent. Category of one.

**Distribution:** standalone repo or consolidated inside `starlight-cosmos-engine`; PR into modelcontextprotocol/servers community list + awesome-mcp lists; `awesome-cosmos-ai-agents` as the authority surface; SIP-attested, MIT.

**Personas:** researchers (literature + data in one server), educators (cards + prompts), space-economy analysts (economics tools), agent builders (the only full-stack space server).

## 9. Confidence + Falsifiers

**Confidence: High** for this session's build (proven patterns, verified APIs, zero new deps). **Medium** for MCP adoption (distribution effort-dependent).

Falsifiers: (a) if cosmos pages get no organic traction within 60 days of card population reaching 50+, the SEO thesis is wrong — re-evaluate before S+3 investment; (b) if NASA ships an official full-space MCP, pivot ours to the knowledge/economics layer only; (c) APOD/NeoWs rate-limit pain with DEMO_KEY → register free key (instant, 1,000 req/hr).

## 10. Repo Topology (decided)

- **SIS `site/`** — the public experience (this session)
- **`starlight-cosmos-engine`** — data/agents/MCP layer (S+2; stubs already exist: 9 agents, 6 MCP servers, web-atlas)
- **`awesome-cosmos-ai-agents`** — authority directory (grow continuously)
- **`starlight-knowledge-tree`** — cards link into the graph (S+4)
