# Agentic Music OS Build Plan

Date: 2026-06-19
Status: grounded audit plus execution plan

## Executive Verdict

The idea is good. The current implementation is not yet state of the art, but the foundation is unusually strong: a canonical Music IS vertical, a migrated catalog, label/persona doctrine, command and skill surfaces, and a working local cockpit prototype. The correct next move is not another dashboard. It is a release operating system that converts a Suno link or MP3 into a validated release packet: audio analysis, persona fit, rights disclosure, cover, Canvas, short video, distribution checklist, social launch, and telemetry loop.

The core design principle: Music IS should be the trusted A&R and release brain. Suno, Grok, DistroKid, Spotify, YouTube, Bandcamp, Remotion, n8n, and social tools are replaceable rails.

## What Already Exists

### Local Repos and GitHub

- `frankxai/Starlight-Intelligence-System`: public, canonical Music IS implementation.
- `frankxai/suno-api`: private, substantial, but based on an unofficial Suno cookie wrapper.
- `frankxai/suno-mcp-server`: public, tiny/early; README describes the intended MCP but implementation is not built locally.
- `frankxai/agentic-creator-os` and `frankxai/vibe-os`: adjacent productization surfaces.

### Music IS

- Canonical vertical at `verticals/music-is`.
- Four-label map: Frank Riemer, Frank's Vibes, Arcanea, Nona.
- Seven-agent system: music-curator, music-archivist, persona-keeper, music-producer, music-distributor, music-amplifier, royalty-architect.
- 10 local skills under `skills/music-is`.
- 8 Claude command surfaces under `.claude/commands/music-*.md`.
- Catalog at `catalog/master.csv`, with 31 migrated songs plus draft markdown files.
- Knowledge base for Suno prompting and musician naming.
- Local cockpit UI at `site/music-cockpit.html`.
- Local server/CLI in `workflows/catalog-coprocessor.js`, `music-cli.js`, `music-council.js`.

### Antigravity Additions

The attached Antigravity work appears to have added:

- `music-council.js`
- `/api/catalog/council`
- interactive cockpit tabs for Cognitive and Web3 review
- Suno embed parsing
- a visual split-flow tree
- a council debate simulator

Useful, but currently partly simulated. The A&R report is not yet based on real audio/lyrics analysis. The release command marks DistroKid/Canvas work complete locally without proof of external completion.

## Integration Reality

- Suno: excellent primary creation tool. Official docs emphasize web/app creation, Studio, stems, and paid-plan commercial rights. Do not depend on a public official API until verified.
- DistroKid: official docs point users to the upload form/dashboard. Treat upload as manual/browser-assisted until an official partner API is available and authorized.
- Spotify Canvas: official Spotify for Artists docs describe web/mobile upload. Spotify Web API is useful for metadata/playlists/playback, not Canvas upload.
- xAI/Grok: official Imagine APIs support image and video generation/editing. This is a good rail for cover and video concepts if credentials are configured.
- YouTube: DistroKid can create YouTube Music/art tracks; direct YouTube video publishing should be a separate owned-channel workflow.

Sources checked:

- Suno rights and ownership: https://help.suno.com/en/articles/2746945
- Suno product capabilities: https://suno.com/
- Spotify Canvas upload: https://support.spotify.com/us/artists/article/adding-a-canvas/
- Spotify Web API: https://developer.spotify.com/documentation/web-api
- DistroKid upload docs: https://support.distrokid.com/hc/en-us/categories/360001857214-Uploading
- xAI Imagine overview: https://docs.x.ai/developers/model-capabilities/imagine
- xAI video generation: https://docs.x.ai/developers/model-capabilities/video/generation

## Target System

### 1. Intake Core

Input can be a Suno URL, MP3/WAV, lyrics, prompt, or concept. The OS creates a release proof folder and catalog row.

Required fields:

- song_id, title, artist/persona, label
- source_url, local_audio_path, engine, model/version if known
- prompt, lyrics, instrumental/vocal flag
- duration, BPM/key if known or estimated
- explicit flag, language, mood, genre, structure notes
- AI disclosure, rights notes, consent docs

### 2. Audio Intelligence

Replace placeholder cognitive scoring with real evidence:

- ffprobe duration/codec/bitrate
- loudness and clipping report through ffmpeg/ebur128 when available
- waveform and spectrogram thumbnails
- transcription/lyrics alignment when vocals exist
- structural timestamp notes: intro, hook, break, climax, outro
- artifact notes: slurring, vocal glitches, muddy low end, abrupt endings

### 3. A&R Council

Council output should be a strict gate:

- GREEN-LIGHT: ready for release packet.
- REVISE: specific missing metadata/assets/audio fixes.
- REFUSE: rights, impersonation, sample, canon, or quality issue.

Agents:

- music-curator: final taste and release call.
- persona-keeper: canon and artist identity.
- music-producer: audio and visual quality.
- music-distributor: distribution packet readiness.
- music-amplifier: social launch quality and cadence.
- royalty-architect: splits, credits, revenue rails.
- compliance sentinel: AI disclosure, rights, sample/vocal consent.

### 4. Asset Factory

Per release:

- cover master 3000x3000
- square, landscape, and vertical variants
- Spotify Canvas 3-8 second vertical loop
- 9:16 short for TikTok/Reels/Shorts
- 16:9 visualizer for YouTube
- thumbnail and stills
- optional lyric video

Grok/xAI Imagine can be a first-class generation rail. The Queen queue can dispatch bounded Grok tasks for cover concepts and video prompts, then the human/agent council selects.

### 5. Distribution Desk

The system prepares the DistroKid packet but does not pretend to upload unless a verified integration exists:

- release title and artist
- audio file path
- cover file path
- contributors/performer/producer/writer
- AI disclosure
- lyrics
- stores/add-ons
- release date
- ISRC/UPC strategy
- post-upload fields to backfill: DistroKid ID, ISRC, UPC, live links

### 6. Profile and Brand Layer

Artist naming is a release-system decision, not a vibes decision.

Frank options:

- `Frank Riemer`: strongest for neo-classical, cinematic, piano, sync credibility, human-authored authority.
- `Lumen`: best current Frank's Vibes candidate if available; clean, warm, high-memorability, but must be checked for existing artist conflicts.
- `Alera`: already canon-locked for Arcanea/Guardian music.
- `Nona`: keep as label, not necessarily persona, until a punk/alt artist name passes availability.

Rule: do not spawn another public artist identity until the first one has a six-release baseline and platform/profile setup is proven.

### 7. Amplification Mesh

For each release:

- Spotify: Canvas, Artist Pick, playlist pitch if eligible.
- YouTube: visualizer, Short, description, pinned comment, playlist.
- Instagram/TikTok: 9:16 hook clip plus story/still.
- X: release note with specific production detail.
- Owned site: canonical release page.
- Newsletter/Bandcamp: only for labels where direct-fan loop fits.

## Automations

### Codex

Best for:

- repo edits
- catalog/package generation
- release docs
- scripts
- validation
- Vercel/web surface updates
- plugin/skill work

### Hermes

Best for:

- cross-repo retrieval
- catalog lookup
- memory/vault search
- provenance questions
- "what did we already decide?" queries

### Queen Queue

Best for bounded overnight jobs:

- audit all music surfaces
- generate visual prompts
- compare naming candidates
- prepare release packets
- run telemetry reports

### Grok CLI / xAI

Best for:

- cover image concepts
- reference-image variants
- video/Canvas prompts
- image-to-video experiments

### n8n

Best for:

- file movement
- status notifications
- scheduled telemetry
- post-release reminders
- handoff tasks between manual and automated steps

## Phase Plan

### Phase 0: Stabilize Truth (1-2 nights)

- Install/use `agentic-music-os` plugin.
- Add real release proof folder convention.
- Add audio analysis helper.
- Update council to separate observed facts from inferred taste judgments.
- Add status fields for manual external steps.

### Phase 1: First Real Release Packet (1 week)

- Pick one song.
- Run intake from Suno URL or MP3.
- Generate proof folder, A&R report, cover, Canvas, short, social copy, DistroKid packet.
- Upload manually to DistroKid.
- Record ISRC/UPC back into catalog.
- Create owned release page.

### Phase 2: Asset Factory (2-3 weeks)

- Build Remotion templates for Canvas, short, square loop, visualizer.
- Add Grok/xAI prompt packet generator.
- Add visual QA gate and asset manifest.

### Phase 3: Distribution and Profile Desk (2-4 weeks)

- Build DistroKid upload checklist UI/state.
- Add Spotify for Artists manual task tracker.
- Add YouTube/Bandcamp packet generator.
- Add artist profile naming and availability SOP.

### Phase 4: Telemetry Loop (2-4 weeks)

- Import platform metrics manually first, API where available.
- Add 7-day and 30-day release retrospectives.
- Rank tracks for next release, sync pitch, or archive.

### Phase 5: Productize (after Frank's first proof cycle)

- Convert Music IS into a template for AI musicians/micro-labels.
- Keep Frank's private catalog separate.
- Sell the operating method, not the unreleased catalog.

## Immediate Experiments

1. Suno URL intake: confirm parser handles real links and creates a complete draft without corrupting CSV.
2. MP3/WAV intake: add local audio analysis and proof folder creation.
3. A&R report: replace simulated Huron/Patel/Margulis scores with evidence-backed rubric fields.
4. Grok cover sprint: generate 3 cover directions for one track and visually select one.
5. DistroKid packet: prepare manual upload checklist and record the actual post-upload IDs.

## Success Definition

The first excellent milestone is not "fully automated DistroKid." It is:

- one song taken from Suno/MP3 to complete release packet
- all rights and AI disclosures clear
- cover and Canvas produced
- DistroKid upload completed manually with IDs recorded
- owned release page and launch copy ready
- telemetry reminder scheduled

That is the minimum viable label OS.

**Built on SIP** - Music IS Agentic Music OS plan.
