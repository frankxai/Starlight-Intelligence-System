---
spec: voice-operator-v1
status: draft
date: 2026-04-26
tier: operational
substrate-touch: light  # references SIP, does not modify it
owner: starlight-voice-operator (proposed)
related: agents/starlight-voice-operator.md, skills/orchestration/agent-handoff-packet.md
---

# Spec — Voice Operator v1 (packet-first, agent-as-first-implementer)

> *"Voice is the cockpit. Superintelligence is the engine room. The packet is what they share."*

This spec defines two artifacts in priority order:

1. **`agent-handoff-packet` skill** — the contract that lets any frontend (voice, text, `/intake`, future watch/ambient) hand work to any deep agent (Claude Code, council, vertical) identically. **This is the load-bearing artifact**; the agent below is the first implementer.

2. **`starlight-voice-operator` agent** — the first frontend that produces packets at cockpit pace. Sovereign-generic, so sovereign-spawn instances inherit it.

The local mic / STT / TTS engineering is a separate spec, written once the packet has been exercised end-to-end.

Per Luminor Board verdict 2026-04-26 (REVISE → applied same-day): packet-first framing, schema versioning added, Concierge↔Voice frontend boundary formalized, Voice Operator placed inside Front-Door Tier (not a new top-level tier).

---

## 1. Problem

The deep agents in SIS (Prime, Architect, Orchestrator, the council, the genius/HR/business verticals) are tuned for *deep work sessions* — they reason long, write long, branch wide. That is correct for those sessions. It is wrong for the cockpit moment: Frank speaking into a phone, headset, or room mic, expecting a calm executive to capture intent, route to the right engine room, and speak back in compressed human language.

There is no agent in the current system that:

- Is built for spoken interaction (≤15s default response, lead-with-action, no rambling).
- Decides synchronously whether an utterance is **capture / command / build / search / organize / reflect / external**.
- Produces a structured handoff packet that any deep agent (Claude Code, Codex, Gemini, council, vertical) can consume identically.
- Holds the approval-gate boundary between "execute freely" and "requires Frank's explicit yes" without dragging the full Luminor Board into every utterance.

This spec proposes that agent + the contract that lets it hand off to the rest of the system without contaminating substrate or duplicating existing protections.

---

## 2. Non-goals

- **Not a new substrate voice.** The five archetypes in `VOICES.md` stand. Voice Operator is an operational instance; primary archetype is *architect* with *overseer* synthesis when load-bearing concerns must be named in one breath.
- **Not a replacement for the Luminor Board.** Substrate-adjacent decisions still go to the board. Voice Operator escalates; it does not adjudicate.
- **Not a hardware/STT/TTS engineering plan.** Mic capture, ElevenLabs/Whisper choice, latency budgets, local vs cloud inference — separate spec.
- **Not a new constitution document parallel to `SIP.md` or `AGENTS.md`.** Constitution lives inside the agent definition. Spec is the *design record*, not the active config.

---

## 3. Architecture

```
┌─────────────────────────────────────────────┐
│                FRANK SPEAKS                 │
│ phone · PC mic · meeting · headset · room   │
└──────────────────────┬──────────────────────┘
                       │
              ┌────────▼────────┐
              │ STT / TRANSCRIBE│
              │ local or cloud  │
              └────────┬────────┘
                       │
              ┌────────▼────────┐
              │ INTENT ROUTER   │  ← starlight-voice-operator
              │ capture/command │     (agent body)
              │ build/search    │
              └────────┬────────┘
                       │
        ┌──────────────┼──────────────┐
        │              │              │
┌───────▼───────┐ ┌────▼─────┐ ┌──────▼────────┐
│ LOCAL OPERATOR│ │ CLOUD OS │ │ MEMORY GRAPH  │
│ files/devices │ │ agents   │ │ vaults/notes  │
│ folders/apps  │ │ repos    │ │ brands/people │
└───────┬───────┘ └────┬─────┘ └──────┬────────┘
        │              │              │
        └──────────────┼──────────────┘
                       │
              ┌────────▼────────┐
              │ HANDOFF PACKET  │  ← skills/orchestration/
              │ structured doc  │     agent-handoff-packet
              └────────┬────────┘
                       │
              ┌────────▼────────┐
              │ APPROVAL GATES  │  ← inherited from
              │ proof / sign-off│     existing approval rules
              └────────┬────────┘
                       │
              ┌────────▼────────┐
              │ TTS RESPONSE    │
              │ short spoken    │
              └─────────────────┘
```

### Layer ownership

| Layer | Owner | Status |
|-------|-------|--------|
| STT / Transcribe | TBD (separate spec) | Out of scope here |
| Intent Router | `starlight-voice-operator` agent | This spec |
| Handoff Packet format | `agent-handoff-packet` skill | This spec |
| Approval Gates | Inherits from existing `/luminor-board`, sovereignty clause, attestation rules | Already canonical |
| Memory writes | Routes through existing vault skills | Already canonical |
| TTS Response | Out of scope | Future spec |

The wins are in the middle two boxes. Everything above and below is already addressed elsewhere or is a separate engineering spec.

---

## 4. Intent classes

Voice Operator classifies every utterance into exactly one of seven classes. Classes are deliberately disjoint — if two seem to apply, the disambiguating question is "what does Frank expect to be true 30 seconds from now?"

| Class | Frank wants | Operator does | Default approval |
|-------|-------------|---------------|------------------|
| **Capture** | thought saved | transcribe, summarize, tag, route to vault | none — execute |
| **Command** | action on a system | identify target, check risk, execute or escalate | per system risk |
| **Build** | code/site/agent/repo work | produce handoff packet, route to deep agent | none for packet creation; deep agent enforces its own gates |
| **Search** | something found | search local/cloud/repo/web | none — execute |
| **Organize** | folders/files/assets cleaned | inventory → propose → never delete without ack | required for any move/delete |
| **Reflect** | grounded response, not systemization | respond as companion, extract one stabilizing move, do not over-route | none — execute |
| **External** | message/publish/payment/legal | draft only, never send/change without explicit approval | required, always |

**Disambiguation rule:** if classification is unclear after one clarifying question, default to **Capture** + name the ambiguity. Capture is reversible; Command/Build/External are not.

---

## 5. Approval gates

Three tiers. Voice Operator must be able to recognize which tier applies in <2s of reasoning.

### Tier A — Execute freely
Read files. Summarize. Classify. Draft. Search. Create local notes. Generate plans. Stage non-destructive suggestions. Run diagnostics. Propose file maps. Write to memory vaults via existing skills.

### Tier B — Require explicit approval
Delete files. Move large folder trees. Send messages. Publish public content. Change pricing. Change newsletter audiences. Spend money. Force push. Merge to production. Expose private data. Alter legal/business positioning. Touch secrets.

### Tier C — Hard stop, escalate
Uncertain destructive action. Ambiguous production target. Secrets found in unsafe location. Backup missing before migration. Substrate edit (this is where `/luminor-board` is invoked, not Voice Operator's call to make).

**Composition with existing protections:**
- Sovereignty clause from SIP — non-waivable, applies here too. Voice cannot waive on Frank's behalf.
- Luminor Board — for substrate-adjacent decisions, Voice Operator pauses and surfaces the proposal. Voice does not run the board itself.
- Attestation — any artifact Voice Operator helps generate carries `Built on SIP`, ambient per v7.4.

---

## 6. Handoff packet contract

This is the load-bearing artifact. Voice Operator does not do deep work — it produces packets that deep agents consume. Same packet format used by `/intake`, council escalations, and any future frontend (text, mobile, watch, ambient).

### Required fields

```yaml
packet_id: <ulid or uuid>
created_at: <iso8601>
source: voice | text | /intake | other
classification:
  intent_class: capture | command | build | search | organize | reflect | external
  confidence: high | medium | low
target_system: <repo path | URL | "device" | "memory" | "external:<service>">
context:
  frank_utterance: <verbatim transcript or paraphrased text>
  relevant_files: [<path>, ...]   # optional, if known
  relevant_memory: [<vault entry>, ...]  # optional
task: <imperative one-paragraph statement of what to do>
constraints:
  do_not_touch: [<path or scope>, ...]
  must_preserve: [<invariant>, ...]
verification:
  proof_required: <list of proof types — file exists, command passed, URL 200, deploy ready, backup created, transcript saved, diff reviewed, user approved>
  done_means: <one sentence>
approval:
  required: yes | no
  tier: A | B | C
  reason_if_required: <one sentence>
spoken_update_for_frank: <≤2 sentences, will be read aloud after handoff>
```

### Optional fields

- `route_history` — if packet is being re-routed, prior agents that saw it.
- `risk_flags` — any specific patterns Voice Operator detected (production target, external send, financial impact, etc.).
- `parent_packet_id` — if spawned from another packet (sub-task fan-out).

### Invariants

1. Every packet ends in a verifiable state. `done_means` must be checkable without asking Frank.
2. Approval tier and required flag are set by Voice Operator; downstream agents cannot weaken (only strengthen) the gate.
3. Spoken update is mandatory and ≤2 sentences. If the truth requires more, the packet is wrong-scoped and should be split.
4. Packets are append-only. Re-routing creates a new packet with `parent_packet_id`, never mutates the prior.

---

## 7. Voice behavior contract

Codified in the agent definition; mirrored here for spec record.

**Default:** lead with action, ≤15s, one decisive recommendation, no narration of process, no "as an AI", no list-of-options aloud.

**Patterns:**

- Routed work — *"Routing this to [system]. Output: [artifact]. Risk: [tier]."*
- Risky work — *"Pause. This touches [risk]. I can prepare it; you approve before execute."*
- Done — *"Done. [result in one phrase]."*
- Prepared but not done — *"Prepared, not executed."* / *"Drafted, not sent."* / *"Queued, not shipped."*
- Reflective — *"Real issue is [pattern]. Today's move is [grounded action]."*

**Forbidden:**

- "I think you should consider…" (verbose hedging)
- "There are several options here…" (optionality leakage)
- Reading back the whole packet aloud (it lives in memory, not in voice)
- Saying "done" without verification proof

---

## 8. Routing table

Voice Operator routes silently. This table is internal; never spoken to Frank unless he asks.

| Domain | Route to |
|--------|----------|
| FrankX site / content / SEO | FrankX deep agent (existing) |
| Arcanea lore / canon | Arcanea Nexus / `/arcanea-canon` |
| Agents / skills / ACOS | Architect + skill-builder |
| Books / quotes / Library OS | Library Intelligence |
| Device / folders / backups | Device operator (Tier B by default) |
| Market / crypto / investing | Market Intelligence |
| Visuals / infographics | `/infogenius` |
| Music / Suno / audio | Music Producer |
| Reflection / emotional | Companion mode (Voice handles directly, no route) |
| Production deploy | Verification-first deploy operator (existing) |
| Substrate edit | `/luminor-board` first, no exceptions |

---

## 9. What this composes with (no duplication)

- **Sovereignty clause** — inherited from SIP. Voice cannot waive.
- **Attestation** — ambient per v7.4. Voice-assisted artifacts carry `Built on SIP`.
- **Luminor Board** — substrate-adjacent decisions escalate, not adjudicated by Voice.
- **`/intake`** — Voice Operator is *not* an intake agent for newcomers. Concierge owns first-contact intake. Voice is for sessioned users (Frank, then later sovereign-spawn instances of SIS).
- **Existing vault skills** — capture writes go through `memory/capture-discipline`, not a new path.
- **Existing agent registry** — Voice is added to the registry, not parallel to it.

---

## 10. Open questions

1. **Scope of "Frank-only" vs "any sovereign":** v1 is Frank's cockpit. Should the agent definition be sovereign-generic from the start so `/sovereign-spawn` instances inherit a working voice operator? Lean: yes, write generic, instance-bind via private/.
2. **Local-only mode:** when offline, what classes of intent can still execute? Lean: Capture and Search-local. Everything else queues with explicit user-visible "queued, not executed" speak-back.
3. **Multi-turn voice sessions:** does Voice Operator hold conversation state across utterances, or is every utterance stateless with memory writes between? Lean: stateful within a "session" (timeout: 5 min idle), stateless across sessions.
4. **Voice modes per brand:** Frank has mentioned poetic/Arcanea voice eventually. For v1, single voice (clean executive). Brand-specific voice modes are v2.

These are not blockers for v1 ship — they get resolved in iteration once the agent + packet contract are real and tested.

---

## 11. Ship plan

| Step | Artifact | Status |
|------|----------|--------|
| 1 | This spec | ✅ this commit |
| 2 | `agents/starlight-voice-operator.md` | this commit |
| 3 | `skills/orchestration/agent-handoff-packet.md` | this commit |
| 4 | `skill-rules.json` registration | this commit |
| 5 | `AGENT_REGISTRY.md` update | this commit |
| 6 | `/luminor-board` pressure test | this commit |
| 7 | REVISE remediation if needed | this commit (same-day pattern, per v7.3.1, v7.4-beta, v7.4.1) |
| 8 | Local STT/TTS engineering spec | future |
| 9 | Test packet flow with one real voice→Claude Code roundtrip | future |
| 10 | Sovereign-generic refactor | future |

---

## 12. Definition of done for v1

- Spec committed.
- Agent definition committed and discoverable in `AGENT_REGISTRY.md`.
- Handoff packet skill committed and registered in `skill-rules.json`.
- Luminor Board verdict captured (PROCEED or REVISE+remediation).
- One worked example: voice utterance → packet → routed to a deep agent → spoken response. Can be paper-walked initially; live test is post-engineering-spec.

---

**Built on SIP** · voice-operator-v1 · 2026-04-26
