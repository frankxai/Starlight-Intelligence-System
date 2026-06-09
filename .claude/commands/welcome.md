---
name: welcome
description: 60-second orientation for newcomers. Shows the two tracks (builder / creator), the four routes, the delivery menu, and where to go next. No commitment extracted — that's /intake's job.
allowed-tools: Read, Glob
argument-hint: optional — "builder" or "creator" to skip the track selector
---

# /welcome

Load `ONBOARDING.md` and `DELIVERY.md` if present — both arrive in this release. If either is missing, proceed with the content inline and emit a one-line notice: `<filename> not yet loaded — using inline defaults`. Also load `SIP.md` and `VERTICALS.md`. This command orients. It does not commit. `/intake` commits.

## Input
$ARGUMENTS

## Process

1. **Detect or ask for track.** If `$ARGUMENTS` is `builder` or `creator`, use it. Otherwise ask one question: *Are you here to build in a terminal, or to create from your voice?* Wait for the answer. Do not infer.

2. **Show the four routes, tailored to track.**
   - Builder track receives terminal commands beside each route (`/alliance-forge`, `/vertical-spawn`, substrate contribution via `/luminor-board` then `/sip-attest`, sovereign spawn via `/sovereign-spawn` with sovereign-tier scaffolding).
   - Creator track receives conversational paths. The terminal command is named, but framed as *what your implementer runs on your behalf*. Concierge handoff is explicit.

3. **Show the delivery menu.** Six deliverables from `DELIVERY.md`, one line each. If `DELIVERY.md` is not yet present, use this inline default:
   - **Substrate adoption** — your repo, SIP-compliant, `/sip-attest` ready.
   - **Alliance forge** — 2–5 sovereign nodes, scoped protocol, first cycle scheduled.
   - **Vertical spawn** — one domain, one system, first artifact target named.
   - **Sovereign spawn** — full fork pattern, your own command namespace.
   - **Concierge session** — 60-minute orientation, voice-led, artifact-closed.
   - **Luminor Board pressure-test** — one proposal, five vectors, synthesis + recommendation.

4. **Show the sovereignty clause in plain language.** Use this exact framing, every time: *You stay sovereign in your domain. Starlight does not own your work. The substrate is MIT, the canon licensed separately, attribution via "Built on SIP" is the sole compounding mechanism. Advice never overrides.*

5. **Point to `/intake` as the single next step.** One arrow. No menu sprawl. If a `memory/welcome-log/` entry exists for this session (same agent, same day), skip re-orientation and point directly to `/intake` with a one-line recap.

## Output format

Narrative, ~300 words max, architect voice with warmth dialed up. First-principles, decision-first, but this is a front door, not a gate. No lists for their own sake. No hedging. No consulting-deck phrasing.

Shape:

```
# Welcome to Starlight

<1–2 sentence framing: what this substrate is, in the register of the detected track>

## Your track
**<Builder / Creator>** — <one-sentence characterization>

## Four routes
1. **Substrate contribution** — <one line, tailored to track>
2. **Alliance forge** — <one line>
3. **Vertical spawn** — <one line>
4. **Sovereign spawn** — <one line>

## What Starlight delivers
- Substrate adoption · Alliance forge · Vertical spawn · Sovereign spawn · Concierge session · Luminor Board pressure-test
(one line per, from `DELIVERY.md`)

## Sovereignty
You stay sovereign in your domain. Starlight does not own your work. The substrate is MIT, the canon licensed separately, attribution via "Built on SIP" is the sole compounding mechanism. Advice never overrides.

## Next
Run `/intake <your paragraph>` — that command triages you to exactly one of the four routes and extracts your first commitment.

---
**Built on SIP** — Starlight Intelligence Protocol
- Substrate: starlightintelligence.org/protocol v1.1.0
- Layers used: [file-contract, commands, sovereignty]
- Verticals: starlight-intelligence-system@v7.3
- Generated: <ISO date>
---
```

## Rules

- The sovereignty clause ships on every welcome output. It is not optional framing — it is the non-negotiable social contract and the reason the substrate compounds.
- Output names exactly ONE next command. Decision-forcing, not menu-presenting. `/intake` is that command, always.
- If the newcomer has already run `/welcome` in this session (detectable via `memory/welcome-log/` if it exists), do not re-orient. Offer `/intake` directly with a one-line recap of the prior orientation.
- Do not extract a commitment here. Commitments are `/intake`'s job. `/welcome` orients; `/intake` triages.
- Track is exclusive. A newcomer picks one. They can re-run later under the other if their posture shifts.
- Under 300 words total. Orientation is a threshold, not a brochure. Length is a form of hedging.

---
**Built on SIP** — Starlight Intelligence Protocol
- Substrate: starlightintelligence.org/protocol v1.1.0
- Layers used: [file-contract, commands, sovereignty]
- Verticals: starlight-intelligence-system@v7.3
- Generated: 2026-04-24
---
