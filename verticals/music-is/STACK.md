# STACK — Music IS / Arcanea Records

> Operator stack for the operated label. Inherits substrate L0/L1/L3; overrides L2 (AI-music tooling), L4 (catalog + assets + canon), L5 (distribution + amplification mesh), L6 (per-label fan loops).

## Inheritance

- **Starlight STACK:** inherited unless noted.
- **Sound Intelligence (public reference) patterns:** imported where compatible (composition architecture, sync brief-fit, metadata discipline, mastering reference).
- **Override scope:** L2 (AI-music tooling — Suno + asset pipeline), L4 (catalog + per-label canon + royalty graph), L5 (distribution + OpenClaws amplification mesh), L6 (per-label fan loops).

## Layers

| Layer | Purpose | Music IS uses | Reason if override |
|---|---|---|---|
| **L0 — OS / shell** | Workstation | inherited (macOS / Windows / Linux per Frank) | No music-IS-specific OS requirement |
| **L1 — Source control** | Repo + commits | inherited; long-term home `arcanea-ecosystem/labels/arcanea-records` | This in-substrate scaffold is mirror; private fork for catalog data |
| **L2 — AI tooling + music engines** | Assistants + generation engines | **override — see below** | Suno + nano banana + Seedance + Higgsfield + Remotion + Blotato + n8n is a sound-specific stack not in substrate default |
| **L3 — Language + runtime** | Code | TypeScript / Node 20 (Remotion + n8n + dashboard); Python (Suno API wrappers, royalty graph utilities) | Remotion requires Node; royalty-graph utilities are Python-friendly |
| **L4 — Data + state** | Catalog, persona canon, assets, royalty graph | **override — see below** | Sovereignty-critical multi-layer state |
| **L5 — Distribution + amplification** | Streaming + direct + amplification mesh | **override — see below** | DistroKid + Bandcamp + frankx.ai/music + OpenClaws Claws |
| **L6 — Community + feedback** | Per-label fan loops | **override — see below** | Four labels, four audience contracts, four community substrates |

---

## L2 override — AI-music tooling

**Generation engines (engine-agnostic at contract; per-row engine in catalog):**

| Engine | Use | Status |
|---|---|---|
| **Suno v5** | Primary song generation; lyric + structure + genre control | Active |
| **Suno API** (when stable) | Programmatic generation, batch iteration | Awaiting public stability |
| Udio | Backup / comparison generations | Optional |
| Stable Audio | Instrumentals, ambient, sound design layers | Optional |
| Custom LoRA / open-weights | Future — train per-persona model on label-curated dataset | Phase 6+ |

**Asset pipeline:**

| Stage | Engine | Use |
|---|---|---|
| **Cover art** | nano banana 2 | Persona-locked via reference images; canon-anchored prompt |
| **Cover variations** | nano banana 2 + manual curation | Square (Spotify), 16:9 (YT), portrait (Bandcamp) |
| **Music video — performance/motion** | Seedance 2 | Per-persona visual DNA; canon-locked |
| **Music video — cinematic** | Higgsfield | Score-grade, narrative; primarily Frank Riemer + Arcanea labels |
| **Shorts / Canvas / Reels** | Remotion | Programmatic per-persona templates; 9:16 + 1:1 + 16:9 outputs |
| **Lyric videos** | Remotion + Whisper alignment | Per-persona typography lock |
| **Spotify Canvas** | Remotion (3-8s loop, 9:16, 1080×1920, MP4 ≤8MB) | Per-release; uploaded via `/music-canvas` |

**AI assistants:**

| Tier | Model | Use |
|---|---|---|
| **Apex** | Opus 4.7 | Persona canon definition, A&R green-light, brand-narrative, monetization-stack design |
| **Senior** | Sonnet 4.6 | Suno prompt synthesis, social copy, Canvas concepting, sync pitch composition |
| **Mechanical** | Haiku 4.5 | Catalog CRUD, metadata tagging, social drop scheduling, status checks |
| **External** | Suno API + nano banana + Seedance + Higgsfield + Remotion + Blotato + n8n | Out-of-band, called via MCP or direct API |

Per-Agent dispatch: `model:` set explicitly per `feedback_model_routing_discipline`.

**Workflow orchestration:**

- **n8n** — primary workflow runner (asset pipeline, social drops, fan-list automations, royalty observation)
- **Blotato** — cross-platform publishing primitives (the Claws compose against)
- **Remotion** — programmatic video render pipeline (runs as Node service, called from n8n)
- **Cowork artifacts** — for live observability surfaces (label-board, persona-canon-viewer, royalty-graph-viewer)

---

## L4 override — Data + state

**The constraint:** sovereignty-critical multi-layer state — persona canons (creative IP), Suno history (engine state), catalog (truth), royalty-cascade graph (monetization state), unreleased material (pre-publication confidentiality), per-platform audience data.

**Sovereignty pattern:**

1. **Public substrate (`verticals/music-is/` here in Starlight repo) carries no unreleased songs, no per-fan identifying data, no platform-OAuth tokens, no royalty-graph leaves, no client-confidential canon.** Reference scaffold and structural patterns only.

2. **Operating data lives in private Arcanea Records repo (long-term: `arcanea-ecosystem/labels/arcanea-records`).** Gitignored within Starlight; encrypted at rest.

3. **Catalog source-of-truth:**
   - `catalog/master.csv` — Excel/CSV master, offline-readable, vendor-lock-free
   - `catalog/draft/` — pre-gate songs (one row per generation iteration, includes Suno URL, prompt used, engine version, persona, label)
   - `catalog/released/` — post-gate songs, immutable; indexed by ISRC after DistroKid mint
   - `catalog/archived/` — withdrawn/deprecated releases
   - `catalog/royalty-graph.json` — attribution-cascade entries per release

4. **Per-label namespace:** `verticals/music-is/labels/{frank-riemer,franks-vibes,arcanea,nona}/`:
   - `CANON.md` — label canon (sound DNA, visual DNA, voice DNA, audience, monetization stack)
   - `personas/` — personas under the label
   - `releases-index.md` — pointer index to released songs
   - `playlist-strategy.md` — Spotify playlist targets, pitch positioning

5. **Per-persona namespace:** `verticals/music-is/labels/<label>/personas/<persona-codename>/`:
   - `CANON.md` — persona canon (sound + visual + voice + audience + monetization)
   - `assets/` — reference images, voice samples (with consent disclosure), brand kit
   - `social/` — Claw voice-lock samples per platform, banned phrases, frequency caps

6. **Knowledge corpus:** `verticals/music-is/knowledge/`:
   - `suno/` — prompt-pattern-library, genre-style-cards, vocal-control-recipes, structure-tags-reference, known-bugs-workarounds
   - `distribution/` — DistroKid quirks, Bandcamp practice, Spotify Canvas spec, sync library briefs
   - `monetization/` — sync platforms, NFT mints, fan-tier comparisons, royalty rate references
   - `engines/` — per-engine reference docs (Suno, Udio, Stable Audio, future)

7. **Royalty-cascade graph:** `catalog/royalty-graph.json`:
   - Schema: per-release entry with parent (canon source), contributors (split %), platform splits, on-chain mint reference (if Phase 6+)
   - Updated on every `/music-release` pass

---

## L5 override — Distribution + amplification

### Distribution rails

| Rail | Use | Posture |
|---|---|---|
| **DistroKid** | Streaming primary (Spotify, Apple, Tidal, YT Music, Amazon, Pandora, Deezer) | Owner-keeps-rights flat-fee; metadata locked from catalog at `/music-release` |
| **Bandcamp** | Direct fan tier + limited editions (Phase 1+) | Direct sales, fan email capture, name-your-price experiments per label |
| **frankx.ai/music** | Owned distribution (auto-synced from `catalog/released/`) | Per-label sub-pages from Phase 4 |
| **Spotify for Artists** | Canvas + playlist pitching | Canvas auto-uploaded via `/music-canvas`; pitching via `/music-release` checklist |
| **Sound.xyz / Catalog / Zora** | NFT / limited editions (Phase 6) | Mint-from-canon; royalty-cascade graph encoded on-chain |
| **Sync libraries** (Musicbed, Artlist, Songtradr, Pond5, Position Music) | Sync rail (Phase 6) | Per-label-canon-aligned; `/music-sync-pitch` per use-case |
| **Direct sync deals** (brand/film/game/ad) | Sync direct (Phase 6+) | Negotiated against royalty-cascade graph |

**Refused rails:** all-rights-flips for advance; aggregators that take master ownership; "free distribution" that takes streaming royalties; platforms without published royalty-rate transparency; paid-playlist-placement networks.

### Amplification mesh (OpenClaws — Phase 3+)

5 autonomous agents per persona, each canon-voice-locked:

| Claw | Platform | Posture |
|---|---|---|
| **Claw-X** | X / Twitter | Long-form post + thread + reply engagement; never DM; AI-disclosed per persona bio |
| **Claw-IG** | Instagram | Reel + carousel + stories; visual-DNA-locked |
| **Claw-TT** | TikTok | Vertical short + sound-grab + duet hooks; trends-aware but canon-anchored |
| **Claw-YT** | YouTube Shorts + main | Shorts upload + community post + comment seeding; main reserved for full releases |
| **Claw-SP** | Spotify | Canvas upload + playlist pitching + monthly-listener observation |

Orchestrated by `music-amplifier` agent. Backed by Blotato (publishing) + n8n (workflow + safety gates). Every post passes persona-voice-check. **Frequency cap: 3 drops/day per persona across mesh.** Bot-mesh fan-engagement refused at architecture.

---

## L6 override — Community + per-label fan loops

Four labels, four audience contracts, four community substrates:

| Label | Mailing list | Discord/Geneva | Fan-tier (Phase 6+) | Notes |
|---|---|---|---|---|
| **Frank Riemer** | Substack — long-form artist letters | none | Bandcamp subscriptions | Deep-listener audience; quality > volume |
| **Frank's Vibes** | none initially; ConvertKit when warranted | none | Spotify Canvas-driven discovery | Algorithmic + playlist-first |
| **Arcanea** | Composes with Arcanea ecosystem newsletter | Discord (Arcanea ecosystem) | NFT/limited editions tied to Guardian canon | Canon-bound; fan loops compose with Arcanea |
| **Nona** | none initially | none | Merch + live (Phase 5+) | Peak-state energy; venue-driven |

**Per-label compliance:** every persona's bio on every platform names AI-generated music produced by Arcanea Records; per-platform AI-content policies respected; vocal impersonation refused without written consent on file.

---

## Sound-specific MCP servers (planned + live)

| MCP | Status | Purpose |
|---|---|---|
| `suno-mcp` | Planned (Phase 1) | Suno API: generate, fetch, list-history |
| `distrokid-mcp` | Planned (Phase 2) | DistroKid web automation: upload, metadata, status |
| `bandcamp-mcp` | Planned (Phase 6) | Bandcamp upload + fan-list export |
| `spotify-artists-mcp` | Planned (Phase 4) | Canvas upload, monthly listener fetch, playlist pitch |
| `blotato-mcp` | Live (general) | Cross-platform social publishing primitives |
| `n8n-mcp` | Live (general) | Workflow orchestration |

External APIs called directly (no MCP wrapper at v0): nano banana 2, Seedance 2, Higgsfield, Remotion (local Node service).

---

**Built on SIP** — Music IS vertical STACK.md · v0.1 · 2026-04-29 · Inherits Starlight L0/L1/L3 · Operator overrides at L2/L4/L5/L6.
