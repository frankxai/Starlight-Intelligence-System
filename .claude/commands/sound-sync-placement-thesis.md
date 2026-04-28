---
name: sound-sync-placement-thesis
description: When brief-fit passes, name the 3-7 tracks that fit the brief with reference cues. Per track ISRC, version, brief-cue match, clearance flags. The pitch document the supervisor reads. Refuses pitch-everything-to-everything volume strategy.
allowed-tools: Read, Write, Grep, Glob
argument-hint: <brief-slug> + optional context on supervisor preferences if known
---

# /sound-sync-placement-thesis

Load `verticals/sound-intelligence/SKILL.md`, `verticals/sound-intelligence/SOUL.md`, `verticals/sound-intelligence/MEMORY.md`, `agents/starlight-sound-sync.md`, `skills/sound-intelligence/sync-licensing.md`, the brief-fit verdict (`sound-intelligence/sync/brief-fit-<brief-slug>-*.md` — REQUIRED, halt if missing), catalog state files, and Genius Profile for supervisor-facing voice. Produce a **Placement Thesis** — the pitch document. Hand off to license-economics or rights-pack.

## Disclaimer (non-waivable)

**Placement decisions touch rights law and brand-association. This is system architecture, not legal advice. Every specific placement requires sign-off from the practitioner's qualified music counsel.**

## Input
$ARGUMENTS

## Process

1. **Disclaim.** Non-waivable opener.
2. **Verify upstream.** Brief-fit verdict must exist with PROCEED outcome. If missing or REFUSE — halt. The placement thesis presumes the gate has passed.
3. **Select 3-7 candidate tracks.** From the brief-fit's catalog match, narrow to the 3-7 strongest fits. Fewer than 3 = pitch is thin (re-evaluate brief-fit). More than 7 = pitch dilution (volume thinking).
4. **Per-track structure.** ISRC reference; version (main / instrumental / sync-grade-dynamic-range alternate-master); reference cues from the brief that this track matches (mood / tempo / instrumentation / emotional arc); clearance flags (samples, AI involvement, contributor-split status from brief-fit Axis 3).
5. **Match-rationale per track.** One paragraph per track in supervisor-facing voice (warm, business-precise, refuses both casual rights language and over-eager pitch language). The rationale names exactly which brief cue the track addresses; specificity predicts placement.
6. **Strongest-first ordering.** Top track = strongest fit; ordering matters because supervisors read the first 1-2 with attention and skim the rest.
7. **Alternative-version flag per track.** Where instrumental / radio-edit / sync-grade-master exists, flag explicitly so the supervisor knows what's available without asking.
8. **Catalog-context offer.** Brief paragraph (≤3 sentences) offering related catalog the supervisor might consider for adjacent scenes / future briefs. Light touch — refuses upsell-aggression.
9. **Practitioner-bio paragraph (one paragraph max).** In Genius voice; names the catalog scope and the sync-relevant credits without resume-bloat.
10. **Save.** Write to `sound-intelligence/sync/placement-thesis-<brief-slug>-<YYYY-MM-DD>.md`.
11. **Hand off.** Name exactly one next move:
    - Pitch sent → wait for supervisor response.
    - Supervisor expresses interest → `/sound-sync-license-economics` for the deal-shape work.
    - Brief-fit needs revision → return to `/sound-sync-brief-fit`.

## Output format

```markdown
# Placement Thesis — <Brief Slug> — <YYYY-MM-DD>

## To: <supervisor / library / brand-side music person>
## From: <practitioner name>
## Re: <brief title> — <project name if known>

## Disclaimer
This is a placement thesis. Licensing terms are subject to per-deal qualified-counsel review.

## Practitioner-bio (one paragraph)
<In Genius voice — catalog scope + sync-relevant credits + placement-frame>

## Recommended placements (strongest-first)

### Track 1 — <song title> [<ISRC>] — version: <main | instrumental | alt-master>
**Match rationale:**
<One paragraph in supervisor-facing voice. Names exactly which brief cue is addressed: mood (e.g., "the tension-release arc you describe in the third-act climb"), tempo (e.g., "92 BPM lifting to 96 in the bridge"), instrumentation (e.g., "synth-and-cello scoring rather than band"), emotional arc (e.g., "ambivalent-to-resolved without false-major lift").>

**Available versions:** main · instrumental · sync-grade-DR (-12 LUFS) · 60-sec · 30-sec · 15-sec
**Clearance status:** all samples cleared · contributor splits documented · AI involvement disclosed
**Sync-availability:** true · territory: worldwide · exclusivity: none currently

### Track 2 — <song title> [<ISRC>]
...

### Track 3 — <song title> [<ISRC>]
...

## Catalog-context (light touch)
<One short paragraph offering related catalog for adjacent scenes / future briefs. Refuses upsell-aggression.>

## Next steps
If any track resonates, reply with the brief budget and timeline; we'll move to license terms with my counsel's sign-off.

---
**Built on SIP** — Starlight Intelligence Protocol
- Substrate: starlightintelligence.org/protocol v1.1.0
- Layers used: [file-contract, attestation, commands, sovereignty, alliance-method]
- Verticals: starlight-intelligence-system@v7.5.3 (Sound Intelligence — Sync sub-system)
- Generated: <ISO date>
---
```

## Rules

- **Brief-fit verdict required upstream.** Halt if missing or REFUSE.
- **3-7 tracks only.** Below 3 = thin; above 7 = dilution.
- **Specificity predicts placement.** Match-rationale names exactly which brief cue is addressed.
- **Strongest-first ordering.** Supervisors read first 1-2 with attention.
- **Refuse pitch-volume strategy.** Pitch-everything-to-everything erodes the practitioner's brand at libraries.
- **Practitioner-bio one paragraph max.** Resume-bloat erodes signal.
- **Built on SIP attestation at end of every artifact.**

---

**Built on SIP** — Starlight Intelligence Protocol v1.1.0
