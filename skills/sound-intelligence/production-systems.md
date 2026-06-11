---
name: sound-intelligence/production-systems
description: Designs the mix-and-master-and-recall instrument — frequency budget, gain-stage hierarchy, dynamic-range envelope, vocal chain, sound-design, recall pack — using mix-architecture and mastering-theory direction. Refuses loudness-war mastering and refuses AI-vocal-impersonation without license. Use when architecting a mix session, building a vocal chain, designing sound, preparing a mastering brief, or structuring a recall pack for session continuity. Sub-system 2 of 6 in the Sound Intelligence reference vertical.
---

# Skill: sound-intelligence/production-systems

> Designs the mix-and-master-and-recall instrument — frequency budget, gain-stage hierarchy, dynamic-range envelope, vocal chain, sound-design, recall pack — using mix-architecture and mastering-theory direction. Refuses loudness-war mastering and refuses AI-vocal-impersonation without license. Sub-system 2 of 6 in the Sound Intelligence reference vertical.

**Domain:** Sound Intelligence
**Vertical:** Sound Intelligence (sub-system: Production)
**Voice:** the practitioner's voice — warm, technically precise, refuses producer-influencer hand-waving.
**Disclaimer:** Production decisions touch rights territory (sample clearance, AI-vocal license, contributor splits). This skill produces system architecture, not legal advice. Validate jurisdiction- and PRO-specific compliance with qualified music counsel.

---

## Activation Triggers

**Keywords:** mix, mixing, master, mastering, LUFS, loudness, normalization, dynamic range, PSR, PLR, true peak, limiter, compression, compressor, EQ, equalizer, reverb, delay, send, bus, vocal chain, de-essing, autotune, tuning, sound design, synth, sample, stem, session, recall, DAW, plugin chain, frequency masking, gain stage.

**Agents:** `starlight-sound-production` (primary), `starlight-sound-catalog` (clearance gate), `starlight-sound-sync` (sync-grade alternate-master).

**Intents:** mix-planning, mastering, vocal-chain-design, sound-design, session-recall, loudness-war-refusal.

**Commands:** `/sound-production-mix-plan`, `/sound-production-master-plan`, `/sound-production-vocal-chain`, `/sound-production-sound-design`, `/sound-production-recall`.

---

## Research grounding

- **Moylan — *Understanding and Crafting the Mix*:** mix architecture as decisions about frequency, dynamic, spatial, and timbral budget — not as taste.
- **Katz — *Mastering Audio*:** K-system reference; dynamic-range preservation as load-bearing; calibrated against actual listener fatigue.
- **ITU-R BS.1770 / BS.1771:** international loudness measurement standard (LUFS); the basis of streaming normalization specifications.
- **Vickers on the loudness war:** research direction on listener fatigue and dynamic compression; the loudness-war is research-rejected.
- **Owsinski — *The Mixing Engineer's Handbook*:** practitioner-grade architecture for popular-music mix.
- **Streaming normalization specs (verify at master time):** Spotify ~-14 LUFS reference; Apple Music ~-16 LUFS; Tidal ~-14 LUFS; YouTube ~-14 LUFS. These shift across years; verify the current spec.

This skill cites direction, not fixed loudness numbers — streaming normalization specs change. The architecture (preserve dynamic range; master per-destination; true-peak ceiling at -1.0 dBTP) is stable.

---

## Protocol — 7 steps

### Step 1: Sort production stage

Pre-mix / mix-in-progress / mix-done-needs-master / master-in-progress / master-done-needs-recall.

### Step 2: Rights-and-clearance gate

Before any master plan: pull sample-clearance status from Catalog. Pull AI-vocal-license status. Any open status blocks master finalization. Halt; route to clearance protocol.

### Step 3: Frequency budget

Allocate the spectrum:

- **Sub (20-80 Hz):** kick, bass; mono below ~100 Hz for vinyl + club compatibility.
- **Low-mids (80-300 Hz):** rhythm guitar, lower piano, male vocal body, kick body.
- **Mids (300 Hz - 2 kHz):** vocal core, lead instruments.
- **High-mids (2-8 kHz):** vocal presence, cymbals, attack of percussive elements.
- **Air (8 kHz+):** shimmer, reverb tails, high-frequency texture.

What's masking what? The mix's most common failure mode is masking — two elements competing for the same frequency band. Surface masking; resolve via sidechain, EQ-carve, or arrangement-level changes.

### Step 4: Gain-stage hierarchy

- **Channel peaks at -6 dBFS** (gives compression headroom).
- **Bus levels at -10 dBFS** (gives bus-glue and parallel compression headroom).
- **Master at ≤-3 dBFS pre-limiter** (gives master limiter room to work without crushing).

Headroom is a feature.

### Step 5: Dynamic-range envelope

Per song: where does it breathe, where does it lift, where does the master limiter work and where does it stay out of the way.

- **PSR target ≥ 6 dB** (Peak-to-Short-term-loudness Ratio); ideally ≥ 8 dB.
- **PLR matching the song's intended feel** (Peak-to-Loudness Ratio; long-term average).
- Master limiter not hitting more than ~3 dB at peak; if it's hitting more, the mix needs revisiting before master.

### Step 6: Per-destination master plan

Single-master-for-all-destinations is refused.

- **Streaming master:** target LUFS per platform (Spotify ~-14, Apple Music ~-16, Tidal ~-14, YouTube ~-14 — verify at master time). PSR ≥ 6 dB; ideally ≥ 8 dB. True-peak ceiling at -1.0 dBTP minimum for streaming codec safety.
- **Sync-grade alternate-master:** preserves substantially more dynamic range. K-12 spec or wider; PSR ≥ 12 dB. For film/TV/game placements where compression betrays the brief.
- **Vinyl master:** cutting-lathe-aware. Less low-end mono compatibility issues; more dynamic range; fewer extreme stereo effects in bass; potentially shorter runtime per side affecting song order.

### Step 7: Vocal chain matched to voice-and-song

Vocal chain designed for THIS voice, THIS song. Not deployed as default.

- **Tuning posture:** untuned (refusal of pitch-correction as default) / lightly-tuned (light-touch at narrow window; retains performance) / heavily-tuned (Auto-Tune as artistic effect, not as repair).
- **De-essing:** per-voice; sibilance frequency varies by speaker; one-size-fits-all is inadequate.
- **EQ:** subtractive-first. Cut the muddy 250-400 Hz buildup before adding presence at 3-5 kHz.
- **Compression:** attack and release matched to phrasing. Slower attack on sustained vocals; faster attack on percussive vocals.
- **Saturation:** harmonic excitement at perceived-volume cost.
- **Sends:** parallel reverb send, vocal-doubler send, delay send for emphasis. Discrete sends, not all-on-one bus.
- **Automation map:** when the vocal lifts, what plugins respond.

---

## Rules

1. **Disclaimer at top of every artifact touching rights.**
2. **Sort production stage before applying commands.**
3. **Rights-and-clearance gate non-negotiable.** Sample-uncleared = master-refused. AI-vocal-impersonation = session-refused.
4. **Mix-plan-before-patch.** No patching without a plan.
5. **Frequency budget allocated.** Masking surfaced and resolved.
6. **Gain-stage hierarchy followed.** Channels -6 / Buses -10 / Master -3 pre-limiter.
7. **Dynamic-range envelope mapped per song.** PSR ≥ 6 dB; ideally ≥ 8 dB.
8. **Per-destination master plan.** Single-master-for-all is refused.
9. **True-peak ceiling at -1.0 dBTP for streaming.**
10. **Loudness-war mastering refused.** Crushing dynamic range to chase perceived-loudness when streaming will normalize down anyway is refused.
11. **AI-vocal-impersonation without written license refused.** Including for dead artists' estates that have not granted rights.
12. **Vocal chain matched to voice-and-song.** Not deployed as default.
13. **Sample sources documented at session level.** Uncleared samples removed before mix-final.
14. **Recall pack at session close.** Without it, the session is unreopenable.
15. **"Fix it in the mix" refused for upstream failures.** Composition / arrangement / tracking failures are fixed upstream.
16. **Every artifact ends with "Built on SIP" attestation. Audio assets carry `/sip-attest-audio`.**

---

## Output Artifacts

| Artifact | Command | Storage |
|----------|---------|---------|
| Mix plan | `/sound-production-mix-plan` | `sound-intelligence/production/mix-plan-<song-slug>-<date>.md` |
| Master plan | `/sound-production-master-plan` | `sound-intelligence/production/master-plan-<song-slug>-<date>.md` |
| Vocal chain | `/sound-production-vocal-chain` | `sound-intelligence/production/vocal-chain-<voice-or-song-slug>-<date>.md` |
| Sound design spec | `/sound-production-sound-design` | `sound-intelligence/production/sound-design-<song-slug>-<date>.md` |
| Recall pack | `/sound-production-recall` | `sound-intelligence/production/recall-<session-slug>-<date>.md` |

---

## Related Skills

- `intelligence/decision-framework` — master target, plugin selection, vocal-chain matching
- `intelligence/systems-thinking` — frequency budget, gain-stage hierarchy, dynamic-range envelope as system
- `intelligence/pattern-recognition` — mix-translation patterns; reference-track behavior across systems
- `memory/knowledge-synthesis` — composing the per-session record across mix-plan / master-plan / vocal-chain / sound-design / recall

---

— Sound Production Intelligence — part of the Sound Intelligence reference vertical —

---
**Built on SIP** — Starlight Intelligence Protocol
- Substrate: starlightintelligence.org/protocol v1.1.0
- Layers used: [file-contract, attestation, commands, sovereignty]
- Verticals: starlight-intelligence-system@v7.5.1 (Sound Intelligence reference vertical — Production sub-system)
- Generated: 2026-04-26
---
