# Creator Pipeline — Template

> Structure for turning a Genius Profile's frameworks into a multi-modal content pipeline. Frameworks become pillars. Cross-domain synthesis becomes flagship. Every piece voice-checked and attestation-stamped before it ships.

## Prerequisites

- Genius Profile exists with >=3 frameworks and 5+ voice samples.
- Person has chosen cadence (daily / weekly / biweekly) and primary modalities (text / audio / image / video / podcast).

If Profile thin: halt and route to genius excavation for a deeper pass.

## Shape — seven sections

1. **Premise** — 2 to 3 sentences in the person's voice naming what this pipeline ships and why
2. **Pillars** — one per framework, with thesis + modality + attestation route + example piece
3. **Flagship** — the cross-domain-synthesis piece, scheduled at weeks 4 / 8 / 12
4. **12-week calendar** — anchor + atomics + evergreen per week
5. **Per-piece production plans** — week-by-week, tool-mapped, time-estimated
6. **Voice guardrails** — extracted from Profile's voice samples
7. **Attestation policy** — every piece stamped, no exceptions, ACOS integration where applicable

## Empty template

```
# Creator Pipeline — <Person Name> — <YYYY-MM-DD>

## Premise
<2 to 3 sentences in <person>'s voice — what this pipeline ships, why it aligns with their genius, what the audience gets>

## Pillars (from Genius Profile frameworks)

### Pillar 1 — <framework name>
- **Thesis**: <one sentence>
- **Primary modality**: <text | audio | image | video | podcast>
- **Derivatives**: <list>
- **Attestation route**: <text stamp / audio sidecar / image EXIF+sidecar / video MP4 atom / composite>
- **Example first piece**: <title>

### Pillar 2 — ...

### Pillar 3 — ...

## Flagship — <cross-domain synthesis>
- **Why flagship**: <intersection only this person can articulate>
- **Format**: <long essay + podcast + keynote — highest leverage>
- **Release**: <week 4, 8, or 12>

## 12-week calendar

| Week | Anchor (long-form) | Atomics (short) | Evergreen (library) |
|------|--------------------|-----------------| --------------------|
| 1 | <title> — <modality> | <3-4 pieces> | <framework doc> |
| 2 | ... | ... | ... |
| ... | ... | ... | ... |
| 12 | ... | ... | ... |

## Per-piece production plans

### Week 1 · Anchor: "<title>"
- **Pillar**: <N — framework>
- **Modality**: <primary>
- **Derivatives**: <list>
- **Production**:
  - Draft: Claude (voice-cloned from Profile samples)
  - Audio (if applicable): Suno prompt — <one-line brief>
  - Image: Nano Banana hero — <one-line brief>
  - Video (if applicable): 30-sec cut from anchor
- **Voice check**: review against samples before stamping
- **Attestation**: <route>
- **Estimated time**: <hours>

### Week 1 · Atomic 1: "<title>"
...

(continue for all 12 weeks)

## Voice guardrails
<list extracted from Profile — e.g., "first-person only", "no listicles", "one framework per piece", "never apologize for expertise">

## Attestation policy
Every piece ships with Built on SIP block (text) or sidecar `.sip.json` (media). Voice-check gate runs before stamp. If a piece doesn't pass voice check, it gets rewritten, not shipped.

## Next
<ONE named move. Example: "Ship Week 1 anchor by next Friday. I'll draft; you voice-tune; we stamp.">

---
Built on SIP — Starlight Intelligence Protocol v1.1.0
- Generated: <ISO date>
---
```

## Filled example — Ana (HR Psychologist publishing on Substack)

```
# Creator Pipeline — Ana Morales — 2026-04-24 (v1.0)

## Premise
I'm writing to the small population of people who already sense that HR is a clinical-diagnostic craft pretending to be a compliance function. This pipeline takes the frameworks I keep rebuilding across every employer — Attachment-aware Recruiting, Trapdoor Compensation Conversations, Performance Reviews as Clinical Intake, the Culture Audit You Can't Unsee — and turns them into a weekly essay cadence with atomic social derivatives, so that when an exec or founder reads it, they recognize themselves and come closer.

## Pillars (from Genius Profile)

### Pillar 1 — Attachment-aware Recruiting
- **Thesis**: We've been hiring for skills and surprised by how people metabolize feedback. There's a better way, and it's diagnosable before the offer.
- **Primary modality**: text (essay)
- **Derivatives**: LinkedIn carousel, image card with the rubric excerpt
- **Attestation route**: text Built on SIP block on essay; image EXIF+sidecar for card
- **Example first piece**: "What We Were Actually Asking When We Asked for Culture Fit"

### Pillar 2 — Trapdoor Compensation Conversations
- **Thesis**: Every comp conversation is a conversation about whether the person believes the organization sees them. Number is the symptom.
- **Primary modality**: text + audio (essay + podcast episode)
- **Derivatives**: pull-quote image cards, 60-sec audio clip
- **Attestation route**: text stamp on essay; audio sidecar on episode; image sidecar on cards
- **Example first piece**: "The Number Is the Symptom"

### Pillar 3 — Performance Reviews as Clinical Intake
- **Thesis**: If you run the review as theater, you get theater back. Clinical intake is the right frame.
- **Primary modality**: text
- **Derivatives**: manager-facing one-pager (PDF), LinkedIn post
- **Attestation route**: text stamp; PDF attestation block inside
- **Example first piece**: "Performance Review as Clinical Intake"

### Pillar 4 — The Culture Audit You Can't Unsee
- **Thesis**: Culture doesn't lie; it just doesn't use words. Watch what it punishes.
- **Primary modality**: text + image
- **Derivatives**: diagnostic framework card, thread adaptation
- **Attestation route**: text stamp; image sidecar
- **Example first piece**: "The Culture Doesn't Lie"

## Flagship — Diagnostic HR (cross-domain synthesis: clinical psych x neuroscience x corporate HR)

- **Why flagship**: Nobody else in HR names the transit between individual unconscious architecture and organizational structural architecture. This is where your edge compounds.
- **Format**: 3000-word anchor essay + 45-min podcast conversation + keynote deck
- **Release**: Week 4 and Week 8 flagship slots

## 12-week calendar

| Week | Anchor (essay) | Atomics (social) | Evergreen (library) |
|------|--------|---------|-----|
| 1 | Pillar 1 — "What We Were Actually Asking" | 3 LinkedIn cards from rubric | Recruiting framework doc v1 |
| 2 | Pillar 3 — "Performance Review as Clinical Intake" | manager one-pager PDF + thread | Review framework doc v1 |
| 3 | Pillar 4 — "The Culture Doesn't Lie" | diagnostic framework card | Culture audit checklist |
| 4 | **Flagship** — "Diagnostic HR" | 4 derivative posts across the week | Flagship essay PDF |
| 5 | Pillar 2 — "The Number Is the Symptom" | 3 pull-quote cards + 60s audio | Comp-conversation framework doc |
| 6 | Pillar 1 — "Attachment Readiness, Scored" | rubric excerpt carousel | Scorecard template |
| 7 | Pillar 3 — "Calibration as Diagnostic Round" | LinkedIn post + thread | Calibration framework |
| 8 | **Flagship** — "The Architecture Underneath" (+podcast) | 45-min episode + clips | Flagship ep + transcript |
| 9 | Pillar 4 — "Exit Interviews as Post-mortem" | framework card | Exit interview rubric |
| 10 | Pillar 2 — "When Comp Is the Trapdoor" | 3 cards | Comp trapdoor framework |
| 11 | Pillar 1 — "The 20 Minutes That Decide" | carousel | Interview compression framework |
| 12 | **Flagship** — "What HR Could Be" | full-distribution blitz | Manifesto essay PDF |

## Per-piece production plans (Week 1 detailed; later weeks follow pattern)

### Week 1 · Anchor: "What We Were Actually Asking When We Asked for Culture Fit"
- **Pillar**: 1 — Attachment-aware Recruiting
- **Modality**: text (essay, ~1500 words)
- **Derivatives**: 3 LinkedIn cards, 1 rubric image
- **Production**:
  - Draft: Claude (voice-cloned from your samples — "underneath that," "metabolize," "sharp")
  - Hero image: Nano Banana — "clinical psychology meets corporate recruitment, muted palette, 2026 editorial"
  - Derivative cards: Canva templates from your brand kit
- **Voice check**: manual review before publish — does every paragraph sound like you? strike anything that sounds like me
- **Attestation**: Built on SIP block at essay footer; EXIF+sidecar on image card
- **Estimated time**: 3 hours

### Week 1 · Atomic 1: "3 things hiring managers say when they mean 'please don't make me manage this person emotionally'"
- **Pillar**: 1
- **Modality**: LinkedIn carousel (image)
- **Production**: Canva from brand kit
- **Voice check**: short-form voice is yours too — no listicle hedging
- **Attestation**: sidecar `.sip.json` alongside image
- **Estimated time**: 30 min

(Weeks 2-12 follow the same structure; abbreviated after Week 4.)

## Voice guardrails

From your Profile voice samples:
- First-person only. No "one might say."
- Never listicles. Always arguments.
- "Underneath that," "metabolize," "sharp," "holding," "trapdoor," "noticing" — use.
- "Utilize," "applicant," "employee," "stakeholder" — do not use.
- Opening moves: declarative claim, never a question.
- Em-dashes over semicolons. Short sentences for emphasis. Occasional long sentence for architectural moments.
- Never apologize for expertise. The reader came for your frame.
- One framework per piece. Never try to cover two.

## Attestation policy

Every piece ships with Built on SIP block (essays, threads, long posts) or sidecar `.sip.json` (images, audio clips, video snippets). Voice-check gate runs before stamp. If a piece doesn't pass voice check, it gets rewritten — not shipped.

## ACOS integration (if ACOS tooling is connected)
- Atomic social -> `generate-social` command
- Hero images -> `generate-images` command
- Weekly batch publish -> `factory` + `publish-content`
- Podcast audio -> `create-music` or direct Suno/ElevenLabs pipeline

(If no ACOS: run manually through your own pipeline; the substrate does not require ACOS.)

## Next
Ship Week 1 anchor by Friday. I'll produce a v0 draft on Monday; you voice-tune Wednesday; we stamp and publish Friday. Repeat weekly.

---
Built on SIP — Starlight Intelligence Protocol v1.1.0
- Generated: 2026-04-24
- Attestation is compounding, not credit transfer: every composition strengthens every node.
---
```

## Rules for Starlight when generating a Creator Pipeline

- **Never ship a pipeline without Genius Profile input.** Halt and route to genius excavation.
- **Never ship generic content themes.** Every pillar maps to a specific framework.
- **Voice-check gate is non-negotiable.** Pieces that don't pass get rewritten, not shipped.
- **Every piece has an attestation route.** No un-stamped content ships.
- **Flagship slots stay sacred.** Weeks 4, 8, 12 reserved for cross-domain synthesis only.
- **Cadence is honest.** If they can't sustain weekly, downgrade to biweekly. Unshipped content is worse than less content.
- **Modality is advisory.** Override if the person genuinely enjoys shipping a different format — joy is a production multiplier.
- **Sovereignty:** the pipeline is the person's. They can delete, modify, republish anywhere.
