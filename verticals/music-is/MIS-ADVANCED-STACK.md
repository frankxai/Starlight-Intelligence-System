# MIS Advanced Stack — Integration Map

> The full May 2026 top-producer tooling stack mapped onto Music IS. 40+ tools, 24 MCP priorities, 15 new skills, Bridge v2 upgrades. The composition layer between Music IS substrate and the producer's external world.

**Status:** v0.1 reference · 2026-04-30
**Companion docs:** `STACK.md` (operator-side layers), `SUB-SYSTEMS.md` (sub-system map), `STRATEGY.md` (phase plan)

---

## The composition principle

Music IS is the **intelligence layer.** The 40+ tools below are the **substrate.** The Bridge is the **surface.** Each MCP exposes a substrate tool to the intelligence layer; each skill composes one-or-more MCPs into a sub-system operation; each Bridge panel surfaces one-or-more skills to the operator.

```
SUBSTRATE (40+ tools)
   │ via MCP connectors (24 priorities)
   ▼
INTELLIGENCE (Music IS skills, 24 total: 9 ship + 15 new)
   │ via Cowork artifact buttons + chat commands
   ▼
SURFACE (Bridge v1 shipped, v2 planned)
   │ via persona modes
   ▼
OPERATOR (Frank, single-pilot cockpit)
```

---

## 1. Generation engines

| Engine | Role | MCP | Phase |
|---|---|---|---|
| **Suno v5** | Primary AI music gen (live) | `suno-mcp` (P0) | Phase 1 |
| **Udio** | Alt engine for A/B | `udio-mcp` (P1) | Phase 2 |
| **Stable Audio** | Instrumental + ambient layers | `stable-audio-mcp` (P2) | Phase 3 |
| **AIVA** | Orchestral cinematic | `aiva-mcp` (P2) | Phase 4 (Arcanea) |
| **Custom LoRA / open-weights** | Per-persona trained | local pipeline | Phase 6+ |
| **Mubert / Riffusion / Endel** | Functional music | optional | not core |

**Composition:** Multi-engine prompt synthesis routes the same intent through 2-3 engines simultaneously for A/B curation. The `multi-engine-prompt` skill (P1) handles this.

---

## 2. Voice / vocal layer

| Tool | Role | MCP | Phase |
|---|---|---|---|
| **ElevenLabs** | Voice cloning + AI vocals | `elevenlabs-mcp` (P1, consent-gated) | Phase 1 (Frank's voice only) |
| **Kits.AI** | Vocal-only AI | `kits-mcp` (P3) | Phase 6+ |
| **iZotope Vocal Synth** | Vocal processing | local DAW plugin | Phase 1 |

**Refusal:** vocal-impersonation of any identifiable non-Frank artist refused without written consent on file (per D11). The `voice-clone-ethics-gate` skill enforces this structurally.

---

## 3. DAW + production

Frank's DAW choice is sovereign — most likely **Ableton Live 12** for electronic/arrangement (Frank's Vibes, Nona) + **Logic Pro** for songwriting (Frank Riemer neo-classical). No MCP needed for DAWs — they live local. The integration is via **bounced master files** that flow into the asset pipeline.

| Tool | Notes |
|---|---|
| Ableton Live 12 | Primary; session view for arrangement |
| Logic Pro | macOS; songwriting + classical-leaning sessions |
| Pro Tools | Industry sync delivery (Frank Riemer + Arcanea labels) |
| Reaper | Cross-platform, scriptable alternative |

---

## 4. Audio post-production

| Tool | Role | MCP | Phase |
|---|---|---|---|
| **iZotope RX 11** | Stem separation + audio cleanup | `izotope-rx-mcp` (P1, CLI bridge) | Phase 1 |
| **iZotope Ozone 11** | Mastering chain | local plugin | Phase 1 |
| **LANDR** | AI mastering | `landr-mcp` (P1) | Phase 1 |
| **Demucs** (open-source) | Free stem separation | `demucs-mcp` (P1, self-hosted) | Phase 1 |
| **AudioShake** | Sync-grade stem delivery | `audioshake-mcp` (P2) | Phase 6 |
| **Mixed In Key** | BPM + key detection | `mixedinkey-mcp` (P2, CLI bridge) | Phase 1 |

**Composition:** `mastering-chain` skill orchestrates LANDR → Ozone refinement → reference comparison. `stem-prep` skill auto-separates Suno masters via Demucs/RX for sync delivery.

---

## 5. Visual asset layer

| Tool | Role | MCP | Phase |
|---|---|---|---|
| **nano banana 2** | Cover art primary | direct API call | Phase 1 (live) |
| **Seedance 2** | Motion video | direct API call | Phase 1 (live) |
| **Higgsfield** | Cinematic video | `higgsfield-mcp` (P0, live per Frank's stack) | Phase 1 (live) |
| **Remotion** | Programmatic video (Canvas, lyric videos) | local Node service | Phase 1 (live) |
| **Runway Gen-3 / Kling / Pika** | Alt motion engines | `runway-mcp` etc. (P2) | Phase 3 |
| **HyperFrames** | Sub-skills already installed in Frank's stack | composes with visual pipeline | Phase 1 |
| **Midjourney v7** | Cover alternative | `midjourney-mcp` (P3) | Phase 4+ |

---

## 6. Distribution layer

| Tool | Role | MCP | Phase |
|---|---|---|---|
| **DistroKid** | Primary streaming | `distrokid-mcp` (P0, web automation) | Phase 1 |
| **Bandcamp** | Direct fan rail | `bandcamp-mcp` (P1) | Phase 1 |
| **TuneCore / CD Baby / Stem / AWAL / The Orchard** | Alt distributors | optional | Phase 6+ if needed |
| **UnitedMasters** | Hip-hop / R&B focus | optional | not core |

**Refusal:** any distributor that takes master ownership (refused per D5). Any aggregator that pays-for-rights-flip refused.

---

## 7. DSP analytics (the feedback loop)

| Tool | Role | MCP | Phase |
|---|---|---|---|
| **Spotify for Artists** | Streams, listeners, playlists, Canvas, Marquee, Discovery Mode | `spotify-artists-mcp` (P0) | Phase 1 |
| **Apple Music for Artists** | Streams + Shazam | `apple-artists-mcp` (P1) | Phase 2 |
| **YouTube Studio** | Music + Shorts | `youtube-studio-mcp` (P2) | Phase 3 |
| **Chartmetric** | Cross-DSP aggregator | `chartmetric-mcp` (P1, paid API) | Phase 2 |
| **Soundcharts** | Playlist tracking + curator outreach | `soundcharts-mcp` (P2) | Phase 3 |

**Composition:** `dsp-analytics-aggregate` skill (P2) pulls all sources into per-song / per-persona / per-label / per-month rollup; feeds the Bridge Analytics panel.

---

## 8. Sync libraries + direct deals

| Tool | Role | MCP | Phase |
|---|---|---|---|
| **Musicbed** | Premium cinematic | `musicbed-mcp` (P1) | Phase 1 first pitches |
| **Marmoset** | Cinematic + indie | `marmoset-mcp` (P1) | Phase 1 |
| **Position Music** | Trailer-grade (Arcanea fit) | `position-music-mcp` (P2) | Phase 2 |
| **Songtradr** | Volume sync | `songtradr-mcp` (P2) | Phase 3 |
| **Audiosocket / MassiveMusic / UPM / APM / Audio Network / Pond5** | Library tier | optional | Phase 3+ |
| **Lickd** | YouTube-cleared library | optional | Phase 6+ |
| **Direct music supervisor outreach** | Premium tier (Frank-driven) | email automation | Phase 3+ |

**Refusal:** sync deals taking exclusive worldwide rights without justification refused. Cascade-violating deals refused.

---

## 9. Rights / royalties

| Tool | Role | MCP | Phase |
|---|---|---|---|
| **GEMA (DE)** | Frank's PRO (EU) | `gema-mcp` (P1, if API) | Phase 1 |
| **PRS / SoundExchange / ASCAP** | International PROs | optional | Phase 6+ |
| **Songtrust** | Publishing admin | `songtrust-mcp` (P1) | Phase 2 |
| **SoundExchange** | US neighboring rights | optional | Phase 6+ |

---

## 10. Promotion / amplification

| Tool | Role | MCP | Phase |
|---|---|---|---|
| **Blotato** | Cross-platform social | `blotato-mcp` (P0, live) | Phase 3 (OpenClaws) |
| **Linkfire / FFM.to / Show.co** | Smart links + tracking | `linkfire-mcp` (P1) | Phase 1 |
| **SubmitHub** | Playlist pitching | `submithub-mcp` (P1) | Phase 2 |
| **Groover / Daily Playlists** | Pitching networks | `groover-mcp` (P2) | Phase 3 |
| **Buffer / Typefully** | Schedule alt | optional | not core |
| **n8n** | Workflow orchestration | `n8n-mcp` (P0, live) | Phase 2+ |

---

## 11. Web3 / sovereign monetization (Phase 6+)

| Tool | Role | MCP | Phase |
|---|---|---|---|
| **Sound.xyz** | NFT music platform | `sound-xyz-mcp` (P3) | Phase 6 |
| **Catalog** | NFT music | `catalog-mcp` (P3) | Phase 6 |
| **Zora** | NFT protocol | `zora-mcp` (P3) | Phase 6 |
| **Royal** | Royalty tokenization | `royal-mcp` (P3) | Phase 6 |
| **Decent** | Audius alternative | optional | Phase 6+ |

**Composition:** `web3-mint-design` skill enforces cascade-on-chain encoding before any mint (D14, refused otherwise).

---

## 12. Fan-tier / community (Phase 6+)

| Tool | Role | MCP | Phase |
|---|---|---|---|
| **Bandcamp Subscriptions** | Per-artist fan tier | `bandcamp-mcp` (P1) | Phase 1 (Frank Riemer + Arcanea) |
| **Patreon** | Creator subscriptions | `patreon-mcp` (P2) | Phase 6+ |
| **Substack / ConvertKit / Buttondown** | Newsletter | `substack-mcp` (P1) | Phase 1 (Frank Riemer) |
| **Discord** | Fan community | `discord-bot-mcp` (P1) | Phase 4 (Arcanea + Alera channel) |
| **Geneva** | Premium community | optional | Phase 6+ |

---

## 13. Sample / sound design (sovereignty-aware)

| Tool | Role | MCP | Phase |
|---|---|---|---|
| **Splice** | Sample marketplace | `splice-mcp` (P2) | Phase 2 |
| **Tracklib** | Cleared sample licensing | `tracklib-mcp` (P1) | Phase 1 |
| **Output Arcade / Co-Producer** | Loop generation | local | Phase 1 |
| **Native Instruments Komplete** | Sounds + Massive X | local | Phase 1 |

**Composition:** `sample-clearance` skill enforces cleared-or-refuse. No uncleared samples in `released` status.

---

## 14. Lyrics / metadata

| Tool | Role | MCP | Phase |
|---|---|---|---|
| **Whisper** (OpenAI) | Voice memo / audio transcription | `whisper-mcp` (P0) | Phase 1 |
| **LyricFind** | Lyrics rights | `lyricfind-mcp` (P2) | Phase 2 |
| **Musixmatch** | Lyrics platform | `musixmatch-mcp` (P2) | Phase 2 |

**Composition:** `voice-memo-to-prompt` skill chains Whisper → intent-classify → persona-canon-ground → Suno-prompt-generate.

---

## 24-MCP priority roadmap

### P0 — Phase 0-1 critical path (need before first release)

1. **`suno-mcp`** — generate, fetch history, list creations (replaces UI scraping)
2. **`distrokid-mcp`** — upload automation, ISRC pull, statement parsing
3. **`spotify-artists-mcp`** — Canvas upload, playlist pitch, listener stats
4. **`whisper-mcp`** — voice memo → text (unblocks Mobile Inbox voice-memo type)

### P1 — Phase 1-2 (compound during first 12-30 releases)

5. **`bandcamp-mcp`** — uploads + fan list + sales + subscriptions
6. **`landr-mcp`** — AI mastering pipeline
7. **`izotope-rx-mcp`** — stem separation (CLI bridge if no official API)
8. **`demucs-mcp`** — open-source stem sep (self-hosted)
9. **`chartmetric-mcp`** — cross-DSP analytics aggregator
10. **`linkfire-mcp`** — smart links per release
11. **`musicbed-mcp`** — sync library uploads + pitch tracking
12. **`marmoset-mcp`** — cinematic sync library
13. **`submithub-mcp`** — playlist pitching automation
14. **`elevenlabs-mcp`** (consent-gated) — vocal generation
15. **`gema-mcp`** — Frank's PRO (EU)
16. **`discord-bot-mcp`** — Arcanea fan community automation
17. **`substack-mcp`** — Frank Riemer artist letters
18. **`tracklib-mcp`** — cleared sample licensing
19. **`songtrust-mcp`** — publishing admin

### P2 — Phase 3-4 (amplification + multi-label scaling)

20. **`udio-mcp`** — alt generation engine
21. **`apple-artists-mcp`** — Apple analytics + Shazam
22. **`youtube-studio-mcp`** — YouTube + Shorts analytics
23. **`soundcharts-mcp`** — playlist tracking + curator outreach
24. **`mixedinkey-mcp`** — BPM + key analysis

### P3 — Phase 6+ (web3 sovereignty + fan-tier scale)

25. **`sound-xyz-mcp`**, **`catalog-mcp`**, **`zora-mcp`** — NFT minting (per release with cascade graph)
26. **`patreon-mcp`** — creator subscriptions
27. **`royal-mcp`** — royalty tokenization

---

## 15 new skills to build

Composing MCPs into Music IS sub-system operations:

| # | Skill | Phase | Composes |
|---|---|---|---|
| 1 | `multi-engine-prompt` | P1 | suno-mcp + udio-mcp + stable-audio-mcp; A/B variants |
| 2 | `voice-memo-to-prompt` | P1 | whisper-mcp + suno-prompt; Mobile Inbox voice-memo type |
| 3 | `reference-track-ab` | P1 | (Spotify/YouTube URL) + active persona canon; compares + suggests prompt adjustments |
| 4 | `stem-prep` | P1 | demucs-mcp / izotope-rx-mcp; sync-grade stems |
| 5 | `mastering-chain` | P1 | landr-mcp + local Ozone; per-label master spec (sync-grade vs streaming-loudness) |
| 6 | `key-bpm-analyze` | P1 | mixedinkey-mcp; auto-populate catalog row fields |
| 7 | `sync-deliverable-pack` | P1 | royalty-graph + master + stems + ISRC + cue-sheet + cleared-rights doc → zip |
| 8 | `dsp-analytics-aggregate` | P2 | spotify-artists-mcp + apple-artists-mcp + chartmetric-mcp + youtube-studio-mcp |
| 9 | `playlist-pitch-automation` | P2 | submithub-mcp + groover-mcp + spotify-artists-mcp; auto-pitch per release |
| 10 | `smart-link-orchestration` | P2 | linkfire-mcp; per-release with UTM + cross-platform funnel |
| 11 | `lyric-rights-registration` | P2 | lyricfind-mcp + musixmatch-mcp + gema-mcp; cue-sheet generation |
| 12 | `sample-clearance` | P2 | tracklib-mcp + splice-mcp; rights trail per sample-using release |
| 13 | `fan-tier-ops` | P6 | bandcamp-mcp + patreon-mcp + discord-bot-mcp; per-persona fan economics |
| 14 | `web3-mint-design` | P6 | sound-xyz-mcp / catalog-mcp / zora-mcp; cascade-on-chain encoding before mint |
| 15 | `voice-clone-ethics-gate` | P6 | elevenlabs-mcp + consent-doc registry; refuses non-Frank without written consent |

---

## Bridge v2 expansion (after v1.5 + post-Migration-A)

Specific UI surfaces the new MCPs unlock:

### Spark Zone v2 (P1)
- Multi-engine toggle (Suno / Udio / Stable Audio)
- Reference-track drop field (Spotify/YouTube URL → ref-ab analysis)
- Voice memo upload + Whisper transcribe inline
- Last-5-prompts chip history per persona

### Studio v2 (P1-P2)
- Embedded Suno player iframe in track cards
- Per-track waveform visualizer (Web Audio API)
- Master chain status badge (raw / LANDR / Ozone-refined)
- Stem availability badge ("📦 stems ready" for sync-pitch)
- One-click sync-deliverable-pack on released tracks

### Analytics ribbon (P2)
- Spotify monthly listeners sparkline per persona
- Top playlist additions this week
- Stream count + save-rate deltas
- Shazam tags (Apple) — sync-discovery leading indicator

### Frequency analyzer (Arcanea mode, P2)
- Live spectrum on track selection
- Guardian frequency overlay
- Spectrum compliance score (does master honor canon?)

### Sync-pitch tracker (P2)
- Per-release pitch history (library, response, conversion)
- Library response heatmap
- Direct-deal pipeline
- Cascade compliance flag per deal

### Fan-tier income (P6)
- Per-persona revenue per rail (Bandcamp subs / Patreon / Discord)
- Email list growth per persona
- Top-engaged super-fans (anonymized)

### Web3 mint design (P6)
- Per-release mint preview (chain, edition, primary, secondary royalty, cascade split)
- Smart contract diff pre-deploy
- Royalty-on-chain audit

### Smart-link funnel (P2)
- Per-release FFM.to link + QR
- Click-through per platform
- A/B smart-link versions

---

## The producer's day, with Music IS Advanced (target state Phase 2-3)

```
Morning (mobile, 5 min):
  • Voice memo on commute → Mobile Inbox → Whisper transcribes →
    classifies intent + persona hint → Suno prompt draft queued in Bridge
  • Spotify discovery — drop reference URL → Mobile Inbox →
    reference-track-ab queued

Desk session (60-90 min):
  • Open Bridge → switch to Alera mode
  • Spark Zone shows queued voice-memo prompt + reference-track analysis
  • Multi-engine spark generates Suno + Udio variants in parallel
  • Listen to Suno result in Studio card → click 📦 stems →
    Demucs separates → open Ableton for arrangement polish → bounce master
  • mastering-chain dispatches LANDR → Ozone refinement →
    spectrum analyzer confirms 528 Hz canon (Arcanea sonic-canon check)
  • Click /music-release → gate runs → on pass:
    • DistroKid upload (auto via distrokid-mcp)
    • Spotify Canvas upload (spotify-artists-mcp)
    • Bandcamp upload (bandcamp-mcp)
    • sync-deliverable-pack generated (master + stems + cue-sheet)
    • Linkfire smart-link created with UTM tracking
    • SubmitHub auto-pitches to 10 curated playlists
    • Spotify Editorial pitch submitted
    • royalty-graph entry locked
    • Frank notified

Evening (mobile, 2 min):
  • Idea capture for tomorrow → Mobile Inbox

Background (n8n / Claude Code / agents):
  • Daily catalog hygiene (music-archivist)
  • DSP analytics aggregation (Chartmetric pull → dashboard refresh)
  • Per-platform Claw drops (Phase 3+)
  • Weekly drift report (Monday hygiene ritual)
  • Monthly DistroKid statement parsing → royalty graph update
```

---

## MCP server scaffolding pattern

Each MCP follows the same shape (TypeScript + MCP SDK or Python + FastMCP):

```
verticals/music-is/mcps/<mcp-name>/
├── README.md                    # purpose, tools exposed, env vars, deploy
├── package.json or pyproject.toml
├── server.ts or server.py        # MCP server
├── tools/                        # per-tool implementations
│   ├── tool-1.ts
│   ├── tool-2.ts
│   └── ...
├── .env.example                  # required credentials (gitignored when real)
├── tests/                        # smoke tests
└── docker-compose.yml (optional) # for local dev
```

**Hosting strategy:**
- Self-hosted MCPs (whisper, demucs, elevenlabs): run on Frank's machine or Vercel/Railway
- API-wrapper MCPs (distrokid, bandcamp, spotify-artists): can run on Cowork user's machine via npx, or hosted
- Web-automation MCPs (distrokid web flow, bandcamp uploads): require browser automation (Playwright); host on Vercel Edge or local

**Auth pattern:**
- OAuth where supported (Spotify, YouTube)
- Session cookies for web-automation (DistroKid, Bandcamp)
- API keys for direct-API tools (OpenAI Whisper, LANDR, ElevenLabs)
- All credentials in `private/` (gitignored); never in public substrate

---

## Phase rollout

| Phase | MCPs ship | Skills ship | Bridge versions |
|---|---|---|---|
| **Phase 0** (now) | — | persona-canon, naming-intelligence, suno-prompt, song-intake, asset-render, release-gate, amplification-mesh, catalog-systems, distribution-flow, royalty-graph | v0, v1 |
| **Phase 1** (May 26) | suno-mcp, whisper-mcp, distrokid-mcp, spotify-artists-mcp, landr-mcp, demucs-mcp, linkfire-mcp, gema-mcp | multi-engine-prompt, voice-memo-to-prompt, reference-track-ab, stem-prep, mastering-chain, key-bpm-analyze, sync-deliverable-pack | v1.5 |
| **Phase 2** (Jun) | bandcamp-mcp, chartmetric-mcp, musicbed-mcp, marmoset-mcp, submithub-mcp, substack-mcp, tracklib-mcp, songtrust-mcp | dsp-analytics-aggregate, playlist-pitch-automation, smart-link-orchestration, lyric-rights-registration, sample-clearance | v2 |
| **Phase 3-4** (Q3-Q4) | udio-mcp, apple-artists-mcp, youtube-studio-mcp, soundcharts-mcp, mixedinkey-mcp, elevenlabs-mcp, discord-bot-mcp | (composes existing) | v3 (analytics ribbon + frequency analyzer + sync-pitch tracker) |
| **Phase 6+** (2027+) | sound-xyz-mcp, catalog-mcp, zora-mcp, patreon-mcp, royal-mcp | fan-tier-ops, web3-mint-design, voice-clone-ethics-gate | v4 (fan-tier + web3 panels) |

---

## Refusal posture

All advanced integrations preserve Music IS sovereignty:

- **No master-rights transfer** to any distributor or aggregator
- **No exclusive worldwide sync** without justified deal-economics
- **No vocal-clone** of identifiable non-Frank artist without written consent
- **No NFT mint** without cascade-graph encoded on-chain
- **No sample** that violates clearance (Tracklib / Splice license trail required)
- **No paid-playlist-placement** networks
- **No bot-mesh fan-engagement** (OpenClaws is canon-voice-locked, AI-disclosed)

The substrate enforces these structurally — refused at gate, refused at mint, refused at amplification.

---

## Composes with

- `verticals/music-is/STACK.md` — operator-side layer map (L0-L6)
- `verticals/music-is/SUB-SYSTEMS.md` — 6-sub-system division
- `verticals/music-is/STRATEGY.md` — 6-phase plan
- `verticals/music-is/workflows/release-cycle-sop.md` — 10-stage pipeline
- `verticals/music-is/workflows/cowork-artifacts-spec.md` — Bridge artifact spec
- `verticals/music-is/notion/SCHEMA.md` — Notion mirror architecture

---

**Built on SIP** — `verticals/music-is/MIS-ADVANCED-STACK.md` · v0.1 · 2026-04-30 · 40+ tools, 24 MCP priorities, 15 new skills, Bridge v2 surface upgrades · Composition-layer reference
