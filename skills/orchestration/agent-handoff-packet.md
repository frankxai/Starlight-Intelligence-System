---
name: orchestration/agent-handoff-packet
domain: orchestration
description: Build a structured handoff packet so any frontend (voice, text, intake, council) can hand work to any deep agent (Claude Code, Codex, Gemini, vertical agents) without re-explaining context. The contract that lets cockpit and engine room compose without friction.
triggers:
  keywords: ["handoff packet", "route this to", "dispatch to agent", "pass to claude code", "build a packet", "hand to orchestrator", "send to council", "route the work"]
  agents: ["starlight-voice-operator", "starlight-orchestrator", "starlight-concierge", "starlight-prime"]
  intents: ["handoff", "routing", "dispatch", "agent-coordination"]
priority: high
load_level: core
---

# Agent Handoff Packet

> *"The packet is the contract. The frontend doesn't know how the deep agent works. The deep agent doesn't know how the frontend captured the intent. The packet is what they share."*

## Purpose

Every deep agent in SIS — Claude Code sessions, council formations, the HR vertical, the FrankX content engine — needs the same five things to do its job well: what was asked, what's the target system, what context already exists, what counts as done, and whether human approval is needed. Without a shared format, every frontend (voice, text, `/intake`, ad-hoc Slack message, future watch interface) re-implements that briefing from scratch and the deep agents waste tokens reconstructing context that the frontend already had.

This skill produces a single canonical packet format. Voice Operator uses it on every routed utterance. Concierge uses it on every intake handoff. Council uses it for parallel-agent fan-out. The packet is append-only; re-routing creates a child packet with `parent_packet_id` rather than mutating the original. This preserves a clean audit trail and lets verification check that the handoff arrived intact.

The packet is the bridge that lets the cockpit (real-time, executive-pace) compose with the engine room (deep, multi-step) without contaminating either.

## Activation

**Fires when:**
- Voice Operator routes a Build / Command / Organize / External class utterance.
- Concierge hands a routed intake to a downstream agent.
- Orchestrator decomposes a complex packet into sub-packets for parallel execution.
- Any frontend produces work that another agent will execute.

**Does NOT fire when:**
- Voice Operator handles a Capture / Search / Reflect utterance directly without routing.
- Internal reasoning within a single agent — packets are inter-agent only.
- A user is having a conversation with the council directly (council convened, no handoff needed).

## Packet Schema

### Required fields

```yaml
packet_version: 1
packet_id: <ulid or uuid v7>
created_at: <iso8601 utc>
source: voice | text | /intake | council-fanout | other:<name>
classification:
  intent_class: capture | command | build | search | organize | reflect | external
  confidence: high | medium | low
target_system: <repo path | URL | "device" | "memory" | "external:<service>" | "agent:<name>">
context:
  utterance: <verbatim transcript or original written ask>
  relevant_files: [<path>, ...]   # may be empty
  relevant_memory: [<vault entry reference>, ...]  # may be empty
task: <imperative one-paragraph statement of what to do>
constraints:
  do_not_touch: [<path or scope>, ...]
  must_preserve: [<invariant>, ...]
verification:
  proof_required:
    - <one of: file_exists | command_passed | url_200 | deploy_ready |
       backup_created | transcript_saved | diff_reviewed | user_approved |
       test_passed | artifact_attested>
    - ...
  done_means: <one sentence, checkable without asking the user>
approval:
  required: yes | no
  tier: A | B | C
  reason_if_required: <one sentence>
spoken_update_for_user: <≤2 sentences, will be read aloud or shown in cockpit>
```

### Optional fields

```yaml
route_history: [<prior agent name>, ...]   # if re-routed
risk_flags: [<flag>, ...]                   # production-target, external-send, financial-impact, secret-exposure, substrate-edit, etc.
parent_packet_id: <ulid>                    # if this packet is a child of another
priority: critical | high | normal | low    # default normal
expires_at: <iso8601>                       # for time-sensitive work
attestation: built-on-sip                   # ambient default; explicit if any doubt
```

## Build Protocol

### Step 1 — Capture context

Hold the utterance verbatim. Do not paraphrase yet. Read any files or memory that the utterance references. Build the `context` block first.

### Step 2 — Classify intent

Place into exactly one intent class. If two seem to apply, ask: "what does the user expect to be true 30 seconds from now?" The class that answers that question is the right one. If still ambiguous, choose the more reversible class (capture > search > build > command > organize > external) and flag the ambiguity in `risk_flags`.

### Step 3 — Choose target system

One target. Not "Claude Code or Codex." Not "council, or maybe Orchestrator." If you cannot pick one, the packet is not ready — go back to step 2 and tighten the classification.

### Step 4 — Write the task statement

One imperative paragraph. The downstream agent should be able to act from this paragraph alone. Pretend the downstream agent will not see the utterance — only the task. If your task statement requires reading the utterance to make sense, rewrite it.

### Step 5 — Set constraints

What must not be touched? What invariants must hold? Be specific. "Do not touch production" is too vague — name the file paths or the system surface. "Must preserve test coverage" is fine if there is a measurable threshold.

### Step 6 — Define verification

`proof_required` is a list of checkable proofs. `done_means` is one sentence — when this sentence is true, the work is done. The downstream agent must be able to check `done_means` without asking the user.

### Step 7 — Set approval gate

Read the proposed work against the canonical Tier A/B/C lists in the Voice Operator agent definition. Tier A = execute freely. Tier B = require approval. Tier C = hard stop, escalate. When unsure, escalate one tier — false positives are recoverable; false negatives are not.

### Step 8 — Draft spoken update

≤2 sentences. What does the user hear / see when this packet is dispatched? It must be honest about state: if we're routing without executing, say so; if we're prepared but not done, say so.

### Step 9 — Emit and route

Emit the packet to the target system. Log to `memory/packets/` (or equivalent operational vault location) with `packet_id`. Speak / display the `spoken_update_for_user` field. Wait for verification proof or approval signal before claiming done.

## Schema versioning

`packet_version: 1` is required on every packet. Downstream agents MUST refuse packets with an unrecognized version. v2 will arrive when (a) a third frontend ships against v1 and forces a contract revision, or (b) a downstream agent type emerges whose needs cannot fit the current schema. Until then, additions go in `optional fields` only — required fields are frozen at v1 to protect existing consumers.

## Invariants

1. **Append-only.** Packets are never mutated. Re-routing creates a child packet with `parent_packet_id`. Approval changes (e.g., user approves a Tier B packet) are recorded as separate signed events, not edits.

2. **Verifiable done.** `done_means` must be checkable without asking the user. If the only way to know it's done is to ask, the packet is wrong-scoped.

3. **One target system.** No "or" in `target_system`. Routing ambiguity is a packet-build failure, not a downstream-agent problem.

4. **Approval cannot weaken downstream.** If Voice Operator sets Tier B, downstream agents cannot relax to Tier A. They can strengthen (Tier B → Tier C) if they discover risk Voice missed, but never the other way.

5. **Spoken update is mandatory and honest.** If the user will hear "done" but the work is only drafted, the packet is wrong. Use the prepared/drafted/queued/staged phrasing instead.

6. **No empty context.** If `context.utterance` is empty, the packet has nothing to act on. If `context.relevant_files` and `context.relevant_memory` are both empty AND the work touches existing systems, the packet is incomplete — populate before routing.

7. **Built on SIP attestation is ambient.** Any artifact produced by the downstream agent inherits attestation. The `attestation` field is set explicitly only when the artifact's attribution chain is non-obvious.

## Failure modes (the packet is wrong if...)

- Two intent classes ticked. → Re-classify.
- Target system reads "Claude Code or Codex" or similar. → Pick one or refuse to route.
- `done_means` reads "ask Frank if it's good." → Re-write with a checkable proof.
- `do_not_touch` is empty AND the work touches production / secrets / external systems. → Add explicit constraints.
- `spoken_update_for_user` is >2 sentences. → Compress or split the packet.
- Tier A set on a packet that touches production / external sends / financial state. → Escalate to Tier B at minimum.
- Approval `required: no` AND `tier: B`. → Internal contradiction; fix the tier or fix the required flag.

## Composition with existing skills

- `orchestration/multi-agent-coordination` — when a packet fans out to multiple agents, this skill governs the fan-out pattern.
- `orchestration/parallel-execution` — sibling packets running concurrently use this skill's coordination pattern.
- `orchestration/context-engineering` — when a packet requires multi-turn context, this skill manages the rolling window.
- `memory/context-preservation` — packets log to memory via this skill, preserving handoff state across sessions.
- `intelligence/decision-framework` — Tier classification uses this skill's rapid risk-assessment pattern.

## Example

User utterance (voice): *"Starlight, prepare a Claude Code packet for the FrankX site — the pricing page is missing a comparison table. Don't touch the design tokens."*

Packet:

```yaml
packet_version: 1
packet_id: 01J9V8XMK3ZQ7HWYZF3D8R4Y2X
created_at: 2026-04-26T14:33:12Z
source: voice
classification:
  intent_class: build
  confidence: high
target_system: agent:claude-code
context:
  utterance: "Starlight, prepare a Claude Code packet for the FrankX site — the pricing page is missing a comparison table. Don't touch the design tokens."
  relevant_files:
    - frankx-site/app/pricing/page.tsx
    - frankx-site/components/pricing/
  relevant_memory:
    - vaults/strategic-vault.md#frankx-pricing-2026-q2
task: |
  Add a feature comparison table to the FrankX pricing page. Source the
  feature list from the existing pricing tier definitions. Match the
  visual language of the existing pricing page. Render it server-side
  for SEO. Add it below the tier cards, above the FAQ.
constraints:
  do_not_touch:
    - frankx-site/lib/design-tokens/
    - frankx-site/app/globals.css
  must_preserve:
    - existing tier card layout
    - mobile responsive breakpoints
    - accessibility score >=95
verification:
  proof_required:
    - file_exists: frankx-site/components/pricing/comparison-table.tsx
    - command_passed: pnpm build
    - test_passed: pnpm test
    - diff_reviewed
  done_means: >
    Comparison table component exists, build passes, tests pass, diff is
    ready for Frank to review. Not yet deployed.
approval:
  required: no
  tier: A
  reason_if_required: ""
spoken_update_for_user: >
  Routing to Claude Code. Output: comparison table component, build green,
  diff ready for review. No deploy.
risk_flags: []
attestation: built-on-sip
```

After Claude Code executes, a child packet logs the verification result with `parent_packet_id: 01J9V8XMK3ZQ7HWYZF3D8R4Y2X`.

## Built on SIP

This skill composes with SIP elements:
- Sovereignty clause — packets cannot waive on the user's behalf.
- Attestation — ambient default; explicit field for non-obvious chains.
- Voice archetypes — packets carry voice context when relevant for downstream tone.
- Approval tiers — inherit from the Voice Operator agent definition; no parallel definition here.

Attestation: `Built on SIP` — agent-handoff-packet v1, Starlight Intelligence System v7.4.x.
