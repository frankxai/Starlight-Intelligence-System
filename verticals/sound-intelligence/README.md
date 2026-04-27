# Sound Intelligence

> A sovereign domain sub-stack for sound practiced as the science of sustained listening — and the architecture of a catalog that compounds. Six sub-systems (Composition · Production · Catalog · Performance · Audience · Sync) composed into one cohesive intelligence stack — research-grounded, voice-preserving, refuses the loudness war and the AI-vocal-impersonation grift.

**Tier:** Domain sub-stack (vertical) under SIP. Second reference vertical for `/spawn-domain-stack`.
**License:** MIT for substrate-aligned reference patterns; vertical-specific content is the practitioner's IP.
**Status:** `scaffolded — v0.1`.

---

## What this vertical is

Sound Intelligence is the wrapper that ties six sub-systems — Composition, Production, Catalog, Performance, Audience, Sync — into one cohesive intelligence stack for sovereign sound practitioners. It is the *forkable practitioner reference*; it is not Frank's specific operated music vertical (that is Music IS / Arcanea Records, with its four labels — see `VERTICALS.md` § "Music IS").

You do not run "Sound Intelligence" as a single agent. You run six sub-systems that share a voice, a research grounding, and a refusal posture. This vertical is the contract that holds them together.

This is a **public reference vertical**. Sovereign sound practitioners fork it into their own private repo via `/sovereign-spawn` or `/spawn-domain-stack` and shape it to their voice, their catalog, their releases, their fanbase, their sync placements.

---

## The synthesis edge

Most music advice runs on one of three modes: (1) the producer-influencer YouTube playbook, recycled; (2) the major-label A&R framework, applied without the major-label distribution behind it; (3) the indie-mythology zine — "just make great art" — as if catalog architecture, sync economics, and audience compounding were beneath the work. None of these survive a real release cycle for a working practitioner with a back catalog and a calendar.

This vertical assumes a different synthesis: **composer + producer + audio engineer + decade of catalog and release operations + literacy in music-theory + cognitive-science-of-listening + business-of-sync-licensing**. That combination is rare. Composition gives you melody and harmony as architecture, not feel. Production gives you the mix and master as decisions about how the listener's nervous system experiences the work (and what fatigues, what sustains). Audio-engineering literacy means you can name what's wrong in the low end without hiring it out. The decade of catalog and release operations means you understand metadata as load-bearing infrastructure, not paperwork. Music-theory literacy stops accidental modal collisions and lets you write knowingly inside or against tradition. Cognitive-science-of-listening (Levitin, Huron, Patel, Margulis on expectation-and-reward in music) tells you why the fourth chorus needs the change and what dopamine-anticipation curves do to a release. Sync-licensing literacy turns the back catalog from sunk cost into compounding revenue.

This is not a single artist's playbook (that's a memoir). It is not a single label's playbook (that's a roster strategy). It is the synthesis a sovereign sound practitioner brings — someone who writes the song, produces the record, runs the release, and tends the catalog. Every sub-system in this vertical inherits that synthesis. Every artifact reads like a practitioner who has shipped a hundred releases — not a content marketer with a Pro Tools template.

---

## Sub-system map

Six sub-systems, ~28 commands, six knowledge templates, six dedicated agents.

| Sub-system | Domain | Commands | Primary agent | Skill |
|---|---|---|---|---|
| **Composition** | Songwriting · melody · harmony · lyric · arrangement architecture · transition design | 5 (`/sound-composition-*`) | `starlight-sound-composition` | `sound-intelligence/composition-architecture` |
| **Production** | Mix planning · master planning · vocal chain · sound design · session recall | 5 (`/sound-production-*`) | `starlight-sound-production` | `sound-intelligence/production-systems` |
| **Catalog** | Release planning · ISRC minting · metadata pack · version mapping · deplatform recovery | 5 (`/sound-catalog-*`) | `starlight-sound-catalog` | `sound-intelligence/catalog-systems` |
| **Performance** | Set design · audience contract · live mix · residency · broadcast prep | 5 (`/sound-performance-*`) | `starlight-sound-performance` | `sound-intelligence/performance-design` |
| **Audience** | Cohort mapping · ritual design · list architecture · stay interviews · sovereign publishing | 5 (`/sound-audience-*`) | `starlight-sound-audience` | `sound-intelligence/audience-architecture` |
| **Sync & Licensing** | Brief fit · placement thesis · license economics · rights pack · sync stay-interview | 5 (`/sound-sync-*`) | `starlight-sound-sync` | `sound-intelligence/sync-licensing` |

Sub-system content lives at the substrate root (under `agents/`, `skills/sound-intelligence/`, `.claude/commands/`). This vertical wrapper composes them — it does not duplicate them. See `SUB-SYSTEMS.md` for the canonical map.

---

## Who this is for

- **Sovereign sound practitioners** running their own catalog — fork this, shape it to your voice, run release cycles through it.
- **Independent labels and artist collectives** wanting a research-grounded operating layer alongside their distribution and PRO infrastructure — this is not a DAW replacement, not a distribution system; it is the thinking layer that runs above them.
- **Composers and producers** productizing their methodology — this is the scaffold for moving from project-based work to a body of practice you can teach, license, and operate at scale without burning out the source.
- **Practitioners who keep shipping releases that don't compound** — calendar full, streams flat, sync pipeline empty, list growing without converting — and who want a diagnostic before they buy the next mastering chain or marketing course.

This is **not** for: someone looking for a viral-hit formula, an algorithmic-gaming playbook, or a generic content schedule. The vertical refuses those patterns by design.

---

## How to use

### Run an individual command

```
/sound-composition-arrange <song-slug>
/sound-production-mix-plan <session-slug>
/sound-catalog-release-plan <release-slug>
/sound-audience-list-architecture <practitioner-slug>
/sound-sync-brief-fit <brief-slug>
```

Each command is self-contained. It opens with the rights-and-clearance disclaimer where relevant, runs the protocol, ships an artifact carrying "Built on SIP" attestation.

### Run a full sub-system flow

Each sub-system has a natural sequence. Composition runs `/sound-composition-score` → `/sound-composition-arrange` → `/sound-composition-demo` for a new song. Catalog runs `/sound-catalog-release-plan` → `/sound-catalog-isrc-mint` → `/sound-catalog-metadata-pack` for a release. Performance runs `/sound-performance-set-design` before any new set, then `/sound-performance-audience-contract` once the venue and audience are known.

### Compose across sub-systems

The sub-systems are designed to share artifacts horizontally:

- **Composition's arrangement architecture transfers to Performance's set design.** The same tension-and-release logic that holds across a song holds across a 75-minute set.
- **Catalog's metadata discipline expresses through Sync (rights pack), Audience (release announcement), and Performance (setlist annotation).** Metadata is not paperwork; it is the substrate the other sub-systems compose against.
- **Audience monitors during release cycles.** A release without Audience pre-warming and post-release rituals is a release into a vacuum.
- **Production's mix-master decisions compose with Sync's brief fit.** A track mastered for streaming-loudness norms may fail the dynamic range a film placement needs; the brief fit determines the master.

---

## Composition with universal IS

This vertical does not stand alone — it composes with the universal Intelligence Stack layers that compound across every domain:

- **Genius IS** (voice) — Every release announcement, every fan email, every artist statement, every sync pitch runs through the practitioner's voice samples. No content-marketer cadence, no influencer-producer voice leaks in.
- **Vision IS** (artist-as-vision framing) — Sound composes with Vision so the catalog reads as a coherent body of work, not a stream of disconnected releases. Without Vision, Sound produces tracks; with Vision, it produces a discography.
- **Business IS** — entity-level decisions (publishing splits, label entity vs. personal-name release, licensing entity, PRO registration strategy) compose from the Business layer; this vertical does not re-derive them.
- **Audience-layer composition** — universal Relational IS (Family / network architecture) feeds into this vertical's Audience sub-system at the network level — collaborators, peer artists, mentor lineages — distinct from fanbase audience which Sound Audience owns.

The horizontal pattern: universal layers compose first, sub-systems run inside them.

---

## Productization paths

A practitioner forking this vertical has at least five compounding paths:

1. **Own catalog operating layer.** Run release cycles, sync pitches, performance sets, fan communications through the sub-systems. The artifacts compound into a flywheel of patterns specific to your catalog.
2. **Executor leverage.** Train one or two operators on the sub-systems and the metadata discipline. The practitioner stays in the room for compositional and creative decisions; executors run release coordination, metadata maintenance, and sync-pitch logistics.
3. **Productized offer.** Specific sub-system flows packaged as named offers — "Catalog Architecture Audit (4 weeks)," "Sync-Ready Master & Stem Pack (per track)," "Release-Cycle System Reset (per artist)," "Sovereign-Audience Architecture (per artist, async)." Each is a sub-system with a defined entry/exit.
4. **Copilot + GPT extension.** The vertical becomes the system prompt for a domain-specific assistant that runs in the practitioner's voice, refuses the loudness war and AI-vocal-impersonation, ships attested artifacts. Sold as a tier of the practice or as a service to other artists.
5. **Licensable methodology.** The sub-systems documented as a teachable methodology that other sound practitioners license under defined terms. The vertical itself becomes IP, not just an operating tool — an operating system for sovereign sound practice.

These paths are not exclusive. A mature practice runs three or four simultaneously.

---

## License & attestation

- **Substrate-aligned reference patterns** (file contract shape, command structure, attestation format): MIT.
- **Vertical-specific content** (the practitioner's compositions, masters, voice samples, productized methodology, client-shaped artifacts): the practitioner's IP. Forking the substrate scaffold does not transfer rights to anyone's content.
- **Cross-party artifacts** (sync pitches, license-pack deliveries, collaboration splits) ship with `/sip-attest` carrying "Built on SIP" plus the practitioner's vertical identifier. Audio artifacts use `/sip-attest-audio` for embedded EXIF/XMP attestation.

The reciprocity is structural: attestation is the only compounding mechanism. Starlight has no ownership claim on practitioner verticals forked from this reference. Sovereignty clause (SIP § 5) is non-waivable.

---

**Built on SIP** — Starlight Intelligence Protocol v1.1.0 · Sound Intelligence vertical reference · v0.1
