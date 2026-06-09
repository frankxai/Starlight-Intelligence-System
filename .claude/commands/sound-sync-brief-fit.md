---
name: sound-sync-brief-fit
description: Brief-fit gate before any sync pitch. Four-axis check (catalog match + master availability + rights structure + vision-boundary respect). Vision-boundary refusal is non-waivable. Refuses "make exception this once" framing.
allowed-tools: Read, Write, Grep, Glob
argument-hint: <brief-slug> + --source <library|direct-supervisor|brand|agency> + optional context paragraph from the actual brief
---

# /sound-sync-brief-fit

Load `verticals/sound-intelligence/SKILL.md`, `verticals/sound-intelligence/SOUL.md`, `verticals/sound-intelligence/MEMORY.md`, `agents/starlight-sound-sync.md`, `skills/sound-intelligence/sync-licensing.md`, the catalog state files at `sound-intelligence/catalog/<release-state-files>` if present in the practitioner's runtime vault (this path is instance-state, not substrate-shipped), and active vision boundaries from MEMORY.md. Produce a **Brief-Fit Verdict** — pass to placement thesis OR refuse with documented rationale. Hand off to exactly one next command.

## Disclaimer (non-waivable)

**Sync placement decisions touch rights law, contributor splits, sample clearances, AI involvement disclosure, and brand-association liability. This is system architecture, not legal advice. Every specific placement requires sign-off from the practitioner's qualified music counsel. Vision-boundary refusal is non-waivable; the boundary either holds or gets revised at MEMORY.md level deliberately, never "this once" under deal pressure.**

## Input
$ARGUMENTS

## Process

1. **Disclaim.** Non-waivable opener.
2. **Read brief.** Brief content, source (library / direct-supervisor / brand / agency), budget range if disclosed, timeline, content context (film / TV / commercial / trailer / branded content / political / video game / etc.), exclusivity request.
3. **Axis 1 — Catalog match.** Does the practitioner have tracks that fit the brief? Search catalog by mood / tempo / instrumentation / lyric-or-instrumental / emotional arc against brief requirements. Three or more matching candidates → pass. Two matches → conditional pass (named gap). Zero or one match → refuse-on-catalog OR route to Composition for purpose-built work (rare; only when budget justifies).
4. **Axis 2 — Master availability.** For each candidate track: does the master state allow placement? Rights structure permits sync (no exclusivity-elsewhere conflict)? Sync-availability flag true in metadata? Alternate-master available if brief specifies (sync-grade-dynamic-range master vs. streaming master)?
5. **Axis 3 — Rights structure.** Per candidate: splits documented; sample clearances complete; AI involvement disclosed (per `/sip-attest-audio` doctrine); contributor consents on file. Any incomplete clearance → flag and refuse on this axis until resolved.
6. **Axis 4 — Vision-boundary respect.** Pull active vision boundaries from MEMORY.md. Common: refuses-political-campaign-sync, refuses-violence-soundtrack, refuses-extractive-fossil-fuel-brand, refuses-AI-vocal-impersonation-license-out, refuses-children's-content-without-curated-fit. Per-practitioner the list varies. Compare brief to each active boundary. Any contradiction → **non-waivable refuse**. The deal pressure does not override; if the boundary is to be revised, that revision happens at MEMORY.md, deliberately, not "this once."
7. **Verdict synthesis.**
   - All four axes pass → PROCEED to `/sound-sync-placement-thesis`.
   - Catalog or master axis fails → REFUSE-ON-AXIS, document, no further sync work for this brief.
   - Rights-structure axis fails → REFUSE-PENDING-CLEARANCE, document gaps, route to clearance work before re-running.
   - Vision-boundary axis fails → REFUSE-ON-BOUNDARY, document, communicate the refusal honestly to brief source if relationship warrants.
8. **Document refusal.** Refusals are first-class artifacts. The refusal-on-boundary letter (when relationship warrants) is in practitioner's voice via Genius — direct, warm, non-apologetic, non-compromising.
9. **Save.** Write to `sound-intelligence/sync/brief-fit-<brief-slug>-<YYYY-MM-DD>.md`.
10. **Hand off.** Name exactly one next move:
    - PROCEED → `/sound-sync-placement-thesis`.
    - REFUSE-ON-CLEARANCE → clearance work (sample clearance, contributor-split documentation, AI disclosure).
    - REFUSE-ON-BOUNDARY → refusal letter (if relationship warrants); MEMORY.md boundary update if practitioner wants to deliberately revise (rare).

## Output format

```markdown
# Brief-Fit Verdict — <Brief Slug> — <YYYY-MM-DD>

## Disclaimer
**System architecture, not legal advice. Vision-boundary refusal non-waivable.**

## Brief context
- **Source:** <library | direct-supervisor | brand | agency>
- **Budget range:** <disclosed range or unknown>
- **Timeline:** <named>
- **Content context:** <film | TV | commercial | trailer | branded content | political | video game | other>
- **Exclusivity request:** <none | category | period | full>

## Axis 1 — Catalog match
- **Candidates identified:** <N>
- **Verdict:** <pass | conditional | fail>
- **Rationale:** <named matches by mood/tempo/instrumentation/emotional arc>

## Axis 2 — Master availability
- Per candidate: rights-structure permits, sync-availability flag, alternate-master available.
- **Verdict:** <pass | fail>

## Axis 3 — Rights structure
- Splits documented · sample clearances · AI disclosure · contributor consents — per candidate.
- **Verdict:** <pass | fail-pending-clearance>
- **Gaps:** <list or none>

## Axis 4 — Vision-boundary respect
- Active boundaries from MEMORY.md: <list>
- Brief vs. boundary: <pass | contradicts-boundary-X>
- **Verdict:** <pass | refuse-on-boundary (NON-WAIVABLE)>

## Final verdict
**`<PROCEED | REFUSE-ON-AXIS-N | REFUSE-PENDING-CLEARANCE | REFUSE-ON-BOUNDARY>`**

## Refusal letter (if applicable, in practitioner's voice via Genius)
> <text or "not applicable">

## Recommended next move
**`/<command or specific action>`** — <one-line rationale>.

---
**Built on SIP** — Starlight Intelligence Protocol
- Substrate: starlightintelligence.org/protocol v1.1.0
- Layers used: [file-contract, attestation, commands, sovereignty, alliance-method]
- Verticals: starlight-intelligence-system@v7.5.3 (Sound Intelligence — Sync sub-system)
- Generated: <ISO date>
---
```

## Rules

- **Vision-boundary refusal is non-waivable.** "Make exception this once" is the corrosion mode. Either the boundary holds or it gets revised at MEMORY.md deliberately, not under deal pressure.
- **Four axes always.** Skipping the catalog or rights axes turns brief-fit into pitch-everything-and-hope. Refuse the shortcut.
- **Refusals are first-class artifacts.** Document with same rigor as placements.
- **Refusal letters in practitioner's voice.** Direct, warm, non-apologetic, non-compromising. Generic refusal templates are refused.
- **Pre-pitch gate, never post-pitch rationalization.** Brief-fit runs before pitch-writing.
- **Built on SIP attestation at end of every artifact.**

---

**Built on SIP** — Starlight Intelligence Protocol v1.1.0
