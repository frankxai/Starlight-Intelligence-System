# STACK — Sound Intelligence

> Stack choices for the Sound Intelligence vertical. Defaults inherit from Starlight's `STACK.md` (L0–L6); audio-specific overrides noted per layer.

## Inheritance

- **Starlight STACK:** `inherited from starlightintelligence.org` unless noted below.
- **Override scope:** L2 (AI tooling — DAW + plugin chain), L4 (data + state — catalog metadata + audio storage), and L5 (distribution — music distribution + sync platforms) carry audio-specific overrides; other layers inherit cleanly.

## Layers

| Layer | Purpose | This vertical uses | Reason if override |
|---|---|---|---|
| **L0 — OS / shell** | Workstation substrate | inherited | Practitioners run on macOS / Windows / Linux per personal preference. macOS is the most common DAW host but not required. No vertical-specific OS requirement. |
| **L1 — Source control** | Repo + commits | inherited | Git + GitHub. Reference scaffold lives at `frankxai/Starlight-Intelligence-System`. Practitioner forks live in their own repo (private by default for unreleased material; audio assets typically NOT in git — see L4). |
| **L2 — AI tooling + DAW + plugin chain** | Primary assistants, MCPs, audio production environment | **override — see below** | Audio production has a dedicated tooling stack (DAW + plugins + virtual instruments) that lives outside the substrate's text-AI tooling default. |
| **L3 — Language + runtime** | Code layer | inherited | The vertical wrapper is markdown-only (file contract). No code runtime required at the wrapper layer. Audio rendering happens in DAW; sub-system commands invoke the substrate's MCP servers. |
| **L4 — Data + state** | Persistence, vaults, audio storage | **override — see below** | Audio assets carry size and rights constraints (multi-GB session files, sample libraries with per-license terms, master files with master-rights status, contributor stems with split documentation) that the substrate's text-vault default does not address. |
| **L5 — Distribution** | Surface (streaming, sync, fanbase) | **override — see below** | Sound practitioners distribute through music-specific channels (DSPs, sync libraries, mailing lists) that are not the substrate's general-builder distribution mix. |
| **L6 — Community + feedback** | Audience loop | inherited | Practitioners' fan communities live in their existing channels (Substack / mailing list, Discord / Geneva / private forum, fan-meetup circuit). Sound-specific community substrate exists (Bandcamp community, Resonate, Patreon-for-musicians) but no vertical-wide mandate. |

---

## L2 override — DAW + plugin chain + AI tooling

**The constraint:** Audio production runs on tooling not present in the substrate's general L2 (Claude Code / Cursor / Cline / Codex / Gemini CLI / Antigravity).

**This vertical's posture:**

1. **DAW choice is practitioner sovereign — not prescribed.**
   - Common choices: Pro Tools (industry-standard for film/TV post and many studios), Logic Pro (macOS, strong for songwriting and electronic), Ableton Live (electronic, performance, sample-driven), Reaper (cross-platform, scriptable, indie-favored), Studio One, Cubase, FL Studio, Bitwig.
   - The vertical does not prescribe; it composes. A practitioner's `STACK.md` fork names their DAW and any session-template lineage.

2. **Plugin chain literacy is non-optional.** The practitioner names which plugins serve which functions in their workflow:
   - **Mix bus chain:** typically EQ + compression + saturation + bus-glue compression + final limiter (with bypass for sync-grade dynamic-range delivery).
   - **Vocal chain:** typically tuning (with refusal-of-over-tuned baseline), de-essing, EQ, compression, saturation, reverb send, delay send.
   - **Mastering chain:** typically tonal balance / linear-phase EQ + multiband compression + soft-clip / saturation + final limiter / true-peak limiter, with calibrated reference (K-system or LUFS-target per platform).
   - **Refusal:** "stack every plugin" workflows. Plugin-stacking without naming the function each plugin serves is producer-influencer theater; the vertical refuses.

3. **AI tooling for sound:** the boundary is sharper than for text.
   - **Allowed:** AI for stem separation (Demucs, Spleeter, RX), AI for noise reduction (RX, NS1), AI for transcription (text-to-MIDI, beat detection), AI for mastering reference (Ozone match-EQ, etc.).
   - **Allowed with disclosure:** AI-generated audio in the practitioner's *own* voice with the practitioner's own training data (e.g., the practitioner training a model on their own vocals, with full ownership of the training set).
   - **Refused:** AI vocals trained on or imitating any specific identifiable artist's voice without written consent. AI-generated audio whose training set the practitioner cannot account for. AI-generated final masters claimed as "human-mastered." Suno / Udio outputs marketed as the practitioner's original composition without disclosure.
   - **Disclosure:** any AI involvement at any stage is named in metadata (per `/sound-catalog-metadata-pack`) and in attestation (per `/sip-attest-audio`).

4. **MCP servers:**

| MCP | Purpose | Status |
|---|---|---|
| `starlight-mcp` | Substrate memory + attestation | `v1.1.x` (per substrate pin) |
| `<DAW-bridge MCP>` | Optional — practitioner's bridge to DAW session metadata, marker export, stem export | per-practitioner |
| `<distribution-bridge MCP>` | Optional — practitioner's bridge to Distrokid / TuneCore / The Orchard / Stem APIs for release metadata | per-practitioner |
| `<sync-platform-bridge MCP>` | Optional — practitioner's bridge to Musicbed / Marmoset / Songtradr / etc. | per-practitioner |

This vertical does not declare a dedicated `sound-intelligence-mcp`. The reference scaffold runs through `starlight-mcp` and the practitioner's existing audio tooling. A future Sound-Intelligence-specific MCP (for catalog metadata read/write, sync-pipeline integration with explicit consent) is possible but not part of v0.1.

---

## L4 override — Data + state (audio + metadata + rights)

**The constraint:** Audio assets are large (multi-GB per session), rights-encumbered (master rights, publishing rights, sample clearances, contributor splits), and require operational metadata (ISRC, ISWC, contributor credits, PRO registration, sync-availability flags).

**This vertical's posture:**

1. **Public substrate carries no audio assets, no unreleased material, no client-identifying release data.** Ever. The reference scaffold and any public fork stay anonymized at the artifact level — sample release names, generic catalog examples, structural examples only.

2. **Real practitioner work lives in `private/` of each practitioner fork.** Gitignored. Audio session files typically NOT in git (multi-GB per session); use a separate audio-asset storage layer (DAW project on local disk + cloud backup like Backblaze / iCloud / Dropbox / NAS, or an audio-project tool like Splice for stems / Native Access for libraries). The practitioner's responsibility, not the substrate's.

3. **Rights-and-clearance considerations:**
   - **Sample clearance:** every sample tagged in metadata with status (cleared / public domain / practitioner-original / pending / refused-uncleared). `/sound-catalog-metadata-pack` enforces.
   - **Contributor splits:** every contributor (writer, producer, performer, engineer) named in metadata with split percentage. PRO registration depends on this.
   - **Master rights:** declared per release (practitioner-owned / label-owned / co-owned / licensed-out). License terms (if any) named in metadata.
   - **Publishing rights:** declared per song (practitioner-publishing / co-publishing / publisher-controlled). PRO and publisher named.
   - **AI involvement disclosure:** any AI in any stage named in metadata. Per `/sip-attest-audio`.

4. **Catalog metadata namespace pattern:** sub-system content namespaces under `sound-intelligence/<sub-system>/` per practitioner instance:
   - `sound-intelligence/composition/` — song scores, lyrics, arrangement decisions, transition notes, demo references (per song, dated).
   - `sound-intelligence/production/` — mix plans, master plans, vocal chains, sound-design specs, recall packs (per session, dated).
   - `sound-intelligence/catalog/` — release plans, ISRC mints, metadata packs, version maps, deplatform-recovery records (per release, dated).
   - `sound-intelligence/performance/` — set designs, audience contracts, live-mix plans, residency architectures, broadcast-prep packs (per date / venue, dated).
   - `sound-intelligence/audience/` — cohort maps, ritual designs, list architectures, fan stay-interviews, sovereign-publish records (per cohort / cycle, dated).
   - `sound-intelligence/sync/` — brief fits, placement theses, license economics, rights packs, sync stay-interviews (per pitch / placement, dated).

---

## L5 override — Distribution (sound-specific)

**The constraint:** Sound practitioners distribute through music-specific channels with their own economics, rights structures, and audience norms — different from the substrate's general-builder distribution mix.

**This vertical's posture:**

1. **Streaming distribution (the table-stakes layer):**
   - **Distributors (release-routing):** Distrokid, TuneCore, CD Baby, Stem, The Orchard, FUGA, AWAL. Choice driven by: split-handling, royalty-collection, label-services tier, ownership posture (Distrokid for owner-keeps-rights flat-fee; The Orchard / FUGA for label-tier services).
   - **DSPs:** Spotify, Apple Music, Tidal, Amazon Music, YouTube Music, Deezer, Qobuz, Bandcamp.
   - **Refusal:** distribution that requires master-rights transfer in exchange for advance ("all-rights-flips for a check"). Surface the long-term cost; route to splits-and-licensing alternatives.

2. **Sync libraries (where catalog compounds):**
   - Musicbed, Marmoset, Songtradr, Audiosocket, MassiveMusic, Universal Production Music, APM, Position Music. Plus boutiques per genre.
   - Sync pipeline is the highest-leverage long-tail for a working catalog. `/sound-sync-*` commands run this discipline.
   - **Refusal:** sync libraries that take exclusive worldwide rights without justification of services rendered. Surface the trade.

3. **Sovereign distribution (the only owned layer):**
   - **Mailing list (the only channel the practitioner truly owns):** Substack, Buttondown, Beehiiv, ConvertKit, Ghost. The list is the practitioner's compounding asset. Algorithmic followers are not.
   - **Bandcamp:** highest direct-revenue platform per fan; supports merch + direct-pay model. Bandcamp Friday and similar rituals.
   - **Patreon / Geneva / Discord:** community substrate per practitioner choice.
   - **Own site:** services page, methodology overview, productized offers (per `README.md` § Productization paths), catalog landing page.

4. **Channels typically NOT used as primary:**
   - TikTok-as-primary-strategy — the format rewards algorithmic rather than catalog compounding; useful as one channel, not the strategy. The vertical refuses to design distribution that depends on it.
   - Spotify-for-Artists analytics dashboards as catalog-architecture tool — they are downstream metrics, not architecture. Do not let the dashboard write the catalog.
   - Aggregated playlists (paid placement, follow-for-follow) — corrode the only audience that matters. Refused.

5. **Cross-party distribution** (sync deliveries, license-pack deliveries, collaboration splits) runs through:
   - Direct delivery (rights-pack shipped to the licensing party with attestation).
   - Optional Notion / Dropbox / WeTransfer / private-link mirrors per relationship preference.
   - Never on public substrate. Never aggregated.

6. **Cross-party artifacts ship with `/sip-attest`** carrying "Built on SIP" plus the practitioner's vertical identifier. Audio artifacts use `/sip-attest-audio` for embedded EXIF/XMP attestation. Attestation is the compounding mechanism; without it, distribution leaks.

---

## Recommended additional tooling

| Need | Recommended (not prescribed) |
|---|---|
| **Catalog management** | Notion / Airtable / custom database for metadata-of-record beyond what DSPs hold; spreadsheet-of-truth at minimum |
| **Reference monitoring + level metering** | Loudness Penalty, dpMeter, Youlean Loudness Meter (LUFS-aware metering) |
| **Mastering reference** | Bob Katz K-system spec; ITU-R BS.1770 LUFS; AES-aligned monitoring chain |
| **Sample / loop library origin** | Splice, Loopcloud, Native Instruments, Output, Ableton packs — license terms named per source |
| **Stem separation (research / cleanup)** | iZotope RX, Demucs, Spleeter, LALAL.AI |
| **Voice memo capture for ideas** | Voice Memos (iOS), Google Recorder, Otter.ai for transcription — feeds Composition idea bank |
| **PRO + rights** | ASCAP / BMI / SESAC / GMR (US); PRS / PPL (UK); GEMA (DE); SACEM (FR); JASRAC (JP); plus a music attorney |

---

## Sovereign note

This vertical's stack choices are advisory within the Starlight ecosystem, not mandates. Each adopter may diverge per SIP § 5 (sovereignty) — choose different DAW, different distribution, different sync libraries, different community substrate. Attribution compounds regardless of stack divergence — the protocol is stack-neutral.

The three audio-specific override considerations (L2 DAW + AI-tooling boundary, L4 audio assets + rights, L5 sound-specific distribution) are **strong recommendations**, not requirements. A practitioner who diverges (e.g., chooses to release exclusively via Bandcamp without DSP distribution, or refuses all sync work as a vision boundary) does not breach the protocol. They take on the consequences of the divergence — the substrate does not protect against them.

---

**Built on SIP** — Sound Intelligence vertical STACK.md · v0.1 · SIP v1.1.0
