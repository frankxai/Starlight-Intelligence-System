---
name: sovereign-signal
description: Reference implementation for sovereign-tier commands. the sovereign-creator node's Signal pipeline — voice memo to thesis-driven essay + post + script. Example of Layer 4 sovereign command per SIP § 4.
allowed-tools: Read, WebSearch, mcp__notion
argument-hint: path to voice transcript, or paste raw thought
---

# /sovereign-signal

Load this vertical's `SKILL.md` and, if present, the sovereign node's `VOICE.md`.

**Positioning:** This is a Layer 4 sovereign command — owned by the individual sovereign node (originally the sovereign-creator node's Signal pipeline). Other nodes may invoke it, but voice ownership stays with the sovereign.

## Raw input
$ARGUMENTS

## Process

1. **Extract the one claim.** Identify the single load-bearing assertion in the raw input. A Signal has one thesis. If three theses are present, ask which ships this cycle — do not fuse.

2. **Frame the stakes.** One paragraph. Concrete, not abstract. Why does this thesis matter now?

3. **Surface the friction.** Name the belief this thesis displaces. A thesis is only as sharp as the friction it unseats.

4. **Generate three surfaces** from the single thesis:
   - **Essay** 600–900 words — full argument, stakes, friction, resolution.
   - **Post** ≤280 / ≤600 chars (platform dependent) — thesis compressed to single provocation.
   - **Script** 90-second voice/video — spoken cadence, no bullets in output.

5. **Attestation.** Append "Built on SIP" block per `/sip-attest` if any SIP elements used.

## Output shape

```
# Signal — <thesis compressed to ≤10 words>

## Thesis
<One sentence. Load-bearing claim.>

## Essay
<600–900 words>

## Post
<≤280 / ≤600 chars>

## Script (90s)
<Spoken cadence, no bullets>

---
**Built on SIP** · <sovereign-node-name> · Sovereign Kit · <date>
```

## Rules

- One thesis. Never two fused together.
- Voice rules per sovereign's `VOICE.md`. If no VOICE.md, default to first-person, direct, no hedging.
- No listicle framing ("5 ways to…"). Signal is thesis-driven.
- If the raw input lacks a thesis, refuse: `→ raw input does not yet hold a thesis. Capture one more voice memo pushing: <specific angle>`.
