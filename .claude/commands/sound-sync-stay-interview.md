---
name: sound-sync-stay-interview
description: Periodic conversation with most-engaged supervisors / library curators / brand-side music people. Asks what works, what doesn't, what they wish more / less of. Pattern recognition feeds Composition + Catalog upstream. Refuses generic "how can we work together more" framing.
allowed-tools: Read, Write, Grep, Glob
argument-hint: <quarter-or-name> + --target <supervisor|library-curator|brand-side> + --cohort-size <N> + optional context on what triggered the interview
---

# /sound-sync-stay-interview

Load `verticals/sound-intelligence/SKILL.md`, `verticals/sound-intelligence/SOUL.md`, `verticals/sound-intelligence/MEMORY.md`, `agents/starlight-sound-sync.md`, `skills/sound-intelligence/sync-licensing.md`, prior placement thesis + license-economics records, and Genius Profile for supervisor-facing voice. Produce a **Sync Stay-Interview Plan + Question Set + Synthesis Protocol**. Hand off to Composition / Catalog / Sync as patterns surface.

## Disclaimer (non-waivable)

**Stay-interview practice extends Beverly Kaye HR-discipline research direction to sync relationships. This is system architecture for cultivating sync signal, not market research advice. Confidentiality protocol non-waivable: name-attributed responses with the practitioner's promise of confidentiality produce honest signal; never share specific responses without consent.**

## Input
$ARGUMENTS

## Process

1. **Disclaim.** Non-waivable opener.
2. **Sort target.** Supervisor (placed your work) / Library curator (promoted your work) / Brand-side music person (considered your work). Different targets respond to different question framings.
3. **Cohort sizing.** ≤10 targets for direct outreach (1:1 message, supervisor calendars are tight); 10-30 for short structured form. Above 30 = supervisor relationships are not the cohort; consider library-segment-aggregate research instead.
4. **Question set design.** Five structural questions (in supervisor-facing voice via Genius — warm, business-precise, refuses casual framings):
   - "When you've placed my work, what made the placement easy on your side? What made it hard?"
   - "What's a brief class you keep getting that my catalog doesn't fit yet — but feels close?"
   - "If you were going to stop calling me about briefs, what would the trigger be — and what's the soonest version of that?"
   - "What's one thing you wish I'd send you proactively that I don't?"
   - "Which of my tracks (if any) lives in your back-pocket pile for when the right brief lands?"
5. **Format.** Direct message via established channel (best signal — supervisor reply rates are higher to known practitioners than to surveys). Structured form acceptable for library curators. Voice / video calls for high-trust supervisor relationships.
6. **Confidentiality protocol.** Explicit: "Specific responses confidential; aggregate patterns may inform my catalog and pitching without naming you; specific quotes only with your consent." Non-waivable.
7. **Honest-signal-vs-politeness-drift framing.** Specific narrow questions outperform open ones. Supervisors are busy; they respond to "what's the brief class my catalog doesn't fit yet" better than "any feedback?"
8. **Pattern recognition (≥3-occurrence threshold).** Themes elevated only on ≥3 occurrences. Common emergent themes: "supervisors keep asking for 60-90-second instrumental beds with emotional builds" → feeds Composition's idea bank; "library curators want sync-grade-dynamic-range alternate masters as a default delivery" → feeds Production's master-plan; "brand-side music people pass when AI involvement is unclear" → feeds Catalog's metadata discipline.
9. **Composition + Catalog feedback loops.** Per theme: which sub-system absorbs the signal? Composition (next-release intent) / Catalog (metadata + version-map) / Sync itself (brief-fit refinement). Practitioner does not chase patterns slavishly; sees them.
10. **Save.** Write to `sound-intelligence/sync/stay-interview-<quarter>-<YYYY-MM-DD>.md`.
11. **Hand off.** Name exactly one next move:
    - Patterns surfaced → Composition kickoff with synthesis context.
    - Brief-class gap surfaced → Catalog version-map work.
    - Vision-boundary tension with brand-side patterns → MEMORY.md vision boundary review.

## Output format

```markdown
# Sync Stay-Interview — <Quarter or Name> — <YYYY-MM-DD>

## Disclaimer
**Stay-interview signal not market research. Confidentiality protocol non-waivable.**

## Context
- **Target:** <supervisor | library curator | brand-side music person>
- **Cohort size:** <N>
- **Sample target:** <N>
- **Format:** <DM | structured form | call>
- **Window:** <opens YYYY-MM-DD; closes YYYY-MM-DD>

## Question set (in practitioner's voice)
1. <Q1 in practitioner's voice>
2. <Q2 in practitioner's voice>
3. <Q3 in practitioner's voice>
4. <Q4 in practitioner's voice>
5. <Q5 in practitioner's voice>

## Confidentiality framing
"Specific responses confidential. Aggregate patterns may inform my catalog and pitching without naming you. Specific quotes only with your consent."

## Themes surfaced (≥3-occurrence threshold)

### Theme — <named>
- **Occurrences:** <N>
- **Pattern:** <one sentence>
- **Feeds:** <Composition / Catalog / Sync> sub-system
- **Recommended response:** <named or "vision-boundary-protected refusal">

### Theme — <named>
...

## Single-target signals (not patterns, but worth noting)
- <named, with one-line context>

## Composition + Catalog + Sync feedback
- **Composition:** themes feeding next-release ideas: <list>
- **Catalog:** themes feeding metadata + version-map: <list>
- **Sync (brief-fit refinement):** themes refining brief-fit axes: <list>

## Vision-boundary tensions
- <if any pattern conflicts with active boundary, named explicitly>

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

- **Confidentiality protocol non-waivable.** Specific responses never shared without explicit consent.
- **Five questions max.** Supervisor calendars are tight.
- **Specific narrow questions outperform open ones.** "What brief class my catalog doesn't fit yet" beats "any feedback?"
- **Pattern threshold ≥3 occurrences.** Single-supervisor-says-X is signal but not pattern.
- **Feedback loops to Composition + Catalog explicit.** Patterns feed upstream sub-systems; practitioner sees patterns without slavish chase.
- **Vision-boundary tensions surfaced.** When brand-side patterns conflict with declared boundaries, name the tension; do not silently drift.
- **Built on SIP attestation at end of every artifact.**

---

**Built on SIP** — Starlight Intelligence Protocol v1.1.0
