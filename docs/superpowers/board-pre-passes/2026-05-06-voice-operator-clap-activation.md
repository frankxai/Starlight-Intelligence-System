---
title: Voice Operator activation channel — clap-as-primary
date: 2026-05-06
proposer: Frank (recorded by Starlight queen tab)
substrate-touch: yes — `agents/starlight-voice-operator.md`
operational-implementation: shipped 2026-05-06 (Phase A1, this session)
gate-required: /starlight-board (pre-pass before commit/tag of agent spec change)
---

# Voice Operator activation channel — clap-as-primary

## Substrate touch

`agents/starlight-voice-operator.md` — wake-word section + Command Phrase Library + activation invariants.

## Proposal

Update the activation language in the Voice Operator agent definition to reflect that **two-clap gesture is the primary activation channel**, with verbal wake-word *"Starlight"* preserved as fallback.

### Specific edits proposed

1. **"Wake-word" section** (around line 227 in agent spec):
   - Rename to "Activation channels"
   - Document multi-channel design: 2-clap (primary) + verbal "Starlight" (fallback) + global hotkey `Ctrl+Alt+Space` (fallback)
   - State that 2-clap pattern detector runs continuously alongside Porcupine on the same mic stream

2. **"Phrase invariants"** (around line 229):
   - Soften invariant 1 from "Every phrase begins with *Starlight, *" to "Phrases MAY omit the *Starlight, * prefix when activation gesture (clap or hotkey) is used in lieu of verbal wake-word."
   - Keep invariant 2 (classifier handles natural variation) unchanged
   - Keep invariant 3 (frontends MAY add brand-specific phrases) unchanged

3. **"Command Phrase Library"** (Phrase column, lines 205-225):
   - Add column "Verbal prefix required: yes/no" — defaults to no for all phrases when activation gesture is used
   - Document that table examples retain *"Starlight, "* for clarity but the prefix is optional

4. **"Activation Triggers"** section (around line 35):
   - Add bullet: "Clap-pattern activation gesture (2 claps within ~800ms) detected by sibling channel to Porcupine wake-word"

## Justification

Frank's stated preference 2026-05-06 — verbal wake-word adds friction, breaks flow, accent-sensitive, feels un-cool when said often. Saved as feedback memory `feedback_clap_over_wake_word.md`.

**Why substrate-tier:** the agent definition is the canonical contract. Sovereign-spawn instances inherit it. Activation-channel plurality is a contract change, not an implementation detail — it changes what frontends register and what the protocol guarantees.

**Why ship implementation first:** the operational `clap_detector.py` + `MultiChannelWake` code (Phase A1, shipped this session) doesn't change agent semantics. It adds a sibling channel that yields when fired. The agent spec edit is documentation of the new contract — properly governed as substrate.

## Pressure-test vectors (anticipated board concerns)

**Sovereignty:** does multi-channel activation introduce any third-party dependency or sovereignty leak?
- No. Picovoice Porcupine remains the verbal channel (already in use). Clap detector is pure local signal processing (numpy on raw PCM frames). No new external service.

**Sovereign-spawn implication:** does this change what other sovereigns inherit?
- Yes — inheriting agents now expect multi-channel activation as an option. Implementation plurality means a sovereign-spawn instance can choose: clap-only, voice-only, or both. The spec must preserve this optionality, not mandate clap.

**Attestation:** does anything need "Built on SIP" attestation update?
- No. Activation is pre-cognition; attestation rules apply to generated artifacts.

**Backward compat:** does removing required *"Starlight, "* prefix break existing phrase library?
- Existing `WakeWord` Porcupine class preserved unchanged. Existing run.ps1 / install.ps1 still wire it. Phrase examples retain prefix in documentation. The change is *permission*, not *replacement*.

**Cognition coupling:** does the activation channel inform the classifier?
- Channel attribution is logged ("fired by porcupine" / "fired by clap" / "porcupine+clap") for stats/dogfood analysis. Not exposed to classifier — utterance text alone classifies. Decoupled by design.

## Falsifiable success criteria

- Spec edits land at exactly the four sections named above; no scope creep into other sections.
- Sovereign-spawn instance docs (under `verticals/`, integrations) need no changes — they reference the agent def by URL, not copy.
- One-week dogfood: clap activation fires intentionally ≥ 30 times, false-positive rate <2%. If false-positive >2%, escalate to v2.1 with YAMNet layer.
- Frank works a full 8h day routed through cockpit without saying "Starlight" once (per project memory v2 plan success criteria).

## Recommended verdict shape

PROCEED on edits as specified. REVISE if board names a sovereignty leak path I missed, or if the channel-attribution logging introduces a privacy concern (audit-log shape).

## References

- `feedback_clap_over_wake_word.md` (memory) — Frank's preference statement
- `project_voice_operator_v2_plan.md` (memory) — 9-phase v2 roadmap
- `project_v77_voice_operator_a1_b_c_shipped.md` (memory) — operational ship 2026-05-06
- `agents/starlight-voice-operator.md` — substrate agent definition (edit target)
- `private/voice-operator/service/clap_detector.py` — operational implementation (already on disk)
- `private/voice-operator/service/wake_word.py` — `MultiChannelWake` (already on disk)
- `feedback_board_before_tag.md` (memory) — board-before-tag invariant for substrate edits

---

**Built on SIP** · Voice Operator activation channel pre-pass · 2026-05-06
