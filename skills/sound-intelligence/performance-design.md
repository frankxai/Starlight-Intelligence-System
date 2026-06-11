---
name: sound-intelligence/performance-design
description: Designs the live performance instrument — set design, audience contract, live mix, residency, broadcast prep — using tension-and-release direction extended across the live arc and live-sound-engineering grounding. Refuses every-show-same-setlist and refuses single-point-of-failure live mix. Use when designing a live set, planning a residency, architecting an audience contract, preparing broadcast mix documentation, or auditing live-sound failure points. Sub-system 4 of 6 in the Sound Intelligence reference vertical.
---

# Skill: sound-intelligence/performance-design

> Designs the live performance instrument — set design, audience contract, live mix, residency, broadcast prep — using tension-and-release direction extended across the live arc and live-sound-engineering grounding. Refuses every-show-same-setlist and refuses single-point-of-failure live mix. Sub-system 4 of 6 in the Sound Intelligence reference vertical.

**Domain:** Sound Intelligence
**Vertical:** Sound Intelligence (sub-system: Performance)
**Voice:** the practitioner's voice — warm, structurally precise, refuses casual live-sound language.
**Disclaimer:** Performance decisions touch hearing-health risk and broadcast-rights territory. This skill produces system architecture, not legal advice and not medical advice. Hearing-health protection requires audiologist consultation; broadcast-rights require qualified counsel.

---

## Activation Triggers

**Keywords:** live, show, setlist, set, set design, opener, closer, peak, tour, venue, festival, theater, residency, Tiny Desk, KEXP, soundcheck, front of house, FOH, monitor, monitor mix, in-ear, IEM, wedge, console, digital console, wireless, transmitter, redundancy, broadcast, livestream, radio session, hearing protection.

**Agents:** `starlight-sound-performance` (primary), `starlight-sound-composition` (arrangement architecture transfers), `starlight-sound-audience` (audience contract bridge), `starlight-embodiment` (touring health).

**Intents:** set-architecture, audience-contract-design, live-mix-planning, residency-design, broadcast-prep, hearing-health-protection.

**Commands:** `/sound-performance-set-design`, `/sound-performance-audience-contract`, `/sound-performance-live-mix`, `/sound-performance-residency`, `/sound-performance-broadcast-prep`.

---

## Research grounding

- **Huron — *Sweet Anticipation*** (extended to set-level): tension-and-release across a 75-minute set has its own arc.
- **Margulis — *On Repeat*** (extended to set-level): catalog-favorites earn their return-attendance through repetition over multiple shows.
- **Davis & Patronis — *Sound System Engineering*:** practitioner-grade reference for live-sound architecture.
- **Ahnert & Steffen — *Sound Reinforcement Engineering*:** room acoustics and reinforcement design.
- **NIOSH limits + AES guidelines for hearing protection:** 85 dB(A) over 8 hours; halve duration per 3 dB increase. Live-sound exposure typically exceeds NIOSH; hearing protection is non-negotiable for multi-decade practice.
- **Peak-end memory bias (Kahneman et al.):** listeners remember the peak moment and the closing moment. Design accordingly.

This skill cites direction. Specific SPL limits and live-sound research details are practitioner-trade-validated; the architecture (set as arc, redundancy as design, hearing-health as non-negotiable) is stable.

---

## Protocol — 7 steps

### Step 1: Sort performance type

Single show / multi-night residency / festival slot / radio session / TV / livestream / Tiny Desk-format / private event. Different formats need different protocols.

### Step 2: Audience contract first

What does the venue + ticket already tell the audience? What will the practitioner add to or modify?

| Venue type | Contract default |
|---|---|
| Listening room | Stillness, attention, no-talking-during-quiet-songs |
| Festival | Peaks more frequent, breaks shorter |
| Dance floor / club | Continuous flow, fewer breaks |
| Seated theater | Arc-driven, intermission consideration |
| Living-room concert / house show | Intimate, conversational between songs |

Set the contract before designing the set; the set serves the contract.

### Step 3: Set architecture

Length-aware design (45 / 60 / 75 / 90 / 120-minute architectures differ structurally).

- **Opener logic:** what does the room need to hear first? Establishes audience contract; energy floor or peak; familiar or unfamiliar.
- **Peak logic:** the song-or-moment the audience remembers. Peak-end memory bias: typically 60-70% through the set, not at the end.
- **Closer logic:** the resolution; the moment that earns the return.
- **Tension-and-release across the set:** peaks need valleys to land; valleys earn the next peak.
- **Instrumentation logistics:** which songs require what gear, costume changes, stage moves; sequence to allow the logistics.
- **Transition design:** DJ-style mixed transitions; band-style breath transitions; hybrid — explicit per transition.

### Step 4: Live mix plan

- **FOH priorities** (defaults; specific songs may invert): vocal first; rhythm section second; harmonic instruments third; texture fourth.
- **Per-performer monitor mix:** vocal-monitor heavy on vocal-and-pitched-element; drum-monitor heavy on click-and-bass; etc.
- **IEM vs. wedge decision:** IEM enables hearing protection AND consistency across rooms but introduces transmitter-failure risk. Wedge is cheaper but less hearing-safe and less consistent.
- **Redundancy plan:** backup wireless transmitter; backup vocal mic; backup laptop / playback rig if applicable; manual-backup mode for digital-console failure. "What if X fails?" scenario per critical path.
- **Soundcheck protocol:** what is checked, what is checked-against-recorded-reference, what is left to ear-and-feel — but checked, not skipped.

### Step 5: Hearing-health baseline

Non-negotiable for multi-decade practice.

- **NIOSH-aware SPL:** 85 dB(A) baseline; halve duration per 3 dB increase. Live-sound typically 95-110 dB(A); duration thresholds shrink dramatically.
- **IEM volume calibrated, not maximized.** Ambient-mix to preserve room awareness without overload.
- **Hearing-test cadence for performers:** annual minimum; pre-tour and post-tour where exposure spikes.
- **Refusal:** "loud-as-feel" default that ignores cumulative exposure.

### Step 6: Residency multi-night architecture (when applicable)

- **Per-night focus:** Night 1 full-catalog overview / Night 2 deep-cuts and unreleased / Night 3 collaborator-night / Night 4 long-form arrangements / Night 5 stripped-down acoustic. Illustrative; practitioner shapes per residency.
- **Cumulative arc:** an audience attending all nights traces a meta-arc; reward the loyalty.
- **Audience-return ritual:** the moment that makes the audience want night N+1 — a song unfinished, a question unanswered, a thread tied across the run.
- **Recording the residency:** multi-track capture; mix-down protocol; potential live-album/EP release per Catalog version-map; per-night ISRC architecture if recording becomes catalog asset.

### Step 7: Broadcast prep (when applicable)

Format-specific architecture.

| Format | Considerations |
|---|---|
| **Tiny Desk** | Intimate camera framing; stripped arrangement; vocal-and-acoustic-or-light-band; 3-5 songs in 15-20 minutes |
| **KEXP** | Live-radio with on-camera; 4-6 songs; mid-fidelity on-camera audio + high-fidelity broadcast feed |
| **BBC Live Lounge / radio session** | Often a cover plus originals; arrangement adjusted for radio audience |
| **Livestream** | Own-stream architecture; chat-engagement layer; OBS / vMix / Restream pipeline |
| **TV performance** | Lip-sync vs. live-vocal-over-track decisions; click-and-track delivery; on-camera direction |

Post-broadcast catalog integration: rights-pack with broadcaster; reuse permissions; clip permissions; per-version ISRC if recording becomes catalog asset.

---

## Rules

1. **Disclaimer at top of every artifact touching hearing-health or broadcast-rights.**
2. **Sort performance type before applying commands.**
3. **Audience contract named explicitly before set finalization.**
4. **Set architecture: length-aware, opener/peak/closer logic, tension-and-release arc.**
5. **Live-mix plan with redundancy per critical path.**
6. **Hearing-health baseline addressed per show.** NIOSH-aware SPL, IEM calibrated, performer hearing-test cadence.
7. **Soundcheck protocol followed, not skipped.**
8. **Every-show-same-setlist refused for residencies.**
9. **Single-point-of-failure live mix refused.** Backup transmitter / mic / playback / console-mode.
10. **Broadcast-format-specific arrangement (not generic).**
11. **Live-recording capture protocol when show could become catalog asset.**
12. **Hand-off to Catalog for live-version metadata.**
13. **Hand-off to Embodiment for touring health (sleep, nutrition, voice care, ear care).**
14. **Every artifact ends with "Built on SIP" attestation.**

---

## Output Artifacts

| Artifact | Command | Storage |
|----------|---------|---------|
| Set design | `/sound-performance-set-design` | `sound-intelligence/performance/set-<show-slug>-<date>.md` |
| Audience contract | `/sound-performance-audience-contract` | `sound-intelligence/performance/contract-<show-slug>-<date>.md` |
| Live mix plan | `/sound-performance-live-mix` | `sound-intelligence/performance/live-mix-<show-slug>-<date>.md` |
| Residency design | `/sound-performance-residency` | `sound-intelligence/performance/residency-<residency-slug>-<date>.md` |
| Broadcast prep | `/sound-performance-broadcast-prep` | `sound-intelligence/performance/broadcast-<format-slug>-<date>.md` |

---

## Related Skills

- `intelligence/decision-framework` — set sequencing, broadcast-format decisions
- `intelligence/systems-thinking` — live-mix as system; residency as multi-night architecture
- `intelligence/pattern-recognition` — audience-pattern recognition across shows; venue-pattern recognition
- `memory/knowledge-synthesis` — composing the per-performance record across set / contract / mix / residency / broadcast

---

— Sound Performance Intelligence — part of the Sound Intelligence reference vertical —

---
**Built on SIP** — Starlight Intelligence Protocol
- Substrate: starlightintelligence.org/protocol v1.1.0
- Layers used: [file-contract, attestation, commands, sovereignty]
- Verticals: starlight-intelligence-system@v7.5.1 (Sound Intelligence reference vertical — Performance sub-system)
- Generated: 2026-04-26
---
