# Voice & Video IS Workflow

> Narrative Media Intelligence — produce high-trust audio and video content that compounds reach, establishes authority, and converts attention to relationship.

Built on SIP — Starlight Intelligence Protocol v1.1.1

---

## Trigger Conditions

- "Script / produce this video or podcast episode"
- "Edit / improve this transcript or recording"
- "Design my podcast / YouTube / video strategy"
- "Help me show up better on camera / audio"
- "Run a video production workflow for [topic]"

## Input Schema

```yaml
inputs:
  - name: content_brief
    type: string
    required: false
    description: "Topic, thesis, or raw transcript for the video/audio piece."
  - name: format
    type: string
    required: false
    description: "Output format (youtube-long|youtube-short|podcast|voice-note|live-stream). Defaults to youtube-long."
  - name: mode
    type: string
    required: true
    description: "One of: script | edit-transcript | strategy | presence-coaching | production-workflow | repurpose"
  - name: existing_transcript
    type: string
    required: false
    description: "Raw transcript from recording for editing or repurposing."
  - name: tone_target
    type: string
    required: false
    description: "Target emotional register (authoritative|conversational|teaching|story-driven). Defaults to conversational."
```

## Workflow Steps

### Step 1 — Narrative Context Load
**Agent:** starlight-sage  
**Skill:** memory/vault-management  
**Action:** Load voice & video patterns from technical-vault — best-performing episode structures, hook formulas, thumbnail copy patterns, and presence coaching notes. Pull brand voice definition from Creator IS creative-vault. Load active show formats and publishing cadence from operational-vault.  
**Output:** `vv-context.json` — format templates, performance patterns, brand voice, cadence state.

### Step 2 — Narrative Architecture
**Agent:** starlight-weaver  
**Skill:** intelligence/strategic-reasoning  
**Action:** Design the narrative arc for the piece. Apply the three-act story structure adapted for media: Open (hook + promise) → Deliver (core value in rising sequence) → Close (synthesis + call to relationship). Define the transformation the viewer/listener experiences. Score hook strength.  
**Output:** `narrative-architecture.md` — arc design, hook, promise, delivery sequence, close.

### Step 3 — Script Production
**Agent:** starlight-weaver  
**Skill:** intelligence/pattern-recognition  
**Action:** Write the full script or outline. For YouTube: opening hook (15s), pattern interrupt (45s), value ladder (main body), synthesis, CTA. For podcast: cold open, theme music note, interview arc or monologue structure. Apply Frank DNA voice — direct, technical, warm, playful. No filler, no hedging.  
**Output:** `script-draft.md` — full production script with timing notes and delivery cues.

### Step 4 — Transcript Edit / Repurpose
**Agent:** starlight-prime  
**Skill:** intelligence/systems-thinking  
**Action:** If edit-transcript mode: clean filler words, restructure for clarity, strengthen transitions, punch up key moments. If repurpose mode: extract: 3 tweet threads, 1 LinkedIn post, 1 newsletter section, 3 short-form clips (with in/out timestamps) from the transcript.  
**Output:** `edited-transcript.md` or `repurpose-bundle.md` — edited/repurposed content set.

### Step 5 — Production Brief
**Agent:** starlight-architect  
**Skill:** orchestration/workflow-design  
**Action:** Produce the technical production brief — camera setup, lighting notes, b-roll list, graphics/title card spec, thumbnail brief (3 concepts), chapter markers, SEO metadata. Route to appropriate production tools (Descript for editing, HeyGen for AI video where applicable).  
**Output:** `production-brief.md` — full technical brief with SEO metadata and thumbnail concepts.

### Step 6 — Vault Write + Distribution
**Agent:** starlight-orchestrator  
**Skill:** memory/ecosystem-sync  
**Action:** Write script to creative-vault, production patterns to technical-vault, episode state to operational-vault. Emit transmission to Creator IS for calendar sync and Brand IS for positioning alignment. Attach SIP attestation.  
**Output:** Vault atoms x3, Creator IS and Brand IS transmissions.

## Hermes Swarm Config

Which Hermes agent profiles handle tasks in this workflow:
- Primary: hermes-vv-specialist (405B — narrative architecture, script production, presence coaching, strategy design)
- Support: hermes-vv-executor (70B — transcript editing, repurposing bundles, production briefs, vault writes)

## Output Artifacts

1. `vv-context.json` — Format templates, performance patterns, brand voice, cadence state
2. `narrative-architecture.md` — Arc design with hook, promise, delivery sequence, and close
3. `script-draft.md` — Full production script with timing notes and delivery cues
4. `repurpose-bundle.md` — Atomic repurposing set (threads, posts, newsletter, clip timestamps)
5. `production-brief.md` — Technical brief with b-roll list, thumbnail concepts, SEO metadata

## Vault Routing

Which vaults get written:
- **Creative:** Scripts, narrative architectures, successful hooks, story frameworks
- **Strategic:** Show strategy decisions, format pivots, channel positioning moves
- **Technical:** Production templates, episode structures, SEO patterns, thumbnail formulas
- **Operational:** Episode production queue, publish schedule, recording notes, distribution tasks

## Commands

| Command | Triggers | Description |
|---------|----------|-------------|
| `/script` | "script this video", "write a podcast episode", "produce this piece" | End-to-end script production — narrative architecture, full script, production brief |
| `/edit-transcript` | "edit my transcript", "clean this recording", "remove filler words" | Transcript editing — filler removal, restructuring, clarity improvements, punch-up |
| `/vv-repurpose` | "repurpose this", "atomic content from transcript", "clip this" | Full repurposing bundle — threads, posts, newsletter section, clip timestamps |
| `/vv-strategy` | "video strategy", "YouTube strategy", "podcast design" | Channel and show strategy — format design, cadence, topic pillars, growth architecture |

---
*Built on SIP — Starlight Intelligence Protocol v1.1.1*  
*Substrate: starlightintelligence.org/protocol v1.1.1*
