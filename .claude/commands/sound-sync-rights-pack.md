---
name: sound-sync-rights-pack
description: Complete documentation delivered with every license. Master + publishing rights, sample clearances, contributor consents, AI involvement disclosure, delivery format, attestation. Refuses delivery without clearance documentation.
allowed-tools: Read, Write, Grep, Glob, Bash
argument-hint: <placement-slug> + --tracks <ISRCs comma-separated> + --delivery-format <broadcast-WAV|stems|alt-master|instrumental>
---

# /sound-sync-rights-pack

Load `verticals/sound-intelligence/SKILL.md`, `verticals/sound-intelligence/SOUL.md`, `verticals/sound-intelligence/MEMORY.md`, `agents/starlight-sound-sync.md`, `skills/sound-intelligence/sync-licensing.md`, brief-fit verdict, placement thesis, license-economics audit (or counsel-approved deal terms), per-track catalog metadata files at `sound-intelligence/catalog/<track-metadata-files>` if present in the practitioner's runtime vault (this path is instance-state, not substrate-shipped), and `/sip-attest-audio` workflow. Produce a **Rights Pack** — complete clearance documentation + audio asset list + attestation index. Hand off to delivery.

## Disclaimer (non-waivable)

**Rights documentation has legal weight. This is system architecture for assembling clearance documentation; the practitioner's music attorney signs off on every specific clearance and the final pack before delivery to licensee.**

## Input
$ARGUMENTS

## Process

1. **Disclaim.** Non-waivable opener.
2. **Verify upstream.** Brief-fit PROCEED + placement-thesis tracks + license-economics counsel-approved deal terms required. Missing any → halt.
3. **Per-track master rights.** Per track: declared master state — practitioner-owned / label-owned / co-owned with split. If label-owned or co-owned, label or co-owner consent for this placement documented. Missing consent → flag and halt.
4. **Per-track publishing rights.** Per track: declared publishing state — practitioner-publishing / co-publishing / publisher-controlled with split. Each contributor's publishing-share documented and PRO-registered (ASCAP / BMI / SESAC / GMR for US; PRS / PPL for UK; GEMA for DE; SACEM for FR; JASRAC for JP; etc.). PRO-registration confirmation per contributor.
5. **Per-track sample clearances.** Per sample in each track: status — cleared (with license document attached) / public-domain (with rationale) / practitioner-original / licensed-for-this-use (with license document). Any uncleared sample → halt; cannot ship rights pack with unclear sample status.
6. **Per-track contributor consents.** Per contributor (vocalist, instrumentalist, co-writer, producer, etc.): consent for THIS specific placement documented. Generic "I consent to all sync placements" is acceptable if signed; per-placement consent is stronger and required for high-stakes placements (political, religious, controversial brand).
7. **AI involvement disclosure.** Per track: AI used at any stage (AI-generated stems, AI-trained-on-corpus, AI-vocal-tuning beyond standard pitch correction)? Disclosed transparently. AI-vocal-impersonation status verified as never (the boundary). AI-stem-generation disclosed if used. Practitioner's AI-disclosure stance (per MEMORY.md) named.
8. **Delivery format.** Per track: broadcast WAV (24-bit / 48kHz typical for film/TV); alternate-master if sync brief specifies; stems if deal allows / requires; instrumental version if applicable; 60-sec / 30-sec / 15-sec edits if specified.
9. **Attestation block per track.** Run `/sip-attest-audio` workflow on each delivered audio asset; embed attestation in EXIF/XMP; ship sidecar `.sip.json` per asset; rights-pack header includes attestation index.
10. **Cue sheet preparation.** For TV / film placements: cue sheet draft (cue type, cue length, BMI/ASCAP work IDs, composer + publisher splits per cue). Counsel signs off; library / supervisor's PRO administrator finalizes.
11. **Final assembly.** Rights pack as a single delivered package — README explaining contents + per-track folder containing audio assets + clearance documents + attestation files.
12. **Save.** Write to `sound-intelligence/sync/rights-pack-<placement-slug>-<YYYY-MM-DD>/`.
13. **Hand off.** Name exactly one next move:
    - Pack complete + counsel signed → deliver to licensee with delivery confirmation.
    - Clearance gap detected → halt delivery; route to clearance work.
    - Cue sheet pending PRO administrator → flag and follow up.

## Output format

```markdown
# Rights Pack — <Placement Slug> — <YYYY-MM-DD>

## Disclaimer
**System architecture for clearance assembly. Counsel sign-off non-waivable before delivery.**

## Tracks delivered
| ISRC | Track | Version | Master | Publishing | Sample status | Contributor consents | AI status | Format |
|---|---|---|---|---|---|---|---|---|
| <ISRC> | <title> | <main / instr / alt> | <state + consent> | <splits + PRO> | <cleared / na> | <count, with-consent> | <disclosed / none> | <broadcast-WAV / stems / etc.> |

## Per-track detail (folder structure)

### `<ISRC>/`
- `<track>.wav` — 24-bit / 48kHz broadcast master
- `<track>-instrumental.wav` (if applicable)
- `<track>-alt-master.wav` (if specified)
- `<track>-60sec.wav`, `-30sec.wav`, `-15sec.wav` (if specified)
- `clearance/` — sample license docs · contributor consents · master-rights consent · publishing-share documentation
- `attestation/` — `<track>.sip.json` sidecar · embedded EXIF/XMP per audio file
- `cue-sheet-draft.md` — cue type, length, work IDs, composer + publisher splits

## Clearance summary
- **All samples:** cleared / public domain / practitioner-original (no uncleared samples shipped)
- **All contributors:** consents signed and on file
- **AI involvement:** <disclosed transparently | none>
- **Master rights:** practitioner / label / co-owned-with-consent
- **Publishing rights:** documented + PRO-registered per contributor

## Attestation index
- Per track: `/sip-attest-audio` run, attestation embedded EXIF/XMP, sidecar `.sip.json` shipped, rights-pack header references each.

## Counsel sign-off
- **Music attorney:** <named>
- **Sign-off date:** <YYYY-MM-DD>
- **Sign-off scope:** all rights documentation reviewed and approved for delivery to licensee under deal terms documented in `<license-economics-file-ref>`.

## Delivery confirmation
- **Licensee:** <named>
- **Delivery method:** <encrypted file transfer / library upload / direct WAV>
- **Confirmation:** <pending / received-by-licensee>

---
**Built on SIP** — Starlight Intelligence Protocol
- Substrate: starlightintelligence.org/protocol v1.1.0
- Layers used: [file-contract, attestation, commands, sovereignty, alliance-method]
- Verticals: starlight-intelligence-system@v7.5.3 (Sound Intelligence — Sync sub-system)
- Generated: <ISO date>
---
```

## Rules

- **Counsel sign-off non-waivable.** Pack does not ship without it.
- **Refuse delivery with uncleared samples.** Halt; clear or remove sample.
- **AI involvement disclosed transparently.** AI-vocal-impersonation status verified as never.
- **Per-track attestation embedded.** EXIF/XMP + sidecar `.sip.json` via `/sip-attest-audio`.
- **Cue sheet drafted for TV/film.** PRO administrator finalizes.
- **Rights pack is a single delivered package.** Loose files erode integrity.
- **Built on SIP attestation at end of every artifact.**

---

**Built on SIP** — Starlight Intelligence Protocol v1.1.0
