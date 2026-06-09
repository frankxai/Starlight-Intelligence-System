---
name: sound-audience-fan-stay-interview
description: Design fan stay-interview for the most-engaged cohort. Asks what keeps them, what would make them leave, what they wish more / less of. Anonymous-with-name-attribution-trust trumps anonymous-no-attribution. Refuses engagement-survey-as-fan-research and refuses politeness-drift signal.
allowed-tools: Read, Write, Grep, Glob
argument-hint: <practitioner-slug> + --cohort <patron|engaged-list|bandcamp-loyal> + --cohort-size <N> + optional context on what triggered the interview
---

# /sound-audience-fan-stay-interview

Load `verticals/sound-intelligence/SKILL.md`, `verticals/sound-intelligence/SOUL.md`, `verticals/sound-intelligence/MEMORY.md`, `agents/starlight-sound-audience.md`, `skills/sound-intelligence/audience-architecture.md`, cohort map and prior stay-interview records if present, and Genius Profile. Produce a **Fan Stay-Interview Plan + Question Set + Synthesis Protocol**. Hand off to exactly one next command.

## Disclaimer (non-waivable)

**Stay-interview practice extends HR-discipline research direction (originally Beverly Kaye et al.) to fan relationships. This is system architecture for cultivating audience signal, not market research advice. Confidentiality protocol non-waivable: name-attributed responses with the practitioner's promise of confidentiality produce honest signal; anonymous responses are noisier. Never share specific responses without consent.**

## Input
$ARGUMENTS

## Process

1. **Disclaim.** Non-waivable opener.
2. **Sort cohort.** Patron / Engaged-list / Bandcamp-loyal / Collaborator. Different cohorts respond to different question framings.
3. **Cohort sizing.** ≤30 fans for direct outreach (1:1 message); 30-200 for structured questionnaire; >200 sample to ≤200. Above 200 the responses fragment.
4. **Question set design.** Five structural questions (in practitioner's voice via Genius):
   - "What's keeping you here right now? Specifically — not the polite version."
   - "If you were going to drift away in the next 12 months, what would have to happen — or stop happening — for that to feel right?"
   - "What's the one thing that, if it changed, would make you cancel / unsubscribe / lose interest?"
   - "What do you wish there was more of?"
   - "What do you wish there was less of?"
   Refuse engagement-survey-style scaling questions ("rate your satisfaction 1-10"). Refuse multi-page surveys.
5. **Format.** Direct message (best signal, lowest scale) / structured form with name + optional anonymity / timed-windowed Discord thread (peer-of-peers signal). Pick based on cohort size + sovereignty.
6. **Confidentiality protocol.** Explicit: "Specific responses confidential to me; aggregate patterns may be shared without attribution; specific quotes only with your consent." Non-waivable.
7. **Signal-vs-politeness-drift framing.** Question framing predicts honesty — "what's the one thing that..." produces better signal than "are you happy with...". Specific narrow questions outperform open ones.
8. **Pattern recognition (≥3-occurrence threshold).** Responses clustered by theme; theme elevated only on ≥3 occurrences. Single-fan-says-X is signal but not pattern.
9. **Synthesis output structure.** Per theme: count of occurrences, representative quote (with consent), pattern interpretation, recommended response (or refusal of response if vision-boundary protected).
10. **Feedback loop to Composition.** Themes feeding back into next-release decisions named explicitly. Practitioner does not chase patterns slavishly; sees them.
11. **Save.** Write to `sound-intelligence/audience/stay-interview-<cohort>-<YYYY-MM-DD>.md`.
12. **Hand off.** Name exactly one next move:
    - Patterns surfaced → next-release Composition kickoff with synthesis context.
    - Retention risk surfaced → list-architecture or ritual-design adjustment.
    - Vision-boundary tension surfaced → MEMORY.md vision boundary review.

## Output format

```markdown
# Fan Stay-Interview — <Cohort Name> — <YYYY-MM-DD>

## Disclaimer
**Stay-interview signal not market research. Confidentiality protocol non-waivable.**

## Context
- **Cohort:** <patron | engaged-list | bandcamp-loyal | collaborator>
- **Cohort size:** <N>
- **Sample target:** <N>
- **Format:** <DM | structured form | Discord thread>
- **Window:** <opens YYYY-MM-DD; closes YYYY-MM-DD>

## Question set (in practitioner's voice)
1. <Q1 in practitioner's voice>
2. <Q2 in practitioner's voice>
3. <Q3 in practitioner's voice>
4. <Q4 in practitioner's voice>
5. <Q5 in practitioner's voice>

## Confidentiality framing
"Specific responses confidential to me. Aggregate patterns may be shared without attribution. Specific quotes only with your consent."

## Themes surfaced (≥3-occurrence threshold)
- **<theme>** — <N occurrences> — representative pattern: <one sentence>; recommended response: <named or vision-boundary refusal>.

## Single-fan signals (not patterns, but worth noting)
- <named, with one-line context>

## Composition feedback loop
- Themes feeding next-release decisions: <list>
- Themes refused (vision-boundary protected): <list>

## Recommended next move
**`/<command>`** — <one-line rationale>.

---
**Built on SIP** — Starlight Intelligence Protocol
- Substrate: starlightintelligence.org/protocol v1.1.0
- Layers used: [file-contract, attestation, commands, sovereignty]
- Verticals: starlight-intelligence-system@v7.5.3 (Sound Intelligence — Audience sub-system)
- Generated: <ISO date>
---
```

## Rules

- **Refuse engagement-survey-style scaling.** "Rate satisfaction 1-10" produces noise.
- **Refuse multi-page surveys.** Five questions max.
- **Confidentiality protocol non-waivable.** Specific responses never shared without explicit consent.
- **Pattern threshold ≥3 occurrences.** Single-fan-says-X is signal but not pattern.
- **Question framing matters.** Specific narrow questions outperform open ones.
- **Pattern recognition without slavish chase.** Practitioner sees patterns; vision boundaries override.
- **Built on SIP attestation at end of every artifact.**

---

**Built on SIP** — Starlight Intelligence Protocol v1.1.0
