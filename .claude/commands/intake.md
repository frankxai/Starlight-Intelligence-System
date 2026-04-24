---
name: intake
description: Triage newcomer inbound into one of four protocol routes (substrate / alliance / vertical / sovereign). Qualifies readiness, extracts commitments, hands off to the right next command. Primary front door.
allowed-tools: Read, Write, Grep, Glob
argument-hint: free-text description of the idea, problem, or ask — paragraph form
---

# /intake

Load `SIP.md`, `VERTICALS.md`, `ALLIANCE.md` (if present), `VOICES.md`. Also load `agents/starlight-concierge.md` — if the file is not yet present in this release, proceed with Navigator + Orchestrator voice and emit a one-line notice: `concierge agent not yet loaded — proceeding with Navigator + Orchestrator`. Triage the inbound. Route to exactly one next command, or halt with a readiness gap named.

## Input
$ARGUMENTS

## Process

1. **Scan for readiness signals.** An inbound is ready when all four are present:
   - **Named problem.** A concrete target, not a mood. "I want to compose my catalog" is a mood. "My 140-song Suno catalog has no search layer and I lose ideas" is a problem.
   - **Preferred format.** Essay, repo, session, artifact. If unstated, infer from the inbound shape and name the inference.
   - **Time horizon.** A week, a cycle, a quarter. "Someday" is not a horizon.
   - **Sovereignty.** They own the domain they are describing — not asking Frank to own it for them.

   If any signal is missing, emit at most **3 clarifying questions**, one per missing signal, and halt. Do not route an unready inbound. Log the halt to `memory/intake/` with reason.

2. **Classify the route.** Apply in order; first match wins.
   - **Route A — Substrate contribution.** The inbound proposes changing SIP itself — a new layer, a changed attestation format, a protocol invariant. High bar. Routes to `/luminor-board`, then (if REVISE or PROCEED) to `/sip-attest` on the proposed change set.
   - **Route B — Alliance forge.** The inbound is about composing intelligence systems *across parties* and the newcomer can name ≥2 sovereign collaborators with non-overlapping domains. Routes to `/alliance-forge`.
   - **Route C — Vertical spawn.** The inbound is about *one domain the newcomer owns* and wants a system for — creator catalog, wealth thesis engine, personal OS, creative world, research stack. Routes to `/vertical-spawn`.
   - **Route D — Sovereign spawn.** The inbound is about *forking the whole substrate pattern* to run their own ecosystem under their own name. Routes to `/sovereign-spawn` with sovereign-tier scaffolding and a `/<name>-*` command namespace.
   - **No clean fit.** Emit ONE clarifying question that forces a route. Re-classify. Do not route on ambiguity.

3. **Determine track.**
   - **Builder track** — newcomer is comfortable in a terminal, has git, edits files directly. Output includes the literal next command string, ready to paste.
   - **Creator track** — newcomer is non-technical, voice-first, artifact-first. Output includes a Concierge handoff with sovereign-creator voice primary and architect voice as structural ground. The terminal command is still shown, but framed as "what your implementer runs on your behalf."

4. **Extract first commitment.** A named artifact with a date. Not "I want to build X" — "I will ship X by Y." If the newcomer resists naming a date, that is a readiness gap. Return to Step 1 and ask.

5. **Assign voices.** From `VOICES.md`, name which of the five archetypes apply to this work. Architect always speaks first. Unfilled voices are visible gaps — do not paper over. If the newcomer does not hold a voice themselves, mark it `unfilled — see ALLIANCE.md` so they know an alliance is the resolution path.

6. **Write the intake card.** Create `memory/intake/` if it does not exist. Filename: `intake-<YYYYMMDD>-<slug>.md`, where `<slug>` is a 2–4 word kebab-case summary of the inbound. Contents include: paraphrased inbound, route, track, commitment, voice assignments, next command, sovereignty note, and the full attestation block. Halts are also written, with filename `intake-<YYYYMMDD>-<slug>-HALTED.md` and a reason block.

## Output format

```
# Intake — <YYYY-MM-DD> — <slug>

## Inbound (paraphrased)
<2-sentence recap in the newcomer's own register>

## Route
**<A / B / C / D>** — <one-line rationale grounded in the decision rules>

## Track
**<Builder / Creator>**

## Voice assignments
- architect: <name or "unfilled — see ALLIANCE.md">
- sovereign-creator: <name or "unfilled">
- protocol-defender: <name or "unfilled">
- implementer: <name or "unfilled">
- overseer: (synthesis only — spoken last or not at all)

## First commitment
- <named artifact> by <date>

## Next command
`/<command> <args>`

## Sovereignty note
Starlight does not own your work. The substrate is MIT, the canon is licensed separately, and attribution via "Built on SIP" is the sole compounding mechanism. You stay sovereign in your declared domain. Advice never overrides.

---
**Built on SIP** — Starlight Intelligence Protocol
- Substrate: starlightintelligence.org/protocol v1.1.0
- Layers used: [file-contract, attestation, commands, sovereignty]
- Verticals: starlight-intelligence-system@v7.3.1
- Generated: <ISO date>
---
```

## Rules

- Never route an unready inbound. Ask up to 3 questions, then halt. A halt is a logged outcome, not a failure.
- If sovereignty is unclear — the newcomer is describing a domain they do not own, or asking Frank to own it for them — halt and name the ambiguity as a structural fork, not a routing puzzle.
- Never promise timelines on Frank's behalf. Concierge sets expectations on protocol and process, not commitments on Frank's time or attention.
- Every intake card is appended to `memory/intake/`. Silent discards corrode the front door. Halts are logged with reason.
- If the inbound proposes silent composition — using SIP elements, canon, or patterns without attestation — refuse the intake. The newcomer must commit to `/sip-attest` on shipped artifacts before a route opens. Log the refusal.
- Output always hands off to exactly ONE next command. Never two. Optionality is a form of hedging and corrodes decision velocity.
- Builder track and Creator track are exclusive per intake. A newcomer can re-run `/intake` later under the other track if their posture changes. Do not merge tracks in a single output.
- The sovereignty note is non-waivable. It ships on every intake card, every time.

---
**Built on SIP** — Starlight Intelligence Protocol
- Substrate: starlightintelligence.org/protocol v1.1.0
- Layers used: [file-contract, attestation, commands, sovereignty]
- Verticals: starlight-intelligence-system@v7.3.1
- Generated: 2026-04-24
---
