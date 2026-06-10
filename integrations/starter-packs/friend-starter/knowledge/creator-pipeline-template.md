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

## Filled example — Maya (product-ops consultant publishing a newsletter; fictional composite — any resemblance to real persons is coincidental)

```
# Creator Pipeline — Maya Lindqvist — 2026-04-24 (v1.0)

## Premise
I'm writing to the small population of people who already sense that product operations is a behavioral-design craft pretending to be a coordination function. This pipeline takes the frameworks I keep rebuilding at every company — the Decision Debt Ledger, the Invisible Handoff Map, Friction-Budget Reviews, the Launch-Readiness Ladder — and turns them into a weekly essay cadence with atomic social derivatives, so that when a founder or product lead reads it, they recognize their own launch and come closer.

## Pillars (from Genius Profile)

### Pillar 1 — The Decision Debt Ledger
- **Thesis**: We've been tracking task debt and surprised by launches that die of decisions nobody made. Deferred decisions accrue interest, and the ledger makes the balance visible.
- **Primary modality**: text (essay)
- **Derivatives**: LinkedIn carousel, image card with the ledger excerpt
- **Attestation route**: text Built on SIP block on essay; image EXIF+sidecar for card
- **Example first piece**: "What We Were Actually Deferring When We Said 'Let's Park That'"

### Pillar 2 — Friction-Budget Reviews
- **Thesis**: Every feature spends from a finite user-friction budget. The roadmap fight is the symptom; the unpriced spend is the disease.
- **Primary modality**: text + audio (essay + podcast episode)
- **Derivatives**: pull-quote image cards, 60-sec audio clip
- **Attestation route**: text stamp on essay; audio sidecar on episode; image sidecar on cards
- **Example first piece**: "The Feature List Is the Symptom"

### Pillar 3 — The Launch-Readiness Ladder
- **Thesis**: If you run the gate review as a celebration, you get optimism back. Evidence audit is the right frame.
- **Primary modality**: text
- **Derivatives**: team-facing one-pager (PDF), LinkedIn post
- **Attestation route**: text stamp; PDF attestation block inside
- **Example first piece**: "Launch Review as Evidence Audit"

### Pillar 4 — The Invisible Handoff Map
- **Thesis**: The handoff doesn't lie; it just doesn't use words. Watch what gets dropped between design and the factory.
- **Primary modality**: text + image
- **Derivatives**: diagnostic framework card, thread adaptation
- **Attestation route**: text stamp; image sidecar
- **Example first piece**: "The Handoff Doesn't Lie"

## Flagship — Behavioral Product Operations (cross-domain synthesis: industrial design x behavioral economics x product ops)

- **Why flagship**: Nobody else in product operations names the transit between the physical object and the organizational choice architecture that produced it. This is where your edge compounds.
- **Format**: 3000-word anchor essay + 45-min podcast conversation + keynote deck
- **Release**: Week 4 and Week 8 flagship slots

## 12-week calendar

| Week | Anchor (essay) | Atomics (social) | Evergreen (library) |
|------|--------|---------|-----|
| 1 | Pillar 1 — "What We Were Actually Deferring" | 3 LinkedIn cards from ledger | Decision Debt framework doc v1 |
| 2 | Pillar 3 — "Launch Review as Evidence Audit" | team one-pager PDF + thread | Gate framework doc v1 |
| 3 | Pillar 4 — "The Handoff Doesn't Lie" | diagnostic framework card | Handoff audit checklist |
| 4 | **Flagship** — "Behavioral Product Operations" | 4 derivative posts across the week | Flagship essay PDF |
| 5 | Pillar 2 — "The Feature List Is the Symptom" | 3 pull-quote cards + 60s audio | Friction-budget framework doc |
| 6 | Pillar 1 — "Decision Debt, Scored" | ledger excerpt carousel | Ledger template |
| 7 | Pillar 3 — "The Gate as Evidence Round" | LinkedIn post + thread | Gate-scoring framework |
| 8 | **Flagship** — "The Architecture Underneath the Object" (+podcast) | 45-min episode + clips | Flagship ep + transcript |
| 9 | Pillar 4 — "Prototype Autopsies as Post-mortem" | framework card | Autopsy rubric |
| 10 | Pillar 2 — "When Friction Is the Budget" | 3 cards | Friction-spend framework |
| 11 | Pillar 1 — "The Decision That Decides the Launch" | carousel | Ledger compression framework |
| 12 | **Flagship** — "What Product Ops Could Be" | full-distribution blitz | Manifesto essay PDF |

## Per-piece production plans (Week 1 detailed; later weeks follow pattern)

### Week 1 · Anchor: "What We Were Actually Deferring When We Said 'Let's Park That'"
- **Pillar**: 1 — The Decision Debt Ledger
- **Modality**: text (essay, ~1500 words)
- **Derivatives**: 3 LinkedIn cards, 1 ledger image
- **Production**:
  - Draft: Claude (voice-cloned from your samples — "downstream of that," "decision debt," "ship-shaped")
  - Hero image: Nano Banana — "industrial design studio meets balance sheet, muted palette, 2026 editorial"
  - Derivative cards: Canva templates from your brand kit
- **Voice check**: manual review before publish — does every paragraph sound like you? strike anything that sounds like me
- **Attestation**: Built on SIP block at essay footer; EXIF+sidecar on image card
- **Estimated time**: 3 hours

### Week 1 · Atomic 1: "3 things product leads say when they mean 'please don't make me decide this today'"
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
- "Downstream of that," "decision debt," "ship-shaped," "friction budget," "load-bearing assumption," "the kill is data" — use.
- "Utilize," "resource," "deliverable," "stakeholder" — do not use.
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
