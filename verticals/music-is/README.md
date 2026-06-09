# Music IS — Arcanea Records operating layer

> Frank's operated music vertical. Four sub-labels, persona-multiplication, AI-native asset pipeline, OpenClaws amplification mesh, attribution-cascade royalty graph. The intelligence layer Arcanea Records runs above Suno + DistroKid + Spotify + the social mesh.

**Tier:** Operated vertical (private operating layer; not the public reference at `verticals/sound-intelligence/`).
**Owner:** Arcanea Records (under Arcanea BV).
**Primary repo (long-term):** `arcanea-ecosystem/labels/arcanea-records` per VERTICALS.md canon.
**This scaffold:** in-substrate mirror at `verticals/music-is/` for working alongside Starlight skills/agents during build phase. Migrates to dedicated repo when Phase 2 stabilizes.
**Status:** `scaffolded — v0.1` (2026-04-29).

---

## What this vertical is

Music IS is the operating layer for **Arcanea Records — four labels under one roof**:

| Label | Genre / posture | Audience | Lead persona seed |
|---|---|---|---|
| **Frank Riemer** | Neo-classical / cinematic-piano / contemplative | Deep-work, long-form-listening, film/TV sync candidates | Frank himself (artist-of-record) |
| **Frank's Vibes** | Electronic / lo-fi / chill-house / vibe-engineered | Gym, journaling, evening, creator-soundtrack | TBD codename (Phase 1) |
| **Arcanea** | Guardian / cinematic / mythic / score-grade | Worldbuilding canon, fans of Arcanea ecosystem, sync-grade | One persona per Guardian (12 candidates; Phase 1 picks first) |
| **Nona** | Punk / alt / abrasive / cathartic | Gym peak-state, rebellion-context, raw-energy moments | TBD codename (Phase 1) |

Each label has its own canon (sound DNA, visual DNA, voice DNA, audience, monetization stack). Personas sit under labels. Releases sit under personas. The catalog is the source of truth across all four.

This is **not** a public reference vertical. Sovereign sound practitioners forking the methodology should fork `verticals/sound-intelligence/` (the public substrate) and shape it to their own labels — not this Frank-specific operating layer.

---

## How Music IS composes with the rest of Starlight

| Layer | Composes from | Why |
|---|---|---|
| **Substrate** | SIP (this repo) — file contract, attestation, sovereignty clause | All artifacts ship with "Built on SIP" attestation; royalty graph references SIP attestation chain |
| **Sound Intelligence (public reference)** | `verticals/sound-intelligence/` | Composition architecture, sync brief-fit, metadata discipline imported as patterns; not duplicated |
| **Voice & Video IS** | `verticals/voice-video/` | Music videos, talking-head explainers, persona voice clones (with consent disclosure per persona) |
| **Genius IS (universal)** | substrate | Per-persona voice canon for social drops, fan emails, sync pitches |
| **Vision IS (universal)** | substrate | Each label's catalog reads as a coherent body of work, not a stream of disconnected releases |
| **Business IS (universal)** | substrate | Entity decisions (Arcanea BV → Arcanea Records → label splits), publishing splits, PRO registration |
| **Wealth IS (universal)** | substrate | Royalty-cascade graph integrated with Wealth IS theses + DPI tracking |
| **Arcanea canon** | `arcanea-ecosystem/canon` | Guardian → Arcanea-label persona mapping; mythic IP composes with cinematic catalog |

---

## The four-label architecture (canonical)

The labels are not interchangeable. Each carries a distinct sound DNA, visual DNA, voice DNA, and audience contract — and crucially, a distinct monetization stack.

**Frank Riemer** — the artist-of-record label. Frank himself releases here. Neo-classical, cinematic piano, contemplative. Audience = long-form listeners, deep-work soundtrack, film/TV sync candidates. Monetization stack: streaming (steady), sync (high-leverage), Bandcamp (direct), limited edition vinyl (Phase 6).

**Frank's Vibes** — the vibe-engineered electronic label. Lo-fi, chill-house, gym-energy, journaling-soundtrack. Designed for context-of-listening. Audience = creator-soundtrack listeners, gym crowd, journaling crowd, evening-vibe playlists. Monetization stack: streaming (volume), playlist placement, Spotify Canvas-driven discovery, sync (lifestyle/brand/ad).

**Arcanea** — the canon-bound mythic label. Each persona maps to one Guardian or canonical worldbuilding archetype. Cinematic, score-grade, narrative. Audience = Arcanea ecosystem fans, worldbuilders, score-grade sync candidates. Monetization stack: streaming (compounding via canon-loyalty), sync (film/TV/game), NFT/limited edition tied to Guardian canon (Phase 6), fan-tier direct (Discord).

**Nona** — the cathartic punk/alt label. Raw, abrasive, peak-state. Audience = gym peak-state, rebellion-context, energy-listeners. Monetization stack: streaming (volume in fitness/peak-state playlists), merch (Phase 4), live performance (Phase 5+).

Each label has its own LABELS sub-page: `verticals/music-is/labels/{frank-riemer,franks-vibes,arcanea,nona}/CANON.md`.

---

## Sub-systems

Six sub-systems compose into one operating intelligence:

| Sub-system | Domain | Lead agent | Skill pack |
|---|---|---|---|
| **Catalog** | Master CSV, draft/released/archived states, ISRC, metadata, version map | `music-archivist` (Haiku) | `music-is/catalog-systems` |
| **Persona** | Spawn, canon-defense, voice-lock, retire | `persona-keeper` (Opus, one per persona) | `music-is/persona-canon` |
| **Asset** | Cover (nano banana), motion (Seedance), cinematic (Higgsfield), shorts (Remotion), Spotify Canvas | `music-producer` (Sonnet) | `music-is/asset-render` |
| **Distribution** | DistroKid (streaming), Bandcamp (direct), frankx.ai/music (owned), per-platform metadata | `music-distributor` (Sonnet) | `music-is/distribution-flow` |
| **Amplification** | OpenClaws agents (5 per persona: X, IG, TikTok, YT, SP), Blotato + n8n orchestration | `music-amplifier` (Sonnet) | `music-is/amplification-mesh` |
| **Monetization** | Streaming, sync (Phase 6), NFT/limited (Phase 6), fan-tier (Phase 6), royalty-cascade graph | `royalty-architect` (Sonnet) | `music-is/royalty-graph` |

The seventh agent — `music-curator` (Opus) — is the A&R green-light gate. It does not own a sub-system; it gates `release` across all six.

---

## Commands

Eight user-facing commands:

| Command | Purpose | Model tier |
|---|---|---|
| `/music-song <suno-url> [persona]` | Capture Suno URL into catalog draft, queue assets | Haiku |
| `/music-persona <label> <name>` | Spawn new persona under a label with canon scaffold | Opus |
| `/music-release <song-id>` | Run the green-light gate; if pass, distro + schedule + commit | Opus (gate) → Sonnet (orchestrate) |
| `/music-label-board [label]` | Multi-persona portfolio scorecard (revenue, releases, amplification health) | Sonnet |
| `/music-suno-prompt <intent> [persona]` | Grounded Suno prompt synthesis from local knowledge corpus | Sonnet |
| `/music-amplify <song-id> <channels>` | Push existing release to N more channels | Sonnet |
| `/music-canvas <song-id>` | Generate Spotify Canvas + YT Short + IG Reel + TikTok cut | Sonnet |
| `/music-sync-pitch <song-id> <use-case>` | Generate sync-licensing pitch dossier | Sonnet (composes from sound-intelligence/sync-licensing patterns) |

All commands ship with "Built on SIP" attestation. Catalog rows reference attestation chain.

---

## Phase plan (v0.1)

See `STRATEGY.md` for the full 6-phase plan. Headline:

- **P0 spawn** (this week, 5d) — file contract, catalog seeded, three commands functional
- **P1 first persona + Suno mastery** (May 2026, 4w) — 12 releases through gate from one label
- **P2 asset pipeline autonomous** (Jun 2026, 4w) — autonomous render from Suno URL
- **P3 OpenClaws amplification mesh** (Q3 2026, 8w) — 5 Claws per persona, voice-locked
- **P4 multi-label scaling + dashboard** (Q4 2026, 8w) — 2nd label proven, frankx.ai/music/studio live
- **P5 productize Music IS template** (Q1 2027, 12w) — sell to musicians/labels
- **P6 monetization sovereignty** (Q2 2027 onward) — NFT/limited, sync direct, fan tiers, royalty cascade

---

## License & attestation

- **Operating layer** (this scaffold's structural patterns, command surface, sub-system map): MIT — fork-portable for any label.
- **Operating data** (Frank's catalog, persona canons, label CANONs, royalty graphs, fan data): proprietary to Arcanea BV. Not in public substrate.
- **Cross-party artifacts** (sync pitches, license deliveries, collaboration splits) ship with `/sip-attest` carrying "Built on SIP" plus Arcanea Records identifier. Audio uses `/sip-attest-audio`.

Sovereignty clause (SIP § 5) non-waivable.

---

**Built on SIP** — Music IS / Arcanea Records operating layer · v0.1 · 2026-04-29 · `verticals/music-is/` (in-substrate mirror; long-term home `arcanea-ecosystem/labels/arcanea-records`)
