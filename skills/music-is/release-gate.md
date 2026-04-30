---
name: music-is/release-gate
description: A&R green-light gate. Non-waivable. Triggers on /music-release. Apex tier (Opus 4.7) for the gate decision; orchestrates Sonnet downstream for distribution + amplification + royalty graph if pass.
---

# Release Gate (`music-curator` agent)

> The non-waivable gate. No green-light, no streaming, no socials, no NFT, no Bandcamp. Songs without gate-passage stay in `catalog/draft/` indefinitely. The gate refuses theater; it does not optimize for cycle time.

## When this skill fires

- `/music-release <song-id>` — primary trigger
- `/music-release <song-id> --override` (Frank-only; documented canon-justification required)

## Gate decision space

`GREEN-LIGHT` / `REVISE` / `REFUSE`

- **GREEN-LIGHT** — passes all gate checks; routes to distro + amplify + royalty-graph + archive transition
- **REVISE** — fails one or more gate checks; specific revisions named; song stays in draft
- **REFUSE** — fails fundamental check (canon-anchoring, AI-disclosure, vocal-impersonation); song stays in draft with REFUSED-final flag (Frank can override only with documented canon-justification at `catalog/overrides/<song-id>.md`)

## Gate checks (all must pass)

### 1. Persona-anchoring proof

The song belongs to one persona. The persona belongs to one label. The song's sound DNA + intent matches persona canon. **Refuses orphan tracks.**

### 2. Asset bundle complete

Per `asset-render` spec:
- Cover master + 1:1 + 16:9 + 9:16 variants
- Motion-short (9:16, 15-30s)
- Motion-square (1:1, 30-60s)
- Spotify Canvas (9:16, 3-8s loop)
- (Cinematic-grade labels: full motion video 16:9)

**Refuses incomplete bundles.**

### 3. Voice-lock check on social copy

Music-amplifier generates social copy stubs in advance. Each stub passes voice-check against `social/voice-lock-{platform}.md` for the persona. **Refuses generic-marketing-copy leakage.**

### 4. Royalty-cascade graph entry

`royalty-architect` (Sonnet) drafts the `catalog/royalty-graph.json` entry for this release. Required fields: contributors, splits, rails, parent canon, attestation hash.

**Refuses release without graph entry stub.**

### 5. Cross-label canon-blur check

Track must clearly fit ONE label. If "could fit Frank Riemer or Frank's Vibes," gate refuses with REVISE — assign or revise sound to land it.

### 6. AI-disclosure metadata

Metadata for DistroKid + Bandcamp + frankx.ai must include AI-generated disclosure per platform policy.

**Refuses any release missing AI-disclosure.**

### 7. Vocal-impersonation check

If song has vocal track:
- Source disclosed (Suno / Frank-cloned / external-cloned)
- If external-cloned: written consent on file (path referenced in catalog row)
- **Refuses vocal-impersonation without consent on file.**

### 8. Sample / sync-clearance check

If song uses any sample (rare for Suno generations but possible for hybrid productions):
- Sample tagged in metadata with status (cleared / public domain / practitioner-original / refused-uncleared)
- **Refuses uncleared samples.**

### 9. Frank-in-the-loop A&R check (final)

After 1-8 pass mechanically, music-curator (Opus) presents the song + bundle to Frank for final A&R sign-off:
- Listen-confirm: does it sound like persona/label canon?
- Cover-confirm: does it look like persona/label visual DNA?
- Intent-confirm: does this release serve the persona's monetization stack at this moment?

**Frank green-lights or REVISE/REFUSE with reason.**

## Pass routing (parallel dispatch)

On GREEN-LIGHT, music-curator dispatches in parallel:

```
Parallel:
  ├─ music-distributor (Sonnet) → DistroKid push + Spotify Canvas + frankx.ai/music + Bandcamp (per label)
  ├─ music-amplifier (Sonnet) → schedule N social drops via Claws + Blotato + n8n
  ├─ royalty-architect (Sonnet) → finalize catalog/royalty-graph.json entry
  ├─ music-archivist (Haiku) → transition catalog row draft → released; populate ISRC after DistroKid mint
  └─ Frank notification: "Released. Distro pushed. Amplification scheduled. Royalty graph encoded."
```

## Refuse → REVISE specifics

When refusing, music-curator names the specific gate-check failure + the specific revision required. Examples:
- "REVISE: persona canon-anchoring weak — sound DNA suggests Frank's Vibes but track is in catalog under Frank Riemer. Re-assign or revise sound."
- "REVISE: cover violates persona visual DNA (palette saturation above 30% for Frank Riemer). Re-render with palette anchored."
- "REVISE: voice-lock failed Claw-IG copy — generic 'release out now' phrasing. Re-generate against `social/voice-lock-ig.md`."
- "REFUSE: AI-vocal-cloned voice without consent on file. Will not green-light without written consent in `private/consents/<voice-id>.pdf`."

## Override discipline

Frank can override REFUSE → GREEN-LIGHT **only**:
1. Reason written to `catalog/overrides/<song-id>.md`
2. Override is referenced in next cycle drift-test (per SOUL.md tests)
3. Override count tracked; if overrides exceed 1/quarter, audit gate function

Override of REVISE is not allowed — must address the named revision.

## Composes with

- `music-is/persona-canon` (canon-anchoring proof)
- `music-is/asset-render` (bundle completeness)
- `music-is/voice-lock` (Claw copy check)
- `music-is/royalty-graph` (graph entry stub)
- `music-curator` agent (Opus instance running this skill)

## Output

- GREEN-LIGHT → routing manifest + estimated time-to-live across rails
- REVISE → specific revisions list + which gate check + how to address
- REFUSE → fundamental refusal + override path documented

---

**Built on SIP** — `skills/music-is/release-gate.md` · v0.1 · Apex tier (Opus 4.7) · Non-waivable structural gate · Override discipline tracked.
