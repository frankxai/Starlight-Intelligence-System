# VERTICALS — Registry of Intelligence Systems + Alliances

Two classes, one registry.

- **Sovereign verticals** — owned by a single entity, compound that entity's DPI, IP, and equity directly.
- **Alliances** — multi-node coordination under SIP, compound each node via "Built on SIP" attribution. Not owned. Not operated commercially by Starlight.

Both adopt the SIS pattern. Both carry `/sip-attest` on shipped artifacts. Registry is append-only; dormant entries remain listed with `status: dormant`.

This is the **public registry**. Active alliances and private verticals (Family IS, Spiritual IS, in-flight commercial details) are tracked separately by each owner — substrate adopters keep their own state.

---

## Sovereign verticals (operated)

### Arcanea
- **Class:** sovereign vertical
- **Domain:** Fiction, game, world-building, author stack, canonical Guardian / Vel'Tara / Hz system.
- **Owner:** Arcanea BV (Frank).
- **Status:** `active` — v3 architecture canonical.
- **Primary repo:** `frankxai/arcanea-ecosystem`.
- **Public surface:** `arcanea.ai`.
- **Canon:** **defines** — Arcanea canon is the first canon layer others may compose with (CC-BY-NC © Arcanea BV).
- **Compounds:** Arcanea BV (IP licensing, canon licensing, story IP, game IP).
- **SIP commands:** `/arcanea-canon`, `/arcanea-author`, `/arcanea-world`.

### FrankX
- **Class:** sovereign vertical (personal architect brand)
- **Domain:** Protocol thought leadership, architect voice, consulting funnel, Vibe OS surfacing.
- **Owner:** Frank Riemer (ZZP → Arcanea BV operating entity post-June 1).
- **Status:** `active` — v1 live at frankx.ai.
- **Primary repo:** `frankxai/frankx`.
- **Public surface:** `frankx.ai`.
- **Canon:** none required (may cite Arcanea as case study).
- **Compounds:** Frank's consulting practice + protocol adoption narrative.

### Anime Legends
- **Class:** sovereign vertical
- **Domain:** Anime-aesthetic fiction, character design, streaming-native storytelling, stylized creator content.
- **Owner:** Frank (under Arcanea BV or standalone sub-BV — TBD at BV formation).
- **Status:** `active — v0.5`.
- **Primary repo:** `frankxai/anime-legends` *(to be created)*.
- **Public surface:** `animelegends.ai` *(to be registered)* + `@animelegends` on social.
- **Canon:** composes with Arcanea canon (Guardian → anime character archetypes). Licensed reuse, auto-attested.
- **Compounds:** Arcanea BV (anime-flavored IP expansion) + dedicated catalog.
- **SIP commands:** `/anime-character`, `/anime-episode`, `/anime-canon-bridge`.

### GenCreator Community
- **Class:** sovereign vertical (community + movement layer)
- **Domain:** Membership and movement layer for sovereign creators adopting SIP. Composes on top of Creator IS.
- **Owner:** Frank (under Starlight Holding BV or Arcanea BV — TBD at BV formation).
- **Status:** `active — v0.5`.
- **Primary repo:** `frankxai/gencreator` *(to be created)*.
- **Public surface:** `gencreator.community` *(to be registered)*.
- **Canon:** none required; composes with Creator IS playbooks + optionally Arcanea for narrative-flavored creators.
- **Compounds:** membership revenue + retreat revenue + network density.
- **SIP commands:** `/gencreator-challenge`, `/gencreator-onboard`, `/gencreator-compose`.

### Creator IS
- **Class:** sovereign vertical (system / playbook layer — distinct from GenCreator Community)
- **Domain:** Creator economics, distribution, catalog compounding, audience sovereignty.
- **Owner:** Frank (open substrate, co-documented with GenCreator members).
- **Status:** `active — v1`.
- **Primary repo:** `frankxai/creator-is`.
- **Canon:** none.
- **SIP commands:** `/creator-playbook`, `/creator-catalog`, `/creator-compound`.

### Wealth IS / DPI
- **Class:** sovereign vertical
- **Domain:** Disruptive Passive Income, wealth intelligence, compounding capital architecture, tax-aware structuring.
- **Owner:** Frank / Starlight Holding BV.
- **Status:** `active — v0.1 (scaffolding)`.
- **Primary repo:** `frankxai/wealth-is`.
- **Canon:** none.
- **SIP commands:** `/wealth-dpi`, `/wealth-theses`, `/wealth-compound`.
- **Gate ladder:** illustrative defaults shipped with `/wealth-dpi`; each adopter sets their own gates.

### Music IS
- **Class:** sovereign vertical
- **Domain:** Catalog compounding, sync licensing, artist stack, streaming economics. Labels: Frank Riemer (neo-classical), Frank's Vibes (electronic), Arcanea (Guardian/cinematic), Nona (punk/alt).
- **Owner:** Arcanea Records (under Arcanea BV).
- **Status:** `active`.
- **Primary repo:** inside `arcanea-ecosystem/labels/arcanea-records`.
- **Canon:** composes with Arcanea canon (Guardian → artist mapping for Arcanea label).
- **Compounds:** Arcanea BV (royalties, sync licensing, catalog IP).

### Vibe OS (substrate)
- **Class:** sovereign vertical
- **Domain:** State engineering, ritual stack, chronotype architecture.
- **Owner:** FrankX.
- **Status:** `active — v0.5`.
- **Primary repo:** [`frankxai/vibe-os-substrate`](https://github.com/frankxai/vibe-os-substrate) (SIP-conformant vertical scaffold; frameworks MIT, personal data private).
- **Related repo:** [`frankxai/vibe-os`](https://github.com/frankxai/vibe-os) (frequency healing audio engine, Python) — composes with the substrate via Hz canon.
- **Canon:** optional — Hz grounding composes from Arcanea.
- **Compounds:** FrankX content + potential productized offer.
- **SIP commands:** `/vibe-ritual` · `/vibe-chronotype` · `/vibe-state`.

### Family IS
- **Class:** sovereign vertical (private)
- **Domain:** Multi-generational infrastructure, family office intelligence, relational architecture, legacy systems. Renamed from "Relational IS" per MASSIVE_ACTION_PLAN.md (2026-04-25) to align with the 10-IS taxonomy. Public surface stays minimal; instance state remains private.
- **Status:** `private — never public-facing`.
- **Substrate home:** `verticals/family/` (scaffold; instance state stays in private/).
- **Agent:** `starlight-relational` (agent name preserved; the layer it serves is now Family).

### Spiritual IS
- **Class:** sovereign vertical (private, founder-layer)
- **Domain:** Consciousness practice integration.
- **Status:** `private`. Public compositions surface only through Vibe OS where the founder chooses. **Never imposed on adopters of SIP.**

### Code IS
- **Class:** sovereign vertical (Intelligence System layer)
- **Domain:** Product & automation intelligence. Coding agents, MCP server design, agent harness operations, automation playbooks. Wraps existing `/arco` brand router + `/ao` CLI router into a coherent IS for sovereign builders.
- **Owner:** Frank (open substrate, composes with operational layer).
- **Status:** `scaffolded — v0.1`.
- **Primary repo:** `verticals/code/` in `frankxai/Starlight-Intelligence-System`.
- **Canon:** none.
- **Compounds:** Code IS playbook + MCP/agent ops practice.

### Voice & Video IS
- **Class:** sovereign vertical (Intelligence System layer)
- **Domain:** Narrative media intelligence. Voice cloning, talking-head pipelines, podcast architecture, video factory operations, ElevenLabs/Suno/Veo orchestration. Composes Creator IS with the modality attestation commands (`/sip-attest-audio`, `/sip-attest-video`).
- **Owner:** Frank (open substrate; composes with Music IS catalog).
- **Status:** `scaffolded — v0.1`.
- **Primary repo:** `verticals/voice-video/` in `frankxai/Starlight-Intelligence-System`.
- **Canon:** optional Hz / Arcanea composition for music-side workflows.
- **Compounds:** Voice & Video IS playbook + creator pipeline outputs.

### Starlight Intelligence (the substrate)
- **Class:** sovereign substrate (the substrate itself, not a vertical)
- **Domain:** SIP protocol, SIS substrate, Alliance forging method, Starlight Console, canonical registry. Hosts the master **Starlight Orchestrator** layer at `core/orchestrator/` that routes the other nine universal IS.
- **Owner:** Frank Riemer / Starlight Holding BV.
- **Status:** `active — v1.0.0 spec shipped`.
- **Primary repo:** `frankxai/Starlight-Intelligence-System`.
- **Public surface:** `starlightintelligence.org`.
- **License:** MIT for spec + reference commands. Proprietary for any future Starlight Console managed tier.
- **Compounds:** Starlight Holding (protocol attribution at scale, canonical authority).

---

## Alliances (coordinated, not operated by Starlight)

Alliances are multi-node coordination arrangements forged under SIP. Starlight does **not** own, operate, or monetize them directly. Starlight's compounding is indirect: every alliance artifact ships with "Built on SIP" attestation.

Active alliance nodes are tracked privately by each alliance — the substrate registry only declares the *class* of alliances welcome. Alliance forging is documented in `ALLIANCE.md`. New alliances spawn via `/alliance-forge`.

Frank's personal posture toward alliances: **freely and abundantly.** Time and architectural guidance are gifted; ownership stays with each node. This is a chosen stance, not a default — see `ALLIANCE.md` § Posture for rationale.

---

## Sovereign domain sub-stacks (verticals built on SIP via /spawn-domain-stack)

Domain sub-stacks are forkable reference verticals. Unlike the sovereign verticals above (operated by a specific entity), these are anonymized scaffolds that sovereign practitioners fork into their own private practice via `/sovereign-spawn` or `/spawn-domain-stack`. Attribution compounds via "Built on SIP" on shipped artifacts; no ownership claim transfers.

### People Intelligence
- **Class:** sovereign domain sub-stack (reference vertical)
- **Domain:** People practiced as people-flourishing science — six sub-systems (Hiring, Performance, Training, Culture, Talent, Org) composed into one cohesive intelligence stack.
- **Owner:** open reference (forkable by sovereign practitioners).
- **Status:** `scaffolded — v0.1.2` (renamed from HR Intelligence at v7.6.0 — Path A authorless symmetric naming with Sound Intelligence).
- **Primary repo:** `verticals/people-intelligence/` in `frankxai/Starlight-Intelligence-System`.
- **Sub-systems:** `hiring` · `performance` · `training` · `culture` · `talent` · `org`.
- **Canon:** declines defining its own canon; optional composition with Arcanea canon (Hz grounding) where practitioner adopts.
- **Compounds:** practitioners forking + attestation graph compounding across every forked instance.
- **SIP commands:** 28 commands across `/hire-*` (5) · `/perf-*` (5) · `/training-*` (5) · `/culture-*` (4) · `/talent-*` (5) · `/org-*` (4) prefixes.

### Sound Intelligence
- **Class:** sovereign domain sub-stack (reference vertical) — second reference, validates the Domain Sub-Stack Tier pattern beyond HR.
- **Domain:** Sound practiced as the architecture of sustained listening + the catalog that compounds — six sub-systems (Composition, Production, Catalog, Performance, Audience, Sync) composed into one cohesive intelligence stack.
- **Owner:** open reference (forkable by sovereign sound practitioners). Distinct from `Music IS` which is Frank's specific operated music vertical (Arcanea Records, four labels).
- **Status:** `scaffolded — v0.1 (complete — 6 of 6 sub-systems with full command surface; 30 commands shipped)`.
- **Primary repo:** `verticals/sound-intelligence/` in `frankxai/Starlight-Intelligence-System`.
- **Sub-systems:** `composition` · `production` · `catalog` · `performance` · `audience` · `sync`.
- **Canon:** declines defining its own canon; optional composition with Arcanea Hz canon (CC-BY-NC) for frequency-grounded sound design.
- **Compounds:** practitioners forking + attestation graph compounding across every forked instance.
- **SIP commands:** 30 commands across `/sound-composition-*` (5) · `/sound-production-*` (5) · `/sound-catalog-*` (5) · `/sound-performance-*` (5) · `/sound-audience-*` (5) · `/sound-sync-*` (5).
- **Synthesis edge:** composer + producer + audio engineer + decade of catalog/release operations + literacy in music-theory + cognitive-science-of-listening + business-of-sync-licensing.

---

## Registry rules

- New verticals spawn via `/vertical-spawn`. New alliances forge via `/alliance-forge`.
- Canon dependencies are declared; silent canon usage is a protocol breach.
- Verticals adopting another's canon carry its license terms (Arcanea canon = CC-BY-NC).
- Every vertical carries its own `SIS-instance.md` with domain, ICP, open/closed boundary.
- Alliances list nodes per `ALLIANCE.md` § Node definition; decision rights are explicit per node domain.
- **Alliances Frank contributes to freely do not grant Starlight any ownership claim** on the alliance or its artifacts. Attribution via SIP is the sole compounding mechanism.

---

**Built on SIP** · v1.1 · MIT
