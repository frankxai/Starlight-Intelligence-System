# Starlight Cosmos — Platform Expansion Spec

> 2026-07-13 · Operational-tier (site surfaces + plan doc). Extends `2026-06-11-starlight-cosmos-design.md`.
> Built on SIP. Captures Frank's platform vision (encyclopedia · visual exploration · story + research agents · multi-surface apps · monetization · network visualization) as a phased, falsifiable plan.

---

## 1. What shipped this session (v2 — Constellations & Spacecraft wave)

- **Encyclopedia +11 cards** (19 → 30): 4 constellations (Orion, Ursa Major, Crux, Cassiopeia), 3 named stars (Betelgeuse, Sirius, Proxima Centauri), 2 spacecraft (Voyager 1, ISS), 2 concepts (Fusion on Earth, What Stars Teach — the philosophy layer, kept honest by physics).
- **Two new card kinds**: `constellation`, `spacecraft` — the registry now spans 12 kinds.
- **First visual-exploration surface**: `/cosmos/constellations` — deterministic SVG star maps projected from real J2000 RA/Dec, zero client JS, three reading layers per chart (science / myth / navigation).
- **Dual-track prompts**: every new card carries a systems prompt, a research trail, and a story seed — the same substrate serves scientific exploration and fiction worldbuilding without mixing the two.

## 2. The thesis, restated

The cosmos surfaces are the public, beautiful proof of the SIS claim: knowledge as agent-consumable substrate. Humans get an encyclopedia with taste; agents get the same registry as MCP resources; the prompts are the bridge between them. Everything below scales that one loop — never a second, disconnected product.

## 3. Vision → workstreams

| # | Workstream | What it is | Status |
|---|---|---|---|
| W1 | **Encyclopedia scale-out** | 30 → 100+ cards: planets complete, key moons, more constellations (zodiac, southern sky), spacecraft fleet (Hubble, Cassini, New Horizons, Artemis), stellar lifecycle chain, philosophy-of-science cards | Continuous, every session |
| W2 | **Visual exploration** | Constellations page (✅) → spacecraft schematic explorer → 3D starfield (r3f, HYG subset, per prior spec S+4) → orbital mechanics playground | Phase-gated |
| W3 | **Agents on the substrate** | Cosmos MCP v0.1 in `starlight-cosmos-engine` (cards as `cosmos://cards/{slug}` resources, prompts as MCP prompts, NASA fetchers as tools) → story-forge + research-companion agent presets consuming it | S+2 per prior spec — next code session in cosmos-engine |
| W4 | **Site agent** | "Ask the Cosmos" — an embedded agent on starlightintelligence.org answering from the card corpus (Vercel AI SDK, RAG over registry + markdown, cite cards). Gate: W3 first, so the agent consumes the same MCP the public gets | After W3 |
| W5 | **Multi-surface** | Expo/React Native app (offline card library + tonight's-sky view), desktop (Tauri preferred over Electron for footprint) — one content pipeline, three renderers | After 100+ cards (content moat first, apps second) |
| W6 | **Network visualization** | Starlight Network view: SIP nodes, protocol flows, attestation chains rendered like the knowledge-tree graph. Honest framing: visualization of the real SIS/SIP topology — no blockchain claims until an actual chain integration exists | Design doc first |
| W7 | **Monetization** | See §4 | Decision needed |

## 4. Monetization — honest options, one recommendation

Constraints: the encyclopedia must stay free (it's the distribution + SEO engine and the proof of the thesis); no paywall in front of knowledge cards; OSS substrate stays MIT.

| Model | What's paid | Risk |
|---|---|---|
| A. Cosmos Pro subscription | Site agent (W4) with generous free tier, saved exploration trails, exports | Low — standard SaaS on top of free content |
| B. Templates & packs | Story-universe starter kits, research-workflow templates, agent presets — one-time purchases | Low — matches existing FrankX template motion |
| C. Community lifetime | Founding-member lifetime tier for the builder community around the cosmos engine | Medium — lifetime pricing caps LTV; cap seat count |
| D. OSS + paid cloud | Cosmos engine/MCP free to self-host; hosted+managed version paid | Medium — ops burden before product-market fit |

**Recommendation: B now, A when W4 ships, C as a launch event, D last.** Templates monetize the existing audience without new infrastructure; the subscription needs the agent to exist first. Do not build billing before the thing billed for exists.

## 5. Sequencing (each phase falsifiable before the next)

1. **P1 — Substrate depth** (now → 100 cards): W1 continuous. Falsifier: no organic-traffic growth by 50+ cards → SEO thesis wrong, pause W5.
2. **P2 — Agent surface**: W3 Cosmos MCP v0.1 + story/research presets. Falsifier: no external MCP installs/stars in 60 days → distribution problem, fix before W4.
3. **P3 — Live agent + first revenue**: W4 site agent + monetization B→A.
4. **P4 — Multi-surface**: W5 Expo app (content pipeline already proven), W2 3D layer.
5. **P5 — Network layer**: W6 visualization; any chain/token work requires its own `/starlight-board` gate (sovereign-class).

## 6. Guardrails carried forward

- Facts: established figures only; estimates labeled; fast-moving numbers dated ("as of 2026") — Metrics Truth Rule applies to cosmos cards.
- Myth and science both present, never mixed — the constellation pages set the pattern (three labeled layers).
- Zero new runtime deps for content surfaces; three.js only at W2's 3D gate.
- Every surface additive; no URL renames.
- Board gates: anything touching SIP/attestation/chain economics is substrate-tier → `/starlight-board` before commit.

---

*Next session pick-up: W1 wave (planets + zodiac constellations) or W3 (Cosmos MCP v0.1 in starlight-cosmos-engine — consolidate the mcp-nasa-media / mcp-esa-webb / mcp-arxiv-space stubs into one `mcp-cosmos` server).*
