# QUICK-START — Sound Intelligence

> Front door for the Sound Intelligence vertical. Where you are, what's built, what to run first, what the catalog compounds into when the discipline holds.

**Last updated:** 2026-04-30 (v0.1 scaffold complete; Phase 1 ready)

> **Layering note (canonical, non-collapsible).** This vertical — **`verticals/sound-intelligence/`** — is the **public reference** vertical: the forkable substrate for sovereign sound practitioners (composers, producers, engineers, artists, indie labels) running their own catalog. It is **distinct from Frank's operated `verticals/music-is/`** (Music IS / Arcanea Records, four labels, AI-music-label workflow with Suno-first generation, OpenClaws amplification mesh, attribution-cascade royalties). Music IS may import patterns and skills from Sound Intelligence (composition architecture, sync brief-fit, metadata discipline) — it never duplicates substrate. Anyone forking this for their own practice or label imports patterns from here. The reference vertical does not import operator-specific surfaces; those are Music IS proprietary. See `STRATEGY.md` for the redirect stub that preserves this separation.

---

## Where you are

**Phase 0 scaffold — COMPLETE.** Sound Intelligence vertical wired at `verticals/sound-intelligence/` with the full file contract, six sub-systems, six dedicated agents, six skills, thirty commands, knowledge templates, composition rules, and the catalog/release/sync attestation flow.

**Phase 1 — READY.** First practitioner walkthrough end-to-end: pick the entry sub-system, run the daily-5, ship the first attested release artifact, log it in `MEMORY.md`. Forking via `/sovereign-spawn` or `/spawn-domain-stack` is unblocked. This vertical closed Luminor Board v7.5 Item 5 as PARTIAL-PROVEN at v7.5.2; v7.5.3 audience+sync command surfaces are now live.

**Status snapshot:**

| Surface | Count | Notes |
|---|---|---|
| Sub-systems | 6 | Composition · Production · Catalog · Performance · Audience · Sync |
| Commands | 30 | 5+5+5+5+5+5 — verified against `.claude/commands/sound-*` |
| Agents | 6 | `starlight-sound-{composition,production,catalog,performance,audience,sync}` |
| Skills | 6 | Under `skills/sound-intelligence/` |
| Knowledge templates | 6 | Under `integrations/starter-packs/friend-starter/knowledge/` |
| Tests | 596/596 | as of v7.6.0 ship |
| Readiness | v0.1 → v1.0 | v1.0 gate = three practitioner forks completing one release cycle end-to-end |

---

## Today (next session, 30-60 min)

### Action 1 — Pick your entry sub-system (5 min)

The vertical has six sub-systems but you do not start with all six. Pick the one that maps to the room you are actually in:

| If your room is... | Run first | Why |
|---|---|---|
| **Writing a song** | `/sound-composition-arrange <song-slug>` | Arrangement gates mix. "Fix it in the mix" is refused upstream — that's a composition decision pretending to be a production decision. |
| **Mixing or mastering** | `/sound-production-mix-plan <session-slug>` | Plan before patching. Frequency budget, gain-stage, dynamic-range envelope, sync-vs-streaming dual-master plan — decided before the first plugin instantiates. |
| **Releasing a track / EP / album** | `/sound-catalog-isrc-mint <release-slug>` then `/sound-catalog-metadata-pack` | Metadata is load-bearing infrastructure, not paperwork. ISRC per version, ISWC per composition, PRO registration, splits, sync-availability flag, AI-disclosure. Royalty leakage is a metadata problem. |
| **Touring / playing live** | `/sound-performance-set-design <set-length>` | 45/60/75/90/120-minute set architecture. Tension-and-release across the set, opener/peak/closer logic, transition design (DJ / band / hybrid). |
| **Growing a fanbase** | `/sound-audience-cohort-map` then `/sound-audience-list-architecture` | Algorithmic followers are not audience. The list is sovereign distribution. Cohort by entry-point + depth + channel; list as the only owned channel. |
| **Pitching for sync placement** | `/sound-sync-brief-fit <brief-slug>` | Most sync pitches fail at brief-fit. Four-axis check (catalog match + master availability + rights structure + vision boundaries) saves the rest of the sync work. |

### Action 2 — Run the daily-5 once, in order (30 min)

The sub-systems compose. Run them in this sequence to feel the architecture:

```
/sound-composition-arrange <song-slug>
/sound-production-mix-plan <session-slug>
/sound-catalog-metadata-pack <release-slug>
/sound-audience-list-architecture <practitioner-slug>
/sound-sync-brief-fit <brief-slug>
```

Five commands, ~6 minutes each. You see how Composition's arrangement gates Production's mix, how Catalog's metadata gates Production's master, how Audience's list runs in parallel with release, and how Sync's brief-fit reads vision boundaries before any pitch goes out. Performance is the sixth — it is tour- or release-cyclic rather than weekly, so it joins when a date lands.

### Action 3 — Log the first artifact (10 min)

Open `verticals/sound-intelligence/MEMORY.md`. Append-only entry under today's date:

- What you ran
- One thing you learned about your own catalog or release flow
- One thing the artifact refused to ship (the loudness-war / paid-playlist / AI-vocal-impersonation / master-flip pattern it would not produce)

This is your first proof-of-life — the vertical is now operating, not staged.

### Action 4 — Validate the layer separation (15 min, optional)

Read the layering note at the top of this file. If you came here looking for Music IS / Arcanea Records / Suno mastery / OpenClaws — go to `verticals/music-is/QUICK-START.md`. If you came here as a practitioner forking your own catalog operating layer — you are in the right place. Confirm you can articulate the boundary without re-asking the wrapper.

---

## This week

- [x] Phase 0 scaffold complete (596/596 green)
- [ ] Daily-5 run end-to-end against a real song or release
- [ ] First `MEMORY.md` entry logged with attested artifact reference
- [ ] One sub-system flow run to completion (e.g., `/sound-composition-score` → `/sound-composition-arrange` → `/sound-composition-demo` for a new song; or `/sound-catalog-release-plan` → `/sound-catalog-isrc-mint` → `/sound-catalog-metadata-pack` for a release)
- [ ] Composition rule tested: `/sound-composition-arrange` before `/sound-production-mix-plan`; sample/AI-vocal clearance before `/sound-production-master-plan`
- [ ] Refusal-pattern hit logged — when an artifact declined to ship a theater pattern (loudness war, AI-vocal-impersonation, master-flip, paid-playlist), capture which one
- [ ] Second sub-system entered (the one your daily-5 surfaced as next-most-leveraged for your practice)

---

## File map (where everything lives)

### Vertical wrapper (9 files at `verticals/sound-intelligence/`)

```
verticals/sound-intelligence/
├── README.md           # Overview + synthesis edge + productization paths
├── SKILL.md            # Substrate skill contract for the vertical
├── SOUL.md             # Refusal posture + drift tests
├── STACK.md            # Composition with universal IS layers
├── AGENTS.md           # 6 sub-system agents + tier discipline
├── SUB-SYSTEMS.md      # The canonical 6 sub-system map
├── CANON.md            # At-a-glance canonical resolver
├── MEMORY.md           # Append-only operational log
├── STRATEGY.md         # Redirect stub: layer separation vs. Music IS (do not delete)
└── QUICK-START.md      # ← you are here
```

### Agents (6 files at `agents/`)

- `starlight-sound-composition.md` — Songwriting + arrangement architecture (Huron / Margulis / Patel / Levitin)
- `starlight-sound-production.md` — Mix planning + master planning + vocal chain + recall (Moylan / Katz / ITU-R BS.1770)
- `starlight-sound-catalog.md` — ISRC + ISWC + metadata + version map + deplatform recovery (IFPI / DDEX / MMA)
- `starlight-sound-performance.md` — Set design + audience contract + live mix + residency + broadcast
- `starlight-sound-audience.md` — Cohort map + ritual design + list architecture + stay-interview + sovereign publish
- `starlight-sound-sync.md` — Brief fit + placement thesis + license economics + rights pack + sync stay-interview

### Skills (6 files at `skills/sound-intelligence/`)

- `composition-architecture.md` — Score, lyric, arrangement, demo, transition systems
- `production-systems.md` — Mix planning, mastering, vocal chain, recall, sync-grade alt-master
- `catalog-systems.md` — ISRC/ISWC discipline, metadata pack, version map, deplatform recovery
- `performance-design.md` — Set architecture, audience contract, live mix, residency, broadcast
- `audience-architecture.md` — Cohort, ritual, list, stay-interview, sovereign publish
- `sync-licensing.md` — Brief fit, placement thesis, license economics, rights pack, stay-interview

### Commands (30 files at `.claude/commands/sound-*`)

Grouped by sub-system. Counts verified against the directory.

```
sound-composition-score · -lyric · -arrange · -demo · -transition                                          (5)
sound-production-mix-plan · -master-plan · -vocal-chain · -sound-design · -recall                          (5)
sound-catalog-release-plan · -isrc-mint · -metadata-pack · -version-map · -deplatform-recovery             (5)
sound-performance-set-design · -audience-contract · -live-mix · -residency · -broadcast-prep              (5)
sound-audience-cohort-map · -ritual-design · -list-architecture · -fan-stay-interview · -sovereign-publish (5)
sound-sync-brief-fit · -placement-thesis · -license-economics · -rights-pack · -stay-interview            (5)
```

### Knowledge templates (6 files)

`integrations/starter-packs/friend-starter/knowledge/sound-{composition,production,catalog,performance,audience,sync}-template.md`

---

## The 6 sub-systems

| # | Sub-system | Agent | Skill | Commands |
|---|---|---|---|---|
| 1 | **Composition** | `starlight-sound-composition` | `composition-architecture` | 5 |
| 2 | **Production** | `starlight-sound-production` | `production-systems` | 5 |
| 3 | **Catalog** | `starlight-sound-catalog` | `catalog-systems` | 5 |
| 4 | **Performance** | `starlight-sound-performance` | `performance-design` | 5 |
| 5 | **Audience** | `starlight-sound-audience` | `audience-architecture` | 5 |
| 6 | **Sync & Licensing** | `starlight-sound-sync` | `sync-licensing` | 5 |

Full sub-system map: `SUB-SYSTEMS.md`.

---

## Quick-reference commands

```
# Composition
/sound-composition-score <song-slug>
/sound-composition-lyric <song-slug>
/sound-composition-arrange <song-slug>
/sound-composition-demo <song-slug>
/sound-composition-transition <song-slug>

# Production
/sound-production-mix-plan <session-slug>
/sound-production-master-plan <session-slug>
/sound-production-vocal-chain <session-slug>
/sound-production-sound-design <session-slug>
/sound-production-recall <session-slug>

# Catalog
/sound-catalog-release-plan <release-slug>
/sound-catalog-isrc-mint <release-slug>
/sound-catalog-metadata-pack <release-slug>
/sound-catalog-version-map <release-slug>
/sound-catalog-deplatform-recovery <release-slug>

# Performance
/sound-performance-set-design <set-length>
/sound-performance-audience-contract <show-slug>
/sound-performance-live-mix <show-slug>
/sound-performance-residency <residency-slug>
/sound-performance-broadcast-prep <format>

# Audience
/sound-audience-cohort-map <practitioner-slug>
/sound-audience-ritual-design <practitioner-slug>
/sound-audience-list-architecture <practitioner-slug>
/sound-audience-fan-stay-interview <practitioner-slug>
/sound-audience-sovereign-publish <practitioner-slug>

# Sync & Licensing
/sound-sync-brief-fit <brief-slug>
/sound-sync-placement-thesis <brief-slug>
/sound-sync-license-economics <brief-slug>
/sound-sync-rights-pack <release-slug>
/sound-sync-stay-interview <supervisor-or-library>
```

---

## Six non-negotiable composition rules (compressed)

1. **Composition's arrangement runs upstream of Production's mix plan.** "Fix it in the mix" is refused. `/sound-composition-arrange` runs before `/sound-production-mix-plan`.
2. **Sample-clearance and AI-vocal-license run as gates BEFORE Production master.** A master shipped with uncleared exposure is non-shippable. `/sound-catalog-metadata-pack` clearance section runs before `/sound-production-master-plan`.
3. **Vision must define before Audience does sovereign publishing.** Without Vision, "sovereign publishing" collapses into content-calendar drift. `/define-vision` runs before `/sound-audience-sovereign-publish` for new practitioners.
4. **Audience monitoring runs in parallel with release.** A release without pre-warming and post-release ritual is a release into a vacuum. `/sound-audience-ritual-design` and `/sound-audience-list-architecture` run before, during, after release execution.
5. **Sync's brief-fit gate runs before any sync work.** Sync placements that contradict declared vision boundaries are refused at brief-fit, not after. Reads `MEMORY.md` § Vision boundaries.
6. **Performance set design composes from Composition arrangement architecture.** The same tension-and-release logic that holds across a song holds across a 75-minute set.

Full ruleset: `SUB-SYSTEMS.md` § Composition rules.

---

## Refusal posture — what makes this not the loudness-war / grift-economy playbook

- **Loudness-war mastering refused** (chasing -8 LUFS on streaming, crushing dynamic range; Vickers on listener fatigue is unambiguous). Sync needs a different master than streaming — single-master-for-all-destinations is refused.
- **AI-vocal-impersonation refused without consent** (vocals trained on or imitating a specific identifiable artist without written license). AI involvement is disclosed structurally in metadata.
- **Sample-without-clearance refused at the master gate**, not negotiated post-release.
- **Master-rights-flip in exchange for sync placement refused** (perpetual exclusive rights without justification of services).
- **Paid-playlist placement refused** (corrodes the only audience that matters; the cohort map registers paid plays as zero).
- **Algorithmic-followers-as-audience refused** (TikTok followers without list capture; Spotify monthly-listeners as audience metric is refused).
- **Bot followers, fake plays, payola refused** — they corrode signal across every other sub-system.
- **"Fix it in the mix" for what should have been arranged** is refused upstream by Composition.
- **Recall packs skipped** is refused — sessions must be reopenable in 6 months / 6 years.
- **Engagement-survey-as-fan-relationship refused** — fan stay-interview replaces it.

The full refusal posture for each sub-system lives in each agent's "Refusal patterns" section.

---

## Signature discipline — what makes this craft-tradition-grounded

- **Tension-and-release as architecture** (Huron's ITPRA model — Imagination, Tension, Prediction, Reaction, Appraisal). Why the fourth chorus needs the change.
- **Repetition as load-bearing structure** (Margulis). What felt indulgent in listen one becomes load-bearing by listen three.
- **Prosody as compositional gate** (Patel). Lyric stresses fighting melodic stresses do not earn play counts.
- **Auditory scene analysis bounds arrangement density** (Bregman). What the listener can parse without overload.
- **Metadata as load-bearing infrastructure** (IFPI / DDEX / Music Modernization Act). Royalty leakage is a metadata problem, not a marketing problem.
- **The list as the only owned distribution layer** (Doctorow on enshittification; Kelly's 1,000 True Fans direction). Algorithmic distribution is renting; the list is owning.
- **Stay-interview > exit-interview** (Brennan / Beghtol direction extended to fan and supervisor relationships). Leverage exists with current relationships, not after they end.
- **Hearing health is non-negotiable** (NIOSH / AES limits). Decade-shortening exposure is a real failure mode for working performers.

---

## When stuck or things break

- **A track was mastered but Catalog is rejecting the release** → check `/sound-catalog-metadata-pack` clearance section. Sample / AI-vocal license / contributor splits / PRO registration / sync-availability flag — one of these is missing.
- **Sync pitch keeps getting rejected at brief-fit** → run `/sound-sync-brief-fit` against the brief explicitly. Most rejections are catalog-mismatch or master-availability, not "the music is wrong."
- **A release shipped but no audience response** → audience pre-warming was skipped. `/sound-audience-ritual-design` and `/sound-audience-list-architecture` run before release, not after.
- **A DSP removed a release** → `/sound-catalog-deplatform-recovery`. Preservation protocol, re-release plan, audience communication. Do not panic-publish.
- **The boundary with Music IS feels fuzzy** → re-read the layering note. Music IS is Frank's operated label (four labels, Suno-first, OpenClaws). Sound Intelligence is the public reference forkable for any sovereign sound practitioner.
- **Forking for a private practice and unsure what to keep** → the substrate-aligned scaffold is MIT; your compositions, masters, voice, methodology, and client-shaped artifacts are yours. Run `/sovereign-spawn` or `/spawn-domain-stack` for the fork.

---

## What this gives you

- **A research-grounded operating layer** above your DAW / distribution / PRO infrastructure — not a tooling replacement, the thinking layer that runs above them.
- **Six sub-systems with shared voice and shared refusal posture** — the same practitioner who shows up in Composition shows up in Catalog and Sync. No tool-switching tone collapse.
- **Composition rules that prevent the most common failure modes** — fix-it-in-the-mix, master-with-uncleared-samples, release-into-the-vacuum, sync-pitch-without-brief-fit, master-rights-flip-for-a-check.
- **A productization scaffold** — own catalog operating layer, executor leverage, productized offer, copilot/GPT extension, licensable methodology. Five compounding paths from one fork.
- **Attestation by default** — every release ships "Built on SIP" plus your vertical identifier; audio artifacts use `/sip-attest-audio` for embedded EXIF/XMP attestation. Sovereignty clause non-waivable.
- **A back catalog that compounds** — metadata discipline turns sunk-cost archives into sync-pipeline inventory; ritual cadence turns one-off releases into a discography arc; the list converts streams into relationships.
- **A boundary with Music IS that holds** — the public reference is not the operator's playbook, and the operator's playbook does not absorb the public reference. Both compose at methodology, neither duplicates substrate.

---

**Built on SIP** — `verticals/sound-intelligence/QUICK-START.md` · v0.1 · 2026-04-30 · The front door · Phase 0 complete · Phase 1 ready
