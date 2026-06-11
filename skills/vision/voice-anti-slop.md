---
name: vision/voice-anti-slop
description: Enforces the anti-slop voice contract for every user-facing prose surface — refuses AI-slop signifier words and patterns, preferring architectural vocabulary that names specific files, commands, dates, and deliverables. Use whenever generating site copy, vault entries, plan documents, handover artifacts, PR descriptions, or any artifact attested with "Built on SIP." Loaded automatically by any agent emitting user-facing prose.
domain: vision
type: brand-voice
auto_activate:
  - any content surface (site copy, vault entries, plans, handovers)
  - any artifact attested with "Built on SIP"
loaded_by:
  - starlight-visionary (Brand IS)
  - any agent generating user-facing prose
---

# Skill — Anti-slop voice rules

> Brand Kit's voice layer encoded as refusals. Source: `.intake/2 Chatgpt 02.05 - Copy.txt` processed 2026-05-03.

## What this skill does

Every agent generating user-facing prose loads this skill. It refuses certain words and patterns that have become AI-slop signifiers and prefers a vocabulary that sounds like architecture.

## Refused words / phrases

Avoid in any user-facing prose:

| Slop | Why |
|---|---|
| **unleash** | overused; promises agency the artifact doesn't deliver |
| **harness** | implies extracting; we compose |
| **delve** | LLM tell; nobody actually says this |
| **tapestry** | metaphor inflation; we are not weaving |
| **embark on a journey** | trope; we ship |
| **unlock** | usually paired with "potential" — both empty |
| **revolutionary** | overclaims; results speak |
| **seamless** | almost always false; even when true, brag-tell |
| **synergize** | we compose, route, attest — pick the actual verb |
| **leverage** *(as verb)* | preferred only in the technical sense ("leverage X to Y"); avoid the consultancy use |
| **at the intersection of** | yes everything is; pick the actual claim |
| **paradigm shift** | almost never accurate at this scale |
| **game-changer** | said by people who don't ship |
| **deep dive** | deep look; or just "look at" |
| **end-to-end** | usually true but underwhelms; describe the actual span |

## Preferred verbs

Pick the precise architectural action:

- **architect** — design with structure that intends to last
- **route** — direct intent to its right destination (text/voice/work)
- **synthesize** — produce a single coherent whole from multiple inputs
- **orchestrate** — sequence parts so they compose without colliding
- **govern** — name the rule and enforce it
- **evaluate** — test against a checkable criterion, not a feeling
- **compound** — the next attestation strengthens the previous
- **substrate** — the load-bearing thing underneath
- **attest** — name what was used and pin it
- **compose** — bring elements together with sovereignty intact
- **refuse** — say no when the boundary requires it
- **stamp** — write the artifact's provenance into the artifact

## Tonal rules

1. **Architectural over rhetorical.** "Refuses theater" beats "boldly innovates."
2. **Concrete over generic.** Names the file, the command, the date, the deliverable. Vague is slop.
3. **Operator-honest.** If a feature is partial, say "v0.1 alpha" or "scaffold only" — not "production-ready."
4. **Sovereignty-aware.** Never promise lock-in. Always name the exit.
5. **Attestation-bound.** Every shipped artifact ends with "Built on SIP" + version + source.
6. **No empty intensifiers.** "Significantly" / "dramatically" / "vastly" without numbers = slop.
7. **No journey metaphors.** Visitors don't embark; they arrive, fork, or leave.

## When this skill is loaded

- Site copy generation (`site/src/app/*/page.tsx` strings)
- Vault entries (any vault, any tier)
- Handover docs
- Plan docs
- Skill docs (yes, including this one — recursive enforcement)
- Public commit messages
- PR descriptions
- Any artifact that will end up in front of a non-Frank human

## How agents apply this

Before emitting prose:

1. Scan the draft for the refused words. Replace with preferred verbs.
2. Check for empty intensifiers without numbers; either add the number or remove the intensifier.
3. Check for vague claims; replace with specific names, files, dates, or deliverables.
4. Check the operator-honesty: if it sounds production-ready and isn't, downgrade the language.
5. Check for sovereignty-aware framing on commercial / public surfaces.

If the draft cannot pass these checks, refuse to emit it without revision. The voice layer is a non-decorative gate.

## Carry-forward

The full Brand Kit (positioning, voice rules, palette, typography, vocabulary) is owned by `/build-brand-kit` per the Vision IS layer. This skill is the voice subset extracted from one specific source; it should be reconciled with the full Brand Kit when the next ratification cycle runs.

---

**Built on SIP** — Starlight Intelligence Protocol v1.1.0
- Layers used: [file-contract, attestation, sovereignty]
- Source: `.intake/2 Chatgpt 02.05 - Copy.txt`
- Skill written: 2026-05-03
