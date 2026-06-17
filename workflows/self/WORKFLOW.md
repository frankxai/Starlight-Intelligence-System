# Self IS Workflow

> Founder Performance Intelligence — excavate genius, optimize energy, and operate at sovereign capacity.

Built on SIP — Starlight Intelligence Protocol v1.1.1

---

## Trigger Conditions

- "Audit my energy / focus / performance this week"
- "Help me find my genius / discover what I'm built for"
- "I'm feeling off — help me recalibrate"
- "Run my morning / evening protocol"
- "What should I prioritize today given who I am?"

## Input Schema

```yaml
inputs:
  - name: time_window
    type: string
    required: false
    description: "Time range for audit (today|this-week|this-month). Defaults to today."
  - name: context_dump
    type: string
    required: false
    description: "Free-text brain dump from the founder — raw, unfiltered state."
  - name: mode
    type: string
    required: true
    description: "One of: discover-genius | daily-protocol | energy-audit | recalibrate | genius-excavation"
  - name: existing_profile
    type: object
    required: false
    description: "Prior Genius Profile if already excavated — avoids re-excavation."
```

## Workflow Steps

### Step 1 — Profile Load
**Agent:** starlight-sage  
**Skill:** memory/vault-management  
**Action:** Load the founder's Genius Profile from strategic-vault, prior energy scores from operational-vault, and any wisdom atoms tagged `self-is` from wisdom-vault. If no profile exists, flag for excavation mode.  
**Output:** `profile-snapshot.json` — current state of founder intelligence.

### Step 2 — Excavation or Calibration
**Agent:** starlight-genius (Excavation Tier)  
**Skill:** intelligence/strategic-reasoning  
**Action:** If no Genius Profile: run `/discover-genius` protocol — ingest scattered corpus (notes, transcripts, vault atoms) through the 5 SIS Extractor agents. If profile exists: compare current context dump against profile to detect drift, suppression, or flow state.  
**Output:** `genius-profile.md` or `drift-report.md`

### Step 3 — Energy Architecture
**Agent:** starlight-navigator  
**Skill:** intelligence/pattern-recognition  
**Action:** Map energy state across four channels (physical, cognitive, creative, relational) against the founder's known peak-performance windows. Cross-reference with body substrate data if available.  
**Output:** `energy-map.json` — current vs. optimal state per channel.

### Step 4 — Priority Intelligence
**Agent:** starlight-prime  
**Skill:** intelligence/strategic-reasoning  
**Action:** Synthesize genius profile + energy map + open commitments to produce a ranked Priority Stack for the operating window. Apply the "does this help someone build?" test against every item.  
**Output:** `priority-stack.md` — ordered list with rationale anchored to genius profile.

### Step 5 — Protocol Generation
**Agent:** starlight-weaver  
**Skill:** intelligence/systems-thinking  
**Action:** Translate priority stack into a concrete daily/weekly protocol: time blocks, energy anchors, recalibration triggers, creative windows. Output matches Frank DNA voice — direct, technical, warm.  
**Output:** `operating-protocol.md`

### Step 6 — Vault Write + Attestation
**Agent:** starlight-orchestrator  
**Skill:** memory/context-preservation  
**Action:** Write session findings to strategic-vault (genius insights), operational-vault (energy scores, protocol), and wisdom-vault (any distilled principles). Append to `~/.reality/evidence.md` if a shipped win was identified. Attach SIP attestation.  
**Output:** Vault atoms x3, evidence.md append (conditional).

## Hermes Swarm Config

Which Hermes agent profiles handle tasks in this workflow:
- Primary: hermes-self-specialist (405B — deep genius excavation, corpus synthesis, profile building)
- Support: hermes-self-executor (70B — fast daily protocol generation, energy scoring, vault writes)

## Output Artifacts

1. `genius-profile.md` — Excavated founder identity document (saved to strategic-vault)
2. `energy-map.json` — Four-channel energy state with scores and recommendations
3. `priority-stack.md` — Ranked priorities anchored to genius profile for the operating window
4. `operating-protocol.md` — Concrete time-block protocol for the day/week
5. `drift-report.md` — Delta between current state and peak-performance baseline (when recalibrating)

## Vault Routing

Which vaults get written:
- **Strategic:** Genius Profile updates, identity anchors, major life decisions tied to self-understanding
- **Technical:** Energy scoring methodology, protocol templates, excavation patterns
- **Operational:** Current energy scores, active protocols, today's priority stack, daily metrics
- **Wisdom:** Distilled principles about peak performance, recurring patterns, lessons from off days

## Commands

| Command | Triggers | Description |
|---------|----------|-------------|
| `/discover-genius` | "find my genius", "what am I built for", "excavate my strengths" | Full genius excavation from scattered corpus — produces Genius Profile + Freedom Path |
| `/self-audit` | "audit my week", "how am I performing", "energy check" | Four-channel energy audit against genius baseline — produces energy map + recalibration plan |
| `/daily-protocol` | "morning protocol", "what should I do today", "set my day" | Generates concrete operating protocol anchored to genius profile and current energy state |
| `/recalibrate` | "I'm off", "feeling scattered", "need to reset" | Fast recalibration — identifies drift, reanchors to genius profile, outputs immediate recovery steps |

---
*Built on SIP — Starlight Intelligence Protocol v1.1.1*  
*Substrate: starlightintelligence.org/protocol v1.1.1*
