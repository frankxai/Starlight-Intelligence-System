---
name: integration/idea-triage
domain: integration
description: Classify newcomer inbound into one of four SIP routes — substrate / alliance / vertical / sovereign spawn. Powers /intake and Concierge. Surfaces readiness gaps before routing.
triggers:
  keywords: ["new here", "have an idea", "want to build", "first time", "where do I start", "can you help", "I want to create", "we want to compose", "our team wants"]
  agents: ["starlight-concierge", "starlight-navigator"]
  intents: ["intake", "onboarding", "classification"]
priority: high
load_level: core
---

# Idea Triage

> *"Route first. Commit never before route is named."*

## Purpose

The single biggest bottleneck at the front door is not quality, not capability, not ambition — it is routing ambiguity. A strong idea mis-routed gets stuck; a weak idea correctly routed still produces a clean decline. Triage exists because the cost of collapsing option space *after* commitment is extracted (energy, attention, trust, Frank's time) is an order of magnitude higher than the cost of naming a route *before*.

This skill classifies any inbound idea into exactly one of four SIP routes — A (substrate contribution), B (alliance), C (vertical), D (sovereign spawn) — surfaces readiness gaps, and hands off to the right next command. It is the first layer of protection on both the substrate and Frank's attention. Triage is adversarial to ambiguity, never to the person.

## Activation

**Fires when:**
- First-contact inbound (`/intake` invocation)
- Concierge agent reasoning about where to route a newcomer
- Keywords above appear in a newcomer conversation
- Any message where the shape of the ask is unclear and a route has not been named

**Does NOT fire when:**
- Returning user with an established route — they go straight to their route's command (`/alliance-*`, `/vertical-*`, `/sip-*`, etc.)
- Internal Frank work on a known vertical or alliance
- The user has already declared their route in the opening message with sufficient clarity

## Classification Protocol

### Step 1 — Extract the shape of the ask

Ignore the content. Read the *shape*. Classify into one of:

- **Protocol change** — the ask modifies SIP itself (new clause, new handshake, new attestation format).
- **Multi-party composition** — two or more sovereign parties want to build a shared artifact while each remaining themselves.
- **Single-entity system** — one sovereign entity wants to stand up their own domain on the substrate.
- **Substrate fork** — the ask is to take the whole pattern and instantiate a new sovereign system that will run its own verticals and alliances downstream.

If the shape cannot be extracted, go to Step 3's fallback (one clarifying question).

### Step 2 — Check readiness signals

Scan for the four readiness signals. Note which are present, which are missing:

1. **Sovereignty declared** — do they know they remain themselves, and is that reflected in how they describe the work?
2. **Format preference** — are they a builder (terminal-fluent, git-native) or a creator (zero-terminal, artifact-native)?
3. **Time horizon** — weeks, quarters, or open-ended?
4. **Named problem** — can they articulate what they're solving, or is the ask still at "I want to do something with AI"?

Readiness gaps do not block routing — they get surfaced in the output so the next command knows what to resolve.

### Step 3 — Apply the decision tree

- Shape = **protocol change** → Route **A** (substrate contribution). HIGH BAR. Requires `/luminor-board` session before intake is accepted. Route A decisions are structural; they change what everyone else is building on.
- Shape = **2+ sovereign parties composing**, shared artifact → Route **B** (alliance). Next: `/alliance-forge`.
- Shape = **one sovereign entity**, own domain → Route **C** (vertical). Next: `/vertical-spawn`.
- Shape = **substrate fork**, spawn a new sovereign ecosystem → Route **D** (sovereign spawn). Rare. Next: substrate fork protocol (`/sip-fork` when implemented; interim: `/luminor-board` session).
- Shape = **unclear** → ask ONE clarifying question, never two. Then re-classify. If still unclear after one round, name it explicitly ("I cannot route this without knowing X") and halt.

### Step 4 — Assign track

- **Builder track** — terminal-fluent, git-native, wants commands and repos. Routes via `/intake` to the next command directly.
- **Creator track** — zero-terminal, artifact-native. Routes to Envoy agent and the creator-path skill.

Track is orthogonal to route. A Route C (vertical) can be builder-track or creator-track. A Route B (alliance) generally has at least one builder-track party, but creator-track participants are legitimate.

### Step 5 — Name the voices

Identify which voice archetypes from `VOICES.md` will speak to this work. Typical mappings:

- Route A → architect, protocol-defender, overseer
- Route B → architect, sovereign-creator (per party), protocol-defender
- Route C → sovereign-creator, architect, implementer
- Route D → architect, protocol-defender, overseer, sovereign-creator

Name 2–4 voices. More than four means the classification is not tight enough.

### Step 6 — Return

Emit the output block. Do not commit Frank's time. Do not promise an outcome. Do hand off cleanly to the next command.

## Output Shape

```yaml
route: A | B | C | D
track: builder | creator
rationale: <one-sentence why this route, not the adjacent ones>
voices: [architect, sovereign-creator, protocol-defender, implementer, overseer]  # relevant subset
next_command: /<command>
readiness_gaps: [<list of missing signals>, or "none"]
```

## Rules

1. **Sovereignty is non-waivable.** If sovereignty is not declared, halt and name it. Do not route around it. Do not assume it.
2. **One route, never two.** "Maybe A or B" is a triage failure. Collapse to one. If you cannot collapse, the classification is incomplete — ask the clarifying question.
3. **Route A is rare.** Default bias away from A. Substrate change is structural and irreversible-ish; treat it as the exception, not the default. A newcomer proposing a protocol change on first contact almost always wants Route B or C — triage is permitted to reframe.
4. **Silent composition is refused.** If the inbound proposes using SIP elements without attestation ("can we just borrow the pattern without the stamp"), triage refuses and hands to the attestation-handshake skill (v7.4). No exceptions for "we'll do it later."
5. **Triage does not commit Frank's time.** Builder-track → `/intake` → next command. Creator-track → Envoy. Advisory or direct-time asks are Route E — a separate class this skill does NOT auto-route to. If the ask is for Frank's direct time, triage names it and returns `next_command: manual-review`.
6. **Decorative classification is refused.** If the ask does not fit any route cleanly even after one clarifying question, say so. "Not yet ready for triage" is a valid return.

## Built on SIP

This skill composes with SIP protocol elements:
- Sovereignty clause (non-waivable, enforced at Step 3 and Rule 1)
- Four-route taxonomy (Routes A/B/C/D from SIP v7.x)
- Attestation requirement (Rule 4)
- Voice archetypes (`VOICES.md`)

Attestation: `Built on SIP` — idea-triage v1, Starlight Intelligence System v7.3.
