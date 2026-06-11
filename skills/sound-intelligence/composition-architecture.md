---
name: sound-intelligence/composition-architecture
description: Designs the songwriting and arrangement instrument — score, lyric, arrangement, demo, transition — using music-theory and cognitive-science direction. Refuses "fix it in the mix" for upstream-defaultable failures and refuses generic-pretty lyric language. Use when architecting a song structure, drafting or critiquing lyrics, designing an arrangement, building a demo, or composing a transition between song sections. Sub-system 1 of 6 in the Sound Intelligence reference vertical.
---

# Skill: sound-intelligence/composition-architecture

> Designs the songwriting and arrangement instrument — score, lyric, arrangement, demo, transition — using music-theory and cognitive-science direction. Refuses "fix it in the mix" for upstream-defaultable failures and refuses generic-pretty lyric language. Sub-system 1 of 6 in the Sound Intelligence reference vertical.

**Domain:** Sound Intelligence
**Vertical:** Sound Intelligence (sub-system: Composition)
**Voice:** the practitioner's voice (composed via Genius layer) — warm, theory-precise, refuses producer-influencer hand-waving.
**Disclaimer:** Composition decisions touch rights territory (sample clearance, AI-vocal license, co-writer splits). This skill produces system architecture, not legal advice. Validate jurisdiction- and PRO-specific compliance with qualified music counsel.

---

## Activation Triggers

**Keywords:** songwriting, composition, compose, arrange, arrangement, lyric, lyrics, melody, harmony, chord progression, chord, modulation, key change, modal, song form, verse, chorus, bridge, pre-chorus, outro, intro, transition, drop, build, breakdown, demo, reference track, prosody, tension and release, expectation and reward.

**Agents:** `starlight-sound-composition` (primary), `starlight-genius` (voice composition for lyric), `starlight-prime` (synthesis when arrangement / lyric / transition tensions surface).

**Intents:** composition-architecture, lyric-architecture, arrangement-design, demo-planning, transition-design.

**Commands:** `/sound-composition-score`, `/sound-composition-lyric`, `/sound-composition-arrange`, `/sound-composition-demo`, `/sound-composition-transition`.

---

## Research grounding

This skill is grounded in published cognitive-science and music-theory literature. Claims are not invented; they reference direction.

- **Levitin — *This Is Your Brain on Music*:** music perception as the listener's nervous system parsing pitch, rhythm, timbre, melody, harmony, and meter; relevance for arrangement decisions about what listener can parse simultaneously.
- **Huron — *Sweet Anticipation*:** expectation-and-reward as the engine of musical pleasure; ITPRA model (Imagination, Tension, Prediction, Reaction, Appraisal); relevance for tension-and-release design across the song and across the set.
- **Margulis — *On Repeat*:** repetition as load-bearing structure in music; the second listen makes load-bearing what the first listen felt indulgent.
- **Patel — *Music, Language, and the Brain*:** shared cognitive substrate of music and language; relevance for lyric prosody — stresses of lyric line align with melodic stresses or fight them with intent.
- **Pohjannoro on composition cognition:** what composers actually do during composition — protocol-analyzed; relevance for the working state the practitioner is inside.
- **Bregman — *Auditory Scene Analysis*:** how the listener parses simultaneous streams; relevance for arrangement density curves (most listeners parse 4-7 simultaneous elements before overload — cite as direction not fixed number).
- **Bertin-Mahieux et al. and Pachet on hit prediction:** research-disputed; named here to surface that hit-prediction is unreliable and the vertical optimizes for catalog architecture, not viral-hit-likelihood.

This skill cites direction, not specific numbers — cognitive-science effect sizes shift across replication waves and methodological refinements. The frameworks (ITPRA, prosody, density curve, expectation-reward) are stable.

---

## Protocol — 7 steps

### Step 1: Sort song stage

Before anything: idea / sketch / demo-ready / demo-done / in-production. Different stages need different commands. Mismatch is the most common error.

### Step 2: Name the expectation-and-reward arc

What is this song's arc (Huron framework)? Where does tension peak? Where does prediction get violated (the surprise) and where does it get confirmed (the satisfaction)? If the song has neither surprise nor satisfaction, it is a loop, not a song. Name the arc; write toward it.

### Step 3: Score architecture

- **Key and mode** — why this key, why this mode (not the default of C major just because the DAW opens there). Modal awareness: writing in dorian gives different tonal palette than aeolian; mixing modes is fine with intent but creates collisions without it.
- **Harmonic motion** — functional (V-I cadences central) / modal (color-shift over functional return) / static-with-color (drone-based, color through voicing) / chromatic (chromatic chord motion as primary). Pick the class with intent.
- **Form** — verse-chorus / through-composed / AABA / loop-based. Each carries different listener-expectation defaults.
- **Tempo and time signature** — with rationale ("96bpm not 100 because the lyric prosody needs the slightly-slower stress pattern"; "7/8 because the rhythmic surprise is load-bearing").

### Step 4: Lyric architecture (when in lyric scope)

- **Premise** — the one sentence the song is about. If it cannot be said in one sentence, the song does not yet have a premise.
- **Perspective** — first-person / second-person / third-person / mixed. With rationale.
- **Persona** — same as the practitioner / constructed persona.
- **Structural form** — AABA lyric / verse-chorus lyric / through-composed / list-form / narrative-form.
- **Prosody check** — Patel's framework. Stresses of lyric line align with melodic stresses, or intentionally fight them for effect. Mismatches without intent reduce both signals.
- **Refrain design** — the line that earns the seventh repetition. The refrain is where Margulis's repetition research lands — the line that becomes load-bearing through return.
- **Specific imagery** — the named-thing (a specific chair in a specific room) replaces the vague-pretty (a sad place). Generic-pretty is refused.

### Step 5: Arrangement architecture

- **Instrumentation choices** — named with reasoning. "Acoustic guitar V1, piano chorus is wrong because the piano has been carrying the melodic motif since bar 5; switch the polarity."
- **Density curve** — across the song, plot the simultaneous-element count. Default: low V1 (2-3 elements), medium pre-chorus (4-5), peak chorus (5-7), lower V2 with new texture (3-4), higher pre-chorus 2 (5-6), peak-plus chorus 2 (6-7+), bridge low or new-element (3-4), peak chorus 3 with new element (6-8). Violate with intent.
- **Contrast logic** — timbral, dynamic, rhythmic, harmonic. Each section contrasts with neighbors on at least one axis.
- **Automation foreshadowing** — what gets introduced quietly in V1 (a synth pad at -18 dB) to land at the bridge (the same pad at 0 dB).
- **Negative-space discipline** — what is removed in the final chorus to make the climax land. The most common arrangement failure is additive density without subtractive moments.

### Step 6: Demo planning

What does this demo need to prove? Different demos prove different things:

- **Vocal melody and lyric** → one-take vocal-and-instrument (guitar / piano) demo.
- **Harmonic motion and form** → rough-multitrack-on-DAW with placeholder instruments.
- **Arrangement viability** → near-final-arrangement demo with placeholder mix.
- **Tempo and feel** → click-and-instrument demo to test pocket.

Capture method matched to what's being proven. Reference-track grounding: 2-3 reference tracks the demo is in conversation with — not to copy, to position.

### Step 7: Transition design

Each section boundary: what transition move? Why? What does it serve in the expectation-and-reward arc?

Transition moves named:

- **Drop** — sudden density reduction (chorus to V2 drop; build to drop).
- **Build** — additive density (V to pre-chorus; pre-chorus to chorus).
- **Breakdown** — extended low-density (bridge often).
- **Modulation** — key change at structural moment (often final chorus).
- **Instrumental hand-off** — motif passes between instruments (guitar V1 → piano V2, same melodic motif).
- **Lyrical pivot** — perspective or mode shifts at section boundary.
- **False-end** — apparent ending followed by return.
- **Tag-out** — final chorus extends and fragments.

Fade-in / fade-out as default is refused. If used, named as deliberate (with rationale).

---

## Rules

1. **Theory and cognition cited by direction.** Schmidt-Hunter-style invented-stat-without-source is refused. Numbers are sourced or named-as-uncertain.
2. **Sort song stage before applying commands.** Mismatch is the most common error.
3. **Name the expectation-and-reward arc.** Songs without surprise-and-satisfaction are loops, not songs.
4. **Prosody check non-negotiable.** Lyric stresses align with melodic stresses, or fight them with intent.
5. **Density curve plotted across the song.** Default low-medium-peak-low-medium-peak-low-peak; violate with intent.
6. **Specific imagery over generic-pretty in lyric.** Named-thing replaces vague-pretty.
7. **Demo plan names what the demo proves vs. what it does not need to prove yet.** Going straight from idea to full production without proof is refused.
8. **Transitions designed explicitly, not defaulted.** Fade-in / fade-out as default is refused.
9. **Rights flags surfaced for downstream.** Sample sources, co-writer involvement, AI involvement — surfaced here, adjudicated in Catalog and Sync.
10. **Compose with Genius for voice in lyric.** No generic-pretty pop-trope language.
11. **"Fix it in the mix" refused at composition stage.** Upstream-defaultable failures are upstream-fixed.
12. **Every artifact ends with "Built on SIP" attestation.**

---

## Output Artifacts

| Artifact | Command | Storage |
|----------|---------|---------|
| Score architecture | `/sound-composition-score` | `sound-intelligence/composition/score-<song-slug>-<date>.md` |
| Lyric architecture | `/sound-composition-lyric` | `sound-intelligence/composition/lyric-<song-slug>-<date>.md` |
| Arrangement architecture | `/sound-composition-arrange` | `sound-intelligence/composition/arrange-<song-slug>-<date>.md` |
| Demo plan | `/sound-composition-demo` | `sound-intelligence/composition/demo-<song-slug>-<date>.md` |
| Transition design | `/sound-composition-transition` | `sound-intelligence/composition/transition-<song-slug>-<date>.md` |

---

## Related Skills

- `intelligence/decision-framework` — form, key, tempo, transition decisions
- `intelligence/pattern-recognition` — catalog signature recognition; reference-track positioning
- `intelligence/systems-thinking` — density curve as system; expectation-and-reward as architecture
- `memory/knowledge-synthesis` — composing the per-song record across score / lyric / arrangement / demo / transition

---

— Sound Composition Intelligence — part of the Sound Intelligence reference vertical —

---
**Built on SIP** — Starlight Intelligence Protocol
- Substrate: starlightintelligence.org/protocol v1.1.0
- Layers used: [file-contract, attestation, commands, sovereignty]
- Verticals: starlight-intelligence-system@v7.5.1 (Sound Intelligence reference vertical — Composition sub-system)
- Generated: 2026-04-26
---
