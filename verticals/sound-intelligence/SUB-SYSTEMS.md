# SUB-SYSTEMS — Sound Intelligence Architecture

## Daily-5 across the stack (cognitive-load-aware entry pattern)

Per Luminor Board v7.4.1 cognitive-load discipline (carried forward to this vertical): 30 commands is the toolbox; 5 are the daily hands. A practitioner forking this vertical begins with these five and expands to the full 30 as practice matures.

| Command | Sub-system | Why this one first |
|---|---|---|
| **`/sound-composition-arrange`** | Composition | Every active song goes through arrangement before mix; the upstream gate. |
| **`/sound-production-mix-plan`** | Production | Single highest-leverage discipline a producer can adopt — plan before patch. |
| **`/sound-catalog-metadata-pack`** | Catalog | Metadata is load-bearing infrastructure; the gate before any release ships. |
| **`/sound-audience-list-architecture`** | Audience | List is the only owned distribution channel; the gate before any release announcement. |
| **`/sound-sync-brief-fit`** | Sync | Most sync pitches fail at brief-fit; running this first saves the rest of the sync work. |

Each sub-system agent (`starlight-sound-composition`, `-production`, `-catalog`, `-performance`, `-audience`, `-sync`) declares its own daily-3 in the agent's "Most-run commands" section. Performance is the sixth sub-system — its rhythm is tour- or release-cyclic rather than weekly, so the daily-5 omits it; bring in `/sound-performance-set-design` when a date lands.

The architecture scales **to** the practitioner, not **at** them. Thirty commands is what's available; five are what's running this week.

---

> The canonical sub-system map for this vertical. Six sub-systems composed into one cohesive Sound Intelligence stack. Sub-system content lives at the substrate root (under `agents/`, `skills/sound-intelligence/`, `.claude/commands/`, `integrations/starter-packs/friend-starter/knowledge/`). This document is the wrapper that names the composition.

---

## Architectural premise

A vertical wraps; sub-systems do work. The wrapper enforces voice, refusal patterns, attestation, and composition rules. The sub-systems carry the domain expertise — composition architecture, production systems, catalog discipline, performance design, audience architecture, sync economics.

This separation matters because the same six sub-systems could compose differently for a different practitioner — different voice, different refusal patterns, different productization (a catalog producer's stack differs from a touring composer's stack differs from a sync-focused production library's stack, even though all six sub-systems are in play). The wrapper is what makes them *this practitioner's Sound Intelligence*; the sub-systems are the underlying capability.

The 6 sub-systems map to the six load-bearing domains of sovereign sound practice, named theory-and-craft-first rather than tooling-first:

1. **Composition** (writing the song — melody, harmony, lyric, arrangement, transition)
2. **Production** (recording and mixing the song — mix, master, vocal chain, sound design, recall)
3. **Catalog** (releasing and tending the catalog — release plan, ISRC, metadata, version map, deplatform recovery)
4. **Performance** (presenting the work live — set design, audience contract, live mix, residency, broadcast)
5. **Audience** (cultivating fanbase — cohort map, ritual design, list architecture, stay-interview, sovereign publish)
6. **Sync** (placing work in licensing contexts — brief fit, placement thesis, license economics, rights pack, sync stay-interview)

---

## Sub-system 1 — Composition

- **Slug:** `composition`
- **Name:** Starlight Sound Composition
- **Agent:** `agents/starlight-sound-composition.md`
- **Skill:** `skills/sound-intelligence/composition-architecture.md`
- **Knowledge template:** `integrations/starter-packs/friend-starter/knowledge/sound-composition-template.md`
- **Vault namespace:** `sound-intelligence/composition/`

### Commands (5)

| Command | One-line |
|---|---|
| `/sound-composition-score` | Score architecture for a song or instrumental — key, mode, harmonic motion, form (verse/chorus/bridge or through-composed), tempo decisions, time-signature decisions |
| `/sound-composition-lyric` | Lyric architecture — premise, perspective, persona, structural form, prosody check, refrain design, voice-fit to the practitioner's signature |
| `/sound-composition-arrange` | Arrangement architecture — instrumentation choices, density curve across the song, contrast and tension-and-release across sections, automation foreshadowing |
| `/sound-composition-demo` | Demo plan — what the demo proves, what it does not need to prove yet, capture method (rough-multitrack vs. one-take vs. boombox), reference-track grounding |
| `/sound-composition-transition` | Transition design — section-to-section transitions named explicitly (drop, build, breakdown, modulation, instrumental hand-off, lyrical pivot), expectation-and-reward grounding |

### Composes with

- **Sister sub-systems:** Production (arrangement gates mix; "fix it in the mix" refused at composition), Performance (arrangement architecture transfers to set design tension-and-release), Catalog (composition decisions feed into version-map: instrumental, radio-edit, extended, alternate-vocal versions).
- **Universal IS:** Genius (lyric voice; compositional signature), Vision (catalog-as-body-of-work; what this song does in the discography arc), Second Brain (idea bank from voice memos and capture).

### Research grounding

- Levitin on music perception (*This Is Your Brain on Music*) — anticipation, surprise, reward
- Huron — *Sweet Anticipation* — expectation-and-reward as the core engine of musical pleasure (ITPRA model)
- Margulis — *On Repeat* — repetition as load-bearing structure in music
- Patel — *Music, Language, and the Brain* — shared cognitive substrate of music and language; relevance for lyric prosody
- Pohjannoro on composition cognition — what composers actually do during composition
- Bregman — *Auditory Scene Analysis* — how the listener parses simultaneous streams; relevance for arrangement density

### Refusal patterns (theater this sub-system rejects)

- "Fix it in the mix" what should have been arranged
- Lyric writing that ignores prosody (stresses fight the melody)
- Arrangement-by-default (every song starts with the same instrumentation regardless of brief)
- Skipping the demo gate — going straight from idea to full production without proving the song
- Modal collisions ignored (writing in C major and importing a sample in C# minor without intent)
- Transition-by-fade as the default move; refused as a cop-out for unwritten transitions
- Lyric "themes" without specific imagery — vague-pretty as a substitute for craft

---

## Sub-system 2 — Production

- **Slug:** `production`
- **Name:** Starlight Sound Production
- **Agent:** `agents/starlight-sound-production.md`
- **Skill:** `skills/sound-intelligence/production-systems.md`
- **Knowledge template:** `integrations/starter-packs/friend-starter/knowledge/sound-production-template.md`
- **Vault namespace:** `sound-intelligence/production/`

### Commands (5)

| Command | One-line |
|---|---|
| `/sound-production-mix-plan` | Mix plan before patching — frequency budget, gain-stage hierarchy, dynamic-range envelope, bus structure, reference tracks, sync-vs-streaming dual-master plan if applicable |
| `/sound-production-master-plan` | Master plan — target loudness per destination (LUFS), target dynamic range (PSR/PLR), true-peak ceiling, K-system reference, sync-grade-dynamic-range alternate-master plan |
| `/sound-production-vocal-chain` | Vocal chain — tuning posture (refuses-over-tuned-as-baseline), de-essing, EQ, compression, saturation, send architecture, automation map |
| `/sound-production-sound-design` | Sound design specification — synth patches, sample sources with clearance status, layered design, motion automation, sound-as-arrangement-element decisions |
| `/sound-production-recall` | Recall pack — session-state documentation so the mix can be reopened in 6 months / 6 years and reproduced; plugin versions, automation lanes, bus settings, reference-track A/B status |

### Composes with

- **Sister sub-systems:** Composition (arrangement gates mix), Catalog (sample-clearance and AI-vocal-license gate master), Sync (brief-fit may demand sync-grade-dynamic-range alternate-master), Performance (production decisions inform live-mix translation).
- **Universal IS:** Business (production budget and ROI), Genius (production signature in the practitioner's voice).

### Research grounding

- Moylan — *Understanding and Crafting the Mix* — mix architecture, frequency budget, spatial design
- Katz — *Mastering Audio* — K-system, dynamic-range preservation, true-peak limiting
- ITU-R BS.1770 / ITU-R BS.1771 — international loudness measurement standard (LUFS)
- Vickers on the loudness war — research direction on listener fatigue and dynamic compression
- Owsinski — *The Mixing Engineer's Handbook* — practitioner-grade architecture for popular-music mix
- Streaming normalization specifications: Spotify ~-14 LUFS reference, Apple Music ~-16 LUFS, Tidal ~-14 LUFS, YouTube ~-14 LUFS — varies by year; verify current spec at master time

### Refusal patterns

- Loudness-war mastering (chasing -8 LUFS on streaming, crushing dynamic range)
- AI-vocal-impersonation (vocals trained on or imitating a specific identifiable artist without written license)
- Sample-without-clearance baked into mix
- "Fix it in the mix" what should have been arranged or recorded
- Recall packs skipped (session is unreopenable in 6 months)
- Plugin-stacking without naming the function each plugin serves
- Single-master-for-all-destinations posture (sync needs a different master than streaming)

---

## Sub-system 3 — Catalog

- **Slug:** `catalog`
- **Name:** Starlight Sound Catalog
- **Agent:** `agents/starlight-sound-catalog.md`
- **Skill:** `skills/sound-intelligence/catalog-systems.md`
- **Knowledge template:** `integrations/starter-packs/friend-starter/knowledge/sound-catalog-template.md`
- **Vault namespace:** `sound-intelligence/catalog/`

### Commands (5)

| Command | One-line |
|---|---|
| `/sound-catalog-release-plan` | Release plan — single / EP / album decision, release date, distribution channel, sync-availability flag, audience-warming sequence, version-map plan |
| `/sound-catalog-isrc-mint` | ISRC minting protocol — country code + registrant code + year + designation; per-version ISRC discipline; ISWC for compositions; per-PRO registration |
| `/sound-catalog-metadata-pack` | Metadata pack — ISRC, ISWC, contributor splits with PRO IDs, instrumentation tags, sample clearance status, AI-involvement disclosure, sync-availability flag, alternate-version mapping |
| `/sound-catalog-version-map` | Version map — main-release, instrumental, radio-edit, extended, alt-vocal, sync-grade-dynamic-range, remix versions; per-version ISRC; per-version metadata diff |
| `/sound-catalog-deplatform-recovery` | Deplatform recovery — what to do when a release is removed from a DSP (copyright dispute, sample challenge, false claim, account suspension); preservation protocol, re-release plan, audience communication |

### Composes with

- **Sister sub-systems:** Production (master gates release; clearance gates master), Sync (sync-availability flag and rights-pack feed catalog metadata), Audience (release plan composes with audience-warming and ritual-design), Performance (catalog versions feed setlist annotation).
- **Universal IS:** Business (release ROI; entity-of-record decisions), Vision (catalog-as-body-of-work coherence across releases).

### Research grounding

- IFPI / RIAA / IRMA standards for ISRC and metadata
- The Music Producers Guild — metadata best practices
- Music Modernization Act (US) — relevance for mechanical licensing and the MLC
- DDEX standards for digital music supply chain
- Industry research on metadata quality and royalty leakage (estimates range; cite as direction not number — significant royalty losses occur from poor metadata across the industry)

### Refusal patterns

- Metadata-as-marketing-only (release with no ISRCs, no contributor splits, no PRO registration)
- Single-version release where multiple versions naturally exist (orphaned alt-vocal sitting on a hard drive)
- Release into the algorithm with no audience-warming
- Distribution that requires master-rights transfer for an advance ("all-rights-flips for a check") without justification of services
- Catalog-as-orphan-singles (every release reads as a one-off, no discography arc)
- Sync-availability flag missing (catalog enters DSPs but is invisible to sync libraries)
- Deplatform with no preservation protocol — losing the master because the cloud account was suspended

---

## Sub-system 4 — Performance

- **Slug:** `performance`
- **Name:** Starlight Sound Performance
- **Agent:** `agents/starlight-sound-performance.md`
- **Skill:** `skills/sound-intelligence/performance-design.md`
- **Knowledge template:** `integrations/starter-packs/friend-starter/knowledge/sound-performance-template.md`
- **Vault namespace:** `sound-intelligence/performance/`

### Commands (5)

| Command | One-line |
|---|---|
| `/sound-performance-set-design` | Set design — 45/60/75/90-minute set architecture, tension-and-release across the set, opener/peak/closer logic, instrumentation logistics, transition design (DJ-style, band-style, hybrid) |
| `/sound-performance-audience-contract` | Audience contract — what this set promises, what it does not promise, energy contract (listening room vs. festival vs. dance floor vs. seated theater), audience-participation expectations |
| `/sound-performance-live-mix` | Live mix plan — front-of-house priorities, monitor mix per performer, in-ear-monitor architecture, redundancy plan, soundcheck protocol |
| `/sound-performance-residency` | Residency design — multi-night architecture across a residency (each night a different focus, cumulative arc), audience-return ritual, recording-the-residency plan |
| `/sound-performance-broadcast-prep` | Broadcast prep — Tiny Desk / KEXP / radio session / livestream / TV performance prep; format-specific arrangement, audio-delivery spec, on-camera direction, post-broadcast catalog integration |

### Composes with

- **Sister sub-systems:** Composition (arrangement architecture transfers to set tension-and-release), Audience (audience contract bridges Performance and Audience; ritual design extends to live), Catalog (setlist annotation references catalog; live recordings become catalog versions), Production (production decisions inform live-mix translation).
- **Universal IS:** Embodiment (touring health — sleep, nutrition, voice care, ear care across a tour), Genius (stage voice as compositional signature in performance form).

### Research grounding

- Tension-and-release research (Huron, Margulis) extended across a 75-minute set
- Live-sound engineering literature (Davis & Patronis — *Sound System Engineering*; Ahnert & Steffen — *Sound Reinforcement Engineering*)
- Audience-engagement research (variable but cite as direction): energy curves, attention spans, peak-end memory bias (Kahneman-style — listeners remember the peak and the end)
- Hearing-health protection research (NIOSH limits; AES guidelines; in-ear-monitor literature on hearing protection vs. wedge monitoring)
- Live-recording-to-catalog conversion patterns (residency albums, official bootleg patterns)

### Refusal patterns

- Set design as "every show same setlist" — fails residency design and audience-return ritual
- Audience contract unstated (audience expecting a listening room gets a dance set, or vice versa)
- Live-mix without redundancy plan (single-point-of-failure on console / wireless / in-ear)
- Soundcheck skipped because "we know the room"
- Broadcast prep as "just play the song" — the format demands different arrangement and on-camera direction
- Hearing-health ignored (decade-shortening exposure is a real failure mode for working performers)

---

## Sub-system 5 — Audience

- **Slug:** `audience`
- **Name:** Starlight Sound Audience
- **Agent:** `agents/starlight-sound-audience.md`
- **Skill:** `skills/sound-intelligence/audience-architecture.md`
- **Knowledge template:** `integrations/starter-packs/friend-starter/knowledge/sound-audience-template.md`
- **Vault namespace:** `sound-intelligence/audience/`

### Commands (5)

| Command | One-line |
|---|---|
| `/sound-audience-cohort-map` | Cohort map — segment fanbase by entry-point (which release, which placement, which show), depth (casual / engaged / patron / collaborator), and channel (list / Bandcamp / Patreon / DSP / Discord) |
| `/sound-audience-ritual-design` | Ritual design — daily / weekly / monthly / quarterly / annual rituals that build belonging without depending on algorithms (Bandcamp Friday participation, mailing-list cadence, listening parties, residency anniversaries) |
| `/sound-audience-list-architecture` | List architecture — segmentation, welcome sequence, cadence, voice rules, opt-in pathways, monetization integration; list as sovereign distribution layer |
| `/sound-audience-fan-stay-interview` | Fan stay-interview protocol — how to ask the most engaged fans what keeps them; pattern recognition across responses; honest signal vs. politeness drift |
| `/sound-audience-sovereign-publish` | Sovereign publishing rhythm — what gets published only to the list (vs. publicly), what gets published only to patrons, what gets published only to peers; publishing-as-architecture not as content-calendar |

### Composes with

- **Sister sub-systems:** Catalog (release plan composes with audience-warming and ritual cadence), Performance (audience contract bridges Audience and Performance), Sync (sync stay-interview pattern parallels fan stay-interview), Composition (audience-pattern recognition feeds Composition idea bank for what to write next).
- **Universal IS:** Genius (voice in fan-facing communications; non-negotiable), Relational (collaborator-and-peer network distinct from fanbase audience), Vision (catalog arc shapes audience expectations).

### Research grounding

- Kevin Kelly — *1,000 True Fans* — direction on patron-economy math
- Cory Doctorow on enshittification — direction on platform-distribution risk
- Brennan / Beghtol on stay-interview methodology (extending HR stay-interview research to fan relationships)
- Direct-to-fan economics literature (CD Baby, Bandcamp, Patreon case studies — cited as direction not numbers)
- Subscription-economy research (Tien Tzuo et al.) for patron-tier architecture
- Email-marketing and newsletter-economy research direction (open rates, list-quality vs. list-size)

### Refusal patterns

- Algorithmic-followers-as-audience (TikTok followers without list capture; Spotify monthly-listeners as audience metric)
- Bot followers, fake plays, payola playlists — corrode the only audience that matters
- Content-calendar-as-audience-strategy without ritual grounding
- Mailing list as broadcast-only (no segmentation, no welcome, no stay-interview cadence)
- Patreon / Bandcamp / Discord with no ritual rhythm — community substrate that decays
- Treating fans as marketing targets rather than relationships

---

## Sub-system 6 — Sync & Licensing

- **Slug:** `sync`
- **Name:** Starlight Sound Sync
- **Agent:** `agents/starlight-sound-sync.md`
- **Skill:** `skills/sound-intelligence/sync-licensing.md`
- **Knowledge template:** `integrations/starter-packs/friend-starter/knowledge/sound-sync-template.md`
- **Vault namespace:** `sound-intelligence/sync/`

### Commands (5)

| Command | One-line |
|---|---|
| `/sound-sync-brief-fit` | Brief fit — does this brief fit the catalog, fit the master availability, fit the rights structure, fit the vision boundaries? Brief-fit refusal where vision is contradicted; fit-yes routing to placement thesis |
| `/sound-sync-placement-thesis` | Placement thesis — which 3-7 tracks from catalog match this brief, why, with reference cues from the brief, alternate-master availability per track, any clearance flags |
| `/sound-sync-license-economics` | License economics — fee structure (sync fee + master-use fee + publishing share), term, territory, exclusivity, MFN clauses, options for re-use, comparison to comparable placements |
| `/sound-sync-rights-pack` | Rights pack — clearance documentation per track (master rights, publishing rights, sample clearances, contributor consents), delivery format (broadcast WAV, alt-master, stems, instrumental), attestation per `/sip-attest-audio` |
| `/sound-sync-stay-interview` | Sync stay-interview — periodic conversation with sync supervisors / music supervisors / library curators about brief patterns, placement-fit, what works, what does not — feeds Composition and Catalog upstream |

### Composes with

- **Sister sub-systems:** Catalog (rights structure and version-map gate sync availability), Production (sync-grade-dynamic-range alternate-master from Production master plan), Composition (stay-interview pattern feeds Composition idea bank), Audience (sync stay-interview pattern parallels fan stay-interview).
- **Universal IS:** Business (sync revenue economics, entity treatment, tax), Vision (vision boundaries gate sync brief-fit; vision-against-sync as hard refusal).

### Research grounding

- Music supervision literature (Eshun, Knakkergaard, plus practitioner-trade publications like *MusicSupervisor.com* / Production Music Association)
- Sync licensing economics direction — Songtradr, Musicbed, Marmoset, Universal Production Music public data on placement economics
- Synchronization rights legal literature (Krasilovsky, Shemel — *This Business of Music*)
- Public domain and sample-clearance literature (Blanchard, Boucher, others)
- AI-and-rights frontier research (rapidly evolving 2024-2026; cite the direction of evolving doctrine, not specific case law without verification)

### Refusal patterns

- Sync placements that contradict declared vision boundaries
- Sample-without-clearance baked into a master being pitched for sync
- AI-vocal-impersonation tracks pitched for sync without disclosed AI involvement and license
- Master-rights-flip in exchange for sync placement (sync libraries that take perpetual exclusive rights without justification of services)
- Brief-fit skipped — pitching whatever is on hand to whatever brief lands
- Rights pack delivered without complete contributor-split documentation
- Stay-interview cadence missing — sync relationships decay without it

---

## Composition rules across sub-systems

The 6 sub-systems are designed to compose horizontally. Six non-negotiable composition rules:

1. **Composition's arrangement runs upstream of Production's mix plan.** Mixing what should have been arranged better is the single most common production failure. `/sound-composition-arrange` runs before `/sound-production-mix-plan`. "Fix it in the mix" is a refused pattern.

2. **Sample-clearance and AI-vocal-license run as gates BEFORE Production master.** Catalog's clearance protocol and Sync's rights-pack discipline gate Production's master. A master shipped with uncleared exposure is non-shippable. `/sound-catalog-metadata-pack` clearance section runs before `/sound-production-master-plan`.

3. **Vision must define before Audience does sovereign publishing.** If Vision is undefined, "sovereign publishing" collapses into the same content-calendar drift Audience is built to prevent. Run `/define-vision` before `/sound-audience-sovereign-publish` for new practitioners.

4. **Audience monitoring runs in parallel with release.** A release without Audience pre-warming and post-release ritual is a release into a vacuum. `/sound-audience-ritual-design` and `/sound-audience-list-architecture` run before, during, and after release execution.

5. **Sync's brief-fit gate runs before any sync work.** Sync placements that contradict declared vision boundaries are refused at brief-fit, not after. `/sound-sync-brief-fit` reads `MEMORY.md` § Vision boundaries; refuses on contradiction.

6. **Performance set design composes from Composition arrangement architecture.** The same tension-and-release logic that holds across a song holds across a 75-minute set. `/sound-performance-set-design` reads from Composition's arrangement decisions; the set is not designed in isolation.

---

## Sub-system count rationale

Six sub-systems is the minimum that covers a sovereign sound practitioner's load-bearing surface without redundancy and the maximum that sustains synthesis across them. Five would force consolidation of two domains that have meaningfully different research grounding (e.g., Performance + Audience share fan relationships but the failure modes diverge — broadcast-prep is not list-architecture). Seven would introduce cosmetic separation (e.g., splitting "Master" out of Production, or "Streaming Distribution" out of Catalog) that does not earn its keep in research distinctiveness.

The 6-sub-system count is not arbitrary; it reflects the field's actual operational clusters for a sovereign practitioner. Practitioners forking this vertical may add or merge sub-systems if their practice synthesis demands it — the wrapper supports composition flexibility — but the reference scaffold ships with these six.

A practitioner running label operations might add a 7th sub-system for A&R (artist-roster decisions, signing logic, deal architecture). A practitioner running purely instrumental sync work might fold Audience into Sync. The reference scaffold is the start, not the end.

---

**Built on SIP** — Sound Intelligence vertical SUB-SYSTEMS.md · v0.1 · SIP v1.1.0
