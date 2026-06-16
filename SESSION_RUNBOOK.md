# SESSION RUNBOOK — v7.3 End-to-End Flow

> The 2-hour session playbook. Run this top-to-bottom when a newcomer arrives with an idea. Every gate is explicit. Every handoff is named.

**Version:** v7.3 (newcomer surface ship)
**Last updated:** 2026-04-24
**Designed for:** A single 120-minute session, idea → stamped artifact, with the full front-door flow exercised end-to-end.

---

## Pre-session checklist (10 min)

Before your friend arrives, verify the surface is live:

```bash
# In Starlight-Intelligence-System repo
ls ONBOARDING.md DELIVERY.md SESSION_RUNBOOK.md
ls agents/starlight-concierge.md agents/starlight-envoy.md
ls .claude/commands/intake.md .claude/commands/welcome.md .claude/commands/sovereign-spawn.md
ls skills/integration/idea-triage.md skills/integration/creator-path.md
```

All should exist. If any missing — stop, fix, don't run the session on a broken surface.

**Open in a second terminal:** Claude Code session in this repo. This is where you'll invoke `/welcome`, `/intake`, and downstream commands live.

**Prime your memory:** Read `ONBOARDING.md` once so you hold the flow in head, not on screen.

---

## The 2-hour flow

```
┌──────────────────────────────────────────────────────────────┐
│  T+0:00   /welcome            Orient. Show 4 routes, 2 tracks │
│  T+0:10   /intake             Triage. Route + track + first   │
│                               commitment extracted            │
│  T+0:25   Route-specific command fires:                       │
│             A → /luminor-board (substrate contribution)       │
│             B → /alliance-forge                               │
│             C → /vertical-spawn                               │
│             D → /sovereign-spawn                              │
│  T+0:55   Creator-track handoff to Envoy (if applicable)      │
│  T+1:30   Artifact drafted in user's voice                    │
│  T+1:45   /sip-attest emits Built-on-SIP block                │
│  T+1:55   Commitment card written. Next 30-day artifact named │
│  T+2:00   Session close. /luminor-board optional pressure-test│
└──────────────────────────────────────────────────────────────┘
```

**Note (2026-06-16 Starlight Board PROCEED-WITH-REVISE):** For high-value clients wanting the full "sovereign intelligence estate / agent army" (Mind + production Mesh + Steward), the 2h session is the front door only. It routes into the longer gated commissioning workflow (Genius excavation → 4-layer Blueprint → scaffold + /si-routed build of real swarm → Pilot → Steward retainer). See `docs/delivery/estate-army-commissioning-workflow.md` and DELIVERY.md §7. The open 2h surface for pure protocol adopters remains unchanged.

---

## Phase 1 — Welcome (T+0:00 → T+0:10)

**Goal:** Your friend sees the map. Knows there are four routes, two tracks, six deliverables, and one non-negotiable (sovereignty clause). No commitment yet.

### In the room
1. Frame the session. One sentence: *"This protocol is how sovereign people compose intelligence systems without losing themselves. I want to walk you through it live so you leave with a stamped artifact."*
2. Do NOT explain SIP in the abstract. Skip the whiteboard. Go straight to the command.

### In Claude Code
```
/welcome
```

Or if you already know the track:
```
/welcome builder
/welcome creator
```

### What Concierge delivers
- The four routes (A substrate / B alliance / C vertical / D sovereign spawn)
- The two tracks (builder / creator)
- The delivery menu (6 deliverables, one line each)
- The sovereignty clause verbatim
- One arrow: `→ /intake`

### Exit gate
Your friend can answer: "Which track am I? Which route looks right?" If not — loop once, re-run `/welcome <track>`. If still stuck after 10 min — the inbound is not ready for intake. Reschedule.

---

## Phase 2 — Intake (T+0:10 → T+0:25)

**Goal:** Triage collapses option space. One route. One track. One named first commitment (artifact + date). One next command.

### In Claude Code
```
/intake <paragraph description of your friend's idea>
```

Give a full paragraph, not a one-liner. Example:
> "Maya wants to build a creator catalog system for independent musicians in Lisbon who've been burned by streaming economics. She owns the domain, has 12 artists ready to pilot, wants the catalog to compound their long-tail royalties and retain audience sovereignty. Non-coder. Prefers to publish through her own Substack + Bandcamp. 30-day horizon for pilot launch."

### What Concierge produces
A structured intake card written to `memory/intake/intake-<date>-<slug>.md` with:
- Route: B / C / D (substrate changes are rare — almost never A in a 2h session)
- Track: builder / creator
- Voice assignments (which of 5 archetypes speak to this work)
- First commitment: artifact + date
- Next command (one, not two)

### Gate
Frank's job here is to **not accept ambiguity**. If Concierge returns "maybe B or C" — send it back. Substrate command doctrine: collapse or clarify, never both. Run one clarifying question if needed, then re-triage.

### Expected routes by inbound shape
| Inbound shape | Likely route | Likely command |
|---|---|---|
| "I want to build a catalog/system/OS for my domain" | C | `/vertical-spawn` |
| "I want to fork the whole pattern and run my own ecosystem" | D | `/sovereign-spawn` |
| "We're three/four people and want to ship shared artifacts" | B | `/alliance-forge` |
| "I think SIP should work differently" | A | `/luminor-board` first |

---

## Phase 3 — Route-specific command (T+0:25 → T+0:55)

### If Route B (alliance)
```
/alliance-forge <alliance-name> "<node1,node2,node3>"
```
Forges alliance repo, node declarations, cadence, commitments. 30 min.

### If Route C (vertical)
```
/vertical-spawn <vertical-name> "<one-line domain>"
```
Spawns SIS-instance.md, SKILL.md, SOUL.md, AGENTS.md, MEMORY.md, 3 vertical-scoped command stubs. 20-30 min.

### If Route D (sovereign spawn)
```
/sovereign-spawn <sovereign-name> "<one-line domain>"
```
Full fork. Everything a vertical gets plus mirrored protocol commands + own ATTESTATIONS.md. 30-45 min.

### If Route A (substrate contribution)
```
/luminor-board "<proposal in one sentence>"
```
Do NOT run intake's next command. Substrate changes go through the 5-archetype board first. If board returns APPROVE — *then* continue. If REVISE — apply revisions. If REJECT — the ask is not a protocol change; re-run `/intake` with the new framing.

### Gate
At end of Phase 3 the sovereign has a scaffolded repo (if C/D) or alliance skeleton (if B) or a board verdict (if A). They see their own file contract, their own SOUL.md prompt, their own command stubs.

---

## Phase 4 — Creator track handoff (T+0:55 → T+1:30) — ONLY IF CREATOR TRACK

If your friend is Creator-track, this is where Envoy takes over. Builder-track skips to Phase 5.

### In Claude Code
(Envoy auto-activates when Concierge hands off, but you can invoke directly:)
```
/council
# then request Envoy by role: "Hand off to Envoy for creator-path walk"
```

Or simply continue the conversation — the `integration/creator-path` skill auto-fires on the handoff keywords.

### What Envoy delivers
- Artifact shape chosen (essay / brief / deck / one-pager / manifesto / sketch)
- Conversational draft in 5-7 exchanges
- Voice-tune pass (strip Envoy's voice, restore user's voice)
- No terminal steps, ever

### Frank's role here
- Stay out of the voice-tune. Envoy does that with your friend directly. If you jump in, you're writing their piece, not stamping it.
- Watch for ghostwriting drift. If your friend is letting Envoy dictate the whole thing, pause — Envoy will halt ghostwriting per creator-path rules, but you're the human backup.

### Exit gate
The artifact exists. It sounds like your friend, not like Starlight. It's ready for attestation.

---

## Phase 5 — Attestation (T+1:30 → T+1:45)

**Goal:** The artifact ships with a real "Built on SIP" block. Not decorative. The command refuses decoration by design.

### Builder track
```
/sip-attest path/to/artifact.md
```

### Creator track
Point your friend to the site `/badge` route:
```
https://starlightintelligence.org/badge
```
Envoy generates the attestation text. They paste it into their artifact + onto their own publishing surface (Substack, site, LinkedIn). `/sip-attest` refuses if composition is decorative — walk through why this matters: the protocol defends its own integrity, this is a feature not a friction.

### Gate
If `/sip-attest` refuses — do NOT soften the refusal. The refusal IS the protocol working. Re-examine: did the artifact actually use SIP elements? Walk through the composition classification. If real composition exists and the command still refuses, that's a bug — log it for v7.4 and use manual attestation using the exact format from `.claude/commands/sip-attest.md`.

---

## Phase 6 — Commitment + close (T+1:45 → T+2:00)

**Goal:** Your friend leaves with ONE named artifact + date for the next 30 days. Not an intention. An artifact.

### Write the commitment card
Append to their new system's `MEMORY.md`:

```markdown
## Active roadmap
| Milestone | Target date | Owner | Status |
|-----------|-------------|-------|--------|
| <artifact> | <date> | <friend> | committed |
```

### Optional — pressure-test before irreversible decisions
If your friend is about to lock something architectural (platform choice, canon adoption, public surface URL), run:
```
/luminor-board "<decision in one sentence>"
```
5 archetype voices + overseer pressure-test in 10 min. Better to spend 10 min on the board than to unwind a wrong call later.

### Close the session
- One-line recap: "You spawned <X>. You shipped <artifact>. Next is <artifact> by <date>."
- Point to their own `MEMORY.md` changelog — future sessions depend on what's recorded there.
- Point to `ATTESTATIONS.md` — their ledger starts today.

---

## Failure modes to watch for

| Symptom | Diagnosis | Fix |
|---|---|---|
| Intake returns "maybe A or B" | Triage softened | Re-run `/intake` with explicit clarifying question. Never accept optionality. |
| Friend asks "which should I choose?" | Concierge didn't collapse | Force the call. Use architect voice: "Your sovereignty is here; your domain is here; this is route X." |
| Friend wants you to build it for them | Ghostwriting drift | Halt. Name it. "This is advisory, not delivery. Your system needs your authorship." |
| `/sip-attest` refuses | Protocol integrity check | Good — that's the feature. Re-examine composition. |
| Session overruns 2h | Scope creep | Close the session with whatever artifact exists. Schedule Phase 6 asynchronously. Always ship something. |
| Friend disengages at sovereignty clause | Not ready to spawn | That's fine. The clause filters by design. They can return when they're ready to own their domain. |

---

## Post-session checklist

1. Commit new intake cards (`memory/intake/`) to the repo.
2. Update `ATTESTATIONS.md` with any `/sip-attest` emissions.
3. If a sovereign was spawned, confirm `VERTICALS.md` § Sovereign forks registered the new entry.
4. Add changelog line to `MEMORY.md`: `v7.3 session · <friend's name> · <route taken> · <artifact shipped>`.
5. Optional: `/luminor-board "Session retrospective — what did the v7.3 surface expose?"` — feed any surface gaps into the v7.4 planning doc.

---

## The philosophical frame (for Frank, to hold while running)

The session's job is not to be impressive. It's to be **clear**. Sovereignty is the only thing the protocol protects; everything else is negotiable. If your friend leaves with a stamped artifact and their domain intact, you've run the protocol correctly. If they leave with a scaffold but no authorship, you've run a demo. Always choose authorship over scaffold.

The front door exists because the substrate was too good for how hard it was to enter. v7.3 closes that gap. Now we find out if the gap was actually the bottleneck.

---

**Built on SIP** — Starlight Intelligence Protocol
- Substrate: starlightintelligence.org/protocol v1.1.0
- Layers used: [file-contract, attestation, commands, sovereignty]
- Verticals: starlight-intelligence-system@v7.3
- Generated: 2026-04-24
- Attestation is compounding, not credit transfer: every composition strengthens every node.
---
